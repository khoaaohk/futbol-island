/**
 * Animated lessons for the seven Explore reef balls (Oct 25 2026; user: "yes animated lesson cards under water cards"). Each reef
 * ball's Real football fact (lib/town/water/diveBalls.ts: the text, the credit and the checked source) gets the island ball format:
 * a three-step BallHuntLesson scene (problem / fact → what happens → payoff), short step lines, two step buttons and a practice
 * prompt. The facts say nothing the credited text does not (docs/explore-ball-lessons.md); no links (sources stay in diveBalls.ts).
 *
 * Pure data. ballLessonScenes.ts merges DIVE_BALL_SCENES into SCENES (so the same renderer, layouts and tests draw them);
 * BallHuntLesson shows DIVE_BALL_LESSONS[zone] for a reef ball (spot id `dive:<zone>`), over the dive (DiveHud).
 * Each lesson's topic words appear only in its own lesson here (tests/explore-balls.cjs counts this file as the feature's own).
 */
import type {Scene} from '../ballLessonScenes';
import type {BallLesson} from '../ballHuntLessons';

export const DIVE_BALL_SCENES={
 'oldest-ball':{cast:{a:[96,196,'You'],b:[238,150,'Mate']},ball:[165,64],steps:[
  {note:'Found behind old wooden panels',zones:[[104,34,122,60,'Stirling Castle','band']],tags:[[[165,118],'Made 1540-1570']]},
  {note:'Leather round a bladder full of air',at:{a:[140,104]},tags:[['ball','Leather + air']]},
  {note:'Patches: someone really played with it',at:{a:[150,92]},ball:'b',pulse:['b','Kicked!'],tags:[[[96,150],'Patched']]}]},
 'white-posts':{pitch:'attack',cast:{a:[200,114,'You'],xk:[165,42,'Keeper'],r:[92,104,'Referee']},ball:'a',steps:[
  {note:'Posts and bar: white, max 12 cm',tags:[[[110,40],'White · 12 cm']]},
  {note:'Crack! The crossbar breaks',ball:[176,24],pulse:[[176,26],'Stop!'],at:{r:[124,74]}},
  {note:'No rope · fix it or call it off',at:{r:[140,52],xk:[200,58]},tags:[['r','Fix it first']]}]},
 'fourth-official':{cast:{f:[165,206,'Fourth official'],s:[96,208,'Sub'],p:[226,150,'Player'],r:[150,104,'Referee']},ball:'p',steps:[
  {note:'Big matches: an official by the benches',zones:[[40,186,250,44,'Team benches','band']],tags:[['f','Helps the referee']]},
  {note:'Before kick-off: balls and kit checked',at:{f:[196,168]},tags:[['p','Kit checked']]},
  {note:'In the game: helps bring on a sub',at:{f:[150,206],s:[118,156]},pulse:['s','Sub on!']}]},
 'lamp-rigs':{cast:{g:[70,196,'Groundstaff'],p:[250,182,'Player']},ball:'p',steps:[
  {note:'The stands shade part of the grass',zones:[[14,22,302,74,'In the shade','danger']],tags:[[[165,150],'Sunny grass']]},
  {note:'Groundstaff wheel in a lamp rig',at:{g:[110,70]},zones:[[14,22,302,74,'In the shade','danger'],[60,40,104,40,'Lamp rig','space']]},
  {note:'The grass keeps growing, even in winter',at:{g:[220,70]},zones:[[14,22,302,74,'In the shade','danger'],[170,40,104,40,'Lamp rig','space']],pulse:[[222,52],'Growing!']}]},
 'cuju-net':{cast:{a:[118,186,'Player'],b:[232,176,'Player']},ball:'a',steps:[
  {note:'China, over 2,000 years ago: cuju',zones:[[100,34,130,44,'High net','band']],tags:[[[165,98],'A kicking game']]},
  {note:'The goal: a net hung high on two poles',at:{a:[150,136]},zones:[[100,34,130,44,'High net','band']],tags:[[[165,98],'Round hole']]},
  {note:'Kick it up through the hole!',ball:[165,56],zones:[[100,34,130,44,'High net','band']],pulse:[[165,56],'Through!']}]},
 'stitch-city':{cast:{s1:[66,168,'Stitcher'],s2:[156,196,'Stitcher'],p:[244,84,'Player']},ball:[110,150],steps:[
  {note:'Sialkot, Pakistan: the football city',zones:[[30,124,170,104,'Sialkot','band']],tags:[[[230,140],'Hand-stitched']]},
  {note:'Panels sewn together by hand',at:{s1:[84,150],s2:[140,166]},zones:[[30,124,170,104,'Sialkot','band']],tags:[['ball','Stitch by stitch']]},
  {note:'Made there too: the 2026 World Cup ball',ball:'p',pulse:['p','Official ball!']}]},
 'tifo-picture':{cast:{f1:[66,58],f2:[130,58],f3:[200,58],f4:[264,58],a:[165,192,'Player']},ball:'a',steps:[
  {note:'Fans in the stands, each with a card',zones:[[30,26,270,64,'Stands','band']],dim:['f1','f2','f3','f4']},
  {note:'Everyone holds up a card at once',at:{f1:[80,50],f2:[136,50],f3:[194,50],f4:[250,50]},zones:[[30,26,270,64,'Stands','band']],tags:[[[165,110],'Hold it up!']]},
  {note:'Many small cards make one huge picture',at:{a:[165,156]},zones:[[30,26,270,64,'One giant picture','space']],links:[['f1','f2','f3','f4']],pulse:[[165,40],'Wow!']}]},
} satisfies Record<string,Scene>;

const L=(kind:keyof typeof DIVE_BALL_SCENES,family:BallLesson['family'],a:string,b:string,c:string,x:string,y:string):BallLesson=>({kind,family,level:2,steps:[a,b,c],actions:[x,y]});

/** One lesson per reef zone (diveBalls.ts `spot`). Level 2 word limits (≤ 18 words a step), as for a far island ball. */
export const DIVE_BALL_LESSONS:Record<string,BallLesson>={
 'captains-cup':L('oldest-ball','Football history','This ball hid behind wooden panels in Stirling Castle, Scotland, for hundreds of years.','It was made around 1540 to 1570: leather stitched round a pig’s bladder full of air.','It has patches, so someone really kicked it about. It is the oldest football ever found.','See what it’s made of','See how it was used'),
 'pauls-grotto':L('white-posts','Rules of the game','Goalposts and the crossbar must be white, and no thicker than 12 cm.','A shot cracks the crossbar. If it breaks in a match, play stops until it is fixed.','A rope is not allowed instead. If the bar cannot be fixed, the match is called off.','Take the shot','See what happens'),
 'kelp-trawler':L('fourth-official','Rules of the game','Big matches have a fourth official, who stands beside the team benches.','Before kick-off, the fourth official helps check the match balls and the players’ equipment.','During the game they help with substitutes. In some competitions they replace a hurt referee.','Check the kit','Bring on the sub'),
 'ray-meadow':L('lamp-rigs','Football world','Grass needs sunlight. In a big stadium, the roof and stands shade part of the pitch.','Groundstaff wheel huge lamp rigs over the shady grass and switch them on.','The lamps give the grass light, so it keeps growing even in the dark days of winter.','Wheel in the lamps','Move them along'),
 'moon-arch':L('cuju-net','Football history','Over 2,000 years ago in China, people played cuju, a kicking game.','In one version, the goal was a net hung high between two tall poles.','The net had a round hole in the middle. Players aimed to kick the ball through it.','See the goal','Aim for the hole'),
 'ball-crate':L('stitch-city','Football world','Most of the world’s hand-stitched footballs come from one city: Sialkot in Pakistan.','Skilled stitchers sew the ball’s panels together by hand, one stitch at a time.','The official ball of the 2026 World Cup was made in Sialkot too.','Watch the stitchers','Send the ball out'),
 'turtle-pool':L('tifo-picture','Football world','A tifo is a giant picture made by fans in the stands.','Thousands of people hold up coloured cards or flags at the same moment.','Together the small cards make one huge image, like the plates on a turtle shell.','Hold up the cards','See the picture'),
};

/** "Try it" prompts (BallHuntLesson's practice mode), one per reef ball. */
export const DIVE_BALL_PRACTICE:Record<string,string>={
 'captains-cup':'Old balls were leather round a pig’s bladder. What is inside your ball to keep it round?',
 'pauls-grotto':'The crossbar breaks in your match. Can you tie a rope there instead? What happens next?',
 'kelp-trawler':'Name two jobs the fourth official does: one before kick-off and one during the game.',
 'ray-meadow':'Half the pitch is in the shade of the stands all winter. How can groundstaff help that grass?',
 'moon-arch':'In cuju the goal was a hole high up in a net. How would you kick the ball up through it?',
 'ball-crate':'Look at your ball’s panels. Are they stitched or glued? Which city stitches most balls by hand?',
 'turtle-pool':'Plan a tifo with your friends: what picture would you make, and what colour is your card?',
};
