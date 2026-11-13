# Pixel-art production pass — 13 November 2026

The existing astronaut, ship, Tower, Shield and Collector establish the art direction. This pass completes missing sprites and brings the interface and effects into that family. Maths selection, prices, progression, Shield rules and movement are unchanged.

## Shared visual rules

- Navy outlines, steel/off-white machinery, cyan energy and amber fasteners. Orange fire, cyan ice, violet crystal and gold solar enemies have distinct materials.
- Stepped silhouettes and hard upper-left highlights. The geometric mascot, square drones and generic Repair disc are replaced with finished machinery sprites.
- Panels, buttons, signs, tabs, keypads, dialogues and badges share stepped corners, dark rims, light bevels and downward shadows. Selected, pressed and disabled buttons are distinct.
- Nunito body text and numerals stay readable. The title alone uses a custom pixel wordmark. Pixel styling does not reduce maths legibility or touch-target sizes.
- Point filtering, no mipmaps, uncompressed textures and original non-power-of-two proportions. Builds refresh old imports. Source PNGs are preserved.
- The same object uses the same artwork in equipment, gameplay, help and rewards.

## Asset inventory

| Asset | Use and finishing work |
| --- | --- |
| PilotCombatDirections | Four existing poses retained; original atlas proportions restored. Used in gameplay, profiles and menu portraits. |
| PlasmaCarbine | Original proportions restored. Menu illustrations fit their allotted width to prevent label overlap. Existing grip, aim and projectile origins retained. |
| IonTurret, TurretMount, TurretHead | Original detailed machinery retained. Empty pads show a mount and build marker; installed Towers show the complete rotating assembly. Shared pixel muzzle flashes. |
| ShieldGenerator, SalvageRig | Original Shield and Collector retained, with the same import, lighting and framing rules. |
| AlloyPickup, CrystalPickup | Original detailed pickups retained. Steel docks replace flat discs. The same sprites appear in the field, inventory and rewards. |
| StarshipDeck | Original map and aligned collision retained. Full-window space now uses a point-filtered, banded pixel sky. |
| EmberMeteor | Original fire sprite retained; no longer tinted to impersonate every element. |
| IceMeteor, CrystalMeteor, SunMeteor | Three new transparent sprites used by elemental swarms, menu illustration and lesson cards. Existing roles and behavior retained. |
| BotGuide | New transparent sprite for tutorial portraits, task prompts and help. |
| OrbitDrone | New transparent sprite for orbiting drones, equipment and badges. |
| RepairModule | New transparent machinery for equipment, upgrades and installation reveals. |
| UI icons | Seven original 16-pixel masks: adventure, learning, practice, tools, profile, rewards and settings. Cached point-filtered textures. |
| Achievement medals | Twelve illustrations reuse relevant game assets inside a shared rim. Earned state also has explicit text and a highlight. |
| Energy cells and effects | Outlined cells in teaching and field pickups; layered muzzle flashes, pixel sparks and impact particles. |
| Pilot, PilotDirections | Historical reference assets retained; the combat atlas remains active. |

## Review

Desktop screen review covers menu, Bot, equipment, lessons, keypad, badges, colors, profile, settings and field/combat presentation. Screenshots and logs live in ignored `output/art-polish/`. A first review caught Blaster art overlapping its label; the renderer now caps its width. Inconsistent construction markers and resource discs were also replaced.

Pixel masks are cached instead of issuing scanline draws for each circle. New artwork supports the existing color-variant system where appropriate. Original sources and save IDs are retained.

Mac builds and keyboard-driven desktop review do not establish mobile touch or target-phone performance. Those still require device review.

## Artwork provenance

Six new PNGs were generated with the built-in imagegen tool using the existing local artwork as style references, then copied into `Assets/Resources/Art/`. Original PNGs were not overwritten. [Prompt specifications](pixel-art-prompts.md) record the shared direction and individual assets.

## Final verification record

Unity 6000.6.7f1 built both release artifacts successfully: `Runehold` (188450207 bytes) and the non-saving `Starfall Expedition Preview` (188450303 bytes). Runtime log review found no exceptions or GUI errors in the reviewed run.

Desktop keyboard review included all six equipment illustrations, four recolor previews, illustrated medals, lesson selection, a maths keypad/model, settings, profile, Bot introduction, Drone purchase/installation and actual Drone/Blaster/Tower firing during Night 2. The reviewed night completed with 626 meteors stopped. The final preview was relaunched and left at Bot's introduction. Native pointer automation was unreliable, so these observations do not establish full pointer/multitouch coverage or mobile-device readiness. No automated tests were added.
