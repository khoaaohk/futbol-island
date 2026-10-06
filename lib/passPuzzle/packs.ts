/**
 * Pass Puzzles expansion packs (G5, Oct 2026). Original puzzles; each teaches one real idea and uses one
 * new mechanic: called runs (drag a teammate's run), the offside trap, the counter-attack clock, a
 * hunting presser, a sweeper keeper, set-piece walls, and wind and rain. Every route is proven by
 * tests/pass-puzzle-packs.cjs through readStroke, like the core packs.
 */
import type {Scenario,Kick,KickKind,Vec2} from './types';

export type Pack={id:string;order:number;title:string;blurb:string;
  /** Stars (all packs) needed to open this pack on the pack map. */
  gate:number};
/** A route step: a drawn kick, or a run called for a teammate (drag from them) before the next kick. */
export type Step=Kick|{call:{attacker:number;to:Vec2}};
export const isCall=(s:Step):s is {call:{attacker:number;to:Vec2}}=>'call' in s;

export const EXTRA_PACKS:Pack[]=[
  {id:'timing',order:2.5,title:'Timing & Runs',blurb:'Drag a teammate to send their run. Stay onside, beat the trap, make a decoy run.',gate:6},
  {id:'counter',order:3.5,title:'Counter-Attack',blurb:'Win it and go: quick forward passes before the defence gets back.',gate:14},
  {id:'set-pieces',order:4.5,title:'Set Pieces',blurb:'Free kicks over and around the wall, and corner routines.',gate:22},
  {id:'weather',order:4.8,title:'Wind & Rain',blurb:'Read the weather: wind moves a high ball, a wet pitch makes it skid.',gate:28},
];

const SMALL={halfWidth:20,length:50,goalWidth:6};      // goal line z = 25
const MID={halfWidth:25,length:60,goalWidth:7.32};     // goal line z = 30
const P=(x:number,z:number):Vec2=>({x,z});
const same=(a:string,b:string,c:string)=>({'7v7':a,'9v9':b,'11v11':c});
const req=(minPasses:number,extra:Partial<Scenario['require']>={}):Scenario['require']=>({minPasses,finish:'goal',offside:true,...extra});

export const EXTRA_SCENARIOS:Scenario[]=[
  /* ───────────── Timing & Runs ───────────── */
  {id:'tr-make-the-run',pack:'timing',title:'Make the Run',concept:'called-run',
    brief:same('Your friend is standing still. Drag them into space, then pass there!',
      'A defender blocks the pass to feet. Drag your striker\'s run into space, then play the ball into it.',
      'The pass to feet is screened. Call the striker\'s run into the space behind, then play it into the run.'),
    hint:same('Drag from your friend to the space. Then pass to that spot.',
      'Start your drag on the teammate to send them running. Then aim at where they are going.',
      'Movement makes the pass: send the run first, then weight the ball into the space it attacks.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:6},{x:-5,z:13}],
    defenders:[{x:-2.75,z:10},{x:7,z:18}],keeper:{x:0,z:24},
    attempts:3,require:req(1),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A run into space makes a pass possible that was blocked before.'},
  {id:'tr-beat-the-trap',pack:'timing',title:'Beat the Trap',concept:'offside-trap',
    brief:same('The defenders step up together. Pass to the friend running from behind!',
      'The back line steps up to catch your striker offside. Find the runner coming from deep instead.',
      'They play an offside trap. A runner from deep beats it, because they start behind the line.'),
    hint:same('The friend at the back is not offside. Pass into their run.',
      'Watch the arrows: the line moves up. The deep runner is onside when you pass.',
      'Play it the moment the deep runner arrives at the line, into the space behind it.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:4},{x:3,z:14,run:{delay:0,path:[P(3,22)]}},{x:-3,z:8,run:{delay:0,path:[P(-1,22)]}}],
    defenders:[{x:-5,z:14.5,trap:3},{x:6,z:14.5,trap:3}],keeper:{x:0,z:24},
    attempts:3,require:req(1),bonus:{kind:'scorer',scorer:2,label:'The deep runner scores'},
    lesson:'A runner from deep beats an offside trap: they start behind the line.'},
  {id:'tr-decoy-run',pack:'timing',title:'Decoy Run',concept:'decoy-run',
    brief:same('Send your striker wide. Their defender follows. Then pass through the middle!',
      'Your striker\'s marker follows them. Drag the striker wide to open the middle, then play your runner in.',
      'Use a decoy run: the striker drags the centre-back wide, and the runner attacks the gap left behind.'),
    hint:same('First pass to the side friend. Send the striker away. Then pass to the middle.',
      'A run without the ball can still win the game: it moves a defender.',
      'Time the decoy with the first pass, then hit the vacated central channel.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:6},{x:0,z:15},{x:7,z:11},{x:2,z:10}],
    defenders:[{x:0,z:16.3,mark:1},{x:-6,z:12}],keeper:{x:0,z:24},
    attempts:3,require:req(2),bonus:{kind:'scorer',scorer:3,label:'The runner scores'},
    lesson:'A decoy run pulls a defender away and opens space for a teammate.'},
  {id:'tr-get-back-onside',pack:'timing',title:'Get Back Onside',concept:'recover-onside',
    brief:same('Your striker is past the defenders. That is offside! Bring them back first.',
      'Your striker is in an offside spot. Pass inside while they drop back, then send them through.',
      'The striker is caught offside. Recycle inside while they come back onside, then release their run in behind.'),
    hint:same('Drag your striker back. Pass to the middle. Then send them running.',
      'Look for the orange flag. Drop the striker behind the line before you play forward.',
      'Reset the run: drop behind the last defender as the ball goes wide, then attack the space.'),
    pitch:SMALL,carrier:0,attackers:[{x:-9,z:9},{x:1,z:17},{x:1,z:9}],
    defenders:[{x:-4,z:15},{x:5,z:15}],keeper:{x:0,z:24},
    attempts:3,require:req(2),bonus:{kind:'scorer',scorer:1,label:'The striker scores'},
    lesson:'You can only be offside when the ball is played. Get back behind the line first.'},
  /* ───────────── Counter-Attack ───────────── */
  {id:'ca-sweeper-keeper',pack:'counter',title:'Rushing Keeper',concept:'sweeper-keeper',
    brief:same('This keeper runs out fast. Pass wide of them, not straight at them!',
      'The keeper sweeps up balls played straight in behind. Play it into the wide channel instead.',
      'A sweeper-keeper claims central through balls. Weight the pass into the channel, away from the keeper\'s line.'),
    hint:same('Pass to the friend running down the side.',
      'Keep the through ball away from the middle, where the keeper comes.',
      'Play it wide of the keeper, then finish across goal before they recover.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:5},{x:0,z:12,run:{delay:0,path:[P(0,19)]}},{x:9,z:12,run:{delay:0,path:[P(8,20)]}}],
    defenders:[{x:-3,z:14},{x:3,z:14}],keeper:{x:0,z:21,sweeper:true},
    attempts:3,require:req(1),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'Against a rushing keeper, play the ball wide of them and finish across goal.'},
  {id:'ca-escape-the-hunter',pack:'counter',title:'Escape the Hunter',concept:'beat-the-press',
    brief:same('A defender chases the ball. Pass to a free friend first, then forward!',
      'A hunter presses whoever has the ball, so a forward pass gets blocked. Find the free teammate first.',
      'A pressing forward hunts every receiver. Release the pressure with a pass to the free side, then break the line.'),
    hint:same('The hunter blocks the way forward. Pass to the side first.',
      'The teammate the hunter is not near has time to look forward.',
      'Play away from the press; the free player can then pick the forward pass.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:0,run:{delay:.2,afterPass:true,path:[P(-2,7)]}},{x:-9,z:2},{x:8,z:-2},{x:3,z:13}],
    defenders:[{x:2.5,z:2,hunt:true},{x:-1.5,z:8.5},{x:8,z:15}],keeper:{x:0,z:24},
    attempts:3,require:req(2),bonus:{kind:'scorer',scorer:3,label:'The striker scores'},
    lesson:'A press can only cover one side. Pass away from it, then go forward.'},
  {id:'ca-break-fast',pack:'counter',title:'Break Fast',concept:'counter-forward-pass',
    brief:same('You won the ball! The defenders are running back. Pass forward fast!',
      'You just won it back. Their defenders sprint home, so play forward before they recover.',
      'Transition moment: the opposition is out of shape. Play the first pass forward before they recover.'),
    hint:same('Look forward first. Your striker is already running.',
      'The first pass should go forward into the striker\'s run.',
      'Fewer touches, forward passes: every sideways pass gives them time to get back.'),
    pitch:SMALL,carrier:0,attackers:[{x:-2,z:-6},{x:4,z:2,run:{delay:0,path:[P(3,18)]}},{x:-10,z:2}],
    defenders:[{x:8,z:4,recover:true},{x:-5,z:3,recover:true}],keeper:{x:0,z:24},
    attempts:3,require:req(1,{clock:5}),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'On a counter-attack, pass forward fast before the defenders get back.'},

  /* ───────────── Set Pieces ───────────── */
  {id:'sp-lay-it-off',pack:'set-pieces',title:'Lay It Off',concept:'free-kick-routine',
    brief:same('The wall is big. Pass to your friend first. Then shoot!',
      'The wall blocks a direct shot. Roll it square to your teammate, who shoots from a new angle.',
      'Use a free-kick routine: the square lay-off moves the ball past the wall\'s edge for a clear strike.'),
    hint:same('A short pass to the side opens the goal.',
      'The new angle goes past the end of the wall.',
      'Move the ball sideways to beat the wall\'s angle, then strike first time.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:7},{x:-5,z:7.5}],
    defenders:[{x:-1.2,z:16},{x:-.4,z:16},{x:.4,z:16},{x:1.2,z:16}],keeper:{x:.6,z:24},
    attempts:3,require:req(1),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A short free-kick routine changes the angle around the wall.'},
  {id:'sp-over-the-top',pack:'set-pieces',title:'Over the Top',concept:'free-kick-in-behind',
    brief:same('Free kick! Send your friend running, then lift the ball over the defenders.',
      'Their line is flat. Call a run as you take the free kick and chip it into the space behind.',
      'A deep free kick against a flat back four: time the run with the strike and drop it in behind the line.'),
    hint:same('Drag your friend toward goal. Then hold at the end to lift it behind them.',
      'The run starts when you kick, so your friend stays onside. Lift the ball over the line.',
      'Start the run on the strike to stay onside, and weight the chip to land in the runner\'s path.'),
    pitch:MID,carrier:0,attackers:[{x:0,z:0},{x:-4,z:13.4},{x:5,z:13.4}],
    defenders:[{x:-9,z:14.2},{x:-3,z:14.2},{x:3,z:14.2},{x:9,z:14.2}],keeper:{x:0,z:29},
    attempts:3,require:req(1),bonus:{kind:'chip',label:'Chip it over the line'},
    lesson:'Start your run as the ball is kicked to stay onside behind a flat line.'},
  {id:'sp-round-the-wall',pack:'set-pieces',title:'Round the Wall',concept:'free-kick-curl',
    brief:same('Free kick! A wall blocks the goal. Bend it around the wall!',
      'A wall blocks the near post. Curl your free kick around the outside of it.',
      'The wall covers the near post and the keeper covers the far side. Bend it around the wall into the corner.'),
    hint:same('Draw a curved line around the wall to the goal.',
      'Bow your line out past the wall. The ball swings back in.',
      'Start it outside the wall with side spin; it bends back inside the post.'),
    pitch:SMALL,carrier:0,attackers:[{x:5,z:6}],
    defenders:[{x:3.4,z:15},{x:4.1,z:15},{x:4.8,z:15}],keeper:{x:-.8,z:24},
    attempts:3,require:req(0),bonus:{kind:'curl',label:'Bend it in'},
    lesson:'Side spin bends a free kick around the wall.'},

  /* ───────────── Wind & Rain ───────────── */
  {id:'wr-wet-pitch',pack:'weather',title:'Wet Pitch',concept:'wet-pitch-weight',
    brief:same('The grass is wet. The ball slides far! Pass softer.',
      'On a wet pitch the ball skids on. Play a softer pass so it stops for your runner.',
      'The surface is slick: weight the through ball shorter, or it skids through to the keeper.'),
    hint:same('Aim before your friend. The ball keeps going.',
      'Draw a shorter line. Watch where the dotted path stops.',
      'Underhit it slightly: the wet grass carries the ball the extra metres.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:6},{x:3,z:12,run:{delay:0,path:[P(2,17)]}}],
    defenders:[{x:-4,z:12},{x:9,z:17}],keeper:{x:0,z:23,sweeper:true},weather:{wet:true},
    attempts:3,require:req(1),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'On a wet pitch the ball skids, so pass a little softer.'},
  {id:'wr-into-the-wind',pack:'weather',title:'Into the Wind',concept:'wind-ground-pass',
    brief:same('It is windy! A high ball gets blown back. Keep the pass on the ground!',
      'The wind blows into your face. A lofted pass hangs and drops short, so play it along the grass.',
      'Strong headwind: a lofted ball will balloon and die. Play it on the deck through the gap instead.'),
    hint:same('Do not hold at the end. Draw a straight, low pass.',
      'Watch the dotted line bend in the wind. Ground passes do not.',
      'Low passes ignore the wind; find the gap between the two midfielders.'),
    pitch:SMALL,carrier:0,attackers:[{x:0,z:0},{x:1,z:14}],
    defenders:[{x:-3.5,z:8},{x:4,z:8},{x:-6,z:17}],keeper:{x:0,z:24},weather:{wind:{x:0,z:-3.2}},
    attempts:3,require:req(1),bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'In a strong wind, keep the ball on the ground.'},
];


const K=(kind:KickKind,x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:.5,...o});
const C=(attacker:number,x:number,z:number):Step=>({call:{attacker,to:{x,z}}});
export type PackSolution={solution:Step[];naive:Step[]};
export const EXTRA_SOLUTIONS:Record<string,PackSolution>={
  'tr-make-the-run':{solution:[C(1,-2,19),K('pass-space',-2,18.5,{receiver:1}),K('shot',2.75,25)],naive:[K('pass-feet',-5,13,{receiver:1})]},
  'tr-get-back-onside':{solution:[C(1,1,13.5),K('pass-feet',1,9,{receiver:2}),C(1,1,22),K('pass-space',1,20,{receiver:1}),K('shot',-2.75,25)],naive:[K('pass-feet',1,17,{receiver:1})]},
  'tr-beat-the-trap':{solution:[K('pass-space',-3,19,{receiver:2}),K('shot',-2.75,25)],naive:[K('pass-space',3,19,{receiver:1})]},
  'tr-decoy-run':{solution:[C(1,-8,18),K('pass-feet',7,11,{receiver:2}),C(3,1,20),K('pass-space',1,19,{receiver:3}),K('shot',-2.75,25)],naive:[C(3,1,20),K('pass-space',1,19,{receiver:3})]},
  'ca-break-fast':{solution:[K('pass-space',2,14,{receiver:1}),K('shot',-2.75,25)],naive:[K('pass-feet',-10,2,{receiver:2}),K('pass-space',3,16,{receiver:1}),K('shot',-2.75,25)]},
  'ca-escape-the-hunter':{solution:[K('pass-feet',-9,2,{receiver:1}),K('pass-feet',8,-2,{receiver:2}),K('pass-feet',3,13,{receiver:3}),K('shot',-2.75,25)],naive:[K('pass-feet',-9,2,{receiver:1}),K('pass-feet',3,13,{receiver:3})]},
  'ca-sweeper-keeper':{solution:[K('pass-space',9,17,{receiver:2}),K('shot',-2.75,25)],naive:[K('pass-space',0,20,{receiver:1})]},
  'sp-round-the-wall':{solution:[K('shot',2.2,25,{curl:-1})],naive:[K('shot',2.75,25)]},
  'sp-lay-it-off':{solution:[K('pass-feet',-5,7.5,{receiver:1}),K('shot',-2.75,25)],naive:[K('shot',2.75,25)]},
  'sp-over-the-top':{solution:[C(1,-5,21),K('pass-space',-6,18.5,{receiver:1,loft:.3}),K('shot',-3.4,30)],naive:[K('pass-space',-4,21,{receiver:1})]},
  'wr-into-the-wind':{solution:[K('pass-feet',1,14,{receiver:1}),K('shot',-2.75,25)],naive:[K('pass-feet',1,14,{receiver:1,loft:.4})]},
  'wr-wet-pitch':{solution:[K('pass-space',0,14.5,{receiver:1}),K('shot',-2.75,25)],naive:[K('pass-space',2,18.5,{receiver:1})]},
};
