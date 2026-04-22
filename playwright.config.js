module.exports = {
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:8088"
  },
  webServer: {
    command: "python3 -m http.server 8088",
    port: 8088,
    reuseExistingServer: true,
    timeout: 5000
  }
};
