# How to write a new UI test here

A guide for adding a new spec to this suite so it looks like everything already in it.
Follow the shapes below and copy the comment style exactly — that style is the main thing
that keeps this suite readable.

---

## Where things go

| What you are adding | Where it goes |
| --- | --- |
| A new test | `tests/ui/<site>/<site>-<topic>.spec.js` |
| A new screen | `pages/<site>/<Name>Page.js` |
| A helper used by more than one site | `utils/` |

Site folders are `amazon` and `automationexercise` (its tests live in `tests/ui/ae/`).

---

## Writing a new spec

### The shape

```js
const { test } = require('../../../fixtures/fixtures');

/* Why this exists on top of the tests already here: say what they do not cover,
   and what this one checks instead. */

/* Any test data goes up here as a const, with a note on why it is this value
   and not another. */
const someData = {
  field: 'value',
};

test('describes what should happen, in plain words', async ({
  homePage,
  cartPage,
}) => {
  await homePage.open();

  /* A note explaining anything that would look odd or wrong to a reader. */
  const nextPage = await homePage.goToSomewhere();
  await nextPage.doTheThing();

  await nextPage.expectTheOutcome();
});
```

### The rules

**Never put a selector in a spec.** Locators live in page objects. A spec that contains
`page.locator(...)` is in the wrong shape.

**Ask for what you need by name.** Page objects arrive through the test's arguments —
`async ({ homePage, cartPage })`. Do not build them yourself.

**Let page objects do the asserting.** Prefer `await cartPage.expectLineItemCount(2)` over
reaching into the page from the spec. Only import `expect` when you are comparing values
the spec worked out for itself, such as adding up prices.

**Name the test after the behaviour, not the steps.** Write it as a sentence about what the
site should do:

- `refuses a delivery address whose pincode is the wrong length`
- `merges a repeated add into one line item with quantity 2`
- `shows the no-results state for a search that matches nothing`

Not `test address validation` or `test 3`.

**Check that a failure really failed.** When a test is about something being refused, check
both that the complaint appeared *and* that the journey did not carry on. A form can show a
warning and still let the shopper through, and that is the worse fault of the two.

**Make invalid data invalid by shape.** A pincode of `12345` can never be valid because it
is too short. A pincode that simply is not delivered to today might be delivered to next
month, and the test would quietly stop checking anything.

---

## Writing a new page object

### The shape

```js
const { expect } = require('@playwright/test');
const NextPage = require('./NextPage');

/**
 * One or two plain sentences saying what this screen is and what can be done on
 * it.
 */
class SomePage {
  constructor(page) {
    this.page = page;

    this.someButton = page.getByRole('button', { name: /continue/i });

    /* A note on any locator that is not obvious - why it is matched this way
       and not the way a reader would expect. */
    this.awkwardThing = page.locator('#some-specific-id');
  }

  async open() {
    await this.page.goto('/some-path');
  }

  /**
   * Says what this does, and anything worth knowing about how it behaves.
   */
  async doSomething() {
    await this.someButton.click();
    return new NextPage(this.page);
  }

  async expectSomething() {
    await expect(this.someButton).toBeVisible({ timeout: 30000 });
  }
}

module.exports = SomePage;
```

### The rules

**One class per screen.** It owns every locator for that screen and nothing else.

**Name methods after intent.** `addToCart()`, `proceedToCheckout()`, `emptyCart()` — not
`clickButton()` or `fillField()`.

**Hand back the next screen.** If an action takes the browser somewhere else, return that
page object: `return new CheckoutPage(this.page)`. That is what lets a test travel the same
route a shopper would.

**Only add `open()` if the screen can be reached by typing a URL.** A checkout or payment
screen cannot, so it should not have one.

**Put assertions here as `expect*()` methods.** The page knows what "went wrong" looks like
on itself, so the check belongs beside the locators it depends on.

**Prefer locators that match what a person sees** — `getByRole`, `getByLabel`. Reach for an
ID only when the visible wording is unreliable, and leave a comment saying why.

**Give live sites room.** Use `{ timeout: 30000 }` on waits that depend on a real site
responding.

---

## Wiring it up

**If the screen can be opened directly by URL**, add it to `fixtures/fixtures.js`:

```js
somePage: async ({ page }, use) => use(new SomePage(page)),
```

**If it can only be reached by going through another screen**, do not add it. Return it
from the page that leads there instead. This is deliberate: it stops tests from jumping
into the middle of a journey.

---

## How to write the comments

This is the part that matters most. The comments here explain **why**, never **what**.

### The two kinds

**`/** ... */` above a class or method** — says what it is for, in plain sentences.

**`/* ... */` inside the code** — explains a decision that would otherwise look wrong.

Plain `//` comments are rare here. Prefer a block comment that says something worth saying.

### Explain why, not what

Bad, because the code already says this:

```js
/* Click the sign-in button. */
await this.signInButton.click();
```

Good, because a reader could not have worked this out:

```js
/* Clearing has to come after signing in, since signing in brings the account's
   saved cart along with it. Doing it the other way round would leave old items
   behind and throw these counts off. */
```

### Write it for a colleague, not a compiler

Full sentences. Ordinary words. No jargon, no abbreviations. If a sentence needs a term
only a Playwright expert would know, rewrite it.

Real examples from this suite:

```js
/* Amazon shows the quantity control as either a stepper or a dropdown and
   switches between the two from visit to visit, so the control itself is not a
   dependable place to read the item count from. The subtotal line spells the
   count out in both versions. */
```

```js
/* Deliberate gibberish. A real-looking word risks Amazon stocking something
   that matches it one day, which would quietly turn this into a test that no
   longer checks the empty-results message at all. */
```

```js
/* Two wordings because the form differs by account: "Deliver to this address"
   when one is already saved, "Use this address" in the pop-up shown when the
   address book is empty. */
```

Each one tells you something you could not see from the code.

### What is worth a comment

- Anything that looks like a mistake but is not.
- Anything you only found out by running it against the real site.
- Why a value is *this* value — a made-up address, a five-digit pincode, gibberish.
- Why the order of two steps matters.
- Why a locator is matched an unusual way.
- What would go wrong if someone "tidied" the code.

### What is not

- Repeating the method name in words.
- Restating an obvious line.
- Notes to yourself, or anything that will be stale next week.

### At the top of a spec

Start with a short note saying what gap this test fills, so nobody wonders why it exists
next to the others:

```js
/* Why this exists on top of the main checkout test: that one adds a product
   only once, so it never shows what happens when the same product is added
   again. */
```

### Keep them short

Three or four lines is usually plenty. Say the surprising thing, say why, stop.

---

## Before you finish

- [ ] No selectors in the spec.
- [ ] Test name reads as a sentence about the behaviour.
- [ ] Page objects came from the test arguments, not built by hand.
- [ ] Any new screen has its own class, and returns the next screen where it should.
- [ ] Screens reachable by URL are in `fixtures.js`; the rest are not.
- [ ] An error test checks the complaint appeared *and* the journey stopped.
- [ ] Every comment says something the code does not.
- [ ] The test passes, and fails when it should — change the input and watch it go red.

That last one matters. A test that has never failed has not been shown to work.