# Relay readability and presentation — 4 November 2026

## Rifle handling

The four body sprites now use fixed hand anchors. A new body direction snaps to its authored pose; small corrections within that pose ease toward the target. A 52-degree boundary provides hysteresis around diagonals. The left weapon mirrors horizontally in its own space, while front/back views keep their handedness and use a shorter, foreshortened rifle. Movement no longer fights combat targeting for body direction. Body bob, recoil, visible muzzle and projectile origins share the rig.

## Cannons and engineering

Cannon signs render in screen space at full HUD resolution rather than shrinking with the deck. Each shows its pad number, damage, mastery and upgrade action. Click a sign or approach any installed cannon and press E to open its engineering card. NEW PAD installs another of the four cannons. BOOST ALL raises shared mastery, adding two damage per cannon, blast radius and fire rate. Boosting is available from the first installed cannon and has no rank cap. The bay also supports 1–3 for its rows and T to switch Ion purchase modes. Both choices spend materials only after the normal math calibration. They use the same escalating Ion track cost; canceling a question spends nothing. Mastery is saved separately from installed hardware.

## Scaling and briefing

Each night's health multiplier is `1 + max(0, night - 2) * 0.14`. Fragile fragments stay easy to kill in early nights; armored waves and Stormhearts have more hull. Spawn pack size and interval are shared between combat and forecast. The existing increasing swarm count, active crowd cap, permanent upgrades and checkpoint recovery remain.

The planning model compares estimated sustained damage with incoming health per second. It assumes 5–9 cannon targets per blast and 1.6 rifle hits per shot; these assumptions are displayed in the briefing. Drones contribute their damage and fire interval. Incoming pressure uses the rounded health of the actual enemy mix, including the armored third-night substitution. Travel time, movement, coverage, pulse use, regeneration, commander health and collisions are not simulated, so the rating is advice, not a win probability.

- Under 0.65 output/pressure: critical power gap; the briefing says survival without several effective upgrades will be almost impossible.
- Under 1.05: upgrades recommended.
- Otherwise: ready to challenge, with a reminder to keep engineering for later nights.

N opens an untimed briefing, Enter explicitly launches, B returns to engineering and Escape returns to the deck. Core damage has its own shield recommendation. There is no forced question quota or new question timer.

These are initial tuning values. Building and visual inspection do not establish long-run balance or learning efficacy; a sustained player session is still needed to tune the forecast against outcomes.

## Menu and original soundtrack

The mission-control shell uses the existing deck and pilot art, a framed captain portrait, mission illustration, learning route, clearer navigation hierarchy and button hover/press feedback. Small buttons fit their font to their bounds.

“Relay Afterglow” is an original sixteen-bar composition at 96 BPM, created in `RuneholdMusic.cs`. Soft synthesized keys, a restrained melody, sustained chords, syncopated bass and swung percussion are generated from oscillators and fixed-seed noise. No external recordings, sample packs or third-party music tracks are included. Note releases wrap into the loop for continuity. Music and sound effects have independent saved volume settings. Existing journals receive a versioned default music setting once; a saved zero volume remains muted on subsequent launches. Music ducks during questions and combat, and the less-motion option also quiets the menu visualizer.

## Build and runtime review

Both the saved macOS build and the separate, non-saving preview built successfully with Unity 6000.6.7f1 on 4 November 2026. The running preview was inspected for the illustrated menu, forecast, readable cannon signs, left-facing rifle grip, shared-mastery benefit display and launch briefing. Small button labels and sign widths were corrected after the first inspection. Achievement notices wait while engineering or a briefing is open. Native automation delivered keyboard navigation; coordinate clicks were inconsistent, so this pass does not establish complete mouse-flow coverage. No automated test suite or long-session balance run was performed.
