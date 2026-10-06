/**
 * The question shop: three tower cards, each priced with a problem.
 * Bronze = a fact the child knows, silver = one they are learning, gold = a stretch.
 */
import { TOWERS, unlockedTowers } from "./content.js";
import { makeQuestion } from "./questions.js";
import { pickFacts, missionsCompleted } from "./learner.js";

export const TIERS = ["bronze", "silver", "gold"];
export const PICKS_PER_BUILD = 3;

function towerFor(tier, unlocked, rng) {
  const of = (t) => unlocked.filter((id) => TOWERS[id].tier === t);
  const common = of("common"), rare = of("rare"), epic = of("epic");
  if (tier === "bronze") return { type: rng.pick(common), level: 1 };
  if (tier === "silver") return rare.length ? { type: rng.pick(rare), level: 1 } : { type: rng.pick(common), level: 2 };
  if (epic.length) return { type: rng.pick(epic), level: 1 };
  if (rare.length) return { type: rng.pick(rare), level: 2 };
  return { type: rng.pick(common), level: 3 };
}

function formatFor(tier, slot) {
  if (tier === "gold") return "missing";
  if (tier === "bronze") return slot <= 2 ? "picture" : "number";
  return slot === 1 ? "picture" : "number";
}

/** Make one shop of three cards. `exclude` holds facts already used recently. */
export function makeShop(profile, mission, skill, rng, exclude = new Set()) {
  const unlocked = unlockedTowers(missionsCompleted(profile));
  const facts = pickFacts(profile, skill, rng, exclude);
  return TIERS.map((tier) => ({
    tier,
    tower: towerFor(tier, unlocked, rng),
    question: makeQuestion(facts[tier], formatFor(tier, mission.slot)),
  }));
}

/**
 * What the child receives. A first-try answer buys the card's tower.
 * A bronze card is kept after a mistake; otherwise the child gets a Pebble,
 * so every pick gives something but accuracy pays more.
 */
export function resolveCard(card, outcome) {
  if (outcome === "first") return { ...card.tower };
  if (outcome === "retry" && card.tier === "bronze") return { ...card.tower };
  return { type: "pebble", level: 1 };
}
