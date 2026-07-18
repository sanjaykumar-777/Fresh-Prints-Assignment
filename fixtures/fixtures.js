const { test: base, expect } = require('@playwright/test');

const AmazonHomePage = require('../pages/amazon/HomePage');
const AmazonSearchResultsPage = require('../pages/amazon/SearchResultsPage');
const AmazonCartPage = require('../pages/amazon/CartPage');

const AeLoginPage = require('../pages/automationexercise/LoginPage');
const AeProductsPage = require('../pages/automationexercise/ProductsPage');
const AeCartPage = require('../pages/automationexercise/CartPage');

/**
 * Hands every test its own ready-made page objects and login details, so tests
 * can ask for what they need by name instead of building it themselves.
 *
 * A test that writes `{ homePage, cartPage }` in its arguments is given those
 * two, freshly made for that test alone. Nothing is shared between tests, which
 * is what keeps them from interfering with one another.
 */
const test = base.extend({
  /* Left blank here on purpose. The real email and password are filled in per
     site by playwright.config.js, which reads them from the environment so no
     credentials are ever written into the code. */
  amazonUser: [{ email: '', password: '' }, { option: true }],
  aeUser: [{ email: '', password: '' }, { option: true }],

  /* Only the pages a test can open directly are listed here, for both sites.
     The likes of the product, sign-in, checkout and payment pages are left out
     on purpose: a shopper can only arrive at those by going through another
     page, so whichever page leads there hands them over instead. That keeps
     tests following the same route a real shopper would take. */
  homePage: async ({ page }, use) => use(new AmazonHomePage(page)),
  searchResultsPage: async ({ page }, use) => use(new AmazonSearchResultsPage(page)),
  cartPage: async ({ page }, use) => use(new AmazonCartPage(page)),

  aeLoginPage: async ({ page }, use) => use(new AeLoginPage(page)),
  aeProductsPage: async ({ page }, use) => use(new AeProductsPage(page)),
  aeCartPage: async ({ page }, use) => use(new AeCartPage(page)),
});

module.exports = { test, expect };