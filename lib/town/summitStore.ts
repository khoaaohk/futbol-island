/**
 * The tiny bridge between the Summit Isle activities' 3D runtime (lib/graphics/summitActivities.ts, inside Town's loop) and their
 * React HUDs (components/SummitKickHud.tsx, components/TelescopeView.tsx). Like fishingStore: a plain external store, written only
 * when something a HUD shows changes (never per frame), plus the commands the HUDs send back. No timers, no polling.
 */
import type {KickEnd} from './summitKick';

export type KickView={
 /** idle: nothing on; intro: the instructions card; playing: a round; done: the end card. */
 phase:'idle'|'intro'|'playing'|'done';
 hits:number;kicks:number;maxKicks:number;hoops:number;secondsLeft:number;
 /** The latest hoop popped (its label) and a counter that changes with each pop (the HUD's cheer). */
 popped:string;pops:number;
 /** A short coaching note ("Step back behind the chalk line"). */
 note:string;
 sunset:boolean;
 result:null|{end:KickEnd;hits:number;kicks:number;seconds:number;score:number;hoopPoints:number;accuracy:number;speed:number;best:number;newBest:boolean;coins:number;round:number};
};
export type ScopeView={
 active:boolean;zoom:number;
 label:null|{id:string;name:string;line:string};
 /** 0–1 while a glint is being held in the centre, its name; null otherwise. */
 spotting:null|{id:string;progress:number};
 found:number;total:number;
 /** A note after spotting or collecting ("Glint spotted! …"). */
 note:string;notes:number;
};
export type SummitActions={startKick():void;beginRound():void;exitKick():void;openScope():void;exitScope():void;pan(dx:number,dy:number):void;zoom():void};

const noop=()=>{};
const IDLE_KICK:KickView={phase:'idle',hits:0,kicks:0,maxKicks:8,hoops:5,secondsLeft:0,popped:'',pops:0,note:'',sunset:true,result:null};
const IDLE_SCOPE:ScopeView={active:false,zoom:0,label:null,spotting:null,found:0,total:5,note:'',notes:0};

function createStore<V extends object>(initial:V){
 let view=initial;const listeners=new Set<()=>void>();
 return {
  get:()=>view,
  /** Shallow merge; listeners run only when a field actually changed. */
  set(patch:Partial<V>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
   if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
  reset(){if(view===initial)return;view=initial;listeners.forEach(fn=>fn());},
  subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
  server:()=>initial,
 };
}
export const kickStore=createStore<KickView>(IDLE_KICK);
export const scopeStore=createStore<ScopeView>(IDLE_SCOPE);
/** Commands from the HUDs; the runtime installs the real ones while the island is up. */
export const summitActions:SummitActions={startKick:noop,beginRound:noop,exitKick:noop,openScope:noop,exitScope:noop,pan:noop,zoom:noop};
export function installSummitActions(a:SummitActions){Object.assign(summitActions,a);return()=>{Object.assign(summitActions,{startKick:noop,beginRound:noop,exitKick:noop,openScope:noop,exitScope:noop,pan:noop,zoom:noop});kickStore.reset();scopeStore.reset();};}
