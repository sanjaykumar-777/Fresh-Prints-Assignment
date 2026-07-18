const { test } = require('../../../fixtures/fixtures');

/* Why this exists on top of the main checkout test: that one adds a product
   only once, so it never shows what happens when the same product is added
   again. The cart is expected to raise the quantity on the line already there
   rather than list the item twice. */
test('merges a repeated add into one line item with quantity 2', async ({
  homePage,
  searchResultsPage,
  cartPage,
  amazonUser,
}) => {
  await homePage.open();

  /* Clearing has to come after signing in, since signing in brings the
     account's saved cart along with it. Doing it the other way round would
     leave old items behind and throw these counts off. */
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

  /* Adding took the browser away from the product, so it has to be opened again
     before the very same item can be added a second time. */
  await productPage.reopen();
  const postAddCart = await productPage.addToCart();
  await postAddCart.expectCartCount(2);

  /* The heart of the test: one line in the cart, but two units on it. Both
     checks together are what tell the two apart — a cart listing the item twice
     would also hold two units, so counting units alone would not catch it. */
  await cartPage.open();
  await cartPage.expectLineItemCount(1);
  await cartPage.expectSubtotalItemCount(2);
});