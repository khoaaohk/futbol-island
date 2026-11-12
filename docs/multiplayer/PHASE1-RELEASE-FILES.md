# Public island phase 1: release files (Nov 11 2026, final pass)

What to release as ONE batch with `NEXT_PUBLIC_PUBLIC_WORLD` OFF (and the relay's public play closed: no `CONTROL_TOKEN`, no
`POST /control`). Method: `git diff --name-status origin/main` (origin/main d8e44e77 is 12 commits ahead of the local HEAD, so files
already released through the release worktree show as untracked here but are byte-identical to origin and are NOT listed), plus every
untracked file not in origin/main, each attributed by reading its hunks. Other unreleased work in the same tree: the parked Coaches
Corner (`lib/coaches/corner/**`, `components/coach/**`, `app/(site)/coach/**`, `docs/idp/**`), the IDP v2 updates
(`lib/coaches/idp/*`, `components/idp/*`, `tests/coaches-idp-v2.cjs`), the water shader work and Arcade / SEO screenshots. None of
those files is a public-island file.

## A. Public-island files, whole file (new)
Relay: `multiplayer/relay/src/worldLobby.ts`, `multiplayer/relay/src/worldLobbyCore.ts`
Client lib: `lib/multiplayer/holdout.ts`, `presenceMode.ts`, `publicCopy.ts`, `publicFlag.ts`, `publicWorld.ts`, `sharedMatch.ts`,
`strangers.ts`; `lib/graphics/remotePick.ts`, `lib/graphics/remotePublic.ts`; `lib/analytics/publicEvents.ts`, `publicWorldAdmin.ts`
UI: `components/party/PeopleButton.tsx`, `PlayLock.tsx`, `PlayerCard.tsx`, `PresenceChoice.tsx`, `PublicFirstCard.tsx`,
`ReportSheet.tsx`, `RoomPlayerTap.tsx`, `RoomPublicChip.tsx`, `playerCard.module.css`, `publicNear.ts`, `usePlayerTap.ts`
Admin API: `app/api/admin/public-world/route.ts`
Tests: `tests/mp-world.cjs`, `mp-presence.cjs`, `mp-public-copy.cjs`, `mp-public-draw.cjs`, `mp-public-ui.cjs`, `mp-player-tap.cjs`,
`tests/fixtures/mp-public-copy-off.json`
Scripts: `scripts/check-mp-public-browser.cjs`, `check-mp-player-tap.cjs`, `check-mp-public-heat.cjs`, `check-mp-konbini-tap.cjs` (Nov 12: Konbini nearer-wins)
Docs: `docs/multiplayer/WORLD-HANDOFF.md`, `CLIENT-HANDOFF.md`, `PHASE1-VERIFY.md`, `PUBLIC-COPY-REVIEW.md`, `PUBLIC-OWNER-STEPS.md`,
this file
Screenshots: every `docs/qa/public-*.png` (e.g. arcade-chip, first-card, island-arcade-6, island-outdoor-23, lock-settings,
panel-phone, player-card-desktop / -phone, room-card-arcade / -museum / -shop -phone / -desktop, roster-report,
verify-arcade-strangers, verify-museum-strangers, verify-switch-fade, verify-two-clients). NOT these: `docs/qa/water/**`, `boat-stuck-*`, `messages-one-at-a-time-*`.

## B. Public-island files, whole diff (changed; every hunk is public island)
Relay / protocol / dev: `multiplayer/relay/src/index.ts`, `partyRoom.ts`, `roomCore.ts`, `relayStatsCore.ts`, `cf.d.ts`,
`multiplayer/relay/wrangler.toml` (v3 migration `WorldLobby`, rate-limit bindings), `multiplayer/protocol/names.ts`, `types.ts`,
`validate.ts`, `multiplayer/dev-relay/server.mjs`, `multiplayer/bots/bot.mjs`
Client lib: `lib/multiplayer/config.ts`, `connection.ts`, `index.ts`, `invite.ts`, `matchLink.ts`, `roomParty.ts`, `store.ts`,
`townBridge.ts`, `lib/multiplayerAllowed.ts`, `lib/graphics/remoteAvatars.ts`, `lib/graphics/rigCap.ts`,
`lib/arcade/arcadeRoomParty.ts`, `lib/arcade/arcadeRoomScene.ts` (only the `cabinetAt` hook), `lib/analytics/countIds.ts`
(`PUBLIC_FIXED_IDS`), `lib/site/aboutCopy.ts`, `lib/site/learnFeatures.ts`, `lib/site/safety.ts` (flag-aware lists; untracked here,
differs from origin only by the public hunks)
UI / pages: `components/Town.tsx`, `components/party/PartyHost.tsx`, `RoomPartyChip.tsx`, `useRoomParty.ts`, `useArcadeRoomParty.ts`,
`party.module.css`, `components/ArcadeRoom.tsx`, `KonbiniRoom.tsx`, `MuseumRoom.tsx`, `components/shop/ShopRoom.tsx`,
`components/FriendMapDots.tsx`, `components/GrownUps.tsx`, `components/IslandSettings.tsx`, `app/play/page.tsx`,
`app/admin/RelayHealth.tsx`
Tests: `tests/mp-avatars.cjs`, `mp-client.cjs`, `mp-live.cjs`, `mp-protocol.cjs`, `mp-relay-stats.cjs`, `mp-room-core.cjs`,
`mp-rooms.cjs`, `mp-ui.cjs`, `admin-analytics-party.cjs`, `friend-bump.cjs`, `remote-rides.cjs`
Scripts: `scripts/check-mp-heat-recheck.cjs`, `scripts/check-mp-rooms-heat.cjs` (`--world`), `scripts/check-mp-e2e.cjs` (final pass:
`/play` entry, "With friends" on flag-on builds, visible Join button)
Docs: `docs/multiplayer-design.md` (the "Public worlds (relay)" section)

## C. Shared files: only these hunks are public island
| File | Public-island hunks (origin/main line -> working line) | Other work in the file (do NOT release with this batch) |
|---|---|---|
| `components/privacy/PrivacyPolicy.tsx` | +3 import `publicWorldEnabled`; +56..63 the `[PUBLIC-WORLD]` comment + `POLICY_UPDATED_PUBLIC`; +66 `const PUB`; 59->69 "Last updated" picks `POLICY_UPDATED_PUBLIC`; 69->80 TOC label; 86->97..99 emotes line + "Other players can be seen"; 97->110 FIRST line only (`{PUB?<p>Futbol Island is designed for children...`); +120 "Other players:" device-storage paragraph; +168 counts bullet; 161->185..193 section 7a heading + the six public paragraphs; 193->225..226 Cloudflare line; +253..254 reports table row; +275 "stop other players being shown" | Coaches Corner: 50->51 `POLICY_UPDATED` Nov 10 -> Nov 11; +77 TOC "Coaches Corner"; +139..146 the Coaches Corner section; 97->111..112 the `[LAWYER]` check-in-note comment and the reworded "Children are never asked..." paragraph |
| `lib/analytics/countSince.generated.ts` | the `mp:pub_*` ids appended to the `'2026-11-11'` entry (origin has `["en:game_airhockey"]`) | none other in the diff |
| `lib/analytics/startIds.ts`, `lib/analytics/startReport.ts` | none | Coaches Corner (`'coach'` privacy section id / label): not public island |
| `lib/saves/snapshot.ts` | +79..84 `DEVICE_KEYS`: `fi2-presence-mode-v1`, `fi2-public-hint-v1`, `fi2-holdout-v1`, `fi2-world-session-v1` | 108->114 `NEVER_KEYS` `fi2-coach-corner-v1` (Coaches Corner) |
| `docs/accounts-design.md` | +312..313 the "Public island" storage paragraph | +318..320 "Adults-only coach data" (Coaches Corner) |
| `package.json` | the test chain gains `mp-world`, `mp-presence`, `mp-public-copy`, `mp-public-draw`, `mp-public-ui`, `mp-player-tap` | the same line gains `coach-corner-core`, `coach-corner-ui` (Coaches Corner) and moves `kitrush-core` (no-op order change): release the line without the two coach tests |
| `docs/performance-guide.md` | +186..222 "Public island: drawing strangers" | +3..16, +105..108, +6632..6644 water / other notes |
| `lib/konbini/konbiniScene.ts` | Nov 12 Konbini nearer-wins: the 5-line `shelfDepth()` method after `pick()` (no side effects; the room compares it with a stranger's body) | none other in the diff |
| `docs/multiplayer-public-island-plan-2026-11-11.md` | the whole plan (untracked here; differs from origin only by the appended owner line) | the appended "Air Futbol will NOT get online play" owner note is an Arcade decision: harmless, may ship |

Water shader files (`lib/graphics/waterSurface.ts`, `waterRipples.ts`, `islandShore.ts`, `lib/town/fishing/shoreWater.ts`,
`underwater.ts`, `tests/water-tropical-cost.cjs`): NO public-island hunks (the keyword hits in `waterSurface.ts` were comments about the
sea state). Not part of this batch.

## D. Not part of the batch
`tsconfig.json` (only this pass's dev-server include lines; removed at clean-up), `app/(site)/tools/page.tsx`,
`tests/privacy-nov10.cjs`, `tests/seo-tools.cjs` (Coaches Corner link / date pins), `components/idp/*`, `lib/coaches/idp/*`,
`tests/coaches-idp-v2.cjs` (IDP v2), `lib/coaches/corner/**`, `lib/coaches/cornerAuth.ts`, `components/coach/**`, `app/(site)/coach/**`,
`docs/idp/**`, `scripts/check-coach-corner-browser.cjs`, `tests/coach-corner-*.cjs`, `docs/arcade-aaa/shots/**`, `docs/seo/shots/**`,
`docs/qa/water/**`, `docs/qa/boat-stuck-*`, `docs/qa/messages-one-at-a-time-*`.

Check before release: with the flag off, `node tests/mp-public-copy.cjs` must pass unchanged (policy, safety, /play, /learn, About
hashes), and the release must not include the Coaches Corner hunks above (they would put a section for an unreleased page in the
policy).
