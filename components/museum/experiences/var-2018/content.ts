/**
 * var-2018 copy. The four CASE_FACTS are the case's own facts in lib/endgame/museum.ts, word for word (the test checks). The
 * rest is new, true and cited in SOURCES below. The replay is a made-up PRACTICE moment, never a real match.
 */
export const CASE_FACTS={
 first:'The video assistant referee (VAR) was first used at a men’s World Cup in 2018, in Russia.',
 checks:'VAR can only help with clear mistakes about goals, penalties, straight red cards and mistaken identity.',
 decides:'The referee on the pitch still makes the final decision.',
 rule:'A goal counts only when the whole ball has crossed the whole goal line, between the posts and under the crossbar.',
} as const;
export const FOR_YOUR_GAME='Play to the whistle: keep going until the referee stops the game.';
export const PRACTICE_NOTE='Practice replay: a made-up moment, not a real match.';

/** "Can VAR check it?" Four yes (IFAB VAR protocol) and two no (a second yellow and a corner kick are not reviewable). */
export const CHECKS:readonly {label:string;yes:boolean;why:string}[]=[
 {label:'Goal or no goal',yes:true,why:'VAR checks every goal.'},
 {label:'Penalty or no penalty',yes:true,why:'Yes, a penalty decision.'},
 {label:'Straight red card',yes:true,why:'Yes, a straight red card.'},
 {label:'Wrong player booked',yes:true,why:'Yes: mistaken identity.'},
 {label:'Corner or goal kick',yes:false,why:'No: not a match-changing decision.'},
 {label:'Second yellow card',yes:false,why:'No: only straight reds.'},
];

export const OFFSIDE_LAW='You are offside if any part of your head, body or feet is nearer the goal line than both the ball and the second-last opponent when a teammate plays the ball. Hands and arms don’t count. Level is onside.';
export const IFAB_QUOTE='The final decision is always taken by the referee.';
export const IFAB_MOTTO='Minimum interference – maximum benefit.';

/** Real history (not the practice replay): the first penalty given with VAR at a World Cup. */
export const REAL_CASE={
 when:'16 June 2018 · Kazan, Russia',
 match:'France 2–1 Australia',
 story:[
  'Antoine Griezmann was tackled in the penalty area. Referee Andrés Cunha from Uruguay thought it was a fair tackle and let play go on.',
  'VAR asked him to look again. He stopped the game, went to the screen by the pitch and watched the replay himself.',
  'Then he decided: penalty. It was the first penalty ever given with VAR at a World Cup. Griezmann scored it.',
 ],
 lesson:'VAR spotted it. The referee decided it.',
};
export const TOURNAMENT_NUMBERS='In the first 62 matches of Russia 2018, VAR quietly made more than 440 checks, but asked for a second look only 19 times.';

export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'IFAB Laws of the Game · Video Assistant Referee (VAR) protocol',url:'https://www.theifab.com/laws/latest/video-assistant-referee-var-protocol/'},
 {title:'IFAB Laws of the Game · Law 10 Determining the Outcome of a Match',url:'https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/'},
 {title:'IFAB Laws of the Game · Law 11 Offside',url:'https://www.theifab.com/laws/latest/offside/'},
 {title:'Sports Illustrated · VAR used at World Cup for first time, grants France penalty (16 June 2018)',url:'https://www.si.com/soccer/2018/06/16/france-australia-world-cup-var-first-video-replay-griezmann-penalty-kick'},
 {title:'Euronews · Griezmann scores first ever World Cup penalty by VAR (16 June 2018)',url:'https://www.euronews.com/2018/06/16/griezmann-scores-first-ever-world-cup-penalty-by-var'},
 {title:'Africanews · Russia 2018: the World Cup where VAR made the difference (13 July 2018)',url:'https://www.africanews.com/2018/07/13/russia-2018-the-world-cup-where-var-made-the-difference/'},
 {title:'Gulf News · VAR cleaning up football, say Fifa (2018)',url:'https://gulfnews.com/amp/story/sport%2Ffootball%2Fvar-cleaning-up-football-say-fifa-1.2251188'},
 {title:'Wikipedia · Video assistant referee',url:'https://en.wikipedia.org/wiki/Video_assistant_referee'},
 {title:'Wikipedia · 2018 FIFA World Cup',url:'https://en.wikipedia.org/wiki/2018_FIFA_World_Cup'},
];
