/** Fixed boarding footprint; the moored ferry only sways a few centimetres. */
export const FERRY_RAMP={x:239,z:205.6,w:10,d:3.2};
export const FERRY_DECK={x:246,z:199,w:8.3,d:17.3,height:1.5};
export function onFerryBoarding(x:number,z:number){return [FERRY_RAMP,FERRY_DECK].some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2);}
/**
 * The ferry deck's solids (world.ts museumRails; walk height 1.5 on FERRY_DECK). Live QA Nov 12 2026: players got stuck on the
 * deck at about (249.5, 190-197): the cabin's collider (then 6.6 m wide) and the side rails left a 0.64 m strip, exactly a
 * walker's 0.32 m radius each side, so every step was blocked. The collider now matches the drawn 6 m cabin (0.94 m strips both
 * sides), and ferryUnstick() frees anyone who still ends up inside a ferry solid (a jetpack landing, climbing aboard from a swim).
 */
export const FERRY_CABIN={x:246,z:199,w:6,d:10.5,floor:1.4,top:4.8};
/** Bow, stern, starboard and port rails (the port rail stops at z 203.9: the gangway's opening). */
export const FERRY_RAILS:readonly {x:number;z:number;w:number;d:number}[]=[{x:246,z:190.5,w:8,d:.12},{x:246,z:207.5,w:8,d:.12},{x:250,z:199,w:.12,d:17},{x:242,z:197.2,w:.12,d:13.4}];
const FERRY_SOLIDS=[FERRY_CABIN,...FERRY_RAILS];
const WALK_R=.32;
/** Inside the rails, on the deck (x 242.06..249.94, z 190.56..207.44). */
const onDeckInside=(x:number,z:number,r:number)=>x>242.06+r&&x<249.94-r&&z>190.56+r&&z<207.44-r;
/** A walker of radius r at (x, z) touches no ferry solid. */
export function ferryClear(x:number,z:number,r=WALK_R){
  for(const o of FERRY_SOLIDS)if(Math.abs(x-o.x)<o.w/2+r&&Math.abs(z-o.z)<o.d/2+r)return false;return true;}
/** On (or within a step of) the ferry's deck footprint. */
export const nearFerryDeck=(x:number,z:number)=>Math.abs(x-FERRY_DECK.x)<FERRY_DECK.w/2+.5&&Math.abs(z-FERRY_DECK.z)<FERRY_DECK.d/2+.5;
/** At deck height but on the hull's rim outside the rails (not the gangway's opening on the port side aft): no way back in on foot. */
const outsideRails=(x:number,z:number)=>!onDeckInside(x,z,0)&&!(x<242.4&&z>203.9&&z<207.44);
const FREE_STEP=.08,FREE_MAX=3;
/** The nearest point inside the rails where a walker stands `margin` m clear of every ferry solid (rings of FREE_STEP out to
 *  FREE_MAX m); false when none. */
export function ferryFreeSpot(p:{x:number;z:number},out:{x:number;z:number},margin=.02){
  for(let ring=1;ring*FREE_STEP<=FREE_MAX;ring++){const d=ring*FREE_STEP,n=Math.max(8,Math.ceil(d*Math.PI*2/FREE_STEP));
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d;
      if(onDeckInside(x,z,WALK_R+margin)&&ferryClear(x,z,WALK_R+margin)){out.x=x;out.z=z;return true;}}}
  return false;
}
const ferryStuck={t:0,x:NaN,z:NaN},spot={x:0,z:0};
const STUCK_S=1.5,STUCK_MOVE=.05;
/**
 * Called each walking frame on the ferry deck (deck height). Inside a ferry solid's walker clearance or on the rim outside the rails
 * (a landing or a climb that ends in the cabin, on or over a rail): out to the nearest clear deck spot at once. Otherwise a push that makes less than
 * STUCK_MOVE m of progress for STUCK_S s (wedged) also moves to a spot a hand's width clear, like the boats' boatUnstick.
 * True when it moved the player.
 */
export function ferryUnstick(dt:number,p:{x:number;z:number},pushing:boolean){
  if(!ferryClear(p.x,p.z)||outsideRails(p.x,p.z)){ferryStuck.t=0;ferryStuck.x=NaN;if(ferryFreeSpot(p,spot)){p.x=spot.x;p.z=spot.z;return true;}return false;}
  if(!pushing){ferryStuck.t=0;ferryStuck.x=NaN;return false;}
  if(!(Math.hypot(p.x-ferryStuck.x,p.z-ferryStuck.z)<STUCK_MOVE)){ferryStuck.x=p.x;ferryStuck.z=p.z;ferryStuck.t=0;return false;}
  ferryStuck.t+=dt;if(ferryStuck.t<STUCK_S)return false;
  ferryStuck.t=0;ferryStuck.x=NaN;
  if(ferryFreeSpot(p,spot,.15)){p.x=spot.x;p.z=spot.z;return true;}
  return false;
}
/** Tests only. */
export const resetFerryUnstick=()=>{ferryStuck.t=0;ferryStuck.x=NaN;};
