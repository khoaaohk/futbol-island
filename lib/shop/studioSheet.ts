/**
 * Kit Shop studios · the phone bottom sheet and the stage fit (Oct 14 2026, user: "for mobile, everything is so tight, can we
 * resize and change the heights of the bottom section. when resizing have the top portion scale to position the ball better and
 * show more?"). Pure, DOM-free logic shared by the Ball, Boot and Jersey studios through components/shop/StudioControls.tsx
 * (useStudioSheet + <StudioSheetHandle>) and by their three.js scenes (lib/shop/ballStage.ts, lib/shop/bootScene.ts,
 * components/shop/jerseyScene.ts):
 *  - three snap heights for the sheet on phones (≤ 899px wide): compact ≈ 34% of the viewport (the step pills and a peek of the
 *    content), default ≈ 50%, tall ≈ 78% (browsing options); the last one picked is remembered per device;
 *  - the stage's visible box once the stage chrome (the top icon row / Kick / mode toggle, the bottom view chips, the sheet's
 *    overlap) is taken off, and a perspective camera fit that centres the model in that box, as large as fits.
 * Desktop (≥ 900px) never calls any of this: its side-panel layout and camera fits are unchanged.
 */
import {phoneLayoutQuery} from '../ui/phoneLayout';

export type SheetSnap='compact'|'default'|'tall';
export const SHEET_SNAPS:readonly SheetSnap[]=['compact','default','tall'];
/** localStorage key (one per device, shared by all three studios). */
export const SHEET_KEY='fi2-studio-sheet-v1';
/** Share of the viewport height each snap aims for. */
export const SHEET_FRACTION:Record<SheetSnap,number>={compact:.34,default:.5,tall:.78};
/** Spoken state for the handle (aria-valuetext). */
export const SHEET_LABEL:Record<SheetSnap,string>={compact:'Small panel',default:'Medium panel',tall:'Tall panel'};
/** Phones only: the side panel takes over at 900px; landscape phones (Pro Max 932/956 x 430/440) keep the sheet
 * (lib/ui/phoneLayout.ts, the shared phone predicate; the studio CSS spells the same list). */
export const SHEET_PHONE_QUERY=phoneLayoutQuery(899);
/** The sheet never gets shorter than its handle + step pills + Save/Buy footer plus a little content. */
export const SHEET_MIN_PX=210;
/** A tall sheet still leaves the header (≈ 68px) and this much stage above it, so the model never disappears. */
export const STAGE_MIN_PX=118;
export const HEADER_PX=68;

/** Snap heights in CSS px for a viewport `viewH` tall; always compact < default < tall. */
export function snapHeights(viewH:number):Record<SheetSnap,number>{
 const vh=Math.max(320,viewH||0),cap=Math.max(SHEET_MIN_PX+80,vh-HEADER_PX-STAGE_MIN_PX);
 const one=(s:SheetSnap)=>Math.round(Math.min(cap,Math.max(SHEET_MIN_PX,vh*SHEET_FRACTION[s])));
 const compact=Math.min(one('compact'),cap-80),def=Math.min(Math.max(one('default'),compact+40),cap-40),tall=Math.max(one('tall'),def+40);
 return {compact,default:def,tall};
}
/** A tap on the handle: compact → default → tall → compact. */
export function nextSnap(s:SheetSnap):SheetSnap{return SHEET_SNAPS[(SHEET_SNAPS.indexOf(s)+1)%SHEET_SNAPS.length];}
/** Keyboard Up (+1, taller) / Down (−1, shorter), clamped at the ends. */
export function stepSnap(s:SheetSnap,dir:1|-1):SheetSnap{const i=Math.max(0,Math.min(SHEET_SNAPS.length-1,SHEET_SNAPS.indexOf(s)+dir));return SHEET_SNAPS[i];}
/** Live drag height: a little rubber band past the ends, never beyond. */
export function clampDrag(h:Record<SheetSnap,number>,px:number):number{return Math.round(Math.max(h.compact-28,Math.min(h.tall+20,px)));}
/** Where a drag settles: the snap nearest to where the sheet would coast in ~160 ms (velocity in px/ms, + = growing). */
export function settleSnap(h:Record<SheetSnap,number>,px:number,velocity=0):SheetSnap{
 const v=Math.max(-3,Math.min(3,velocity||0)),to=px+v*160;let best:SheetSnap='default',d=Infinity;
 for(const s of SHEET_SNAPS){const k=Math.abs(h[s]-to);if(k<d){d=k;best=s;}}
 return best;
}
export function parseSnap(v:unknown):SheetSnap{return typeof v==='string'&&(SHEET_SNAPS as readonly string[]).includes(v)?v as SheetSnap:'default';}
type Store=Pick<Storage,'getItem'|'setItem'>|null|undefined;
const ls=():Store=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
/** The last snap on this device ('default' when there is none, or storage is blocked). */
export function loadSnap(store:Store=ls()):SheetSnap{try{return parseSnap(store?.getItem(SHEET_KEY));}catch{return 'default';}}
export function saveSnap(s:SheetSnap,store:Store=ls()):void{try{store?.setItem(SHEET_KEY,parseSnap(s));}catch{/* private mode / quota: the snap just isn't remembered */}}

// ---- the stage fit ----
/** CSS px taken off the top and bottom of a stage canvas by chrome drawn over it. */
export type StageInsets={top:number;bottom:number};
type R={top:number;bottom:number;height:number};
/**
 * The visible box of a stage canvas (`host`, client rect): below the lowest top control (`tops`: icon row, Kick, mode
 * toggle) and above the highest bottom one (`bottoms`: view chips, the sheet's top edge), with a `gap` of breathing room.
 * Hidden controls (zero height) are ignored. When the chrome would leave less than `minFrac` of the canvas (a tall sheet
 * plus the draw step's mode toggle), both insets shrink in proportion so the model stays visible and centred.
 */
export function stageInsets(host:R,tops:R[],bottoms:R[],gap=10,minFrac=.36):StageInsets{
 if(!(host.height>0))return {top:0,bottom:0};
 let top=0,edge=host.bottom;
 for(const r of tops)if(r.height>0&&r.bottom>host.top&&r.top<host.bottom)top=Math.max(top,r.bottom-host.top+gap);
 for(const r of bottoms)if(r.height>0&&r.top<host.bottom)edge=Math.min(edge,r.top-gap);
 let bottom=Math.max(0,host.bottom-edge);top=Math.max(0,Math.min(top,host.height));
 const min=host.height*minFrac,vis=host.height-top-bottom;
 if(vis<min){const k=Math.max(0,(top+bottom-(min-vis))/Math.max(1e-6,top+bottom));top*=k;bottom*=k;}
 return {top:Math.round(top),bottom:Math.round(bottom)};
}
export const sameInsets=(a:StageInsets|null,b:StageInsets|null)=>a===b||(!!a&&!!b&&Math.abs(a.top-b.top)<1&&Math.abs(a.bottom-b.bottom)<1);
/**
 * Perspective fit: the camera distance at which a model with half extents (halfW, halfH, world units) fills at most `fillW`
 * of the canvas width and `fillH` of the visible box height (insets removed). fov in degrees (vertical).
 */
export function fitDistance(o:{fov:number;w:number;h:number;insets:StageInsets;halfW:number;halfH:number;fillW:number;fillH:number}):number{
 const t=Math.tan(o.fov*Math.PI/360),w=Math.max(1,o.w),h=Math.max(1,o.h),vis=Math.max(1,h-o.insets.top-o.insets.bottom);
 return Math.max(o.halfW/(t*(w/h)*o.fillW),o.halfH*h/(t*o.fillH*vis));
}
/** How far (CSS px, + = down) the picture moves so the canvas centre lands on the visible box's centre. */
export const insetShift=(i:StageInsets)=>(i.top-i.bottom)/2;
type Cam={setViewOffset(fw:number,fh:number,x:number,y:number,w:number,h:number):void;clearViewOffset():void;updateProjectionMatrix():void};
/**
 * Moves the picture down by insetShift via an off-axis frustum (camera.setViewOffset), so the model is centred in the visible
 * box without re-aiming the camera: picking (Raycaster.setFromCamera, GPU pick passes) uses the same projection and stays exact.
 * No insets (desktop, show-off) clears it.
 */
export function applyInsetOffset(cam:Cam,w:number,h:number,i:StageInsets|null){
 const s=i?insetShift(i):0;
 if(!s)cam.clearViewOffset();else cam.setViewOffset(Math.max(1,w),Math.max(1,h),0,-s,Math.max(1,w),Math.max(1,h));
 cam.updateProjectionMatrix();
}
