const { expect } = require('@playwright/test');
const CartPage = require('./CartPage');
const { toAmount } = require('../../utils/amount');

/**
 * A single Amazon product page: its title, its price, and adding it to the cart.
 */
class ProductPage {
  constructor(page) {
    this.page = page;

    /* The title appears twice on the page, so the first one is picked to keep
       the match unambiguous. */
    this.title = page.locator('#productTitle').first();

    this.addToCartButton = page.locator('#add-to-cart-button');
    this.cartCount = page.locator('#nav-cart-count');

    /* Prices are scattered all over a product page (related items, deals,
       delivery offers) and a plain price search turns up more than twenty of
       them. Narrowing to the main purchase box picks out the one price that
       belongs to the product being bought. */
    this.price = page.locator('#corePrice_feature_div .a-offscreen').first();
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible({ timeout: 30000 });
  }

  /**
   * Reads the price of one unit of this product as a number.
   *
   * The price sits in an element that is hidden from view and meant only for
   * screen readers. Asking for the visible text of a hidden element gives back
   * nothing, so the raw text content has to be read instead.
   */
  async unitPrice() {
    await expect(this.price).toHaveCount(1, { timeout: 30000 });
    return toAmount(await this.price.textContent());
  }

  /**
   * Adds this product to the cart and hands back the cart page.
   *
   * Adding sends the browser off to an in-between confirmation page, so the
   * product's address is noted down first. That makes it possible to come back
   * here later, which the duplicate-item test needs in order to add the same
   * product a second time.
   */
  async addToCart() {
    this.productUrl = this.page.url();
    await this.addToCartButton.click();
    return new CartPage(this.page);
  }

  /**
   * Goes back to this product after adding it moved the browser elsewhere.
   */
  async reopen() {
    await this.page.goto(this.productUrl);
    await expect(this.addToCartButton).toBeVisible({ timeout: 30000 });
  }

  async expectCartCount(count) {
    await expect(this.cartCount).toHaveText(String(count), { timeout: 30000 });
  }
}

module.exports = ProductPage;