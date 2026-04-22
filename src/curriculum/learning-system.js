"use strict";

const GALACTACIANS_LEARNING_SYSTEM = {
  version: "0.1.0",
  product: "Galactacians",
  targetAges: [7, 12],
  purpose:
    "A standards-informed space campaign that teaches math through missions, mastery gates, repair loops, and planet restoration.",
  standardsSources: [
    {
      id: "iso-21001-2025",
      name: "ISO 21001:2025 Educational organizations management systems",
      url: "https://www.iso.org/standard/21001",
      usage:
        "Design reference for learner-centered objectives, evidence, accessibility, feedback, and continual improvement. This is not a certification claim."
    },
    {
      id: "common-core-math",
      name: "Common Core Mathematics Standards",
      url: "https://corestandards.org/mathematics-standards/",
      usage:
        "Reference progression for math domains, practices, coherence, and grade-band expectations."
    },
    {
      id: "uk-national-curriculum-maths",
      name: "England National Curriculum Mathematics",
      url:
        "https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study",
      usage:
        "Reference for fluency, reasoning, problem solving, and age-adjacent topic progression."
    }
  ],
  designPillars: [
    "Game first, worksheet never",
    "One mission teaches one measurable idea",
    "Visual models before symbols when concepts are new",
    "Bosses test transfer, not surprise curriculum",
    "Wrong answers trigger repair, not silent skipping",
    "Practice strengthens a skill that was actually taught",
    "Rewards make the world visibly safer, richer, and more alive",
    "Competition is optional and child-safe"
  ],
  qualitySystem: {
    objectiveRule: "Every mission must define a learning objective and standards references.",
    evidenceRule:
      "Every answer should be recordable by skill, question family, attempts, hint level, response bucket, and misconception tag.",
    supportRule:
      "Repeated errors route to a guided repair mission with stronger scaffolding.",
    reviewRule:
      "Secure skills return through mixed review before they become mastered.",
    improvementRule:
      "Mission analytics should identify confusing teaching, unfair difficulty spikes, and weak retention."
  },
  masteryModel: {
    states: [
      "new",
      "introduced",
      "guided",
      "practicing",
      "secure",
      "mastered",
      "review_due",
      "needs_support"
    ],
    defaultGate: {
      minIndependentCorrect: 5,
      minBossCorrect: 3,
      bossItems: 4,
      maxErrorRate: 0.2,
      maxRepeatedMisconceptions: 1,
      reviewAfterDays: [1, 3, 7, 14]
    },
    transitions: [
      {
        from: "new",
        to: "introduced",
        when: "Learner completes the micro-teach and one guided item."
      },
      {
        from: "introduced",
        to: "guided",
        when: "Learner solves with a scaffold or hint."
      },
      {
        from: "guided",
        to: "practicing",
        when: "Learner answers 3 independent items with no more than 1 error."
      },
      {
        from: "practicing",
        to: "secure",
        when: "Learner passes the mission mastery gate."
      },
      {
        from: "secure",
        to: "mastered",
        when: "Learner passes later mixed review without heavy hints."
      },
      {
        from: "secure",
        to: "review_due",
        when: "A scheduled review interval has elapsed."
      },
      {
        from: "introduced",
        to: "needs_support",
        when: "Repeated misconception tags show a missing prerequisite."
      }
    ]
  },
  telemetryEvents: [
    "mission_started",
    "micro_teach_viewed",
    "question_answered",
    "hint_used",
    "misconception_tagged",
    "repair_triggered",
    "mastery_gate_passed",
    "mastery_gate_failed",
    "review_scheduled",
    "planet_reward_applied"
  ],
  rewardModel: {
    strands: {
      numberSense: "map calibration, scanner clarity, coordinate stability",
      addition: "power generation and weapon charge",
      subtraction: "shielding and damage control",
      multiplication: "multi-target tools, drone squads, fleet scaling",
      division: "fair sharing, logistics, repair distribution",
      fractions: "fuel mixing, territories, energy crystals",
      decimalsMeasurement: "trade precision, navigation distance, cargo timing",
      geometry: "routes, angles, shields, coordinate navigation",
      ratioPercent: "alliances, oxygen balance, trade rates, fleet scaling",
      algebra: "command rules, automation, unknown system values",
      dataStatistics: "scan reports, risk prediction, council decisions"
    },
    childSafeMotivation: [
      "planet restoration",
      "mission badges",
      "ship modules",
      "cosmetic crews and trails",
      "boss rematches",
      "daily rescue missions from review_due skills",
      "private progress streaks with repair options"
    ],
    avoid: [
      "public raw-score ranking by default",
      "punishment copy after mistakes",
      "pay-to-progress learning gates",
      "speed pressure before mastery",
      "random worksheet feeds inside the main campaign"
    ]
  },
  missionTypes: [
    "diagnostic",
    "micro_teach",
    "guided_practice",
    "independent_run",
    "mixed_transfer",
    "repair",
    "boss",
    "challenge"
  ],
  galaxies: [
    {
      id: "launch-academy",
      title: "Diagnostic Bay",
      strand: "placement",
      ageRange: [7, 12],
      campaignRole:
        "Place the learner, teach controls, and prove that mistakes route to support instead of punishment.",
      standards: ["CCSS.Math.Practice", "UK-NC-Maths-Aims", "ISO-21001-learner-needs"],
      rewardTheme: "launch license and first crew",
      missions: [
        {
          id: "launch-diagnostic-number-check",
          title: "Star Map Check",
          ageRange: [7, 12],
          objective: "Estimate the learner's number sense starting point without survival pressure.",
          fantasy: "Calibrate the ship scanner before launch.",
          gameVerb: "scan",
          standards: ["CCSS.Math.Content.2.NBT", "CCSS.Math.Content.3.NBT"],
          prerequisites: [],
          scaffolds: ["number line", "place-value chart", "skip option after two attempts"],
          misconceptions: ["digit-order", "place-value-confusion", "counting-gap"],
          questionFamilies: ["number-ordering", "number-line-location", "place-value-read"],
          masteryGate: { minIndependentCorrect: 4, minBossCorrect: 0, bossItems: 0, maxErrorRate: 0.35, reviewAfterDays: [1] }
        },
        {
          id: "launch-diagnostic-operations-check",
          title: "Engine Power Check",
          ageRange: [7, 12],
          objective: "Estimate readiness for addition, subtraction, multiplication, and division.",
          fantasy: "Test the ship engines with safe simulator power.",
          gameVerb: "charge",
          standards: ["CCSS.Math.Content.2.OA", "CCSS.Math.Content.3.OA", "CCSS.Math.Content.4.OA"],
          prerequisites: [],
          scaffolds: ["ten-frame", "array card", "fact family triangle"],
          misconceptions: ["operation-confusion", "inverse-confusion", "counting-all-overuse"],
          questionFamilies: ["add-within-20", "subtract-within-20", "equal-groups", "fair-sharing"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 0, bossItems: 0, maxErrorRate: 0.4, reviewAfterDays: [1] }
        },
        {
          id: "launch-mission-control-tutorial",
          title: "Mission Control",
          ageRange: [7, 12],
          objective: "Teach the mission loop: learn, try, repair, master, and restore the planet.",
          fantasy: "Complete a training launch with Mission Control.",
          gameVerb: "launch",
          standards: ["ISO-21001-learner-support", "UK-NC-Maths-Aims"],
          prerequisites: [],
          scaffolds: ["worked example", "hint ladder", "retry without penalty"],
          misconceptions: ["interface-confusion"],
          questionFamilies: ["guided-tutorial-single-skill"],
          masteryGate: { minIndependentCorrect: 3, minBossCorrect: 2, bossItems: 3, maxErrorRate: 0.34, reviewAfterDays: [1] }
        }
      ]
    },
    {
      id: "number-sense-nebula",
      title: "Number Sense Nebula",
      strand: "numberSense",
      ageRange: [7, 9],
      campaignRole: "Build place value, comparison, estimation, and number-line thinking.",
      standards: ["CCSS.Math.Content.2.NBT", "CCSS.Math.Content.3.NBT", "UK-NC-Y3-number-place-value"],
      rewardTheme: "map calibration and scanner clarity",
      missions: [
        {
          id: "number-ones-tens-hundreds",
          title: "Coordinate Crates",
          ageRange: [7, 8],
          objective: "Read and build numbers using ones, tens, and hundreds.",
          fantasy: "Sort coordinate crates into the correct ship bays.",
          gameVerb: "sort",
          standards: ["CCSS.Math.Content.2.NBT.A", "UK-NC-Y3-place-value"],
          prerequisites: [],
          scaffolds: ["base-ten blocks", "place-value chart", "expanded form"],
          misconceptions: ["digit-value-confusion", "zero-placeholder"],
          questionFamilies: ["base-ten-build", "expanded-form-match", "digit-value"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "number-compare-and-order",
          title: "Signal Strength",
          ageRange: [7, 9],
          objective: "Compare and order 2-digit and 3-digit numbers.",
          fantasy: "Choose the strongest rescue signals first.",
          gameVerb: "rank",
          standards: ["CCSS.Math.Content.2.NBT.A.4", "UK-NC-Y3-compare-order"],
          prerequisites: ["number-ones-tens-hundreds"],
          scaffolds: ["place-value comparison", "number cards", "greater-than symbol prompt"],
          misconceptions: ["left-to-right-too-soon", "more-digits-confusion"],
          questionFamilies: ["compare-two-numbers", "order-three-numbers", "greatest-least"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "number-line-jumps",
          title: "Nebula Route Jumps",
          ageRange: [7, 9],
          objective: "Locate numbers and jumps on a number line.",
          fantasy: "Plot safe jumps through a foggy nebula.",
          gameVerb: "plot",
          standards: ["CCSS.Math.Content.2.MD.B", "UK-NC-Y3-number-line"],
          prerequisites: ["number-compare-and-order"],
          scaffolds: ["labeled number line", "tick spacing", "jump arrows"],
          misconceptions: ["unequal-spacing", "endpoint-confusion"],
          questionFamilies: ["find-missing-tick", "jump-forward-back", "estimate-location"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "number-rounding-estimation",
          title: "Safe Orbit Estimate",
          ageRange: [8, 9],
          objective: "Round numbers and estimate whether an answer is reasonable.",
          fantasy: "Choose a safe orbit before exact engines finish calculating.",
          gameVerb: "estimate",
          standards: ["CCSS.Math.Content.3.NBT.A.1", "UK-NC-Y4-rounding"],
          prerequisites: ["number-line-jumps"],
          scaffolds: ["nearest-ten line", "midpoint marker", "reasonableness prompt"],
          misconceptions: ["always-round-up", "midpoint-confusion", "exact-vs-estimate"],
          questionFamilies: ["round-nearest-ten", "round-nearest-hundred", "reasonable-answer"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "number-sense-boss-starmap",
          title: "Nebula Cartographer",
          ageRange: [8, 9],
          objective: "Use place value, comparison, number lines, and estimation in one route mission.",
          fantasy: "Open the route from the nebula to Operation Orbit.",
          gameVerb: "navigate",
          standards: ["CCSS.Math.Content.2.NBT", "CCSS.Math.Content.3.NBT", "UK-NC-Y3-Y4-place-value"],
          prerequisites: ["number-ones-tens-hundreds", "number-compare-and-order", "number-line-jumps"],
          scaffolds: ["mixed review cards", "one hint per item", "route preview"],
          misconceptions: ["digit-value-confusion", "unequal-spacing", "exact-vs-estimate"],
          questionFamilies: ["mixed-place-value-boss", "route-ordering", "estimate-check"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "operation-orbit",
      title: "Operation Orbit",
      strand: "additionSubtraction",
      ageRange: [7, 10],
      campaignRole: "Teach addition and subtraction as joining, separating, comparing, and inverse operations.",
      standards: ["CCSS.Math.Content.2.OA", "CCSS.Math.Content.2.NBT.B", "CCSS.Math.Content.3.NBT.A.2"],
      rewardTheme: "power generation and shield repair",
      missions: [
        {
          id: "operation-count-all-join",
          title: "Power Cells",
          ageRange: [7, 8],
          objective: "Add by joining two groups and counting all objects.",
          fantasy: "Reconnect loose power cells to restore planet lights.",
          gameVerb: "connect",
          standards: ["CCSS.Math.Content.2.OA.A.1", "UK-NC-Y2-Y3-addition"],
          prerequisites: [],
          scaffolds: ["dot groups", "ten-frame", "count-all animation"],
          misconceptions: ["missed-object", "double-count", "operation-confusion"],
          questionFamilies: ["join-two-groups", "visual-addition", "small-sums"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "operation-make-ten",
          title: "Make Ten Gate",
          ageRange: [7, 8],
          objective: "Use pairs that make 10 to solve missing-addend problems.",
          fantasy: "Open a shield gate that requires exactly 10 charge units.",
          gameVerb: "balance",
          standards: ["CCSS.Math.Content.2.OA.B.2", "UK-NC-Y3-number-bonds"],
          prerequisites: ["operation-count-all-join"],
          scaffolds: ["ten-frame", "empty-space count", "known pair cards"],
          misconceptions: ["off-by-one", "count-all-overuse", "missing-addend-confusion"],
          questionFamilies: ["make-10-missing", "ten-frame-complete", "number-bond-match"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "operation-subtract-take-away",
          title: "Damage Control",
          ageRange: [7, 8],
          objective: "Subtract by taking away and counting what remains.",
          fantasy: "Remove damaged shield panels and count the safe panels left.",
          gameVerb: "repair",
          standards: ["CCSS.Math.Content.2.OA.A.1", "UK-NC-Y2-Y3-subtraction"],
          prerequisites: ["operation-count-all-join"],
          scaffolds: ["cross-out model", "number line back jumps", "remaining group highlight"],
          misconceptions: ["subtract-smaller-from-bigger-only", "wrong-start-number", "count-removed-instead-of-left"],
          questionFamilies: ["take-away-visual", "count-back-small", "remaining-amount"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "operation-inverse-relay",
          title: "Inverse Relay",
          ageRange: [8, 9],
          objective: "Use addition and subtraction as inverse operations to find missing values.",
          fantasy: "Reverse a broken energy relay to recover missing charge.",
          gameVerb: "reverse",
          standards: ["CCSS.Math.Content.2.OA.A.1", "CCSS.Math.Content.3.OA.D.8"],
          prerequisites: ["operation-make-ten", "operation-subtract-take-away"],
          scaffolds: ["fact family triangle", "bar model", "same-total highlight"],
          misconceptions: ["inverse-confusion", "missing-symbol-confusion", "operation-sign-ignored"],
          questionFamilies: ["fact-family", "missing-addend", "missing-subtrahend"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "operation-column-methods",
          title: "Engine Stack Repair",
          ageRange: [8, 10],
          objective: "Add and subtract multi-digit numbers using place value and written methods.",
          fantasy: "Stack engine parts in exact place-value columns.",
          gameVerb: "align",
          standards: ["CCSS.Math.Content.3.NBT.A.2", "CCSS.Math.Content.4.NBT.B.4", "UK-NC-Y3-Y4-columnar"],
          prerequisites: ["number-ones-tens-hundreds", "operation-inverse-relay"],
          scaffolds: ["column grid", "regrouping animation", "estimate check"],
          misconceptions: ["misaligned-columns", "regrouping-error", "subtract-top-bottom-confusion"],
          questionFamilies: ["column-addition", "column-subtraction", "estimate-then-check"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "operation-boss-orbit-defense",
          title: "Orbit Defense Boss",
          ageRange: [8, 10],
          objective: "Choose and use addition or subtraction in mixed mission problems.",
          fantasy: "Defend the orbital ring by routing energy and repairing damage.",
          gameVerb: "defend",
          standards: ["CCSS.Math.Content.3.OA.D.8", "CCSS.Math.Content.4.OA.A.3", "UK-NC-Y3-Y4-problem-solving"],
          prerequisites: ["operation-make-ten", "operation-inverse-relay", "operation-column-methods"],
          scaffolds: ["read-the-sign prompt", "bar model optional", "one retry hint"],
          misconceptions: ["operation-choice", "extra-information", "inverse-confusion"],
          questionFamilies: ["mixed-add-sub-story", "missing-value-story", "estimate-check-story"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "array-belt",
      title: "Array Belt",
      strand: "multiplication",
      ageRange: [8, 10],
      campaignRole: "Teach multiplication through equal groups, arrays, strategies, and facts.",
      standards: ["CCSS.Math.Content.3.OA", "CCSS.Math.Content.4.OA", "UK-NC-Y3-Y4-multiplication"],
      rewardTheme: "drone squads and multi-target weapons",
      missions: [
        {
          id: "array-equal-groups",
          title: "Drone Squads",
          ageRange: [8, 9],
          objective: "Understand multiplication as equal groups.",
          fantasy: "Launch drone squads with the same number of drones in each squad.",
          gameVerb: "group",
          standards: ["CCSS.Math.Content.3.OA.A.1", "UK-NC-Y3-equal-groups"],
          prerequisites: ["operation-count-all-join"],
          scaffolds: ["group circles", "repeated addition", "skip-count trail"],
          misconceptions: ["unequal-groups", "add-instead-of-multiply", "group-size-vs-groups"],
          questionFamilies: ["groups-of", "repeated-addition-match", "picture-to-equation"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "array-rectangles",
          title: "Asteroid Arrays",
          ageRange: [8, 9],
          objective: "Use rows and columns to represent multiplication.",
          fantasy: "Clear asteroid fields arranged in rows and columns.",
          gameVerb: "target",
          standards: ["CCSS.Math.Content.3.OA.A.3", "CCSS.Math.Content.3.MD.C.7"],
          prerequisites: ["array-equal-groups"],
          scaffolds: ["row highlight", "column highlight", "array-to-equation"],
          misconceptions: ["row-column-swap-confusion", "counting-perimeter", "skip-row"],
          questionFamilies: ["array-count", "equation-to-array", "missing-row-column"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "array-fact-strategies",
          title: "Skip-Count Drive",
          ageRange: [8, 10],
          objective: "Use 2s, 5s, 10s, doubles, and near facts to build multiplication fluency.",
          fantasy: "Tune the ship drive with rhythmic skip-count pulses.",
          gameVerb: "tune",
          standards: ["CCSS.Math.Content.3.OA.C.7", "UK-NC-Y4-times-tables"],
          prerequisites: ["array-rectangles"],
          scaffolds: ["skip-count track", "known-fact cards", "double/half prompt"],
          misconceptions: ["skip-count-drop", "fact-swap-anxiety", "memorized-without-meaning"],
          questionFamilies: ["twos-fives-tens", "doubles", "near-known-facts"],
          masteryGate: { minIndependentCorrect: 8, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.18, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "array-distributive-break-apart",
          title: "Split The Fleet",
          ageRange: [9, 10],
          objective: "Break multiplication facts apart using the distributive property.",
          fantasy: "Split a fleet into easier formations, then recombine it.",
          gameVerb: "split",
          standards: ["CCSS.Math.Content.3.OA.B.5", "CCSS.Math.Content.4.NBT.B.5"],
          prerequisites: ["array-fact-strategies"],
          scaffolds: ["area model", "partial products", "known-fact split"],
          misconceptions: ["partial-product-missing", "place-value-in-products", "split-one-factor-twice"],
          questionFamilies: ["break-apart-array", "partial-products", "two-digit-by-one-digit"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "array-boss-swarm-commander",
          title: "Swarm Commander",
          ageRange: [9, 10],
          objective: "Use multiplication strategies to solve facts, arrays, and story missions.",
          fantasy: "Command drone swarms against a multi-lane asteroid attack.",
          gameVerb: "command",
          standards: ["CCSS.Math.Content.3.OA", "CCSS.Math.Content.4.OA.A"],
          prerequisites: ["array-equal-groups", "array-rectangles", "array-fact-strategies"],
          scaffolds: ["array reveal", "known-fact hint", "split prompt"],
          misconceptions: ["operation-choice", "group-size-vs-groups", "partial-product-missing"],
          questionFamilies: ["mixed-multiplication-boss", "array-story", "factor-missing"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "rescue-division-sector",
      title: "Rescue Division Sector",
      strand: "division",
      ageRange: [8, 10],
      campaignRole: "Teach division as fair sharing, grouping, inverse multiplication, and remainder interpretation.",
      standards: ["CCSS.Math.Content.3.OA", "CCSS.Math.Content.4.OA", "UK-NC-Y3-Y4-division"],
      rewardTheme: "logistics, healing, and repair distribution",
      missions: [
        {
          id: "division-fair-sharing",
          title: "Supply Drop",
          ageRange: [8, 9],
          objective: "Understand division as sharing a total equally.",
          fantasy: "Share supplies fairly between rescue pods.",
          gameVerb: "share",
          standards: ["CCSS.Math.Content.3.OA.A.2", "UK-NC-Y3-division"],
          prerequisites: ["array-equal-groups"],
          scaffolds: ["drag-to-pods", "equal-share check", "leftover warning"],
          misconceptions: ["unequal-sharing", "total-vs-group-size", "ignored-leftover"],
          questionFamilies: ["fair-share-visual", "total-divided-by-groups", "share-story"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "division-grouping",
          title: "Evacuation Pods",
          ageRange: [8, 9],
          objective: "Understand division as finding how many equal groups can be made.",
          fantasy: "Pack citizens into evacuation pods of equal size.",
          gameVerb: "pack",
          standards: ["CCSS.Math.Content.3.OA.A.2", "UK-NC-Y3-grouping"],
          prerequisites: ["division-fair-sharing"],
          scaffolds: ["grouping circles", "skip-count back", "array cover"],
          misconceptions: ["sharing-vs-grouping-confusion", "group-size-vs-number-groups", "count-leftover-as-group"],
          questionFamilies: ["how-many-groups", "group-size-known", "division-array-cover"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "division-inverse-facts",
          title: "Reverse Array Key",
          ageRange: [8, 10],
          objective: "Use multiplication facts to solve division facts.",
          fantasy: "Unlock rescue doors by reversing multiplication keys.",
          gameVerb: "unlock",
          standards: ["CCSS.Math.Content.3.OA.B.6", "CCSS.Math.Content.3.OA.C.7"],
          prerequisites: ["array-fact-strategies", "division-grouping"],
          scaffolds: ["fact family triangle", "missing factor prompt", "array reveal"],
          misconceptions: ["inverse-confusion", "fact-family-mismatch", "divide-larger-by-smaller-rule"],
          questionFamilies: ["division-fact-family", "missing-factor", "divide-by-2-5-10"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.18, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "division-remainders",
          title: "Remainder Rescue",
          ageRange: [9, 10],
          objective: "Interpret remainders according to the story context.",
          fantasy: "Decide whether extra citizens need another pod, wait, or report as leftover.",
          gameVerb: "decide",
          standards: ["CCSS.Math.Content.4.OA.A.3", "UK-NC-Y4-remainders"],
          prerequisites: ["division-inverse-facts"],
          scaffolds: ["context choice cards", "quotient-remainder model", "round-up warning"],
          misconceptions: ["always-round-down", "always-round-up", "ignored-remainder"],
          questionFamilies: ["remainder-as-leftover", "remainder-round-up", "remainder-ignore-context"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "division-boss-logistics-chief",
          title: "Logistics Chief",
          ageRange: [9, 10],
          objective: "Use division, multiplication facts, and remainder interpretation in rescue missions.",
          fantasy: "Run the final evacuation route under pressure.",
          gameVerb: "coordinate",
          standards: ["CCSS.Math.Content.3.OA", "CCSS.Math.Content.4.OA.A.3"],
          prerequisites: ["division-fair-sharing", "division-inverse-facts", "division-remainders"],
          scaffolds: ["choose model prompt", "fact family hint", "context hint"],
          misconceptions: ["operation-choice", "inverse-confusion", "ignored-remainder"],
          questionFamilies: ["mixed-division-boss", "rescue-word-problem", "missing-factor-story"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "fraction-frontier",
      title: "Fraction Frontier",
      strand: "fractions",
      ageRange: [8, 11],
      campaignRole: "Teach unit fractions, equivalence, comparison, and fraction operations through visual models.",
      standards: ["CCSS.Math.Content.3.NF", "CCSS.Math.Content.4.NF", "CCSS.Math.Content.5.NF"],
      rewardTheme: "fuel mixing, crystal alignment, and territory restoration",
      missions: [
        {
          id: "fraction-equal-parts",
          title: "Fuel Cell Slices",
          ageRange: [8, 9],
          objective: "Recognize that fractions require equal parts of one whole.",
          fantasy: "Cut fuel cells into equal safe segments.",
          gameVerb: "slice",
          standards: ["CCSS.Math.Content.3.NF.A.1", "UK-NC-Y3-fractions"],
          prerequisites: ["division-fair-sharing"],
          scaffolds: ["equal-part overlay", "whole outline", "bad-slice contrast"],
          misconceptions: ["unequal-parts", "counting-pieces-only", "whole-confusion"],
          questionFamilies: ["equal-vs-unequal-parts", "name-unit-fraction", "build-one-whole"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "fraction-number-line",
          title: "Crystal Track",
          ageRange: [8, 10],
          objective: "Place unit and non-unit fractions on a number line.",
          fantasy: "Align energy crystals along a calibrated track.",
          gameVerb: "align",
          standards: ["CCSS.Math.Content.3.NF.A.2", "UK-NC-Y3-fraction-line"],
          prerequisites: ["fraction-equal-parts", "number-line-jumps"],
          scaffolds: ["partitioned number line", "equal intervals", "whole markers"],
          misconceptions: ["unequal-spacing", "numerator-as-position-only", "denominator-bigger-means-bigger"],
          questionFamilies: ["unit-fraction-line", "fraction-location", "missing-fraction-tick"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "fraction-equivalence",
          title: "Twin Crystals",
          ageRange: [9, 10],
          objective: "Recognize and generate equivalent fractions.",
          fantasy: "Find crystals with the same power even when cut differently.",
          gameVerb: "match",
          standards: ["CCSS.Math.Content.3.NF.A.3", "CCSS.Math.Content.4.NF.A.1"],
          prerequisites: ["fraction-number-line"],
          scaffolds: ["fraction strips", "area model overlay", "multiply/divide both parts prompt"],
          misconceptions: ["same-denominator-only", "change-one-part", "visual-size-confusion"],
          questionFamilies: ["equivalent-strip-match", "generate-equivalent", "simplify-visual"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "fraction-compare",
          title: "Crystal Priority",
          ageRange: [9, 10],
          objective: "Compare fractions using models, benchmarks, common denominators, or common numerators.",
          fantasy: "Choose the stronger crystal charge for the next jump.",
          gameVerb: "compare",
          standards: ["CCSS.Math.Content.4.NF.A.2", "UK-NC-Y4-compare-fractions"],
          prerequisites: ["fraction-equivalence"],
          scaffolds: ["benchmark half", "same-whole warning", "strip comparison"],
          misconceptions: ["larger-denominator-bigger", "different-wholes", "benchmark-ignored"],
          questionFamilies: ["compare-same-denominator", "compare-same-numerator", "benchmark-half"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "fraction-add-subtract",
          title: "Fuel Blend",
          ageRange: [10, 11],
          objective: "Add and subtract fractions with like and related denominators using models.",
          fantasy: "Blend fuel safely without overfilling the reactor.",
          gameVerb: "blend",
          standards: ["CCSS.Math.Content.4.NF.B.3", "CCSS.Math.Content.5.NF.A.1"],
          prerequisites: ["fraction-equivalence", "fraction-compare"],
          scaffolds: ["same-denominator tray", "common-denominator strips", "mixed-number tank"],
          misconceptions: ["add-denominators", "missing-common-denominator", "improper-whole-confusion"],
          questionFamilies: ["like-denominator-add", "like-denominator-subtract", "related-denominator-add"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "fraction-boss-frontier-gate",
          title: "Frontier Gate",
          ageRange: [10, 11],
          objective: "Use fraction meaning, equivalence, comparison, and operations in mixed missions.",
          fantasy: "Open the frontier gate by stabilizing fuel, crystals, and territory maps.",
          gameVerb: "stabilize",
          standards: ["CCSS.Math.Content.3.NF", "CCSS.Math.Content.4.NF", "CCSS.Math.Content.5.NF"],
          prerequisites: ["fraction-equal-parts", "fraction-equivalence", "fraction-add-subtract"],
          scaffolds: ["model choice", "benchmark hint", "common-denominator hint"],
          misconceptions: ["unequal-parts", "larger-denominator-bigger", "add-denominators"],
          questionFamilies: ["mixed-fraction-boss", "fraction-story", "fraction-number-line-review"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "decimal-measurement-dockyards",
      title: "Decimal Dockyards",
      strand: "decimalsMeasurement",
      ageRange: [9, 11],
      campaignRole: "Connect decimals, money, rounding, measurement, area, perimeter, and volume.",
      standards: ["CCSS.Math.Content.4.MD", "CCSS.Math.Content.5.NBT", "CCSS.Math.Content.5.MD"],
      rewardTheme: "trade precision, dock construction, and navigation efficiency",
      missions: [
        {
          id: "decimal-place-value",
          title: "Trade Ledger",
          ageRange: [9, 10],
          objective: "Read, compare, and round decimals using place value.",
          fantasy: "Balance interplanetary trade ledgers.",
          gameVerb: "price",
          standards: ["CCSS.Math.Content.5.NBT.A.1", "CCSS.Math.Content.5.NBT.A.3"],
          prerequisites: ["number-rounding-estimation", "fraction-equivalence"],
          scaffolds: ["decimal place chart", "money model", "number line"],
          misconceptions: ["longer-decimal-bigger", "place-name-confusion", "rounding-midpoint"],
          questionFamilies: ["decimal-read", "decimal-compare", "decimal-round"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "decimal-operations",
          title: "Fuel Invoice",
          ageRange: [10, 11],
          objective: "Add and subtract decimals in practical money and measurement contexts.",
          fantasy: "Pay for fuel without shorting the launch reserves.",
          gameVerb: "balance",
          standards: ["CCSS.Math.Content.5.NBT.B.7", "UK-NC-Y5-decimals"],
          prerequisites: ["decimal-place-value", "operation-column-methods"],
          scaffolds: ["decimal alignment grid", "money notation", "estimate check"],
          misconceptions: ["misaligned-decimals", "trailing-zero-confusion", "whole-number-column-habit"],
          questionFamilies: ["decimal-add", "decimal-subtract", "money-change"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "measurement-conversions",
          title: "Cargo Converter",
          ageRange: [9, 11],
          objective: "Convert between common measurement units and solve practical problems.",
          fantasy: "Load cargo using the correct unit system.",
          gameVerb: "convert",
          standards: ["CCSS.Math.Content.4.MD.A.1", "CCSS.Math.Content.5.MD.A.1"],
          prerequisites: ["array-fact-strategies", "decimal-place-value"],
          scaffolds: ["conversion table", "unit ladder", "bigger-smaller unit prompt"],
          misconceptions: ["multiply-vs-divide-conversion", "unit-ignored", "decimal-shift-error"],
          questionFamilies: ["length-conversion", "mass-capacity-conversion", "time-conversion"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "area-perimeter-volume",
          title: "Colony Blueprint",
          ageRange: [10, 11],
          objective: "Choose and calculate perimeter, area, or volume for a construction context.",
          fantasy: "Build biodomes, walls, and storage tanks.",
          gameVerb: "build",
          standards: ["CCSS.Math.Content.4.MD.A.3", "CCSS.Math.Content.5.MD.C.5"],
          prerequisites: ["array-rectangles", "measurement-conversions"],
          scaffolds: ["grid overlay", "formula card", "dimension labels"],
          misconceptions: ["area-perimeter-confusion", "missing-unit-square", "volume-layer-confusion"],
          questionFamilies: ["rectangle-area", "perimeter-route", "volume-layers"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "dockyards-boss-trade-route",
          title: "Dockmaster Trial",
          ageRange: [10, 11],
          objective: "Use decimals and measurement to solve mixed dockyard planning problems.",
          fantasy: "Open a trade route by balancing cost, fuel, cargo, and construction.",
          gameVerb: "manage",
          standards: ["CCSS.Math.Content.5.NBT", "CCSS.Math.Content.5.MD"],
          prerequisites: ["decimal-operations", "measurement-conversions", "area-perimeter-volume"],
          scaffolds: ["unit highlighter", "estimate first", "formula hint"],
          misconceptions: ["unit-ignored", "misaligned-decimals", "area-perimeter-confusion"],
          questionFamilies: ["mixed-decimal-measurement-boss", "dockyard-word-problem", "reasonable-measurement"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "geometry-navigation-grid",
      title: "Geometry Navigation Grid",
      strand: "geometry",
      ageRange: [7, 12],
      campaignRole: "Teach shape properties, angles, symmetry, coordinates, and transformations through navigation.",
      standards: ["CCSS.Math.Content.2.G", "CCSS.Math.Content.4.G", "CCSS.Math.Content.5.G", "CCSS.Math.Content.6.G"],
      rewardTheme: "navigation routes, shield shapes, and map overlays",
      missions: [
        {
          id: "geometry-shape-properties",
          title: "Shield Shapes",
          ageRange: [7, 8],
          objective: "Identify 2-D and 3-D shapes by properties such as sides, faces, vertices, and edges.",
          fantasy: "Choose shield panels by their engineering properties.",
          gameVerb: "identify",
          standards: ["CCSS.Math.Content.2.G.A", "UK-NC-Y2-Y3-geometry"],
          prerequisites: [],
          scaffolds: ["property labels", "rotate shape", "sort by feature"],
          misconceptions: ["name-only-recognition", "orientation-confusion", "face-edge-vertex-confusion"],
          questionFamilies: ["shape-property-sort", "2d-3d-identify", "shape-in-different-orientation"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "geometry-angles-turns",
          title: "Turn Thrusters",
          ageRange: [8, 10],
          objective: "Understand right angles, turns, and angle comparison.",
          fantasy: "Program ship thrusters to rotate safely.",
          gameVerb: "turn",
          standards: ["CCSS.Math.Content.4.G.A.1", "UK-NC-Y3-Y4-angles"],
          prerequisites: ["geometry-shape-properties"],
          scaffolds: ["quarter-turn compass", "right-angle checker", "angle size overlay"],
          misconceptions: ["longer-arm-bigger-angle", "clockwise-confusion", "turn-vs-shape-confusion"],
          questionFamilies: ["right-angle-find", "quarter-half-turn", "compare-angle-size"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "geometry-coordinate-plane",
          title: "Star Coordinates",
          ageRange: [10, 12],
          objective: "Read and plot coordinate points in one or four quadrants depending on placement.",
          fantasy: "Plot rescue beacons on the galactic map.",
          gameVerb: "plot",
          standards: ["CCSS.Math.Content.5.G.A", "CCSS.Math.Content.6.NS.C.6"],
          prerequisites: ["number-line-jumps", "geometry-angles-turns"],
          scaffolds: ["x-before-y chant", "axis highlight", "quadrant labels"],
          misconceptions: ["swap-x-y", "axis-origin-confusion", "negative-coordinate-order"],
          questionFamilies: ["plot-first-quadrant", "read-coordinate", "plot-four-quadrants"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "geometry-symmetry-transform",
          title: "Mirror Gate",
          ageRange: [9, 12],
          objective: "Use symmetry and simple transformations to predict shape positions.",
          fantasy: "Pass through mirror gates without damaging the ship.",
          gameVerb: "reflect",
          standards: ["CCSS.Math.Content.4.G.A.3", "CCSS.Math.Content.6.G.A"],
          prerequisites: ["geometry-coordinate-plane"],
          scaffolds: ["mirror line", "count squares", "before-after overlay"],
          misconceptions: ["slide-vs-reflect", "distance-from-line", "orientation-after-turn"],
          questionFamilies: ["line-symmetry", "reflect-on-grid", "translation-on-grid"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "geometry-boss-navigation-grid",
          title: "Navigation Grid Boss",
          ageRange: [10, 12],
          objective: "Use geometry and coordinate skills to navigate a multi-step route.",
          fantasy: "Pilot through a shield maze using shape, angle, coordinate, and symmetry clues.",
          gameVerb: "pilot",
          standards: ["CCSS.Math.Content.4.G", "CCSS.Math.Content.5.G", "CCSS.Math.Content.6.G"],
          prerequisites: ["geometry-angles-turns", "geometry-coordinate-plane", "geometry-symmetry-transform"],
          scaffolds: ["map overlay", "axis hint", "turn preview"],
          misconceptions: ["swap-x-y", "turn-vs-shape-confusion", "slide-vs-reflect"],
          questionFamilies: ["mixed-geometry-boss", "coordinate-route", "angle-and-shape-puzzle"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "ratio-percent-alliance",
      title: "Ratio Alliance",
      strand: "ratioPercent",
      ageRange: [10, 12],
      campaignRole: "Build proportional reasoning through ratios, unit rates, percentages, and scale.",
      standards: ["CCSS.Math.Content.6.RP", "CCSS.Math.Content.7.RP", "UK-NC-Y6-ratio-proportion"],
      rewardTheme: "alliances, oxygen balance, trade rates, and fleet scaling",
      missions: [
        {
          id: "ratio-meaning",
          title: "Alliance Mix",
          ageRange: [10, 11],
          objective: "Understand a ratio as a comparison between quantities.",
          fantasy: "Balance mixed crews from allied planets.",
          gameVerb: "balance",
          standards: ["CCSS.Math.Content.6.RP.A.1", "UK-NC-Y6-ratio"],
          prerequisites: ["fraction-compare", "division-inverse-facts"],
          scaffolds: ["part-to-part bars", "part-to-whole contrast", "ratio language card"],
          misconceptions: ["part-whole-confusion", "order-of-ratio", "additive-ratio-thinking"],
          questionFamilies: ["write-ratio", "match-ratio-model", "part-part-vs-part-whole"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "ratio-equivalent-tables",
          title: "Trade Table",
          ageRange: [11, 12],
          objective: "Use equivalent ratios and tables to solve proportional problems.",
          fantasy: "Negotiate fair interplanetary trade routes.",
          gameVerb: "trade",
          standards: ["CCSS.Math.Content.6.RP.A.3", "CCSS.Math.Content.7.RP.A.2"],
          prerequisites: ["ratio-meaning", "array-fact-strategies"],
          scaffolds: ["ratio table", "scale factor arrows", "double number line"],
          misconceptions: ["additive-scaling", "wrong-scale-factor", "table-column-swap"],
          questionFamilies: ["equivalent-ratio-table", "double-number-line", "missing-ratio-value"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "percent-benchmarks",
          title: "Oxygen Percent",
          ageRange: [10, 12],
          objective: "Connect benchmark percentages to fractions and decimals.",
          fantasy: "Set oxygen and shield charge levels safely.",
          gameVerb: "calibrate",
          standards: ["CCSS.Math.Content.6.RP.A.3.C", "UK-NC-Y5-Y6-percent"],
          prerequisites: ["decimal-place-value", "fraction-equivalence"],
          scaffolds: ["100-grid", "fraction-decimal-percent card", "benchmark anchors"],
          misconceptions: ["percent-over-100-only", "decimal-percent-shift", "benchmark-confusion"],
          questionFamilies: ["benchmark-percent", "fraction-decimal-percent-match", "percent-of-100"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "percent-of-quantity",
          title: "Shield Charge",
          ageRange: [11, 12],
          objective: "Find percentages of quantities using benchmark and proportional strategies.",
          fantasy: "Calculate shield charge needed for different planets.",
          gameVerb: "charge",
          standards: ["CCSS.Math.Content.6.RP.A.3.C", "CCSS.Math.Content.7.RP.A.3"],
          prerequisites: ["percent-benchmarks", "ratio-equivalent-tables"],
          scaffolds: ["10 percent step", "double number line", "unit rate card"],
          misconceptions: ["percent-as-whole-number", "wrong-base", "additive-percent"],
          questionFamilies: ["ten-percent-strategy", "percent-of-number", "discount-or-increase-context"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "ratio-boss-alliance-council",
          title: "Alliance Council",
          ageRange: [11, 12],
          objective: "Use ratios, rates, and percentages to solve multi-step alliance missions.",
          fantasy: "Win the council vote by proving the fleet plan is fair and safe.",
          gameVerb: "negotiate",
          standards: ["CCSS.Math.Content.6.RP", "CCSS.Math.Content.7.RP"],
          prerequisites: ["ratio-meaning", "ratio-equivalent-tables", "percent-of-quantity"],
          scaffolds: ["table hint", "benchmark hint", "which-whole prompt"],
          misconceptions: ["wrong-base", "additive-scaling", "part-whole-confusion"],
          questionFamilies: ["mixed-ratio-percent-boss", "trade-rate-story", "percent-decision"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "algebra-command",
      title: "Algebra Command",
      strand: "algebra",
      ageRange: [10, 12],
      campaignRole: "Introduce variables, expressions, equations, patterns, and signed values as command logic.",
      standards: ["CCSS.Math.Content.5.OA", "CCSS.Math.Content.6.EE", "CCSS.Math.Content.6.NS"],
      rewardTheme: "automation, command rules, and unknown system values",
      missions: [
        {
          id: "algebra-pattern-rules",
          title: "Command Patterns",
          ageRange: [10, 11],
          objective: "Identify and describe numerical patterns using rules.",
          fantasy: "Program repeating ship commands.",
          gameVerb: "program",
          standards: ["CCSS.Math.Content.5.OA.B.3", "UK-NC-Y5-patterns"],
          prerequisites: ["array-fact-strategies"],
          scaffolds: ["input-output table", "rule choices", "next-step preview"],
          misconceptions: ["additive-vs-multiplicative-rule", "one-step-only", "pattern-start-confusion"],
          questionFamilies: ["continue-pattern", "find-rule", "input-output-table"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "algebra-expressions",
          title: "Unknown Signal",
          ageRange: [11, 12],
          objective: "Represent unknown quantities with variables and evaluate simple expressions.",
          fantasy: "Decode unknown signal strength from command formulas.",
          gameVerb: "decode",
          standards: ["CCSS.Math.Content.6.EE.A.2", "UK-NC-Y6-algebra"],
          prerequisites: ["algebra-pattern-rules", "operation-inverse-relay"],
          scaffolds: ["variable means unknown card", "substitution table", "operation highlight"],
          misconceptions: ["letter-as-label-only", "missing-order", "variable-value-changes-mid-expression"],
          questionFamilies: ["write-expression", "evaluate-expression", "match-story-expression"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "algebra-one-step-equations",
          title: "Equation Lock",
          ageRange: [11, 12],
          objective: "Solve one-step equations using inverse operations.",
          fantasy: "Open equation locks on abandoned stations.",
          gameVerb: "solve",
          standards: ["CCSS.Math.Content.6.EE.B.6", "CCSS.Math.Content.6.EE.B.7"],
          prerequisites: ["algebra-expressions", "operation-inverse-relay"],
          scaffolds: ["balance scale", "inverse operation hint", "check solution"],
          misconceptions: ["do-to-one-side-only", "inverse-operation-choice", "answer-not-checked"],
          questionFamilies: ["one-step-add-sub", "one-step-multiply-divide", "check-equation-solution"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "algebra-negative-zone",
          title: "Negative Zone",
          ageRange: [11, 12],
          objective: "Understand negative numbers in context and on the coordinate plane.",
          fantasy: "Navigate below-zero energy zones and dark-sector coordinates.",
          gameVerb: "stabilize",
          standards: ["CCSS.Math.Content.6.NS.C.5", "CCSS.Math.Content.6.NS.C.6"],
          prerequisites: ["number-line-jumps", "geometry-coordinate-plane"],
          scaffolds: ["vertical number line", "temperature story", "quadrant map"],
          misconceptions: ["negative-bigger-by-distance", "cross-zero-error", "axis-sign-confusion"],
          questionFamilies: ["order-negative-numbers", "integer-context", "coordinate-with-negatives"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "algebra-boss-command-center",
          title: "Command Center",
          ageRange: [11, 12],
          objective: "Use patterns, expressions, equations, and signed values to run command systems.",
          fantasy: "Take command of the fleet automation center.",
          gameVerb: "command",
          standards: ["CCSS.Math.Content.6.EE", "CCSS.Math.Content.6.NS"],
          prerequisites: ["algebra-pattern-rules", "algebra-expressions", "algebra-one-step-equations", "algebra-negative-zone"],
          scaffolds: ["rule table", "balance hint", "number line hint"],
          misconceptions: ["inverse-operation-choice", "letter-as-label-only", "negative-bigger-by-distance"],
          questionFamilies: ["mixed-algebra-boss", "equation-story", "negative-coordinate-route"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "data-observatory",
      title: "Data Observatory",
      strand: "dataStatistics",
      ageRange: [8, 12],
      campaignRole: "Teach graph reading, data summaries, variability, and evidence-based decisions.",
      standards: ["CCSS.Math.Content.3.MD", "CCSS.Math.Content.5.MD", "CCSS.Math.Content.6.SP"],
      rewardTheme: "scan reports, risk prediction, and council decisions",
      missions: [
        {
          id: "data-simple-graphs",
          title: "Scan Reports",
          ageRange: [8, 9],
          objective: "Read pictographs, tally charts, bar charts, and tables.",
          fantasy: "Interpret scanner reports from nearby planets.",
          gameVerb: "read",
          standards: ["CCSS.Math.Content.3.MD.B.3", "UK-NC-Y3-statistics"],
          prerequisites: ["number-compare-and-order"],
          scaffolds: ["axis labels", "category highlight", "counting guide"],
          misconceptions: ["axis-ignored", "category-swap", "scale-ignored"],
          questionFamilies: ["read-bar-chart", "read-pictograph", "table-question"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "data-line-plots",
          title: "Meteor Measurements",
          ageRange: [9, 11],
          objective: "Use line plots and measurement data to answer questions.",
          fantasy: "Analyze meteor sizes before choosing a shield plan.",
          gameVerb: "analyze",
          standards: ["CCSS.Math.Content.4.MD.B.4", "CCSS.Math.Content.5.MD.B.2"],
          prerequisites: ["fraction-number-line", "measurement-conversions"],
          scaffolds: ["plot key", "sum markers", "fraction measurement strip"],
          misconceptions: ["plot-count-vs-value", "scale-ignored", "fraction-measure-confusion"],
          questionFamilies: ["line-plot-read", "line-plot-total", "line-plot-compare"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 3, bossItems: 4, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7] }
        },
        {
          id: "data-mean-median-range",
          title: "Risk Average",
          ageRange: [11, 12],
          objective: "Use mean, median, and range to summarize data.",
          fantasy: "Summarize risk readings before the council vote.",
          gameVerb: "summarize",
          standards: ["CCSS.Math.Content.6.SP.B.5", "UK-NC-KS3-statistics"],
          prerequisites: ["decimal-operations", "data-simple-graphs"],
          scaffolds: ["balance model for mean", "ordered list for median", "max-min range card"],
          misconceptions: ["mean-as-middle", "median-without-ordering", "range-as-list"],
          questionFamilies: ["find-mean", "find-median", "find-range"],
          masteryGate: { minIndependentCorrect: 6, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "data-claims-and-samples",
          title: "Signal Truth",
          ageRange: [11, 12],
          objective: "Judge whether a data claim is supported by the sample and graph.",
          fantasy: "Detect false distress signals and unreliable reports.",
          gameVerb: "verify",
          standards: ["CCSS.Math.Content.6.SP.A", "CCSS.Math.Content.7.SP"],
          prerequisites: ["data-mean-median-range", "ratio-equivalent-tables"],
          scaffolds: ["claim-evidence checklist", "sample-size warning", "graph-scale prompt"],
          misconceptions: ["graph-title-only", "sample-bias-ignored", "scale-manipulation"],
          questionFamilies: ["claim-supported", "sample-quality", "misleading-graph-scale"],
          masteryGate: { minIndependentCorrect: 5, minBossCorrect: 4, bossItems: 5, maxErrorRate: 0.25, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "data-boss-observatory-council",
          title: "Observatory Council",
          ageRange: [11, 12],
          objective: "Use data displays, summaries, and evidence to choose a mission strategy.",
          fantasy: "Advise the Galactic Council using scanner evidence.",
          gameVerb: "advise",
          standards: ["CCSS.Math.Content.6.SP", "CCSS.Math.Practice.MP3"],
          prerequisites: ["data-simple-graphs", "data-mean-median-range", "data-claims-and-samples"],
          scaffolds: ["evidence checklist", "summary hint", "graph-scale hint"],
          misconceptions: ["scale-ignored", "median-without-ordering", "sample-bias-ignored"],
          questionFamilies: ["mixed-data-boss", "choose-supported-claim", "compare-strategy-data"],
          masteryGate: { minIndependentCorrect: 7, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        }
      ]
    },
    {
      id: "galactic-council",
      title: "Galactic Council",
      strand: "mixedCapstone",
      ageRange: [9, 12],
      campaignRole: "Bring multiple strands together in story campaigns and boss arcs.",
      standards: ["CCSS.Math.Practice", "UK-NC-Maths-Aims", "ISO-21001-continual-improvement"],
      rewardTheme: "galaxy restoration and final council membership",
      missions: [
        {
          id: "council-mixed-rescue",
          title: "Mixed Rescue Route",
          ageRange: [9, 12],
          objective: "Choose operations and models across previously secured skills.",
          fantasy: "Rescue a convoy using arithmetic, geometry, and data choices.",
          gameVerb: "rescue",
          standards: ["CCSS.Math.Practice.MP1", "CCSS.Math.Practice.MP2", "UK-NC-problem-solving"],
          prerequisites: ["operation-boss-orbit-defense", "array-boss-swarm-commander", "division-boss-logistics-chief"],
          scaffolds: ["strategy selection", "model choice", "estimate check"],
          misconceptions: ["operation-choice", "extra-information", "model-choice-confusion"],
          questionFamilies: ["mixed-operation-story", "model-selection", "multi-step-rescue"],
          masteryGate: { minIndependentCorrect: 8, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "council-planet-restoration",
          title: "Planet Restoration",
          ageRange: [10, 12],
          objective: "Use fractions, decimals, measurement, and geometry to rebuild a planet.",
          fantasy: "Restore biodomes, trade docks, and navigation grids.",
          gameVerb: "restore",
          standards: ["CCSS.Math.Practice.MP4", "CCSS.Math.Content.5.NF", "CCSS.Math.Content.5.MD"],
          prerequisites: ["fraction-boss-frontier-gate", "dockyards-boss-trade-route", "geometry-boss-navigation-grid"],
          scaffolds: ["project checklist", "unit highlight", "diagram overlay"],
          misconceptions: ["unit-ignored", "area-perimeter-confusion", "add-denominators"],
          questionFamilies: ["restoration-planning", "fraction-measurement-mix", "geometry-construction"],
          masteryGate: { minIndependentCorrect: 8, minBossCorrect: 5, bossItems: 6, maxErrorRate: 0.2, reviewAfterDays: [1, 3, 7, 14] }
        },
        {
          id: "council-final-alliance",
          title: "Final Alliance Campaign",
          ageRange: [11, 12],
          objective: "Use proportional reasoning, algebra, and data to make a defensible strategic plan.",
          fantasy: "Unite the final alliance and defend the galaxy.",
          gameVerb: "unite",
          standards: ["CCSS.Math.Practice.MP3", "CCSS.Math.Content.6.RP", "CCSS.Math.Content.6.EE", "CCSS.Math.Content.6.SP"],
          prerequisites: ["ratio-boss-alliance-council", "algebra-boss-command-center", "data-boss-observatory-council"],
          scaffolds: ["evidence board", "equation hint", "ratio table hint"],
          misconceptions: ["wrong-base", "inverse-operation-choice", "sample-bias-ignored"],
          questionFamilies: ["capstone-ratio-algebra-data", "defend-a-claim", "multi-step-final-boss"],
          masteryGate: { minIndependentCorrect: 9, minBossCorrect: 6, bossItems: 7, maxErrorRate: 0.15, reviewAfterDays: [1, 3, 7, 14, 30] }
        }
      ]
    }
  ]
};

if (typeof window !== "undefined") {
  window.GALACTACIANS_LEARNING_SYSTEM = GALACTACIANS_LEARNING_SYSTEM;
}

if (typeof module !== "undefined") {
  module.exports = GALACTACIANS_LEARNING_SYSTEM;
}
