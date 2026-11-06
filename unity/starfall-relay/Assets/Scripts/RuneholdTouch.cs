using UnityEngine;

public sealed partial class RuneholdGame
{
    private Vector2 touchMove;
    private int moveFinger = -1;
    private bool mouseMoveStick, touchBoost, touchNova;
    private static readonly Vector2 StickCenter = new Vector2(137, 624);
    private bool FieldControlsAvailable => !menuOpen && !pauseOpen && !raidBriefOpen && !buildPanelOpen && !learningPanelOpen && (phase == Phase.Day || phase == Phase.Night);

    private Vector2 InterfacePoint(Vector2 screen)
    {
        Rect safe = Screen.safeArea;
        float scale = Mathf.Min(safe.width / DesignWidth, safe.height / DesignHeight);
        Vector2 margin = new Vector2(safe.x + (safe.width - DesignWidth * scale) / 2, Screen.height - safe.yMax + (safe.height - DesignHeight * scale) / 2);
        return (new Vector2(screen.x, Screen.height - screen.y) - margin) / scale;
    }

    private void UpdateTouchMovement()
    {
        if (!FieldControlsAvailable)
        { moveFinger = -1; mouseMoveStick = false; touchMove = Vector2.zero; touchBoost = touchNova = false; return; }
        bool found = false;
        foreach (Touch touch in Input.touches)
        {
            Vector2 at = InterfacePoint(touch.position);
            if (touch.phase == TouchPhase.Began)
            {
                if (new Rect(1020, 602, 106, 68).Contains(at)) touchBoost = true;
                if (phase == Phase.Night && new Rect(1140, 583, 112, 87).Contains(at)) touchNova = true;
                if (phase == Phase.Day && new Rect(778, 717, 210, 57).Contains(at)) { buildPanelOpen = true; break; }
                if (phase == Phase.Day && new Rect(1002, 717, 250, 57).Contains(at)) { RequestNightLaunch(); break; }
                if (new Rect(22, 17, 102, 53).Contains(at)) { OpenAcademyMenu(HubPage.Home); break; }
            }
            if (moveFinger < 0 && touch.phase == TouchPhase.Began && (at - StickCenter).sqrMagnitude < 105 * 105) moveFinger = touch.fingerId;
            if (touch.fingerId != moveFinger) continue;
            found = true;
            if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) { moveFinger = -1; touchMove = Vector2.zero; }
            else touchMove = StickDirection(at);
        }
        if (Input.touchCount > 0)
        { if (!found) { moveFinger = -1; touchMove = Vector2.zero; } return; }
        moveFinger = -1;
        Vector2 mouse = InterfacePoint(Input.mousePosition);
        if (Input.GetMouseButtonDown(0) && (mouse - StickCenter).sqrMagnitude < 105 * 105) mouseMoveStick = true;
        if (!Input.GetMouseButton(0)) mouseMoveStick = false;
        touchMove = mouseMoveStick ? StickDirection(mouse) : Vector2.zero;
    }

    private Vector2 StickDirection(Vector2 point)
    {
        Vector2 delta = (point - StickCenter) / 58;
        return delta.sqrMagnitude < .025f ? Vector2.zero : Vector2.ClampMagnitude(delta, 1);
    }

    private void OnApplicationFocus(bool focused)
    {
        if (!focused) { touchMove = Vector2.zero; moveFinger = -1; mouseMoveStick = touchBoost = touchNova = false; }
    }

    private void DrawTouchControls()
    {
        if (!FieldControlsAvailable) return;
        DrawPixelEllipse(StickCenter, 81, 81, new Color(.02f, .07f, .15f, .7f));
        DrawPixelEllipse(StickCenter, 69, 69, new Color(.25f, .75f, 1, .15f));
        for (int i = 0; i < 4; i++)
        {
            float angle = i * Mathf.PI / 2;
            Vector2 at = StickCenter + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * 57;
            Fill(at.x - 3, at.y - 3, 6, 6, Cyan);
        }
        DrawPixelEllipse(StickCenter + touchMove * 39, 27, 27, Hex("37628a"));
        DrawPixelEllipse(StickCenter + touchMove * 39 - new Vector2(0, 3), 24, 24, Cyan);
        TextCentered("MOVE", 83, 718, 108, 24, new GUIStyle(smallStyle) { fontSize = 13, normal = { textColor = Cyan } });
        if (MenuButton(dashCooldown <= 0 ? "BOOST" : "BOOST  " + dashCooldown.ToString("0.0"), new Rect(1020, 602, 106, 68), Cyan, dashCooldown <= 0)) touchBoost = true;
        if (phase == Phase.Night)
        {
            if (MenuButton(pulseCharge >= 100 ? "NOVA!" : "NOVA  " + Mathf.FloorToInt(pulseCharge) + "%", new Rect(1140, 583, 112, 87), Gold, pulseCharge >= 100, pulseCharge >= 100)) touchNova = true;
        }
    }
}
