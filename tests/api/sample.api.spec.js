const { test, expect } = require('../../fixtures/fixtures');

/* Template for a new API spec. Nothing runs yet: ApiClient still needs wiring
   into fixtures.js, and a project pointing at this folder. */

test.describe('subject', () => {
  test.skip('describes what should happen', async ({ apiClient }) => {
    const response = await apiClient.get('/path');

    expect(response.status()).toBe(200);
  });
});