'use client';
import {useRef,forwardRef,type CSSProperties,type ReactNode} from 'react';
import {FACE_SIZE,VENDING_BAY,VENDING_FACE_LAYOUT as L,type FaceRect} from '@/lib/graphics/vendingFaceLayout';
import styles from './VendingFace.module.css';

/**
 * Vending machine face: the VISUAL module (docs/vending-visuals-HANDOFF.md; Astra owns this file, its CSS, vendingFaceLayout.ts
 * and the 3D mesh in lib/graphics/vendingMachines.ts). It draws what the controller (VendingMachine.tsx) tells it and reports
 * presses; it holds no purchase, wallet or unlock logic. Every hit area is placed from VENDING_FACE_LAYOUT, the same rects the 3D
 * machine front is painted from, so the machine in use is the machine you walked past.
 *
 * The face root is pinned onto the 3D machine front by the controller (`placement`: a matrix3d from the four projected corners;
 * its box is the face's real on-screen size, so 1 CSS px ≈ 1 screen px). Its background is transparent: the cabinet colour
 * between the panels is the real 3D mesh.
 */
export type VendingSlotState='preview'|'buy'|'short'|'equipped'|'owned'|'locked'|'soldout';
export type VendingSlotView={id:string;label:string;price:number;state:VendingSlotState;
 /** Sold only at this machine: gold glow + "Only here". */
 special:boolean;
 /** Selected (first press): its push button is lit and the LED shows the price. */
 lit:boolean;
 /** Currently being vended (one-shot "leaves the shelf" animation). */
 vending:boolean;
 /** Item category, for picture sizing: 'pack' | 'costume' | 'ball' | 'scooter' | … */
 kind:string;picture:ReactNode;ariaLabel:string};
export type VendingPhase='idle'|'coins'|'drop'|'tray'|'reward';
export type VendingFaceView={
 /** How-to shown in the tray after a coin-slot tap (fades). */
 trayNote?:{text:string;key:number}|null;
 placement:{w:number;h:number;transform:string;
  /** Width foreshortening of the angled close-up (≥1): round product art (balls) is widened back by it. */
  widen?:number;
  /** Per slot: sideways product nudge (face-width fractions) that cancels the angled view's parallax (VendingMachines.productShift). */
  shifts?:number[];
  /** Per slot: the camera direction seen from the product (VendingMachines.productView, degrees). Drinks turn to face the camera
   *  (--yaw) and are painted from this viewpoint (lib/graphics/drinkArt.ts camera mode). */
  views?:{yaw:number;pitch:number}[];
  /** `transform` is the true CSS 3D camera placement: products stand VENDING_BAY.product behind the glass in the real bay. */
  depth?:boolean};
 /** Face font size (px, ≥12) chosen by the controller from the on-screen face width. */
 fontSize:number;compact:boolean;
 machine:{id:string;name:string;color:string;light:string;ink:string};
 header:{label:string;page:number;pages:number;special:boolean};
 slots:VendingSlotView[];cursor:number;
 led:{msg:string;sub?:string;tone?:'warn'|'ok'};
 /** Machines found so far: `short` on the sticker ("3/8 found"), `label` for screen readers. */
 balance:number;found:{short:string;label:string};phase:VendingPhase;
 /** Coins falling into the slot (n coins, restarted by `key`). */
 coinDrop:{n:number;key:number}|null;
 /** The item in (or falling into) the tray. */
 tray:{key:number;id:string;label:string;kind:string;picture:ReactNode}|null;
};
export type VendingFaceEvents={
 onSlot:(index:number)=>void;onSlotFocus:(index:number)=>void;onCoin:()=>void;onTray:()=>void;onFlip:(dir:1|-1)=>void;onNextRow:()=>void;
};
const place=(r:FaceRect):CSSProperties=>({left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.w*100}%`,height:`${r.h*100}%`});

export const VendingFace=forwardRef<HTMLDivElement,{view:VendingFaceView;events:VendingFaceEvents;
 /** Reward moment / club story, drawn over the glass (L.overlay). */
 overlay?:ReactNode;entrance?:boolean;inactive?:boolean}>(function VendingFace({view,events,overlay,entrance=true,inactive=false},ref){
 const v=view;const trayPointer=useRef<{x:number;y:number}|null>(null);
 const style={width:v.placement.w,height:v.placement.h,transform:v.placement.transform,'--fs':`${v.fontSize}px`,'--vm':v.machine.color,'--vm-light':v.machine.light,'--vm-ink':v.machine.ink,'--ball-widen':String(v.placement.widen??1),'--bay-product':`${((VENDING_BAY.product+VENDING_BAY.proud)/FACE_SIZE.w*v.placement.w).toFixed(2)}px`,
  '--push-y':`${L.slotPush.y*100}%`,'--header-clearance':`max(0px, ${50-v.placement.h*.094}px)`} as CSSProperties;
 // Bug audit B18: phone-width faces (the existing fontSize clamp bottoms out at 14 px below ~420 px wide) wrap a long shelf title
 // onto two lines and let a long LED message use two lines (its sub-line stays for screen readers), instead of cutting them off.
 const narrow=v.fontSize<=14,ledChars=Math.max(12,Math.floor((L.led.w*v.placement.w-24)/(Math.max(12,v.fontSize*.88)*.6)));
 return <div {...(inactive?{inert:''}:{}) as Record<string,string>} ref={ref} className={styles.face} style={style} data-vending-face={`${v.placement.w}x${v.placement.h}`} data-compact={v.compact||undefined} data-narrow={narrow||undefined} data-depth={v.placement.depth||undefined} data-phase={v.phase} data-entry={entrance||undefined}
  role="group" aria-label={`${v.machine.name} vending machine. Arrow keys or 1 to 6 pick, Enter buys, Escape leaves.`}>
  <div className={styles.glass} style={place(L.glass)} aria-hidden="true"><span className={styles.glare}/></div>
  {[0,1].map(row=>{const r=L.slots[row*L.cols];return <span key={row} className={styles.shelf} aria-hidden="true" style={{left:`${r.x*100}%`,width:`${(1-2*r.x)*100}%`,top:`calc(${(r.y+r.h*.53)*100}% + ${row===0?'var(--header-clearance) / 2':'0px'})`,height:`${r.h*46}%`}}/>;})}
  {entrance&&<div className={styles.arrival} style={place(L.glass)} aria-hidden="true"><span className={styles.arrivalSweep}/>{[0,1,2,3].map(i=><i key={i} className={styles.arrivalSpark} style={{'--spark':i} as CSSProperties}/>)}</div>}
  <button type="button" className={styles.flip} style={place(L.prev)} aria-label="Previous page" onClick={()=>events.onFlip(-1)} data-vending-flip="prev">◀</button>
  <button type="button" className={`${styles.label} ${v.header.special?styles.labelSpecial:''}`} style={place(L.label)} onClick={events.onNextRow} data-vending-row="" data-long-title={narrow&&v.header.label.length>10||undefined}
   aria-label={`${v.header.label}, page ${v.header.page} of ${v.header.pages}. Next row`}><span key={v.header.page} className={styles.pageTitle}>{v.header.label}</span><small>{v.header.page}/{v.header.pages}</small></button>
  <button type="button" className={styles.flip} style={place(L.next)} aria-label="Next page" onClick={()=>events.onFlip(1)} data-vending-flip="next">▶</button>
  {L.slots.map((r,index)=>{const s=v.slots[index];if(!s)return <span key={index} className={styles.empty} style={place(r)} aria-hidden="true"/>;
   return <button type="button" key={s.id} className={styles.slot} style={(index<L.cols?{...place(r),'--shelf-delay':`${index*35}ms`,'--shift-x':`${((v.placement.shifts?.[index]??0)*v.placement.w).toFixed(1)}px`,top:`calc(${r.y*100}% + var(--header-clearance))`,height:`calc(${r.h*100}% - var(--header-clearance))`,'--win-fix':'calc(var(--header-clearance) * .47)'}:{...place(r),'--shelf-delay':`${index*35}ms`,'--shift-x':`${((v.placement.shifts?.[index]??0)*v.placement.w).toFixed(1)}px`}) as unknown as CSSProperties} data-slot-index={index} data-vending-item={s.id} data-state={s.state} data-special={s.special||undefined} data-vending-out={s.vending||undefined}
    aria-pressed={s.lit} tabIndex={index===v.cursor?0:-1} aria-keyshortcuts={String(index+1)} aria-label={s.ariaLabel} onClick={()=>events.onSlot(index)} onFocus={()=>events.onSlotFocus(index)}>
    <span className={styles.window} data-kind={s.kind} data-below={(v.placement.views?.[index]?.pitch??0)<0||undefined} style={v.placement.views?.[index]?{'--yaw':`${v.placement.views[index].yaw}deg`} as CSSProperties:undefined}>{s.picture}</span>
    <span className={styles.name} title={s.label}>{s.label}</span>
    <span className={styles.push} data-lit={s.lit||undefined}><i className={styles.lamp} aria-hidden="true"/>{s.state==='preview'?<><i className={styles.coin} aria-hidden="true"/>{s.price}</>:s.state==='equipped'?'ON':s.state==='owned'?'YOURS':s.state==='locked'?'LOCKED':s.state==='soldout'?'ALL GOT':<><i className={styles.coin} aria-hidden="true"/>{s.price}</>}</span>
   </button>;})}
  <div className={styles.led} style={place(L.led)} role="status" aria-live="polite" data-vending-led={v.led.tone??'info'} data-tone={v.led.tone} data-long={narrow&&v.led.msg.length>ledChars||undefined}>
   <p className={styles.ledMsg}>{v.led.msg}</p>{v.led.sub&&<p className={styles.ledSub}>{v.led.sub}</p>}
  </div>
  <button type="button" className={styles.coinSlot} style={place(L.coin)} onClick={events.onCoin} data-vending-coin aria-label="Coin slot: how to buy">
   <span className={styles.coinCount} aria-hidden="true">{String(v.balance).padStart(3,'0')}</span>
   <span className={styles.mouth} aria-hidden="true">{v.coinDrop&&Array.from({length:v.coinDrop.n},(_,i)=><i key={`${v.coinDrop!.key}:${i}`} className={styles.dropCoin} style={{'--i':i} as CSSProperties}/>)}</span>
   <small>COINS</small>
  </button>
  <button type="button" className={styles.tray} style={place(L.tray)} onClick={events.onTray}
   onPointerDown={e=>{if(v.phase==='tray'){trayPointer.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}}}
   onPointerUp={e=>{const p=trayPointer.current;trayPointer.current=null;if(p&&p.y-e.clientY>28&&p.y-e.clientY>Math.abs(p.x-e.clientX)){e.preventDefault();events.onTray();}}}
   onPointerCancel={()=>{trayPointer.current=null;}} disabled={v.phase!=='tray'} data-vending-tray={v.phase==='tray'?'full':v.phase==='drop'?'dropping':'empty'}
   aria-label={v.phase==='tray'&&v.tray?`Take ${v.tray.label} from the tray`:'Pickup tray'}>
   {v.tray&&(v.phase==='drop'||v.phase==='tray')&&<span key={v.tray.key} className={styles.drop} data-kind={v.tray.kind} data-dispensed={v.tray.id}>{v.tray.picture}</span>}
   {v.trayNote&&v.phase!=='drop'&&<span key={v.trayNote.key} className={styles.trayNote} role="status" data-tray-note>{v.trayNote.text}</span>}<span className={styles.trayFlap} aria-hidden="true"/><span className={styles.trayHint}>{v.phase==='tray'?'TAKE ITEM ↑':'PUSH'}</span>
  </button>
  <div className={styles.glassSurface} aria-hidden="true" style={place({x:L.glass.x,y:L.slots[0].y,w:L.glass.w,h:L.glass.y+L.glass.h-L.slots[0].y})}>
   <span className={styles.reflection}/><span className={styles.glassEdge}/>
  </div>
  {overlay&&<div className={styles.overlay} style={place(L.overlay)}>{overlay}</div>}
 </div>;
});
