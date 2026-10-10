'use client';
/**
 * Title screen → game: the water-loader hand-off (user, Oct 9 2026: "a loading button that fills up like water", then the pink slides
 * down, the island items shrink, the tan sand expands to fill the screen, and the game appears from that tan; no second loader).
 *
 *  1. TitleActions fades the links and other buttons (CSS, [data-launch] on the screen) and the gold pill fills with water.
 *  2. waitForGame(): real loading. The game's code (components/root/gameLoader.ts: Town and its whole module graph) is
 *     imported now (usually already prefetched on idle), and the island is built off screen (islandPreload.ts warmIsland: started at
 *     Start for a new player, at Play otherwise), so the water rises while that happens, and is full when it is done. Until then the level follows
 *     a believable eased curve that never reaches the top; a slow network keeps it rising slowly, never stalling at a fake 100 %.
 *  3. runTanExit(): pill out, pink slides down, island items / characters / props hop away (the loader's own exit motions), then the
 *     island's sand expands to cover the screen (the loader's tan-wipe maths).
 *  4. The caller marks <html data-island-handoff="tan"> (or sessionStorage for a full reload) and `/` switches to the game in place
 *     (enterGame, lib/rootView.ts). The game's
 *     IslandLoading starts as that same plain tan sheet and fades into the island when it is ready (components/IslandLoading.*).
 * Heat: nothing runs before Play; while loading, one rAF loop moves the water (it ends when full) and one CSS wave loop runs
 * (removed with the button); the exit is one-shot WAAPI (transform/opacity); nothing is left running after the hand-off.
 */
import {loadGame} from '../root/gameLoader';
import {islandWarmSettled} from '../root/islandPreload';
export const TAN='#dfc587';
export const HANDOFF_KEY='fi2-island-handoff';
export const markTanHandoff=()=>{document.documentElement.dataset.islandHandoff='tan';};
export const markTanReload=()=>{try{sessionStorage.setItem(HANDOFF_KEY,'tan');}catch{/* the reload then shows the normal loader */}};

/** The water level over time before the game is ready: rises fast, then slows, and stays below `cap`. */
export const waitingLevel=(ms:number,cap=.9)=>cap*(1-Math.exp(-ms/900));
/** Next water level: eases toward the target; once ready it fills to the top (never faster than `minMs` in total). */
export function nextLevel(level:number,ms:number,dt:number,ready:boolean,minMs=1100){
 const target=ready&&ms>=minMs?1:Math.min(ready?1:.9,waitingLevel(ms));
 return Math.min(1,level+(target-level)*Math.min(1,dt*5));
}

/** Load the game's code (shared with RootSwitch, which renders it) and let the island warm-up finish (components/root/
 *  islandPreload.ts: Play starts it if Start had not already). Resolves when both are done, or after `timeoutMs` (RootSwitch then
 *  shows the island loader until the code arrives, and Town finishes any unbuilt slices itself). */
export function waitForGame(timeoutMs=20000):Promise<void>{
 return Promise.race([loadGame().then(()=>islandWarmSettled()),new Promise<void>(r=>setTimeout(r,timeoutMs))]);
}

/** Rise the water in `fill` (translateY from 100 % to 0) until the game is ready. Resolves when full. */
export function runWaterFill(fill:HTMLElement,{reduced=false,onLevel}:{reduced?:boolean;onLevel?:(l:number)=>void}={}):Promise<void>{
 let ready=false;void waitForGame().then(()=>{ready=true;});
 return new Promise(resolve=>{
  let level=0,start=0,last=0,shown=-1;
  const paint=()=>{fill.style.transform=`translateY(${((1-level)*100).toFixed(2)}%)`;const pct=Math.round(level*10)*10;if(pct!==shown){shown=pct;onLevel?.(pct);}};
  const frame=(t:number)=>{if(!start)start=last=t;const dt=Math.min(.05,(t-last)/1000);last=t;
   level=reduced&&ready?1:nextLevel(level,t-start,dt,ready);paint();
   if(level>=.999){level=1;paint();resolve();return;}
   requestAnimationFrame(frame);};
  requestAnimationFrame(frame);
 });
}

/** The loader's castAway: a hop, then a quick shrink; fully opaque until the last moment, so nothing ghosts over the background. */
const hopAway=(el:Element,delay:number)=>(el as HTMLElement).animate([
 {transform:'none',opacity:1},{transform:'translateY(-6%) scale(1.06)',opacity:1,offset:.35},{transform:'translateY(2%) scale(.45)',opacity:1,offset:.8},{transform:'translateY(4%) scale(.2)',opacity:0}],{
 delay,duration:280,easing:'ease-in',fill:'forwards'});
/** The loader's itemBounceAway: a little lift and squash, then gone. SVG items scale about their own box. */
const bounceAway=(el:SVGElement|HTMLElement,delay:number)=>{el.style.transformBox='fill-box';el.style.transformOrigin='center';
 return el.animate([{transform:'scale(1)',opacity:1},{transform:'translateY(-5px) scale(1.13)',opacity:1,offset:.28},{transform:'translateY(2px) scale(.94)',opacity:1,offset:.48},{transform:'translateY(5px) scale(0)',opacity:0}],{
  delay,duration:340,easing:'ease-in-out',fill:'forwards'});};

/** Steps 3: resolves when the screen is fully tan (a fixed tan sheet covers it). */
export async function runTanExit(screen:HTMLElement,pill:HTMLElement|null,{reduced=false}={}):Promise<void>{
 const q=<E extends Element=HTMLElement>(s:string)=>screen.querySelector<E>(s),qa=(s:string)=>[...screen.querySelectorAll<HTMLElement>(s)];
 const land=q<SVGPathElement>('[data-x="island"] path[fill="#DFC587"]');
 const sheet=document.createElementNS('http://www.w3.org/2000/svg','svg');
 sheet.setAttribute('aria-hidden','true');sheet.setAttribute('data-tan-sheet','');sheet.setAttribute('preserveAspectRatio','none');
 Object.assign(sheet.style,{position:'fixed',zIndex:'40',pointerEvents:'none',overflow:'visible'});
 const vw=innerWidth,vh=innerHeight;
 if(reduced||!land){
  Object.assign(sheet.style,{inset:'0',width:'100%',height:'100%',background:TAN,opacity:'0'});screen.appendChild(sheet);
  await sheet.animate([{opacity:0},{opacity:1}],{duration:reduced?240:400,fill:'forwards'}).finished.catch(()=>{});return;}
 if(pill)pill.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.94)'}],{duration:260,easing:'ease-in',fill:'forwards'});
 // Pink slides down and away; the far hills and the sky's sun / star / sea glints leave.
 // The dark hills ride down WITH the pink (same move): the hill band has a flat bottom that only the pink covers, so it must never
 // be left behind uncovered (Oct 9 2026 fix: a dark rectangle showed when the hills only faded).
 // Quicker (user, Oct 9 2026: "the grass and white thing is still showing, fade that out quicker"): the ground starts as the cast
 // lands its hop, slides faster and fades as it goes, so it's gone well before the sand expands.
 const slide=[{transform:'none',opacity:1},{transform:`translateY(${Math.round(vh*.35)}px)`,opacity:.6,offset:.5},{transform:`translateY(${Math.round(vh*.85)}px)`,opacity:0}],slideTiming:KeyframeAnimationOptions={delay:300,duration:420,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'};
 q('[data-x="near"]')?.animate(slide,slideTiming);q('[data-x="far"]')?.animate(slide,slideTiming);
 for(const el of qa('[data-x="glints"],[data-x="sun"],[data-x="star"]'))bounceAway(el,240);
 // Characters and props hop away first (the loader's castAway), before the ground moves, so they leave from where they stand.
 qa('[data-x="cast"]').forEach((el,i)=>hopAway(el,i*50));
 const props=q('[data-x="props"]');if(props)hopAway(props,40);
 const svg=land.ownerSVGElement;
 const items=[...(svg?[...svg.children].filter(c=>c!==land&&c.getAttribute('fill')!=='#78d7df'):[]),...qa('[data-x="island"] svg[data-item]')];
 const DELAYS=[280,420,70,210,0,140];
 // Staggered like the loader's, but compressed so every item is gone (≤ 200+252+340 ms) before the sand starts to expand (820 ms).
 items.forEach((el,i)=>bounceAway(el as SVGElement,200+DELAYS[i%DELAYS.length]*.6));
 // The sand expands to cover the screen (IslandLoading's tanWipe maths: centre, then 2× the screen).
 const r=land.getBoundingClientRect(),b=land.getBBox();
 sheet.setAttribute('viewBox',`${b.x} ${b.y} ${b.width} ${b.height}`);
 Object.assign(sheet.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`,transformOrigin:'50% 50%'});
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',land.getAttribute('d')??'');path.setAttribute('fill',TAN);sheet.appendChild(path);
 screen.appendChild(sheet);
 // Grow in place, outward in every direction (user, Oct 9 2026: "the tan needs to stretch out and fill in all directions"): scale about
 // the sand's own centre, enough that its inner blob (≈70% of the box) passes the farthest screen edge on each axis.
 const cx=r.left+r.width/2,cy=r.top+r.height/2,sx=2*Math.max(cx,vw-cx)/(r.width*.7),sy=2*Math.max(cy,vh-cy)/(r.height*.7),k=Math.max(sx,sy);
 await sheet.animate([{transform:'none'},{transform:`scale(${k})`}],
  {delay:820,duration:700,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'}).finished.catch(()=>{});
}
