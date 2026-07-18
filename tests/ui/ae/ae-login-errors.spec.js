const { test } = require('../../../fixtures/fixtures');

// Signed out, so the saved session does not skip the login being tested.
test.use({ storageState: { cookies: [], origins: [] } });

test('rejects a login with the wrong password', async ({ aeLoginPage, aeUser }) => {
  await aeLoginPage.open();
  await aeLoginPage.login({ email: aeUser.email, password: 'definitely-not-the-password' });

  await aeLoginPage.expectLoginRejected();
});