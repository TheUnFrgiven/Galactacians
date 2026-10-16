# Galactacians — basic arithmetic campaign

Design specification · 14 October 2026

Implementation update · 16 October 2026: M01–M06 are playable in Godot. The user has
specified Claude-style level/curriculum structure, the ChatGPT browser battlefield feel,
and clean cute **floating astronaut defenders**. The five role names and strategic jobs
remain; geometric shapes are chest badges rather than bodies. Original astronaut SVGs
share suit proportions and restrained drift. Browser alien/Earth artwork is reused.
M07–M36 below remain authored design, not delivered gameplay. Recorded narration and
the adaptive review scheduler are still pending. This distinction supersedes older
statements in this document that the native implementation is only a menu foundation.

Status: implementation-ready working design, not implemented content or a validated educational intervention. The approved decision register governs core rules. This document fills in lesson sequencing, teaching interactions, interface flow and evaluation criteria. Numeric thresholds and combat values are provisional and must be tested.

## 1. Direction and scope

Build a cute defense game in which understanding a question earns a teammate. The child-facing loop is **Choose → Solve → Place → Ready → Defend**. There is no currency calculation, upgrade tree or second reward system to learn during battle.

Use Claude's themed-world path and Captain finales. Preserve its direct math-to-tower connection, number pad, replayable picture lessons and authored encounters. Replace its fixed nine-question purchase requirement with the agreed hidden power allowance. Do not restore its sixth tower, five-lane expansion, merging, Star Beam or penalties that make easy-only teams systematically unable to win bosses. Its learning record also needs correction: hinted answers cannot count as independent successes.

The complete basic-arithmetic design has **six worlds of six missions: 36 missions**. This is an authored content plan, not a promise to build all worlds before testing. Build M01 end to end, then M01–M06. Expand addition/subtraction through M24, followed by multiplication/division M25–M36. Each world ends in a Captain remix, and optional topic challenges unlock after relevant lessons.

Refinement of the earlier scope: the first six missions stay within 10. Arithmetic within 20 belongs to the expanded addition/subtraction release, rather than rushing all prerequisites into six introductory missions. Multiplication/division remain later content as agreed. Keep the complete map in authoring tools, but show only built destinations in the released game.

Audience is 7–12, but this is foundational arithmetic practice, not the complete school mathematics curriculum for those ages. Do not label a child by school year or imply that a short campaign covers fractions, measurement, geometry or all primary mathematics.

## 2. Curriculum and evidence basis

Use England's public mathematics programme as an explicit reference baseline because no national jurisdiction has been selected. Do not present it as universal or Romanian curriculum alignment. Localisation can remap objectives later.

Source mapping, verified 14 October 2026:

| Reference | What it contributes | Where used |
| --- | --- | --- |
| [Department for Education: mathematics programmes of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study) | Foundational number relationships, addition/subtraction within 20, related facts, simple problems, equal groups and sharing; later 2/5/10 facts | Worlds 1–6; a selected arithmetic strand, not comprehensive curriculum coverage |
| [IES/WWC: elementary mathematics intervention guide, 2021](https://ies.ed.gov/ncee/wwc/practiceguide/26) | Systematic instruction, precise language, purposeful representations and number lines | Demonstrations, guided practice and misconception-specific explanations |
| [EEF: Improving Mathematics in Key Stages 2 and 3](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3) | Use assessment to inform teaching; connect representations and support independence | Practice selection, support fading and separate learning records |

The world order, rewards, check thresholds and review schedule below are our game-design interpretations. These sources do not validate them. Untimed questions are an approved product choice, not a claim that evidence rules out all timed fluency practice. Have a primary mathematics educator review scripts and generators before child testing.

## 3. Complete progression

Mission numbers provide authoring order, not labels shown as school grades. Each row states the one main objective, an example/check target and the teaching representation. Each mission after M01 requires the previous mission's victory and learning check. Replay is always available. A world finale consolidates taught content without introducing a new mathematical operation.

### World 1 — Earth Orbit: first number friends

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M01 First Contact | Combine groups to 5: 2 + 1 | Move two alien groups into one pen; then solve a different small sum without coaching |
| M02 One More Visitor | Count on 1 or 2, total ≤ 10: 5 + 2 | Keep the starting group intact and animate two hops; avoid recounting everything by default |
| M03 Moon Mail | Add within 10: 4 + 3 | Match groups, a number-line journey and the equation; vary the operands |
| M04 Heading Home | Take away within 5: 5 − 2 | Two aliens board a shuttle; count those remaining, not those leaving |
| M05 Empty Spaces | Subtract within 10, including zero: 7 − 3, 4 − 0 | Show departure and the unchanged group when nobody leaves |
| M06 Captain Welcome | Distinguish joining and leaving within 10 | Familiar short visual stories, then a fresh addition and subtraction example; no new concept |

Before M01, use a short guided counting interaction to establish one object per count and quantity, without placement-based skipping of lessons. If counting is insecure, offer another guided scene; do not repeatedly throw equations at the child.

### World 2 — Moon Meadow: how numbers fit

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M07 Two Landing Pads | Split a whole into two parts: 6 = 4 + 2 | Move six objects between two pads; equality means the same amount |
| M08 Fill the Shuttle | Find complements to 10: 7 + ? = 10 | Fill the empty seats of a ten-frame |
| M09 Swap Seats | Addition order: 3 + 6 and 6 + 3 | Swap colored groups; total remains unchanged |
| M10 Return Tickets | Connect addition and subtraction: 4 + 3 = 7; 7 − 3 = 4 | Show the same part-whole scene joining and separating |
| M11 Missing Passenger | Find a missing part: ? + 2 = 8; 8 − ? = 2 | Hide a group under a shuttle; distinguish missing part from total |
| M12 Captain Connections | Apply bonds and related facts | A fresh missing-part item plus a related subtraction fact, with previously taught forms |

### World 3 — Comet Coast: useful strategies

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M13 Twin Comets | Doubles with totals ≤ 10: 4 + 4 | Pair identical rows; link pairs to the total |
| M14 One Extra Star | Near doubles within 10: 4 + 5 | Use a known double and show the extra one |
| M15 The Gap | Subtraction as difference: 9 − 6 | Align two rows; count the unmatched objects |
| M16 Count the Hops | Count up for close subtraction: 9 − 7 | Start at 7 and count the hops to 9; distinguish hops from landing numbers |
| M17 Same Total | Apply a taught strategy to a new fact | Choose a visual strategy if helpful; independent check uses fresh numbers without revealing steps |
| M18 Captain Comet | Choose addition/subtraction in a one-step context | Short spoken and pictured problems using familiar quantities; no reading-speed score |

### World 4 — Saturn Gardens: beyond ten

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M19 Ten and Some | Compose numbers 11–20: 10 + 4 | Bundle ten objects and show four loose ones; read 14 as ten and four |
| M20 Ring Delivery | Add without crossing ten: 12 + 3 | Keep the full ten-frame intact while adding to the second frame |
| M21 Bridge to Ten | Add across ten: 8 + 5 | Split five into two and three, fill ten, then add three |
| M22 Shuttle Return | Subtract without crossing ten: 17 − 4 | Remove four from the loose seven; preserve the bundle |
| M23 Across the Bridge | Subtract across ten: 13 − 5 | Remove three to reach ten, then two more; contrast with counting up when useful |
| M24 Captain Twenty | Apply related facts and one-step stories within 20 | Fresh addition and subtraction items, including crossing ten; return to prerequisite support if needed |

### World 5 — Jupiter Workshop: equal groups (later release)

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M25 Matching Baskets | Recognise equal versus unequal groups | Make three baskets each hold two; identify total without treating unequal groups as multiplication |
| M26 Pairs Parade | Repeated groups of two: 3 × 2 | Link three groups of two to 2 + 2 + 2 and six objects |
| M27 Array Garden | Read rows and columns: 2 × 4 | Build an array; rotate it to connect two equivalent totals |
| M28 Five-seat Ships | Groups of five | Count complete five-seat ships before introducing partial patterns |
| M29 Cargo Tens | Groups of ten | Use bundles and a number line; do not teach “just add a zero” as the explanation |
| M30 Captain Groups | Apply groups of 2, 5 and 10 | Mix arrays and simple stories; totals capped at 50 initially, up to 5 groups of ten |

Teach symbol order consistently: in this game's scripts, 3 × 2 means three groups of two. Explain that swapping factors preserves the total while a pictured story may describe a different grouping. Later extend practice to ten groups (products ≤ 100), after the introductory group concepts are secure; this is optional follow-on practice, not hidden in early tower offers.

### World 6 — Jupiter Market: fair shares (later release)

| ID / mission | Main objective and example | Teaching / independent check |
| --- | --- | --- |
| M31 Fair Picnic | Share equally between two: 8 ÷ 2 | Deal one object at a time into two plates; answer means objects per plate |
| M32 Fill the Ships | Group into sets of two: 8 ÷ 2 | Pack two per ship; answer means number of ships; contrast with sharing |
| M33 Five Friends | Share and group by five | Distinguish five groups from five in each group using explicit pictures |
| M34 Ten-seat Departure | Divide by ten | Use whole ships; exact division only |
| M35 Return Receipt | Connect multiplication and division: 3 × 5 = 15; 15 ÷ 5 = 3 | Use one grouping diagram with missing quantities |
| M36 Grand Captain | Select the operation in familiar one-step situations | Mixed review of taught skills; no new operation, remainders or trick wording |

Division generators use nonzero divisors 2, 5 or 10 and exact quotients. Begin with totals ≤ 20, extend only to previously taught multiplication products ≤ 50. No negative answers, fractions, formal column methods or division by zero in this campaign. A subsequent campaign can extend beyond these basics; do not silently widen difficulty to fill a stronger-tower card.

## 4. Mission rhythm and clear battle teaching

M01 has one short wave; M02–M05 have two; M06 and subsequent missions have three. These counts are initial pacing settings. Target a short session, roughly 4–7 minutes after onboarding, but never time out teaching to meet a duration target. Save at every completed question and phase boundary.

1. Enter the mission directly from Play. Show its lesson in one line, not a separate briefing page.
2. Demonstrate only a newly introduced idea. Child performs one meaningful action, then tries a supported example. A replay button stays available; repeated plays do not force the demonstration again.
3. Show up to three tower offers beside the board. The card has a character, role icon, strength pips and one question. Do not display a numeric power budget or currency.
4. Choose an offer; use large number-pad buttons or the physical keyboard, with explicit Check. After reward, select a landing pad. The board stays visible, and unfinished offers persist when inspecting it.
5. Continue until the allowance is filled. Show “Team ready!”; permit free rearrangement, then press Ready. Require every earned defender to be placed, with enough pads for the maximum weak-tower outcome.
6. Automatic combat. Only Menu and optional speed control are available; no questions, merging, movement or emergency attack. Speed affects combat only.
7. Surviving defenders heal, Earth retains damage, destroyed defenders stay lost. Repeat earning/preparation for the next wave. A defeat restores the failed wave's pre-battle checkpoint, with no duplicate rewards or repeated completed math.
8. Celebrate victory. If learning evidence is sufficient, one Continue button opens the next node. Otherwise retain the victory and offer targeted interactive practice, then fresh checks; permit leaving and returning without losing the victory.

Tower introduction is deliberately separated from the first explanation of a new math strategy:

| Mission | New strategic interaction | Encounter rule |
| --- | --- | --- |
| M01 | Pebble: aim down a lane | Scouts only; demonstrate a single lane before the real wave |
| M02 | Bricky: protect the shooter | Short familiar count-on practice first; show a safe blocking preview |
| M03 | Frost: buy time | Introduce one visibly fast Skater with a replayable demonstration |
| M04 | No new tower | Quiet familiar encounter while subtraction is introduced |
| M05 | Poppy: handle groups | Introduce a small Swarm after the familiar subtraction practice |
| M06 | Prism: break armor | Captain review contains no new math; teach Prism against one Helmet before the finale |

Unlocks occur on entering the relevant lesson and persist; introduced towers must be offered in a learnable form. A hard answer is not the only route to a required counter. Fallback after a mistake remains the weakest Pebble as agreed, so encounters must also be winnable with sensible weak-Pebble formations. Specialized roles should improve efficiency, coverage and survivability, not create an absolute lockout for struggling learners.

All three lanes remain visible throughout. Preview actual lane entries using alien portraits and a soft arrival marker. Early authored waves may leave lanes empty; do not switch lane counts mid-mission. No Hopper or wall-bypassing exception in the basics campaign. Captains combine familiar patterns and clear armor cues instead of surprise rules.

## 5. Hidden allowance and simple choices

Authoring defaults: three strength costs, 1/2/3, with a first-wave allowance of 6 and later-wave reinforcement allowances of 3. These are test fixtures, not confirmed balance. Give the same allowance regardless of selected question difficulty. Thus six weak rewards or two strong rewards can fill the opening budget. Award only actual fallback power after a mistake or reveal. Remove offers that exceed the remaining allowance; never silently downgrade a correct response because the budget ran out.

Offer preparation must account for spatial coverage: a two-tower opening cannot face simultaneous threats in three lanes unless the offered roles demonstrably cover them. Author early waves with at most two simultaneous active lanes, and verify every legal two-strong opening. Later allowances add coverage before three-lane pressure. Retain enough placement pads for all-weak totals across three waves (initial fixture: 15 pads, five per lane, maximum 12 earned defenders). Surviving defenders count toward board occupancy, not against the newly agreed reinforcement allowance.

Offer pools separate **role** from **strength**. A weak Prism is still an armor specialist; a strong Pebble remains a single-target shooter. The first six missions can restrict roles to simplify choices. All offers must remain within taught mathematical content. Use gentle labels such as “Familiar” and “Try a stretch” rather than branding a child easy/hard. Strength pips explain what will be earned without exposing the budget.

No free towers for idle waiting, kills or wave completion. Learning support is never withheld to preserve difficulty. There is no penalty timer. Do not claim equal point totals prove equal power; explicitly test damage coverage, tanking, control and cluster performance.

## 6. Teaching interaction and feedback scripts

Use a consistent friendly alien guide. Voice reads concise mathematical explanations at the child's pace; text and graphics carry the same meaning. Narration is optional, replayable and interruptible. Recorded human narration is the production preference; unreviewed robotic speech is not the finished teaching experience. Reduced motion uses static highlighted steps with the same meaning.

Example, 8 + 5: “Eight friends are here. How many spaces will fill the ship?” Let the child move two of the five into a ten-frame. Then: “Now ten are aboard, and three are waiting. Ten and three make thirteen.” Show 8 + 5 = 10 + 3 = 13 only as the visual steps occur. A hint stops before giving thirteen. A full explanation reveals it and receives the agreed weakest reward.

Example, 13 − 5: show thirteen; physically remove three, then two. Count all five departures so the intermediate ten is not mistaken for the answer. Example, sharing 12 between two: alternate placements into plates; the final answer refers to each plate, not the number of plates.

On a wrong answer: acknowledge calmly (“Let's look together”), identify the actual mathematical structure, provide one guided retry, then explain if needed. Do not falsely diagnose a misconception from a single wrong number; select a relevant demonstration and observe the retry. Do not use “easy”, failure buzzers, public accuracy rankings or lost progress messages.

Reward rules remain exactly as approved: correct first submission keeps the offered tower; a non-revealing hint preserves that reward but counts as supported; any wrong answer fixes the reward to the weakest tower even if the retry succeeds; requested full explanation also gives the weakest tower. Announce positively, “Pebble joins your team.” Do not imply the promised strong tower was earned after a reveal.

For visual story questions, numeric entry remains the response method; teaching interactions can involve tapping or dragging objects. Provide tap-to-select/tap-to-place alternatives to dragging, large touch targets, shape plus color cues, and no reading-only prerequisite.

## 7. Practice selection and honest progress

Persist records by fact, operation, question form and objective. Log first submission, hint use, full reveal, retry outcome and completion separately. Save each question ID once; resuming, retrying combat or reopening the shop cannot create extra evidence or rewards.

Initial practice mix after a concept's guided example: approximately 60% current objective, 25% earlier prerequisites needing practice, 15% previously learned review. These are tunable design defaults, not evidence-derived constants. M01 uses only its own taught objective. Never sample untaught operations or cross-ten facts early. Avoid immediately repeating the exact demonstrated answer as an independent check. A struggling child receives more modelling and related simpler examples; a confident child sees varied arrangements and missing-number forms only after those forms have been taught.

Initial lesson gate: three fresh independent successes on distinct items for the current objective, including two appropriate forms where introduced. Gather across preparation; do not impose extra tower purchases after the bucket is full. Wrong or supported answers do not erase earlier valid evidence. At least one check must reflect the objective itself, so success on old easy facts cannot unlock a new topic. This is a modest progression signal, not a mastery certificate. Evaluate the threshold with an educator and children.

Finales check the world's previously taught objectives. Reuse existing evidence but require at least one fresh independent transfer item; do not demand an exhaustive exam. Where insufficient, retain victory and launch the short targeted recovery flow already approved. Child can stop and return; no forced endless quiz.

Child-facing states: “Exploring”, “Practising”, “Getting confident”. No “mastered forever” badge. Revisit a successful topic in a later session and again after several sessions; exact intervals are adjustable. Delayed evidence can strengthen the confidence display, but a later mistake does not relock completed worlds. Calm practice presents the same models with no battle and no combat inventory rewards.

## 8. Menu, path and visual design

Home is a proper game menu: gently floating Earth, a friendly visiting alien, one large Play button, smaller Practice and Collection buttons, and Settings in a corner. Play resumes the current mission or opens the next path node. Additional modes live behind a single Adventures destination once available, not a row of disabled buttons. Space Club appears only when functional.

World path: six large nodes, distinct location silhouettes, a friendly Captain marker at the end, and a clear next destination. The selected node shows one lesson phrase and Play; no dense skill percentages. A small replay-teaching icon is available on completed nodes. Different world ornaments sit around the path, not behind combat lanes.

Battle: pale green field, three broad readable ribbons, Earth at left and arrivals at right. Restrained themed accents on edges preserve the field across worlds. Tower range appears only on selection as a lane segment. Projectile color and shape identify the source; impacts are brief and never cover an answer or lane entry. Earth becomes worried near danger and relaxes when safe.

Preparation shows the board, tower offers and one contextual instruction. The question panel replaces the offers, not the whole screen. Combat HUD shows hearts, wave count and Menu. Avoid finance-style cards, numeric power totals, paragraphs, persistent progress strips and brand clutter. Full-screen celebrations are short and dismissible; do not chain tower, enemy, reward and lesson popups.

Settings: narration, sound, reduced motion and profile; save preferences. Daily goal counts meaningful completed learning interactions including supported learning, with independent achievement recorded separately. Missing a day loses no combat power. Cosmetic rewards never modify statistics. Keep daily-goal reminders out of active teaching and combat.

## 9. Implementation contract and acceptance checks

Each authored mission needs: stable ID, world/order, prerequisite ID, objective IDs, taught representations, allowed numeric domain, offer roles, wave recipes, power allowances, teaching script, support script, check blueprint, unlocks and cosmetic result. Separate curriculum data, learner evidence, question generation, reward accounting, encounter simulation and presentation. Do not hard-code progression in screen handlers.

Generator checks: exhaustive small-domain validation; no negatives or zero divisors; subtraction operand order correct; missing-number answer matches its position; all examples and spoken steps agree; duplicates do not manufacture check evidence. Maintain dedicated checks for zero, equal operands, ten boundaries and division grouping versus sharing.

Combat checks: all-weak, few-strong and mixed formations on every mission; legal weak-only victory must exist; specialized mixed formations should have useful advantages without requiring harder math. Test all lanes, fallback outcomes, final-budget remainders, formation occupancy, healing, lost towers, checkpoint retry and no duplicate rewards. Snapshot comparison later requires identical encounters and reproducible simulation.

Flow checks: a new child can learn one question, earn and place a tower, launch and finish a wave without navigating unrelated pages. Save/reload during support, preparation and victory recovery preserves actual state. Check desktop and landscape touch layouts; no overlap at supported sizes, no required hover, no color-only instructions, and equivalent reduced-motion meaning.

Observe real play before calling the design finished in practice: can children explain what each action does; do they understand why a tower joined; can they follow lane danger; do hints improve the next fresh answer; are fallback-heavy sessions tiring; do weak/strong paths feel fair? Compare immediate and later fresh-item performance, not just game scores. Use educator review and appropriate consent for any child study. Simulation victories do not establish enjoyment or learning.

## 10. Delivery order

1. Complete M01 in Godot with real teaching, question-earned placement, one wave, retry and save.
2. Validate usability and mathematical correctness; revise without changing confirmed rules silently.
3. Complete M02–M06, five-role introductions, a polished menu/path and targeted practice recovery.
4. Add M07–M24 in tested world increments. Topic challenges use completed content only.
5. Add survival, then M25–M36 and friend snapshot PvP according to implementation capacity; these are separate deliverables, not prerequisites for the six-mission release.

The existing Godot foundation is not this completed campaign. This document completes the design sequence and implementation contract; assets, authored lessons, balancing and native gameplay still need production and verification.
