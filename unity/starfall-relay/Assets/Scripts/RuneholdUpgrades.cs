using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D shieldTexture, salvageRigTexture;
    private Rect turretUv, shieldUv, salvageRigUv;
    private readonly Vector2[] shieldPads = { DeckPoint(188, 360), DeckPoint(1090, 360) };
    private readonly Vector2[] salvagePads = { DeckPoint(640, 86), DeckPoint(640, 715) };
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
    private static string UpgradeName(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? "Tower" : upgrade == Upgrade.CoreShield ? "Shield" :
        upgrade == Upgrade.SalvageRig ? "Collector" : upgrade == Upgrade.PlasmaRifle ? "Blaster" : upgrade == Upgrade.OrbitDrones ? "Drones" : "Repair";
    private static Color UpgradeColor(Upgrade upgrade) => upgrade == Upgrade.IonTurret || upgrade == Upgrade.PlasmaRifle ? Cyan :
        upgrade == Upgrade.CoreShield || upgrade == Upgrade.Regeneration ? Mint : Gold;

    private string UpgradeBenefit(Upgrade upgrade, bool next)
    {
        int level = UpgradeLevel(upgrade) + (next ? 1 : 0);
        if (upgrade == Upgrade.IonTurret)
        {
            if (!next) return turretCount + " Towers · " + TurretDamage + " damage each";
            return turretCount < 4 && !turretMasteryPurchase ? (turretCount + 1) + " Towers · " + TurretDamage + " damage each"
                : "ALL Towers: " + (TurretDamage + 2) + " damage + faster / wider blasts";
        }
        if (upgrade == Upgrade.CoreShield) return ShieldCapacityForRank(level) + " Shield · recharges before each night";
        if (upgrade == Upgrade.PlasmaRifle) return (RifleDamage + (next ? 1 : 0)) + " damage · spread every 3 ranks";
        if (upgrade == Upgrade.OrbitDrones) return Mathf.Min(8, level == 0 ? 0 : level + 1) + " drones · " + (1 + level + astronautLevel / 5) + " damage";
        if (upgrade == Upgrade.Regeneration) return level + " Repair levels · repairs Health during combat";
        return (3 + level) + " metal / " + (2 + level) + " crystal per cache";
    }

    private static string UpgradeDetail(Upgrade upgrade)
        => upgrade == Upgrade.IonTurret ? "Build more Towers or boost every installed Tower. No mastery cap."
        : upgrade == Upgrade.CoreShield ? "Absorb more damage. Shield recharges before each night; Health stays unchanged."
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
        else { notice = "Tap Upgrades, a Tower sign or a construction pad."; noticeTimer = 3; }
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
            Color shieldColor = new Color(.3f, .9f, 1f, shieldHp > 0 ? .55f : .08f);
            for (int i = 0; i < 48; i++)
            {
                float a = i * Mathf.PI * 2 / 48;
                Vector2 point = corePosition + new Vector2(Mathf.Cos(a) * 282, Mathf.Sin(a) * 254);
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
                    DrawTrimmedSprite(turretMountTexture, turretMountUv, position + new Vector2(0, 8), 70, new Color(.7f, .82f, .94f));
                    PixelSurface(new Rect(position.x - 13, position.y - 9, 26, 26), Ink, 4);
                    PixelSurface(new Rect(position.x - 10, position.y - 6, 20, 20), UiBlue, 2);
                    Fill(position.x - 7, position.y + 2, 14, 4, Color.white);
                    Fill(position.x - 2, position.y - 3, 4, 14, Color.white);
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
        if (phase == Phase.Day && PixelButton("UPGRADES", 30, 391, 300, 40, Hex("24677a"))) buildPanelOpen = true;
    }

    private void DrawEngineeringBay()
    {
        Fill(0, 0, 1280, 800, Hex("edf4ff")); UiRound(new Rect(0, 0, 1280, 98), UiPaper, 0);
        if (MenuButton("Back", new Rect(24, 20, 126, 58), Cyan)) buildPanelOpen = false;
        UiText("Build & upgrade", new Rect(176, 13, 500, 40), 32, true);
        UiText("Pick a tool. Solve its energy puzzle. Watch it grow!", new Rect(178, 57, 520, 30), 20, false, UiMuted);
        DrawClearMaterial(MaterialKind.Alloy, alloy, new Rect(720, 18, 240, 60));
        DrawClearMaterial(MaterialKind.Crystal, crystal, new Rect(976, 18, 280, 60));
        if (MenuTab("Spaceship tools", new Rect(32, 120, 600, 60), !astronautUpgradeTab)) astronautUpgradeTab = false;
        if (MenuTab("Astronaut tools", new Rect(650, 120, 598, 60), astronautUpgradeTab)) astronautUpgradeTab = true;
        for (int i = 0; i < 3; i++)
        {
            Upgrade kind = (Upgrade)((astronautUpgradeTab ? 3 : 0) + i);
            Rect card = new Rect(32 + i * 414, 208, 388, 450); UiCard(card, UpgradeColor(kind));
            UiText(FriendlyUpgrade(kind), new Rect(card.x + 20, card.y + 14, 348, 54), 28, true);
            DrawMenuEquipmentArt(kind, new Vector2(card.center.x, card.y + 126), 112);
            UiText("Level " + UpgradeLevel(kind) + " → " + (UpgradeLevel(kind) + 1), new Rect(card.x + 20, card.y + 188, 348, 34), 23, true, UiBlue);
            UiText(FriendlyBenefit(kind), new Rect(card.x + 20, card.y + 229, 348, 70), 21, false, UiMuted);
            UpgradeCost(kind, out int metal, out int gems);
            UiRound(new Rect(card.x + 20, card.y + 307, 348, 39), Hex("edf3fb"), 8);
            UiText(metal + " metal + " + gems + " crystals", new Rect(card.x + 28, card.y + 308, 332, 37), 22, true);
            bool locked = kind != Upgrade.IonTurret && turretCount == 0, buy = CanBuy(kind);
            if (MenuButton(locked ? "Build a tower first" : buy ? "Solve & upgrade" : "Resource help", new Rect(card.x + 20, card.y + 363, 348, 65), UpgradeColor(kind), !locked, buy))
            {
                selectedUpgrade = kind;
                if (buy) StartUpgrade(kind);
                else { buildPanelOpen = false; OpenResourceHelp(kind); }
            }
        }
        if (!astronautUpgradeTab && turretCount > 0 && turretCount < 4)
        {
            if (MenuTab("Add a tower", new Rect(32, 699, 220, 64), !turretMasteryPurchase)) turretMasteryPurchase = false;
            if (MenuTab("Power up all towers", new Rect(270, 699, 260, 64), turretMasteryPurchase)) turretMasteryPurchase = true;
            UiText(turretMasteryPurchase ? "This upgrade makes every installed tower stronger." : "A new tower protects another part of your ship.", new Rect(555, 697, 435, 68), 23, false, UiMuted);
        }
        else UiText("Maths powers every upgrade. Asking for help is always welcome.", new Rect(32, 699, 955, 64), 23, false, UiMuted, TextAnchor.MiddleCenter);
        DrawAskHelp(new Rect(1008, 699, 240, 64));
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
        Text(maxed ? UpgradeDetail(upgrade) : "COST  " + alloyCost + " METAL + " + crystalCost + " CRYSTAL", 401, y + 79, 360, 22,
            new GUIStyle(smallStyle) { normal = { textColor = color } });
        string buttonText = maxed ? "INSTALLED" : locked ? "TURRET FIRST" : canBuy ? (upgrade == Upgrade.IonTurret && turretMasteryPurchase ? "UPGRADE + MATH" : "INSTALL + MATH") : "GATHER SALVAGE";
        if (PixelButton(buttonText, 790, y + 17, 170, 48, canBuy ? Hex("277c8e") : Hex("364253")))
        {
            selectedUpgrade = upgrade;
            if (canBuy) StartUpgrade(upgrade);
            else { notice = maxed ? "All " + UpgradeName(upgrade) + " slots are installed." : locked ? "Install your first Tower to unlock the other ship systems." : MissingMaterials(upgrade); noticeTimer = 4; }
        }
        TextCentered(maxed ? "MAX LEVEL" : locked ? "Unlocks after first Tower" : canBuy ? "Materials ready" : MissingMaterials(upgrade), 786, y + 66, 178, 36,
            new GUIStyle(smallStyle) { fontSize = 12, alignment = TextAnchor.MiddleCenter, normal = { textColor = canBuy ? Mint : Gold } });
    }

    private string MissingMaterials(Upgrade upgrade)
    {
        UpgradeCost(upgrade, out int alloyCost, out int crystalCost);
        int missingAlloy = Mathf.Max(0, alloyCost - alloy), missingCrystal = Mathf.Max(0, crystalCost - crystal);
        if (missingAlloy > 0 && missingCrystal > 0) return "Need " + missingAlloy + " metal + " + missingCrystal + " crystal";
        if (missingAlloy > 0) return "Need " + missingAlloy + " more metal";
        if (missingCrystal > 0) return "Need " + missingCrystal + " more crystal";
        return "Materials ready";
    }

    private void DrawUpgradeReveal()
    {
        OverlayShade(.78f); UiCard(new Rect(200, 100, 880, 618), Mint);
        UiText("Your " + FriendlyUpgrade(selectedUpgrade).ToLowerInvariant() + " is ready!", new Rect(232, 121, 816, 66), 35, true, UiBlue, TextAnchor.MiddleCenter);
        DrawMenuEquipmentArt(selectedUpgrade, new Vector2(640, 282), 160);
        UiText("Your maths powered this upgrade.", new Rect(232, 385, 816, 40), 27, true, UiInk, TextAnchor.MiddleCenter);
        UiText(installationAfter.Replace("maximum core integrity", "ship health").Replace("damage", "shot power"), new Rect(265, 436, 750, 64), 25, false, UiMuted, TextAnchor.MiddleCenter);
        UiText(installationRebate > 0 ? "+1 metal bonus for solving it yourself!" : "Good teamwork! Your new tool is installed.", new Rect(250, 515, 780, 44), 23, true, UiBlue, TextAnchor.MiddleCenter);
        if (MenuButton("Back to my spaceship", new Rect(300, 604, 680, 76), Cyan, true, true)) phase = Phase.Day;
    }

    private void DrawWaveRewards()
    {
        OverlayShade(.8f); UiCard(new Rect(200, 100, 880, 620), Mint);
        UiText("You kept the spaceship safe!", new Rect(232, 122, 816, 66), 36, true, UiInk, TextAnchor.MiddleCenter);
        UiText("Night " + night + " complete · Your tools and learning are kept.", new Rect(232, 200, 816, 48), 24, false, UiMuted, TextAnchor.MiddleCenter);
        for (int i = 0; i < 2; i++)
        {
            Rect box = new Rect(250 + i * 402, 288, 378, 180); UiRound(box, i == 0 ? Hex("e5f3fc") : Hex("fff0d4"));
            DrawPickup((MaterialKind)i, new Vector2(box.x + 68, box.y + 86), 86, Color.white);
            UiText("+" + (i == 0 ? dawnAlloyReward : dawnCrystalReward), new Rect(box.x + 132, box.y + 35, 224, 56), 42, true, UiBlue);
            UiText(i == 0 ? "Metal" : "Crystals", new Rect(box.x + 132, box.y + 102, 224, 44), 27, true);
        }
        UiText((dawnCleanDefense ? "Bonus Crystal for no Health damage. " : "Damage carries over. ") + "Health +" + Mathf.Min(10, coreMaxHp - coreHp) + ". Shield recharges before the next night.", new Rect(250, 500, 780, 65), 23, false, UiMuted, TextAnchor.MiddleCenter);
        if (MenuButton("Collect & keep exploring", new Rect(300, 610, 680, 76), Cyan, true, true)) ClaimWaveRewards();
    }

    private void ClaimWaveRewards()
    {
        if (phase != Phase.Dawn || !dawnRewardsPending) return;
        dawnRewardsPending = false;
        alloy += dawnAlloyReward;
        crystal += dawnCrystalReward;
        rewardHudFlash = 3;
        int repaired = Mathf.Min(10, coreMaxHp - coreHp);
        BeginNextDay();
        notice = "Health +" + repaired + ". Supplies collected: +" + dawnAlloyReward + " Metal, +" + dawnCrystalReward + " Crystal.";
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
