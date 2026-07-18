const { expect } = require('@playwright/test');
const ProductPage = require('./ProductPage');

/**
 * The list of products Amazon shows after a search.
 */
class SearchResultsPage {
  constructor(page) {
    this.page = page;
    this.tiles = page.locator('[data-component-type="s-search-result"]');
    this.sponsoredLabel = page.getByText('Sponsored', { exact: true });
    this.tileAddToCartButton = page.getByRole('button', { name: /add to cart/i });

    /* Amazon words this message the same way every time, saying "your search
       query" rather than repeating what was actually typed, so the wording can
       be matched exactly without knowing the search term. */
    this.noResultsMessage = page.getByText('No results for your search query.');
  }

  /**
   * Picks a search result that can actually be bought straight away.
   *
   * Two kinds of result are skipped. Sponsored ones are adverts that often have
   * nothing to do with what was searched for, and results without their own
   * "Add to cart" button lead to products that ask the shopper to choose a size
   * or colour first, which would send the test down a different path.
   */
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

  /**
   * Opens one of the buyable results and returns that product's page.
   *
   * Clicking a result title makes Amazon open the product in a brand new tab,
   * so the click and the wait for that tab are started together. Waiting only
   * after clicking would risk the tab having already opened and the wait
   * hanging for something that has been and gone.
   */
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