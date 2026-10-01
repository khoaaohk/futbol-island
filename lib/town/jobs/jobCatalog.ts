/**
 * Island jobs: where each job lives, what the player does and the football lesson it teaches (docs/island-jobs.md).
 * World units: metres on the island (see lib/town/venues.ts). Heights come from fieldSurfaceHeight at runtime.
 */
import type {JobId} from './jobEconomy';
import {GARDEN_SPOTS,GARDEN_SHIFT} from './garden';
export type JobPoint={x:number;z:number};
export type JobKind='collect'|'trail'|'carry'|'rebound'|'sort'|'offside'|'pump'|'harvest'|'garden';
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
 |{type:'pump';start:number[];step:number;release:number;min:number;max:number}
 |{type:'harvest';spots:HarvestSpot[];fruitGoal:number;vegGoal:number}
 /** Garden shift (Sep 30 2026): pick `goal` ripe items from the Community Garden spots (lib/town/jobs/garden.ts GARDEN_SPOTS, the
  *  job's targets in the same order), at least `fruitGoal` fruit and `vegGoal` veg, then drop them in the garden crate. */
 |{type:'garden';goal:number;fruitGoal:number;vegGoal:number};
/**
 * One physical action at a spot (Sep 30 2026: every job has a real action and animation, not just "walk to the glow").
 * `tap`: press the job button `count` times (default 1). `hold`: hold it for `time` seconds; letting go keeps the progress.
 * Keyboard: the job button is focusable (Enter/Space; hold the key for a hold step).
 */
export type WorkStep={id:string;label:string;mode:'tap'|'hold';count?:number;time?:number;busy?:string;hint:string};
/** `target`: the steps at each target (in order). `deliver`: the one action at the drop-off (bin, ball-kid spot, snack basket). */
export type JobWork={target?:WorkStep[];deliver?:WorkStep};
/** Harvest day (Sep 30 2026): shake fruit trees, pull root veg, twist-pick staked veg, snip greens. `ripe:false` = a decoy. */
export type HarvestAction='shake'|'pull'|'twist'|'cut';
export type HarvestSpot={x:number;z:number;good:string;action:HarvestAction;ripe?:boolean;
 /** Trees: ripe fruit hanging (shake to drop); canopy shape for the sway proxy (y = centre height, r = radius, sy = y scale). */
 fruit?:number;canopy?:{y:number;r:number;sy:number;color:string}|'banana'};
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
 work?:JobWork;
 /** Metres outside the job's area (sign + targets + drop-off) before the shift stops (default JOB_AREA_MARGIN, 45). */
 areaMargin?:number;
};
// 7v7 Old Town Ground: centre (11,-80), 34.3 × 52.3.
const LEAVES:JobPoint[]=[[-1,-60],[8,-57],[21,-62],[3,-70],[16,-72],[-2,-83],[10,-86],[23,-82],[5,-95],[18,-97],[-1,-102],[13,-104]].map(([x,z])=>({x,z}));
// Eleven Park 11v11: centre (135,100); the centre circle radius is 9.15 m (Law 1). Start where the halfway line meets it.
const CIRCLE:JobPoint[]=Array.from({length:16},(_,i)=>{const a=Math.PI+i/16*Math.PI*2;return {x:135+Math.cos(a)*9.15,z:100+Math.sin(a)*9.15};});
export const JOBS:JobDef[]=[
 {id:'leaf-rake',title:'Rake the leaves',role:'Groundskeeper',place:'Old Town Ground (7v7)',board:{x:20.5,z:-49.5,yaw:0},color:'#b8643a',kind:'collect',prop:'leaf',targets:LEAVES,deliver:{x:22.5,z:-49.5,label:'compost bin'},radius:1.5,
  intro:'Autumn leaves have blown across the pitch. At each pile, hold Rake to sweep it together, then bag it. Empty the full bag in the compost bin by this sign.',howTo:'Walk to a leaf pile, hold Rake, then Bag it.',unit:'Leaf piles raked',
  work:{target:[{id:'rake',label:'Hold to rake',busy:'Raking…',mode:'hold',time:1.1,hint:'Hold Rake to sweep the leaves into a tight pile.'},{id:'bag',label:'Bag it',mode:'tap',hint:'Tap Bag it to scoop the pile into your bag.'}],deliver:{id:'empty',label:'Empty the bag',mode:'tap',hint:'Tip the leaves into the compost bin.'}},
  lesson:'Groundskeepers clear leaves because wet leaves make the pitch slippery and make a rolling pass skid or stop. A clean, smooth pitch means truer passes and safer footing.'},
 {id:'wall-rebounds',title:'Wall rebounds',role:'Practice partner',place:'Rebound wall, Coaches Centre',board:{x:138.5,z:-26.5,yaw:0},color:'#3f7a8c',kind:'rebound',prop:'ball',targets:[{x:156,z:-25}],radius:1.6,
  intro:'The coaches want the rebound wall tested. Face the wall and press Juggle for 50 wall passes. Then Shoot 15 passes into the painted target square, each one from the glowing circle on the grass: it moves after every shot, so you move, open your body and re-aim.',howTo:'Face the wall: Juggle for 50 wall passes, then Shoot at the target from the glowing circle.',unit:'Wall passes',
  lesson:'A wall never gets tired: every rebound is a pass and a first touch. Your character alternates feet on each return, and using both feet makes you much harder to defend.'},
 {id:'ball-kid',title:'Ball kid',role:'Ball kid',place:'Eleven Park touchline (11v11)',board:{x:171,z:113,yaw:-Math.PI/2},color:'#c9a33a',kind:'carry',prop:'ball',targets:[{x:173.5,z:77},{x:172.5,z:127},{x:175,z:66},{x:150,z:153.5},{x:173,z:140}],deliver:{x:170,z:100,label:'ball-kid spot'},radius:1.5,
  intro:'Balls keep going out of play. Run to each loose ball, pick it up, carry it to your ball-kid spot on the halfway line and throw it back so the game can restart quickly.',howTo:'Run to the ball, pick it up, then throw it back from your spot.',unit:'Balls returned',
  work:{target:[{id:'pickup',label:'Pick up the ball',mode:'tap',hint:'Pick the ball up with both hands.'}],deliver:{id:'roll',label:'Throw it back',mode:'tap',hint:'Throw it back like a throw-in: both feet on the ground, two hands, ball from behind and over your head.'}},
  lesson:'Quick ball kids change matches. At Anfield on 7 May 2019, 14-year-old ball boy Oakley Cannonier returned a ball fast, Trent Alexander-Arnold took a quick corner and Divock Origi scored as Liverpool beat Barcelona 4–0.',lessonSource:'https://en.wikipedia.org/wiki/Oakley_Cannonier'},
 {id:'cone-setup',title:'Set out the cones',role:"Coach's assistant",place:'Club Grounds (9v9)',board:{x:167,z:-72,yaw:0},color:'#d9772f',kind:'collect',prop:'cone',targets:[{x:155,z:-93},{x:165,z:-93},{x:165,z:-83},{x:155,z:-83},{x:149,z:-100},{x:151.5,z:-100},{x:168.5,z:-100},{x:171,z:-100}].map(p=>p),radius:1.4,
  intro:'Tonight\'s session needs a 10 m passing square and two dribbling gates. Carry the cone stack to each glowing mark and place a cone on it.',howTo:'Carry the cone stack to each mark and place a cone.',unit:'Cones placed',
  work:{target:[{id:'place',label:'Place cone',mode:'tap',hint:'Set the cone down exactly on the mark.'}]},
  lesson:'Coaches set drills with care: a 10 m square gives passers good angles and time on the ball, and narrow gates reward close control. The right space makes practice feel like a real match.'},
 {id:'line-painter',title:'Paint the centre circle',role:'Groundskeeper',place:'Eleven Park centre circle (11v11)',board:{x:100.5,z:106,yaw:Math.PI/2},color:'#e9e2c8',kind:'trail',prop:'chalk',targets:CIRCLE,radius:1.5,
  intro:'The centre circle has faded. Push the line-marker around the circle: hold Paint and walk over each faded dash in order to repaint it.',howTo:'Hold Paint and walk along the faded dashes in order.',unit:'Dashes painted',
  work:{target:[{id:'paint',label:'Hold to paint',busy:'Painting… keep walking',mode:'hold',hint:'Hold Paint and walk over the next faded dash.'}]},
  lesson:'The centre circle is 9.15 m (10 yards) from the centre mark. At kick-off every opponent must stay outside it, which gives the kicking team room to start. Lines count as part of the area they mark.',lessonSource:'https://www.theifab.com/laws/latest/the-field-of-play/'},
 {id:'court-cleanup',title:'Court clean-up',role:'Club volunteer',place:'Palm Coast Rooftop futsal court',board:{x:23.5,z:-7.5,yaw:0},color:'#4f8f63',kind:'collect',prop:'bottle',targets:[[5,3],[17,6],[10,11],[3,19],[19,21],[12,26],[6,33],[17,35],[22,14],[1,9]].map(([x,z])=>({x,z})),deliver:{x:21.5,z:-7.5,label:'recycling bin'},radius:1.4,
  intro:'After tonight\'s futsal match, bottles are left on the rooftop court. Pick up every bottle, then toss the bag in the recycling bin by this sign.',howTo:'Pick up every bottle, then toss the bag in the recycling bin.',unit:'Bottles picked up',
  work:{target:[{id:'pick',label:'Pick up',mode:'tap',hint:'Pick the bottle up and pop it in your bag.'}],deliver:{id:'toss',label:'Toss in the bin',mode:'tap',hint:'Toss the full bag into the recycling bin.'}},
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
  intro:'Before anyone plays, both goals must be pegged down. Stand at each glowing spot behind the goals and hammer a ground peg in with three hits.',howTo:'Stand at each peg and hammer it down: 3 hits.',unit:'Pegs hammered',
  work:{target:[{id:'hammer',label:'Hammer',mode:'tap',count:3,hint:'Hammer the peg down: three good hits.'}]},
  lesson:'Safety first: Law 1 says goals must be anchored securely to the ground, and portable goals can only be used if they are. A goal that isn\'t pegged down can tip over, so never swing or climb on the crossbar.',lessonSource:'https://www.theifab.com/laws/latest/the-field-of-play/'},
];

// ---- Added 29 Sep 2026 (docs/island-jobs.md §6): the Coral Cay Farm's harvest job (lib/town/coralCay.ts FARM). ----
JOBS.push((()=>{
 // Sep 30 2026 (user): picking is physical. Fruit hangs on five orchard trees: shake a tree to drop it, then pick it up off the
 // ground. Veg: pull sweet potatoes (let go in the green), twist-pick a ripe tomato and pepper (two green ones are not ready),
 // snip the leafy greens. Positions are real plants in lib/town/coralCayWorld.ts (trees list, crop rows 1.4 m apart).
 const spots:HarvestSpot[]=[
  {x:655,z:-124,good:'mango',action:'shake',fruit:3,canopy:{y:2.4,r:1.55,sy:.85,color:'#5b895e'}},
  {x:664,z:-124,good:'orange',action:'shake',fruit:3,canopy:{y:2.4,r:1.3,sy:.85,color:'#739568'}},
  {x:664,z:-117.5,good:'mango',action:'shake',fruit:3,canopy:{y:2.4,r:1.55,sy:.85,color:'#5b895e'}},
  {x:673,z:-117.5,good:'orange',action:'shake',fruit:3,canopy:{y:2.4,r:1.3,sy:.85,color:'#739568'}},
  {x:687,z:-121.4,good:'banana',action:'shake',fruit:3,canopy:'banana'},
  {x:623.8,z:-107.6,good:'sweet-potato',action:'pull'},{x:637.3,z:-106.2,good:'sweet-potato',action:'pull'},
  {x:625.3,z:-114.6,good:'tomato',action:'twist'},{x:634.3,z:-100.6,good:'pepper',action:'twist'},
  {x:635.8,z:-116,good:'tomato',action:'twist',ripe:false},{x:622.3,z:-97.8,good:'pepper',action:'twist',ripe:false},
  {x:628.3,z:-120.2,good:'greens',action:'cut'},
 ];
 const def:JobDef={id:'farm-harvest',title:'Harvest day',role:'Farm hand',place:'The Farm, Coral Cay',board:{x:602.5,z:-115.5,yaw:0},color:'#5f8f3a',kind:'harvest',prop:'produce',
  targets:spots.map(({x,z})=>({x,z})),
  deliver:{x:611,z:-98,label:'farm stand'},radius:1.4,
  intro:'Harvest day on Coral Cay! Pass your ball firmly into an orchard tree trunk to shake ripe mangoes, oranges and bananas loose, control the rebound, then pick the fruit up. In the fields, set the ball down to pull up sweet potatoes, twist off a ripe tomato and pepper, and snip the greens. Then unload your basket at the farm stand.',
  howTo:'Kick the trees for 5 fruit, then pull, pick and snip 5 veg.',unit:'Crops picked',
  lesson:'Food is fuel for football. Carbohydrate foods like maize, sweet potatoes, rice and bananas are your main energy for running, and fruit and vegetables bring vitamins that help you recover. Eat a proper meal a few hours before you play, and drink water, especially on a hot beach.',
  lessonSource:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf',
  task:{type:'harvest',spots,fruitGoal:5,vegGoal:5},
  work:{deliver:{id:'unload',label:'Unload the basket',mode:'tap',hint:'Unload the harvest at the farm stand.'}}};
 return def;})());
// ---- Added 29 Sep 2026 (docs/island-jobs.md §7): a second farm job, sorting snacks by when they fuel a match. ----
JOBS.push({id:'match-day-snacks',title:'Match-day snacks',role:'Farm hand',place:'The Farm, Coral Cay',board:{x:618.2,z:-106.8,yaw:0},color:'#e0873a',kind:'sort',prop:'produce',
 // Three labelled crates on the grass south of the farm track; the harvest basket is by the west gate.
 targets:[{x:604,z:-108.2},{x:608.5,z:-108.2},{x:613,z:-108.2}],deliver:{x:603,z:-104.8,label:'harvest basket'},radius:1.3,
 intro:'The beach soccer teams need their match-day food packed. Take each snack from the harvest basket, read its clue, and put it in the right crate: PRE-MATCH MEAL, HALF-TIME or RECOVERY.',
 howTo:'Take a snack from the basket, then drop it in the crate its clue points to.',unit:'Snacks packed',
 work:{target:[{id:'drop',label:'Drop it in',mode:'tap',hint:'Drop the snack into this crate.'}],deliver:{id:'take',label:'Take a snack',mode:'tap',hint:'Take the next snack from the harvest basket.'}},
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
// ---- Added 30 Sep 2026 (docs/island-jobs.md §13): the Community Garden becomes a paid Garden shift (user decision). ----
// The sign stands on the grass just east of the COMMUNITY GARDEN gate sign (207, 5.5; lib/town/world.ts), clear of the beds, the
// paths, the glasshouse (x 188–216, z 10–28), the benches and Hugo (202, −2). The crate is inside the gate on the paving.
JOBS.push({id:'garden-shift',title:'Garden shift',role:'Gardener',place:'Community Garden',board:{x:217.5,z:5.5,yaw:0},color:'#6a9a3c',kind:'garden',prop:'produce',
 targets:GARDEN_SPOTS.map(({x,z})=>({x,z})),deliver:{x:214,z:2,label:'garden crate'},radius:2.3,areaMargin:15,
 intro:`The Community Garden needs a hand before market day. Walk up to ripe fruit and veg and tap Pick: crouch for the strawberries, tomatoes and carrots in the beds, reach up into the trees for oranges and cherries. Fill your basket with ${GARDEN_SHIFT.goal}, at least ${GARDEN_SHIFT.fruitGoal} fruit and ${GARDEN_SHIFT.vegGoal} veg, then drop it in the garden crate by the gate.`,
 howTo:`Pick ${GARDEN_SHIFT.goal} ripe fruit and veg (at least ${GARDEN_SHIFT.fruitGoal} of each), then drop them in the crate.`,unit:'Picked',
 work:{deliver:{id:'crate',label:'Drop in crate',mode:'tap',hint:'Tip your basket into the garden crate.'}},
 // Lesson text only from the garden's own produce lessons (lib/town/market/goods.ts: strawberry, tomato, carrot, orange).
 lesson:"Fruit is carbohydrate, your muscles' main sprint fuel, and colourful veg gives vitamins and minerals that help you recover between matches. Recover after training with a real meal: veg, carbs, protein and water. Half-time oranges are mostly water, so they rehydrate you.",
 lessonSource:'https://digitalhub.fifa.com/m/16e433eb11621446/original/ukbqfkkxw2o8s1gyjria-pdf.pdf',
 task:{type:'garden',goal:GARDEN_SHIFT.goal,fruitGoal:GARDEN_SHIFT.fruitGoal,vegGoal:GARDEN_SHIFT.vegGoal}});
export const jobById=(id:string)=>JOBS.find(j=>j.id===id);
/** Rebound job: the Coaches Centre practice wall face (lib/town/world.ts) and its painted target square. */
export const REBOUND_WALL={x:156,z:-29.5,halfWidth:13,face:-29.32,target:{x:156,halfWidth:2,bottom:.25,top:1.7},passes:50,shots:15,
 /** Shots count only from a glowing circle (radius) that moves after every attempt: 6–14 m from the target, ≤ 55° off square. */
 spot:{radius:1.4,min:6,max:14,arc:55*Math.PI/180,minMove:3,lawn:{x0:143.5,x1:168.5,z0:-27,z1:-12},
  /** Clear of the two wall-practice partners (lib/town/practiceNpcs.ts Andre, Sofia). */
  avoid:[{x:150,z:-20},{x:162,z:-20}],clear:2.6}};
/** A job sign offers its job within this many metres. */
export const BOARD_RANGE=5;
