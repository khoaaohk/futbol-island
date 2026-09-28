import {vendingItem} from './vendingCatalog';
export const HOME_KEY='fi2-home-decor-v1';
export type HomeSurface='wall'|'shelf'|'floor';
export type HomePlacement={id:string;surface:HomeSurface;slot:number;turned:boolean};
export type HomeState={version:1;placements:HomePlacement[]};
export const emptyHome:HomeState={version:1,placements:[]};
export function itemSurface(id:string):HomeSurface|null{const shape=vendingItem(id)?.display?.shape;return shape==='frame'?'wall':shape==='lamp'?'floor':shape==='book'||shape==='trophy'?'shelf':null;}
export function sanitizeHome(raw:unknown,owned:ReadonlySet<string>):HomeState{
 const v=raw as Partial<HomeState>|null,placements:HomePlacement[]=[];if(v?.version!==1||!Array.isArray(v.placements))return {version:1,placements};
 for(const p of v.placements){if(!p||!owned.has(p.id)||itemSurface(p.id)!==p.surface||!Number.isInteger(p.slot)||p.slot<0||p.slot>=6||placements.some(q=>q.id===p.id||q.surface===p.surface&&q.slot===p.slot))continue;placements.push({id:p.id,surface:p.surface,slot:p.slot,turned:p.turned===true});}
 return {version:1,placements};
}
export function placeHome(state:HomeState,owned:ReadonlySet<string>,id:string,surface:HomeSurface,slot:number):{ok:true;state:HomeState}|{ok:false;reason:string}{
 if(!owned.has(id))return {ok:false,reason:'Collect this item from its vending machine first.'};
 if(itemSurface(id)!==surface||!Number.isInteger(slot)||slot<0||slot>=6)return {ok:false,reason:'Choose a highlighted spot for this item.'};
 if(state.placements.some(p=>p.surface===surface&&p.slot===slot&&p.id!==id))return {ok:false,reason:'That spot is occupied. Move its item or return it to your collection first.'};
 return {ok:true,state:{version:1,placements:[...state.placements.filter(p=>p.id!==id),{id,surface,slot,turned:state.placements.find(p=>p.id===id)?.turned??false}]}};
}
