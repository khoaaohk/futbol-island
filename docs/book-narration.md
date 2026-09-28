# Messi book narration

Local assets and hook; no deployment by this pass.

The reader uses the existing StoryPlaybackBar with a compact sentence caption and the full text behind Read. Six original scripts are generated directly from each finalized page title, story and coaching lesson in `lib/books/messi.ts`.

`scripts/build-book-narration.cjs` exports the finalized prose to `scripts/build-book-narration.py`, using the existing play-film Kokoro pipeline: **Coach Bella (`af_bella`), speed 1.0**, cached Kokoro-82M model, original pronunciation lexicon and Homebrew espeak-ng. No fallback voice is allowed. Set `KOKORO_PYTHON` to the existing Kokoro virtualenv interpreter when regenerating elsewhere. Generation stays offline; no neural runtime is shipped to phones. ffmpeg normalizes to -18 LUFS and encodes 64 kbps mono AAC. Individual synthesized sentences are measured before concatenation, producing exact caption boundaries in `public/voice/books/messi/narration.json`. Tracks last 39.5–46.8 seconds. Script hashes detect stale prose, and the Coach Bella URL version replaces cached older audio.

`useBookNarration(page.id)` allocates one HTMLAudioElement only after Play. Mount and page turn do not fetch tracks. Native timeupdate/metadata events update the existing playback UI; no RAF or polling. Read pauses, turning releases the prior source, hiding pauses without automatic resume, and unmount removes listeners, pauses and clears the source. Mute is local to narration and starts from the existing sound preference. Existing island narration registration provides single-voice ownership; the book holds world playback and mutes its finite theme while narration is playing.

`tests/book-narration.cjs` passes script hashes, asset/cue coverage, no load on mount/turn, event clock, Read/hidden/turn/close shutdown and mute.

`scripts/check-book-narration-browser.cjs` passes at 390×844 in touch Chromium against the existing :8092 server. Ordinary Play, Mute, Read, Continue, Next and Close inputs verified real AAC time advancement, captions, no voice fetch before Play, no next-page prefetch, Read pausing, and source release on turn/close. The world frame counter and paper render counter stayed fixed during narration; the existing island music reported paused. There were no page errors. Screenshot: `/tmp/book-narration-phone.png`. Repeated byte-range requests for the same playing track are normal media loading, and the check counts unique sources.

TypeScript and the deterministic suite passed; root also reported the integrated npm suite passing. This is browser/emulated-device validation, not physical phone speaker or temperature measurement.

`readClock()` exposes native media time, duration, playing state and sentence cue index/count through a stable callback for the scene timeline. It creates no animation loop. Pause, hidden state, seeking and ending are reflected directly.

Coach Bella correction verified: all six final tracks regenerated with `kokoro_af_bella`, speed 1.0; deterministic tests and TypeScript passed, then the actual phone browser audio lifecycle check passed against the new cache-busted AAC. The clock tests also verify stable callback identity, paused seeking and final-time hold at voice end. The earlier static-paper sleep assertion describes the reader before the separately requested multi-beat scene integration; that scene needs its own active-play/pause check after integration.

**Scene choreography (Sep 27, local):** `PlayerBookScene` reads `readClock()` every frame while Coach Bella is playing, capped at 30 fps. It samples each spread's pure `pose(t)`, so beats follow the sentence cues in `narration.json`. When paused, a seek or `timeupdate` renders exactly one frame at the new time. Reduced motion snaps each beat to the end of its sentence and renders only when the time changes, with no loop. The manual action tab tweens for 0.9 s and still works without narration. The updated browser check asserts that paper frames advance during narration and stop while paused.
