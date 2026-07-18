const { expect } = require('@playwright/test');
const CartPage = require('./CartPage');

// Turns "₹130.00" into 130 so amounts can be compared as numbers.
const toAmount = (text) => Number(text.replace(/[^\d.]/g, ''));

class ProductPage {
  constructor(page) {
    this.page = page;
    // #productTitle appears twice on the page, so scope to the first.
    this.title = page.locator('#productTitle').first();
    this.addToCartButton = page.locator('#add-to-cart-button');
    this.cartCount = page.locator('#nav-cart-count');
    // Scoped to the buybox: a bare .a-price matches 23 elements on the page.
    this.price = page.locator('#corePrice_feature_div .a-offscreen').first();
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible({ timeout: 30000 });
  }

  // The price element is visually hidden for screen readers, so it has to be
  // read with textContent — innerText returns empty for hidden elements.
  async unitPrice() {
    await expect(this.price).toHaveCount(1, { timeout: 30000 });
    return toAmount(await this.price.textContent());
  }

  async addToCart() {
    // Adding navigates away to an interstitial, so remember where the product
    // lives in case it has to be added again.
    this.productUrl = this.page.url();
    await this.addToCartButton.click();
    return new CartPage(this.page);
  }

  // Returns to the product after an add, which has navigated away from it.
  async reopen() {
    await this.page.goto(this.productUrl);
    await expect(this.addToCartButton).toBeVisible({ timeout: 30000 });
  }

  async expectCartCount(count) {
    await expect(this.cartCount).toHaveText(String(count), { timeout: 30000 });
  }
}

module.exports = ProductPage;