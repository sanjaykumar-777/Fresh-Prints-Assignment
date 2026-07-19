/**
 * Every API path the tests use, gathered in one place.
 *
 * Keeping them together means a path that changes is corrected once rather than
 * hunted for across the suite.
 *
 * Paths only. The address of a particular environment comes from config/env.js,
 * so the same paths work whichever deployment is being tested.
 *
 * Group them by subject, matching the service classes under api/services/, and
 * write a path that needs an id as a small function.
 */
const endpoints = {};

module.exports = endpoints;