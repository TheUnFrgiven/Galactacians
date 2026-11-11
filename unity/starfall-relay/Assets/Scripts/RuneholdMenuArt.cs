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
        UiRound(new Rect(20, 20, 286, 760), Hex("dceaff"), 22);
        Color[] colors = { Cyan, Gold, Hex("bca4f2"), Mint };
        UiText("STARFALL", new Rect(44, 43, 238, 42), 32, true);
        UiText("A maths space adventure", new Rect(44, 92, 238, 54), 22, false, UiMuted);
        UiDot(new Vector2(163, 215), 67, Hex("f4f9ff"));
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
        UiDot(new Vector2(1050, 370), 108, Hex("e2eeff"));
        DrawElementalMenuRock(new Vector2(964, 285), 22, Cyan);
        DrawElementalMenuRock(new Vector2(1129, 303), 25, Hex("ffac7d"));
        DrawElementalMenuRock(new Vector2(1132, 445), 20, Mint);
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
    private void DrawElementalMenuRock(Vector2 at, float radius, Color element)
    {
        for (int i = 3; i > 0; i--)
        {
            float size = radius * (.5f - i * .09f);
            Vector2 trail = at + new Vector2(i * radius * .65f, -i * radius * .45f);
            Fill(trail.x - size, trail.y - size, size * 2, size * 2, Color.Lerp(element, Color.white, .45f + i * .12f));
        }
        DrawPixelEllipse(at, radius + 7, radius + 6, Color.Lerp(element, Color.white, .73f));
        float[] silhouette = { .35f, .62f, .82f, .94f, 1, .96f, .84f, .72f, .44f };
        for (int y = 0; y < silhouette.Length; y++)
        {
            float width = silhouette[y] * radius;
            Fill(at.x - width, at.y - radius + y * radius * 2 / 9, width * 2, radius * 2 / 9 + 1, Color.Lerp(element, Hex("435d87"), .25f));
            Fill(at.x - width, at.y - radius + y * radius * 2 / 9, width * 1.5f, radius * 2 / 9 + 1, element);
        }
        Fill(at.x - radius * .46f, at.y - radius * .42f, radius * .4f, radius * .26f, Color.Lerp(element, Color.white, .5f));
        Fill(at.x + radius * .12f, at.y + radius * .19f, radius * .44f, radius * .3f, Color.Lerp(element, Hex("435d87"), .48f));
    }

}
