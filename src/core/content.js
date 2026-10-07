/**
 * All game content lives here as plain data: towers, aliens, units and missions.
 * Small on purpose: 6 towers, 6 aliens, 6 worlds of 4 missions.
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
    pips: { power: 2, speed: 5, range: 3 },
    goodVs: ["scout", "skater", "hopper"],
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
    tip: "A tough wall. Aliens stop and bonk into it. Put shooters behind it.",
    pips: { power: 1, speed: 1, range: 1 },
    goodVs: ["scout", "tank", "boss"],
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
    tip: "A slow, big beam that shoots the whole lane and breaks helmets.",
    pips: { power: 5, speed: 1, range: 5 },
    goodVs: ["tank", "boss"],
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
    tip: "Makes aliens slow in its lane and the lanes above and below.",
    pips: { power: 1, speed: 3, range: 3 },
    goodVs: ["skater", "hopper", "swarm"],
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
    tip: "Bubbly blasts that pop groups of aliens, in 3 lanes at once.",
    pips: { power: 4, speed: 2, range: 4 },
    goodVs: ["swarm", "scout"],
    damage: 22,
    rate: 2.2,
    range: 5,
    hp: 60,
  },
  magnet: {
    id: "magnet",
    name: "Magnet",
    shape: "hexagon",
    color: "#ef8fa3",
    tier: "rare",
    role: "Push back",
    tip: "Pushes the closest alien back again and again. Buys your shooters time.",
    pips: { power: 1, speed: 2, range: 3 },
    goodVs: ["boss", "tank", "skater"],
    damage: 4,
    rate: 3.2,
    range: 4,
    hp: 70,
  },
};

export const TOWER_ORDER = ["pebble", "bricky", "frost", "prism", "poppy", "magnet"];
export const MAX_LEVEL = 3;

/** Global balance knobs, tuned with the simulated players in tests/sim.mjs. */
export const BALANCE = { towerPower: 1.6, alienHp: 0.9 };

/** Stats for a tower at a level. Each merge makes it clearly stronger. */
export function towerStats(type, level = 1) {
  const base = TOWERS[type];
  const step = Math.max(1, Math.min(MAX_LEVEL, level)) - 1;
  return {
    ...base,
    level: step + 1,
    damage: base.damage * BALANCE.towerPower * Math.pow(1.7, step),
    hp: base.hp * Math.pow(1.5, step),
    rate: base.rate * Math.pow(0.9, step),
    range: base.range + (base.range > 0 ? step * 0.5 : 0),
  };
}

/** Four towers from the start (attack, wall, slow, armor breaker); two more are earned. */
export const UNLOCKS = [
  ["pebble", "bricky", "frost", "prism"],
  ["poppy"],
  ["magnet"],
];
export function unlockedTowers(missionsCompleted = 0) {
  return UNLOCKS.slice(0, Math.min(UNLOCKS.length, missionsCompleted + 1)).flat();
}

export const ALIENS = {
  scout: { id: "scout", name: "Scout", hp: 30, speed: 0.42, armor: 0, attack: 8, color: "#b9a0e5", does: "Flies straight at Earth.", tip: "Pebble pops them." },
  skater: { id: "skater", name: "Skater", hp: 24, speed: 0.75, armor: 0, attack: 8, color: "#ffbb88", does: "Zooms really fast.", tip: "Frost slows them down so Pebble can hit them." },
  swarm: { id: "swarm", name: "Swarm", hp: 12, speed: 0.48, armor: 0, attack: 6, color: "#a3d986", does: "Comes in groups of four.", tip: "Poppy pops a whole group at once." },
  hopper: { id: "hopper", name: "Hopper", hp: 34, speed: 0.55, armor: 0, attack: 8, color: "#f4c96b", does: "Jumps over the first tower it bumps into!", tip: "Walls don't stop it. Shoot it early or slow it with Frost." },
  tank: { id: "tank", name: "Helmet", hp: 150, speed: 0.24, armor: 0.7, attack: 14, color: "#96c6da", does: "Its helmet blocks small shots.", tip: "Prism's beam breaks helmets." },
  boss: { id: "boss", name: "Captain", hp: 420, speed: 0.17, armor: 0.6, attack: 20, color: "#ed9bc5", does: "The big boss. Tough, with a helmet too.", tip: "Hold it with Bricky or Magnet and blast it with Prism." },
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
  {
    id: "div2510",
    title: "Sharing (÷ 2, 5, 10)",
    world: "Jupiter Market",
    example: "15 ÷ 5",
    color: "#e98f8f",
    teach: [
      { say: "Divide means share into equal groups.", visual: { kind: "div", a: 15, b: 5 } },
      { say: "15 shared into 5 groups gives 3 in each group. Times backwards: 5 times 3 is 15, so 15 divided by 5 is 3!", visual: { kind: "div", a: 15, b: 5, answer: true } },
    ],
  },
  {
    id: "mixed",
    title: "Galaxy mix",
    world: "The Big Galaxy",
    example: "+ − × ÷",
    color: "#6f8fe0",
    teach: [
      { say: "Now everything is mixed! Always look at the sign first.", visual: { kind: "signs" } },
      { say: "Plus puts together. Minus takes away. Times makes equal groups. Divide shares. You know them all!", visual: { kind: "signs" } },
    ],
  },
];

/** The skills a "mixed" world or a surprise card can draw from. */
export const BASIC_SKILLS = ["add10", "sub10", "bond10", "mul2510", "div2510"];

/* ---------- Missions and waves ---------- */

const MISSION_NAMES = [
  ["First contact", "Busy lanes", "Helmet day", "Captain of the orbit"],
  ["Moon visitors", "Quick skaters", "Bubble trouble", "Captain of the moon"],
  ["Comet tails", "Crowded skies", "Big and small", "Captain of the comets"],
  ["Ring road", "Round and round", "Ring traffic", "Captain of the rings"],
  ["Market day", "Fair shares", "Busy stalls", "Captain of the market"],
  ["Galaxy gate", "Surprise skies", "Everything at once", "The Grand Captain"],
];

/**
 * Wave recipes per mission slot (1-4). Each group is
 * [alien, count, startSecond, gapSeconds, clumpSize].
 * Slot 1 uses 3 lanes; the rest use 5. Waves are busy on purpose:
 * three towers are not enough, so choices and merging matter.
 */
const MID3 = [1, 2, 3];
const RECIPES = [
  {
    lanes: 3,
    waves: [
      { groups: [["scout", 7, 1, 1.8]] },
      { groups: [["scout", 9, 1, 1.4], ["skater", 4, 4, 2.4]] },
      { groups: [["scout", 10, 1, 1.2], ["skater", 5, 3, 2], ["tank", 2, 8, 6]] },
    ],
  },
  {
    lanes: 5,
    waves: [
      { lanes: MID3, groups: [["scout", 8, 1, 1.5], ["skater", 2, 6, 3]] },
      { groups: [["scout", 9, 1, 1.3], ["tank", 1, 6, 1], ["hopper", 3, 6, 3]] },
      { groups: [["scout", 12, 1, 1], ["skater", 5, 3, 2], ["tank", 3, 6, 5], ["hopper", 4, 8, 2.4]] },
    ],
  },
  {
    lanes: 5,
    waves: [
      { lanes: MID3, groups: [["scout", 7, 1, 1.6], ["swarm", 2, 5, 5, 4]] },
      { groups: [["skater", 7, 1, 1.5], ["swarm", 3, 4, 4.5, 4], ["tank", 2, 7, 6]] },
      { groups: [["scout", 11, 1, 1], ["swarm", 4, 3, 3.8, 4], ["tank", 3, 6, 5], ["hopper", 4, 9, 2.4]] },
    ],
  },
  {
    lanes: 5,
    boss: true,
    waves: [
      { lanes: MID3, groups: [["scout", 9, 1, 1.3], ["skater", 3, 4, 2.5], ["hopper", 2, 7, 3]] },
      { groups: [["scout", 11, 1, 1], ["tank", 3, 4, 5], ["swarm", 3, 6, 4.5, 4]] },
      { groups: [["boss", 1, 2, 1], ["scout", 11, 3, 1.1], ["swarm", 3, 7, 4.5, 4], ["tank", 2, 11, 6], ["hopper", 4, 9, 2.5]] },
    ],
  },
];

/** Later worlds are tougher, but every world starts with a gentler first mission. */
const UNIT_HP = [1, 1.1, 1.2, 1.3, 1.4, 1.5];

function buildWaves(missionId, recipe) {
  const rng = createRng(hashString(missionId));
  return recipe.waves.map(({ groups, lanes }) => {
    const spawns = [];
    const pool = lanes || Array.from({ length: recipe.lanes }, (_, l) => l);
    for (const [type, count, start, gap, clump = 1] of groups) {
      for (let i = 0; i < count; i++) {
        const lane = rng.pick(pool);
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
