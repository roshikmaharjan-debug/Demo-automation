# Playwright Demo Automation

Playwright Test + TypeScript suites for three systems, each in its own
Playwright project:

| Project     | System under test                                                        | Type       | Folder            |
| ----------- | ------------------------------------------------------------------------ | ---------- | ----------------- |
| `saucedemo` | [Sauce Demo](https://www.saucedemo.com/)                                 | Browser UI | `tests/saucedemo` |
| `api`       | [Restful Booker](https://restful-booker.herokuapp.com)                   | HTTP API   | `tests/api`       |
| `evaire`    | evaire / Eclat login on [login.qa.evaire.ai](https://login.qa.evaire.ai) | Browser UI | `tests/evaire`    |

The UI suites use page objects (POMs), a `POMManager` and custom fixtures. The
API and database code is split into small layers, one job per file (see
[docs/api-layers.md](./docs/api-layers.md) and
[docs/db-layers.md](./docs/db-layers.md)).

## Prerequisites

- Node.js 20.12 or newer (LTS recommended)
- npm

## Install

```bash
npm ci
npx playwright install chromium
```

Every project runs in Chromium, so the other browsers aren't needed.

## Credentials

Nothing private is committed. Before running the suites that need credentials:

| Suite       | What to set up                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `saucedemo` | Nothing. It uses Sauce Demo's public accounts (`standard_user` / `secret_sauce`, …).                                            |
| `api`       | Copy `.env.example` to `.env` and fill in `API_BASE_URL`, `API_USERNAME`, `API_PASSWORD`.                                       |
| `evaire`    | Copy `tests/evaire/data/userCredentials.example.json` to `userCredentials.json` in the same folder and fill in the QA accounts. |

`.env` and `tests/evaire/data/userCredentials.json` are both in `.gitignore`.
For CI, see [Continuous integration](#continuous-integration).

## Run tests

```bash
npm test                 # every project
npm run test:saucedemo   # Sauce Demo UI tests
npm run test:api         # Restful Booker API tests
npm run test:evaire      # evaire / Eclat login tests
npm run test:headed      # every project, with a visible browser
npm run report           # open the last HTML report
```

Other useful commands:

```bash
npx playwright test tests/saucedemo/specs/login.spec.ts   # one file
npx playwright test --project=evaire -g "TC-016"         # tests whose name matches
npx playwright test --ui                                  # interactive UI mode
npm run seed                                              # (re)create the SQLite test database
npm run format                                            # format with Prettier
```

`npx playwright test --list` loads `saucedemo/specs/login.spec.ts`, which reads
users from the SQLite database. On a fresh clone, run `npm run seed` once first.
A normal test run seeds the database itself.

## Project structure

```text
.
├── .github/workflows/playwright.yml   # CI: format check + all projects
├── docs/
│   ├── api-layers.md                  # API layer design
│   ├── db-layers.md                   # SQLite layer design
│   ├── evaire-login-automation.md     # evaire setup, test status, CI notes
│   └── performance-glitch-trace.png
├── scripts/
│   └── seed-db.ts                     # creates and seeds tests/data/test-data.db
├── tests/
│   ├── global-setup.ts                # seeds the database before every run
│   ├── api/                           # Restful Booker API tests
│   │   ├── clients/bookingClient.ts
│   │   ├── models/booking.ts
│   │   ├── apiConfig.ts
│   │   ├── apiManager.ts
│   │   ├── authSession.ts
│   │   ├── httpClient.ts
│   │   └── booking.spec.ts
│   ├── db/                            # SQLite layer used by the SauceDemo tests
│   │   ├── queries/userSqlScripts.ts
│   │   ├── repositories/userRepository.ts
│   │   ├── dbConfig.ts
│   │   ├── dbConnection.ts
│   │   ├── dbManager.ts
│   │   └── sqlExecutor.ts
│   ├── data/                          # test-data.db (generated, git-ignored)
│   ├── saucedemo/                     # Sauce Demo UI tests
│   │   ├── auth.setup.ts
│   │   ├── fixtures/fixtures.ts       # pomManager, loggedInPage, db and api fixtures
│   │   ├── pages/
│   │   │   ├── cart-checkout.page.ts
│   │   │   ├── inventory.page.ts
│   │   │   ├── login.page.ts
│   │   │   ├── side-menu.page.ts
│   │   │   └── POMManager.ts
│   │   └── specs/
│   │       ├── cart-checkout.spec.ts
│   │       ├── inventory.spec.ts
│   │       ├── login-audit.spec.ts
│   │       ├── login.spec.ts
│   │       ├── navigation.spec.ts
│   │       ├── performance-glitch.spec.ts
│   │       └── problem-user.spec.ts
│   └── evaire/                        # evaire / Eclat login tests
│       ├── data/
│       │   ├── testData.json
│       │   ├── userCredentials.example.json
│       │   └── userCredentials.json   # git-ignored, you create it
│       ├── fixtures/fixtures.ts
│       ├── pages/
│       │   ├── forgot-password.page.ts
│       │   ├── home.page.ts
│       │   ├── login.page.ts
│       │   ├── otp.page.ts
│       │   └── POMManager.ts
│       └── specs/
│           ├── forgot-password.spec.ts
│           ├── lockout.spec.ts
│           ├── login-form.spec.ts
│           ├── login.spec.ts
│           ├── otp.spec.ts
│           └── session.spec.ts
├── .env.example
├── playwright.config.ts
├── tests-proof.md                     # mutation tests and timing evidence
└── package.json
```

## Sauce Demo suite

Playwright runs the `saucedemo-setup` project before the `saucedemo` tests.
`tests/saucedemo/auth.setup.ts` signs in as `standard_user` once and saves the
browser storage state to `playwright/.auth/user.json`, so most tests start
already logged in.

### Page objects (`tests/saucedemo/pages`)

- `login.page.ts`: opens the login page and submits credentials.
- `inventory.page.ts`: adds products to the cart, sorts prices, opens a product and goes to the cart.
- `cart-checkout.page.ts`: starts checkout, fills in customer details and finishes the order.
- `side-menu.page.ts`: logout, the dynamic catalog spinner, and the About link.
- `POMManager.ts`: creates all of the above for one page.

### Specs (`tests/saucedemo/specs`)

- `login.spec.ts`: one test per user in the SQLite `users` table (7 users). Each user either reaches the inventory or sees the expected error.
- `inventory.spec.ts`: six items, low-to-high price sorting, opening a product and returning.
- `cart-checkout.spec.ts`: adding two products, and completing an order.
- `navigation.spec.ts`: logout, About page, and the dynamic catalog spinner.
- `problem-user.spec.ts`: checkout as `problem_user`. Expected to fail (`test.fail()`) because the last-name field overwrites the first name.
- `performance-glitch.spec.ts`: adding to the cart as the slow `performance_glitch_user`.
- `login-audit.spec.ts`: writes and reads a login audit row in the local SQLite database.

### Fixtures (`tests/saucedemo/fixtures/fixtures.ts`)

- `loggedInPage`: opens `/inventory.html` using the saved login state.
- `pomManager`: a `POMManager` built on `loggedInPage`.
- `db`: a `DbManager`. Closes the SQLite connection after the test.
- `api`: an `ApiManager`. Deletes every booking the test created, then disposes the request context.

Tests that must start logged out use
`test.use({ storageState: { cookies: [], origins: [] } })` and create only the
page objects they need from Playwright's `page`.

## Database-backed tests

The SauceDemo login and audit tests use a local SQLite file
(`tests/data/test-data.db`). `tests/global-setup.ts` creates the schema and
seeds the test users before every run; no database server is needed. See
[docs/db-layers.md](./docs/db-layers.md).

## API tests

The `api` project runs against Restful Booker with no browser. It needs `.env`
locally (see [Credentials](#credentials)). See
[docs/api-layers.md](./docs/api-layers.md).

## evaire tests

The `evaire` project covers the Eclat login test cases (TC-001 to TC-023). It
runs one test at a time because the QA account allows only one active session.
Setup, test status and known issues are in
[docs/evaire-login-automation.md](./docs/evaire-login-automation.md).

## Continuous integration

`.github/workflows/playwright.yml` runs on pushes and pull requests to `main`
or `master`. It:

1. Installs dependencies and Chromium.
2. Checks formatting with `npm run format:check`. Run `npm run format` before
   pushing so this step passes.
3. Writes `tests/evaire/data/userCredentials.json` from the
   `EVAIRE_USER_CREDENTIALS` secret. If the secret isn't set, the evaire tests
   are skipped.
4. Runs the tests, then deletes the credentials file.
5. Uploads the HTML report, and `test-results/` (traces, screenshots) when
   something failed.

Configure these under **Settings → Secrets and variables → Actions**:

| Name                      | Kind     | Value                                             |
| ------------------------- | -------- | ------------------------------------------------- |
| `API_BASE_URL`            | Variable | Restful Booker base URL                           |
| `API_USERNAME`            | Secret   | Restful Booker username                           |
| `API_PASSWORD`            | Secret   | Restful Booker password                           |
| `EVAIRE_USER_CREDENTIALS` | Secret   | The whole contents of your `userCredentials.json` |
