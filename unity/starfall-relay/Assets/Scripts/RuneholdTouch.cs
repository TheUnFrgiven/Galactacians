using UnityEngine;

public sealed partial class RuneholdGame
{
    private Vector2 touchMove;
    private int moveFinger = -1;
    private bool mouseMoveStick, touchBoost, touchNova;
    private static readonly Vector2 StickCenter = new Vector2(124, 586);
    private bool FieldControlsAvailable => !guideOpen && !menuOpen && !pauseOpen && !raidBriefOpen && !buildPanelOpen && !learningPanelOpen && (phase == Phase.Day || phase == Phase.Night);

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
                if (BoostAction.Contains(at)) touchBoost = true;
                if (phase == Phase.Night && NovaAction.Contains(at)) touchNova = true;
                if (phase == Phase.Day && BuildAction.Contains(at)) { OpenEquipmentBay(RecommendedUpgrade); break; }
                if (phase == Phase.Day && LaunchAction.Contains(at)) { RequestNightLaunch(); break; }
                if (MenuAction.Contains(at)) { OpenAcademyMenu(HubPage.Home); break; }
            }
            if (touch.phase == TouchPhase.Began && GuideHelpAction.Contains(at)) OpenContextHelp();
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
        UiDot(StickCenter, 83, new Color(.06f, .16f, .29f, .8f));
        UiDot(StickCenter, 71, Hex("d7ecf9"));
        for (int i = 0; i < 4; i++)
        {
            float angle = i * Mathf.PI / 2;
            UiDot(StickCenter + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * 56, 4, UiBlue);
        }
        UiDot(StickCenter + touchMove * 39 + new Vector2(0, 4), 29, Hex("9bbbd9"));
        UiDot(StickCenter + touchMove * 39, 28, UiBlue);
        UiText("Move", new Rect(70, 711, 108, 40), 23, true, UiInk, TextAnchor.MiddleCenter);
        if (MenuButton(dashCooldown <= 0 ? "Boost" : dashCooldown.ToString("0.0") + "s", BoostAction, Cyan, dashCooldown <= 0)) touchBoost = true;
        if (phase == Phase.Night && MenuButton(pulseCharge >= 100 ? "Blast!" : Mathf.FloorToInt(pulseCharge) + "%", NovaAction, Gold, pulseCharge >= 100, pulseCharge >= 100)) touchNova = true;
        if (phase == Phase.Night) UiText("Blast", new Rect(1148, 652, 108, 26), 19, true, Color.white, TextAnchor.MiddleCenter);
    }
}
