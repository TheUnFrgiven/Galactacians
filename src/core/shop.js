/**
 * The question shop: three tower cards, each priced with a problem.
 * Bronze = a fact the child knows, silver = one they are learning, gold = a stretch.
 * Surprises keep it lively: review cards from earlier skills, and mixed questions
 * in boss missions and the Galaxy mix world.
 */
import { TOWERS, BASIC_SKILLS, unlockedTowers } from "./content.js";
import { makeQuestion, skillOfFact } from "./questions.js";
import { pickFacts, missionsCompleted, factRecord } from "./learner.js";

export const TIERS = ["bronze", "silver", "gold"];
export const PICKS_PER_BUILD = 3;
export const REVIEW_CHANCE = 0.35;

function towerFor(tier, unlocked, rng) {
  const of = (t) => unlocked.filter((id) => TOWERS[id].tier === t);
  const common = of("common"), rare = of("rare"), epic = of("epic");
  if (tier === "bronze") return { type: rng.pick(common), level: 1 };
  if (tier === "silver") return rare.length ? { type: rng.pick(rare), level: 1 } : { type: rng.pick(common), level: 2 };
  if (epic.length && rng() < 0.6) return { type: rng.pick(epic), level: 1 };
  if (rare.length) return { type: rng.pick(rare), level: 2 };
  return { type: rng.pick(common), level: 2 };
}

function formatFor(tier, slot) {
  if (tier === "gold") return "missing";
  if (tier === "bronze") return slot <= 2 ? "picture" : "number";
  return slot === 1 ? "picture" : "number";
}

/** Skills the child has already practised, other than the one in front of them. */
function practisedSkills(profile, except) {
  const seen = new Set(Object.entries(profile.facts).filter(([, r]) => r.attempts > 0).map(([id]) => skillOfFact(id)));
  return BASIC_SKILLS.filter((s) => s !== except && seen.has(s));
}

/** Which skill each card's question comes from. */
function skillsForCards(profile, mission, rng) {
  if (mission.unit === "mixed") return TIERS.map(() => rng.pick(BASIC_SKILLS));
  const base = mission.unit;
  const earlier = BASIC_SKILLS.slice(0, BASIC_SKILLS.indexOf(base));
  if (mission.boss && earlier.length) {
    // Boss missions mix in earlier worlds' skills.
    return [rng.pick(earlier), base, rng() < 0.5 ? base : rng.pick(earlier)];
  }
  const review = practisedSkills(profile, base);
  if (review.length && rng() < REVIEW_CHANCE) return [rng.pick(review), base, base];
  return [base, base, base];
}

/** Make one shop of three cards. `exclude` holds facts already used recently. */
export function makeShop(profile, mission, rng, exclude = new Set()) {
  const unlocked = unlockedTowers(missionsCompleted(profile));
  const skills = skillsForCards(profile, mission, rng);
  const used = new Set(exclude);
  return TIERS.map((tier, i) => {
    const facts = pickFacts(profile, skills[i], rng, used);
    const fact = facts[tier];
    used.add(fact.id);
    const isReview = mission.unit !== "mixed" && skills[i] !== mission.unit;
    return {
      tier,
      skill: skills[i],
      badge: isReview ? (mission.boss ? "Mix" : "Review") : mission.unit === "mixed" ? "Mix" : null,
      tower: towerFor(tier, unlocked, rng),
      question: makeQuestion(fact, formatFor(tier, mission.slot)),
      known: factRecord(profile, fact.id).stage >= 2,
    };
  });
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
