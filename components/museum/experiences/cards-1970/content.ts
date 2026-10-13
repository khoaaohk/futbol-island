/**
 * cards-1970 · the content: real history (1966 → 1970 → 1974), Law 12's ladder, the quick check and the sources. Every history
 * line is true and sourced in SOURCES (facts copied from lib/endgame/museum.ts are word for word, tests/museum-exp-cards-1970.cjs
 * checks it). The practice moments of the ref game (Oct 12 2026 anatomy Paper rebuild) live in model.ts: they are made-up
 * moments acted by paper mannequins and judged by the IFAB Laws of the Game, Law 12 (Fouls and Misconduct). No real players.
 */
export type Call='none'|'yellow'|'red';

// ---- History ------------------------------------------------------------------------------------------------------------
/** Copied word for word from the cards-1970 case (lib/endgame/museum.ts). */
export const CASE_FACTS={
 mexico:'Yellow and red cards were first used at the 1970 World Cup in Mexico.',
 aston:'English referee Ken Aston had the idea while waiting at traffic lights: yellow means careful, red means stop.',
 language:'Cards showed every player and fan the referee’s decision, whatever language they spoke.',
 forYourGame:'A yellow card is a warning. Stay calm and keep playing fairly.',
};
/** The 1966 story that led to the idea (sources: FIFA, Referee.com). */
export const STORY_1966=[
 'London, 1966. At the World Cup, England played Argentina.',
 'The German referee sent off Argentina’s captain, Antonio Rattín. They did not speak the same language, and Rattín would not leave the pitch.',
 'After the game, England’s Jack Charlton found out from a newspaper that he had been warned.',
 'Ken Aston was in charge of the World Cup referees. Driving home, he stopped at the traffic lights on Kensington High Street…',
];
/** The manga narration box over the street panel, one per story beat (same sources). */
export const STORY_TAGS=['1966 · the World Cup in England','Wembley · England v Argentina','After the game','Kensington, London · the drive home'];
/** Full time quick check: the history, in three questions (answers from CASE_FACTS and TWO_YELLOWS). Right answers move about. */
export const CHECK:{q:string;options:string[];right:number;why:string}[]=[
 {q:'Where did Ken Aston get the idea for the cards?',options:['From a card game','At a set of traffic lights','From a dream'],right:1,
  why:'He was waiting at traffic lights on Kensington High Street: yellow means careful, red means stop.'},
 {q:'Why were colours a good idea at a World Cup?',options:['Every player and fan understands a colour, whatever language they speak','Cards are cheaper than whistles','Fans like bright colours'],right:0,
  why:'In 1966 a player and the referee did not speak the same language. A card says it without words.'},
 {q:'What do two yellow cards in one game make?',options:['Nothing, you start again','A green card','A red card'],right:2,
  why:'Two yellow cards in one game make a red card: the player must leave the pitch.'},
];
/** After 1970 (sources: Topend Sports World Cup firsts, Guinness World Records). */
export const FIRSTS=[
 'The first yellow card at a World Cup went to Evgeny Lovchev of the Soviet Union, in the opening game of 1970.',
 'Nobody was shown a red card at the 1970 World Cup.',
 'The first World Cup red card came in 1974, for Carlos Caszely of Chile.',
];
/** Law 12's ladder, matched to the three lamps. */
export const LADDER:{call:Call;word:string;card:string;plain:string}[]=[
 {call:'none',word:'Careless',card:'Free kick, no card',plain:'A clumsy foul, without enough care.'},
 {call:'yellow',word:'Reckless',card:'Yellow card: a warning',plain:'Not caring about the danger to the other player.'},
 {call:'red',word:'Excessive force',card:'Red card: off',plain:'Too much force: it puts a player’s safety in danger.'},
];
export const TWO_YELLOWS='Two yellow cards in one game make a red card.';

export const SOURCES:{title:string;url:string}[]=[
 {title:'IFAB Laws of the Game · Law 12 Fouls and Misconduct',url:'https://www.theifab.com/laws/latest/fouls-and-misconduct/'},
 {title:'FIFA · 1966 World Cup: Gripping tales and inspirational traffic lights',url:'https://inside.fifa.com/news/1966-world-cup-gripping-tales-and-inspirational-traffic-lights-2812820'},
 {title:'Referee.com · 1966 World Cup: the Wembley debacle that gave soccer its card system',url:'https://www.referee.com/1966-world-cup-england-argentina-card-system/'},
 {title:'Topend Sports · World Cup football firsts',url:'https://www.topendsports.com/events/worldcupsoccer/firsts.htm'},
 {title:'Guinness World Records · First player to receive a red card at the FIFA World Cup',url:'https://www.guinnessworldrecords.com/world-records/482316-first-player-to-receive-a-red-card-at-the-fifa-world-cup'},
 {title:'Wikipedia · Ken Aston',url:'https://en.wikipedia.org/wiki/Ken_Aston'},
 {title:'Wikipedia · Penalty card',url:'https://en.wikipedia.org/wiki/Penalty_card'},
];
