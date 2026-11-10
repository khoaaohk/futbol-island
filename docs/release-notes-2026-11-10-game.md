# Game release notes, Nov 10 2026 (held, not deployed)

What the held game release contains, in plain words, and how each part was checked. The SEO, privacy and test-runner
work is already on `origin/main` (0b3771ff) and is not repeated here.

How things were checked (verification run, Nov 10 2026):

- **Tests:** type checks (app and multiplayer relay) 0 errors; lint 0 errors (80 known warnings); full test suite
  999 / 999 passed in 530 s (13 tests quarantined as before), fixture checksum OK.
- **Production build:** builds cleanly in about 2 minutes, 1,893 pages; lint runs inside the build and does not fail it.
- **Headless browser** (phone size, on the production build): title screen, island load, summit machines, two fishing
  posts, night street, arcade room in and out, the Today card, the fishing check (3 of 3 runs passed) and the dive check.
- **Not seen in a real browser yet:** anything below marked "not seen". The arcade game menus open in headless Chrome,
  but a full game was not played there (the test profile starts with 0 coins and the route buttons did not respond to the
  script). Feel, sound, haptics and phone heat can only be judged on a real phone.

## Island graphics

- Softer, clearer water; better ground, lighting and building shading. *Headless browser (screenshots), tests.*
- Night time: street lamps and neon signs. *Headless browser (one night screenshot; the street still reads fairly light,
  worth a look on the phone).*

## Gashapon capsule machines

- One-row status pill, a knob you turn by hand, six machine body styles. *Tests (the toy viewer test is known to be
  flaky under load and is retried alone).* Turning the knob: **not seen**.
- The summit snack, drink and gashapon machines now stand against the east fence of the summit pitch. *Headless browser
  (screenshot shows all three in a row by the fence).*

## Fishing

- Seven kinds of fishing stall (pier shack, beach cart, tiki hut, lighthouse lean-to, rowboat counter, harbour-master's
  booth, market table with a parasol), so the posts no longer all look the same. *Headless browser (two different stalls
  seen), tests.*
- The full fishing check (walk to a post, cast, bite, reel, catch card, Fishbook) passed 3 times out of 3.

## Arcade

- Every game reports its result the same way (scores, coins, Today challenges), with fair random seeds.
- Breakaway Run: the Daily Run (one course a day, the same for everyone; the first finished run counts) and its own
  boards for Warm-up, Night Derby and Storm Final (`runwarm`, `runnight`, `runstorm`, `rundaily`; the database change is
  already applied). Swipe left or right to change lanes. *Tests; menus seen in headless browser; swiping not seen.*
- "Today in the arcade": a Today button in the arcade room opens one challenge per machine, each worth 2 learning coins.
  *Headless browser (screenshot), tests.*
- Trophies, pinball pattern labels, a scan cue in Island Strikers, a first-touch ring in Futbol Tennis, links from Pass
  Puzzles to the matching lesson, and one shared "beat director" for moments of excitement. *Tests only; not seen.*
- Admin: "Remove row" on a board hides a bad score at once. *Tests.*

## Speed and memory

- Water work is skipped when the clear-water view cannot be seen; coming back from the arcade reuses a warm island;
  diving, fishing and the paint easel load only when first used; leaving the island cleans up after itself. Part of the
  big Town file was split into smaller files. *Tests; headless browser (arcade and back: loading sign shown, island back
  in under 7 s, frames running, no errors).* Phone heat: **not measured on a phone**.

## Bug fixes and tooling

- A batch of bug fixes from today's play-test list. *Tests.*
- Automatic checks (CI) and a lint setup. *Lint runs clean (0 errors).*

## Known open items

- 13 tests stay quarantined (browser checks that need the dev server, and a few stale ones); one of them,
  `tests/goal-collisions.cjs`, may be a real bug: walking into a goal from behind may not be blocked.
- `tests/gashapon-viewer.cjs` is flaky under load (retried alone by the runner).
- 80 lint warnings (mostly React hook dependency hints and `<img>` hints); none block the build.
- The local branch sits 5 commits behind `origin/main`; the working tree already contains that work. Commit on top of
  `origin/main` when pushing.
- The header of `supabase/migrations/20261112_runner_route_boards.sql` still says "NOT APPLIED"; it has been applied.
- The highlight round a fishing stall when you stand near it is drawn as a green box outline; check it looks intended.

## Phone play-test checklist

1. Open /play: the title screen shows, Start works, no blank screen.
2. Walk around town for a minute: the frame rate stays smooth and the phone does not get hot.
3. Look at the sea from the beach and from a pier: the water looks clear and moves gently.
4. Switch to night (Settings or the Fishbook's night toggle): lamps and signs glow and the town reads as night.
5. Go to the summit pitch: the snack, drink and gashapon machines stand in a row by the east fence and you can reach each one.
6. Buy a capsule: the status pill fits on one row, and you can turn the knob with your finger.
7. Visit three gashapon machines in different places: their bodies look different.
8. Visit three fishing posts: each has a different stall; the near highlight looks right.
9. Fish once: tapping while the fish nibbles does nothing (the reel says Wait), tapping on the bite hooks it, reel it in.
10. Dive once and come back up: no freeze, the water looks right above and below.
11. Enter the arcade and leave it: the loading sign shows and the island comes back quickly where you left.
12. In the arcade, tap Today: five challenges show; play one and see it marked done with 2 coins.
13. Breakaway: swipe left and right to change lanes; finish Warm-up; check the Daily Run opens after one star.
14. Pinball: a pattern label shows when you hit a pattern; Tennis: the first-touch ring shows; Strikers: the scan cue shows.
15. Finish a Pass Puzzle and follow its link to the lesson.
16. Check the Scores board shows the new Breakaway tabs (Warm-up, Night Derby, Storm Final, Daily Run).
