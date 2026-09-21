# Woven Court: image-led trial

Local implementation, September 19. Only Woven Court adopts this trial; other stories are unchanged.

Source: `storyboards/woven-court-v2.png` (12 compositions), with the actual generated, transparent cut-paper artwork from `storyboards/woven-court-v2-assets.png`. Runtime atlas: `/stories/art/woven-court/assets.png`.

The sequence follows one ball: unsupported ribbon → shared ribbons → connection close-up → woven support → pass and offer → receive and call → forward/support roles → exchange roles → lost possession → recover near goal → woven connection → court overview. Separate sprite positions, rotation, scale and camera framing interpolate across the sequence. Cropped boots represent football actions; no full-body characters. Existing narration and shared playback controls remain.

The player waits for the single on-demand artwork request before starting audio. Failed loads can retry; no background preload or independent animation loop. The existing24fps/DPR1.5 canvas sleeps on pause, completion, hidden view and closure. One decoded1619×971 atlas is retained for reopening (approximately6MB decoded RGBA), plus a192px cached grain tile. No new WebGL work. This is a visual prototype, not evidence of lower device temperature.

Validation: project TypeScript; mobile390px and desktop1440px real-browser autoplay, all six chapters, pause/audio/canvas sleep, transcript animation/focus, and close cleanup. Screenshots under `/tmp/woven-trial-*`. Visual approval and deployment are not implied by passing functionality checks.

Full uninterrupted playback completed in60.31seconds; all six narration clips emitted ended without truncation. Replay and hidden-pause checks passed before the older playback harness failed to reopen Paths for its separate simulated-audio-failure case; that case is not claimed as validated here.
