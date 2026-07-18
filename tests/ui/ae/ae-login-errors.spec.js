const { test } = require('../../../fixtures/fixtures');

/* Throws away the saved session so this test starts signed out. Every other
   test here begins already signed in, which would defeat the whole point of
   this one: there would be no login screen left to be refused at. */
test.use({ storageState: { cookies: [], origins: [] } });

test('rejects a login with the wrong password', async ({ aeLoginPage, aeUser }) => {
  await aeLoginPage.open();
  await aeLoginPage.login({ email: aeUser.email, password: 'definitely-not-the-password' });

  await aeLoginPage.expectLoginRejected();
});