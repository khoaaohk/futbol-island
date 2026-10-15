'use client';
/**
 * The Summit Isle painting easel's UI (Oct 14 2026): the world-anchored "Paint the view" prompt and, once seated, a small painting
 * card over the live view (a bottom sheet on phones, a side panel on desktop and landscape phones). The view stays the star: the card
 * only covers part of the screen, "Just look" hides everything, and nothing here keeps score.
 *
 * Tools: a round brush, a soft watercolour wash, a fill bucket, an eraser, and "pick a colour from the view" (tap the view: the
 * colour comes from the one snapshot the runtime took when you sat down); three sizes; twelve colours from the scene; undo, clear
 * (tap twice), "trace" (the snapshot faintly under the paper), save (the last few on this device only) and a gallery strip.
 *
 * Heat: drawing happens only on pointer events, coalesced into one requestAnimationFrame while a finger is down (none at rest). No
 * timers, no polling, no animation at rest; one ResizeObserver tells the runtime how much of the screen the card covers.
 */
import {useCallback,useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore,type PointerEvent as RPointerEvent} from 'react';
import {BackButton} from './BackButton';
import {DoneButton} from './DoneButton';
import {easelStore,easelActions,type EaselView} from '@/lib/town/paintEaselStore';
import {PAINT_W,PAINT_H,PAINT_PALETTE,PAINT_TOOLS,BRUSH,BRUSH_SIZES,brushRadius,stampsAlong,floodFill,hexToRgb,rgbToHex,createUndo,
 readPaintings,writePaintings,addPainting,newPaintingId,validPaintingImage,PAINT_BUDGET,type PaintTool,type Painting} from '@/lib/town/paintEasel';
import {paintSound} from '@/lib/audio/paintSound';
import {countEaselSave} from '@/lib/analytics/summitEvents';
import styles from './PaintEasel.module.css';

const PAPER='#fbf6ea';
/** Unsaved work survives leaving the easel (Back) for this visit: it is waiting on the canvas when you sit down again. */
let draft:ImageData|null=null;
const cue=(detail:string)=>{try{document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));}catch{/* no document */}};

export default function PaintEasel(){
 const v=useSyncExternalStore(easelStore.subscribe,easelStore.get,easelStore.server);
 return <>
  <button type="button" className="store-enter-prompt" data-easel-open aria-label="Paint the view" hidden onClick={()=>easelActions.open()}>Paint the view</button>
  {v.seated&&<Studio v={v}/>}
 </>;
}

/** Encodes the painting small: WebP if the browser can, else JPEG, stepping the quality down until it fits the per-picture budget. */
function encode(canvas:HTMLCanvasElement){
 for(const q of [.8,.65,.5,.38]){for(const type of ['image/webp','image/jpeg']){let url='';try{url=canvas.toDataURL(type,q);}catch{continue;}
  if(!url.startsWith('data:'+type))continue;if(validPaintingImage(url))return url;}}
 return null;
}

function Studio({v}:{v:EaselView}){
 const look=v.mode==='look';
 const card=useRef<HTMLDivElement|null>(null),paint=useRef<HTMLCanvasElement|null>(null),trace=useRef<HTMLCanvasElement|null>(null);
 const [tool,setTool]=useState<PaintTool>('brush'),[size,setSize]=useState(1),[colour,setColour]=useState(PAINT_PALETTE[2].hex);
 const [side,setSide]=useState(false),[traceOn,setTraceOn]=useState(false),[confirmClear,setConfirmClear]=useState(false),[gallery,setGallery]=useState(false);
 const [saved,setSaved]=useState<Painting[]>(()=>readPaintings().items),[status,setStatus]=useState<'clean'|'dirty'|'saved'>('clean'),[canUndo,setCanUndo]=useState(false);
 const lastBrush=useRef<PaintTool>('brush'),statusRef=useRef(status);statusRef.current=status;
 const undo=useRef(createUndo<ImageData>());
 const stroke=useRef<{id:number;last:{x:number;y:number};pending:{x:number;y:number}[];carry:number;raf:number;stamp:HTMLCanvasElement|null}|null>(null);
 const ctx=()=>paint.current?.getContext('2d',{willReadFrequently:true})??null;

 // ---- the island steps aside: its HUD hides (app/globals.css keys off html[data-easel]), its keys wait, the sea washes softly.
 useEffect(()=>{const el=document.documentElement;el.dataset.easel='on';paintSound.seaStart();
  return()=>{delete el.dataset.easel;delete el.dataset.easelLook;paintSound.seaStop();};},[]);
 useEffect(()=>{const el=document.documentElement;if(look)el.dataset.easelLook='on';else delete el.dataset.easelLook;},[look]);

 // ---- the canvas: restore the draft (or a blank sheet), and keep the draft on the way out.
 useEffect(()=>{const g=ctx();if(!g)return;g.clearRect(0,0,PAINT_W,PAINT_H);if(draft){g.putImageData(draft,0,0);setStatus('dirty');}
  const c=paint.current;
  return()=>{const g2=c?.getContext('2d',{willReadFrequently:true});const s=stroke.current;if(s?.raf)cancelAnimationFrame(s.raf);stroke.current=null;
   if(g2&&statusRef.current==='dirty')draft=g2.getImageData(0,0,PAINT_W,PAINT_H);else if(statusRef.current!=='dirty')draft=null;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 // ---- tell the runtime how much of the screen the card covers (it shifts the view into the open part); only on a size change.
 useLayoutEffect(()=>{const el=card.current;if(!el||typeof ResizeObserver==='undefined'){easelActions.layout({bottom:0,right:0});return;}
  const publish=()=>{const r=el.getBoundingClientRect(),W=window.innerWidth||1,H=window.innerHeight||1,side=r.top<H*.35;setSide(side);
   easelActions.layout(side?{bottom:0,right:Math.max(0,(W-r.left)/W)}:{bottom:Math.max(0,(H-r.top)/H),right:0});};
  publish();const ro=new ResizeObserver(publish);ro.observe(el);window.addEventListener('resize',publish);
  return()=>{ro.disconnect();window.removeEventListener('resize',publish);};},[look]);

 // ---- keys: Escape steps back (Just look → paint → leave); the island's own keys wait while you paint.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();
   if(k==='escape'){e.preventDefault();e.stopPropagation();if(easelStore.get().mode==='look')easelActions.setMode('paint');else leave();return;}
   if(k!=='tab'&&k!=='enter'&&k!==' ')e.stopPropagation();};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 // ---- trace: the snapshot of the view, centre-cropped to the paper's 4:3, faintly under the painting.
 useEffect(()=>{const t=trace.current,cap=v.capture;if(!t||!traceOn||!cap)return;const g=t.getContext('2d');if(!g)return;
  const sw=cap.canvas.width,sh=cap.canvas.height,a=PAINT_W/PAINT_H;let cw=sw,ch=sw/a;if(ch>sh){ch=sh;cw=sh*a;}
  g.clearRect(0,0,PAINT_W,PAINT_H);g.drawImage(cap.canvas,(sw-cw)/2,(sh-ch)/2,cw,ch,0,0,PAINT_W,PAINT_H);},[traceOn,v.capture]);

 const changed=()=>{setStatus('dirty');setConfirmClear(false);};
 const snapshot=()=>{const g=ctx();if(!g)return;undo.current.push(g.getImageData(0,0,PAINT_W,PAINT_H));setCanUndo(true);};
 const toCanvas=(e:{clientX:number;clientY:number})=>{const r=paint.current!.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*PAINT_W,y:(e.clientY-r.top)/r.height*PAINT_H};};

 /** A soft round stamp in the current colour (watercolour), drawn once per stroke. */
 const softStamp=(r:number)=>{const c=document.createElement('canvas'),d=Math.ceil(r*2);c.width=c.height=d;const g=c.getContext('2d')!;const {r:R,g:G,b:B}=hexToRgb(colour);
  const grad=g.createRadialGradient(d/2,d/2,0,d/2,d/2,d/2);grad.addColorStop(0,`rgba(${R},${G},${B},1)`);grad.addColorStop(.55,`rgba(${R},${G},${B},.7)`);grad.addColorStop(1,`rgba(${R},${G},${B},0)`);
  g.fillStyle=grad;g.fillRect(0,0,d,d);return c;};
 /** Draws everything queued since the last frame (one rAF per frame, only while a finger is down). */
 const flush=()=>{const s=stroke.current,g=ctx();if(!s||!g)return;s.raf=0;if(!s.pending.length)return;
  const r=brushRadius(tool,size);
  if(tool==='water'&&s.stamp){g.globalCompositeOperation='source-over';g.globalAlpha=BRUSH.water.alpha;
   for(const p of s.pending){const st=stampsAlong(s.last,p,Math.max(1,r*BRUSH.water.spacing*2),s.carry);s.carry=st.carry;for(const q of st.points)g.drawImage(s.stamp,q.x-r,q.y-r);s.last=p;}
   g.globalAlpha=1;}
  else{g.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';g.globalAlpha=1;g.strokeStyle=colour;g.lineWidth=r*2;g.lineCap='round';g.lineJoin='round';
   g.beginPath();g.moveTo(s.last.x,s.last.y);for(const p of s.pending){g.lineTo(p.x,p.y);s.last=p;}g.stroke();g.globalCompositeOperation='source-over';}
  s.pending.length=0;};

 const pickFrom=(canvas:HTMLCanvasElement,x:number,y:number)=>{const g=canvas.getContext('2d',{willReadFrequently:true});if(!g)return false;
  const px=Math.max(0,Math.min(canvas.width-1,Math.floor(x))),py=Math.max(0,Math.min(canvas.height-1,Math.floor(y)));
  const d=g.getImageData(px,py,1,1).data;if(d[3]<16)return false;setColour(rgbToHex(d[0],d[1],d[2]));setTool(lastBrush.current);cue('select');return true;};
 /** "Pick a colour from the view": a tap on the live view reads the snapshot under the finger. */
 const pickView=(e:RPointerEvent<HTMLElement>)=>{const cap=v.capture;if(!cap)return;const {rect}=cap;
  const fx=(e.clientX-rect.left)/rect.width,fy=(e.clientY-rect.top)/rect.height;if(fx<0||fy<0||fx>1||fy>1)return;
  pickFrom(cap.canvas,fx*cap.canvas.width,fy*cap.canvas.height);};

 const down=(e:RPointerEvent<HTMLCanvasElement>)=>{const c=paint.current,g=ctx();if(!c||!g||stroke.current)return;e.preventDefault();setConfirmClear(false);
  const p=toCanvas(e);
  if(tool==='pick'){// on the paper: the painting's colour there, or the view's (traced) colour if the paper is still bare
   if(!pickFrom(c,p.x,p.y)&&v.capture){const t=trace.current;if(t&&traceOn)pickFrom(t,p.x,p.y);else{const cap=v.capture.canvas,a=PAINT_W/PAINT_H;let cw=cap.width,ch=cap.width/a;if(ch>cap.height){ch=cap.height;cw=ch*a;}
     pickFrom(cap,(cap.width-cw)/2+p.x/PAINT_W*cw,(cap.height-ch)/2+p.y/PAINT_H*ch);}}
   return;}
  if(tool==='fill'){snapshot();const img=g.getImageData(0,0,PAINT_W,PAINT_H),{r,g:G,b}=hexToRgb(colour);
   if(floodFill(img.data,PAINT_W,PAINT_H,p.x,p.y,[r,G,b,255])>0){g.putImageData(img,0,0);changed();paintSound.brush(true);}else{undo.current.pop();setCanUndo(undo.current.size>0);}
   return;}
  snapshot();try{c.setPointerCapture(e.pointerId);}catch{/* fine */}
  stroke.current={id:e.pointerId,last:p,pending:[{x:p.x+.01,y:p.y}],carry:0,raf:0,stamp:tool==='water'?softStamp(brushRadius('water',size)):null};
  flush();changed();paintSound.brush(tool==='water');};
 const move=(e:RPointerEvent<HTMLCanvasElement>)=>{const s=stroke.current;if(!s||s.id!==e.pointerId)return;
  const list=typeof e.nativeEvent.getCoalescedEvents==='function'?e.nativeEvent.getCoalescedEvents():[];for(const q of list.length?list:[e.nativeEvent])s.pending.push(toCanvas(q));
  if(!s.raf)s.raf=requestAnimationFrame(flush);};
 const up=(e:RPointerEvent<HTMLCanvasElement>)=>{const s=stroke.current;if(!s||s.id!==e.pointerId)return;if(s.raf)cancelAnimationFrame(s.raf);flush();stroke.current=null;};

 const doUndo=()=>{const prev=undo.current.pop(),g=ctx();if(prev&&g){g.putImageData(prev,0,0);changed();cue('previous');}setCanUndo(undo.current.size>0);};
 const doClear=()=>{if(!confirmClear){setConfirmClear(true);return;}const g=ctx();if(!g)return;snapshot();g.clearRect(0,0,PAINT_W,PAINT_H);setConfirmClear(false);setStatus('clean');statusRef.current='clean';draft=null;cue('previous');};
 const doSave=useCallback(()=>{const c=paint.current;if(!c)return false;const out=document.createElement('canvas');out.width=PAINT_W;out.height=PAINT_H;const g=out.getContext('2d');if(!g)return false;
  g.fillStyle=PAPER;g.fillRect(0,0,PAINT_W,PAINT_H);g.drawImage(c,0,0);const img=encode(out);if(!img)return false;
  const r=addPainting(readPaintings(),{id:newPaintingId(Date.now(),Math.random()),at:Date.now(),img});if(!r.added)return false;
  const stored=writePaintings(r.save);if(!stored)return false;setSaved(stored.items);setStatus('saved');statusRef.current='saved';draft=null;easelActions.saved(img);countEaselSave();cue('confirm');return true;},[]);
 const loadPainting=(p:Painting)=>{const g=ctx();if(!g)return;const pic=new Image();pic.onload=()=>{snapshot();g.clearRect(0,0,PAINT_W,PAINT_H);g.drawImage(pic,0,0,PAINT_W,PAINT_H);setStatus('saved');setGallery(false);cue('select');};pic.src=p.img;};
 const leave=()=>easelActions.exit();
 const done=()=>{if(statusRef.current==='dirty')doSave();easelActions.exit();};
 const chooseTool=(t:PaintTool)=>{setConfirmClear(false);if(t!=='pick')lastBrush.current=t;setTool(t);cue('select');};

 if(look)return <button type="button" className={styles.lookCatcher} data-easel-ui data-easel-look-back aria-label="Return to painting" onClick={()=>easelActions.setMode('paint')}>
  <span className={styles.lookHint}>Tap to paint again</span></button>;

 const sizeR=BRUSH_SIZES[size];
 return <div className={styles.studio} data-easel-ui data-easel-studio data-tool={tool}>
  {/* The live view: taps never reach the island (no NPC chats or doors from here); with the colour picker, a tap picks a colour. */}
  <div className={styles.viewCatcher} data-easel-view aria-hidden={tool!=='pick'} onPointerDown={e=>{if(tool==='pick')pickView(e);}}/>
  <div className={styles.top}>
   <BackButton aria-label="Leave the easel" onBack={leave}/>
   <button type="button" className={styles.look} data-easel-just-look onClick={()=>easelActions.setMode('look')}>Just look</button>
   <DoneButton aria-label={status==='dirty'?'Save and leave the easel':'Leave the easel'} onDone={done}/>
  </div>
  <div className={styles.card} ref={card} data-easel-card>
   <div className={styles.paintRow}>
    <div className={styles.paper} style={{['--paper' as string]:PAPER}}>
     <canvas ref={trace} className={styles.trace} width={PAINT_W} height={PAINT_H} hidden={!traceOn} aria-hidden="true"/>
     <canvas ref={paint} className={styles.canvas} width={PAINT_W} height={PAINT_H} data-easel-canvas role="img" aria-label="Your painting. Paint with your finger or the mouse."
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}/>
    </div>
    <div className={styles.rail} role="toolbar" aria-label="Brushes">
     {PAINT_TOOLS.map(t=><button key={t.id} type="button" className={styles.tool} data-easel-tool={t.id} aria-pressed={tool===t.id} aria-label={t.name} title={t.name} onClick={()=>chooseTool(t.id)}><ToolIcon id={t.id}/></button>)}
    </div>
   </div>
   {tool==='pick'&&<p className={styles.hint} role="status">Tap the view (or your painting) to pick its colour.</p>}
   {(!gallery||side||saved.length===0)&&<div className={styles.palette} role="radiogroup" aria-label="Colours">
    {PAINT_PALETTE.map(c=><button key={c.id} type="button" role="radio" className={styles.swatch} data-easel-colour={c.id} aria-checked={colour===c.hex} aria-label={c.name} style={{['--swatch' as string]:c.hex}} onClick={()=>{setColour(c.hex);if(tool==='eraser'||tool==='pick')setTool(lastBrush.current==='eraser'?'brush':lastBrush.current);cue('select');}}/>)}
    {!PAINT_PALETTE.some(c=>c.hex===colour)&&<span className={styles.swatch} data-easel-picked aria-label="Picked colour" role="img" style={{['--swatch' as string]:colour}}/>}
   </div>}
   {saved.length>0&&(gallery||side)&&<div className={styles.gallery} data-easel-gallery aria-label="Your paintings">
    {saved.map((p,i)=><button key={p.id} type="button" className={styles.thumb} aria-label={`Keep painting picture ${i+1}`} onClick={()=>loadPainting(p)}><img src={p.img} alt=""/></button>)}
    <span className={styles.small}>{`Your last ${PAINT_BUDGET.max} paintings stay on this device.`}</span>
   </div>}
   <div className={styles.actions}>
    <button type="button" className={styles.act} data-easel-size aria-label={`Brush size: ${['small','medium','large'][size]}`} onClick={()=>{setSize((size+1)%BRUSH_SIZES.length);cue('select');}}>
     <i className={styles.dot} style={{width:4+sizeR*1.1,height:4+sizeR*1.1,background:tool==='eraser'?'transparent':colour}}/></button>
    <button type="button" className={styles.act} data-easel-undo disabled={!canUndo} aria-label="Undo" onClick={doUndo}><Glyph d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/></button>
    <button type="button" className={styles.act} data-easel-trace aria-pressed={traceOn} disabled={!v.capture} aria-label="Trace the view" title="Trace the view" onClick={()=>{setTraceOn(!traceOn);cue('select');}}><Glyph d="M3 18 9 9l4 6 3-4 5 7zM16 6a2 2 0 1 0 0 .1"/></button>
    <button type="button" className={styles.act} data-easel-clear data-confirm={confirmClear||undefined} aria-label={confirmClear?'Tap again to clear the painting':'Clear the painting'} onClick={doClear}>{confirmClear?<span className={styles.sure}>Clear?</span>:<Glyph d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>}</button>
    {saved.length>0&&!side&&<button type="button" className={styles.act} data-easel-gallery-toggle aria-pressed={gallery} aria-label={gallery?'Show the colours':'My paintings'} onClick={()=>{setGallery(!gallery);cue('select');}}><Glyph d="M4 5h16v14H4zM4 15l5-5 4 4 2-2 5 5"/></button>}
    <button type="button" className={styles.save} data-easel-save disabled={status!=='dirty'} onClick={()=>{if(!doSave())setStatus('dirty');}}>{status==='saved'?'Saved':'Save'}</button>
   </div>
  </div>
 </div>;
}

function Glyph({d}:{d:string}){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function ToolIcon({id}:{id:PaintTool}){
 if(id==='brush')return <Glyph d="M14 4l6 6-8 8H6v-6zM6 18l-2 2"/>;
 if(id==='water')return <Glyph d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>;
 if(id==='fill')return <Glyph d="M5 11 12 4l7 7-7 7zM19 15c1 1.6 1.5 2.6 1.5 3.3a1.5 1.5 0 0 1-3 0c0-.7.5-1.7 1.5-3.3z"/>;
 if(id==='eraser')return <Glyph d="M4 15l8-8 6 6-6 6H8zM13 19h7"/>;
 return <Glyph d="M14 4l6 6-2 2-6-6zM12 8l-7 7v4h4l7-7"/>;
}
