# Futbol Island project principle

Everything we add or change should have the intention of teaching the game of football.

Give each feature a clear learning purpose, including gameplay, quizzes, exploration, NPC conversations, costumes, equipment, rewards and effects. Learning can cover skills, tactics, positions, rules, teamwork, club history and football culture. Make the connection understandable to the player; entertainment should support that purpose.

For animal costumes, explain the associated club, its mascot and the verified story behind the connection. Clearly distinguish real club history, a club's fictional mascot backstory, and any original game fiction. Preserve the player's underlying character when equipping a costume.

## Story animation continuity

For story work, follow the [riso art bible and engine contract](docs/story-production/riso/RISO_BIBLE.md) and the [builder's guide](docs/story-production/riso/ENGINE.md). Every path story is a riso canvas film in `lib/paths/riso/stories/<id>.ts` (one agent per file; the engine in `lib/paths/riso/` and `components/StoryFilmPlayer.tsx` belong to the engine agent) played by the one player; the earlier film systems were removed (`docs/story-production/riso/CLEANUP.md`). Seams are forward passages through painted material (never zoom in and bounce back out), every cue has a visible consequence, and each story keeps its own compositions. Preserve the sleeping playback loop, the kept `StoryPlaybackBar` and the narration audio/cue data. Gates: `scripts/review-riso-story.mjs` (0 seam diffs), `scripts/check-path-films-browser.mjs` (all 18 stories live), `scripts/check-riso-films-browser.mjs` (one story, four viewports).

## Performance continuity

Before changing rendering, movement, traffic, effects, audio, mobile controls, maps or previews, read [the performance reference](docs/performance-guide.md). Preserve its implemented optimizations and interaction guarantees, and check the current code before proposing work already completed. Consult [the dated measurements](docs/flight-performance-2026-09-14.md) for evidence and rejected experiments.

After performance changes, update these notes with the implementation, relevant validation, tradeoffs and verified deployment status. Distinguish reduced work from measured iPhone cooling; do not claim a thermal fix from desktop emulation alone. Keep football teaching, visual quality and responsive controls central to the change.

## Mobile heat is a primary requirement

For every feature and change, keeping phone heat down is a primary concern. Prefer on-demand loading, bounded work, shared assets, cached requests and sleeping off-screen or inactive content. Avoid background polling, autoplay, unnecessary animation loops and simultaneous video players. Preserve visual quality and responsive controls; document added runtime costs and validate relevant performance behavior. Do not claim reduced iPhone temperature without real-device evidence.
