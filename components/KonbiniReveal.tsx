'use client';
import {useEffect,useId,useRef,useState,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {DoneButton} from './DoneButton';
import styles from './VendingCardReveal.module.css';
import own from './KonbiniReveal.module.css';
import {FOOD_LAYERS,drawFoodShadow,type FoodLayer} from '@/lib/konbini/foodArt';
import {consumable,foodNote,foodItem,collectionGroups} from '@/lib/konbini/food';
import {konbiniTick,konbiniSfx} from '@/lib/konbini/konbiniSound';
import {useModalFocus} from '@/lib/konbini/useModalFocus';
import {BITES,MASK,PUFF_MS,biteAnnouncement,biteLabel,biteSpots,createBiteToy,crumbsFor,drinkLevel,maskBounds,scallop,type BiteKind,type BiteSpot,type BiteToy,type ItemBounds} from '@/lib/konbini/biteToy';

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
 labels?:{note?:string;eat?:string};
 /** Tap-to-bite toy (lib/konbini/biteToy.ts). Defaults to on for consumables (food and drinks), off for gear previews. */
 edible?:boolean};
/** Is this item a drink (Konbini drinks section or the drink machines' collection group)? */
export function isDrinkItem(id:string){return foodItem(id)?.section==='drinks'||collectionGroups().some(g=>g.id==='drink-machines'&&g.items.some(i=>i.id===id));}
export function revealLabels(item:RevealItem){const drink=item.kind?item.kind==='drink':isDrinkItem(item.id);return {note:item.labels?.note??(drink?'Hydration':'Football fuel'),eat:item.labels?.eat??(drink?'Drink now':'Eat now')};}
export function revealItemFor(id:string,eyebrow?:string):RevealItem|null{const c=consumable(id);const layers=FOOD_LAYERS[id];if(!c||!layers)return null;return {id,label:c.label,jp:c.jp,blurb:c.blurb,note:foodNote(id),layers,eyebrow};}
const STEP=360,SIZE=300,PAUSE=220,FINISH=600;
/** The art's placement on the canvas (300-unit space): the food fills more of the disc. */
const ART_S=4.3,ART_X=SIZE/2,ART_Y=SIZE/2+2;
/** Riso backdrop: a clean off-white disc (the iso art's card) with a warm halftone ring. */
function backdrop(c:CanvasRenderingContext2D){
 c.fillStyle='#fbf7ee';c.beginPath();c.arc(SIZE/2,SIZE/2,SIZE*.42,0,Math.PI*2);c.fill();c.fillStyle='#ecdcb055';for(let i=0;i<48;i++){const a=i/48*Math.PI*2;c.beginPath();c.arc(SIZE/2+Math.cos(a)*SIZE*.38,SIZE/2+Math.sin(a)*SIZE*.38,3,0,Math.PI*2);c.fill();}
}
/** The item's own soft cast shadow (the iso art's, foodArt.FOOD_SHADOW), clipped to the disc (review B8). */
function artShadow(c:CanvasRenderingContext2D,id:string,alpha:number){c.save();c.beginPath();c.arc(SIZE/2,SIZE/2,SIZE*.42,0,Math.PI*2);c.clip();c.translate(ART_X,ART_Y);c.scale(ART_S,ART_S);drawFoodShadow(c,id,0,0,alpha);c.restore();}
const isDrink=(item:RevealItem)=>item.kind?item.kind==='drink':isDrinkItem(item.id);

// ---- The bite toy's picture (lib/konbini/biteToy.ts has the state machine and geometry) ---------------------------------------
/** What a bite cuts: the finished stack minus the vessel (food), or the whole package (drinks, which sip instead). */
function bitableLayers(item:RevealItem,drink:boolean){
 const all=item.layers;let start=0;all.forEach((l,i)=>{if(l.kind==='replace')start=i;});
 const shown=all.slice(start).filter(l=>l.kind!=='pull'&&l.kind!=='pour');return drink?shown:shown.filter(l=>l!==all[0]);
}
type BiteGeo={bounds:ItemBounds;spots:BiteSpot[]};
/** Measured once per item (a MASK² alpha read of the finished art), then reused by every tap and rebuild. */
const biteGeo=new WeakMap<FoodLayer[],BiteGeo>();
type BiteArt={c:CanvasRenderingContext2D;dpr:number;off:HTMLCanvasElement|null};
const CRUMBS=['#e6d3a3','#c98a3c','#f4e6c2'],DROPS=['#9fd6f0','#d9f1fb','#6fb8dc'];
/** Paints the eaten item into the offscreen layer (once per tap): the stack, then the bite cuts or the lowered drink level. */
function composeEaten(art:BiteArt,item:RevealItem,drink:boolean,bites:number,gone:boolean):BiteGeo{
 const {c,dpr}=art,w=c.canvas.width,h=c.canvas.height;
 if(!art.off||art.off.width!==w||art.off.height!==h){art.off=document.createElement('canvas');art.off.width=w;art.off.height=h;}
 const o=art.off.getContext('2d')!;o.setTransform(1,0,0,1,0,0);o.globalCompositeOperation='source-over';o.clearRect(0,0,w,h);
 o.setTransform(dpr,0,0,dpr,0,0);o.save();o.translate(ART_X,ART_Y);o.scale(ART_S,ART_S);o.lineJoin='round';for(const l of bitableLayers(item,drink))l.draw(o,0,0,1);o.restore();
 let geo=biteGeo.get(item.layers);
 if(!geo){const m=document.createElement('canvas');m.width=m.height=MASK;const mc=m.getContext('2d',{willReadFrequently:true})!;mc.drawImage(art.off,0,0,MASK,MASK);
  const px=mc.getImageData(0,0,MASK,MASK).data,mask=new Uint8Array(MASK*MASK);for(let i=0;i<mask.length;i++)mask[i]=px[i*4+3]>60?1:0;
  geo={bounds:maskBounds(mask,SIZE),spots:biteSpots(mask,SIZE)};biteGeo.set(item.layers,geo);}
 const b=geo.bounds;
 if(!drink){if(gone)o.clearRect(0,0,SIZE,SIZE);else{o.globalCompositeOperation='destination-out';o.fillStyle='#000';
  for(let i=0;i<Math.min(bites,geo.spots.length);i++){o.beginPath();scallop(geo.spots[i]).forEach(([x,y],k)=>k?o.lineTo(x,y):o.moveTo(x,y));o.closePath();o.fill();}
  o.globalCompositeOperation='source-over';}}
 else{const L=drinkLevel(bites);if(L<1){const top=b.y0+(b.y1-b.y0)*.2,lv=top+(b.y1+2-top)*(1-L),curve=(b.x1-b.x0)*.2;
  o.globalCompositeOperation='source-atop';o.fillStyle='rgba(236,246,252,.8)';o.beginPath();o.moveTo(b.x0-2,top-6);o.lineTo(b.x1+2,top-6);o.lineTo(b.x1+2,lv);o.quadraticCurveTo(b.cx,lv+curve,b.x0-2,lv);o.closePath();o.fill();
  if(L>0){o.lineWidth=1.8;o.strokeStyle='rgba(30,90,130,.35)';o.beginPath();o.moveTo(b.x0-2,lv+2);o.quadraticCurveTo(b.cx,lv+2+curve,b.x1+2,lv+2);o.stroke();
   o.strokeStyle='rgba(255,255,255,.95)';o.beginPath();o.moveTo(b.x0-2,lv);o.quadraticCurveTo(b.cx,lv+curve,b.x1+2,lv);o.stroke();}
  o.globalCompositeOperation='source-over';}}
 return geo;
}
/** One frame of the eaten picture: backdrop, shadow, the un-bitten vessel, the composed item, crumbs, and (0 ≤ puff < 1) the crumb puff. */
function paintEaten(art:BiteArt,item:RevealItem,drink:boolean,geo:BiteGeo,bites:number,gone:boolean,puff:number){
 const {c,dpr}=art,b=geo.bounds;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,SIZE,SIZE);backdrop(c);
 artShadow(c,item.id,drink?1:gone?.35:1-bites/BITES*.4);
 if(!drink&&item.layers[0]){c.save();c.translate(ART_X,ART_Y);c.scale(ART_S,ART_S);c.lineJoin='round';item.layers[0].draw(c,0,0,1);c.restore();}
 if(art.off){c.setTransform(1,0,0,1,0,0);c.drawImage(art.off,0,0);c.setTransform(dpr,0,0,dpr,0,0);}
 if(!drink){const dots=[...geo.spots.slice(0,Math.min(bites,geo.spots.length)).flatMap((s,i)=>crumbsFor(i,s,b)),...(gone?crumbsFor(9,{x:b.cx,y:b.y1-6,r:b.size*.35,rot:0},b,12):[])];
  for(const d of dots){c.fillStyle=CRUMBS[d.c];c.beginPath();c.arc(d.x,d.y,d.r,0,Math.PI*2);c.fill();}}
 if(puff>=0&&puff<1){const s=drink?{x:b.cx,y:b.y0+(b.y1-b.y0)*.12,r:10,rot:-Math.PI/2}:gone?{x:b.cx,y:b.cy,r:b.size*.3,rot:-Math.PI/2}:geo.spots[Math.min(bites,geo.spots.length)-1];
  const e=1-Math.pow(1-puff,2),cols=drink?DROPS:CRUMBS;c.save();c.globalAlpha=1-puff;
  for(let k=0;k<10;k++){const a=s.rot+(k/10-.5)*(drink?1.6:2.6),d=s.r*(.5+e*(1+k%3*.35)),x=s.x+Math.cos(a)*d,y=s.y+Math.sin(a)*d+(drink?-e*6:puff*puff*26);
   c.fillStyle=cols[k%3];c.beginPath();c.arc(x,y,drink?1.8:1.4+k%3*.5,0,Math.PI*2);c.fill();}c.restore();}
}
/** PREVIEW mode (user, Sep 30 2026: "allow options to preview before buying"): the same big view and layered build, labelled
 *  Preview, with Back and Buy. It never charges, collects, stamps NEW! or fills the pouch: the caller only buys on `onBuy`. */
export type RevealPreview={price:number;onBuy:()=>void;onBack:()=>void;buyDisabled?:boolean;buyLabel?:string};
export default function KonbiniReveal({item,onEat,onSave,onDone,saveDisabled,status,firstTime,collection,preview}:{item:RevealItem;onEat?:()=>void;onSave?:()=>void;onDone:()=>void;saveDisabled?:boolean;status?:string;firstTime?:boolean;preview?:RevealPreview;
 /** First purchase: the collection count ticks from have−1 to have. */
 collection?:{have:number;total:number}}){
 const canvas=useRef<HTMLCanvasElement>(null),panel=useRef<HTMLElement>(null);
 const [step,setStep]=useState(0),[built,setBuilt]=useState(false),[everBuilt,setEverBuilt]=useState(false);
 // The bite toy (lib/konbini/biteToy.ts): `gen` restarts the build after the last bite; `eaten` mirrors the toy for the DOM.
 const [gen,setGen]=useState(0),[eaten,setEaten]=useState({bites:0,gone:false}),[said,setSaid]=useState('');
 const drink=isDrink(item),edible=item.edible??(drink||!!consumable(item.id)),kind:BiteKind=drink?'sip':'bite',descId=useId();
 const toy=useRef<BiteToy|null>(null),art=useRef<BiteArt|null>(null),puffFrame=useRef(0);
 useEffect(()=>{
  if(!edible)return;
  const t=createBiteToy({kind,label:item.label,reduced:()=>matchMedia('(prefers-reduced-motion:reduce)').matches,
   render:(bites,gone,puff)=>{const a=art.current;setEaten({bites,gone});if(!a)return;cancelAnimationFrame(puffFrame.current);const geo=composeEaten(a,item,drink,bites,gone);
    if(!puff){paintEaten(a,item,drink,geo,bites,gone,-1);return;}
    // The crumb puff: ≤ PUFF_MS of frames that only blit the composed layer, then static again.
    let start=0;const run=(now:number)=>{if(!start)start=now;const k=(now-start)/PUFF_MS;paintEaten(a,item,drink,geo,bites,gone,k>=1?-1:k);puffFrame.current=k>=1?0:requestAnimationFrame(run);};
    puffFrame.current=requestAnimationFrame(run);},
   sound:s=>konbiniSfx[s](),
   vibrate:ms=>{try{navigator.vibrate?.(ms);}catch{/* no haptics */}},
   announce:setSaid,
   rebuild:()=>{cancelAnimationFrame(puffFrame.current);setEaten({bites:0,gone:false});setGen(g=>g+1);},
   setTimer:(fn,ms)=>window.setTimeout(fn,ms),clearTimer:id=>window.clearTimeout(id as number)});
  toy.current=t;return()=>{t.dispose();cancelAnimationFrame(puffFrame.current);if(toy.current===t)toy.current=null;};
 },[item,edible,drink,kind]);
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
  art.current={c,dpr,off:art.current?.off??null};
  const draw=(t:number,burst=0)=>{ // t = layers built so far (fractional); burst 0..1 = the finish starburst
   c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,SIZE,SIZE);backdrop(c);
   const s=ART_S,cx=ART_X,cy=ART_Y;
   if(burst>0&&burst<1){c.save();c.translate(cx,cy);c.rotate(burst*.6);c.globalAlpha=(1-burst)*.75;c.fillStyle='#ffd35c';for(let i=0;i<12;i++){c.rotate(Math.PI/6);c.beginPath();c.moveTo(0,-30);c.lineTo(8,-60-burst*60);c.lineTo(-8,-60-burst*60);c.closePath();c.fill();}c.restore();}
   artShadow(c,item.id,Math.max(0,Math.min(1,t)));// fading in with the vessel
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
  // Reduced motion (and a reduced-motion rebuild after the last bite): the finished item at once, no build tween.
  const ready=()=>{setEverBuilt(true);toy.current?.built();};
  if(reduced){draw(layers.length);setStep(layers.length);setBuilt(true);ready();return;}
  let frame=0,start=0,lastStep=-1,finished=false;
  const loop=(now:number)=>{if(!start)start=now;const ms=now-start,t=buildT(ms);const whole=Math.min(layers.length,Math.floor(t+1e-6));if(whole!==lastStep){lastStep=whole;setStep(whole);if(whole>0){konbiniTick(whole);konbiniSfx.crumb();}}
   if(ms>=total&&!finished){finished=true;konbiniSfx.finish();if(!preview&&!gen)try{navigator.vibrate?.(30);}catch{/* no haptics */}setBuilt(true);setEverBuilt(true);}
   if(ms>=total+FINISH){draw(layers.length);frame=0;ready();return;}draw(t,ms>=total?(ms-total)/FINISH:0);frame=requestAnimationFrame(loop);};
  setBuilt(false);frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);
 // eslint-disable-next-line react-hooks/exhaustive-deps -- `gen` replays the build; preview only gates the finish haptic
 },[item,gen]);
 const bite=()=>{toy.current?.tap();};
 const biteKey=(e:ReactKeyboardEvent<HTMLCanvasElement>)=>{if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();e.stopPropagation();if(!e.repeat)bite();};
 const words=revealLabels(item);
 const current=item.layers[Math.min(item.layers.length-1,Math.max(0,step-1))];
 return <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${item.label} ${preview?'preview':'reveal'}`} className={styles.reveal} data-konbini-reveal={item.id} data-preview={preview?true:undefined} data-built={built}
  >
  <div className={styles.shade} aria-hidden="true"/>
  <div className={styles.content}>
   <header className={`${own.head} ${preview?own.headInline:''}`}><span>{preview?<b className={own.previewTag} data-konbini-preview-tag>Preview</b>:firstTime?'NEW! · COLLECTION':item.eyebrow??'KONBINI'}</span><h2>{built?(preview?'Take a look!':'Ready!'):`Building… ${current?.name??''}`}</h2><DoneButton className={styles.close} data-konbini-done data-konbini-preview-back={preview?true:undefined} onDone={preview?preview.onBack:onDone}/></header>
   <div className={own.stage}>{!preview&&firstTime&&built&&<b className={own.hanko} aria-hidden="true">NEW!</b>}<canvas ref={canvas} className={`${own.canvas} ${preview&&built?own.rock:''} ${edible?own.toy:''}`} width={SIZE} height={SIZE}
    {...edible?{role:'button',tabIndex:0,'aria-label':biteLabel(kind,item.label),'aria-describedby':descId,'aria-disabled':built?undefined:true,onClick:bite,onKeyDown:biteKey,
     'data-konbini-bite':kind,'data-bites':eaten.bites,'data-gone':eaten.gone||undefined,'data-rebuilds':gen}
     :{role:'img','aria-label':`${item.label}, built layer by layer: ${item.layers.filter(l=>l.kind!=='pour').map(l=>l.name).join(', ')}`}}/>
   {edible&&<span id={descId} className={own.sr}>{`${item.label}, built layer by layer: ${item.layers.filter(l=>l.kind!=='pour').map(l=>l.name).join(', ')}. Just for fun: it doesn't use up your ${drink?'drink':'food'}.`}</span>}
   {edible&&<span className={own.sr} role="status" aria-live="polite" data-konbini-bite-said>{said}</span>}</div>
   <div className={styles.caption} aria-live="polite">{item.jp&&<span lang="ja" className={own.jp} data-built={everBuilt||undefined}>{item.jp}</span>}<strong className={own.en}>{item.label}</strong>{!preview&&firstTime&&collection&&<span className={own.count} data-konbini-count>Konbini Collection <b key={everBuilt?'after':'before'} data-tick={everBuilt||undefined}>{everBuilt?collection.have:collection.have-1}</b>/{collection.total}</span>}<p>{item.blurb}</p><p className={own.note}><b>{words.note}:</b> {item.note}</p>{status&&<p className={own.status} role="status">{status}</p>}</div>
   {preview&&<nav aria-label="Preview" className={own.actions}><button type="button" data-konbini-preview-buy disabled={preview.buyDisabled} onClick={preview.onBuy}>{preview.buyLabel??`Buy · ${preview.price} coins`}</button></nav>}
   {!preview&&(onEat||onSave)&&<nav aria-label="What to do with it" className={own.actions}>{onEat&&<button type="button" data-konbini-eat onClick={onEat}>{words.eat}</button>}{onSave&&<button type="button" data-konbini-save disabled={saveDisabled} onClick={onSave}>Save to backpack</button>}</nav>}
  </div>
 </section>;
}
