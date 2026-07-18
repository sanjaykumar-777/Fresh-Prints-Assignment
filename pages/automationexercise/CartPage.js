const { expect } = require('@playwright/test');
const CheckoutPage = require('./CheckoutPage');

/**
 * The shopping cart: what is in it, and the way through to checkout.
 */
class CartPage {
  constructor(page) {
    this.page = page;
    this.rows = page.locator('#cart_info_table tbody tr');
    this.productNames = page.locator('.cart_description h4 a');
    this.deleteButtons = page.locator('a.cart_quantity_delete');
    this.emptyMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout', { exact: true });
  }

  async open() {
    await this.page.goto('/view_cart');
  }

  /**
   * Empties the cart so a test always starts from a known, clean state.
   *
   * The cart belongs to the account and survives between runs, so leftovers
   * from an earlier run would still be sitting here and would quietly throw the
   * totals off.
   *
   * Items are removed one at a time, waiting for each to disappear before going
   * on to the next, because the page updates the list as it goes. The count it
   * stops at is only a safety net, so a delete that never takes effect cannot
   * leave this spinning forever.
   */
  async empty() {
    let count = await this.deleteButtons.count();
    for (let guard = 0; guard < 25 && count > 0; guard++) {
      await this.deleteButtons.first().click();
      await expect(this.deleteButtons).toHaveCount(count - 1, { timeout: 15000 });
      count = await this.deleteButtons.count();
    }
    await expect(this.emptyMessage).toBeVisible();
  }

  /**
   * Checks the cart holds exactly these products, in this order.
   *
   * An extra item, a missing one, or the same items listed in a different order
   * will all fail this check.
   */
  async expectProducts(names) {
    await expect(this.productNames).toHaveText(names);
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
    return new CheckoutPage(this.page);
  }
}

module.exports = CartPage;