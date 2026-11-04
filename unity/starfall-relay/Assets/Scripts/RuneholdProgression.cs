using System;
using System.IO;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private int astronautLevel = 1, experience, lifetimeKills;
    private int rifleLevels, droneLevels, regenerationLevels;
    private int turretMastery, shieldMastery, salvageMastery, lastMilestoneNight;
    private bool astronautUpgradeTab;
    private float droneTimer, regenerationCharge, ascensionFlash;
    private int ExperienceNeeded => 35 + astronautLevel * 20;
    private int RifleDamage => 1 + rifleLevels + (astronautLevel - 1) / 3;
    private int RifleStreams => Mathf.Min(7, 1 + rifleLevels / 3 + (astronautLevel - 1) / 8);
    private int TurretDamage => 2 + turretMastery * 2 + (astronautLevel - 1) / 4;
    private int AscensionPower => astronautLevel + rifleLevels + droneLevels + regenerationLevels;
    private string AscensionTitle => AscensionPower < 8 ? "RELAY SCOUT" : AscensionPower < 18 ? "SWARM HUNTER"
        : AscensionPower < 35 ? "STAR REAPER" : AscensionPower < 60 ? "VOID DEMIGOD" : "IMMORTAL";
    private int CrowdLimit => Mathf.Min(900, 280 + night * 40);
    private int SalvageAmount(SalvageNode node) => node.Amount + UpgradeLevel(Upgrade.SalvageRig) + night / 3;
    private string ExpeditionPath => Path.Combine(Application.persistentDataPath, "starfall-expedition-v1.json");

    [Serializable]
    private sealed class ExpeditionSave
    {
        public int Version = 1, Night, Alloy, Crystal, CoreHp, CoreMaxHp, Score, Turrets, Shields, Rigs;
        public int Level, Experience, Kills, Rifle, Drones, Regeneration, TurretMastery, ShieldMastery, SalvageMastery;
        public int Calibrations, CalibrationAlloy, Tutorial, LastMilestone, RewardAlloy, RewardCrystal, WaveKills, WaveTotal;
        public bool Dawn, Clean;
        public bool[] Collected;
        public float PilotX, PilotY;
    }

    private void SaveExpedition()
    {
        SavePilotJournal();
        if (!CanPersistProgress) return;
        Phase savedPhase = studySession ? studyReturnPhase : phase;
        bool battle = swarmCheckpointReady && (savedPhase == Phase.Night || savedPhase == Phase.Warning || savedPhase == Phase.Defeat);
        var save = new ExpeditionSave {
            Night = night, Alloy = alloy, Crystal = crystal, CoreHp = battle ? checkpointCoreHp : coreHp, CoreMaxHp = coreMaxHp,
            Score = battle ? checkpointScore : score, Turrets = turretCount, Shields = shieldLevels, Rigs = salvageLevels,
            Level = astronautLevel, Experience = experience,
            Kills = lifetimeKills, Rifle = rifleLevels, Drones = droneLevels, Regeneration = regenerationLevels,
            TurretMastery = turretMastery, ShieldMastery = shieldMastery, SalvageMastery = salvageMastery,
            Calibrations = correctAnswers, CalibrationAlloy = totalCalibrationAlloy, Tutorial = tutorialStep, LastMilestone = lastMilestoneNight,
            Dawn = savedPhase == Phase.Dawn && dawnRewardsPending, Clean = dawnCleanDefense, RewardAlloy = dawnAlloyReward,
            RewardCrystal = dawnCrystalReward, WaveKills = waveMeteorsDestroyed, WaveTotal = enemyCountToSpawn,
            PilotX = pilotPosition.x, PilotY = pilotPosition.y, Collected = nodes.ConvertAll(n => n.Collected).ToArray()
        };
        try
        {
            Directory.CreateDirectory(Application.persistentDataPath);
            File.WriteAllText(ExpeditionPath + ".tmp", JsonUtility.ToJson(save, true));
            File.Copy(ExpeditionPath + ".tmp", ExpeditionPath, true);
            File.Delete(ExpeditionPath + ".tmp");
        }
        catch (Exception e) { Debug.LogWarning("Expedition save unavailable: " + e.GetType().Name); }
    }

    private void LoadExpedition()
    {
        if (!CanPersistProgress || !File.Exists(ExpeditionPath)) return;
        try
        {
            var save = JsonUtility.FromJson<ExpeditionSave>(File.ReadAllText(ExpeditionPath));
            if (save == null || save.Version != 1 || save.CoreMaxHp < 100 || save.Night < 1) return;
            night = Mathf.Clamp(save.Night, 1, 100000); alloy = Mathf.Max(0, save.Alloy); crystal = Mathf.Max(0, save.Crystal);
            coreMaxHp = Mathf.Clamp(save.CoreMaxHp, 100, 10000000); coreHp = Mathf.Clamp(save.CoreHp, 1, coreMaxHp);
            score = Mathf.Max(0, save.Score); turretCount = Mathf.Clamp(save.Turrets, 0, 4);
            shieldLevels = Mathf.Clamp(save.Shields, 0, 2); salvageLevels = Mathf.Clamp(save.Rigs, 0, 2);
            astronautLevel = Mathf.Clamp(save.Level, 1, 10000); experience = Mathf.Clamp(save.Experience, 0, ExperienceNeeded - 1);
            lifetimeKills = Mathf.Max(0, save.Kills);
            rifleLevels = Mathf.Clamp(save.Rifle, 0, 10000); droneLevels = Mathf.Clamp(save.Drones, 0, 10000);
            regenerationLevels = Mathf.Clamp(save.Regeneration, 0, 10000);
            turretMastery = Mathf.Clamp(save.TurretMastery, 0, 10000); shieldMastery = Mathf.Clamp(save.ShieldMastery, 0, 10000);
            salvageMastery = Mathf.Clamp(save.SalvageMastery, 0, 10000); lastMilestoneNight = Mathf.Max(0, save.LastMilestone);
            correctAnswers = Mathf.Max(0, save.Calibrations); totalCalibrationAlloy = Mathf.Max(0, save.CalibrationAlloy);
            tutorialStep = Mathf.Clamp(save.Tutorial, 0, 2); showTutorial = !learningProfile.TutorialComplete;
            pilotPosition = new Vector2(Mathf.Clamp(save.PilotX, 120, 1160), Mathf.Clamp(save.PilotY, 160, 660));
            if (save.Collected != null) for (int i = 0; i < Mathf.Min(nodes.Count, save.Collected.Length); i++) nodes[i].Collected = save.Collected[i];
            if (save.Dawn)
            {
                phase = Phase.Dawn; dawnRewardsPending = true; dawnCleanDefense = save.Clean;
                dawnAlloyReward = Mathf.Max(0, save.RewardAlloy); dawnCrystalReward = Mathf.Max(0, save.RewardCrystal);
                waveMeteorsDestroyed = Mathf.Max(0, save.WaveKills); enemyCountToSpawn = Mathf.Max(0, save.WaveTotal);
            }
            notice = "Expedition resumed. Your astronaut, defenses and materials are kept."; noticeTimer = 6;
        }
        catch (Exception e) { Debug.LogWarning("Expedition could not be resumed: " + e.GetType().Name); }
    }

    private void OnApplicationQuit() { SaveLearningProfile(); SaveExpedition(); }
    private void OnApplicationPause(bool paused) { if (paused) SaveExpedition(); }

    private void EarnCombatExperience(Meteor enemy)
    {
        lifetimeKills++;
        ActivityToday().Kills++;
        DropFieldCapacitor(enemy);
        experience += enemy.MaxHp >= 6 ? 3 : enemy.MaxHp >= 3 ? 2 : 1;
        while (experience >= ExperienceNeeded)
        {
            experience -= ExperienceNeeded; astronautLevel++;
            ascensionFlash = 3.5f;
            notice = "LEVEL " + astronautLevel + " · " + AscensionTitle + " · power up + bigger dawn bounty";
            noticeTimer = 3.5f;
            // Kill rewards are banked into the single dawn claim, so a checkpoint retry cannot duplicate them.
            SpawnBurst(pilotPosition, Gold, 25);
        }
    }

    private void UpdateAscension(float dt)
    {
        ascensionFlash = Mathf.Max(0, ascensionFlash - dt);
        if (phase != Phase.Night) return;
        if (regenerationLevels > 0)
        {
            regenerationCharge += dt * regenerationLevels * Mathf.Max(1, coreMaxHp * .004f);
            int repair = Mathf.FloorToInt(regenerationCharge);
            if (repair > 0) { coreHp = Mathf.Min(coreMaxHp, coreHp + repair); regenerationCharge -= repair; }
        }
        droneTimer -= dt;
        if (droneLevels == 0 || droneTimer > 0) return;
        droneTimer = Mathf.Max(.12f, .55f / (1 + droneLevels * .15f));
        int count = Mathf.Min(8, 1 + droneLevels);
        for (int i = 0; i < count; i++)
        {
            Vector2 origin = DronePosition(i, count);
            Meteor target = FindTarget(origin, 330);
            if (target == null || bolts.Count >= 240) continue;
            bolts.Add(new Bolt { Position = origin, Direction = (target.Position - origin).normalized, Speed = 1000,
                Damage = 1 + droneLevels + astronautLevel / 5, Color = Mint, Life = .65f,
                Pierces = Mathf.Min(12, 2 + droneLevels / 2), SplashRadius = droneLevels >= 5 ? 30 : 0 });
        }
    }

    private Vector2 DronePosition(int i, int count)
    {
        float angle = corePulse * 1.8f + i * Mathf.PI * 2 / count;
        return pilotPosition + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * (65 + Mathf.Min(12, droneLevels) * 4);
    }

    private void DrawAscensionEffects()
    {
        int count = droneLevels == 0 ? 0 : Mathf.Min(8, droneLevels + 1);
        for (int i = 0; i < count; i++)
        {
            Vector2 at = DronePosition(i, count);
            DrawBeam(at - (at - pilotPosition).normalized * 11, at, 6, Ink);
            Fill(at.x - 7, at.y - 7, 14, 14, Ink);
            Fill(at.x - 5, at.y - 5, 10, 10, Mint);
            Fill(at.x - 2, at.y - 3, 4, 5, Color.white);
        }
        if (AscensionPower < 18 && ascensionFlash <= 0) return;
        Color aura = AscensionPower >= 60 ? Gold : LearnerAccent;
        for (int i = 0; i < 24; i++)
        {
            float a = i * Mathf.PI * 2 / 24 + corePulse;
            Vector2 at = pilotPosition + new Vector2(Mathf.Cos(a) * 43, Mathf.Sin(a) * 28);
            Fill(at.x, at.y, 3, 3, new Color(aura.r, aura.g, aura.b, .6f));
        }
        if (ascensionFlash > 0) TextCentered("LEVEL " + astronautLevel + " · POWER UP", pilotPosition.x - 150, pilotPosition.y - 85, 300, 30,
            new GUIStyle(labelStyle) { normal = { textColor = Gold } });
    }

    private void DrawAscensionHud()
    {
        if (phase != Phase.Day && phase != Phase.Night) return;
        if (buildPanelOpen || learningPanelOpen || pauseOpen) return;
        Fill(900, 93, 350, 42, new Color(.025f, .045f, .09f, .9f));
        Text("LV " + astronautLevel + " · " + AscensionTitle, 910, 94, 330, 24, new GUIStyle(smallStyle) { normal = { textColor = Gold }, fontStyle = FontStyle.Bold });
        ProgressBar(910, 123, 330, 5, experience / (float)ExperienceNeeded, Mint);
    }

    private void RecordContinuousMilestone()
    {
        if (night % 3 != 0 || night <= lastMilestoneNight) return;
        lastMilestoneNight = night;
        int lesson = learningProfile.ActiveLesson;
        learningProfile.Wins[lesson]++;
        AdvanceLearningInPlace();
        SaveLearningProfile();
    }

    private void AdvanceLearningInPlace()
    {
        learningProfile.UpdateUnlocks();
        int lesson = learningProfile.ActiveLesson;
        if (lesson < StarfallCurriculum.Names.Length - 1 && learningProfile.Evidence[lesson] >= 2 && learningProfile.Wins[lesson] > 0)
        {
            learningProfile.ActiveLesson = Mathf.Max(lesson, learningProfile.UnlockedLesson);
            learningFeedback = "New math topic unlocked. Your astronaut and equipment are kept.";
        }
    }
}
