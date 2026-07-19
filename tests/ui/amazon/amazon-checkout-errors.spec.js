const { test } = require('../../../fixtures/fixtures');

/* Why this exists on top of the other error tests: those two turn away a wrong
   password and an unmatchable search, both of which happen before the cart. Up
   to now nothing checked that checkout itself refuses bad input, even though
   that is the step where a mistake actually costs something. */

/* The same address the happy path uses, with only the pincode spoiled. Every
   other field is deliberately valid: if several were wrong at once, the test
   passing would not tell you which one Amazon actually objected to. */
const addressWithBadPincode = {
  fullName: 'Test Automation User',
  mobile: '9876543210',

  /* Five digits where an Indian pincode has six. Wrong in its shape rather than
     simply unrecognised, which matters for keeping this test steady: a
     well-formed pincode Amazon does not deliver to today might well become one
     it delivers to next month, and this test would quietly stop checking
     anything. A five-digit pincode can never be valid. */
  pincode: '12345',

  flat: '123, Test Apartment',
  area: 'MG Road',
  landmark: 'Near Central Mall',
  town: 'Bengaluru',
  state: 'Karnataka',
};

test('refuses a delivery address whose pincode is the wrong length', async ({
  homePage,
  searchResultsPage,
  cartPage,
  amazonUser,
}) => {
  await homePage.open();

  /* Clearing has to follow signing in, since signing in brings the account's
     saved cart along with it. */
  const signInPage = await homePage.goToSignIn();
  await signInPage.login(amazonUser);
  await cartPage.open();
  await cartPage.empty();

  await homePage.open();
  await homePage.search('sticky notes');

  const productPage = await searchResultsPage.openFirstBuyableProduct();
  await productPage.expectLoaded();

  const postAddCart = await productPage.addToCart();
  await postAddCart.expectCartCount(1);

  /* Adding leaves the browser on an in-between confirmation page, so the cart
     proper has to be opened before checkout can be reached from it. */
  await postAddCart.open();

  const checkoutPage = await postAddCart.proceedToCheckout();
  await checkoutPage.expectReached();

  const addressPage = await checkoutPage.addNewAddress();
  await addressPage.fillAddress(addressWithBadPincode);
  await addressPage.deliverToThisAddress();

  /* Checks both halves of the refusal: the complaint is shown, and the shopper
     is still on the address step rather than having slipped through to
     payment. */
  await addressPage.expectPincodeRejected();
});