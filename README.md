# Galactacians

A tower defense game for ages 6–9 where every tower is bought with a math answer.

Each mission is a short lesson. In the build phase the child picks one of three tower cards and pays for it by solving the problem printed on it: easy cards give basic towers, hard cards give strong ones. In the waves, aliens float toward Earth and the towers defend it with no math interrupting. Along the way the game tracks every fact the child practises.

## Play

```sh
npm start
```

Open **http://127.0.0.1:8088/**. Node 20+ is needed only for the tiny local server; the game itself is plain HTML, CSS and JavaScript with no build step and no dependencies. It works best on a tablet or laptop in landscape.

## What is in the basics build

| Part | What it does |
| --- | --- |
| Start screen | The child picks where to start: adding, taking away, make 10, or times tables. |
| Learning path | 4 worlds × 4 missions (3 lessons and a Captain boss). Beating a Captain opens the next world. |
| Teach cards | A short spoken picture lesson before each world's first mission, replayable from the path. |
| Question shop | 3 picks per build phase. Easy / Medium / Hard cards use facts the child knows, is learning, or is ready to stretch to. Number pad, a picture hint after a mistake, the worked answer after two. |
| Battle | 5 towers (Pebble, Bricky, Prism, Frost, Poppy), 5 aliens (Scout, Skater, Swarm, Helmet, Captain), merging to level 3, and Earth's Star Beam, charged by first-try answers. |
| Progress | XP, a kind daily streak with freezes, stars, one new tower per mission won, and a fact map per world. |
| Grown-ups | Settings for sound, voice and motion, plus a CSV export of every answer for parents, teachers or a study. |

Everything is saved on the device under `galactacians-basics-v1`. There are no accounts and nothing is sent anywhere.

## Code map

```
src/core/    game rules, no DOM (unit tested)
  content.js   towers, aliens, worlds, missions and waves (all data)
  questions.js facts, question formats and hints
  learner.js   fact stages, XP, streak, stars, shop fact picking
  shop.js      the three-card question shop
  battle.js    deterministic tower defense simulation
  save.js      local save, validation and CSV export
src/ui/      screens drawn with DOM + SVG
  app.js       start screen, path, teach cards, fact map, settings
  mission.js   build phases, shop, hand, merging, waves, results
  question.js  the number-pad question view
  art.js       original SVG art; audio.js sound and speech
tests/
  core.test.mjs  rules, learning model, saves and balance checks
  sim.mjs        simulated players that play every mission
```

## Test

```sh
npm test         # 17 tests, including balance across all 16 missions
npm run balance  # prints how each simulated player does on each mission
```

Simulated players include a careful child mixing card levels, a child who only picks easy cards, one who is always wrong first, and one who places towers at random. The tests check that a child mixing card levels wins every mission and that accuracy earns more stars.

## Honest limits

This is a playable first version for playtesting, not a finished product. Balance numbers come from simulations and need real children. Voice uses the browser's built-in speech. Online leagues, teacher accounts and more worlds are planned in the design doc, not built.
