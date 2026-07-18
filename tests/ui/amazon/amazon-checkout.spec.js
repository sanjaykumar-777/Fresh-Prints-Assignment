const { test, expect } = require('../../../fixtures/fixtures');

/* A made-up address for the form. Worth knowing that saving it really does add
   it to the account's address book, so these entries build up over time and are
   worth tidying up now and then. Nothing is bought, though: the test stops once
   the Place Order button is on screen and never clicks it. */
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

  /* The order of these two steps matters. Signing in pulls the account's saved
     cart in alongside whatever is already there, so clearing has to come after
     signing in. Clearing first would look tidy and achieve nothing, because the
     old items would arrive straight afterwards. */
  const signInPage = await homePage.goToSignIn();
  await signInPage.login(amazonUser);
  await cartPage.open();
  await cartPage.empty();

  await homePage.open();
  await homePage.search('sticky notes');

  const productPage = await searchResultsPage.openFirstBuyableProduct();
  await productPage.expectLoaded();

  /* Read the price as it stands right now rather than writing an expected
     figure into the test. Amazon changes prices whenever it likes, so what is
     being checked is that the price shown on the product carries through to the
     cart unchanged, whatever that price happens to be today. */
  const unitPrice = await productPage.unitPrice();

  const postAddCart = await productPage.addToCart();
  await postAddCart.expectCartCount(1);

  /* Adding leaves the browser on an in-between confirmation page, which does not
     show the subtotal, so the cart proper has to be opened to read it. */
  await postAddCart.open();
  expect(await postAddCart.subtotal()).toBe(unitPrice);

  const checkoutPage = await postAddCart.proceedToCheckout();
  await checkoutPage.expectReached();

  const addressPage = await checkoutPage.addNewAddress();
  await addressPage.fillAddress(deliveryAddress);
  await addressPage.deliverToThisAddress();

  /* Still the same checkout page as before, which is why nothing is navigated
     to here: payment and the final review are further sections of it. */
  await checkoutPage.selectCashOnDelivery();
  await checkoutPage.confirmPaymentMethod();
  await checkoutPage.expectPlaceOrderVisible();
});