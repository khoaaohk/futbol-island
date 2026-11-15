# Smart Welcome back suggestions (Nov 14 2026)

The in-island **Welcome back!** note (components/WelcomeBack.tsx) carries one "for you" line, picked per player on the device.
It is still a note, not a menu (owner, Oct 1 2026: no buttons). The whole note is the tap target, and with a suggestion
that tap also does the thing. The line uses the note's existing classes (`toast.toast`, `styles.card`, `styles.note`), the same
dwell (WELCOME_BACK_SHOW_MS) and the same toast lane. The title-screen welcome card is not touched.

## Pieces

| File | What it does |
| --- | --- |
| `lib/welcome/tally.ts` | Pure on-device tally: decayed minutes and actions per interest (fishing, lessons, arcade, roam, kit), last day played, lesson day-streak, favourite cabinet. About 120 bytes. |
| `lib/welcome/tallyLive.ts` + `components/WelcomeTally.tsx` | Browser binding, mounted once in `app/layout.tsx`. Event-driven: it uses the tracker's on-device watcher (`watchLocalActivity` / `localActivity` in lib/analytics/tracker.ts), which reuses the beat's activity classification, plus visibilitychange/pagehide. It has no timer, does no per-frame work and makes no request. It still runs when analytics is off. |
| `lib/welcome/kinds.ts` | The fixed list of suggestion kinds. The analytics ids are built from it. |
| `lib/welcome/hooks.ts` | The provider registry. `registerHooks(interest, provider)`. A provider turns plain facts into hooks `{kind, interest, tier, line, action}`. |
| `lib/welcome/facts.ts` | Reads the facts from the local save once, when the note opens (Fishbook and its sets, Paths Continue and lesson evidence, the arcade's Today card, Kit Shop news). |
| `lib/welcome/learn.ts` | Per kind shown / tapped / ignored in a row, visits, the tapped kind waiting to be "acted", and the holdout arm. |
| `lib/welcome/act.ts` | What a tap does, using existing events only (see below). |
| `lib/welcome/kitNews.ts` | Kit Shop news. To add news, add a row; it shows to players whose last shop visit came before it. |
| `lib/welcomeSuggestion.ts` | The picker, `pickWelcomeSuggestion(context)`. Pure. |

## Scoring and the picker

- Each interest's score is minutes + 3 × actions + tap boost (4 per tap, capped at 20). Minutes and actions decay by 0.85
  per day, so a visit 14 days ago counts about 10%. A single unbroken stretch counts at most 10 minutes.
- **Hook tiers:** almost done (4) > about to be lost (3) > new since last visit (2) > right time (1) > evergreen (0). The
  picker compares the best hook of the top two interests. The second interest wins only with a strictly higher tier (the top
  interest gets +0.5).
- **New players** (fewer than 3 notes on this device) rotate fishing, then a lesson, then the arcade. A rotation slot with
  nothing to offer moves on to the next one.
- **Cross nudge:** on every 5th note (notes 4, 9, 14, …, counting from 0) the player gets a line linked to their top interest.
  A fisher gets a lesson ("Every fish has a football fact"). An arcade fan gets the passing lesson behind Pass Puzzles (the
  support lesson of their path). A learner gets today's Pass Puzzle. An explorer gets fishing. A Kit Shop fan gets Kit Rush.
- **Back-off:** a kind ignored 3 times in a row (the note timed out, or the page closed with it open) backs off for 14 days.
  When an interest's best hook is backed off, the picker tries the next interest. A tap resets that kind's ignore count and
  adds to the interest's score.
- **Holdout:** 10% of devices (`Math.random()` drawn once and stored in `fi2-welcome-arm-v1`) get the plain welcome line only.

## Hooks available today

| Interest | Kind (tier) | Line, e.g. | Tap |
| --- | --- | --- | --- |
| Fishing | fish_set (4) | "2 more fish to finish your Every Shark set!" (1–3 left in a Fishbook set, `nearlyDoneSets`) | Go fishing (fishingReach) |
| | fish_visitor (3) | "The Octopus leaves in 1 day. Tap to go fishing" (last 3 days of the ISO week, not caught yet) | Go fishing to the visitor's spot |
| | fish_day (2) | "Fish of the day: Sea Bass! Tap to go fishing" (until caught today) | Go fishing to the nearest of its shore spots |
| | fish_sunset (1) | "Sunset fish bite at Harbour Wall. Tap to go fishing" (island at sunset, a sunset fish not yet caught) | Go fishing to that spot |
| | fish_go (0) | "Fish are biting today. Tap here to go fishing!" | Go fishing |
| Lessons | lesson_grad (4) | "1 lesson to graduate 7v7! Next up: Carry or Pass?" | Paths on that format (its Continue card) |
| | lesson_streak (3) | "Next up: Carry or Pass? (2 min). Keep your 4-day streak!" | Paths |
| | lesson_weekend (1) | "Weekend! Try two lessons today. Next up: …" | Paths |
| | lesson_next (0) | "Next up: Carry or Pass? (2 min). Tap to start" | Paths |
| Arcade | arcade_pennant (4) | "1 more day for this week's arcade pennant! …" (2 of 3 days done) | /arcade?game=<cab>&today=1 |
| | arcade_daily (2) | "New today in Pass Puzzles: Solve today's puzzle. Tap to play" | today's challenge |
| | arcade_go (0) | "Pass Puzzles is waiting in the arcade. Tap to play" | that cabinet |
| Kit Shop | kit_news (2) / kit_design (0) | "New boot stickers in the Kit Shop! …" | the Kit Shop door |

The lesson streak comes from the tally: days in a row with any lesson, quiz or Paths time. Lesson minutes are estimated at
about 15 s per step. There is no "close to an arcade best" hook yet, because the saves keep only the best score and not the
last one; the pennant hook is the arcade's "almost done" hook for now.

### Fishing: the fish-comeback helpers (wired Nov 14 2026)

`fishingFacts()` (lib/welcome/fishingFacts.ts, pure; facts.ts passes it the Fishbook, `fi2-fishing-comeback-v1`,
`fi2-fishing-hooks-v1` and the island time) reads lib/town/fishing/comeback.ts: `fishOfTheDay`, `weeklyVisitor` (shown in the
week's last 3 days, `VISITOR_LEAVING_DAYS`), sunset fish at a shore spot while the island is at sunset, and `nearlyDoneSets`
(claimed sets excluded). A line that names a fish carries its shore spot ids (`action.spots`); the tap's Go fishing then lands at
the nearest of THOSE (`goFishingTarget` in fishingReach.ts, e.g. Palm Point on Summit Isle), otherwise the nearest spot. Set
titles read as "your Every Shark set" (`setName` in hooks.ts).

**In the note** (components/WelcomeBack.tsx): a suggestion replaces the "Next up: <lesson>" line (it was shown twice when the
suggestion was the next lesson); the Ferry / all-done lines stay. The suggestion line is a touch bolder and ends in "›" so kids
see it can be tapped; the whole note is still the one tap target.

## Taps

`act.ts` dispatches existing events only:

- fishing: `requestGoFishing()`, plus `fi:go_welcome`.
- Paths: `ENDGAME_OPEN {target:'paths', format}`.
- one lesson (the cross nudge): `FORMAT_PATH_LAUNCH`.
- arcade and Kit Shop: `WELCOME_GO`. Town turns it into its own Enter door (the departure save and the fade). ArcadeRoom
  reads `?today=1` to start today's challenge, as the Today card does.

## Privacy and saves

- The tally (`fi2-welcome-tally-v1`) is a **synced** key, so it follows a save code. It is sanitised by
  `cleanTallyRaw` in `cleanKeys` and listed in PLAYED_IGNORE_KEYS. Without a save code it stays on the device.
- What was learned from taps (`fi2-welcome-learn-v1`) and the arm (`fi2-welcome-arm-v1`) are **device keys**: they are
  never synced.
- The profile is never sent anywhere. Analytics gets totals only.

## Analytics (ws:, lib/analytics/countIds.ts WELCOME_COUNT_IDS)

- `ws:s_<kind>` shown, `ws:t_<kind>` tapped, `ws:a_<kind>` acted (the tapped interest really started within 15 minutes:
  fishing opened, a lesson or Paths opened, an arcade game started, the shop entered).
- `ws:arm_on` / `ws:arm_hold`: notes shown per arm. `ws:back_on` / `ws:back_hold`: notes shown within 7 days of the
  previous note on that device. back / arm gives the comparable return rate.
- `ws:none`: an 'on' note that had nothing to suggest.
- Admin: **Players and retention → Welcome back suggestions** (app/admin/WelcomeSuggestCard.tsx, from
  `report.welcome` built by lib/analytics/welcomeReport.ts). It shows totals and shares only. No migration is needed: the
  counts SQL accepts any id of the COUNT_KEY_RE shape.

## Tests

`tests/welcome-suggestions.cjs` (in the npm test chain) covers classification, scoring, decay, streaks, the sanitiser,
tiers, back-off and its expiry, tap reinforcement, "acted", the holdout share, the 1-in-5 cross nudge, the new-player
rotation, copy length, the comeback slots, save keys, counters, the admin reading and the note's single tap target.
