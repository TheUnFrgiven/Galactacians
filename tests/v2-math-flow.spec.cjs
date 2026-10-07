const { test, expect } = require("@playwright/test");

async function enter(page, solvedToday = 0) {
  const time = new Date("2026-10-02T12:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.addInitScript((correct) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    localStorage.setItem(
      "galactacians-v2",
      JSON.stringify({
        version: 2,
        completed: { "first-contact": { stars: 1 } },
        daily: { [date]: { answered: correct, correct } },
      }),
    );
  }, solvedToday);
  await page.goto("/#mission/first-contact");
  await expect(page.locator(".gb-battle")).toBeVisible();
  await page.clock.runFor(12500);
  await expect(page.locator(".gb-alien").first()).toBeVisible();
}
async function correctAnswer(page) {
  const values = await page.locator(".equation > span").allTextContents();
  return Number(values[0]) + Number(values[2]);
}
const wallet = (page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("galactacians-v2") || "{}").energyBank ??
      10,
  );

test("battle math gives a hint at ten seconds, reveals at twenty, and cannot earn idle rewards", async ({
  page,
}) => {
  await enter(page, 4);
  await page.locator(".gb-math-button").click();
  const answer = await correctAnswer(page);
  const frozen = await page.locator(".gb-alien").first().getAttribute("style");
  await page.clock.runFor(9999);
  await expect(page.locator(".math-hint")).not.toBeVisible();
  await expect(page.locator(".gb-alien").first()).toHaveAttribute(
    "style",
    frozen,
  );
  await page.clock.runFor(1);
  await expect(page.locator(".math-hint")).toBeVisible();
  await page.clock.runFor(9999);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.runFor(1);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#toast")).toContainText(`= ${answer}.`);
  expect(await wallet(page)).toBe(10);
  await expect(page.locator(".gb-math-button")).toBeDisabled();
  await page.clock.runFor(1500);
  await expect(page.locator(".gb-alien").first()).not.toHaveAttribute(
    "style",
    frozen,
  );
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.clock.runFor(5000);
  await page
    .getByRole("button", { name: "Back to defending", exact: true })
    .click();
  await expect(page.locator(".gb-math-button")).toBeDisabled();
  await page.clock.runFor(1600);
  await expect(page.locator(".gb-math-button")).toBeEnabled();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("galactacians-v2")).xp,
    ),
  ).toBe(0);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("galactacians-v2")),
  );
  expect(saved.stars).toBe(0);
  expect(Object.values(saved.daily)[0].correct).toBe(4);
  expect(Object.values(saved.daily)[0].goalStarAwarded).toBe(false);
});

test("a solved battle question credits once and returns straight to play", async ({
  page,
}) => {
  await enter(page);
  await page.locator(".gb-math-button").click();
  const answer = await correctAnswer(page);
  await page
    .getByRole("button", { name: `Answer ${answer}`, exact: true })
    .click();
  await expect(page.locator(".answer-feedback")).toContainText("+3 energy");
  expect(await wallet(page)).toBe(10);
  await page.keyboard.press("1");
  await page.keyboard.press("2");
  await page.clock.runFor(750);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".gb-energy")).toHaveText("9");
  await expect(page.locator("[data-math-next]")).toHaveCount(0);
  expect(await wallet(page)).toBe(10);
});

test("closing math cancels its hint/reveal callbacks without disturbing the menu", async ({
  page,
}) => {
  await enter(page);
  await page.locator(".gb-math-button").click();
  await page.clock.runFor(5000);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.clock.runFor(25000);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Menu", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".math-hint")).toHaveCount(0);
  expect(await wallet(page)).toBe(10);
});
