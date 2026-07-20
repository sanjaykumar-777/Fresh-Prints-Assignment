const { defineConfig } = require('@playwright/test');
const env = require('./config/env');

module.exports = defineConfig({
  testDir: 'tests',
  globalTeardown: require.resolve('./global-teardown'),
  fullyParallel: false,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  /* One test at a time. They share a single real account, so two tests filling
     and clearing the same cart at once would spoil each other's counts. */
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
    /* Amazon is a live site nobody here controls, so it can be slow and a
       little unpredictable. The browser is left to describe itself normally:
       borrowing one of the ready-made device profiles makes Amazon start
       refusing searches. */
    {
      name: 'amazon',
      testDir: 'tests/ui/amazon',

      /* Eighty seconds, allowing for one test walking the whole journey: sign
         in, clear the cart, search, add, address, payment and review. */
      timeout: 80000,

      /* Failures are not retried, so a flaky payment step will fail the run. */
      retries: 0,
      use: {
        baseURL: env.AMAZON_URL,
        locale: 'en-IN',
        amazonUser: { email: env.AMAZON_EMAIL, password: env.AMAZON_PASSWORD },
      },
    },

    /* Signs in once and saves the session, so the tests below start signed in. */
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
        /* Still needed even though the session is restored, because the
           login-error test signs out and types the details itself. */
        aeUser: { email: env.AE_EMAIL, password: env.AE_PASSWORD },
      },
    },
  ],
});