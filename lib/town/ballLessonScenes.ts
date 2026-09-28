/**
 * Ball Hunt lesson scenes (Sep 28 2026 rebuild): one small, parametrised scene per concept instead of one bespoke drawing
 * function per diagram. A scene is a cast (teammates, opponents whose ids start with "x", the ball) plus three steps:
 * step 1 = the problem, step 2 = the movement that creates space or time, step 3 = the payoff. Each step lists only what
 * changes (positions persist) and the teaching marks to show (open space, lanes, defensive lines, cover shadows, view
 * cones, a "now!" pulse, a time-on-the-ball clock, thirds and lanes overlays).
 *
 * `ballLessonFrame` resolves a step into plain drawing data. Runs, passes and dribbles are derived from what moved between
 * steps, with the timing (who moves first) the lesson needs, so the diagram only animates while a step changes and then
 * sleeps (AGENTS.md mobile heat). Loaded only with the lesson card, never by the island render loop.
 * Pitch: 330 x 248 view box, playing area x 14..316, y 22..234; we always attack toward the top. Upright phones draw the
 * same scenes on a taller view box through pitchMap (see Layouts below).
 */
type P=[number,number];
type Ref=string|P;
export type Pitch='full'|'attack'|'defend';
type ZoneSpec=[number,number,number,number,string?,('space'|'danger'|'band')?];
export type SceneStep={
 /** Short line printed above the pitch. */
 note:string;
 /** New positions (they persist into later steps); an optional third item relabels the token. */
 at?:Record<string,P|[number,number,string]>;
 label?:Record<string,string>;
 /** Facing in degrees: 0 = toward the top (their goal), 90 = right. Persists. */
 face?:Record<string,number>;
 /** Pass the ball to a player id or a point. Without it the ball stays with its holder (and moves with them). */
 ball?:Ref;via?:string[];
 /** The ball moves as a touch/dribble (no pass arrow). */
 dribble?:boolean;
 /** Who moves first: default = runs first, pass second (movement creates the space, then the ball arrives). */
 order?:'pass-first'|'together'|'react';
 /** Curve a run (or the ball, key "ball") sideways by this many px; positive bows to the right of travel. */
 bend?:Record<string,number>;
 zones?:ZoneSpec[];
 /** Passing lanes: [from, to, open?]. Blocked lanes get an X where the defender cuts them. */
 lanes?:[Ref,Ref,0|1][];
 /** Opponent lines (defensive lines) and team rows, drawn through the listed players. */
 lines?:string[][];rows?:string[][];broken?:number[];
 /** The cover shadow a defender casts from the ball: [from, defender]. */
 shadow?:[string,string];
 /** Shapes (triangles, diamonds, the team block) through team players. */
 links?:string[][];
 /** Field-of-view cones: what this player can see. */
 view?:Record<string,number>;
 /** A shooting cone from a point to the two posts. */
 cone?:[Ref,P,P];
 /** Keeper reach ring. */
 reach?:string;
 /** The timing cue: a pulse with a word ("Now!"). */
 pulse?:[Ref,string];
 /** Time on the ball: ring 0..1 around a player with a short label. */
 clock?:[string,number,string];
 tags?:[Ref,string][];
 dim?:string[];
 /** Faint dashed "what if" route. */
 hint?:string[];
 /** Rewind: jump to a fresh start ("try again") instead of animating. */
 reset?:boolean;
 overlay?:'thirds'|'lanes';
};
export type Scene={pitch?:Pitch;overlay?:'thirds'|'lanes';cast:Record<string,[number,number,string?]>;ball:Ref;steps:[SceneStep,SceneStep,SceneStep]};

export type DiagramNode={id:string;x:number;y:number;label:string;role:'team'|'opponent'|'ball';angle?:number;dim?:boolean;reach?:boolean};
export type Motion={id:string;pts:P[];ctrl?:P;delay:number;dur:number};
export type Arrow={d:string;kind:'pass'|'run'|'enemy'|'dribble';delay:number};
export type Zone={x:number;y:number;w:number;h:number;label:string;tone:'space'|'danger'|'band'};
export type Lane={d:string;open:boolean;danger:boolean;mark:P};
/** The SVG view box a frame is drawn in. Scenes are written for LANDSCAPE; other layouts remap every point (see pitchMap). */
export type DiagramLayout={w:number;h:number};
export type DiagramFrame={
 layout:DiagramLayout;pitch:Pitch;overlay?:'thirds'|'lanes';note:string;nodes:DiagramNode[];
 arrows:Arrow[];ghosts:Arrow[];motions:Motion[];zones:Zone[];lanes:Lane[];
 lines:{pts:P[];team:boolean;broken:boolean}[];shadows:string[];links:string[];views:string[];cone?:string;
 pulse?:{x:number;y:number;text:string;delay:number};clock?:{id:string;x:number;y:number;t:number;text:string};
 tags:{x:number;y:number;text:string}[];hints:string[];reset:boolean;
 /** When the step's movement has finished: derived marks (lanes, zones, tags) appear then. */
 settle:number;
};

/* ─────────────────────────────── The 80 scenes ─────────────────────────────── */
export const SCENES={
 /* Level 1: the simplest space and time ideas (7v7 words). */
 'scan-shoulder':{cast:{p:[80,200,'Passer'],a:[165,135,'You'],x:[114,90,'?']},ball:'p',steps:[
  {note:'Who is behind you?',face:{a:215},view:{a:215},clock:['a',.15,'Little time']},
  {note:'Look while the ball travels',face:{a:330},view:{a:330},label:{x:'Defender'},ball:[122,170],zones:[[205,70,86,58,'Free side']],pulse:['a','Look!']},
  {note:'Turn away into the free side',at:{a:[246,100]},face:{a:20},ball:'a',order:'together',clock:['a',.9,'Lots of time']}]},
 'open-corner':{pitch:'attack',cast:{a:[235,118,'You'],xk:[165,40],x:[262,74]},ball:'a',steps:[
  {note:'Shooting at the keeper?',lanes:[['ball',[165,26],0]]},
  {note:'The corners are hardest to reach',at:{xk:[182,36]},zones:[[146,23,18,20,'']],tags:[[[120,40],'Far corner']],lanes:[['ball',[153,28],1]]},
  {note:'Low and calm into the far corner',ball:[153,29],pulse:[[153,30],'Goal!']}]},
 'go-wide':{cast:{a:[165,202,'You'],l:[135,152],r:[195,152],s:[165,62,'Striker'],x1:[156,114],x2:[192,114]},ball:'a',steps:[
  {note:'A crowded middle · pass blocked',zones:[[104,88,122,90,'Crowded','danger']],lanes:[['a','s',0]]},
  {note:'Run wide · the defenders follow',at:{l:[42,124],r:[288,124],x1:[100,118],x2:[232,118]},zones:[[128,90,74,48,'Gap']],lanes:[['a','s',1]]},
  {note:'Width opens the middle',ball:'s'}]},
 'dribble-angle':{cast:{a:[110,192,'You'],b:[205,68,'Mate'],x:[157,130]},ball:'a',steps:[
  {note:'The pass is blocked',lanes:[['a','b',0]]},
  {note:'Dribble sideways · a new angle',at:{a:[228,188]},lanes:[['a','b',1]]},
  {note:'Pass before they slide across',at:{x:[184,126]},ball:'b',pulse:['a','Now!']}]},
 'spread-out':{cast:{a:[165,140,'You'],t1:[140,122],t2:[190,125],t3:[168,168],x:[172,102],x2:[130,154]},ball:'a',steps:[
  {note:'Everyone crowds the ball',zones:[[108,86,114,104,'Crowd','danger']]},
  {note:'Spread into open spaces',at:{t1:[62,86],t2:[272,92],t3:[244,196]},lanes:[['a','t1',1],['a','t2',1],['a','t3',1]]},
  {note:'Pass to the freest teammate',at:{x:[196,112]},ball:'t1',order:'react'}]},
 'pass-ahead':{cast:{a:[80,195,'You'],b:[215,176,'Runner'],x:[150,104]},ball:'a',steps:[
  {note:'A pass to their feet makes them stop',lanes:[['a','b',1]],tags:[['b','Must stop']]},
  {note:'Aim at the space ahead',at:{b:[220,146]},zones:[[222,58,64,48,'Space ahead']],lanes:[['a',[250,84],1]]},
  {note:'Meet it at full speed',at:{b:[250,82]},ball:'b',order:'together',pulse:['b','Meet!']}]},
 'give-and-go':{cast:{a:[140,194,'You'],b:[234,150,'Mate'],x:[147,128]},ball:'a',steps:[
  {note:'One defender blocks the way',zones:[[108,56,82,46,'Space']],lanes:[['a',[151,84],0]]},
  {note:'Pass, then sprint past',ball:'b',at:{a:[126,88]},bend:{a:-28},order:'pass-first'},
  {note:'The return beats the defender',ball:'a',dim:['x'],tags:[['x','Beaten']],pulse:['a','Back!']}]},
 'arrive-late':{cast:{p:[88,198,'Passer'],a:[232,98,'You'],x:[222,74]},ball:'p',steps:[
  {note:'Standing in the space · marked',tags:[['a','Marked']]},
  {note:'Wait outside · watch the passer',at:{a:[286,168],x:[200,128]},face:{a:250},zones:[[206,66,72,52,'Space']]},
  {note:'Arrive as the ball does',at:{a:[240,92]},face:{a:340},ball:'a',order:'together',pulse:['a','Now!']}]},
 'touch-into-space':{cast:{p:[258,200,'Passer'],a:[165,150,'You'],x:[184,124]},ball:'a',steps:[
  {note:'Stopped dead · no time',clock:['a',.12,'No time']},
  {note:'Try again: spot the space first',reset:true,at:{x:[224,84]},ball:'p',face:{a:320},view:{a:320},zones:[[40,112,78,56,'Space']]},
  {note:'Touch it into the space',at:{a:[90,140],x:[184,110]},ball:'a',order:'together',clock:['a',.85,'Time']}]},
 'pass-and-move':{cast:{a:[236,168,'You'],b:[92,146,'Mate'],x:[168,158]},ball:'b',steps:[
  {note:'You passed and stood still',hint:['M226 166L104 148'],lanes:[['b','a',0]]},
  {note:'Move to a new open spot',at:{a:[186,92]},bend:{a:-22},lanes:[['b','a',1]]},
  {note:'A clear pass back to you',ball:'a'}]},
 'triangle':{cast:{a:[165,205,'You'],b:[165,138],c:[165,88],x:[165,168]},ball:'a',steps:[
  {note:'A straight line · one defender blocks',lanes:[['a','b',0]]},
  {note:'Make a triangle',at:{b:[85,140],c:[250,125]},links:[['a','b','c']],lanes:[['a','b',1],['a','c',1]]},
  {note:'Two passes · one defender',at:{x:[128,168]},links:[['a','b','c']],ball:'c',order:'react'}]},
 'leave-shadow':{cast:{p:[165,204,'Passer'],x:[165,138],a:[165,80,'You']},ball:'p',steps:[
  {note:'Hidden in the defender’s shadow',shadow:['p','x'],lanes:[['p','a',0]]},
  {note:'Step out of the shadow',at:{a:[248,88]},shadow:['p','x']},
  {note:'A clear line to you',shadow:['p','x'],lanes:[['p','a',1]],ball:'a'}]},
 'depth':{cast:{a:[165,140,'You'],l:[82,140],r:[248,140],x:[165,96],x2:[96,100],x3:[240,100]},ball:'a',steps:[
  {note:'All level · no forward, no back',rows:[['l','a','r']],lanes:[['a',[165,52],0]]},
  {note:'One ahead, one behind',at:{r:[244,58],l:[118,202]},lanes:[['a','r',1],['a','l',1]]},
  {note:'Ahead to stretch · behind for safety',lanes:[['a','l',1]],ball:'r'}]},
 'change-pace':{cast:{p:[258,200,'Passer'],a:[95,150,'You'],x:[114,138]},ball:'p',steps:[
  {note:'One speed · the marker stays close',tags:[['x','Close']]},
  {note:'Slow… the marker relaxes',at:{a:[88,134],x:[112,124]}},
  {note:'Burst! A gap opens',at:{a:[80,60],x:[102,106]},zones:[[56,74,50,20,'']],ball:'a',pulse:['a','Go!']}]},
 'check-away':{cast:{p:[165,205,'Passer'],a:[168,126,'You'],x:[168,98]},ball:'p',steps:[
  {note:'Tight marker · no room',tags:[['x','Tight']]},
  {note:'Run away · the marker follows',at:{a:[182,72],x:[182,42]},zones:[[126,98,86,52,'Space']]},
  {note:'Check back into the space',at:{a:[150,128],x:[176,72]},ball:'a',pulse:['a','Now!'],clock:['a',.75,'Time to turn']}]},
 'two-v-one':{cast:{a:[150,198,'You'],b:[182,192,'Mate'],x:[165,108]},ball:'a',steps:[
  {note:'Too close · one defender guards both',tags:[['b','Too close']]},
  {note:'Spread out · dribble at them',at:{b:[268,168],a:[152,158],x:[158,116]}},
  {note:'They commit · pass to the free one',at:{x:[156,130],b:[268,110]},ball:'b',tags:[['x','Committed']],pulse:['a','Now!']}]},
 'recover-inside':{pitch:'defend',cast:{x:[220,110],a:[160,70,'You']},ball:'x',steps:[
  {note:'An attacker runs at your goal',lanes:[['x',[165,230],1]]},
  {note:'Sprint toward your goal, not the ball',at:{a:[180,176],x:[216,146]},bend:{a:-18}},
  {note:'Between the attacker and the goal',at:{a:[191,196],x:[212,164]},face:{a:330},lanes:[['x',[165,230],0]]}]},
 'jockey':{pitch:'defend',cast:{x:[188,176],a:[146,138,'You']},ball:'x',steps:[
  {note:'Dived in · dodged',tags:[['a','Dived in']],hint:['M165 112Q140 150 188 176']},
  {note:'Try again: an arm’s length away',reset:true,at:{x:[165,96],a:[165,150]},face:{a:0},tags:[['a','Knees bent']]},
  {note:'Back off · poke it when it runs loose',at:{x:[168,140],a:[196,190]},ball:[206,168],dribble:true,pulse:[[206,168],'Poke!']}]},

 /* Level 2: space, timing and shape together (9v9 words). */
 'half-turn':{cast:{p:[232,204,'Passer'],a:[140,138,'You'],x:[90,96]},ball:'p',steps:[
  {note:'Facing the passer · blind ahead',face:{a:135},view:{a:135}},
  {note:'Side-on: see ball and space',at:{a:[146,134]},face:{a:40},view:{a:40},zones:[[168,54,86,56,'Space ahead']]},
  {note:'First touch forward',at:{a:[182,108]},face:{a:30},ball:'a',order:'together'}]},
 'three-lines':{cast:{d1:[110,206,'Defence'],d2:[220,206],m1:[70,190,'Midfield'],m2:[262,190],f1:[128,52,'Attack'],f2:[205,52],x1:[122,130],x2:[200,122]},ball:'d1',steps:[
  {note:'A huge gap in the middle',zones:[[30,74,272,96,'Gap','danger']],lanes:[['ball','f1',0]]},
  {note:'Midfielders step into the gap',at:{m1:[80,132],m2:[248,132]},rows:[['d1','d2'],['m1','m2'],['f1','f2']],lanes:[['ball','m1',1],['m1','f1',1]]},
  {note:'Short passes, line to line',rows:[['d1','d2'],['m1','m2'],['f1','f2']],ball:'f1',via:['m1']}]},
 'hide-behind':{cast:{a:[90,198,'You'],b:[160,140,'Mate'],c:[215,94,'Mate'],x:[127,168]},ball:'a',steps:[
  {note:'One behind the other · both blocked',lanes:[['a','b',0],['a','c',0]]},
  {note:'Find your own lane',at:{c:[78,96]},lanes:[['a','b',0],['a','c',1]]},
  {note:'The defender can only block one',at:{x:[92,148]},lanes:[['a','b',1],['a','c',0]],ball:'b',order:'react'}]},
 'run-behind':{pitch:'attack',cast:{x1:[92,96],x2:[165,100],x3:[238,96],xk:[165,34],p:[135,195,'Passer'],a:[212,110,'You'],m:[272,165]},ball:'p',steps:[
  {note:'Big space behind the line',lines:[['x1','x2','x3']],zones:[[36,50,258,32,'Space behind']]},
  {note:'Stay level until the passer looks up',at:{a:[206,102]},face:{p:10},view:{p:10},lines:[['x1','x2','x3']],pulse:['p','Head up']},
  {note:'Sprint in as the ball is played',at:{a:[214,54]},ball:'a',order:'together',lines:[['x1','x2','x3']],broken:[0],pulse:['a','Go!']}]},
 'danger-zone':{pitch:'defend',cast:{xw:[286,142,'Winger'],xs:[150,110],xa:[205,100],t1:[246,160],t2:[252,128],t3:[240,194]},ball:'xw',steps:[
  {note:'Everyone runs to the ball',zones:[[222,96,90,120,'Crowd','danger']]},
  {note:'The middle is empty',at:{xs:[165,188]},zones:[[104,150,120,62,'Danger zone','danger']]},
  {note:'One presses, the rest guard the middle',at:{t1:[140,196],t3:[190,200],t2:[246,174]},zones:[[104,150,120,62,'Guarded']]}]},
 'second-ball':{cast:{xk:[165,42,'Kicker'],h:[170,128,'Mate'],x:[152,118],a:[92,176,'You'],m:[252,92,'Mate'],x2:[118,84],x3:[272,196]},ball:'xk',steps:[
  {note:'A long ball · everyone watches',face:{a:30}},
  {note:'Move early to where it drops',ball:[166,120],bend:{ball:-40},at:{a:[200,192],m:[274,150]},zones:[[184,148,78,52,'Drop zone']],order:'together'},
  {note:'First to the loose ball',ball:[218,166],at:{a:[212,178]},order:'together',pulse:[[218,166],'Mine!']}]},
 'overlap':{cast:{w:[240,140,'Winger'],a:[198,196,'You'],x:[246,94]},ball:'w',steps:[
  {note:'One defender faces the winger',lanes:[['ball',[250,50],0]]},
  {note:'Run around the outside',at:{a:[292,118]},bend:{a:30},tags:[['x','Who?']]},
  {note:'They can’t stop both',at:{a:[292,58],x:[240,112]},ball:'a',pulse:['a','Free!']}]},
 'diamond':{cast:{a:[70,150,'You'],b:[130,150],c:[200,150],e:[262,150],x:[100,112],x2:[228,110]},ball:'a',steps:[
  {note:'A flat line · few safe passes',rows:[['a','b','c','e']],lanes:[['ball',[165,62],0]]},
  {note:'Build a diamond',at:{a:[165,204],b:[82,142],c:[248,142],e:[165,66],x:[118,120],x2:[206,112]},links:[['a','b','e','c']]},
  {note:'Pass to the open corner',at:{x:[108,150]},links:[['a','b','e','c']],ball:'e',order:'react'}]},
 'between-lines':{cast:{x1:[95,138],x2:[160,142],x3:[230,138],x4:[115,66],x5:[215,66],p:[150,205,'Passer'],a:[254,180,'You']},ball:'p',steps:[
  {note:'Two lines of defenders',lines:[['x1','x2','x3'],['x4','x5']],zones:[[130,82,94,38,'Pocket']]},
  {note:'Slip into the pocket',at:{a:[198,100]},face:{a:210},lines:[['x1','x2','x3'],['x4','x5']]},
  {note:'Receive, turn, face goal',ball:'a',face:{a:0},lines:[['x1','x2','x3'],['x4','x5']],broken:[0],tags:[['a','Turned!']]}]},
 'drag-away':{cast:{p:[165,205,'Passer'],a:[160,122,'You'],x:[150,108],b:[168,50,'Mate']},ball:'p',steps:[
  {note:'Your marker blocks the lane',lanes:[['p','b',0]]},
  {note:'Run wide · the marker follows',at:{a:[278,102],x:[250,84]},bend:{a:18},zones:[[126,80,82,54,'Space']]},
  {note:'Your mate uses the space you made',at:{b:[166,104]},ball:'b'}]},
 'passer-sees':{cast:{p:[100,192,'Passer'],a:[236,56,'You'],x:[210,68]},ball:'p',steps:[
  {note:'You ran early · the passer looks down',face:{p:180},view:{p:180},tags:[['a','Too early']]},
  {note:'Wait: ball controlled, head up',reset:true,at:{a:[232,138],x:[218,118]},face:{p:25},view:{p:25},pulse:['p','Head up!']},
  {note:'Now go · they see your run',at:{a:[250,62]},view:{p:25},ball:'a',order:'together',pulse:['a','Go!']}]},
 'use-keeper':{pitch:'defend',cast:{k:[165,206,'Keeper'],c1:[72,176,'You'],c2:[262,178,'Mate'],m:[110,118],x1:[88,154],x2:[56,132],x3:[122,98]},ball:'c1',steps:[
  {note:'Pressed · forward passes blocked',zones:[[30,84,126,110,'Pressure','danger']],lanes:[['ball','m',0]]},
  {note:'Back to the keeper · nobody marks them',ball:'k',tags:[['k','Free']],lanes:[['k','c2',1]]},
  {note:'The keeper switches to the free side',at:{c2:[272,160]},ball:'c2',zones:[[222,106,90,92,'Space']]}]},
 'follow-shot':{pitch:'attack',cast:{s:[232,122,'Mate'],a:[142,134,'You'],xk:[165,40],x:[114,92]},ball:'s',steps:[
  {note:'A shot · everyone stops to watch',tags:[['a','Watching?']]},
  {note:'Keep running in',ball:[170,38],at:{a:[150,76]},order:'pass-first'},
  {note:'The keeper spills it · you’re first',ball:[138,60],at:{a:[132,68],xk:[172,40]},order:'together',pulse:[[138,60],'Rebound!']}]},
 'curved-run':{pitch:'attack',cast:{x1:[112,100],x2:[205,100],xk:[165,36],p:[80,196,'Passer'],a:[252,134,'You']},ball:'p',steps:[
  {note:'A straight run goes offside',lines:[['x1','x2']],hint:['M252 120L252 70'],tags:[[[252,58],'Offside!']]},
  {note:'Bend across the line first',at:{a:[208,118]},bend:{a:-12},lines:[['x1','x2']]},
  {note:'Then forward on the pass',at:{a:[180,60]},bend:{a:16},ball:'a',order:'together',lines:[['x1','x2']],broken:[0],pulse:['a','Now!']}]},
 'dribble-line':{cast:{x1:[92,122],x2:[165,126],x3:[238,122],x4:[122,54],x5:[210,54],a:[202,194,'You'],f:[68,72,'Mate']},ball:'a',steps:[
  {note:'A wall of midfielders',lines:[['x1','x2','x3'],['x4','x5']],zones:[[150,70,112,36,'Space']]},
  {note:'Dribble at the gap',at:{a:[202,154],x2:[180,130],x3:[226,128]},lines:[['x1','x2','x3'],['x4','x5']]},
  {note:'Burst through · line beaten',at:{a:[204,92]},dim:['x1','x2','x3'],lines:[['x1','x2','x3'],['x4','x5']],broken:[0],tags:[['a','Line beaten']]}]},
 'time-or-pressure':{cast:{p:[72,192,'Passer'],a:[165,138,'You'],x:[284,70],b:[262,188,'Mate']},ball:'p',steps:[
  {note:'The defender is far away',clock:['a',1,'Lots of time']},
  {note:'Control · turn · look',ball:'a',face:{a:10},view:{a:10},clock:['a',.9,'Time']},
  {note:'Defender close · one touch',at:{x:[194,148]},ball:'b',order:'react',clock:['a',.15,'No time'],pulse:['a','One touch!']}]},
 'pin':{cast:{x:[165,128],m:[165,156,'Mate'],p:[95,205,'Passer'],a:[252,150,'You']},ball:'p',steps:[
  {note:'The defender squeezes your mate',clock:['m',.15,'No time'],tags:[['x','Steps up']]},
  {note:'Stand high · the defender must stay',at:{a:[204,62],x:[170,92]},zones:[[122,112,86,50,'Room']],tags:[['a','Pinning']]},
  {note:'Room to receive and turn',ball:'m',face:{m:0},clock:['m',.8,'Time to turn']}]},
 'talk':{cast:{p:[80,196,'Passer'],r:[165,126,'Mate'],x:[178,56],a:[272,86,'You']},ball:'p',steps:[
  {note:'Your mate can’t see behind',face:{r:215},view:{r:215},tags:[['x','Unseen']]},
  {note:'Shout before the ball arrives',at:{x:[172,98]},pulse:['a','Man on!']},
  {note:'Warned · safe pass back',ball:'p',via:['r'],tags:[[[112,120],'Heard you']]}]},
 'shoot-early':{pitch:'attack',cast:{a:[190,104,'You'],xk:[174,38],x:[96,112]},ball:'a',steps:[
  {note:'You can see the goal',lanes:[['ball',[147,24],1]],clock:['a',.5,'Window open']},
  {note:'A defender is coming: no extra touch',at:{x:[150,98]},clock:['a',.2,'Closing'],pulse:['a','Shoot!']},
  {note:'Shoot before the window shuts',ball:[150,28],at:{x:[176,86]},order:'pass-first',pulse:[[150,30],'Goal!']}]},
 'shield':{cast:{a:[165,142,'You'],x:[148,118],m:[78,200,'Mate']},ball:[156,130],steps:[
  {note:'Close defender · no pass yet',tags:[['x','Close']]},
  {note:'Body between defender and ball',ball:[182,156],dribble:true,face:{a:135},at:{x:[152,124]}},
  {note:'Far foot · wait for help',at:{m:[112,174]},ball:'m'}]},

 /* Manholes: the pitch seen from above. */
 'free-player':{cast:{a:[165,202,'You'],b:[70,118],c:[165,118],e:[262,118],x1:[74,90],x2:[168,90]},ball:'a',steps:[
  {note:'Who has nobody near them?'},
  {note:'Count: marked, marked, free',at:{x1:[72,98],x2:[166,98]},label:{b:'Marked',c:'Marked',e:'Free'},zones:[[232,88,62,58,'']]},
  {note:'Pass to the free teammate',ball:'e',clock:['e',.9,'Time']}]},
 'split-gap':{cast:{a:[165,205,'You'],b:[268,72,'Mate'],x1:[118,128],x2:[212,128]},ball:'a',steps:[
  {note:'A gap nobody is using',zones:[[140,108,50,40,'Gap']],lanes:[['a','b',0]]},
  {note:'Stand behind the gap',at:{b:[165,64]},lanes:[['a','b',1]]},
  {note:'Split them · two beaten',ball:'b',dim:['x1','x2'],tags:[['b','2 beaten']]}]},
 'forward-first':{cast:{a:[100,202,'You'],c:[238,202,'Mate'],b:[206,48,'Striker'],x1:[106,112],x2:[176,116],x3:[246,112]},ball:'a',steps:[
  {note:'An easy sideways pass',lines:[['x1','x2','x3']],lanes:[['a','c',1]],tags:[['c','Beats 0']]},
  {note:'Look up: the forward pass',at:{b:[172,56]},face:{a:20},lines:[['x1','x2','x3']],lanes:[['a','c',1],['a','b',1]],tags:[['c','Beats 0'],['b','Beats 3']]},
  {note:'Play forward when it’s on',ball:'b',dim:['x1','x2','x3'],lines:[['x1','x2','x3']],broken:[0]}]},
 'rest-defence':{cast:{a:[165,92,'Mate'],b:[80,82],c:[250,82],s:[126,124,'You'],x:[222,128,'Striker'],x2:[205,48]},ball:'a',steps:[
  {note:'Everyone attacks · nobody back',zones:[[34,160,262,56,'Empty','danger']]},
  {note:'You stay back for safety',at:{s:[176,182]},label:{s:'Safety'}},
  {note:'Ball lost · you block the break',ball:'x',at:{s:[204,172]},order:'pass-first',lanes:[['x',[165,230],0]]}]},
 'own-lane':{overlay:'lanes',cast:{cb:[236,202],w1:[290,160,'Mate'],w2:[290,82,'You'],x:[270,120]},ball:'cb',steps:[
  {note:'Two in one lane · one defender guards both',zones:[[257,62,56,114,'','danger']]},
  {note:'Move into the next lane in',at:{w2:[224,96]},bend:{w2:-14}},
  {note:'Two lanes, two options',ball:'w2',lanes:[['cb','w1',1]]}]},
 'thirds':{overlay:'thirds',cast:{a:[222,196,'You'],b:[150,150,'Mate'],x:[245,140]},ball:'a',steps:[
  {note:'Defending · middle · attacking third'},
  {note:'Near your goal: safe and simple',zones:[[14,164,302,70,'','band']],ball:'b'},
  {note:'Near their goal: be brave',at:{a:[165,70],b:[98,108],x:[212,78]},ball:'a',zones:[[14,22,302,70,'','band']],pulse:['a','Shoot!']}]},
 'blind-side':{cast:{p:[70,196,'Passer'],a:[155,158,'You'],x:[186,124]},ball:'p',steps:[
  {note:'The defender watches the ball',view:{x:225}},
  {note:'Drift behind their shoulder',at:{a:[234,94]},bend:{a:24},view:{x:225},zones:[[210,52,74,52,'Blind side']]},
  {note:'Arrive as the pass is played',at:{a:[238,62]},view:{x:225},ball:'a',order:'together',pulse:['a','Now!']}]},
 'defend-2v1':{pitch:'defend',cast:{x1:[130,88],x2:[232,92],a:[178,150,'You'],m:[58,62,'Mate']},ball:'x1',steps:[
  {note:'Two attackers · you alone',lanes:[['x1','x2',1]]},
  {note:'Stay between them · back off',at:{x1:[136,126],x2:[232,128],a:[184,166],m:[100,138]},tags:[['a','Between']]},
  {note:'Help arrives · two against two',at:{x1:[140,150],x2:[236,154],a:[196,184],m:[140,178]},tags:[['m','2 v 2']]}]},
 'show-outside':{pitch:'defend',cast:{x:[165,70,'Attacker'],a:[165,150,'You']},ball:'x',steps:[
  {note:'The attacker heads for the middle',hint:['M165 90L165 124'],tags:[[[205,104],'To the middle']]},
  {note:'Guard the middle · leave the outside',at:{a:[140,138]},face:{a:30},zones:[[252,40,58,150,'Outside']]},
  {note:'The sideline helps you defend',at:{x:[272,122],a:[232,146]},tags:[[[286,86],'Sideline']]}]},
 'box-runs':{pitch:'attack',cast:{w:[288,142,'Winger'],a:[135,160],b:[165,176,'Runners'],c:[195,160],x:[238,102],x2:[122,100],xk:[165,36]},ball:'w',steps:[
  {note:'Three runners, one spot',zones:[[118,138,94,58,'Same spot','danger']]},
  {note:'Near post · far post · penalty spot',at:{a:[210,60],b:[114,60],c:[165,112]},label:{a:'Near',b:'Far',c:'Spot'}},
  {note:'Cross to the free runner',at:{x:[220,80]},ball:'b',bend:{ball:-24},order:'react',pulse:['b','Free!']}]},
 'cutback':{pitch:'attack',cast:{a:[255,112,'Winger'],b:[165,160,'Mate'],x:[182,80],x2:[130,94],xk:[165,36]},ball:'a',steps:[
  {note:'The winger heads for the end line'},
  {note:'Defenders run back · space opens',at:{a:[262,50],x:[200,58],x2:[128,62]},zones:[[122,90,96,46,'Space']]},
  {note:'Pull it back to a mate facing goal',at:{b:[165,112]},ball:'b'}]},
 'counter':{cast:{a:[125,186,'You'],b:[232,114,'Mate'],x1:[172,150],x2:[60,150],x3:[250,182],x4:[110,58]},ball:'x1',steps:[
  {note:'They attack your goal'},
  {note:'Win it · look up · space behind',ball:'a',face:{a:30},view:{a:30},zones:[[170,32,126,58,'Space']],tags:[['a','Won it']]},
  {note:'One quick pass forward',at:{b:[256,62]},ball:'b',pulse:['b','Go!']}]},
 'build-out':{pitch:'defend',cast:{k:[165,206,'Keeper'],b:[135,180],c:[195,180],x1:[95,150],x2:[235,150]},ball:'k',steps:[
  {note:'Goal kick · opponents close'},
  {note:'They wait behind the build-out line',at:{x1:[118,92],x2:[224,92]},hint:['M14 112H316'],zones:[[14,114,302,58,'Free space']],tags:[[[62,104],'Build-out line']]},
  {note:'Spread wide · safe first pass',at:{b:[58,164],c:[272,164]},hint:['M14 112H316'],ball:'c'}]},
 'thrower-free':{cast:{t:[300,130,'Thrower'],b:[236,104,'Mate'],c:[236,176,'Mate'],x1:[220,88],x2:[218,160]},ball:[300,114],steps:[
  {note:'Everyone marked except the thrower',tags:[['t','Free']]},
  {note:'Throw to feet · step on',ball:'b',at:{t:[282,92]},order:'pass-first'},
  {note:'Straight back to the thrower',ball:'t',pulse:['t','Free!']}]},
 'block-lane':{pitch:'defend',cast:{xc:[165,62,'Carrier'],xs:[232,182,'Striker'],a:[148,138,'You'],m:[82,188,'Mate']},ball:'xc',steps:[
  {note:'The striker is behind you'},
  {note:'Draw the passing line',at:{a:[160,134]},lanes:[['ball','xs',1]]},
  {note:'Stand on the line · pass blocked',at:{a:[202,124]},lanes:[['ball','xs',0]],tags:[['xc','Blocked']]}]},
 'tempo':{cast:{a:[70,192,'Mate'],b:[165,202,'You'],c:[260,192,'Mate'],x1:[142,112],x2:[188,112],e:[165,58,'Striker']},ball:'a',steps:[
  {note:'The defence is set · no gap',lines:[['x1','x2']]},
  {note:'Quick passes · defenders slide',ball:'c',via:['b'],at:{x1:[210,112],x2:[256,112]},order:'together',lines:[['x1','x2']]},
  {note:'A gap opens · play through',at:{e:[104,62]},ball:'e',via:['b'],zones:[[70,92,110,40,'Gap']]}]},
 'press-trigger':{cast:{a:[172,174,'You'],x:[165,92],xp:[60,62,'Passer']},ball:'xp',steps:[
  {note:'Wait close enough to jump in',tags:[['a','Ready']]},
  {note:'Heavy touch · the ball runs loose',ball:[198,126],via:['x'],tags:[['x','Heavy touch']]},
  {note:'That’s the trigger · press',at:{a:[202,140]},ball:'a',order:'together',pulse:['a','Press!']}]},
 'slide-across':{pitch:'defend',cast:{t1:[70,168],t2:[132,168],t3:[196,168],t4:[276,140],x1:[165,86],x2:[282,96],x3:[222,118]},ball:'x2',steps:[
  {note:'Only one defender moves',rows:[['t1','t2','t3','t4']]},
  {note:'Big gaps near the ball',at:{x3:[232,138]},rows:[['t1','t2','t3','t4']],zones:[[210,132,58,54,'Gap','danger']]},
  {note:'Everyone slides across together',at:{t1:[128,172],t2:[176,170],t3:[226,166]},rows:[['t1','t2','t3','t4']]}]},
 'run-with-ball':{cast:{a:[90,200,'You'],x:[240,52],b:[262,124,'Mate']},ball:'a',steps:[
  {note:'Open grass ahead · don’t stop',zones:[[60,70,130,100,'Open space']]},
  {note:'Big touches · sprint after it',at:{a:[124,128]}},
  {note:'Big gain · now look up',at:{a:[150,92],x:[196,72]},face:{a:40},view:{a:40},lanes:[['ball','b',1]]}]},
 'switch':{cast:{a:[72,165,'You'],m1:[110,110],m2:[42,98],x1:[86,132],x2:[118,150],x3:[60,80],x4:[132,94],f:[250,128,'Mate']},ball:'a',steps:[
  {note:'Everyone crowds this side',zones:[[26,64,130,116,'Crowded','danger']]},
  {note:'Look across · the far side is free',at:{f:[284,110]},face:{a:70},view:{a:70},zones:[[238,62,72,94,'Free side']]},
  {note:'Switch it fast',ball:'f',at:{x2:[172,144]},order:'pass-first'}]},
 'keeper-angle':{pitch:'defend',cast:{x:[222,118,'Shooter'],k:[165,214,'Keeper']},ball:'x',steps:[
  {note:'On the line · lots of goal to aim at',cone:['ball',[145,234],[185,234]],reach:'k'},
  {note:'Step out toward the ball',at:{k:[184,204]},cone:['ball',[145,234],[185,234]],reach:'k'},
  {note:'Less goal to shoot at',at:{k:[196,184]},cone:['ball',[145,234],[185,234]],reach:'k',tags:[['k','Covered']]}]},
 'wall-keeper':{pitch:'defend',cast:{k:[165,212,'Keeper'],w1:[200,150],w2:[236,160,'Wall'],w3:[266,176],xk:[90,96,'Kicker']},ball:'xk',steps:[
  {note:'A free kick near your goal'},
  {note:'The wall blocks one side',at:{w1:[112,158],w2:[134,166],w3:[156,174]},lanes:[['ball',[147,232],0]]},
  {note:'The keeper guards the other side',at:{k:[178,214]},lanes:[['ball',[147,232],0],['ball',[183,232],0]]}]},
 'delay-recover':{pitch:'defend',cast:{xc:[150,96],a:[112,114,'You'],t2:[176,80],t3:[128,76],x2:[240,112]},ball:'xc',steps:[
  {note:'Ball lost · everyone chases',zones:[[100,166,130,52,'Empty','danger']]},
  {note:'Nearest delays · others sprint back',at:{a:[146,128],t2:[234,180],t3:[112,176]},bend:{t2:14,t3:-14}},
  {note:'Slowed down · back in shape',at:{xc:[150,118],a:[150,150],x2:[236,150]}}]},
 'quick-free-kick':{cast:{a:[150,176,'Kicker'],x1:[112,128],x2:[205,112],x3:[240,168],b:[90,66,'Mate']},ball:[165,158],steps:[
  {note:'Opponents walk back slowly',tags:[['x2','Arguing']]},
  {note:'Spot the free teammate',at:{x2:[215,86]},zones:[[62,38,58,54,'Free']]},
  {note:'Restart before they’re ready',ball:'b',pulse:['a','Quick!']}]},
 'square-pass':{pitch:'attack',cast:{a:[272,88,'You'],b:[130,142,'Mate'],xk:[196,42],x:[222,128]},ball:'a',steps:[
  {note:'Tight angle · the keeper covers',lanes:[['ball',[150,24],0]]},
  {note:'Your mate sees the whole goal',at:{b:[160,114]},zones:[[128,88,64,52,'Clear view']],lanes:[['b',[165,24],1]]},
  {note:'Pass across for an easy finish',ball:'b',pulse:['b','Goal!']}]},

 /* Level 3: advanced ideas (11v11 words). */
 'cross-gap':{pitch:'attack',cast:{w:[42,98,'Winger'],xk:[165,34],x1:[128,80],x2:[190,82],a:[152,128,'Striker']},ball:'w',steps:[
  {note:'Keeper and defenders guard the goal'},
  {note:'The gap between keeper and defenders',at:{x1:[128,74],x2:[190,76]},zones:[[98,44,114,22,'Gap']]},
  {note:'Low, fast cross · tap-in',at:{a:[150,54]},ball:'a',order:'together',pulse:['a','Tap in!']}]},
 'sweeper-keeper':{pitch:'defend',cast:{k:[165,208,'Keeper'],b:[100,108],c:[230,108],x:[185,94,'Striker'],xp:[165,40,'Passer']},ball:'xp',steps:[
  {note:'Big space behind your defence',zones:[[40,124,250,54,'Space behind']]},
  {note:'The keeper steps off the line',at:{k:[165,166]}},
  {note:'Long ball · the keeper gets there first',at:{k:[154,146],x:[198,128]},ball:'k',bend:{ball:30},pulse:['k','Keeper’s!']}]},
 'big-small':{cast:{t1:[42,96],t2:[288,96],t3:[165,48],t4:[90,196],t5:[240,196],x1:[165,132],x2:[108,118],x3:[230,112]},ball:'t4',steps:[
  {note:'With the ball: make the pitch big',links:[['t3','t2','t5','t4','t1']]},
  {note:'Ball lost · they have room',ball:'x1',links:[['t3','t2','t5','t4','t1']],zones:[[96,78,138,84,'Room','danger']]},
  {note:'Squeeze: small and tight',at:{t1:[136,124],t2:[198,120],t3:[165,98],t4:[140,166],t5:[196,164]},links:[['t3','t2','t5','t4','t1']],lanes:[['ball','x2',0],['ball','x3',0]]}]},
 'overload-isolate':{pitch:'attack',cast:{a1:[70,132],a2:[108,108],a3:[58,88],ab:[98,152,'Mate'],w:[284,114,'You'],x1:[86,120],x2:[80,70],x3:[130,128],x4:[258,96]},ball:'ab',steps:[
  {note:'Crowd one side · defenders follow',zones:[[30,56,126,112,'4 v 3']]},
  {note:'The far winger waits · one v one',at:{x4:[236,100]},zones:[[232,56,80,112,'1 v 1']]},
  {note:'Switch it fast · take them on',ball:'w',at:{x3:[178,128]},order:'pass-first'}]},
 'zone-14':{pitch:'attack',cast:{a:[250,180,'You'],p:[110,198,'Mate'],x1:[128,74],x2:[205,74],xk:[170,36],w:[286,110,'Winger']},ball:'p',steps:[
  {note:'Defenders guard the box',zones:[[118,88,94,40,'The pocket']]},
  {note:'Drop into the pocket facing goal',at:{a:[168,110]},face:{a:0},ball:'a',order:'together'},
  {note:'Shoot · slip it through · play wide',at:{w:[288,74]},lanes:[['ball',[147,26],1],['ball','w',1],['ball',[114,44],1]],pulse:['a','3 options']}]},
 'counter-press':{pitch:'attack',cast:{x:[165,112],a:[136,140,'You'],b:[200,138],c:[165,70],x2:[70,92],x3:[262,96]},ball:'x',steps:[
  {note:'Lost it · they aren’t ready',clock:['x',.3,'5 seconds']},
  {note:'Nearest three press at once',at:{a:[128,108],b:[210,111],c:[166,86]},lanes:[['ball','x2',0],['ball','x3',0]],clock:['x',.1,'No time']},
  {note:'Won back near their goal',ball:'a',pulse:['a','Won!']}]},
 'underlap':{pitch:'attack',cast:{w:[286,152,'Winger'],x:[284,100],xc:[188,86],a:[222,198,'You']},ball:'w',steps:[
  {note:'The defender blocks the sideline',lanes:[['ball',[284,60],0]]},
  {note:'Run inside the winger',at:{a:[232,148]},zones:[[204,64,52,64,'Half-space']]},
  {note:'Slipped inside · running at goal',at:{a:[228,90]},ball:'a',order:'together'}]},
 'compact-lines':{pitch:'defend',cast:{m1:[100,90],m2:[165,96],m3:[245,92],b1:[110,190],b2:[220,190],x:[230,50,'Carrier'],x2:[250,120]},ball:'x',steps:[
  {note:'Big gap between your lines',rows:[['m1','m2','m3'],['b1','b2']],zones:[[60,106,210,70,'Gap','danger']]},
  {note:'An opponent drops into the gap',at:{x2:[178,142]},rows:[['m1','m2','m3'],['b1','b2']],lanes:[['ball','x2',1]]},
  {note:'Step up and drop in · gap gone',at:{b1:[118,148],b2:[214,152],m2:[196,112]},rows:[['m1','m2','m3'],['b1','b2']],lanes:[['ball','x2',0]]}]},
 'third-man':{cast:{pa:[88,200,'A'],pb:[165,138,'B'],pc:[232,152,'C'],x:[158,177],xb:[165,114]},ball:'pa',steps:[
  {note:'A can’t reach C',lanes:[['pa','pc',0]]},
  {note:'A to B · C starts running',ball:'pb',at:{pc:[252,78]},bend:{pc:-10},order:'together'},
  {note:'B plays C first time · free',ball:'pc',zones:[[226,48,58,46,'Free']],pulse:['pc','Third man!']}]},
 'cover-balance':{pitch:'defend',cast:{x:[95,90],x2:[242,84],p:[90,122,'You'],c:[120,116],b:[148,108]},ball:'x',steps:[
  {note:'All three rush the ball',zones:[[172,90,130,100,'Open','danger']]},
  {note:'One presses, one covers behind',at:{c:[128,156]},label:{p:'Press',c:'Cover'}},
  {note:'The far one tucks in: balance',at:{b:[192,170]},label:{b:'Balance'}}]},
 'drop-drag':{pitch:'attack',cast:{a:[165,78,'Striker'],xc:[165,56],w:[272,118,'Winger'],xf:[256,92],p:[140,200,'Mate']},ball:'p',steps:[
  {note:'The centre-back guards the striker'},
  {note:'Striker drops · the defender follows',at:{a:[165,138],xc:[165,118]},ball:'a',order:'together',zones:[[130,36,72,50,'Space']]},
  {note:'The winger runs inside into the space',at:{w:[190,56]},bend:{w:14},ball:'w',order:'together'}]},
 'up-back-through':{cast:{p:[100,204,'You'],s:[165,96,'Striker'],xs:[165,76],m:[196,156,'Mate'],r:[256,124,'Runner'],x2:[205,86]},ball:'p',steps:[
  {note:'Marked striker · can’t turn',tags:[['xs','Tight']]},
  {note:'Up to the striker, back to a mate',ball:'m',via:['s']},
  {note:'Through to the runner',at:{r:[252,50]},ball:'r',order:'together',pulse:['r','Through!']}]},
 'half-space':{pitch:'attack',overlay:'lanes',cast:{xf:[268,96],xc:[188,90],a:[244,168,'You'],p:[160,204,'Mate']},ball:'p',steps:[
  {note:'Five lanes · two half-spaces',zones:[[74,22,61,212,'Half-space','band'],[195,22,61,212,'Half-space','band']]},
  {note:'Drift between full-back and centre-back',at:{a:[226,112]},label:{xf:'?',xc:'?'},zones:[[195,22,61,212,'Half-space','band']]},
  {note:'Both hesitate · receive and turn',ball:'a',face:{a:0},view:{a:0}}]},
 'short-long':{pitch:'attack',cast:{a1:[150,108,'You'],a2:[190,108,'Mate'],x1:[150,86],x2:[190,86],p:[100,202,'Passer'],xk:[165,36]},ball:'p',steps:[
  {note:'Two attackers, two markers'},
  {note:'One short, one long',at:{a1:[140,160],x1:[144,138],a2:[250,56]},bend:{a2:-12},zones:[[198,50,80,46,'Space']]},
  {note:'Markers split · pass to the free one',ball:'a2',pulse:['a2','Free!']}]},
 'curved-press':{cast:{x1:[110,70],x2:[240,60],a:[205,182,'You']},ball:'x1',steps:[
  {note:'They pass between them',lanes:[['ball','x2',1]]},
  {note:'A straight run leaves the pass open',at:{a:[178,146]},lanes:[['ball','x2',1]],tags:[[[214,124],'Still open']]},
  {note:'Curve it · your body blocks the pass',at:{a:[168,74]},bend:{a:-26},lanes:[['ball','x2',0]]}]},
 'track-runner':{pitch:'defend',cast:{xw:[278,120,'Winger'],a:[178,140,'You'],xr:[150,122],k:[165,212]},ball:'xw',steps:[
  {note:'Watching the ball, not the runner',face:{a:80},view:{a:80},tags:[['a','Ball-watching']]},
  {note:'See the run · go with them',at:{xr:[126,178],a:[150,170]},bend:{xr:-22},face:{a:60},tags:[['xr','Runner']]},
  {note:'The cross comes · you get there first',ball:'a',pulse:['a','Cleared!']}]},
 'squeeze-up':{pitch:'defend',cast:{t1:[70,168],t2:[165,172,'You'],t3:[260,168],x:[130,124],xm:[200,58]},ball:'x',steps:[
  {note:'A straight line near your goal',rows:[['t1','t2','t3']]},
  {note:'They pass backward',ball:'xm',rows:[['t1','t2','t3']]},
  {note:'Step up together · less space',at:{t1:[70,128],t2:[165,128],t3:[260,128],x:[118,100]},rows:[['t1','t2','t3']],tags:[['t2','Squeeze!']]}]},
} satisfies Record<string,Scene>;
export type DiagramKind=keyof typeof SCENES;

/* ─────────────────────────────── Layouts ───────────────────────────────
 * Upright phones (Sep 28 2026): the card has far more free height than the 4:3 pitch uses, so the diagram can be drawn on a
 * taller pitch. Scene coordinates stay written for the landscape box; one affine map (per axis) stretches the playing area
 * to the chosen view box, so the goal stays at the top (attack) / bottom (defend) and "up = forward" holds. Only positions
 * and areas are mapped: token, ring, label and text sizes stay in view-box units, so circles stay round and text upright. */
export const LANDSCAPE:DiagramLayout={w:330,h:248};
const PITCH_X0=14,PITCH_Y0=22,PITCH_W=302,PITCH_H=212;
/** Pitch bounds and the point map for a layout (identity for LANDSCAPE). */
export function pitchMap(l:DiagramLayout){
 const sx=(l.w-28)/PITCH_W,sy=(l.h-36)/PITCH_H,x0=PITCH_X0,y0=PITCH_Y0,x1=l.w-14,y1=l.h-14;
 const same=l.w===LANDSCAPE.w&&l.h===LANDSCAPE.h;
 const map=(p:P):P=>same?p:[r1(x0+(p[0]-x0)*sx),r1(y0+(p[1]-y0)*sy)];
 return {sx,sy,x0,y0,x1,y1,map,X:(x:number)=>map([x,y0])[0],Y:(y:number)=>map([x0,y])[1]};
}
/**
 * The view box for the diagram's free box (CSS px, measured once on open and on resize): the landscape pitch unless the
 * box is clearly taller than 4:5; a squarer box keeps the landscape width, a tall one narrows to 290 units so the tokens
 * and labels also render larger. Heights snap to 16 units so only a handful of layouts (and caches) ever exist.
 */
export function diagramLayout(width:number,height:number):DiagramLayout{
 if(!(width>0&&height>0))return LANDSCAPE;const ratio=Math.min(1.5,height/width);
 if(ratio<.8)return LANDSCAPE;const w=ratio>=1?290:330;return {w,h:Math.max(248,Math.round(w*ratio/16)*16)};
}
const mapPath=(d:string,map:(p:P)=>P)=>{let cx=0,cy=0;const out:string[]=[];
 for(const [,c,args] of d.matchAll(/([MLQHV])([^MLQHV]*)/g)){const n=args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if(c==='H'){for(const x of n){cx=x;out.push('L'+pt(map([cx,cy])));}continue;}
  if(c==='V'){for(const y of n){cy=y;out.push('L'+pt(map([cx,cy])));}continue;}
  const ps:string[]=[];for(let i=0;i+1<n.length;i+=2){cx=n[i];cy=n[i+1];ps.push(pt(map([cx,cy])));}out.push(c+ps.join(' '));}
 return out.join('');};
/** The scene with every point, area and route taken through the layout's map. */
function mapScene(s:Scene,m:ReturnType<typeof pitchMap>):Scene{
 const ref=(r:Ref):Ref=>typeof r==='string'?r:m.map(r);
 const zone=([x,y,w,h,label,tone]:ZoneSpec):ZoneSpec=>{const [a,b]=m.map([x,y]),[c,d]=m.map([x+w,y+h]);return [a,b,r1(c-a),r1(d-b),label,tone];};
 const at=(o?:SceneStep['at'])=>o&&Object.fromEntries(Object.entries(o).map(([id,v])=>{const [x,y]=m.map([v[0],v[1]]);return [id,v.length===3?[x,y,v[2]]:[x,y]];})) as SceneStep['at'];
 return {...s,ball:ref(s.ball),cast:Object.fromEntries(Object.entries(s.cast).map(([id,[x,y,l]])=>{const q=m.map([x,y]);return [id,[q[0],q[1],l]];})) as Scene['cast'],
  steps:s.steps.map(st=>({...st,at:at(st.at),ball:st.ball===undefined?undefined:ref(st.ball),zones:st.zones?.map(zone),lanes:st.lanes?.map(([a,b,o])=>[ref(a),ref(b),o]),
   cone:st.cone&&[ref(st.cone[0]),m.map(st.cone[1]),m.map(st.cone[2])],pulse:st.pulse&&[ref(st.pulse[0]),st.pulse[1]],tags:st.tags?.map(([r,t])=>[ref(r),t]),
   hint:st.hint?.map(h=>mapPath(h,m.map))})) as Scene['steps']};
}

/* ─────────────────────────────── Resolver ─────────────────────────────── */
const RUN_DUR=.9,OPP_LAG=.15;
const dist=(a:P,b:P)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const r1=(n:number)=>Math.round(n*10)/10;
const pt=(p:P)=>`${r1(p[0])} ${r1(p[1])}`;
/** Quadratic control point bowing `bend` px to the right of travel. */
function control(a:P,b:P,bend:number):P|undefined{if(!bend)return undefined;const l=dist(a,b)||1;return [(a[0]+b[0])/2-(b[1]-a[1])/l*bend,(a[1]+b[1])/2+(b[0]-a[0])/l*bend];}
/** Move a point `by` px from `a` toward `b`. */
const toward=(a:P,b:P,by:number):P=>{const l=dist(a,b)||1,k=Math.min(by,l/2)/l;return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];};
function arrowPath(pts:P[],ctrl:P|undefined,trimStart:number,trimEnd:number){
 if(ctrl&&pts.length===2){const s=toward(pts[0],ctrl,trimStart),e=toward(pts[1],ctrl,trimEnd);return `M${pt(s)}Q${pt(ctrl)} ${pt(e)}`;}
 const q=pts.slice();q[0]=toward(q[0],q[1],trimStart);q[q.length-1]=toward(q[q.length-1],q[q.length-2],trimEnd);return 'M'+q.map(pt).join('L');
}
const ballOffset=(role:DiagramNode['role']):P=>role==='opponent'?[10,9]:[10,-9];
const segProject=(a:P,b:P,p:P)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2)),q:P=[a[0]+dx*t,a[1]+dy*t];return {q,d:dist(q,p),t};};
function sector(c:P,angle:number,spread=34,r=80){const a1=(angle-spread)*Math.PI/180,a2=(angle+spread)*Math.PI/180,p1:P=[c[0]+Math.sin(a1)*r,c[1]-Math.cos(a1)*r],p2:P=[c[0]+Math.sin(a2)*r,c[1]-Math.cos(a2)*r];return `M${pt(c)}L${pt(p1)}A${r} ${r} 0 0 1 ${pt(p2)}Z`;}
function shadowPoly(from:P,d:P,m:ReturnType<typeof pitchMap>){const l=dist(from,d)||1,ux=(d[0]-from[0])/l,uy=(d[1]-from[1])/l,px=-uy,py=ux,len=Math.min(95,Math.max(40,190-l*.4));
 const q=(x:number,y:number):P=>[Math.max(m.x0+2,Math.min(m.x1-2,x)),Math.max(m.y0+2,Math.min(m.y1-2,y))];
 return [q(d[0]+px*13,d[1]+py*13),q(d[0]+ux*len+px*38,d[1]+uy*len+py*38),q(d[0]+ux*len-px*38,d[1]+uy*len-py*38),q(d[0]-px*13,d[1]-py*13)].map(pt).join(' ');}

type State={pos:Map<string,P>;labels:Map<string,string>;faces:Map<string,number>;holder:string|null;ball:P};
const roleOf=(id:string):DiagramNode['role']=>id==='ball'?'ball':id.startsWith('x')?'opponent':'team';

const cache=new Map<string,DiagramFrame[]>();
/** All three frames of a scene for a layout (cached per kind and layout; pure). */
export function ballLessonFrames(kind:DiagramKind,layout:DiagramLayout=LANDSCAPE):DiagramFrame[]{
 const key=`${kind}|${layout.w}x${layout.h}`,hit=cache.get(key);if(hit)return hit;
 const pm=pitchMap(layout),scene=mapScene(SCENES[kind] as Scene,pm),frames:DiagramFrame[]=[];
 const st:State={pos:new Map(),labels:new Map(),faces:new Map(),holder:null,ball:[0,0]};
 for(const [id,[x,y,label]] of Object.entries(scene.cast)){st.pos.set(id,[x,y]);st.labels.set(id,label??'');}
 const holderBall=(id:string):P=>{const p=st.pos.get(id)!,o=ballOffset(roleOf(id));return [p[0]+o[0],p[1]+o[1]];};
 if(typeof scene.ball==='string'){st.holder=scene.ball;st.ball=holderBall(scene.ball);}else{st.holder=null;st.ball=scene.ball;}
 let ghosts:Arrow[]=[];
 scene.steps.forEach((step,index)=>{
  const before=new Map(st.pos),ballBefore=st.ball,holderBefore=st.holder;
  for(const [id,v] of Object.entries(step.at??{})){st.pos.set(id,[v[0],v[1]]);if(v.length===3)st.labels.set(id,v[2]);}
  for(const [id,l] of Object.entries(step.label??{}))st.labels.set(id,l);
  for(const [id,a] of Object.entries(step.face??{}))st.faces.set(id,a);
  const reset=!!step.reset||index===0;
  // Ball target.
  const passing=step.ball!==undefined&&!step.dribble;
  if(step.ball!==undefined){if(typeof step.ball==='string'){st.holder=step.ball;st.ball=holderBall(step.ball);}else{st.holder=null;st.ball=step.ball;}}
  else if(st.holder)st.ball=holderBall(st.holder);
  const motions:Motion[]=[],arrows:Arrow[]=[];
  const order=step.order,teamMoved=[...st.pos.keys()].some(id=>roleOf(id)==='team'&&dist(before.get(id)!,st.pos.get(id)!)>1);
  const ballDelay=order==='pass-first'||order==='together'?0:order==='react'?.6:teamMoved?.5:0;
  const runDelay=(id:string)=>order==='pass-first'?(roleOf(id)==='team'?.35:.45):order==='together'?(roleOf(id)==='team'?0:.1):order==='react'?0:(roleOf(id)==='team'?0:OPP_LAG);
  let settle=0;
  if(!reset){
   for(const [id,p] of st.pos){const from=before.get(id)!;if(dist(from,p)<=1)continue;
    const ctrl=control(from,p,step.bend?.[id]??0),delay=runDelay(id),dur=RUN_DUR;motions.push({id,pts:[from,p],ctrl,delay,dur});
    const carrying=!passing&&st.holder===id&&holderBefore===id;
    arrows.push({d:arrowPath([from,p],ctrl,13,15),kind:carrying?'dribble':roleOf(id)==='opponent'?'enemy':'run',delay});settle=Math.max(settle,delay+dur);
    if(carrying){const o=ballOffset(roleOf(id)),bc=ctrl?[ctrl[0]+o[0],ctrl[1]+o[1]] as P:undefined;motions.push({id:'ball',pts:[ballBefore,st.ball],ctrl:bc,delay,dur});}}
   if(dist(ballBefore,st.ball)>1&&!motions.some(m=>m.id==='ball')||step.via){
    const pts:P[]=[ballBefore,...(step.via??[]).map(v=>holderBall(v)),st.ball];let len=0;for(let i=1;i<pts.length;i++)len+=dist(pts[i-1],pts[i]);
    const ctrl=pts.length===2?control(pts[0],pts[1],step.bend?.ball??0):undefined,dur=Math.max(.45,Math.min(1.1,.3+len/330));
    motions.push({id:'ball',pts,ctrl,delay:ballDelay,dur});if(passing)arrows.push({d:arrowPath(pts,ctrl,6,8),kind:'pass',delay:ballDelay});settle=Math.max(settle,ballDelay+dur);}
  }
  const nodePos=(ref:Ref):P=>typeof ref==='string'?(ref==='ball'?st.ball:st.pos.get(ref)!):ref;
  const nodes:DiagramNode[]=[...st.pos].map(([id,[x,y]])=>({id,x,y,label:st.labels.get(id)??'',role:roleOf(id),angle:roleOf(id)==='team'?st.faces.get(id)??0:undefined,dim:step.dim?.includes(id)||undefined,reach:step.reach===id||undefined}));
  nodes.push({id:'ball',x:st.ball[0],y:st.ball[1],label:'',role:'ball'});
  const lanes:Lane[]=(step.lanes??[]).map(([f,t,open])=>{const a=nodePos(f),b=nodePos(t),fromRole=typeof f==='string'?roleOf(f==='ball'?(st.holder??'ball'):f):'team';
   const blockers=[...st.pos].filter(([id])=>roleOf(id)!==fromRole&&roleOf(id)!=='ball').map(([,p])=>segProject(a,b,p)).sort((m,n)=>m.d-n.d);
   // The X sits just in front of the blocking player (toward the ball), so the token never hides it.
   const mark:P=!open&&blockers[0]?toward(blockers[0].q,a,17):[(a[0]+b[0])/2,(a[1]+b[1])/2];
   return {d:arrowPath([a,b],undefined,typeof f==='string'&&f!=='ball'?14:6,typeof t==='string'?15:2),open:!!open,danger:fromRole==='opponent',mark};});
  const line=(ids:string[])=>ids.map(id=>st.pos.get(id)!).sort((m,n)=>m[0]-n[0]);
  const frame:DiagramFrame={layout,pitch:scene.pitch??'full',overlay:step.overlay??scene.overlay,note:step.note,nodes,arrows,ghosts:ghosts.slice(),motions,
   zones:(step.zones??[]).map(([x,y,w,h,label,tone])=>({x,y,w,h,label:label??'',tone:tone??'space'})),lanes,
   lines:[...(step.lines??[]).map((ids,i)=>({pts:line(ids),team:false,broken:!!step.broken?.includes(i)})),...(step.rows??[]).map(ids=>({pts:line(ids),team:true,broken:false}))],
   shadows:step.shadow?[shadowPoly(nodePos(step.shadow[0]),nodePos(step.shadow[1]),pm)]:[],
   links:(step.links??[]).map(ids=>ids.map(id=>pt(st.pos.get(id)!)).join(' ')),
   views:Object.entries(step.view??{}).map(([id,angle])=>sector(st.pos.get(id)!,angle)),
   cone:step.cone?`${pt(nodePos(step.cone[0]))} ${pt(step.cone[1])} ${pt(step.cone[2])}`:undefined,
   pulse:step.pulse?(()=>{const p=nodePos(step.pulse![0]),ball=motions.find(m=>m.id==='ball');return {x:p[0],y:p[1],text:step.pulse![1],delay:reset?0:ball?ball.delay:settle*.6};})():undefined,
   clock:step.clock?(()=>{const p=st.pos.get(step.clock![0])!;return {id:step.clock![0],x:p[0],y:p[1],t:step.clock![1],text:step.clock![2]};})():undefined,
   tags:(step.tags??[]).map(([ref,text])=>{const p=nodePos(ref);return typeof ref==='string'?{x:p[0],y:p[1]-24,text}:{x:p[0],y:p[1],text};}),
   hints:step.hint??[],reset:!!step.reset,settle:reset?0:Math.min(1.4,settle)};
  frames.push(frame);ghosts=[...ghosts,...arrows];
 });
 cache.set(key,frames);return frames;
}
export function ballLessonFrame(kind:DiagramKind,step:number,layout:DiagramLayout=LANDSCAPE):DiagramFrame{const f=ballLessonFrames(kind,layout);return f[Math.max(0,Math.min(f.length-1,step))];}
/** Point on a motion at eased progress k (0..1): quadratic when curved, otherwise along the polyline by length. */
export function motionPoint(m:Motion,k:number):P{
 if(m.ctrl&&m.pts.length===2){const [a,b]=m.pts,c=m.ctrl,u=1-k;return [u*u*a[0]+2*u*k*c[0]+k*k*b[0],u*u*a[1]+2*u*k*c[1]+k*k*b[1]];}
 let total=0;for(let i=1;i<m.pts.length;i++)total+=dist(m.pts[i-1],m.pts[i]);let left=total*k;
 for(let i=1;i<m.pts.length;i++){const l=dist(m.pts[i-1],m.pts[i]);if(left<=l||i===m.pts.length-1){const t=l?Math.min(1,left/l):1;return [m.pts[i-1][0]+(m.pts[i][0]-m.pts[i-1][0])*t,m.pts[i-1][1]+(m.pts[i][1]-m.pts[i-1][1])*t];}left-=l;}
 return m.pts[m.pts.length-1];
}
