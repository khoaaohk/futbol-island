/**
 * throw-in · words. The case's own facts live in lib/endgame/museum.ts (rendered from `exhibit.facts`); everything here is extra.
 * Checked on Oct 14 2026 against IFAB Law 15 The Throw-in (who throws, how to stand and throw, no goal direct, 2 m, a foul throw
 * is retaken by the other team) and Wikipedia's "Throw-in" (1863: the first player to touch the ball threw it in, at right
 * angles to the touchline; 1877: any direction; 1883: two hands). Kept short and clear for ages 7–12.
 */
export const ACCENT='#1f8a5b';
export const BEATS=[
 {when:'1863',head:'The first throw-in',text:'The first player to reach the ball threw it in, straight out at right angles.'},
 {when:'1877',head:'Any direction',text:'The throw could now go any way you liked.'},
 {when:'1883',head:'Two hands',text:'From now on, the ball is thrown with both hands.'},
 {when:'Today',head:'Law 15',text:'Face the pitch, feet on or behind the line, two hands, over the head.'},
] as const;
export const HISTORY:readonly {tag:string;text:string}[]=[
 {tag:'1863',text:'In the first FA Laws, the first player to touch the ball after it went out threw it in, from where it left the pitch, at right angles to the touchline.'},
 {tag:'1877',text:'The throw-in could now go in any direction, not only straight out at right angles.'},
 {tag:'1883',text:'The Laws said the ball must be thrown with both hands. Scotland had made the change a year before.'},
 {tag:'Today',text:'Law 15: face the pitch, part of each foot on the touchline or on the ground behind it, both hands, from behind and over the head. Opponents stand at least 2 m away.'},
];
export const MODEL_NOTE='The trainer is a teaching model: the throw lengths and where the players stand are made up but sensible. The four checks the referee’s box makes, the 2 m and the history are real (IFAB Law 15).';
export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'IFAB Laws of the Game · Law 15 The Throw-in',url:'https://www.theifab.com/laws/latest/the-throw-in/'},
 {title:'Wikipedia · Throw-in (history: 1863, 1877, 1883)',url:'https://en.wikipedia.org/wiki/Throw-in'},
];
export const RESULT:Record<'caught'|'intercepted'|'loose'|'foul',{big:string;line:string;kind:'good'|'ok'|'bad'}>={
 caught:{big:'Got it!',line:'Right to your team-mate. That is a good throw-in.',kind:'good'},
 intercepted:{big:'Intercepted',line:'A defender got there first. Throw to the free player.',kind:'bad'},
 loose:{big:'Nobody there',line:'Nobody could reach it. Turn the aim dial or change the power.',kind:'bad'},
 foul:{big:'Foul throw!',line:'The referee blows the whistle: the other team takes the throw-in.',kind:'bad'},
};
export const CHECKS:readonly {q:string;options:readonly string[];right:number;why:string}[]=[
 {q:'The ball goes out off a red player. Who takes the throw-in?',options:['The red team','The blue team','Whoever gets there first'],right:1,
  why:'The throw-in goes to the opponents of the player who touched the ball last.'},
 {q:'Which of these throws is a foul throw?',options:['Two hands, over the head','One foot lifted off the ground','Both feet behind the line'],right:1,
  why:'Part of each foot must be on the touchline or on the ground behind it when you let go.'},
 {q:'You throw the ball straight into the other team’s goal. What happens?',options:['Goal!','A goal kick to the other team','A penalty'],right:1,
  why:'You can’t score straight from a throw-in. Into their goal is a goal kick; into your own goal is a corner.'},
];
/** The exploded mannequin's four layers: what each part of the body must do (IFAB Law 15). */
export const LAYER_TEXT:Record<'feet'|'body'|'arms'|'ball',{n:number;head:string;text:string}>={
 ball:{n:4,head:'Hands',text:'Both hands on the ball.'},
 arms:{n:3,head:'Arms',text:'Start with the ball behind your head, then throw it over your head.'},
 body:{n:2,head:'Body',text:'Stand facing the pitch.'},
 feet:{n:1,head:'Feet',text:'Part of each foot on the touchline or behind it, and touching the ground. Heel up is fine.'},
};
