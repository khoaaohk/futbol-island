# Continuous visual journeys — work in progress

The user rejected the phrase-based montage because scenes still felt disconnected. The next renderer keeps one recognizable world per film, with the same objects persisting across spoken phrases and chapters. Word timestamps drive actions within that world; they no longer select unrelated compositions. There are no full-body characters.

The shared engine now supports a continuous callback receiving chapter, local seconds, chapter duration, narration cue, cue progress, whole-film time and reduced-motion state. A handled continuous film receives only a fixed responsive placement and cached grain from the engine. It bypasses all generic transitions, masks, dissolves and camera resets. Its illustrator owns continuous camera and object tracks.

Current integrated prototypes:

- Woven Court: the same fabric and football throughout. Camera follows the strand into its junction; load, withdrawal, shared tension and reconnection are physical changes within that fabric.
- Pocket Radio: one physical radio, its cable/signal and one receiving space remain present. Camera follows noise through tuning into the football cue and returns.
- Reset: one branch, its root system, the football and a supporting branch. Camera begins at the boot/ball, follows pressure upward, enters a close-up of the constricted line, then moves toward roots, a next action and support.
- Boat and Weather: the same sailboat, wind, waves and foreground football. Camera moves between the unpredictable ball, full boat, sail deformation and a wider shared sea.
- Quiet Lantern: one lantern path with initially unlit neighboring lamps. Camera enters the first lamp, follows what its light reveals and moves along the lit path as others contribute.
- More Than a Shirt: one shirt whose boundary expands around interests already present in the composition. Cropped details and wider views keep it part of a larger life.
- Loss: the same result sheet on water, its ripples, an intact warm form and a practice route. The result moves aside; later it folds down to a useful detail.
- Empathy: two persistent pigment pools, their overlap and a cropped paintbrush. Pressure changes the forms; noticing and listening open space for another colour and a connection.

These are prototypes for visual review, not accepted final artwork. Other films remain on the interim phrase renderer until their continuous journeys are ready. Scripts, AAC narration, playback controls, autoplay, completion state and route ordering remain unchanged.

## Review evidence

The Woven benchmark video `/tmp/fi-woven-continuous-with-narration.mp4` contains the complete journey with the shipped narration and chapter padding. Its illustrator reviewed dense phone/desktop samples and actual transition neighborhoods.

The six owned-world boundary sheets are `/tmp/continuous-{film-id}-boundaries.png`, where IDs are `reset`, `loss`, `empathy`, `quiet-lantern`, `boat-weather`, and `more-shirt`. Each spoken-anchor neighborhood shows before/at/after frames at ±120 ms. These help expose object jumps; they are not a substitute for watching the whole narrated sequence. Newer recordings and parent review take precedence over older contact sheets.

The continuous path evaluates one bounded world per frame, with the existing cached grain. Player24fps/DPR1.5 and pause/hidden sleeping are unchanged. No extra runtime loop, audio element, DOM nodes or render surfaces are added. Earlier phase-montage timings and pixel tests are not presented as proof of continuity or visual quality. No deployment or physical iPhone thermal claim is made.
