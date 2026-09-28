# Vending interaction polish — September 27, 2026

Local changes only. Uses the game-developer skill's perceive → select → pay → delivery → pickup review; the original machine and controller remain intact.

## Observed and changed

- Phone and desktop purchase screenshots showed the received ball clipped below the tray. The product image's intrinsic grid minimum escaped its allotted area. Constrained both grid tracks and replaced-image minima, positioned the pickup bay separately from the hint, and retained enlarged ball artwork inside that bay.
- Delivery now opens a short spring-loaded metal flap as the item falls. It settles partially open, with a clear downward pickup cue. The atlas tray uses the same recessed floor, metal flap and sill, preserving far/near identity.
- Page titles settle over 220 ms, push buttons depress while pressed, and the LED gets a subtle static scanline surface. Existing controller-specific sounds are retained; no new audio context or competing sounds.
- Fixed an invalid CSS `translate` value in the coin animation; the coin now rotates and narrows as it enters the slot.
- A catalog display item with a `storyId` reads “Only here” on the distant cabinet; disabled decoration previews still read “Preview”. Root owns book economics and reader integration.

## Validation

- `npx tsc --noEmit`, vending regression, heat-pass3 and device guards passed. No small-target failures.
- Browser clicks: select ball, pay, dispense, and readable pickup at 390×844, 1280×800, 844×390. All measured interactive face targets ≥43 px (44 CSS minimum with projection tolerance). Baseline and comparison screenshots under `/tmp/vending-{phone,desktop,landscape}-*`; phone final confirms the ball fully within the tray.
- Existing vending runtime script: no placement or reachability problems; 195 draws with machines vs194 without, +1 draw; idle update0.270µs and inactive camera0.015µs in this local Chrome sample. No browser errors.
- Added effects are finite CSS animations triggered only by mounted-machine interaction, with reduced-motion overrides. No animation loop, timer, new light/material/mesh or texture allocation added; atlas remains shared. No physical-phone thermal claim.

## Remaining

Physical iPhone/Android touch, audio and sustained thermal measurement. Book reader integration belongs to the root/book specialist. This pass does not change wallet receipts, prices or ownership rules.

## Entrance handoff follow-up

The HTML machine face now crossfades over the same world cabinet in420ms. A single680ms sweep crosses the glass, with four small finite metal/glass glints. No filter or backdrop blur is used. The root projected transform and all hit rectangles remain unchanged; decorative elements ignore pointers. Reduced motion skips the entrance entirely. The controller supplies a per-visit `entrance` flag so returning from a book does not replay the arrival effect.

Phone390×844 touch checks passed two consecutive open/leave visits with normal motion and two with reduced motion. After settling: opacity1, filter none, zero active animations anywhere inside the face. Tapping a product after settling selected it correctly and did not restart arrival. No page errors. TypeScript, vending and heat guards passed. No new timer, idle loop, asset, mesh or material; local only, physical-phone thermal behavior unmeasured.

## Category panel replaces cabinet title

Removed the separate ISLAND SHOP sign mesh and atlas lettering. Expanded the projected interactive face upward from1.64m to1.83m so the category and both arrows occupy that former sign area; the six shelves extend upward into the space their old navigation occupied. Portrait shelf height grows approximately20%. Arrow widths were enlarged proportionally to keep44px landscape-phone targets. Camera composition now fits that one complete face on every viewport; there is no detached title strip to crop. Atlas and interactive layout share the same new rectangles, including the header's page count. Tray and LED remain within the cabinet, with the entrance sweep/glints preserved.

Phone390×844, desktop1280×800 and landscape844×390 screenshots and select/pay/tray browser flows passed; no undersized interactive target was measured. Phone/landscape screenshots inspected for clipping. TypeScript and heat guards pass. Vending geometry/layout assertions pass through to source checks; overall vending test currently fails an unrelated stale Town `?store=` source regex after concurrent store URL changes (reported to root). No restart, commit or deploy.

## Interactive pickup and collection reveal

- Tray pickup accepts an upward pull as well as tap/Enter, with a small press response. Packs lift from the measured tray center into a large static collection card. One card at a time keeps artwork and the resilience note readable; tap, horizontal swipe, Previous/Next and arrow keys advance. Returning to card one uses ordinary paging, not another tray flight.
- `VendingCardReveal` reuses the collection's original MiniCard artwork. Focus is contained during reveal and restored to the shelf after dismissal. The underlying face is inert; preview packs remain samples and do not write wallet or collection data. Book wiring and prices are unchanged.
- Blurred background follows the collection viewer's cached-layer pattern: plain static7px filter on the sleeping island and inert machine face, with a separate tint behind the card. No backdrop sampling, new renderer, timers or idle animations. The filter explicitly overrides the island entrance animation's retained blur0 endpoint and is removed with the reveal. Reduced motion disables card flight/paging motion.
- Back replaces Leave and uses the shared button's240ms shrink/icon animation. Escape and movement-key exit invoke that same button; Escape within a reward dismisses the reward first. Async purchase visit checks still invalidate stale delivery effects.
- Updated browser scripts for the new Back label/reveal and corrected the vending source guard to accept the existing preview-books URL branch.

Final reveal validation: `check-vending-reveal-browser.cjs` exercises real three-card purchases on phone390×844 and desktop1280×800 plus a preview pack, upward tray pull, arrow/button paging, zero settled reveal animations, static canvas computed `blur(7px)`, inert face, next-frame shelf focus restoration, and shared Back tap/Escape collapse. `check-vending-interruption-browser.cjs` passes closing during dispense with preserved purchase and no stale animation on reentry. TypeScript, vending, heat and device guards pass; diff whitespace clean. The obsolete Town URL regex and Back expectation are fixed. Screenshots `/tmp/vending-reveal-{phone,desktop,sample}.png`. Local only; no deployment or physical-device thermal measurement.
