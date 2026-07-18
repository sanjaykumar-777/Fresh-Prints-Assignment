const { expect } = require('@playwright/test');

/**
 * The card payment form and the order confirmation that follows it.
 *
 * Paying sends the browser straight to the confirmation screen, and that screen
 * holds nothing to interact with beyond the confirmation message itself, so one
 * page object covers both rather than splitting off a near-empty second one.
 */
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

  /**
   * Fills in the card details and submits the payment.
   *
   * This is a practice shopping site, so the card details are made-up ones and
   * no money ever changes hands.
   */
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

  /**
   * Checks the amount actually charged matches what the cart said it would be.
   *
   * The site puts that figure in the web address of the confirmation page, as
   * in "/payment_done/900", so the address is where it can be read back from.
   */
  async expectChargedAmount(amount) {
    await expect(this.page).toHaveURL(new RegExp(`/payment_done/${amount}\\b`));
  }
}

module.exports = PaymentPage;