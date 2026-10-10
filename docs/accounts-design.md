# Saving a player's game: accounts design (research, Oct 9 2026)

Status: **research and design only.** No code, settings or data were changed. This is not legal advice: items marked
**[LAWYER]** need review by a privacy lawyer before launch.

**The question.** Before they start, how can Futbol Island players make the simplest possible "account", so their progress
survives a cleared browser and can move to another device? Players are children (7v7 age and up, so many are under 13).

**User decisions (Oct 9 2026), built in phase 1 + 2a ([save-codes.md](save-codes.md)):** every recommended default below
(3 words + a 3-digit number with a picture per word where one exists, 12-month deletion, coach-plan text stays on the device,
the "Which island do you want?" chooser, a `/privacy` page), plus phase 2a "Send my code to a grown-up". Phase 2b (grown-up
accounts) is not built; `guardian_id` stays reserved.

**User decision, Oct 9 2026: a save code is REQUIRED before playing** ("We don't want them to play and then figure that out
later"). This replaces the "skippable, Not now" step in §3.1 and the ICO standard 13 note in §6.1 (Not now as an equal
choice); flag it for the privacy review [LAWYER].
- New players can't reach the island from the welcome without making or typing a code: the save step has no "Not now", no
  Next and no Skip until a code exists, and the welcome's Skip leads to the code step instead of past it.
- Players who already have progress but no code are asked once per visit, on the island's start, until they have one; "Get my
  code" saves their island as it is, so nothing is lost.
- Saving is never a lock: if it isn't set up, is down or is busy, the game says "Saving is taking a break — you can still play
  today", lets them play, and asks again on a later visit.
- A grown-up who deletes the save (behind the ParentGate) is respected: that device is not asked again until a code is made
  or typed there.

---

## 1. Recommendation

**Build a save code: three easy football words plus a number, for example `striker · volley · corner · 427`. Do not
collect a name, email, age, birthday or password.** The game makes the code, and progress is stored on our server under a
keyed hash of it. Typing the code on any device loads that island.

Then, as an optional phase 2, add **"Send my code to a grown-up"**: a single email that is never stored (see §2, option 6).
A full parent account (an attached email, verified parental consent) waits for the coaches' IDP **P1 guardian links**, which
need it anyway, and the save design leaves room for it (`guardian_id`).

Why this one:

- **It is the simplest for kids.** It takes one tap to make ("Get my code") and three words plus a number to restore. Kids
  never type their own details, and there is no password to forget, only a code to photograph or print.
- **It is the simplest legally.** No child or parent contact information is collected, so there is no direct notice and no
  verifiable parental consent flow. COPPA defines personal information as things like a name, contact details, photos, voice,
  geolocation and "a persistent identifier that can be used to recognize a user over time and across different websites or
  online services". A random code that works only on our site, used only to load the player's own progress, fits at most the
  **support-for-internal-operations exception** (§312.5(c)(7): authenticating users and personalising content).
  - Since the 2025 amendments, an operator relying on that exception must say in its online notice which internal operations
    the identifier is used for, and how it is kept from other uses.
  - **[LAWYER]** Confirm this reading. Under GDPR / UK GDPR a pseudonymous code plus progress is probably still personal data,
    but it can be minimal, low-risk and deletable (§6).
- **It is the simplest to build on our stack.** It needs one Supabase table locked down like the analytics tables (RLS on,
  no policies, server-only service key), four small API routes, one onboarding step and a Settings card. That is about
  **8 developer days** (§7).
- **It costs almost nothing:** about **$1 a month extra at 10k players and about $5 at 100k**, on top of the Supabase Pro plan
  the cost model already budgets from 10k players (§7).
- **The real players do something similar.** Most children's products avoid child emails and passwords:
  - Khan Academy Kids, ABCmouse, Duolingo ABC and PBS KIDS put a *parent* email (or none) at the top.
  - Epic and ClassDojo log kids in with class codes and QR codes, and Clever Badges are QR codes for K–2.
  - Toca Boca keeps saves on the device, with no cross-device sync outside Apple Arcade / iCloud.
  - A code-only save has no parent account, which keeps us under the email-collection threshold (§2, option 2).

**The trade-off we accept.** A lost code cannot be recovered by us, because we know nothing about the player. We reduce the
risk with a printable code card, "take a photo" prompts, the code always visible in Settings on any device already linked,
and phase 2's one-time email to a grown-up.

---

## 2. Options compared

Scores: ✅ good · ⚠️ workable with care · ❌ poor.

| | 1. Save code | 2. Parent email magic link | 3. Apple / Google (parent) | 4. Username + picture password | 5. Export file / QR | 6. Hybrid: code, then a grown-up's email |
|---|---|---|---|---|---|---|
| Kid steps to make it | 1 tap, then photo/print | Find a grown-up, type an email, wait for the email | Grown-up signs in on the kid's device | Pick a name and 3 pictures | Tap Export, then find the file later | Same as 1; email is optional |
| Reading level | 3 short words + a number | Needs an adult | Needs an adult | Easy | Hard (files) | Same as 1 |
| Lost login | ❌ gone unless photographed or printed | ✅ new link by email | ✅ provider recovery | ⚠️ reset needs an adult channel we don't have | ❌ file lost = save lost | ✅ once an email is attached |
| Parent involvement | None needed | Required every new device | Required | None | None | Optional |
| Personal info collected | None (code ≈ internal-operations id) | Parent email = online contact information | Email + provider id; SDK data to a third party | Username (PI only if it works as contact info, but kids type real names) | None | Email only if a parent opts in |
| Verifiable parental consent | Not needed **[LAWYER]** | Direct notice + VPC ("email plus" OK for internal use only) | Same as 2; OAuth is not VPC by itself | Not needed if usernames are moderated | Not needed | Only for the opt-in part |
| Brute force / enumeration | ⚠️ fine with 40 bits + limits (§5) | ✅ | ✅ | ❌ about 500 picture combos per name; names can be enumerated | ✅ none | ⚠️ as 1 |
| Build effort | ~8 days | ~12–15 days + email provider + legal | ~15 days + Apple $99/yr + legal | ~10 days + moderation | ~2 days | 8 + ~4 days |
| Running cost at 100k | ≈ $5/mo | + email ($0–20/mo) | ≈ $5/mo | ≈ $5/mo | $0 | ≈ $5–25/mo |

### Option 1: Save code (recommended)

How it works:
- The server makes the code from a curated list of 1,024 easy words and a number from 100 to 999. (Oct 10 2026: replaced by 781 easier words and a number from 1000 to 9999, about 42.0 bits; old codes still restore. See lib/saves/words.ts.)
- It stores only `HMAC-SHA256(pepper, normalised code)` with the save.
- Restoring means typing the code. The words autocomplete after 3 letters, and the number uses a number pad.

What it needs:
- Kid UX: one screen to get the code, one to restore. It suits a 7-year-old who has a grown-up nearby to photograph the code.
- Legal: see §1 and §6.
- Security: about 39.8 bits plus server and WAF limits; worked through in §5.
- Building it: words, endpoints, table, UI and sync (§7).
- The best precedent is class codes and QR badges in schools, where a short code reaches a profile without a child email.

### Option 2: Parent email magic link

- **What COPPA asks.**
  - Asking a child for a parent's email is allowed by the **§312.5(c)(1)** exception, but only to give the parent **direct
    notice** and obtain consent. If consent is not obtained within a reasonable time, the email must be deleted.
  - After consent, the email is stored online contact information linked to the child's record. That brings a written
    **data retention policy** (§312.10: purposes, business need, deletion timeframe, published in the notice), a written
    **information security program** (§312.8, new in 2025), and parental rights to review and delete.
  - The "**email plus**" consent method is allowed only when the operator does not disclose children's information to third
    parties. It must add a confirming step, such as a delayed confirmatory email, or a letter or phone call. The 2025 Rule
    adds an equivalent **text-message** method.
- **Compliance date.** The amended Rule was effective on June 23 2025, and compliance has been required since **April 22
  2026**. The FTC enforces it now.
- **Kid UX.** It is worst for the youngest players. The child has to find a grown-up, the grown-up has to check email, and the
  login lives in the parent's inbox, so every new device needs a parent. That is how Khan Academy (under 13) and Scratch
  (under 16) work, and both are built around a parent account.
- **Cost.** Supabase Auth's built-in email is rate-limited for production, so we would need custom SMTP (Resend, Postmark,
  SES), at about $0–20 a month at our volumes.
- **Verdict.** It is too heavy as the *first* step. It is the right tool for P1 guardian links.

### Option 3: Sign in with Apple / Google (for a parent)

- Pros: no passwords to build, and strong recovery.
- Cons:
  - The parent's account (email and provider id) is personal information, so the consent duties are the same as option 2.
  - The parent has to sign in *on the child's device*, which leaves a parent session on a child's tablet.
  - Google's SDK sends device data to a third party. **App Store Kids Category (1.3)** says kids apps "may not send
    personally identifiable information or device information to third parties". **5.1.4** limits kids' apps to asking for
    birthdate and parental contact only to comply with the law.
  - **4.8** means offering Google login in an iOS app also requires an equivalent privacy-preserving option, in practice Sign
    in with Apple.
  - **5.1.1(v)** says any app that creates accounts must offer account deletion in the app.
- Verdict: it adds third parties and Apple developer setup, and is not simpler. If parent accounts arrive (P1), offer
  magic-link email first and Sign in with Apple second, and never put them in the kid flow.

### Option 4: Username + picture password

- Usernames are personal information under COPPA only when they work as online contact information. But kids type their
  real names, so we would need a moderated or generated username, as PBS KIDS does.
- The security is weak:
  - 3 ordered pictures out of 9 is 504 combinations, which a script can try per username in minutes.
  - "Name taken" answers let an attacker enumerate usernames.
- A *generated* username plus picture password is just option 1 split in two, with less entropy.
- Pictures are still a good idea, as a **memory aid on the save code's words** (an icon beside each word, §3), not as the
  secret.

### Option 5: Device only, with an export/import file or QR

- No server and no personal information at all.
- But:
  - A save is about 10–250 KB of JSON (§4.1), and a QR code holds at most about 3 KB, so one QR cannot hold a save.
  - Files on iPad Safari and Chromebooks are confusing for kids and easy to lose.
  - Nothing syncs between devices.
- Keep it as a **free extra for grown-ups**: "Download a backup file" in For grown-ups (~1–2 days, reusing the print/export
  pattern in `lib/grownups/`).

### Option 6: Hybrid (recommended path)

- **Phase 1** is option 1.
- **Phase 2a: "Send my code to a grown-up".** A grown-up passes the existing ParentGate, types an email, and we send *one*
  email with the code and printable card, then **discard the address straight away**: it is never stored or logged.
  - This is close to COPPA's §312.5(c)(3) one-time-response exception, but the email goes to the parent rather than the
    child. **[LAWYER]** Confirm (c)(3) or (c)(2) covers it.
  - It costs an email provider and about 2 days.
- **Phase 2b: "Add a grown-up to this save".** This is the IDP P1 guardian account:
  - Supabase Auth magic link for the parent, with direct notice and email-plus consent.
  - `guardian_id` on the save, so a lost code can be recovered by signing in as the guardian.
  - The same guardian record later carries coach sharing for the IDP.
  - **[LAWYER]** The full COPPA / GDPR-K consent flow.

### What kids' learning products do (sources at the end)

| Product | How a child gets in | Child email? | Notes |
|---|---|---|---|
| Khan Academy Kids | Parent account (email + password) with child profiles | No | Child profiles can't take an email or full name |
| Khan Academy (under 13) | The child gives a parent email, or the parent adds the child | No | Parent completes setup |
| Scratch | Under-16 sign-up asks for a parent email to confirm | No | Unconfirmed accounts can save but can't share or comment |
| Duolingo ABC | Parent email for consent and updates; parent-only settings screen can delete data | No | Progress syncs across devices |
| PBS KIDS | Account optional; "save progress" is the reason to make one; moderated usernames; parent email for parent features | No | Nothing that identifies a child on its own |
| ABCmouse | Parent account credentials on each tablet | No | |
| Prodigy | Teacher-made student username/password or parent "Add child" | No | School SSO (Google / Clever) also used |
| Epic | Class code, then pick a profile | No | Class code never changes |
| ClassDojo / Clever Badges | Printed QR code per student | No | Clever Badges are designed for K–2 |
| Minecraft Education | School-managed Microsoft 365 account | School account | Accounts can't be self-made |
| Toca Boca | No account for progress; saves stay on the device | No | Cross-device only through Apple Arcade / iCloud |

The pattern: **children never hold an email-and-password identity**. A grown-up holds it, or the child holds a code or
badge. Our save code is the badge pattern without a school in between.

---

## 3. Kid flow, screen by screen

It fits `components/IslandOnboarding.tsx` (today: welcome / pick player → paths → balls → earn → learn → Explore). Every new
screen uses the existing modal shell, `NavigationButton`, `BackButton` and the Skip control.

### 3.1 First run

**Step 0: Welcome / pick your player (existing), plus one link**
- Below the character toggle add a quiet secondary button: **"I have a save code"**. It opens Restore (§3.3).
- This has to be on the very first screen: a returning player on a new device sees onboarding first.

**Step 1 (new): Save your island.** It comes right after picking a player, before the tour, as asked.
- Eyebrow: `KEEP YOUR GAME SAFE`
- Title: **Save your island**
- Copy: *"Get a secret save code. Use it on another phone or tablet to keep your coins, cards and lessons."*
- Note (icon: lock): *"No name or email. Just a code."*
- Buttons: **Get my code** (primary) · **Not now** (secondary; it goes to the next step, and play is never blocked). Skip in
  the header works as before.
- Offline or server error: *"We can't make a code right now. You can get one later in Settings."* Then Next.

**Step 1b (new): Your save code** (only after "Get my code")
- Title: **Your secret code**
- The code is shown big, as four tiles: `striker` `volley` `corner` `427`. Each word tile has its small picture, to help kids
  who read slowly.
- Copy: *"This code opens your island. Show it to a grown-up. Take a photo or write it down. Don't share it with friends."*
- Buttons: **Print a code card** (opens the print sheet, §3.4) · **I saved it** (primary).
- Optional memory check (keep it light, no failing): *"Which word comes first?"* with three word tiles. A wrong tap just
  highlights the right one.
- Then the existing steps continue: paths → balls → earn → learn → **Explore**.

`finishIslandOnboarding` is unchanged. Skipping onboarding skips the save step too; the Settings card and a gentle nudge
cover it later.

**A later nudge** (no guilt, one time only, fits `docs/daily-play.md`'s no-pressure rule)
- When a player *without* a code earns their first card or graduates their first lesson, the welcome-back note area shows
  once: *"Want to keep this? Get a save code in Settings."*
- It never repeats or nags, and there is no streak or loss language.

### 3.2 Settings → "My save code" card

This is a new section in `components/IslandSettings.tsx`, above Support.

With a code:
- Shows `striker · ••• · ••• · •••` and a **Show** button (it stops a friend reading it over a shoulder).
- Status line: *"Saved ✓"*, *"Saving…"* or *"Not saved yet. We'll try again."*
- Buttons:
  - **Show my code**
  - **Print a code card**
  - **Use a different code** (opens Restore)
  - **Delete my save** (behind ParentGate, §4.7)

Without a code: **Get my code** and **I have a save code**.

### 3.3 Restore ("I have a save code")

- **Screen R1.** Title **Type your save code**. Three word boxes and one number box.
  - Each word box autocompletes from the word list: after 3 letters the matching tiles appear with pictures, and a tap fills
    the word.
  - Input is forgiving: any case, spaces or hyphens, and a known typo snaps to the nearest list word.
  - The number box opens a number pad.
  - Button: **Load my island**.
- **If this device already has progress:** *"This device has an island too. Loading your code will swap it."* Buttons:
  **Load my code's island** · **Keep this one**.
  - The replaced local save is kept as a single on-device backup for 7 days: Settings shows "Undo swap".
- **Success R2.** *"Welcome back!"* with a summary computed by the existing grown-ups summary code from the downloaded save:
  "🪙 1,240 coins · 36 cards · 12 lessons". Button **Play** reloads the page so every store re-reads the save.
- **Wrong code:** *"That code didn't work. Check each word and try again."* The message is the same whether or not the code
  exists.
- **Too many tries:** *"Let's take a break. Ask a grown-up to help, then try again in 10 minutes."*

### 3.4 What a parent sees

- **For grown-ups → "Saving progress"** (new card):
  - What the code is, and that we hold no name or email.
  - What is saved, and what is not (§4).
  - The 12-month inactivity deletion.
  - Buttons:
    - **Print code card**
    - **Download a backup file** (option 5, optional)
    - **Delete this save**
    - Phase 2: **Send the code to my email** (one-time, not stored)
- **The printable code card.** This reuses the self-contained print path in `lib/grownups/printHtml.ts`: no scripts or
  network, printed from a hidden iframe.
  - It shows the four tiles, their pictures and *"Futbol Island save code. Keep it safe, like a key."*
  - Optional QR code: `https://futbolisland.app/#save=striker-volley-corner-427`. The **fragment** is never sent to the
    server or logs; opening it pre-fills Restore and still asks "Load my island?".
  - A QR library would add about 10 KB; lazy-load it only for printing.
- **Privacy copy updates** are in §6.2.

---

## 4. Data model and sync

### 4.1 Every save key today

These were found by scanning every `localStorage` / `sessionStorage` call and key constant in `app/`, `lib/` and `components/`.
`lib/dev/unlockAll.ts` already defines `SAVE_KEY_PATTERN = /^(fi2-|fi-|fi\.|futbol-island)/` for its reset, so a snapshot can
reuse that prefix rule **with an explicit allowlist** (below) instead of copying by prefix. Many `fi2-*` strings in the code
are DOM event names (`fi2-path-cue`, `fi2-card-added`, `fi2-vending-cue` and so on), not storage.

**A. Progress: synced** (localStorage)

| Area | Keys |
|---|---|
| Character & onboarding | `futbol-island-customization-v1` (character, skin tone choice, kit, costume; no name), `fi2-welcome-v1` |
| Lessons & quizzes | `futbol-island-quiz-progress-v1`, `futbol-island-quiz-growth-v1` (migration marker; must travel with quiz progress), `futbol-island2.progress.v1` (legacy scores), `fi2-quiz-runs-v1` (paused quizzes, max 24), `fi2-lesson-review-v1`, `fi2-football-learning-v1`, `fi2-lesson-format-v1`, `fi2-path-format-v1`, `fi2-path-last-opened-v1`, `fi2-optional-path-stories-v1`, `fi2-life-paths-v1`, `fi2-graduations-v1` |
| Exploration | `futbol-island-quests-v1`, `fi2-passport-v1`, `fi2-club-stories-v1`, `fi2-matchday-coins-v1` (ball hunt), `fi2-explore-activity-v1`, `fi2-east-pier-challenge-v1`, `fi2-fuel-v1`, `fi2-museum-visits-v1` (the museum passport: exhibits stepped inside and finished; Oct 9 2026) |
| Coins & items | `fi2-arcade-wallet-v1` (the coin ledger: runs, spends, packs), `fi2-vending-v1`, `fi2-backpack-v1`, `fi2-home-decor-v1`, `fi2-ride-unlocks-v1`, `fi2-ride-unlock-announced-v1`, `fi2-costume-milestone-v1` |
| Cards & books | `fi2-player-cards-v1`, `fi2-card-offers-v1`, `fi2-card-trade-v1`, `fi2-binder-layout-v1`, `fi2-player-books-v1`, `fi2-book-checks-v1`, `fi2-book-checks-answered-v1` |
| Jobs, fishing, food | `fi2-island-jobs-v1`, `fi2-garden-v1`, `fi2-market-v1`, `fi2-fishbook-v1`, `fi2-konbini-v1`, `fi2-konbini-collection-v1`, `fi2-konbini-ball-v1` |
| Arcade | `fi2-arcade-record-<game>-v1` (one per game), `fi2-strikers-stars-v1`, `fi2-strikers-cup-v1`, `fi2-strikers-shape-v1`, `fi2-runner-missions-v1`, `fi2-tennis-stars-v1`, `fi2-pinball-stars-v1`, `fi2-pass-puzzles-v1`, `fi.game.runner.best` |
| Grown-ups & IDP | `fi2-grownups-format-v1`, `fi2-idp-plan-v1` **with free text removed** (see §4.6), `fi2-idp-v2` (IDP v2, Oct 9 2026: ids, dates and picture choices only; no text field exists; docs/idp/DESIGN.md §5) |

**B. Device preferences: not synced** (each device keeps its own)

`fi2-music-enabled`, `fi2-music-volume`, `fi2-sound-muted`, `fi2-sound-volume`, `fi2-audio-mix`, `fi2-voice-enabled`,
`fi2-coach-voice`, `fi2-controls-flipped`, `fi2-battery-saver`, `fi2-time-of-day`, `fi2-cards-field-v1`, `fi-card-dots`,
`fi2-last-visit-day-v1` (welcome-back is per device), `fi2-bottle-open-date`, `fi2-idp-text-v1` (IDP v2 typed notes and the
strength words: child free text never leaves the device; Oct 9 2026), `fi2-coach-plays-v1` (Coaches Board plays: user decision Oct 9 2026, play names are typed text; coaches move plays between devices with the board's share link).

**C. Never synced**

- Session-only: `fi2-parent-gate-lock-v1`, `fi2-arcade-departure-v1`, `fi-card-back-tab`, `fi2-dev-unlock-toast`, and the
  analytics `fi-visit` / `fi-visit-off`.
- Developer-only: `fi2-cards-dev-v1`, `fi2-cards-dev-progress-v1`, `fi2-card-trade-dev-v1`, `fi2-ride-dev-paths-v1`,
  `fi2-path-art-source`.

**What already helps:**
- Most stores carry a `version` field and a sanitiser (`sanitizeArcadeWallet`, `sanitizeKonbini`, `sanitizeFishbook` and so
  on), so a restored save is validated by the same code that reads local saves.
- Quiz growth is a precedent for migrations (`migrateQuizGrowth`).
- `welcomeBack.ts` has `hasSavedProgress`, and `lib/grownups/progress.ts` builds a summary from raw saves through a storage
  port, which is reusable for the restore preview.
- The arcade wallet already has `merge()` keyed by run id, used across tabs.

**Size estimate.** This is estimated from the data shapes and has not been measured; measure it in build step 1.

| Part | Size |
|---|---|
| Quiz answers, all 486 questions in 96 lessons | 12.5 KB (computed from `quizManifest.json`) |
| Full card binder (~450 names) | ~7 KB |
| Lesson review records | ~10–15 KB |
| Everything else (fishbook 56 species, jobs, konbini, books, passport, IDP and more) | ~10–20 KB |
| Arcade wallet ledger | **No size cap.** Every coin credit and spend is a receipt of ~100–130 B; at 10–20 a play day that is ~1–2.5 KB a day |

| Player | Raw JSON | gzip |
|---|---|---|
| New player | < 2 KB | |
| Typical month-1 player | ~10–30 KB | |
| Completionist after a year (~70 play days) | ~150–250 KB, mostly the wallet | ~30–50 KB |

Recommendation: before sync, add wallet compaction. Fold receipts older than 90 days into one per-game total plus the ids
that still prevent double credit.

**Limits.**
- Cap a save at **512 KB raw / 128 KB gzip**. The server rejects anything bigger and the client shows "Can't save, ask a
  grown-up". That is far under localStorage's ~5 MB.
- `fetch(..., {keepalive:true})` and `sendBeacon` allow only **64 KB** a request, so the client gzips with the built-in
  `CompressionStream` (Safari 16.4+, Chrome, Firefox).
- If the gzip is still over 64 KB, the save is sent while visible, not on page hide.

### 4.2 Snapshot format

```json
{ "format": 1,                // snapshot envelope version
  "game": "2026-10-09",       // build/day of the client that wrote it (debug only)
  "keys": { "fi2-player-cards-v1": "[\"Marta\",…]", "…": "…" } }  // raw localStorage strings, allowlisted keys only
```

- The values are the raw strings, so each store's own `version` and sanitiser stay the source of truth.
- If the envelope `format` ever changes, the server keeps a converter. Old clients that see a newer `format` show "Please
  refresh to get the latest island" and never overwrite.

### 4.3 When it saves (heat-safe: no polling, no loops)

- **A dirty check.** On each trigger, the client builds the snapshot string and compares a cheap hash (FNV-1a) with the last
  synced hash. If nothing changed, it sends nothing.
- **Triggers:**
  1. `visibilitychange` to hidden, and `pagehide`, with keepalive.
  2. After milestone events the stores already dispatch (lesson complete, graduation, purchase, card added), debounced to at
     most one save every 2 minutes while visible.
  3. On boot, one small `check` request: does the server have a newer revision?
- **Expected traffic:** about 1 check plus 1–3 saves a visit. The model below uses 3 calls a visit.
- **Phone cost:** no work while playing. `JSON.stringify` of ~50 KB plus gzip takes a few ms, only at those moments.

### 4.4 Two devices (conflicts)

The server keeps an integer `rev`. Every save sends `base_rev`.

- **Boot `check`, server rev newer, no unsynced local changes:** the client takes the server copy quietly (it applies the
  copy and reloads once, before the island renders, behind the existing loading screen).
- **Boot `check`, server rev newer, local changes too** (two devices played offline): show one kid screen, **"Which island do
  you want?"**, with two summary cards ("This tablet: 1,240 coins · 36 cards" / "Saved island: 980 coins · 41 cards") and
  the buttons **Keep this one** / **Use the saved one**. The one not chosen is kept as the 7-day on-device backup.
- **A save with an old `base_rev`** returns `409` with the server rev, and the client runs the same rule.
- **Phase 2 (optional): automatic merge per key.**
  - Union for sets (cards, quiz answers, passport, fishbook, found balls).
  - Max for records and stars.
  - The ledger merge already written for the wallet (receipts keyed by id, so coins are never duplicated or lost).
  - This removes the chooser in most cases. It is not needed for v1.

### 4.5 Supabase tables and RLS

This follows `supabase/migrations/20261007_analytics.sql`:
- RLS is on with **no policies**.
- `anon` and `authenticated` get no grants.
- Only the server, with `SUPABASE_SERVICE_ROLE_KEY`, can reach the data, through `security definer` functions that do each
  step atomically.

```sql
create table public.game_saves (
  id             uuid primary key default gen_random_uuid(),
  code_hash      bytea not null unique,              -- HMAC-SHA256(SAVE_CODE_PEPPER, normalised code); 32 bytes
  code_version   smallint not null default 1,        -- word-list version (lists only ever grow)
  snapshot       jsonb not null,                     -- §4.2 envelope, allowlisted keys only
  snapshot_bytes integer not null check (snapshot_bytes <= 524288),
  rev            integer not null default 1,
  created_on     date not null default current_date, -- day granularity only
  last_used_on   date not null default current_date, -- drives the 12-month deletion
  guardian_id    uuid null                           -- phase 2b (IDP P1); null for every save in phase 1
);
alter table public.game_saves enable row level security;
revoke all on public.game_saves from anon, authenticated;

create table public.save_throttle (                  -- failed-restore counters; purged nightly
  bucket   text not null,                            -- 'ip:'||hmac(daily salt, ip)  or  'global'
  window   timestamptz not null,                     -- 10-minute window start
  failures integer not null default 0,
  primary key (bucket, window)
);
alter table public.save_throttle enable row level security;
revoke all on public.save_throttle from anon, authenticated;
```

Functions (all `security definer`, callable only by `service_role`):
- `save_create(hash, snapshot)`: inserts; a unique violation (code collision) makes the route generate a new code.
- `save_check(hash)`: returns rev.
- `save_put(hash, base_rev, snapshot)`: compare-and-set; returns the new rev, or a conflict.
- `save_restore(hash, ip_bucket)`: checks the throttle, returns the snapshot or nothing, and records failures.
- `save_delete(hash)`.
- `save_purge()`: run nightly by the existing `/api/cron/analytics`, or a new cron. It deletes saves with
  `last_used_on < now() - 12 months` and throttle rows older than 1 day.

The daily IP salt reuses the analytics salt approach: random per day, deleted nightly, so throttle rows can't be linked
across days.

**API routes** (Node runtime, `no-store`, POST only, the **code only ever in the JSON body**, never in a URL, header or log):

| Route | Purpose |
|---|---|
| `POST /api/save/create` | Body: first snapshot. Returns `{code}`. |
| `POST /api/save/check` | Returns `{rev}`, or a generic "not found". |
| `POST /api/save/sync` | Body: `{code, baseRev, snapshot(gzip)}`. Returns `{rev}`, or 409 `{rev}`. |
| `POST /api/save/restore` | Returns `{rev, snapshot}`, or a generic failure. |
| `POST /api/save/delete` | Deletes the save. |

Request bodies are capped like `/api/visit`'s `readCapped`. The server re-validates each key against the allowlist, drops
unknown keys, and strips IDP free text.

### 4.6 What we never store

- Name, nickname, age, birthday, email, phone, photo, voice or location.
- IP address and user agent: only a day-salted hash, and only inside the throttle table for a day.
- The code itself: only its keyed hash. The client keeps the code in localStorage as `fi2-save-code-v1` so it can sync and
  show "My code".
- Any analytics link: the save id never appears in analytics, and analytics hashes never appear in saves.
- **Free text typed by a child.** The IDP's "My strength" (80 characters) and reflection notes (280 characters) could contain
  a name or a school.
  - In v1 the snapshot keeps the IDP's structured choices (focus, tags, review ticks), and the text stays on the device.
  - The printable report's first name is already never stored (`lib/grownups/report.ts`).
- Device preferences and session data (§4.1 B, C).

### 4.7 Deletion and retention

- **"Delete my save"** is in Settings and For grown-ups, behind ParentGate.
  - Confirm screen: *"This deletes your saved island from our server. This device keeps its game."*
  - The row is deleted immediately (hard delete), and the client removes `fi2-save-code-v1`.
- **Inactivity:** a save not used for 12 months is deleted by the nightly purge.
- **Backups.** Supabase Pro backups roll off after 7 days, so a deleted save is fully gone within 7 days. State this in the
  retention policy.
- A written **data retention policy** (purpose: let the player continue their game; need: until deleted or 12 months
  unused; timeframe: as above) is required by COPPA §312.10 if the code counts as personal information, and is good practice
  anyway (ICO standard 8).

---

## 5. Security

### 5.1 Code entropy

- The code is 3 words from a 1,024-word list (10 bits each) plus a number 100–999 (9.8 bits): **about 39.8 bits, 9.7 × 10¹¹
  codes.**
- The word list must be:
  - easy to read and say (mostly 1–2 syllables): football words, plus island words already in the game (fish, fruit, colours,
    animals);
  - unique in the first 4 letters, so autocomplete is certain;
  - free of homophones and of rude or scary words, including rude combinations: review the generated triples against a
    blocklist;
  - shown with a picture where one exists.
- The server generates codes with `crypto.randomInt`. Kids never choose them, which avoids weak codes like `goal-goal-goal-1`.

Guessing risk (an attacker types random codes):

| Saves stored | Chance one guess hits *some* save | Hits per month at the global cap (12k failed tries a day) |
|---|---|---|
| 10k | 1 in 97 million | ~0.004 |
| 100k | 1 in 9.7 million | ~0.04 (about one every 2 years) |
| 1M | 1 in 970k | ~0.4: move to 4 words or a 4-digit number (old codes keep working) |

A hit reveals only someone's game progress: no personal information. That is why ~40 bits plus limits is proportionate.
Three words plus a 2-digit number (36.5 bits) is 8× weaker; take it only if testing shows kids struggle with 3 digits.

### 5.2 Rate limits and brute force

- **Vercel WAF** (the rules staged today are log-only; publishing them is the user's step):
  - `/api/save/restore` and `/api/save/check`: **60 requests a minute per IP**. A class of 30 behind one school IP must still
    work.
  - `/api/save/create`: **30 a minute per IP**.
  - Under Attack Mode or bot protection, the save routes are treated like the other `/api` routes.
  - WAF rate limiting is about $0.50 per million allowed requests: cents here.
- **Server checks**, in `save_restore` (atomic):
  - **Per IP:** 10 failed restores per 10 minutes, then "take a break" for 10 minutes. Success resets the count.
  - **Global breaker:** more than **500 failed restores in an hour site-wide** (normal is far below that) switches restore to
    "Ask a grown-up". That needs ParentGate plus a short pause (and Vercel BotID, if enabled), until the hour rolls over.
    This caps a distributed attack at about 12k guesses a day.
- **Constant-shape responses.** A wrong code and a throttled code look the same to a script: same status, body and timing,
  with a small fixed delay. There is no "code exists" signal anywhere, including `check` and `delete`.
- **Keyed hashing.** `SAVE_CODE_PEPPER` is a Vercel env secret and is not in Supabase, so a leaked database alone can't be
  brute-forced offline. Rotating the pepper needs a dual-hash migration window; document it.
- **Creation abuse.** Per-IP and global creation caps (for example 2,000 a day site-wide) plus the 512 KB size cap stop
  storage-filling.
- **XSS exposure.** The code sits in localStorage, so any XSS could read it. Keep the existing strict content rules (no
  third-party scripts; the external links are already gated).

---

## 6. Legal checklist and grown-ups copy

### 6.1 Checklist

- [ ] **[LAWYER]** Confirm a server-generated save code, used only to load the player's own progress, is either not
  "personal information" or falls under §312.5(c)(7) support for internal operations, so it needs no parental consent.
- [ ] **[LAWYER]** COPPA online notice (privacy policy page). The 2025 rule requires naming the internal operations the
  identifier serves and how it is kept to them. Include the **written data retention policy** (§312.10) and the **written
  information security program** (§312.8).
- [ ] **[LAWYER]** GDPR / UK GDPR:
  - Lawful basis, probably contract or legitimate interests rather than consent. Article 8's age limits (13–16 by country)
    apply only to consent-based processing.
  - Pseudonymous data is still personal data, so honour erasure (the delete button) and access (the backup download).
- [ ] **ICO Age Appropriate Design Code:**
  - A short **DPIA** (standard 2).
  - High-privacy defaults: saving is opt-in, on a "Get my code" tap (standard 7).
  - Data minimisation, with no free text (standard 8).
  - No nudges: "Not now" is equal and nothing is lost by skipping (standard 13).
  - Child-friendly transparency at the point of use (standard 4).
- [ ] **[LAWYER]** Phase 2a "send the code to a grown-up, email not stored": confirm (c)(2) or (c)(3) fits, and the wording
  of that one email.
- [ ] **[LAWYER]** Phase 2b guardian accounts: direct notice, email-plus or text-plus consent (internal use only, no
  disclosure), parent review and delete, a 25-day-style deletion of unconfirmed parent emails, and EU/UK parental consent.
- [ ] **Supabase:**
  - The DPA is signed.
  - The region is chosen and the subprocessor is disclosed.
  - The project is on **Pro before launch**: Free has no backups and pauses inactive projects.
- [ ] **App Store, if it ever ships:**
  - In-app delete (5.1.1(v), already planned).
  - No third-party login or SDK in the kid flow (1.3, 5.1.4).
  - Parent-only functions behind the parental gate (the existing ParentGate).
  - If any third-party login is added for parents, offer Sign in with Apple too (4.8).
- [ ] Watch US state laws for kids (for example the California Age-Appropriate Design Code, under litigation) **[LAWYER]**.

### 6.2 Grown-ups copy changes (`components/GrownUps.tsx`, "Privacy")

The privacy list has two problems:
- It says "No accounts and no sign-up… saved only in this browser", which becomes false.
- **It still names "Vercel Web Analytics", which was removed on Oct 7 2026** (the counter is now first-party, cookie-free,
  `lib/analytics/*`). Fix this now, independent of accounts.

Proposed text:

> - **No sign-up.** We never ask a child for a name, age, email or photo.
> - **Save code (optional).** If your child taps "Get my code", the game makes a random code (three words and a number) and
>   keeps a copy of their game progress on our server: coins, cards, lessons and settings inside the game. The code is the
>   only way to open it; we can't see who it belongs to. Notes typed into the coach plan stay on this device.
> - **Keep the code safe.** Print the code card or take a photo. We can't recover a lost code.
> - **Delete any time.** "Delete this save" removes it from our server straight away (backups clear within 7 days). Saves
>   not used for 12 months are deleted automatically.
> - Without a save code, progress stays only in this browser; clearing this site's data deletes it.
> - The website counts visits with its own counter: no cookies and no personal identifiers. It never receives progress,
>   plans, notes, names or save codes.
> - No ads and no chat with other players. Printing a report or plan happens on this device.

---

## 7. Build plan, effort and cost

### 7.1 Steps (one developer; about 8 days for phase 1)

| # | Step | Days |
|---|---|---|
| 1 | Snapshot module: key allowlist (§4.1), IDP text stripping, size measurement on real saves, apply-and-reload, 7-day local backup, wallet compaction | 1.5 |
| 2 | Word list (1,024 words + pictures where we have art) and code generation; normalise and autocomplete; offensive-triple check | 1 |
| 3 | Migration (`game_saves`, `save_throttle`, functions, RLS) plus a test on throwaway Postgres like `tests/admin-analytics.cjs` | 1 |
| 4 | API routes, HMAC pepper, throttles, constant-shape responses; WAF rules staged | 1 |
| 5 | Onboarding steps 1/1b, "I have a save code", Restore R1/R2, the which-island chooser | 1.5 |
| 6 | Settings card, For grown-ups card, printable code card (reusing `printHtml`), delete flow | 1 |
| 7 | Sync triggers (hide / milestones / boot check), 409 handling, offline retries; no timers while idle | 0.5 |
| 8 | Privacy page, retention and security policies, copy; e2e on phone + tablet + a school-IP scenario | 0.5 |

Optional extras:
- Option 5 backup file: +1 day.
- Phase 2a email to a grown-up: +2 days, plus an email provider and legal review.
- Phase 2b guardian accounts with IDP P1: +4–6 days for the save side alone.
- Automatic per-key merge (§4.4): +2 days.

### 7.2 Running cost

This uses the investor cost model's assumptions (`costs/body.html`: 6 visits per player a month, server calls at $0.60 per
million plus ~$0.128 per active-CPU hour, Supabase Pro $25 from 10k players, a bigger database server from 50k). The
assumptions below are deliberately high: **every** player has a save, and each visit makes 3 save calls (1 check plus 2
saves).

| | 10k players | 100k players |
|---|---|---|
| Save calls a month (6 visits × 3) | 180k | 1.8M |
| Vercel function calls + CPU (~10 ms active each) | ~$0.20 | ~$1.75 |
| Vercel WAF rate-limit rule (if applied to every save call; restore-only would be cents) | ~$0.10 | ~$0.90 |
| Upload transfer (~30 KB gzip × 2 saves × visits) | ~3.6 GB, inside the 1 TB included | ~36 GB, inside the 1 TB included |
| Supabase rows / storage | 10k rows ≈ 0.1–0.3 GB | 100k rows ≈ 1–3 GB (a year of churned saves ≈ 3–6 GB), inside Pro's 8 GB |
| Supabase writes | ~2.5 an hour | ~1.2M updates a month (~0.5 a second average), fine on the base compute |
| Supabase plan | Pro $25 (already in the model from 10k) | Pro + the +$5 compute step from 50k (already in the model) |
| **Extra cost from saves** | **≈ $0–1 / month** | **≈ $3–6 / month** |

Watch for:
- Disk over 8 GB at about $0.125 per GB a month. That happens only at roughly 1M+ saves or with no wallet compaction.
- Phase 2 email at roughly $0–20 a month.

---

## 8. Open questions for the user

1. **Code shape.** Three words plus a **3-digit** number (recommended, about 40 bits), or plus a 2-digit number (easier, 8×
   weaker)? Do you want a picture beside each word (art for up to 1,024 words, or pictures only where we already have art)?
2. **Where the save step goes.** Right after "pick your player" (recommended), or as the last step before Explore? Either way
   it is skippable, with "I have a save code" on the first screen.
3. **Supabase Pro at launch?** It is recommended regardless of player count: Free has no backups and pauses idle projects,
   and saves are data kids care about.
4. **Retention.** Is 12 months of inactivity before deletion OK? 6 months is more minimal; 24 months is kinder to seasonal
   players.
5. **IDP notes.** Keep the coach-plan free text on the device (recommended), or sync it after a grown-up turns it on?
6. **Two devices.** Is a simple "Which island do you want?" chooser OK for v1, or do you want the automatic merge from the
   start (+2 days)?
7. **Phase 2.** Do you want "send my code to a grown-up's email" (one email, address not stored), and which email provider?
   Is there a lawyer or privacy-review budget for that and for the IDP P1 guardian accounts?
8. **Device settings.** Should volume, music, controls and battery saver stay per device (recommended), or travel with the
   save?
9. **Privacy policy page.** There is no standalone privacy policy page today, only the grown-ups section. Do you want one at
   `/privacy` (needed for the COPPA online notice and for any App Store listing)?
10. **Publishing the staged WAF rules.** Can the save routes go straight to enforce mode, rather than log-only like today's
    rules?

---

## Sources

Law and platform rules:
- COPPA Rule text, 16 CFR Part 312:
  - [§312.2 definitions](https://www.law.cornell.edu/cfr/text/16/312.2)
  - [§312.5 consent methods and exceptions](https://www.law.cornell.edu/cfr/text/16/312.5)
  - [§312.10 retention](https://www.law.cornell.edu/cfr/text/16/312.10)
- 2025 amendments, dates and internal-operations disclosure:
  - [Davis Polk](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)
  - [Latham & Watkins](https://www.lw.com/en/insights/2025/05/ftc-publishes-updates-to-coppa-rule)
  - [Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/ftc-publishes-final-coppa-rule-amendments)
  - [Lowenstein](https://www.lowenstein.com/news-insights/publications/client-alerts/ftc-finalizes-updates-to-coppa-rule-what-you-need-to-know)
  - [Mondaq](https://mondaq.com/unitedstates/privacy-protection/1771468/enforcement-begins-soon-for-significant-coppa-rule-amendments)
- [ICO Age Appropriate Design Code (PDF)](https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (1.3, 4.8, 5.1.1(v), 5.1.4)

Products:
- Khan Academy:
  - [under-13 login options](https://support.khanacademy.org/hc/en-us/articles/202487460-If-my-child-is-under-age-13-what-login-options-are-there-)
  - [Parent Quick Start](https://support.khanacademy.org/hc/articles/360040168512-Parent-Quick-Start-Guide)
- Scratch, parent email confirmation for under-16s: [Scratch forum](https://scratch.mit.edu/discuss/topic/700120)
- Duolingo ABC:
  - [Common Sense privacy evaluation](https://privacy.commonsense.org/evaluation/Duolingo-ABC---Learn-to-Read)
  - [policy provision: parent email](https://conductatlas.com/platform/duolingo/duolingo-privacy-policy/provision/CA-P-022500/parent-email-notification-of-child-privacy-practices/)
- PBS KIDS:
  - [privacy policy](https://api.pbskids.org/privacy)
  - [Common Sense review](https://privacy.commonsense.org/review/PBS-Kids)
- ABCmouse: [using an account on another tablet](https://support.abcmouse.com/hc/en-us/articles/34386902386839-Using-an-ABCmouse-Account-on-Another-Tablet)
- Prodigy: [parent progress support](https://prodigygame.com/blog/learning-progress-support)
- Epic: [student class-code login](https://support.getepic.com/hc/en-us/articles/115001263046-How-do-my-students-log-into-my-educator-classroom)
- ClassDojo: [student QR code login](https://help.classdojo.com/hc/en-us/articles/360023367251-How-Students-Can-Login-With-an-Individual-QR-Code)
- Clever Badges: [EdSurge](https://edsurge.com/news/2016-04-19-a-clever-use-of-qr-codes-to-help-students-log-in)
- Minecraft Education: [sign-in requires a school account](https://learn.microsoft.com/en-us/training/modules/minecraft-intro-game-based-learning/download-sign-in)
- Toca Boca (Sago Mini help): [moving progress between devices](https://help.sagomini.com/article/761-can-i-transfer-my-toca-boca-jr-classics-progress-from-one-device-to-another)

Pricing:
- Vercel:
  - [pricing](https://vercel.com/pricing)
  - [WAF rate limiting](https://vercel.com/docs/vercel-waf/rate-limiting)
- Supabase:
  - [pricing](https://supabase.com/pricing)
  - [2026 summary](https://makerkit.dev/blog/saas/supabase-pricing)

Some product facts come from vendor help pages that blocked automated reading (Khan Academy, ABCmouse). Their summaries were
taken from search snippets, so re-check them before quoting them publicly.
