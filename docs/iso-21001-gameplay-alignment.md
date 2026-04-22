# ISO 21001 Gameplay Alignment

Galactacians uses ISO 21001:2025 as a design reference for the educational system behind Campaign mode.

Official reference: https://www.iso.org/standard/21001

Important boundary: this is not an ISO certification claim. ISO 21001 is an educational organization management-system standard. Certification would require organizational policies, audits, learner support records, and operating evidence outside this game prototype.

## Practical Interpretation

The game should translate the standard into play in these concrete ways:

- Learner-centered design: every Campaign planet has an age band, learning objective, scaffold, and mastery target.
- Inclusive support: wrong answers keep the learner on the same question, show hints, and route repeated struggle into repair instead of silently skipping.
- Consistent curriculum delivery: missions are authored in `src/curriculum/learning-system.js` and compiled into runtime lessons, so the game loop does not invent random Campaign content.
- Evidence of learning: the game records correct answers, wrong answers, mastery state, misconception counts, review timing, population impact, and saved-planet stars.
- Continuous improvement: curriculum validation fails when required fields such as objectives, standards, scaffolds, misconceptions, mastery gates, and review schedules are missing.

## Campaign Gameplay Requirements

Each playable Campaign planet must include:

- `ageRange` inside the 7-12 target
- a measurable `objective`
- at least one standards reference
- at least one scaffold
- at least one misconception tag
- a question family set
- a mastery gate with independent correct answers, boss items, max error rate, and review timing

The on-screen Campaign deck surfaces:

- target ages
- standards path
- support scaffold
- mastery evidence
- hint after wrong answers
- saved-planet result evidence

The saved-planet result popup must show:

- stars earned
- correct answer count
- wrong answer count
- remaining population
- learning evidence for the objective

## Non-Certification Rule

Use phrases such as `ISO-informed`, `ISO-aligned design reference`, or `ISO 21001 gameplay alignment`.

Do not claim the game, company, curriculum, or product is ISO certified unless a real certification process has happened.
