# Maths and resource logic for review — 11 November 2026

This records the implemented rules and a proposal. The question generator, grading, costs and lesson-unlock rules have not been replaced by the proposal.

## Implemented loop

1. Move manually and collect Metal and Crystal. Collector increases the yield per pile.
2. Choose a tool and afford both resource costs. All upgrades are blocked until the first Tower, except Tower itself.
3. Answer one question from the active lesson. Cancelling does not spend resources. Finishing with help still installs the complete upgrade for its normal cost.
4. A first-try answer without a hint, model-step action, mistake or worked example gives 10 maths points and refunds 1 Metal. A supported completion gives 4 points without that refund. Passive viewing of the model is not marked as help.
5. Survive a night, claim its supplies once and prepare again. There is no final night or question-count completion cap. A practice session has five questions, but can be repeated indefinitely; it does not supply ship resources.

## Actual costs

`rank` is the current level before the purchase. Tower rank includes installed Towers and shared Tower upgrades. Shield rank includes installed Shields and later Shield upgrades. Other tools use their own level.

| Current rank | Tower: Metal / Crystal | Shield: Metal / Crystal | Other tools: Metal / Crystal |
| --- | --- | --- | --- |
| 0 | 3 / 1 | 4 / 2 | 3 / 2 |
| 1 | 5 / 1 | 6 / 2 | 5 / 2 |
| 2 | 7 / 2 | 8 / 3 | 7 / 3 |
| 3 | 9 / 2 | 10 / 3 | 9 / 3 |

Metal cost is 3 + 2 × rank, or 4 + 2 × rank for Shield. Crystal cost is 1 + floor(rank / 2) for Tower, otherwise 2 + floor(rank / 2).

There are two Metal piles and two Crystal piles each day. Each Metal pile gives `3 + Collector rank + floor(night / 3)`; each Crystal pile gives `2 + Collector rank + floor(night / 3)`. On Day 1, this is 6 Metal and 4 Crystal in total without Collector, or 8 Metal and 6 Crystal with Collector level 1.

Night rewards give `2 + 2 × night + floor(pilot level / 2)` Metal and `1 + floor(night / 2)` Crystal, with one bonus Crystal when Health took no damage. These supplies and the Collector compete with spending on immediate protection or attack.

## Question progression

| Lesson | Upgrade questions | Example |
| --- | --- | --- |
| Addition | A fixed bank of 10 addition facts, answers up to 10 | 3 + 2 = 5 |
| Subtraction | A fixed bank of 10 nonnegative subtraction facts | 8 − 3 = 5 |
| Make ten | A fixed bank crossing ten, answers below 20 | 8 + 5 = (8 + 2) + 3 = 13 |
| Multiplication | Generated equal groups, generally factors 1–9 | 3 × 4 = 12 |
| Division | Generated exact divisions, no remainders | 12 ÷ 3 = 4 |
| Mixed maths | Generated mixtures of the four operations | Read the sign first |

Two **different independently completed upgrade facts**, plus a milestone credited every third night, unlock the next upgrade lesson. Ordinary practice records learning but does not substitute for upgrade-check evidence. All six lessons are already open for practice.

Mistakes, supported answers and facts due for review get more selection weight. The immediately previous fact is avoided. Review is scheduled for the next day after supported work; independent work normally returns after three days, or seven after independent answers on at least three different days. This is spaced fact practice, not a full assessment of conceptual understanding.

Practice has Level 1 / Level 2 / Level 3 settings. Small-number practice is easier. However, Level 2 and Level 3 overlap substantially: Level 3 mostly removes trivial zero/one cases rather than introducing a new mathematical range. Tool price or upgrade rank does **not** directly increase question difficulty.

No answer timer is used. The first wrong attempt offers support and another try; after the second, a worked example allows supported completion. Five completed puzzles in a local day award a cosmetic star and color credit once that day. More practice and upgrades remain available.

## Honest assessment

The game has a real spending choice, but the maths currently only authorizes that choice. A question about abstract energy cells generally does not calculate the actual bill, remaining inventory, Collector yield or Shield protection. The lesson gates also accept only two facts plus a combat milestone; that is weak evidence of mastery. Harder upgrade prices do not automatically mean harder mathematical reasoning. The no-help resource refund may also discourage a child from asking for help.

## Proposed connection — waiting for approval

Use real game state to generate decisions, with the difficulty introduced through Bot's explanation and a worked example:

- **Addition:** two actual Metal piles yield 3 each; calculate the 6 Metal collected.
- **Subtraction:** 8 Metal minus the first Tower's 3-Metal cost leaves 5 before any bonus. Show the inventory change directly after purchase.
- **Multiplication:** Collector makes two piles yield 4 Metal each; calculate the day's 8 Metal and compare it with the previous 6.
- **Division:** a 50-point Shield absorbs 2 damage per hit; calculate 25 such hits. Use protection quantities only when the learner is ready for that range.
- **Mixed planning:** compare spending on Tower now, Shield before the next night, or Collector for more supplies later. Calculate actual changing costs; do not pretend successive Tower upgrades have equal prices.

Introduce harder reasoning from demonstrated skill, with short reviews of earlier concepts. Keep resource budgets and enemy pressure understandable, so a wrong answer alone does not punish the child. Consider replacing the no-help Metal refund with recognition that does not reduce the value of using help. These are proposals, not changes already made to the maths rules.
