# Child-friendly readability pass — 11 November 2026

## Presentation and placement

The current pixel astronaut, equipment and ship illustration remain the art family. The interface uses smooth rounded surfaces, clean geometric navigation icons, dark readable type and consistent primary/secondary actions. Main body copy is generally 20–27 logical units, headings 28–40, and the equation is 64. The shared button renderer no longer shrinks action text to 11; compact legacy actions have a 48-unit minimum height, while primary teaching and play actions use 64–80 or more. These are design-space sizes, not a claim about physical touch sizes on every phone.

The menu has large named destinations, a prominent Play action and a simple Explore / Learn / Build sequence. Learning destinations use a three-by-two card layout. Lessons separate the teaching, example and next actions. Practice skill cards, rewards, color selection, progress, review records, recent activity and settings are reorganized with larger text and clearer spacing. Milestones now page four at a time across all three pages, keeping all twelve available.

The playfield has a consistent health/resource header and action bar, a map that opens on demand, and short next-step guidance. Screen-space resource and equipment cards identify both the object and the available action. Their placement avoids the pilot, movement stick, abilities, header, footer, map and other signs. Unbuilt tools have visible construction pedestals. Tiny world-space keyboard labels and the persistent statistics panels are no longer part of the main flow.

The camera transform is aligned to screen pixels to reduce subpixel shimmer. A lightweight, one-time artwork pass gently reduces scenery saturation and contrast; interactive sprites retain their original colors. Original bitmap assets are preserved. Pixel sprites stay point filtered; text and interface geometry render smoothly.

## Interaction and learning

- Tap a resource card or the next-step card to follow a floor-valid collection route. A four-neighbor search uses the same deck collision as walking; segment checks prevent crossing the reactor, crystals or railing. The movement stick takes over immediately. Night preparation clears the route. This is an optional assist alongside direct movement.
- Upgrade screens explain each tool's job, level, resource cost and next action. Insufficient-resource actions guide collection. Locked tools explain that the first tower is needed. Adding a tower and strengthening installed towers remain separate choices.
- Maths gets a dedicated, calm screen: one large equation, a readable visual model, a large answer pad or choices, hints and a worked-example action. Adding/taking away use countable cells; larger amounts use labeled bars; multiplication and division use equal groups. Division starts with empty groups rather than revealing the answer through empty answer-sized slots.
- Teaching and practice pause the space encounter. There is no answer timer. Supported and independent evidence remain separate in the saved learning records; encouraging copy explains that learning with help is useful too. The five-question result shows both and preserves the expedition.
- Upgrade reveals, night preparation, incoming showers, supplies and retry messages use the same clear surfaces and larger actions. Underlying play controls are disabled while a popup or teaching screen is active, preventing click-through to Home or another hidden action.
- Save formats, curriculum progression, material costs, original sound and continuous expedition progression are retained. The visible word Metal maps to the existing Alloy save field.

## Review and limits

Unity 6000.6.7f1 compiled the preview and normal macOS builds. The running non-saving preview was inspected for the home menu, playfield, practice selection, lesson teaching, large number pad, correct-answer feedback and a worked-example path. A five-question session exercised one independent answer and four supported completions through the desktop keyboard fallback; the completion screen showed the expected 26 learning XP. Rewards, color previews, settings, the progress overview and the upgrade cards were also visually reviewed. Screenshots are kept locally under `output/child-clarity/` and are not included in the source publication.

Native coordinate clicks were unreliable in the automation surface, so full mouse/touch flow coverage is not claimed. Phone hardware, notches, physical touch sizes, long-session swarm performance and child usability sessions remain separate device-review work. No automated test suite was added or run. The preview does not write to the saved expedition.
