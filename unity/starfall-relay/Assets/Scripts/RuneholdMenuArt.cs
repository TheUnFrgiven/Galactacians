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
        DrawOuterSpace(); OverlayShade(.4f);
        if (deckTexture != null)
        {
            Color old = GUI.color; GUI.color = new Color(.5f, .7f, .9f, .1f);
            GUI.DrawTexture(new Rect(302, 24, 930, 752), deckTexture, ScaleMode.ScaleAndCrop); GUI.color = old;
        }
        Fill(24, 24, 1232, 752, new Color(.025f, .05f, .09f, .85f));
        Fill(24, 24, 1232, 1, Hex("49647a"));
        Fill(24, 24, 276, 3, LearnerAccent);
        Fill(24, 775, 1232, 1, Hex("2a435b"));
        Fill(24, 27, 276, 748, Hex("0d1b2c")); Fill(299, 27, 1, 748, Hex("2e465d"));
        MenuText("S T A R F A L L", new Rect(45, 48, 240, 37), 26, Cream, true, true);
        MenuText("RELAY  /  MISSION CONTROL", new Rect(46, 88, 234, 23), 11, LearnerAccent, true, true);
        GUI.SetNextControlName("RelayHome");
        if (GUI.Button(new Rect(42, 43, 244, 73), GUIContent.none, GUIStyle.none)) { PlayRelaySound(4, .5f); NavigateHub(HubPage.Home); }
        Vector2 orbit = new Vector2(161, 211);
        DrawPixelEllipse(orbit, 66, 66, Hex("20374c")); DrawPixelEllipse(orbit, 64, 64, Hex("0d2639"));
        DrawPixelEllipse(orbit, 55, 55, Hex("15283c"));
        for (int i = 0; i < 16; i++)
        {
            float angle = i * Mathf.PI * 2 / 16;
            Vector2 at = orbit + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * 64;
            Fill(at.x - 1, at.y - 1, 2, 2, i < 4 ? Gold : Hex("578399"));
        }
        DrawMenuPilot(new Vector2(160, 213), 0, 1.17f);
        MenuText(learningProfile.CadetName, new Rect(44, 282, 238, 26), 20, Cream, true, true);
        MenuText("LEVEL " + astronautLevel + "  /  " + AscensionTitle, new Rect(44, 310, 240, 21), 10, LearnerAccent, true, true);
        ProgressBar(44, 340, 238, 5, experience / (float)ExperienceNeeded, LearnerAccent);
        MenuText("YOUR SHIP  /  ARROWS + ENTER", new Rect(44, 367, 238, 18), 10, Hex("9bb2c8"), true, true);
        int current = hubPage == HubPage.Lesson ? 1 : hubPage == HubPage.Results ? 2 : (int)hubPage;
        for (int i = 0; i < HubLabels.Length; i++)
        {
            Rect row = new Rect(40, 395 + i * 42, 244, 36);
            bool active = current == i, hover = row.Contains(Event.current.mousePosition);
            float blend = MenuHoverAmount(row, hover);
            Color ink = active ? Hex("1c4158") : Color.Lerp(Hex("0d1b2c"), Hex("193247"), blend);
            Fill(row.x, row.y, row.width, row.height, ink);
            if (active) { Fill(row.x, row.y + 7, 3, row.height - 14, LearnerAccent); Fill(row.x + 3, row.y + 1, row.width - 6, 1, Hex("31536a")); }
            if (menuNavPending && hubFocus == i && !active) Fill(row.xMax - 7, row.y + 14, 3, 8, Gold);
            MenuIcon(i, new Vector2(row.x + 16, row.y + 10), 2, active ? LearnerAccent : Hex("9ab3c8"));
            MenuText(HubLabels[i], new Rect(row.x + 46, row.y, 178, row.height), 15, active || hover ? Cream : Hex("b3c4d4"), active, true);
            GUI.SetNextControlName("MenuNav" + i);
            if (GUI.Button(row, GUIContent.none, GUIStyle.none)) { PlayRelaySound(4, .55f); NavigateHub(HubPages[i]); }
        }
        Fill(44, 704, 238, 1, Hex("2b4157"));
        MenuText("RELAY AFTERGLOW", new Rect(44, 718, 170, 19), 10, Gold, true, true);
        for (int i = 0; i < 7; i++)
        {
            float h = reducedMotion || pilotJournal.MusicVolume <= 0 ? 3 : 3 + Mathf.Abs(Mathf.Sin(corePulse * RelayBpm / 60f * Mathf.PI + i * .8f)) * 12;
            Fill(222 + i * 8, 736 - h, 3, h, pilotJournal.MusicVolume <= 0 ? Hex("506177") : LearnerAccent);
        }
        MenuText("[M] return to expedition", new Rect(44, 745, 238, 19), 11, Hex("9db2c5"), false, true);
        MenuText("WAYFARER  /  FLIGHT CONSOLE", new Rect(334, 44, 670, 20), 10, LearnerAccent, true, true);
        MenuText("Night " + night.ToString("00") + "     ·     " + MenuCount(lifetimeKills, "enemy stopped", "enemies stopped") + "     ·     " + MenuCount(learningProfile.Stars, "learning star"), new Rect(334, 72, 680, 24), 13, Hex("b7c8d8"), false, true);
        if (MenuButton("Return to deck  [M]", new Rect(1040, 49, 184, 39), LearnerAccent)) ResumeExpedition();
        Fill(334, 111, 890, 1, Hex("293f55"));
    }

    private void DrawRelayHome()
    {
        HubHeading("Make your next great leap.", "Explore, learn and engineer a defense that grows with you.");
        Rect hero = new Rect(334, 225, 866, 260);
        MenuCard(hero, LearnerAccent);
        if (deckTexture != null)
        {
            Color old = GUI.color; GUI.color = new Color(.65f, .85f, 1, .58f);
            GUI.DrawTexture(new Rect(906, 227, 292, 256), deckTexture, ScaleMode.ScaleAndCrop); GUI.color = old;
        }
        for (int i = 0; i < 12; i++) Fill(834 + i * 10, 227, 10, 256, new Color(.067f, .141f, .22f, (12 - i) / 12f));
        MenuPill("NEXT TRANSMISSION  /  NIGHT " + night, new Rect(358, 244, 258, 23), Gold);
        MenuText(ThreatName(night), new Rect(358, 281, 555, 38), 29, Cream, true, true);
        MenuText(SwarmCount(night).ToString("N0") + " contacts incoming. Your ship needs its captain.", new Rect(358, 326, 520, 30), 15, Hex("c4d3df"));
        MenuText("NEXT MILESTONE", new Rect(358, 369, 130, 20), 10, LearnerAccent, true, true);
        MenuText(NextMilestone(), new Rect(494, 366, 390, 25), 14, Cream, false, true);
        if (MenuButton("Continue expedition  >", new Rect(358, 426, 304, 40), LearnerAccent, true, true)) ResumeExpedition();
        if (MenuButton("Learn + practise", new Rect(676, 426, 216, 40), Gold)) NavigateHub(HubPage.Practice);
        Vector2 platform = new Vector2(1054, 425);
        DrawPixelEllipse(platform, 63, 14, Hex("0b2032"));
        DrawPixelEllipse(platform, 56, 9, new Color(LearnerAccent.r, LearnerAccent.g, LearnerAccent.b, .25f));
        DrawMenuPilot(new Vector2(1054, 366), -14, 1.85f);
        MenuPill("CAPTAIN ONLINE", new Rect(983, 451, 145, 21), LearnerAccent);
        MenuText("Your learning galaxy", new Rect(334, 505, 640, 30), 21, Cream, true);
        MenuText("Every destination is open for practice", new Rect(853, 510, 347, 23), 12, Hex("b2c4d4"), false, true);
        DrawRouteNodes(540, true);
        RefreshPracticeDate();
        Fill(334, 708, 866, 1, Hex("2b445c"));
        MenuText("DAILY SIGNAL", new Rect(334, 716, 125, 22), 10, Gold, true, true);
        ProgressBar(463, 724, 126, 6, Mathf.Min(5, learningProfile.DailySolved) / 5f, Gold);
        MenuText(Mathf.Min(5, learningProfile.DailySolved) + "/5  ·  Daily star + paint credit. Keep learning at your pace.", new Rect(604, 713, 596, 22), 12, Hex("c3d1de"), false, true);
    }
}
