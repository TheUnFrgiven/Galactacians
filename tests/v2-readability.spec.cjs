const { test, expect } = require("@playwright/test");

const cell = (page, row, col) =>
  page.locator(`.gb-cell[data-row="${row}"][data-col="${col}"]`);
async function openFirst(page) {
  await page.clock.install();
  await page.goto("/#mission/first-contact");
  await expect(page.locator(".gb-battle")).toBeVisible();
  await page.clock.pauseAt(new Date());
}

test("first placement starts the countdown, with visible guidance and no extra start gate", async ({
  page,
}) => {
  await openFirst(page);
  await expect(page.locator(".gb-wave-text")).toHaveText("Place a defender");
  await expect(page.locator(".gb-cell-guided")).toHaveCount(2);
  await page.clock.runFor(30000);
  await expect(page.locator(".gb-alien")).toHaveCount(0);
  await expect(page.locator(".gb-wave-text")).toHaveText("Place a defender");
  await cell(page, 1, 2).click();
  await expect(page.locator(".gb-energy")).toHaveText("8");
  await expect(page.locator(".gb-wave-text")).toHaveText("Incoming in 8");
  await expect(page.locator(".gb-coach")).toContainText("Cover both");
  await cell(page, 3, 2).click();
  await page.clock.runFor(8100);
  await expect(page.locator(".gb-wave-text")).toHaveText("Wave 1");
  await expect(page.locator(".gb-start-button")).toHaveCount(0);
  await page.clock.runFor(1300);
  await expect(page.locator(".gb-alien").first()).toBeVisible();
});

test("range previews match directional, area and blocking rules without spending energy", async ({
  page,
}) => {
  await openFirst(page);
  const range = page.locator(".gb-range-preview");
  await page.locator('.gb-tower-card[data-tower="pebble"]').click();
  await cell(page, 2, 2).hover();
  await expect(range).toHaveAttribute("data-preview-tower", "pebble");
  await expect(range).toHaveAttribute("data-lanes", "3-3");
  const getRange = () =>
    page
      .locator(".gb-range-target")
      .evaluate((el) => ({
        left: parseFloat(el.style.left),
        width: parseFloat(el.style.width),
        height: parseFloat(el.style.height),
      }));
  const rapid = await getRange();
  expect(rapid.left).toBeCloseTo((2.3 / 7) * 100, 1);
  expect(rapid.width).toBeCloseTo((2.2 / 7) * 100, 1);
  expect(rapid.height).toBe(20);
  await page.locator('.gb-tower-card[data-tower="frost"]').click();
  await cell(page, 2, 2).focus();
  await expect(range).toHaveAttribute("data-lanes", "2-4");
  expect((await getRange()).left).toBe(0);
  expect((await getRange()).height).toBe(60);
  await page.keyboard.press("ArrowUp");
  await expect(range).toHaveAttribute("data-lanes", "1-3");
  await page.locator('.gb-tower-card[data-tower="bricky"]').click();
  await cell(page, 2, 2).hover();
  expect((await getRange()).width).toBeCloseTo((0.72 / 7) * 100, 1);
  await page.locator('.gb-tower-card[data-tower="poppy"]').click();
  await cell(page, 2, 2).hover();
  await expect(page.locator(".gb-range-splash")).toBeVisible();
  await expect(page.locator(".gb-energy")).toHaveText("10");
  await expect(page.locator(".gb-occupied")).toHaveCount(0);
});

test("incoming signals identify the actual lane and alien before its arrival", async ({
  page,
}) => {
  await openFirst(page);
  await cell(page, 1, 2).click();
  await page.clock.runFor(6200);
  await expect(page.locator('.gb-lane-warning[data-lane="1"]')).toBeVisible();
  await expect(
    page.locator('.gb-lane[data-lane="1"] .gb-incoming'),
  ).toHaveAttribute("data-incoming", "scout");
  await expect(page.locator('.gb-lane[data-lane="0"]')).not.toHaveClass(
    /gb-lane-warning/,
  );
  await expect(page.locator(".gb-alien")).toHaveCount(0);
  await page.clock.runFor(3100);
  await expect(page.locator(".gb-alien-scout")).toHaveCount(1);
});

test("touch placement and multi-lane previews stay readable on a phone", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFirst(page);
  await page.locator('.gb-tower-card[data-tower="frost"]').tap();
  await cell(page, 2, 2).tap();
  await expect(cell(page, 2, 2)).toHaveClass(/gb-occupied/);
  await expect(page.locator(".gb-energy")).toHaveText("7");
  await expect(page.locator(".gb-range-preview")).toHaveAttribute(
    "data-lanes",
    "2-4",
  );
  const bounds = await page.locator(".gb-tower-tray").boundingBox();
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const style = await page
    .locator(".gb-lane")
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el, "::before").backgroundImage,
      border: getComputedStyle(el, "::before").borderTopWidth,
    }));
  expect(style.background).not.toBe("none");
  expect(parseFloat(style.border)).toBeGreaterThan(0);
  await page.screenshot({
    path: testInfo.outputPath("readable-field-mobile.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await context.close();
});
