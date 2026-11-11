using System.Collections.Generic;
using UnityEngine;

public sealed partial class RuneholdGame
{
    private readonly List<Vector2> resourceRoute = new List<Vector2>();
    private readonly List<Rect> worldLabels = new List<Rect>();
    private int routeStep;
    private const int RouteWidth = 70, RouteHeight = 44;
    private const float RouteCell = 32;
    private static readonly Rect NextStepAction = new Rect(250, 702, 420, 72);

    private Vector2 RouteCellPosition(int index) => new Vector2(-464 + index % RouteWidth * RouteCell, -254 + index / RouteWidth * RouteCell);
    private bool ClearDeckSegment(Vector2 a, Vector2 b)
    {
        int steps = Mathf.Max(1, Mathf.CeilToInt(Vector2.Distance(a, b) / 7));
        for (int i = 0; i <= steps; i++) if (!CanStandOnDeck(Vector2.Lerp(a, b, i / (float)steps))) return false;
        return true;
    }

    private void NavigateToSalvage(SalvageNode node)
    {
        if (node == null || node.Collected || phase != Phase.Day) return;
        Vector2 goal = NearestDeckPosition(node.Position);
        bool[] floor = new bool[RouteWidth * RouteHeight];
        int start = -1, end = -1; float startDistance = float.MaxValue, endDistance = float.MaxValue;
        for (int i = 0; i < floor.Length; i++)
        {
            Vector2 p = RouteCellPosition(i); floor[i] = CanStandOnDeck(p); if (!floor[i]) continue;
            float a = (p - pilotPosition).sqrMagnitude, b = (p - goal).sqrMagnitude;
            if (a < startDistance && ClearDeckSegment(pilotPosition, p)) { start = i; startDistance = a; }
            if (b < endDistance && ClearDeckSegment(p, goal)) { end = i; endDistance = b; }
        }
        if (start < 0 || end < 0) return;
        int[] previous = new int[floor.Length]; for (int i = 0; i < previous.Length; i++) previous[i] = -1;
        var queue = new Queue<int>(); queue.Enqueue(start); previous[start] = start;
        int[] offsets = { -1, 1, -RouteWidth, RouteWidth };
        while (queue.Count > 0 && previous[end] < 0)
        {
            int current = queue.Dequeue();
            foreach (int offset in offsets)
            {
                int next = current + offset;
                if (next < 0 || next >= floor.Length || !floor[next] || previous[next] >= 0) continue;
                if (Mathf.Abs(next % RouteWidth - current % RouteWidth) + Mathf.Abs(next / RouteWidth - current / RouteWidth) != 1) continue;
                if (!ClearDeckSegment(RouteCellPosition(current), RouteCellPosition(next))) continue;
                previous[next] = current; queue.Enqueue(next);
            }
        }
        resourceRoute.Clear(); routeStep = 0;
        if (previous[end] < 0) { notice = "Use the move stick to explore another path."; noticeTimer = 3; return; }
        for (int at = end; at != start; at = previous[at]) resourceRoute.Add(RouteCellPosition(at));
        resourceRoute.Add(RouteCellPosition(start)); resourceRoute.Reverse(); resourceRoute.Add(goal);
        notice = "On our way! Use the stick any time to take over."; noticeTimer = 3;
    }

    private Vector2 ResolveRouteMove(Vector2 manual, float dt)
    {
        if (manual.sqrMagnitude > .01f) { resourceRoute.Clear(); routeStep = 0; return manual; }
        while (routeStep < resourceRoute.Count && Vector2.Distance(pilotPosition, resourceRoute[routeStep]) < 6) routeStep++;
        if (phase != Phase.Day || routeStep >= resourceRoute.Count) return manual;
        Vector2 delta = resourceRoute[routeStep] - pilotPosition;
        float speed = 218 + Mathf.Min(16, UpgradeLevel(Upgrade.SalvageRig)) * 10;
        return delta.normalized * Mathf.Min(1, delta.magnitude / Mathf.Max(.01f, speed * dt));
    }

    private SalvageNode NextHelpfulCache()
    {
        SalvageNode nearest = null; float distance = float.MaxValue;
        foreach (SalvageNode node in nodes)
        {
            if (node.Collected || turretCount == 0 && alloy >= 3 && crystal < 1 && node.Kind != MaterialKind.Crystal) continue;
            float d = (node.Position - pilotPosition).sqrMagnitude;
            if (d < distance) { nearest = node; distance = d; }
        }
        return nearest;
    }

    private void FollowNextStep()
    {
        if (turretCount == 0 && alloy >= 3 && crystal >= 1) { OpenEquipmentBay(Upgrade.IonTurret); return; }
        SalvageNode next = NextHelpfulCache();
        if (next != null) NavigateToSalvage(next); else OpenEquipmentBay(RecommendedUpgrade);
    }

    private void DrawResourceRoute()
    {
        if (phase != Phase.Day || routeStep >= resourceRoute.Count) return;
        Vector2 previous = pilotPosition;
        for (int i = routeStep; i < resourceRoute.Count; i++)
        {
            Vector2 next = resourceRoute[i]; float length = Vector2.Distance(previous, next);
            for (float t = 12; t < length; t += 24) DrawPixelEllipse(Vector2.Lerp(previous, next, t / length), 4, 4, Mint);
            if (i % 2 == 0) DrawPixelEllipse(next, 4, 4, Mint);
            previous = next;
        }
    }

    private Rect PlaceWorldLabel(Vector2 anchor, float width = 184)
    {
        Rect bounds = new Rect(16, 112, 1248, 548);
        Vector2 player = WorldToScreen(pilotPosition);
        Rect playerArea = new Rect(player.x - 48, player.y - 52, 96, 106);
        Vector2[] offsets = { new Vector2(-width / 2, 40), new Vector2(-width / 2, -112), new Vector2(48, -30), new Vector2(-width - 48, -30) };
        foreach (Vector2 offset in offsets)
        {
            Rect label = new Rect(anchor + offset, new Vector2(width, 62));
            if (!bounds.Contains(label.min) || !bounds.Contains(label.max) || label.Overlaps(playerArea)) continue;
            if (label.Overlaps(new Rect(1048, 108, 208, navigatorOpen ? 212 : 60))) continue;
            if (label.Overlaps(new Rect(StickCenter.x - 100, StickCenter.y - 100, 200, 200))) continue;
            if (label.Overlaps(new Rect(24, 112, 316, 82))) continue;
            if (label.Overlaps(BoostAction) || phase == Phase.Night && label.Overlaps(NovaAction)) continue;
            if (label.Overlaps(new Rect(355, 110, 565, 82))) continue;
            bool overlaps = false;
            foreach (Rect other in worldLabels) if (other.Overlaps(label)) { overlaps = true; break; }
            if (!overlaps) { worldLabels.Add(label); return label; }
        }
        return Rect.zero;
    }

    private void DrawWorldActions()
    {
        if (!FieldControlsAvailable || phase != Phase.Day) return;
        worldLabels.Clear();
        foreach (SalvageNode node in nodes)
        {
            if (node.Collected) continue;
            Vector2 at = WorldToScreen(node.Position);
            if (at.x < 40 || at.x > 1240 || at.y < 125 || at.y > 620) continue;
            Rect label = PlaceWorldLabel(at); if (label.width == 0) continue;
            Color color = node.Kind == MaterialKind.Alloy ? Cyan : Gold;
            UiCard(label, color);
            DrawPickup(node.Kind, new Vector2(label.x + 26, label.center.y), 36, Color.white);
            UiText((node.Kind == MaterialKind.Alloy ? "Metal +" : "Crystals +") + SalvageAmount(node), new Rect(label.x + 51, label.y + 7, label.width - 60, 26), 20, true);
            UiText("Tap to collect", new Rect(label.x + 51, label.y + 33, label.width - 60, 23), 17, false, UiMuted);
            if (GUI.Button(label, GUIContent.none, GUIStyle.none)) { NavigateToSalvage(node); PlayRelaySound(4, .5f); }
        }
        foreach (Upgrade kind in new[] { Upgrade.IonTurret, Upgrade.CoreShield, Upgrade.SalvageRig })
        {
            int count = HardwareCount(kind), slots = HardwareSlots(kind);
            for (int i = 0; i < Mathf.Min(count + 1, slots); i++)
            {
                bool installed = i < count;
                Vector2 p = kind == Upgrade.IonTurret ? turretPads[i] : kind == Upgrade.CoreShield ? shieldPads[i] : salvagePads[i];
                Vector2 at = WorldToScreen(p);
                if (at.x < 60 || at.x > 1220 || at.y < 130 || at.y > 615) continue;
                if (installed && kind != Upgrade.IonTurret && Vector2.Distance(pilotPosition, p) > 240) continue;
                Rect label = PlaceWorldLabel(at, 204); if (label.width == 0) continue;
                string title = installed ? (kind == Upgrade.IonTurret ? "Tower " + (i + 1) : FriendlyUpgrade(kind)) : "Build " + (kind == Upgrade.IonTurret ? "a tower" : kind == Upgrade.CoreShield ? "a shield" : "a helper");
                UiCard(label, UpgradeColor(kind));
                UiText(title, new Rect(label.x + 13, label.y + 6, label.width - 26, 27), 20, true);
                UiText(installed ? "Tap to upgrade" : "Tap to build", new Rect(label.x + 13, label.y + 34, label.width - 26, 22), 17, false, UiBlue);
                if (GUI.Button(label, GUIContent.none, GUIStyle.none)) { OpenEquipmentBay(kind, kind == Upgrade.IonTurret && installed); resourceRoute.Clear(); PlayRelaySound(4, .5f); }
            }
        }
    }
}
