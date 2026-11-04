#if UNITY_EDITOR
using System;
using System.Collections;
using System.Diagnostics;
using System.Reflection;
using UnityEditor;
using UnityEngine;

internal static class RuneholdSwarmLearningChecks
{
    private static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
    private static object Entity(string name, params object[] fields)
    {
        Type type = typeof(RuneholdGame).GetNestedType(name, BindingFlags.NonPublic);
        object entity = Activator.CreateInstance(type);
        for (int i = 0; i < fields.Length; i += 2) type.GetField((string)fields[i]).SetValue(entity, fields[i + 1]);
        return entity;
    }
    private static object Field(object entity, string name) => entity.GetType().GetField(name).GetValue(entity);
    private static object Enemy(int id, Vector2 position) => Entity("Meteor", "Id", id, "Position", position, "Hp", 1, "MaxHp", 1, "Radius", 8f, "CoreDamage", 1, "Tint", Color.white);

    [MenuItem("Starfall/Check Swarms and Learning")]
    public static void Run()
    {
        UnityEngine.Random.State previous = UnityEngine.Random.state;
        try
        {
            RuneholdEconomyChecks.CheckAll();
            CheckProjectiles(); CheckMuzzles(); CheckCheckpoint(); CheckLearning(); CheckSwarmBalance();
            UnityEngine.Debug.Log("STARFALL SWARM + LEARNING CHECKS PASSED");
            if (Application.isBatchMode) EditorApplication.Exit(0);
        }
        catch (Exception exception) { UnityEngine.Debug.LogException(exception); if (Application.isBatchMode) EditorApplication.Exit(1); else throw; }
        finally { UnityEngine.Random.state = previous; }
    }

    private static void CheckProjectiles()
    {
        using (var p = new RuneholdEconomyChecks.Probe())
        {
            IList enemies = (IList)p.Get("meteors"), bolts = (IList)p.Get("bolts");
            for (int i = 0; i < 4; i++) enemies.Add(Enemy(i + 1, new Vector2(20 + i * 20, 0)));
            p.Set("activeEnemyCount", 4);
            bolts.Add(Entity("Bolt", "Position", Vector2.zero, "Direction", Vector2.right, "Speed", 1000f, "Damage", 1f, "Life", 1f, "Pierces", 3));
            p.Call("UpdateBolts", .1f);
            Require(p.Number("waveMeteorsDestroyed") == 3 && bolts.Count == 0, "A fast rifle shot must sweep the path and pierce exactly three enemies without tunneling.");
        }
        using (var p = new RuneholdEconomyChecks.Probe())
        {
            IList enemies = (IList)p.Get("meteors"), bolts = (IList)p.Get("bolts");
            enemies.Add(Enemy(1, new Vector2(50, 0))); enemies.Add(Enemy(2, new Vector2(60, 20))); enemies.Add(Enemy(3, new Vector2(65, -20)));
            p.Set("activeEnemyCount", 3);
            bolts.Add(Entity("Bolt", "Position", Vector2.zero, "Direction", Vector2.right, "Speed", 1000f, "Damage", 2f, "Life", 1f, "SplashRadius", 62f));
            p.Call("UpdateBolts", .1f);
            Require(p.Number("waveMeteorsDestroyed") == 3, "A cannon impact must damage the nearby group.");
        }
    }

    private static void CheckMuzzles()
    {
        using (var p = new RuneholdEconomyChecks.Probe())
        {
            p.Set("turretCount", 1);
            ((IList)p.Get("meteors")).Add(Enemy(1, new Vector2(1000, 294)));
            p.Call("FireTurretWeapons", .1f);
            IList bolts = (IList)p.Get("bolts"); Require(bolts.Count == 1, "The aimed turret should fire.");
            Vector2 muzzle = (Vector2)p.Call("TurretMuzzle", 0), start = (Vector2)Field(bolts[0], "Position");
            Require(Vector2.Distance(muzzle, start) < .001f, "The shot origin must match the drawn recoiling barrel muzzle.");
            Vector2 direction = (Vector2)Field(bolts[0], "Direction");
            p.Call("UpdateBolts", .02f);
            Require(Vector2.Distance((Vector2)Field(bolts[0], "Position"), start + direction * 760 * .02f) < .01f, "Projectiles must travel straight along the barrel direction.");
        }
    }

    private static void CheckCheckpoint()
    {
        using (var p = new RuneholdEconomyChecks.Probe())
        {
            p.Set("turretCount", 2); p.Set("correctAnswers", 4); p.Set("coreHp", 75); p.Set("score", 40); p.Set("alloy", 3);
            p.Call("CaptureSwarmCheckpoint"); p.Set("coreHp", 0); p.Set("score", 999); p.Enum("phase", "Defeat"); p.Call("RetrySwarmCheckpoint");
            Require(p.Number("coreHp") == 75 && p.Number("score") == 40 && p.Number("turretCount") == 2 && p.Number("correctAnswers") == 4 && p.Number("alloy") == 3 && p.Phase == "Day", "A wave retry must restore the checkpoint without replaying math or duplicating rewards.");
        }
    }

    private static void CheckLearning()
    {
        var profile = new StarfallLearningProfile();
        StarfallQuestion a = StarfallCurriculum.Create(0, 0, 1), b = StarfallCurriculum.Create(0, 1, 2);
        profile.Record(a, true, true); profile.Wins[0] = 1; profile.UpdateUnlocks();
        Require(profile.Evidence[0] == 0 && profile.UnlockedLesson == 0, "Helped learning plus victory cannot count as independent evidence.");
        profile.Record(a, false, true); profile.Record(a, false, true);
        Require(profile.Evidence[0] == 1, "Repeating the same fact cannot satisfy two different learning checks.");
        profile.Record(b, false, true);
        Require(profile.UnlockedLesson == 1 && profile.Wins[0] == 1, "Fresh independent evidence after a saved victory should unlock the next lesson without another battle.");
        profile.ActiveLesson = 1; profile.Wins[1] = 1;
        profile.Record(StarfallCurriculum.Create(1, 0, 3), false, false);
        Require(profile.Evidence[1] == 0, "Optional calm practice is tracked but cannot silently satisfy the mission check.");
        StarfallLearningProfile loaded = JsonUtility.FromJson<StarfallLearningProfile>(JsonUtility.ToJson(profile)); loaded.Validate();
        Require(loaded.UnlockedLesson == 1 && loaded.Evidence[0] == 2 && loaded.Supported[0] == 1, "Versioned learning records must survive a serialization round trip.");
        var review = new StarfallLearningProfile(); review.Fact(a.Key).Mistakes = 3; review.Fact(a.Key).Supported = 5;
        int reviewed = 0;
        for (int i = 0; i < 1000; i++)
        {
            if (StarfallCurriculum.Next(review, i, "").Key == a.Key) reviewed++;
            Require(StarfallCurriculum.Next(review, i, a.Key).Key != a.Key, "Adaptation must use a fresh fact immediately after the previous one.");
        }
        Require(reviewed > 200, "Facts needing help should receive extra review within the lesson.");
    }

    private static void CheckSwarmBalance()
    {
        for (int wave = 1; wave <= 3; wave++)
        for (int seed = 0; seed < 3; seed++)
        {
            UnityEngine.Random.InitState(seed + wave * 100);
            using (var p = new RuneholdEconomyChecks.Probe())
            {
                p.Call("ResetCombatState"); p.Set("previewRun", true); p.Set("night", wave);
                p.Set("turretCount", wave == 1 ? 1 : wave == 2 ? 2 : 4);
                int health = 100 + (wave - 1) * 25; p.Set("coreHp", health); p.Set("coreMaxHp", health);
                p.Set("pilotPosition", new Vector2(640, 500));
                p.Call("BeginWarning"); p.Call("BeginWave");
                var timer = Stopwatch.StartNew(); int steps = 0;
                while (p.Phase == "Night" && steps < 2700) { p.Call("UpdateNight", 1f / 30); steps++; }
                timer.Stop();
                int total = p.Number("enemyCountToSpawn"), killed = p.Number("waveMeteorsDestroyed"), peak = p.Number("peakSwarmAlive");
                UnityEngine.Debug.Log("SWARM CHECK wave=" + wave + " seed=" + seed + " killed=" + killed + "/" + total + " core=" + p.Number("coreHp") + " peak=" + peak + " seconds=" + (steps / 30f).ToString("F1") + " cpuMs/step=" + (timer.Elapsed.TotalMilliseconds / Math.Max(1, steps)).ToString("F2"));
                Require(p.Phase == "Dawn" || p.Phase == "Victory", "Recommended defense failed to clear a finite swarm in 90 seconds.");
                Require(total >= 300 && peak >= 100 && peak <= 320, "Waves need a visible swarm while respecting the active entity budget.");
                Require(killed >= total * .9f && p.Number("coreHp") > 0, "Recommended defenses must kill at least 90% of the swarm and keep the core alive.");
            }
        }
    }
}
#endif
