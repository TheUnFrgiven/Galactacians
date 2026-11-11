using UnityEngine;

public sealed partial class RuneholdGame
{
    private static readonly Color UiInk = Hex("233b5c"), UiMuted = Hex("536780"), UiBlue = Hex("236bb2");
    private static readonly Color UiPaper = Hex("fffdf8"), UiLine = Hex("cfdaea");
    private static readonly Rect MenuAction = new Rect(24, 18, 116, 60);
    private static readonly Rect BuildAction = new Rect(690, 702, 248, 72);
    private static readonly Rect LaunchAction = new Rect(956, 702, 300, 72);
    private static readonly Rect BoostAction = new Rect(1024, 572, 108, 80);
    private static readonly Rect NovaAction = new Rect(1148, 552, 108, 100);
    private bool navigatorOpen;
    private Vector2 WorldOrigin
    {
        get
        {
            Rect safe = Screen.safeArea;
            float scale = Mathf.Min(safe.width / DesignWidth, safe.height / DesignHeight);
            return new Vector2(Mathf.Round((640 - worldCamera.x * WorldZoom) * scale) / scale,
                Mathf.Round((400 - worldCamera.y * WorldZoom) * scale) / scale);
        }
    }

    private void UiRound(Rect rect, Color color, float radius = 12)
    {
        Color previous = GUI.color; GUI.color = Color.white;
        GUI.DrawTexture(rect, pixel, ScaleMode.StretchToFill, true, 0, color, 0, radius);
        GUI.color = previous;
    }

    private void UiCard(Rect rect, Color accent, bool selected = false)
    {
        UiRound(new Rect(rect.x, rect.y + 4, rect.width, rect.height), new Color(.13f, .25f, .43f, .10f), 16);
        UiRound(rect, selected ? Color.Lerp(accent, UiBlue, .2f) : UiLine, 16);
        UiRound(new Rect(rect.x + 1.5f, rect.y + 1.5f, rect.width - 3, rect.height - 3), selected ? Color.Lerp(accent, Color.white, .88f) : UiPaper, 15);
    }

    private GUIStyle UiStyle(int size, Color color, bool bold = false, TextAnchor anchor = TextAnchor.MiddleLeft)
    {
        return new GUIStyle(GUI.skin.label) { font = bold ? academyFont : academyBodyFont, fontSize = size,
            alignment = anchor, wordWrap = true, padding = new RectOffset(), normal = { textColor = color } };
    }

    private void UiText(string copy, Rect rect, int size = 22, bool bold = false, Color? color = null, TextAnchor anchor = TextAnchor.MiddleLeft)
        => GUI.Label(rect, copy, UiStyle(size, color ?? UiInk, bold, anchor));

    private void UiDot(Vector2 at, float radius, Color color) => UiRound(new Rect(at.x - radius, at.y - radius, radius * 2, radius * 2), color, radius);

    private void UiStroke(Vector2 from, Vector2 to, float thickness, Color color)
    {
        DrawBeam(from, to, thickness, color); UiDot(from, thickness / 2, color); UiDot(to, thickness / 2, color);
    }

    private void DrawClearIcon(int glyph, Vector2 at, float scale, Color color)
    {
        // UI glyphs use smooth geometry at their final size. Game sprites keep their pixel grid.
        Vector2 c = at + Vector2.one * (scale * 4); float s = scale * 3;
        if (glyph == 0)
        {
            UiStroke(c + new Vector2(-s, -1), c + new Vector2(0, -s), scale, color);
            UiStroke(c + new Vector2(0, -s), c + new Vector2(s, -1), scale, color);
            UiRound(new Rect(c.x - s * .7f, c.y - 1, s * 1.4f, s), color, 2);
            UiRound(new Rect(c.x - scale, c.y + scale, scale * 2, scale * 2), UiPaper, 1);
        }
        else if (glyph == 1 || glyph == 2)
        {
            UiRound(new Rect(c.x - s - 1, c.y - s, s, s * 2), color, 3);
            UiRound(new Rect(c.x + 1, c.y - s, s, s * 2), color, 3);
            for (int i = 0; i < 2; i++) UiStroke(c + new Vector2(-s + 3, -s + 5 + i * scale * 2), c + new Vector2(-3, -s + 5 + i * scale * 2), 1.5f, UiPaper);
        }
        else if (glyph == 5)
        {
            UiRound(new Rect(c.x - s * .65f, c.y - s, s * 1.3f, s * 1.2f), color, 5);
            UiStroke(c + new Vector2(-s, -s * .8f), c + new Vector2(-s, 0), scale * .7f, color);
            UiStroke(c + new Vector2(s, -s * .8f), c + new Vector2(s, 0), scale * .7f, color);
            UiStroke(c, c + new Vector2(0, s * .75f), scale, color);
            UiRound(new Rect(c.x - s * .7f, c.y + s * .65f, s * 1.4f, scale), color, 2);
        }
        else if (glyph == 4)
        {
            UiDot(c + new Vector2(0, -scale * 1.5f), s * .65f, color);
            UiRound(new Rect(c.x - s * .9f, c.y + scale, s * 1.8f, s), color, 5);
            UiRound(new Rect(c.x - s * .4f, c.y - scale * 2, s * .8f, scale), UiPaper, 2);
        }
        else
        {
            UiDot(c, s, color); UiDot(c, s * .55f, UiPaper);
            UiStroke(c + new Vector2(-s, 0), c + new Vector2(s, 0), scale * .7f, color);
            UiStroke(c + new Vector2(0, -s), c + new Vector2(0, s), scale * .7f, color);
        }
    }

    private string FriendlyUpgrade(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? "Meteor tower" : upgrade == Upgrade.CoreShield ? "Ship shield" :
        upgrade == Upgrade.SalvageRig ? "Resource helper" : upgrade == Upgrade.PlasmaRifle ? "Space blaster" : upgrade == Upgrade.OrbitDrones ? "Robot friends" : "Repair station";
    private string FriendlyBenefit(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? "Stops groups of meteors. More towers cover more of your ship." :
        upgrade == Upgrade.CoreShield ? "Gives your ship more health and repairs damage." : upgrade == Upgrade.SalvageRig ? "Collects more metal and crystals each day." :
        upgrade == Upgrade.PlasmaRifle ? "Makes your astronaut's automatic shots stronger." : upgrade == Upgrade.OrbitDrones ? "Little robots help you shoot nearby meteors." : "Slowly repairs your ship during each meteor shower.";
}
