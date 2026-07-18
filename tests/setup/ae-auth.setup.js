const { test: setup } = require('../../fixtures/fixtures');

const AUTH_FILE = 'auth/ae-user.json';

/**
 * Signs in once, before anything else runs, and saves the signed-in session to
 * a file.
 *
 * The other tests pick that file up and begin already signed in. Doing it this
 * way keeps every test from having to log in for itself, which would be slower
 * and would make each one fail for the same reason if sign-in ever broke.
 */
setup('authenticate', async ({ page, aeLoginPage, aeUser }) => {
  await aeLoginPage.open();
  await aeLoginPage.login(aeUser);
  await aeLoginPage.expectLoggedIn();

  await page.context().storageState({ path: AUTH_FILE });
});