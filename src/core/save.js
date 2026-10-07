/** Local saving. A missing or broken save always gives a fresh, playable profile. */
import { blankProfile } from "./learner.js";
import { UNITS, MISSIONS } from "./content.js";

export const SAVE_KEY = "galactacians-basics-v1";

const num = (v, max = 1e7) => (Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function normalize(raw) {
  const p = blankProfile();
  if (!raw || typeof raw !== "object" || raw.version !== 3) return p;
  p.started = raw.started === true;
  p.unlockedUnits = Math.max(1, Math.min(UNITS.length, num(raw.unlockedUnits) || 1));
  p.xp = num(raw.xp);
  p.streak = num(raw.streak);
  p.freezes = Math.min(2, num(raw.freezes));
  p.lastPlayDate = isDate(raw.lastPlayDate) ? raw.lastPlayDate : null;
  for (const u of UNITS) if (raw.seenTeach?.[u.id] === true) p.seenTeach[u.id] = true;
  for (const key of ["seenTowers", "seenAliens"]) {
    for (const [id, v] of Object.entries(raw[key] || {})) if (v === true && /^[a-z]+$/.test(id)) p[key][id] = true;
  }
  if ([1, 2, 3].includes(raw.settings?.speed)) p.settings.speed = raw.settings.speed;
  const ids = new Set(MISSIONS.map((m) => m.id));
  for (const [id, stars] of Object.entries(raw.completed || {})) {
    if (ids.has(id)) p.completed[id] = Math.min(3, num(stars));
  }
  for (const [id, rec] of Object.entries(raw.facts || {})) {
    if (!/^[a-z]+:[0-9+\-x/]+$/.test(id) || !rec || typeof rec !== "object") continue;
    p.facts[id] = {
      stage: Math.min(4, num(rec.stage)),
      attempts: num(rec.attempts),
      firstTry: num(rec.firstTry),
      days: Array.isArray(rec.days) ? rec.days.filter(isDate).slice(-5) : [],
    };
  }
  for (const key of ["sound", "voice", "reducedMotion"]) {
    if (typeof raw.settings?.[key] === "boolean") p.settings[key] = raw.settings[key];
  }
  if (Array.isArray(raw.log)) p.log = raw.log.filter((e) => e && typeof e.fact === "string").slice(-3000);
  return p;
}

export function loadProfile(storage = globalThis.localStorage) {
  try {
    const text = storage?.getItem(SAVE_KEY);
    return text ? normalize(JSON.parse(text)) : blankProfile();
  } catch {
    return blankProfile();
  }
}

export function saveProfile(profile, storage = globalThis.localStorage) {
  try {
    storage?.setItem(SAVE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

/** The answer log as CSV, for parents, teachers and the project evaluation. */
export function logToCsv(profile) {
  const head = "time,fact,format,tier,outcome,attempts,ms,hinted";
  const rows = profile.log.map((e) => [e.t, e.fact, e.format, e.tier, e.outcome, e.attempts, e.ms, e.hinted].join(","));
  return [head, ...rows].join("\n");
}
