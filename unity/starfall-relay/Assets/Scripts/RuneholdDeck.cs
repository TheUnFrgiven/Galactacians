using UnityEngine;

public sealed partial class RuneholdGame
{
    // Coordinates are traced against the existing 1280 x 800 deck illustration.
    // Render, collision, equipment, gates and the navigator share this transform.
    private const float DeckScale = 1.75f;
    private static Vector2 DeckPoint(float x, float y) => new Vector2(640 + (x - 640) * DeckScale, 360 + (y - 360) * DeckScale);
    private static Vector2 DeckLocal(Vector2 position) => new Vector2(640, 360) + (position - new Vector2(640, 360)) / DeckScale;
    private static Rect DeckRect => new Rect(-480, -270, 2240, 1400);
    private Vector2 worldCamera;
    private static readonly Rect[] DeckPassages = {
        new Rect(24, 315, 282, 82), new Rect(976, 315, 280, 82),
        new Rect(602, 18, 77, 140), new Rect(602, 602, 77, 178)
    };
    private static readonly Vector2[] CrystalBeds = {
        new Vector2(350, 174), new Vector2(930, 174), new Vector2(350, 575), new Vector2(930, 575)
    };

    private bool OnDeckFloor(Vector2 world)
    {
        Vector2 p = DeckLocal(world);
        bool floor = new Rect(298, 147, 688, 466).Contains(p)
            && p.x + p.y >= 477 && p.x - p.y <= 807 && p.x + p.y <= 1567 && p.y - p.x <= 283;
        foreach (Rect passage in DeckPassages) floor |= passage.Contains(p);
        if (!floor || (p - new Vector2(640, 360)).sqrMagnitude < 100 * 100) return false;
        foreach (Vector2 bed in CrystalBeds) if ((p - bed).sqrMagnitude < 53 * 53) return false;
        return true;
    }

    private bool CanStandOnDeck(Vector2 position)
    {
        Vector2 feet = position + new Vector2(0, 30);
        return OnDeckFloor(feet + new Vector2(-10, 0)) && OnDeckFloor(feet + new Vector2(10, 0))
            && OnDeckFloor(feet + new Vector2(0, -7)) && OnDeckFloor(feet + new Vector2(0, 7));
    }

    private void MoveOnDeck(Vector2 delta)
    {
        // Sweep boost as well as walking; neither can tunnel through rails or the reactor.
        int steps = Mathf.Max(1, Mathf.CeilToInt(delta.magnitude / 7));
        Vector2 step = delta / steps;
        for (int i = 0; i < steps; i++)
        {
            Vector2 next = pilotPosition + step;
            if (CanStandOnDeck(next)) { pilotPosition = next; continue; }
            next = pilotPosition + new Vector2(step.x, 0);
            if (CanStandOnDeck(next)) pilotPosition = next;
            next = pilotPosition + new Vector2(0, step.y);
            if (CanStandOnDeck(next)) pilotPosition = next;
        }
    }

    private Vector2 NearestDeckPosition(Vector2 position)
    {
        if (float.IsNaN(position.x) || float.IsNaN(position.y) || float.IsInfinity(position.x) || float.IsInfinity(position.y)) return new Vector2(640, 670);
        if (CanStandOnDeck(position)) return position;
        Vector2 closest = new Vector2(640, 670); float distance = float.MaxValue;
        // Used only for old saves and sparse capacitor drops, never per enemy per frame.
        for (int y = 28; y < 776; y += 16)
            for (int x = 34; x < 1250; x += 16)
            {
                Vector2 candidate = DeckPoint(x, y) - new Vector2(0, 30);
                float sqr = (candidate - position).sqrMagnitude;
                if (sqr < distance && CanStandOnDeck(candidate)) { distance = sqr; closest = candidate; }
            }
        return closest;
    }

    private void DrawDeckBackdrop()
    {
        if (deckTexture == null) return;
        // Sample only the star-and-nebula strip at the top of the painting.
        // The wider corner crop contains asteroids; repeating it made obvious rows of rocks.
        int left = Mathf.FloorToInt((worldCamera.x - 1100) / 420);
        int top = Mathf.FloorToInt((worldCamera.y - 750) / 140);
        for (int y = top; y < top + 12; y++)
            for (int x = left; x < left + 6; x++)
            {
                bool flipX = (x & 1) != 0, flipY = (y & 1) != 0;
                Rect uv = new Rect(flipX ? .265f : .19f, flipY ? 1 : .96f, flipX ? -.075f : .075f, flipY ? -.04f : .04f);
                GUI.DrawTextureWithTexCoords(new Rect(x * 420, y * 140, 420, 140), deckTexture, uv, false);
            }
    }

    private void DrawDeckWayfinding()
    {
        Color[] colors = { Cyan, Gold, Hex("c49aff"), Mint };
        string[] names = { "FROST QUARTER", "SOLAR QUARTER", "STORM QUARTER", "VERDANT QUARTER" };
        Vector2[] labels = { DeckPoint(445, 270), DeckPoint(835, 270), DeckPoint(445, 485), DeckPoint(835, 485) };
        for (int i = 0; i < labels.Length; i++)
        {
            Vector2 at = labels[i];
            Fill(at.x - 100, at.y, 200, 3, new Color(colors[i].r, colors[i].g, colors[i].b, .6f));
            TextCentered(names[i], at.x - 115, at.y + 7, 230, 24, new GUIStyle(smallStyle) { fontSize = 15, normal = { textColor = colors[i] } });
        }
        DrawDeckGate(DeckPoint(30, 356), true); DrawDeckGate(DeckPoint(1250, 356), true);
        DrawDeckGate(DeckPoint(640, 24), false); DrawDeckGate(DeckPoint(640, 774), false);
    }

    private void DrawDeckGate(Vector2 at, bool vertical)
    {
        Fill(at.x - (vertical ? 8 : 68), at.y - (vertical ? 68 : 8), vertical ? 16 : 136, vertical ? 136 : 16, Hex("153b60"));
        Fill(at.x - (vertical ? 2 : 68), at.y - (vertical ? 68 : 2), vertical ? 4 : 136, vertical ? 136 : 4, Cyan);
        for (int i = -2; i <= 2; i++) Fill(at.x + (vertical ? -12 : i * 24), at.y + (vertical ? i * 24 : -12), 24, 24, new Color(.3f, .9f, 1, .12f));
    }

    private void DrawDeckNavigator()
    {
        if (!FieldControlsAvailable) return;
        Rect panel = new Rect(1050, 117, 202, 151);
        ConsolePanel(panel, Cyan, Hex("122c48"));
        Text("WAYFARER", 1062, 121, 170, 22, new GUIStyle(smallStyle) { fontSize = 12, normal = { textColor = Cyan } });
        Rect map = new Rect(1060, 148, 182, 108);
        Color old = GUI.color; GUI.color = new Color(1, 1, 1, .8f);
        if (deckTexture != null) GUI.DrawTexture(map, deckTexture, ScaleMode.StretchToFill); GUI.color = old;
        foreach (SalvageNode node in nodes) if (!node.Collected && phase == Phase.Day) NavigatorDot(map, node.Position, node.Color, 4);
        for (int i = 0; i < turretCount; i++) NavigatorDot(map, turretPads[i], Gold, 4);
        NavigatorDot(map, corePosition, Gold, 7); NavigatorDot(map, pilotPosition, Color.white, 6);
        Vector2 core = WorldToScreen(corePosition);
        if (core.x < 95 || core.x > 1185 || core.y < 115 || core.y > 645)
        {
            Vector2 at = new Vector2(Mathf.Clamp(core.x, 220, 970), Mathf.Clamp(core.y, 145, 630));
            MenuPill("HELIOS CORE", new Rect(at.x - 65, at.y - 14, 130, 28), Gold);
        }
    }

    private void NavigatorDot(Rect map, Vector2 position, Color color, float size)
    {
        Vector2 p = DeckLocal(position);
        Fill(map.x + p.x / 1280 * map.width - size / 2, map.y + p.y / 800 * map.height - size / 2, size, size, color);
    }
}
