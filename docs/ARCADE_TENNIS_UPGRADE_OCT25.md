# Futbol Tennis upgrade, Oct 25 2026

Cabinet: `tennis`. Live code path: `components/ArcadeRoom.tsx` → `components/games/ArcadeGame3D.tsx` → `lib/arcade/arcadeGames.ts` (tennis branch) → `lib/games/soccerTennis.ts` (rules/AI) + `lib/arcade/tennisFeel.ts` (call-outs, hit-stop, pose overlays) + `lib/arcade/tennisAudio.ts` (synth sound). `components/games/TennisCourtPicker.tsx` is the court card.

## Audit (before)

Found with a phone (390 x 844) and a desktop capture of court 1 plus a code read.

- **Dead code:** `components/games/SoccerTennisGame.tsx` (+ `.module.css`) is the old 2D canvas version. Nothing imports it. It is left alone in this pass (deleting it is the owner's call). Every change below goes into the live 3D path.
- **Flat court on phones:** the phone camera looks almost straight down. The court is a dark navy slab with only the outer lines and the net, so it reads like a table. It has no service boxes, no centre mark and no light. Players are small dots from above, and nothing marks who is who apart from the shirt colour.
- **No arena:** the court has no crowd, no umpire and no ball kids. On desktop the court sits in the shared arcade room props (palms and benches). Nothing on screen reacts to a long rally or a won point except text banners.
- **Animation gaps:** a won point gives a 0.7 s arms-up. A won *match* gives nothing (celebrate is 0 in the `over` phase), so the winner just stands still behind the result card. Players never bounce on their toes while waiting, and a hard stop or change of direction has no plant or skid. Only the split-step hop when the opponent strikes is there.
- **Sound gaps:** contacts, bounces, net, crowd swell and the rally bassline are good. Missing: shoe squeaks on hard stops, a voice "hup" on power shots, a whoosh on lobs, any rhythm under long rallies beyond the bass note, match-point tension and a streak fanfare.
- **Kid friction / onboarding:** coaching is rich (grade fix lines, aim nudges, rival call-outs). There is no "match point" moment, nothing when you win several points in a row, and no encouragement when a young player falls well behind. The losing streak already raises the hidden assist (`s.assist`), but the player is never told "you can come back".
- **Fairness ramp:** already present (`tennisAssist`, `winRun`/`lossRun`, the rival tiring in long rallies on early courts). It is not changed.

## Plan

1. Graphics, in a new `lib/arcade/tennisArena.ts` built from `tennisFeel` (so the shared `arcadeGames.ts` is untouched). It adds service-box and centre paint in one merged mesh, soft light pools under both players (yellow for you, pink for the rival), floodlight glows, confetti on won points and matches, and dust puffs on hard plants. Desktop only: an instanced crowd in two side stands whose heads follow the ball, who stand up on points and do a wave in long rallies, and an umpire on a chair.
2. Animation (`tennisFeel.pose`): a ready-bounce on the toes while receiving, a plant crouch on hard stops, a hop and fist pump for the point winner, and a 2 s jumping celebration for the match winner.
3. Sound (`tennisAudio`): shoe squeak, "hup" voice, lob whoosh, a hi-hat rhythm on bounces and a chord pad in long rallies, a match-point heartbeat with a crowd hush, and a streak fanfare.
4. Coach copy: MATCH POINT banners, ON FIRE after 3 points in a row, and a "you can come back" line when 3 points behind.

Limits: no network, no asset files, payouts and leaderboard schema unchanged. Reduced motion turns off hops, confetti, dust, the crowd wave and light-pool pulsing. Everything is pooled: no per-frame allocation, and every new mesh is disposed in `tennisFeel.dispose()`.

## Result

Shared files touched: only `package.json`, where the new test is appended to the end of `"test"`. `arcadeGames.ts` is unchanged: the arena is created inside `createTennisFeel`.

- **Graphics** (`lib/arcade/tennisArena.ts`, new):
  - Court paint: both service lines, the centre service line and the baseline centre marks, all in one merged mesh.
  - Four warm corner floodlight pools in one mesh.
  - Additive light pools under both players: yellow under you, pink under the rival. Each flares briefly on that player's contact.
  - A 40-piece instanced confetti pool: a small burst when you win a point, four bursts across the court when you win the court.
  - Dust puffs on hard plants, using the stage's pooled `burst`.
  - Desktop only: two side stands with 32 instanced fans and an umpire on a chair. Fans turn toward the ball and lean their heads toward it. They jump for your points, clap politely for the rival's, and do a stadium wave from a 10-touch rally. Crowd matrices update at 30 Hz at most.
  - Phones skip the crowd because the top-down phone camera cannot see the stands.
  - Draws added: phone +5 (paint, floodlights, 2 pools, confetti only while it flies); desktop +3 more for the crowd. Browser check rally draw calls: 46 phone / 91 desktop.
- **Animation** (`tennisFeel.pose`):
  - Point winner: one hop with the existing arms-up.
  - Match winner: arms up for 2.2 s with three bouncy hops, then it eases out. Before this, the match winner stood still.
  - A hard stop or change of direction from more than 4 m/s gives a knee-bend crouch for 0.28 s, a dust puff and a shoe squeak. It is rate-limited to one every 0.7 s.
  - Ready stance: a light 2.8 cm bounce on the toes while the other side has the ball and you are set.
  - Reduced motion: no hops, bounce, confetti, dust, wave or pool flare.
- **Sound** (`tennisAudio.ts`, same synth voices with the 14-voice cap):
  - Court-shoe squeak, a voiced "hup" on power shots, a rising whoosh under lobs.
  - A hi-hat on bounces from a 6-touch rally, and pad chords every 4th touch from the 8th.
  - Match-point heartbeat with a crowd hush, a streak fanfare, and a warm two-note "you can come back".
  - The bounce cue now carries `:<sand|hard>:<rally>`.
- **Coach copy:**
  - **MATCH POINT!** on the first touch of that point, with a different line for you, for the rival, or for 6:6.
  - **ON FIRE! N IN A ROW** after 3 or more of your points in a row.
  - "Shake it off · you can come back!" when the rival leads by 3 or 5.
  - Payouts, leaderboard schema and the hidden assist are unchanged.

### Validation

- `node tests/tennis-arena-feel.cjs` (new): marks, crowd and wave maths, match point, celebration hops, the full point/streak/comeback/match flow on a stub stage, settle-to-sleep, plant + cool-down, ready bounce, the reduced-motion paths, dispose, and every new sound cue under the voice cap with all nodes freed.
- Existing `tests/tennis-{touch-grades,depth,calls,aim-drill}.cjs`, `arcade-stage-dispose`, `arcade-polish` pass. `npx tsc --noEmit` passes.
- `scripts/check-soccer-tennis-browser.cjs`, desktop and `--mobile` (movement, exact rest, idle-serve sleep, pause sleep, rally), and `--mobile --play --sequence --brief` pass against a private dev server.
- `tests/tennis-circuit.mjs` and `scripts/check-soccer-tennis.mjs` need a newer Node (`registerHooks` / `.ts` loading) and do not run on Node 20. This was already true before this pass, and `soccerTennis.ts` is unchanged.
- Not measured on an iPhone.
