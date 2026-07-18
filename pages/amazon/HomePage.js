const { expect } = require('@playwright/test');
const SignInPage = require('./SignInPage');

/**
 * The Amazon home page: the starting point for searching and signing in.
 */
class HomePage {
  constructor(page) {
    this.page = page;
    this.searchBox = page.getByRole('searchbox', { name: /search amazon/i });
    this.accountLink = page.locator('#nav-link-accountList');
  }

  /**
   * Opens the home page and waits until it is ready to use.
   *
   * Amazon sometimes shows a "check you are human" page first, which clears on
   * its own after a moment. Waiting for the search box to appear rides that out
   * naturally, so there is no need to pause for a fixed number of seconds.
   */
  async open() {
    await this.page.goto('/');
    await expect(this.searchBox).toBeVisible({ timeout: 30000 });
  }

  async goToSignIn() {
    await this.accountLink.click();
    return new SignInPage(this.page);
  }

  /**
   * Searches for the given term and lands on the results page.
   */
  async search(term) {
    await this.searchBox.click();
    await this.searchBox.fill(term);
    await this.page.keyboard.press('Enter');
  }
}

module.exports = HomePage;