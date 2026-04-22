# Galactacians Project Memory

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
