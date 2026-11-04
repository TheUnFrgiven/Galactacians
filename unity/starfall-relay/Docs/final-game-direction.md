# Starfall Relay — direction and proposed feature blend

Updated 28 October 2026.

Implementation update, 31 October 2026: the user authorized combining the strongest parts into a playable game. The first integrated pass is described in `combined-expedition.md`. The recommendations below remain the design rationale; the implementation document identifies what is actually present and what still needs play feedback.

## Confirmed direction from the user

- The latest Unity assets are the main art style and visual direction: pixel-art astronaut, spaceship deck, turrets, salvage, crystals and space threats.
- The astronaut explores, collects resources and builds equipment that assists defense.
- Growth should continue across the expedition, with increasingly crowded and rewarding combat and retained character power.
- Achievements, unlockable themes/recolors, popup messages and a profile with meaningful progress/stats are valued features from the earlier Galactacians versions.
- The remaining feature blend is being reviewed so the user can hand-pick it. Recommendations below are not additional approved decisions or claims of implemented behavior.

## Recommended core loop

1. Explore the ship deck and collect visible alloy/crystal salvage.
2. Inspect a build site or personal upgrade, its effect, cost and the approaching threat.
3. Complete an untimed engineering calculation, with teaching and help available.
4. See the equipment install and its changed behavior immediately.
5. Start the next assault when ready; move and auto-fire while the installed defenses assist.
6. Receive a concise reward recap, retain equipment and power, then continue preparation.

The next assault is a pacing boundary within the same expedition. A learning-map selection does not start a fresh astronaut or erase the ship.

## Visual rules

- Extend the current pixel-art asset family and its navy, ivory, orange, cyan and gold palette.
- Match new assets to the existing pixel scale, outlines, shading, perspective and readable silhouettes.
- Distinguish equipment by silhouette and attack behavior as well as color.
- Use the older games as references for progression and interaction patterns. Translate their interface into a ship-console presentation consistent with the current game.
- Cosmetic variants should reach actual astronaut armor, weapon energy, turrets, ship lights and profile details. Preserve hazard and pickup readability across recolors.

## Recommended feature blend

| Area | Source candidates | Proposed adaptation |
| --- | --- | --- |
| Movement and power growth | 6A–6G | Current astronaut, physical salvage, installed hardware, repeatable upgrades, persistent power and escalating crowds. |
| Collection and identity | Versions 1–2; 4H–4I | Achievement gallery, unlock previews, cosmetic selection, named pilot profile and actual activity history. |
| Learning journey | 3A–3G | Sector/mission map with topic, objective, reward and review needs; study alongside the existing expedition. |
| Strategic clarity | 4A–4D; 5I | Distinct equipment roles, placement/range previews, enemy forecasts and first-encounter introductions. |
| Teaching | 5B–5H; GC | Short teaching, relevant visual models, typed answers, hints, worked continuation and individual-fact records. |
| Pacing and recovery | 5L; GA/GD | Player-controlled preparation and battle checkpoints that preserve completed learning and earned equipment. |

## Give each resource and reward a clear job

- Alloy: common construction and physical hardware upgrades.
- Crystal: energy equipment and special upgrade components.
- Combat XP: astronaut power progression.
- Learning XP: recorded learning activity, with independent and supported work shown separately.
- Cosmetic rewards: themes/recolors, pilot appearance and display identity. A fixed daily cosmetic goal does not cap questions, upgrades or expedition length.

Keep resources and learning meaningful together: salvage makes the equipment affordable; the engineering calculation completes its installation. Practice outside engineering remains available for teaching, records and cosmetic goals.

## Make the question part of the equipment

Use a repeated visual grammar: inspect equipment → see quantities represented → enter the result → watch those quantities resolve into the installation.

Examples to develop, not current implementations:

- Addition: combine two represented power-cell groups to charge a shield.
- Subtraction: calculate remaining alloy after a component purchase, with the before/spent/remaining quantities visible.
- Multiplication: determine cells needed for a shown number of identical turret modules.
- Division: distribute a shown supply evenly among drones or shield emitters.

Tie numbers to a real displayed machine or transaction. Avoid generic story wording wrapped around an unrelated equation. Pause simulation while teaching or answering. After a mistake, teach and let the player finish; retain a useful gameplay reward and record support honestly.

Question complexity should follow demonstrated learning readiness. The cost, role and combat strength of equipment also need their own balance; increasing enemy pressure must not demand arithmetic the player has not been taught.

## Keep reward moments distinct

- Pickup: brief local number/icon feedback.
- Upgrade: construction animation and a short before/after effect summary.
- Incoming raid: clear threat forecast and a prominent warning at launch.
- New enemy/equipment: a first-encounter explanation that can be reopened.
- Achievement/theme unlock: a celebratory reveal followed by a persistent gallery entry.
- Dawn: one concise reward claim and a visible next objective.

Routine feedback should allow play to continue. Teaching, major reveals and explicit menus can suspend the world. Avoid competing notifications over important combat information.

## Profile structure

Present one pilot identity with distinct views:

- Expedition: highest night, enemies defeated, equipment, build history and defense results.
- Learning: topics/facts practised, independent versus supported responses, attempts, review needs and actual activity dates.
- Collection: earned achievements, owned cosmetics, equipped appearance and next unlock conditions.

Use recorded events for statistics. Combat success and question volume alone are not evidence of mathematical mastery.

## Recommended first vertical slice

Prove one coherent loop using the existing art:

1. Collect salvage.
2. Preview and construct one turret through an equipment-related math interaction.
3. Start and survive an assault with astronaut movement and auto-fire.
4. Upgrade that turret and make the improvement visibly clear.
5. Earn a milestone cosmetic and equip it on the real game assets.
6. Inspect the resulting expedition and learning records in the pilot profile.
7. Continue with the same ship and equipment.

Further enemies, equipment, lessons and map sectors can extend that loop after its pacing and presentation work together.

## Decisions still available for hand-picking

- Placement freedom: fixed ship sockets, a free grid or a hybrid.
- Build timing: preparation only, or limited construction during assaults.
- Equipment changes: moving/recycling, branching upgrades and/or merging.
- Pilot danger: current core-only damage, personal shields or another recovery rule.
- Special abilities: automatic effects or a player-triggered charged ability.
- Cosmetic economy: direct achievement unlocks, spendable cosmetic stars or a combination.

The historical Godot curriculum's fresh-team rule applies to that separate mission design. It is not a reason to reset this continuous Unity expedition.
