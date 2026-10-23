# UI consistency audit, 22 October 2026

This audit covers everything built or changed from 19 to 22 October: the title screen, Play with friends, the party cards, the HUD, the four room pages, the emote wheels, Settings/About/privacy and the admin pages. It was done locally in the `qa-ui-consistency` worktree and nothing was deployed.

**Method.** I ran my own dev server (:8401, `NEXT_DIST_DIR=.next-qa-ui`) and my own dev relay (:8402), with one headless Chrome at a time. I took screenshots at five sizes: 390×844, 360×740 and 320×568 (phones, touch), 844×390 (landscape phone) and 1280×800 (desktop). Alongside them I recorded the size, font and position of every button on each surface. I also checked the CSS by searching it against [BUTTONS.md](BUTTONS.md), [UI_SPEC.md](UI_SPEC.md) and [HUD_STACK.md](HUD_STACK.md). The screenshots are in `/tmp/qa-ui/` and are not in the repo.

The new checks are in `tests/ui-spec.cjs` §9.

## Audit table

| # | Surface | Issue | Fix |
| --- | --- | --- | --- |
| 1 | Global (Code / List tabs, Make it yours chips and labels, IslandSelect, Male/Female toggle, arcade game buttons, story player controls) | `var(--font-body)` was used in 15 `font:` shorthands but defined nowhere. That made each whole declaration invalid, so these controls fell back to the parent font and lost their declared weight and size. For example, the party tabs were drawn at 400 instead of 700. | `--font-body:var(--btn-font)` is now defined once in `:root` (`app/globals.css`). |
| 2 | Party card, chip, toast, code boxes, name field, header count | Buttons and text used `system-ui` (SF on iPhones), while every other island button uses `--btn-font` (Arial). BUTTONS.md #4 had already fixed the same drift in the games. | `var(--btn-font)` everywhere in `party.module.css`. |
| 3 | Party and room buttons, name field, code boxes | The focus ring was `3px solid var(--btn-ink)` with a 2px offset, not the one ring token. | `outline:var(--btn-focus);outline-offset:var(--btn-focus-offset)`. |
| 4 | Party chip and round buttons, room chip, room Emote | The press used a literal 3px over .12s. The room chip and room Emote also lost their whole edge when pressed. | `var(--btn-press)` at .16s, and the edge now shortens to `0 1px 0 <edge>`. |
| 5 | Room Emote button (Museum, Arcade, Kit Shop) | It had a flat gold face with no grain, unlike every other round gold button. | It now has the textured gold face (`--btn-grain`, soft-light). |
| 6 | Party toast, room roster, old dialog | The toast animated in .2s, not the one toast timing (.3s ease). The roster and dialog used .2s, not the modal .26s ease-out. | Both timings are aligned, and reduced motion now also covers the room chip, Emote and roster. |
| 7 | Island party notes ("Tap the friends button…", "X joined") | The note was pinned at the top centre, over the coins bar and over the friends button it mentions (phones and desktop). | The note goes into the HUD stack under the coins bar (`HudSlot`, `data-hud-slot="toast"`), like every other toast. The Calm HUD rule moves the lesson card aside while it shows. PartyHost now renders inside the `HudStackContext.Provider`: the line moved up by one, and the DOM parent is unchanged. |
| 8 | Museum (and any narrow room) roster and emote wheel | The museum chip sits left of Done, and its right-aligned 320px roster or wheel ran off the left edge of the screen. It sat at x = −34 at 390px and x = −72 at 320px. | `RoomPartyChip` measures the open popover once and shifts it to stay 16px inside the screen. Measured after the fix: 16..336 of 390 and 16..330 of 360. |
| 9 | Code / List tabs (phones) | The tabs are drawn 36px tall inside the 48px track, which is under 44px. | An invisible `::before` strip gives a 44px hit height inside the track's padding. The look is unchanged. |
| 10 | Party Share link / New code (320px) | Both labels wrapped to two lines. | At 340px and below, the pair's padding, gap and font are tightened to 14px so each label stays on one line. |
| 11 | Emote wheel (all sets: standing, moving, ride, flying, swimming and rooms; it is one component) | The rim, ink and edge were raw hex (`#fff2cd`, `#244d40`, `#b8923f`, an off-token gold edge). The arrows used `system-ui`, and the press was a literal 3px at .12s. | The wheel uses `--btn-rim`, `--btn-ink`, `--btn-gold-edge`, `--btn-font` and `--btn-press` at .16s, and the grain now has the shared 128px tile size. |
| 12 | Title "Join friends" button | The focus ring was hard-coded, the `.waiting` line used `system-ui`, and the press had a 2px fallback. Ten rules for the old standalone join card were dead, since the sheet now uses SaveCode styles. | Token ring and font, and the dead rules are removed. |
| 13 | Museum header (phones and touch) | The side gutters were 16px, while the Konbini and the spec use `--phone-gutter` (18px). | `var(--phone-gutter)`. Done now sits 18px from the edge, the same as in the Konbini. |
| 14 | Admin section tabs (phones) | The tabs were forced to equal widths with `min-width:0`, so "Engagement" and "Players" overlapped ("EngagemenPlayers") at 390px. | On phones each tab sizes to its label on one line. The bar already scrolled sideways, and the selected tab scrolls into view. |
| 15 | Party dead CSS | `.qr`, `.qrBox` and `.qrWait` were left over after the QR code was removed (owner decision, Oct 22). | Removed. |

Checked with no change needed:

* **Title buttons.** Start, I have a save code and Join friends all share the column width at every size (340 / 324 / 284px), use Arial, are pills and are at least 48px tall.
* **Join friends sheet.** It uses the same sheet, header and footer as "Use a different code".
* **Party header.** It is the `76px 1fr 76px` grid, with an IslandBrush title at `clamp(24px,3vw,38px)` that is identical to ParentGate. Done sits at the same spot on the menu and live cards, and the card is the same size on both tabs (560×618 desktop, 358×598 at 390px).
* **Emote cells.** On desktop the Emote cell is bottom-left of the 2×2 grid, and on phones it is the bottom-left cell of the 3×2 stair. A hidden Emote is scaled to 0.8 and is not tappable, which is intended.
* **About and privacy.** About has its music credit drawer. On the privacy page the H1 is IslandBrush and the H2s are 20/700, with no horizontal overflow.
* **Admin Friends & parties, Emotes and Sponsor report.** They use the shared admin card and tile classes, the empty states read well, and there is no horizontal overflow at 390 or 1280.
* **Konbini header.** The chip is on the left, the coins are centred and Done is on the right.

## Left as they are, with reasons

| Surface | Issue | Why it was left |
| --- | --- | --- |
| Island HUD row, phones ≤ 390px with the flag on | The Play with friends button, the third top-row button, overlaps the centred coins bar. At 390px it covers the coin icon. At 320px it covers the coin count, and Settings touches "100". I tried centring the bar in the gap between the button groups and reverted it: the bar (coins, fish, fruit, bolt) is wider than the gap (≈200px at 390, ≈136px at 320). | This needs a layout decision for the owner: (a) move the friends button into the action grid on phones, (b) hide basket counts while they are 0, or (c) give the bar its own row on narrow phones. |
| Arcade room | The "Exit" label, rather than Back, and the room chip on a second row on the right. | These are the existing product decision (UI_SPEC §5 H13) and the documented placement. |
| Kit Shop room | Done sits 20px from the right edge and 12px from the top, the title gutter is 12px, it uses the Helvetica/navy palette, and the chip has its own row at the left on phones. | The shop deliberately has its own modern kit-store style (`ShopRoom.module.css` header comment, HUD_STACK.md). |
| Room chip "0 here" | It counts the friends in the room, not you. The aria label reads "0 friends here". | This matches the design note ("N here"). Showing it only when N > 0 would be a product change. |
| Museum, Arcade and Shop Emote button | It is always shown, while the Konbini shows Emote only near a friend. | The Konbini rule was an owner decision for that room only (HUD_STACK.md). Applying it elsewhere needs the scene's near-friend sampling in each room. |
| End party for everyone | It is a red underlined link, even though the game has no red family. | Owner decision (commit f7c5ff23, "End party as small red link"), asserted by `tests/mp-ui.cjs`. |
| Code / List tab press | `translateY(2px)` instead of `--btn-press`. | It is part of the owner's sand-toggle spec, which `tests/mp-ui.cjs` asserts. |
| Emote wheel arrows | They are 24–28px wide (44px tall). | A wider hit area would overlap the first and last emote; the strip also scrolls by swipe. |
| Door hints and friend name labels (canvas) | They are drawn in `system-ui` 700. | They are in-world canvas sprites, not chrome, and `system-ui` is needed for the emoji glyphs. |
| Admin "Health (party service)" | The "Relay stats not configured" line runs straight on from the paragraph above it, with no gap. | It only appears on servers without relay stats (dev). It is cosmetic. |
