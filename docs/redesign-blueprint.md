# Galactacians: Earth Patrol

Design blueprint · updated 7 October 2026

## The game we are building

A cheerful lane-defense game in which children build a team of geometric towers to protect a slowly rotating Earth. Cute aliens arrive from the right across five lanes. Tower placement, combinations, and timing decide the battle. Short arithmetic breaks recharge the resources used to build the team.

The first release explores arithmetic fluency for ages 7–15. It is not a complete curriculum for that age range. Older learners may enjoy the strategy while reviewing facts; they must not be assigned easier or harder mathematics solely by age. The broader curriculum in the previous project remains reference material for a later, separately validated learning progression.

**Core promise:** “Make a plan. Power it with math. See your team save Earth.”

This document describes the target and its testable assumptions. The local playable prototype is a vertical slice, not evidence of educational effectiveness or a completed online service. Balance numbers and pacing targets need child playtesting.

## What the previous prototype teaches us

The audit used `PROJECT_MEMORY.md`, `README.md`, `script.js`, `src/menu/main-menu.js`, and the existing education design documents. The following are code-backed observations; their effect on enjoyment is a hypothesis, not a user-study finding.

| Observation in the old project                                                                                                                                                                       | Likely design consequence                                                                                                                          | New direction                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applyCampaignCorrectAnswer` both increases automatic planet upgrades and calls `destroyCampaignEnemiesForCorrect`. The player does not place defenses.                                              | Solving the question controls most of the outcome; the battle can feel like a reward animation around a quiz.                                      | Answers produce one understandable resource. The player decides which tower to buy and where it belongs.                                          |
| Campaign wrong answers remove 20% Population and reset the answer streak. Repeated mistakes can open repair. Meanwhile, campaign combat has a protected health floor through `getPlanetSafetyFloor`. | Learning mistakes carry the serious consequence while the visible battle has limited stakes. Children may read the population loss as their fault. | Aliens damage Earth's shield. Arithmetic mistakes invite explanation and retry, with no shield, energy, star, or daily-streak penalty.            |
| Health, shield, Population, timer/progress, upgrades, answer streak, mastery, and theme unlocks coexist. A correct answer affects several of them.                                                   | Cause and effect are difficult to explain, and rewards compete for attention.                                                                      | Battle shows shield, energy, wave and selected tower. The hub shows daily activity, practice progress and cosmetic stars. Each has one job.       |
| The menu exposes flat Campaign/Stats/Missions/Achievements panels. Music/SFX sliders have a mixer TODO; settings start from fixed values. Theme rewards depend on an answer streak.                  | The shell promises an app but does not form a reliable daily learning loop. Controls can look functional without affecting play.                   | One consistent hub routes to a mission, practice, progress and collection. Store real preferences and mark unfinished online features explicitly. |

Useful ideas to retain: Earth as an emotional anchor; friendly enemies; same-question retries; skill-specific hints; short missions; a route map; keyboard support; local progress; and a calm practice option. Preserve the legacy build separately so its work is inspectable and its saves are not silently reinterpreted.

## Choose lanes for the first game

Use five horizontal lanes, Earth at the left, and alien entry at the right. Every tower occupies one placement space; the underlying grid stays visually quiet. Towers face right. Earth does not fight automatically: the player's team provides defense. A shared shield connects all five lanes to Earth so a leak has a visible destination.

This layout makes lane coverage, front/back placement and tower combinations easy to read. A winding path would add range circles, turn geometry and placement ambiguity before the learning loop is proven. Keep a pathway mode as a later experiment with the same tower roles, not a second ruleset in the initial tutorial.

Earth's continents rotate slowly beneath a stationary, friendly face. Its face turns worried when a live alien enters the first two columns and relaxes when that danger clears. Light orbiting stars and a soft atmosphere provide life without covering the board. Reduced-motion mode removes decorative movement and uses restrained, brief combat feedback. Defeated aliens retreat or pop into harmless stardust; there is no gore.

## Exact mission loop

1. **Play:** the home screen offers one obvious Defend Earth button and a small mission route. There is no permanent sidebar or brand bar competing with the game. Six missions increase tactical difficulty independently of math level.
2. **Build:** every attempt starts with six mission energy. In an uncompleted first mission, a short cue highlights two useful pads and waits for the first placement before the eight-second countdown starts. Later missions start the countdown on entry. Pick one of five defenders and tap a pad; hovering, keyboard focus, or touch shows a short range mark on the affected lane(s). Amber entry arrows count down the next three seconds before an arrival in that lane.
3. **Defend:** aliens float from right to left. Towers act automatically, but location and enemy matchups determine their value. A rapid shooter cannot efficiently solve an armored wave, and a heavy armor breaker cannot efficiently solve a swarm.
4. **Recharge:** one optional arithmetic question pauses the simulation. After ten seconds, show its hint automatically. After twenty seconds, show the worked answer over the battlefield and resume play. A correct answer grants three energy and returns to combat after a short 750 ms success cue. No extra Continue button is required. An unanswered reveal is help, not a recorded correct answer or a currency reward.
5. **Keep moving:** allow recharge again after three seconds of active play. Kills and wave clears grant no energy. Reposition or recycle during the five-second build window, then use a solved question when a planned reinforcement is worth the interruption. The next wave launches automatically; there is no repeated Start wave gate.
6. **Finish:** surviving all three waves earns mission stars; defeat offers a fresh attempt. Show a short result, then let the player choose to continue. A new mission does not start without that choice.

The arithmetic pause freezes movement, projectiles, damage, tower cooldowns and wave countdowns. There is no standalone tactical Pause button. Menu and hidden-tab suspension protect real interruptions; they are separate from the bounded math break. The recharge cooldown advances during active combat and build countdowns, but stops while the simulation is suspended. Calm Practice remains an untimed alternative, with three-question sets that advance automatically 1.2 seconds after a correct answer.

## Five distinct tower concepts

These are gameplay silhouettes, not final character art. Shape, name, effect and text identify a role; color adds recognition. All five are available from the start. The earlier eight-tower catalog has been reduced: Zippy, Sunny and Halo are removed from the active roster rather than hiding extra mechanics behind similar-looking cards.

| Shape    | Tower  | Cost | Observable role                                                      | Placement decision                                                                                |
| -------- | ------ | ---- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Circle   | Pebble | 2    | Rapid, short-range single-target shots. Armor strongly resists them. | Cover scouts and fast skaters; place forward enough to use its range.                             |
| Triangle | Prism  | 3    | Slow, long-range heavy beam that ignores armor.                      | Answer armored visitors from a protected position; rapid small crowds can overwhelm it.           |
| Square   | Bricky | 2    | Durable wall, contact damage, and partial damage reflection.         | Hold visitors inside a shooter's range; blocking alone does not provide efficient lane clearance. |
| Diamond  | Frost  | 3    | Low-damage chill affecting nearby aliens across three lanes.         | Cover several busy lanes from a central position and buy damage dealers more firing time.         |
| Pentagon | Poppy  | 4    | Slower area blasts including nearby lanes.                           | Cover clustered swarms; an isolated armored target is a poor use of its cost.                     |

Enemy variety supplies the reason to mix roles: scouts, fast skaters, tiny swarms, armored visitors, and a heavier captain. Silhouettes, scale, animation and readable defenses should communicate those differences. Keep armor and slowing effects visible. More tower types and complex upgrades wait until these five create understandable choices.

Do not claim that the game is balanced merely because each tower has distinct code. Tests should demonstrate the intended counter matchups, then observed play should check whether a single repeated build still wins too easily.

Armor now reduces ordinary damage by 70%, while Prism ignores it. Blocking and focused fire remain viable alternatives. Two equal-budget first-mission builds achieve full-health wins: beam and area control, or rapid fire with blockers and splash damage. The latter uses neither Prism nor Frost.

Each mission has three authored waves in `encounters.js`: first contact introduces scouts, armor and groups; Moon mail emphasizes outside-lane speed; Ring road shifts neighboring lanes; Sharing space concentrates crowds; Cosmic mix combines protected convoys and edge traffic; Homecoming relays traffic from the edges to the center. Warnings and threat previews come from those actual spawn schedules.

The combat background returns to a calm pale green field with separated horizontal ribbons. Decorative nebulae and star streams are hidden behind gameplay. Pebble shots, long Prism bolts and Poppy bubbles have distinct silhouettes; chill and splash use restrained rings at the affected position. Armor outlines, frost marks and contact markers make enemy status visible. Range previews use short blue lane-aligned marks during placement or inspection, so they explain direction without covering the board in boxes.

## Economy and pacing

**Energy** buys defenses within the current mission attempt. Spending, refunds, and battle answers update that attempt only. **Stars** buy cosmetics. **Practice records** describe learning activity. **Streaks** count returning to arithmetic on consecutive days. Each reward needs a visible cause.

Every mission and retry starts at six energy, enough for a small opening formation. Historical wallet balances are preserved in saved data but do not fund attempts. A correct battle answer, including one solved after a hint, grants exactly three mission energy once. Practice grants XP and saved learning progress. Five solved questions grant one cosmetic star per local practice day, with a persisted claim flag. Showing a solution at the battle deadline grants no energy, XP, solved-answer count, daily star or streak progress.

The battle economy has no passive recharge. This gives arithmetic a concrete job: a correct answer funds the next meaningful tower choice, while the six-energy opening allowance lets a player act before needing help. There is no passive generator tower in the five-role roster.

| Event                      | Current pacing rule                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Enter a mission            | First mission waits for initial placement, then eight seconds to build; later missions start that countdown on entry |
| Clear an intermediate wave | Five seconds to build before the next wave                                                                           |
| Open battle math           | One question; hint at ten seconds; solution and return at twenty seconds                                             |
| Solve battle math          | Three energy and automatic return after 750 ms                                                                       |
| Reopen battle math         | Three seconds of active play must pass first                                                                         |
| Calm Practice              | Three untimed questions; automatic advance after 1.2 seconds                                                         |
| Finish a mission           | Player chooses the next action                                                                                       |

These are prototype parameters, not established learning requirements. Test whether eight seconds is enough for a new player to understand placement and whether the twenty-second support feels helpful rather than hurried. Never subtract health, energy, stars or streaks for an arithmetic mistake. Calm Practice is available for learners who want more thinking time.

**Remaining balance questions:** the fixed allowance prevents practice hoarding or a previous loss from deciding a mission. Players can still earn additional energy with battle math, separated by three seconds of active play. Observe whether players use this to support a plan, whether five-second build windows allow useful repositioning, and whether multiple builds remain viable beyond the tested examples.

## Arithmetic and learning records

Begin with small-number addition and nonnegative subtraction. Offer multiplication facts, exact division and mixed review. Division generated from single-digit factors may use a two-digit dividend, such as 12 ÷ 3; Starter division instead keeps the dividend within a single digit. Never generate zero divisors or unintended fractions.

Hints should describe the actual operands and a useful strategy: combining or removing dots, equal groups, or sharing. A wrong answer stays on the same question and reveals support. In battle, the ten- and twenty-second support deadlines do not reset when the child retries or requests a hint. Closing the question cleans up its timers so they cannot affect another dialog.

The prototype separates independent first-try correctness from eventual supported success. Both solved answers earn the same energy; an automatic solution reveal earns nothing. Existing XP distinguishes independent answers (5 XP) from supported answers (2 XP). Observe whether that distinction discourages asking for help before retaining it. Neither solved questions nor a high first-try percentage are a validated mastery certificate.

Math comfort level and tactical difficulty remain separate. Age alone is not a level selector: ages 7–15 span very different arithmetic and gaming experience. The current scope is fact practice, not the full curriculum for that range.

The [EEF mathematics guidance](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3) informed the earlier design's use of specific feedback and representations. These are teaching principles, not evidence that Galactacians improves attainment. The new timed battle support is a gameplay choice requested during design; it still needs learner observation and educator review. Longer explanations and future review sequences belong in Practice rather than interrupting every wave.

## A small game shell

Use one global **Menu** button. It opens a small navigation dialog, with a gently floating alien mascot and clear destinations. No persistent sidebar, repeated marketing footer, motivational callout strips, or settings tip column. The home screen presents the animated world and the next playable action. The battlefield owns most of the mission screen.

| Destination | Job                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adventure   | Play the next mission or revisit an unlocked mission.                                                                                                 |
| Towers      | Inspect the five roles and their costs.                                                                                                               |
| Practice    | Choose an operation, play an untimed set, and see the same operation's actual local practice record. This replaces the separate Progress destination. |
| Star shop   | Spend mission stars on Earth colors. No paid power, loot boxes, or answer advantages.                                                                 |
| Settings    | Change nickname, sound, motion, in-app reminder preference, and math level. Keep only short functional labels and a local-save note.                  |

Old `#progress` links lead to Practice. Friends and rankings are hidden from the active navigation until they have meaningful implemented behavior; old friends links return home. This revision does not implement accounts, real friends, invitations or online rankings.

A daily streak counts a solved arithmetic question on consecutive local calendar days, including a hint-assisted solution. Combat alone and automatic answer reveals do not extend it. Repeated same-day play does not add days. A missed day does not erase mission or practice progress. [Duolingo's streak redesign](https://blog.duolingo.com/improving-the-streak/) inspired separating a small return habit from a larger optional daily goal; its retention results do not establish outcomes for this game.

Reminders currently show the daily practice goal inside Menu. No push notification or background delivery is implemented. Real notifications, private accounts, invite-only social features, moderation and parent controls belong to a later production service.

## Platform decision

Keep the JavaScript simulation and current browser prototype while the loop is changing. The renderer, arithmetic, save logic and content are already local modules and do not require a remote service to play. Changing language alone would not improve the strategic choices, pacing or screen design the user is asking to fix.

The planned packaging route is:

- **iOS and Android:** [Capacitor](https://capacitorjs.com/docs) can wrap an existing JavaScript app and expose native functionality through plugins.
- **Windows:** [Tauri](https://v2.tauri.app/) can package an existing web frontend in a desktop application.

This is a delivery direction, not a claim that native builds exist. No native runtime, installer, signing configuration, store submission or physical-device validation is delivered by this revision. Before packaging, verify sustained combat frame rate on representative phones, touch targets, small-screen layout, audio lifecycle, background/resume behavior and durable save migration. Then add platform adapters without duplicating game rules. Reassess the rendering technology only if measured device performance or required features justify it.

## Validation and release gates

Engineering checks should cover valid arithmetic, reward deduplication, no passive reward on revealed answers, exact math-support deadlines, timer cleanup, active-play recharge cooldown, automatic wave transitions, armor counters, area effects, safe refunds, mission outcomes, saved preferences, route aliases, keyboard use and mobile layouts. Pauses and reduced motion must remain intentional and predictable.

The current gameplay suite verifies two different full-health first-mission builds at sixteen total energy, successful route-specific defenses for all six missions from six starting energy with math-funded reinforcements, a starter-only loss without passive energy, accurate lane warnings and range marks, touch placement, safe retries, and saved daily rewards. These are reproducible examples of intended counterplay, not proof that every formation is balanced. The [player observation guide](playtest-guide.md) covers the remaining human playtest.

Observed play should answer concrete questions:

| Question                                                  | Evidence to look for                                                                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Can a child start without reading a page of instructions? | First placement, understanding of the countdown, and misclicks.                                                                        |
| Are all five roles useful?                                | Why each tower was chosen; results of varied and repeated single-role formations.                                                      |
| Does math fuel an intended action?                        | Whether earned energy is spent on the planned defense.                                                                                 |
| Does timed support feel helpful?                          | Reactions to the hint and solution, abandoned questions, and preference for calm Practice. Response time alone does not prove boredom. |
| Is the game enjoyable enough to return to?                | Voluntary replay and the child's explanation, without adding pressure from streaks.                                                    |
| Does practice support later recall?                       | An educator-led comparison using fresh matched facts after a delay; in-game completion alone cannot answer this.                       |

Begin with formative sessions across the age range and different arithmetic confidence, with appropriate caregiver permission. They can reveal usability problems, not justify general learning claims.

**Now:** five differentiated defenders, automatic three-wave flow, bounded one-question battle recharge, expressive Earth, floating aliens, global Menu, combined Practice and progress, local saves and cosmetics.

**Next:** observe and tune the loop, review questions and hints with an educator, improve manipulation-based support, test real touch devices, and preserve complete battle state across an interruption if that becomes a requirement.

**Later:** native packaging, reviewed fact progression and delayed review, durable account sync, private social play and actual opted-in reminders. Preserve the old project and its separate save key throughout.
