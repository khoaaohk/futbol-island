# Analytics for Play with friends, emotes and sponsors (research + spec, Oct 22 2026)

Owner's brief: "We also need to have data for all this new work. how often they are using emotes, setting up the party, number
of players in the party. we need to get more data like this for sponsorships. research what we should add and track in the admin
portal".

Research and spec only. No app code changed. Base: `integrate-dive-bugs-sealife` @ 3dc81033.

**Status (Oct 22 2026, later): Phase A is built** (branch `analytics-phase-a`; see "Phase A: P0" in §10 for the file list). Notes
from the build: emote ids carry the LOCAL emote number (`pickIn`: 0–9, 10–18, 20–24, 30–34, 40–49), not the protocol value;
Hide / Mute are counted in Town from PartyHost's `onHiddenChange` / `onMutedChange` (the member rows stay untouched); the
title-screen step is the start-page id `st:friends`; `mp:end_tap` (first tap) and `mp:tab_code` / `mp:tab_list` (once per visit) were
added; the host's end bands ride the final beat through a new tracker `onPageHide` hook. The privacy policy was rewritten the same
day to say plainly that anonymous usage data IS collected, for running the game and for combined sponsor totals (legal review
pending, `[LAWYER]` comment in components/privacy/PrivacyPolicy.tsx). The sponsor report stays internal: no sponsor export in Phase A.

## 0. Decision summary

**Finding 1: no multiplayer data is collected today.**
- `PartyHost` defines `onTrack` and calls `track.current?.('mp_party_created' | 'mp_party_joined' | 'mp_party_ended' | 'mp_join_failed')`
  (components/party/PartyHost.tsx:19, 193, 198, 210, 217, 243-255).
- Town.tsx:1961 mounts `<PartyHost … />` without `onTrack`, so every call is a no-op.
- The ids also could not pass the counter grammar. `COUNT_KEY_RE` (lib/analytics/countIds.ts:183) is
  `^[a-z]{1,2}:…`, so `mp_party_created` would be dropped by `isCountId`.
- docs/multiplayer-design.md §5.6 says the wiring is "pending the flag rollout".

**Finding 2: no emote data is collected.** Emotes are counted only inside a dive (`wa:dive_emote`). Nothing records the wheel,
the pick, the context or an NPC answering.

**Finding 3: the counter channel already does what we need, with no migration.**
- `count(id,n)` in lib/analytics/tracker.ts:100 is a map increment.
- The counts drain into the existing beat as `k:{id:n}`: at most 64 ids and 50 per id per beat, and the rest carry to the next beat.
- The SQL ingest checks only an id's shape.
- The day's rollup gives `counts` (sums) and `countSessions` (sessions with the id ≥ 1). Funnels and "share of sessions"
  work from these without any per-session id.
- New ids need only:
  - allowlist entries in countIds.ts;
  - call sites;
  - a report builder;
  - an admin section.

**Constraint.** tests/mp-isolation.cjs bans `lib/analytics` imports from `lib/multiplayer/**`, `components/party/**` and
`multiplayer/**`. Every party or emote count must be raised through a callback that **Town.tsx** (which already imports the
tracker) turns into `count()`. Party code never imports analytics.

### Recommended metrics

The id families are `mp:` (party), `em:` (emotes) and `rl:` (relay, server-side, not on the beat).

| # | Metric (admin label) | Ids | Pri | Effort | Privacy |
|---|---|---|---|---|---|
| 1 | Party funnel: opened → gate → name → created/joined → live | `mp:open*`, `mp:gate_*`, `mp:name_ok`, `mp:create_tap`, `mp:created`, `mp:join_tap`, `mp:live_host`, `mp:live_guest` | P0 | S | safe (policy sentence) |
| 2 | Join failures by reason | `mp:fail_<reason>` | P0 | S | safe |
| 3 | Party size (peak members, histogram) | `mp:peak_<b>` | P0 | S | safe |
| 4 | Party length (histogram) | `mp:len_<b>` | P0 | S | safe |
| 5 | Minutes played with friends (vs solo) | `mp:min`, `mp:min_reach_<b>` | P0 | M | safe |
| 6 | Sessions that played with friends (%) | `mp:in` | P0 | S | safe |
| 7 | Invites shared / link opens / link joins | `mp:share_ok`, `mp:copy_ok`, `mp:open_link`, `mp:live_guest_link` | P0 | S | safe |
| 8 | Emotes used, by emote and context | `em:e<wire>`, `em:ctx_<c>` | P0 | S | safe |
| 9 | Emote engagement per session (histogram) and wheel conversion | `em:reach_<b>`, `em:btn`, `em:wheel`, `em:pick` | P0 | S | safe |
| 10 | Emote target: townsperson answered / friend / solo / refused | `em:to_npc`, `em:to_party`, `em:solo`, `em:refused` | P0 | S | safe |
| 11 | Party controls used (New code, Close, Remove, Hide, Mute, End, Leave) | `mp:new_code`, `mp:lock`, `mp:kick`, `mp:hide`, `mp:mute`, `mp:end`, `mp:leave` | P0 | S | safe |
| 12 | Sponsor report (weekly) + CSV / print-to-PDF | built from 1–11 + existing | P1 | M | needs §13 sentence (legal) |
| 13 | Relay health and authoritative party histograms, live parties now, hourly peak | `rl:*` in a Stats Durable Object | P1 | M | needs §7a sentence |
| 14 | Emote variants (dance, show-off, handshake), streaks, emote camera, friends' emotes seen | `em:dance_<n>`, `em:show_<n>`, `em:hf_<n>`, `em:streak`, `em:cam`, `em:seen` | P1 | S | safe |
| 15 | Learning in a party (lessons and quizzes started while live) | `mp:lesson`, `mp:quiz`, `mp:quiz_done` | P1 | S | safe |
| 16 | First party / repeat host per device | `mp:first_party`, `mp:first_host` | P1 | S | needs §11 storage line |
| 17 | New players brought by a party (k-factor), organic vs invited | `mp:guest_new` + server split | P2 | M | needs policy check |
| 18 | Retention D1/D7, party vs solo players | SQL over the 14-day raw rows, keyed player id | P2 | L | needs policy + legal |
| 19 | Connection quality (RTT bucket, reconnects) | `mp:rtt_<b>`, `mp:reconnect` | P2 | S | safe |

**Do not track:**
- party codes, invite links, member ids, resume tokens or host keys;
- first names, nick length or nick validity per child;
- who played with whom: no friend graphs, no co-play pairs, nothing per party or per child;
- exact party start/end timestamps on the client;
- IP addresses, or any value derived from one;
- save codes;
- typed text of any kind.

## 1. What exists (read, not guessed)

| Piece | Where | What it does |
|---|---|---|
| Privacy contract | lib/analytics/core.ts:1-23 | No cookies; per-tab session id; daily-salted visitor hash; country/region only; fixed path allowlist; append-only writes (~3–6 per session) |
| Counter channel | tracker.ts:100 `count`, :107 `takeCounts`, `BEACON_BUDGET` 4000 B | Module map; drained into each beat (hide/pagehide + jittered ~3 min ping); ≤64 ids, ≤50 per id per beat, the rest carries |
| Allowlist + grammar | countIds.ts:166-204 | `FIXED_COUNT_IDS` + `COUNT_KEY_RE`; families `lo/le/ls/lf/la/q/o/ob/pf/gr/rv/st/sg/sp/tu/fi/en/ip/sh/sb/su/bc/wa` (`mp` and `em` are free) |
| Start flags | countIds.ts:214 `FLAG_RANGES` | Coarse buckets on a session's start (progress, graduations, settings, voice). Adding a flag needs SQL |
| Returning / has-code marks | core.ts:79-85 `rt`, `hc`; deviceMarks.ts | Yes/no per start |
| Player id | core.ts:82-85, playerId.ts | Keyed one-way hash of the save code or the install id, made on the server; the raw value is discarded |
| Retention | core.ts:48 `RETENTION_DAYS=14` | Raw sessions/beats kept 14 days; daily rollups kept for good |
| Rate caps | core.ts:51-55 | 150 sessions per visitor-hash per day, 300 beats per session |
| Suppression | sponsor.ts:23 `MIN_SESSIONS=5`; startReport.ts:3-5 | Cells under 5 sessions show "<5"; funnels use `countSessions` |
| Event-module pattern | waterEvents.ts, summitEvents.ts, sponsorEvents.ts | One-line helpers at the moment something happens; per-device "first time" via one localStorage flag (`fi2-water-firsts-v1`) |
| Sponsor Overview | sponsor.ts:18 `SPONSOR_METRICS` (8 cards), SponsorOverview.tsx, docs/admin-sponsor-insights.md | Cards with total, change vs previous period, trend, slide-out (day by day, items, device/country via `analytics_sponsor_split`), CSV |
| Admin tabs | AnalyticsDashboard.tsx:29-30 | Overview / Engagement / Players / Live |
| Party tracking | PartyHost.tsx:19 `Track`, 4 ids | **Unwired** (Town.tsx:1961) and off-grammar |
| Relay | multiplayer/relay/src (index.ts routes, partyRoom.ts DO shell, roomCore.ts pure logic) | Stores nothing about players. The design doc §4.6 planned "counts only" observability, not built |
| Privacy policy | PrivacyPolicy.tsx §7 (:89-108), §7a (:110-115), §9, §11, §13 (:149) | §7 lists the counted things; §7a: the first name is "never added to visit counts… or reports"; §13: "We do not sell, rent or share information" |

Emote facts used below:
- Wire ids: lib/town/emoteReact.ts:10, rideEmotes.ts:6, emoteContexts.ts:11-43, npcEmoteSets.ts:8.
  - 0–9: the wheel (Wave, Cheer, HighFive, JuggleWithMe, ShowOff, WellPlayed, PassBall, Laugh, Dance, Thanks).
  - 10–18: ride scripts.
  - 20–24: flying.
  - 30–34: swimming.
  - 40–49: NPC sets.
- Variants: `DANCES` (10, emoteDance.ts:222), `SHOW_OFFS` (10) and `SHOW_OFF_REACTIONS` (4) (emoteShowOff.ts),
  `HANDSHAKES` (emoteHandshakes.ts:245), and `highFivePlan`, which returns the variant index (highFive.ts:34).
- All picks go through `emoteBus.set(...)` in Town.tsx:772-800. That is the one place that knows:
  - the context (`cs` = fly/swim, `rs` = ride, `ns` = NPC set);
  - whether a townsperson reacted (`emoteNpc`);
  - the field-player refusal (`refuse`);
  - whether the emote went to the party (`conn.sendEmote`).
- Remote emotes arrive in lib/multiplayer/townBridge.ts:95 (`avatars.emote`).
- Protocol: `PARTY_MAX=20`, code TTL 8 h, party cap 12 h, `ErrorCode` 0–9, `LeaveReason`, `EndReason`, `PoseFlag.Hidden`
  ("in a menu/away"), and `PingKind` MeetHere/FollowMe (multiplayer/protocol/types.ts).
- The protocol has **no** busy/lesson/quiz presence state. The only presence is `PoseFlag.Hidden`, plus `Zone.Indoors`.

## 2. Id scheme and privacy rules

**Grammar.** Ids use the existing grammar: two-letter family, a body of `[A-Za-z0-9_]{1,40}`, and up to two `:` segments.

**Family `mp:`** (party, client).
- Emitted only by Town.tsx's `onTrack` handler, which calls the new lib/analytics/partyEvents.ts.
- PartyHost passes an **event name and an optional fixed bucket string**. Town maps it through an allowlist.
- An unknown name is dropped.

**Family `em:`** (emotes, client).
- Emitted in Town.tsx's `emoteBus` handler via the new lib/analytics/emoteEvents.ts.
- Ids carry wire numbers (`em:e8` = Dance), so the tracker bundle never imports the emote content. Labels live on the server
  (the sponsorLabels.ts pattern).
- A test checks the numeric ranges match the real tables.

**Family `rl:`** (relay, server).
- Counters live in a Cloudflare Durable Object, never on the beat (§7).

**Rules for every metric:**
1. Totals per fixed id only. A bucket is a fixed string from a list.
2. Never a code, link, member id, token, host key, name, nick length, IP, save code, position or timestamp.
3. No per-child or per-party record leaves the device. Party histograms are one bucket increment per party end, not a row.
4. Admin suppression:
   - internal sections: `MIN_SESSIONS=5` per cell (sessions) and **≥5 parties** per party-histogram cell;
   - sponsor exports: **≥10**, and reach rounded to the nearest 10 under 1,000, else to the nearest 100.
5. Cost: no new requests from the game and no per-frame work.
   - Emote and party counts are map increments flushed with the beat.
   - Minute accrual rides the existing ~5 s `islandFrame` sample.
6. Off when the tracker is off (dev, DNT/GPC, bots, preview, admin, localhost): `count()` is already a no-op.

## 3. Party funnel (a)

All ids are emitted from **Town.tsx** `onTrack={(e,b)=>countParty(e,b)}`. The "Emit" column names the event's source
in PartyHost.tsx (or another file) and the `track` name PartyHost passes. All are P0 / S / safe unless noted.

| Step | Id | Definition | Emit (source → `track` name) |
|---|---|---|---|
| HUD button opened the menu | `mp:open` | Play with friends card shown from the HUD (not live) | `openMenu` (:221) when `!liveRef.current` → `'open'` |
| Sheet opened while live | `mp:sheet` | HUD button while a party runs | `openMenu`, live branch → `'sheet'` |
| Invite link opened | `mp:open_link` | `?party=` code found after island + intro | `linkChecked` effect (:229) when `code` → `'open_link'` |
| Title-screen Join friends | `mp:open_title` | Join friends used on `/` | components/landing/JoinFriends.tsx (may import analytics) or a `st:friends` start id |
| Grown-up gate shown | `mp:gate_show` | Gate rendered for create or join | `afterGate` (:236) when not passed → `'gate_show'` |
| Gate skipped | `mp:gate_skip` | Already passed this visit | `afterGate` when `parentGatePassed()` |
| Gate passed / back / wrong | `mp:gate_ok`, `mp:gate_back`, `mp:gate_wrong` | Wrong = one per wrong answer | `ParentGate` `onPass` / `onCancel`; **new optional `onWrong` prop** in components/ParentGate.tsx:29 next to `recordGateWrong` |
| Name accepted | `mp:name_ok` | NickField first became valid in this tab (once) | `NickField onChange` (:300) when it turns non-null. Never the text or its length |
| Name refused | `mp:name_bad` | A rejected character or word typed (count only) | NickField's existing rejection path. P1 |
| Start tapped | `mp:create_tap` | "Start a party" pressed | button onClick (:304) |
| Party created | `mp:created` | Code received from the relay | `startCreate` (:246) |
| Join tapped | `mp:join_tap` | Join with a code submitted | `JoinParty onJoin` (:316) |
| Live as host / guest | `mp:live_host`, `mp:live_guest` | Status became live after create / join | status effect (:191-196); replaces `mp_party_joined` |
| Join source | `mp:live_guest_link`, `mp:live_guest_typed` | Guest live via a link / title screen vs a typed code | same effect; PartyHost remembers how `joinCode` arrived |
| In a party this session | `mp:in` | Once per tab session at first live (host or guest) | partyEvents.ts guard |
| First friend joined (host) | `mp:ff_1m`, `mp:ff_5m`, `mp:ff_15m`, `mp:ff_60m`, `mp:ff_long` | Time from host live to the first other member, bucketed | members effect (:178): first `added.length` while host; partyEvents keeps the live time locally |
| Nobody came | `mp:ff_none` | Host's party ended with no friend ever | at end, host only |
| Share / Copy | `mp:share_tap`, `mp:share_ok`, `mp:copy_ok`, `mp:share_fail` | Share link button and `sharePartyLink` result | PartyInvite.tsx:21-24; **new `onShared(result)` prop** |
| New code | `mp:new_code` | Host rotated the code (sheet and after-kick prompt) | PartyInvite `onNewCode`, kick block |
| Close / open | `mp:lock`, `mp:unlock` | Host toggled Close to new friends | `onToggleLock`, kick block |
| Remove / reset name | `mp:kick`, `mp:name_reset` | Host actions (abuse signal) | member row buttons |
| Hide / mute a friend | `mp:hide`, `mp:mute` | Toggled on (not off) | `toggle(...)` calls |
| Meet here / Follow me | `mp:ping_meet`, `mp:ping_follow` | Map pings sent | wherever `sendPing` is called (Town) |
| End / leave | `mp:end`, `mp:leave` | Host ended for everyone / guest left | `connection.host.end()` and `leave()` |
| Ended for me | `mp:ended`, `mp:kicked` | Party ended remotely / I was removed | status effect (:197-199), kicked effect (:206-211); replaces `mp_party_ended` |

**Failures:** `mp:fail_<reason>` (P0). Reasons: `not_found`, `full`, `closed`, `expired`, `locked`, `bad_name`, `rate`,
`offline`, `version`, `other`. They map from:
- the `checkParty` branches (:253-255);
- `ERROR_BUCKET` (:30, extended with `BadName → bad_name`, `RateLimited → rate`, `BadVersion → version`);
- the `createParty` error (:243: `rate` / `offline`). This replaces `mp_join_failed`; host-side create failures use
  `mp:fail_create_rate` / `mp:fail_create_offline`.

**Admin: "Friends & parties" → Funnel.**
- Sessions per step (`countSessions`), with the conversion from the previous step.
- The funnel splits into two lanes:
  - Host: open → gate → name → create_tap → created → live_host → first friend.
  - Guest: open/open_link → gate → name → join_tap → live_guest.
- A failure bar chart sits under the funnel.
- Each step uses sessions, so the funnel needs no per-session id (the startReport.ts pattern).

## 4. Party size and duration (b)

**Size and length histograms (P0).** Emitted by the **host** client once at its party end (End, leave or tab close).
- Peak members: `mp:peak_1`, `mp:peak_2`, `mp:peak_3_4`, `mp:peak_5_8`, `mp:peak_9_12`, `mp:peak_13_20`.
  - Peak = the largest `state.members.length` the host saw.
- Length: `mp:len_5m` (<5 min), `mp:len_15m`, `mp:len_30m`, `mp:len_60m`, `mp:len_3h`, `mp:len_long` (3 h+).
- One per party: guests do not emit them, so no double counting.
- Tab close: emitted from a `pagehide` path inside partyEvents (Town owns it) so the final beat still carries it.
- Risk:
  - host migration and killed tabs lose a few parties;
  - the relay `rl:` histograms (§7) are authoritative and the client ones are the P0 approximation;
  - the admin shows both once the relay ships.

**Derived (no extra ids):**
- Average and median members, from the histogram:
  - median = the bucket that holds the 50th percentile;
  - average = the bucket midpoint, labelled "≈".
- Joins per party = `mp:live_guest / mp:created`.

**Minutes played with friends (P0, the sponsor currency).**
- `mp:min`: n = whole foreground minutes in a live party.
- Accrual: Town's existing ~5 s `islandFrame` sample adds the elapsed visible ms to a partyEvents accumulator while
  `status==='live'`. Every full 60 s it calls `count('mp:min')`.
- No timer, no per-frame work. Error ≤ 1 min per session.
- Solo minutes = island engaged minutes − `mp:min`.
- **Session distribution:** `mp:min_reach_5`, `_15`, `_30`, `_60`, `_120`.
  - Each fires once per session when that session's party minutes cross the threshold.
  - `countSessions` gives a cumulative histogram without any per-session vector. This reuses the "threshold" idea in §5.
- **Share of sessions in a party:** `countSessions('mp:in') / sessions`.

**Concurrent live parties and players (hourly peak) (P1).** The client cannot know this. Relay gauge (§7).

**Repeat hosts (P1).**
- `mp:first_host` and `mp:first_party`: the first time on this device, one localStorage flag (`fi2-mp-firsts-v1`, the
  `fi2-water-firsts-v1` precedent).
- Repeat hosting = `mp:created − mp:first_host`.
- Needs the §11 storage line.

**Party-driven return (P2).** See §6.

**Admin: "Friends & parties" → Size & length.**
- Two histograms with ≥5-party suppression.
- Minutes with friends vs solo (stacked bar per day).
- The `mp:min_reach_*` distribution.
- % sessions in a party.

## 5. Emotes (c)

All emitted from the **Town.tsx `emoteBus.set` handler** (:772) once the pick is accepted, i.e. after the early `return`s, at
the point `emoteFx.kind` is set. The calls go through `countEmote({wire,ctx,target,variant})` in emoteEvents.ts.

| Metric | Ids | Definition / emit | Pri |
|---|---|---|---|
| Emote used, by type | `em:e<wire>`: wire 0–9, 10–18, 20–24, 30–34, 40–49 (39 ids) | `pick` (the wire id actually played: `cs.wire` / `rs.wire` / `ns.wire` / `pickIn`) | P0 |
| Any pick | `em:pick` | Every accepted pick | P0 |
| Context | `em:ctx_ground`, `em:ctx_scooter`, `em:ctx_bike`, `em:ctx_moped`, `em:ctx_fly`, `em:ctx_swim` | From `flyNow` / `swimNow` / `rideRef.current` | P0 |
| Target | `em:to_npc` (a townsperson reacted: `emoteNpc` non-null after `react`/`interact`), `em:to_party` (a party was live and `sendEmote` sent it), `em:solo` (neither), `em:refused` (field-player refusal bubble shown, :793) | One target per pick, except `to_party`, which can stack with `to_npc` | P0 |
| NPC interaction rate | derived: `em:to_npc / em:pick` | | P0 |
| Button → wheel → pick | `em:btn` (Emote button became visible, once per session), `em:wheel` (wheel opened), `em:wheel_close` (closed with no pick) | components/EmoteControl.tsx (not party code: may import analytics); `em:btn` from the `hidden` false transition | P0 |
| Per-session distribution | `em:reach_1`, `_5`, `_20`, `_50` | Each once per session when that session's picks cross the threshold. "Emoting sessions" = `countSessions('em:reach_1')`; emotes per emoting session = `em:pick / countSessions('em:reach_1')` | P0 |
| Variant | `em:dance_<0-9>`, `em:show_<0-9>`, `em:react_<0-3>` (NPC show-off reaction), `em:hf_<n>` (`emoteFx.v` from `highFivePlan`) | Index into DANCES / SHOW_OFFS / SHOW_OFF_REACTIONS / HANDSHAKES; a test checks the counts | P1 |
| Streak | `em:streak` | 3+ picks inside 60 s, at most once per 60 s window (a two-slot ring buffer, no timer) | P1 |
| Emote camera shown | `em:cam` | `createEmoteCamera` engages (high five / zoom) | P1 |
| Friends' emotes seen | `em:seen` | Remote emote shown. **townBridge.ts must not import analytics**: add an `onEmoteSeen` option to `createPartyRuntime` that Town fills with `count('em:seen')` | P1 |
| Ball routines | covered by `em:e3` / `em:e6` + `em:to_npc` / `em:solo` | | — |

**Cost.**
- Under ~1 count call per second, even when spamming; map increments only.
- A busy session adds ≤ ~25 distinct ids per beat, and the 64-id beat cap carries any overflow.
- Nothing per frame. The streak check is two numbers.

**Privacy.** Preset emote ids only; never who the emote was aimed at.

**Admin: "Emotes" section.**
- Top cards: emotes used, emoting sessions (% of island sessions), emotes per emoting session, NPC answer rate, and wheel
  open → pick %.
- Bars by emote (wheel set and the ride / fly / swim / NPC sets grouped).
- Context split, target split, the reach histogram, and variant tables (P1).

## 6. Social and virality (d)

| Metric | Ids / source | Definition | Pri | Privacy |
|---|---|---|---|---|
| Invites sent | `mp:share_ok` + `mp:copy_ok` | Per party: ÷ `mp:created` | P0 | safe |
| Link opens | `mp:open_link` | `?party=` reached the island | P0 | safe |
| Link join conversion | `mp:live_guest_link / mp:open_link` | | P0 | safe |
| New players brought in | `mp:guest_new` | Guest went live on a session whose device has **not** played before. Town reads the existing `rt` mark (deviceMarks.ts) when handling `live_guest` | P2 | needs check: combines two existing yes/no facts, still a total |
| k-factor estimate | `mp:guest_new / mp:created` | New players per hosted party. Aggregate only, never a host→guest link | P2 | safe as defined |
| Organic vs invited new players | New-device sessions (`rt=0`) with vs without `mp:open_link`, from the 14-day raw rows via a new SQL function | | P2 | needs policy check |
| Device class of party play | Existing `analytics_sponsor_split(from,to)` run on the `mp:in` sessions | Phone / tablet / desktop share of party sessions | P1 | safe (existing split) |
| Time of day for party play | Relay hourly gauge (§7); the client sends none | | P1 | safe |
| Presence (away) | `mp:min_away`: minutes live with `PoseFlag.Hidden` set (menu / away), same accrual as `mp:min` | | P2 | safe |
| Learning in a party | `mp:lesson`, `mp:quiz`, `mp:quiz_done`: lesson opened / quiz started / quiz finished **while a party is live** | | P1 | safe |

Learning in a party:
- partyEvents exposes `partyLive()`, which Town sets from the status effect.
- learnEvents.ts adds the `mp:` twin when it is true.
- This is the "learning-engagement proof" sponsors want: kids studying football together.
- The protocol has no busy/lesson/quiz presence, so lesson-time-in-party is measured on the learner's device, not broadcast.

**Retention, party vs solo (P2, L).**
- Built by a new SQL function `analytics_party_retention(from,to)` over the 14-day raw rows.
- It groups sessions by the existing keyed `player_id`: "had a session with `mp:in`" vs "never".
- It outputs only D1 and D7 return rates per group, with ≥10 players per group.
- Window limits:
  - D7 needs the cohort to start ≥7 days inside the 14-day window, so it shows a rolling cohort only;
  - D30 is impossible by design (the retention period).
- Privacy: the policy's "Players" paragraph already says reports "tell visits from the same player apart over time". It
  stays an aggregate rate, but **flag for legal review** because it links party behaviour to a persistent id server-side.

## 7. Relay operational health (f)

**Goal.**
- Authoritative per-party aggregates and operational health from the relay.
- No code, name, member id, token or IP is stored. Bounded cost on the $5 Workers Paid plan.
- Note: wrangler.toml comments say the DO uses SQLite "the only kind the Workers Free plan allows". **Check which plan is
  live** before relying on Analytics Engine.

**Design: one `RelayStats` Durable Object (singleton `idFromName('stats')`).**
- **Room summary, once per party.**
  - `PartyRoom` keeps in-memory counters in `RoomCore`: peak members, joins, resumes, kicks, rotates, locks, inbound
    messages, refusals by `ErrorCode`, and the end reason.
  - It persists them in the existing `saved` snapshot so an eviction does not lose them.
  - On `end()` it makes **one** `stats.fetch('/add', {day, hour, peakBucket, lenBucket, endReason, joins, resumes, kicks,
    rotates, locks, msgBucket, refusals:{code:n}})`.
  - Buckets are computed in the room. The code is never sent.
- **Live gauge.** `+1` on `/init` (POST /party success) and `−1` in the summary. The DO tracks `livePartiesNow`, `livePlayersNow`
  (joins − leaves, sent as ±1 rarely) and the **hourly max** of both.
- **Worker-level refusals** (index.ts: origin refused, `POST /party` rate-limited, unknown code on `GET /party/:code`): one
  `ctx.waitUntil(stats.fetch('/inc?k=rl:…'))`. These requests are already capped by the IP token buckets.
- **Storage.**
  - Daily rows `{day → {id:n}}` kept 400 days.
  - Hourly rows kept 14 days, matching RETENTION_DAYS.
  - An alarm prunes once a day.
- **Read.**
  - `GET /stats?from&to` on the worker, with `Authorization: Bearer ${STATS_TOKEN}` (wrangler secret), returns totals.
  - The Next route `app/api/admin/party-stats/route.ts` (behind adminAuth.ts) fetches it on the server. The browser never
    sees the token.
  - Cached 60 s.
- **Cost.**
  - About 3 DO requests per party (init, a few gauge pings, summary) plus rare refusal increments.
  - 1k parties/day ≈ 3k requests/day ≈ 90k/month, under 10 % of the included 1M.
  - Storage is a few KB.
- **Alternative.** Workers Analytics Engine `writeDataPoint` (no singleton hot spot, SQL API). It is preferred if parties
  exceed ~50/s, but it needs an API token on the admin side and its plan limits checked.

**Ids (`rl:` namespace, server only; the same buckets as the client for comparison):**

| Group | Ids |
|---|---|
| Lifecycle | `rl:created`, `rl:ended_host`, `rl:ended_expired`, `rl:ended_empty` |
| Party histograms (authoritative) | `rl:peak_<b>`, `rl:len_<b>`, `rl:joins_<b>` (1, 2–3, 4–9, 10+) |
| Connections | `rl:ws_open` (upgrade), `rl:welcome` (joined OK) → connect success = welcome / ws_open; `rl:resume` (reconnect within 60 s); `rl:timeout` (LeaveReason.Timeout) |
| Refusals | `rl:err_<code>` for each `ErrorCode` (bad_message, rate, full, not_found, expired, locked, not_host, bad_version, bad_name); `rl:origin_refused`, `rl:create_rate`, `rl:lookup_miss` |
| Abuse signals | `rl:kick`, `rl:rotate`, `rl:lock`, `rl:name_reset`, `rl:rate_close` (socket closed for rate) |
| Cost watch | `rl:msgs` (total inbound), `rl:msgs_<b>` per party (<1k, 1–10k, 10–50k, 50k+) |
| Gauges | `rl:live_parties_max_h<HH>`, `rl:live_players_max_h<HH>` (hourly rows only) |

**RTT (P2, client).**
- `mp:rtt_<b>` (<80 ms, 80–150, 150–300, 300+) and `mp:reconnect`.
- `connection.ts` already heartbeats. It exposes a median RTT through the store, and PartyHost passes the bucket at party end.

**Admin placement.**
- Live tab: "Parties now / players in parties now".
- "Friends & parties" → Health: connect success, refusals by code, kicks per party, rotates per party, messages per party,
  and a monthly DO-request estimate vs the plan.

## 8. Sponsor report (e)

**What sponsors of kids' and family games ask for.**
- **reach**: unique players, by week;
- **engagement time**: minutes, and minutes per player;
- **frequency / return rate**;
- **brand-adjacent interactions**: counts of the sponsored activity;
- **social proof**: playing together, sharing;
- for education-minded sponsors, **learning outcomes**.

Kid-safe programs (COPPA) report these as contextual, aggregate numbers with no behavioural targeting. Roblox-style brand
activations headline visits, playtime and engagement; kidtech platforms headline COPPA-safe impressions and dwell time.
(General industry practice; not re-verified for this doc.)

**Positioning.** Futbol Island's angle: **"minutes of football learning and play, much of it together with friends, with zero
personal data"**.

**Proposed weekly "Sponsor report" view.** A 5th admin tab `Sponsor`, or `/admin/sponsor-report?week=YYYY-Www`. Every number
is a sum of existing rollups.

| KPI | Definition | Source |
|---|---|---|
| Reach | Distinct anonymous players in the week (rounded) | `/api/admin/players` (player ids, 14 days) |
| Engagement minutes | Foreground island + arcade + museum minutes | rollup engagedMs |
| Minutes per player | Engagement minutes ÷ reach | derived |
| Social minutes | `mp:min`, and its share of island minutes | §4 |
| Avg party size | From `rl:peak_*` (or `mp:peak_*` before the relay ships) | §4 / §7 |
| Players who played with friends | `countSessions('mp:in')` ÷ sessions | §4 |
| Emote engagement | Emotes per emoting session; % sessions emoting | §5 |
| Return rate | Existing Returning share (`is_returning`) | Players row |
| Learning engagement | Lessons watched, quizzes taken / finished, plus learning in a party | existing `le:` `ls:` `lf:`, §6 |
| Content interactions | The 8 existing sponsor cards (games, designs, cards, films, books, reading) | sponsor.ts |

**Wireframe (desktop; phone stacks the cards one per row):**

```
+-------------------------------------------------------------------------------+
| Sponsor report   Week 43 (Oct 19–25 2026)   [< prev] [next >]  [CSV] [Print] |
| All numbers are totals; groups under 10 are hidden. No personal data.          |
+-------------------+-------------------+-------------------+-------------------+
| REACH             | ENGAGEMENT        | WITH FRIENDS      | RETURN RATE       |
| 1,200 players     | 18,400 min        | 31% of minutes    | 42% returning     |
| +12% vs last wk   | 15.3 min/player   | avg party 3.4     | +3 pts            |
| ~~~~ sparkline    | ~~~~ sparkline    | ~~~~ sparkline    | ~~~~ sparkline    |
+-------------------+-------------------+-------------------+-------------------+
| EMOTES            | LEARNING          | PARTIES           | INVITES           |
| 9.1 per emoter    | 2,310 lessons     | 410 parties       | 520 shared        |
| 64% of sessions   | 1,150 quizzes     | median 15–30 min  | 38% link → join   |
+-------------------+-------------------+-------------------+-------------------+
| Party size  [1]▏ [2]████ [3-4]██████ [5-8]███ [9-12]▏ [13-20]<10              |
| Top emotes  Wave ███████  High five █████  Dance ████  Pass it ███  Cheer ██   |
| Device      Phone 58%  Tablet 27%  Computer 15%                                |
| How counted: one footnote per KPI (same text as the CSV).                      |
+-------------------------------------------------------------------------------+
```

**Export.**
- **CSV**: reuse `sponsor.ts` CSV builder rows: KPI, value, previous week, change, how counted.
- **PDF**: a print stylesheet (`@media print`, A4/Letter, the cards in a 2×4 grid, footnotes) plus the browser's
  Print → Save as PDF. No PDF library and no server rendering.
- Every export carries the line "Aggregate, anonymous counts; groups under 10 withheld; no personal information".

**Data-quality notes (shown in "How these are counted").**
- DNT/GPC visitors are not counted, so all figures are floors.
- No sampling.
- Client party histograms miss parties whose host tab was killed; relay figures are authoritative once live.
- `countSessions` summed over days counts a session spanning midnight twice. This is negligible, but documented.
- Reach comes from 14-day raw rows only, so weeks older than 14 days show the stored weekly number. This means **snapshot
  each week's report into a rollup table on Monday** (P1: `analytics_weekly_snapshot`).
- New ids show "Not tracked yet" until their build is live (the `ENGAGE_SINCE` pattern: add `PARTY_SINCE`).

**Admin cards on the Overview.** Add `social` ("Minutes with friends") and `emotes` ("Emotes used") to `SPONSOR_METRICS`,
with parts and slide-outs like the existing eight.

## 9. Privacy, consent and policy

**Consent model unchanged.** Analytics stay anonymous totals under §7 (internal operations; the CNIL/PECR audience-measurement
basis noted in docs/analytics-roadmap.md). DNT/GPC still sends nothing. No new requests, cookies or third parties.

| Item | Classification | Action |
|---|---|---|
| `mp:` funnel / size / length / minutes / controls; `em:` all | **needs policy sentence** (it fits "counts of play from fixed lists", but §7a says "nothing about who the players are" and readers should see party counts named) | §7 bullet (below) |
| `rl:` relay daily totals | **needs §7a sentence** | §7a "What we keep" (below) |
| `fi2-mp-firsts-v1` device flag (`mp:first_*`) | **needs §11 line** | add it next to the water firsts flag if §11 lists keys |
| `mp:guest_new`, organic vs invited, party vs solo retention | **needs policy check + legal** | flag `[LAWYER]` in PrivacyPolicy.tsx header |
| Sponsor report shared outside the team | **needs §13 sentence + legal**: §13 says "We do not … share information" | §13 sentence (below) |
| Codes, names, nick length, member ids, co-play pairs, IP, timestamps per party, positions | **avoid** | tests assert none appear |

**Draft wording for the legal review** (to add in components/privacy/PrivacyPolicy.tsx, marked `[LAWYER]`):
- **§7 bullet:** "counts from Play with friends, from fixed lists: how often a party is opened, started or joined (and why a
  join did not work), party sizes and lengths in broad bands (such as "3–4 friends" or "15–30 minutes"), minutes played in a
  party, invite links shared or opened, and which preset emotes are used and where (such as on a scooter or near a
  townsperson). Never the party code, a name, or who played with whom."
- **§7a "What we keep" addition:** "The party service keeps only daily totals, such as how many parties started, their sizes
  and lengths in broad bands, and how many connections failed, with no code, name or internet address."
- **§13 addition:** "We may share overall totals with supporters or sponsors of the game (for example, "players spent 18,000
  minutes on the island this week"). These never describe any one player, and small groups are left out."

**docs.**
- Update docs/multiplayer-design.md §5.6:
  - the ids are now `mp:*` (the grammar forbids `mp_*`);
  - Town wires `onTrack`;
  - the relay `rl:` counters.
- Add a pointer to this doc in docs/analytics-roadmap.md.

## 10. Phased build plan

### Phase A: P0 (≈1 agent day, Opus or Sonnet; then a separate verify agent)

**Scope:** §3 funnel and failures, §4 size / length / minutes / `mp:in`, §5 P0 emote ids, the admin "Friends & parties" and
"Emotes" sections on the Engagement tab, and the §7 policy bullet.

**Files:**
- `lib/analytics/countIds.ts`:
  - `PARTY_COUNT_EVENTS` and `EMOTE_WIRE_IDS` (the numeric ranges, repeated rather than imported);
  - `EMOTE_COUNT_EVENTS`;
  - add them to `FIXED_COUNT_IDS`;
  - document the families in the header.
- `lib/analytics/partyEvents.ts` (new):
  - `countParty(event, bucket?)` with the event → id map;
  - once-per-session guards (`mp:in`, `mp:name_ok`);
  - the live clock (first-friend bucket, length bucket);
  - `accruePartyMs(ms)` for the minute counter and its thresholds;
  - `partyLive()`;
  - a pagehide flush of the host's end buckets.
- `lib/analytics/emoteEvents.ts` (new): `countEmote({wire,ctx,target})`, the reach thresholds, `countEmoteUi(kind)`.
- `components/Town.tsx`:
  - `onTrack` on `<PartyHost>` (:1961);
  - `countEmote` in the `emoteBus` handler after the pick is accepted (:772-800);
  - `accruePartyMs` in the existing `islandFrame` sample path.
- `components/party/PartyHost.tsx`: widen `Track` to the event names in §3; add the calls listed; keep it free of
  analytics imports.
- `components/party/PartyInvite.tsx`: `onShared(result)` and the lock/new-code events (already callbacks).
- `components/ParentGate.tsx`: an optional `onWrong` prop.
- `components/EmoteControl.tsx`: `em:btn`, `em:wheel`, `em:wheel_close`.
- `lib/analytics/partyReport.ts` (new):
  - `buildParty(merged)` and `buildEmotes(merged)`;
  - funnel by `countSessions`, histograms, derived rates;
  - suppression: `MIN_SESSIONS` and ≥5 parties.
- `lib/analytics/report.ts` and the report type in `core.ts`: `report.party`, `report.emotes`.
- `app/admin/FriendsSection.tsx`, `app/admin/EmoteSection.tsx` (new): use `charts.tsx` and the `admin.module.css` patterns.
- `app/admin/AnalyticsDashboard.tsx`: mount both sections on the Engagement tab.
- `components/privacy/PrivacyPolicy.tsx`: the §7 bullet with `[LAWYER]` in the header comment.
- `docs/multiplayer-design.md` §5.6 and `docs/analytics-roadmap.md`: pointers and status.

**Tests:** `tests/admin-analytics-party.cjs` (new), following tests/admin-analytics-water.cjs / admin-sponsor.cjs. It checks:
- every new id passes `isCountId` and `COUNT_KEY_RE`, and no id outside the lists does;
- `EMOTE_WIRE_IDS` matches emoteReact / rideEmotes / emoteContexts / npcEmoteSets (source scan);
- PartyHost's `Track` union equals the partyEvents map keys;
- PartyHost, PartyInvite and townBridge still import no analytics (tests/mp-isolation.cjs must stay green);
- the call-site scan: each id has a writer;
- bucket functions at their edges (4:59 → `len_5m`, 5:00 → `len_15m`, peak 20 → `13_20`);
- threshold counters fire once per session;
- partyReport: funnel maths, suppression (<5 sessions, <5 parties), "Not tracked yet" before `PARTY_SINCE`;
- **a privacy scan**: no id contains a code-alphabet run of 6, and partyEvents / emoteEvents never reference `getNick`,
  `code`, `hostKey`, `members[…].name` or `nick`.

Run with the project's quiet test script.

### Phase B: sponsor report + relay counters (≈1–1.5 agent days, two agents: relay; admin)

- **Relay:**
  - `multiplayer/relay/src/relayStats.ts` (new DO, pure core in `relayStatsCore.ts` for tests);
  - `roomCore.ts` counters plus their buckets in `snapshot()`;
  - `partyRoom.ts` summary on end and the live gauge;
  - `index.ts`: `/stats` with bearer auth, refusal increments;
  - `wrangler.toml`: the binding, a migration tag `v2` for `RelayStats`, and the `STATS_TOKEN` secret.
- **Admin:**
  - `app/api/admin/party-stats/route.ts` and `lib/analytics/relayStatsAdmin.ts` (loader + 60 s cache);
  - "Health" block in FriendsSection;
  - "Parties now" on LivePanel.
- **Sponsor:**
  - `SPONSOR_METRICS` += `social` and `emotes` (sponsor.ts, sponsorLabels.ts, SponsorOverview.tsx);
  - the weekly Sponsor report view, its CSV and print CSS;
  - `PARTY_SINCE`.
- **P1 client ids:** `em:dance_*`, `em:show_*`, `em:react_*`, `em:hf_*`, `em:streak`, `em:cam`, `em:seen` (townBridge
  `onEmoteSeen` option), `mp:lesson`, `mp:quiz`, `mp:quiz_done` (learnEvents.ts), `mp:first_*`, `mp:name_bad`, `mp:ping_*`.
- **Tests:**
  - `tests/mp-relay-stats.cjs`: core counters, bucket edges, no code / name / IP in any stored key or value, auth on
    `/stats`, the prune alarm;
  - tests/mp-room-core.cjs extended (counters survive snapshot / restore);
  - tests/admin-sponsor.cjs extended (the two new cards and the CSV rows).
- **Policy:** §7a and §13 sentences (legal review before the sponsor report is shared externally).

### Phase C: retention and virality (≈1 agent day + legal sign-off first)

- `mp:guest_new` in Town (reads the existing `rt` mark).
- `supabase/migrations/2026xxxx_analytics_party_retention.sql`:
  - `analytics_party_retention(from,to)`, service_role only;
  - aggregates only, ≥10 per group;
  - the organic vs invited split.
- The weekly snapshot table for sponsor reach.
- `mp:rtt_*` and `mp:reconnect` (connection.ts exposes a median RTT through the store; PartyHost passes the bucket).
- `mp:min_away`.
- Tests:
  - the SQL = TypeScript check on a throwaway Postgres (the admin-sponsor.cjs pattern);
  - suppression;
  - the output has no player id column.

## 11. Risks

- **Beat pressure.** Emote-heavy sessions add 20–40 ids. The 64-id cap and carry handle it, but the busiest ids win each beat,
  so rare ids may arrive one beat later. A final hide beat drains up to `MAX_DRAIN_BEATS=2` extra. Watch for truncation in
  tests with a worst-case session.
- **Host-only histograms** undercount parties whose host tab died. Label them "approx." until the relay numbers exist.
- **Double counting.** Host and guest both emit `mp:in` and `mp:min`. That is intended: they are per-player measures. Party
  histograms are host-only by design.
- **Small populations.** Early on most party cells will show "<5" or "<10". That is correct behaviour; say so in the UI
  rather than lowering thresholds.
- **Scope creep toward profiling.** Any request for "which kids play together", per-party timelines or nick analytics must be
  refused. Section 2 is the contract, and the tests scan for it.
- **Sponsor sharing** needs the §13 wording approved before any external export. Until then the report is internal.
- **Relay singleton DO** is a hot spot only far beyond the current scale. Switch to Analytics Engine if needed (§7).
