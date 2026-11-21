# Keepy-Uppy Beat: direction (Nov 21 2026)

A rhythm game about juggling a football. An original game for the arcade (id `keepyuppy`), built in the house comic print style with the
player's own island bean. No other rhythm game's name, art, tracks, charts or look is used: the music, charts and drawings are made here.
Status: built on branch `game-keepyuppy` (on top of `game-safehands`), NOT pushed, NOT in the room yet (see "Room placement").
Open it with `/arcade?game=keepyuppy`.

## What it teaches (AGENTS.md: every feature teaches football)
| Idea | In the game |
| --- | --- |
| A soft, controlled touch buys time | The ball flies the real parabola between two touches (gravity 9.8 m/s2, view.ts), so the gap to the next touch IS the height of the pop: a half-note pop is visibly higher than a quarter-note one. Said on the start card, the track tips and the results facts. |
| Eyes on the ball | The bean's eyes follow the ball every frame; the landing ring on the body shows where it comes down. Track 3's tip. |
| Both feet | Charts are written in STRONG / WEAK foot and mapped to left / right by the foot the child picks on the first run. Every track has a weak-foot section (banner "WEAK FOOT!"), weak-foot touches are scored on their own (0-100), the best is kept per track and the results card celebrates when it goes up. |
| Juggling rhythm | One ball, one touch at a time, on a beat; later tracks put touches between the drum hits. |
| The right body part | Four pads = left foot, thigh, head, right foot; boots, shorts and headband wear the pad colours. The other pad keeps the ball up but wastes the touch ("OTHER PAD!"). |
| Real tricks, by name | Six real moves, each taught in a 10-second lesson with nothing to lose before it first appears, each with a card in the Trick Book (how + one coaching fact). |

## The loop
Balls fall down four lanes into landing rings; tap that lane's pad as the ball lands. The next ball's ring closes in on it, every ring
breathes once a beat (the metronome you can see), the same landing marker closes on the bean's body, and the bean makes the touch with the
right limb. Grades in kid words: SWEET! (within 55 ms), GOOD (110 ms), EARLY / LATE (170 ms: the ball stays up, the combo ends), DROPPED
(later than 170 ms, or never). A tap earlier than 170 ms before a ball is not a touch and costs nothing.
Balls (lives): 5 on track 1, 4 on tracks 2-3, 3 on tracks 4-6. A drop loses the combo and one ball; no balls left ends the run early;
eight touches in a row that stay up (Early and Late count) win one back, never more than the track gives.
Score: 100 / 60 / 20 a touch x (1 + 0.1 per ten clean touches, to x2); a landed trick +150 x the same; finishing +300 a star.
Stars (accuracy = Sweet 1, Good 0.8, Early / Late / Slipped 0.4, other pad 0, drop 0, over every touch of the track): finish with 40% = 1,
70% = 2, 88% = 3. Medals on the shared track: 4,000 / 10,000 / 20,000 (Bronze can be won on track 1, Gold needs tracks 5-6).

## Controls
Phone (upright): four big pads along the bottom, left foot / thigh / head / right foot; the whole column above a pad counts, so thumbs can
rest anywhere. Every pointer is its own touch (multi-touch safe). Left thumb = left foot + thigh, right thumb = head + right foot; the
charts are held to two-thumb limits (below). Stall = hold the head pad until its bar is full. Swipes (24 px of travel on a foot pad):
any direction for Around the World (shown as a circle), up for Heel Flick, sideways for Crossover.
Keys: D F J K (or left, down, up, right) = the four pads; hold Space with a foot key = a swipe; hold the key = a stall; P / Escape pause.

## Tracks (lib/arcade/keepyuppy/charts.ts: hand-written, never random)
| # | Track | Venue | BPM | Length | Touches | Balls | New tricks | Opens at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Park Kickabout | the park, after school | 80 | 60 s + 3 s count-in | 52 | 5 | none (half and quarter notes) | 0 stars |
| 2 | Schoolyard Shuffle | the schoolyard | 92 | 57 s | 79 | 4 | Thigh-Foot-Thigh | 1 |
| 3 | Beach Bounce | the beach | 104 | 55 s | 79 | 4 | Neck Stall, Seal Taps | 3 |
| 4 | Cage Night | the street cage at night | 116 | 58 s | 102 | 3 | Around the World; off-beat bars | 5 |
| 5 | Rooftop Rhythm | a rooftop pitch at sunset | 128 | 60 s | 108 | 3 | Heel Flick, Crossover; syncopation | 8 |
| 6 | Cup Final Carnival | the stadium, cup final night | 140 | 62 s | 130 | 3 | all six | 11 |
Difficulty rises by tempo, density, off-beats, tricks and the length of the weak-foot section.

Chart format (core.ts `parseChart`): bars split by spaces; a bar is 4, 8 or 16 slots. `.` rest, `S` strong foot, `W` weak foot, `T` thigh,
`H` head, `A`/`a` Around the World (strong / weak foot), `K`/`k` Heel Flick, `X`/`x` Crossover, `N` Neck Stall (each `=` holds one more
slot), `[TST]` Thigh-Foot-Thigh, `[HHH]` Seal Taps. A typo throws, so it fails the test, not the player.
Fairness limits, checked for every track, both feet, every lesson and every daily twist (`chartProblems`): 200 ms between any two
touches, 300 ms on the same pad, 250 ms on the same thumb, 400 ms after a swipe, 200 ms after a stall, never more than 1.6 s with no touch.
At 128 and 140 BPM this means eighth-note runs always alternate thumbs for left- and right-footers alike.

## Music (original, generated in code)
charts.ts holds each track's patterns as data (16 steps a bar: kick, clap, shaker, a bass line and a short lead motif on a five-note
scale; six different motifs, keys and lead timbres). music.ts turns patterns into events (pure; the test checks every event sits exactly
on its sixteenth at every tempo and that chunked scheduling never repeats or skips one). audio.ts plays them with WebAudio: `pump()` runs
from the game loop and queues every event of the next 0.25 s at its exact AudioContext time (look-ahead scheduling; no timers anywhere).
Graph: voices -> music bus -> master -> ONE limiter -> destination. No audio files. Sound off in the settings: no AudioContext is made at
all and the song runs on the performance clock; the game is fully playable silent (falling balls, closing ring, breathing rings, count-in
numbers). Cards and pause: the AudioContext is suspended.

## Timing and calibration
A tap is judged at its own event timestamp (not at the next frame) on the song clock: the AudioContext clock when sound is on (music.ts
`createSongClock` follows the smooth performance clock and re-anchors to the audio clock when they drift more than 12 ms), minus the
speaker latency the browser reports (`outputLatency + baseLatency`; the picture is drawn that much late too, so eyes and ears agree),
minus the player's own offset. Offset: one time, before the first track, "Tap when the ball lands": eight taps at 100 BPM, the median of
the last six is stored on the device (clamped to +-200 ms; "Skip" keeps the default +20 ms; "Timing" on the start card runs it again).
Pause steps the song back two beats on resume so the beat is heard before the next ball.

## Bot numbers (`node tests/keepyuppy-bots.cjs --bots`, 200 seeded runs each)
Bots press pads at song times as the shell does. perfect = on the beat. expert / mid / careful = a bell-shaped timing error of about
22 / 40 / 70 ms, missed balls (more under 0.32 s and 0.24 s gaps and on the weak foot), wrong pads, failed swipes and short stalls.
| Track | perfect | expert: finish / accuracy / 3 stars | mid | careful first-timer | masher (all pads, 5 a second) |
| --- | --- | --- | --- | --- | --- |
| 1 Park Kickabout | full combo, 7,200 | 100% / 99% / 100% | 100% / 93% / 97% | 89% finish, 76%, 2 stars in 87% | 21%, 0 stars |
| 2 Schoolyard Shuffle | full combo, 12,610 | 100 / 99 / 100 | 100 / 93 / 98 | 65% finish | 24%, 0 |
| 3 Beach Bounce | full combo, 13,210 | 100 / 99 / 100 | 100 / 93 / 100 | 46% | 20%, 0 |
| 4 Cage Night | full combo, 19,490 | 100 / 99 / 100 | 93 / 89 / 92 | 14% | 19%, 0 |
| 5 Rooftop Rhythm | full combo, 21,260 | 99 / 98 / 99 | 88 / 88 / 85 | 7% | 21%, 0 |
| 6 Cup Final Carnival | full combo, 26,935 | 100 / 98 / 100 | 76 / 80 / 74 | 3% | 18%, 0 |
The perfect bot's full combo on every track, both feet and every daily pair IS the fairness proof (asserted). Real browser, real touch
events timed on the song clock (`scripts/check-keepyuppy-browser.cjs --mobile --tour`): Cage Night 100%, the Track of the Day (Rooftop
Rhythm with the fast finish, before the pool was cut to tracks 1-4) 100% and 21,260 points; track 1 with sound off: every played touch Sweet.

## Come-back hooks (kid-safe: no day streaks, no timers, no notifications, nothing is lost by staying away)
1. Track of the Day: one of tracks 1-4 with a twist (weak foot only, swap feet, no thighs, keep it low, fast finish), the same for
   everyone that day (`keepyDailySeed` = the arcade's FNV-1a seed of `keepyuppy:<local day>`; `DAILY_POOL` holds only pairs that are still
   fair charts for both feet). Free replays; today's stars on the button; "come back tomorrow for a new twist".
2. Stars open tracks: 1-3 stars a track, totals 1 / 3 / 5 / 8 / 11 open tracks 2-6. Stars are never lost.
3. Trick Book: a card per trick, filled by five clean landings (lessons count); the shelf with its empty slots is on the start card.
4. Weak-foot best: a separate best per track, on the track list and the results card ("up from 60. It is getting stronger!").
Hook for a future cross-arcade weekly card (NOT built here): `KU_FEAT_IDS` / `KU_FEATS` in core.ts (13 feats), kept in `save.feats`
of `fi2-keepyuppy-v1`.

## Look and sound
One upright comic page, three bands: the venue with the bean (kit hex values, ink outlines, Ben-Day dots, hard shadows; no gradients,
blur or glow), the four-lane track, the pads. Six venues painted in canvas. Shared chrome: Arcade back button, score bar, pause card,
ComicCard start / stage / results cards, medal track, results-first high-score strip, board dialog. Sound: boot / thigh / forehead thuds
(a Sweet touch rings), a dull knock for a wasted tap, glockenspiel for tricks, combos and stars.

## Heat (AGENTS.md: document the cost)
Canvas 2D: one static canvas (venue, lanes, rings, pads: painted once per size / venue / foot) + one moving canvas; DPR capped at 2; no
particles, no images, no timers. The loop runs only while a ball is in the air: start card, stage cards (timing, lesson, track), pause,
results and a hidden tab draw 0 frames and the AudioContext is suspended (checked by the browser script: 0 rAF calls in 1-3 s on each).
TRADEOFF: the other 2D arcade games draw 30 a second on phones; this one draws up to 60 (30 with reduced motion), because cue balls moving
at 30 a second read as stutter in a rhythm game and the eye loses the landing moment. Paid for by keeping a frame tiny (a clear, at most
~10 cue balls, one bean of a dozen paths, one ball, two words) and by short runs (about a minute, then a sleeping card). Measured in
headless Chrome on the M-series Mac, phone profile 390x844 @2x, rules + music scheduling + draw: 0.20-0.24 ms a frame on average, 1.2 ms
worst, over 4,511 frames (desktop 1440x900: 0.08 ms). Music adds about 10-25 short oscillator / noise voices a second through one
limiter. Desktop numbers, not an iPhone temperature claim; if a real phone runs warm, `frameMs` in the shell is the one line to cap at 30.

## Room placement (owner decision pending; the room is untouched)
Like Safe Hands, the game is in the catalog as `arcadeUnplaced` (lib/arcade/arcadeCatalog.ts): playable by link, counted in analytics,
with its board, but no machine, no change to the room or to any "eleven games" line. The Safe Hands doc proposes the east wall at
x 11.6, z -1 (the mirror of the Air Futbol table). For this second new machine:
- A (recommended): the same east wall, toward the door from Safe Hands (about x 11.6, z +2; check against arcadeRoomProps.ts and the door):
  not a cabinet but a busker's pitch: a round mat with the four coloured pads, a speaker and a ball on a stand. No machine moves; costs
  one small prop's meshes and its prompt. The two new games then make an "east wall" pair.
- B: the west wall beside Air Futbol (x -10, z about +2), if the east wall is kept for Safe Hands alone.
- C: both new games join the back row (12 uprights re-spaced to about 2.0 m; every machine moves).
To place it: move the entry from `arcadeUnplaced` into `arcadeCabinets` (+ `ARCADE_ROW` for C), add it to `HALL_MACHINES`, the coins
panel `earning` line, `arcadeCabinetAttract` TITLES and the room tests; every "N games" line then counts it by itself.

## Owner: one paste
`docs/arcade-aaa/keepyuppy-supabase.sql` (board id `keepyuppy` + analytics key `arcade_keepyuppy`; idempotent; a superset of the Safe
Hands file; ends "OK, Keepy-Uppy Beat installed"). Until then the game works: everything saves on the device and the island board just
does not take the score.

## Not done / weaker than wanted
- No machine in the room; reachable only by `/arcade?game=keepyuppy` until the owner picks a spot.
- No /games page, media or SEO (next agent). Files: lib/site/games.ts (`GameId`, `GAME_PAGES`), gameMedia.ts + gameMedia.json, videos.ts,
  drillLinks.ts, learnFeatures.ts, lastmod.generated.json, docs/seo/build-game-images.py, scripts/capture-game-media.cjs,
  scripts/capture-game-shots-players.cjs, tests/seo-games.cjs, public/games/*. Counts ("eleven") read `ARCADE_GAME_COUNT` and stay
  eleven while the game is unplaced.
- Tuning is from bots and a scripted player, not from children. The windows (55 / 110 / 170 ms), the balls per track and the swipe
  length (24 px) need a real playtest on a phone, and so does the default +20 ms offset on iOS Safari and with Bluetooth speakers.
- The bean is the player's saved colours (body, skin, hair) drawn in 2D from the front, not the 3D rig with outfit and headwear.
  Poses are blended (foot, thigh, header hop, stall, the three swipe tricks) but simple: the Heel Flick has no real behind-the-body view.
- Around the World accepts any swipe (a true circle is not required); swipe direction is only checked for Heel Flick and Crossover.
- The music is deliberately simple (five voices, loops of one to four bars); there is no per-section arrangement beyond layers coming in.
- Feats are stored and shown on the results card when won, but have no shelf of their own (they wait for the weekly card).
- The Trick Book dialog and the trick lessons were checked by script and screenshot only.
- Not measured on a real iPhone.
