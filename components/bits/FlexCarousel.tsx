'use client';
/**
 * FlexCarousel. Adapted from React Bits "Flex Carousel" by David Haz (https://reactbits.dev/components/flex-carousel,
 * https://github.com/DavidHDev/react-bits). MIT + Commons Clause, Copyright (c) 2026 David Haz: see
 * components/bits/LICENSE-react-bits.md and docs/third-party.md.
 *
 * Futbol Island adaptation (Oct 10 2026, first client: the museum timeline):
 *  - DOM cards (any React node: year, wall label, accent), not WebGL image textures. No ogl, no new dependency.
 *  - The "liquid glass" edge bend is CSS: cards near the edges rotate away in perspective, shrink a little, lift on an arch and
 *    catch a glint; a fling adds a velocity skew that relaxes as it settles. Transform and opacity only.
 *  - No auto-flow and no infinite loop: it moves only on drag / swipe / flick (momentum that settles on a card), the arrows,
 *    the keys (Left/Right/Home/End, Enter selects) or a horizontal trackpad scroll. The rAF loop stops the frame it settles,
 *    when the carousel leaves the screen and when the tab is hidden: 0 rAF at rest.
 *  - "Click to focus": tapping a side card brings it to the centre; tapping the centred card calls onSelect.
 *  - Entrance one-shot the first time it scrolls into view.
 *  - prefers-reduced-motion: a plain native scroll-snap row (no engine, no bend, no intro).
 *  - Accessible: a labelled carousel region, each card a labelled slide, 44px arrow buttons, one polite announcement per settle.
 */
import {Children,forwardRef,useEffect,useImperativeHandle,useRef,useState,type CSSProperties,type KeyboardEvent,type ReactNode} from 'react';
import {useReducedMotion} from './motion';
import styles from './FlexCarousel.module.css';

export type FlexCarouselHandle={goTo:(index:number)=>void;next:()=>void;prev:()=>void};
export type FlexCarouselProps={
 /** One child per card. Cards may hold any content (buttons inside still work; a drag never fires their click). */
 children:ReactNode;
 /** Region label, e.g. "Football timeline". */
 label:string;
 /** Spoken name of a card, e.g. i => `${years[i]}: ${titles[i]}`. Defaults to "Card n". */
 itemLabel?:(index:number)=>string;
 initialIndex?:number;
 /** Controlled index (optional). The carousel animates to it when it changes. */
 index?:number;
 /** Called once per settle with the centred card. */
 onIndexChange?:(index:number)=>void;
 /** Tap / Enter on the centred card. */
 onSelect?:(index:number)=>void;
 focusOnClick?:boolean;
 /** Card width (CSS length). */
 cardWidth?:string;
 gap?:number;
 /** Edge bend strength 0..1. */
 bend?:number;
 intro?:boolean;
 arrows?:boolean;
 className?:string;
 style?:CSSProperties;
};

const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const TAU=Math.PI*2;

const FlexCarousel=forwardRef<FlexCarouselHandle,FlexCarouselProps>(function FlexCarousel({
 children,label,itemLabel,initialIndex=0,index,onIndexChange,onSelect,focusOnClick=true,cardWidth='min(72vw, 320px)',gap=16,bend=0.6,intro=true,arrows=true,className='',style,
},handle){
 const cards=Children.toArray(children),count=cards.length;
 const start=clamp(index??initialIndex,0,Math.max(0,count-1));
 const reduced=useReducedMotion();
 const [active,setActive]=useState(start),[announce,setAnnounce]=useState('');
 const [introState,setIntroState]=useState<'wait'|'play'|'done'>(intro?'wait':'done');
 const root=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
 const props=useRef({onIndexChange,onSelect,focusOnClick,bend,itemLabel,count});
 props.current={onIndexChange,onSelect,focusOnClick,bend,itemLabel,count};
 const api=useRef<FlexCarouselHandle&{settledIndex:number}>({goTo:()=>{},next:()=>{},prev:()=>{},settledIndex:start});
 const activeRef=useRef(start);
 useImperativeHandle(handle,()=>({goTo:i=>api.current.goTo(i),next:()=>api.current.next(),prev:()=>api.current.prev()}),[]);

 const labelOf=(i:number)=>props.current.itemLabel?.(i)??`Card ${i+1}`;
 const settle=(i:number)=>{
  if(i!==activeRef.current){activeRef.current=i;setActive(i);}
  if(api.current.settledIndex!==i){api.current.settledIndex=i;setAnnounce(`${labelOf(i)}, ${i+1} of ${props.current.count}`);props.current.onIndexChange?.(i);}
 };

 // Entrance one-shot: the first time the carousel is on screen.
 useEffect(()=>{
  if(introState!=='wait')return;
  if(reduced){setIntroState('done');return;}
  const el=root.current;if(!el)return;
  let timer=0;
  const io=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;io.disconnect();setIntroState('play');timer=window.setTimeout(()=>setIntroState('done'),1400);},{threshold:0.2});
  io.observe(el);return()=>{io.disconnect();clearTimeout(timer);};
 },[introState,reduced]);

 // Motion engine (skipped under reduced motion: the row is a native scroll-snap list).
 useEffect(()=>{
  if(reduced)return;
  const rootEl=root.current,view=viewport.current,row=track.current;if(!rootEl||!view||!row)return;
  let els:HTMLElement[]=[],vw=1,step=1,pos=activeRef.current*1,vel=0,target:number|null=null,raf=0,last=0,visible=true,wheelTimer=0;
  let drag:{id:number;x:number;y:number;from:number;on:boolean;samples:{x:number;t:number}[]}|null=null;
  let dragged=false;
  const maxPos=()=>Math.max(0,(els.length-1)*step);
  const measure=()=>{
   els=Array.from(row.querySelectorAll<HTMLElement>(':scope > [data-fc-index]'));
   vw=Math.max(1,view.clientWidth);step=Math.max(1,(els[0]?.offsetWidth??1)+gap);
  };
  const render=()=>{
   row.style.transform=`translate3d(${-pos}px,0,0)`;
   const b=props.current.bend,skew=clamp(-vel*0.0022,-7,7)*b;
   for(let i=0;i<els.length;i++){
    const rel=(i*step-pos)/(vw/2),a=Math.min(1.5,Math.abs(rel)),e=Math.min(1,a),s=Math.sign(rel)||1;
    const el=els[i];
    if(a>=1.5&&el.dataset.far==='1')continue;// fully off to the side: nothing visible changes
    el.dataset.far=a>=1.5?'1':'0';
    el.style.transformOrigin=s>0?'0% 50%':'100% 50%';
    el.style.transform=`perspective(900px) translate3d(0,${(a*a*12*b).toFixed(2)}px,0) rotateY(${(-s*Math.pow(e,1.25)*46*b).toFixed(2)}deg) scale(${(1-0.13*e*b).toFixed(4)}) skewY(${skew.toFixed(2)}deg)`;
    el.style.setProperty('--fc-edge',(e*b).toFixed(3));
   }
  };
  const nearest=(p:number)=>clamp(Math.round(p/step),0,Math.max(0,els.length-1));
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
  const finish=()=>{if(target!==null)pos=target;vel=0;target=null;stop();render();settle(nearest(pos));};
  const frame=(t:number)=>{
   raf=0;
   const dt=last?Math.min(0.05,(t-last)/1000):1/60;last=t;
   if(drag?.on){render();return;}// pointermove schedules the next one
   if(target!==null){
    // Damped spring towards the snap point, sub-stepped for stability.
    const k=(TAU*1.5)**2,c=2*Math.sqrt(k)*0.86,n=Math.max(1,Math.ceil(dt/0.008)),h=dt/n;
    for(let i=0;i<n;i++){vel+=(-k*(pos-target)-c*vel)*h;pos+=vel*h;}
    if(Math.abs(pos-target)<0.3&&Math.abs(vel)<6){finish();return;}
   }else{finish();return;}
   render();
   if(nearest(pos)!==activeRef.current){activeRef.current=nearest(pos);setActive(activeRef.current);}
   raf=requestAnimationFrame(frame);
  };
  const wake=()=>{if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame);else if(!visible||document.hidden)finish();};
  const goTo=(i:number)=>{target=clamp(Math.round(i),0,Math.max(0,els.length-1))*step;wake();};
  api.current.goTo=goTo;
  api.current.next=()=>goTo(nearest(target??pos)+1);
  api.current.prev=()=>goTo(nearest(target??pos)-1);

  const rubber=(p:number)=>{const m=maxPos();return p<0?p*0.35:p>m?m+(p-m)*0.35:p;};
  const onDown=(e:PointerEvent)=>{
   if(e.button!==0||drag)return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,from:pos,on:false,samples:[{x:e.clientX,t:e.timeStamp}]};dragged=false;
  };
  const onMove=(e:PointerEvent)=>{
   if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(!drag.on){
    if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}// a vertical page scroll
    if(Math.abs(dx)<7)return;
    drag.on=true;dragged=true;target=null;vel=0;view.setPointerCapture?.(e.pointerId);rootEl.dataset.dragging='true';
   }
   e.preventDefault();
   pos=rubber(drag.from-dx);
   drag.samples.push({x:e.clientX,t:e.timeStamp});if(drag.samples.length>6)drag.samples.shift();
   wake();
  };
  const onUp=(e:PointerEvent)=>{
   if(!drag||e.pointerId!==drag.id)return;
   const d=drag;drag=null;delete rootEl.dataset.dragging;
   if(view.hasPointerCapture?.(e.pointerId))view.releasePointerCapture(e.pointerId);
   if(!d.on){// a tap: click to focus, or select the centred card
    const hit=(e.target as Element|null)?.closest?.('[data-fc-index]') as HTMLElement|null;
    if(!hit||(e.target as Element).closest('button,a,input,select,textarea,[role=button]')!==null&&!(e.target as Element).closest('[data-fc-select]'))return;
    const i=Number(hit.dataset.fcIndex);
    if(i!==nearest(pos)&&props.current.focusOnClick)goTo(i);
    else if(i===nearest(pos))props.current.onSelect?.(i);
    return;
   }
   const s=d.samples,a=s[0],b=s[s.length-1],ms=Math.max(1,b.t-a.t);
   vel=e.type==='pointercancel'?0:clamp(-((b.x-a.x)/ms)*1000,-4200,4200);
   const from=nearest(pos);let to=nearest(pos+vel*0.26);
   if(to===from&&Math.abs(vel)>380)to=from+(vel>0?1:-1);
   to=clamp(to,from-4,from+4);
   goTo(to);
  };
  const onClickCapture=(e:MouseEvent)=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false;}};
  const onWheel=(e:WheelEvent)=>{
   if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;// vertical scroll stays the page's
   e.preventDefault();target=null;vel=0;stop();
   pos=clamp(pos+e.deltaX,-step*0.3,maxPos()+step*0.3);render();
   clearTimeout(wheelTimer);wheelTimer=window.setTimeout(()=>goTo(nearest(pos)),140);
  };
  const onVisibility=()=>{if(document.hidden&&raf)finish();};
  const io=new IntersectionObserver(entries=>{visible=entries.some(x=>x.isIntersecting);if(!visible&&raf)finish();},{threshold:0});
  const ro=new ResizeObserver(()=>{const i=nearest(target??pos);measure();pos=i*step;target=null;vel=0;stop();render();});
  measure();pos=activeRef.current*step;render();
  view.addEventListener('pointerdown',onDown);view.addEventListener('pointermove',onMove,{passive:false});
  view.addEventListener('pointerup',onUp);view.addEventListener('pointercancel',onUp);
  view.addEventListener('click',onClickCapture,true);view.addEventListener('wheel',onWheel,{passive:false});
  document.addEventListener('visibilitychange',onVisibility);io.observe(rootEl);ro.observe(view);
  return()=>{
   stop();clearTimeout(wheelTimer);io.disconnect();ro.disconnect();
   view.removeEventListener('pointerdown',onDown);view.removeEventListener('pointermove',onMove);
   view.removeEventListener('pointerup',onUp);view.removeEventListener('pointercancel',onUp);
   view.removeEventListener('click',onClickCapture,true);view.removeEventListener('wheel',onWheel);
   document.removeEventListener('visibilitychange',onVisibility);
  };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[reduced,gap,count]);

 // Reduced motion: native scroll-snap; the arrows scroll, the index follows the scroll position.
 useEffect(()=>{
  if(!reduced)return;
  const view=viewport.current,row=track.current;if(!view||!row)return;
  const cardsEls=()=>Array.from(row.querySelectorAll<HTMLElement>(':scope > [data-fc-index]'));
  const nearest=()=>{const c=cardsEls(),mid=view.scrollLeft+view.clientWidth/2;let best=0,d=Infinity;c.forEach((el,i)=>{const m=el.offsetLeft+el.offsetWidth/2,dd=Math.abs(m-mid);if(dd<d){d=dd;best=i;}});return best;};
  const goTo=(i:number)=>{const el=cardsEls()[clamp(i,0,count-1)];if(el)view.scrollTo({left:el.offsetLeft+el.offsetWidth/2-view.clientWidth/2,behavior:'auto'});settle(clamp(i,0,count-1));};
  api.current.goTo=goTo;api.current.next=()=>goTo(activeRef.current+1);api.current.prev=()=>goTo(activeRef.current-1);
  goTo(activeRef.current);
  let t=0;const onScroll=()=>{clearTimeout(t);t=window.setTimeout(()=>settle(nearest()),90);};
  view.addEventListener('scroll',onScroll,{passive:true});
  return()=>{clearTimeout(t);view.removeEventListener('scroll',onScroll);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[reduced,count]);

 // Controlled index.
 useEffect(()=>{if(index!==undefined&&index!==api.current.settledIndex)api.current.goTo(index);},[index]);

 const onKeyDown=(e:KeyboardEvent<HTMLElement>)=>{
  const k=e.key;
  if(k==='ArrowRight'){e.preventDefault();api.current.next();}
  else if(k==='ArrowLeft'){e.preventDefault();api.current.prev();}
  else if(k==='Home'){e.preventDefault();api.current.goTo(0);}
  else if(k==='End'){e.preventDefault();api.current.goTo(count-1);}
  else if((k==='Enter'||k===' ')&&e.target===e.currentTarget){e.preventDefault();onSelect?.(activeRef.current);}
 };

 return <section ref={root} className={`${styles.root} ${className}`} style={{...style,'--fc-card':cardWidth,'--fc-gap':`${gap}px`} as CSSProperties}
  role="region" aria-roledescription="carousel" aria-label={label} tabIndex={0} onKeyDown={onKeyDown}
  data-flex-carousel data-reduced={reduced||undefined} data-intro={introState}>
  <div ref={viewport} className={styles.viewport}>
   <div ref={track} className={styles.track}>
    {cards.map((card,i)=><div key={i} className={styles.card} data-fc-index={i} data-active={i===active||undefined} role="group" aria-roledescription="slide"
     aria-label={`${labelOf(i)}, ${i+1} of ${count}`} style={{'--fc-d':Math.min(5,Math.abs(i-start))} as CSSProperties}>
     <div className={styles.inner}>{card}</div>
    </div>)}
   </div>
  </div>
  {arrows&&count>1&&<div className={styles.controls}>
   <button type="button" className={styles.arrow} aria-label="Previous" disabled={active===0} onClick={()=>api.current.prev()}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
   </button>
   <span className={styles.count} aria-hidden="true"><b>{String(active+1).padStart(2,'0')}</b> / {String(count).padStart(2,'0')}</span>
   <button type="button" className={styles.arrow} aria-label="Next" disabled={active===count-1} onClick={()=>api.current.next()}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
   </button>
  </div>}
  <p className={styles.live} aria-live="polite" aria-atomic="true">{announce}</p>
 </section>;
});
export default FlexCarousel;
