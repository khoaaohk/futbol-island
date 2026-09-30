/**
 * Island jobs: where each job lives, what the player does and the football lesson it teaches (docs/island-jobs.md).
 * World units: metres on the island (see lib/town/venues.ts). Heights come from fieldSurfaceHeight at runtime.
 */
import type {JobId} from './jobEconomy';
export type JobPoint={x:number;z:number};
export type JobKind='collect'|'trail'|'carry'|'rebound'|'sort'|'offside'|'pump';
export type JobProp='leaf'|'cone'|'ball'|'bottle'|'chalk'|'shirt'|'flag'|'peg'|'produce';
/** Kit room: each shirt (by squad number) belongs on one position peg (a target index). */
/** `label`/`color`: a named item (e.g. a snack) instead of a squad number. */
export type SortItem={number:number;slot:number;clue:string;label?:string;color?:string};
/** Extra rules for the task-style jobs (sort, offside, pump). */
export type JobTask=
 |{type:'sort';slots:string[];items:SortItem[];
   /** Wording and props (Sep 29 2026): kit room = shirts on pegs (default); crates = food cards into labelled crates. */
   style?:'kit'|'crates';source?:string;itemNoun?:string;slotNoun?:string}
 |{type:'offside';clips:number}
 |{type:'pump';start:number[];step:number;release:number;min:number;max:number};
export type JobDef={
 id:JobId;title:string;role:string;place:string;
 /** Sign position; the sign faces `yaw` (radians, 0 = +z). */
 board:JobPoint&{yaw:number};color:string;kind:JobKind;prop:JobProp;
 targets:JobPoint[];
 /** Collect jobs finish by emptying the bag here; carry jobs return each item here. */
 deliver?:JobPoint&{label:string};
 radius:number;
 intro:string;howTo:string;
 /** HUD goal, e.g. "Leaves raked". */
 unit:string;
 lesson:string;lessonSource?:string;
 task?:JobTask;
 /** Collect jobs: target spots turn into a placed prop (cones, goal pegs) instead of vanishing. */
 placed?:boolean;
};
// 7v7 Old Town Ground: centre (11,-80), 34.3 × 52.3.
const LEAVES:JobPoint[]=[[-1,-60],[8,-57],[21,-62],[3,-70],[16,-72],[-2,-83],[10,-86],[23,-82],[5,-95],[18,-97],[-1,-102],[13,-104]].map(([x,z])=>({x,z}));
// Eleven Park 11v11: centre (135,100); the centre circle radius is 9.15 m (Law 1). Start where the halfway line meets it.
const CIRCLE:JobPoint[]=Array.from({length:16},(_,i)=>{const a=Math.PI+i/16*Math.PI*2;return {x:135+Math.cos(a)*9.15,z:100+Math.sin(a)*9.15};});
export const JOBS:JobDef[]=[
 {id:'leaf-rake',title:'Rake the leaves',role:'Groundskeeper',place:'Old Town Ground (7v7)',board:{x:20.5,z:-49.5,yaw:0},color:'#b8643a',kind:'collect',prop:'leaf',targets:LEAVES,deliver:{x:22.5,z:-49.5,label:'compost bin'},radius:1.5,
  intro:'Autumn leaves have blown across the pitch. Walk over every pile to rake it into your bag, then empty the bag in the compost bin by this sign.',howTo:'Walk over each leaf pile.',unit:'Leaf piles raked',
  lesson:'Groundskeepers clear leaves because wet leaves make the pitch slippery and make a rolling pass skid or stop. A clean, smooth pitch means truer passes and safer footing.'},
 {id:'wall-rebounds',title:'Wall rebounds',role:'Practice partner',place:'Rebound wall, Coaches Centre',board:{x:143.5,z:-11.5,yaw:0},color:'#3f7a8c',kind:'rebound',prop:'ball',targets:[{x:156,z:-25}],radius:1.6,
  intro:'The coaches want the rebound wall tested. Stand in the box, face the wall and press Juggle for 10 wall passes. Then Shoot 3 passes into the painted target square.',howTo:'Face the wall: Juggle for wall passes, then Shoot at the target.',unit:'Wall passes',
  lesson:'A wall never gets tired: every rebound is a pass and a first touch. Your character alternates feet on each return, and using both feet makes you much harder to defend.'},
 {id:'ball-kid',title:'Ball kid',role:'Ball kid',place:'Eleven Park touchline (11v11)',board:{x:171,z:113,yaw:-Math.PI/2},color:'#c9a33a',kind:'carry',prop:'ball',targets:[{x:173.5,z:77},{x:172.5,z:127},{x:175,z:66},{x:150,z:153.5},{x:173,z:140}],deliver:{x:170,z:100,label:'ball-kid spot'},radius:1.5,
  intro:'Balls keep going out of play. Run to each loose ball, pick it up and bring it back to your ball-kid spot on the halfway line so the game can restart quickly.',howTo:'Run to the ball, then bring it back to the glowing spot.',unit:'Balls returned',
  lesson:'Quick ball kids change matches. At Anfield on 7 May 2019, 14-year-old ball boy Oakley Cannonier returned a ball fast, Trent Alexander-Arnold took a quick corner and Divock Origi scored as Liverpool beat Barcelona 4–0.',lessonSource:'https://en.wikipedia.org/wiki/Oakley_Cannonier'},
 {id:'cone-setup',title:'Set out the cones',role:"Coach's assistant",place:'Club Grounds (9v9)',board:{x:167,z:-72,yaw:0},color:'#d9772f',kind:'collect',prop:'cone',targets:[{x:155,z:-93},{x:165,z:-93},{x:165,z:-83},{x:155,z:-83},{x:149,z:-100},{x:151.5,z:-100},{x:168.5,z:-100},{x:171,z:-100}].map(p=>p),radius:1.4,
  intro:'Tonight\'s session needs a 10 m passing square and two dribbling gates. Walk onto each glowing spot to set a cone down.',howTo:'Step onto every glowing spot.',unit:'Cones placed',
  lesson:'Coaches set drills with care: a 10 m square gives passers good angles and time on the ball, and narrow gates reward close control. The right space makes practice feel like a real match.'},
 {id:'line-painter',title:'Paint the centre circle',role:'Groundskeeper',place:'Eleven Park centre circle (11v11)',board:{x:100.5,z:106,yaw:Math.PI/2},color:'#e9e2c8',kind:'trail',prop:'chalk',targets:CIRCLE,radius:1.5,
  intro:'The centre circle has faded. Walk the line-marker around the circle: step on each faded dash in order to repaint it.',howTo:'Follow the faded dashes in order.',unit:'Dashes painted',
  lesson:'The centre circle is 9.15 m (10 yards) from the centre mark. At kick-off every opponent must stay outside it, which gives the kicking team room to start. Lines count as part of the area they mark.',lessonSource:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 {id:'court-cleanup',title:'Court clean-up',role:'Club volunteer',place:'Palm Coast Rooftop futsal court',board:{x:23.5,z:-7.5,yaw:0},color:'#4f8f63',kind:'collect',prop:'bottle',targets:[[5,3],[17,6],[10,11],[3,19],[19,21],[12,26],[6,33],[17,35],[22,14],[1,9]].map(([x,z])=>({x,z})),deliver:{x:21.5,z:-7.5,label:'recycling bin'},radius:1.4,
  intro:'After tonight\'s futsal match, bottles are left on the rooftop court. Pick up every bottle, then drop the bag in the recycling bin by this sign.',howTo:'Pick up every bottle, then recycle them.',unit:'Bottles picked up',
  lesson:'Respect is part of football. After beating Germany at the 2022 World Cup, Japan\'s players left their dressing room spotless with a thank-you note, and Japan fans stayed to tidy the stands.',lessonSource:'https://www.cbsnews.com/news/japan-upset-win-over-germany-japanese-players-leave-dressing-room-spotless/'},

 // ---- Added 27 Sep 2026 (docs/island-jobs.md §3b): assistant referee, ball pump, goal anchors. ----
 {id:'offside-flag',title:'Flag the offside',role:'Assistant referee',place:'Referee practice strip, Coaches Centre',board:{x:152.5,z:7,yaw:Math.PI},color:'#e0b422',kind:'offside',prop:'flag',
  targets:[{x:150,z:4.2}],radius:1.6,
  intro:'Be the assistant referee! Stand on your touchline spot and watch five short replays. When each pass is played, decide: raise the flag for offside, or keep it down.',howTo:'Stand on the touchline spot, watch the pass, then make your call.',unit:'Right calls',
  lesson:'Offside (Law 11): when a team-mate passes, you are offside if you are in the other team\'s half and nearer their goal line than both the ball and the second-last defender. Level is onside, you can\'t be offside in your own half, and there is no offside from a throw-in, goal kick or corner.',lessonSource:'https://www.theifab.com/laws/latest/offside/',
  task:{type:'offside',clips:5}},
 {id:'ball-pump',title:'Pump the balls',role:'Kit assistant',place:'Eleven Park, behind the north goal',board:{x:158,z:43.5,yaw:0},color:'#2f7fb4',kind:'pump',prop:'ball',
  targets:[{x:150,z:44.5}],radius:1.8,
  intro:'The match balls have gone soft. Stand at the pump station and pump each ball until the gauge is in the green match zone, then check it.',howTo:'Pump until the needle is in the green zone, then press Ball ready.',unit:'Balls ready',
  lesson:'Law 2 says a match ball must be pumped to 0.6–1.1 atmospheres at sea level. Too soft and it dies on your foot and won\'t travel; too hard and it bounces away and is hard to control. Checking the pressure is part of getting ready.',lessonSource:'https://www.theifab.com/laws/latest/the-ball/',
  task:{type:'pump',start:[.2,.35,.1,.45,.25],step:.15,release:.2,min:.6,max:1.1}},
 {id:'goal-anchor',title:'Anchor the goals',role:'Groundskeeper',place:'Old Town Ground (7v7)',board:{x:22,z:-110.5,yaw:0},color:'#8a6a3c',kind:'collect',prop:'peg',placed:true,
  targets:[{x:8.55,z:-107.4},{x:11,z:-107.7},{x:13.45,z:-107.4},{x:13.45,z:-52.6},{x:11,z:-52.3},{x:8.55,z:-52.6}],radius:1.2,
  intro:'Before anyone plays, both goals must be pegged down. Step on each glowing spot behind the goals to hammer in a ground peg.',howTo:'Step on every glowing peg spot behind both goals.',unit:'Pegs hammered',
  lesson:'Safety first: Law 1 says goals must be anchored securely to the ground, and portable goals can only be used if they are. A goal that isn\'t pegged down can tip over, so never swing or climb on the crossbar.',lessonSource:'https://www.theifab.com/laws/latest/the-field-of-play/'},
];

// ---- Added 29 Sep 2026 (docs/island-jobs.md §6): the Coral Cay Farm's harvest job (lib/town/coralCay.ts FARM). ----
JOBS.push({id:'farm-harvest',title:'Harvest day',role:'Farm hand',place:'The Farm, Coral Cay',board:{x:602.5,z:-115.5,yaw:0},color:'#5f8f3a',kind:'collect',prop:'produce',
 // Ten ripe crops across the fields and orchard, one of each kind, all on open ground between the rows and trees.
 targets:[[624,-124.4],[638,-119.2],[623,-115],[640,-107.6],[626,-95.4],[655.5,-105.5],[676,-106],[659.5,-124],[668.5,-117.5],[684.5,-121]].map(([x,z])=>({x,z})),
 deliver:{x:611,z:-98,label:'farm stand'},radius:1.4,
 intro:'Harvest day on Coral Cay! The ripe crops glow gold: maize, greens, tomatoes, sweet potatoes, peppers, pineapples, melons, mangoes, oranges and bananas. Walk to each one to pick it into your basket, then bring the basket to the farm stand by the path.',
 howTo:'Walk to every glowing ripe crop, then take the basket to the farm stand.',unit:'Crops picked',
 lesson:'Food is fuel for football. Carbohydrate foods like maize, sweet potatoes, rice and bananas are your main energy for running, and fruit and vegetables bring vitamins that help you recover. Eat a proper meal a few hours before you play, and drink water, especially on a hot beach.',
 lessonSource:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf'});
// ---- Added 29 Sep 2026 (docs/island-jobs.md §7): a second farm job, sorting snacks by when they fuel a match. ----
JOBS.push({id:'match-day-snacks',title:'Match-day snacks',role:'Farm hand',place:'The Farm, Coral Cay',board:{x:618.2,z:-106.8,yaw:0},color:'#e0873a',kind:'sort',prop:'produce',
 // Three labelled crates on the grass south of the farm track; the harvest basket is by the west gate.
 targets:[{x:604,z:-108.2},{x:608.5,z:-108.2},{x:613,z:-108.2}],deliver:{x:603,z:-104.8,label:'harvest basket'},radius:1.3,
 intro:'The beach soccer teams need their match-day food packed. Take each snack from the harvest basket, read its clue, and put it in the right crate: PRE-MATCH MEAL, HALF-TIME or RECOVERY.',
 howTo:'Take a snack from the basket, then put it in the crate its clue points to.',unit:'Snacks packed',
 lesson:'Match-day fuel has a plan: a proper carbohydrate meal a few hours before kick-off, a small familiar snack closer to the game, sips of water at every break, and carbohydrate plus some protein afterwards to recover.',
 lessonSource:'https://sportsdietitians.com.au/Article?Action=View&Article_id=6',
 task:{type:'sort',style:'crates',source:'harvest basket',itemNoun:'snack',slotNoun:'crate',slots:['PRE-MATCH MEAL','HALF-TIME','RECOVERY'],items:[
  {number:1,label:'Rice bowl',color:'#f2e2b8',slot:0,clue:'Rice bowl: a proper meal 3 to 4 hours before kick-off. Rice, pasta and potatoes are carbohydrates, your main fuel for running.'},
  {number:2,label:'Orange slices',color:'#f28b2e',slot:1,clue:'Orange slices: youth teams have shared them at half-time for generations. Juicy, quick and mostly water.'},
  {number:3,label:'Yoghurt and fruit',color:'#f6f1e7',slot:2,clue:'Yoghurt and fruit: after the final whistle, carbohydrate plus some protein helps your body recover.'},
  {number:4,label:'Banana',color:'#f5d94a',slot:0,clue:'Banana: a small, easy snack an hour or two before you play. Familiar food that sits well is best before a game.'},
  {number:5,label:'Water bottle',color:'#6fb7d6',slot:1,clue:'Water bottle: sips of water at every break keep you going, especially on a hot beach.'},
  {number:6,label:'Watermelon',color:'#e2533f',slot:2,clue:'Watermelon: mostly water, a refreshing way to rehydrate after playing. Water is still your main drink.'},
 ]}});
export const jobById=(id:string)=>JOBS.find(j=>j.id===id);
/** Rebound job: the Coaches Centre practice wall face (lib/town/world.ts) and its painted target square. */
export const REBOUND_WALL={x:156,z:-29.5,halfWidth:13,face:-29.32,target:{x:156,halfWidth:2,bottom:.25,top:1.7},passes:10,shots:3};
/** A job sign offers its job within this many metres. */
export const BOARD_RANGE=5;
