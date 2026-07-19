const { expect } = require('@playwright/test');
const AddressPage = require('./AddressPage');

/**
 * The Amazon checkout, which is one long page rather than a series of separate
 * ones: the delivery address, the payment choice and the final order review are
 * all sections of it.
 *
 * These tests deliberately stop once the Place Order button is shown to be
 * reachable. That button is never clicked, so no real order is ever placed and
 * nothing is ever charged.
 */
class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.addNewAddressLink = page.getByRole('link', { name: 'Add a new delivery address' });

    /* Used to spot that the address form is already up, so the step is not left
       waiting on a link that is not going to appear. */
    this.addressFormNameField = page.getByLabel('Full name (First and Last name)');
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

  /**
   * Gets to the new-address form, whichever way Amazon has laid the step out.
   *
   * The link was there on both the accounts tried, with and without addresses
   * saved, so ordinarily this just clicks it. Amazon does vary this step by
   * account though, so rather than wait on the link alone this settles for
   * either the link or the form itself, and skips the click if the form is
   * already up.
   */
  async addNewAddress() {
    await expect(
      this.addNewAddressLink.or(this.addressFormNameField).first()
    ).toBeVisible({ timeout: 30000 });

    if (await this.addNewAddressLink.isVisible()) {
      await this.addNewAddressLink.click();
    }

    return new AddressPage(this.page);
  }

  async selectCashOnDelivery() {
    await this.cashOnDelivery.click();
  }

  /**
   * Works through the payment step and leaves the page on the order review.
   *
   * The "Use this payment method" button genuinely has to be pressed twice.
   * These are two different checkout steps that happen to share a button, not a
   * double click. The button stays greyed out until the step before it has
   * finished, so waiting for it to become clickable each time is what proves
   * the previous step actually went through.
   */
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