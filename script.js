const state = {
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
  tutorialPhase: "intro-power",
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
const SAFETY_REWARD_SECONDS = 300;
const TUTORIAL_START_SAFETY_SECONDS = 45;
const TUTORIAL_BUILD_TARGET = 10;
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

const tutorialPhases = {
  "intro-power": {
    category: "addition",
    forcedCategory: "addition",
    target: "addition",
    title: "Power",
    message: "This is Power. It helps the Planet hit harder. Tap anywhere, then answer on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => state.upgrades.addition >= 1,
    next: "intro-shield"
  },
  "intro-shield": {
    category: "subtraction",
    forcedCategory: "subtraction",
    target: "subtraction",
    title: "Shield",
    message: "This is Shield. It gives the Planet more health and more shield. Tap anywhere, then answer on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => state.upgrades.subtraction >= 1,
    next: "intro-multishot"
  },
  "intro-multishot": {
    category: "multiplication",
    forcedCategory: "multiplication",
    target: "multiplication",
    title: "Multishot",
    message: "This is Multishot. It lets the Planet hit more enemies. Tap anywhere, then answer on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => state.upgrades.multiplication >= 1,
    next: "intro-regen"
  },
  "intro-regen": {
    category: "division",
    forcedCategory: "division",
    target: "division",
    title: "Regen",
    message: "This is Regen. It helps the Planet heal over time. Tap anywhere, then answer on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => state.upgrades.division >= 1,
    next: "lock-demo"
  },
  "lock-demo": {
    category: "addition",
    forcedCategory: "addition",
    target: "addition",
    title: "Resting Path",
    message: "Use Power more. One path can rest if you use it too much. Tap anywhere, then answer on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => state.spamLockCategory === "addition",
    next: "power-warning"
  },
  "power-warning": {
    target: "upgrade-console",
    title: "More Than Power",
    message: "Power is strong, but the Planet also needs Shield, Multishot, and Regen. Now grow the other paths too.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: (category, wasCorrect) => wasCorrect,
    next: "unlock-demo"
  },
  "unlock-demo": {
    target: "upgrade-console",
    title: "Wake It Up",
    message: "Power is resting now. Answer 2 other paths to wake it up again. Use the answers on the right.",
    highlightAnswer: true,
    requireAnswer: true,
    nextWhen: () => !state.spamLockCategory,
    next: "build-all"
  },
  "build-all": {
    target: "upgrade-console",
    title: "Urgent Mission",
    message: "Mission: make every path reach 10. Track it here, then get ready for a huge swarm.",
    highlightAnswer: true,
    requireAnswer: true,
    onStart: () => {
      ui.tutorialMissionCopy.textContent = "Raise every path to 10 before the next swarm.";
    },
    nextWhen: () => getCategories().every((key) => state.upgrades[key] >= TUTORIAL_BUILD_TARGET),
    next: "loss-sim"
  },
  "loss-sim": {
    target: "status",
    title: "Big Attack",
    message: "A big attack is coming. Watch the Planet. Tap anywhere when you are ready.",
    onStart: () => {
      state.survivalClockSec = 10;
      state.correctSinceSafetyMode = 0;
    },
    onDismiss: "resume-combat"
  },
  "repair-demo": {
    target: "repair-panel",
    title: "Repair Time",
    message: "It is okay to lose. Repair can save your progress. Tap anywhere, then answer the repair questions.",
    highlightAnswer: true,
    requireAnswer: true
  },
  complete: {
    target: "answer-console",
    title: "You Are Ready",
    message: "Great job. You get a short safe start. After this, every 10 right answers gives 5 minutes of Eureka Boost.",
    onStart: () => {
      state.tutorialActive = false;
      state.tutorialPhase = "complete";
      state.correctSinceSafetyMode = 0;
      state.safetyModeSec = TUTORIAL_START_SAFETY_SECONDS;
    },
    onDismiss: "complete-tutorial"
  }
};

const ui = {
  menuToggleBtn: document.getElementById("menu-toggle-btn"),
  menuPanel: document.getElementById("menu-panel"),
  menuCloseBtn: document.getElementById("menu-close-btn"),
  menuTabs: Array.from(document.querySelectorAll(".menu-tab")),
  menuSections: Array.from(document.querySelectorAll(".menu-section")),
  upgradeConsole: document.querySelector('[data-panel="upgrade-console"]'),
  answerConsole: document.querySelector('[data-panel="answer-console"]'),
  tutorialMission: document.getElementById("tutorial-mission"),
  tutorialMissionCopy: document.getElementById("tutorial-mission-copy"),
  missionAddition: document.getElementById("mission-addition"),
  missionSubtraction: document.getElementById("mission-subtraction"),
  missionMultiplication: document.getElementById("mission-multiplication"),
  missionDivision: document.getElementById("mission-division"),
  missionMenuAddition: document.getElementById("mission-menu-addition"),
  missionMenuSubtraction: document.getElementById("mission-menu-subtraction"),
  missionMenuMultiplication: document.getElementById("mission-menu-multiplication"),
  missionMenuDivision: document.getElementById("mission-menu-division"),
  missionStatusText: document.getElementById("mission-status-text"),
  themeProgressText: document.getElementById("theme-progress-text"),
  archiveStatusText: document.getElementById("archive-status-text"),
  level: document.getElementById("level-value"),
  planetState: document.getElementById("planet-state-text"),
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
  shieldRing: document.getElementById("shield-ring"),
  systemBanner: document.getElementById("system-banner"),
  tutorialOverlay: document.getElementById("tutorial-overlay"),
  tutorialHighlight: document.getElementById("tutorial-highlight"),
  tutorialCallout: document.getElementById("tutorial-callout"),
  tutorialCalloutLabel: document.getElementById("tutorial-callout-label"),
  tutorialCalloutTitle: document.getElementById("tutorial-callout-title"),
  tutorialCalloutCopy: document.getElementById("tutorial-callout-copy"),
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
  movablePanels: Array.from(document.querySelectorAll("[data-panel]")).filter((node) => node.id !== "menu-toggle")
};

const enemyNodes = new Map();
const SAVE_KEY = "planet-math-defense-save";

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

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return;
    }
    const saved = JSON.parse(raw);
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
  } catch {
    state.unlockedThemes = ["cold-scifi"];
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({
      bestStreak: state.bestStreak,
      unlockedThemes: state.unlockedThemes,
      theme: state.theme
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

function getTutorialTargetElement(target) {
  if (target === "addition") {
    return document.querySelector('[data-category="addition"]');
  }
  if (target === "subtraction") {
    return document.querySelector('[data-category="subtraction"]');
  }
  if (target === "multiplication") {
    return document.querySelector('[data-category="multiplication"]');
  }
  if (target === "division") {
    return document.querySelector('[data-category="division"]');
  }
  if (target === "upgrade-console") {
    return document.querySelector('[data-panel="upgrade-console"]');
  }
  if (target === "answer-console") {
    return document.querySelector('[data-panel="answer-console"]');
  }
  if (target === "status") {
    return document.querySelector('[data-panel="status"]');
  }
  if (target === "repair-panel") {
    return document.getElementById("repair-panel");
  }
  return document.getElementById("planet-core-btn");
}

function positionTutorialCallout(target) {
  const targetNode = getTutorialTargetElement(target);
  const shellRect = document.querySelector(".game-shell").getBoundingClientRect();
  const callout = ui.tutorialCallout;

  if (!targetNode || !callout) {
    return;
  }

  const rect = targetNode.getBoundingClientRect();
  const localLeft = rect.left - shellRect.left;
  const localTop = rect.top - shellRect.top;
  const localWidth = rect.width;
  const localHeight = rect.height;

  ui.tutorialHighlight.style.left = `${Math.max(8, localLeft - 8)}px`;
  ui.tutorialHighlight.style.top = `${Math.max(8, localTop - 8)}px`;
  ui.tutorialHighlight.style.width = `${Math.min(shellRect.width - 16, localWidth + 16)}px`;
  ui.tutorialHighlight.style.height = `${Math.min(shellRect.height - 16, localHeight + 16)}px`;

  const calloutWidth = Math.min(360, shellRect.width - 32);
  const targetCenterX = localLeft + localWidth / 2;
  const centeredLeft = localLeft + localWidth / 2 - calloutWidth / 2;
  const nextLeft = clamp(centeredLeft, 16, Math.max(16, shellRect.width - calloutWidth - 16));
  let nextTop = localTop + localHeight + 18;

  callout.style.width = `${calloutWidth}px`;
  callout.style.left = `${nextLeft}px`;
  callout.style.top = `${Math.min(shellRect.height - callout.offsetHeight - 16, nextTop)}px`;

  const tailOffset = clamp(targetCenterX - nextLeft - 9, 20, calloutWidth - 38);
  callout.style.setProperty("--tutorial-tail-offset", `${tailOffset}px`);

  if (nextTop + callout.offsetHeight > shellRect.height - 16) {
    nextTop = Math.max(16, localTop - callout.offsetHeight - 18);
    callout.style.top = `${nextTop}px`;
    callout.dataset.tailSide = "top";
  } else {
    callout.dataset.tailSide = "bottom";
  }
}

function showTutorialCallout({ target, title, message, onDismiss = null, pauseCombat = true, label = "Tutorial", requireAnswer = false }) {
  state.tutorialPauseCombat = pauseCombat;
  state.tutorialCalloutVisible = true;
  state.tutorialInputLocked = true;
  state.tutorialDismissAction = onDismiss;
  state.tutorialRequiresAnswer = requireAnswer;
  ui.tutorialCalloutLabel.textContent = label;
  ui.tutorialCalloutTitle.textContent = title;
  ui.tutorialCalloutCopy.textContent = message;
  ui.tutorialOverlay.classList.remove("hidden");
  positionTutorialCallout(target);
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
  state.tutorialPauseCombat = false;
  state.tutorialCalloutVisible = false;
  state.tutorialDismissAction = null;
  state.tutorialRequiresAnswer = false;
  state.tutorialInputLocked = false;
  state.tutorialHighlightAnswer = false;
  ui.tutorialOverlay.classList.add("hidden");
  ui.tutorialMission.classList.add("hidden");
}

function queueTutorialCallout(config, delayMs = 1000) {
  clearTutorialCalloutTimer();
  state.tutorialPauseCombat = false;
  state.tutorialInputLocked = true;
  state.tutorialHighlightAnswer = Boolean(config.highlightAnswer);
  state.tutorialRequiresAnswer = Boolean(config.requireAnswer);
  state.tutorialCalloutTimer = window.setTimeout(() => {
    state.tutorialCalloutTimer = null;
    showTutorialCallout(config);
  }, delayMs);
}

function dismissTutorialCallout() {
  if (!state.tutorialCalloutVisible) {
    return;
  }

  if (state.tutorialRequiresAnswer) {
    state.tutorialCalloutVisible = false;
    state.tutorialInputLocked = false;
    ui.tutorialOverlay.classList.add("hidden");
    state.tutorialPauseCombat = false;
    updateUi();
    return;
  }

  state.tutorialCalloutVisible = false;
  state.tutorialInputLocked = false;
  ui.tutorialOverlay.classList.add("hidden");
  const dismissAction = state.tutorialDismissAction;
  state.tutorialDismissAction = null;
  state.tutorialPauseCombat = false;
  state.tutorialRequiresAnswer = false;

  if (dismissAction?.startsWith("next:")) {
    startTutorialPhase(dismissAction.slice(5));
  } else if (dismissAction === "complete-tutorial") {
  } else if (dismissAction === "repair-complete") {
    if (state.tutorialActive && state.tutorialPhase === "repair-demo") {
      startTutorialPhase("complete");
    }
  } else if (dismissAction === "repair-failed") {
    if (state.tutorialActive && state.tutorialPhase === "repair-demo") {
      startTutorialPhase("complete");
    }
  }
}

function isTutorialLossPhase() {
  return state.tutorialActive && state.tutorialPhase === "loss-sim";
}

function isCombatPaused() {
  return state.repairMode || state.tutorialPauseCombat;
}

function getForcedTutorialCategory() {
  return state.tutorialActive ? tutorialPhases[state.tutorialPhase]?.forcedCategory || null : null;
}

function getPlanetState() {
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
  const kind = REPAIR_QUESTION_CATEGORIES[randomInt(0, REPAIR_QUESTION_CATEGORIES.length - 1)];
  state.repairQuestion = getQuestion(kind, { easy: true });
  state.repairQuestion.options = buildAnswerOptions(state.repairQuestion.answer);
  ui.repairQuestionText.textContent = state.repairQuestion.prompt;
  ui.repairAnswerOptionButtons.forEach((button, index) => {
    const optionValue = state.repairQuestion.options[index];
    button.textContent = String(optionValue);
    button.dataset.value = String(optionValue);
    button.disabled = false;
    button.classList.remove("guided-correct", "guided-locked");
  });
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

  if (state.tutorialActive && state.tutorialPhase === "loss-sim") {
    state.tutorialPhase = "repair-demo";
    state.tutorialPauseCombat = true;
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
  state.survivalClockSec = SURVIVAL_BASE_SECONDS;
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

function startTutorialPhase(phase) {
  state.tutorialPhase = phase;
  const config = tutorialPhases[phase];
  if (!config) {
    return;
  }

  config.onStart?.();
  if (config.category) {
    setCategory(config.category);
  }
  queueTutorialCallout({
    target: config.target,
    title: config.title,
    message: config.message,
    highlightAnswer: Boolean(config.highlightAnswer),
    requireAnswer: Boolean(config.requireAnswer),
    pauseCombat: config.pauseCombat ?? true,
    onDismiss: config.onDismiss || null
  });

  updateUi();
}

function maybeAdvanceTutorial(category, wasCorrect = false) {
  if (!state.tutorialActive) {
    return;
  }

  const config = tutorialPhases[state.tutorialPhase];
  if (config?.nextWhen?.(category, wasCorrect)) {
    startTutorialPhase(config.next);
    return;
  }

  if (state.tutorialPhase === "build-all") {
    if (wasCorrect && state.upgrades[category] === TUTORIAL_BUILD_TARGET) {
      setBanner(`${category} reached 10. Pick another path now.`);
    }
  }
}

function buildAnswerOptions(answer) {
  const options = new Set([answer]);
  const spread = Math.max(3, Math.ceil(Math.abs(answer) * 0.35));

  while (options.size < 4) {
    const offset = randomInt(-spread, spread);
    let candidate = answer + offset;

    if (candidate === answer) {
      candidate = answer + spread + options.size;
    }

    if (candidate < 0) {
      candidate = Math.abs(candidate) + 1;
    }

    options.add(candidate);
  }

  return shuffleArray(Array.from(options));
}

function renderAnswerOptions() {
  ui.answerOptionButtons.forEach((button, index) => {
    const optionValue = state.question.options[index];
    button.textContent = String(optionValue);
    button.dataset.value = String(optionValue);
    button.disabled = false;
    button.classList.remove("guided-correct", "guided-locked");
  });
}

function shouldGuideMainAnswer() {
  return state.tutorialActive
    && state.tutorialHighlightAnswer
    && !state.tutorialCalloutVisible
    && !state.tutorialInputLocked
    && !state.repairMode
    && state.tutorialPhase !== "loss-sim";
}

function shouldGuideRepairAnswer() {
  return state.repairMode
    && state.tutorialActive
    && state.tutorialPhase === "repair-demo"
    && state.tutorialHighlightAnswer
    && !state.tutorialCalloutVisible
    && !state.tutorialInputLocked;
}

function updateGuidedAnswerOptions() {
  const guideMain = shouldGuideMainAnswer();
  ui.answerOptionButtons.forEach((button) => {
    const isCorrect = state.question && Number(button.dataset.value) === state.question.answer;
    button.disabled = guideMain && !isCorrect;
    button.classList.toggle("guided-correct", guideMain && isCorrect);
    button.classList.toggle("guided-locked", guideMain && !isCorrect);
  });

  const guideRepair = shouldGuideRepairAnswer();
  ui.repairAnswerOptionButtons.forEach((button) => {
    const isCorrect = state.repairQuestion && Number(button.dataset.value) === state.repairQuestion.answer;
    button.disabled = guideRepair && !isCorrect;
    button.classList.toggle("guided-correct", guideRepair && isCorrect);
    button.classList.toggle("guided-locked", guideRepair && !isCorrect);
  });
}

function nextQuestion() {
  state.question = getQuestion(state.category);
  state.question.options = buildAnswerOptions(state.question.answer);
  ui.questionText.textContent = state.question.prompt;
  renderAnswerOptions();
}

function getCategories() {
  return CATEGORY_KEYS;
}

function tutorialUsesLockRules() {
  return state.tutorialActive && (state.tutorialPhase === "lock-demo" || state.tutorialPhase === "unlock-demo");
}

function isCategoryLocked(category) {
  if (state.tutorialActive && !tutorialUsesLockRules()) {
    return false;
  }
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
  return SURVIVAL_BASE_SECONDS + Math.floor(state.streak / 5) * 5;
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
  if (state.tutorialActive && !tutorialUsesLockRules() && state.tutorialPhase !== "repair-demo" && state.tutorialPhase !== "loss-sim") {
    state.streak = 0;
    setBanner("Try again. Pick the best answer on the right.");
    return;
  }

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

  if (state.tutorialActive && state.tutorialPhase !== "repair-demo" && state.tutorialPhase !== "loss-sim") {
    setBanner(message);
    return;
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
  const urgency = clamp(1 - state.survivalClockSec / SURVIVAL_BASE_SECONDS, 0, 1);
  return 1 + timeStage * 0.18 + urgency * 0.6 + state.totalUpgrades * 0.015;
}

function getDangerWindow() {
  return Math.max(0, state.survivalClockSec);
}

function getPressureRatio() {
  if (state.safetyModeSec > 0 && !state.tutorialActive) {
    return 0;
  }
  if (isTutorialLossPhase()) {
    return 1;
  }
  return clamp(1 - getDangerWindow() / SURVIVAL_BASE_SECONDS, 0, 1);
}

function getEndgamePressure() {
  if (isTutorialLossPhase()) {
    return 1;
  }
  return clamp(1 - state.survivalClockSec / 20, 0, 1);
}

function getPlanetSafetyFloor() {
  if (state.godMode || state.zombieDead || state.repairMode) {
    return 0;
  }

  const collapseWindow = 20;
  const collapseRatio = clamp(state.survivalClockSec / collapseWindow, 0, 1);
  const protectedRatio = 0.2 * collapseRatio;
  return Math.round(state.maxBaseHp * protectedRatio);
}

function getSpawnInterval() {
  const pressure = getPressureRatio();
  const endgamePressure = getEndgamePressure();
  return Math.max(0.24, 1.05 - pressure * 0.28 - endgamePressure * 0.2 - Math.min(0.12, state.elapsedSec / 1200));
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
  const baseMinions = 4 + Math.floor(t / 18) + Math.floor(pressure * 12) + Math.floor(endgamePressure * 10);
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
  const deviceCap = window.innerWidth <= 760 || window.matchMedia("(pointer: coarse)").matches ? 180 : 260;
  return clamp(Math.round(baseCap * getSwarmCountMultiplier()), 3, deviceCap);
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
  const hpScale = 0.5 + timeStage * 0.1 + state.totalUpgrades * 0.015;
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
    speed: template.speed * (1 + timeStage * 0.018 + endgamePressure * 0.1),
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
  const defenseMultiplier = isRepairBoostActive() ? 0.1 : 1;
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
  ui.additionUpgradeText.textContent = `${state.upgrades.addition} power ups`;
  ui.subtractionUpgradeText.textContent = `${state.upgrades.subtraction} max ups`;
  ui.multiplicationUpgradeText.textContent = `${state.upgrades.multiplication} target ups`;
  ui.divisionUpgradeText.textContent = `${state.upgrades.division} regen ups`;
  ui.maxShieldStat.textContent = String(state.maxShield);
  ui.populationStat.textContent = `${state.population}%`;
  ui.checkpointStat.textContent = `Level ${getCheckpointLevel()}`;
  ui.bestStreakStat.textContent = String(state.bestStreak);
}

function updateMissionTexts() {
  const progress = {
    addition: Math.min(FIRST_MISSION_TARGET, state.upgrades.addition),
    subtraction: Math.min(FIRST_MISSION_TARGET, state.upgrades.subtraction),
    multiplication: Math.min(FIRST_MISSION_TARGET, state.upgrades.multiplication),
    division: Math.min(FIRST_MISSION_TARGET, state.upgrades.division)
  };
  const firstMissionDone = getCategories().every((key) => state.upgrades[key] >= FIRST_MISSION_TARGET);
  const unlockedThemeCount = THEME_UNLOCKS.filter((unlock) => isThemeUnlocked(unlock.theme)).length;
  const nextTheme = THEME_UNLOCKS.find((unlock) => !isThemeUnlocked(unlock.theme));

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
  const planetState = getPlanetState();
  const dangerLevel = getDangerLevel();
  ui.level.textContent = String(state.level);
  ui.planetState.textContent = planetState;
  ui.planetState.style.color = state.zombieDead || state.repairMode ? "var(--red)" : getDangerColor(dangerLevel);
  ui.populationLive.textContent = `${state.population}%`;
  ui.populationLive.style.color = state.population > 60 ? "var(--green)" : state.population > 20 ? "var(--gold)" : "var(--red)";
  ui.survivalTimer.textContent = formatClock(state.survivalClockSec);
  ui.survivalTimer.style.color = state.survivalClockSec > 60 ? "var(--green)" : state.survivalClockSec > 20 ? "var(--gold)" : "var(--red)";
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

  ui.godModeBtn.classList.toggle("active", state.godMode);
  ui.godModeBtn.textContent = `God Mode: ${state.godMode ? "On" : "Off"}`;
  ui.zombieModeBtn.classList.toggle("active", state.zombieMode);
  ui.zombieModeBtn.textContent = `Zombie Mode: ${state.zombieMode ? "On" : "Off"}`;
  ui.swarmModeBtn.classList.toggle("active", state.swarmLevel > 1);
  ui.swarmModeBtn.textContent = `Swarm: ${state.swarmLevel}`;
  ui.answerConsole.classList.toggle("tutorial-target", state.tutorialHighlightAnswer && (state.tutorialCalloutVisible || state.tutorialInputLocked));
  updateGuidedAnswerOptions();
  const missionVisible = state.tutorialActive && state.tutorialPhase === "build-all";
  ui.tutorialMission.classList.toggle("hidden", !missionVisible);
  if (missionVisible) {
    ui.missionAddition.textContent = `${Math.min(TUTORIAL_BUILD_TARGET, state.upgrades.addition)} / ${TUTORIAL_BUILD_TARGET}`;
    ui.missionSubtraction.textContent = `${Math.min(TUTORIAL_BUILD_TARGET, state.upgrades.subtraction)} / ${TUTORIAL_BUILD_TARGET}`;
    ui.missionMultiplication.textContent = `${Math.min(TUTORIAL_BUILD_TARGET, state.upgrades.multiplication)} / ${TUTORIAL_BUILD_TARGET}`;
    ui.missionDivision.textContent = `${Math.min(TUTORIAL_BUILD_TARGET, state.upgrades.division)} / ${TUTORIAL_BUILD_TARGET}`;
  }

  if (state.tutorialCalloutVisible) {
    positionTutorialCallout(tutorialPhases[state.tutorialPhase]?.target || "planet");
  }

  updateUpgradeTexts();
  updateMissionTexts();
  updateThemeLocks();
  renderEnemies();
}

function submitAnswer(selectedValue) {
  if (state.repairMode || state.tutorialCalloutVisible || state.tutorialInputLocked) {
    return;
  }

  if (state.tutorialActive && state.tutorialPhase === "loss-sim") {
    setBanner("Watch the big attack. The Planet will need repair soon.");
    return;
  }

  if (isCategoryLocked(state.category)) {
    setBanner("This path is locked. Choose a different one.");
    return;
  }

  if (Number(selectedValue) === state.question.answer) {
    applyCorrectAnswerReward(state.category);
  } else {
    handleWrongAnswer();
  }

  nextQuestion();
}

function submitRepairAnswer(selectedValue) {
  if (state.tutorialCalloutVisible || state.tutorialInputLocked) {
    return;
  }

  state.repairAttempts += 1;
  if (Number(selectedValue) === state.repairQuestion.answer) {
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

function setCategory(category) {
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
  ui.categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
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
  ui.godModeBtn.addEventListener("click", () => {
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
  ui.zombieModeBtn.addEventListener("click", () => {
    state.zombieMode = !state.zombieMode;
    if (!state.zombieMode && state.zombieDead) {
      setBanner("Zombie Mode off. The Planet stays dead until repaired or reset.");
    } else {
      setBanner(`Zombie Mode ${state.zombieMode ? "on" : "off"}.`);
    }
    updateUi();
  });
  ui.swarmModeBtn.addEventListener("click", () => {
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

ui.answerOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    submitAnswer(button.dataset.value);
  });
});
ui.repairAnswerOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    submitRepairAnswer(button.dataset.value);
  });
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
});

let lastFrame = performance.now();
function gameLoop(timestamp) {
  const deltaSec = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;

  if (!isCombatPaused()) {
    if (state.godMode) {
      state.godModeElapsedSec += deltaSec;
    }
    if (!state.tutorialCalloutVisible || state.tutorialDismissAction !== "repair-complete") {
      state.repairBoostSec = Math.max(0, state.repairBoostSec - deltaSec);
    }
    if (state.safetyModeSec > 0 && !state.tutorialActive) {
      state.safetyModeSec = Math.max(0, state.safetyModeSec - deltaSec);
    } else {
      state.survivalClockSec = Math.max(0, state.survivalClockSec - deltaSec);
    }
    state.elapsedSec += deltaSec;
    state.threatMultiplier = getThreatMultiplier();
    runSpawning(deltaSec);
    processEnemies(deltaSec);
    autoAttack(timestamp);
    applyPassiveSystems(deltaSec);
    if (state.survivalClockSec <= 0 && state.baseHp > 0) {
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
spawnOpeningWave();
startTutorialPhase("intro-power");
updateUi();
requestAnimationFrame(gameLoop);
