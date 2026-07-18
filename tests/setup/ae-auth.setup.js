const { test: setup } = require('../../fixtures/fixtures');

const AUTH_FILE = 'auth/ae-user.json';

// Signs in once and saves the session. The ae project reuses this file, so the
// checkout tests start already authenticated instead of logging in each time.
setup('authenticate', async ({ page, aeLoginPage, aeUser }) => {
  await aeLoginPage.open();
  await aeLoginPage.login(aeUser);
  await aeLoginPage.expectLoggedIn();

  await page.context().storageState({ path: AUTH_FILE });
});