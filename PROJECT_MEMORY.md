# Galactacians project memory

Handoff notes for anyone (human or AI) continuing this project. Read this first.

## The idea in one line

A tower defense game for ages 6–9 where every tower is bought with a math answer, structured like Duolingo: a path of short missions that each teach and practise one basic arithmetic skill.

## Priorities, in order

1. **A game first.** The battle is pure tower defense. Math never interrupts a wave.
2. **Learning second.** Math lives in the build-phase shop. Harder problems buy stronger towers.
3. **Tracking third.** Every answer is logged; facts move through stages new → learning → known → strong → mastered.

Keep it small enough for kids to follow and for one person to finish: 6 towers, 6 aliens, 6 worlds of 4 missions in the basics build.

## Decisions made (October 2026)

- The problem is shown on each shop card, so children judge what they can solve.
- A first-try answer buys the card's tower. After a mistake, an Easy card still gives its tower; Medium and Hard cards give a Pebble. Every pick gives something.
- Answers use a number pad, never multiple choice. No timers on questions.
- 3 picks per build phase, 3 build phases per mission (about 9 questions, 4 minutes).
- Four towers from the start (Pebble attack, Bricky wall, Frost slow, Prism armor breaker); Poppy and Magnet are earned by the first two wins. Each tower and alien gets an intro card the first time.
- Waves are deliberately busy and ramp within a mission (first wave in 3 lanes). Simulations: a child mixing cards wins about 80%; three towers alone fail after mission 1. Tune with `BALANCE` in content.js.
- Division (÷ 2, 5, 10) and a Galaxy mix world exist; review cards (35% chance) bring back earlier skills; Captain missions mix skills.
- Speed button 1×/2×/3×, remembered in settings.
- Merging two identical towers of the same level levels them up, to level 3.
- Earth's Star Beam charges from first-try answers and clears one lane.
- Difficulty is personal: Easy = facts the child knows, Medium = facts they are learning or got wrong, Hard = the hardest third, in a "missing number" format.
- Plain JavaScript modules, no build step, no dependencies. TypeScript can come later.
- Online competition (effort-based leagues, class leagues, ghost defense) is future work, not in the basics build.
- The old prototypes (v1 planet defense and v2 lanes with energy) live in git history on `main`; this branch removed them.

## Where things are

See README.md for the code map. Rules are in `src/core/` and are unit tested; screens are in `src/ui/`. Content (missions and waves) is data in `src/core/content.js`. Balance is checked by simulated players in `tests/sim.mjs`.

## Next steps

1. Playtest with 5–8 children aged 6–9: can they start alone, do they understand the shop, do they ask for another mission?
2. Tune wave difficulty from that playtest (`RECIPES` and `UNIT_HP` in content.js), then rerun `npm test`.
3. Add worlds 5+ from the learning path in the design doc (within 20, doubles, tens, more times tables).
4. Teacher view and online leagues, after the playtest.
