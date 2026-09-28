# Arcade gameplay review — September 27, 2026

Implemented locally. This pass builds on the native bean rigs, neon courts and existing physics; it does not replace the engines.

| Game | Skill worth practising | Implemented change |
| --- | --- | --- |
| Island Strikers | Draw pressure, find a support angle, pass before cover closes | Four rounds: basic space, receiver press, compact central block, combined press/cover. Defenders commit to tackle direction and recover after missing; attackers adjust out of cover shadows. Correct goal-plane height decides crossbar crossings. |
| Futbol Tennis | Move the rival, recover balance, finish into exposed space | Five courts introduce better reads, recovery angles, pressure lobs, short balls and aerial counterplay. Stable shot reads replace destination jitter. Tape contact depends on physics. Wins unlock the next court; earlier courts remain selectable. |
| Breakaway Run | Read a route, choose an evasion, finish while balanced | Six named stages unlock two-line challenges with visible ball routes and adjacent-lane changes. Exact jump integration and swept contacts keep evasions consistent. A blast resolves multiple contacts in one frame. |
| Futbol Pinball | Build with both feet, change the angle, finish | Four divisions with optional corner, bank and combined-foot challenges. One challenge reward per division, ball recovery capped at three. Lowering flippers no longer earns attacking combinations. |
| Pass Puzzles | Combine tactical ideas rather than repeat an isolated pass | Match Problems adds three advanced three-pass sequences: escape/switch/knock-down, one-two/square finish, and aerial second ball. Existing rewind supports learning after a failed final pass. |

## Feedback and presentation

- Tennis player slams/scissors receive a brief angled close-up and slow motion, returning automatically before the next exchange. Rival shots retain the readable gameplay view.
- Breakaway charging moves the camera toward the player and eases back on release/cancel. Strikers retains its wind-up zoom and simulation slow motion.
- Contact types have different short sounds; goals/perfect returns use musical cues. Charge thresholds add rising notes. Supported vibration is brief, rate-limited, muted with sound, and disabled with reduced motion.
- Tennis/Strikers unlocked stages and personal bests persist locally. These are browser records, not a cross-device account campaign.
- Room detail includes cabinet speakers/coin returns/fixings, couch drinks and programmes, football posters, tickets and responsive air-hockey lights. NPC console rhythms differ. The room retains its original floor and open counter aisle.

## Design references

The tactical designs adapt football teaching rather than add arbitrary hazards to every court. [FIFA pressure and cover](https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/sessions/preventing-progression-through-central-areas.php) informs Strikers' receiving pressure and central protection. [USTA court positioning](https://www.usta.com/en/home/improve/tips-and-instruction/national/improve-your-tennis-game--court-positioning.html) informs Tennis recovery and depth, adapted to this game's football contacts. [Microsoft difficulty guidance](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/108) supports disclosed progression and revisiting easier courts.

## Evidence and limits

Engine fixtures cover progression, collision/tackle timing and new moves at 30/60/120Hz. Each game also has browser input checks; deterministic setup fixtures are identified separately in the harnesses.

Ordinary Tennis mobile play sustained a 21-touch rally and 16 clean returns before intentional failure/retry. Strikers ordinary desktop play produced a completed pass and shots/goals on the opening round. Pinball mobile play exercised five flipper strikes, natural drains and retry; that short run did not prove division balance or earn a goal. Runner touch tests covered lane changes, jump, slide, charge cancellation and retry. Advanced puzzle solutions are tested through mouse/touch drawing as well as deterministic physics.

Later-round difficulty still needs longer human play sessions. Desktop touch emulation cannot establish physical-phone comfort, vibration support, battery use or temperature. No deployment was performed.

## Puzzle control follow-up

The old gesture reader let one noisy sample determine curve and counted scribbling toward power. The revised reader integrates the intended bow and filters screen-space tremor. Explicit Ground/Lift/Shoot modes teach choosing a flight path; the separate power slider lets the player repeat a chosen weight without redrawing a longer gesture. Auto retains distance-based power and hold-to-lift. Clear opening shots are valid on goal puzzles, with physical launch-speed limits.

Idle defenders scan nearby attackers and shift their stance without moving the frozen puzzle's collision positions. Native keeper push-off, contact and get-up replace whole-character roll. Goals show a net response, short rings and player celebration; shot/pass trails distinguish the flight. Visual work is pooled and idle aiming runs at 15fps.

Engine evidence covers gesture sampling stability, outlier rejection, fixed power, opening shots and keeper recovery. Ordinary desktop/touch drawing covered failure, retry, pass and goal. Coins drawer styling and desktop tennis spacing now share the arcade's visual language and island control dimensions. Game loading fallbacks use dark texture, brush titles and the shared loader. These are local changes.
