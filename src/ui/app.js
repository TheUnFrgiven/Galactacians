/**
 * App shell: the start screen, the learning path, and the small dialogs
 * (teach cards, fact map, settings). Missions are mounted from mission.js.
 */
import { UNITS, MISSIONS, TOWERS, TOWER_ORDER, UNLOCKS, unitMissions, unlockedTowers, getUnit } from "../core/content.js";
import { missionOpen, nextMission, missionsCompleted, skillSummary, factRecord, STAGES } from "../core/learner.js";
import { factsFor } from "../core/questions.js";
import { loadProfile, saveProfile, logToCsv } from "../core/save.js";
import { earthArt, icon, mathPicture, towerArt, alienArt } from "./art.js";
import { setAudioPrefs, sfx, speak } from "./audio.js";
import { mountMission } from "./mission.js";

const app = document.querySelector("#app");
let profile = loadProfile();
let current = null; // mounted mission

const save = () => saveProfile(profile);
function applySettings() {
  setAudioPrefs(profile.settings);
  document.documentElement.classList.toggle("reduced-motion", profile.settings.reducedMotion);
}

/* ---------- dialogs ---------- */
function modal(html, cls = "") {
  const wrap = document.createElement("div");
  wrap.className = `modal ${cls}`;
  wrap.innerHTML = `<div class="modal-card"><button class="round-btn modal-close" type="button" aria-label="Close">${icon("close")}</button>${html}</div>`;
  document.body.appendChild(wrap);
  const close = () => {
    wrap.remove();
    globalThis.speechSynthesis?.cancel();
  };
  wrap.querySelector(".modal-close").onclick = close;
  wrap.addEventListener("click", (e) => e.target === wrap && close());
  return { el: wrap, close };
}

function showTeach(unit, then) {
  let i = 0;
  const m = modal(`<div class="teach"></div>`, "teach-modal");
  const draw = () => {
    const slide = unit.teach[i];
    const last = i === unit.teach.length - 1;
    m.el.querySelector(".teach").innerHTML = `
      <span class="teach-kicker">${unit.world} · ${unit.title}</span>
      <div class="teach-picture">${mathPicture(slide.visual)}</div>
      <p class="teach-say">${slide.say}</p>
      <div class="teach-actions">
        <button class="round-btn t-speak" type="button" aria-label="Hear it again">${icon("speak")}</button>
        <span class="teach-dots">${unit.teach.map((_, k) => `<b class="${k === i ? "on" : ""}"></b>`).join("")}</span>
        <button class="big-btn t-next" type="button">${last ? `${icon("play")} Let's play` : "Next"}</button>
      </div>`;
    speak(slide.say);
    m.el.querySelector(".t-speak").onclick = () => speak(slide.say);
    m.el.querySelector(".t-next").onclick = () => {
      sfx.tap();
      if (!last) {
        i += 1;
        draw();
      } else {
        profile.seenTeach[unit.id] = true;
        save();
        m.close();
        then?.();
      }
    };
  };
  draw();
}

function factGrid(skill) {
  const cell = (id, label) => {
    const stage = factRecord(profile, id).stage;
    return `<span class="fact s${stage}" title="${label}: ${STAGES[stage]}">${label}</span>`;
  };
  const facts = new Map(factsFor(skill).map((f) => [f.id, f]));
  let rows = [];
  if (skill === "add10") rows = [...Array(9)].map((_, i) => [...Array(10 - (i + 1))].map((_, j) => cell(`add:${i + 1}+${j + 1}`, `${i + 1}+${j + 1}`)));
  else if (skill === "sub10") rows = [...Array(9)].map((_, i) => [...Array(i + 1)].map((_, j) => cell(`sub:${i + 2}-${j + 1}`, `${i + 2}−${j + 1}`)));
  else if (skill === "bond10") rows = [[...Array(9)].map((_, i) => cell(`bond:${i + 1}`, `${i + 1}+${9 - i}`))];
  else rows = [2, 5, 10].map((t) => [...Array(10)].map((_, n) => cell(`mul:${n + 1}x${t}`, `${n + 1}×${t}`)));
  void facts;
  return rows.map((r) => `<div class="fact-row">${r.join("")}</div>`).join("");
}

function showFactMap(unit) {
  const sum = skillSummary(profile, unit.id);
  modal(`
    <h2>${unit.title}: fact map</h2>
    <p class="modal-sub">You know ${sum.learned} of ${sum.total} facts, and ${sum.mastered} are mastered. Facts turn green when you get them right on different days.</p>
    <div class="fact-grid">${factGrid(unit.id)}</div>
    <div class="fact-legend">${STAGES.map((s, i) => `<span><i class="fact s${i}"></i>${s}</span>`).join("")}</div>`, "facts-modal");
}

function showSettings() {
  const s = profile.settings;
  const m = modal(`
    <h2>Settings</h2>
    <label class="toggle"><input type="checkbox" data-set="sound" ${s.sound ? "checked" : ""}><span>Sound effects</span></label>
    <label class="toggle"><input type="checkbox" data-set="voice" ${s.voice ? "checked" : ""}><span>Read things aloud</span></label>
    <label class="toggle"><input type="checkbox" data-set="reducedMotion" ${s.reducedMotion ? "checked" : ""}><span>Less motion</span></label>
    <h3>For grown-ups</h3>
    <p class="modal-sub">Progress is saved on this device only. ${profile.log.length} answers recorded.</p>
    <div class="settings-actions">
      <button class="big-btn ghost s-csv" type="button">${icon("download")} Download answers (CSV)</button>
      <button class="big-btn ghost danger s-reset" type="button">Start over</button>
    </div>`, "settings-modal");
  m.el.querySelectorAll("[data-set]").forEach((input) => {
    input.onchange = () => {
      profile.settings[input.dataset.set] = input.checked;
      save();
      applySettings();
    };
  });
  m.el.querySelector(".s-csv").onclick = () => {
    const blob = new Blob([logToCsv(profile)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "galactacians-answers.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const reset = m.el.querySelector(".s-reset");
  reset.onclick = () => {
    if (reset.dataset.armed) {
      localStorage.clear();
      profile = loadProfile();
      m.close();
      route();
    } else {
      reset.dataset.armed = "1";
      reset.textContent = "Tap again to erase everything";
    }
  };
}

/* ---------- screens ---------- */
const START_LINES = ["I'm just starting", "I can add", "I can make 10", "I'm learning times tables"];

function renderStart() {
  app.innerHTML = `
    <main class="start">
      <div class="start-earth">${earthArt()}</div>
      <h1 class="logo">galactacians</h1>
      <p class="start-lead">Aliens are visiting Earth! Build towers with math to keep Earth safe.</p>
      <h2>Where should we start?</h2>
      <div class="start-cards">
        ${UNITS.map((u, i) => `<button class="start-card" type="button" data-unit="${i}" style="--c:${u.color}"><span class="start-eq">${u.example}</span><b>${u.title}</b><span>${START_LINES[i]}</span></button>`).join("")}
      </div>
      <p class="start-note">You can always go back to earlier worlds.</p>
    </main>`;
  speak("Aliens are visiting Earth! Where should we start?");
  app.querySelectorAll(".start-card").forEach((b) => {
    b.onclick = () => {
      sfx.correct();
      profile.started = true;
      profile.unlockedUnits = Math.max(profile.unlockedUnits, +b.dataset.unit + 1);
      save();
      const first = MISSIONS.find((m) => m.unitIndex === +b.dataset.unit && m.slot === 1);
      play(first);
    };
  });
}

function missionNode(m) {
  const open = missionOpen(profile, m);
  const stars = profile.completed[m.id] || 0;
  const isNext = nextMission(profile)?.id === m.id && !stars;
  return `<button class="node ${m.boss ? "boss" : ""} ${open ? "open" : "locked"} ${isNext ? "next" : ""}" type="button" data-mission="${m.id}" ${open ? "" : "disabled"} aria-label="${m.title}${open ? "" : ", locked"}">
    <span class="node-orb">${open ? (m.boss ? alienArt("boss") : `<b>${m.slot}</b>`) : icon("lock")}</span>
    <span class="node-name">${m.title}</span>
    <span class="node-stars">${[1, 2, 3].map((n) => `<i class="${n <= stars ? "on" : ""}">${icon("star")}</i>`).join("")}</span>
  </button>`;
}

function renderPath() {
  const next = nextMission(profile);
  const done = missionsCompleted(profile);
  const have = unlockedTowers(done);
  const nextUnlock = UNLOCKS[have.length >= 5 ? 99 : UNLOCKS.findIndex((group) => !have.includes(group[0]))];
  const nextUnit = getUnit(next.unit);
  app.innerHTML = `
    <main class="path">
      <header class="p-top">
        <h1 class="logo small">galactacians</h1>
        <div class="p-stats">
          <span class="stat streak" title="Days in a row">${icon("flame")}<b>${profile.streak}</b></span>
          <span class="stat xp" title="XP">${icon("bolt")}<b>${profile.xp}</b> XP</span>
          <button class="round-btn p-settings" type="button" aria-label="Settings">${icon("settings")}</button>
        </div>
      </header>
      <section class="hero">
        <div class="hero-earth">${earthArt()}</div>
        <div class="hero-text">
          <span class="kicker">${nextUnit.world} · ${nextUnit.title}</span>
          <h2>${next.title}</h2>
          <button class="big-btn hero-play" type="button">${icon("play")} Play</button>
        </div>
        <div class="collection">
          <span class="kicker">Your towers</span>
          <div class="collection-row">
            ${TOWER_ORDER.map((t) => `<span class="col-tower ${have.includes(t) ? "" : "locked"}" title="${TOWERS[t].name}">${towerArt(t, 1)}<small>${have.includes(t) ? TOWERS[t].name : "?"}</small></span>`).join("")}
          </div>
          ${nextUnlock ? `<span class="collection-next">Win 1 more mission to unlock a new tower!</span>` : `<span class="collection-next">You have every tower. Try merging to level 3!</span>`}
        </div>
      </section>
      <section class="units">
        ${UNITS.map((u, i) => {
          const open = i < profile.unlockedUnits;
          const sum = skillSummary(profile, u.id);
          return `<article class="unit ${open ? "" : "locked"}" style="--c:${u.color}">
            <div class="unit-head">
              <div><span class="kicker">World ${i + 1} · ${u.world}</span><h3>${u.title} <span class="unit-eq">${u.example}</span></h3></div>
              <div class="unit-tools">
                <button class="chip-btn u-teach" type="button" data-unit="${u.id}" ${open ? "" : "disabled"}>${icon("book")} Teach me</button>
                <button class="chip-btn u-facts" type="button" data-unit="${u.id}">${icon("grid")} ${sum.learned}/${sum.total} facts</button>
              </div>
            </div>
            <div class="unit-bar" title="Facts you know"><i style="width:${(sum.learned / sum.total) * 100}%"></i></div>
            <div class="nodes">${unitMissions(u.id).map(missionNode).join('<span class="node-link"></span>')}</div>
            ${open ? "" : `<p class="unit-lock">${icon("lock")} Beat the Captain in World ${i} to open</p>`}
          </article>`;
        }).join("")}
      </section>
    </main>`;
  app.querySelector(".hero-play").onclick = () => play(next);
  app.querySelector(".p-settings").onclick = showSettings;
  app.querySelectorAll("[data-mission]").forEach((b) => (b.onclick = () => play(MISSIONS.find((m) => m.id === b.dataset.mission))));
  app.querySelectorAll(".u-teach").forEach((b) => (b.onclick = () => showTeach(getUnit(b.dataset.unit))));
  app.querySelectorAll(".u-facts").forEach((b) => (b.onclick = () => showFactMap(getUnit(b.dataset.unit))));
}

function play(mission) {
  if (!mission || !missionOpen(profile, mission)) return;
  sfx.tap();
  const unit = getUnit(mission.unit);
  if (!profile.seenTeach[unit.id]) return showTeach(unit, () => mount(mission));
  mount(mission);
}

function mount(mission) {
  current?.destroy();
  app.innerHTML = "";
  current = mountMission(app, {
    mission,
    profile,
    save,
    onExit: () => {
      current?.destroy();
      current = null;
      route();
    },
    onNext: (m) => play(m),
  });
}

function route() {
  applySettings();
  if (!profile.started) renderStart();
  else renderPath();
}

route();
// Exposed for automated browser tests only.
globalThis.__galactacians = { get profile() { return profile; }, get mission() { return current; } };
