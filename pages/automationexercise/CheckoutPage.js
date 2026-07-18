const { expect } = require('@playwright/test');
const PaymentPage = require('./PaymentPage');

// Turns "Rs. 1,200" into 1200 so totals can be compared as numbers.
const toAmount = (text) => Number(text.replace(/[^\d]/g, ''));

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.commentBox = page.locator('textarea.form-control');
    this.placeOrderLink = page.getByRole('link', { name: 'Place Order' });
    // One cell per line item, then the grand total as the final cell.
    this.amounts = page.locator('.cart_total_price');
  }

  async expectReached() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.deliveryAddress).toBeVisible();
  }

  async lineTotals() {
    const all = await this.amounts.allInnerTexts();
    return all.slice(0, -1).map(toAmount);
  }

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