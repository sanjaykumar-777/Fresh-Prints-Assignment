/**
 * A thin wrapper around Playwright's own request context, so every API call in
 * the suite is made the same way.
 *
 * Playwright's request context is used rather than a separate HTTP library
 * because it can share the signed-in session the UI tests already have, so an
 * API call and a page can act as the same logged-in user.
 *
 * This is where the calling methods go, along with anything every call needs:
 * joining the base address to a path from endpoints.js, the common headers, and
 * turning a failed response into a readable error.
 *
 * Nothing here knows about any particular part of the site. Services under
 * api/services/ do that, and use this to do the talking.
 *
 * Handed to tests through fixtures/fixtures.js, the same way page objects are.
 */
class ApiClient {
  constructor(request, baseUrl) {
    this.request = request;
    this.baseUrl = baseUrl;
  }
}

module.exports = ApiClient;