/**
 * Summit Isle orchard (Oct 14 2026, user: "Add more fruit trees throughout the mountain island" … "give a variety of shape along
 * the trail up the mountain and also at the top as well" … "add more variety besides mangoes"). Pure: WHERE the orchard's fruit
 * trees and plants stand (deterministic, the same on every device), WHAT each looks like (seven low-poly forms) and the few numbers
 * the foraging runtime needs from each (where hands grip the trunk, where the fruit hangs, how the plant sways).
 *
 *  - Forms: a round canopy, a tall oval (avocado), a wide umbrella (mango), a two/three-lobed crown (guava, orange), a slim column
 *    (lime), a banana plant (a green pseudostem under big paddle leaves, the bunch hanging below them) and a papaya (a tall thin
 *    trunk, a star of leaves, the fruit clustered under the crown). Trunk height, lean, yaw and canopy scale are seeded per tree.
 *  - Heat: the parts are baked by lib/town/summitIsleWorld.ts into the island's existing per-sector prop meshes (the same
 *    vertex-coloured material as its other trees): NO new draw call for any tree. ~60–145 triangles a plant (see orchardTriangles).
 *    The shake's sway is a vertex-shader rotation of just the shaken tree (summitIsleWorld.ts SUMMIT_TREE_SWAY): no shell mesh.
 *  - Placement: both sides of the trails at irregular spacing (the climb feels like an orchard walk), a ring round the summit
 *    plateau's edge, a few on the open slopes and on the beaches' grass edge. Never on a trail (a clear margin either side), on the
 *    pitch, its fence or the walkway, or within ORCHARD_CLEAR of the lookout flag and cairn, the zipline's tower (and the grass the
 *    old telescope kept clear),
 *    the Summit Kick post, the snack kiosk, the fishing spots, the hikers' posts or the sandbar landing; never on steep ground; and
 *    only where the follow camera sees the tree (not pulled in against the hillside).
 * Tests: tests/summit-forage.cjs.
 */
import * as T from 'three';
import {SUMMIT_PATHS,SUMMIT_LANDMARKS,SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_PEAK,TERRACE,SUMMIT_VISUAL_DROP,summitGround,summitSlope,onSummitIsle,terraceWeight,
 summitTrailDistance,summitEdgeRadius,heightPoint,beachPoint,summitCameraPull,isleJitter as jitter,type IslePoint} from './summitIsle';
import {kickLayout} from './summitKick';
import {ZIP_TOWER} from './zipline';
import {summitSnackSpot} from './vendingPlaces';
import {FISH_SPOTS} from './fishing/fishCatalog';
import {SUMMIT_ISLE_NPCS} from './summitIsleNpcs';
import {FOLLOW_CAMERA,MIN_VIEW,type FruitKind} from './summitForage';

/** ?orchard=0: the orchard is not planted (A/B heat runs, like ?forage=0 for the fruit runtime). */
export const ORCHARD_OFF=typeof location!=='undefined'&&typeof URLSearchParams!=='undefined'&&new URLSearchParams(location.search).get('orchard')==='0';
export type OrchardForm='round'|'oval'|'umbrella'|'lobed'|'columnar'|'banana'|'papaya';
export const ORCHARD_FORMS:readonly OrchardForm[]=['round','oval','umbrella','lobed','columnar','banana','papaya'];
/** Which fruit each form bears (round and lobed alternate by seed). */
export const FORM_FRUIT:Record<OrchardForm,readonly FruitKind[]>={round:['mango','orange'],oval:['avocado'],umbrella:['mango'],lobed:['guava','guava','orange'],
 columnar:['lime'],banana:['banana'],papaya:['papaya']};
/** A planted orchard tree: its base, its seeded shape and its fruit. */
export type OrchardPlan={x:number;z:number;y:number;form:OrchardForm;fruit:FruitKind;s:number;th:number;lean:number;yaw:number;seed:number;zone:'trail'|'top'|'slope'|'beach'};
/** One baked part: geometry in tree space (built on demand), its colour and the world matrix. */
export type OrchardPart={geo:()=>T.BufferGeometry;color:string;matrix:T.Matrix4};
/** What the foraging runtime needs from any shakeable tree (orchard forms, the island's round trees and its palms). */
export type TreeRig={
 /** The trunk's axis at grip height (chest height of the character) and the trunk's radius there. */
 grip:{x:number;y:number;z:number;r:number};
 /** The collider's trunk radius at the base (simulation trunkCollider). */
 baseR:number;
 /** Where the fruit hangs: round the canopy's surface (`canopy`, an ellipsoid rx × ry) or in a cluster under the crown (`under`). */
 crown:{x:number;y:number;z:number;rx:number;ry:number;hang:'canopy'|'under'};
 /** The sway: rotation about the trunk's base, weighted (height / sway.h)^bend (palms and papayas bend more at the top). */
 sway:{h:number;bend:number};
 /** Banana plants: the top of the baked bunch stalk (the crown is its foot above the purple bud); the hands hang along it. */
 stalk?:{x:number;y:number;z:number};
};

/** Clear zones: nothing planted within r metres of these (the lookout and the zipline tower get ≥ 4 m of open grass). */
export const ORCHARD_CLEAR=4;
export type ClearZone={x:number;z:number;r:number;what:string};
export function orchardClearZones():ClearZone[]{
 const L=SUMMIT_LANDMARKS.lookout,out:ClearZone[]=[];
 out.push({x:L.x,z:L.z,r:ORCHARD_CLEAR+1.5,what:'lookout flag'},{x:L.x+3.6,z:L.z,r:ORCHARD_CLEAR+.8,what:'lookout cairn'});
 // The zipline's tower (Oct 14 2026: it stands on the removed telescope's spot), the grass just seaward of it, and the walkway
 // spot by the flag where the telescope first stood. The same circles the telescope kept clear: the orchard (and the hidden balls
 // in its trees) is planned exactly as before.
 out.push({x:ZIP_TOWER.x,z:ZIP_TOWER.z,r:ORCHARD_CLEAR+1,what:'zipline tower'},{x:L.x-9.2,z:L.z-2,r:ORCHARD_CLEAR+1,what:'zipline tower seaward grass'},{x:L.x-2.4,z:L.z,r:ORCHARD_CLEAR,what:'lookout walkway'});
 {const dx=L.x-SUMMIT_PEAK.x,dz=L.z-SUMMIT_PEAK.z,l=Math.hypot(dx,dz)||1;for(const d of [6,8,10])out.push({x:L.x+dx/l*d,z:L.z+dz/l*d,r:ORCHARD_CLEAR,what:'lookout seaward grass'});
  // "Seaward/left" in the follow camera is west: cover the grass 6–10 m west of the flag too.
  for(const d of [6,8,10])out.push({x:L.x-d,z:L.z-d*.3,r:ORCHARD_CLEAR,what:'lookout west grass'});}
 try{const k=kickLayout();out.push({x:k.post.x,z:k.post.z,r:ORCHARD_CLEAR+1,what:'Summit Kick post'},{x:k.spot.x,z:k.spot.z,r:ORCHARD_CLEAR,what:'Summit Kick spot'});}catch{/* the pitch box covers it */}
 try{const s=summitSnackSpot();out.push({x:s.x,z:s.z,r:ORCHARD_CLEAR+2,what:'snack kiosk'});}catch{/* walkway is off limits anyway */}
 for(const f of FISH_SPOTS)if(f.area==='summit')out.push({x:f.x,z:f.z,r:7,what:'fishing spot '+f.id});
 for(const n of SUMMIT_ISLE_NPCS)out.push({x:n.x,z:n.z,r:ORCHARD_CLEAR,what:'hiker '+n.id});
 const S=SUMMIT_LANDMARKS.sandbarLanding;out.push({x:S.x,z:S.z,r:15,what:'sandbar landing'},{x:S.x+5,z:S.z+3,r:ORCHARD_CLEAR,what:'welcome board'});
 return out;
}
/** Off the pitch, its fence (+3 m: the ball-stop nets, the floodlights' bases) and the walkway round it. */
export const nearPitch=(x:number,z:number,r=3)=>Math.abs(x-SUMMIT_PITCH.x)<SUMMIT_FENCE.halfX+r&&Math.abs(z-SUMMIT_PITCH.z)<SUMMIT_FENCE.halfZ+r;
/** Trees keep this far from any trail's centre line (the trail is 2 m wide: a clear 3+ m verge either side for walkers, rides,
 *  slope hops and the camera). */
export const TRAIL_CLEAR=4.2;
/** Steepest ground an orchard tree is planted on (the walk limit is 0.62: a child can always walk up to it). */
export const ORCHARD_MAX_SLOPE=.5;
const ground=(x:number,z:number)=>summitGround(x,z)-SUMMIT_VISUAL_DROP;
/** The follow camera sees a tree planted here (its canopy and fruit are not hidden behind the hill). */
export const orchardView=(x:number,z:number)=>{const px=x+1.2,pz=z+1.2,py=ground(px,pz);return summitCameraPull(px,pz,py,px+FOLLOW_CAMERA.x,py+FOLLOW_CAMERA.y,pz+FOLLOW_CAMERA.z);};

/** Every rule a planting spot must pass (also re-checked by the tests), except spacing and colliders. */
export function orchardSpotOk(x:number,z:number,zones:readonly ClearZone[]){
 if(!onSummitIsle(x,z)||summitSlope(x,z)>ORCHARD_MAX_SLOPE||terraceWeight(x,z)>0||nearPitch(x,z))return false;
 if(summitTrailDistance(x,z)<TRAIL_CLEAR)return false;
 // Room to walk round it: walkable ground a step out on four sides.
 for(const [ax,az] of [[1.6,0],[-1.6,0],[0,1.6],[0,-1.6]])if(!onSummitIsle(x+ax,z+az))return false;
 for(const c of zones)if(Math.hypot(c.x-x,c.z-z)<c.r)return false;
 return orchardView(x,z)>=MIN_VIEW;
}

function pick<K>(list:readonly K[],r:number){return list[Math.min(list.length-1,Math.floor(r*list.length))];}
/** Forms by where they grow: banana and papaya low and warm by the beach and foothills, columns and ovals higher up. */
function formFor(zone:OrchardPlan['zone'],h:number,r:number):OrchardForm{
 if(zone==='beach')return pick(['banana','papaya','banana','round','papaya','umbrella'] as const,r);
 if(h<14)return pick(['banana','papaya','round','umbrella','lobed','oval','columnar'] as const,r);
 if(h<32)return pick(['round','lobed','oval','umbrella','columnar','papaya','banana'] as const,r);
 return pick(['columnar','oval','lobed','round','umbrella'] as const,r);
}
/**
 * The orchard's planting plan. `blocked(x, z, r)`: a collider already there within r (rocks, bushes, the island's own trees,
 * posts); `taken`: the island's existing trees and palms (kept ORCHARD_GAP clear). Deterministic.
 */
export const ORCHARD_GAP={tree:3.4,orchard:6.5} as const;
export function planOrchard(blocked:(x:number,z:number,r:number)=>boolean,taken:readonly IslePoint[],zones=orchardClearZones()):OrchardPlan[]{
 const out:OrchardPlan[]=[];let seed=0;
 const free=(x:number,z:number,gap:number)=>!taken.some(t=>Math.abs(t.x-x)<ORCHARD_GAP.tree&&Math.abs(t.z-z)<ORCHARD_GAP.tree&&Math.hypot(t.x-x,t.z-z)<ORCHARD_GAP.tree)
  &&!out.some(t=>Math.hypot(t.x-x,t.z-z)<gap)&&!blocked(x,z,1.6);
 const plant=(x:number,z:number,zone:OrchardPlan['zone'],gap:number=ORCHARD_GAP.orchard)=>{
  if(!orchardSpotOk(x,z,zones)||!free(x,z,gap))return false;const i=++seed,y=ground(x,z),h=summitGround(x,z);
  const form=formFor(zone,h,jitter(i*7+3,61)),fruit=pick(FORM_FRUIT[form],jitter(i,62));
  out.push({x,z,y,form,fruit,s:.82+jitter(i,63)*.36,th:.82+jitter(i,64)*.45,lean:(form==='papaya'||form==='banana'?.03:.02)+jitter(i,65)*.1,yaw:jitter(i,66)*Math.PI*2,seed:i,zone});return true;};
 // 1. The trails: both sides, every 7–12 m (irregular), 4.4–6.6 m out from the centre line; never on the summit walkway.
 SUMMIT_PATHS.forEach((path,pi)=>{let s=0,next=5+jitter(pi,71)*4,side=pi%2?1:-1,n=0;
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=Math.hypot(b.x-a.x,b.z-a.z);if(l<1e-6)continue;const tx=(b.x-a.x)/l,tz=(b.z-a.z)/l;
   // A spot that fails (the climb's cut banks are often too steep) is retried half a metre on; the gap to the next tree only
   // starts once one is planted, alternating sides (mostly), so both verges fill wherever the ground allows.
   for(let u=0;u<l;u+=.5){if(s+u<next)continue;const px=a.x+tx*u,pz=a.z+tz*u;if(terraceWeight(px,pz)>0)continue;const k=pi*500+n++;let done=false;
    for(const sd of [side,-side]){for(const off of [4.4+jitter(k,74)*2.2,5.6,7,8.4]){const x=px-tz*off*sd,z=pz+tx*off*sd;if(plant(x,z,'trail',6)){done=true;side=jitter(k,73)<.78?-sd:sd;break;}}if(done)break;}
    if(done)next=s+u+7+jitter(k,72)*5;}
   s+=l;}});
 // 2. The summit: a ring just off the plateau's edge (the shoulder's open grass), irregular.
 // The north half only: riders and walkers come over the south shoulder to the gate (summit-rides' climbs aim straight at it).
 for(let k=0;k<36;k++){const a=k/36*Math.PI*2+(jitter(k,81)-.5)*.15;if(Math.sin(a)>-.15)continue;const r=summitEdgeRadius(a)+2.5+jitter(k,82)*4;plant(TERRACE.x+Math.cos(a)*r,TERRACE.z+Math.sin(a)*r,'top',5.5);}
 // 3. Open slopes between the trails.
 for(let k=0;k<40;k++){const p=heightPoint(jitter(k,91)*Math.PI*2,8+jitter(k,92)*28);plant(p.x+(jitter(k,93)-.5)*4,p.z+(jitter(k,94)-.5)*4,'slope',9);}
 // 4. The beaches' grass edge, just above the sand.
 for(let k=0;k<44;k++){const p=beachPoint(k/44*Math.PI*2+(jitter(k,95)-.5)*.08,1.12+jitter(k,96)*.3);plant(p.x,p.z,'beach',13);}
 return out;
}

// ---- Shapes --------------------------------------------------------------------------------------------------------------------
const BARK='#8a6a48',BARK_DARK='#7a5c3e',STEM='#86a24f',PAPAYA_BARK='#a49b7e';
const LEAVES=['#5b895e','#4f7f55','#6f9a62','#62905a'],BRIGHT=['#6fae4f','#5c9a45','#7cb85a'];
const UP=new T.Vector3(0,1,0);
/** The tree's world matrix: base, lean (toward `yaw`) and a seeded spin. */
function worldOf(p:OrchardPlan){const m=new T.Matrix4(),q=new T.Quaternion(),lean=new T.Quaternion(),axis=new T.Vector3(Math.sin(p.yaw),0,-Math.cos(p.yaw));
 lean.setFromAxisAngle(axis,p.lean);q.setFromAxisAngle(UP,p.seed*1.7).premultiply(lean);return m.compose(new T.Vector3(p.x,p.y,p.z),q,new T.Vector3(1,1,1));}
const local=(x:number,y:number,z:number,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
/** Trunk height and radius (tree space) per form. */
function trunkOf(p:OrchardPlan){const s=p.s,th=p.th;switch(p.form){
 case 'round':return {h:2*s*th,r:.19*s,top:.15*s};case 'oval':return {h:1.7*s*th,r:.18*s,top:.14*s};case 'umbrella':return {h:2.3*s*th,r:.21*s,top:.17*s};
 case 'lobed':return {h:1.8*s*th,r:.18*s,top:.14*s};case 'columnar':return {h:1.3*s*th,r:.15*s,top:.12*s};
 case 'banana':return {h:2.1*s*th,r:.17,top:.13};case 'papaya':return {h:3.3*s*th,r:.14,top:.09};}}
/** The parts of one orchard plant (trunk first). */
export function orchardParts(p:OrchardPlan):OrchardPart[]{
 const W=worldOf(p),s=p.s,i=p.seed,t=trunkOf(p),h=t.h,parts:OrchardPart[]=[];
 const add=(geo:()=>T.BufferGeometry,color:string,m:T.Matrix4)=>parts.push({geo,color,matrix:new T.Matrix4().multiplyMatrices(W,m)});
 const trunkColor=p.form==='banana'?STEM:p.form==='papaya'?PAPAYA_BARK:i%2?BARK:BARK_DARK;
 add(()=>new T.CylinderGeometry(t.top,t.r,h,6),trunkColor,local(0,h/2,0));
 const leaf=(k:number)=>LEAVES[(i+k)%LEAVES.length],bright=(k:number)=>BRIGHT[(i+k)%BRIGHT.length];
 switch(p.form){
  case 'round':add(()=>new T.IcosahedronGeometry(1.55*s,0),leaf(0),local(0,h+.95*s,0,0,i,0));add(()=>new T.IcosahedronGeometry(1*s,0),leaf(1),local(.55*s,h+1.75*s,-.25*s,0,i*2,0));break;
  case 'oval':add(()=>new T.IcosahedronGeometry(1.15*s,0),leaf(0),local(0,h+1.55*s,0,0,i,0,1,1.65,1));break;
  case 'umbrella':add(()=>new T.IcosahedronGeometry(1.95*s,0),leaf(0),local(0,h+.5*s,0,0,i,0,1,.48,1));add(()=>new T.IcosahedronGeometry(1.2*s,0),leaf(2),local(.3*s,h+1*s,.2*s,0,i*2,0,1,.5,1));break;
  case 'lobed':{const n=2+(i%2);for(let k=0;k<n;k++){const a=k/n*Math.PI*2+i;add(()=>new T.IcosahedronGeometry((1-.12*k)*s,0),leaf(k),local(Math.cos(a)*.72*s,h+(.8+.25*(k%2))*s,Math.sin(a)*.72*s,0,i+k,0));}break;}
  case 'columnar':add(()=>new T.IcosahedronGeometry(.85*s,0),leaf(0),local(0,h+1.7*s,0,0,i,0,1,2.3,1));add(()=>new T.IcosahedronGeometry(.55*s,0),leaf(1),local(0,h+3.55*s,0,0,i*2,0,1,1.4,1));break;
  case 'banana':for(let k=0;k<7;k++){const a=k/7*Math.PI*2+i*.7,len=2.3*s,tilt=.42-.27*(k%3);
    // A paddle leaf from the stem's top: the young ones rise, the older ones arch out and droop.
    add(()=>new T.BoxGeometry(len,.05,.72*s),bright(k),local(Math.cos(a)*len*.45,h+.12+Math.sin(tilt)*len*.45,Math.sin(a)*len*.45,0,-a,tilt));}
   // The bunch's stalk and the purple bud below it.
   add(()=>new T.CylinderGeometry(.04,.04,.7,4),STEM,local(.32,h-.25,0,0,0,.5));add(()=>new T.IcosahedronGeometry(.16,0),'#7a3d5a',local(.52,h-.75,0,0,0,0,1,1.4,1));break;
  case 'papaya':for(let k=0;k<8;k++){const a=k/8*Math.PI*2+i*.9,len=1.7*s;
    {const tilt=.28+.12*(k%2);add(()=>new T.BoxGeometry(len,.04,.55*s),leaf(k),local(Math.cos(a)*len*.45,h+.05+Math.sin(tilt)*len*.45,Math.sin(a)*len*.45,0,-a,tilt));}}
   add(()=>new T.IcosahedronGeometry(.2,0),'#5f8a48',local(0,h+.1,0));break;
 }
 return parts;
}
/** Triangles of one plant (non-indexed count), for the heat budget. */
export function orchardTriangles(p:OrchardPlan){let n=0;for(const part of orchardParts(p)){const g=part.geo();n+=(g.index?g.index.count:g.getAttribute('position').count)/3;g.dispose();}return n;}
/** The foraging rig of an orchard plant (see TreeRig). Grip at 1.05 m: the character's chest. */
export const GRIP_HEIGHT=1.05;
export function orchardRig(p:OrchardPlan):TreeRig{
 const W=worldOf(p),t=trunkOf(p),s=p.s,v=new T.Vector3();
 const at=(x:number,y:number,z:number)=>v.set(x,y,z).applyMatrix4(W).clone();
 const g=at(0,GRIP_HEIGHT,0),rGrip=t.r+(t.top-t.r)*Math.min(1,GRIP_HEIGHT/t.h);
 let crown:TreeRig['crown'],h:number,bend=1,stalk:TreeRig['stalk'];
 switch(p.form){
  case 'round':{const c=at(0,t.h+.95*s,0);crown={x:c.x,y:c.y,z:c.z,rx:1.55*s,ry:1.55*s,hang:'canopy'};h=t.h+2.6*s;break;}
  case 'oval':{const c=at(0,t.h+1.55*s,0);crown={x:c.x,y:c.y,z:c.z,rx:1.15*s,ry:1.9*s,hang:'canopy'};h=t.h+3.4*s;break;}
  case 'umbrella':{const c=at(0,t.h+.5*s,0);crown={x:c.x,y:c.y,z:c.z,rx:1.95*s,ry:.94*s,hang:'canopy'};h=t.h+1.6*s;break;}
  case 'lobed':{const c=at(0,t.h+.9*s,0);crown={x:c.x,y:c.y,z:c.z,rx:1.6*s,ry:1.05*s,hang:'canopy'};h=t.h+1.9*s;break;}
  case 'columnar':{const c=at(0,t.h+1.7*s,0);crown={x:c.x,y:c.y,z:c.z,rx:.85*s,ry:1.95*s,hang:'canopy'};h=t.h+4*s;break;}
  case 'banana':{const c=at(.42,t.h-.55,0);crown={x:c.x,y:c.y,z:c.z,rx:.16,ry:.2,hang:'under'};stalk=at(.15,t.h+.06,0);h=t.h+.6;bend=1.3;break;}
  case 'papaya':{const c=at(0,t.h-.32,0);crown={x:c.x,y:c.y,z:c.z,rx:.2,ry:.12,hang:'under'};h=t.h+.5;bend=1.7;break;}
 }
 return {grip:{x:g.x,y:g.y,z:g.z,r:rGrip},baseR:t.r,crown:crown!,sway:{h:h!,bend},...stalk?{stalk}:{}};
}
/** Rig of the island's own round trees (summitIsleWorld.ts tree(): trunk r 0.2 s, canopy centre 2.9 s up, r 1.7 s). */
export function roundTreeRig(x:number,z:number,y:number,s:number):TreeRig{
 return {grip:{x,y:y+GRIP_HEIGHT,z,r:.2*s},baseR:.2*s,crown:{x,y:y+2.9*s,z,rx:1.7*s,ry:1.7*s,hang:'canopy'},sway:{h:5*s,bend:1}};}
/** Rig of a palm (summitIsleWorld.ts palm(): a leaning trunk 0.21 → 0.11 m from base to crown at `top`): the grip follows the lean. */
export function palmRig(x:number,z:number,y:number,top:{x:number;y:number;z:number}):TreeRig{
 const h=Math.max(1,top.y-y),f=GRIP_HEIGHT/h;
 return {grip:{x:x+(top.x-x)*f,y:y+GRIP_HEIGHT,z:z+(top.z-z)*f,r:.21+(.11-.21)*f},baseR:.21,crown:{x:top.x,y:top.y-.62,z:top.z,rx:.46,ry:.14,hang:'under'},sway:{h,bend:1.8}};}
