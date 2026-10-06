// Authored, repeatable encounters. Times are seconds after a wave begins;
// rows are zero based. Telegraphs must be derived from these same spawns.
const visitor = (at, row, type = "scout") => ({ at, row, type });
const parade = (rows, amount, start = 1, gap = 2.8, type = "scout") =>
  Array.from({ length: amount }, (_, i) =>
    visitor(start + i * gap, rows[i % rows.length], type),
  );
const cluster = (rows, amount, start, gap = 0.22) =>
  Array.from({ length: amount }, (_, i) =>
    rows.map((row, j) => visitor(start + i * gap + j * 0.06, row, "swarm")),
  ).flat();
const wave = (label, tip, suggestedTowers, spawns) => ({
  label,
  tip,
  suggestedTowers,
  spawns,
});

const ENCOUNTERS = [
  // First contact: two safe lanes, then one new threat at a time.
  [
    wave("Hello, visitors!", "Cover the two glowing lanes.", ["pebble"],
      parade([1, 3], 6)),
    wave("Shields & bubbles", "Beams break shields. Bubbles pop groups.", ["prism", "poppy"], [
      visitor(1, 2, "tank"), visitor(2, 1), visitor(4, 3),
      ...cluster([1, 2, 3], 3, 8, 0.38),
    ]),
    wave("The welcome party", "Block a lane or slow the whole group.", ["bricky", "frost"], [
      visitor(1, 2, "tank"),
      ...parade([1, 3], 4, 3, 2.8, "skater"),
      ...cluster([1, 2, 3], 4, 7, 0.38), visitor(16, 2, "boss"),
    ]),
  ],
  // Moon mail: express traffic on the outside, then a central delivery.
  [
    wave("Express delivery", "Speedy ships take the outside lanes.", ["pebble", "frost"],
      parade([0, 4], 8, 1, 2.6, "skater")),
    wave("Fragile parcels", "A slower parcel is following the couriers.", ["bricky", "prism"], [
      ...parade([0, 4], 8, 1, 2.2, "skater"), visitor(5, 2, "tank"),
      ...cluster([2], 4, 15),
    ]),
    wave("Special delivery", "Watch the center and the two edges.", ["pebble", "bricky"], [
      ...parade([0, 4], 10, 1, 2, "skater"), visitor(4, 2, "tank"),
      visitor(17, 2, "boss"), ...cluster([2], 4, 22),
    ]),
  ],
  // Ring road: neighboring lanes reward overlapping fields and repositioning.
  [
    wave("Round the bend", "Neighbors can share a bubble blaster.", ["poppy", "pebble"], [
      ...parade([0, 1], 8, 1, 2.4), ...cluster([0, 1], 2, 14),
    ]),
    wave("Changing orbits", "The traffic is moving down a lane.", ["poppy", "frost"], [
      ...parade([1, 2], 6, 1, 2.5, "skater"),
      ...cluster([1, 2], 5, 9), visitor(19, 2, "tank"),
    ]),
    wave("The long way home", "Defenders can move to a new orbit.", ["bricky", "prism"], [
      ...parade([2, 3], 6, 1, 2.5), ...cluster([2, 3], 6, 10),
      visitor(4, 3, "tank"), visitor(20, 2, "boss"),
    ]),
  ],
  // Sharing space: synchronized groups are the area-control encounter.
  [
    wave("Travel buddies", "These visitors like to stay together.", ["poppy"], [
      ...parade([1, 3], 6, 1, 2.6), ...cluster([1, 2, 3], 2, 15),
    ]),
    wave("Bubble parade", "One blast can catch neighboring lanes.", ["poppy", "frost"], [
      ...cluster([1, 2, 3], 8, 2, 0.08), visitor(15, 2, "tank"),
    ]),
    wave("Everyone together", "Slow the crowd or hold it in place.", ["frost", "bricky"], [
      ...cluster([1, 2, 3], 10, 2, 0.08), visitor(16, 2, "boss"),
      ...parade([0, 4], 4, 12, 3.5),
    ]),
  ],
  // Cosmic mix: protected convoys need both single-target and area damage.
  [
    wave("Garden guests", "Two lanes, two kinds of visitor.", ["pebble", "prism"], [
      ...parade([1, 3], 8, 1, 2.6), visitor(16, 2, "tank"),
    ]),
    wave("Follow the captain", "Little ships hide behind big shields.", ["poppy", "bricky"], [
      visitor(1, 1, "tank"), visitor(4, 3, "tank"),
      ...cluster([1, 2, 3], 5, 7, 0.16),
      ...parade([0, 4], 4, 17, 2.6, "skater"),
    ]),
    wave("Garden party", "Prepare for the next glowing lane.", ["frost", "prism"], [
      visitor(1, 2, "boss"), ...cluster([1, 2, 3], 7, 7, 0.12),
      ...parade([0, 4], 6, 12, 2.4, "skater"), visitor(19, 3, "tank"),
    ]),
  ],
  // Homecoming: relay from the edges to the center, ending in a convoy.
  [
    wave("Welcome home", "First the edges, then the middle.", ["pebble", "poppy"], [
      ...parade([0, 4], 6, 1, 2.6), ...cluster([1, 2, 3], 3, 18),
    ]),
    wave("One last detour", "Group damage protects the middle lanes.", ["poppy", "frost"], [
      ...cluster([1, 2, 3], 8, 2, 0.1), visitor(14, 2, "tank"),
      ...parade([0, 4], 4, 18, 2.8, "skater"),
    ]),
    wave("Home, sweet Earth", "Keep a blocker ready for the captain.", ["bricky", "prism"], [
      visitor(1, 2, "boss"), ...cluster([1, 2, 3], 10, 5, 0.08),
      ...parade([0, 4], 6, 12, 2.8, "skater"), visitor(22, 2, "tank"),
    ]),
  ],
];

export function getEncounter(difficulty = 1, waveNumber = 1) {
  const missionIndex = Math.max(0, Math.min(5, Math.floor(Number(difficulty) || 1) - 1));
  const waveIndex = Math.max(0, Math.min(2, Math.floor(Number(waveNumber) || 1) - 1));
  const encounter = ENCOUNTERS[missionIndex][waveIndex];
  return {
    ...encounter,
    suggestedTowers: [...encounter.suggestedTowers],
    spawns: encounter.spawns.map((spawn) => ({ ...spawn })).sort((a, b) => a.at - b.at),
  };
}
