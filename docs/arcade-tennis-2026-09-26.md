# Tennis bean-rig contact review — September 26, 2026

Local changes, not deployed. Uses the installed game-developer review workflow and preserves the bean character skin, team dress and existing shared motion solver.

## Finding and correction

The island adapter previously received a generic forward boot target and the same default shot power for every Tennis return. That was a code-based finding: the baseline browser capture was blocked in an approval request and canceled before a running session was confirmed. Tennis's forgiving contact area permits lateral contacts, while the generic rig target remained directly ahead. Lowering the old kick scalar for a drop only changed the trigger amplitude, not the island strike's energy or type.

Tennis now records the physical contact offset in the outgoing shot frame, along with contact height, action kind and strike energy. Those values remain committed while the ball leaves. The renderer converts the contact offset to unscaled rig-local metres and bounds it to the native leg's reach. Soft drops use the pass pose, lobs use loft, and drives/slams use stronger shot intent. The adapter owns latching and the native solver remains unchanged.

A high-ball slam uses the existing volley move, beginning at its documented contact phase (0.42) and proceeding through recovery. Its kicking side follows contact lateral offset and its lift follows contact height. It does not delay physical contact, add a trick input or change the game's feet-only learning purpose.

## Runtime cost and validation

Two reusable pose/move records and scalar contact fields replace generic intent. No extra geometry, renderer, timer or frame loop. Existing 30 fps mobile cap, rig settling and idle/pause sleep remain.

The simulation suite passes new tests for committed contact-frame reconstruction, stable offsets during flight, distinct drop/drive energy and remembered aerial contact height, alongside existing gameplay and movement checks. Browser validation status is recorded below when complete; injected high-ball pose fixtures are kept separate from ordinary-input play evidence.

## Handoff validation status

- `node scripts/check-soccer-tennis.mjs`: passes, including the new bean-contact regressions.
- `npx tsc --noEmit --incremental false`: passed after contact intent integration.
- `node --check scripts/check-soccer-tennis-browser.cjs`: passes after the harness correction.
- Final desktop/mobile visual verification is **pending with the parent integration agent**. Browser launches containing an environment prefix or combined edit-and-launch command were blocked in approval and canceled; no running session was confirmed for those attempts.
- One plain desktop attempt completed the existing movement/serve/pause checks, but its action capture was invalid: taking a screenshot immediately before pressing Kick delayed input beyond the contact window. That output must not be treated as a successful returned-ball sequence. The corrected harness captures anticipation earlier and requires an actual kick-count increase with human ownership of the outgoing ball before accepting a sequence.
- `--volley` is a deliberately injected high-ball pose fixture. It validates finite native animation and visibility only, separately from `--play --sequence --brief`, which uses ordinary keyboard/touch input.

Parent final commands, run sequentially with the already-approved plain Node prefix:

```
node scripts/check-soccer-tennis-browser.cjs --play --sequence --brief --capture=bean-after
node scripts/check-soccer-tennis-browser.cjs --mobile --play --sequence --brief --capture=bean-after
node scripts/check-soccer-tennis-browser.cjs --volley
node scripts/check-soccer-tennis-browser.cjs --mobile --volley
```

The volley uses the native planted support pose. The prior generic hop overlay is removed for this action because it would bend the solver's completed volley joints a second time. No changes to bean geometry, appearance, team dress or the shared native solver were made by this lane.

## Final browser evidence (parent)

Corrected short ordinary-input sequences pass on desktop and touch emulation. Each sequence requires the physical kick counter to advance and ball ownership to become `you` before accepting captures. Reviewed `/tmp/fi-tennis-bean-after-{desktop,mobile}-1.png` alongside five-frame motion records: the return advances through kick/recovery, the ball travels away and the player settles facing the court. Initial movement, canceled touch recentering, settled-serve sleep and pause checks also pass. These runs establish a confirmed return and recovery, not a full ordinary-input match outcome. Separate high-ball fixture results follow.

Desktop and mobile injected volley fixtures also pass: a real Kick input releases the high ball, then the native volley bends/releases the kicking leg through recovery with finite joint values. Contact heights were approximately 1.60 m and 1.57 m. Reviewed desktop contact capture and mobile sequence; no page errors. These high-ball fixtures are deterministic animation evidence, not proof of an ordinary high-ball opportunity or full match balance.

## Deliberate headers and scissor kicks

The later aerial-action request expands the earlier feet-only design. Desktop uses **H — Header** and **L — Scissor**; touch exposes named blue Header and coral Scissor buttons alongside Kick, Lob and Drop. Available aerial contacts highlight the corresponding button. Both require an incoming opponent ball inside a close, high contact window; neither can serve, double-touch the player's outgoing ball, or silently turn a low failed header into a foot return. Existing foot controls remain immediate.

Headers trade pace for a controlled longer flight. Scissors add pace and a committed 0.85-second landing/recovery, with more error from reaching or moving. In the same-state simulation comparison, the normal high slam travels horizontally at 21.70 m/s, the scissor at 25.26 m/s (about 16% faster), and the header at 9.18 m/s. All three land legally in the opposite court. These controlled figures establish the mechanic difference, not full-match balance.

The existing native scissor move starts at contact phase 0.33 and completes its recovery. Headers use the native header reaction beginning at contact phase 0.46, with the existing jump pose and contact-height-dependent lift. Physical input is never delayed to play a wind-up; incoming-ball facing and receiving anticipation precede contact. Header flight/impact is sky blue, scissor flight/impact coral, and ordinary foot strikes gold. One reusable impact ring and the existing pooled trail provide this feedback; reduced-motion mode hides those effects. No new renderer, interval or unbounded effect allocation.

Validation:

- Simulation regressions pass for both contact windows, legal trajectories, extra scissor pace/recovery, rejected low headers, serve restrictions and own-ball double-touch restrictions. Existing skill, fluidity, sleep and bean-contact suites also pass.
- TypeScript passed after the new controls and rig fields were integrated.
- `node scripts/check-soccer-tennis-browser.cjs --aerial` passed on desktop with ordinary H/L input and confirmed physical contacts for both actions.
- `node scripts/check-soccer-tennis-browser.cjs --mobile --aerial` passed with actual touch input on the named action buttons. Movement cancellation, settled-serve sleep and pause sleep pass before the aerial exchange. Captures show the blue header and horizontal scissor pose with coral trail. These are ordinary-play opportunities, without injected ball/player state.
- Desktop captures: `/tmp/fi-tennis-header-desktop.png`, `/tmp/fi-tennis-scissor-desktop.png`; mobile equivalents end in `-mobile.png`.

The harness now enters `/arcade?game=tennis` directly and explicitly checks all five mobile action targets are at least 44px and inside the viewport. A final mobile rerun covers that new entry/target assertion and the adjusted native header contact phase.

Final direct-route mobile rerun **passed** after header contact-phase correction: both ordinary touch aerial actions registered, all five action targets passed the >=44px/on-screen assertions, and cancellation/sleep checks passed. Reviewed the updated header follow-through capture. Scissor contact in that run recorded 21.59 m/s horizontal pace at 1.74m contact height; the game reached an eight-contact rally during the test. The first target-check attempt exposed missing test attributes on Lob/Drop rather than a gameplay failure; those attributes were added and the complete run repeated successfully.
