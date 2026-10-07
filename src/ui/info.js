/** Shared tower and alien explanations, so children understand what each one does. */
import { ALIENS, TOWERS, TOWER_ORDER } from "../core/content.js";
import { alienArt, towerArt } from "./art.js";

const PIP_LABELS = { power: "Power", speed: "Speed", range: "Reach" };

export function pipsHTML(type) {
  const pips = TOWERS[type].pips;
  return `<div class="pips-table">${Object.entries(PIP_LABELS)
    .map(([key, label]) => `<span class="pip-row"><small>${label}</small><span class="pip-dots">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= pips[key] ? "on" : ""}"></i>`).join("")}</span></span>`)
    .join("")}</div>`;
}

export function goodVsHTML(type, small = false) {
  return `<span class="good-vs ${small ? "small" : ""}"><small>Good vs</small>${TOWERS[type].goodVs
    .map((a) => `<i title="${ALIENS[a].name}">${alienArt(a)}</i>`)
    .join("")}</span>`;
}

/** Towers that list this alien as something they are good against. */
export const beatenBy = (alien) => TOWER_ORDER.filter((t) => TOWERS[t].goodVs.includes(alien));

export function towerInfoHTML(type, level = 1) {
  const t = TOWERS[type];
  return `<div class="info-card">
    <span class="info-art">${towerArt(type, level)}</span>
    <div class="info-body">
      <b>${t.name}${level > 1 ? ` <small>level ${level}</small>` : ""}</b>
      <span class="info-role">${t.role}</span>
      <p>${t.tip}</p>
      ${pipsHTML(type)}
      ${goodVsHTML(type)}
    </div>
  </div>`;
}

export function alienInfoHTML(type) {
  const a = ALIENS[type];
  return `<div class="info-card alien-info">
    <span class="info-art">${alienArt(type)}</span>
    <div class="info-body">
      <b>${a.name}</b>
      <p>${a.does}</p>
      <p class="info-tip">${a.tip}</p>
      <span class="good-vs"><small>Beat it with</small>${beatenBy(type).map((t) => `<i title="${TOWERS[t].name}">${towerArt(t, 1)}</i>`).join("")}</span>
    </div>
  </div>`;
}
