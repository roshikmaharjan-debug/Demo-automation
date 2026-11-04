# Eclat login automation (login.qa.evaire.ai)

Automates the cases in **Eclat_Login_Test_Cases_v3**: TC-001 to TC-023, except
TC-019, which has no automated test yet. Every test name starts with its TC id.
The folder follows the same structure as the SauceDemo tests.

## Setup

The QA accounts are not in git. Before the first run:

1. Copy `tests/evaire/data/userCredentials.example.json` to
   `tests/evaire/data/userCredentials.json`.
2. Fill in the `Username`, `Email` and `Password` for each account.

`userCredentials.json` is listed in `.gitignore`. Never commit it.

## Run

```bash
npm run test:evaire                              # all evaire tests
npx playwright test --project=evaire -g "TC-016" # one test
npx playwright test --project=evaire --headed    # watch the browser
npm run report                                   # open the HTML report
```

Set `EVAIRE_BASE_URL` to run the UI against another environment (the default
is `https://login.qa.evaire.ai`). The `/auth/me` and `/auth/logout` calls in
`pages/home.page.ts` always go to the QA API, `https://api.login.qa.evaire.ai`.

## Folder

| File                                | What it is                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `data/userCredentials.json`         | QA accounts (git-ignored). Tests log in as `Coder`; TC-013 uses `QAL2`                      |
| `data/userCredentials.example.json` | Empty template with the same keys, committed to git                                         |
| `data/testData.json`                | OTP (`000000`), wrong OTP, wrong password, unregistered email and malformed usernames       |
| `pages/*.page.ts`                   | Page objects: login, OTP, forgot password, home                                             |
| `pages/POMManager.ts`               | Creates all page objects for a test                                                         |
| `fixtures/fixtures.ts`              | `pomManager` fixture: opens `/login` before each test and logs out through the API after it |
| `specs/login.spec.ts`               | TC-001, 002, 003, 005, 011, 014, 015, 021                                                   |
| `specs/login-form.spec.ts`          | TC-004, 006, 008, 009                                                                       |
| `specs/forgot-password.spec.ts`     | TC-007, 010, 023                                                                            |
| `specs/otp.spec.ts`                 | TC-016, 017, 018                                                                            |
| `specs/session.spec.ts`             | TC-012, 020, 022                                                                            |
| `specs/lockout.spec.ts`             | TC-013                                                                                      |

## Test status

| Status                | Tests  | Why                                                                                              |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| Skipped (`test.skip`) | TC-013 | Lockout policy not confirmed. Set `FAILED_ATTEMPTS_BEFORE_LOCKOUT` and the message, then un-skip |
| Skipped (`test.skip`) | TC-017 | Waits for the full 1-minute OTP timer. Change `test.skip` to `test` to run it                    |
| Expected to fail      | TC-021 | Known bug: Login stays enabled after a failed login when the password has trailing spaces        |
| One test per input    | TC-005 | Runs once for each value in `malformedUsernames`, so the report shows which input failed         |
| Not automated         | TC-019 | No test yet                                                                                      |

`test.fail()` makes Playwright report TC-021 as passed while the bug exists. If
the bug is fixed, the test "unexpectedly passes" and the run fails, which is the
signal to remove `test.fail()`.

## Things to know

- **QA uses the fixed OTP `000000`**, so TC-014 can't check the number of OTP
  emails and TC-017 can't check that the old code is rejected after Resend.
- **One session per account.** Logging in when the account is already logged in
  shows "Active session detected". `loginAndEndOtherSession()` clicks
  **Continue & End Other Session**, so running these tests logs the `Coder`
  account out of every other browser. The `evaire` project runs one test at a
  time for the same reason. TC-022 deliberately logs in from a second browser.
- **TC-023 sends a real password-reset email** to the `Coder` account on every run.
- The fixture logs out through the API (`POST /auth/logout`) after every test,
  so the next test starts logged out even if the previous one failed.

## CI (GitHub Actions)

Because `userCredentials.json` is git-ignored, the workflow rebuilds it from a
repository secret:

1. In GitHub, open **Settings → Secrets and variables → Actions → New
   repository secret**.
2. Name it `EVAIRE_USER_CREDENTIALS` and paste the **whole contents** of your
   local `userCredentials.json` as the value.

The workflow writes the secret to `tests/evaire/data/userCredentials.json`
before the tests and deletes it afterwards. If the secret is missing (for
example on a pull request from a fork), the workflow logs a warning and runs
only the `saucedemo` and `api` projects.

The GitHub runner must be able to reach `login.qa.evaire.ai`. If the QA site
only accepts traffic from the office network or VPN, the evaire tests will
time out in CI. In that case run them locally, or on a self-hosted runner
inside that network.
