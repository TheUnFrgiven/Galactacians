/** Local learning and progression. This module has no DOM or network dependency. */
export const PROFILE_KEY = "galactacians-v2";
export const SKILLS = Object.freeze([
  "addition",
  "subtraction",
  "multiplication",
  "division",
]);
export const LEVELS = Object.freeze(["starter", "explorer", "challenger"]);

const DAY_MS = 86_400_000;
const MAX_VALUE = 1_000_000;
const MAX_HISTORY = 2000;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const count = (value, max = MAX_VALUE) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(0, Math.floor(value)))
    : 0;
let questionSequence = 0;

function blankProfile() {
  return {
    version: 2,
    name: "Cadet",
    xp: 0,
    stars: 0,
    // Retained for older saves; each mission now owns its own energy supply.
    energyBank: 10,
    streak: 0,
    lastPracticeDate: null,
    completed: {},
    daily: {},
    skills: Object.fromEntries(
      SKILLS.map((skill) => [skill, { attempts: 0, correct: 0 }]),
    ),
    settings: {
      sound: true,
      reducedMotion: false,
      reminders: false,
      level: "starter",
    },
    cosmetics: [],
    equipped: "classic",
    history: [],
  };
}

/** A local calendar date, rather than a UTC date that can change during the evening. */
export function localDateKey(date = new Date()) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime()))
    throw new TypeError("A valid date is required.");
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calendarDay(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  if (year < 1900 || year > 2200) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return Math.floor(date.getTime() / DAY_MS);
}

function cleanDaily(value) {
  const answered = count(value?.answered);
  const correct = Math.min(answered, count(value?.correct));
  return {
    answered,
    correct,
    independentCorrect: Math.min(correct, count(value?.independentCorrect)),
    goalStarAwarded: value?.goalStarAwarded === true,
    missions: count(value?.missions),
    missionIds: Array.isArray(value?.missionIds)
      ? [
          ...new Set(
            value.missionIds.filter(
              (id) => typeof id === "string" && SAFE_ID.test(id),
            ),
          ),
        ].slice(0, 200)
      : [],
  };
}

function normalizeProfile(raw) {
  const profile = blankProfile();
  if (!object(raw) || raw.version !== 2) return profile;
  if (typeof raw.name === "string")
    profile.name =
      raw.name
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .slice(0, 32) || "Cadet";
  for (const key of ["xp", "stars", "streak"]) profile[key] = count(raw[key]);
  profile.energyBank = own(raw, "energyBank") ? count(raw.energyBank) : 10;
  profile.lastPracticeDate =
    calendarDay(raw.lastPracticeDate) !== null ? raw.lastPracticeDate : null;
  if (!profile.lastPracticeDate) profile.streak = 0;
  if (
    profile.lastPracticeDate &&
    calendarDay(localDateKey()) - calendarDay(profile.lastPracticeDate) > 1
  )
    profile.streak = 0;
  for (const skill of SKILLS) {
    const entry =
      object(raw.skills) && own(raw.skills, skill) ? raw.skills[skill] : null;
    profile.skills[skill].attempts = count(entry?.attempts);
    profile.skills[skill].correct = Math.min(
      profile.skills[skill].attempts,
      count(entry?.correct),
    );
  }
  if (object(raw.settings)) {
    for (const key of ["sound", "reducedMotion", "reminders"]) {
      if (typeof raw.settings[key] === "boolean")
        profile.settings[key] = raw.settings[key];
    }
    if (LEVELS.includes(raw.settings.level))
      profile.settings.level = raw.settings.level;
  }
  if (object(raw.completed)) {
    for (const [id, value] of Object.entries(raw.completed).slice(0, 1000)) {
      if (!SAFE_ID.test(id) || !object(value)) continue;
      const stars = count(value.stars, 3);
      if (stars > 0)
        profile.completed[id] = {
          stars,
          completedAt:
            calendarDay(value.completedAt) !== null ? value.completedAt : null,
        };
    }
  }
  if (object(raw.daily)) {
    for (const [date, value] of Object.entries(raw.daily)
      .filter(([key]) => calendarDay(key) !== null)
      .sort()
      .slice(-366)) {
      if (object(value)) profile.daily[date] = cleanDaily(value);
    }
  }
  if (Array.isArray(raw.cosmetics)) {
    profile.cosmetics = [
      ...new Set(
        raw.cosmetics.filter(
          (id) => typeof id === "string" && SAFE_ID.test(id),
        ),
      ),
    ].slice(0, 200);
  }
  if (raw.equipped === "classic" || profile.cosmetics.includes(raw.equipped))
    profile.equipped = raw.equipped;
  if (Array.isArray(raw.history)) {
    const seen = new Set();
    for (const entry of raw.history.slice(-MAX_HISTORY)) {
      if (
        !object(entry) ||
        typeof entry.id !== "string" ||
        !SAFE_ID.test(entry.id) ||
        !SKILLS.includes(entry.skill) ||
        seen.has(entry.id)
      )
        continue;
      if (calendarDay(entry.date) === null) continue;
      seen.add(entry.id);
      profile.history.push({
        id: entry.id,
        skill: entry.skill,
        date: entry.date,
        solved: entry.solved === true,
        independent: entry.independent === true && entry.solved === true,
        wrong: entry.wrong === true,
      });
    }
  }
  return profile;
}

/** A missing, older, malformed or inaccessible save always starts a usable profile. */
export function loadProfile() {
  try {
    const saved = globalThis.localStorage?.getItem(PROFILE_KEY);
    return saved ? normalizeProfile(JSON.parse(saved)) : blankProfile();
  } catch {
    return blankProfile();
  }
}

/** False lets the UI disclose that progress cannot currently be stored. */
export function saveProfile(profile) {
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(normalizeProfile(profile)),
    );
    return true;
  } catch {
    return false;
  }
}

function randomSource(rng) {
  return () => {
    const value = Number(rng());
    return Number.isFinite(value)
      ? Math.min(0.999999999999, Math.max(0, value))
      : 0.5;
  };
}

function answerOptions(answer, random) {
  const options = new Set([answer]);
  const offsets = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10];
  const start = Math.floor(random() * offsets.length);
  for (let i = 0; options.size < 4 && i < offsets.length; i++) {
    const candidate = answer + offsets[(start + i) % offsets.length];
    if (candidate >= 0) options.add(candidate);
  }
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Single-digit operands; division remains exact and subtraction never goes below zero. */
export function createQuestion(
  skill = "addition",
  level = "starter",
  rng = Math.random,
) {
  if (!SKILLS.includes(skill)) skill = "addition";
  if (!LEVELS.includes(level)) level = "starter";
  const random = randomSource(typeof rng === "function" ? rng : Math.random);
  const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
  let a, b, answer, operator, hint, visual;
  if (skill === "addition") {
    a = integer(level === "challenger" ? 1 : 0, level === "starter" ? 5 : 9);
    b = integer(
      level === "challenger" ? 1 : 0,
      level === "starter" ? Math.min(5, 9 - a) : 9,
    );
    answer = a + b;
    operator = "+";
    hint = `Start at ${a}. Count forward ${b} ${b === 1 ? "step" : "steps"}.`;
    visual = { kind: "combine", left: a, right: b };
  } else if (skill === "subtraction") {
    a = integer(level === "challenger" ? 6 : 1, level === "starter" ? 6 : 9);
    b = integer(level === "challenger" ? 2 : 0, a);
    answer = a - b;
    operator = "−";
    hint = `Start with ${a} stars. Take away ${b}. Count what is left.`;
    visual = { kind: "take-away", total: a, removed: b };
  } else if (skill === "multiplication") {
    a = integer(level === "challenger" ? 2 : 1, level === "starter" ? 5 : 9);
    b = integer(level === "challenger" ? 2 : 1, level === "starter" ? 3 : 9);
    answer = a * b;
    operator = "×";
    hint = `Make ${a} ${a === 1 ? "group" : "groups"} of ${b}. Add the groups together.`;
    visual = { kind: "groups", groups: a, each: b };
  } else {
    b = integer(level === "challenger" ? 2 : 1, level === "starter" ? 5 : 9);
    answer = integer(
      level === "challenger" ? 2 : 1,
      level === "starter" ? Math.floor(9 / b) : 9,
    );
    a = b * answer;
    operator = "÷";
    hint = `Share ${a} stars equally into ${b} ${b === 1 ? "group" : "groups"}. How many in each group?`;
    visual = { kind: "share", total: a, groups: b };
  }
  questionSequence += 1;
  const nonce =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${questionSequence.toString(36)}`;
  return {
    id: `q-${nonce}`,
    skill,
    level,
    a,
    b,
    operator,
    answer,
    options: answerOptions(answer, random),
    hint,
    explanation: `${a} ${operator} ${b} = ${answer}.`,
    visual,
  };
}

export function getDaily(profile) {
  const date = localDateKey();
  if (!own(profile.daily, date)) profile.daily[date] = cleanDaily(null);
  return profile.daily[date];
}

function creditStreak(profile, today) {
  if (profile.lastPracticeDate === today) return false;
  const previous = calendarDay(profile.lastPracticeDate);
  const current = calendarDay(today);
  // A clock moving backwards must not increment or reset a streak repeatedly.
  if (previous !== null && previous > current) return false;
  profile.streak =
    previous !== null && current - previous === 1
      ? count(profile.streak + 1)
      : 1;
  profile.lastPracticeDate = today;
  return true;
}

/**
 * Call on the first response and again when a retry is solved. A question counts
 * once toward first-try accuracy, and earns learning progress once after a solve.
 * Five solved questions award one cosmetic star per local practice date.
 * Mission energy is deliberately managed by the battle, never by this profile.
 * Pass assisted:true if the child used a hint before their first response.
 */
export function recordAnswer(
  profile,
  question,
  correct,
  { assisted = false } = {},
) {
  if (
    !question ||
    typeof question.id !== "string" ||
    !SAFE_ID.test(question.id) ||
    !SKILLS.includes(question.skill)
  ) {
    throw new TypeError("A generated question is required.");
  }
  const today = localDateKey();
  const daily = getDaily(profile);
  let entry = profile.history.find((item) => item.id === question.id);
  const response = {
    correct: correct === true,
    xpEarned: 0,
    starsEarned: 0,
    streakAdvanced: false,
    duplicate: false,
  };
  if (entry?.solved || (entry && correct !== true))
    return { ...response, duplicate: true };
  if (!entry) {
    entry = {
      id: question.id,
      skill: question.skill,
      date: today,
      solved: false,
      independent: false,
      wrong: correct !== true,
    };
    profile.history.push(entry);
    if (profile.history.length > MAX_HISTORY)
      profile.history.splice(0, profile.history.length - MAX_HISTORY);
    profile.skills[question.skill].attempts = count(
      profile.skills[question.skill].attempts + 1,
    );
    daily.answered = count(daily.answered + 1);
  }
  if (correct !== true) return response;
  entry.solved = true;
  entry.independent = !entry.wrong && !assisted;
  if (entry.independent) {
    profile.skills[entry.skill].correct = count(
      profile.skills[entry.skill].correct + 1,
    );
  }
  // Keep a retry solved after midnight with its original practice session, so
  // every day's solved count remains no greater than its answered count.
  const practiceDay = own(profile.daily, entry.date)
    ? profile.daily[entry.date]
    : daily;
  practiceDay.correct = count(practiceDay.correct + 1);
  if (entry.independent)
    practiceDay.independentCorrect = count(practiceDay.independentCorrect + 1);
  response.xpEarned = entry.independent ? 5 : 2;
  profile.xp = count(profile.xp + response.xpEarned);
  if (practiceDay.correct >= 5 && !practiceDay.goalStarAwarded) {
    practiceDay.goalStarAwarded = true;
    response.starsEarned = 1;
    profile.stars = count(profile.stars + 1);
  }
  response.streakAdvanced = creditStreak(profile, today);
  return response;
}

/** Only new best stars pay out. Replaying a mastered mission cannot farm rewards. */
export function completeMission(profile, missionId, result = {}) {
  if (typeof missionId !== "string" || !SAFE_ID.test(missionId))
    throw new TypeError("A valid mission ID is required.");
  const stars = result.won === false ? 0 : count(result.stars, 3);
  if (stars === 0)
    return {
      awardedStars: 0,
      xpEarned: 0,
      improved: false,
      firstCompletion: false,
    };
  const previous = own(profile.completed, missionId)
    ? profile.completed[missionId].stars
    : 0;
  const awardedStars = Math.max(0, stars - previous);
  const xpEarned = awardedStars * 10;
  if (awardedStars > 0) {
    profile.completed[missionId] = { stars, completedAt: localDateKey() };
    profile.stars = count(profile.stars + awardedStars);
    profile.xp = count(profile.xp + xpEarned);
  }
  const daily = getDaily(profile);
  if (!daily.missionIds.includes(missionId)) {
    daily.missionIds.push(missionId);
    daily.missions = count(daily.missions + 1);
  }
  return {
    awardedStars,
    xpEarned,
    improved: awardedStars > 0,
    firstCompletion: previous === 0,
  };
}

/** Cosmetic purchases are local and use earned stars only. */
export function buyCosmetic(profile, id, cost) {
  if (typeof id !== "string" || !SAFE_ID.test(id) || id === "classic")
    return false;
  if (!Number.isSafeInteger(cost) || cost < 0 || cost > MAX_VALUE) return false;
  if (profile.cosmetics.includes(id) || profile.stars < cost) return false;
  profile.stars -= cost;
  profile.cosmetics.push(id);
  return true;
}

/** Unknown settings and values are rejected, rather than written into the save. */
export function setSetting(profile, key, value) {
  if (key === "level" && LEVELS.includes(value)) {
    profile.settings.level = value;
    return true;
  }
  if (
    ["sound", "reducedMotion", "reminders"].includes(key) &&
    typeof value === "boolean"
  ) {
    profile.settings[key] = value;
    return true;
  }
  return false;
}
