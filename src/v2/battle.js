import { TOWERS, ENEMIES } from "./data.js";
import { getEncounter } from "./encounters.js";
import { STARTING_ENERGY, ANSWER_ENERGY } from "./economy.js";

const ROWS = 5;
const COLS = 7;
const DEFAULTS = {
  shooter: { damage: 16, rate: 1.0, range: 7, hp: 65 },
  piercing: { damage: 12, rate: 1.5, range: 7, hp: 60 },
  block: { damage: 8, rate: 1, range: 0, hp: 220 },
  slow: { damage: 8, rate: 1.2, range: 7, hp: 65 },
  splash: { damage: 24, rate: 2.3, range: 7, hp: 60 },
};

const ROLE_NAMES = {
  shooter: "Scouts & skaters",
  piercing: "Ignores armor",
  block: "Blocks & reflects",
  slow: "Slows three lanes",
  splash: "Pops swarms",
};

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const icon = (name) => {
  const paths = {
    bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
    play: '<path d="m8 5 12 7-12 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    back: '<path d="m13 5-7 7 7 7M6 12h15"/>',
    heart:
      '<path d="M12 21 3.6 12.7C-2 6.8 6.3.4 12 6.2 17.7.4 26 6.8 20.4 12.7Z"/>',
    star: '<path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.2-6.3-3.7-6.3 3.7 1.5-7.2L1.8 9.4 9 8.6Z"/>',
    move: '<path d="M12 2v20M2 12h20m-13-7 3-3 3 3m-6 14 3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    book: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v16"/>',
    shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.star}</svg>`;
};

function towerArt(tower) {
  const color = esc(tower.color || "#77bdda");
  let geometry;
  switch (tower.shape) {
    case "triangle":
      geometry = '<path d="M40 12 68 62H12Z"/>';
      break;
    case "square":
      geometry = '<rect x="17" y="17" width="46" height="46" rx="10"/>';
      break;
    case "diamond":
      geometry = '<path d="m40 10 29 30-29 30L11 40Z"/>';
      break;
    case "hexagon":
      geometry = '<path d="m25 14 30 0 15 26-15 26H25L10 40Z"/>';
      break;
    case "pentagon":
      geometry = '<path d="M40 10 69 31 58 65H22L11 31Z"/>';
      break;
    case "star":
      geometry =
        '<path d="m40 7 10 20 22 4-16 16 4 23-20-11-20 11 4-23L8 31l22-4Z"/>';
      break;
    case "octagon":
      geometry = '<path d="M27 12h26l15 15v26L53 68H27L12 53V27Z"/>';
      break;
    case "cross":
      geometry = '<path d="M29 12h22v17h17v22H51v17H29V51H12V29h17Z"/>';
      break;
    case "ring":
      geometry =
        '<circle cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="18" fill="#f7f4fd"/>';
      break;
    default:
      geometry = '<circle cx="40" cy="40" r="27"/>';
  }
  return `<svg class="gb-tower-art" viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="71" rx="25" ry="5" fill="#20362b" opacity=".12"/><g fill="${color}" stroke="#294b43" stroke-width="3.5" stroke-linejoin="round">${geometry}</g><path d="M25 28q9-10 19-8" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" opacity=".45"/><circle cx="32" cy="40" r="3" fill="#213d35"/><circle cx="49" cy="40" r="3" fill="#213d35"/><path d="M36 49q5 5 10 0" fill="none" stroke="#213d35" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

function alienArt(type) {
  const colors = {
    scout: "#b9a0e5",
    skater: "#ffbb88",
    swarm: "#a3d986",
    tank: "#96c6da",
    boss: "#ed9bc5",
  };
  const body =
    type === "skater"
      ? '<path d="m11 44 19-15h30l21 15-20 13H30Z"/>'
      : '<ellipse cx="45" cy="45" rx="35" ry="15"/>';
  const eyes =
    type === "boss"
      ? '<circle cx="34" cy="31" r="6"/><circle cx="46" cy="26" r="6"/><circle cx="58" cy="31" r="6"/>'
      : '<ellipse cx="35" cy="31" rx="7" ry="8"/><ellipse cx="55" cy="31" rx="7" ry="8"/>';
  return `<svg viewBox="0 0 90 90" aria-hidden="true"><g class="gb-ufo-glow" fill="#abf3ed"><ellipse cx="47" cy="65" rx="19" ry="9" opacity=".25"/><ellipse cx="47" cy="65" rx="11" ry="4" opacity=".65"/></g><g class="gb-alien-feelers" fill="none" stroke="${colors[type]}" stroke-width="4" stroke-linecap="round"><path d="M30 55q-9 12 0 16m15-13q9 9 0 17m15-20q10 11 4 17"/></g><g fill="${colors[type]}" stroke="#454369" stroke-width="2.8" stroke-linejoin="round">${body}<path d="M24 38V29q0-17 21-17t21 17v9q-21 14-42 0Z"/></g><path d="M29 18 22 8m39 10 7-10" fill="none" stroke="#d5caef" stroke-width="2.5" stroke-linecap="round"/><circle class="gb-antenna-light" cx="21" cy="7" r="4" fill="#f9df8f"/><circle class="gb-antenna-light" cx="69" cy="7" r="4" fill="#f9df8f"/><g fill="#fff9e9">${eyes}</g><g fill="#38375f"><circle cx="33" cy="31" r="3"/><circle cx="53" cy="31" r="3"/>${type === "boss" ? '<circle cx="44" cy="26" r="3"/>' : ""}</g><path d="M40 42q5 4 10 0" fill="none" stroke="#454369" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="27" cy="40" rx="4" ry="2" fill="#f2a7c2"/><ellipse cx="64" cy="40" rx="4" ry="2" fill="#f2a7c2"/><path d="M17 49q28 16 56 0" fill="none" stroke="#454369" stroke-width="2.5"/><g class="gb-ufo-lights" fill="#fbefab"><circle cx="23" cy="51" r="2.8"/><circle cx="45" cy="56" r="2.8"/><circle cx="67" cy="51" r="2.8"/></g>${type === "tank" || type === "boss" ? '<path d="m16 43 7-6m51 6-7-6" stroke="#edfaff" stroke-width="5" stroke-linecap="round"/>' : ""}</svg>`;
}

const earthArt = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="gb-earth-clip"><circle cx="60" cy="60" r="43"/></clipPath></defs><circle class="gb-atmosphere" cx="60" cy="60" r="51" fill="#b8e8d7" opacity=".35"/><circle cx="60" cy="60" r="43" fill="#73c5e9"/><g clip-path="url(#gb-earth-clip)"><g class="gb-earth-land" fill="#8ac86c"><path d="M18 24 40 17l11 12-3 13-16 2-5 17-15-8ZM67 14l32 12 6 21-18 8-5 17-16-6-8-20 15-6ZM44 64l15 7 1 15-14 18-8-13-4-15Z"/><path d="m95 89 17-13 10 9-3 18-24 5Z"/></g></g><circle cx="60" cy="60" r="43" fill="none" stroke="#365d57" stroke-width="3"/><path d="M30 37q6-10 16-13" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" opacity=".65"/><g class="gb-face-happy"><g class="gb-earth-eyes" fill="#2c514e"><ellipse cx="48" cy="60" rx="4" ry="5"/><ellipse cx="74" cy="60" rx="4" ry="5"/></g><path d="M53 72q8 8 16 0" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/></g><g class="gb-face-worried"><path d="m42 49 10-4m17 0 10 4" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/><ellipse cx="49" cy="60" rx="4" ry="6" fill="#2c514e"/><ellipse cx="75" cy="60" rx="4" ry="6" fill="#2c514e"/><path d="M53 76q8-10 16 0" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/><path class="gb-sweat-drop" d="M89 41q-9 11 0 12 9-1 0-12Z" fill="#d7faff" stroke="#74bac9" stroke-width="1"/></g><ellipse cx="37" cy="69" rx="6" ry="3" fill="#eda8a1"/><ellipse cx="84" cy="69" rx="6" ry="3" fill="#eda8a1"/></svg>`;

const spaceScenery = `<div class="gb-space-scenery" aria-hidden="true"><div class="gb-nebula gb-nebula-one"></div><div class="gb-nebula gb-nebula-two"></div><div class="gb-distant-planet"><i></i></div>${Array.from({ length: 32 }, (_, i) => `<span class="gb-space-star ${i % 5 === 0 ? "gb-star-spark" : ""}" style="left:${(i * 43 + 7) % 100}%;top:${(i * 29 + 11) % 100}%;--star-delay:-${i % 7}s;--star-size:${i % 5 === 0 ? 11 : 2 + (i % 3)}px">${i % 5 === 0 ? "✦" : ""}</span>`).join("")}<span class="gb-space-pebble gb-pebble-one"></span><span class="gb-space-pebble gb-pebble-two"></span></div>`;

export function mountBattle(
  container,
  {
    mission = {},
    onComplete = () => {},
    onExit = () => {},
    requestEnergy = async () => 0,
    onEnergyChange = () => {},
    startingEnergy = STARTING_ENERGY,
    guidedStart = false,
    settings = {},
  } = {},
) {
  const towerTypes = TOWERS.map((tower, index) => ({
    ...tower,
    role: tower.role || Object.keys(DEFAULTS)[index],
    ...Object.fromEntries(
      Object.entries(
        DEFAULTS[tower.role || Object.keys(DEFAULTS)[index]] ||
          DEFAULTS.shooter,
      ).map(([key, value]) => [key, tower[key] ?? value]),
    ),
  }));
  const count = Math.min(5, Math.max(1, Number(mission.waveCount) || 3));
  const difficulty = clamp(Number(mission.difficulty) || 1, 1, 6);
  const state = {
    energy: Math.max(0, Math.floor(Number(startingEnergy) || 0)),
    health: 5,
    wave: 0,
    status: "prep",
    selected: towerTypes[0]?.id,
    inspected: null,
    moving: null,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    paused: false,
    math: false,
    speed: 1,
    kills: 0,
    spent: 0,
    timer: 0,
    countdown: 8,
    awaitingPlacement: Boolean(guidedStart),
    preview: null,
    mathCooldown: 0,
    spawnIndex: 0,
    schedule: [],
    nextId: 1,
    destroyed: false,
    resultSent: false,
    renderDirty: true,
  };
  let raf = 0;
  let lastTime = 0;
  let toastTimer = 0;
  let finishTimer = 0;
  let lastSyncedEnergy = state.energy;
  let lastExternalPause = false;
  let selectionKey = "";
  const reducedMotion =
    Boolean(settings.reducedMotion) ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const listeners = [];
  const on = (element, event, handler) => {
    element.addEventListener(event, handler);
    listeners.push(() => element.removeEventListener(event, handler));
  };
  container.innerHTML = `
    <section class="gb-battle ${reducedMotion ? "gb-reduce-motion" : ""}" aria-label="Earth defense game">
      <header class="gb-header">
        <button class="gb-icon-button gb-exit" type="button" aria-label="Leave mission">${icon("back")}</button>
        <div class="gb-mission-title"><h1>${esc(mission.title || mission.name || "Earth defense")}</h1></div>
        <div class="gb-top-stats"><div class="gb-health" aria-label="Earth health"><span class="gb-hearts"></span></div><div class="gb-wallet" aria-label="Energy available">${icon("bolt")}<strong class="gb-energy">${state.energy}</strong></div><button class="gb-math-button" type="button" aria-label="Earn ${ANSWER_ENERGY} energy with math">${icon("bolt")}<span>Math +${ANSWER_ENERGY}</span></button></div>
      </header>
      <div class="gb-tower-tray" role="group" aria-label="Choose a tower">${towerTypes
        .map(
          (tower, index) => `
        <button type="button" class="gb-tower-card" data-tower="${esc(tower.id)}" style="--tower-color:${esc(tower.color)}" aria-pressed="false" title="${esc(tower.description || ROLE_NAMES[tower.role])}">
          <span class="gb-key">${index + 1}</span>${towerArt(tower)}<span class="gb-tower-name">${esc(tower.name)}</span><span class="gb-tower-cost">${icon("bolt")}${Number(tower.cost) || 2}</span>
        </button>`,
        )
        .join("")}</div>
      <div class="gb-board-heading"><div class="gb-wave-label"><span class="gb-wave-dot"></span><strong class="gb-wave-text">Incoming in 8</strong><span class="gb-wave-subtitle">1 / ${count}</span></div><div class="gb-threat-preview" aria-label="Incoming aliens"></div><div class="gb-play-controls"><button class="gb-speed-button" type="button" aria-label="Change game speed to 2 times">1×</button></div></div>
      <div class="gb-coach" role="status" aria-live="polite" hidden></div>
      <div class="gb-arena">
        ${spaceScenery}
        <div class="gb-earth-zone"><div class="gb-orbit gb-orbit-one"></div><div class="gb-orbit gb-orbit-two"></div><div class="gb-earth" data-mood="happy" role="img" aria-label="Earth is happy. No aliens nearby.">${earthArt}</div><span class="gb-earth-label">OUR LITTLE<br><b>EARTH</b></span><span class="gb-earth-mood" aria-hidden="true">All cozy.</span><span class="gb-earth-spark gb-spark-one">✦</span><span class="gb-earth-spark gb-spark-two">✧</span></div>
        <div class="gb-field"><div class="gb-lanes" aria-hidden="true">${Array.from({ length: ROWS }, (_, row) => `<div class="gb-lane" data-lane="${row}"><svg class="gb-star-stream" viewBox="0 0 900 80" preserveAspectRatio="none"><path d="M-20 40Q80 8 190 40T410 40 630 40 850 40 1070 40"/></svg><span class="gb-incoming">‹</span></div>`).join("")}</div><div class="gb-cells" role="group" aria-label="Defense field, five lanes and seven columns">${Array.from({ length: ROWS * COLS }, (_, index) => `<button class="gb-cell" type="button" data-row="${Math.floor(index / COLS)}" data-col="${index % COLS}" aria-label="Empty tile, lane ${Math.floor(index / COLS) + 1}, column ${(index % COLS) + 1}"></button>`).join("")}</div><div class="gb-entities" aria-hidden="true"></div><div class="gb-projectiles" aria-hidden="true"></div><div class="gb-effects" aria-hidden="true"></div></div>
        <div class="gb-result-banner" role="status" hidden></div>
      </div>
      <div class="gb-under-board"><div class="gb-selected-info" aria-live="polite"></div></div>
      <div class="gb-toast" role="status" aria-live="polite" hidden></div>
      <div class="gb-exit-confirm" hidden><div role="dialog" aria-modal="true" aria-labelledby="gb-leave-title"><span class="gb-section-label">A QUICK PIT STOP?</span><h2 id="gb-leave-title">Leave this mission?</h2><p>Your learning progress is saved. This battle will restart next time.</p><button class="gb-stay" type="button">Keep defending</button><button class="gb-leave" type="button">Leave mission</button></div></div>
    </section>`;

  const root = container.querySelector(".gb-battle");
  root.dataset.cosmetic = ["classic", "lilac", "sunset", "ocean"].includes(
    settings.equipped,
  )
    ? settings.equipped
    : "classic";
  const $ = (selector) => root.querySelector(selector);
  const cells = [...root.querySelectorAll(".gb-cell")];
  const towerCards = [...root.querySelectorAll(".gb-tower-card")];
  const enemyNodes = new Map();
  const projectileNodes = new Map();
  const effectNodes = new Map();
  let exitWasPaused = false;

  const typeFor = (id) => towerTypes.find((tower) => tower.id === id);
  const hasNativeDialog = () => Boolean(document.querySelector("dialog[open]"));
  const towerAt = (row, col) =>
    state.towers.find((tower) => tower.row === row && tower.col === col);
  const encounters = Array.from({ length: count }, (_, index) =>
    getEncounter(difficulty, index + 1),
  );
  const encounterFor = (wave) => encounters[clamp(wave - 1, 0, count - 1)];
  const activeLanes = (wave) => [
    ...new Set(encounterFor(wave).spawns.map((spawn) => spawn.row)),
  ];
  const rangeLayer = document.createElement("div");
  rangeLayer.className = "gb-range-preview";
  rangeLayer.setAttribute("aria-hidden", "true");
  $(".gb-field").appendChild(rangeLayer);
  const lanes = [...root.querySelectorAll(".gb-lane")];
  let rangeKey = "",
    coachKey = "";

  function renderRange() {
    const inspected = state.towers.find(
      (tower) => tower.id === state.inspected,
    );
    const moving = state.towers.find((tower) => tower.id === state.moving);
    const spot =
      state.preview ||
      inspected ||
      (state.awaitingPlacement ? { row: 1, col: 2 } : null);
    const occupied = spot && towerAt(spot.row, spot.col);
    const type = moving
      ? typeFor(moving.type)
      : occupied
        ? typeFor(occupied.type)
        : typeFor(state.selected);
    const show = spot && type && !["complete", "lost"].includes(state.status);
    const key = show ? `${spot.row}:${spot.col}:${type.id}:${!!occupied}` : "";
    if (key === rangeKey) return;
    rangeKey = key;
    rangeLayer.hidden = !show;
    lanes.forEach((lane) =>
      lane.classList.toggle(
        "gb-lane-targeted",
        !!show && Number(lane.dataset.lane) === spot.row,
      ),
    );
    cells.forEach((cell) =>
      cell.classList.toggle(
        "gb-cell-preview",
        !!show &&
          Number(cell.dataset.row) === spot.row &&
          Number(cell.dataset.col) === spot.col,
      ),
    );
    if (!show) {
      rangeLayer.innerHTML = "";
      return;
    }
    const left = Math.max(
      0,
      type.role === "slow" ? spot.col + 0.5 - type.range : spot.col + 0.3,
    );
    const right = Math.min(
      COLS,
      type.role === "block" ? spot.col + 1.02 : spot.col + 0.5 + type.range,
    );
    const radius = ["slow", "splash"].includes(type.role) ? 1 : 0;
    const firstRow = Math.max(0, spot.row - radius),
      lastRow = Math.min(ROWS - 1, spot.row + radius);
    rangeLayer.dataset.previewTower = type.id;
    rangeLayer.dataset.lanes = `${firstRow + 1}-${lastRow + 1}`;
    // Mark each target lane separately. A giant rectangle suggests that shots
    // also fill the gaps; Poppy's impact splash is shown when the shot lands.
    rangeLayer.innerHTML = `${Array.from({ length: lastRow - firstRow + 1 }, (_, offset) => `<div class="gb-range-target" style="left:${(left / COLS) * 100}%;width:${((right - left) / COLS) * 100}%;top:${((firstRow + offset + 0.78) / ROWS) * 100}%"></div>`).join("")}${occupied && !moving ? "" : `<div class="gb-range-origin" style="left:${((spot.col + 0.5) / COLS) * 100}%;top:${((spot.row + 0.5) / ROWS) * 100}%">${towerArt(type)}</div>`}`;
  }

  function renderCoach() {
    const waiting = state.status === "prep" || state.status === "between";
    const wave = Math.min(waiting ? state.wave + 1 : state.wave, count);
    const encounter = encounterFor(wave);
    let copy = "",
      suggestions = [],
      art = "";
    if (state.awaitingPlacement) {
      copy = "Place your first defender on a glowing pad";
      art = towerArt(typeFor(state.selected) || towerTypes[0]);
    } else if (guidedStart && state.status === "prep") {
      copy = "Cover both glowing lanes. Aliens arrive from the right!";
    } else if (waiting || (state.status === "wave" && state.timer < 8)) {
      copy = encounter.tip || encounter.label;
      suggestions = encounter.suggestedTowers || [];
      art = alienArt(encounter.spawns[0].type);
    }
    const key = `${copy}:${suggestions.join()}:${state.awaitingPlacement ? state.selected : wave}`;
    if (key !== coachKey) {
      coachKey = key;
      $(".gb-coach").hidden = !copy;
      $(".gb-coach").innerHTML = copy
        ? `<span class="gb-coach-art" aria-hidden="true">${art}</span><span class="gb-coach-copy">${esc(copy)}</span><span class="gb-coach-towers" aria-hidden="true">${suggestions
            .map((id) => typeFor(id))
            .filter(Boolean)
            .map(towerArt)
            .join("")}</span>`
        : "";
    }
    towerCards.forEach((card) =>
      card.classList.toggle(
        "gb-tower-suggested",
        state.awaitingPlacement
          ? card.dataset.tower === "pebble"
          : !!copy && suggestions.includes(card.dataset.tower),
      ),
    );
    cells.forEach((cell) =>
      cell.classList.toggle(
        "gb-cell-guided",
        guidedStart &&
          state.status === "prep" &&
          [1, 3].includes(Number(cell.dataset.row)) &&
          Number(cell.dataset.col) === 2 &&
          !towerAt(Number(cell.dataset.row), 2),
      ),
    );
  }

  function renderSignals() {
    const waiting = state.status === "prep" || state.status === "between";
    const schedule = waiting
      ? encounterFor(state.wave + 1).spawns
      : state.schedule.slice(state.spawnIndex);
    lanes.forEach((lane) => {
      const imminent =
        !state.awaitingPlacement &&
        (waiting || state.status === "wave") &&
        schedule.find(
          (spawn) =>
            spawn.row === Number(lane.dataset.lane) &&
            (waiting ? spawn.at + state.countdown : spawn.at - state.timer) <=
              3,
        );
      lane.classList.toggle("gb-lane-warning", !!imminent);
      const marker = lane.querySelector(".gb-incoming");
      const type = imminent ? imminent.type : "";
      if (marker.dataset.incoming !== type) {
        marker.dataset.incoming = type;
        marker.innerHTML = type
          ? '<span class="gb-entry-arrow">‹</span><span class="gb-entry-count"></span>'
          : "";
      }
      if (imminent)
        marker.querySelector(".gb-entry-count").textContent = Math.max(
          1,
          Math.ceil(
            waiting ? imminent.at + state.countdown : imminent.at - state.timer,
          ),
        );
    });
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $(".gb-toast").textContent = message;
    $(".gb-toast").hidden = false;
    toastTimer = setTimeout(() => {
      if (!state.destroyed) $(".gb-toast").hidden = true;
    }, 3300);
  }
  function effect(text, x, row, color = "#355644", kind = "text") {
    state.effects.push({
      id: state.nextId++,
      text,
      x,
      row,
      color,
      life: 0.85,
      maxLife: 0.85,
      kind,
    });
  }
  function renderUI() {
    if (state.destroyed) return;
    if (state.energy !== lastSyncedEnergy) {
      lastSyncedEnergy = state.energy;
      onEnergyChange(state.energy);
    }
    $(".gb-energy").textContent = state.energy;
    $(".gb-hearts").innerHTML = Array.from(
      { length: 5 },
      (_, index) =>
        `<span class="${index < state.health ? "" : "gb-heart-empty"}">${icon("heart")}</span>`,
    ).join("");
    $(".gb-health").setAttribute(
      "aria-label",
      `Earth shield: ${state.health} of 5`,
    );
    towerCards.forEach((card) => {
      const tower = typeFor(card.dataset.tower);
      card.classList.toggle(
        "gb-chosen",
        state.selected === tower.id && !state.inspected,
      );
      card.classList.toggle("gb-too-expensive", state.energy < tower.cost);
      card.setAttribute(
        "aria-pressed",
        String(state.selected === tower.id && !state.inspected),
      );
      card.setAttribute(
        "aria-label",
        `${tower.name}, ${tower.cost} energy. ${tower.description || ROLE_NAMES[tower.role]}`,
      );
    });
    cells.forEach((cell) => {
      const placed = towerAt(
        Number(cell.dataset.row),
        Number(cell.dataset.col),
      );
      const isMoving = placed?.id === state.moving;
      cell.classList.toggle("gb-occupied", !!placed);
      cell.classList.toggle("gb-inspected", placed?.id === state.inspected);
      cell.classList.toggle("gb-moving", isMoving);
      cell.classList.toggle(
        "gb-can-place",
        !placed && !!(state.selected || state.moving),
      );
      if (placed) {
        const type = typeFor(placed.type);
        if (cell.dataset.placed !== String(placed.id)) {
          cell.innerHTML = `${towerArt(type)}<span class="gb-tower-life"><i></i></span>${type.role === "support" ? '<span class="gb-aura" aria-hidden="true"></span>' : ""}`;
          cell.dataset.placed = placed.id;
        }
        cell.querySelector(".gb-tower-life i").style.width =
          `${(100 * placed.hp) / placed.maxHp}%`;
        cell.setAttribute(
          "aria-label",
          `${type.name}, lane ${placed.row + 1}, column ${placed.col + 1}. ${Math.ceil(placed.hp)} health. Select to move or recycle.`,
        );
      } else {
        if (cell.dataset.placed) {
          cell.innerHTML = "";
          delete cell.dataset.placed;
        }
        cell.setAttribute(
          "aria-label",
          `Empty tile, lane ${Number(cell.dataset.row) + 1}, column ${Number(cell.dataset.col) + 1}${state.moving ? ". Move selected defender here." : state.selected ? `. Place ${typeFor(state.selected)?.name}.` : ""}`,
        );
      }
    });
    const waiting = state.status === "prep" || state.status === "between";
    const current = waiting ? state.wave + 1 : state.wave;
    $(".gb-wave-text").textContent = state.awaitingPlacement
      ? "Place a defender"
      : waiting
        ? `${state.status === "prep" ? "Incoming" : "Next wave"} in ${Math.ceil(state.countdown)}`
        : state.status === "complete"
          ? "Earth saved!"
          : state.status === "lost"
            ? "Try a new team"
            : `Wave ${state.wave}`;
    $(".gb-wave-subtitle").textContent =
      `${Math.min(current, count)} / ${count}`;
    $(".gb-wave-text").classList.toggle("gb-countdown", waiting);
    const preview = $(".gb-threat-preview");
    const previewWave = Math.min(current, count);
    if (preview.dataset.wave !== String(previewWave)) {
      preview.dataset.wave = previewWave;
      preview.innerHTML = [
        ...new Set(encounterFor(previewWave).spawns.map((spawn) => spawn.type)),
      ]
        .map(
          (id) =>
            `<span class="gb-threat" role="img" aria-label="${ENEMIES[id].name}. Try ${ENEMIES[id].counter}." title="${ENEMIES[id].name} · ${ENEMIES[id].counter}">${alienArt(id)}</span>`,
        )
        .join("");
    }
    $(".gb-math-button").disabled =
      state.mathCooldown > 0 ||
      state.math ||
      ["complete", "lost"].includes(state.status);
    $(".gb-math-button span").textContent =
      state.mathCooldown > 0
        ? `${Math.ceil(state.mathCooldown)}s`
        : `Math +${ANSWER_ENERGY}`;
    $(".gb-speed-button").textContent = `${state.speed}×`;
    $(".gb-speed-button").setAttribute(
      "aria-label",
      `Change game speed to ${state.speed === 1 ? 2 : 1} times`,
    );
    root.classList.toggle(
      "gb-is-paused",
      state.paused || state.math || document.hidden || hasNativeDialog(),
    );
    root.classList.toggle("gb-is-moving", !!state.moving);
    root
      .querySelectorAll(".gb-lane")
      .forEach((lane) =>
        lane.classList.toggle(
          "gb-lane-active",
          activeLanes(Math.min(current, count)).includes(
            Number(lane.dataset.lane),
          ),
        ),
      );
    renderSelection();
    renderCoach();
    renderRange();
    renderSignals();
    state.renderDirty = false;
  }
  function renderSelection() {
    const inspected = state.towers.find(
      (tower) => tower.id === state.inspected,
    );
    const type = inspected ? typeFor(inspected.type) : typeFor(state.selected);
    const info = $(".gb-selected-info");
    if (!type) {
      if (selectionKey !== "empty")
        info.innerHTML =
          "<div><strong>Pick a defender → tap a space</strong></div>";
      selectionKey = "empty";
      return;
    }
    const refund =
      state.status === "prep" || state.status === "between"
        ? type.cost
        : Math.max(1, Math.floor(type.cost / 2));
    const nextKey = `${type.id}:${inspected?.id || ""}:${refund}:${state.moving || ""}`;
    if (selectionKey === nextKey) return;
    selectionKey = nextKey;
    info.innerHTML = `<span class="gb-info-shape">${towerArt(type)}</span><div class="gb-info-copy"><strong>${esc(type.name)} <span>${esc(ROLE_NAMES[type.role])}</span></strong>${state.moving ? "<p>Tap an empty space</p>" : ""}</div>${inspected ? `<div class="gb-inspect-actions"><button class="gb-move-tower" type="button" aria-label="Move ${esc(type.name)}">${icon("move")}Move</button><button class="gb-sell-tower" type="button" aria-label="Recycle ${esc(type.name)} for ${refund} energy">Recycle +${refund}${icon("bolt")}</button></div>` : ""}`;
    if (inspected) {
      info.querySelector(".gb-move-tower").onclick = () => {
        if (state.status === "wave") {
          toast("Move between waves. Recycle is always available.");
          return;
        }
        state.moving = inspected.id;
        state.selected = null;
        renderUI();
      };
      info.querySelector(".gb-sell-tower").onclick = () => {
        state.energy += refund;
        state.towers = state.towers.filter(
          (tower) => tower.id !== inspected.id,
        );
        state.inspected = null;
        state.moving = null;
        state.selected = type.id;
        effect(`+${refund}`, inspected.col + 0.5, inspected.row, "#579345");
        renderUI();
      };
    }
  }
  function choose(typeId) {
    if (
      state.math ||
      hasNativeDialog() ||
      state.status === "complete" ||
      state.status === "lost"
    )
      return;
    state.selected = typeId;
    state.inspected = null;
    state.moving = null;
    state.preview ||= { row: state.awaitingPlacement ? 1 : 2, col: 2 };
    renderUI();
  }
  function clickCell(row, col) {
    if (
      state.math ||
      state.paused ||
      hasNativeDialog() ||
      state.status === "complete" ||
      state.status === "lost"
    )
      return;
    state.preview = { row, col };
    const existing = towerAt(row, col);
    if (existing) {
      state.inspected = existing.id;
      state.selected = null;
      state.moving = null;
      renderUI();
      return;
    }
    if (state.moving) {
      const tower = state.towers.find((item) => item.id === state.moving);
      if (tower) {
        tower.row = row;
        tower.col = col;
      }
      state.moving = null;
      renderUI();
      return;
    }
    const type = typeFor(state.selected);
    if (!type) {
      toast("Choose a defender from your shape squad first.");
      return;
    }
    if (state.energy < type.cost) {
      toast(`Solve one question for +${ANSWER_ENERGY} energy.`);
      $(".gb-math-button").classList.add("gb-nudge");
      setTimeout(() => {
        if (!state.destroyed) $(".gb-math-button").classList.remove("gb-nudge");
      }, 700);
      return;
    }
    state.energy -= type.cost;
    state.spent += type.cost;
    state.awaitingPlacement = false;
    state.towers.push({
      id: state.nextId++,
      type: type.id,
      row,
      col,
      hp: type.hp,
      maxHp: type.hp,
      cooldown: 0.3,
      flash: 0,
    });
    effect("✦", col + 0.5, row, type.color, "build");
    renderUI();
  }
  async function earnEnergy() {
    if (
      state.math ||
      state.mathCooldown > 0 ||
      state.status === "complete" ||
      state.status === "lost"
    )
      return;
    state.math = true;
    renderUI();
    try {
      const amount = await requestEnergy();
      if (state.destroyed) return;
      const earned = Math.max(0, Math.floor(Number(amount) || 0));
      state.energy += earned;
      if (earned) toast(`+${earned} energy! Your shape squad is ready.`);
    } catch {
      if (!state.destroyed) toast("That math break could not open. Try again.");
    } finally {
      if (!state.destroyed) {
        state.math = false;
        state.mathCooldown = 3;
        lastTime = performance.now();
        renderUI();
      }
    }
  }
  function startWave() {
    if (
      !["prep", "between"].includes(state.status) ||
      state.paused ||
      state.math
    )
      return;
    state.wave++;
    state.status = "wave";
    state.timer = 0;
    state.spawnIndex = 0;
    state.inspected = null;
    state.moving = null;
    state.schedule = encounterFor(state.wave).spawns;
    renderUI();
  }
  function spawnEnemy(spawn) {
    const kind = ENEMIES[spawn.type];
    const hp = kind.hp * (1 + (difficulty - 1) * 0.04);
    state.enemies.push({
      id: state.nextId++,
      x: 7.35,
      row: spawn.row,
      hp,
      maxHp: hp,
      type: spawn.type,
      speed: kind.speed,
      armor: kind.armor,
      attack: kind.attack,
      slow: 0,
      flash: 0,
      bite: 0,
      blocked: false,
    });
  }
  function damage(enemy, amount, ignoresArmor = false) {
    if (enemy.hp <= 0) return;
    enemy.hp -= amount * (ignoresArmor ? 1 : 1 - enemy.armor);
    enemy.flash = 0.16;
    if (enemy.hp <= 0) {
      state.kills++;
      state.renderDirty = true;
      effect("✦", enemy.x, enemy.row, "#a084cb", "pop");
    }
  }
  function fire(tower, target) {
    const type = typeFor(tower.type);
    tower.cooldown = Number(type.rate);
    tower.flash = 0.2;
    if (type.role === "slow") {
      for (const enemy of state.enemies) {
        if (
          enemy.hp > 0 &&
          Math.abs(enemy.row - tower.row) <= 1 &&
          Math.abs(enemy.x - (tower.col + 0.5)) <= type.range
        ) {
          damage(enemy, type.damage);
          enemy.slow = 3;
          effect("", enemy.x, enemy.row, type.color, "chill");
        }
      }
      effect("", tower.col + 0.5, tower.row, type.color, "chill");
      return;
    }
    state.projectiles.push({
      id: state.nextId++,
      x: tower.col + 0.76,
      row: target.row,
      target: target.id,
      damage: type.damage,
      role: type.role,
      color: type.color,
      hit: new Set(),
      life: 3,
    });
  }
  function hitProjectile(projectile, enemy) {
    damage(enemy, projectile.damage, projectile.role === "piercing");
    if (projectile.role === "splash") {
      state.enemies
        .filter(
          (other) =>
            other.id !== enemy.id &&
            other.hp > 0 &&
            Math.abs(other.x - enemy.x) <= 0.95 &&
            Math.abs(other.row - enemy.row) <= 1,
        )
        .forEach((other) => damage(other, projectile.damage * 0.7));
      effect("", enemy.x, enemy.row, "#c3a3f0", "splash");
    }
  }
  function finish(won) {
    if (state.resultSent || state.destroyed) return;
    state.resultSent = true;
    state.status = won ? "complete" : "lost";
    $(".gb-result-banner").hidden = false;
    $(".gb-result-banner").innerHTML =
      `${icon(won ? "star" : "shield")}<strong>${won ? "Earth is smiling. You did it!" : "Every great defender tries again."}</strong>`;
    renderUI();
    finishTimer = setTimeout(() => {
      if (!state.destroyed)
        onComplete({
          won,
          stars: won ? (state.health >= 5 ? 3 : state.health >= 3 ? 2 : 1) : 0,
          kills: state.kills,
          waves: won ? state.wave : Math.max(0, state.wave - 1),
          energySpent: state.spent,
        });
    }, 1200);
  }
  function update(delta) {
    const oldCooldown = Math.ceil(state.mathCooldown);
    state.mathCooldown = Math.max(0, state.mathCooldown - delta);
    if (oldCooldown !== Math.ceil(state.mathCooldown)) state.renderDirty = true;
    state.effects.forEach((item) => {
      item.life -= delta;
    });
    state.effects = state.effects.filter((item) => item.life > 0);
    if (
      (state.status === "prep" || state.status === "between") &&
      !state.awaitingPlacement
    ) {
      const oldCountdown = Math.ceil(state.countdown);
      state.countdown = Math.max(0, state.countdown - delta);
      if (oldCountdown !== Math.ceil(state.countdown)) state.renderDirty = true;
      if (state.countdown <= 0) startWave();
    }
    if (state.status !== "wave") return;
    state.timer += delta;
    while (
      state.spawnIndex < state.schedule.length &&
      state.schedule[state.spawnIndex].at <= state.timer
    )
      spawnEnemy(state.schedule[state.spawnIndex++]);
    state.towers.forEach((tower) => {
      const type = typeFor(tower.type);
      tower.flash = Math.max(0, tower.flash - delta);
      tower.cooldown -= delta;
      if (type.role !== "block" && tower.cooldown <= 0) {
        const targets = state.enemies
          .filter(
            (enemy) =>
              enemy.hp > 0 &&
              Math.abs(enemy.row - tower.row) <=
                (["splash", "slow"].includes(type.role) ? 1 : 0) &&
              enemy.x >=
                (type.role === "slow"
                  ? tower.col + 0.5 - type.range
                  : tower.col + 0.3) &&
              enemy.x <= tower.col + 0.5 + type.range,
          )
          .sort((a, b) => a.x - b.x);
        if (targets[0]) fire(tower, targets[0]);
      }
    });
    state.projectiles.forEach((projectile) => {
      const previousX = projectile.x;
      projectile.x += delta * 7;
      projectile.life -= delta;
      const hits = state.enemies
        .filter(
          (enemy) =>
            enemy.hp > 0 &&
            enemy.row === projectile.row &&
            enemy.x >= previousX - 0.25 &&
            enemy.x <= projectile.x + 0.25 &&
            !projectile.hit.has(enemy.id),
        )
        .sort((a, b) => a.x - b.x);
      for (const enemy of hits) {
        projectile.hit.add(enemy.id);
        hitProjectile(projectile, enemy);
        // Prism breaks armor on one target; it does not erase a whole swarm.
        projectile.life = 0;
        break;
      }
    });
    state.projectiles = state.projectiles.filter(
      (projectile) => projectile.life > 0 && projectile.x <= 7.8,
    );
    state.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      enemy.slow = Math.max(0, enemy.slow - delta);
      enemy.flash = Math.max(0, enemy.flash - delta);
      const nextX = enemy.x - enemy.speed * (enemy.slow > 0 ? 0.48 : 1) * delta;
      const blocking = state.towers
        .filter(
          (tower) =>
            tower.hp > 0 &&
            tower.row === enemy.row &&
            enemy.x >= tower.col + 0.3 &&
            nextX <= tower.col + 1.02,
        )
        .sort((a, b) => b.col - a.col)[0];
      enemy.blocked = Boolean(blocking);
      if (blocking) {
        blocking.hp -= enemy.attack * delta;
        enemy.bite += delta;
        if (typeFor(blocking.type).role === "block") {
          damage(enemy, typeFor(blocking.type).damage * delta);
          damage(enemy, enemy.attack * 0.4 * delta, true);
        }
        if (enemy.bite >= 0.65) {
          enemy.bite = 0;
          effect("·", blocking.col + 0.7, blocking.row, "#b47974");
          state.renderDirty = true;
        }
        if (blocking.hp <= 0) {
          state.renderDirty = true;
          effect("✧", blocking.col + 0.5, blocking.row, "#889b8b", "pop");
          if (state.inspected === blocking.id) state.inspected = null;
        }
      } else {
        enemy.x = nextX;
      }
      if (enemy.x < -0.1) {
        enemy.hp = 0;
        state.health = Math.max(0, state.health - 1);
        state.renderDirty = true;
        root.classList.remove("gb-earth-hit");
        void root.offsetWidth;
        root.classList.add("gb-earth-hit");
        effect("−1", 0.15, enemy.row, "#ca7f73");
      }
    });
    state.towers = state.towers.filter((tower) => tower.hp > 0);
    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
    if (state.health <= 0) {
      finish(false);
      return;
    }
    if (
      state.spawnIndex === state.schedule.length &&
      state.enemies.length === 0
    ) {
      state.projectiles = [];
      if (state.wave >= count) finish(true);
      else {
        state.status = "between";
        state.countdown = 5;
        state.renderDirty = true;
        toast("Next wave in 5");
      }
    }
  }
  function syncNodes(items, nodes, holder, create, paint) {
    const currentIds = new Set(items.map((item) => item.id));
    nodes.forEach((node, id) => {
      if (!currentIds.has(id)) {
        node.remove();
        nodes.delete(id);
      }
    });
    items.forEach((item) => {
      let node = nodes.get(item.id);
      if (!node) {
        node = create(item);
        nodes.set(item.id, node);
        holder.appendChild(node);
      }
      paint(node, item);
    });
  }
  function renderEntities() {
    // React to actual enemy positions, even in reduced-motion mode. Pauses keep
    // those positions (and therefore Earth's expression) exactly where they are.
    const worried =
      state.status === "wave" &&
      state.enemies.some((enemy) => enemy.hp > 0 && enemy.x < 2);
    const mood = worried ? "worried" : "happy";
    const earth = $(".gb-earth");
    if (earth.dataset.mood !== mood) {
      earth.dataset.mood = mood;
      earth.setAttribute(
        "aria-label",
        worried
          ? "Earth is worried. Aliens are getting close!"
          : "Earth is happy. No aliens nearby.",
      );
      $(".gb-earth-mood").textContent = worried
        ? "A little help?"
        : "All cozy.";
      root.classList.toggle("gb-earth-worried", worried);
    }
    syncNodes(
      state.enemies,
      enemyNodes,
      $(".gb-entities"),
      (enemy) => {
        const node = document.createElement("div");
        node.className = `gb-alien gb-alien-${enemy.type}${enemy.armor ? " gb-alien-armored" : ""}`;
        node.style.setProperty("--float-delay", `-${(enemy.id % 9) * 0.37}s`);
        node.style.setProperty(
          "--float-duration",
          `${2.4 + (enemy.id % 5) * 0.28}s`,
        );
        node.innerHTML = `${alienArt(enemy.type)}${enemy.armor ? '<span class="gb-armor-shell"></span>' : ""}<span class="gb-enemy-life"><i></i></span>`;
        return node;
      },
      (node, enemy) => {
        node.style.left = `${(enemy.x / COLS) * 100}%`;
        node.style.top = `${((enemy.row + 0.5) / ROWS) * 100}%`;
        node.classList.toggle("gb-frozen", enemy.slow > 0);
        node.classList.toggle("gb-hit", enemy.flash > 0);
        node.classList.toggle("gb-alien-blocked", enemy.blocked);
        node.querySelector("i").style.width =
          `${clamp((enemy.hp / enemy.maxHp) * 100, 0, 100)}%`;
      },
    );
    syncNodes(
      state.projectiles,
      projectileNodes,
      $(".gb-projectiles"),
      (projectile) => {
        const node = document.createElement("div");
        node.className = `gb-shot gb-shot-${projectile.role}`;
        node.style.setProperty("--shot-color", projectile.color);
        return node;
      },
      (node, projectile) => {
        node.style.left = `${(projectile.x / COLS) * 100}%`;
        node.style.top = `${((projectile.row + 0.5) / ROWS) * 100}%`;
      },
    );
    syncNodes(
      state.effects,
      effectNodes,
      $(".gb-effects"),
      (item) => {
        const node = document.createElement("span");
        node.className = `gb-effect gb-effect-${item.kind}`;
        node.textContent = item.text;
        node.style.color = item.color;
        return node;
      },
      (node, item) => {
        node.style.left = `${(item.x / COLS) * 100}%`;
        node.style.top = `${((item.row + 0.5) / ROWS) * 100}%`;
        node.style.opacity = Math.min(1, item.life * 2);
        const progress = 1 - item.life / item.maxLife;
        node.style.transform = ["splash", "chill"].includes(item.kind)
          ? `translate(-50%, -50%) scale(${0.4 + progress * 0.85})`
          : `translate(-50%, ${-50 - progress * 90}%)`;
      },
    );
    state.towers.forEach((tower) =>
      cells[tower.row * COLS + tower.col].classList.toggle(
        "gb-shooting",
        tower.flash > 0,
      ),
    );
  }
  function frame(now) {
    if (state.destroyed) return;
    const delta =
      Math.min((now - (lastTime || now)) / 1000, 0.06) * state.speed;
    lastTime = now;
    const externalPause = document.hidden || hasNativeDialog();
    if (externalPause !== lastExternalPause) {
      lastExternalPause = externalPause;
      state.renderDirty = true;
    }
    if (!state.paused && !state.math && !externalPause) update(delta);
    if (state.renderDirty) renderUI();
    renderSignals();
    renderCoach();
    renderEntities();
    raf = requestAnimationFrame(frame);
  }
  towerCards.forEach((card) =>
    on(card, "click", () => choose(card.dataset.tower)),
  );
  cells.forEach((cell, index) => {
    const previewCell = () => {
      state.preview = {
        row: Number(cell.dataset.row),
        col: Number(cell.dataset.col),
      };
      renderRange();
    };
    on(cell, "pointerenter", previewCell);
    on(cell, "pointerdown", previewCell);
    on(cell, "focus", previewCell);
    on(cell, "click", () =>
      clickCell(Number(cell.dataset.row), Number(cell.dataset.col)),
    );
    on(cell, "keydown", (event) => {
      const movements = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowUp: -COLS,
        ArrowDown: COLS,
      };
      if (event.key in movements) {
        event.preventDefault();
        event.stopPropagation();
        cells[clamp(index + movements[event.key], 0, cells.length - 1)].focus();
      }
    });
  });
  on($(".gb-field"), "pointerleave", () => {
    if (!$(".gb-field").contains(document.activeElement)) {
      state.preview = null;
      renderRange();
    }
  });
  on($(".gb-math-button"), "click", earnEnergy);
  on($(".gb-speed-button"), "click", () => {
    state.speed = state.speed === 1 ? 2 : 1;
    renderUI();
  });
  on($(".gb-exit"), "click", () => {
    exitWasPaused = state.paused;
    state.paused = true;
    $(".gb-exit-confirm").hidden = false;
    renderUI();
    $(".gb-stay").focus();
  });
  const closeExit = () => {
    state.paused = exitWasPaused;
    $(".gb-exit-confirm").hidden = true;
    renderUI();
    $(".gb-exit").focus();
  };
  on($(".gb-stay"), "click", closeExit);
  on($(".gb-leave"), "click", () => onExit());
  on($(".gb-exit-confirm"), "keydown", (event) => {
    if (event.key === "Tab") {
      const target =
        document.activeElement === $(".gb-stay")
          ? $(".gb-leave")
          : $(".gb-stay");
      event.preventDefault();
      target.focus();
    }
  });
  on(document, "keydown", (event) => {
    if (
      state.math ||
      hasNativeDialog() ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")
    )
      return;
    if (!$(".gb-exit-confirm").hidden) {
      if (event.key === "Escape") closeExit();
      return;
    }
    if (
      /^[1-5]$/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      choose(towerTypes[Number(event.key) - 1]?.id);
    }
    if (event.key === "Escape") {
      if (state.moving || state.inspected || state.selected) {
        state.moving = null;
        state.inspected = null;
        state.selected = null;
        renderUI();
      }
    }
  });
  on(document, "visibilitychange", () => {
    lastTime = performance.now();
    renderUI();
  });
  renderUI();
  raf = requestAnimationFrame(frame);
  return {
    destroy() {
      state.destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(toastTimer);
      clearTimeout(finishTimer);
      listeners.forEach((remove) => remove());
    },
  };
}
