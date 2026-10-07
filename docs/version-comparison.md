# Galactacians version comparison

Updated 7 October 2026 after playing the current build, the desktop v2 copy, and Claude's `claude/basics` build. The standalone HTML on the desktop is byte-for-byte the packaged Claude build, so it is recorded as a packaging check rather than a fourth design.

## What is worth keeping

### Current v2

- The five-role roster is small enough to understand: rapid Pebble, armor-breaking Prism, blocking Bricky, slowing Frost, and crowd-clearing Poppy.
- Authored waves create actual placement reasons. The lane warnings come from the real schedule, and the alien's movement toward Earth makes danger legible.
- Earth rotates and changes to a worried face when a live alien enters the danger columns.
- Waves flow automatically. The player gets a short build window instead of a Start button before every wave.
- Menu, Practice, cosmetic stars, local saves, touch layout, and reduced-motion behavior give the game a coherent shell without the old sidebar paperwork.

### Claude's basics branch

- Buying a tower with an arithmetic answer gives math an immediate, visible purpose.
- The shop cards communicate difficulty, tower role, and the problem together. Typed answers and operand-specific hints are a good direction for learning.
- First-try answers charge Star Beam, and the longer campaign structure gives future learning progress somewhere to go.
- The pure core simulation, seeded waves, local answer log, and standalone build are useful foundations for a later campaign layer.

## What needs changing

### Current v2 before this revision

- A player could win every mission without answering math. Energy came from a generous allowance, wave clears, and kills, so the “Math + Energy” button was optional.
- The dark galaxy treatment and large range boxes competed with the lane structure. The field now uses pale green ribbons and short blue range marks.

### Claude's basics branch

- A full mission requires nine shop questions and three manual wave starts. The played flow finished, but it has more gates than the continuous battle rhythm calls for.
- New-alien cards and tower-teaching cards pause the action repeatedly. These are useful onboarding ideas, but they need to become short, skippable cues.
- The current branch can give a weaker Pebble after a mistake on a Medium or Hard card, which can feel like double punishment while a child is learning.
- “See the board” closes the shop and reopening it generates a fresh shop, so a player can fish for a more comfortable card.
- Helped answers are recorded as first-try answers in the learner model, which overstates independent success and charges Star Beam.
- The Windows `npm run balance` entry guard does not print because it compares a file URL with a Windows path. That portability issue is fixed before publishing the branch.
- The branch has a richer campaign concept, but its six-tower/24-mission scope is a later expansion and is not merged into the five-role playable slice.

## Decision for the published main branch

Main keeps the current v2 battle and shell, adopts the direct math purpose, and preserves continuous waves. An attempt begins with six energy. A correct battle answer adds three energy; kills and wave clears add nothing. The first six-energy formation can act immediately, but additional meaningful towers require a solved question. Hints still arrive at ten seconds and the worked answer at twenty seconds; revealed answers do not award energy or learning credit.

The two desktop v2 plays and the current v2 play each completed First contact with three stars and zero questions before the economy change. After the change, browser strategy checks win the six missions with math-funded reinforcements, while a starter-only formation loses without passive energy. Claude's source and standalone builds both completed the same played mission with nine questions and three manual starts; no browser exceptions occurred.

These are engineering checks, not evidence that children enjoy the game or learn more from it. The next decision should come from observing children use the revised math-to-tower loop.
