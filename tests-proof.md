# UI test mutation proof

Each of the 10 UI tests was run with the listed behavior broken and then rerun successfully after the behavior was restored. The two initially weak assertions were also rerun with their original mutations after being corrected; those runs failed as expected.

| Test                                                | What I broke                                             | Did it fail?                                                          |
| --------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| logs in successfully                                | Used `wrong_password` instead of `secret_sauce`.         | Yes; passed after restoring the valid password.                       |
| shows an error for an incorrect password            | Used the valid password `secret_sauce`.                  | Yes; passed after restoring the incorrect password.                   |
| shows an error for a locked-out user                | Used `standard_user` instead of `locked_out_user`.       | Yes; passed after restoring the locked-out user.                      |
| displays six items sorted by price from low to high | Selected high-to-low sorting instead of low-to-high.     | Yes; passed after restoring low-to-high sorting.                      |
| opens an item and returns to the inventory          | Opened the Bike Light instead of the requested Backpack. | Initially no; yes after asserting the exact detail-page product name. |
| adds two items to the cart                          | Expected a badge count of `3` instead of `2`.            | Yes; passed after restoring the expected count.                       |
| completes an order and shows confirmation           | Skipped the Finish button click.                         | Yes; passed after restoring the click.                                |
| logs out                                            | Skipped the Logout button click.                         | Initially no; yes after asserting the logged-out username field.      |
| opens the About page                                | Skipped the About link click.                            | Yes; passed after restoring the click.                                |
| opens the dynamic catalog spinner                   | Skipped the Spinner button click.                        | Yes; passed after restoring the click.                                |

The logout test passed before because its URL assertion only checked the site domain, which also matches the still-logged-in inventory page. It now checks that the Username field appears after logout.

The item test passed before because its generic inventory-item visibility assertion did not verify which product opened; the inventory list was already visible before the click. It now checks the exact product name on the detail page.

`test.fail()` marks a test as expected to fail, so if it passes unexpectedly, Playwright reports it as an unexpected pass and the test run fails. This is useful because it signals that the known defect may have been fixed and the expected-failure marker should be revisited.

## Parameterized login test listing

Output of `npx playwright test --list`:

```text
Listing tests:
  [setup] › auth.setup.ts:7:6 › authenticate
  [chromium] › api\demo.spec.ts:3:5 › get api test
  [chromium] › api\demo.spec.ts:14:5 › post api test
  [chromium] › api\demo.spec.ts:33:5 › PUT api test
  [chromium] › api\demo.spec.ts:55:5 › delete api test
  [chromium] › cart-checkout.spec.ts:4:8 › Cart and checkout › adds two items to the cart
  [chromium] › cart-checkout.spec.ts:12:6 › Cart and checkout › completes an order and shows confirmation
  [chromium] › inventory.spec.ts:4:7 › Inventory › displays six items sorted by price from low to high
  [chromium] › inventory.spec.ts:16:7 › Inventory › opens an item and returns to the inventory
  [chromium] › login.spec.ts:8:9 › Login › logs in as standard_user
  [chromium] › login.spec.ts:8:9 › Login › logs in as locked_out_user
  [chromium] › login.spec.ts:8:9 › Login › logs in as problem_user
  [chromium] › login.spec.ts:8:9 › Login › logs in as performance_glitch_user
  [chromium] › login.spec.ts:8:9 › Login › logs in as error_user
  [chromium] › login.spec.ts:8:9 › Login › logs in as visual_user
  [chromium] › navigation.spec.ts:3:7 › Navigation › logs out
  [chromium] › navigation.spec.ts:8:7 › Navigation › opens the About page
  [chromium] › navigation.spec.ts:13:7 › Navigation › opens the dynamic catalog spinner
  [chromium] › problem-user.spec.ts:9:7 › Problem user › completes checkout
Total: 19 tests in 7 files
```

## Performance glitch user trace

Ran `npx playwright test tests/performance-glitch.spec.ts --trace on --reporter=line` and opened its trace with `npx playwright show-trace`. The login button click took **5.2 seconds**; the trace shows the delay between clicking Login and the inventory page finishing its navigation. Before clicking Add to cart, the test now waits for the Sauce Labs Backpack inventory item to be visible, which confirms the page has rendered the item the test is about to use.

![Playwright trace timeline with the 5.2-second Login click selected](./tests/performance-glitch-trace.png)

A fixed wait would only pause for an arbitrary duration: it could still be too short on a slower run and needlessly delay a faster one. Waiting for the actual Backpack item to appear lets the test proceed as soon as the required page state is ready and fail naturally if it never appears.
