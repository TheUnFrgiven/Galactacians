# Elemental menu, touch controls and expanded station — 6 November 2026

## Visual direction

The menu now uses light ice-blue surfaces, dark ink text and four distinct elemental accents: frost cyan, solar orange, storm violet and verdant green. The expedition illustration combines the original astronaut with pixel meteor motifs; the curriculum keeps its illustrated planet route. The captain, gun rig, equipment sprites and authored deck remain the established art family.

Four large primary destinations replace the seven compact navigation rows: Expedition, Learn, Collection and Pilot. Practice remains available from home and Learn; Equipment Guide and Settings have separate visible actions. All existing profile, achievement, paint, teaching and sound systems remain available. Buttons, cards, tabs, labels, portraits and settings surfaces adapt to the lighter theme together. Keyboard legends have been removed from the product copy, answer choices and tutorial.

## Touch interaction

- Landscape play with a visible left move stick, automatic aiming and shooting, automatic salvage pickup, and right-side Boost/Nova actions.
- The movement finger is tracked independently. Ability taps are read from their own touch beginnings, so another finger can activate them while moving. Mouse dragging supports the same stick on desktop. Ability requests feed the existing gameplay methods and cooldowns.
- Menu, Upgrades and Launch are explicit touch actions. Launch includes a visible way to return from the threat briefing. Existing cannon signs and construction pads remain interactive.
- Movement and pending abilities reset when a modal/menu blocks the field or the app loses focus. Rendering and touch coordinates share the same safe-area transform for notches and landscape letterboxing.
- The answer pad now uses 87 x 44 logical-unit keys instead of 60 x 24. The question modal has room for the taller pad, feedback and a separate Back action. Keyboard fallback controls remain optional for desktop.

## World layout

The deck illustration is mapped to a 2,240 x 1,400 world rectangle, 1.75 times the previous width and height. The walkable floor follows the central octagonal deck and four service passages. Crystal beds, the reactor, rail edges and end gates exclude movement. Both normal movement and Boost sweep in steps of at most seven world units and slide along valid floor, preventing jumps across a railing or reactor.

Four cannon pads are spaced across the elemental quarters. Shields occupy the side arms, salvage rigs the north/south service routes, and the four daily resource caches the quarters. Resource amounts, costs, progression and collected-cache indices are retained. Old off-floor saved positions and field-cell drops are projected to reachable floor positions.

The camera follows the astronaut at a wider zoom. A ship navigator marks the captain, core, caches and installed cannons, and an edge label points to the core when it leaves view. Threat advice is compact during exploration and remains detailed in the launch briefing. The star-only part of the existing illustration extends the space backdrop; ship geometry is never mirrored into phantom walkable areas.

Spawn radii and meteor speeds are adjusted for the larger station to keep approximate approach pressure. The separation grid covers the expanded encounter space with the original cell size. Damage, costs, swarm counts and progression rules are unchanged; these geometry changes still need longer play sessions to tune coverage and pacing.

## Review evidence and remaining platform work

The normal and separate non-saving macOS preview builds were compiled with Unity 6000.6.7f1. The running preview was visually inspected for the light home menu, elemental illustration, expanded deck, navigator, touch control layout and following camera. Native keyboard walking reached the southern bridge gate and stopped at its illustrated boundary. Earlier review caught and removed an obvious repeated-rock backdrop pattern.

Native automation did not reliably complete coordinate-click flows. This pass does not claim full mouse-flow coverage, hardware multitouch verification, an Android/iOS build, or mobile performance/balance validation. Real-device review is still needed for simultaneous movement/actions, notch layouts, text size and sustained swarm frame rate. No automated test suite was added or run. The macOS preview does not persist progress.
