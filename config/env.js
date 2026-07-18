const path = require('path');
const dotenv = require('dotenv');

// TEST_ENV=staging -> environments/.env.staging, so the same suite can target another deployment.
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

module.exports = Object.freeze({ ...readRequired(REQUIRED), isCI });