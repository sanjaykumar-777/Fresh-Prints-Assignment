const { test, expect } = require('../../../fixtures/fixtures');

/* A made-up card. This is a practice shopping site that accepts any details of
   roughly the right shape, and no money ever changes hands. */
const card = {
  name: 'Test Automation User',
  number: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};

test('places an order for two products and reaches the confirmation', async ({
  aeProductsPage,
  aeCartPage,
}) => {
  await aeCartPage.open();
  await aeCartPage.empty();

  await aeProductsPage.open();
  const firstProduct = await aeProductsPage.addProductToCart(0);
  const secondProduct = await aeProductsPage.addProductToCart(1);

  await aeCartPage.open();
  await aeCartPage.expectProducts([firstProduct, secondProduct]);

  const checkoutPage = await aeCartPage.proceedToCheckout();
  await checkoutPage.expectReached();

  /* Counting the lines matters as much as adding them up. If the products never
     made it to the checkout, an empty list would add up to zero and sit happily
     alongside a zero total, and the sum on its own would pass without having
     proved anything. */
  const lineTotals = await checkoutPage.lineTotals();
  const grandTotal = await checkoutPage.grandTotal();
  expect(lineTotals).toHaveLength(2);
  expect(grandTotal).toBe(lineTotals.reduce((sum, amount) => sum + amount, 0));

  const paymentPage = await checkoutPage.placeOrder('Automated test order - please ignore');
  await paymentPage.expectReached();

  await paymentPage.pay(card);
  await paymentPage.expectOrderConfirmed();
  await paymentPage.expectChargedAmount(grandTotal);
});