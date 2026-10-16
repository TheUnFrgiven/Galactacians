# Migration decision register

Created 11 October 2026. Design review completed 14 October 2026: all six final groups are accepted and Godot migration is authorized. The historical comparison table lists the original conflicts; the appended confirmed decisions take precedence. Unspecified tuning remains implementation/playtesting work. Recommendations that were not accepted are not confirmations.

Sources: current main (v2), the older desktop v2 snapshot, Claude's basics source and HANDOFF_FOR_CHATGPT.md, the earlier prototype and its audit in redesign-blueprint.md. The standalone Claude HTML duplicates its source build and adds no separate design.

## Material design differences

| ID | Decision | Alternatives found across versions or proposals |
| --- | --- | --- |
| 01 | Primary audience | Original 7–15 audience / Claude's 6–9 basics audience. Distinguish core audience from optional older-player challenge. |
| 02 | Core defense | Legacy Earth auto-defense / player-placed right-to-left lane defenses. A winding path was an original proposal, not a separate completed current game. |
| 03 | How math buys defenses | Energy wallet spent on chosen towers / solve the chosen shop card to receive its tower. |
| 04 | When math happens | Recharge during combat / math only in separate build phases. |
| 05 | Amount of math | Player requests questions as needed / three purchases before each of three waves (nine questions). |
| 06 | Passive resources and starter allowance | Old v2: 10 energy plus wave/kill income / main: 6 energy, +3 per solve, no passive income / Claude: no currency, buy opening towers through math. |
| 07 | Banking resources | Earlier persistent-wallet direction / mission-local resources / mission-local tower hand. |
| 08 | Answer input | Four answer choices / typed number pad. |
| 09 | Help timing | Hint at 10 seconds, reveal and resume at 20 / untimed, hint after first mistake and reveal after second. |
| 10 | Outcome after help | Unanswered reveal earns nothing and closes / type the shown answer to finish and receive a tower. |
| 11 | Cost of a mistake | Legacy population/streak penalty / v2 same energy reward after supported solve / Claude downgrades harder-card rewards to Pebble. |
| 12 | Math difficulty and tower strength | Independent comfort level and tower prices / Easy-Medium-Hard questions buy different tower tiers or levels. |
| 13 | Question presentation | Standard equations and text hints / pictures, ten-frames, equal groups and missing-number equations. |
| 14 | Selecting practice facts | Broad random operation questions at a chosen level / per-fact adaptive selection and review of earlier skills. |
| 15 | Wave starts | Earlier manual starts / current automatic countdowns / Claude manual starts after shopping. |
| 16 | Lane count | Five lanes throughout v2 / three lanes for the first mission in each Claude world, five thereafter. |
| 17 | Tower roster | Initial eight-shape concept / current five roles / Claude six roles including Magnet. |
| 18 | Tower unlocks | All five available immediately / four initially, Poppy and Magnet unlocked by wins. |
| 19 | Available purchases | Choose any affordable roster tower / three generated shop offers per purchase. |
| 20 | Tower placement flow | Purchase directly on a field pad / receive towers into a hand and place them later. |
| 21 | Upgrades | Fixed-strength towers / combine identical towers and levels up to level 3. |
| 22 | Move and recycle | v2 move between waves and recycle with phase-dependent refunds / absent in Claude. |
| 23 | Player combat power | Towers provide combat / Claude adds a lane-clearing Star Beam charged by first-try answers. |
| 24 | Alien roster | Five current enemy roles / six Claude roles including a tower-jumping Hopper. |
| 25 | Encounter design and pace | Explicit v2 spawn schedules and current speed controls / Claude seeded wave recipes, different combat stats, and saved 1×/2×/3× speed. Exact damage, health and timing values need retuning after the rules are chosen. |
| 26 | Onboarding | Small placement and threat cues / blocking tower, alien and spoken math teaching cards. |
| 27 | Campaign size | Current six missions / Claude 24 missions across six worlds / broader legacy curriculum plans. |
| 28 | Arithmetic scope | Comfort-based four-operation practice / bounded to-10 and 2/5/10 facts with make-10 / broader legacy curriculum. |
| 29 | Entry and progression | Sequential six-stop path starting at addition / Claude choice of starting skill followed by unit progression. |
| 30 | Calm Practice | Untimed practice available outside combat / absent in Claude basics. |
| 31 | Learning display | Operation-level activity and accuracy / per-fact stages and maps / legacy mastery/repair plans. |
| 32 | Experience rewards | v2 5 XP independent or 2 assisted / Claude tier-based 10/15/20, retry 5, shown 2, plus mission-star XP. |
| 33 | Streak protection | Streak resets after a missed day / Claude allows up to two freezes. |
| 34 | Daily goal | v2 five solves earn a daily cosmetic star / no matching daily-star mechanic in Claude. |
| 35 | Mission stars | Spendable cosmetic rewards for improved mission results / Claude mission ratings with XP but no cosmetic shop. |
| 36 | Progress export | v2 in-app records / Claude CSV answer-log export. |
| 37 | Battlefield art | Original/restored pale green / dark galaxy backgrounds in desktop and Claude versions. User previously requested pale green. |
| 38 | Range display | Earlier circles/large bands / current short lane marks / Claude highlighted reachable cells. |
| 39 | Combat HUD | Compact hearts, energy and wave status / Claude beam charge, wave progress and captain health bar / older dense dashboard. |
| 40 | Navigation and progress pages | Older sidebar and separate practice/progress / current Menu and combined Practice / Claude path, fact map and guide pages. User previously requested Menu and merged practice/progress. |
| 41 | Audio | Synthesized effects / Claude adds browser speech for teaching and events. |
| 42 | Phone layout | Current portrait-aware browser layout / Claude landscape-preferred layout / proposed landscape-first native combat. |

## Release and migration decisions, not existing gameplay conflicts

| ID | Decision | Choices to settle |
| --- | --- | --- |
| 43 | Initial release scope | Local playable chapter first / include accounts, friends, leaderboards and notifications. Existing prototypes do not deliver those online services. |
| 44 | Saved progress | Offer migration/import of old saves / preserve archives but start a fresh native profile. Current versions use incompatible save formats. |
| 45 | Platform priority | Windows and Android first with later iOS / other release order; decide whether browser sharing remains a requirement. |
| 46 | Engine and migration gate | Godot with typed GDScript is the recommendation; confirm the settled design and first complete-mission milestone before porting. |

## Corrections that should not be treated as design preferences

- Assisted answers must not be recorded as independent first tries.
- Looking at the board must not silently reroll shop offers.
- Rewards must not duplicate after rapid clicks or reloads.
- Question callbacks and listeners must end when their screen closes.
- Save reset must only remove this game's intended data.
- Balance simulations are not evidence of child enjoyment or learning effectiveness.

## Confirmed answers

- **01 — CONFIRMED:** Primary audience is **ages 7–12**. User answer: "7-12". This sets the core audience; arithmetic scope and difficulty remain separate pending decisions.

- **02 — CONFIRMED:** Right-to-left lanes with player-placed towers defending Earth (option A). User answer: "a". Lane count remains pending decision 16.

- **03 — CONFIRMED:** Choose a tower, solve its question, and receive that tower (option B), rather than earning energy to spend. User answer: "b". The later clarification under 05/11 specifies the weakest-tower fallback after a wrong answer. Opening allowance and offer details remain pending.

- **04 — CONFIRMED:** Math purchases happen only in build phases before/between waves (option B). User rationale: "that way we can have some auto battle elements, specially helpful for snapshot pvp battles later on". No math purchases during active combat. Snapshot PvP is a future design consideration, not approved initial-release scope. In-wave placement, abilities, wave-start rules, and build-phase timing remain separate pending decisions. Revisit the earlier 10/20-second help proposal in this build-phase context rather than assuming combat resumes at its deadline.

- **05 — CONFIRMED DIRECTION, DETAILS PENDING:** Neither fixed three purchases nor unlimited purchases. Use a behind-the-scenes cap and a restricted pool of offered towers. Easy questions give more weaker towers; harder questions give fewer stronger towers. User wants both routes to yield comparable team power and allow progression, with balance treated as a central requirement. Do not present a numeric budget to the player. Exact tower values, offer-pool rules, cap scope (per build phase or whole mission), carryover, and end-of-preparation feedback remain undecided. "Comparable total effective team strength" is the working interpretation of the user's "power level avg"; raw average per-tower strength cannot be equal when individual towers intentionally differ. Nominal points alone cannot guarantee parity because lane coverage, combinations, range, and enemy matchups matter.
- **12 — PARTIALLY RESOLVED BY 05:** Question difficulty affects tower strength and quantity. Harder answers should not automatically buy a stronger total team. Exact tiers and adaptation remain pending.

- **05 — CLARIFIED:** There is no best-of-three attempt limit. Each resolved question awards one tower, then the next question offers appear, continuing until the hidden power bucket is filled. A correctly solved hard question awards one strong tower; easier successes award weaker towers. Count the power of the tower actually awarded toward the bucket, including fallback towers, rather than consuming the originally offered strong tower's value after a mistake. The earlier two-strong/five-weak quantities were illustrative, not fixed limits. Cap scope and treatment of the final remaining budget are still pending.
- **11 — CONFIRMED FALLBACK, REDEMPTION DETAILS PENDING:** A wrong answer always leads to the weakest tower reward after a redemption attempt/support step, then moves on to the next question offers. A successful redemption does not restore the stronger reward. This supersedes the assistant's earlier recommendation to preserve the selected reward after mistakes. The exact redemption interaction, handling another wrong answer, and voluntary-hint treatment remain undecided. Record supported answers separately from independent successes.

- **11 — REDEMPTION CONFIRMED:** Option A: after the first wrong answer, teach with a hint and allow one retry of the same question. If still wrong, show the worked explanation and award the weakest tower, then continue. The weakest-tower fallback applies even when the retry succeeds, as previously clarified.
- **13/26/41 — TEACHING DIRECTION CONFIRMED, IMPLEMENTATION PENDING:** User explicitly wants child-friendly teaching that explains the reasoning, preferably with animations and voice-overs and actual interaction, avoiding robotic help. Treat this as a guided explanation of the specific operands/concept, not a canned praise message or answer reveal. Visual/interactive examples and natural narration are the preferred direction; exact interactions, voice production method, and accessibility controls remain design/implementation choices to settle. No claim of educational effectiveness without evaluation. Do not assume the old timed dismissal may cut off the teaching; timing remains pending under decision 09.

- **05 — CAP SCOPE CONFIRMED:** Option A: a fresh hidden reinforcement allowance applies before each wave. User answer: "a". This confirms the allowance scope only; it does not establish equal numeric allowances for every wave, whether surviving towers persist, or whether the allowance compensates for lost towers. Those balance details remain pending.

- **06 — CONFIRMED:** Option A: earn all opening towers through questions; no free starter team. User additionally requests a default guided tutorial that actively supports the player through the initial stage, gives everyone a good starting foundation, and then releases them to solve problems and make decisions independently. Do not interpret tutorial support as overriding the weakest-tower fallback or counting helped answers as independent. Exact tutorial length, offered towers, and placement guidance remain to be designed.
- **26 — ONBOARDING DIRECTION CONFIRMED:** Teach through a guided opening sequence with gradually reduced support. This is initial onboarding, not a request to force the full tutorial before every mission. Replay/skip behavior remains undecided. The user's phrase "asses their buckets" does not establish a diagnostic scoring formula or permission to expose the hidden numeric power budget.

- **07 — DEFERRED TO MODE-SPECIFIC DESIGN:** User rejects choosing one persistence rule for the entire game. Discuss each mode individually before deciding whether earned towers carry over. No global fresh-team or permanent-roster rule has been approved.
- **PRODUCT MODES — CONFIRMED VISION:** (1) A mission-based track guiding players through a teaching curriculum; (2) challenges after that learning to assess progress; (3) survival/infinite play with scores based on how long players last; (4) PvP comparing the player's performance/answers with another player's. User also wants score tracking, leaderboards, achievements, daily goals and related progression. Exact assessment meaning, curriculum/challenge unlock gates, PvP comparison mechanics, persistence and scoring are undecided. Earlier snapshot-PvP interest remains relevant but does not by itself settle all PvP rules. These features are confirmed product goals; initial-release scope and delivery order remain pending decision 43.
- **REVIEW PROCESS UPDATED:** Discuss curriculum missions, then challenges, then survival/infinite, then PvP individually. Set each mode's team lifecycle, learning purpose, progression and scoring before assuming one shared rule. Retain earlier agreed core direction (ages 7–12, lane defense, question-earned towers, between-wave questions, hidden power buckets, supported redemption and guided onboarding); mode-specific exceptions require an explicit choice. Power-bucket parity versus survival scaling and PvP scoring remains a design dependency, not an already solved balance claim.

- **07 / CURRICULUM — CONFIRMED:** Each curriculum mission starts with a fresh team earned through its questions. Learning progress and unlocked tower types persist across missions; individual earned towers do not. User accepted the recommendation: "go with your reccomendation". This choice applies only to curriculum mode; challenge, survival and PvP persistence remain undecided.

- **CURRICULUM / BETWEEN WAVES — CONFIRMED:** Option A: surviving towers remain on the field between waves, and newly earned reinforcements are added during each build phase. User answer: "a". Earlier placement choices continue to matter. Each fresh hidden allowance must be balanced in the context of the growing team; no specific compensation formula is approved. Healing, destroyed-tower replacement, and repositioning remain separate pending decisions.

- **CURRICULUM / HEALING — CONFIRMED:** Option A: surviving towers automatically return to full health between waves, with no separate repair task. User answer: "a". This does not resurrect destroyed towers or restore Earth's health; those rules remain undecided.

- **CURRICULUM / DESTROYED TOWERS — CONFIRMED:** Option A: destroyed towers remain lost. Replacement towers must be earned through questions using the next wave's normal hidden reinforcement allowance; losses grant no additional recovery allowance. User answer: "a". Surviving towers still heal fully as previously confirmed.

- **CURRICULUM / REPOSITIONING — CONFIRMED:** Option A: surviving towers can be moved freely during preparation between waves. User answer: "a". Repositioning does not consume the hidden reinforcement allowance. Combat-time manipulation and recycling remain undecided.

- **CURRICULUM / ACTIVE-WAVE FORMATION — CONFIRMED:** Option A: the prepared formation is locked during active waves and combat resolves automatically. User answer: "a". No moving existing towers or placing held towers during combat. Math purchases remain limited to preparation. Special abilities are not settled by this choice; other modes' combat interaction rules remain pending.

- **15 / CURRICULUM / WAVE LAUNCH — CONFIRMED:** Option A: the player presses Ready after earning towers and arranging the team at their own pace. User answer: "a". No forced preparation countdown in curriculum mode. This supersedes the earlier automatic wave-launch preference for this mode; other modes remain pending.

- **CURRICULUM / EARTH HEALTH — CONFIRMED:** Option A: Earth's damage carries between waves within a curriculum mission. Earth starts each new mission fully healed. User answer: "a". Surviving towers still heal fully between waves under their separate confirmed rule. Failure/retry behavior remains pending.

- **CURRICULUM / DEFEAT AND RETRY — CONFIRMED:** Option A: retry the failed wave rather than restart the mission. Restore the team (including earned reinforcements) and Earth's health to their pre-wave state, then allow rearrangement before Ready. Completed math does not need to be repeated. User answer: "a". Restore checkpoint state rather than awarding towers again; retries must not duplicate rewards or learning progress. Additional assistance after repeated defeats remains undecided.

- **23 / CURRICULUM / ACTIVE ABILITIES — CONFIRMED:** Option A: fully automatic combat in the initial curriculum version, with no player-triggered rescue or special ability. User answer: "a". Strategy centers on earning towers and arranging the formation before Ready. Other modes' interaction rules remain pending.

- **09 / CURRICULUM / QUESTION TIMING — CONFIRMED:** Option A: no forced answer timer. Allow thinking time, offer help after a delay, and let the player request an animated explanation. User answer: "a". An offer of help does not automatically reveal the answer or dismiss the question. Wrong answers still follow the confirmed teaching-and-one-retry flow. This supersedes the earlier 10-second hint/20-second forced-answer rule for curriculum mode. Exact help-offer delay and other modes' timing remain pending.

- **11 / CURRICULUM / VOLUNTARY HINT REWARD — CONFIRMED:** Option A: requesting a hint that does not reveal the answer preserves the offered tower when the first submitted answer is correct. User answer: "a". Record the response as supported learning, not independent success. A wrong submitted answer still triggers the previously confirmed weakest-tower fallback and redemption flow. Full worked-answer reveals are not covered by this choice.

- **11 / CURRICULUM / REQUESTED WORKED EXPLANATION — CONFIRMED:** Option A: when a child requests a full guided explanation that reveals the answer, complete the explanation, award the weakest tower, and move forward without requiring a fresh similar question for that reward. User answer: "a". Record this as supported learning, never independent success. Count only the actual awarded tower's power toward the hidden bucket, as previously confirmed.

- **08 / CURRICULUM / ANSWER INPUT — CONFIRMED:** Option A: enter numeric answers using large on-screen number-pad buttons or a physical keyboard, then explicitly submit with Check. User answer: "a". Guided tutorials and explanations can still use interactive visual objects. Other modes' answer input remains pending.

- **14 / CURRICULUM / QUESTION SELECTION — CONFIRMED:** Option A: each mission has a defined teaching topic, with practice adapted to revisit facts the child struggled with or needed help on. User additionally requires teaching to follow verified online educational evidence as closely as practical. Adaptation stays within the lesson and preserves the balanced hidden tower-power budget. Exact scheduling, progression thresholds and curriculum gates remain pending.
- **EDUCATIONAL EVIDENCE REQUIREMENT:** Ground instruction in established evidence reviews and document sources and the limits of their application. Sources checked 2026-10-14: IES/What Works Clearinghouse, Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades (2021), https://ies.ed.gov/ncee/wwc/practiceguide/26 ; EEF, Improving Mathematics in Key Stages 2 and 3, https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3 . Apply systematic explanations, clear mathematical language, purposeful concrete/visual representations and assessment-informed practice. These sources support teaching principles, not validation of Galactacians, its exact adaptive algorithm, or its tower reward/downgrade economy. Keep supported responses distinct from independent evidence of learning; assess game-specific learning outcomes through later evaluation.

- **29 / CURRICULUM / PROGRESSION GATE — CONFIRMED:** Option B: unlocking the next curriculum lesson requires both winning the mission and completing a short independent learning check. User answer: "b". If the child needs support, provide teaching and another opportunity to demonstrate learning independently. A supported response does not satisfy the independent check. Exact check length, success criteria, retry presentation, and whether independent evidence can be gathered during normal play remain pending; do not claim a brief check proves lasting mastery.

- **29 / CURRICULUM / CHECK PLACEMENT — CONFIRMED:** Option A: gather independent learning-check evidence within normal tower preparation, while questions still earn towers. User answer: "a". If support is needed, teach and later check with a fresh question; supported answers do not count as independent evidence. No routine separate post-victory quiz. Exact evidence thresholds and recovery when a mission is won without sufficient independent evidence remain pending. Do not exceed the hidden tower-power budget to collect extra evidence.

- **29 / CURRICULUM / LEARNING RECOVERY AFTER VICTORY — CONFIRMED:** Option A: preserve the mission victory when independent learning evidence is insufficient. Offer a short interactive targeted practice activity with fresh questions to complete the learning requirement and unlock the next lesson; no battle replay is required. User answer: "a". This is conditional recovery, not a routine post-victory quiz. Keep supported teaching distinct from independent checks and avoid duplicate victory rewards or excess tower rewards. Exact evidence thresholds remain pending.

- **28 / CURRICULUM / INITIAL OPERATION SCOPE — CONFIRMED:** Option A: addition and subtraction for the first playable release; multiplication and division follow later. User answer: "a". Build and test a smaller polished teaching journey first. Audience remains ages 7–12; this scope does not imply coverage of the full age-range school curriculum. Numeric bounds and lesson sequence remain pending.

- **28 / CURRICULUM / INITIAL NUMBER RANGE — CONFIRMED:** Option A: begin addition and subtraction within 10, then gradually extend to within 20, with no negative answers. User answer: "a". This explicitly extends the original single-digit direction. Exact lesson sequence, introduction of strategies such as making ten, and progression criteria remain to be designed using the recorded educational evidence requirement.

- **29 / CURRICULUM / STARTING LESSON — CONFIRMED:** Option B: everyone starts at lesson one after the shared guided tutorial and follows the curriculum sequence. User answer: "b". No placement activity that skips players to later lessons. Practice still adapts within each lesson, and the confirmed victory plus independent-learning requirement governs progression.

- **27 / CURRICULUM / INITIAL CAMPAIGN SIZE — CONFIRMED:** Option A: one polished introductory chapter of six missions for the first playable curriculum, then expand after testing the teaching and battle loop. User answer: "a". This is not complete arithmetic coverage or approval of other modes for the initial release. Follow the confirmed addition/subtraction scope within 10, gradually extending to 20; exact lesson mapping and practice volume remain to be designed and evaluated.

- **CHALLENGES / PURPOSE AND STARTING TEAM — CONFIRMED:** Option A as presented to the user: challenges combine math and defense strategy. Earn a fresh team through questions, then attempt a designed battle. Track independent math performance separately from battle results so combat success is not treated as proof of learning. User answer: "a". Challenge unlocks, scoring, help rules, retry behavior and initial-release scope remain pending.

- **REVIEW PROCESS — GROUPED DECISIONS:** Finish the review through six recommended decision groups, accepting or adjusting each before migration. Group 1 covers challenges; later groups remain unapproved until discussed.
- **CHALLENGES / GROUP 1 — PROVISIONALLY ACCEPTED:** User: "accept for now, seems good until gameplay proves otherwise". Unlock challenges after their relevant curriculum lessons. Each attempt starts with a fresh question-earned team and a balanced hidden power budget. Use a fixed enemy encounter so players can improve formation decisions across attempts. Keep questions untimed with curriculum teaching support and tower-reward rules. Display battle results separately from independent math results. Allow unlimited retries; helped answers count as supported learning, not independent successes. This is the working design, subject to gameplay testing; it does not establish exact scoring formulas, question sequences, or release scope.

- **SURVIVAL / GROUP 2 — ACCEPTED:** User: "seems good". Start each run with a fresh question-earned team. Surviving towers persist between waves, heal fully and can be rearranged; Earth's damage persists. Earn reinforcements between waves through untimed questions with the same teaching and reward rules. Each wave has a defined hidden reinforcement budget; enemy difficulty gradually outpaces reinforcement growth. Press Ready to launch each wave, then combat is automatic. Score primarily by waves cleared, with progress against enemies as a tiebreaker, never math-answer speed; track learning separately. Defeat ends the run, preserves the personal best and requires a fresh team next run. Exact escalation, budgets and enemy-progress scoring require design and playtesting.

- **SNAPSHOT PVP / GROUP 3 — ACCEPTED:** User: "so far so good". Asynchronous defense duels: each player earns a fresh team through math and saves a formation; both formations face the same alien attack automatically, using the same tower pool and hidden power allowance. Compare waves survived, then enemies stopped, then remaining Earth health; exact ties are draws. Questions remain untimed with teaching available. Math difficulty changes tower strength and quantity, not the total power allowance. Track independent learning separately from the winner calculation. Players can watch both defenses and build a new formation for a rematch. Begin with friend challenges; public matchmaking and ranked leaderboards follow balance testing. This sets PvP direction, not inclusion in the first playable release. Exact encounter duration, reinforcement rules, reproducible simulation, scoring normalization and fairness across formations require design and testing.

- **BATTLEFIELD AND TOWERS / GROUP 4 — ACCEPTED:** User: "all yes". Begin with three right-to-left lanes; expansion to five depends on playtesting, not an automatic progression rule. Five roles: Pebble/circle reliable single-target damage; Prism/triangle slow armor-piercing shots; Bricky/square blocking and protection; Frost/diamond slowing; Poppy/pentagon splash damage against clusters. Include visibly distinct fast, armored and swarm enemies to motivate varied defenses. Stronger rewards improve the tower's existing role; no merging or upgrade menus initially. Place earned towers and freely rearrange during preparation; preview the next wave's enemy types before Ready. Use a calm pale-green background with clearly separated softly colored lanes, keeping decorative motion away from gameplay information. Display range only for selection/placement by highlighting the affected lane section; use clear projectile trails and brief hit effects. Animate Earth and show worry when aliens approach. Use a compact battle HUD and navigation behind Menu. Exact stats, role-preserving reward tiers, collision/targeting and effective-power parity require implementation design and playtesting.

- **PROGRESSION AND HUB / GROUP 5 — ACCEPTED WITH MENU REFINEMENT:** User: "sounds good but i want a proper menu and good clean child friendly design and preferably animated with cute things". Provide a proper child-friendly game menu with large clear controls, minimal text, cute characters and gentle animation; Adventure remains the prominent play destination, rather than assuming the mission path must itself be the entire home screen. Introduce the five tower types through early missions with guided demonstrations; unlocked types persist. Combine practice and learning progress in one area. Provide a small daily learning goal and optional streak, with no loss of earned progress or combat power for missing a day. Achievements recognize learning, strategic exploration and mode completion while distinguishing supported learning from independent achievements. Earned stars buy cosmetics only, never combat strength. Space Club hosts friends and mode-specific scores as those modes become available; notifications optional and in-app initially. Compact settings cover sound, narration, reduced motion and profile. Remove filler text and corporate-style panels. Keep decorative animation subordinate to clear navigation and support reduced motion. Exact visual layout and reward/unlock pacing need design and testing.

- **TECHNOLOGY AND DELIVERY / GROUP 6 — ACCEPTED:** User: "good". Rebuild in Godot with typed GDScript around this approved design. Landscape layout supports touch and mouse from the beginning. First deliver one polished playable mission including tutorial, interactive math teaching, tower rewards, preparation, automatic combat, retry and saving. Then expand to six curriculum missions with a clean animated game menu, combined practice/progress and basic daily goals. Add challenges, then survival, then friend snapshot PvP, validating each stage. Test Windows first, then Android and iPhone; iPhone builds require macOS and Xcode. Preserve existing prototypes as references and document the new project on GitHub for laptop continuity.

Design review complete: all six grouped decisions are accepted. Migration is authorized. Remaining numeric tuning and implementation details are engineering/playtesting work, not grounds to restart the preference questionnaire. Accepted rules remain subject to explicit user changes and gameplay evaluation.

Next implementation milestone: establish the Godot project alongside the preserved web prototypes and deliver the first complete curriculum mission. Do not describe the migration as implemented until the project has been built and verified.

## Curriculum design elaboration — 14 October 2026

Latest user visual direction (implemented 16 October): use Claude's levels/curriculum,
ChatGPT's gameplay feel, and clean cute art informed by both browser versions. Replace
geometric tower bodies with floating astronauts; preserve the five role mechanics and
shape badges. The approved math/preparation rules remain in force. Six opening missions
are now playable; the complete 36-mission plan remains staged design beyond them.

User requested the full basic-teaching progression grounded in curriculum, simpler understandable gameplay and the stronger Claude level structure. `curriculum-game-design.md` supplies the resulting working specification: six themed worlds of six missions, with the first six remaining the initial release. The authoring plan extends addition/subtraction through mission 24, then equal groups and sharing through mission 36. To preserve prerequisite teaching, the first chapter stays within 10, with the progression to 20 in the later addition/subtraction worlds. This is an explicit design refinement of the earlier initial-release number-range wording, not a claim the user separately approved every new threshold. Numeric check gates, budgets, wave counts and later content are design defaults requiring educator review and playtesting. The core confirmed reward, help, retry and preparation rules remain unchanged. Existing native implementation is only the foundation; the full design is not yet implemented.
