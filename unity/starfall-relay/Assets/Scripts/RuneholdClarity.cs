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

    private Rect WorldViewport
    {
        get
        {
            Rect safe = Screen.safeArea;
            float scale = Mathf.Min(safe.width / DesignWidth, safe.height / DesignHeight);
            float x = safe.x + (safe.width - DesignWidth * scale) * .5f;
            float y = Screen.height - safe.yMax + (safe.height - DesignHeight * scale) * .5f;
            return new Rect((-x / scale - WorldOrigin.x) / WorldZoom, (-y / scale - WorldOrigin.y) / WorldZoom,
                Screen.width / (scale * WorldZoom), Screen.height / (scale * WorldZoom));
        }
    }

    private void UiRound(Rect rect, Color color, float radius = 12)
        => PixelSurface(rect, color, radius <= 0 ? 0 : Mathf.Min(6, radius));

    private void UiCard(Rect rect, Color accent, bool selected = false)
        => PixelPanel(rect, accent, selected);

    private GUIStyle UiStyle(int size, Color color, bool bold = false, TextAnchor anchor = TextAnchor.MiddleLeft)
    {
        return new GUIStyle(GUI.skin.label) { font = bold ? academyFont : academyBodyFont, fontSize = size,
            alignment = anchor, wordWrap = true, padding = new RectOffset(), normal = { textColor = color } };
    }

    private void UiText(string copy, Rect rect, int size = 22, bool bold = false, Color? color = null, TextAnchor anchor = TextAnchor.MiddleLeft)
        => GUI.Label(rect, copy, UiStyle(size, color ?? UiInk, bold, anchor));

    private void UiDot(Vector2 at, float radius, Color color) => DrawPixelEllipse(at, radius, radius, color);

    private void UiStroke(Vector2 from, Vector2 to, float thickness, Color color)
    {
        float unit = Mathf.Max(2, Mathf.Round(thickness));
        int count = Mathf.Max(1, Mathf.CeilToInt(Vector2.Distance(from, to) / (unit * .7f)));
        for (int i = 0; i <= count; i++)
        {
            Vector2 at = Vector2.Lerp(from, to, i / (float)count);
            Fill(Mathf.Round(at.x / 2) * 2 - unit / 2, Mathf.Round(at.y / 2) * 2 - unit / 2, unit, unit, color);
        }
    }

    private void DrawClearIcon(int glyph, Vector2 at, float scale, Color color)
        => DrawPixelIcon(glyph, at, scale, color);

    private string FriendlyUpgrade(Upgrade upgrade) => UpgradeName(upgrade);
    private string FriendlyBenefit(Upgrade upgrade) => upgrade == Upgrade.IonTurret ? "Stops groups of meteors. More towers cover more of your ship." :
        upgrade == Upgrade.CoreShield ? "Absorbs damage before Health. Recharges for each night." : upgrade == Upgrade.SalvageRig ? "Collects more metal and crystals each day." :
        upgrade == Upgrade.PlasmaRifle ? "Makes your astronaut's automatic shots stronger." : upgrade == Upgrade.OrbitDrones ? "Little robots help you shoot nearby meteors." : "Slowly repairs your ship during each meteor shower.";
}
