/**
 * Stadium Park orchards (Nov 13 2026, owner N3: "fruit trees around the stadium and park that you can pick from"). Pure rules:
 * where the small orchards stand, what each tree bears, the regrow clock and the save. The trees are the Summit Isle orchard's own
 * plant forms (summitOrchard.ts orchardParts), baked by westPark.ts into the island's 50 m chunk batches (no draw of their own);
 * the fruit and the picking are lib/graphics/stadiumOrchardFruit.ts.
 *
 * Placement: a few clusters by the park trails and the plaza's edges, every tree on the lawn, off the paths and paving
 * (onParkPaving), clear of the plaza's beds and benches, the STADIUM PARK and LILY POND signs (and the camera's view of them), the
 * pond and its rim walk, the mown lawns and the bowl, and spaced like an orchard. Deterministic: same trees on every device.
 *
 * Economy and save: the Summit Isle forage rules (summitForage.ts). Fruit goes into the island market basket (the backpack's
 * pocket, sold at the farm stands), the day's cap is FORAGE.dailyCap shared with Summit Isle (the summit save is read, never
 * written), and the save has the forage save's shape and sanitising under its own key. Unlike Summit Isle (a fresh set each
 * day), a picked fruit regrows on its tree after ORCHARD_RULES.regrowMin minutes (and all of it at local midnight).
 */
import {STADIUM_PLAZA,PARK_SIGNS,PARK_LAWNS,BOWL_RING,inStadiumFootprint,inPond,onParkPaving,onGrass,grassEdgeDistance,POND_RIM} from './westParkLayout';
import {onIsland,distanceToShore} from './shoreline';
import {FORAGE,localForageDay,sanitizeForage,emptyForage,type ForageSave,type FruitKind} from './summitForage';
import type {OrchardForm,OrchardPlan} from './summitOrchard';

export const STADIUM_ORCHARD_KEY='fi2-stadium-orchard-v1';
export const ORCHARD_RULES={
 /** Fruit on a full tree, minutes for one picked fruit to grow back, the pick reach from the trunk (m) and the gap between picks (s). */
 perTree:3,regrowMin:20,reach:2.1,pickGap:.45,
 /** The clusters' spacing and radius (m), trees per cluster, the canopy's clear radius (m). */
 spacing:4.6,radius:7,perCluster:4,canopy:2,
} as const;
/** Orchard clusters: by the north-east trail and the plaza's north edge, by the plaza's south edge and the south-east trail, south of
 *  the pond walk, and west of the pond by the south-west trail (the first 4, Nov 13 2026). Nov 13 2026, later (owner: "more fruit
 *  trees around the stadium", roughly double): five more small orchards round the bowl and along the trails, north of the bowl by
 *  the north trail, west of it by the west trail, south-west by the south-west trail, out along the north-east trail, and south of
 *  the pond by the beach. `n`: trees in that cluster (the first four: ORCHARD_RULES.perCluster). */
export const ORCHARD_CENTRES:readonly {x:number;z:number;forms:readonly OrchardForm[];fruit:readonly FruitKind[];n?:number}[]=[
 {x:-122,z:-71,forms:['round','lobed'],fruit:['mango','orange']},
 {x:-124,z:13,forms:['round','oval'],fruit:['orange','avocado']},
 {x:-112,z:99,forms:['lobed','round'],fruit:['guava','lime']},
 {x:-187,z:82,forms:['round','lobed'],fruit:['mango','guava']},
 {x:-180,z:-140,forms:['oval','round'],fruit:['avocado','orange'],n:3},
 {x:-292,z:-40,forms:['round','lobed'],fruit:['lime','mango'],n:3},
 {x:-235,z:70,forms:['lobed','oval'],fruit:['guava','avocado'],n:4},
 {x:-95,z:-120,forms:['round','oval'],fruit:['orange','lime'],n:3},
 {x:-200,z:105,forms:['lobed','round'],fruit:['mango','guava'],n:3},
];
/** The first 14 trees exactly as they were planted (Nov 13 2026), so a save's picks (keyed by id) still find them: same ids, order,
 *  forms and fruit. Where the bigger pond (or anything since) now covers a tree's old spot, it is replanted at the nearest clear spot
 *  of its own orchard (stadiumOrchardTrees), keeping its id. `c`: its cluster in ORCHARD_CENTRES. */
export const ORCHARD_LEGACY:readonly (Omit<StadiumOrchardTree,'form'|'fruit'>&{form:OrchardForm;fruit:FruitKind;c:number})[]=[
 {id:'tree--122--71',x:-122,z:-71,form:'round',fruit:'mango',s:0.82,th:0.95,yaw:0,seed:0,c:0},
 {id:'tree--127--71',x:-126.6,z:-71,form:'lobed',fruit:'orange',s:0.96,th:1.025,yaw:2.399,seed:1,c:0},
 {id:'tree--117--71',x:-117.4,z:-71,form:'round',fruit:'mango',s:0.9,th:0.975,yaw:4.798,seed:2,c:0},
 {id:'tree--124--75',x:-124.3,z:-75,form:'lobed',fruit:'orange',s:0.84,th:1.05,yaw:0.9138,seed:3,c:0},
 {id:'tree--124-13',x:-124,z:13,form:'round',fruit:'orange',s:1,th:0.975,yaw:3.3128,seed:7,c:1},
 {id:'tree--129-13',x:-128.6,z:13,form:'oval',fruit:'avocado',s:0.94,th:1.05,yaw:5.7118,seed:8,c:1},
 {id:'tree--119-13',x:-119.4,z:13,form:'round',fruit:'orange',s:0.88,th:1,yaw:1.8276,seed:9,c:1},
 {id:'tree--126-9',x:-126.3,z:9,form:'oval',fruit:'avocado',s:0.82,th:0.95,yaw:4.2266,seed:10,c:1},
 {id:'tree--112-99',x:-112,z:99,form:'lobed',fruit:'guava',s:0.98,th:1,yaw:0.3424,seed:14,c:2},
 {id:'tree--117-99',x:-116.6,z:99,form:'round',fruit:'lime',s:0.92,th:0.95,yaw:2.7414,seed:15,c:2},
 {id:'tree--187-82',x:-187,z:82,form:'round',fruit:'mango',s:0.96,th:1.025,yaw:5.1404,seed:21,c:3},
 {id:'tree--192-82',x:-191.6,z:82,form:'lobed',fruit:'guava',s:0.9,th:0.975,yaw:1.2563,seed:22,c:3},
 {id:'tree--189-78',x:-189.3,z:78,form:'round',fruit:'mango',s:0.84,th:1.05,yaw:3.6553,seed:23,c:3},
 {id:'tree--189-86',x:-189.3,z:86,form:'lobed',fruit:'guava',s:0.98,th:1,yaw:6.0543,seed:24,c:3},
];
/** Can an orchard tree (canopy radius r) stand at (x, z)? */
export function orchardSpotClear(x:number,z:number,r:number=ORCHARD_RULES.canopy){
 if(!onIsland(x,z)||distanceToShore(x,z)<14||!onGrass(x,z)||grassEdgeDistance(x,z)<9)return false;
 if(onParkPaving(x,z,r+1.2)||inStadiumFootprint(x,z,BOWL_RING.width+6))return false;
 const P=STADIUM_PLAZA;if(x>P.minX-10&&x<P.maxX+10&&z>P.minZ-11&&z<P.maxZ+11)return false;// the beds, benches and planters round the plaza
 if(inPond(x,z,POND_RIM+4+r))return false;
 for(const [sx,sz] of PARK_SIGNS)if(Math.hypot(x-sx,z-sz)<6+r||(x>sx-4&&x<sx+14&&z>sz-3&&z<sz+18))return false;
 if(PARK_LAWNS.some(l=>Math.hypot((x-l.x)/(l.rx+2),(z-l.z)/(l.rz+2))<1))return false;
 return true;
}
export type StadiumOrchardTree={id:string;x:number;z:number;form:OrchardForm;fruit:FruitKind;s:number;th:number;yaw:number;seed:number};
/** The orchard trees: the first 14 (ORCHARD_LEGACY, each replanted nearby if its spot is no longer clear), then the newer
 *  clusters' trees appended (up to `n` per cluster on a staggered grid round its centre, nearest first, every spot clear). */
export function stadiumOrchardTrees():StadiumOrchardTree[]{
 const out:StadiumOrchardTree[]=[],R=ORCHARD_RULES,spaced=(x:number,z:number)=>!out.some(o=>Math.hypot(o.x-x,o.z-z)<R.spacing*.95);
 for(const t of ORCHARD_LEGACY){const c=ORCHARD_CENTRES[t.c];let x=t.x,z=t.z;
  if(!orchardSpotClear(x,z)||!spaced(x,z)){let best:{x:number;z:number;d:number}|null=null;
   for(let i=-16;i<=16;i++)for(let j=-16;j<=16;j++){const px=t.x+i*.5,pz=t.z+j*.5,d=Math.hypot(i*.5,j*.5);
    if(Math.hypot(px-c.x,pz-c.z)>9||(best&&d>=best.d)||!orchardSpotClear(px,pz)||!spaced(px,pz))continue;best={x:px,z:pz,d};}
   if(!best)continue;x=best.x;z=best.z;}
  out.push({id:t.id,x:+x.toFixed(2),z:+z.toFixed(2),form:t.form,fruit:t.fruit,s:t.s,th:t.th,yaw:t.yaw,seed:t.seed});}
 ORCHARD_CENTRES.forEach((c,ci)=>{if(ci<4)return;const cand:{x:number;z:number;d:number}[]=[];
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){const x=c.x+(i+(j%2?.5:0))*R.spacing,z=c.z+j*R.spacing*.87,d=Math.hypot(x-c.x,z-c.z);if(d<=R.radius)cand.push({x,z,d});}
  cand.sort((a,b)=>a.d-b.d||a.x-b.x||a.z-b.z);let n=0;
  for(const p of cand){if(n>=(c.n??R.perCluster))break;if(!orchardSpotClear(p.x,p.z)||!spaced(p.x,p.z))continue;
   const k=out.length,seed=ci*7+n;let id=`tree-${Math.round(p.x)}-${Math.round(p.z)}`;if(out.some(o=>o.id===id))id+='-b';
   out.push({id,x:+p.x.toFixed(2),z:+p.z.toFixed(2),form:c.forms[n%c.forms.length],fruit:c.fruit[n%c.fruit.length],
    s:.82+((seed*37)%10)/50,th:.95+((seed*13)%5)/40,yaw:(k*2.399)%(Math.PI*2),seed});n++;}});
 return out;
}

/** The Summit Isle orchard plan of a stadium orchard tree (orchardParts / orchardRig build from it). */
export const orchardPlanOf=(o:StadiumOrchardTree):OrchardPlan=>({x:o.x,z:o.z,y:0,form:o.form,fruit:o.fruit,s:o.s,th:o.th,lean:0,yaw:o.yaw,seed:o.seed,zone:'trail'});

// ---- Save (the forage save's shape and rules, its own key) and the regrow clock ------------------------------------------------
export const readOrchard=(now:number,read:()=>string|null=()=>localStorage.getItem(STADIUM_ORCHARD_KEY)):ForageSave=>{try{return sanitizeForage(JSON.parse(read()??'null'),now);}catch{return emptyForage(now);}};
export const writeOrchard=(save:ForageSave,write:(v:string)=>void=v=>localStorage.setItem(STADIUM_ORCHARD_KEY,v))=>{try{write(JSON.stringify(save));}catch{/* private mode: the fruit still goes in the basket */}};
const REGROW_MS=ORCHARD_RULES.regrowMin*60000;
/** Fruit still missing from a tree at `now` (picked, not yet grown back). */
export function missing(save:ForageSave,id:string,now:number){if(save.day!==localForageDay(now))return 0;const e=save.trees[id];if(!e)return 0;
 return Math.max(0,e.n-Math.floor(Math.max(0,now-e.t)/REGROW_MS));}
/** Fruit hanging on a tree now. */
export const hanging=(save:ForageSave,id:string,now:number)=>ORCHARD_RULES.perTree-missing(save,id,now);
/** Fruit still allowed today: the forage cap, less what was picked here and on Summit Isle today. */
export function orchardCapLeft(save:ForageSave,summit:ForageSave,now:number){const day=localForageDay(now);
 return Math.max(0,FORAGE.dailyCap-(save.day===day?save.today:0)-(summit.day===day?summit.today:0));}
/** One fruit picked from tree `id`: what has grown back is settled first, then one more is missing (its regrow clock restarts). */
export function recordOrchardPick(save:ForageSave,id:string,now:number):ForageSave{
 const day=localForageDay(now),same=save.day===day,m=same?missing(save,id,now):0,trees=same?save.trees:{};
 return {...save,day,today:(same?save.today:0)+1,trees:{...trees,[id]:{n:Math.min(ORCHARD_RULES.perTree,m+1),t:now}}};
}
