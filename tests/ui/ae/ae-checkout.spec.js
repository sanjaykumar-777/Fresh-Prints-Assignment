const { test, expect } = require('../../../fixtures/fixtures');

// Test card. The site accepts any well-formed values; nothing is really charged.
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

  // The order total should be exactly the sum of the line items.
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