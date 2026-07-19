# E-Commerce Checkout Test Suite

End-to-end Playwright tests covering the checkout journey on two public e-commerce sites:
**Amazon India** and **AutomationExercise**.

**Stack:** Node.js · `@playwright/test` · `dotenv` · CommonJS

---

## Quick start

**Prerequisites:** Node.js 18 or newer (developed on v24).

```bash
npm install                 # install dependencies
npx playwright install      # download the browsers Playwright drives
```

Credentials are read from a file that is never committed. Copy the template and fill it in:

```bash
cp environments/.env.example environments/.env
```

```ini
AMAZON_URL=https://www.amazon.in/
AMAZON_EMAIL=your-amazon-account@example.com
AMAZON_PASSWORD=...
AE_URL=https://automationexercise.com/
AE_EMAIL=your-ae-account@example.com
# Quote any value containing '#', or dotenv reads it as the start of a comment.
AE_PASSWORD=...
```

Both sites need a **real registered account**. Neither offers guest checkout on the paths
under test.

### Running

```bash
npm test                # everything
npm run test:amazon     # Amazon only
npm run test:ae         # AutomationExercise only
npm run test:ae:headed  # ...with a visible browser
npm run report:html     # open the last HTML report
```

Point the suite at a different set of accounts by naming an environment:
`TEST_ENV=staging npm test` reads `environments/.env.staging`.

Nothing else needs setting up. The `auth/`, `reports/` and `test-results/` folders are
generated on the first run and are deliberately kept out of the repository.

---

## Coverage

| Requirement | Test | What it proves |
| --- | --- | --- |
| **Happy path** | `ae-checkout.spec.js` | Two products through cart, checkout and card payment to an order confirmation |
| **Happy path** | `amazon-checkout.spec.js` | Sign in, add a product, enter an address, choose cash on delivery, reach Place Order |
| **Error** | `amazon-checkout-errors.spec.js` | A malformed pincode is refused and checkout does not advance |
| **Error** | `amazon-signin-errors.spec.js` | A wrong password is refused and the browser stays on the sign-in screen |
| **Error** | `ae-login-errors.spec.js` | A wrong password is refused |
| **Error** | `amazon-search-errors.spec.js` | A search matching nothing shows the no-results state |
| **Edge case** | `amazon-cart-totals.spec.js` | The subtotal equals every line's price times its quantity, added up |
| **Edge case** | `amazon-duplicate-item.spec.js` | Adding the same product twice raises the quantity instead of listing it twice |

The brief asks for one happy path, two error scenarios and one edge case. This suite has
two, four and two.

---

## Architecture

```
├── playwright.config.js       # the only place Playwright is configured
│
├── config/
│   └── env.js                 # the only place process.env is read
│
├── environments/
│   ├── .env                   # real credentials, gitignored
│   └── .env.example           # same keys, empty, committed
│
├── pages/                     # one class per screen; all locators live here
│   ├── amazon/
│   │   ├── HomePage.js            search and sign-in entry point
│   │   ├── SignInPage.js          email + password, and the refusal check
│   │   ├── SearchResultsPage.js   picks a result that can actually be bought
│   │   ├── ProductPage.js         price, add to cart
│   │   ├── CartPage.js            line items, subtotal, emptying
│   │   ├── CheckoutPage.js        address, payment and review sections
│   │   └── AddressPage.js         the new-address form and its validation
│   └── automationexercise/
│       ├── LoginPage.js
│       ├── ProductsPage.js
│       ├── CartPage.js
│       ├── CheckoutPage.js
│       └── PaymentPage.js
│
├── api/                       # scaffolding only; the suite is UI-only today
│   ├── ApiClient.js               one way of making every API call
│   ├── endpoints.js               API paths, in one place
│   └── services/
│       └── BaseService.js         what a per-subject service is built on
│
├── fixtures/
│   └── fixtures.js            # hands ready-made page objects to each test
│
├── tests/
│   ├── setup/
│   │   └── ae-auth.setup.js   # signs in once, saves the session to auth/
│   ├── ui/
│   │   ├── amazon/*.spec.js
│   │   └── ae/*.spec.js
│   └── api/
│       └── sample.api.spec.js     a template to copy; nothing runs yet
│
├── rules/
│   └── ui-testcase-writer.md  # how to write a new test so it matches the rest
│
├── utils/
│   └── amount.js              # turns "₹1,200.00" into 1200
│
│                           # all three below are generated, and gitignored
├── auth/                      # saved sign-in session
├── reports/                   # html and json output
└── test-results/              # screenshots, video and traces from failures
```

None of the three generated folders are in the repository, and none need creating by
hand — the first run makes them. `auth/ae-user.json` in particular is written by the
`ae-setup` project, which is a declared dependency of the `ae` project and so always runs
first.

### The layers

**Tests** describe a journey and assert outcomes. They never contain a selector.

**Fixtures** build page objects and hand them to whichever test names them in its
arguments. Each test gets its own, so nothing leaks between tests.

**Page objects** own every locator and expose actions named after intent — `addToCart()`,
`proceedToCheckout()` — rather than clicks and types.

**Config and utils** support both sites.

**The `api/` layer is scaffolding, not working code.** This suite tests through the browser
only. The folders and the empty classes are there so an API test has an obvious home when
one is wanted, and so that home matches the shape of everything else: a client that makes
the calls, paths kept in one file, and a service per subject that names them after what
they do. Wiring `ApiClient` into `fixtures/fixtures.js` is the step that switches it on.

**`rules/`** holds the writing guide — the patterns and comment style to follow when adding
a test, so the suite stays consistent.

### The rules that shape it

**Navigation methods return the next page object.** `homePage.goToSignIn()` returns a
`SignInPage`; `cartPage.proceedToCheckout()` returns a `CheckoutPage`. A test cannot jump
into the middle of the journey, because the only way to hold a page object is to have
travelled there.

**Only directly-openable pages are fixtures.** `fixtures.js` offers the home, search
results, cart, login and products pages — the ones a shopper can reach by typing a URL.
The product, checkout, address and payment pages are deliberately absent: they are handed
over by the page that leads to them, which keeps tests on the route a real shopper takes.

**Assertions live in page objects.** A page knows what "went wrong" looks like on itself,
so checks such as `expectSignInRejected()` and `expectPincodeRejected()` sit beside the
locators they depend on. Tests read as a sequence of steps.

**`config/env.js` is the only place `process.env` is read.** It gathers every missing
setting before complaining, so one run tells you the full list rather than making you fix
them one at a time. A missing password otherwise surfaces much later as a puzzling
sign-in failure.

---

## Design decisions

**Two sites, on purpose.** Amazon cannot be made to complete a purchase without spending
real money, so the Amazon happy path stops once Place Order is on screen and never clicks
it. AutomationExercise is a practice site where no money changes hands, so it carries the
one journey that genuinely finishes — card payment through to an order confirmation.
Between them the suite covers both a complete purchase and the messiness of a real
commercial site.

**One worker.** Both sites are driven through a single shared account. Two tests filling
and clearing the same cart at once would spoil each other's counts, so tests run one at a
time.

**Sign-in is handled differently per site.** AutomationExercise signs in once in a setup
project and saves the session to `auth/`, so its tests start already signed in. Amazon
signs in within each test instead: its cart is tied to the account and every Amazon test
needs to control the cart from a known state anyway.

**The cart is emptied at the start of each test, after signing in.** Signing in merges the
account's saved cart back in, so clearing first would look tidy and achieve nothing.

**Nothing live is hardcoded.** Prices change whenever the retailer likes, so tests read
the price from the page and check it carries through unchanged rather than asserting a
figure. Money is compared with `toBeCloseTo` because adding fractions can leave a
remainder — `10.1 + 20.2` is `30.299999999999997`.

**Locators are role-based wherever possible**, matching what a user sees. Two places
needed something sturdier, and both are commented in the code:

- *The pincode error.* Amazon builds every possible error message into the page up front
  and keeps them hidden until needed. Matching the wording finds several copies and the
  first is a hidden one, so the assertion is anchored to the pincode field's own alert box.
- *The address form's submit button.* It reads "Deliver to this address" when the account
  already has an address saved, and "Use this address" in the pop-up shown when the address
  book is empty. Matching only the first wording made checkout fail on a new account.

**Error tests check two things, not one.** A form can show a complaint and still let the
shopper through, which is the worse fault. So each error test asserts both that the message
appeared *and* that the journey did not advance — still on the sign-in screen, still on the
address step.

**Test data that must be invalid is invalid by shape, not by chance.** The rejected pincode
is five digits where an Indian pincode has six. A well-formed pincode that merely isn't
served today might be served next month, which would quietly stop the test checking
anything. The unmatchable search term is gibberish for the same reason.

---

## Assumptions

- Valid accounts exist on both sites, supplied through `environments/.env`.
- Runs change account state: the cart is emptied at the start of each test, and addresses
  entered during checkout are saved to the Amazon address book, so they accumulate and are
  worth tidying up occasionally.
- Amazon is used in its Indian locale (`en-IN`), with prices in rupees.
- AutomationExercise accepts any card details of roughly the right shape; the suite uses a
  made-up test card.
- No real order is ever placed on Amazon. The Place Order button is asserted to be
  reachable and is never clicked.

---

## Reports and debugging

A run writes an HTML report to `reports/html` and JSON to `reports/results.json`.

On failure Playwright keeps a screenshot and a video, and a trace is recorded on the first
retry. Open the trace for a step-by-step replay with the DOM at each point:

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```