"use strict";

const assert = require("node:assert/strict");
const learningSystem = require("../src/curriculum/learning-system.js");
const { compileLearningSystemToLessons } = require("../src/curriculum/curriculum-compiler.js");

const requiredMissionFields = [
  "id",
  "title",
  "ageRange",
  "objective",
  "fantasy",
  "gameVerb",
  "standards",
  "scaffolds",
  "misconceptions",
  "questionFamilies",
  "masteryGate"
];

function assertAgeRange(range, label) {
  assert(Array.isArray(range), `${label} ageRange must be an array`);
  assert.equal(range.length, 2, `${label} ageRange must have [min, max]`);
  assert(Number.isInteger(range[0]), `${label} ageRange min must be an integer`);
  assert(Number.isInteger(range[1]), `${label} ageRange max must be an integer`);
  assert(range[0] >= learningSystem.targetAges[0], `${label} starts below target age`);
  assert(range[1] <= learningSystem.targetAges[1], `${label} ends above target age`);
  assert(range[0] <= range[1], `${label} ageRange min must be <= max`);
}

function assertNonEmptyArray(value, label) {
  assert(Array.isArray(value), `${label} must be an array`);
  assert(value.length > 0, `${label} must not be empty`);
}

assert.equal(learningSystem.product, "Galactacians");
assert.match(learningSystem.version, /^\d+\.\d+\.\d+$/);
assert.deepEqual(learningSystem.targetAges, [7, 12]);
assertNonEmptyArray(learningSystem.standardsSources, "standardsSources");
assertNonEmptyArray(learningSystem.designPillars, "designPillars");
assertNonEmptyArray(learningSystem.masteryModel.states, "masteryModel.states");

for (const state of ["new", "introduced", "guided", "practicing", "secure", "mastered", "review_due", "needs_support"]) {
  assert(
    learningSystem.masteryModel.states.includes(state),
    `mastery state is missing: ${state}`
  );
}

assert(learningSystem.galaxies.length >= 8, "expected at least 8 galaxies");

const ids = new Set();
let missionCount = 0;

for (const galaxy of learningSystem.galaxies) {
  assert(galaxy.id, "galaxy id is required");
  assert(!ids.has(galaxy.id), `duplicate id: ${galaxy.id}`);
  ids.add(galaxy.id);
  assert(galaxy.title, `${galaxy.id} title is required`);
  assert(galaxy.strand, `${galaxy.id} strand is required`);
  assertAgeRange(galaxy.ageRange, galaxy.id);
  assertNonEmptyArray(galaxy.standards, `${galaxy.id}.standards`);
  assertNonEmptyArray(galaxy.missions, `${galaxy.id}.missions`);

  for (const mission of galaxy.missions) {
    missionCount += 1;
    for (const field of requiredMissionFields) {
      assert(
        Object.prototype.hasOwnProperty.call(mission, field),
        `${mission.id || galaxy.id} missing field: ${field}`
      );
    }

    assert(!ids.has(mission.id), `duplicate id: ${mission.id}`);
    ids.add(mission.id);
    assertAgeRange(mission.ageRange, mission.id);
    assert(
      mission.ageRange[0] >= galaxy.ageRange[0] && mission.ageRange[1] <= galaxy.ageRange[1],
      `${mission.id} ageRange must sit inside parent galaxy ageRange`
    );
    assert(mission.objective.length >= 20, `${mission.id} objective is too vague`);
    assert(mission.fantasy.length >= 20, `${mission.id} fantasy is too vague`);
    assertNonEmptyArray(mission.standards, `${mission.id}.standards`);
    assertNonEmptyArray(mission.scaffolds, `${mission.id}.scaffolds`);
    assertNonEmptyArray(mission.misconceptions, `${mission.id}.misconceptions`);
    assertNonEmptyArray(mission.questionFamilies, `${mission.id}.questionFamilies`);

    const gate = mission.masteryGate;
    assert(Number.isInteger(gate.minIndependentCorrect), `${mission.id} gate needs minIndependentCorrect`);
    assert(Number.isInteger(gate.minBossCorrect), `${mission.id} gate needs minBossCorrect`);
    assert(Number.isInteger(gate.bossItems), `${mission.id} gate needs bossItems`);
    assert(typeof gate.maxErrorRate === "number", `${mission.id} gate needs maxErrorRate`);
    assert(gate.maxErrorRate >= 0 && gate.maxErrorRate <= 0.5, `${mission.id} maxErrorRate is out of range`);
    assertNonEmptyArray(gate.reviewAfterDays, `${mission.id}.masteryGate.reviewAfterDays`);
  }
}

assert(missionCount >= 45, `expected at least 45 missions, found ${missionCount}`);

const compiledLessons = compileLearningSystemToLessons(learningSystem);
assert.equal(compiledLessons.length, missionCount, "compiled lesson count must match mission count");

const playableLessons = compiledLessons.filter((lesson) => lesson.strand !== "placement");
assert.equal(playableLessons.length, 55, "runtime Campaign should expose 55 non-placement planets");

let twoChoiceQuestionCount = 0;
let threeChoiceQuestionCount = 0;

for (const lesson of compiledLessons) {
  assert(lesson.id, "compiled lesson id is required");
  assert(lesson.galaxy, `${lesson.id} galaxy is required`);
  assert(lesson.title, `${lesson.id} title is required`);
  assert(lesson.goal, `${lesson.id} goal is required`);
  assert(["addition", "subtraction", "multiplication", "division"].includes(lesson.rewardCategory), `${lesson.id} rewardCategory is invalid`);
  assert(Number.isInteger(lesson.targetCorrect), `${lesson.id} targetCorrect must be an integer`);
  assert(lesson.targetCorrect >= 3 && lesson.targetCorrect <= 9, `${lesson.id} targetCorrect must fit prototype pacing`);
  assertAgeRange(lesson.ageRange, `${lesson.id}.compiled`);
  assertNonEmptyArray(lesson.standards, `${lesson.id}.compiled.standards`);
  assertNonEmptyArray(lesson.scaffolds, `${lesson.id}.compiled.scaffolds`);
  assertNonEmptyArray(lesson.misconceptions, `${lesson.id}.compiled.misconceptions`);
  assert(lesson.masteryGate && typeof lesson.masteryGate === "object", `${lesson.id}.compiled.masteryGate is required`);
  assertNonEmptyArray(lesson.reviewAfterDays, `${lesson.id}.compiled.reviewAfterDays`);
  assertNonEmptyArray(lesson.questionPool, `${lesson.id}.questionPool`);
  assert(lesson.questionPool.length >= 5, `${lesson.id} needs at least 5 playable questions`);

  for (const question of lesson.questionPool) {
    assert.equal(typeof question.prompt, "string", `${lesson.id} question prompt must be text`);
    assert(question.prompt.length > 0, `${lesson.id} question prompt must not be empty`);
    assert.equal(typeof question.answer, "number", `${lesson.id} question answer must be numeric`);

    if (question.choices) {
      assertNonEmptyArray(question.choices, `${lesson.id} question choices`);
      assert(question.choices.length >= 2 && question.choices.length <= 4, `${lesson.id} choice count must fit the deck`);
      assert(
        question.choices.some((choice) => Math.abs(Number(choice.value) - question.answer) < 0.000001),
        `${lesson.id} choices must include the correct answer`
      );
      if (question.choices.length === 2) {
        twoChoiceQuestionCount += 1;
      }
      if (question.choices.length === 3) {
        threeChoiceQuestionCount += 1;
      }
    }
  }
}

assert(twoChoiceQuestionCount > 0, "expected at least one two-choice campaign question");
assert(threeChoiceQuestionCount > 0, "expected at least one three-choice campaign question");

console.log(
  `curriculum-ok version=${learningSystem.version} galaxies=${learningSystem.galaxies.length} missions=${missionCount} playable=${playableLessons.length} compiled=${compiledLessons.length}`
);
