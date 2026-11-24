/**
 * The Island Line's layout on the real island (train Phase 1, Nov 23 2026): trainTrack.ts's pure line plus the land test, worked
 * out once on first use and shared by the 3D build (trainWorld.ts) and the swim rule (Town.tsx: swimmers can't pass through the
 * trestle's piers or the south sea wall). No three.js, no DOM, nothing per frame.
 */
import {onLand} from './landmass';
import {TRACK,TRACK_DS,TrackKind,TRAIN_STATIONS,TRAIN_CROSSINGS,STATION_HALF,STATION_PLATFORM_Y,SOUTH_BRIDGE,trackProfile,trackNearest,trackAt,leftNormal,inTunnelS,onSummitTrackS,wrapS,type TrackProfile,type TrainStation} from './trainTrack';

/** Trestle piers: one every PIER_STEP m of sea; each stands on two columns PIER_COLUMN_OFFSET m either side of the centre line. */
export const PIER_STEP=8,PIER_COLUMN_OFFSET=1.1,PIER_COLUMN_HALF=.24;
/** The first pier of each trestle stands FIRST_PIER m past the first sea row, just beyond the bridge head (Nov 23 2026: was 4 m). */
export const FIRST_PIER=2;
/** A swimmer's reach round a column (its half width plus the body), and the sea wall's half width. */
export const SWIM_PIER_REACH=.75,SEA_WALL_HALF=2.3;
/** South Bridge (Nov 24 2026): the main span's two piers have thicker columns (half MAIN_COLUMN_HALF, swim reach MAIN_PIER_REACH)
 *  and nothing stands between them: the boat channel. */
export const MAIN_COLUMN_HALF=.42,MAIN_PIER_REACH=.95;
export type TrainPier={s:number;x:number;z:number;tx:number;tz:number;bed:number;main?:boolean};
export type TrainLayout={profile:TrackProfile;piers:TrainPier[];columns:Float64Array};
let layout:TrainLayout|null=null;
export function trainLayout():TrainLayout{
 if(layout)return layout;
 const profile=trackProfile(onLand),piers:TrainPier[]=[];
 let next=-1;
 for(let i=0;i<TRACK.n;i++){const s=i*TRACK_DS;if(profile.kind[i]!==TrackKind.Sea){next=-1;continue;}
  // South Bridge: a pier exactly at each end of the main span, none over the channel between them; the 8 m rhythm restarts after it.
  const main=Math.abs(s-SOUTH_BRIDGE.spanA)<TRACK_DS/2||Math.abs(s-SOUTH_BRIDGE.spanB)<TRACK_DS/2;
  if(!main&&s>SOUTH_BRIDGE.spanA&&s<SOUTH_BRIDGE.spanB)continue;
  if(next<0)next=s+FIRST_PIER;if(!main&&(s<next||(s<SOUTH_BRIDGE.spanA&&SOUTH_BRIDGE.spanA-s<PIER_STEP*.6)))continue;next=s+PIER_STEP;
  piers.push({s,x:TRACK.x[i],z:TRACK.z[i],tx:TRACK.tx[i],tz:TRACK.tz[i],bed:profile.bed[i],...(main?{main:true}:{})});}
 const columns=new Float64Array(piers.length*4);
 piers.forEach((p,k)=>{for(const [j,side] of [[0,1],[1,-1]] as const){columns[k*4+j*2]=p.x+p.tz*PIER_COLUMN_OFFSET*side;columns[k*4+j*2+1]=p.z-p.tx*PIER_COLUMN_OFFSET*side;}});
 layout={profile,piers,columns};return layout;
}
// A 12 m hash of the columns for the swim test (built with the layout, on the first swim check).
let colGrid:Map<number,number[]>|null=null;const CG=12,ck=(a:number,b:number)=>a*100003+b;
/** Swim rule: true where a swimmer would be inside a trestle column or the south sea wall. Cheap: one hash lookup, then the
 *  track's own hash only within 3 m of the line. */
export function trainSwimBlocked(x:number,z:number){
 const L=trainLayout();
 if(!colGrid){colGrid=new Map();for(let k=0;k<L.columns.length/2;k++){const a=Math.floor(L.columns[k*2]/CG),b=Math.floor(L.columns[k*2+1]/CG),key=ck(a,b);const l=colGrid.get(key);if(l)l.push(k);else colGrid.set(key,[k]);}}
 const a=Math.floor(x/CG),b=Math.floor(z/CG);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=colGrid.get(ck(a+i,b+j));if(!l)continue;for(const k of l){const r=L.piers[k>>1].main?MAIN_PIER_REACH:SWIM_PIER_REACH;if(Math.abs(L.columns[k*2]-x)<r&&Math.abs(L.columns[k*2+1]-z)<r)return true;}}
 const hit=trackNearest(x,z,SEA_WALL_HALF+.6);if(!hit)return false;return L.profile.kind[hit.i]===TrackKind.Wall&&hit.d<SEA_WALL_HALF+.4;
}

/** Clearance from the centre line kept free of props (m), and on a station's house side the platform and house strip. */
export const TRACK_CLEAR=3.4;
/** How far to push a prop of radius `r` at (x, z) so it clears the line (and a station's platform and house): null when clear.
 *  Build-time only (world.ts moves the ~95 small beach props, lamps and their colliders with it). */
export function trackPushOut(x:number,z:number,r:number):{dx:number;dz:number}|null{
 const hit=trackNearest(x,z,14+r);if(!hit||inTunnelS(hit.s))return null;
 const st=TRAIN_STATIONS.find(t=>Math.abs(wrapS(hit.s-t.s+TRACK.length/2)-TRACK.length/2)<STATION_HALF+1.5);
 const clear=st&&hit.side===st.side?(st.id==='south'?8.2:11):TRACK_CLEAR;
 if(hit.d>=clear+r)return null;
 const p=trackAt(hit.s);let ux=x-p.x,uz=z-p.z,l=Math.hypot(ux,uz);if(l<1e-3){ux=p.tz*hit.side;uz=-p.tx*hit.side;l=1;}
 const k=(clear+r+.05-hit.d)/l;return {dx:ux*k,dz:uz*k};
}

/** Walk height on the line (Nov 23 2026, owner: "going through the tracks"; a player on the line stood in the ballast). Feet rest
 *  on the sleepers (bed + TRAIN_WALK_TOP) across the ballast top, the ballast's sides slope down to the ground, and the crossing
 *  decks are at deck height across the rails, sloping to the ground XING_FOOT m out (trainWorld.ts builds the same shapes: BALLAST
 *  half-width 1.45, foot 1.9 m + 1.4 per metre of embankment, deck top RAIL_TOP - .03). Land rows only (the trestle is not a walk).
 *  One hash lookup (trackNearest within 3.6 m): rooftopTravel's surface() takes the max with the ground, so 0 means "no line here". */
export const TRAIN_WALK_TOP=.22;
const XING_TOP=.31;
/** Where a crossing deck's side ramps meet the ground (m from the centre line). Nov 24 2026: 2.0, just past the ballast's foot (was
 *  2.6: the long dark ramps lying on the grass read as a skewed slab at West Beach, owner 13.png). */
export const XING_FOOT=2;
export function trainWalkHeight(x:number,z:number):number{
 const hit=trackNearest(x,z,3.6);if(!hit)return 0;
 const P=trainLayout().profile,i=Math.floor(hit.s/TRACK_DS)%TRACK.n,k=(i+1)%TRACK.n;
 const t=hit.s/TRACK_DS-Math.floor(hit.s/TRACK_DS),bed=P.bed[i]+(P.bed[k]-P.bed[i])*t,ground=onSummitTrackS(hit.s)?bed:0,d=hit.d;
 const xing=TRAIN_CROSSINGS.some(c=>Math.abs(wrapS(hit.s-c.s+TRACK.length/2)-TRACK.length/2)<c.width/2+.6);
 if(!xing&&(P.kind[i]!==TrackKind.Land||P.kind[k]!==TrackKind.Land))return 0;
 if(xing){const top=bed+XING_TOP;return d<=1?top:d>=XING_FOOT?0:top+(ground+.01-top)*(d-1)/(XING_FOOT-1);}
 const top=bed+TRAIN_WALK_TOP,foot=1.9+(bed-ground)*1.4;
 return d<=1.45?top:d>=foot?0:top+(ground-top)*(d-1.45)/(foot-1.45);
}

// ---- Station spots (train Phase 4, Nov 23 2026): the vending machines and the station NPCs stand in each station's own frame.
/** The station house's platform-side wall, as trainWorld.ts buildStation lays it out (v: metres out from the line's centre toward
 *  the house; the platform runs from STATION_PLATFORM_V0 to the house, the South one with its house on the platform). */
export const STATION_PLATFORM_V0=1.45;
export const stationHouseFront=(st:Pick<TrainStation,'id'>)=>st.id==='south'?8.1-3.8:5.45;
/** A spot in station st's frame (u along the line, v out toward its house) on the platform top, and the yaw that faces the line. */
export function stationSpot(st:TrainStation,u:number,v:number){
 const c=trackAt(st.s),n=leftNormal(c.tx,c.tz),bed=trainLayout().profile.bed[Math.round(wrapS(st.s)/TRACK_DS)%TRACK.n];
 return {x:c.x+c.tx*u+n.x*st.side*v,z:c.z+c.tz*u+n.z*st.side*v,y:bed+STATION_PLATFORM_Y,yaw:Math.atan2(-n.x*st.side,-n.z*st.side),
  /** the yaw along the line toward +u */along:Math.atan2(c.tx,c.tz)};
}
/** The station drink machine: against the house front in the bay between the doorway post (u 2.4) and the corner post (u 4), over
 *  that bay's small pane, its back 3 cm off the pane (cabinet half depth 0.559 + 0.06). Never near the platform edge or the track. */
export const STATION_VENDING_U=3.25,STATION_VENDING_BACK=.62;
/** The island's follow camera is fixed (it looks along −(16, 23, 33)), so a glass front must face toward (16, 33) to be seen (the
 *  vending rule, tests/vending-machines.cjs). North and West Beach face their line AWAY from the camera: there the machine stands
 *  against the house's back (town-side) wall instead, centred, on the ground the station's visitors walk up from. */
export const STATION_HOUSE_DEPTH=(st:Pick<TrainStation,'id'>)=>st.id==='south'?3.8:4.6;
export const readsFromCamera=(yaw:number)=>(Math.sin(yaw)*16+Math.cos(yaw)*33)/Math.hypot(16,33)>.3;
export function stationVendingSpot(id:TrainStation['id']){
 const st=TRAIN_STATIONS.find(s=>s.id===id)!,r=(v:number)=>Math.round(v*100)/100,front=stationSpot(st,STATION_VENDING_U,stationHouseFront(st)-STATION_VENDING_BACK);
 if(readsFromCamera(front.yaw))return {x:r(front.x),z:r(front.z),y:r(front.y),yaw:front.yaw,wall:'front' as const};
 const back=stationSpot(st,0,stationHouseFront(st)+STATION_HOUSE_DEPTH(st)+STATION_VENDING_BACK),bed=back.y-STATION_PLATFORM_Y;
 return {x:r(back.x),z:r(back.z),y:r(bed),yaw:back.yaw+Math.PI,wall:'back' as const};
}
