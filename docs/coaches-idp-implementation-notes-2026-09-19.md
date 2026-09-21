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
