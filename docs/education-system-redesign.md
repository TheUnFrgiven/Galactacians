# Galactacians Education System Redesign

This document rebuilds the lost redesign work into a durable product plan for Galactacians. It treats the game as a real math learning product for ages 7-12, not as an endless quiz with a space skin.

## Product Promise

Galactacians is a full space campaign game where math is the way the player travels, repairs, upgrades, rescues, and wins. Every mission teaches one measurable idea, every boss checks whether the learner can use it, and every reward changes the game world so the child feels progress instead of just seeing a score.

The core standard for design quality is:

```text
A child should be learning from a serious math curriculum, but the moment-to-moment experience should feel like a polished space strategy game.
```

## Source Standards And Design References

Use these as design references, not as a legal claim of certification.

- ISO 21001:2025, Educational Organizations Management Systems: use its learner-centered, quality-improvement mindset for curriculum design, assessment, accessibility, feedback, and continual improvement. Official ISO page: https://www.iso.org/standard/21001
- Common Core Mathematics: use the progression across Operations and Algebraic Thinking, Number and Operations in Base Ten, Fractions, Measurement and Data, Geometry, Ratios and Proportional Relationships, Expressions and Equations, and Statistics. Official page: https://corestandards.org/mathematics-standards/
- England National Curriculum Mathematics: use the aims of fluency, mathematical reasoning, and problem solving, plus the Year 3-6 and Key Stage 3 progression. Official page: https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study

Galactacians should be "ISO-inspired" until a real certification process exists. Certification would require organizational processes, records, audits, learner-support policies, and evidence beyond this game repository.

## Learner Age Range

Target ages: 7-12.

Approximate academic mapping:

| Age | Common mapping | Galactacians focus |
| --- | --- | --- |
| 7 | Grade 2 / Year 3 bridge | place value, fluency within 20/100, time, money, shape language |
| 8 | Grade 3 / Year 3 | multiplication meaning, division meaning, 3-digit place value, simple fractions |
| 9 | Grade 4 / Year 4 | multi-digit operations, multiplication tables, fractions, measurement conversions |
| 10 | Grade 5 / Year 5 | decimals, fraction operations, area/volume, coordinate thinking |
| 11 | Grade 6 / Year 6 | ratios, percentages, negative numbers, expressions, statistics |
| 12 | Grade 6-7 bridge / Key Stage 3 bridge | proportional reasoning, equations, coordinate plane, data interpretation |

The game should not assume every child of the same age is at the same level. The first campaign step should place the learner into an appropriate route and keep earlier missions available for repair.

## Education Quality System

The learning system should behave like a small educational management system inside the game.

Required controls:

- Clear outcomes: every mission has one learning objective that can be assessed.
- Sequencing: new concepts must depend on known prerequisites.
- Learner evidence: store accuracy, attempts, hints used, response time, and misconception tags.
- Intervention: repeated errors trigger guided repair instead of simply marking failure.
- Review: mastered skills return through spaced review and mixed bosses.
- Accessibility: support keyboard play, color-blind readability, readable type, and low-pressure practice.
- Continual improvement: keep data that lets us see which missions fail too often or are too easy.

This is the practical interpretation of "actual ISO systems" for the current product stage: documented objectives, consistent process, learner-centered evidence, and continuous improvement.

## Game Identity

Galactacians should not be a Duolingo copy. It can learn from strong education apps, but the mechanic must be native to the fantasy:

- Math charges navigation, shields, rescue drones, terraforming, diplomacy, mining, and ship systems.
- The child is not "doing a lesson"; they are completing a space operation.
- The planet visibly changes after learning: lights return, biodomes grow, trade routes reopen, citizens move back in.
- Mistakes are explained in-world: a wrong answer causes a system misfire, then Mission Control shows a repair scaffold.
- Progress is campaign-based, with optional daily loops, not an endless feed of disconnected questions.

## Core Learning Loop

Each mission uses the same reliable teaching loop:

1. Brief story setup: why the math matters in the mission.
2. Micro-teach: one concept, one visual model, one worked example.
3. Guided try: low-risk question with hints available.
4. Independent run: several questions with faded support.
5. Mixed transfer: one or two questions that require choosing the method.
6. Boss check: a short mastery gate.
7. Reward: planet, ship, population, or galaxy-state improvement.
8. Review scheduling: the skill becomes eligible for later spaced review.

No mission should introduce a new concept during a boss. Bosses check, combine, and apply.

## Mastery Model

Suggested states:

| State | Meaning | Game behavior |
| --- | --- | --- |
| `new` | Skill not seen yet | Locked or previewed on the map |
| `introduced` | Taught once | Shows full visual support |
| `guided` | Learner has tried with support | Hints and manipulatives remain visible |
| `practicing` | Learner can solve with some errors | Normal mission pressure |
| `secure` | Learner passes the mission gate | Unlocks related missions |
| `mastered` | Learner passes mixed review later | Used in Infinite Galaxy and hard bosses |
| `review_due` | Spaced review is ready | Appears in daily missions |
| `needs_support` | Errors show a gap | Routes to repair mission |

Default mastery gate:

- Independent phase: at least 5 correct.
- Accuracy: 80% or higher after teaching.
- Boss: at least 3 correct out of 4, or 4 out of 5 for high-impact missions.
- Error handling: 2 repeated misconception tags trigger an explanation; 3 failed attempts route to repair.
- Review schedule: 1 day, 3 days, 7 days, 14 days. Prototype builds can compress this to minutes for testing.

## Assessment And Adaptivity

The game should track more than correct/wrong.

Track:

- skill id
- question family id
- answer
- correctness
- attempts on the same question
- hint level used
- response time bucket
- misconception tag
- mission phase
- mastery state before and after

Use the data for:

- placement
- repair routes
- spaced review
- challenge tuning
- parent/teacher progress views later
- curriculum improvement

Do not use speed alone as a quality signal. Speed is useful after fluency is established, but slow correct reasoning is still valuable learning.

## Question Design

Questions should be authored in families, not just as one-off prompts.

Every family needs:

- concept model: number line, array, area model, bar model, graph, coordinate grid, fraction strip, place-value chart
- skill target
- allowed numbers
- distractor logic
- misconception tags
- hint ladder
- explanation template

Example:

```text
Family: make-10-addition
Target: use pairs that total 10
Prompt pattern: 8 + ? = 10
Correct answer: 2
Distractors: 1, 3, 18
Misconceptions: off-by-one, count-all-confusion, operation-confusion
Hint ladder:
  1. Show ten-frame with 8 filled.
  2. Ask how many empty spaces remain.
  3. Show 8 + 2 = 10.
```

Random generation is allowed only inside a validated family. Campaign missions should be curated first, then generated later from the same constraints.

## Game Modes

### Campaign

The main standards-aligned campaign. It should contain the full learning sequence, placement, story missions, mastery gates, boss reviews, guided repair, and long-term unlocks.

Rules:

- no random new curriculum
- no skipping a failed question without repair
- no manual upgrade choice for core learning rewards
- each lesson unlocks a visible world change

### Infinite Galaxy

Endless defense mode for fun, fluency, and replay. It should only use:

- mastered skills
- review-due skills
- user-selected practice skills
- low-risk preview questions clearly marked as bonus

### Practice Lab

Low-pressure targeted practice. It should let a child or parent choose a skill, see hints earlier, and build confidence without population loss.

### Mission Archive

Replay completed missions, especially boss fights and repair missions. This supports mastery without making children feel forced into a daily streak treadmill.

## Engagement System

Use engagement to protect learning, not to hide weak teaching.

Strong loops:

- campaign map with planets, routes, locked sectors, rescue targets
- planet restoration after each mission
- ship modules unlocked by strands, not only by streak
- collection rewards that do not replace learning
- daily rescue mission using spaced review
- challenge leagues based on effort or mission completion, not public raw math rank
- boss rematches with cosmetic rewards
- "streak repair" missions after missed days rather than shame messaging

Avoid:

- punishing children for needing help
- showing public rankings for young children by default
- excessive time pressure before mastery
- loot boxes or chance-based learning rewards
- random worksheet feeds pretending to be a campaign

## Reward Mapping

Math strand rewards should match the fantasy:

| Strand | Game fantasy | Current prototype mapping |
| --- | --- | --- |
| Addition | power generation and charging weapons | damage |
| Subtraction | shielding and damage control | max shield / max health |
| Multiplication | scaling systems and multi-target tools | multishot |
| Division | fair sharing, logistics, repair distribution | regeneration |
| Fractions | fuel mixing, territory, resource splitting | precision systems |
| Measurement | navigation, time, cargo, distance | route efficiency |
| Geometry | ship paths, shields, map coordinates | navigation and defenses |
| Ratios / percentages | alliances, oxygen balance, trade rates | fleet scaling |
| Algebra | command rules and unknown system values | automation |
| Statistics | scan data and risk decisions | strategy intel |

This keeps rewards meaningful and helps children remember what the math was for.

## Campaign Architecture

Use a galaxy-based structure:

1. Number Sense Nebula: place value, comparison, number lines.
2. Operation Orbit: addition and subtraction.
3. Array Belt: multiplication.
4. Rescue Division Sector: division.
5. Fraction Frontier: fractions and equivalence.
6. Decimal Dockyards: decimals, money, measurement.
7. Geometry Navigation Grid: shape, angle, coordinate thinking.
8. Ratio Alliance: ratios, percentages, proportional reasoning.
9. Algebra Command: expressions, equations, patterns.
10. Data Observatory and Final Capstone: statistics, mixed review, transfer.
11. Data Observatory: graphs, averages, interpretation.
12. Galactic Council: mixed capstone campaigns.

Each galaxy should include:

- intro mission
- 3-8 concept missions
- repair mission template
- mixed review mission
- boss mission
- optional challenge mission

## Age-Sensitive Design

For ages 7-8:

- more visual models
- shorter missions
- no harsh timers
- concrete story contexts
- read-aloud-ready copy

For ages 9-10:

- stronger strategy focus
- mental and written methods
- more mixed operations
- visible connection between models and symbols

For ages 11-12:

- proportional reasoning
- multi-step missions
- data decisions
- pre-algebra
- optional competitive challenges

## Implementation Plan

Phase 1: Preserve and organize the redesign.

- Add curriculum docs.
- Add a code-ready learning-system source.
- Add validation so missing objectives, standards, scaffolds, or mastery gates are caught.

Phase 2: Replace the small campaign list with a curriculum compiler.

- Keep current `campaignLessons` playable.
- Compile missions from `src/curriculum/learning-system.js` into the current lesson format.
- Preserve save compatibility with `planet-math-defense-save`.

Phase 3: Add real mastery and repair.

- Store per-skill mastery states.
- Add misconception tags and hint levels.
- Route failed skills to guided repair.
- Add review scheduling.

Phase 4: Add placement.

- The Campaign route starts directly with Number Sense and can later add optional diagnostics without becoming a separate mode.
- A learner can always go backward for repair.
- Older learners should not be forced through every age-7 mission.

Phase 5: Upgrade game feel.

- Make each planet restoration visible.
- Add campaign map transitions.
- Add boss identity and mission variety.
- Use sound and animation after the learning loop is stable.

Phase 6: Parent/teacher layer.

- Show standards coverage, skill states, and progress.
- Keep it separate from the child-facing game.

## Definition Of "Good Enough To Continue"

The redesign is ready to continue when:

- every mission has an objective, standard reference, scaffolds, question families, and a mastery gate
- every age 7-12 has a full path
- each math strand maps to game mechanics
- validation passes
- the existing prototype still runs
- the next engineering step is clear: wire the curriculum source into the current campaign system
