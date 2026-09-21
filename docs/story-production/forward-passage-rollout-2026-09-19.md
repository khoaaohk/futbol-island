# Forward-passage rollout

**Superseded visually:** the user rejected this transition-only result. See [the September 20 individual rebuild](story-rebuild-audit-2026-09-20.md). The technical results below are historical and are not artwork approval.

The user approved Woven's forward-through transition and requested the same pattern for all other stories, with guidance for future work. The implementation recipe is [FORWARD_PASSAGE.md](FORWARD_PASSAGE.md), now linked from the repository's `AGENTS.md`.

## Canvas stories

`forwardPassage.ts` owns departure framing, safe polygon coverage and forward-only arrival scale. `phraseFilmDraw.ts` applies the mechanism to selected major chapter handoffs while preserving the existing continuous artwork and narration. Each drawing module identifies a convex interior of a material it already paints. Woven retains its approved football-panel implementation, with the same corrected center movement.

| Story | Outgoing material |
| --- | --- |
| The Chalk Line | Boot heel |
| The Woven Court | Football panel |
| The Kite That Turned | Rotating football panel |
| A Place in the Picture | Pigment interiors |
| The Pocket Radio | Speaker, then receiving space |
| The Signal Across the Water | Responding bank, then football shoreline |
| Different Tides | Cove water |
| The Harbour at Night | Rotated hull |
| The Unfinished Map | Paper |
| The Quiet Lantern | Lantern glass |
| The Boat and the Weather | Rotated sail |
| More Than a Shirt | Shirt fabric |
| Mental Toughness | Branch leaf |
| After the Final Whistle | Paper card |
| Emotional Intelligence | Pigment leaf |

The cross-story visual audit caught an off-center framing error that endpoint checks alone missed: multiplying the remaining anchor offset by the growing zoom could push the aperture away until the exact seam. Material centers now move directly toward the viewing center. Thirty chapter seams are pixel-identical; all 28 new apertures show the destination before their seam; all six reduced-motion frames per story remain stable; standalone rendering makes no network requests. Intermediate-frame contact sheets were reviewed. Tiny adjacent-frame antialiasing differences are diagnostic, not confused with endpoint discontinuities.

The actual app passes all 15 stories at 390px and 1440px, plus 320px control checks: chapter controls, narration start/pause, paused canvas sleep, transcript focus, tray fit, close cleanup and no browser errors. The build failure reported during integration was an import of the not-yet-written shared module; adding that module restored compilation and the production build passes.

This rollout changes transitions, not every existing illustration. Persistent-world stories reveal another authored viewpoint/state of their world. Woven's distinct macro and defensive compositions remain.

## Original video stories

Grit, Regulating Emotions and Love Futsal use prerendered movies. Their active authoring JavaScript now uses passages through existing seed/fruit, football, court and eye materials. All 33 selected seam/aspect combinations pass authoring-frame continuity checks, and intermediate frames were independently reviewed for aperture alignment and forward movement.

`render-forward-story-films.mjs` streams one frame at a time through one browser/encoder, writes a temporary output, checks duration and packet-level audio hashes, then atomically replaces the movie. It avoids thousands of cached PNGs. Portrait, square and landscape outputs are checked independently. Grit retains the existing Adam recording: its 69.10-second media clock is mapped back into the 76.375-second authored animation using `gritNarrationTiming.json`, preserving the existing word/action alignment. All nine outputs are installed; compact delivery evidence is preserved in [the validation record](forward-passage-validation-2026-09-19.json). Changes remain local, not deployed.

All original-film audio hashes and container durations are unchanged. Updated component asset versions are `two-games-6-forward-passage`, `love-futsl-8-forward-passage` and `immersive-24-forward-passage`. Combined movie size changed from 122.69 MB to 98.58 MB; this is a delivery-size measurement, not evidence of lower phone temperature.

Independent checks of all nine delivered movies passed: sampled decoded passage frames, correct dimensions, and unchanged audio hashes. Original-video playback also passes at 390px and 1440px, with 320px control checks, mapped captions, autoplay/pause/replay, transcript focus, early Read cancellation, close cleanup and zero page errors. Video muxing holds the final Grit image under the last 60–143ms of preserved audio; the recorded narration is not truncated.

Final integrated `npm run build` passed after all assets and component versions were installed, including compilation, type checks and static page generation.
