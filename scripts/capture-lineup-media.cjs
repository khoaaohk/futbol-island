#!/usr/bin/env node
// Line Up! media capture (Nov 18 2026, AAA pass): fresh /games footage after the pieces became footballs.
//   node scripts/capture-lineup-media.cjs --port=<n>      (your own dev server; never 8092)
// A scripted player (a careful greedy bot, real touch drags through CDP) plays the Daily Line-Up on a 390x844 phone at DPR 2 in a
// muted headless Chrome. A CDP screencast records it; ffmpeg cuts the 10 s with the most line clears to public/games/clips/lineup.{mp4,webm}
// (332x720, silent). Three stills go to public/games/shots/lineup-{1,2,3}.webp (480x1039): early in a run, a line clearing, a
// shape held over a crowded pitch. Still 1 is the clip's poster. The two page pictures in public/games are re-made from stills 2
// and 1 at their old sizes. Sizes are written to lib/site/gameMedia.json. Needs ffmpeg with libx264 and libvpx-vp9 (the WebP stills are
// encoded by the same Chrome, canvas.toDataURL, so no WebP encoder is needed).
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const portArg=(process.argv.find(a=>a.startsWith('--port='))||'').slice(7)||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (never 8092).');process.exit(1);}
const ROOT=path.join(__dirname,'..'),clips=path.join(ROOT,'public/games/clips'),shots=path.join(ROOT,'public/games/shots'),pages=path.join(ROOT,'public/games'),PAGE_SHOTS=[['line-up-soccer-block-puzzle-game.webp',2],['line-up-tray-of-three-shapes.webp',1]],TMP=fs.mkdtempSync(path.join(os.tmpdir(),'lineup-media-')),CLIP_S=10;
const ff=args=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:['ignore','ignore','inherit']});
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-lineup-v1',JSON.stringify({v:1,best:6200,medal:2,plays:9,lines:30,combo:2,tip:0,daily:{day:'',best:0,counted:false,runs:0},streak:{day:'',n:0,best:0}}));}catch{}};
/** The next move of a careful greedy player, with the screen points for a real drag (the finger ends below the piece: it rides above the thumb). */
const bot=()=>{const k=window.__lineup,g=k.game,s=g.state;if(!g||s.over)return null;
 const holes=()=>{let h=0;for(let i=0;i<64;i++){if(s.grid[i]||s.ref[i])continue;const x=i%8,y=i>>3;let c=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>7||Y>7||s.grid[Y*8+X]||s.ref[Y*8+X])c++;}if(c>=3)h++;}return h;};
 let best=null;for(let t=0;t<4;t++){const p=g.pieceAt(t);if(!p)continue;const d=k.shape(p.shape);for(let y=0;y+d.h<=8;y++)for(let x=0;x+d.w<=8;x++){if(!g.fits(p.shape,x,y))continue;const ln=g.linesIf(p.shape,x,y),keep=s.grid.slice();
  for(const [cx,cy] of d.cells)s.grid[(y+cy)*8+x+cx]=1;for(const r of ln.rows)for(let c=0;c<8;c++)s.grid[r*8+c]=0;for(const c of ln.cols)for(let r=0;r<8;r++)s.grid[r*8+c]=0;
  let fill=0;for(let i=0;i<64;i++)fill+=s.grid[i]?1:0;const v=(ln.rows.length+ln.cols.length)*10-holes()*3-fill*.2+d.n*.5;s.grid.set(keep);if(!best||v>best.v)best={v,k:t,x,y,w:d.w,h:d.h,lines:ln.rows.length+ln.cols.length};}}
 const L=k.layout,st=k.stage,c=L.cell;if(!best){if(!s.rescue)return null;const t=s.tray.findIndex(Boolean);return {lines:0,sx:st.left+L.slots[t].cx,sy:st.top+L.slots[t].cy,tx:st.left+L.slots[3].cx,ty:st.top+L.slots[3].cy};}
 let fill=0;for(let i=0;i<64;i++)fill+=s.grid[i]?1:0;
 return {lines:best.lines,fill,left:s.tray.filter(Boolean).length,sx:st.left+L.slots[best.k].cx,sy:st.top+L.slots[best.k].cy,tx:st.left+L.bx+best.x*c+best.w*c/2,ty:st.top+L.by+best.y*c+best.h*c+c*1.1};};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const frames=[],clears=[];
 try{const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(seed);const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page),wait=ms=>page.waitForTimeout(ms);
  await page.goto(BASE+'/arcade?game=lineup',{waitUntil:'domcontentloaded',timeout:180000});await page.waitForSelector('[data-lineup-daily]',{timeout:120000});await wait(1200);
  await page.locator('[data-lineup-daily]').click();await page.waitForFunction(()=>window.__lineup&&window.__lineup.phase==='playing',null,{timeout:30000});
  cdp.on('Page.screencastFrame',f=>{const file=path.join(TMP,`f${String(frames.length).padStart(5,'0')}.jpg`);fs.writeFileSync(file,Buffer.from(f.data,'base64'));frames.push({file,t:f.metadata.timestamp});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:780,maxHeight:1688,everyNthFrame:1});await wait(700);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  // a still is the screencast frame on screen at that moment (page.screenshot in the middle of a touch returned an older frame)
  const marks={},shot=n=>{marks[n]=Date.now()/1000;},got=new Set();
  for(let i=0;i<46;i++){const m=await page.evaluate(bot);if(!m)break;
   await touch('touchStart',m.sx,m.sy);await wait(90);const hold=!got.has(3)&&m.fill>=22&&!m.lines;// still 3: a shape held in the air over a crowded pitch, on its way (at its square it would look placed)
   for(let k=1;k<=14;k++){const e=k/14,u=e*e*(3-2*e);await touch('touchMove',m.sx+(m.tx-m.sx)*u,m.sy+(m.ty-m.sy)*u);await wait(20);if(hold&&k===9){await wait(140);shot(3);got.add(3);await wait(60);}}
   await wait(m.lines?260:110);
   await touch('touchEnd');if(m.lines){clears.push(Date.now()/1000);await wait(230);if(!got.has(2)){shot(2);got.add(2);}await wait(500);}else await wait(260);
   if(!got.has(1)&&i>=3&&m.left===2&&!m.lines){await wait(500);shot(1);got.add(1);}}// early: a few shapes down, two left in the tray
  await wait(600);await cdp.send('Page.stopScreencast');
  for(const n of [1,2,3])if(!got.has(n))throw new Error(`still ${n} was never taken; run again (another day's Daily Line-Up plays differently)`);
  // WebP stills, encoded by Chrome itself: the three shots, and the two page pictures at their old sizes
  const enc=await ctx.newPage(),webp=async(n,dst,w,h,q)=>{const b64=await enc.evaluate(async([src,w,h,q])=>{const img=new Image();img.src='data:image/jpeg;base64,'+src;await img.decode();const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c.toDataURL('image/webp',q).split(',')[1];},[fs.readFileSync((frames.filter(f=>f.t<=marks[n]+.01).pop()||frames[0]).file).toString('base64'),w,h,q]);fs.writeFileSync(dst,Buffer.from(b64,'base64'));};
  const dims=f=>execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',f]).toString().trim().split(',').map(Number);
  for(const n of [1,2,3])await webp(n,path.join(shots,`lineup-${n}.webp`),480,1039,.8);
  for(const [file,n] of PAGE_SHOTS){const dst=path.join(pages,file),[w,h]=dims(dst);await webp(n,dst,w,h,.82);}
  fs.copyFileSync(path.join(shots,'lineup-1.webp'),path.join(clips,'lineup.webp'));
 }finally{await browser.close();}
 if(frames.length<60||!clears.length)throw new Error(`too little footage (${frames.length} frames, ${clears.length} clears)`);
 // the 10 s window with the most clears (it starts a second before its first clear)
 const t0=frames[0].t,tEnd=frames[frames.length-1].t;let start=0,bestN=-1;for(const c of clears){const s0=Math.max(0,Math.min(tEnd-t0-CLIP_S,c-t0-1.2)),n=clears.filter(x=>x-t0>=s0&&x-t0<=s0+CLIP_S-.8).length;if(n>bestN){bestN=n;start=s0;}}
 const list=path.join(TMP,'frames.txt');fs.writeFileSync(list,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file}'\nduration ${Math.max(.005,((frames[i+1]?.t??f.t+.05)-f.t)).toFixed(4)}`).join('\n')+`\nfile '${frames[frames.length-1].file}'\n`);
 const cut=['-f','concat','-safe','0','-i',list,'-ss',start.toFixed(2),'-t',String(CLIP_S),'-vf','fps=30,scale=332:720:flags=lanczos','-an'];
 ff([...cut,'-c:v','libx264','-pix_fmt','yuv420p','-crf','27','-preset','slow','-movflags','+faststart',path.join(clips,'lineup.mp4')]);
 ff([...cut,'-c:v','libvpx-vp9','-crf','38','-b:v','0','-row-mt','1',path.join(clips,'lineup.webm')]);
 const size=f=>fs.statSync(f).size,jf=path.join(ROOT,'lib/site/gameMedia.json'),raw=fs.readFileSync(jf,'utf8'),M=JSON.parse(raw);
 M.clips.lineup={w:332,h:720,seconds:CLIP_S,mp4:size(path.join(clips,'lineup.mp4')),webm:size(path.join(clips,'lineup.webm')),poster:{w:480,h:1039,bytes:size(path.join(clips,'lineup.webp'))}};
 M.shots.lineup=[1,2,3].map(n=>({file:`lineup-${n}.webp`,w:480,h:1039,bytes:size(path.join(shots,`lineup-${n}.webp`))}));
 fs.writeFileSync(jf,JSON.stringify(M,null,(/^\{\n( +)"/.exec(raw)||[,' '])[1].length)+(raw.endsWith('\n')?'\n':''));
 fs.rmSync(TMP,{recursive:true,force:true});
 console.log(`capture-lineup-media: ${frames.length} frames, ${clears.length} clears, clip from ${start.toFixed(1)} s with ${bestN} clears; mp4 ${M.clips.lineup.mp4} B, webm ${M.clips.lineup.webm} B, stills ${M.shots.lineup.map(s=>s.bytes).join(' / ')} B`);
})().catch(e=>{fs.rmSync(TMP,{recursive:true,force:true});console.error('capture-lineup-media: FAILED '+String(e.message||e).slice(0,600));process.exit(1);});
