'use client';
import {useEffect,useRef,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {createBench,type Bench,type BenchCounts,type PanelKind} from './stitch';
import styles from './Experience.module.css';

/**
 * The "How it's made" programme on the 1970 TV (Oct 9 2026): the stitching bench (stitch.ts) plus its tray of panels and the
 * flying piece. Everything sits inside the TV picture, so the picture's black-and-white filter, scanlines and glass apply.
 */
export const PIECE:Record<PanelKind,{name:string;sides:number;colour:string;total:number}>={
 pent:{name:'black pentagon',sides:5,colour:'black',total:12},
 hex:{name:'white hexagon',sides:6,colour:'white',total:20},
};
export type BenchEvent={kind:'place'|'wrong'|'done'|'turn';panel?:PanelKind;need?:PanelKind};

export function Shape({kind}:{kind:PanelKind}){
 const n=PIECE[kind].sides,pts=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return `${(30+27*Math.cos(a)).toFixed(1)},${(30+27*Math.sin(a)).toFixed(1)}`;}).join(' ');
 return <svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><polygon points={pts} className={styles.shape} data-kind={kind}/><polygon points={pts} className={styles.shapeStitch} transform="translate(30 30) scale(.82) translate(-30 -30)"/></svg>;
}

export default function StitchBench({reduced,counts,onChange,bind}:{reduced:boolean;counts:BenchCounts;onChange:(c:BenchCounts,e:BenchEvent)=>void;bind:(b:Bench|null)=>void}){
 const wrap=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),ghost=useRef<HTMLDivElement>(null),bench=useRef<Bench|null>(null);
 const tray=useRef<Record<PanelKind,HTMLButtonElement|null>>({pent:null,hex:null});
 const changed=useRef(onChange);changed.current=onChange;
 const local=(x:number,y:number)=>{const r=wrap.current!.getBoundingClientRect();return {x:x-r.left,y:y-r.top};};
 const trayAt=(k:PanelKind)=>{const b=tray.current[k]?.getBoundingClientRect();return b?local(b.left+b.width/2,b.top+b.height*.42):{x:0,y:0};};
 useEffect(()=>{const c=canvas.current,g=ghost.current;if(!c||!g)return;
  const b=createBench(c,g,{reduced,coarse:matchMedia('(pointer: coarse)').matches,tray:trayAt,onChange:(n,e)=>changed.current(n,e)});
  bench.current=b;bind(b);return()=>{b.dispose();bench.current=null;bind(null);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[reduced]);

 // The ball: drag to spin (flick for momentum), tap a gap to fill it.
 const own=useRef<number|null>(null);
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const p=local(e.clientX,e.clientY);if(bench.current?.down(p.x,p.y)){own.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);}};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(own.current!==e.pointerId)return;const p=local(e.clientX,e.clientY);bench.current?.move(p.x,p.y);};
 const up=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(own.current!==e.pointerId)return;own.current=null;bench.current?.up();};
 const key=(e:ReactKeyboardEvent)=>{const d:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};const v=d[e.key];if(v){e.preventDefault();bench.current?.nudge(v[0],v[1]);}};

 // A piece: drag it onto a gap, or tap it (or press Enter) and it flies to the best gap of its shape.
 const piece=useRef<{id:number;kind:PanelKind;x:number;y:number;dragging:boolean}|null>(null);
 const pDown=(k:PanelKind)=>(e:ReactPointerEvent<HTMLButtonElement>)=>{if(e.button!==0&&e.pointerType==='mouse')return;e.currentTarget.setPointerCapture(e.pointerId);piece.current={id:e.pointerId,kind:k,x:e.clientX,y:e.clientY,dragging:false};};
 const pMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{const p=piece.current;if(!p||p.id!==e.pointerId)return;const q=local(e.clientX,e.clientY);
  if(!p.dragging&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>6){p.dragging=true;const f=trayAt(p.kind);bench.current?.pieceDown(p.kind,q.x,q.y,f.x,f.y);}
  if(p.dragging)bench.current?.pieceMove(q.x,q.y);};
 const dragged=useRef(false);
 const pUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{const p=piece.current;if(!p||p.id!==e.pointerId)return;piece.current=null;if(p.dragging){dragged.current=true;bench.current?.pieceUp();}};
 const pClick=(k:PanelKind)=>()=>{if(dragged.current){dragged.current=false;return;}const f=trayAt(k);bench.current?.place(k,f.x,f.y);};
 const pCancel=()=>{if(piece.current?.dragging){dragged.current=true;bench.current?.pieceUp();}piece.current=null;};

 const left=(k:PanelKind)=>PIECE[k].total-counts[k];
 return <div ref={wrap} className={styles.bench}>
  <canvas ref={canvas} className={styles.benchCanvas} tabIndex={0} role="img" onKeyDown={key}
   aria-label={`The Telstar on the bench: ${counts.pent} of 12 black pentagons and ${counts.hex} of 20 white hexagons stitched. Drag to spin it, or use the arrow keys.`}
   onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}/>
  <div className={styles.bug} aria-hidden="true"><b>●</b> HOW IT’S MADE</div>
  <div className={styles.tray} role="group" aria-label="Panels to stitch">
   {(['pent','hex'] as const).map(k=><button key={k} ref={el=>{tray.current[k]=el;}} type="button" className={styles.piece} data-kind={k} disabled={left(k)===0} data-museum-own-cue
    aria-label={`${PIECE[k].colour} ${PIECE[k].sides}-sided panel: ${left(k)} to go. Press to stitch one on.`}
    onPointerDown={pDown(k)} onPointerMove={pMove} onPointerUp={pUp} onPointerCancel={pCancel} onLostPointerCapture={pCancel} onClick={pClick(k)}>
    <Shape kind={k}/><span>{counts[k]}/{PIECE[k].total}</span>
   </button>)}
  </div>
  <div ref={ghost} className={styles.ghost} aria-hidden="true"><Shape kind="pent"/><Shape kind="hex"/></div>
 </div>;
}
