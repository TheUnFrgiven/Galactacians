# Starfall Relay

## Unified pixel artwork — 13 November 2026

The ship's existing art family now extends through the whole interface: stepped frames and buttons, pixel icons and wordmark, a detailed Bot guide, finished Drones and Repair artwork, four distinct elemental meteor sprites, illustrated medals, steel resource docks and matching energy cells. Original texture proportions are preserved. See [the asset inventory and review](Docs/pixel-art-production-pass.md) and [sprite prompt specifications](Docs/pixel-art-prompts.md).

A C# Unity pixel-art action-defense prototype: Captain Aria walks the Wayfarer’s outer deck, salvages material during the day, solves a short math calibration to authorize upgrades, and fights elemental meteor waves at night while the Helios Core must survive.

## Child-friendly readability — 11 November 2026

The UI now separates clean, smooth controls from the pixel artwork: larger type and buttons, simpler tool names, less scenery competition, clear object signs, and a consistent action bar. Maths uses a dedicated teaching screen with one large equation, countable models, a large keypad, hints and worked examples. Menus, learning, rewards, progress, settings and upgrade screens have been reorganized. See [child-readability-pass.md](Docs/child-readability-pass.md) for changes and the limits of desktop review.

## Bot and persistent Health — 11 November 2026

Move the astronaut yourself. Small fixed map signs identify Tower, Shield, Collector and resources. Bot teaches the controls and systems through short conversations; **Ask for help** opens an explanation for the current screen. Automatic resource routing has been removed.

Health carries through rounds, with at most 10 restored at dawn. Shield absorbs hits before Health and recharges before each night. Buying Shield upgrades its protection rather than healing Health. The sky covers the full window without repeating a cropped image strip. See [bot-guide-and-shield.md](Docs/bot-guide-and-shield.md) and the separate [maths logic for review](Docs/math-logic-review.md).

## Run

Open this project with Unity 6000.6.7f1. Press Play from `Assets/Scenes/Moonvale.unity`. The player build is in `Build/Runehold.app`.

## Touch controls and expedition

Designed for landscape play. Drag the left move stick; the rifle aims and shoots automatically. Tap **Boost** to reposition and **Blast** when its charge is full at night. Kills and magnetic field cells recharge Blast. Energy pickups do not heal Health. The stick owns one touch independently, so a second finger can trigger either ability.

Tap **Menu**, **Upgrades**, or **Launch Night**. Tap cannon signs or construction pads to inspect their upgrades. Walk over Metal and Crystal to collect them. Tap a building sign to inspect it. During the untimed day, choose an upgrade and solve its calibration to install it. The on-screen number pad, hints, worked examples, navigation and launch briefing work without a keyboard. The interface and input use the same safe-area transform.

The enlarged station has four elemental quarters, side bridges and north/south service routes. Floor, rails, crystal beds, reactor exclusion and bridge gates share the map illustration's coordinate system. Walking and boosting both use swept floor collision. A following camera and optional ship map help orientation. Existing saved progression is retained; old off-floor player positions are moved to a valid floor point.

- Four cannon pads and two pads per support system hold hardware; further ranks strengthen installed systems. Each engineering check offers a retry, a hint, movable cells and a worked explanation. Supported installation costs normal materials; independent first-try installation refunds one alloy. Cancelling spends nothing.
- Each night ends with one supply claim. Alloy = 2 + twice the night + half the astronaut level (rounded down); crystal = 1 + half the night + a clean-defense bonus. Claiming restores at most 10 Health and starts the next day.
- The expedition continues past Night 3. Levels, equipment, materials and learning carry forward. Defeat retries the current night while keeping XP and upgrades.
- **Learn** contains six curriculum destinations. Every third night is a milestone; a milestone and two distinct independent engineering checks unlock the next upgrade topic without resetting your ship. All destinations remain available for practice.
- Practice offers four operations and three difficulties. Five completed questions in a local day grant a cosmetic star and paint credit. Independent and supported evidence remain separate. **Pilot** tracks expedition, learning and activity; **Collection** contains milestones and paint unlocks. **Settings** has sound, answer mode and motion preferences.

Desktop fallback: WASD/arrows move, Shift boosts, Space fires Blast; B/E open engineering, N opens launch review, M opens the menu, Escape pauses. These are optional and are no longer printed throughout the game. The touch stick can also be dragged with a mouse.

## Elemental and mobile presentation — 6 November 2026

Brighter ice, solar, storm and verdant accents now sit on light surfaces with dark readable text. Four primary menu destinations replace the seven-row shortcut list. The chosen astronaut, equipment and deck artwork are preserved. See [elemental-mobile-pass.md](Docs/elemental-mobile-pass.md) for implementation details and platform review limits.

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
- Blast, boost movement and collectible field capacitors add active choices alongside auto-fire.
- Twelve persistent achievements award paint credits once. Four liveries recolor actual armor/visor pixels, rifle energy, turret/shield lighting and ship accents. Previously earned accent colors are migrated.
- Pilot Profile has Expedition, Learning and Activity views. Detailed daily events begin with this revision; historical activity is not invented. Tab changes profile/collection sections; Collection's Paint Bay also supports keys 1–4.
- Engineering questions describe the selected equipment's control cells and save its calibrated load. Typed input has an on-screen number pad. Hints and supported completion still install the equipment.
- Sound effects cover shots, salvage, installations and Blast, with a working volume setting.
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
- Kills earn XP; astronaut levels increase damage and eventually add firing streams. Rifle ranks add piercing, fire rate, spread and explosive rounds. Orbiting drones and continuous core regeneration build toward the Space Hero rank.
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
