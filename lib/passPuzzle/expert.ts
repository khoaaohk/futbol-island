/**
 * Pass Puzzles EXPERT tier (round 3, Oct 26 2026). Two hard packs at the top of the pack map for kids who
 * have learned the basics: longer pass chains, tighter lanes, defenders who move (hunters, recovering
 * runners, offside traps) and, on some, the counter-attack clock. Every idea was taught in an earlier pack;
 * here they are combined. Every route is proven by tests/pass-puzzle-r3-expert.cjs through readStroke.
 */
import type {Scenario,Kick,KickKind,Vec2} from './types';
import type {Pack,PackSolution,Step} from './packs';

export const EXPERT_PACKS:Pack[]=[
  {id:'expert-combos',order:6,title:'Expert Combos',blurb:'Hunters, traps and the clock. Think two passes ahead.',gate:50,tier:'expert'},
  {id:'expert-final',order:6.5,title:'Expert Final',blurb:'Long moves of three and four passes. Keep every pass quick.',gate:66,tier:'expert'},
];

/** One short, kid-friendly line per new expert idea (shown on the brief tip and the pack sheet). */
export const EXPERT_CONCEPTS:Record<string,string>={
  'chain-under-press':'A chain of quick passes beats a chasing defender.',
  'switch-then-through':'Move the ball across, then go forward where it is free.',
  'one-two-on-the-clock':'Pass and run: a one-two is the fastest way to goal.',
  'trap-and-hunter':'Pass early to the runner from deep, before the trap and the hunter close.',
  'four-pass-move':'Four good passes in a row: keep the ball moving and find the free friend.',
  'set-and-switch':'Bounce it off the striker, then switch it to the far side.',
};

const SMALL={halfWidth:20,length:50,goalWidth:6};      // goal line z = 25
const MID={halfWidth:25,length:60,goalWidth:7.32};     // goal line z = 30
const P=(x:number,z:number):Vec2=>({x,z});
const same=(a:string,b:string,c:string)=>({'7v7':a,'9v9':b,'11v11':c});
const req=(minPasses:number,extra:Partial<Scenario['require']>={}):Scenario['require']=>({minPasses,finish:'goal',offside:true,...extra});

export const EXPERT_SCENARIOS:Scenario[]=[
  /* ───────────── Expert Combos (teaching order = measured difficulty 51 → 81) ───────────── */
  {id:'ex-trap-and-hunter',pack:'expert-combos',title:'Trap and Hunter',concept:'trap-and-hunter',
    brief:same('The line steps up and a hunter chases. Pass to the runner from behind, fast!',
      'An offside trap and a hunter at once. Release the deep runner quickly, before both close in.',
      'They press the ball and spring a trap. A quick pass into the runner from deep beats both.'),
    hint:same('Do not wait. Pass to the friend running from the back.',
      'The striker will be caught offside. The deep runner starts behind the line.',
      'Release early: the hunter closes the angle and the line steps up if you wait.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:4},{x:3,z:14,run:{delay:0,path:[P(3,22)]}},{x:-3,z:8,run:{delay:0,path:[P(-1,22)]}}],
    defenders:[{x:-5,z:14.5,trap:3},{x:6,z:14.5,trap:3},{x:3,z:7,hunt:true}],keeper:{x:0,z:24},
    attempts:3,require:req(1,{clock:5}),bonus:{kind:'scorer',scorer:2,label:'The deep runner scores'},
    lesson:'Against a trap and a press, pass early to the runner from deep.'},
  {id:'ex-switch-then-through',pack:'expert-combos',title:'Switch and Go',concept:'switch-then-through',
    brief:same('The defenders crowd one side. Pass across, then send the runner to goal!',
      'One side is packed. Switch it to the free side, then play the runner in behind on the clock.',
      'They overload the ball side. Switch play, then hit the through ball before the line recovers.'),
    hint:same('Pass to the middle friend. They pass to the far friend. Then go!',
      'Two passes move it across. The far friend has space to play the runner.',
      'Circulate through the pivot to the weak side, then release the run in behind.'),
    pitch:{halfWidth:25,length:60,goalWidth:7.32},carrier:0,
    attackers:[{x:-4,z:4},{x:-3,z:12},{x:8.5,z:15.5,run:{delay:1.2,path:[P(6,20.5)]}}],
    defenders:[{x:-5,z:16},{x:3,z:10},{x:-8,z:7,hunt:true}],keeper:{x:0,z:29},
    attempts:3,require:req(2,{clock:7}),bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
    lesson:'Move the ball to the free side, then go forward fast.'},
  {id:'ex-chain-under-press',pack:'expert-combos',title:'Pass Around the Press',concept:'chain-under-press',
    brief:same('A hunter chases every pass. Pass left, pass right, then find the striker!',
      'A hunter presses each receiver and the clock is on. Move it left, switch it right, then play the striker in.',
      'The hunter presses every receiver and you are on the clock. Circulate quickly, switch, then break the line.'),
    hint:same('Do not pass forward first. Go to the free side two times.',
      'Each pass pulls the hunter. Two quick side passes leave the right side free.',
      'Play away from the press twice; the far-side player has time to find the striker.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:0,run:{delay:.2,afterPass:true,path:[P(-2,7)]}},{x:-9,z:2},{x:8,z:-2},{x:3,z:13}],
    defenders:[{x:2.5,z:2,hunt:true},{x:-1.5,z:8.5},{x:8,z:15},{x:-6,z:12,recover:true}],keeper:{x:0,z:24},
    attempts:3,require:req(3,{clock:9}),bonus:{kind:'scorer',scorer:3,label:'The striker scores'},
    lesson:'Quick passes away from a hunter keep the ball. Then the forward pass is open.'},
  /* ───────────── Expert Final (80 → 83) ───────────── */
  {id:'ex-four-pass-move',pack:'expert-final',title:'Four in a Row',concept:'four-pass-move',
    brief:same('Make four passes, then score. Each friend is free for just a moment.',
      'Four passes before the finish. Bounce it off the striker, find the runner, and keep it moving.',
      'A four-pass move against a compact block: wall pass off the striker, then keep the ball moving to the free man.'),
    hint:same('Pass up to the striker. They pass to the runner. Keep going!',
      'The striker sets it to the runner. The runner looks for the next free friend.',
      'Use the striker as a wall, then circulate quickly: the last pass goes to the unmarked player.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:5},{x:-4,z:16},{x:4,z:10,run:{delay:.3,path:[P(4,13.5)]}},{x:-9,z:11}],
    defenders:[{x:2.3,z:9.8},{x:-4,z:17.5,mark:1},{x:-6,z:7}],keeper:{x:0,z:24},
    attempts:3,require:req(4),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A long move needs quick, simple passes to whoever is free.'},
  {id:'ex-set-and-switch',pack:'expert-final',title:'Set and Switch',concept:'set-and-switch',
    brief:same('Pass up, get it back, then find the far runner. A hunter is coming!',
      'Up, back and through, with a hunter chasing every pass. Keep each touch quick.',
      'Up, back, through against a hunter: the set-back changes the angle before the press arrives.'),
    hint:same('Striker first. Then the friend in the middle. Then the far runner.',
      'The striker cannot turn. The friend who gets it back can see the runner.',
      'Bounce off the striker; the set-back receiver plays the far runner in before the hunter closes.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:3},{x:-1.8,z:15},{x:-2.5,z:6.5},{x:13,z:11,run:{delay:1.5,path:[P(9,17.5)]}}],
    defenders:[{x:-1.8,z:16.4,mark:1},{x:4.8,z:6.9},{x:-5,z:18},{x:-9,z:13},{x:6,z:1,hunt:true}],keeper:{x:0,z:24},
    attempts:3,require:req(3,{clock:6}),bonus:{kind:'scorer',scorer:3,label:'The far runner scores'},
    lesson:'Up, back and through still works under pressure if every pass is quick.'},
  {id:'ex-one-two-clock',pack:'expert-final',title:'Fast One-Two',concept:'one-two-on-the-clock',
    brief:same('Quick! Pass, get it back, then find the free friend. A defender runs back.',
      'The clock is on and a defender sprints back. Play the one-two, then square it to the free player.',
      'On the clock with a recovering defender: one-two around the presser, then square it for the spare man.'),
    hint:same('Pass left. Run and get it back. Then pass right.',
      'Your friend on the left plays it back into your run. Then the right side is free.',
      'Give and go, then one more pass: the recovering defender can only cover one of you.'),
    pitch:{halfWidth:25,length:50,goalWidth:6},carrier:0,
    attackers:[{x:0,z:11,run:{delay:.05,afterPass:true,path:[P(2,14),P(2,19)]}},{x:-6,z:14.5},{x:9,z:19.5}],
    defenders:[{x:.5,z:14,press:true},{x:0,z:22},{x:-9,z:9,recover:true}],keeper:{x:0,z:24},
    attempts:3,require:req(3,{clock:6}),bonus:{kind:'scorer',scorer:2,label:'The free friend scores'},
    lesson:'A fast one-two beats a defender. One more pass finds the free friend.'},
];

const K=(kind:KickKind,x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:.5,...o});
const C=(attacker:number,x:number,z:number):Step=>({call:{attacker,to:{x,z}}});
void C;void P;void MID;

export const EXPERT_SOLUTIONS:Record<string,PackSolution>={
  'ex-chain-under-press':{solution:[K('pass-feet',-9,2,{receiver:1}),K('pass-feet',8,-2,{receiver:2}),K('pass-feet',3,13,{receiver:3}),K('shot',2.75,25)],naive:[K('pass-feet',3,13,{receiver:3})]},
  'ex-one-two-clock':{solution:[K('pass-feet',-6,14.5,{receiver:1,power:.2259}),K('pass-space',2,17.5,{receiver:0,power:.2565}),K('pass-feet',9,19.5,{receiver:2,power:.2654}),K('shot',2.75,25,{power:.2726})],naive:[K('pass-feet',-6,14.5,{receiver:1}),K('pass-space',2,17.5,{receiver:0}),K('shot',-2.75,25)]},
  'ex-four-pass-move':{solution:[K('pass-feet',-4,16,{receiver:1,power:.38}),K('pass-feet',4,13,{receiver:2,power:.24}),K('pass-feet',-9,11,{receiver:3}),K('pass-feet',4,13,{receiver:2}),K('shot',-2.6,25)],naive:[K('pass-feet',-4,16,{receiver:1}),K('pass-feet',4,13,{receiver:2}),K('shot',-2.6,25)]},
  'ex-trap-and-hunter':{solution:[K('pass-space',-3,19,{receiver:2}),K('shot',-2.75,25)],naive:[K('pass-space',3,19,{receiver:1})]},
  'ex-set-and-switch':{solution:[K('pass-feet',-1.8,15,{receiver:1}),K('pass-feet',-2.5,6.5,{receiver:2}),K('pass-space',4.8,19.7,{receiver:3}),K('shot',-2.75,25)],naive:[K('pass-space',4.8,19.7,{receiver:3}),K('shot',-2.75,25)]},
  'ex-switch-then-through':{solution:[K('pass-feet',-3,12,{receiver:1,power:.26}),K('pass-space',2,18.5,{receiver:2,power:.32}),K('shot',-3.4,30,{power:.49})],naive:[K('pass-feet',8.5,15.5,{receiver:2}),K('shot',-3.4,30)]},
};
