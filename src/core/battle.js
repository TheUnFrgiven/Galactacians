/**
 * Deterministic tower-defense simulation. No DOM and no randomness:
 * the same mission and the same actions always give the same result.
 * The renderer reads `state` and drains `events` each frame.
 */
import { ALIENS, BALANCE, COLS, MAX_LEVEL, towerStats } from "./content.js";

const TICK = 0.05;
export const BEAM_COST = 3;

export function createBattle(mission) {
  const state = {
    mission,
    lanes: mission.lanes,
    cols: COLS,
    hearts: 5,
    wave: 0, // waves started so far
    totalWaves: mission.waves.length,
    status: "build", // build | wave | won | lost
    time: 0,
    schedule: [],
    spawnIndex: 0,
    aliens: [],
    towers: [],
    shots: [],
    hand: [],
    beam: 0,
    nextId: 1,
    kills: 0,
    leaks: 0,
  };
  let events = [];
  let carry = 0;
  const emit = (kind, data = {}) => events.push({ kind, ...data });

  const towerAt = (lane, col) => state.towers.find((t) => t.lane === lane && t.col === col);
  const statsOf = (tower) => towerStats(tower.type, tower.level);

  function addToHand(item) {
    state.hand.push({ id: state.nextId++, type: item.type, level: item.level || 1 });
    emit("hand", { type: item.type });
  }

  /** "place", "merge" or null. */
  function canPlace(handIndex, lane, col) {
    const item = state.hand[handIndex];
    if (!item || state.status === "won" || state.status === "lost") return null;
    if (lane < 0 || lane >= state.lanes || col < 0 || col >= COLS) return null;
    const here = towerAt(lane, col);
    if (!here) return "place";
    if (here.type === item.type && here.level === item.level && here.level < MAX_LEVEL) return "merge";
    return null;
  }

  function place(handIndex, lane, col) {
    const action = canPlace(handIndex, lane, col);
    if (!action) return null;
    const [item] = state.hand.splice(handIndex, 1);
    if (action === "merge") {
      const tower = towerAt(lane, col);
      tower.level += 1;
      tower.hp = statsOf(tower).hp;
      tower.flash = 0.6;
      emit("merge", { lane, col, type: tower.type, level: tower.level });
    } else {
      const tower = { id: state.nextId++, type: item.type, level: item.level, lane, col, cooldown: 0.3, flash: 0.4 };
      tower.hp = statsOf(tower).hp;
      state.towers.push(tower);
      emit("place", { lane, col, type: tower.type, level: tower.level });
    }
    return action;
  }

  function startWave() {
    if (state.status !== "build" || state.wave >= state.totalWaves) return false;
    state.schedule = state.mission.waves[state.wave];
    state.wave += 1;
    state.spawnIndex = 0;
    state.time = 0;
    state.status = "wave";
    emit("waveStart", { wave: state.wave });
    return true;
  }

  /** Lanes and alien types of the next wave, for the "incoming" signs. */
  function nextWavePreview() {
    const spawns = state.mission.waves[state.wave] || [];
    const lanes = {};
    for (const s of spawns) (lanes[s.lane] ||= new Set()).add(s.type);
    return Object.entries(lanes).map(([lane, types]) => ({ lane: Number(lane), types: [...types] }));
  }

  function spawn({ lane, type }) {
    const base = ALIENS[type];
    const hp = Math.round(base.hp * state.mission.hpScale * BALANCE.alienHp);
    state.aliens.push({ id: state.nextId++, type, lane, x: COLS + 0.4, hp, maxHp: hp, slow: 0, flash: 0, blocked: false, jumped: false });
    emit("spawn", { type, lane });
  }

  function hurt(alien, amount, pierce = false) {
    if (alien.hp <= 0) return;
    const armor = pierce ? 0 : ALIENS[alien.type].armor;
    alien.hp -= amount * (1 - armor);
    alien.flash = 0.15;
    if (alien.hp <= 0) {
      state.kills += 1;
      emit("pop", { x: alien.x, lane: alien.lane, type: alien.type });
    }
  }

  function fireBeam() {
    if (state.status !== "wave" || state.beam < BEAM_COST) return false;
    const alive = state.aliens.filter((a) => a.hp > 0);
    if (!alive.length) return false;
    const lane = alive.sort((a, b) => a.x - b.x)[0].lane;
    state.beam -= BEAM_COST;
    for (const alien of state.aliens) if (alien.lane === lane) hurt(alien, 160, true);
    emit("beam", { lane });
    return true;
  }

  function chargeBeam() {
    state.beam = Math.min(BEAM_COST, state.beam + 1);
  }

  function towersAct(dt) {
    for (const tower of state.towers) {
      const s = statsOf(tower);
      tower.flash = Math.max(0, (tower.flash || 0) - dt);
      tower.cooldown -= dt;
      if (tower.type === "bricky" || tower.cooldown > 0) continue;
      const cx = tower.col + 0.5;
      const reach = (a, laneSpread) =>
        a.hp > 0 && Math.abs(a.lane - tower.lane) <= laneSpread && a.x <= cx + s.range && a.x >= cx - (tower.type === "frost" ? s.range : 0.2);
      if (tower.type === "magnet") {
        const target = state.aliens.filter((a) => reach(a, 0)).sort((a, b) => a.x - b.x)[0];
        if (!target) continue;
        tower.cooldown = s.rate;
        tower.flash = 0.3;
        const push = (target.type === "boss" ? 0.6 : 1.3) + (tower.level - 1) * 0.35;
        target.x = Math.min(COLS + 0.4, target.x + push);
        hurt(target, s.damage);
        emit("magnet", { lane: tower.lane, col: tower.col, x: target.x });
        continue;
      }
      if (tower.type === "frost") {
        const hits = state.aliens.filter((a) => reach(a, 1));
        if (!hits.length) continue;
        tower.cooldown = s.rate;
        for (const a of hits) {
          hurt(a, s.damage);
          a.slow = 2.5;
          a.slowFactor = tower.level >= 3 ? 0.35 : 0.5;
        }
        emit("frost", { lane: tower.lane, col: tower.col });
        continue;
      }
      const spread = tower.type === "poppy" ? 1 : 0;
      const target = state.aliens.filter((a) => reach(a, spread)).sort((a, b) => a.x - b.x)[0];
      if (!target) continue;
      tower.cooldown = s.rate;
      tower.flash = 0.15;
      state.shots.push({
        id: state.nextId++,
        type: tower.type,
        lane: target.lane,
        x: cx + 0.2,
        damage: s.damage,
        pierce: tower.type === "prism",
        splash: tower.type === "poppy",
        double: tower.type === "pebble" && tower.level >= 3,
      });
      emit("shot", { type: tower.type, lane: tower.lane, col: tower.col });
    }
  }

  function shotsMove(dt) {
    for (const shot of state.shots) {
      const prev = shot.x;
      shot.x += dt * (shot.pierce ? 12 : 7);
      const hit = state.aliens
        .filter((a) => a.hp > 0 && a.lane === shot.lane && a.x >= prev - 0.3 && a.x <= shot.x + 0.3)
        .sort((a, b) => a.x - b.x)[0];
      if (!hit) continue;
      hurt(hit, shot.damage * (shot.double ? 1.5 : 1), shot.pierce);
      if (shot.splash) {
        for (const other of state.aliens) {
          if (other !== hit && other.hp > 0 && Math.abs(other.x - hit.x) <= 0.9 && Math.abs(other.lane - hit.lane) <= 1) {
            hurt(other, shot.damage * 0.7);
          }
        }
        emit("splash", { x: hit.x, lane: hit.lane });
      }
      shot.done = true;
    }
    state.shots = state.shots.filter((s) => !s.done && s.x < COLS + 1);
  }

  function aliensMove(dt) {
    for (const alien of state.aliens) {
      if (alien.hp <= 0) continue;
      const base = ALIENS[alien.type];
      alien.flash = Math.max(0, alien.flash - dt);
      alien.slow = Math.max(0, alien.slow - dt);
      const speed = base.speed * (alien.slow > 0 ? alien.slowFactor || 0.5 : 1);
      const nextX = alien.x - speed * dt;
      const wall = state.towers
        .filter((t) => t.hp > 0 && t.lane === alien.lane && alien.x >= t.col + 0.3 && nextX <= t.col + 1.02)
        .sort((a, b) => b.col - a.col)[0];
      if (wall && alien.type === "hopper" && !alien.jumped) {
        alien.jumped = true;
        alien.x = wall.col - 0.05;
        emit("hop", { lane: alien.lane, x: alien.x });
        continue;
      }
      alien.blocked = Boolean(wall);
      if (wall) {
        wall.hp -= base.attack * dt;
        if (wall.type === "bricky") {
          const s = statsOf(wall);
          hurt(alien, s.damage * dt);
          hurt(alien, base.attack * 0.4 * dt, true);
        }
        if (wall.hp <= 0) emit("towerLost", { lane: wall.lane, col: wall.col, type: wall.type });
      } else {
        alien.x = nextX;
      }
      if (alien.x < -0.1) {
        alien.hp = 0;
        state.hearts = Math.max(0, state.hearts - 1);
        state.leaks += 1;
        emit("leak", { lane: alien.lane, type: alien.type });
      }
    }
    state.towers = state.towers.filter((t) => t.hp > 0);
    state.aliens = state.aliens.filter((a) => a.hp > 0);
  }

  function tick(dt) {
    if (state.status !== "wave") return;
    state.time += dt;
    while (state.spawnIndex < state.schedule.length && state.schedule[state.spawnIndex].at <= state.time) {
      spawn(state.schedule[state.spawnIndex++]);
    }
    towersAct(dt);
    shotsMove(dt);
    aliensMove(dt);
    if (state.hearts <= 0) {
      state.status = "lost";
      state.shots = [];
      emit("lost");
      return;
    }
    if (state.spawnIndex >= state.schedule.length && state.aliens.length === 0) {
      state.shots = [];
      if (state.wave >= state.totalWaves) {
        state.status = "won";
        emit("won", { stars: stars() });
      } else {
        state.status = "build";
        emit("waveClear", { wave: state.wave });
      }
    }
  }

  /** Advance by real seconds; internally always in fixed ticks. */
  function step(seconds) {
    carry += Math.min(seconds, 0.5);
    while (carry >= TICK) {
      carry -= TICK;
      tick(TICK);
    }
  }

  function stars() {
    if (state.status === "lost") return 0;
    return state.hearts >= 5 ? 3 : state.hearts >= 3 ? 2 : 1;
  }

  /** Aliens still to beat in this wave (waiting to spawn plus alive). */
  const remaining = () => (state.status === "wave" ? state.schedule.length - state.spawnIndex + state.aliens.length : 0);
  const waveSize = () => state.schedule.length;
  const boss = () => state.aliens.find((a) => a.type === "boss" && a.hp > 0) || null;

  /** Earth looks worried when an alien is in the first two columns. */
  const danger = () => state.aliens.some((a) => a.x < 2);

  return {
    state,
    addToHand,
    canPlace,
    place,
    startWave,
    step,
    fireBeam,
    chargeBeam,
    nextWavePreview,
    stars,
    danger,
    remaining,
    waveSize,
    boss,
    drainEvents: () => {
      const out = events;
      events = [];
      return out;
    },
  };
}
