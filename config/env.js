/**
 * Gathers the settings the tests need — site addresses and login details — and
 * checks none are missing before anything starts running.
 *
 * Settings are kept in files under environments/ rather than in the code, so
 * that passwords are never committed and each person can point the suite at
 * their own accounts.
 */

const path = require('path');
const dotenv = require('dotenv');

/* Which settings file to read. Naming an environment picks a matching file, so
   TEST_ENV=staging reads environments/.env.staging. That lets the very same
   tests run against a different deployment without a line of code changing.
   With nothing named, the ordinary environments/.env is used. */
const envFile = process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env';

dotenv.config({ path: path.resolve(__dirname, '..', 'environments', envFile) });

const REQUIRED = [
  'AMAZON_URL',
  'AMAZON_EMAIL',
  'AMAZON_PASSWORD',
  'AE_URL',
  'AE_EMAIL',
  'AE_PASSWORD',
];

/**
 * Reads every setting listed, and refuses to carry on if any is missing.
 *
 * All of them are gathered up before complaining, so one run tells you the full
 * list of what needs filling in rather than making you fix them one at a time.
 *
 * Stopping here is deliberate. A missing password would otherwise surface much
 * later as a puzzling sign-in failure part way through a test, which is far
 * harder to make sense of than being told plainly at the outset.
 */
function readRequired(keys) {
  const values = {};
  const missing = [];

  for (const key of keys) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
      continue;
    }
    values[key] = value;
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars in environments/${envFile}: ${missing.join(', ')}.\n` +
        'Copy environments/.env.example and fill in every key.'
    );
  }

  return values;
}

const isCI = Boolean(process.env.CI);

/* Handed out frozen so nothing can quietly alter a setting once the run has
   begun, which would leave tests behaving differently depending on the order
   they happened to run in. */
module.exports = Object.freeze({ ...readRequired(REQUIRED), isCI });