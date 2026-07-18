const { expect } = require('@playwright/test');
const CheckoutPage = require('./CheckoutPage');
const { toAmount } = require('../../utils/amount');

/**
 * The Amazon shopping cart: the items in it, the subtotal, and the way through
 * to checkout.
 */
class CartPage {
  constructor(page) {
    this.page = page;
    this.cartCount = page.locator('#nav-cart-count');

    /* The button label includes a changing "(N items)" count, so only the part
       of the wording that always stays the same is matched. */
    this.proceedToBuyButton = page.getByRole('button', { name: /proceed to buy/i });

    this.deleteButtons = page.locator('input[value="Delete"]');
    this.emptyMessage = page.getByText(/Your Amazon Cart is empty/i);

    /* Limited to the "Active Items" section so anything the shopper saved for
       later is left out of the counts and totals. */
    this.lineItems = page.locator('[data-name="Active Items"] .sc-list-item');

    /* Amazon shows the quantity control as either a stepper or a dropdown and
       switches between the two from visit to visit, so the control itself is
       not a dependable place to read the item count from. The subtotal line
       spells the count out in both versions. */
    this.subtotalLabel = page.getByText(/Subtotal \(\d+ items?\)/).first();

    this.subtotalAmount = page.locator('#sc-subtotal-amount-activecart');
  }

  async open() {
    await this.page.goto('/gp/cart/view.html');
  }

  /**
   * Empties the cart so a test always starts from a known, clean state.
   *
   * The account remembers its cart between runs, and signing in merges those
   * leftover items back in. If even one of them is no longer in stock, Amazon
   * diverts the whole checkout to an "out of stock" page and the test fails for
   * a reason that has nothing to do with what is being checked.
   *
   * Items are removed one at a time, waiting for each to disappear before going
   * on to the next, because the page rebuilds the list as it goes. The count it
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
    await expect(this.cartCount).toHaveText('0', { timeout: 15000 });
  }

  async expectCartCount(count) {
    await expect(this.cartCount).toHaveText(String(count), { timeout: 30000 });
  }

  async expectLineItemCount(count) {
    await expect(this.lineItems).toHaveCount(count, { timeout: 30000 });
  }

  /**
   * Reads the price and quantity of every item sitting in the cart.
   *
   * A row shows the price being charged first and the crossed-out original
   * price second, so the first one found is the amount that actually counts.
   */
  async lines() {
    const count = await this.lineItems.count();
    const lines = [];

    for (let index = 0; index < count; index++) {
      const row = this.lineItems.nth(index);
      lines.push({
        price: toAmount(await row.locator('.a-price .a-offscreen').first().textContent()),
        quantity: Number((await row.locator('[data-a-selector="value"]').first().textContent()).trim()),
      });
    }

    return lines;
  }

  async subtotal() {
    await expect(this.subtotalAmount).toHaveCount(1, { timeout: 30000 });
    return toAmount(await this.subtotalAmount.textContent());
  }

  async expectSubtotalItemCount(count) {
    await expect(this.subtotalLabel).toContainText(`(${count} item`, { timeout: 30000 });
  }

  async proceedToCheckout() {
    await this.proceedToBuyButton.first().click();
    return new CheckoutPage(this.page);
  }
}

module.exports = CartPage;