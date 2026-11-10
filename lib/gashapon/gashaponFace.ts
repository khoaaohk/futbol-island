/**
 * The bridge between the open island machine in 3D and its HTML controls (owner, Nov 9 2026: "the gashapon spin and price should
 * be part of the machine and zoom in on that and not a modal. like the vending machine"). No React, no three.js.
 *
 *  - `gashaponFace`: the machine front's anchor points in NDC (lib/graphics/gashaponPrompt.ts projects them each frame the
 *    camera moves while a machine is open; components/GashaponMachineFace.tsx pins its controls on them).
 *  - `gashaponFx`: the commands the controls send to the animated machine (lib/graphics/gashaponLive.ts): turn the knob, let
 *    the capsule drop, crack it open. With no live machine (tests, a torn-down island) every call reports false and the
 *    controls fall back to their own short timers.
 */
export type FacePoint={x:number;y:number};
/** NDC (−1…1, y up) of the open machine's front; `knobEdge`/`trayEdge` give the on-screen size of the knob / tray. */
export type FaceAnchors={id:string;knob:FacePoint;knobEdge:FacePoint;coin:FacePoint;tray:FacePoint;trayEdge:FacePoint;crown:FacePoint;right:FacePoint;base:FacePoint};

let anchors:FaceAnchors|null=null;const listeners=new Set<(a:FaceAnchors|null)=>void>();
export const gashaponFace={
 get:()=>anchors,
 emit(a:FaceAnchors|null){anchors=a;listeners.forEach(fn=>fn(a));},
 /** Called at once with the current anchors (if any), then on every change. */
 watch(fn:(a:FaceAnchors|null)=>void){listeners.add(fn);fn(anchors);return()=>{listeners.delete(fn);};},
};

export type GashaponFxHandler={spin(machine:string,arrived:()=>void):boolean;drop(machine:string):boolean;cancel(machine:string):void;crack(machine:string):boolean;
 /** Hand turn (Nov 10 2026): hold the knob at `angle` (radians, clockwise +) while dragged; `release` springs it back to 0. */
 turn?(machine:string,angle:number):boolean;release?(machine:string,reduced:boolean):void};
let fx:GashaponFxHandler|null=null;
export const gashaponFx={
 set(h:GashaponFxHandler|null){fx=h;},
 /** Turn the knob (rattle, tumble); `arrived` runs once the capsule rests in the tray. False: no live machine. */
 spin:(machine:string,arrived:()=>void)=>fx?.spin(machine,arrived)??false,
 /** The spin is paid and saved: the capsule goes down the chute once the knob has turned. */
 drop:(machine:string)=>fx?.drop(machine)??false,
 cancel:(machine:string)=>{fx?.cancel(machine);},
 crack:(machine:string)=>fx?.crack(machine)??false,
 /** The knob held by hand at `angle`; the next `spin` carries on from there. False: no live machine. */
 turn:(machine:string,angle:number)=>fx?.turn?.(machine,angle)??false,
 /** Let go before the commit: the knob springs back (jumps back with reduced motion). */
 release:(machine:string,reduced:boolean)=>{fx?.release?.(machine,reduced);},
};
