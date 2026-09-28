# Fishing: feel and motion pass — September 27, 2026

Local implementation; not committed or deployed by this pass. The game-developer skill was used to review actual fishing action frames and the repeated-tap exchange.

The satisfying skill remains patience followed by a timely hook and deliberate separate reel taps. Fishing keeps its existing football-club learning facts, catches, economy and difficulty. Camera composition and the Town integration are unchanged.

## Observed issues and changes

- The mobile Harbour Wall baseline completed a catch and exit, but the rod was rigid and the free hand hung idle while reeling. Rod/arm poses now ease between windup, casting, tension and recovery. An elastic segmented rod bows with the bite and accepted taps; the fishing line follows the same curved tip. The supporting hand and a small physical reel crank follow accepted taps, then settle.
- The small fish appeared almost head-on and was difficult to read. A slightly larger minimum reeling silhouette, stronger lateral struggles and short surface lifts reveal the body and fins while maintaining nose-first travel. Articulated tails and fins remain active and shared with the held catch.
- Spray stayed at the original cast point after the fish had moved. Each splash now captures its actual reel position. Accepted taps add a small surface sprinkle using the existing twelve-instance pool, alongside the existing expanding rings.
- Cancelled water-pointer gestures retained their starting point. Pointer cancellation now clears that pending tap; holding still cannot repeatedly reel in a fish.

## Runtime budget

No additional scheduler, timer, canvas, audio context or postprocessing. The existing busy-only frame callback owns all movement, and nearby creation / eighty-metre disposal is unchanged. One small reel-crank draw is added only while the active rod is visible; it shares the reel material. Rod positions and normals use cached buffers, updating only when curvature changes. Rig nodes are cached at creation instead of repeatedly searched each frame. The existing splash instance buffer is explicitly disposed. Reduced motion removes crank rotation, decorative fish struggle and spray; required pose/state changes remain immediate. No physical-phone temperature measurement has been made.

## Validation

- `npx tsc --noEmit`, `node tests/fishing.cjs`, and `node tests/heat-pass3.cjs` passed after implementation.
- Browser checker now uses genuine emulated touchscreen taps on mobile, exercises early-tap failure and a natural retry, verifies rod deformation and crank response after an accepted tap, and fails on browser errors or fishing not sleeping after Stop.
- Baseline phone Harbour Wall completed cast, nose-first approach, hook, repeated taps, catch and exit with no errors. Initial post-change phone run confirmed the new motion and catch, but shared development compilation produced startup chunk/hydration errors; this is not recorded as a clean browser pass.
- Final browser results are reported to the coordinating agent for consolidation after shared edits settle.

## User follow-up: fishing controls and mouth attachment

- Replaced Stop with the shared animated BackButton at the top left; Escape uses its same departure. Fishbook and Cast/Reel are two bottom-right circular actions matching the island action sizes, gaps and safe-area offsets. The parent integration hides and releases the island joystick while fishing, restoring it on exit.
- Fixed the reeling line attachment. The fish nose is local `(-0.5, 0, 0)`. Body placement is solved after scale and struggle rotation from that exact mouth location; the line endpoint is then written at the mouth, with the float just above. The body trails the pull instead of the line joining the tail. Nose direction remains toward the angler (opposite the outward cast direction).
- Corrected scared/escaped shadow rendering: the state machine deliberately retains its approach heading while computing reverse escape travel; the visual adapter now reverses that displayed heading. Actual approach and escape both pass nose-first direction checks.
- Browser assertions compare phone fishing action rectangles with the island actions before entry, check top-left Back and hidden joystick, then compare the line endpoint against the transformed fish-mouth coordinate and its heading toward the angler.

Final real-input checks passed with no browser errors at 390×844 Harbour Wall, 844×390 West Cove and 1280×800 West Cove: cast, nose-first approach, deliberate early-tap failure, natural retry, nose-first escape, timely hook, separate accepted reel taps, rod/crank response, catch and animated Back exit. Fishing-live is hidden after exit. Phone controls match the original island action rectangles exactly (58px, 16px gap); desktop uses72px, 12px gap. Measured line-to-mouth error was below0.000004 metres and nose-to-pull alignment0.982–0.999. Screenshots were inspected for portrait and landscape; the landscape hint was subsequently moved below the coin row to avoid their overlap. Final TypeScript, fishing and heat guards passed. These are local emulated-touch/mouse results, not a physical-device heat or native-Safari assessment.
