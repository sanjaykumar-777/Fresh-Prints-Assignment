const { test, expect } = require('../../../fixtures/fixtures');

// A throwaway address for the form. "Deliver to this address" saves it to the
// account's address book; the test stops at the Place Order button without
// clicking it, so no order is placed.
const deliveryAddress = {
  fullName: 'Test Automation User',
  mobile: '9876543210',
  pincode: '560001',
  flat: '123, Test Apartment',
  area: 'MG Road',
  landmark: 'Near Central Mall',
  town: 'Bengaluru',
  state: 'Karnataka',
};

test('signs in, adds a product, and reaches Place Order via cash on delivery', async ({
  homePage,
  searchResultsPage,
  cartPage,
  amazonUser,
}) => {
  await homePage.open();

  // Sign in first, then clear the cart: a stale item from a prior run would
  // otherwise merge in and divert checkout to the out-of-stock page.
  const signInPage = await homePage.goToSignIn();
  await signInPage.login(amazonUser);
  await cartPage.open();
  await cartPage.empty();

  await homePage.open();
  await homePage.search('sticky notes');

  const productPage = await searchResultsPage.openFirstBuyableProduct();
  await productPage.expectLoaded();

  // Captured at runtime: Amazon's prices move, so the check is that this figure
  // survives into the cart, not that it equals any fixed amount.
  const unitPrice = await productPage.unitPrice();

  const postAddCart = await productPage.addToCart();
  await postAddCart.expectCartCount(1);

  // Adding lands on an interstitial; open the cart itself to read the subtotal.
  await postAddCart.open();
  expect(await postAddCart.subtotal()).toBe(unitPrice);

  const checkoutPage = await postAddCart.proceedToCheckout();
  await checkoutPage.expectReached();

  const addressPage = await checkoutPage.addNewAddress();
  await addressPage.fillAddress(deliveryAddress);
  await addressPage.deliverToThisAddress();

  // Payment and review are sections of the same checkout page.
  await checkoutPage.selectCashOnDelivery();
  await checkoutPage.confirmPaymentMethod();
  await checkoutPage.expectPlaceOrderVisible();
});