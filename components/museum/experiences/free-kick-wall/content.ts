import type {ChallengeId,KickResult,PartId} from './model';
/**
 * free-kick-wall · words. The case's own facts live in lib/endgame/museum.ts (rendered from `exhibit.facts`); everything here is
 * extra. Checked on Oct 14 2026 against the IFAB Laws of the Game (Law 13 Free Kicks, Law 1 The Field of Play), Wikipedia's
 * "Free kick (association football)" (1872 handball; 1903 direct free kick; 1913 six to ten yards; 2019 the 1 m rule; "Beginning
 * in the 2020s, teams often choose to deploy a player to lie behind the wall") and Wikipedia's "Vanishing spray" (marks the
 * 9.15 m; vanishes within a minute; first used at a World Cup on 12 June 2014, Brazil v Croatia). Kept short for ages 7–12.
 */
export const ACCENT='#2a5bd7';
export const BEATS=[
 {when:'1872',head:'A free kick for handball',text:'Free kicks for a foul first came in for handball. You could not score straight from one.'},
 {when:'1903',head:'The direct free kick',text:'Now some fouls gave a free kick you could shoot straight into the goal.'},
 {when:'1913',head:'Ten yards back',text:'Opponents had to stand 10 yards (9.15 m) from the ball, not 6.'},
 {when:'2019',head:'One metre from the wall',text:'Attackers may not stand right next to a wall of three or more defenders.'},
] as const;
export const HISTORY:readonly {tag:string;text:string}[]=[
 {tag:'1863',text:'The first Laws already had a free kick, but only for a “fair catch”, when a player caught the ball cleanly.'},
 {tag:'1872',text:'Free kicks for fouls began with handball. A goal could not be scored straight from that free kick.'},
 {tag:'1903',text:'The direct free kick arrived: after some fouls you could now shoot straight into the goal.'},
 {tag:'1913',text:'The distance for opponents went up from 6 yards to 10 yards, which is 9.15 metres.'},
 {tag:'2014',text:'Vanishing spray at the World Cup: the referee sprays a foam line at 9.15 m, and it disappears within a minute.'},
 {tag:'2019',text:'A new rule: attackers must stay at least 1 metre from a wall of three or more defenders until the ball is kicked.'},
 {tag:'2020s',text:'Teams often put a player lying down behind the wall, so a low shot cannot sneak under the wall when it jumps.'},
];
export const MODEL_NOTE='The bench is a teaching model, made up to show the idea: players are 0.5 m wide, a standing wall reaches 1.85 m, jumping lifts it 0.35 m, the keeper’s reach grows with the time the ball takes, and the ball slows and bends more and more as it flies. The 9.15 m, the 1 m and the goal’s 7.32 m × 2.44 m are real.';
export const SOURCES:readonly {title:string;url:string}[]=[
 {title:'IFAB Laws of the Game · Law 13 Free Kicks (9.15 m; the 1 m wall rule; direct and indirect)',url:'https://www.theifab.com/laws/latest/free-kicks/'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play (goal 7.32 m × 2.44 m)',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 {title:'Wikipedia · Free kick (association football): history, and the player lying behind the wall',url:'https://en.wikipedia.org/wiki/Free_kick_(association_football)'},
 {title:'Wikipedia · Vanishing spray (marks 9.15 m, vanishes within a minute, World Cup 2014)',url:'https://en.wikipedia.org/wiki/Vanishing_spray'},
];
export const RESULT_TEXT:Record<KickResult,{big:string;line:string;kind:'good'|'ok'|'bad'}>={
 goal:{big:'Goal!',line:'You beat the wall and the keeper.',kind:'good'},
 blocked:{big:'Blocked',line:'It hit the wall. Watch the dashed line: it must miss the players.',kind:'bad'},
 over:{big:'Over the bar',line:'Too much lift or too much power. Bring it down a little.',kind:'bad'},
 wide:{big:'Wide',line:'It missed the goal. Turn the turntable in, or use less curve.',kind:'bad'},
 post:{big:'Off the post!',line:'So close. Aim a touch further inside.',kind:'ok'},
 bar:{big:'Off the bar!',line:'So close. A little less lift.',kind:'ok'},
 saved:{big:'Saved',line:'The keeper got there. Go for the side the wall hides.',kind:'ok'},
};
export const CHALLENGES:Record<ChallengeId,{name:string;goal:string;tip:string;win:string;other:string}>={
 over:{name:'Over the wall',goal:'Four players stand still. Chip it OVER their heads and down under the bar.',
  tip:'Pull the lift lever towards you, and wind the power knob only about halfway: too hard and it flies over the bar.',
  win:'Up over the heads, then down: gravity and the air slow it and it drops under the bar.',other:'Goal! Now do it OVER the heads: lift it up and over.'},
 round:{name:'Round the wall',goal:'Five players, and they jump. Go ROUND the end of the wall instead.',
  tip:'Turn the turntable left so the dashed line passes outside the wall, then slide the contact pin LEFT of the middle: the ball curves right, back in.',
  win:'It started outside the wall and the spin bent it back in. That is curl.',other:'Goal! Now bend it ROUND the end of the wall.'},
 under:{name:'Under the jump',goal:'The wall jumps, and nobody is lying behind it. Keep it LOW and hard, under their feet.',
  tip:'Push the lift lever all the way down, wind up the power, and keep the contact pin in the middle.',
  win:'Under their feet while they were in the air! That is why teams now put a player lying down behind the wall.',other:'Goal! Now keep it LOW, under the jumping wall.'},
};
export const VIA_WORD={over:'over the wall',round:'round the wall',under:'under the wall'} as const;
/** The breakdown: the wall taken apart into its parts, each with the line that explains it. */
export const PART_NAME:Record<PartId,string>={line:'The foam line',players:'Shoulder to shoulder',jump:'The jump',lying:'Lying down',gap:'One metre clear'};
export const PART_TEXT:Record<PartId,string>={
 line:'The referee measures 9.15 m from the ball and sprays a foam line. The wall may not cross it. The foam vanishes within a minute.',
 players:'Defenders stand side by side to hide the near-post side of the goal. The keeper stands where he can see the ball and covers the rest.',
 jump:'As the ball is kicked the wall jumps. It reaches higher, but for a moment there is a gap under their feet.',
 lying:'Since the 2020s, teams often put a player lying down behind the wall, so a low shot cannot sneak under the jump.',
 gap:'Since 2019, with three or more in the wall, attackers must stand at least 1 metre away until the kick.',
};
export const CHECKS:readonly {q:string;options:readonly string[];right:number;why:string}[]=[
 {q:'How far from the ball must the wall stand?',options:['5 metres','9.15 metres (10 yards)','20 metres'],right:1,
  why:'Law 13: every opponent stays at least 9.15 m from the ball until it is kicked. The referee can measure it and spray a line.'},
 {q:'Why do some teams put a player lying down behind the wall?',options:['To rest','To stop a low shot under the jumping wall','To trick the referee'],right:1,
  why:'When the wall jumps there is a gap under their feet. The player lying down closes it.'},
 {q:'The referee raises an arm above the head. What kind of free kick is it?',options:['Direct: shoot straight in','Indirect: it must touch another player before a goal counts','A penalty'],right:1,
  why:'The raised arm means indirect. Straight into the goal from an indirect free kick is a goal kick, not a goal.'},
];
