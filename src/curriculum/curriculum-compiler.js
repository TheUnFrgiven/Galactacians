"use strict";

(function attachCurriculumCompiler(root) {
  const REWARD_BY_STRAND = {
    placement: "addition",
    numberSense: "addition",
    additionSubtraction: "addition",
    multiplication: "multiplication",
    division: "division",
    fractions: "division",
    decimalsMeasurement: "subtraction",
    geometry: "multiplication",
    ratioPercent: "multiplication",
    algebra: "addition",
    dataStatistics: "division",
    mixedCapstone: "addition"
  };

  const REWARD_TEXT = {
    addition: "Planet Power",
    subtraction: "Shield Systems",
    multiplication: "Drone Systems",
    division: "Repair Systems"
  };

  function q(prompt, answer, visual = "", choices = null) {
    return choices ? { prompt, answer, visual, choices } : { prompt, answer, visual };
  }

  function choice(label, value = label) {
    return { label: String(label), value: Number(value) };
  }

  function includesAny(value, terms) {
    return terms.some((term) => value.includes(term));
  }

  function uniqueQuestions(questions) {
    const seen = new Set();
    return questions.filter((question) => {
      const key = `${question.prompt}:${question.answer}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function valueFromLabel(label) {
    const clean = String(label).trim().replace(/[$,?]/g, "");
    const fraction = clean.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
    if (fraction) {
      const numerator = Number(fraction[1]);
      const denominator = Number(fraction[2]);
      return denominator === 0 ? NaN : numerator / denominator;
    }
    return Number(clean);
  }

  function makeChoiceSet(labels) {
    return labels
      .map((label) => choice(label, valueFromLabel(label)))
      .filter((item) => Number.isFinite(item.value));
  }

  function inferChoices(question) {
    if (Array.isArray(question.choices) && question.choices.length > 0) {
      return question;
    }

    const prompt = question.prompt.trim();
    const colonOr = prompt.match(/:\s*([^?]+?)\s+or\s+([^?]+)\??$/i);
    if (colonOr) {
      return { ...question, choices: makeChoiceSet([colonOr[1], colonOr[2]]) };
    }

    const ofList = prompt.match(/\b(?:smallest|greatest) of\s+([^?]+)\??$/i);
    if (ofList) {
      return { ...question, choices: makeChoiceSet(ofList[1].split(",").map((item) => item.trim())) };
    }

    return question;
  }

  function familyQuestions(familyId, mission) {
    const family = familyId.toLowerCase();
    const missionId = mission.id.toLowerCase();

    if (includesAny(family, ["base-ten", "expanded", "digit-value", "place-value", "decimal-read"])) {
      return [
        q("What is the value of the 7 in 472?", 70),
        q("300 + 40 + 8 = ?", 348),
        q("What is 10 more than 236?", 246),
        q("Which digit is in the hundreds place in 583?", 5),
        q("5 tenths as a decimal is ?", 0.5),
        q("0.7 + 0.2 = ?", 0.9)
      ];
    }

    if (includesAny(family, ["compare", "order", "greatest", "least", "priority"])) {
      return [
        q("Which is greater: 426 or 462?", 462),
        q("Smallest of 305, 350, 503?", 305),
        q("Which is greater: 3/4 or 2/4?", 0.75),
        q("Which is greater: 0.6 or 0.46?", 0.6),
        q("Greatest of 18, 81, 58?", 81)
      ];
    }

    if (includesAny(family, ["number-line", "line-location", "missing-tick", "jump", "round", "estimate"])) {
      return [
        q("On a 0 to 100 line, halfway is ?", 50),
        q("30 + 40 on a number line lands at ?", 70),
        q("Round 47 to the nearest ten.", 50),
        q("Round 249 to the nearest hundred.", 200),
        q("Estimate 198 + 203 to the nearest hundred.", 400)
      ];
    }

    if (includesAny(family, ["join", "visual-addition", "small-sums", "make-10", "number-bond"])) {
      return [
        q("4 + 3 = ?", 7),
        q("8 + ? = 10", 2),
        q("6 + ? = 10", 4),
        q("9 + 5 = ?", 14),
        q("17 + 6 = ?", 23),
        q("24 + 8 = ?", 32)
      ];
    }

    if (includesAny(family, ["take-away", "subtract", "remaining", "missing-subtrahend"])) {
      return [
        q("9 - 4 = ?", 5),
        q("13 - 5 = ?", 8),
        q("20 - 7 = ?", 13),
        q("35 - 10 = ?", 25),
        q("52 - 18 = ?", 34)
      ];
    }

    if (includesAny(family, ["inverse", "fact-family", "missing-addend", "missing-value"])) {
      return [
        q("7 + ? = 12", 5),
        q("15 - ? = 9", 6),
        q("? + 8 = 20", 12),
        q("6 x ? = 24", 4),
        q("? / 5 = 6", 30)
      ];
    }

    if (includesAny(family, ["column", "estimate-then-check", "decimal-add", "decimal-subtract", "money-change"])) {
      return [
        q("246 + 137 = ?", 383),
        q("502 - 168 = ?", 334),
        q("3.4 + 2.5 = ?", 5.9),
        q("8.75 - 2.50 = ?", 6.25),
        q("$10.00 - $6.75 = ?", 3.25)
      ];
    }

    if (includesAny(family, ["groups-of", "repeated", "array", "picture-to-equation", "rows", "columns"])) {
      return [
        q("3 groups of 4 = ?", 12),
        q("5 + 5 + 5 = ?", 15),
        q("4 rows of 6 = ?", 24),
        q("7 x 3 = ?", 21),
        q("An array has 3 rows and 8 columns. How many?", 24)
      ];
    }

    if (includesAny(family, ["twos", "fives", "tens", "doubles", "near-known", "fact", "factor"])) {
      return [
        q("2 x 8 = ?", 16),
        q("5 x 7 = ?", 35),
        q("10 x 9 = ?", 90),
        q("6 x 6 = ?", 36),
        q("If 5 x 8 = 40, then 6 x 8 = ?", 48)
      ];
    }

    if (includesAny(family, ["partial", "break-apart", "two-digit-by-one-digit"])) {
      return [
        q("14 x 3 = ?", 42),
        q("23 x 4 = ?", 92),
        q("Break 16 x 5 into 10 x 5 plus 6 x 5. Total?", 80),
        q("30 x 6 = ?", 180),
        q("12 x 7 = ?", 84)
      ];
    }

    if (includesAny(family, ["share", "division", "divide", "how-many-groups", "group-size", "missing-factor"])) {
      return [
        q("12 shared by 3 = ?", 4),
        q("20 / 5 = ?", 4),
        q("24 / 6 = ?", 4),
        q("How many groups of 4 are in 28?", 7),
        q("9 x ? = 45", 5)
      ];
    }

    if (includesAny(family, ["remainder"])) {
      return [
        q("17 / 5 has remainder ?", 2),
        q("26 people, pods hold 6. How many full pods?", 4),
        q("26 people, pods hold 6. How many pods are needed?", 5),
        q("31 / 4 has remainder ?", 3),
        q("19 items packed 5 per box leaves ?", 4)
      ];
    }

    if (includesAny(family, ["fraction", "unit", "equal", "whole", "strip", "equivalent", "simplify"])) {
      return [
        q("How many halves make one whole?", 2),
        q("1/2 is the same as how many fourths?", 2),
        q("2/6 simplified has denominator ?", 3),
        q("3/4 is how many eighths?", 6),
        q("Which is equivalent to 1/3: 2/6 or 3/6?", 2 / 6)
      ];
    }

    if (includesAny(family, ["like-denominator", "related-denominator", "blend"])) {
      return [
        q("1/5 + 2/5 = ? fifths", 3),
        q("5/8 - 2/8 = ? eighths", 3),
        q("1/4 + 2/4 = ? fourths", 3),
        q("1/2 + 1/4 = ? fourths", 3),
        q("3/6 + 1/3 = ? sixths", 5)
      ];
    }

    if (includesAny(family, ["conversion", "length", "mass", "capacity", "time"])) {
      return [
        q("3 m = ? cm", 300),
        q("2 kg = ? g", 2000),
        q("1 hour 30 minutes = ? minutes", 90),
        q("4 L = ? mL", 4000),
        q("250 cm = ? m", 2.5)
      ];
    }

    if (includesAny(family, ["area", "perimeter", "volume", "construction"])) {
      return [
        q("Rectangle 6 by 4 has area ?", 24),
        q("Rectangle 6 by 4 has perimeter ?", 20),
        q("Box 3 by 4 by 5 has volume ?", 60),
        q("Square side 7 has area ?", 49),
        q("A path around a 10 by 2 rectangle is ?", 24)
      ];
    }

    if (includesAny(family, ["shape", "2d", "3d", "property"])) {
      return [
        q("How many sides does a hexagon have?", 6),
        q("How many vertices does a rectangle have?", 4),
        q("How many faces does a cube have?", 6),
        q("How many edges does a triangular prism have?", 9),
        q("How many right angles are in a rectangle?", 4)
      ];
    }

    if (includesAny(family, ["angle", "turn", "coordinate", "plot", "axis", "symmetry", "reflect", "translation"])) {
      return [
        q("A quarter turn is how many degrees?", 90),
        q("Point (3, 5) has y-coordinate ?", 5),
        q("Point (-2, 4) has x-coordinate ?", -2),
        q("Reflect (2, 3) over the y-axis. New x-coordinate?", -2),
        q("A straight angle is how many degrees?", 180)
      ];
    }

    if (includesAny(family, ["ratio", "rate", "percent", "benchmark", "discount", "increase"])) {
      return [
        q("Ratio 2:3 has total parts ?", 5),
        q("If 4 fuel cells cost 20 credits, 1 costs ?", 5),
        q("25% of 80 = ?", 20),
        q("10% of 250 = ?", 25),
        q("1/2 as a percent is ?", 50)
      ];
    }

    if (includesAny(family, ["pattern", "rule", "expression", "equation", "negative", "integer"])) {
      return [
        q("Pattern 3, 6, 9, 12. Next?", 15),
        q("If n = 5, n + 7 = ?", 12),
        q("x + 8 = 19. x = ?", 11),
        q("4x = 28. x = ?", 7),
        q("-3 + 8 = ?", 5)
      ];
    }

    if (includesAny(family, ["graph", "table", "plot", "mean", "median", "range", "claim", "sample", "data"])) {
      return [
        q("Scores 4, 6, 8 have mean ?", 6),
        q("Numbers 2, 9, 5 sorted have median ?", 5),
        q("Range of 3, 11, 7 is ?", 8),
        q("A bar chart scale counts by 5. Three steps mean ?", 15),
        q("Tally marks ||||/ || show ?", 7)
      ];
    }

    if (includesAny(family, ["mixed", "boss", "story", "capstone", "rescue", "route"])) {
      return [
        q("A ship has 24 supplies and shares them across 6 pods. Each pod gets ?", 4),
        q("A route is 35 km. You fly 18 km. Kilometers left?", 17),
        q("5 drones in each of 7 squads gives ?", 35),
        q("Shield is 80. It loses 25%. Shield lost?", 20),
        q("x + 6 = 18. x = ?", 12)
      ];
    }

    if (missionId.includes("diagnostic")) {
      return [
        q("What is 10 more than 57?", 67),
        q("8 + 7 = ?", 15),
        q("18 - 9 = ?", 9),
        q("4 x 3 = ?", 12),
        q("20 / 5 = ?", 4)
      ];
    }

    return [
      q("6 + 7 = ?", 13),
      q("18 - 9 = ?", 9),
      q("4 x 5 = ?", 20),
      q("24 / 6 = ?", 4),
      q("3 groups of 6 = ?", 18)
    ];
  }

  function strandFallbackQuestions(strand) {
    if (strand === "multiplication") {
      return familyQuestions("array-fact-strategies", { id: "fallback" });
    }
    if (strand === "division" || strand === "fractions" || strand === "dataStatistics") {
      return familyQuestions("division-fact-family", { id: "fallback" });
    }
    if (strand === "decimalsMeasurement") {
      return familyQuestions("decimal-add", { id: "fallback" });
    }
    if (strand === "geometry") {
      return familyQuestions("coordinate-route", { id: "fallback" });
    }
    if (strand === "ratioPercent") {
      return familyQuestions("ratio-percent", { id: "fallback" });
    }
    if (strand === "algebra") {
      return familyQuestions("equation-pattern", { id: "fallback" });
    }
    return familyQuestions("join-two-groups", { id: "fallback" });
  }

  function getRewardCategory(mission, galaxy) {
    if (mission.id.includes("subtract") || mission.id.includes("shield") || mission.id.includes("damage-control")) {
      return "subtraction";
    }
    if (mission.id.includes("division") || mission.id.includes("share") || mission.id.includes("remainder")) {
      return "division";
    }
    if (mission.id.includes("array") || mission.id.includes("multiplication") || mission.id.includes("drone")) {
      return "multiplication";
    }
    return REWARD_BY_STRAND[galaxy.strand] || "addition";
  }

  function buildQuestionPool(mission, galaxy) {
    const familyBank = (mission.questionFamilies || []).flatMap((family) => familyQuestions(family, mission));
    const fallback = strandFallbackQuestions(galaxy.strand);
    const questions = uniqueQuestions([...familyBank, ...fallback]).map(inferChoices);
    return questions.slice(0, Math.max(6, Math.min(10, questions.length)));
  }

  function buildHint(mission) {
    const scaffold = mission.scaffolds?.[0] || "mission model";
    const misconception = mission.misconceptions?.[0] || "the operation";
    return `Use the ${scaffold}. Watch for ${misconception.replaceAll("-", " ")}.`;
  }

  function buildTeaching(mission, galaxy) {
    return `${mission.objective} In this ${galaxy.title} mission, ${mission.fantasy.toLowerCase()}`;
  }

  function compileLearningSystemToLessons(system) {
    if (!system || !Array.isArray(system.galaxies)) {
      return [];
    }

    return system.galaxies.flatMap((galaxy) => galaxy.missions.map((mission) => {
      const rewardCategory = getRewardCategory(mission, galaxy);
      const gate = mission.masteryGate || {};
      const targetCorrect = Math.max(3, Math.min(9, gate.minIndependentCorrect || gate.minBossCorrect || 5));

      return {
        id: mission.id,
        galaxy: galaxy.title,
        title: mission.title,
        goal: mission.objective,
        teaching: buildTeaching(mission, galaxy),
        reward: REWARD_TEXT[rewardCategory],
        rewardCategory,
        targetCorrect,
        hint: buildHint(mission),
        questionPool: buildQuestionPool(mission, galaxy),
        ageRange: mission.ageRange,
        strand: galaxy.strand,
        standards: mission.standards || galaxy.standards || [],
        prerequisites: mission.prerequisites || [],
        scaffolds: mission.scaffolds || [],
        misconceptions: mission.misconceptions || [],
        masteryGate: mission.masteryGate || system.masteryModel?.defaultGate || {},
        reviewAfterDays: mission.masteryGate?.reviewAfterDays || system.masteryModel?.defaultGate?.reviewAfterDays || [1, 3, 7, 14],
        source: "learning-system"
      };
    }));
  }

  const api = { compileLearningSystemToLessons };

  if (typeof module !== "undefined") {
    module.exports = api;
  }

  root.GALACTACIANS_CURRICULUM_COMPILER = api;
})(typeof window !== "undefined" ? window : globalThis);
