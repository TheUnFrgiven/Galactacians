# Bot guide, fixed signs and persistent Health — 11 November 2026

## Requested interaction changes

- All resource-routing code, route search, automatic walking and next-objective movement callbacks are removed. The player moves with the stick or the desktop movement fallback. Resources are collected by walking over them.
- Small name signs use one fixed map offset per object. They never jump to another side of a building or stick to the screen edge. Building signs can open the upgrade screen; resource signs are labels only.
- Tool names are Tower, Shield, Collector, Blaster, Drones and Repair. Lesson names name the actual operation. Cosmetic names are Orange, Green, Purple and Gold. Blast replaces the opaque ability name Nova. Stored save fields and achievement IDs remain stable.

## Bot

Bot is an original robot portrait drawn with the interface's geometry. Dialogue uses a speaker name, portrait, high-contrast text and Next / Back pages in the style of a classic command or RPG conversation, without copied characters or artwork.

A first-time guide explains movement, collection, spending, building, maths, Shield versus Health, preparation, combat, supplies, practice and progress. Movement, collection, opening upgrades, entering a question, finishing an upgrade, opening a night review, fighting and reaching dawn advance the relevant stages. The game pauses while Bot speaks. An explicit End tutorial action is available. Versioned guide progress is stored separately from the older two-step tutorial flag so existing players can receive the new explanations without losing their expedition.

Ask for help is available from the menu, the playfield, upgrades, teaching and other overlays. Its explanation depends on the current screen. Resource help shows the chosen tool's actual cost and the player's inventory; it does not move the player. Maths help explains the current concept and can offer the existing hint or worked example. Generic guide explanations do not mark an answer supported; selecting a problem-specific hint or worked example retains the existing supported-answer rule.

## Health and Shield

Health damage carries through completed rounds. Claiming a night reward restores **up to 10 Health**, once, capped at maximum Health. The old 20%-of-maximum round repair is removed. Energy pickups recharge Blast and no longer grant incidental Health. Repair remains an explicitly purchased source of gradual in-combat healing.

Shield is a separate damage-absorption pool shown on the HUD. Without a Shield building its capacity is zero. The first Shield level gives 50 protection; each additional level adds 20. Incoming hits subtract Shield first, and only excess damage reduces Health. Shield refills when a night is launched. Upgrading Shield refills the protection pool and does not restore or increase Health.

For example, a ship with Health 100 and Shield 50 taking 90 damage ends at Health 60 and Shield 0. The next day starts at Health 70; launching the next night gives Health 70 and Shield 50. A retry restores that failed night's preparation checkpoint rather than granting full Health. New Shield state is saved; old saves preserve their existing Health and maximum Health and migrate without discarding upgrades.

## Background

A single full-window procedural sky covers the display, including space outside the safe-area interface. The deck painting fades into it at its outer edges. Cropped star-strip repetition and mirrored copies are removed. Night and damage tints cover the full world viewport, avoiding a rectangular tint seam at the artwork boundary. The walkable ship geometry and collision remain aligned.

## Maths review

Question selection, grading, resource prices, review weighting and lesson unlocks have not been replaced. [math-logic-review.md](math-logic-review.md) explains the implemented formulas, their limitations and a proposed resource-based alternative for the user's feedback.

## Verification

Both final macOS builds succeeded with Unity 6000.6.7f1: normal 131293023 bytes, preview 131293119 bytes. The preview was relaunched after the final copy corrections. Desktop runtime review covered the guide through movement, collection, opening tools, answering a Shield question, preparation, combat and dawn. A Shield purchase changed protection from 50 to 70 while Health stayed 125. Night 2 ended with Health 95 and Shield 0; claiming supplies began Day 3 at Health 105, Shield 0; launching Night 3 kept Health 105 and refilled Shield to 70.

Keyboard fallback drove these flows because native pointer automation could not address the Unity window reliably. Mobile hardware, multitouch, every help-button click, save migration and a long-term economy playthrough remain unverified. Source review confirms routing callbacks are absent and only the fixed dawn repair, purchased Repair, checkpoint restoration and save loading can increase Health. No automated tests were added.
