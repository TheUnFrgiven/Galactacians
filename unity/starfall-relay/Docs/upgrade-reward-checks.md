# Upgrade and reward verification

Historical results before endless progression. Costs, upgrade caps, rewards and shield growth have since changed; see [endless-progression.md](endless-progression.md). These old checks are not current progression validation.

The macOS player build succeeded with the new upgrade and reward flow. The running player was visually inspected: all three hardware types appear on the deck and the ship systems panel matches the installed counts. Opening the B menu shows each upgrade's artwork, costs, slot limits and missing material amounts.

The editor command `RuneholdEconomyChecks.Run` passed. It invokes the actual purchase, answer, salvage collection and reward claim methods on temporary game instances, without interacting with the active player run.

- Correct first-try turret purchase pays 3 alloy and 1 crystal, returns exactly 1 alloy, installs one turret and opens the reveal.
- Repeating an answer after installation does not duplicate hardware or rewards.
- Wrong answers do not spend materials. A retry success gives no first-try refund. After two wrong attempts a worked explanation offers supported installation at the normal price without a refund.
- Insufficient resources and capped shield slots do not grant upgrades or rewards.
- Shield purchases add and restore exactly 25 integrity.
- Salvage rig purchases immediately increase an uncollected alloy cache to 4 and a crystal cache to 3. Repeated proximity checks do not duplicate collection.
- Wave rewards remain pending until claimed. A clean first wave offers 3 alloy and 2 crystal; a damaged core offers 3 alloy and 1 crystal. Claiming applies those exact amounts and advances one day; a repeated claim changes nothing.
- 3,000 curriculum questions (1,000 per lesson) had exact bounded answers, nonempty strategy hints and explanations, four unique choices and exactly one correct choice.

The accounting checks do not establish full combat balance or inspect every screen size. The final mission completes at Night 3; supplies are awarded only when another preparation day remains.
