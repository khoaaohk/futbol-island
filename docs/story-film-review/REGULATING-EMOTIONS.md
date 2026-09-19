# Regulating emotions / Two games

The opening story on 7v7 teaches noticing feelings, taking a breath, and choosing a useful next football action. Its supplied narration is preserved verbatim in `public/stories/films/regulate/script.json`; phrase boundaries only split long captions. Timing comes from generated speech rather than squeezing speech into old scene lengths.

## Artwork and source limits

The two user-supplied ZIP files (`astra_two_games_story_pack.zip`, `two_games_isolated_source_pack.zip`) were inspected. Both README files explicitly describe flattened board crops, not transparent isolated assets. Many character cells are only approximately 100×150px and include backgrounds and filenames. They are visual references; they are **not** claimed as imported animation-ready cutouts. The film recreates the board's green number-10 player, blue teammate, city/field, bold palette, printed grain and emotion shapes with original Canvas geometry. This retains sharp edges across composed exports. It is a simplified illustrative adaptation, not a pixel-identical rendering of the source character.

The latest direction removes all faces and full player bodies. The opening pairs a ball with a thought tangle, then introduces a close-up boot kick on “plays.” One ball travels through an overhead pass, a brief boot interception, a rippling goal net and a large goalkeeper glove, matched to locally transcribed word timings: plays1.56s, passes6.511s, tackles7.151s, goals7.611s, saves8.091s. The glove remains clearly visible after the word before the next artwork emerges.

Thirteen middle beats use abstract artwork: thought tangles, noticing, breathing rings, branching choice, converging focus fragments, courage mountains/light, connected support shapes and a many-colored emotion flower. The remaining football beats use ball/boot/net close-ups instead of generic players. The first scene boundary travels into a growing football; subsequent artwork zooms and dissolves through shared central forms, with the noticing tangle relaxing into circles before breathing. Background colors evolve with the opening ball actions. Responsive callouts are independent HTML, not baked movie text.

## Voice and music

Current narration is the user-supplied ElevenLabs Samantha recording dated2026-09-18 03:40:41. Local word transcription was compared with the complete approved script before import; normalized spoken words match exactly. The MP3 is copied unchanged to `public/stories/films/regulate/narration.mp3`; no regeneration, speed adjustment, shortening or rewriting. Duration66.638313s. Caption starts, football actions and the anger change follow that recording. Current word anchors: plays1.74s, passes7.54s, tackles8.22s, goals9.04s, saves9.54s, anger18.28s. The earlier03:19:24 file contained a different Mental Toughness script and was not installed.

Ascension is the separate music bed, mixed offline and credited by the parent implementation. Runtime plays one muxed soundtrack; it does not synthesize speech or mix tracks in the browser.

## Rebuild

1. Run `python3 scripts/import-regulate-recording.py recording.mp3 alignment.json` with the approved recording and its local word alignment. The importer refuses a spoken-word mismatch and updates captions/action timing.
2. Run `node scripts/render-regulate-film.mjs` with the local dev server on8092. Formats render sequentially. Optional `REGULATE_FORMAT` selects one format. `--preserve-audio` copies each existing mixed AAC for an artwork-only revision.
3. Reapply `scripts/mix-story-music.mjs` after a normal dry-narration export, and update the runtime cache version.

`build-regulate-narration.py` and the local Kokoro generator belong to the superseded placeholder-voice workflow; they are not the source for the current Samantha recording.

Runtime is one native 720p H264/AAC video, 24 unique frames/sec, CRF22, 2.5Mbps cap. Aspect-specific portrait/square/landscape sources select the nearest viewport ratio. Existing source-switch debounce preserves playback position; world pause holds for the entire dialog. There is no authoring Canvas or per-frame JavaScript in the shipped player. Captions are always present, centered in a constant-height dock. Pause/replay/mute/Done remain accessible. Closing early does not award completion.

## Validation

TypeScript passed. Chrome checks passed at 320×568, 390×844, 768×1024, 1280×800, and 1920×1080: full viewport movie, bounded headlines, stable 144px mobile / 128px desktop caption dock, sound-on autoplay after click, one player, resume across desktop-to-mobile source replacement, early close without completion, successful end/finish, and no authoring-script requests or page errors. Screenshots inspected; final abstract-art revision and British narration regenerated all three formats. This is local implementation, not deployment. Desktop emulation does not establish phone thermal behavior.

### Voice selection pending API access
The user subsequently selected ElevenLabs Samantha (`uIZsnBL0YK1S5j69bAih`) for Regulating emotions. The parent synthesis attempt returned HTTP402 `paid_plan_required`; no Samantha audio was generated or installed. Current playback deliberately retains the existing local British storyteller as a placeholder. Regulating emotions uses a separate Ascension music bed, mixed/credited by the parent. Do not claim Samantha is live until an actual successful audio replacement and timing pass.

Final object-art validation: Chrome checks passed again across all five viewports, including playback/resizing/completion. Opening, kick, pass, interception, goal and glove screenshots inspected at320px and1280px. The ball now enlarges toward the glove's palm, cleanly visible after “saves.” No face or full-body character drawing remains.

### Distinct emotion and motion revision
Frustration uses a compressed jagged path and drifting fragments between colored plates. Fear becomes a deep blue receding archway and small wavering light. Anger changes at its spoken word into orange, pink and yellow expanding starbursts. These have distinct silhouettes, palettes and motion. Feeling shapes orbit, the space opens between forms, support connections progressively link nodes, and the emotion flower turns gently during previously quiet beats. All these changes are baked offline.

The former pending-voice note above is superseded: the corrected user-supplied Samantha file is now the voice source; paid API generation was unnecessary.
