const { test, expect } = require("@playwright/test");

// A standalone field exercises the real DOM controls and engine. The controllable
// animation frame clock makes several complete battles deterministic and fast.
async function mount(page, options = {}) {
  await page.route("**/__battle-test", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><link rel="stylesheet" href="/src/v2/battle.css"></head><body style="margin:0;background:#f8faf3;font-family:Arial,sans-serif"><main id="test"></main><dialog id="notification"><h2>A note from Earth</h2><button>Got it</button></dialog></body></html>',
    }),
  );
  await page.goto("/__battle-test");
  await page.evaluate(async (options) => {
    let now = 100;
    let nextFrame;
    window.requestAnimationFrame = (callback) => {
      nextFrame = callback;
      return 1;
    };
    window.cancelAnimationFrame = () => {
      nextFrame = null;
    };
    performance.now = () => now;
    window.advanceBattle = (seconds) => {
      const end = now + seconds * 1000;
      while (now < end && nextFrame) {
        now += Math.min(50, end - now);
        nextFrame(now);
      }
    };
    window.walletChanges = [];
    window.battleResults = [];
    const { mountBattle } = await import("/src/v2/battle.js");
    window.battle = mountBattle(document.querySelector("#test"), {
      startingEnergy: 50,
      mission: { title: "First contact", difficulty: 1 },
      ...options,
      onEnergyChange: (energy) => window.walletChanges.push(energy),
      onComplete: (result) => window.battleResults.push(result),
      requestEnergy: () =>
        new Promise((resolve) => {
          window.collectEnergy = resolve;
        }),
    });
    window.advanceBattle(0.1);
  }, options);
}

const advance = (page, seconds) =>
  page.evaluate((seconds) => window.advanceBattle(seconds), seconds);
const tile = (page, row, col) =>
  page.locator(`.gb-cell[data-row="${row}"][data-col="${col}"]`);
async function place(page, id, row, col) {
  await page.locator(`[data-tower="${id}"]`).click();
  await tile(page, row, col).click();
}
async function readCombat(page) {
  return page.evaluate(() => ({
    enemies: [...document.querySelectorAll(".gb-alien")].map((node) => [
      node.className,
      node.getAttribute("style"),
      node.querySelector("i").style.width,
    ]),
    shots: [...document.querySelectorAll(".gb-shot")].map((node) =>
      node.getAttribute("style"),
    ),
    energy: document.querySelector(".gb-energy").textContent,
    wave: document.querySelector(".gb-wave-text").textContent,
  }));
}

test("five defenders, placement, movement, refunds and persistent wallet", async ({
  page,
}) => {
  await mount(page, { startingEnergy: 10 });
  await expect(page.locator(".gb-tower-card")).toHaveCount(5);
  await expect(page.locator(".gb-cell")).toHaveCount(35);
  await place(page, "pebble", 1, 0);
  await expect(page.locator(".gb-energy")).toHaveText("8");
  expect(await page.evaluate(() => walletChanges.at(-1))).toBe(8);
  await tile(page, 1, 0).click();
  await page.locator(".gb-move-tower").click();
  await tile(page, 1, 1).click();
  await expect(tile(page, 1, 0)).not.toHaveClass(/gb-occupied/);
  await expect(tile(page, 1, 1)).toHaveClass(/gb-occupied/);
  await expect(page.locator(".gb-energy")).toHaveText("8");
  await page.locator(".gb-sell-tower").click();
  await expect(page.locator(".gb-energy")).toHaveText("10");
  expect(await page.evaluate(() => walletChanges.at(-1))).toBe(10);
  await place(page, "pebble", 1, 0);
  await advance(page, 8);
  await tile(page, 1, 0).click();
  await page.locator(".gb-move-tower").click();
  await expect(page.locator(".gb-toast")).toContainText("Move between waves");
  await page.locator(".gb-sell-tower").click();
  await expect(page.locator(".gb-energy")).toHaveText("9");
  await page.keyboard.press("5");
  await expect(page.locator('[data-tower="poppy"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await tile(page, 0, 0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tile(page, 0, 1)).toBeFocused();
});

test("pause, math, hidden tabs and native dialogs freeze the entire simulation", async ({
  page,
}) => {
  await mount(page);
  await place(page, "pebble", 1, 0);
  await place(page, "pebble", 3, 0);
  await advance(page, 12.6);
  await page.evaluate(() =>
    document.querySelector("#notification").showModal(),
  );
  const paused = await readCombat(page);
  await advance(page, 30);
  expect(await readCombat(page)).toEqual(paused);
  await page.evaluate(() => document.querySelector("#notification").close());
  await page.locator(".gb-math-button").click();
  const math = await readCombat(page);
  await advance(page, 30);
  expect(await readCombat(page)).toEqual(math);
  await page.evaluate(() => window.collectEnergy(3));
  await expect(page.locator(".gb-energy")).toHaveText(
    String(Number(math.energy) + 3),
  );
  await advance(page, 0.1);
  const selectedBefore = await page
    .locator(".gb-chosen")
    .getAttribute("data-tower");
  await page.evaluate(() =>
    document.querySelector("#notification").showModal(),
  );
  const notified = await readCombat(page);
  await page.keyboard.press("5");
  await advance(page, 30);
  expect(await readCombat(page)).toEqual(notified);
  expect(await page.locator(".gb-chosen").getAttribute("data-tower")).toBe(
    selectedBefore,
  );
  await expect(page.locator(".gb-battle")).toHaveClass(/gb-is-paused/);
  await page.evaluate(() => document.querySelector("#notification").close());
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await readCombat(page);
  await advance(page, 30);
  expect(await readCombat(page)).toEqual(hidden);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await advance(page, 8);
  await expect(page.locator(".gb-energy")).toHaveText(
    String(Number(math.energy) + 3),
  );
  expect(await page.evaluate(() => walletChanges.at(-1))).toBe(
    Number(math.energy) + 3,
  );
});

test("five-role defense automatically completes its three waves", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mount(page, { startingEnergy: 100 });
  for (let row = 0; row < 5; row++) {
    await place(page, "pebble", row, 1);
    await place(page, "prism", row, 0);
  }
  await place(page, "bricky", 1, 4);
  await place(page, "frost", 2, 2);
  await place(page, "poppy", 3, 2);
  await expect(page.locator(".gb-start-button")).toHaveCount(0);
  await advance(page, 300);
  await expect.poll(() => page.evaluate(() => battleResults.length)).toBe(1);
  expect(await page.evaluate(() => battleResults[0])).toMatchObject({
    won: true,
    stars: 3,
    waves: 3,
  });
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("an empty field starts without another click and can lose honestly", async ({
  page,
}) => {
  await mount(page, { startingEnergy: 10 });
  await advance(page, 7);
  await expect(page.locator(".gb-alien")).toHaveCount(0);
  await advance(page, 5);
  await expect(page.locator(".gb-alien").first()).toBeVisible();
  await advance(page, 160);
  await expect.poll(() => page.evaluate(() => battleResults.length)).toBe(1);
  expect(await page.evaluate(() => battleResults[0])).toMatchObject({
    won: false,
    stars: 0,
  });
  await expect(page.locator(".gb-health")).toHaveAttribute(
    "aria-label",
    "Earth shield: 0 of 5",
  );
  await expect(page.locator(".gb-result-banner")).toBeVisible();
});

test("a late mission supports all enemy types and planet cosmetics", async ({
  page,
}) => {
  await mount(page, {
    startingEnergy: 100,
    mission: { title: "Home, sweet Earth", difficulty: 6 },
    settings: { equipped: "lilac" },
  });
  await expect(page.locator(".gb-battle")).toHaveAttribute(
    "data-cosmetic",
    "lilac",
  );
  for (let row = 0; row < 5; row++) {
    await place(page, "prism", row, 0);
    await place(page, "pebble", row, 1);
    await place(page, "bricky", row, 4);
  }
  await place(page, "poppy", 2, 2);
  await place(page, "frost", 3, 2);
  await advance(page, 350);
  await expect.poll(() => page.evaluate(() => battleResults.length)).toBe(1);
  expect(await page.evaluate(() => battleResults[0])).toMatchObject({
    won: true,
    waves: 3,
  });
});
