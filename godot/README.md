# Galactacians native rebuild

Open `project.godot` in Godot 4.7.2 (standard build, no .NET required).
Press F6 on `scenes/main.tscn`, or F5 to run the project.

Current milestone: **six playable Earth Orbit missions** with five floating astronaut
roles, a curriculum path, addition/subtraction teaching, typed answers, animated help,
earned crew, automatic waves, reinforcement phases, retry and persistent unlocks.
Double-click `../Play-Galactacians.cmd` on this Windows setup to open the menu.
Adventure opens the six-level path. `Play-first-level.cmd` still starts the first tutorial.
The clean SVG alien art and Earth are adapted from our shared Claude/browser artwork;
astronauts are original SVGs with role-colored suits and chest badges.
The browser prototype remains available from the repository root with `npm start`.

Run the reward checks:

```sh
godot --headless --path godot --script tests/test_reward_bucket.gd
godot --headless --path godot --script tests/test_first_level.gd -- --test
godot --headless --path godot --script tests/test_chapter.gd -- --test
```

Run that command from the repository root. On Windows substitute the full path to
the Godot console executable if it is not on PATH.

## Verification and limits

Reward checks and 18 first-level checks pass, including two-strong/six-weak wins,
misplaced-team defeat, redemption, supported evidence, duplicate protection, JSON
round-trip, viewport mouse and keyboard input, retry and post-victory learning recovery.
Graphical screenshots were inspected for menu, teaching, board and combat on Windows.
Tests use `--test` to avoid overwriting the player's save.

Chapter checks cover 1,620 generated arithmetic cases, every wave and learning unlock,
weak-crew and strong-crew routes through all six missions, and shielding/slow/splash/
armor-piercing behavior. Rendered Windows chapter, astronaut and subtraction screens
were inspected on 16 October 2026; oversized portraits were corrected.

This is the opening chapter, not the full 36-mission design. No recorded narration,
soundtrack, adaptive review scheduler or mobile export is included yet. Combat restores the
pre-wave checkpoint after reopening, rather than resuming midway through a projectile.
Question support, completed rewards and chapter unlocks persist in `user://earth-orbit-v2.json`.
The earlier `first-contact-v1.json` and browser saves are preserved separately; they are
not imported into chapter progression. Numeric balance and learning checks remain provisional.
Scripted wins establish feasibility, not fairness across every formation or learning efficacy.
The final accepted entries in `../docs/migration-decisions.md` govern implementation.

Engine caches and exported builds are ignored. No mobile export or native installer
has been delivered yet. Voice-over production and full visual polish remain pending.
