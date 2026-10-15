/**
 * The bridge between the painting easel's 3D runtime (lib/graphics/paintEasel.ts, inside Town's loop) and its UI
 * (components/PaintEasel.tsx). Like summitStore: a plain external store, written only when something the UI shows changes (never
 * per frame), plus the commands the UI sends back. No timers, no polling.
 *
 * Since the painting moved onto the easel (Oct 14 2026, "the painting portion should be on the easel, not two separate"), the paper
 * IS the 3D board: the runtime owns the paper canvas (`sheet`, the board's texture source), the UI draws into it on pointer events
 * and says `painted()`; `hit()` maps a screen point to the paper by intersecting the board's plane (pointer events only).
 */
import type {PaintStyleId} from './paintStyles';
export type EaselView={
 /** Seated at the easel (the camera eases to the board, the tool tray shows). */
 seated:boolean;
 /** 'paint': the tray is up; 'look': "Just look", the tray hidden and the camera back at the full view. */
 mode:'paint'|'look';
 /** The camera has reached the seated framing (the view snapshots are taken then). */
 arrived:boolean;
 /** The paper (PAINT_W×PAINT_H, transparent where unpainted): the easel board's texture is paper + trace + this. */
 sheet:HTMLCanvasElement|null;
 /** Where the board sits on screen (client px), once the camera has arrived: the wide-screen tray stands beside it. */
 boardRect:null|{left:number;top:number;right:number;bottom:number};
 /** Snapshots taken once on arrival (again only if the screen shape changes): `canvas` the seated screen (the eyedropper on the
  *  view; `rect` the client rectangle it covers) and `view` a 4:3 picture of the view from the easel ("trace", and the eyedropper
  *  on bare paper). */
 capture:null|{canvas:HTMLCanvasElement;view:HTMLCanvasElement|null;rect:{left:number;top:number;width:number;height:number};rev:number};
 /** The pink button's picture style (lib/town/paintStyles.ts) and, for an art style, its picture (PAINT_W×PAINT_H, made once from the
  *  view snapshot and cached): it sits under the paint on the board and is saved with it. Null for Blank paper and Trace. */
 style:PaintStyleId;layer:HTMLCanvasElement|null;
};
/** A screen point on the paper (px). `inside`: on the board itself (a stroke may run off its edge; it starts only inside). */
export type PaperHit={x:number;y:number;inside:boolean};
export type EaselActions={open():void;exit():void;setMode(mode:'paint'|'look'):void;
 /** Client point → paper point, by intersecting the board's plane (call only from pointer events). */
 hit(clientX:number,clientY:number):PaperHit|null;
 /** The paper changed: the board's texture uploads once on the island's next frame. */
 painted():void;
 /** The pink button: the picture under the paint (Blank paper, Trace, or an art style made from the view). */
 style(id:PaintStyleId):void;
 /** The painting on the easel in the world once you leave (after a save, "Hang on easel" or a delete); null: a bare board. */
 hang(img:string|null):void};

const IDLE:EaselView={seated:false,mode:'paint',arrived:false,sheet:null,boardRect:null,capture:null,style:'off',layer:null};
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
const NOOP:EaselActions={open:noop,exit:noop,setMode:noop,hit:()=>null,painted:noop,style:noop,hang:noop};
/** Commands from the UI; the runtime installs the real ones while the island is up. */
export const easelActions:EaselActions={...NOOP};
export function installEaselActions(a:EaselActions){Object.assign(easelActions,a);return()=>{Object.assign(easelActions,NOOP);easelStore.reset();};}
