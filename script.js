const startupParams = new URLSearchParams(window.location.search);
const startupMode = ["campaign", "planet-campaign", "infinite", "practice"].includes(startupParams.get("mode"))
  ? startupParams.get("mode")
  : "planet-campaign";
const startupSkill = ["addition", "subtraction", "multiplication", "division"].includes(startupParams.get("skill"))
  ? startupParams.get("skill")
  : "addition";
const startupAge = Number(startupParams.get("age"));

const state = {
  gameMode: startupMode,
  practiceSkill: startupSkill,
  saveVersion: 2,
  campaignLessonIndex: 0,
  campaignProgressIndex: 0,
  campaignCorrect: 0,
  campaignMistakes: 0,
  campaignComplete: false,
  campaignMapOpen: startupMode === "campaign" || startupMode === "planet-campaign",
  campaignResultOpen: false,
  campaignStars: {},
  campaignStageStats: {
    lessonIndex: 0,
    correct: 0,
    wrong: 0,
    repairs: 0,
    startedAt: 0
  },
  skillMastery: {},
  placement: {
    completed: false,
    recommendedLessonIndex: 0,
    recommendedLessonId: null,
    score: 0,
    attempts: 0,
    correct: 0,
    targetAge: Number.isInteger(startupAge) && startupAge >= 7 && startupAge <= 12 ? startupAge : null,
    completedAt: null,
    skippedLessonIds: []
  },
  baseHp: 100,
  maxBaseHp: 100,
  shield: 20,
  maxShield: 20,
  attack: 10,
  attackSpeed: 1,
  planetRegen: 1,
  shieldRegen: 1,
  targetCount: 1,
  streak: 0,
  bestStreak: 0,
  population: 100,
  correctSincePopulationGain: 0,
  elapsedSec: 0,
  survivalClockSec: 120,
  threatMultiplier: 1,
  godMode: false,
  zombieMode: false,
  zombieDead: false,
  godModeElapsedSec: 0,
  swarmLevel: 1,
  totalUpgrades: 0,
  level: 1,
  savedStreakAtFailure: 0,
  checkpointSnapshot: null,
  checkpointGuard: false,
  checkpointRecoveryAnswers: 0,
  repairBoostSec: 0,
  repairMode: false,
  repairAttempts: 0,
  repairCorrect: 0,
  repairTarget: 3,
  repairQuestion: null,
  safetyModeSec: 0,
  correctSinceSafetyMode: 0,
  tutorialActive: true,
  tutorialPhase: "intro",
  tutorialStepIndex: 0,
  tutorialPauseCombat: true,
  tutorialCalloutVisible: false,
  tutorialDismissAction: null,
  tutorialRequiresAnswer: false,
  tutorialInputLocked: false,
  tutorialHighlightAnswer: false,
  tutorialCalloutTimer: null,
  category: "addition",
  question: null,
  wrongLocks: {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false
  },
  spamLockCategory: null,
  spamUnlockProgress: 0,
  focusCategory: null,
  focusCount: 0,
  enemies: [],
  enemyId: 1,
  lastAttack: 0,
  spawnTimer: 0,
  layoutPrimed: false,
  layoutEditMode: false,
  selectedPanelId: null,
  globalScale: 1,
  theme: "cold-scifi",
  panelScales: {},
  unlockedThemes: ["cold-scifi"],
  questionHistory: {
    addition: [],
    subtraction: [],
    multiplication: [],
    division: []
  },
  upgrades: {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0
  },
  lastBannerMessage: "",
  planetHintIndex: -1
};

const CATEGORY_KEYS = ["addition", "subtraction", "multiplication", "division"];
const REPAIR_QUESTION_CATEGORIES = CATEGORY_KEYS;
const OPENING_WAVE_SIZE = 3;
const BASE_PLANET_HP = 100;
const BASE_PLANET_SHIELD = 20;
const BASE_PLANET_DAMAGE = 10;
const BASE_ATTACK_SPEED = 1;
const BASE_HEALTH_REGEN = 1;
const BASE_SHIELD_REGEN = 1;
const SURVIVAL_BASE_SECONDS = 120;
const CAMPAIGN_SURVIVAL_SECONDS = 180;
const SAFETY_REWARD_SECONDS = 300;
const TUTORIAL_START_SAFETY_SECONDS = 45;
const FIRST_MISSION_TARGET = 50;
const QUESTION_HISTORY_LIMIT = 20;
const GOD_MODE_MULTIPLIER = 50;
const THEME_UNLOCKS = [
  { theme: "cold-scifi", streak: 0 },
  { theme: "solar-gold", streak: 5 },
  { theme: "matrix-grid", streak: 10 },
  { theme: "code-editor", streak: 15 },
  { theme: "cartoon-candy", streak: 20 },
  { theme: "storybook-horror", streak: 25 },
  { theme: "funky-neon", streak: 30 },
  { theme: "metal-forge", streak: 35 },
  { theme: "paper-craft", streak: 40 },
  { theme: "ocean-pop", streak: 45 }
];

const MODE_RULES = {
  campaign: {
    label: "Campaign",
    subtitle: "Learn through scripted missions, mastery gates, and colony restoration.",
    planetStateLabel: "Mission State",
    populationLabel: "Population",
    timerLabel: "Mission Progress",
    countdown: false,
    timerFailure: false,
    combatCanTriggerRepair: false,
    spawnEnemies: true,
    enemyPressureScale: 0.38,
    maxEnemyCap: 12,
    enemyDamageMultiplier: 0.18,
    safetyBaseSeconds: CAMPAIGN_SURVIVAL_SECONDS,
    streakBonusSeconds: 0,
    correctTrustGain: 0,
    lessonTrustGain: 12,
    wrongTrustPenalty: 20,
    repeatedWrongPenalty: 20,
    repairTrustFloor: 60,
    repairTarget: 2
  },
  "planet-campaign": {
    label: "Planet Campaign",
    subtitle: "Planet-first missions where every answer commands the defense grid.",
    planetStateLabel: "Planet Mood",
    populationLabel: "Colony",
    timerLabel: "Mission Charge",
    countdown: false,
    timerFailure: false,
    combatCanTriggerRepair: false,
    spawnEnemies: true,
    enemyPressureScale: 0.28,
    maxEnemyCap: 10,
    enemyDamageMultiplier: 0.12,
    safetyBaseSeconds: CAMPAIGN_SURVIVAL_SECONDS,
    streakBonusSeconds: 0,
    correctTrustGain: 0,
    lessonTrustGain: 14,
    wrongTrustPenalty: 14,
    repeatedWrongPenalty: 18,
    repairTrustFloor: 65,
    repairTarget: 2
  },
  infinite: {
    label: "Infinite Galaxy",
    subtitle: "Endless survival sandbox using mastered, review-due, or generated questions.",
    planetStateLabel: "Planet State",
    populationLabel: "Population",
    timerLabel: "Survival Timer",
    countdown: true,
    timerFailure: true,
    combatCanTriggerRepair: true,
    spawnEnemies: true,
    enemyPressureScale: 1,
    maxEnemyCap: 260,
    enemyDamageMultiplier: 1,
    safetyBaseSeconds: SURVIVAL_BASE_SECONDS,
    streakBonusSeconds: 5,
    correctTrustGain: 20,
    wrongTrustPenalty: 20,
    repairTrustFloor: 50,
    repairTarget: 3
  },
  practice: {
    label: "Practice Lab",
    subtitle: "Low-pressure targeted practice with early hints and no survival failure.",
    planetStateLabel: "Practice State",
    populationLabel: "Confidence",
    timerLabel: "Calm Timer",
    countdown: false,
    timerFailure: false,
    combatCanTriggerRepair: false,
    spawnEnemies: true,
    enemyPressureScale: 0.16,
    maxEnemyCap: 6,
    enemyDamageMultiplier: 0.08,
    safetyBaseSeconds: CAMPAIGN_SURVIVAL_SECONDS,
    streakBonusSeconds: 0,
    correctTrustGain: 5,
    wrongTrustPenalty: 0,
    repairTrustFloor: 75,
    repairTarget: 2
  }
};

const planetHints = [
  "Campaign is the learning route. Correct answers destroy attackers and move the mission forward.",
  "Infinite Galaxy is the endless defense sandbox. Enemies and survival pressure matter there.",
  "In Campaign, wrong answers keep the same question, show a hint, and cost population.",
  "Power, Shield, Drones, and Repair are world systems first. They are not random upgrade buttons in Campaign.",
  "Practice Lab is for low-pressure skill work with early hints.",
  "Secure skills return later through review and can appear inside Infinite Galaxy."
];

let bannerTimer = null;

function getModeRules(mode = state.gameMode) {
  return MODE_RULES[mode] || MODE_RULES.campaign;
}

function isCampaignMode() {
  return state.gameMode === "campaign" || state.gameMode === "planet-campaign";
}

function isPlanetCampaignMode() {
  return state.gameMode === "planet-campaign";
}

function isInfiniteMode() {
  return state.gameMode === "infinite";
}

function isPracticeMode() {
  return state.gameMode === "practice";
}

const enemyTemplates = {
  diver: {
    name: "Diver",
    family: "minion",
    className: "enemy-diver",
    baseHp: 20,
    speed: 16,
    contactDamage: 6,
    damageMode: "normal",
    holdProgress: null,
    orbitSpeed: 0,
    rangedCooldown: 0,
    rangedDamage: 0,
    projectileClass: "enemy",
    targetPriority: 3
  },
  breaker: {
    name: "Shield Breaker",
    family: "minion",
    className: "enemy-breaker",
    baseHp: 22,
    speed: 11,
    contactDamage: 5,
    damageMode: "shield_break",
    holdProgress: 74,
    orbitSpeed: 0.38,
    rangedCooldown: 2.2,
    rangedDamage: 3,
    projectileClass: "enemy",
    targetPriority: 0
  },
  ranger: {
    name: "Ranger",
    family: "minion",
    className: "enemy-ranger",
    baseHp: 18,
    speed: 8,
    contactDamage: 0,
    damageMode: "normal",
    holdProgress: 38,
    orbitSpeed: 0.24,
    rangedCooldown: 2.3,
    rangedDamage: 4,
    projectileClass: "enemy",
    targetPriority: 2
  },
  melee: {
    name: "Melee",
    family: "minion",
    className: "enemy-melee",
    baseHp: 20,
    speed: 12,
    contactDamage: 0,
    damageMode: "surface_only",
    holdProgress: 88,
    orbitSpeed: -0.5,
    rangedCooldown: 1.9,
    rangedDamage: 4,
    projectileClass: "enemy-laser",
    targetPriority: 1
  },
  boss: {
    name: "Boss",
    family: "boss",
    className: "enemy-boss",
    baseHp: 70,
    speed: 7,
    contactDamage: 10,
    damageMode: "normal",
    holdProgress: 56,
    orbitSpeed: 0.2,
    rangedCooldown: 1.7,
    rangedDamage: 6,
    projectileClass: "enemy-laser",
    targetPriority: 4
  }
};

const categoryEffects = {
  addition: {
    feedback: "Addition makes your attacks stronger."
  },
  subtraction: {
    feedback: "Subtraction makes the Planet's max shield and health bigger."
  },
  multiplication: {
    feedback: "Multiplication lets the Planet hit more enemies."
  },
  division: {
    feedback: "Division helps the Planet heal and rebuild shield over time."
  }
};

const q = (prompt, answer, visual = "") => ({ prompt, answer, visual });

const fallbackCampaignLessons = [
  {
    galaxy: "Addition Galaxy",
    title: "Count All",
    goal: "Put two tiny groups together and count every item.",
    teaching: "Adding means joining groups. Count the first group, then keep counting the next group.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 5,
    hint: "Count every dot from both groups.",
    questionPool: [
      q("● + ● = ?", 2),
      q("●● + ● = ?", 3),
      q("● + ●● = ?", 3),
      q("●● + ●● = ?", 4),
      q("●●● + ● = ?", 4),
      q("●● + ●●● = ?", 5)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Add 1 More",
    goal: "Learn that adding 1 gives the next number.",
    teaching: "When you add 1, move one step forward on the number path.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 6,
    hint: "Say the first number, then say the next number.",
    questionPool: [
      q("1 + 1 = ?", 2),
      q("2 + 1 = ?", 3),
      q("3 + 1 = ?", 4),
      q("4 + 1 = ?", 5),
      q("5 + 1 = ?", 6),
      q("6 + 1 = ?", 7)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Add 2 More",
    goal: "Count two steps forward.",
    teaching: "Adding 2 means count forward twice.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 6,
    hint: "Count two jumps: 4 + 2 means 5, 6.",
    questionPool: [
      q("1 + 2 = ?", 3),
      q("2 + 2 = ?", 4),
      q("3 + 2 = ?", 5),
      q("4 + 2 = ?", 6),
      q("5 + 2 = ?", 7),
      q("6 + 2 = ?", 8)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Make 5",
    goal: "Learn pairs that make 5.",
    teaching: "Number pairs can make a target. Today the target is 5.",
    reward: "Faster Shots",
    rewardCategory: "multiplication",
    targetCorrect: 5,
    hint: "Think: what number joins this one to make 5?",
    questionPool: [
      q("1 + ? = 5", 4),
      q("2 + ? = 5", 3),
      q("3 + ? = 5", 2),
      q("4 + ? = 5", 1),
      q("? + 0 = 5", 5)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Add To 10",
    goal: "Practice addition facts with answers up to 10.",
    teaching: "Small facts become fast when you see patterns.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 8,
    hint: "Start with the bigger number and count up.",
    questionPool: [
      q("3 + 3 = ?", 6),
      q("4 + 2 = ?", 6),
      q("5 + 3 = ?", 8),
      q("6 + 2 = ?", 8),
      q("7 + 1 = ?", 8),
      q("4 + 5 = ?", 9),
      q("8 + 2 = ?", 10),
      q("6 + 4 = ?", 10)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Make 10",
    goal: "Learn friendly pairs that make 10.",
    teaching: "Making 10 is a powerful strategy for bigger addition.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 7,
    hint: "Pairs like 6 and 4 make 10.",
    questionPool: [
      q("1 + ? = 10", 9),
      q("2 + ? = 10", 8),
      q("3 + ? = 10", 7),
      q("4 + ? = 10", 6),
      q("5 + ? = 10", 5),
      q("6 + ? = 10", 4),
      q("7 + ? = 10", 3)
    ]
  },
  {
    galaxy: "Addition Galaxy",
    title: "Add To 20",
    goal: "Use count-on and make-10 facts to add up to 20.",
    teaching: "Bigger addition is easier when you break it into friendly parts.",
    reward: "Planet Power",
    rewardCategory: "addition",
    targetCorrect: 8,
    hint: "Try making 10 first, then add what is left.",
    questionPool: [
      q("9 + 2 = ?", 11),
      q("8 + 5 = ?", 13),
      q("7 + 6 = ?", 13),
      q("10 + 4 = ?", 14),
      q("12 + 3 = ?", 15),
      q("9 + 8 = ?", 17),
      q("11 + 7 = ?", 18),
      q("13 + 6 = ?", 19)
    ]
  },
  {
    galaxy: "Subtraction Galaxy",
    title: "Take Away 1",
    goal: "Subtract 1 by moving one step back.",
    teaching: "Subtraction can mean taking away. Taking 1 away gives the number before.",
    reward: "Shield",
    rewardCategory: "subtraction",
    targetCorrect: 6,
    hint: "Move one number backward.",
    questionPool: [
      q("2 - 1 = ?", 1),
      q("3 - 1 = ?", 2),
      q("4 - 1 = ?", 3),
      q("5 - 1 = ?", 4),
      q("6 - 1 = ?", 5),
      q("7 - 1 = ?", 6)
    ]
  },
  {
    galaxy: "Subtraction Galaxy",
    title: "Take Away 2",
    goal: "Count back two steps.",
    teaching: "Taking away 2 means count backward twice.",
    reward: "Shield",
    rewardCategory: "subtraction",
    targetCorrect: 6,
    hint: "Count back two jumps.",
    questionPool: [
      q("3 - 2 = ?", 1),
      q("4 - 2 = ?", 2),
      q("5 - 2 = ?", 3),
      q("6 - 2 = ?", 4),
      q("7 - 2 = ?", 5),
      q("8 - 2 = ?", 6)
    ]
  },
  {
    galaxy: "Subtraction Galaxy",
    title: "Subtract Within 10",
    goal: "Use subtraction facts with numbers up to 10.",
    teaching: "You can count back, or think about the missing part.",
    reward: "Bigger Shield",
    rewardCategory: "subtraction",
    targetCorrect: 8,
    hint: "Start at the first number and count back.",
    questionPool: [
      q("5 - 3 = ?", 2),
      q("6 - 4 = ?", 2),
      q("7 - 2 = ?", 5),
      q("8 - 3 = ?", 5),
      q("9 - 4 = ?", 5),
      q("10 - 5 = ?", 5),
      q("10 - 7 = ?", 3),
      q("9 - 6 = ?", 3)
    ]
  },
  {
    galaxy: "Subtraction Galaxy",
    title: "Missing Parts",
    goal: "Find the missing part in a subtraction story.",
    teaching: "Subtraction and addition are connected. If 6 + ? = 10, then 10 - 6 = ?.",
    reward: "Shield",
    rewardCategory: "subtraction",
    targetCorrect: 7,
    hint: "Ask: what number completes the total?",
    questionPool: [
      q("6 + ? = 10", 4),
      q("7 + ? = 10", 3),
      q("8 + ? = 12", 4),
      q("5 + ? = 11", 6),
      q("9 + ? = 15", 6),
      q("12 - 8 = ?", 4),
      q("14 - 9 = ?", 5)
    ]
  },
  {
    galaxy: "Subtraction Galaxy",
    title: "Subtract Within 20",
    goal: "Subtract from teen numbers.",
    teaching: "Break a teen number into 10 and some more.",
    reward: "Bigger Shield",
    rewardCategory: "subtraction",
    targetCorrect: 8,
    hint: "Use 10 as a friendly stopping point.",
    questionPool: [
      q("12 - 2 = ?", 10),
      q("13 - 3 = ?", 10),
      q("14 - 5 = ?", 9),
      q("15 - 6 = ?", 9),
      q("16 - 8 = ?", 8),
      q("17 - 9 = ?", 8),
      q("18 - 10 = ?", 8),
      q("20 - 7 = ?", 13)
    ]
  },
  {
    galaxy: "Multiplication Galaxy",
    title: "Equal Groups",
    goal: "See multiplication as equal groups.",
    teaching: "Equal groups are groups with the same amount in each group.",
    reward: "Multishot",
    rewardCategory: "multiplication",
    targetCorrect: 6,
    hint: "Add the same number again and again.",
    questionPool: [
      q("2 groups of 2 = ?", 4),
      q("3 groups of 2 = ?", 6),
      q("4 groups of 2 = ?", 8),
      q("2 groups of 3 = ?", 6),
      q("3 groups of 3 = ?", 9),
      q("4 groups of 3 = ?", 12)
    ]
  },
  {
    galaxy: "Multiplication Galaxy",
    title: "Repeated Addition",
    goal: "Connect repeated addition to multiplication.",
    teaching: "Multiplication is a faster way to write equal additions.",
    reward: "Multishot",
    rewardCategory: "multiplication",
    targetCorrect: 6,
    hint: "Count each equal group.",
    questionPool: [
      q("2 + 2 + 2 = ?", 6),
      q("3 + 3 + 3 = ?", 9),
      q("4 + 4 = ?", 8),
      q("5 + 5 + 5 = ?", 15),
      q("2 × 4 = ?", 8),
      q("3 × 4 = ?", 12)
    ]
  },
  {
    galaxy: "Multiplication Galaxy",
    title: "Twos",
    goal: "Practice the 2 times table.",
    teaching: "The 2 times table is skip-counting by 2.",
    reward: "More Targets",
    rewardCategory: "multiplication",
    targetCorrect: 8,
    hint: "Skip-count: 2, 4, 6, 8...",
    questionPool: [
      q("2 × 1 = ?", 2),
      q("2 × 2 = ?", 4),
      q("2 × 3 = ?", 6),
      q("2 × 4 = ?", 8),
      q("2 × 5 = ?", 10),
      q("2 × 6 = ?", 12),
      q("2 × 7 = ?", 14),
      q("2 × 8 = ?", 16)
    ]
  },
  {
    galaxy: "Multiplication Galaxy",
    title: "Fives And Tens",
    goal: "Practice the easiest skip-counting tables.",
    teaching: "Fives end in 5 or 0. Tens end in 0.",
    reward: "Attack Speed",
    rewardCategory: "multiplication",
    targetCorrect: 8,
    hint: "Skip-count by 5 or 10.",
    questionPool: [
      q("5 × 1 = ?", 5),
      q("5 × 2 = ?", 10),
      q("5 × 3 = ?", 15),
      q("5 × 4 = ?", 20),
      q("10 × 1 = ?", 10),
      q("10 × 2 = ?", 20),
      q("10 × 3 = ?", 30),
      q("10 × 4 = ?", 40)
    ]
  },
  {
    galaxy: "Division Galaxy",
    title: "Share Equally",
    goal: "Learn division as fair sharing.",
    teaching: "Division can mean sharing a total into equal groups.",
    reward: "Regen",
    rewardCategory: "division",
    targetCorrect: 6,
    hint: "Share the total fairly into each group.",
    questionPool: [
      q("4 shared by 2 = ?", 2),
      q("6 shared by 2 = ?", 3),
      q("8 shared by 2 = ?", 4),
      q("10 shared by 2 = ?", 5),
      q("6 shared by 3 = ?", 2),
      q("9 shared by 3 = ?", 3)
    ]
  },
  {
    galaxy: "Division Galaxy",
    title: "Divide By 2",
    goal: "Practice sharing into 2 equal groups.",
    teaching: "Dividing by 2 means split into two equal groups.",
    reward: "Health Regen",
    rewardCategory: "division",
    targetCorrect: 7,
    hint: "What number goes in each of the 2 groups?",
    questionPool: [
      q("2 ÷ 2 = ?", 1),
      q("4 ÷ 2 = ?", 2),
      q("6 ÷ 2 = ?", 3),
      q("8 ÷ 2 = ?", 4),
      q("10 ÷ 2 = ?", 5),
      q("12 ÷ 2 = ?", 6),
      q("14 ÷ 2 = ?", 7)
    ]
  },
  {
    galaxy: "Division Galaxy",
    title: "Divide By 5 And 10",
    goal: "Use the 5 and 10 facts backwards.",
    teaching: "Division and multiplication undo each other.",
    reward: "Shield Regen",
    rewardCategory: "division",
    targetCorrect: 8,
    hint: "Ask which multiplication fact matches the division.",
    questionPool: [
      q("10 ÷ 5 = ?", 2),
      q("15 ÷ 5 = ?", 3),
      q("20 ÷ 5 = ?", 4),
      q("25 ÷ 5 = ?", 5),
      q("10 ÷ 10 = ?", 1),
      q("20 ÷ 10 = ?", 2),
      q("30 ÷ 10 = ?", 3),
      q("40 ÷ 10 = ?", 4)
    ]
  },
  {
    galaxy: "Review Galaxy",
    title: "Addition And Subtraction Review",
    goal: "Review the first two operation families.",
    teaching: "Look at the sign first. Plus joins. Minus takes away.",
    reward: "Population Safety",
    rewardCategory: "subtraction",
    targetCorrect: 8,
    hint: "Use the sign to choose add or subtract.",
    questionPool: [
      q("7 + 3 = ?", 10),
      q("8 + 5 = ?", 13),
      q("10 - 4 = ?", 6),
      q("12 - 5 = ?", 7),
      q("6 + ? = 10", 4),
      q("15 - 6 = ?", 9),
      q("9 + 8 = ?", 17),
      q("20 - 7 = ?", 13)
    ]
  },
  {
    galaxy: "Review Galaxy",
    title: "Multiplication And Division Review",
    goal: "Review equal groups and fair sharing.",
    teaching: "Multiplication builds equal groups. Division shares them back out.",
    reward: "Planet Level",
    rewardCategory: "multiplication",
    targetCorrect: 8,
    hint: "Think about equal groups.",
    questionPool: [
      q("2 × 6 = ?", 12),
      q("5 × 4 = ?", 20),
      q("10 × 3 = ?", 30),
      q("12 ÷ 2 = ?", 6),
      q("20 ÷ 5 = ?", 4),
      q("30 ÷ 10 = ?", 3),
      q("3 groups of 4 = ?", 12),
      q("15 shared by 5 = ?", 3)
    ]
  },
  {
    galaxy: "Final Mastery Galaxy",
    title: "Final Planet Defense",
    goal: "Use all four operations to finish the first campaign.",
    teaching: "Check the operation, solve carefully, and defend the Planet.",
    reward: "Campaign Badge",
    rewardCategory: "addition",
    targetCorrect: 10,
    hint: "Pause, read the sign, then solve.",
    questionPool: [
      q("8 + 7 = ?", 15),
      q("16 - 9 = ?", 7),
      q("2 × 8 = ?", 16),
      q("20 ÷ 5 = ?", 4),
      q("6 + ? = 10", 4),
      q("3 groups of 5 = ?", 15),
      q("18 ÷ 2 = ?", 9),
      q("13 + 6 = ?", 19),
      q("20 - 8 = ?", 12),
      q("10 × 4 = ?", 40)
    ]
  }
];

function compileCampaignLessons() {
  const compiler = window.GALACTACIANS_CURRICULUM_COMPILER;
  const learningSystem = window.GALACTACIANS_LEARNING_SYSTEM;
  if (!compiler || !learningSystem) {
    return fallbackCampaignLessons;
  }

  const compiled = compiler.compileLearningSystemToLessons(learningSystem);
  if (!Array.isArray(compiled) || compiled.length === 0) {
    return fallbackCampaignLessons;
  }

  return compiled.filter((lesson) => lesson.strand !== "placement");
}

const campaignLessons = compileCampaignLessons();

const tutorialStepsByMode = {
  campaign: [
    {
      title: "Campaign",
      message: "Campaign is the main learning game. Every mission teaches one idea, checks mastery, and restores the colony."
    },
    {
      title: "Defend With Answers",
      message: "Correct answers destroy attackers. Wrong answers keep the same question, cost population, and reveal a hint."
    },
    {
      title: "Repair Means Support",
      message: "If mistakes repeat, a repair mission opens. It is a guided learning step, not a punishment."
    },
    {
      title: "Master The Route",
      message: "Complete missions to unlock galaxies, schedule review, and bring the route back to life."
    }
  ],
  infinite: [
    {
      title: "Infinite Galaxy",
      message: "This is the endless defense lab. The Planet shoots by itself when enemies get close."
    },
    {
      title: "Choose A Power",
      message: "Pick a math power on the left, then answer on the right to upgrade it."
    },
    {
      title: "Four Upgrades",
      message: "Power hits harder. Shield gives more health. Multishot hits more enemies. Regen heals the Planet."
    },
    {
      title: "Endless Practice",
      message: "Enemies keep scaling forever. Use this mode for practice, testing, and sandbox play."
    }
  ],
  practice: [
    {
      title: "Practice Lab",
      message: "This mode lets you train one math skill without survival pressure."
    },
    {
      title: "Hints First",
      message: "Wrong answers keep the same question and show a hint, so you can learn before moving on."
    },
    {
      title: "Safe Practice",
      message: "Correct answers still charge the Planet, but the goal is calm practice, not finishing the campaign."
    }
  ]
};

const ui = {
  menuToggleBtn: document.getElementById("menu-toggle-btn"),
  menuPanel: document.getElementById("menu-panel"),
  menuCloseBtn: document.getElementById("menu-close-btn"),
  menuTabs: Array.from(document.querySelectorAll(".menu-tab")),
  menuSections: Array.from(document.querySelectorAll(".menu-section")),
  upgradeConsole: document.querySelector('[data-panel="upgrade-console"]'),
  answerConsole: document.querySelector('[data-panel="answer-console"]'),
  answerOptions: document.getElementById("answer-options"),
  lessonPanelLabel: document.getElementById("lesson-panel-label"),
  lessonPanelSubtitle: document.getElementById("lesson-panel-subtitle"),
  campaignPanel: document.getElementById("campaign-panel"),
  planetCampaignRoute: document.getElementById("planet-campaign-route"),
  planetCampaignCommand: document.getElementById("planet-campaign-command"),
  campaignGalaxyLabel: document.getElementById("campaign-galaxy-label"),
  campaignLessonTitle: document.getElementById("campaign-lesson-title"),
  campaignLessonGoal: document.getElementById("campaign-lesson-goal"),
  campaignAgeTag: document.getElementById("campaign-age-tag"),
  campaignStandardTag: document.getElementById("campaign-standard-tag"),
  campaignSupportTag: document.getElementById("campaign-support-tag"),
  campaignLessonMeter: document.getElementById("campaign-lesson-meter"),
  campaignLessonProgress: document.getElementById("campaign-lesson-progress"),
  campaignTeachingHint: document.getElementById("campaign-teaching-hint"),
  campaignMasteryEvidence: document.getElementById("campaign-mastery-evidence"),
  campaignRewardText: document.getElementById("campaign-reward-text"),
  answerPanelLabel: document.getElementById("answer-panel-label"),
  answerPanelSubtitle: document.getElementById("answer-panel-subtitle"),
  tutorialMission: document.getElementById("tutorial-mission"),
  tutorialMissionCopy: document.getElementById("tutorial-mission-copy"),
  missionAddition: document.getElementById("mission-addition"),
  missionSubtraction: document.getElementById("mission-subtraction"),
  missionMultiplication: document.getElementById("mission-multiplication"),
  missionDivision: document.getElementById("mission-division"),
  missionTitleText: document.getElementById("mission-title-text"),
  missionCopyText: document.getElementById("mission-copy-text"),
  missionMenuLabelA: document.getElementById("mission-menu-label-a"),
  missionMenuLabelB: document.getElementById("mission-menu-label-b"),
  missionMenuLabelC: document.getElementById("mission-menu-label-c"),
  missionMenuLabelD: document.getElementById("mission-menu-label-d"),
  missionMenuAddition: document.getElementById("mission-menu-addition"),
  missionMenuSubtraction: document.getElementById("mission-menu-subtraction"),
  missionMenuMultiplication: document.getElementById("mission-menu-multiplication"),
  missionMenuDivision: document.getElementById("mission-menu-division"),
  missionStatusText: document.getElementById("mission-status-text"),
  themeProgressText: document.getElementById("theme-progress-text"),
  archiveStatusText: document.getElementById("archive-status-text"),
  level: document.getElementById("level-value"),
  planetStateLabel: document.getElementById("planet-state-label"),
  planetState: document.getElementById("planet-state-text"),
  populationStatusLabel: document.getElementById("population-status-label"),
  timerStatusLabel: document.getElementById("timer-status-label"),
  attack: document.getElementById("attack-value"),
  regen: document.getElementById("regen-value"),
  speed: document.getElementById("speed-value"),
  targetCount: document.getElementById("target-count-value"),
  survivalTimer: document.getElementById("survival-timer-text"),
  maxShieldLive: document.getElementById("max-shield-live"),
  populationLive: document.getElementById("population-live-text"),
  enemyField: document.getElementById("enemy-field"),
  projectileLayer: document.getElementById("projectile-layer"),
  planetCoreBtn: document.getElementById("planet-core-btn"),
  rewardTowerArt: document.getElementById("reward-tower-art"),
  shieldRing: document.getElementById("shield-ring"),
  systemBanner: document.getElementById("system-banner"),
  tutorialOverlay: document.getElementById("tutorial-overlay"),
  tutorialHighlight: document.getElementById("tutorial-highlight"),
  tutorialCallout: document.getElementById("tutorial-callout"),
  tutorialCalloutLabel: document.getElementById("tutorial-callout-label"),
  tutorialCalloutTitle: document.getElementById("tutorial-callout-title"),
  tutorialCalloutCopy: document.getElementById("tutorial-callout-copy"),
  tutorialCalloutHint: document.querySelector(".tutorial-callout-hint"),
  questionText: document.getElementById("question-text"),
  answerOptionButtons: Array.from(document.querySelectorAll("#answer-options .answer-option")),
  globalScaleInput: document.getElementById("global-scale-input"),
  panelScaleInput: document.getElementById("panel-scale-input"),
  layoutEditBtn: document.getElementById("layout-edit-btn"),
  layoutResetBtn: document.getElementById("layout-reset-btn"),
  godModeBtn: document.getElementById("god-mode-btn"),
  zombieModeBtn: document.getElementById("zombie-mode-btn"),
  swarmModeBtn: document.getElementById("swarm-mode-btn"),
  repairPanel: document.getElementById("repair-panel"),
  repairCopy: document.getElementById("repair-copy"),
  repairQuestionText: document.getElementById("repair-question-text"),
  repairAnswerOptions: document.getElementById("repair-answer-options"),
  repairAnswerOptionButtons: Array.from(document.querySelectorAll(".repair-answer-option")),
  repairProgressText: document.getElementById("repair-progress-text"),
  maxShieldStat: document.getElementById("max-shield-stat"),
  populationStat: document.getElementById("population-stat"),
  checkpointStat: document.getElementById("checkpoint-stat"),
  bestStreakStat: document.getElementById("best-streak-stat"),
  additionUpgradeText: document.getElementById("addition-upgrade-text"),
  subtractionUpgradeText: document.getElementById("subtraction-upgrade-text"),
  multiplicationUpgradeText: document.getElementById("multiplication-upgrade-text"),
  divisionUpgradeText: document.getElementById("division-upgrade-text"),
  themeButtons: Array.from(document.querySelectorAll(".theme-button")),
  categoryButtons: Array.from(document.querySelectorAll(".category-button")),
  campaignMap: document.getElementById("campaign-map"),
  campaignMapTitle: document.querySelector(".campaign-map-head h1"),
  campaignMapSummary: document.getElementById("campaign-map-summary"),
  campaignMapTrack: document.getElementById("campaign-map-track"),
  campaignMapRoute: document.getElementById("campaign-map-route"),
  campaignMapNodes: document.getElementById("campaign-map-nodes"),
  campaignResultPanel: document.getElementById("campaign-result-panel"),
  campaignResultTitle: document.getElementById("campaign-result-title"),
  campaignResultStars: document.getElementById("campaign-result-stars"),
  campaignResultFeedback: document.getElementById("campaign-result-feedback"),
  campaignResultLearning: document.getElementById("campaign-result-learning"),
  campaignResultCorrect: document.getElementById("campaign-result-correct"),
  campaignResultWrong: document.getElementById("campaign-result-wrong"),
  campaignResultPopulation: document.getElementById("campaign-result-population"),
  campaignResultMapBtn: document.getElementById("campaign-result-map-btn"),
  campaignResultNextBtn: document.getElementById("campaign-result-next-btn"),
  movablePanels: Array.from(document.querySelectorAll("[data-panel]")).filter((node) => node.id !== "menu-toggle")
};

const enemyNodes = new Map();
const SAVE_KEY = "planet-math-defense-save";
const SAVE_VERSION = 2;
const CAMPAIGN_SOURCE_VERSION = window.GALACTACIANS_LEARNING_SYSTEM?.version || "fallback";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatClock(totalSeconds) {
  const clamped = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function shuffleArray(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function sanitizePlacement(savedPlacement) {
  const placement = savedPlacement && typeof savedPlacement === "object" ? savedPlacement : {};
  const startupTargetAge = Number.isInteger(startupAge) && startupAge >= 7 && startupAge <= 12 ? startupAge : null;
  const targetAge = startupTargetAge || (
    Number.isInteger(placement.targetAge) && placement.targetAge >= 7 && placement.targetAge <= 12
      ? placement.targetAge
      : state.placement.targetAge
  );

  return {
    completed: placement.completed === true,
    recommendedLessonIndex: Number.isFinite(placement.recommendedLessonIndex)
      ? clamp(Math.floor(placement.recommendedLessonIndex), 0, campaignLessons.length - 1)
      : 0,
    recommendedLessonId: typeof placement.recommendedLessonId === "string" ? placement.recommendedLessonId : null,
    score: Number.isFinite(placement.score) ? clamp(placement.score, 0, 1) : 0,
    attempts: Number.isFinite(placement.attempts) ? Math.max(0, Math.floor(placement.attempts)) : 0,
    correct: Number.isFinite(placement.correct) ? Math.max(0, Math.floor(placement.correct)) : 0,
    targetAge,
    completedAt: typeof placement.completedAt === "number" ? placement.completedAt : null,
    skippedLessonIds: Array.isArray(placement.skippedLessonIds)
      ? placement.skippedLessonIds.filter((id) => typeof id === "string")
      : []
  };
}

function sanitizeSkillMastery(savedMastery) {
  if (!savedMastery || typeof savedMastery !== "object") {
    return {};
  }

  const allowedStates = new Set(["new", "introduced", "guided", "practicing", "secure", "mastered", "review_due", "needs_support"]);
  return Object.entries(savedMastery).reduce((records, [skillId, record]) => {
    if (!record || typeof record !== "object") {
      return records;
    }

    records[skillId] = {
      state: allowedStates.has(record.state) ? record.state : "new",
      attempts: Number.isFinite(record.attempts) ? Math.max(0, Math.floor(record.attempts)) : 0,
      correct: Number.isFinite(record.correct) ? Math.max(0, Math.floor(record.correct)) : 0,
      mistakes: Number.isFinite(record.mistakes) ? Math.max(0, Math.floor(record.mistakes)) : 0,
      currentStreak: Number.isFinite(record.currentStreak) ? Math.max(0, Math.floor(record.currentStreak)) : 0,
      reviewIndex: Number.isFinite(record.reviewIndex) ? Math.max(0, Math.floor(record.reviewIndex)) : 0,
      lastAttemptAt: typeof record.lastAttemptAt === "number" ? record.lastAttemptAt : null,
      completedAt: typeof record.completedAt === "number" ? record.completedAt : null,
      nextReviewAt: typeof record.nextReviewAt === "number" ? record.nextReviewAt : null,
      misconceptionCounts: record.misconceptionCounts && typeof record.misconceptionCounts === "object"
        ? record.misconceptionCounts
        : {}
    };
    return records;
  }, {});
}

function sanitizeCampaignStars(savedStars) {
  if (!savedStars || typeof savedStars !== "object") {
    return {};
  }

  return Object.entries(savedStars).reduce((stars, [lessonId, value]) => {
    const rating = Math.floor(Number(value));
    if (typeof lessonId === "string" && rating >= 1 && rating <= 3) {
      stars[lessonId] = rating;
    }
    return stars;
  }, {});
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw);
    state.saveVersion = Number.isFinite(saved.saveVersion) ? saved.saveVersion : 1;
    if (Number.isFinite(saved.bestStreak)) {
      state.bestStreak = Math.max(state.bestStreak, saved.bestStreak);
    }
    if (Array.isArray(saved.unlockedThemes)) {
      const knownThemes = THEME_UNLOCKS.map((unlock) => unlock.theme);
      state.unlockedThemes = Array.from(new Set(["cold-scifi", ...saved.unlockedThemes.filter((theme) => knownThemes.includes(theme))]));
    }
    if (saved.theme && state.unlockedThemes.includes(saved.theme)) {
      state.theme = saved.theme;
    }
    if (Number.isFinite(saved.campaignLessonIndex)) {
      state.campaignLessonIndex = clamp(Math.floor(saved.campaignLessonIndex), 0, campaignLessons.length - 1);
      state.campaignProgressIndex = state.campaignLessonIndex;
    }
    if (saved.campaignComplete === true) {
      state.campaignComplete = true;
      state.campaignLessonIndex = campaignLessons.length - 1;
      state.campaignProgressIndex = campaignLessons.length - 1;
    }
    state.skillMastery = sanitizeSkillMastery(saved.skillMastery);
    state.campaignStars = sanitizeCampaignStars(saved.campaignStars);
    state.placement = sanitizePlacement(saved.placement);
    updateReviewDueStates();
  } catch {
    state.unlockedThemes = ["cold-scifi"];
    state.skillMastery = {};
    state.campaignStars = {};
    state.placement = sanitizePlacement(null);
  }
}

function saveProgress() {
  try {
    const existing = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "{}");
    const saveLessonIndex = isCampaignMode()
      ? Math.max(state.campaignProgressIndex, state.campaignComplete ? campaignLessons.length - 1 : 0)
      : state.campaignLessonIndex;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...existing,
      saveVersion: SAVE_VERSION,
      campaignSourceVersion: CAMPAIGN_SOURCE_VERSION,
      campaignLessonCount: campaignLessons.length,
      bestStreak: state.bestStreak,
      unlockedThemes: state.unlockedThemes,
      theme: state.theme,
      campaignLessonIndex: saveLessonIndex,
      campaignComplete: state.campaignComplete,
      campaignStars: state.campaignStars,
      skillMastery: state.skillMastery,
      placement: state.placement
    }));
  } catch {
    // Progress saving is optional in this browser prototype.
  }
}

function syncThemeUnlocks() {
  const unlocked = new Set(state.unlockedThemes);
  THEME_UNLOCKS.forEach((unlock) => {
    if (state.bestStreak >= unlock.streak) {
      unlocked.add(unlock.theme);
    }
  });
  state.unlockedThemes = Array.from(unlocked);
  saveProgress();
}

function getArenaMetrics() {
  const bounds = ui.enemyField.getBoundingClientRect();
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;
  const outerRadius = Math.min(bounds.width, bounds.height) * 0.47;
  const innerRadius = Math.min(bounds.width, bounds.height) * 0.16;
  return { bounds, centerX, centerY, outerRadius, innerRadius };
}

function getAttackRangeRadius(metrics = getArenaMetrics()) {
  return Math.min(metrics.outerRadius * 0.88, metrics.innerRadius * 10);
}

function positionTutorialCallout() {
  // The tutorial card is centered on purpose. Avoid anchoring it to moving UI,
  // because those pointers broke on different screen sizes.
}

function showTutorialCallout({ title, message, onDismiss = null, pauseCombat = true, label = "Tutorial", hint = "Tap to continue" }) {
  state.tutorialPauseCombat = pauseCombat;
  state.tutorialCalloutVisible = true;
  state.tutorialInputLocked = true;
  state.tutorialDismissAction = onDismiss;
  state.tutorialRequiresAnswer = false;
  ui.tutorialCalloutLabel.textContent = label;
  ui.tutorialCalloutTitle.textContent = title;
  ui.tutorialCalloutCopy.textContent = message;
  ui.tutorialCalloutHint.textContent = hint;
  ui.tutorialOverlay.classList.remove("hidden");
}

function clearTutorialCalloutTimer() {
  if (state.tutorialCalloutTimer) {
    window.clearTimeout(state.tutorialCalloutTimer);
    state.tutorialCalloutTimer = null;
  }
}

function skipTutorialForGodMode() {
  clearTutorialCalloutTimer();
  state.tutorialActive = false;
  state.tutorialPhase = "complete";
  state.tutorialStepIndex = getTutorialSteps().length;
  state.tutorialPauseCombat = false;
  state.tutorialCalloutVisible = false;
  state.tutorialDismissAction = null;
  state.tutorialRequiresAnswer = false;
  state.tutorialInputLocked = false;
  state.tutorialHighlightAnswer = false;
  ui.tutorialOverlay.classList.add("hidden");
  ui.tutorialMission.classList.add("hidden");
}

function getTutorialSteps() {
  return tutorialStepsByMode[state.gameMode] || tutorialStepsByMode.campaign;
}

function hideTutorialCallout() {
  state.tutorialCalloutVisible = false;
  state.tutorialInputLocked = false;
  state.tutorialDismissAction = null;
  state.tutorialRequiresAnswer = false;
  state.tutorialHighlightAnswer = false;
  ui.tutorialOverlay.classList.add("hidden");
}

function showTutorialStep() {
  const steps = getTutorialSteps();
  const step = steps[state.tutorialStepIndex];
  if (!step) {
    finishTutorial();
    return;
  }

  showTutorialCallout({
    title: step.title,
    message: step.message,
    label: `Tutorial ${state.tutorialStepIndex + 1}/${steps.length}`,
    hint: state.tutorialStepIndex === steps.length - 1 ? "Tap to start" : "Tap to continue",
    pauseCombat: true
  });
}

function startTutorial() {
  if (state.godMode) {
    skipTutorialForGodMode();
    return;
  }

  clearTutorialCalloutTimer();
  state.tutorialActive = true;
  state.tutorialPhase = "intro";
  state.tutorialStepIndex = 0;
  state.tutorialPauseCombat = true;
  state.tutorialHighlightAnswer = false;
  ui.tutorialMission.classList.add("hidden");
  showTutorialStep();
}

function finishTutorial() {
  clearTutorialCalloutTimer();
  state.tutorialActive = false;
  state.tutorialPhase = "complete";
  state.tutorialStepIndex = getTutorialSteps().length;
  state.tutorialPauseCombat = false;
  hideTutorialCallout();
  state.correctSinceSafetyMode = 0;
  state.safetyModeSec = TUTORIAL_START_SAFETY_SECONDS;
  state.survivalClockSec = Math.max(state.survivalClockSec, getSafetyResetSeconds());
  setBanner(isCampaignMode()
    ? "Start the mission. Correct answers fill the lesson meter."
    : "Start with any math path. Correct answers upgrade the Planet.");
  updateUi();
}

function dismissTutorialCallout() {
  if (!state.tutorialCalloutVisible) {
    return;
  }

  if (state.tutorialActive && state.tutorialPhase === "intro") {
    const steps = getTutorialSteps();
    state.tutorialStepIndex += 1;
    if (state.tutorialStepIndex >= steps.length) {
      finishTutorial();
    } else {
      showTutorialStep();
    }
    updateUi();
    return;
  }

  const dismissAction = state.tutorialDismissAction;
  hideTutorialCallout();
  state.tutorialPauseCombat = false;
  updateUi();
}

function isTutorialLossPhase() {
  return false;
}

function isCombatPaused() {
  return state.repairMode || state.tutorialPauseCombat || state.campaignMapOpen || state.campaignResultOpen;
}

function getForcedTutorialCategory() {
  return null;
}

function getPlanetState() {
  if (isCampaignMode()) {
    if (state.repairMode) {
      return "Repair Mission";
    }
    if (state.campaignComplete) {
      return "Campaign Complete";
    }
    const record = ensureSkillMastery(getCurrentLesson());
    if (record.state === "needs_support") {
      return "Needs Support";
    }
    if (record.state === "review_due") {
      return "Review Due";
    }
    if (state.population < 45) {
      return "Population Low";
    }
    return "Mission Active";
  }

  if (isPracticeMode()) {
    return state.repairMode ? "Guided Repair" : "Practice Active";
  }

  if (state.zombieDead) {
    return "Dead";
  }
  if (state.repairMode || state.baseHp <= 0) {
    return "Needs Repair";
  }

  return `Danger ${getDangerLevel()}/5`;
}

function getDangerLevel() {
  if (state.godMode) {
    return 1;
  }

  if (isCampaignMode()) {
    const populationRisk = 1 - clamp(state.population / 100, 0, 1);
    const mistakeRisk = clamp(state.campaignMistakes / 3, 0, 1);
    const supportRisk = ensureSkillMastery(getCurrentLesson()).state === "needs_support" ? 0.85 : 0;
    return clamp(1 + Math.floor(Math.max(populationRisk, mistakeRisk, supportRisk) * 5), 1, 5);
  }

  if (isPracticeMode()) {
    return state.population < 45 ? 3 : 1;
  }

  const timerRisk = state.safetyModeSec > 0 ? 0 : 1 - clamp(state.survivalClockSec / SURVIVAL_BASE_SECONDS, 0, 1);
  const populationRisk = 1 - clamp(state.population / 100, 0, 1);
  const hpRatio = state.maxBaseHp === 0 ? 0 : state.baseHp / state.maxBaseHp;
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  const bodyRisk = 1 - clamp((hpRatio * 0.7) + (shieldRatio * 0.3), 0, 1);
  const pressureRisk = getPressureRatio();
  const combinedRisk = Math.max(timerRisk, populationRisk * 0.9, bodyRisk * 0.75, pressureRisk * 0.8);
  return clamp(1 + Math.floor(combinedRisk * 5), 1, 5);
}

function getDangerColor(level) {
  if (level <= 2) {
    return "var(--green)";
  }
  if (level <= 4) {
    return "var(--gold)";
  }
  return "var(--red)";
}

function getCheckpointLevel() {
  if (!state.checkpointSnapshot) {
    return 0;
  }

  return 1 + Object.values(state.checkpointSnapshot.upgrades).reduce((sum, value) => sum + value, 0);
}

function nextRepairQuestion() {
  if (isCampaignMode()) {
    state.repairQuestion = buildCampaignQuestion(getCurrentLesson());
  } else {
    const kind = REPAIR_QUESTION_CATEGORIES[randomInt(0, REPAIR_QUESTION_CATEGORIES.length - 1)];
    state.repairQuestion = getQuestion(kind, { easy: true });
  }
  state.repairQuestion.options = buildAnswerOptions(state.repairQuestion);
  ui.repairQuestionText.textContent = state.repairQuestion.prompt;
  renderRepairAnswerOptions();
}

function cloneUpgrades() {
  return {
    addition: state.upgrades.addition,
    subtraction: state.upgrades.subtraction,
    multiplication: state.upgrades.multiplication,
    division: state.upgrades.division
  };
}

function createEmptyQuestionHistory() {
  return {
    addition: [],
    subtraction: [],
    multiplication: [],
    division: []
  };
}

function getLessonSkillId(lesson) {
  return lesson.id || `${lesson.galaxy}:${lesson.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getLessonBySkillId(skillId) {
  return campaignLessons.find((lesson) => getLessonSkillId(lesson) === skillId);
}

function getDefaultSkillRecord() {
  return {
    state: "new",
    attempts: 0,
    correct: 0,
    mistakes: 0,
    currentStreak: 0,
    reviewIndex: 0,
    lastAttemptAt: null,
    completedAt: null,
    nextReviewAt: null,
    misconceptionCounts: {}
  };
}

function ensureSkillMastery(lesson) {
  const skillId = getLessonSkillId(lesson);
  if (!state.skillMastery[skillId]) {
    state.skillMastery[skillId] = getDefaultSkillRecord();
  }
  return state.skillMastery[skillId];
}

function getReviewDelayMs(lesson, record) {
  const days = lesson.reviewAfterDays || lesson.masteryGate?.reviewAfterDays || [1, 3, 7, 14];
  const dayCount = days[Math.min(record.reviewIndex, days.length - 1)] || 1;
  return dayCount * 24 * 60 * 60 * 1000;
}

function scheduleSkillReview(lesson, record) {
  record.nextReviewAt = Date.now() + getReviewDelayMs(lesson, record);
  record.reviewIndex += 1;
}

function updateReviewDueStates() {
  const now = Date.now();
  Object.entries(state.skillMastery).forEach(([skillId, record]) => {
    if (!record.nextReviewAt || record.nextReviewAt > now) {
      return;
    }
    if (record.state === "secure" || record.state === "mastered") {
      record.state = "review_due";
      const lesson = getLessonBySkillId(skillId);
      if (lesson) {
        scheduleSkillReview(lesson, record);
      }
    }
  });
}

function recordPlacementAttempt(lesson, correct) {
  if (lesson.strand !== "placement") {
    return;
  }
  state.placement.attempts += 1;
  if (correct) {
    state.placement.correct += 1;
  }
  state.placement.score = state.placement.attempts === 0 ? 0 : state.placement.correct / state.placement.attempts;
}

function recordSkillAttempt(lesson, correct) {
  const record = ensureSkillMastery(lesson);
  record.attempts += 1;
  record.lastAttemptAt = Date.now();

  if (correct) {
    record.correct += 1;
    record.currentStreak += 1;
    if (record.state === "new") {
      record.state = "introduced";
    } else if (record.state === "introduced" || record.state === "needs_support") {
      record.state = "guided";
    } else if (record.state === "guided" && record.currentStreak >= 3) {
      record.state = "practicing";
    } else if (record.state === "review_due" && record.currentStreak >= 3) {
      record.state = "mastered";
      scheduleSkillReview(lesson, record);
    }
  } else {
    record.mistakes += 1;
    record.currentStreak = 0;
    const misconception = lesson.misconceptions?.[0] || "unknown";
    record.misconceptionCounts[misconception] = (record.misconceptionCounts[misconception] || 0) + 1;
    if (record.misconceptionCounts[misconception] >= 2) {
      record.state = "needs_support";
    } else if (record.state === "new") {
      record.state = "introduced";
    }
  }

  recordPlacementAttempt(lesson, correct);
  saveProgress();
}

function markSkillSecure(lesson) {
  const record = ensureSkillMastery(lesson);
  record.state = record.state === "review_due" ? "mastered" : "secure";
  record.completedAt = Date.now();
  record.currentStreak = 0;
  scheduleSkillReview(lesson, record);
  saveProgress();
}

function getSecureSkillCount() {
  return Object.values(state.skillMastery).filter((record) => (
    record.state === "secure" || record.state === "mastered" || record.state === "review_due"
  )).length;
}

function getCampaignPlanetName(lesson, index) {
  if (lesson.galaxy.includes("Number Sense")) {
    return ["Crateon", "Signalor", "Lineara", "Roundara"][index % 4];
  }
  if (lesson.galaxy.includes("Operation")) {
    return ["Addara", "Shieldon", "Inversia", "Columnis"][index % 4];
  }
  if (lesson.galaxy.includes("Array") || lesson.galaxy.includes("Multiplication")) {
    return ["Arraya", "Factora", "Droneos", "Gridon"][index % 4];
  }
  if (lesson.galaxy.includes("Division")) {
    return ["Shareon", "Rema", "Faira", "Podora"][index % 4];
  }
  if (lesson.galaxy.includes("Fraction")) {
    return ["Halvia", "Equiva", "Stripon", "Mixara"][index % 4];
  }
  if (lesson.galaxy.includes("Geometry")) {
    return ["Vertexa", "Anglon", "Coordia", "Mirroris"][index % 4];
  }
  return ["Novara", "Orbitis", "Caldera", "Astrion"][index % 4];
}

function getCampaignUnlockedIndex() {
  if (isPlanetCampaignMode()) {
    const entries = getCampaignMapEntries();
    const firstUnsaved = entries.find((entry) => {
      const lessonId = getLessonSkillId(entry.lesson);
      return !state.campaignStars[lessonId];
    });
    return firstUnsaved ? firstUnsaved.index : entries[entries.length - 1]?.index || 0;
  }
  if (state.campaignComplete) {
    return campaignLessons.length - 1;
  }
  return clamp(state.campaignProgressIndex, 0, campaignLessons.length - 1);
}

function getSelectedCampaignAge() {
  const age = state.placement.targetAge;
  return Number.isInteger(age) && age >= 7 && age <= 12 ? age : null;
}

function lessonMatchesSelectedAge(lesson, age = getSelectedCampaignAge()) {
  if (!age || !Array.isArray(lesson.ageRange) || lesson.ageRange.length !== 2) {
    return true;
  }
  return lesson.ageRange[0] <= age && age <= lesson.ageRange[1];
}

function getCampaignMapEntries() {
  const allEntries = campaignLessons.map((lesson, index) => ({ lesson, index }));
  if (!isPlanetCampaignMode()) {
    return allEntries;
  }
  const compiler = window.GALACTACIANS_CURRICULUM_COMPILER;
  if (compiler && typeof compiler.getPlanetCampaignLessons === "function") {
    const orderedLessons = compiler.getPlanetCampaignLessons(campaignLessons, getSelectedCampaignAge());
    const orderedEntries = orderedLessons
      .map((lesson) => ({ lesson, index: campaignLessons.indexOf(lesson) }))
      .filter((entry) => entry.index >= 0);
    return orderedEntries.length > 0 ? orderedEntries : allEntries;
  }
  const ageEntries = allEntries.filter((entry) => lessonMatchesSelectedAge(entry.lesson));
  return ageEntries.length > 0 ? ageEntries : allEntries;
}

function getPlanetCampaignPathLabel() {
  const age = getSelectedCampaignAge();
  return age ? `Age ${age} planet route` : "Planet-first route";
}

function isCampaignLessonUnlocked(index) {
  if (!isPlanetCampaignMode()) {
    const lesson = campaignLessons[index];
    const lessonId = lesson ? getLessonSkillId(lesson) : null;
    return lesson && (index <= getCampaignUnlockedIndex() || state.campaignStars[lessonId] > 0);
  }

  const entries = getCampaignMapEntries();
  const displayIndex = entries.findIndex((entry) => entry.index === index);
  if (displayIndex === -1) {
    return false;
  }
  const firstUnsavedIndex = entries.findIndex((entry) => !state.campaignStars[getLessonSkillId(entry.lesson)]);
  return firstUnsavedIndex === -1 || displayIndex <= firstUnsavedIndex || state.campaignStars[getLessonSkillId(entries[displayIndex].lesson)] > 0;
}

function getCampaignNodePoints(entries = getCampaignMapEntries()) {
  const xCycle = isPlanetCampaignMode() ? [22, 42, 64, 78, 56, 34] : [12, 34, 66, 86, 58, 28];
  const startY = isPlanetCampaignMode() ? 120 : 92;
  const gapY = isPlanetCampaignMode() ? 132 : 92;
  return entries.map((entry, index) => ({
    x: xCycle[index % xCycle.length],
    y: startY + index * gapY
  }));
}

function getCampaignStarText(stars) {
  return [0, 1, 2].map((index) => index < stars ? "★" : "☆").join("");
}

function truncateLearningText(value, maxLength = 34) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function formatAgeRange(ageRange) {
  if (Array.isArray(ageRange) && ageRange.length === 2) {
    return `Ages ${ageRange[0]}-${ageRange[1]}`;
  }
  return "Ages 7-12";
}

function formatLearningTag(value, fallback) {
  const text = String(value || fallback)
    .replace(/^CCSS\.Math\.Content\./, "CCSS ")
    .replace(/^UK-NC-/, "UK NC ")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return truncateLearningText(text, 30);
}

function formatStandardTag(lesson) {
  const standard = Array.isArray(lesson.standards) ? lesson.standards[0] : null;
  return formatLearningTag(standard, "Standard path");
}

function formatSupportTag(lesson) {
  const scaffold = Array.isArray(lesson.scaffolds) ? lesson.scaffolds[0] : null;
  return formatLearningTag(scaffold, "Hint support");
}

function getMasteryTarget(lesson) {
  const gate = lesson.masteryGate || {};
  return gate.minIndependentCorrect || lesson.targetCorrect || 5;
}

function formatReviewSchedule(lesson) {
  const days = lesson.reviewAfterDays || lesson.masteryGate?.reviewAfterDays;
  if (Array.isArray(days) && days.length > 0) {
    return `${days.join("/")}-day review`;
  }
  return "spaced review";
}

function getMasteryEvidenceText(lesson) {
  return `Mastery: ${getMasteryTarget(lesson)} independent correct, hints after errors, ${formatReviewSchedule(lesson)}.`;
}

function getResultLearningText(lesson, stats, stars) {
  const objective = truncateLearningText(lesson.goal, 72);
  const supportCount = stats.wrong === 1 ? "1 support moment" : `${stats.wrong} support moments`;
  return `Objective: ${objective} Evidence: ${stats.correct}/${lesson.targetCorrect} correct, ${supportCount}, ${stars}/3 stars.`;
}

function getCampaignStageStatsDefault(lessonIndex = state.campaignLessonIndex) {
  return {
    lessonIndex,
    correct: 0,
    wrong: 0,
    repairs: 0,
    startedAt: Date.now()
  };
}

function applyCampaignStageStrength(index) {
  const lesson = campaignLessons[index] || campaignLessons[0];
  const stage = Math.max(0, index);
  const baseline = {
    addition: Math.floor(stage * 0.75),
    subtraction: Math.floor(stage * 0.55),
    multiplication: Math.floor(stage * 0.45),
    division: Math.floor(stage * 0.45)
  };

  baseline[lesson.rewardCategory] += 1 + Math.floor(stage / 5);
  getCategories().forEach((category) => {
    state.upgrades[category] = Math.max(state.upgrades[category], baseline[category]);
  });
  recalculatePlanetStats();
  state.baseHp = state.maxBaseHp;
  state.shield = state.maxShield;
}

function buildCampaignRoutePath(points) {
  if (points.length === 0) {
    return "";
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    const previous = points[index - 1];
    const midY = (previous.y + point.y) / 2;
    const wave = index % 2 === 0 ? 18 : -18;
    return `${path} C ${previous.x + wave} ${midY - 24}, ${point.x - wave} ${midY + 24}, ${point.x} ${point.y}`;
  }, "");
}

function getCampaignRoutePoints(points, mapWidth) {
  const safeWidth = Number.isFinite(mapWidth) && mapWidth > 0 ? mapWidth : 1000;
  return points.map((point) => ({
    x: (point.x / 100) * safeWidth,
    y: point.y
  }));
}

function renderCampaignMap() {
  if (!ui.campaignMapNodes || !ui.campaignMapRoute || !ui.campaignMapTrack) {
    return;
  }

  const entries = getCampaignMapEntries();
  const unlockedIndex = getCampaignUnlockedIndex();
  const points = getCampaignNodePoints(entries);
  const mapHeight = points.length === 0 ? 320 : points[points.length - 1].y + 120;
  const mapWidth = Math.max(320, Math.round(ui.campaignMapTrack.clientWidth || ui.campaignMapTrack.getBoundingClientRect().width || 1000));
  const routePoints = getCampaignRoutePoints(points, mapWidth);
  const secureCount = Object.values(state.campaignStars).filter((stars) => stars > 0).length;

  ui.campaignMapTrack.style.height = `${mapHeight}px`;
  ui.campaignMapRoute.setAttribute("viewBox", `0 0 ${mapWidth} ${mapHeight}`);
  ui.campaignMapRoute.setAttribute("preserveAspectRatio", "xMidYMin meet");
  ui.campaignMapRoute.innerHTML = "";
  const routePath = buildCampaignRoutePath(routePoints);
  ["route-glow", "route-ribbon", "route-stripe", "route-sparkle"].forEach((className) => {
    const route = document.createElementNS("http://www.w3.org/2000/svg", "path");
    route.setAttribute("class", className);
    route.setAttribute("d", routePath);
    ui.campaignMapRoute.appendChild(route);
  });
  ui.campaignMapNodes.innerHTML = "";
  if (ui.campaignMapTitle) {
    ui.campaignMapTitle.textContent = isPlanetCampaignMode() ? "Planet Campaign" : "Save The Math Galaxy";
  }
  const unlockedDisplayIndex = Math.max(0, entries.findIndex((entry) => entry.index === unlockedIndex));
  ui.campaignMapSummary.textContent = state.campaignComplete
    ? `All ${campaignLessons.length} planets saved. Replay any planet for stars.`
    : isPlanetCampaignMode()
      ? `${getPlanetCampaignPathLabel()}: planet ${unlockedDisplayIndex + 1} of ${entries.length} is ready. ${secureCount} planets saved.`
      : `Planet ${unlockedIndex + 1} of ${campaignLessons.length} is ready. ${secureCount} planets saved.`;

  entries.forEach(({ lesson, index }, displayIndex) => {
    const lessonId = getLessonSkillId(lesson);
    const stars = state.campaignStars[lessonId] || 0;
    const isUnlocked = isCampaignLessonUnlocked(index);
    const isCurrent = !state.campaignComplete && index === unlockedIndex;
    const button = document.createElement("button");
    button.className = `campaign-map-node planet-art-${displayIndex % 6}`;
    button.type = "button";
    button.disabled = !isUnlocked;
    button.classList.toggle("is-current", isCurrent);
    button.classList.toggle("is-saved", stars > 0);
    button.classList.toggle("is-locked", !isUnlocked);
    button.style.left = `${points[displayIndex].x}%`;
    button.style.top = `${points[displayIndex].y}px`;
    button.dataset.lessonIndex = String(index);
    button.setAttribute("aria-label", `${lesson.title}, ${formatAgeRange(lesson.ageRange)}, ${isUnlocked ? "available" : "locked"}`);
    button.style.setProperty("--node-hue", `${(displayIndex * 47 + 190) % 360}deg`);
    button.innerHTML = `
      <span class="map-planet-orb"></span>
      <span class="map-node-index">${isPlanetCampaignMode() ? displayIndex + 1 : index + 1}</span>
      <strong>${getCampaignPlanetName(lesson, index)}</strong>
      <small>${lesson.title}</small>
      ${isPlanetCampaignMode() ? `<em>${lesson.reward}</em>` : ""}
      <span class="map-stars" aria-hidden="true">${getCampaignStarText(stars)}</span>
    `;
    button.addEventListener("click", () => startCampaignMapLesson(index));
    ui.campaignMapNodes.appendChild(button);
  });
}

function openCampaignMap({ remember = true } = {}) {
  if (!isCampaignMode()) {
    return;
  }

  state.campaignMapOpen = true;
  state.campaignResultOpen = false;
  state.repairMode = false;
  state.tutorialActive = false;
  state.tutorialPauseCombat = false;
  state.tutorialCalloutVisible = false;
  state.tutorialInputLocked = false;
  ui.tutorialOverlay.classList.add("hidden");
  ui.repairPanel.classList.add("hidden");
  ui.campaignResultPanel.classList.add("hidden");
  ui.campaignMap.classList.remove("hidden");
  document.body.classList.add("campaign-map-open");
  document.body.classList.remove("campaign-result-open");
  renderCampaignMap();
  if (remember) {
    setBanner("Choose the next planet on the Campaign map.", { remember: false });
  }
  updateUi();
}

function closeCampaignMap() {
  state.campaignMapOpen = false;
  ui.campaignMap.classList.add("hidden");
  document.body.classList.remove("campaign-map-open");
}

function startCampaignMapLesson(index) {
  const unlockedIndex = getCampaignUnlockedIndex();
  const lesson = campaignLessons[index];
  const lessonId = lesson ? getLessonSkillId(lesson) : null;
  const isUnlocked = lesson && isCampaignLessonUnlocked(index);
  if (!isUnlocked) {
    ui.campaignMapSummary.textContent = "Save the connected planets before jumping ahead.";
    return;
  }

  state.campaignProgressIndex = isPlanetCampaignMode()
    ? Math.max(state.campaignProgressIndex, index)
    : Math.max(state.campaignProgressIndex, unlockedIndex);
  state.campaignLessonIndex = index;
  state.campaignCorrect = 0;
  state.campaignMistakes = 0;
  state.campaignStageStats = getCampaignStageStatsDefault(index);
  state.population = Math.max(state.population, 80);
  state.repairMode = false;
  state.zombieDead = false;
  state.enemies = [];
  state.spawnTimer = 0;
  applyCampaignStageStrength(index);
  closeCampaignMap();
  spawnOpeningWave();
  setCategory(lesson.rewardCategory);
  nextQuestion();
  setBanner(`Planet ${getCampaignPlanetName(lesson, index)} is under attack. Save it with math.`);
  saveProgress();
  updateUi();
}

function calculateCampaignStars(stats) {
  if (stats.wrong === 0 && stats.repairs === 0 && state.population >= 90) {
    return 3;
  }
  if (stats.wrong <= 2 && stats.repairs === 0 && state.population >= 55) {
    return 2;
  }
  return 1;
}

function getCampaignResultFeedback(stars, stats) {
  if (stars === 3) {
    return `Clean save: ${stats.correct} correct and no wrong answers. Perfect 3-star planet.`;
  }
  if (stars === 2) {
    return `Good save: ${stats.correct} correct with ${stats.wrong} wrong. Review the hint once and try for 3 stars later.`;
  }
  return `Planet saved. You finished the mission, but ${stats.wrong} wrong answer${stats.wrong === 1 ? "" : "s"} cost population. Replay for a cleaner save.`;
}

function showCampaignResult(completedIndex, lesson, stars) {
  const stats = state.campaignStageStats;
  state.campaignResultOpen = true;
  state.campaignMapOpen = false;
  ui.campaignMap.classList.add("hidden");
  ui.campaignResultPanel.classList.remove("hidden");
  document.body.classList.remove("campaign-map-open");
  document.body.classList.add("campaign-result-open");
  ui.campaignResultTitle.textContent = `You saved ${getCampaignPlanetName(lesson, completedIndex)}`;
  ui.campaignResultStars.textContent = getCampaignStarText(stars);
  ui.campaignResultFeedback.textContent = getCampaignResultFeedback(stars, stats);
  ui.campaignResultLearning.textContent = getResultLearningText(lesson, stats, stars);
  ui.campaignResultCorrect.textContent = String(stats.correct);
  ui.campaignResultWrong.textContent = String(stats.wrong);
  ui.campaignResultPopulation.textContent = `${state.population}%`;
  ui.campaignResultNextBtn.disabled = state.campaignComplete;
  ui.campaignResultNextBtn.textContent = state.campaignComplete ? "Campaign Complete" : "Next Planet";
  updateUi();
}

function closeCampaignResult() {
  state.campaignResultOpen = false;
  ui.campaignResultPanel.classList.add("hidden");
  document.body.classList.remove("campaign-result-open");
}

function captureCheckpointSnapshot() {
  state.checkpointSnapshot = {
    elapsedSec: state.elapsedSec,
    survivalClockSec: state.survivalClockSec,
    upgrades: cloneUpgrades(),
    bestStreak: state.bestStreak
  };
}

function downgradeHighestUpgrade() {
  const category = getCategories()
    .sort((a, b) => state.upgrades[b] - state.upgrades[a])[0];

  if (state.upgrades[category] > 0) {
    state.upgrades[category] -= 1;
    return true;
  }
  return false;
}

function applyLevelRollback(amount) {
  let remaining = amount;
  while (remaining > 0) {
    const changed = downgradeHighestUpgrade();
    if (!changed) {
      break;
    }
    remaining -= 1;
  }

  state.focusCategory = null;
  state.focusCount = 0;
  state.spamLockCategory = null;
  state.spamUnlockProgress = 0;
  recalculatePlanetStats();
}

function applyCheckpointState(populationPercent, fillRatio, guardActive = true) {
  state.population = populationPercent;
  state.baseHp = Math.round(state.maxBaseHp * fillRatio);
  state.shield = Math.round(state.maxShield * fillRatio);
  state.zombieDead = false;
  state.streak = Math.floor(state.savedStreakAtFailure * fillRatio);
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.correctSincePopulationGain = 0;
  state.checkpointGuard = guardActive;
  state.checkpointRecoveryAnswers = guardActive ? 0 : state.checkpointRecoveryAnswers;
}

function openRepairMode(reason) {
  if (state.repairMode) {
    return;
  }

  const rules = getModeRules();
  state.repairMode = true;
  if (isCampaignMode()) {
    state.campaignStageStats.repairs += 1;
  }
  state.repairAttempts = 0;
  state.repairCorrect = 0;
  state.repairTarget = rules.repairTarget;
  ui.repairPanel.classList.remove("hidden");
  ui.repairProgressText.textContent = `0 of ${state.repairTarget} correct`;
  if (isCampaignMode()) {
    ui.repairCopy.textContent = reason === "learning"
      ? `Mission support is open. Answer ${state.repairTarget} guided questions to restore population and keep learning.`
      : `The colony needs a calm repair check. Answer ${state.repairTarget} guided questions to stabilize the mission.`;
  } else if (isPracticeMode()) {
    ui.repairCopy.textContent = `Practice repair is open. Answer ${state.repairTarget} guided questions to rebuild confidence.`;
  } else {
    ui.repairCopy.textContent = reason === "population"
      ? "Population reached 0%. Answer 3 easy questions to save your streak and recover the Planet."
      : "The Planet broke under attack. Answer 3 easy questions to save your streak and recover the Planet.";
  }
  nextRepairQuestion();
  setBanner(isCampaignMode()
    ? "Repair mission ready. This is support, not punishment."
    : "Checkpoint lesson ready. Save the Planet's streak.");
}

function resetCategoryLocks() {
  state.wrongLocks = {
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false
  };
  state.spamLockCategory = null;
  state.spamUnlockProgress = 0;
  state.focusCategory = null;
  state.focusCount = 0;
}

function isRepairBoostActive() {
  return state.repairBoostSec > 0;
}

function getRepairBoostMultiplier() {
  return isRepairBoostActive() ? 10 : 1;
}

function getGodModeMultiplier() {
  if (!state.godMode) {
    return 1;
  }
  return GOD_MODE_MULTIPLIER;
}

function getSwarmCountMultiplier() {
  return state.swarmLevel;
}

function getSwarmStatMultiplier() {
  return 1 / state.swarmLevel;
}

function spawnOpeningWave() {
  for (let i = 0; i < OPENING_WAVE_SIZE; i += 1) {
    spawnEnemy();
  }
}

function captureFailureStreak() {
  state.savedStreakAtFailure = Math.max(state.savedStreakAtFailure, state.streak);
}

function resetToCheckpoint() {
  if (state.checkpointSnapshot) {
    state.elapsedSec = state.checkpointSnapshot.elapsedSec;
    state.survivalClockSec = state.checkpointSnapshot.survivalClockSec;
    state.upgrades = {
      addition: state.checkpointSnapshot.upgrades.addition,
      subtraction: state.checkpointSnapshot.upgrades.subtraction,
      multiplication: state.checkpointSnapshot.upgrades.multiplication,
      division: state.checkpointSnapshot.upgrades.division
    };
    state.bestStreak = Math.max(state.bestStreak, state.checkpointSnapshot.bestStreak);
    state.repairMode = false;
    state.repairAttempts = 0;
    state.repairCorrect = 0;
    state.zombieDead = false;
    state.question = null;
    state.questionHistory = createEmptyQuestionHistory();
    state.safetyModeSec = 0;
    state.correctSinceSafetyMode = 0;
    resetCategoryLocks();
    state.repairBoostSec = 0;
    state.lastAttack = 0;
    recalculatePlanetStats();
    applyCheckpointState(40, 0.5);
    setCategory("addition");
    return;
  }

  state.baseHp = BASE_PLANET_HP;
  state.maxBaseHp = BASE_PLANET_HP;
  state.shield = BASE_PLANET_SHIELD;
  state.maxShield = BASE_PLANET_SHIELD;
  state.attack = BASE_PLANET_DAMAGE;
  state.attackSpeed = BASE_ATTACK_SPEED;
  state.planetRegen = BASE_HEALTH_REGEN;
  state.shieldRegen = BASE_SHIELD_REGEN;
  state.targetCount = 1;
  state.streak = 0;
  state.bestStreak = Math.max(state.bestStreak, 0);
  state.population = 100;
  state.correctSincePopulationGain = 0;
  state.elapsedSec = 0;
  state.survivalClockSec = getSafetyResetSeconds();
  state.threatMultiplier = 1;
  state.totalUpgrades = 0;
  state.level = 1;
  state.savedStreakAtFailure = 0;
  state.checkpointSnapshot = null;
  state.checkpointGuard = false;
  state.checkpointRecoveryAnswers = 0;
  state.repairMode = false;
  state.repairAttempts = 0;
  state.repairCorrect = 0;
  state.repairBoostSec = 0;
  state.zombieDead = false;
  state.godModeElapsedSec = 0;
  state.swarmLevel = 1;
  state.repairQuestion = null;
  state.safetyModeSec = 0;
  state.correctSinceSafetyMode = 0;
  state.category = "addition";
  state.question = null;
  state.questionHistory = createEmptyQuestionHistory();
  resetCategoryLocks();
  state.lastAttack = 0;
  state.upgrades = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0
  };

  recalculatePlanetStats();
  setCategory("addition");
}

function setBanner(message, options = {}) {
  const { remember = true } = options;
  if (remember) {
    state.lastBannerMessage = message;
    state.planetHintIndex = -1;
  }
  ui.systemBanner.textContent = message;
  ui.systemBanner.classList.add("visible");

  if (bannerTimer) {
    window.clearTimeout(bannerTimer);
  }
  bannerTimer = window.setTimeout(() => {
    ui.systemBanner.classList.remove("visible");
  }, 3000);
}

function setMenuTab(tabName) {
  ui.menuTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.menuTab === tabName);
  });
  ui.menuSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.menuSection === tabName);
  });
}

function applyTheme(themeName) {
  if (!isThemeUnlocked(themeName)) {
    const unlock = getThemeUnlock(themeName);
    setBanner(`Locked. Reach a best streak of ${unlock.streak} to unlock this theme.`, { remember: false });
    return false;
  }
  state.theme = themeName;
  document.body.dataset.theme = themeName;
  ui.themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });
  saveProgress();
  return true;
}

function getThemeUnlock(themeName) {
  return THEME_UNLOCKS.find((unlock) => unlock.theme === themeName) || { theme: themeName, streak: 0 };
}

function isThemeUnlocked(themeName) {
  return state.godMode || state.unlockedThemes.includes(themeName);
}

function updateThemeLocks() {
  syncThemeUnlocks();
  ui.themeButtons.forEach((button) => {
    const unlock = getThemeUnlock(button.dataset.theme);
    const unlocked = isThemeUnlocked(button.dataset.theme);
    const label = button.querySelector(".theme-unlock-text");
    button.disabled = !unlocked;
    button.classList.toggle("locked", !unlocked);
    button.dataset.unlockStreak = String(unlock.streak);
    if (label) {
      label.textContent = unlocked
        ? `Unlocked at streak ${unlock.streak}`
        : `Locked: best streak ${unlock.streak}`;
    }
  });
}

function rememberQuestion(category, prompt) {
  const history = state.questionHistory[category];
  history.push(prompt);
  if (history.length > QUESTION_HISTORY_LIMIT) {
    history.shift();
  }
}

function buildQuestion(category, options = {}) {
  const { easy = false } = options;
  const total = Math.min(state.totalUpgrades, 12);
  let a;
  let b;
  let prompt;
  let answer;

  if (category === "addition") {
    a = randomInt(1, easy ? 6 : 5 + total);
    b = randomInt(1, easy ? 6 : 5 + total);
    prompt = `${a} + ${b} = ?`;
    answer = a + b;
  } else if (category === "subtraction") {
    a = randomInt(4, easy ? 10 : 10 + total);
    b = randomInt(1, a);
    prompt = `${a} - ${b} = ?`;
    answer = a - b;
  } else if (category === "multiplication") {
    a = randomInt(1, easy ? 4 : 6);
    b = randomInt(1, easy ? 4 : Math.max(6, 4 + Math.floor(total / 2)));
    prompt = `${a} × ${b} = ?`;
    answer = a * b;
  } else {
    b = randomInt(1, easy ? 4 : Math.min(6, 2 + Math.ceil(total / 2)));
    answer = randomInt(1, easy ? 4 : 5 + Math.floor(total / 2));
    a = b * answer;
    prompt = `${a} ÷ ${b} = ?`;
  }

  return { prompt, answer };
}

function getQuestion(category, options = {}) {
  const recent = state.questionHistory[category];
  let candidate = buildQuestion(category, options);
  let attempts = 0;

  while (recent.includes(candidate.prompt) && attempts < 100) {
    candidate = buildQuestion(category, options);
    attempts += 1;
  }

  rememberQuestion(category, candidate.prompt);
  return candidate;
}

function getCurrentLesson() {
  return campaignLessons[Math.min(state.campaignLessonIndex, campaignLessons.length - 1)];
}

function getCampaignQuestionKey(lesson) {
  return `campaign-${state.campaignLessonIndex}-${lesson.title}`;
}

function buildLessonQuestion(lesson, progressIndex) {
  const poolIndex = progressIndex % lesson.questionPool.length;
  return {
    ...lesson.questionPool[poolIndex],
    hint: lesson.hint,
    skillId: getLessonSkillId(lesson),
    strand: lesson.strand || "legacy",
    questionFamily: lesson.questionPool[poolIndex].family || lesson.questionPool[poolIndex].prompt
  };
}

function buildCampaignQuestion(lesson) {
  return buildLessonQuestion(lesson, state.campaignCorrect);
}

function getCampaignQuestion() {
  const lesson = getCurrentLesson();
  const key = getCampaignQuestionKey(lesson);
  if (!state.questionHistory[key]) {
    state.questionHistory[key] = [];
  }

  let candidate = buildCampaignQuestion(lesson);
  if (state.questionHistory[key][state.questionHistory[key].length - 1] !== candidate.prompt) {
    rememberQuestion(key, candidate.prompt);
  }
  return candidate;
}

function getPracticeLesson() {
  const lesson = campaignLessons.find((item) => item.rewardCategory === state.practiceSkill) || campaignLessons[0];
  return {
    ...lesson,
    galaxy: "Practice Lab",
    title: `${state.practiceSkill[0].toUpperCase()}${state.practiceSkill.slice(1)} Practice`,
    goal: "Practice this skill without survival pressure.",
    reward: "Practice Charge",
    questionPool: campaignLessons
      .filter((item) => item.rewardCategory === state.practiceSkill)
      .flatMap((item) => item.questionPool)
  };
}

function getPracticeQuestion() {
  const lesson = getPracticeLesson();
  const poolIndex = state.streak % lesson.questionPool.length;
  return { ...lesson.questionPool[poolIndex], hint: lesson.hint };
}

function getInfiniteReviewLessons(category) {
  updateReviewDueStates();
  return campaignLessons.filter((lesson) => {
    if (lesson.rewardCategory !== category || lesson.strand === "placement") {
      return false;
    }
    const record = state.skillMastery[getLessonSkillId(lesson)];
    return record && ["secure", "mastered", "review_due"].includes(record.state);
  });
}

function getInfiniteQuestion(category) {
  const reviewLessons = getInfiniteReviewLessons(category);
  if (reviewLessons.length === 0) {
    return getQuestion(category);
  }

  const lesson = reviewLessons[state.streak % reviewLessons.length];
  const question = buildLessonQuestion(lesson, state.streak);
  return {
    ...question,
    hint: `Review ${lesson.title}: ${lesson.hint}`
  };
}

function maybeAdvanceTutorial() {
  // The onboarding tutorial is now a short card sequence only. Gameplay
  // lessons happen naturally after the player starts answering questions.
}

function getAcceptedAnswers(question) {
  const values = [];
  if (Array.isArray(question?.answers)) {
    values.push(...question.answers);
  }
  if (Array.isArray(question?.acceptedAnswers)) {
    values.push(...question.acceptedAnswers);
  }
  if (question && Object.prototype.hasOwnProperty.call(question, "answer")) {
    values.push(question.answer);
  }
  return Array.from(new Set(values.map(Number).filter(Number.isFinite)));
}

function getPrimaryAnswer(questionOrAnswer) {
  if (typeof questionOrAnswer === "number") {
    return questionOrAnswer;
  }
  const accepted = getAcceptedAnswers(questionOrAnswer);
  return accepted.length > 0 ? accepted[0] : 0;
}

function isAnswerCorrect(selectedValue, question) {
  const selected = Number(selectedValue);
  return getAcceptedAnswers(question).some((answer) => Object.is(answer, selected) || Math.abs(answer - selected) < 0.000001);
}

function normalizeAnswerOption(option) {
  if (option && typeof option === "object") {
    const value = Number(option.value ?? option.answer);
    return {
      label: String(option.label ?? option.text ?? value),
      value
    };
  }

  const value = Number(option);
  return {
    label: String(option),
    value
  };
}

function buildAnswerOptions(questionOrAnswer) {
  if (typeof questionOrAnswer === "object" && Array.isArray(questionOrAnswer.choices) && questionOrAnswer.choices.length > 0) {
    return shuffleArray(questionOrAnswer.choices.map(normalizeAnswerOption).filter((option) => Number.isFinite(option.value)));
  }

  const primaryAnswer = getPrimaryAnswer(questionOrAnswer);
  const acceptedAnswers = typeof questionOrAnswer === "number" ? [questionOrAnswer] : getAcceptedAnswers(questionOrAnswer);
  const options = new Set(acceptedAnswers.length > 0 ? acceptedAnswers : [primaryAnswer]);
  const spread = Math.max(3, Math.ceil(Math.abs(primaryAnswer) * 0.35));

  while (options.size < 4) {
    const offset = randomInt(-spread, spread);
    let candidate = primaryAnswer + offset;

    if (candidate === primaryAnswer) {
      candidate = primaryAnswer + spread + options.size;
    }

    if (candidate < 0) {
      candidate = Math.abs(candidate) + 1;
    }

    options.add(candidate);
  }

  return shuffleArray(Array.from(options).map(normalizeAnswerOption));
}

function renderOptionButtons(container, options, buttonClass) {
  container.innerHTML = "";
  container.classList.remove("answers-count-2", "answers-count-3", "answers-count-4");
  container.classList.add(`answers-count-${Math.min(4, Math.max(2, options.length))}`);

  options.forEach((option) => {
    const normalized = normalizeAnswerOption(option);
    const button = document.createElement("button");
    button.className = buttonClass ? `${buttonClass} answer-option` : "answer-option";
    button.type = "button";
    button.textContent = normalized.label;
    button.dataset.value = String(normalized.value);
    button.disabled = false;
    button.classList.remove("guided-correct", "guided-locked");
    container.appendChild(button);
  });
}

function renderAnswerOptions() {
  renderOptionButtons(ui.answerOptions, state.question.options, "");
  ui.answerOptionButtons = Array.from(ui.answerOptions.querySelectorAll(".answer-option"));
}

function renderRepairAnswerOptions() {
  renderOptionButtons(ui.repairAnswerOptions, state.repairQuestion.options, "repair-answer-option");
  ui.repairAnswerOptionButtons = Array.from(ui.repairAnswerOptions.querySelectorAll(".repair-answer-option"));
}

function shouldGuideMainAnswer() {
  return false;
}

function shouldGuideRepairAnswer() {
  return false;
}

function updateGuidedAnswerOptions() {
  const guideMain = shouldGuideMainAnswer();
  ui.answerOptionButtons.forEach((button) => {
    const isCorrect = state.question && isAnswerCorrect(button.dataset.value, state.question);
    button.disabled = guideMain && !isCorrect;
    button.classList.toggle("guided-correct", guideMain && isCorrect);
    button.classList.toggle("guided-locked", guideMain && !isCorrect);
  });

  const guideRepair = shouldGuideRepairAnswer();
  ui.repairAnswerOptionButtons.forEach((button) => {
    const isCorrect = state.repairQuestion && isAnswerCorrect(button.dataset.value, state.repairQuestion);
    button.disabled = guideRepair && !isCorrect;
    button.classList.toggle("guided-correct", guideRepair && isCorrect);
    button.classList.toggle("guided-locked", guideRepair && !isCorrect);
  });
}

function nextQuestion() {
  if (isCampaignMode()) {
    state.question = getCampaignQuestion();
  } else if (state.gameMode === "practice") {
    state.question = getPracticeQuestion();
  } else {
    state.question = getInfiniteQuestion(state.category);
  }
  state.question.options = buildAnswerOptions(state.question);
  ui.questionText.textContent = state.question.prompt;
  renderAnswerOptions();
}

function getCategories() {
  return CATEGORY_KEYS;
}

function tutorialUsesLockRules() {
  return false;
}

function isCategoryLocked(category) {
  return state.wrongLocks[category] || state.spamLockCategory === category;
}

function clearWrongLocks(exceptCategory = null) {
  getCategories().forEach((category) => {
    if (category !== exceptCategory) {
      state.wrongLocks[category] = false;
    }
  });
}

function adjustPopulation(amount) {
  const previous = state.population;
  state.population = clamp(state.population + amount, 0, 100);
  return state.population - previous;
}

function losePopulation(reason, amount = getModeRules().wrongTrustPenalty || 20) {
  const previous = state.population;
  state.population = Math.max(0, state.population - amount);

  if (previous > 0 && state.population === 0) {
    if (!isCampaignMode() && !isPracticeMode()) {
      captureCheckpointSnapshot();
      captureFailureStreak();
    }
    state.streak = 0;
    openRepairMode(isCampaignMode() ? "learning" : "population");
    return true;
  }

  if (isCampaignMode()) {
    setBanner(`Population is now ${state.population}%. Use the hint and answer the same question.`);
    return false;
  }

  if (isPracticeMode()) {
    setBanner(`Confidence is ${state.population}%. Use the hint and try the same idea again.`);
    return false;
  }

  if (reason === "attack") {
    setBanner(`20% of the population was lost in the attack. Population is now ${state.population}%.`);
  } else {
    setBanner(`20% of the population was lost. Population is now ${state.population}%.`);
  }
  return false;
}

function gainPopulationHeart() {
  if (state.population >= 100) {
    state.correctSincePopulationGain = 0;
    return false;
  }

  state.population = Math.min(100, state.population + getModeRules().correctTrustGain);
  state.correctSincePopulationGain = 0;
  return true;
}

function applyDowngradeAll(amount) {
  getCategories().forEach((category) => {
    state.upgrades[category] = Math.max(0, state.upgrades[category] - amount);
    state.wrongLocks[category] = false;
  });
  state.spamLockCategory = null;
  state.spamUnlockProgress = 0;
  state.focusCategory = null;
  state.focusCount = 0;
  recalculatePlanetStats();
}

function recalculatePlanetStats() {
  const add = state.upgrades.addition;
  const sub = state.upgrades.subtraction;
  const mul = state.upgrades.multiplication;
  const div = state.upgrades.division;

  state.totalUpgrades = add + sub + mul + div;
  state.level = 1 + state.totalUpgrades;

  state.attack = BASE_PLANET_DAMAGE + add * 2;
  state.maxShield = BASE_PLANET_SHIELD + sub * 5;
  state.maxBaseHp = BASE_PLANET_HP + sub * 10;
  state.shieldRegen = BASE_SHIELD_REGEN + div * 0.4;
  state.targetCount = 1 + Math.floor(mul / 2);
  state.attackSpeed = BASE_ATTACK_SPEED + state.totalUpgrades * 0.05;
  state.planetRegen = BASE_HEALTH_REGEN + div * 0.35;

  state.baseHp = clamp(state.baseHp, 0, state.maxBaseHp);
  state.shield = clamp(state.shield, 0, state.maxShield);
}

function getSafetyResetSeconds() {
  const rules = getModeRules();
  return rules.safetyBaseSeconds + Math.floor(state.streak / 5) * rules.streakBonusSeconds;
}

function addUpgradeReward(category, amount = 1) {
  state.upgrades[category] += amount;
  recalculatePlanetStats();
}

function destroyCampaignEnemiesForCorrect(lesson) {
  if (!isCampaignMode()) {
    return 0;
  }

  while (state.enemies.length < 2) {
    spawnEnemy();
    if (state.enemies.length === 0) {
      break;
    }
  }

  const metrics = getArenaMetrics();
  const clearCount = Math.min(
    state.enemies.length,
    1 + Math.floor(state.streak / 4) + (lesson.rewardCategory === "multiplication" ? 1 : 0)
  );
  const targets = state.enemies
    .map((enemy) => ({ enemy, point: enemy.lastPoint || getEnemyPoint(enemy) }))
    .sort((a, b) => b.enemy.progress - a.enemy.progress)
    .slice(0, clearCount);

  targets.forEach(({ enemy, point }) => {
    enemy.hp = 0;
    createProjectile(metrics.centerX, metrics.centerY, point.x, point.y, "friendly", 180);
    createImpact(point.x, point.y, "enemy-hit", 180);
  });

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  return targets.length;
}

function getCampaignRewardMessage(lesson) {
  if (lesson.rewardCategory === "addition") {
    return `${lesson.reward} increased. The colony has more power for the route.`;
  }
  if (lesson.rewardCategory === "subtraction") {
    return `${lesson.reward} increased. Damage control is stronger.`;
  }
  if (lesson.rewardCategory === "multiplication") {
    return `${lesson.reward} increased. Drone systems can scale up.`;
  }
  return `${lesson.reward} increased. Repair logistics improved.`;
}

function getPlanetCampaignActionLabel(category) {
  if (category === "addition") {
    return "Power shot";
  }
  if (category === "subtraction") {
    return "Shield pulse";
  }
  if (category === "multiplication") {
    return "Drone launch";
  }
  return "Repair beam";
}

function showPlanetCampaignAction(kind, message) {
  if (!isPlanetCampaignMode() || !ui.enemyField) {
    return;
  }

  const effect = document.createElement("div");
  effect.className = `planet-action-pop planet-action-${kind}`;
  effect.textContent = message;
  ui.enemyField.appendChild(effect);
  ui.planetCoreBtn?.classList.remove("planet-command-correct", "planet-command-wrong");
  ui.planetCoreBtn?.classList.add(kind === "wrong" ? "planet-command-wrong" : "planet-command-correct");

  window.setTimeout(() => {
    effect.remove();
    ui.planetCoreBtn?.classList.remove("planet-command-correct", "planet-command-wrong");
  }, 900);
}

function completeCampaignLesson() {
  const lesson = getCurrentLesson();
  const completedIndex = state.campaignLessonIndex;
  const lessonId = getLessonSkillId(lesson);
  markSkillSecure(lesson);
  addUpgradeReward(lesson.rewardCategory, 2);
  adjustPopulation(getModeRules().lessonTrustGain);
  state.baseHp = state.maxBaseHp;
  state.shield = state.maxShield;
  state.campaignStageStats.correct = Math.max(state.campaignStageStats.correct, state.campaignCorrect);
  const stars = calculateCampaignStars(state.campaignStageStats);
  state.campaignStars[lessonId] = Math.max(state.campaignStars[lessonId] || 0, stars);
  state.campaignCorrect = 0;
  state.campaignMistakes = 0;

  const nextPlanetCampaignIndex = isPlanetCampaignMode() ? getCampaignUnlockedIndex() : null;
  const planetCampaignDone = isPlanetCampaignMode() && nextPlanetCampaignIndex === completedIndex;

  if (completedIndex >= campaignLessons.length - 1 || planetCampaignDone) {
    state.campaignComplete = !isPlanetCampaignMode();
    state.campaignProgressIndex = campaignLessons.length - 1;
    state.safetyModeSec = SAFETY_REWARD_SECONDS;
    saveProgress();
    showCampaignResult(completedIndex, lesson, stars);
    return;
  }

  const nextIndex = isPlanetCampaignMode() ? nextPlanetCampaignIndex : completedIndex + 1;
  state.campaignProgressIndex = Math.max(state.campaignProgressIndex, nextIndex);
  state.campaignLessonIndex = state.campaignProgressIndex;
  saveProgress();
  const nextLesson = getCurrentLesson();
  state.category = nextLesson.rewardCategory;
  setBanner(`Planet saved. ${getCampaignRewardMessage(lesson)} Next: ${nextLesson.title}.`);
  showCampaignResult(completedIndex, lesson, stars);
}

function applyCampaignCorrectAnswer() {
  if (state.campaignComplete) {
    setBanner("Campaign complete. Use Infinite Galaxy for endless practice.");
    return;
  }

  const lesson = getCurrentLesson();
  recordSkillAttempt(lesson, true);
  state.campaignCorrect += 1;
  state.campaignStageStats.correct += 1;
  state.campaignMistakes = 0;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  syncThemeUnlocks();
  adjustPopulation(getModeRules().correctTrustGain);
  state.correctSincePopulationGain += 1;
  state.correctSinceSafetyMode += 1;
  state.survivalClockSec = getSafetyResetSeconds();
  addUpgradeReward(lesson.rewardCategory, 1);
  const clearedEnemies = destroyCampaignEnemiesForCorrect(lesson);
  showPlanetCampaignAction("correct", getPlanetCampaignActionLabel(lesson.rewardCategory));

  const colonyBoosted = state.correctSincePopulationGain >= 5;
  if (colonyBoosted) {
    adjustPopulation(6);
    state.correctSincePopulationGain = 0;
  }
  if (state.correctSinceSafetyMode >= 10) {
    state.correctSinceSafetyMode = 0;
    state.safetyModeSec = SAFETY_REWARD_SECONDS;
  }

  if (state.campaignCorrect >= lesson.targetCorrect) {
    completeCampaignLesson();
    return;
  }

  setBanner(colonyBoosted
    ? `Correct. ${clearedEnemies} attackers cleared and population stabilized at ${state.population}%.`
    : `Correct. ${clearedEnemies} attackers cleared.`);
}

function handleCampaignWrongAnswer() {
  const lesson = getCurrentLesson();
  recordSkillAttempt(lesson, false);
  state.streak = 0;
  state.campaignMistakes += 1;
  state.campaignStageStats.wrong += 1;
  const penalty = state.campaignMistakes >= 2
    ? getModeRules().repeatedWrongPenalty
    : getModeRules().wrongTrustPenalty;
  const repairOpened = losePopulation("wrong", penalty);
  showPlanetCampaignAction("wrong", "Try with a hint");

  const record = ensureSkillMastery(lesson);
  if (state.campaignMistakes >= 2 || state.population <= 40) {
    record.state = "needs_support";
    saveProgress();
  }

  if (repairOpened) {
    return;
  }

  setBanner(`Population -${penalty}%. Hint: ${lesson.hint}`);
}

function applyPracticeCorrectAnswer() {
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  syncThemeUnlocks();
  state.correctSincePopulationGain += 1;
  addUpgradeReward(state.practiceSkill, 1);
  state.safetyModeSec = SAFETY_REWARD_SECONDS;
  if (state.correctSincePopulationGain >= 5) {
    gainPopulationHeart();
    setBanner("Correct. Confidence rose and the Planet charged.");
    return;
  }
  setBanner("Correct. Practice charged the Planet.");
}

function handlePracticeWrongAnswer() {
  const lesson = getPracticeLesson();
  state.streak = 0;
  setBanner(`Try again. Hint: ${lesson.hint}`);
}

function applyCorrectAnswerReward(category) {
  if (state.focusCategory === category) {
    state.focusCount += 1;
  } else {
    if (tutorialUsesLockRules() && state.spamLockCategory && category !== state.spamLockCategory) {
      state.spamUnlockProgress += 1;
      if (state.spamUnlockProgress >= 2) {
        state.spamLockCategory = null;
        state.spamUnlockProgress = 0;
      }
    }
    state.focusCategory = category;
    state.focusCount = 1;
  }

  state.upgrades[category] += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  syncThemeUnlocks();
  if (!state.tutorialActive) {
    state.survivalClockSec = getSafetyResetSeconds();
  }
  state.correctSincePopulationGain += 1;
  state.wrongLocks[category] = false;
  clearWrongLocks(category);
  recalculatePlanetStats();
  maybeAdvanceTutorial(category, true);

  if (state.checkpointGuard) {
    state.checkpointRecoveryAnswers += 1;
    if (state.checkpointRecoveryAnswers >= 5) {
      state.checkpointGuard = false;
      state.checkpointRecoveryAnswers = 0;
      setBanner("Checkpoint secured again. Your streak is safe for now.");
    }
  }

  if (tutorialUsesLockRules() && state.focusCount >= 5) {
    state.spamLockCategory = category;
    state.spamUnlockProgress = 0;
    maybeAdvanceTutorial(category, true);
  }

  const populationRecovered = state.correctSincePopulationGain >= 5 ? gainPopulationHeart() : false;
  let safetyRecovered = false;

  if (!state.tutorialActive) {
    state.correctSinceSafetyMode += 1;
    if (state.correctSinceSafetyMode >= 10) {
      state.correctSinceSafetyMode = 0;
      state.safetyModeSec = SAFETY_REWARD_SECONDS;
      safetyRecovered = true;
    }
  }

  if (category === "addition") {
    setBanner(safetyRecovered
      ? "Eureka Boost is on. The Planet is stronger for 5 minutes."
      : populationRecovered ? "Great job. Addition made the Planet stronger and saved 20% population." : "Great job. Addition made the Planet stronger.");
  } else if (category === "subtraction") {
    setBanner(safetyRecovered
      ? "Eureka Boost is on. The Planet is stronger for 5 minutes."
      : populationRecovered ? "Great job. Subtraction raised max health and shield and saved 20% population." : "Great job. Subtraction raised the Planet's max shield and health.");
  } else if (category === "multiplication") {
    setBanner(safetyRecovered
      ? "Eureka Boost is on. The Planet is stronger for 5 minutes."
      : populationRecovered ? "Great job. Multiplication added more targets and saved 20% population." : "Great job. Multiplication added more targets.");
  } else {
    setBanner(safetyRecovered
      ? "Eureka Boost is on. The Planet is stronger for 5 minutes."
      : populationRecovered ? "Great job. Division improved regen and saved 20% population." : "Great job. Division made the Planet heal faster.");
  }
}

function handleWrongAnswer() {
  state.streak = 0;
  state.wrongLocks[state.category] = true;
  let message = `${state.category} is locked. Answer a different path to unlock it.`;

  if (state.checkpointGuard) {
    applyLevelRollback(5);
    captureCheckpointSnapshot();
    message = "Checkpoint mistake. The Planet dropped 5 levels.";
  }

  if (getCategories().every((category) => state.wrongLocks[category])) {
    applyDowngradeAll(2);
    message = "All 4 paths failed. Every upgrade dropped by 2.";
  }

  if (losePopulation("wrong")) {
    return;
  }

  setBanner(message);
}

function handlePlanetClick() {
  if (state.lastBannerMessage && state.planetHintIndex === -1) {
    state.planetHintIndex = 0;
    setBanner(state.lastBannerMessage, { remember: false });
    return;
  }

  const hint = planetHints[state.planetHintIndex % planetHints.length];
  state.planetHintIndex = (state.planetHintIndex + 1) % planetHints.length;
  setBanner(hint, { remember: false });
}

function getThreatMultiplier() {
  const timeStage = Math.floor(state.elapsedSec / 20);
  const urgency = getModeRules().countdown ? clamp(1 - state.survivalClockSec / SURVIVAL_BASE_SECONDS, 0, 1) : 0.12;
  return 1 + (timeStage * 0.18 + urgency * 0.6 + state.totalUpgrades * 0.015) * getModeRules().enemyPressureScale;
}

function getDangerWindow() {
  return Math.max(0, state.survivalClockSec);
}

function getPressureRatio() {
  const rules = getModeRules();
  if (isCampaignMode()) {
    const lessonPressure = clamp(state.campaignCorrect / Math.max(1, getCurrentLesson().targetCorrect), 0, 1) * 0.18;
    const populationPressure = (1 - clamp(state.population / 100, 0, 1)) * 0.24;
    return clamp(0.12 + lessonPressure + populationPressure, 0, 0.42);
  }
  if (isPracticeMode()) {
    return 0.08;
  }
  if (state.safetyModeSec > 0 && !state.tutorialActive) {
    return 0;
  }
  if (isTutorialLossPhase()) {
    return 1;
  }
  return clamp(1 - getDangerWindow() / rules.safetyBaseSeconds, 0, 1);
}

function getEndgamePressure() {
  if (!getModeRules().timerFailure) {
    return 0;
  }
  if (isTutorialLossPhase()) {
    return 1;
  }
  return clamp(1 - state.survivalClockSec / 20, 0, 1);
}

function getPlanetSafetyFloor() {
  if (state.godMode || state.zombieDead || state.repairMode) {
    return 0;
  }
  if (!getModeRules().combatCanTriggerRepair) {
    return Math.round(state.maxBaseHp * 0.18);
  }

  const collapseWindow = 20;
  const collapseRatio = clamp(state.survivalClockSec / collapseWindow, 0, 1);
  const protectedRatio = 0.2 * collapseRatio;
  return Math.round(state.maxBaseHp * protectedRatio);
}

function getSpawnInterval() {
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  const modeScale = getModeRules().enemyPressureScale;
  return Math.max(0.35, 1.05 + (1 - modeScale) * 0.7 - pressure * 0.28 - endgamePressure * 0.2 - Math.min(0.12, state.elapsedSec / 1200));
}

function getAliveCounts() {
  const alive = { diver: 0, breaker: 0, ranger: 0, melee: 0, boss: 0 };
  state.enemies.forEach((enemy) => {
    alive[enemy.type] += 1;
  });
  return alive;
}

function getDesiredEnemyCounts() {
  const t = state.elapsedSec;
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  const varietyFloor = 1 + Math.min(3, Math.floor(t / 30));
  const modeScale = getModeRules().enemyPressureScale;
  const baseMinions = Math.max(2, Math.round((4 + Math.floor(t / 18) + Math.floor(pressure * 12) + Math.floor(endgamePressure * 10)) * modeScale));
  const diversBoost = shieldRatio < 0.2 ? 2 : shieldRatio < 0.45 ? 1 : 0;
  const breakerBoost = shieldRatio > 0.55 ? 2 : shieldRatio > 0.3 ? 1 : 0;
  const meleeBoost = state.baseHp < state.maxBaseHp * 0.5 ? 1 : 0;

  const swarmMultiplier = getSwarmCountMultiplier();

  return {
    diver: Math.max(varietyFloor, Math.round((1 + Math.floor(baseMinions * 0.3) + diversBoost + Math.floor(endgamePressure * 2)) * swarmMultiplier)),
    breaker: t < 8 ? 0 : Math.max(varietyFloor, Math.round((Math.floor(baseMinions * 0.23) + breakerBoost) * swarmMultiplier)),
    ranger: t < 12 ? 0 : Math.max(varietyFloor, Math.round((Math.floor(baseMinions * 0.25) + Math.floor(endgamePressure)) * swarmMultiplier)),
    melee: t < 20 ? 0 : Math.max(1, Math.round((Math.floor(baseMinions * 0.14) + meleeBoost) * swarmMultiplier)),
    boss: t < 120 ? 0 : Math.round(Math.floor((pressure + endgamePressure * 0.8) * 1.4) * Math.min(3, swarmMultiplier))
  };
}

function chooseEnemyType() {
  const alive = getAliveCounts();
  const desired = getDesiredEnemyCounts();
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  const scores = {};
  const types = ["diver", "breaker", "ranger", "melee", "boss"];

  types.forEach((type) => {
    const template = enemyTemplates[type];
    const missing = Math.max(0, desired[type] - alive[type]);
    const underrepresented = Math.max(0, desired[type] > 0 ? 2 - alive[type] : 0);
    let score = missing * 6 + underrepresented * 5;

    if (type === "breaker") {
      score += shieldRatio > 0.55 ? 8 : shieldRatio > 0.3 ? 4 : 0;
    } else if (type === "diver") {
      score += shieldRatio < 0.25 ? 8 : shieldRatio < 0.45 ? 4 : 1;
      score += Math.floor(endgamePressure * 5);
    } else if (type === "melee") {
      score += state.baseHp < state.maxBaseHp * 0.5 ? 4 : 1;
    } else if (type === "ranger") {
      score += 3 + Math.floor(pressure * 3) + Math.floor(endgamePressure * 2);
    } else if (type === "boss") {
      score += desired.boss > 0 ? 5 + Math.floor(pressure * 6) : -100;
    }

    score -= alive[type] * 1.5;
    score += template.family === "minion" ? 1 : 0;
    scores[type] = score;
  });

  return types.reduce((best, type) => {
    if (best === null || scores[type] > scores[best]) {
      return type;
    }
    return best;
  }, null);
}

function getMaxEnemyCount() {
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  const baseCap = clamp(3 + Math.floor(state.elapsedSec / 12) + Math.floor(pressure * 18) + Math.floor(endgamePressure * 10), 3, 50);
  const modeCap = getModeRules().maxEnemyCap;
  const deviceCap = window.innerWidth <= 760 || window.matchMedia("(pointer: coarse)").matches ? Math.min(180, modeCap) : modeCap;
  return clamp(Math.round(baseCap * getSwarmCountMultiplier() * getModeRules().enemyPressureScale), 2, deviceCap);
}

function getUpgradePacePressure() {
  const expectedUpgrades = Math.floor(state.elapsedSec / 20);
  return Math.max(0, expectedUpgrades - state.totalUpgrades);
}

function getSpawnBatchSize() {
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  const pacePressure = getUpgradePacePressure();
  let batchSize = 1;
  if (endgamePressure > 0.75 || pressure > 0.9 || pacePressure >= 5) {
    batchSize = 4;
  } else if (endgamePressure > 0.35 || pressure > 0.55 || pacePressure >= 2) {
    batchSize = 3;
  }
  return Math.max(1, Math.round(batchSize * (1 + (state.swarmLevel - 1) * 0.4)));
}

function createEnemyStats(type) {
  const template = enemyTemplates[type];
  const timeStage = Math.floor(state.elapsedSec / 18);
  const modeScale = getModeRules().enemyPressureScale;
  const hpScale = 0.45 + (timeStage * 0.1 + state.totalUpgrades * 0.015) * modeScale;
  const threat = state.threatMultiplier;
  const swarmStatMultiplier = getSwarmStatMultiplier();
  const endgamePressure = getEndgamePressure();
  const rawHp = Math.max(1, Math.round(template.baseHp * hpScale * swarmStatMultiplier));
  const cappedHp = type === "melee"
    ? Math.max(1, Math.min(rawHp, Math.round(state.attack * 1.8)))
    : rawHp;
  const holdProgress = template.holdProgress === null
    ? null
    : clamp(template.holdProgress + randomInt(-4, 5), 34, 92);

  return {
    maxHp: cappedHp,
    speed: template.speed * (0.78 + modeScale * 0.22 + timeStage * 0.018 * modeScale + endgamePressure * 0.1),
    contactDamage: Math.max(1, Math.round(template.contactDamage * (0.55 + threat * 0.08) * swarmStatMultiplier)),
    rangedDamage: Math.max(1, Math.round(template.rangedDamage * (0.55 + threat * 0.07) * swarmStatMultiplier)),
    rangedCooldown: template.rangedCooldown === 0 ? 0 : Math.max(1, template.rangedCooldown * (1 - Math.min(0.18, timeStage * 0.01))),
    holdProgress
  };
}

function spawnEnemy() {
  const type = chooseEnemyType();
  if (!type) {
    return;
  }
  const stats = createEnemyStats(type);
  const angle = Math.random() * Math.PI * 2;
  const template = enemyTemplates[type];

  state.enemies.push({
    id: state.enemyId++,
    type,
    angle,
    progress: 0,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    speed: stats.speed,
    contactDamage: stats.contactDamage,
    rangedDamage: stats.rangedDamage,
    rangedCooldown: stats.rangedCooldown,
    rangedTimer: type === "melee" ? 2 : randomInt(40, 120) / 100,
    holdProgress: stats.holdProgress,
    orbitSpeed: template.orbitSpeed,
    damageMode: template.damageMode,
    enteredHold: false,
    lastPoint: null
  });

  if (state.elapsedSec > 180) {
    setBanner("The swarm is getting stronger. Keep upgrading the Planet.");
  }
}

function dealDamageToPlanet(amount, mode = "normal") {
  if (state.godMode) {
    state.baseHp = state.maxBaseHp;
    state.shield = state.maxShield;
    return;
  }
  if (state.zombieDead) {
    return;
  }
  const defenseMultiplier = (isRepairBoostActive() ? 0.1 : 1) * getModeRules().enemyDamageMultiplier;
  let pending = amount * defenseMultiplier;

  if (mode === "surface_only") {
    state.baseHp = Math.max(0, state.baseHp - pending);
  } else if (mode === "shield_break") {
    if (state.shield > 0) {
      const shieldHit = Math.min(state.shield, pending * 2);
      state.shield -= shieldHit;
      pending = Math.max(0, pending - shieldHit * 0.3);
    }
    if (pending > 0) {
      state.baseHp = Math.max(0, state.baseHp - pending);
    }
  } else if (state.shield > 0) {
    const absorbed = Math.min(state.shield, pending);
    state.shield -= absorbed;
    pending -= absorbed;
    if (pending > 0) {
      state.baseHp = Math.max(0, state.baseHp - pending);
    }
  } else {
    state.baseHp = Math.max(0, state.baseHp - pending);
  }

  const safetyFloor = getPlanetSafetyFloor();
  if (state.baseHp < safetyFloor) {
    state.baseHp = safetyFloor;
  }

  if (state.baseHp === 0) {
    if (!getModeRules().combatCanTriggerRepair) {
      state.baseHp = Math.max(1, Math.round(state.maxBaseHp * 0.18));
      state.shield = 0;
      if (isCampaignMode() && state.population > 35) {
        adjustPopulation(-4);
      }
      setBanner(isCampaignMode()
        ? "The colony felt the attack, but Campaign progress depends on learning, not random survival."
        : "Practice stays calm. Answer the next question to stabilize the Planet.");
      return;
    }
    state.baseHp = 0;
    state.shield = 0;
    captureFailureStreak();
    state.streak = 0;
    if (losePopulation("attack")) {
      return;
    }
    openRepairMode("planet");
  }
}

function triggerPlanetFailure(reason) {
  if (state.godMode) {
    return;
  }
  if (!getModeRules().timerFailure) {
    state.survivalClockSec = getSafetyResetSeconds();
    state.baseHp = Math.max(state.baseHp, Math.round(state.maxBaseHp * 0.25));
    setBanner(isCampaignMode()
      ? "Campaign focus was restored. The mission only fails when learning support is needed."
      : "Practice timer restored.");
    return;
  }
  state.baseHp = 0;
  state.shield = 0;
  if (state.zombieMode) {
    state.zombieDead = true;
    setBanner("Zombie Mode is on. The Planet is dead, but the swarm keeps moving.");
    return;
  }
  captureFailureStreak();
  state.streak = 0;
  if (losePopulation(reason)) {
    return;
  }
  openRepairMode("planet");
}

function createProjectile(fromX, fromY, toX, toY, className, duration) {
  const projectile = document.createElement("div");
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  projectile.className = `projectile ${className}`;
  projectile.style.left = `${fromX}px`;
  projectile.style.top = `${fromY}px`;
  projectile.style.width = `${length}px`;
  projectile.style.transform = `rotate(${angle}rad)`;
  ui.projectileLayer.appendChild(projectile);

  window.setTimeout(() => {
    projectile.remove();
  }, duration);
}

function createImpact(x, y, className, duration = 220) {
  const impact = document.createElement("div");
  impact.className = `impact ${className}`;
  impact.style.left = `${x}px`;
  impact.style.top = `${y}px`;
  ui.projectileLayer.appendChild(impact);

  window.setTimeout(() => {
    impact.remove();
  }, duration);
}

function getEnemyPoint(enemy) {
  const metrics = getArenaMetrics();
  const radius = metrics.outerRadius - ((metrics.outerRadius - metrics.innerRadius) * enemy.progress) / 100;
  const x = metrics.centerX + Math.cos(enemy.angle) * radius;
  const y = metrics.centerY + Math.sin(enemy.angle) * radius;
  return { x, y, metrics };
}

function processEnemies(deltaSec) {
  const removeIds = new Set();
  const metrics = getArenaMetrics();

  state.enemies.forEach((enemy) => {
    const template = enemyTemplates[enemy.type];

    if (enemy.holdProgress !== null && enemy.progress >= enemy.holdProgress) {
      enemy.progress = enemy.holdProgress;
      if (!enemy.enteredHold) {
        enemy.enteredHold = true;
        if (enemy.type === "melee") {
          enemy.rangedTimer = Math.max(enemy.rangedTimer, 2);
        }
      }
      const orbitSpeed = enemy.type === "melee" ? enemy.orbitSpeed * 0.45 : enemy.orbitSpeed;
      enemy.angle += orbitSpeed * deltaSec;
    } else {
      enemy.progress += enemy.speed * deltaSec;
    }

    enemy.lastPoint = getEnemyPoint(enemy);

    if (enemy.holdProgress !== null && enemy.progress >= enemy.holdProgress && enemy.rangedCooldown > 0) {
      enemy.rangedTimer -= deltaSec;
      if (enemy.rangedTimer <= 0) {
        enemy.rangedTimer = enemy.rangedCooldown;
        dealDamageToPlanet(enemy.rangedDamage, enemy.damageMode);
        createProjectile(
          enemy.lastPoint.x,
          enemy.lastPoint.y,
          metrics.centerX,
          metrics.centerY,
          template.projectileClass,
          template.projectileClass === "enemy-laser" ? 220 : 360
        );
        createImpact(
          metrics.centerX,
          metrics.centerY,
          enemy.damageMode === "surface_only" ? "planet-hit" : "shield-hit",
          240
        );
      }
    }

    if (enemy.holdProgress === null && enemy.progress >= 100) {
      dealDamageToPlanet(enemy.contactDamage, enemy.damageMode);
      createImpact(
        metrics.centerX,
        metrics.centerY,
        enemy.damageMode === "surface_only" ? "planet-hit" : "shield-hit",
        260
      );
      removeIds.add(enemy.id);
    }
  });

  state.enemies = state.enemies.filter((enemy) => !removeIds.has(enemy.id) && enemy.hp > 0);
}

function autoAttack(timestamp) {
  if (state.zombieDead) {
    return;
  }
  const boostMultiplier = getRepairBoostMultiplier();
  const godMultiplier = getGodModeMultiplier();
  const safetyMultiplier = state.safetyModeSec > 0 && !state.tutorialActive ? 1.5 : 1;
  const attackInterval = 1000 / (state.attackSpeed * boostMultiplier * godMultiplier * safetyMultiplier);
  if (timestamp - state.lastAttack < attackInterval || state.enemies.length === 0) {
    return;
  }

  const metrics = getArenaMetrics();
  const attackRange = getAttackRangeRadius(metrics);
  const boostedTargetCount = state.targetCount * godMultiplier;
  const targetsInRange = state.enemies
    .map((enemy) => {
      const point = enemy.lastPoint || getEnemyPoint(enemy);
      const distance = Math.hypot(point.x - metrics.centerX, point.y - metrics.centerY);
      return { enemy, point, distance };
    })
    .filter(({ enemy, distance }) => enemy.hp > 0 && distance <= attackRange);

  if (targetsInRange.length === 0) {
    return;
  }

  state.lastAttack = timestamp;

  const targetLimit = Math.min(targetsInRange.length, Math.max(1, boostedTargetCount));
  const targets = targetsInRange
    .sort((a, b) => {
      const priorityDelta = enemyTemplates[a.enemy.type].targetPriority - enemyTemplates[b.enemy.type].targetPriority;
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return b.enemy.progress - a.enemy.progress;
    })
    .slice(0, targetLimit);

  targets.forEach(({ enemy, point }, index) => {
    const boostedAttack = state.attack * boostMultiplier * godMultiplier * safetyMultiplier;
    const damage = index === 0 ? boostedAttack : Math.round(boostedAttack * 0.85);
    enemy.hp -= damage;
    enemy.lastPoint = point;
    createProjectile(metrics.centerX, metrics.centerY, point.x, point.y, "friendly", 180);
    createImpact(point.x, point.y, "enemy-hit", 160);
  });

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
}

function applyPassiveSystems(deltaSec) {
  if (state.zombieDead) {
    return;
  }
  const boostMultiplier = getRepairBoostMultiplier();
  const safetyMultiplier = state.safetyModeSec > 0 && !state.tutorialActive ? 1.5 : 1;
  state.shield = clamp(state.shield + state.shieldRegen * boostMultiplier * safetyMultiplier * deltaSec, 0, state.maxShield);
  state.baseHp = clamp(state.baseHp + state.planetRegen * boostMultiplier * safetyMultiplier * deltaSec, 0, state.maxBaseHp);
  if (state.godMode) {
    state.baseHp = state.maxBaseHp;
    state.shield = state.maxShield;
  }
}

function runSpawning(deltaSec) {
  if (!getModeRules().spawnEnemies) {
    return;
  }
  state.spawnTimer += deltaSec;
  const interval = getSpawnInterval();
  const maxEnemies = getMaxEnemyCount();
  while (state.spawnTimer >= interval && state.enemies.length < maxEnemies) {
    state.spawnTimer -= interval;
    const batch = Math.min(getSpawnBatchSize(), maxEnemies - state.enemies.length);
    for (let i = 0; i < batch; i += 1) {
      spawnEnemy();
    }
  }
}

function renderEnemies() {
  const liveIds = new Set();
  state.enemies.forEach((enemy) => {
    const template = enemyTemplates[enemy.type];
    const point = enemy.lastPoint || getEnemyPoint(enemy);
    let card = enemyNodes.get(enemy.id);
    liveIds.add(enemy.id);

    if (!card) {
      card = document.createElement("div");
      card.className = `enemy-card ${template.className}`;
      card.innerHTML = `
        <div class="enemy-sprite"></div>
        <div class="enemy-body"></div>
        <div class="enemy-hp"><div></div></div>
      `;
      enemyNodes.set(enemy.id, card);
      ui.enemyField.appendChild(card);
    } else {
      card.className = `enemy-card ${template.className}`;
    }

    card.style.left = `${point.x}px`;
    card.style.top = `${point.y}px`;
    card.querySelector(".enemy-hp div").style.width = `${clamp(enemy.hp / enemy.maxHp, 0, 1) * 100}%`;
  });

  enemyNodes.forEach((node, id) => {
    if (!liveIds.has(id)) {
      node.remove();
      enemyNodes.delete(id);
    }
  });
}

function updateUpgradeTexts() {
  if (ui.additionUpgradeText) {
    ui.additionUpgradeText.textContent = `${state.upgrades.addition} power ups`;
  }
  if (ui.subtractionUpgradeText) {
    ui.subtractionUpgradeText.textContent = `${state.upgrades.subtraction} max ups`;
  }
  if (ui.multiplicationUpgradeText) {
    ui.multiplicationUpgradeText.textContent = `${state.upgrades.multiplication} target ups`;
  }
  if (ui.divisionUpgradeText) {
    ui.divisionUpgradeText.textContent = `${state.upgrades.division} regen ups`;
  }
  if (ui.maxShieldStat) {
    ui.maxShieldStat.textContent = String(state.maxShield);
  }
  if (ui.populationStat) {
    ui.populationStat.textContent = `${state.population}%`;
  }
  if (ui.checkpointStat) {
    ui.checkpointStat.textContent = `Level ${getCheckpointLevel()}`;
  }
  if (ui.bestStreakStat) {
    ui.bestStreakStat.textContent = String(state.bestStreak);
  }
}

function updateMissionTexts() {
  if (!ui.missionStatusText) {
    return;
  }

  if (isCampaignMode()) {
    const completedLessons = state.campaignComplete ? campaignLessons.length : getSecureSkillCount();
    const currentLesson = getCurrentLesson();
    ui.missionTitleText.textContent = isPlanetCampaignMode() ? "Planet Campaign" : "Campaign";
    ui.missionCopyText.textContent = isPlanetCampaignMode()
      ? "Answer with defense commands, keep the planet visible, and restore each route."
      : "Answer from one mission deck, protect population, and return for scheduled review.";
    ui.missionMenuLabelA.textContent = "Progress";
    ui.missionMenuLabelB.textContent = "Galaxy";
    ui.missionMenuLabelC.textContent = "Mission";
    ui.missionMenuLabelD.textContent = "Mastery";
    ui.missionMenuAddition.textContent = `${Math.min(state.campaignLessonIndex + 1, campaignLessons.length)} / ${campaignLessons.length}`;
    ui.missionMenuSubtraction.textContent = currentLesson.galaxy;
    ui.missionMenuMultiplication.textContent = state.campaignComplete ? "Done" : currentLesson.title;
    ui.missionMenuDivision.textContent = state.campaignComplete
      ? "Complete"
      : ensureSkillMastery(currentLesson).state.replaceAll("_", " ");
    ui.missionStatusText.textContent = state.campaignComplete
      ? "Campaign complete. Infinite Galaxy is ready for endless review."
      : `Active mission: ${currentLesson.title}.`;
    ui.archiveStatusText.textContent = state.campaignComplete
      ? "Finished: Campaign."
      : "Finished campaign missions will appear here.";
    ui.themeProgressText.textContent = `Mastered or secured missions: ${completedLessons} of ${campaignLessons.length}.`;
    return;
  }

  const progress = {
    addition: Math.min(FIRST_MISSION_TARGET, state.upgrades.addition),
    subtraction: Math.min(FIRST_MISSION_TARGET, state.upgrades.subtraction),
    multiplication: Math.min(FIRST_MISSION_TARGET, state.upgrades.multiplication),
    division: Math.min(FIRST_MISSION_TARGET, state.upgrades.division)
  };
  const firstMissionDone = getCategories().every((key) => state.upgrades[key] >= FIRST_MISSION_TARGET);
  const unlockedThemeCount = THEME_UNLOCKS.filter((unlock) => isThemeUnlocked(unlock.theme)).length;
  const nextTheme = THEME_UNLOCKS.find((unlock) => !isThemeUnlocked(unlock.theme));

  ui.missionTitleText.textContent = "Train Every Power";
  ui.missionCopyText.textContent = "Reach 50 upgrades in Power, Shield, Multishot, and Regen.";
  ui.missionMenuLabelA.textContent = "Power";
  ui.missionMenuLabelB.textContent = "Shield";
  ui.missionMenuLabelC.textContent = "Multishot";
  ui.missionMenuLabelD.textContent = "Regen";
  ui.missionMenuAddition.textContent = `${progress.addition} / ${FIRST_MISSION_TARGET}`;
  ui.missionMenuSubtraction.textContent = `${progress.subtraction} / ${FIRST_MISSION_TARGET}`;
  ui.missionMenuMultiplication.textContent = `${progress.multiplication} / ${FIRST_MISSION_TARGET}`;
  ui.missionMenuDivision.textContent = `${progress.division} / ${FIRST_MISSION_TARGET}`;
  ui.missionStatusText.textContent = firstMissionDone
    ? "Mission complete. Saved to Archive."
    : "Mission active. Keep training every power.";
  ui.archiveStatusText.textContent = firstMissionDone
    ? "Finished: Train Every Power."
    : "No finished missions yet.";
  ui.themeProgressText.textContent = !nextTheme
    ? "All theme milestones are unlocked."
    : `Next theme unlocks at best streak ${nextTheme.streak}. Unlocked ${unlockedThemeCount} of ${THEME_UNLOCKS.length}.`;
}

function updateModeUi() {
  document.body.dataset.gameMode = state.gameMode;

  if (isCampaignMode()) {
    const lesson = getCurrentLesson();
    const skillRecord = ensureSkillMastery(lesson);
    const progressRatio = state.campaignComplete ? 1 : clamp(state.campaignCorrect / lesson.targetCorrect, 0, 1);
    ui.lessonPanelLabel.textContent = isPlanetCampaignMode() ? "Planet Campaign" : "Campaign";
    ui.lessonPanelSubtitle.textContent = isPlanetCampaignMode()
      ? "Protect the planet with quick math commands."
      : "One mission deck teaches, checks, and repairs the current skill.";
    ui.answerPanelLabel.textContent = isPlanetCampaignMode() ? "Defense Commands" : "Campaign Deck";
    ui.answerPanelSubtitle.textContent = state.campaignComplete
      ? "Campaign complete. Keep practicing or open Infinite Galaxy."
      : isPlanetCampaignMode()
        ? "Tap the right command to fire, shield, repair, or launch drones."
        : "Correct answers clear attackers. Wrong answers cost population and reveal a hint.";
    ui.campaignPanel.classList.remove("hidden");
    ui.campaignGalaxyLabel.textContent = lesson.galaxy;
    ui.campaignLessonTitle.textContent = state.campaignComplete ? "Campaign Complete" : lesson.title;
    ui.campaignLessonGoal.textContent = state.campaignComplete
      ? "You finished the current learning path."
      : lesson.goal;
    ui.campaignAgeTag.textContent = isPlanetCampaignMode() ? getPlanetCampaignPathLabel() : formatAgeRange(lesson.ageRange);
    ui.campaignStandardTag.textContent = state.campaignComplete ? "Review path" : formatStandardTag(lesson);
    ui.campaignSupportTag.textContent = state.campaignComplete ? "Spaced review" : formatSupportTag(lesson);
    ui.campaignLessonMeter.style.width = `${progressRatio * 100}%`;
    ui.campaignLessonProgress.textContent = state.campaignComplete
      ? `${campaignLessons.length} / ${campaignLessons.length} missions complete`
      : `${state.campaignCorrect} / ${lesson.targetCorrect} correct - ${skillRecord.state.replaceAll("_", " ")}`;
    const showHint = state.campaignMistakes > 0 || skillRecord.state === "needs_support";
    ui.campaignTeachingHint.textContent = state.campaignComplete
      ? "Campaign complete."
      : showHint ? lesson.hint : "Hint appears after a wrong answer.";
    ui.campaignTeachingHint.classList.toggle("is-waiting", !showHint && !state.campaignComplete);
    ui.campaignMasteryEvidence.textContent = state.campaignComplete
      ? "Evidence: all campaign planets saved, with review still available."
      : getMasteryEvidenceText(lesson);
    ui.campaignRewardText.textContent = lesson.reward;
    if (ui.planetCampaignRoute) {
      ui.planetCampaignRoute.textContent = `${getPlanetCampaignPathLabel()} · ${lesson.galaxy}`;
    }
    if (ui.planetCampaignCommand) {
      ui.planetCampaignCommand.textContent = `${lesson.reward} command ready`;
    }
    if (ui.rewardTowerArt) {
      ui.rewardTowerArt.className = `reward-tower-art reward-tower-${lesson.rewardCategory}`;
    }
    return;
  }

  if (state.gameMode === "practice") {
    const lesson = getPracticeLesson();
    ui.lessonPanelLabel.textContent = "Practice Lab";
    ui.lessonPanelSubtitle.textContent = "Practice one skill without survival pressure.";
    ui.answerPanelLabel.textContent = "Practice Question";
    ui.answerPanelSubtitle.textContent = "Correct answers charge the Planet. Wrong answers give hints.";
    ui.campaignPanel.classList.remove("hidden");
    ui.campaignGalaxyLabel.textContent = lesson.galaxy;
    ui.campaignLessonTitle.textContent = lesson.title;
    ui.campaignLessonGoal.textContent = lesson.goal;
    ui.campaignAgeTag.textContent = "Practice";
    ui.campaignStandardTag.textContent = formatStandardTag(lesson);
    ui.campaignSupportTag.textContent = "Hint support";
    ui.campaignLessonMeter.style.width = `${Math.min(100, (state.streak % 10) * 10)}%`;
    ui.campaignLessonProgress.textContent = `${state.streak % 10} / 10 practice charge`;
    ui.campaignTeachingHint.textContent = lesson.hint;
    ui.campaignMasteryEvidence.textContent = "Practice evidence: streak charge, hints, and confidence feedback.";
    ui.campaignRewardText.textContent = lesson.reward;
    return;
  }

  ui.lessonPanelLabel.textContent = "Infinite Galaxy";
  ui.lessonPanelSubtitle.textContent = "Endless defense. Pick a power and survive as long as you can.";
  ui.answerPanelLabel.textContent = "Defense Question";
  ui.answerPanelSubtitle.textContent = "Correct answers upgrade the Planet. Wrong answers create real survival pressure.";
  ui.campaignPanel.classList.add("hidden");
}

function showRepairCompletePopup(message) {
  showTutorialCallout({
    target: "status",
    title: "Repair Complete",
    message,
    label: "Repair",
    pauseCombat: true,
    onDismiss: "repair-complete"
  });
}

function showRepairFailedPopup() {
  showTutorialCallout({
    target: "repair-panel",
    title: "Repair Failed",
    message: "No worries. The Planet returned to the checkpoint. Tap anywhere to try again.",
    label: "Repair",
    pauseCombat: true,
    onDismiss: "repair-failed"
  });
}

function updateUi() {
  const rules = getModeRules();
  const planetState = getPlanetState();
  const dangerLevel = getDangerLevel();
  if (ui.level) {
    ui.level.textContent = String(state.level);
  }
  if (ui.planetStateLabel) {
    ui.planetStateLabel.textContent = rules.planetStateLabel;
  }
  if (ui.populationStatusLabel) {
    ui.populationStatusLabel.textContent = rules.populationLabel;
  }
  if (ui.timerStatusLabel) {
    ui.timerStatusLabel.textContent = rules.timerLabel;
  }
  ui.planetState.textContent = planetState;
  ui.planetState.style.color = state.zombieDead || state.repairMode ? "var(--red)" : getDangerColor(dangerLevel);
  ui.populationLive.textContent = `${state.population}%`;
  ui.populationLive.style.color = state.population > 60 ? "var(--green)" : state.population > 20 ? "var(--gold)" : "var(--red)";
  const campaignFocus = isCampaignMode()
    ? Math.round(clamp(state.campaignCorrect / Math.max(1, getCurrentLesson().targetCorrect), 0, 1) * 100)
    : 100;
  ui.survivalTimer.textContent = rules.countdown
    ? formatClock(state.survivalClockSec)
    : isCampaignMode() ? `${campaignFocus}%` : "Ready";
  ui.survivalTimer.style.color = rules.countdown
    ? state.survivalClockSec > 60 ? "var(--green)" : state.survivalClockSec > 20 ? "var(--gold)" : "var(--red)"
    : isCampaignMode()
      ? campaignFocus >= 70 ? "var(--green)" : campaignFocus >= 35 ? "var(--gold)" : "var(--cyan)"
      : "var(--green)";
  if (ui.attack) {
    ui.attack.textContent = String(state.attack);
  }
  if (ui.regen) {
    ui.regen.textContent = `+${state.planetRegen.toFixed(1)}/s`;
  }
  if (ui.speed) {
    ui.speed.textContent = `${state.attackSpeed.toFixed(1)}/s`;
  }
  if (ui.targetCount) {
    ui.targetCount.textContent = String(state.targetCount);
  }
  if (ui.maxShieldLive) {
    ui.maxShieldLive.textContent = String(state.maxShield);
  }
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  ui.shieldRing.style.opacity = String(clamp(shieldRatio, 0, 1));
  ui.shieldRing.classList.toggle("shield-damaged", shieldRatio > 0 && shieldRatio < 0.55);
  ui.shieldRing.classList.toggle("shield-broken", shieldRatio <= 0.02);

  ui.categoryButtons.forEach((button) => {
    const category = button.dataset.category;
    const locked = isCategoryLocked(category);
    button.disabled = locked;
    button.classList.toggle("locked", locked);
  });

  ui.godModeBtn?.classList.toggle("active", state.godMode);
  if (ui.godModeBtn) {
    ui.godModeBtn.textContent = `God Mode: ${state.godMode ? "On" : "Off"}`;
  }
  ui.zombieModeBtn?.classList.toggle("active", state.zombieMode);
  if (ui.zombieModeBtn) {
    ui.zombieModeBtn.textContent = `Zombie Mode: ${state.zombieMode ? "On" : "Off"}`;
  }
  ui.swarmModeBtn?.classList.toggle("active", state.swarmLevel > 1);
  if (ui.swarmModeBtn) {
    ui.swarmModeBtn.textContent = `Swarm: ${state.swarmLevel}`;
  }
  ui.answerConsole.classList.toggle("tutorial-target", state.tutorialHighlightAnswer && (state.tutorialCalloutVisible || state.tutorialInputLocked));
  updateGuidedAnswerOptions();
  ui.tutorialMission.classList.add("hidden");

  updateModeUi();
  updateUpgradeTexts();
  updateMissionTexts();
  updateThemeLocks();
  renderEnemies();
}

function submitAnswer(selectedValue) {
  if (state.repairMode || state.tutorialCalloutVisible || state.tutorialInputLocked) {
    return;
  }

  if (isCampaignMode()) {
    if (isAnswerCorrect(selectedValue, state.question)) {
      applyCampaignCorrectAnswer();
      nextQuestion();
    } else {
      handleCampaignWrongAnswer();
    }
    return;
  }

  if (state.gameMode === "practice") {
    if (isAnswerCorrect(selectedValue, state.question)) {
      applyPracticeCorrectAnswer();
      nextQuestion();
    } else {
      handlePracticeWrongAnswer();
    }
    return;
  }

  if (isCategoryLocked(state.category)) {
    setBanner("This path is locked. Choose a different one.");
    return;
  }

  if (isAnswerCorrect(selectedValue, state.question)) {
    const reviewLesson = state.question.skillId ? getLessonBySkillId(state.question.skillId) : null;
    if (reviewLesson) {
      recordSkillAttempt(reviewLesson, true);
    }
    applyCorrectAnswerReward(state.category);
  } else {
    const reviewLesson = state.question.skillId ? getLessonBySkillId(state.question.skillId) : null;
    if (reviewLesson) {
      recordSkillAttempt(reviewLesson, false);
    }
    handleWrongAnswer();
  }

  nextQuestion();
}

function submitRepairAnswer(selectedValue) {
  if (state.tutorialCalloutVisible || state.tutorialInputLocked) {
    return;
  }

  state.repairAttempts += 1;
  if (isAnswerCorrect(selectedValue, state.repairQuestion)) {
    state.repairCorrect += 1;
  }

  ui.repairProgressText.textContent = `${state.repairCorrect} of ${state.repairTarget} correct`;

  if (state.repairAttempts >= state.repairTarget) {
    state.repairMode = false;
    ui.repairPanel.classList.add("hidden");

    if (isCampaignMode() || isPracticeMode()) {
      const lesson = isCampaignMode() ? getCurrentLesson() : getPracticeLesson();
      const record = ensureSkillMastery(lesson);

      if (state.repairCorrect === state.repairTarget) {
        record.state = "guided";
        record.currentStreak = 0;
        state.campaignMistakes = 0;
        state.population = Math.max(state.population, getModeRules().repairTrustFloor);
        state.repairBoostSec = 12;
        state.lastAttack = 0;
        saveProgress();
        showRepairCompletePopup(isCampaignMode()
          ? "Repair complete. Population is stable and the same mission continues with support."
          : "Practice repair complete. Confidence is stable and practice can continue.");
        nextQuestion();
        return;
      }

      record.state = "needs_support";
      state.campaignMistakes = Math.min(2, state.campaignMistakes + 1);
      state.population = Math.max(state.population, 35);
      saveProgress();
      showRepairCompletePopup(isCampaignMode()
        ? "Partial repair. The mission continues, but hints stay important."
        : "Partial repair. Keep practicing with hints.");
      nextQuestion();
      return;
    }

    if (state.repairCorrect === state.repairTarget) {
      applyCheckpointState(100, 1, false);
      state.streak = state.savedStreakAtFailure;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.checkpointRecoveryAnswers = 0;
      state.savedStreakAtFailure = 0;
      state.repairBoostSec = 10;
      state.lastAttack = 0;
      showRepairCompletePopup("Perfect repair. The Planet gets a 10 second boost. Tap anywhere when you are ready.");
      nextQuestion();
      return;
    }

    if (state.repairCorrect > 0) {
      applyCheckpointState(50, 0.5);
      state.repairBoostSec = 10;
      state.lastAttack = 0;
      showRepairCompletePopup("Partial repair. The Planet gets a 10 second boost. Tap anywhere when you are ready.");
      nextQuestion();
      return;
    }

    resetToCheckpoint();
    showRepairFailedPopup();
    return;
  }

  nextRepairQuestion();
}

function setActiveCategoryButton(category) {
  ui.categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
}

function setCategory(category) {
  if (isCampaignMode()) {
    const lesson = getCurrentLesson();
    state.category = lesson.rewardCategory;
    setActiveCategoryButton(state.category);
    nextQuestion();
    return;
  }
  if (state.gameMode === "practice") {
    state.category = state.practiceSkill;
    setActiveCategoryButton(state.category);
    nextQuestion();
    return;
  }
  const forcedCategory = getForcedTutorialCategory();
  if (forcedCategory && category !== forcedCategory) {
    setBanner(`Try ${forcedCategory} first. It is the lesson right now.`);
    return;
  }
  if (isCategoryLocked(category)) {
    if (state.wrongLocks[category]) {
      setBanner(`${category} is locked until you answer another path.`);
    } else {
      setBanner(`${category} is resting. Upgrade other paths 2 times first.`);
    }
    return;
  }
  state.category = category;
  setActiveCategoryButton(category);
  setBanner(`${category} is ready. ${categoryEffects[category].feedback}`);
  nextQuestion();
}

function applyPanelScale(panel) {
  const panelId = panel.dataset.panel;
  const scale = (state.panelScales[panelId] || 1) * state.globalScale;
  panel.style.setProperty("--panel-scale", String(scale));
}

function applyAllPanelScales() {
  ui.movablePanels.forEach(applyPanelScale);
}

function primeLayoutPositions() {
  if (state.layoutPrimed) {
    return;
  }
  const shellRect = document.querySelector(".game-shell").getBoundingClientRect();

  ui.movablePanels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${rect.left - shellRect.left}px`;
    panel.style.top = `${rect.top - shellRect.top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.setProperty("--panel-offset-x", "0px");
    panel.style.setProperty("--panel-offset-y", "0px");
  });

  state.layoutPrimed = true;
  applyAllPanelScales();
}

function selectPanel(panel) {
  state.selectedPanelId = panel.dataset.panel;
  ui.movablePanels.forEach((node) => node.classList.toggle("panel-selected", node === panel));
  const scale = state.panelScales[state.selectedPanelId] || 1;
  if (ui.panelScaleInput) {
    ui.panelScaleInput.value = String(Math.round(scale * 100));
  }
}

function toggleLayoutEdit(forceOpen) {
  const next = typeof forceOpen === "boolean" ? forceOpen : !state.layoutEditMode;
  state.layoutEditMode = next;
  if (ui.layoutEditBtn) {
    ui.layoutEditBtn.textContent = next ? "Stop Moving UI" : "Move UI";
  }

  if (next) {
    primeLayoutPositions();
    ui.movablePanels.forEach((panel) => panel.classList.add("edit-mode"));
    if (!state.selectedPanelId && ui.movablePanels[0]) {
      selectPanel(ui.movablePanels[0]);
    }
    return;
  }

  ui.movablePanels.forEach((panel) => panel.classList.remove("edit-mode", "panel-selected"));
}

function resetLayout() {
  state.layoutPrimed = false;
  state.selectedPanelId = null;
  state.globalScale = 1;
  state.panelScales = {};
  if (ui.globalScaleInput) {
    ui.globalScaleInput.value = "100";
  }
  if (ui.panelScaleInput) {
    ui.panelScaleInput.value = "100";
  }

  ui.movablePanels.forEach((panel) => {
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.removeProperty("--panel-offset-x");
    panel.style.removeProperty("--panel-offset-y");
    panel.style.removeProperty("--panel-scale");
  });

  if (state.layoutEditMode) {
    primeLayoutPositions();
    selectPanel(ui.movablePanels[0]);
  }
}

function initLayoutEditor() {
  let activeDrag = null;
  const shellRectProvider = () => document.querySelector(".game-shell").getBoundingClientRect();

  ui.movablePanels.forEach((panel) => {
    panel.addEventListener("pointerdown", (event) => {
      if (!state.layoutEditMode) {
        return;
      }

      event.preventDefault();
      selectPanel(panel);

      const rect = panel.getBoundingClientRect();
      const shellRect = shellRectProvider();
      activeDrag = {
        panel,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        shellRect
      };
      panel.setPointerCapture(event.pointerId);
    });
  });

  window.addEventListener("pointermove", (event) => {
    if (!activeDrag || !state.layoutEditMode) {
      return;
    }

    const panel = activeDrag.panel;
    const shellRect = shellRectProvider();
    const scale = (state.panelScales[panel.dataset.panel] || 1) * state.globalScale;
    const width = panel.offsetWidth * scale;
    const height = panel.offsetHeight * scale;

    const nextLeft = clamp(event.clientX - shellRect.left - activeDrag.offsetX, 0, Math.max(0, shellRect.width - width));
    const nextTop = clamp(event.clientY - shellRect.top - activeDrag.offsetY, 0, Math.max(0, shellRect.height - height));

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
  });

  window.addEventListener("pointerup", () => {
    activeDrag = null;
  });

  ui.menuToggleBtn?.addEventListener("click", () => {
    ui.menuPanel.classList.toggle("hidden");
  });
  ui.menuCloseBtn?.addEventListener("click", () => {
    ui.menuPanel.classList.add("hidden");
  });
  ui.menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMenuTab(tab.dataset.menuTab));
  });
  ui.layoutEditBtn?.addEventListener("click", () => toggleLayoutEdit());
  ui.layoutResetBtn?.addEventListener("click", resetLayout);
  ui.godModeBtn?.addEventListener("click", () => {
    state.godMode = !state.godMode;
    state.godModeElapsedSec = 0;
    if (state.godMode) {
      skipTutorialForGodMode();
      state.zombieDead = false;
      state.repairMode = false;
      ui.repairPanel.classList.add("hidden");
      state.baseHp = state.maxBaseHp;
      state.shield = state.maxShield;
      setBanner("God Mode on. Tutorial skipped and the Planet cannot die.");
    } else {
      setBanner("God Mode off.");
    }
    updateUi();
  });
  ui.zombieModeBtn?.addEventListener("click", () => {
    state.zombieMode = !state.zombieMode;
    if (!state.zombieMode && state.zombieDead) {
      setBanner("Zombie Mode off. The Planet stays dead until repaired or reset.");
    } else {
      setBanner(`Zombie Mode ${state.zombieMode ? "on" : "off"}.`);
    }
    updateUi();
  });
  ui.swarmModeBtn?.addEventListener("click", () => {
    state.swarmLevel = state.swarmLevel >= 10 ? 1 : state.swarmLevel + 1;
    setBanner(`Swarm level ${state.swarmLevel}. More enemies, weaker stats.`);
    updateUi();
  });
  ui.themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (applyTheme(button.dataset.theme)) {
        setBanner(`${button.querySelector("strong").textContent} is ready.`, { remember: false });
      }
    });
  });

  ui.globalScaleInput?.addEventListener("input", () => {
    state.globalScale = Number(ui.globalScaleInput.value) / 100;
    applyAllPanelScales();
  });

  ui.panelScaleInput?.addEventListener("input", () => {
    if (!state.selectedPanelId) {
      return;
    }
    state.panelScales[state.selectedPanelId] = Number(ui.panelScaleInput.value) / 100;
    const panel = ui.movablePanels.find((node) => node.dataset.panel === state.selectedPanelId);
    if (panel) {
      applyPanelScale(panel);
    }
  });
}

ui.answerOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".answer-option");
  if (button && ui.answerOptions.contains(button)) {
    submitAnswer(button.dataset.value);
  }
});
ui.repairAnswerOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".repair-answer-option");
  if (button && ui.repairAnswerOptions.contains(button)) {
    submitRepairAnswer(button.dataset.value);
  }
});
ui.campaignResultMapBtn?.addEventListener("click", () => {
  closeCampaignResult();
  openCampaignMap();
});
ui.campaignResultNextBtn?.addEventListener("click", () => {
  if (state.campaignComplete) {
    closeCampaignResult();
    openCampaignMap();
    return;
  }
  const nextIndex = getCampaignUnlockedIndex();
  closeCampaignResult();
  openCampaignMap({ remember: false });
  startCampaignMapLesson(nextIndex);
});
ui.planetCoreBtn.addEventListener("click", handlePlanetClick);
ui.categoryButtons.forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});
ui.tutorialOverlay.addEventListener("click", dismissTutorialCallout);
window.addEventListener("resize", () => {
  if (state.tutorialCalloutVisible) {
    updateUi();
  }
  if (state.campaignMapOpen) {
    renderCampaignMap();
  }
});

let lastFrame = performance.now();
function gameLoop(timestamp) {
  const deltaSec = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;
  const rules = getModeRules();

  if (!isCombatPaused()) {
    if (state.godMode) {
      state.godModeElapsedSec += deltaSec;
    }
    if (!state.tutorialCalloutVisible || state.tutorialDismissAction !== "repair-complete") {
      state.repairBoostSec = Math.max(0, state.repairBoostSec - deltaSec);
    }
    if (state.safetyModeSec > 0 && !state.tutorialActive) {
      state.safetyModeSec = Math.max(0, state.safetyModeSec - deltaSec);
    } else if (rules.countdown) {
      state.survivalClockSec = Math.max(0, state.survivalClockSec - deltaSec);
    } else {
      state.survivalClockSec = getSafetyResetSeconds();
    }
    state.elapsedSec += deltaSec;
    state.threatMultiplier = getThreatMultiplier();
    runSpawning(deltaSec);
    processEnemies(deltaSec);
    autoAttack(timestamp);
    applyPassiveSystems(deltaSec);
    if (rules.timerFailure && state.survivalClockSec <= 0 && state.baseHp > 0) {
      triggerPlanetFailure("attack");
    }
  } else if (!state.repairMode) {
    state.repairBoostSec = Math.max(0, state.repairBoostSec - deltaSec);
    if (state.safetyModeSec > 0 && !state.tutorialActive && !state.tutorialCalloutVisible) {
      state.safetyModeSec = Math.max(0, state.safetyModeSec - deltaSec);
    }
  }
  updateUi();

  requestAnimationFrame(gameLoop);
}

loadProgress();
syncThemeUnlocks();
recalculatePlanetStats();
initLayoutEditor();
applyTheme(state.theme);
setMenuTab("overview");
state.survivalClockSec = getSafetyResetSeconds();
spawnOpeningWave();
setCategory("addition");
if (isCampaignMode()) {
  state.campaignMapOpen = true;
  state.tutorialActive = false;
  state.tutorialPauseCombat = false;
  openCampaignMap({ remember: false });
} else {
  startTutorial();
}
updateUi();
requestAnimationFrame(gameLoop);
