'use client';
import {useEffect,useRef,useState} from 'react';
import {DoneButton} from './DoneButton';
import styles from './VendingCardReveal.module.css';
import own from './KonbiniReveal.module.css';
import {FOOD_LAYERS,drawFoodShadow,type FoodLayer} from '@/lib/konbini/foodArt';
import {consumable,foodNote,foodItem,collectionGroups} from '@/lib/konbini/food';
import {konbiniTick,konbiniSfx} from '@/lib/konbini/konbiniSound';
import {useModalFocus} from '@/lib/konbini/useModalFocus';

/**
 * The big layered reveal after a Konbini purchase (and when replaying a collected item). Same full-screen dark see-through
 * presentation as the vending pack reveal (VendingCardReveal.module.css). The item builds itself on ONE 2D canvas: each layer
 * drops and snaps in with a soft shadow and a tick; films and lids pull away, hot water pours, steam rises. The rAF runs only
 * while the build plays (≈0.36 s a layer), then the canvas is static. Reduced motion: the finished item at once.
 *
 * STABLE API (Sep 29 2026) for other features (e.g. the drink machines): <KonbiniReveal item={revealItemFor(id) or your own
 * RevealItem with FoodLayer[] layers} onEat onSave onDone/>.
 */
export type RevealItem={id:string;label:string;jp?:string;blurb:string;note:string;layers:FoodLayer[];eyebrow?:string;
 /** 'drink' switches the default wording to "Hydration:" / "Drink now". Auto-detected for Konbini drinks and the
  *  registered "Drink machines" collection group when omitted. */
 kind?:'food'|'drink';
 /** Per-item wording overrides. */
 labels?:{note?:string;eat?:string}};
/** Is this item a drink (Konbini drinks section or the drink machines' collection group)? */
export function isDrinkItem(id:string){return foodItem(id)?.section==='drinks'||collectionGroups().some(g=>g.id==='drink-machines'&&g.items.some(i=>i.id===id));}
export function revealLabels(item:RevealItem){const drink=item.kind?item.kind==='drink':isDrinkItem(item.id);return {note:item.labels?.note??(drink?'Hydration':'Football fuel'),eat:item.labels?.eat??(drink?'Drink now':'Eat now')};}
export function revealItemFor(id:string,eyebrow?:string):RevealItem|null{const c=consumable(id);const layers=FOOD_LAYERS[id];if(!c||!layers)return null;return {id,label:c.label,jp:c.jp,blurb:c.blurb,note:foodNote(id),layers,eyebrow};}
const STEP=360,SIZE=300,PAUSE=220,FINISH=600;
/** PREVIEW mode (user, Sep 30 2026: "allow options to preview before buying"): the same big view and layered build, labelled
 *  Preview, with Back and Buy. It never charges, collects, stamps NEW! or fills the pouch: the caller only buys on `onBuy`. */
export type RevealPreview={price:number;onBuy:()=>void;onBack:()=>void;buyDisabled?:boolean;buyLabel?:string};
export default function KonbiniReveal({item,onEat,onSave,onDone,saveDisabled,status,firstTime,collection,preview}:{item:RevealItem;onEat?:()=>void;onSave?:()=>void;onDone:()=>void;saveDisabled?:boolean;status?:string;firstTime?:boolean;preview?:RevealPreview;
 /** First purchase: the collection count ticks from have−1 to have. */
 collection?:{have:number;total:number}}){
 const canvas=useRef<HTMLCanvasElement>(null),panel=useRef<HTMLElement>(null);
 const [step,setStep]=useState(0),[built,setBuilt]=useState(false);
 // Focus in, Escape wherever focus is, a Tab trap for aria-modal, focus restored on close (code review finding 16).
 useModalFocus(panel,onDone);
 useEffect(()=>{
  const el=canvas.current,c=el?.getContext('2d');if(!el||!c)return;
  // Drawn at the size it is shown (the reveal is large, Sep 30 2026), so pixel details stay crisp: k maps the 300-unit art space to device pixels.
  const dpr=Math.min(2,window.devicePixelRatio||1)*Math.max(1,(el.clientWidth||SIZE)/SIZE);el.width=Math.round(SIZE*dpr);el.height=Math.round(SIZE*dpr);
  const layers=item.layers,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let replaceAt=-1;layers.forEach((l,i)=>{if(l.kind==='replace')replaceAt=i;});
  const last=layers.length-1;
  // Build time → layers built (fractional). A short held breath before the last layer (review item 14).
  const buildT=(ms:number)=>ms<last*STEP?ms/STEP:ms<last*STEP+PAUSE?last:Math.min(layers.length,last+(ms-last*STEP-PAUSE)/STEP);
  const total=layers.length*STEP+PAUSE;
  const draw=(t:number,burst=0)=>{ // t = layers built so far (fractional); burst 0..1 = the finish starburst
   c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,SIZE,SIZE);
   // riso backdrop: a clean off-white disc (the iso art's card) with a warm halftone ring
   c.fillStyle='#fbf7ee';c.beginPath();c.arc(SIZE/2,SIZE/2,SIZE*.42,0,Math.PI*2);c.fill();c.fillStyle='#ecdcb055';for(let i=0;i<48;i++){const a=i/48*Math.PI*2;c.beginPath();c.arc(SIZE/2+Math.cos(a)*SIZE*.38,SIZE/2+Math.sin(a)*SIZE*.38,3,0,Math.PI*2);c.fill();}
   const s=4.3,cx=SIZE/2,cy=SIZE/2+2;// the food fills more of the disc
   if(burst>0&&burst<1){c.save();c.translate(cx,cy);c.rotate(burst*.6);c.globalAlpha=(1-burst)*.75;c.fillStyle='#ffd35c';for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.beginPath();c.moveTo(0,-30);c.lineTo(8,-60-burst*60);c.lineTo(-8,-60-burst*60);c.closePath();c.fill();}c.restore();}
   // The item's own soft cast shadow (the iso art's, foodArt.FOOD_SHADOW), clipped to the disc (review B8), fading in with the vessel.
   c.save();c.beginPath();c.arc(SIZE/2,SIZE/2,SIZE*.42,0,Math.PI*2);c.clip();c.translate(cx,cy);c.scale(s,s);drawFoodShadow(c,item.id,0,0,Math.max(0,Math.min(1,t)));c.restore();
   c.save();c.translate(cx,cy);c.scale(s,s);c.lineJoin='round';
   layers.forEach((l,i)=>{
    const p=Math.max(0,Math.min(1,t-i));if(p<=0)return;const done=t>=layers.length;
    if(replaceAt>=0&&i<replaceAt&&t>replaceAt){const fade=1-Math.min(1,t-replaceAt);if(fade<=0)return;c.globalAlpha=fade;l.draw(c,0,0,1);c.globalAlpha=1;return;}
    if(l.kind==='pull'){if(done||p>=1)return;const k=p*p;c.save();c.globalAlpha=1-k;c.translate(k*48,-k*10);c.rotate(k*.3);l.draw(c,0,0,1);c.restore();return;}
    if(l.kind==='pour'){if(done||p>=1)return;l.draw(c,0,0,Math.min(1,p*1.6));return;}
    if(l.kind==='steam'||l.kind==='glint'){c.globalAlpha=p;l.draw(c,0,0,p);c.globalAlpha=1;return;}
    // Drop, stretch while falling, squash on landing, settle (review item 13), with a crumb puff at the landing.
    const fall=Math.min(1,p/.7),e=1-Math.pow(1-fall,3),drop=(1-e)*-26,land=p<.7?0:(p-.7)/.3;
    const sx=p<.7?.95:1+.1*Math.sin(land*Math.PI)*(1-land*.4),sy=p<.7?1.07:1-.1*Math.sin(land*Math.PI)*(1-land*.4);
    c.save();c.globalAlpha=Math.min(1,p*2.2);c.translate(0,drop+14);c.scale(sx,sy);c.translate(0,-14);l.draw(c,0,0,1);c.restore();
    if(land>0&&land<1){c.save();c.globalAlpha=1-land;c.fillStyle='#e6d3a3';for(let k=0;k<6;k++){const dir=k<3?-1:1,spread=(k%3+1)*7*land;c.beginPath();c.arc(dir*(14+spread),18-Math.sin(land*Math.PI)*(3+k%3*2),1.3,0,Math.PI*2);c.fill();}c.restore();}
   });
   c.restore();
  };
  if(reduced){draw(layers.length);setStep(layers.length);setBuilt(true);return;}
  let frame=0,start=0,lastStep=-1,finished=false;
  const loop=(now:number)=>{if(!start)start=now;const ms=now-start,t=buildT(ms);const whole=Math.min(layers.length,Math.floor(t+1e-6));if(whole!==lastStep){lastStep=whole;setStep(whole);if(whole>0){konbiniTick(whole);konbiniSfx.crumb();}}
   if(ms>=total&&!finished){finished=true;konbiniSfx.finish();if(!preview)try{navigator.vibrate?.(30);}catch{/* no haptics */}setBuilt(true);}
   if(ms>=total+FINISH){draw(layers.length);frame=0;return;}draw(t,ms>=total?(ms-total)/FINISH:0);frame=requestAnimationFrame(loop);};
  setBuilt(false);frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);
 },[item]);
 const words=revealLabels(item);
 const current=item.layers[Math.min(item.layers.length-1,Math.max(0,step-1))];
 return <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${item.label} ${preview?'preview':'reveal'}`} className={styles.reveal} data-konbini-reveal={item.id} data-preview={preview?true:undefined} data-built={built}
  >
  <div className={styles.shade} aria-hidden="true"/>
  <div className={styles.content}>
   <header className={`${own.head} ${preview?own.headInline:''}`}><span>{preview?<b className={own.previewTag} data-konbini-preview-tag>Preview</b>:firstTime?'NEW! · COLLECTION':item.eyebrow??'KONBINI'}</span><h2>{built?(preview?'Take a look!':'Ready!'):`Building… ${current?.name??''}`}</h2><DoneButton className={styles.close} data-konbini-done data-konbini-preview-back={preview?true:undefined} onDone={preview?preview.onBack:onDone}/></header>
   <div className={own.stage}>{!preview&&firstTime&&built&&<b className={own.hanko} aria-hidden="true">NEW!</b>}<canvas ref={canvas} className={`${own.canvas} ${preview&&built?own.rock:''}`} width={SIZE} height={SIZE} aria-label={`${item.label}, built layer by layer: ${item.layers.filter(l=>l.kind!=='pour').map(l=>l.name).join(', ')}`} role="img"/></div>
   <div className={styles.caption} aria-live="polite">{item.jp&&<span lang="ja" className={own.jp} data-built={built||undefined}>{item.jp}</span>}<strong className={own.en}>{item.label}</strong>{!preview&&firstTime&&collection&&<span className={own.count} data-konbini-count>Konbini Collection <b key={built?'after':'before'} data-tick={built||undefined}>{built?collection.have:collection.have-1}</b>/{collection.total}</span>}<p>{item.blurb}</p><p className={own.note}><b>{words.note}:</b> {item.note}</p>{status&&<p className={own.status} role="status">{status}</p>}</div>
   {preview&&<nav aria-label="Preview" className={own.actions}><button type="button" data-konbini-preview-buy disabled={preview.buyDisabled} onClick={preview.onBuy}>{preview.buyLabel??`Buy · ${preview.price} coins`}</button></nav>}
   {!preview&&(onEat||onSave)&&<nav aria-label="What to do with it" className={own.actions}>{onEat&&<button type="button" data-konbini-eat onClick={onEat}>{words.eat}</button>}{onSave&&<button type="button" data-konbini-save disabled={saveDisabled} onClick={onSave}>Save to backpack</button>}</nav>}
  </div>
 </section>;
}
