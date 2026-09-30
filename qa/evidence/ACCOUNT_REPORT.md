# WEB Account UI verification

Controlled sign-in/signup/recovery responses, never real credentials, mail, OAuth provider or customer writes.

- PASS: 1440: signed-out welcome and valid account entrance
- PASS: 1440: invalid login error preserves form
- PASS: 1440: reset request stays on WEB origin and reports completion
- PASS: 1440: Enter submits login and session survives page reload
- PASS: 1440: logout really clears WEB session
- FAIL: 1440: signup handles confirmation-required response truthfully — locator.waitFor: Timeout 8000ms exceeded.
- FAIL: 1440: Google button makes correct WEB-only redirect handoff — locator.click: Timeout 8000ms exceeded.
- PASS: 390: signed-out welcome and valid account entrance
- PASS: 390: invalid login error preserves form
- PASS: 390: reset request stays on WEB origin and reports completion
- PASS: 390: Enter submits login and session survives page reload
- PASS: 390: logout really clears WEB session
- FAIL: 390: signup handles confirmation-required response truthfully — locator.waitFor: Timeout 8000ms exceeded.
- FAIL: 390: Google button makes correct WEB-only redirect handoff — locator.click: Timeout 8000ms exceeded.