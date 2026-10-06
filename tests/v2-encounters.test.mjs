import test from "node:test";
import assert from "node:assert/strict";
import { getEncounter } from "../src/v2/encounters.js";
import { ENEMIES, TOWERS } from "../src/v2/data.js";

test("all six missions have three distinct, deterministic and valid encounters", () => {
  const scripts = new Set();
  for (let mission = 1; mission <= 6; mission++) {
    for (let wave = 1; wave <= 3; wave++) {
      const encounter = getEncounter(mission, wave);
      assert.deepEqual(encounter, getEncounter(mission, wave));
      assert.ok(encounter.label && encounter.tip);
      assert.ok(encounter.spawns.length >= 6);
      for (const [index, spawn] of encounter.spawns.entries()) {
        assert.ok(Number.isInteger(spawn.row) && spawn.row >= 0 && spawn.row < 5);
        assert.ok(spawn.at >= 0 && spawn.at < 40);
        assert.ok(ENEMIES[spawn.type]);
        if (index) assert.ok(spawn.at >= encounter.spawns[index - 1].at);
      }
      assert.ok(encounter.suggestedTowers.every((id) => TOWERS.some((tower) => tower.id === id)));
      scripts.add(JSON.stringify(encounter.spawns));
    }
  }
  assert.equal(scripts.size, 18, "Every wave has its own route and cadence.");
});

test("encounter callers cannot change future retries", () => {
  const original = getEncounter(1, 1);
  const edited = getEncounter(1, 1);
  edited.spawns[0].row = 4;
  edited.spawns.pop();
  edited.suggestedTowers.push("invented");
  assert.deepEqual(getEncounter(1, 1), original);
});

test("the first mission starts gently and later missions have different tactical identities", () => {
  const lanes = (mission, wave) => [...new Set(getEncounter(mission, wave).spawns.map((spawn) => spawn.row))].sort();
  assert.deepEqual(lanes(1, 1), [1, 3]);
  assert.ok(getEncounter(1, 1).spawns.every((spawn) => spawn.type === "scout"));
  assert.deepEqual(lanes(2, 1), [0, 4]);
  assert.ok(getEncounter(2, 1).spawns.every((spawn) => spawn.type === "skater"));
  assert.deepEqual(lanes(3, 1), [0, 1]);
  assert.deepEqual(lanes(3, 2), [1, 2]);
  assert.deepEqual(lanes(3, 3), [2, 3]);
  assert.ok(getEncounter(4, 2).spawns.filter((spawn) => spawn.type === "swarm").length >= 20);
  assert.equal(getEncounter(5, 2).spawns.filter((spawn) => spawn.type === "tank").length, 2);
  assert.equal(getEncounter(6, 3).spawns[0].type, "boss");
  assert.equal(ENEMIES.tank.armor, 0.7);
  assert.equal(ENEMIES.boss.armor, 0.7);
});
