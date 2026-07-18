const { expect } = require('@playwright/test');
const SignInPage = require('./SignInPage');

class HomePage {
  constructor(page) {
    this.page = page;
    this.searchBox = page.getByRole('searchbox', { name: /search amazon/i });
    this.accountLink = page.locator('#nav-link-accountList');
  }

  async open() {
    await this.page.goto('/');
    // The bot-check interstitial resolves itself; waiting on the search box
    // rides it out without a fixed sleep.
    await expect(this.searchBox).toBeVisible({ timeout: 30000 });
  }

  async goToSignIn() {
    await this.accountLink.click();
    return new SignInPage(this.page);
  }

  async search(term) {
    await this.searchBox.click();
    await this.searchBox.fill(term);
    await this.page.keyboard.press('Enter');
  }
}

module.exports = HomePage;