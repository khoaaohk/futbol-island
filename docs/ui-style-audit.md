# Island interface style audit — September 18, 2026

Local implementation and Chromium desktop/mobile emulation. Not deployed.

## Fixes

- Unified dismiss controls through ref-forwarding `DoneButton`: textured gold face, cream rim, 44px height; the 76px pill collapses to a 44px **checkmark** circle before its callback. Double activation is guarded; unmount clears the timer; reduced motion navigates immediately.
- Added matching `BackButton`: labeled pill collapses to a left-arrow circle before navigating. Applied to settings subpages, animal stories, position details, story navigation, onboarding and arcade game returns. Existing Escape handlers and focus refs remain intact.
- Replaced modal dismiss, welcome dismiss, conversation close, phone-pairing close and transcript dismiss with Done. Transport previous-step, minimize and gameplay controls retain their semantics.
- Shared headers reserve equal 76px side columns. Logo/Back stays at the outer left anchor, Done at the outer right anchor, independent of wrapped titles. Fixed mobile HUD top and narrow-phone right offsets that differed from modal anchors.
- Integrated the shared interactive island/palm badge into root modal and film headers. Back hides the badge. The badge owns its bounded sparkle animation; no extra animation loop added by navigation.
- Found the real Choose plays desktop fullscreen regression: legacy `FieldLearning` picker classes still applied a stronger centered-860px rule. Removed these obsolete classes. Choose plays now has a distinct static abstract green/blue/pink/gold backdrop, textured tan cards and bounded reading columns.
- Updated legacy wardrobe selectors and preview containers with a distinct static costume background and textured tan surfaces. Existing preview rendering and selection behavior are unchanged.

## Browser evidence

Checked widths 320, 390 and 1440, with heights 740, 844 and 900 respectively.

| View | Fullscreen / overflow | Navigation anchors |
| --- | --- | --- |
| Store | Passed, category switching retained | Passed |
| Arcade menu | Passed | Passed |
| Coaches Centre | Passed | Passed |
| Pick your patch | Passed | Passed |
| Choose plays, opened from actual pitch entry | Passed | Passed |
| Settings / Keyboard shortcuts | Passed; music toggle state tested | Passed; Back collapse endpoint measured |
| Paths / Ball hunt / Explore | No horizontal overflow | Passed; logo replaced by Back |

Coordinate evidence, excluding safe-area insets (zero in this emulation):

| Width | Left logo / Back x,y | Done outer right, y | Collapsed size |
| --- | --- | --- | --- |
| 320 | 18,16 | 302,16 | 44×44 |
| 390 | 18,16 | 372,16 | 44×44 |
| 1440 | 24,20 | 1416,20 | 44×44 |

HUD Settings measured 44×44 with the same 3px cream border, 5px gold raised shadow and 4px translucent rim as collapsed Done. Done and Back retained their respective outer anchors at the animation endpoint. Reduced-motion Done closed immediately. Onboarding opened and advanced, then Skip tour still dismissed. TypeScript check passed after changes.

Review scripts: `/tmp/fi2-ui-audit.cjs`, `/tmp/fi2-nav-audit.cjs`, `/tmp/fi2-plays-audit.cjs`, `/tmp/fi2-path-nav-audit.cjs`. Screenshots: `/tmp/fi2-venue-{store,arcade,coaches,map,plays}-{320,390,1440}.png` and `/tmp/fi2-settings-journey-{320,390,1440}.png`.

## Limits and remaining review

Wardrobe, individual arcade games, film playback, position-detail pages and pairing overlays received component/style review and type checking, but their complete interactive flows were not all replayed during this audit. The parent task separately checks bottle behavior and new upcoming-story views. No physical iPhone thermal measurements were taken. Production build is left to the coordinating agent after shared work settles.
