let playwrightTest;
try {
  playwrightTest = require("@playwright/test");
} catch {
  playwrightTest = require("playwright/test");
}

const { test, expect } = playwrightTest;

test("main menu panels and game modes are connected", async ({ page }) => {
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  await page.goto("/game-menu.html");
  await expect(page.getByRole("button", { name: "Campaign" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Infinite Galaxy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Practice Lab" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();

  for (const label of ["Stats", "Settings", "Missions", "Achievements"]) {
    await page.getByRole("button", { name: label }).click();
    await expect(page.locator(".settings-panel.is-open")).toBeVisible();
    await expect(page.locator(".settings-panel")).not.toBeEmpty();
    await page.getByRole("button", { name: "Close" }).click();
  }

  await page.getByRole("button", { name: "Practice Lab" }).click();
  await expect(page.getByRole("button", { name: /Addition/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Division/ })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.goto("/index.html?mode=campaign");
  await expect(page.locator(".mode-exit-link")).toBeVisible();
  await expect(page.locator("#campaign-map")).toBeVisible();
  await expect(page.locator(".campaign-map-node")).toHaveCount(55);
  await page.locator(".campaign-map-node").first().click();
  await expect(page.locator("#campaign-map")).toHaveClass(/hidden/);
  await expect(page.locator("#campaign-galaxy-label")).toContainText("Number Sense Nebula");
  await expect(page.locator("#campaign-lesson-title")).toContainText("Coordinate Crates");
  await expect(page.locator("#campaign-age-tag")).toContainText("Ages 7-8");
  await expect(page.locator("#campaign-standard-tag")).toContainText("CCSS");
  await expect(page.locator("#campaign-support-tag")).toContainText("base ten");
  await expect(page.locator("#campaign-mastery-evidence")).toContainText("Mastery");
  await expect(page.locator("#question-text")).toBeVisible();

  await page.goto("/index.html?mode=infinite");
  await expect(page.locator("#lesson-panel-label")).toContainText("Infinite Galaxy");
  await expect(page.locator(".category-button")).toHaveCount(4);

  await page.goto("/index.html?mode=practice&skill=division");
  await expect(page.locator("#lesson-panel-label")).toContainText("Practice Lab");
  await expect(page.locator("#campaign-lesson-title")).toContainText("Division Practice");
  await expect(page.locator("#question-text")).toBeVisible();

  expect(browserErrors).toEqual([]);
});

test("email sign up verifies and opens the profile page", async ({ page }) => {
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  await page.goto("/auth.html");
  await expect(page.getByRole("heading", { name: "Sign up or sign in" })).toBeVisible();
  const signupForm = page.locator("#signup-form");
  await signupForm.getByLabel("Player name").fill("Nova Pilot");
  await signupForm.getByLabel("Username").fill("nova_pilot");
  await signupForm.getByLabel("Email address").fill("nova@example.com");
  await signupForm.getByLabel("Date of birth").fill("2010-01-01");
  await signupForm.getByLabel("Password", { exact: true }).fill("Rocket123");
  await signupForm.getByLabel("Confirm password").fill("Rocket123");
  await signupForm.getByLabel(/I agree/).check();
  await page.getByRole("button", { name: "Create Account" }).click();

  const code = await page.locator("#verification-demo-code").textContent();
  expect(code).toMatch(/^\d{6}$/);
  await page.locator("#verification-code").fill(code);
  await page.getByRole("button", { name: "Verify Email" }).click();
  await expect(page).toHaveURL(/profile\.html$/);
  await expect(page.getByRole("heading", { name: "Nova Pilot" })).toBeVisible();
  await expect(page.getByText("Verified")).toBeVisible();

  await page.getByRole("button", { name: "Connect" }).first().click();
  await page.getByLabel("Gmail email address").fill("nova@gmail.com");
  await page.locator("#link-provider-panel").getByRole("button", { name: "Connect" }).click();
  await expect(page.getByText("nova@gmail.com")).toBeVisible();

  await page.goto("/game-menu.html");
  await expect(page.getByRole("button", { name: "Profile" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});
