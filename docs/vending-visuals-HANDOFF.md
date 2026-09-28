# Vending machine visuals: handoff to Astra

September 27, 2026. Local only: not committed and not deployed.

The vending machines are now used **in the world**, with no modal (user: "it should be interacting with the machine and not a
modal"). The groundwork is done: the flow, rules, hit-testing, keyboard, HUD, tests and heat behaviour. The visuals are clean
placeholders. This note is for the final machine art.

**The principle:** the zoomed view IS the world machine, just closer. The camera eases in and the same object gets bigger.
Nothing is swapped for a different-looking panel.

## What you own and what you must not touch

| You own (visuals) | Don't touch (logic and economy) |
|---|---|
| `lib/graphics/vendingMachines.ts`: mesh, atlas art, hover glow. Keep its API: `update`, `pick`, `focus`, `release`, `applyCamera`, `faceView`, `faceNow`, `watchFace`, `hidesPlayer`, `zooming`, `dispose` | `components/VendingMachine.tsx`: the controller (state machine, rules, placement, keyboard, HUD) |
| `lib/graphics/vendingFaceLayout.ts`: layout rects and animation timings | `lib/town/vendingWallet.ts`, `lib/town/vendingLedger.ts`: coins and ownership |
| `components/VendingFace.tsx` + `VendingFace.module.css`: the interactive face | `lib/town/vendingCatalog.ts`: machines, prices, specials, stock order. The art may read it but must not change the economics |
| The `fi2-vending-cue` sounds in `lib/audio/islandSound.ts` (coin / thunk / pop / buzz) | `components/Town.tsx` hooks: `openVending`, `storeOpen` in the pause list and in `CardOfferHost blocked`, `vending.applyCamera(...)`, `machines={getVendingMachines}` |

## How it fits together

```
Town ──Go/tap──▶ vendingMachines.focus(id, onArrive)      camera eases to faceView (1 s)
                   │ onArrive → storeOpen = true            island pauses and sleeps; card offers wait
                   ▼
VendingMachine (controller) ── faceNow()/watchFace() ──▶ 4 projected corners → matrix3d
   state machine + rules                                   │
   └──▶ <VendingFace view={…} events={…} overlay={…}/>  ◀──┘ pinned onto VENDING_FACE
```

- `VENDING_FACE` (vendingMachines.ts) is the face rectangle in machine-local metres before `VENDING_SCALE`: the whole front below
  the lit sign, 1.26 × 1.56 m.
- `VENDING_FACE_LAYOUT` (vendingFaceLayout.ts) holds every part's rect as a fraction of that face, measured from the top-left.
  **Both renderers read it**: the atlas panels in `buildMachineGeometry` and the absolutely placed parts of `VendingFace`. A
  new face design only needs new rects, plus art that matches them. The controller never reads pixel positions.
- Hit areas are data: `prev`, `label`, `next`, `slots[0..5]` (reading order, `cols` × `rows` = 3 × 2), `coin`, `tray`. `led`,
  `sticker` and `overlay` are display rects. `tests/vending-machines.cjs` checks that every rect stays inside the face, that no
  two hit areas overlap, and that every tap target is at least 44 px in both 390×844 portrait and 844×390 landscape.

## Visual interface contract (`components/VendingFace.tsx`)

`<VendingFace ref view events overlay/>`. It is pure rendering: no wallet, ledger, unlock or purchase code (a test enforces this).

**`view: VendingFaceView`**

| Field | Meaning |
|---|---|
| `placement {w,h,transform}` | Face box in CSS px (its real on-screen size) and the matrix3d that pins it. Apply both to the root with `transform-origin:0 0` |
| `fontSize`, `compact` | Base text size, ≥12 px, from the on-screen width. `compact` is true when the face is under 430 px tall (landscape phones): one-line names and no coin label |
| `machine {id,name,color,light,ink}` | Cabinet colours for tinting (lit buttons use `light` / `ink`) |
| `header {label,page,pages,special}` | Shelf header text (rows on this page, e.g. "Specials · Packs · Balls") and page n/N. `special` means the gold header |
| `slots[]` | Up to 6 `VendingSlotView {id,label,price,state,special,lit,vending,kind,picture,ariaLabel}`. `state` is `buy \| short \| owned \| equipped \| locked \| soldout`. `lit` is the selected slot (its push button glows). `vending` means the item is leaving the shelf right now. `picture` is a ReactNode miniature |
| `cursor` | Keyboard focus slot. Give it `tabIndex=0` and the others `-1` |
| `led {msg,sub?,tone?}` | LED text. `tone` is `warn` (not enough coins, locked…) or `ok` |
| `balance`, `found {short,label}` | Coin digits on the coin panel, and the sticker text |
| `phase` | `idle \| coins \| drop \| tray \| reward` |
| `coinDrop {n,key}` | Draw `n` coins falling into the slot. `key` restarts the animation |
| `tray {key,id,label,kind,picture}` | Item falling into the tray (`phase` `drop`) or waiting in it (`tray`) |

**`events`**: `onSlot(i)`, `onSlotFocus(i)`, `onCoin()`, `onTray()`, `onFlip(±1)`, `onNextRow()`. Call them from whatever the
player touches. The controller decides what each press means.

**`overlay`**: the reward moment or the club story (controller content with its own buttons). Draw it inside `L.overlay`.

**Selectors the tests and scripts use** (keep them): `data-vending-face`, `data-vending-item`, `data-slot-index`, `data-state`,
`data-special`, `data-vending-flip="prev|next"`, `data-vending-coin`, `data-vending-tray="empty|dropping|full"`,
`data-vending-led`, `data-machines-found`, and the strings "Only here", "No real money" and "machines found".

## State machine, events and timings

```
idle ─slot→ armed (lit button, LED "Ball · 25 coins / Press again, or tap the coin slot")
armed ─same slot or coin slot→ buy?  ├ short/locked/sold out → LED message + cue 'buzz' (stays idle)
                                     ├ owned → equip (LED "… equipped")
                                     └ buy → coins ─(≥coinsDone(n) and ledger ok)→ drop ─(drop ms)→ tray ─tap tray→ reward ─dismiss→ idle
```

`VENDING_TIMING` in vendingFaceLayout.ts is shared by the controller and the CSS. Tune the art to it, or change both together:

| Step | Timing | Sound cue (`document` event `fi2-vending-cue`) |
|---|---|---|
| Coin *i* lands | `coinAt(i)` = 120 + 170·i ms (n = 1–3 coins by price) | `coin` for each coin |
| Buying resolves | no earlier than `coinsDone(n)` = 120 + 170·n + 200 ms | — |
| Item falls into the tray | `drop` = 620 ms after the purchase resolves | `thunk` at the end |
| Take from the tray | reward pop, `pop` = 380 ms | `pop` |
| Refused press | — | `buzz` |
| Face fades in on arrival | `faceFade` = 180 ms | — |

With reduced motion every step is immediate and there are no animations.

## Zoom framing target

`faceView(id, camera, position, look, viewportHeight?)` places the camera straight in front of the face centre, level, looking
along the machine's facing. The face therefore projects to an upright rectangle with no skew, and the HTML face is pinned 1:1.
The distance fits the face with a 3% side margin and a 4% top/bottom margin. When the face would still be at least 380 px tall,
it also frames the lit sign (the brand strip). Short landscape phones frame the face alone so the buttons stay at least 44 px.
Results:

| Viewport | Face on screen |
|---|---|
| 390×844 portrait | 367 × 454 px, full width, sign and cabinet visible above |
| 844×390 landscape | 290 × 359 px, full height (compact mode) |
| 1280×800 desktop | about 594 × 736 px |

`watchFace(fn)` reports the corners on every awake zoomed frame. A paused island sleeps, so this costs nothing while a machine is
in use. A resize wakes one frame, which re-fits the camera and re-pins the face.

## The zoomed machine must match the far one exactly

The placeholder atlas paints page one of every machine on its glass: a special ball, a special pack, the 3-card and 5-card packs
and two balls, with their prices, a gold "★ SPECIALS · PACKS · BALLS" header, the LED greeting, the coin panel, the tray and the
sticker. All of it sits on the same rects the HTML face uses. When the face fades in, only the real names and miniatures appear.
Keep that true when you replace the art. If the face design changes, change the atlas and the layout rects in the same pass.

Side-by-side pairs (390×844). Each shows the far view, the bare 3D close-up (HTML face hidden) and the close-up in use:

- Red Island Square: `pair-plaza-far-vs-zoom.png`
- Cream Pier Cafés: `pair-pier-far-vs-zoom.png`
- Purple Community Garden: `pair-market-far-vs-zoom.png`

They're in the session scratchpad
(`/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/bf21bd3b-8bef-46f7-a44a-b2461b53a632/scratchpad/vending-inworld/`),
along with the full flow at three viewports: `{phone-portrait,phone-landscape,desktop}-plaza-{1-approach,1b-zooming,2a-mesh-only,
2-face,3-selected,4-coins,5-tray,6-taken,7-not-enough,8-page2-keyboard,9-leaving,10-left}.png`.

Known gaps:
- The atlas names slots 1–2 "★ Special ball / pack" because one atlas is shared by all eight machines. Per-machine names would
  need per-machine glass art, for example a small CanvasTexture built only while near a machine and disposed after.
- The atlas and CSS colours are close but not tone-mapped identically.
- The market machine's zoom path passes close to the classroom wall at mid-ease.

## Constraints

- **Phone heat is a primary requirement** (AGENTS.md, docs/performance-guide.md):
  - Build any extra face meshes or textures only while a machine is in use or near, and dispose them afterwards. Today there are
    none: the HTML face is mounted only while in use.
  - No idle loops. The island sleeps while a machine is in use. Animations must be one-shot, never `infinite`.
  - No `backdrop-filter` over the canvas. `tests/heat-pass3.cjs` counts backdrop-filter rules per file.
  - Keep one merged mesh per machine and one shared material and atlas. `scripts/check-vending-browser.cjs` checks the draw
    calls (at most +4) and the idle `update` cost (under 20 µs).
- **Readability at 390×844**: text at least 12 px effective and taps at least 44 px effective (tested in portrait and in
  844×390 landscape). Text is laid out at the face's real screen size, so CSS px equal screen px.
- **Island design language**: the pixel/pill buttons, the cream `#fff1d3` cards with gold `#a8863d` shadows, the IslandBrush
  titles and the coin pill (IslandJobs styles). Don't invent one-off styles (see memory: reuse existing components and styles).
- **Kid safety**: no odds or rarity numbers, in-game coins only, "No real money" on the machine.

## How to test

```
npx tsc --noEmit
node tests/vending-machines.cjs      # catalogue, ledger, zoom framing, layout hit areas (portrait + landscape), no-modal and visual-module rules
node tests/heat-pass3.cjs            # no blur over the canvas, menus sleep (storeOpen)
node tests/device-guards.cjs         # taps ≥44 px, touch-callout (ArcadeGame3D's 14px select failure is known and not ours)
node scripts/check-vending-browser.cjs   # live placement, reachability, draw calls, idle cost (dev server on :8092)
```

### Jumping to a machine (Playwright or the devtools console)

```js
const f=window.__fi2, e=f.vending.entries.find(e=>e.machine.id==='pier');   // plaza rooftop oldtown clubgrounds eleven beach pier market
if(f.rideRef.current==='jetpack'){f.rideRef.current='walk';f.flight.height=e.machine.y;}
f.location.x=e.front.x+e.dir.x*1.5; f.location.z=e.front.z+e.dir.z*1.5;    // stand in front: the Go prompt appears
document.querySelector('[data-vending-go]').click();                       // zoom in, then the face mounts
```

Or open `/?store=` (the nearest machine; the camera flies over) or `/?store=packs` (3-card pack pre-selected). To seed coins,
write `fi2-arcade-wallet-v1` = `{version:1,runs:{a:{game:'live',paid:20,reason:'fixture',at:1},b:{…same, paid:20}},best:{},attempts:{},visits:{},packs:[]}`
before load (each run counts at most 20). The screenshot script used for the pairs above is `scratchpad/vend-shots.cjs <view|all> <machineId> [--pair]`.
