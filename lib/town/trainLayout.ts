/**
 * The Island Line's layout on the real island (train Phase 1, Nov 23 2026): trainTrack.ts's pure line plus the land test, worked
 * out once on first use and shared by the 3D build (trainWorld.ts) and the swim rule (Town.tsx: swimmers can't pass through the
 * trestle's piers or the south sea wall). No three.js, no DOM, nothing per frame.
 */
import {onLand} from './landmass';
import {TRACK,TRACK_DS,TrackKind,TRAIN_STATIONS,TRAIN_CROSSINGS,STATION_HALF,trackProfile,trackNearest,trackAt,inTunnelS,onSummitTrackS,wrapS,type TrackProfile} from './trainTrack';

/** Trestle piers: one every PIER_STEP m of sea; each stands on two columns PIER_COLUMN_OFFSET m either side of the centre line. */
export const PIER_STEP=8,PIER_COLUMN_OFFSET=1.1,PIER_COLUMN_HALF=.24;
/** The first pier of each trestle stands FIRST_PIER m past the first sea row, just beyond the bridge head (Nov 23 2026: was 4 m). */
export const FIRST_PIER=2;
/** A swimmer's reach round a column (its half width plus the body), and the sea wall's half width. */
export const SWIM_PIER_REACH=.75,SEA_WALL_HALF=2.3;
export type TrainPier={s:number;x:number;z:number;tx:number;tz:number;bed:number};
export type TrainLayout={profile:TrackProfile;piers:TrainPier[];columns:Float64Array};
let layout:TrainLayout|null=null;
export function trainLayout():TrainLayout{
 if(layout)return layout;
 const profile=trackProfile(onLand),piers:TrainPier[]=[];
 let next=-1;
 for(let i=0;i<TRACK.n;i++){const s=i*TRACK_DS;if(profile.kind[i]!==TrackKind.Sea){next=-1;continue;}
  if(next<0)next=s+FIRST_PIER;if(s<next)continue;next=s+PIER_STEP;piers.push({s,x:TRACK.x[i],z:TRACK.z[i],tx:TRACK.tx[i],tz:TRACK.tz[i],bed:profile.bed[i]});}
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
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=colGrid.get(ck(a+i,b+j));if(!l)continue;for(const k of l)if(Math.abs(L.columns[k*2]-x)<SWIM_PIER_REACH&&Math.abs(L.columns[k*2+1]-z)<SWIM_PIER_REACH)return true;}
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
 *  decks are at deck height across the rails, sloping to the ground 2.6 m out (trainWorld.ts builds the same shapes: BALLAST
 *  half-width 1.45, foot 1.9 m + 1.4 per metre of embankment, deck top RAIL_TOP - .03). Land rows only (the trestle is not a walk).
 *  One hash lookup (trackNearest within 3.6 m): rooftopTravel's surface() takes the max with the ground, so 0 means "no line here". */
export const TRAIN_WALK_TOP=.22;
const XING_TOP=.31;
export function trainWalkHeight(x:number,z:number):number{
 const hit=trackNearest(x,z,3.6);if(!hit)return 0;
 const P=trainLayout().profile,i=Math.floor(hit.s/TRACK_DS)%TRACK.n,k=(i+1)%TRACK.n;
 const t=hit.s/TRACK_DS-Math.floor(hit.s/TRACK_DS),bed=P.bed[i]+(P.bed[k]-P.bed[i])*t,ground=onSummitTrackS(hit.s)?bed:0,d=hit.d;
 const xing=TRAIN_CROSSINGS.some(c=>Math.abs(wrapS(hit.s-c.s+TRACK.length/2)-TRACK.length/2)<c.width/2+.6);
 if(!xing&&(P.kind[i]!==TrackKind.Land||P.kind[k]!==TrackKind.Land))return 0;
 if(xing){const top=bed+XING_TOP;return d<=1?top:d>=2.6?0:top+(ground+.01-top)*(d-1)/1.6;}
 const top=bed+TRAIN_WALK_TOP,foot=1.9+(bed-ground)*1.4;
 return d<=1.45?top:d>=foot?0:top+(ground-top)*(d-1.45)/(foot-1.45);
}
