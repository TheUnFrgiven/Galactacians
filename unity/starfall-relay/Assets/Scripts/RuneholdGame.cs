using System;
using System.Collections.Generic;
using UnityEngine;

    /// <summary>Starfall Relay: a continuous day/night pixel-art defense expedition.</summary>
public sealed partial class RuneholdGame : MonoBehaviour
{
    private enum Phase { Day, Warning, Night, Dawn, Quiz, UpgradeReveal, Victory, Defeat }
    private enum Upgrade { IonTurret, CoreShield, SalvageRig, PlasmaRifle, OrbitDrones, Regeneration }
    private enum MaterialKind { Alloy, Crystal }

    private sealed class SalvageNode
    {
        public Vector2 Position;
        public MaterialKind Kind;
        public int Amount;
        public bool Collected;
        public string Name;
        public Color Color;
    }

    private sealed class Meteor
    {
        public int Id;
        public Vector2 Position;
        public int Hp;
        public int MaxHp;
        public float Speed;
        public float Flash;
        public Color Tint;
        public Vector2 Velocity;
        public float Radius, Angle, Spin;
        public int CoreDamage;
        public bool Alive = true;
        public bool Commander;
        public int Role;
    }

    private sealed class Bolt
    {
        public Vector2 Position;
        public float Speed;
        public float Damage;
        public Color Color;
        public Vector2 Direction;
        public float Life, SplashRadius;
        public float Travel;
        public int Pierces = 1;
        public readonly HashSet<int> HitIds = new HashSet<int>();
    }

    private struct Spark
    {
        public Vector2 Position;
        public Vector2 Velocity;
        public float Life;
        public float FullLife;
        public Color Color;
        public float Size;
    }

    private struct MathQuestion
    {
        public string Text;
        public int Answer;
        public int[] Choices;
        public int First, Second, Lesson;
        public char Operation;
        public string FactKey, Hint, Explanation;
    }

    private sealed class PickupEffect
    {
        public Vector2 Origin;
        public MaterialKind Kind;
        public int Amount;
        public float Age;
    }

    private static readonly Color Ink = Hex("10192b");
    private static readonly Color Panel = Hex("17243a");
    private static readonly Color PanelLight = Hex("26364e");
    private static readonly Color Cream = Hex("f4e8c9");
    private static readonly Color Cyan = Hex("68e4f0");
    private static readonly Color Gold = Hex("ffca63");
    private static readonly Color Ember = Hex("ff744c");
    private static readonly Color Mint = Hex("8de0a8");

    private const float DesignWidth = 1280;
    private const float DesignHeight = 800;
    private const float WorldZoom = .72f;
    private const int MaxQuestionAttempts = 2;
    private readonly Vector2 corePosition = new Vector2(640, 360);
    private readonly List<Meteor> meteors = new List<Meteor>();
    private readonly List<Bolt> bolts = new List<Bolt>();
    private readonly List<Spark> sparks = new List<Spark>();
    private readonly List<SalvageNode> nodes = new List<SalvageNode>();
    private readonly List<PickupEffect> pickupEffects = new List<PickupEffect>();
    private readonly List<Vector2> turretPads = new List<Vector2> {
        new Vector2(516, 294), new Vector2(764, 294), new Vector2(516, 456), new Vector2(764, 456)
    };

    private Phase phase = Phase.Day;
    private Texture2D deckTexture, pilotTexture, meteorTexture, turretTexture, pixel;
    private Texture2D alloyPickupTexture, crystalPickupTexture;
    private readonly Rect[] pilotFrames = new Rect[4];
    private Rect alloyPickupUv, crystalPickupUv;
    private GUIStyle labelStyle, titleStyle, smallStyle, buttonStyle, hugeStyle;
    private Vector2 pilotPosition = new Vector2(640, 516);
    private int pilotFacing;
    private bool pilotWalking;
    private float pilotWalkCycle;
    private int alloy;
    private int crystal;
    private int coreHp = 100;
    private int coreMaxHp = 100;
    private int night = 1;
    private int score;
    private int bestScore;
    private int turretCount;
    private int shieldLevels;
    private int salvageLevels;
    private int tutorialStep;
    private int enemyCountToSpawn;
    private int enemiesSpawned;
    private int questionAttempts;
    private int selectedAnswer = -1;
    private int correctAnswers;
    private int mathStreak;
    private float spawnTimer;
    private float fireTimer;
    private float warningTimer;
    private float noticeTimer;
    private float nightElapsed;
    private float incomingBannerTimer;
    private float corePulse;
    private float hurtFlash;
    private bool buildPanelOpen;
    private bool pauseOpen;
    private bool showTutorial = true;
    private Upgrade selectedUpgrade;
    private MathQuestion question;
    private string notice = "Move with WASD. Walk over salvage to gather it.";
    private string incomingText = "";
    private string answerFeedback = "";
    private Color answerFeedbackColor = Mint;

    private void Awake()
    {
        deckTexture = Resources.Load<Texture2D>("Art/StarshipDeck");
        pilotTexture = Resources.Load<Texture2D>("Art/PilotCombatDirections");
        alloyPickupTexture = Resources.Load<Texture2D>("Art/AlloyPickup");
        crystalPickupTexture = Resources.Load<Texture2D>("Art/CrystalPickup");
        meteorTexture = Resources.Load<Texture2D>("Art/EmberMeteor");
        turretTexture = Resources.Load<Texture2D>("Art/IonTurret");
        LoadUpgradeArtwork();
        CacheSpriteFrames();
        LoadCombatArtwork();
        LoadLearningProfile();
        pixel = new Texture2D(1, 1, TextureFormat.RGBA32, false);
        pixel.SetPixel(0, 0, Color.white);
        pixel.Apply();
        Application.targetFrameRate = 60;
        bestScore = PlayerPrefs.GetInt("starfall.best", 0);
        CreateNodes();
        if (Application.productName.EndsWith("Preview")) ConfigureSwarmPreview();
        else LoadExpedition();
        InitializeAcademyMenu();
        InitializeCombinedExpedition();
    }

    private void OnDestroy()
    {
        foreach (Texture2D variant in liveryTextures.Values) Destroy(variant);
        foreach (AudioClip clip in relaySounds) Destroy(clip);
        if (relayMusic != null) relayMusic.Stop();
        if (relayMusicClip != null) Destroy(relayMusicClip);
        if (pixel != null) Destroy(pixel);
    }

    private void Update()
    {
        float dt = Time.deltaTime;
        corePulse += dt;
        UpdateExpeditionPresentation(dt);
        UpdateRelayMusic(dt);
        if (UpdateAcademyNavigation()) return;
        noticeTimer = Mathf.Max(0, noticeTimer - dt);
        incomingBannerTimer = Mathf.Max(0, incomingBannerTimer - dt);
        hurtFlash = Mathf.Max(0, hurtFlash - dt * 2.6f);
        rewardHudFlash = Mathf.Max(0, rewardHudFlash - dt);
        installationAge += dt;
        if (phase != Phase.Night) UpdateWeaponEffects(dt);
        if (phase == Phase.Quiz) questionOpenTime += dt;
        UpdateSparks(dt);
        for (int i = pickupEffects.Count - 1; i >= 0; i--)
        {
            pickupEffects[i].Age += dt;
            if (pickupEffects[i].Age >= 1.1f) pickupEffects.RemoveAt(i);
        }

        if (raidBriefOpen)
        {
            pilotWalking = false;
            if (Input.GetKeyDown(KeyCode.Escape)) raidBriefOpen = false;
            else if (Input.GetKeyDown(KeyCode.B)) { raidBriefOpen = false; buildPanelOpen = true; }
            else if (Input.GetKeyDown(KeyCode.Return)) LaunchWarnedRaid();
            return;
        }
        if (Input.GetKeyDown(KeyCode.Escape)) pauseOpen = !pauseOpen;
        if (!pauseOpen && phase == Phase.Quiz) HandleLearningKeys();
        if (!pauseOpen && phase == Phase.UpgradeReveal && Input.GetKeyDown(KeyCode.Return)) phase = Phase.Day;
        if (!pauseOpen && phase == Phase.Dawn && Input.GetKeyDown(KeyCode.Return)) ClaimWaveRewards();
        if (!pauseOpen && phase == Phase.Day && learningPanelOpen && Input.GetKeyDown(KeyCode.P)) BeginLearningPractice(false);
        if (!pauseOpen && phase == Phase.Day && !learningPanelOpen && !buildPanelOpen && turretCount > 0 && Input.GetKeyDown(KeyCode.N)) BeginWarning();
        if (raidBriefOpen || pauseOpen || phase == Phase.Victory || phase == Phase.Defeat || phase == Phase.Quiz || phase == Phase.UpgradeReveal || phase == Phase.Dawn) return;
        if (phase == Phase.Day && Input.GetKeyDown(KeyCode.B)) { buildPanelOpen = !buildPanelOpen; learningPanelOpen = false; }
        if (phase == Phase.Day && Input.GetKeyDown(KeyCode.L)) { OpenAcademyMenu(HubPage.Galaxy); return; }
        if (phase == Phase.Day && Input.GetKeyDown(KeyCode.E)) OpenNearbyUpgrade();
        if (phase == Phase.Day && buildPanelOpen && Input.GetKeyDown(KeyCode.Tab)) astronautUpgradeTab = !astronautUpgradeTab;
        if (phase == Phase.Day && buildPanelOpen)
        {
            if (!astronautUpgradeTab && turretCount > 0 && turretCount < 4 && Input.GetKeyDown(KeyCode.T)) turretMasteryPurchase = !turretMasteryPurchase;
            for (int i = 0; i < 3; i++)
                if (Input.GetKeyDown((KeyCode)((int)KeyCode.Alpha1 + i)))
                {
                    Upgrade choice = (Upgrade)((astronautUpgradeTab ? 3 : 0) + i);
                    if (CanBuy(choice)) StartUpgrade(choice);
                    else { notice = MissingMaterials(choice); noticeTimer = 4; }
                    return;
                }
        }
        if (phase == Phase.Day && (buildPanelOpen || learningPanelOpen)) { pilotWalking = false; return; }

        if (phase == Phase.Day || phase == Phase.Night)
        {
            MovePilot(dt);
            if (phase == Phase.Day) CollectNearbyNodes();
        }
        if (phase == Phase.Warning)
        {
            warningTimer -= dt;
            if (warningTimer <= 0) BeginWave();
        }
        if (phase == Phase.Night) UpdateNight(dt);
    }

    private void MovePilot(float dt)
    {
        Vector2 move = Vector2.zero;
        if (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow)) move.y -= 1;
        if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow)) move.y += 1;
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) move.x -= 1;
        if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) move.x += 1;
        if (move.sqrMagnitude > 1) move.Normalize();
        pilotWalking = move.sqrMagnitude > 0;
        if (pilotWalking)
        {
            pilotWalkCycle += dt * 11;
            if (phase != Phase.Night || pilotTargetId == 0) AimPilot(AimAngle(move), dt);
        }
        float speed = 218 + Mathf.Min(16, UpgradeLevel(Upgrade.SalvageRig)) * 10;
        pilotPosition += move * speed * dt;
        pilotPosition.x = Mathf.Clamp(pilotPosition.x, 52, 1228);
        pilotPosition.y = Mathf.Clamp(pilotPosition.y, 132, 674);
        UpdatePilotAbilities(move, dt);
    }

    private void CreateNodes()
    {
        nodes.Clear();
        nodes.Add(new SalvageNode { Position = new Vector2(385, 224), Kind = MaterialKind.Alloy, Amount = 3, Name = "Aster alloy", Color = Hex("70dbf0") });
        nodes.Add(new SalvageNode { Position = new Vector2(932, 224), Kind = MaterialKind.Crystal, Amount = 2, Name = "Solar crystal", Color = Hex("ffc56a") });
        nodes.Add(new SalvageNode { Position = new Vector2(350, 580), Kind = MaterialKind.Alloy, Amount = 3, Name = "Hull scrap", Color = Cyan });
        nodes.Add(new SalvageNode { Position = new Vector2(930, 580), Kind = MaterialKind.Crystal, Amount = 2, Name = "Reactor crystal", Color = Gold });
    }

    private void CollectNearbyNodes()
    {
        foreach (SalvageNode node in nodes)
        {
            if (node.Collected || Vector2.Distance(pilotPosition, node.Position) > 50) continue;
            CollectSalvage(node);
        }
    }

    private void CollectSalvage(SalvageNode node)
    {
            if (node.Collected) return;
            node.Collected = true;
            int amount = SalvageAmount(node);
            if (node.Kind == MaterialKind.Alloy) alloy += amount; else crystal += amount;
            score += 20;
            SpawnBurst(node.Position, node.Color, 16);
            pickupEffects.Add(new PickupEffect { Origin = node.Position, Kind = node.Kind, Amount = amount });
            PlayRelaySound(0);
            notice = "+" + amount + " " + (node.Kind == MaterialKind.Alloy ? "ALLOY" : "CRYSTAL") + " · " + node.Name;
            noticeTimer = 2.4f;
            if (tutorialStep == 0 && alloy >= 3 && crystal >= 1) tutorialStep = 1;
            pilotJournal.Salvage += amount; ActivityToday().Salvage += amount;
            SaveExpedition();
    }

    private void UpdateNight(float dt) => UpdateSwarm(dt);

    private void SpawnMeteor() => SpawnSwarmPack(1, false);

    private void UpdateBolts(float dt) => StepProjectiles(dt);

    private Meteor FindTarget(Vector2 origin, float range)
    {
        Meteor nearest = null;
        float best = range;
        foreach (Meteor enemy in meteors)
        {
            if (!enemy.Alive) continue;
            float d = Vector2.Distance(origin, enemy.Position);
            if (d < best) { nearest = enemy; best = d; }
        }
        return nearest;
    }

    private bool AnyMeteorsAlive()
    {
        foreach (Meteor enemy in meteors) if (enemy.Alive) return true;
        return false;
    }

    private void BeginWarning()
    {
        buildPanelOpen = learningPanelOpen = false;
        pilotWalking = false;
        raidBriefOpen = true;
    }

    private void LaunchWarnedRaid()
    {
        raidBriefOpen = false;
        CaptureSwarmCheckpoint();
        buildPanelOpen = false;
        learningPanelOpen = false;
        phase = Phase.Warning;
        warningTimer = 3.2f;
        enemyCountToSpawn = SwarmCount(night);
        enemiesSpawned = 0;
        waveMeteorsDestroyed = 0;
        waveStartHp = coreHp;
        waveCoreHit = false;
        peakSwarmAlive = 0;
        Array.Clear(turretFireTimers, 0, turretFireTimers.Length);
        nightElapsed = 0;
        spawnTimer = .35f;
        meteors.Clear(); bolts.Clear();
        capacitors.Clear(); pulseCharge = Mathf.Max(35, pulseCharge); pulseAge = 10;
        activeEnemyCount = 0;
        incomingText = "METEOR STORM  ·  NIGHT " + night;
        SaveExpedition();
    }

    private void BeginWave()
    {
        phase = Phase.Night;
        SeedOpeningSwarm();
        notice = "Night " + night + " · keep the HELIOS CORE standing until dawn.";
        noticeTimer = 4;
        SpawnBurst(corePosition, Cyan, 22);
    }

    private void BeginDawn()
    {
        if (phase != Phase.Night) return;
        phase = Phase.Dawn;
        bolts.Clear(); capacitors.Clear();
        pulseAge = 10;
        score += Mathf.Max(0, coreHp) * 2;
        dawnAlloyReward = 2 + night * 2 + astronautLevel / 2;
        dawnCleanDefense = !waveCoreHit;
        dawnCrystalReward = 1 + night / 2 + (dawnCleanDefense ? 1 : 0);
        dawnRewardsPending = true;
        RecordExpeditionVictory();
        noticeTimer = 0;
        SpawnBurst(corePosition, Gold, 34);
        RecordContinuousMilestone();
        SaveExpedition();
    }

    private void BeginNextDay()
    {
        night++;
        phase = Phase.Day;
        nodes.ForEach(n => n.Collected = false);
        coreHp = Mathf.Min(coreMaxHp, coreHp + Mathf.Max(10, coreMaxHp / 5));
        notice = "DAY " + night + "  ·  salvage the new crystal fall, then choose an upgrade.";
        noticeTimer = 4;
        SaveExpedition();
    }

    private void StartUpgrade(Upgrade upgrade)
    {
        if (!CanBuy(upgrade)) return;
        selectedUpgrade = upgrade;
        question = GenerateQuestion();
        questionAttempts = 0;
        selectedAnswer = -1;
        ResetLearningQuestion(false);
        questionIntro = !learningProfile.LessonSeen[question.Lesson];
        answerFeedback = "Take your time. You can ask for a hint or move the cells.";
        answerFeedbackColor = Cream;
        phase = Phase.Quiz;
    }

    private bool CanBuy(Upgrade upgrade)
    {
        UpgradeCost(upgrade, out int alloyCost, out int crystalCost);
        return (upgrade == Upgrade.IonTurret || turretCount > 0) && alloy >= alloyCost && crystal >= crystalCost;
    }

    private void Answer(int choiceIndex) => ResolveLearningAnswer(choiceIndex);

    private void CompleteUpgrade()
    {
        installationBefore = UpgradeBenefit(selectedUpgrade, false);
        UpgradeCost(selectedUpgrade, out installationAlloyCost, out installationCrystalCost);
        alloy -= installationAlloyCost;
        crystal -= installationCrystalCost;
        switch (selectedUpgrade)
        {
            case Upgrade.IonTurret:
                installationPosition = turretPads[turretMasteryPurchase ? 0 : Mathf.Min(turretCount, 3)];
                if (turretCount < 4 && !turretMasteryPurchase) turretCount++; else turretMastery++;
                break;
            case Upgrade.CoreShield:
                installationPosition = shieldPads[Mathf.Min(shieldLevels, 1)];
                if (shieldLevels < 2) shieldLevels++; else shieldMastery++;
                int integrity = 25 + UpgradeLevel(Upgrade.CoreShield) * 5;
                coreMaxHp += integrity; coreHp = Mathf.Min(coreMaxHp, coreHp + integrity);
                break;
            case Upgrade.SalvageRig:
                installationPosition = salvagePads[Mathf.Min(salvageLevels, 1)];
                if (salvageLevels < 2) salvageLevels++; else salvageMastery++;
                break;
            case Upgrade.PlasmaRifle:
                rifleLevels++; installationPosition = pilotPosition;
                break;
            case Upgrade.OrbitDrones:
                droneLevels++; installationPosition = pilotPosition;
                break;
            case Upgrade.Regeneration:
                regenerationLevels++; installationPosition = corePosition;
                break;
        }
        installationAfter = UpgradeBenefit(selectedUpgrade, false);
        installationRebate = questionAttempts == 1 && !questionSupported ? 1 : 0;
        alloy += installationRebate;
        totalCalibrationAlloy += installationRebate;
        installationAge = 0;
        phase = Phase.UpgradeReveal;
        rewardHudFlash = 3;
        noticeTimer = 0;
        pilotWalking = false;
        SpawnBurst(installationPosition, UpgradeColor(selectedUpgrade), 40);
        PlayRelaySound(2);
        RecordEngineeringBuilt();
        buildPanelOpen = false;
        SaveExpedition();
    }

    private MathQuestion GenerateQuestion() => NextLearningQuestion();

    private void UpdateSparks(float dt)
    {
        for (int i = sparks.Count - 1; i >= 0; i--)
        {
            Spark s = sparks[i];
            s.Life -= dt;
            s.Position += s.Velocity * dt;
            s.Velocity *= .96f;
            if (s.Life <= 0) sparks.RemoveAt(i); else sparks[i] = s;
        }
    }

    private void SpawnBurst(Vector2 at, Color color, int amount)
    {
        if (reducedMotion) amount = Mathf.Min(3, amount);
        for (int i = 0; i < amount && sparks.Count < 650; i++)
        {
            Vector2 velocity = UnityEngine.Random.insideUnitCircle * UnityEngine.Random.Range(55, 205);
            sparks.Add(new Spark { Position = at, Velocity = velocity, Life = UnityEngine.Random.Range(.18f, .7f), FullLife = .7f, Color = color, Size = UnityEngine.Random.Range(3, 8) });
        }
    }

    private void OnGUI()
    {
        float scale = Mathf.Min(Screen.width / DesignWidth, Screen.height / DesignHeight);
        float offsetX = (Screen.width - DesignWidth * scale) * .5f;
        float offsetY = (Screen.height - DesignHeight * scale) * .5f;
        Matrix4x4 previous = GUI.matrix;
        GUI.matrix = Matrix4x4.TRS(new Vector3(offsetX, offsetY, 0), Quaternion.identity, new Vector3(scale, scale, 1));
        InitStyles();
        if (menuOpen && phase != Phase.Quiz) { DrawAcademyMenu(); DrawExpeditionNotice(); GUI.matrix = previous; return; }
        Matrix4x4 interfaceMatrix = GUI.matrix;
        bool controlsEnabled = GUI.enabled;
        if (raidBriefOpen) GUI.enabled = false;
        DrawOuterSpace();
        GUI.matrix = interfaceMatrix * Matrix4x4.TRS(new Vector3(640 - 640 * WorldZoom, 396 - 400 * WorldZoom, 0), Quaternion.identity, new Vector3(WorldZoom, WorldZoom, 1));
        DrawWorld();
        DrawSalvageNodes();
        DrawTurrets();
        DrawBuildRangePreview();
        DrawMeteorsAndBolts();
        DrawPilot();
        DrawAscensionEffects();
        DrawFieldCombat();
        DrawPickupEffects();
        DrawFx();
        GUI.matrix = interfaceMatrix;
        DrawHud();
        DrawEquipmentSigns();
        DrawExpeditionDirector();
        DrawRewardHudPulse();
        DrawAscensionHud();
        DrawAbilityHud();
        if (phase == Phase.Warning) DrawRaidPopup();
        if (phase == Phase.Dawn) DrawDawnPopup();
        if (phase == Phase.Quiz) DrawQuizPopup();
        if (buildPanelOpen && phase == Phase.Day) DrawBuildPanel();
        if (learningPanelOpen && phase == Phase.Day) DrawLearningPanel();
        if (phase == Phase.UpgradeReveal) DrawUpgradeReveal();
        if (pauseOpen) DrawPause();
        if (phase == Phase.Victory) DrawEndScreen(true);
        if (phase == Phase.Defeat) DrawEndScreen(false);
        if (showTutorial && phase == Phase.Day && night == 1 && tutorialStep < 2 && !buildPanelOpen && !learningPanelOpen && !pauseOpen) DrawTutorialCard();
        DrawExpeditionNotice();
        GUI.enabled = controlsEnabled;
        if (raidBriefOpen) DrawRaidBriefing();
        GUI.matrix = previous;
    }

    private void InitStyles()
    {
        labelStyle = new GUIStyle(GUI.skin.label) { font = academyFont, fontSize = 17, fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleLeft, wordWrap = true, normal = { textColor = Cream } };
        titleStyle = new GUIStyle(labelStyle) { fontSize = 28, normal = { textColor = Cream } };
        hugeStyle = new GUIStyle(labelStyle) { fontSize = 42, alignment = TextAnchor.MiddleCenter, normal = { textColor = Cream } };
        smallStyle = new GUIStyle(labelStyle) { fontSize = 13, fontStyle = FontStyle.Normal, normal = { textColor = Hex("c4d0df") } };
        buttonStyle = new GUIStyle(GUI.skin.label) { font = academyFont, fontSize = 16, fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleCenter, wordWrap = true };
        buttonStyle.normal.background = null; buttonStyle.hover.background = null; buttonStyle.active.background = null;
        buttonStyle.normal.textColor = Cream; buttonStyle.hover.textColor = Color.white; buttonStyle.active.textColor = Gold;
    }

    private void DrawWorld()
    {
        float padding = (DesignWidth / WorldZoom - DesignWidth) * .5f;
        if (deckTexture != null)
        {
            // Reflect the outer starfield and gantries across the wider camera view.
            // Sampling meets at the same edge pixels, keeping the ship out of a visible image box.
            GUI.DrawTextureWithTexCoords(new Rect(-padding, 0, padding, DesignHeight), deckTexture, new Rect(padding / DesignWidth, 0, -padding / DesignWidth, 1), false);
            GUI.DrawTextureWithTexCoords(new Rect(DesignWidth, 0, padding, DesignHeight), deckTexture, new Rect(1, 0, -padding / DesignWidth, 1), false);
            GUI.DrawTexture(new Rect(0, 0, DesignWidth, DesignHeight), deckTexture, ScaleMode.StretchToFill, false);
        }
        else Fill(0, 0, DesignWidth, DesignHeight, Hex("17263e"));
        // A restrained night tint makes the same readable deck change mood at dusk.
        if (phase == Phase.Warning || phase == Phase.Night)
            Fill(-padding, 0, DesignWidth + padding * 2, DesignHeight, new Color(.035f, .055f, .12f, phase == Phase.Night ? .38f : .2f));
        if (hurtFlash > 0) Fill(-padding, 0, DesignWidth + padding * 2, DesignHeight, new Color(.92f, .12f, .12f, .18f * hurtFlash));

        // Core ring pulses and remains the central, readable loss condition.
        float pulse = Mathf.Sin(corePulse * 2.3f) * 4;
        Fill(corePosition.x - 52 - pulse, corePosition.y - 52 - pulse, 104 + pulse * 2, 104 + pulse * 2, new Color(.18f, .81f, .98f, .1f));
    }

    private void DrawOuterSpace()
    {
        Fill(0, 0, DesignWidth, DesignHeight, Hex("030b29"));
        for (int i = 0; i < 100; i++)
        {
            float x = (i * 173 + 31) % 1280;
            float y = (i * 97 + 41) % 800;
            float brightness = .25f + .15f * Mathf.Sin(corePulse * .7f + i);
            float size = i % 9 == 0 ? 3 : 2;
            Fill(x, y, size, size, new Color(.4f, .7f, 1f, brightness));
        }
    }

    private void DrawSalvageNodes()
    {
        if (phase != Phase.Day && phase != Phase.Warning && phase != Phase.Quiz && phase != Phase.UpgradeReveal) return;
        foreach (SalvageNode node in nodes)
        {
            if (node.Collected) continue;
            Color color = node.Kind == MaterialKind.Alloy ? Cyan : Gold;
            float bob = reducedMotion ? 0 : Mathf.Sin(corePulse * 2.6f + node.Position.x) * 3;
            DrawPixelEllipse(node.Position + new Vector2(0, 20), 28, 8, new Color(.01f, .02f, .06f, .7f));
            DrawPixelEllipse(node.Position + new Vector2(0, 18), 21, 5, new Color(color.r, color.g, color.b, .2f));
            DrawPickup(node.Kind, node.Position + new Vector2(0, -9 + bob), 48, Color.white);
            float glint = (corePulse * .45f + node.Position.x * .01f) % 1;
            Vector2 sparkle = node.Position + new Vector2(25, -23 - glint * 10);
            Color glintColor = new Color(color.r, color.g, color.b, Mathf.Sin(glint * Mathf.PI) * .85f);
            Fill(sparkle.x - 3, sparkle.y, 7, 2, glintColor);
            Fill(sparkle.x, sparkle.y - 3, 2, 7, glintColor);
            bool nearby = Vector2.Distance(pilotPosition, node.Position) < 125;
            if (nearby)
            {
                Fill(node.Position.x - 63, node.Position.y + 30, 126, 24, new Color(.025f, .045f, .09f, .9f));
                TextCentered((node.Kind == MaterialKind.Alloy ? "ALLOY  +" : "CRYSTAL  +") + SalvageAmount(node), node.Position.x - 60, node.Position.y + 31, 120, 22,
                    new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = color } });
            }
            else
                TextCentered("+" + SalvageAmount(node), node.Position.x - 20, node.Position.y + 24, 40, 23,
                    new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold, normal = { textColor = color } });
        }
    }

    private void DrawTurrets() => DrawShipEquipment();

    private void DrawMeteorsAndBolts() => DrawSwarm();

    private void DrawPilot()
    {
        DrawPixelEllipse(pilotPosition + new Vector2(0, 33), 22, 7, new Color(.01f, .02f, .04f, .65f));
        float bob = PilotBob;
        bool behind = pilotFacing == 1;
        if (behind) DrawPilotWeapon();
        if (pilotTexture != null) DrawTrimmedSprite(pilotTexture, pilotFrames[pilotFacing], pilotPosition + new Vector2(0, -11 + bob), 88, Color.white);
        else { Fill(pilotPosition.x - 13, pilotPosition.y - 17, 26, 34, Cream); Fill(pilotPosition.x - 9, pilotPosition.y - 11, 18, 9, Cyan); }
        if (!behind) DrawPilotWeapon();
    }

    private void DrawPickupEffects()
    {
        foreach (PickupEffect effect in pickupEffects)
        {
            Color color = effect.Kind == MaterialKind.Alloy ? Cyan : Gold;
            float t = Mathf.Clamp01(effect.Age / .55f);
            float eased = t * t * (3 - 2 * t);
            Vector2 position = Vector2.Lerp(effect.Origin, pilotPosition, eased) + new Vector2(0, -Mathf.Sin(t * Mathf.PI) * 42 - 14);
            if (effect.Age < .55f) DrawPickup(effect.Kind, position, Mathf.Lerp(38, 17, t), Color.white);
            float alpha = Mathf.Clamp01((1.1f - effect.Age) / .35f);
            TextCentered("+" + effect.Amount + (effect.Kind == MaterialKind.Alloy ? " ALLOY" : " CRYSTAL"), effect.Origin.x - 80, effect.Origin.y - 58 - effect.Age * 32, 160, 30,
                new GUIStyle(labelStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = new Color(color.r, color.g, color.b, alpha) } });
        }
    }

    private void DrawFx()
    {
        DrawBlastRings();
        foreach (Spark spark in sparks)
        {
            float alpha = Mathf.Clamp01(spark.Life / spark.FullLife);
            Fill(spark.Position.x, spark.Position.y, spark.Size, spark.Size, new Color(spark.Color.r, spark.Color.g, spark.Color.b, alpha));
        }
    }

    private void DrawHud()
    {
        Fill(0, 0, 1280, 106, new Color(.035f, .06f, .12f, .97f));
        Fill(0, 104, 1280, 3, Gold);
        Text("STARFALL", 24, 14, 220, 37, titleStyle);
        Text("RELAY  //  " + learningProfile.CadetName.ToUpperInvariant(), 27, 53, 310, 24, smallStyle);
        string phaseName = phase == Phase.Night || phase == Phase.Warning ? "NIGHT " + night : phase == Phase.Dawn ? "DAWN" : "DAY " + night;
        // Keep the phase chip legible against its light text at every phase.
        Color phaseColor = phase == Phase.Night || phase == Phase.Warning ? Hex("713d36") : phase == Phase.Dawn ? Hex("715a2c") : Hex("195765");
        Chip(phaseName + " · ENDLESS", 374, 23, 184, 50, phaseColor);
        Text("HELIOS CORE", 595, 15, 180, 25, smallStyle);
        ProgressBar(595, 47, 205, 20, coreHp / (float)coreMaxHp, coreHp <= 35 ? Ember : Cyan);
        Text(coreHp + " / " + coreMaxHp, 806, 43, 90, 27, labelStyle);
        DrawMaterialCounter(MaterialKind.Alloy, alloy, new Rect(922, 23, 145, 50), Hex("34485d"));
        DrawMaterialCounter(MaterialKind.Crystal, crystal, new Rect(1076, 23, 172, 50), Hex("514335"));

        Fill(0, 686, 1280, 114, new Color(.035f, .06f, .12f, .98f));
        Fill(0, 686, 1280, 3, Gold);
        string objective = phase == Phase.Day
            ? (night == 1 && tutorialStep == 0 ? "OBJECTIVE  ·  gather 3 alloy + 1 crystal for your first turret" : night == 1 && tutorialStep == 1 ? "OBJECTIVE  ·  press B and install your first Ion Turret" : "OBJECTIVE  ·  salvage, upgrade, then survive Night " + night)
            : phase == Phase.Night || phase == Phase.Warning ? "OBJECTIVE  ·  turn the swarm into stardust" : phase == Phase.Dawn ? "OBJECTIVE  ·  claim supplies and keep growing" : phase == Phase.UpgradeReveal ? "OBJECTIVE  ·  new power installed" : "OBJECTIVE  ·  grow stronger and hold the relay";
        Text(objective, 25, 698, 710, 27, labelStyle);
        Text("WASD MOVE · SHIFT BOOST · SPACE NOVA · B BUILD · M MENU", 26, 736, 720, 22, smallStyle);
        Text("RIFLE " + RifleDamage + " DMG · " + RifleStreams + " STREAMS · TURRETS " + turretCount + " · " + lifetimeKills + " KILLS", 26, 763, 720, 21, smallStyle);
        if (phase == Phase.Day)
        {
            if (PixelButton("UPGRADES  [B]", 801, 716, 210, 56, Gold)) buildPanelOpen = !buildPanelOpen;
            bool canStart = turretCount > 0;
            if (PixelButton("START NIGHT " + night + " [N]", 1024, 716, 226, 56, canStart ? Ember : Hex("3e4657")))
            {
                if (canStart) BeginWarning(); else { notice = "First install an Ion Turret: gather salvage, then solve its calibration."; noticeTimer = 3; }
            }
        }
        else if (phase == Phase.Night)
        {
            Chip("SWARM " + activeEnemyCount + " LIVE\n" + waveMeteorsDestroyed + " / " + enemyCountToSpawn + " STOPPED", 1012, 718, 236, 52, Hex("6b3e45"));
        }
        else if (phase == Phase.Warning) Chip("IMPACT IN  " + Mathf.CeilToInt(warningTimer), 1012, 718, 236, 52, Ember);
        else if (phase == Phase.Dawn) Chip("DAWN  ·  SECTOR CLEAR", 1012, 718, 236, 52, Mint);
        if (noticeTimer > 0 && !string.IsNullOrEmpty(notice))
        {
            Fill(350, 144, 560, 38, new Color(.04f, .07f, .12f, .91f));
            TextCentered(notice, 364, 148, 532, 30, smallStyle);
        }
    }

    private void DrawTutorialCard()
    {
        Vector2 target = new Vector2(906, 706);
        if (tutorialStep == 0)
        {
            SalvageNode nearest = null;
            float distance = float.MaxValue;
            foreach (SalvageNode node in nodes)
            {
                if (node.Collected || (alloy >= 3 && node.Kind == MaterialKind.Alloy)) continue;
                float candidate = Vector2.Distance(pilotPosition, node.Position);
                if (candidate < distance) { nearest = node; distance = candidate; }
            }
            if (nearest != null) target = WorldToScreen(nearest.Position) + new Vector2(0, -36);
        }
        float bounce = Mathf.Round(Mathf.Sin(corePulse * 4) * 3);
        Fill(target.x - 2, target.y - 18 + bounce, 4, 13, Gold);
        Fill(target.x - 8, target.y - 9 + bounce, 16, 4, Gold);
        Fill(target.x - 5, target.y - 5 + bounce, 10, 3, Gold);
        Fill(target.x - 2, target.y - 2 + bounce, 4, 3, Gold);
        Fill(30, 128, 300, 106, new Color(.04f, .07f, .12f, .95f));
        Fill(30, 128, 5, 106, Gold);
        Text("FLIGHT SCHOOL  ·  " + (tutorialStep + 1) + "/2", 50, 139, 260, 24, new GUIStyle(smallStyle) { normal = { textColor = Gold }, fontStyle = FontStyle.Bold });
        string instruction = tutorialStep == 0
            ? "WASD to walk. Touch the cyan alloy and gold crystal caches."
            : "Press B for upgrades. Install your first turret by solving its math lock.";
        Text(instruction, 50, 169, 255, 58, new GUIStyle(labelStyle) { fontSize = 16 });
    }

    private void DrawBuildPanel() => DrawEngineeringBay();

    private void DrawQuizPopup() => DrawTeachingQuestion();

    private void DrawRaidPopup()
    {
        OverlayShade(.53f);
        Fill(345, 210, 590, 354, Ink);
        Fill(345, 210, 590, 6, Ember);
        TextCentered("⚠  RAID WARNING", 375, 238, 530, 52, new GUIStyle(titleStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = Ember } });
        TextCentered(enemyCountToSpawn + " ELEMENTAL CONTACTS DETECTED", 375, 296, 530, 33, labelStyle);
        TextCentered(ThreatName(night) + "\n" + ThreatDescription(night), 375, 335, 530, 60, smallStyle);
        TextCentered("SHIFT boost · collect field cells · SPACE Nova Pulse", 375, 401, 530, 27, new GUIStyle(smallStyle) { alignment = TextAnchor.MiddleCenter, normal = { textColor = Cyan } });
        ProgressBar(427, 438, 426, 18, warningTimer / 3.2f, Ember);
        TextCentered("IMPACT IN  " + Mathf.CeilToInt(warningTimer), 427, 472, 426, 38, titleStyle);
    }

    private void DrawDawnPopup() => DrawWaveRewards();

    private void DrawPause()
    {
        OverlayShade(.8f);
        Fill(435, 260, 410, 266, Ink); Fill(435, 260, 410, 5, Gold);
        TextCentered("PAUSED", 460, 290, 360, 46, titleStyle);
        TextCentered("WASD to move · auto-fire is active", 460, 345, 360, 30, smallStyle);
        if (PixelButton("RESUME  [ESC]", 478, 405, 324, 52, Hex("277c8e"))) pauseOpen = false;
        if (PixelButton("MAIN MENU [M]", 478, 466, 324, 38, PanelLight)) OpenAcademyMenu(HubPage.Home);
    }

    private void DrawEndScreen(bool won) => DrawLearningEndScreen(won);

    private void DrawSprite(Texture2D texture, Vector2 pos, float width, float height, Color tint)
    {
        Color old = GUI.color;
        GUI.color = tint;
        GUI.DrawTexture(new Rect(pos.x - width * .5f, pos.y - height * .5f, width, height), texture, ScaleMode.StretchToFill, true);
        GUI.color = old;
    }

    private static Vector2 WorldToScreen(Vector2 position)
        => new Vector2(640, 396) + (position - new Vector2(640, 400)) * WorldZoom;

    private void CacheSpriteFrames()
    {
        pilotFrames[0] = TrimTransparentBorder(pilotTexture, new Rect(0, .5f, .5f, .5f));
        pilotFrames[1] = TrimTransparentBorder(pilotTexture, new Rect(.5f, .5f, .5f, .5f));
        pilotFrames[2] = TrimTransparentBorder(pilotTexture, new Rect(0, 0, .5f, .5f));
        pilotFrames[3] = TrimTransparentBorder(pilotTexture, new Rect(.5f, 0, .5f, .5f));
        alloyPickupUv = TrimTransparentBorder(alloyPickupTexture, new Rect(0, 0, 1, 1));
        crystalPickupUv = TrimTransparentBorder(crystalPickupTexture, new Rect(0, 0, 1, 1));
    }

    private static Rect TrimTransparentBorder(Texture2D texture, Rect region)
    {
        if (texture == null || !texture.isReadable) return region;
        Color32[] pixels = texture.GetPixels32();
        int x0 = Mathf.RoundToInt(region.xMin * texture.width), x1 = Mathf.RoundToInt(region.xMax * texture.width);
        int y0 = Mathf.RoundToInt(region.yMin * texture.height), y1 = Mathf.RoundToInt(region.yMax * texture.height);
        int minX = x1, minY = y1, maxX = x0 - 1, maxY = y0 - 1;
        for (int y = y0; y < y1; y++)
            for (int x = x0; x < x1; x++)
            {
                if (pixels[y * texture.width + x].a < 32) continue;
                minX = Mathf.Min(minX, x); minY = Mathf.Min(minY, y);
                maxX = Mathf.Max(maxX, x); maxY = Mathf.Max(maxY, y);
            }
        if (maxX < minX || maxY < minY) return region;
        minX = Mathf.Max(x0, minX - 2); minY = Mathf.Max(y0, minY - 2);
        maxX = Mathf.Min(x1 - 1, maxX + 2); maxY = Mathf.Min(y1 - 1, maxY + 2);
        return new Rect(minX / (float)texture.width, minY / (float)texture.height, (maxX - minX + 1) / (float)texture.width, (maxY - minY + 1) / (float)texture.height);
    }

    private void DrawTrimmedSprite(Texture2D texture, Rect uv, Vector2 position, float height, Color tint)
    {
        if (texture == null || uv.height <= 0) return;
        float width = height * (uv.width * texture.width) / (uv.height * texture.height);
        texture = LiveryTexture(texture);
        Color old = GUI.color;
        GUI.color = tint;
        GUI.DrawTextureWithTexCoords(new Rect(Mathf.Round(position.x - width * .5f), Mathf.Round(position.y - height * .5f), Mathf.Round(width), height), texture, uv, true);
        GUI.color = old;
    }

    private void DrawPickup(MaterialKind kind, Vector2 position, float height, Color tint)
        => DrawTrimmedSprite(kind == MaterialKind.Alloy ? alloyPickupTexture : crystalPickupTexture, kind == MaterialKind.Alloy ? alloyPickupUv : crystalPickupUv, position, height, tint);

    private void DrawMaterialCounter(MaterialKind kind, int amount, Rect rect, Color background)
    {
        Chip("", rect.x, rect.y, rect.width, rect.height, background);
        DrawPickup(kind, new Vector2(rect.x + 24, rect.center.y), 29, Color.white);
        Text(amount + (kind == MaterialKind.Alloy ? " ALLOY" : " CRYSTAL"), rect.x + 48, rect.y + 3, rect.width - 52, rect.height - 6, smallStyle);
    }

    private void DrawPixelEllipse(Vector2 center, float radiusX, float radiusY, Color color)
    {
        for (float y = -radiusY; y <= radiusY; y += 2)
        {
            float halfWidth = Mathf.Sqrt(Mathf.Max(0, 1 - y * y / (radiusY * radiusY))) * radiusX;
            Fill(Mathf.Round(center.x - halfWidth), Mathf.Round(center.y + y), Mathf.Round(halfWidth * 2), 2, color);
        }
    }

    private void OverlayShade(float alpha) => Fill(0, 0, DesignWidth, DesignHeight, new Color(.015f, .025f, .06f, alpha));

    private bool PixelButton(string text, float x, float y, float w, float h, Color color)
    {
        Rect hit = new Rect(x, y, w, h);
        bool hover = hit.Contains(Event.current.mousePosition);
        bool pressed = hover && Input.GetMouseButton(0);
        float top = y + (pressed ? 2 : 0);
        Color face = hover ? Color.Lerp(color, Color.white, .13f) : color;
        Fill(x, y + 4, w, h, Hex("070d17"));
        Fill(x, top, w, h, hover ? LearnerAccent : Hex("304355"));
        Fill(x + 1, top + 1, w - 2, h - 3, Hex("0a1220"));
        Fill(x + 3, top + 3, w - 6, h - 7, face);
        Fill(x + 5, top + 4, w - 10, 1, new Color(1, 1, 1, hover ? .32f : .16f));
        var fitted = new GUIStyle(buttonStyle) { fontSize = h < 32 ? 12 : 16, wordWrap = false, padding = new RectOffset() };
        while (fitted.fontSize > 10 && fitted.CalcSize(new GUIContent(text)).x > w - 14) fitted.fontSize--;
        return GUI.Button(new Rect(x + 3, top + 1, w - 6, h - 4), text, fitted);
    }

    private void Chip(string text, float x, float y, float w, float h, Color color)
    {
        Fill(x, y + 3, w, h, Hex("080f1b")); Fill(x, y, w, h, Hex("0b1423"));
        Fill(x + 2, y + 2, w - 4, h - 5, color);
        TextCentered(text, x + 5, y + 3, w - 10, h - 6, smallStyle);
    }

    private void TextCentered(string text, float x, float y, float w, float h, GUIStyle style)
        => GUI.Label(new Rect(x, y, w, h), text, new GUIStyle(style) { alignment = TextAnchor.MiddleCenter });

    private void Text(string text, float x, float y, float w, float h, GUIStyle style)
        => GUI.Label(new Rect(x, y, w, h), text, style);

    private void ProgressBar(float x, float y, float w, float h, float value, Color color)
    {
        Fill(x, y, w, h, Hex("0a1321"));
        float filled = Mathf.Clamp01(value) * (w - 4);
        Fill(x + 2, y + 2, filled, h - 4, color);
        if (filled > 3) Fill(x + 2, y + 2, filled, 2, new Color(1, 1, 1, .25f));
    }

    private void Fill(float x, float y, float w, float h, Color color)
    {
        Color old = GUI.color; GUI.color = color;
        GUI.DrawTexture(new Rect(x, y, w, h), pixel);
        GUI.color = old;
    }

    private static Color Hex(string hex)
    {
        Color value; ColorUtility.TryParseHtmlString("#" + hex, out value); return value;
    }
}

internal static class RuneholdBootstrap
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void StartPrototype()
    {
        if (UnityEngine.Object.FindAnyObjectByType<RuneholdGame>() != null) return;
        var root = new GameObject("Starfall Relay Runtime");
        UnityEngine.Object.DontDestroyOnLoad(root);
        root.AddComponent<RuneholdGame>();
    }
}
