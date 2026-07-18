const { test } = require('../../../fixtures/fixtures');

// Nonsense string chosen so it cannot start matching real products later.
const UNMATCHABLE_TERM = 'qwrtyplkjhgfdsazxcvbnm123';

test('shows the no-results state for a search that matches nothing', async ({
  homePage,
  searchResultsPage,
}) => {
  await homePage.open();
  await homePage.search(UNMATCHABLE_TERM);

  await searchResultsPage.expectNoResults();
});