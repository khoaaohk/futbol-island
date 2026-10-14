# Arcade leaderboards (Oct 12 2026, local, not deployed)

Every arcade machine has high-score boards. Learning purpose: each board ranks the skill its game teaches, and the
"New high score!" screen says how the score was made (Strikers counts passes as well as goals; Pass Puzzles counts stars,
one per pass the child learned to see).

## What a player sees

- **Game over → "New high score!"** when the score makes a top 10: the island's board this week, the island's all-time
  board, or this device's board. Otherwise nothing extra appears.
- **Three letters on arcade wheels** (▲ / ▼, a vertical drag on the letter, or typing on a keyboard), plus an optional
  picture from 12 fixed animals and symbols. No text field exists. The last letters and picture are remembered on the device.
- **Save** posts to the island (when the score qualifies there) and to this device, then shows the board with the new row in
  gold, the player's other island rows tagged YOU, and "You're #4 on the island this week!". **Skip** keeps the score on this
  device only, under the letters on the wheels.
- Boards are also open from the arcade room (**Scores** in the header: the Hall of High Scores, one tab per game) and from
  each game's start and full-time card (**Leaderboard**). Tabs: Island · week, Island · all-time, This device.

| Game | Board score | Sanity ceiling | Rate rule (base + per second) | Minimum play |
|---|---|---|---|---|
| Breakaway Run | points | 300,000 | 3,000 + 1,500/s | 12 s |
| Futbol Pinball | points | 400,000 | 5,000 + 2,500/s | 20 s |
| Futbol Tennis | longest touch rally | 500 | 10 + 2/s | 15 s |
| Island Strikers | match points: goal 100, completed pass 10, win 200 | 20,000 | 400 + 40/s | 30 s |
| Pass Puzzles | total stars (the daily remix not counted) | 300 (40 puzzles × 3 = 120 today) | none (a running total) | 8 s |

## Privacy

- An island entry is: game, score, three letters A–Z, a picture id, the day and its week, the play session's random nonce
  and (optionally) a sha256 of a random claim only the posting device holds. No name, free text, save code, IP address,
  device id or user agent.
- Rude, hurtful, hateful and drug three-letter combinations are refused on the device and again on the server
  (`BLOCKED_INITIALS` in `lib/arcade/leaderboard.ts`). Identity words often used to tease (GAY, JEW) are blocked too,
  because a 3-letter board can't carry context. **Product decision for the user:** keep or remove those two.
- **The save code's pictures are not offered as the board picture.** Each save-code word has its own picture, so showing it
  on a public board would reveal part of the secret code.
- The device board, the remembered letters and the claims live in `fi2-arcade-boards-v1`, a device key (never synced).
- Rate limit: 30 posts per network per hour and 5,000 a day site-wide, counted under a day-salted hash of the IP in the
  save throttle table (the salt is deleted nightly). Session starts are limited per instance in memory under a salted hash.
- Retention: only scores that make a top 10 are kept; the nightly cron keeps each game's best 50 of all time plus this week
  and last week.

### Privacy policy: draft for the lawyer (NOT applied)

`components/privacy/PrivacyPolicy.tsx` was not changed. Section 5 currently says "The plan never scores, ranks or compares
children" (about the football plan, still true), and section 9 lists "usernames" as never collected. Suggested new section,
for legal review before it ships:

> **Arcade high scores.** When a player's score makes an arcade leaderboard, they can add it to the island's public board.
> A board entry shows only three letters the player picks on letter wheels (not a name; rude combinations are refused), an
> optional picture from a fixed set, the score and the day. We do not collect names, typed text, save codes or device
> details with a score. To limit misuse we count posts per network using a scrambled, day-specific fingerprint of the
> network address that is deleted within a day. Only top scores are kept: each game keeps its best 50 of all time and the
> last two weeks. A player can skip and keep a score on their own device only. A grown-up can ask us to remove an entry.

Also for review: whether three chosen letters on a public board count as a "username" under section 9, whether boards need
a grown-up toggle (e.g. "Island boards: on/off" in For grown-ups), and how a removal request is handled (an admin delete by
row id; not built).

## Server

- `POST /api/arcade-board/start {game}` → a signed session token (HMAC-SHA256 of game, issue time and a random nonce;
  `LEADERBOARD_SECRET`, or derived from `SAVE_CODE_PEPPER`). Stateless. Sent when a paid play (or a puzzle) begins.
- `POST /api/arcade-board/submit {token, score, initials, icon, replace?}` → checks the signature, the token's age (the
  game's minimum play time up to 3 hours), the ceiling, the scoring rate, the letters, the blocklist and the picture id; one
  post per token; kept only if it makes a top 10. Returns the rank, both boards and a one-time claim.
- `GET /api/arcade-board/top?game=` → both boards (`s-maxage=20`, the same for everyone).
- Code: `lib/arcade/leaderboard.ts` (shared rules), `lib/arcade/leaderboardServer.ts` (handler),
  `lib/arcade/leaderboardStore.ts` (Supabase RPC + the memory/file twin), `app/api/arcade-board/[action]/route.ts`.
- Migration: `supabase/migrations/20261013_arcade_leaderboards.sql` (after 20261010_game_saves.sql; last row
  "OK, arcade leaderboards installed"). Local preview: `BOARD_LOCAL_FILE=/path/boards.json` (ignored on Vercel), with
  `SAVE_CODE_PEPPER` or `LEADERBOARD_SECRET` set.

## Heat

No polling, timers or loops. The board UI (`components/arcade/*`) is lazy: loaded only after a scored game ends or when a
Leaderboard/Scores button is tapped. A game's boards are fetched once at game over (only when the device holds a play
session) or when a board opens, then reused for 20 s. The arcade room sleeps (setCovered) under the Hall. One small POST per
play starts the session. Validated by `tests/arcade-leaderboard.cjs`.
