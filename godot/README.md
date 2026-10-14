# Galactacians native rebuild

Open `project.godot` in Godot 4.7.2 (standard build, no .NET required).
Press F6 on `scenes/main.tscn`, or F5 to run the project.

Current milestone: **playable First Contact**, with a guided addition example,
number-pad/keyboard answers, hints and animated worked explanations, question-earned
Pebbles, three-lane preparation, a two-lane alien encounter, worried Earth, victory,
checkpoint retry and local resume. First mission introduces only Pebble; other roles
belong to later missions. Double-click `../Play-first-level.cmd` on this Windows setup
to start the tutorial directly. F5 starts the menu instead.
The browser prototype remains available from the repository root with `npm start`.

Run the reward checks:

```sh
godot --headless --path godot --script tests/test_reward_bucket.gd
godot --headless --path godot --script tests/test_first_level.gd -- --test
```

Run that command from the repository root. On Windows substitute the full path to
the Godot console executable if it is not on PATH.

## Verification and limits

Reward checks and 18 first-level checks pass, including two-strong/six-weak wins,
misplaced-team defeat, redemption, supported evidence, duplicate protection, JSON
round-trip, viewport mouse and keyboard input, retry and post-victory learning recovery.
Graphical screenshots were inspected for menu, teaching, board and combat on Windows.
Tests use `--test` to avoid overwriting the player's save.

This is a first-level comparison build, not the full campaign. No recorded narration,
soundtrack, later towers or mobile export is included yet. Combat restores the
pre-wave checkpoint after reopening, rather than resuming midway through a projectile.
Question support and completed rewards persist. Save: `user://first-contact-v1.json`,
separate from all browser saves. Numeric balance and learning checks remain provisional.
Compare the first level before expanding or spending on final production art/audio.
The final accepted entries in `../docs/migration-decisions.md` govern implementation.

Engine caches and exported builds are ignored. No mobile export or native installer
has been delivered yet. Voice-over production and full visual polish remain pending.
