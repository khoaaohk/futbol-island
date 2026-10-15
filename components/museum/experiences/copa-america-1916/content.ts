/**
 * copa-america-1916 · the words. The case's own facts and "take it to your game" line live in lib/endgame/museum.ts and are shown
 * word for word; these are the sourced extras, the story beats and the quick check. Checked Oct 14 2026 against the sources below.
 */
export const EXTRA={
 conmebol:'During the 1916 tournament, on 9 July, the four football associations met and founded CONMEBOL, South America’s football confederation.',
 gradin:'Uruguay’s Isabelino Gradín was the top scorer, with 3 goals.',
 name:'It was called the South American Championship until 1975, when it took the name Copa América.',
 asia:'The AFC Asian Cup began in 1956, in Hong Kong, and is the second-oldest continental championship.',
 trophy:'The trophy was bought in 1916 from a jewellery shop in Buenos Aires, for 3,000 Swiss francs. It is a silver cup, 77 cm tall and 9 kg, on a three-level wooden base with a plaque for every winner.',
 others:'Africa’s Cup of Nations began in 1957 (Egypt won, in Sudan), Europe’s championship in 1960 (the Soviet Union won, in France), CONCACAF’s in 1963 and Oceania’s in 1973.',
} as const;
export const SOURCES=[
 {title:'Wikipedia · 1916 South American Championship',url:'https://en.wikipedia.org/wiki/1916_South_American_Championship'},
 {title:'Wikipedia · Copa América',url:'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica'},
 {title:'Wikipedia · AFC Asian Cup',url:'https://en.wikipedia.org/wiki/AFC_Asian_Cup'},
 {title:'Wikipedia · Africa Cup of Nations',url:'https://en.wikipedia.org/wiki/Africa_Cup_of_Nations'},
 {title:'Wikipedia · 1960 European Nations’ Cup',url:'https://en.wikipedia.org/wiki/1960_European_Nations%27_Cup'},
 {title:'Wikipedia · CONCACAF Gold Cup',url:'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup'},
 {title:'Wikipedia · OFC Men’s Nations Cup',url:'https://en.wikipedia.org/wiki/OFC_Men%27s_Nations_Cup'},
] as const;
export const BEATS=[
 {when:'July 1916 · Argentina',head:'Four teams',text:'Argentina, Brazil, Chile and Uruguay played the first South American Championship.'},
 {when:'Still running',head:'The oldest cup for nations',text:'Today it is the Copa América, the oldest continental tournament for national teams still played.'},
 {when:'Your job',head:'Run the machine',text:'Crank the fixture drum through the 1916 matches, slide along the timeline, then lift the trophy apart.'},
] as const;
export const CHECKS=[
 {q:'Which is the oldest continental cup for national teams still played?',options:['The Copa América','The European Championship','The Africa Cup of Nations'],right:0,
  why:'It began in 1916 as the South American Championship, 40 years before the next one, Asia’s, in 1956.'},
 {q:'Who won the first South American Championship in 1916?',options:['Uruguay','Argentina','Brazil'],right:0,
  why:'Uruguay: two wins and a draw, 5 points, one more than Argentina.'},
 {q:'In a round robin of four teams, how many matches does each team play?',options:['3','2','6'],right:0,
  why:'Everyone plays everyone once: three games each, six games in all. On the map plate, the six threads joined every pair of pegs.'},
 {q:'Until 1979, what did the Copa América trophy stand on?',options:['Nothing: it had no base','A three-level wooden base','A gold plinth'],right:0,
  why:'Its wooden base came later: first one level, then two, and now three, with a plaque for every winner.'},
] as const;
export const MODEL_NOTE='The machine is a model made for this museum: the drum, the flip table and the map plate with its pegs are teaching tools, and the map is simplified. The years, hosts, winners, 1916 scores and the trophy facts are real. The peg colours are just colours, not the 1916 shirts.';
