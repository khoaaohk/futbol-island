# Save codes: setup and operations (Oct 10 2026)

Built from [accounts-design.md](accounts-design.md) (phase 1 + phase 2a). A player taps **Get my code** and gets three football
words plus a number (`striker · volley · corner · 427`). Typing the code on any device loads that island. We keep no name,
email, IP or the code itself: only `HMAC-SHA256(SAVE_CODE_PEPPER, "v1:" + code)` and the allowlisted progress.

**A code is required before playing (user decision, Oct 9 2026).** New players make or type one in the welcome (no Skip past
it); players who already have an island but no code are asked on the island's start until they have one (their island is
saved as it is). If saving is down or busy: "Saving is taking a break — you can still play today", and they're asked again on
a later visit. After a grown-up deletes a save (ParentGate), that device isn't asked again.

**Nothing changes for players until all of steps 1–3 are done.** Before that, `/api/save/status` answers `{saving:false}`,
the welcome has no save step or "I have a save code" link, and Settings says "Saving isn't ready yet — you can still play".
The grown-up email option stays hidden until step 4 is done too.

## Setup, in order

1. **Supabase Pro (recommended before launch).** Free has no backups and pauses idle projects; saves are data kids care about.
   Pro's daily backups roll off after 7 days, which is what the privacy page promises.
2. **Run the migration.** Supabase → SQL editor → paste all of `supabase/migrations/20261010_game_saves.sql` → Run.
   The **last result row must read `OK, game saves installed`**. Anything starting `NOT INSTALLED:` names what is missing; the
   file is safe to run again (it only creates things that don't exist yet).
3. **Add the env vars** in Vercel → Project → Settings → Environment Variables (Production, and Preview if you want to test
   there). Names only here:
   - `SAVE_CODE_PEPPER`: a long random secret, at least 32 characters. Make one with `openssl rand -base64 48`. Keep it out of
     Supabase, chat and the repo. **Never change it casually**: every code is hashed with it (see "Rotating the pepper").
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: already set for the analytics; the saves reuse them.
   - `CRON_SECRET`: already set; the nightly `/api/cron/analytics` now also purges old saves.
4. **"Send my code to a grown-up" (optional).**
   1. Create a free account at resend.com.
   2. Resend → Domains → Add domain → `futbolisland.app` (pick the region closest to your players).
   3. Resend shows DNS records (an MX and a TXT/SPF record on a `send` subdomain, a DKIM TXT record such as
      `resend._domainkey`, and optionally a DMARC TXT on `_dmarc`). Add each one in **Vercel → Domains → futbolisland.app →
      DNS Records** (Type, Name, Value exactly as Resend shows them; leave TTL at the default). Don't change existing records.
   4. Back in Resend press **Verify** (DNS can take minutes to hours). Turn **open tracking and click tracking OFF** for the
      domain (Resend → Domains → the domain → Configuration). The game sends plain text with no links, but keep both off.
   5. Resend → API Keys → create a key with **Sending access** only, limited to `futbolisland.app`.
   6. In Vercel add `RESEND_API_KEY` (that key) and `SAVE_EMAIL_FROM`, e.g. `Futbol Island <codes@futbolisland.app>`.
5. **Push** (a push to `main` deploys to production). Then open `/admin`: the line under the dates reads
   `Save codes: table installed · pepper set · grown-up email on · N saves`.
6. Before launch: add the operator's privacy contact address in `app/privacy/page.tsx` (`PRIVACY_CONTACT`), and have a privacy
   lawyer review the items marked [LAWYER] in accounts-design.md §6 (including the email wording in
   `components/saves/SaveActions.tsx` and `lib/saves/email.ts`).

Local testing: `SAVE_LOCAL_FILE=/some/file.json` (a JSON-file store, ignored on Vercel), `SAVE_CODE_PEPPER=…`, and
`SAVE_EMAIL_LOG=1` (prints the email with the code masked and never the address; ignored on Vercel).

## How it works

| Piece | File |
|---|---|
| Words (1,024, unique first 4 letters, pictures) | `lib/saves/words.ts` |
| Code making, forgiving parsing, rude-pair check | `lib/saves/code.ts` |
| Allowlist, coach-plan text stripping, apply, 7-day backup | `lib/saves/snapshot.ts` |
| Wallet compaction before upload (balances exact) | `lib/saves/walletCompact.ts` |
| API handler (hashing, throttles, identical answers) | `lib/saves/server.ts`, `app/api/save/[route]/route.ts`, `app/api/save/status/route.ts` |
| Storage (Supabase over PostgREST; memory twin) | `lib/saves/store.ts`, `supabase/migrations/20261010_game_saves.sql` |
| Email (Resend over fetch; log mode) | `lib/saves/email.ts` |
| Browser client and boot/hide/milestone sync | `lib/saves/client.ts`, `components/saves/SaveSync.tsx` |
| UI | `components/saves/*`, the welcome (`IslandOnboarding.tsx`), Settings, For grown-ups, `/privacy` |
| Tests | `tests/game-saves.cjs` (part of `npm test`) |

- **What syncs:** only the keys in `SYNC_KEYS` (accounts-design §4.1 table A) plus `fi2-arcade-record-<game>-v1`. Device
  settings, session and dev keys never leave the device. Coach-plan notes and the "strength" text stay on the device; the plan's
  focus, review ticks and reflection tags travel.
- **When:** one `check` on start (only on a device with a code), a save when the tab hides (keepalive, ≤ 64 KB gzip), and after
  milestones the stores already announce, at most once per 2 minutes. No timers, polling or loops. Each trigger first compares
  an FNV-1a hash of the snapshot with the last saved one and sends nothing when it matches.
- **Two devices:** the server keeps `rev`; a save sends `baseRev`. If the server is newer and this device changed nothing, the
  newer island loads quietly (one reload behind the loading screen). If both changed: "Which island do you want?". The island
  not chosen is kept on the device for 7 days ("Undo swap" in Settings).
- **Wallet compaction:** only the uploaded copy is compacted. Receipts older than 90 days that can never be paid again (random
  arcade-run ids, past `daily-play:` days, puzzle runs whose attempt id stays in `attempts`, arcade play fees) are folded into
  ordinary receipts of at most each game's cap (`fold:<game>:<n>`), so the existing sanitiser and older tabs read them as they
  are. Learning, job, market and vending receipts are kept as they are.

## Security

- The code is only ever in a POST body. The routes never log. Every code-bearing answer waits until 350 ms after the request
  began, and a wrong, unknown or throttled code all get `200 {"ok":false}`. `delete` always says `{ok:true}`; `email` says
  `{ok:true}` for an unknown code and sends nothing.
- Server limits (in SQL, shared by every instance): 10 failed tries per IP bucket per 10 minutes; past 500 failures in an hour
  site-wide only grown-up requests (after the ParentGate) from buckets with < 3 failures are looked up; past 600 nothing is.
  New saves: 60 per IP bucket per hour, 2,000 a day site-wide. Emails: 3 per IP bucket per hour, 300 a day site-wide.
  An IP bucket is `sha256(today's random salt + IP)`; salts and throttle rows are deleted nightly.
- The kid sees "That code didn't work" for misses, a grown-up check after 3 misses and "Let's take a break" after 6 in 10 minutes
  (counted on the device, mirroring the server).
- **Rotating the pepper** needs a dual-hash window: deploy code that tries the new pepper and then the old one on `check` /
  `restore` / `sync`, re-keying a row to the new hash on its first successful use; after 12 months (the retention period) remove
  the old pepper. Until that code exists, don't change `SAVE_CODE_PEPPER`: every existing code would stop working.

### Vercel WAF rules (suggested; staged, not published)

Add in Vercel → Project → Firewall → Configure → New rule. Start in **Log** mode for a week, then switch to **Rate limit /
Deny** once the logs look right.

| Rule | If | Then |
|---|---|---|
| Save restore/check | Request path is `/api/save/restore` or `/api/save/check` | Rate limit 60 requests / 60 s per IP (a class of 30 behind one school IP still works), then 429 |
| Save create | Request path is `/api/save/create` | Rate limit 30 / 60 s per IP |
| Save email | Request path is `/api/save/email` | Rate limit 5 / 60 s per IP |
| Save sync/delete | Request path starts with `/api/save/` | Rate limit 120 / 60 s per IP |
| Methods | Request path starts with `/api/save/` and method is not POST (except `/api/save/status`, GET) | Deny |

Under Attack Mode or bot protection, treat `/api/save/*` like the other `/api` routes. WAF rate limiting is billed per allowed
request (cents at our volumes).

## Retention

Saves not used for 12 months are deleted by `save_purge()` in the nightly cron. "Delete my save" deletes the row at once.
Supabase Pro backups roll off within 7 days. Throttle rows and IP salts live for at most a day.
