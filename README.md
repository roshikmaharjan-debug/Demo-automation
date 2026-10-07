# Playwright Demo Automation

End-to-end browser tests for the [Sauce Demo](https://www.saucedemo.com/) application, written with Playwright Test and TypeScript.

## Prerequisites

- Node.js (LTS recommended)
- npm

## Setup

Install the project dependencies:

```bash
npm ci
```

Install the Playwright Chromium browser:

```bash
npx playwright install chromium
```

## Run the tests

Run the full test suite:

```bash
npm test
```

Run tests with the Playwright UI:

```bash
npx playwright test --ui
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

The configured base URL is `https://www.saucedemo.com/`; tests navigate to it using relative paths.

## Test coverage

The suite covers:

- Successful login
- Login failure for an incorrect password
- Locked-out user error
- Adding items to the cart
- Inventory count and price sorting
- Checkout and order confirmation

The tests use Sauce Demo's public test account (`standard_user` / `secret_sauce`).

## Test report

After a test run, open the generated HTML report with:

```bash
npx playwright show-report
```

GitHub Actions runs the Playwright tests on pushes and pull requests targeting `main` or `master`.
