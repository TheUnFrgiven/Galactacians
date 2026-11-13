using UnityEngine;

public sealed partial class RuneholdGame
{
    private void NavigateHub(HubPage page)
    {
        hubPage = page; menuNavPending = false;
        hubFocus = page == HubPage.Lesson ? 1 : page == HubPage.Results ? 2 : Mathf.Clamp((int)page, 0, 6);
        menuClearFocus = true;
    }

    private void DrawRelayMenuShell()
    {
        Fill(0, 0, 1280, 800, Hex("edf4ff"));
        DrawMenuConstellation(new Rect(314, 120, 926, 660));
        PixelPanel(new Rect(20, 20, 286, 760), Cyan, true);
        PixelSurface(new Rect(32, 32, 262, 348), Hex("deedf7"), 6);
        Color[] colors = { Cyan, Gold, Hex("bca4f2"), Mint };
        DrawStarfallWordmark(new Vector2(44, 50));
        UiText("A maths space adventure", new Rect(44, 92, 238, 54), 22, false, UiMuted);
        DrawPortraitDock(new Vector2(163, 214), 77);
        DrawMenuPilot(new Vector2(163, 212), 0, 1.3f);
        UiText(learningProfile.CadetName, new Rect(44, 296, 238, 36), 26, true);
        UiText("Space explorer · Level " + astronautLevel, new Rect(44, 335, 238, 28), 19, false, UiMuted);
        HubPage[] pages = { HubPage.Home, HubPage.Galaxy, HubPage.Achievements, HubPage.Progress };
        string[] labels = { "My adventure", "Learn maths", "My rewards", "My progress" };
        int[] icons = { 0, 1, 5, 4 };
        int selected = hubPage == HubPage.Galaxy || hubPage == HubPage.Lesson || hubPage == HubPage.Practice || hubPage == HubPage.Results ? 1 : hubPage == HubPage.Achievements ? 2 : hubPage == HubPage.Progress ? 3 : 0;
        for (int i = 0; i < 4; i++)
        {
            Rect row = new Rect(38, 393 + i * 74, 250, 62);
            bool current = selected == i && hubPage != HubPage.Settings && hubPage != HubPage.Armory;
            UiCard(row, colors[i], current);
            DrawClearIcon(icons[i], new Vector2(row.x + 16, row.y + 18), 3.3f, UiBlue);
            UiText(labels[i], new Rect(row.x + 58, row.y, 180, row.height), 22, true);
            if (GUI.Button(row, GUIContent.none, GUIStyle.none)) { NavigateHub(pages[i]); PlayRelaySound(4, .55f); }
        }
        if (MenuButton("My space tools", new Rect(44, 706, 238, 54), Cyan)) NavigateHub(HubPage.Armory);
        UiText("Your spaceship is waiting", new Rect(334, 39, 350, 31), 23, true, UiBlue);
        UiText("Learn at your own pace.", new Rect(334, 76, 350, 26), 20, false, UiMuted);
        DrawAskHelp(new Rect(702, 41, 185, 60));
        if (MenuButton("Settings", new Rect(905, 41, 139, 60), Hex("bca4f2"))) NavigateHub(HubPage.Settings);
        if (MenuButton("Play", new Rect(1062, 41, 162, 60), Cyan, true, true)) ResumeExpedition();
        Fill(334, 117, 890, 2, UiLine);
    }

    private void DrawRelayHome()
    {
        HubHeading("Ready, Captain " + learningProfile.CadetName + "?", "Explore space. Learn maths. Help your spaceship grow.");
        UiCard(new Rect(334, 236, 866, 290), Cyan);
        UiText("A little maths. A lot of possibility.", new Rect(358, 255, 520, 70), 31, true, UiBlue);
        UiText("Collect resources, solve an energy puzzle and build something brilliant.", new Rect(358, 330, 510, 75), 25);
        if (MenuButton("Play in space", new Rect(358, 432, 500, 68), Cyan, true, true)) ResumeExpedition();
        DrawPortraitDock(new Vector2(1050, 370), 104);
        DrawElementSprite(1, new Vector2(965, 291), 58, -15);
        DrawElementSprite(0, new Vector2(1130, 295), 64, 10);
        DrawElementSprite(2, new Vector2(1138, 437), 52, 12);
        DrawElementSprite(3, new Vector2(956, 444), 44, -12);
        DrawMenuPilot(new Vector2(1052, 374), -12, 2.1f);
        string[] titles = { "1. Explore", "2. Learn", "3. Build" };
        string[] copy = { "Find metal and crystals.", "Try a maths puzzle.", "Power up your ship." };
        for (int i = 0; i < 3; i++)
        {
            Rect card = new Rect(334 + i * 292, 554, 282, 146); UiCard(card, i == 1 ? Gold : Cyan);
            UiText(titles[i], new Rect(card.x + 20, card.y + 14, 242, 36), 26, true);
            UiText(copy[i], new Rect(card.x + 20, card.y + 57, 242, 56), 22, false, UiMuted);
            UiText("Tap to " + (i == 0 ? "explore" : i == 1 ? "practise" : "see tools") + "  >", new Rect(card.x + 20, card.y + 112, 242, 25), 18, true, UiBlue);
            if (GUI.Button(card, GUIContent.none, GUIStyle.none)) { PlayRelaySound(4, .55f); if (i == 0) ResumeExpedition(); else NavigateHub(i == 1 ? HubPage.Practice : HubPage.Armory); }
        }
        RefreshPracticeDate();
        UiText("Today's learning: " + Mathf.Min(5, learningProfile.DailySolved) + " of 5 puzzles", new Rect(334, 722, 530, 32), 21, true);
        UiText("Earn a star and a new color credit.", new Rect(868, 721, 332, 50), 18, false, UiMuted);
    }
}
