const { test } = require('../../../fixtures/fixtures');

// Edge case: the happy path only ever adds a product once. Adding the same
// product twice must update the existing line rather than create a second one.
test('merges a repeated add into one line item with quantity 2', async ({
  homePage,
  searchResultsPage,
  cartPage,
  amazonUser,
}) => {
  await homePage.open();

  // Sign in first, then clear the cart: a stale item from a prior run would
  // otherwise be merged in and throw the counts off.
  const signInPage = await homePage.goToSignIn();
  await signInPage.login(amazonUser);
  await cartPage.open();
  await cartPage.empty();

  await homePage.open();
  await homePage.search('sticky notes');

  const productPage = await searchResultsPage.openFirstBuyableProduct();
  await productPage.expectLoaded();

  await productPage.addToCart();
  await productPage.expectCartCount(1);

  // Adding leaves the product page, so go back before adding the same item again.
  await productPage.reopen();
  const postAddCart = await productPage.addToCart();
  await postAddCart.expectCartCount(2);

  // One line holding both units, rather than the item listed twice.
  await cartPage.open();
  await cartPage.expectLineItemCount(1);
  await cartPage.expectSubtotalItemCount(2);
});