import type {MuseumSource} from '@/lib/endgame/museum';
/**
 * Extra real history for the back-pass room, each line checked against the sources below (Oct 5 2026; the Bonner line re-checked Oct 9 2026: his Wikipedia page
 * doesn't give the time, Balls.ie does: "held the ball for almost six minutes"). The case's own three
 * facts and its "take it to your game" line come from lib/endgame/museum.ts through the exhibit prop.
 */
export const HISTORY:{year:string;text:string}[]=[
 {year:'1990',text:'At the 1990 World Cup in Italy, teams scored only 2.21 goals a game. It is still the lowest of any World Cup.'},
 {year:'1990',text:'In a 1990 World Cup game against Egypt, Ireland’s keeper Packie Bonner is said to have held the ball for almost six minutes. Moments like that led to the new law.'},
 {year:'1992',text:'The new law does not ban passing back. A keeper can still receive a back-pass, but must play it with the feet. A header or a chest pass back is allowed, because the law is about kicks.'},
 {year:'1992',text:'If a keeper handles a ball a team-mate deliberately kicked back, the other team gets an indirect free kick.'},
 {year:'1997',text:'The law grew in 1997: a keeper may not handle a ball thrown straight to them from a team-mate’s throw-in either.'},
 {year:'2025',text:'The fight against time-wasting goes on. Since 2025, a keeper who holds the ball for more than eight seconds gives the other team a corner kick.'},
];
export const EXTRA_SOURCES:MuseumSource[]=[
 {title:'Wikipedia · 1990 FIFA World Cup',url:'https://en.wikipedia.org/wiki/1990_FIFA_World_Cup'},
 {title:'Wikipedia · Packie Bonner',url:'https://en.wikipedia.org/wiki/Packie_Bonner'},
 {title:'Balls.ie · Packie Bonner and others who helped inspire rule changes in their sport',url:'https://www.balls.ie/football/rule-changes-sport-360063'},
 {title:'Sky Sports · Eight-second rule to reduce time-wasting by goalkeepers approved',url:'https://www.skysports.com/football/news/11095/13321150/eight-second-rule-to-reduce-time-wasting-by-goalkeepers-approved-for-next-season'},
];
/** The little game is our own invention, not footage: said plainly in the panel. */
export const FICTION_NOTE='“Kill the Clock” and “Beat the press” are little games we made to show the idea. The facts on this page are real history.';
/** The ref's calls (kept from the Oct 10 quick check, Quiz.tsx): the score screen asks one; the room's story lists the rest. */
export type Call={q:string;options:readonly string[];answer:number;why:string};
export const CALLS:readonly Call[]=[
 {q:'Your team-mate KICKS the ball back to the keeper on purpose. Can the keeper pick it up?',options:['Yes, hands are fine','No: feet only'],answer:1,
  why:'Since 1992 the keeper must play it with the feet. If he handles it, the other team gets an indirect free kick.'},
 {q:'Your team-mate HEADS the ball back to the keeper. Can the keeper pick it up?',options:['Yes','No'],answer:0,
  why:'Yes! The law is about kicks, so a header or a chest pass back is allowed. A trick, like flicking it up to head it back, is not.'},
 {q:'Why was the law changed in 1992?',options:['To give keepers a rest','To stop teams wasting time','To score more headers'],answer:1,
  why:'Under the old law a keeper could hold the ball while nobody was allowed to tackle him. The new law kept the ball moving.'},
 {q:'1997: a team-mate takes a throw-in straight to the keeper. Can he catch it?',options:['Yes','No'],answer:1,
  why:'No. In 1997 the law grew: a throw-in from a team-mate can’t be handled by the keeper either.'},
];
