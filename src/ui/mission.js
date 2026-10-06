/**
 * The mission screen: build phases with the question shop, then waves of pure
 * tower defense. Reads the simulation each frame and draws it with DOM elements.
 */
import { createBattle, BEAM_COST } from "../core/battle.js";
import { ALIENS, COLS, TOWERS, MISSIONS, unlockedTowers, getUnit, towerStats } from "../core/content.js";
import { makeShop, resolveCard, PICKS_PER_BUILD } from "../core/shop.js";
import { recordAnswer, completeMission, missionsCompleted } from "../core/learner.js";
import { createRng } from "../core/rng.js";
import { alienArt, earthArt, icon, spaceScenery, towerArt } from "./art.js";
import { askQuestion } from "./question.js";
import { sfx, speak } from "./audio.js";

const TIER_LABEL = { bronze: "Easy", silver: "Medium", gold: "Hard" };

export function mountMission(root, { mission, profile, save, onExit, onNext }) {
  const battle = createBattle(mission);
  const { state } = battle;
  const unit = getUnit(mission.unit);
  const rng = createRng(Date.now() & 0xffffffff);
  const recentFacts = [];
  const firstEver = missionsCompleted(profile) === 0;
  const towersBefore = unlockedTowers(missionsCompleted(profile));
  const nodes = { towers: new Map(), aliens: new Map(), shots: new Map() };
  const leakedTypes = {};
  let picksLeft = 0;
  let selected = -1;
  let raf = 0;
  let last = performance.now();
  let destroyed = false;
  let shopHidden = false;
  let xpEarned = 0;
  let answered = 0;
  let firstTries = 0;

  root.innerHTML = `
    <div class="mission" style="--lanes:${state.lanes}">
      <header class="m-top">
        <button class="round-btn m-back" type="button" aria-label="Back to the path">${icon("back")}</button>
        <div class="m-title"><b>${mission.title}</b><span class="m-wave"></span></div>
        <div class="m-hearts" aria-label="Earth's hearts"></div>
        <button class="m-beam" type="button" disabled>${icon("bolt")}<span>Star Beam</span><i class="pips"></i></button>
      </header>
      <div class="m-board">
        <div class="m-earth">${earthArt()}</div>
        <div class="m-field">
          ${spaceScenery}
          <div class="m-lanes">${Array.from({ length: state.lanes }, (_, l) => `<div class="m-lane" data-lane="${l}"><span class="m-incoming"></span></div>`).join("")}</div>
          <div class="m-cells">${Array.from({ length: state.lanes * COLS }, (_, i) => `<button class="m-cell" type="button" data-lane="${Math.floor(i / COLS)}" data-col="${i % COLS}" aria-label="Lane ${Math.floor(i / COLS) + 1}, square ${(i % COLS) + 1}"></button>`).join("")}</div>
          <div class="m-entities"></div>
          <div class="m-fx"></div>
          <div class="m-banner" hidden></div>
          <span class="rotate-tip">Tip: turn your phone sideways</span>
        </div>
      </div>
      <footer class="m-tray">
        <div class="m-hand" aria-label="Your towers"></div>
        <div class="m-coach"></div>
        <button class="m-action big-btn" type="button"></button>
      </footer>
      <div class="m-overlay" hidden><div class="m-sheet"></div></div>
    </div>`;
  const $ = (s) => root.querySelector(s);
  const field = $(".m-field");
  const ents = $(".m-entities");
  const fx = $(".m-fx");
  const overlay = $(".m-overlay");
  const sheet = $(".m-sheet");

  const pos = (x, lane) => `left:${(x / COLS) * 100}%;top:${((lane + 0.5) / state.lanes) * 100}%`;

  /* ---------- coach, banner, top bar ---------- */
  function coach(text, say = false) {
    $(".m-coach").textContent = text;
    if (say) speak(text);
  }
  function banner(text, ms = 1600) {
    const b = $(".m-banner");
    b.textContent = text;
    b.hidden = false;
    b.classList.remove("show");
    void b.offsetWidth;
    b.classList.add("show");
    clearTimeout(banner.t);
    banner.t = setTimeout(() => (b.hidden = true), ms);
  }
  function renderTop() {
    const waveText =
      state.status === "wave"
        ? `Wave ${state.wave} of ${state.totalWaves}${state.wave === state.totalWaves && mission.boss ? " · Captain!" : ""}`
        : state.status === "build"
          ? `Build time · next: wave ${state.wave + 1} of ${state.totalWaves}`
          : "";
    $(".m-wave").textContent = waveText;
    $(".m-hearts").innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="${i < state.hearts ? "on" : "off"}">${icon("heart")}</span>`).join("");
    const beam = $(".m-beam");
    beam.querySelector(".pips").innerHTML = Array.from({ length: BEAM_COST }, (_, i) => `<b class="${i < state.beam ? "on" : ""}"></b>`).join("");
    const ready = state.beam >= BEAM_COST;
    beam.disabled = !(ready && state.status === "wave");
    beam.classList.toggle("ready", ready);
  }
  function renderAction() {
    const btn = $(".m-action");
    btn.classList.remove("pulse");
    if (state.status === "build" && picksLeft > 0) {
      btn.disabled = false;
      btn.innerHTML = `${icon("star")} Shop · ${picksLeft} left`;
    } else if (state.status === "build") {
      btn.disabled = false;
      btn.innerHTML = `${icon("play")} Start wave ${state.wave + 1}`;
      if (!state.hand.length) btn.classList.add("pulse");
    } else {
      btn.disabled = true;
      btn.innerHTML = state.status === "wave" ? "Defending…" : "";
    }
  }

  /* ---------- hand and placement ---------- */
  function renderHand() {
    const hand = $(".m-hand");
    hand.innerHTML = state.hand.length
      ? state.hand.map((t, i) => `<button class="hand-chip ${i === selected ? "selected" : ""}" type="button" data-hand="${i}" aria-label="${TOWERS[t.type].name} level ${t.level}">${towerArt(t.type, t.level)}<span>${TOWERS[t.type].name}</span></button>`).join("")
      : `<span class="hand-empty">Towers you buy wait here</span>`;
    renderCells();
  }
  function renderCells() {
    root.querySelectorAll(".m-cell").forEach((cell) => {
      const action = selected >= 0 ? battle.canPlace(selected, +cell.dataset.lane, +cell.dataset.col) : null;
      cell.classList.toggle("can-place", action === "place");
      cell.classList.toggle("can-merge", action === "merge");
    });
  }
  function selectHand(i) {
    selected = selected === i ? -1 : i;
    sfx.tap();
    renderHand();
    if (selected >= 0) {
      const t = state.hand[selected];
      coach(`${TOWERS[t.type].name}: ${TOWERS[t.type].tip} Tap a glowing square.`);
    }
  }
  function clickCell(lane, col) {
    if (selected < 0) {
      const tower = state.towers.find((t) => t.lane === lane && t.col === col);
      if (tower) coach(`${TOWERS[tower.type].name}, level ${tower.level}. ${TOWERS[tower.type].tip}`);
      else if (state.hand.length) coach("Tap a tower in your hand first.");
      return;
    }
    const action = battle.place(selected, lane, col);
    if (!action) return;
    if (action === "merge") {
      sfx.merge();
      speak("Merged! Level up!");
    } else sfx.place();
    selected = -1;
    renderHand();
    afterBuildChange();
  }
  function afterBuildChange() {
    if (state.status !== "build" || picksLeft > 0) return renderAction();
    if (state.hand.length) coach(firstEver ? "Tap a tower below, then tap a glowing square on the board." : "Place your towers. Same tower on same tower = merge!");
    else coach("Ready? Start the wave!");
    renderAction();
  }

  /* ---------- the shop ---------- */
  function excludeSet() {
    return new Set(recentFacts.slice(-6));
  }
  function cardHTML(card, i) {
    const t = TOWERS[card.tower.type];
    const q = card.question;
    const eq = `${q.blank === "left" ? "?" : q.left} ${q.op} ${q.blank === "right" ? "?" : q.right} = ${q.blank === "result" ? "?" : q.result}`;
    return `<button class="shop-card tier-${card.tier}" type="button" data-card="${i}">
      <span class="tier-tag">${TIER_LABEL[card.tier]}</span>
      <span class="card-art">${towerArt(card.tower.type, card.tower.level)}</span>
      <b class="card-name">${t.name}${card.tower.level > 1 ? ` <small>level ${card.tower.level}</small>` : ""}</b>
      <span class="card-role">${t.role}</span>
      <span class="card-price">${eq}</span>
    </button>`;
  }
  function openShop() {
    shopHidden = false;
    overlay.hidden = false;
    const pickNo = PICKS_PER_BUILD - picksLeft + 1;
    const cards = makeShop(profile, mission, mission.unit, rng, excludeSet());
    sheet.className = "m-sheet shop";
    sheet.innerHTML = `
      <div class="shop-head"><h2>Pick a tower</h2><span class="shop-count">${pickNo} of ${PICKS_PER_BUILD}</span>
        <button class="link-btn shop-peek" type="button">See the board</button></div>
      <p class="shop-sub">Solve its problem to get it. Harder problems give stronger towers.</p>
      <div class="shop-cards">${cards.map(cardHTML).join("")}</div>`;
    sheet.querySelector(".shop-peek").onclick = () => {
      shopHidden = true;
      overlay.hidden = true;
      coach("Look at the board. Tap Shop when you're ready.");
      renderAction();
    };
    sheet.querySelectorAll(".shop-card").forEach((el) => {
      el.onclick = () => buy(cards[+el.dataset.card]);
    });
    if (firstEver && pickNo === 1 && state.wave === 0) speak("Pick a tower. Solve its problem to get it!");
  }
  async function buy(card) {
    sfx.tap();
    sheet.className = "m-sheet asking";
    const result = await askQuestion(sheet, card);
    if (destroyed) return;
    const outcome = result.outcome;
    recentFacts.push(card.question.factId);
    const rec = recordAnswer(profile, { question: card.question, tier: card.tier, outcome, attempts: result.attempts, ms: result.ms, hinted: result.hinted });
    save();
    xpEarned += rec.xp;
    answered += 1;
    const got = resolveCard(card, outcome);
    battle.addToHand(got);
    if (outcome === "first") {
      firstTries += 1;
      battle.chargeBeam();
    }
    picksLeft -= 1;
    renderHand();
    renderTop();
    if (picksLeft > 0) openShop();
    else {
      overlay.hidden = true;
      if (state.beam >= BEAM_COST && state.wave === 0) banner("Star Beam charged!");
      afterBuildChange();
      if (firstEver && state.wave === 0) speak("Now tap a tower, then tap a glowing square.");
    }
  }

  /* ---------- phases ---------- */
  function startBuild() {
    picksLeft = PICKS_PER_BUILD;
    selected = -1;
    renderIncoming();
    renderTop();
    renderHand();
    renderAction();
    openShop();
  }
  function renderIncoming() {
    root.querySelectorAll(".m-incoming").forEach((el) => (el.innerHTML = ""));
    if (state.status !== "build") return;
    for (const { lane, types } of battle.nextWavePreview()) {
      const el = root.querySelector(`.m-lane[data-lane="${lane}"] .m-incoming`);
      if (el) el.innerHTML = types.slice(0, 3).map((t) => `<i title="${ALIENS[t].name}">${alienArt(t)}</i>`).join("");
    }
  }
  function startWave() {
    if (!battle.startWave()) return;
    selected = selected >= state.hand.length ? -1 : selected;
    sfx.wave();
    banner(state.wave === state.totalWaves && mission.boss ? "The Captain is coming!" : `Wave ${state.wave}!`);
    speak(state.wave === 1 ? "Here they come!" : `Wave ${state.wave}!`);
    coach(state.hand.length ? "You can still place towers from your hand." : "Watch your towers work! Use the Star Beam when it's ready.");
    renderIncoming();
    renderTop();
    renderAction();
    renderCells();
  }

  /* ---------- drawing ---------- */
  function puff(cls, x, lane, text = "") {
    const el = document.createElement("span");
    el.className = `fx ${cls}`;
    el.style.cssText = pos(x, lane);
    el.textContent = text;
    fx.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function handleEvents() {
    for (const e of battle.drainEvents()) {
      if (e.kind === "pop") {
        puff("fx-pop", e.x, e.lane, "✦");
        sfx.pop();
      } else if (e.kind === "splash") puff("fx-splash", e.x, e.lane);
      else if (e.kind === "frost") puff("fx-frost", e.col + 0.5, e.lane, "❄");
      else if (e.kind === "merge") puff("fx-merge", e.col + 0.5, e.lane, "★");
      else if (e.kind === "place") puff("fx-place", e.col + 0.5, e.lane);
      else if (e.kind === "towerLost") puff("fx-pop", e.col + 0.5, e.lane, "✧");
      else if (e.kind === "beam") {
        const lane = root.querySelector(`.m-lane[data-lane="${e.lane}"]`);
        lane?.classList.remove("beamed");
        void lane?.offsetWidth;
        lane?.classList.add("beamed");
        sfx.beam();
      } else if (e.kind === "leak") {
        leakedTypes[e.type] = (leakedTypes[e.type] || 0) + 1;
        const earth = $(".m-earth");
        earth.classList.remove("hit");
        void earth.offsetWidth;
        earth.classList.add("hit");
        sfx.leak();
        renderTop();
      } else if (e.kind === "waveClear") {
        banner("Wave cleared! Build time.");
        sfx.correct();
        setTimeout(() => !destroyed && startBuild(), 900);
        renderTop();
        renderAction();
      } else if (e.kind === "won" || e.kind === "lost") {
        renderTop();
        renderAction();
        setTimeout(() => !destroyed && showResult(), 900);
      }
    }
  }
  function sync(list, map, make, paint) {
    const alive = new Set();
    for (const item of list) {
      alive.add(item.id);
      let node = map.get(item.id);
      if (!node) {
        node = make(item);
        ents.appendChild(node);
        map.set(item.id, node);
      }
      paint(node, item);
    }
    for (const [id, node] of map) {
      if (!alive.has(id)) {
        node.remove();
        map.delete(id);
      }
    }
  }
  function draw() {
    sync(
      state.towers,
      nodes.towers,
      (t) => {
        const el = document.createElement("div");
        el.className = `tower t-${t.type}`;
        return el;
      },
      (el, t) => {
        if (el.dataset.level !== String(t.level)) {
          el.dataset.level = t.level;
          el.innerHTML = towerArt(t.type, t.level) + '<span class="life"><i></i></span>';
        }
        el.style.cssText = pos(t.col + 0.5, t.lane);
        el.classList.toggle("firing", (t.flash || 0) > 0);
        el.querySelector(".life i").style.width = `${Math.max(0, (t.hp / towerStats(t.type, t.level).hp) * 100)}%`;
      },
    );
    sync(
      state.aliens,
      nodes.aliens,
      (a) => {
        const el = document.createElement("div");
        el.className = `alien a-${a.type}`;
        el.innerHTML = `${alienArt(a.type)}<span class="life"><i></i></span>`;
        return el;
      },
      (el, a) => {
        el.style.cssText = pos(a.x, a.lane);
        el.querySelector(".life i").style.width = `${Math.max(0, (a.hp / a.maxHp) * 100)}%`;
        el.classList.toggle("hurt", a.flash > 0);
        el.classList.toggle("slowed", a.slow > 0);
        el.classList.toggle("blocked", a.blocked);
      },
    );
    sync(
      state.shots,
      nodes.shots,
      (s) => {
        const el = document.createElement("i");
        el.className = `shot s-${s.type}`;
        return el;
      },
      (el, s) => (el.style.cssText = pos(s.x, s.lane)),
    );
    $(".mission").classList.toggle("danger", battle.danger());
  }
  function frame(now) {
    if (destroyed) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (state.status === "wave" && !document.hidden) {
      battle.step(dt);
      handleEvents();
      renderTop();
    } else handleEvents();
    draw();
    raf = requestAnimationFrame(frame);
  }

  /* ---------- result ---------- */
  function showResult() {
    const won = state.status === "won";
    const stars = battle.stars();
    let unlockedNew = [];
    let unitUnlocked = false;
    if (won) {
      const res = completeMission(profile, mission.id, stars);
      xpEarned += res.gained * 10;
      unitUnlocked = res.unitUnlocked;
      const after = unlockedTowers(missionsCompleted(profile));
      unlockedNew = after.filter((t) => !towersBefore.includes(t));
      save();
      sfx.win();
      speak(stars === 3 ? "Amazing! Three stars!" : "Earth is safe! Great job!");
    } else {
      sfx.lose();
      speak("Earth needs a nap. Let's try again!");
    }
    const worst = Object.entries(leakedTypes).sort((a, b) => b[1] - a[1])[0];
    const tip = worst ? ALIENS[worst[0]].tip : "Spread your towers across the busy lanes.";
    const idx = MISSIONS.indexOf(mission);
    const next = MISSIONS[idx + 1] && MISSIONS[idx + 1].unit === mission.unit ? MISSIONS[idx + 1] : null;
    overlay.hidden = false;
    sheet.className = `m-sheet result ${won ? "won" : "lost"}`;
    sheet.innerHTML = `
      <div class="result-earth ${won ? "" : "sleepy"}">${earthArt()}</div>
      <h2>${won ? "Earth is safe!" : "Earth needs a nap!"}</h2>
      ${won ? `<div class="result-stars">${[1, 2, 3].map((n) => `<span class="${n <= stars ? "on" : ""}" style="--d:${n * 0.25}s">${icon("star")}</span>`).join("")}</div>` : `<p class="result-tip">${icon("bulb")} ${tip}</p>`}
      <div class="result-stats">
        <span>${icon("bolt")} +${xpEarned} XP</span>
        <span>${icon("check")} ${firstTries} of ${answered} right first try</span>
      </div>
      ${unlockedNew.map((t) => `<div class="result-unlock">${towerArt(t, 1)}<div><b>New tower: ${TOWERS[t].name}!</b><span>${TOWERS[t].tip}</span></div></div>`).join("")}
      ${unitUnlocked ? `<div class="result-unlock unit">${icon("star")}<div><b>New unit unlocked!</b><span>A new world is waiting on the path.</span></div></div>` : ""}
      <div class="result-actions">
        <button class="big-btn ghost r-path" type="button">Back to path</button>
        ${won ? (next ? `<button class="big-btn r-next" type="button">${icon("play")} Next mission</button>` : "") : `<button class="big-btn r-retry" type="button">${icon("play")} Try again</button>`}
      </div>`;
    sheet.querySelector(".r-path").onclick = onExit;
    sheet.querySelector(".r-next")?.addEventListener("click", () => onNext(next));
    sheet.querySelector(".r-retry")?.addEventListener("click", () => onNext(mission));
  }

  /* ---------- wiring ---------- */
  root.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-hand]");
    if (chip) return selectHand(+chip.dataset.hand);
    const cell = e.target.closest(".m-cell");
    if (cell) return clickCell(+cell.dataset.lane, +cell.dataset.col);
  });
  $(".m-back").onclick = onExit;
  $(".m-beam").onclick = () => {
    if (battle.fireBeam()) {
      handleEvents();
      renderTop();
    }
  };
  $(".m-action").onclick = () => {
    if (state.status !== "build") return;
    if (picksLeft > 0) openShop();
    else startWave();
  };

  coach(`${unit.title} · ${mission.title}`);
  startBuild();
  raf = requestAnimationFrame(frame);

  return {
    battle,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      globalThis.speechSynthesis?.cancel();
    },
  };
}
