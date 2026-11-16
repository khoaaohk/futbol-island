import type {Faq} from '../safety';
import {grid,type GridScene,type RawGrid} from '../grid';
/**
 * Scan Trainer's front door (Nov 16 2026; docs/scan-trainer/HANDOFF.md): /tools/soccer-scanning-trainer and its Spanish twin.
 * The app itself is /scan (app/scan, noindex). All words here are our own: the common training idea (a phone on a cone
 * shows a cue, the player looks and calls it) written up from the Futbol Island lessons on receiving and support. Spanish words
 * are in lib/i18n/es/scanTrainer.ts, keyed 1:1 (tests/scan-trainer.cjs checks the arrays match).
 * Query targets: "soccer scanning drill", "scanning app for soccer", "check your shoulder drill", "soccer awareness training".
 */
export const SCAN_APP_PATH='/scan';
export const SCAN_SLUG='soccer-scanning-trainer';
export const SCAN_PATH=`/tools/${SCAN_SLUG}`;
export const SCAN_IMAGE='/tools/soccer-scanning-trainer.png';
export const SCAN_IMAGE_SIZE={width:1200,height:630};
export type ScanDrill={id:string;ages:string;players:string;setting:string;scene:RawGrid;steps:readonly string[];point:string};
/** Interval guide by age (seconds between changes, the cue type, a session): the same numbers as the app's presets (lib/scan/engine.ts PRESETS). */
export type AgeRow={age:string;every:number;cue:string;session:string};
export type ScanPage={crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;openLabel:string;openLine:string;
 whatTitle:string;what:readonly string[];howTitle:string;how:readonly string[];ageTitle:string;ageIntro:string;ageHead:readonly string[];ages:readonly AgeRow[];
 settingsTitle:string;settings:readonly string[];drillsTitle:string;drillsIntro:string;drills:readonly ScanDrill[];tipsTitle:string;tips:readonly string[];
 privacy:string;faqTitle:string;faq:readonly Faq[];relatedTitle:string;previewCaption:string;features:readonly string[];secWord:(n:number)=>string;labels:{ages:string;players:string;setting:string;point:string}};
export const SCAN_EN:ScanPage={crumb:'Scanning trainer',title:'Soccer Scanning Trainer: Free Check-Your-Shoulder App',h1:'Soccer scanning trainer',
 description:'A free soccer scanning app for practice: prop a phone on a cone and it flashes colors, numbers, arrows or a pass to call out. Six drills inside.',
 lead:'Scanning is a quick look away from the ball, over the shoulder, to see teammates, opponents and space before the ball arrives. Prop a phone on a cone behind your player and this free trainer shows a new color, number, arrow or pass every few seconds. The player looks, calls it out, and plays.',
 blurb:'A phone on a cone flashes colors, numbers, arrows or passes for players to call out',
 openLabel:'Open Scan Trainer',openLine:'Full screen on your phone, works offline, no account. Add it to your home screen.',
 whatTitle:'What is scanning in soccer?',
 what:['Scanning means turning the head to look around the field while the ball is somewhere else: before a pass is played to you, while it is rolling, and again just before it arrives. Coaches call it checking your shoulder. A player who has looked already knows where the nearest opponent is and where a free teammate stands, so the first touch can go the right way.',
  'Children rarely do it on their own. The ball is the most interesting thing on the field, so their eyes stay on it. Scanning has to be practiced like any other skill, and the simplest way is to put something behind the player that is worth looking at. That is what this trainer is: a big, changing cue that only makes sense if the player turns the head to see it.'],
 howTitle:'How to use the scanning trainer',
 how:['Open Scan Trainer on a phone and pick an age group. It sets a sensible speed and type of cue; change anything you like after.',
  'Choose what to show: colors (use the colors of the cones you own), numbers, arrows, a mix, or Pass it, which shows a teammate’s number and the direction they are in.',
  'Turn the screen brightness up and prop the phone upright on a tall cone or a water bottle, 5 to 10 yards behind the player who will receive, facing the field. In bright sun, put it in the shade of a bag.',
  'Press Start. After a 3-2-1 count the cue changes every few seconds. The player checks over the shoulder, shouts what they see, then plays the ball.',
  'Tap the screen once to pause. At the end you see how many cues were shown. Turn on the coach score to tap ✓ or ✗ after each call and get a result to beat next time.'],
 ageTitle:'How fast should the cues change?',
 ageIntro:'Slow enough that the player can look, call and still control the ball. If they miss most calls, add a second; if they are bored, take half a second away. These are the starting points the age presets use.',
 ageHead:['Age group','Change every','Cue','Session'],
 ages:[{age:'U8',every:3.5,cue:'Colors',session:'60 s'},{age:'U10',every:3,cue:'Colors',session:'90 s'},{age:'U12',every:2.5,cue:'Mix of colors, numbers and arrows',session:'90 s'},
  {age:'U14 and older',every:2,cue:'Pass it (teammate and direction)',session:'3 min'},{age:'Adults',every:1.5,cue:'Mix, numbers 0 to 99, eight arrows',session:'3 min'}],
 settingsTitle:'What you can change',
 settings:['Change every 1 to 6 seconds, in half seconds.','Your cone colors, from nine common ones. The color name can be written on screen too, so players who see colors differently can join in.',
  'Numbers from 1 to 9, 1 to 20 or 0 to 99, and which arrow directions appear (forward, back, left, right and the diagonals).','Colored background on or off, a soft sound on each change (tick, pop or bell) or silence, and a session of 60 seconds, 90 seconds, 3 minutes or endless.'],
 drillsTitle:'Six scanning drills to run with it',
 drillsIntro:'Each drill uses one phone. Start with the first two with young players; the rest add a decision to the look.',
 drills:[
  {id:'scan-and-call',ages:'U8 and up',players:'Groups of 3',setting:'Colors, every 3 s',
   scene:{w:12,l:20,title:'Scan and call',caption:'A passer plays to the receiver in the middle. The phone sits on a cone behind the receiver (the shaded box), and the receiver glances back and calls the color before each pass arrives.',
    who:'A@50,8 B@50,52 C@50,96',balls:'50,13',passes:['50,15>50,46'],zones:[[44,80,56,86]],cones:'50,78'},
   steps:['The passer and the receiver stand 10 yards apart. The phone stands on a cone 6 yards behind the receiver; the third player waits by it.','Every time the passer touches the ball, the receiver looks over a shoulder and shouts the color on the screen.','Only then does the receiver check back to the ball, control it and pass it back.','After ten passes, rotate: receiver to passer, passer to the phone, the third player in.'],
   point:'The look happens while the ball travels, not when it is already at the feet.'},
  {id:'check-and-turn',ages:'U10 and up',players:'Groups of 3',setting:'Arrows, left and right only, every 3 s',
   scene:{w:20,l:20,title:'Check and turn',caption:'The receiver checks the arrow on the phone behind, takes the first touch the way it points and dribbles out through the gate on that side.',
    who:'A@50,8 B@50,50',balls:'50,13',passes:['50,15>50,44'],dribbles:['52,52>84,80'],zones:[[44,88,56,94]],cones:'50,86 12,78 12,90 88,78 88,90'},
   steps:['Set two gates of cones behind the receiver, one on each side, and the phone in the middle between them.','The passer plays in. The receiver checks the arrow as the ball rolls.','The first touch turns the way the arrow points, and the receiver dribbles through that gate.','Back to the start; the passer goes next.'],
   point:'Open the body side-on before the ball arrives, so the turn is one touch, not three.'},
  {id:'rondo-with-a-caller',ages:'U10 and up',players:'5 or 6',setting:'Numbers 1 to 9, every 2.5 s',
   scene:{w:12,l:12,title:'Rondo with a caller',caption:'Four players keep the ball from one defender in a square. The phone stands outside one side; whoever receives calls the number on it before passing.',
    who:'1@50,6 2@94,50 3@50,94 4@6,50 !D@46,46',balls:'50,11',passes:['52,10>90,46'],zones:[[112,44,114,56]],cones:'113,40'},
   steps:['Mark a square of 10 to 12 yards with four players on the sides and one defender in the middle.','Put the phone on a cone just outside one side, facing in.','Each receiver calls the number on the screen before their pass. A wrong or missing call counts like losing the ball: that player swaps with the defender.','Move the phone to another side every two minutes, so each player has to turn the head a different way.'],
   point:'Scan, then pass. Players who look early find the free teammate and have time to call.'},
  {id:'arrow-turns',ages:'U8 and up',players:'1 to 4, each with a ball',setting:'Arrows, four directions, every 3 s',
   scene:{w:15,l:15,title:'Arrow turns',caption:'Players dribble around the square. On each change they look up at the phone on the far edge and turn the way the arrow points.',
    who:'1@30,30 2@70,40 3@40,70',balls:'32,30 72,40 42,70',dribbles:['32,32>60,28','72,42>66,72','42,72>22,58'],zones:[[46,112,54,114]],cones:'50,110'},
   steps:['Every player dribbles freely inside the square with the head up.','When the arrow changes, each player turns: forward keeps going, back turns around, left and right cut that way.','Use the turn they are practicing this week: a hook turn, a Cruyff turn or a drag back.'],
   point:'Eyes up between touches. The ball stays close so the eyes are free.'},
  {id:'color-sprint',ages:'U6 to U10',players:'1 to 3 at a time',setting:'Colors, your four cone colors, every 3.5 s',
   scene:{w:10,l:10,title:'Color sprint',caption:'Four colored cones make a square around the player. The phone stands just outside, behind the player; on each change the player turns, sees the color and sprints to touch that cone, then back to the middle.',
    who:'A@50,50',runs:['52,52>86,86'],zones:[[46,-12,54,-10]],cones:'14,14 86,14 14,86 86,86 50,-8'},
   steps:['Put four cones of different colors on the corners of a small square, with the phone on a cone just outside one edge.','The player stands in the middle facing away from the phone.','On each change, the player turns the head, reads the color and sprints to touch that cone, then back to the middle.','Add a ball: dribble to the cone instead of running.'],
   point:'Turn the head first, then the body. The quickest players see it before they move.'},
  {id:'pass-it',ages:'U12 and up',players:'6',setting:'Pass it, 4 teammates, every 2.5 s',
   scene:{w:20,l:20,title:'Pass it',caption:'Four numbered support players stand around the square. A server plays into the receiver in the middle, who checks the phone behind and passes to the teammate it shows.',
    who:'S@50,4 R@50,46 1@8,50 2@92,50 3@24,92 4@76,92',balls:'50,9',passes:['50,11>50,40','54,48>90,50'],zones:[[44,64,56,70]],cones:'50,62'},
   steps:['Number four support players 1 to 4 and place them on the sides of the square. Set Pass it to four teammates and the arrows the support players stand on.','The server plays into the receiver. As the ball rolls, the receiver checks the phone: it shows a number and an arrow, such as “Pass to 2” and right.','The receiver passes to that teammate, ideally with the first or second touch.','Support players move to stay out of the defender’s passing shadow once you add a defender.'],
   point:'This is the passing and support lesson in miniature: know where the free teammate is before the ball arrives.'},
 ],
 tipsTitle:'Tips from practice',
 tips:['Short and often works better than long: two or three sessions of 60 to 90 seconds in a practice, as part of a passing drill, not as a separate test.','Ask for the call out loud. A call you can hear proves the look happened, and teammates learn to talk.',
  'Change which shoulder: move the phone from left to right halfway through, so players do not always turn the same way.','Use the colors of the cones you have, so a color can mean a place on the field: “red is the left gate”.',
  'In a game, praise the look, not only the pass. “Great check before that touch” builds the habit faster than any app.'],
 privacy:'Nothing you choose or score is sent to Futbol Island or stored on a server. Settings and best scores stay on the phone you use.',
 faqTitle:'Questions about scanning',
 faq:[{q:'What is scanning in soccer?',a:'A quick look away from the ball, usually over the shoulder, to see where teammates, opponents and space are before you receive. It is also called checking your shoulder.'},
  {q:'How often should a player scan?',a:'Several times before each touch: when the pass is played, while the ball rolls, and just before it arrives. Young players start with one clear look; older players look more often and earlier.'},
  {q:'At what age can kids start scanning drills?',a:'From about 6 or 7 with a simple color game. Use slow changes and colors only at first, and add numbers, arrows and passes as they grow.'},
  {q:'Does the scanning app need internet or an account?',a:'No account and no sign-up. Once it has opened, it works offline, and nothing you choose or score leaves your phone.'},
  {q:'Can players who are color blind use it?',a:'Yes. Turn on “Write the color name” to show the name of each color on screen, or use numbers, arrows or Pass it, which do not depend on color.'}],
 relatedTitle:'Lessons, drills and terms on scanning',previewCaption:'Four cues as the phone shows them: a color with its name, a number, an arrow, and a pass to teammate 3 on the right.',
 features:['Colors, numbers, arrows, a mix, and Pass it','Change every 1 to 6 seconds','Age presets from U8 to adult','Color names on screen for color-blind players','Coach score with a result to beat','Works offline; nothing leaves the phone'],
 secWord:n=>`${String(n)} s`,labels:{ages:'Ages',players:'Players',setting:'Trainer setting',point:'Coaching point'}};
/** Lessons, drills and terms about looking before you receive (all real pages; tests/seo-tools.cjs checks every link resolves). */
export const SCAN_RELATED_EN=[
 {path:'/learn/lessons/learn7_receive',name:'Look, then turn or return (7v7 lesson)',line:'Check for pressure before the ball arrives, then turn into space or give it back'},
 {path:'/learn/lessons/learn9_receive',name:'Receive: turn or connect (9v9 lesson)',line:'Read the space before receiving; turning and returning solve different pressure'},
 {path:'/learn/lessons/prn_9_support',name:'Move out of the passing shadow (9v9 lesson)',line:'The support run that the Pass it drill rehearses'},
 {path:'/learn/lessons/dbz_7_dontballwatch',name:'See the ball and the runner (7v7 lesson)',line:'Scanning when your team does not have the ball'},
 {path:'/learn/passing-and-support',name:'Passing and support lessons',line:'Every lesson on finding and making a free pass'},
 {path:'/learn/soccer-drills/shoulder-check-colors',name:'Shoulder check colors (soccer drill)',line:'The same idea with a teammate holding up cones, no phone needed'},
 {path:'/learn/soccer-drills/busy-square-dribbling',name:'Busy square dribbling (soccer drill)',line:'Heads-up dribbling for the youngest players'},
 {path:'/learn/soccer-drills/first-touch',name:'First touch drills',line:'Receiving drills where a look before the ball comes pays off'},
 {path:'/learn/soccer-terms/first-touch',name:'What is a first touch in soccer?',line:'Why the look comes before the touch'},
 {path:'/tools/soccer-playing-time-calculator',name:'Soccer playing time calculator',line:'Fair minutes for every player on game day'},
 {path:'/tools/soccer-lineup-builder',name:'Soccer lineup builder',line:'Put the starters on a field diagram'},
];
export const scanDrillScenes=(p:ScanPage):GridScene[]=>p.drills.map(d=>grid(d.scene));
