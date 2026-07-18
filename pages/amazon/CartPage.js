const { expect } = require('@playwright/test');
const CheckoutPage = require('./CheckoutPage');

// Turns "₹130.00" into 130 so amounts can be compared as numbers.
const toAmount = (text) => Number(text.replace(/[^\d.]/g, ''));

class CartPage {
  constructor(page) {
    this.page = page;
    this.cartCount = page.locator('#nav-cart-count');
    // The accessible name carries a dynamic "(N item)"; match the stable part.
    this.proceedToBuyButton = page.getByRole('button', { name: /proceed to buy/i });
    this.deleteButtons = page.locator('input[value="Delete"]');
    this.emptyMessage = page.getByText(/Your Amazon Cart is empty/i);
    // Scoped to Active Items so anything saved for later is not counted.
    this.lineItems = page.locator('[data-name="Active Items"] .sc-list-item');
    // Amazon A/B tests the quantity control between a stepper and a dropdown,
    // so the widget itself is an unreliable anchor. The subtotal states the
    // item count in both variants.
    this.subtotalLabel = page.getByText(/Subtotal \(\d+ items?\)/).first();
    this.subtotalAmount = page.locator('#sc-subtotal-amount-activecart');
  }

  async open() {
    await this.page.goto('/gp/cart/view.html');
  }

  // Old runs leave items in the account cart; merged in at login, a single
  // stale out-of-stock item forces the whole checkout to /entry/oos. Clearing
  // the cart is what keeps checkout deterministic.
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

  // Price and quantity for every active line. Each row lists the current price
  // first and the struck-through M.R.P. second, so the first match is the one
  // actually being charged.
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