# Galactacians menu + held rifle — 2026-10-25

## References read

The Galactacians checkout was read only. The port uses the older game-menu.html and src/menu/main-menu.js navigation, the newer src/v2/app.js home/mission-map/skill-card/result flow, src/v2/learning.js question ranges, and the native Godot visual teaching and typed-answer pattern. Nunito was instantiated as a static bold UI face from the existing licensed font; its SIL OFL notice is included.

## Main menu

The game opens a native Unity menu: Continue Expedition, My Galaxy, Practice Lab, Defenders, Stats, Achievements and Settings. It uses the current space setting and pixel artwork. M opens or closes the menu during an expedition. The underlying battle stays suspended; returning resumes its existing state.

My Galaxy links six lessons: Power Sums, Shield Differences, Bridge to Twenty, Equal Groups, Fair Sharing and Cosmic Mix. The original three record indexes are preserved. Existing learning arrays expand without discarding their stored values. Learning unlocks still require two distinct independent upgrade checks plus a third-night milestone. Reviewing a lesson or selecting an unlocked topic never resets hardware.

Every lesson has an explanation and an example before its practice questions. A first-time upgrade calibration also shows its topic's teaching before asking a question. The material purchase flow continues to affect the real expedition.

Practice Lab has Addition, Subtraction, Multiplication and Division skill cards with Starter, Explorer and Challenger levels. Number ranges follow the Galactacians v2 generator: small starting quantities, single-digit operands at higher levels, exact division and no negative subtraction. Multiplication and division have interactive equal-group models. Addition/subtraction retain movable quantity cells.

A session has five questions, one retry, hint access and supported worked continuation. Correct answers stay visible with their explanation before the learner moves on. The learner can choose four options or typed-number input. Independent and helped completion records remain separate.

Practice grants learning XP (10 independent / 4 supported) and one cosmetic star on a local day with at least five solves. It grants no ship materials, hardware or combat XP. Accent colors unlock at 1/3/5 cumulative stars and change menu/weapon glow and aura colors. These are presentation rewards, not mastery claims.

Stats displays independent/helped counts per lesson. Achievements use actual astronaut/equipment/kill/learning state. Settings includes local name, reduced motion, typed/choice input and fullscreen. No account, network service or inactive audio control was added.

## Rifle correction

New transparent PlasmaCarbine.png and PilotCombatDirections.png assets replace the rectangular gun overlay and straight-down arm poses. The original sprite sheet is kept.

The live menu exposed a coordinate-space bug in GUIUtility.RotateAroundPivot under the scaled game/menu matrix. Explicit local transforms now rotate gun sprites, turrets and beam trails in their actual drawing space. This also fixes route lines drawn away from their nodes.

The rifle's stock, receiver grip, foregrip and visible muzzle share one pose. An upward aim uses the raised right shoulder and draws behind the body where appropriate; leftward aim flips the grip vertically before rotation to keep it upright. Recoil is a short bounded kick independent of the muzzle-flash duration. Target selection retains a live target to avoid nearest-enemy aim jitter. New projectile trails are limited to their distance travelled so they cannot extend back through the gun on their first frame.

## Persistence and limits

Expedition saves preserve suspended battle and pending dawn state while studying, including a normal quit from practice. The separate preview does not write player progress. Profile fields for practice/settings share the versioned learning save; its prior three lesson records remain compatible.

This is a native adaptation of the relevant menu and teaching flow, not the entire historical 55-mission browser curriculum. The six introductory lessons cover four basic operations. No educational effectiveness or long-term retention is claimed.

## Delivery observations

The final macOS player build succeeded on 2026-10-25 using Unity 6000.6.7f1 (131,085,119 bytes), at Build/Runehold.app. The live preview was visually inspected on Home, Settings and the expedition deck. The inspection exposed the scaled-rotation issue and a clipped sidebar tagline; the final build includes both corrections. The corrected preview visibly holds the rifle in the hands and rotates turrets around their mounts. The Home route connectors now meet their nodes.

All lesson/question combinations, four-direction handling, save/reload paths and extended swarm balance have not been exhaustively exercised in the live player. The historical economy/swarm checks describe earlier mechanics and are not current validation of this menu revision. No new automated tests were added or run.
