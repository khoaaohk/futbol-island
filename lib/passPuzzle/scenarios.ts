/**
 * Pass Puzzle scenarios (lane D). Original Futbol Island puzzles: every one teaches a real
 * tactical idea, and its brief, hint and lesson are written three ways, scaled by format:
 * 7v7 (ages 7–9, short everyday words) → 9v9 (names the idea) → 11v11 (tactical vocabulary).
 *
 * Pitch frame (lib/passPuzzle/types.ts): x across, z up the pitch, the attacking goal line at
 * z = +length/2. Geometry is proven by tests/pass-puzzle-scenarios.cjs: the stored solution
 * succeeds with the engine and the naive direct option is cut out, blocked or saved.
 */
import type {Scenario,Kick,KickKind,Vec2} from './types';

export type PackId='first-passes'|'team-moves'|'beat-the-press'|'in-the-air';
export type Pack={id:PackId;order:number;title:string;blurb:string};

export const PACKS:Pack[]=[
  {id:'first-passes',order:1,title:'First Passes',blurb:'Into feet, into space, bend it round and lift it over.'},
  {id:'team-moves',order:2,title:'Team Moves',blurb:'Give-and-go, the third friend, the overlap, the switch and the cutback.'},
  {id:'beat-the-press',order:3,title:'Beat the Press',blurb:'Bounce passes, starting with the keeper and breaking lines.'},
  {id:'in-the-air',order:4,title:'In the Air',blurb:'Crosses, corners and headers: near post, far post, flick-ons and knock-downs.'},
];

/* pitches (metres). Goal widths pick the crossbar: 6 m → 2.13 m, 7.32 m → 2.44 m.
   SMALL keeps the smaller goal; finishing spots are chosen inside the keeper's reliable-miss zone. */
const SMALL={halfWidth:20,length:50,goalWidth:6};      // goal line z = 25
const MID={halfWidth:25,length:60,goalWidth:7.32};     // goal line z = 30
const WIDE={halfWidth:30,length:60,goalWidth:7.32};    // goal line z = 30
const BIG={halfWidth:30,length:64,goalWidth:7.32};     // goal line z = 32

const P=(x:number,z:number):Vec2=>({x,z});
const K=(kind:KickKind,x:number,z:number,o:Partial<Kick>={}):Kick=>({kind,target:{x,z},curl:0,loft:0,power:0.5,...o});

export const SCENARIOS:Scenario[]=[
  /* ───────────── Pack 1: First Passes ───────────── */
  {
    id:'fp-find-a-friend',pack:'first-passes',title:'Find a Friend',concept:'pass-into-feet',
    brief:{
      '7v7':'A defender blocks your shot. Pass to your free friend. Then score!',
      '9v9':'A defender stands between you and the goal. Pass into your free teammate\'s feet, then shoot.',
      '11v11':'The centre-back is blocking your shooting lane. Play a firm pass into the free teammate\'s feet so they can finish.',
    },
    hint:{
      '7v7':'Find the friend with nobody close. Draw the line to their feet.',
      '9v9':'Look for the teammate with space around them. Aim at their feet, not the space.',
      '11v11':'Scan for the unmarked player. A firm pass to their front foot lets them shoot first time.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:6},{x:8.5,z:16}],
    defenders:[{x:0,z:12},{x:-6,z:17.5}],   // the far-side cover defender keeps the friend onside
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'When a defender blocks your shot, a pass to a free friend makes a better chance.',
  },
  {
    id:'fp-far-corner',pack:'first-passes',title:'Far Corner',concept:'shot-placement',
    brief:{
      '7v7':'The keeper guards the near side. Shoot to the far side!',
      '9v9':'The keeper is covering the near post. Place your shot across goal into the far corner.',
      '11v11':'The keeper has set too close to the near post. Pass the ball across them into the far corner.',
    },
    hint:{
      '7v7':'Aim away from the keeper. Low and hard.',
      '9v9':'Shoot where the keeper is not: the far corner.',
      '11v11':'Open your body and aim across the keeper; the far corner is the biggest gap.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:5,z:15}],
    defenders:[],
    keeper:{x:2,z:23.8},
    attempts:3,require:{minPasses:0,finish:'goal'},
    bonus:{kind:'placement',label:'Low into the far corner'},
    lesson:'Aim away from the keeper. The far corner is often the biggest gap.',
  },
  {
    id:'fp-up-and-over',pack:'first-passes',title:'Up and Over',concept:'chip',
    brief:{
      '7v7':'A defender blocks the ground pass. Lift the ball over them!',
      '9v9':'A defender cuts off the ground pass. Chip the ball over their head to your teammate.',
      '11v11':'The defender shuts the ground lane. Clip a lofted pass over them to find the teammate behind.',
    },
    hint:{
      '7v7':'Hold your finger still at the end. The ball goes up.',
      '9v9':'Hold still at the end of your stroke to lift the ball.',
      '11v11':'Hold at the end of the stroke for loft; the ball clears the defender and drops to the receiver.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:4},{x:1,z:16}],
    defenders:[{x:0.3,z:9.5},{x:-8,z:17}],
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:1,finish:'reach-zone',zone:{x:1,z:16,r:3}},
    bonus:{kind:'chip',label:'Land it at their feet'},
    lesson:'A chip lifts the ball over a defender when the ground pass is blocked.',
  },
  {
    id:'fp-run-onto-it',pack:'first-passes',title:'Run Onto It',concept:'pass-into-space',
    brief:{
      '7v7':'A defender blocks the pass to your friend\'s feet. Pass into the space ahead of them!',
      '9v9':'A defender blocks the lane to your teammate\'s feet. Play the ball into the space ahead of their run.',
      '11v11':'A midfielder screens the pass to feet. Play it into the open space so your teammate moves onto it.',
    },
    hint:{
      '7v7':'Draw the pass to the empty grass. Your friend runs onto it.',
      '9v9':'Aim at the space your teammate can reach, not at their feet.',
      '11v11':'Pass into the space away from the screening defender; the receiver attacks the ball.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:4},{x:6,z:12,run:{delay:0,path:[P(1,16.5)]}}],
    defenders:[{x:4.5,z:10},{x:-9,z:16}],   // the far cover defender holds the line: the runner starts onside
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A pass into space lets your friend run onto the ball, away from defenders.',
  },
  {
    id:'fp-bend-it-round',pack:'first-passes',title:'Bend It Round',concept:'curl',
    brief:{
      '7v7':'A defender is right in the way. Bend your pass around them!',
      '9v9':'A defender stands in the straight passing line. Curl the ball around them to your teammate.',
      '11v11':'The direct lane is blocked. Use side spin to bend the pass around the defender and into your teammate.',
    },
    hint:{
      '7v7':'Draw a curved line around the defender.',
      '9v9':'Bow your stroke out to one side. The ball curves the same way.',
      '11v11':'Curve the stroke away from the defender; the spin swings the ball wide, then back onto the receiver.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:-6,z:4},{x:5,z:16}],
    defenders:[{x:0.6,z:11.3},{x:-7,z:17.5}],
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'Curling the ball takes a pass around a defender who blocks the straight line.',
  },

  /* ───────────── Pack 2: Team Moves ───────────── */
  {
    id:'tm-give-and-go',pack:'team-moves',title:'Give and Go',concept:'one-two',
    brief:{
      '7v7':'A defender blocks you. Pass to your friend and run. Get it back and score!',
      '9v9':'Play a wall pass: pass to your teammate, sprint past the defender and take the return.',
      '11v11':'Beat the pressing defender with a one-two: set the wall player, spin in behind and receive the return in stride.',
    },
    hint:{
      '7v7':'Pass to your friend. Then pass back into the space you run to.',
      '9v9':'First pass to the wall player\'s feet. Their return goes into your run.',
      '11v11':'The defender follows the ball, so the return goes into the space behind them.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:11,run:{delay:0.05,afterPass:true,path:[P(2,14),P(2,19)]}},{x:-6,z:14.5}],
    defenders:[{x:0.5,z:14,press:true},{x:-5,z:19.5}],   // the covering centre-back keeps the wall player onside
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'scorer',scorer:0,label:'The passer scores'},
    lesson:'A one-two beats a defender: pass, run past them and get the ball back.',
  },
  {
    id:'tm-third-friend',pack:'team-moves',title:'The Third Friend',concept:'third-man',
    brief:{
      '7v7':'The long pass is blocked. Pass to a close friend. They find the runner!',
      '9v9':'The direct pass to the runner is covered. Use a third-man run: pass short, then the runner gets it.',
      '11v11':'The lane to the runner is blocked. Combine through the checking player so the third man arrives unmarked.',
    },
    hint:{
      '7v7':'Two short passes beat one long one.',
      '9v9':'Pass into the checking teammate first. Their pass reaches the runner.',
      '11v11':'The screening defender watches the first pass; the third man\'s run comes off their blind side.',
    },
    pitch:MID,carrier:0,
    attackers:[{x:-4,z:4},{x:-3,z:12},{x:8.5,z:15.5,run:{delay:1.2,path:[P(6,20.5)]}}],   // the runner waits onside, then goes as the link pass is played
    defenders:[{x:-5,z:16},{x:3,z:10}],
    keeper:{x:0,z:29},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
    lesson:'A third-man move: one friend links the pass, so the runner gets the ball free.',
  },
  {
    id:'tm-round-the-outside',pack:'team-moves',title:'Round the Outside',concept:'overlap',
    brief:{
      '7v7':'Your friend ran round the outside. Pass down the line. Then find the striker!',
      '9v9':'Your full-back has overlapped outside you. Play it down the line, then pass inside for the striker.',
      '11v11':'The full-back overlaps the winger. Release them down the line, then pull it back for the striker.',
    },
    hint:{
      '7v7':'The pass inside is blocked. Use the friend running outside.',
      '9v9':'The defender stays with you, so the overlapping teammate is free outside.',
      '11v11':'The overlap makes a 2v1 on the flank; the inside pass is screened, so go round the outside.',
    },
    pitch:MID,carrier:0,
    attackers:[{x:13,z:10},{x:18.5,z:17},{x:5,z:21.5}],
    defenders:[{x:12,z:13.5},{x:8,z:16.5},{x:-4,z:23}],   // the far centre-back holds the line
    keeper:{x:0,z:29},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'first-time',label:'Cross it first time'},
    lesson:'An overlap: a friend runs round the outside to make a 2 v 1 on the wing.',
  },
  {
    id:'tm-switch-it',pack:'team-moves',title:'Switch It!',concept:'switch',
    brief:{
      '7v7':'Too many defenders on this side. Send it far to the other side!',
      '9v9':'The ball side is crowded. Switch play with a long pass to the free winger.',
      '11v11':'The opponents have overloaded the ball side. Switch the point of attack to the isolated winger.',
    },
    hint:{
      '7v7':'Look for the friend alone far away. Hold at the end to lift it.',
      '9v9':'A lofted pass over the crowd reaches the far side fastest.',
      '11v11':'Loft it early across the pitch, before their block can shift over.',
    },
    pitch:WIDE,carrier:0,
    attackers:[{x:-18,z:2},{x:-9,z:1},{x:20,z:6,run:{delay:0.4,path:[P(22,12)]}}],
    defenders:[{x:-17,z:3.4,press:true},{x:-13.5,z:2},{x:-9,z:2.5,mark:1},{x:-9,z:7}],
    attempts:3,require:{minPasses:1,finish:'reach-zone',zone:{x:21,z:10,r:5}},
    bonus:{kind:'chip',label:'Lift it over the crowd'},
    lesson:'Switching play moves the ball from a crowded side to the free side.',
  },
  {
    id:'tm-pull-it-back',pack:'team-moves',title:'Pull It Back',concept:'cutback',
    brief:{
      '7v7':'Defenders crowd the goal. Pass back to your friend running in!',
      '9v9':'The defenders drop onto their goal line. Cut the ball back to the teammate arriving at the penalty spot.',
      '11v11':'The back line has dropped deep. From the byline, cut it back to the late runner at the penalty spot.',
    },
    hint:{
      '7v7':'Pass behind the defenders, not across the goal.',
      '9v9':'Defenders run toward their goal, so a pass backwards finds space.',
      '11v11':'The cutback goes against the defenders\' movement, into the space they leave.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:14,z:22},{x:2.5,z:21.5},{x:7,z:12,run:{delay:0,path:[P(5,15.5)]}}],
    defenders:[{x:5,z:23},{x:0,z:23.5}],
    keeper:{x:2,z:24.3},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A cutback from the byline finds the friend arriving behind the defenders.',
  },

  /* ───────────── Pack 3: Beat the Press ───────────── */
  {
    id:'bp-bounce-pass',pack:'beat-the-press',title:'Bounce Pass',concept:'bounce-pass',
    brief:{
      '7v7':'A defender blocks the way. Pass up to your striker. They pass back to a friend!',
      '9v9':'The pass to your midfielder is blocked. Play up to the striker, who bounces it back to them.',
      '11v11':'The screening midfielder blocks the direct pass; play into the target striker, whose first-time lay-off finds the midfielder facing play.',
    },
    hint:{
      '7v7':'The striker passes back. Your friend can see the goal.',
      '9v9':'The striker has their back to goal, so they set it for the midfielder who faces forward.',
      '11v11':'Up, back and through: the lay-off takes the screening midfielder out of the game.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:5},{x:-4,z:16},{x:4,z:10,run:{delay:0.3,path:[P(4,13.5)]}}],
    defenders:[{x:2.3,z:9.8},{x:-4,z:17.5,mark:1}],
    keeper:{x:0,z:24},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A bounce pass: up to the striker and back to a friend who faces the goal.',
  },
  {
    id:'bp-keeper-starts-it',pack:'beat-the-press',title:'Keeper Starts It',concept:'build-from-back',
    brief:{
      '7v7':'You are the keeper. The middle is busy. Pass wide to your friend!',
      '9v9':'Play out from the keeper. The striker presses the middle, so find the full-back who has split wide.',
      '11v11':'Build from the back: the press blocks the central pass, so the keeper finds the split full-back, who plays up the line.',
    },
    hint:{
      '7v7':'Your friend near the side line has lots of space. Then pass up the line.',
      '9v9':'Wide players have more time. Pass away from the pressing striker, then forward.',
      '11v11':'The pressing striker can\'t cover both lanes: go wide, then forward past the midfield.',
    },
    pitch:SMALL,carrier:0,
    attackers:[{x:0,z:-23},{x:-3,z:-17},{x:-14,z:-17},{x:-15,z:-6,run:{delay:0.8,path:[P(-16,-2)]}}],
    defenders:[{x:-1.5,z:-18.5},{x:-7,z:-10},{x:4,z:-12}],
    attempts:3,require:{minPasses:2,finish:'reach-zone',zone:{x:-15,z:-3,r:5}},
    bonus:{kind:'first-time',label:'Play forward first time'},
    lesson:'Playing out from the back: go wide, away from the press, then forward.',
  },
  {
    id:'bp-through-the-gap',pack:'beat-the-press',title:'Through the Gap',concept:'line-breaking-pass',
    brief:{
      '7v7':'Two defenders leave a gap. Pass through it. Then find the runner!',
      '9v9':'Break the midfield line: pass through the gap to the teammate between the lines, then play the runner in.',
      '11v11':'Play a line-breaking pass into the pocket between midfield and defence, then thread the runner in behind.',
    },
    hint:{
      '7v7':'Aim right between the two defenders.',
      '9v9':'Receive between the lines, then pass into the runner\'s space.',
      '11v11':'The gap between the two midfielders is the lane; the receiver then finds the run past the centre-back.',
    },
    pitch:MID,carrier:0,
    attackers:[{x:0,z:2},{x:0,z:15},{x:8.5,z:16,run:{delay:0.9,path:[P(7,20)]}}],   // the runner holds the line until the ball is between the lines
    defenders:[{x:-5,z:9},{x:5,z:9},{x:-1.5,z:20}],
    keeper:{x:0,z:29},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
    lesson:'A pass through a gap breaks a line and takes those defenders out of the game.',
  },
  {
    id:'bp-back-to-go-forward',pack:'beat-the-press',title:'Back to Go Forward',concept:'recycle-switch',
    brief:{
      '7v7':'You are trapped by the side line. Pass back. Then send it far!',
      '9v9':'You are trapped on the touchline. Pass back to your defender, who switches it to the free side.',
      '11v11':'The press has trapped you on the touchline. Recycle to the centre-back, then switch to the far full-back.',
    },
    hint:{
      '7v7':'Your friend behind has space. They can see the other side.',
      '9v9':'Passing backwards is fine when it opens up the other side.',
      '11v11':'The press overloads the ball side; the back pass pulls it over, and the switch finds the far side.',
    },
    pitch:WIDE,carrier:0,
    attackers:[{x:-26,z:4},{x:-25,z:14},{x:-10,z:-4},{x:22,z:8,run:{delay:1.6,path:[P(24,13)]}}],   // the far full-back stays onside until the switch is coming
    defenders:[{x:-25,z:5.5,press:true},{x:-25.5,z:10},{x:-20,z:7},{x:-3,z:3}],
    attempts:3,require:{minPasses:2,finish:'reach-zone',zone:{x:23,z:12,r:6}},
    bonus:{kind:'first-time',label:'Switch it first time'},
    lesson:'A pass backwards can escape a trap and open up the free side of the pitch.',
  },
  {
    id:'bp-in-behind',pack:'beat-the-press',title:'In Behind',concept:'through-ball',
    brief:{
      '7v7':'The defenders stand in a line. Your striker runs past them. Pass into the space!',
      '9v9':'Their back line is high. Time a through ball into the gap for your striker\'s run.',
      '11v11':'Their defensive line is high. Play a through ball into the channel as your striker runs in behind.',
    },
    hint:{
      '7v7':'Pass behind the defenders, between two of them.',
      '9v9':'Aim between two defenders so the striker runs onto it.',
      '11v11':'Weight it into the space behind the line; the screening midfielder cuts out the safe pass.',
    },
    pitch:MID,carrier:0,
    attackers:[{x:0,z:6},{x:3,z:13,run:{delay:0,path:[P(3,21.5)]}},{x:-4,z:13}],   // the striker starts a step onside and times the run with the pass
    defenders:[{x:-9,z:14},{x:-2,z:14},{x:8,z:14},{x:-3,z:10.8}],
    keeper:{x:0,z:29},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'first-time',label:'Shoot first time'},
    lesson:'A through ball behind a high line puts your striker clean through on goal.',
  },

  /* ───────────── Pack 4: In the Air ───────────── */
  {
    id:'air-far-post',pack:'in-the-air',title:'Far-Post Header',concept:'far-post-header',
    brief:{
      '7v7':'The keeper and a defender guard the front post. Cross to the back post!',
      '9v9':'The near post is crowded. Float the cross over everyone to the far-post runner.',
      '11v11':'The keeper and a centre-back cover the near post. Hang the cross up to the far post for a header back across goal.',
    },
    hint:{
      '7v7':'Lift it high over everyone. Your friend waits at the back.',
      '9v9':'The far post is free. Loft it long, then head it back across.',
      '11v11':'Clear the near-post zone with height; the far-post header back across goal beats the keeper\'s dive.',
    },
    pitch:BIG,carrier:0,
    attackers:[{x:20,z:25},{x:2.5,z:27.5},{x:-5,z:26}],
    defenders:[{x:3,z:28.8,mark:1},{x:11,z:25.5}],
    keeper:{x:1.5,z:31},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'header',label:'Score with a header'},
    lesson:'When the near post is crowded, the far post is often free.',
  },
  {
    id:'air-flick-on',pack:'in-the-air',title:'Flick It On',concept:'flick-on',
    brief:{
      '7v7':'Kick it high to your tall striker. They head it on to your runner!',
      '9v9':'The long pass to the runner is covered. Hit the target striker, who flicks it on with a header.',
      '11v11':'The ball in behind is covered. Go long to the target forward, whose flick-on releases the runner beyond the line.',
    },
    hint:{
      '7v7':'First to the striker\'s head. Then head it into space.',
      '9v9':'A header can be a pass. Flick it into the runner\'s path.',
      '11v11':'The flick-on changes the angle faster than the defenders can turn.',
    },
    pitch:BIG,carrier:0,
    attackers:[{x:0,z:0},{x:-2,z:16},{x:7,z:12,run:{delay:0.8,path:[P(5,20)]}}],   // the runner waits for the flick so they stay onside
    defenders:[{x:-2,z:17.5,mark:1},{x:3,z:10}],
    keeper:{x:0,z:31},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'scorer',scorer:2,label:'The runner scores'},
    lesson:'A flick-on header can be a pass that sends a runner through.',
  },
  {
    id:'air-near-post',pack:'in-the-air',title:'Near-Post Header',concept:'near-post-header',
    brief:{
      '7v7':'Cross it high to your friend at the front post. Head it in!',
      '9v9':'A defender blocks the low cross. Float it to the near post for your striker\'s header.',
      '11v11':'The low cross gets cut out. Deliver it in the air to the near-post run, then glance the header across the keeper.',
    },
    hint:{
      '7v7':'Hold at the end to lift the cross. Then head it at goal.',
      '9v9':'A lofted cross clears the defender. Aim it at your striker\'s head.',
      '11v11':'The near-post run gets in front of the defender; glance it into the far side of the goal.',
    },
    pitch:BIG,carrier:0,
    attackers:[{x:20,z:25},{x:4,z:25.5}],
    defenders:[{x:11,z:25.5},{x:-3,z:26}],
    keeper:{x:0,z:31},
    attempts:3,require:{minPasses:1,finish:'goal'},
    bonus:{kind:'header',label:'Score with a header'},
    lesson:'A near-post run gets you in front of the defender to head the cross first.',
  },
  {
    id:'air-corner-flick',pack:'in-the-air',title:'Corner Flick',concept:'corner-flick-on',
    brief:{
      '7v7':'Corner kick! Your front friend heads it on. Your back friend heads it in!',
      '9v9':'From the corner, find the near-post runner, who glances it on to the far post for a header.',
      '11v11':'Deliver the corner to the near-post runner; the flick-on takes the keeper out and finds the far-post attacker.',
    },
    hint:{
      '7v7':'Cross to the near friend. Then head it across to the far friend.',
      '9v9':'The near-post glance changes direction faster than the keeper can move.',
      '11v11':'Aim at the near-post zone; a glancing flick across the six-yard box beats the keeper\'s starting position.',
    },
    pitch:BIG,carrier:0,
    attackers:[{x:29.5,z:31.5},{x:6,z:25.5},{x:-3,z:25.3}],   // the far-post attacker stays level with the flick: onside
    defenders:[{x:2,z:28.5},{x:-2,z:29}],
    keeper:{x:0,z:31},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'header',label:'Score with a header'},
    lesson:'A near-post flick-on moves the ball across the goal faster than the keeper.',
  },
  {
    id:'air-knock-down',pack:'in-the-air',title:'Head It Down',concept:'knock-down',
    brief:{
      '7v7':'Cross to your friend at the back post. Head it down to another friend. Shoot!',
      '9v9':'Cross to the far-post striker, who heads it back down to the teammate arriving in the middle.',
      '11v11':'Target the far post; the striker cushions a knock-down header into the path of the arriving midfielder.',
    },
    hint:{
      '7v7':'Head it softly to your friend in the middle.',
      '9v9':'A header back across the box finds the teammate facing goal.',
      '11v11':'The knock-down turns a hard header chance into an easy shot for the runner facing goal.',
    },
    pitch:BIG,carrier:0,
    attackers:[{x:20,z:25},{x:-6,z:26},{x:2,z:16,run:{delay:0.8,path:[P(1,21)]}}],
    defenders:[{x:6,z:26.5},{x:1,z:24}],
    keeper:{x:0,z:31},
    attempts:3,require:{minPasses:2,finish:'goal'},
    bonus:{kind:'scorer',scorer:2,label:'The midfielder scores'},
    lesson:'A header does not have to be a shot: knock it down for a friend facing goal.',
  },
];
/* Every arcade puzzle plays the offside law (Law 11, in all formats): the routes below are authored onside. */
for(const s of SCENARIOS)s.require.offside??=true;

/**
 * What the tests replay: the taught sequence, and the tempting direct option that fails.
 * Kept out of the Scenario type so the game never shows it. Each kick is what a real finger
 * stroke gives (readStroke): a straight line from the ball, power = stroke length / 30 m,
 * loft from holding still at the end, curl from bowing the line; shots drag 2 m past the goal line.
 * pass-feet / header targets are the receiver's spot when the kick is drawn.
 */
export type ScenarioSolution={solution:Kick[];naive:Kick};

export const SCENARIO_SOLUTIONS:Record<string,ScenarioSolution>={
  'fp-find-a-friend':{solution:[K('pass-feet',8.5,16,{receiver:1,power:0.43}),K('shot',-2.75,25,{power:0.54})],naive:K('shot',0.8,25,{power:0.69})},
  'fp-run-onto-it':{solution:[K('pass-space',0,15,{receiver:1,power:0.36}),K('shot',-2.75,25,{power:0.41})],naive:K('pass-feet',6,12,{receiver:1,power:0.32})},
  'fp-bend-it-round':{solution:[K('pass-feet',5,16,{receiver:1,power:0.61,curl:1}),K('shot',-2.7,25,{power:0.48})],naive:K('pass-feet',5,16,{receiver:1,power:0.53})},
  'fp-up-and-over':{solution:[K('header',1,16,{receiver:1,power:0.39,loft:1})],naive:K('pass-feet',1,16,{receiver:1,power:0.39})},
  'fp-far-corner':{solution:[K('shot',-2.75,25,{power:0.47})],naive:K('shot',2.7,25,{power:0.4})},
  'tm-give-and-go':{solution:[K('pass-feet',-6,14.5,{receiver:1,power:0.23}),K('pass-space',2,17.5,{receiver:0,power:0.26}),K('shot',2.7,25,{power:0.31})],naive:K('shot',0.5,25,{power:0.52})},
  'tm-third-friend':{solution:[K('pass-feet',-3,12,{receiver:1,power:0.26}),K('pass-space',2,18.5,{receiver:2,power:0.32}),K('shot',-3.4,30,{power:0.49})],naive:K('pass-feet',8.5,15.5,{receiver:2,power:0.56})},
  'tm-round-the-outside':{solution:[K('pass-space',16.5,14,{receiver:1,power:0.17}),K('pass-feet',5,21.5,{receiver:2,power:0.46}),K('shot',-3.4,30,{power:0.52})],naive:K('pass-feet',5,21.5,{receiver:2,power:0.46})},
  'tm-switch-it':{solution:[K('pass-space',21,10,{receiver:2,power:1,loft:0.7})],naive:K('pass-feet',-9,1,{receiver:1,power:0.3})},
  'tm-pull-it-back':{solution:[K('pass-space',5,15.5,{receiver:2,power:0.38}),K('shot',-2.75,25,{power:0.46})],naive:K('pass-feet',2.5,21.5,{receiver:1,power:0.38})},
  'bp-bounce-pass':{solution:[K('pass-feet',-4,16,{receiver:1,power:0.38}),K('pass-feet',4,13,{receiver:2,power:0.24}),K('shot',-2.6,25,{power:0.49})],naive:K('pass-space',4,13.5,{receiver:2,power:0.3})},
  'bp-keeper-starts-it':{solution:[K('pass-feet',-14,-17,{receiver:2,power:0.5}),K('pass-space',-15.5,-3,{receiver:3,power:0.51})],naive:K('pass-feet',-3,-17,{receiver:1,power:0.21})},
  'bp-through-the-gap':{solution:[K('pass-feet',0,15,{receiver:1,power:0.42}),K('pass-space',3.5,19.5,{receiver:2,power:0.26}),K('shot',-3.4,30,{power:0.48})],naive:K('pass-space',3.5,19.5,{receiver:2,power:0.58})},
  'bp-back-to-go-forward':{solution:[K('pass-feet',-10,-4,{receiver:2,power:0.6}),K('pass-space',22,10,{receiver:3,power:1,loft:0.6})],naive:K('pass-feet',-25,14,{receiver:1,power:0.32})},
  'bp-in-behind':{solution:[K('pass-space',3,20.5,{receiver:1,power:0.48}),K('shot',-3.4,30,{power:0.43})],naive:K('pass-feet',-4,13,{receiver:2,power:0.26})},
  'air-near-post':{solution:[K('header',4,25.5,{receiver:1,power:0.53,loft:0.6}),K('shot',-3.4,32,{power:0.38})],naive:K('pass-feet',4,25.5,{receiver:1,power:0.53})},
  'air-far-post':{solution:[K('header',-5,26,{receiver:2,power:0.83,loft:0.8}),K('shot',3.4,32,{power:0.38})],naive:K('header',2.5,27.5,{receiver:1,power:0.59,loft:0.6})},
  'air-flick-on':{solution:[K('header',-2,16,{receiver:1,power:0.53,loft:0.6}),K('pass-space',4,18,{receiver:2,power:0.21}),K('shot',-3.4,32,{power:0.61})],naive:K('pass-space',4,18,{receiver:2,power:0.6})},
  'air-knock-down':{solution:[K('header',-6,26,{receiver:1,power:0.87,loft:0.8}),K('pass-feet',1,21,{receiver:2,power:0.27}),K('shot',-3.2,32,{power:0.41})],naive:K('pass-feet',-6,26,{receiver:1,power:0.87})},
  'air-corner-flick':{solution:[K('header',6,25.5,{receiver:1,power:0.81,loft:0.6}),K('header',-3,25.3,{receiver:2,power:0.31,loft:0.55}),K('shot',-3.4,32,{power:0.29})],naive:K('shot',3.4,32,{power:0.87})},
};

export function scenarioById(id:string):Scenario|undefined{return SCENARIOS.find(s=>s.id===id);}
export function scenariosInPack(pack:PackId):Scenario[]{return SCENARIOS.filter(s=>s.pack===pack);}
