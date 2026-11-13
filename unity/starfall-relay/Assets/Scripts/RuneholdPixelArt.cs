using UnityEngine;

public sealed partial class RuneholdGame
{
    private Texture2D botArt, droneArt, repairArt;
    private Rect botArtUv, droneArtUv, repairArtUv;
    private readonly Texture2D[] elementalArt = new Texture2D[4];
    private readonly Rect[] elementalUv = new Rect[4];
    private readonly System.Collections.Generic.Dictionary<int, Texture2D> pixelDiscs = new System.Collections.Generic.Dictionary<int, Texture2D>();
    private static readonly Color PixelEdge = Hex("294665"), PixelShadow = Hex("a7bfd3");

    private void LoadPolishedArtwork()
    {
        botArt = Resources.Load<Texture2D>("Art/BotGuide");
        droneArt = Resources.Load<Texture2D>("Art/OrbitDrone");
        repairArt = Resources.Load<Texture2D>("Art/RepairModule");
        botArtUv = TrimTransparentBorder(botArt, new Rect(0, 0, 1, 1));
        droneArtUv = TrimTransparentBorder(droneArt, new Rect(0, 0, 1, 1));
        repairArtUv = TrimTransparentBorder(repairArt, new Rect(0, 0, 1, 1));
        string[] names = { "EmberMeteor", "IceMeteor", "CrystalMeteor", "SunMeteor" };
        for (int i = 0; i < names.Length; i++)
        {
            elementalArt[i] = Resources.Load<Texture2D>("Art/" + names[i]);
            elementalUv[i] = TrimTransparentBorder(elementalArt[i], new Rect(0, 0, 1, 1));
        }
    }

    // One stepped contour and one three-pixel bevel are shared by every interface surface.
    // Text stays at display resolution; decoration follows the same grid as the game sprites.
    private void PixelSurface(Rect r, Color color, float cut = 6)
    {
        r = new Rect(Mathf.Round(r.x), Mathf.Round(r.y), Mathf.Round(r.width), Mathf.Round(r.height));
        if (r.width <= 0 || r.height <= 0) return;
        cut = Mathf.Min(cut, Mathf.Min(r.width, r.height) * .2f);
        if (cut < 2) { Fill(r.x, r.y, r.width, r.height, color); return; }
        float step = Mathf.Max(2, Mathf.Floor(cut / 2));
        Fill(r.x + cut, r.y, r.width - cut * 2, step, color);
        Fill(r.x + step, r.y + step, r.width - step * 2, cut - step, color);
        Fill(r.x, r.y + cut, r.width, r.height - cut * 2, color);
        Fill(r.x + step, r.yMax - cut, r.width - step * 2, cut - step, color);
        Fill(r.x + cut, r.yMax - step, r.width - cut * 2, step, color);
    }

    private void PixelPanel(Rect r, Color accent, bool selected = false, bool dark = false)
    {
        PixelSurface(new Rect(r.x, r.y + 5, r.width, r.height), dark ? Hex("10233b") : PixelShadow, 8);
        PixelSurface(r, dark ? Hex("759bb4") : PixelEdge, 8);
        PixelSurface(new Rect(r.x + 3, r.y + 3, r.width - 6, r.height - 6), dark ? Hex("294d6d") : Hex("d7e6ed"), 6);
        PixelSurface(new Rect(r.x + 6, r.y + 6, r.width - 12, r.height - 14), dark ? Hex("173754") : selected ? Color.Lerp(accent, UiPaper, .82f) : UiPaper, 4);
        if (r.width > 110 && r.height > 60)
        {
            Fill(r.x + 12, r.y + 6, Mathf.Min(52, r.width * .16f), 3, accent);
            Fill(r.xMax - 18, r.y + 10, 5, 5, dark ? Hex("9bb9c9") : Hex("a9c0d1"));
            Fill(r.xMax - 17, r.y + 10, 3, 2, dark ? Color.white : Hex("eff8ff"));
        }
    }

    private void PixelSpark(Vector2 at, float size, Color color)
    {
        float unit = Mathf.Max(1, Mathf.Round(size / 3));
        Fill(Mathf.Round(at.x - unit / 2), Mathf.Round(at.y - size / 2), unit, size, color);
        Fill(Mathf.Round(at.x - size / 2), Mathf.Round(at.y - unit / 2), size, unit, color);
    }

    private void PixelEllipse(Vector2 at, float radiusX, float radiusY, Color color)
    {
        if (radiusX <= 0 || radiusY <= 0) return;
        int width = Mathf.Clamp(Mathf.RoundToInt(radiusX), 2, 128);
        int height = Mathf.Clamp(Mathf.RoundToInt(radiusY), 2, 128);
        int key = width * 256 + height;
        if (!pixelDiscs.TryGetValue(key, out Texture2D disc))
        {
            var colors = new Color32[width * height];
            for (int y = 0; y < height; y++)
                for (int x = 0; x < width; x++)
                {
                    float px = (x + .5f) / width * 2 - 1, py = (y + .5f) / height * 2 - 1;
                    colors[y * width + x] = px * px + py * py <= 1 ? new Color32(255, 255, 255, 255) : new Color32();
                }
            disc = new Texture2D(width, height, TextureFormat.RGBA32, false) { filterMode = FilterMode.Point, wrapMode = TextureWrapMode.Clamp };
            disc.SetPixels32(colors); disc.Apply(false, true); pixelDiscs.Add(key, disc);
        }
        Color previous = GUI.color; GUI.color = color;
        GUI.DrawTexture(new Rect(Mathf.Round(at.x - radiusX), Mathf.Round(at.y - radiusY), Mathf.Round(radiusX * 2), Mathf.Round(radiusY * 2)), disc);
        GUI.color = previous;
    }

    private void DrawEnergyCell(Vector2 at, float size, Color color)
    {
        float u = size / 12;
        PixelSurface(new Rect(at.x - 5 * u, at.y - 6 * u, 10 * u, 12 * u), Ink, u * 2);
        Fill(at.x - 3 * u, at.y - 5 * u, 6 * u, 10 * u, Hex("6e8ba5"));
        Fill(at.x - 2 * u, at.y - 3 * u, 4 * u, 6 * u, color);
        Fill(at.x - u, at.y - 3 * u, 2 * u, 2 * u, Color.white);
        Fill(at.x - 2 * u, at.y + 4 * u, 4 * u, u, Gold);
    }

    private void DrawResourceDock(Vector2 at, Color accent)
    {
        PixelSurface(new Rect(at.x - 41, at.y - 5, 82, 23), Hex("101f32"), 8);
        PixelSurface(new Rect(at.x - 38, at.y - 7, 76, 18), Hex("4b657d"), 6);
        Fill(at.x - 28, at.y - 7, 56, 3, Hex("9bb2c3"));
        Fill(at.x - 24, at.y + 9, 48, 3, accent);
        Fill(at.x - 33, at.y + 1, 5, 5, Hex("b2c7d8"));
        Fill(at.x + 28, at.y + 1, 5, 5, Hex("b2c7d8"));
    }

    private void DrawPixelMuzzle(Vector2 at, Vector2 direction, float size, Color color)
    {
        Matrix4x4 previous = GUI.matrix;
        GUI.matrix = LocalRotation(previous, AimAngle(direction), at);
        Fill(at.x - 2, at.y - size * .2f, size, size * .4f, color);
        Fill(at.x + size * .2f, at.y - size * .4f, size * .35f, size * .8f, color);
        Fill(at.x, at.y - size * .1f, size * .65f, size * .2f, Hex("fff5d4"));
        GUI.matrix = previous;
    }

    private void DrawMenuConstellation(Rect area)
    {
        // Static, sparse stars avoid distracting children or making text compete with scenery.
        for (int i = 0; i < 30; i++)
        {
            Vector2 at = new Vector2(area.x + 16 + i * 137 % Mathf.Max(1, area.width - 32), area.y + 16 + i * 79 % Mathf.Max(1, area.height - 32));
            if (i % 4 == 0) PixelSpark(at, 8, Hex("b6d4e6"));
            else Fill(at.x, at.y, 3, 3, Hex("c6dde9"));
        }
    }

    private void DrawPortraitDock(Vector2 at, float radius)
    {
        DrawPixelEllipse(at + new Vector2(0, 4), radius, radius, Hex("9fb9cf"));
        DrawPixelEllipse(at, radius, radius, PixelEdge);
        DrawPixelEllipse(at, radius - 3, radius - 3, Hex("d4e8f3"));
        DrawPixelEllipse(at, radius - 9, radius - 9, Hex("ecf7fb"));
        for (int i = -2; i <= 2; i++)
            Fill(at.x + i * 16 - 2, at.y + radius * .61f, 4, 3, Hex("bdd8e7"));
        Fill(at.x - 16, at.y - radius + 3, 32, 3, Gold);
    }

    private static readonly string[] WordmarkPixels = {
            "011111000010000011100000111110", // S
            "111110010000100001000010000100", // T
            "011101000110001111111000110001", // A
            "111101000110001111101010010001", // R
            "111111000010000111101000010000", // F
            "011101000110001111111000110001", // A
            "100001000010000100001000011111", // L
            "100001000010000100001000011111"  // L
    };

    private void DrawStarfallWordmark(Vector2 at)
    {
        const int unit = 4;
        for (int i = 0; i < WordmarkPixels.Length; i++)
            for (int cell = 0; cell < 30; cell++)
            {
                if (WordmarkPixels[i][cell] != '1') continue;
                float x = at.x + i * 24 + cell % 5 * unit, y = at.y + cell / 5 * unit;
                Fill(x, y + 3, unit, unit, Hex("a8c3d7"));
                Fill(x, y, unit, unit, UiInk);
            }
        PixelSpark(at + new Vector2(213, 10), 16, Gold);
    }

    private void DrawElementSprite(int element, Vector2 at, float height, float angle = 0)
    {
        int index = Mathf.Abs(element) % 4;
        DrawRotatedSprite(elementalArt[index], elementalUv[index], at, height, angle, Color.white);
    }

    private void DrawAchievementMedal(int index, Vector2 at, bool earned)
    {
        Color rim = earned ? Hex("d79735") : Hex("718da7");
        DrawPixelEllipse(at, 27, 28, PixelEdge);
        DrawPixelEllipse(at, 24, 25, rim);
        DrawPixelEllipse(at + new Vector2(0, -1), 20, 21, earned ? Hex("fff1bf") : Hex("dfecf4"));
        if (index == 0 || index == 2 || index == 4 || index == 11)
            DrawMenuEquipmentArt(index == 0 ? Upgrade.IonTurret : index == 2 ? Upgrade.SalvageRig : index == 4 ? Upgrade.CoreShield : Upgrade.OrbitDrones, at, 33);
        else if (index == 6) DrawTrimmedSprite(botArt, botArtUv, at, 37, Color.white);
        else if (index == 1 || index == 5 || index == 9) DrawElementSprite(index == 1 ? 3 : index == 5 ? 1 : 0, at, 35);
        else if (index == 3) DrawEnergyCell(at, 27, Cyan);
        else if (index == 10) DrawTrimmedSprite(pilotTexture, pilotFrames[0], at, 39, Color.white);
        else DrawPixelIcon(index == 7 ? 1 : 5, at - Vector2.one * 13, 3.2f, earned ? Hex("c18b2e") : UiBlue);
        if (earned) PixelSpark(at + new Vector2(20, -20), 10, Gold);
    }
}
