# Planet Math Defense

`Planet Math Defense` is a static browser prototype that mixes:

- center-planet auto-defense combat
- primary-school math questions
- Duolingo-style streak pressure, repair lessons, and checkpoint recovery

## Run

Open [index.html](/Users/theunfrgiven/Documents/Playground/index.html) in a browser.

No build step is required.

## Current Systems

- the `Planet` attacks automatically from the center
- `Shield` absorbs damage before health
- four math upgrade paths:
  - `Addition` increases damage
  - `Subtraction` increases max health and max shield
  - `Multiplication` increases simultaneous targets
  - `Division` increases health and shield regeneration
- live `Population` pressure in `20%` steps
- repair lessons when population reaches `0%`
- checkpoint rollback and streak recovery rules
- drag-and-scale UI settings
- multiple visual themes with distinct asset styles

## Enemy Roles

The current enemy roster includes four main minion roles plus a boss:

- `Diver`: rushes the Planet and crashes into it
- `Shield Breaker`: focuses shield damage and gets targeted first
- `Ranger`: stays farther out and fires inward
- `Melee`: moves closer and attacks the Planet directly
- `Boss`: heavier late-pressure enemy

## Notes

- this is a front-end prototype, not a packaged app
- progression is run-based and currently does not save to local storage
- pacing is still tuned for prototype testing, not final daily progression

## Next Useful Steps

- save progress locally
- tune the long-cycle pacing model
- add sound and better animation timing
- split the JavaScript into smaller modules
