using UnityEngine;

public sealed partial class RuneholdGame
{
    private void DrawRelayMenuShell()
    {
        DrawOuterSpace(); OverlayShade(.3f);
        // The deck remains visible through the mission console, linking menus to play.
        if (deckTexture != null)
        {
            Color old = GUI.color; GUI.color = new Color(.55f, .72f, .9f, .16f);
            GUI.DrawTexture(new Rect(302, 24, 930, 752), deckTexture, ScaleMode.ScaleAndCrop);
            GUI.color = old;
        }
        Fill(24, 24, 1232, 752, new Color(.025f, .05f, .09f, .85f));
        Fill(24, 24, 1232, 2, LearnerAccent);
        Fill(24, 774, 1232, 2, Hex("2a435b"));
        Fill(24, 26, 276, 748, Hex("101e31"));
        Fill(299, 26, 1, 748, Hex("35536a"));
        for (int i = 0; i < 5; i++) Fill(28 + i * 11, 29, 7, 3, i < 3 ? LearnerAccent : Hex("29435b"));
        Text("MISSION CONTROL", 44, 43, 238, 22, new GUIStyle(smallStyle) { fontSize = 11, normal = { textColor = LearnerAccent }, wordWrap = false });
        if (GUI.Button(new Rect(42, 69, 242, 48), "", GUIStyle.none)) { hubPage = HubPage.Home; hubFocus = 0; }
        Text("STARFALL", 42, 64, 242, 42, new GUIStyle(titleStyle) { fontSize = 35, wordWrap = false });
        Text("R E L A Y", 44, 105, 238, 27, new GUIStyle(labelStyle) { fontSize = 17, normal = { textColor = Gold } });
        DrawPixelEllipse(new Vector2(161, 218), 65, 65, Hex("233c52"));
        DrawPixelEllipse(new Vector2(161, 218), 62, 62, Hex("102b40"));
        DrawPixelEllipse(new Vector2(161, 218), 53, 53, Hex("152238"));
        for (int i = 0; i < 12; i++)
        {
            float angle = (i * 30 - 90) * Mathf.Deg2Rad;
            Vector2 point = new Vector2(161, 218) + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * 63;
            Fill(point.x - 2, point.y - 2, 4, 4, i < 3 ? Gold : LearnerAccent * .65f);
        }
        DrawMenuPilot(new Vector2(160, 219), 0, 1.17f);
        TextCentered(learningProfile.CadetName + "  /  LV " + astronautLevel, 43, 282, 240, 27, new GUIStyle(labelStyle) { fontSize = 16 });
        ProgressBar(62, 314, 202, 6, experience / (float)ExperienceNeeded, LearnerAccent);
        for (int i = 0; i < HubLabels.Length; i++)
        {
            Rect row = new Rect(42, 337 + i * 48, 240, 39);
            bool active = HubPages[i] == hubPage;
            bool focused = i == hubFocus;
            bool hover = row.Contains(Event.current.mousePosition);
            Fill(row.x, row.y, row.width, row.height, active || hover ? Hex("20445b") : focused ? Hex("1b334a") : Hex("14283c"));
            if (active || focused || hover) Fill(row.x, row.y, 3, row.height, active ? LearnerAccent : Gold);
            Text((i + 1).ToString("00"), row.x + 12, row.y + 8, 25, 24, new GUIStyle(smallStyle) { fontSize = 10, normal = { textColor = active ? LearnerAccent : Hex("7d99b2") } });
            Text(HubLabels[i], row.x + 43, row.y + 3, 189, 33, new GUIStyle(labelStyle) { fontSize = 14, wordWrap = false });
            if (GUI.Button(row, "", GUIStyle.none))
            { hubFocus = i; if (i == 0) ResumeExpedition(); else hubPage = HubPages[i]; }
        }
        Fill(44, 689, 238, 1, Hex("30465d"));
        Text("RELAY AFTERGLOW", 44, 705, 170, 23, new GUIStyle(smallStyle) { fontSize = 11, normal = { textColor = Gold } });
        for (int i = 0; i < 7; i++)
        {
            float motion = reducedMotion || pilotJournal.MusicVolume <= 0 ? 3 : 4 + Mathf.Abs(Mathf.Sin(corePulse * RelayBpm / 60f * Mathf.PI + i * .8f)) * 15;
            Fill(220 + i * 8, 726 - motion, 4, motion, pilotJournal.MusicVolume <= 0 ? Hex("435165") : LearnerAccent);
        }
        Text("[M] return to deck · 96 BPM", 44, 740, 240, 23, new GUIStyle(smallStyle) { fontSize = 11 });
        Text("EXPEDITION  /  " + AscensionTitle, 334, 43, 730, 24, new GUIStyle(labelStyle) { fontSize = 13, normal = { textColor = LearnerAccent } });
        Text("NIGHT " + night.ToString("00") + "   ·   " + lifetimeKills.ToString("N0") + " CONTACTS STOPPED   ·   " + learningProfile.Stars + " LEARNING STARS", 334, 72, 720, 26,
            new GUIStyle(smallStyle) { fontSize = 12 });
        if (PixelButton("TO THE DECK  [M]", 1052, 47, 172, 39, Hex("256679"))) ResumeExpedition();
        Fill(334, 105, 890, 1, Hex("2b445c"));
    }

    private void DrawRelayHome()
    {
        HubHeading("YOUR NEXT GREAT LEAP STARTS HERE.", "Explore the deck. Engineer with math. Hold the line. Your ship and power keep growing.");
        Rect hero = new Rect(334, 225, 866, 260);
        ConsolePanel(hero, LearnerAccent, Hex("14263a"));
        if (deckTexture != null)
        {
            Color old = GUI.color; GUI.color = new Color(.7f, .85f, 1, .66f);
            GUI.DrawTexture(new Rect(852, 228, 345, 253), deckTexture, ScaleMode.ScaleAndCrop);
            GUI.color = old;
        }
        // A stepped shadow keeps text crisp and lets the pixel illustration breathe.
        Fill(338, 228, 514, 253, Hex("14263a"));
        for (int i = 0; i < 8; i++) Fill(852 + i * 10, 228, 10, 253, new Color(.078f, .149f, .227f, (8 - i) / 9f));
        Text("ACTIVE TRANSMISSION  /  NIGHT " + night, 360, 242, 520, 26, new GUIStyle(hubCopy) { fontSize = 12, normal = { textColor = Gold } });
        Text(ThreatName(night), 358, 280, 562, 42, new GUIStyle(hubTitle) { fontSize = 29 });
        Text(SwarmCount(night).ToString("N0") + " contacts incoming. The relay needs its captain.", 360, 330, 518, 26, hubCopy);
        Text("NEXT MILESTONE  /  " + NextMilestone(), 360, 367, 524, 42, new GUIStyle(hubCopy) { fontSize = 13 });
        if (PixelButton("CONTINUE EXPEDITION  >", 360, 427, 316, 38, Hex("26748a"))) ResumeExpedition();
        if (PixelButton("LEARN + PRACTISE", 690, 427, 218, 38, Hex("705b38"))) hubPage = HubPage.Practice;
        Vector2 platform = new Vector2(1045, 426);
        DrawPixelEllipse(platform, 62, 15, Hex("132a3c"));
        DrawPixelEllipse(platform, 54, 10, new Color(LearnerAccent.r, LearnerAccent.g, LearnerAccent.b, .24f));
        DrawMenuPilot(new Vector2(1042, 369), -14, 1.85f);
        TextCentered("CAPTAIN ONLINE", 940, 454, 226, 23, new GUIStyle(hubCopy) { fontSize = 11, normal = { textColor = LearnerAccent } });
        Text("CHART YOUR LEARNING GALAXY", 337, 505, 700, 27, new GUIStyle(hubLabel) { fontSize = 18 });
        DrawRouteNodes(544, true);
        RefreshPracticeDate();
        Fill(338, 709, 858, 1, Hex("2b445c"));
        Text("TODAY'S SIGNAL", 338, 718, 164, 23, new GUIStyle(hubCopy) { fontSize = 11, normal = { textColor = Gold } });
        Text(Mathf.Min(5, learningProfile.DailySolved) + "/5 solves · earn a daily star + paint credit. Keep exploring and upgrading at your pace.", 504, 716, 690, 27,
            new GUIStyle(hubCopy) { fontSize = 12 });
    }
}
