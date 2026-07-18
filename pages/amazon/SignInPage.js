const { expect } = require('@playwright/test');

// amazon.in has no guest checkout, so a real sign-in is required to continue.
class SignInPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator('#ap_email_login');
    this.continueButton = page.locator('#continue');
    this.passwordField = page.locator('#ap_password');
    this.signInButton = page.locator('#signInSubmit');
    this.errorBox = page.locator('#auth-error-message-box');
  }

  // Email and password sit on two separate steps, split by Continue.
  async submitCredentials(credentials) {
    await this.emailField.fill(credentials.email);
    await this.continueButton.click();
    await this.passwordField.fill(credentials.password);
    await this.signInButton.click();
  }

  async login(credentials) {
    await this.submitCredentials(credentials);
    // Leaving the sign-in page is the proof the login succeeded.
    await expect(this.page).not.toHaveURL(/\/ap\/signin/, { timeout: 30000 });
  }

  async expectSignInRejected() {
    await expect(this.errorBox).toBeVisible({ timeout: 30000 });
    await expect(this.errorBox).toContainText('Your password is incorrect');
    // Staying on the sign-in page is what proves the login did not go through.
    await expect(this.page).toHaveURL(/\/ap\/signin/);
  }
}

module.exports = SignInPage;