const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'auth', 'ae-user.json');

/**
 * Deletes the saved sign-in session once the whole run has finished.
 *
 * The file holds a real logged-in session for the shared account, so leaving it
 * on disk between runs is both a small secret sitting around and a stale one:
 * the next run would start from a session that may already have expired instead
 * of signing in fresh.
 */
module.exports = async () => {
  await fs.promises.rm(AUTH_FILE, { force: true });
};