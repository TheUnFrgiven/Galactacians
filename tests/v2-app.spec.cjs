const { test, expect } = require("@playwright/test");

const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
test.afterEach(async ({ page }) => {
  expect(
    pageErrors.get(page),
    "The app should not raise browser exceptions",
  ).toEqual([]);
});

async function navigate(page, label) {
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: label, exact: true })
    .click();
}

async function openPractice(page, skill = "addition") {
  await navigate(page, "Practice");
  await page.locator(`.skill-card[data-skill="${skill}"]`).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function visibleAnswer(page) {
  const expression = await page.locator(".equation").innerText();
  const match = expression.match(/(\d+)\s*([+−×÷])\s*(\d+)/);
  expect(match, `Readable arithmetic expression: ${expression}`).not.toBeNull();
  const left = Number(match[1]),
    right = Number(match[3]);
  return match[2] === "+"
    ? left + right
    : match[2] === "−"
      ? left - right
      : match[2] === "×"
        ? left * right
        : left / right;
}

async function solveVisibleQuestion(page) {
  const answer = await visibleAnswer(page);
  await page
    .getByRole("button", { name: `Answer ${answer}`, exact: true })
    .click();
  await expect(page.locator(".answer-feedback")).toContainText("XP");
  return answer;
}

test("all hub pages can be reached through navigation and all five defender concepts open", async ({
  page,
}) => {
  const pages = [
    ["Defenders", "Defenders"],
    ["Practice", "Practice"],
    ["Planet shop", "Planet shop"],
    ["Settings", "Settings"],
    ["Play", "galactacians"],
  ];
  for (const [label, title] of pages) {
    await navigate(page, label);
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
  }
  await navigate(page, "Defenders");
  await expect(page.locator(".tower-card")).toHaveCount(5);
  for (const name of ["Pebble", "Prism", "Bricky", "Frost", "Poppy"]) {
    await page
      .getByRole("button", { name: `Meet ${name}`, exact: false })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: `Meet ${name}.`, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
  }
});

test("solving three visible questions saves learning progress without banking combat energy", async ({
  page,
}) => {
  await expect(page.locator('[data-stat="energy"]')).toHaveCount(0);
  await openPractice(page);
  await expect(page.locator('[data-stat="xp"]')).toHaveText("0");
  for (let index = 0; index < 3; index++) {
    await expect(page.locator(".math-topline")).toContainText(
      `${index + 1} of 3`,
    );
    await solveVisibleQuestion(page);
    await expect(page.locator('[data-stat="xp"]')).toHaveText(
      String(5 * (index + 1)),
    );
    if (index < 2)
      await expect(page.locator(".math-topline")).toContainText(
        `${index + 2} of 3`,
      );
  }
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-stat="xp"]')).toHaveText("15");
  await expect(page.locator('[data-stat="streak"]')).toHaveText("1");
  await navigate(page, "Practice");
  await expect(
    page.getByText("3 first-try wins · 3 questions", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(
      '.practice-skill[data-skill="addition"] .skill-progress-line i',
    ),
  ).toHaveAttribute("style", "width:100%");
});

test("wrong answers retain the question, show a hint, and award a solved retry only once", async ({
  page,
}) => {
  await openPractice(page);
  const originalEquation = await page.locator(".equation").innerText();
  const correct = await visibleAnswer(page);
  const incorrect = page
    .locator(`.answer-option:not([data-answer="${correct}"])`)
    .first();
  await incorrect.click();
  await expect(incorrect).toBeDisabled();
  await expect(page.locator('[data-stat="xp"]')).toHaveText("0");
  await expect
    .poll(() => page.locator(".equation").innerText())
    .toBe(originalEquation);
  await expect(page.locator(".math-hint")).toBeVisible();
  await expect(page.locator(".answer-feedback")).toContainText(
    "Try with the hint.",
  );
  await solveVisibleQuestion(page);
  await expect(page.locator('[data-stat="xp"]')).toHaveText("2");
  await expect(page.locator(".answer-option:enabled")).toHaveCount(0);
  for (const key of ["1", "2", "3", "4"]) await page.keyboard.press(key);
  await expect(page.locator('[data-stat="xp"]')).toHaveText("2");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await navigate(page, "Practice");
  await expect(
    page.getByText("0 first-try wins · 1 questions", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(
      '.practice-skill[data-skill="addition"] .skill-progress-line i',
    ),
  ).toHaveAttribute("style", "width:0%");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-stat="xp"]')).toHaveText("2");
  await expect(
    page.getByText("0 first-try wins · 1 questions", { exact: true }),
  ).toBeVisible();
});

test("daily practice pays one cosmetic star and keeps the reward across reload", async ({
  page,
}) => {
  for (let session = 0; session < 2; session++) {
    await openPractice(page);
    for (let question = 0; question < 3; question++) {
      await expect(page.locator(".math-topline")).toContainText(
        `${question + 1} of 3`,
      );
      await solveVisibleQuestion(page);
      if (session === 1 && question === 1)
        await expect(page.locator(".answer-feedback")).toContainText(
          "+1 planet star!",
        );
    }
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await expect(page.locator('[data-stat="stars"]')).toHaveText("1");
  await expect(page.locator('[data-stat="xp"]')).toHaveText("30");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("galactacians-v2")),
  );
  expect(saved.energyBank).toBe(10);
  expect(Object.values(saved.daily)[0].goalStarAwarded).toBe(true);
  await page.reload();
  await openPractice(page);
  await solveVisibleQuestion(page);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(page.locator('[data-stat="stars"]')).toHaveText("1");
});

test("every mission attempt starts with its own supply regardless of the old wallet", async ({
  page,
}) => {
  for (const oldWallet of [0, 87]) {
    await page.evaluate(
      (energyBank) =>
        localStorage.setItem(
          "galactacians-v2",
          JSON.stringify({
            version: 2,
            energyBank,
            name: "Nova",
            xp: 125,
            stars: 4,
            completed: { "first-contact": { stars: 1 } },
          }),
        ),
      oldWallet,
    );
    await page.goto("/#mission/first-contact");
    await page.reload();
    await expect(page.locator(".gb-energy")).toHaveText("6");
    await page.locator('button[data-tower="pebble"]').click();
    await page.locator('.gb-cell[data-row="2"][data-col="2"]').click();
    await expect(page.locator(".gb-energy")).toHaveText("4");
    await navigate(page, "Play");
    await page
      .getByRole("button", { name: "First contact, completed", exact: true })
      .click();
    await expect(page.locator(".gb-energy")).toHaveText("6");
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("galactacians-v2")),
    );
    expect(saved.energyBank).toBe(oldWallet);
    expect(saved.name).toBe("Nova");
    expect(saved.xp).toBe(125);
    expect(saved.stars).toBe(4);
  }
});

test("leaving practice early keeps only learning progress already earned", async ({
  page,
}) => {
  await openPractice(page, "subtraction");
  await solveVisibleQuestion(page);
  await expect(page.locator(".math-topline")).toContainText("2 of 3");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator('[data-stat="xp"]')).toHaveText("5");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-stat="xp"]')).toHaveText("5");
  await openPractice(page, "subtraction");
  await expect(page.locator(".math-topline")).toContainText("1 of 3");
  await expect(page.locator(".math-earned")).toContainText("+0");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await navigate(page, "Practice");
  await expect(
    page.getByText("1 first-try wins · 1 questions", { exact: true }),
  ).toBeVisible();
});

test("each arithmetic skill offers a solvable practice session", async ({
  page,
}) => {
  for (const skill of [
    "addition",
    "subtraction",
    "multiplication",
    "division",
  ]) {
    await openPractice(page, skill);
    await solveVisibleQuestion(page);
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
  }
  await expect(page.locator('[data-stat="xp"]')).toHaveText("20");
  await navigate(page, "Practice");
  await expect(
    page.getByText("1 first-try wins · 1 questions", { exact: true }),
  ).toHaveCount(4);
});

test("nickname, sound, reduced motion, reminders and math level persist", async ({
  page,
}) => {
  await navigate(page, "Settings");
  await page.getByLabel("What should we call you?").fill("Nova <3");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator(".mission-menu-profile")).toContainText("Nova <3");
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Sound effects", exact: true })
    .uncheck();
  await page
    .getByRole("checkbox", { name: "Less motion", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Gentle reminders", exact: true })
    .check();
  await page.locator("#settings-level").selectOption("challenger");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("What should we call you?")).toHaveValue(
    "Nova <3",
  );
  await expect(
    page.getByRole("checkbox", { name: "Sound effects", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Less motion", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Gentle reminders", exact: true }),
  ).toBeChecked();
  await expect(page.locator("#settings-level")).toHaveValue("challenger");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await navigate(page, "Practice");
  await expect(page.locator("#practice-level")).toHaveValue("challenger");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator(".menu-daily-goal")).toContainText(
    "Today's practice: 0 / 5 solved",
  );
  await expect(page.locator(".menu-mascot")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("locked missions cannot be opened through their card or direct URL", async ({
  page,
}) => {
  await expect(page.locator(".journey-node.locked")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Moon mail, locked", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText(
    "Complete the previous stop",
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "galactacians" }),
  ).toBeVisible();
  await page.goto("/#mission/moon-mail", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/#adventure$/);
  await expect(page.locator("#battle-mount")).toHaveCount(0);
  await expect(page.locator('[data-stat="energy"]')).toHaveCount(0);
});

test("the shop starts with the original planet and refuses unaffordable cosmetics", async ({
  page,
}) => {
  await navigate(page, "Planet shop");
  const original = page.locator(".cosmetic-card").filter({
    has: page.getByRole("heading", { name: "Earth original", exact: true }),
  });
  await expect(original).toContainText("Equipped");
  await expect(
    original.getByRole("button", { name: "Equipped", exact: true }),
  ).toBeDisabled();
  const lilac = page.locator(".cosmetic-card").filter({
    has: page.getByRole("heading", { name: "Lilac skies", exact: true }),
  });
  await lilac.getByRole("button").click();
  await expect(page.locator("#toast")).toContainText("You need 4 more stars");
  await expect(page.locator('[data-stat="stars"]')).toHaveText("0");
  await expect(page.locator("html")).toHaveAttribute("data-planet", "classic");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(original).toContainText("Equipped");
  await expect(page.locator('[data-stat="stars"]')).toHaveText("0");
});

test("an affordable cosmetic charges once and remains equipped after reload", async ({
  page,
}) => {
  // Seed an earned-star balance; all purchase and equip behavior uses visible UI.
  await page.evaluate(() => {
    localStorage.setItem(
      "galactacians-v2",
      JSON.stringify({ version: 2, stars: 8 }),
    );
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await navigate(page, "Planet shop");
  const lilac = page.locator(".cosmetic-card").filter({
    has: page.getByRole("heading", { name: "Lilac skies", exact: true }),
  });
  await lilac.getByRole("button").click();
  await expect(page.locator('[data-stat="stars"]')).toHaveText("4");
  await expect(lilac).toContainText("Equipped");
  await expect(page.locator("html")).toHaveAttribute("data-planet", "lilac");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(lilac).toContainText("Equipped");
  await expect(page.locator('[data-stat="stars"]')).toHaveText("4");
  const original = page.locator(".cosmetic-card").filter({
    has: page.getByRole("heading", { name: "Earth original", exact: true }),
  });
  await original.getByRole("button", { name: "Equip", exact: true }).click();
  await lilac.getByRole("button", { name: "Equip", exact: true }).click();
  await expect(page.locator('[data-stat="stars"]')).toHaveText("4");
  await expect(page.locator("html")).toHaveAttribute("data-planet", "lilac");
});

test("desktop game home fits the viewport and has a screenshot artifact", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".home-scene")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Defend Earth/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("dashboard-desktop.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("mobile game home and math remain usable without horizontal page overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".home-scene")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("dashboard-mobile.png"),
    fullPage: true,
    animations: "disabled",
  });
  await openPractice(page);
  await solveVisibleQuestion(page);
  const bounds = await page.getByRole("dialog").boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(391);
  await page.screenshot({
    path: testInfo.outputPath("math-mobile.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(page.locator('[data-stat="xp"]')).toHaveText("5");
});
