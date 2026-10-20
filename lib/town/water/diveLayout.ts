/**
 * ONE shared layout per dive zone (Oct 20 2026; user: "the dive spots don't look like the area from above"). The reef you explore
 * underwater (lib/graphics/diveRoom.ts), the see-through shoal preview seen from the island (lib/graphics/divePreview.ts), the shoal
 * decal of the farther zones and the pieces that stand out of the water (lib/graphics/diveWreckTop.ts) all read THIS layout, so the
 * coral heads, the sand lanes, the wreck and the zone's landmarks seen from the jetpack are exactly where you swim past them.
 *
 * Pure data, deterministic from the zone (its blob seed): no three.js, no DOM, no unseeded random (tests/dive-layout.cjs). Room-local
 * metres (x right, z toward the start camera, the surface at DIVE_SURFACE_Y). Room -> island: island = zone centre + room × `scale`
 * (diveWreckIslandScale: the room's 24 m radius onto the zone's base radius, the stranded wreck's convention), same axes.
 *
 * What it holds: the footprint (the blob outline in room metres; every feature stays inside it), the crest and slope contours, coral
 * clusters (position, radius, the tallest coral's height over the sand, the theme hue), boulders, sea-grass patches, sand lanes
 * (polylines with widths: the winding channel diveDepthAt carves over the crest, and the lane from the start to the crest), kelp
 * stands, arches, the stranded wreck's pose, the finds, and each theme's signature props and its "surface tell" (what a kid sees
 * from above: the galleon's mast, Paul's pitch lines, kelp tops, a gliding ray, the arch's crown, bobbing footballs, a turtle
 * breathing). Nothing is placed on the buoy column or the start / come-up point, and every coral top stays under the surface.
 */
import {DIVE_ROOM_R,DIVE_SURFACE_Y,diveBlobR,diveCrestMask,diveDepthAt,diveFloor,diveWreckIslandScale,diveWreckPose,type DiveSpot} from './diveSpots';

export type LP={x:number;z:number};
/** A coral head: its centre, its radius (m), the tallest coral's height over the sand there (m, always under the surface) and the
 *  index of its main colour in the theme's coral palette. */
export type DiveCluster={x:number;z:number;r:number;h:number;hue:number};
export type DiveRockSpot={x:number;z:number;s:number};
export type DivePatch={x:number;z:number;r:number};
export type DiveLane={pts:LP[];w:number};
/** A kelp stand: where, and how tall its strands grow (m over the sand; tall stands reach to just under the surface). */
export type DiveKelpStand={x:number;z:number;h:number};
/** A rock arch spanning along z at x: its centre, radius, the sand's y under it and its crown's top (room y; > the surface = out of the water). */
export type DiveArchSpot={x:number;z:number;R:number;base:number;crown:number};
/** Paul's old pitch on the sand: the halfway line at cz (x from cx-half to cx+half), the centre circle, the goal, the turf from the goal
 *  line z0 to z1, and every straight line (halfway, goal line, touchlines, the penalty box) as segments. */
export type DivePitchSpot={cx:number;cz:number;half:number;circle:number;z0:number;z1:number;lines:[LP,LP][];goal:{x:number;z:number;yaw:number;w:number;h:number}};
export type DiveTellKind='mast'|'pitch'|'kelp'|'ray'|'arch'|'balls'|'turtle';
/** What the zone shows from above (the audit's per-zone surface tell): its kind, the points it uses (room metres) and a size. */
export type DiveTell={kind:DiveTellKind;pts:LP[];r:number};
export type DiveLayout={
 id:string;seed:number;
 /** Room metres per island metre is 1 / scale: island = centre + room × scale. */
 scale:number;
 /** The zone's footprint: the blob outline in room metres (DIVE_LAYOUT.outlineN points). */
 outline:LP[];
 /** The reef crest's outline (crest mask .8) and the foot of the slope (.3), room metres, from the crest centre outward. */
 crest:LP[];slope:LP[];
 clusters:DiveCluster[];rocks:DiveRockSpot[];grass:DivePatch[];lanes:DiveLane[];kelp:DiveKelpStand[];arches:DiveArchSpot[];
 pitch:DivePitchSpot|null;crates:(LP&{yaw:number})[];balls:LP[];raySpots:DivePatch[];bowl:DivePatch|null;
 wreck:(ReturnType<typeof diveWreckPose>&{half:number;beam:number})|null;
 finds:(LP&{id:string})[];start:LP;buoy:LP;
 /** The signature prop set (unique per zone) and the surface tell. */
 props:string[];tell:DiveTell;
};

/** outlineN: the footprint's points; keepIn: features stay inside this fraction of the outline; buoyGap / startGap: nothing within this
 *  of the buoy column (room 0, 0) or the start / come-up point (m); coralTop: a coral's top stays this far under the surface (m). */
export const DIVE_LAYOUT={outlineN:48,keepIn:.9,buoyGap:3.4,startGap:3,coralTop:.9,maxCoralH:1.9} as const;
/** The start / come-up point (diveSession.ts DIVE_START, x and z; tests pin them equal). */
export const DIVE_LAYOUT_START:LP={x:0,z:13};

const sm=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/** Distance from (x, z) to a polyline. */
export function laneDist(l:LP[],x:number,z:number){let b=Infinity;
 for(let i=1;i<l.length;i++){const a=l[i-1],c=l[i],dx=c.x-a.x,dz=c.z-a.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L2));b=Math.min(b,Math.hypot(x-a.x-dx*t,z-a.z-dz*t));}
 return b;}
/** The wreck's size (m): length, beam, hull height (diveRoom.ts builds it at this size). */
export const diveWreckSize=(style:'galleon'|'trawler'|'cargo')=>style==='galleon'?{L:13,W:3.8,H:2.6}:style==='cargo'?{L:15,W:4.2,H:2.4}:{L:8.5,W:3,H:2};

const cache=new Map<string,DiveLayout>();
/** The zone's layout (built once per zone and kept: pure and deterministic). */
export function diveLayout(spot:DiveSpot):DiveLayout{
 const hit=cache.get(spot.id);if(hit)return hit;
 const L=buildLayout(spot);cache.set(spot.id,L);return L;
}

/** Is a room point free for a placed thing (`gap` m round it): inside the footprint, off the buoy, start, finds, wreck, lanes and the
 *  signature's own ground. */
export function diveLayoutFree(L:DiveLayout,spot:Pick<DiveSpot,'radius'|'blob'>,x:number,z:number,gap:number,o:{lanes?:boolean;finds?:boolean;keep?:number}={}){
 if(Math.hypot(x,z)*L.scale>diveBlobR(spot,Math.atan2(z,x))*(o.keep??DIVE_LAYOUT.keepIn))return false;
 if(Math.hypot(x-L.buoy.x,z-L.buoy.z)<DIVE_LAYOUT.buoyGap+gap||Math.hypot(x-L.start.x,z-L.start.z)<DIVE_LAYOUT.startGap+gap)return false;
 if(o.finds!==false&&L.finds.some(f=>Math.hypot(f.x-x,f.z-z)<gap+1))return false;
 if(L.wreck){const w=L.wreck,c=Math.cos(w.yaw),s=Math.sin(w.yaw),dx=x-w.x,dz=z-w.z,u=dx*s+dz*c,v=dx*c-dz*s;if(Math.abs(u)<w.half+gap*.5&&Math.abs(v)<w.beam+gap*.5)return false;}
 if(o.lanes!==false)for(const l of L.lanes)if(laneDist(l.pts,x,z)<l.w/2+gap*.6)return false;
 if(L.pitch&&Math.abs(x-L.pitch.cx)<L.pitch.half+1+gap*.5&&z>L.pitch.z0-1-gap*.5&&z<L.pitch.z1+1+gap*.5)return false;
 if(L.pitch&&Math.hypot(x-L.pitch.goal.x,z-L.pitch.goal.z)<L.pitch.goal.w/2+1+gap)return false;
 for(const a of L.arches)if(Math.abs(x-a.x)<1.6+gap*.5&&Math.abs(z-a.z)<a.R+1.4+gap*.5)return false;
 return true;
}

function contour(f:DiveSpot['floor'],level:number){
 const out:LP[]=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2,c=Math.cos(a),s=Math.sin(a);let best=-1;
  for(let r=0;r<=DIVE_ROOM_R+4;r+=.4)if(diveCrestMask(f.cx+c*r,f.cz+s*r,f)>=level)best=r;
  if(best>0)out.push({x:f.cx+c*best,z:f.cz+s*best});}
 return out;
}

/** Build a zone's layout afresh (no cache; diveLayout keeps one per zone). */
export function buildLayout(spot:DiveSpot):DiveLayout{
 const th=spot.theme,f=spot.floor,sig=th.signature,r=rng(spot.blob*7919+13),scale=diveWreckIslandScale(spot);
 const outline:LP[]=[];for(let i=0;i<DIVE_LAYOUT.outlineN;i++){const a=i/DIVE_LAYOUT.outlineN*Math.PI*2,R=diveBlobR(spot,a)/scale;outline.push({x:Math.cos(a)*R,z:Math.sin(a)*R});}
 const relic=spot.finds.find(q=>q.kind==='relic')??{x:0,z:-6};
 const L:DiveLayout={id:spot.id,seed:spot.blob,scale,outline,crest:contour(f,.8),slope:contour(f,.3),clusters:[],rocks:[],grass:[],lanes:[],kelp:[],arches:[],
  pitch:null,crates:[],balls:[],raySpots:[],bowl:null,wreck:null,finds:spot.finds.map(q=>({id:q.id,x:q.x,z:q.z})),start:{...DIVE_LAYOUT_START},buoy:{x:0,z:0},
  props:[],tell:{kind:'mast',pts:[],r:1}};
 const depth=(x:number,z:number)=>diveDepthAt(x,z,f),inside=(x:number,z:number,k:number=DIVE_LAYOUT.keepIn)=>Math.hypot(x,z)*scale<=diveBlobR(spot,Math.atan2(z,x))*k;
 const free=(x:number,z:number,gap:number,o?:{lanes?:boolean;finds?:boolean;keep?:number})=>diveLayoutFree(L,spot,x,z,gap,o);
 // 1. The wreck (its pose is diveSpots.ts diveWreckPose: the room, the preview and the island's top all use it).
 if(th.wreck){const p=diveWreckPose(th.wreck,f),sz=diveWreckSize(th.wreck.style);L.wreck={...p,half:sz.L/2+.6,beam:sz.W/2+.8};}
 // 2. The sand lanes: the winding channel diveDepthAt carves over the crest (its centre line, solved exactly: w = 0), and a lane
 //    from the start / come-up point to the crest, so the first swim is along open sand.
 {const s=f.seed,ca=Math.cos(s*1.7),sa=Math.sin(s*1.7),pts:LP[]=[];
  for(let v=-DIVE_ROOM_R;v<=DIVE_ROOM_R;v+=2){const u=-2.4*Math.sin(v*.17+s),x=u*ca-v*sa,z=u*sa+v*ca;if(inside(x,z,1.02))pts.push({x,z});}
  if(pts.length>1)L.lanes.push({pts,w:3});
  const a=L.start,b={x:f.cx,z:f.cz},lane:LP[]=[];for(let k=0;k<=6;k++){const t=k/6,x=a.x+(b.x-a.x)*t+Math.sin(t*Math.PI)*1.2,z=a.z+(b.z-a.z)*t;if(inside(x,z,1.02))lane.push({x,z});}
  if(lane.length>1)L.lanes.push({pts:lane,w:2.6});}
 // 3. The signature's own ground (placed before the coral, which keeps off it).
 if(sig==='goal'){const gz=relic.z-.6,z0=gz-.4,z1=12,h=9,b=4,bd=3;
  L.pitch={cx:0,cz:6,half:h,circle:4,z0,z1,goal:{x:relic.x,z:gz,yaw:.25,w:3.6,h:1.6},
   lines:[[{x:-h,z:6},{x:h,z:6}],[{x:-h,z:z0},{x:h,z:z0}],[{x:-h,z:z0},{x:-h,z:z1}],[{x:h,z:z0},{x:h,z:z1}],[{x:-b,z:z0},{x:-b,z:z0+bd}],[{x:b,z:z0},{x:b,z:z0+bd}],[{x:-b,z:z0+bd},{x:b,z:z0+bd}]]};}
 if(sig==='arch'){const ax=relic.x,az=relic.z-1.5,base=diveFloor(ax,az,f),R=Math.max(2,Math.min(3.6,(DIVE_SURFACE_Y-base-1.9)/1.15));
  L.arches.push({x:ax,z:az,R,base,crown:DIVE_SURFACE_Y+1.7});}
 if(sig==='turtles')L.bowl={x:f.cx,z:f.cz,r:Math.min(f.rx,f.rz)*.75};
 if(sig==='rays'){L.raySpots=[0,1,2].map(i=>({x:f.cx+(i-1)*1.5,z:f.cz-3+i,r:6+i*2.5}));}
 // 4. Coral clusters: seeded, mostly on the crest and up the slope, spaced, off every lane, the buoy and the start; each one's height
 //    is capped by the water over its sand, so no coral breaks the surface. The garden zone has more and bigger heads.
 const want=sig==='garden'?14:sig==='rays'?6:sig==='goal'?8:sig==='kelp'?8:sig==='turtles'?9:sig==='crates'?10:10;
 const rMin=sig==='garden'?2.3:1.8,rMax=sig==='garden'?3.6:3;
 for(let k=0;k<400&&L.clusters.length<want;k++){const a=r()*Math.PI*2,d=3+Math.sqrt(r())*(DIVE_ROOM_R-5),x=Math.cos(a)*d,z=Math.sin(a)*d,cr=rMin+r()*(rMax-rMin);
  const m=diveCrestMask(x,z,f);if(r()>.25+m||!free(x,z,cr*.7)||L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+cr+1.2))continue;
  const h=Math.min(DIVE_LAYOUT.maxCoralH,depth(x,z)-DIVE_LAYOUT.coralTop);if(h<.35)continue;
  L.clusters.push({x,z,r:cr,h,hue:Math.floor(r()*th.coral.length)});}
 // 5. Boulders on the reef slope and a few stones.
 for(let i=0;i<160&&L.rocks.length<12;i++){const x=(r()-.5)*2*(DIVE_ROOM_R-3),z=(r()-.5)*2*(DIVE_ROOM_R-3),m=diveCrestMask(x,z,f);
  if(m<.2||m>.8||!free(x,z,2.2)||L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+1.2))continue;
  L.rocks.push({x,z,s:Math.max(.4,Math.min(.7+r()*1.1,(depth(x,z)-1)/1.1))});}
 // 6. Sea-grass patches (a whole meadow at Ray Meadow, a ring round the Turtle Pool), off the coral and the lanes.
 const nGrass=sig==='rays'?11:sig==='turtles'?8:5,gMin=sig==='rays'?2.6:1.4,gMax=sig==='rays'?4.6:2.6;
 for(let i=0;i<300&&L.grass.length<nGrass;i++){let x:number,z:number;
  if(L.bowl&&r()<.8){const a=r()*Math.PI*2,d=L.bowl.r*(.9+r()*.5);x=L.bowl.x+Math.cos(a)*d;z=L.bowl.z+Math.sin(a)*d;}else{const a=r()*Math.PI*2,d=3+Math.sqrt(r())*(DIVE_ROOM_R-4);x=Math.cos(a)*d;z=Math.sin(a)*d;}
  const gr=gMin+r()*(gMax-gMin);if(!free(x,z,gr*.5,{finds:false})||L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+gr*.7)||L.grass.some(g=>Math.hypot(g.x-x,g.z-z)<g.r+gr*.8))continue;
  L.grass.push({x,z,r:gr});}
 // 7. Kelp stands: tall, reaching to just under the surface, on the Kelp Forest's slopes; a few short ones elsewhere.
 const nKelp=Math.round(8*Math.min(1,th.mix.kelp)),tall=sig==='kelp';
 for(let i=0;i<300&&L.kelp.length<nKelp;i++){const a=r()*Math.PI*2,d=6+r()*(DIVE_ROOM_R-7),x=Math.cos(a)*d,z=Math.sin(a)*d,m=diveCrestMask(x,z,f);
  if((tall&&(m<.15||m>.85))||!free(x,z,2.5,{finds:false})||L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+1.6)||L.kelp.some(k=>Math.hypot(k.x-x,k.z-z)<3.4))continue;
  const room=depth(x,z)-.6;L.kelp.push({x,z,h:tall?room:Math.min(room*.6,1.6+r()*1.4)});}
 // 8. Spilled ball crates and loose balls (Ball Crate Reef).
 if(sig==='crates'){for(let i=0;i<200&&L.crates.length<9;i++){const x=(r()-.5)*36,z=-20+r()*30;if(!free(x,z,1.4,{lanes:false})||L.clusters.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.6)||L.crates.some(c=>Math.hypot(c.x-x,c.z-z)<1.8))continue;L.crates.push({x,z,yaw:r()*6.28});}
  for(let i=0;i<200&&L.balls.length<10;i++){const a=r()*6.28,d=3+r()*16,x=Math.cos(a)*d,z=Math.sin(a)*d-4;if(!free(x,z,.4,{lanes:false}))continue;L.balls.push({x,z});}}
 // 9. The signature prop set and its surface tell.
 const P=L.props;if(L.wreck)P.push('wreck-'+th.wreck!.style);
 if(sig==='garden')P.push('coral-garden');if(L.pitch)P.push('pitch-lines','sunken-goal');if(sig==='kelp')P.push('kelp-forest');
 if(sig==='rays')P.push('seagrass-meadow','ray-spots');if(L.arches.length)P.push('rock-arch');if(L.crates.length)P.push('crate-stacks','footballs');if(L.bowl)P.push('turtle-bowl');
 const off=(x:number,z:number,minIsland:number)=>Math.hypot(x,z)*scale>=minIsland;
 if(sig==='goal')L.tell={kind:'pitch',pts:[{x:L.pitch!.cx,z:L.pitch!.cz},{x:L.pitch!.goal.x,z:L.pitch!.goal.z}],r:L.pitch!.circle};
 else if(sig==='kelp')L.tell={kind:'kelp',pts:L.kelp.map(k=>({x:k.x,z:k.z})),r:1.4};
 else if(sig==='rays'){const s=L.raySpots[1];L.tell={kind:'ray',pts:[{x:s.x,z:s.z}],r:s.r};}
 else if(sig==='arch'){const a=L.arches[0];L.tell={kind:'arch',pts:[{x:a.x,z:a.z}],r:a.R};}
 else if(sig==='crates'){const pts:LP[]=[];// 4 footballs afloat over the spill, clear of the buoy (≥ 6 m on the island) and the wreck
  for(let i=0;i<200&&pts.length<4;i++){const a=r()*6.28,d=8+r()*10,x=Math.cos(a)*d,z=Math.sin(a)*d-4;if(!off(x,z,6)||!inside(x,z,.8)||!free(x,z,.5,{lanes:false,finds:false})||pts.some(p=>Math.hypot(p.x-x,p.z-z)<2.2))continue;pts.push({x,z});}
  L.tell={kind:'balls',pts,r:.32};}
 else if(sig==='turtles'){const b=L.bowl!;let best={x:b.x,z:b.z-b.r*.7};for(let i=0;i<24;i++){const a=i/24*6.28,x=b.x+Math.cos(a)*b.r*.75,z=b.z+Math.sin(a)*b.r*.75;if(off(x,z,4.5)&&inside(x,z,.85)&&Math.hypot(x-L.start.x,z-L.start.z)>4){best={x,z};break;}}
  L.tell={kind:'turtle',pts:[best],r:1.5};}
 else if(L.wreck)L.tell={kind:'mast',pts:[{x:L.wreck.x,z:L.wreck.z}],r:L.wreck.half};
 return L;
}

/** Room -> island (x, z). */
export const diveLayoutToIsland=(spot:Pick<DiveSpot,'x'|'z'|'radius'>,x:number,z:number):LP=>{const s=diveWreckIslandScale(spot);return {x:spot.x+x*s,z:spot.z+z*s};};
/** How much of a room point is covered by the layout's coral (0..1, soft at each cluster's edge), grass, kelp and lanes: what the
 *  preview and the decal paint (darker patches, light lanes). */
export function diveLayoutCover(L:DiveLayout,x:number,z:number){
 let coral=0,hue=-1,grass=0,kelp=0,lane=0,turf=0;
 for(const c of L.clusters){const k=sm(c.r*1.15,c.r*.35,Math.hypot(c.x-x,c.z-z));if(k>coral){coral=k;hue=c.hue;}}
 for(const g of L.grass)grass=Math.max(grass,sm(g.r,g.r*.4,Math.hypot(g.x-x,g.z-z)));
 for(const k of L.kelp)kelp=Math.max(kelp,sm(2.2,.6,Math.hypot(k.x-x,k.z-z))*(k.h>3?1:.5));
 for(const l of L.lanes)lane=Math.max(lane,sm(l.w*.6,l.w*.25,laneDist(l.pts,x,z)));
 if(L.pitch){const p=L.pitch;turf=sm(.8,-.6,Math.max(Math.abs(x-p.cx)-p.half,p.z0-z,z-p.z1));}
 return {coral,hue,grass,kelp,lane,turf};
}
