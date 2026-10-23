# Friend bumps (Oct 23 2026, local, not deployed)

Owner request: a kid-friendly animation when two party friends run into each other: both flying (jetpack), both walking / running,
both on a bike, scooter or moped, and the local player bumping a friend (the common case on a phone).

## Decisions

- **Purely visual, local to each screen.** No protocol change, no relay change, no gameplay effect. Every screen detects bumps from the
  poses it already draws (friends' interpolated poses + the local pose the town bridge already passes as the colour-ring `LocalRing`).
  Two screens may disagree slightly about a bump (each sees the others ~100 ms late); that is fine for a cosmetic.
- **Never moves a real position, never takes control.** A friend's overlay goes on their rig root after it is posed and before it is
  batched; the yaw part is undone at the start of the next frame (far friends are not re-posed every frame). The local player's overlay is
  put on `player.root` + `vehicle.root` right before `renderer.render` and restored right after (`applyLocalBump` / `restoreLocalBump`), so
  no input, physics, camera, emote or save code ever reads a bumped transform.
- **Families:** walk (Walk / Run / Idle), ride (Bike / Scooter / Moped: a bike can bump a scooter), fly (Jetpack). Mixed families,
  swimmers, parachutes, ziplines, animal rides, fishing never bump.
- **Detection** (`lib/town/friendBump.ts`, pure): horizontal centre distance < 1.2 m; height gap < 0.8 m on the ground (a friend on a roof
  above is not a bump), < 1.5 m flying; closing speed >= 0.5 m/s (two friends standing together never bonk); per-pair cooldown 2.5 s AND
  re-arm only after they have been more than 1.7 m apart (staying together never retriggers).
- **Skipped:** hidden, muted, inside a force field (busy / away), at / through a door (indoors fade), fading in/out (warp), not drawn as a
  rig (beyond the heat cap, off screen, too far), Battery saver, and the local player while indoors / hidden / busy (the bridge passes
  no local pose then). Rooms get friend-to-friend bumps automatically (same layer); the local overlay is island only.
- **Reactions (0.7 / 0.8 / 1.0 s), every curve starts and ends exactly at rest:**
  - walkers: a quick squash on contact with a bouncy recover, a small step back (<= 0.22 m) and a little side wobble;
  - rides: handlebar wobble (fast yaw wiggle), a gentle lean wobble about the tyre line and a short rear skid (<= 0.14 m). Yaw and roll
    about the forward axis only, no squash / lift / pitch, so both tyres stay on the ground (commit 5549550c);
  - flyers: a spin-away (one full eased turn), a tumble that recovers, drifting apart (<= 0.6 m) and a small bob.
- **Bubble:** a word pops at the contact point ("Oof!" / "Bonk!" walking, "Bonk!" / "Whoops!" riding, "Boing!" / "Whee!" flying) with
  four little stars bursting out. Nobody falls down, nobody is hurt.
- **Reduced motion:** no wobble at all, one small fading sparkle only.

## Heat budget

- Per frame: at most 9 bodies (local + shown rigs; rig cap is 5 on most phones), O(n^2) pair test with early-outs (family, height,
  1.7 m ring) before the fixed 24-slot pair table is touched. Zero allocation (typed arrays + reused objects; `tests/friend-bump.cjs`
  checks the source and a flat heap over 200k frames).
- The burst pool (3 bursts x 5 sprites) and its canvas textures are made on the FIRST bump only; with no live burst `update()` returns
  at once. At most 15 extra sprites drawn during a burst, nothing otherwise; no shadows, no new materials per frame.
- Desktop/emulation only; no iPhone thermal measurement was made for this change.

## Files

- `lib/town/friendBump.ts`: families, detection, pair table, reaction curves (pure).
- `lib/graphics/friendBump.ts`: the per-frame layer (bodies from remote entries + local, bursts), friend rig overlay, local overlay.
- `lib/graphics/remoteAvatars.ts`: `bumps.detect` before the friend pass, `unBump` / `applyBump` on each rig, `localBump` getter.
- `lib/multiplayer/townBridge.ts`: `localBump` (null when the party is not live or the local ring is off).
- `components/Town.tsx`: apply / restore around `renderer.render`.
- `tests/friend-bump.cjs`: thresholds, cooldown, families, skipped states, curves, no allocation, wiring.
