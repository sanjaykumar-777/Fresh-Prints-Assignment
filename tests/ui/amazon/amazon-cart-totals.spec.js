const { test, expect } = require('../../../fixtures/fixtures');

// The happy path only ever holds one item, where the subtotal and the unit
// price happen to be the same number. With several lines the subtotal has to
// be the sum of price x quantity across all of them.
test('subtotal equals the sum of every cart line', async ({
  homePage,
  searchResultsPage,
  cartPage,
  amazonUser,
}) => {
  await homePage.open();

  const signInPage = await homePage.goToSignIn();
  await signInPage.login(amazonUser);
  await cartPage.open();
  await cartPage.empty();

  // Two different products, so the subtotal cannot match by coincidence.
  for (const index of [0, 1]) {
    await homePage.open();
    await homePage.search('sticky notes');

    const productPage = await searchResultsPage.openBuyableProduct(index);
    await productPage.expectLoaded();
    await productPage.addToCart();
  }

  await cartPage.open();
  await cartPage.expectLineItemCount(2);

  const lines = await cartPage.lines();
  const expectedSubtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  // Prices carry paise, so compare to 2 decimal places rather than exactly:
  // summing them in floating point drifts (10.1 + 20.2 is 30.299999999999997).
  expect(await cartPage.subtotal()).toBeCloseTo(expectedSubtotal, 2);
});