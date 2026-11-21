#!/usr/bin/env node
// Fresh /games clip + stills for any arcade game (Nov 20 2026, owner: "is the ball blaster video and screenshots up to date? doesn't
// it use the bean character now?"). Two steps, so a person picks the moments:
//  record: node scripts/capture-game-media.cjs record --port=<n> --game=<id> --out=<dir> [--seconds=90]
//    plays the game in a muted headless Chrome on a 390x844 phone (DPR 2) with the scripted player of capture-game-shots-players.cjs
//    (or a better one below), CDP-screencasts every frame to <dir>/f*.jpg (frames.json has their times) and logs the game state
//    to <dir>/meta.jsonl. <dir>/sheet-*.jpg are contact sheets, one frame a second, labelled with the second.
//  encode: node scripts/capture-game-media.cjs encode --game=<id> --out=<dir> --clip=<start s> --stills=<s1>,<s2>,<s3> [--poster=<s>]
//    cuts the 10 s clip to public/games/clips/<id>.{mp4,webm} (332x720, 30 fps, silent), the poster <id>.webp and stills <id>-1..3.webp
//    (480x1039, cwebp) from the frames nearest those seconds [--crf=27 (H.264) --vcrf=38 --vbr=0 (VP9 cap, e.g. 300k) --q=78 (WebP)], and writes their sizes into lib/site/gameMedia.json (still 4 is kept).
// Never point it at 8092 (the owner's dev server).
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith(`--${k}=`));return a?a.slice(k.length+3):d;};
const MODE=process.argv[2],GAME=arg('game'),OUT=arg('out'),ROOT=path.join(__dirname,'..'),CLIP_S=10;
if(!GAME||!OUT){console.error('need --game and --out');process.exit(1);}
const FF='/opt/homebrew/bin/ffmpeg',ff=a=>execFileSync(FF,['-hide_banner','-loglevel','error','-y',...a],{stdio:['ignore','ignore','inherit']});

/** Players that know more than the still-capture ones (they read the game's dev hook and touch the screen like a child would). */
const BETTER={
 // Kit Rush: a short slash through one of your own kit (or a gold special) at a time, clear of whistles and other teams' kit
 kitrush:{start:'[data-kitrush-play]',meta:()=>{const k=window.__kitrush,s=k&&k.game&&k.game.state;return s?{score:s.score,lives:s.lives,team:s.team,over:s.over}:null;},
  async play(H){const {page,swipe,wait}=H;while(!H.stop){const m=await page.evaluate(()=>{const k=window.__kitrush,s=k&&k.game&&k.game.state,cv=[...document.querySelectorAll('canvas')].sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];if(!s||!cv||k.phase!=='playing')return null;
     const r=cv.getBoundingClientRect(),u=r.width/100,bad=s.items.filter(i=>i.active&&(i.kind===6||(i.kind<6&&i.team!==s.team)));
     const ok=s.items.filter(i=>i.active&&i.y*u>60&&i.y*u<r.height-90&&((i.kind<6&&i.team===s.team)||(i.kind>=7&&!i.frenzy))&&bad.every(b=>Math.hypot(b.x-i.x,b.y-i.y)>14));
     const i=ok.sort((a,b)=>b.y-a.y)[0];return i?{x:r.left+i.x*u,y:r.top+i.y*u}:null;});
    if(!m){await wait(60);continue;}await swipe(m.x-34,m.y+22,m.x+34,m.y-22,90,5);await wait(140);}}},
 // Ball Blaster: kick at the machine nearest the goal (lead it a little), hold to full power; with the super bar ready hold until red
 ballblaster:{start:'[data-ballblaster-play]',meta:()=>{const k=window.__ballblaster,s=k&&k.game&&k.game.state;return s?{wave:s.wave,mode:s.mode,hearts:s.hearts,score:s.score,sup:+s.sup.toFixed(2),ready:s.supReady,over:s.over,n:s.ents.filter(e=>e.on&&!e.dead).length}:null;},
  async play(H){const {page,cdp,wait}=H;let i=0;
   const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
   while(!H.stop){const m=await page.evaluate(i=>{const k=window.__ballblaster,g=k&&k.game,s=g&&g.state,v=k&&k.view;if(!s||k.phase!=='playing'||!v)return null;if(s.over)return {over:true};
     const ms=s.ents.filter(e=>e.on&&!e.dead&&(e.kind<10||e.kind===16)).sort((a,b)=>b.z-a.z);const props=s.ents.filter(e=>e.on&&!e.dead&&e.kind>=10&&e.kind<16);
     let t=ms.find(e=>e.kind!==8&&e.z>-30)||ms[0];if(!t&&props.length&&s.mode!=='fight')t=props[i%props.length];if(!t)return {idle:true};
     const lead=t.kind===16?0:Math.min(2.2,(t.speed||1)*.9),p=v.project(t.x,t.h*.5,Math.min(-1,t.z+lead)),r=k.stage;
     return {x:r.left+p.x,y:r.top+p.y+64,ready:s.supReady,rack:s.rack};},i);
    if(!m){const b=page.locator('[data-ballblaster-play]').first();if(await b.isVisible().catch(()=>false)){await wait(800);await b.tap().catch(()=>{});}}// the dev server reloaded the page
    if(!m||m.idle||m.over){await wait(m&&m.over?1500:150);if(m&&m.over)break;continue;}
    if(m.rack<=0){await wait(120);continue;}
    const hold=m.ready?1000:520+((i*61)%220);await touch('touchStart',m.x,m.y);await wait(hold);await touch('touchMove',m.x,m.y);await wait(30);await touch('touchEnd');await wait(260);i++;}}},
};

async function record(){
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 const port=arg('port'),BASE=`http://localhost:${port}`;if(!port||port==='8092'){console.error('Pass --port (never 8092).');process.exit(1);}
 const SECONDS=+arg('seconds',90),G=BETTER[GAME]||require(path.join(__dirname,'capture-game-shots-players.cjs'))[GAME];if(!G)throw new Error('unknown game '+GAME);
 fs.mkdirSync(OUT,{recursive:true});for(const f of fs.readdirSync(OUT))if(/^(f\d+\.jpg|meta\.jsonl|frames\.json|sheet-[\d.-]+\.jpg)$/.test(f))fs.rmSync(path.join(OUT,f));
 const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0');}catch{}};
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});const frames=[];
 try{const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(seed);
  const LS=arg('ls','');if(LS)await ctx.addInitScript(o=>{try{for(const [k,v] of Object.entries(o))localStorage.setItem(k,v);}catch{}},JSON.parse(LS));
  const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page),wait=ms=>page.waitForTimeout(ms);
  const tap=async(x,y)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await wait(40);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const swipe=async(x0,y0,x1,y1,ms=160,steps=8)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:1}]});for(let k=1;k<=steps;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*k/steps,y:y0+(y1-y0)*k/steps,id:1}]});await wait(ms/steps);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  await page.goto(`${BASE}/arcade?game=${GAME}`,{waitUntil:'domcontentloaded',timeout:240000});
  if(G.ready)await page.waitForFunction(G.ready,null,{timeout:180000});
  for(const name of (arg('pre','')||'').split('|').filter(Boolean)){const b=page.getByRole('button',{name:new RegExp(name,'i')}).first();await b.waitFor({timeout:180000});await wait(800);await b.tap();}
  const startBtn=G.start&&(G.start.startsWith('role:')?page.getByRole('button',{name:new RegExp(G.start.slice(5),'i')}).first():page.locator(G.start).first());
  if(startBtn){await startBtn.waitFor({timeout:180000});await wait(1500);await startBtn.tap();}else await wait(1500);
  const SETUP=arg('setup','');if(SETUP)await page.evaluate(SETUP);
  let t0=0;cdp.on('Page.screencastFrame',f=>{if(!t0)t0=f.metadata.timestamp;const file=path.join(OUT,`f${String(frames.length).padStart(5,'0')}.jpg`);fs.writeFileSync(file,Buffer.from(f.data,'base64'));frames.push({file,t:+(f.metadata.timestamp-t0).toFixed(3)});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:780,maxHeight:1688,everyNthFrame:1});const w0=Date.now()/1000;
  const H={page,cdp,wait,tap,swipe,stop:false};let loads=0;page.on('load',()=>{loads++;console.log('page reloaded at',(Date.now()/1000-w0).toFixed(1));});
  const log=(async()=>{while(!H.stop){const meta=G.meta?await page.evaluate(G.meta).catch(()=>null):null;fs.appendFileSync(path.join(OUT,'meta.jsonl'),JSON.stringify({t:+(Date.now()/1000-w0).toFixed(1),...meta})+'\n');await wait(500);}})();
  const play=(async()=>{try{await G.play(H);}catch(e){console.log('player stopped:',String(e.message).slice(0,160));}})();
  await wait(SECONDS*1000);H.stop=true;await play;await log;await cdp.send('Page.stopScreencast').catch(()=>{});
 }finally{await browser.close();}
 fs.writeFileSync(path.join(OUT,'frames.json'),JSON.stringify(frames));
 sheets(frames,0,1);
 console.log(`${GAME}: ${frames.length} frames over ${frames.at(-1)?.t}s in ${OUT}`);
}
/** contact sheets from second `from`, one frame every `step` s, 10 x 3 per sheet (read left to right, top to bottom) */
function sheets(frames,from,step){const pick=[];for(let s=from;s<=(frames.at(-1)?.t||0);s+=step)pick.push(nearest(frames,s));
 for(let k=0;k*30<pick.length;k++){const part=pick.slice(k*30,k*30+30),list=path.join(OUT,'sheet.txt');
  fs.writeFileSync(list,part.map(p=>`file '${p.file}'\nduration 1`).join('\n')+'\n');
  ff(['-f','concat','-safe','0','-i',list,'-vf','scale=156:338,tile=10x3:padding=4','-frames:v','1','-q:v','4',path.join(OUT,`sheet-${from}-${k}.jpg`)]);}}
function nearest(frames,s){let best=null;for(const f of frames)if(f.t<=s+.02)best=f;return best||frames[0];}

function encode(){
 const frames=JSON.parse(fs.readFileSync(path.join(OUT,'frames.json'),'utf8')),start=+arg('clip'),stills=arg('stills').split(',').map(Number),poster=+arg('poster',stills[0]);
 const clips=path.join(ROOT,'public/games/clips'),shots=path.join(ROOT,'public/games/shots');
 const list=path.join(OUT,'clip.txt');fs.writeFileSync(list,'ffconcat version 1.0\n'+frames.map((f,i)=>`file '${f.file}'\nduration ${Math.max(.005,((frames[i+1]?.t??f.t+.05)-f.t)).toFixed(4)}`).join('\n')+`\nfile '${frames.at(-1).file}'\n`);
 const cut=['-f','concat','-safe','0','-i',list,'-ss',start.toFixed(2),'-t',String(CLIP_S),'-vf','fps=30,scale=332:720:flags=lanczos','-an'];
 ff([...cut,'-c:v','libx264','-pix_fmt','yuv420p','-crf',arg('crf','27'),'-preset','slow','-movflags','+faststart',path.join(clips,`${GAME}.mp4`)]);
 ff([...cut,'-c:v','libvpx-vp9','-crf',arg('vcrf','38'),'-b:v',arg('vbr','0'),'-row-mt','1',path.join(clips,`${GAME}.webm`)]);
 const q=arg('q','78'),webp=(s,dst)=>{const f=nearest(frames,s);execFileSync('/opt/homebrew/bin/cwebp',['-quiet','-q',q,'-m','6','-resize','480','1039',f.file,'-o',dst]);};
 webp(poster,path.join(clips,`${GAME}.webp`));stills.forEach((s,i)=>webp(s,path.join(shots,`${GAME}-${i+1}.webp`)));
 const size=f=>fs.statSync(f).size,jf=path.join(ROOT,'lib/site/gameMedia.json'),raw=fs.readFileSync(jf,'utf8'),M=JSON.parse(raw);
 M.clips[GAME]={...M.clips[GAME],w:332,h:720,seconds:CLIP_S,mp4:size(path.join(clips,`${GAME}.mp4`)),webm:size(path.join(clips,`${GAME}.webm`)),poster:{w:480,h:1039,bytes:size(path.join(clips,`${GAME}.webp`))}};
 const old=M.shots[GAME]||[];M.shots[GAME]=[1,2,3].map(n=>({file:`${GAME}-${n}.webp`,w:480,h:1039,bytes:size(path.join(shots,`${GAME}-${n}.webp`))})).concat(old.slice(3));
 fs.writeFileSync(jf,JSON.stringify(M,null,(/^\{\n( +)"/.exec(raw)||[,' '])[1].length)+(raw.endsWith('\n')?'\n':''));
 console.log(`${GAME}: mp4 ${M.clips[GAME].mp4} B, webm ${M.clips[GAME].webm} B, poster ${M.clips[GAME].poster.bytes} B, stills ${M.shots[GAME].map(s=>s.bytes).join(' / ')} B`);
}
(MODE==='sheet'?Promise.resolve(sheets(JSON.parse(fs.readFileSync(path.join(OUT,'frames.json'),'utf8')),+arg('from',0),+arg('step',1))):MODE==='record'?record():Promise.resolve(MODE==='encode'?encode():console.error('mode: record | encode'))).catch(e=>{console.error('capture-game-media: FAILED '+String(e.message||e).slice(0,600));process.exit(1);});
