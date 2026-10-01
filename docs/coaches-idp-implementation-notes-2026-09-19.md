# Coaches Centre: implementation context

These are repository findings and proposed product decisions, not research evidence or implemented features. Pair with coaches-idp-research-2026-09-19.md.

## Existing foundations

- `components/CoachesCentre.tsx` has a full-screen Coaches Centre with two coming-soon cards: IDP and Coaches Board. Neither is interactive yet.
- `lib/town/learningProgress.ts` records lesson attempts, assistance, stage completion and delayed-review dates locally. `lib/town/quizProgress.ts` stores correct-answer keys locally.
- Existing format paths, guided plays and illustrative stories offer content that can be linked to a goal. Completion indicates app activity, not demonstrated football competence.
- The Supabase integration found in `lib/relayClient.ts` supports the phone controller relay; it is not an established player/guardian/coach account system.

## Suggested experience to validate

Make the main Coaches interaction a small development card: one focus, one next action, one reflection, one coach response. Avoid turning the island into a spreadsheet.

Example goal: “Find a passing option before I receive.” The player chooses this goal with the coach. The coach selects an existing relevant play. The player watches, tries the idea at training, and records a short observation. The coach responds with one specific observed moment and a next step. The parent sees a support cue such as “Ask what they noticed when they looked up,” rather than a score or coaching instruction.

Separate evidence labels: explored on the island / player reflection / coach observation. Do not convert quiz scores into selection recommendations or automated ability ratings.

## Prototype vs real pilot

A local prototype can validate choosing a goal, opening linked content and reflecting. Label it as a personal plan; do not pretend other people received updates.

A real shared pilot requires authenticated accounts, club/team membership, guardian links, role-scoped access, durable server records, invitations, revocation, and explicit sharing rules. Keep communications attached to the goal instead of launching unrestricted chat in the first release. Determine age and club requirements before enabling child accounts or media uploads.

Suggested records: membership; guardian-player link; goal with owner and review date; content assignment; player reflection; coach observation; parent support cue; visibility and revision history. Keep original author and timestamp on each observation. Save local learning progress without overwriting it during any future account migration.

## Scope and operational limits

Start with one team, one active focus per player and a simple coach list of reviews due. Limit reminders and avoid requiring daily check-ins, video uploads, streaks, rankings, or AI-generated player judgments. Measure whether coaches can complete reviews within their available time and whether players can describe their next action.

Use the existing modal/illustration language. Fetch shared records when the Coaches Centre opens or the user refreshes; avoid adding a background polling/render loop to the island. No runtime changes have been made for this research task.

## Update, Sep 30 2026: IDP turned on, and a "For grown-ups" area (game audit G-09 / G-17, Lane 4)

These are implemented, local-only features. There are still no accounts, and nothing is sent to a coach or parent.

**Entry points.** Both are behind the shared parental gate:
- Settings ("Make it your island") → **For grown-ups**.
- Coaches Centre → **For grown-ups: progress & report**.
- Coaches Centre → **IDP** card (`IDP_ENABLED=true` in `components/CoachesCentre.tsx`).
- Inside the grown-ups area: **Coach plan → Open the plan / Start a plan**.

**Parental gate** (`components/ParentGate.tsx`, `lib/parentGate.ts`, also used by Lane 1's donation links):
- It asks a multiplication written in words (6–12 × 3–9), typed as a number.
- After 3 wrong answers it waits 30 s.
- A pass is remembered in memory for 10 minutes. It is never stored, so a reload asks again.
- It is a speed bump for young children, not identity or consent verification.

**Grown-ups area** (`components/GrownUps.tsx`, lazy-loaded by `GrownUpsHost` on first open; static DOM, no loops). All of it is computed on the device from the existing saves (`lib/grownups/progress.ts`):
- **Progress:** paths graduated, lessons understood and hidden balls found. For each format, progress along the path and "Go deeper" lessons. Lessons by mastery stage, using Lane 3's stages from `lib/learning/review.ts` with grown-up wording. Graduation badges come from Lane 2's `fi2-graduations-v1` and the path-complete rule. Learning-journey status is included.
- **Time-agnostic:** there are no play times, streaks or dates of play. "Understood" means the quiz was passed on this device, and the page says this shows understanding, not ability.
- **Learning next:** the next unpassed stop in each started path (7v7 when nothing is started), plus the furthest lessons touched. The saves have no timestamps, by design.
- **Try it at home** (`lib/grownups/practice.ts`): 11 short backyard or park activities, matched to recent, next and IDP lessons, with a safety line.
- **Progress report** (`lib/grownups/report.ts`): a self-contained HTML page (no scripts, links or network requests) printed from a hidden iframe. "Save as PDF" in the browser's print sheet is the export. The only personal detail it can carry is a first name the grown-up types for that print. The name is cleaned to letters only and never stored.
- **Settings:** the format the child plays (`fi2-grownups-format-v1`; it orders the report and sets the IDP's default wording), sound effects, music, lesson voice and Battery saver.
- **About this game for parents:** what the game teaches, how progress works, and a factual privacy note. That note says the site uses Google Analytics for visit counts and that progress, plans and names are not sent.

**IDP changes vs the P0 prototype** (`lib/coaches/idp.ts`, `components/IdpPlan.tsx`, `lib/coaches/idpPrint.ts`), each mapped to the research's nine-part format:
- **My strength:** one of the four corners, plus up to 80 characters.
- **Four corners:** the overview shows for 9v9 and 11v11. 7v7 keeps one card with kid words. Corner labels are kid words for 7v7, kid words plus the term for 9v9, and the full term for 11v11 and futsal. The lead text, reflection prompt, review copy and coach hint are also scaled (`idpCopy`).
- **Island homework:** it ticks itself off. `homeworkStatus` reads the same saves as Paths, using THE path complete rule (`lessonEvidence`), so finishing a linked lesson anywhere counts. "Watch" launches the lesson and closes the Coaches Centre or grown-ups dialog.
- **Player reflection:** stays separate from the coach note. It has the quick answers "Tried it / Didn't get a chance / Want help" and optional text. "Want help" tells the child to talk to their coach or a trusted grown-up, because nothing is sent.
- **42-day review:** "Review together" means keep, adapt or choose new. Reviews are logged (`plan.reviews`). A closed focus keeps a homework snapshot in its history.
- **Printable plan:** player and coach notes are under separate headings, with a Continue / Adapt / New tick row. The name rules are the same as for the report.

**Tests:**
- `tests/parent-gate.cjs`: the gate blocks and unblocks, content stays hidden before a pass, and the IDP is on and gated.
- `tests/grownups-summary.cjs`: the summary is computed from raw saves, and the report contains no personal data.
- `tests/coaches-idp.cjs`: extended for persistence, homework linking, format wording and print.

All three are in `npm test`.

**Still P1 (recommendation, not built).** Real shared player–parent–coach plans need everything listed under "Prototype vs real pilot" above:
- verified coach and guardian accounts;
- guardian–child links;
- server-side authorisation;
- consent handling;
- export and deletion.

Separately, review whether page-level Google Analytics suits a children's product (COPPA and app-store kids' category rules). Consider consent-gating it or switching to a cookieless, aggregate counter.
