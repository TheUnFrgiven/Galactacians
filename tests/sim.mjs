/**
 * Simulated players for balance testing. A bot picks shop cards by a policy,
 * answers with a given accuracy, places towers with simple kid-like rules and
 * plays the mission to the end.
 */
import { createBattle, BEAM_COST } from "../src/core/battle.js";
import { MISSIONS, ALIENS, COLS, towerStats } from "../src/core/content.js";
import { blankProfile } from "../src/core/learner.js";
import { makeShop, resolveCard, PICKS_PER_BUILD } from "../src/core/shop.js";
import { createRng, hashString } from "../src/core/rng.js";

const SKILL = { add10: "add10", sub10: "sub10", bond10: "bond10", mul2510: "mul2510" };

/** A profile that has finished the missions before this one, so towers are unlocked as for a normal player. */
function profileBefore(mission) {
  const p = blankProfile();
  for (const m of MISSIONS) {
    if (m.unitIndex < mission.unitIndex || (m.unitIndex === mission.unitIndex && m.slot < mission.slot)) p.completed[m.id] = 2;
  }
  p.unlockedUnits = 4;
  return p;
}

function laneThreat(battle) {
  const threat = Array(battle.state.lanes).fill(0);
  for (const s of battle.state.mission.waves[battle.state.wave] || []) {
    const a = ALIENS[s.type];
    threat[s.lane] += a.hp * (1 + a.armor * 2) * a.speed;
  }
  return threat;
}

function laneDefense(battle) {
  const def = Array(battle.state.lanes).fill(0.001);
  for (const t of battle.state.towers) {
    const s = towerStats(t.type, t.level);
    const dps = t.type === "bricky" ? s.hp / 20 : s.damage / s.rate;
    const spread = t.type === "frost" || t.type === "poppy" ? 1 : 0;
    for (let l = t.lane - spread; l <= t.lane + spread; l++) if (l >= 0 && l < def.length) def[l] += dps;
  }
  return def;
}

const PREFERRED_COL = { pebble: 2, bricky: 4, prism: 0, frost: 2, poppy: 1 };

/** A careless placer: random free squares in the front half, like a child's first try. */
export function placeRandom(battle, rng) {
  while (battle.state.hand.length) {
    const free = [];
    for (let lane = 0; lane < battle.state.lanes; lane++) for (let col = 0; col < 5; col++) if (battle.canPlace(0, lane, col)) free.push([lane, col]);
    if (!free.length) return void battle.state.hand.shift();
    const [lane, col] = rng.pick(free);
    battle.place(0, lane, col);
  }
}

export function placeHand(battle) {
  while (battle.state.hand.length) {
    const item = battle.state.hand[0];
    // Merge when possible: kids love merging.
    const twin = battle.state.towers.find((t) => t.type === item.type && t.level === item.level && t.level < 3);
    if (twin && battle.place(0, twin.lane, twin.col)) continue;
    const threat = laneThreat(battle);
    const def = laneDefense(battle);
    const lanes = [...threat.keys()].sort((a, b) => threat[b] / def[b] - threat[a] / def[a]);
    let done = false;
    for (const lane of lanes) {
      const pref = PREFERRED_COL[item.type];
      for (const col of [pref, pref + 1, pref - 1, pref + 2, pref - 2, 3, 5, 6]) {
        if (col < 0 || col >= COLS) continue;
        if (battle.canPlace(0, lane, col) === "place") {
          battle.place(0, lane, col);
          done = true;
          break;
        }
      }
      if (done) break;
    }
    if (!done) battle.state.hand.shift();
  }
}

/**
 * policy.tiers: which card tiers the bot picks, in order of a cycle (e.g. ["bronze"] or ["silver","gold","bronze"]).
 * policy.accuracy: chance of a first-try answer.
 */
export function simulate(mission, policy) {
  const rng = createRng(hashString(`${mission.id}:${policy.name}:${policy.seed || 1}`));
  const profile = profileBefore(mission);
  const battle = createBattle(mission);
  let pickCount = 0;
  let guard = 0;
  while (battle.state.status === "build" || battle.state.status === "wave") {
    if (battle.state.status === "build") {
      for (let i = 0; i < PICKS_PER_BUILD; i++) {
        const shop = makeShop(profile, mission, rng);
        const tier = policy.tiers[pickCount++ % policy.tiers.length];
        const card = shop.find((c) => c.tier === tier);
        const first = rng() < policy.accuracy;
        battle.addToHand(resolveCard(card, first ? "first" : "retry"));
        if (first) battle.chargeBeam();
      }
      if (policy.maxTowers) battle.state.hand.splice(0, Math.max(0, battle.state.hand.length - Math.max(0, policy.maxTowers - battle.state.towers.length)));
      if (policy.random) placeRandom(battle, rng);
      else placeHand(battle);
      battle.startWave();
    }
    battle.step(0.25);
    if (battle.state.beam >= BEAM_COST && battle.danger()) battle.fireBeam();
    if (++guard > 40000) throw new Error(`Mission ${mission.id} did not finish`);
  }
  return { mission: mission.id, won: battle.state.status === "won", stars: battle.stars(), hearts: battle.state.hearts };
}

export const POLICIES = {
  bronzeOnly: { name: "bronzeOnly", tiers: ["bronze"], accuracy: 0.95 },
  mixed: { name: "mixed", tiers: ["silver", "bronze", "gold"], accuracy: 0.75 },
  ambitious: { name: "ambitious", tiers: ["gold", "silver", "gold"], accuracy: 0.6 },
  neverRight: { name: "neverRight", tiers: ["gold"], accuracy: 0 },
  carelessKid: { name: "carelessKid", tiers: ["bronze", "silver", "gold"], accuracy: 0.7, random: true },
  threeTowers: { name: "threeTowers", tiers: ["silver", "bronze", "gold"], accuracy: 0.8, maxTowers: 3 },
};

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [key, policy] of Object.entries(POLICIES)) {
    const rows = MISSIONS.map((m) => {
      const runs = [1, 2, 3].map((seed) => simulate(m, { ...policy, seed }));
      const wins = runs.filter((r) => r.won).length;
      const stars = runs.map((r) => r.stars).join("");
      return `${m.id}:${wins}/3(${stars})`;
    });
    console.log(key.padEnd(11), rows.join("  "));
  }
}
