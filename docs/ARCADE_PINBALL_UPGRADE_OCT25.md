# Futbol Pinball upgrade — Oct 25 2026

Local branch only, not pushed or deployed.

## Audit (before changes)

Where the live game lives: the cabinet runs `components/games/ArcadeGame3D.tsx` → `lib/arcade/arcadeGames.ts` (three.js), with the game in `lib/games/soccerPinball*.ts`. `components/games/SoccerPinballGame.tsx` (the old 2D canvas version, 1158 lines) is **not imported anywhere**. It is dead code. Only its CSS module is still named in `tests/heat-pass3.cjs`. It is left in place; deleting it is a separate cleanup for the owner to approve.

What already works: physics and table features (kickboards, wall, G-O-A-L flags, crest lanes, cones, dugout modes, 2v1 multiball, Cup Final), timing grades (perfect/early/late), rebound read ring, hit-stop, shake, pooled pop-ups, layered synth voices, keeper dive and parry, defenders' possession and dazed stars.

What feels flat or creates friction for kids:
1. **Nobody reacts to the result.** After a goal the keeper and defenders carry on patrolling as if nothing happened. When you lose the ball the defenders don't celebrate, and when the keeper makes a save he has no reaction. Football emotion is missing from the most important moments.
2. **The keeper looks asleep on kick-off.** While you pull the plunger he stands flat; he only gets set once the ball is already coming at him.
3. **Combos give little feedback.** A 3× or 4× alternating-foot combo shows only a small "3× +75" label and sounds the same as a 1× strike, so the "switch feet" lesson gets no reward.
4. **No step after the first strike.** The opening coach line says to strike on time, but after the first strike nothing tells a new player that switching feet builds a combo, and that is the core lesson.
5. **The goal payoff is a ring and a fanfare.** No crowd roar, no confetti, nothing that says "big moment" from the top-down camera on a phone.
6. **Saves have no crowd.** A parry gets a glove slap but no crowd "ooh", so the near miss doesn't feel close.
7. Bug/test debt: `tests/pinball-divisions.mjs` and `tests/pinball-possession.mjs` fail to load (they import via `scripts/register-local-ts.mjs`) and are not in the `test` chain. They are stale and were not touched here.

## Changes

**Animation (new `lib/games/soccerPinballCrew.ts`).** The keeper and the back line now react, using pose options the shared island rig already blends (`reaction:'dejected'`, `celebrate`, `anticipate`) plus a small hop through the rig's jump argument. Each reaction eases in over .18 s and out over its last .45 s, so nothing snaps.
- Goal: the keeper slumps once his dive has landed, then each defender follows on his own beat (delays 0.10/0.24/0.16 s).
- Lost ball or counter goal: the defenders wave an arm high and hop. Each has his own hop height and rate, so they don't move in lockstep. The keeper punches the air.
- Save or parry: only the keeper reacts, with a short arm-up "mine!". A save never cuts off a goal or drain reaction that is still playing.
- Kick-off: the keeper gets set on his toes as the plunger comes back.
- Reduced motion keeps the readable arm and slump but drops the hop. Dazed defenders keep their existing fall.

**Gameplay and coaching (`soccerPinballFeel.ts`).**
- The 3rd and 4th alternating-foot strike in a rally now get their own call, shown once per rally: "SWITCH FEET! 3×" and "ON FIRE! 4×". Each comes with a sting, a ring and a small shake.
- Step two of the first-ball lesson: after the first kick, the coach line says "Nice kick! Now strike with your OTHER foot to build a combo." It goes away once a combo lands.
- Scoring, payouts and the leaderboard schema are unchanged.

**Graphics (`soccerPinballFx.ts`).**
- One pooled confetti burst (a single instanced draw: 28 pieces on phones, 44 on desktop, colours set once, no per-frame allocation). It fires for goals, 2v1 goals and completed modes (from the goal mouth) and for the Cup Final and full time (across the table). It is hidden as soon as it lands and is off under reduced motion.
- Hot ball: while a 3+ combo is alive, the gold ball-tracker ring turns orange and breathes.

**Sound (`soccerPinballAudio.ts`, still no assets or loops).**
- Rally groove: each combo step adds an off-beat layer (2×: kick, 3×: plus a clap, 4×: plus a bass note).
- Goal: a crowd roar and a stadium "boom-boom-CLAP" drum line.
- Saves: a crowd "ooh" on parries and hard saves (throttled to once per 1.2 s).
- Streak: an "o-lé" call. The voice cap stays at 14; goal voices are ordered fanfare, then crowd, then drums, then bonus.

**Shared files.** `lib/arcade/arcadeGames.ts` got one import and two lines in the pinball block (crew pose and hop for the keeper and defenders). `package.json` has `tests/pinball-crew-oct25.cjs` appended to the end of the `test` chain.

**Cost.** The confetti adds 1 draw call only while visible; the crew logic is a few scalar operations per actor per frame. The crew and confetti timers keep the sleeping loop awake only while they play (≤1.85 s after an event).

## Validation

- `npx tsc --noEmit` passes, as do `pinball-feel`, `pinball-table`, `pinball-timing`, `pinball-kid-pass` and the new `pinball-crew-oct25`.
- A dev-server goal fixture at 390×844 had zero page errors and showed the confetti at the goal mouth. That one run led to slightly larger confetti pieces on phones.
- No real-device or thermal measurement was taken.
