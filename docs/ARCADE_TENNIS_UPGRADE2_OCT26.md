# Futbol Tennis upgrade 2, Oct 26 2026

Cabinet `tennis`. Live path: `components/games/ArcadeGame3D.tsx` → `lib/arcade/arcadeGames.ts` (tennis branch) → `lib/games/soccerTennis.ts` (rules/AI) + `lib/arcade/tennisFeel.ts` / `tennisArena.ts` / `tennisAudio.ts`. Follows `docs/ARCADE_TENNIS_UPGRADE_OCT25.md`.

## 1. Hold to power (`lib/games/tennisPower.ts`, new)

- **Tap** Kick, Lob or Drop = the old shot, bit for bit. A press shorter than 0.11 s counts as a tap.
- **Hold** = wind up. The charge goes from 0 to 1 in 0.75 s and caps at 1.4.
  - 0.80–1.00 is the gold **SWEET** window: full power and a cleaner touch (+0.08 quality).
  - Above 1.00 is **OVERHIT**: a wilder touch, and the ball sails long. An overhit drop floats long and gives the rival an easy ball.
  - Let go to strike.
- What a hold does to each shot:
  - **Kick**: a harder, flatter drive with more topspin that lands deeper. It skims the tape.
  - **Lob**: higher, deeper and hangs longer.
  - **Drop**: shorter, with more backspin, and dies near the net.
  - The serve works the same way: a held Kick serves faster, a held Lob gives a bigger rainbow flick.
- **Placement**: whatever the stick says when you let go. Sideways aims as before. Up sends it deeper, down sends it shorter.
- **Safety**:
  - If you hold through the contact, the sim strikes for you at the last moment (the ball is leaving your body or about to bounce twice), so holding never loses a point by doing nothing.
  - Your feet slow by up to 20% while you wind up.
  - Header, scissor and trap stay taps.
- **Inputs**:
  - Touch, mouse and pen work, each button tracking its own pointer, so the joystick thumb and the shot thumb work together.
  - Space, J and K on the keyboard, plus Space or Enter on a focused button.
  - `pointercancel`, lost capture, window blur, pause and the end of a point all cancel the hold cleanly, with no shot.
- **Feedback**:
  - A charge ring around the button: cyan while it builds, then the gold band, then red. A faint track shows where gold starts.
  - 28 instanced segments around your feet on the court, using the same colours.
  - The header pill says "WINDING UP / GOLD · let go now! / OVERHIT".
  - The player crouches deeper as the charge builds.
  - Sound: a wind-up tone that rises with the charge, a tick as it enters gold, a buzz once overhit, and a louder crack on wound-up strikes.
  - Haptics on press, on reaching gold, on overhit and on a sweet release (skipped when reduced motion is on).
- **AI**:
  - From court 2 the rival winds up power drives. From court 4 it also winds up deep lobs over a net-rusher and short drops behind a deep defender.
  - Each wind-up shows as a growing pink ring under the rival, an intent call-out ("POWER DRIVE · step back, stay low") and a crouch.
  - From court 5 the rival reads your visible wind-up: it backs off for a held lob or kick and creeps in for a held drop.
  - Your sweet strikes make its read a little worse.
  - The rival never overhits, and its power shots follow the same quality caps as before.
- Coin payouts, the leaderboard (best rally) and the save formats are unchanged. The new counters (`sweetShots`, `overShots`, `powerEvents`) live only in the match state. The full-time card shows best rally, perfect touches and sweet strikes.

## 2. Dynamic camera (`lib/arcade/tennisCamera.ts`, new)

- **Serve**: a raised, tilted view (tilt 0.8 on phones) solved on resize so the whole court fits between the HUD and the controls. That includes the far baseline and both service boxes. The camera eases into the rally view after the serve and eases back for the next serve.
- **Rally**: frames the box around you, the ball and its bounce spot.
  - It pushes in as the ball comes to you: up to 1.32× on portrait phones, 1.18× on tablets, 1.1× on desktop.
  - It pulls back to the wide shot when the ball is far or the point is over.
  - A clamp table, solved on resize, keeps the near frame edge at or below the controls band and the far edge at or above the HUD band. A push-in shows more court, never empty floor.
- **Smoothness**: pans are capped at 6 m/s and zoom at 0.5/s, both damped.
- **Reduced motion**: a fixed rally shot with no pan or push-in, and a cut between the serve and rally views.
- Portrait phones frame the court at 10.5 m instead of 11.05 m, and the rally view is lower and more tilted, so players read bigger.
- The slam/scissor close-up still layers on top of the camera.

## 3. Coaching tip

The tip is centred horizontally, sits above the controls, and fades out after about 4 s. The fade restarts with each new tip.

| Screen | Where the tip sits |
|---|---|
| Phone | 184 px above the bottom, just under the court |
| Tablet | 172 px above the bottom |
| Desktop | 34 px above the bottom, between the joystick and the buttons |
| Landscape | Bottom centre |

## 4. Extras

- Six pooled additive bounce marks, tinted by shot (power orange, drop blue, lob white, overhit red), that fade over 1.6 s. The ball trail recolours for power shots.

## Cost

- Three new draws, all pooled:
  - The meter, only while you hold.
  - The rival ring, only during its wind-up.
  - The bounce marks, only while one is fading.
- No allocation per frame. Binary searches run on resize only.
- The frame loop sleeps once the camera settles. `tennisCam.moving()` keeps it awake while the camera eases.

## Validation

- `tests/tennis-hold-power.cjs` and `tests/tennis-camera-dynamic.cjs` are new and wired into `npm test`. The existing tennis tests pass unchanged.
- A headless Chrome run (`--mute-audio`) at 390×844, 820×1180 and 1440×900 checked:
  - On touch screens: holding Kick while the joystick is held (multi-touch), the ring, the pill, the serve on release, touchcancel on Drop (no shot), and a plain Lob tap.
  - On desktop: holding and releasing Space, a mouse hold on Lob cancelled by blur.
  - On all three: the serve and rally camera, the tip centred, and the tip clear of the joystick and buttons.
- Not tested on a real iPhone.
