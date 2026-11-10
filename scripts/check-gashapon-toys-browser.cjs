// Browser check for the gashapon toy viewer, round 3B (Nov 9 2026; docs/gashapon-design.md "Round 3B"), on /toy-lab (dev only).
//  1. Squeeze release with REAL pointer input: mouse down-hold-up, up outside the window, touch start-hold-end, touchcancel; the
//     toy must be back at rest (pressure ≈ 0, soft body still, no squash left; a stretch reaction such as Mochi's
//     snap-back may still be playing) within 600 ms, for the 6 pilot toys + 4 round 3A toys.
//  2. The pilot (gs-square-snacks): a contact sheet per toy (default + two turns) and mid-interaction shots (puzzle apart,
//     squished, walking, capsule open), desktop + phone.
//  3. No leaks: 50 shows in one viewer keep renderer.info.memory flat; 50 open / close cycles leave no canvas and no WebGL
//     context warnings. The frame cap reported. No console errors.
//  4. Round 3C (Nov 9 2026) dev-only lab samples (lib/gashapon/toyModels/_labSamples.ts): real mouse / touch drags open the boot
//     box lid (shot), swing the ball-chain charm (shot mid-swing), pose the keeper (shot), roll the cart; the plunger and lever
//     are back at rest ≤ 600 ms after letting go; every working part / ring / arm grabs from 18 px off its centre (≥ 44 px
//     targets); budgets; 50 open / close cycles of the samples leave no canvas.
// usage: FUTBOL_BASE_URL=http://localhost:8841 OUT=<dir> node scripts/check-gashapon-toys-browser.cjs
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8841',OUT=process.env.OUT||'.';
const LAB=['lab-boot-box','lab-kit-cart','lab-ball-buddy','lab-keeper-kit','lab-foam-mochi'];
const PILOT=['onigiri-ollie','melon-pan-mimi','nikuman-nico','karaage-kai','oden-odie','golden-onigiri'],OLD=['daruma-dash','mochi-momo','striker-sparky','whale-wendell'];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// Real pointer input (mouse, or CDP touch on the phone): down, a few moves, up.
async function dragReal(page,cdp,from,to,steps=12,holdMs=0){const tp=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 if(cdp)await tp('touchStart',from.x,from.y);else{await page.mouse.move(from.x,from.y);await page.mouse.down();}
 for(let i=1;i<=steps;i++){const x=from.x+(to.x-from.x)*i/steps,y=from.y+(to.y-from.y)*i/steps;if(cdp)await tp('touchMove',x,y);else await page.mouse.move(x,y);await wait(16);}
 if(holdMs)await wait(holdMs);if(cdp)await tp('touchEnd',to.x,to.y);else await page.mouse.up();}
async function open(page,id){await page.evaluate(id=>window.__toyLab?.open(id),id);
 await page.waitForFunction(id=>{const v=window.__toyViewer;return v&&v.rig()?.toy.id===id&&v.stats().draws>0;},id,{timeout:60000});await wait(1300);}
async function squeezePoint(page){return page.evaluate(()=>{const v=window.__toyViewer,c=v.screenOf('body')??{x:innerWidth/2,y:innerHeight*.45},pts=[];
 for(let y=c.y-200;y<c.y+200;y+=10)for(let x=c.x-150;x<=c.x+150;x+=12)pts.push([x,y]);pts.sort((a,b)=>Math.hypot(a[0]-c.x,a[1]-c.y)-Math.hypot(b[0]-c.x,b[1]-c.y));
 for(const [x,y] of pts){if(!v.hit(x,y))continue;const g=v.pointerDown(x,y);if(g){v.pointerUp();continue;}return [x,y];}return null;});}
const rest=page=>page.evaluate(()=>{const v=window.__toyViewer,s=v.stats();return {p:s.pressure,d:s.deform,sy:v.rig().root.scale.y};});
/** A shared working tree: another agent's edit makes `next dev` reload the page mid-run. Then the run is retried (≤ 2 times). */
async function run(browser,name,ctxOpts,tries=3){
 for(let t=1;;t++){let reloads=0;try{return await runOnce(browser,name,ctxOpts,()=>reloads++);}
  catch(e){if(reloads>1&&t<tries){console.error(`${name}: the dev server reloaded the page mid-run (another agent's edit); retrying`);continue;}throw e;}}}
async function runOnce(browser,name,ctxOpts,onNav){
 const ctx=await browser.newContext(ctxOpts),page=await ctx.newPage(),errors=[],warnings=[];
 page.on('framenavigated',f=>{if(f===page.mainFrame())onNav();});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(/WebGL|context/i.test(m.text())&&m.type()==='warning')warnings.push(m.text());});
 await page.goto(BASE+'/toy-lab?toy=onigiri-ollie',{timeout:180000,waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.__toyLab&&window.__toyViewer,null,{timeout:180000});
 const touch=!!ctxOpts.hasTouch,cdp=touch?await ctx.newCDPSession(page):null,shots=[],release=[];
 const tp=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}]});
 // 1. Squeeze release, real input.
 for(const id of [...PILOT,...OLD]){await open(page,id);if(await page.evaluate(()=>window.__toyViewer.kind()?.kind==='capsule'&&!window.__toyViewer.kind().can?.opened)){await page.evaluate(()=>window.__toyViewer.action('open'));await wait(1600);}// a secret capsule opens first (Golden Onigiri; Whale Wendell since round 3C)
  const kind=await page.evaluate(()=>window.__toyViewer.kind()?.kind),slow=await page.evaluate(()=>!!window.__toyViewer.rig().behaviour.soft?.slow);// slow-rise foam: ≈ 2.4 s by design
  const LIM=slow?2600:600;
  for(const how of touch?['touch','touchcancel']:['mouse','outside']){const pt=await squeezePoint(page);assert(pt,`${name} ${id}: a point on the toy`);const [x,y]=pt;
   if(touch)await tp('touchStart',x,y);else{await page.mouse.move(x,y);await page.mouse.down();}
   await wait(480);const held=await rest(page);
   if(how==='outside'){await page.mouse.move(-20,-20);await page.mouse.up();}// let go past the window edge
   else if(how==='mouse')await page.mouse.up();else if(how==='touch')await tp('touchEnd',x,y);else await tp('touchCancel',x,y);
   const t0=Date.now();let after;do{await wait(50);after=await rest(page);}while(Date.now()-t0<LIM&&(Math.abs(after.p)>.02||after.d>.03));
   const ms=Date.now()-t0;release.push(`${id}/${how}:${ms}ms`);
   if(kind!=='windup')assert(held.p>.5,`${name} ${id}/${how}: squeezing while held (${held.p.toFixed(2)})`);
   assert(Math.abs(after.p)<=.025&&after.d<=.03,`${name} ${id}/${how}: squeeze spring + soft body back at rest in ≤ ${LIM} ms (${JSON.stringify(after)})`);
   // The toy's own let-go reaction (a round 3A stretch-snap or bounce) may still be finishing: no squash left by 1 s.
   if(kind!=='windup'){await wait(Math.max(0,(slow?2800:1000)-(Date.now()-t0)));const late=await rest(page);assert(late.sy>.97,`${name} ${id}/${how}: no squash left by 1 s (${late.sy.toFixed(3)})`);}
   await wait(kind==='windup'?7000:300);}}
 // 2. The pilot: a sheet per toy and mid-interaction shots.
 const shot=async(file,clip)=>{const p=path.join(OUT,file);await page.screenshot({path:p,clip});shots.push(p);return p;};
 const vp=page.viewportSize(),box={x:0,y:0,width:vp.width,height:vp.height};
 const sheet=[];
 for(const id of PILOT){await open(page,id);if(id==='golden-onigiri')await page.evaluate(()=>window.__toyViewer.action('open')),await wait(1800);
  const turns=[];for(let i=0;i<3;i++){if(i)await page.evaluate(()=>{const v=window.__toyViewer,h=innerHeight;v.grab();v.drag(2.0944*h/4.2,0);v.release(0,0);});await wait(700);
   const p=path.join(OUT,`toy-${name}-${id}-${i}.png`);await page.screenshot({path:p});turns.push(p);}
  sheet.push({id,turns});}
 // Mid-interaction: puzzle apart, squished, walking, capsule just opened.
 await open(page,'onigiri-ollie');await page.evaluate(()=>{const v=window.__toyViewer;v.action('apart');v.action('apart');v.action('apart');});await wait(1800);await shot(`toy-${name}-onigiri-apart.png`,box);
 await open(page,'oden-odie');await page.evaluate(()=>{const v=window.__toyViewer;v.action('apart');v.action('apart');});await wait(1800);await shot(`toy-${name}-oden-apart.png`,box);
 await open(page,'nikuman-nico');await page.evaluate(()=>window.__toyViewer.holdStart());await wait(420);await shot(`toy-${name}-nikuman-squished.png`,box);await page.evaluate(()=>window.__toyViewer.holdEnd());
 await open(page,'karaage-kai');await page.evaluate(()=>window.__toyViewer.action('wind'));await wait(1400);await shot(`toy-${name}-karaage-walking.png`,box);
 // 4. Round 3C samples, real input.
 const lab={};const so=part=>page.evaluate(p=>window.__toyViewer.screenOf(p),part),pr=()=>page.evaluate(()=>window.__toyViewer.probe());
 for(const id of LAB){await open(page,id);const st=await page.evaluate(()=>window.__toyViewer.stats());assert(st.draws<=124&&st.triangles<=60000,`${name} ${id}: budget ${st.draws}d/${st.triangles}t`);lab[id]={draws:st.draws,tris:st.triangles};
  // ≥ 44 px targets: 18 px off the centre of every grabbable part still grabs it.
  const parts=await page.evaluate(()=>{const v=window.__toyViewer,c=v.kind().can,r=v.rig();return [...r.extras.mechs.map(m=>m.type==='wheels'?m.wheels[0]:m.part),...(c.chain?['ring']:[]),...(r.extras.poses.length?['armR','armL']:[])];});
  for(const p of parts){const g=await page.evaluate(p=>{const v=window.__toyViewer,c=v.screenOf(p),b=v.screenOf('body'),k=v.pointerDown(c.x+(b&&c.x<b.x-4?-18:18),c.y);v.pointerUp();return k;},p);/* 18 px outward */assert(g,`${name} ${id}: ${p} grabs from 18 px off`);}
  await wait(900);}
 await open(page,'lab-boot-box');{const lid=await so('lid');await dragReal(page,cdp,{x:lid.x,y:lid.y+8},{x:lid.x,y:lid.y-300},16);await wait(500);lab.hinge=(await pr()).mechs[0].q;assert(lab.hinge>1,`${name}: the lid drags open (${lab.hinge})`);
  await shot(`toy-${name}-lab-hinge-open.png`,box);
  // Lever with real input: pull, let go, back at rest within 600 ms; the flag popped.
  const lv=await so('lever');await dragReal(page,cdp,lv,{x:lv.x,y:lv.y+120},10);const t0=Date.now();let q;do{await wait(40);q=(await pr()).mechs[2];}while(Date.now()-t0<900&&Math.abs(q.q)>.01);
  lab.leverMs=Date.now()-t0;assert(lab.leverMs<=640,`${name}: lever back at rest in ${lab.leverMs} ms`);}
 await open(page,'lab-ball-buddy');{const ring=await so('ring');await dragReal(page,cdp,ring,{x:ring.x+150,y:ring.y+20},10);await wait(360);lab.swingTilt=(await pr()).chain.tilt;assert(lab.swingTilt>.05,`${name}: the charm swings (${lab.swingTilt})`);
  await shot(`toy-${name}-lab-chain-swing.png`,box);}
 await open(page,'lab-keeper-kit');{const arm=await so('armR');await dragReal(page,cdp,arm,{x:arm.x,y:arm.y-90},8);await wait(600);lab.pose=(await pr()).pose.cur;assert.notEqual(lab.pose,'rest',`${name}: posed`);
  await page.evaluate(()=>window.__toyViewer.action('star'));await wait(600);await shot(`toy-${name}-lab-figure-pose.png`,box);}
 await open(page,'lab-kit-cart');{const w=await so('wheelFR');await dragReal(page,cdp,w,{x:w.x,y:w.y+140},8);await wait(150);lab.roll=await page.evaluate(()=>Math.abs(window.__toyViewer.rig().root.position.z));assert(lab.roll>.03,`${name}: the cart rolls (${lab.roll})`);}
 for(let i=0;i<50;i++){await page.evaluate(i=>window.__toyLab.open(['lab-boot-box','lab-ball-buddy','lab-keeper-kit'][i%3]),i);await page.waitForFunction(()=>window.__toyViewer?.stats().draws>0,null,{timeout:30000});await page.evaluate(()=>window.__toyLab.close());await page.waitForFunction(()=>!window.__toyViewer,null,{timeout:30000});}
 await open(page,'onigiri-ollie');
 // Frame cap: the viewer's own interval (60 fps here; 30 under reduced motion / slow heat tiers / low-end phones).
 const fps=await page.evaluate(()=>({frameMs:window.__toyViewer.stats().frameMs,lights:window.__toyViewer.stats().lights}));
 // 3. Leaks: 50 shows in one viewer, memory flat.
 await open(page,'onigiri-ollie');const mem=await page.evaluate(async()=>{const v=window.__toyViewer,ids=['onigiri-ollie','golden-onigiri','daruma-dash','oden-odie','karaage-kai','mochi-momo'],out=[];
  for(let i=0;i<50;i++){v.show(ids[i%6]);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));if(i%6===5)out.push(v.stats().memory);}return out;});
 const m0=mem[0],mN=mem[mem.length-1];assert(mN.geometries<=m0.geometries+2&&mN.textures<=m0.textures+1,`${name}: GPU memory flat over 50 shows (${JSON.stringify(mem)})`);
 // 50 open / close cycles of the whole viewer.
 for(let i=0;i<50;i++){await page.evaluate(i=>window.__toyLab.open(i%2?'nikuman-nico':'daruma-dash'),i);await page.waitForFunction(()=>window.__toyViewer?.stats().draws>0,null,{timeout:30000});await page.evaluate(()=>window.__toyLab.close());await page.waitForFunction(()=>!window.__toyViewer,null,{timeout:30000});}
 const canvases=await page.evaluate(()=>document.querySelectorAll('canvas').length);
 await ctx.close();
 return {name,release,sheet,shots,errors,warnings,mem:[m0,mN],canvases,fps,lab};
}
async function contact(browser,r){// One contact sheet per viewport: rows = toys, columns = default + two turns.
 const page=await browser.newPage({viewport:{width:1500,height:200}});const rows=r.sheet.map(s=>`<div class=r><b>${s.id}</b>${s.turns.map(t=>`<img src="data:image/png;base64,${fs.readFileSync(t).toString('base64')}">`).join('')}</div>`).join('');
 await page.setContent(`<style>body{margin:0;background:#fbf7ee;font:700 14px system-ui;color:#244d40}.r{display:flex;align-items:center;gap:6px;padding:4px}.r b{width:120px}img{height:${r.name==='phone'?300:220}px}</style>${rows}`);
 const p=path.join(OUT,`toy-contact-${r.name}.png`);await page.screenshot({path:p,fullPage:true});await page.close();return p;}
(async()=>{
 const mac='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH||fs.existsSync(mac)?{executablePath:process.env.CHROME_PATH||mac}:{}),args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--mute-audio']});
 try{const out=[];
  out.push(await run(browser,'desktop',{viewport:{width:1280,height:800}}));
  out.push(await run(browser,'phone',{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}));
  for(const r of out){r.contact=await contact(browser,r);for(const s of r.sheet)for(const t of s.turns)fs.unlinkSync(t);delete r.sheet;}
  console.log(JSON.stringify(out.map(r=>({name:r.name,errors:r.errors,warnings:r.warnings,mem:r.mem,canvases:r.canvases,fps:r.fps,lab:r.lab,contact:r.contact,shots:r.shots,release:r.release.join(' ')})),null,1));
  for(const r of out){assert.equal(r.errors.length,0,r.name+': '+r.errors.join('\n'));assert.equal(r.warnings.length,0,r.name+' WebGL warnings: '+r.warnings.join('\n'));assert.equal(r.canvases,0,r.name+': no canvas left after closing');}
  console.log('PASS gashapon toys browser check');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
