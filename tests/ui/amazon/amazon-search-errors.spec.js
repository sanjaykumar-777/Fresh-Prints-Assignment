const { test } = require('../../../fixtures/fixtures');

/* Deliberate gibberish. A real-looking word risks Amazon stocking something
   that matches it one day, which would quietly turn this into a test that no
   longer checks the empty-results message at all. */
const UNMATCHABLE_TERM = 'qwrtyplkjhgfdsazxcvbnm123';

test('shows the no-results state for a search that matches nothing', async ({
  homePage,
  searchResultsPage,
}) => {
  await homePage.open();
  await homePage.search(UNMATCHABLE_TERM);

  await searchResultsPage.expectNoResults();
});