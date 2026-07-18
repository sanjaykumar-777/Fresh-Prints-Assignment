const { expect } = require('@playwright/test');

/**
 * The product listing page, where items are browsed, searched and added to the
 * cart.
 */
class ProductsPage {
  constructor(page) {
    this.page = page;
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');

    /* A small pop-up confirming the item went in, which appears every single
       time something is added and has to be dismissed before carrying on. */
    this.cartModal = page.locator('#cartModal');

    this.continueShoppingButton = page.getByRole('button', { name: /continue shopping/i });
  }

  async open() {
    await this.page.goto('/products');
  }

  /**
   * Adds one product to the cart and gives back its name.
   *
   * The "Add to cart" link only appears once the mouse is over the product, so
   * the card is hovered before clicking. The name is handed back because the
   * cart and checkout tests later need to recognise the same item again.
   */
  async addProductToCart(index) {
    const card = this.productCards.nth(index);
    const name = (await card.locator('.productinfo p').first().innerText()).trim();

    await card.hover();
    await card.locator('.overlay-content a.add-to-cart').first().click();

    await expect(this.cartModal).toBeVisible();
    await this.continueShoppingButton.click();

    /* Waiting for the pop-up to finish closing matters: while it fades out it
       still covers the page, so hovering the next product would hit the fading
       pop-up instead of the product underneath. */
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