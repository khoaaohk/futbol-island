/**
 * Coral Cay ball hunt (Sep 29 2026): the twenty balls that take the hunt from 80 to 100 — eight along the causeway, four on
 * the two sandbar stops and eight on the cay. Every position is derived from the stable Coral Cay helpers and anchors in
 * coralCay.ts (causewayPoint, causewayWaterline, SANDBARS, CAY_LANDMARKS, CAY_HOUSES, HOSTEL, FARM, BEACH_COURT…), never
 * typed in as world coordinates, so the balls follow any reshaping of the causeway or the cay. tests/coral-cay-balls.cjs
 * re-checks every spot against the built world: walkable ground (or the flight corridor for the two aerial balls), clear of
 * every obstacle, and spaced from every other ball. Lessons, sources and the overlap audit: docs/ball-hunt-coral-cay-2026-09-29.md.
 *
 * Pure data (no three.js): the island imports it through coinQuest.ts, like every other ball.
 */
import type {CoinSpot} from './coinQuest';
import * as cay from './coralCay';

type Pt={x:number;z:number};
/** A point `d` metres right of travel (negative = left, i.e. north at the start) of the causeway centre line at t ∈ [0,1]. */
const deck=(t:number,d:number):Pt=>{const p=cay.causewayPoint(t);return {x:p.x-p.dirZ*d,z:p.z+p.dirX*d};};
/** The t (sampled every 0.005 inside [t0,t1]) where the beach bank on `side` is widest — so bank balls stay on sand. */
function widestBank(t0:number,t1:number,side:cay.RoadSide){let best=t0,w=-1;for(let t=t0;t<=t1+1e-9;t+=.005){const p=cay.causewayPoint(t),b=side<0?p.bankLeft:p.bankRight;if(b>w){w=b;best=t;}}return {t:best,width:w};}
/** Middle of the widest beach bank between t0 and t1 on one side of the deck. */
const bankMiddle=(t0:number,t1:number,side:cay.RoadSide)=>{const {t,width}=widestBank(t0,t1,side);return deck(t,side*(cay.CAUSEWAY.deckHalf+width*.45));};
/** A sandbar prop spot: an offset from the bar's centre pulled inward until a `margin` box around it is on walkable sand
 *  (the same rule coralCayWorld.ts uses for the bar's own props). */
function onBar(s:cay.Sandbar,dx:number,dz:number,margin:number):Pt{
 for(let k=1;k>.2;k-=.05){const x=s.x+dx*k,z=s.z+dz*k;if([[0,0],[margin,0],[-margin,0],[0,margin],[0,-margin]].every(([a,b])=>cay.onSandbarStop(x+a,z+b)))return {x,z};}
 return {x:s.x,z:s.z};
}
/** Toward the cay centre from a point, by `by` metres. */
const inland=(p:Pt,by:number):Pt=>{const dx=cay.CAY_CENTER.x-p.x,dz=cay.CAY_CENTER.z-p.z,l=Math.hypot(dx,dz)||1;return {x:p.x+dx/l*by,z:p.z+dz/l*by};};
const house=(name:string)=>{const h=cay.CAY_HOUSES.find(r=>r[5]===name)!;return {x:h[0],z:h[1],w:h[2],d:h[3],h:h[4],roof:h[4]+.23,front:h[1]+h[3]/2};};
const round2=(n:number)=>Math.round(n*100)/100;
const at=(p:Pt)=>({x:round2(p.x),z:round2(p.z)});

// ---- Derived anchor points -----------------------------------------------------------------------------------------------
const starfish=cay.SANDBARS.find(s=>s.id==='starfish')!,turtle=cay.SANDBARS.find(s=>s.id==='turtle')!;
const L=cay.CAY_LANDMARKS;
const cafe=house('COCONUT CAFÉ'),surf=house('SURF SHOP'),club=cay.COURT_SCOREBOARD;// the court scoreboard wall (the club house was removed, Sep 29 2026)
/** The welcome arch's south pier. coralCayWorld.ts stands the piers on the pavement 5.9 m either side of the road line, 1.1 m
 *  square (not exported yet; tests/coral-cay-balls.cjs fails if the target is no longer mounted on a pier). */
const ARCH_PIER_OFFSET=5.9,ARCH_PIER_HALF=.55;
const archPierZ=L.welcomeArch.z+ARCH_PIER_OFFSET,archFaceX=L.welcomeArch.x+ARCH_PIER_HALF+.01;
/** The buoy (Sep 29 2026 fix): a kick target 6–10 m off the rail, where there is no beach bank (so there is a rail and open
 *  water), away from the sandbars and as far as possible from every shark loop. Searched over the whole over-water road on
 *  both sides, so it follows any reshaping of the causeway or the sharks' paths. The kicking spot is the deck edge beside it. */
export const BUOY_OFF_RAIL=8;
const buoyPlan=(()=>{let best:{p:Pt;from:Pt;clear:number;s:number;side:cay.RoadSide}|null=null;
 const sharks=cay.SHARK_LOOPS.flatMap(l=>l.points);
 for(let s=cay.CAUSEWAY.sWater0+20;s<=cay.CAUSEWAY.sWater1-20;s+=2)for(const side of [-1,1] as cay.RoadSide[]){
  const t=s/cay.CAUSEWAY_LENGTH,c=cay.causewayPoint(t),bank=side<0?c.bankLeft:c.bankRight;if(bank>0)continue;
  // No bank anywhere within ±8 m of road, so the kicker stands at a rail, not on sand.
  if([-8,-4,4,8].some(ds=>cay.shoulderWidth(s+ds,side)>0))continue;
  const off=Math.max(cay.CAUSEWAY.railHalf+BUOY_OFF_RAIL,cay.causewayWaterline(s,side)+2.5);if(off-cay.CAUSEWAY.railHalf>10)continue;
  const p=deck(t,side*off),from=deck(t,side*(cay.CAUSEWAY.walkHalf-.9));
  if(cay.SANDBARS.some(b=>Math.hypot(p.x-b.x,p.z-b.z)<b.radius+20))continue;
  const clear=Math.min(...sharks.map(q=>Math.hypot(q.x-p.x,q.z-p.z)));
  if(!best||clear>best.clear)best={p,from,clear,s,side};}
 return best!;})();
const buoy=buoyPlan.p;
/** Where to stand to shoot at the buoy (chalk-marked on the deck), and the buoy's shark clearance (tests and docs). */
export const BUOY_KICK_SPOT=at(buoyPlan.from),BUOY_SHARK_CLEARANCE=buoyPlan.clear;
const court=cay.BEACH_COURT;
/** Halfway (by road length) between the Starfish and Turtle spurs: the road cover. */
const betweenSpurs=(starfish.spur.s+turtle.spur.s)/2/cay.CAUSEWAY_LENGTH;

/** Where each ball sits and how it is found. Teaching text is written for the level its difficulty sets (ballHuntLessons.ts). */
export const CORAL_CAY_SPOTS:CoinSpot[]=[
 // ── The causeway (eight): deck edges, the beach banks, a road cover, the welcome arch and two aerial balls. ──
 {id:'cay-warmup',name:'Causeway · south pavement',...at(deck(.115,4.6)),y:0,kind:'hidden',
  clue:'Before the long walk to Coral Cay, a training bag waits where the causeway leaves the island.',
  detail:'Walk onto the causeway from the Community Hall. Just after the sea begins, look on the south pavement for a small training bag.',
  teaching:'Warm up before you play. Jog, skip, balance and jump for about fifteen minutes before a game. In a big study, children’s teams that warmed up like this had about half as many injuries.',lesson:'movement'},
 {id:'cay-line',name:'Causeway · north edge parcel',...at(deck(.215,-4.6)),y:0,kind:'kick',
  clue:'On the first bend out to sea, a parcel sits right on the edge of the causeway pavement.',
  detail:'Follow the causeway to its first bend. On the north pavement, face the football-marked parcel and kick its target.',
  teaching:'The whole ball must cross the line. A ball on the line, or even hanging over it, is still in play. Keep playing until the whole ball is over.',lesson:'support'},
 {id:'cay-bank-pad',name:'Causeway · south beach bank',...at(bankMiddle(.38,.5,1)),y:0,kind:'landing',
  clue:'Where the causeway turns north again, a padded box rests on the widest strip of beach.',
  detail:'Walk down from the deck onto the sand bank on the south side of the second bend. Land on the padded lid, or face it and kick the target.',
  teaching:'Use both feet. If you can only kick with one foot, a defender can push you onto it. A player who uses both feet has twice as many ways to go.',lesson:'movement'},
 {id:'cay-bank-kick',name:'Causeway · north beach bank',...at(bankMiddle(.44,.58,-1)),y:0,kind:'kick',
  clue:'On the north side of the causeway, before Turtle Sandbar, a parcel waits on the sand bank.',
  detail:'Step off the deck onto the north beach bank as the road climbs toward Turtle Sandbar. Face the parcel and kick its target.',
  teaching:'Keeper, pick the right throw. A roll along the ground is the most accurate. An overarm throw goes further but is harder to control. Choose the pass your teammate can take.',lesson:'support'},
 {id:'manhole-causeway',name:'Manhole · causeway road',...at(deck(betweenSpurs,0)),y:0,kind:'landing',manhole:true,
  clue:'Look down on the causeway road halfway between Starfish and Turtle sandbars. A football pattern marks the middle of the road.',
  detail:'Fly along the causeway to the halfway point between Starfish and Turtle sandbars, right over the manhole cover in the middle of the road. Then choose Walk to drop straight down onto it. Walking or driving over the cover will not open it.',
  teaching:'Play on: the advantage. From above you can see the attack still flowing after a foul. The referee can let play continue when stopping would hurt the fouled team, and still give the free kick if the chance is gone within a few seconds.',lesson:'support'},
 {id:'cay-arch',name:'Welcome arch · pier target',x:round2(archFaceX+2.4),y:0,z:round2(archPierZ),kind:'kick',wall:{x:round2(archFaceX),y:4.2,z:round2(archPierZ),high:true,round:true,facing:'east'},
  clue:'Look up at the east face of the south pier of the Welcome to Coral Cay arch.',
  detail:'Stand on the cay just east of the arch and look high on its south pier for a round football target. Back away, hold Kick for a high shot, then collect the ball on the ground below.',
  teaching:'Manage the game when you lead. Keep the ball, pass it safely and play in their half so they cannot attack you. Stay fair, though: wasting time on purpose can earn a yellow card.',lesson:'support'},
 {id:'sky-causeway',name:'Causeway sky',...at(deck(.5,0)),y:90,kind:'hidden',parachute:true,
  clue:'Look high above the middle of the causeway, where the sea wind blows across the road.',
  detail:'Fly out along the causeway corridor and rise above this high floating ball, then steer down through it with your parachute open. Only an open parachute can collect it.',
  teaching:'Read the wind. On the coast, wind pushes a high ball far more than a ball rolling on the ground. Into the wind, keep passes low. With the wind behind you, a long ball runs further, so hit it softer.',lesson:'movement'},
 {id:'cay-buoy',name:'Causeway buoy',...at(buoy),y:0,kind:'hidden',parachute:true,buoy:true,kickFrom:BUOY_KICK_SPOT,
  clue:'A red and white buoy floats in the sea beside the causeway rail, with a football resting on top. You can shoot it from the rail.',
  detail:'Find the chalk mark on the causeway pavement beside the buoy. Stand on it, face the buoy and kick: hit the buoy and its ball is yours. Never go into the water, because the sharks patrol it. You can also glide down to the ball with your parachute.',
  teaching:'Defend a corner with zones and markers. Buoys mark spaces in the sea; zonal defenders guard spaces in the box, and markers follow one opponent. Most teams mix both, so every space and every runner is covered.',lesson:'support'},

 // ── The sandbars (four): Starfish is the barefoot stop, Turtle the restarts stop. ──
 {id:'cay-barefoot',name:'Starfish Sandbar · training bag',...at(onBar(starfish,-2,starfish.side*-9,2.2)),y:0,kind:'hidden',
  clue:'Take the boardwalk to Starfish Sandbar, where the sign says to play barefoot.',
  detail:'Walk out along the Starfish Sandbar boardwalk and look on the sand away from the road for a small training bag.',
  teaching:'Play barefoot on sand. Beach soccer players go barefoot. Strike with the top of your foot, toes pointed, and bend your knees so you keep your balance on the soft sand.',lesson:'movement'},
 {id:'cay-no-offside',name:'Starfish Sandbar · parcel',...at(onBar(starfish,11,starfish.side*-2,2.2)),y:0,kind:'kick',
  clue:'On the east end of Starfish Sandbar, a football parcel sits on the sand.',
  detail:'Walk to the east end of Starfish Sandbar. Face the football-marked parcel and kick its target.',
  teaching:'No offside on the sand. Beach soccer has no offside rule, so attackers can wait right by the goal. Defenders must always know where they are.',lesson:'movement'},
 {id:'cay-kick-in',name:'Turtle Sandbar · parcel',...at(onBar(turtle,9,turtle.side*4,2.2)),y:0,kind:'kick',
  clue:'Turtle Sandbar teaches restarts. A parcel waits on its sand, east of the boardwalk.',
  detail:'Take the Turtle Sandbar boardwalk south onto the sand. Look east of it for the football-marked parcel and kick its target.',
  teaching:'Kick-in or throw-in: you choose. In beach soccer, when the ball goes over the touchline, you can kick it in or throw it in. Throw to a close teammate’s feet, or kick it far to a free one.',lesson:'support'},
 {id:'cay-surfaces',name:'Turtle Sandbar · padded box',...at(onBar(turtle,-2,turtle.side*10,2.2)),y:0,kind:'landing',
  clue:'At the far end of Turtle Sandbar, a padded box sits where the sand meets the sea.',
  detail:'Walk to the far end of Turtle Sandbar, away from the road. Land on the padded lid, or face it and kick the target.',
  teaching:'Every surface plays differently. On sand the ball stops quickly, on hard dry ground it runs and bounces more, and a futsal ball is made to bounce low. Take a few touches to learn each pitch.',lesson:'support'},

 // ── The cay (eight): the court, Sharks Beach, the scoreboard, the surf shop, the café, the hostel, the farm and the lifeguard tower. ──
 {id:'cay-court',name:'Sharks Beach court · parcel',x:round2(court.x-court.length/2-6),y:0,z:round2(court.z+court.width/2-4),kind:'kick',
  clue:'Behind the west goal of the beach-soccer court, a parcel sits on the sand.',
  detail:'Walk round the west end of the beach-soccer court, behind the goal. Face the football-marked parcel and kick its target.',
  teaching:'Pass in the air on sand. Sand makes a rolling ball bounce and stop. Beach players flick the ball up and pass it through the air so it lands at a teammate’s feet.',lesson:'support'},
 {id:'cay-overhead',name:'Sharks Beach · training bag',...at(L.sharksBeach),y:0,kind:'hidden',
  clue:'Go to Sharks Beach, the bay nearest the beach-soccer court.',
  detail:'Walk from the court to Sharks Beach on the north-east shore. A training bag waits on the sand. Stay on the beach; the sharks swim along the causeway.',
  teaching:'The overhead kick, safely. Beach players love bicycle kicks because sand is soft to land on. Only try one with nobody close to you, and land on your hands and back.',lesson:'movement'},
 {id:'cay-club',name:'Court scoreboard · high target',x:round2(club.x+club.w/2-3),y:0,z:round2(club.front+.12+2.5),kind:'kick',wall:{x:round2(club.x+club.w/2-3),y:4.6,z:round2(club.front+.12),high:true,round:true},
  clue:'Look high on the court scoreboard, facing the pitch.',
  detail:'Stand between the court’s teaching boards and the clubhouse, near its east end. Look up for a round football target, hold Kick for a high shot, then collect the ball below.',
  teaching:'The keeper joins the attack. In beach soccer the keeper often steps out to help build the attack, making an extra player. Move the ball quickly, because their goal is empty behind them.',lesson:'width'},
 {id:'cay-surf-roof',name:'Surf Shop rooftop',x:surf.x,y:round2(surf.roof),z:round2(surf.z+surf.d*.2),kind:'hidden',
  clue:'The surf shop on the cay boulevard has a surprise on its roof.',
  detail:'Fly onto the Surf Shop roof and look near its front edge, between the roof tank and the roof box.',
  teaching:'Small island, big team. Tahiti, a small Pacific island, reached the Beach Soccer World Cup final in 2015 and 2017. Island teams show that trust and teamwork can beat bigger nations.',lesson:'support'},
 {id:'cay-fuel',name:'Coconut Café · side terrace',x:round2(cafe.x-cafe.w/2-2.4),y:0,z:round2(cafe.z+1.5),kind:'hidden',
  clue:'The Coconut Café is the first shop on the cay. Look along its west side.',
  detail:'Walk past the Welcome arch to the Coconut Café. A training bag waits beside its west wall.',
  teaching:'Fuel up before you play. Eat a normal meal a few hours before a game, and a small snack like fruit nearer the time. Food is energy for running.',lesson:'movement'},
 {id:'cay-rest',name:'Coral Cay Hostel · verandah',...at({x:L.hostel.x,z:L.hostel.z+2.2}),y:0,kind:'hidden',
  clue:'Visiting beach-soccer teams sleep at the Coral Cay Hostel. Look by its verandah.',
  detail:'Follow the path south from the plaza to the hostel. A training bag waits on the grass in front of the middle of its verandah.',
  teaching:'Rest makes you better. Your body gets stronger while you rest and sleep. Children your age need 9 to 12 hours of sleep, and a day or two off sport each week.',lesson:'movement'},
 {id:'cay-water',name:'Coral Cay Farm · water tank parcel',x:round2(cay.FARM.tank.x+6),y:0,z:round2(cay.FARM.tank.z),kind:'kick',
  clue:'The farm’s water tank keeps the crops alive. A parcel waits beside it.',
  detail:'Go through the farm’s west gate and walk south toward the windmill and water tank. Face the football-marked parcel east of the tank and kick its target.',
  teaching:'Drink in the heat. On a hot day, drink water before, during and after playing, a little at a time. In very hot matches, referees can stop for drinks or cooling breaks.',lesson:'movement'},
 {id:'cay-heading',name:'Lifeguard tower · padded box',...at(inland(L.lifeguardTower,5.5)),y:0,kind:'landing',
  clue:'The lifeguard keeps swimmers safe on the cay’s eastern headland. A padded box sits by the tower.',
  detail:'Walk to the easternmost beach and find the lifeguard tower. Land on the padded box beside it, or face it and kick the target.',
  teaching:'Heading and young players. To keep heads safe, younger children in England and the USA do not practise heading. Keep the ball on the ground and play with your feet.',lesson:'support'},
];

/** Every Coral Cay ball id, in hunt order (used by tests and the save migration). */
export const CORAL_CAY_BALL_IDS=CORAL_CAY_SPOTS.map(s=>s.id);
