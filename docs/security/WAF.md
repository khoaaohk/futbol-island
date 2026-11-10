# Vercel Firewall rate rules: owner checklist (Nov 10 2026)

Nothing here has been applied. Vercel → Project → Firewall → Configure → New rule. Start each rule in **Log** for about a
week, check the hits in Firewall → Overview, then switch the action. Rate limits are per IP, fixed window. The app's own
throttles (lib/saves/server.ts, lib/arcade/leaderboardServer.ts, lib/analytics/ingest.ts, lib/siteReports.ts) stay in place
behind these; the WAF stops floods before they cost a function call.

| Done | Rule name | If (path) | Method | Window | Limit / IP | Action after Log week | Source |
|---|---|---|---|---|---|---|---|
| [ ] | Visit counter | equals `/api/visit` | POST | 60 s | 10 | Rate limit → 429 | app/api/visit/route.ts:9 |
| [ ] | Save restore/check | equals `/api/save/restore` or `/api/save/check` | POST | 60 s | 60 (a class of 30 behind one school IP still works) | Rate limit → 429 | docs/save-codes.md §WAF |
| [ ] | Save create | equals `/api/save/create` | POST | 60 s | 30 | Rate limit → 429 | docs/save-codes.md |
| [ ] | Save email | equals `/api/save/email` | POST | 60 s | 5 | Rate limit → 429 | docs/save-codes.md |
| [ ] | Save sync/delete | starts with `/api/save/` | POST | 60 s | 120 | Rate limit → 429 | docs/save-codes.md |
| [ ] | Save methods | starts with `/api/save/`, except `/api/save/status` | not POST | n/a | n/a | Deny | docs/save-codes.md |
| [ ] | Arcade boards | starts with `/api/arcade-board/` | any | 60 s | 30 | Rate limit → 429 | app/api/arcade-board/[action]/route.ts:8 |
| [ ] | Admin sign-in | equals `/api/admin/login` | POST | 60 s | 10 | Rate limit → 429 | new (lib/analytics/adminAuth.ts lockout) |
| [ ] | CSP reports | equals `/api/csp-report` | POST | 60 s | 30 | Rate limit → 429 | new (app/api/csp-report) |
| [ ] | Error beacon | equals `/api/error-report` | POST | 60 s | 10 | Rate limit → 429 | new (app/api/error-report; the page sends at most 3 a tab) |

Notes
- Under Attack Mode or bot protection, treat every `/api/*` route the same; do not exempt `/api/save/*`.
- `/api/arcade-board/top` is a cached GET (s-maxage 20); the 30/min limit covers `start` and `submit` floods.
- WAF rate limiting is billed per allowed request (cents at our volume).
- After switching a rule to Rate limit, watch /admin → Players and retention → save health for a jump in "busy" answers from
  schools; raise the restore/check limit before lowering anything else.
