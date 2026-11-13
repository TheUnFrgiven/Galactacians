using UnityEngine;

public sealed partial class RuneholdGame
{
    // Fixed map offsets: these signs never jump above/below an object to avoid other UI.
    private void DrawMapSign(string name, Vector2 position, Color accent, bool build, Upgrade? upgrade = null)
    {
        Vector2 at = WorldToScreen(position);
        Rect sign = new Rect(at.x - 59, at.y, 118, 31);
        if (sign.xMax < 0 || sign.x > DesignWidth || sign.yMax < 98 || sign.y > 682) return;
        Fill(at.x - 2, at.y - 14, 4, 14, PixelEdge);
        PixelSurface(new Rect(sign.x, sign.y + 3, sign.width, sign.height), Hex("152b43"), 4);
        PixelSurface(sign, PixelEdge, 4);
        PixelSurface(new Rect(sign.x + 2, sign.y + 2, sign.width - 4, sign.height - 4), Hex("fffdf8"), 2);
        Fill(sign.x + 4, sign.y + 5, 3, sign.height - 10, accent);
        UiText(name, new Rect(sign.x + 5, sign.y, sign.width - (build ? 25 : 10), sign.height), 18, true, UiInk, TextAnchor.MiddleCenter);
        if (build) UiText("+", new Rect(sign.xMax - 23, sign.y, 20, sign.height), 21, true, UiBlue, TextAnchor.MiddleCenter);
        if (!upgrade.HasValue || !FieldControlsAvailable || phase != Phase.Day || sign.y < 112 || sign.yMax > 666) return;
        if (sign.Overlaps(new Rect(StickCenter.x - 100, StickCenter.y - 100, 200, 200)) || sign.Overlaps(BoostAction) || sign.Overlaps(new Rect(1094, 112, 162, 54))) return;
        if (GUI.Button(sign, GUIContent.none, GUIStyle.none))
        {
            OpenEquipmentBay(upgrade.Value, upgrade == Upgrade.IonTurret && !build);
            PlayRelaySound(4, .5f);
        }
    }

    private void DrawWorldActions()
    {
        if (phase != Phase.Day && phase != Phase.Night && phase != Phase.Warning) return;
        if (phase == Phase.Day)
            foreach (SalvageNode node in nodes)
                if (!node.Collected) DrawMapSign(node.Kind == MaterialKind.Alloy ? "Metal +" + SalvageAmount(node) : "Crystal +" + SalvageAmount(node), node.Position + new Vector2(0, 54), node.Color, false);
        foreach (Upgrade kind in new[] { Upgrade.IonTurret, Upgrade.CoreShield, Upgrade.SalvageRig })
        {
            int count = HardwareCount(kind), slots = HardwareSlots(kind);
            for (int i = 0; i < Mathf.Min(count + (phase == Phase.Day ? 1 : 0), slots); i++)
            {
                bool installed = i < count;
                Vector2 p = kind == Upgrade.IonTurret ? turretPads[i] : kind == Upgrade.CoreShield ? shieldPads[i] : salvagePads[i];
                DrawMapSign(UpgradeName(kind), p + new Vector2(0, 68), UpgradeColor(kind), !installed, kind);
            }
        }
    }
}
