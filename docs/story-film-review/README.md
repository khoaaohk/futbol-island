# Mental toughness film — first story only

Built using https://github.com/alesha-pro/tools/tree/main/skills/hand-drawn-canvas-animation.
All 17 upstream files were downloaded to vendor/hand-drawn-canvas-animation and verified against Git blob hashes at commit ce556d4f325ae6d672b51f526ed9c71730916222. UPSTREAM.json records the manifest; MIT license retained. public/stories/films/core.js is unchanged upstream code.

The template-derived story-film.html and story-film.js contain the brief, twelve-shot beat sheet, original futbol puppets and synchronized score. They use actual upstream paper, surface, wob, crayon, construction, iris, blot and signOff calls. Art was inspected using palette, style, character and contact sheets saved here.

The 30-second narrative follows Luna's miss, disappointment, harsh self-talk, a remembered useful pass, breathing, resetting, recovering, support movement, receiving and teammate encouragement. Captions are accessible DOM text. Only the reset story uses the new continuous film; other stories await feedback.

## Reproduction

Install the skill's isolated offline dependencies:

    npm --prefix vendor/hand-drawn-canvas-animation/scripts install --no-audit --no-fund

Render the review and film with the downloaded script (Chrome and ffmpeg required):

    node vendor/hand-drawn-canvas-animation/scripts/render.mjs public/stories/films/story-review.html --only 0,12,20 --width 720 --out /tmp/story-review
    node vendor/hand-drawn-canvas-animation/scripts/render.mjs public/stories/films/story-film.html --width 720 --out /tmp/story-film

Open story-film.html and use its upstream export score.wav control, then mux:

    ffmpeg -i /tmp/story-film/story-film.mp4 -i score.wav -c:v copy -c:a aac -b:a 96k -movflags +faststart -shortest public/stories/films/mental-toughness.mp4

All 360 drawn frames rendered without errors, doubled to 24fps output. Final video is 720-square H.264/AAC. No images/sprites are inputs to the artwork.

## Runtime

Only the poster loads on open. Video has preload=none and no src until Play. The app never loads core.js, the authoring film JS or its canvas renderer. Native timeupdate drives captions/progress without animation loops. Playback pauses on hidden/offscreen, another player starting and closing. Unmount clears src and releases existing media ownership, which pauses island rendering/music/SFX during playback.

Play/Pause/Continue/Replay replaces Next/Back. Early close does not award completion. Natural ended marks completion, saved on leaving. Desktop/mobile browser checks passed for on-demand loading, playback, pause/replay, early exit and completion. Typecheck passed. This eliminates real-time texture generation; it does not prove iPhone cooling. Not deployed.

## Abstract revision

Replaced portraits, boots and the literal pitch with a stitched disc, tangled lines,
contracting panels, expanding rings, angular obstacles and connecting threads.
Denser stable hatching, grain, halftones and layered paper shapes add texture.
Each shot ends with a camera push into a shape that opens onto the next shot.
All eleven boundaries were verified pixel-for-pixel (last outgoing frame equals
first incoming frame). This follows the user request for continuous transitions
instead of the upstream default hard cuts. The 30-second timing and captions
remain unchanged; no extra runtime work is added. Earlier character sheet is
retained as an archived review, not the current film. Latest contact sheet is current.

## Color and emotion revision
The mental-toughness prototype now lasts 60 seconds (12 five-second beats), allowing time to read the definition, purpose, and practical reset. Full-frame blue, magenta, teal and gold printed surfaces replace pale stock. Luna appears with a larger illustrated face: downturned mouth and worried brows during the mistake, relaxed eyes during breathing, and a smile during reconnection. The abstract shapes remain emotional context. Connected zoom/aperture transitions are retained. The modal shell remains unchanged.

All additional drawing is baked offline into H264 video; the app still loads it only on Play, pauses the island during playback and releases media on close. Longer duration increases media bytes/playback time; this is not a measured phone-temperature improvement. Not deployed.

## September 17 reference-led revision
Reviewed the supplied local images, both initial MP4s, GIF and additional 6.5-second botanical/record animation as frame sequences. Rebuilt artwork as bold flat editorial illustration: expressive almond eyes, patterned kits, saturated organic fields and selective line detail. Added independent leg/arm motion, blinks, breathing, flower growth and rotation. Large concept text introduces each beat. All 12 compositions now differ (goal/miss, pressure arrows, thought knot, memory cards, exhale ribbons, reset wheel, scanning eye, passing angle, controlled touch, teammate connection, reset tools, celebration). Connected zooms alternate with lateral curved reveals. User direction overrides earlier skill rules restricting text and transitions.

Still a single 60-second on-demand movie; no runtime canvas or additional live animation loops. Not deployed.

## Textured cut-paper refinement
Added fixed-seed grain to broad color fields, halftone dots to upper ribbons and teaching shapes, and fine printed hatching to lower ribbons. Kit patterns combine stripes and dots. Faces now use asymmetric two-tone cut-paper shapes, simple expressive eyes and mouths, and geometric hair instead of detailed cartoon eyes, cheeks and hair strands. Preserved distinct scenes, concept lettering, body movement and connected transitions. All textures are rendered offline.

## Futbol mural reference revision
User supplied eight AI-generated reference sheets covering the island pitch, mural patterns, player poses, expressions and brush title cards. Rebuilt the story characters around the pink-skinned, orange-ponytail number 10 and a blue-skinned teammate: elongated necks/limbs, single almond eyes, striped socks, graphic kits and expressive profiles. Added textured pitch stripes, palms, goal-side mural panels, large color arcs, stencil dots, brush flourishes and handwritten concept titles. Added seeded irregular scuffs alongside grain. Scene composition and motion remain distinct and connected. The supplied references guide procedural artwork; their contact sheets are not displayed as slideshow frames.

Only the mental-toughness prototype changed. Rendering remains offline; app playback remains on-demand with island pause. Not deployed.

## Motion and legacy-asset cleanup
Replaced thin wobble/crayon teaching marks with smooth mural brush strokes, and rebuilt the ball from solid black pentagonal panels on textured cream (no old wire seams). Removed the old aperture/curved-mask transitions: adjacent full-frame scenes now pan together with gentle zoom; the incoming scene advances during the transition and its time carries continuously into its own beat.

Arms and legs now use hierarchical two-bone transforms. The sock, ankle and boot are rendered within the lower-leg transform, and forearms/hands within elbow transforms. All endpoints stay joined.

New `scripts/render-story-smooth.mjs` extends the upstream renderer while leaving upstream core/files unchanged. It samples half-frame timestamps for 24 unique drawn frames/sec; the former export doubled 12 frames/sec. Render command: `node scripts/render-story-smooth.mjs public/stories/films/story-film.html --width 720 --out /tmp/fi2-story-fluid`. This increases offline drawing work and potentially video bytes, not app frame rate or live drawing. Not deployed.

Validation correction: earlier exact-boundary comparisons used RGBA difference bounding boxes and were not reliable because the alpha channel was unchanged. RGB validation of the current smooth export confirms 24/24 sampled adjacent frames are distinct. Across all 11 boundaries, mean per-channel pixel differences are 3.45–5.45 out of 255; boundary frames deliberately retain motion, rather than duplicate. Browser checks pass for on-demand load, pause, replay, early close and completion on mobile/desktop.

## Supplied sprite assets, layered scenery and narrative morphs
Luna is now rigged directly from the user-supplied transparent parts sheet, including heads, kit, shorts and jointed limb pieces. Mural sheets supply actual textured backgrounds, horizon bands, clouds and foreground waves. The later field sheet has an opaque checkerboard: only opaque sky, turf and wall/foliage interiors are sampled. No claim that this sheet contains individual transparent PNGs.

Loaded open-source Knewave (OFL license beside font) replaces system Marker Felt. Font and atlases load only in the offline authoring page. Added asynchronous asset readiness before renderer capture. Serve through localhost to avoid file-origin canvas taint: `STORY_URL=http://localhost:8092/stories/films/story-film.html?bare=1&w=720 node scripts/render-story-smooth.mjs public/stories/films/story-film.html --width 720 --out /tmp/fi2-story-narrative-transitions`.

Removed rectangular scene slides. The lesson now enters an expanding colored shape, switches scene while fully covered, and reveals it through a reshaping surface: ball, tear/ripple, untangling lobe, memory card, exhale, spark, eyelid, ribbon, bounce, bloom and sunburst. Incoming motion continues into its beat. Every background has independent far/middle/near motion. Not deployed.

Final atlas/morph validation: 1440 frames rendered without page errors; typecheck passed. RGB mean pixel differences across the eleven frame boundaries were 0.91–2.07/255. These differences retain intended motion and do not by themselves prove perceptual smoothness. Sampled transition frames were visually inspected. The renderer now suppresses the irrelevant favicon request when using the local HTTP authoring page. Main app still uses only baked movie/poster.
