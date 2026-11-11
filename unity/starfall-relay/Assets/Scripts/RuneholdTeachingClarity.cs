using UnityEngine;

public sealed partial class RuneholdGame
{
    private void TeachingBackdrop(string title, string subtitle)
    {
        Fill(0, 0, 1280, 800, Hex("edf4ff"));
        UiRound(new Rect(0, 0, 1280, 98), UiPaper, 0);
        if (MenuButton("Back", new Rect(24, 20, 126, 58), Cyan)) LeaveTeaching();
        UiText(title, new Rect(176, 13, 834, 40), 30, true);
        UiText(subtitle, new Rect(178, 57, 1035, 28), 20, false, UiMuted);
    }

    private void LeaveTeaching()
    {
        if (studySession) EndStudySession(false);
        else { phase = Phase.Day; questionResolved = false; buildPanelOpen = true; }
    }

    private void DrawFriendlyQuestion()
    {
        TeachingBackdrop(learningPractice ? "Let's practise " + SkillTitle(question.Operation) : "Power up your " + FriendlyUpgrade(selectedUpgrade).ToLowerInvariant(),
            learningPractice ? "Question " + (studyIndex + 1) + " of 5 · Take your time. The spaceship can wait." : "Solve this energy puzzle to build. Your materials are safe until you finish.");
        string prompt = questionExplained ? question.Text.Replace("?", question.Answer.ToString()) : question.Text;
        UiText(prompt, new Rect(32, 112, 660, 96), 64, true, UiBlue, TextAnchor.MiddleCenter);
        UiCard(new Rect(32, 224, 660, 388), Cyan);
        DrawFriendlyModel(new Rect(56, 242, 612, 290), !questionExplained);
        if (questionExplained)
            UiText(question.Explanation, new Rect(56, 541, 612, 56), 21, true);
        else if (visualSteps < VisualStepTarget)
        {
            int step = question.Operation == '+' || question.Operation == '-' ? Mathf.Min(question.First + question.Second > 20 ? 10 : 1, VisualStepTarget - visualSteps) : 1;
            string action = question.Operation == '+' ? "Add " + step + " cell" + (step == 1 ? "" : "s") : question.Operation == '-' ? "Take away " + step : question.Operation == '*' ? "Fill one group" : "Give one to each group";
            if (MenuButton(action, new Rect(56, 545, 612, 52), Cyan)) { ShowTeachingHint(); visualSteps += step; }
        }
        else UiText("Count what you made. What do you notice?", new Rect(56, 541, 612, 56), 22, true, UiBlue);
        UiCard(new Rect(720, 112, 528, 540), Gold);
        if (questionExplained)
        {
            DrawClearIcon(1, new Vector2(913, 150), 10, UiBlue);
            UiText("Let's work it out together", new Rect(744, 261, 480, 58), 29, true, UiInk, TextAnchor.MiddleCenter);
            UiText("The answer is " + question.Answer, new Rect(744, 335, 480, 70), 40, true, UiBlue, TextAnchor.MiddleCenter);
            UiText("You can keep learning with help.", new Rect(760, 431, 448, 66), 24, false, UiMuted, TextAnchor.MiddleCenter);
            if (MenuButton(learningPractice ? "Keep going" : "Build it!", new Rect(752, 540, 464, 76), Cyan, true, true)) FinishLearningResolution();
        }
        else if (learningProfile.TypedAnswers) DrawNumberPad();
        else
        {
            UiText("Choose your answer", new Rect(744, 143, 480, 46), 30, true);
            for (int i = 0; i < 4; i++)
                if (MenuButton(question.Choices[i].ToString(), new Rect(744 + i % 2 * 248, 223 + i / 2 * 154, 232, 132), Cyan, true, selectedAnswer == i)) { selectedAnswer = i; Answer(i); }
            UiText("Tap one number to check it.", new Rect(744, 571, 480, 40), 22, false, UiMuted);
        }
        string guidance = questionAttempts > 0 ? answerFeedback : questionHintVisible && !questionExplained ? question.Hint : answerFeedback;
        UiText(guidance, new Rect(40, 620, 644, 60), 20, false, UiBlue);
        if (!questionExplained)
        {
            if (MenuButton("Show a hint", new Rect(32, 696, 314, 72), Cyan)) ShowTeachingHint();
            if (MenuButton("Let's do it together", new Rect(364, 696, 328, 72), Gold)) ExplainQuestion();
        }
        UiText("No timer. Help is always welcome.", new Rect(744, 686, 480, 70), 23, false, UiMuted, TextAnchor.MiddleCenter);
    }

    private static string SkillTitle(char operation) => operation == '+' ? "adding" : operation == '-' ? "taking away" : operation == '*' ? "equal groups" : "sharing";

    private void DrawFriendlyModel(Rect area, bool interactive)
    {
        bool subtract = question.Operation == '-';
        if (question.Operation == '*' || question.Operation == '/') { DrawFriendlyGroups(area); return; }
        bool large = question.First + question.Second > 20;
        if (large)
        {
            UiText("Break big numbers into smaller steps", new Rect(area.x, area.y, area.width, 38), 24, true);
            int current = subtract ? question.First - visualSteps : question.First + visualSteps;
            int maximum = Mathf.Max(1, subtract ? question.First : question.First + question.Second);
            string[] names = { "Start: " + question.First, (subtract ? "Take away: " : "Add: ") + question.Second, "Now: " + current };
            int[] values = { question.First, question.Second, current };
            for (int i = 0; i < 3; i++)
            {
                float y = area.y + 60 + i * 74;
                UiText(names[i], new Rect(area.x, y, area.width, 30), 23, true);
                UiRound(new Rect(area.x, y + 38, area.width, 16), Hex("e1eaf5"), 7);
                UiRound(new Rect(area.x, y + 38, Mathf.Max(8, area.width * values[i] / maximum), 16), i == 1 ? Gold : Cyan, 7);
            }
            return;
        }
        UiText(subtract ? "Start with " + question.First + ". Take away " + question.Second + "." : "Start with " + question.First + ". Add " + question.Second + ".", new Rect(area.x, area.y, area.width, 38), 24, true);
        int occupied = subtract ? question.First : question.First + visualSteps;
        int slots = question.First + question.Second > 10 ? 20 : 10;
        for (int i = 0; i < slots; i++)
        {
            Vector2 at = new Vector2(area.x + 24 + i % 10 * 53 + (i % 10 >= 5 ? 10 : 0), area.y + 77 + i / 10 * 48);
            bool removed = subtract && i < occupied && i >= question.First - visualSteps;
            UiDot(at, 19, Hex("dae5f1"));
            if (i < occupied && !removed)
            { UiDot(at, 16, i < question.First ? UiBlue : Hex("d58a25")); UiDot(at + new Vector2(-4, -5), 4, new Color(1, 1, 1, .6f)); }
            if (removed)
            { UiStroke(at + new Vector2(-10, -10), at + new Vector2(10, 10), 3, UiMuted); UiStroke(at + new Vector2(10, -10), at + new Vector2(-10, 10), 3, UiMuted); }
        }
        int waiting = subtract ? visualSteps : question.Second - visualSteps;
        UiText(subtract ? "Taken away: " + waiting : "Waiting to join: " + waiting, new Rect(area.x, area.y + 151, area.width, 35), 22, true, UiMuted);
        for (int i = 0; i < waiting; i++)
        {
            Vector2 at = new Vector2(area.x + 24 + i % 10 * 53 + (i % 10 >= 5 ? 10 : 0), area.y + 212 + i / 10 * 45);
            UiDot(at, 16, Hex("d58a25")); UiDot(at + new Vector2(-4, -5), 4, Hex("ffe3a1"));
        }
    }

    private void DrawFriendlyGroups(Rect area)
    {
        bool share = question.Operation == '/'; int groups = Mathf.Max(1, share ? question.Second : question.First);
        int each = share ? question.Answer : question.Second;
        UiText(share ? "Share " + question.First + " cells between " + groups + " groups." : groups + " equal groups. Put " + each + " in each.", new Rect(area.x, area.y, area.width, 45), 24, true);
        int shown = Mathf.Min(12, groups);
        for (int i = 0; i < shown; i++)
        {
            float width = (area.width - 24) / 3, x = area.x + i % 3 * (width + 12), y = area.y + 59 + i / 3 * 53;
            UiRound(new Rect(x, y, width, 45), Hex("e5edf9"), 8);
            int filled = share ? visualSteps : i < visualSteps ? each : 0;
            for (int dot = 0; dot < Mathf.Min(10, filled); dot++) UiDot(new Vector2(x + 13 + dot % 5 * 19, y + 14 + dot / 5 * 17), 6, UiBlue);
            UiText(filled.ToString(), new Rect(x + width - 52, y + 1, 43, 43), 23, true, UiInk, TextAnchor.MiddleCenter);
        }
        if (groups > shown) UiText(shown + " of " + groups + " groups shown. Each group follows the same rule.", new Rect(area.x, area.y + 271, area.width, 32), 18, false, UiMuted);
    }

    private void DrawFriendlyNumberPad()
    {
        UiText("Your answer", new Rect(744, 130, 480, 34), 27, true);
        UiRound(new Rect(744, 178, 480, 60), Hex("edf4ff"), 10);
        UiText(typedAnswer.Length == 0 ? "?" : typedAnswer, new Rect(760, 180, 448, 56), 38, true, UiBlue, TextAnchor.MiddleCenter);
        string[] keys = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "0", "Check" };
        for (int i = 0; i < keys.Length; i++)
        {
            bool check = i == 11;
            if (!MenuButton(keys[i], new Rect(744 + i % 3 * 164, 254 + i / 3 * 84, 152, 72), check ? Mint : Cyan, !check || typedAnswer.Length > 0, check)) continue;
            if (i == 9) { if (typedAnswer.Length > 0) typedAnswer = typedAnswer.Substring(0, typedAnswer.Length - 1); }
            else if (check) { if (int.TryParse(typedAnswer, out int value)) SubmitLearningValue(value); }
            else if (typedAnswer.Length < 3) typedAnswer += keys[i];
        }
        UiText("Tap numbers, then Check.", new Rect(744, 595, 480, 32), 21, false, UiMuted);
    }
}
