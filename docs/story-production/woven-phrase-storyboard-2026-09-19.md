# Woven Court — recognizable phrase illustrations

Status: authored implementation brief for the next local renderer, not visual acceptance. This supersedes the six-panel abstract atlas approach: the user found it unreadable, blurry and too sparse. The learning explanation and narration remain. Each paragraph now needs multiple distinct meaningful illustrations. Applied the storyboard skill's compact shot-plan and continuity workflow.

## Visual contract

Follow the actual Regulating Emotions film's bright flat shapes, print grain, large subjects and fluid changes, while keeping subjects recognizable: a question mark, football, receiving space, speech bubble, offered hand, ear, supporting hands. Abstract is the treatment of these subjects, not permission to erase their meaning. No realistic skin, shoe texture, lighting or anatomy. Canvas-native vector paths keep edges crisp during camera travel; the earlier atlas is a style reference, not an image to magnify across the screen.

A cue starts an action; it does not demand a hard cut or wholly new background. Carry the question's dot into the ball; carry a speech bubble's contour into a palm; turn a sound arc into an ear; travel inside the offered hand toward a second supporting hand. Keep the cause, action and outcome visible long enough to understand. Do not use empty full-screen color as the default connector. The same orange initiating action, pink partner/support, cream ball/useful information, navy ground and cobalt field recur throughout.

On phone, each principal symbol/action must be large and above the caption tray, with both sides of important relationships visible. Symbols enter automatically. No interaction, detached buttons, repeated tiny floating icons or paragraph-long stills. Preserve existing24fps/DPR1.5 and sleeping rules.

## Timing source and caveats

`lib/paths/films/wovenVisualScore.ts` exports36cues across six chapters. Local seconds come from actual word starts in `docs/story-production/phrase-alignment.json`, whose AAC SHA256 values identify the source clips. Durations are8.501,9.291,7.925,10.869,10.208,8.352seconds. These are audio-relative onsets, not equally divided visual slots or whole-film times. Retain measured chapter padding and the existing narration/player clock. Chapter4's9.48s exchange must remain reachable; do not use the old nominal9.5s as a hard cutoff.

The alignment has a duplicate final “job” in chapter5; use the first communicate onset8.44s and do not create an extra illustration for that duplicate. Several words have zero duration in the alignment; their start times are useful anchors, not measures of how long their illustration should last.

The final “Offer” starts3.76s and “listen”4.04s, only280ms apart. Anticipate the offered hand near the end of the preceding speech bubble, keep it on screen while the ear arrives, then move into the same palm at “support.” Never squeeze a complete independent shot into280ms. Likewise, anticipate “recover” before the next protect cue; adjacent actions can overlap while their results persist.

## Chapter1 — share the weight

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`ask-alone` — Do you feel|Large question mark above one waiting ball; its curve leans toward that ball.|Question dot remains the ball.|
|0.96|`fix-everything` — fix everything yourself?|One orange palm tries to hold the ball plus several small task blocks; the load visibly tips.|Retain palm and load while room opens at either side.|
|3.10|`team` — On a team|Two additional pink/cream palms enter beside the original one.|Same task blocks can now move between hands.|
|3.98|`share-load` — responsibility can be shared|The hands divide the existing blocks; the original hand steadies.|Hold the original hand instead of replacing it.|
|6.08|`you-matter` — You still matter|Original orange hand retains one useful ball/task and its place in the group.|A shared baseline leads the eye to the other hands.|
|7.22|`everyone-matters` — So does everyone else|Other hands each retain a meaningful part; equal size and room show shared importance.|Their supporting lines extend into woven strands.|

## Chapter2 — connection carries pressure

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`woven-threads` — Think of woven threads|Three broad colored strands cross beneath the same ball.|Follow one strand into its crossing.|
|1.84|`strength` — Their strength comes from|Ball loads the crossing; multiple strands flex together.|Keep load and join visible in the same frame.|
|3.02|`connection` — places they connect|Close crossing visibly alternates over/under, joining the previously independent strips.|Follow the flex outward from that joint.|
|5.18|`spread-load` — Support spreads the load|Several strands share the deformation; ball steadies at the join.|Pull back enough to show supported and isolated portions.|
|7.08|`single-strand` — one strand|One unsupported strand holds too much load while surrounding support remains visible as comparison.|Camera follows its stretched section.|
|7.76|`tight-strand` — stretched tight|Thin strained section visibly pulls tight; supported crossing remains broad and stable.|Strand becomes a clean pass line on the same ground.|

## Chapter3 — make help visible

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`futsal-trust` — In futsal, trust grows|Two simple player markers/recognizable cropped boots share one ball and court arc.|Use the existing strand as a connection between them.|
|1.72|`clear-action` — clear actions|One clear receiving pocket opens beside the partner; the ball and target are both visible.|Hold the target so the action can explain it.|
|3.46|`pass` — After passing|Same ball travels from orange to pink receiver.|Keep the orange origin in view after release.|
|4.32|`move-into-view` — move into view|Orange marker moves out from behind pressure into the receiver's open sightline.|Movement draws an angled return lane.|
|6.24|`support-angle` — an angle|New passing lane forms a clear triangle with ball/partner/support; no abstract arrow without endpoints.|Follow the lane toward the orange supporter.|
|7.20|`call` — call|Speech bubble/sound arcs originate from the supporter; partner responds by orienting toward the option.|Speech arc becomes a scanning/attention curve.|

## Chapter4 — notice and exchange jobs

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`shared-jobs` — Shared responsibility|Two partner markers remain with the ball; forward and supporting spaces are visible.|Retain both people/markers and their positions.|
|1.50|`notice` — noticing what the moment needs|Large simple eye/scan arc reveals the open forward space and pressure behind.|Scan settles on the forward option.|
|4.24|`forward` — One player moves forward|Orange marker advances; ball/partner remain as fixed reference points.|Show the vacated position.|
|6.08|`support-behind` — Another offers support behind|Pink marker moves behind the carrier into a visible return lane.|The two routes coexist.|
|8.64|`change-jobs` — Your jobs can change|Ball transfers; route curves begin bending while both markers keep their identities.|Same two markers prepare to exchange their roles.|
|9.48|`exchange` — change with the play|Pink now moves forward while orange supports behind; hold both completed positions.|A pressure marker enters the existing ball lane.|

## Chapter5 — recover together

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`lost-ball` — When possession is lost|Same ball leaves the team pair's control; opponent/pressure marker gains it.|Keep both teammates visible as the consequence begins.|
|1.70|`blame-distance` — blame adds distance|Pointing fingers/jagged speech pull away from each other; the useful gap near goal widens.|Retain that gap for the contrasting helpful response.|
|3.46|`together` — A helpful response brings you together|Hands open; partners turn toward the same goal-side space rather than each other.|Goal-side space becomes their common destination.|
|5.98|`recover` — recover|Both markers move back on short purposeful paths.|Their destination remains visible as movement continues.|
|6.64|`protect-goal` — protect space near goal|Simple recognizable goal and two markers show the passing/shooting gap narrowing.|A speech bubble grows from the marker who sees the next threat.|
|8.44|`communicate` — communicate the next job|Bubble contains one useful directional cue; partner moves to cover that space.|Bubble's contour turns into the next question mark.|

## Chapter6 — ask, offer, listen, support

| At | ID / spoken phrase | Recognizable illustration and visible result | Connection onward |
|---|---|---|---|
|0.00|`ask-yourself` — Ask yourself|One large unmistakable question mark; hold briefly enough to read without words.|Curve expands into a speech bubble while dot remains a ball.|
|1.28|`helpful-response` — what can I do to help someone else play?|Speech bubble receives a visible answer: ball offered toward a partner/open palm, showing helpful action.|Bubble tail extends toward the forming orange hand.|
|3.76|`offer-hand` — Offer|Large open palm offers the ball toward another person; start anticipation during the preceding bubble.|Keep palm/ball as ear enters; do not flash a280ms isolated frame.|
|4.04|`listen-ear` — listen|Recognizable ear and incoming sound arc; arc arrives before the offered hand acts further.|Ear's curved line leads the eye back toward the same palm.|
|4.98|`support-hands` — support|Camera travels into that hand; a second hand joins under the ball and visibly steadies it.|Pull back along both wrists without discarding either hand.|
|5.66|`rely-together` — Trust grows when you can rely on each other|Two hands support the same ball together; reciprocal exchange/return shows that either can rely on the other. Deepen this action on “rely” at6.94s.|End on the readable shared action, with stable final hold.|

## Review gate

Timing checks can establish ordered onsets, matching source audio and reachable cues. They cannot establish readable illustration or good motion. Review every paragraph with sound, then mute it and ask what action the picture explains. Check the actual phone view above the tray, especially the fast offer/listen sequence and chapter4's late exchange. Full narrated playback, reduced-motion readability and pause/close sleep remain integrating-renderer responsibilities. No deployment or physical-device heat claim is made here.

Timing validation completed locally: all six AAC SHA256 hashes match the alignment source; all36cue IDs are unique; each chapter begins at0; every cue time is strictly ordered, falls within its measured audio duration and matches the start of its exact first spoken word. These checks do not certify the renderer or visual acceptance.

## Implemented JavaScript revision

`wovenStoryboard.ts` now renders 36 phrase compositions using 13 recognizable Canvas glyph families: people, football, question mark, speech bubble, open hand, ear, eye, goal, arrows, woven strands, emphasis ring and protective shield. The six-panel bitmap is no longer loaded or enlarged. The existing flat Regulating Emotions palette and print texture remain. Football outlines and face outlines preserve contrast inside the cream speech bubble. Portrait/desktop staging leaves room for title and captions.

Stable object identities interpolate position, rotation, size and relevant pose values between phrases, taking up to 420ms and shortening for adjacent words. Hands, ball and teammates persist between appropriate compositions. The final sequence is question mark → helping conversation → offered hand/ball → listening ear with retained hand → two supporting hands → shared play. This implements connected object movement and overlapping arrivals; the storyboard's suggested contour-to-contour morphs and camera trip inside a palm are not claimed as implemented.

The player opts Woven into `syncVisualsToNarration`, drawing against the existing audio element's currentTime when available. Captions, source clips and measured chapter durations are retained; failed narration uses the existing elapsed-time fallback. Other films retain their existing clocks. No additional audio source or polling.

Retained 24fps and DPR1.5 cap, pause/hidden/offscreen/close cleanup, and one stable representative composition per paragraph for reduced motion. Cue debug attributes only change at phrase boundaries. Static layouts replace the approximately6MiB decoded atlas; bounded vector path work replaces bitmap draws, so lower physical-device heat is not inferred.

Local validation: production build and type checking pass. Existing Woven playback checks pass at390/1440px, including chapter controls, pause/canvas sleep, transcript focus, and audio-source cleanup. Independent real Canvas checks cover all36cue IDs, reduced-motion stability, every phrase/chapter boundary, and zero artwork requests. Screenshots from each chapter and all six final-paragraph states were inspected at390/1440px. See `scripts/check-woven-phrase-browser.mjs` and `/tmp/woven-phrase-*.png`. Local only, not deployed; user visual approval and physical-phone heat are not established.

## Superseding revision: cropped forms and camera travel

The preceding full-body person drawings and ordinary translation-based transitions were rejected. Current Woven contains no person glyph, faces, jerseys or full-body figures. It uses cropped boot and glove geometry from the actual Regulating Emotions source, plus speech bubbles, question mark, ear/eye, ball, goal and woven connections. Its backdrop uses the reference's broad asymmetric ribbon construction and holds exact bright palette colors between changes.

Major cue entries define a concrete source interior: the ball's dark central patch/question dot, glove's blue palm, speech-bubble paper, woven strand or eye. The camera accelerates toward that point and enlarges the vector contour until its ink covers the frame; the following composition then emerges from that same color and pulls back. Short adjacent phrases retain their shared contact choreography so offer/listen does not force two dives into280ms. No generic full-screen wipe, extra canvas or raster image enlargement. Canvas `data-camera-phase` records hold/dive/emerge only when it changes.

Woven's timeline now follows audio.currentTime during actual narration and advances through existing chapter padding after audio ends. This lets the final dive actually finish before the next chapter; merely freezing on the last audio timestamp skipped that transition. Narration text, sources and word onsets remain unchanged. Reduced motion uses one still composition per chapter.

Current validation records below supersede earlier translation-only camera claims. Prior source assets and notes remain preserved. Local only; no deployment or user visual-approval claim.

## Superseding direction: use the reference's actual construction

The user found the camera revision too fast, jumpy and childish. They explicitly requested pulling in how Regulating Emotions was drawn and animated, then modifying it for this narration. The36 word onsets remain narration metadata, not a requirement to replace the image36 times. Multiple spoken ideas should change one sustained composition through visible cause and effect.

The source is `public/stories/films/regulate-film.js`:

| Reference construction | Woven teaching adaptation |
| --- | --- |
| `emotionPicture('frustration')`: broad opposing pressure walls and bent line | Carrying responsibility alone versus support releasing that pressure |
| `abstract`, index7: tangled curves relax | Connected strands distribute a load |
| `abstract`, index8: large petal halves open space | Move into view and make a receiving option visible |
| `abstract`, index15: curves connect large points | Forward and supporting roles stay connected as they exchange |
| `abstract`, index13: separated lobes approach | Respond together after losing possession |
| Cropped `glove` geometry and large simple symbols | Ask, offer, listen and support without full-body figures |
| `draw`: modest1.22 scale-and-dissolve transition | Flow between ideas without the previous extreme material dives |

This source mapping replaces the earlier independent icon-layout approach. Reference-inspired visual quality must still be judged from the moving sequence, not inferred from cue-count or continuity tests.

Implemented: six sustained Canvas compositions replace the36-layout montage. The original reference ribbon, football, glove, petal/lens and loop constructions are adapted in `wovenStoryboard.ts`; pressure, joining, opening, exchanging positions and reconnecting follow narration phases. Reference abstract palette ordering and dark backing shapes retain foreground contrast. The question opens into a held response bubble, followed by an offered ball, listening lines and two cream supporting gloves. Background drift is frozen. The camera uses the reference's small gradual push and up-to-one-second zoom/dissolve instead of extreme material dives. Narration files, durations and word metadata are retained.

Final renderer validation: production build passes; all36 cue labels track their stored onsets; six reduced-motion compositions stay pixel-identical throughout their chapters; no phrase/chapter discontinuity exceeds the existing boundary threshold; standalone renderer makes zero artwork requests. Phone390 and desktop1440 captures were reviewed, including the corrected response bubble and supporting hands. This is local work, not a deployment or a claim of user visual approval.

The existing actual-app playback audit also passes390/1440: six chapters, narration, paused canvas sleep, transcript focus and close/source cleanup. Its first concurrent-load run missed the fixed450ms desktop transcript animation deadline; the unchanged audit passed on rerun after build/capture work ended. No playback code or test thresholds were changed for this revision.
