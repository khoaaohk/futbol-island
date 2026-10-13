/**
 * laws-1863 · words for the modern gallery retelling (Oct 10 2026). The prologue beats and the quick check were written on
 * Oct 9 2026 (story pass) and are unchanged; every line is real history, sourced in LAW_SOURCES (laws.ts): the FA was formed on
 * 26 October 1863 at the Freemasons' Tavern in London; the Laws were settled in December 1863; Blackheath left because it wanted
 * to keep hacking and carrying; the IFAB has looked after the Laws since 1886.
 */
export const BEATS=[
 {when:'Before 1863',head:'Every school played its own game',text:'At Rugby School you could pick the ball up and run with it. At other schools you could only kick it. When two teams met, they argued about the rules.'},
 {when:'26 October 1863',head:'A meeting in a London tavern',text:'Men from London football clubs and schools met at the Freemasons’ Tavern and started the Football Association. Their plan: write down ONE set of rules for everyone.'},
 {when:'December 1863',head:'Thirteen Laws',text:'After weeks of arguing, thirteen Laws were printed. The Blackheath club walked out: it wanted to keep hacking (kicking shins) and carrying the ball.'},
] as const;

/** The quick check: three questions on what the rulebook just showed (shared gallery pattern: q, options, answer, why). */
export const CHECK=[
 {q:'What did the goal get first, to give it a top?',options:['A crossbar','A tape'],answer:1,
  why:'A tape went across the posts in 1866. A tape can sag, so a solid crossbar became a must in 1882.'},
 {q:'Which 1863 rule is still a rule today?',options:['Swap ends after every goal','Race for the throw-in','No tripping'],answer:2,
  why:'Tripping was against the Laws in 1863 and it still is. Today teams swap ends only at half-time, and the throw-in goes to the other team.'},
 {q:'Who looks after the Laws of the Game today?',options:['Each club makes its own','The IFAB','The two captains'],answer:1,
  why:'Since 1886 the IFAB has looked after the Laws, so a game is played the same way all over the world.'},
] as const;

/** What each version of each rule's abstract figure shows, said in words under it. */
export const CAPTION:Record<string,readonly string[]>={
 players:['How many a side? Agree before kick-off.','Eleven a side.','Eleven a side, and one is the goalkeeper.'],
 goal:['No top: a goal at any height.','A tape, eight feet up.','A solid crossbar, eight feet up.','7.32 m wide, 2.44 m high, and a net.'],
 hands:['Catch it, and mark the spot with your heel.','Feet only: no more catching.','The goalkeeper may use his hands.','The keeper’s hands stop at his penalty area.','Not from a team-mate’s back-pass.','Only the keeper, only in his box.'],
 offside:['In front of the ball = offside.','Three opponents ahead = onside.','Two opponents ahead = onside.','Level = onside.','Level = onside.'],
 throw:['A race: the first to the ball throws it.','No race: the other team throws it.','Two hands.','Two hands, from behind and over the head.'],
 fair:['No tripping, no hacking.','A referee takes charge.','Yellow and red cards.','A video screen helps the referee.','Tripping is still a foul.'],
};
