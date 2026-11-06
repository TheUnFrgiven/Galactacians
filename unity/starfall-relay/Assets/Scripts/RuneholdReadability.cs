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
        ConsolePanel(new Rect(26, 153, 280, 103), ReadinessColor, Hex("10273f"));
        Text("NIGHT " + night + " · " + SwarmCount(night).ToString("N0") + " CONTACTS", 40, 161, 250, 23,
            new GUIStyle(smallStyle) { normal = { textColor = Cyan } });
        Text(ReadinessName, 40, 188, 250, 25, new GUIStyle(labelStyle) { fontSize = 16, normal = { textColor = ReadinessColor } });
        ProgressBar(40, 226, 250, 10, ReadinessRatio / 1.5f, ReadinessColor);
    }

    private void DrawRaidBriefing()
    {
        OverlayShade(.88f);
        ConsolePanel(new Rect(216, 115, 848, 574), ReadinessColor, Hex("101f32"));
        Text("MISSION CONTROL  /  LAUNCH BRIEFING", 246, 133, 760, 26, new GUIStyle(labelStyle) { fontSize = 15, normal = { textColor = LearnerAccent } });
        Text("NIGHT " + night + "  ·  " + ThreatName(night), 246, 176, 788, 45, titleStyle);
        Text(ThreatDescription(night), 248, 226, 780, 50, labelStyle);
        Text(ReadinessName, 248, 292, 780, 32, new GUIStyle(titleStyle) { fontSize = 23, normal = { textColor = ReadinessColor } });
        Text(SwarmCount(night).ToString("N0") + " contacts    ·    " + EnemyHealthScale(night).ToString("0.00") + "× enemy hull    ·    core " + coreHp + "/" + coreMaxHp, 248, 335, 780, 27, labelStyle);
        Text("YOUR OUTPUT  " + Mathf.RoundToInt(EstimatedDefenseOutput) + "     /     SWARM PRESSURE  " + Mathf.RoundToInt(EstimatedPressure(night)) + " estimated damage/sec", 248, 375, 780, 25, smallStyle);
        ProgressBar(248, 411, 780, 15, ReadinessRatio / 1.5f, ReadinessColor);
        string warning = ReadinessRatio < .65f
            ? "Your firepower is far below this swarm's pressure. Without several effective upgrades, surviving will be almost impossible."
            : ReadinessRatio < 1.05f ? "The swarm may overwhelm this build. Upgrade before launch, or accept a harder fight with careful movement and Nova Pulses."
            : "Your build meets the planning target. Keep upgrading: later nights bring more enemies, tougher hulls and faster reinforcements.";
        Text(warning, 248, 446, 780, 61, new GUIStyle(labelStyle) { fontSize = 18 });
        Text(BuildAdvice, 248, 517, 780, 49, smallStyle);
        Text("Planning estimate: 5–9 targets per cannon blast, 1.6 rifle hits. Aim, spacing, pulse timing and core health still affect survival.", 248, 571, 780, 41,
            new GUIStyle(smallStyle) { fontSize = 12 });
        if (PixelButton("UPGRADE FIRST", 248, 627, 370, 40, Hex("266a7e"))) OpenEquipmentBay(coreHp < coreMaxHp * .45f ? Upgrade.CoreShield : RecommendedUpgrade);
        if (PixelButton((ReadinessRatio < 1.05f ? "LAUNCH ANYWAY" : "LAUNCH NIGHT"), 638, 627, 390, 40, ReadinessRatio < 1.05f ? Hex("97503f") : Hex("306c58"))) LaunchWarnedRaid();
        if (MenuButton("Back to deck", new Rect(216, 703, 240, 46), Cyan)) raidBriefOpen = false;
        Text("Preparation has no time limit.", 484, 709, 580, 34, smallStyle);
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
