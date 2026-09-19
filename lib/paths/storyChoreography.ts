import type {StoryId as AnyStoryId} from './stories';
type StoryId=Exclude<AnyStoryId,'futsl'>;
type Point=readonly [number,number];
export type StoryAction={name:string;hero:readonly Point[];friend:readonly Point[];ball?:readonly Point[];pose?:'bow'|'breathe'|'nod'|'sit'|'celebrate'|'shake';cue?:'miss'|'reset'|'anger'|'breath'|'listen'|'space'|'footwork'|'rest'|'team'|'reflect';seconds:number};
const still=(x:number,y:number):readonly Point[]=>[[x,y],[x,y]];
// Every moment has its own blocking. These finite timelines stop drawing on completion.
export const STORY_ACTIONS:Record<StoryId,readonly StoryAction[]>={
 reset:[
 {name:'Shot wide of the post',hero:still(130,239),friend:still(244,214),ball:[[141,244],[211,166],[237,177]],cue:'miss',seconds:2.8},
 {name:'Shoulders drop after the miss',hero:[[130,239],[118,250]],friend:still(245,213),ball:still(237,177),pose:'bow',seconds:2.4},
 {name:'Catch the unhelpful thought',hero:still(118,250),friend:[[245,213],[230,216]],ball:still(237,177),pose:'shake',seconds:2.6},
 {name:'Remember an earlier useful pass',hero:still(102,247),friend:still(242,219),ball:[[113,252],[181,236],[240,224]],cue:'team',seconds:3},
 {name:'Exhale and reset',hero:still(114,246),friend:still(244,213),pose:'breathe',cue:'reset',seconds:3.4},
 {name:'Turn attention back to play',hero:[[114,246],[130,256],[151,249]],friend:[[245,213],[264,222]],ball:[[220,205],[260,220]],cue:'space',seconds:3.2},
 {name:'Recover into defensive position',hero:[[151,249],[146,230],[135,211]],friend:[[264,222],[246,204]],ball:[[262,226],[247,209]],seconds:3.2},
 {name:'Move wide to offer an angle',hero:[[135,211],[103,226],[67,239]],friend:still(219,217),ball:still(229,222),cue:'space',seconds:3.5},
 {name:'Receive while still disappointed',hero:still(80,241),friend:still(235,221),ball:[[245,226],[161,236],[90,246]],pose:'nod',seconds:3},
 {name:'Check in with a teammate',hero:[[80,241],[110,239]],friend:[[235,221],[216,239]],ball:still(121,244),cue:'team',seconds:3},
 {name:'Rehearse next action after a miss',hero:[[123,235],[123,242],[91,251]],friend:still(229,222),ball:[[134,240],[207,173],[226,181]],cue:'reset',seconds:3.4},
 {name:'Step forward into a new moment',hero:[[91,251],[115,229]],friend:[[229,222],[249,208]],cue:'team',pose:'celebrate',seconds:3}
 ],
 regulate:[
 {name:'Stop at the disputed call',hero:[[150,223],[155,223]],friend:still(267,232),ball:[[164,228],[182,243]],cue:'anger',seconds:2.4},
 {name:'Notice tension in the body',hero:still(155,229),friend:still(270,243),pose:'shake',cue:'anger',seconds:2.5},
 {name:'Pause before responding',hero:[[155,229],[142,239]],friend:still(265,245),ball:still(182,243),cue:'reset',seconds:2.8},
 {name:'Release tension on an exhale',hero:still(142,239),friend:still(265,245),pose:'breathe',cue:'breath',seconds:3.6},
 {name:'Disagree without advancing',hero:[[142,239],[133,244]],friend:still(264,245),pose:'nod',seconds:2.6},
 {name:'Look toward the restart',hero:[[133,244],[111,229]],friend:[[264,245],[263,221]],ball:still(70,204),cue:'space',seconds:3},
 {name:'Recover a useful position',hero:[[111,229],[81,218],[74,202]],friend:still(244,232),ball:still(104,197),seconds:3.6},
 {name:'Walk to the coach at a pause',hero:[[74,202],[117,251],[151,263]],friend:[[270,243],[263,263]],cue:'listen',seconds:4},
 {name:'Ask a trusted adult for support',hero:still(144,261),friend:still(260,261),pose:'nod',cue:'team',seconds:3},
 {name:'Rehearse calm breathing',hero:still(120,254),friend:still(252,244),pose:'breathe',cue:'breath',seconds:3.8},
 {name:'Pause then rejoin the field',hero:[[120,254],[120,254],[101,229]],friend:still(249,248),cue:'reset',seconds:3.4},
 {name:'Choose the next response',hero:[[101,229],[119,215]],friend:[[249,248],[259,243]],pose:'nod',cue:'space',seconds:3}
 ],
 grit:[
 {name:'Turn loses the ball',hero:[[126,228],[143,237],[130,248]],friend:still(269,230),ball:[[137,233],[159,239],[198,257]],cue:'footwork',seconds:3},
 {name:'Rushed attempt runs away',hero:[[119,244],[138,231],[147,249]],friend:still(270,219),ball:[[130,249],[160,224],[221,255]],pose:'bow',seconds:3.2},
 {name:'Step back and inspect the cones',hero:[[147,249],[111,263]],friend:still(266,224),ball:still(220,258),cue:'reflect',seconds:3},
 {name:'Seek one cue from the coach',hero:[[111,263],[148,264]],friend:[[273,224],[264,256]],cue:'listen',seconds:3.5},
 {name:'Practice one controlled touch',hero:[[119,230],[129,230]],friend:still(264,224),ball:[[130,235],[136,235],[140,235]],cue:'footwork',seconds:3.8},
 {name:'Pause to notice a closer touch',hero:still(129,230),friend:still(265,226),ball:still(140,235),pose:'nod',cue:'reflect',seconds:2.8},
 {name:'Link the touch into a curved turn',hero:[[128,232],[132,212],[157,199],[184,211]],friend:still(282,263),ball:[[139,237],[143,217],[168,204],[195,216]],cue:'footwork',seconds:4.4},
 {name:'Overshoot and examine the result',hero:[[135,245],[154,232]],friend:still(274,267),ball:[[146,250],[179,229],[218,214]],cue:'reflect',seconds:3.2},
 {name:'Walk to the bench for recovery',hero:[[154,232],[110,259],[63,268]],friend:[[274,267],[212,259]],pose:'sit',cue:'rest',seconds:4.3},
 {name:'Return with a small goal',hero:[[63,268],[99,250],[126,230]],friend:still(269,224),cue:'footwork',seconds:4},
 {name:'Slow touch and deliberate stop',hero:[[126,230],[136,230],[136,230]],friend:still(269,223),ball:[[137,235],[147,235],[147,235]],pose:'nod',seconds:3.6},
 {name:'Celebrate one small improvement',hero:still(136,230),friend:still(267,225),pose:'celebrate',cue:'team',seconds:3}
 ],
 empathy:[
 {name:'Notice a quiet teammate',hero:[[76,245],[96,242]],friend:still(230,260),pose:'bow',cue:'listen',seconds:3},
 {name:'Observe without assuming',hero:still(96,242),friend:still(230,260),cue:'reflect',seconds:2.8},
 {name:'Approach without crowding',hero:[[67,237],[98,248],[121,258]],friend:still(233,260),cue:'space',seconds:3.6},
 {name:'Offer company or space',hero:still(121,258),friend:still(233,260),pose:'nod',cue:'listen',seconds:3},
 {name:'Wait and listen',hero:still(117,258),friend:[[233,260],[233,257]],cue:'listen',seconds:3.8},
 {name:'Acknowledge the difficult moment',hero:[[117,258],[121,260]],friend:still(234,257),pose:'nod',cue:'team',seconds:3},
 {name:'Stay beside the feeling',hero:still(117,260),friend:still(235,259),cue:'listen',seconds:3.2},
 {name:'Give requested breathing room',hero:[[117,260],[88,251],[68,240]],friend:still(232,260),cue:'space',seconds:3.6},
 {name:'Offer an easy passing lane',hero:[[68,240],[85,218],[106,215]],friend:[[232,260],[234,243]],ball:still(244,248),cue:'team',seconds:3.5},
 {name:'Exchange a gentle return pass',hero:still(106,215),friend:still(234,243),ball:[[244,248],[116,220],[244,248]],cue:'team',seconds:4.6},
 {name:'Let the teammate choose to rejoin',hero:[[106,215],[103,201]],friend:[[234,243],[234,243],[226,213]],cue:'space',seconds:4},
 {name:'Walk back together with room',hero:[[103,237],[112,216]],friend:[[229,237],[238,216]],pose:'nod',cue:'team',seconds:3.5}
 ],
 loss:[
 {name:'Final whistle and a still ball',hero:[[134,221],[124,236]],friend:[[259,217],[246,232]],ball:[[152,235],[165,243]],pose:'bow',seconds:3},
 {name:'Take a quiet moment',hero:[[124,236],[103,253]],friend:still(249,242),pose:'bow',cue:'rest',seconds:3},
 {name:'Ask for time before reflecting',hero:[[103,253],[85,263]],friend:[[249,242],[219,253]],cue:'space',seconds:3.2},
 {name:'Step away from the scoreboard',hero:[[85,263],[66,268]],friend:still(216,255),cue:'reflect',seconds:3},
 {name:'Rest at the bench and recover',hero:still(62,267),friend:[[233,247],[186,266]],pose:'sit',cue:'rest',seconds:3.8},
 {name:'Reconnect without hiding disappointment',hero:[[62,267],[86,267]],friend:[[220,250],[208,264]],cue:'team',seconds:3.5},
 {name:'Recall a useful team effort',hero:still(94,239),friend:still(246,219),ball:[[105,244],[165,232],[256,224]],cue:'reflect',seconds:3.2},
 {name:'Remember supporting the ball',hero:[[94,239],[72,221],[79,203]],friend:still(242,222),ball:still(252,227),cue:'space',seconds:3.6},
 {name:'Identify an option for next practice',hero:[[112,252],[91,233]],friend:[[256,228],[253,210]],ball:still(263,215),cue:'reflect',seconds:3.2},
 {name:'Work together without blame',hero:still(90,233),friend:still(245,210),ball:[[255,215],[100,238],[255,215]],cue:'team',seconds:4.3},
 {name:'Leave carrying one lesson',hero:[[90,233],[105,263]],friend:[[245,210],[240,262]],cue:'reset',seconds:3.8},
 {name:'Walk toward tomorrow together',hero:[[105,263],[125,241]],friend:[[240,262],[261,240]],pose:'nod',cue:'team',seconds:3.4}
 ]
};
export function sampleRoute(route:readonly Point[],t:number):Point{const step=Math.max(0,Math.min(1,t))*(route.length-1),i=Math.min(route.length-2,Math.floor(step)),f=step-i;return [route[i][0]+(route[i+1][0]-route[i][0])*f,route[i][1]+(route[i+1][1]-route[i][1])*f];}
