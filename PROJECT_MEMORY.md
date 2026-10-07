# Galactacians Project Memory

## Current direction — 7 October 2026

The active implementation is `index.html` and `src/v2/`, served by `npm start` at `http://127.0.0.1:8088/`. `README.md` and `docs/redesign-blueprint.md` are the current handoff. The user now prioritizes a readable game screen, continuous combat and a smaller strategic roster over the initial eight-tower learning dashboard.

The roster has **five** roles: Pebble (rapid short-range shots), Prism (slow heavy armor-ignoring beam), Bricky (wall and reflection), Frost (area slow across three lanes), and Poppy (area damage against swarms). Five lanes carry floating aliens right to left. Earth rotates, becomes worried when a live enemy reaches the first two columns, and relaxes once nearby danger clears.

Missions have three authored waves each in `src/v2/encounters.js`, with distinct lane patterns across six missions. An uncompleted First contact waits for the first placement before starting its eight-second countdown. Later missions start that countdown on entry. Subsequent waves begin after five seconds without another Start click. Every attempt starts with six energy; a correct battle answer adds three energy, while kills and wave clears add nothing. Historical profile.energyBank is retained but unused, and battle spending never changes persistent progress. Two different sixteen-energy first-mission builds win with full health (one without Prism/Frost), and all six missions have verified winning builds from six energy by solving for planned reinforcements. Armor is 70%, with clear shield feedback. Actual player observation is still required.

The battlefield now uses the restored pale green lane ribbons, floating pads, a placement ghost, and short blue range marks aligned to the affected lanes. Amber arrows count down imminent arrivals from the actual schedule. Background stars/nebulae are hidden in combat; distinct projectiles and small impact rings keep attacks clear. The coach row is reserved when its cue disappears so the board never jumps. The global menu and original Earth/UFO animation remain.

Battle recharge contains one question: automatically show a hint at ten seconds, then reveal the solution and resume at twenty seconds. A solved answer grants three energy once and returns to battle after 750 ms. Revealing a solution without a correct response grants no energy, XP, solved count or streak. Recharge has a three-second active-play cooldown. Calm Practice remains an untimed three-question set with automatic advance after 1.2 seconds. There is no standalone tactical Pause button. Menu and hidden-tab suspension remain available for interruptions. The cooldown advances during active combat and build countdowns, and stops while the simulation is suspended.

All pages use a global Menu button with an animated alien mascot. There is no fixed sidebar, marketing footer, or settings tip column. Practice and the previous Progress page are merged; `#progress` redirects to Practice. Practice earns XP and five daily solved questions earn one cosmetic star, including hinted solves and excluding automatic reveals. The daily claim flag survives reload. Friends/rankings are future work, hidden from navigation. Reminders are an in-menu daily-goal preference, not push delivery. Streaks, practice records, cosmetic stars and preferences persist locally under `galactacians-v2`, independently of the old save.

Keep the shared JavaScript game while validating the loop. The intended native packaging route is Capacitor for iOS/Android and Tauri for Windows; no native build is delivered or tested yet. Local fonts and original SVG art allow gameplay without external asset requests. The old build remains at `game-menu.html` and `play.html`; its README is `docs/legacy-readme.md`.

Validation commands: `npm test` for learning and authored encounter checks, `npm run test:browser` for complete missions, strategy comparisons, guidance, range previews, lane warnings, math deadlines, rewards, responsive screens and saved preferences. See README for the latest completed run. `docs/playtest-guide.md` describes the human observation still to perform; do not present automated victories as evidence of enjoyment or learning.

Completed 7 October: all 18 logic tests and 42 browser tests passed. The repeated-Pebble formation loses health at the same sixteen-energy total spend as the two full-health alternatives. Desktop1151×884 and phone390×844 fields were visually inspected without overflow or browser exceptions. The local preview runs on port8088; preserve the user's browser save when testing.

The historical notes below describe the earlier auto-defense/curriculum prototype. They are retained for reference and do not override this new direction.

---

This file restores the working context from the recovered Codex chats. Use it as the handoff before continuing Galactacians work.

## Identity

- Project: `Galactacians`
- Earlier prototype name: `Planet Math Defense`
- Purpose: primary-school math learning game that combines Duolingo-style learning pressure with an idle/tower-defense planet game.
- Active path: `/Users/theunfrgiven/Documents/Galactacians`
- Browser menu URL: `http://localhost:8088/game-menu.html`
- Gameplay URL examples:
  - `http://localhost:8088/index.html?mode=campaign`
  - `http://localhost:8088/index.html?mode=infinite`
  - `http://localhost:8088/index.html?mode=practice&skill=division`
- Git remote: `https://github.com/TheUnFrgiven/Galactacians.git`
- Do not use `/Users/theunfrgiven/Documents/Playground` for game work because that path is a symlink to XApp.

## Current Product Shape

Galactacians is a static browser game. No build step is required for Campaign play.

The main concept:

- A `Planet` sits in the center and auto-defends itself.
- Enemies attack from around the planet.
- The player answers math questions to power the planet and keep population safe.
- The design should feel like a real game first, not a dashboard or learning worksheet.

## Game Modes

- `Campaign`: structured learning route. This is the main educational game and should not be random endless play.
- `Infinite Galaxy`: endless sandbox version of the current tower-defense loop for fun/testing.
- `Practice Lab`: choose one skill and practice without survival pressure.

## Campaign Direction

The campaign should be a scripted curriculum, not random math generation.

Recovered design principle:

```text
A child is going through a real math textbook, but every page becomes a planet-defense mission.
```

Recommended structure:

- Addition Galaxy
- Subtraction Galaxy
- Multiplication Galaxy
- Division Galaxy
- Mixed Review Galaxy

Current implementation notes recovered from the chat:

- Campaign was converted to fixed teaching pools.
- Static validation reported `22 lessons` and `156 curated questions`.
- Wrong campaign answers should keep the same question and show a hint instead of skipping forward.
- Campaign rewards should automatically upgrade the planet instead of asking children to manually choose `+ / - / x / divide` buttons.
- Random generation should be kept only for `Infinite Galaxy`, `Practice Lab`, and developer testing.

## Education System Redesign

On 2026-04-20, the lost redesign direction was restored into durable project files.

Core goal:

```text
Galactacians should be a real math learning game for ages 7-12: a space campaign with missions, mastery, repair, review, and world restoration. It should learn from addictive education products, but it must not become a weak Duolingo clone or a random worksheet feed.
```

New redesign files:

- `docs/education-system-redesign.md`: standards-informed product and learning-system plan.
- `docs/curriculum-map-ages-7-12.md`: practical age 7-12 campaign and topic progression.
- `src/curriculum/learning-system.js`: code-ready curriculum source with galaxies, missions, scaffolds, standards references, misconceptions, rewards, and mastery gates.
- `src/curriculum/curriculum-compiler.js`: runtime compiler that turns the curriculum source into the current playable `campaignLessons` shape.
- `docs/campaign-mode-redesign.md`: defines the separated Campaign, Infinite Galaxy, and Practice Lab rules.
- `docs/iso-21001-gameplay-alignment.md`: explains how ISO 21001 maps into gameplay without making a certification claim.
- `tests/curriculum-validation.js`: Node validation for curriculum structure.

Reference sources used:

- ISO 21001:2025 for learner-centered educational-management principles, not as a certification claim.
- Common Core Mathematics for domain progression and coherence.
- England National Curriculum Mathematics for fluency, reasoning, and problem-solving aims.

The new source currently defines:

- 12 galaxies.
- 58 mission arcs.
- Target ages 7-12.
- Mastery states: `new`, `introduced`, `guided`, `practicing`, `secure`, `mastered`, `review_due`, `needs_support`.
- Mission data for placement, number sense, operations, multiplication, division, fractions, decimals/measurement, geometry, ratios/percents, algebra, data/statistics, and mixed capstones.

Implementation completed on 2026-04-20:

- `index.html` loads `learning-system.js` and `curriculum-compiler.js` before `script.js`.
- `script.js` now compiles the 58 curriculum missions into playable campaign lessons.
- The old 22-lesson campaign remains as a fallback if the curriculum source or compiler is unavailable.
- Browser save data is versioned with `saveVersion: 2`, `campaignSourceVersion`, `campaignLessonCount`, `skillMastery`, and legacy `placement` fields.
- Per-skill mastery tracks attempts, correct answers, mistakes, current streak, misconception counts, completion time, and scheduled review time.
- Campaign runtime now filters out the placement strand and starts directly on the standards-informed mission route.
- Campaign now surfaces target age, standards path, scaffold/support type, mastery evidence, and saved-planet learning evidence in the actual gameplay UI.
- Infinite Galaxy prefers secure, mastered, or review-due campaign skills for each selected power; it falls back to generated questions if no secure skill exists yet.
- Campaign and Infinite Galaxy now use explicit separate mode rules: Campaign uses Population, Mission Progress, one-deck questions, non-lethal ambient combat, mastery gates, and guided repair; Infinite Galaxy keeps survival timer, enemy damage, population loss, and checkpoint repair.

Important interpretation:

- This is "ISO-inspired" curriculum architecture, not an ISO certification.
- Certification would require organizational records, audits, learner-support policies, and real operating evidence beyond the codebase.
- The practical product direction is to make objectives, assessment evidence, repair loops, accessibility, and continual improvement explicit in the game.

Next engineering step:

1. Turn failed mastery states into dedicated repair missions, not only the current population-repair panel.
2. Build parent/teacher progress views from `skillMastery`.
3. Improve generated question families with richer visuals and authored explanations.
4. Tune long-cycle pacing after the learning loop is stable.

## Current Systems

- Planet auto-attacks.
- Shield absorbs damage before health.
- Campaign uses Population and Mission Progress instead of survival failure.
- Campaign opens on a clickable planet map after selecting Campaign from the menu.
- Map planets are connected by a wavy dashed treasure-map route, unlock sequentially, and store 1-3 star ratings.
- Campaign answers live in one deck with variable answer counts: two-choice either/or questions, three-choice comparison questions, and four-choice numeric questions.
- Correct Campaign answers clear attackers; wrong Campaign answers keep the same question, reveal a hint, and cost population.
- Completing a Campaign stage shows a saved-planet result popup with correct count, wrong count, remaining population, and stars.
- Infinite Galaxy keeps population pressure in `20%` chunks.
- Repair lessons trigger as learning support in Campaign and survival recovery in Infinite Galaxy.
- Checkpoint rollback and streak recovery exist.
- Themes unlock by best streak.
- Browser save key is `planet-math-defense-save`.
- Save data lives in browser localStorage, not in a project file.

Most complete recovered Chrome save seen:

```json
{
  "bestStreak": 40,
  "unlockedThemes": [
    "cold-scifi",
    "solar-gold",
    "matrix-grid",
    "code-editor",
    "cartoon-candy",
    "storybook-horror",
    "funky-neon",
    "metal-forge",
    "paper-craft"
  ],
  "theme": "cold-scifi",
  "campaignLessonIndex": 12,
  "campaignComplete": false
}
```

There was also a later-looking localStorage entry with `bestStreak: 15` and `campaignLessonIndex: 4`, so do not edit Chrome LevelDB directly without deciding which save to preserve.

## Enemy Roles

Enemies are split into minions plus bosses.

Minion types:

- `Diver`: rushes the Planet and crashes into it.
- `Shield Breaker`: focuses shield damage and gets targeted first.
- `Ranger`: stays farther out and fires inward.
- `Melee`: moves close, ignores the shield, and attacks the planet surface.

Boss:

- Later heavier pressure enemy.

Design intent:

- Enemies should be smaller and readable.
- Pressure should feel deliberate, not random.
- The player should feel they need to upgrade, not feel unfairly killed.
- Prototype survival scale was compressed from daily progression into a few minutes for testing.

## UI Direction

- Main screen should stay clean and game-first.
- The old in-game top-left menu was removed.
- Designed main menu owns `Campaign`, `Infinite Galaxy`, `Practice Lab`, `Stats`, `Settings`, `Missions`, and `Achievements`.
- Gameplay should keep a simple `Main Menu` exit link so the player can change modes.
- System and feedback messages should appear as pop-up messages from the planet.
- Shape-based enemies were requested for color-blind readability.
- Enemy shapes should have simple cute face details.
- The game should use a basic readable palette, not a busy dashboard look.

## Themes

Theme unlock order in current code:

- `cold-scifi`: streak `0`
- `solar-gold`: streak `5`
- `matrix-grid`: streak `10`
- `code-editor`: streak `15`
- `cartoon-candy`: streak `20`
- `storybook-horror`: streak `25`
- `funky-neon`: streak `30`
- `metal-forge`: streak `35`
- `paper-craft`: streak `40`
- `ocean-pop`: streak `45`

## Important Files

- `game-menu.html`: designed main menu.
- `src/menu/main-menu.js`: main menu behavior, save reading, mode routing, practice selector.
- `src/menu/menu.css`: main menu styling.
- `docs/education-system-redesign.md`: restored education/game-system redesign.
- `docs/curriculum-map-ages-7-12.md`: age-band curriculum and galaxy campaign map.
- `docs/campaign-mode-redesign.md`: Campaign and Infinite Galaxy rule separation.
- `src/curriculum/learning-system.js`: structured curriculum data source for the next campaign system.
- `src/curriculum/curriculum-compiler.js`: converts curriculum missions into playable lesson objects.
- `index.html`: gameplay page.
- `script.js`: gameplay, campaign, practice, enemies, repair, save logic.
- `styles.css`: gameplay styling and themes.
- `theme-preview.html`: visual theme preview page.
- `theme-preview.css`: theme preview styling.
- `tests/smoke.spec.js`: Playwright smoke test.
- `tests/curriculum-validation.js`: validates the new curriculum source.
- `playwright.config.js`: test web server config using port `8088`.
- `PROJECT_SEPARATION.md`: guardrail that this project is separate from XApp.

## Current Repo State

The durable game source, project memory, and design docs are committed to GitHub.

Raw recovered chat exports were intentionally removed from the repository after the useful project decisions were organized into this file and the `docs/` directory. Keep future transcript dumps out of Git with `.gitignore`.

## How To Continue

Run the static server:

```bash
cd /Users/theunfrgiven/Documents/Galactacians
python3 -m http.server 8088
```

Open:

```text
http://localhost:8088/game-menu.html
```

Useful next work:

1. Run the Playwright smoke test 10 times as requested in the recovered chat.
2. Fix any failing route, button, entry, or exit.
3. Commit the separated Galactacians work so it is harder to lose.
4. Continue expanding the scripted campaign curriculum after the current flow is verified.
