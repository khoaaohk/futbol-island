// Browser check for Explore (the reef zones) and swimming (water P2, Oct 16 2026; rewritten Oct 25 2026 for the Oct 21 zone move:
// the old fixed beach spot was out in the sea, the prompt now reads "Explore" and the pink Surface button became "hold ▲ at the top").
// Needs a running server (FUTBOL_BASE_URL, default http://localhost:3000, e.g. `npx next start -p 3000`).
//   node scripts/check-dive-browser.cjs            → phone 390×844, screenshots into docs/water/ (DIVE_SHOTS overrides)
// Flow (the seven zones, read from lib/town/water/diveSpots.ts): seed a save and stand on the nearest dry land to Paul's Grotto, facing
// it (shot 1: what a kid sees from the shore), wade in and swim on the joystick toward the buoy (shot 2: the Explore prompt), tap
// Explore (shot 3: the reef), swim to the relic and the coral and use them (shot 4: a find), hold ▲ to the top to come up, catch a
// breath, pick up the chest's hidden ball (its lesson card), swim out across the zone's edge (Seamless Explore), then check every other zone's prompt.
// Asserts zero page / console errors, that the island stops rendering while under and resumes after, and that the room is disposed.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),ts=require('typescript'),vm=require('vm');
const OUT=process.env.DIVE_SHOTS||path.join(__dirname,'..','docs','water');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:3000';
// The game's own TypeScript modules (no three.js needed): the zones and the land test, for a real shore start point.
const ROOT=path.join(__dirname,'..'),cache=new Map();
const load=file=>{file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const res=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {Math,Map,Set,WeakMap,Float32Array,Float64Array,Uint8Array,Uint16Array,Int16Array,Int32Array,Uint32Array,JSON,Number,Object,Array,String,Symbol,Error,isFinite,console,exports:mod.exports,module:mod,
   require:id=>id.startsWith('@/')?load(res(path.resolve(ROOT,id.slice(2)))):id.startsWith('.')?load(res(path.resolve(path.dirname(file),id))):require(id)});
 cache.set(file,mod.exports);return mod.exports;};
const ZONES=load('lib/town/water/diveSpots.ts').DIVE_SPOTS,L=load('lib/town/landmass.ts');
const FIRST=ZONES.find(z=>z.id==='pauls-grotto'),SPOT={x:FIRST.x,z:FIRST.z};
/** The nearest dry land to a zone, a metre in from the waterline, and the facing toward the zone (rig yaw: forward = (sin, cos)). */
const shoreFor=s=>{for(let r=1;r<200;r++)for(let a=0;a<180;a++){const t=a/180*Math.PI*2,x=s.x+Math.cos(t)*r,z=s.z+Math.sin(t)*r;
  if(L.onLand(x,z)){const ux=(s.x-x)/r,uz=(s.z-z)/r;return {x:x-ux,z:z-uz,yaw:Math.atan2(ux,uz),ux,uz,r};}}return null;};
const BEACH=shoreFor(FIRST);
(async()=>{
 const exe=[process.env.PW_EXE,'/opt/pw-browsers/chromium'].filter(Boolean).find(p=>{try{return fs.statSync(p).isFile();}catch{return false;}});
 const browser=await chromium.launch({headless:true,args:['--mute-audio','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],...(exe?{executablePath:exe}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',async m=>{if(m.type()==='error'&&!/ResizeObserver loop|Failed to load resource|404/.test(m.text())){const a=await Promise.all(m.args().map(x=>x.jsonValue().catch(()=>'?')));errors.push('console: '+a.map(String).join(' | ').slice(0,700));}});
 await page.addInitScript(({x,z,yaw})=>{sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x,z,yaw,ride:'walk',flightHeight:0}));},BEACH);
 await page.goto(BASE+'/?from=arcade');
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.dive&&!document.querySelector('[data-island-return-loading]'),null,{timeout:240000});
 await page.waitForTimeout(5000);
 const shot=async name=>{const f=path.join(OUT,name);await page.screenshot({path:f});console.log('shot',path.relative(process.cwd(),f),fs.statSync(f).size,'bytes');};
 const state=()=>page.evaluate(()=>{const d=window.__fi2.dive,s=d.session.state;return {diving:d.diving,phase:s.phase,near:s.near?.id??null,find:s.find?.id??null,x:+s.x.toFixed(2),y:+s.y.toFixed(2),z:+s.z.toFixed(2),yaw:+s.yaw.toFixed(2),breath:+s.breath.toFixed(3),depthT:+s.depthT.toFixed(2),
  loc:{x:+window.__fi2.location.x.toFixed(1),z:+window.__fi2.location.z.toFixed(1)},inWater:window.__fi2.water.inWater,swim:window.__fi2.water.state.phase,rendered:window.__fi2.renderStats.rendered,room:!!d.room,
  prompt:(()=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden?b.textContent:null;})()};});
 const dismiss=async()=>{for(let i=0;i<6;i++){const d=page.locator('dialog[open]');if(!await d.count())break;await page.keyboard.press('Escape');await page.waitForTimeout(400);}};
 await dismiss();
 console.log('shore start',JSON.stringify(BEACH),JSON.stringify(await state()));
 for(const t of await page.locator('[role=status]').all())await t.tap({timeout:1000}).catch(()=>{});await page.waitForTimeout(600);
 // 1. From the shore: is the zone visible? (projected buoy height on screen; off-screen / behind = the kid cannot see it from here)
 const buoyOnScreen=()=>page.evaluate(({x,z})=>{const c=window.__fi2.camera,v=new c.position.constructor(x,2.4,z).project(c);return {sx:Math.round((v.x+1)/2*innerWidth),sy:Math.round((1-v.y)/2*innerHeight),front:v.z<1,dist:Math.round(Math.hypot(c.position.x-x,c.position.z-z))};},SPOT);
 console.log('buoy from the shore',JSON.stringify(await buoyOnScreen()));
 await shot('dive-1-from-shore.png');
 // 2. Swim toward the zone on the phone joystick (a touch drag on the stick's pad), holding the stick straight up (forward).
 const stickPad=await page.evaluate(()=>{const e=document.querySelector('[data-joystick],.joystick,.touch-stick');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,sel:e.getAttribute('class')};});
 console.log('joystick',JSON.stringify(stickPad));
 // Put the swimmer in the water half way out (the shore is BEACH.r m from the zone's middle), facing the zone, then swim in.
 await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x:SPOT.x-BEACH.ux*(FIRST.radius+10),z:SPOT.z-BEACH.uz*(FIRST.radius+10),yaw:BEACH.yaw});
 await page.waitForTimeout(1500);
 let st=await state();console.log('in the sea',JSON.stringify(st));if(!st.inWater)throw Error('not in the water');
 console.log('buoy from 10 m outside the patch',JSON.stringify(await buoyOnScreen()));
 const holdW=async(until,ms)=>{const t0=Date.now();await page.keyboard.down('w');try{while(Date.now()-t0<ms){const s=await state();if(await until(s))return s;await page.waitForTimeout(150);}}finally{await page.keyboard.up('w');}throw Error('did not arrive: '+JSON.stringify(await state()));};
 st=await holdW(s=>s.near==='pauls-grotto'&&s.prompt==='Explore',25000);console.log('in the patch',JSON.stringify(st));
 await page.waitForTimeout(600);await shot('dive-2-prompt.png');
 // 3. Explore.
 const renderedBefore=(await state()).rendered;
 await page.locator('[data-dive-go]').tap();await page.waitForFunction(()=>window.__fi2.dive.diving&&window.__fi2.dive.room,null,{timeout:5000});
 await page.waitForTimeout(2000);
 const info=await page.evaluate(()=>{const i=window.__fi2.renderer.info.render;return {calls:i.calls,triangles:i.triangles,room:window.__fi2.dive.room.stats?.()};});
 console.log('room render',JSON.stringify(info));
 st=await state();console.log('diving',JSON.stringify(st));
 await shot('dive-3-reef.png');
 // Swim underwater to a find: turn with A / D, swim with W, Z sinks, until it is in reach.
 const swimTo=async id=>{const t0=Date.now();const keys=new Set();const set=async want=>{for(const k of ['w','a','d','z'])if(want.has(k)!==keys.has(k)){if(want.has(k)){await page.keyboard.down(k);keys.add(k);}else{await page.keyboard.up(k);keys.delete(k);}}};
  try{while(Date.now()-t0<40000){const s=await state();if(!s.diving)throw Error('surfaced before reaching '+id+': '+JSON.stringify(s));if(s.find===id)return s;
   const f=await page.evaluate(id=>{const st=window.__fi2.dive.session.state,q=st.spot.finds.find(q=>q.id===id);return q;},id);
   let d=Math.atan2(f.x-s.x,f.z-s.z)-s.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));const want=new Set();if(d>.18)want.add('a');else if(d< -.18)want.add('d');if(Math.abs(d)<.9)want.add('w');if(Math.hypot(f.x-s.x,f.z-s.z)<4)want.add('z');
   await set(want);await page.waitForTimeout(90);}}finally{await set(new Set());}
  throw Error('did not reach '+id+': '+JSON.stringify(await state()));};
 const useFind=async id=>{await page.waitForFunction(id=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden&&b.dataset.diveGo===id;},id,{timeout:5000});
  await page.locator('[data-dive-go]').tap();await page.waitForSelector(`[data-dive-card="${id}"],[data-dive-lesson]`,{timeout:4000}).catch(()=>{});
  console.log('used',id,JSON.stringify(await page.evaluate(()=>document.querySelector('[data-dive-card],[data-ball-lesson]')?.innerText.replace(/\s+/g,' ').slice(0,160))));};
 const closeCard=async()=>{const c=page.locator('[data-dive-card]');if(await c.count())await c.first().tap().catch(()=>{});await page.waitForTimeout(300);};
 await swimTo('relic');await useFind('relic');await page.waitForTimeout(500);await shot('dive-4-find.png');await closeCard();
 await swimTo('coral');await useFind('coral');await page.waitForTimeout(700);await closeCard();
 // Come up: hold ▲ (the phone's rise button) all the way to the top; holding it there surfaces.
 const up=page.locator('[data-dive-depth="up"]');const box=await up.boundingBox();console.log('rise button',JSON.stringify(box));
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.waitForFunction(()=>!window.__fi2.dive.diving,null,{timeout:15000}).finally(()=>page.mouse.up());await page.waitForTimeout(600);
 st=await state();console.log('surfaced (▲ held)',JSON.stringify(st));if(st.room)throw Error('room still allocated after surfacing');if(st.rendered<=renderedBefore)throw Error('island did not resume');
 await shot('dive-5-surfaced.png');
 await page.waitForFunction(()=>window.__fi2.dive.session.state.breath>.97,null,{timeout:15000});
 await page.waitForFunction(()=>{const b=document.querySelector('[data-dive-go]');return b&&!b.hidden&&b.textContent==='Explore';},null,{timeout:8000});
 await page.locator('[data-dive-go]').tap();await page.waitForFunction(()=>window.__fi2.dive.diving,null,{timeout:5000});await page.waitForTimeout(800);
 await swimTo('clam');await useFind('clam');await page.waitForTimeout(700);await closeCard();
 // The reef chest's hidden ball (Oct 25 2026: in the zone's open treasure chest; its animated lesson card plays under the water).
 await swimTo('hidden-ball');await useFind('hidden-ball');await page.waitForSelector('[data-ball-lesson="dive"][open]',{timeout:5000});await page.waitForTimeout(1500);await shot('dive-7-ball-lesson.png');
 for(let i=0;i<12&&await page.locator('[data-ball-lesson="dive"][open]').count();i++){await page.locator('[data-ball-lesson="dive"] [data-lesson-primary]').tap().catch(()=>{});await page.waitForTimeout(700);}
 console.log('ball lesson closed',!(await page.locator('[data-ball-lesson="dive"][open]').count()));
 // The first explore ball offers a card choice once the lesson is dismissed (cardRewardTriggers.ts): the breath holds meanwhile; pick one.
 await page.waitForTimeout(1200);const after=await page.evaluate(()=>[...document.querySelectorAll('dialog[open]')].map(d=>String(d.className).slice(0,40)));
 console.log('after the lesson',JSON.stringify(after));
 if(after.length){await shot('dive-8-card-choice.png');const b0=await page.evaluate(()=>window.__fi2.dive.session.state.breath);await page.waitForTimeout(3000);const b1=await page.evaluate(()=>window.__fi2.dive.session.state.breath);
  console.log('breath while the card choice shows',b0.toFixed(3),'->',b1.toFixed(3));if(b1<b0-.005)throw Error('the breath drains behind the card choice');
  for(let i=0;i<10&&await page.locator('dialog[open]').count();i++){const p=page.locator('dialog[open] [data-primary], dialog[open] [data-choose]').first();if(await p.count())await p.tap().catch(()=>{});else await page.keyboard.press('Escape');await page.waitForTimeout(1200);}
  console.log('card choice closed',!(await page.locator('dialog[open]').count()));}
 console.log('saved finds',await page.evaluate(()=>localStorage.getItem('fi2-dive-finds-v1')));
 // Seamless Explore: swim out across the zone's edge past the start point's side (way points round the sunken goal and the chest).
 const steer=async(tx,tz,done,ms)=>{const t0=Date.now();const keys=new Set();const set=async want=>{for(const k of ['w','a','d'])if(want.has(k)!==keys.has(k)){if(want.has(k)){await page.keyboard.down(k);keys.add(k);}else{await page.keyboard.up(k);keys.delete(k);}}};
  try{while(Date.now()-t0<ms){const s=await state();if(done(s))return s;let d=Math.atan2(tx-s.x,tz-s.z)-s.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));const want=new Set(['w']);if(d>.15)want.add('a');else if(d< -.15)want.add('d');await set(want);await page.waitForTimeout(90);}}
  finally{await set(new Set());}throw Error('did not arrive: '+JSON.stringify(await state()));};
 await steer(11,-2,s=>Math.hypot(s.x-11,s.z+2)<2.5,20000);await steer(9,13,s=>Math.hypot(s.x-9,s.z-13)<2.5,20000);
 st=await steer(4,40,s=>!s.diving,30000);await page.waitForTimeout(700);st=await state();
 console.log('out across the edge',JSON.stringify(st),'water dive',await page.evaluate(()=>window.__fi2.water.diveActive));
 await shot('dive-6-edge-out.png');
 const back=await page.evaluate(()=>({player:window.__fi2.player.root.parent===window.__fi2.scene,actions:[...document.querySelectorAll('[data-job-action]')].filter(b=>!b.closest('[hidden]')).map(b=>b.dataset.jobAction)}));
 console.log('back on the island',JSON.stringify(back));if(!back.player)throw Error('the rig did not come back to the island');
 // Still under after the edge (the duck-dive goes on): Q comes up, so the zone checks below start at the surface (a duck-diver crossing
 // into a zone's edge goes straight into its reef instead of showing the prompt).
 if(await page.evaluate(()=>window.__fi2.water.diveActive)){await page.keyboard.press('q');await page.waitForFunction(()=>!window.__fi2.water.diveActive,null,{timeout:6000});}
 // Every zone: swim in from just outside its patch and wait for its own Explore prompt.
 for(const z of ZONES){await page.evaluate(({x,z})=>window.__fi2.teleport(x,z,0),{x:z.x,z:z.z+z.radius*.4});
  await page.waitForFunction(id=>{const d=window.__fi2.dive,b=document.querySelector('[data-dive-go]');return d.session.state.near?.id===id&&b&&!b.hidden&&b.textContent==='Explore';},z.id,{timeout:10000})
   .catch(async()=>{throw Error('no Explore prompt at '+z.id+': '+JSON.stringify(await state()));});console.log('zone prompt ok',z.id);}
 console.log('errors',errors.length?errors:'none');
 await browser.close();if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
