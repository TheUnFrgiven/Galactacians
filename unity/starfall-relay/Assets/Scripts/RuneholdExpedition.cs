using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

[Serializable]
public sealed class StarfallActivityDay
{
    public string Date;
    public int Solved, Independent, Supported, Mistakes, Builds, Salvage, Kills, Victories;
}

[Serializable]
public sealed class StarfallPilotJournal
{
    public int Version = 1, Tokens, HighestNight, CleanDefenses, Builds, Salvage, Pulses;
    public string TrackingSince = "";
    public List<string> Achievements = new List<string>();
    public List<int> Liveries = new List<int> { 0 };
    public List<StarfallActivityDay> Days = new List<StarfallActivityDay>();
    public int[] Setpoints = new int[6];
    public float SoundVolume = .55f;
    public float MusicVolume = .32f;
    public int MusicSettingsVersion;
}

public sealed partial class RuneholdGame
{
    private StarfallPilotJournal pilotJournal = new StarfallPilotJournal();
    private bool journalLoaded;
    private int profileTab, collectionTab, achievementPage;
    private float achievementClock, pulseCharge = 35, pulseAge = 10, dashCooldown;
    private Vector2 pulseOrigin, lastMoveDirection = Vector2.down;
    private readonly List<CapacitorDrop> capacitors = new List<CapacitorDrop>();
    private readonly Queue<ExpeditionNotice> expeditionNotices = new Queue<ExpeditionNotice>();
    private ExpeditionNotice currentExpeditionNotice;
    private float expeditionNoticeTime;
    private readonly Dictionary<Texture2D, Texture2D> liveryTextures = new Dictionary<Texture2D, Texture2D>();
    private int cachedLivery = -1;
    private bool showFactRecords;
    private int factPage;
    private AudioSource relayAudio;
    private readonly List<AudioClip> relaySounds = new List<AudioClip>();
    private float nextShotSound;
    private sealed class CapacitorDrop { public Vector2 Position; public float Age; }
    private sealed class ExpeditionNotice { public string Title, Body; public Color Color; }
    private static readonly string[] AchievementNames = { "First Defender", "First Dawn", "Field Engineer", "Pulse Pilot",
        "Clean Orbit", "Swarm Hunter", "Learning Together", "Independent Signal", "Five-a-day", "Deep Expedition", "Star Reaper", "Immortal" };
    private static readonly string[] AchievementCopy = { "Install your first Ion Turret.", "Survive Night 1.", "Install 5 equipment ranks.",
        "Discharge your Nova Pulse 3 times.", "Finish 3 nights without a core impact.", "Stop 1,000 enemies.",
        "Complete 5 questions with support.", "Solve 10 questions independently.", "Complete the daily five-solve goal.",
        "Survive Night 5.", "Reach astronaut level 18.", "Reach 60 total ascension power." };
    private static readonly int[] AchievementRewards = { 1, 2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 3 };
    private static readonly string[] LiveryNames = { "RELAY ORIGINAL", "VERDANT WARDEN", "NEBULA RANGER", "SOLAR LEGEND" };
    private static readonly int[] LiveryPrices = { 0, 2, 4, 6 };
    private string JournalPath => Path.Combine(Application.persistentDataPath, "starfall-pilot-v1.json");
    private static string LocalDay => DateTime.Now.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
    private int InstalledRanks => turretCount + shieldLevels + salvageLevels + turretMastery + shieldMastery + salvageMastery + rifleLevels + droneLevels + regenerationLevels;

    private void InitializeCombinedExpedition()
    {
        bool migrateLegacyColors = true;
        if (CanPersistProgress && File.Exists(JournalPath))
        {
            try { var saved = JsonUtility.FromJson<StarfallPilotJournal>(File.ReadAllText(JournalPath)); if (saved != null && saved.Version == 1) { pilotJournal = saved; migrateLegacyColors = false; } }
            catch (Exception e) { Debug.LogWarning("Pilot journal could not be read: " + e.GetType().Name); }
        }
        if (pilotJournal.Achievements == null) pilotJournal.Achievements = new List<string>();
        if (pilotJournal.Liveries == null) pilotJournal.Liveries = new List<int>();
        if (pilotJournal.Days == null) pilotJournal.Days = new List<StarfallActivityDay>();
        pilotJournal.Days.RemoveAll(d => d == null || !DateTime.TryParseExact(d.Date, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out _));
        pilotJournal.Tokens = Mathf.Max(0, pilotJournal.Tokens);
        pilotJournal.HighestNight = Mathf.Max(pilotJournal.HighestNight, phase == Phase.Dawn ? night : night - 1);
        Array.Resize(ref pilotJournal.Setpoints, 6);
        if (string.IsNullOrEmpty(pilotJournal.TrackingSince)) pilotJournal.TrackingSince = LocalDay;
        if (!pilotJournal.Liveries.Contains(0)) pilotJournal.Liveries.Add(0);
        int[] legacyStars = { 0, 1, 3, 5 };
        for (int i = 1; i < 4; i++)
            if ((migrateLegacyColors && learningProfile.Stars >= legacyStars[i] || learningProfile.Accent == i) && !pilotJournal.Liveries.Contains(i)) pilotJournal.Liveries.Add(i);
        if (!pilotJournal.Liveries.Contains(learningProfile.Accent)) learningProfile.Accent = 0;
        journalLoaded = true;
        InitializeRelayAudio();
        InitializeRelayMusic();
        ApplyLivery(); RefreshAchievements(); SavePilotJournal();
    }

    private StarfallActivityDay ActivityToday()
    {
        string key = LocalDay;
        StarfallActivityDay day = pilotJournal.Days.Find(d => d.Date == key);
        if (day == null) { day = new StarfallActivityDay { Date = key }; pilotJournal.Days.Add(day); }
        if (pilotJournal.Days.Count > 90) pilotJournal.Days.RemoveRange(0, pilotJournal.Days.Count - 90);
        return day;
    }

    private bool SavePilotJournal()
    {
        if (!journalLoaded || !CanPersistProgress) return false;
        try
        {
            Directory.CreateDirectory(Application.persistentDataPath);
            File.WriteAllText(JournalPath + ".tmp", JsonUtility.ToJson(pilotJournal, true));
            File.Copy(JournalPath + ".tmp", JournalPath, true); File.Delete(JournalPath + ".tmp");
            return true;
        }
        catch (Exception e) { Debug.LogWarning("Pilot journal could not be saved: " + e.GetType().Name); return false; }
    }

    private void UpdateExpeditionPresentation(float dt)
    {
        achievementClock -= dt;
        if (achievementClock <= 0) { RefreshAchievements(); achievementClock = .5f; }
        bool canShow = !pauseOpen && !buildPanelOpen && !learningPanelOpen && !raidBriefOpen && phase != Phase.Quiz && phase != Phase.Dawn && phase != Phase.UpgradeReveal && phase != Phase.Warning;
        if (canShow)
        {
            expeditionNoticeTime -= dt;
            if (expeditionNoticeTime <= 0 && expeditionNotices.Count > 0)
            { currentExpeditionNotice = expeditionNotices.Dequeue(); expeditionNoticeTime = 5; }
        }
    }

    private void Announce(string title, string body, Color color)
    {
        if (expeditionNotices.Count >= 8) expeditionNotices.Dequeue();
        expeditionNotices.Enqueue(new ExpeditionNotice { Title = title, Body = body, Color = color });
    }

    private void DrawExpeditionNotice()
    {
        if (currentExpeditionNotice == null || expeditionNoticeTime <= 0 || pauseOpen || buildPanelOpen || learningPanelOpen || raidBriefOpen || phase == Phase.Quiz || phase == Phase.UpgradeReveal || phase == Phase.Warning || phase == Phase.Dawn) return;
        if (menuOpen)
        {
            Fill(337, 737, 860, 32, Ink); Fill(337, 737, 3, 32, currentExpeditionNotice.Color);
            Text(currentExpeditionNotice.Title, 350, 739, 310, 26, new GUIStyle(smallStyle) { fontSize = 12, normal = { textColor = currentExpeditionNotice.Color } });
            Text(currentExpeditionNotice.Body, 670, 739, 513, 26, new GUIStyle(smallStyle) { fontSize = 11 });
            return;
        }
        float x = 930, y = 146;
        Fill(x, y, 320, 86, Ink); Fill(x, y, 4, 86, currentExpeditionNotice.Color);
        Text(currentExpeditionNotice.Title, x + 15, y + 8, 290, 25, new GUIStyle(labelStyle) { fontSize = 15, normal = { textColor = currentExpeditionNotice.Color } });
        Text(currentExpeditionNotice.Body, x + 15, y + 36, 288, 43, new GUIStyle(smallStyle) { fontSize = 12 });
    }

    private int TotalLearning(bool independent)
    {
        int sum = 0; foreach (int value in independent ? learningProfile.Independent : learningProfile.Supported) sum += value;
        return sum;
    }

    private int AchievementValue(int i)
    {
        switch (i)
        {
            case 0: return turretCount;
            case 1: return pilotJournal.HighestNight;
            case 2: return InstalledRanks;
            case 3: return pilotJournal.Pulses;
            case 4: return pilotJournal.CleanDefenses;
            case 5: return lifetimeKills;
            case 6: return TotalLearning(false);
            case 7: return TotalLearning(true);
            case 8: return learningProfile.Stars;
            case 9: return pilotJournal.HighestNight;
            case 10: return astronautLevel;
            default: return AscensionPower;
        }
    }
    private static int AchievementTarget(int i) => new[] { 1, 1, 5, 3, 3, 1000, 5, 10, 1, 5, 18, 60 }[i];
    private string AchievementId(int i) => "relay-" + i;
    private void RefreshAchievements()
    {
        if (!journalLoaded) return;
        bool changed = false;
        for (int i = 0; i < AchievementNames.Length; i++)
        {
            if (AchievementValue(i) < AchievementTarget(i) || pilotJournal.Achievements.Contains(AchievementId(i))) continue;
            pilotJournal.Achievements.Add(AchievementId(i)); pilotJournal.Tokens += AchievementRewards[i]; changed = true;
            Announce("ACHIEVEMENT · " + AchievementNames[i], "+" + AchievementRewards[i] + (AchievementRewards[i] == 1 ? " paint credit. " : " paint credits. ") + "Open Collection to choose a livery.", Gold);
        }
        if (changed) SavePilotJournal();
    }

    private string NextMilestone()
    {
        for (int i = 0; i < AchievementNames.Length; i++)
            if (!pilotJournal.Achievements.Contains(AchievementId(i)))
                return AchievementNames[i] + " · " + Mathf.Min(AchievementTarget(i), AchievementValue(i)) + "/" + AchievementTarget(i);
        return "All launch milestones earned. Keep growing your expedition.";
    }

    private void RecordEngineeringBuilt()
    {
        pilotJournal.Builds++; ActivityToday().Builds++;
        pilotJournal.Setpoints[(int)selectedUpgrade] = question.Answer;
        RefreshAchievements(); SavePilotJournal();
    }

    private void RecordPilotAnswer(bool independent)
    {
        StarfallActivityDay day = ActivityToday();
        day.Solved++; if (independent) day.Independent++; else day.Supported++;
        learningProfile.LearningXp += independent ? 10 : 4;
        RefreshPracticeDate(); learningProfile.DailySolved++;
        if (learningProfile.DailySolved >= 5 && string.CompareOrdinal(learningProfile.PracticeDate, learningProfile.LastPracticeStarDate) > 0)
        {
            learningProfile.Stars++; learningProfile.LastPracticeStarDate = learningProfile.PracticeDate;
            pilotJournal.Tokens++;
            Announce("DAILY SIGNAL COMPLETE", "Five questions solved · +1 practice star and +1 paint credit.", Mint);
        }
        RefreshAchievements(); SavePilotJournal();
    }

    private void RecordExpeditionVictory()
    {
        if (night <= pilotJournal.HighestNight) return;
        pilotJournal.HighestNight = night; ActivityToday().Victories++;
        if (dawnCleanDefense) pilotJournal.CleanDefenses++;
        RefreshAchievements(); SavePilotJournal();
    }

    private Color LiveryEnergy(int index) => index == 1 ? Mint : index == 2 ? Hex("c2a0ff") : index == 3 ? Gold : Cyan;
    private Color LiveryArmor(int index) => index == 1 ? Hex("58b990") : index == 2 ? Hex("9872dc") : index == 3 ? Hex("edb34d") : Ember;

    private void ApplyLivery()
    {
        if (cachedLivery == learningProfile.Accent) return;
        foreach (Texture2D old in liveryTextures.Values) Destroy(old);
        liveryTextures.Clear(); cachedLivery = learningProfile.Accent;
        if (cachedLivery == 0) return;
        foreach (Texture2D source in new[] { pilotTexture, carbineTexture, turretHeadTexture, turretMountTexture, shieldTexture })
        {
            if (source == null || !source.isReadable || liveryTextures.ContainsKey(source)) continue;
            Color32[] colors = source.GetPixels32();
            for (int i = 0; i < colors.Length; i++)
            {
                colors[i] = LiveryPixel(colors[i], source == pilotTexture, cachedLivery);
            }
            var variant = new Texture2D(source.width, source.height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp, name = source.name + " livery" };
            variant.SetPixels32(colors); variant.Apply(false, true); liveryTextures.Add(source, variant);
        }
    }
    private Texture2D LiveryTexture(Texture2D original) => original != null && liveryTextures.TryGetValue(original, out Texture2D variant) ? variant : original;

    private void DrawCollection() => DrawPolishedCollection();

    private void EquipLivery(int index)
    {
        if (!pilotJournal.Liveries.Contains(index))
        {
            if (pilotJournal.Tokens < LiveryPrices[index]) return;
            pilotJournal.Tokens -= LiveryPrices[index]; pilotJournal.Liveries.Add(index);
        }
        learningProfile.Accent = index; ApplyLivery(); SaveLearningProfile(); SavePilotJournal();
        PlayRelaySound(2);
        Announce("LIVERY EQUIPPED", LiveryNames[index] + " · your astronaut and installed equipment now match.", LiveryEnergy(index));
    }

    private void DrawPilotProfile()
    {
        HubHeading(learningProfile.CadetName + " · Captain’s dossier", "Your expedition, equipment and learning journey, all in one place.");
        string[] tabs = { "EXPEDITION", "LEARNING", "ACTIVITY" };
        for (int i = 0; i < 3; i++)
            if (MenuTab(tabs[i], new Rect(337 + i * 291, 229, 274, 38), profileTab == i)) profileTab = i;
        if (profileTab == 1) { DrawFactProfile(); return; }
        if (profileTab == 2) { DrawActivityProfile(); return; }
        MenuCard(new Rect(337, 288, 860, 170), LearnerAccent);
        DrawMenuPilot(new Vector2(420, 370), -18, 1.3f);
        Text("LV " + astronautLevel + " · " + AscensionTitle, 494, 297, 680, 35, hubLabel);
        Text("Highest night survived: " + pilotJournal.HighestNight + "\nEnemies stopped: " + lifetimeKills + " · clean defenses: " + pilotJournal.CleanDefenses +
            "\nInstalled ranks: " + InstalledRanks + " · Nova Pulses: " + pilotJournal.Pulses, 494, 342, 680, 89, hubCopy);
        for (int i = 0; i < 6; i++)
        {
            float x = 337 + i % 3 * 291, y = 468 + i / 3 * 84;
            MenuCard(new Rect(x, y + 10, 274, 72), UpgradeColor((Upgrade)i)); DrawMenuEquipmentArt((Upgrade)i, new Vector2(x + 33, y + 46), 34); Text(UpgradeName((Upgrade)i), x + 60, y + 15, 201, 25, new GUIStyle(hubCopy) { fontSize = 12 });
            Text("RANK " + UpgradeLevel((Upgrade)i), x + 60, y + 40, 201, 27, hubLabel);
        }
        Text("NEXT MILESTONE · " + NextMilestone(), 338, 669, 850, 63, hubCopy);
    }

    private void DrawFactProfile()
    {
        if (PixelButton(showFactRecords ? "Topic summary  [F]" : "Facts + review  [F]", 337, 285, 860, 33, PanelLight)) { showFactRecords = !showFactRecords; factPage = 0; }
        if (!showFactRecords)
        {
            Text(TotalLearning(true) + " independent · " + TotalLearning(false) + " supported · " + learningProfile.LearningXp + " learning XP", 338, 330, 850, 35, hubCopy);
            for (int i = 0; i < 6; i++)
            {
                float y = 369 + i * 47; MenuCard(new Rect(337, y, 860, 39), Hex("66849e"));
                DrawMenuPlanet(new Vector2(365, y + 20), i, 9, false, false);
                Text(StarfallCurriculum.Names[i], 387, y + 5, 344, 30, new GUIStyle(hubCopy) { fontSize = 14 });
                Text(learningProfile.Independent[i] + " independent · " + learningProfile.Supported[i] + " helped", 755, y + 5, 427, 30, hubCopy);
            }
            Text("Learning records describe practice evidence. Combat success is recorded separately.", 338, 677, 850, 50, hubCopy);
            return;
        }
        var facts = new List<StarfallFactRecord>(learningProfile.Facts);
        facts.Sort((a, b) => StarfallCurriculum.ReviewWeight(b).CompareTo(StarfallCurriculum.ReviewWeight(a)));
        if (facts.Count == 0) { MenuCard(new Rect(337, 342, 860, 280), LearnerAccent); MenuIcon(2, new Vector2(380, 392), 6, LearnerAccent); Text("Your first discovery is waiting.", 464, 380, 680, 42, hubLabel); Text("Complete an upgrade calculation or a practice question to start your fact record.", 464, 435, 660, 70, hubCopy); if (MenuButton("Visit the practice lab", new Rect(464, 540, 350, 42), LearnerAccent)) NavigateHub(HubPage.Practice); return; }
        int pages = Mathf.Max(1, (facts.Count + 5) / 6); factPage = Mathf.Clamp(factPage, 0, pages - 1);
        for (int row = 0; row < 6 && factPage * 6 + row < facts.Count; row++)
        {
            StarfallFactRecord fact = facts[factPage * 6 + row]; float y = 339 + row * 54;
            string equation = fact.Key.Contains(":") ? fact.Key.Substring(fact.Key.IndexOf(':') + 1).Replace("*", " × ").Replace("/", " ÷ ").Replace("+", " + ").Replace("-", " − ") : fact.Key;
            string stage = StarfallCurriculum.ReviewDue(fact) ? "REVIEW DUE" : fact.Mistakes + fact.Supported > fact.Independent ? "REVISIT WITH HELP" : fact.Independent >= 3 ? "FAMILIAR" : "BUILDING";
            MenuCard(new Rect(337, y, 860, 47), LearnerAccent); Text(equation, 352, y + 6, 240, 34, hubLabel);
            Text(fact.Independent + " independent / " + fact.Supported + " helped", 595, y + 6, 320, 34, hubCopy);
            Text(stage, 945, y + 6, 240, 34, new GUIStyle(hubCopy) { fontSize = 12, normal = { textColor = Gold } });
        }
        if (PixelButton("<", 337, 678, 100, 38, PanelLight)) factPage = (factPage + pages - 1) % pages;
        TextCentered((factPage + 1) + " / " + pages + "  ·  Your fact review", 449, 679, 630, 38, hubCopy);
        if (PixelButton(">", 1097, 678, 100, 38, PanelLight)) factPage = (factPage + 1) % pages;
    }

    private void DrawActivityProfile()
    {
        Text("RECENT 7 DAYS · tracking started " + pilotJournal.TrackingSince, 338, 278, 850, 32, hubCopy);
        for (int i = 0; i < 7; i++)
        {
            string key = DateTime.Now.Date.AddDays(i - 6).ToString("yyyy-MM-dd");
            StarfallActivityDay day = pilotJournal.Days.Find(d => d.Date == key);
            float y = 326 + i * 47; MenuCard(new Rect(337, y, 860, 39), Hex("66849e"));
            Text(key.Substring(5), 351, y + 4, 110, 30, hubCopy);
            Text(day == null ? "No recorded activity" : day.Solved + " solves · " + day.Builds + " builds · " + day.Kills + " enemies · " + day.Victories + " wins", 470, y + 4, 710, 30, hubCopy);
        }
        Text("Each flight and practice session adds to your story. Keep exploring at your own pace.", 338, 680, 850, 56, hubCopy);
    }

    private string ThreatName(int wave) => wave % 3 == 0 ? "STORMHEART CONVOY" : wave % 3 == 2 ? "ION RUSH" : "EMBER DRIFT";
    private string ThreatDescription(int wave) => wave % 3 == 0 ? "Armored fragments + a Stormheart. Cannons break the dense center."
        : wave % 3 == 2 ? "Fast skaters cut through the swarm. Rifle spread and drones cover the edges."
        : "Fragile fragments in packed clouds. Piercing rounds and cannon blasts clear groups.";

    private void DrawExpeditionDirector()
    {
        if (phase != Phase.Day || buildPanelOpen || learningPanelOpen || pauseOpen || raidBriefOpen || showTutorial && night == 1 && tutorialStep < 2) return;
        DrawPowerForecast();
    }

    private void UpdatePilotAbilities(Vector2 direction, float dt)
    {
        dashCooldown = Mathf.Max(0, dashCooldown - dt);
        if (direction.sqrMagnitude > 0) lastMoveDirection = direction;
        if ((Input.GetKeyDown(KeyCode.LeftShift) || Input.GetKeyDown(KeyCode.RightShift)) && dashCooldown <= 0)
        {
            Vector2 before = pilotPosition;
            pilotPosition += (direction.sqrMagnitude > 0 ? direction : lastMoveDirection) * 135;
            pilotPosition.x = Mathf.Clamp(pilotPosition.x, 52, 1228); pilotPosition.y = Mathf.Clamp(pilotPosition.y, 132, 674);
            for (int i = 0; i < 6; i++) SpawnBurst(Vector2.Lerp(before, pilotPosition, i / 5f), LearnerAccent, 2);
            if (phase == Phase.Day)
                foreach (SalvageNode node in nodes)
                    if (!node.Collected && DistanceToSegmentSq(node.Position, before, pilotPosition) < 50 * 50) CollectSalvage(node);
            dashCooldown = 2.5f;
        }
    }

    private void UpdateFieldCombat(float dt)
    {
        pulseCharge = Mathf.Min(100, pulseCharge + dt * 1.5f);
        pulseAge += dt;
        if (Input.GetKeyDown(KeyCode.Space) && pulseCharge >= 100)
        {
            pulseOrigin = pilotPosition; pulseAge = 0; pulseCharge = 0; pilotJournal.Pulses++;
            PlayRelaySound(3);
            int damage = 6 + RifleDamage * 2 + TurretDamage;
            foreach (Meteor enemy in meteors)
                if (enemy.Alive && (enemy.Position - pulseOrigin).sqrMagnitude <= 420 * 420) DamageMeteor(enemy, damage, LearnerAccent);
            SpawnBurst(pilotPosition, LearnerAccent, 35); Announce("NOVA PULSE", "Capacitors discharged. Sweep up field cells to recharge.", LearnerAccent);
            RefreshAchievements(); SavePilotJournal();
        }
        for (int i = capacitors.Count - 1; i >= 0; i--)
        {
            CapacitorDrop drop = capacitors[i]; drop.Age += dt;
            float distance = Vector2.Distance(drop.Position, pilotPosition);
            if (distance < 120) drop.Position = Vector2.MoveTowards(drop.Position, pilotPosition, dt * 340);
            if (distance < 28)
            { pulseCharge = Mathf.Min(100, pulseCharge + 12); coreHp = Mathf.Min(coreMaxHp, coreHp + 1); SpawnBurst(drop.Position, LearnerAccent, 3); capacitors.RemoveAt(i); }
            else if (drop.Age > 45) capacitors.RemoveAt(i);
        }
    }

    private void DropFieldCapacitor(Meteor enemy)
    {
        pulseCharge = Mathf.Min(100, pulseCharge + .32f);
        if (lifetimeKills % 12 != 0 || capacitors.Count >= 24) return;
        Vector2 position = new Vector2(Mathf.Clamp(enemy.Position.x, 70, 1210), Mathf.Clamp(enemy.Position.y, 145, 660));
        capacitors.Add(new CapacitorDrop { Position = position });
    }

    private void DrawFieldCombat()
    {
        foreach (CapacitorDrop drop in capacitors)
        {
            DrawPixelEllipse(drop.Position + new Vector2(0, 8), 9, 3, Ink);
            Fill(drop.Position.x - 6, drop.Position.y - 6, 12, 12, Ink);
            Fill(drop.Position.x - 4, drop.Position.y - 4, 8, 8, LearnerAccent);
            Fill(drop.Position.x - 1, drop.Position.y - 5, 2, 10, Cream);
        }
        if (pulseAge < .6f)
        {
            float radius = reducedMotion ? 420 : Mathf.Lerp(20, 420, pulseAge / .6f);
            for (int i = 0; i < 72; i++)
            {
                float angle = i * Mathf.PI * 2 / 72;
                Vector2 at = pulseOrigin + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * radius;
                Fill(at.x, at.y, 6, 4, new Color(LearnerAccent.r, LearnerAccent.g, LearnerAccent.b, 1 - pulseAge / .6f));
            }
        }
        if (cachedLivery > 0)
            for (int i = 0; i < 8; i++)
            {
                Vector2 at = corePosition + new Vector2(Mathf.Cos(i * Mathf.PI / 4) * 128, Mathf.Sin(i * Mathf.PI / 4) * 110);
                Fill(at.x - 4, at.y - 2, 8, 4, LearnerAccent);
            }
    }

    private void DrawAbilityHud()
    {
        if (phase != Phase.Night || pauseOpen) return;
        Fill(772, 716, 222, 59, Ink);
        Text(pulseCharge >= 100 ? "[SPACE] NOVA READY" : "NOVA PULSE · " + Mathf.FloorToInt(pulseCharge) + "%", 784, 721, 199, 24,
            new GUIStyle(smallStyle) { normal = { textColor = pulseCharge >= 100 ? Gold : LearnerAccent }, fontStyle = FontStyle.Bold });
        ProgressBar(784, 752, 198, 10, pulseCharge / 100, LearnerAccent);
    }

    private string CalibrationPurpose => question.Operation == '-' ? "ISOLATE THE REMAINING CELLS" : question.Operation == '*' ? "WIRE EQUAL MODULE BANKS" :
        question.Operation == '/' ? "BALANCE THE EMITTERS" : "COMBINE THE POWER BANKS";
    private string CalibrationContext => question.Operation == '-' ? "The " + UpgradeName(selectedUpgrade) + " routes " + question.First + " cells. Disconnect " + question.Second + ". Set the remaining load." :
        question.Operation == '*' ? "The " + UpgradeName(selectedUpgrade) + " has " + question.First + " module banks with " + question.Second + " cells each. Set the total load." :
        question.Operation == '/' ? "Share " + question.First + " control cells across " + question.Second + " equal emitters. Set cells per emitter." :
        "Combine banks of " + question.First + " and " + question.Second + " control cells to calibrate the " + UpgradeName(selectedUpgrade) + ".";

    private void DrawNumberPad()
    {
        MenuCard(new Rect(278, 475, 450, 113), LearnerAccent);
        Rect entry = new Rect(292, 486, 205, 48);
        Fill(entry.x, entry.y, entry.width, entry.height, Hex("3b566b"));
        Fill(entry.x + 1, entry.y + 1, entry.width - 2, entry.height - 2, Hex("0b1c2e"));
        GUIStyle answer = MenuType(string.IsNullOrEmpty(typedAnswer) ? 18 : 30, Cream, true, TextAnchor.MiddleCenter);
        answer.wordWrap = false;
        GUI.Label(entry, string.IsNullOrEmpty(typedAnswer) ? learningPractice ? "Your answer" : "Enter load" : typedAnswer, answer);
        if (PixelButton("CHECK [ENTER]", 292, 546, 205, 34, Hex("277c8e")) && int.TryParse(typedAnswer, out int check)) SubmitLearningValue(check);
        string[] keys = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "DEL", "0", "OK" };
        for (int i = 0; i < keys.Length; i++)
        {
            if (!PixelButton(keys[i], 515 + i % 3 * 65, 480 + i / 3 * 27, 60, 24, i == 11 ? Hex("277c8e") : PanelLight)) continue;
            if (i == 9) { if (typedAnswer.Length > 0) typedAnswer = typedAnswer.Substring(0, typedAnswer.Length - 1); }
            else if (i == 11) { if (int.TryParse(typedAnswer, out int value)) SubmitLearningValue(value); }
            else if (typedAnswer.Length < 3) typedAnswer += keys[i];
        }
    }

    private void DrawBuildRangePreview()
    {
        if (phase != Phase.Day || pauseOpen || buildPanelOpen || learningPanelOpen) return;
        float distance = Vector2.Distance(pilotPosition, NextUpgradePosition(Upgrade.IonTurret));
        if (distance >= 125 || turretCount >= 4) return;
        Vector2 at = NextUpgradePosition(Upgrade.IonTurret);
        for (int i = 0; i < 80; i++)
        {
            float angle = i * Mathf.PI * 2 / 80;
            Vector2 mark = at + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * 780;
            if (mark.y < 100 || mark.y > 680 || mark.x < 0 || mark.x > 1280) continue;
            Fill(mark.x, mark.y, 5, 3, new Color(Cyan.r, Cyan.g, Cyan.b, .5f));
        }
        DrawBeam(at, corePosition, 2, new Color(Cyan.r, Cyan.g, Cyan.b, .3f));
        TextCentered("CANNON · 780 RANGE · SPLASH", at.x - 140, at.y - 80, 280, 24, new GUIStyle(smallStyle) { normal = { textColor = Cyan } });
    }

    private void InitializeRelayAudio()
    {
        relayAudio = gameObject.AddComponent<AudioSource>();
        gameObject.AddComponent<AudioListener>();
        relayAudio.playOnAwake = false; relayAudio.spatialBlend = 0;
        pilotJournal.SoundVolume = Mathf.Clamp01(pilotJournal.SoundVolume);
        relayAudio.volume = pilotJournal.SoundVolume;
        const int sampleRate = 22050;
        var random = new System.Random(31415);
        for (int kind = 0; kind < 5; kind++)
        {
            float duration = kind == 4 ? .065f : kind == 1 ? .065f : kind == 0 ? .2f : .35f;
            float[] samples = new float[Mathf.CeilToInt(sampleRate * duration)];
            float angle = 0;
            for (int i = 0; i < samples.Length; i++)
            {
                float time = i / (float)sampleRate, t = time / duration;
                float frequency = kind == 4 ? Mathf.Lerp(740, 520, t) : kind == 1 ? Mathf.Lerp(1100, 230, t) : kind == 3 ? Mathf.Lerp(150, 38, t) :
                    (kind == 2 ? 440 : 880) * (t < .33f ? 1 : t < .66f ? 1.25f : 1.5f);
                angle += frequency * Mathf.PI * 2 / sampleRate;
                float tone = Mathf.Sin(angle);
                if (kind == 3) tone = tone * .65f + ((float)random.NextDouble() * 2 - 1) * .35f;
                float envelope = Mathf.Min(1, time * 250) * Mathf.Pow(1 - t, kind == 1 ? 2 : 1.4f);
                samples[i] = tone * envelope * .24f;
            }
            AudioClip clip = AudioClip.Create("Relay effect " + kind, samples.Length, 1, sampleRate, false);
            clip.SetData(samples, 0); relaySounds.Add(clip);
        }
    }

    private void PlayRelaySound(int kind, float volume = 1)
    {
        if (relayAudio == null || kind < 0 || kind >= relaySounds.Count) return;
        relayAudio.PlayOneShot(relaySounds[kind], volume);
    }

    private void PlayShotSound(float volume)
    {
        if (Time.unscaledTime < nextShotSound) return;
        nextShotSound = Time.unscaledTime + .09f;
        PlayRelaySound(1, volume);
    }
}
