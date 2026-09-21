# Coaches: individual development plans and the player–parent–coach connection

Research date: September 19, 2026. Research and product proposal only; no application changes. IDP means **Individual Development Plan** for the player, supported by the coach. Recommendations below are hypotheses to validate, not evidence that an app improves football performance.

Companion: [repository findings and implementation notes](coaches-idp-implementation-notes-2026-09-19.md). This report defines the research rationale and product scope; use the companion for code-level planning.

## Recommendation

Build **My next step** inside the Coaches area: one agreed development focus, one relevant island activity, one thing to try in real football, and a short review involving the player, coach and parent. Start with a four-week pilot for a small number of grassroots teams, rather than a full club-management system.

The useful bridge is a shared answer to three questions: **What am I working on? What does that look like in a game? How can the adults help?** A parent should see how to encourage their child; a coach should see something specific to follow up; the player should have a voice in choosing and reviewing the goal.

Use the island's visual paths and illustrative stories as the learning experience. Keep IDP administration out of the player's way. A completed lesson or correct quiz answer is evidence of in-app activity or understanding, never proof of on-field mastery.

## What the evidence supports

| Pain point | Evidence and limits | Product response to test |
| --- | --- | --- |
| Adults give different messages about development | England Football advises involving parents so players do not receive conflicting messages and explaining the week's focus and parental role. This is governing-body guidance, not a prevalence estimate. [Parent partnership guidance](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2024/How-coaches-can-work-with-parents-and-others-off-the-pitch). | Publish one plain-language focus with separate player, coach and parent actions. |
| Parents, players and coaches can interpret support differently | A 2021 study included amateur and academy youth-soccer settings. Children and parents reported high satisfaction with parental support, while coaches' satisfaction differed significantly. This supports interviewing all three roles, not treating parents as the problem. Only the published abstract was available for review. [Lobinger, Eckardt and Lautenbach](https://journals.sagepub.com/doi/10.1177/17479541211011553). | Ask the player what support helps; give parents a specific encouragement cue rather than another evaluation form. |
| Plans can become periodic paperwork | PlayMetrics' vendor analysis covered more than 240 evaluation forms from 66 clubs. It reported mostly post-season evaluation, forms averaging about 21 questions, and inconsistent explanations of rating scales. This is a vendor-selected sample, not a representative industry survey. [Evaluation-form analysis](https://home.playmetrics.com/blog/analyzing-player-evaluation-forms). | Use one current focus and a brief review. Prefer examples of behavior over an unexplained 1–5 rating. |
| Coaches have limited time for individual feedback | The same vendor analysis describes coaches balancing other jobs and many evaluations. FA community posts independently show coaches looking for reusable templates and review structures; these are qualitative signals, not measured workload. [FA coach discussion](https://community.thefa.com/coaching/f/youth-club-football-forum/3275/personal-player-development-plans). | Reuse goal templates, attach existing learning, and record one observation after a session. Measure actual time saved. |
| Players may not connect practice to matches | England Football recommends explaining the relevance of practice, consistent language and praise when players experiment. [Player communication guidance](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/how-to-improve-communication-with-your-players). | Every goal includes a recognizable match situation and one action to try. |
| Individuality can get lost inside team outcomes | FA youth guidance explicitly balances team roles with individual development. An FA coaching discussion recommends player-agreed in-possession/out-of-possession targets and scheduled reviews. [Youth principles](https://www.thefa.com/bootroom/resources/coaching/the-youth-development-phase-core-principles), [IDP discussion](https://community.thefa.com/coaching/f/youth-club-football-forum/5321/do-you-use-individual-development-plans). | Player proposes or chooses a focus; coach agrees it and records a review date. Team wins and selection do not define success. |

Current need does not mean every underlying source is new. The direct research is from 2021; practical guidance and vendor research span several years. Current product pages were checked on the research date. No interviews with Futbol Island users have yet established demand, willingness to pay, or the best review cadence.

## What an IDP should contain here

The following is a proposed lightweight format, not a mandated federation template:

1. **My strength:** something the player enjoys or already contributes.
2. **My next step:** a single observable behavior chosen with the player.
3. **Why it helps:** one sentence linking it to football.
4. **See it on the island:** one existing play/lesson, with an optional illustrative story.
5. **Try it next time:** a manageable action in training or a match.
6. **What I noticed:** player reflection, with “I didn't get a chance” available.
7. **What coach noticed:** a dated example, plus one useful next cue.
8. **How home can help:** encouragement or a question, not parent scoring.
9. **Review together:** continue, adapt, or choose a new focus.

Suggested initial scope: one active focus; review after two weeks or an agreed number of sessions. That cadence is a pilot assumption. Development can move backwards or change context; do not show a fake precision percentage such as “83% confident.”

## Example experience in the Coaches area

**Player:** “I want to ask for the ball more.” The coach and player agree: “After I pass, move where my teammate can see me.” The island opens a suitable support-angle lesson. An optional original story shows a teammate finding the courage to ask again after a mistake; it stays a story, with no compulsory quiz or psychological score.

Before training, the card says: “Try moving into a new passing lane after your pass.” Afterwards the player can select “Tried it,” “Didn't get a chance,” or “Want help,” with one optional sentence: “I moved, but I wasn't sure where to stand.”

The coach records: “In the small-sided game, you moved outside your marker after passing twice. Next time, check where your teammate can see you.” The parent sees: “Ask what they noticed about making space. Celebrate trying, even if they didn't receive the return pass.”

At review, player and coach decide together whether to keep exploring this focus. The island celebrates the conversation and effort without labeling the child talented, behind, or deficient. These example prompts are original product copy, not excerpts from research.

## Three views, one shared focus

| Role | Main view | Smallest useful action | Boundary |
| --- | --- | --- | --- |
| Player | A curved route: choose → explore → try → reflect → review | Choose a focus; tell coach what happened | No public ranking, compulsory streak or ability score |
| Coach | Players due a conversation, current focus and latest reflection | Add a specific observation and next cue | No assumption that all app activity equals learning transfer |
| Parent/carer | Current focus, child's agreed reflection and one support cue | Acknowledge or ask for a scheduled conversation | No sideline assessment checklist or comparison with teammates |

For younger players, test adult-assisted choices with visual examples and minimal typing. For older players, test player-authored goals and richer reflection. These are interaction hypotheses; configure access using actual age, jurisdiction and guardian arrangements rather than assuming a football format determines age or consent.

Keep the textured island background, plain readable cards, existing animated buttons and large touch targets. Coach review should also work as a direct mobile page without making a volunteer navigate the 3D island repeatedly. Load it on demand, pause the world while open, avoid polling and autoplay, and respect reduced motion.

## Current products and the opportunity

Capabilities below come from each provider's own documentation; they have not been hands-on tested. Absence from this table is not evidence that a feature is absent from a product.

| Product | Documented strengths | Implication for Futbol Island |
| --- | --- | --- |
| 360Player | Individual goals, player/parent visibility, reviews and player profiles. Goal progress can be adjusted by coach and player. [Goal help](https://help.360player.com/en/articles/10268487-create-development-goals), [development overview](https://www.360player.com/en-us/development/player-development). | Shared goals already exist in the market. Differentiate through accessible explanation and the learning-to-training loop. |
| PlayMetrics | Curriculum, practice plans, evaluation forms with multiple submitters, reminders and club profiles. [Coaching tools](https://home.playmetrics.com/clubs/coaching-and-player-development). | Do not recreate club operations. Test a small goal card that complements their workflow; integration feasibility remains unverified. |
| TeamSnap | Team/member communication, event assignments and shared files. [Member toolkit](https://www.teamsnap.com/teams/member-toolkit). | Families may already have a communication home. Offer a shareable non-sensitive learning invitation rather than a competing group chat. |
| Techne Futbol | Guided independent training, practice logs, skill tests and training targets; manager portal supports rosters and training visibility. [Player experience](https://www.technefutbol.com/), [manager portal](https://manager.technefutbol.com/). | Training beyond team sessions is established. Island can emphasize recognizing game situations, mental-side stories and specific coach feedback. |

The potential gap is **low-friction shared understanding**, not the invention of IDPs. The claim that families want a separate tool must be tested. Avoid pitching this as replacement software for teams already satisfied with an existing suite.

## Prioritized build plan

### P0: validate the interaction with a local prototype

The current Coaches screen has two Coming soon cards: IDP and Coaches Board. The existing learning stores are localStorage-based (`fi2-football-learning-v1` and `futbol-island-quiz-progress-v1`). They are not authenticated cross-device records. This was verified in the project audit supplied by the coordinating agent.

Build a local, explicitly labeled **My next step prototype** using fictional sample players or a player's own non-sensitive draft. Reuse existing content IDs. Support goal choice, lesson link, optional story, reflection and a preview of the parent support card. A role switch in a prototype must not imply permission enforcement. Exporting a generic blank plan is possible; do not put child identity or reflections in public URLs.

Prototype success: a player understands the goal and knows what to try; a coach can make a usable plan quickly; a parent can explain their supportive role. Local progress must be described as saved on this device, with no promise of team sync or verified coach feedback.

### P1: a real shared pilot

Actual player–parent–coach collaboration requires a backend and identity/access work before collecting real shared records:

- Verified coach/team membership and guardian-child linking; invitation acceptance, expiry and revocation.
- Server-side authorization for every record; separate teams and families; no reliance on a client role switch or guessable link.
- Versioned shared goals, dated observations and author/source labels. Preserve disagreements as conversation, not silently overwritten scores.
- Approved guardian-visible communication; begin with structured goal responses instead of private chat.
- Consent and age handling, export/deletion, limited retention, team departure and coach handover flows.
- Explicit opt-in migration of selected local learning activity. Device activity is self-reported evidence, not identity proof or coach verification.

Minimum pilot flow: invite family → agree focus → explore linked learning → player reflects → coach observes → guardian reads support cue → review together. Batch duplicate a team theme, but require individual agreement before publishing a player's goal.

### P2: expand only after the loop works

Add coach templates by format and situation, accessible translations, printable family summaries, opt-in review reminders and history export. A Coaches Board can attach a simple diagram to an agreed goal later; a sophisticated drawing tool is not a prerequisite. Explore roster import or integrations only after confirming permissions, API availability and demand.

Defer full scheduling/payments, open messaging, public leaderboards, video uploads, AI player ratings, medical/wellness screening, scouting scores and automated selection advice. These add cost or risk without proving the central learning loop.

## Data and safeguarding boundaries

U.S. Soccer states that its MAAPP limits adult–minor one-to-one interactions. The SafeSport 2025 manual sets electronic-communication requirements for covered participants. England Football's public Play Safe guidance directs coaches to communicate online with a child's parent/carer. Club and jurisdiction requirements differ; do not assume one global messaging rule. Design the first pilot around guardian-visible, football-specific interactions and have the pilot club confirm its applicable policy. [U.S. Soccer safeguarding](https://www.ussoccer.com/safeguarding), [2025 MAAPP manual](https://maapp.uscenterforsafesport.org/wp-content/uploads/2024/12/2025-MAAPP-Manual-Final.pdf), [Play Safe](https://www.englandfootball.com/playsafe).

For U.S. covered services, COPPA can apply when collecting personal information from children under 13. FTC guidance calls for appropriate parental notice/consent, parental access and deletion, data minimization, security, and retention limits. This is a product dependency, not a legal determination for Futbol Island; confirm the launch implementation and markets before a real-data pilot. [FTC compliance guidance](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business), [current COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).

Collect the minimum needed: display name or alias, team membership, agreed focus, short football observations, selected activity evidence and review date. Avoid precise location, birthdate unless actually necessary, mental-health labels and third-party trackers in children's flows. Do not promise private reflection and then reveal it to adults without explaining visibility. “Want help” should route to a clear, supervised support process; this feature is not counseling.

## Validation plan and decision criteria

Interview approximately 6–8 volunteer/club coaches, 8–12 parents and 8–12 players across younger and older youth groups, with guardian permission and age-appropriate participation. Include families who rarely use the current team app. These are proposed discovery numbers, not statistically representative samples.

Ask for recent examples rather than feature votes:

- Coach: “Show me the last individual feedback you gave. What happened next? What took time? Who has not had a review recently?”
- Player: “What are you working on? Who chose it? How do you know you improved? What adult response helps after a mistake?”
- Parent: “How do you learn what your child is working on? What is unclear? What would feel like more homework?”
- All three separately: “Describe the same current goal.” Compare alignment without assigning blame.
- Club: “Which system owns the roster and consent? Who handles safeguarding? What happens when a coach or family leaves?”

Pilot with 2–3 teams for four weeks. Proposed acceptance targets, to revise after baseline measurement:

| Measure | Initial target / interpretation |
| --- | --- |
| Coach plan creation | Median under 2 minutes per player; weekly review under 1 minute when an observation exists |
| Player understanding | At least 80% can explain their next action in their own words |
| Shared understanding | Parent, player and coach agree on the active focus without reopening a long report |
| Completed feedback loop | At least 60% of participating players have a reflection and one specific coach observation in the cycle |
| Parent burden | A support card takes under a minute; no required daily check-in |
| Equity and safety | Check participation by device access and communication needs; no cross-family access or unsupervised messaging |

Measure useful conversations and attempted behaviors, not screen time. A four-week usability pilot cannot establish long-term performance, retention or mental-health benefit. If coaches cannot keep up or families refuse another login, retain the player-facing learning card and test a printable/shared-in-person review before building more platform features.

## Next concrete deliverable

Prototype one end-to-end goal about finding space, with a real existing lesson link and an optional suitable story only if available. Show three role-specific views and test the conversation with users. Keep the Coaches Board as a later supporting tool. Once demand and usability are demonstrated, scope the secure multiuser pilot as a separate implementation project.
