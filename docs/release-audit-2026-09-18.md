# September 18 release audit

Production build tested locally in Chromium with desktop and mobile emulation. Physical iPhone Safari/Chrome and device temperature have not been measured.

## Verified

- Store, Arcade menu, Coaches, Pick your patch: fullscreen bounds, no horizontal overflow, category switching and dismissal at 320, 390 and 1440px. Store categories remain a horizontal scroller.
- Paths, Ball hunt and Explore: header corner anchors, navigation, collapsed 44px controls and reduced-motion dismissal at the same three widths.
- Settings: mobile shortcuts and return, opaque background to viewport bottom at heights 600/700/844, no horizontal overflow. Touch/programmatic focus does not add the blue Done outline; Tab focus remains visible.
- Bottle: rendered opaque wave pixels, note reveal, dismissal, zero continued canvas draws after unmount. Two-second sample counted 40 wave draws (below 24fps cap), with no 3D world renders behind it. Settings also produced no 3D renders during a settled 1.2-second sample.
- Love Futsl, Regulating emotions, Grit: each loads and plays a single native video, advances playback, and removes the player on close. Upcoming-story placeholder opens and closes. No page errors in these flows.
- Fourteen focused Node suites pass: path catalog/story progress, choreography, explore, quizzes, quests, music continuity, sound resume, engine reuse, idle lighting/effects, position subscriptions, lesson presentation and bottle audio. Main town simulation suite passes. Production compile, lint and types pass.

- Final build: repeated onboarding Back and fullscreen Choose plays at 320/390/1440 pass with no page errors.

## Issues corrected during audit

- Mobile wave drawing no longer waits for SVG-image decoding/CanvasPattern creation. Page displacement and wave drawing belong to the same frame.
- Settings contains overscroll, uses an opaque background and avoids a local-attached scrolling background. Panel height follows its dialog and does not retain the entrance animation's compositor state.
- Shared Done/Back focus rings follow keyboard input, avoiding automatic blue touch focus.
- Onboarding and illustrated story Back controls remount per step, so repeated navigation cannot leave them collapsed/transparent.
- Ocean audio allocates no source at zero effects volume, reuses its generated buffer, resumes after unmute/volume restoration, and stops when hidden. Dedicated regression checks cover fade scheduling and cleanup.
- Older test fixtures now supply browser event APIs, the current ferry dependency and learning-preview guard. Audio tests target ES2020 so Set iteration is actually exercised. Story expectations include the new futsal film.

## Limits

This is a regression audit of today's changed surfaces, not exhaustive testing of every arcade game, lesson answer, costume or device/browser. The three exported story movies received playback/lifecycle checks, not a new frame-by-frame creative review. No claim of measured phone cooling or guaranteed absence of all bugs.

Deployment verified READY in Vercel: `dpl_DLhmWL7Y62brq5VKaLeKbyQuyqjV`, production alias https://futbolisland.app (September 18, 2026).
