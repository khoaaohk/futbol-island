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
| Welcome-back card | `WelcomeBack.tsx` | first load of a new day | next lesson, warm-up, My football | guide (buttons) | `top:88px` | 9 | Go / Later |
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
   - tier 1: proximity actions — Talk, Enter, Fish, Sell, vending Go, **Drink water** (a free water fountain, kind `drink`,
     30 Sep 2026: `components/FountainPrompt.tsx` in the focus slot, the Talk pill's style) — **nearest wins**, desktop hover wins its tier;
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
| Flying | No ground prompts (Talk, Fish, Sell, Drink water, job signs). Land on truck wins over a truck; doors and vending machines stay (they are fly-in destinations by design); Learn Plays and hints stay. |
| In a job, or a job card open | The job owns the stack: panel / card in the task slot, no focus competitor (except ride controls); notes wait while a card is open. |
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
