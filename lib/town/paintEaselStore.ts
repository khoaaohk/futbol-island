/**
 * The bridge between the painting easel's 3D runtime (lib/graphics/paintEasel.ts, inside Town's loop) and its UI
 * (components/PaintEasel.tsx). Like summitStore: a plain external store, written only when something the UI shows changes (never
 * per frame), plus the commands the UI sends back. No timers, no polling.
 */
export type EaselView={
 /** Seated at the easel (the camera eases to the view, the painting card shows). */
 seated:boolean;
 /** 'paint': the card is up; 'look': "Just look", everything hidden but the view. */
 mode:'paint'|'look';
 /** The camera has reached the seated framing (the view snapshot is taken then). */
 arrived:boolean;
 /** One snapshot of the visible view (taken once on arrival, again only if the layout changes): the eyedropper and "trace" read it.
  *  `rect` is the client rectangle it covers. */
 capture:null|{canvas:HTMLCanvasElement;rect:{left:number;top:number;width:number;height:number};rev:number};
};
export type EaselLayout={/** Fraction of the screen height the card covers at the bottom (phones). */bottom:number;/** Fraction of the width the panel covers on the right (desktop). */right:number};
export type EaselActions={open():void;exit():void;setMode(mode:'paint'|'look'):void;layout(l:EaselLayout):void;
 /** A painting was saved: the easel's board shows it. */saved(img:string):void};

const IDLE:EaselView={seated:false,mode:'paint',arrived:false,capture:null};
let view=IDLE;const listeners=new Set<()=>void>();
export const easelStore={
 get:()=>view,
 set(patch:Partial<EaselView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===IDLE)return;view=IDLE;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 server:()=>IDLE,
};
const noop=()=>{};
const NOOP:EaselActions={open:noop,exit:noop,setMode:noop,layout:noop,saved:noop};
/** Commands from the UI; the runtime installs the real ones while the island is up. */
export const easelActions:EaselActions={...NOOP};
export function installEaselActions(a:EaselActions){Object.assign(easelActions,a);return()=>{Object.assign(easelActions,NOOP);easelStore.reset();};}
