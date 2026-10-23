# Shared authentication timing

- Before shared authentication: 14.43 seconds wall-clock for the full suite (15 tests; Playwright reported 13.1 seconds).
- After shared authentication: 16.03 seconds wall-clock for the first full-suite run (16 tests, including setup; Playwright reported 14.6 seconds).

The first after run was 1.60 seconds slower overall. A second after run took 20.45 seconds wall-clock (18.5 seconds reported by Playwright), so timings varied between runs; both after runs passed all tests.
