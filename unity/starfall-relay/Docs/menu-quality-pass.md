# Menu quality pass — 4 November 2026

## Presentation

- One button renderer now covers home navigation actions, subpage actions, teaching, the number pad, engineering, pause and deck controls. It has a fixed hit rectangle, subtle pressed movement, hover interpolation, short click sound, and explicit disabled states.
- A licensed static regular-weight Nunito derivative adds a quieter body text weight beside the existing bold headings. Both are distributed under the included SIL Open Font License. Long single-line names and headings fit their available width.
- The flight console uses original pixel glyphs, consistent gutters, thinner borders and a clear active navigation row. The existing captain and starship assets remain central.
- The learning route has illustrated pixel planets, selection rings and readable practice availability. Practice difficulty and profile/collection sections use consistent selected tabs.
- Equipment cards and profile ranks use equipment artwork. The paint bay shows four cached portraits recolored with the same palette function used by gameplay. All four previews, including the original colors, stay independent of the currently equipped palette. Previewing does not equip or buy a palette.
- Achievement cards show trophy emblems, real counts, progress bars and credit rewards. Equipped, affordable and unavailable palette states are distinct.
- Settings has themed text entry, separate audio tracks and mute buttons, clear toggles and save feedback. Muting remembers the preceding level during the current session. Existing persisted music migration remains in place.
- Thin progress bars keep a visible colored fill. The teaching number pad has a single-line answer field with more vertical room, correcting clipped placeholder text. The practice summary includes a completion emblem.

## Interaction corrections

Command deck opens the home page; returning to gameplay has its own action. Navigation focus is separate from the active page, and arrow/Enter navigation takes priority over a page's own Enter action when the player is moving through destinations.

Name entry owns its keyboard shortcuts. M is text while editing. Enter/Escape commits and releases focus through the IMGUI key event. Names are trimmed and validated on save. Preference feedback distinguishes preview application, successful profile/journal writes, and save failure.

- Arrows + Enter navigate the sidebar; M returns to the expedition.
- Settings: R less motion, Q answer mode, F fullscreen, 1/2 mute music/effects, Tab to name/volume, Ctrl/Cmd+S save.
- Profile: Tab changes section; F switches learning summary/fact review; Left/Right page through facts.
- Collection: Tab changes section, Left/Right page milestones, 1–4 select a palette.
- Equipment: Space switches the system/pose guide.

## Review and limits

The running non-saving macOS preview was inspected for home, galaxy, practice, lesson, equipment, four rifle poses, pilot expedition/learning/activity views, achievements, palette previews, settings, teaching feedback and a completed five-question practice summary. Name entry with M and Return, sidebar navigation, and music mute/unmute from 32% to 0% and back were exercised through native keyboard input. A practice review used one independent answer and four supported answers and displayed the expected 26 learning XP. Review progress belongs to the separate preview, not the saved game.

Reference-window inspection caught and corrected clipped answer placeholder text, thin achievement bars, name-field focus capture and shortcut conflicts. Native coordinate clicks were inconsistent in the automation surface; complete mouse-flow coverage is not claimed. Other display sizes, operating systems and long-session gameplay remain outside this visual pass. No automated test suite was added or run.
