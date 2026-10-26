# Island jobs upgrade (25 Oct 2026, local, not deployed)

Owner request: "Continue to fix all the jobs and make that a better experience. intuitive, engaging, better mechanics for the body
while doing the job." Bug catching has its own pass (docs/BUG_CATCH_UPGRADE_OCT25.md); this one covers every other job and the
shared pieces (the job panel, the job buttons, the poses). The coin economy is unchanged: everything new here is cosmetic.

## 1. Audit: each job's flow on a phone

How a kid meets a job: a JOB badge over the sign, the offer button ("Island job · role"), the intro card (what, how, pay), Start
job. While working: the job panel (title, count, one hint line, Stop job; it folds to a chip after a few seconds and reopens when
the hint changes), the beacon (arrow + ring) on the next target plus an edge arrow when it is off screen, and the job's own action
buttons in place of Kick / Juggle / Ride (a disabled one still explains where to go when tapped). Payday card at the end.

Ordered by how many kids meet the job (near spawn and the main pitches first).

| Job | Flow | Problems found | Done in this pass |
|---|---|---|---|
| Rake the leaves (Old Town 7v7) | walk to a pile → hold Rake → Bag it → 12 piles → empty the bag at the compost bin | Between piles the panel showed the whole how-to sentence, not what to do next. A pile raked but not bagged was easy to forget: the arrow pointed at the nearest pile, maybe another one. The rake pose was a small side-to-side wave. | Coach line ("Next: the nearest leaf pile (follow the arrow). 9 leaf piles to go."), a half-done pile is the only goal ("Go back to the leaf pile you started and Bag it."), a real raking stroke (reach out over the front boot, firm pull back), streak, cheer. |
| Court clean-up (Palm Coast rooftop) | pick up 10 bottles → toss the bag in the recycling bin | Same how-to fallback between bottles. Pick-up was a stoop with straight legs; the bottle vanished into a bag the body never touched. | Coach line with bottles left; the pick is a squat (knees bent), then the hand goes over the shoulder into the bag. |
| Ball kid (Eleven Park) | run to a loose ball → Pick up → carry → Put it in the ball box, 5 balls | Hints fine. Carrying was a frozen pose (arms locked, no step). | "Run to loose ball 2 of 5", "Got it! Carry it to the ball box"; the carry leans back a little against the ball, which bobs with each step; standing still, a breath and a look round. |
| Set out the cones (Club Grounds) | carry the stack → Place cone on 8 marks | 1.4 m reach was fiddly on a joystick. The place pose dipped and rose with no beat. | Reach 1.6 m (the nearest mark arms). Crouch with the stack in the arm, eyes on the mark, a small press at the bottom; the free arm swings while walking with the stack. |
| Anchor the goals (Old Town 7v7) | stand at each peg spot → Hammer ×3, 6 pegs | 1.2 m reach right beside the goal frame. | Reach 1.5 m. Hammer pose: wide stance, knees give on the strike (timed to the hammer's own tween), a recoil off the peg. |
| Paint the centre circle (Eleven Park) | hold Paint and walk over 16 dashes in order | Works; the push pose was frozen. | The body leans into the marker and looks down at the line while painting; the handle pushes with each step. No streak here (dashes come every second). |
| Wall rebounds (Coaches Centre) | 50 wall passes with Juggle, 15 target shots from a moving circle | Long (3.5 min) but always clear. | Cheer at the end. (No streak: the ball drill keeps its own rhythm.) |
| Flag the offside (Coaches Centre) | walk to the touchline spot → watch a replay → Raise the flag / Keep flag down, 5 replays | No dead end (a wrong call replays). Flag up was just the arm. | "3 right calls in a row: sharp eyes, ref!" (right calls in a row, no timer); flag up rises onto the toes with the free arm out for balance; the ready stance breathes and scans. |
| Pump the balls (Eleven Park) | kneel at the pump → Pump into the green → Ball ready, 5 balls | Clear (gauge + strokes left). | Each stroke dips the body onto the handle (a bounce through the hips) with a nod. |
| Garden shift, Harvest day, Match-day snacks, Trail clean-up | (rich already: Sep 29–Oct 1 passes) | Nothing broken found in the rules. | Streak (picks, gathers, snacks packed, litter), the basket carry swings the free arm, cheer; Trail clean-up gets the coach line. |

Shared problems found:

- **Leaving a job's area ended it silently.** Walk 45 m past the job's area and the panel just vanished. Now: a one-time warning
  12 m before the edge ("Turn back to keep your job: it stops if you walk much further.") and a "Job stopped" toast that says why.
- **One stray tap on the round × threw a half-done shift away.** Stop job now asks once (tap again within 3.5 s) when the shift has
  progress; with nothing done it stops at once. (The Bug squad already did this.)
- **No progress at a glance.** A thin progress meter now sits under the job title, and along the bottom of the chip.
- **Which button now?** A job button that has just become ready gives two quick pops (reduced motion: none).
- **Per-frame allocations** (heat rule): jobFx made two `Vector3`s per particle per frame and new tween arrays every frame;
  the scene made a new player-position object every frame; the keyframe blend made two merged objects per frame. All fixed.

Not changed (open questions for the owner):

1. On a phone the camera is far enough out that the character's job poses read small (the rake, the hammer). A short "work
   camera" ease-in during an action would show them off; it is a design decision (and touches the follow camera), so not done.
2. A fresh save's first finished job opens the "Pick a card" quest reward full screen at once, which covers the finish cheer and
   the payday card (they come after). Maybe let the payday card show first?
3. Resume: a stopped or abandoned shift starts from zero next time. Keeping a half-done shift for a while is possible (it is all
   in `JobRun`) but changes the save; not done.
4. Rake the leaves: the piles lie on the 7v7 pitch while NPC matches play on it (seen in the desktop shot).
5. The par times come from the economy's own play estimates (jobEconomy JOB_MINUTES). They are tight for a child who walks
   everywhere (cones: 0:25). Loosen them (×1.5?) if kids rarely see "Under par".

## 2. More intuitive

- `lib/town/jobs/jobCoach.ts` `coachLine`: the one-line next step whenever no target is armed: the next target by name, "follow the
  arrow", how many are left; the drop-off line names the button ("All done here! Walk to the compost bin (follow the arrow) and tap
  Empty the bag."). `runHint` falls back to it, so the panel never shows the static how-to mid-shift.
- `runGoals`: a pile raked but not bagged is the only beacon goal until it is finished.
- Progress meter (IslandJobs), Stop asks once, ready-button pop (globals.css), the area warning and "Job stopped" toast.
- Forgiving reaches: cones 1.6 m, pegs 1.5 m.

## 3. More engaging (cosmetic, capped, pay unchanged)

- **Rhythm streak** (`createJobStreak`): items finished within 7 s of each other. Milestones at 3, 5 and 8 (capped): a line in the
  panel ("Quick feet! 3 in a row, like a one-two." / "On a roll! 5 in a row: that is match tempo." / "Unstoppable! 8 in a row: a
  captain's work rate."), a three-note chime (`fi2-job-cue` 'streak', islandSound), two small sparkle bursts over the player and a
  haptic tap. Offside counts right calls in a row instead. No streak on the dashes, the pump or the ball drill.
- **Par time** (`jobPar`, `parLine`): the payday card says "Under par (0:25)! Pro pace." or "Par is 1:10. Try it again to beat
  it!" next to the personal best. Not for the Bug squad.
- **Finish cheer**: every finished shift (not the Bug squad, which has its release) ends with a crouch, a hop with both arms up
  and a fist pump. It waits for the last action's pose (the toss into the bin, the last cone) to finish, and a job ending does not
  cut it short.

## 4. Body mechanics (lib/graphics/jobPoses.ts, lib/town/jobs/jobMoves.ts)

Same rig contract as the bug net and jar poses: keyframe tables sampled by progress with a smoothstep, held poses computed from
the live gait (`Gait`: stride phase, how much the body moves) so a sway lands on the steps; legs keep walking for the upper-body
carry poses; reduced motion keeps the look without the wobble. Every new or changed pose writes into the one reused target:

| Action | Body |
|---|---|
| Rake (held) | reach out: arms long, chest over the front boot, the front foot steps in; pull: elbows bend, weight back; the sweep turns a little each stroke. Reduced motion: one still raking pose. |
| Line marker (held) | both hands on the handle; painting leans in and looks down at the wheel; the handle pushes on each step. |
| Carry ball / snack card / cone stack / basket (held, walking) | load bobs on the steps; a ball hugged to the chest leans the body back; a free arm swings against the stride; standing still: a slow breath and a look round (fidget). |
| Pick up (bottle, litter, harvest gather) | squat with the knees bent, grab, rise, over the right shoulder into the bag. |
| Place cone | crouch, eyes on the mark, a press at the bottom, rise. |
| Hammer | wide stance, overhead, down with the knees giving, recoil, ready. |
| Pump (kneel, held) | each stroke dips the body onto the handle. |
| Flag up | straight arm up, onto the toes, free arm out for balance. |
| Flag ready (held) | breath and scan. |
| Finish cheer (new) | crouch, hop with arms up, land, fist pump. Reduced motion: arms up, no hop. |

## 5. Tests and checks

- `tests/job-upgrade-oct25.cjs` (new, at the end of `npm test`): the coach line per job, the half-done pile goal, a hint at the
  start of every job, the streak (milestones, cap, gap, in-a-row, which events, never pays), par, the cheer (keyframes, the queue
  after the last pose, reset), every changed pose (distinct, finite, back to standing, the same reused object), the FX tween order.
- `tests/island-jobs.cjs`: the area warning and the "Job stopped" toast on the real scene, three quick cones fire the streak line.
- `scripts/check-island-jobs-browser.cjs` (phone + desktop): offer → Start → coach line + meter → rake and bag → Stop asks once →
  cones → streak line → payday card with the par line; no console errors.

Runtime cost: no timers, no loops; the streak runs once per finished item, the warning check is a few comparisons per frame
while a job runs (no allocation), the meter is one CSS width.
