/**
 * Trophy room · the case's words and sources (Oct 5 2026 Hall of Fame; Oct 12 2026 the room became the Trophy room; Oct 14 2026
 * the player's own shelf of cups and certificates was removed — the room is now purely the eight real trophies). Pure, so
 * tests/museum-exp-hall-of-fame.cjs can read it.
 */
export const COPY={
 kicker:'Today · the last room in the museum',
 title:'Trophy room',
 /** The registry still calls the case 'Your Hall of Fame' (lib/endgame/museum.ts); the room's own wall label says this. */
 /** The case's own facts and takeaway (lib/endgame/museum.ts), word for word. */
 fact1:'This cabinet holds eight of football’s greatest trophies, drawn at their true size.',
 fact2:'Graduate all four paths to board the Matchday Ferry for your Matchday final.',
 takeaway:'Learning football is a journey: futsal, 7v7, 9v9 and 11v11 all teach the same big ideas in different spaces.',
 gameNote:'The Matchday Ferry is part of the Futbol Island game. The player counts are real football rules.',
 trophyNote:'The eight trophies are drawn by us from their real shapes and sizes, turned on a lathe in centimetres; small details are left off. Every height, weight and story comes from the sources below. The Africa Cup of Nations trophy has no published height or weight, so we never measure or weigh it.',
};

export const SOURCES=[
 {title:'IFAB Laws of the Game, Law 3: The Players (eleven players a side, one is the goalkeeper)',url:'https://www.theifab.com/laws/latest/the-players/'},
 {title:'The FA, Futsal Laws of the Game, Law 3: The Number of Players (five players a side, one is the goalkeeper)',url:'https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-3---the-number-of-players'},
];
