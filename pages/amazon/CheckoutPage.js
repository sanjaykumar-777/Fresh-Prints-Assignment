const { expect } = require('@playwright/test');
const AddressPage = require('./AddressPage');

// The single-page checkout reached after signing in. Address, payment and the
// order review are all sections of this one page. The suite stops at confirming
// Place Order is reachable — it never clicks it, so no real order is placed.
class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.addNewAddressLink = page.getByRole('link', { name: 'Add a new delivery address' });
    this.cashOnDelivery = page.getByRole('radio', {
      name: 'Cash on Delivery/Pay on Delivery',
      checked: false,
    });
    this.usePaymentMethodButton = page.locator('[data-testid="bottom-continue-button"]');
    this.placeOrderButton = page.locator('[data-testid="SPC_selectPlaceOrder"]');
  }

  async expectReached() {
    await expect(this.page).toHaveURL(/\/checkout\//, { timeout: 30000 });
  }

  async addNewAddress() {
    await expect(this.addNewAddressLink).toBeVisible({ timeout: 30000 });
    await this.addNewAddressLink.click();
    return new AddressPage(this.page);
  }

  async selectCashOnDelivery() {
    await this.cashOnDelivery.click();
  }

  // "Use this payment method" has to be clicked twice — two separate checkout
  // steps, not a double click. The button is disabled until a payment method is
  // selected, so waiting for it to enable is what confirms the previous step
  // landed. After the second click the page re-renders into the order review.
  async confirmPaymentMethod() {
    for (let step = 0; step < 2; step++) {
      await expect(this.usePaymentMethodButton).toBeEnabled({ timeout: 30000 });
      await this.usePaymentMethodButton.click();
    }
  }

  async expectPlaceOrderVisible() {
    await expect(this.placeOrderButton.first()).toBeVisible({ timeout: 30000 });
  }
}

module.exports = CheckoutPage;