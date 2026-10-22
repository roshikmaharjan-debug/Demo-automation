# UI test mutation proof

Each test was run with the described feature broken and then passed after restoration. The cart and logout tests were also rerun with the same break after tightening their assertions; both then failed.

| Test | What I broke | Did it fail? |
|---|---|---|
| logs in successfully | Used `wrong_password` instead of `secret_sauce`. | Yes
| shows an error for an incorrect password | Used the valid password `secret_sauce`. | Yes
| shows an error for a locked-out user | Used `standard_user` instead of `locked_out_user`. | Yes
| displays six items sorted by price from low to high | Selected high-to-low sorting instead of low-to-high. | Yes
| opens an item and returns to the inventory | Opened the Bike Light instead of the requested Backpack. | Yes
| adds two items to the cart | Changed the count from 2 to 3 |  yes 
| completes an order and shows confirmation | Skipped the Continue button click. | Yes
| logs out | Skipped the Logout button click. |  no
| opens the About page | Skipped the About link click. | Yes
| opens the dynamic catalog spinner | Skipped the Spinner button click. | Yes

The logout test passed with logout broken because checking for the SauceDemo domain also succeeds while the user remains logged in; it now checks that the username field is visible on the logged-out screen.


