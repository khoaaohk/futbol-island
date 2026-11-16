# Rules pages copy for the rebuild branch (SEO CTR round, Nov 16 2026)

For the agent rebuilding back-pass-rule, throw-in, handball, fouls-and-free-kicks and yellow-and-red-cards. This branch
(`seo-ctr`) did NOT touch those entries. Paste what fits into `lib/site/rules.ts` (and the Spanish pair in
`lib/i18n/es/rules.ts`, which stays a translation of the English).

Data: Search Console, 28 days to Nov 14 2026 (`gsc-nov16.md`). Limits the tests enforce: title 30-60 characters, used whole,
says "soccer"; description 120-155 characters; 3-5 FAQs. The new `tests/seo-answers.cjs` also runs on every rule: the first
sentence of `answer` must be 45 words or fewer and say "soccer" (or futsal/football), and every FAQ `q` must end with "?".
Facts: IFAB Laws of the Game (Laws 12, 13, 15), the same sources the file already cites. All copy below is original.

## back-pass-rule (31 impressions, position 38)
Queries: back pass rule in soccer, pass back rule soccer, passback rule football, soccer pass back, football rules back pass.
- Title: `Back Pass Rule in Soccer: Can the Keeper Pick It Up?` (52)
- Description: `The back pass rule in soccer (the pass back rule): when the goalkeeper may not pick up a teammate's pass, what is allowed, and the indirect free kick.` (150)
- H1: `What is the back pass rule in soccer?`
- Answer first: `The back pass rule in soccer says the goalkeeper may not handle the ball when a teammate deliberately kicks it to them, or throws it to them from a throw-in. The keeper must play it with the feet, and handling it gives the other team an indirect free kick.`
- FAQ: Can a goalkeeper pick up a header from a teammate? (Yes; a header, chest or knee pass may be handled, unless it is a trick to get around the rule.) / Is a back pass allowed in soccer? (Yes, the pass is legal; only handling it is not.) / What happens if the keeper picks up a back pass? (Indirect free kick where the keeper touched it.) / Does the back pass rule apply in 7v7? (Yes, the same rule.)

## throw-in (17 impressions, position 75)
- Title: `Throw-In Rules in Soccer: How to Take a Legal Throw` (51)
- Description: `Throw-in rules in soccer for kids: both hands, from behind and over the head, part of each foot on or behind the line, facing the field. With a diagram.` (152)
- H1: `What are the throw-in rules in soccer?`
- Answer first: `A throw-in in soccer restarts play when the whole ball crosses the touchline, and the team that did not touch it last throws it back in. The thrower faces the field, keeps part of each foot on or behind the line, and throws with both hands from behind and over the head.`
- FAQ: Can you score from a throw-in? (Not directly; a throw straight into the goal is a goal kick, or a corner if it is your own goal.) / What is a foul throw? / How far must opponents stand at a throw-in? (At least 2 m, about 2 yards.) / Can the thrower touch the ball again straight away? (No, another player must touch it first.)

## handball (16 impressions, position 34)
Queries: handball rules soccer, hand ball in soccer, handball rule in soccer, soccer handball.
- Title: `Handball Rule in Soccer: What Counts, for Kids` (46)
- Description: `The handball rule in soccer for kids and parents: what counts as a handball and what does not, where the arm starts, and when it is a free kick or penalty.` (155)
- H1: `What is a handball in soccer?`
- Answer first: `A handball in soccer is an offence when a player touches the ball with a hand or arm on purpose, or with an arm that makes the body unnaturally bigger. A touch on the arm is not always a handball, and the arm starts at the bottom of the armpit.`
- FAQ: Is it a handball if the ball hits your arm by accident? / Where does the arm start for handball? / Is a handball inside the box always a penalty? / Can a goal count if it comes off an attacker's hand? (No, if the attacker scores directly from their hand or arm, even by accident.)

## fouls-and-free-kicks (24 impressions, position 31)
Queries: fouls soccer, free foul (and free kick wall: now its own term page, `/learn/soccer-terms/free-kick-wall`; please link it from the wall paragraph).
- Title: `Fouls in Soccer for Kids: Direct vs Indirect Free Kick` (54)
- Description: `Fouls in soccer explained for kids: which fouls give a direct or an indirect free kick, the 10-yard rule, the wall and the 1-yard gap, with a diagram.` (150)
- H1: `What are fouls in soccer? Direct and indirect free kicks`
- Answer first: `A foul in soccer is an unfair action against an opponent, such as a trip, a push or a hold, and it gives the other team a free kick from where it happened. A direct free kick can be shot straight into the goal; an indirect free kick must touch another player first.`
- FAQ: What are the most common fouls in soccer? / What is the difference between a direct and an indirect free kick? / How far away must the wall be? (9.15 m, 10 yards; attackers 1 m from a wall of three or more.) / How does the referee show an indirect free kick? (Arm raised until the ball touches another player.)

## yellow-and-red-cards (117 impressions, position 51; about 60 query variants)
Queries: yellow card in soccer, what does a yellow card mean in soccer, what is a yellow card, yellow and red card soccer, what does the red card mean, two yellow cards in soccer, cards in soccer.
- Title: `What Does a Yellow Card Mean in Soccer? Red Cards Too` (53)
- Description: `What does a yellow card mean in soccer? A warning. Two yellows make a red, and a red card sends a player off. The offenses, explained for kids.` (143)
- H1: `What does a yellow card mean in soccer?`
- Answer first: keep the current answer (it already answers the query in its first sentence).
- Add question H2s: `What does a red card mean in soccer?`, `What happens after two yellow cards?`, `Can a player come back after a red card?`
- FAQ: What does a yellow card mean in soccer? / What does a red card mean? / What happens with two yellow cards in one game? / Can a team replace a player who gets a red card? (No, the team plays one short.)
