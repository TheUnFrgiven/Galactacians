const { test, expect } = require("@playwright/test");

test("mission math boosts the current attempt while victory and learning persist", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    let now = 100,
      callback;
    window.requestAnimationFrame = (fn) => {
      callback = fn;
      return 1;
    };
    window.cancelAnimationFrame = () => {
      callback = null;
    };
    performance.now = () => now;
    window.advanceGame = (seconds) => {
      const end = now + seconds * 1000;
      while (now < end && callback) {
        now += Math.min(50, end - now);
        callback(now);
      }
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Defend Earth", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "First contact", exact: true }),
  ).toBeVisible();
  const place = async (id, row, col) => {
    await page.locator(`button[data-tower="${id}"]`).click();
    const cost = Number(
      await page.locator(`[data-tower="${id}"] .gb-tower-cost`).innerText(),
    );
    while (Number(await page.locator(".gb-energy").innerText()) < cost) {
      if (await page.locator(".gb-math-button").isDisabled())
        await page.evaluate(() => advanceGame(3.1));
      await page.locator(".gb-math-button").click();
      const terms = await page.locator(".equation>span").allTextContents();
      await page
        .getByRole("button", {
          name: `Answer ${Number(terms[0]) + Number(terms[2])}`,
          exact: true,
        })
        .click();
      await expect(page.getByRole("dialog")).not.toBeVisible();
    }
    await page
      .locator(`.gb-cell[data-row="${row}"][data-col="${col}"]`)
      .click();
  };
  const untilBreather = async () => {
    for (let t = 0; t < 150; t++) {
      if (
        (await page.locator(".gb-wave-text").textContent()).startsWith(
          "Next wave",
        )
      )
        return;
      await page.evaluate(() => advanceGame(1));
    }
    throw new Error("Expected an automatic wave transition");
  };
  await place("pebble", 1, 2);
  await place("pebble", 3, 2);
  await place("prism", 2, 0);
  await expect(page.locator(".gb-energy")).toHaveText("2");
  await page.evaluate(() => advanceGame(12));
  await page.locator(".gb-math-button").click();
  const frozen = await page.locator(".gb-alien").first().getAttribute("style");
  await page.evaluate(() => advanceGame(2));
  await expect(page.locator(".gb-alien").first()).toHaveAttribute(
    "style",
    frozen,
  );
  const values = await page.locator(".equation>span").allTextContents();
  await page
    .getByRole("button", {
      name: `Answer ${Number(values[0]) + Number(values[2])}`,
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".gb-energy")).toHaveText("5");
  await untilBreather();
  await place("poppy", 2, 3);
  await place("frost", 2, 2);
  await page.evaluate(() => advanceGame(6));
  await untilBreather();
  await place("bricky", 2, 5);
  await page.evaluate(() => advanceGame(170));
  await expect(
    page.getByRole("heading", { name: "Home is safe!", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".result-stars")).toHaveText("★★★");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("galactacians-v2")),
  );
  expect(saved.energyBank).toBe(10);
  expect(saved.stars).toBe(3);
  expect(saved.skills.addition.correct).toBe(4);
  expect(saved.completed["first-contact"].stars).toBe(3);
  await page.locator('[data-action="result-home"]').click();
  await expect(
    page.getByRole("button", { name: "Moon mail, play mission", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".mission-count")).toHaveText("1 / 6");
  await page.reload();
  await expect(page.locator('[data-stat="energy"]')).toHaveCount(0);
  await expect(page.locator('[data-stat="streak"]')).toHaveText("1");
  expect(errors).toEqual([]);
});

test("the local game loads all its assets without outside network access", async ({
  page,
}) => {
  const external = [];
  await page.route("**/*", (route) => {
    if (new URL(route.request().url()).hostname !== "127.0.0.1") {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("button", { name: "Defend Earth", exact: true }),
  ).toBeVisible();
  expect(external).toEqual([]);
  expect(
    await page.evaluate(() => document.fonts.check("900 16px Nunito")),
  ).toBe(true);
});
