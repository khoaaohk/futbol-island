/**
 * The bridge between the Ball Cannon's 3D runtime (lib/graphics/ballCannon.ts, inside Town's loop) and its HUD
 * (components/BallCannonHud.tsx), like summitStore.ts: a plain external store written only when something the HUD shows changes
 * (never per frame), plus the commands the HUD sends back. No timers, no polling, no score.
 */
export type CannonView={
 /** In the seat (the HUD's controls show). */
 seated:boolean;
 /** 0 until the first ball since sitting down, then 1 (the how-to line goes after the first; written once, not per shot). */
 shots:number;
 /** Discs knocked out since sitting down, and the word for the latest ("Nice!"): the HUD's little cheer, keyed by `hits`. */
 hits:number;word:string;
};
export type CannonActions={sit():void;leave():void;fire():void;release(count:1|2):void;aim(dxPx:number,dyPx:number):void};

const IDLE:CannonView={seated:false,shots:0,hits:0,word:''};
let view=IDLE;const listeners=new Set<()=>void>();
export const cannonStore={
 get:()=>view,
 /** Shallow merge; listeners run only when a field actually changed. */
 set(patch:Partial<CannonView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 server:()=>IDLE,
};
const noop=()=>{};
const NOOP:CannonActions={sit:noop,leave:noop,fire:noop,release:noop,aim:noop};
/** Commands from the HUD; the runtime installs the real ones while the island is up. */
export const cannonActions:CannonActions={...NOOP};
export function installCannonActions(a:CannonActions){Object.assign(cannonActions,a);return()=>{Object.assign(cannonActions,NOOP);cannonStore.reset();};}
