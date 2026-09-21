# Woven: meaning and connected-camera audit

The user approved the improved direction but asked for an audit of unclear actions and selected zooms that enter the artwork and connect scenes. This audit concerns the current JavaScript film, not the older raster or icon-layout experiments.

| Narrated idea | Problem found | Implemented correction |
| --- | --- | --- |
| Shared load | Several crossing segments did not follow the strand's actual curved path. | Overpasses repaint the same curved strand through a local clip, preserving the woven geometry. |
| Support spreads the load | Load relaxed before this phrase; a separate strand and small dot appeared for the counterexample. | The same loaded weave presses down, shares its deformation at the spoken support cue, then loses supporting strands to demonstrate the single-strand counterexample. The opening inherits the preceding fully supported state. |
| After passing, move into view | The original passer stayed still while a new support dot appeared. | The original pink shape passes to the green receiver, moves behind into a visible angle, and calls from that position. Removed a zero-progress curved hook that appeared before the connection began. |
| Forward/supporting jobs change | Up and down lacked a football reference. | An established goal edge shows the attacking direction while the same two shapes exchange positions and possession. |
| Recover and protect near goal | The ball returned automatically while teammates stayed still; the goal appeared around the ball. | A goal is established first. The lost ball stays away; both shapes recover toward their goal and close the space in front of it. |
| Offer, listen, support | Hands surrounded a floating ball, sound lines had no recognizable listener, and a new tangle appeared during support. | One inward-facing glove offers the same ball; a cropped ear receives the cue; a second glove joins beneath the ball. Removed the tangle so support does not introduce stress. |

Phone capture review found another legibility problem: pink and green role shapes merged with identically colored background bands. The passing and recovery scenes now retain two original ribbon paths above the action and a navy field behind those shapes. This preserves their identities while they move; the reference palette and foreground geometry are unchanged.

## Selected camera connections

Two handoffs now enter the existing football: shared weight → woven connections, and exchanged roles → lost possession. Each has a1.6-second eased approach and a1.6-second pullback. The outgoing and incoming footballs share the same panel geometry, rotation and screen-space radius at the chapter seam. The camera follows the actual ball position; no detached transition disc is added. The complete ball fills the viewport briefly at the join, so its recognizability survives the transition. The lost-ball action starts as that second pullback opens enough to show the movement.

The other three handoffs retain the reference's gentle zoom/dissolve. Reduced motion uses stable scenes without camera travel. Narration, word onsets and the player's audio-tail timing are unchanged.

## Validation

The existing Canvas audit passes all36 narration labels, all phrase/chapter boundary checks, six stable reduced-motion frames and zero artwork requests. These checks establish continuity and timing, not semantic or aesthetic approval. Actual in-app visual review is recorded by the integrating task. Local only; no deployment or physical-phone thermal claim.

Actual390/1440 captures confirm the original passer changes position after the pass, the lost ball stays beyond the recovering pair, and the hands cup the same ball. Captures across both zoom approaches and pullbacks show enlarging football geometry. The standalone boundary audit confirms exact matching chapter endpoints within its existing pixel threshold. No full-body actors, runtime raster artwork or extra animation loop were introduced.

The final production build, including the background-contrast correction, passes compilation and type validation. Preview remains local on port8092.

## Subsequent user review

The user identified remaining same-color overlaps, broken-looking thread joins, repeated compositions after zooms, outlined speech bubbles and cartoony gloves. The next refinement exposes a distinct close-up of thick crossing ribbons in chapter2, with the football resolving into a simple cream load; chapter5 uses angular covering panels and the goal instead of repeating chapter4's oval roles. The same object still supplies each camera seam. Speech bubbles are filled, textured cream silhouettes with dark call marks. Hands use grouped, curved paper planes, a thumb and one crease, with clipped print texture instead of separate fingers, palm badges and cuffs. These changes retain the audited football actions.

Implemented and reviewed at390/1440: the macro ribbon view and defensive panels give both zoom destinations different compositions; filled bubbles and cream/pink cupped forms retain sharp silhouettes with visible print grain. Remaining action backgrounds are navy with reference ribbons restricted above the foreground. Green/blue pressure walls keep orange/pink horizontal strands distinct. Weave base rows and clipped overpasses share one geometry helper with exact baselines-37/50/135, width and sag; the former bottom-row135/137 mismatch is removed. The listening ear is separated vertically from the pink palm.

Production build and the existing36-cue/boundary/reduced-motion audit pass for this refinement. No artwork requests were introduced. The slight final ear-position adjustment affects only spacing; narration and camera timing remain unchanged. Local preview only.

### Screenshot follow-up: continuous thread color and straight connections

The supplied close-up exposed an additional cause of rectangular thread patches: crossing repaints accumulated alpha over already translucent strands. Supporting strands now reveal along their length at full opacity; overpasses use the same solid curve and are restricted to the revealed vertical region. Partial-join390/1440 captures show uniform strand color without the brighter rectangular coats. Tactical connections now use straight segments whose endpoints advance with narration, including the forward/support exchange and protective line. The pass follows a straight trajectory. Natural thread deformation, organic silhouettes and hand creases remain curved.

The user preferred the earlier gloves, so the Regulating Emotions cream glove silhouettes, blue palms and yellow cuffs are restored, retaining the supporting pose and print texture. This supersedes the abstract paper-palm experiment. The36-cue continuity/reduced-motion audit passes after the restoration and thread-onset correction.

### Faster immersive camera handoffs

At the user's request, the two selected zoom connections now accelerate inward over0.60seconds and reveal the next view over0.72seconds, replacing the former1.6seconds in each direction. A quadratic approach carries speed into the seam; a cubic release opens the new composition quickly and settles smoothly. Coverage increases from1.08to1.45times the viewport corner distance for a deeper crop of the shared football. Matching object geometry still joins both sides exactly. Narration and the other scene transitions are unchanged; reduced motion remains static. Typecheck and the36-cue/boundary/reduced-motion audit pass.

### Forward passage, replacing the pullback

The user identified that increasing then decreasing the football's scale still felt like bouncing out. The handoff now opens the next scene inside the outgoing football's actual central pentagonal panel. The football and panel keep enlarging until the panel passes every viewport corner. Behind that opening, the next composition advances from0.68to0.88scale, then grows from0.88to its normal framing during the first0.72seconds of its chapter. Neither visible scene shrinks. The panel is the clipping aperture; there is no reverse camera move or detached transition disc. Chapter endpoints match on the destination view rather than on an enlarged copy of the football. Reduced motion skips the passage.
