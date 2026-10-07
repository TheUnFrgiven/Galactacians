import { TOWERS, MISSIONS, SKILLS, COSMETICS } from "./data.js";
import {
  icon,
  shapeSVG,
  earthSVG,
  alienSVG,
  escapeHTML as esc,
} from "./icons.js";
import {
  loadProfile,
  saveProfile,
  createQuestion,
  recordAnswer,
  completeMission,
  localDateKey,
  getDaily,
  buyCosmetic,
  setSetting,
} from "./learning.js";
import { mountBattle } from "./battle.js";
import { STARTING_ENERGY, ANSWER_ENERGY } from "./economy.js";

let profile = loadProfile(),
  battle = null,
  route = "adventure",
  toastTimer,
  audioContext;
const app = document.querySelector("#app"),
  dialog = document.querySelector("#app-dialog");
const navItems = [
  ["adventure", "Play"],
  ["towers", "Defenders"],
  ["practice", "Practice"],
  ["shop", "Planet shop"],
];
const selectedMission = () =>
  MISSIONS.find((m) => !profile.completed[m.id]) || MISSIONS[0];
const completedCount = () =>
  MISSIONS.filter((m) => profile.completed[m.id]).length;
const accessibleMission = (m) =>
  MISSIONS.indexOf(m) === 0 ||
  Boolean(profile.completed[MISSIONS[MISSIONS.indexOf(m) - 1]?.id]);
const dateLabel = () =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
function save() {
  if (!saveProfile(profile))
    toast("Your browser could not save. Keep this tab open to keep playing.");
  updateStats();
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 3500);
}
function playTone(good = true) {
  if (!profile.settings.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const now = audioContext.currentTime;
    [good ? 520 : 300, good ? 780 : 350].forEach((f, i) => {
      const o = audioContext.createOscillator(),
        g = audioContext.createGain();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(g);
      g.connect(audioContext.destination);
      g.gain.setValueAtTime(0.035, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2 + i * 0.08);
      o.start(now + i * 0.08);
      o.stop(now + 0.22 + i * 0.08);
    });
  } catch {
    /* sound is optional */
  }
}
function applySettings() {
  document.documentElement.dataset.motion = profile.settings.reducedMotion
    ? "reduced"
    : "full";
  document.documentElement.dataset.planet = profile.equipped || "classic";
}
function updateStats() {
  for (const [key, value] of Object.entries({
    streak: profile.streak,
    stars: profile.stars,
    xp: profile.xp,
  }))
    document
      .querySelectorAll(`[data-stat="${key}"]`)
      .forEach((el) => (el.textContent = value));
}
function shell() {
  app.className =
    route === "mission" ? "game-shell mission-shell" : "game-shell";
  app.innerHTML = `<div class="workspace"><header class="topbar game-topbar"><button class="mission-menu-button" data-action="mission-menu" aria-haspopup="dialog" aria-controls="app-dialog" aria-expanded="false"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Menu</span></button></header><main id="main" class="main-content" tabindex="-1"></main></div>`;
}
function heading(eyebrow, title, subtitle, action = "") {
  return `<div class="page-heading game-page-heading"><div><h1>${title}</h1>${subtitle ? `<p class="page-description">${subtitle}</p>` : ""}</div>${action}</div>`;
}
function btn(text, action, cls = "primary", extra = "") {
  return `<button class="button ${cls}" data-action="${action}" ${extra}>${text}</button>`;
}
function renderAdventure() {
  const mission = selectedMission(),
    daily = getDaily(profile);
  return `<div class="game-home"><section class="home-scene"><div class="home-copy"><h1>galactacians</h1><p>Earth needs a little backup.</p><div class="home-actions">${btn(`Defend Earth ${icon("arrow")}`, "play", "primary home-play", `data-mission="${mission.id}"`)}<a class="button secondary" href="#practice">${icon("practice")} Practice</a></div></div><div class="home-planets" aria-hidden="true"><span class="home-spark home-spark-one">✦</span><span class="home-spark home-spark-two">✧</span><div class="hero-earth">${earthSVG()}</div><div class="home-ufo">${alienSVG()}</div><div class="home-defender">${shapeSVG("circle", "#88c475")}</div></div></section><div class="home-daily" aria-label="Your daily progress"><span>${icon("flame")}<b data-stat="streak">${profile.streak}</b> day streak</span><span>${icon("star")}<b data-stat="stars">${profile.stars}</b> stars</span><span>${icon("check")}<b>${Math.min(daily.correct, 5)} / 5</b> today</span></div><section class="home-missions"><div class="section-title"><h2>Your missions</h2><span class="mission-count">${completedCount()} / ${MISSIONS.length}</span></div><div class="journey-map"><svg class="journey-path" viewBox="0 0 800 190" preserveAspectRatio="none" aria-hidden="true"><path d="M64 99C122 99 147 48 200 48S280 133 336 133 420 47 472 47 551 122 608 122 685 72 744 72"/></svg><div class="journey-nodes">${MISSIONS.map(
    (item, index) => {
      const done = profile.completed[item.id],
        open = accessibleMission(item);
      return `<button class="journey-node node-${index} ${done ? "complete" : open ? "current" : "locked"}" data-action="${open ? "play" : "locked"}" data-mission="${item.id}" aria-label="${item.title}, ${done ? "completed" : open ? "play mission" : "locked"}"><span class="node-orb">${done ? icon("check") : open ? icon("planet") : icon("lock")}</span><span class="node-title">${item.title}</span><span class="node-stars">${done ? "★".repeat(done.stars || 1) : open ? "Play" : `Mission ${index + 1}`}</span></button>`;
    },
  ).join("")}</div></div></section></div>`;
}
function weekDays() {
  const now = new Date(),
    day = (now.getDay() + 6) % 7;
  return ["M", "T", "W", "T", "F", "S", "S"]
    .map((s, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i - day);
      const key = localDateKey(date),
        done = (profile.daily[key]?.correct || 0) > 0;
      return `<span class="week-day ${done ? "done" : ""} ${i === day ? "today" : ""}"><small>${s}</small><span>${done ? icon("check") : i === day ? icon("flame") : "·"}</span></span>`;
    })
    .join("");
}
function quest(title, description, value, max, ico, color) {
  value = Number(value) || 0;
  return `<div class="quest"><span class="quest-icon" style="--quest-color:${color}">${icon(value >= max ? "check" : ico)}</span><div class="quest-body"><strong>${title}</strong><small>${description}</small><div class="quest-progress"><span style="width:${Math.min(100, (value / max) * 100)}%"></span></div></div><small class="quest-count">${Math.min(max, value)}/${max}</small></div>`;
}
function renderTowers() {
  return `${heading("", "Defenders", "Pick a shape. Find its superpower.")}<div class="tower-gallery game-defenders">${TOWERS.map((tower) => `<article class="tower-card" style="--tower-color:${tower.color}"><div class="tower-card-art">${shapeSVG(tower.shape, tower.color)}<span class="tower-shape-label">${tower.shape}</span></div><div class="tower-card-body"><div class="tower-title"><h2>${tower.name}</h2><span class="energy-price">${icon("bolt")}${tower.cost}</span></div><span class="tower-role">${tower.tag}</span><p>${tower.description}</p>${btn(`Meet ${tower.name} ${icon("arrow")}`, "tower", "subtle", `data-id="${tower.id}"`)}</div></article>`).join("")}</div>`;
}
function renderPractice() {
  const daily = getDaily(profile);
  return `<section class="practice-page">${heading("", "Practice", "Solve 5 today. Earn a planet star.")}<div class="practice-summary" aria-label="Your practice progress"><span>${icon("star")}<b data-stat="stars">${profile.stars}</b> stars</span><span>${icon("flame")}<b data-stat="streak">${profile.streak}</b> day streak</span><span>${icon("star")}<b data-stat="xp">${profile.xp}</b> XP</span><span>${icon("check")}<b>${daily.correct}</b> solved today</span></div><div class="practice-level-row"><label for="practice-level">Math level</label><select id="practice-level" data-setting="level"><option value="starter" ${profile.settings.level === "starter" ? "selected" : ""}>Starter · small numbers</option><option value="explorer" ${profile.settings.level === "explorer" ? "selected" : ""}>Explorer · facts within 9</option><option value="challenger" ${profile.settings.level === "challenger" ? "selected" : ""}>Challenger · trickier facts</option></select></div><div class="skill-grid practice-skills">${SKILLS.map(
    (skill) => {
      const stats = profile.skills[skill.id],
        percent = stats.attempts
          ? Math.round((stats.correct / stats.attempts) * 100)
          : 0;
      return `<button class="skill-card practice-skill" data-action="practice" data-skill="${skill.id}" aria-label="Practice ${skill.name.toLowerCase()}" style="--skill-color:${skill.color}"><span class="skill-symbol">${skill.symbol}</span><div class="practice-skill-copy"><h2>${skill.name}</h2><p>${skill.description}</p><span class="skill-first-tries">${stats.attempts ? `${stats.correct} first-try wins · ${stats.attempts} questions` : "Ready for your first try"}</span><span class="skill-progress-line"><i style="width:${percent}%"></i></span></div><span class="practice-skill-start">Play ${icon("arrow")}</span></button>`;
    },
  ).join(
    "",
  )}</div><p class="practice-footnote">5 solves = 1 planet star each day. Hints count, too. First-try wins are solved without a hint.</p></section>`;
}
function renderProgress() {
  return renderPractice();
}
function renderFriends() {
  return renderAdventure();
}
function renderShop() {
  return `${heading("", "Planet shop", "Mission and daily practice stars unlock planet colors.", `<span class="shop-balance">${icon("star")}<b data-stat="stars">${profile.stars}</b></span>`)}<div class="cosmetic-grid">${COSMETICS.map(
    (cosmetic) => {
      const owned =
          cosmetic.id === "classic" || profile.cosmetics.includes(cosmetic.id),
        equipped = profile.equipped === cosmetic.id;
      return `<article class="cosmetic-card" style="--cosmetic-color:${cosmetic.color}"><div class="cosmetic-art cosmetic-${cosmetic.id}">${earthSVG()}${equipped ? `<span class="equipped-badge">${icon("check")} Equipped</span>` : ""}</div><div class="cosmetic-body"><h2>${cosmetic.name}</h2><p>${cosmetic.description}</p>${btn(equipped ? "Equipped" : owned ? "Equip" : `${icon("star")} ${cosmetic.cost} stars`, "cosmetic", equipped ? "subtle" : "secondary", `data-id="${cosmetic.id}" ${equipped ? "disabled" : ""}`)}</div></article>`;
    },
  ).join("")}</div>`;
}
function renderSettings() {
  return `<div class="game-settings">${heading("", "Settings", "")}<section class="panel settings-panel"><form id="profile-form"><label for="cadet-name">What should we call you?</label><div class="input-row"><input id="cadet-name" name="name" type="text" maxlength="24" value="${esc(profile.name)}" autocomplete="nickname" required><button class="button secondary" type="submit">Save name</button></div></form><div class="setting-row"><div><strong>Sound effects</strong></div><input class="switch" type="checkbox" aria-label="Sound effects" data-setting="sound" ${profile.settings.sound ? "checked" : ""}></div><div class="setting-row"><div><strong>Less motion</strong></div><input class="switch" type="checkbox" aria-label="Less motion" data-setting="reducedMotion" ${profile.settings.reducedMotion ? "checked" : ""}></div><div class="setting-row"><div><strong>Gentle reminders</strong><p>Show today's practice goal in the menu.</p></div><input class="switch" type="checkbox" aria-label="Gentle reminders" data-setting="reminders" ${profile.settings.reminders ? "checked" : ""}></div><div class="setting-row"><label for="settings-level"><strong>Math level</strong></label><select id="settings-level" data-setting="level">${["starter", "explorer", "challenger"].map((level) => `<option value="${level}" ${level === profile.settings.level ? "selected" : ""}>${level[0].toUpperCase() + level.slice(1)}</option>`).join("")}</select></div></section></div>`;
}
function navigate() {
  let hash = location.hash.slice(1) || "adventure";
  if (hash === "progress" || hash === "friends") {
    hash = hash === "progress" ? "practice" : "adventure";
    history.replaceState(null, "", `#${hash}`);
  }
  if (hash === "main") {
    document.querySelector("#main")?.focus();
    return;
  }
  battle?.destroy();
  battle = null;
  const parts = hash.split("/");
  route = parts[0];
  if (![...navItems.map((n) => n[0]), "settings", "mission"].includes(route))
    route = "adventure";
  applySettings();
  shell();
  const main = document.querySelector("#main");
  if (route === "mission") {
    const m = MISSIONS.find((m) => m.id === parts[1]);
    if (!m || !accessibleMission(m)) {
      location.hash = "adventure";
      return;
    }
    main.classList.add("mission-content");
    main.innerHTML = '<div id="battle-mount"></div>';
    battle = mountBattle(document.querySelector("#battle-mount"), {
      mission: m,
      startingEnergy: m.startingEnergy ?? STARTING_ENERGY,
      guidedStart: m.id === "first-contact" && !profile.completed[m.id],
      settings: { ...profile.settings, equipped: profile.equipped },
      onExit: () => (location.hash = "adventure"),
      requestEnergy: () => openMath(m.skill, true),
      onComplete: (result) => finishMission(m, result),
    });
  } else {
    main.innerHTML = {
      adventure: renderAdventure,
      towers: renderTowers,
      practice: renderPractice,
      progress: renderProgress,
      friends: renderFriends,
      shop: renderShop,
      settings: renderSettings,
    }[route]();
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}
function startMission(id) {
  const m = MISSIONS.find((m) => m.id === id) || selectedMission();
  if (!accessibleMission(m)) {
    toast("Complete the previous mission to discover this one.");
    return;
  }
  location.hash = `mission/${m.id}`;
}

let dialogCleanup = null,
  restoreFocus = null;
function closeDialog() {
  const cleanup = dialogCleanup;
  dialogCleanup = null;
  if (dialog.open) dialog.close();
  cleanup?.();
  restoreFocus?.focus?.();
}
function showDialog(content, { onClose } = {}) {
  if (dialog.open) closeDialog();
  restoreFocus = document.activeElement;
  dialog.innerHTML = content;
  dialogCleanup = onClose || null;
  dialog.showModal();
}
dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeDialog();
});
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      closeDialog();
  }
});
const dialogClose = () =>
  `<button class="icon-button dialog-close" data-action="close-dialog" aria-label="Close dialog">${icon("close")}</button>`;
function openMissionMenu() {
  const trigger = document.querySelector(".mission-menu-button");
  if (!trigger) return;
  const inMission = route === "mission",
    daily = getDaily(profile);
  showDialog(
    `${dialogClose()}<div class="mission-menu game-menu"><div class="menu-mascot-scene" aria-hidden="true">${alienSVG("#bba0df", "menu-mascot")}<span class="menu-mascot-spark">✦</span></div><h2 id="dialog-title">Menu</h2>${inMission ? `<p class="mission-menu-note">${icon("moon")} Mission paused</p>` : ""}<a class="mission-menu-profile" href="#settings" data-action="menu-link" aria-label="Your profile"><span class="profile-avatar">${icon("planet")}</span><span><strong>${esc(profile.name)}</strong><small>Level ${Math.floor(profile.xp / 100) + 1}</small></span>${icon("chevron")}</a><nav class="mission-menu-nav" aria-label="Main navigation">${[...navItems, ["settings", "Settings"]].map(([id, label]) => `<a class="mission-menu-link" href="#${id}" data-action="menu-link" ${route === id ? 'aria-current="page"' : ""}>${icon(id)}<span>${label}</span></a>`).join("")}</nav>${profile.settings.reminders ? `<p class="menu-daily-goal">${icon("check")} Today's practice: ${Math.min(daily.correct, 5)} / 5 solved ${daily.goalStarAwarded ? "· Star earned!" : "· Earn 1 star"}</p>` : ""}${inMission ? '<p class="mission-menu-exit-note">Leaving this page restarts the mission next time.</p>' : ""}${btn(inMission ? "Back to defending" : "Back to game", "close-dialog", "primary mission-menu-resume")}</div>`,
    { onClose: () => trigger.setAttribute("aria-expanded", "false") },
  );
  trigger.setAttribute("aria-expanded", "true");
}
function infoDialog(title, body) {
  showDialog(
    `${dialogClose()}<div class="simple-dialog"><span class="dialog-symbol">${icon("planet")}</span><h2 id="dialog-title">${title}</h2>${body}${btn("Got it", "close-dialog", "primary")}</div>`,
  );
}
function towerDialog(id) {
  const t = TOWERS.find((t) => t.id === id);
  if (!t) return;
  showDialog(
    `${dialogClose()}<div class="tower-dialog"><div class="tower-dialog-art" style="--tower-color:${t.color}">${shapeSVG(t.shape, t.color)}</div><span class="eyebrow">${t.shape.toUpperCase()} · ${t.tag.toUpperCase()}</span><h2 id="dialog-title">Meet ${t.name}.</h2><p>${t.description}</p><div class="tower-fact">${icon("bolt")} <strong>${t.cost} energy</strong><span>to add to your crew</span></div><p class="gentle-note">${{ shooter: "Start with one in each busy lane. Simple can be powerful.", piercing: "Armor shrugs off pebbles. Prism beams go straight through.", block: "Place Bricky in front, and a shooter behind. Teamwork!", slow: "Slow aliens give every shooter more time to land a hit.", splash: "A clustered crowd is Poppy’s favorite kind of problem." }[t.role]}</p>${btn("Let’s try it", "play-from-dialog", "primary", `data-mission="${selectedMission().id}"`)}</div>`,
  );
}

function openMath(skill = "addition", inBattle = false) {
  return new Promise((resolve) => {
    let earned = 0,
      index = 0,
      q,
      assisted = false,
      answered = false;
    let wrongChoices = new Set(),
      timers = [],
      active = true;
    const total = inBattle ? 1 : 3;
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        if (active) fn();
      }, ms);
      timers.push(id);
    };
    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const chooseSkill = () =>
      skill === "mixed"
        ? SKILLS[Math.floor(Math.random() * SKILLS.length)].id
        : skill;
    function next() {
      clearTimers();
      q = createQuestion(chooseSkill(), profile.settings.level);
      assisted = false;
      answered = false;
      wrongChoices = new Set();
      const name = SKILLS.find((s) => s.id === q.skill)?.name || "Practice";
      dialog.innerHTML = `${dialogClose()}<div class="math-dialog ${inBattle ? "math-quick" : ""}"><div class="math-topline"><span class="soft-badge">${icon(inBattle ? "bolt" : "star")} ${inBattle ? `+${ANSWER_ENERGY} energy` : "+XP · Daily star"}</span>${inBattle ? "" : `<span>${index + 1} of ${total}</span>`}</div><h2 id="dialog-title">${inBattle ? "Power up!" : name}</h2><div class="equation"><span>${q.a}</span><span class="operation">${esc(q.operator)}</span><span>${q.b}</span><span class="equals">=</span><span class="answer-blank">?</span></div><div class="answer-options">${q.options.map((n, i) => `<button class="answer-option" data-answer="${n}" aria-label="Answer ${n}"><span>${n}</span><small>${i + 1}</small></button>`).join("")}</div><div class="answer-feedback" role="status" aria-live="polite"></div><div class="math-hint" hidden></div><div class="math-bottom"><button class="text-link hint-button" data-math-hint>${icon("help")} Hint</button><span class="math-earned">${icon(inBattle ? "bolt" : "star")} +${earned}${inBattle ? "" : " XP"}</span></div>${inBattle ? '<p class="math-status">Help in 10s · Back to play in 20s</p>' : ""}</div>`;
      dialog.querySelector(".answer-option")?.focus();
      if (inBattle) {
        later(() => {
          if (!answered) {
            showHint();
            dialog.querySelector(".math-status").textContent =
              "Try with the hint · Back to play in 10s";
          }
        }, 10000);
        later(() => {
          if (answered) return;
          // Showing a solution is teaching, not a correct answer by the player.
          // Resume at the deadline; keep the solution readable over the battlefield.
          const explanation = q.explanation;
          closeDialog();
          toast(`Let’s try together: ${explanation}`);
        }, 20000);
      }
    }
    function showHint() {
      if (answered) return;
      assisted = true;
      const el = dialog.querySelector(".math-hint");
      el.hidden = false;
      el.innerHTML = `<p>${esc(q.hint)}</p>${mathVisual(q)}`;
      dialog.querySelector("[data-math-hint]").hidden = true;
    }
    function answer(value) {
      if (!active || answered || wrongChoices.has(value)) return;
      const right = value === q.answer;
      const result = recordAnswer(profile, q, right, { assisted });
      save();
      const feedback = dialog.querySelector(".answer-feedback");
      if (right) {
        answered = true;
        clearTimers();
        const energyEarned = inBattle && !result.duplicate ? ANSWER_ENERGY : 0;
        earned += inBattle ? energyEarned : result.xpEarned;
        dialog.querySelectorAll(".answer-option").forEach((b) => {
          b.disabled = true;
          b.classList.toggle("correct", Number(b.dataset.answer) === value);
        });
        dialog.querySelector(".answer-blank").textContent = q.answer;
        feedback.className = "answer-feedback success";
        const reward = inBattle
          ? `+${energyEarned} energy`
          : `+${result.xpEarned} XP`;
        feedback.innerHTML = `${icon("check")} <span><strong>${reward}${result.starsEarned ? " · +1 planet star!" : ""}</strong><small>${esc(q.explanation)}</small></span>`;
        dialog.querySelector("[data-math-hint]").hidden = true;
        dialog.querySelector(".math-earned").innerHTML =
          `${icon(inBattle ? "bolt" : "star")} +${earned}${inBattle ? "" : " XP"}`;
        const status = dialog.querySelector(".math-status");
        if (status) status.textContent = "Back to the rescue!";
        playTone();
        later(
          () => {
            index++;
            if (index >= total) closeDialog();
            else next();
          },
          inBattle ? 750 : 1200,
        );
      } else {
        wrongChoices.add(value);
        assisted = true;
        const b = dialog.querySelector(`[data-answer="${value}"]`);
        b.disabled = true;
        b.classList.add("try-again");
        feedback.className = "answer-feedback retry";
        feedback.textContent = "Try with the hint.";
        showHint();
      }
    }
    function onClick(e) {
      const option = e.target.closest("[data-answer]");
      if (option) answer(Number(option.dataset.answer));
      else if (e.target.closest("[data-math-hint]")) showHint();
    }
    function onKey(e) {
      if (
        !dialog.open ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.target.matches("input,select")
      )
        return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4 && !answered) {
        e.preventDefault();
        answer(q.options[n - 1]);
      }
    }
    showDialog("", {
      onClose: () => {
        active = false;
        clearTimers();
        dialog.removeEventListener("click", onClick);
        document.removeEventListener("keydown", onKey);
        save();
        resolve(inBattle ? earned : 0);
        if (!inBattle) navigate();
      },
    });
    dialog.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    next();
  });
}
function mathVisual(q) {
  const dots = (n, cls = "") =>
    `<span class="dot-group ${cls}">${Array.from({ length: Math.max(0, Math.min(20, n)) }, () => "<i></i>").join("")}</span>`;
  if (q.skill === "addition")
    return `<div class="math-visual">${dots(q.a)}<b>+</b>${dots(q.b, "blue")}</div>`;
  if (q.skill === "subtraction")
    return `<div class="math-visual">${dots(q.a - q.b)}${dots(q.b, "crossed")}</div>`;
  if (q.skill === "multiplication" && q.a * q.b <= 30)
    return `<div class="math-visual grouped">${Array.from({ length: q.a }, () => dots(q.b)).join("")}</div>`;
  if (q.skill === "division" && q.a <= 30)
    return `<div class="math-visual grouped">${Array.from({ length: q.b }, () => dots(q.a / q.b)).join("")}</div>`;
  return "";
}
function finishMission(m, result) {
  const reward = completeMission(profile, m.id, result);
  save();
  const won = result.won;
  showDialog(
    `${dialogClose()}<div class="result-dialog">${won ? earthSVG() : alienSVG("#bdabd7")}<h2 id="dialog-title">${won ? "Home is safe!" : "Let’s try a new plan."}</h2><div class="result-stars">${won ? "★".repeat(result.stars || 1) + "☆".repeat(3 - (result.stars || 1)) : icon("heart")}</div><div class="result-stats"><span><strong>${result.kills || 0}</strong> aliens popped</span><span><strong>${result.waves || 0}</strong> waves cleared</span><span><strong>+${reward.awardedStars || 0}</strong> new stars</span></div>${won ? "" : '<p class="gentle-note">Prism breaks armor. Poppy clears crowds. Bricky buys time.</p>'}<div class="result-actions">${btn(won ? "Back to my galaxy" : "Try again", won ? "result-home" : "result-retry", "primary", `data-mission="${m.id}"`)}${btn("Practice", won ? "result-progress" : "result-practice", "subtle", `data-skill="${m.skill}"`)}</div></div>`,
    {
      onClose: () => {
        if (route === "mission" && location.hash === `#mission/${m.id}`)
          location.hash = "adventure";
      },
    },
  );
  if (won) playTone();
}

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "play") startMission(el.dataset.mission);
  else if (action === "mission-menu") openMissionMenu();
  else if (action === "menu-link") closeDialog();
  else if (action === "tower") towerDialog(el.dataset.id);
  else if (action === "locked")
    toast(
      "One mission at a time. Complete the previous stop to unlock this one.",
    );
  else if (action === "practice") openMath(el.dataset.skill);
  else if (action === "close-dialog") closeDialog();
  else if (action === "profile") location.hash = "settings";
  else if (action === "play-from-dialog") {
    closeDialog();
    startMission(el.dataset.mission);
  } else if (action === "notifications") {
    const d = getDaily(profile);
    infoDialog(
      "A note from Earth",
      `<div class="notification-note">${icon(d.correct ? "check" : "leaf")}<p>${d.correct ? "You’ve already made a little progress today. Earth says thank you!" : "A tiny mission or three little questions is a lovely way to start your day."}</p></div><p class="gentle-note">${profile.settings.reminders ? "Gentle in-app reminders are on." : "You can turn on gentle in-app reminders in Settings."} No push notifications are sent.</p>`,
    );
  } else if (action === "club-info")
    infoDialog(
      "A kinder space club",
      `<p>We’re designing private friend groups, cooperative weekly quests, and friendly encouragement.</p><ul class="simple-list"><li>Join with an invite, never public search.</li><li>Choose whether to join a friends leaderboard.</li><li>Keep conversations to preset high-fives.</li><li>Guardian controls before younger players connect.</li></ul><p class="gentle-note">This is a concept preview. Online accounts and social features are not connected yet.</p>`,
    );
  else if (action === "cosmetic") {
    const c = COSMETICS.find((c) => c.id === el.dataset.id);
    if (!c) return;
    const owned = c.id === "classic" || profile.cosmetics.includes(c.id);
    if (!owned) {
      if (profile.stars < c.cost) {
        toast(
          `You need ${c.cost - profile.stars} more stars. Earn them in missions or by solving 5 questions today.`,
        );
        return;
      }
      buyCosmetic(profile, c.id, c.cost);
    }
    profile.equipped = c.id;
    save();
    applySettings();
    navigate();
    toast(`${c.name} equipped. Looking stellar!`);
  } else if (action.startsWith("result-")) {
    dialogCleanup = null;
    closeDialog();
    if (action === "result-home") location.hash = "adventure";
    if (action === "result-progress") location.hash = "practice";
    if (action === "result-retry") navigate();
    if (action === "result-practice") {
      location.hash = "practice";
      setTimeout(() => openMath(el.dataset.skill), 0);
    }
  }
});
document.addEventListener("change", (e) => {
  if (!e.target.matches("[data-setting]")) return;
  const key = e.target.dataset.setting,
    value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
  setSetting(profile, key, value);
  save();
  applySettings();
  toast("Settings saved. Make yourself at home.");
});
document.addEventListener("submit", (e) => {
  if (e.target.id !== "profile-form") return;
  e.preventDefault();
  const name = new FormData(e.target).get("name").trim().slice(0, 24);
  if (name) {
    profile.name = name;
    save();
    navigate();
    toast("Your cadet name is saved.");
  }
});
window.addEventListener("hashchange", () => {
  if (dialog.open) closeDialog();
  navigate();
});
applySettings();
navigate();
