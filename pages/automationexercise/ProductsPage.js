const { expect } = require('@playwright/test');

class ProductsPage {
  constructor(page) {
    this.page = page;
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    // Confirmation dialog shown after every add to cart.
    this.cartModal = page.locator('#cartModal');
    this.continueShoppingButton = page.getByRole('button', { name: /continue shopping/i });
  }

  async open() {
    await this.page.goto('/products');
  }

  // Add to cart lives in a hover overlay, so the card has to be hovered first.
  // Returns the product name so the test can assert on it later in the cart.
  async addProductToCart(index) {
    const card = this.productCards.nth(index);
    const name = (await card.locator('.productinfo p').first().innerText()).trim();

    await card.hover();
    await card.locator('.overlay-content a.add-to-cart').first().click();

    await expect(this.cartModal).toBeVisible();
    await this.continueShoppingButton.click();
    // The next hover would land on the backdrop if the modal is still closing.
    await expect(this.cartModal).toBeHidden();

    return name;
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async expectResultCount(count) {
    await expect(this.productCards).toHaveCount(count);
  }
}

module.exports = ProductsPage;