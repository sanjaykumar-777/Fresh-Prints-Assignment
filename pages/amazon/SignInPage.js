const { expect } = require('@playwright/test');

/**
 * The Amazon sign-in screen.
 *
 * Amazon India offers no guest checkout, so signing in with a real account is
 * the only way any of the cart or checkout journeys can carry on.
 */
class SignInPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator('#ap_email_login');
    this.continueButton = page.locator('#continue');
    this.passwordField = page.locator('#ap_password');
    this.signInButton = page.locator('#signInSubmit');
    this.errorBox = page.locator('#auth-error-message-box');
  }

  /**
   * Types in the email and password and submits them.
   *
   * Amazon asks for the two on separate screens with a Continue button between,
   * which is why this fills one, moves on, then fills the other.
   */
  async submitCredentials(credentials) {
    await this.emailField.fill(credentials.email);
    await this.continueButton.click();
    await this.passwordField.fill(credentials.password);
    await this.signInButton.click();
  }

  /**
   * Signs in and waits until the sign-in has definitely worked.
   *
   * Being taken away from the sign-in screen is the sign that it succeeded.
   * Waiting for that here means the tests that follow can trust they are
   * already signed in.
   */
  async login(credentials) {
    await this.submitCredentials(credentials);
    await expect(this.page).not.toHaveURL(/\/ap\/signin/, { timeout: 30000 });
  }

  /**
   * Checks that a sign-in with a wrong password was turned away.
   *
   * The error message alone is not quite enough, because a page can show a
   * warning and still let someone through. Confirming the browser is also still
   * sitting on the sign-in screen is what proves the login really was refused.
   */
  async expectSignInRejected() {
    await expect(this.errorBox).toBeVisible({ timeout: 30000 });
    await expect(this.errorBox).toContainText('Your password is incorrect');
    await expect(this.page).toHaveURL(/\/ap\/signin/);
  }
}

module.exports = SignInPage;