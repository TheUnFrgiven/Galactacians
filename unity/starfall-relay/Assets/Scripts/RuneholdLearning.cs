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
        answerFeedback = "Use the cells to see why it works. Helped answers are recorded separately.";
        answerFeedbackColor = Gold;
    }

    private void ExplainQuestion()
    {
        ShowTeachingHint(); questionExplained = true; visualSteps = VisualStepTarget;
        answerFeedback = "Follow the worked example, then continue with support.";
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
            answerFeedback = "Let's use the cells together. You have one retry on this question.";
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
        if (PixelButton("LESSONS + PRACTICE  [L]", 30, 595, 300, 39, Hex("665032"))) OpenAcademyMenu(HubPage.Galaxy);
    }

    private void DrawLearningPanel() => OpenAcademyMenu(HubPage.Galaxy);

    private Vector2 CellPosition(int index) => new Vector2(297 + (index % 10) * 24, 329 + (index / 10) * 25);

    private void DrawTeachingCells()
    {
        if (question.Operation == '*' || question.Operation == '/') { DrawEqualGroupModel(); return; }
        Fill(278, 285, 450, 170, Panel);
        bool subtract = question.Operation == '-';
        Text(subtract ? "START WITH " + question.First : "START WITH " + question.First + " · ADD " + question.Second, 293, 293, 420, 25, smallStyle);
        int occupied = subtract ? question.First : question.First + visualSteps;
        for (int i = 0; i < (question.First + question.Second > 10 ? 20 : 10); i++)
        {
            Vector2 position = CellPosition(i);
            Fill(position.x, position.y, 19, 19, Hex("0b1628"));
            if (i >= occupied) continue;
            bool removed = subtract && i >= question.First - visualSteps;
            Color color = removed ? Hex("445064") : !subtract && i >= question.First ? Gold : Cyan;
            Fill(position.x + 2, position.y + 2, 15, 15, color);
            Fill(position.x + 3, position.y + 3, 8, 2, new Color(1, 1, 1, .5f));
        }
        Text(subtract ? "USED TRAY" : "CELLS TO JOIN", 293, 382, 270, 22, smallStyle);
        int trayCount = subtract ? visualSteps : question.Second - visualSteps;
        for (int i = 0; i < trayCount; i++) Fill(297 + i * 24, 411, 17, 17, Gold);
        if (visualSteps < question.Second && !questionExplained && PixelButton(subtract ? "TAKE ONE" : "JOIN ONE", 567, 394, 143, 40, Hex("277c8e")))
        {
            ShowTeachingHint();
            int index = subtract ? question.First - visualSteps - 1 : question.First + visualSteps;
            visualMoveFrom = subtract ? CellPosition(index) : new Vector2(297 + (question.Second - visualSteps - 1) * 24, 411);
            visualMoveTo = subtract ? new Vector2(297 + visualSteps * 24, 411) : CellPosition(index);
            visualSteps++; visualMovedAt = corePulse;
        }
        float t = reducedMotion ? 1 : (corePulse - visualMovedAt) / .35f;
        if (t >= 0 && t < 1)
        {
            Vector2 position = Vector2.Lerp(visualMoveFrom, visualMoveTo, t) + new Vector2(0, -Mathf.Sin(t * Mathf.PI) * 25);
            Fill(position.x, position.y, 18, 18, Cream);
        }
    }

    private void DrawTeachingQuestion()
    {
        if (questionIntro) { DrawQuestionIntroduction(); return; }
        if (studyResult) { DrawStudyAnswerResult(); return; }
        OverlayShade(.78f); MenuCard(new Rect(245, 112, 790, 560), Gold);
        Text(learningPractice ? "FLIGHT ACADEMY · " + StarfallCurriculum.Names[question.Lesson] : "ENGINEERING · " + UpgradeName(selectedUpgrade), 278, 131, 720, 34, new GUIStyle(titleStyle) { fontSize = 23 });
        Text(learningPractice ? StarfallCurriculum.Topics[question.Lesson] + " · no answer timer" : CalibrationPurpose + " · set the control load", 278, 171, 710, 25, smallStyle);
        string prompt = questionExplained ? question.Text.Replace("?", question.Answer.ToString()) : question.Text;
        TextCentered(prompt, 278, 205, 450, 62, hugeStyle);
        if (!learningPractice)
        {
            DrawUpgradeArt(selectedUpgrade, new Vector2(878, 231), 57, Color.white);
            UpgradeCost(selectedUpgrade, out int alloyCost, out int crystalCost);
            TextCentered(UpgradeName(selectedUpgrade) + " · " + alloyCost + " alloy + " + crystalCost + " crystal", 750, 264, 250, 32, new GUIStyle(smallStyle) { fontSize = 12 });
        }
        else TextCentered("PRACTICE " + (studyIndex + 1) + "/5\n" + LevelNames[learningProfile.PracticeDifficulty] + " · no cost", 750, 211, 250, 65, labelStyle);
        DrawTeachingCells();
        Fill(750, 302, 250, 153, Panel);
        Text(questionExplained ? "WORKED EXAMPLE" : questionHintVisible ? "TRY THIS STRATEGY" : "THINK IT THROUGH", 766, 315, 222, 25, new GUIStyle(smallStyle) { normal = { textColor = Gold }, fontStyle = FontStyle.Bold });
        Text(questionExplained ? question.Explanation : questionHintVisible ? question.Hint : !learningPractice ? CalibrationContext : "Take your time. Use a hint or the model to reason it out.", 766, 350, 217, 92, smallStyle);
        if (!questionExplained)
        {
            if (learningProfile.TypedAnswers)
            {
                DrawNumberPad();
            }
            else
            {
            for (int i = 0; i < 4; i++)
                if (PixelButton("[" + (i + 1) + "]   " + question.Choices[i], 278 + (i % 2) * 235, 475 + (i / 2) * 57, 215, 47, selectedAnswer == i ? Hex("6b4c36") : PanelLight)) { selectedAnswer = i; Answer(i); }
            }
            if (PixelButton("SHOW A HINT [H]", 750, 475, 250, 45, Hex("665032"))) ShowTeachingHint();
            if (PixelButton("WORK TOGETHER [J]", 750, 532, 250, 45, Hex("364e65"))) ExplainQuestion();
        }
        else
        {
            Fill(278, 475, 450, 106, Panel);
            Text(question.Explanation, 295, 489, 415, 75, labelStyle);
            if (PixelButton(learningPractice ? "CONTINUE [ENTER]" : "INSTALL [ENTER]", 750, 475, 250, 71, Hex("277c8e"))) FinishLearningResolution();
            Text("Helped learning is recorded separately.\nNo first-try alloy bonus.", 752, 551, 245, 40, new GUIStyle(smallStyle) { fontSize = 12 });
        }
        Text(answerFeedback, 278, 598, 535, 58, new GUIStyle(smallStyle) { normal = { textColor = answerFeedbackColor } });
        if (PixelButton("BACK", 842, 620, 158, 32, PanelLight))
        { if (studySession) EndStudySession(false); else { phase = Phase.Day; buildPanelOpen = true; } }
    }

    private void DrawLearningEndScreen(bool won)
    {
        OverlayShade(.84f); Fill(300, 140, 680, 520, Ink); Fill(300, 140, 680, 6, won ? Gold : Ember);
        int lesson = learningProfile.ActiveLesson;
        TextCentered(won ? "RELAY SURVIVED" : "THE SWARM BROKE THROUGH", 330, 166, 620, 64, new GUIStyle(hugeStyle) { fontSize = 33 });
        TextCentered(StarfallCurriculum.Names[lesson], 330, 238, 620, 32, labelStyle);
        TextCentered("Independent checks " + Mathf.Min(2, learningProfile.Evidence[lesson]) + "/2 · helped learning " + learningProfile.Supported[lesson], 330, 284, 620, 34, labelStyle);
        TextCentered("Enemies stopped " + waveMeteorsDestroyed + " / " + enemyCountToSpawn + " · hold score " + score, 330, 334, 620, 30, smallStyle);
        if (won)
        {
            bool needsCheck = learningProfile.Evidence[lesson] < 2;
            TextCentered("Your expedition continues. All earned power is kept.", 335, 385, 610, 50, smallStyle);
            TextCentered(learningFeedback, 335, 442, 610, 30, new GUIStyle(smallStyle) { normal = { textColor = Mint } });
            if (PixelButton(needsCheck ? "TARGETED PRACTICE" : lesson < StarfallCurriculum.Names.Length - 1 ? "START NEXT LESSON" : "CONTINUE EXPEDITION", 385, 494, 510, 54, Hex("277c8e")))
            {
                if (needsCheck) BeginLearningPractice(true);
                else { AdvanceLearningInPlace(); SaveLearningProfile(); phase = Phase.Day; SaveExpedition(); }
            }
        }
        else
        {
            TextCentered("Your earned upgrades and completed math are kept for this wave retry.", 335, 390, 610, 54, smallStyle);
            if (PixelButton("RETRY THIS NIGHT", 385, 494, 510, 54, Hex("277c8e"))) RetrySwarmCheckpoint();
        }
        TextCentered("No forced reset · your expedition is saved", 390, 593, 500, 36, smallStyle);
    }
}
