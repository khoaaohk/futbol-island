/**
 * Community Garden picking (lib/town/world.ts builds the beds east of the Coaches Centre).
 * Ripe produce can be picked by walking up to it; picked spots regrow on a real-time timer. Unripe spots
 * just say "not ripe yet" — nothing is lost. Produce goes into the shared market basket (lib/town/market).
 */
export type GardenSpot={id:string;good:'orange'|'cherry'|'strawberry'|'tomato'|'carrot';x:number;y:number;z:number;reach:number;regrowMs:number;startsUnripe:boolean};
export const GARDEN_CENTRE={x:208,z:-12},GARDEN_RANGE=55;
export const GARDEN_STORAGE_KEY='fi2-garden-v1';
const BED_REGROW=3*60e3,TREE_REGROW=4*60e3;
const beds:GardenSpot[]=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const x=192+col*10,z=-28+row*11,crop=(row+col)%3,good=crop===0?'strawberry':crop===1?'tomato':'carrot';
 // Two corner plants per bed, reachable from the paths; the fruit sits on the outside of the plant.
 for(const [a,b] of [[0,0],[2,2]]){const px=x-1.8+a*1.8,pz=z-1.8+b*1.8,dx=a?1:-1,dz=b?1:-1;
  beds.push({id:`bed-${row}-${col}-${a}`,good,x:px+dx*.45,y:1.25,z:pz+dz*.45,reach:2.3,regrowMs:BED_REGROW,startsUnripe:false});}
}
const trees:GardenSpot[]=[];
for(const [tx,tz,good] of [[186,-34,'orange'],[230,-34,'cherry'],[230,4,'orange']] as const)for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.4;
 trees.push({id:`tree-${tx}-${tz}-${i}`,good,x:tx+Math.cos(a)*1.55,y:2.35+(i%2)*.35,z:tz+Math.sin(a)*1.55,reach:2.6,regrowMs:TREE_REGROW,startsUnripe:false});}
export const GARDEN_SPOTS:GardenSpot[]=[...beds,...trees].map((s,i)=>({...s,startsUnripe:i%3===2}));
export type GardenState={version:1;firstSeen:number;picked:Record<string,number>};
export function sanitizeGarden(v:unknown,now:number):GardenState{
 const o=v&&typeof v==='object'?v as Partial<GardenState>:{},picked:Record<string,number>={};
 const first=typeof o.firstSeen==='number'&&Number.isFinite(o.firstSeen)&&o.firstSeen>0&&o.firstSeen<=now?o.firstSeen:now;
 if(o.picked&&typeof o.picked==='object')for(const s of GARDEN_SPOTS){const t=(o.picked as Record<string,unknown>)[s.id];if(typeof t==='number'&&Number.isFinite(t)&&t>0)picked[s.id]=Math.min(t,now);}
 return {version:1,firstSeen:first,picked};
}
/** Epoch ms when a spot is (or was) ripe. Unripe starters ripen halfway through one regrow after the first visit. */
export function ripeAt(s:GardenSpot,g:GardenState){const p=g.picked[s.id];return p?p+s.regrowMs:s.startsUnripe?g.firstSeen+s.regrowMs/2:0;}
export const isRipe=(s:GardenSpot,g:GardenState,now:number)=>now>=ripeAt(s,g);
export function minutesLeft(s:GardenSpot,g:GardenState,now:number){return Math.max(1,Math.ceil((ripeAt(s,g)-now)/60e3));}
export function pickSpot(g:GardenState,s:GardenSpot,now:number):GardenState|null{return isRipe(s,g,now)?{...g,picked:{...g.picked,[s.id]:now}}:null;}
