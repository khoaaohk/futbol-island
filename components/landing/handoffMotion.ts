'use client';
/**
 * Title screen → game hand-off (Oct 9 2026; user: "blend what we have to make it more seamless").
 *
 * When Play is pressed, the title screen turns INTO the game's island loading screen, then the route switches to `/`, whose loader
 * starts in that very state:
 *   1. the For grown-ups / Privacy row fades and drops out (CSS, [data-exit]);
 *   2. the save actions / Play card fade and drop out, and the loader's track (`island-loading-track`) appears under the title;
 *   3. the pink ground slides down onto the loader's pink, the dark hills settle onto the loader's hills;
 *   4. the island, sun, star and cast shrink / settle onto where the loader draws them (each one FLIPs onto the measured rect of
 *      a hidden, already-settled <IslandLoading/> mounted behind the screen); leftover props hop away;
 *   5. that hidden loader cross-fades in over ~250 ms (only the hill shapes and the loader-only cast differ by then), and the
 *      route switches. Town's <IslandLoading/> mounts in the same settled state (the `data-island-handoff` flag on <html>, read by
 *      IslandLoading), with its track synced to the same timeline, so the first game frame equals the last title-screen frame.
 * Compositor-only: transform and opacity through the Web Animations API, run once; nothing loops; the flag is removed when the
 * game's loader starts its own exit. Reduced motion: one quick cross-fade.
 */
import {SPRING_EASE} from './motion';

/** sessionStorage key for the full-reload path (a restored save reloads into `/`): IslandLoading's inline script turns it into the
 *  same <html> flag before first paint. Shared with components/IslandLoading.tsx. */
export const HANDOFF_STORAGE_KEY='fi2-island-handoff';
/** The <html data-island-handoff> value is the document-timeline time the loading track started (or "reload"). */
export function markHandoff():number|null{
 document.querySelector<HTMLElement>('[data-title-scene]')?.setAttribute('data-exit','');
 const t=document.timeline?.currentTime;const start=typeof t==='number'?Math.round(t):null;
 document.documentElement.dataset.islandHandoff=start===null?'1':String(start);
 // The title screen's own track runs on the same clock, so the cross-fade onto the loader's track never jumps.
 if(start!==null)document.querySelector('[data-landing-track]>span')?.getAnimations().forEach(a=>{a.startTime=start;});
 return start;
}
export function markReloadHandoff(){try{sessionStorage.setItem(HANDOFF_STORAGE_KEY,'1');}catch{/* the reload just plays the normal loader */}}

type Rect={left:number;top:number;width:number;height:number};
const rectOf=(el:Element|null|undefined):Rect|null=>{if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0?r:null;};
/** Animate `el` (transform-origin 0 0) so its sub-rect `from` lands on `to`. `uniform` keeps the aspect (scale by width). */
function flipOnto(el:HTMLElement,from:Rect,to:Rect,{delay=0,duration=640,easing=SPRING_EASE,uniform=false,translateOnly=false}={}){
 const box=el.getBoundingClientRect();
 let sx=translateOnly?1:to.width/from.width,sy=translateOnly?1:to.height/from.height;if(uniform)sy=sx;
 const dx=to.left-box.left-sx*(from.left-box.left),dy=to.top-box.top-sy*(from.top-box.top);
 el.style.transformOrigin='0 0';
 return el.animate([{transform:'none'},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`}],{delay,duration,easing,fill:'forwards'});
}
const away=(el:Element,delay:number)=>(el as HTMLElement).animate([{transform:'none',opacity:1},{transform:'translateY(6%) scale(.2)',opacity:0}],{delay,duration:380,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
const fade=(el:Element,delay:number,duration=300)=>(el as HTMLElement).animate([{opacity:1},{opacity:0}],{delay,duration,fill:'forwards'});

/** The settled loader's pieces (the visible art SVG: mobile or wide). */
function loaderTargets(loader:HTMLElement){
 const art=[...loader.querySelectorAll('svg')].find(s=>s.querySelector('[data-loading-tan-land]')&&s.getBoundingClientRect().width>0);
 const title=loader.querySelector('h2');
 return {
  eyebrow:rectOf(title?.parentElement?.firstElementChild),
  land:rectOf(art?.querySelector('[data-loading-tan-land]')),
  sun:rectOf(art?.querySelector('circle[fill="#F9D55D"]')),
  star:rectOf(art?.querySelector('path[fill="#EF8FD0"][d^="M105"]')),
  dark:rectOf(art?.querySelector('path[fill="#153F43"]')),
  pink:rectOf(art?.querySelector('path[fill="#EF8FD0"][d^="M-"]')),
  // Each cast still is in the DOM once per layout group (portrait row / wide flanks); only the shown group's copy has a box.
  cast:(id:string)=>[...loader.querySelectorAll(`img[data-cast="${id}"]`)].map(rectOf).find(Boolean)??null,
 };
}

/** Runs steps 1–5 and resolves when the loader is fully shown (the caller then switches the route). */
export async function runHandoff(screen:HTMLElement,loaderWrap:HTMLElement,{reduced=false}={}):Promise<void>{
 screen.dataset.exit='';
 if(reduced){await loaderWrap.animate([{opacity:0},{opacity:1}],{duration:160,fill:'forwards'}).finished.catch(()=>{});return;}
 const loader=loaderWrap.querySelector<HTMLElement>('[data-main-island-loading]')??loaderWrap;
 const T=loaderTargets(loader),q=<E extends Element=HTMLElement>(s:string)=>screen.querySelector<E>(s);
 const runs:Animation[]=[];
 // 2. Title block: on wide screens the loader sets the title lower (top 30 %); move with it, the track rides along.
 const copy=q('[data-x="copy"]'),eyebrow=rectOf(copy?.firstElementChild);
 if(copy&&eyebrow&&T.eyebrow)runs.push(flipOnto(copy,eyebrow,T.eyebrow,{delay:180,duration:700,translateOnly:true,easing:'cubic-bezier(.3,1.08,.4,1)'}));
 // 3. Ground: pink slides down onto the loader's pink; the dark hills settle onto the loader's hills.
 const near=q('[data-x="near"]'),nearPath=rectOf(near?.querySelector('path'));
 if(near&&nearPath&&T.pink)runs.push(flipOnto(near,nearPath,T.pink,{delay:260,duration:620,translateOnly:true,easing:'cubic-bezier(.45,0,.25,1)'}));
 const far=q('[data-x="far"]'),farPath=rectOf(far?.querySelector('path'));
 if(far&&farPath&&T.dark)runs.push(flipOnto(far,farPath,T.dark,{delay:320,duration:620,translateOnly:true,easing:'cubic-bezier(.45,0,.25,1)'}));
 // 4. Island, sun and star settle onto the loader's; the cast steps into the loader's places; the rest hops away.
 const island=q('[data-x="island"]'),land=rectOf(island?.querySelector('path[fill="#DFC587"]'));
 if(island&&land&&T.land)runs.push(flipOnto(island,land,T.land,{delay:360,duration:700}));
 const sun=q<SVGSVGElement>('[data-x="sun"]'),sunDisc=rectOf(sun?.querySelector('circle'));
 if(sun&&sunDisc&&T.sun)runs.push(flipOnto(sun as unknown as HTMLElement,sunDisc,T.sun,{delay:400,duration:680}));
 const star=q<SVGSVGElement>('[data-x="star"]'),starShape=rectOf(star?.querySelector('path'));
 if(star&&starShape&&T.star)runs.push(flipOnto(star as unknown as HTMLElement,starShape,T.star,{delay:420,duration:680}));
 const glints=q('[data-x="glints"]');if(glints)runs.push(fade(glints,300));
 const props=q('[data-x="props"]');if(props)runs.push(away(props,300));
 screen.querySelectorAll<HTMLElement>('[data-x="cast"]').forEach((member,i)=>{
  const to=T.cast(member.dataset.castId??''),from=rectOf(member.querySelector('img'));
  runs.push(to&&from?flipOnto(member,from,to,{delay:440+i*70,duration:640}):away(member,330+i*60));
 });
 // 5. The settled loader fades in over what is now (almost) the same picture.
 const reveal=loaderWrap.animate([{opacity:0},{opacity:1}],{delay:900,duration:260,easing:'ease-in-out',fill:'forwards'});
 await reveal.finished.catch(()=>{});
}
