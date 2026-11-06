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
    private static readonly string[] LevelNames = { "Starter", "Explorer", "Challenger" };
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
            if (showFactRecords && Input.GetKeyDown(KeyCode.RightArrow)) factPage = Mathf.Min(Mathf.Max(0, (learningProfile.Facts.Count - 1) / 6), factPage + 1);
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
        if (hubPage == HubPage.Achievements && collectionTab == 0 && (Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.RightArrow))) achievementPage = 1 - achievementPage;
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
        hubCopy = MenuType(15, Hex("becddd"));
        hubLabel = MenuType(19, Cream, true);
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
        MenuText(title, new Rect(334, 130, 866, 40), 30, Cream, true, true);
        MenuText(description, new Rect(335, 180, 864, 37), 15, Hex("b7c9d9"));
    }

    private void DrawHubHome()
    {
        DrawRelayHome();
    }

    private void DrawGalaxyRoute()
    {
        HubHeading("Choose your next discovery.", "Explore a lesson, see its teaching, then apply it to upgrades. Changing lessons never resets the expedition.");
        DrawRouteNodes(246, false);
        int lesson = selectedLesson;
        MenuCard(new Rect(334, 421, 866, 302), LearnerAccent);
        Text(StarfallCurriculum.MissionNames[lesson] + " · " + StarfallCurriculum.Names[lesson], 358, 441, 800, 35, hubLabel);
        Text(StarfallCurriculum.Teachings[lesson], 358, 489, 800, 68, hubCopy);
        Text("Upgrade checks: " + Mathf.Min(2, learningProfile.Evidence[lesson]) + "/2 · milestones: " + learningProfile.Wins[lesson] +
            "\nUnlock: a third-night milestone + two different independent upgrade calibrations.", 358, 582, 800, 58, hubCopy);
        if (PixelButton("OPEN TEACHING + QUESTIONS", 358, 656, 510, 45, Hex("277c8e"))) hubPage = HubPage.Lesson;
    }

    private void DrawRouteNodes(float top, bool compact)
    {
        Vector2[] points = new Vector2[6];
        for (int i = 0; i < 6; i++) points[i] = new Vector2(400 + i * 145, top + 39 + (i % 2 == 0 ? 0 : 16));
        for (int i = 0; i < 5; i++) DrawBeam(points[i], points[i + 1], 1, Hex("486279"));
        for (int i = 0; i < 6; i++)
        {
            bool unlocked = i <= learningProfile.UnlockedLesson;
            bool complete = learningProfile.Evidence[i] >= 2 && learningProfile.Wins[i] > 0;
            bool selected = compact ? i == learningProfile.ActiveLesson : i == selectedLesson;
            Vector2 at = points[i]; Rect hit = new Rect(at.x - 65, top + 4, 130, 147);
            bool hover = hit.Contains(Event.current.mousePosition);
            if (selected || hover)
            {
                Fill(hit.x, hit.y, hit.width, hit.height, new Color(.48f, .72f, .96f, hover ? .22f : .12f));
                Fill(hit.x + 10, hit.yMax - 1, hit.width - 20, 1, selected ? Gold : LearnerAccent);
            }
            DrawMenuPlanet(at, i, 21, selected, complete);
            MenuText(StarfallCurriculum.MissionNames[i], new Rect(at.x - 62, top + 83, 124, 32), 13, Cream, true);
            MenuText(complete ? "CHECKPOINT CLEAR" : unlocked ? "UPGRADES + PRACTICE" : "PRACTICE OPEN", new Rect(at.x - 62, top + 122, 124, 18), 10, selected ? Gold : Hex("acc1d3"), false, true);
            if (GUI.Button(hit, GUIContent.none, GUIStyle.none))
            { selectedLesson = i; PlayRelaySound(4, .5f); NavigateHub(compact ? HubPage.Lesson : HubPage.Galaxy); }
        }
    }

    private void DrawPracticeLab()
    {
        HubHeading("A little practice. A bigger possibility.", "Choose a skill and try five questions at your pace. No enemies, no material costs, no survival pressure.");
        for (int level = 0; level < 3; level++)
            if (MenuTab(LevelNames[level], new Rect(337 + level * 291, 228, 278, 42), learningProfile.PracticeDifficulty == level))
            { learningProfile.PracticeDifficulty = level; SaveLearningProfile(); }
        string[] symbols = { "+", "−", "×", "÷" };
        string[] copy = { "Join amounts and count forward.", "Take away and count what remains.", "Build and count equal groups.", "Share a total into equal groups." };
        for (int i = 0; i < 4; i++)
        {
            float x = 337 + i % 2 * 438, y = 300 + i / 2 * 180;
            MenuCard(new Rect(x, y, 414, 159), i < 2 ? LearnerAccent : Gold);
            Text(symbols[i], x + 20, y + 15, 60, 60, hugeStyle);
            Text(SkillNames[i], x + 98, y + 17, 285, 30, hubLabel);
            Text(copy[i], x + 98, y + 56, 285, 42, hubCopy);
            if (PixelButton("Learn + practise", x + 98, y + 108, 285, 35, Hex("277c8e")))
            { practiceSkill = i; selectedLesson = SkillLesson(i); NavigateHub(HubPage.Lesson); }
        }
        Text("Tap a skill to begin. Learning XP and stars are separate from combat power.", 338, 691, 845, 47, hubCopy);
    }

    private static int SkillLesson(int skill) => skill < 2 ? skill : skill == 2 ? 3 : 4;

    private void DrawLessonBrief()
    {
        int lesson = selectedLesson;
        HubHeading(StarfallCurriculum.MissionNames[lesson], StarfallCurriculum.Topics[lesson]);
        MenuCard(new Rect(334, 236, 866, 302), LearnerAccent);
        Text("LEARN IT", 358, 244, 800, 30, hubLabel);
        Text(StarfallCurriculum.Teachings[lesson], 358, 287, 794, 78, hubLabel);
        StarfallQuestion example = StarfallCurriculum.CreateSkill(lesson, 0, 271 + lesson);
        Text("TRY THIS EXAMPLE", 358, 383, 790, 27, hubCopy);
        Text(example.Explanation, 358, 421, 790, 90, hubLabel);
        Text("Help is always available. One retry, then a worked example. Helped and independent answers are recorded separately.", 338, 556, 847, 60, hubCopy);
        if (PixelButton("TRY 5 QUESTIONS", 337, 639, 385, 51, Hex("277c8e"))) StartStudySession(lesson);
        bool open = lesson <= learningProfile.UnlockedLesson;
        if (MenuButton(open ? "Use for my upgrades" : "Unlock through expedition", new Rect(745, 639, 452, 51), Gold, open))
        {
            learningProfile.ActiveLesson = lesson; learningProfile.LessonSeen[lesson] = true;
            SaveLearningProfile(); ResumeExpedition();
        }
        Text("Your current gear stays equipped.", 338, 710, 840, 30, hubCopy);
    }

    private void DrawDefenderGuide()
    {
        HubHeading("Built for the next great defense.", "Discover each system's job. Buy its next rank from the Ascension Bay on the deck.");
        if (PixelButton(showWeaponPoses ? "System guide" : "Rifle handling", 337, 214, 860, 35, Hex("277c8e"))) showWeaponPoses = !showWeaponPoses;
        if (showWeaponPoses)
        {
            MenuCard(new Rect(337, 272, 860, 375), LearnerAccent);
            float[] angles = { 0, -90, 180, 90 };
            string[] labels = { "RIGHT", "UP", "LEFT", "DOWN" };
            for (int i = 0; i < 4; i++)
            {
                DrawMenuPilot(new Vector2(447 + i * 213, 445), angles[i], 1.7f);
                TextCentered(labels[i], 358 + i * 213, 552, 177, 40, hubLabel);
            }
            Text("Drag the move stick. Your rifle tracks nearby enemies automatically. Upgrade it for damage, piercing and spread.", 358, 598, 815, 42, hubCopy);
            return;
        }
        for (int i = 0; i < 6; i++)
        {
            Upgrade upgrade = (Upgrade)i;
            float x = 337 + i % 3 * 291, y = 270 + i / 3 * 220;
            MenuCard(new Rect(x, y, 272, 200), UpgradeColor(upgrade));
            DrawMenuEquipmentArt(upgrade, new Vector2(x + 43, y + 49), 46);
            Text(UpgradeName(upgrade), x + 87, y + 19, 173, 51, new GUIStyle(hubLabel) { fontSize = 16 });
            Text("RANK " + UpgradeLevel(upgrade) + (pilotJournal.Setpoints[i] > 0 ? " · LOAD " + pilotJournal.Setpoints[i] : ""), x + 20, y + 88, 230, 27, hubCopy);
            Text(UpgradeDetail(upgrade), x + 20, y + 123, 232, 66, hubCopy);
        }
        Text("Add cannons for coverage. Boost them for stronger blasts, and use rifle or drone upgrades to cover the edges.", 338, 698, 841, 40, hubCopy);
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
        HubHeading("NICE WORK, " + learningProfile.CadetName.ToUpperInvariant() + ".", "Your five-question practice is complete. Your expedition is ready whenever you are.");
        MenuCard(new Rect(337, 239, 860, 300), Gold);
        Text("+" + studyXp + " LEARNING XP", 370, 264, 650, 55, hubTitle);
        DrawPixelEllipse(new Vector2(1064, 385), 62, 62, Hex("2d3440"));
        DrawPixelEllipse(new Vector2(1064, 385), 53, 53, Hex("4b4030"));
        MenuIcon(5, new Vector2(1028, 349), 9, Gold);
        MenuText("PRACTICE COMPLETE", new Rect(962, 461, 205, 25), 12, Gold, true, true);
        Text(studyIndependent + " independently solved\n" + studySupported + " completed with support\nToday: " + Mathf.Min(5, learningProfile.DailySolved) + "/5 solved · " + MenuCount(learningProfile.Stars, "practice star"), 370, 345, 780, 142, hubLabel);
        if (PixelButton("PRACTISE AGAIN", 337, 590, 414, 52, Hex("277c8e"))) StartStudySession(selectedLesson);
        if (PixelButton("BACK TO EXPEDITION", 775, 590, 422, 52, Hex("665032"))) ResumeExpedition();
        Text("Helped answers are useful practice. They are never labelled independent.", 338, 682, 840, 50, hubCopy);
    }

    private int VisualStepTarget => question.Operation == '*' ? question.First : question.Operation == '/' ? question.Answer : question.Second;

    private void DismissQuestionIntro()
    {
        questionIntro = false; learningProfile.LessonSeen[question.Lesson] = true; SaveLearningProfile();
    }

    private void DrawQuestionIntroduction()
    {
        OverlayShade(.82f); MenuCard(new Rect(245, 125, 790, 550), LearnerAccent);
        Text("LEARN BEFORE YOU UPGRADE", 278, 151, 720, 40, titleStyle);
        Text(StarfallCurriculum.Topics[question.Lesson], 278, 205, 720, 34, labelStyle);
        Fill(278, 263, 720, 246, Panel);
        Text(StarfallCurriculum.Teachings[question.Lesson], 302, 284, 670, 102, labelStyle);
        StarfallQuestion example = StarfallCurriculum.CreateSkill(question.Lesson, 0, 271 + question.Lesson);
        Text("EXAMPLE: " + example.Explanation, 302, 407, 670, 84, labelStyle);
        Text("No timer. You can move the cells, ask for a hint, or work through an example together.", 278, 530, 720, 58, smallStyle);
        if (PixelButton("I'M READY", 278, 604, 470, 45, Hex("277c8e"))) DismissQuestionIntro();
        if (PixelButton("BACK", 770, 604, 228, 45, PanelLight)) { phase = Phase.Day; buildPanelOpen = true; }
    }

    private void DrawEqualGroupModel()
    {
        Fill(278, 285, 450, 170, Panel);
        bool share = question.Operation == '/';
        int groups = share ? question.Second : question.First;
        int each = share ? question.Answer : question.Second;
        Text(share ? "SHARE " + question.First + " INTO " + groups + " GROUPS" : groups + " GROUPS OF " + each, 293, 291, 420, 25, smallStyle);
        for (int i = 0; i < groups; i++)
        {
            float x = 294 + i % 3 * 130, y = 323 + i / 3 * 30;
            Fill(x, y, 118, 24, Hex("0b1628"));
            int filled = share ? visualSteps : i < visualSteps ? each : 0;
            for (int j = 0; j < each; j++)
                Fill(x + 5 + j * 10, y + 7, 7, 9, j < filled ? i % 2 == 0 ? Cyan : Gold : Hex("344659"));
        }
        if (visualSteps < VisualStepTarget && !questionExplained)
        {
            if (PixelButton(share ? "SHARE A ROUND" : "BUILD A GROUP", 493, 420, 216, 28, Hex("277c8e")))
            { ShowTeachingHint(); visualSteps++; }
        }
        else Text("COUNT THE CELLS IN EACH GROUP", 294, 420, 414, 28, smallStyle);
    }

    private void DrawStudyAnswerResult()
    {
        OverlayShade(.8f); MenuCard(new Rect(245, 112, 790, 560), LearnerAccent);
        Text(questionSupported ? "LEARNED WITH SUPPORT" : "SOLVED INDEPENDENTLY", 278, 133, 720, 40, titleStyle);
        Text("QUESTION " + studyIndex + "/5 · +" + (questionSupported ? 4 : 10) + " LEARNING XP", 278, 187, 720, 30, smallStyle);
        TextCentered(question.Text.Replace("?", question.Answer.ToString()), 278, 226, 720, 58, hugeStyle);
        DrawTeachingCells();
        Text(question.Explanation, 750, 306, 250, 144, labelStyle);
        Text("Today: " + Mathf.Min(5, learningProfile.DailySolved) + "/5 solved · " + MenuCount(learningProfile.Stars, "cosmetic star") + "\nYour ship materials and combat XP are unchanged.", 278, 495, 720, 68, labelStyle);
        if (PixelButton(studyIndex < 5 ? "NEXT QUESTION" : "SEE MY PROGRESS", 278, 594, 720, 49, Hex("277c8e"))) ContinueStudy();
    }
}
