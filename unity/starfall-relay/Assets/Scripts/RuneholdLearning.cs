using System;
using System.IO;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private StarfallLearningProfile learningProfile = new StarfallLearningProfile();
    private StarfallQuestion learningQuestion;
    private bool previewRun, learningPanelOpen, learningPractice, learningRecovery;
    private bool questionSupported, questionExplained, questionHintVisible, questionResolved;
    private int visualSteps;
    private float questionOpenTime, visualMovedAt;
    private Vector2 visualMoveFrom, visualMoveTo;
    private string previousFactKey = "", learningFeedback = "";
    private bool questionIntro;
    private bool CanPersistProgress => Application.isPlaying && !previewRun;
    private string LearningSavePath => Path.Combine(Application.persistentDataPath, "starfall-learning-v1.json");

    private void LoadLearningProfile()
    {
        previewRun = Application.productName.EndsWith("Preview");
        if (!CanPersistProgress) return;
        try
        {
            if (File.Exists(LearningSavePath))
            {
                var saved = JsonUtility.FromJson<StarfallLearningProfile>(File.ReadAllText(LearningSavePath));
                if (saved != null && saved.Version == 1) learningProfile = saved;
            }
        }
        catch (Exception exception) { Debug.LogWarning("Learning profile could not be read: " + exception.GetType().Name); }
        learningProfile.Validate();
        showTutorial = !learningProfile.TutorialComplete;
    }

    private bool SaveLearningProfile()
    {
        if (!CanPersistProgress) return false;
        try
        {
            Directory.CreateDirectory(Application.persistentDataPath);
            string temporary = LearningSavePath + ".tmp";
            File.WriteAllText(temporary, JsonUtility.ToJson(learningProfile, true));
            File.Copy(temporary, LearningSavePath, true);
            File.Delete(temporary);
            return true;
        }
        catch (Exception exception) { Debug.LogWarning("Learning profile could not be saved: " + exception.GetType().Name); return false; }
    }

    private MathQuestion NextLearningQuestion()
    {
        learningQuestion = StarfallCurriculum.Next(learningProfile, UnityEngine.Random.Range(0, int.MaxValue), previousFactKey);
        previousFactKey = learningQuestion.Key;
        return LearningQuestionData(learningQuestion);
    }

    private MathQuestion LearningQuestionData(StarfallQuestion source) => new MathQuestion { Text = source.Prompt, Answer = source.Answer, Choices = source.Choices,
        First = source.First, Second = source.Second, Operation = source.Operation, FactKey = source.Key,
        Lesson = source.Lesson, Hint = source.Hint, Explanation = source.Explanation };
    private void AssignLearningQuestion(StarfallQuestion source) { question = LearningQuestionData(source); }

    private void ResetLearningQuestion(bool practice)
    {
        questionSupported = questionExplained = questionHintVisible = questionResolved = false;
        learningPractice = practice; learningRecovery = false;
        visualSteps = 0; questionOpenTime = 0; visualMovedAt = -10;
        questionAttempts = 0; selectedAnswer = -1;
        typedAnswer = ""; questionIntro = false;
    }

    private void BeginLearningPractice(bool recovery)
    {
        if (!menuOpen) OpenAcademyMenu(HubPage.Practice);
        StartStudySession(learningProfile.ActiveLesson);
    }

    private void HandleLearningKeys()
    {
        if (questionIntro) { if (Input.GetKeyDown(KeyCode.Return)) DismissQuestionIntro(); return; }
        if (studyResult) { if (Input.GetKeyDown(KeyCode.Return)) ContinueStudy(); return; }
        if (questionExplained)
        {
            if (Input.GetKeyDown(KeyCode.Return)) FinishLearningResolution();
            return;
        }
        if (Input.GetKeyDown(KeyCode.H)) ShowTeachingHint();
        if (Input.GetKeyDown(KeyCode.J)) ExplainQuestion();
        if (learningProfile.TypedAnswers)
        {
            for (int i = 0; i < 10; i++)
                if ((Input.GetKeyDown((KeyCode)((int)KeyCode.Alpha0 + i)) || Input.GetKeyDown((KeyCode)((int)KeyCode.Keypad0 + i))) && typedAnswer.Length < 3)
                    typedAnswer += i.ToString();
            if (Input.GetKeyDown(KeyCode.Backspace) && typedAnswer.Length > 0) typedAnswer = typedAnswer.Substring(0, typedAnswer.Length - 1);
            if (Input.GetKeyDown(KeyCode.Return) && int.TryParse(typedAnswer, out int value)) SubmitLearningValue(value);
            return;
        }
        for (int i = 0; i < 4; i++)
            if (Input.GetKeyDown((KeyCode)((int)KeyCode.Alpha1 + i))) { selectedAnswer = i; Answer(i); break; }
    }

    private void ShowTeachingHint()
    {
        questionSupported = questionHintVisible = true;
        answerFeedback = "Move the cells and look for a pattern. We can think together.";
        answerFeedbackColor = Gold;
    }

    private void ExplainQuestion()
    {
        ShowTeachingHint(); questionExplained = true; visualSteps = VisualStepTarget;
        answerFeedback = "Follow the example. Then we can keep going together.";
    }

    private void ResolveLearningAnswer(int choiceIndex)
    {
        if (choiceIndex < 0 || choiceIndex >= question.Choices.Length) return;
        SubmitLearningValue(question.Choices[choiceIndex]);
    }

    private void SubmitLearningValue(int value)
    {
        if (phase != Phase.Quiz || questionExplained || questionResolved || (!learningPractice && !CanBuy(selectedUpgrade))) return;
        questionAttempts++;
        if (value == question.Answer) { FinishLearningResolution(); return; }
        typedAnswer = "";
        questionSupported = true;
        ActivityToday().Mistakes++;
        if (!string.IsNullOrEmpty(question.FactKey)) learningProfile.Fact(question.FactKey).Mistakes++;
        SaveLearningProfile();
        if (questionAttempts >= MaxQuestionAttempts) ExplainQuestion();
        else
        {
            ShowTeachingHint();
            answerFeedback = "Let's look at the cells together, then try once more.";
        }
    }

    private void FinishLearningResolution()
    {
        if (phase != Phase.Quiz || questionResolved || (!learningPractice && !CanBuy(selectedUpgrade))) return;
        questionResolved = true;
        bool independent = !questionSupported && questionAttempts == 1;
        if (!string.IsNullOrEmpty(question.FactKey))
        {
            var resolved = new StarfallQuestion { Key = question.FactKey, Lesson = question.Lesson };
            learningProfile.Record(resolved, !independent, !learningPractice || learningRecovery);
            if (!studySession) AdvanceLearningInPlace();
            SaveLearningProfile();
        }
        learningFeedback = independent ? "Solved independently. Well reasoned!" : "Practised with support. We'll revisit this kind of question.";
        RecordPilotAnswer(independent);
        SaveLearningProfile();
        if (learningPractice)
        {
            if (studySession) { CompleteStudyQuestion(independent); return; }
            phase = learningRecovery ? Phase.Victory : Phase.Day;
            learningPanelOpen = !learningRecovery;
            return;
        }
        correctAnswers++;
        mathStreak = independent ? mathStreak + 1 : 0;
        score += independent ? 25 : 10;
        CompleteUpgrade();
        if (turretCount > 0) { tutorialStep = 2; learningProfile.TutorialComplete = true; SaveLearningProfile(); }
    }

    private void DrawLearningStatus()
    {
        if (phase != Phase.Day || buildPanelOpen || learningPanelOpen || pauseOpen) return;
        int lesson = learningProfile.ActiveLesson;
        Fill(30, 445, 300, 140, new Color(.025f, .045f, .09f, .95f));
        Text("FLIGHT ACADEMY · " + (lesson + 1) + "/" + StarfallCurriculum.Names.Length, 48, 455, 270, 24, new GUIStyle(smallStyle) { normal = { textColor = Gold }, fontStyle = FontStyle.Bold });
        Text(StarfallCurriculum.Names[lesson], 48, 485, 270, 28, labelStyle);
        Text("Independent checks  " + Mathf.Min(2, learningProfile.Evidence[lesson]) + "/2\nPractised with help  " + learningProfile.Supported[lesson], 48, 523, 270, 45, smallStyle);
        if (PixelButton("LESSONS + PRACTICE", 30, 595, 300, 39, Hex("665032"))) OpenAcademyMenu(HubPage.Galaxy);
    }

    private void DrawLearningPanel() => OpenAcademyMenu(HubPage.Galaxy);

    private Vector2 CellPosition(int index) => new Vector2(297 + (index % 10) * 24, 329 + (index / 10) * 25);

    private void DrawTeachingCells() => DrawFriendlyModel(new Rect(56, 242, 612, 290), false);

    private void DrawTeachingQuestion()
    {
        if (questionIntro) { DrawQuestionIntroduction(); return; }
        if (studyResult) { DrawStudyAnswerResult(); return; }
        DrawFriendlyQuestion();
    }

    private void DrawLearningEndScreen(bool won)
    {
        OverlayShade(.8f); UiCard(new Rect(240, 130, 800, 550), Cyan);
        UiText(won ? "Your adventure keeps growing!" : "Let's try a new plan", new Rect(276, 154, 728, 78), 35, true, UiInk, TextAnchor.MiddleCenter);
        DrawMenuPilot(new Vector2(640, 326), 0, 1.5f);
        UiText("Your tools, levels and completed maths are safe.", new Rect(290, 426, 700, 70), 27, false, UiMuted, TextAnchor.MiddleCenter);
        if (MenuButton(won ? "Keep exploring" : "Prepare & try again", new Rect(320, 554, 640, 80), Cyan, true, true))
        { if (won) { AdvanceLearningInPlace(); SaveLearningProfile(); phase = Phase.Day; SaveExpedition(); } else RetrySwarmCheckpoint(); }
    }
}
