using UnityEngine;

public sealed partial class RuneholdGame
{
    private int homeChoice, moreChoice;

    private void NavigateHub(HubPage page)
    {
        hubPage = page; menuNavPending = false;
        if (page == HubPage.Home) homeChoice = 0;
        menuClearFocus = true;
    }

    private HubPage MenuParent => hubPage == HubPage.Progress || hubPage == HubPage.Achievements || hubPage == HubPage.Armory ? HubPage.More
        : hubPage == HubPage.Lesson || hubPage == HubPage.Results || hubPage == HubPage.Practice ? HubPage.Galaxy : HubPage.Home;

    private void DrawRelayMenuShell()
    {
        Fill(0, 0, 1280, 800, Hex("f2f6fa"));
        if (hubPage == HubPage.Home) return;
        if (MenuLink("<  Back", new Rect(207, 35, 180, 58))) NavigateHub(MenuParent);
        if (MenuLink("Ask for help", new Rect(889, 35, 184, 58), false, TextAnchor.MiddleRight)) OpenContextHelp();
    }

    private void ChooseHomeAction()
    {
        menuNavPending = false;
        if (homeChoice == 0) ResumeExpedition();
        else NavigateHub(homeChoice == 1 ? HubPage.Galaxy : homeChoice == 2 ? HubPage.More : HubPage.Settings);
    }

    private void DrawRelayHome()
    {
        DrawStarfallWordmark(new Vector2(530, 131));
        UiText("A maths space adventure", new Rect(350, 176, 580, 44), 24, false, UiMuted, TextAnchor.MiddleCenter);
        DrawMenuPilot(new Vector2(446, 413), -8, 2.6f);
        UiText(learningProfile.CadetName, new Rect(316, 562, 260, 40), 26, true, UiInk, TextAnchor.MiddleCenter);
        UiText("Level " + astronautLevel, new Rect(316, 606, 260, 30), 20, false, UiMuted, TextAnchor.MiddleCenter);
        if (MenuButton("Play", new Rect(650, 295, 330, 82), Cyan, true, true)) ResumeExpedition();
        if (MenuLink("Learn maths", new Rect(650, 404, 330, 64), menuNavPending && homeChoice == 1)) NavigateHub(HubPage.Galaxy);
        if (MenuLink("My stuff", new Rect(650, 484, 330, 64), menuNavPending && homeChoice == 2)) NavigateHub(HubPage.More);
        if (MenuLink("Settings", new Rect(650, 564, 330, 64), menuNavPending && homeChoice == 3)) NavigateHub(HubPage.Settings);
        if (menuNavPending && homeChoice == 0) Fill(634, 327, 5, 18, UiBlue);
        if (MenuLink("Ask for help", new Rect(490, 712, 300, 52), false, TextAnchor.MiddleCenter)) OpenContextHelp();
    }

    private void DrawMoreMenu()
    {
        HubHeading("My stuff", "");
        string[] labels = { "Rewards & colors", "My progress", "Space tools" };
        HubPage[] pages = { HubPage.Achievements, HubPage.Progress, HubPage.Armory };
        for (int i = 0; i < labels.Length; i++)
        {
            Rect row = new Rect(454, 274 + i * 118, 626, 82);
            if (MenuLink(labels[i], row, menuNavPending && moreChoice == i)) NavigateHub(pages[i]);
            Fill(row.x, row.yMax + 12, row.width, 1, UiLine);
        }
    }
}
