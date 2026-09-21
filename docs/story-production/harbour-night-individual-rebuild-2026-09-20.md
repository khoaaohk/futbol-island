# The Harbour at Night — individual artwork rebuild, September20,2026

## Original audit

A small boat, dock lamp, moon and ripples acted as one scenic diorama for all paragraphs. Rest, communicated need and life outside football lacked their own visual treatment.

The rejected transition-only pass did not solve that content problem. This replaces all six authored paragraph compositions in `continuousChalkNine.ts` or `continuousKite.ts`. Actual `wovenStoryboard.ts` and `public/stories/films/regulate-film.js` informed the five-panel football, glove silhouette, broad ribbons, pressure walls, filled speech material and flat printed palette. No full-body players, scenic miniatures, photographic assets, blur, decorative pulsing or curved tactical connections are introduced.

## Scene plan and narration mapping

| Paragraph | Replacement picture and meaning | Meaningful motion |
|---|---|---|
| 1. Room to pause | A large Regulate glove receives and holds the football; an effort-direction mark remains above it. Caring and stopping coexist. | Need for break1.62s brings the ball to rest; effort6.1s. |
| 2. Rest is not weakness | Two giant shelter walls surround a cropped orange hull. Its large cream sail lowers while the complete useful hull remains intact and the water settles. | Shelter0.5s; steadiness3.22s. No shrinking boat or loss of usefulness. |
| 3. Check in | A huge cream sail bears a pink load line. Pressure closes from both sides and the sail sags under the tiredness cue. | Check-in3.72s; tired/overwhelmed6.6s. |
| 4. Say what you need | A filled cream speech shape contains an angular strain line. Asking for a break opens an actual gap between two practice blocks. | Worn-out3.5s; planned break5.26s. The strain reduces as room is made. |
| 5. Life beyond football | A large pink sail settles; cream and blue friendship shapes come together beneath a cropped moon. The football stays present against contrasting cloth. | Friends2.4s; settling/away from football4.62s. |
| 6. Effort and rest | Green and blue activity fields leave a broad navy pause between them. Eye, filled request and supported football carry check-in, conversation and balance. | Check0.4s; talk2.8s; effort/rest6.52s. |

## Through-motion and contrast

Chapter0 enters the held football; chapter3 enters clear material inside the speech shape. Destinations are the large harbour shelter and the distinct bedtime/friends/settling-sail design. The shared wrapper owns forward passages0/3 and quiet crossfades1/2/4; this renderer draws only one authored scene per call.

## Review and limits

First review caught a sagging speech line that read as a smile, and a cream football merging into a cream sail. Replaced the smile with angular strain that relaxes; changed the sail to pink and the adjacent friend to cream for separation.

Rendered24 clause frames for this story at each of390×850 and1440×850, covering opening, the next two phrase onsets plus settling time, and the held ending of every paragraph. Contact sheet: `/tmp/five-rebuild/harbour-night-sheet.png`; individual frames use the same prefix. These are visual review artifacts, not permanent app assets. The sheet was inspected for shape meaning, contrast and connected geometry; final revised captures replace the first pass.

Shared24fps player, cached grain and paused/hidden sleep remain unchanged. No extra renderer, image, timer or audio was added. Illustration meaning remains an artistic judgment; browser captures do not prove physical phone temperature. Changes are local. Root owns integrated playback/build verification.

Contrast recheck: moved any football travel over cream into contrasting existing material, rather than outlining the ball. Chalk feedback uses green ground; Tides comparison and Harbour routine use navy; Kite team-route uses orange; the final Map sheet uses pink. The cream football silhouette remains continuous while moving between its endpoints.

Causal imagery recheck: removed the unneeded football from the harbour-hull and tired-sail pictures. These paragraphs explain a boat pausing and feeling overloaded; a football in those pictures did not clarify either idea. The first scene and the final two retain footballs where the narration explicitly connects caring about the game to rest/routine.

Cross-author review correction: a visible straight blue crease identifies the settling pink material as folded sailcloth.

Technical validation: TypeScript passed. All30 paragraph reduced-motion frames are stable across the paragraph; all10 passage centers sample the expected actual painted material (cream speech surface, blue water, or navy football panel), recorded in `/tmp/five-rebuild/material-and-reduced-check.json`.


## Sustained action refinement, September 20

- The glove prepares, catches, then supports the same ball; the effort path draws as a connected action rather than appearing completed.
- The same boat settles, lowers its sail, then secures a mooring. The close-up sail first takes strain and subsequently sags, preserving the rest metaphor rather than adding activity for its own sake.
- Speech draws into its filled bubble, becomes strained and relaxes as practice blocks make actual room for a break. Bedtime resolves before the friend approaches and the sail folds; the final routine opens room before receiving the ball.

Reviewed complete half-second sequences, not only clause midpoints. Source-frame strips: `/tmp/five-motion-scenes/harbour-night-{0..5}.png`. Matched-size before/after pixel samples are `/tmp/five-rebuild/harbour-night-motion-{before,after}.json`; they flag unchanged spans and do not establish visual quality. Short held endings remain for reading/rest.

All 30 reduced-motion chapter stills remain time-invariant and all ten departure hooks remain inside their actual painted materials. The shared 24 fps sleeping loop, cached grain, narration and at-most-two-scene transition policy are unchanged. Added work is bounded arithmetic and a few existing vector paths; there are no new canvases, timers, media or runtime assets. No physical-phone thermal claim.

Tempo review: ball transfers were subsequently tightened to roughly0.65–0.7 seconds per straight leg (two-leg routes1.3seconds). Anticipation, the receiver’s response, a short settled read and the next useful attempt carry the remaining narration. Slow physical cloth/water settling is retained where it is the narrated idea. The earlier unchanged-pixel count is diagnostic only; it is not a reason to stretch passes or remove intentional reading/rest holds.


## Selective macro composition and mobile review

The shelter now contains a wide cropped hull and larger sail with the same lowering/mooring actions. The strained sail is a dominant close-up, including a longer mast and broad crease. The final effort/rest fields bleed vertically through the frame, while the catch stays in the central safe area.

Actual in-app review passed at320×568,390×667,844×390 and1440×850, with all six chapter views, fitting controls/caption tray, pause sleep and narration cleanup. Inspected actual captures at `/tmp/five-live-harbour-night-<chapter>-<width>.png`, including the compact title/contact/caption relationship. Large ambient materials may bleed offscreen or behind titles; important eyes, receiving contacts and passing alternatives remain visible. This uses the shared `filmComposition` layout rather than a new camera or global zoom. No original-video source edits in this macro pass.
