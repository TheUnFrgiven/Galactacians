# Swarm and learning checks — 2026-10-23

These results describe the earlier finite prototype. The subsequent endless progression revision changes balance, costs, caps and progression; these measurements do not validate that revision. See [endless-progression.md](endless-progression.md).

## Editor mechanics

RuneholdSwarmLearningChecks.Run passed using Unity 6000.6.7f1. It includes the economy checks and exercises actual game methods on temporary instances without saving player progress.

- Swept rifle collision hits exactly three targets at high projectile speed; cannon splash destroys a cluster.
- Turret shot origin matches its recoiling muzzle; flight follows the barrel direction.
- A checkpoint retry restores core health and score, retaining hardware, completed math and materials.
- Helped answers do not count as independent evidence. Repeating a fact does not satisfy two distinct checks. A saved victory plus fresh checks unlocks the next lesson. Optional practice does not grant mission-check evidence.
- Learning records survive JSON round trip. Struggling facts receive more review; the immediate previous fact is avoided.
- 3,000 generated questions have bounded exact answers, four unique options, one correct answer and nonempty hints/explanations.
- Costs, caps, supported installation, first-try bonus, salvage and one-time dawn rewards pass.

## Swarm baseline

Three random seeds per night. Player stationary at (640,500), one/two/four turrets and core health 100/125/150 on nights 1/2/3. Actual combat advances in 1/30-second steps. These isolated loadouts measure a forgiving baseline, not a complete purchase campaign.

| Night | Seed | Destroyed | Core left | Peak alive | Clear seconds | CPU ms/step |
|---|---|---|---|---|---|---|
| 1 | 0 | 360/360 | 100 | 281 | 21.3 | 0.34 |
| 1 | 1 | 360/360 | 100 | 266 | 20.0 | 0.26 |
| 1 | 2 | 360/360 | 100 | 275 | 20.9 | 0.28 |
| 2 | 0 | 640/640 | 125 | 320 | 18.9 | 0.43 |
| 2 | 1 | 640/640 | 125 | 320 | 19.7 | 0.41 |
| 2 | 2 | 640/640 | 125 | 320 | 18.8 | 0.48 |
| 3 | 0 | 960/960 | 150 | 320 | 16.1 | 0.59 |
| 3 | 1 | 960/960 | 150 | 308 | 15.9 | 0.53 |
| 3 | 2 | 960/960 | 150 | 320 | 16.3 | 0.60 |

All nine scenarios cleared every enemy with the core intact. CPU timings exclude rendering and do not establish player FPS.

## Player build and visual review

Normal Runehold.app and separate preview macOS builds succeeded. The preview launched. Screenshots confirmed installed fixed mounts with separate gun heads, the academy menu, quantity-frame question, specific wrong-answer hint, worked example and supported-practice record. The raid warning showed 640 contacts; the live player reached Night 2 rewards with 640/640 destroyed and 125/125 core health.

macOS controls/capture were intermittent and sometimes missed input or returned noWindowsAvailable. Combat ended between captures, so continuous gun/bullet alignment and multi-direction turret animation were not visually confirmed throughout a battle. Pose/origin and straight-flight mechanics passed editor checks. More visual play review, screen-size checks and GPU/frame-rate measurement remain necessary. Educational effectiveness and long-term mastery have not been evaluated.

Keyboard: L academy; P practice while academy is open; 1–4 answer choices; H hint; J worked example; Enter supported continuation; N starts a prepared night. These call the same actions as the visible buttons.
