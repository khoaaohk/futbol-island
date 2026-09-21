# Futsal story production

Three original metaphor stories for futsal players of every age. Source: `lib/paths/films/futsal.ts`. Each includes six short on-screen labels, complete narration, timed beats, and independent Canvas2D choreography.

| Story | Words | Timeline including pauses | Football learning |
| --- | ---: | ---: | --- |
| The Chalk Line | 127 | 57.1 seconds | Scan before receiving, try a controlled sole roll, share an opening, learn from a stopped attempt. |
| The Woven Court | 129 | 57.5 seconds | Pass and move, offer support angles, cover behind, recover together after losing possession. |
| The Kite That Turned | 131 | 57.0 seconds | Read changed pressure, keep possession, use sideways/backward support, move to make a new angle. |

## Visual direction

Chalk strokes bend around a block and branch into useful routes; dots resolve into supporting players. Separate thick threads draw into a woven court and a passing triangle, then shift to cover space. Wind ribbons turn a two-color kite around an obstacle; the string becomes a passing route as the court appears. Each story uses a continuous composition and geometry progression rather than separate slides. Warm contrasting paper-cut shapes rely on the coordinator's shared grain overlay for texture. The court is a metaphor diagram, not a complete player-count formation.

Rendering uses the supplied canvas and clock. Geometry is bounded (maximum 30 chalk flecks, 16 thread paths, five wind ribbons). No DOM, images, video, gradients, timers, external dependencies, or additional animation loops. Coordinates scale to both portrait and landscape; content is centered above the caption area. Reduced motion freezes within-beat progress and wind drift. Coordinator owns pause/offscreen sleep, shared transitions, texture, controls, and audio.

## Temporary narration

Eighteen AAC mono M4A clips are under `public/stories/narration/futsal/{story-id}/01.m4a` through `06.m4a`. Generated locally with macOS Samantha at rate 145, then encoded with existing ffmpeg at 64 kbps. `public/stories/narration/futsal/timing.json` records each audio duration measured with `afinfo`, alongside its allocated beat duration. Every clip fits with at least 0.6 seconds of pause; longer pauses allow visual reading. Source audio URLs are populated. These synthetic voices are temporary and ready for replacement. No external voice service or paid API was used.

The macOS voice initially returned zero-byte audio under the sandbox. An approved `say` invocation outside the sandbox produced valid audio. Conversion used local ffmpeg because sandbox afconvert could not expose the AAC encoder.

## Validation and limits

Standalone TypeScript check passes. 360 draw samples cover all beats at five progress positions, portrait/landscape, and reduced motion on/off; numeric geometry is finite and canvas save/restore state is balanced. All 18 final files have positive measured durations and fit their beat allocations. Full player integration and browser visual review belong to the coordinator. No physical iPhone heat measurements or deployment claim.
