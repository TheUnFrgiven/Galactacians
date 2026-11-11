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
    private const float WorldZoom = .62f;
    private const int MaxQuestionAttempts = 2;
    private readonly Vector2 corePosition = new Vector2(640, 360);
    private readonly List<Meteor> meteors = new List<Meteor>();
    private readonly List<Bolt> bolts = new List<Bolt>();
    private readonly List<Spark> sparks = new List<Spark>();
    private readonly List<SalvageNode> nodes = new List<SalvageNode>();
    private readonly List<PickupEffect> pickupEffects = new List<PickupEffect>();
    private readonly List<Vector2> turretPads = new List<Vector2> {
        DeckPoint(463, 182), DeckPoint(817, 182), DeckPoint(463, 541), DeckPoint(817, 541)
    };

    private Phase phase = Phase.Day;
    private Texture2D deckTexture, pilotTexture, meteorTexture, turretTexture, pixel;
    private Texture2D alloyPickupTexture, crystalPickupTexture;
    private readonly Rect[] pilotFrames = new Rect[4];
    private Rect alloyPickupUv, crystalPickupUv;
    private GUIStyle labelStyle, titleStyle, smallStyle, hugeStyle;
    private Vector2 pilotPosition = new Vector2(640, 670);
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
    private string notice = "Drag the move stick. Walk over salvage to gather it.";
    private string incomingText = "";
    private string answerFeedback = "";
    private Color answerFeedbackColor = Mint;

    private void Awake()
    {
        deckTexture = Resources.Load<Texture2D>("Art/StarshipDeck");
        PrepareReadableArtwork();
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
        InitializeSky();
        Application.targetFrameRate = 60;
        bestScore = PlayerPrefs.GetInt("starfall.best", 0);
        CreateNodes();
        if (Application.productName.EndsWith("Preview")) ConfigureSwarmPreview();
        else LoadExpedition();
        InitializeAcademyMenu();
        InitializeCombinedExpedition();
        InitializeGuide();
        shieldHp = Mathf.Clamp(shieldHp, 0, ShieldCapacity);
        pilotPosition = NearestDeckPosition(pilotPosition);
        worldCamera = pilotPosition;
        Input.simulateMouseWithTouches = true;
        Screen.orientation = ScreenOrientation.LandscapeLeft;
    }

    private void OnDestroy()
    {
        foreach (Texture2D variant in liveryTextures.Values) Destroy(variant);
        foreach (Texture2D portrait in menuPortraits.Values) Destroy(portrait);
        foreach (AudioClip clip in relaySounds) Destroy(clip);
        if (relayMusic != null) relayMusic.Stop();
        if (relayMusicClip != null) Destroy(relayMusicClip);
        if (pixel != null) Destroy(pixel);
        if (readableDeck != null) Destroy(readableDeck);
        if (spaceSky != null) Destroy(spaceSky);
    }

    private void Update()
    {
        float dt = Time.deltaTime;
        corePulse += dt;
        UpdateExpeditionPresentation(dt);
        UpdateRelayMusic(dt);
        UpdateTouchMovement();
        worldCamera = Vector2.Lerp(worldCamera, pilotPosition + new Vector2(0, -65), 1 - Mathf.Exp(-dt * 5));
        if (UpdateGuide()) return;
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
        Vector2 move = touchMove;
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
        MoveOnDeck(move * speed * dt);
        UpdatePilotAbilities(move, dt);
    }

    private void CreateNodes()
    {
        nodes.Clear();
        nodes.Add(new SalvageNode { Position = DeckPoint(387, 231), Kind = MaterialKind.Alloy, Amount = 3, Name = "Aster metal", Color = Hex("70dbf0") });
        nodes.Add(new SalvageNode { Position = DeckPoint(892, 231), Kind = MaterialKind.Crystal, Amount = 2, Name = "Solar crystal", Color = Hex("ffc56a") });
        nodes.Add(new SalvageNode { Position = DeckPoint(387, 514), Kind = MaterialKind.Alloy, Amount = 3, Name = "Hull scrap", Color = Cyan });
        nodes.Add(new SalvageNode { Position = DeckPoint(892, 514), Kind = MaterialKind.Crystal, Amount = 2, Name = "Reactor crystal", Color = Gold });
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
        shieldHp = ShieldCapacity;
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
        notice = "Night " + night + " · keep the SHIP standing until dawn.";
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
        coreHp = Mathf.Min(coreMaxHp, coreHp + 10);
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
                shieldHp = ShieldCapacity;
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
        Rect safe = Screen.safeArea;
        float scale = Mathf.Min(safe.width / DesignWidth, safe.height / DesignHeight);
        float offsetX = safe.x + (safe.width - DesignWidth * scale) * .5f;
        float offsetY = Screen.height - safe.yMax + (safe.height - DesignHeight * scale) * .5f;
        Matrix4x4 previous = GUI.matrix;
        DrawScreenBackdrop();
        bool originalEnabled = GUI.enabled;
        GUI.enabled = originalEnabled && !guideOpen;
        GUI.matrix = Matrix4x4.TRS(new Vector3(offsetX, offsetY, 0), Quaternion.identity, new Vector3(scale, scale, 1));
        InitStyles();
        if (menuOpen && phase != Phase.Quiz) { DrawAcademyMenu(); DrawExpeditionNotice(); GUI.enabled = originalEnabled; DrawGuideDialogue(); GUI.matrix = previous; return; }
        Matrix4x4 interfaceMatrix = GUI.matrix;
        bool controlsEnabled = originalEnabled;
        bool fieldBlocked = guideOpen || raidBriefOpen || pauseOpen || buildPanelOpen || learningPanelOpen ||
            phase == Phase.Quiz || phase == Phase.UpgradeReveal || phase == Phase.Dawn || phase == Phase.Warning || phase == Phase.Victory || phase == Phase.Defeat;
        GUI.enabled = controlsEnabled && !fieldBlocked;
        GUI.matrix = interfaceMatrix * Matrix4x4.TRS(new Vector3(WorldOrigin.x, WorldOrigin.y, 0), Quaternion.identity, new Vector3(WorldZoom, WorldZoom, 1));
        DrawWorld();
        DrawSalvageNodes();
        DrawTurrets();

        DrawMeteorsAndBolts();
        DrawPilot();
        DrawAscensionEffects();
        DrawFieldCombat();
        DrawPickupEffects();
        DrawFx();
        GUI.matrix = interfaceMatrix;
        DrawWorldActions();
        DrawHud();
        DrawExpeditionDirector();
        DrawRewardHudPulse();

        DrawTouchControls();
        DrawDeckNavigator();
        GUI.enabled = controlsEnabled && !guideOpen;
        if (phase == Phase.Warning) DrawRaidPopup();
        if (phase == Phase.Dawn) DrawDawnPopup();
        if (phase == Phase.Quiz) DrawQuizPopup();
        if (buildPanelOpen && phase == Phase.Day) DrawBuildPanel();
        if (learningPanelOpen && phase == Phase.Day) DrawLearningPanel();
        if (phase == Phase.UpgradeReveal) DrawUpgradeReveal();
        if (pauseOpen) DrawPause();
        if (phase == Phase.Victory) DrawEndScreen(true);
        if (phase == Phase.Defeat) DrawEndScreen(false);
        DrawExpeditionNotice();
        GUI.enabled = controlsEnabled && !guideOpen;
        if (raidBriefOpen) DrawRaidBriefing();
        if (!guideOpen && !buildPanelOpen && phase != Phase.Quiz && (raidBriefOpen || pauseOpen || phase == Phase.UpgradeReveal || phase == Phase.Dawn || phase == Phase.Warning || phase == Phase.Defeat || phase == Phase.Victory)) DrawAskHelp(new Rect(1040, 20, 208, 58));
        GUI.enabled = controlsEnabled;
        DrawGuideDialogue();
        GUI.matrix = previous;
    }

    private void InitStyles()
    {
        labelStyle = new GUIStyle(GUI.skin.label) { font = academyFont, fontSize = 17, fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleLeft, wordWrap = true, normal = { textColor = Cream } };
        titleStyle = new GUIStyle(labelStyle) { fontSize = 28, normal = { textColor = Cream } };
        hugeStyle = new GUIStyle(labelStyle) { fontSize = 42, alignment = TextAnchor.MiddleCenter, normal = { textColor = Cream } };
        smallStyle = new GUIStyle(labelStyle) { font = academyBodyFont, fontSize = 13, fontStyle = FontStyle.Normal, normal = { textColor = Hex("c4d0df") } };

    }

    private void DrawWorld()
    {
        Rect deck = DeckRect;
        Rect view = WorldViewport;
        if (deckTexture != null) GUI.DrawTexture(deck, deckTexture, ScaleMode.StretchToFill, true);
        if (phase == Phase.Warning || phase == Phase.Night)
            Fill(view.x, view.y, view.width, view.height, new Color(.035f, .055f, .12f, phase == Phase.Night ? .20f : .10f));
        if (hurtFlash > 0) Fill(view.x, view.y, view.width, view.height, new Color(.92f, .12f, .12f, .18f * hurtFlash));
        DrawDeckWayfinding();
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
            DrawPixelEllipse(node.Position + new Vector2(0, 22), 43, 15, Ink);
            DrawPixelEllipse(node.Position + new Vector2(0, 22), 38, 11, color);
            DrawPickup(node.Kind, node.Position + new Vector2(0, -8), 66, Color.white);
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
            TextCentered("+" + effect.Amount + (effect.Kind == MaterialKind.Alloy ? " METAL" : " CRYSTAL"), effect.Origin.x - 80, effect.Origin.y - 58 - effect.Age * 32, 160, 30,
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
        UiRound(new Rect(0, 0, 1280, 98), UiPaper, 0);
        Fill(0, 96, 1280, 2, UiLine);
        if (MenuButton("Home", MenuAction, Cyan)) OpenAcademyMenu(HubPage.Home);
        UiText((phase == Phase.Night || phase == Phase.Warning ? "Night " : "Day ") + night, new Rect(162, 13, 150, 36), 29, true);
        UiText("Pilot level " + astronautLevel, new Rect(164, 53, 160, 28), 19, false, UiMuted);
        DrawHealthAndShield();
        DrawClearMaterial(MaterialKind.Alloy, alloy, new Rect(752, 18, 225, 60));
        DrawClearMaterial(MaterialKind.Crystal, crystal, new Rect(993, 18, 263, 60));
        if (FieldControlsAvailable)
        {
            UiRound(new Rect(0, 682, 1280, 118), UiPaper, 0); Fill(0, 682, 1280, 2, UiLine);
            bool day = phase == Phase.Day;
            DrawGuideFooter();
            if (day)
            {
                if (MenuButton("Build & upgrade", BuildAction, Cyan, true, true)) OpenEquipmentBay(RecommendedUpgrade);
                if (MenuButton("Start night " + night, LaunchAction, Gold)) RequestNightLaunch();
            }
            else
            {
                UiCard(new Rect(690, 702, 566, 72), Mint);
                UiText("Your blaster fires automatically", new Rect(714, 710, 520, 32), 23, true);
                UiText("Move, collect energy and use Blast when it is ready.", new Rect(714, 746, 520, 24), 18, false, UiMuted);
            }
        }
        if (noticeTimer > 0 && !string.IsNullOrEmpty(notice) && !buildPanelOpen && phase != Phase.Quiz)
        {
            UiCard(new Rect(355, 110, 565, 58), Cyan);
            UiText(notice, new Rect(372, 117, 531, 44), 19);
        }
    }

    private void DrawClearMaterial(MaterialKind kind, int amount, Rect rect)
    {
        UiRound(rect, kind == MaterialKind.Alloy ? Hex("e6f4fc") : Hex("fff0d5"));
        DrawPickup(kind, new Vector2(rect.x + 32, rect.center.y), 40, Color.white);
        UiText(amount.ToString(), new Rect(rect.x + 64, rect.y + 1, rect.width - 76, 33), 27, true);
        UiText(kind == MaterialKind.Alloy ? "Metal" : "Crystals", new Rect(rect.x + 64, rect.y + 33, rect.width - 76, 24), 19, false, UiMuted);
    }

    private void RequestNightLaunch()
    {
        if (turretCount > 0) BeginWarning();
        else { notice = "Install your first Tower: gather salvage, then solve its calibration."; noticeTimer = 4; }
    }

    private void DrawTutorialCard()
    {
        UiCard(new Rect(24, 112, 316, 82), Cyan);
        UiText("Let's help our spaceship!", new Rect(40, 122, 284, 29), 21, true);
        UiText(tutorialStep == 0 ? "Tap a resource, or use the move stick." : "Tap Build & upgrade to make a tower.", new Rect(40, 155, 284, 30), 18, false, UiMuted);
    }

    private void DrawBuildPanel() => DrawEngineeringBay();

    private void DrawQuizPopup() => DrawTeachingQuestion();

    private void DrawRaidPopup()
    {
        OverlayShade(.72f); UiCard(new Rect(300, 190, 680, 414), Gold);
        UiText("Here come the meteors!", new Rect(332, 214, 616, 68), 36, true, UiInk, TextAnchor.MiddleCenter);
        UiText("Your blaster and towers shoot automatically.", new Rect(340, 300, 600, 70), 25, false, UiMuted, TextAnchor.MiddleCenter);
        UiText(Mathf.CeilToInt(warningTimer).ToString(), new Rect(340, 383, 600, 120), 82, true, UiBlue, TextAnchor.MiddleCenter);
        UiText("Move with the stick. Tap Blast when it is ready.", new Rect(340, 522, 600, 50), 23, false, UiMuted, TextAnchor.MiddleCenter);
    }

    private void DrawDawnPopup() => DrawWaveRewards();

    private void DrawPause()
    {
        OverlayShade(.8f);
        MenuCard(new Rect(435, 260, 410, 266), Gold);
        TextCentered("PAUSED", 460, 290, 360, 46, titleStyle);
        TextCentered("Drag to move · your rifle fires automatically", 460, 345, 360, 30, smallStyle);
        if (PixelButton("RESUME", 478, 405, 324, 52, Hex("277c8e"))) pauseOpen = false;
        if (PixelButton("MAIN MENU", 478, 466, 324, 38, PanelLight)) OpenAcademyMenu(HubPage.Home);
    }

    private void DrawEndScreen(bool won) => DrawLearningEndScreen(won);

    private void DrawSprite(Texture2D texture, Vector2 pos, float width, float height, Color tint)
    {
        Color old = GUI.color;
        GUI.color = tint;
        GUI.DrawTexture(new Rect(pos.x - width * .5f, pos.y - height * .5f, width, height), texture, ScaleMode.StretchToFill, true);
        GUI.color = old;
    }

    private Vector2 WorldToScreen(Vector2 position)
        => WorldOrigin + position * WorldZoom;

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
        Text(amount + (kind == MaterialKind.Alloy ? " METAL" : " CRYSTAL"), rect.x + 48, rect.y + 3, rect.width - 52, rect.height - 6, smallStyle);
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
        => MenuButton(text, new Rect(x, y, w, h), color);

    private void Chip(string text, float x, float y, float w, float h, Color color)
    {
        Fill(x, y + 3, w, h, Hex("080f1b")); Fill(x, y, w, h, Hex("0b1423"));
        Fill(x + 2, y + 2, w - 4, h - 5, color);
        TextCentered(text, x + 5, y + 3, w - 10, h - 6, smallStyle);
    }

    private void TextCentered(string text, float x, float y, float w, float h, GUIStyle style)
        => GUI.Label(new Rect(x, y, w, h), text, new GUIStyle(DisplayStyle(style)) { alignment = TextAnchor.MiddleCenter });

    private void Text(string text, float x, float y, float w, float h, GUIStyle style)
        => GUI.Label(new Rect(x, y, w, h), text, DisplayStyle(style));

    private void ProgressBar(float x, float y, float w, float h, float value, Color color)
    {
        Fill(x, y, w, h, Hex("0a1321"));
        float inset = h < 8 ? 1 : 2;
        float filled = Mathf.Clamp01(value) * (w - inset * 2);
        Fill(x + inset, y + inset, filled, Mathf.Max(1, h - inset * 2), color);
        if (filled > 3 && h >= 10) Fill(x + inset, y + inset, filled, 1, new Color(1, 1, 1, .2f));
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
