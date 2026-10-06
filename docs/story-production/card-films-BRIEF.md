# Card Play Moment films — shared brief (Sep 26 2026)

Every player card has a **Play Moment film**: a short riso canvas film played inside the card's picture window when the
child presses Play. ~353 exist in `lib/plays/riso/<id>.ts`; study 3–4 recent ones (e.g. `messi-getafe-2007.ts`,
`zidane-volley-2002.ts`, `banks-save-1970.ts`, a `*-futsal-signature.ts`) before writing yours, and copy their structure.

## Pipeline (per film)
1. Pick the moment: the card's Top Plays entry in `lib/town/iconicPlays.json` (the card agent proposed one real,
   sourced moment per player). Verify the facts (date, opponent, score, scorer's foot/side, kits, where the ball went)
   against Wikipedia/news pages. Web fetching must be slow and polite (one request at a time, ≥4 s apart; back off on 429).
   Use a generic User-Agent (e.g. "FutbolIslandFilmResearch/1.0"). **Never put the user's email, name or any personal
   information in request headers, user-agents or URLs.**
2. Write `lib/plays/riso/<id>.ts` (id = `<player-slug>-<moment>-<year>`, or `<slug>-signature` for a signature move),
   register it in `lib/plays/riso/registry.ts` (FILMS map + add the name to `PENDING` while building). **Edit only your
   own lines in registry.ts** — re-read it right before each edit; other agents add entries concurrently. Never do a
   global replace in registry.ts (it once deleted the FILMS key).
3. Narration script `public/plays/narration/<id>/script.json`, then voice it with Kokoro:
   `<venv>/bin/python scripts/plays/kokoro-narrate.py <id>` → `<n>.m4a` + `timing.json`.
   Kokoro venv: `~/.venvs/futbol-kokoro` (rebuild steps: `docs/voice/KOKORO_SETUP.md`)
   (espeak-ng is installed; the script patches its paths). Voice: the coach voice **af_bella, speed 1.0**. Never ElevenLabs
   (planned for later by the user, not now). Pronunciations: `scripts/plays/pronunciations.json`.
4. Swap the film's `VOICE/TIMING` nulls for the `timing.json` import (via `withTiming` in `lib/plays/riso/timing.ts`),
   add `.json` support to the test loader if your test needs it, then **remove the name from `PENDING`**.
5. Test `tests/play-film-<id>.cjs` following existing ones; run it plus `npx tsc --noEmit`.

## Rules (from user feedback — non-negotiable)
- A **1:1 recreation of the real footage**: broadcast wide shot first, then a TV-replay angle. Never top-down tactics
  boards. Real movement, real sequence.
- Correct **foot and side** (e.g. Zidane's volley was left foot from the left side), correct kit colours for that match,
  correct direction of play and where the ball went. Curl physics: a left-foot inside curl bends left-to-right.
- **Never stage an invented play inside a named real match.** If a player has no single famous, well-sourced moment,
  make a clearly labelled "how he does it" signature-move demo instead (not claimed as a specific match).
- Figures use the shared athlete library `lib/plays/riso/athlete.ts` (range of motion, not stick figures). Shirt numbers
  must read correctly (not upside down / mirrored).
- Every narration cue's first word must match a word in its `timing.json` (watch contractions, hyphens, plurals —
  mismatches silently fall back to estimated timing). Cues must have a visible consequence on screen.
- Kid-friendly narration: simple, vivid, football-focused; no controversy, violence or off-field stories.
- Style: riso print look per `docs/story-production/riso/RISO_BIBLE.md` and `ENGINE.md`; card films use the engine's
  card mode (dots off the action — handled by the engine; don't hand-roll halftone).
- Phone heat matters: no extra loops; use the engine's player (it sleeps when done).

## Verify
- Your film tests + `npx tsc --noEmit` pass. Play each film once in a headless browser at :8092 (open the card from the
  binder → Play) at 390×844 and look at 4–6 frames yourself: correct players, kits, foot, ball path, captions in sync.
- Do not restart the dev server (:8092), commit, or deploy.
