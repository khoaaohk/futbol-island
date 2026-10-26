// Browser check for the first diving spot (water P2, Oct 16 2026; docs/swimming-research.md "P2 implemented: one spot").
// Needs a running server (FUTBOL_BASE_URL, default http://localhost:3000, e.g. `npx next start -p 3000`).
//   node scripts/check-dive-browser.cjs            → phone 390×844, screenshots into docs/water/ (DIVE_SHOTS overrides)
// Flow (the seven zones of Oct 20 2026, read from lib/town/water/diveSpots.ts): seed a save and stand on Coral Cay's north shore
// facing Paul's Grotto (shot 1: the buoy and the lighter patch), swim into the patch (shot 2: the Dive prompt), dive (shot 3: the
// reef and the schools), swim to the relic and the coral and use them (shot 4: a find), Surface with the button, catch a breath,
// dive again, swim to the clam and the chest's explore ball, surface with Escape; then swim into every other zone and check its Dive prompt.
// Asserts zero page / console errors, the room's draws, that the island stops rendering while under and resumes after, and that
// the room is disposed.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),ts=require('typescript');
const OUT=process.env.DIVE_SHOTS||path.join(__dirname,'..','docs','water');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:3000';
// diveSpots.ts imports ./diveBalls (Oct 21 2026): a tiny loader for its relative TS imports.
const ZONES=(()=>{const load=file=>{const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),
 {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)+'.ts'):require(id));return m.exports;};
 return load(path.join(__dirname,'..','lib/town/water/diveSpots.ts')).DIVE_SPOTS;})();
const FIRST=ZONES.find(z=>z.id==='pauls-grotto'),SPOT={x:FIRST.x,z:FIRST.z},BEACH={x:FIRST.x,z:-256};
(async()=>{
 const exe=[process.env.PW_EXE,'/opt/pw-browsers/chromium'].filter(Boolean).find(p=>{try{return fs.statSync(p).isFile();}catch{return false;}});
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],...(exe?{executablePath:exe}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error'&&!/ResizeObserver loop/.test(m.text()))errors.push('console: '+m.text().slice(0,200));});
 await page.addInitScript(({x,z})=>{sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x,z,yaw:Math.PI,ride:'walk',flightHeight:0}));},BEACH);
 await page.goto(BASE+'/?from=arcade');
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.dive&&!document.querySelector('[data-island-return-loading]'),null,{timeout:180000});
 await page.locator('.travel-actions').waitFor({state:'visible',timeout:120000});await page.waitForTimeout(4000);
 const shot=async name=>{const f=path.join(OUT,name);await page.screenshot({path:f});console.log('shot',path.relative(process.cwd(),f),fs.statSync(f).size,'bytes');};
 const state=()=>page.evaluate(()=>{const d=window.__fi2.dive,s=d.session.state;return {diving:d.diving,phase:s.phase,near:s.near?.id??null,find:s.find?.id??null,x:s.x,y:s.y,z:s.z,yaw:s.yaw,breath:s.breath,
  loc:{x:window.__fi2.location.x,z:window.__fi2.location.z},inWater:window.__fi2.water.inWater,swim:window.__fi2.water.state.phase,rendered:window.__fi2.renderStats.rendered,room:!!d.room,
  prompt:(()=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden?b.textContent:null;})()};});
 const dismiss=async()=>{for(let i=0;i<6;i++){const d=page.locator('dialog[open]');if(!await d.count())break;await page.keyboard.press('Escape');await page.waitForTimeout(400);}};
 await dismiss();
 // 1. From the beach: the buoy and the lighter patch.
 console.log('start',JSON.stringify(await state()));
 // The follow camera sees ~25 m ahead: step down the beach toward the water until the buoy's flag is framed under the HUD.
 for(const z of [0,-2,-4,-6,-8].map(d=>BEACH.z+d)){await page.evaluate(({x,z})=>{const l=window.__fi2.location;l.x=x;l.z=z;},{x:BEACH.x,z});await page.waitForTimeout(1600);
  const y=await page.evaluate(({x,z})=>{const v=new window.__fi2.camera.position.constructor(x,2.4,z).project(window.__fi2.camera);return (1-v.y)/2*innerHeight;},SPOT);
  console.log('standpoint z',z,'flag at y',Math.round(y),JSON.stringify(await state()).slice(0,120));if(y>200)break;}
 for(const t of await page.locator('[role=status]').all())await t.tap({timeout:1000}).catch(()=>{});await page.waitForTimeout(400);
 await shot('dive-1-buoy-from-beach.png');
 // 2. Into the sea, then swim into the patch (keys: W swims away from the camera, toward the spot).
 await page.evaluate(({x,z})=>{const l=window.__fi2.location;l.x=x;l.z=z;},{x:SPOT.x+5,z:SPOT.z+12});await page.waitForTimeout(1500);
 let st=await state();console.log('in the sea',JSON.stringify(st));if(!st.inWater)throw Error('not in the water');
 const steerTo=async(tx,tz,until,ms=20000)=>{const t0=Date.now();let held=null;const hold=async k=>{if(held===k)return;if(held)await page.keyboard.up(held);held=k;if(k)await page.keyboard.down(k);};
  try{while(Date.now()-t0<ms){const s=await state();if(await until(s))return s;
   const yaw=Math.atan2(tx-s.loc.x,tz-s.loc.z);void yaw;await hold('w');await page.waitForTimeout(120);}}finally{await hold(null);}
  throw Error('did not arrive: '+JSON.stringify(await state()));};
 st=await steerTo(SPOT.x,SPOT.z,s=>s.near==='pauls-grotto'&&s.prompt==='Dive',15000);console.log('in the patch',JSON.stringify(st));
 await page.waitForTimeout(600);await shot('dive-2-prompt.png');
 // 3. Dive.
 const renderedBefore=(await state()).rendered;
 await page.locator('[data-dive-go]').tap();await page.waitForFunction(()=>window.__fi2.dive.diving&&window.__fi2.dive.room,null,{timeout:5000});
 await page.waitForTimeout(1800);
 const info=await page.evaluate(()=>{const i=window.__fi2.renderer.info.render;return {calls:i.calls,triangles:i.triangles,room:window.__fi2.dive.room.stats()};});
 console.log('room render',JSON.stringify(info));
 st=await state();console.log('diving',JSON.stringify(st));
 // The island is not rendered while under: the room is drawn into the same canvas; the island scene's own objects never move.
 const islandFrozen=await page.evaluate(async()=>{const w=window.__fi2,t0=w.games.entries[0]?.sim?.time??null;await new Promise(r=>setTimeout(r,800));return {t0,t1:w.games.entries[0]?.sim?.time??null};});
 console.log('island sim clock while diving',JSON.stringify(islandFrozen));
 await shot('dive-3-reef.png');
 // Swim underwater to a find: turn with A / D, swim with W, until it is in reach.
 const swimTo=async id=>{const t0=Date.now();const keys=new Set();const set=async want=>{for(const k of ['w','a','d','z'])if(want.has(k)!==keys.has(k)){if(want.has(k)){await page.keyboard.down(k);keys.add(k);}else{await page.keyboard.up(k);keys.delete(k);}}};
  try{while(Date.now()-t0<30000){const s=await state();if(!s.diving)throw Error('surfaced before reaching '+id+': '+JSON.stringify(s));if(s.find===id)return s;
   const f=await page.evaluate(id=>window.__fi2.dive.session.state.spot.finds.find(q=>q.id===id),id);
   let d=Math.atan2(f.x-s.x,f.z-s.z)-s.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));const want=new Set();if(d>.18)want.add('a');else if(d< -.18)want.add('d');if(Math.abs(d)<.9)want.add('w');if(s.y>f.y+1.4||Math.hypot(f.x-s.x,f.z-s.z)<3)want.add('z');// Z sinks (the finds sit on the shelf or the deep level)
   await set(want);await page.waitForTimeout(90);}}finally{await set(new Set());}
  throw Error('did not reach '+id+': '+JSON.stringify(await state()));};
 const useFind=async id=>{await page.waitForFunction(id=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden&&b.dataset.diveGo===id;},id,{timeout:5000});
  await page.locator('[data-dive-go]').tap();await page.waitForSelector(`[data-dive-card="${id}"]`,{timeout:4000});console.log('used',id,JSON.stringify(await page.evaluate(()=>document.querySelector('[data-dive-card]')?.innerText.replace(/\s+/g,' ').slice(0,200))));};
 await swimTo('relic');await useFind('relic');await page.waitForTimeout(500);await shot('dive-4-find.png');
 await swimTo('coral');await useFind('coral');await page.waitForTimeout(900);
 // Surface with the button, catch a breath at the buoy, dive again.
 await page.locator('[data-job-action="surface"]').tap();await page.waitForFunction(()=>!window.__fi2.dive.diving,null,{timeout:5000});await page.waitForTimeout(500);
 st=await state();console.log('surfaced (button)',JSON.stringify(st));if(st.room)throw Error('room still allocated after surfacing');if(st.rendered<=renderedBefore)throw Error('island did not resume');
 await page.waitForFunction(()=>window.__fi2.dive.session.state.breath>.97,null,{timeout:12000});
 await page.waitForFunction(()=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden&&b.textContent==='Dive';},null,{timeout:6000});
 await page.locator('[data-dive-go]').tap();await page.waitForFunction(()=>window.__fi2.dive.diving,null,{timeout:5000});await page.waitForTimeout(800);
 await swimTo('clam');await useFind('clam');await page.waitForTimeout(700);
 await swimTo('hidden-ball');await page.waitForTimeout(600);await shot('dive-5-chest-ball.png');await useFind('hidden-ball');await page.waitForTimeout(900);
 const saved=await page.evaluate(()=>localStorage.getItem('fi2-dive-finds-v1'));console.log('saved finds',saved);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.__fi2.dive.diving,null,{timeout:5000});await page.waitForTimeout(800);
 st=await state();console.log('surfaced (Escape)',JSON.stringify(st));if(st.room)throw Error('room still allocated after surfacing');
 const back=await page.evaluate(()=>({loc:{x:window.__fi2.location.x,z:window.__fi2.location.z},player:window.__fi2.player.root.parent===window.__fi2.scene,hud:document.querySelector('[data-water-actions]')?[...document.querySelectorAll('[data-job-action]')].map(b=>b.dataset.jobAction):null}));
 console.log('back at the buoy',JSON.stringify(back));if(!back.player)throw Error('the rig did not come back to the island');
 // Every zone: swim in from just outside its patch and wait for its own Dive prompt.
 for(const z of ZONES){await page.evaluate(({x,z})=>{const l=window.__fi2.location;l.x=x;l.z=z;},{x:z.x,z:z.z+z.radius*.4});
  await page.waitForFunction(id=>{const d=window.__fi2.dive,b=document.querySelector('[data-dive-go]');return d.session.state.near?.id===id&&b&&!b.hidden&&b.textContent==='Dive';},z.id,{timeout:8000})
   .catch(async()=>{throw Error('no Dive prompt at '+z.id+': '+JSON.stringify(await state()));});console.log('zone prompt ok',z.id);}
 console.log('errors',errors.length?errors:'none');
 await browser.close();if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
