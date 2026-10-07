const { test, expect } = require("@playwright/test");

async function openMission(page) {
  await page.goto("/#mission/first-contact", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator(".gb-battle")).toBeVisible();
}

async function readCombat(page) {
  return page.evaluate(() => ({
    aliens: [...document.querySelectorAll(".gb-alien")].map((node) =>
      node.getAttribute("style"),
    ),
    energy: document.querySelector(".gb-energy").textContent,
    wave: document.querySelector(".gb-wave-text").textContent,
    occupied: document.querySelectorAll(".gb-occupied").length,
  }));
}

test("mission menu replaces sidebar on desktop and closes without resetting defenders", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openMission(page);
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  expect((await page.locator(".workspace").boundingBox()).x).toBe(0);
  await page.locator('[data-tower="pebble"]').click();
  await page.locator('.gb-cell[data-row="1"][data-col="0"]').click();
  await expect(page.locator(".gb-occupied")).toHaveCount(1);
  await expect(page.locator(".gb-energy")).toHaveText("4");

  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(dialog).toContainText("Mission paused");
  for (const name of [
    "Play",
    "Defenders",
    "Practice",
    "Planet shop",
    "Settings",
    "Your profile",
  ]) {
    await expect(dialog.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await expect(page).toHaveURL(/#mission\/first-contact$/);
  await expect(page.locator(".gb-occupied")).toHaveCount(1);
  await expect(page.locator(".gb-energy")).toHaveText("4");

  await menu.click();
  await page.getByRole("button", { name: "Back to defending" }).click();
  await expect(menu).toBeFocused();
  await expect(page.locator(".gb-occupied")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("menu navigation leaves the mission and keeps the hub free of a sidebar", async ({
  page,
}) => {
  await openMission(page);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Defenders", exact: true })
    .click();
  await expect(page).toHaveURL(/#towers$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await expect(page.locator(".tower-card")).toHaveCount(5);
  await expect(page.locator(".gb-battle")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeVisible();
});

test("the native menu pauses active aliens and closing it resumes the same wave", async ({
  page,
}) => {
  await page.clock.install();
  await openMission(page);
  await page.clock.pauseAt(new Date());
  await page.locator('[data-tower="pebble"]').click();
  await page.locator('.gb-cell[data-row="1"][data-col="0"]').click();
  await page.clock.runFor(12500);
  await expect(page.locator(".gb-alien").first()).toBeVisible();

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.clock.runFor(50);
  await expect(page.locator(".gb-battle")).toHaveClass(/gb-is-paused/);
  const paused = await readCombat(page);
  await page.clock.runFor(10000);
  expect(await readCombat(page)).toEqual(paused);
  await page.getByRole("button", { name: "Back to defending" }).click();
  await page.clock.runFor(600);
  await expect(page.locator(".gb-battle")).not.toHaveClass(/gb-is-paused/);
  expect((await readCombat(page)).aliens).not.toEqual(paused.aliens);
  await expect(page.locator(".gb-occupied")).toHaveCount(1);
});

test("mobile mission has no bottom navigation and menu fits within the viewport", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMission(page);
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(page.locator(".workspace")).toHaveCSS("padding-bottom", "0px");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(menu).toBeVisible();
  await menu.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  const bounds = await dialog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await expect(
    dialog.getByRole("link", { name: "Settings", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("mission-menu-mobile.png"),
    animations: "disabled",
  });
  await dialog.getByRole("link", { name: "Your profile", exact: true }).click();
  await expect(page).toHaveURL(/#settings$/);
  await expect(page.getByLabel("What should we call you?")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
});
