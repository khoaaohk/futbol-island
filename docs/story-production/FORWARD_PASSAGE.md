> **Superseded by [`riso/`](riso/RISO_BIBLE.md) (September 20, 2026).** The visual system this page describes was removed; only its narration audio and cue data survive. Kept as history.

# Approved story-transition pattern: forward through the artwork

Approved by the user after the Woven Court iteration, September 19, 2026. This is the default for new story films and major scene handoffs. A transition-only rollout was subsequently rejected: each story also needs its own narration-led compositions and meaningful actions. See [the individual rebuild review](story-rebuild-audit-2026-09-20.md). The motion must feel like passing all the way through a material into the next view. Zooming in and then shrinking the new view back out was explicitly rejected.

## Authoring recipe

1. Pick a meaningful **existing painted surface** in the outgoing illustration: a football panel, pigment, paper, sail, hull, radio speaker or lantern glass. The next view should develop the narration or expose a different construction/scale. Do not add an unrelated portal prop.
2. Define a convex aperture safely inside that surface. Account for the object's actual position, rotation and scale. Keep it visible near the end of the source scene; do not chase an object that has already left the frame.
3. Place `passageMaterial(ctx, points)` after the authored camera transform and before foreground drawing. The hook is a no-op during ordinary playback. `lib/paths/films/forwardPassage.ts` supplies the shared Canvas mechanism; `phraseFilmDraw.ts` coordinates source and destination.
4. Accelerate toward the material over 0.60 seconds. The outgoing art and its aperture continue growing until the aperture passes all viewport corners. Compute coverage from the polygon's **inscribed radius**, not its outer radius.
5. Reveal the next composition **inside that growing aperture**. Its scale increases 0.68→0.88 during the approach, then0.88→1 over the next 0.72 seconds. Both sides move forward. Never start the destination oversized and reduce its scale.
6. Move the material's screen center directly toward the viewing center. Do not multiply its remaining offset by the zoom: that flings off-center apertures away and hides the destination until the exact seam.
7. At the chapter seam, the aperture completely covers the screen and the destination exactly matches its next-chapter initial pose and 0.88 scale. Preserve narration, chapter lengths and word alignment. The source may reveal a preview, but it must not start a second audio element.
8. Use passages selectively at meaningful changes. The current Canvas stories use the first and fourth chapter departures; other movement can remain a quiet continuation. Reduced motion uses a stable representative illustration and skips camera travel.

## Visual contract

Use Regulating Emotions' large, clear, textured shapes. Motion should explain the spoken idea. Prefer recognizable cropped objects and abstract relationships over full-body figures. Keep each object's color and role consistent, and separate foreground ink from matching background colors. Tactical lines and angles are straight, with the connection drawing outward when introduced. Physical material deformation can remain curved.

Speech bubbles are filled shapes. The user preferred the original cream gloves with blue palms/yellow cuffs over the abstract paper-palm experiment. Woven strands must be continuous: never repaint crossings with partial alpha over a translucent base, because that creates rectangular patches. Use solid length reveals or composite opacity once for the whole material.

## Runtime and rendered-video use

Canvas films retain the existing 24 fps / DPR 1.5 player, cached print texture, one audio element and pause/hidden/offscreen/close sleep. A passage evaluates at most two bounded scenes on the same canvas and adds one polygon clip. Do not add animation loops, render surfaces, background polling or image decoding for the transition.

The three original films are delivered as videos. Modify their active `public/stories/films/*-film.js` authoring sources, then re-render portrait, square and landscape playback assets. Source edits alone do not update their in-app videos. `scripts/render-forward-story-films.mjs` streams one frame at a time, copies the existing movie's audio, and installs the completed output atomically. Preserve any existing media-to-story retiming: Grit uses `lib/paths/gritNarrationTiming.json`, so sample its source by inverting that mapping for each output media timestamp. Copying its audio without retiming its artwork breaks narration alignment. Update the component's asset version after the outputs are ready. Do not deploy unless deployment is authorized.

## Required review

- Inspect intermediate frames before the seam, not only the endpoints. The destination must already be visible as the material passes the camera; a flat color until the final frame is a defect.
- Check source-end versus destination-start pixel continuity, reduced-motion stability, actual passage coverage, and phone/desktop framing. Run `node scripts/check-forward-passages-browser.mjs` for all Canvas stories.
- Review meaning: object identity, next-view relevance, readable shapes, correct football cause and effect, and no reverse pullback. Passing an endpoint test does not establish visual quality.
- Verify narration, chapter controls, pause sleep, transcript focus and media cleanup with `scripts/check-path-films-browser.mjs`. For rendered films, check the delivered videos as well as authoring frames and preserve audio.

The September 20 rebuild supersedes the original transition-only rollout. New stories require distinct paragraph compositions, not a persistent scenic layout with camera movement. Review every spoken clause with `node scripts/review-story-artwork-browser.mjs` (or `--id <story-id>`), then review actual motion and have another reviewer check meaning, contacts, overlap, contrast and timing. The script attaches narration to the captured frames and checks every chapter seam; it does not decide whether an illustration communicates the idea.

## Large artwork and micro-interactions — September 20 refinement

The user selected Regulating Emotions’ Frustration pressure walls, Anger’s layered star, Fear’s nested arches and Control the Moment’s enormous circle of threads as the scale reference. Build around one dominant, recognizable material construction, with smaller meaningful actions inside it. Do not distribute tiny unrelated symbols across empty space. Keep print texture and sharply defined silhouettes.

Animate anticipation → brisk action → contact → visible response → a connected next action. A football transfer normally takes about0.65–0.8seconds; its receiver then cushions, carries or offers support. Do not fill narration by stretching the pass across several seconds or adding arbitrary flashing. Organic leaves, breathing and cloth can move at a gentler physical pace. A growing branch must emerge from its existing trunk; a leaf follows its stem; an object passed or lifted keeps its identity.

Phone framing is part of the composition. `filmComposition.ts` retains the usual large framing on tall screens, reserves title/caption space on compact portraits, and places artwork beside controls in short landscape. Ambient materials can bleed beyond the frame; important contacts and supporting objects must remain visible. Inspect actual app captures at320×568,390×667,390×850,844×390 and desktop, rather than relying on standalone canvas sheets. Run `scripts/check-path-films-browser.mjs --compact-mobile` for compact playback and layout checks. Physical-device touch/thermal behavior still requires a real phone.
