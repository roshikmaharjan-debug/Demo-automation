# API layer files

This guide explains what each file in the Restful Booker API test layer does
and how those files work together. The API tests use Playwright's API request
context; they do not launch a browser.

## Request and fixture flow

```text
booking.spec.ts
    |
    v
api fixture in fixtures/fixtures.ts
    |
    v
ApiManager
    |------------------------------|
    v                              v
BookingClient                   AuthSession
    |                              |
    +----------> HttpClient <------+
                      |
                      v
                Restful Booker API
```

The test calls a method on `BookingClient`. The client builds the endpoint
path, adds an authentication cookie when needed, and delegates HTTP transport
to `HttpClient`. `AuthSession` logs in through that same `HttpClient` the first
time an authenticated request needs a token. The fixture cleans up any
remaining bookings and disposes the HTTP context when the test ends.

## Code walkthrough

This section walks through the API TypeScript files in execution order. Blank
lines are for readability; related declarations and statements are explained
together.

### `tests/api/apiConfig.ts`

- `import fs from "fs"` and `import path from "path"` load Node.js utilities
  for checking and resolving the `.env` file.
- `ApiConfig` declares that the configuration contains three strings:
  `baseUrl`, `username`, and `password`.
- `ENV_FILE` resolves the repository `.env` path relative to this module.
- `cachedConfig` starts as `null` and will hold the configuration after it is
  loaded.
- `requireEnv(name)` reads `process.env[name]`. If the value is missing or
  empty, it throws an error naming the missing variable and explaining where
  to set it; otherwise it returns the value.
- `getApiConfig()` loads the `.env` file if it exists, then reads the three
  required variables with `requireEnv()` and stores them in `cachedConfig`.
  The `if (!cachedConfig)` guard means the file and variables are processed
  only once. The function returns the cached configuration on every call.

### `tests/api/httpClient.ts`

- The import from `@playwright/test` provides Playwright's `request` factory
  and the `APIRequestContext` type. `getApiConfig` provides the API base URL.
- `HttpMethod` restricts request methods to the five methods used by this
  client: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- `RequestOptions` allows callers to supply a request body (`data`) and
  additional headers; both properties are optional.
- `HttpResponse<T>` represents a response with a numeric status and a body of
  caller-selected type `T`.
- `HttpClient` stores one Playwright request context. Its private constructor
  ensures callers use the `create()` factory.
- `create()` reads `baseUrl`, creates a request context with that base URL and
  default JSON request/response headers, then wraps it in an `HttpClient`.
- `get()`, `post()`, `put()`, `patch()`, and `delete()` each call `send()` with
  the corresponding HTTP method, path, and optional request settings.
- `dispose()` closes the Playwright request context to release its resources.
- `send<T>()` defaults missing options to an empty object, then calls
  `context.fetch()` with the method, path, optional body, and optional headers.
  It logs the method, path, and response status.
- `send()` reads the response content type. JSON responses are parsed with
  `response.json()`; other responses are parsed as text. It returns both the
  status and body. `body as T` is a TypeScript type assertion and does not
  validate the response body at runtime.

### `tests/api/authSession.ts`

- The imports provide API configuration, the HTTP client type, and the
  authentication request and response types.
- `AuthSession` manages authentication for requests that need a token.
- Static `tokenPromise` is shared by instances in the same worker. Storing the
  promise also lets concurrent callers wait for the same login request.
- The constructor stores the existing `HttpClient`; the session does not
  create another request context.
- `getToken()` calls `login()` only when there is no cached promise. It saves
  that promise so later calls reuse it. If login rejects, the `catch` clears
  the cache and rethrows the original error so a later call can retry.
- `authHeaders()` waits for the token and returns it in the API's expected
  `Cookie` header format.
- `login()` reads the username and password from configuration, constructs
  the `AuthRequest` body, and posts it to `/auth` using the shared HTTP client.
- The status-and-token condition rejects a response unless it has status `200`
  and a token. This also handles the API's behavior of returning status `200`
  with a failure reason for bad credentials.
- If login succeeds, the function returns the response token.

### `tests/api/models/booking.ts`

- `BookingDates` describes the `checkin` and `checkout` date strings.
- `Booking` describes the booking body: first and last names, numeric total
  price, deposit-paid flag, dates, and optional additional needs.
- `CreateBookingResponse` describes the create response's numeric `bookingid`
  and returned booking.
- `AuthRequest` describes the username and password sent to the login endpoint.
- `AuthResponse` describes the optional `token` and optional failure `reason`.
  The fields are optional because a failed login may return a reason rather
  than a token. These interfaces provide compile-time typing only.

### `tests/api/clients/bookingClient.ts`

- The imports provide the authentication and HTTP client types and the booking
  request/response types.
- `AuthOptions` has an optional `authenticated` flag. Setting it to `false`
  omits the token cookie; otherwise authentication is used.
- `BookingClient` keeps `createdIds`, a set of booking IDs that this client
  created and may need to remove during cleanup.
- The constructor stores the shared HTTP and authentication clients.
- `create(booking)` posts the booking body to `/booking`. On status `200` with
  a booking ID, it records the ID, then returns the full HTTP response.
- `getById(id)` gets `/booking/{id}` and returns a response typed as `Booking`.
- `update(id, booking, options)` puts the booking body to `/booking/{id}` and
  supplies headers from `headersFor()`. Its default options authenticate the
  request.
- `delete(id, options)` sends a delete request with headers from
  `headersFor()`. On status `201`, it removes the ID from `createdIds`, since
  that booking no longer needs cleanup.
- `deleteAllCreated()` iterates over a copy of the ID set and deletes each
  booking. It removes IDs for successful deletions and for `404`/`405`
  responses, which mean the booking is already absent or cannot be deleted.
  Other unexpected statuses are collected; if any occurred, the method throws
  one error listing the affected booking IDs and statuses.
- `headersFor(options)` returns an empty headers object only when
  `authenticated` is explicitly `false`. Otherwise, it requests the token
  cookie from `AuthSession`.

### `tests/api/apiManager.ts`

- The imports bring together `AuthSession`, `BookingClient`, and `HttpClient`.
- `ApiManager` composes the API clients. Its private constructor stores the
  shared HTTP client and exposes the booking client as a read-only property.
- `create()` creates one `HttpClient`, creates an `AuthSession` that uses it,
  then creates a `BookingClient` with those shared objects. It returns the
  assembled manager.
- `cleanup()` delegates deletion of tracked bookings to `BookingClient`.
- `dispose()` closes the shared HTTP request context.

### `tests/api/booking.spec.ts`

- The imports provide Playwright's `test` and `expect` functions from the
  project fixture, plus the `Booking` type.
- `buildBooking()` creates unique test data. It combines the current time and
  a random number for the first name, uses a fixed last name and date range,
  chooses a random price, marks the deposit as paid, and sets additional needs
  to breakfast.
- `test.describe()` groups the tests under the "Booking API" suite.
- In the lifecycle test, the `api` fixture provides the configured API manager.
  The test builds a booking and initializes `bookingId` before creating it.
- The create step sends the booking, checks for status `200`, verifies the
  returned ID is a number, and saves that ID for subsequent calls.
- The read step fetches that ID, checks for status `200`, and compares the
  entire returned booking with the data sent.
- `updatedBooking` copies the original booking while changing its first name
  and increasing its price by 50.
- The update step sends the modified booking, checks for status `200`, fetches
  it again, and checks both changed fields and the entire saved booking.
- The delete step deletes the ID, expects status `201`, then fetches the same
  ID and expects `404`.
- The unauthenticated-update test creates a separate booking and saves its ID.
  It builds an attempted update with a changed first name and price, then
  calls `update()` with `authenticated: false` and expects status `403`.
- That test then fetches the booking and checks that it still equals the
  original, verifying that the rejected update did not change stored data.

### `.env.example`

Lists the required local environment variable names:

- `API_BASE_URL`
- `API_USERNAME`
- `API_PASSWORD`

Copy it to `.env` and provide local values before running the API tests. The
example file is a template; it should not contain working secrets.

### `.env`

Stores local API configuration when running tests on a developer machine. It
is ignored by Git and should not be committed. CI supplies the same values via
workflow environment variables instead.

## Supporting files

### `fixtures/fixtures.ts`

Extends Playwright's shared test fixture type with `api: ApiManager`. When a
test requests `api`, the fixture creates an `ApiManager` and yields it to the
test. In `finally`, it calls `cleanup()` and then disposes the HTTP context.
The nested `finally` ensures disposal is attempted even if booking cleanup
throws.

Cleanup belongs in this fixture because it applies automatically to every test
that uses the API fixture and still runs when a test fails partway through.
The fixture does not affect tests that do not request `api`.

### `playwright.config.ts`

Defines an `api` Playwright project that discovers API specs under
`tests/api/`. API tests are excluded from the Chromium project and do not depend
on the browser authentication setup project. The existing setup and Chromium
projects continue to handle UI tests.

### `.github/workflows/playwright.yml`

The GitHub Actions workflow installs dependencies, checks formatting, and runs
the suite. For the test step it provides `API_BASE_URL` as a repository
variable and `API_USERNAME` / `API_PASSWORD` as repository secrets. Those
values must be configured in GitHub for API tests to authenticate in CI.

### `README.md`

Provides the API test entry point and setup instructions. It explains how to
copy `.env.example` to `.env`, run `npx playwright test --project=api`, and
configure the matching CI variables and secrets.

## Running the API tests

After setting up `.env`, run only the API project with:

```bash
npx playwright test --project=api
```

Run the complete UI and API suite with:

```bash
npm test
```
