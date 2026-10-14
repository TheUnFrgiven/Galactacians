# Galactacians native rebuild

Open `project.godot` in Godot 4.7.2 (standard build, no .NET required).
Press F6 on `scenes/main.tscn`, or F5 to run the project.

Current milestone: native menu foundation and independently testable reward-budget
logic. Adventure is explicitly a development placeholder, not a playable mission.
The browser prototype remains available from the repository root with `npm start`.

Run the reward checks:

```sh
godot --headless --path godot --script tests/test_reward_bucket.gd
```

Run that command from the repository root. On Windows substitute the full path to
the Godot console executable if it is not on PATH.

## Next complete milestone

Build one curriculum mission with guided teaching, question-earned towers,
three-lane placement, automatic battle, checkpoint retry and versioned local saving.
Keep teaching evidence, reward accounting and battle simulation separate from UI.
Treat power values as provisional until formation and encounter tests support them.
The final accepted entries in `../docs/migration-decisions.md` govern implementation.

Engine caches and exported builds are ignored. No mobile export or native installer
has been delivered yet. Voice-over production and full visual polish remain pending.
