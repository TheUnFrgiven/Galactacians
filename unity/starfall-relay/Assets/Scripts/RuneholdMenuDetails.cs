using UnityEngine;

public sealed partial class RuneholdGame
{
    private float menuMusicRestore = .32f, menuEffectsRestore = .55f;
    private string menuSaveNote = "";
    private Color menuSaveColor;
    private void SaveMenuPreferences()
    {
        learningProfile.CadetName = learningProfile.CadetName.Trim(); learningProfile.Validate();
        bool profileSaved = SaveLearningProfile(), journalSaved = SavePilotJournal();
        bool success = profileSaved && journalSaved;
        menuSaveNote = !CanPersistProgress ? "Preferences applied to this preview." : success ? "Preferences saved. You're ready to fly." : "Couldn't save preferences. Please try again.";
        menuSaveColor = !CanPersistProgress || success ? Mint : Ember;
        menuSavedUntil = Time.unscaledTime + 4;
    }
    private static float ToggleMenuVolume(float volume, ref float previous)
    {
        if (volume > .001f) { previous = volume; return 0; }
        return previous;
    }

    private void DrawPolishedSettings()
    {
        HubHeading("Make yourself at home.", "Tune your ship's console, controls and sound. Your expedition is saved locally.");
        MenuCard(new Rect(337, 235, 860, 90), LearnerAccent);
        MenuIcon(4, new Vector2(360, 265), 3, LearnerAccent);
        MenuText("Pilot name", new Rect(401, 250, 140, 25), 18, Cream, true);
        MenuText("Up to 20 characters", new Rect(401, 280, 150, 19), 12, Hex("afc4d6"));
        Rect name = new Rect(568, 256, 600, 43);
        Fill(name.x, name.y, name.width, name.height, menuNameEditing ? LearnerAccent : Hex("40576d"));
        Fill(name.x + 1, name.y + 1, name.width - 2, name.height - 2, Hex("0a1b2e"));
        GUIStyle input = MenuType(20, Cream);
        input.padding = new RectOffset(13, 13, 0, 0); input.wordWrap = false;
        Event inputEvent = Event.current;
        bool finishName = menuNameEditing && inputEvent.type == EventType.KeyDown &&
            (inputEvent.keyCode == KeyCode.Return || inputEvent.keyCode == KeyCode.KeypadEnter || inputEvent.keyCode == KeyCode.Escape || inputEvent.character == '\n' || inputEvent.character == '\r');
        if (finishName) inputEvent.Use();
        GUI.SetNextControlName("CadetName");
        Color oldSelection = GUI.skin.settings.selectionColor, oldCursor = GUI.skin.settings.cursorColor;
        GUI.skin.settings.selectionColor = new Color(LearnerAccent.r, LearnerAccent.g, LearnerAccent.b, .35f);
        GUI.skin.settings.cursorColor = MenuInk;
        learningProfile.CadetName = GUI.TextField(name, learningProfile.CadetName, 20, input);
        GUI.skin.settings.selectionColor = oldSelection; GUI.skin.settings.cursorColor = oldCursor;
        if (finishName)
        {
            GUIUtility.keyboardControl = 0; GUI.FocusControl(""); menuNameEditing = false;
            SaveMenuPreferences();
        }
        MenuCard(new Rect(337, 345, 418, 307), LearnerAccent);
        MenuText("PLAY YOUR WAY", new Rect(359, 361, 373, 22), 11, LearnerAccent, true, true);
        MenuText("Less motion", new Rect(359, 407, 230, 25), 17, Cream, true);
        MenuText("Quiet movement and menu effects", new Rect(359, 434, 245, 33), 12, Hex("b2c5d6"));
        if (MenuButton(reducedMotion ? "On" : "Off", new Rect(639, 412, 92, 34), reducedMotion ? LearnerAccent : Hex("465c71"), true, reducedMotion))
        { reducedMotion = !reducedMotion; learningProfile.ReducedMotion = reducedMotion; SaveLearningProfile(); }
        Fill(359, 481, 372, 1, Hex("293f54"));
        MenuText("Answer input", new Rect(359, 499, 235, 25), 17, Cream, true);
        MenuText("Choose how to answer questions", new Rect(359, 526, 240, 33), 12, Hex("b2c5d6"));
        if (MenuButton(learningProfile.TypedAnswers ? "Number pad" : "Choices", new Rect(625, 504, 106, 34), LearnerAccent))
        { learningProfile.TypedAnswers = !learningProfile.TypedAnswers; SaveLearningProfile(); }
        Fill(359, 571, 372, 1, Hex("293f54"));
        MenuText("Landscape play", new Rect(359, 590, 230, 25), 17, Cream, true);
        MenuText("Space to move, explore and defend", new Rect(359, 617, 249, 20), 12, Hex("b2c5d6"));
        MenuPill("TOUCH", new Rect(639, 595, 92, 34), LearnerAccent);
        MenuCard(new Rect(773, 345, 424, 307), Gold);
        MenuText("SOUND OF THE RELAY", new Rect(795, 361, 380, 22), 11, Gold, true, true);
        pilotJournal.MusicVolume = DrawMenuVolume("Music", new Rect(795, 408, 378, 66), pilotJournal.MusicVolume, ref menuMusicRestore, Gold);
        pilotJournal.SoundVolume = DrawMenuVolume("Sound effects", new Rect(795, 506, 378, 66), pilotJournal.SoundVolume, ref menuEffectsRestore, LearnerAccent);
        if (relayAudio != null) relayAudio.volume = pilotJournal.SoundVolume;
        MenuText("RELAY AFTERGLOW", new Rect(795, 596, 375, 20), 11, Gold, true, true);
        MenuText("An original, mellow synth groove · 96 BPM", new Rect(795, 621, 375, 20), 12, Hex("b2c5d6"), false, true);
        MenuText("Touch controls · automatic aiming and salvage collection · landscape play", new Rect(337, 670, 860, 23), 13, Hex("becfdd"), false, true);
        MenuText(Time.unscaledTime < menuSavedUntil ? menuSaveNote : "Tap Play to return to your expedition.", new Rect(337, 711, 574, 24), 13, Time.unscaledTime < menuSavedUntil ? menuSaveColor : Hex("afc4d6"));
        if (MenuButton("Save preferences", new Rect(943, 704, 254, 36), LearnerAccent, true, true))
        { SaveMenuPreferences(); }
    }

    private float DrawMenuVolume(string label, Rect rect, float value, ref float restoreVolume, Color color)
    {
        MenuText(label, new Rect(rect.x, rect.y, 238, 25), 17, Cream, true);
        MenuText(Mathf.RoundToInt(value * 100) + "%", new Rect(rect.xMax - 70, rect.y, 70, 25), 15, color, true, true);
        Rect track = new Rect(rect.x, rect.y + 37, rect.width - 85, 28);
        GUIStyle emptyTrack = new GUIStyle(GUIStyle.none) { fixedHeight = 28 };
        GUIStyle emptyThumb = new GUIStyle(GUIStyle.none) { fixedWidth = 20, fixedHeight = 28 };
        GUI.SetNextControlName(label + "Volume");
        value = GUI.HorizontalSlider(track, value, 0, 1, emptyTrack, emptyThumb);
        Fill(track.x + 9, track.y + 12, track.width - 18, 5, Hex("061423"));
        Fill(track.x + 9, track.y + 12, (track.width - 18) * value, 5, color);
        float at = track.x + 9 + (track.width - 18) * value;
        Fill(at - 6, track.y + 5, 12, 19, Hex("081522"));
        Fill(at - 4, track.y + 6, 8, 16, Cream);
        Fill(at - 1, track.y + 10, 2, 8, color);
        if (value > .001f) restoreVolume = value;
        if (MenuButton(value <= .001f ? "Unmute" : "Mute", new Rect(rect.xMax - 73, rect.y + 35, 73, 29), Hex("496077"))) value = ToggleMenuVolume(value, ref restoreVolume);
        return Mathf.Clamp01(value);
    }

    private void DrawPolishedCollection()
    {
        HubHeading("Your story. Your colors.", "Milestones earn paint credits. Make the captain and her equipment your own.");
        if (MenuTab("Milestones", new Rect(337, 226, 225, 37), collectionTab == 0)) collectionTab = 0;
        if (MenuTab("Paint bay", new Rect(574, 226, 225, 37), collectionTab == 1)) collectionTab = 1;
        MenuPill(MenuCount(pilotJournal.Tokens, "paint credit").ToUpperInvariant(), new Rect(962, 232, 235, 25), Gold);
        if (collectionTab == 0)
        {
            for (int row = 0; row < 6; row++)
            {
                int i = achievementPage * 6 + row; float y = 279 + row * 64;
                bool earned = pilotJournal.Achievements.Contains(AchievementId(i));
                float value = Mathf.Min(AchievementValue(i), AchievementTarget(i)), target = AchievementTarget(i);
                MenuCard(new Rect(337, y, 860, 55), earned ? Gold : Hex("67839b"));
                DrawPixelEllipse(new Vector2(372, y + 28), 19, 19, earned ? Hex("53452e") : Hex("20384c"));
                MenuIcon(5, new Vector2(360, y + 16), 3, earned ? Gold : Hex("829bb1"));
                MenuText(AchievementNames[i], new Rect(406, y + 5, 485, 24), 17, Cream, true, true);
                MenuText(AchievementCopy[i], new Rect(406, y + 31, 480, 19), 12, Hex("b5c9d9"), false, true);
                MenuText("+" + AchievementRewards[i] + (AchievementRewards[i] == 1 ? " credit" : " credits"), new Rect(899, y + 31, 123, 19), 11, Gold, true, true);
                MenuText(earned ? "COMPLETE" : value + " / " + target, new Rect(1054, y + 6, 122, 23), 12, earned ? Mint : Cream, true, true);
                ProgressBar(1054, y + 37, 121, 5, value / Mathf.Max(1, target), earned ? Mint : LearnerAccent);
            }
            if (MenuButton(achievementPage == 0 ? "Next milestones  >" : "<  First milestones", new Rect(337, 687, 860, 35), Hex("3d566e"))) achievementPage = 1 - achievementPage;
            return;
        }
        for (int i = 0; i < 4; i++)
        {
            float x = 337 + i % 2 * 438, y = 280 + i / 2 * 208;
            bool owned = pilotJournal.Liveries.Contains(i), equipped = learningProfile.Accent == i;
            bool affordable = pilotJournal.Tokens >= LiveryPrices[i]; Color color = LiveryEnergy(i);
            MenuCard(new Rect(x, y, 414, 190), color, equipped);
            string title = LiveryNames[i].ToLowerInvariant(); title = System.Globalization.CultureInfo.InvariantCulture.TextInfo.ToTitleCase(title);
            MenuText(title, new Rect(x + 17, y + 11, 380, 28), 18, Cream, true, true);
            DrawPixelEllipse(new Vector2(x + 64, y + 145), 32, 7, Hex("07182a"));
            DrawLiveryPortrait(i, new Vector2(x + 64, y + 97), 101);
            MenuText("Armor, visor + energy", new Rect(x + 125, y + 56, 270, 22), 14, Cream, true);
            MenuText("Your captain, cannons and\nshield lights share this palette.", new Rect(x + 125, y + 84, 270, 37), 12, Hex("b5c9d9"));
            for (int swatch = 0; swatch < 3; swatch++) Fill(x + 125 + swatch * 22, y + 129, 14, 7, swatch == 0 ? LiveryArmor(i) : swatch == 1 ? color : Cream);
            string action = equipped ? "Equipped" : owned ? "Equip colors" : affordable ? "Unlock · " + LiveryPrices[i] + " credits" : "Need " + (LiveryPrices[i] - pilotJournal.Tokens) + (LiveryPrices[i] - pilotJournal.Tokens == 1 ? " more credit" : " more credits");
            if (MenuButton(action, new Rect(x + 125, y + 149, 270, 28), color, !equipped && (owned || affordable), equipped)) EquipLivery(i);
        }
        MenuText("Milestones and daily learning signals earn credits for your next look. Earned colors stay yours.", new Rect(337, 710, 860, 23), 13, Hex("b5c9d9"));
    }
}
