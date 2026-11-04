using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D shieldTexture, salvageRigTexture;
    private Rect turretUv, shieldUv, salvageRigUv;
    private readonly Vector2[] shieldPads = { new Vector2(425, 365), new Vector2(855, 365) };
    private readonly Vector2[] salvagePads = { new Vector2(505, 570), new Vector2(775, 570) };
    private readonly float[] turretFireTimers = new float[4];
    private readonly float[] turretMuzzleFlash = new float[4];
    private Vector2 installationPosition;
    private string installationBefore, installationAfter;
    private int installationAlloyCost, installationCrystalCost, installationRebate, totalCalibrationAlloy;
    private float installationAge, rewardHudFlash;
    private int waveStartHp, waveMeteorsDestroyed, dawnAlloyReward, dawnCrystalReward;
    private bool dawnCleanDefense, dawnRewardsPending, waveCoreHit;

    private void LoadUpgradeArtwork()
    {
        shieldTexture = Resources.Load<Texture2D>("Art/ShieldGenerator");
        salvageRigTexture = Resources.Load<Texture2D>("Art/SalvageRig");
        turretUv = TrimTransparentBorder(turretTexture, new Rect(0, 0, 1, 1));
        shieldUv = TrimTransparentBorder(shieldTexture, new Rect(0, 0, 1, 1));
        salvageRigUv = TrimTransparentBorder(salvageRigTexture, new Rect(0, 0, 1, 1));
    }

    private void UpgradeCost(Upgrade upgrade, out int alloyCost, out int crystalCost)
    {
        int level = UpgradeLevel(upgrade);
        alloyCost = (upgrade == Upgrade.CoreShield ? 4 : 3) + level * 2;
        crystalCost = (upgrade == Upgrade.IonTurret ? 1 : 2) + level / 2;
    }

    private int UpgradeLevel(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? turretCount + turretMastery :
        upgrade == Upgrade.CoreShield ? shieldLevels + shieldMastery : upgrade == Upgrade.SalvageRig ? salvageLevels + salvageMastery :
        upgrade == Upgrade.PlasmaRifle ? rifleLevels : upgrade == Upgrade.OrbitDrones ? droneLevels : regenerationLevels;
    private static int UpgradeMaximum(Upgrade upgrade) => int.MaxValue;
    private int HardwareCount(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? turretCount : upgrade == Upgrade.CoreShield ? shieldLevels : salvageLevels;
    private static int HardwareSlots(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? 4 : 2;
    private static string UpgradeName(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? "ION TURRET" : upgrade == Upgrade.CoreShield ? "CORE SHIELD" :
        upgrade == Upgrade.SalvageRig ? "SALVAGE RIG" : upgrade == Upgrade.PlasmaRifle ? "PLASMA RIFLE" : upgrade == Upgrade.OrbitDrones ? "ORBIT DRONES" : "REGEN REACTOR";
    private static Color UpgradeColor(Upgrade upgrade) => upgrade == Upgrade.IonTurret || upgrade == Upgrade.PlasmaRifle ? Cyan :
        upgrade == Upgrade.CoreShield || upgrade == Upgrade.Regeneration ? Mint : Gold;

    private string UpgradeBenefit(Upgrade upgrade, bool next)
    {
        int level = UpgradeLevel(upgrade) + (next ? 1 : 0);
        if (upgrade == Upgrade.IonTurret)
        {
            if (!next) return turretCount + " cannons · " + TurretDamage + " damage each";
            return turretCount < 4 && !turretMasteryPurchase ? (turretCount + 1) + " cannons · " + TurretDamage + " damage each"
                : "ALL cannons: " + (TurretDamage + 2) + " damage + faster / wider blasts";
        }
        if (upgrade == Upgrade.CoreShield) return (coreMaxHp + (next ? 25 + level * 5 : 0)) + " maximum core integrity";
        if (upgrade == Upgrade.PlasmaRifle) return (RifleDamage + (next ? 1 : 0)) + " damage · spread every 3 ranks";
        if (upgrade == Upgrade.OrbitDrones) return Mathf.Min(8, level == 0 ? 0 : level + 1) + " drones · " + (1 + level + astronautLevel / 5) + " damage";
        if (upgrade == Upgrade.Regeneration) return level + " reactor ranks · repairs core during combat";
        return (3 + level) + " alloy / " + (2 + level) + " crystal per cache";
    }

    private static string UpgradeDetail(Upgrade upgrade)
        => upgrade == Upgrade.IonTurret ? "Build more cannons or boost every installed cannon. No mastery cap."
        : upgrade == Upgrade.CoreShield ? "Grow core capacity and restore the added integrity."
        : upgrade == Upgrade.SalvageRig ? "Increase all cache rewards and movement speed."
        : upgrade == Upgrade.PlasmaRifle ? "More damage, piercing, speed and spread; rank 8 adds blasts."
        : upgrade == Upgrade.OrbitDrones ? "Orbiting companions sweep nearby enemies automatically."
        : "Regenerate core integrity continuously during combat.";

    private Vector2 NextUpgradePosition(Upgrade upgrade)
    {
        int level = Mathf.Min(HardwareCount(upgrade), HardwareSlots(upgrade) - 1);
        return upgrade == Upgrade.IonTurret ? turretPads[level] : upgrade == Upgrade.CoreShield ? shieldPads[level] : salvagePads[level];
    }

    private void OpenNearbyUpgrade()
    {
        float bestDistance = 125;
        bool found = false, installedCannon = false;
        foreach (Upgrade upgrade in new[] { Upgrade.IonTurret, Upgrade.CoreShield, Upgrade.SalvageRig })
        {
            if (UpgradeLevel(upgrade) >= UpgradeMaximum(upgrade)) continue;
            for (int i = 0; i < HardwareSlots(upgrade); i++)
            {
                Vector2 at = upgrade == Upgrade.IonTurret ? turretPads[i] : upgrade == Upgrade.CoreShield ? shieldPads[i] : salvagePads[i];
                if (i > HardwareCount(upgrade)) continue;
                float distance = Vector2.Distance(pilotPosition, at);
                if (distance >= bestDistance) continue;
                bestDistance = distance; selectedUpgrade = upgrade; found = true; installedCannon = upgrade == Upgrade.IonTurret && i < turretCount;
            }
        }
        if (found) OpenEquipmentBay(selectedUpgrade, installedCannon);
        else { notice = "Press B for upgrades, or approach any cannon or construction pad and press E."; noticeTimer = 3; }
    }

    private void DrawUpgradeArt(Upgrade upgrade, Vector2 position, float height, Color tint)
    {
        if (upgrade >= Upgrade.PlasmaRifle)
        {
            string symbol = upgrade == Upgrade.PlasmaRifle ? ">>" : upgrade == Upgrade.OrbitDrones ? "*" : "+";
            DrawPixelEllipse(position, height * .42f, height * .42f, new Color(tint.r * .1f, tint.g * .2f, tint.b * .3f, tint.a));
            TextCentered(symbol, position.x - height / 2, position.y - height / 2, height, height,
                new GUIStyle(hugeStyle) { fontSize = Mathf.RoundToInt(height * .6f), normal = { textColor = UpgradeColor(upgrade) } });
            return;
        }
        Texture2D texture = upgrade == Upgrade.IonTurret ? turretTexture : upgrade == Upgrade.CoreShield ? shieldTexture : salvageRigTexture;
        Rect uv = upgrade == Upgrade.IonTurret ? turretUv : upgrade == Upgrade.CoreShield ? shieldUv : salvageRigUv;
        DrawTrimmedSprite(texture, uv, position, height, tint);
    }

    private void DrawShipEquipment()
    {
        if (shieldLevels > 0)
        {
            Color shieldColor = new Color(.3f, .9f, 1f, .45f + .12f * Mathf.Sin(corePulse * 2));
            for (int i = 0; i < 48; i++)
            {
                float a = i * Mathf.PI * 2 / 48;
                Vector2 point = corePosition + new Vector2(Mathf.Cos(a) * 166, Mathf.Sin(a) * 148);
                Fill(Mathf.Round(point.x), Mathf.Round(point.y), 7, 4, shieldColor);
            }
        }
        foreach (Upgrade upgrade in new[] { Upgrade.IonTurret, Upgrade.CoreShield, Upgrade.SalvageRig })
        {
            int level = HardwareCount(upgrade), maximum = HardwareSlots(upgrade);
            for (int i = 0; i < maximum; i++)
            {
                Vector2 position = upgrade == Upgrade.IonTurret ? turretPads[i] : upgrade == Upgrade.CoreShield ? shieldPads[i] : salvagePads[i];
                bool installed = i < level;
                if (installed)
                {
                    DrawPixelEllipse(position + new Vector2(0, 33), 37, 10, new Color(.01f, .02f, .04f, .7f));
                    if (upgrade == Upgrade.IonTurret) DrawCombatTurret(i, position, Color.white);
                    else DrawUpgradeArt(upgrade, position + new Vector2(0, -12), 104, Color.white);
                    Fill(position.x - 28, position.y + 39, 56, 3, UpgradeColor(upgrade));
                }
                else if (phase == Phase.Day && i == level)
                {
                    Color color = UpgradeColor(upgrade);
                    DrawPixelEllipse(position + new Vector2(0, 22), 36, 9, new Color(color.r, color.g, color.b, .17f));
                    DrawUpgradeArt(upgrade, position + new Vector2(0, -8), 76, new Color(color.r, color.g, color.b, .28f));
                    bool nearby = Vector2.Distance(pilotPosition, position) < 125;
                    if (nearby || (upgrade == Upgrade.IonTurret && turretCount == 0))
                        TextCentered(nearby ? "[E] " + UpgradeName(upgrade) : "BUILD TURRET [B]", position.x - 105, position.y + 38, 210, 25,
                            new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold, normal = { textColor = color } });
                    if (!pauseOpen && !buildPanelOpen && !learningPanelOpen && GUI.Button(new Rect(position.x - 44, position.y - 50, 88, 90), "", GUIStyle.none))
                    { OpenEquipmentBay(upgrade); }
                }
            }
        }
        if (phase == Phase.UpgradeReveal)
        {
            float pulse = 50 + Mathf.Sin(installationAge * 4) * 5;
            DrawPixelEllipse(installationPosition + new Vector2(0, 40), pulse, 10, new Color(.5f, 1f, .75f, .25f));
            TextCentered("NEW · " + UpgradeName(selectedUpgrade), installationPosition.x - 130, installationPosition.y - 95, 260, 26,
                new GUIStyle(labelStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = Mint } });
        }
    }

    private void DrawShipSystems()
    {
        if (phase != Phase.Day || buildPanelOpen || learningPanelOpen || pauseOpen) return;
        Fill(30, 250, 300, 132, new Color(.025f, .045f, .09f, .94f));
        Text("SHIP SYSTEMS", 48, 259, 270, 23, new GUIStyle(smallStyle) { fontStyle = FontStyle.Bold, normal = { textColor = Gold } });
        Upgrade[] systems = { Upgrade.IonTurret, Upgrade.CoreShield, Upgrade.SalvageRig };
        for (int i = 0; i < systems.Length; i++)
        {
            float x = 80 + i * 100;
            DrawUpgradeArt(systems[i], new Vector2(x, 315), 48, UpgradeLevel(systems[i]) > 0 ? Color.white : new Color(.5f, .65f, .8f, .5f));
            TextCentered("LV " + UpgradeLevel(systems[i]), x - 37, 343, 74, 23,
                new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = UpgradeLevel(systems[i]) > 0 ? Mint : Cream } });
        }
        if (phase == Phase.Day && PixelButton("UPGRADES  [B]", 30, 391, 300, 40, Hex("24677a"))) buildPanelOpen = true;
    }

    private void DrawEngineeringBay()
    {
        OverlayShade(.64f);
        MenuCard(new Rect(270, 135, 740, 530), Gold);
        Text("ASCENSION BAY", 300, 155, 500, 38, titleStyle);
        if (PixelButton("DEFENSES", 302, 200, 180, 29, !astronautUpgradeTab ? Hex("277c8e") : PanelLight)) astronautUpgradeTab = false;
        if (PixelButton("ASTRONAUT", 495, 200, 180, 29, astronautUpgradeTab ? Hex("277c8e") : PanelLight)) astronautUpgradeTab = true;
        if (PixelButton("CLOSE  [B]", 840, 156, 138, 38, Hex("36485d"))) buildPanelOpen = false;
        DrawUpgradeRow(astronautUpgradeTab ? Upgrade.PlasmaRifle : Upgrade.IonTurret, 235);
        DrawUpgradeRow(astronautUpgradeTab ? Upgrade.OrbitDrones : Upgrade.CoreShield, 357);
        DrawUpgradeRow(astronautUpgradeTab ? Upgrade.Regeneration : Upgrade.SalvageRig, 479);
        Text("FIRST-TRY REWARD: +1 alloy after each perfect calibration.", 302, 605, 660, 26, new GUIStyle(smallStyle) { normal = { textColor = Gold } });
        Text("[1–3] buy · [T] new pad / boost all · [TAB] switch bays · math confirms upgrades.", 302, 635, 660, 21, smallStyle);
    }

    private void DrawUpgradeRow(Upgrade upgrade, int y)
    {
        bool maxed = UpgradeLevel(upgrade) >= UpgradeMaximum(upgrade);
        bool locked = upgrade != Upgrade.IonTurret && turretCount == 0;
        bool canBuy = CanBuy(upgrade);
        bool selected = selectedUpgrade == upgrade;
        Color color = UpgradeColor(upgrade);
        Fill(300, y, 680, 110, selected ? Hex("263b50") : Hex("192b40"));
        Fill(300, y, 4, 110, color);
        DrawUpgradeArt(upgrade, new Vector2(350, y + 53), 62, maxed ? new Color(.6f, 1f, .8f) : Color.white);
        Text(UpgradeName(upgrade) + "  R" + UpgradeLevel(upgrade), 401, y + 8, upgrade == Upgrade.IonTurret ? 160 : 360, 25,
            new GUIStyle(labelStyle) { fontSize = upgrade == Upgrade.IonTurret ? 16 : 17 });
        if (upgrade == Upgrade.IonTurret)
        {
            if (turretCount >= 4) turretMasteryPurchase = true;
            if (PixelButton("NEW PAD", 570, y + 7, 88, 25, !turretMasteryPurchase ? Hex("277c8e") : PanelLight) && turretCount < 4) turretMasteryPurchase = false;
            if (PixelButton("BOOST ALL", 666, y + 7, 97, 25, turretMasteryPurchase ? Hex("277c8e") : PanelLight) && turretCount > 0) turretMasteryPurchase = true;
        }
        Text(maxed ? "All slots installed." : UpgradeBenefit(upgrade, false) + " → " + UpgradeBenefit(upgrade, true), 401, y + 36, 360, 36, smallStyle);
        UpgradeCost(upgrade, out int alloyCost, out int crystalCost);
        Text(maxed ? UpgradeDetail(upgrade) : "COST  " + alloyCost + " ALLOY + " + crystalCost + " CRYSTAL", 401, y + 79, 360, 22,
            new GUIStyle(smallStyle) { normal = { textColor = color } });
        string buttonText = maxed ? "INSTALLED" : locked ? "TURRET FIRST" : canBuy ? (upgrade == Upgrade.IonTurret && turretMasteryPurchase ? "UPGRADE + MATH" : "INSTALL + MATH") : "GATHER SALVAGE";
        if (PixelButton(buttonText, 790, y + 17, 170, 43, canBuy ? Hex("277c8e") : Hex("364253")))
        {
            selectedUpgrade = upgrade;
            if (canBuy) StartUpgrade(upgrade);
            else { notice = maxed ? "All " + UpgradeName(upgrade) + " slots are installed." : locked ? "Install your first Ion Turret to unlock the other ship systems." : MissingMaterials(upgrade); noticeTimer = 4; }
        }
        TextCentered(maxed ? "MAX LEVEL" : locked ? "Unlocks after first cannon" : canBuy ? "Materials ready" : MissingMaterials(upgrade), 786, y + 66, 178, 36,
            new GUIStyle(smallStyle) { fontSize = 12, alignment = TextAnchor.MiddleCenter, normal = { textColor = canBuy ? Mint : Gold } });
    }

    private string MissingMaterials(Upgrade upgrade)
    {
        UpgradeCost(upgrade, out int alloyCost, out int crystalCost);
        int missingAlloy = Mathf.Max(0, alloyCost - alloy), missingCrystal = Mathf.Max(0, crystalCost - crystal);
        if (missingAlloy > 0 && missingCrystal > 0) return "Need " + missingAlloy + " alloy + " + missingCrystal + " crystal";
        if (missingAlloy > 0) return "Need " + missingAlloy + " more alloy";
        if (missingCrystal > 0) return "Need " + missingCrystal + " more crystal";
        return "Materials ready";
    }

    private void DrawUpgradeReveal()
    {
        Fill(30, 250, 340, 388, new Color(.025f, .045f, .09f, .98f));
        Fill(30, 250, 340, 5, Mint);
        Text("UPGRADE INSTALLED", 50, 268, 300, 33, new GUIStyle(titleStyle) { fontSize = 23, normal = { textColor = Mint } });
        DrawUpgradeArt(selectedUpgrade, new Vector2(200, 354), 90, Color.white);
        TextCentered(UpgradeName(selectedUpgrade), 50, 411, 300, 28, new GUIStyle(labelStyle) { alignment = TextAnchor.MiddleCenter });
        Text(installationBefore + "\n→ " + installationAfter, 50, 448, 300, 54, smallStyle);
        Text("PAID  " + installationAlloyCost + " alloy + " + installationCrystalCost + " crystal", 50, 512, 300, 22, smallStyle);
        Text(installationRebate > 0 ? "INDEPENDENT CALIBRATION  +1 ALLOY" : "SUPPORTED CALIBRATION · hardware online", 50, 543, 300, 32,
            new GUIStyle(smallStyle) { fontStyle = FontStyle.Bold, normal = { textColor = installationRebate > 0 ? Gold : Mint } });
        Text("CONTROL LOAD: " + question.Answer + " cells · + " + (questionSupported ? 4 : 10) + " learning XP", 50, 570, 300, 21, new GUIStyle(smallStyle) { fontSize = 11 });
        if (PixelButton("BACK TO DECK [ENTER]", 50, 590, 300, 39, Hex("277c8e"))) phase = Phase.Day;
    }

    private void DrawWaveRewards()
    {
        OverlayShade(.72f);
        Fill(310, 150, 660, 500, Ink); Fill(310, 150, 660, 6, Gold);
        TextCentered("NIGHT " + night + " SURVIVED", 340, 176, 600, 54, new GUIStyle(hugeStyle) { fontSize = 34 });
        TextCentered(waveMeteorsDestroyed + " / " + enemyCountToSpawn + " meteors destroyed · core " + coreHp + " / " + coreMaxHp, 340, 240, 600, 30,
            new GUIStyle(labelStyle) { alignment = TextAnchor.MiddleCenter });
        TextCentered("LEVEL " + astronautLevel + " · " + AscensionTitle + " · NEXT SWARM " + SwarmCount(night + 1), 340, 285, 600, 27, new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = Gold } });
        Fill(354, 326, 270, 134, Panel); Fill(656, 326, 270, 134, Panel);
        DrawPickup(MaterialKind.Alloy, new Vector2(411, 385), 68, Color.white);
        DrawPickup(MaterialKind.Crystal, new Vector2(713, 385), 68, Color.white);
        Text("+" + dawnAlloyReward + " ALLOY", 463, 346, 150, 40, new GUIStyle(labelStyle) { normal = { textColor = Cyan } });
        Text(alloy + " → " + (alloy + dawnAlloyReward) + " in hold", 463, 402, 150, 28, smallStyle);
        Text("+" + dawnCrystalReward + " CRYSTAL", 765, 346, 150, 40, new GUIStyle(labelStyle) { normal = { textColor = Gold } });
        Text(crystal + " → " + (crystal + dawnCrystalReward) + " in hold", 765, 402, 150, 28, smallStyle);
        TextCentered(dawnCleanDefense ? "CLEAN DEFENSE: +1 bonus crystal included." : "Keep the core undamaged next wave for +1 crystal.", 340, 478, 600, 32,
            new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = dawnCleanDefense ? Mint : Cream } });
        TextCentered("All power kept · core repairs 20% · the expedition continues", 340, 521, 600, 28, new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter });
        if (PixelButton("CLAIM + CONTINUE [ENTER]", 355, 575, 570, 52, Hex("277c8e"))) ClaimWaveRewards();
    }

    private void ClaimWaveRewards()
    {
        if (phase != Phase.Dawn || !dawnRewardsPending) return;
        dawnRewardsPending = false;
        alloy += dawnAlloyReward;
        crystal += dawnCrystalReward;
        rewardHudFlash = 3;
        BeginNextDay();
        notice = "REWARDS CLAIMED  +" + dawnAlloyReward + " alloy + " + dawnCrystalReward + " crystal · press B to upgrade.";
        noticeTimer = 5;
        SaveExpedition();
    }

    private void DrawRewardHudPulse()
    {
        if (rewardHudFlash <= 0) return;
        Color color = new Color(1, .8f, .35f, .35f + .3f * Mathf.Sin(corePulse * 8));
        Fill(922, 20, 326, 3, color); Fill(922, 75, 326, 3, color);
    }
}
