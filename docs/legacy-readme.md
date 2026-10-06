# Galactacians

`Galactacians` is a static browser prototype for a space-campaign math learning game.

Earlier prototype name: `Planet Math Defense`.

The goal is to build a real game that teaches ages 7-12 through structured space missions, mastery gates, repair loops, and planet restoration. The main campaign should be standards-informed and scripted, while endless/random practice belongs in separate modes.

- center-planet auto-defense combat
- primary-school math questions
- Duolingo-style streak pressure, repair lessons, and checkpoint recovery
- professional curriculum direction with explicit objectives, scaffolds, mastery, and review

## Run

From the project folder:

```bash
cd /Users/theunfrgiven/Documents/Galactacians
python3 -m http.server 8088
```

Open:

- `http://localhost:8088/game-menu.html`
- `http://localhost:8088/index.html?mode=campaign`
- `http://localhost:8088/index.html?mode=infinite`
- `http://localhost:8088/index.html?mode=practice&skill=division`

No build step is required.

Do not use `/Users/theunfrgiven/Documents/Playground` for Galactacians work. That path is a symlink to the separate XApp project.

## Current Systems

- the `Planet` attacks automatically from the center
- `Shield` absorbs damage before health
- four math upgrade paths:
  - `Addition` increases damage
  - `Subtraction` increases max health and max shield
  - `Multiplication` increases simultaneous targets
  - `Division` increases health and shield regeneration
- Campaign planet map with clickable lesson planets, 1-3 star saves, `Population`, and `Mission Progress`
- Infinite Galaxy `Population` pressure, survival timer, and checkpoint repair
- repair lessons for both learning support and survival recovery, depending on mode
- browser save data under `planet-math-defense-save`
- multiple visual themes with distinct asset styles

## Education Redesign

The recovered redesign is saved in:

- [docs/education-system-redesign.md](/Users/theunfrgiven/Documents/Galactacians/docs/education-system-redesign.md)
- [docs/curriculum-map-ages-7-12.md](/Users/theunfrgiven/Documents/Galactacians/docs/curriculum-map-ages-7-12.md)
- [docs/campaign-mode-redesign.md](/Users/theunfrgiven/Documents/Galactacians/docs/campaign-mode-redesign.md)
- [docs/iso-21001-gameplay-alignment.md](/Users/theunfrgiven/Documents/Galactacians/docs/iso-21001-gameplay-alignment.md)
- [src/curriculum/learning-system.js](/Users/theunfrgiven/Documents/Galactacians/src/curriculum/learning-system.js)
- [src/curriculum/curriculum-compiler.js](/Users/theunfrgiven/Documents/Galactacians/src/curriculum/curriculum-compiler.js)
- [tests/curriculum-validation.js](/Users/theunfrgiven/Documents/Galactacians/tests/curriculum-validation.js)

Current curriculum source:

- 12 galaxies
- 58 mission arcs in the curriculum source, with runtime Campaign filtering out the placement strand
- ages 7-12
- ISO 21001:2025-informed gameplay checks, plus Common Core Mathematics and England National Curriculum Mathematics references
- mastery states, scaffolds, misconception tags, question families, and reward mapping
- runtime compiler that turns curriculum missions into playable campaign lessons
- separated Campaign and Infinite Galaxy rules so the main learning route is not endless survival with lessons attached

This is an ISO-inspired educational architecture, not an ISO certification claim.

## Enemy Roles

The current enemy roster includes four main minion roles plus a boss:

- `Diver`: rushes the Planet and crashes into it
- `Shield Breaker`: focuses shield damage and gets targeted first
- `Ranger`: stays farther out and fires inward
- `Melee`: moves closer and attacks the Planet directly
- `Boss`: heavier late-pressure enemy

## Notes

- this is a front-end prototype, not a packaged app
- pacing is still tuned for prototype testing, not final daily progression
- the new curriculum data is now wired into gameplay through a compiler; the old 22-lesson campaign remains as a fallback if the curriculum source fails to load
- Campaign starts directly in the curriculum route instead of a separate diagnostic screen
- Campaign uses a clickable connected planet map, Population, Mission Progress, mastery, variable answer counts, attacker clearing, saved-planet star ratings, and guided repair; Infinite Galaxy keeps timer survival and enemy pressure

## Validate

```bash
node --check script.js
node --check src/menu/main-menu.js
node --check src/curriculum/learning-system.js
node --check src/curriculum/curriculum-compiler.js
node tests/curriculum-validation.js
```

## Next Useful Steps

- route failed skills into repair missions
- add a parent/teacher progress screen for per-skill mastery states
- improve the generated question families with richer visual manipulatives
- tune the long-cycle pacing model after the learning loop is stable
