# Island HUD stack: what shows under the coins bar (Sep 30 2026)

The island's top row is **Paths · coins bar · Settings** (`--island-hud-row-top/-height/-gap`, `app/globals.css`). Everything that
appears just under the coins bar now lives in **one flex column**, `.hud-stack` (rendered by `components/Town.tsx`), so pieces
never overlap and nothing is positioned with fixed px offsets or `:has()` chains. Pieces owned by other components portal into it
with `<HudSlot>` (`components/HudStack.tsx`). The decision of *which* action shows is made by a small pure arbiter,
`lib/ui/hudStack.ts`, on Town's existing ~150 ms HUD tick.

## Inventory (audit, before this change)

| Element | Where | When | Purpose | Kind | Old position rule | z | Dismissal |
|---|---|---|---|---|---|---|---|
| Coin / learning / daily-play note | `IslandJobs.tsx` `[data-island-toast]` | coins earned (lesson, daily play, starter) | feedback | info (tap hides) | `row-top+row-height+gap` (Sep 30 patch) | 31 | 5.2 s timer, tap |
| Garden pick note / garden line | same element | a pick in the Community Garden / standing in it | feedback + place info | info | same | 31 | 5.2 s; garden line while inside |
| Job sign offer pill "Island job · … Go" | `IslandJobs.tsx` `.offer` | near a job board | start a job | action | `top:152px` (phone 140px) | 33 | walk away |
| Job card "Start job / Not now" | `IslandJobs.tsx` `.card[data-job-intro]` | after the offer / G | choose a job | action (dialog, non-modal) | bottom sheet `bottom:24px` (phone 176px) | 36 | Not now, Esc |
| Job panel | `IslandJobs.tsx` `.hud[data-job-active]` | a job is running | current task | task | `row-top+row-height+gap` (Sep 30 patch) | 32 | Stop job, finishing |
| Payday card "Job done" | `IslandJobs.tsx` `.card[data-job-done]` | a shift ends | reward + football lesson | action | bottom sheet | 36 | Nice! |
| Learn `<format>` Plays card | `Town.tsx` `.field-learn-card` | a pitch is on screen | open the pitch's plays | action (ambient) | `top:80px` / `76px`, 7 media-query variants | 4 | hides off-pitch / in garden (Sep 30) |
| Talk to `<NPC>` | `Town.tsx` `.npc-talk-prompt` | within ~6 m of an NPC | open a conversation | action | `top:100px`, pushed to 164px by `:has(.field-learn-card)`, to toast bottom by `:has([data-island-toast])` | 34 | walk away |
| Ball-hunt hint / pier note | `CoinHuntHud.tsx` `[data-coin-hint]` | near a hidden ball / after a pier splash | guidance | info | `top:80px`, pushed to 154/218px by `:has()` | 35 | walk away |
| Hop off / Land on truck | `Town.tsx` `[data-truck-exit]` `[data-truck-land]` | riding a truck bed / flying over a truck | ride control | task action | `translate(x,0)` + CSS `transform` to the row gap; desktop Land `max(82px, …)` | 12 | leave the truck |
| Enter (Arcade, Coaches, Museum, Konbini, Coral Cay Konbini) | `Town.tsx` `[data-*-enter]` | near a door (flying near on phones) / hovering it | enter a building | action (world-anchored) | follows the door, floor `--entry-floor` via 3 `:has()` rules | 12 | walk away |
| Vending "Go" | `Town.tsx` `[data-vending-go]`, `lib/graphics/vendingMachines.ts` | ≤ 3.2 m (≤ 12 m flying) / hover | open the machine | action (world-anchored) | follows the machine, `y ≥ 70px` (no floor) | 12 | walk away |
| Fish / Sell | `FishingHost.tsx`, `lib/town/fishing/fishingWorld.ts` | at a fishing post / Rosa's stand | fish / sell | action (world-anchored) | follows the post, `y ≥ 90px` (no floor) | 12 | walk away |
| Welcome-back card | `WelcomeBack.tsx` | first load of a new day | hello, next lesson, daily bonus (buttons removed Oct 1 2026) | guide (note) | `top:88px` | 9 | 6 s, tap (was Go / Later) |
| Spot it! | `LearningHost.tsx` `[data-spot-it]` | a learned concept happens in a live match | link play → lesson | guide (button) | `row-top+row-height+14px` | 31 | 8 s, × |
| Costume / ride unlock notes | `CostumeMilestoneToast.tsx`, `RideUnlockToast.tsx` | 10-ball milestone / finished path | feedback | info | `top:88px` | 9 | 6–7 s, tap |
| Rooftop knockout status | `Town.tsx` `[data-knockout-status]` | in the knockout | match state | task info | `top:100px` | 9 | leaving the arena |
| GOLAZO! | `Town.tsx` `.goal-toast` | a goal | celebration | info | `top:30%` (mid-screen, not under the bar) | 4 | clears on its own |
| Live position tip | `Town.tsx` `[data-position-tip]` | hovering a live player (desktop) | position name | info (world-anchored) | follows the player, `y ≥ 90px` | 15 | pointer leaves |
| Fishing session HUD (hint, toast, message) | `FishingHost.tsx` | while fishing | its own mode | own HUD | `top:22/70/88px` | 30 | leaving |
| Onboarding tour, graduation, card offers, conversations, menus | dialogs | — | — | cover the HUD | full screen | high | — |

Collisions reproduced (before): a coin note on the job panel (`toast∩jobHud`, phone + desktop), a coin note on Hop off
(`toast∩hopOff`), the welcome-back card under a coin note and over the Coaches Enter (`toast∩welcome`, `coaches∩welcome`,
`toast∩coaches`), the coin note above "Talk to Hugo" (action demoted under information), Talk + Learn card both shown on a pitch.
Screenshots: `…/scratchpad/hud-stack/before/`.

## Precedence model

The column has four slots, top to bottom (CSS `order` on `data-hud-slot`):

1. **task** — what the player is doing right now: the job panel, the job cards (Start job / Not now, Job done), Hop off /
   Land on truck, the knockout status.
2. **focus** — exactly **one** contextual thing, chosen by the arbiter:
   - tier 0: Hop off, Land on truck, a job sign (the child chose to act here: a job ranks with the job panel);
   - tier 1: proximity actions — Talk, Enter, Fish, Sell, vending Go (the Drink water fountains were removed on 30 Sep 2026) — **nearest wins**, desktop hover wins its tier;
   - tier 2: Spot it (short, has a button);
   - tier 3: the ball-hunt hint / pier note;
   - tier 4: Learn Plays — *ambient* (it shows whenever a pitch is in view), so anything the player actually stands at
     outranks it. (This keeps the Sep 28 rule that the ball hint takes the Learn card's place.)
   Enter / Fish / Sell / Go stay **world-anchored** (they follow their door or post, QA11 A-1) but never rise into the column:
   their floor is the column's bottom edge (`--hud-floor`). The other focus pieces render in the column.
3. **toast** — one transient note at a time (`lib/ui/toastLane.ts` shares the lane between IslandJobs, costume and ride
   notes). A short queue (3) with merging: rapid picks of one crop become "+3 Strawberry" (the first pick's lesson stays), a
   waiting note of the same kind merges too, and a queue drains faster (2.6 s instead of 5.2 s). A note always sits *below*
   the task and the focus, so it never covers a button. The garden line rests in this slot when no note shows.
4. **guide** — the welcome-back card.

### Context rules (`eligible()` in `lib/ui/hudStack.ts`)

| Context | Rule |
|---|---|
| In a truck | Hop off only; nothing else competes. |
| Flying | No ground prompts (Talk, Fish, Sell, job signs). Land on truck wins over a truck; doors and vending machines stay (they are fly-in destinations by design); Learn Plays and hints stay. |
| In a job, or a job card open | The job owns the stack: panel / card in the task slot, no focus competitor (except ride controls); notes wait while a card is open; the welcome-back (guide) card waits until the shift ends (Town passes `jobRunning\|\|jobCardShown` into its `blocked`). |
| In the Community Garden | The garden line (toast slot), never Learn Plays. |
| On a pitch | Learn Plays, unless something nearer (an NPC, a door, a hint, Spot it). |
| Near a door | Enter wins over the ball hint. |
| Talking, menus, lessons, map, dialogs, live fishing | The whole column hides (`hidden`); notes wait with their timers paused. |

### Conflict resolution

- A lower tier always wins at once (Hop off > Talk > hint > Learn Plays); action beats information.
- Inside a tier the nearest target wins; hover (distance −1) wins at once.
- **Hysteresis**: a challenger replaces the current choice only when it is **1.5 m closer**; a choice that blinks out for a
  tick (a door projecting behind the camera) is held for **300 ms** unless something stronger arrives.
- One note at a time; others queue (max 3) or merge.

## Implementation

- `lib/ui/hudStack.ts` — pure: `FOCUS_TIER`, `eligible`, `createFocusArbiter` (hysteresis), `pushToast` / `toastDuration`.
- `lib/ui/toastLane.ts` — the shared one-note lane (`useSyncExternalStore`, event-driven, no timers).
- `components/HudStack.tsx` — `HudStackContext` + `<HudSlot>` portal (renders in place outside the island).
- `components/Town.tsx` — renders `.hud-stack`; its HUD tick (`hudTick`, the existing 150 ms gate) builds the candidates
  (truck, job sign, nearest NPC, closest door, vending target + distance, fishing `wants` + distance, Spot it, hint, visible
  pitch), calls the arbiter, and calls `setHudFocus` **only when the answer changes**. Imperative prompts read `hudFocusNow`
  in the frame loop (they already toggled `hidden` only on change). One `ResizeObserver` on the column publishes `--hud-floor`
  (replaces IslandJobs' per-toast observer).
- `lib/graphics/vendingMachines.ts` exposes `targetDistance`; `lib/town/fishing/fishingWorld.ts` returns `wants` /
  `wantsDistance` (what it would show before `blocked`).
- CSS: `app/globals.css` `.hud-stack` block. Removed: the ride-prompt transforms, the Learn card / Talk / hint / entry-floor
  `:has()` chains, `--island-toast-bottom`, and the fixed `top`/`bottom` offsets of every stacked piece (IslandJobs, CoinQuest,
  LearningReview `.spot`, CostumeMilestoneToast, `.npc-talk-prompt`, `.knockout-status`, the field-card media-query variants).

Heat: no new loop, no new per-frame DOM writes. The arbiter is a handful of comparisons on the existing 150 ms tick; React
re-renders only when the focus changes; the column is laid out by the browser (no measuring per frame); one ResizeObserver
fires only when the column's size changes.

Accessibility: notes keep `role="status"` / `aria-live="polite"`; DOM order inside the column follows mount order while the
visual order is CSS `order` (task → focus → toast → guide), and focus-taking cards (Start job, Nice!) still focus their
primary button; every control keeps its ≥ 44 px height; the column sits under the safe-area-aware HUD row.

Tests: `tests/hud-stack.cjs` (precedence, context, hysteresis, toast merge/queue, wiring), in `npm test`.

## Gutter and timing (30 September 2026)

The column is `width:min(420px, calc(100% - 2 * var(--phone-gutter)))`, so on phones its cards line up with the 18px HUD row and
headers (it was 16px). Every piece enters with `hudStackIn` over `.3s ease`: the stack sets the duration and easing beside the
name, so a piece's own module timing (the welcome card's `.35s` overshoot, for example) no longer leaks through. See
[UI_SPEC.md](UI_SPEC.md).

## Guide card on landscape phones (30 September 2026)

On a landscape phone (`(orientation:landscape) and (max-height:500px)`, e.g. 844×390) the centred welcome-back card covered the
player and, with a job running, the docked job panel and its Stop job. Two rules now: a running job (or an open job card) owns
the stack, so the guide card waits and comes back when the shift ends (all orientations); and in landscape the card docks
compactly at the top-left edge, the same anchor and query as the docked job panel (`WelcomeBack.module.css`): left-aligned,
`min(248px, 50vw − 120px)` wide, the daily-play line clamped to two lines, and a `max-height` that stops
above the stick (it scrolls rather than reaching it). Guarded by `tests/hud-stack.cjs` and the browser check
`tests/e2e/gap-welcome-landscape.spec.ts` (card clear of the centre and the job offer; hidden while a job runs, Stop job
uncovered; back after Stop job).

## Welcome-back card is a note (1 October 2026)

User decision: the card has **no buttons** (Go, My football and Later were removed; the next lesson stays in Paths → Continue).
The whole card is one tap target that hides it (like the costume and ride notes), and it hides on its own after
`WELCOME_BACK_SHOW_MS` (6 s, `lib/town/welcomeBack.ts`). The dwell is one timeout that runs only while the card is on screen:
`blocked` (lesson, ceremony, modal, a running job) hides it (`hidden`; since 15 October 2026 the node stays mounted), and `held` (Town passes `stackCovered`: menus, the Pocket, any
overlay that hides the column) clears the timer; when it is back it gets a fresh dwell, the same rule as IslandJobs' notes. The
daily-play line uses `text-wrap: balance` with a `30ch` measure, so it reads as two equal lines. The guide tier, the job rule
and the landscape dock are unchanged. Guarded by `tests/oct1-ui.cjs`, `tests/hud-stack.cjs` and
`tests/e2e/gap-welcome-landscape.spec.ts` (now also auto-dismiss and tap-dismiss).

The Talk target and the NPC name tag now agree: `islandNpcs.nearest` returns the townsperson holding the one visible name tag
(closest, 1.5 m hysteresis, `lib/graphics/npcTagFocus.ts`) while it is in Talk range, so "Talk to …" always names the tagged person.

## Zipline ride actions (14 October 2026)

While the zipline holds the player (clip-on, the ride, the landing; `zipStore.riding`, `lib/town/zipline.ts`), the bottom-right
action cluster shows the ride's three actions instead of walk/ride/jetpack/parachute and the travel actions: **Wave** in the
ride slot (`.travel-mode`), **Tuck** (hold) in the Kick slot (`.touch-shoot`) and **Spin** in the Juggle slot (`.touch-juggle`).
They are the job cluster's `JobActionButton` with the same classes, so the same 58 px (phone) / 72 px (desktop) circles,
positions, faces and press; line icons `ziptuck` / `zipspin` / `zipwave` (`TravelIcon.tsx`) with a short word under each.
Keys: Space or 1 (hold), Q or 2, E or 3. The minimap toggle and the stick (look around) stay. The normal cluster comes back the
moment the feet are on the roof deck. Guarded by `tests/zipline.cjs`.


## Notes beside a docked job; one welcome-back node (15 October 2026, QA)

- **Starter coins over Stop job** (landscape phones, 100% repro in `tests/e2e/gap-welcome-landscape.spec.ts`). The running
  job's panel docks top-left *out of the column's flow* there (bug A1), so the column's centred note slot started at the same
  top and covered the panel's Stop job: "Welcome! +N coins" is queued on the first boot and waits while the Start job card is
  open, so it always appeared just as the job started. Garden picks, fuel, beachcombing and costume / ride notes could do the
  same. Fix: Town marks the column `data-job-running` while a job runs, and on a landscape phone the toast slot docks top-right
  (the mirror of the job dock, `min(270px, 50vw − 120px)` wide, clear of the centre and of the stick and action buttons). In
  portrait and on desktop the note already sits below the panel in the column. Guarded by `tests/hud-stack.cjs`.
- **Welcome-back card "detached from the DOM"** (desktop-chromium e2e). The card's e2e hold hook (`window.__fi2WelcomeMs`) was
  dev-only, so against a production build (`next start`, FI_URL) the card left after its 6 s dwell while the test was still
  reaching for it: the card shows as soon as the island is ready, part of the dwell is spent inside the boot helper, and
  the click raced the timeout (timing-dependent, so it hit desktop-chromium hardest). The hook is
  now also honoured when `navigator.webdriver` is true (automation only; players always get 6 s). The card is also mounted once
  per showing: while `blocked` (a job, a lesson, a modal) it is `hidden` rather than unmounted, so the node a tap or a test holds
  stays the same across a job. Guarded by `tests/hud-stack.cjs` and `tests/oct1-ui.cjs`.

## Calm HUD (21 October 2026)

User: "there's so much going on ... only show one at a time", "it's looking way too complicated". Audit and before/after shots:
`/tmp/calm-hud/` (states × desktop 1288×717, phone 390×844, landscape 844×390). Rules now in code:

- **One transient message, by priority** (`lib/ui/toastLane.ts`): `TOAST_PRIORITY` blocking card (5) > payday (4) > story (3) >
  hint / lesson (2) > note (1). A note with something to show calls `want(id)` (remembered for `WAIT_MS`, 6 s); when the lane frees,
  a lower note asking first is told to wait. A blocking card `hold`s the lane (the dive's find / restore / goal card). The dive's
  notes (`dive-note`, 4 s on screen, dropped after waiting 6 s) and edge chip (`dive-edge`) are in the lane. Lesson toasts (swim,
  shark, ride, dive, rays) show 5 s (was 8 s) without the "· tap to close" line (the whole card is still the tap target); the reef
  hint lost "Explore · tap to close" and the find card "Tap to close".
- **One card under the coins bar**: the ambient Learn / Path card and the ball-hunt hint step aside while a note or the welcome-back
  card shows; the welcome-back card waits (`blocked`, dwell paused) while an action prompt shows (`actionFocus`: Talk, a job sign,
  Hop off, Land on truck, Spot it).
- **Breath is never covered**: while `.dive-breath` shows, `.hud-stack` starts at 150 px (12 px under the pill); dive notes sit there.
- **Explore room controls** (user: "on mobile this looks messy, the btns are covering"): the Dart button is removed (user: "let's
  remove the dart action"), the "Reef n/12" chip and its hearts are removed (user: "remove this, we don't need it"; the journey,
  hearts, restore card and saves are unchanged). On touch screens the room's controls are ONE 2-row x 3-column grid at the bottom
  right (user: "up and down arrows in the grid ... top right the mini map ... bottom right the fly btn", then "move the emote btn to
  the left of the down btn ... a grid of 2 rows and 3 columns"). Cells are CSS variables on `.town-app:has(.dive-depth)`:
  `--room-c1/c2/c3` (right offsets, c3 at the edge) and `--room-r1/r2` (bottom offsets, r2 at the bottom), `--room-cell` 58 px,
  `--room-gap` 12 px:

  | | c1 | c2 | c3 |
  |---|---|---|---|
  | r1 | (Surface: removed 22 Oct 2026) | ▲ rise | minimap toggle |
  | r2 | Say hi (only near the friend; the cell stays reserved) | ▼ dip | Fly (switcher, jetpack icon, `REEF_FLY`) |

  To add an action: give it `position:absolute` (or fixed), `right:var(--room-cN)`, `bottom:var(--room-rM)` and the cell size. The
  grid is full today; a seventh action needs a third row (`--room-r0`), since a fourth column would reach the joystick on a 390 px
  phone. Say hi is one button: a tap waves, a second tap within 2 s high-fives (G / H on desktop). The minimap circle sits 12 px
  above the grid. Desktop keeps its column (▲ ▼, Say hi above) and the keyboard hints.
- **Explore room layout (22 October 2026, supersedes the 2x3 grid above on every viewport).** User: "fix the actions positions. do a
  grid of 4 up and down on the left, jetpack on the top right and emote bottom right. remove the pink go up btn", "make the up and
  down the same size as the other btns", "same style as well". LEFT: a 2x2 grid, column `--room-l1` holds ▲ (row `--room-r1`) over
  ▼ (`--room-r2`); the column `--room-l2` cells are EMPTY (reserved). RIGHT: Fly at the top (`--room-rr`, one cell above
  `--room-rb`), Say hi at the bottom right (its cell stays reserved). The minimap toggle sits above ▲ (`--room-r0`) and the open map
  above it. Phones: the grid sits above the joystick (portrait) or right of it (landscape); desktop: bottom left. Measured
  (headless): 390x844 ▲ 18,544 / ▼ 18,614 / toggle 18,474 / map 18,334 (128) / Fly 314,688 / Say hi 314,758 / joystick 18,684;
  844x390 ▲ 162,246 / ▼ 162,316 / toggle 162,176 / map 162,52 (112) / Fly 768,246 / Say hi 768,316; 1288x717 ▲ 24,537 / ▼ 24,621 /
  toggle 24,453 / map 24,251 (190) / Fly 1192,537 / Say hi 1192,621: no overlaps. One size (`--room-cell` = the island action size,
  72 px desktop / 58 px phones, 12 px gaps) and one style for ▲ ▼ and Say hi: the Fly button's 3 px cream rim, pastel fill + grain,
  5 px lower edge and press (▲ ▼ aqua, Say hi pink); 32 px icons. No Surface button: hold ▲ at the very top for 0.35 s (or tap it
  again there) to surface; Escape on desktop.
- **Fishing**: while the tutorial shows its step, the message (the same words) is hidden, so the two never overlap.

Guarded by `tests/calm-hud.cjs` (lane priority / hold / bounded wait, wiring, stack rules, copy caps, names, >= 44 px targets).

### Island action grid and the Emote button (22 October 2026)
- User: "move the emote btn to the bottom and group them together. grid of 2 by 2. flying, top left, emote, top right", then "the
  emote btn should show all the time, even when not in a party. that way it's more interactive".
- The island's bottom-right cluster (`.travel-actions[data-emote-grid]`, Town.tsx) is ALWAYS a 2 x 2 grid of round buttons, 12 px
  gaps, `--action-size` cells (58 px phone, 52 px at <= 350 px, 72 px desktop): row 1 **Fly** (the ride/jetpack button) left,
  **Emote** right; row 2 the two action buttons (juggle-side left, kick-side right). No reserved or empty cells: it is the same in
  every state, flag on or off, party or not. On desktop the map toggle stays at the lower left.
- **Phones (<= 600 px or coarse pointer; portrait and landscape; user, 22 Oct 2026: "the minimize map needs to be where the emote
  is, the emote to the left of the parachute, and the map should open less crowded"):** the cluster is 3 columns x 2 rows, grown to
  the LEFT so Fly, Parachute and Sprint keep their places: top row `[ ][Fly][Map toggle]`, bottom row `[Emote][Parachute][Sprint]`.
  The top-left cell is simply empty (the stair shape keeps every button above or beside where players expect it). Gap 12 px, 8 px
  at <= 380 px so the Emote cell clears the joystick on a 360 px phone. Left-handed (`.controls-flipped`): same cells in place,
  Emote to the right of Sprint. The open map is a 128 px disc (112 px in short landscape), right-aligned over the toggle, 14 px
  above the grid (`bottom: --control-bottom + 142px`, 138 px at <= 380, 126 px at <= 350), soft border, no place labels or small
  landmark dots (player dot and the vending markers stay). It folds out of / into the toggle (fade + scale from the toggle, .2 s;
  instant with reduced motion), hides while the Emote wheel is open, and folds away (`mapFoldNow` in Town.tsx) when a dialog, menu
  or job card opens; the toggle opens it again. The grid hides with the other action
  buttons (lessons, fishing, job camera, menus). The Arcade and Konbini rooms and the Explore room (reef: its own Say hi grid in
  `DiveHud`) are unchanged.
- The Emote button (`components/EmoteControl.tsx`) is icon-only (aria-label "Emotes"), >= 44 px, same style as the other action
  buttons. It opens a wheel of four round buttons upward (Wave, High five, Cheer, Well played; `lib/town/emoteReact.ts`); a pick
  plays on you at once (raised arm or cheer arms, icon bubble, ~4 s), is sent to friends only while a party is live, and the
  best free townsperson within 9 m answers for 2 s (user, 22 Oct 2026: "the emotes are not interacting with the npcs": 5 m was too
  tight and a walker was never in reach; now the nearest wins with a bonus of up to 2 m for one in front of you). Wave: a waving
  hand; High five: the sequence / raised hand + spark ring; Cheer: hop + arms up; Well played: a clap. The townsperson counts as
  near: its routine stops, it turns to face you and holds still, a bubble floats over it, and its name tag hides. Beyond 3 m it
  takes up to 2.5 m of steps toward you (never closer than 2.2 m, only on a clear path). Walking townsfolk answer; only riding /
  driving, sleeping, hidden, stunned and court-freestyle ones ignore it (2 s cooldown each; reduced motion = bubble only).
  **On a scooter, bike or moped** all four emotes work at normal speed: the right arm only (wave, air five, fist pump, clap;
  the left hand stays on the bar, the vehicle is never touched, no spin / hop / crouch high five). Jetpack, zipline, truck rides,
  swimming and jobs stay blocked. One pooled bubble pair + one ring (`lib/graphics/emoteBubbles.ts`), updated only while active.
- **Ten emotes, ~4 s each** (user, 22 Oct 2026: "emotes are not working with the npcs", "the music icon should be dancing for a few seconds",
  "replace the thumbs up with passing the ball back and forth"). Before, Pass to me / Space / Laugh / Thanks / Dance / Thumbs up did nothing
  visible on a townsperson (the reaction code knew only the first four) and nothing on you but the bubble. Now EVERY emote plays on you,
  a friend and the nearest townsperson through one shared module (`lib/graphics/emotePose.ts`: `emoteBody` = raised arm + hop,
  `applyEmoteArms` = cheer / clap / Dance / Laugh / Thanks / Pass to me / Space arm poses). Length `emoteSeconds(kind)` in
  `lib/town/emoteReact.ts`: 4 s (Cheer = two cheers back to back; Wave keeps waving; Well played = ~10 claps; Laugh = belly shake + tiny
  hops; Thanks = palms together, three bows; Dance = pumps, hands on hips, a full spin, hops, arms-up finish); High five 2.2 s unless a
  variation (its own length); Pass it ~5.9 s. Walking away ends an emote at once; the townsperson's cooldown starts after its reaction.
  Range is horizontal 9 m (a rooftop / other floor, > 4 m up or down, is a different scene).
- **Dance = ten whole-body dances; Space became Show off** (user, 22 Oct 2026: "many of them look similar ... standing and just waving
  their arms", "replace the space one with something else"). `lib/town/emoteDance.ts`: floss, robot, running man, moonwalk, disco point,
  spin and dip, hip-hop bounce + arm wave, Macarena, jumpstyle kicks, wiggle worm. `lib/town/emoteShowOff.ts` (wire value 4, enum key
  `ShowOff`, wheel "Show off", glyph `show-off`, bubble \u{1F31F}): rainbow flick, step-overs, back-heel + heel click, around the world, knee
  slide, jump spin and pose, backflip, toe-tap keep-ups, scorpion kick, Cruyff turn, each ending in a pose; a townsperson reacts (gasp,
  cheer-clap, wobbly copy, not-worthy bows) or, for Dance, dances along with a DIFFERENT dance. One 27-channel pose (arms, legs, ankles,
  torso, head, hips hop / glide / spin / flip) written after `rig.update` by `lib/graphics/dancePose.ts` on the pelvis (so a friend's
  root reset cannot cancel it); the lowest foot or knee stays on the ground. Shuffled bags per emote (never the same twice in a row; a
  friend picks its own locally). Inside EMOTE_BOUNDS (hips glide <= 0.72 m, highest point ~2.4 m). Town keeps the heading during both
  (the move spins the body). Reduced motion: unchanged (bubble only). Tests: `tests/emote-dance-show.cjs`.
- **Whole-body Wave / Cheer / Laugh** (user, 22 Oct 2026: "many of them look similar ... standing and just waving their arms ... make them all
  very different"). Six variants each in `lib/town/emoteBody.ts` (pose functions: in-place travel, hop, crouch, spin, torso, head, both arms and
  legs), written on the rig by `lib/graphics/bodyEmotePose.ts` through `applyEmoteArms`. Wave: windmill shuffle, jumping hello, royal wave +
  curtsy, wave / heel click / salute, "hey, over there!", shy wave + peekaboo. Cheer: double-jump fist pumps, goal run + aeroplane turn, knee
  slide roar, pom-pom kicks, stadium bounce, victory spin + flex. Laugh: doubled-over knee slap, belly laugh + tear wipe, point and stagger back,
  clutching-sides hop, thigh-slap spin, lean on your partner. Shuffled bag per actor (never the same twice in a row); a friend draws its own;
  the townsperson answers with a different variant (`BODY_ANSWER`) at 0.8 amplitude. Root stays within 1.0 m (EMOTE_BOUNDS 1.4 m); reduced
  motion unchanged (these poses never run under it). Guarded by `tests/emote-body.cjs` (bounds every frame, pairwise pose RMS, whole-body ranges).
- **Pass it** (wheel slot 5, icon = ball between two arrows, protocol value 6 `Emote.PassBall`, was Thumbs up): you and the nearest
  townsperson (or an imaginary friend 3.2 m ahead when none is near) pass one pooled ball (`lib/graphics/passBall.ts`) five times,
  player -> partner -> player ..., a lifted pass between the feet with a trap bounce (`lib/town/emotePass.ts passBallAt`); you face the
  partner and hop a little at each kick; the camera takes a side / high view (`ballPass` in `emoteCamera.begin`) so the ball between
  the pair is seen. Not on rides, reduced motion = the bubble and one pass. Friends see the bubble only.
- **Emote camera and walls** (user, 22 Oct 2026: "the building is covering the view"): `lib/town/emoteCamClear.ts` runs a multi-ray test
  (eye and a shoulder either side to the feet, chest, head and raised hands of BOTH characters) against every wall box (buildings
  with their real height, `ballWallGrid`) and the big props (`ballObstacleGrid`), needs the eye 0.6 m clear of any solid, and tries
  other headings (+-0.35 .. +-1.9 rad, the opposite side), gentler zooms and higher pitches (.36 / .6 / .9); if nothing is clear
  the zoom is skipped. During the zoom a wall that comes between (150 ms check) ends it. Guarded by `tests/emote-pass.cjs`.
- **Ride emotes v2: in-place vehicle tricks** (owner, 22 Oct 2026: "go back and fix the emotes for the scooter, bikes, and moped. don't have them
  ride away. it's impacting the zoom and going out of frame. create emotes using the different bike, scooter, and moped types so they are all
  different and unique"; replaces the first version's travelling scripts: Cruise by, Figure eight, Kick & glide, Lean & weave...). `EmoteControl`
  gets the ride (`rideMode`); on a scooter, bike or moped the wheel (`wheelEmotesFor`) shows **the TEN tricks of THAT vehicle** (Oct 23 2026: one per standard meaning, standard order; docs/emotes-ten-per-context.md; the five below + Wave, Pass it, Juggle, Well played, Dance / Laugh / Cheer / Thanks versions; foot-only
  emotes hidden; the button rule is unchanged: someone in front within the 75 degree cone, Town `emoteReachTick`). Data, pose math and rules in
  `lib/town/rideEmotes.ts` (local ids 60-89):
  - MOPED (an engine): Rev it up (three throttle blips, shudder, exhaust puffs, a wave), Burnout donut (one turn round the front wheel, rear wheel
    spinning, smoke, the left foot dabbed down), Wheelie pop (pop, bounce, drop, a second small pop, fist up), Kickstand salute (leans onto the
    stand, stands up, salutes, nods), Beep beep (two horn honks, suspension bounce, a fist shake).
  - SCOOTER (a kick scooter): Tail-whip (hop, the deck alone whips 360 round its stem, catch, "ta-da"), Hop 180 (hop half round, wave facing back,
    hop back), Flamingo wave (back foot up behind, balancing sway, a wave), Kick bounce (kick-push on the spot, deck bounce, a little hop), Nose pivot
    (back wheel up, a full turn round the front wheel).
  - BIKE (a pedal bike): Ring-a-ding (two bell dings with a spark, a look left and right, a wave), Wheelie (long front-wheel-up hold with a balance
    wobble), Bunny hop (two hops, the second higher), Stoppie (back wheel up about the front axle, rider leans back), No hands! (both arms up in a V,
    pumping, balancing wobble).
  **Nothing travels.** A rolling ride first brakes (`brakeSeconds`: 0.4-0.8 s, speed eases out as (1 - t/T)^2, about a metre; in play ~0.3 m from
  6 m/s), then the trick is a visual pose of rider + vehicle written after the ride pose (Town, next to the `trickPose` block): pitch about its axle
  (`PIVOT`: rear for a wheelie, front for a stoppie / nose pivot), yaw about a wheel (`YPIV`, the donut), hops, a vehicle-only yaw (`VYAW`, tail-whip),
  extra wheel spin into `vehicle.update` (burnout / revs), `mopedStand` for the salute and `rideTrail`'s action dust for exhaust / smoke. The rider's
  arms, head, chest and legs come from `lib/graphics/rideEmotePose.ts` (`applyRideTrickBody`, named joints, no allocation). Location and heading
  never change, so control comes straight back; it ends at once on ANY real input, a dismount / ride change, a blocked stop (while braking), a car
  within 10 m, water, a ramp or a fall. Every trick's root stays inside `EMOTE_BOUNDS.rootRadius` (worst 0.94 m, the donut) and under `maxHeight`
  (2.74 m). Cues: bell (job sting + spark), horn (`sound.honk`), rev (`sound.boost`).
  **Tyres on the ground** (owner, 23 Oct 2026: "looks like it's going into the ground too much"): the pitch turns about the real axle (`PIVOT` z and
  `PIVY` height, snapped by `sampleRideTrick` to the rear axle for nose up, the front axle for nose down; the nose pivot also yaws round that front
  axle, worst root travel now 1.13 m), so the wheel left down never sinks (was up to 11 cm in the stoppie). The older ride tricks (`rideTricks.ts`)
  lift by `rideGroundLift` (`lib/town/rideGround.ts`, analytic tyre bottom after roll + pitch); friends' ride tricks lift about the axle too; the
  landing squash no longer drops the ride 5 cm; the mountain bike's knobbly tyre matches the wheel radius (it sat 3 cm under). Gate:
  `tests/ride-ground.cjs` (real meshes via `scripts/check-ride-ground.cjs`: every variant, idle + every emote / trick frame, <= 2 cm).
  Camera: the normal solo / pair framing, framed where the ride stops, each character widened by half the vehicle length + 0.45 m trick room
  (`emoteCameraMath.ts rideWideFor`: scooter 1.3, bike 1.8, moped 1.9 m long); it follows the ride's location, not the trick sway. The nearest
  townsperson faces you and waves (calm tricks) or cheers (big ones), stepping to 2.4-3 m from the stop point so the pair fits; farther than
  `pairMaxGap` it is a solo frame. Friends: the trick goes out as an existing wire value (1, 2, 4, 5, 7, 8 or 9, never 0 Wave or the ball emotes
  3 / 6) and their avatar plays the same trick from the SENDER'S ride mode (`emoteContexts.ts flourishForWire` -> `flourishAt` root pitch / roll /
  lift + `celebrations.applyRideEmote` -> `applyRideTrickBody`; old clients see the wire value's bubble). Analytics: `em:e60`..`em:e74`
  (`countIds.ts`, labels `<trick> (<vehicle>)`). Guarded by `tests/ride-emotes.cjs` (bounds, brake, pairwise variety, friend path, phone/desktop
  frame) and `tests/emote-pass.cjs`.
- **Flying emotes** (user, 22 Oct 2026: "emote btn should be disabled while flying unless there is another friend flying nearby ... those emotes should be different too"; `lib/town/emoteContexts.ts`, `tests/emote-contexts.cjs`). Flying = the jetpack / glide ride or any jetpack action phase. Flying alone: the Emote button is greyed (`data-disabled`, `aria-disabled`, title explains), no wheel. A party friend flying (protocol `Mode.Jetpack` / `Parachute`) within 40 m (3D, `nearestFlyingFriend` over `PartyRuntime.friends()`) enables it, and the wheel shows the FLYING set: Wing wave, Barrel roll, Loop-de-loop, Fly-by high five, Side-by-side glide (local ids 20..24). `emoteCtxStore` (flying / friendFlyingNear / swimming) is written on the HUD tick only on a change; the button reads it with `useSyncExternalStore`. A flourish is a VISUAL offset only (`flourishAt`: roll / pitch / lift on the rig root, added after the pose next to `trickPose`, plus one arm via `applyRideEmote`); velocity, altitude and steering are never touched, steering does not cancel it, landing does. Friends receive an existing wire value (Wing wave 0, Barrel roll 1, Loop 8, Fly-by five 2, Side glide 9; no protocol change) and their avatar (`remoteAvatars.ts`) picks the flying flourish from the SENDER'S mode via `flourishForWire`. The camera (`emoteCamBlocked` gets `ctx`) frames you and the friend in the air when they are within 14 m (else you alone), with the usual occlusion test.
- **Swimming emotes** (user, 22 Oct 2026: "different emotes for friends swimming on the water"; same module / wiring as the flying set). While swimming (`water.swimming`, not diving, not on an animal ride) the wheel shows the SWIM set (local ids 30..34): Splash wave (wire 0), Water spray cheer (1), Duck-dive pop-up (8), Back float (4), Tread & laugh (7). Pure pose offsets on the swim rig (`flourishAt`: pitch tip-over / back lie, small lifts, hands up via `applyRideEmote`) plus `ballEffects.swimRipple` rings at the splash beats; swimming does not cancel it, leaving the water does. The camera is water-safe: `emoteCamWorld.floorAt` is raised to `WATER_LEVEL` for a swim emote (so the eye is never inside the sea) and the follow camera's existing waterline clamp still runs. Friends (sender `Mode.Swim`) show the same flourish from the same wire values. No lifeguard / swimmer townsfolk exist in the water, so only friends answer. Play-test hook: `__fi2.emoteTest.fakeFriends`.
- **Emote camera angles** (user, 22 Oct 2026: "for mobile and desktop, make sure to have better angles where we can see both characters better"; `emoteCameraMath.ts`, `emoteCamera.ts`, `tests/emote-contexts.cjs`). The heading (`bestEmoteYaw`) now looks ACROSS the line between the two characters (every heading round the circle is scored: frame distance, depth difference between the two, turn from the follow camera, screen separation), on the side the multi-ray occlusion test (`emoteCamClear.ts`, passed in as `ok`) accepts; the old "gentler zoom / other heading" search remains as the fallback. With the two almost on top of each other, or alone, the view is a three-quarter FRONT-side view of the player (`soloYaw`, 0.8 rad off the facing, side nearest the follow camera; a rider gets `rideYaw`, side-on) instead of a back view. A moving partner never whips the camera: the heading changes at most `YAW_RATE` (1.1 rad/s) and is only recomputed (from the current heading) when the pair axis turns > 0.5 rad. `emoteLayout(aspect)`: portrait phone (aspect < .75) a higher pitch (.5) and a tall margin, landscape phone (> 1.95) wide margins, desktop a lower cinematic pitch (.26); the framed zone (feet to ~4 m: head + ~2 m for the floating / dissipating emoji, target lifted so the characters sit LOWER with headroom) stays inside the middle ~57 % (portrait) / ~67 % of the screen, i.e. clear of the top HUD (~18 %), the joystick and the action grid (`emoteSafeBand`).
- **Emote emoji animate and dissipate** (user, 22 Oct 2026: "the emoji icons above it should animate and dissipate into the air. remove the round background"; `lib/town/emoteBubbleMotion.ts`, `lib/graphics/emoteBubbles.ts`). The emoji is drawn alone (soft shadow, no disc). Each slot (you, the answering townsperson) owns 4 pooled sprites: a copy pops in (overshoot), floats up with a sway for ~1.7 s and dissipates (fade, extra upward drift, +30 % growth); a 4 s emote emits a copy every 0.8 s (up to 4). Friends' avatars (`remoteAvatars.ts`) repeat one sprite through the emote with the same motion (`cycleFrame`). Reduced motion: no float, one copy, a brief fade in / out. The camera zone (feet to ~4 m, target lifted) keeps the rise in view below the top HUD. The speech line for busy field players (`showText`) is a separate sprite that keeps a rounded background. Nothing is allocated per frame.
- **Ball emotes use THE player's ball; Pass it is a ground pass; Pass to me became Juggle with me** (user, 22 Oct 2026: "for the kick in the ball emote, the npc needs to kick the ball", "it should use the existing one, not add another ball", "pass it to me should pass on the ground ... change pass to me to juggle with me"; `lib/town/emotePass.ts`, `lib/graphics/islandNpcs.ts`, `tests/emote-pass.cjs`). The pooled pass-ball mesh (`passBall.ts`) is deleted: Town drives the player's own `ball` mesh (`passOnBall`, after the normal dribble placement) and the normal dribble resumes at the feet when the emote ends; a ball that is away is summoned first with `walkBall.reset`; a real kick, a ride or the sea ends the emote. Both sides use the rig's own strike (`PlayerMotion.windup` then `kick`, `actionKind` 'pass' / 'loft', `receive` for the trap, `juggle` + `juggleTouch` for keep-ups): the ball stays on the passer's foot until the kick phase reaches `STRIKE_CONTACT` (.36) and leaves on that frame, for you and for the townsperson. **Pass it** (wire 6, 3-4 m apart, `PASS_GAP`): five low rolling pushes (tiny bounce), the receiver cushions the ball (trap) then winds up and passes back; ~7.4 s. **Juggle with me** (wire 3, key `Emote.JuggleWithMe`, label / aria 'Juggle with me', glyph `juggle-air`, emoji 1F939): the townsperson steps to 6-8 m (`JUGGLE_GAP`, clear paths only), the ball goes back and forth in high arcs (peak ~3.4 m): each holder keeps it up twice (you: foot, knee; the townsperson: foot, head) then a loft kick on the contact frame; 4 transfers, ~9 s; alone a solo keep-up routine (~5.4 s). Not on rides, flying or swimming; friends see the bubble only. The camera lets a wide pair sit back to 32 m with a higher pitch; if the pair cannot fit even then (a wide pair on a portrait phone) it keeps the follow camera, which already shows both, and the wall watch waits until the ease-in has finished.
- **Ball emote routines** (user, 22 Oct 2026: "many of them look similar ... make them all very different", "let's not have any emotes leave the screen"; `lib/town/emoteBallPlay.ts`, `tests/emote-ball-play.cjs`). Pass it and Juggle with me each draw the next of SIX authored routines from a shuffled bag (never twice in a row; 3 solo juggles when alone). Pass it: one-touch wall passes, skill then pass (stepover / croqueta / elastico), heel back-pass (roulette, Cruyff turn), trap-turn-and-pass (drag-back spin), no-look pass with a jump spin, drag-back through-ball with a chip and thigh control. Juggle with me: thigh keep-ups + header across, around-the-world + volleys + a scissor-kick pop, chest-and-flick, shoulder roll + neck stall, rainbow heel flick, knee count (bubble counter) ending in a catch behind the back and a bow. Both actors play their half on one clock with the rig's own strike / cushion / keep-up / chest / thigh / header / signature-move / skill / jump / spin / trick-pose layers; the receiver calls for the ball. Everything plays in place inside `EMOTE_BOUNDS`: the townsperson steps to 2.9-3.6 m (Pass it) / 2.7-3.4 m (Juggle, was 6-8 m), gravity arcs stay under 3.2 m. A friend's avatar plays a solo routine's body (no ball on their side).
- **Seated townsfolk stand up for an emote** (user, 22 Oct 2026: "bench still an issue, have the npc get off the bench to make it easier"; `lib/town/npcStandUp.ts`, wired in `islandNpcs.ts` + Town `standArm`). When the pick is a SEATED townsperson (bench or towel; lying ones stay busy) she stands first: rising (lean forward, 0.55 s: only the seat pose's blend `w` and a torso lean are driven, `npcSeatPose.ts` / `tests/seat-fit.cjs` are untouched), steps straight off along the bench's open side to a clear spot (`openFront`: 1.5 / 1.7 / 2 m ahead, then up to 60 degrees either side, walkable and >= 1 m from anyone; the game's bench collision padding keeps the first ~1.4 m unwalkable), faces you, and only THEN does the player's emote start (so the camera, kicks and juggles happen in the open). Afterwards she waits 0.8 s, walks back and sits down with the sit animation (no pop), with a 20 s cooldown before she can be picked again; she is not pickable while up (except to react again in front) and goes back if you walk away. No clear spot / reduced motion = she stays seated and just waves.
- **The Emote button shows only when there is someone to emote with** (user, 22 Oct 2026: "emote btn only show when there is a npc or friend to interact with", then "when flying also remove the emote btn unless near another player that's flying"; this REVERSES the earlier "always shown, works solo" rule; `emoteButtonState` / `emoteCtxStore` in `lib/town/emoteContexts.ts`, `emoteReachTick` in Town). Rule: on the ground or a ride, shown when a townsperson that would answer is within 9 m (walkers, seated, skaters, scooter riders, jugglers and the busy field players all count; hidden / stunned / lying ones do not) or any party friend is within 40 m; while FLYING (jetpack / glide) it is removed unless a party friend who is also flying is within 40 m (ground townsfolk and walking friends do not make it show); while SWIMMING only a swimming friend (no townsfolk swim). Hidden = `data-hidden` + `aria-hidden` + `tabindex -1`, `opacity` / `scale` fade 0.18 s (instant with reduced motion) and `pointer-events:none`; the grid cell stays reserved (the button is only `visibility:hidden`), so the desktop 2x2 (Emote bottom-left) and phone 3x2 layouts never jump. An open wheel closes when the last candidate leaves. Town computes the flag at ~4 Hz (`nowS - reach.at < .25`), only writing the store on a change; the solo Juggle routine and the imaginary Pass-it partner stay in code for a friend-only audience.
- **Townsfolk with their own thing** (user, 22 Oct 2026; `lib/town/npcEmoteSets.ts`). When the townsperson you would emote at is a SKATER (`travel: skateboard`), a SCOOTER rider (`travel: scooter`) or a JUGGLER (court freestyler) the wheel shows that set instead of the ground set (a bike / moped ride keeps its ride wheel; on a scooter beside a scooter rider the scooter pair set shows). Skater: Skate high five, Trick exchange, Wave while gliding. Scooter: Ride-by wave, Bell ring (bubble + the island's sting cue), Side-by-side glide (when you also ride a scooter your own scripted Kick & glide runs too). Juggler: Count my keep-ups (a bubble counting "7... 8... 9!" one per beat), Nice header, Catch & bow, Nice touch. Local ids 40..49, friends only get the protocol value in `wire`. The townsperson keeps its route: only its speed dips to a fraction (0.35 - 0.8) and returns (`routine.speed = baseSpeed * slow`), plus a short overlay on top of its pose (a raised hand, a small spin, a bow lean); jugglers keep their ball logic untouched (overlay only: arm poses, a lean, text). No collisions, no teleports.
- **Busy field players** (user, 22 Oct 2026: "if you try to do an emote with players that are playing on the field they say things like 'Hey leave me alone I'm playing'"). The beach volleyball rally players answer ANY emote with ONE short refusal bubble (no animation change, they keep playing): ten lines of <= 8 words ("Hey, leave me alone, I'm playing!", "Get off the field, I'm busy!", "Not now, game's on!", "Can't talk, I'm mid-match!", ...) drawn from a shuffled bag (every line once per bag, never the same line twice in a row), 3 s cooldown per player, the nearest within 9 m wins when no friendlier townsperson is nearer. The bubble is the text sprite of `emoteBubbles` (`showText`, rounded background).
- The party chip stays top-left (members / menu); its separate Emotes button is gone. Guarded by `tests/emote-grid.cjs`.
- **Moving emotes: walking and running** (user, 22 Oct 2026: "do the walking emotes"; `lib/town/moveEmotes.ts`, writer
  `lib/graphics/moveEmotePose.ts`). On foot above ~0.9 m/s (back below 0.45 m/s; `moveWheelOn`, Town's ~4 Hz reach tick) the wheel
  (`data-emote-ctx="move"`) shows FIVE moving emotes instead of the ten standing ones, Wave first: **Wave on the move** (big arc wave /
  two-hand hello / look-back wave), **Victory jog** (fist pumps / sky punch / aeroplane lap), **Skip** (skip and swing / arm-circle
  skip / clap skip), **Strut** (collar pop / hair flip / finger guns), **Run-by high five** (side high five / low five / jump five;
  spark at the slap). Three variants each from a shuffled bag. Pure upper-body overlay on the walk / run cycle (arms, torso lean /
  twist / side bend, head, hip sway, a <= 0.22 m bounce on the walk bob): velocity, input and the legs are never touched, so the
  emote never stops or slows you. Stopping eases it out within 0.6 s; a ride, flying, water, a job, a lesson, a menu / dialog / room
  ends it; a standing emote still needs you to stand still (and takes over a moving one). Camera: NO pair zoom (`emoteCamSkip`
  'move'); only a gentle eased nudge toward you (<= 10% of the follow distance, `moveNudgeGoal`), none when running fast, never a snap.
  The button rule is the same as standing: shown only with a townsperson or party friend to answer. The townsperson you pass turns
  its head and answers on its route (wave / fist pump / clap / nod; the run-by five gets its air-five half and a brief slow-down); a
  seated one only turns its head and waves a little (no stand-up); field players refuse as usual. Friends: no new wire values (wave 0,
  jog 1, skip 8, strut 4, run-by five 2): a friend whose sender mode is Walk / Run and who is moving plays the moving version over
  their own walk cycle (their own variant bag), with the usual emoji bubble. Reduced motion: bubble + the single raised arm.
  Analytics: em:e50..e54, em:ctx_walk, em:move_<n> (counts only, through Town). Guarded by `tests/emote-walking.cjs`.
- **Handshake emotes** (user, 22 Oct 2026: "the handshakes need to be like the arcade ones where it's more complex ... make them all very different"; supersedes the variation list below). HIGH FIVE (10), THANKS (5) and WELL PLAYED (5) are whole-body, multi-beat PAIR choreographies in `lib/town/emoteHandshakes.ts`, written by `lib/graphics/handshakePose.ts` (arms, chest lean / twist / side bend, head, both legs with planted-feet crouch and knee lifts, root hop / step toward the partner at the real gap / side shuffle / spin); `highFive.ts` / `highFivePose.ts` keep the old API so a variation `v` is a global index (0-9 high fives, 10-14 thanks, 15-19 well played) for you, townsfolk (same clock, own half) and friends (own pick, wire unchanged). One shuffled bag per emote; spark ring at every contact; everything inside `EMOTE_BOUNDS`; reduced motion keeps the bubble + raised arm. Tests: `tests/emote-handshakes.cjs`, `tests/high-five.cjs`.
- **High five variations** (user, 22 Oct 2026: "the high five emote only waves ... ten variations, randomized"). High five plays a
  real sequence, 1.5-2.5 s, one of TEN (`lib/town/highFive.ts`, shuffled bag `nextHighFive`: all ten before any repeat, never the
  same twice in a row): Classic, Low five, Double high five, Jump five, Spin five, Slap then fist bump, Behind-the-back five, Up-top
  fake-out, Secret handshake (five, snap, clap, fist bump), Wave then five. Classic, Double, the fist bump and the handshake's two
  contacts are the ARCADE's own rig-native `highFive` / `fistBump` skill poses (`lib/graphics/skillMoves.ts`, as played by
  `lib/arcade/arcadeSocial.ts`; windows in `segs`, the partner on the opposite side); the rest are small keyframed tables (arms,
  elbows, chest lean, hop / crouch, spin) written by `lib/graphics/highFivePose.ts` right after `rig.update`. Each variation has a
  player half and a townsperson half on ONE clock; the pooled spark ring pops at each `hits[]` time at the midpoint of the two
  hands (an "air five" toward the camera side when nobody is within 5 m). You turn to face the partner; walking away ends it.
  Friends: the wire format is unchanged (no spare field in `Emote`), so each screen picks its own variation for a friend's high five
  (air five, `remoteAvatars.ts`). Reduced motion: no sequence, bubble + a single raised arm. No new draw calls or per-frame allocation.
- **Emote camera** (zoom closer, frame both: user, 22 Oct 2026, "each emote should zoom in more and show the interaction") (`lib/town/emoteCamera.ts` + `emoteCameraMath.ts`, reusing `shotCamera.ts`): every emote eases the island camera in
  (0.45 s) to a closer three-quarter view of you (and the answering townsperson), holds for the emote, and eases back out (0.5 s) to
  exactly the follow camera. The distance is solved so the feet and raised hands of BOTH characters fit at the phone or desktop
  aspect (min 3.2 m), from the heading that frames the pair closest (side by side preferred); the pair is tracked for the whole
  emote and a townsperson that reacts a moment later fades into the shot. On a ride it frames rider + vehicle a bit wider and ends
  above 16 m/s, on a turn sharper than 1.8 rad/s, or on dismount. Never fights the player: movement on foot, a menu, a jetpack /
  zipline / truck ride, flying, swimming, a job, a lesson, a tap on the
  screen cancel it at once; reduced motion and already-close (room) cameras skip it; trees / buildings in the sight line shrink the
  zoom (or skip it); a new emote extends the zoom; 0.6 s cooldown after it ends. Guarded by `tests/high-five.cjs`.

## Keep-ups pill (22 October 2026)

The island's counted keep-ups show the Konbini's pill (`components/KeepUpCounter.tsx`, "Keep-ups: N  best M") in the **task**
slot: it is what the player is doing right now, so a toast never pushes it away and it never covers a button. It appears on the
first touch, stays live while the run lasts and fades ~1.8 s (2.6 s on a new best) after the drop; hidden off foot and in a
lesson. No animation with reduced motion. It is pointer-transparent like the rest of the column.

## Room party chip (rooms Phase 1, 22 Oct 2026, `docs/multiplayer-rooms-design.md` 3.3)

- **Where:** the room page's own header slot, NOT the island `.hud-stack`. Konbini header (owner, 22 Oct 2026): a 3-column grid
  `minmax(0,1fr) auto minmax(0,1fr)`: the "N here" chip on the LEFT edge, the coins pill at the true screen centre (within 2 px;
  <= 380 px it trims its padding and drops the "coins" word first), Done on the RIGHT edge; safe-area insets stay in the header
  padding; Back takes the left cell while zoomed and the section pill drops to a centred second row. No party: coins stay centred.
  **Konbini Emote button rule:** shown only when something is near to emote at: a live-party friend in the room within 8 m and
  not busy (force-fielded friends do not count, as on the island). The cashier behind the counter NEVER counts. The Konbini has
  no customer NPCs besides the clerk, so only friends count (`lib/konbini/emoteRule.ts`, pure; sampled by the scene at ~4 Hz, no
  allocation, pushed to `RoomEmoteDock` via `onEmoteNear`; Battery saver: friends do not count). Hidden = fade 0.18 s (instant
  under reduced motion), `visibility:hidden`, grid cell reserved so keep-up / kick never move; an open wheel closes with it. Future rooms put
  it in their header's actions group and pass `align="right"` when that group sits on the right.
- **What:** `components/party/RoomPartyChip.tsx`: a cream pill (your colour dot + "N here", >= 44 px) and a round gold Emote
  button (44 px). The wheel (`EmoteWheel.tsx`, the island presets) and the read-only roster open as popovers under the chip, from
  the chip's side (`data-align`). Owner decision: **Leave only** in rooms (no invite, code, kick, lock or End; the roster says the
  host buttons are on the island); Hide / Mute per friend as on the island.
- **When:** only while a party is live / reconnecting. Hidden (and its popovers closed) while the room is covered (overlay,
  reveal, pack reveal, cashier chat, stamp card) and on the shelf zoom: one calm header at a time.
- **Island side:** a small screen-sized "N in the Konbini" label over each Konbini roof while party friends are inside THAT shop
  (world-anchored, client-only, from the roster; `townBridge.ts` door hints); the Party list line says "In the Konbini".
- **Museum (rooms Phase 2, 22 Oct 2026):** the chip sits top-right in the museum header, LEFT of Done (`.partySlot`, order 1,
  `align="right"`: wheel and roster open from the right edge). Shown only while walking the hall: not rendered on an exhibit zoom
  (Back + the case name own the header then) and hidden under every cover (Ada's panel, a certificate, the World Cup balls, an
  exhibit experience). Island side: "N in the Museum" above the museum canopy (`MUSEUM_DOOR_HINT`, `lib/museum/museumDoors.ts`);
  the Party list says "In the museum".
- **Kit Shop (rooms Phase 4, 22 Oct 2026):** wide screens: the chip is a header item right after the KIT SHOP title, before the
  coin pill and My kit (Done stays the last item, top-right). Phones (<= 560 px): that row is already full, so the chip takes its
  own row under the title (`.partySlot`, top-left, safe-area + 58 px) and Femi's hello / the walk hint move down below it
  (`.root[data-party]`). Hidden with the whole header while a studio is open, and hidden (popovers closed) under My kit or a chat.
  Island side: "N in the Kit Shop" over the shop's double door (above the canopy, `lib/town/shopDoorHint.ts`); the Party list
  says "In the Kit Shop".

## Top row on phones (23 October 2026)

Owner: "what if we just made the coins bar smaller width wise and only show coins and energy? Those are the two most important
info needed." With the multiplayer flag on, the row is **Paths · Play with friends · coins bar · Settings**, and the full bar
(coins, fish, fruit, bolt) collided with the friends button on phones (UI_AUDIT_OCT22).

- **Phones** (`max-width:480px`, or `max-height:480px` in landscape, or `max-device-width:480px`; was 430px, see below): the bar shows **coins + the fuel bolt** only. Fish and fruit
  (`.basketOnly`, `data-wallet-basket`) are hidden; they stay in the button's aria-label and one tap on the bar opens the island
  pocket, which lists fish, fruit, veggies and beach finds with counts. Desktop and tablet keep all four counters.
- The phone bar is a little tighter (gap 4px, padding 4px 8px; 3px / 6px at ≤ 380px). On ≤ 400px a 4-digit balance steps down to
  17px (14px at ≤ 380px; 5 digits 15 / 12px) and the fuel word "Low" / "Empty" gives way (the number, the ring and the hollow bolt
  still show the state; the aria-label keeps the word).
- **≤ 340px**: the centred bar has no room beside Paths + friends, so the friends button drops under Paths in the left column
  (8px gap, `IslandSettings.module.css`), and the HUD stack starts one button lower there (`globals.css`, only while the friends
  button exists). The stack stays centred and under the bar everywhere.
- Measured by `node scripts/check-hud-row.cjs <url>` (app built with `NEXT_PUBLIC_MULTIPLAYER=1`): every pair of
  [Paths][friends][bar][Settings] is ≥ 8px apart at 320×568, 360×740, 390×844, 430×932 and 844×390, with 3-, 4- and 5-digit
  balances and full / low / empty fuel, and on desktop 1280×800 with all four counters. Narrowest margins (friends ↔ bar):
  360px 11px (4 digits 9px), 390px 23px (4 digits 14.5px), 430px 43px, 320px 43px (friends under Paths).
  `tests/hud-stack.cjs` pins the CSS it relies on.
- **Position (owner, later on 23 Oct)**: Paths + Play with friends on the left, Settings on the right, and the slim coins + energy
  bar in the **true centre of the screen** (`left:50%; transform:translateX(-50%)`, like the HUD stack), not pushed against
  Settings or centred in the leftover space. `check-hud-row.cjs` fails if the bar's centre is more than 2px off the viewport
  centre. It fits at 360px and wider (tightest: friends ↔ bar 9.1px at 360 with a 4-digit balance; 14.5px at 390; 21px at 430;
  bar ↔ Settings ≥ 61px). At ≤ 340px a centred bar cannot keep 8px beside Paths + friends, so the existing rule keeps the friends
  button under Paths there; the bar still centres (41px each side at 320). Desktop (1280×800) and touch tablet (768×1024) are not
  phone breakpoints: all four counters show and the bar stays centred (also checked by the script).
- **Superseded (owner, final, 23 Oct): phone bar right-aligned next to Settings.** On phones the row is two groups: **left** =
  Paths + Play with friends (side by side at the left edge), **right** = the coins + energy bar immediately followed by Settings
  (flush right). The bar <-> Settings gap equals the Paths <-> friends gap: both read `--island-hud-pair-gap` (8px, `globals.css`;
  the triggers' flex gap in `IslandSettings.module.css`; the bar's `right:calc(18px + safe-area + var(--btn-icon) + var(--island-hud-pair-gap))`
  in `IslandJobs.module.css`). The free space sits in the middle and is >= the pair gap at 320-440px with 5-digit coins and
  low / empty fuel, so no extra shrinking was needed beyond the existing digit steps. Desktop (1280x800) and tablet (768x1024)
  are unchanged: all four counters, centred, same rect as before (pinned in `check-hud-row.cjs`).
- **Superseded again (owner, 23 Oct, stretched bar): the phone bar fills the row.** Row = Paths | friends | [bar] | Settings with
  the same `--island-hud-pair-gap` (8px) between each pair. The bar is anchored on both sides in CSS (`IslandJobs.module.css`, phone
  breakpoint): `left` = 18px + safe-area + Paths 44px + gap (`--hud-bar-left`), plus friends 44px + gap when Play with friends is on
  (`.town-app:has(nav[data-hud-triggers]>[data-party-open])`), plus 1px while the party badge shows (it sits 4px past the 3px
  border); `right` = 18px + safe-area + Settings 44px + gap. At <= 340px friends sits under Paths, so the bar starts at Paths + gap.
  While fishing (Paths hidden) it starts at the Back pill + gap. The HUD stack is untouched and stays centred.
- **Four counters only where they fit (owner).** The phone bar is a size container (`container:hudbar / inline-size`); fish and
  fruit show again but give way by the bar's own content width (bar - 4px border - 16px padding), never by device width, and never
  by shrinking the coin number (always 20px now; the old 4/5-digit font steps are gone). Thresholds, measured in Chromium + WebKit
  for >= 8px between chips with the worst case (fish and fruit 2 digits, the basket holds 20; fuel "100"): **222px** with <= 3
  coin digits, **234px** with 4, **241px** with 5. Below: coins + energy only, at the two ends of the stretched bar (auto margins).
  The Low / Empty word ("0 EMPTY" is the widest) shows in four-chip mode from 242 / 254 / 261px and in two-chip mode from 160px;
  otherwise it hides (number, ring, hollow bolt). In practice: portrait 320-430px phones show coins + energy (content 147-218px);
  440px (iPhone 16/17 Pro Max, content 228 / 227 in a party) shows four with <= 3 coin digits; every landscape phone shows four. `check-hud-row.cjs` now covers 320/360/375/390/393/430/440 portrait and landscape, solo and a party of 4, 3/4/5
  digits, full / low / empty fuel, plus a 1px sweep 416-476px (full and empty fuel) across the thresholds; it asserts equal pair
  gaps (1px), counters inside the bar with equal spacing (2px) and >= 6px apart, the mode matching the threshold, and the
  desktop / tablet rects unchanged.
- **Why fish / fruit still showed on the real iPhone**: the phone breakpoint was `max-width:430px`, but the iPhone 16 / 17 Pro Max
  are **440 CSS px** wide (440 tall in landscape), so they got the desktop bar (reproduced on production with Playwright WebKit and
  the 'iPhone 17 Pro Max' descriptor: fish / fruit `display:flex`, bar left edge touching the friends button). Phones are now
  `max-width:480px`, landscape `max-height:480px`, or `max-device-width:480px` (an iPhone whose layout viewport is wider than its
  screen, e.g. Request desktop site). No service worker is involved; the deployed CSS did contain the old rule.
- `scripts/check-hud-row.cjs` now measures 320, 360, 375, 390, 393, 430, 440 portrait and 844x390 landscape, plus a
  WebKit pass with the 'iPhone 15', 'iPhone 17 Pro Max' and 'iPhone 17 Pro Max landscape' device descriptors; given a relay URL it starts a party with three
  scripted friends (badge 4) first. The friends box includes the party badge.

### Narrow windows: HUD_NARROW = 660px (23 October 2026)

- **Bug (owner):** a desktop browser window at its smallest (~497 x 958 CSS px, fine pointer) still got the centred desktop bar,
  with a big gap before Settings, because the stretched layout only applied under the phone predicate (<= 480px).
- **Breakpoint:** the stretched, container-driven bar and the short coin number (`1.2k`) now apply under ONE predicate,
  `@media(max-width:660px),(max-height:480px) and (orientation:landscape),(max-device-width:480px)` (3 uses in
  `IslandJobs.module.css`: the bar, the fishing + party start, `.coinFull` / `.coinShort`). The roomy desktop pill
  (`(min-width:661px) and (pointer:fine)`) and the compact fuel chip (`FuelCount.module.css`, `(max-width:660px),(pointer:coarse)`)
  moved with it, so the bar's chips measure the same as on phones and the `hudbar` four-chip thresholds stay valid.
- **Why 660:** measured on the old build (fine pointer, party of 4 with badge, 5-digit coins, fish / fruit 2 digits), the centred
  bar came closer than the 8px pair gap to Play with friends up to **607px** (full fuel) and **635px** ("0 Empty", the widest);
  Settings was never the tight side. 660 = 635 + 25px margin; at 661px the centred bar keeps >= 20px each side. The 768x1024
  tablet and every desktop width above 660 are unchanged (centred, 1280x800 / 768x1024 rects pinned in `check-hud-row.cjs`).
- **Edge inset:** Paths / Settings sit 24px in on fine-pointer windows over 600px and 18px otherwise; the bar uses one variable,
  `--island-hud-edge` (`globals.css` `:root`, 24px / 18px under `(max-width:600px),(pointer:coarse)`). So at 600 -> 601px the
  stretched bar's edges move 6px with the buttons. The pair gap stays `--island-hud-pair-gap` (8px) everywhere; the Back pill
  (`FishingHost.module.css`) and `.hud-stack` already followed the 600px edge and needed no change.
- **Check:** `scripts/check-hud-row.cjs` adds a fine-pointer (not isMobile) sweep, every width 320-900 x 958, full / empty fuel,
  3-5 digit coins, solo and party of 4 (`HUD_ONLY=narrow` runs just this): the phone asserts at <= 660, centred with >= 8px to
  every neighbour above, >= 16px just past the breakpoint, bar never grows across it, and no bar edge moves > 1.5px between
  neighbouring widths except 340/341, 600/601 and 660/661. Known: at 341-343px with a 5-digit balance coins and fuel are only the
  CSS minimum 4px apart (pre-existing on phones; not an overlap).

## Pocket keeps the coins bar (23 October 2026) - SUPERSEDED

Superseded the same day by "Pocket covers the HUD row" below; kept for history.

Owner report (phone): tapping the coins bar opened the island pocket and the bar vanished with the column. Now `IslandJobs` gets
`pocketOpen` (Town: `balancesOpen`); while it is set and the jobs UI is otherwise `blocked`, only the coins bar renders
(`aria-expanded`, `data-pocket-open`, gold ring). The drawer `<dialog>` starts under the HUD row (`--pocket-top` = row top + row height + 8 px),
its backdrop is transparent, so the bar is neither covered nor dimmed. The bar is inert under the modal; a tap on it (or the backdrop) lands on the
dialog and closes the pocket, as do Done and Esc. The rest of the column still hides under the pocket (`stackCovered`, and the "held" notes wait).

## Pocket covers the HUD row (23 October 2026)

Owner report (real iPhone): the pocket starting under the row left Paths, Play with friends, the coins bar and Settings showing above it,
and pushed the title and Done down. Reversed: the pocket `<dialog>` is `inset:0` again (no `--pocket-top`), and while it is open
`.town-app:has(.dialog[open])` hides `nav[data-hud-triggers]` and `[data-job-wallet]` (visibility + pointer-events). `IslandJobs` no longer
gets `pocketOpen`: `blocked` hides the bar as for every other panel, and the gold "open" ring is gone. The header sits in the row band:
ModalShell's phone header padding-top is `16px + env(safe-area-inset-top)` (= `--island-hud-row-top`), desktop 20 px, with the side
insets; the pocket's header is `[title][Done]` (title left on one line, Done 44 px tall where Settings was). Done, Esc and a tap on the tint
close it; focus returns to the coins bar for keyboard users (pointer users are blurred by the HUD focus rule, `lib/town/hudFocus.ts`).

The rest of the family already covered the row (modal top-layer dialogs, phone `inset:0`, header at the row top): Settings, Paths (and its
cards / balls pages), the Shellbook, the character / Backpack drawer. Vending hides every other `.town-app` child and draws its own Done
in the row. The party card ("Your party") is a small centred sheet over a backdrop: left as is. Known: at 393 px "Make it your island"
(Settings) wraps to two lines, so its second line drops below the row band.
Check: `node --experimental-websocket scripts/check-pocket-covers-row.cjs <appUrl> <relayUrl> [shotDir]` (393x852, 440x956, 852x393,
party of 4): every row button's centre hits the drawer panel, title and Done in the row band, row restored on close.
