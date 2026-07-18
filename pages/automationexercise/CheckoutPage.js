const { expect } = require('@playwright/test');
const PaymentPage = require('./PaymentPage');
const { toAmount } = require('../../utils/amount');

/**
 * The order review page: addresses, the amounts being charged, and placing the
 * order.
 */
class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.commentBox = page.locator('textarea.form-control');
    this.placeOrderLink = page.getByRole('link', { name: 'Place Order' });

    /* Every amount on the order table, gathered together: one for each product,
       followed by the grand total at the very end. The page gives the total no
       marking of its own to set it apart, so its position at the end is the
       only thing that identifies it. */
    this.amounts = page.locator('.cart_total_price');
  }

  async expectReached() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.deliveryAddress).toBeVisible();
  }

  /**
   * The amount charged for each product, as numbers. The last amount is left
   * out because it is the grand total rather than a product.
   */
  async lineTotals() {
    const all = await this.amounts.allInnerTexts();
    return all.slice(0, -1).map(toAmount);
  }

  /**
   * The overall total for the order, taken from the last amount on the table.
   */
  async grandTotal() {
    const all = await this.amounts.allInnerTexts();
    return toAmount(all[all.length - 1]);
  }

  async placeOrder(comment) {
    await this.commentBox.fill(comment);
    await this.placeOrderLink.click();
    return new PaymentPage(this.page);
  }
}

module.exports = CheckoutPage;