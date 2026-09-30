/**
 * Beach soccer teaching for the live match on Coral Cay's court (components/BeachMatchGuide.tsx). Pure data.
 * Every rule below matches the Coral Cay islanders (lib/town/coralCayNpcs.ts), checked on Sep 29 2026 against the
 * FIFA Beach Soccer Laws of the Game 2024-25 (Law 3 players/substitutions, 4 equipment, 7 duration, 10 extra time and
 * penalties, 11 no offside, 12 goalkeeper and overhead kicks, 15 kick-in):
 * https://www.the-aiff.com/media/uploads/2024/11/Beach-Soccer-Laws-of-the-Game-2024-25.pdf
 * and FIFA's "Brief guide to beach soccer rules" (no draws in FIFA competitions). The sim's own feed lines
 * (lib/town/match/matchSim.ts teach(), choreo.ts) use the same wording.
 */
export type BeachQuestion={q:string;options:string[];correct:number;explain:string};

/** What to look for in the live match: each one is announced in the commentary when it happens. */
export const BEACH_WATCH_FOR=[
 {id:'overhead',title:'Overhead kicks.',text:'The laws protect a player trying one: nobody may unfairly stop it.'},
 {id:'keeper',title:'Keeper throws.',text:'Attacks start from the hands, within 4 seconds, and never a kick from the hands.'},
 {id:'kickin',title:'Kick-ins.',text:'Ball out on the side? Kick it in or throw it in, your choice.'},
 {id:'offside',title:'No offside.',text:'Attackers can wait anywhere, so defenders keep talking.'},
] as const;

export const BEACH_QUIZ:readonly BeachQuestion[]=[
 {q:'How many players does each team have on the sand?',options:['Five, including the keeper','Five, plus a keeper','Seven, including the keeper'],correct:0,
  explain:'Beach soccer is five a side, and one of the five is the goalkeeper. Substitutions are unlimited, even while the ball is moving.'},
 {q:'The ball goes out over the touchline. How can the team restart?',options:['Only with a throw-in','Kick it in or throw it in: their choice','Only with a kick-in, like futsal'],correct:1,
  explain:'The taker chooses a kick-in or a throw-in and has 4 seconds. A kick-in that goes straight into the goal doesn’t count.'},
 {q:'A striker waits behind the last defender and gets the ball. What happens?',options:['Offside: a free kick to the defenders','A drop ball','Play on: beach soccer has no offside'],correct:2,
  explain:'There is no offside in beach soccer, so attackers can stand anywhere. Defenders must keep talking about who is free.'},
 {q:'The keeper catches the ball. What can they do?',options:['Throw or roll it to a teammate within 4 seconds','Drop it and volley it up the pitch','Hold it as long as they like'],correct:0,
  explain:'Beach keepers start attacks with their hands and have 4 seconds. Kicking the ball out of the hands isn’t allowed, and a throw can’t go straight in.'},
 {q:'A player tries an overhead kick near an opponent. What do the laws say?',options:['Overhead kicks are banned on sand','Only keepers may try them','Opponents may not unfairly stop an overhead kick'],correct:2,
  explain:'Scissor and overhead kicks are part of beach soccer and must be protected. At the 2024 FIFA Beach Soccer World Cup, 37 goals came from bicycle kicks.'},
 {q:'It’s level after three periods in a FIFA match. What happens next?',options:['The match ends in a draw','3 minutes of extra time, then penalties if still level','The next goal wins straight away'],correct:1,
  explain:'FIFA beach matches need a winner: 3 minutes of extra time (no golden goal), then five penalties each and sudden death.'},
];
