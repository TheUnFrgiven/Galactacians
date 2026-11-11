using System.Collections.Generic;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private Font academyBodyFont;
    private static string MenuCount(int count, string singular, string plural = null) => count + " " + (count == 1 ? singular : plural ?? singular + "s");
    private bool menuNameEditing, menuClearFocus, menuNavPending;
    private float menuSavedUntil;
    private readonly Dictionary<int, float> menuHover = new Dictionary<int, float>();
    private readonly Dictionary<int, Texture2D> menuPortraits = new Dictionary<int, Texture2D>();
    private static readonly string[][] MenuGlyphs = {
        new[] { "...##...", "..####..", ".######.", "########", ".######.", ".##..##.", ".##..##.", ".######." },
        new[] { "...##...", "..#..#..", ".#.##.#.", "#.#..#.#", "#.#..#.#", ".#.##.#.", "..#..#..", "...##..." },
        new[] { ".##.....", ".##..##.", ".....##.", "........", "###..###", "........", "###..###", "........" },
        new[] { ".....##.", ".#######", "########", "..####..", "..##.#..", ".##..#..", ".##.....", "........" },
        new[] { "..####..", ".######.", ".##..##.", "..####..", "...##...", ".######.", "########", "########" },
        new[] { "########", "#.####.#", "#.####.#", ".######.", "..####..", "...##...", "..####..", ".######." },
        new[] { "..#..#..", ".######.", "##....##", ".#.##.#.", ".#.##.#.", "##....##", ".######.", "..#..#.." }
    };

    private void MenuIcon(int glyph, Vector2 at, float scale, Color color)
        => DrawClearIcon(glyph, at, scale, color);

    private bool BrightMenu => menuOpen && phase != Phase.Quiz;
    private static readonly Color MenuInk = Hex("243859");
    private static readonly Color MenuMuted = Hex("536988");
    private Color MenuColor(Color color)
    {
        if (!BrightMenu || color == MenuInk || color == MenuMuted) return color;
        float saturation = Mathf.Max(color.r, Mathf.Max(color.g, color.b)) - Mathf.Min(color.r, Mathf.Min(color.g, color.b));
        Color result = saturation < .22f ? (color.grayscale > .75f ? MenuInk : MenuMuted)
            : Color.Lerp(color, Hex("18335b"), .56f);
        result.a = color.a; return result;
    }
    private GUIStyle DisplayStyle(GUIStyle source)
    {
        if (!BrightMenu) return source;
        GUIStyle style = new GUIStyle(source); style.normal.textColor = MenuColor(source.normal.textColor); return style;
    }
    private GUIStyle MenuType(int size, Color color, bool bold = false, TextAnchor alignment = TextAnchor.MiddleLeft)
        => new GUIStyle(GUI.skin.label) { font = bold ? academyFont : academyBodyFont, fontSize = size,
            fontStyle = FontStyle.Normal, alignment = alignment, wordWrap = true, padding = new RectOffset(), normal = { textColor = MenuColor(color) } };

    private void MenuText(string text, Rect rect, int size, Color color, bool bold = false, bool singleLine = false)
    {
        GUIStyle style = MenuType(Mathf.Max(17, size), color, bold);
        style.wordWrap = !singleLine;
        int minimum = 17;
        while (style.fontSize > minimum && (singleLine ? style.CalcSize(new GUIContent(text)).x > rect.width : style.CalcHeight(new GUIContent(text), rect.width) > rect.height)) style.fontSize--;
        GUI.Label(rect, text, style);
    }

    private void MenuCard(Rect rect, Color accent, bool selected = false) => UiCard(rect, accent, selected);

    private float MenuHoverAmount(Rect rect, bool hover)
    {
        int id = Mathf.RoundToInt(rect.x) * 92821 ^ Mathf.RoundToInt(rect.y) * 68917 ^ Mathf.RoundToInt(rect.width);
        menuHover.TryGetValue(id, out float amount);
        if (Event.current.type == EventType.Repaint)
        {
            amount = reducedMotion ? (hover ? 1 : 0) : Mathf.MoveTowards(amount, hover ? 1 : 0, Time.unscaledDeltaTime * 10);
            menuHover[id] = amount;
        }
        return amount;
    }

    private bool MenuButton(string label, Rect rect, Color accent, bool enabled = true, bool selected = false)
    {
        if (rect.height < 48) { rect.y -= (48 - rect.height) * .5f; rect.height = 48; }
        bool available = enabled && GUI.enabled;
        bool hover = available && rect.Contains(Event.current.mousePosition);
        bool pressed = hover && Input.GetMouseButton(0);
        if (accent.maxColorComponent < .65f) accent = UiBlue;
        Color face = !available ? Hex("e6ebf2") : selected ? UiBlue : Color.Lerp(accent, Color.white, hover ? .68f : .84f);
        Color text = !available ? Hex("66758a") : selected ? Color.white : UiInk;
        UiRound(new Rect(rect.x, rect.y + 4, rect.width, rect.height), new Color(.12f, .24f, .4f, .16f));
        Rect drawn = new Rect(rect.x, rect.y + (pressed ? 2 : 0), rect.width, rect.height);
        UiRound(drawn, available ? Color.Lerp(accent, UiLine, .65f) : UiLine);
        UiRound(new Rect(drawn.x + 1.5f, drawn.y + 1.5f, drawn.width - 3, drawn.height - 3), face, 11);
        GUIStyle type = UiStyle(rect.height >= 64 ? 23 : 19, text, true, TextAnchor.MiddleCenter);
        while (type.fontSize > 17 && type.CalcSize(new GUIContent(label)).x > rect.width - 24) type.fontSize--;
        GUI.Label(new Rect(drawn.x + 10, drawn.y + 2, drawn.width - 20, drawn.height - 4), label, type);
        bool previous = GUI.enabled; GUI.enabled = available;
        bool clicked = GUI.Button(rect, GUIContent.none, GUIStyle.none); GUI.enabled = previous;
        if (clicked) { PlayRelaySound(4, .55f); menuClearFocus = true; }
        return clicked;
    }

    private bool MenuTab(string label, Rect rect, bool selected, bool enabled = true)
        => MenuButton(label, rect, selected ? LearnerAccent : Hex("3d566e"), enabled, selected);

    private void MenuPill(string label, Rect rect, Color color)
    {
        UiRound(rect, Color.Lerp(color, Color.white, .83f), 8);
        UiText(label, new Rect(rect.x + 10, rect.y, rect.width - 20, rect.height), 17, true, Color.Lerp(color, UiInk, .65f));
    }

    private void DrawMenuPlanet(Vector2 center, int lesson, float radius, bool current, bool complete)
    {
        Color[] colors = { Hex("65d5ee"), Hex("7ed6ad"), Hex("f4cf7e"), Hex("e7a483"), Hex("b7a0eb"), Hex("e79fbd") };
        Color color = colors[lesson % colors.Length];
        DrawPixelEllipse(center + new Vector2(0, radius * .2f), radius + 7, radius + 5, new Color(color.r, color.g, color.b, current ? .16f : .07f));
        DrawPixelEllipse(center, radius + 2, radius + 2, Hex("091626"));
        DrawPixelEllipse(center, radius, radius, Color.Lerp(color, Hex("19324a"), .3f));
        DrawPixelEllipse(center + new Vector2(-radius * .19f, -radius * .18f), radius * .73f, radius * .73f, color);
        DrawPixelEllipse(center + new Vector2(-radius * .36f, -radius * .25f), radius * .18f, radius * .12f, Color.Lerp(color, Color.white, .22f));
        DrawPixelEllipse(center + new Vector2(radius * .23f, radius * .22f), radius * .24f, radius * .17f, Color.Lerp(color, Hex("17314a"), .32f));
        if (current || complete)
        {
            Color ring = complete ? Mint : Gold;
            for (int i = 0; i < 20; i++)
            {
                float angle = i * Mathf.PI * 2 / 20;
                Vector2 at = center + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * (radius + 6);
                Fill(at.x - 1, at.y - 1, 2, 2, ring);
            }
        }
    }

    private void DrawLiveryPortrait(int index, Vector2 center, float height)
    {
        if (pilotTexture == null) return;
        if (!menuPortraits.TryGetValue(index, out Texture2D portrait))
        {
            Rect uv = pilotFrames[0];
            int x = Mathf.RoundToInt(uv.x * pilotTexture.width), y = Mathf.RoundToInt(uv.y * pilotTexture.height);
            int width = Mathf.Min(pilotTexture.width - x, Mathf.RoundToInt(uv.width * pilotTexture.width));
            int h = Mathf.Min(pilotTexture.height - y, Mathf.RoundToInt(uv.height * pilotTexture.height));
            Color[] colors = pilotTexture.GetPixels(x, y, width, h);
            for (int i = 0; i < colors.Length; i++) colors[i] = LiveryPixel(colors[i], true, index);
            portrait = new Texture2D(width, h, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
            portrait.SetPixels(colors); portrait.Apply(false, true); menuPortraits.Add(index, portrait);
        }
        DrawTrimmedSprite(portrait, new Rect(0, 0, 1, 1), center, height, Color.white);
    }

    private Color LiveryPixel(Color c, bool pilot, int index)
    {
        if (c.a < .05f || index == 0) return c;
        bool armor = pilot && c.r > .35f && c.r > c.g * 1.28f && c.g > c.b * 1.12f;
        bool energy = c.g > .35f && c.b > .4f && c.r < c.g * .8f;
        if (!armor && !energy) return c;
        Color target = armor ? LiveryArmor(index) : LiveryEnergy(index);
        float light = Mathf.Max(c.r, c.g, c.b);
        Color result = Color.Lerp(target * light, Color.white, Mathf.Max(0, light - .82f) * 1.5f);
        result.a = c.a; return result;
    }
    private void DrawMenuEquipmentArt(Upgrade upgrade, Vector2 center, float height)
    {
        if (upgrade < Upgrade.PlasmaRifle) { DrawUpgradeArt(upgrade, center, height, Color.white); return; }
        if (upgrade == Upgrade.PlasmaRifle)
        { DrawTrimmedSprite(LiveryTexture(carbineTexture), carbineUv, center, height * .3f, Color.white); return; }
        Color color = UpgradeColor(upgrade);
        DrawPixelEllipse(center, height * .4f, height * .4f, Hex("0a1b2b"));
        if (upgrade == Upgrade.OrbitDrones)
        {
            for (int i = 0; i < 3; i++)
            {
                float angle = i * Mathf.PI * 2 / 3 - .5f;
                Vector2 at = center + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * height * .25f;
                Fill(at.x - 10, at.y - 2, 20, 4, Hex("40576e"));
                Fill(at.x - 5, at.y - 5, 10, 10, Hex("93b4c9"));
                Fill(at.x - 3, at.y - 3, 6, 6, color);
                Fill(at.x - 1, at.y - 1, 2, 2, Cream);
            }
        }
        else
        {
            DrawPixelEllipse(center, height * .31f, height * .31f, Hex("436578"));
            DrawPixelEllipse(center, height * .25f, height * .25f, Hex("102e40"));
            DrawPixelEllipse(center, height * .16f, height * .16f, color);
            Fill(center.x - 2, center.y - height * .25f, 4, height * .5f, Cream);
            Fill(center.x - height * .25f, center.y - 2, height * .5f, 4, Cream);
        }
    }

}
