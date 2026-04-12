const state = {
  baseHp: 100,
  maxBaseHp: 100,
  shield: 30,
  maxShield: 30,
  attack: 8,
  attackSpeed: 1.05,
  planetRegen: 0.25,
  shieldRegen: 0.5,
  targetCount: 1,
  streak: 0,
  bestStreak: 0,
  population: 100,
  correctSincePopulationGain: 0,
  elapsedSec: 0,
  threatMultiplier: 1,
  totalUpgrades: 0,
  level: 1,
  savedStreakAtFailure: 0,
  checkpointSnapshot: null,
  checkpointGuard: false,
  checkpointRecoveryAnswers: 0,
  repairMode: false,
  repairAttempts: 0,
  repairCorrect: 0,
  repairTarget: 3,
  repairQuestion: null,
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
  theme: "nebula",
  panelScales: {},
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
const REPAIR_QUESTION_CATEGORIES = ["addition", "subtraction"];
const OPENING_WAVE_SIZE = 3;

const planetHints = [
  "Solve math to power the Planet. Each correct answer gives one upgrade.",
  "Every 5 correct answers saves 20% population and brings one heart back.",
  "Power raises damage. Shield raises max health and max shield.",
  "Multishot lets the Planet hit more targets. Regen heals health and shield over time.",
  "If one path locks, answer a different path to unlock it again.",
  "If population reaches 0%, finish the repair lesson to save your streak."
];

let bannerTimer = null;

const enemyTemplates = {
  diver: {
    name: "Diver",
    family: "minion",
    className: "enemy-diver",
    baseHp: 12,
    speed: 18,
    contactDamage: 9,
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
    baseHp: 15,
    speed: 12,
    contactDamage: 8,
    damageMode: "shield_break",
    holdProgress: 74,
    orbitSpeed: 0.38,
    rangedCooldown: 1.9,
    rangedDamage: 4,
    projectileClass: "enemy",
    targetPriority: 0
  },
  ranger: {
    name: "Ranger",
    family: "minion",
    className: "enemy-ranger",
    baseHp: 11,
    speed: 9,
    contactDamage: 0,
    damageMode: "normal",
    holdProgress: 38,
    orbitSpeed: 0.24,
    rangedCooldown: 2.5,
    rangedDamage: 6,
    projectileClass: "enemy",
    targetPriority: 2
  },
  melee: {
    name: "Melee",
    family: "minion",
    className: "enemy-melee",
    baseHp: 13,
    speed: 13,
    contactDamage: 0,
    damageMode: "surface_only",
    holdProgress: 88,
    orbitSpeed: -0.5,
    rangedCooldown: 1.8,
    rangedDamage: 5,
    projectileClass: "enemy-laser",
    targetPriority: 1
  },
  boss: {
    name: "Boss",
    family: "boss",
    className: "enemy-boss",
    baseHp: 32,
    speed: 8,
    contactDamage: 18,
    damageMode: "normal",
    holdProgress: 56,
    orbitSpeed: 0.2,
    rangedCooldown: 1.6,
    rangedDamage: 9,
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

const ui = {
  menuToggleBtn: document.getElementById("menu-toggle-btn"),
  menuPanel: document.getElementById("menu-panel"),
  menuCloseBtn: document.getElementById("menu-close-btn"),
  menuTabs: Array.from(document.querySelectorAll(".menu-tab")),
  menuSections: Array.from(document.querySelectorAll(".menu-section")),
  level: document.getElementById("level-value"),
  planetState: document.getElementById("planet-state-text"),
  attack: document.getElementById("attack-value"),
  regen: document.getElementById("regen-value"),
  speed: document.getElementById("speed-value"),
  targetCount: document.getElementById("target-count-value"),
  maxShieldLive: document.getElementById("max-shield-live"),
  populationLive: document.getElementById("population-live-text"),
  enemyField: document.getElementById("enemy-field"),
  projectileLayer: document.getElementById("projectile-layer"),
  planetCoreBtn: document.getElementById("planet-core-btn"),
  shieldRing: document.getElementById("shield-ring"),
  systemBanner: document.getElementById("system-banner"),
  questionText: document.getElementById("question-text"),
  answerInput: document.getElementById("answer-input"),
  submitAnswerBtn: document.getElementById("submit-answer-btn"),
  globalScaleInput: document.getElementById("global-scale-input"),
  panelScaleInput: document.getElementById("panel-scale-input"),
  layoutEditBtn: document.getElementById("layout-edit-btn"),
  layoutResetBtn: document.getElementById("layout-reset-btn"),
  repairPanel: document.getElementById("repair-panel"),
  repairCopy: document.getElementById("repair-copy"),
  repairQuestionText: document.getElementById("repair-question-text"),
  repairAnswerInput: document.getElementById("repair-answer-input"),
  repairSubmitBtn: document.getElementById("repair-submit-btn"),
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
  movablePanels: Array.from(document.querySelectorAll("[data-panel]")).filter((node) => node.id !== "menu-toggle")
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getArenaMetrics() {
  const bounds = ui.enemyField.getBoundingClientRect();
  const centerX = bounds.width / 2;
  const centerY = bounds.height / 2;
  const outerRadius = Math.min(bounds.width, bounds.height) * 0.47;
  const innerRadius = Math.min(bounds.width, bounds.height) * 0.16;
  return { bounds, centerX, centerY, outerRadius, innerRadius };
}

function getPlanetState() {
  if (state.repairMode || state.baseHp <= 0) {
    return "Needs Repair";
  }

  const requiredForSafety = Math.max(1, Math.floor(state.elapsedSec / 24));
  if (state.totalUpgrades >= requiredForSafety) {
    return "Safe";
  }
  return "In Danger";
}

function getCheckpointLevel() {
  if (!state.checkpointSnapshot) {
    return 0;
  }

  return 1 + Object.values(state.checkpointSnapshot.upgrades).reduce((sum, value) => sum + value, 0);
}

function nextRepairQuestion() {
  const kind = REPAIR_QUESTION_CATEGORIES[randomInt(0, REPAIR_QUESTION_CATEGORIES.length - 1)];
  state.repairQuestion = getQuestion(kind);
  ui.repairQuestionText.textContent = state.repairQuestion.prompt;
  ui.repairAnswerInput.value = "";
}

function cloneUpgrades() {
  return {
    addition: state.upgrades.addition,
    subtraction: state.upgrades.subtraction,
    multiplication: state.upgrades.multiplication,
    division: state.upgrades.division
  };
}

function captureCheckpointSnapshot() {
  state.checkpointSnapshot = {
    elapsedSec: state.elapsedSec,
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

  state.repairMode = true;
  state.repairAttempts = 0;
  state.repairCorrect = 0;
  ui.repairPanel.classList.remove("hidden");
  ui.repairProgressText.textContent = `0 of ${state.repairTarget} correct`;
  ui.repairCopy.textContent = reason === "population"
    ? "Population reached 0%. Answer 3 easy questions to save your streak and recover the Planet."
    : "The Planet broke under attack. Answer 3 easy questions to save your streak and recover the Planet.";
  nextRepairQuestion();
  setBanner("Checkpoint lesson ready. Save the Planet's streak.");
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
    state.question = null;
    resetCategoryLocks();
    state.enemies = [];
    state.enemyId = 1;
    state.lastAttack = 0;
    state.spawnTimer = 0;
    recalculatePlanetStats();
    applyCheckpointState(40, 0.5);
    setCategory("addition");
    spawnOpeningWave();
    return;
  }

  state.baseHp = 100;
  state.maxBaseHp = 100;
  state.shield = 30;
  state.maxShield = 30;
  state.attack = 8;
  state.attackSpeed = 1.05;
  state.planetRegen = 0.25;
  state.shieldRegen = 0.5;
  state.targetCount = 1;
  state.streak = 0;
  state.bestStreak = 0;
  state.population = 100;
  state.correctSincePopulationGain = 0;
  state.elapsedSec = 0;
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
  state.repairQuestion = null;
  state.category = "addition";
  state.question = null;
  resetCategoryLocks();
  state.enemies = [];
  state.enemyId = 1;
  state.lastAttack = 0;
  state.spawnTimer = 0;
  state.upgrades = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0
  };

  recalculatePlanetStats();
  setCategory("addition");
  spawnOpeningWave();
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
  state.theme = themeName;
  document.body.dataset.theme = themeName;
  ui.themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });
}

function getQuestion(category) {
  const total = Math.min(state.totalUpgrades, 12);
  let a;
  let b;
  let prompt;
  let answer;

  if (category === "addition") {
    a = randomInt(1, 5 + total);
    b = randomInt(1, 5 + total);
    prompt = `${a} + ${b} = ?`;
    answer = a + b;
  } else if (category === "subtraction") {
    a = randomInt(4, 10 + total);
    b = randomInt(1, a);
    prompt = `${a} - ${b} = ?`;
    answer = a - b;
  } else if (category === "multiplication") {
    a = randomInt(1, Math.min(6, 2 + Math.ceil(total / 2)));
    b = randomInt(1, 5 + Math.floor(total / 2));
    prompt = `${a} × ${b} = ?`;
    answer = a * b;
  } else {
    b = randomInt(1, Math.min(6, 2 + Math.ceil(total / 2)));
    answer = randomInt(1, 5 + Math.floor(total / 2));
    a = b * answer;
    prompt = `${a} ÷ ${b} = ?`;
  }

  return { prompt, answer };
}

function nextQuestion() {
  state.question = getQuestion(state.category);
  ui.questionText.textContent = state.question.prompt;
  ui.answerInput.value = "";
  ui.answerInput.focus();
}

function getCategories() {
  return CATEGORY_KEYS;
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

function losePopulation(reason) {
  const previous = state.population;
  state.population = Math.max(0, state.population - 20);

  if (previous > 0 && state.population === 0) {
    captureCheckpointSnapshot();
    captureFailureStreak();
    state.streak = 0;
    openRepairMode("population");
    return true;
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

  state.population = Math.min(100, state.population + 20);
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

  state.attack = 8 + add * 2;
  state.maxShield = 30 + sub * 5;
  state.maxBaseHp = 100 + sub * 6;
  state.shieldRegen = 0.45 + div * 0.35;
  state.targetCount = 1 + Math.floor(mul / 2);
  state.attackSpeed = 1.05 + mul * 0.05 + state.totalUpgrades * 0.015;
  state.planetRegen = 0.25 + div * 0.3;

  state.baseHp = clamp(state.baseHp, 0, state.maxBaseHp);
  state.shield = clamp(state.shield, 0, state.maxShield);
}

function applyCorrectAnswerReward(category) {
  if (state.focusCategory === category) {
    state.focusCount += 1;
  } else {
    if (state.spamLockCategory && category !== state.spamLockCategory) {
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
  state.correctSincePopulationGain += 1;
  state.wrongLocks[category] = false;
  clearWrongLocks(category);
  recalculatePlanetStats();

  if (state.checkpointGuard) {
    state.checkpointRecoveryAnswers += 1;
    if (state.checkpointRecoveryAnswers >= 5) {
      state.checkpointGuard = false;
      state.checkpointRecoveryAnswers = 0;
      setBanner("Checkpoint secured again. Your streak is safe for now.");
    }
  }

  if (state.focusCount >= 5) {
    state.spamLockCategory = category;
    state.spamUnlockProgress = 0;
  }

  const populationRecovered = state.correctSincePopulationGain >= 5 ? gainPopulationHeart() : false;

  if (category === "addition") {
    setBanner(populationRecovered ? "Great job. Addition made the Planet stronger and saved 20% population." : "Great job. Addition made the Planet stronger.");
  } else if (category === "subtraction") {
    setBanner(populationRecovered ? "Great job. Subtraction raised max health and shield and saved 20% population." : "Great job. Subtraction raised the Planet's max shield and health.");
  } else if (category === "multiplication") {
    setBanner(populationRecovered ? "Great job. Multiplication added more targets and saved 20% population." : "Great job. Multiplication added more targets.");
  } else {
    setBanner(populationRecovered ? "Great job. Division improved regen and saved 20% population." : "Great job. Division made the Planet heal faster.");
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
  const timeStage = Math.floor(state.elapsedSec / 10);
  return 1 + timeStage / 4 + state.totalUpgrades * 0.035;
}

function getSurvivalDeadline() {
  return 240 + state.totalUpgrades * 5;
}

function getDangerWindow() {
  return Math.max(0, getSurvivalDeadline() - state.elapsedSec);
}

function getSpawnInterval() {
  const pressure = clamp(1 - getDangerWindow() / 120, 0, 1);
  return Math.max(0.55, 1.95 - pressure * 0.65 - Math.min(0.25, state.totalUpgrades * 0.01));
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
  const pressure = clamp(1 - getDangerWindow() / 120, 0, 1);
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  const baseMinions = 6 + Math.floor(t / 45) + Math.floor(pressure * 6);
  const diversBoost = shieldRatio < 0.2 ? 2 : shieldRatio < 0.45 ? 1 : 0;
  const breakerBoost = shieldRatio > 0.55 ? 2 : shieldRatio > 0.3 ? 1 : 0;
  const meleeBoost = state.baseHp < state.maxBaseHp * 0.65 ? 1 : 0;

  return {
    diver: 2 + Math.floor(baseMinions * 0.26) + diversBoost,
    breaker: t < 15 ? 0 : 1 + Math.floor(baseMinions * 0.22) + breakerBoost,
    ranger: t < 25 ? 0 : 1 + Math.floor(baseMinions * 0.22),
    melee: t < 45 ? 0 : 1 + Math.floor(baseMinions * 0.18) + meleeBoost,
    boss: t < 150 ? 0 : Math.floor(pressure * 1.2)
  };
}

function chooseEnemyType() {
  const alive = getAliveCounts();
  const desired = getDesiredEnemyCounts();
  const shieldRatio = state.maxShield === 0 ? 0 : state.shield / state.maxShield;
  const pressure = clamp(1 - getDangerWindow() / 120, 0, 1);
  const scores = {};
  const types = ["diver", "breaker", "ranger", "melee", "boss"];

  types.forEach((type) => {
    const template = enemyTemplates[type];
    const missing = Math.max(0, desired[type] - alive[type]);
    const underrepresented = Math.max(0, 2 - alive[type]);
    let score = missing * 6 + underrepresented * 2;

    if (type === "breaker") {
      score += shieldRatio > 0.55 ? 8 : shieldRatio > 0.3 ? 4 : 0;
    } else if (type === "diver") {
      score += shieldRatio < 0.25 ? 8 : shieldRatio < 0.45 ? 4 : 1;
    } else if (type === "melee") {
      score += state.baseHp < state.maxBaseHp * 0.7 ? 6 : 2;
    } else if (type === "ranger") {
      score += 3 + Math.floor(pressure * 3);
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
  const pressure = clamp(1 - getDangerWindow() / 120, 0, 1);
  return 8 + Math.floor(state.elapsedSec / 45) + Math.floor(pressure * 8) + Math.min(5, Math.floor(state.totalUpgrades / 3));
}

function getUpgradePacePressure() {
  const expectedUpgrades = Math.floor(state.elapsedSec / 24);
  return Math.max(0, expectedUpgrades - state.totalUpgrades);
}

function getSpawnBatchSize() {
  const pressure = clamp(1 - getDangerWindow() / 120, 0, 1);
  const pacePressure = getUpgradePacePressure();
  if (pressure > 0.88 || pacePressure >= 4) {
    return 4;
  }
  if (pressure > 0.65 || pacePressure >= 2) {
    return 3;
  }
  return 2;
}

function createEnemyStats(type) {
  const template = enemyTemplates[type];
  const timeStage = Math.floor(state.elapsedSec / 10);
  const hpScale = 0.85 + timeStage * 0.04 + state.totalUpgrades * 0.015;
  const threat = state.threatMultiplier;

  return {
    maxHp: Math.round(template.baseHp * hpScale),
    speed: template.speed * (1 + timeStage * 0.035),
    contactDamage: Math.max(1, Math.round(template.contactDamage * (0.65 + threat * 0.16))),
    rangedDamage: Math.max(1, Math.round(template.rangedDamage * (0.62 + threat * 0.14))),
    rangedCooldown: template.rangedCooldown === 0 ? 0 : Math.max(0.9, template.rangedCooldown * (1 - Math.min(0.25, timeStage * 0.012)))
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
    rangedTimer: randomInt(40, 120) / 100,
    holdProgress: template.holdProgress,
    orbitSpeed: template.orbitSpeed,
    damageMode: template.damageMode,
    lastPoint: null
  });

  if (state.elapsedSec > 180) {
    setBanner("The swarm is getting stronger. Keep upgrading the Planet.");
  }
}

function dealDamageToPlanet(amount, mode = "normal") {
  let pending = amount;

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

  if (state.baseHp === 0) {
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
      enemy.angle += enemy.orbitSpeed * deltaSec;
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
  const attackInterval = 1000 / state.attackSpeed;
  if (timestamp - state.lastAttack < attackInterval || state.enemies.length === 0) {
    return;
  }
  state.lastAttack = timestamp;

  const metrics = getArenaMetrics();
  const targets = [...state.enemies]
    .sort((a, b) => {
      const priorityDelta = enemyTemplates[a.type].targetPriority - enemyTemplates[b.type].targetPriority;
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return b.progress - a.progress;
    })
    .slice(0, state.targetCount);

  targets.forEach((enemy, index) => {
    const point = getEnemyPoint(enemy);
    const damage = index === 0 ? state.attack : Math.round(state.attack * 0.85);
    enemy.hp -= damage;
    enemy.lastPoint = point;
    createProjectile(metrics.centerX, metrics.centerY, point.x, point.y, "friendly", 180);
    createImpact(point.x, point.y, "enemy-hit", 160);
  });

  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
}

function applyPassiveSystems(deltaSec) {
  state.shield = clamp(state.shield + state.shieldRegen * deltaSec, 0, state.maxShield);
  state.baseHp = clamp(state.baseHp + state.planetRegen * deltaSec, 0, state.maxBaseHp);
}

function runSpawning(deltaSec) {
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
  ui.enemyField.querySelectorAll(".enemy-card").forEach((node) => node.remove());

  state.enemies.forEach((enemy) => {
    const template = enemyTemplates[enemy.type];
    const point = enemy.lastPoint || getEnemyPoint(enemy);
    const card = document.createElement("div");
    card.className = `enemy-card ${template.className}`;
    card.style.left = `${point.x}px`;
    card.style.top = `${point.y}px`;
    card.innerHTML = `
      <div class="enemy-body"></div>
      <div class="enemy-hp"><div style="width:${(enemy.hp / enemy.maxHp) * 100}%"></div></div>
    `;
    ui.enemyField.appendChild(card);
  });
}

function updateUpgradeTexts() {
  ui.additionUpgradeText.textContent = `${state.upgrades.addition} power ups`;
  ui.subtractionUpgradeText.textContent = `${state.upgrades.subtraction} max ups`;
  ui.multiplicationUpgradeText.textContent = `${state.upgrades.multiplication} target ups`;
  ui.divisionUpgradeText.textContent = `${state.upgrades.division} regen ups`;
  ui.maxShieldStat.textContent = String(state.maxShield);
  ui.populationStat.textContent = `${state.population}%`;
  ui.checkpointStat.textContent = `Level ${getCheckpointLevel()}`;
  ui.bestStreakStat.textContent = String(state.bestStreak);
}

function updateUi() {
  const planetState = getPlanetState();
  ui.level.textContent = String(state.level);
  ui.planetState.textContent = planetState;
  ui.planetState.style.color = state.repairMode ? "var(--red)" : planetState === "Safe" ? "var(--green)" : "var(--gold)";
  ui.populationLive.textContent = `${state.population}%`;
  ui.populationLive.style.color = state.population > 60 ? "var(--green)" : state.population > 20 ? "var(--gold)" : "var(--red)";
  ui.attack.textContent = String(state.attack);
  ui.regen.textContent = `+${state.planetRegen.toFixed(1)}/s`;
  ui.speed.textContent = `${state.attackSpeed.toFixed(1)}/s`;
  ui.targetCount.textContent = String(state.targetCount);
  ui.maxShieldLive.textContent = String(state.maxShield);
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

  updateUpgradeTexts();
  renderEnemies();
}

function submitAnswer() {
  if (state.repairMode) {
    return;
  }
  const typed = Number(ui.answerInput.value);
  if (ui.answerInput.value.trim() === "") {
    setBanner("Type an answer first.");
    return;
  }

  if (isCategoryLocked(state.category)) {
    setBanner("This path is locked. Choose a different one.");
    return;
  }

  if (typed === state.question.answer) {
    applyCorrectAnswerReward(state.category);
  } else {
    handleWrongAnswer();
  }

  nextQuestion();
}

function submitRepairAnswer() {
  const typed = Number(ui.repairAnswerInput.value);
  if (ui.repairAnswerInput.value.trim() === "") {
    ui.repairProgressText.textContent = "Type an answer first.";
    return;
  }

  state.repairAttempts += 1;
  if (typed === state.repairQuestion.answer) {
    state.repairCorrect += 1;
  }

  ui.repairProgressText.textContent = `${state.repairCorrect} of ${state.repairTarget} correct`;

  if (state.repairAttempts >= state.repairTarget) {
    state.repairMode = false;
    ui.repairPanel.classList.add("hidden");

    if (state.repairCorrect === state.repairTarget) {
      applyCheckpointState(100, 1, false);
      state.streak = state.savedStreakAtFailure;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.checkpointRecoveryAnswers = 0;
      state.savedStreakAtFailure = 0;
      setBanner("Perfect repair. Full health, full shield, full population.");
      nextQuestion();
      return;
    }

    if (state.repairCorrect > 0) {
      applyCheckpointState(50, 0.5);
      setBanner("Partial repair. Half health, half shield, half population.");
      nextQuestion();
      return;
    }

    resetToCheckpoint();
    setBanner("Repair failed. The Planet returned to checkpoint.");
    return;
  }

  nextRepairQuestion();
}

function setCategory(category) {
  if (isCategoryLocked(category)) {
    if (state.wrongLocks[category]) {
      setBanner(`${category} is locked until you answer another path.`);
    } else {
      setBanner(`${category} is resting. Upgrade other paths 2 times first.`);
    }
    return;
  }
  state.category = category;
  ui.categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  setBanner(`${category} is ready. ${categoryEffects[category].feedback}`);
  nextQuestion();
}

function applyPanelScale(panel) {
  const panelId = panel.dataset.panel;
  const scale = (state.panelScales[panelId] || 1) * state.globalScale;
  panel.style.scale = String(scale);
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
    panel.style.transform = "none";
  });

  state.layoutPrimed = true;
  applyAllPanelScales();
}

function selectPanel(panel) {
  state.selectedPanelId = panel.dataset.panel;
  ui.movablePanels.forEach((node) => node.classList.toggle("panel-selected", node === panel));
  const scale = state.panelScales[state.selectedPanelId] || 1;
  ui.panelScaleInput.value = String(Math.round(scale * 100));
}

function toggleLayoutEdit(forceOpen) {
  const next = typeof forceOpen === "boolean" ? forceOpen : !state.layoutEditMode;
  state.layoutEditMode = next;
  ui.layoutEditBtn.textContent = next ? "Stop Moving UI" : "Move UI";

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
  ui.globalScaleInput.value = "100";
  ui.panelScaleInput.value = "100";

  ui.movablePanels.forEach((panel) => {
    panel.style.left = "";
    panel.style.top = "";
    panel.style.right = "";
    panel.style.bottom = "";
    panel.style.transform = "";
    panel.style.scale = "";
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

  ui.menuToggleBtn.addEventListener("click", () => {
    ui.menuPanel.classList.toggle("hidden");
  });
  ui.menuCloseBtn.addEventListener("click", () => {
    ui.menuPanel.classList.add("hidden");
  });
  ui.menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMenuTab(tab.dataset.menuTab));
  });
  ui.layoutEditBtn.addEventListener("click", () => toggleLayoutEdit());
  ui.layoutResetBtn.addEventListener("click", resetLayout);
  ui.themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.theme);
      setBanner(`${button.querySelector("strong").textContent} is ready.`, { remember: false });
    });
  });

  ui.globalScaleInput.addEventListener("input", () => {
    state.globalScale = Number(ui.globalScaleInput.value) / 100;
    applyAllPanelScales();
  });

  ui.panelScaleInput.addEventListener("input", () => {
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

ui.submitAnswerBtn.addEventListener("click", submitAnswer);
ui.answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAnswer();
  }
});
ui.repairSubmitBtn.addEventListener("click", submitRepairAnswer);
ui.repairAnswerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitRepairAnswer();
  }
});
ui.planetCoreBtn.addEventListener("click", handlePlanetClick);
ui.categoryButtons.forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});

let lastFrame = performance.now();
function gameLoop(timestamp) {
  const deltaSec = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;

  if (!state.repairMode) {
    state.elapsedSec += deltaSec;
    state.threatMultiplier = getThreatMultiplier();
    runSpawning(deltaSec);
    processEnemies(deltaSec);
    autoAttack(timestamp);
    applyPassiveSystems(deltaSec);
  }
  updateUi();

  requestAnimationFrame(gameLoop);
}

recalculatePlanetStats();
initLayoutEditor();
applyTheme(state.theme);
setCategory("addition");
setMenuTab("overview");
spawnOpeningWave();
setBanner("Help the Planet. Answer math questions to stop the swarm.");
updateUi();
requestAnimationFrame(gameLoop);
