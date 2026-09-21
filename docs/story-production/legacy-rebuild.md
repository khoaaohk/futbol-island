# Existing mental-concept films: routing and copy revision

The existing `reset`, `loss` and `empathy` IDs now open the same abstract film player as the twelve new optional films. Old fictional dialogue and the old Mental Toughness video are no longer imported through `PathStoryModal`. Original completion IDs remain intact, so existing saved completion survives.

| ID | Visible title | Path | Words | Scheduled duration |
| --- | --- | --- | ---: | ---: |
| reset | Mental Toughness | 11v11, first stop | 132 | 60 seconds |
| loss | After the Final Whistle | 11v11 | 133 | 60 seconds |
| empathy | Emotional Intelligence | 7v7 | 128 | 60 seconds |

The scripts explain each concept directly, with abstract metaphors and practical football cues. They contain no named protagonists or fictional plot. Source: `lib/paths/films/legacy.ts`. The coordinator has installed the new narration and measured timing; catalog overrides schedule each complete film to 60 seconds. Files use `/stories/narration/<format>/<id>/01.m4a` through `06.m4a`. Catalog lookup keeps the shared narration-timing overrides and versioned audio handling.

Mental Toughness moved from the later “Around the Pressure” lesson to `11v11.openingStory`. The earlier attachment was removed so it appears once. It is directly clickable without tactical completion. Lesson counts, tactical evidence and lesson progression logic are unchanged. The visible title now matches the concept, so the player does not have to recognize the old “One miss” title.

`UpcomingStory` accepts general film metadata and latches the shared player's completion callback. On closing, completed legacy films invoke the existing `onFinish`; incomplete closes invoke `onClose`. The twelve new optional films store validated completion IDs under their separate optional key. They do not count toward tactical lesson gates and remain replayable.

## Validation

- TypeScript passes after all three actual draw exports landed.
- Format-path regression asserts first 11v11 reset, no duplicate reset stop and retained loss stop. Existing 48-core/48-depth coverage and lesson-evidence checks pass.
- Optional-completion tests cover all twelve IDs, malformed and denied storage, deduplication, reload restoration and idempotent replay. Browser checked early close without completion, final completion followed by replay then close, stored completion and clickable state after page reload.
- Current 390px Chrome routing check verifies Mental Toughness is the first, enabled 11v11 stop exactly once with no tactical progress. Reset, loss and empathy each open visible canvas artwork, six chapter controls and active playback with the shared bar, without the old video element or page errors.
- A final browser pass confirmed actual narration playback on all three routes: correct versioned source, readyState at least 2, unpaused media and advancing currentTime. First-clip durations were 8.1 seconds (reset), 9.6 seconds (loss), and 8.2 seconds (empathy).
- The browser fixture was updated for the concurrently added autoplay behavior. Its initial expectation of a “Play story” button was outdated; the finished check accepts already-playing films and verifies Pause.

These checks validate routing, controls and completion, not final narration quality or a physical device's temperature. Final visual review and deployment remain with the coordinator. No deployment was performed in this change.
