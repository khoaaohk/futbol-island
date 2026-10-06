import * as T from 'three';
import {onIsland} from './shoreline';
import type {Obstacle} from './simulation';
import {untaggedProp,type PropTagger} from '../graphics/propReactions';

type Footprint={x:number;z:number;w:number;d:number};
type MarketTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>T.Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>T.Mesh;
 path:(x:number,z:number,w:number,d:number)=>void;
 obstacles:Obstacle[];buildings:Footprint[];roads:Footprint[];
 prop?:PropTagger;
};

// Static stalls share the town's material palette and geometry batching.
export function buildFarmersMarket({box,cylinder,put,sign,path,obstacles,buildings,roads,prop=untaggedProp}:MarketTools){
 const overlap=(a:Footprint,b:Footprint,pad=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad;
 const labels=['GARDEN GREENS','CITRUS & FRUIT','FRESH BREAD','CUT FLOWERS','LOCAL HONEY','HERBS & SEEDS','ISLAND COFFEE','SEASONAL VEG','BERRY BASKETS','HANDMADE GOODS','FARM EGGS','SUNSET JUICE'];
 const colors=['#477c6a','#bd7657','#d6a15d','#739568'];
 // Promenade joins the garden entrance and the existing southern pier approach.
 path(221,100,5,190);path(217,4,13,4);path(219,196,12,4);
 prop('sign',()=>{sign('EAST COAST FARMERS MARKET',18,1.1,221,3.2,98,'#477c6a');
 for(const x of [212.5,229.5])cylinder(.09,3.2,'#9d805b',x,1.6,98);});
 for(const x of [212.5,229.5])obstacles.push({x,z:98,w:.2,d:.2});
 for(let i=0;i<labels.length;i++){
  const rosa=i===1;
  const x=230,z=21+i*14,footprint={x,z,w:rosa?7.5:7,d:rosa?9:6};
  if(![[-4,-4],[-4,4],[4,-4],[4,4]].every(([dx,dz])=>onIsland(x+dx,z+dz)))continue;
  if([...buildings,...roads,...obstacles].some(o=>overlap(footprint,o,1)))continue;
  path(226,z,6,4);
  const canopy=rosa?'#bf6658':colors[i%colors.length],roofY=rosa?3.55:2.75,depthScale=rosa?1.5:1; 
  for(const dx of [-3,3])for(const dz of [-2.4,2.4])cylinder(rosa?.095:.065,roofY-.05,'#9d805b',x+dx,(roofY-.05)/2,z+dz*depthScale);
  // Striped awning, a solid produce counter facing west toward the promenade.
  for(let stripe=0;stripe<8;stripe++)box(rosa?7.4:6.7,.16,.7*depthScale,stripe%2?'#eddfbb':canopy,x,roofY,z+(-2.45+stripe*.7)*depthScale);
  box(1.1,1,rosa?7.4:4.6,'#a67d55',x-2,.5,z);
  if(rosa){
   // Taller scalloped-looking striped fascia and warm trim distinguish the sell stand.
   box(.14,.35,8.4,canopy,x-3.7,roofY-.16,z);
   box(.18,.09,8.5,'#edcf94',x-3.74,roofY-.36,z);
   for(const dz of [-3.15,3.15]){
    box(.95,.48,.9,'#d2bc94',x-2,1.24,z+dz);
    for(const dx of [-.23,.23])put(new T.IcosahedronGeometry(.23,0),dz<0?'#d69b61':'#739568',x-2+dx,1.6,z+dz);
   }
  }
  for(let crate=0;crate<3;crate++){
   const cz=z-1.5+crate*1.5;
   box(.9,.22,1.15,'#d2bc94',x-2,1.1,cz);
   for(let n=0;n<4;n++){
    const px=x-2+(n%2-.5)*.36,pz=cz+(Math.floor(n/2)-.5)*.42;
    put(new T.IcosahedronGeometry(i%4===2?.22:.18,0),['#739568','#d69b61','#edcf94','#bd7657'][i%4],px,1.34,pz);
   }
  }
  sign(rosa?'ROSA’S MARKET':labels[i],rosa?7:4.8,rosa?.8:.52,x-(rosa?3.78:3.12),rosa?2.88:2.16,z,canopy,'#fff0cf',-Math.PI/2);
  // A seated vendor keeps each stall inhabited without adding animation loops.
  const vx=x+.25,vz=z;
  box(.55,.75,.38,canopy,vx,1.12,vz);
  put(new T.IcosahedronGeometry(.24,1),i%2?'#b88462':'#d6aa7c',vx,1.74,vz);
  cylinder(.31,.10,'#edcf94',vx,1.97,vz);
  for(const dz of [-.18,.18]){
   box(.19,.58,.19,'#365b56',vx,.47,vz+dz);
   box(.22,.14,.25,'#6e5540',vx-.08,.12,vz+dz);
   box(.65,.16,.16,i%2?'#b88462':'#d6aa7c',vx-.3,1.12,vz+dz*2);
  }
  obstacles.push(footprint);
 }
 return {name:'Farmers Market',x:221,z:20};
}
