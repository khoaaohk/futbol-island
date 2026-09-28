'use client';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createPlateCache,buildSpread,RIGHT_FLAT,LEFT_FLAT,rigidSurface,leafSurface,PAGE_W,PAGE_D,smooth,clamp01,type Spread,type Surface,type Beat} from '@/lib/books/popupEngine';
import {paintSheet,INK} from '@/lib/books/popupPlates';
import type {BookData} from '@/lib/books/types';
import {bookTracks} from '@/lib/books/useBookNarration';
import {genericSpread} from '@/lib/books/genericSpread';
import type {SpreadDef} from '@/lib/books/popupEngine';
import styles from './PlayerPopUpBook.module.css';

export type BookClock=()=>{time:number;duration:number;playing:boolean;cueIndex:number;cueCount:number};
type Props={book:BookData;bookId:string;spreads:Record<string,SpreadDef>;pageIndex:number;progress:number;onTurning?:(busy:boolean)=>void;clock:BookClock;narrationTime:number;narrationStarted:boolean;narrationPlaying:boolean;closing?:boolean;onClosed?:()=>void;label:string};
const OPEN_MS=2100,TURN_MS=3000,CLOSE_MS=600,ACTION_MS=900;
type Transition={kind:'open'|'close'|'turn';start:number;dur:number;from?:number;to?:number;forward?:boolean;done?:()=>void};

function coverArt(title:string,subtitle:string){return paintSheet(PAGE_W+.1,PAGE_D+.2,110,k=>{
 const w=PAGE_W+.1,h=PAGE_D+.2;k.fill(`M0 0 L${w} 0 L${w} ${h} L0 ${h} Z`,INK.navy);k.dots(`M0 0 L${w} 0 L${w} ${h} L0 ${h} Z`,INK.blue,.06,(x,y)=>.2+.25*Math.sin(x*.9+y*.4));
 k.fill(`M.35 .35 L${w-.35} .35 L${w-.35} ${h-.35} L.35 ${h-.35} Z`,'rgba(0,0,0,0)');k.key(`M.35 .35 L${w-.35} .35 L${w-.35} ${h-.35} L.35 ${h-.35} Z`,.03,INK.yellow);
 k.text(title.toUpperCase(),w/2+.05,2.02,1.3,INK.pink,{max:w-.9});k.text(title.toUpperCase(),w/2,1.98,1.3,INK.yellow,{max:w-.9});
 k.text(subtitle.toUpperCase(),w/2,2.62,.3,INK.white,{max:w-1});
 const cx=w/2,cy=4.3;k.fill(`M${cx-1.4} ${cy+1.1} L${cx+1.4} ${cy+1.1} L${cx+1.1} ${cy-1.2} L${cx-1.1} ${cy-1.2} Z`,INK.sky,.9);k.dots(`M${cx-1.4} ${cy+1.1} L${cx+1.4} ${cy+1.1} L${cx+1.1} ${cy-1.2} L${cx-1.1} ${cy-1.2} Z`,INK.navy,.05,.3);
 k.fill(`M${cx} ${cy} m-.55 0 a.55 .55 0 1 0 1.1 0 a.55 .55 0 1 0 -1.1 0`,INK.white);k.key(`M${cx} ${cy} m-.55 0 a.55 .55 0 1 0 1.1 0 a.55 .55 0 1 0 -1.1 0`,.04);k.keyFill(`M${cx-.2} ${cy-.12} L${cx+.2} ${cy-.12} L${cx+.26} ${cy+.14} L${cx} ${cy+.3} L${cx-.26} ${cy+.14} Z`);
 k.text('A FUTBOL ISLAND POP-UP STORY',w/2,h-.62,.2,INK.yellow,{weight:800,max:w-1});
},INK.navy);}
function edgeArt(){return paintSheet(2,.3,256,k=>{for(let i=0;i<22;i++){const y=i*.3/22;k.fill(`M0 ${y} L2 ${y} L2 ${y+.006} L0 ${y+.006} Z`,i%3?'#d9ccb0':'#c4b490');}},'#f1e7cf');}

/** The pop-up book: one lazy WebGL context. Frames are drawn only while paper is moving
 * (open/turn/close/action), while Coach Bella is speaking, or once after a seek/resize. */
export default function PlayerBookScene(props:Props){
 const host=useRef<HTMLDivElement>(null),live=useRef(props);live.current=props;
 const api=useRef<{wake:()=>void;goto:(i:number)=>void;close:(done:()=>void)=>void}|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=host.current;if(!el)return;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
  const phone=Math.min(innerWidth,innerHeight)<600;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,phone?2:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=true;
  renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.5,80);
  scene.add(new THREE.HemisphereLight(0xfff6e8,0xcbbd9c,2.2));
  const sun=new THREE.DirectionalLight(0xfff1dc,1.55);sun.position.set(-4.5,11,7.5);sun.castShadow=true;sun.shadow.mapSize.set(phone?1024:2048,phone?1024:2048);
  Object.assign(sun.shadow.camera,{left:-7,right:7,top:6,bottom:-6,near:1,far:30});sun.shadow.bias=-.0006;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun,sun.target);
  const cache=createPlateCache(phone?112:150),disposables:{dispose:()=>void}[]=[];
  const track=<T extends {dispose:()=>void}>(x:T)=>{disposables.push(x);return x;};
  const tex=(c:HTMLCanvasElement)=>{const t=track(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
  // Book body: cloth boards, page blocks with printed edges, the gutter and two page sheets.
  const cloth=track(new THREE.MeshLambertMaterial({color:0x2b4a86})),clothDark=track(new THREE.MeshLambertMaterial({color:0x1f3668}));
  const edgeTex=tex(edgeArt());edgeTex.wrapS=edgeTex.wrapT=THREE.RepeatWrapping;const edge=track(new THREE.MeshLambertMaterial({map:edgeTex}));
  // The cover sits on the board's underside, which faces the reader only while the book is closed (board turned over the
  // spine), so the print is turned half a circle to read upright.
  const coverTex=tex(coverArt(live.current.book.title,live.current.book.subtitle));coverTex.center.set(.5,.5);coverTex.rotation=Math.PI;
  const coverMat=track(new THREE.MeshLambertMaterial({map:coverTex}));
  const BLOCK=.24,BOARD=.07;
  const block=(side:1|-1,cover?:THREE.Material)=>{const g=new THREE.Group();
   const b=new THREE.Mesh(track(new THREE.BoxGeometry(PAGE_W+.02,BLOCK,PAGE_D+.02)),[edge,edge,edge,edge,edge,edge]);b.position.set(side*(PAGE_W/2+.01),-BLOCK/2-.004,0);b.receiveShadow=true;g.add(b);
   const board=new THREE.Mesh(track(new THREE.BoxGeometry(PAGE_W+.22,BOARD,PAGE_D+.34)),[cloth,cloth,cloth,cover??cloth,cloth,cloth]);board.position.set(side*(PAGE_W/2+.1),-BLOCK-BOARD/2-.004,0);board.receiveShadow=true;g.add(board);
   return g;};
  const pageGeo=(side:1|-1)=>{const g=track(new THREE.PlaneGeometry(PAGE_W,PAGE_D));g.rotateX(-Math.PI/2);g.translate(side*PAGE_W/2,0,0);return g;};
  const rightMat=track(new THREE.MeshLambertMaterial({color:0xffffff})),leftMat=track(new THREE.MeshLambertMaterial({color:0xffffff}));
  const rightPage=new THREE.Mesh(pageGeo(1),rightMat);rightPage.receiveShadow=true;scene.add(rightPage,block(1));
  const leftBlock=new THREE.Group();const leftPage=new THREE.Mesh(pageGeo(-1),leftMat);leftPage.receiveShadow=true;leftBlock.add(leftPage,block(-1,coverMat));scene.add(leftBlock);
  const spine=new THREE.Mesh(track(new THREE.CylinderGeometry(.19,.19,PAGE_D+.34,20,1,true,Math.PI/2,Math.PI)),clothDark);spine.rotation.x=Math.PI/2;spine.position.y=-BLOCK-.06;scene.add(spine);
  const shade=document.createElement('canvas');shade.width=shade.height=128;{const c=shade.getContext('2d')!,g=c.createRadialGradient(64,64,10,64,64,64);g.addColorStop(0,'rgba(10,30,50,.42)');g.addColorStop(.7,'rgba(10,30,50,.16)');g.addColorStop(1,'rgba(10,30,50,0)');c.fillStyle=g;c.fillRect(0,0,128,128);}
  const floor=new THREE.Mesh(track(new THREE.PlaneGeometry(15,10)),track(new THREE.MeshBasicMaterial({map:tex(shade),transparent:true,depthWrite:false})));floor.rotation.x=-Math.PI/2;floor.position.y=-BLOCK-BOARD-.02;scene.add(floor);
  // The turning leaf: one curling sheet, printed on both sides.
  const NX=26,NZ=6,leafPos=new THREE.BufferAttribute(new Float32Array((NX+1)*(NZ+1)*3),3),idx:number[]=[],uvF:number[]=[],uvB:number[]=[];
  for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){uvF.push(i/NX,1-j/NZ);uvB.push(1-i/NX,1-j/NZ);}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const leafGeo=(uv:number[])=>{const g=track(new THREE.BufferGeometry());g.setAttribute('position',leafPos);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return g;};
  const leafFrontMat=track(new THREE.MeshLambertMaterial({side:THREE.FrontSide})),leafBackMat=track(new THREE.MeshLambertMaterial({side:THREE.BackSide}));
  const gF=leafGeo(uvF),gB=leafGeo(uvB);const leafF=new THREE.Mesh(gF,leafFrontMat),leafB=new THREE.Mesh(gB,leafBackMat);
  for(const m of [leafF,leafB]){m.castShadow=true;m.receiveShadow=true;m.visible=false;m.frustumCulled=false;scene.add(m);}
  const v2=new THREE.Vector2();
  const shapeLeaf=(s:Surface)=>{for(let i=0;i<=NX;i++){const u=i/NX*PAGE_W;s.point(u,v2);const a=s.angle(u),nx=-Math.sin(a)*s.lift,ny=Math.cos(a)*s.lift;for(let j=0;j<=NZ;j++){const k=j*(NX+1)+i;leafPos.setXYZ(k,v2.x+nx,v2.y+ny,-PAGE_D/2+j/NZ*PAGE_D);}}leafPos.needsUpdate=true;gF.computeVertexNormals();gB.setAttribute('normal',gF.getAttribute('normal'));};

  // Spreads: current + at most one prepared neighbour.
  const spreads=new Map<number,Spread>();
  const ensure=(i:number)=>{let s=spreads.get(i);if(!s){const id=live.current.book.pages[i].id;const page=live.current.book.pages[i],t0=performance.now();s=buildSpread(live.current.spreads[id]??genericSpread(live.current.bookId,page,i),cache);el.dataset.buildMs=String(Math.round(performance.now()-t0));spreads.set(i,s);scene.add(s.group);}return s;};
  const trim=(keep:number[])=>{for(const [i,s] of spreads)if(!keep.includes(i)){s.dispose();spreads.delete(i);}};
  let shown=live.current.pageIndex,renderCount=0,raf=0,last=0,disposed=false,transition:Transition|null=null,prefetch=0,closed=false;
  const lastBeat=new Map<number,Beat>(),rest=(s?:Spread):Beat=>({t:s?.rest??0,duration:0,action:0,playing:false,narrated:false});
  let action=live.current.progress,actionFrom=action,actionTo=action,actionStart=0;
  // Set when the reader taps the page action while Coach Bella isn't speaking (e.g. after the story has finished). The pose
  // then comes from the page's rest moment plus the tap, so the action visibly plays and undoes; posing it at the end of the
  // narration made the tap look dead, because the narration had already performed the action.
  let tapped=false;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beatFor=(i:number):Beat=>{
   const p=live.current,c=p.clock(),id=live.current.book.pages[i].id,dur=c.duration||0;
   if(c.playing)tapped=false;
   if(i!==shown||!p.narrationStarted||(tapped&&i===shown))return {t:spreads.get(i)?.rest??0,duration:dur,action:i===shown?action:0,playing:false,narrated:false};
   let t=c.playing?c.time:p.narrationTime;
   if(reduced()){const cs=bookTracks(p.bookId)[id]?.cues??[];const cur=cs.findLast(q=>t>=q.start);if(cur)t=cur.start+cur.duration;}
   return {t,duration:dur,action,playing:c.playing,narrated:true};
  };
  const fit=()=>{
   const r=el.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),aspect=w/h;renderer.setSize(w,h,false);camera.aspect=aspect;
   const portrait=clamp01((1.25-aspect)/.55),e=THREE.MathUtils.degToRad(THREE.MathUtils.lerp(27,46,portrait));
   const dir=new THREE.Vector3(0,Math.sin(e),Math.cos(e)),v=new THREE.Vector3();
   const apex=[-PAGE_D/2,0,PAGE_D/2].map(z=>new THREE.Vector3(0,PAGE_W*.97,z));
   // The canvas runs up behind the chapter title so turning pages and tall paper never clip;
   // the resting book is framed in the band below the title.
   // Desktop: the resting book may use more of the frame; a turning page may rise briefly behind the chapter title.
   const wide=aspect>1.25&&w>=900;
   const title=el.closest('[data-player-book]')?.querySelector('[data-chapter-line]')?.getBoundingClientRect(),reserve=title?Math.max(0,title.bottom-r.top+6):0,ybot=wide?.99:.95,ytop=Math.min(.95,1-2*reserve/h),yc=(ytop-ybot)/2,span=(ytop+ybot)/2;
   /** Fit the spread out to ±xr (world x) in view; returns the camera target and distance. */
   const solve=(xr:number)=>{
    const pts:THREE.Vector3[]=[new THREE.Vector3(0,3.1,-3.1)];for(const x of [-xr,xr]){pts.push(new THREE.Vector3(x,-BLOCK-BOARD,PAGE_D/2+.2),new THREE.Vector3(x,0,-PAGE_D/2-.1),new THREE.Vector3(Math.sign(x)*Math.min(Math.abs(x),4.4),3.1,-1.55),new THREE.Vector3(x*.8,2.2,1.2));}
    const target=new THREE.Vector3(0,.9,0);
    const bounds=(d:number)=>{camera.position.copy(target).addScaledVector(dir,d);camera.lookAt(target);camera.updateMatrixWorld();camera.updateProjectionMatrix();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,top=-1e9;for(const p of pts){v.copy(p).project(camera);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}for(const p of apex){v.copy(p).project(camera);top=Math.max(top,v.y);}return {x0,x1,y0,y1,top};};
    let hi=90;for(let pass=0;pass<3;pass++){let lo=4;hi=90;for(let i=0;i<30;i++){const mid=(lo+hi)/2,b=bounds(mid);if(Math.max(-b.x0,b.x1)>(wide?.985:.97)||Math.max(yc-b.y0,b.y1-yc)>span||b.top>(wide?1.12:.985))lo=mid;else hi=mid;}const b=bounds(hi);
     // Re-centre vertically on the actual projected book.
     const dy=(b.y0+b.y1)/2-yc;target.y+=dy*Math.tan(camera.fov*Math.PI/360)*hi*.9;}
    return {target,dist:hi};
   };
   // Narrow screens: the whole spread is framed when the scene is not focused on one page (so every printed
   // title is visible), and the camera eases in to a single page only while a narration beat focuses on it.
   const full=solve(PAGE_W+.25),zoom=portrait>0?solve(PAGE_W+.25-portrait*1.9):full;
   view.dir.copy(dir);view.full=full;view.zoom=zoom;view.pan=portrait*1.9;aim(view.focus);
   draw();
  };
  const view={dir:new THREE.Vector3(),full:{target:new THREE.Vector3(),dist:10},zoom:{target:new THREE.Vector3(),dist:10},pan:0,focus:0};
  const aimTarget=new THREE.Vector3();
  const aim=(f:number)=>{view.focus=f;const k=smooth(Math.min(1,Math.abs(f))),dist=view.full.dist+(view.zoom.dist-view.full.dist)*k;aimTarget.lerpVectors(view.full.target,view.zoom.target,k);aimTarget.x=f*view.pan;camera.position.copy(aimTarget).addScaledVector(view.dir,dist);camera.lookAt(aimTarget);};
  const draw=()=>{if(disposed||document.hidden)return;renderer.render(scene,camera);el.dataset.renderCount=String(++renderCount);el.dataset.drawCalls=String(renderer.info.render.calls);el.dataset.textures=String(renderer.info.memory.textures);el.dataset.triangles=String(renderer.info.render.triangles);};
  const setLeaf=(front?:THREE.Texture,back?:THREE.Texture)=>{leafFrontMat.map=front??null;leafBackMat.map=back??null;leafFrontMat.needsUpdate=leafBackMat.needsUpdate=true;};
  const setPages=(left:THREE.Texture,right:THREE.Texture)=>{if(leftMat.map!==left){leftMat.map=left;leftMat.needsUpdate=true;}if(rightMat.map!==right){rightMat.map=right;rightMat.needsUpdate=true;}};
  const hideAllBut=(vis:Spread[])=>{for(const s of spreads.values())s.group.visible=vis.includes(s);};
  /** Lay out every paper part for the current moment. */
  const compose=(now:number)=>{
   if(actionStart){const k=Math.min(1,(now-actionStart)/ACTION_MS);action=actionFrom+(actionTo-actionFrom)*smooth(k);if(k>=1)actionStart=0;}
   // Once closed the book stays shut: without this the last frame (after the close transition ends) snapped back to the open
   // spread for a moment before the reader faded, flashing the pages under the cover.
   const tr=transition??(closed?{kind:'close' as const,start:-1,dur:1}:null);const k=tr?clamp01((now-tr.start)/tr.dur):1;
   if(!tr){const s=ensure(shown);hideAllBut([s]);setPages(s.leftTex,s.rightTex);leftBlock.rotation.z=0;leafF.visible=leafB.visible=false;const b=beatFor(shown);lastBeat.set(shown,b);const f=s.pose(b);aim(typeof f==='number'?f:0);s.place({surface:LEFT_FLAT,back:true},{surface:RIGHT_FLAT,back:false},1);return;}
   if(tr.kind==='open'||tr.kind==='close'){
    const s=ensure(shown);hideAllBut([s]);setPages(s.leftTex,s.rightTex);leafF.visible=leafB.visible=false;
    const e=tr.kind==='open'?easeOpen(k):1-easeOpen(k),tau=Math.PI*e;leftBlock.rotation.z=tau-Math.PI;
    // The paper scenery folds flat before the cover reaches it (flat by the time the cover is ~36° from shut) and is hidden
    // from there: standing pieces used to poke through the closing cover, and flattened backdrops stuck out past the
    // book's far edge once it was shut. Opening mirrors this (scenery appears flat, then unfolds).
    const pop=smooth(clamp01((e-.2)/.8));s.group.visible=e>.2;
    s.pose(beatFor(shown));aim(0);s.place({surface:rigidSurface(tau),back:true},{surface:RIGHT_FLAT,back:false},pop);return;}
   // Turning: the leaf is the right page of the left spread and the left page of the right spread.
   const L=ensure(tr.forward?tr.from!:tr.to!),R=ensure(tr.forward?tr.to!:tr.from!);hideAllBut([L,R]);leftBlock.rotation.z=0;
   const e=easeTurn(k),a=Math.PI*(tr.forward?e:1-e);
   const curl=(tr.forward?-1:1)*.95*Math.sin(a)*Math.min(1,k*4,(1-k)*4+.2);
   const leaf=leafSurface(a,curl);shapeLeaf(leaf);leafF.visible=leafB.visible=true;setLeaf(L.rightTex,R.leftTex);setPages(L.leftTex,R.rightTex);
   aim(view.focus*(1-smooth(k*3)));const fromS=tr.forward?L:R,toS=tr.forward?R:L;fromS.pose(lastBeat.get(tr.from!)??rest(fromS));toS.pose(rest(toS));
   // Choreography: the old scenery folds away first (layer by layer), the page sweeps, then the new scene unfolds.
   const fold=1-smooth(k/.3),unfold=smooth((k-.6)/.4);
   const openL=Math.min((Math.PI-a)/Math.PI,tr.forward?fold:unfold),openR=Math.min(a/Math.PI,tr.forward?unfold:fold);
   L.place({surface:LEFT_FLAT,back:true},{surface:leaf,back:false},openL);
   R.place({surface:leaf,back:true},{surface:RIGHT_FLAT,back:false},openR);
  };
  const busy=()=>!!transition||!!actionStart||(live.current.narrationPlaying&&!reduced());
  const tick=(now:number)=>{raf=0;if(disposed||document.hidden)return;
   const fps=transition||actionStart?60:30;if(last&&now-last<1000/fps-3){raf=requestAnimationFrame(tick);return;}last=now;
   compose(now);
   if(transition&&now-transition.start>=transition.dur){const done=transition.done;transition=null;el.dataset.transition='idle';compose(now);done?.();live.current.onTurning?.(false);schedulePrefetch();}
   draw();if(busy())raf=requestAnimationFrame(tick);else last=0;};
  const wake=()=>{if(!raf&&!disposed&&!document.hidden)raf=requestAnimationFrame(tick);};
  const begin=(t:Transition)=>{if(transition){const done=transition.done;transition=null;done?.();}
   if(reduced()){t.done?.();compose(performance.now());draw();live.current.onTurning?.(false);schedulePrefetch();return;}
   transition=t;t.start=performance.now();el.dataset.transition='moving';live.current.onTurning?.(true);wake();};
  const schedulePrefetch=()=>{cancelPrefetch();const run=()=>{prefetch=0;if(disposed||transition)return;const next=shown+1<live.current.book.pages.length?shown+1:-1;trim(next>=0?[shown,next]:[shown]);if(next>=0&&!spreads.has(next)){ensure(next).group.visible=false;}};
   const w=window as Window&{requestIdleCallback?:(f:()=>void,o?:{timeout:number})=>number};prefetch=w.requestIdleCallback?w.requestIdleCallback(run,{timeout:1500}):window.setTimeout(run,400);};
  const cancelPrefetch=()=>{if(!prefetch)return;const w=window as Window&{cancelIdleCallback?:(n:number)=>void};if(w.cancelIdleCallback)w.cancelIdleCallback(prefetch);else clearTimeout(prefetch);prefetch=0;};
  api.current={
   wake:()=>{const p=live.current.progress;if(p!==actionTo){if(!live.current.narrationPlaying)tapped=true;actionFrom=action;actionTo=p;actionStart=reduced()?0:performance.now();if(reduced())action=p;}wake();},
   goto:i=>{if(i===shown)return;const from=shown,forward=i>from;cancelPrefetch();ensure(i);trim([from,i]);shown=i;tapped=false;action=live.current.progress;actionTo=action;actionStart=0;
    begin({kind:'turn',start:0,dur:TURN_MS,from,to:i,forward,done:()=>{trim([i]);}});},
   close:done=>{cancelPrefetch();closed=true;begin({kind:'close',start:0,dur:CLOSE_MS,done});},
  };
  const observer=new ResizeObserver(fit);observer.observe(el);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();};document.addEventListener('visibilitychange',visibility);
  fit();ensure(shown);begin({kind:'open',start:0,dur:OPEN_MS});
  return()=>{disposed=true;cancelAnimationFrame(raf);cancelPrefetch();observer.disconnect();document.removeEventListener('visibilitychange',visibility);api.current=null;
   for(const s of spreads.values())s.dispose();spreads.clear();cache.dispose();disposables.forEach(d=>d.dispose());sun.shadow.map?.dispose();
   renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();live.current.onTurning?.(false);};
 },[]);
 const p=props;
 useEffect(()=>{api.current?.goto(p.pageIndex);},[p.pageIndex]);
 useEffect(()=>{api.current?.wake();},[p.progress,p.narrationTime,p.narrationPlaying,p.narrationStarted]);
 useEffect(()=>{if(p.closing)api.current?(api.current.close(()=>live.current.onClosed?.())):live.current.onClosed?.();},[p.closing]);
 return <div ref={host} className={styles.scene3d} data-book-scene={p.book.pages[p.pageIndex].id} data-render-count="0" data-transition="idle" role="img" aria-label={p.label}>{failed&&<p className={styles.sceneFallback}>The pop-up scene could not load. You can still read every chapter and try its football lesson below.</p>}</div>;
}
/** Book opening: the cover lifts slowly, swings, then settles flat. */
function easeOpen(k:number){return k<.12?0:smooth((k-.12)/.88);}
/** Turn choreography: lift (scenery folds), sweep across, settle (next scene unfolds). */
function easeTurn(k:number){if(k<.34)return .34*smooth(k/.34)*.62;if(k<.66)return .2108+(.78-.2108)*smooth((k-.34)/.32);return .78+.22*smooth((k-.66)/.34);}
