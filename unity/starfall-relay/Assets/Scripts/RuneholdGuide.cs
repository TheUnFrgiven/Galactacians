using System;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private static readonly Rect GuideHelpAction = new Rect(250, 702, 420, 72);
    private bool guideOpen, guideIsTutorial;
    private string[] guidePages = Array.Empty<string>();
    private int guidePage, guideSalvageBaseline, guideBuildBaseline, guideStartNight;
    private Vector2 guideMoveOrigin;
    private Action guideFinished;

    private void InitializeGuide()
    {
        learningProfile.GuideStep = Mathf.Clamp(learningProfile.GuideStep, 0, 9);
        guideMoveOrigin = pilotPosition;
        guideSalvageBaseline = pilotJournal.Salvage;
        guideBuildBaseline = InstalledRanks;
        guideStartNight = night;
    }

    private void OpenBot(string[] pages, Action finished = null, bool tutorial = false)
    {
        guidePages = pages; guidePage = 0; guideFinished = finished;
        guideIsTutorial = tutorial; guideOpen = true;
        touchMove = Vector2.zero; touchBoost = touchNova = false; pilotWalking = false;
    }

    private void FinishBot()
    {
        Action callback = guideFinished;
        guideOpen = false; guideFinished = null; guideIsTutorial = false;
        callback?.Invoke();
    }

    private void GuideAdvance(int step)
    {
        learningProfile.GuideStep = step;
        if (step == 1) guideMoveOrigin = pilotPosition;
        if (step == 2) guideSalvageBaseline = pilotJournal.Salvage;
        if (step == 5) guideBuildBaseline = InstalledRanks;
        if (step == 7) guideStartNight = night;
        if (step >= 9) learningProfile.GuideVersion = 1;
        SaveLearningProfile();
    }

    private void TutorialBot(int next, params string[] pages) => OpenBot(pages, () => GuideAdvance(next), true);

    private bool UpdateGuide()
    {
        if (guideOpen)
        {
            if (Input.GetKeyDown(KeyCode.Return)) { if (guidePage + 1 < guidePages.Length) guidePage++; else FinishBot(); }
            // Closing a tutorial explanation keeps its task; skipping the whole tutorial is explicit.
            else if (Input.GetKeyDown(KeyCode.Escape)) FinishBot();
            return true;
        }
        if (learningProfile.GuideVersion >= 1 || studySession || menuOpen || pauseOpen) return false;
        switch (learningProfile.GuideStep)
        {
            case 0:
                TutorialBot(1, "Hi! I'm Bot. I'll explain your ship, your tools and the maths. You stay in control of the astronaut.",
                    "Drag the Move stick to walk. Your Blaster aims and shoots by itself. Try walking a little now."); break;
            case 1:
                if (Vector2.Distance(pilotPosition, guideMoveOrigin) >= 90)
                    TutorialBot(2, "Nice! Metal and Crystal are the two resources. Walk over a pile to collect it. The counters at the top show what you have.",
                        "The small signs stay with the objects. Metal is blue. Crystal is yellow. Collect either one to try it.");
                break;
            case 2:
                if (pilotJournal.Salvage > guideSalvageBaseline || nodes.TrueForAll(n => n.Collected))
                    TutorialBot(3, "Now open Build & upgrade. Every tool shows its job, level and cost. You decide what to spend your Metal and Crystal on.",
                        "Tower shoots meteors. Shield absorbs damage. Collector gives more resources. Blaster, Drones and Repair help in different ways.");
                break;
            case 3:
                if (buildPanelOpen) TutorialBot(4, "Compare the cost with your counters. Start with a Tower if you do not have one. You can add a Tower or make installed Towers stronger.",
                    "Choose Solve & upgrade when you can afford it. Resources are only spent after you finish its maths puzzle.");
                break;
            case 4:
                if (phase == Phase.Quiz) TutorialBot(5, "This is an energy puzzle. Read the sign, use the cells or groups, then enter your answer. There is no timer.",
                    "A hint or a worked example can help. Your ship waits safely while you learn. Finish this puzzle to power up the tool.");
                break;
            case 5:
                if (phase == Phase.UpgradeReveal || InstalledRanks > guideBuildBaseline)
                    TutorialBot(6, "Your tool is ready! Now look at Health and Shield. Shield takes damage first and recharges before every night.",
                        "Health damage stays between rounds. Dawn restores only 10 Health. Upgrading Shield gives more protection, but does not heal Health.");
                break;
            case 6:
                if (raidBriefOpen) TutorialBot(7, "Each night brings more meteors. This guide compares your tools with the next shower. Upgrading before it gets too hard is your choice.",
                    "Day has no time limit. Check your resources, improve a tool if you can, then choose Start the shower when you are ready.");
                break;
            case 7:
                if (phase == Phase.Night) TutorialBot(8, "Here they come! Move with the stick. Your Blaster, Towers and Drones shoot automatically. Boost helps you move quickly.",
                    "Blast clears nearby meteors when its energy reaches 100%. Energy pickups recharge Blast. Protect the ship until the shower ends.");
                break;
            case 8:
                if (phase == Phase.Dawn || night > guideStartNight)
                    TutorialBot(9, "You made it! Collect the supplies. Your tools and learning stay with you. Health gains only 10; Shield recharges before the next night.",
                        "The next upgrades cost more, and later lessons use new maths. Choose what to buy rather than spending everything at once.",
                        "You can practise in Learn maths, see your progress and earn colors. My tutorial is finished. Tap Ask for help any time you need me.");
                break;
        }
        return guideOpen;
    }

    private void OpenResourceHelp(Upgrade kind)
    {
        UpgradeCost(kind, out int metal, out int gems);
        OpenBot(new[] { UpgradeName(kind) + " costs " + metal + " Metal and " + gems + " Crystal. You have " + alloy + " Metal and " + crystal + " Crystal.",
            "Move to the piles and walk over them to collect resources. Collector increases what each pile gives. Night rewards bring more supplies when today's piles are gone." });
    }

    private void OpenContextHelp()
    {
        if (guideOpen) return;
        if (phase == Phase.Quiz)
        {
            OpenBot(new[] { "Read the maths sign first. " + StarfallCurriculum.Teachings[question.Lesson],
                "Use the answer pad or choices. For help with this exact puzzle, choose Show hint or Work together. There is no timer, and the ship is paused." }); return;
        }
        if (buildPanelOpen) { OpenResourceHelp(selectedUpgrade); return; }
        if (phase == Phase.UpgradeReveal) { OpenBot(new[] { UpgradeName(selectedUpgrade) + " has been upgraded. The new power is shown here. Choose Back to my spaceship to continue." }); return; }
        if (raidBriefOpen || phase == Phase.Warning)
        { OpenBot(new[] { "More meteors need stronger tools. Use the preparation guide to decide whether to upgrade before the next night. Shield refills when the night is launched; Health does not." }); return; }
        if (phase == Phase.Night)
        { OpenBot(new[] { "Move with the stick. Your weapons fire automatically. Tap Boost to move quickly and Blast when it reaches 100%.",
            "Shield absorbs hits first. Once it is empty, meteors damage Health. Repair can slowly heal Health if you bought it. Energy pickups recharge Blast, not Health." }); return; }
        if (phase == Phase.Dawn)
        { OpenBot(new[] { "Collect these supplies once to start the next day. Health gains only 10. Tools, resources and learning continue into the next round." }); return; }
        if (phase == Phase.Defeat)
        { OpenBot(new[] { "You can prepare and try this night again. Your tools and completed maths are kept. The retry starts with the Health you had before this shower, not a free full heal.",
            "A stronger Shield can absorb more hits next time. You can also improve Tower, Blaster or Drones to stop meteors sooner." }); return; }
        if (menuOpen)
        { OpenBot(new[] { "My adventure returns to the ship. Learn maths has lessons and practice. My rewards has badges and colors. My progress shows what you have learned.",
            "Play whenever you are ready. If you are learning the controls, I will guide you on the ship. Ask for help works here and during the game." }); return; }
        OpenBot(new[] { "You move the astronaut yourself with the stick. Walk over Metal and Crystal to collect them. Tap a building's sign or Build & upgrade to inspect tools.",
            "Tower shoots. Shield protects. Collector gathers more. Blaster and Drones attack. Repair heals Health during a night.",
            "Health carries over with only 10 restored at dawn. Shield recharges before each night. Spend resources on the protection and power you need next." });
    }

    private void DrawAskHelp(Rect rect)
    {
        if (MenuButton("Ask for help", rect, Cyan)) OpenContextHelp();
    }

    private void DrawGuideFooter()
    {
        UiCard(GuideHelpAction, Cyan);
        DrawBotPortrait(new Rect(263, 710, 52, 55));
        UiText("Ask for help", new Rect(326, 710, 323, 31), 23, true);
        UiText("Bot can explain", new Rect(326, 747, 323, 22), 18, false, UiMuted);
        if (GUI.Button(GuideHelpAction, GUIContent.none, GUIStyle.none)) OpenContextHelp();
    }

    private void DrawBotPortrait(Rect box)
    {
        Matrix4x4 old = GUI.matrix;
        GUI.matrix *= Matrix4x4.TRS(new Vector3(box.x, box.y, 0), Quaternion.identity, new Vector3(box.width / 100, box.height / 115, 1));
        UiRound(new Rect(25, 73, 50, 30), Hex("67bedc"), 12);
        UiDot(new Vector2(50, 87), 8, Hex("fff0b5"));
        UiStroke(new Vector2(50, 13), new Vector2(50, 26), 5, Hex("79cfe1"));
        UiDot(new Vector2(50, 10), 7, Gold);
        UiRound(new Rect(5, 40, 15, 26), Hex("62b5d9"), 5);
        UiRound(new Rect(80, 40, 15, 26), Hex("62b5d9"), 5);
        UiRound(new Rect(16, 24, 68, 57), Hex("d9eff6"), 16);
        UiRound(new Rect(22, 30, 56, 44), Hex("174d77"), 12);
        bool blink = !reducedMotion && corePulse % 5 < .12f;
        if (blink) { UiStroke(new Vector2(31, 48), new Vector2(39, 48), 4, Cyan); UiStroke(new Vector2(61, 48), new Vector2(69, 48), 4, Cyan); }
        else { UiDot(new Vector2(35, 47), 6, Cyan); UiDot(new Vector2(65, 47), 6, Cyan); }
        UiStroke(new Vector2(40, 61), new Vector2(50, 65), 3, Color.white); UiStroke(new Vector2(50, 65), new Vector2(60, 61), 3, Color.white);
        UiStroke(new Vector2(28, 87), new Vector2(14, 94), 6, Hex("79cfe1")); UiStroke(new Vector2(72, 87), new Vector2(86, 94), 6, Hex("79cfe1"));
        GUI.matrix = old;
    }

    private void DrawGuideTaskHint()
    {
        if (!FieldControlsAvailable || learningProfile.GuideVersion >= 1) return;
        string[] tasks = { "Meet Bot", "Try moving", "Collect a resource", "Open Build & upgrade", "Choose an upgrade", "Finish the puzzle", "Prepare for night", "Start the shower", "Protect the ship", "Tutorial complete" };
        UiCard(new Rect(24, 112, 316, 82), Cyan); DrawBotPortrait(new Rect(36, 125, 49, 56));
        UiText(tasks[Mathf.Clamp(learningProfile.GuideStep, 0, 9)], new Rect(99, 125, 226, 55), 22, true);
    }

    private void DrawGuideDialogue()
    {
        if (!guideOpen || guidePages.Length == 0) return;
        OverlayShade(.52f);
        Rect panel = new Rect(64, 404, 1152, 340);
        UiRound(panel, Hex("7ab9df"), 14);
        UiRound(new Rect(68, 408, 1144, 332), Hex("163554"), 11);
        UiRound(new Rect(84, 428, 195, 290), Hex("224969"), 10);
        DrawBotPortrait(new Rect(100, 466, 163, 206));
        UiText("Bot", new Rect(306, 425, 800, 43), 30, true, Gold);
        UiText(guidePages[guidePage], new Rect(306, 481, 874, 160), 26, false, Hex("f4f8ff"));
        if (MenuButton("Back", new Rect(306, 664, 148, 60), Cyan, guidePage > 0)) guidePage--;
        bool math = phase == Phase.Quiz && !questionExplained && !questionResolved && !questionIntro;
        if (math)
        {
            if (MenuButton("Show hint", new Rect(470, 664, 228, 60), Cyan)) { ShowTeachingHint(); FinishBot(); }
            if (MenuButton("Work together", new Rect(714, 664, 228, 60), Gold)) { ExplainQuestion(); FinishBot(); }
        }
        else
        {
            UiText((guidePage + 1) + " / " + guidePages.Length, new Rect(470, 664, 320, 60), 20, false, Color.white, TextAnchor.MiddleCenter);
            if (!guideIsTutorial && MenuButton("Close", new Rect(804, 664, 138, 60), Cyan)) FinishBot();
        }
        if (MenuButton(guidePage + 1 < guidePages.Length ? "Next" : "Continue", new Rect(958, 664, 222, 60), Cyan, true, true))
        { if (guidePage + 1 < guidePages.Length) guidePage++; else FinishBot(); }
        if (guideIsTutorial && MenuButton("End tutorial", new Rect(1010, 346, 206, 46), Cyan)) { guideFinished = null; guideOpen = false; guideIsTutorial = false; GuideAdvance(9); }
    }
}
