  # Test Framework Architecture

A Playwright end-to-end test framework. Use this document as the blueprint when setting up
a new project: build the folders in the order listed, follow the rules for each layer.

**Stack:** Node.js + `@playwright/test` + `@faker-js/faker` + `dotenv` (CommonJS).

---

## 1. Directory structure


```
project-root/
├── package.json
├── playwright.config.js     # the only place Playwright is configured
├── global-teardown.js       # cleanup after the run
│
├── environments/
│   ├── .env                 # real values, gitignored
│   ├── .env.example         # same keys, empty values, committed
│   └── .env.staging         # per-environment overrides, gitignored
│
├── config/
│   └── env.js               # the only place process.env is read
│
├── pages/                   # one class per screen (Page Objects)
│   ├── LoginPage.js
│   ├── <Resource>Page.js
│   └── components/          # shared widgets used by many pages
│       ├── NavBar.js
│       ├── SearchBox.js
│       └── Dialog.js
│
├── fixtures/
│   └── fixtures.js          # hands page objects to the tests
│
├── data/
│   ├── testData.js          # faker-based test data builders
│   └── assets/              # files for upload tests (images, pdf)
│
├── api/
│   ├── ApiClient.js         # wrapper over Playwright's APIRequestContext
│   ├── endpoints.js         # URL paths in one place
│   └── services/            # one service class per resource
│       └── <Resource>Service.js
│
├── tests/
│   ├── setup/
│   │   └── auth.setup.js    # signs in once, saves browser state
│   ├── ui/
│   │   └── *.spec.js
│   └── api/
│       └── *.api.spec.js
│
├── utils/                   # shared helpers — empty for now
│
├── auth/                    # saved session state, gitignored
└── reports/                 # html / json output, gitignored
```

---

## 2. The layers

Each layer talks only to the layer below it. Nothing skips a level.

```
tests/  ──uses──►  fixtures/  ──builds──►  pages/  ──uses──►  pages/components/
   │                                          │
   └──reads──►  data/                         └──drives──►  Playwright Page
```

| Layer | Holds | Never holds |
|---|---|---|
| `config/` | Reading and validating env vars | Test logic |
| `pages/` | Locators + actions for one screen | Assertions about business rules, test data |
| `pages/components/` | Locators + actions for one reusable widget | Anything screen-specific |
| `fixtures/` | Construction of page objects | Locators, steps |
| `data/` | Data builders | Locators, Playwright imports |
| `tests/` | Steps and assertions, read top to bottom | Raw locators, credentials, `process.env` |
| `utils/` | Cross-cutting helpers used by more than one layer | Test logic |
| `api/` | HTTP calls per resource | UI locators |

---

## 3. Rules per layer

### config/env.js
- The single place `process.env` is read. Everything else imports this module.
- The single place the `environments/` directory is located: point `dotenv` at
  `environments/.env` with an explicit path, since it is no longer at the project root
  where dotenv looks by default.
- Validate required keys at import time and list **all** missing keys in one error.
- Support `TEST_ENV=staging` → loads `environments/.env.staging`, so the same suite can
  target another deployment.
- Export a frozen object.

```js
module.exports = Object.freeze({ ...readRequired(REQUIRED), isCI });
```

### playwright.config.js
- Reads URL and credentials from `config/env.js` and passes them into tests as an option
  (e.g. `use: { user: {...} }`) — this is what keeps `process.env` out of test files.
- One project per target — a browser, or a site when the suite covers more than one.
  Where the target needs a session, pair it with a `setup` project that logs in, and give
  the main project `storageState` + `dependencies: ['<target>-setup']`.
- Reporters: `list`, `html`, `json`.
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.

### pages/
- One class per screen. Constructor takes `page` and defines **all** locators as fields.
- Public methods = actions and expectations (`open()`, `create(x)`, `expectCreated(x)`).
- Private helpers (`#uploadLogo()`) for messy internals.
- Prefer role-based locators: `getByRole`, `getByLabel`, `getByPlaceholder`. CSS only as a
  last resort.
- Wait with web-first assertions (`await expect(...).toBeVisible()`), never `sleep`.

```js
class CompaniesPage {
  constructor(page) {
    this.page = page;
    this.nav = new NavBar(page);              // component
    this.search = new SearchBox(page);        // component
    this.createButton = page.getByRole('button', { name: 'Create' });
  }

  async open() { /* navigate + wait for the list to render */ }
  async create(record) { /* fill + submit + wait for URL */ }
  async expectCreated(record) { /* assertions */ }
}
module.exports = CompaniesPage;
```

### pages/components/
- A widget that appears on more than one screen gets its own class here: nav bar, search
  box, modal, data table, toast.
- Same shape as a page object, but scoped to a root locator so it can never match outside
  itself.
- Pages compose components as fields. Components never import pages.

```js
class SearchBox {
  constructor(page, root = page) {
    this.page = page;
    this.input = root.getByPlaceholder('Search', { exact: true });
  }

  async search(query) {
    await this.input.fill(query);
  }
}
module.exports = SearchBox;
```

### fixtures/fixtures.js
- Extends `base` test with one fixture per page object, plus options set by the config.
- Adding a screen = add a page object + one fixture here. Nothing else changes.
- Re-export `test` and `expect` so tests import only from this file.

```js
const test = base.extend({
  user: [{ email: '', password: '' }, { option: true }],   // set by playwright.config.js
  loginPage:     async ({ page, user }, use) => use(new LoginPage(page, user)),
  companiesPage: async ({ page }, use) => use(new CompaniesPage(page)),
});
module.exports = { test, expect };
```

### data/testData.js
- Export builder functions: `makeCompany()`, `makeContact(companyName)`.
- Values that must match the app's dropdowns are hard-coded arrays; everything else is
  faker.
- Give each record a short random `uniqueId` suffix so runs never collide and no cleanup
  is needed.
- Upload files live in `data/assets/` and are committed, so a fresh clone behaves the same.

### tests/
- `tests/setup/<target>-auth.setup.js` logs in once and saves `auth/<target>-user.json`.
  The matching project depends on it. Prefix both by target so suites covering more than
  one site never share a session file.
- A spec reads as a list of steps. If a line contains a locator, it belongs in a page
  object.
- Use `test.step()` for readable report sections.

```js
const { test, expect } = require('../../fixtures/fixtures');

test('creates a company', async ({ companiesPage }) => {
  const company = makeCompany();
  await companiesPage.open();
  await companiesPage.create(company);
  await companiesPage.expectCreated(company);
});
```

### api/
- `ApiClient.js` wraps Playwright's `APIRequestContext` — no axios/fetch client.
- One service class per resource under `api/services/`, paths in `endpoints.js`.
- Wire it in as a fixture: `apiClient: async ({ request }, use) => use(new ApiClient(request, env.BASE_URL))`.

### utils/
- Empty for now. A helper earns a place here once it is needed by more than one layer;
  anything used by a single page object or spec stays in that file.

### global-teardown.js
- Deletes the saved `auth/*.json` state so a session never outlives its run.

---

## 4. Non-negotiable rules

1. No credentials or URLs in test files — they flow `environments/.env` → `config/env.js` →
   `playwright.config.js` → fixture → page object.
2. No locators outside `pages/` and `pages/components/`.
3. No `waitForTimeout` / `sleep`. Wait on an assertion or a URL.
4. No test depends on another test's data. Each builds its own via `data/`.
5. `auth/`, `reports/` and `environments/*` are gitignored — ignore the whole
   `environments/` directory, then un-ignore `environments/.env.example`
   (`!environments/.env.example`) so it stays committed.

---

## 5. Setup order for a new project

```bash
npm init -y
npm i -D @playwright/test @faker-js/faker dotenv
npx playwright install
```

1. `environments/.env.example` + `environments/.env` → `config/env.js`
2. `playwright.config.js` (setup project + browser projects + reporters)
3. `pages/components/` → `pages/LoginPage.js` → `tests/setup/auth.setup.js`
4. `fixtures/fixtures.js`
5. `data/testData.js`
6. First spec in `tests/ui/`
7. `global-teardown.js`, then `api/` when a real API exists

**Scripts:**

```json
{
  "test": "playwright test",
  "test:<target>": "playwright test --project=<target>",
  "test:<target>:headed": "playwright test --project=<target> --headed",
  "report:html": "playwright show-report reports/html"
}
```