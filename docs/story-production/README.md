# Path stories

**Current system: the riso canvas films — see [`riso/RISO_BIBLE.md`](riso/RISO_BIBLE.md) (art bible + engine contract), [`riso/ENGINE.md`](riso/ENGINE.md) (builder's guide), [`riso/storyboards/<id>.md`](riso/storyboards) (one per story) and [`riso/reviews/`](riso/reviews) (art-director gates).** Everything else in this folder (`ART_DIRECTION.md`, `FORWARD_PASSAGE.md`, the `*-revision.md`, `*-image-prompts.md`, audit and rebuild ledgers, `phrase-*` and `woven-*` files) documents the earlier visual systems that the user rejected; they are kept as history and are superseded by `riso/`. [`riso/CLEANUP.md`](riso/CLEANUP.md) lists what was removed on September 20, 2026.

All 18 stories (four paths × three concept films, plus Love Futsl, Grit, Regulating emotions, Mental Toughness, After the Final Whistle and Emotional Intelligence) are drawn by `lib/paths/riso/stories/<id>.ts` and played by `components/StoryFilmPlayer.tsx` through `components/UpcomingStory.tsx` / `components/PathStoryModal.tsx`. The registry is `lib/paths/riso/registry.ts` (`RISO_STORY_IDS`).

| Path | Concepts |
| --- | --- |
| Futsal | Creative confidence; trust and shared responsibility; adapting; Love Futsl |
| 7v7 | Belonging; useful self-talk; asking for help; emotional intelligence; regulating emotions |
| 9v9 | Individual progress; rest; feedback; grit |
| 11v11 | Quiet leadership; control and response; identity beyond a position; mental toughness; handling a loss |

## Narration (kept)

Narration audio, captions and cue data are the only parts of the earlier films that survive:

- Chapter stories: `public/stories/narration/<format>/<id>/0N.m4a` + `timing.json` (voice, durations, script hashes). Chapter durations live in `lib/paths/riso/data/narrationTiming.json`. The narration text is authored once, in each `lib/paths/riso/stories/<id>.ts` (`chapters[].narration`), and the story file is the source of truth.
- Track stories: `public/stories/films/{futsl,grit,regulate}/narration.mp3` (+ `narration.wav`, `narration-original.mp3`), with `timeline.json`, `script.json`, `narration-cues.json`, `recording-alignment.json`, `narration-word-timing.json` for caption/cue times. `lib/paths/gritScript.json`, `lib/paths/gritNarrationTiming.json` and `lib/paths/storyVoiceChoices.json` are the grit script, its recording alignment and the voice choices used by `scripts/generate-eleven-story.py`.

Tooling: `node scripts/export-path-narration.cjs` exports the chapter scripts from the riso stories; `node scripts/check-path-narration.cjs [--write]` verifies every clip's script hash and duration against them and (with `--write`) republishes `narrationTiming.json`; `scripts/build-path-narration.py` (Kokoro `af_heart`), `scripts/build-regulate-narration.py`, `scripts/generate-eleven-story.py`, `scripts/link-generated-voices.mjs`, `scripts/complete-original-voices.mjs`, `scripts/import-regulate-recording.py` and `scripts/mix-story-music.mjs` (now writes `narration-music.m4a` beside the dry narration) are the audio pipeline. Keep one clip per chapter and regenerate timing metadata when replacing audio.

## Gates

- `node scripts/review-riso-story.mjs [--id <id>] [--out dir]` — contact sheets + seam pixel diffs (0 failures required).
- `node scripts/riso-perf.mjs <id>` — frame time at 390×850.
- `node scripts/check-path-films-browser.mjs` — live sweep of all 18 stories through the riso player at 390×850 and 1440×850 (`--compact-mobile` for 320×568 / 390×667 / 844×390).
- `node scripts/check-riso-films-browser.mjs --title "…" --format … [--track]` — one story at 390×850, 320×568, 844×390 and 1440×850 with the touch-visibility gate.
- `node tests/path-stories.cjs` — every path story id is registered and built as a riso story; production locks; no progress writes.
