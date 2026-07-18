const { expect } = require('@playwright/test');
const ProductPage = require('./ProductPage');

class SearchResultsPage {
  constructor(page) {
    this.page = page;
    this.tiles = page.locator('[data-component-type="s-search-result"]');
    this.sponsoredLabel = page.getByText('Sponsored', { exact: true });
    this.tileAddToCartButton = page.getByRole('button', { name: /add to cart/i });
    // Wording is generic — "your search query", not the term that was typed.
    this.noResultsMessage = page.getByText('No results for your search query.');
  }

  // Sponsored tiles are ads for unrelated brands; tiles without an inline
  // Add to cart button are variant products that behave differently.
  buyableTile(index = 0) {
    return this.tiles
      .filter({ hasNot: this.sponsoredLabel })
      .filter({ has: this.tileAddToCartButton })
      .nth(index);
  }

  async expectNoResults() {
    await expect(this.noResultsMessage).toBeVisible({ timeout: 30000 });
    await expect(this.tiles).toHaveCount(0);
  }

  // The result title link opens the product in a new tab.
  async openBuyableProduct(index = 0) {
    const tile = this.buyableTile(index);
    await expect(tile).toBeVisible({ timeout: 30000 });

    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      tile.locator('a:has(h2)').first().click(),
    ]);

    return new ProductPage(popup);
  }

  async openFirstBuyableProduct() {
    return this.openBuyableProduct(0);
  }
}

module.exports = SearchResultsPage;