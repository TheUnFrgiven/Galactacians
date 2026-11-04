# Combined expedition — 31 October 2026

## Implemented blend

The existing Unity pixel artwork remains the foundation. This pass combines the continuous astronaut expedition with the earlier games' collection, progress and teaching patterns.

### Play loop

Walk or boost through salvage, inspect a construction socket, buy a repeatable equipment rank through an untimed engineering calculation, then launch the next assault manually. Equipment and astronaut power continue across nights and lesson changes. The first ship turret remains the opening construction goal.

The preparation HUD now shows a threat forecast and the next salvage/build action. Walking near the next cannon socket reveals its range boundary and a connection to the core. The existing upgrade reveal retains before/after effects, paid materials and the independent-calibration rebate.

### Combat

- Ember Drift: conventional fragile clouds.
- Ion Rush: a higher share of fast skaters, with lateral movement and readable trails.
- Stormheart Convoy: a higher share of armored fragments and one larger commander at the end of every third night's spawn schedule.
- Shift: a 135-unit boost, recharging in 2.5 seconds. A boost through a daytime cache collects it.
- Space: a fully charged Nova Pulse deals area damage within 420 world units. Its damage grows with rifle and cannon damage.
- Pulse charge: starts at 35%, grows by 1.5% per combat second and 0.32% per kill. Every twelfth kill can drop a field capacitor; walking within 120 units attracts it. Collection grants 12% charge and restores one core integrity.
- Field drops have bounded count and lifetime. Pulse and drop state are transient, reset for a checkpoint retry. They do not create extra material claims.
- Core defense remains the loss condition. The astronaut remains untargeted in this pass.
- Procedural sound effects accompany shots, salvage, installations, livery changes and Nova Pulse. The Settings volume control affects the actual audio source.

The existing swarm totals, damage growth and repeated equipment ranks are retained as the initial tuning. This pass does not establish that every late-game combination is balanced.

### Achievements and paint

Twelve milestone achievements use real equipment, combat and learning state. Earned IDs are saved; each achievement grants its paint credits once. Unlock conditions and progress are visible in Collection.

Four liveries use the existing artwork. Runtime palette swaps change orange armor/scarf pixels and cyan visor/energy pixels while preserving transparency, shading, silhouettes and pale armor. Rifle, turret and shield lights, shot colors, aura and ship accents follow the equipped livery. Resource colors and enemy warning colors retain their meanings.

Relay Original is free; Verdant Warden, Nebula Ranger and Solar Legend cost 2/4/6 paint credits. Existing star-based color ownership is migrated once into the new journal. Acquired liveries remain owned. This is a cosmetic currency, separate from alloy and crystal.

Five completed questions per local day earn one practice star and one paint credit. The goal includes engineering and practice, and completion with support counts. Further questions, construction and expedition play stay available.

### Teaching and engineering

Upgrade questions now describe the selected equipment's control banks, disconnected cells, equal module groups or balanced emitters. The solved quantity is stored as that system's last control-load setpoint and appears in its equipment guide. These are calibration cells; the purchase's alloy/crystal costs remain separately displayed.

Typed numerical input has both keyboard handling and an on-screen number pad. Four choices remain available in Settings. A hint, one retry and worked continuation remain available. Supported completion installs the same hardware at its normal cost; an independent calibration retains the existing one-alloy rebate.

Engineering and practice questions both grant learning XP: 10 independent, 4 supported. The profile records date, independent days and a review date per fact. Selection weights favor facts that need support or review and avoid the immediately previous fact. Review suggestions are provisional practice rules, not a validated mastery assessment.

### Pilot profile and saves

Pilot Profile has three views:

1. Expedition: astronaut power, highest night survived, kills, clean defenses, installed ranks and Nova Pulse uses.
2. Learning: per-topic independent/support totals plus individual fact records and review suggestions.
3. Activity: real dated solves, builds, kills and victories over the recent seven days.

Existing expedition and learning saves remain in use. New collection ownership, earned achievements, calibration setpoints, sound level and up to 90 recorded activity days use `starfall-pilot-v1.json`. Old saves retain their totals; earlier daily activity is not fabricated. Highest survived night can be inferred from an existing expedition's current night.

The source fallback is under `.openai/checkpoints/pre-combined-expedition/`.

## Controls

WASD/arrows move, Shift boosts, Space discharges a ready Nova Pulse, B opens upgrades, E inspects nearby construction, N launches, L opens learning and M opens/resumes the menu. In Pilot Profile, Tab changes views. In Collection, Tab switches milestones/paint, Left/Right changes milestone page, and 1–4 selects a livery in Paint Bay.

## Delivery and limits

Two intermediate macOS preview builds compiled successfully. The running preview's home and preparation HUD were visually inspected; that inspection exposed a notification overlap, which was corrected. Native computer control returned `noWindowsAvailable` for mouse actions and inconsistent keyboard navigation, limiting the interactive inspection. A later build contains the sound effects and final presentation fixes.

The normal macOS player compiled successfully with the complete revision (131,110,367 bytes). Enabling Unity's built-in Audio package resolved the initial audio-reference compiler error. Dead enemy records are periodically removed after projectile processing so targeting/collision work does not retain the entire history of a long wave. A preparation screenshot is saved at `output/combined-expedition/preparation.png`.

No automated tests were added or run. Full save/reload migration, every learning flow, audio playback, paint purchases and long expeditions still need hands-on review. Fun, child usability and educational benefit require player observation.

The normal saved game is `Build/Runehold.app`. The separate `Build/StarfallExpeditionPreview.app` is a windowed, non-persistent Day 2 demonstration with two turrets and a shield.
