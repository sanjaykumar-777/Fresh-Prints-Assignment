const { expect } = require('@playwright/test');

// Paying redirects straight to /payment_done, which has nothing to interact
// with beyond the confirmation, so this page object covers both screens.
class PaymentPage {
  constructor(page) {
    this.page = page;
    this.nameOnCard = page.locator('[data-qa="name-on-card"]');
    this.cardNumber = page.locator('[data-qa="card-number"]');
    this.cvc = page.locator('[data-qa="cvc"]');
    this.expiryMonth = page.locator('[data-qa="expiry-month"]');
    this.expiryYear = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');

    this.orderConfirmation = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceLink = page.getByRole('link', { name: /Download Invoice/i });
  }

  async expectReached() {
    await expect(this.page).toHaveURL(/\/payment/);
    await expect(this.payButton).toBeVisible();
  }

  async pay(card) {
    await this.nameOnCard.fill(card.name);
    await this.cardNumber.fill(card.number);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
    await this.payButton.click();
  }

  async expectOrderConfirmed() {
    await expect(this.orderConfirmation).toBeVisible({ timeout: 30000 });
    await expect(this.downloadInvoiceLink).toBeVisible();
  }

  // The confirmation URL carries the amount charged, e.g. /payment_done/900.
  async expectChargedAmount(amount) {
    await expect(this.page).toHaveURL(new RegExp(`/payment_done/${amount}\\b`));
  }
}

module.exports = PaymentPage;