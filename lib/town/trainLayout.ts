/**
 * The Island Line's layout on the real island (train Phase 1, Nov 23 2026): trainTrack.ts's pure line plus the land test, worked
 * out once on first use and shared by the 3D build (trainWorld.ts) and the swim rule (Town.tsx: swimmers can't pass through the
 * trestle's piers or the south sea wall). No three.js, no DOM, nothing per frame.
 */
import {onLand} from './landmass';
import {TRACK,TRACK_DS,TrackKind,TRAIN_STATIONS,STATION_HALF,trackProfile,trackNearest,trackAt,inTunnelS,wrapS,type TrackProfile} from './trainTrack';

/** Trestle piers: one every PIER_STEP m of sea; each stands on two columns PIER_COLUMN_OFFSET m either side of the centre line. */
export const PIER_STEP=8,PIER_COLUMN_OFFSET=1.1,PIER_COLUMN_HALF=.24;
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
  if(next<0)next=s+PIER_STEP/2;if(s<next)continue;next=s+PIER_STEP;piers.push({s,x:TRACK.x[i],z:TRACK.z[i],tx:TRACK.tx[i],tz:TRACK.tz[i],bed:profile.bed[i]});}
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
