# Grit — roots before fruit

11v11 story. The mental-toughness prototype remains paused. The application uses `GritFilm.tsx`, a native-video full-screen dialog. Captions and playback controls overlay the film; Escape or Close returns to Paths. Only reaching the end permits completion.

The current film is drawn in JavaScript using Canvas paths, jointed character geometry, fixed-seed print texture, and a shared world camera. It does **not** sample the supplied storyboard or parts images. Those remain visual references only. Source: `public/stories/films/grit-film.html` and `grit-film.js`, on the unchanged upstream `core.js`.

## Narration determines the action

The supplied TreeMetaphor MP3 was transcribed locally with faster-whisper base.en, CPU int8 and two threads. No audio was sent to a service. Word timings are retained in `public/stories/films/grit/narration-cues.json`; captions use its phrase starts. The recording speaks through approximately 71.6 seconds, followed by silence through 76.37 seconds. The final football practice takeaway occupies that closing space. The earlier note calling the last phrase unfinished was based on the pasted script; the local transcription resolves it as “that create it.”

| Voice cue | Visual action |
| --- | --- |
| 0–8: two directions, down and up | Root network and canopy extend together, with paired direction cues. |
| 8–13: root system mirrors fruit system | Corresponding points pulse above and below the soil. |
| 15.7–23.5: light and gravity | Sap travels down roots, leaves sway toward the lit sky; camera follows below ground. |
| 23.5–27: before upward growth, the seed | Camera enters the seed's golden surface and resolves onto its first root. |
| 27–37: darkness, resistance, pressure, dirt | Seed splits; tapered roots grow around a boulder, fork into smaller roots, and displace soil. |
| 37.2–43: breaks through, upward, less resistance | Shoot parts the soil, clods lift and settle, stem rises, leaves unfold only after supporting branches arrive. |
| 49–56: work in the dark, nobody sees | Camera returns to the supporting roots, where sap continues through the network. |
| 59–66: light, fruit, visible success | Camera emerges into the canopy; fruit develops and sways on attached stems. |
| 66–71.6: lonely seasons | Close-up fruit becomes the sun, revealing the player returning to quiet football practice. |
| 72–76.37: closing silence | Small-practice takeaway and controlled touch. |

## Reproduction and performance

Render with `scripts/render-story-smooth.mjs` and STORY_URL pointing at the dev server's `grit-film.html?bare=1&w=1080&ar=9:16` or `w=1920&ar=16:9`. Both are 24 unique frames/sec. Mux `grit/narration.mp3` with H264 CRF22, AAC96k, faststart and shortest. No synthesized score is mixed over the voice.

Runtime requests a poster and, on Play, exactly one portrait or landscape video. Canvas, texture generation, transcription and scene simulation run only in authoring/export. Full-HD media increases decoding resolution compared with the earlier 720px version. Background island pause and hidden/offscreen/unmount cleanup remain. Device temperature is unmeasured. Local only, not deployed.

## Framing and control refinement

Final exports retain 1080×1920 / 1920×1080 at 24fps, encoded CRF23/preset fast (about 24 MB each). Rendered art now has varied grounded shrubs, multiple tree silhouettes, varied rooftops, a filled irregular crown and bilateral fruit. Camera moves close into roots at “down,” into canopy at “up,” wholly underground through the dark/heavy passage, then wholly above soil for the light passage. Large mobile callouts wrap with balanced two-line breaks.

Posters are exported from each orientation's frame 0000. That frame leads directly into a 1.4-second push, preserving scene continuity. A picture element handles orientation before playback; only the chosen movie is fetched on Play. The quiz-style bottom region holds play/pause, sound and always-visible captions. It deliberately uses a div, avoiding the application's global mobile dialog-section full-height rule. Mobile/desktop playback and compact-region bounds verified.

## Responsive immersive revision
`grit-film.js` remains procedural JavaScript Canvas, exported offline. Use 9:16/1080, 1:1/1080 and 16:9/1920 render URLs; all three movies contain artwork only, with responsive titles in `GritFilm.tsx`. Never overlay new titles over older exports containing burned-in words. Current media revision: immersive-10.

Narration additions: camera explores roots then canopy for gravitropic/phototropic; light beams, gravity trails, resistance particles, upward energy and success pollen follow those phrases. Wind and sap continue independently of growth. The 49–56 second section zooms into dark soil with a lonely face, then returns to the canopy. Full-screen video uses nearest-aspect source selection; orientation/source changes preserve current time. Captions remain always visible in compact fixed-height controls.

Tear/water follow-up: remove pink arms, animate blue rolling tears, zoom into water, reveal droplets following roots. `scripts/render-grit-tears.mjs` is a partial-render utility that requires existing full frames under `/tmp/fi2-grit-immersive-*`; the full renderer remains the clean-checkout reproduction path. Runtime media is now 720p/24fps with a 2.5Mbps cap (revision immersive-11). Gravity/deeper labels sit above controls; the single roots/fruit title uses the rendered ground coordinate.

Current transition direction: the face no longer morphs into a root. It shrinks downward inside a circular crop, while independently retained tears converge on the central root and dissolve into its droplets. Sky mural ribbons extend above the camera bounds; broad-leaf background tree silhouettes have no oversized leaf decal. Full regeneration: `node scripts/render-grit-tears.mjs --full` (optional `GRIT_FORMAT=portrait|square|landscape`); sequential 720p encodes preserve the reduced playback load.

## Coach Bella voice replacement
Rebuild with `node scripts/build-grit-bella.mjs` (requires the sibling project's existing local Kokoro environment). The script uses `narration-cues.json` text verbatim, trims surrounding whitespace, and keeps phrase starts. Its original word timestamps describe the prior recording, not new word-level alignment. Generated phrase timing is reported at `/tmp/fi2-grit-bella/timing-report.json`. Final caption-only takeaway and 76.37-second duration remain unchanged. Video streams are copied; no visual re-encoding. Runtime cache revision: immersive-18-bella.

Music candidates, verified September 17, 2026; not installed:
- Wildflowers — Scott Buckley: https://www.scottbuckley.com.au/library/wildflowers/ — contemplative piano/strings building to an energetic ending. Recommended gentle option.
- Ascension — Scott Buckley: https://www.scottbuckley.com.au/library/ascension/ — melancholy-to-hopeful orchestra for overcoming adversity. More dramatic alternative.
Both track pages specify CC BY 4.0, free including commercial projects with attribution. Usage details: https://www.scottbuckley.com.au/library/using-this-music/ . If selected, provide title, author, source, license link and edit/mix notice in accessible in-app credits; also in the description of any YouTube upload.

## Current warm storyteller revision (supersedes Bella)
User requested a warm female storyteller, calm and reflective, at approximately 0.9x. `scripts/grit-storyteller-voice.py` creates a 70% Heart / 30% Sarah local Kokoro blend at 0.9 speed. The script text remains identical to each existing narration cue. Pauses and slower delivery are accommodated by offline visual retiming; no words are cut or accelerated to squeeze into the old timeline. `scripts/build-grit-storyteller.mjs` exports the three 720p movies and `lib/paths/gritNarrationTiming.json`; the player maps media time to the original visual time for labels and captions.

Original unretimed videos are cached at `/tmp/fi2-grit-storyteller/original-{format}.mp4`. After a fresh complete artwork render, run the storyteller build with `--refresh-video --use-generated` to refresh these bases (only use that flag with unretimed inputs). Then run `node scripts/mix-story-music.mjs grit` to install the licensed Wildflowers bed. Do not run the superseded Bella script to rebuild current audio. Cache: immersive-20-storyteller-music.

British narrator follow-up: the current shared voice blend is 70% `bf_emma` / 30% `bf_isabella`, using `en-gb` and synthesis speed 0.9. This supersedes the earlier American Heart/Sarah blend. Both scripts remain unchanged; audio timing and corresponding visual/caption timing are rebuilt before final music mixing.

Final British export validation: all three formats are 79.263 seconds, H264/AAC, 24fps; speech remains generated at 0.9 with non-overlapping phrase windows. Browser playback/controls/close/reopen/completion passed after final British voice and music installation. Current cache: immersive-21-british-storyteller.

## User-paced script revision
The user supplied a revised Grit script with explicit ellipses, separate darkness/resistance/pressure/dirt lines, and updated wording. This revision replaces the earlier script-unchanged requirement. Canonical text, spoken segments/pauses and captions now live in `lib/paths/gritScript.json`. British storyteller remains at 0.9; 33 phrase segments have explicit pauses with no speech tempo fitting. New duration about95.34s. Each underground word has its own synced callout. All three videos are retimed from the unretimed originals, with matching DOM timing map. Cacheimmersive-22-paced-script. Music is mixed after narration/video export.

## Current supplied Adam Stone recording (supersedes synthesized voices)
The supplied September18 03:25:28 Adam Stone MP3 is installed byte-for-byte as narration.mp3. Its approved revised script was verified word-for-word offline; phrase onset timestamps drive the original artwork and DOM captions. The narration is not time-stretched. Total film duration is69.10s including the closing takeaway. Cache: immersive-23-adam-recording.

Rebuild using `scripts/import-grit-recording.py <source.mp3> <word-transcript.json>` against the original76.37s artwork cached in `/tmp/fi2-grit-storyteller/original-{format}.mp4`, then `node scripts/mix-story-music.mjs grit`. The checked phrase report is `public/stories/films/grit/recording-alignment.json`. Full-recording Whisper initially produced a zero-duration pressure token; a cropped24–30s transcription resolved its onset to27.82s. Do not rerun synthesized-voice scripts to rebuild current audio.

All three aspect exports have a single H264 video/AAC audio stream at24fps. Browser checks passed after replacement: audible autoplay, paused seeking and four distinct underground word callouts, fixed caption dock, replay/sound placement, Done morph, reopen, and completion. Supplied source hash matches installed dry narration. Wildflowers is mixed from that MP3. Local only.
