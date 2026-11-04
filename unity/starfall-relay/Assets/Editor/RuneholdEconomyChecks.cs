#if UNITY_EDITOR
using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEngine;

/// <summary>Checks the actual purchase and claim paths without touching an active player run.</summary>
internal static class RuneholdEconomyChecks
{
    private const BindingFlags Private = BindingFlags.Instance | BindingFlags.NonPublic;

    internal sealed class Probe : IDisposable
    {
        private readonly GameObject root = new GameObject("Reward accounting check") { hideFlags = HideFlags.HideAndDontSave };
        private readonly RuneholdGame game;
        public Probe() { game = root.AddComponent<RuneholdGame>(); Call("CreateNodes"); }
        public object Get(string field) => typeof(RuneholdGame).GetField(field, Private).GetValue(game);
        public int Number(string field) => (int)Get(field);
        public string Phase => Get("phase").ToString();
        public void Set(string field, object value) => typeof(RuneholdGame).GetField(field, Private).SetValue(game, value);
        public void Enum(string field, string value)
        {
            FieldInfo info = typeof(RuneholdGame).GetField(field, Private);
            info.SetValue(game, System.Enum.Parse(info.FieldType, value));
        }
        public object Call(string method, params object[] args) => typeof(RuneholdGame).GetMethod(method, Private).Invoke(game, args);
        public void Quiz(string upgrade)
        {
            Enum("selectedUpgrade", upgrade); Enum("phase", "Quiz"); Set("questionAttempts", 0);
            Set("questionSupported", false); Set("questionExplained", false); Set("questionResolved", false); Set("learningPractice", false);
            FieldInfo field = typeof(RuneholdGame).GetField("question", Private);
            object question = Activator.CreateInstance(field.FieldType);
            field.FieldType.GetField("Text").SetValue(question, "2 + 3 = ?");
            field.FieldType.GetField("Answer").SetValue(question, 5);
            field.FieldType.GetField("Choices").SetValue(question, new[] { 5, 6, 7, 8 });
            field.SetValue(game, question);
        }
        public void Dispose()
        {
            var pixel = Get("pixel") as Texture2D;
            if (pixel != null) { Set("pixel", null); UnityEngine.Object.DestroyImmediate(pixel); }
            UnityEngine.Object.DestroyImmediate(root);
        }
    }

    private static void Require(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }

    [MenuItem("Starfall/Check Upgrade and Reward Accounting")]
    public static void Run()
    {
        UnityEngine.Random.State previousRandom = UnityEngine.Random.state;
        try
        {
            CheckAll();
            if (Application.isBatchMode) EditorApplication.Exit(0);
        }
        catch (Exception exception)
        {
            Debug.LogException(exception);
            if (Application.isBatchMode) EditorApplication.Exit(1);
            else throw;
        }
        finally { UnityEngine.Random.state = previousRandom; }
    }

    internal static void CheckAll()
    {
        CheckPerfectPurchase(); CheckRetriesAndFailure(); CheckShieldAndCap();
        CheckRigAndSingleCollection(); CheckWaveClaims(); CheckLessonQuestions();
        Debug.Log("STARFALL ECONOMY CHECKS PASSED: purchases, guided retries, caps, salvage, single reward claims, clean-defense bonus, 3000 bounded lesson questions.");
    }

    private static void CheckPerfectPurchase()
    {
        using (var p = new Probe())
        {
            p.Set("alloy", 4); p.Set("crystal", 1); p.Quiz("IonTurret"); p.Call("Answer", 0);
            Require(p.Number("alloy") == 2 && p.Number("crystal") == 0, "Perfect turret must pay 3 alloy/1 crystal then return exactly 1 alloy.");
            Require(p.Number("turretCount") == 1 && p.Phase == "UpgradeReveal", "A correct answer must install visible hardware and enter its reveal.");
            p.Call("Answer", 0);
            Require(p.Number("turretCount") == 1 && p.Number("alloy") == 2, "The same answer must not grant a second installation or bonus.");
        }
    }

    private static void CheckRetriesAndFailure()
    {
        using (var p = new Probe())
        {
            p.Set("alloy", 4); p.Set("crystal", 1); p.Quiz("IonTurret"); p.Call("Answer", 1);
            Require(p.Number("alloy") == 4 && p.Number("crystal") == 1 && p.Number("turretCount") == 0, "Wrong answers must not consume materials or install hardware.");
            p.Call("Answer", 0);
            Require(p.Number("alloy") == 1 && p.Number("crystal") == 0 && p.Number("installationRebate") == 0, "A retry success must install at normal cost without a perfect bonus.");
        }
        using (var p = new Probe())
        {
            p.Set("alloy", 4); p.Set("crystal", 1); p.Quiz("IonTurret");
            p.Call("Answer", 1); p.Call("Answer", 1);
            Require(p.Phase == "Quiz" && (bool)p.Get("questionExplained") && p.Number("alloy") == 4 && p.Number("crystal") == 1, "A second mistake must show the worked example without spending materials.");
            p.Call("FinishLearningResolution");
            Require(p.Phase == "UpgradeReveal" && p.Number("turretCount") == 1 && p.Number("alloy") == 1 && p.Number("installationRebate") == 0, "Acknowledged support must install once at normal cost without an independent bonus.");
            p.Set("alloy", 2); p.Set("crystal", 1); p.Quiz("IonTurret"); p.Call("Answer", 0);
            Require(p.Number("turretCount") == 1 && p.Number("alloy") == 2, "Insufficient resources must never grant an upgrade or bonus.");
        }
    }

    private static void CheckShieldAndCap()
    {
        using (var p = new Probe())
        {
            p.Set("turretCount", 1); p.Set("alloy", 20); p.Set("crystal", 20); p.Set("coreHp", 60);
            p.Quiz("CoreShield"); p.Call("Answer", 0);
            Require(p.Number("coreHp") == 85 && p.Number("coreMaxHp") == 125 && p.Number("alloy") == 17 && p.Number("crystal") == 18, "Shield must restore and add exactly 25 integrity at the advertised cost.");
            p.Quiz("CoreShield"); p.Call("Answer", 0);
            int alloy = p.Number("alloy"); p.Quiz("CoreShield"); p.Call("Answer", 0);
            Require(p.Number("shieldLevels") == 2 && p.Number("coreMaxHp") == 150 && p.Number("alloy") == alloy, "A shield at its slot limit must not spend or reward again.");
        }
    }

    private static void CheckRigAndSingleCollection()
    {
        using (var p = new Probe())
        {
            p.Set("turretCount", 1); p.Set("alloy", 3); p.Set("crystal", 2); p.Quiz("SalvageRig"); p.Call("Answer", 0);
            p.Set("pilotPosition", new Vector2(385, 224)); p.Call("CollectNearbyNodes");
            Require(p.Number("salvageLevels") == 1 && p.Number("alloy") == 5, "Rig must increase an uncollected alloy cache from 3 to 4 immediately.");
            p.Call("CollectNearbyNodes");
            Require(p.Number("alloy") == 5, "A cache must be credited only once.");
            p.Set("pilotPosition", new Vector2(932, 224)); p.Call("CollectNearbyNodes");
            Require(p.Number("crystal") == 3, "Rig must increase an uncollected crystal cache from 2 to 3.");
        }
    }

    private static void CheckWaveClaims()
    {
        foreach (bool clean in new[] { true, false })
        {
            using (var p = new Probe())
            {
                p.Enum("phase", "Night"); p.Set("night", 1); p.Set("alloy", 2); p.Set("crystal", 1);
                p.Set("coreHp", clean ? 100 : 88); p.Set("waveStartHp", 100); p.Call("BeginDawn");
                Require(p.Number("alloy") == 2 && p.Number("crystal") == 1 && p.Phase == "Dawn", "Wave supplies must wait on the claim screen.");
                Require(p.Number("dawnAlloyReward") == 3 && p.Number("dawnCrystalReward") == (clean ? 2 : 1), "Wave reward must include exactly one crystal bonus only for a clean defense.");
                p.Call("ClaimWaveRewards");
                Require(p.Number("alloy") == 5 && p.Number("crystal") == (clean ? 3 : 2) && p.Number("night") == 2, "Claim must apply the displayed amounts and advance one day.");
                p.Call("ClaimWaveRewards");
                Require(p.Number("alloy") == 5 && p.Number("night") == 2, "A second claim must not award again or advance another day.");
            }
        }
    }

    private static void CheckLessonQuestions()
    {
        using (var p = new Probe())
        {
            var profile = (StarfallLearningProfile)p.Get("learningProfile");
            for (int lesson = 0; lesson < 3; lesson++)
            for (int i = 0; i < 1000; i++)
            {
                profile.ActiveLesson = lesson;
                object question = p.Call("GenerateQuestion"); Type type = question.GetType();
                int answer = (int)type.GetField("Answer").GetValue(question);
                int[] choices = (int[])type.GetField("Choices").GetValue(question);
                int a = (int)type.GetField("First").GetValue(question), b = (int)type.GetField("Second").GetValue(question);
                char operation = (char)type.GetField("Operation").GetValue(question);
                Require(answer == (operation == '+' ? a + b : a - b) && answer >= 0 && answer <= (lesson == 2 ? 20 : 10), "Lesson answers must match their operation and stay inside the taught range.");
                Require(!string.IsNullOrEmpty((string)type.GetField("Hint").GetValue(question)) && !string.IsNullOrEmpty((string)type.GetField("Explanation").GetValue(question)), "Every fact needs a teaching hint and worked explanation.");
                Require(choices.Distinct().Count() == 4 && choices.Count(choice => choice == answer) == 1, "Each question must have four unique choices and one correct answer.");
            }
        }
    }
}
#endif
