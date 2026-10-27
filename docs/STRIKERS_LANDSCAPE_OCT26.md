# Island Strikers: landscape on phones, floating stick, thumb arc, one-tap start (Oct 26 2026)

Owner feedback: on a real phone Strikers was played upright with a small fixed stick and small bunched buttons, and the start
menu was too complex. Changes:

## Orientation exception
- `lib/orientationMode.ts`: the app stays portrait-only on phones. A screen can `requestLandscape()` while mounted (counted,
  idempotent release). Only `components/LiveArcadeMatch.tsx` does (test pins it).
- `components/RotateLock.tsx` reads the mode (`useSyncExternalStore`). In landscape mode an UPRIGHT phone
  (`(pointer:coarse) and (orientation:portrait) and (max-width:500px)`) sees "Turn your phone sideways to play" (inverse phone
  animation). The same window `blur` pauses the match. A mode switch while held the wrong way also blurs, so leaving Strikers
  sideways pauses the island behind the portrait card. Superseded for tall tablets and narrow desktop windows by round 3
  (docs/ARCADE_STRIKERS_R3_OCT26.md): they now letterbox a landscape game frame instead of playing upright. Installed apps also get `screen.orientation.lock()` where the browser allows it.
- No manifest orientation exists, so nothing else changes.

## Camera (lib/arcade/strikerScene.ts)
Landscape touch screens: the pitch fit uses a .9-wide band (clear of notch insets). A 16% view-offset lift is applied after
the fit, so the pitch keeps its size and both goal mouths sit above the stick's rest spot and the button arc. The follow cam pans
only 40% as far toward either goal, so the attacked goal stays right of the tall buttons (projected for 667-932 px phones and
the 1180 tablet). Portrait maths are unchanged.

## Controls (LiveArcadeMatch.tsx / .module.css)
- Floating stick: shares `clampAnchor`/`stickTravel` (lib/town/floatingStick.ts), `shapeStick` (walkControl dead zone + curve)
  and `paintJoystick` with the island. A transparent zone covers the left 45% under the header: a press there anchors the ring at
  the thumb, and on release it glides and fades home (bottom-left, opacity .55 idle). Ring 132-164 px. It applies to every touch
  layout, including tall tablets. One finger owns it, through pointer capture on the zone. It lets go on pointerup/cancel/lost
  capture, blur, orientationchange and any phase change. No per-move allocation; the knob paints on the game frame.
- Buttons: a right-thumb arc around Hold / Shoot (92 px, bottom-right corner), Pass 76 px beside it, then Through, Sprint and
  Switch at 66 px. The minimum gap is 19.5 px and labels are 13 px bold. Pressed state uses `data-pressed`, tracked per
  pointer, with a 10 ms vibrate where supported. Hold-to-charge Shoot is unchanged.
- HUD: a slim header, the meters as one bar under the score, and the direction and habit chip in one pill below it. The coach
  line is a pill between the stick and the arc that fades after 5 s.

## Start card
One card: round name and best stars, three star-goal chips, a big **Kick off**, and **Options** plus **Leaderboard** (48 px).
The three-step how-to strip shows only until the first kick-off (`fi-strikers-howto-seen`). Options opens segmented buttons for
Rounds / Island Cup (locked state kept), round 1-4 (locked rounds disabled) and team shape. These were <select> menus before.
On short landscape screens Options opens as a second column, so nothing scrolls. Saves, coins and unlock rules are unchanged:
the best unlocked round is still pre-selected and the shape is still remembered.

## Tests
`tests/strikers-landscape-{orientation,joystick,controls}.cjs`. These tests were updated for the new structure:
`qa2-rotate-pause`, `strikers-portrait`, `strikers-portrait-tip` and `striker-celebrate`.

## Eyeball on a real phone
Notch insets in both landscape directions, a thumb sliding off the stick zone, stick and Shoot charge held together, turning the
phone mid-match (pause card, then resume), and leaving to the Arcade while sideways.
