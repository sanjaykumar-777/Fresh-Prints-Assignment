const { test: base, expect } = require('@playwright/test');

const AmazonHomePage = require('../pages/amazon/HomePage');
const AmazonSearchResultsPage = require('../pages/amazon/SearchResultsPage');
const AmazonCartPage = require('../pages/amazon/CartPage');

const AeLoginPage = require('../pages/automationexercise/LoginPage');
const AeProductsPage = require('../pages/automationexercise/ProductsPage');
const AeCartPage = require('../pages/automationexercise/CartPage');

const test = base.extend({
  // Login details. Real values come from playwright.config.js.
  amazonUser: [{ email: '', password: '' }, { option: true }],
  aeUser: [{ email: '', password: '' }, { option: true }],

  // Amazon page objects, ready to use in every test.
  homePage: async ({ page }, use) => use(new AmazonHomePage(page)),
  searchResultsPage: async ({ page }, use) => use(new AmazonSearchResultsPage(page)),
  cartPage: async ({ page }, use) => use(new AmazonCartPage(page)),

  // AutomationExercise page objects. Checkout and payment are reached by
  // navigating from these, so they are returned rather than injected.
  aeLoginPage: async ({ page }, use) => use(new AeLoginPage(page)),
  aeProductsPage: async ({ page }, use) => use(new AeProductsPage(page)),
  aeCartPage: async ({ page }, use) => use(new AeCartPage(page)),
});

module.exports = { test, expect };