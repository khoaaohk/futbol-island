# Phrase-timed prototype (superseded by continuity revision)

The user rejected the disconnected transitions in this prototype. Counts and technical checks below describe that implementation, not visual acceptance. The subsequent continuous-world renderer keeps the same objects and camera state across spoken anchors; see `continuous-visual-revision-2026-09-19.md` for current status.

The fifteen concept explainers now dispatch through `phraseFilmDraw.ts`, not the former six-scene cinematic modules. The approved narration, AAC clips, caption chapters, player controls, autoplay, completion persistence and route ordering are unchanged. Full-body character artwork is absent from the reachable rendering path. There are no canvas interactions or illustration buttons.

## Timing and visual treatment

`phraseFilmScores.ts` contains 298 authored visual moments across the existing 90 audio segments. The three 7v7 films have 82 moments; the other twelve have 18 each. A visual moment is not a still: each illustrator stages camera travel, object action and its visible consequence within the phrase. Timing starts come from offline word timestamp analysis of the shipped Kokoro clips, with their audio hashes recorded in `phrase-alignment.json`. `phrase-score-audit.json` maps each spoken anchor to its actual motif and state. The analysis tooling and neural models are temporary authoring tools outside the app; they are not dependencies or shipped assets.

Word timestamps are alignment estimates, not phoneme-level forced alignment. The initial recognizer omitted part of Chalk Line's pressure/support question and used the US spelling of “pencilled.” These two fuzzy anchor matches remain explicitly visible in the audit. Seven-film refinements exclude recognizer hallucinations beyond the spoken script. No narration was regenerated to fit the art.

The renderer uses large cut-paper shapes, a cached print texture, crops and close-ups. Its transition draws the outgoing artwork larger and reveals the incoming material through a short dissolve; it does not insert the old generic center-circle portal. Camera movements inside the artwork provide the main zooms and pans. At most two illustrations are evaluated during a 420 ms transition.

## Concrete sequences

- Woven Court follows a moving strand into an over/under junction, brings a football's weight onto it, reveals connected strands sharing the sag, then isolates the stretched thread. Supporting material reconnects as the narration returns to shared responsibility.
- Kite Turned starts close to a boot and ball, pulls out to reveal intended space, closes that option with a cropped opposing boot, and shifts toward a new opening. The kite's cloth deforms before its string angle changes.
- Pocket Radio moves from mistake/ball to a physical radio, pushes into speaker noise, turns a dial and releases a smoother signal. A quieter football cue leads into looking, receiving and a short pass.
- Place in the Picture contrasts varied paint forms with identical ones, makes room for their distinct qualities, and connects welcome to a passing invitation rather than a successful result.
- Signal Across Water moves a question across visible water, clears obscuring forms, and follows a reply into a slowly repeated football action. Its supporting hand is a close-up, not a full-body figure.
- Quiet Lantern moves from one small light into the space it illuminates, then pulls back as light reaches other lamps. Cropped eyes, listening forms and support cues carry the football phrases.
- Boat and Weather shows an unpredictable bounce, pulls into wind and sailcloth, visibly deforms the sail, then changes its angle. Pressure opens into a breathing loop before a usable football action.
- More Than a Shirt moves close to the shirt's outline and opens it into books, colour forms and football. The outline becomes one part of a larger composition.
- Reset follows a branch bending under pressure, moves through a constricted scribble into a long exhale, then returns to scanning and one useful action. A wider branch view exposes the roots and regained balance.
- Loss separates the score sheet from an intact warm form, expands the water ripples without flattening them, and shifts reflection into a small practice detail. The final result sheet recedes as the useful lesson continues.
- Empathy moves into overlapping pigments, opens space for a third colour, and carries signals between two listening forms. A constricted orange line releases through the breathing passage.

## Validation

Final results are recorded in `phrase-render-checks.json`. The browser fixture evaluates three phases of every authored moment, all 75 chapter boundaries and all 90 reduced-motion chapters. Chapter endpoints are pixel-identical to the next chapter's opening; reduced-motion frames are stable at the deterministic readback-test size. All sampled pixels are opaque. Separate illustrator reviews cover phone and desktop compositions, including intermediate Woven and Kite motion samples.

The phone and desktop contact sheets are local review artifacts under `/tmp/phrase-{film-id}-{390|1440}.png`. The newer 7v7 sheets use `/tmp/{film-id}-engine-{390|1440}.png`. These are implementation review evidence, not user approval. TypeScript passes. The root task owns the final production build and integrated UI checks.

## Runtime cost and limits

The existing player still owns its sole 24 fps loop, DPR cap of 1.5, hidden/offscreen/pause sleeping and reused audio element. Drawing creates no DOM nodes, timers, image decoders or new render surfaces per frame. Grain remains one cached 384 px plate with a per-context pattern. Geometry is bounded.

Timing uses batches of 30 draw calls so browser clock rounding does not produce misleading zero-duration medians. The JSON records median and p95 per-call command-submission times for 390×844 and 1440×900 at DPR 1.5. These are CPU submission measurements, not GPU completion, energy or physical iPhone temperature measurements. Desktop/emulated checks cannot establish iPhone cooling or native Safari behavior.

This work is local. Nothing was deployed by this visual rebuild.
