# GOOD TIMES WEB — execution and release contract

## Scope boundary
This repository contains the separate desktop/browser GOOD TIMES product. All work belongs in `dolodorsey/good-times-website`, on `web-desktop-v1` until the draft release is approved. The native source repository `dolodorsey/good-times-app` is read-only reference material. Never push there, change its build, trigger its native release, move its domain, or merge WEB styles into it.

Do not change production Supabase tables, policies, functions, authentication settings, customer data, schedules or ingest jobs as part of WEB interface work. Backend integration changes require a separate reviewed scope. Do not repoint the existing app Vercel project at this repository. No automatic PR merge or production promotion.

## Customer product contract
The primary navigation is Home / Places / Plan / Entertainment / Profile.

Home contains current discovery entry points. Places and Entertainment remain separate. Saved places, entertainment and plans live inside Profile's Library. Build My Night, Shake and Ask are distinct plan-creation methods. The public launch city remains Atlanta.

Preserve the real GOOD TIMES assets and the approved dark/gold identity. Never substitute a generic landing page, static screenshot, disabled mockup or an old interface for the actual customer product. All visible controls must perform the labeled action or explicitly explain why it is unavailable.

Desktop at 1024px and above uses the complete viewport, a usable persistent left navigation rail, readable multi-column content, keyboard focus, safe modal behavior and normal scrolling. Tablet and phone layouts remain separately responsive within this WEB client.

## Verification
`npm run test` checks behavioral invariants and read-only source-reference contracts. `npm run test:web` verifies real compiled browser screens, clicks, saves, planner generation, navigation, data errors and seven viewport widths using controlled account/content fixtures. `node scripts/web-account-qa.mjs` verifies account UI and mocked authentication handoff.

A successful compile is not a functional or visual pass. Require the expected number of executed checks, zero failures, and inspect screenshots. A report with no executed checks must fail. Do not suppress failures or weaken assertions to obtain a green badge.

Mock-based QA does not certify live Google OAuth, email delivery, payments, production data persistence or cross-device synchronization. Mark those as unverified until separately tested on the independent WEB deployment. Never make real purchases, reservations, or customer account writes during automated UI checks.

`qa/reference` contains historical read-only documents and SQL for invariant tests, not an executable migration queue. Never run those SQL snapshots. `qa/evidence` contains test evidence, not live event programming. Test venues, events, user identities and dates must never be shipped as live production inventory.

## Release protection
Keep PR #1 in draft until browser and visual review plus independent-host integration checks pass. Preserve a pinned source commit, a tested WEB commit, the complete test report, screenshots, and an explicit rollback target. Separate implemented code, tested behavior, deployed state and unresolved blockers in every completion report.
