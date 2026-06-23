const SAVE_KEY = "planet-math-defense-save";
const ACCOUNT_KEY = "galactacians-account";
const SESSION_KEY = "galactacians-session";
const accountSummary = loadAccountSummary();

const menuItems = [
  { label: "Campaign", action: "campaign" },
  { label: "Planet Campaign", action: "planet-campaign" },
  { label: "Infinite Galaxy", action: "infinite" },
  { label: "Practice Lab", action: "practice" },
  { label: accountSummary.signedIn ? "Profile" : "Sign Up", action: "account" },
  { label: "Stats", action: "stats" },
  { label: "Settings", action: "settings" },
  { label: "Missions", action: "missions" },
  { label: "Achievements", action: "achievements" },
  { label: "Quit", action: "quit" }
];

const settingsState = {
  music: 70,
  sfx: 80,
  fullscreen: false
};

const CAMPAIGN_LESSON_COUNT = 55;
const THEME_UNLOCKS = [
  { theme: "cold-scifi", name: "Cold Sci-Fi", streak: 0 },
  { theme: "solar-gold", name: "Solar Gold", streak: 5 },
  { theme: "matrix-grid", name: "Matrix Grid", streak: 10 },
  { theme: "code-editor", name: "Code Editor", streak: 15 },
  { theme: "cartoon-candy", name: "Cartoon Candy", streak: 20 },
  { theme: "storybook-horror", name: "Storybook Horror", streak: 25 },
  { theme: "funky-neon", name: "Funky Neon", streak: 30 },
  { theme: "metal-forge", name: "Metal Forge", streak: 35 },
  { theme: "paper-craft", name: "Paper Craft", streak: 40 },
  { theme: "ocean-pop", name: "Ocean Pop", streak: 45 }
];

const progressState = loadProgress();

const ui = {
  actions: document.getElementById("main-menu-actions"),
  settingsPanel: document.getElementById("settings-panel"),
  fadeOverlay: document.getElementById("fade-overlay"),
  hint: document.getElementById("menu-hint")
};

let focusedIndex = 0;
let gamepadCooldown = 0;

function createMenuButton(item, index) {
  const button = document.createElement("button");
  button.className = "menu-button";
  button.type = "button";
  button.textContent = item.label;
  button.dataset.action = item.action;
  button.setAttribute("aria-label", item.label);

  button.addEventListener("click", () => runAction(item.action));
  button.addEventListener("pointerenter", () => setFocusedIndex(index));
  button.addEventListener("focus", () => setFocusedIndex(index));

  return button;
}

function createRangeSetting(label, key, min = 0, max = 100) {
  const row = document.createElement("div");
  row.className = "settings-row";

  const title = document.createElement("label");
  title.textContent = `${label}: ${settingsState[key]}%`;

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.value = String(settingsState[key]);

  input.addEventListener("input", () => {
    settingsState[key] = Number(input.value);
    title.textContent = `${label}: ${settingsState[key]}%`;
    // Hook this value into your real audio mixer later.
  });

  row.append(title, input);
  return row;
}

function createToggleSetting(label, key, onToggle) {
  const row = document.createElement("div");
  row.className = "toggle-row";

  const text = document.createElement("strong");
  text.textContent = label;

  const button = document.createElement("button");
  button.className = "toggle-button";
  button.type = "button";
  button.setAttribute("aria-pressed", String(settingsState[key]));
  button.textContent = settingsState[key] ? "On" : "Off";

  button.addEventListener("click", async () => {
    settingsState[key] = !settingsState[key];
    await onToggle?.(settingsState[key]);
    button.setAttribute("aria-pressed", String(settingsState[key]));
    button.textContent = settingsState[key] ? "On" : "Off";
  });

  row.append(text, button);
  return row;
}

function renderMainMenu() {
  ui.actions.innerHTML = "";
  menuItems.forEach((item, index) => {
    ui.actions.appendChild(createMenuButton(item, index));
  });
  setFocusedIndex(0);
}

function renderSettingsPanel() {
  ui.settingsPanel.innerHTML = "";

  const head = document.createElement("div");
  head.className = "settings-head";
  head.innerHTML = `
    <div>
      <h2>Settings</h2>
      <p>Simple prototype controls. Replace with your final settings later.</p>
    </div>
  `;

  const closeButton = document.createElement("button");
  closeButton.className = "settings-close";
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", closeSettings);
  head.appendChild(closeButton);

  ui.settingsPanel.append(
    head,
    createRangeSetting("Music", "music"),
    createRangeSetting("SFX", "sfx"),
    createToggleSetting("Fullscreen", "fullscreen", toggleFullscreen),
    createThemeSettings()
  );
}

function renderStatsPanel() {
  renderInfoPanel("Stats", "Your saved learning progress on this browser.", [
    createInfoGrid([
      ["Best Streak", progressState.bestStreak],
      ["Campaign", progressState.campaignComplete ? "Complete" : `Mission ${progressState.campaignLessonIndex + 1}`],
      ["Mastery Route", progressState.campaignComplete ? "Finished" : "In progress"],
      ["Themes", `${getUnlockedThemes().length} / ${THEME_UNLOCKS.length}`],
      ["Selected Theme", getThemeName(progressState.theme)]
    ])
  ]);
}

function renderMissionsPanel() {
  const nextTheme = THEME_UNLOCKS.find((unlock) => !getUnlockedThemes().includes(unlock.theme));
  renderInfoPanel("Missions", "Main learning path and unlock goals.", [
    createInfoGrid([
      ["Main Path", progressState.campaignComplete ? "Finished" : "Campaign"],
      ["Current Mission", progressState.campaignComplete ? "All done" : `${progressState.campaignLessonIndex + 1} / ${progressState.campaignLessonCount}`],
      ["Next Theme", nextTheme ? `${nextTheme.name} at streak ${nextTheme.streak}` : "All unlocked"]
    ]),
    createPanelCopy("Campaign starts directly in the structured math route. Infinite Galaxy reviews secure and mastered skills as an endless defense sandbox.")
  ]);
}

function renderAchievementsPanel() {
  renderInfoPanel("Achievements", "Prototype achievement milestones.", [
    createInfoGrid([
      ["First Steps", progressState.campaignLessonIndex > 0 || progressState.campaignComplete ? "Unlocked" : "Locked"],
      ["Theme Collector", getUnlockedThemes().length >= 5 ? "Unlocked" : "Locked"],
      ["Campaign Hero", progressState.campaignComplete ? "Unlocked" : "Locked"]
    ])
  ]);
}

function renderInfoPanel(title, copy, rows) {
  ui.settingsPanel.innerHTML = "";
  const head = createPanelHead(title, copy);
  ui.settingsPanel.append(head, ...rows);
  openPanel();
}

function createPanelHead(title, copy) {
  const head = document.createElement("div");
  head.className = "settings-head";
  head.innerHTML = `
    <div>
      <h2>${title}</h2>
      <p>${copy}</p>
    </div>
  `;

  const closeButton = document.createElement("button");
  closeButton.className = "settings-close";
  closeButton.type = "button";
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", closeSettings);
  head.appendChild(closeButton);
  return head;
}

function createInfoGrid(items) {
  const grid = document.createElement("div");
  grid.className = "menu-info-grid";
  items.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "menu-info-card";
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    grid.appendChild(item);
  });
  return grid;
}

function createPanelCopy(text) {
  const copy = document.createElement("p");
  copy.className = "menu-panel-copy";
  copy.textContent = text;
  return copy;
}

function createThemeSettings() {
  const wrap = document.createElement("div");
  wrap.className = "theme-picker";

  const title = document.createElement("strong");
  title.textContent = "Themes";
  wrap.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "theme-picker-grid";
  const unlockedThemes = getUnlockedThemes();

  THEME_UNLOCKS.forEach((theme) => {
    const unlocked = unlockedThemes.includes(theme.theme);
    const button = document.createElement("button");
    button.className = "theme-choice";
    button.type = "button";
    button.disabled = !unlocked;
    button.classList.toggle("active", progressState.theme === theme.theme);
    button.innerHTML = `
      <span>${theme.name}</span>
      <small>${unlocked ? "Unlocked" : `Streak ${theme.streak}`}</small>
    `;
    button.addEventListener("click", () => {
      progressState.theme = theme.theme;
      saveProgress(progressState);
      renderSettingsPanel();
      showHint(`${theme.name} selected.`);
    });
    grid.appendChild(button);
  });

  wrap.appendChild(grid);
  return wrap;
}

function setFocusedIndex(nextIndex) {
  const buttons = getMenuButtons();
  if (!buttons.length) {
    return;
  }

  focusedIndex = (nextIndex + buttons.length) % buttons.length;
  buttons.forEach((button, index) => {
    button.classList.toggle("is-focused", index === focusedIndex);
    button.tabIndex = index === focusedIndex ? 0 : -1;
  });
  buttons[focusedIndex].focus({ preventScroll: true });
}

function getMenuButtons() {
  return Array.from(ui.actions.querySelectorAll(".menu-button"));
}

function moveFocus(direction) {
  setFocusedIndex(focusedIndex + direction);
}

function selectFocused() {
  getMenuButtons()[focusedIndex]?.click();
}

function openSettings() {
  renderSettingsPanel();
  openPanel();
}

function openPanel() {
  ui.settingsPanel.classList.add("is-open");
  ui.settingsPanel.setAttribute("aria-hidden", "false");
  ui.settingsPanel.querySelector("input, button")?.focus({ preventScroll: true });
}

function closeSettings() {
  ui.settingsPanel.classList.remove("is-open");
  ui.settingsPanel.setAttribute("aria-hidden", "true");
  setFocusedIndex(focusedIndex);
}

async function toggleFullscreen(enabled) {
  try {
    if (enabled && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else if (!enabled && document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } catch {
    settingsState.fullscreen = Boolean(document.fullscreenElement);
  }
}

function runAction(action) {
  if (action === "campaign") {
    startPlayTransition("campaign");
    return;
  }

  if (action === "planet-campaign") {
    startPlayTransition("planet-campaign");
    return;
  }

  if (action === "infinite") {
    startPlayTransition("infinite");
    return;
  }

  if (action === "practice") {
    renderPracticePanel();
    return;
  }

  if (action === "account") {
    window.location.href = accountSummary.signedIn ? "profile.html" : "auth.html";
    return;
  }

  if (action === "settings") {
    openSettings();
    return;
  }

  if (action === "stats") {
    renderStatsPanel();
    return;
  }

  if (action === "missions") {
    renderMissionsPanel();
    return;
  }

  if (action === "achievements") {
    renderAchievementsPanel();
    return;
  }

  if (action === "quit") {
    showHint("Exiting menu...");
    window.setTimeout(() => {
      window.location.href = "about:blank";
    }, 220);
    return;
  }

  showHint(`${capitalize(action)} is ready.`);
}

function startPlayTransition(mode) {
  ui.fadeOverlay.classList.add("is-fading");
  showHint(mode === "infinite"
    ? "Opening Infinite Galaxy..."
    : mode === "planet-campaign"
      ? "Opening Planet Campaign..."
      : "Opening Campaign map...");

  window.setTimeout(() => {
    window.location.href = `play.html?mode=${mode}`;
  }, 560);
}

function renderPracticePanel() {
  ui.settingsPanel.innerHTML = "";
  const head = createPanelHead("Practice Lab", "Pick one skill and practice without survival pressure.");
  const grid = document.createElement("div");
  grid.className = "practice-grid";
  [
    ["Addition", "addition", "Start with putting numbers together."],
    ["Subtraction", "subtraction", "Practice taking away and counting back."],
    ["Multiplication", "multiplication", "Practice equal groups and small facts."],
    ["Division", "division", "Practice sharing into equal groups."]
  ].forEach(([label, skill, copy]) => {
    const button = document.createElement("button");
    button.className = "practice-choice";
    button.type = "button";
    button.innerHTML = `<strong>${label}</strong><span>${copy}</span>`;
    button.addEventListener("click", () => startPracticeTransition(skill));
    grid.appendChild(button);
  });
  ui.settingsPanel.append(head, grid);
  openPanel();
}

function startPracticeTransition(skill) {
  ui.fadeOverlay.classList.add("is-fading");
  showHint(`Opening ${capitalize(skill)} Practice Lab...`);
  window.setTimeout(() => {
    window.location.href = `play.html?mode=practice&skill=${skill}`;
  }, 560);
}

function showHint(message) {
  ui.hint.textContent = message;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function loadProgress() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "{}");
    return {
      ...saved,
      bestStreak: Number.isFinite(saved.bestStreak) ? saved.bestStreak : 0,
      unlockedThemes: Array.isArray(saved.unlockedThemes) ? saved.unlockedThemes : ["cold-scifi"],
      theme: saved.theme || "cold-scifi",
      campaignLessonIndex: Number.isFinite(saved.campaignLessonIndex) ? saved.campaignLessonIndex : 0,
      campaignComplete: saved.campaignComplete === true,
      campaignLessonCount: Number.isFinite(saved.campaignLessonCount) ? saved.campaignLessonCount : CAMPAIGN_LESSON_COUNT,
      placement: saved.placement && typeof saved.placement === "object" ? saved.placement : { completed: false, score: 0 }
    };
  } catch {
    return {
      bestStreak: 0,
      unlockedThemes: ["cold-scifi"],
      theme: "cold-scifi",
      campaignLessonIndex: 0,
      campaignComplete: false,
      campaignLessonCount: CAMPAIGN_LESSON_COUNT,
      placement: { completed: false, score: 0 }
    };
  }
}

function loadAccountSummary() {
  try {
    const account = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || "null");
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return {
      signedIn: Boolean(account && session && session.accountId === account.id)
    };
  } catch {
    return { signedIn: false };
  }
}

function saveProgress(progress) {
  let existing = {};
  try {
    existing = JSON.parse(window.localStorage.getItem(SAVE_KEY) || "{}");
  } catch {
    existing = {};
  }
  window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...existing, ...progress }));
}

function getUnlockedThemes() {
  const unlocked = new Set(["cold-scifi", ...progressState.unlockedThemes]);
  THEME_UNLOCKS.forEach((theme) => {
    if (progressState.bestStreak >= theme.streak) {
      unlocked.add(theme.theme);
    }
  });
  return Array.from(unlocked);
}

function getThemeName(themeId) {
  return THEME_UNLOCKS.find((theme) => theme.theme === themeId)?.name || "Cold Sci-Fi";
}

function bindKeyboardNavigation() {
  window.addEventListener("keydown", (event) => {
    const settingsOpen = ui.settingsPanel.classList.contains("is-open");

    if (event.key === "Escape") {
      if (settingsOpen) {
        closeSettings();
      }
      return;
    }

    if (settingsOpen) {
      return;
    }

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectFocused();
    }
  });
}

function pollGamepad() {
  const [gamepad] = navigator.getGamepads ? navigator.getGamepads() : [];
  if (gamepad) {
    gamepadCooldown = Math.max(0, gamepadCooldown - 1);
    const vertical = gamepad.axes[1] || 0;
    const dpadUp = gamepad.buttons[12]?.pressed;
    const dpadDown = gamepad.buttons[13]?.pressed;
    const confirm = gamepad.buttons[0]?.pressed;

    if (gamepadCooldown === 0 && (vertical > 0.45 || dpadDown)) {
      moveFocus(1);
      gamepadCooldown = 12;
    } else if (gamepadCooldown === 0 && (vertical < -0.45 || dpadUp)) {
      moveFocus(-1);
      gamepadCooldown = 12;
    } else if (gamepadCooldown === 0 && confirm) {
      selectFocused();
      gamepadCooldown = 16;
    }
  }

  requestAnimationFrame(pollGamepad);
}

renderMainMenu();
renderSettingsPanel();
bindKeyboardNavigation();
requestAnimationFrame(pollGamepad);
