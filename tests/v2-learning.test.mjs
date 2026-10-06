import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_KEY,
  SKILLS,
  LEVELS,
  loadProfile,
  saveProfile,
  createQuestion,
  recordAnswer,
  completeMission,
  localDateKey,
  getDaily,
  buyCosmetic,
  setSetting,
} from "../src/v2/learning.js";

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: (key) => (key === PROFILE_KEY ? value : null),
    setItem: (key, next) => {
      assert.equal(key, PROFILE_KEY);
      value = next;
    },
  };
}

function fresh() {
  globalThis.localStorage = memoryStorage();
  return loadProfile();
}

function seedRandom(seed = 109) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test("all skills and levels generate valid, varied, answerable arithmetic", () => {
  const ids = new Set();
  const random = seedRandom();
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      const answers = new Set();
      for (let i = 0; i < 300; i++) {
        const question = createQuestion(skill, level, random);
        assert.equal(question.skill, skill);
        assert.equal(question.options.length, 4);
        assert.equal(new Set(question.options).size, 4);
        assert.ok(question.options.includes(question.answer));
        assert.ok(
          question.options.every(
            (value) => Number.isInteger(value) && value >= 0,
          ),
        );
        assert.ok(question.b >= 0 && question.b <= 9);
        assert.ok(question.a >= 0 && (skill === "division" || question.a <= 9));
        if (skill === "division" && level === "starter")
          assert.ok(question.a <= 9);
        const expected =
          skill === "addition"
            ? question.a + question.b
            : skill === "subtraction"
              ? question.a - question.b
              : skill === "multiplication"
                ? question.a * question.b
                : question.a / question.b;
        assert.equal(question.answer, expected);
        assert.ok(Number.isInteger(expected) && expected >= 0);
        assert.ok(
          question.hint.length > 0 &&
            question.explanation.includes(String(expected)),
        );
        assert.ok(!ids.has(question.id));
        ids.add(question.id);
        answers.add(expected);
      }
      assert.ok(answers.size >= 5, `${skill}/${level} should vary`);
    }
  }
});

test("adversarial random endpoints cannot create invalid choices or infinite loops", () => {
  for (const value of [-1, 0, 0.999999, 1, 2, NaN]) {
    for (const skill of SKILLS) {
      const question = createQuestion(skill, "starter", () => value);
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options).size, 4);
      assert.ok(Number.isFinite(question.answer));
    }
  }
});

test("wrong attempts, assisted corrections and repeated clicks have distinct outcomes", () => {
  const profile = fresh();
  const question = createQuestion();
  assert.equal(recordAnswer(profile, question, false).starsEarned, 0);
  assert.equal(recordAnswer(profile, question, false).duplicate, true);
  const solved = recordAnswer(profile, question, true, { assisted: true });
  assert.equal(solved.starsEarned, 0);
  assert.equal(solved.xpEarned, 2);
  assert.equal(profile.skills.addition.attempts, 1);
  assert.equal(profile.skills.addition.correct, 0);
  assert.equal(getDaily(profile).answered, 1);
  assert.equal(getDaily(profile).correct, 1);
  assert.equal(getDaily(profile).independentCorrect, 0);
  assert.equal(profile.energyBank, 10);
  assert.equal(profile.streak, 1);
  assert.equal(recordAnswer(profile, question, true).duplicate, true);
  assert.equal(profile.energyBank, 10);
  const independent = createQuestion("subtraction");
  assert.equal(recordAnswer(profile, independent, true).xpEarned, 5);
  assert.equal(profile.skills.subtraction.correct, 1);
  assert.equal(profile.streak, 1);
  assert.equal(profile.xp, 7);
  assert.equal(getDaily(profile).independentCorrect, 1);
});

test("using a hint earns learning progress without marking independent mastery", () => {
  const profile = fresh();
  recordAnswer(profile, createQuestion(), true, { assisted: true });
  assert.deepEqual(profile.skills.addition, { attempts: 1, correct: 0 });
  assert.equal(profile.energyBank, 10);
  assert.equal(profile.xp, 2);
});

test("save/reload preserves answer reward deduplication", () => {
  const profile = fresh();
  const question = createQuestion();
  recordAnswer(profile, question, true);
  assert.equal(saveProfile(profile), true);
  const loaded = loadProfile();
  assert.equal(recordAnswer(loaded, question, true).duplicate, true);
  assert.equal(loaded.energyBank, 10);
});

test("five solves award one daily cosmetic star, including hints, with persisted deduplication", () => {
  let profile = fresh();
  profile.energyBank = 73; // A historical balance is preserved, never spent or topped up.
  let fifth;
  for (let i = 0; i < 5; i++) {
    const question = createQuestion();
    const reward = recordAnswer(profile, question, true, { assisted: i === 4 });
    assert.equal(reward.starsEarned, i === 4 ? 1 : 0);
    fifth = question;
  }
  assert.equal(profile.stars, 1);
  assert.equal(getDaily(profile).goalStarAwarded, true);
  assert.equal(profile.energyBank, 73);
  assert.equal(saveProfile(profile), true);
  profile = loadProfile();
  assert.equal(recordAnswer(profile, fifth, true).starsEarned, 0);
  for (let i = 0; i < 7; i++)
    assert.equal(recordAnswer(profile, createQuestion(), true).starsEarned, 0);
  assert.equal(profile.stars, 1);
  assert.equal(profile.energyBank, 73);
  assert.equal(getDaily(profile).correct, 12);
});

test("a new local date has its own goal and old progress stays intact", () => {
  const RealDate = Date;
  let instant = new RealDate(2026, 9, 7, 12);
  class FakeDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [instant]));
    }
    static now() {
      return instant.getTime();
    }
  }
  globalThis.Date = FakeDate;
  try {
    const profile = fresh();
    for (let i = 0; i < 5; i++) recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.stars, 1);
    instant = new RealDate(2026, 9, 8, 12);
    assert.equal(getDaily(profile).goalStarAwarded, false);
    for (let i = 0; i < 5; i++) recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.stars, 2);
    assert.equal(profile.streak, 2);
    assert.equal(profile.daily["2026-10-07"].goalStarAwarded, true);
  } finally {
    globalThis.Date = RealDate;
  }
});

test("mission rewards only pay for improvements, while daily completion counts once", () => {
  const profile = fresh();
  assert.equal(
    completeMission(profile, "mission-1", { stars: 2, won: false })
      .awardedStars,
    0,
  );
  assert.equal(
    completeMission(profile, "mission-1", { stars: 2 }).awardedStars,
    2,
  );
  assert.equal(
    completeMission(profile, "mission-1", { stars: 1 }).awardedStars,
    0,
  );
  assert.equal(
    completeMission(profile, "mission-1", { stars: 3 }).awardedStars,
    1,
  );
  assert.equal(
    completeMission(profile, "mission-1", { stars: 3 }).awardedStars,
    0,
  );
  assert.equal(profile.stars, 3);
  assert.equal(profile.xp, 30);
  assert.equal(profile.completed["mission-1"].stars, 3);
  assert.equal(getDaily(profile).missions, 1);
  assert.equal(
    profile.streak,
    0,
    "missions alone do not claim learning practice",
  );
  assert.equal(saveProfile(profile), true);
  assert.equal(
    completeMission(loadProfile(), "mission-1", { stars: 3 }).awardedStars,
    0,
  );
});

test("calendar streaks survive daylight-saving changes and reset after skipped dates", () => {
  const RealDate = Date;
  let instant = "2026-03-28T12:00:00+02:00";
  class FakeDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [instant]));
    }
    static now() {
      return new RealDate(instant).getTime();
    }
  }
  globalThis.Date = FakeDate;
  try {
    const profile = fresh();
    recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.streak, 1);
    instant = "2026-03-29T12:00:00+03:00";
    recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.streak, 2);
    instant = "2026-03-30T12:00:00+03:00";
    recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.streak, 3);
    instant = "2026-04-01T12:00:00+03:00";
    recordAnswer(profile, createQuestion(), false);
    assert.equal(
      profile.streak,
      3,
      "incorrect answers do not claim a practice day",
    );
    recordAnswer(profile, createQuestion(), true);
    assert.equal(profile.streak, 1);
  } finally {
    globalThis.Date = RealDate;
  }
});

test("local date keys use local calendar components", () => {
  assert.equal(localDateKey(new Date(2026, 8, 30, 23, 59)), "2026-09-30");
  assert.throws(() => localDateKey(new Date(NaN)), TypeError);
});

test("saved streak remains active through yesterday, but expires after a missed day", () => {
  const profile = fresh();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  profile.lastPracticeDate = localDateKey(yesterday);
  profile.streak = 7;
  saveProfile(profile);
  assert.equal(loadProfile().streak, 7);
  yesterday.setDate(yesterday.getDate() - 1);
  profile.lastPracticeDate = localDateKey(yesterday);
  saveProfile(profile);
  assert.equal(loadProfile().streak, 0);
});

test("hostile and corrupt saves are normalized into a safe usable profile", () => {
  globalThis.localStorage = memoryStorage("{bad json");
  assert.equal(loadProfile().energyBank, 10);
  globalThis.localStorage = memoryStorage(
    JSON.stringify({
      version: 2,
      name: "\u0000  ",
      xp: -100,
      stars: "999",
      energyBank: 2.7,
      streak: 100,
      lastPracticeDate: "2026-02-31",
      skills: { addition: { attempts: 2, correct: 999 } },
      settings: { sound: "false", level: "impossible" },
      daily: {
        "2026-09-30": { answered: 3, correct: 8, independentCorrect: 9 },
        "bad-date": {},
      },
      cosmetics: ["violet", "violet", "<script>"],
      equipped: "unowned",
      completed: JSON.parse(
        '{"__proto__":{"stars":3},"mission-1":{"stars":99}}',
      ),
      history: [{ id: null, skill: "addition", date: "2026-09-30" }],
    }),
  );
  const profile = loadProfile();
  assert.equal(profile.name, "Cadet");
  assert.equal(profile.xp, 0);
  assert.equal(profile.stars, 0);
  assert.equal(profile.energyBank, 2);
  assert.equal(profile.streak, 0);
  assert.equal(profile.lastPracticeDate, null);
  assert.deepEqual(profile.skills.addition, { attempts: 2, correct: 2 });
  assert.equal(profile.settings.sound, true);
  assert.equal(profile.settings.level, "starter");
  assert.equal(profile.daily["2026-09-30"].correct, 3);
  assert.equal(profile.daily["bad-date"], undefined);
  assert.deepEqual(profile.cosmetics, ["violet"]);
  assert.equal(profile.equipped, "classic");
  assert.equal(profile.completed["mission-1"].stars, 3);
  assert.equal(Object.prototype.stars, undefined);
  assert.equal(Object.hasOwn(profile.completed, "__proto__"), false);
  assert.equal(profile.history.length, 0);
});

test("storage failure is explicit and does not prevent play", () => {
  globalThis.localStorage = {
    getItem() {
      throw new Error("disabled");
    },
    setItem() {
      throw new Error("quota");
    },
  };
  const profile = loadProfile();
  recordAnswer(profile, createQuestion(), true);
  assert.equal(profile.energyBank, 10);
  assert.equal(saveProfile(profile), false);
});

test("cosmetics cannot overspend, double-purchase or use invalid prices", () => {
  const profile = fresh();
  profile.stars = 5;
  assert.equal(buyCosmetic(profile, "aurora", 6), false);
  assert.equal(buyCosmetic(profile, "aurora", -1), false);
  assert.equal(buyCosmetic(profile, "aurora", NaN), false);
  assert.equal(buyCosmetic(profile, "aurora", 3), true);
  assert.equal(buyCosmetic(profile, "aurora", 3), false);
  assert.equal(profile.stars, 2);
  assert.deepEqual(profile.cosmetics, ["aurora"]);
});

test("settings only accept supported keys and values", () => {
  const profile = fresh();
  assert.equal(setSetting(profile, "sound", false), true);
  assert.equal(setSetting(profile, "sound", "false"), false);
  assert.equal(setSetting(profile, "level", "challenger"), true);
  assert.equal(setSetting(profile, "__proto__", {}), false);
  assert.equal(profile.settings.sound, false);
  assert.equal(profile.settings.level, "challenger");
});
