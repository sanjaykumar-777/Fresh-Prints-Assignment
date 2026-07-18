const { test } = require('../../../fixtures/fixtures');

test('rejects a sign-in with the wrong password', async ({ homePage, amazonUser }) => {
  await homePage.open();
  const signInPage = await homePage.goToSignIn();

  // Real email, wrong password: the account must exist for Amazon to reach the
  // password step at all.
  await signInPage.submitCredentials({
    email: amazonUser.email,
    password: 'DefinitelyWrongPassword123!',
  });

  await signInPage.expectSignInRejected();
});