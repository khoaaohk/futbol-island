// Explore delight (Oct 21 2026; docs/swimming-research.md §12, docs/performance-guide.md "Explore delight"): the whale shadow, the zone
// friends' wave / high five, the daily sparkle spot, the slower glide near finds, the heat switches, the save and the room's budget.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const mem=new Map();G.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const D=load('lib/town/water/diveSpots.ts'),S=load('lib/town/water/diveSession.ts'),J=load('lib/town/water/diveJourney.ts'),X=load('lib/town/water/diveDelight.ts'),SP=load('lib/town/water/diveSparkle.ts');
const RT=load('lib/town/water/diveRuntime.ts'),R=load('lib/graphics/diveRoom.ts');
const DATE='2026-10-21';
function runtime(over={}){const root=new T.Group(),scene=new T.Scene();scene.add(root);const log={credits:[],whale:[],emote:[],sparkle:0};
 const ports={scene,renderer:{render(){}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update(){}},phone:true,reduced:()=>false,ui:()=>null,place(){},hide(){},
  entered(){},surfaced(){},found(){},credit:(id,c)=>log.credits.push([id,c]),low(){},out(){},fly:()=>false,date:()=>DATE,rand:()=>0,
  whale:e=>log.whale.push(e),emote:(k,e,f)=>log.emote.push(k+':'+e+(f?':first':'')),sparkle:()=>log.sparkle++,...over};
 return {rt:RT.createDiveRuntime(ports),log};}
const enter=(rt,id)=>{const z=D.diveSpotById(id);rt.scan(.2,z.x,z.z,true);assert(rt.start(),'dive at '+id);return z;};
const hold=st=>{st.breath=1;st.vx=st.vz=0;};
// A clean save for each case (the runtime reads localStorage; the vm has none, so every runtime starts empty unless we give it one).
const fresh=()=>mem.clear();

ok('findSlow: an eased curve (0 beyond 4 m, 1 within 1.4 m), and the swim near a find is slower and thicker (the Dart was removed Oct 21/22 2026); unchanged elsewhere',()=>{
 assert.equal(S.findSlow(Infinity),0);assert.equal(S.findSlow(4),0);assert.equal(S.findSlow(10),0);assert.equal(S.findSlow(1.4),1);assert.equal(S.findSlow(0),1);
 let prev=1;for(let d=0;d<=4.2;d+=.05){const k=S.findSlow(d);assert(k<=prev+1e-12,'monotonic');assert(k>=0&&k<=1);prev=k;}
 assert(Math.abs(S.findSlow(2.7)-.5)<.01,'smooth middle');assert(S.findSlow(3.9)<.02&&S.findSlow(1.5)>.98,'no sudden brake at either end');
 const spot=D.diveSpotById('ray-meadow');
 const swim=(near)=>{const s=S.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());for(let i=0;i<90;i++)s.step(1/30,{sx:0,sy:-1,lift:0,near});
  const top=Math.hypot(s.state.vx,s.state.vz);  const x0=s.state.x,z0=s.state.z;for(let i=0;i<45;i++)s.step(1/30,{sx:0,sy:0,lift:0,near});return {top,coast:Math.hypot(s.state.x-x0,s.state.z-z0),slow:s.state.slow};};
 const far=swim(undefined),inf=swim(Infinity),close=swim(1);
 assert.equal(far.top,inf.top,'nothing near: the swim is exactly as before');assert(Math.abs(far.top-S.DIVE_SPEED)<.05,'full speed far away');
 assert(Math.abs(close.top-S.DIVE_SPEED*(1-S.FIND_SLOW.speed))<.08,'top speed eased down 25% by a find: '+close.top.toFixed(2));assert.equal(close.slow,1);
 assert(close.coast<far.coast*.75,'the glide stops sooner by a find (thicker water): '+close.coast.toFixed(2)+' vs '+far.coast.toFixed(2));
 assert(D.DIVE_FIND_RANGE>=3.2&&J.PICKUP_RANGE>=1.6,'the find prompt and the pickup reach are a little larger, so slow drifting still gets them');
 const src=read('lib/town/water/diveSession.ts'),step=src.slice(src.indexOf('  step(dt:number'),src.indexOf('  use(){'));assert(!/new [A-Z]/.test(step),'no allocation in step');
});

ok('whale: 45-120 s after entering, rarer on repeat visits, never while busy; the shadow fades in and out; once per visit, the stamp once ever per zone',()=>{
 for(let a=0;a<=1;a+=.1){const t=X.whalePlan(a,0,false);assert(t>=45&&t<=120);}
 assert.equal(X.whalePlan(.5,.9,true),-1,'seen before: only some visits');assert(X.whalePlan(.5,.1,true)>0);assert(X.whalePlan(.5,.99,false)>0,'first time: always');
 assert.equal(X.whaleGo(50,45,false,true),false,'busy (a pickup, an emote, a card): wait');assert.equal(X.whaleGo(50,45,true,false),false,'once per visit');assert.equal(X.whaleGo(40,45,false,false),false);assert(X.whaleGo(46,45,false,false));
 const o={x:0,z:0,k:0};X.whalePose(0,0,0,0,o);assert(o.k<1e-9);X.whalePose(1,0,0,0,o);assert(o.k<1e-9);X.whalePose(.5,3,4,0,o);assert(Math.abs(o.k-1)<1e-9&&Math.abs(o.x-3)<1e-9&&Math.abs(o.z-4)<1e-9,'over the diver at the middle');
 X.whalePose(0,0,0,Math.PI/2,o);assert(Math.abs(o.x+X.WHALE.len/2)<1e-9,'starts off to one side');
 fresh();const {rt,log}=runtime(),z=enter(rt,'turtle-pool'),st=rt.session.state;
 for(let i=0;i<44*10;i++){rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(st);}assert.equal(log.whale.length,0,'not before 45 s');
 RT.diveStore.set({card:{id:'x',title:'',text:'',label:'',coins:0}});for(let i=0;i<30;i++){rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(st);}assert.equal(log.whale.length,0,'waits while a card shows');
 RT.diveStore.set({card:null});for(let i=0;i<200;i++){rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(st);}
 assert.deepEqual(log.whale,['pass','stamp'],'one pass, one stamp');assert.deepEqual(log.credits.filter(c=>c[0].endsWith(':whale')),[['dive:turtle-pool:whale',1]]);
 for(let i=0;i<300;i++){rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(st);}assert.equal(log.whale.length,2,'at most once a visit');
 assert(J.parseDiveReef(JSON.parse(mem.get(J.DIVE_REEF_KEY)),D.DIVE_SPOTS).whale.includes(z.id),'remembered');rt.dispose();
 // A repeat visit: the stamp is never paid again; with b over the repeat chance there is no whale at all.
 const again=runtime({rand:()=>.9});enter(again.rt,'turtle-pool');for(let i=0;i<1400;i++){again.rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(again.rt.session.state);}
 assert.equal(again.log.whale.length,0,'a repeat visit: rarer');again.rt.dispose();
});

ok('heat switches: calm (heat tier 3+ / Battery saver) and reduced motion: no whale, a still sparkle; the room ignores the whale when calm',()=>{
 for(const over of [{calm:()=>true},{reduced:()=>true}]){fresh();const {rt,log}=runtime(over);enter(rt,'moon-arch');for(let i=0;i<1400;i++){rt.frame(.1,{sx:0,sy:0,lift:0},390,844);hold(rt.session.state);}
  assert.equal(log.whale.length,0,'no whale '+Object.keys(over)[0]);rt.dispose();}
 const src=read('lib/graphics/diveRoom.ts');assert(src.includes('setWhale(x:number,z:number,yaw:number,k:number){if(opt.calm)k=0;'),'the room drops the whale when calm');
 assert(src.includes('uTwinkle:{value:opt.calm||opt.reduced?0:1}'),'the sparkle holds still when calm or reduced');
 assert(read('components/Town.tsx').includes('calm:()=>heat.tier>=3,'),'Town: calm at heat tier 3+ (Battery saver is tier 4)');
});

ok('emotes: every zone has a friend; range and cooldown; a heart each up to 3, the reward once; the diver waves and the hands meet with a ring',()=>{
 assert.equal(Object.keys(X.DIVE_FRIENDS).length,7);for(const z of D.DIVE_SPOTS)assert(X.DIVE_FRIENDS[z.id],'a friend at '+z.id);
 assert.equal(new Set(Object.values(X.DIVE_FRIENDS).map(f=>f.kind)).size,7,'seven different friends');
 assert.equal(X.emoteReady(3.9,0),true);assert.equal(X.emoteReady(4.1,0),false);assert.equal(X.emoteReady(1,.5),false,'cooldown');
 const h={n:0,done:false};assert.deepEqual({...X.emoteHeart(0,h)},{n:1,done:false});assert.deepEqual({...X.emoteHeart(2,h)},{n:3,done:true});assert.deepEqual({...X.emoteHeart(3,h)},{n:3,done:false},'capped, paid once');
 assert.equal(X.emoteAmount(-1),0);assert.equal(X.emoteAmount(X.EMOTE.dur+.1),0);assert.equal(X.emoteAmount(.5),1);assert.equal(X.EMOTE.cooldown,2);
 for(const z of D.DIVE_SPOTS){const h0=X.friendHome(z);assert(Math.hypot(h0.x,h0.z)<D.DIVE_ROOM_R-3.9,'inside '+z.id);assert(h0.y>D.diveFloor(h0.x,h0.z,z.floor)&&h0.y<D.DIVE_SURFACE_Y-.5,'in the water '+z.id);
  assert(Math.hypot(h0.x,h0.z-13)>3,'off the start '+z.id);for(const f of z.finds)assert(Math.hypot(f.x-h0.x,f.z-h0.z)>1.5,'off the finds '+z.id);}
 fresh();const {rt,log}=runtime(),z=enter(rt,'pauls-grotto'),st=rt.session.state,hm=X.friendHome(z);
 st.x=hm.x+8;st.z=hm.z;st.y=hm.y;RT.diveLift.emote='wave';rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(log.emote.length,0,'too far: nothing');assert(RT.diveStore.get().note.includes('Swim closer'));
 assert.equal(RT.diveStore.get().friend,'','no buttons when far');
 st.x=hm.x+2;st.z=hm.z;st.y=hm.y;hold(st);rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(RT.diveStore.get().friend,X.DIVE_FRIENDS[z.id].name,'the buttons show within reach');
 RT.diveLift.emote='five';rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.deepEqual(log.emote,['five:start:first']);assert.equal(RT.diveStore.get().hearts,1);
 for(let i=0;i<20;i++){st.x=hm.x+2;st.z=hm.z;st.y=hm.y;hold(st);rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);}assert(log.emote.includes('five:meet'),'the hands meet (pop, sparkle ring)');
 RT.diveLift.emote='wave';rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(RT.diveStore.get().hearts,1,'cooldown: no heart');
 for(let k=0;k<4;k++){for(let i=0;i<70;i++){st.x=hm.x+2;st.z=hm.z;st.y=hm.y;hold(st);rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);}RT.diveLift.emote=k%2?'five':'wave';rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);}
 assert.equal(RT.diveStore.get().hearts,3,'capped at 3');assert.deepEqual(log.credits.filter(c=>c[0].endsWith(':friend')),[['dive:pauls-grotto:friend',1]],'the reward once');
 assert.equal(log.emote.filter(e=>e.endsWith(':first')).length,1,'analytics once per dive');rt.dispose();
 const P=load('lib/graphics/swimPose.ts'),src=read('lib/graphics/swimPose.ts');assert(src.includes('wave?:number;five?:number;emoteT?:number;'));assert(read('lib/town/water/diveRuntime.ts').includes('pose.wave=wave;pose.five=five;'));void P;
 assert(/k==='g'\|\|k==='h'/.test(read('lib/town/water/diveRuntime.ts')),'G / H on desktop');
});

ok('daily sparkle: one spot a day per zone, stable for the date, clear of the buoy, start, finds, pickups and rocks; once a day, remembered',()=>{
 assert(SP.SPARKLE_FACTS.length>=5&&SP.SPARKLE_FACTS.length<=7);assert.equal(new Set(SP.SPARKLE_FACTS).size,SP.SPARKLE_FACTS.length);
 const finds=D.DIVE_SPOTS.flatMap(z=>z.finds.map(f=>f.text.toLowerCase())).join(' ')+read('lib/town/water/diveJourney.ts').toLowerCase();
 for(const f of SP.SPARKLE_FACTS){assert(f.length<=120,f);assert(!finds.includes(f.toLowerCase().slice(0,30)),'not a repeat: '+f);}
 assert.equal(SP.localDate(new Date(2026,0,5)),'2026-01-05');let moved=0;
 for(const z of D.DIVE_SPOTS){const a=SP.sparkleSpot(z,DATE),b=SP.sparkleSpot(z,DATE),c=SP.sparkleSpot(z,'2026-10-22');assert.deepEqual(a,b,'stable '+z.id);if(Math.hypot(a.x-c.x,a.z-c.z)>1)moved++;
  const L=load('lib/town/water/diveLayout.ts').diveLayout(z);assert(Math.hypot(a.x,a.z)<D.DIVE_ROOM_R-3.9,'inside '+z.id);assert(Math.abs(a.y-D.diveFloor(a.x,a.z,z.floor))<1e-9,'on the sand');
  assert(Math.hypot(a.x-L.buoy.x,a.z-L.buoy.z)>3,'off the buoy');assert(Math.hypot(a.x,a.z-13)>3,'off the start');
  for(const f of z.finds)assert(Math.hypot(f.x-a.x,f.z-a.z)>2,'off the finds '+z.id);for(const p of J.journeyPickups(z))assert(Math.hypot(p.x-a.x,p.z-a.z)>2,'off the pickups '+z.id);
  for(const k of L.rocks)assert(Math.hypot(k.x-a.x,k.z-a.z)>k.s+2,'off the rocks '+z.id);}
 assert(moved>=5,'it moves day to day: '+moved);
 let sv=SP.markSparkle(undefined,'moon-arch',DATE);assert(SP.sparkleDone(sv,'moon-arch',DATE));assert(!SP.sparkleDone(sv,'ray-meadow',DATE));assert(!SP.sparkleDone(sv,'moon-arch','2026-10-22'),'a new day');
 sv=SP.markSparkle(sv,'ray-meadow',DATE);assert(SP.sparkleDone(sv,'moon-arch',DATE)&&SP.sparkleDone(sv,'ray-meadow',DATE));assert.equal(SP.markSparkle(sv,'pauls-grotto','2026-10-22').m,1<<SP.sparkleBit('pauls-grotto'),'fresh mask tomorrow');
 fresh();const {rt,log}=runtime(),z=enter(rt,'kelp-trawler'),st=rt.session.state,sp=SP.sparkleSpot(z,DATE);
 st.x=sp.x;st.z=sp.z;st.y=sp.y+1;hold(st);rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);
 assert.equal(log.sparkle,1);assert.deepEqual(log.credits.filter(c=>c[0].includes(':sparkle:')),[['dive:kelp-trawler:sparkle:'+DATE,1]]);assert.equal(RT.diveStore.get().card.id,'sparkle');assert(SP.SPARKLE_FACTS.includes(RT.diveStore.get().card.text));
 rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(log.sparkle,1,'once');rt.dispose();
 const again=runtime();enter(again.rt,'kelp-trawler');const s2=again.rt.session.state;s2.x=sp.x;s2.z=sp.z;s2.y=sp.y+1;again.rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(again.log.sparkle,0,'found today already');again.rt.dispose();
 const next=runtime({date:()=>'2026-10-22'});enter(next.rt,'kelp-trawler');const sp3=SP.sparkleSpot(z,'2026-10-22'),s3=next.rt.session.state;s3.x=sp3.x;s3.z=sp3.z;s3.y=sp3.y+1;next.rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);assert.equal(next.log.sparkle,1,'tomorrow there is a new one');next.rt.dispose();
});

ok('the save: hearts, whale and the sparkle day in fi2-dive-reef-v1, junk dropped, small (well under the key cap)',()=>{
 const p=J.parseDiveReef({zones:{},restored:[],hearts:{'moon-arch':2,'ray-meadow':9,nope:1,'pauls-grotto':'x'},whale:['moon-arch','nope','moon-arch'],spark:{d:DATE,m:5}},D.DIVE_SPOTS);
 assert.deepEqual({...p.hearts},{'moon-arch':2,'ray-meadow':3});assert.deepEqual([...p.whale],['moon-arch']);assert.deepEqual({...p.spark},{d:DATE,m:5});
 assert.equal(J.parseDiveReef({spark:{d:'yesterday',m:3}},D.DIVE_SPOTS).spark,undefined);assert.equal(J.parseDiveReef(null,D.DIVE_SPOTS).hearts,undefined,'old saves unchanged');
 let full={version:1,zones:{},restored:[]};for(const z of D.DIVE_SPOTS){for(let i=0;i<8;i++)full=J.addPickup(full,z.id,i);full=J.markRestored(full,z.id);full=J.setHearts(full,z.id,3);full=J.markWhale(full,z.id);full={...full,spark:SP.markSparkle(full.spark,z.id,DATE)};}
 const bytes=JSON.stringify(J.parseDiveReef(full,D.DIVE_SPOTS)).length,SN=load('lib/saves/snapshot.ts');assert(bytes<1500,'a full save is small: '+bytes+' bytes');assert(bytes<SN.MAX_KEY_BYTES);
 const CID=load('lib/analytics/countIds.ts');for(const id of ['wa:dive_whale','wa:dive_emote','wa:dive_sparkle'])assert(CID.isCountId(id),id);
 assert(/\^\(.*dive:/.test(read('lib/town/dailyMeter.ts')),'the coins are dive: runs, metered by the Training meter');
});

ok('the room: the friend is an instance of the pickups draw and the sparkle and ring live in the bubbles draw (no extra draw), within the caps',()=>{
 const rows=[];
 for(const z of D.DIVE_SPOTS){const picks=J.journeyPickups(z),h=X.friendHome(z),sp=SP.sparkleSpot(z,DATE);
  const a=R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:picks}),b=R.createDiveRoom(z,{phone:true,reduced:false,found:[],pickups:picks,friend:{kind:X.DIVE_FRIENDS[z.id].kind,...h},sparkle:sp});
  const sa=a.stats(),sb=b.stats();assert.equal(sb.draws,sa.draws,'no extra draw '+z.id);assert(b.hasFriend);assert(sb.draws<=17&&sb.triangles<76000,z.id+" "+sb.draws+" "+sb.triangles);/* 16 + the hidden explore ball (one small mesh until found; diveBall.ts, Oct 21 2026) */
  b.setFriend(h.x,h.y,h.z,1,0,0,1,0,.2,1);b.setWhale(0,0,0,1);b.ring(0,1,0,1);b.setSparkle(false);b.frame(1,1/30,{x:0,y:1,z:13,yaw:Math.PI});
  rows.push(`${z.id}:+${sb.triangles-sa.triangles}`);assert(sb.triangles-sa.triangles<4000,'friend cost (9 instances share its geometry) '+z.id);a.dispose();b.dispose();}
 for(const k of Object.values(X.DIVE_FRIENDS).map(f=>f.kind)){let t=0;for(const q of R.friendParts(k)){const g=q.g;t+=(g.index?g.index.count:g.getAttribute('position').count)/3;g.dispose();}assert(t>=60&&t<=340,k+' '+t+' triangles');}
 console.log('     friend + sparkle added (phone triangles, draws unchanged): '+rows.join(' '));
 const src=read('lib/graphics/diveRoom.ts'),draw=src.slice(src.indexOf('  frame(t:number'),src.indexOf('  collect(i:number'));assert(!/new T\.|\[\]|=>\{/.test(draw.replace(/\/\/.*$/gm,'')),'no allocation in the room frame');
 const set=src.slice(src.indexOf('  setFriend('),src.indexOf('  setSparkle('));assert(!/new T\./.test(set),'no allocation in setFriend / setWhale / ring');
});

ok('HUD: Wave / High five above Dart (never over Dart or the rise / dip pad), hearts on the reef chip; the Entering chip waits its turn (one at a time)',()=>{
 const hud=read('components/DiveHud.tsx'),css=read('app/globals.css');
 assert(hud.includes('data-dive-emote-btn="hi"')&&hud.includes("diveLift.emote='wave'")&&hud.includes("diveLift.emote='five'")&&hud.includes('t-lastWave<2000'),'one Say hi button: a tap waves, a second tap within 2 s high-fives (Calm HUD)');
 assert(hud.includes('{v.diving&&v.friend?'),'shown only while the friend is in reach');assert(!hud.includes('className="dive-reef"'),'the Reef n/12 chip is gone (user, Oct 21 2026)');
 assert(hud.includes("toastLane.request('dive-edge')")&&hud.includes("useToastLaneBusy('dive-edge')"),'the chip shares the toast lane with the lesson card');
 const px=(sel,prop,phone)=>{const block=phone?css.slice(css.indexOf('@media(max-width:600px),(pointer:coarse){'+sel+'{')):css.slice(css.indexOf('\n'+sel+'{'));const m=block.match(new RegExp(prop+':([^;}]+)'));return m[1];};
 // Explore room layout (Oct 22 2026): Say hi at the bottom right under Fly, ▲ ▼ on the left (tests/calm-hud.cjs pins the cells).
 assert(css.includes('.town-app:has(.dive-depth) .dive-emote{right:var(--room-rr);bottom:var(--room-rb)'),'Say hi bottom right');void px;
});
console.log(`\nexplore-delight: ${passed} passed`);
