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
 *  the pond walk, and west of the pond by the south-west trail. */
export const ORCHARD_CENTRES:readonly {x:number;z:number;forms:readonly OrchardForm[];fruit:readonly FruitKind[]}[]=[
 {x:-122,z:-71,forms:['round','lobed'],fruit:['mango','orange']},
 {x:-124,z:13,forms:['round','oval'],fruit:['orange','avocado']},
 {x:-112,z:99,forms:['lobed','round'],fruit:['guava','lime']},
 {x:-187,z:82,forms:['round','lobed'],fruit:['mango','guava']},
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
/** The orchard trees: up to perCluster per cluster on a staggered grid round its centre, nearest first, every spot clear. */
export function stadiumOrchardTrees():StadiumOrchardTree[]{
 const out:StadiumOrchardTree[]=[],R=ORCHARD_RULES;
 ORCHARD_CENTRES.forEach((c,ci)=>{const cand:{x:number;z:number;d:number}[]=[];
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){const x=c.x+(i+(j%2?.5:0))*R.spacing,z=c.z+j*R.spacing*.87,d=Math.hypot(x-c.x,z-c.z);if(d<=R.radius)cand.push({x,z,d});}
  cand.sort((a,b)=>a.d-b.d||a.x-b.x||a.z-b.z);let n=0;
  for(const p of cand){if(n>=R.perCluster)break;if(!orchardSpotClear(p.x,p.z))continue;if(out.some(o=>Math.hypot(o.x-p.x,o.z-p.z)<R.spacing*.95))continue;
   const k=out.length,seed=ci*7+n;out.push({id:`tree-${Math.round(p.x)}-${Math.round(p.z)}`,x:+p.x.toFixed(2),z:+p.z.toFixed(2),form:c.forms[n%c.forms.length],fruit:c.fruit[n%c.fruit.length],
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
