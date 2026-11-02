# Eclat login automation (login.qa.evaire.ai)

Automates the 22 cases in **Eclat_Login_Test_Cases_v3**. Each test title starts with its TC id.

## Setup

```bash
npm install
```

Copy the evaire block from `.env.example` into `.env` and fill in:

| Variable                              | Notes                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `EVAIRE_USERNAME` / `EVAIRE_PASSWORD` | Defaults to `Manager` in `tests/data/userCredentials.json`                  |
| `EVAIRE_EMAIL`                        | The account's email. TC-011 is skipped without it                           |
| `OTP_CODE`                            | Fixed QA OTP, default `000000`                                              |
| `OTP_WRONG_CODE`                      | Code TC-016 submits as the wrong OTP, default `111111`                      |
| `RUN_DESTRUCTIVE=1`                   | Enables TC-013 and TC-022                                                   |
| `LOCKOUT_*`                           | TC-013 only runs when the lockout policy (threshold, duration) is filled in |

## Run

```bash
npm run test:evaire                              # all evaire cases
npx playwright test --project=evaire -g "TC-016" # one case
npx playwright test --project=evaire --headed    # watch it
npx playwright show-report
```

## Layout

| File                                         | Contents                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tests/evaire/specs/login.spec.ts`           | TC-001, 002, 003, 005, 011, 014, 015, 021: valid/invalid credentials, username vs email, double-click        |
| `tests/evaire/specs/login-form.spec.ts`      | TC-004, 006, 008, 009: required fields, password masking, direct access, keyboard                            |
| `tests/evaire/specs/forgot-password.spec.ts` | TC-007, 010                                                                                                  |
| `tests/evaire/specs/otp.spec.ts`             | TC-016 to 019: wrong/short code, timer and resend, back, paste                                               |
| `tests/evaire/specs/session.spec.ts`         | TC-012, 020, 022: logout, redirect when logged in, session replacement (TC-022 opt-in)                       |
| `tests/evaire/specs/lockout.spec.ts`         | TC-013 (opt-in)                                                                                              |
| `tests/evaire/pages/*.page.ts`               | Page objects: login, OTP, forgot password, home                                                              |
| `tests/evaire/fixtures/evaire.fixtures.ts`   | `app` fixture with `loginToOtp()`, `fullLogin()`, `isAuthenticated()`. Logs the account out after every test |
| `tests/evaire/config/evaireConfig.ts`        | Env, test data and the exact UI strings                                                                      |
| `tests/evaire/data/userCredentials.json`     | QA accounts (fallback when `EVAIRE_USERNAME`/`EVAIRE_PASSWORD` aren't set)                                   |

The `evaire` project runs with one worker because every test shares one account and the app allows one active session per account.

## OTP

QA accepts the fixed code `000000` for every account, so tests type that instead of reading an email. Because old and new codes are identical, two checks from the sheet can't be automated:

- TC-014 checks only that one `/auth/login` request is sent. It doesn't check that only one email arrives.
- TC-017 doesn't check that the old code is rejected after Resend.

## Things to know

- **One active session per account.** If the account is already logged in somewhere (including your own browser), login shows "Active session detected". `loginToOtp()` clicks **Continue & End Other Session** automatically, so running the suite logs you out elsewhere. After each OTP test, the session is logged out through the API.
- TC-002 and TC-011 submit wrong passwords for the main account. If a lockout policy exists, point `EVAIRE_*` at an account that can take a few failures.
- TC-017 waits for the full 60-second timer, so it takes about 1.5 minutes.
