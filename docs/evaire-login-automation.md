# Eclat login automation (login.qa.evaire.ai)

Automates the 22 cases in **Eclat_Login_Test_Cases_v3**. Every test name starts with its TC id.
The folder follows the same structure as the SauceDemo tests.

## Run

```bash
npm run test:evaire                              # all evaire tests
npx playwright test --project=evaire -g "TC-016" # one test
npx playwright test --project=evaire --headed    # watch the browser
npx playwright show-report
```

## Folder

| File                            | What it is                                                     |
| ------------------------------- | -------------------------------------------------------------- |
| `data/userCredentials.json`     | QA accounts. Tests log in as `Manager`                         |
| `data/testData.json`            | OTP (`000000`), wrong OTP, wrong password and other test data  |
| `pages/*.page.ts`               | Page objects: login, OTP, forgot password, home                |
| `pages/POMManager.ts`           | Creates all page objects for a test                            |
| `fixtures/fixtures.ts`          | `pomManager` fixture: opens `/login`, logs out after each test |
| `specs/login.spec.ts`           | TC-001, 002, 003, 005, 011, 014, 015, 021                      |
| `specs/login-form.spec.ts`      | TC-004, 006, 008, 009                                          |
| `specs/forgot-password.spec.ts` | TC-007, 010                                                    |
| `specs/otp.spec.ts`             | TC-016, 017, 018, 019                                          |
| `specs/session.spec.ts`         | TC-012, 020, 022                                               |
| `specs/lockout.spec.ts`         | TC-013                                                         |

## Things to know

- **QA uses the fixed OTP `000000`**, so TC-014 can't check the number of OTP emails and TC-017 can't check that the old code is rejected after Resend.
- **One session per account.** Logging in when the account is already logged in shows "Active session detected". `loginAndEndOtherSession()` clicks **Continue & End Other Session**, so running the tests logs you out in other browsers. The `evaire` project runs one test at a time for the same reason.
- **TC-013 and TC-022 are skipped.** Each has a `test.skip(true, ...)` line; remove it to run the test. For TC-013, first fill in the lockout numbers at the top of `lockout.spec.ts`.
- TC-017 waits for the full 1-minute timer.
