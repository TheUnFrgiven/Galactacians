# Starfall Relay

A C# Unity pixel-art action-defense prototype: Captain Aria walks the Wayfarer’s outer deck, salvages material during the day, solves a short math calibration to authorize upgrades, and fights elemental meteor waves at night while the Helios Core must survive.

## Run

Open this project with Unity 6000.6.7f1. Press Play from `Assets/Scenes/Moonvale.unity`. The player build is in `Build/Runehold.app`.

## Controls and run structure

- **WASD / arrow keys:** move Captain Aria.
- **Shift:** boost across the deck (2.5-second recharge). **Space:** discharge a fully charged Nova Pulse during combat. Kills and magnetic field capacitors recharge it; collecting a capacitor also restores one core integrity.
- **B:** open the ship upgrades; **E:** inspect an installed cannon or nearby construction pad. Cannon signs and construction pads can also be clicked.
- Weapons auto-fire at a meteor in range, retaining a live target to keep aim steady; no aiming input is needed.
- Walk over the marked salvage to collect alloy and crystal.
- During the untimed day, open the engineering bay, choose an upgrade, and solve one calibration question to confirm it.
- Each calibration offers one retry, a specific hint, movable quantity cells and a worked explanation. Supported installation costs the normal materials; there is no insight currency.
- Correct answers install visible hardware and open a reveal. An independent first-try answer refunds one alloy; helped answers install without that bonus. Cancelling spends nothing.
- Cannons rotate, alternate barrels and deal area damage. Four cannon pads and two pads per support system hold hardware; further purchases keep strengthening installed systems.
- Every night ends with one supply claim. Alloy = 2 + twice the night + half the astronaut level (rounded down); crystal = 1 + half the night + one clean-defense bonus. Claiming restores 20% maximum core integrity (at least 10) and opens the next day.
- The expedition continues after Night 3. Levels, equipment, materials and math progress carry forward. Defeat retries the current night while retaining XP and all upgrades.
- **M:** open or resume from the ship menu: Continue Expedition, Learning Galaxy, Practice Lab, Equipment Guide, Pilot Profile, Collection and Settings. The battle stays suspended while studying.
- **L:** open My Galaxy: addition within 10, subtraction within 10, making ten, equal groups, fair sharing and mixed operations. Every third night is a milestone. A milestone plus two distinct independent upgrade checks unlocks the next topic in the same expedition. Changing topics keeps your character and equipment.
- Practice Lab offers four operations and Starter, Explorer and Challenger difficulty. Engineering and practice answers both earn learning XP. Five completed questions in a local day grant a cosmetic star and paint credit; questions and upgrades remain available afterwards. Independent and helped records stay separate, with fact records and review suggestions.
- **B, then Tab:** switch between Defense and Astronaut upgrades. In the bay, **1–3** buy the corresponding row and **T** switches between New Pad and Boost All when both are available. Plasma Rifle, Orbit Drones and Regen Reactor provide repeatable personal-power upgrades, each confirmed through math.
- **N:** open the difficulty briefing; **Enter** launches after review. In questions, **1–4** select answers, **H** shows a hint, **J** opens the worked example, and **Enter** continues after the explanation. Settings can switch to typed numerical answers. First-time upgrade questions show the lesson teaching first.
- **Escape:** pause.

## Menu quality pass — 4 November 2026

The menu now uses a consistent button system, regular and bold typography, pixel navigation icons and illustrated planet destinations. Equipment illustrations, real palette previews, trophy cards and progress bars make the collection and profile more readable. Settings includes themed audio controls, mute restoration, safe name editing and accurate save feedback. Teaching, engineering and pause buttons share the same controls. See [menu-quality-pass.md](Docs/menu-quality-pass.md) for changes, keyboard controls and review limits.

## Readability, power scaling and original music — 4 November 2026

- Fixed hand anchors and deliberate four-direction pose changes replace the orbiting rifle motion. Horizontal mirroring, vertical foreshortening, recoil and bullet origins use the same rig.
- Full-resolution cannon signs show damage and mastery. Click a sign or approach a cannon and press E to upgrade. The Ion card offers NEW PAD or BOOST ALL; mastery can improve existing cannons before all four pads are filled.
- The relay scan compares estimated damage output with swarm pressure. N opens an untimed difficulty briefing with clear upgrade advice and a strong warning for severe power gaps. Enter explicitly launches. Enemy hull strength increases by 0.14 per night after Night 2, alongside the escalating swarms.
- Mission-control menus use the existing ship and captain artwork, clearer navigation, interactive button feedback and an illustrated expedition card.
- Original sixteen-bar “Relay Afterglow” synth music runs at 96 BPM with soft keys, bass and swung percussion. All music is synthesized locally; no third-party recordings or music samples are included. Music and sound effects have separate saved volume controls.
- Implementation, forecast assumptions and balance limitations: [relay-polish.md](Docs/relay-polish.md).

## Combined expedition — 31 October 2026

- The current pixel-art asset family remains the visual foundation. The quieter preparation HUD shows incoming threats and the next action.
- Threats rotate between Ember Drift, fast Ion Rush skaters, and armored Stormheart convoys. Every third night includes a larger commander. Existing meteor art is reused with readable sizes, trails, colors and health indicators.
- Nova Pulse, boost movement and collectible field capacitors add active choices alongside auto-fire.
- Twelve persistent achievements award paint credits once. Four liveries recolor actual armor/visor pixels, rifle energy, turret/shield lighting and ship accents. Previously earned accent colors are migrated.
- Pilot Profile has Expedition, Learning and Activity views. Detailed daily events begin with this revision; historical activity is not invented. Tab changes profile/collection sections; Collection's Paint Bay also supports keys 1–4.
- Engineering questions describe the selected equipment's control cells and save its calibrated load. Typed input has an on-screen number pad. Hints and supported completion still install the equipment.
- Sound effects cover shots, salvage, installations and Nova Pulse, with a working volume setting.
- The new journal uses `starfall-pilot-v1.json` beside the existing expedition and learning saves.
- Scope, economy and remaining runtime review are documented in `Docs/combined-expedition.md`.

## Current slice

- The world view is pulled back by 28%, while the HUD stays at its readable size.
- Four-direction, full-body Captain Aria with cropped sprite bounds, walking bob, backpack and boots.
- Tangible Alloy and Crystal pickup sprites with hover, pixel glints, ground shadows, proximity labels and animated collection feedback. Matching icons appear in the HUD.
- Asset generation prompts and saved paths are recorded in `Docs/art-prompts.md`.
- Upgrade hardware prompts are in `Docs/upgrade-art-prompts.md`; shield generators, salvage rigs and trimmed cannon art are visible on the deck. The ship systems panel shows installed slot counts.
- New top-down starship deck, pilot, ember meteor and ion turret pixel-art assets.
- Point-filtered texture imports to preserve hard pixel edges.
- WASD movement, proximity salvage, escalating upgrade ranks and math confirmation.
- Dense perimeter swarms grow from 360 / 640 / 960 enemies to thousands per night, up to 900 active enemies. Crowd and projectile budgets protect performance. Nights continue without a campaign endpoint.
- Kills earn XP; astronaut levels increase damage and eventually add firing streams. Rifle ranks add piercing, fire rate, spread and explosive rounds. Orbiting drones and continuous core regeneration build toward the Immortal rank.
- The captain holds an illustrated plasma carbine with four directional arm poses, stable aim, short recoil and aligned muzzle/trails. Turrets use fixed mounts and rotating heads; installed cannons have screen-space upgrade signs. Rotation uses local coordinates so weapons and shots remain aligned when zoomed. Defenders includes a four-direction rifle handling view.
- Damage states, score, core health, raid popup, dawn recap, victory/defeat screens, hit flashes and particle bursts.
- Two-step flight-school overlay points toward salvage and the first required turret.
- The expedition autosaves hardware, upgrade ranks, XP, materials, current night and pending dawn rewards. Quitting during combat resumes that night's preparation with earned power retained. Independent and helped math records remain separate.
- See `Docs/swarm-learning-design.md`, `Docs/swarm-learning-checks.md` and `Docs/swarm-art-prompts.md` for design, measured checks and new artwork.
- `Docs/endless-progression.md` supersedes the earlier finite-wave balance and reset rules. This revision compiled successfully; its long-term balance has not been play-tested.
- `Build/StarfallExpeditionPreview.app` opens a separate windowed preview on Day 2 with two turrets. It does not save progress. `Build/Runehold.app` is the normal saved expedition.
- See `Docs/galactacians-menu-adaptation.md` for the menu/teaching scope and `Docs/gun-academy-art-prompts.md` for the new artwork prompts. The existing Galactacians project was read only.

## Design reference

The broad day-planning / night-defense rhythm and active player combat take cues from the publicly described structure of *Thronefall*. Starfall Relay uses an original setting, characters, art, resources, questions, UI, and combat details rather than reproducing its assets or levels. See the [Steam overview](https://store.steampowered.com/app/2239150/Thronefall/) and [full-release trailer](https://www.youtube.com/watch?v=hIJZANm1vMk).
