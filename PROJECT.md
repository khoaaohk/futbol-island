# Futbol Island

## Standing purpose

**Everything we do should have the intention of teaching the game of football.** This applies to gameplay, quizzes, exploration, NPCs, costumes, equipment, rewards and effects. Every addition should connect to a clear lesson about football skills, tactics, positions, rules, teamwork, club history or culture. Animal costumes are wearable skins over the existing player, with a story explaining their real club/mascot connection. Distinguish verified history from official fictional mascot lore and original game stories.

Independent Next14 / React / Three.js0.169 project. Run `npm run dev`; preview http://localhost:8092. Development uses `.next-dev`; production builds use `.next`. This app now replaces the original production site at https://futbolisland.app, explicitly authorized by the user on September 12. Local source is in futbol-island. Older versions are preserved in ../project-archives/2026-09-19-audit; see its README before running original-source import or narration tools.

## Club costume collection (local, September 13)

The Store’s Mascots category includes 23 animal club costumes with real character snapshots, equip/remove, sourced two-paragraph club stories (about 100 words each), and a three-choice learning check. The full collection is shown without a search field. Correct answers save separately in `fi2-club-stories-v1`; equipped costume saves in the existing customization record. Character customization also offers a costume selector. Animal geometry is a removable, oversized plush layer with a full animal head covering the human face, attached to the original animated joints. Underlying face, body, clothing and ride settings are preserved and restored when removed. River’s lion is labeled a historic symbol and Nagoya’s biography is labeled club fiction. Costumes use merged procedural geometry (at most 29 additional meshes), no downloaded assets, and static store snapshots from one temporary renderer. The store keeps fixed dimensions during story/quiz interaction. Validated all 23 at desktop, 390px and 320px, plus rig/cache/disposal/persistence tests. These additions are not yet deployed.

## Current design direction

Use this compact Island II world, not the original app’s heavy Explore island. The latest user correction prioritizes the ORIGINAL Island II connected-town feel: adjoining streets, shared blocks, courtyards and short journeys. Earlier instructions to spread isolated small cities far apart are superseded. Preserve each football setting’s identity and exact original rendered field/goal dimensions.

Current target layout (latest compact pass):

| Setting | Centre | Character |
| --- | --- | --- |
| Futsal |11,18|Urban court on a parking garage, surrounded by buildings|
| 7v7 |11,-80|Neighborhood park with playground, picnic areas and pavilion|
| 9v9 |160,-110|Leafy community sports club / junior academy|
| 11v11 |135,100|High-school campus, gym, classrooms and bleachers; southeast of futsal|
| Island Square |95,-35|Shared shopping/civic area with Arcade|
| Arcade arrival |103,-48|Map travel spawns in front of doors, facing entrance|

Walking bounds: x[-102,250], z[-253,226], clipped to the actual shoreline. Flight has a 35-unit offshore allowance (`FLIGHT_WATER_MARGIN`); the temporary 70-unit increase was reverted at the user’s request. Both maps show the same flight area, with water behind offshore markers and a current-position marker on the full map. Walking and landing remain on solid ground; offshore crashes return to a safe shore point. `VENUES`, `ISLAND_SQUARE`, `ARCADE_DOOR` in `lib/town/venues.ts` are authoritative. `ISLAND_BOUNDS` is in simulation.ts. Map shows actual street/building footprints. Arcade interior and existing-game entry are future work; signage says Coming Soon.

## Camera and appearance rules

- Keep the SAME camera angle, FOV40 and relative follow offset(18,23,30). No auto field zoom, lesson reframing or angle changes. Travel moves camera and character together; elevation follows the walking surface.
- Keep Island II’s procedural character appearance. Adapt original app’s movement principles; do not replace the character with V1’s GLB.
- One warm golden sunset across all neighborhoods; same exposure1.0 and light colors/intensities. No location-dependent atmosphere, fog or vignette overlay. Distinction comes from architecture and props, not brightness changes.
- `fitIslandShadows` fits the entire fixed view and tall/elevated scenery on resize to prevent shadows cutting off at the screen edge. Light direction and shadow-map resolution budget remain unchanged.

## Gameplay and travel

- Four live matches share one persistent Three renderer. Games run by default, with floating Learn Plays buttons; catalogs and quizzes open within the same scene.
- Imported live simulation runs at0.65 pace after the user found it too fast. Ball and players share that clock.
- Change Ride cycles Walk → Scooter → Bike → Moped; keyboard R also cycles. Speeds3.7/14/20/28 world units per second. Walking sprint6; rides do not get extra sprint boost. Touch WALK dismounts. Lessons return to walking.
- Same character uses standing scooter or seated bike/moped poses, including hands and feet. Wheels/pedals follow movement. Ball interaction pauses while riding.
- Movement substeps avoid tunneling; rides have a wider collision radius. Surface height and pitch keep wheels/rider aligned on the rooftop ramp.

## Rooftop terrain contract

Futsal elevation6. Deck x[-3,25],z[-10,46],top6. Upper bridge x[22,34],z[-10,-5],top6. East ramp x[28,34],z[-5,45], height6*(45-z)/50. Arrival11,43 is on the roof. Parking structure collision uses perimeter walls, never a solid footprint that would block roof movement. All players, ball, highlights, role labels, walking character and rides use elevation. Pitch slab adds.105 above its base.

## Architecture and performance

- `world.ts`: procedural scenery, separate collision volumes, metadata for buildings and roads. Static meshes merge by BOTH50m spatial chunk and material, allowing local frustum culling. No added animated scenery effects/lights.
- `fields.ts` / `venues.ts`: exact field bounds, markings, goal geometry and transforms.
- `fieldRuntime.ts`: four match simulations, visible actor animation and original-ID lesson playback. `playerBatch.ts` instances matching procedural player parts.
- `player.ts`: distance-driven gait, turn banking, acceleration lean, receiving/kick mechanics and ride poses. These are procedural animations, not mocap retargeting.
- Touch rendering capped30fps, DPR cap2 on both mobile and desktop (verified against September 13 production; prior 1.5 note was stale). Hidden tabs suspend work. Offscreen match simulations continue; offscreen rigs are culled.
- Physical-phone temperature has NOT been established as solved. Browser tests do not establish thermal behavior.

## Lesson migration status

`scripts/import-lessons.mjs` explicitly snapshots original app data locally; there is no cross-project runtime dependency. Current catalog: futsal31, 7v7 18, 9v9 27, 11v11 20 entries. Imported roster, steps, movement, focus highlights, links and text questions are connected. V1 narration, advanced outcome animations and full quiz presentation/feedback are NOT yet fully ported. Do not claim identical teaching playback. Legacy Coach Rafa interactive passing-lane lesson remains accessible.

### Path stories — riso canvas films (September 20, 2026; local, NOT yet deployed after the rebuild and fixes)

All 18 path stories (Futsal: chalk-line, woven-court, kite-turned, futsl · 7v7: place-picture, pocket-radio, signal-water, empathy, regulate · 9v9: different-tides, harbour-night, unfinished-map, grit · 11v11: quiet-lantern, boat-weather, more-shirt, reset, loss) are riso-print canvas films: one file per story in `lib/paths/riso/stories/<id>.ts`, the shared engine in `lib/paths/riso/` (`sheet.ts` plates/halftone/press, `shapes.ts`, `motion.ts`, `passage.ts` forward passages, `story.ts` chapter/track resolution, `registry.ts` dynamic import + `data/narrationTiming.json`), played by `components/StoryFilmPlayer.tsx` through `UpcomingStory.tsx` / `PathStoryModal.tsx` with the kept `StoryPlaybackBar`. Contract and gates: `docs/story-production/riso/RISO_BIBLE.md`, `ENGINE.md`, `storyboards/`, `reviews/`. The earlier story visuals (AnimatedPathFilm/Grit/Regulating/LoveFutsl/MentalToughness films, `lib/paths/films/`, the hand-drawn story game, rendered mp4/poster media, webp stills, their render/check scripts) were removed on September 20, 2026 — see `docs/story-production/riso/CLEANUP.md`; narration audio, captions and cue data were kept. Gates run after the cleanup: typecheck, build, `npm test`, `tests/path-stories.cjs`, `scripts/review-riso-story.mjs` (18 stories, 0 seam failures, 0 errors), `scripts/check-path-films-browser.mjs` (all 18 live at 390×850 and 1440×850) and `scripts/check-riso-films-browser.mjs` per story (incl. 320×568). This state is local; production still serves the previous story system until the next deploy.

## Checks

- `npm run typecheck`, `npm run build`, `npm test`.
- `node tests/player-motion.cjs`, `node tests/travel-modes.cjs`, `node tests/terrain.cjs`, `node tests/shadow-coverage.cjs`.
- Browser scripts in /tmp: fi2-navigation.cjs checks all destinations, fixed camera/atmosphere, slower game clock, runoff, walking and road connectivity. fi2-rooftop.cjs tests all modes along the real ramp route around furniture. fi2-density.cjs checks building/road overlaps and the mobile map.
- Previous compact layout passed build/navigation/terrain/shadow/ride checks. Revalidate the latest tighter layout after geometry edits finish.

- Fresh app loads also start at ARCADE_DOOR, facing the doors, with the camera already in place.
- Playground moved beside the 7v7 entry; never place props over venueEntrance or its walking exits.

### September 12 preview refinements
- Fresh loads and Island Square travel start at Arcade door (103,-48).
- 7v7 playground moved off arrival; park sign tree moved outside the field runoff.
- Palm Club removed to expose futsal garage ramp.
- Static sandy beach and ocean inlet south of garage, with palms, umbrellas and shoreline walking boundary.
- All eight format goals have solid mesh posts/crossbars/rear frames and complete side/back/top netting.
- Ride dust uses a 48-particle instanced pool, emitted by distance and stronger at higher speed; fades at rest and disabled for reduced motion. No additional render loop.
- Rider rendering interpolates fixed simulation steps; fast rides use a larger teleport threshold to avoid resetting animations during normal travel. Mobile frame cap retains timing remainder.
- Large roof ARCADE marquee uses alternating emissive bulbs (no point lights), smaller Come In sign over door. Building entry remains future work.
- Browser checks passed eight goal frames, all three ride trails/fade, ramp building removal, four clear arrivals/runoffs, connected roads and walking routes; travel collision/pose tests passed. Physical-phone riding feel and temperature still require user verification.

### Southern shoreline extension
- Island south bound is now z=215 (30m extension); foundation depth400 centered z15.
- Palm Coast inlet pulled west: x25 at z155, x32 at z178, preserving land around school gym (x65,z155; footprint24x20).
- South pier boardwalk spans x43..226, z207..215, with rails, benches and beach/school access paths. South ocean begins at z215; west ocean extended to join it. All static geometry uses existing spatial batches.

### Western neighborhood extension
- West bound expanded40m to x=-85; land315x400 centered72.5,15. West seawall/ocean shifted40m, inlet extended to meet new coast.
- Four buildings at x=-64, z=-109/-91/-73/-55 face existing park buildings, with connected street x=-45 and link to park street at z=-37.5.
- Removed floating park strings; new sagging bunting at z=-73/-55 runs between actual building walls x=-56.95 and -34.05, height6.5m with visible attachment hooks.
- Build and browser building/road overlap audits passed (46 buildings,22 roads).

### Curved coast and jetpack
- Shared `shoreline.ts` defines a smooth island outline for both foundation geometry and walking bounds. One ocean plane surrounds all sides. Sand ribbon follows coast (5m,8m in inlet). Rectangular land and separate water overlays removed.
- Jetpack added after Moped in ride cycle;34m/s cruise, climbs to28m above ground datum before horizontal flight; procedural backpack/twin thrusters and flying pose retain II character style.
- Switching from jetpack queues the next mode, finds a clear landing site, travels there at cruise height if needed, then lowers before committing the change. Learning-menu opening from jetpack is deferred until landing.
- Browser verified ascent above rooftops and mode stays jetpack until safe landing when directly above Arcade building; sand/ocean visuals checked. Build, typecheck and travel tests passed. Ground ride handlebar tests exclude jetpack and check its visibility separately.

### Jetpack motion refinement
- Takeoff1.05s with eased overshoot; descent0.95s with small touchdown rebound, committing queued ride only after settling. Automatic reposition to clear landing spot remains before descent (20m/s).
- Independent twin downward exhaust pool112 instances, pale blue/white, fuller during takeoff/landing; ground dust unchanged. Reduced-motion disables particles/bounce/wobble.
- Hover adds small bob/roll/pitch to rider and pack, not camera/physics.
- Shadow fitting now accounts for camera elevation in4m bands. Light target stays on ground, light offset scaled3x without changing direction. Shadow coverage tests include elevations0,8,28,32m across portrait/ultrawide. Build and shadow tests passed.

### Neighborhood infill and road consistency audit
- Neighborhood agent added12 buildings: west-market homes/grocer/workshop, beach kitchen/surf repair, park library/community workshop and four pier trading rooms. Added courtyards, shade, showers, fishing station and beach seating.
- All26 road segments now share8m carriageways plus2m sidewalks per side (12m total); connected actual lanes verified. No further island expansion needed.
- Street geometry is unioned into non-overlapping chunked cells. Ground slabs/markings no longer cast self-shadows; batching preserves castShadow flag. Buildings retain shadows.
- Camera near plane1m and shadow texel snapping reduce high-view depth artifacts/shimmer without changing viewpoint or resolution.
- Island overview now shows real curved shoreline/water.
- New reusable scripts/check-island-layout.cjs checks uniform widths, connected lanes, overlaps, shoreline clearance, field runoff and shoreline-aware walkability.
- Strict audit passed:58 buildings,26 connected roads,10 reachable destinations,235 draw calls at Arcade audit view. Infill is static and spatially batched. Physical phone heat not measured.

### Focused field learning and full-body jetpack
- Learn Plays now enters a dedicated field viewport inside the same renderer. World scenery/other fields hide while learning. Mobile reserves top58% for field and bottom42% for controls; desktop reserves400px right sidebar. Closing restores exploration view and scenery.
- New learningView.ts fits authored cameraFocusIds/focus/highlights plus nearby defenders and movement endpoints; Guided frames change by step, Broadcast stays fixed. Catalog shows full pitch. Play/step/quiz controls retained; playback-end state synchronized. Original recorded narration and full original overlay/outcome engine are NOT yet ported.
- Four-format mobile browser flow passed catalog→play→Broadcast stability→quiz→return, preserving scene UUID. Teaching camera exception is deliberate: travel camera remains fixed as before.
- Animation agent integrated flightMotion.ts: velocity/acceleration-relative forward/reverse lean, turn bank, hover motion, body compression/leg brace and animated connected shoulders/elbows/hands. Vehicle has secondary pack recoil; exhaust fans out at ground.
- BoundaryFeedback three-ring pool responds to attempted flying beyond shoreline, with visible fading wall ripple; collision stays in simulation. Browser verified boundary response, exhaust, hover motion, stable view and landing before mode switch.
- Player/ride tests and production build passed.

### Mobile controls, destination menu and flight framing
- Mobile joystick and action/ride/map buttons circular. Left thumb108px joystick (96px narrow), right72px primary/58px run/64px ride cluster; bottom safe-area gap. Landscape removes old440px app minimum so controls stay inside viewport.
- Learn Plays now one stable top-center HUD button for the visible field closest to center (projected field grid/bounds), hidden in learning/map. No world-anchored tap hunting.
- Pick Your Patch nearly full-height with non-scrolling destination grid. Left format badges removed, descriptions12px. Island Pause button/menu/Escape-pause removed; lesson playback Pause retained. Background visibility still stops render work.
- Jetpack camera targets body-centered fixed viewing direction and follows at14/s instead of4/s, keeping hover/travel centered; body wobble excluded from camera.
- Browser passed controls/non-overlap/minimum targets/menu-no-scroll at390x844,320x640,844x390, plus flying central-screen bounds and landing/boundary effects. Build passed.

### Northern road loops
- North cross-street links(-45,-159) to academy avenue(124,-159), continuing into existingacademyroad to196.
- West street extendsnorth fromz-123 to-159; parkapproach atx-18 linksz-118..-159; libraryroad atx58 reachesz-159.
- Alternate west/park/library/academy routes avoid routing everyone back throughhub. Existinguniformroadwidths preserved; no shorelineexpansionneeded.
- Strictaudit passed58buildings,29/29connectedcarriageways,10reachable destinations, clearshoreline/runoffs.

### Pending coaches complex request
- User requests small football sports complex and coaches building immediately right/east of Arcade, for future player-development tools (IDP programmes and tactics drawing board). Exterior/practice area and Coming Soon signage only; actual entry/tools later.
- Assigned to same neighborhood agent alongside road-axis alignment correction; buildings/items may move to achieve coherent roads, field/ramp protected.

### Road alignment, coaches practice and garage refinements
- Strongeraudit caught8stagger/endpointissues missedbyconnectivity-onlytest. Neighborhoodagent alignedx-16promenade/x48spine,mergedduplicatecollinearsegments,correctedL/Tcorners,phase-alignscenterlinedashes,andreplacedmanualcrosswalkclusterswithcleanapproachcrossings.
- Finalstrictaudit59buildings,16canonicalconnectedroads,11reachabletargets,noissues. Roadvisuals /tmp/fi2-roads-topdown.png and /tmp/fi2-roads-hub-junction.png.
- CoachesCentre(161,-43),futureIDP/tactics tools ComingSoon. TwoNPCs at150/162,-20 kick separateballs toward south-facingreboundwallplanez-29.325 andreceive/reset; newcoachPractice.ts usesculled128capacityplayerbatch. Fullcyclebrowserverifiedballsnevercrosswallface.
- Freshstartup nowfutsalrooftop(11,43),supersedingArcadestart. Squaremaparrival remainsArcade.
- Bridgeupperright x34.15,z-10.075..-4.925 nowguardedvisually+collision; allgroundridesblockedfromedgeandfullramp routepasses.
- RoadsidePALMSTREETFUTSAL signremovedandmountedfrontgarage(11,6.7,46.65); parkinglabelalsoforwardz46.65.
- Ride selector nowbottomright; mobileShoot/Landactionaboveit. Removed01objectiveblockandANISLANDBUILTAROUNDTHEGAMEtagline.

## September 12: east market, rooftop recovery, map refinements
- Community Garden east of Coaches; farmersMarket.ts adds 12 static vendor stalls along x230,z21..175 with x221 promenade. eastCoast.ts adds planted verge and a curved eastern seawall with collision segments; southern pier opening preserved.
- Local minimap now centered 130m square view, interpolated via 160ms SVG group transform, translucent monochrome square panel. Full Pick Your Patch retains island overview, enlarged map and compact choices. Mobile controls left, Ride then map toggle right.
- Learn Plays opens immediately from all rides, preserves ride/position/flight altitude; deprecated pendingCatalog landing flow removed.
- Rooftop travel: building.height and derived roofObstacles support clear rooftop jetpack landings. rooftopTravel.ts handles roof movement, gravity on leaving edges, 1.4s impact/recovery lock; player squash/shake/ring and vehicle parts scatter then reassemble. navigator.vibrate optional (platform support required). Low parapets step-over; rooftop furniture blocks movement and landing.
- Verification: rooftop/travel unit tests and typecheck pass. Browser rooftop landing at Courtside confirmed height9.73 without relocating; no page errors. /tmp/fi2-rooftop-landed.png and /tmp/fi2-east-market.png. Physical phone haptics not tested.
- Island neighborhood agent owns remaining building/asset clearance fixes and enhanced scripts/check-island-layout.cjs. No production deploy for these changes.

## September 12: map destination, field cards and cartoon falls
- Coaches Centre is selectable in Pick Your Patch; both overview and local map label its entrance. Shared COACHES_DOOR at (161,-33) keeps travel and map aligned. Six destinations fit desktop and mobile portrait/landscape.
- Replaced small top Learn Plays buttons and conditional legacy card with the cream reference card for every format. Pitch polygons are clipped to the screen to choose the visible field and avoid false visibility from projected bounding rectangles; menus/lessons hide the card. Landscape card stays clear of the map.
- Rooftop falls now hang for one second with frantic legs, drop with stronger gravity, then hold a 4.2-second squash/dizzy recovery with five orbiting stars. Existing render loop and shared star geometry/material; reduced motion keeps stars still and disables wobble. Small outward drift on descent clears building wall collisions before recovery ends.
- Roof-room collision detection now includes geometry embedded up to .3m below the walking slab, correcting missing room colliders and unsafe jetpack landings on those footprints.
- Town test harness updated for current shoreline dependency/bounds. Rooftop tests cover held height during hang, extended movement lock, and resumed movement.
- Browser verified all four field cards opening catalogs, real roof-room sprint collision, hang/impact/extended recovery; map travel/layout passed 1100x850, 390x844, 320x640, 844x390. Physical-phone heat remains unmeasured.
- Follow-up card refinement: area name alone above “Learn [format] Plays”; middle format rotates in on visibility/format changes (static for reduced motion). Card centers vertically at 50% on every viewport. Portrait minimap moves below card with clear control spacing. Browser centering/non-overlap/format-switch checks passed desktop, both portrait sizes and landscape.

### Original teaching cues and spatial quizzes
- Added pooled lessonCues geometry for source lines/arrows, callouts, space ellipses, ghost trails and angle arcs; spotlight actors join the existing team-colored highlights. Source freezeHold is reserved in the original overlay contract and is not a new motion effect.
- On-field neutral letter targets now support all four source quiz interaction kinds (path, player, spot, zone), sharing the existing answer/voice callback. Target sizing and pointer projection use the actual lesson viewport, not the full browser canvas. Correct choices play the next authored outcome step; wrong choices keep the decision view with feedback.
- Mobile real-narration visual check and actual on-pitch target click passed, including clearing cues on exit. Full source renderer/collision-planner parity is not established by these checks.

### Mobile HUD follow-up
- Removed the top-left neighborhood banner, visit/goal counter and on-screen Run button.
- Mobile Learn Plays is a compact top bar with safe-area insets. Mobile CSS applies at widths <=600px or coarse pointers; desktop retains the centered field card.
- Mobile controls read Minimize/Map → Ride → Shoot/Walk along the bottom right. An unused third slot collapses with a 240ms transition, disabled for reduced motion. Desktop has round Map/Minimize beneath the lower-left radar and round Ride lower-right.
- Left joystick enlarged to132px (120px on screens <=350px) with a larger thumb pad; right-side controls retain clearance at320px.
- Local radar is circular, borderless, and see-through with20% cream backing. The player marker remains readable; expanded radar clears the buttons beneath it. Full destination map stays unchanged.
- Live browser checks passed320/500px mouse windows,390px touch portrait,844px touch landscape and1100px desktop: controls, radar clearance, map toggle and lesson entry/exit.

### Island sound effects
- One gesture-unlocked Web Audio context synthesizes button hover/focus/click, distinct ride selection/movement, ground/flying shoreline boundary bumps and cartoon rooftop fall/impact sounds. No downloaded audio assets or new animation loop.
- Map header speaker button toggles effects independently of lesson narration; preference persists locally. Hidden tabs silence/suspend, unmount closes the context, repeated effects are throttled.
- Live browser integration verified every effect category, all five ride modes and mute behavior without page errors. Audio character/volume has not been listening-tested on a physical device.
- Jetpack refinement: hiss removed, soft sine takeoff swell and quiet overlapping harmonic hum with slow pitch drift while flying. Other ride effects unchanged. Production build passed.
- Moped refined to a quiet cruising purr with smooth startup/overlapping tones; removed buzz/hiss.
- Original island music copied locally (Welcome, Island Life, Afternoon Boredom, Goodnight) and connected as a looping playlist at5% Web Audio gain. Separate persistent music toggle in map header; no music download before interaction, fade/pause during lessons, hidden-tab suspension and cleanup. Real browser playback, mute independence, lesson duck/resume, next-track playback and menu fit passed320px/844px checks.
- Jetpack forward cruise lean increased from11° to24° with smooth damping, restrained braking and reduced-motion scaling; camera/physics unchanged. Direction, easing, hover return and ride regression checks passed.

### Settings and final top HUD
- Added round Info far-left and Settings far-right, matching bottom-control side insets. Both open an accessible animated side drawer with Settings/About sections, independent music/effects controls and persistent Day/Sunset/Night choices.
- New user time-of-day control supersedes sunset-only appearance rule: scene's existing lights smoothly transition globally, default sunset; camera and shadow direction unchanged.
- Learn Plays now compact and centered at top on desktop/mobile, tighter word gaps and vertical padding, with room for corner buttons.
- Music now ONLY original sunset track01-welcome, looped (supersedes playlist). Music remains independent of lighting selection and quiet/ducked during lessons.
- Settings live checks passed desktop,320/390px portrait and844px landscape: audio controls, all three lighting modes, stable camera, keyboard close/focus restore, About content, no page errors. Production build passed.


### Naming and drawer refinements
- Public app name, metadata, panel branding, academy copy and package name are now Futbol Island, without II/2. Existing workspace path and local storage keys retained for continuity.
- Info opens from left with short town-focused introduction and original free-learning/donation mission, nonprofit links and $5/$10/$15/$25 links to existing production Stripe checkout. Settings contains only controls, opens from right.
- Fixed drawer entrance auto-scroll: dialog clips overflow, initial focus prevents scrolling. Opening reverses the exit animation, after140ms backdrop blur; measured actual panel motion confirms right panel moves from x1100 to700 with scrollLeft0.
- Learn Plays has rounded corners, tighter spacing, Go badge and more mobile icon clearance. Mobile actions now Ride → Shoot → Map; expanded Map shows only minus and Shoot has no arrow. Removed Parking Garage sign under Palm Street Futsal.


### September 12 production replacement
- Default startup now equips jetpack at (11,18), altitude28 above futsal, with camera initialized to the matching flight view. Walk action hidden for jetpack; remaining mobile controls shift right.
- Subtle landing marker uses the shared safe-landing search and actual ground/roof/ramp height. Marker follows the committed landing target, hides in lessons/on foot; airborne foot ring removed. Open-ground and blocked-roof landing checks passed.
- Preserved original /coffee and Stripe /coffee/checkout routes in this app so existing donation links continue after domain replacement.
- Production deployment dpl_DueEUjJTdU5pmiqGt3HmtAQRTfrR is READY and aliased to https://futbolisland.app (deployment https://futbol-island-dn2yuimlm-khoa0aohk.vercel.app). Build, town/rooftop checks passed. Public coffee page and sunset music asset return200.

### Character customization and mobile preferences (local, not deployed)
- Clicking the main character opens a right drawer with male/female starters, face/body/clothing choices, and balls/ride variants. Selections persist in futbol-island-customization-v1 and update real procedural geometry.
- Quiz progress records unique correct question keys in futbol-island-quiz-progress-v1. quizManifest.json matches all four shipped catalogs (193 questions); keep it synchronized when questions change. Additional characters/gear unlock at labeled mastery milestones. Flying car uses jetpack travel with seated pose and requires all193; saved gear is validated against progress on load.
- Mobile Flip controls mirrors joystick and HUD; narration enabled/coach voice now live in island Settings. Canvas blocks touch/trackpad pinch gestures without globally disabling browser zoom; game text selection disabled except editable fields. Radar/button/SVG each constrained square for circular silhouette.
- Build, quiz-progress/customization unit checks, town/rooftop/player/travel checks passed. Desktop/mobile browser customization checks verified actual character click, save/reload, locked car and all-question unlock, and flight movement. Pending Learn Plays UI revision hides corner Info/Settings while learning, per latest request.
- Learn Plays now hides island Info/Settings, uses top-left Choose plays and top-right round Close positioned exactly like Settings. New PlaysPicker uses shared IslandSettings drawer CSS; categories and plays live there, initially open. Selected lesson playback pauses while picker is open, restores on dismissal; voice pauses too. Desktop1100/mobile390/mobile320 checks passed for filtering, selection, focus restoration, playback pause, quiz and returning to island.
- Make it yours now shows a real full-body createPlayer preview with island sunset lighting, replacing the CSS avatar. One preview renderer per open drawer; live appearance changes reuse it, and close disposes its GPU resources. Mobile/desktop visual and lifecycle checks passed.
- Five townsfolk now stroll safely near pitches/plaza: Coach Rosa, Sam, Maya, Priya, Mr. Okafor. Click/tap their character/name or use nearby Talk/E for authored football topics and follow-ups in matching drawer. Conversation pauses player controls; NPCs hide during lessons. Five safe positions and interaction/pause/close flows verified on desktop/mobile.
- Main character faces camera at startup (atan2(16,33)). Desktop pointer hover smoothly scales character/equipped ride by12%, shows pointer cursor, and plays one hover sound; clicking plays UI click and opens customization. Scale restores on leave/dialog opening; reduced motion switches instantly. Browser check verifies facing, growth/reset, sound counts and opening.
- Learn Plays entry now keeps Choose plays closed and centers the pitch in the full-screen viewport. Space for lesson controls is reserved only after selecting a play; the picker opens only from its button.

### Ball and ride actions, flight tricks, and compact controls (local)
- Walk ball controller keeps possession at feet and rotates the ball even at rest. Shoot uses a .34s windup synced to foot contact, speed38, swept wall collisions, rebound squash/ripples and a pooled comet trail. Shots return automatically; Juggle toggles alternating keep-ups. Keyboard Space/J trigger the two current actions.
- Scooter: Spin360/Jump; bike: front/back wheelies; moped: Stand/Jump. Ground actions replace Walk. Mobile action HUD uses two rows, radar moved above both, preserving mirrored controls. Ground ring scales walk1/scooter1.65/bike2.15/moped2.3.
- Jetpack exhaust mixes blue and green. BOOST travels at150 for.45s, with sonic rings/sound and deeply leaned body (target1.25rad, smoothly eased) and responsive arms. SKYDIVE charges.65s, blasts68 higher over1.05s with shockwave, discards the pack and opens a blue/green parachute. Directional controls steer descent at10; landing marker tracks safe target; touchdown returns to Walk. Pooled effects and normal cleanup retained.
- Character hover now uses two soft cyan/green silhouette shells instead of scaling; retains pointer and hover/click sounds. Make it yours uses two-column native dropdowns with disabled locked options, live preview, saved choices and compact mastery summary.
- Learn Plays entry remains centered/full viewport with picker closed. Choose plays moved to center; new round upper-left camera control cycles Standard/Overhead/Sideline. Existing selected-lesson guided/broadcast controls preserved.
- Ball/ride and jetpack unit checks passed; desktop1100/mobile390/320 browser checks verified walking possession/spin, windup/trail, juggling, six ground tricks and HUD clearance. Flight/controls checks passed before latest stronger-boost/steering/dropdown refinements; final verification follows.
- Final desktop1100/mobile390 checks passed for hover glow without scaling, compact dropdown selection and locked car, stronger Boost/deep lean/sonic rings, higher Skydive and parachute steering/touchdown, mode ring sizes, centered Choose plays and camera-angle cycling. Latest build passed. Player ball then reduced25% with lower attached/ground center(.2); typecheck and ball-actions tests passed after this size tweak.

### Learn Plays standards audit (local)
- Restored original cached lesson-run detours without changing imported content, endpoints, carriers or quiz snapshots. All918 beats sampled81times with every actor: minimum body gap1.112m and peak4.306m/s; exact96-lesson parity retained.
- Guided honors authored shot types and correct-outcome framing; neutral quiz options included in framing; explicit Broadcast remains fixed. Manual four-angle control and closed-on-entry centered Choose plays retained.
- Fixed stale/washed-out role/callout textures, improved mobile text sizing and body clearance, separated competing callouts/answer badges, and removed94 exact duplicate feedback/answer routes.
- Eight representative mobile/desktop format flows plus actual narrated Guided step transition pass. Full source voice gate still has251 pre-existing missing references; per-lesson tactical review of held actors and every individual narration/outcome remain pending. See docs/PLAY-STANDARDS-AUDIT.md and per-item inventory; do not describe this as complete original renderer or all-play coaching acceptance.

### Skydive follow-up and icon controls (local)
- Blast camera now tracks altitude directly so the pilot stays framed; underlying heading no longer reads tornado visual rotation. Parachute inflation stays overhead, steering accelerates/decelerates smoothly, and ropes bind to animated hand world positions and actual canopy rim.
- Cut chute stays opaque, flattens, drifts down independently, then settles and fades in place. Normal landing covers the pilot, settles and fades on ground. Cartoon flailing persists throughout the entire cut fall; fast impact retains crater, splat and dazed stars.
- Island ride/map/primary/secondary buttons now use SVG icons with existing accessible names, pressed/expanded state and touch sizes retained.
- Mobile skydive browser pass includes every sampled blast frame in viewport, >200 peak, steering/trail, cover/fade, hang/fastfall/crater/stars and floating cut canopy. Parachute unit check asserts exact rope-to-hand attachment, overhead inflation and grounded fade. Player motion, jetpack unit checks and build passed; Learn Plays desktop modal follow-up still in progress separately.

### Learn view radar follow-up (local)
- Radar is closed by default behind a circular icon button. Expanded map uses original IslandMapFrame rectangular150x200 shell, with pointer/keyboard dragging, rotation and viewport clamping. Controls counter-rotate and touch controls stay visible; map opens above bottom buttons.
- Desktop1100/mobile390/320 browser checks passed closed state, rectangle dimensions, rotate, keyboard/pointer drag, bounds, no initial bottom-control overlap and toggle close. Build passed after transcript component was saved and integrated; missing-module intermediate error resolved.

### Live match presentation and original-style viewing tools (local)
- Actual pass/shot flight now leaves short pooled ribbons; score changes trigger team-colored GOAL/score badges and expanding goal-mouth rings. Uses existing simulation events, no invented goals or extra animation loop; reduced motion suppresses trails/ring motion. All four deterministic formats produce passes/shots/goals and pass tests/live-game-effects.cjs.
- Bottom viewing controls are icon-only back/play-pause/forward; live arrows disabled, pause freezes the viewed simulation only. Selected lessons use arrows to seek beats. Selecting a lesson clears any live pause. Chat sits left; circular radar toggle right starts closed and parent ported original rectangular draggable/rotatable radar shell.
- Chat now opens an original-style glass transcript window instead of NPC dialogue, with drag position and upward resize grip. Live commentary retains80 event-driven passes/shots/possession/goals plus score and keeps the match running. Lesson transcript uses exact say/desc, then quiz question/options, and only adds selected answer/explanation after answering; current/revisited beat highlighted. Works with voice muted, preserves scroll/focus while events arrive.
- Choose plays is a centered rounded modal on desktop, full-width drawer mobile; prominent category buttons show counts and selected state. Desktop1100/mobile390/320 category/filter/select/focus checks passed. Transcript muted-voice, no pre-answer explanation, post-answer feedback, live-running, drag/resize checks passed390/1100. Live playback/radar/chat layout checks passed320/390/1100.
- Radar follow-up performance: replaced150ms React panel updates with a requestAnimationFrame loop mutating marker attributes at up to30Hz, stopped when closed/hidden. Desktop1100/mobile390/320 browser rerun passed update frequency plus drag/rotate checks.
- Both island minimap and Learn Plays radar now open/minimize over240ms with restrained scale/translation/opacity, preserved layout and delayed radar unmount. Reversing mid-animation starts from current visual state; reduced-motion honored. Mobile intermediate-frame/open/close checks passed.

### Settings, quests and donation return (local)
- Replaced Info trigger with Quests. Quest progress derives from unique correct quiz answers:1star/10points each; milestone rewards use the same customization unlock definitions and existing persistent progress, with Learn CTA opening the nearby format.
- About us/donations moved into Settings as a secondary sliding page with Back to settings. Donation links now use the current origin instead of hardcoded production; Stripe cancellation returns to /?panel=about and reopens the new About/donations panel. Success also returns there; standalone coffee page refreshed and includes return link.
- Mocked Stripe route test verifies return/success URLs, safe tier clamping and fixed fallback without creating a checkout or payment. Build passed with16NPC additions/news route; final responsive drawer checks underway.
- Mobile transcript now uses available viewport width with18px side gutters plus safe areas, preserves vertical resizing, and constrains horizontal dragging; desktop remains movable. Resize start/meaningful changes emit the existing muted-aware sound bus with140ms throttle. Chat and radar toggle exclusively; transcript closes via bottom minus/chat toggle or Escape, and LIVE GAME badge has more clearance. Portrait390/320, landscape844 and desktop1100 width/resize-sound/exclusive-toggle/no-overflow checks pass.

### Latest interface polish (local)
- About us has a short description; Open full map is directly below it with secondary styling, followed by Time of day. Full map now blurs background for140ms before panel enters over240ms, then reverses on exit; desktop/mobile browser sequence passed.
- Quests now shows a winding reward path with completed/current/locked stops and real quiz-derived progress. Start Here is part of the clickable next-quest node and has hover/focus/press feedback.
- Both ride action buttons are yellow. Learn bottom buttons now exactly match ride/action dimensions72desktop/58mobile/52narrow, with32pxicons. Broadcast angle added; default live-only camera is20%closer. Bottom matching-size/spacing/camera checks passed1100/390/320.
- Chat/radar panels moved above enlarged buttons; mobile radar centered, chat retains18pxgutters; onlyoneopen, chaticonchangesminus, standalonecloseXremoved, LIVE GAME badgehidden. Radar matches chatbackground rgba(18,25,38,.74).
- All enabled button/link activations plus main/NPC character and on-field quiz selections now request10msvibration when supported. Native browser unsupported behavior remains graceful.

### Mobile framing, hover aura and match tempo (local)
- Portrait defaultlive camera now fits tighter pitch bounds and uses87–88%screenwidth on390/320px while keepingbothgoals visible; measuredbrowserchecks/screenshots passed. Broadcast/manual/lessonframing unchanged.
- Maincharacter hover aura now adds threeorbiting gold/mint arcs and18rising sparks around the existing silhouette glow, with no character resizing; particles do not capture raycasts. Reducedmotion uses a stationary aura. Browser confirmedorbitmotion/fade/noresize.
- Sharedlive simulation speed reduced .65→.42 (about35%slower acrossfutsal/7v7/9v9/11v11); ball and players remain on same clock. Fourliveclock browserchecks passed.

September 12 refinements: mobile live camera framing now fits all five angles to available viewport space (60 format/angle/viewport numerical cases; 390/320 browser views checked). Camera orientation resets when leaving Learn Plays. Open radar toggle uses a minus icon. Shots gently assist toward nearby visible people in the forward cone, with a wider hit radius. Ride changes emit a short mint/gold light burst while the footprint ring changes size. Jetpack landing marker is red with a stronger pulse, lifted above the surface, and fits inside the safe roof-edge clearance; reduced motion keeps it steady.
Wall juggling follows nearby connected building walls while moving, with an 8-meter range, ball trails, and distinct kick/bounce/receive sounds controlled by the existing sound setting. First face a wall and start juggling; moving away keeps ordinary juggling active. Shoot, changing rides, or the Juggle toggle ends it.
Wall-kick refinement: every kick varies the arc (roughly 45–95% of wall height, safely below its top), with faster launch/return motion. Juggling contacts sit at foot height (0.48m ball center), aligned to the alternating foot; the leg prepares before reception and extends at launch.
Playback now uses the full viewport while watching plays; only quizzes reserve panel space. Normal play narration panel and its camera/quiz buttons are removed. Quiz Yourself and Watch Again appear above playback controls only at completion. Default play camera frames the entire field; step durations now use a 5x authored duration multiplier (3s minimum). Raised rooftop blocks >=0.9m across support landing at their actual top, including small centered landings. Landing marker uses soft radial alpha textures and a gentle fade/pulse. Make It Yours no longer displays the quiz-mastery progress block.

Production follow-up: linked all 251 missing narration references to existing generated audio, checking exact source text and file metadata without reimporting lessons. Full catalog validation passes 6,760 voice references over 96 lessons/918 beats/193 questions, with original lesson content parity intact.
- Follow-up bounded audit read all193 quiz questions/options/feedback/outcome narration and validated exact actor/ball/spot/zone mappings. tests/quiz-outcomes.cjs passes, with all61correct-pass trajectories sampled81times (minimum opposing center clearance1.488m). No confirmed mapping defect found; no catalog/runtime edits. Individual live audiovisual/tactical acceptance remains pending; docs/QUIZ-OUTCOME-REVIEW.md records true scope and per-item results.
Mobile production follow-up: two-thumb controls use touch pointer activation for actions with duplicate-click suppression and a dedicated joystick pointer ID. Real multi-touch browser checks pass moving+boost/juggle/shoot. Mobile radar explicitly sizes its outer frame and SVG as circles (128px portrait,112px landscape), overriding older field-adjacent width rules. Mobile canvas uses the full dynamic viewport and responds to visual viewport resizing; landscape Learn Plays card is centered and capped360px. Added independent persisted music/effects sliders. Sound effects request a playback audio session when available and resume from interrupted as well as suspended states; mobile actual audibility still requires device confirmation. Learn Plays card has a translucent background, fade-in and gentle glow pulse with reduced-motion support.
Mobile interaction follow-up: 4.5 continuous outer-stick rotations trigger one cartoon dizzy/fall reaction (8s cooldown; reversals, recentring, and desktop inputs do not trigger). Walk/scooter/bike/moped collapse and show dazed stars; jetpack bursts and enters the existing cartoon fall/crater recovery. Real multi-touch browser gestures passed all five rides. Normal jetpack/parachute/crash touchdowns knock down community/practice NPCs within1.25m on the same surface; NPC touchdown browser test passed. Learn Plays remains mounted for a350ms noninteractive fade-out when leaving view. Music now deduplicates repeated unlock/resume/play requests and preserves the running gain envelope; continuity regression passes. Performance optimization was explicitly deferred by the user; no lag-related code changes retained.

### Interactive quiz view (September 12)
Quizzes use the full canvas with a compact prompt. Canvas drag pans; pinch or mouse wheel zooms between 0.7× and 3×. Reset view restores the authored framing, and a new question or camera angle resets the adjustment. Pointer gestures suppress answer selection so a pan/pinch cannot submit an answer. Camera adjustments are restored before each authored update to avoid accumulating drift. Browser checks at 390px and 1100px verified zoom, drag, pinch, reset, and no answer submission during gestures (`/tmp/fi2-quiz-gestures.cjs`).

### Choose Plays rewards and layout

Choose Plays now follows the original island playbook structure: progress summary, desktop category sidebar, stacked play rows, and a Watch action. It keeps this island's colors, centered desktop modal, mobile drawer, reversible animation, and a mobile category dropdown. The desktop category sidebar is 260px wide. Each row shows earned and remaining SVG stars from validated saved quiz completions; format/category totals and fully completed play counts use the same data. Rewards remain one star per new correct question, rather than the original application's separate three-star mastery grading. A read-only subscription also refreshes per-play counts when cross-tab progress changes.

Checked at 1100px, 390px, and 320px: saved completed/duplicate/invalid entries, category filtering, Watch selection, Escape focus restoration, and no horizontal overflow. Existing quiz-progress checks and TypeScript pass. Desktop and narrow mobile screenshots reviewed; this is structural alignment with the original modal, not a claim of identical visual styling or reward rules.

### Island interaction and presentation refinements
Replaced remaining interface emoji and symbol glyphs with the shared outlined SVG icons, including a lightning Quests trigger. Legacy lesson icon metadata now uses SVG keys; the import/parity scripts normalize only that metadata. Desktop/mobile icon checks and96-lesson parity passed.

Walk Shoot now charges on hold, fires on release, and cancels safely on lost input. A tap recalls an away ball. Charged shots add height/range, a brief backward preparation and forward approach, full-body follow-through, contact rings and brighter trails. `tests/charged-shot.cjs` verifies increasing arcs/range and clearance of a20m building30m ahead. Mobile browser verifies hold, actual run-up, recall, cancellation and moving stunned NPC limbs. Forward jetpack boost and upward blast have distinct sound envelopes.

Watch mode shares quiz drag/pinch/wheel camera controls; the extra Watch Reset button was removed at the user’s request. Futsal retains its original surface and color after the user reverted the asphalt experiment. Manually advancing to the last play step now displays Quiz Yourself and Watch Again. All eight goals were traversed at center and both posts in a24-case movement check; goals and actors have no movement colliders, so no blocker was reproduced there. iOS browser/status-bar coverage still needs the user's browser versus Home Screen mode clarification.

Power-shot refinement: holding Shoot keeps a natural step-back/ready stance; the held leg wind-up is removed. Golden particles converge around the ball while charging; the kick winds up after release and approach. Choose Plays includes a camera-angle selector synchronized with the field camera (Standard, Broadcast, Overhead, Sideline, Goalkeeper). Verified desktop/mobile selector and manual final-step actions, shot hold/run-up/recall/cancel, typecheck, and production build.

September 12 local interaction refinements: Choose Plays camera dropdown removed (corner camera control retained); loader is text-only "Loading Island ..."; mobile Go adds 10px horizontal padding. Learn Plays gestures now activate for live previews as well as Watch/quiz: one-pointer orbit with reversed vertical tilt, damped horizontal coast, two-pointer pan/pinch. Radar enlarged to 210x280 desktop / 180x240 mobile (150x200 short landscape). Pass-arrow tail consumption and feathered ribbon ported from original teachingRoutes/teachingGeometry, ball-synchronized and neutral until quiz answer; route tests cover eight directions and browser fixture covers Watch, seek, and correct quiz outcome. Jetpack landing knockdown radius increased to 4m with same-surface check, now includes field players; browser verified an NPC 2.5m away receives three stars. These refinements remain local pending deployment. Receiving/turning audit is in progress separately.


### September 13 continuation — Store and Arcade verification

The Store building is present immediately west/left of the Arcade at x85,z-57, with STORE rooftop signage, storefront, approach/hover glow and an Enter Store prompt. The prompt opens the existing equipment catalog. Fresh browser verification (`/tmp/fi2-building-prompts.cjs`) passed entrance/proximity glow, fixed catalog height across categories at four viewport sizes, and Arcade hover/click entry. This is a catalog interaction, not a walkable store interior.

Resumed `/tmp/fi2-customizer-equipment.cjs`: all 16 equipment snapshots, selections, saved values and equip modes passed at 1100,390,320px; character unlock policy and preview renderer cleanup passed. Added explicit accessible names to customization selects because nested equipment thumbnail alt text had become part of the label. The runner now checks native option.disabled for character lock state.

Latest pre-existing LiveArcadeMatch integration also received its first continuation smoke check (`/tmp/fi2-live-match-audit.cjs`): desktop/mobile kickoff, clock advance, directional keyboard input/release, pause holding the clock, resume, blur pause, pairing panel, exit cleanup and return to Arcade passed. Mobile simultaneous joystick+sprint and independent releases passed. This does not establish remote phone pairing, full three-minute match/restart acceptance or gameplay/visual polish; those remain pending.

TypeScript, town tests, customization tests and production build passed. Restarted the hung dev server on port8092. No production deployment in this continuation.


### September 13 — building interaction and onboarding continuation

Latest user requests supersede earlier starting-position notes. New visits start in Island Square at (103,-24), wearing the default jetpack at its existing 28m cruise height, facing the camera (atan2(16,33)). The fixed camera behavior is preserved.

Store, Arcade and Coaches now use `buildingGlow.ts`: outlines follow wall corners, roof edges and rooftop signage, with a rising surface wash. Store/Arcade roof rooms also have outlines. These replace the building character-orbit effects; the character keeps its own effect. The existing render loop drives animation, three batched glow meshes per building, hidden when inactive; reduced motion uses steady outlines. Coaches has a new elevated COACHES sign, click/tap hit bounds, and an accessible Coming soon modal with Escape/close controls.

All three entrances offer buttons when approached on foot, scooter, bike or moped at ground level. Arcade/Coaches entry also triggers the corresponding glow. Prompts hide away from entrances and while modal/lesson interfaces are active. Airborne jetpacks do not trigger ground-level proximity entry; buildings can still be clicked/tapped.

Settings now has an explicit Onboarding walkthrough section and Start walkthrough action. Five-step replay includes NPC conversations: click/tap locals, approach for Talk, or press E on keyboard. Replay begins at step one and works after earlier completion/dismissal.

Verification: `/tmp/fi2-building-outline.cjs` passed Store/Arcade outlines and sweep; `/tmp/fi2-coaches-building.cjs` passed desktop/mobile Coaches hover, sign click, modal, dismissal and reduced motion before proximity entry was added. `/tmp/fi2-building-ride-entry.cjs` passed both entrances across all four ground modes on desktop/mobile and prompt hiding. `/tmp/fi2-settings-walkthrough.cjs` passed final starting position/facing, five-step replay, completion and dismissal on desktop/mobile. Mobile spawn, NPC step, Coaches sign/entry screenshots inspected. Production build passed before the final spawn-only framing adjustment; final TypeScript check passed. No deployment.

### September 13 — latest island polish

Store and Island Market fronts align with Arcade at z=-53. Updated Store hit bounds, hover outline, entry prompt and map arrival together. Added a paved frontage with planters/bushes, bench, and a sand volleyball court beside the western South Pier approach. Coaches now matches Store's 900×800 maximum modal size, with IDP and Coaches Board Coming soon cards. Choose plays uses tan #f2e7c5.

Flight catalog uses normal large cards and the title Flight. Alien Glider removed; saved alien selections fall back to Twin jet. Hovercraft replaced by a small helicopter backpack; old hovercraft saves migrate to helicopter. Flying car is red with green trim and underside/rear green exhaust. Helicopter is purple with purple rotor wake; forward/upward boosts have distinct strengthened trails. Female starter selection uses light skin, Coast kit, and mint preview background in onboarding and customization. Selected onboarding progress indicator has 2px rounded corners.

Hover pauses NPC routines/poses and resumes on exit; pointer tolerance prevents edge flicker. Six new locals run/skate/scoot on validated corridors. Initial ride visibility and moving-NPC update throttling corrected after reported glitches. Three cars loop on roads with dynamic collision footprints and yield to the main character. Seventeen street lights brighten at night, using emissive fixtures without extra shadow lights.

All selectable balls share hit detection and matching trails. Repeated tap recalls and shoots in one action. Moving impacts now use a lower threshold. Classic has a small knockback, Glow pushes up to 4.5m, Sunset adds a brief upward pop and orange sparks; swept knockback checks stop at walls and update underlying NPC/field positions. Real mouse/touch kick checks passed for all three styles against community NPCs and field players at 1100/390 widths. Unit checks passed for impact differences, collision stopping, recovery, goals, customization, travel and NPC routines.

Browser checks: flight/customization equip and persistence at 1100/390/320; helicopter wake/dash/ascent and tall flight cards at 1100/390; Coaches sizing/cards, ball trail colors and hover pause/release; aligned storefronts, volleyball placement and car trail; six mobile NPCs, three moving cars, yielding and 17 lamps at 1100/390. TypeScript passed after the final onboarding indicator adjustment. Production build passed before the final NPC corridor/indicator tweaks. Local only; no deployment.

### September 13 — deployment continuation

Four beach-volleyball NPCs now share a rally with net clearance, receiving motions, hover pause, conversations and the existing ball-hit reactions. Northern shoreline expanded; sand width, umbrella locations and beach paths are shared between 3D terrain and both maps. Maps also show the pier and volleyball footprint.

Players to learn from now opens individual profiles inside the same fixed-size modal, with Back/Escape navigation, restored list focus, original retro avatars and imported player summaries/strengths. Seven cars navigate the authored road graph across districts; validated 57 traversed edges with no off-road positions in desktop/mobile checks. Head-on collisions trigger rider recovery, car jolt and rotating driver speech bubbles with cooldown. Starting spawn moved south to (103,-8). Latest lighting instruction supersedes earlier lamp notes: fixtures only at intersection corners.

Desktop/mobile checks passed volleyball rally/net clearance/pause, northern beach and maps, clickable profiles and fixed modal dimensions, road containment and car crashes. Final production build passed. User explicitly requested deployment without ripples; no ripple implementation was added. Production deployment completed September 13: dpl_AMTMNmj3YDNrmULTbiEuKSiXgnon is READY and aliased to https://futbolisland.app (deployment https://futbol-island-2xu2quk45-khoa0aohk.vercel.app). Initial authorization failure resolved by retrying with explicit --scope khoa0aohk. Live desktop/mobile smoke checks passed: HTTP 200, southern spawn, seven cars, volleyball system and no page errors.

### September 13 — traffic signal fixtures

Replaced all remaining intersection lanterns with compact traffic signals: yellow-edged dark housings, round red/yellow/green lenses stacked top to bottom, and perpendicular faces toward the intersecting streets. Pole footprints and intersection placement retained. Shared emissive lens materials use the existing static batches; no new real-time lights. Signals are visual fixtures; car driving behavior is unchanged. Renamed the asset kind to traffic-signal and the daylight updater to updateTrafficSignals. TypeScript and desktop/mobile browser checks passed (all three lens colors present, no old lamp assets, no page errors). Local change on port 8092; not yet deployed.

Traffic signal placement refinement: corner supports now carry overhead mast arms, placing each signal head above the incoming lane at the far side of its crossing. Heads face approaching drivers; nonexistent road approaches are skipped. Pole height 7m, head bottom 4.39m, braced arms. TypeScript and desktop/mobile browser checks passed. Local only.

### September 13 — lightweight water ripples

User explicitly requested ripples again, superseding the earlier cancellation. Added a seamless 256×256 once-generated canvas texture to the existing ocean material. Soft curved highlights drift via texture offsets in the existing render loop, with no new mesh, render pass or downloaded asset. Texture follows world disposal. Ripples and existing wave-strip motion pause under reduced motion, inactive gameplay and learning view. TypeScript and desktop/mobile browser checks passed for texture setup, moving offsets, reduced-motion freeze and no page errors; screenshot inspected. Local on port 8092; not deployed.

### September 13 — store expansion and signature actions

User authorized three additions in each of the five existing store categories, with distinct trail colors/styles and two actions per new item. Store now has 30 options (15 new): Frost/Solar/Cosmic balls, Mint/Stunt/Comet scooters, BMX/Road/Mountain bikes, Retro/Delivery/Sport mopeds, Iron Man suit/Rocket surfboard/Mini airplane flight. Existing equipment and free-preview policy retained. Every item previews from actual geometry/materials and saves through the existing customization slot.

Frost has Ice strike/Ice taps, Solar Sunburst shot/Solar flare juggle, Cosmic Spiral shot/Orbital juggle; new skins shared across previews/world, differing wall-checked knockdowns and actual juggle timing/height/orbit. Ground variants have 18 distinct animations with colored pooled trails, no speed buffs. Flight has Repulsor surge/launch, Forward flip/Vertical corkscrew, Barrel roll/Loop climb; armor follows joints while preserving character identity. Store cards list both actions and Space/J controls, HUD action labels match equipment. Fixed grid compression: cards retain full images/actions, and only the list scrolls inside stable modal bounds.

Validation: all30 unique equipment snapshots/selects/persistence at1100/390/320; all15 new storecards with2actions/fullimage/noinnerscroll/fixedmodal/equip/save at1100/390. Browser checks passed both actual groundactions for9items plus trails, both flightactions for3items plus equip/persistence/armor alignment, real community+field kicks and juggling for3newballs at1100/390. Unit ball signatures, knockback checks, ground poses/trails, customization/equip/persistence passed. Final production build passed: root296kB, firstload384kB. Not deployed; available at localhost8092. Existing overheadsignals and water ripples retained.

Retention and costume research is in RETENTION-IDEAS.md. No proposed engagement/wardrobe features built. Learninghighlight agent audited96lessons/918steps/193questions: only32steps and52feedbackscenes explicitly shade space;133spotlights unsupported. Initial highlight edits were restored when user changed to research-only; no partial implementation retained.

## Football Passport pilot — 13 September 2026
- Plan and scope: `PASSPORT-PLAN.md`. Three playable journeys (Barcelona, Arsenal, Bayern) connect existing mascot stories, six curated current/legend player cards, and three interactive animated pitch decisions.
- Passport opens beside Quests and from Settings/Quests. Store links open the related journey; journey rewards deep-link back to the correct Store category/item or mascot story.
- Four verified answers earn each stamp. Player answers earn their cards separately. Five learning badges span Balls, Scooters, Bikes, Mopeds and Flight; mascots link their club story. Gear remains free; badges are visible collection rewards, not new 3D equipment or trail variants.
- `lib/town/passport.ts` defines content and pure award rules. `passportProgress.ts` saves validated evidence under `fi2-passport-v1`, merges existing `fi2-club-stories-v1`, and notifies subscribers/cross-tab storage listeners. Store mascot quizzes now use this shared source.
- Source links live inside every story/player view; current affiliations checked against official club pages on 13 September 2026. Pitch illustrations are original training examples. Motion plays only on request, supports pause and three manual beats, and stops when Passport closes.
- Validation: `tests/passport.cjs` passes reward prerequisites, wrong answers, duplicate prevention, corrupt input, all category links and save roundtrip. `/tmp/fi2-passport-browser.cjs` completed all journeys, keyboard pitch choices, replay/pause, desktop/mobile layouts, fixed window bounds, legacy-story migration, Store roundtrips and reload persistence without page errors. Production build passes. Screenshots `/tmp/fi2-passport-desktop.png`, `/tmp/fi2-passport-*-mobile.png`, `/tmp/fi2-passport-earned.png`.
- Local preview only; not deployed. NPC missions, all 23 full journeys, cosmetic reward variants, and cloud saves remain future iterations.

## Visual teaching coverage follow-through
- All 918 steps across 96 lessons have rendered teaching cues; all 193 quiz questions have visible neutral targets before answering.
- 34 foundational steps now have 102 authored animation beats, including movement, direction changes and connected passes. Beat captions, narration-aware duration, deterministic seeking and actual per-beat ball/actor motion are implemented.
- Renderer includes ground ribbons, spotlight areas, passing/support links, dashed routes, direction arrows, defensive cues and zone extents. Quiz camera framing includes rectangle corners and spot radii.
- Teaching coverage, authored-beat continuity, presentation spacing/speed, ball contact, quiz outcomes and cue renderer tests pass. Desktop/mobile renderer screenshots reviewed by the visual agent.

## Plays and quizzes — second improvement pass
- Quiz feedback now offers pause/continue/replay and retry. A wrong answer can optionally show the correct movement, explicitly labeled as a demonstration; it never changes the answer or grants a star. Retry clears preview state and restores neutral targets.
- Shared `quizOutcomeStep` keeps the field renderer, camera and radar on the same replay pose. Quiz outcomes now display authored movement trails, direction arrows, passing/support connections and live beat captions.
- Replay controls sit in a separate lower panel so they do not get buried in the question's scroll area. Quiz camera framing reserves this panel's height and extra horizontal actor margin; redundant mobile teaching captions are capped without removing answer targets or ground markings.
- `tests/quiz-replay.cjs` validates all 193 question replay states and continuous starting poses. Existing 918-step coverage, cue rendering, quiz outcomes, beat continuity and spacing/speed checks pass. `/tmp/fi2-quiz-replay-browser.cjs` validates all four formats through wrong answer → optional demo → pause → retry → correct answer → replay, including exactly-once credit and mobile controls. Mobile screenshots inspected after camera framing changes.

## Iron Man helmet
- Added an oversized faceted red helmet, gold faceplate and cyan eye slits, attached to the animated head above the shoulders. The armor temporarily hides the original head subtree so all mascot snouts/ears/horns stay covered; switching rides or disposing armor restores the previous visibility without changing the equipped mascot.
- Store preview uses the same helmet geometry. `tests/ironman-helmet.cjs` passes all 23 mascots plus the default head, animated anchor alignment and restoration/disposal. Customization tests and desktop browser equip/preview/restore checks pass; preview inspected at `/tmp/fi2-ironman-helmet-store.png`.
- Parachute follow-up: keep wearable Iron Man armor visible through parachute and freefall (other vehicles still disappear), turn off its repulsor flames/trail during descent, and restore the underlying head whenever any armor ancestor is hidden. Browser regression now runs real launch → parachute → cut → landing and checks suit visibility and mascot restoration; all 23 mascot unit cases cover hidden-parent restoration and unpowered descent.
- Final behavior confirmed by user: Iron Man behaves as flight equipment, not a walking costume. Armor/helmet are active only in jetpack mode, stay visible through parachute/freefall, and reveal the equipped mascot after landing into walk mode. Store selection labels retain their original behavior. Helmet/customization regressions and typecheck pass.


## Island rewards and vibrant characters
- Wearable animals now have original Futbol Island names and fictional football habit stories, presented separately from the sourced real club mascot history. Original animal body/accent colors restored at the user's request; shared teal island training clothes remain. Existing equipment IDs and progress are preserved.
- Passport stamps and player learning cards are labeled as island learning records; linked equipment stays free. Store, Passport and all 23 costume/helmet regression checks pass.

## Ride ramps
- Two street ramps, one open north beach ramp at (110, -212), and two roof transfers from Bakery → Rua do Sol → Fish Market. Removed the northwest ramp hidden behind buildings as requested.
- Green surfaces, gold directional chevrons, football scanning/timing reminders and marked landing lanes. Scooter, bicycle and moped rides launch into a ballistic jump and land with damped pitch/roll/yaw wobble; walking does not activate the boost.
- Rooftop ramps check entry elevation, account for the destination roof height and use elevated wall collision checks. Surface integration lets characters stand on ramps; switching rides/travel resets jump state.
- Unit checks cover all ground rides, wrong-way entry, thin obstacle collisions and upward/downward roof transfers. Browser checks cover all five ramps, target roof landings, launch height, wobble and exact pose settling; north and rooftop screenshots inspected. Typecheck passes. Local preview only.

- Ramp visual follow-up: removed all chevrons, text, checkered lips and landing-lane markings at the user’s request. Ramp tops are plain green; jump physics are unchanged.

- Rooftop boost fix: slow forward approaches and starts partway up a ramp now activate reliably, matching the sloped surface height. Rooftop flight arcs adapt to boosted speed instead of reducing velocity; a different ramp can trigger during the landing wobble so consecutive roof jumps work. Regression tests cover slow entry, on-ramp starts, speed gain and chained rooftop activation for all three rides.

- Rooftop ramps widened from 2.4 to 4 metres and shifted inward to stay clear of roof edges. Boost activation now needs only 0.2 m/s of forward movement on rooftop ramps. Regression checks cover gentle entry near both widened edges with every ground ride.

- Added the third Fish Market rooftop ramp as a cannon finale: 60 m/s launch, a taller arc, recoil/airborne wobble, and three pooled expanding burst rings (hidden for reduced motion). All three rooftop ramps stay plain, wide, and easy to activate. Six-ramp browser checks verify launches, target roof transfers and cannon height/speed/landing; screenshots inspected.

- Cannon finale follow-up: reduced launch speed from 60 to 40 m/s and aimed it toward (100, -40) in the Arcade/Store square. A plain 6-metre-wide descending landing ramp catches the jump and rolls out toward the square’s far end; it never activates another boost.
- Intersection audit removed supports with no valid incoming signal approach before creating their meshes/assets/collisions. Browser audit verified 46 functioning supports, all signal lens colors and no orphan poles or leftover collisions; typecheck passed.

- Final ramp verification: production build passed; the mobile joystick browser check rode the complete three-rooftop sequence without resets and verified touchdown on the slope in the Arcade/Store square. Landing screenshot reviewed at /tmp/fi2-square-landing.png.

## Learning-first quests and Passport research
- LEARNING-QUEST-RESEARCH.md reviews learning science, game motivation and football decision-training evidence against the current app. It recommends connecting existing full plays/quizzes to concept quests and using Passport to distinguish guided practice, independent application and later recall from cultural collections.
- Research and recommendations only; no new quest/progress implementation in this task. Working audience is ages 8–12, with support adapted to experience and reading level.

- Ramp alignment follow-up: the full roof sequence and square landing now share a straight eastbound axis at z=-20.3. The landing stays at the southern end of the Arcade/Store square (touchdown x=100), and the obstructing southeast planter moved from (110,-24) to (113,-30), including its visual and collision footprint.

- Shorter landing follow-up: landing slope shortened to 8m and brought west to end at x=80, directly before the signal at (82.7,-17.3), preserving the straight z=-20.3 route. Touchdown and launch arc retargeted to the shorter distance. The shuttle-side planter moved from (76,-23) to (78,-29) to clear the landing footprint.

- Landing moved another 4m west at user request: lower end x=76, touchdown x=70.67, still aligned with all three roof ramps. Nearby bench moved from (70,-24) to (66,-27) to keep the wider landing clear.

- Landing moved another 4m toward the rooftops: lower end x=72 and touchdown x=66.67. Bench shifted to (62,-28) to keep the approach clear.

- Landing moved 4m closer again: lower end x=68, touchdown x=62.67, preserving the straight route.

- Landing placed closer to the west street with lower end x=64 and width4m, matching the launch ramps. Its footprint (x56–64, z-22.3–-18.3) leaves the street sidewalk and shuttle walking path open.

- Added three low bushes along the front edge of the landing ramp, outside its riding line and the nearby walking paths. Static geometry shares existing foliage materials.

- Moved the three ramp bushes to its west/high end at x=55.05 and raised them to approximately3m, matching the top of the ramp. The previous south-edge bushes are removed.

## History Museum building
- Replaced Campus Café with HISTORY MUSEUM on the east side of Eleven Park. Height increased from11m to18m; north–south depth increased from17m to40m, preserving the north edge and extending south into the empty space. Final footprint center (200,146.5),18×40m.
- Added prominent museum signs and football-history labels on the south and west facades. Shared building geometry updates map footprints and collisions. This change is the exterior building; exhibits are not implemented.

- Costume color refresh: twelve quieter island animal palettes now have brighter complementary accents and individual training colors. Colored shoulders/shorts coordinate with their scarf and top; existing colorful costumes keep their palette. Store previews and equipped characters share the same rendering.

- Museum shape follow-up: rounded4m corners on the body, roof and base; front details narrowed to fit the flat facade and rectangular rooftop parapets removed. Rounded footprint is shared with ground collision, rooftop support and both map views. Existing rectangular building behavior remains unchanged.

- Museum terrace: lowered south half to9m while retaining an18m north wing. Added a curved,1.25m-high fence with explicit roof-level collision barriers; the terrace supports landing and walking. Structural rounded geometry is excluded from automatic rooftop-prop detection to preserve the two actual roof levels.

- Museum access: added the south-facing terrace double door, moved the east exterior stairs north to meet the door area, and extended the west terrace stairs onto the north roof. Both flights have walkable step surfaces and support walking, scooters, bikes and mopeds in both directions.
- Upper roof safety: continuous rounded railing splits at the exact stair sides, joins the landing side rails and leaves only the protected stair mouth open. Collision barriers match the perimeter and landing. Browser verification passed 16 stair routes and 288 outward roof-edge checks across walking and all three rides; rooftop and ride-ramp regressions and production build passed.
- Removed Sail Loft; its former regular is now labeled Museum courtyard regular.
- Parachute road rendering: sidewalk geometry is cut around asphalt rather than overlapping immediately beneath it, eliminating that source of depth flicker without extra rendering effects. Browser captures checked at heights35,80,150 with no page errors.

- Stair mounting fix: retain walking collision clearance when equipping a ride beside a railing, restoring the full ride footprint once it fits. Prevents a larger collision radius from trapping the rider immediately after switching. Browser checks passed36 switches across both stairs, both directions, center and both rail edges, and all three rides. Added regression coverage for continued movement, solid railings and restored riding clearance; typecheck and192 goal-collision approaches passed.

- Flying ride touchdown fix: crash/cut-parachute falls resolve to a safe landing before returning to ground movement, including objects and building edges. Landing checks now reject taller overlapping walls and use full riding clearance around rooftop props and stair railings. Regular flight descent snaps exactly to its validated target and rechecks it; all action touchdowns have a final safety check. Verified29 browser drops with safe landing and continued movement, plus jetpack, rooftop, offshore, goal-collision regressions and TypeScript checks.

## Football learning quests pilot
- Quests is now the single island entry point. Passport is nested inside Quests via Open Passport, with Back to quests navigation; Settings links to Quests & Passport. Club/player/Store entry points still reach the relevant learning context.
- Three connected episodes: Find the next pass (support angles), Make room on the wing (width and timing), Arrive in scoring space (off-ball movement). Each opens its existing full field lesson and quizzes, followed by a guided decision and two changed-situation checks using the same renderer. Fifteen original visual scenes include defender/teammate cues, neutral pitch choices, explanatory feedback and three-beat movement/pass demonstrations.
- Passport defaults to My game, with Football stories separate. Saved culture stamps, player cards, gear and old exploration achievements remain intact. NPC conversations, related player/club pages and linked Store items offer entry into the full quests. No quiz power advantages or equipment locks were added.
- `fi2-football-learning-v1` stores the active episode, paused step/question/answer, immutable first attempts, retry numbers, assistance/exposure history, completed stages, favorites and review timing. Status distinguishes Introduced, Practicing, Applied (independent first answers in two distinct situations) and Remembered (independent success in a later unseen situation). Existing completion flags are not upgraded into independent evidence.
- An unfinished episode resumes at a paused teaching boundary, including after reload. Finishing a stage returns to Passport and the next step; playbook replays preserve evidence. New review scenes appear around day2 and day7 after the initial episode; practice remains available immediately, with no missed-day penalties or lost achievements.
- Verified: 3 existing lesson destinations,15 new scenes and support-line geometry; full browser episode/resume/reload/hint/retry flow; all three later-review scenes via actual desktop pitch clicks and mobile taps with reduced motion; existing Passport, quests and193 quiz outcome regressions; production build. This is an implementation pilot; child usability sessions and evidence of real-world learning gains have not been conducted.

## Preview, goal effects and garden café polish
- Make it yours character preview enlarged to260–360px. Camera fits visible rig bounds after equipment/viewport changes, leaving room for oversized costume heads, horns and ears. Existing idle-animation throttling and reduced-motion behavior remain. Desktop/mobile checks covered bear, goat, wildcat and unequipped avatars.
- Live goal score banners now have a short team-colored glow and lightning streaks. One pooled additive sprite per pitch; no new scene lights, shadows or postprocessing. Reduced motion uses a stationary low-intensity halo. Score-driven simulations passed for all four formats; browser confirmed the visible burst.
- Kicked balls hitting tree trunks shed small leaves/twigs; palm hits shed narrow frond strips from their own canopy height.48 reused particles, per-tree cooldown, automatic expiry, fewer particles for reduced motion. Verified actual ball collisions on both tree types and lifecycle tests.
- Added four outdoor tables with backed chairs, two umbrellas, two planters and a small tactics board east of Garden Café. Patio footprint x207–227,z-52–-38; central aisle x217 remains walkable. Browser confirms no building/road overlap.
- Expanded the community garden lawn to54×50m with low grass tufts outside paths. Existing garden paths and café access remain clear; lawn footprints are included in the shared map surface data.
- Extended the community garden lawn18m farther south, to z28 (54×68m centered208,-6), preserving its north edge. Added a few low tufts along the new lawn edge; existing raised paths remain visible and walkable. Shared surface metadata updates the maps automatically.

- Restored the visual winding-path design as the main Quests experience. Three selectable football chapters each show six raised stops: example, guided practice, independent read, changed situation and two spaced reviews. Current stop is gold, completed stops show green checks and can be replayed; later stages display clear availability. Passport remains nested inside Quests. Verified chapter switching, direct full-lesson launch, saved return and Passport navigation on desktop/mobile; TypeScript passed.
- Fixed cars leaking into the isolated plays/quiz view: the entire street-traffic group (cars and driver speech) is hidden and its update is skipped while a field learning view or introductory lesson is active. Restores on island return. Browser verified hidden, stationary traffic and restoration in all four formats; TypeScript passed.

## Quest celebrations and Store badges
- Each newly completed step opens a medal/confetti celebration inside the existing Passport panel. Full four-stop completion celebrates a quest badge and shows the actual linked equipment: Pass & move / Cosmic ball, Wide runner / Road bike, Space spotter / Helicopter pack. The CTA opens that item in Store, where the normal free equip action remains available.
- Store item cards and quest paths display the earned completion badge. Completion badges are explicitly separate from independent learning status; assistance never becomes independent evidence. No gear locks, purchases or quiz advantages were added.
- Pending celebrations persist through reload until dismissed. Replaying a completed stage does not re-award badges or enqueue another celebration. Confetti runs once with18 elements; reduced motion keeps a static medal. Reward previews render only the one related item.
- Verified desktop/mobile completion → celebration → reload → Store → equip → return, along with reward eligibility/idempotency and existing Passport tests. TypeScript and production build checked.


### Shared modal headers and southeast waterfront (September 2026)
- Modal/drawer titles and close controls use ModalShell with a fixed header and independently scrolling content. Removed decorative brand kickers; costume stories preserve list scroll restoration.
- Seaside Fish Market became History Museum: 30m wide, western extension keeps eastern wall at x183. Large clickable sign, building glow, Enter action, and Coming soon modal.
- Former rounded museum is Cafe By The Sea, with six outdoor tables, shade umbrellas, plants and a tabletop football pitch. Existing terrace and rooftop stairs remain accessible.
- Museum/cafe paths connect to the southern boardwalk. Southeast corner is a ferry dock with a level wooden entrance and matching pier planks with a gently bobbing moored Matchday Ferry (scenery; pauses in reduced motion), deck and railings; both maps show the dock.
- Stair ascent/descent uses quiet synthesized footsteps/wheel clacks, respecting mute/volume. Café furnishings and umbrellas are excluded from flight landing targets while regular rooftop equipment remains landable.
- Live goal score popup now has a pink background and dark readable text.

- East market boardwalk extends from the ferry dock at z190 to z30, clear of the garden grass, covering x210–238 beneath the unchanged farmers-market stalls. Matches pier wood, plank direction/spacing and walkable ground level; shown on both maps.

- Farmers market sign moved to the center of the row (z98). Ferry boarding gangway opens through the dock railing to the aft deck; walking, scooter, bike and moped crossings passed in both directions. Offshore walking exception is limited to the gangway and ferry footprint.

- Community garden lawn extends to z30, meeting the east boardwalk without a sand gap; its north edge stays at z-40.

### Matchday exploration hunt and mobile polish (14 September 2026)
- Implemented 40 collectible soccer balls in Quests, with progressive clues, saved markers, football teaching cues, and the original Matchday Fox reward. Existing saved collectible IDs are preserved.
- Solid boxes, hidden trunks, two practice-wall targets, six raised building-wall boxes, rooftop pickups, four grass-covered drop hatches, four padded boxes, and a ramp-only airborne pickup between the third and fourth roof ramps support island exploration.
- Added teal and gold pickup trucks to the road network. Accurate flight landing in a marked bed collects its ball; the player can ride along, move to dismount, or take off. Truck markers follow their live positions.
- Unopened boxes/trunks participate in collision; opened boxes remove their footprint entirely. Zero-size obstacles no longer retain padded collision. Pickup balls behind hidden trunks remain accessible without walking through their geometry.
- Onboarding now has nine steps, enlarged costume previews and a wider island-character spotlight, plus current quests, Passport, collectibles, trucks, rooftop drops and wall-shot guidance. Settings no longer duplicates Quests & Passport.
- Mobile joystick gains directional feedback, glow and return motion. Music defaults to15% and shares one AudioContext with effects using independent gains, so toggling one does not suspend the other.
- Added a lightweight first-load character teleport arrival and nearby building glows while flying. Effects share the existing animation loop and respect reduced motion.

### Shorter onboarding and audio balance
- Reduced the walkthrough from nine steps to six; all discovery guidance is condensed into one screen with detailed clues in Quests.
- Welcome uses a taller viewport-constrained card and flexible costume preview so starter choices and navigation remain visible without scrolling. Footer now sits outside the scrollable body.
- Tour cards choose the largest clear vertical area between highlighted controls, avoiding overlap with the Quests, Learn Plays, joystick and ride buttons.
- Default background music lowered to8%; sound effects default to100%. Explicit saved volume preferences continue to apply.

### Ball hunt performance pass
- Batched parcel details using vertex colors; all40 balls share one baked geometry, with one mesh per ball. Preserves geometry, colors, locations and interaction behavior.
- Hunt mesh count883→110; shadow casters874→25. Only substantial boxes/trunks cast shadows. Balls, symbols and particle fragments do not.
- Cosmetic ball motion runs only for revealed, uncollected balls within64m. Logic still detects nearby pickups, raised targets, grass drops and the ramp-only ball.
- Cached collected/revealed ID sets avoid repeated array scans; completed truck pickups stop calling the persistence merge on every frame.
- Matched-view browser audit: hunt-added draw calls27→3 at the starting view,37→4 at the north field,99→13 in the overview. These are rendering measurements, not physical phone temperature measurements. Pixel ratio and scene resolution unchanged.
- All static pickup routes, wall juggling and landing boxes passed browser checks. Regression tests cover geometry budget, distant animation gating, collision and zero repeated storage reads for collected truck balls. Production build passed.

### Quality-preserving island performance pass
- Paused Settings/map scenes reuse the rendered canvas after a3-second settling window. Closing a panel, resizing, changing appearance or time of day resumes/invalidate rendering; onboarding remains live for its character spotlight. Preview canvases remain independent.
- Added16m spatial buckets for collision candidates and indexed roof lookups. Moving cars and breakable parcels stay live; swept collision steps, rounded building tests and landing clearance remain unchanged. Randomized grid tests match exhaustive collision candidates, averaging11 of2000 objects per query.
- Cars and pickups batch rigid geometry by material, preserving glass roughness, colors, normals, UVs and silhouettes. Each vehicle now uses4 meshes.
- HUD state and DOM label/position writes are conditional; field/entry nodes are cached, and traffic signal materials only update when time of day changes.
- Static building/vegetation shadow depth is cached once the light projection settles. Dynamic characters and vehicles render into the same shadow target after cached color/depth restoration. Camera/light projection and static visibility changes invalidate it. The fallback retains full redraw while moving. Resolution remains2048, with the same PCF soft shadows.
- The shadow cache uses one lazily allocated extra shadow render target and the framebuffer layout of pinned Three r169; its context-restoration/disposal lifecycle is explicit. Browser comparison of cached static+dynamic shadows against a full redraw found zero pixel differences and zero WebGL errors.
- Existing30fps mobile cap and pixel ratio retained. Regression tests passed for rooftop/stair movement, all ride ramps, solid/landing boxes and spatial indexing. Production build passed.

### Mobile heat regression investigation — September 14, 2026
- User reports iPhone 17 Pro Max warms after ~3 minutes and audio/frame stutter during flight boosts; September 13 deployment reportedly ran well.
- Compared authenticated September 13 deployment `2xu2quk45` with September 14 production `7f5kx3pid`. Scene meshes increased 4598 → 5364 (including inactive variants); ordinary-movement CPU profiling did not establish a CPU regression. Route/view differences make flight draw-call totals unsuitable as a causal comparison.
- Mobile now uses the original full shadow pass, preserving 2048 PCF shadow quality while removing the recently introduced per-frame color/depth cache blits and synchronous GL state queries. Desktop cache remains enabled. This is a controlled rollback of a suspect, not proof of reduced device temperature.
- Repeated sonic boosts only invalidate their material when the texture changes; colors and animations continue updating normally.
- `tests/boost-render-work.cjs` checks material reuse and that disabling shadow caching leaves the renderer untouched. Production build passes. Physical iPhone thermal/audio confirmation still required; these changes are local, not yet deployed.

### Truck landing and ball-hunt refinements — September 14
- Pickup landing outline covers the truck footprint: amber over cab/body, green over the valid bed or during descent. No shadow/light added. Touchdown adds brief character compression and suspension settling; both truck ball/passenger flows verified.
- Quests now shows a collected/remaining summary and progress bar. Clues & discoveries opens a second-level panel with Back to quests, matching existing dimensions and sticky header. All 40 clues remain available; found entries retain their football lesson text.
- School parcel moved from (86,162) to (86,168); Garden House grass hatch from (119,-138) to (100,-138), with clue changed to west roof edge. All static ground collectible footprints clear the authored road footprints with 1.3m padding. IDs/progress retained.
- All 40 teaching messages are distinct; the final collected ball's teaching is shown alongside the reward. Editorial reference for scanning, receiving, width and passing: FIFA Training Centre, John Peacock Passing and receiving (https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/john-peacock-passing-and-receiving.php), Receiving under pressure and moving into space (https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/build-and-progress/passing-circuit-receiving-under-pressure-and-moving-into-space.php), Receiving between the lines (https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/build-and-progress/passing-circuit-receiving-between-the-lines.php), Technical Activation Circuit 5 (https://www.fifatrainingcentre.com/en/practice/technical-activation/technical-activation-circuit-5.php). Original beginner practice prompts, not quotations.
- Manual Next navigation to final play step now exposes Watch Again / Quiz Yourself without requiring the final animation to finish. Does not award completion for skipping. Browser verified all four formats.
- Build and coin progress/collision tests pass; local changes not deployed.

### Mobile interaction clarity and walkthrough motion
- Joystick edge contact adds a curved cream contact line with a wide, softly feathered amber glow localized to the contact point, rotating with thumb direction; the remaining ring and thumb retain their normal appearance. Only two opacity/transform pulses run per contact; no filter, native drag, texture generation or animation loop. Reduced motion disables pulses; release clears feedback.
- Onboarding keeps one card mounted, interpolates its location/size and highlighted control bounds, fades each step's content, and blends into/out of the island-character camera focus over 0.55s. Reduced motion remains immediate. All six steps tested at 1100×850, 390×680 and 390×844; preview, header, controls and spotlight checks pass.
- Enterable buildings have a stronger saturated green outline and rising wash using the existing three meshes. Mobile shows one top Enter prompt for the closest eligible building, including nearby flight; it takes priority over field-entry banners. All four building prompts and opening Coaches tested.
- Relocated Garden House hatch at (100,-138) and school parcel both pass actual landing/kick-and-collect checks. Initial trial at x103 intersected the house and was corrected; road clearance audit is clean.

### Production deployment — September 14, 2026
Latest changes deployed to https://futbolisland.app, deployment `dpl_8WJcRoGyKXJm4hegqgff8eE7YwnL` (`futbol-island-fxhpyasw4-khoa0aohk.vercel.app`). Includes all preceding local updates: thermal shadow rollback, truck landing, quests/clues, unique discoveries, road-clear boxes, play end controls, smooth onboarding, mobile building entry and joystick contact glow/feathered arc. Arrival duration is now 3.5 seconds. Local and Vercel builds pass. Production browser checks passed for mobile controller contact/release, all four flight Enter prompts, opening Coaches, 0/7/40 hunt progress, and second-level clues/Back navigation with stable dimensions. Physical iPhone thermal behavior still requires user verification.

### Truck driving and mobile landing refinement (local, not deployed)
- Assisted pickup landing within 8 metres follows the moving bed smoothly; held thumb input cannot immediately eject the rider. Landing preview avoids repeated ground searches while targeting a truck. Empty flight particle batches are hidden.
- Rider sits with bent knees; joystick drives freely off-road with swept obstacle checks. Normal driving matches the moped (28 m/s), Boost reaches 40 m/s and works from rest, reverse is 8 m/s with a backing beep. Actions use the flight boost icon and a horn icon; horn is a two-tone car sound. A single reused engine oscillator follows driving speed and stops when inactive, muted, hidden, or dismounted.
- Hop off finds an open exit. Truck returns to roads via a bounded incremental route search, then resumes roaming. Both pickup landing/collection, seated pose, reverse, boost from rest, dismount and autonomous return passed mobile browser checks before the final moped speed adjustment.
- Building glow is softer; mobile highlights only the nearest building and positions Enter beside it.

### Mobile UI/audio work reduction and reading time
- Joystick updates its thumb/contact styles directly, avoiding Town React state updates for each pointer move. Glow, fading contact arc, touch capture and release behavior remain intact.
- Map terrain JSX is memoized independently of player coordinates; collapsed minimaps skip coordinate rerenders and catch up when expanded. Boundary line remains without the Flight limit legend.
- Flight and moped audio each reuse two oscillators with 10 Hz pitch/gain updates. Mode changes, inactivity, mute, visibility and disposal stop the voices. Engine reuse and shared music continuity tests pass.
- Collected-ball tips stay visible for 20 seconds while mounted, then slide up and fade over 400 ms. Close uses the same exit; reduced motion fades only.
- Mobile browser checks pass for joystick, collapsed map, pickup landing/driving/reverse/boost/dismount, return to roads, one building prompt, and timed tips. Device temperature impact remains unmeasured.

### Production deployment — mobile UI/audio optimizations
Deployed to https://futbolisland.app as `dpl_2bHG3PrW34DNtU666CF3XpG44Jw2` (`futbol-island-muh7rd42n-khoa0aohk.vercel.app`). Local and Vercel builds pass. Production mobile checks passed joystick contact/release, collapsed map updates, 20-second ball tip with upward fade animation, seated truck landing/collection/driving/reverse/boost/hop-off/return to roaming, and single nearby building entry. Includes all local truck, sway, map label, audio and UI optimizations described above. Physical iPhone heat improvement is not yet measured.

### September 14 — matched historical flight comparison (local)
See `docs/flight-performance-2026-09-14.md`. Authenticated September 13 release and current production both use 30 FPS and DPR2. Main color-pass calls increased 13–16% at three matched flight views. Added mobile opaque static shadow batching by spatial chunk/face side: total color+shadow calls reduced 28–48% against current unoptimized rendering; screenshot pixels identical at all three views. Triangle work rises 2–6%, with extra static geometry memory; physical device heat remains unverified. Original full-resolution dynamic shadows retained; no framebuffer-copy cache on mobile. Build/type checks and lifecycle/parity tests pass. Not deployed.

### Goal celebration glow refinement (local)
The yellow/team-color light surrounding the pink GOAL score now has an elliptical alpha fade across its outer 45%, including lightning tips, rather than clipping at the billboard texture edges. Reuses the existing 640×320 texture, painted only on goals. Browser texture check: outermost alpha at most 1/255, inner light retained; type check passes. Not deployed.

### Conversation and ball feedback refinements (local)
- Island-character drawer now uses chronological character/user chat bubbles and suggested replies, replacing mixed expanded sections. Earlier exchanges stay visible, long answers briefly show a bounded thinking indicator, entrances are staggered, and the body scrolls smoothly without moving the fixed header. Reduced motion skips entrance/typing animation; pending timers cancel on close or character changes. Mobile browser check passed thinking, topic/follow-up history, fixed dimensions, close and reset.
- Hit parcels now emit spinning box fragments; collection shows a large rising football and an expanding soft ring. Pools cap fragments at36 and celebrations at3; no real-time light/shadow or per-event geometry creation. Effects fully hide when done. Tests cover rapid triggers, idle cleanup, reduced motion, and existing parcel collisions. Browser verified actual reveal and collection.
- Main character football is35% larger than the previous .75 scale (now1.0125); existing .2m ground center accommodates its .192m radius. Physics and shot/juggle rules remain unchanged.
- Goal glow perimeter fades to transparent. These changes and the historical-comparison shadow optimization remain local, not deployed.
