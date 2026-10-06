const { test, expect } = require("@playwright/test");

async function mount(page, difficulty = 1) {
  await page.route("**/__strategy-test", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><link rel="stylesheet" href="/src/v2/battle.css"></head><body><main id="test"></main><dialog id="menu">Menu</dialog></body></html>',
    }),
  );
  await page.goto("/__strategy-test");
  await page.evaluate(async (difficulty) => {
    let now = 100,
      frame;
    requestAnimationFrame = (callback) => {
      frame = callback;
      return 1;
    };
    cancelAnimationFrame = () => {
      frame = null;
    };
    performance.now = () => now;
    window.advance = (seconds, untilBetween = false) => {
      const end = now + seconds * 1000;
      while (now < end && frame) {
        now += Math.min(50, end - now);
        frame(now);
        if (
          untilBetween &&
          document
            .querySelector(".gb-wave-text")
            .textContent.startsWith("Next wave")
        )
          break;
      }
    };
    const { mountBattle } = await import("/src/v2/battle.js");
    window.results = [];
    window.battle = mountBattle(document.querySelector("#test"), {
      startingEnergy: 10,
      guidedStart: false,
      mission: { difficulty },
      onComplete: (result) => results.push(result),
      requestEnergy: () =>
        new Promise((resolve) => {
          window.answer = resolve;
        }),
    });
    advance(0.1);
  }, difficulty);
}
const cell = (page, row, col) =>
  page.locator(`.gb-cell[data-row="${row}"][data-col="${col}"]`);
async function place(page, id, row, col) {
  await page.locator(`.gb-tower-card[data-tower="${id}"]`).click();
  await cell(page, row, col).click();
  await expect(cell(page, row, col)).toHaveClass(/gb-occupied/);
}
const advance = (page, seconds, untilBetween = false) =>
  page.evaluate(
    ({ seconds, untilBetween }) => window.advance(seconds, untilBetween),
    { seconds, untilBetween },
  );

const SQUADS = {
  beamAndBubbles: [
    [["pebble", 1, 2], ["pebble", 3, 2], ["prism", 2, 0]],
    [["poppy", 2, 3]],
    [["frost", 2, 2], ["bricky", 2, 5]],
  ],
  blockAndBubbles: [
    [["pebble", 1, 2], ["pebble", 3, 2], ["poppy", 2, 0]],
    [["pebble", 2, 3], ["bricky", 2, 4]],
    [["pebble", 2, 2], ["bricky", 1, 4]],
  ],
};

async function runSquad(page, difficulty, squad) {
  await mount(page, difficulty);
  for (let wave = 0; wave < 3; wave++) {
    for (const [id, row, col, nextRow, nextCol] of squad[wave]) {
      if (id === "move") {
        await cell(page, row, col).click();
        await page.locator('.gb-move-tower').click();
        await cell(page, nextRow, nextCol).click();
        await expect(cell(page, nextRow, nextCol)).toHaveClass(/gb-occupied/);
      } else await place(page, id, row, col);
    }
    await advance(page, wave === 0 ? 8.1 : 5.1);
    await advance(page, 180, wave < 2);
  }
  await expect.poll(() => page.evaluate(() => results.length)).toBe(1);
  return page.evaluate(() => results[0]);
}

for (const [name, squad] of Object.entries(SQUADS)) {
  test(`first contact supports the ${name} formation at a sixteen-energy budget`, async ({ page }) => {
    const result = await runSquad(page, 1, squad);
    console.log(name, result);
    expect(result).toMatchObject({ won: true, stars: 3, waves: 3, kills: 36, energySpent: 16 });
  });
}
const MISSION_SQUADS = {
  2: [
    [["pebble", 0, 2], ["pebble", 4, 2], ["prism", 2, 0]],
    [["frost", 1, 2], ["frost", 3, 2]],
    [["bricky", 2, 4], ["poppy", 2, 1]],
  ],
  3: [
    [["poppy", 1, 1], ["pebble", 0, 2], ["prism", 2, 0]],
    [["frost", 2, 2], ["pebble", 3, 2]],
    [["move", 1, 1, 2, 1], ["bricky", 3, 4], ["prism", 3, 0]],
  ],
  4: [
    [["pebble", 1, 2], ["pebble", 3, 2], ["poppy", 2, 3]],
    [["frost", 2, 2], ["prism", 2, 0]],
    [["pebble", 0, 2], ["pebble", 4, 2], ["bricky", 2, 5]],
  ],
  5: [
    [["pebble", 1, 2], ["pebble", 3, 2], ["prism", 2, 0]],
    [["poppy", 2, 3], ["frost", 2, 2]],
    [["pebble", 0, 2], ["pebble", 4, 2], ["bricky", 3, 4]],
  ],
  6: [
    [["pebble", 0, 2], ["pebble", 4, 2], ["poppy", 2, 3]],
    [["frost", 2, 2], ["prism", 2, 0]],
    [["bricky", 2, 5], ["poppy", 2, 1]],
  ],
};

for (const [difficulty, squad] of Object.entries(MISSION_SQUADS)) {
  test(`mission ${difficulty} can be won from ten energy with a route-specific formation`, async ({ page }) => {
    const result = await runSquad(page, Number(difficulty), squad);
    console.log('mission', difficulty, result);
    expect(result.won).toBe(true);
  });
}
test("math cannot chain-freeze play: the cooldown advances only while the game runs", async ({
  page,
}) => {
  await mount(page);
  await page.locator(".gb-math-button").click();
  await page.evaluate(() => answer(1));
  await expect(page.locator(".gb-math-button")).toBeDisabled();
  await expect(page.locator(".gb-energy")).toHaveText("11");
  await page.evaluate(() => document.querySelector("#menu").showModal());
  await advance(page, 30);
  await expect(page.locator(".gb-math-button")).toBeDisabled();
  await page.evaluate(() => document.querySelector("#menu").close());
  await advance(page, 3.1);
  await expect(page.locator(".gb-math-button")).toBeEnabled();
});
