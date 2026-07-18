const { test } = require('../../../fixtures/fixtures');

test('rejects a sign-in with the wrong password', async ({ homePage, amazonUser }) => {
  await homePage.open();
  const signInPage = await homePage.goToSignIn();

  /* A real email address with a wrong password. Amazon only asks for a password
     once it recognises the address, so a made-up email would be turned away a
     step earlier and this would end up testing the wrong refusal.

     Note this submits the details directly rather than going through the usual
     login helper. That helper waits to be taken off the sign-in screen as proof
     the sign-in worked, which is the very thing that must not happen here. */
  await signInPage.submitCredentials({
    email: amazonUser.email,
    password: 'DefinitelyWrongPassword123!',
  });

  await signInPage.expectSignInRejected();
});