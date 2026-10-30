# Database layers

This document describes the database design and answers the design questions
from the database-testing task. The database is local test infrastructure: it
provides login test data and a place for the audit test to prove a write and
read. Sauce Demo itself does not connect to this local SQLite database.

## Design questions

### Why keep SQL in its own files instead of inside a repository method?

Keeping statements in `tests/db/queries/userSqlScripts.ts` separates SQL syntax
from repository behavior. Reviewers can find and inspect all statements
together, and a query change does not get mixed into control flow or tests.
Named query constants also let repository methods reuse the same statement.
Values still belong in bound parameters (`?`), not concatenated SQL strings.

### Why share a database connection instead of opening one for every query?

Opening a SQLite file creates a file handle. Reusing the lazily opened
connection avoids doing that work for every query and ensures operations in
one test use the same connection. The connection explicitly uses SQLite's default rollback-journal
mode, including for existing database files. Playwright workers run in
separate processes, so each worker has its own in-process connection; the
connection is closed when the test-scoped `db` fixture tears down. The suite's
brief local reads and writes do not need a separate journaling mode.

### Why call `userRepository.findByUsername(name)` instead of running SQL in a

test?

The named method gives tests a small, meaningful API and keeps table and column
details inside the repository/query layers. If the SQL or schema changes, the
repository can be updated without rewriting every test. It also provides a
typed `UserRow` result, and the query uses a bound username parameter. Tests can
focus on behavior rather than SQL construction.

### Why create the connection on the first query rather than when config is

imported?

Importing configuration should only determine the database path; it should not
open files or mutate state. A lazy connection avoids file creation and locks
for tests that do not use the database, uses the `DB_PATH` value when the
database is actually needed, and makes initialization or file-permission errors
happen at the operation that requires the database rather than as an unrelated
module-import side effect.

### Open design question

Should the `db` fixture remain test-scoped, closing the SQLite connection after
each test for simpler isolation and recovery, or become worker-scoped to reuse
the same connection across tests and reduce repeated open/close work? The
current fixture is test-scoped. Changing its scope would require checking that
test cleanup keeps shared data isolated and that closing the connection at
worker teardown is reliable when a test fails.

## Layer diagram

```text
tests/login-audit.spec.ts
        |
        v
db fixture in tests/fixtures/fixtures.ts
        |
        v
DbManager
        |
        v
UserRepository
        |
        +----------> USER_QUERIES
        |            SQL statements
        v
SqlExecutor
        |
        v
DbConnection -----> dbConfig -----> SQLite file
                                      tests/data/test-data.db
```

Each layer has one job:

| File                                      | Job                                                                                              | Must not                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `tests/db/dbConfig.ts`                    | Resolve the configured SQLite file path from `DB_PATH`, defaulting to `tests/data/test-data.db`. | Open a database connection.                                        |
| `tests/db/dbConnection.ts`                | Lazily open/cache the SQLite connection in rollback-journal mode and close it.                   | Contain SQL queries.                                               |
| `tests/db/sqlExecutor.ts`                 | Execute prepared read and write statements with bound parameters.                                | Know table-specific repository methods or business rules.          |
| `tests/db/queries/userSqlScripts.ts`      | Export named SQL statements.                                                                     | Contain functions or interpolate user values into SQL strings.     |
| `tests/db/repositories/userRepository.ts` | Expose named, typed methods for user and login-result data using its injected executor.          | Build inline SQL strings or manage the connection lifecycle.       |
| `tests/db/dbManager.ts`                   | Construct one executor, inject it into repositories, and expose them to the fixture.             | Run SQL or seed records.                                           |
| `tests/fixtures/fixtures.ts`              | Provide a `DbManager` to tests and close the connection during teardown.                         | Hide database errors or perform test-specific queries.             |
| `scripts/seed-db.ts`                      | Create the schema and idempotently upsert sample users.                                          | Be imported or run by individual tests.                            |
| `tests/global-setup.ts`                   | Seed the database before Playwright starts its projects.                                         | Contain schema or query definitions.                               |
| `tests/login-audit.spec.ts`               | Verify a browser login and an explicit database audit write/read.                                | Contain raw SQL or assume Sauce Demo writes to the local database. |

## Database path and initialization

The default path is `tests/data/test-data.db`. Set `DB_PATH` to use another
file; relative values are resolved to absolute paths. For example, in
PowerShell:

```powershell
$env:DB_PATH = "C:\temp\playwright-test-data.db"
npm test
```

Playwright runs `tests/global-setup.ts`, which calls `seedDatabase()` before the
test projects. The seed script creates the parent directory if necessary,
creates both tables if they do not exist, and upserts the seven sample users in
a transaction. It closes its own connection even if initialization fails.
Rerunning setup updates users with the same usernames rather than duplicating
them. The audit table is not reset by seeding; the audit test clears its rows
before and after its run.

The default database path is ignored by Git because test runs modify its
contents. Global setup creates and seeds the schema for both local runs and
CI.

## Schema and sample data

### `users`

| Column             | Type   | Constraints | Meaning                                                    |
| ------------------ | ------ | ----------- | ---------------------------------------------------------- |
| `username`         | `TEXT` | Primary key | Unique test account name.                                  |
| `password`         | `TEXT` | Not null    | Password the login test enters.                            |
| `expected_type`    | `TEXT` | Not null    | Expected outcome category: `inventory` or `error`.         |
| `expected_message` | `TEXT` | Nullable    | Expected error message when the account should fail login. |

The seed includes the six public Sauce Demo example accounts (`standard_user`,
`locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, and
`visual_user`) and a `wrong_password_user` row for an invalid-password case.
These are public demo credentials, not private or production credentials.

### `login_results`

| Column     | Type      | Constraints                 | Meaning                                 |
| ---------- | --------- | --------------------------- | --------------------------------------- |
| `id`       | `INTEGER` | Primary key, auto-increment | Audit record identifier.                |
| `username` | `TEXT`    | Not null                    | Username used by the test.              |
| `outcome`  | `TEXT`    | Not null                    | Recorded outcome, such as `SUCCESS`.    |
| `ran_at`   | `TEXT`    | Not null                    | ISO-8601 timestamp for the test record. |

The audit table has no foreign-key constraint in the current exercise. It
records a test result without asserting account lifecycle rules.

## How the audit test uses the layers

1. The test-scoped `db` fixture constructs `DbManager`; the manager exposes
   `UserRepository`.
2. `findByUsername("standard_user")` executes the named, parameterized query
   through `SqlExecutor`. If the seed row is missing, the test fails with an
   explicit error.
3. The test enters the retrieved credentials into Sauce Demo and asserts the
   inventory page appears.
4. The test creates a timestamp, inserts a `SUCCESS` row through the repository,
   and queries it back by username. It verifies there is exactly one result,
   the outcome is `SUCCESS`, and the timestamp is less than one minute old.
5. It queries a nonexistent username and verifies the result is empty.
6. `beforeEach` and `afterEach` clear `login_results`, including after a
   failing assertion; fixture teardown closes the connection.

The insert is performed explicitly by the test. It proves that SQLite can
persist and return an audit row, but it does not demonstrate that the external
Sauce Demo website writes to this local file.

## Running and checking

```bash
npm test
npm run format:check
```

To inspect database records, open `tests/data/test-data.db` with a SQLite
viewer. The schema contains `users` and `login_results`; after the audit test,
`login_results` should be empty because cleanup runs after the test.

Common causes of failure:

- **A database directory does not exist:** use the configured global setup and
  check that the parent of `DB_PATH` is writable.
- **A table does not exist:** verify global setup succeeded and setup and tests
  use the same `DB_PATH`.
- **The seeded user is missing:** verify the seed completed and that the test
  reads the same database file the setup seeded.
- **A database is locked:** close unrelated processes using or writing to the
  same file, then rerun the test.
