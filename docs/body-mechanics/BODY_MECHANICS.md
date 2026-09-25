# Body mechanics upgrade — contract (September 22, 2026)

User brief: players should move more fluidly and naturally with a bigger range of motion (lean forward and shift the body while running), defenders need more options such as backpedalling, bodies need weight and must plant with force, and each type of player needs its own speed, body profile and way of moving.

The procedural rig is `lib/graphics/player.ts` (shared by live-match players through `playerBatch` instancing, the user's walking character in `components/Town.tsx`, island NPCs, coach practice, volleyball, rooftop knockout, previews). The match simulation is `lib/town/match/matchSim.ts` (field units 270×400, y-down, speeds in units/s before `LIVE_GAME_SPEED`). `lib/town/fieldRuntime.ts` turns sim state into `PlayerMotion` each frame. Read `docs/performance-guide.md` §Characters before changing any of it: no new animation loops, no per-frame scene queries, offscreen posing stays skipped, instancing and rigid-part merging stay intact, reduced motion stays calm.

## Shared contract (all three lanes code against this)

### `lib/graphics/player.ts` (rig lane owns)

```ts
export type PlayerProfile = {
  height: number;   // uniform root scale multiplier, 1 = current (0.94–1.08)
  build: number;    // torso/shoulder width scale (0.9 lean … 1.18 broad)
  legs: number;     // leg length scale applied to hip/knee groups (0.96–1.06); reach clamps must follow it
  stride: number;   // stride length multiplier (0.9–1.15)
  cadence: number;  // step frequency multiplier for the same speed (0.9–1.15)
  lean: number;     // forward-lean multiplier at speed (0.8–1.3)
  armSwing: number; // arm swing amplitude multiplier (0.8–1.25)
  agility: number;  // how quickly the body re-plants/turns (0.85 heavy … 1.2 nimble)
  weight: number;   // plant/brake force look: sink, dwell, bounce (0.85 light … 1.25 heavy)
  crouch: number;   // defensive ready-stance depth multiplier (0.8–1.3)
};
export const ROLE_PROFILES: Record<'gk'|'def'|'mid'|'fwd'|'you'|'npc', PlayerProfile>;
export function profileFor(role: keyof typeof ROLE_PROFILES, seed: number): PlayerProfile; // ±6 % seeded variance per id
// PlayerRig gains:
setProfile(profile: PlayerProfile): void;   // applies group scales once (no new geometry) + stores motion multipliers
// PlayerMotion gains (all optional, 0..1 unless noted):
backpedal?: number;  // retreating while facing the ball: short quick toe-first steps, upright, arms out
brake?: number;      // explicit deceleration/stop request from the sim (rig also infers braking from its own acceleration)
plant?: number;      // a hard plant impulse (direction change / stop); decays inside the rig
stance?: 'ready';    // defensive ready stance (staggered feet, low, arms out) even when still
```

Role presets (starting values, tune by eye): **fwd** height 1.02, build .94, legs 1.04, stride 1.12, cadence 1.08, lean 1.25, armSwing 1.15, agility 1.15, weight .9, crouch .85. **mid** all 1 except stride 1.04, cadence 1.02, agility 1.05. **def** height 1.03, build 1.14, legs 1.0, stride .98, cadence .95, lean .95, armSwing .95, agility .92, weight 1.22, crouch 1.2. **gk** height 1.05, build 1.16, legs 1.02, stride .95, cadence 1.0, lean .85, armSwing .9, agility 1.1 (explosive laterally), weight 1.15, crouch 1.3. **you**/**npc** = 1 everywhere (the user's look must not change).

### `lib/town/match/matchSim.ts` (sim lane owns)

```ts
export type Role = "gk" | "def" | "mid" | "fwd";  // exists
export const ROLE_MOVEMENT: Record<Role, {speed:number; accel:number; brake:number; turn:number; burst:number}>;
// speed: max-speed multiplier on P.runSpeed (fwd 1.10, mid 1.00, def .94, gk .90 + burst 1.35 within 4 u of a live ball)
// accel: acceleration multiplier on P.accel (fwd 1.15, mid 1.0, def .85, gk 1.2)
// brake: deceleration multiplier (def 1.3 stop hard and plant, fwd 1.0, mid 1.05, gk 1.25)
// turn: agility (fwd 1.15, mid 1.0, def .85, gk 1.0) — sharper direction changes cost less speed
// MatchPlayer gains per-step outputs the runtime reads: brake (0..1), backpedal (0..1), plant (0..1 impulse)
```

Momentum model: replace the plain exponential convergence with one that keeps momentum — accelerating uses `accel`, decelerating uses `brake`, and a desired direction that differs from the current velocity by more than ~70° first bleeds speed (a plant) before re-accelerating; the bled amount scales with `1/turn`. Backpedal decision for outfield defenders: when the opponent carrier is in front of them and their target lies toward their own goal within ~28 u, they retreat facing the carrier at ≤ .62 × max speed (`backpedal` = 1); further than that they turn and recover at full speed (`backpedal` = 0); within ~9 u they jockey (the runtime already derives `jockey`). Balance must hold: write `scripts/sim-balance.mjs` (seeded, all four formats, 24 seeds × 3 simulated minutes, prints goals per game, possession switches per minute, one-sided count) and keep every number within ±15 % of the pre-change run, which you record first.

### `lib/town/fieldRuntime.ts` + `components/Town.tsx` (glue lane owns)

Assign `rig.setProfile(profileFor(live.role, seed))` once per live rig (teaching lessons keep `mid`); map `live.brake/backpedal/plant` into `motion`; scale `runIntensity` by the role's max speed so a forward's run reads faster; the user's character gets `profileFor('you')` and `brake` when the stick is released at speed.

## Review gates

`npm run typecheck`; `node tests/player-motion.cjs tests/player-body-mechanics.cjs tests/player-body-review.cjs tests/field-contact-motion.cjs tests/live-match-patterns.cjs tests/movement-work.cjs tests/player-batch.cjs tests/travel-modes.cjs`; `npm test`; `scripts/sim-balance.mjs` within ±15 %; a headless capture critic (burst strips of live 11v11 and futsal at 390×850 and 1440×850 plus the walking character sprinting, stopping and turning) judging: visible forward lean and body shift at speed, weighty plants with a dwell on hard stops and cuts, defenders backpedalling and jockeying low, forwards visibly quicker and lighter than defenders, keepers in a ready stance, nothing floating or sliding, feet planted, no jitter at seams between behaviours.
