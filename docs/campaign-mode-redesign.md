# Campaign Mode Redesign

This document defines the current Campaign direction after separating it from Infinite Galaxy.

## Mode Separation

Campaign and Infinite Galaxy now have different purposes.

| Mode | Purpose | Pressure | Failure meaning | Question source |
| --- | --- | --- | --- | --- |
| Campaign | Teach the age 7-12 curriculum through missions | population, mastery gates, guided repair, attacker waves | learner needs support | scripted curriculum missions |
| Infinite Galaxy | Endless defense sandbox | timer, enemy swarm, population survival | survival run breaks | secure/mastered/review-due skills, then generated fallback |
| Practice Lab | Calm targeted practice | confidence only | no meaningful failure | selected skill practice |

Campaign is no longer normal survival play. It is the main learning game.

## Campaign Deck

Campaign starts from a connected planet map, then each selected planet opens one combined mission deck.

- The map appears after the player chooses Campaign.
- Each planet represents one lesson stage.
- Planets connect through a wavy dashed route, like a treasure-map path.
- Locked planets become clickable only after the connected prior planet is saved.
- The lesson identity, objective, progress, hint area, question, and answer buttons are in one answer deck.
- The old manual upgrade deck is hidden in Campaign.
- Correct answers automatically reward the current mission system: Power, Shield, Drones, or Repair.
- Question formats can show two, three, or four answers depending on what the math actually needs.
- Either/or comparisons use two answers instead of fake distractors.
- Smallest/greatest comparison questions can use three answers.

This makes Campaign feel closer to a focused language-learning drill loop without copying the product structure blindly.

## Planet Saves And Stars

Every Campaign stage has a start and finish.

- Starting a map planet resets the stage counter and sends enemies toward the Planet.
- The Planet gets a small baseline strength increase from later map stages.
- Finishing the lesson shows a saved-planet result popup.
- The popup gives feedback for correct answers, wrong answers, and remaining population.
- Stars are stored per lesson planet.
- Three stars require a clean save with no wrong answers and strong population.
- Two stars allow a small number of mistakes.
- One star means the planet was saved but should be replayed for a cleaner result.

## ISO-Informed Learning Evidence

Campaign uses ISO 21001:2025 as a learning-system design reference, not as a certification claim.

- Each planet surfaces the target age band, standards path, support scaffold, and mastery evidence.
- Each saved-planet popup reports objective evidence through correct answers, wrong answers, population, and stars.
- Curriculum validation requires age range, objective, standards, scaffolds, misconceptions, mastery gate, and review timing before a mission can pass.
- Wrong answers are treated as support signals: the same question stays active, hints appear, and repeated struggle routes to repair.

## Population

The `population` value is still visible in Campaign, but it means mission safety for the learner's colony.

- Correct answers destroy attackers and move mission progress forward.
- Lesson completion restores population and secures the skill for later review.
- Wrong answers keep the same question active.
- Wrong answers reveal a hint.
- Wrong answers immediately cost population.
- If population reaches 0%, guided repair opens.
- Ambient combat can make the world feel alive, but random combat does not decide whether a Campaign mission is learned.

This keeps pressure visible and game-like while protecting the teaching loop.

## Mission Progress

The old safety timer display becomes Mission Progress in Campaign.

- It shows lesson progress as a percentage.
- It does not count down to failure.
- Campaign failure is based on repeated misconception/support needs and population loss from answers, not time pressure.

## Repair Missions

Repair is support in Campaign.

Triggers:

- population reaching 0%
- repeated wrong answers marking the current skill as `needs_support`
- low population during a difficult mission

Behavior:

- the same mission stays active
- guided questions come from the current lesson
- successful repair restores population to a stable floor
- partial repair keeps hints important but allows the learner to continue

Repair is not a death screen in Campaign.

## Correct Answers

Correct answers in Campaign:

- record a skill attempt
- increase mission progress
- destroy one or more attackers
- charge the mission reward system
- improve streak/theme progress
- complete the lesson when the mastery gate is met
- schedule later review when the skill becomes secure

## Wrong Answers

Wrong answers in Campaign:

- record a skill attempt
- keep the same question active
- show the lesson hint
- lower population
- tag the likely misconception
- open repair support if the learner keeps struggling

Wrong answers do not skip the question. This protects learning.

## Multiple Accepted Answers

The answer checker supports future questions with multiple accepted numeric answers through `answers` or `acceptedAnswers`, while keeping the current single-answer questions working.

The answer renderer supports explicit `choices`, so the curriculum compiler can choose the right button count per question.

## Infinite Galaxy Systems

Infinite Galaxy keeps the survival meaning.

- The timer counts down.
- Enemies can damage the Planet.
- Population can be lost.
- Repair can restore a broken run.
- The player chooses math power categories manually.
- Secure, mastered, and review-due Campaign skills are preferred for questions.
- Generated questions remain as fallback when no mastered skills exist yet.

This gives the endless mode a clear role: replay, fluency, and survival fun.

## Practice Lab Systems

Practice Lab stays low pressure.

- no survival failure
- confidence label instead of population
- calm timer label
- wrong answers show hints and keep the learner practicing
- ambient enemies are visual pressure only

## Current Implementation Notes

The separation is implemented through `MODE_RULES` in `script.js`.

Important mode differences:

- `countdown`
- `timerFailure`
- `combatCanTriggerRepair`
- `enemyPressureScale`
- `enemyDamageMultiplier`
- status labels
- repair target
- population gain and penalty values

The same game shell is reused, but Campaign now owns a focused one-deck learning loop.
