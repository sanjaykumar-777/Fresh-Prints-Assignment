const { test, expect } = require('../../../fixtures/fixtures');

/* Why this exists on top of the main checkout test: that one only ever has a
   single item in the cart, where the subtotal and the item's own price are the
   same number, so it would still pass even if the adding up were broken. This
   test fills the cart with more than one thing, where the subtotal has to be
   every price multiplied by its quantity and then totalled. */
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

  /* Two different products on purpose. Two of the same thing could add up
     correctly by luck even if the sum were wrong, so picking items with
     different prices makes the check mean something. */
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

  /* Compared to two decimal places rather than demanding an exact match.
     Computers store fractions a touch imprecisely, so adding up amounts with
     paise can leave a tiny remainder: 10.1 plus 20.2 comes out as
     30.299999999999997 instead of 30.30. Two decimal places is as precise as
     money gets here, so that is the sensible place to stop. */
  expect(await cartPage.subtotal()).toBeCloseTo(expectedSubtotal, 2);
});