const { expect } = require('@playwright/test');

/**
 * The sign-in screen.
 *
 * Used in two quite different ways: the one-off setup step signs in here and
 * saves the session so the other tests begin already signed in, while the
 * login-error test comes here deliberately signed out to check a wrong password
 * is refused.
 */
class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.locator('[data-qa="login-email"]');
    this.password = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loggedInAs = page.getByText(/Logged in as/i);
    this.errorMessage = page.getByText('Your email or password is incorrect!');
  }

  async open() {
    await this.page.goto('/login');
  }

  async login({ email, password }) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedIn() {
    await expect(this.loggedInAs).toBeVisible({ timeout: 15000 });
  }

  async expectLoginRejected() {
    await expect(this.errorMessage).toBeVisible();
  }
}

module.exports = LoginPage;