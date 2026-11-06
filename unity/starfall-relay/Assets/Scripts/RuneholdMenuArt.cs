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
        Fill(0, 0, 1280, 800, Hex("eaf2ff"));
        DrawPixelEllipse(new Vector2(1215, 24), 300, 210, Hex("e4e1ff"));
        DrawPixelEllipse(new Vector2(13, 780), 355, 180, Hex("d5f3f2"));
        for (int i = 0; i < 38; i++)
        {
            Vector2 at = new Vector2((i * 173 + 13) % 1280, (i * 103 + 17) % 800);
            Fill(at.x - 3, at.y, 8, 2, Hex("bdcee8")); Fill(at.x, at.y - 3, 2, 8, Hex("bdcee8"));
        }
        Fill(24, 24, 1232, 752, Hex("f4f8ff"));
        Fill(24, 24, 276, 752, Hex("e2edff"));
        Color[] elements = { Hex("36c7ed"), Hex("ff9b66"), Hex("b294f5"), Hex("75d7ad") };
        for (int i = 0; i < 4; i++) Fill(24 + i * 308, 24, 308, 5, elements[i]);
        MenuText("STARFALL", new Rect(44, 49, 240, 38), 31, Cream, true, true);
        MenuText("RELAY · ELEMENTAL EXPEDITION", new Rect(46, 90, 234, 23), 11, Cyan, true, true);
        if (GUI.Button(new Rect(42, 43, 244, 73), GUIContent.none, GUIStyle.none)) NavigateHub(HubPage.Home);
        Vector2 orbit = new Vector2(161, 211);
        DrawPixelEllipse(orbit, 67, 67, Hex("c2d7fa")); DrawPixelEllipse(orbit, 62, 62, Hex("f8fbff"));
        for (int i = 0; i < 4; i++) DrawMenuPlanet(orbit + new Vector2(i < 2 ? -65 : 65, i % 2 == 0 ? -25 : 25), i, 10, false, false);
        DrawMenuPilot(new Vector2(160, 213), 0, 1.17f);
        MenuText(learningProfile.CadetName, new Rect(44, 282, 238, 26), 20, Cream, true, true);
        MenuText("LEVEL " + astronautLevel + " · " + AscensionTitle, new Rect(44, 311, 240, 21), 11, Cyan, true, true);
        ProgressBar(44, 345, 238, 6, experience / (float)ExperienceNeeded, Hex("36c7ed"));
        int selected = hubPage == HubPage.Lesson || hubPage == HubPage.Practice || hubPage == HubPage.Galaxy || hubPage == HubPage.Results ? 1
            : hubPage == HubPage.Achievements ? 2 : hubPage == HubPage.Progress || hubPage == HubPage.Armory ? 3 : 0;
        HubPage[] destinations = { HubPage.Home, HubPage.Galaxy, HubPage.Achievements, HubPage.Progress };
        string[] names = { "Expedition", "Learn", "Collection", "Pilot" };
        string[] subtitles = { "Your next adventure", "Discover & practise", "Milestones & colors", "Your growing story" };
        int[] icons = { 0, 1, 5, 4 };
        for (int i = 0; i < destinations.Length; i++)
        {
            Rect row = new Rect(40, 380 + i * 76, 244, 66);
            bool active = selected == i && hubPage != HubPage.Settings;
            MenuCard(row, elements[i], active);
            MenuIcon(icons[i], new Vector2(row.x + 17, row.y + 21), 3, MenuColor(elements[i]));
            MenuText(names[i], new Rect(row.x + 60, row.y + 8, 173, 27), 18, Cream, true);
            MenuText(subtitles[i], new Rect(row.x + 60, row.y + 36, 173, 21), 12, Hex("aabbce"));
            if (GUI.Button(row, GUIContent.none, GUIStyle.none)) { PlayRelaySound(4, .55f); NavigateHub(destinations[i]); }
        }
        if (MenuButton("Equipment guide", new Rect(44, 698, 238, 45), Hex("b294f5"))) NavigateHub(HubPage.Armory);
        MenuText("EXPLORE · LEARN · GROW", new Rect(44, 751, 238, 18), 10, Hex("aabbce"), true, true);
        MenuText("FIRE  /  FROST  /  STORM  /  EARTH", new Rect(334, 46, 510, 21), 11, Cyan, true, true);
        MenuText("Night " + night.ToString("00") + "  ·  " + MenuCount(lifetimeKills, "enemy stopped", "enemies stopped") + "  ·  " + MenuCount(learningProfile.Stars, "learning star"), new Rect(334, 74, 680, 24), 13, Hex("b7c8d8"), false, true);
        if (MenuButton("Settings", new Rect(908, 48, 126, 46), Hex("b294f5"), true, hubPage == HubPage.Settings)) NavigateHub(HubPage.Settings);
        if (MenuButton("Play", new Rect(1047, 48, 177, 46), Cyan, true, true)) ResumeExpedition();
        Fill(334, 111, 890, 1, Hex("cfddf0"));
    }

    private void DrawRelayHome()
    {
        HubHeading("A whole universe of possibility.", "Brave the elements. Discover the maths. Build a brighter defense.");
        Rect hero = new Rect(334, 225, 866, 260);
        MenuCard(hero, Cyan);
        Fill(913, 227, 285, 256, Hex("e0ecff"));
        DrawPixelEllipse(new Vector2(1070, 348), 118, 109, Hex("d4e5ff"));
        DrawPixelEllipse(new Vector2(1070, 348), 94, 88, Hex("eaf5ff"));
        DrawElementalMenuRock(new Vector2(979, 267), 26, Hex("36c7ed"));
        DrawElementalMenuRock(new Vector2(1128, 274), 32, Hex("ff9b66"));
        DrawElementalMenuRock(new Vector2(977, 405), 22, Hex("b294f5"));
        DrawElementalMenuRock(new Vector2(1142, 414), 24, Hex("75d7ad"));
        MenuPill("NEXT EXPEDITION · NIGHT " + night, new Rect(358, 244, 290, 26), Gold);
        MenuText(ThreatName(night), new Rect(358, 282, 545, 38), 29, Cream, true, true);
        MenuText(SwarmCount(night).ToString("N0") + " elemental contacts. One extraordinary captain.", new Rect(358, 328, 533, 34), 16, Hex("c4d3df"));
        MenuText("YOUR NEXT MILESTONE", new Rect(358, 374, 177, 20), 10, Cyan, true, true);
        MenuText(NextMilestone(), new Rect(535, 370, 357, 29), 14, Cream, false, true);
        if (MenuButton("LET'S EXPLORE", new Rect(358, 420, 300, 48), Cyan, true, true)) ResumeExpedition();
        if (MenuButton("Practise maths", new Rect(676, 420, 216, 48), Gold)) NavigateHub(HubPage.Practice);
        DrawPixelEllipse(new Vector2(1063, 428), 52, 11, Hex("bbd1f3"));
        DrawMenuPilot(new Vector2(1063, 363), -14, 1.85f);
        MenuPill("CAPTAIN ONLINE", new Rect(991, 451, 145, 23), Mint);
        MenuText("Your learning galaxy", new Rect(334, 505, 640, 30), 21, Cream, true);
        MenuText("Every destination is open for practice", new Rect(853, 510, 347, 23), 12, Hex("b2c4d4"), false, true);
        DrawRouteNodes(540, true);
        RefreshPracticeDate();
        Fill(334, 708, 866, 1, Hex("cfddf0"));
        MenuText("DAILY DISCOVERY", new Rect(334, 716, 145, 22), 10, Gold, true, true);
        ProgressBar(487, 724, 102, 6, Mathf.Min(5, learningProfile.DailySolved) / 5f, Gold);
        MenuText(Mathf.Min(5, learningProfile.DailySolved) + "/5 · Earn a star + paint credit. Grow at your own pace.", new Rect(604, 713, 596, 24), 12, Hex("c3d1de"), false, true);
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
