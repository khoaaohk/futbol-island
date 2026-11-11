# Arcade AAA rebuild: rules for every game builder (coordinator, Nov 10 2026)

Read `AGENTS.md`, then `docs/arcade-aaa/HANDOFF.md` (file ownership, the look/skin seams, baseline budget, how to run a game, tests, traps). Trap 1 there (dev server) is FIXED: all five games load on `next dev` now.

## What the owner asked for (their words, condensed)
- "Treat each game like a AAA game." "Each game should feel polished." "Fable should bring the highest quality in game design to show me the limits for each game."
- "Don't make them the same style. Treat each game like its own entity and distinct style. Only thing in common is the back btn to go back to the arcade."
- "Each game should stay true to its core." Improve "gameplay, graphics, sounds, controls, performance, detailed interactions, motions, and everything."
- "No cookie cutter AI slop design." "These games need to be visually appealing and not basic."
- "Keeping heat down and work for mobile."

## Quality bar
- A full world, not a floor on an empty backdrop: layered scenery behind the play area, real light and shadow, atmosphere.
- Materials that read as what they are (wear, grain, specular character), not flat colours.
- Motion with anticipation, follow-through and reaction; the ball, the camera and the world answer every important event.
- HUD, scoreboard, icons, type, menus, start card and results drawn FOR this game's world. Nothing that could be lifted into another game. No neon-arcade leftovers unless your direction calls for them: replace `createGlassFloor`/neon palette use in your scene with your own.
- Sound identity of its own: its own instrument palette and foley, synthesised in WebAudio like the existing audio modules (no new audio files over the network unless tiny and justified).
- Poster test: a screenshot of any moment in play should be good enough to be the game's poster.
- Banned tells: purple/blue gradients, glassmorphism cards, glow on everything, generic rounded pills, emoji as icons, centred-everything card stacks. Load the `design-taste-frontend` skill (Skill tool) before HUD/menu work and check `references/tells.md`; project rules win over the skill.

## Hard limits
- Heat: stay near your game's baseline in HANDOFF section 4 (draw calls, triangles, textures). Richer looks pay for themselves by merging, instancing, baked/vertex colour, small procedural canvas textures (generated once), shader tricks in existing passes. Keep: `powerPreference:'low-power'`, mobile pixel-ratio cap 1.5, one shadow-casting light, NO postprocessing chain, the 30 fps cap, `needsFrames()` sleeping on menus, pooled particles, reduced-motion paths, full disposal. Record before/after numbers with `scripts/measure-arcade-games.cjs`.
- Rules, scoring, coin costs, leaderboards, daily challenges and what the game teaches stay intact. Gameplay feel (controls, feedback, camera, pacing, juice, onboarding) is yours to improve; score-affecting rule changes are not, list them as proposals.
- The back-to-arcade button (top bar) stays as is. No button text in IslandBrush; UI sans weight 800 for buttons.
- Works upright or landscape exactly as the game does today, at 390x844 phone and desktop. Touch targets at least 44 px.
- Files: edit only your column in HANDOFF section 1 plus anything your brief adds. Coordinator-only files stay untouched; if you need a change there, put the exact request in your report.
- Tests grep source text: keep the dense one-line style, move greps with the code, never delete an expectation. If a test pins the OLD look (a colour, the neon floor), update it to pin the new look and say so.

## Working rules
- Grep + line ranges; lines are very long, use `cut -c` windows. No whole-file reads of big files.
- No git commit/push/stash/branch switch. Never read `.env*`.
- Your own dev server port and `NEXT_DIST_DIR` (given in your brief); never port 8092 or `.next-dev`. Do NOT run `next build` (memory; another builder is running). Kill only by PID or `lsof -ti :<port> | xargs kill`; never `pkill -f node` / `killall node`. Headless Chrome via playwright `chromium.launch({channel:'chrome',args:['--mute-audio']})`. When finished: stop server and browsers, delete your dist dir, remove your line from `tsconfig.json` `include`.
- Budget: about 150 tool rounds. Look at your own screenshots as you go (a few, not one per state) and fix what looks plain.

## Deliverables
1. `docs/arcade-aaa/<game>-direction.md` FIRST (under 60 lines): references, palette (hex), type, materials, lighting, camera language, HUD concept, sound palette, the signature moments. Then build it.
2. The build.
3. Two screenshots of live play in `docs/arcade-aaa/shots/`: `<game>-phone.png` (the game's phone orientation) and `<game>-desktop.png` (1440x900).
4. `npx tsc --noEmit` clean, your game's tests + `tests/arcade-*` passing (run one at a time, list any you changed and why), no console errors in play.
5. Report under 40 lines: what changed, before/after budget numbers, tests, coordinator requests, and an honest ranked list of what still falls short of a top-tier game (the second pass works from that list).
