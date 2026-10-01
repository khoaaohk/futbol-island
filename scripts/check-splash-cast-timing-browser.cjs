// Splash cast timing: how long after the loading-screen title paints do the baked bean characters appear?
// Works against the dev server (:8092) or a production build (`next start -p 8093`, FUTBOL_BASE_URL=http://localhost:8093).
//
//   node scripts/check-splash-cast-timing-browser.cjs                      phone (390×844, 4× CPU) on Fast 3G and 4G + desktop, cold cache
//   node scripts/check-splash-cast-timing-browser.cjs --runs 3 --shots DIR  3 cold runs each; filmstrip PNGs into DIR
//   … --only phone-fast3g                                                   one profile
//
// Per run it records (all on the page clock, ms since navigation start):
//   text   = Element Timing render time of the brush title (font-display:block, so this is when the words show);
//   cast   = per visible character, the later of its image paint (Element Timing; else the chosen file's responseEnd —
//            Chrome skips Element Timing for an image first painted at opacity 0) and the moment its entrance animation
//            reaches half opacity (Web Animations startTime + delay + 30% of the duration);
//   visible= per character, entrance half in AND something painted (inline placeholder from the first frame, or the still);
//   sharp  = visible AND the full still has arrived;
//   gaps   = last character − title, and − FCP (background/art/eyebrow). Gate (exit 1): visible gaps ≤ 150 ms on both
//            throttled phone profiles; sharp gaps ≤ 150 ms on phone 4G (Fast 3G sharpening is reported: bandwidth-bound).
// Characters are "visible" only in the group the layout shows (portrait row vs wide flanks).
// Always --mute-audio; localStorage is seeded (audio off) before the first script runs.
const fs=require('node:fs'),path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('@playwright/test'));}
const {PNG}=require('pngjs');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i>=0?process.argv[i+1]:fallback;};
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const RUNS=Number(arg('runs','1')),SHOTS=arg('shots',''),ONLY=arg('only',''),LABEL=arg('label','run'),TARGET=Number(arg('target','150'));
// Chrome DevTools presets (throughput in bytes/s).
const NET={
 fast3g:{latency:562.5,downloadThroughput:1.6e6/8*.9,uploadThroughput:.75e6/8*.9},
 '4g':{latency:165,downloadThroughput:9e6/8*.9,uploadThroughput:1.5e6/8*.9},
 none:null,
};
const PROFILES=[
 {id:'phone-fast3g',viewport:{width:390,height:844},dpr:3,mobile:true,cpu:4,net:'fast3g',gate:true,sharpGate:false},
 {id:'phone-4g',viewport:{width:390,height:844},dpr:3,mobile:true,cpu:4,net:'4g',gate:true,sharpGate:true},
 {id:'desktop',viewport:{width:1440,height:900},dpr:2,mobile:false,cpu:1,net:'4g',gate:false},
].filter(p=>!ONLY||ONLY.split(',').includes(p.id));
const SEED={'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'};

/** Runs in the page before any of its scripts: tag the title and cast for Element Timing and collect entries. */
function instrument(seed){
 try{for(const [k,v] of Object.entries(seed))localStorage.setItem(k,v);}catch{}
 const S=window.__splashTiming={elements:[],paints:[],lcp:[]};
 const tag=root=>{for(const el of root.querySelectorAll?root.querySelectorAll('[data-main-island-loading] h2, [data-cast]'):[]){if(!el.hasAttribute('elementtiming'))el.setAttribute('elementtiming',el.tagName==='H2'?'splash-title':'cast-'+el.getAttribute('data-cast'));}};
 new MutationObserver(list=>{for(const m of list)for(const n of m.addedNodes)if(n.nodeType===1){tag(n.parentNode||n);}}).observe(document,{childList:true,subtree:true});
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())S.elements.push({id:e.identifier,name:e.name,url:(e.url||'').slice(0,60),renderTime:e.renderTime,loadTime:e.loadTime,w:e.intersectionRect?.width||0});}).observe({type:'element',buffered:true});}catch{}
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())S.paints.push({name:e.name,t:e.startTime});}).observe({type:'paint',buffered:true});}catch{}
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())S.lcp.push({t:e.startTime,size:e.size,url:(e.url||'').slice(0,60),id:e.id});}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
}

/** Collected after the splash has settled. */
function collect(){
 const S=window.__splashTiming,root=document.querySelector('[data-main-island-loading]');
 const visible=root?[...root.querySelectorAll('[data-cast]')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;}):[];
 const anims=document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.hasAttribute&&a.effect.target.hasAttribute('data-cast'));
 const cast=visible.map(el=>{const id=el.getAttribute('data-cast');const a=anims.find(x=>x.effect.target===el);const t=a?a.effect.getTiming():null;
  const entries=S.elements.filter(e=>e.id==='cast-'+id);const imgPaint=entries.filter(e=>!e.url.startsWith('data:')).map(e=>e.renderTime||e.loadTime).filter(Boolean);
  const animStart=a&&a.startTime!=null?a.startTime+(t.delay||0):null;
  // Fraction of the entrance at which opacity first reaches .5 (linear within the keyframe segment that crosses it).
  let half=.3;if(a){const k=a.effect.getKeyframes().map(f=>({o:f.offset,v:f.opacity==null?1:Number(f.opacity)}));for(let j=1;j<k.length;j++)if(k[j-1].v<.5&&k[j].v>=.5){half=k[j-1].o+(k[j].o-k[j-1].o)*(.5-k[j-1].v)/(k[j].v-k[j-1].v);break;}}
  return {id,placeholder:/url\(["']?data:image/.test(getComputedStyle(el).backgroundImage),currentSrc:el.currentSrc.replace(location.origin,''),complete:el.complete,decoded:el.naturalWidth>0,imgPaint:imgPaint.length?Math.min(...imgPaint):(performance.getEntriesByName(el.currentSrc)[0]?.responseEnd??null),
   animStart,animDuration:t?Number(t.duration):0,half,animName:a?.animationName||null};});
 const title=S.elements.find(e=>e.id==='splash-title');
 const res=performance.getEntriesByType('resource').filter(r=>/\/splash\/|IslandBrush|entry-grain|\.css/.test(r.name)).map(r=>({name:r.name.replace(location.origin,''),start:Math.round(r.startTime),end:Math.round(r.responseEnd),bytes:r.transferSize||r.encodedBodySize,prio:r.renderBlockingStatus}));
 const nav=performance.getEntriesByType('navigation')[0];
 return {title:title?(title.renderTime||title.loadTime):null,fcp:S.paints.find(p=>p.name==='first-contentful-paint')?.t??null,lcp:S.lcp.at(-1)||null,cast,res,
  html:nav?{responseEnd:Math.round(nav.responseEnd),dcl:Math.round(nav.domContentLoadedEventEnd),bytes:nav.transferSize}:null,timeOrigin:performance.timeOrigin,elements:S.elements};
}

/** Nearest-neighbour downscale + horizontal strip of frames, with a 2px gap. */
function filmstrip(frames,out,scale){
 if(!frames.length)return;const imgs=frames.map(f=>PNG.sync.read(f.buf));const w=Math.round(imgs[0].width*scale),h=Math.round(imgs[0].height*scale),gap=4;
 const strip=new PNG({width:(w+gap)*imgs.length,height:h});strip.data.fill(255);
 imgs.forEach((img,k)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.min(img.width-1,Math.floor(x/scale)),sy=Math.min(img.height-1,Math.floor(y/scale)),si=(sy*img.width+sx)*4,di=(y*strip.width+k*(w+gap)+x)*4;img.data.copy(strip.data,di,si,si+4);}});
 fs.writeFileSync(out,PNG.sync.write(strip));
}

async function runOnce(browser,p,run){
 const context=await browser.newContext({viewport:p.viewport,deviceScaleFactor:p.dpr,isMobile:p.mobile,hasTouch:p.mobile,reducedMotion:'no-preference'});
 await context.addInitScript(instrument,SEED);
 const page=await context.newPage();const cdp=await context.newCDPSession(page);
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(NET[p.net])await cdp.send('Network.emulateNetworkConditions',{offline:false,...NET[p.net]});
 if(p.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:p.cpu});
 const frames=[];
 if(SHOTS){cdp.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp*1000,buf:Buffer.from(f.data,'base64')});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'png',maxWidth:p.viewport.width,maxHeight:p.viewport.height,everyNthFrame:1});}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(BASE+'/',{waitUntil:'commit',timeout:120000});
 // The splash has a ≥3 s minimum dwell; wait for the title, the cast and their entrances to settle.
 await page.waitForFunction(()=>{const S=window.__splashTiming;return S&&S.elements.some(e=>e.id==='splash-title');},null,{timeout:90000}).catch(()=>{});
 await page.waitForTimeout(p.net==='fast3g'?3500:2000);
 const r=await page.evaluate(collect);
 if(SHOTS){await cdp.send('Page.stopScreencast').catch(()=>{});}
 await context.close();
 // A character is VISIBLE when its entrance is half way in (opacity ≈ .5) and something is painted in its box: the inline
 // placeholder (a data: URI background, painted with the first frame = FCP) or the still. It is SHARP once the full
 // still has arrived as well.
 for(const c of r.cast){const anim=c.animStart==null?0:c.animStart+c.half*c.animDuration,still=c.imgPaint??Infinity;
  c.visible=Math.max(c.placeholder?Math.min(r.fcp??Infinity,still):still,anim);c.appear=Math.max(still,anim);c.fullyIn=Math.max(still,c.animStart==null?0:c.animStart+c.animDuration);}
 const last=Math.max(...r.cast.map(c=>c.appear)),first=Math.min(...r.cast.map(c=>c.appear)),lastVisible=Math.max(...r.cast.map(c=>c.visible));
 // The splash is "there" from FCP (background, island art, eyebrow); the brush title follows when its font lands.
 const gap=r.title==null?null:last-r.title,gapFcp=r.fcp==null?null:last-r.fcp;
 const visGap=r.title==null?null:lastVisible-r.title,visGapFcp=r.fcp==null?null:lastVisible-r.fcp;
 if(SHOTS&&frames.length){
  const dir=path.join(SHOTS,`${LABEL}-${p.id}-${run}`);fs.mkdirSync(dir,{recursive:true});
  const t0=r.timeOrigin,pick=[];
  // One frame per 100 ms from the first frame until every character is fully in (+300 ms).
  const end=Math.max(last,...r.cast.map(c=>c.fullyIn))+300;
  for(let t=0;t<=Math.min(end,8000);t+=100){let best=null;for(const f of frames)if(f.t-t0<=t)best=f;if(best)pick.push({t,buf:best.buf});}
  for(const f of pick)fs.writeFileSync(path.join(dir,`t${String(f.t).padStart(5,'0')}ms.png`),f.buf);
  filmstrip(pick.filter((_,i)=>i%2===0),path.join(SHOTS,`${LABEL}-${p.id}-${run}-filmstrip.png`),p.mobile?.4:.2);
 }
 return {...r,gap,gapFcp,visGap,visGapFcp,lastVisible,firstCast:first,lastCast:last,errors};
}

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--mute-audio']});
 const summary=[];let failed=false;
 try{
  // Warm the server (dev compiles on first request) without warming the browser: every measured run is a fresh context.
  await fetch(BASE+'/').then(r=>r.text()).catch(()=>{});
  for(const p of PROFILES){for(let run=1;run<=RUNS;run++){
   const r=await runOnce(browser,p,run);const f=n=>n==null||!isFinite(n)?'—':Math.round(n)+'ms';
   console.log(`\n[${LABEL}] ${p.id} run ${run}: html ${f(r.html?.responseEnd)} · FCP ${f(r.fcp)} · title ${f(r.title)} · last character visible ${f(r.lastVisible)} (vs title ${f(r.visGap)}, vs FCP ${f(r.visGapFcp)}) · last sharp ${f(r.lastCast)} (vs title ${f(r.gap)}, vs FCP ${f(r.gapFcp)}) · LCP ${f(r.lcp?.t)} ${r.lcp?.url||''}`);
   for(const c of r.cast)console.log(`   ${c.id.padEnd(10)} ${c.currentSrc.padEnd(26)} img ${f(c.imgPaint)}  anim ${c.animName||'none'} @${f(c.animStart)}+${c.animDuration}ms  visible ${f(c.visible)}${c.placeholder?'':' (no placeholder)'}  sharp ${f(c.appear)}  fully in ${f(c.fullyIn)}`);
   for(const x of r.res)console.log(`   res ${x.name.slice(0,48).padEnd(48)} ${String(x.start).padStart(5)}→${String(x.end).padStart(5)}ms ${x.bytes}B`);
   if(r.errors.length)console.log('   page errors:',r.errors.slice(0,3));
   summary.push({profile:p.id,run,fcp:r.fcp,title:r.title,vis:r.lastVisible,sharp:r.lastCast,visGap:Math.max(r.visGap,r.visGapFcp),sharpGap:Math.max(r.gap,r.gapFcp)});
   const bad=g=>g==null||!isFinite(g)||g>TARGET;
   if(p.gate&&(bad(r.visGap)||bad(r.visGapFcp)))failed=true;
   if(p.sharpGate&&(bad(r.gap)||bad(r.gapFcp)))failed=true;
  }}
 }finally{await browser.close();}
 console.log('\nSummary (ms): profile, run: FCP / title / last character visible / last character sharp / visible gap / sharp gap  (gap = after the splash's first paint, FCP ≤ title)');for(const s of summary)console.log(`  ${s.profile} #${s.run}: ${[s.fcp,s.title,s.vis,s.sharp,s.visGap,s.sharpGap].map(n=>Math.round(n)).join(' / ')}`);
 if(failed){console.log(`\nFAIL: on a throttled phone profile the characters show (or, on 4G, sharpen) more than ${TARGET} ms after the splash/title.`);process.exit(1);}
 console.log(`\nPASS: characters show within ${TARGET} ms of the splash and title on both throttled phone profiles, and are sharp within ${TARGET} ms on phone 4G.`);
})().catch(e=>{console.error(e);process.exit(1);});
