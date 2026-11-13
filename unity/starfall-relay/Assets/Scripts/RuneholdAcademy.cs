using System;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private enum HubPage { Home, Galaxy, Practice, Armory, Progress, Achievements, Settings, Lesson, Results }
    private bool menuOpen, studySession, studyResult, reducedMotion;
    private HubPage hubPage;
    private Phase studyReturnPhase;
    private int hubFocus, selectedLesson, practiceSkill, studyIndex, studyIndependent, studySupported, studyXp;
    private string typedAnswer = "";
    private bool showWeaponPoses;
    private Font academyFont;
    private GUIStyle hubTitle, hubCopy, hubLabel;
    private static readonly string[] HubLabels = { "Command deck", "Learning galaxy", "Practice lab", "Equipment", "Pilot profile", "Collection", "Settings" };
    private static readonly HubPage[] HubPages = { HubPage.Home, HubPage.Galaxy, HubPage.Practice, HubPage.Armory, HubPage.Progress, HubPage.Achievements, HubPage.Settings };
    private static readonly string[] SkillNames = { "Addition", "Subtraction", "Multiplication", "Division" };
    private static readonly string[] LevelNames = { "Level 1", "Level 2", "Level 3" };
    private Color LearnerAccent => LiveryEnergy(learningProfile.Accent);

    private void InitializeAcademyMenu()
    {
        learningProfile.Validate();
        reducedMotion = learningProfile.ReducedMotion;
        academyFont = Resources.Load<Font>("Fonts/Nunito");
        academyBodyFont = Resources.Load<Font>("Fonts/NunitoRegular");
        if (academyBodyFont == null) academyBodyFont = academyFont;
        selectedLesson = learningProfile.ActiveLesson;
        menuOpen = true;
        hubPage = HubPage.Home;
        RefreshPracticeDate();
    }

    private void OpenAcademyMenu(HubPage page)
    {
        if (phase == Phase.Quiz)
        {
            if (studySession) EndStudySession(false);
            else { phase = Phase.Day; questionResolved = false; }
        }
        SaveExpedition();
        menuOpen = true; NavigateHub(page);
        selectedLesson = learningProfile.ActiveLesson;
        pauseOpen = buildPanelOpen = learningPanelOpen = false;
        pilotWalking = false;
    }

    private void ResumeExpedition()
    {
        menuOpen = false; pauseOpen = false;
        learningProfile.CadetName = learningProfile.CadetName.Trim(); learningProfile.Validate();
        SaveLearningProfile();
        SavePilotJournal();
    }

    private bool UpdateAcademyNavigation()
    {
        // Text-entry keys belong to IMGUI while its field owns keyboard focus.
        if (menuOpen && hubPage == HubPage.Settings && menuNameEditing) return true;
        if (Input.GetKeyDown(KeyCode.M) && !raidBriefOpen)
        {
            if (studySession) EndStudySession(false);
            else { if (menuOpen && phase != Phase.Quiz) ResumeExpedition(); else OpenAcademyMenu(HubPage.Home); }
            return true;
        }
        if (phase == Phase.Quiz && studySession && Input.GetKeyDown(KeyCode.Escape))
        { EndStudySession(false); return true; }
        if (!menuOpen || phase == Phase.Quiz) return false;
        if (Input.GetKeyDown(KeyCode.Escape)) { if (hubPage == HubPage.Home) ResumeExpedition(); else NavigateHub(HubPage.Home); return true; }
        if (hubPage == HubPage.Settings)
        {
            if ((Input.GetKey(KeyCode.LeftControl) || Input.GetKey(KeyCode.RightControl) || Input.GetKey(KeyCode.LeftCommand) || Input.GetKey(KeyCode.RightCommand)) && Input.GetKeyDown(KeyCode.S))
            { SaveMenuPreferences(); return true; }
            if (Input.GetKeyDown(KeyCode.R)) { reducedMotion = !reducedMotion; learningProfile.ReducedMotion = reducedMotion; SaveLearningProfile(); }
            if (Input.GetKeyDown(KeyCode.Q)) { learningProfile.TypedAnswers = !learningProfile.TypedAnswers; SaveLearningProfile(); }
            if (Input.GetKeyDown(KeyCode.F)) Screen.fullScreen = !Screen.fullScreen;
            if (Input.GetKeyDown(KeyCode.Alpha1)) pilotJournal.MusicVolume = ToggleMenuVolume(pilotJournal.MusicVolume, ref menuMusicRestore);
            if (Input.GetKeyDown(KeyCode.Alpha2)) pilotJournal.SoundVolume = ToggleMenuVolume(pilotJournal.SoundVolume, ref menuEffectsRestore);
        }
        if (hubPage == HubPage.Progress && profileTab == 1)
        {
            if (Input.GetKeyDown(KeyCode.F)) { showFactRecords = !showFactRecords; factPage = 0; }
            if (showFactRecords && Input.GetKeyDown(KeyCode.RightArrow)) factPage = Mathf.Min(Mathf.Max(0, (learningProfile.Facts.Count - 1) / 4), factPage + 1);
            if (showFactRecords && Input.GetKeyDown(KeyCode.LeftArrow)) factPage = Mathf.Max(0, factPage - 1);
        }
        int navigation = Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S) ? 1 : Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W) ? -1 : 0;
        if (navigation != 0)
        { hubFocus = (hubFocus + navigation + HubLabels.Length) % HubLabels.Length; menuNavPending = true; return true; }
        if (menuNavPending && Input.GetKeyDown(KeyCode.Return)) { NavigateHub(HubPages[hubFocus]); return true; }
        if (hubPage == HubPage.Practice)
        {
            for (int i = 0; i < 4; i++)
                if (Input.GetKeyDown((KeyCode)((int)KeyCode.Alpha1 + i)))
                { practiceSkill = i; selectedLesson = SkillLesson(i); NavigateHub(HubPage.Lesson); return true; }
            int direction = Input.GetKeyDown(KeyCode.RightArrow) ? 1 : Input.GetKeyDown(KeyCode.LeftArrow) ? -1 : 0;
            if (direction != 0) { learningProfile.PracticeDifficulty = (learningProfile.PracticeDifficulty + direction + 3) % 3; SaveLearningProfile(); }
        }
        if (hubPage == HubPage.Galaxy)
        {
            if (Input.GetKeyDown(KeyCode.RightArrow)) selectedLesson = (selectedLesson + 1) % 6;
            if (Input.GetKeyDown(KeyCode.LeftArrow)) selectedLesson = (selectedLesson + 5) % 6;
            if (Input.GetKeyDown(KeyCode.Return)) { NavigateHub(HubPage.Lesson); return true; }
        }
        if (hubPage == HubPage.Lesson && Input.GetKeyDown(KeyCode.Return)) { StartStudySession(selectedLesson); return true; }
        if (hubPage == HubPage.Armory && Input.GetKeyDown(KeyCode.Space)) showWeaponPoses = !showWeaponPoses;
        if (hubPage == HubPage.Progress && Input.GetKeyDown(KeyCode.Tab)) profileTab = (profileTab + 1) % 3;
        if (hubPage == HubPage.Achievements && Input.GetKeyDown(KeyCode.Tab)) collectionTab = 1 - collectionTab;
        if (hubPage == HubPage.Achievements && collectionTab == 0 && (Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.RightArrow))) achievementPage = (achievementPage + (Input.GetKeyDown(KeyCode.LeftArrow) ? 2 : 1)) % 3;
        if (hubPage == HubPage.Achievements && collectionTab == 1)
            for (int i = 0; i < 4; i++)
                if (Input.GetKeyDown((KeyCode)((int)KeyCode.Alpha1 + i))) EquipLivery(i);
        if (hubPage == HubPage.Results && Input.GetKeyDown(KeyCode.Return)) { ResumeExpedition(); return true; }
        if (Input.GetKeyDown(KeyCode.Return))
        {
            NavigateHub(HubPages[hubFocus]);
        }
        return true;
    }

    private void DrawAcademyMenu()
    {
        if (menuClearFocus) { GUIUtility.keyboardControl = 0; GUI.FocusControl(""); menuClearFocus = false; }
        hubTitle = MenuType(30, Cream, true);
        hubCopy = MenuType(20, Hex("becddd"));
        hubLabel = MenuType(22, Cream, true);
        DrawRelayMenuShell();
        switch (hubPage)
        {
            case HubPage.Home: DrawHubHome(); break;
            case HubPage.Galaxy: DrawGalaxyRoute(); break;
            case HubPage.Practice: DrawPracticeLab(); break;
            case HubPage.Lesson: DrawLessonBrief(); break;
            case HubPage.Armory: DrawDefenderGuide(); break;
            case HubPage.Progress: DrawLearningProgress(); break;
            case HubPage.Achievements: DrawAchievements(); break;
            case HubPage.Settings: DrawLearningSettings(); break;
            case HubPage.Results: DrawStudyResults(); break;
        }
        menuNameEditing = hubPage == HubPage.Settings && GUI.GetNameOfFocusedControl() == "CadetName";
    }

    private void HubHeading(string title, string description)
    {
        UiText(title, new Rect(334, 135, 866, 45), 32, true);
        UiText(description, new Rect(334, 184, 866, 42), 21, false, UiMuted);
    }

    private void DrawHubHome()
    {
        DrawRelayHome();
    }

    private void DrawGalaxyRoute()
    {
        HubHeading("Where shall we learn?", "Pick a lesson. Every lesson is open for practice.");
        DrawRouteNodes(240, false);
        UiCard(new Rect(334, 638, 866, 119), Cyan);
        UiText(StarfallCurriculum.Names[selectedLesson], new Rect(358, 650, 500, 37), 25, true);
        UiText(selectedLesson <= learningProfile.UnlockedLesson ? "Use this maths for your space upgrades." : "Practise here. Space milestones unlock its upgrades.", new Rect(358, 692, 500, 52), 20, false, UiMuted);
        if (MenuButton("Open lesson", new Rect(886, 666, 290, 64), Cyan, true, true)) NavigateHub(HubPage.Lesson);
    }

    private void DrawRouteNodes(float top, bool compact)
    {
        string[] titles = { "Adding", "Taking away", "Making ten", "Equal groups", "Sharing", "Mixed puzzles" };
        for (int i = 0; i < 6; i++)
        {
            Rect card = new Rect(334 + i % 3 * 292, top + i / 3 * 194, 282, 176);
            bool selected = i == selectedLesson; UiCard(card, i % 2 == 0 ? Cyan : Gold, selected);
            DrawMenuPlanet(new Vector2(card.x + 43, card.y + 49), i, 25, selected, learningProfile.Wins[i] > 0);
            UiText(titles[i], new Rect(card.x + 87, card.y + 19, 177, 65), 25, true);
            UiText("Lesson " + (i + 1) + " · Tap to explore", new Rect(card.x + 20, card.y + 106, 242, 52), 20, false, UiMuted);
            if (GUI.Button(card, GUIContent.none, GUIStyle.none)) { selectedLesson = i; PlayRelaySound(4, .5f); NavigateHub(HubPage.Lesson); }
        }
    }

    private void DrawPracticeLab()
    {
        HubHeading("Let's try some maths", "Pick a skill, then solve five puzzles. You can always ask for help.");
        for (int level = 0; level < 3; level++)
            if (MenuTab(LevelNames[level], new Rect(334 + level * 292, 240, 282, 58), learningProfile.PracticeDifficulty == level))
            { learningProfile.PracticeDifficulty = level; SaveLearningProfile(); }
        string[] symbols = { "+", "−", "×", "÷" };
        string[] copy = { "Put amounts together.", "Find what is left.", "Make equal groups.", "Share things fairly." };
        for (int i = 0; i < 4; i++)
        {
            Rect card = new Rect(334 + i % 2 * 442, 320 + i / 2 * 206, 424, 187); UiCard(card, i < 2 ? Cyan : Gold);
            UiText(symbols[i], new Rect(card.x + 19, card.y + 17, 62, 62), 55, true, UiBlue, TextAnchor.MiddleCenter);
            UiText(SkillNames[i], new Rect(card.x + 99, card.y + 17, 305, 36), 26, true);
            UiText(copy[i], new Rect(card.x + 99, card.y + 60, 305, 45), 22, false, UiMuted);
            if (MenuButton("Let's practise", new Rect(card.x + 99, card.y + 118, 305, 53), Cyan)) { practiceSkill = i; selectedLesson = SkillLesson(i); NavigateHub(HubPage.Lesson); }
        }
        UiText("No timer. Your space adventure stays safe while you learn.", new Rect(334, 744, 866, 32), 21, false, UiMuted);
    }

    private static int SkillLesson(int skill) => skill < 2 ? skill : skill == 2 ? 3 : 4;

    private void DrawLessonBrief()
    {
        int lesson = selectedLesson;
        HubHeading(StarfallCurriculum.Names[lesson], "Read the idea. Look at the example. Then have a go!");
        UiCard(new Rect(334, 240, 866, 182), Cyan);
        UiText("Think about it this way", new Rect(358, 252, 818, 38), 24, true, UiBlue);
        UiText(StarfallCurriculum.Teachings[lesson], new Rect(358, 298, 818, 105), 26);
        StarfallQuestion example = StarfallCurriculum.CreateSkill(lesson, 0, 271 + lesson);
        UiCard(new Rect(334, 440, 866, 160), Gold);
        UiText("An example", new Rect(358, 451, 818, 36), 24, true);
        UiText(example.Explanation, new Rect(358, 493, 818, 88), 26);
        if (MenuButton("Try 5 puzzles", new Rect(334, 630, 415, 74), Cyan, true, true)) StartStudySession(lesson);
        bool unlocked = lesson <= learningProfile.UnlockedLesson;
        if (MenuButton(unlocked ? "Use in my adventure" : "Space lesson locked", new Rect(767, 630, 433, 74), Gold, unlocked))
        { learningProfile.ActiveLesson = lesson; learningProfile.LessonSeen[lesson] = true; SaveLearningProfile(); ResumeExpedition(); }
        UiText(unlocked ? "Your astronaut and all your tools are kept." : "Practice is open. Protect your ship and solve upgrade puzzles to unlock this space lesson.", new Rect(334, 721, 866, 55), 20, false, UiMuted);
    }

    private void DrawDefenderGuide()
    {
        HubHeading("Your space tools", "Collect resources. Solve an energy puzzle. Make a helpful upgrade.");
        if (showWeaponPoses)
        {
            UiCard(new Rect(334, 240, 866, 425), Cyan);
            float[] angles = { 0, -90, 180, 90 }; string[] labels = { "Right", "Up", "Left", "Down" };
            for (int i = 0; i < 4; i++) { DrawMenuPilot(new Vector2(440 + i * 214, 422), angles[i], 1.9f); UiText(labels[i], new Rect(350 + i * 214, 546, 180, 46), 24, true, UiInk, TextAnchor.MiddleCenter); }
            UiText("Your blaster aims and shoots automatically.", new Rect(358, 606, 818, 40), 24, false, UiMuted);
        }
        else for (int i = 0; i < 6; i++)
        {
            Upgrade kind = (Upgrade)i; Rect card = new Rect(334 + i % 3 * 292, 240 + i / 3 * 228, 282, 210);
            UiCard(card, UpgradeColor(kind)); DrawMenuEquipmentArt(kind, new Vector2(card.x + 49, card.y + 48), 60);
            UiText(FriendlyUpgrade(kind), new Rect(card.x + 94, card.y + 14, 172, 68), 24, true);
            UiText(FriendlyBenefit(kind), new Rect(card.x + 18, card.y + 99, 246, 96), 20, false, UiMuted);
        }
        if (MenuButton(showWeaponPoses ? "Back to my tools" : "See my space blaster", new Rect(334, 708, 866, 58), Cyan)) showWeaponPoses = !showWeaponPoses;
    }

    private void DrawLearningProgress()
    {
        DrawPilotProfile();
    }

    private void DrawAchievements()
    {
        DrawCollection();
    }

    private void DrawLearningSettings() => DrawPolishedSettings();

    private void DrawMenuPilot(Vector2 position, float angle, float zoom = 1.25f)
    {
        Vector2 previousPosition = pilotPosition; float previousAngle = pilotAimAngle;
        int previousFacing = pilotFacing; bool previousWalk = pilotWalking; float previousKick = pilotWeaponKick, flash = pilotMuzzleFlash;
        Matrix4x4 matrix = GUI.matrix;
        GUI.matrix *= Matrix4x4.TRS(new Vector3(position.x, position.y, 0), Quaternion.identity, new Vector3(zoom, zoom, 1));
        pilotPosition = Vector2.zero; pilotAimAngle = angle; pilotWalking = false; pilotWeaponKick = pilotMuzzleFlash = 0;
        Vector2 direction = AimDirection(angle);
        pilotFacing = Mathf.Abs(direction.x) > Mathf.Abs(direction.y) ? direction.x < 0 ? 2 : 3 : direction.y < 0 ? 1 : 0;
        DrawPilot();
        GUI.matrix = matrix; pilotPosition = previousPosition; pilotAimAngle = previousAngle; pilotFacing = previousFacing;
        pilotWalking = previousWalk; pilotWeaponKick = previousKick; pilotMuzzleFlash = flash;
    }

    private void RefreshPracticeDate()
    {
        string today = DateTime.Now.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture);
        if (learningProfile.PracticeDate != today) { learningProfile.PracticeDate = today; learningProfile.DailySolved = 0; }
    }

    private void StartStudySession(int lesson)
    {
        studyReturnPhase = phase;
        studySession = true; studyIndex = studyIndependent = studySupported = studyXp = 0;
        selectedLesson = lesson; learningProfile.LessonSeen[lesson] = true;
        NewStudyQuestion(); SaveLearningProfile();
    }

    private void NewStudyQuestion()
    {
        learningQuestion = StarfallCurriculum.NextPractice(learningProfile, selectedLesson, learningProfile.PracticeDifficulty, UnityEngine.Random.Range(0, int.MaxValue), previousFactKey);
        previousFactKey = learningQuestion.Key;
        AssignLearningQuestion(learningQuestion);
        ResetLearningQuestion(true); studyResult = false; typedAnswer = "";
        phase = Phase.Quiz; answerFeedback = "Take your time. Help and visual models are available.";
    }

    private void CompleteStudyQuestion(bool independent)
    {
        int xp = independent ? 10 : 4;
        studyXp += xp;
        if (independent) studyIndependent++; else studySupported++;
        studyIndex++; studyResult = true; visualSteps = VisualStepTarget; SaveLearningProfile();
    }

    private void ContinueStudy()
    {
        if (studyIndex < 5) NewStudyQuestion(); else EndStudySession(true);
    }

    private void EndStudySession(bool completed)
    {
        if (!studySession) return;
        phase = studyReturnPhase; studySession = false; studyResult = false;
        menuOpen = true; NavigateHub(completed ? HubPage.Results : HubPage.Practice);
        questionResolved = false; SaveLearningProfile(); SaveExpedition();
    }

    private void DrawStudyResults()
    {
        HubHeading("Nice work, " + learningProfile.CadetName + "!", "Five puzzles complete. Every step helps your maths grow.");
        UiCard(new Rect(334, 240, 866, 372), Gold);
        DrawClearIcon(5, new Vector2(1023, 283), 10, Hex("c99129"));
        UiText("+" + studyXp + " maths points", new Rect(364, 269, 570, 66), 38, true, UiBlue);
        UiText(studyIndependent + " worked out yourself", new Rect(364, 362, 570, 45), 27, true);
        UiText(studySupported + " learned together", new Rect(364, 420, 570, 45), 27, true);
        UiText("Today: " + Mathf.Min(5, learningProfile.DailySolved) + " of 5 puzzles · " + MenuCount(learningProfile.Stars, "learning star"), new Rect(364, 506, 806, 65), 24, false, UiMuted);
        if (MenuButton("Try more puzzles", new Rect(334, 650, 415, 76), Cyan)) StartStudySession(selectedLesson);
        if (MenuButton("Back to space", new Rect(767, 650, 433, 76), Gold, true, true)) ResumeExpedition();
        UiText("Learning with help counts too. Keep going at your own pace.", new Rect(334, 740, 866, 38), 20, false, UiMuted);
    }

    private int VisualStepTarget => question.Operation == '*' ? question.First : question.Operation == '/' ? question.Answer : question.Second;

    private void DismissQuestionIntro()
    {
        questionIntro = false; learningProfile.LessonSeen[question.Lesson] = true; SaveLearningProfile();
    }

    private void DrawQuestionIntroduction()
    {
        TeachingBackdrop("Let's learn it first", "A little practice can give your spaceship a lot of power.");
        UiCard(new Rect(32, 128, 790, 516), Cyan);
        UiText(StarfallCurriculum.Topics[question.Lesson], new Rect(64, 154, 726, 60), 32, true, UiBlue);
        UiText(StarfallCurriculum.Teachings[question.Lesson], new Rect(64, 234, 726, 142), 27);
        StarfallQuestion example = StarfallCurriculum.CreateSkill(question.Lesson, 0, 271 + question.Lesson);
        UiRound(new Rect(64, 402, 726, 206), Hex("eaf4fc"));
        UiText("Try thinking about this", new Rect(86, 417, 680, 41), 25, true);
        UiText(example.Explanation, new Rect(86, 475, 680, 112), 27);
        DrawMenuPilot(new Vector2(1030, 369), 0, 2.5f);
        UiText("I'll wait while you think!", new Rect(867, 515, 337, 64), 26, true, UiBlue, TextAnchor.MiddleCenter);
        if (MenuButton("I'm ready to try", new Rect(32, 684, 790, 80), Cyan, true, true)) DismissQuestionIntro();
        UiText("No timer. We can work together.", new Rect(866, 684, 338, 80), 22, false, UiMuted, TextAnchor.MiddleCenter);
    }

    private void DrawEqualGroupModel() => DrawFriendlyGroups(new Rect(56, 242, 612, 290));

    private void DrawStudyAnswerResult()
    {
        TeachingBackdrop("Good thinking!", "Question " + studyIndex + " of 5 complete. Every step is practice.");
        UiText(question.Text.Replace("?", question.Answer.ToString()), new Rect(32, 112, 660, 96), 64, true, UiBlue, TextAnchor.MiddleCenter);
        UiCard(new Rect(32, 224, 660, 388), Cyan);
        DrawFriendlyModel(new Rect(56, 242, 612, 290), false);
        UiText(question.Explanation, new Rect(56, 541, 612, 56), 22, true);
        UiCard(new Rect(720, 112, 528, 540), Gold);
        DrawClearIcon(5, new Vector2(919, 153), 9, Hex("d59a2d"));
        UiText("+" + (questionSupported ? 4 : 10) + " maths points", new Rect(748, 288, 472, 66), 35, true, UiBlue, TextAnchor.MiddleCenter);
        UiText(questionSupported ? "We worked it out together.\nThat is learning too!" : "You worked it out yourself!", new Rect(758, 381, 452, 100), 27, false, UiInk, TextAnchor.MiddleCenter);
        UiText("Your spaceship is waiting safely.", new Rect(752, 546, 464, 53), 22, false, UiMuted, TextAnchor.MiddleCenter);
        if (MenuButton(studyIndex < 5 ? "Next question" : "See my progress", new Rect(720, 686, 528, 80), Cyan, true, true)) ContinueStudy();
    }
}
