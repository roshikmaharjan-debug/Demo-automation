# API layers

This document describes the API test layer for
[Restful Booker](https://restful-booker.herokuapp.com). It has the same shape as
the database layer in [db-layers.md](./db-layers.md): small files, one job each,
and a manager that hands everything to a fixture.

| DB layer (Task 4)                    | API layer (Task 5)                   |
| ------------------------------------ | ------------------------------------ |
| `dbConfig.ts`                        | `apiConfig.ts`                       |
| `dbConnection.ts` + `sqlExecutor.ts` | `httpClient.ts`                      |
| `userRepository.ts`                  | `clients/bookingClient.ts`           |
| `DbManager`                          | `ApiManager`                         |
| `db` fixture                         | `api` fixture                        |
| —                                    | `authSession.ts` (login, keep token) |

## Layer diagram

```text
tests/api/booking.spec.ts          uses the api fixture, no URLs here
        |
        v
api fixture in fixtures/fixtures.ts   gives each test an ApiManager,
        |                             deletes leftover bookings on teardown
        v
ApiManager  ----------- builds ----------+
        |                                 |
        v                                 v
BookingClient  <------- token -------  AuthSession
        |                                 |   (POST /auth once per worker)
        |                                 v
        |                             apiConfig  <----  .env
        v
HttpClient  -----> https://restful-booker.herokuapp.com
```

Tests only talk to the fixture. Only `httpClient.ts` knows how to send a
request. Only `authSession.ts` knows how to log in.

## Files

| File                                 | Job                                                                                                                                                                                         | Must not                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.env`                               | Hold `API_BASE_URL`, `API_USERNAME` and `API_PASSWORD` for local runs.                                                                                                                      | Be committed. It is in `.gitignore`; `.env.example` shows the variable names.                                                |
| `tests/api/apiConfig.ts`             | Load `.env` (if present) and return the base URL, username and password. Throw a clear error if any is missing.                                                                             | Hard-code a URL or credential, send requests, or read the environment at import time.                                        |
| `tests/api/httpClient.ts`            | The only place that sends requests. Create one Playwright `APIRequestContext` with the base URL and JSON headers, send a method + path, return `{ status, body }`, and dispose the context. | Know about bookings, tokens or login. Decide whether a status is "good" or throw on 4xx/5xx — callers and tests decide that. |
| `tests/api/authSession.ts`           | Call `POST /auth` through the `HttpClient` the first time a token is needed, keep the token for the rest of the worker, and build the `Cookie: token=...` header.                           | Log in before every request, create its own `HttpClient`, or log the password or token.                                      |
| `tests/api/models/booking.ts`        | TypeScript types for a booking request, the create response and the auth response.                                                                                                          | Contain logic, default values or test data.                                                                                  |
| `tests/api/clients/bookingClient.ts` | `create`, `getById`, `update`, `delete` for `/booking`. Receives its `HttpClient` and `AuthSession` in the constructor. Remembers which bookings it created so leftovers can be deleted.    | Build an `HttpClient`, call `fetch`/`request` directly, contain assertions, or hide a non-success status from the caller.    |
| `tests/api/apiManager.ts`            | Build ONE `HttpClient` and ONE `AuthSession`, pass them to every client, and expose `cleanup()` / `dispose()` for the fixture. Same idea as `DbManager`.                                    | Send requests itself or build a second `HttpClient`.                                                                         |
| `fixtures/fixtures.ts`               | Add an `api` fixture that gives each test an `ApiManager`, and on teardown deletes every booking the test created, even if the test failed, then disposes the request context.              | Make API calls of its own beyond cleanup, or swallow a cleanup failure.                                                      |
| `tests/api/booking.spec.ts`          | Booking lifecycle test and update-without-token test. Every assertion can fail if the server ignores the request.                                                                           | Contain URLs, credentials, raw requests, or rely on a booking it did not create in the same test.                            |
| `playwright.config.ts`               | Run `tests/api/**` in an `api` project with no browser and no `setup` dependency; keep them out of the `chromium` project.                                                                  | Hold API URLs or credentials.                                                                                                |

## Which calls need the token

From the Restful Booker API docs:

| Call                  | Purpose          | Token?                                        | Success status |
| --------------------- | ---------------- | --------------------------------------------- | -------------- |
| `POST /auth`          | Create token     | No (sends username / password)                | `200`          |
| `GET /booking`        | List booking ids | No                                            | `200`          |
| `GET /booking/:id`    | Get one booking  | No                                            | `200`          |
| `POST /booking`       | Create booking   | No                                            | `200`          |
| `PUT /booking/:id`    | Replace booking  | Yes — `Cookie: token=<token>` (or Basic auth) | `200`          |
| `PATCH /booking/:id`  | Partial update   | Yes — `Cookie: token=<token>` (or Basic auth) | `200`          |
| `DELETE /booking/:id` | Delete booking   | Yes — `Cookie: token=<token>` (or Basic auth) | `201`          |

Notes:

- `POST /auth` returns `200` even for bad credentials, with
  `{ "reason": "Bad credentials" }`. `AuthSession` therefore checks that a
  `token` is present, not just the status.
- A `PUT` without a token returns `403 Forbidden`.
- A `GET` for a deleted booking returns `404 Not Found`.
- A `DELETE` for a booking that no longer exists returns `405`. Cleanup treats
  `404` and `405` as "already gone".
- Restful Booker is a public demo and its data is reset periodically, so every
  test creates its own booking and never relies on an existing one.

## Login once per worker

`AuthSession` keeps the token in a static field. Playwright runs each worker in
its own process, so a static field lives exactly as long as the worker. The
first `update`/`delete` in a worker calls `POST /auth`; every later call in the
same worker reuses the token. Each test still gets its own `ApiManager` and
`HttpClient` — only the token string is shared.

## Cleanup

The `api` fixture deletes every booking the test created, in a `finally` block
after `use()`, so it runs even when an assertion fails halfway. `BookingClient`
records the id on each successful `create` and forgets it on each successful
`delete`, so the lifecycle test (which deletes its own booking) leaves nothing
for teardown, and the 403 test's booking is deleted by teardown.

## Configuration

Copy `.env.example` to `.env` for local runs and fill in `API_BASE_URL`,
`API_USERNAME` and `API_PASSWORD`. No URL, username or password appears
anywhere else in the code.

Real environment variables take precedence over `.env`. In CI, set the
repository variable `API_BASE_URL` and the secrets `API_USERNAME` and
`API_PASSWORD`; the workflow passes them to the test step as environment
variables.

`apiConfig` is read lazily (on the first API call), not when the file is
imported. UI tests import `fixtures/fixtures.ts` too, and they must not fail
just because the API variables are missing.

## Running

```bash
npx playwright test tests/api/booking.spec.ts --reporter=line
npx playwright test --project=api
```
