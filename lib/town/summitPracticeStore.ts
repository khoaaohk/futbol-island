/**
 * The bridge between the Summit 5s practice runtime (lib/graphics/summitPractice.ts, inside Town's loop) and its React HUD
 * (components/SummitPracticeHud.tsx). Like summitStore: a plain external store written only when something the HUD shows
 * changes (never per frame), plus the commands the HUD sends back. No timers, no polling.
 */
import type {ConeColor,PropKind} from './summitPractice';

export type PracticeView={
 /** off: not on the pitch; play: practising; edit: the layout editor. */
 mode:'off'|'play'|'edit';
 drill:string;name:string;tip:string;
 /** The camera angle's label (the live games' button cycles it). */
 cam:string;
 /** Changes with each entry (the "Practice pitch" toast) and each goal (the cheer). */
 hello:number;goals:number;
 /** Edit mode: the selected prop's kind (null = none) and the counts against the caps. */
 selected:PropKind|null;cones:number;men:number;balls:number;
 /** Edit mode: true once the layout differs from the drill's default (Reset drill is offered). */
 edited:boolean;
};
export type PracticeActions={shuffle():void;exit():void;edit():void;done():void;reset():void;camera():void;
 add(kind:PropKind,color?:ConeColor):void;rotate():void;remove():void;deselect():void};

const OFF:PracticeView={mode:'off',drill:'',name:'',tip:'',cam:'Follow',hello:0,goals:0,selected:null,cones:0,men:0,balls:0,edited:false};
let view=OFF;const listeners=new Set<()=>void>();
export const practiceStore={
 get:()=>view,
 set(patch:Partial<PracticeView>){let changed=false;for(const k in patch)if(!Object.is((view as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;view={...view,...patch};listeners.forEach(fn=>fn());},
 reset(){if(view===OFF)return;view=OFF;listeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 server:()=>OFF,
};
const noop=()=>{};
const NOOPS:PracticeActions={shuffle:noop,exit:noop,edit:noop,done:noop,reset:noop,camera:noop,add:noop,rotate:noop,remove:noop,deselect:noop};
export const practiceActions:PracticeActions={...NOOPS};
export function installPracticeActions(a:PracticeActions){Object.assign(practiceActions,a);return()=>{Object.assign(practiceActions,NOOPS);practiceStore.reset();};}
