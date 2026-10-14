/**
 * Lookout telescope on Summit Isle (Oct 12 2026; user: "Lookout telescope: tap it to zoom across the sea to the main island,
 * Coral Cay and the KIT SHOP sign. It teaches kids the map and hides a coin hunt").
 * Pure rules, no three.js and no DOM (tests/telescope.cjs); the 3D side is lib/graphics/summitActivities.ts.
 *
 *  - Landmarks: when one is centred in the eyepiece its name and a line about how to get there show (learning the map).
 *  - Glints: five sparkles only the telescope shows. Centre one and hold it to spot it: it is saved and marked on the map. Walk
 *    there and the coins are yours (a one-off learning reward each, learn:explore:telescope-<id>, never metered).
 * Positions come from the places' own modules (venues, Coral Cay, the KIT SHOP and museum doors, the East Jetty, Summit Isle),
 * and the stand's spot is found next to the summit lookout at call time, so both follow the island's final shape.
 */
import {VENUES,ARCADE_DOOR,ISLAND_SQUARE} from './venues';
import {CORAL_CAY_ARRIVAL,BEACH_COURT} from './coralCay';
import {EAST_PIER} from './eastPier';
import {KIT_SHOP,KIT_SHOP_FRONT,SHOP_DOOR} from '../shop/shopDoors';
import {MUSEUM_DOOR} from '../museum/museumDoors';
import {SUMMIT_LANDMARKS,SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_OBSTACLES,SANDBAR_NAME,SANDBAR_PATH,SANDBAR_LENGTH,summitGround,onSummitIsle} from './summitIsle';

export type ScopePoint={x:number;y:number;z:number};
export type TelescopeLandmark=ScopePoint&{id:string;name:string;line:string};
const eleven=VENUES.find(v=>v.id==='11v11')??VENUES[0];

/** What the eyepiece names (heights are where the eye looks: a roof sign, a lighthouse lamp, a pitch's centre circle). */
export const TELESCOPE_LANDMARKS:readonly TelescopeLandmark[]=[
 {id:'main-island',name:'Futbol Island',x:ISLAND_SQUARE.x,y:3,z:ISLAND_SQUARE.z,line:'That’s the main island, where the Island Square and the arcade are. Fly the jetpack or take the ferry home.'},
 {id:'coral-cay',name:'Coral Cay',x:CORAL_CAY_ARRIVAL.x,y:2,z:CORAL_CAY_ARRIVAL.z,line:`That’s Coral Cay. Walk the ${SANDBAR_NAME} to get there!`},
 {id:'kit-shop',name:'KIT SHOP sign',x:KIT_SHOP.x,y:KIT_SHOP.h+1.4,z:KIT_SHOP_FRONT,line:'The KIT SHOP rooftop sign, on the north side of the island. Boots, shirts and balls live there.'},
 {id:'museum',name:'History Museum',x:MUSEUM_DOOR.x,y:5,z:MUSEUM_DOOR.front,line:'The History Museum, by the south shore. Football’s story from 1863 to today.'},
 {id:'arcade',name:'The Arcade',x:ARCADE_DOOR.x,y:9,z:ARCADE_DOOR.z-4,line:'The Arcade’s neon roof, next to the Island Square. Your Summit Kick score is on its high-score boards!'},
 {id:'stadium',name:eleven.name,x:eleven.x,y:1,z:eleven.z,line:`${eleven.name}, the big 11-a-side pitch. Every island pitch has a different size: count the players!`},
 {id:'east-jetty',name:'East Jetty',x:EAST_PIER.cx,y:2.5,z:EAST_PIER.cz,line:'The East Jetty curls out into the sea. Try its shooting challenge ring off the end!'},
 {id:'beach-court',name:'Sharks Beach Court',x:BEACH_COURT.x,y:1,z:BEACH_COURT.z,line:'The beach soccer court on Coral Cay. Barefoot football on sand!'},
];

/** The sandbar glint sits on the bar's centre line ~40% of the way from Coral Cay (in sight of the summit over its north shoulder). */
const BAR_GLINT=SANDBAR_PATH.reduce((b,p)=>Math.abs(p.s-SANDBAR_LENGTH*.4)<Math.abs(b.s-SANDBAR_LENGTH*.4)?p:b,SANDBAR_PATH[0]);
/** A glint: where it sparkles (`x/y/z`), where you walk to collect it (`at`, within COLLECT_RADIUS), and the clue. */
export type TelescopeGlint=ScopePoint&{id:string;name:string;at:{x:number;z:number};clue:string};
export const TELESCOPE_GLINTS:readonly TelescopeGlint[]=[
 {id:'kit-shop',name:'KIT SHOP sign',x:KIT_SHOP.x+3,y:KIT_SHOP.h+1.6,z:KIT_SHOP_FRONT+.2,at:{x:SHOP_DOOR.x,z:SHOP_DOOR.front+2.2},clue:'Something sparkles on the KIT SHOP rooftop sign. Walk to the KIT SHOP door to collect it.'},
 {id:'east-jetty',name:'East Jetty',x:EAST_PIER.cx,y:1.2,z:EAST_PIER.cz,at:{x:EAST_PIER.cx,z:EAST_PIER.cz},clue:'A glint at the very end of the East Jetty. Walk the spiral to its round plaza.'},
 {id:'museum',name:'History Museum steps',x:MUSEUM_DOOR.x,y:1.4,z:MUSEUM_DOOR.front+1.6,at:{x:MUSEUM_DOOR.x,z:MUSEUM_DOOR.front+2.4},clue:'Something shiny on the History Museum’s front steps.'},
 {id:'beach-court',name:'Sharks Beach Court',x:BEACH_COURT.x,y:1,z:BEACH_COURT.z,at:{x:BEACH_COURT.x,z:BEACH_COURT.z},clue:'A sparkle on the centre spot of Coral Cay’s beach court.'},
 {id:'sandbar',name:SANDBAR_NAME,x:BAR_GLINT.x,y:1.2,z:BAR_GLINT.z,at:{x:BAR_GLINT.x,z:BAR_GLINT.z},clue:`Down below: a glint on the ${SANDBAR_NAME}, nearer Coral Cay.`},
];
export const GLINT_COUNT=TELESCOPE_GLINTS.length;
/** Walk within this many metres of a spotted glint's `at` to collect it. */
export const COLLECT_RADIUS=3.5;

/** Eyepiece: two zoom levels (vertical FOV, degrees), the pan limits, how long a glint must stay centred to be spotted. */
export const SCOPE={fov:[20,9] as readonly number[],normalFov:40,far:1600,eye:1.45,pitchMin:-28,pitchMax:12,spotSeconds:1.1,
 /** A landmark/glint is "centred" within this fraction of the vertical FOV (plus a floor in degrees). */
 centre:.12,centreMin:1.1,
 /** Drag pan: degrees per CSS pixel at the wide zoom (scaled with the FOV); stick/keys: degrees per second at full tilt. */
 dragDegPerPx:.09,stickDegPerSec:28} as const;

/** The stand's spot: next to the summit lookout, on level walkable ground outside the pitch's fence (searched at call time). */
export function telescopeSpot(ok:(x:number,z:number)=>boolean=(a,b)=>onSummitIsle(a,b)){
 const L=SUMMIT_LANDMARKS.lookout,P=SUMMIT_PITCH,F=SUMMIT_FENCE,base=summitGround(L.x,L.z);
 // Prefer the side facing away from the pitch (out over the sea), ~2.4 m from the cairn.
 const out=Math.atan2(L.z-P.z,L.x-P.x);
 const good=(x:number,z:number)=>ok(x,z)&&Math.abs(summitGround(x,z)-base)<.6&&!(Math.abs(x-P.x)<F.halfX+.6&&Math.abs(z-P.z)<F.halfZ+.6)
  &&!SUMMIT_OBSTACLES.some(o=>Math.abs(x-o.x)<o.w/2+.6&&Math.abs(z-o.z)<o.d/2+.6);
 let best:{x:number;z:number}|null=null,bestScore=-Infinity;
 for(const r of [2.4,3.2,1.8,4.2])for(let k=0;k<24;k++){const a=k/24*Math.PI*2,x=L.x+Math.cos(a)*r,z=L.z+Math.sin(a)*r;if(!good(x,z))continue;
  const score=Math.cos(a-out+.7)-Math.abs(r-2.4)*.4;if(score>bestScore){bestScore=score;best={x,z};}}
 const p=best??{x:L.x+1.6,z:L.z+1.6},ground=summitGround(p.x,p.z);
 return {x:p.x,z:p.z,ground,eye:{x:p.x,y:ground+SCOPE.eye,z:p.z},
  /** Facing (yaw, atan2(dx, dz) like the player) toward the main island, where the eyepiece starts. */
  yaw:Math.atan2(ISLAND_SQUARE.x-p.x,ISLAND_SQUARE.z-p.z)};
}

const D=Math.PI/180;
/** Yaw (atan2(dx, dz)) and pitch (radians, up +) from the eye to a point. */
export function aimAt(eye:ScopePoint,p:ScopePoint){const dx=p.x-eye.x,dz=p.z-eye.z,dy=p.y-eye.y;return {yaw:Math.atan2(dx,dz),pitch:Math.atan2(dy,Math.hypot(dx,dz))};}
/** The view direction (unit) for a yaw and pitch. */
export const viewDir=(yaw:number,pitch:number)=>({x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:Math.cos(yaw)*Math.cos(pitch)});
/** Angle (degrees) between the view and the direction to `p`. */
export function offAxis(eye:ScopePoint,yaw:number,pitch:number,p:ScopePoint){
 const v=viewDir(yaw,pitch),dx=p.x-eye.x,dy=p.y-eye.y,dz=p.z-eye.z,l=Math.hypot(dx,dy,dz)||1;
 return Math.acos(Math.max(-1,Math.min(1,(v.x*dx+v.y*dy+v.z*dz)/l)))/D;
}
export const centreLimit=(fov:number)=>Math.max(SCOPE.centreMin,fov*SCOPE.centre);
/** The landmark nearest the centre of the eyepiece, if it is centred. */
export function centredLandmark(eye:ScopePoint,yaw:number,pitch:number,fov:number,list:readonly TelescopeLandmark[]=TELESCOPE_LANDMARKS){
 let best:TelescopeLandmark|null=null,bestA=centreLimit(fov)*1.6;// landmarks are big: a wider window than the glints
 for(const l of list){const a=offAxis(eye,yaw,pitch,l);if(a<bestA){bestA=a;best=l;}}
 return best;
}
/** The unspotted glint in the centre of the eyepiece, if any. */
export function centredGlint(eye:ScopePoint,yaw:number,pitch:number,fov:number,spotted:ReadonlySet<string>){
 let best:TelescopeGlint|null=null,bestA=centreLimit(fov);
 for(const g of TELESCOPE_GLINTS){if(spotted.has(g.id))continue;const a=offAxis(eye,yaw,pitch,g);if(a<bestA){bestA=a;best=g;}}
 return best;
}
/** Pan by a drag (CSS pixels) at `fov`: the scene follows the finger (drag right → look left). */
export function panByDrag(view:{yaw:number;pitch:number},dxPx:number,dyPx:number,fov:number){
 const k=SCOPE.dragDegPerPx*fov/SCOPE.fov[0]*D;
 return clampView({yaw:view.yaw+dxPx*k,pitch:view.pitch+dyPx*k});
}
/** Pan with a stick or keys (x right, y down, each −1…1) over `dt` seconds. */
export function panByStick(view:{yaw:number;pitch:number},x:number,y:number,dt:number,fov:number){
 const k=SCOPE.stickDegPerSec*fov/SCOPE.fov[0]*D*dt;
 return clampView({yaw:view.yaw-x*k,pitch:view.pitch-y*k});
}
export function clampView(v:{yaw:number;pitch:number}){
 let yaw=v.yaw%(Math.PI*2);if(yaw>Math.PI)yaw-=Math.PI*2;if(yaw<-Math.PI)yaw+=Math.PI*2;
 return {yaw,pitch:Math.max(SCOPE.pitchMin*D,Math.min(SCOPE.pitchMax*D,v.pitch))};
}

/** Saved hunt (synced with the save code: SYNC_KEYS): glints spotted through the eyepiece and glints collected on foot. */
export const TELESCOPE_SAVE_KEY='fi2-telescope-v1';
export type TelescopeSave={version:1;spotted:string[];collected:string[];seen:string[]};
export const emptyTelescopeSave=():TelescopeSave=>({version:1,spotted:[],collected:[],seen:[]});
const GLINT_IDS=new Set(TELESCOPE_GLINTS.map(g=>g.id)),LANDMARK_IDS=new Set(TELESCOPE_LANDMARKS.map(l=>l.id));
const ids=(v:unknown,known:Set<string>)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'&&known.has(x)))]:[];
export function sanitizeTelescope(v:unknown):TelescopeSave{
 if(!v||typeof v!=='object')return emptyTelescopeSave();const o=v as Partial<TelescopeSave>;
 const collected=ids(o.collected,GLINT_IDS),spotted=[...new Set([...ids(o.spotted,GLINT_IDS),...collected])];
 return {version:1,spotted,collected,seen:ids(o.seen,LANDMARK_IDS)};
}
/** Marks a glint spotted (saved, shown on the map). Unchanged (same object) when it already was. */
export function spotGlint(s:TelescopeSave,id:string):TelescopeSave{return GLINT_IDS.has(id)&&!s.spotted.includes(id)?{...s,spotted:[...s.spotted,id]}:s;}
/** Collects a spotted glint. Unchanged when it is unknown, not spotted yet, or already collected. */
export function collectGlint(s:TelescopeSave,id:string):TelescopeSave{return s.spotted.includes(id)&&!s.collected.includes(id)?{...s,collected:[...s.collected,id]}:s;}
export function seeLandmark(s:TelescopeSave,id:string):TelescopeSave{return LANDMARK_IDS.has(id)&&!s.seen.includes(id)?{...s,seen:[...s.seen,id]}:s;}
/** Spotted, not yet collected: the map's gold marks and the only glints the walking check looks at. */
export const pendingGlints=(s:TelescopeSave)=>TELESCOPE_GLINTS.filter(g=>s.spotted.includes(g.id)&&!s.collected.includes(g.id));
/** The pending glint the player is standing at (on foot, within COLLECT_RADIUS), if any. A handful of comparisons. */
export function glintAt(s:TelescopeSave,x:number,z:number){for(const g of pendingGlints(s))if(Math.hypot(x-g.at.x,z-g.at.z)<=COLLECT_RADIUS)return g;return null;}
export const glintRewardId=(id:string)=>'telescope-'+id;
