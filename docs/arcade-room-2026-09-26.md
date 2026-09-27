# Standalone walkable arcade — September 26, 2026

Local implementation; not deployed. The room teaches football through five distinct cabinet games and skill signposts rather than adding a currency or redemption system.

## Boundary and navigation

- `/arcade` is a dedicated route. Entering from Town uses a full document navigation, so the previous island renderer, outstanding document requests and island runtime cannot continue behind the arcade.
- No Town or island world module is imported by the room. Its player and visitors use the shared bean character/motion implementation and saved main-player customization.
- Only the selected game mounts. The room's single renderer, crowd, textures, input listeners, resize observer and animation callback are disposed when a cabinet launches; returning builds the room at the player's last position. The exit is a plain island link, with no automatic island route prefetch.
- `/arcade?game=runner|tennis|pinball|puzzle|live` starts the selected game without importing the room scene first.

## Explore and choose

The same physical room and cabinet coordinates are used on phones and desktop. It spans roughly 32 × 26 metres, with close follow-camera exploration instead of fitting the whole map into a small diagram. Five cabinet zones surround a central aisle. Each has a distinct colour, football screen illustration and marquee. The player can walk with WASD/arrows, a touch joystick, or tap a floor/cabinet destination. Cabinet approaches route through the central aisle. Nearby Play/Enter launches the cabinet. An accessible Games chooser also provides Walk over and direct Play actions.

Touch cancellation and focus loss clear held motion. Canvas and joystick suppress native callouts, selection and image dragging. Native character gait follows actual travelled distance, and the player turns to face the selected cabinet after stopping.

## Activity and rendering cost

The room has one animation clock. Main-player movement uses the existing stable frame-slot cap (30 fps coarse input, 60 desktop). Visible ambient room activity continues at 15 fps after 12 seconds without movement. This is an intentional cost for a living arcade; the page sleeps entirely when hidden and the room is fully disposed while a game plays. Crowd size is bounded to three on mobile and five on desktop; no cabinet mounts a live game preview.

No postprocessing or real-time shadow map is added. Cabinet geometry/materials are shared, screen art is generated once, and grounding shadows are static flat discs. The scene disposes all generated textures/materials/geometry on exit. This controls rendering work; it does not establish physical-phone temperature or battery performance.

## Validation

- TypeScript passed during room implementation.
- `scripts/check-arcade-room-browser.cjs`: real keyboard and CDP touch joystick movement, cabinet approaches, screenshots of multiple room zones, selected-game launch and room disposal. The first integrated crowd pass passed at 1280×800 and 390×844; the expanded final world is checked again after the furnishing pass.
- Parent integration checks cover cold-route network isolation, document navigation from Town, one renderer while playing, and return to the arcade.
- `tests/arcade-room-crowd.cjs` separately checks bounded actors, navigation, yielding and cleanup; see the crowd note for details.

## Final room direction

The final layout retains the same five cabinet positions on both devices and the full 32 × 26 m room. Cold entry now starts at the southern entrance `(0, 10.3)`, facing up into the room. Returning from a game preserves the last cabinet position. The mobile camera shows a nearby section of that same world rather than fitting or rearranging the room. Follow bounds leave a small visible outer border while avoiding the previous broad empty exterior.

The room is a dark indoor arcade with lit cabinet pads, cabinet attract artwork, a large in-world marquee and 56 instanced chase bulbs. Three mobile/five desktop visitors use the native bean solver; a separate attendant staffs the prize display. Furnishings include two lounge couches, air hockey, an inward-facing claw cabinet and vending machine, plus ticket rolls, plush toys, footballs and trophies. Decorative machines do not imply playable minigames or a spendable currency. Static room boxes/tiles and the furnishing details are merged by material. Reduced motion keeps the marquee/attract art still.

The header retains Exit and Games only, using the island’s textured gold controls. The former bottom card, central green carpet, floor slogan and both instructional wall slogans are removed. Approaching a cabinet lights its edges in the island's green `#35ed8b` and projects a Play button above the machine using the existing `store-enter-prompt` styling. The button keeps a 44 px minimum target. All five approaches and floating controls have passed desktop and CDP touch checks.

Exit works from the header or by walking south through the marked entrance opening; both use the same guarded 360 ms fade and document navigation. Reduced motion shortens this to 60 ms. New movement and game launches are blocked once exit begins.

Room audio is lazy-unlocked by an actual gesture, follows the saved global mute setting and uses the room clock for short spatial cabinet motifs and steps. It suspends when hidden and is disposed before any game mounts. There is no separate sound button in the arcade; it follows the saved global sound preference.

A post-batching snapshot before the final furnishing reorientation recorded 69 calls / 143,274 triangles on desktop and 48 calls / 107,052 triangles on the phone profile at the previous entry position. These are single-pass emulation observations, not a thermal comparison or a fixed budget for every camera position. Parent checks cover audio and isolation; the final furnishing/camera browser sweep is run after the last user refinements.

## Shared hover and ambient detail follow-up

Cabinets now use the real `createBuildingGlow` shader and animation, with an additive halo, eased edges and upward wash. The new cabinet shape branch leaves the existing island-building branches unchanged. Desktop pointer hover and walking proximity both reveal the projected island-style Play button; it stays present as the pointer moves from the machine onto the button. A targeted real-pointer browser check captured the rising wash at two times and launched Pinball through that button.

Each cabinet screen now carries its own authored 256 × 192 attract sequence—running/dodging, tennis rallies, pinball rebounds, a drawn passing route or a Strikers passing move. These are lightweight illustrations, not nested game runtimes. The existing room tick checks each screen's world-space bounds against the camera frustum; only visible screens redraw, at at most 8 fps. Reduced motion uses one meaningful static frame. Textures are disposed with the room.

Ambient furnishings use that same room clock: claw carriage travel, an air-hockey puck and responsive paddles, a vending indicator, and a brief nearby counter greeting. No additional NPCs or clocks are added. Header Exit/Games labels have no icons and use the island press displacement/shadow with a shrinking visual inside a stable 50 px input target. The entrance has low posts/threshold signage rather than a cross-beam obscuring the newly spawned player.

Final integrated sweep: `node scripts/check-arcade-room-browser.cjs` passed all five cabinet approaches, projected Play visibility/target size, keyboard movement, actual CDP touch joystick movement, selected-game launch, one game canvas and room disposal at 1280 × 800 and 390 × 844. The `--hover` pass also passed moving from an unoccupied machine's pointer hover onto its projected Play button and launching it. Captures include the updated previews, props and native visitors after crowd separation/greeting changes. At the final `(0, 10.3)` spawn the sampled renderer reported 70 calls / 123,024 triangles desktop and 33 calls / 86,210 triangles phone emulation; camera-dependent, single-pass figures. No off-screen cabinet previews advanced at the phone entrance, and their counters advanced as the walkthrough reached their machines. Physical-phone heat and sustained battery use remain unmeasured.

## Connected return to the island

Arcade exit now uses `/?from=arcade`. The server passes that return intent into Town before the first HTML paint, so it renders a compact dark “Back to the island” transition instead of the first-visit branded splash. Return loading waits for the island's actual first rendered frame, then fades for 220 ms (shortened for reduced motion). It skips the normal three-second minimum and two-second introduction; ordinary island startup is unchanged.

The player returns walking on the ground at `ARCADE_DOOR` `(103, -48)`, facing away from the building, with the camera already aligned. The initial arrival burst/jetpack introduction is suppressed, while later travel arrivals retain their normal behavior. The island still starts only after leaving the standalone arcade document.

`node scripts/check-arcade-room-browser.cjs --return` passed desktop and phone profiles: first response contains the return overlay with no startup cast markup, no `/splash/` image requests, correct ground position and walking mode, no initial arrival effect, and no page errors. The first-paint check deliberately delayed client chunks to inspect the server-rendered transition; it is not a load-time benchmark. Captures: `/tmp/fi-arcade-return-loading-{desktop,mobile}.png` and `/tmp/fi-arcade-return-island-{desktop,mobile}.png`.

Actual header Exit was subsequently checked through `scripts/check-arcade-isolation-browser.cjs --exit` and `--exit --mobile`. Real click/tap samples confirmed the shared NavigationButton collapses from 76 px to 44 px and reveals the back icon before departure (sampled peak icon opacity .983 desktop / .998 phone), then follows the fade into the server-painted return transition. Both returned on foot at the arcade entrance without startup splash requests or page errors. Icon-phase captures: `/tmp/fi-arcade-exit-collapse-{desktop,mobile}.png`.

### Exact island return continuity

Town now saves a validated tab-local departure snapshot before its existing arcade fade and audio shutdown. It reads the scene's actual position, facing, travel mode, flight altitude and camera from a closure, with no production dependency on the debug API. Return setup restores these before its first rendered frame; walking stays on foot and flight resumes at the saved altitude without replaying takeoff. A missing, malformed or inaccessible snapshot uses the existing arcade-door walking fallback. The document boundary still fully releases the island while inside the arcade.

`node tests/island-return-position.cjs` verifies all five travel modes, coordinates/facing/altitude/camera, invalid values and unavailable storage. `scripts/check-arcade-isolation-browser.cjs --position [--mobile]` uses explicit walk/fly departure fixtures, the real island arcade navigation handler and actual Exit click/tap to check the full document round trip.

Final return-position checks passed on desktop1280×800 and mobile390×844, with no browser errors: walking returned exactly to(103.8,-48.4) at ground level; flight returned exactly to(110,-50) at37.25m with its facing retained. Screenshots reviewed for the mobile ground and airborne returns. The existing per-tick lift routine required a saved cruise-height target to avoid snapping restored flight back to28m; ordinary new flight still targets28m. TypeScript passed after this correction.
