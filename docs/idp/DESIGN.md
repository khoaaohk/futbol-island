# IDP v2: one plan per child, told as a story (design, Oct 9 2026)

Evidence: [RESEARCH.md](RESEARCH.md) (§ numbers below point there). Board contract: [BOARD-LINK.md](BOARD-LINK.md).
Status: **Phase 1 is built** (local; not committed or deployed). Phase 2 is a design only. Not legal advice: see §8.

## 0. What changes and why

The P0/Lane-4 IDP was a form: one focus, a homework list, two text boxes. It was gated, adult-shaped and, in practice,
a document nobody returned to. v2 makes the plan **the child's story**: they choose an "I can…" goal with someone, do small
weekly missions that open the exact island lesson, arcade game, card or story that trains it, check in with pictures,
watch a path and a ring grow (never a score), and celebrate when they can do it. Grown-ups get a calm weekly story with
what to ask and what to avoid, and a fridge card whose QR opens the week on their own phone. Coaches give a goal by QR and
get a Play–Practice–Play session for it. No accounts, and no child data on a server beyond the plan's ids in an optional save.

Design rules taken from the research (each enforced in code or tests):

| Rule | Evidence | Where it lives |
|---|---|---|
| Process goals only, phrased "I can…", 1–2 at a time | Williamson 2022 (§2.3), Clarke | `IDP_GOALS[].ican`, `MAX_GOALS=2`, test "catalogue" |
| The child chooses; adults help | SDT, Mageau & Vallerand (§2.1) | 3-step builder, "Who helped you choose?" stamp |
| Strength first | SDT competence (§2.1) | Builder step 1 "What do you love doing?" |
| Whole child: every format offers a psychological/social goal | Four Corners (§1.1) | `7-brave`, `9-brave`, `11-brave`, talk goals |
| Missions are deliberate play, not drill logs | Côté, Ford (§2.2) | `SKILLS[].missions` (home/training/island) |
| No rewards for doing the plan | Deci et al. 1999 | IDP grants no coins, stickers are self-chosen pictures |
| Pictorial, worded self-check; no numbers; under-8s not charted | Mellor & Moore, Horn & Weiss (§2.4) | 3 faces + "No chance to try"; 7v7 shows a row of faces, 9v9+ a line |
| No ranking, scores, %, streaks, comparison | RAE (§2.6), ICO Std 5/12/13 | test "language" bans them in every string |
| Praise effort and strategy | Kamins & Dweck, Macnamara 2023 (§2.5) | Copy bank in skills.ts; cheers are effort-based |
| Parents ask, listen, encourage; car ride home | Knight, Holt, O'Rourke (§2.7) | Grown-ups view "Ask about…", "Please try not to", "Instead, say" |
| Review about every 6 weeks, keep/tweak/new | EFL rules (12 wks U9–11, 6 wks U12+) (§1.1) | `REVIEW_MS=42 days`, review guide |
| Tell the child who sees what | ICO Std 4/11 | Device note on every view; help toggle says who sees it |

## 1. Information architecture

One component, three views (tabs), opened from **Coaches Centre → IDP** (player view first) and **For grown-ups → Development
plan** (grown-up view first). Both entries sit behind the existing ParentGate, as before (decision kept; see §9 for the
recommendation to ungate the player view).

```
IdpPlan ── My plan ──┬── PlanBuilder (no plan / "Change my plan")
         │           └── PlayerStory: Start · My goal · Practise · How it feels · What's next  (+ Celebrate)
         ├── Grown-ups ─ GrownUpWeek (lazy): week story · cheer · note · fridge card · "this helped" · change/end
         └── Coach ──── CoachTools (lazy): plan & review · note & cheer · goal by QR · Play–Practice–Play
/plan#c=… ── "Your coach's goal" → Add to my plan            (player's device)
/plan#p=… ── "This week's football plan" (read-only)          (grown-up's phone)
```

## 2. The player

### 2.1 Making the plan (co-created, three steps)

1. **"What do you love doing in football?"** Four big picture tiles in kid words (Ball skills, Game smarts, Move & recover,
   Team talk), each with a line ("Doing tricks and skills with the ball"). Skip = "Not sure yet". This is the strength.
2. **"Pick one or two things to get better at."** The format's "I can…" goals with a skill glyph, the why in one line and
   its corner. "· uses your strength" marks goals in the loved corner. Status line: "One goal chosen. You can add one more,
   or go on." Format chips switch 7v7/9v9/11v11/futsal (default: the grown-ups' setting).
3. **"Who helped you choose?"** Just me / Me and my coach / Me and a grown-up. The goal card wears that stamp for good.

26 goals (was 18): every format now spans at least three corners; 7v7 covers all four and adds technical
(`7-touch`, `7-dribble`, `7-pass`) and psychological (`7-brave`, "I can keep trying after a mistake") goals.

### 2.2 The story (five beats)

Navigation: the beat rail (tap any beat), Previous/Next navigation buttons (shrink-to-icon kept, never `immediate`), a
horizontal swipe on the stage, or ← →. The story opens on the most useful beat: My goal for a new plan, What's next when a
review is due or a goal was just met, otherwise Practise. Each beat has a kicker, one title, a one-line caption that says
what the picture means, and ONE hero motion.

| Beat | Shows | Hero motion | Caption |
|---|---|---|---|
| 1 Where I started | start date, "I'm good at…" chips, four-corner map (9v9+), "Things I can do now" shelf | start/now pins drop onto a dotted path | "Every player starts somewhere. This is your starting point, not a test." |
| 2 What I'm working on | per goal: growth ring + glyph, "I can…", why, Try it band, coach cue, linked board play, who-chose stamp | ring pieces fill one by one; lesson/arcade/card/story chips **fly in from around the badge** to join it | "Each ring piece is one time you practised. The ring only grows." |
| 3 What I've practised | the journey path (stops: missions, check-ins, proud moments, cheers, reviews), this week's 3 missions | the path **draws itself** to the newest stop; "I did it!" stamps and the path extends | "Every stop on the path is something you did. The path only grows." |
| 4 How it feels | cheers from home/coach, check-in (faces → where → "I'd like some help"), feel line per goal, proud-moments journal | the feel line draws on, faces pop in along it | "There's no right answer. Ups and downs mean you are stretching." |
| 5 What's next | review card or "N days until you talk it through", next mission, "I can do it now!" per goal, add/change | one stamp | "Talk it through with your coach on Friday, November 20." |

The goal badge is one shared element across beats: big in My goal, a small header chip elsewhere, and it travels between
them with a spring FLIP.

**Missions** (`lib/coaches/idp/skills.ts`): 11 skill families × 3 missions (home ≤10 min with just a ball, training, island).
Each mission links to the goal's own format-specific lesson, or the family's arcade game (`/arcade?game=`), position card
(`showCardInBinder`) or life-skill story (Paths on its format). Examples:

- *Finger flash* (scan, home): "A grown-up passes you the ball. Before it reaches you, look at their hand: 1 finger or 2?
  1 = turn with it. 2 = pass it back." → *Watch the lesson: Look, Then Turn or Return*.
- *Touch away* (touch, training): "When a pass comes, touch it away from the nearest defender. Try it three times."
- *Futbol Tennis touch* (touch, island): "Play Futbol Tennis. Cushion the ball before you hit it back."
- *My "next one!" word* (brave, home): "Pick a reset word… Every time the ball drops, say your word and go again." → the
  *Not yet is a starting point* story.

One goal → its three missions each week; two goals → 2 + 1, alternating weekly. "Done" is per week (Monday start) with Undo.

**Ring and path are growth, never score:** a piece/stop is added for each mission, each check-in where they tried (even
"Still tricky"), and each linked island lesson finished. Nothing ever goes down or is compared.

### 2.3 Reflection

- **Check-in:** four big faces with words: *Still tricky · Getting there · I can do it! · No chance to try* (always valid).
  Optional *At training / In a match / At home*, and *I'd like some help with this* ("Tell your coach or a grown-up you
  trust. They'll see it when they open your plan on this device.").
- **Proud moments:** 8 picture stickers, no typing: *I tried something new, I helped a teammate, I kept going after a
  mistake, I did my "I can" in a game!, I listened and learned, I had so much fun, I practised at home, I cheered for someone.*
- Typed reflections still exist for older players and adults, but only in the device-only text store.

### 2.4 Celebration and the next goal

"I can do it now!" needs 3 practice moments first ("Nearly! Try it 1 more time first…"), so tapping through can't skip the
trying, and asks the child to show a coach or grown-up. The celebration is ~2 s: dim (0 s) → badge springs up (0.1 s) →
ring closes all the way (0.35–0.9 s) → ten sparks burst once (0.9 s) → "I can…" stamps in (1.05 s) → line and buttons
(1.35–1.6 s). Then *Choose my next goal* opens the picker (met goals marked "You did this one before"), or *Later*.
The goal moves to "Things I can do now" on the Start beat.

## 3. The parent

### 3.1 The grown-up view (behind ParentGate)

Information first, story second, calm voice, "your player" (no name):

1. **This week** — "Your player is working on one thing: 'I can stop the ball with one soft touch'" + the idea in plain
   words (`grownWhy`).
2. **What it looks like on the pitch** — a tiny play diagram that draws on once (our players, theirs, the run, the pass) +
   caption ("Touch the ball away from the defender, into space").
3. **What they did this week** — missions ticked, check-ins, last feeling in words, the latest proud moment, and if they
   asked for help: "That's a brave and useful thing to say. Ask what would help, and let the coach know." Footnote: "These are
   their own ticks and feelings, to start a conversation. They aren't a score, and there's nothing to compare."
4. **Ask about…** — three starters per skill ("Ask which touch felt the softest today").
5. **Help tonight, in 10 minutes** — the matching `lib/grownups/practice.ts` activity and the missions, with the safety line.
6. **Please try not to** — the skill-specific one ("Groaning or sighing when a touch bounces away") + always: comparing,
   going over the game in the car home, sideline coaching, practice as chore/reward. **Instead, say** — "I love watching
   you play." / "What was the most fun part?" / "What did you try today?"
7. **Leave a cheer** (6 effort-based presets, no typing; they appear in the child's Feelings beat), **a note for yourself**
   (device-only), **the fridge card**, **"Yes, this helped"**, and **Change goals together / End plan** (confirm).

For grown-ups' home card now reads "Working on: 'I can…' · This week: N missions and N check-ins…" with "Open this week's plan".

### 3.2 The fridge card and the weekly digest without accounts

- **Fridge card** (print, self-contained HTML, no scripts/links): name (optional, typed for the print, never stored),
  the "I can…" goals, this week's missions with M–S tick boxes, the proud moment, Ask about / Say / 10 minutes at home /
  Try not to, the review date, and a QR to `/plan#p=…`.
- **The QR's week link** carries catalogue ids and this week's counts only (`1~7v7~7-touch+7-goalside~m1~c2~sbrave~fgetting~h~r20412~kxxx`).
  The `#fragment` is never sent to a server. On any phone it renders the same week story read-only, no sign-in.
- **"Send this week's plan" email — designed, not built (Phase 1.5).** Reuse the save-code email pattern: a grown-up behind
  the ParentGate types an address; `/api/save/email`-style route sends one plain-text email with the week link, stores
  nothing, logs nothing. Blocked on [LAWYER] Q5 (which COPPA exception covers an adult-typed address; §312.5(c)(3) covers
  only the child's contact details) and on Resend being configured. The QR covers the same need today.

### 3.3 Parents' notes and encouragement

Cheers are presets and travel with the save (no free text). Typed home notes stay in `fi2-idp-text-v1` on the device.

## 4. The coach

- **Plan & review** (Coach tab): the player's goals and who chose them, "Asked for help" dates, the six-week review with a
  four-step guide (player first: "What can you do now that you couldn't before?" → one example → one moment you saw + one
  next cue → keep going / change it a little / new goal). Review outcomes are logged; the window restarts.
- **Coach's note** (device-only words) and a coach cheer (preset, travels).
- **Give a goal by QR**: format → 1–2 goals → a cue preset ("Ball, you, goal: in a line.") → optionally a Coaches Board play
  → optionally "team goal". Makes an on-screen QR, a team sheet (6 cut-out cards), or adds to this device directly.
  **Stored on any server: nothing.** The link is `/plan#c=1~7-goalside~q0~p<playId>~t~k<check>`: goal ids, a cue index, a
  play id, a team flag and a 3-character check. No names, no roster, no team id.
- **Player side**: scanning opens `/plan#c=…` → "Your coach's goal" card in kid words → *Add to my plan* (swap prompt when
  they already have two) → saved on that device with source "coach" → "Added! Open the Coaches Centre on the island".
  Limitation: the scan must open in the same browser the child plays in (a home-screen web app has its own storage).
- **Session plan**: Play–Practice–Play for the goal's family, e.g. scan: *4v4, two small goals each end → rondo 4v1, say
  the colour of the bib the coach holds up behind you before every pass you receive → 4v4, a goal counts double if the
  scorer checked their shoulder first.*
- **Linking a goal to a tactics-board play**: via the tiny shared contract in `lib/coaches/idp/board.ts` (ids only, two
  events, an optional registry). Documented for the board agent in BOARD-LINK.md. The IDP never imports board code.

## 5. Connection model and data

### Phase 1 (built): no accounts

Player, parent and coach share ONE plan by being **on the same device**, **printing it** (fridge card, team sheet), or
**scanning a QR** whose payload lives in the `#fragment`. A save code (optional) carries the plan's ids between the child's
own devices.

| Data | Where | Synced with a save code? | Kept | Who can see it |
|---|---|---|---|---|
| Plan: goal ids, source, cue index, play id, dates, mission ids done, check-in faces/place/help flag, sticker ids, cheer ids, review outcomes, history (`fi2-idp-v2`) | device localStorage | **Yes** (allowlist; `stripIdpText` also runs; no text field exists) | until deleted / end plan; server copy 12 months unused | anyone using that device past the ParentGate; on the server only by the code's holder |
| Text-free v1 mirror (`fi2-idp-plan-v1`) | device | yes (already allowlisted) | as above | as above |
| Typed words: player reflections, coach and home notes, strength words (`fi2-idp-text-v1`) | device only (DEVICE key) | **Never** | until deleted | that device |
| First name on a printout | the print only | never | not stored | the paper |
| Coach goal QR / week QR payload | the link's `#fragment` | n/a | not stored by us | whoever has the paper/screen |
| Analytics `ip:<event>` | first-party counter, daily totals | n/a | per analytics retention | admins, totals only |

Server-side, the `/plan` page is a static prerendered route; the request for it is an ordinary page load (IP/UA in standard
hosting logs, never the fragment) — [LAWYER] Q12.

### Phase 2 (designed, not built): guardian accounts with verifiable parental consent

`guardian_id` is reserved on saves. Phase 2 adds: a guardian account (email-plus or stronger VPC; internal use only),
guardian ↔ save link by entering the code behind the gate, a coach/team space where a guardian *opts in* to share one
plan's ids and the child's chosen check-ins with one coach (separate consent if the coach/club is a third party,
§312.5(a)(2)), revocation, export, deletion, and a weekly email digest the guardian turns on. Child free text still never
leaves the device unless a guardian explicitly shares a single note. Prerequisites: lawyer sign-off (§8), DPIA, the
retention policy updated, safeguarding review with a pilot club (guardian-visible, football-only communication).

## 6. Motion and heat

- **Spring physics, interruptible:** CSS `linear()` springs sampled from the same damped-spring maths as the museum
  (`lib/coaches/idp/motion.ts`), cubic-bezier fallback; a FLIP of the goal badge between beats via Web Animations with
  spring keyframes; a quick tap finishes running entry animations before the next beat (`settle`).
- **Choreography:** each beat staggers kicker → title → caption → hero → content (`--i` × 55 ms); one hero per beat; the
  celebration is the only orchestrated sequence (~2 s).
- **SVG draw-ons:** the journey path, the feel line, the play diagram (pathLength=1 dashoffset).
- **No global `::view-transition` rules** (CSS modules only).
- **Heat:** every keyframe is finite with `backwards` fill (nothing stays "in effect"), no `infinite`, no rAF, no timers,
  no polling; `now` is read on open/after changes. Measured headless on phone and desktop: **0 rAF callbacks and 0 running
  animations in 2 s at rest** with the plan open (the island sleeps behind the grown-ups sheet). GrownUpWeek and CoachTools
  are lazy; QR generation (`qrcode`) loads only on demand. Reduced motion: no animation, every frame complete.
- **Mobile first:** 390 px portrait, ≥44 px targets, 16 px inputs, sticky beat rail and nav.

## 7. Measurement (aggregate counters only)

Fixed ids through the existing counter channel (`lib/analytics/countIds.ts IDP_COUNT_EVENTS`), daily totals, never which
goal/mission/sticker/feeling: `ip:open, set, goal, mission, checkin, proud, met, review, link, grown, fridge, coachqr,
coachadd, week, cheer, helped`. Questions they answer, without per-child data:

- Do plans get made and used? `set` vs `open`; `mission`/`checkin` per `open`.
- Does the loop close? `met` and `review` relative to `set` (lagged ~6 weeks).
- Do the bridges work? `fridge`, `week` (QR opened on a grown-up's phone), `coachqr` → `coachadd`, `cheer`.
- Is it useful? `helped` per `grown`. Does it send children back into learning? `link` per `open`.
Dashboard cells should follow the analytics rule of suppressing cells under 5 sessions/day. The /admin section for these ids
is a follow-up (outside this lane). Qualitative validation (interviews in the 2026-09-19 note) remains the real test.

## 8. Lawyer questions (from RESEARCH.md §4.6, plus the build)

1. Is the random save code a COPPA persistent identifier (§312.2), and does allowlisted progress become personal
   information (§312.2(11)) so that §312.5(c)(7) "no other personal information" fails?
2. Is a child-chosen goal id, a check-in face or a "help" flag "information concerning the child"? Should those stay on the
   device in Phase 1 (we currently sync them with a code, as briefed)?
3. Restoring progress from a code as internal operations; what the §312.4(d)(3) notice must say about the IDP.
4. "Send this week's plan" to an adult-typed address behind a parental gate: not collection from a child, §312.5(c)(2),
   or no exception (§312.5(c)(3) covers only the child's contact)? Does a parental gate make input "from a parent"?
5. Written retention policy (§312.10) and security program (§312.8) in Phase 1?
6. Phase 2: is a coach/club a third party needing separate consent, ruling out email-plus?
7. UK: is a save-code record personal data, lawful basis, DPIA; does a parent viewing synced IDP data count as monitoring
   that needs an obvious sign to the child (AADC Std 11)?
8. QR links resolve to our domain (IP/UA in hosting logs, not the fragment): acceptable, or decode offline only?
9. US state laws beyond COPPA; EU Art. 8 ages in target markets.
10. Printing a first name on a fridge card / showing a coach's free-text note on the child's device: any issue?

## 9. Deferred, and why

- **Week-plan email** — needs [LAWYER] Q4 and Resend; the QR fridge card covers it now.
- **Guardian accounts / coach team space / sync to a coach** — Phase 2 needs VPC, consent and safeguarding (§5).
- **If–then plans** ("When my teammate has the ball, then I…") for 9+ — good evidence (§2.3); next increment.
- **Ungating the player story** — recommended (autonomy; nothing leaves the device; no typing needed) but it reverses the
  Lane-4 decision and `tests/parent-gate.cjs`; needs the user's call.
- **Board listens for `BOARD_OPEN_PLAY` and registers plays** — the board agent's lane (BOARD-LINK.md).
- **/admin IDP section** and `npm test` entry for `tests/coaches-idp-v2.cjs` — outside this lane's files.
- **Real-device heat check** — headless shows zero work at rest; no iPhone thermal claim is made.
