const { defineConfig } = require('@playwright/test');
const env = require('./config/env');

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: false,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  // Every test drives one real account whose cart lives on the server. Two
  // tests clearing and filling that cart at once corrupt each other's counts,
  // so the suite runs one test at a time.
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Amazon is a live third party (bot-check interstitial, occasional inline
    // script races). The default UA is used deliberately: devices['Desktop Chrome']
    // ships a pinned UA that makes amazon.in return net::ERR_INVALID_RESPONSE on search.
    {
      name: 'amazon',
      testDir: 'tests/ui/amazon',
      // The whole flow — sign in, clear cart, search, add, address, payment,
      // review — does not fit in the 30s default.
      timeout: 180000,
      // Amazon's payment section re-renders constantly, so the COD/continue
      // steps stay somewhat non-deterministic. Retry to absorb that flakiness.
      retries: 0,
      use: {
        baseURL: env.AMAZON_URL,
        locale: 'en-IN',
        amazonUser: { email: env.AMAZON_EMAIL, password: env.AMAZON_PASSWORD },
      },
    },

    // AutomationExercise signs in once here and saves the session to disk.
    {
      name: 'ae-setup',
      testDir: 'tests/setup',
      testMatch: /ae-auth\.setup\.js/,
      use: {
        baseURL: env.AE_URL,
        aeUser: { email: env.AE_EMAIL, password: env.AE_PASSWORD },
      },
    },
    {
      name: 'ae',
      testDir: 'tests/ui/ae',
      dependencies: ['ae-setup'],
      use: {
        baseURL: env.AE_URL,
        storageState: 'auth/ae-user.json',
        // Also needed here: the signed-out specs log in explicitly.
        aeUser: { email: env.AE_EMAIL, password: env.AE_PASSWORD },
      },
    },
  ],
});