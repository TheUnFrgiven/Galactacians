# Swarms and Flight Academy

Historical design of the initial finite prototype. Continuous expedition rules now live in [endless-progression.md](endless-progression.md) and supersede wave endings, reset rules, fixed upgrade caps and non-resumable run state below.

## Combat

Three nights contain 360, 640, and 960 enemies. The active population is capped at 320. Opening groups of 160/220/280 surround the deck, then packs reinforce it. A spatial grid supplies light local separation. Enemies spin, move toward the core and have one, three or six HP; 80% are fragile one-hit targets. They cause one, two or four core damage if they arrive.

The captain tracks a nearby target, turns the visible gun, and fires along its barrel at most ten times per second. Each round can pierce three enemies. Turrets turn independently, alternate twin barrels and fire two-damage area rounds every 0.32 seconds, radius 62. Recoil, muzzle flash and projectile origin share the same weapon pose. Swept collision checks catch enemies between frames; projectiles travel straight. Impact rings and pixel debris show group damage. The ship systems panel hides at night to leave room for combat.

These are generous first-pass values, intended to make a large swarm satisfying to clear. The stationary-player baseline is intentionally forgiving; difficulty, movement incentives and device rendering performance still need player feedback.

## Teaching adapted from Galactacians

Read from the current Galactacians docs/migration-decisions.md, docs/curriculum-map-ages-7-12.md, godot/scripts/question_factory.gd, and godot/scripts/curriculum_save.gd. That project was read only.

Implemented here:

- Untimed preparation and answers; the player explicitly starts combat.
- Three bounded lessons: addition within 10, subtraction within 10 without negatives, and making ten for addition within 20. Ten authored facts per lesson vary through answer ordering and weighted selection.
- Interactive ten/twenty-cell frame and quantity tray. Cells join or leave one at a time with animated movement.
- Specific strategy hint, one retry, then a worked explanation and supported continuation. A help message appears after eight seconds; it is not a deadline.
- Separate independent, supported and mistake records per fact and lesson. Using teaching controls or making a mistake marks that attempt supported.
- Greater selection weight for facts previously answered with help or mistakes, reduced weight after independent success, and no immediate repeat.
- Saved victory plus two distinct independent facts unlocks the next lesson. Two answers are a provisional progression rule, not proof of mastery. Targeted checks after a saved victory require no battle replay and grant no extra materials.
- Optional practice gives no hardware, score or materials. Defeat retries the night checkpoint, preserving purchased defenses and completed math. A new lesson starts a fresh three-night run.
- Versioned local JSON learning progress, including tutorial completion. Run state itself is not a resumable save. The separate swarm preview never writes progress.

Deliberate adaptations: Starfall keeps gathering, material costs and the existing 4-turret/2-shield/2-rig caps. Helped installation provides the same hardware at its normal cost without the one-alloy independent bonus. This differs from Galactacians' weakest-tower fallback and hidden reinforcement allowance. Four-choice answers remain. This is a three-lesson foundation, not the full Galactacians curriculum or a complete ages 7–12 course.

## Teaching references and limits

[IES: Assisting Students Struggling with Mathematics](https://ies.ed.gov/ncee/wwc/PracticeGuide/26) supports systematic instruction, mathematical language and concrete/visual representations. [EEF: Improving Mathematics in Key Stages 2 and 3](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3) discusses assessment and representations. Neither source validates this game, its three lessons or the two-answer threshold. Untimed preparation follows the approved Galactacians design. Learning effectiveness, accessibility and long-term retention have not been evaluated.

Next curriculum expansion should add number lines, more operations and mission-specific quantity problems after player review of this art/combat loop.
