const { test, expect } = require("@playwright/test");

async function setup(page, { reducedMotion = false } = {}) {
  await page.route("**/__earth-test", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><link rel="stylesheet" href="/src/v2/app.css"><link rel="stylesheet" href="/src/v2/battle.css"></head><body><main id="field"></main><dialog id="test-menu">Menu</dialog></body></html>',
    }),
  );
  await page.goto("/__earth-test");
  await page.evaluate(async (reducedMotion) => {
    let now = 100,
      callback;
    requestAnimationFrame = (fn) => {
      callback = fn;
      return 1;
    };
    cancelAnimationFrame = () => {
      callback = null;
    };
    performance.now = () => now;
    window.advanceEarth = (seconds) => {
      const end = now + seconds * 1000;
      while (now < end && callback) {
        now += Math.min(50, end - now);
        callback(now);
      }
    };
    const { mountBattle } = await import("/src/v2/battle.js");
    window.battle = mountBattle(document.querySelector("#field"), {
      startingEnergy: 50,
      settings: { reducedMotion },
    });
    advanceEarth(0.1);
  }, reducedMotion);
  // Defend an inactive lane so real aliens can approach without test-state hooks.
  await page.locator('[data-tower="bricky"]').click();
  await page.locator('.gb-cell[data-row="0"][data-col="0"]').click();
  await page.evaluate(() => advanceEarth(8));
}

test("Earth worries only when live aliens get close and relaxes after the defense clears them", async ({
  page,
}, testInfo) => {
  await setup(page);
  const earth = page.locator(".gb-earth");
  await expect(earth).toHaveAttribute("data-mood", "happy");
  await expect(page.locator(".gb-face-worried")).not.toBeVisible();
  await expect(page.locator(".gb-progress-strip")).toHaveCount(0);
  await page.evaluate(() => advanceEarth(8));
  await expect(earth).toHaveAttribute("data-mood", "happy");
  for (
    let i = 0;
    i < 35 && (await earth.getAttribute("data-mood")) !== "worried";
    i++
  )
    await page.evaluate(() => advanceEarth(1));
  await expect(earth).toHaveAttribute("data-mood", "worried");
  await expect(earth).toHaveAttribute("aria-label", /Aliens are getting close/);
  await expect(page.locator(".gb-face-worried")).toBeVisible();
  await expect(page.locator(".gb-face-happy")).not.toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("earth-worried.png"),
    fullPage: true,
  });
  await page.evaluate(() => document.querySelector("#test-menu").showModal());
  const before = await page.locator(".gb-alien").first().getAttribute("style");
  await page.evaluate(() => advanceEarth(20));
  await expect(earth).toHaveAttribute("data-mood", "worried");
  await expect(page.locator(".gb-alien").first()).toHaveAttribute(
    "style",
    before,
  );
  expect(
    await page
      .locator(".gb-alien>svg")
      .first()
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("paused");
  await page.evaluate(() => document.querySelector("#test-menu").close());
  await page.locator('[data-tower="pebble"]').click();
  for (const row of [1, 3])
    await page.locator(`.gb-cell[data-row="${row}"][data-col="0"]`).click();
  for (
    let i = 0;
    i < 15 && (await earth.getAttribute("data-mood")) === "worried";
    i++
  )
    await page.evaluate(() => advanceEarth(1));
  await expect(earth).toHaveAttribute("data-mood", "happy");
  await expect(page.locator(".gb-face-happy")).toBeVisible();
  await expect(page.locator(".gb-face-worried")).not.toBeVisible();
  await expect(page.locator(".gb-health")).toHaveAttribute(
    "aria-label",
    "Earth shield: 5 of 5",
  );
  await expect(page.locator(".gb-start-button")).toHaveCount(0);
});

test("reduced motion keeps the distance-based expression without decorative animation", async ({
  page,
}) => {
  await setup(page, { reducedMotion: true });
  for (
    let i = 0;
    i < 40 &&
    (await page.locator(".gb-earth").getAttribute("data-mood")) !== "worried";
    i++
  )
    await page.evaluate(() => advanceEarth(1));
  await expect(page.locator(".gb-earth")).toHaveAttribute(
    "data-mood",
    "worried",
  );
  for (const selector of [
    ".gb-earth-land",
    ".gb-alien>svg",
    ".gb-star-stream path",
    ".gb-space-star",
  ]) {
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  }
  await page.evaluate(() => advanceEarth(100));
  await expect(page.locator(".gb-earth")).toHaveAttribute("data-mood", "happy");
  await expect(page.locator(".gb-health")).toHaveAttribute(
    "aria-label",
    "Earth shield: 0 of 5",
  );
  await expect(page.locator(".gb-result-banner")).toBeVisible();
});
