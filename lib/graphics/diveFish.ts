import * as T from 'three';
import {DIVE_SCHOOL_FISH_TRIS} from '../town/water/diveCurrent';

/**
 * Explore life (Oct 22 2026): the reef room's own low-poly school fish (heat: the fishing catalogue's close-up models are 380-430
 * triangles each; a 0.3 m school fish needs far fewer). One lofted body (7 rings x 6 sides), a forked or lyre tail, a dorsal fin; vertex
 * colours with countershading (darker back, pale belly), a lateral stripe or a contrasting tail, an eye dot. ~1 unit long, facing -x
 * (head at -0.5) like the catalogue models, so the room's fish shader (paths, wag, parting) is unchanged. At most DIVE_SCHOOL_FISH_TRIS.
 */
export type ReefFishLook={shape:'slender'|'disc'|'oval';top:string;side:string;belly:string;fin:string;tail?:string;stripe?:string;lyre?:boolean};
export const REEF_FISH:Record<string,ReefFishLook>={
 anchovy:{shape:'slender',top:'#3d5868',side:'#b8c8cf',belly:'#e8eef0',fin:'#9fb0b8',stripe:'#d8e4e8'},
 'blue-tang':{shape:'disc',top:'#24459a',side:'#3563c4',belly:'#5d86d6',fin:'#1d2c66',tail:'#e8c22a'},
 'yellow-tang':{shape:'disc',top:'#e2b51c',side:'#f0c83a',belly:'#f6dc76',fin:'#d9a812'},
 anthias:{shape:'oval',top:'#e0623a',side:'#f08250',belly:'#f6b48c',fin:'#e86a7a',lyre:true},
 bigeye:{shape:'oval',top:'#b8392c',side:'#d0503c',belly:'#e8a08a',fin:'#a8302a'},
 snapper:{shape:'oval',top:'#b84a40',side:'#d06a5a',belly:'#f0c4b4',fin:'#c85a4a'},
 trevally:{shape:'oval',top:'#7c7c5c',side:'#c8b878',belly:'#ece4c4',fin:'#d8b048'},
};
const SHAPE={slender:{H:.09,W:.07},disc:{H:.25,W:.06},oval:{H:.15,W:.075}} as const;
const c3=(h:string)=>{const c=new T.Color(h);return [c.r,c.g,c.b] as [number,number,number];};
export function reefFishModel(id:string){
 const L=REEF_FISH[id]??REEF_FISH.anthias,{H,W}=SHAPE[L.shape],top=c3(L.top),side=c3(L.side),belly=c3(L.belly),fin=c3(L.fin),tail=c3(L.tail??L.fin),stripe=L.stripe?c3(L.stripe):null;
 const RINGS=7,SIDES=6,x0=-.5,x1=.28,pos:number[]=[],col:number[]=[],idx:number[]=[];
 // Body rings (head at x0): an egg profile, fuller in front; the snout point first.
 pos.push(x0,0,0);col.push(...side);
 for(let i=1;i<=RINGS;i++){const t=i/RINGS,x=x0+(x1-x0)*t,f=Math.pow(Math.sin(Math.PI*Math.min(1,Math.pow(t,.62)*.96+.04)),.85),h=H*f*(L.shape==='slender'?1:.95)+.012,w=W*f+.008;
  for(let k=0;k<SIDES;k++){const a=k/SIDES*Math.PI*2+Math.PI/2,cy=Math.sin(a),cz=Math.cos(a);pos.push(x,cy*h,cz*w);
   const up=cy;let c=up>.5?top:up>-.3?side:belly;if(stripe&&Math.abs(up)<.2)c=stripe;if(i===2&&Math.abs(up-.45)<.2&&Math.abs(cz)>.5)c=[.08,.09,.1];col.push(...c);}}
 const ring=(i:number,k:number)=>1+(i-1)*SIDES+(k%SIDES);
 for(let k=0;k<SIDES;k++)idx.push(0,ring(1,k+1),ring(1,k));
 for(let i=1;i<RINGS;i++)for(let k=0;k<SIDES;k++){const a=ring(i,k),b=ring(i,k+1),c=ring(i+1,k),d=ring(i+1,k+1);idx.push(a,b,d,a,d,c);}
 const tip=pos.length/3;pos.push(x1+.02,0,0);col.push(...side);for(let k=0;k<SIDES;k++)idx.push(tip,ring(RINGS,k),ring(RINGS,k+1));
 // Fins (both faces, so FrontSide sees them from either side): the tail (forked, or a lyre's long points), the dorsal, a little anal fin.
 const fan=(pts:number[][],c:[number,number,number])=>{const b=pos.length/3;for(const p of pts){pos.push(p[0],p[1],p[2]);col.push(...c);}
  for(let k=1;k<pts.length-1;k++){idx.push(b,b+k,b+k+1,b,b+k+1,b+k);}};
 const tl=L.lyre?.2:.15,th=L.shape==='disc'?.16:L.shape==='slender'?.09:.12;
 fan([[x1,0,0],[x1+tl,th,0],[x1+tl*.62,0,0],[x1+tl,-th,0]],tail);
 fan([[x0+.3,H*.9,0],[x0+.42,H*.9+(L.shape==='disc'?.09:.06),0],[x0+.66,H*.55,0]],fin);
 fan([[x0+.5,-H*.75,0],[x0+.56,-H*.75-.05,0],[x0+.68,-H*.4,0]],fin);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const flat=g.toNonIndexed();g.dispose();
 if(flat.getAttribute('position').count/3>DIVE_SCHOOL_FISH_TRIS)throw new Error('reef fish over budget');
 return {geometry:flat,anim:{axis:[1,0,0] as [number,number,number],start:-.05,span:.45,dir:[0,.3,1] as [number,number,number],k:[5,0,0] as [number,number,number],amp:.07}};
}
