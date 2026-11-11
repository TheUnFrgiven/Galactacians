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
        HubHeading("Make yourself at home", "Choose your name, sound and the way you like to answer.");
        UiCard(new Rect(334, 240, 866, 100), Cyan);
        UiText("Pilot name", new Rect(358, 252, 190, 35), 25, true);
        UiText("Up to 20 letters", new Rect(358, 294, 190, 28), 19, false, UiMuted);
        Rect name = new Rect(568, 258, 608, 63);
        UiRound(name, Hex("e7f0fc"));
        GUIStyle input = UiStyle(28, UiInk); input.padding = new RectOffset(15, 15, 0, 0); input.wordWrap = false;
        Event inputEvent = Event.current;
        bool finishName = menuNameEditing && inputEvent.type == EventType.KeyDown &&
            (inputEvent.keyCode == KeyCode.Return || inputEvent.keyCode == KeyCode.KeypadEnter || inputEvent.keyCode == KeyCode.Escape || inputEvent.character == '\n' || inputEvent.character == '\r');
        if (finishName) inputEvent.Use();
        GUI.SetNextControlName("CadetName");
        Color oldSelection = GUI.skin.settings.selectionColor, oldCursor = GUI.skin.settings.cursorColor;
        GUI.skin.settings.selectionColor = new Color(.2f, .6f, .9f, .3f); GUI.skin.settings.cursorColor = UiBlue;
        learningProfile.CadetName = GUI.TextField(name, learningProfile.CadetName, 20, input);
        GUI.skin.settings.selectionColor = oldSelection; GUI.skin.settings.cursorColor = oldCursor;
        if (finishName) { GUIUtility.keyboardControl = 0; GUI.FocusControl(""); menuNameEditing = false; SaveMenuPreferences(); }
        UiCard(new Rect(334, 362, 424, 306), Cyan);
        UiText("Play your way", new Rect(358, 375, 376, 34), 26, true);
        UiText("Calmer motion", new Rect(358, 429, 232, 32), 23, true);
        UiText("Quieter effects", new Rect(358, 467, 232, 32), 20, false, UiMuted);
        if (MenuButton(reducedMotion ? "On" : "Off", new Rect(616, 435, 118, 58), Cyan, true, reducedMotion))
        { reducedMotion = !reducedMotion; learningProfile.ReducedMotion = reducedMotion; SaveLearningProfile(); }
        UiText("Your answers", new Rect(358, 539, 240, 32), 23, true);
        UiText("Choose what helps you", new Rect(358, 581, 190, 57), 20, false, UiMuted);
        if (MenuButton(learningProfile.TypedAnswers ? "Number pad" : "Choices", new Rect(562, 567, 172, 60), Cyan))
        { learningProfile.TypedAnswers = !learningProfile.TypedAnswers; SaveLearningProfile(); }
        UiCard(new Rect(778, 362, 422, 306), Gold);
        UiText("Music & sound", new Rect(802, 375, 374, 34), 26, true);
        pilotJournal.MusicVolume = DrawMenuVolume("Music", new Rect(802, 427, 374, 90), pilotJournal.MusicVolume, ref menuMusicRestore, Gold);
        pilotJournal.SoundVolume = DrawMenuVolume("Sound effects", new Rect(802, 552, 374, 90), pilotJournal.SoundVolume, ref menuEffectsRestore, Cyan);
        if (relayAudio != null) relayAudio.volume = pilotJournal.SoundVolume;
        UiText(Time.unscaledTime < menuSavedUntil ? menuSaveNote : CanPersistProgress ? "Your adventure is saved on this device." : "This preview keeps your saved adventure safe.", new Rect(334, 704, 566, 58), 21, false, UiMuted);
        if (MenuButton("Save settings", new Rect(926, 700, 274, 68), Cyan, true, true)) SaveMenuPreferences();
    }

    private float DrawMenuVolume(string label, Rect rect, float value, ref float restoreVolume, Color color)
    {
        UiText(label, new Rect(rect.x, rect.y, 250, 31), 23, true);
        UiText(Mathf.RoundToInt(value * 100) + "%", new Rect(rect.xMax - 78, rect.y, 78, 31), 22, true, UiBlue, TextAnchor.MiddleRight);
        Rect track = new Rect(rect.x, rect.y + 37, rect.width - 106, 54);
        GUIStyle emptyTrack = new GUIStyle(GUIStyle.none) { fixedHeight = 54 };
        GUIStyle emptyThumb = new GUIStyle(GUIStyle.none) { fixedWidth = 34, fixedHeight = 54 };
        GUI.SetNextControlName(label + "Volume"); value = GUI.HorizontalSlider(track, value, 0, 1, emptyTrack, emptyThumb);
        UiRound(new Rect(track.x + 17, track.y + 21, track.width - 34, 12), Hex("d7e3f1"), 6);
        UiRound(new Rect(track.x + 17, track.y + 21, Mathf.Max(12, (track.width - 34) * value), 12), color, 6);
        float at = track.x + 17 + (track.width - 34) * value;
        UiDot(new Vector2(at, track.y + 27), 16, UiBlue); UiDot(new Vector2(at, track.y + 27), 7, Color.white);
        if (value > .001f) restoreVolume = value;
        if (MenuButton(value <= .001f ? "Unmute" : "Mute", new Rect(rect.xMax - 94, rect.y + 37, 94, 54), color)) value = ToggleMenuVolume(value, ref restoreVolume);
        return Mathf.Clamp01(value);
    }

    private void DrawPolishedCollection()
    {
        HubHeading("Look how far you've come!", "Earn rewards by exploring and learning. Pick colors for your astronaut.");
        if (MenuTab("My badges", new Rect(334, 240, 282, 58), collectionTab == 0)) collectionTab = 0;
        if (MenuTab("My colors", new Rect(634, 240, 282, 58), collectionTab == 1)) collectionTab = 1;
        UiText(MenuCount(pilotJournal.Tokens, "color credit"), new Rect(934, 240, 266, 58), 23, true, UiBlue, TextAnchor.MiddleRight);
        if (collectionTab == 0)
        {
            achievementPage = Mathf.Clamp(achievementPage, 0, 2);
            for (int row = 0; row < 4; row++)
            {
                int i = achievementPage * 4 + row; Rect card = new Rect(334, 320 + row * 89, 866, 77);
                bool earned = pilotJournal.Achievements.Contains(AchievementId(i)); UiCard(card, earned ? Gold : Cyan);
                DrawClearIcon(5, new Vector2(card.x + 17, card.y + 24), 4, earned ? Hex("ca8c20") : UiBlue);
                UiText(AchievementNames[i], new Rect(card.x + 75, card.y + 6, 610, 31), 24, true);
                UiText(AchievementCopy[i], new Rect(card.x + 75, card.y + 42, 610, 29), 19, false, UiMuted);
                UiText(earned ? "Earned!" : Mathf.Min(AchievementValue(i), AchievementTarget(i)) + " / " + AchievementTarget(i), new Rect(card.x + 690, card.y + 9, 156, 30), 21, true, UiBlue, TextAnchor.MiddleRight);
                UiText("+" + MenuCount(AchievementRewards[i], "credit"), new Rect(card.x + 690, card.y + 44, 156, 25), 18, false, UiMuted, TextAnchor.MiddleRight);
            }
            if (MenuButton("Previous", new Rect(334, 704, 230, 58), Cyan)) achievementPage = (achievementPage + 2) % 3;
            UiText("Badges " + (achievementPage + 1) + " of 3", new Rect(584, 704, 366, 58), 22, false, UiMuted, TextAnchor.MiddleCenter);
            if (MenuButton("Next", new Rect(970, 704, 230, 58), Cyan)) achievementPage = (achievementPage + 1) % 3;
            return;
        }
        for (int i = 0; i < 4; i++)
        {
            Rect card = new Rect(334 + i % 2 * 442, 320 + i / 2 * 204, 424, 190);
            bool owned = pilotJournal.Liveries.Contains(i), equipped = learningProfile.Accent == i, canUnlock = pilotJournal.Tokens >= LiveryPrices[i];
            UiCard(card, LiveryEnergy(i), equipped); DrawLiveryPortrait(i, new Vector2(card.x + 64, card.y + 98), 125);
            string[] names = { "Orange", "Green", "Purple", "Gold" };
            UiText(names[i], new Rect(card.x + 132, card.y + 15, 272, 37), 26, true);
            UiText("Astronaut, tools and lights", new Rect(card.x + 132, card.y + 63, 272, 53), 20, false, UiMuted);
            string action = equipped ? "Wearing these!" : owned ? "Wear these colors" : canUnlock ? "Unlock · " + LiveryPrices[i] + " credits" : "Need " + (LiveryPrices[i] - pilotJournal.Tokens) + " credits";
            if (MenuButton(action, new Rect(card.x + 132, card.y + 126, 272, 50), LiveryEnergy(i), !equipped && (owned || canUnlock), equipped)) EquipLivery(i);
        }
        UiText("New badges and daily maths earn color credits. Earned colors stay yours.", new Rect(334, 737, 866, 40), 20, false, UiMuted);
    }
}
