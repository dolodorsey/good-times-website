# GOOD TIMES WEB — UI and interaction QA closeout

Date: September 30, 2026.

## Verified build
- Repository: `dolodorsey/good-times-website`
- Branch: `web-desktop-v1`
- Draft pull request: https://github.com/dolodorsey/good-times-website/pull/1
- Tested product commit: `6205d5814d09b6d91f03712e64d6606579f61152`
- Full verification workflow: https://github.com/dolodorsey/good-times-website/actions/runs/36676860870
- Verification gate: SUCCESS. Compile, unit, browser, account, request-form and restaurant phases passed.

## Scope boundary
The native app repository `dolodorsey/good-times-app` was read-only reference material. This task made no writes to it, its native build configuration, its deployment, its domains, production database records, policies or authentication configuration. The website main branch was not merged or promoted. The public launch city remains Atlanta.

The native source snapshot was pinned to `0e2c1fe81c695cb1ecc2f4ca7220d51203b9e10f`. The existing website main/rollback reference is `b88e7b8ea25ce9ceb6681d990e1a05bec9adc00d`.

## Results
| Verification | Executed passes | Failures |
|---|---:|---:|
| Behavioral unit tests | 160 | 0 |
| Customer UI, navigation, planning and failure recovery | 117 | 0 |
| Account UI and controlled authentication handoff | 14 | 0 |
| Membership, concierge, trip and group request forms | 24 | 0 |
| Restaurant details and action destinations | 4 | 0 |
| TOTAL | 319 | 0 |

Four conditional restaurant browser tests are skipped during the unit-only phase, then executed and passed separately in the browser phase. They are counted once above, not twice.

Core browser viewports: 1024, 1280, 1366, 1440, 1920, 768 and 390 pixels. Restaurant details additionally checked at 320 and 834 pixels. Browser engine: Chromium. Evidence contains 136 individual screenshots and machine-readable reports. Evidence is regenerated on every run; missing or failed reports fail the final gate.

## Interface and functionality delivered
Full-width desktop shell at 1024px and above with a persistent left navigation rail. Main navigation: Home / Places / Plan / Entertainment / Profile. Saved plans, places and entertainment remain inside Profile's Library. Desktop content grids, discovery lanes, forms, typography, mouse/keyboard interaction and readable dialog layouts are scoped to this WEB repository.

Browser Back/Forward and reload preserve primary destinations. Home timing controls, search, Places, Entertainment categories, venue directories, map switching, details and return controls, saves, Profile sections, Radar and all three plan-creation interfaces were exercised. Guided planning, saving, reload persistence, lock/unlock, reordering, replacement, removal, calendar export and clipboard sharing were tested using controlled backend fixtures. Failed saves, failed plan updates, missing metadata and directory retries were tested without false success states.

Public request forms have desktop two-column layouts, full-page scrolling, validation, retained values on error, retry and double-submit protection. Optional SMS consent is not silently enabled. Publishable API keys are not used as end-user bearer tokens. Account screens use the browser canvas, named inputs and keyboard submission. Official welcome artwork is preserved; a bundled official-logo fallback is available when the remote logo fails.

Twenty-nine omitted binary assets were restored from the pinned app snapshot. Long restaurant/detail dialogs now contain their full content and retain reachable action buttons instead of overflowing the card background.

## Evidence
- `qa/evidence/REPORT.md` and `report.json`
- `qa/evidence/ACCOUNT_REPORT.md` and `account-report.json`
- `qa/evidence/REQUEST_REPORT.md` and `request-report.json`
- `qa/evidence/unit-tests.txt`
- `qa/evidence/restaurant-ui-tests.txt`
- `qa/evidence/restaurant-details/<width>/receipt.json`
- Individual screenshots under `qa/evidence/`

## NOT certified as live production
This is an actual compiled-UI test pass with controlled account/content responses. Screenshots include sample QA records and dates; they are not current event listings. No real customer accounts, purchases, reservations or concierge requests were created. Tests are not a claim of live Google authentication, mail delivery, payment completion, live customer persistence or cross-device synchronization.

A new independent Vercel WEB preview has not been deployed in this task. Do not attach this branch to the original `good-times-app` Vercel project (`prj_XScizxpsIoCggXakSla6dNGfjr01`). Keep PR #1 in draft until a separate WEB preview and real-origin integration verification pass. Do not change native-app aliases, Supabase auth redirect settings, domain assignments or production data without an explicit reviewed release scope.

Status: WEB UI/interaction QA passed. Independent deployment and live-integration release sign-off pending. Native app untouched by this work.
