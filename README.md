# Galactacians · Earth Patrol

A fresh playable browser prototype for a cheerful tower-defense game powered by small arithmetic wins. Built from scratch after reviewing the earlier Galactacians game.

## Play

```sh
npm start
```

Open **http://127.0.0.1:8088/**. Node 20+ is required for the local server; the game itself is static HTML, CSS and JavaScript with no build step, production package dependencies, remote assets, or backend. A generic static server also works.

## The new loop

1. Start with **10 energy** in a persistent wallet.
2. Pick one of **five distinct shape towers**, then tap a space in the five-lane field.
3. The first wave starts after an **8-second build countdown**. Cute aliens float **right to left** toward Earth, whose face becomes worried when they get close.
4. Open **Earn energy** for one question. Combat pauses for thinking: a hint appears after **10 seconds**, then the solution appears and play resumes at **20 seconds**. A correct answer earns **1 energy** and returns to combat automatically. Merely revealing the answer earns nothing. Recharge becomes available again after **3 seconds of active play**.
   The cooldown advances during active combat and build countdowns. There is no standalone tactical Pause button; Menu and switching away from the tab suspend play for interruptions.
5. Waves continue automatically after a **5-second build window**. Intermediate waves grant **3 energy**, and every fifth defeated alien grants **1 energy**. Reposition or recycle defenses while building.
6. Complete all three waves, earn mission stars, and continue your six-stop journey. Stars buy Earth colors; every tower is available from the start.

| Shape    | Tower  | Role                                               | Energy |
| -------- | ------ | -------------------------------------------------- | ------ |
| Circle   | Pebble | Rapid, short-range shots for scouts and skaters    | 2      |
| Triangle | Prism  | Slow, long-range beam that ignores armor           | 3      |
| Square   | Bricky | Durable blocker that reflects part of an attack    | 2      |
| Diamond  | Frost  | Area slow across its own and two neighboring lanes | 3      |
| Pentagon | Poppy  | Area damage against clustered swarms               | 4      |

The home screen leads straight into play. **Menu** contains navigation everywhere; there is no permanent sidebar. **Practice** combines operation selection with local learning records, streaks, and daily activity. Its three-question sets remain untimed and advance automatically after a correct answer. A tower collection, cosmetic shop, and saved settings remain available. Sound uses synthesized tones. Less-motion mode disables decorative animation. Math supports addition, nonnegative subtraction, multiplication, and exact division. Starter division stays within a single-digit dividend; more advanced fact practice may use a two-digit dividend.

## Scope and honest boundaries

- This is a **playable design slice**, not a finished online game or a validated educational curriculum. Arithmetic fluency is the focus; ages 7–15 have very different needs, so math level is chosen by comfort.
- Friends and rankings are future work and are hidden from the current navigation. No friend accounts, invitations, messages, or live competitors are simulated as real.
- Reminders are **in-app only**. There are no push notifications or background deliveries.
- Progress is stored on this browser/device under `galactacians-v2`. It is not cloud-synced. The old `planet-math-defense-save` is untouched.
- The wallet persists; an active battle does not survive leaving/reloading. Preparation allows full tower refunds; active waves offer partial refunds.
- Mission stars pay only when a new best is earned. Accuracy tracks independent first tries separately from assisted successes. One solved question extends the daily learning streak; combat by itself does not.
- Tower matchups, costs, the persistent wallet, timed battle support, mission pacing, and educational benefit still need real playtesting. No effectiveness or certification claim is made.

## Platform direction

Keep the shared JavaScript game while proving the gameplay. The intended packaging route is [Capacitor for iOS and Android](https://capacitorjs.com/docs), which can use an existing JavaScript app, and [Tauri for Windows](https://v2.tauri.app/), which supports an existing web frontend. These are planned native containers, **not builds already delivered or tested**. Device performance, touch ergonomics, app lifecycle, durable saves, signing, and store submission remain release work.

Read [the redesign blueprint](docs/redesign-blueprint.md) for the old-game audit, why lanes and a wallet were chosen, educational sources, balance hypotheses, and the roadmap to a production learning hub.

## Code map

- `index.html` — new app entry.
- `src/v2/app.js` / `app.css` — hub, navigation, practice, dialogs and settings.
- `src/v2/battle.js` / `battle.css` — simulation, lane board, enemies and tower behavior.
- `src/v2/data.js` — tower, mission and cosmetic concepts.
- `src/v2/learning.js` — arithmetic, safe local saves, rewards, streaks and progression.
- `src/v2/icons.js` — original SVG illustrations and icons.
- `assets/fonts` — locally bundled Nunito with its SIL Open Font License.
- `server.cjs` — local-only static development server.

## Validate

```sh
npm install
npm test
npm run test:browser
```

The browser suite uses installed Google Chrome (`channel: 'chrome'`) through Playwright. If Chrome is absent, install it or change the test configuration to use a Playwright browser. It starts the local server when necessary. Tests cover arithmetic validity and hints/retries, reward deduplication, calendar dates, malformed saves, the complete hub, saved preferences, cosmetics, desktop/mobile layouts, battle economy, all tower roles, menu/math/hidden-tab suspension, and win/loss outcomes. Screenshots and failure traces are written under `test-results/`.

Verified on **6 October 2026**: **13 learning tests and 32 browser tests passed**. A mixed defense completes the first mission with full health from the starting ten-energy wallet. Later-mission comparisons at a fixed twenty-energy budget reward the five-role formation over repeated Pebble/Prism placements. These scenarios check intended counterplay; they do not replace player observation.

## Earlier prototype

The old files remain available for reference and comparison:

- `http://127.0.0.1:8088/game-menu.html` — old main menu.
- `http://127.0.0.1:8088/play.html?mode=campaign` — old campaign.
- `http://127.0.0.1:8088/play.html?mode=infinite` — old infinite mode.
- [Archived README](docs/legacy-readme.md), `PROJECT_MEMORY.md`, and the earlier curriculum documents describe the previous direction. The new [redesign blueprint](docs/redesign-blueprint.md) takes precedence for the new game.

Legacy auth pages are historical front-end prototypes, not production authentication. The new design does not ask children for an email, password, or birth date.
