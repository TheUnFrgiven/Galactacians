const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: /v2-.*\.spec\.cjs/,
  timeout: 60000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:8088",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 960 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node server.cjs",
    url: "http://127.0.0.1:8088",
    reuseExistingServer: true,
    timeout: 10000,
  },
});
