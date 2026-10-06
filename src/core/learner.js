/**
 * The learner model: what this child knows, their XP, streak, stars and answer log.
 * Pure functions on a plain profile object; saving is done by save.js.
 */
import { factsFor } from "./questions.js";
import { MISSIONS, UNITS } from "./content.js";

export const STAGES = ["new", "learning", "known", "strong", "mastered"];
export const TIER_XP = { bronze: 10, silver: 15, gold: 20 };
const MAX_LOG = 3000;

export function blankProfile() {
  return {
    version: 3,
    started: false,
    unlockedUnits: 1,
    completed: {},
    seenTeach: {},
    facts: {},
    xp: 0,
    streak: 0,
    freezes: 0,
    lastPlayDate: null,
    settings: { sound: true, voice: true, reducedMotion: false },
    log: [],
  };
}

export function dateKey(date = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
const dayNumber = (key) => {
  const [y, m, d] = String(key).split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

export const missionsCompleted = (profile) =>
  Object.values(profile.completed).filter((stars) => stars > 0).length;

export const factRecord = (profile, id) =>
  profile.facts[id] || { stage: 0, attempts: 0, firstTry: 0, days: [] };

/** Count facts per stage for a skill (used by the fact map and the path). */
export function skillSummary(profile, skill) {
  const facts = factsFor(skill);
  const counts = [0, 0, 0, 0, 0];
  for (const f of facts) counts[factRecord(profile, f.id).stage]++;
  return { total: facts.length, counts, mastered: counts[4], learned: counts[2] + counts[3] + counts[4] };
}

function touchStreak(profile, today) {
  if (profile.lastPlayDate === today) return false;
  const gap = profile.lastPlayDate ? dayNumber(today) - dayNumber(profile.lastPlayDate) : null;
  if (gap !== null && gap < 0) return false; // clock went backwards
  if (gap === 1) profile.streak += 1;
  else if (gap !== null && gap > 1 && gap - 1 <= profile.freezes) {
    profile.freezes -= gap - 1;
    profile.streak += 1;
  } else profile.streak = 1;
  if (profile.streak % 7 === 0) profile.freezes = Math.min(2, profile.freezes + 1);
  profile.lastPlayDate = today;
  return true;
}

/**
 * Record one finished shop question.
 * outcome: "first" (right first try), "retry" (right after a mistake) or "shown" (answer was shown).
 */
export function recordAnswer(profile, { question, tier, outcome, attempts = 1, ms = 0, hinted = false }, now = new Date()) {
  const today = dateKey(now);
  const rec = { ...factRecord(profile, question.factId) };
  rec.days = [...rec.days];
  rec.attempts += 1;
  if (outcome === "first") {
    rec.firstTry += 1;
    if (!rec.days.includes(today)) rec.days = [...rec.days, today].slice(-5);
    const next = Math.min(4, rec.stage + 1);
    // Mastered needs first-try answers on at least two different days.
    rec.stage = next === 4 && rec.days.length < 2 ? 3 : next;
  } else {
    rec.stage = 1;
  }
  profile.facts[question.factId] = rec;
  const xp = outcome === "first" ? TIER_XP[tier] || 10 : outcome === "retry" ? 5 : 2;
  profile.xp += xp;
  const streakChanged = touchStreak(profile, today);
  profile.log.push({
    t: now.toISOString(),
    fact: question.factId,
    format: question.format,
    tier,
    outcome,
    attempts,
    ms: Math.round(ms),
    hinted,
  });
  if (profile.log.length > MAX_LOG) profile.log.splice(0, profile.log.length - MAX_LOG);
  return { xp, stage: rec.stage, streakChanged };
}

/** Pay out only new best stars, and open the next unit after a boss win. */
export function completeMission(profile, missionId, stars) {
  const before = profile.completed[missionId] || 0;
  const gained = Math.max(0, stars - before);
  if (gained) profile.completed[missionId] = stars;
  profile.xp += gained * 10;
  const mission = MISSIONS.find((m) => m.id === missionId);
  let unitUnlocked = false;
  if (mission?.boss && stars > 0 && profile.unlockedUnits < UNITS.length && mission.unitIndex + 1 >= profile.unlockedUnits) {
    profile.unlockedUnits = Math.max(profile.unlockedUnits, mission.unitIndex + 2);
    unitUnlocked = true;
  }
  return { gained, unitUnlocked };
}

/** A mission is open when its unit is open and the previous mission in the unit is done. */
export function missionOpen(profile, mission) {
  if (mission.unitIndex >= profile.unlockedUnits) return false;
  if (mission.slot === 1) return true;
  const prev = MISSIONS.find((m) => m.unit === mission.unit && m.slot === mission.slot - 1);
  return (profile.completed[prev.id] || 0) > 0;
}

export function nextMission(profile) {
  return MISSIONS.find((m) => missionOpen(profile, m) && !profile.completed[m.id]) ||
    [...MISSIONS].reverse().find((m) => missionOpen(profile, m));
}

/**
 * Choose three different facts for a shop: one the child knows (bronze),
 * one they are learning (silver) and one that stretches them (gold).
 */
export function pickFacts(profile, skill, rng, exclude = new Set()) {
  const all = factsFor(skill).filter((f) => !exclude.has(f.id));
  const pool = all.length >= 3 ? all : factsFor(skill);
  const sorted = [...pool].sort((x, y) => x.d - y.d);
  const third = Math.max(1, Math.ceil(sorted.length / 3));
  const easy = sorted.slice(0, third);
  const mid = sorted.slice(third, third * 2);
  const hard = sorted.slice(third * 2);
  const stage = (f) => factRecord(profile, f.id).stage;
  const taken = new Set();
  const choose = (...lists) => {
    for (const list of lists) {
      const options = list.filter((f) => !taken.has(f.id));
      if (options.length) {
        const fact = rng.pick(options);
        taken.add(fact.id);
        return fact;
      }
    }
    const fallback = sorted.find((f) => !taken.has(f.id)) || sorted[0];
    taken.add(fallback.id);
    return fallback;
  };
  // If the child has been struggling in this skill, gold reaches less far.
  const recent = profile.log.filter((e) => e.fact.startsWith(skill.slice(0, 3))).slice(-8);
  const struggling = recent.length >= 4 && recent.filter((e) => e.outcome === "first").length / recent.length < 0.5;
  const bronze = choose(pool.filter((f) => stage(f) >= 2), easy.filter((f) => stage(f) !== 1), easy);
  const silver = choose(pool.filter((f) => stage(f) === 1), mid.filter((f) => stage(f) < 4), mid, easy);
  const gold = struggling
    ? choose(mid.filter((f) => stage(f) < 4), hard)
    : choose(hard.filter((f) => stage(f) < 4), hard, mid);
  return { bronze, silver, gold };
}
