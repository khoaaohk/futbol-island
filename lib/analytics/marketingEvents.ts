/**
 * Marketing page stats, browser side (Nov 3 2026). Mounted once by components/learn/PageStats.tsx on the tour page at `/`.
 * Ids and privacy rules: lib/analytics/marketingIds.ts. Everything is a tracker count() (a map increment that rides the next
 * beat of the existing visit counter): no request of its own, no timer, no polling, no scroll listener, no re-render, nothing
 * read from the page but fixed data-* attributes, element ids and link paths. When the tracker is off (dev, DNT/GPC, bots,
 * preview, localhost) count() is a no-op, so this costs nothing but a few passive listeners and observers:
 *  - ONE capture-phase passive click listener (taps), one `toggle` (FAQ, phone menu), `playing` and `error` (media) on the page;
 *  - ONE IntersectionObserver on the page's sections (sections seen and scroll depth, read only when a section crosses a
 *    threshold) and ONE MutationObserver for the data-active / data-on marks the carousel, slideshow and friends steps
 *    already set; three buffered PerformanceObservers for the Web Vitals;
 *  - time on page from visibilitychange and pagehide (onPageHide runs before the tracker's last beat), never a clock.
 * Calm mode / reduced motion change nothing here: there is no animation and no work per frame.
 */
import {count as trackerCount,onPageHide} from './tracker';
import {readDeviceMarks} from './deviceMarks';
import {MAX_SEC10,MK_MAX,MK_PLAY_KEY as PLAY_KEY,MK_SCROLL,classifyReferrer,deviceOf,isMarketingId,timeBand,vitalBand} from './marketingIds';

type El={closest?:(sel:string)=>El|null;getAttribute?:(n:string)=>string|null;hasAttribute?:(n:string)=>boolean;tagName?:string;id?:string;open?:boolean;
 parentElement?:El|null;querySelectorAll?:(sel:string)=>ArrayLike<El>;href?:string}|null;

/** The `mk:` id a tap on `target` stands for, or null. Pure (only closest/getAttribute/hasAttribute are used); exported for tests. */
export function clickId(target:unknown,origin:string):string|null{
 const el=target as El;if(!el||typeof el.closest!=='function')return null;
 const ok=(id:string)=>isMarketingId(id)?id:null;
 const tracked=el.closest('[data-track]')?.getAttribute?.('data-track');
 if(tracked&&tracked.startsWith('mk:'))return ok(tracked);
 if(el.closest('summary'))return null;// the FAQ and the phone menu count on `toggle`
 const on=(sel:string)=>!!el.closest!(sel);
 const btn=el.closest('button');
 if(btn){
  const playing=!!btn.hasAttribute?.('data-playing');
  if(on('[data-reel-prev]'))return ok('mk:c_reel_prev');
  if(on('[data-reel-next]'))return ok('mk:c_reel_next');
  if(on('[data-rv-btn]'))return ok(playing?'mk:c_reel_pause':'mk:c_reel_play');
  if(on('[data-sv-btn]'))return ok(playing?'mk:c_slide_pause_clip':'mk:c_slide_play');
  if(on('[data-mv-btn]'))return ok(playing?'mk:c_film_pause':'mk:c_film_play');
  if(on('[data-lv-btn]'))return ok(playing?'mk:c_clip_pause':'mk:c_clip_play');
  if(on('[data-dot]'))return ok('mk:c_slide_dot');
  if(on('[data-slides-toggle]'))return ok(btn.hasAttribute?.('data-paused')?'mk:c_slide_resume':'mk:c_slide_pause');
  if(on('[data-subnav]'))return ok('mk:c_play_nav');// the bar's Play (NavPlay) is a button
  return null;
 }
 const a=el.closest('a[href]');if(!a)return null;
 const raw=a.getAttribute?.('href')||'';
 if(raw.startsWith('#')){
  const id=raw.slice(1).replace(/-/g,'_');
  if(on('[data-menu]'))return ok('mk:c_menu_'+id);
  if(on('[data-sublinks]'))return ok('mk:c_nav_'+id);
  if(raw==='#in-action'&&on('#top'))return ok('mk:c_watch');
  return ok('mk:c_anchor');
 }
 let u:URL;try{u=new URL(raw,origin);}catch{return null;}
 if(u.origin!==origin)return ok(/(^|\.)(apps\.apple\.com|play\.google\.com)$/.test(u.hostname)?'mk:c_store':'mk:c_external');
 const p=u.pathname.replace(/\/+$/,'')||'/';
 if(p==='/play')return ok(on('#top')?'mk:c_play_hero':on('[aria-labelledby="end-h"]')?'mk:c_play_end':on('[data-subnav]')?'mk:c_play_nav':'mk:c_play_other');
 if(p==='/')return ok(on('[data-subnav]')?'mk:c_logo':'mk:c_home');
 if(p==='/privacy')return ok('mk:c_privacy');
 if(p==='/about')return ok('mk:c_about');
 if(p.startsWith('/learn/lessons'))return ok('mk:c_lessons');
 if(/grown|parent/.test(p))return ok('mk:c_grownups');
 return ok('mk:c_internal');
}

/** The section key an element stands for ('in-action' → in_action; the closing chapter has no id → end), or null. */
export function sectionKey(el:El):string|null{
 if(!el)return null;
 if(el.getAttribute?.('aria-labelledby')==='end-h')return 'end';
 const id=(el.id||'').replace(/-/g,'_');
 return id&&isMarketingId('mk:v_'+id)?id:null;
}

export type MkEnv={
 window:Pick<Window,'addEventListener'|'removeEventListener'|'innerHeight'|'scrollY'|'location'>&{matchMedia?:(q:string)=>{matches:boolean};screen?:{width:number;height:number}};
 document:Pick<Document,'addEventListener'|'removeEventListener'|'visibilityState'|'referrer'>&{documentElement:{scrollHeight:number}};
 root:HTMLElement;
 now:()=>number;
 count?:(id:string,n?:number)=>void;
 session?:Pick<Storage,'getItem'|'setItem'|'removeItem'>|null;
 local?:Pick<Storage,'getItem'>|null;
 IO?:typeof IntersectionObserver;MO?:typeof MutationObserver;PO?:typeof PerformanceObserver;
 /** Tests: a stand-in for tracker.onPageHide. */
 onPageHide?:(fn:()=>void)=>()=>void;
};

/** Start counting one view of the page. Returns stop() (also counts the view's time, as when leaving). */
export function watchMarketing(env:MkEnv):()=>void{
 const {window:w,document:d,root}=env,count=env.count??trackerCount,offs:(()=>void)[]=[];
 const done=new Set<string>();
 const once=(id:string)=>{if(done.has(id))return;done.add(id);count(id);};
 // ---- the view, its device, source and whether this device has played before ----
 count('mk:view');
 try{once('mk:d_'+deviceOf(!!w.matchMedia?.('(pointer: coarse)').matches,Math.min(w.screen?.width??1e4,w.screen?.height??1e4)));}catch{}
 try{const r=classifyReferrer(d.referrer,w.location.hostname,w.location.search);once('mk:src_'+r.src);if(r.ref)once('mk:ref_'+r.ref);}catch{}
 try{const m=readDeviceMarks(env.local??null);if(m)once(m.returning?'mk:ret_yes':'mk:ret_no');}catch{}

 // ---- time on page: foreground ms from visibility, booked when hidden / left ----
 let fg=0,since:number|null=d.visibilityState==='visible'?env.now():null,booked=0,firstStint=false,vitalsDone=false;
 const settle=()=>{if(since!==null){fg+=Math.max(0,env.now()-since);since=null;}
  const units=Math.min(MAX_SEC10,Math.round(fg/10_000));if(units>booked){count('mk:sec10',units-booked);booked=units;}
  if(fg>=10_000)once('mk:engaged');
  if(!firstStint){firstStint=true;once('mk:t_'+timeBand(fg));}
  scroll();vitals();};
 const onVis=()=>{if(d.visibilityState==='visible'){if(since===null)since=env.now();}else settle();};
 d.addEventListener('visibilitychange',onVis,{capture:true});offs.push(()=>d.removeEventListener('visibilitychange',onVis,{capture:true}));
 offs.push((env.onPageHide??onPageHide)(settle));

 // ---- taps (one passive capture listener) ----
 const origin=w.location.origin||`https://${w.location.hostname}`;
 const onClick=(e:Event)=>{const id=clickId(e.target,origin);if(!id)return;count(id);once('mk:engaged');
  if(id.startsWith('mk:c_play_')){once('mk:play');try{env.session?.setItem(PLAY_KEY,String(Date.now()));}catch{}}};
 d.addEventListener('click',onClick,{capture:true,passive:true});offs.push(()=>d.removeEventListener('click',onClick,{capture:true}));
 // FAQ questions and the phone menu: <details> toggles (the event does not bubble; capture reaches it).
 const onToggle=(e:Event)=>{const t=e.target as El;if(!t||!t.open)return;
  if(t.closest?.('[data-menu]')===t){count('mk:c_menu_open');once('mk:engaged');return;}
  const list=t.closest?.('[data-faq-list]');if(!list)return;
  const i=Array.prototype.indexOf.call(list.querySelectorAll?.('details')??[],t);if(i>=0&&i<MK_MAX.faq){once('mk:faq_'+(i+1));once('mk:engaged');}};
 root.addEventListener('toggle',onToggle,{capture:true,passive:true});offs.push(()=>root.removeEventListener('toggle',onToggle,{capture:true}));
 // Media: a clip really played; a picture or clip failed (error does not bubble; capture reaches it).
 const onPlaying=()=>once('mk:vid_ok');
 const onError=(e:Event)=>{const t=(e.target as El)?.tagName;if(t==='IMG')once('mk:err_img');else if(t==='VIDEO'||t==='SOURCE')once('mk:err_video');};
 root.addEventListener('playing',onPlaying,{capture:true,passive:true});root.addEventListener('error',onError,{capture:true,passive:true});
 offs.push(()=>{root.removeEventListener('playing',onPlaying,{capture:true});root.removeEventListener('error',onError,{capture:true});});
 try{for(const img of Array.from(root.querySelectorAll('img')))if(img.complete&&img.getAttribute('src')&&img.naturalWidth===0){once('mk:err_img');break;}}catch{}

 // ---- scroll depth (read only when a section crosses a threshold, and when leaving) ----
 function scroll(){
  const h=d.documentElement.scrollHeight;if(!h)return;
  const depth=Math.min(1,(w.scrollY+w.innerHeight)/h)*100;
  for(const s of MK_SCROLL)if(depth>=(s===100?98:s))once('mk:s'+s);
 }
 // ---- sections seen, and which card / slide / step was active while its section was seen ----
 const seen=new Set<string>();
 const activeIn=(sec:string)=>{
  const pick=(sel:string,attr:string,prefix:'rc'|'sl'|'fs',max:number)=>{const items=Array.from(root.querySelectorAll(sel));const i=items.findIndex(x=>x.hasAttribute(attr));if(i>=0&&i<max)once(`mk:${prefix}_${i+1}`);};
  if(sec==='in_action')pick('[data-reel-card]','data-active','rc',MK_MAX.rc);
  else if(sec==='more')pick('[data-slide]','data-active','sl',MK_MAX.sl);
  else if(sec==='together')pick('[data-step]','data-on','fs',MK_MAX.fs);
 };
 const IO=env.IO??(typeof IntersectionObserver!=='undefined'?IntersectionObserver:undefined);
 if(IO){
  const io=new IO(entries=>{
   for(const e of entries){if(!e.isIntersecting)continue;const k=sectionKey(e.target as unknown as El);if(!k||seen.has(k))continue;
    if(e.intersectionRect.height>=Math.min(e.boundingClientRect.height,w.innerHeight)*.5){seen.add(k);once('mk:v_'+k);activeIn(k);}}
   scroll();
  },{threshold:[0,.25,.5,.75,1]});
  for(const el of Array.from(root.querySelectorAll('section,#faq')))if(sectionKey(el as unknown as El))io.observe(el);
  offs.push(()=>io.disconnect());
 }
 const MO=env.MO??(typeof MutationObserver!=='undefined'?MutationObserver:undefined);
 if(MO){
  const mo=new MO(list=>{for(const m of list){const t=m.target as Element;if(!t.hasAttribute?.(m.attributeName||''))continue;
   if(t.hasAttribute('data-reel-card')&&seen.has('in_action'))activeIn('in_action');
   else if(t.hasAttribute('data-slide')&&seen.has('more'))activeIn('more');
   else if(t.hasAttribute('data-step')&&seen.has('together'))activeIn('together');}});
  mo.observe(root,{subtree:true,attributes:true,attributeFilter:['data-active','data-on']});
  offs.push(()=>mo.disconnect());
 }

 // ---- Core Web Vitals (buffered observers; booked once, at the first hide or leave) ----
 let lcp=0,cls=0,win=0,winStart=0,winLast=0,inp=0,vitalsOn=false;
 const PO=env.PO??(typeof PerformanceObserver!=='undefined'?PerformanceObserver:undefined);
 const observe=(type:string,fn:(list:PerformanceObserverEntryList)=>void,extra:Record<string,unknown>={})=>{
  if(!PO)return;try{const po=new PO(fn);po.observe({type,buffered:true,...extra} as PerformanceObserverInit);offs.push(()=>po.disconnect());if(type==='layout-shift')vitalsOn=true;}catch{}};
 observe('largest-contentful-paint',l=>{for(const e of l.getEntries())lcp=Math.max(lcp,e.startTime);});
 observe('layout-shift',l=>{for(const e of l.getEntries() as (PerformanceEntry&{value:number;hadRecentInput:boolean})[]){if(e.hadRecentInput)continue;
  if(win&&e.startTime-winLast<1000&&e.startTime-winStart<5000)win+=e.value;else{win=e.value;winStart=e.startTime;}winLast=e.startTime;cls=Math.max(cls,win);}});
 observe('event',l=>{for(const e of l.getEntries() as (PerformanceEntry&{interactionId?:number})[])if(e.interactionId)inp=Math.max(inp,e.duration);},{durationThreshold:40});
 function vitals(){if(vitalsDone)return;vitalsDone=true;
  if(lcp>0)once('mk:lcp_'+vitalBand('lcp',lcp));if(vitalsOn)once('mk:cls_'+vitalBand('cls',cls));if(inp>0)once('mk:inp_'+vitalBand('inp',inp));}

 return ()=>{settle();for(const f of offs.splice(0))try{f();}catch{}};
}
