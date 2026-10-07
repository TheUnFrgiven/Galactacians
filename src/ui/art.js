/* Original SVG art for towers, aliens and Earth (carried over from the v2 prototype). */
import { TOWERS } from "../core/content.js";

function shapeArt(tower) {
  const color = tower.color || "#77bdda";
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

const ALIEN_EXTRAS = {
  hopper: '<g fill="none" stroke="#a87c1c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 58l-6 5 7 4-7 4 7 4"/><path d="M60 58l6 5-7 4 7 4-7 4"/></g>',
  tank: '<path d="M21 31Q45 -6 69 31" fill="none" stroke="#6f8199" stroke-width="8" stroke-linecap="round"/><path d="M30 22Q45 6 60 22" fill="none" stroke="#c9d6e6" stroke-width="3" stroke-linecap="round"/>',
  boss: '<path d="M30 13 36 2l9 8 9-8 6 11Z" fill="#f6c84c" stroke="#a87b1b" stroke-width="2.5" stroke-linejoin="round"/>',
};

export function alienArt(type) {
  const colors = {
    scout: "#b9a0e5",
    skater: "#ffbb88",
    swarm: "#a3d986",
    tank: "#96c6da",
    boss: "#ed9bc5",
    hopper: "#f4c96b",
  };
  const body =
    type === "skater"
      ? '<path d="m11 44 19-15h30l21 15-20 13H30Z"/>'
      : '<ellipse cx="45" cy="45" rx="35" ry="15"/>';
  const eyes =
    type === "boss"
      ? '<circle cx="34" cy="31" r="6"/><circle cx="46" cy="26" r="6"/><circle cx="58" cy="31" r="6"/>'
      : '<ellipse cx="35" cy="31" rx="7" ry="8"/><ellipse cx="55" cy="31" rx="7" ry="8"/>';
  return `<svg viewBox="0 0 90 90" aria-hidden="true"><g class="gb-ufo-glow" fill="#abf3ed"><ellipse cx="47" cy="65" rx="19" ry="9" opacity=".25"/><ellipse cx="47" cy="65" rx="11" ry="4" opacity=".65"/></g><g class="gb-alien-feelers" fill="none" stroke="${colors[type]}" stroke-width="4" stroke-linecap="round"><path d="M30 55q-9 12 0 16m15-13q9 9 0 17m15-20q10 11 4 17"/></g><g fill="${colors[type]}" stroke="#454369" stroke-width="2.8" stroke-linejoin="round">${body}<path d="M24 38V29q0-17 21-17t21 17v9q-21 14-42 0Z"/></g><path d="M29 18 22 8m39 10 7-10" fill="none" stroke="#d5caef" stroke-width="2.5" stroke-linecap="round"/><circle class="gb-antenna-light" cx="21" cy="7" r="4" fill="#f9df8f"/><circle class="gb-antenna-light" cx="69" cy="7" r="4" fill="#f9df8f"/><g fill="#fff9e9">${eyes}</g><g fill="#38375f"><circle cx="33" cy="31" r="3"/><circle cx="53" cy="31" r="3"/>${type === "boss" ? '<circle cx="44" cy="26" r="3"/>' : ""}</g><path d="M40 42q5 4 10 0" fill="none" stroke="#454369" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="27" cy="40" rx="4" ry="2" fill="#f2a7c2"/><ellipse cx="64" cy="40" rx="4" ry="2" fill="#f2a7c2"/><path d="M17 49q28 16 56 0" fill="none" stroke="#454369" stroke-width="2.5"/><g class="gb-ufo-lights" fill="#fbefab"><circle cx="23" cy="51" r="2.8"/><circle cx="45" cy="56" r="2.8"/><circle cx="67" cy="51" r="2.8"/></g>${type === "tank" || type === "boss" ? '<path d="m16 43 7-6m51 6-7-6" stroke="#edfaff" stroke-width="5" stroke-linecap="round"/>' : ""}${ALIEN_EXTRAS[type] || ""}</svg>`;
}

const earthTemplate = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="gb-earth-clip"><circle cx="60" cy="60" r="43"/></clipPath></defs><circle class="gb-atmosphere" cx="60" cy="60" r="51" fill="#b8e8d7" opacity=".35"/><circle cx="60" cy="60" r="43" fill="#73c5e9"/><g clip-path="url(#gb-earth-clip)"><g class="gb-earth-land" fill="#8ac86c"><path d="M18 24 40 17l11 12-3 13-16 2-5 17-15-8ZM67 14l32 12 6 21-18 8-5 17-16-6-8-20 15-6ZM44 64l15 7 1 15-14 18-8-13-4-15Z"/><path d="m95 89 17-13 10 9-3 18-24 5Z"/></g></g><circle cx="60" cy="60" r="43" fill="none" stroke="#365d57" stroke-width="3"/><path d="M30 37q6-10 16-13" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" opacity=".65"/><g class="gb-face-happy"><g class="gb-earth-eyes" fill="#2c514e"><ellipse cx="48" cy="60" rx="4" ry="5"/><ellipse cx="74" cy="60" rx="4" ry="5"/></g><path d="M53 72q8 8 16 0" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/></g><g class="gb-face-worried"><path d="m42 49 10-4m17 0 10 4" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/><ellipse cx="49" cy="60" rx="4" ry="6" fill="#2c514e"/><ellipse cx="75" cy="60" rx="4" ry="6" fill="#2c514e"/><path d="M53 76q8-10 16 0" fill="none" stroke="#2c514e" stroke-width="3" stroke-linecap="round"/><path class="gb-sweat-drop" d="M89 41q-9 11 0 12 9-1 0-12Z" fill="#d7faff" stroke="#74bac9" stroke-width="1"/></g><ellipse cx="37" cy="69" rx="6" ry="3" fill="#eda8a1"/><ellipse cx="84" cy="69" rx="6" ry="3" fill="#eda8a1"/></svg>`;

export const spaceScenery = `<div class="gb-space-scenery" aria-hidden="true"><div class="gb-nebula gb-nebula-one"></div><div class="gb-nebula gb-nebula-two"></div><div class="gb-distant-planet"><i></i></div>${Array.from({ length: 32 }, (_, i) => `<span class="gb-space-star ${i % 5 === 0 ? "gb-star-spark" : ""}" style="left:${(i * 43 + 7) % 100}%;top:${(i * 29 + 11) % 100}%;--star-delay:-${i % 7}s;--star-size:${i % 5 === 0 ? 11 : 2 + (i % 3)}px">${i % 5 === 0 ? "✦" : ""}</span>`).join("")}<span class="gb-space-pebble gb-pebble-one"></span><span class="gb-space-pebble gb-pebble-two"></span></div>`;

let earthCount = 0;
/** Earth with a unique clip id, so several Earths can share a page. */
export function earthArt() {
  earthCount += 1;
  return earthTemplate.replaceAll("gb-earth-clip", `gb-earth-clip-${earthCount}`);
}

const BADGE = {
  2: '<g class="lvl-badge"><circle cx="64" cy="16" r="11" fill="#fff7d6" stroke="#c99a2e" stroke-width="2.5"/><path d="m64 8 2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.8-4.9 2.8 1.1-5.3-4-3.7 5.4-.6Z" fill="#f2b632"/></g>',
  3: '<g class="lvl-badge"><path d="M24 14 30 4l10 8 10-8 6 10-4 8H28Z" fill="#f6c84c" stroke="#a87b1b" stroke-width="2.5" stroke-linejoin="round"/><circle cx="30" cy="4" r="2.6" fill="#fff4c4"/><circle cx="50" cy="4" r="2.6" fill="#fff4c4"/><circle cx="40" cy="11" r="2.6" fill="#e9776d"/></g>',
};

/** A tower drawn by type and level: level 2 gets a star, level 3 a crown. */
export function towerArt(type, level = 1) {
  const svg = shapeArt(TOWERS[type]);
  const badge = BADGE[level] || "";
  return badge ? svg.replace("</svg>", `${badge}</svg>`) : svg;
}

/* ---------- Math pictures: dots, ten frames, groups ---------- */

const dot = (cx, cy, cls) => `<circle cx="${cx}" cy="${cy}" r="9" class="dot ${cls}"/>`;
const cross = (cx, cy) => `<path d="M${cx - 8} ${cy - 8}l16 16m0-16-16 16" class="dot-cross"/>`;

function tenFrame(filled, x0, y0, cls = "a", empty = "") {
  let out = `<rect x="${x0}" y="${y0}" width="${5 * 26 + 4}" height="${2 * 26 + 4}" rx="8" class="frame"/>`;
  for (let i = 0; i < 10; i++) {
    const cx = x0 + 15 + (i % 5) * 26;
    const cy = y0 + 15 + Math.floor(i / 5) * 26;
    out += i < filled ? dot(cx, cy, cls) : `<circle cx="${cx}" cy="${cy}" r="9" class="dot-empty ${empty}"/>`;
  }
  return out;
}

/**
 * A picture for a question or teach card.
 * add: two coloured groups; sub: a group with some crossed out;
 * bond: a ten frame; mul: equal groups in rows.
 */
export function mathPicture(visual) {
  if (!visual) return "";
  const { kind, a, b } = visual;
  let body = "";
  let w = 300;
  let h = 70;
  if (kind === "add") {
    const total = a + b;
    w = Math.max(160, total * 26 + (b ? 20 : 0) + 10);
    for (let i = 0; i < a; i++) body += dot(18 + i * 26, 35, "a");
    for (let j = 0; j < b; j++) body += dot(18 + a * 26 + 16 + j * 26, 35, "b");
  } else if (kind === "sub") {
    w = Math.max(160, a * 26 + 10);
    for (let i = 0; i < a; i++) {
      const cx = 18 + i * 26;
      body += dot(cx, 35, i >= a - b ? "gone" : "a");
      if (i >= a - b) body += cross(cx, 35);
    }
  } else if (kind === "bond") {
    w = 150;
    h = 64;
    body = tenFrame(a, 6, 4, "a", visual.answer ? "fill-b" : "");
  } else if (kind === "signs") {
    w = 360;
    h = 84;
    const items = [["+", "add", "#66b84f"], ["−", "take away", "#75bad5"], ["×", "groups", "#8e7cd6"], ["÷", "share", "#e98f8f"]];
    body = items
      .map(([sign, word, color], i) => `<g transform="translate(${6 + i * 88} 4)"><rect width="80" height="76" rx="14" fill="#fff" stroke="${color}" stroke-width="3"/><text x="40" y="44" text-anchor="middle" font-size="38" font-weight="900" fill="${color}">${sign}</text><text x="40" y="66" text-anchor="middle" font-size="13" font-weight="800" fill="#5a6280">${word}</text></g>`)
      .join("");
  } else if (kind === "mul" || kind === "div") {
    const groups = kind === "div" ? b : a, each = kind === "div" ? a / b : b;
    const perRow = Math.min(each, 5);
    const rowsPer = Math.ceil(each / perRow);
    const gw = perRow * 22 + 12;
    const cols = Math.min(groups, 5);
    const gh = rowsPer * 22 + 12;
    w = cols * (gw + 8) + 4;
    h = Math.ceil(groups / cols) * (gh + 8) + 4;
    for (let g = 0; g < groups; g++) {
      const gx = 4 + (g % cols) * (gw + 8);
      const gy = 4 + Math.floor(g / cols) * (gh + 8);
      body += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="8" class="frame"/>`;
      for (let i = 0; i < each; i++) {
        body += `<circle cx="${gx + 17 + (i % perRow) * 22}" cy="${gy + 17 + Math.floor(i / perRow) * 22}" r="8" class="dot ${g % 2 ? "b" : "a"}"/>`;
      }
    }
  }
  return `<svg class="math-picture" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">${body}</svg>`;
}

const ICONS = {
  back: '<path d="m13 5-7 7 7 7M6 12h15"/>',
  heart: '<path d="M12 21 3.6 12.7C-2 6.8 6.3.4 12 6.2 17.7.4 26 6.8 20.4 12.7Z"/>',
  star: '<path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.2-6.3-3.7-6.3 3.7 1.5-7.2L1.8 9.4 9 8.6Z"/>',
  bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
  flame: '<path d="M13 2c1 5-4 6-3 10 2 0 4-2 4-4 5 4 6 8 3 12-3 3-8 2-10-1-4-6 2-10 6-17Z"/>',
  play: '<path d="m8 5 12 7-12 7z"/>',
  sound: '<path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10"/>',
  speak: '<path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
  bulb: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10Z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  book: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v16"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  erase: '<path d="M21 6H8l-5 6 5 6h13ZM12 9l6 6m0-6-6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.star}</svg>`;
