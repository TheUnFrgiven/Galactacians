# Handoff: what Claude changed in Galactacians

Hi ChatGPT. This note is from Claude, written for you so you can pick up the project and we can compare and combine our work. Sina is building Galactacians as a university graduation project and is working with both of us. This file explains what I changed on my branch, why, and how the code is laid out, so you don't have to reverse-engineer it.

**Branch:** `claude/basics` (3 commits on top of `fd29001`, the last commit on `main`)
**Commits:** `dc789e3` rebuild → `954d318` single-file build → `e27c63a` faster, harder, clearer, division and mixed math
**State:** playable, 21 automated tests passing, no dependencies, no build step needed to run it.

---

## 1. The goal Sina set

- Ages **6–9**, **basic arithmetic only** (add, subtract, make 10, times 2/5/10, divide by 2/5/10).
- **Tower defense at its core**, structured like **Duolingo** (a path of short lessons, tracking, streaks).
- Priorities, in this order: **a game first, learning second, tracking third.**
- Keep it small enough to finish by vibecoding, and simple enough for young children to follow.
- Online competition (leagues, ghost battles) is planned but **not built yet**.

## 2. Why I changed the design from your v2 (`fd29001`)

Your v2 looks great and I reused its art, lanes and tower roles. The problems I found were in the rules:

1. **Math was optional.** Energy came from a wallet (10 to start, +3 per wave, +1 per 5 kills). The v2 strategy test itself won all 6 missions without answering a single question.
2. **Math interrupted the fun.** The "+ Energy" pop-up paused the battle for 1 energy.
3. **Guessing worked.** 4 multiple choices, and retrying until right still paid the full reward.
4. **The docs disagreed with the code.** The README described a "persistent wallet", but the code reset it to 10 every mission.
5. **Too little content.** 6 missions, all towers unlocked from the start, so nothing new to work toward.

## 3. The new core loop

- **Every tower is bought with a math answer.** There is no energy currency at all.
- Each mission is **3 build phases + 3 waves** (about 4 minutes).
- **Build phase:** the shop shows **3 tower cards**. Each card has a problem printed on it, at Easy / Medium / Hard for this child. Harder problems buy stronger towers. The child picks **3 times** per build phase.
- **Answering:**
  - Answers go in on a number pad, not multiple choice, and there's no timer.
  - A first mistake shows a picture hint built from the real numbers.
  - A second mistake shows the worked answer, and the child types it in to finish.
- **What the child receives:**
  - A correct first try gets the card's tower.
  - After a mistake, an Easy card still gives its tower, but Medium and Hard cards give a basic Pebble.
  - So every pick gives something, but accuracy pays more.
- **Wave:** pure tower defense, with no math. The child can still place towers from their hand, **merge** two identical towers of the same level (up to level 3), and fire **Earth's Star Beam**, which is charged by 3 first-try answers and clears one lane.
- **Win/lose:** Earth has 5 hearts. Stars: 3 for all 5 hearts left, 2 for 3 or more, 1 for a win. Losing keeps all XP and learning progress.

## 4. Content

**6 towers** (`src/core/content.js` → `TOWERS`):

| Tower | Shape | Tier | Job | Unlocked |
| --- | --- | --- | --- | --- |
| Pebble | circle | common | fast single shots | start |
| Bricky | square | common | wall, aliens stop and bonk into it | start |
| Frost | diamond | rare | slows its lane and the lanes next to it | start |
| Prism | triangle | rare | slow beam, ignores armor | start |
| Poppy | pentagon | epic | splash damage over 3 lanes | after 1st win |
| Magnet | hexagon | rare | pushes the closest alien back | after 2nd win |

Tiers decide which card offers a tower: Easy → common, Medium → rare, Hard → epic (or a rare tower already at level 2).

**6 aliens** (`ALIENS`): Scout, Skater (fast), Swarm (groups of 4), Hopper (jumps over the first tower it meets), Helmet (armor), Captain (boss). Each alien gets an intro card the first time it appears.

**6 worlds × 4 missions = 24 missions** (`UNITS`, `MISSIONS`). Each world has 3 lessons and a Captain boss mission.

| World | Skill | Facts |
| --- | --- | --- |
| Earth Orbit | adding to 10 | 45 |
| Moon Meadow | taking away within 10 | 45 |
| Comet Coast | make 10 | 9 |
| Saturn Rings | times 2, 5, 10 | 30 |
| Jupiter Market | sharing ÷ 2, 5, 10 | 30 |
| The Big Galaxy | mix of all of the above | 159 |

Waves are written by hand as recipes (`RECIPES`) and laid out by a seeded random generator, so every mission is the same each time. The first mission of each world uses 3 lanes; the others use 5. In those, the first wave only uses the middle 3 lanes, and the waves get busier after that.

## 5. Learning model

- **Question formats** (`questions.js`): picture (dots, ten-frame, groups), plain numbers, and missing number (e.g. 7 + ? = 10). Gold cards always use the missing-number format.
- **Fact stages** (`learner.js`): new → learning → known → strong → mastered.
  - A first-try answer moves a fact up one stage. A mistake sends it back to learning.
  - Mastered needs first-try answers on 2 different days.
- **Personal difficulty** (`pickFacts`):
  - Easy cards use facts the child already knows.
  - Medium cards use facts they're learning, especially ones they got wrong.
  - Hard cards use the hardest third of facts.
  - If the child is struggling, Hard cards reach less far.
- **Surprises and mixing** (`shop.js`):
  - 35% of shops turn one card into a "Surprise review!" from an earlier skill the child has practised.
  - Captain missions mix in earlier skills.
  - The Galaxy mix world draws from all five skills.
- **Teaching:** each world opens with a short spoken picture lesson (a "teach card"), which can be replayed from the path.
- **Tracking:**
  - XP: 10/15/20 for an Easy/Medium/Hard first try, 5 after a mistake, 2 when the answer was shown, plus 10 per new mission star.
  - A daily streak with up to 2 freezes.
  - A fact map per world.
  - CSV export of every answer (in Settings), for parents, teachers and the evaluation study.
- Everything is saved in `localStorage` under `galactacians-basics-v1`. There are no accounts and nothing is sent anywhere.

## 6. Code layout

```
index.html                 entry point (ES modules)
src/core/                  game rules, no DOM, unit tested
  rng.js                   seeded random generator
  content.js               towers, aliens, worlds, missions, waves, BALANCE knobs
  questions.js             facts, formats, hints, makeQuestion, skillOfFact
  learner.js               profile, fact stages, XP, streak, missions, pickFacts
  shop.js                  makeShop (3 cards), resolveCard
  battle.js                deterministic simulation: towers, aliens, shots, merging, beam, Magnet, Hopper
  save.js                  load/save with validation, CSV export
src/ui/                    screens (DOM + SVG)
  app.js                   start screen, path, teach cards, fact map, guide, settings
  mission.js               build phases, shop, question flow, hand, placement, range preview, waves, results
  question.js              number-pad question view with hints
  info.js                  tower and alien explanation cards
  art.js                   SVG art (towers, aliens, Earth carried over from v2) + math pictures
  audio.js                 Web Audio sound effects + browser speech
  style.css
tests/
  core.test.mjs            21 tests: rules, learning model, saves, balance
  sim.mjs                  simulated players (also: npm run balance)
scripts/build-standalone.mjs   bundles everything into dist/galactacians.html (no dependencies)
dist/galactacians.html     the whole game in one file; double-click to play
```

**Commands:** `npm start` (local server on http://localhost:8088), `npm test`, `npm run balance`, `npm run build`.

**Important design rule:** `src/core/` must stay free of DOM code and randomness that isn't seeded. That's what lets the simulated players run all 24 missions in under a second. `battle.js` advances in fixed 0.05 s ticks and reports what happened as events (`spawn`, `pop`, `leak`, `merge`, `waveClear`, `won`, ...) that `mission.js` draws.

## 7. Balance and how it was checked

`tests/sim.mjs` plays every mission with scripted players:

| Player | Behaviour | Result (lesson missions / Captains) |
| --- | --- | --- |
| mixed | mixes card levels, 75% right first try | ~80% / ~78% wins, about 2 stars |
| ambitious | mostly Hard cards, 60% right | ~91% / ~78% |
| carelessKid | random tower placement, 70% right | ~70% / ~44% |
| bronzeOnly | only Easy cards | ~69% / ~11% |
| threeTowers | never uses more than 3 towers | ~43%, almost only first missions |
| neverRight | always wrong first | ~44% / 0% |

The overall difficulty is controlled by `BALANCE = { towerPower: 1.6, alienHp: 0.9 }` in `content.js`. The tests check that mixed players win at least 75% of lessons and 60% of bosses, that 3 towers alone win at most 25% after the first mission, and that Easy-only players rarely beat a Captain.

## 8. Sina's playtest feedback and what I did

| Feedback | Change |
| --- | --- |
| Too slow | 1×/2×/3× speed button (saved in settings), faster aliens, shorter gaps between screens |
| Only 2 towers felt one-sided | 4 starting towers with different jobs; Poppy and Magnet earned |
| Towers weren't understood | "Meet your towers" card, power/speed/reach bars and "good vs" icons on shop cards, reach preview when placing, tap a tower for its info, a "Towers & aliens" guide page |
| No division | Sharing world (÷ 2, 5, 10) |
| No mixing or surprises | Surprise review cards, mixed Captain missions, Galaxy mix world |
| 3 towers were enough | Busier waves that build up within a mission, the Hopper alien, rebalanced so 3 towers lose |
| Visuals made it look easy | More aliens on screen, red danger glow near Earth, wave progress bar, Captain health bar, helmet and crown art |

## 9. What I removed

On this branch I deleted the v1 prototype (`script.js`, `play.html`, `game-menu.html`, auth and profile pages, the old curriculum system) and your v2 code (`src/v2/`), plus outdated docs. They are all still in the git history on `main`. I reused v2's tower, alien and Earth art (moved into `src/ui/art.js`), the Nunito font and the general look.

## 10. Things your v2 has that mine doesn't (worth bringing over)

- Moving and selling towers.
- A range preview while placing (mine shows reach, but yours was more polished).
- A star shop where stars buy Earth colors (mine earns stars but has nothing to spend them on yet).
- A calm practice mode with no battle.
- Your menu mascot and some of the UI polish.

## 11. Known limits and open questions

- The balance comes from simulations only and **needs real children playing**.
- Voice uses the browser's built-in speech, which sounds robotic.
- It works on a phone held upright, but it's cramped; it's designed for a tablet or laptop held sideways.
- Not built yet: online leagues, teacher and parent accounts, more worlds (within 20, doubles, more times tables), recorded voice, music.
- A full design doc with the long-term vision (14 units, effort-based leagues, evaluation plan) exists; Sina has the link.

## 12. Suggested way to combine our work

1. Keep the rules from this branch (`src/core/` and the math-priced shop), since they fix the "math is optional" problem.
2. Bring over your polish: moving and selling towers, the star shop, the calm practice mode, menu details.
3. After any change, run `npm test`. If you change waves or tower stats, run `npm run balance` and keep the balance tests passing.
4. Run `npm run build` to refresh `dist/galactacians.html`.
