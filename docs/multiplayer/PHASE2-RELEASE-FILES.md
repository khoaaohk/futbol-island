# Public island phase 2: release files (Nov 12 2026)

Ship together with the phase 1 batch (`PHASE1-RELEASE-FILES.md`), with `NEXT_PUBLIC_PUBLIC_WORLD` OFF and
`NEXT_PUBLIC_PUBLIC_HOLDOUT_READING` unset. With the flag off nothing here is visible or sent. Not part of this batch: the Konbini tap
issue (untouched, owner to decide), Coaches Corner / IDP and the water shader files (untouched).

## A. New files (whole file)
- `lib/analytics/holdoutReport.ts` (the holdout reading, server-side, status 'off' until its own flag)
- `app/admin/HoldoutCard.tsx` (the admin card; renders nothing while off)
- `tests/mp-public-phase2.cjs` (in `TEST_CORE_CHAIN`)
- `docs/multiplayer/PHASE2-VERIFY.md`, `docs/multiplayer/PHASE2-RELEASE-FILES.md`
- Screenshots: `docs/qa/phase2-existing-hint-phone.png`, `phase2-existing-hint-desktop.png`, `phase2-first-card-phone.png`,
  `phase2-first-card-desktop.png`

## B. Phase 1 files changed again (whole file: they are phase 1 files themselves)
- `components/party/PeopleButton.tsx` (live count "N on now" under the button, existing-player hint: portalled, dismissible)
- `components/party/PublicFirstCard.tsx` (new players only)
- `components/party/publicNear.ts` (`playerSince`, device key `fi2-public-since-v1`)
- `components/party/party.module.css` (`.peopleHint` rewritten, `.peopleCount` added)
- `lib/multiplayer/publicCopy.ts` (`PUBLIC_EXISTING_HINT` object, `peopleBadge` returns "N on now" / null; `PUBLIC_BUTTON_HINT` removed)
- `lib/multiplayer/publicFlag.ts` (`holdoutReadingEnabled()`)
- `lib/multiplayer/holdout.ts` (`holdoutReturning()`)
- `lib/multiplayer/presenceMode.ts` (the `arm` event carries `back`)
- `lib/multiplayer/publicWorld.ts` (raises `arm` with `back`)
- `lib/analytics/publicEvents.ts` (`countPublicArm(arm, back)`, `holdoutFrame`)
- `tests/mp-public-ui.cjs` (badge and Town pins follow the new shape)
- `scripts/check-mp-public-browser.cjs` (full runs = a post-launch player; new `existing` / `existing-desktop` profiles)

## C. Shared files, phase 2 hunks only
- `components/Town.tsx`: two hunks (`countPublicArm(e.arm,e.back)`, `holdoutFrame` in the import and after `publicFrame(t,othersNear());`)
- `lib/analytics/countIds.ts`: `HOLDOUT_ARMS` / `HOLDOUT_COUNT_EVENTS` / `HOLDOUT_FIXED_IDS` and their line in `FIXED_COUNT_IDS`
- `lib/analytics/countSince.generated.ts`: regenerated (`node scripts/gen-count-since.cjs`; adds the `2026-11-12` line)
- `lib/analytics/report.ts`: the import and `report.holdout=buildHoldout(merged);`
- `lib/analytics/core.ts`: the type import and `holdout?:HoldoutReport|null;`
- `app/admin/AnalyticsDashboard.tsx`: the import and the one `HoldoutCard` line after the party retention card
- `lib/saves/snapshot.ts`: `'fi2-public-since-v1'` in the device keys
- `docs/accounts-design.md`: the `fi2-public-since-v1` sentence in table B
- `package.json`: `node tests/mp-public-phase2.cjs` after `mp-public-copy.cjs` in `TEST_CORE_CHAIN`

## D. Not part of the batch
`tsconfig.json` (dev-server include line added by Next for `.next-p2`; removed at clean-up).
