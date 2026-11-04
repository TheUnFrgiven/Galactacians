# Continuous expedition — 2026-10-23

The user's direction supersedes the earlier three-night mission/reset structure. Every night now leads into the next preparation day. There is no automatic new character or equipment wipe when a math topic changes.

## Power curve

Kills grant 1/2/3 XP depending on enemy durability. Each level requires 35 + 20 times the current level XP. Levels add rifle damage, occasional spread streams and turret/drone damage. XP, levels and upgrades survive defeat; only the current battle and its score rewind.

Six repeatable upgrade tracks require material payment and a math calibration:

- Ion turrets: fill four pads, then increase every cannon's damage, area and firing speed.
- Core shield: fill two pads, then keep growing integrity. Each rank adds/restores 25 + 5 times the new rank integrity.
- Salvage rig: fill two pads, then keep increasing cache yield. Movement growth is bounded for control.
- Plasma rifle: increases damage, piercing and fire rate; adds spread every three ranks and blasts from rank eight.
- Orbit drones: builds an orbit of up to eight companions; additional ranks continue increasing damage and eventually add blasts.
- Regen reactor: continuously repairs core integrity during combat. The astronaut is already untargeted in this prototype; core survival remains the objective.

Rifle streams visually cap at seven, piercing at 24, and fire interval at 0.035 seconds. Cannon/drone visual counts and firing intervals are also bounded, while damage ranks continue to grow. Rank names rise through Relay Scout, Swarm Hunter, Star Reaper, Void Demigod and Immortal. Cyan/gold aura particles and weapon energy change as power grows. These are progression names, not a literal invulnerability switch.

## Crowds and rewards

| Night | Enemies across night | Active crowd limit |
|---|---|---|
| 1 | 360 | 320 |
| 2 | 640 | 360 |
| 3 | 960 | 400 |
| 5 | 1,840 | 480 |
| 10 | 4,740 | 680 |
| 20 | 13,540 | 900 |

Later wave counts stop increasing at 30,000 and active population at 900, with up to 240 projectiles. These are performance budgets; they do not end the expedition. Enemy durability increases every eight nights, with bounded speed and durability multipliers so enemies do not simply become infinitely fast bullet sponges.

Dawn grants alloy = 2 + 2 times night + floor(astronaut level / 2), and crystal = 1 + floor(night / 2) + a clean-defense bonus. Rewards are claimed once. A clean defense means no core impacts, even if regeneration would otherwise repair the damage. The next day repairs 20% maximum core integrity (at least 10), respawns salvage and keeps player position. Salvage yield also grows with rig rank and night. Purchase costs grow linearly by upgrade rank.

## Learning and saving

Every third night records a learning milestone. Two distinct independent upgrade checks plus that milestone unlock the next topic in place. Neither auto-advancing nor selecting an unlocked topic resets equipment. The curriculum now contains six introductory topics spanning four operations, with a separate practice lab and teaching menu. See `galactacians-menu-adaptation.md` for the current scope; endless combat does not imply a complete educational curriculum.

Versioned expedition state is saved locally in starfall-expedition-v1.json beside the separate learning profile. It stores current night, XP, ranks, materials, collected caches and pending dawn reward. A normal quit during battle resumes preparation for that same night with power retained. Saves also occur after purchases, salvage collection and night transitions. Abrupt process termination during a battle may lose XP earned since the last save. The existing preview app bypasses persistence.

## Implementation status

The Unity macOS build compiles. No new automated tests or live gameplay session were run for this revision. Earlier simulation results belong to the finite prototype and must not be used to claim endless balance or 900-enemy rendering performance. This first tuning pass aims for accelerating player power; late-game pacing, rendering cost and learning progression need play feedback.

The previous source is preserved under .openai/checkpoints/pre-endless.
