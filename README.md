# Galactacians · Earth Patrol

A fresh playable browser prototype for a cheerful tower-defense game powered by small arithmetic wins. Built from scratch after reviewing the earlier Galactacians game.

## Play

```sh
npm start
```

Open **http://127.0.0.1:8088/**. Node 20+ is required for the local server; the game itself is static HTML, CSS and JavaScript with no build step, production package dependencies, remote assets, or backend. A generic static server also works.

## The new loop

1. Every mission attempt starts with **6 energy**, including retries. Previous savings and losses do not change this allowance.
2. Pick one of **five distinct shape towers**, then tap a placement pad. Clear lane ribbons, a ghost defender, and range previews show where it can act. Keyboard focus and touch support the same field.
3. In the first mission, place your first defender to begin the **8-second build countdown**. Later missions begin their countdown on entry. Cute aliens float **right to left** toward Earth, whose face becomes worried when they get close. Amber entry arrows count down the next arrival in each threatened lane.
4. Open **Earn energy** for one question. Combat pauses for thinking: a hint appears after **10 seconds**, then the solution appears and play resumes at **20 seconds**. A correct answer earns **1 energy** and returns to combat automatically. Merely revealing the answer earns nothing. Recharge becomes available again after **3 seconds of active play**.
   The cooldown advances during active combat and build countdowns. There is no standalone tactical Pause button; Menu and switching away from the tab suspend play for interruptions.
5. Waves continue automatically after a **5-second build window**. No energy is awarded for waiting, wave clears, or kills. Reposition or recycle defenses while building, then solve a question when the team needs another defender.
6. Complete all three waves, earn mission stars, and continue your six-stop journey. Each mission has its own attack pattern: first contact, outside-lane couriers, shifting neighboring lanes, grouped swarms, shield convoys, and a homecoming relay. Stars buy Earth colors; every tower is available from the start.

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
- Mission energy lasts for one attempt. Leaving or reloading restarts the battle with six energy. A correct battle answer adds three energy, once per question. Preparation allows full tower refunds; active waves offer partial refunds. Historical wallet data is retained for compatibility but no longer funds combat.
- Mission stars pay only when a new best is earned. Accuracy tracks independent first tries separately from assisted successes. One solved question extends the daily learning streak; combat by itself does not.
- Practice earns XP and learning progress; five solved questions earn one cosmetic star per local day. Hinted solutions count, passive answer reveals do not. The daily star cannot be claimed twice by reloading.
- Tower matchups, costs, timed battle support, mission pacing, and educational benefit still need real playtesting. No effectiveness or certification claim is made. Use the short [player observation guide](docs/playtest-guide.md).

## Platform direction

Keep the shared JavaScript game while proving the gameplay. The intended packaging route is [Capacitor for iOS and Android](https://capacitorjs.com/docs), which can use an existing JavaScript app, and [Tauri for Windows](https://v2.tauri.app/), which supports an existing web frontend. These are planned native containers, **not builds already delivered or tested**. Device performance, touch ergonomics, app lifecycle, durable saves, signing, and store submission remain release work.

Read [the redesign blueprint](docs/redesign-blueprint.md) for the old-game audit, why lanes and a wallet were chosen, educational sources, balance hypotheses, and the roadmap to a production learning hub.

## Code map

- `index.html` — new app entry.
- `src/v2/app.js` / `app.css` — hub, navigation, practice, dialogs and settings.
- `src/v2/battle.js` / `battle.css` — simulation, lane board, enemies and tower behavior.
- `src/v2/data.js` — tower, mission and cosmetic concepts.
- `src/v2/encounters.js` — eighteen authored waves with matching lane warnings and short teaching cues.
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

The gameplay regression suite checks two different full-health first-mission strategies at the same sixteen-energy total spend, including one without Prism or Frost. It also completes all six missions from six starting energy by solving only when a planned reinforcement is needed. A starter-only formation cannot fund itself through kills or wave clears. Tests cover lane warnings, directional and area range marks, touch placement, and identical retry budgets for old empty and rich profiles. These scenarios check intended choices; they do not replace player observation.

Verified **7 October 2026**: **18 logic tests and 42 browser tests passed**. Desktop and phone screenshots were also inspected, with no browser exceptions or horizontal overflow.

## Earlier prototype

The old files remain available for reference and comparison:

- `http://127.0.0.1:8088/game-menu.html` — old main menu.
- `http://127.0.0.1:8088/play.html?mode=campaign` — old campaign.
- `http://127.0.0.1:8088/play.html?mode=infinite` — old infinite mode.
- [Archived README](docs/legacy-readme.md), `PROJECT_MEMORY.md`, and the earlier curriculum documents describe the previous direction. The new [redesign blueprint](docs/redesign-blueprint.md) takes precedence for the new game.

Legacy auth pages are historical front-end prototypes, not production authentication. The new design does not ask children for an email, password, or birth date.
