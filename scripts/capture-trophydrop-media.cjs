#!/usr/bin/env node
// Trophy Drop media capture (Nov 18 2026, AAA pass): fresh /games footage after the items got faces and the room got its lighting stages.
//   node scripts/capture-trophydrop-media.cjs --port=<n>      (your own dev server; never 8092)
// A scripted player (it aims at the highest twin of the held item, real touch slides through CDP) plays the Daily Drop on a 390x844
// phone at DPR 2 in a muted headless Chrome. A CDP screencast records it; ffmpeg cuts the 10 s with the most merges to
// public/games/clips/trophydrop.{mp4,webm} (332x720, silent). Three stills go to public/games/shots/trophydrop-{1,2,3}.webp (480x1039):
// early in a run with the finger down (the drop guide shows), the moment the first medal is made, a fuller cabinet later on. Still 1
// is the clip's poster. The two page pictures in public/games are re-made from stills 3 and 2 at their old sizes. Sizes are written to
// lib/site/gameMedia.json. Needs ffmpeg with libx264 and libvpx-vp9 (the WebP stills are encoded by the same Chrome).
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const portArg=(process.argv.find(a=>a.startsWith('--port='))||'').slice(7)||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (never 8092).');process.exit(1);}
const ROOT=path.join(__dirname,'..'),clips=path.join(ROOT,'public/games/clips'),shots=path.join(ROOT,'public/games/shots'),pages=path.join(ROOT,'public/games'),PAGE_SHOTS=[['trophy-drop-soccer-merge-game.webp',3],['trophy-drop-medal-merge.webp',2]],TMP=fs.mkdtempSync(path.join(os.tmpdir(),'trophydrop-media-')),CLIP_S=10;
const ff=args=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:['ignore','ignore','inherit']});
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-trophydrop-v1',JSON.stringify({v:1,best:5200,top:6,medal:2,plays:9,fact:0,doubles:0,daily:{day:'',best:0,runs:0},streak:{day:'',n:0,best:0}}));}catch{}};
/** The next drop of a careful player: the screen point over the highest twin of the held item (or a free spot), and the run's numbers. */
const bot=()=>{const k=window.__trophy,g=k.game,s=g.state,L=k.layout,st=document.querySelector('[data-trophy-stage]').getBoundingClientRect();if(!g||s.over||k.phase!=='playing')return null;
 let best=null;for(const b of s.bodies)if(b.t===s.cur&&b.landed&&(!best||b.y<best.y))best=b;
 let x=best?best.x:s.left+8+((s.drops*37)%84)/84*(s.right-s.left-16);if(!best){let low=1e9;for(let c=0;c<9;c++){const cx=s.left+6+c*(s.right-s.left-12)/8;let top=s.floor;for(const b of s.bodies)if(Math.abs(b.x-cx)<b.r+5)top=Math.min(top,b.y-b.r);if(-top<low){low=-top;x=cx;}}}
 return {x:st.left+L.ox+x*L.k,y:st.top+L.oy+L.ch*.62,merges:s.stats.merges,best:s.stats.bestTier,n:s.bodies.length,drops:s.drops,cool:s.cool,shakes:s.shakes,danger:s.danger};};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const frames=[],merges=[];
 try{const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(seed);const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page),wait=ms=>page.waitForTimeout(ms);
  await page.goto(BASE+'/arcade?game=trophydrop',{waitUntil:'domcontentloaded',timeout:180000});await page.waitForSelector('[data-trophy-daily]',{timeout:120000});await wait(1200);
  await page.locator('[data-trophy-daily]').click();await page.waitForFunction(()=>window.__trophy&&window.__trophy.phase==='playing',null,{timeout:30000});
  cdp.on('Page.screencastFrame',f=>{const file=path.join(TMP,`f${String(frames.length).padStart(5,'0')}.jpg`);fs.writeFileSync(file,Buffer.from(f.data,'base64'));frames.push({file,t:f.metadata.timestamp});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:780,maxHeight:1688,everyNthFrame:1});await wait(700);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  // a still is the screencast frame on screen at that moment
  const marks={},shot=n=>{marks[n]=Date.now()/1000;},got=new Set();let seen=0;
  for(let i=0;i<120;i++){const m=await page.evaluate(bot);if(!m)break;
   if(m.shakes>0&&m.danger>.8){await page.locator('[data-trophy-shake]').tap().catch(()=>{});await wait(500);}
   const from=m.x+(i%2?46:-46);await touch('touchStart',from,m.y);await wait(70);
   for(let k=1;k<=8;k++){const e=k/8,u=e*e*(3-2*e);await touch('touchMove',from+(m.x-from)*u,m.y);await wait(18);}
   if(!got.has(1)&&i>=7&&m.n>=4){await wait(260);shot(1);got.add(1);await wait(60);}// early: a few items down, the finger on the glass, the guide showing
   if(!got.has(3)&&got.has(2)&&m.n>=11&&i>=40){await wait(260);shot(3);got.add(3);await wait(60);}// later: a fuller cabinet, the finger on the glass
   await wait(60);await touch('touchEnd');
   for(let k=0;k<6;k++){await wait(88);const a=await page.evaluate(()=>({merges:window.__trophy.game.state.stats.merges,best:window.__trophy.game.state.stats.bestTier}));
    for(let j=seen;j<a.merges;j++)merges.push(Date.now()/1000-.1);seen=a.merges;
    if(!got.has(2)&&a.best>=5){await wait(260);shot(2);got.add(2);await wait(500);}}// the first medal: MEDAL! in its panel, the lights change
   if(got.size===3&&i>=70)break;}
  await wait(600);await cdp.send('Page.stopScreencast');
  for(const n of [1,2,3])if(!got.has(n))throw new Error(`still ${n} was never taken; run again (another day's Daily Drop plays differently)`);
  // WebP stills, encoded by Chrome itself: the three shots, and the two page pictures at their old sizes
  const enc=await ctx.newPage(),webp=async(n,dst,w,h,q)=>{const b64=await enc.evaluate(async([src,w,h,q])=>{const img=new Image();img.src='data:image/jpeg;base64,'+src;await img.decode();const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c.toDataURL('image/webp',q).split(',')[1];},[fs.readFileSync((frames.filter(f=>f.t<=marks[n]+.01).pop()||frames[0]).file).toString('base64'),w,h,q]);fs.writeFileSync(dst,Buffer.from(b64,'base64'));};
  const dims=f=>execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',f]).toString().trim().split(',').map(Number);
  for(const n of [1,2,3])await webp(n,path.join(shots,`trophydrop-${n}.webp`),480,1039,.8);
  for(const [file,n] of PAGE_SHOTS){const dst=path.join(pages,file),[w,h]=dims(dst);await webp(n,dst,w,h,.82);}
  fs.copyFileSync(path.join(shots,'trophydrop-1.webp'),path.join(clips,'trophydrop.webp'));
 }finally{await browser.close();}
 if(frames.length<60||!merges.length)throw new Error(`too little footage (${frames.length} frames, ${merges.length} merges)`);
 // the 10 s window with the most merges (it starts a second before its first merge)
 const t0=frames[0].t,tEnd=frames[frames.length-1].t;let start=0,bestN=-1;for(const c of merges){const s0=Math.max(0,Math.min(tEnd-t0-CLIP_S,c-t0-1.2)),n=merges.filter(x=>x-t0>=s0&&x-t0<=s0+CLIP_S-.8).length;if(n>bestN){bestN=n;start=s0;}}
 const list=path.join(TMP,'frames.txt');fs.writeFileSync(list,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file}'\nduration ${Math.max(.005,((frames[i+1]?.t??f.t+.05)-f.t)).toFixed(4)}`).join('\n')+`\nfile '${frames[frames.length-1].file}'\n`);
 const cut=['-f','concat','-safe','0','-i',list,'-ss',start.toFixed(2),'-t',String(CLIP_S),'-vf','fps=30,scale=332:720:flags=lanczos','-an'];
 ff([...cut,'-c:v','libx264','-pix_fmt','yuv420p','-crf','27','-preset','slow','-movflags','+faststart',path.join(clips,'trophydrop.mp4')]);
 ff([...cut,'-c:v','libvpx-vp9','-crf','38','-b:v','0','-row-mt','1',path.join(clips,'trophydrop.webm')]);
 const size=f=>fs.statSync(f).size,jf=path.join(ROOT,'lib/site/gameMedia.json'),raw=fs.readFileSync(jf,'utf8'),M=JSON.parse(raw);
 M.clips.trophydrop={w:332,h:720,seconds:CLIP_S,mp4:size(path.join(clips,'trophydrop.mp4')),webm:size(path.join(clips,'trophydrop.webm')),poster:{w:480,h:1039,bytes:size(path.join(clips,'trophydrop.webp'))}};
 M.shots.trophydrop=[1,2,3].map(n=>({file:`trophydrop-${n}.webp`,w:480,h:1039,bytes:size(path.join(shots,`trophydrop-${n}.webp`))}));
 fs.writeFileSync(jf,JSON.stringify(M,null,(/^\{\n( +)"/.exec(raw)||[,' '])[1].length)+(raw.endsWith('\n')?'\n':''));
 fs.rmSync(TMP,{recursive:true,force:true});
 console.log(`capture-trophydrop-media: ${frames.length} frames, ${merges.length} merges, clip from ${start.toFixed(1)} s with ${bestN} merges; mp4 ${M.clips.trophydrop.mp4} B, webm ${M.clips.trophydrop.webm} B, stills ${M.shots.trophydrop.map(s=>s.bytes).join(' / ')} B`);
})().catch(e=>{fs.rmSync(TMP,{recursive:true,force:true});console.error('capture-trophydrop-media: FAILED '+String(e.message||e).slice(0,600));process.exit(1);});
