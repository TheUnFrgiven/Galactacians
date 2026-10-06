const paths = {
  planet:
    '<circle cx="12" cy="12" r="6"/><path d="M7 7c-5 1-6 4-4 6 3 3 13 3 17-1 2-2 0-4-3-4"/>',
  adventure:
    '<path d="m4 5 5-2 6 2 5-2v16l-5 2-6-2-5 2Z"/><path d="M9 3v16m6-14v16"/>',
  towers:
    '<path d="M3 21h18M5 21V10h5v11m4 0V3h5v18M4 10l3.5-5L11 10M13 3h7"/>',
  practice:
    '<path d="m12 3 2.5 5.5 6 .7-4.5 4 1.3 6-5.3-3-5.3 3 1.3-6-4.5-4 6-.7Z"/>',
  progress: '<path d="M4 4v16h16M8 15l4-5 4 2 5-7"/>',
  friends:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
  shop: '<path d="M4 9h16l-1 12H5ZM8 9V6a4 4 0 0 1 8 0v3"/>',
  settings:
    '<path d="m10 2-1 3-3 1-3 1 1 4-1 3 3 2 1 4h4l3 1 2-3 4-1v-4l1-3-3-2-1-4h-4Z"/><circle cx="12" cy="12" r="3"/>',
  flame:
    '<path d="M13 2c1 5-4 6-3 10 2 0 4-2 4-4 5 4 6 8 3 12-3 3-8 2-10-1-4-6 2-10 6-17Z"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  star: '<path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.5-6.2 3.5 1.4-7L2 9.3l7-.8Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9 21h6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  trophy:
    '<path d="M8 3h8v6a4 4 0 0 1-8 0Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v5m-5 3h10m-8-3h6v3"/>',
  heart:
    '<path d="M12 21 3.5 12.5A5.6 5.6 0 0 1 12 5a5.6 5.6 0 0 1 8.5 7.5Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',
  sound:
    '<path d="M3 9h4l5-5v16l-5-5H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
  leaf: '<path d="M20 3C8 2 2 7 5 15c8 4 15-1 15-12ZM4 21 16 8"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5m0 3v1"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
export function shapeSVG(shape, color = "#78bf70", extra = "") {
  const s = {
    circle: '<circle cx="40" cy="38" r="25"/>',
    triangle:
      '<path d="M40 10Q42 9 44 13L68 57Q70 62 64 62H16Q10 62 13 56l24-43Q38 10 40 10Z"/>',
    square: '<rect x="16" y="14" width="49" height="49" rx="10"/>',
    diamond:
      '<path d="m40 8 29 29q2 3 0 6L43 69q-3 2-6 0L11 43q-2-3 0-6L37 11q2-3 3-3Z"/>',
    pentagon: '<path d="m40 9 29 22-11 34H22L11 31Z"/>',
    hexagon: '<path d="M25 12h30l16 26-16 27H25L9 38Z"/>',
    star: '<path d="m40 7 10 20 23 3-17 16 4 23-20-11-20 11 4-23L7 30l23-3Z"/>',
    ring: '<circle cx="40" cy="38" r="25"/><circle cx="40" cy="38" r="13" fill="#fcfff5" stroke-width="3"/>',
  }[shape];
  return `<svg class="tower-avatar ${extra}" viewBox="0 0 80 82" aria-hidden="true"><ellipse cx="40" cy="74" rx="23" ry="5" fill="#263b2f" opacity=".09"/><g fill="${color}" stroke="#34483b" stroke-width="2.7" stroke-linejoin="round">${s}</g>${shape === "ring" ? "" : `<ellipse cx="31" cy="39" rx="2.8" ry="3.6" fill="#304139"/><ellipse cx="49" cy="39" rx="2.8" ry="3.6" fill="#304139"/><path d="M36 47q4 4 8 0" stroke="#304139" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="45" rx="4.5" ry="2.4" fill="#fff" opacity=".35"/><ellipse cx="56" cy="45" rx="4.5" ry="2.4" fill="#fff" opacity=".35"/>`}</svg>`;
}
let earthId = 0;
export function earthSVG(cls = "") {
  const id = `earth-clip-${++earthId}`;
  return `<svg class="earth-art ${cls}" viewBox="0 0 240 240" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="120" cy="116" r="77"/></clipPath></defs><ellipse cx="122" cy="208" rx="64" ry="10" fill="#304538" opacity=".1"/><circle cx="120" cy="116" r="91" fill="none" stroke="#9ecbad" stroke-width="1.6" stroke-dasharray="3 9"/><g class="earth-body"><circle cx="120" cy="116" r="78" fill="#86c7d9" stroke="#304b42" stroke-width="3"/><g clip-path="url(#${id})"><g class="earth-land" fill="#8dca80" stroke="#619e69" stroke-width="1.5"><path d="m61 48 41-3 11 17-15 13 4 18-20 7-3 21-19-7-25-35Zm67 57 27-14 26 7 16 20-13 22-24-2-8 24-17 8-16-19 7-20-12-8Zm-38 41 11 7 2 27-10 25-18-12 4-20-8-14Z"/><path d="m189 44 35 25-9 21-24-8-8-19Z"/></g><path d="M63 66a77 77 0 0 1 96-16" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".2" fill="none"/></g><ellipse cx="102" cy="113" rx="5" ry="7" fill="#2a4840"/><ellipse cx="137" cy="113" rx="5" ry="7" fill="#2a4840"/><path d="M110 132q10 11 20 0" fill="none" stroke="#2a4840" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="91" cy="125" rx="8" ry="4" fill="#e8aba5" opacity=".8"/><ellipse cx="149" cy="125" rx="8" ry="4" fill="#e8aba5" opacity=".8"/></g><g class="earth-satellite"><circle cx="120" cy="24" r="7" fill="#e6b96e" stroke="#405346" stroke-width="2"/><path d="M117 21h6" stroke="#fff" stroke-width="2"/></g></svg>`;
}
export function alienSVG(color = "#bba0df", cls = "") {
  return `<svg class="alien-art ${cls}" viewBox="0 0 140 115" aria-hidden="true"><ellipse cx="72" cy="103" rx="35" ry="5" fill="#344837" opacity=".08"/><path d="M39 61V40a31 31 0 0 1 62 0v21Z" fill="${color}" stroke="#4a465a" stroke-width="2.7"/><path d="M49 21 42 9m49 12 7-12" stroke="#4a465a" stroke-width="2.7" stroke-linecap="round"/><circle cx="42" cy="9" r="4" fill="${color}" stroke="#4a465a" stroke-width="2"/><circle cx="98" cy="9" r="4" fill="${color}" stroke="#4a465a" stroke-width="2"/><ellipse cx="57" cy="42" rx="4" ry="6" fill="#413b4e"/><ellipse cx="82" cy="42" rx="4" ry="6" fill="#413b4e"/><path d="M64 54q7 6 13 0" fill="none" stroke="#413b4e" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="70" cy="69" rx="55" ry="16" fill="#d0c8e7" stroke="#4a465a" stroke-width="2.7"/><path d="M27 78q43 33 87 0" fill="#9283b7" stroke="#4a465a" stroke-width="2.7"/><g fill="#f6e6a9" stroke="#4a465a" stroke-width="1.5"><circle cx="37" cy="71" r="4"/><circle cx="70" cy="76" r="4"/><circle cx="103" cy="71" r="4"/></g></svg>`;
}
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
