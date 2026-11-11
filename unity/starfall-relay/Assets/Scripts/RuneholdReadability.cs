using UnityEngine;

public sealed partial class RuneholdGame
{
    private bool raidBriefOpen, turretMasteryPurchase;
    private static int SwarmPackSize(int wave) => Mathf.Min(120, 16 + wave * 8);
    private static float SwarmPackInterval(int wave) => Mathf.Max(.18f, .75f - wave * .05f);
    private static float EnemyHealthScale(int wave) => 1 + Mathf.Max(0, wave - 2) * .14f;

    // A deliberately conservative planning model, not a simulated win probability.
    // Compare sustained damage with the incoming stream; mobility, pulse timing and
    // the actual number of enemies caught in each blast still determine the result.
    private float EstimatedDefenseOutput
    {
        get
        {
            float rifleInterval = Mathf.Max(.035f, .1f / (1 + rifleLevels * .1f + astronautLevel * .018f));
            float rifle = RifleDamage * RifleStreams / rifleInterval * 1.6f;
            float blastTargets = Mathf.Min(9, 5 + turretMastery * .12f);
            float cannons = turretCount * TurretDamage / Mathf.Max(.09f, .32f / (1 + turretMastery * .1f)) * blastTargets;
            float drones = droneLevels == 0 ? 0 : Mathf.Min(8, droneLevels + 1) * (1 + droneLevels + astronautLevel / 5) / Mathf.Max(.12f, .55f / (1 + droneLevels * .15f));
            return rifle + cannons + drones;
        }
    }
    private float EstimatedPressure(int wave)
    {
        float health = .8f * Mathf.Max(1, Mathf.RoundToInt(EnemyHealthScale(wave)))
            + .17f * Mathf.RoundToInt(3 * EnemyHealthScale(wave)) + .03f * Mathf.RoundToInt(6 * EnemyHealthScale(wave));
        if (wave % 3 == 0) health += .28f * (Mathf.RoundToInt(6 * EnemyHealthScale(wave)) - Mathf.RoundToInt(EnemyHealthScale(wave)));
        float arrivals = Mathf.Min(SwarmPackSize(wave) / SwarmPackInterval(wave), SwarmCount(wave) / 12f);
        return health * arrivals;
    }
    private float ReadinessRatio => EstimatedDefenseOutput / Mathf.Max(1, EstimatedPressure(night));
    private string ReadinessName => ReadinessRatio < .65f ? "CRITICAL POWER GAP" : ReadinessRatio < 1.05f ? "UPGRADES RECOMMENDED" : "READY TO CHALLENGE";
    private Color ReadinessColor => ReadinessRatio < .65f ? Ember : ReadinessRatio < 1.05f ? Gold : Mint;
    private Upgrade RecommendedUpgrade => turretCount < 4 ? Upgrade.IonTurret : night % 3 == 2 && droneLevels < 2 ? Upgrade.OrbitDrones : Upgrade.IonTurret;
    private string BuildAdvice => coreHp < coreMaxHp * .45f ? "Your core is badly damaged. Upgrade Core Shield to add capacity and integrity."
        : turretCount < 4 ? "Install another Ion Turret: a new cannon adds a whole extra stream of splash damage."
        : night % 3 == 2 && droneLevels < 2 ? "Upgrade Orbit Drones to catch fast skaters at the edges."
        : "Upgrade Ion mastery to strengthen every cannon. Rifle ranks add damage, piercing and spread.";

    private void OpenEquipmentBay(Upgrade upgrade, bool boostCannons = false)
    {
        resourceRoute.Clear(); routeStep = 0;
        turretMasteryPurchase = boostCannons || turretCount >= 4;
        selectedUpgrade = upgrade; astronautUpgradeTab = upgrade >= Upgrade.PlasmaRifle;
        raidBriefOpen = learningPanelOpen = false; buildPanelOpen = true; pilotWalking = false;
    }

    private void DrawEquipmentSigns()
    {
        if (buildPanelOpen || learningPanelOpen || pauseOpen || raidBriefOpen || phase == Phase.Quiz || phase == Phase.UpgradeReveal) return;
        for (int i = 0; i < turretCount; i++)
        {
            Vector2 at = WorldToScreen(turretPads[i] + new Vector2(0, 45));
            if (at.x < 80 || at.x > 1200 || at.y < 135 || at.y > 550) continue;
            at.x += i % 2 == 0 ? -17 : 17;
            Rect sign = new Rect(at.x - 82, at.y, 164, 45);
            bool interactive = phase == Phase.Day;
            bool hover = interactive && sign.Contains(Event.current.mousePosition);
            Color color = hover ? Gold : LearnerAccent;
            DrawBeam(WorldToScreen(turretPads[i] + new Vector2(0, 35)), at, 2, color);
            ConsolePanel(sign, color, hover ? Hex("22364b") : Hex("0a1625"));
            Fill(sign.x + 8, sign.y + 10, 5, 5, color);
            Text("ION " + (i + 1).ToString("00") + " · " + TurretDamage + " DMG", sign.x + 20, sign.y + 3, 140, 22,
                new GUIStyle(labelStyle) { fontSize = 14, wordWrap = false });
            Text(interactive ? "MASTERY " + turretMastery + "  ·  UPGRADE >" : "MASTERY " + turretMastery + "  ·  ONLINE",
                sign.x + 8, sign.y + 24, 152, 18, new GUIStyle(smallStyle) { fontSize = 11, normal = { textColor = color }, wordWrap = false });
            if (interactive && GUI.Button(sign, "", GUIStyle.none)) OpenEquipmentBay(Upgrade.IonTurret, true);
        }
    }

    private void DrawPowerForecast()
    {
        UiCard(new Rect(24, 112, 316, 82), ReadinessColor);
        UiText("Next meteor shower", new Rect(40, 122, 284, 29), 22, true);
        UiText(ReadinessRatio < 1.05f ? "An upgrade can help your ship." : "Your ship is ready to try!", new Rect(40, 155, 284, 30), 18, false, UiMuted);
    }

    private void DrawRaidBriefing()
    {
        OverlayShade(.8f); UiCard(new Rect(160, 86, 960, 662), Gold);
        UiText("Ready for night " + night + "?", new Rect(196, 110, 888, 55), 36, true);
        UiText("A shower of " + SwarmCount(night).ToString("N0") + " elemental meteors is on its way.", new Rect(196, 180, 888, 52), 26);
        UiText("Your tools", new Rect(196, 265, 340, 36), 25, true, UiBlue);
        UiRound(new Rect(196, 315, 888, 24), Hex("e0e9f3"), 11);
        UiRound(new Rect(196, 315, Mathf.Max(20, 888 * Mathf.Clamp01(ReadinessRatio / 1.5f)), 24), Hex("3eb5a2"), 11);
        UiText(ReadinessRatio < .65f ? "Let's give the ship more power" : ReadinessRatio < 1.05f ? "One more upgrade could help" : "Your ship is ready to try!", new Rect(196, 361, 888, 48), 30, true, UiBlue);
        string advice = ReadinessRatio < .65f ? "This shower is much stronger than your tools. Upgrade first to give your ship a chance. There is no rush."
            : ReadinessRatio < 1.05f ? "More meteors need more power. Build another tower or improve your tools before you start."
            : "Keep moving and use Nova when it is ready. Later nights bring bigger showers, so keep learning and upgrading.";
        UiText(advice, new Rect(196, 430, 888, 102), 26);
        UiText("A planning guide, not a promise. Your movement and timing matter too.", new Rect(196, 557, 888, 50), 20, false, UiMuted);
        if (MenuButton("Upgrade first", new Rect(196, 640, 430, 76), Cyan, true, true)) OpenEquipmentBay(coreHp < coreMaxHp * .45f ? Upgrade.CoreShield : RecommendedUpgrade);
        if (MenuButton("Start the shower", new Rect(644, 640, 440, 76), Gold)) LaunchWarnedRaid();
        if (MenuButton("Back", new Rect(24, 20, 116, 58), Cyan)) raidBriefOpen = false;
    }

    private void ConsolePanel(Rect rect, Color accent, Color fill)
    {
        Fill(rect.x, rect.y + 5, rect.width, rect.height, new Color(0, 0, 0, .35f));
        Fill(rect.x, rect.y, rect.width, rect.height, Hex("30465c"));
        Fill(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, fill);
        Fill(rect.x + 1, rect.y + 1, 3, rect.height - 2, accent);
        Fill(rect.x + 5, rect.y + 1, rect.width - 6, 1, new Color(1, 1, 1, .1f));
        Fill(rect.xMax - 8, rect.y + 5, 3, 3, accent);
        Fill(rect.x + 6, rect.yMax - 8, 3, 3, accent);
    }
}
