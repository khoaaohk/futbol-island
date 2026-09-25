# Five-voice story narration and quieter bottle surf

User instruction: replace story voices using all five supplied ElevenLabs IDs,
including the futsal introduction, **“Smaller court. Bigger game.”** (`futsl`).
The earlier art bible's instruction to retain recordings is superseded by this
explicit replacement request. Narration scripts and artwork remain unchanged.

## Offline generation

`scripts/export-eleven-narration.cjs` reads the current 22 riso stories directly.
`scripts/build-eleven-narration.py --plan` lists the assignments and character
count without making a network request. The full set is 114 chapter clips and
three full tracks (`futsl`, `grit`, `regulate`): 117 requests / 18,722 input
characters. The model is `eleven_multilingual_v2`, speed .9, stability .6,
similarity .75 and style .1. These describe the original generation. The subsequent pacing adjustment below
uses offline tempo processing of those cached recordings.

All five voices are available for synthesis with the configured key. Voice-name
and subscription lookups return `missing_permissions` (`voices_read` and
`user_read`), so assignments use the supplied IDs rather than invented names or
unverified voice characteristics. The API does permit text-to-speech. No account
upgrade or replacement credential is required for this work.

| Voice ID | Stories |
| --- | --- |
| `uIZsnBL0YK1S5j69bAih` | Regulate, Kite turned, Quiet lantern, Reset, Signal water |
| `NFG5qt843uXKj4pFvR7C` | Grit, Harbour night, Loud track, Windshield |
| `nzFihrBIvB34imQBuxub` | Futsl, Boat weather, Different tides, Room to invent |
| `Nhs7eitvQWFTQBsf0yiT` | Chalk line, Empathy, More shirt, Unfinished map |
| `uKGPYP2uuyRQv8SeFre0` | Woven court, House player, Loss, Pick a purpose, Place picture |

`--generate` writes exact-request caches under `/tmp/futbol-eleven-narration-v1`.
Successful retries reuse them; errors stop generation without automatic paid
retries. `--install` verifies all selected results exist, normalizes loudness
to -18 LUFS / -2 dB true peak, encodes 96 kbps AAC, and installs content-hashed
URLs under `public/stories/eleven`. Original recordings are retained. Installation
also writes a provenance manifest containing script hashes, voice IDs, measured
durations and the API's reported `character-cost` header. That header is not a
currency charge. Subscription balance cannot be read with this restricted key.
`--only futsl` restricts either command to the explicitly requested introduction.

## Timing and runtime

Character timestamps are checked against the exact requested script before the
recording can be installed. For chapter stories, phrase cues anchor new media
time to authored visual time. Chapter duration now follows the processed recording, removing excess silence
from older reflection timings. The final painted passage still
receives .65 seconds. For the three continuous films, caption starts anchor the
mapping, with other visual timings interpolated between those anchors. This is
caption-level alignment for those films, not a claim that every gesture was
independently realigned to every spoken word.

`lib/paths/riso/narration.ts` adapts the existing story: captions, headlines and
segment boundaries follow the new audio, while the drawing receives the original
authored clock. Seeking, pause, reduced motion and chapter endpoints use the same
mapping. No voice API, synthesis model, additional audio element, fetch polling or
animation loop runs in the browser. New clips are requested only when their story
is opened. Removing an entry from `narrationOverrides.json` restores that story's
original recording and timing.

## Bottle sound

The bottle overlay uses three irregular, asymmetric surf swells within a cached
16-second mono buffer. Each has a soft breaking-wave rise and longer retreat.
The 180 Hz high-pass removes the steady low rumble; the foam brightens during the
break. Gain is .22 before the existing master/effects settings, with a 1.8-second
fade-in and existing 1.25-second closing tail. The buffer is built once per sound
context; control envelopes are precomputed at 100 Hz. Muting, zero volume and
hidden pages still stop playback, and reopening reuses the buffer.

## Validation

- `tests/story-narration.cjs`: invertible timing, unchanged text, exact authored
  chapter endpoints, caption/headline mapping and installed asset integrity.
- `tests/bottle-audio.cjs`: three separate crests with quiet gaps, no clipping,
  zero-valued buffer seam, cache reuse and mute/hidden/dispose lifecycle.
- `scripts/review-riso-story.mjs` loads the real narration override adapter;
  seam reviews therefore exercise the replaced story rather than only old audio.
- All 22 adapted stories passed the visual seam review: 117 seams, 1,060
  sampled frames, zero seam pixel differences and zero draw errors. The JSON
  review result is retained beside this document.
- `scripts/check-eleven-narration-browser.cjs` verified the visible **Love
  Futsal** heading and new `/stories/eleven/futsl/` URL: decoded readyState 4,
  advancing playback, 78.7-second duration, and source release after closing.
- The full player sweep passed 44/44 story views; Love Futsal passed the four
  viewport interaction check. Final build results are in the performance notes.

The installed production set is 117 clips, 19,173,579 bytes in total, with a
summed API `character-cost` of 10,304 units. A separate 80-character development
preview was also synthesized. These are API usage units, not dollar charges.

Local implementation only; no deployment and no physical iPhone thermal claim.

Official API references: [timestamped synthesis](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps),
[voice speed](https://help.elevenlabs.io/hc/en-us/articles/13416271012497-Can-I-change-the-pace-of-the-voice),
[subscription permissions/allowance](https://elevenlabs.io/docs/api-reference/user/subscription/get).

Browser validation for the completed narration set: all 22 stories pass at 390×850 and 1440×850 (44 views), checking playback, seeking, pause/sleep and source cleanup. The futsal track also passes 320×568 and 844×390, with touch feedback and transcript controls checked across all four viewports. Visible title corrected to “Love Futsal”; internal story ID remains `futsl`.

Final validation: production build passes (home route 473 kB; first-load JS 561 kB). The prior engine-pass build was 462/550 kB; this working-tree build includes the motion/reference and narration changes. All 22 adapted stories pass the seam review (117 boundaries, 1,060 samples, zero pixel differences/draw errors). Live browser verification confirms the “Love Futsal” heading, replacement media URL, advancing playback and release on close. Default town tests and narration/movement regressions pass. Local only; not deployed.

### September 22 follow-up — narration pace and Paths particles (local)

Slower recordings now receive offline, pitch-preserving FFmpeg `atempo` processing, with one rate per story derived from its source narration timing and capped at 1.20. Already brisk stories keep rate 1.0. New content-hashed files are made directly from cached original MP3s; no further ElevenLabs calls or credits were used. Character/caption anchors are scaled by the same tempo. Chapter duration now follows actual processed media plus the existing .65-second painted transition instead of preserving old silent reflection padding. Example total durations: Love Futsal 78.7 → 72.5 seconds; Kite 90.2 → 75.9; Quiet Lantern 82.2 → 69.3; Mental Toughness 84.8 → 71.3. A Place in the Picture keeps its speech speed but loses excess chapter padding (60.0 → 52.1 seconds). No voice or script changes. This supersedes the prior reflection-padding policy.

The top-left Paths button reuses its two CSS particle layers for a staggered 4.8-second loop, with four dots per layer and .82 peak opacity (increased after user review). Only opacity/transform animate; no JS frame loop, canvas, timer, network asset or new React state. A visibility listener pauses the layers on hidden pages, and CSS pauses them behind any open dialog. Reduced motion disables the effect. The learning purpose is to keep the route to lessons, quizzes and stories discoverable. No physical-phone thermal claim.

Narration mapping and installed media checks pass for all22 stories, including the .65-second chapter-tail constraint. Adapted visual seam review passes all22 stories with zero seam differences or draw errors. Browser/build results follow below.

Processing reference: [FFmpeg atempo filter](https://ffmpeg.org/ffmpeg-filters.html#atempo). The modest correction preserves pitch while changing duration; the runtime audio element still plays at its normal rate.

Pacing/particle final checks: six representative live story views pass (Futsal, Kite, Place in the Picture at 390×850 and 1440×850). Particle browser checks pass continuous movement, modal pause/resume and reduced-motion suppression, including the brighter user-requested treatment. Production build passes at 473 kB home / 561 kB first-load JS. No deployment.
