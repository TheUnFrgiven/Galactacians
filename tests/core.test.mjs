import { test } from "node:test";
import assert from "node:assert/strict";
import { factsFor, makeQuestion, isCorrect } from "../src/core/questions.js";
import { blankProfile, recordAnswer, completeMission, missionOpen, pickFacts, skillSummary } from "../src/core/learner.js";
import { makeShop, resolveCard } from "../src/core/shop.js";
import { createBattle } from "../src/core/battle.js";
import { MISSIONS, UNITS, getMission, unlockedTowers, TOWERS } from "../src/core/content.js";
import { skillOfFact } from "../src/core/questions.js";
import { normalize, logToCsv } from "../src/core/save.js";
import { createRng } from "../src/core/rng.js";
import { simulate, POLICIES } from "./sim.mjs";

const SKILLS = UNITS.map((u) => u.id);

test("every fact gives a correct, whole, non-negative answer in every format", () => {
  for (const skill of SKILLS) {
    for (const fact of factsFor(skill)) {
      for (const format of ["picture", "number", "missing"]) {
        const q = makeQuestion(fact, format);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0, `${fact.id} ${format}`);
        const [l, r, res] = [q.left, q.right, q.result].map((v, i) => (v === "?" ? q.answer : v));
        const calc = { "+": l + r, "−": l - r, "×": l * r, "÷": l / r }[q.op];
        assert.equal(calc, res, `${fact.id} ${format}: ${q.explanation}`);
        assert.ok(isCorrect(q, String(q.answer)));
        assert.ok(!isCorrect(q, ""));
      }
    }
  }
});

test("fact counts stay small enough to track", () => {
  assert.deepEqual(SKILLS.map((s) => factsFor(s).length), [45, 45, 9, 30, 30, 159]);
});

test("a fact needs first-try answers on two days to be mastered, and a mistake sends it back", () => {
  const p = blankProfile();
  const q = makeQuestion(factsFor("add10")[0], "number");
  for (let i = 0; i < 5; i++) recordAnswer(p, { question: q, tier: "silver", outcome: "first" }, new Date(2026, 9, 7));
  assert.equal(p.facts[q.factId].stage, 3, "same day: strong, not mastered");
  recordAnswer(p, { question: q, tier: "silver", outcome: "first" }, new Date(2026, 9, 8));
  assert.equal(p.facts[q.factId].stage, 4);
  recordAnswer(p, { question: q, tier: "silver", outcome: "retry" }, new Date(2026, 9, 9));
  assert.equal(p.facts[q.factId].stage, 1);
});

test("XP rewards effort: harder first-try answers pay more, help still pays a little", () => {
  const p = blankProfile();
  const q = makeQuestion(factsFor("mul2510")[0], "number");
  assert.equal(recordAnswer(p, { question: q, tier: "gold", outcome: "first" }).xp, 20);
  assert.equal(recordAnswer(p, { question: q, tier: "bronze", outcome: "first" }).xp, 10);
  assert.equal(recordAnswer(p, { question: q, tier: "gold", outcome: "retry" }).xp, 5);
  assert.equal(recordAnswer(p, { question: q, tier: "gold", outcome: "shown" }).xp, 2);
});

test("streak grows on consecutive days and a freeze covers one missed day", () => {
  const p = blankProfile();
  const q = makeQuestion(factsFor("add10")[0], "number");
  const day = (d) => new Date(2026, 9, d, 12);
  for (let d = 1; d <= 7; d++) recordAnswer(p, { question: q, tier: "bronze", outcome: "first" }, day(d));
  assert.equal(p.streak, 7);
  assert.equal(p.freezes, 1);
  recordAnswer(p, { question: q, tier: "bronze", outcome: "first" }, day(9));
  assert.equal(p.streak, 8);
  assert.equal(p.freezes, 0);
  recordAnswer(p, { question: q, tier: "bronze", outcome: "first" }, day(12));
  assert.equal(p.streak, 1);
});

test("missions pay only new stars, and a boss win opens the next unit", () => {
  const p = blankProfile();
  assert.equal(completeMission(p, "add10-1", 2).gained, 2);
  assert.equal(completeMission(p, "add10-1", 1).gained, 0);
  assert.equal(completeMission(p, "add10-1", 3).gained, 1);
  assert.ok(missionOpen(p, getMission("add10-2")));
  assert.ok(!missionOpen(p, getMission("add10-3")));
  assert.ok(!missionOpen(p, getMission("sub10-1")));
  completeMission(p, "add10-4", 1);
  assert.equal(p.unlockedUnits, 2);
  assert.ok(missionOpen(p, getMission("sub10-1")));
});

test("four towers from the start, two more are earned", () => {
  assert.deepEqual(unlockedTowers(0), ["pebble", "bricky", "frost", "prism"]);
  assert.deepEqual(unlockedTowers(1), ["pebble", "bricky", "frost", "prism", "poppy"]);
  assert.deepEqual(unlockedTowers(2), ["pebble", "bricky", "frost", "prism", "poppy", "magnet"]);
  assert.equal(unlockedTowers(50).length, 6);
});

test("practised skills come back as surprise review cards, and bosses mix skills", () => {
  const p = blankProfile();
  recordAnswer(p, { question: makeQuestion(factsFor("add10")[3], "number"), tier: "bronze", outcome: "first" });
  const rng = createRng(9);
  let reviews = 0;
  for (let i = 0; i < 200; i++) {
    const cards = makeShop(p, getMission("sub10-1"), rng);
    for (const c of cards) {
      assert.equal(skillOfFact(c.question.factId), c.skill);
      if (c.badge === "Review") {
        reviews++;
        assert.equal(c.skill, "add10");
      }
    }
  }
  assert.ok(reviews > 40 && reviews < 110, `reviews: ${reviews}`);
  const bossSkills = new Set();
  for (let i = 0; i < 100; i++) makeShop(blankProfile(), getMission("mul2510-4"), rng).forEach((c) => bossSkills.add(c.skill));
  assert.ok(bossSkills.size >= 3, [...bossSkills].join());
  const mixedSkills = new Set();
  for (let i = 0; i < 100; i++) makeShop(blankProfile(), getMission("mixed-2"), rng).forEach((c) => mixedSkills.add(c.skill));
  assert.equal(mixedSkills.size, 5);
});

test("a shop has three different facts, ordered easy to hard, and only unlocked towers", () => {
  const p = blankProfile();
  const rng = createRng(3);
  for (let i = 0; i < 50; i++) {
    const cards = makeShop(p, getMission("add10-1"), rng);
    assert.deepEqual(cards.map((c) => c.tier), ["bronze", "silver", "gold"]);
    assert.equal(new Set(cards.map((c) => c.question.factId)).size, 3);
    assert.ok(["pebble", "bricky"].includes(cards[0].tower.type), "easy cards give common towers");
    for (const c of cards) assert.ok(unlockedTowers(0).includes(c.tower.type));
    assert.equal(cards[2].question.format, "missing");
  }
});

test("facts the child got wrong come back on silver cards", () => {
  const p = blankProfile();
  const q = makeQuestion({ ...factsFor("add10").find((f) => f.id === "add:4+5") }, "number");
  recordAnswer(p, { question: q, tier: "silver", outcome: "retry" });
  const picks = pickFacts(p, "add10", createRng(1));
  assert.equal(picks.silver.id, "add:4+5");
});

test("a correct first try buys the card's tower; mistakes on harder cards give a Pebble", () => {
  const card = { tier: "gold", tower: { type: "poppy", level: 1 } };
  assert.deepEqual(resolveCard(card, "first"), { type: "poppy", level: 1 });
  assert.deepEqual(resolveCard(card, "retry"), { type: "pebble", level: 1 });
  assert.deepEqual(resolveCard(card, "shown"), { type: "pebble", level: 1 });
  assert.deepEqual(resolveCard({ tier: "bronze", tower: { type: "bricky", level: 1 } }, "retry"), { type: "bricky", level: 1 });
});

test("merging needs the same tower at the same level, up to level 3", () => {
  const b = createBattle(getMission("add10-2"));
  b.addToHand({ type: "pebble", level: 1 });
  b.addToHand({ type: "pebble", level: 1 });
  b.addToHand({ type: "bricky", level: 1 });
  assert.equal(b.place(0, 1, 2), "place");
  assert.equal(b.canPlace(1, 1, 2), null, "bricky cannot merge into pebble");
  assert.equal(b.place(0, 1, 2), "merge");
  assert.equal(b.state.towers[0].level, 2);
  b.addToHand({ type: "pebble", level: 1 });
  assert.equal(b.canPlace(1, 1, 2), null, "level 1 cannot merge into level 2");
  assert.equal(b.canPlace(0, 9, 0), null, "outside the board");
});

test("a Hopper jumps over the first tower it meets; a Magnet pushes aliens back", () => {
  const m = { ...getMission("add10-1"), waves: [[{ at: 0, lane: 0, type: "hopper" }]] };
  const b = createBattle(m);
  b.addToHand({ type: "bricky", level: 1 });
  b.place(0, 0, 5);
  b.startWave();
  for (let i = 0; i < 40; i++) b.step(0.25);
  assert.ok(b.drainEvents().some((e) => e.kind === "hop"));
  assert.ok(b.state.aliens[0].x < 5, "hopper is past the wall");

  const m2 = { ...getMission("add10-1"), waves: [[{ at: 0, lane: 1, type: "tank" }]] };
  const b2 = createBattle(m2);
  b2.addToHand({ type: "magnet", level: 1 });
  b2.place(0, 1, 1);
  b2.startWave();
  let pushes = 0;
  for (let i = 0; i < 200; i++) {
    b2.step(0.25);
    pushes += b2.drainEvents().filter((e) => e.kind === "magnet").length;
  }
  assert.ok(pushes >= 2, `pushes: ${pushes}`);
});

test("the simulation is deterministic", () => {
  const run = () => simulate(getMission("sub10-3"), { ...POLICIES.mixed, seed: 7 });
  assert.deepEqual(run(), run());
});

test("an empty defense loses, so towers (and the math that buys them) matter", () => {
  const b = createBattle(getMission("add10-1"));
  let guard = 0;
  while (b.state.status !== "lost" && guard++ < 100) {
    if (b.state.status === "build") b.startWave();
    b.step(0.25);
    for (let i = 0; i < 40; i++) b.step(0.25);
  }
  assert.equal(b.state.status, "lost");
});

const winRate = (policy, filter = () => true) => {
  const runs = MISSIONS.filter(filter).flatMap((m) => [1, 2, 3].map((seed) => simulate(m, { ...policy, seed })));
  return runs.filter((r) => r.won).length / runs.length;
};

test("balance: a child mixing card levels wins most missions, including bosses", () => {
  assert.ok(winRate(POLICIES.mixed, (m) => !m.boss) >= 0.75);
  assert.ok(winRate(POLICIES.mixed, (m) => m.boss) >= 0.6);
  for (const m of MISSIONS.filter((m) => m.slot === 1)) assert.ok(simulate(m, { ...POLICIES.mixed, seed: 1 }).won, m.id);
});

test("balance: three towers are not enough after the first mission", () => {
  assert.ok(winRate(POLICIES.threeTowers, (m) => m.slot > 1) <= 0.25);
});

test("balance: only easy cards rarely beats a Captain", () => {
  assert.ok(winRate(POLICIES.bronzeOnly, (m) => m.boss) <= 0.25);
});

test("balance: accuracy and ambition earn more stars than always being wrong", () => {
  const total = (policy) => MISSIONS.reduce((sum, m) => sum + [1, 2, 3].reduce((s, seed) => s + simulate(m, { ...policy, seed }).stars, 0), 0);
  const mixed = total(POLICIES.mixed);
  const bronze = total(POLICIES.bronzeOnly);
  const never = total(POLICIES.neverRight);
  assert.ok(mixed > bronze && bronze > never, `mixed ${mixed}, bronze ${bronze}, never ${never}`);
});

test("broken saves fall back to a fresh profile and the log exports as CSV", () => {
  assert.deepEqual(normalize(null), blankProfile());
  assert.deepEqual(normalize({ version: 2, xp: 99 }), blankProfile());
  const p = normalize({ version: 3, xp: -5, completed: { "add10-1": 9, hacked: 3 }, facts: { "add:1+1": { stage: 9 }, "<script>": {} } });
  assert.equal(p.xp, 0);
  assert.deepEqual(p.completed, { "add10-1": 3 });
  assert.equal(p.facts["add:1+1"].stage, 4);
  assert.equal(Object.keys(p.facts).length, 1);
  const q = makeQuestion(factsFor("add10")[0], "number");
  recordAnswer(p, { question: q, tier: "bronze", outcome: "first", ms: 1234 });
  assert.match(logToCsv(p), /^time,fact,format,tier,outcome,attempts,ms,hinted\n.+,add:1\+1,number,bronze,first,1,1234,false$/);
});

test("content: every mission has 3 waves, valid lanes and known aliens", () => {
  assert.equal(MISSIONS.length, 24);
  assert.equal(Object.keys(TOWERS).length, 6);
  for (const m of MISSIONS) {
    assert.equal(m.waves.length, 3);
    for (const wave of m.waves) for (const s of wave) assert.ok(s.lane >= 0 && s.lane < m.lanes && s.at >= 0, m.id);
  }
  for (const u of UNITS) assert.ok(skillSummary(blankProfile(), u.id).total > 0);
});
