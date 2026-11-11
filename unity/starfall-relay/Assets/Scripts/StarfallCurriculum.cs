using System;
using System.Collections.Generic;

[Serializable]
public sealed class StarfallFactRecord
{
    public string Key;
    public int Independent, Supported, Mistakes;
    public bool CheckEvidence;
    public string LastAnsweredDay = "", LastIndependentDay = "", ReviewOn = "";
    public int IndependentDays;
}

[Serializable]
public sealed class StarfallLearningProfile
{
    public int Version = 1;
    public int ActiveLesson, UnlockedLesson;
    public bool TutorialComplete;
    public int GuideVersion, GuideStep;
    public int[] Independent = new int[3], Supported = new int[3], Evidence = new int[3], Wins = new int[3];
    public List<StarfallFactRecord> Facts = new List<StarfallFactRecord>();
    public string CadetName = "Aria", PracticeDate = "", LastPracticeStarDate = "";
    public int LearningXp, Stars, DailySolved, PracticeDifficulty, Accent;
    public bool ReducedMotion, TypedAnswers = true;
    public bool[] LessonSeen = new bool[6];

    public void Validate()
    {
        Array.Resize(ref Independent, StarfallCurriculum.Names.Length);
        Array.Resize(ref Supported, StarfallCurriculum.Names.Length);
        Array.Resize(ref Evidence, StarfallCurriculum.Names.Length);
        Array.Resize(ref Wins, StarfallCurriculum.Names.Length);
        Array.Resize(ref LessonSeen, StarfallCurriculum.Names.Length);
        PracticeDifficulty = Math.Max(0, Math.Min(2, PracticeDifficulty));
        Accent = Math.Max(0, Math.Min(3, Accent));
        Stars = Math.Max(0, Stars); LearningXp = Math.Max(0, LearningXp); DailySolved = Math.Max(0, DailySolved);
        if (string.IsNullOrWhiteSpace(CadetName)) CadetName = "Aria";
        if (CadetName.Length > 20) CadetName = CadetName.Substring(0, 20);
        if (Facts == null) Facts = new List<StarfallFactRecord>();
        Facts.RemoveAll(f => f == null || string.IsNullOrEmpty(f.Key));
        UnlockedLesson = Math.Max(0, Math.Min(StarfallCurriculum.Names.Length - 1, UnlockedLesson));
        ActiveLesson = Math.Max(0, Math.Min(UnlockedLesson, ActiveLesson));
        for (int i = 0; i < Independent.Length; i++)
        {
            Independent[i] = Math.Max(0, Independent[i]); Supported[i] = Math.Max(0, Supported[i]);
            Evidence[i] = Math.Max(0, Evidence[i]); Wins[i] = Math.Max(0, Wins[i]);
        }
    }

    public StarfallFactRecord Fact(string key)
    {
        StarfallFactRecord record = Facts.Find(f => f.Key == key);
        if (record != null) return record;
        record = new StarfallFactRecord { Key = key }; Facts.Add(record); return record;
    }

    public void Record(StarfallQuestion question, bool supported, bool countsForCheck)
    {
        Validate();
        StarfallFactRecord fact = Fact(question.Key);
        if (supported) { Supported[question.Lesson]++; fact.Supported++; }
        else
        {
            Independent[question.Lesson]++; fact.Independent++;
            if (countsForCheck && !fact.CheckEvidence) { fact.CheckEvidence = true; Evidence[question.Lesson]++; }
        }
        string today = DateTime.Now.ToString("yyyy-MM-dd");
        fact.LastAnsweredDay = today;
        if (!supported && fact.LastIndependentDay != today)
        { fact.LastIndependentDay = today; fact.IndependentDays++; }
        fact.ReviewOn = DateTime.Now.Date.AddDays(supported ? 1 : fact.IndependentDays >= 3 ? 7 : 3).ToString("yyyy-MM-dd");
        UpdateUnlocks();
    }

    public void UpdateUnlocks()
    {
        for (int i = 0; i < StarfallCurriculum.Names.Length - 1; i++)
            if (i <= UnlockedLesson && Wins[i] > 0 && Evidence[i] >= 2) UnlockedLesson = Math.Max(UnlockedLesson, i + 1);
    }
}

public sealed class StarfallQuestion
{
    public int Lesson, First, Second, Answer;
    public char Operation;
    public string Key, Prompt, Hint, Explanation;
    public int[] Choices;
}

public static class StarfallCurriculum
{
    public static bool ReviewDue(StarfallFactRecord fact)
        => !string.IsNullOrEmpty(fact.ReviewOn) && string.CompareOrdinal(fact.ReviewOn, DateTime.Now.ToString("yyyy-MM-dd")) <= 0;
    public static int ReviewWeight(StarfallFactRecord fact)
        => Math.Max(1, 5 + Math.Min(8, Math.Max(0, fact.Mistakes + fact.Supported - fact.Independent)) * 3 - Math.Min(4, fact.Independent) + (ReviewDue(fact) ? 8 : 0));
    public static readonly string[] Names = { "Addition", "Subtraction", "Make ten", "Multiplication", "Division", "Mixed maths" };
    public static readonly string[] Topics = { "Join quantities · addition within 10", "Take quantities away · subtraction within 10", "Make ten · addition within 20",
        "Multiplication · repeated equal groups", "Division · exact equal shares", "Choose the operation · mixed facts" };
    public static readonly string[] MissionNames = { "Addition", "Subtraction", "Make ten", "Multiplication", "Division", "Mixed maths" };
    public static readonly string[] Teachings = {
        "Addition joins two amounts. Keep the first group, then count on by the second amount.",
        "Subtraction takes an amount away. Start with the total and count what remains.",
        "Make ten first. Split the amount you add into the part that fills ten, and the part left over.",
        "Multiplication counts equal groups. Three groups of four means four + four + four.",
        "Division shares a total equally. Twelve shared into three groups gives four in each group.",
        "Read the sign before solving. Join, take away, build equal groups, or share equally." };
    private static readonly int[,] Sums = { { 3, 2 }, { 4, 3 }, { 5, 1 }, { 6, 2 }, { 2, 7 }, { 4, 4 }, { 7, 3 }, { 1, 8 }, { 5, 4 }, { 3, 3 } };
    private static readonly int[,] Differences = { { 8, 3 }, { 9, 4 }, { 7, 2 }, { 10, 6 }, { 6, 4 }, { 9, 7 }, { 10, 3 }, { 5, 2 }, { 8, 5 }, { 7, 4 } };
    private static readonly int[,] Bridges = { { 8, 5 }, { 7, 6 }, { 9, 4 }, { 6, 7 }, { 8, 7 }, { 9, 6 }, { 7, 5 }, { 6, 8 }, { 9, 8 }, { 8, 9 } };

    public static StarfallQuestion Create(int lesson, int factIndex, int salt)
    {
        if (lesson >= 3) return CreateSkill(lesson, 1, salt ^ factIndex * 7919);
        lesson = Math.Max(0, Math.Min(2, lesson)); factIndex = Math.Abs(factIndex % 10);
        int[,] facts = lesson == 0 ? Sums : lesson == 1 ? Differences : Bridges;
        int a = facts[factIndex, 0], b = facts[factIndex, 1]; bool subtract = lesson == 1;
        int answer = subtract ? a - b : a + b;
        string hint, explanation;
        if (subtract)
        {
            hint = "Start with " + a + " shield cells. Move " + b + " into the used tray. Count what remains.";
            explanation = a + " minus " + b + " means taking " + b + " away. " + a + " − " + b + " = " + answer + ".";
        }
        else if (lesson == 2)
        {
            int gap = 10 - a, rest = b - gap;
            hint = a + " needs " + gap + " to make ten. Split " + b + " into " + gap + " and " + rest + ".";
            explanation = a + " + " + b + " = (" + a + " + " + gap + ") + " + rest + " = 10 + " + rest + " = " + answer + ".";
        }
        else
        {
            hint = "Keep " + a + " power cells. Count on " + b + " more, one cell at a time.";
            explanation = "Join " + a + " cells and " + b + (b == 1 ? " cell" : " cells") + ". Altogether there are " + answer + ": " + a + " + " + b + " = " + answer + ".";
        }
        int[] choices = new int[4]; int correctSlot = Math.Abs(salt % 4), maximum = lesson == 2 ? 20 : 10;
        var used = new HashSet<int> { answer };
        for (int i = 0; i < 4; i++)
        {
            if (i == correctSlot) { choices[i] = answer; continue; }
            int candidate = (answer + Math.Abs(salt % 7) + i + 1) % (maximum + 1);
            while (used.Contains(candidate)) candidate = (candidate + 1) % (maximum + 1);
            used.Add(candidate); choices[i] = candidate;
        }
        return new StarfallQuestion { Lesson = lesson, First = a, Second = b, Operation = subtract ? '-' : '+', Answer = answer,
            Key = lesson + ":" + a + (subtract ? "-" : "+") + b, Prompt = a + (subtract ? " − " : " + ") + b + " = ?", Hint = hint, Explanation = explanation, Choices = choices };
    }

    public static StarfallQuestion Next(StarfallLearningProfile profile, int salt, string previousKey)
    {
        profile.Validate();
        if (profile.ActiveLesson >= 3)
        {
            return NextPractice(profile, profile.ActiveLesson, 1, salt, previousKey);
        }
        int lesson = profile.ActiveLesson, total = 0;
        int[] weights = new int[10];
        for (int i = 0; i < 10; i++)
        {
            StarfallQuestion candidate = Create(lesson, i, salt);
            StarfallFactRecord record = profile.Facts.Find(f => f.Key == candidate.Key);
            int weight = record == null ? 6 : ReviewWeight(record);
            if (candidate.Key == previousKey) weight = 0;
            weights[i] = weight; total += weight;
        }
        int pick = Math.Abs(salt % Math.Max(1, total));
        for (int i = 0; i < 10; i++) { if (pick < weights[i]) return Create(lesson, i, salt); pick -= weights[i]; }
        return Create(lesson, 0, salt);
    }

    public static StarfallQuestion NextPractice(StarfallLearningProfile profile, int lesson, int level, int salt, string previousKey)
    {
        var random = new Random(salt & int.MaxValue);
        var candidates = new List<StarfallQuestion>(); var weights = new List<int>();
        var seen = new HashSet<string>(); int total = 0;
        for (int i = 0; i < 32; i++)
        {
            StarfallQuestion candidate = CreateSkill(lesson, level, random.Next());
            if (candidate.Key == previousKey || !seen.Add(candidate.Key)) continue;
            StarfallFactRecord fact = profile.Facts.Find(f => f.Key == candidate.Key);
            int weight = fact == null ? 6 : ReviewWeight(fact);
            candidates.Add(candidate); weights.Add(weight); total += weight;
        }
        if (candidates.Count == 0) return CreateSkill(lesson, level, salt);
        int pick = random.Next(Math.Max(1, total));
        for (int i = 0; i < candidates.Count; i++) { if (pick < weights[i]) return candidates[i]; pick -= weights[i]; }
        return candidates[0];
    }

    public static StarfallQuestion CreateSkill(int lesson, int level, int seed)
    {
        lesson = Math.Max(0, Math.Min(Names.Length - 1, lesson)); level = Math.Max(0, Math.Min(2, level));
        var random = new Random(seed & int.MaxValue);
        int family = lesson == 5 ? random.Next(4) : lesson == 1 ? 1 : lesson == 3 ? 2 : lesson == 4 ? 3 : 0;
        int a, b, answer; char operation; string hint, explanation;
        if (family == 0)
        {
            a = random.Next(level == 2 ? 1 : 0, level == 0 ? 6 : 10);
            b = random.Next(level == 2 ? 1 : 0, level == 0 ? Math.Min(5, 9 - a) + 1 : 10);
            if (lesson == 2) { a = random.Next(6, 10); b = random.Next(11 - a, 10); }
            answer = a + b; operation = '+';
            hint = "Start at " + a + ". Count forward " + b + " steps.";
            explanation = a + " + " + b + " = " + answer + ". Joining both groups gives " + answer + ".";
        }
        else if (family == 1)
        {
            a = random.Next(level == 2 ? 6 : 1, level == 0 ? 7 : 10);
            b = random.Next(level == 2 ? 2 : 0, a + 1);
            answer = a - b; operation = '-';
            hint = "Start with " + a + ". Take away " + b + " and count what is left.";
            explanation = a + " − " + b + " = " + answer + ". After taking away " + b + ", " + answer + " remain.";
        }
        else if (family == 2)
        {
            a = random.Next(level == 2 ? 2 : 1, level == 0 ? 6 : 10);
            b = random.Next(level == 2 ? 2 : 1, level == 0 ? 4 : 10);
            answer = a * b; operation = '*';
            hint = "Build " + a + " equal groups with " + b + " cells in every group.";
            explanation = a + " × " + b + " = " + answer + ". " + a + " groups of " + b + " contain " + answer + " cells.";
        }
        else
        {
            b = random.Next(level == 2 ? 2 : 1, level == 0 ? 6 : 10);
            answer = random.Next(level == 2 ? 2 : 1, level == 0 ? 9 / b + 1 : 10);
            a = b * answer; operation = '/';
            hint = "Share " + a + " cells equally into " + b + " groups. Put one in each group in turn.";
            explanation = a + " ÷ " + b + " = " + answer + ". Check: " + b + " groups of " + answer + " make " + a + ".";
        }
        int[] choices = new int[4]; int slot = random.Next(4), maximum = Math.Max(10, answer + 5);
        var used = new HashSet<int> { answer };
        for (int i = 0; i < 4; i++)
        {
            if (i == slot) { choices[i] = answer; continue; }
            int candidate = Math.Max(0, answer + random.Next(-5, 6));
            while (!used.Add(candidate)) candidate = (candidate + 1) % (maximum + 1);
            choices[i] = candidate;
        }
        string sign = operation == '*' ? "×" : operation == '/' ? "÷" : operation == '-' ? "−" : "+";
        return new StarfallQuestion { Lesson = lesson, First = a, Second = b, Answer = answer, Operation = operation,
            Key = lesson + ":" + a + operation + b, Prompt = a + " " + sign + " " + b + " = ?", Hint = hint, Explanation = explanation, Choices = choices };
    }
}
