/**
 * Fuel (user, Sep 30 2026: "Add a fuel bar with the coins, fish and fruit… you need fuel to do things around the island; go to
 * the Konbini to buy items to replenish"; "Flying spends more fuel since it's easier to do; walking the least"). Pure rules; the
 * browser store is fuelStore.ts, the design and research are in docs/economy/FUEL_2026-09-30.md, tests in tests/fuel.cjs.
 *
 * Fuel is football-nutrition teaching ("fuel your body like a player"), NOT a stamina paywall:
 *  - Only optional fast travel costs fuel: flying most, then the rides (easier/faster rides more), then a Shift sprint; walking
 *    costs the least and ALWAYS works, even at 0, so a child can always walk to the Konbini, the garden or their basket.
 *  - Learning never costs fuel and is never blocked: lessons, plays, quizzes, paths, books, stories (activityCost() = 0, and the
 *    travel sampler is paused while a lesson or field menu is open).
 *  - At 0 the easy modes (jetpack, rides, sprint) rest until the player eats or drinks something; walking carries on.
 *  - Refuel: Konbini food and drinks (drink machines included), and fruit/veg from the island pocket (free garden picks are the
 *    zero-coin path). A new day starts with breakfast: fuel rises to at least FUEL_NEW_DAY.
 *  - No offline drain and no timers: fuel only changes from movement the player makes (sampled on the HUD's existing 150 ms
 *    tick, never a new loop) and from eating. Being away never costs anything.
 */
import type {Consumable,FoodGroup} from '../konbini/food';

export const FUEL_MAX=100;
/** At or below this the bar shows "Low" and a gentle note suggests a snack. */
export const FUEL_LOW=25;
/** Breakfast: the first moment of a new local day lifts fuel to at least this (never lowers it). */
export const FUEL_NEW_DAY=100;// a full tank every day (kids' game ease-up, Sep 30 2026)
/** Rides, the jetpack and sprinting need at least this much fuel. Walking needs none. */
export const FUEL_RIDE_MIN=1;
export const FUEL_STORAGE_KEY='fi2-fuel-v1';

export type FuelMode='walk'|'sprint'|'scooter'|'bike'|'moped'|'jetpack';
/** Fuel per second of actual movement (standing still costs nothing). The easier the travel, the more it costs:
 *  jetpack > moped > bike > scooter > sprint > walk. One full tank ≈ 28 min of flying, 37 min on a moped, 9 h of walking. */
// Eased twice for a kids' game (user, Sep 30 2026: "drains too fast", then "drain the energy even less"): a full tank ≈ 28 min
// flying, 37 min moped, 48 min bike, 67 min scooter, 1.9 h sprinting, 9 h walking.
export const FUEL_RATE:Record<FuelMode,number>={walk:.003,sprint:.015,scooter:.025,bike:.035,moped:.045,jetpack:.06};
/** Top speed per mode (m/s, lib/town/travelModes.ts; sprint = the walking Shift sprint). Used only to ignore teleports. */
export const FUEL_SPEED:Record<FuelMode,number>={walk:3.7,sprint:6,scooter:14,bike:20,moped:28,jetpack:34};
export const FUEL_LABEL:Record<FuelMode,string>={walk:'Walking',sprint:'Sprinting',scooter:'Scooter',bike:'Bike',moped:'Moped',jetpack:'Jetpack'};

/** Learning never costs fuel (a guard the tests pin): every learning activity is free, and only travel modes drain. */
export type Activity='lesson'|'quiz'|'play'|'path'|'book'|'story'|'review'|'ball-hunt'|'job'|'fishing'|'garden'|'talk';
/** Activities cost nothing by themselves; only the travelling done between (or during) them uses fuel. Jobs are on foot, so a
 *  job costs only its walking: a fuel fee on paid work would make coins cost coins. */
export const activityCost=(_a:Activity)=>0;

export type FuelState={version:1;fuel:number;day:string};
export const fullFuel=(day=''):FuelState=>({version:1,fuel:FUEL_MAX,day});
const clamp=(v:number)=>Math.max(0,Math.min(FUEL_MAX,v));
/** A missing or broken save starts full (a new player is never greeted by an empty bar). */
export function sanitizeFuel(raw:unknown,day:string):FuelState{
 if(!raw||typeof raw!=='object')return fullFuel(day);const v=raw as Partial<FuelState>;
 if(v.version!==1||typeof v.fuel!=='number'||!Number.isFinite(v.fuel))return fullFuel(day);
 return {version:1,fuel:clamp(v.fuel),day:typeof v.day==='string'&&v.day.length<=12?v.day:''};
}
/** Breakfast: on a new local day fuel rises to at least FUEL_NEW_DAY. Time away never lowers it (no offline drain). */
export function startDay(s:FuelState,day:string):FuelState{
 if(s.day===day)return s;return {version:1,fuel:Math.max(s.fuel,FUEL_NEW_DAY),day};
}
/** One sample can count at most this many seconds (a hidden tab or a long frame never drains a burst). */
export const MAX_SAMPLE_SECONDS=.5;
export function drain(s:FuelState,mode:FuelMode,seconds:number):FuelState{
 const t=Math.max(0,Math.min(MAX_SAMPLE_SECONDS,Number.isFinite(seconds)?seconds:0));if(!t||s.fuel<=0)return s;
 return {...s,fuel:clamp(s.fuel-FUEL_RATE[mode]*t)};
}
export function refill(s:FuelState,amount:number):FuelState{
 if(!(amount>0))return s;return {...s,fuel:clamp(s.fuel+amount)};
}
/** Can this travel mode be used now? Walking always can. */
export const canUse=(mode:FuelMode,fuel:number)=>mode==='walk'||fuel>=FUEL_RIDE_MIN;
export type FuelLevel='full'|'ok'|'low'|'empty';
export function fuelLevel(fuel:number):FuelLevel{return fuel<FUEL_RIDE_MIN?'empty':fuel<=FUEL_LOW?'low':fuel>=FUEL_MAX?'full':'ok';}
/** What the bar shows: a whole number. Rounded down, so 0 on the bar is exactly "empty" (below FUEL_RIDE_MIN). */
export const fuelShown=(fuel:number)=>Math.floor(Math.max(0,Math.min(FUEL_MAX,fuel))+1e-9);

// ---- Refuelling ------------------------------------------------------------------------------------------------------------
/** Fuel by nutrition group (the same groups and teaching lines as the Konbini, lib/konbini/food.ts FOOD_NOTES): carbohydrate is
 *  football's main fuel, a balanced meal the biggest refill, protein is mostly recovery, a drink rehydrates, a sweet treat is a
 *  small quick boost. */
// One stop fixes it (kids' game, Sep 30 2026): a balanced meal fills the tank; the order still teaches (meal > carb > protein > drink > treat).
export const FUEL_BY_GROUP:Record<FoodGroup,number>={carb:50,balanced:100,protein:30,hydration:25,treat:15};
/** Items whose nutrition differs from their group. */
export const FUEL_BY_ITEM:Record<string,number>={'bento-small':100,'bento-locomoco':100,'hot-yakiimo':55,'drink-sports':30};
/** A sports drink (the Konbini's `drink-sports` or a machine's `drink-sports-<machine>`) carries a little sugar: 15. */
export function foodFuel(item:Pick<Consumable,'id'|'group'>):number{return FUEL_BY_ITEM[item.id]??(/^drink-sports\b/.test(item.id)?30:FUEL_BY_GROUP[item.group]);}
/** Produce that can be eaten straight from the basket (fruit and crunchy veg). Fish and sweet potato (needs cooking: try the
 *  Konbini's yaki imo) are not. Any produce added later counts as fruit 25 / veg 20 via producePocketFuel. */
export const PRODUCE_FUEL:Record<string,number>={banana:30,mango:28,orange:25,strawberry:22,cherry:22,carrot:22,tomato:20,pepper:20,greens:20};
export const NOT_RAW:ReadonlySet<string>=new Set(['sweet-potato']);
/** Fuel for eating one basket good, or 0 when it can't be eaten raw. */
export function produceFuel(id:string,kind:'produce'|'fish',category?:'fruit'|'veg'|'fish'):number{
 if(kind!=='produce'||NOT_RAW.has(id))return 0;return PRODUCE_FUEL[id]??(category==='fruit'?25:20);
}

// ---- Travel sampling (pure; Town calls it from its existing 150 ms HUD tick) ---------------------------------------------------
export type TravelSample={now:number;mode:FuelMode;x:number;z:number;
 /** a lesson, field menu, truck bed or anything not under the player's own steam: fuel does not change */paused:boolean;
 /** jetpack in the air: hovering and climbing burn fuel too, not only flying across (user, Sep 30 2026: "flying should also drain it") */airborne?:boolean};
/** Below this speed the player is standing (or nudging) and nothing drains. */
export const MOVING_SPEED=.5;
/** Returns the seconds of movement in `mode` since the previous sample (0 when paused, standing, or after a teleport). */
export function createTravelSampler(){
 let last:{now:number;x:number;z:number}|null=null;
 return function sample(s:TravelSample):number{
  const prev=last;last={now:s.now,x:s.x,z:s.z};
  if(!prev||s.paused)return 0;
  const dt=(s.now-prev.now)/1000;if(!(dt>0))return 0;
  const d=Math.hypot(s.x-prev.x,s.z-prev.z),speed=d/dt;
  if(speed<MOVING_SPEED&&!(s.airborne&&s.mode==='jetpack'))return 0;
  // Map travel, ferries, field trips and respawns move the player far in one tick: never charged.
  if(d>FUEL_SPEED[s.mode]*1.8*Math.min(dt,MAX_SAMPLE_SECONDS)+4)return 0;
  return Math.min(dt,MAX_SAMPLE_SECONDS);
 };
}

// ---- Teaching copy (gentle; never alarming; always names a free way back) ---------------------------------------------------
export const FUEL_COPY={
 what:'Fuel is your energy for zooming around. Footballers fuel up with carbs (rice, bread, fruit), drink water, and refuel at half time.',
 cost:'Flying burns the most, then the moped, bike and scooter. Walking uses almost none and always works. Lessons, plays and quizzes never use fuel.',
 where:'Refuel with a snack at a Konbini, a drink from a drink machine, or fruit from your pocket. Garden fruit is free to pick!',
 low:{title:'Fuel running low',detail:'Players refuel at half time: grab a snack at the Konbini, or eat a banana from your pocket.'},
 empty:{title:'Out of fuel: time to walk',detail:'Walking always works. Eat fruit from your pocket or visit a Konbini to ride and fly again.'},
 blocked:(ride:string)=>({title:`Your ${ride.toLowerCase()} needs fuel`,detail:'Walk to a Konbini, a drink machine or the garden, or eat fruit from your pocket.'}),
 newDay:'You had breakfast at home: every new day starts with a full tank.',
} as const;

// ---- Store core (ports, so the tests drive persistence and the clock; browser instance in fuelStore.ts) -----------------------
export type FuelNotice={id:number;kind:'low'|'empty'|'blocked';title:string;detail:string};
export type FuelPorts={read:()=>unknown;write:(s:FuelState)=>void;now:()=>number;day:(now:number)=>string};
export function createFuelStore(ports:FuelPorts){
 let state:FuelState|null=null,notice:FuelNotice|null=null,seq=0;const listeners=new Set<()=>void>();
 const emit=()=>listeners.forEach(fn=>fn());
 const save=(s:FuelState)=>{state=s;try{ports.write(s);}catch{/* this visit still knows */}};
 function current():FuelState{
  const day=ports.day(ports.now());
  if(!state){let raw:unknown=null;try{raw=ports.read();}catch{}state=sanitizeFuel(raw,day);}
  const next=startDay(state,day);if(next!==state)save(next);
  return state;
 }
 const note=(kind:FuelNotice['kind'],copy:{title:string;detail:string})=>{notice={id:++seq,kind,...copy};};
 return {
  read:current,
  get notice(){return notice;},
  /** Movement in `mode` for `seconds` (from createTravelSampler). Saves and notifies only when the shown number changes. */
  travel(mode:FuelMode,seconds:number):FuelState{
   const before=current(),after=drain(before,mode,seconds);if(after===before)return before;
   const shownChanged=fuelShown(after.fuel)!==fuelShown(before.fuel),seen=seq;
   const was=fuelShown(before.fuel),now=fuelShown(after.fuel);// notes follow the number on the bar
   if(was>FUEL_LOW&&now<=FUEL_LOW&&now>=FUEL_RIDE_MIN)note('low',FUEL_COPY.low);
   if(was>=FUEL_RIDE_MIN&&now<FUEL_RIDE_MIN&&mode!=='walk')note('empty',FUEL_COPY.empty);
   if(shownChanged){save(after);emit();}else{state=after;if(seq!==seen)emit();}
   return after;
  },
  /** Eat or drink something worth `amount` fuel; returns the fuel actually gained (0 at a full tank). */
  eat(amount:number):number{const before=current(),after=refill(before,amount),gained=after.fuel-before.fuel;if(gained>0){save(after);emit();}return Math.round(gained);},
  /** A ride or the jetpack was refused for lack of fuel: one gentle note. */
  blocked(mode:FuelMode){note('blocked',FUEL_COPY.blocked(FUEL_LABEL[mode]));emit();},
  canUse:(mode:FuelMode)=>canUse(mode,current().fuel),
  /** Drop the cached state (a storage event from another tab). */
  refresh(){state=null;emit();},
  subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 };
}
