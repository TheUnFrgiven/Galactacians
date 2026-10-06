/**
 * All game content lives here as plain data: towers, aliens, units and missions.
 * Keep it small on purpose: 5 towers, 5 aliens, 4 units of 4 missions.
 */
import { createRng, hashString } from "./rng.js";

export const COLS = 7;

/** Tier decides which shop card can offer the tower: bronze, silver or gold. */
export const TOWERS = {
  pebble: {
    id: "pebble",
    name: "Pebble",
    shape: "circle",
    color: "#78bf70",
    tier: "common",
    role: "Fast shots",
    tip: "Quick little shots. Great against small aliens.",
    damage: 10,
    rate: 0.6,
    range: 3.5,
    hp: 50,
  },
  bricky: {
    id: "bricky",
    name: "Bricky",
    shape: "square",
    color: "#e89583",
    tier: "common",
    role: "Wall",
    tip: "A tough wall. Aliens stop and bonk into it.",
    damage: 6,
    rate: 1,
    range: 0,
    hp: 220,
  },
  prism: {
    id: "prism",
    name: "Prism",
    shape: "triangle",
    color: "#e8b450",
    tier: "rare",
    role: "Armor breaker",
    tip: "A big beam that breaks through helmets.",
    damage: 40,
    rate: 2.4,
    range: 7,
    hp: 60,
  },
  frost: {
    id: "frost",
    name: "Frost",
    shape: "diamond",
    color: "#79c8db",
    tier: "rare",
    role: "Slows",
    tip: "Makes aliens slow in its lane and the lanes next to it.",
    damage: 3,
    rate: 1.5,
    range: 3.5,
    hp: 60,
  },
  poppy: {
    id: "poppy",
    name: "Poppy",
    shape: "pentagon",
    color: "#b09ad9",
    tier: "epic",
    role: "Group popper",
    tip: "Bubbly blasts that pop groups of aliens.",
    damage: 22,
    rate: 2.2,
    range: 5,
    hp: 60,
  },
};

export const TOWER_ORDER = ["pebble", "bricky", "prism", "frost", "poppy"];
export const MAX_LEVEL = 3;

/** Stats for a tower at a level. Each merge makes it clearly stronger. */
export function towerStats(type, level = 1) {
  const base = TOWERS[type];
  const step = Math.max(1, Math.min(MAX_LEVEL, level)) - 1;
  return {
    ...base,
    level: step + 1,
    damage: base.damage * Math.pow(1.7, step),
    hp: base.hp * Math.pow(1.5, step),
    rate: base.rate * Math.pow(0.9, step),
    range: base.range + (base.range > 0 ? step * 0.5 : 0),
  };
}

/** New towers arrive one per finished mission, so each is learned before the next. */
export const UNLOCKS = [
  ["pebble", "bricky"],
  ["prism"],
  ["frost"],
  ["poppy"],
];
export function unlockedTowers(missionsCompleted = 0) {
  return UNLOCKS.slice(0, Math.min(UNLOCKS.length, missionsCompleted + 1)).flat();
}

export const ALIENS = {
  scout: { id: "scout", name: "Scout", hp: 30, speed: 0.3, armor: 0, attack: 8, color: "#b9a0e5", tip: "Pebble pops them." },
  skater: { id: "skater", name: "Skater", hp: 22, speed: 0.55, armor: 0, attack: 8, color: "#ffbb88", tip: "Fast! Frost slows them down." },
  swarm: { id: "swarm", name: "Swarm", hp: 12, speed: 0.36, armor: 0, attack: 6, color: "#a3d986", tip: "Groups! Poppy pops them all." },
  tank: { id: "tank", name: "Helmet", hp: 140, speed: 0.18, armor: 0.7, attack: 14, color: "#96c6da", tip: "Helmets block small shots. Use Prism." },
  boss: { id: "boss", name: "Captain", hp: 380, speed: 0.13, armor: 0.6, attack: 20, color: "#ed9bc5", tip: "The Captain! Prism behind a Bricky works well." },
};

export const UNITS = [
  {
    id: "add10",
    title: "Adding to 10",
    world: "Earth Orbit",
    example: "3 + 4",
    color: "#78bf70",
    teach: [
      { say: "Adding means putting groups together.", visual: { kind: "add", a: 3, b: 2 } },
      { say: "Start with the first number, then count on. 3, then 4, 5. So 3 plus 2 is 5!", visual: { kind: "add", a: 3, b: 2, answer: true } },
    ],
  },
  {
    id: "sub10",
    title: "Taking away",
    world: "Moon Meadow",
    example: "7 − 3",
    color: "#75bad5",
    teach: [
      { say: "Taking away means some leave the group.", visual: { kind: "sub", a: 7, b: 3 } },
      { say: "Cross them out and count what is left. 7 take away 3 leaves 4!", visual: { kind: "sub", a: 7, b: 3, answer: true } },
    ],
  },
  {
    id: "bond10",
    title: "Make 10",
    world: "Comet Coast",
    example: "6 + ? = 10",
    color: "#e9b967",
    teach: [
      { say: "A ten frame has ten spaces.", visual: { kind: "bond", a: 6 } },
      { say: "Count the empty spaces to make 10. 6 and 4 make 10!", visual: { kind: "bond", a: 6, answer: true } },
    ],
  },
  {
    id: "mul2510",
    title: "Times 2, 5 and 10",
    world: "Saturn Rings",
    example: "5 × 3",
    color: "#b49bd8",
    teach: [
      { say: "Times means equal groups.", visual: { kind: "mul", a: 3, b: 5 } },
      { say: "3 groups of 5. Count by fives: 5, 10, 15. So 3 times 5 is 15!", visual: { kind: "mul", a: 3, b: 5, answer: true } },
    ],
  },
];

/* ---------- Missions and waves ---------- */

const MISSION_NAMES = [
  ["First contact", "Busy lanes", "Helmet day", "Captain of the orbit"],
  ["Moon visitors", "Quick skaters", "Bubble trouble", "Captain of the moon"],
  ["Comet tails", "Crowded skies", "Big and small", "Captain of the comets"],
  ["Ring road", "Round and round", "Ring traffic", "Captain of the rings"],
];

/**
 * Wave recipes per mission slot (1-4). Each group is
 * [alien, count, startSecond, gapSeconds, clumpSize].
 * Slot 1 uses 3 lanes; the rest use 5.
 */
const RECIPES = [
  {
    lanes: 3,
    waves: [
      [["scout", 5, 1, 3.6]],
      [["scout", 7, 1, 3], ["skater", 2, 9, 5]],
      [["scout", 8, 1, 2.6], ["skater", 4, 6, 4]],
    ],
  },
  {
    lanes: 5,
    waves: [
      [["scout", 7, 1, 2.8]],
      [["scout", 7, 1, 2.6], ["tank", 1, 8, 1]],
      [["scout", 8, 1, 2.2], ["skater", 4, 4, 3.5], ["tank", 2, 8, 8]],
    ],
  },
  {
    lanes: 5,
    waves: [
      [["scout", 6, 1, 2.8], ["swarm", 1, 10, 1, 4]],
      [["skater", 5, 1, 2.6], ["swarm", 2, 6, 7, 4], ["tank", 1, 12, 1]],
      [["scout", 8, 1, 2.2], ["swarm", 3, 5, 6, 4], ["tank", 2, 10, 7]],
    ],
  },
  {
    lanes: 5,
    boss: true,
    waves: [
      [["scout", 8, 1, 2.4], ["skater", 2, 8, 4]],
      [["scout", 8, 1, 2.2], ["tank", 2, 6, 7], ["swarm", 2, 9, 6, 4]],
      [["boss", 1, 2, 1], ["scout", 6, 4, 3], ["swarm", 2, 10, 7, 4], ["tank", 1, 16, 1]],
    ],
  },
];

/** Later units are a little tougher, but every unit starts gently. */
const UNIT_HP = [1, 1.08, 1.16, 1.24];

function buildWaves(missionId, recipe) {
  const rng = createRng(hashString(missionId));
  return recipe.waves.map((groups) => {
    const spawns = [];
    for (const [type, count, start, gap, clump = 1] of groups) {
      for (let i = 0; i < count; i++) {
        const lane = rng.int(0, recipe.lanes - 1);
        for (let k = 0; k < clump; k++) {
          spawns.push({ at: +(start + i * gap + k * 0.35).toFixed(2), lane, type });
        }
      }
    }
    return spawns.sort((a, b) => a.at - b.at);
  });
}

export const MISSIONS = UNITS.flatMap((unit, u) =>
  RECIPES.map((recipe, m) => {
    const id = `${unit.id}-${m + 1}`;
    return {
      id,
      unit: unit.id,
      unitIndex: u,
      slot: m + 1,
      title: MISSION_NAMES[u][m],
      boss: Boolean(recipe.boss),
      lanes: recipe.lanes,
      hpScale: UNIT_HP[u],
      waves: buildWaves(id, recipe),
    };
  }),
);

export const getMission = (id) => MISSIONS.find((m) => m.id === id);
export const unitMissions = (unitId) => MISSIONS.filter((m) => m.unit === unitId);
export const getUnit = (id) => UNITS.find((u) => u.id === id);
