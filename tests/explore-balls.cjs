// Explore balls (Oct 21 2026; user: "add a ball to find in each of the explore areas. Make sure the mini lesson after each ball is
// collected for this area is new and not related or similar to any other ones"): lib/town/water/diveBalls.ts, diveSpots.ts (the
// `ball` find), lib/graphics/diveBall.ts, docs/explore-ball-lessons.md. Checks: one ball per zone with a unique id, look and spot in
// the swimmable water (on the sand, off the buoy / start, clear of the other finds, pickups, the friend, the sparkle, rocks, coral,
// crates, the wreck and the arch), the found state persists and pays once, the reef journey never leads to it, the lessons (≤ 280
// characters, a plain-text credit, a source URL), each lesson's topic words absent from every other content file in the game and no
// shared 6-word phrase with them, the room's one small mesh, and the analytics id.
// Run: node tests/explore-balls.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const D=load('lib/town/water/diveSpots.ts'),B=load('lib/town/water/diveBalls.ts'),LY=load('lib/town/water/diveLayout.ts'),J=load('lib/town/water/diveJourney.ts');
const SP=load('lib/town/water/diveSparkle.ts'),DL=load('lib/town/water/diveDelight.ts'),S=load('lib/town/water/diveSession.ts');
const balls=s=>s.finds.filter(f=>f.kind==='ball');

ok('seven zones, exactly one ball each: unique names and looks, the shared find id, coins ≤ a hidden island ball',()=>{
 assert.equal(B.DIVE_BALLS.length,7);assert.equal(new Set(B.DIVE_BALLS.map(b=>b.spot)).size,7);
 for(const k of ['name','look','title'])assert.equal(new Set(B.DIVE_BALLS.map(b=>b[k])).size,7,'unique '+k);
 const ECON=load('lib/economy.ts');
 for(const s of D.DIVE_SPOTS){const b=balls(s);assert.equal(b.length,1,s.id);assert.equal(b[0].id,B.DIVE_BALL_FIND);assert.equal(new Set(s.finds.map(f=>f.id)).size,s.finds.length,'find ids unique in '+s.id);
  assert(b[0].coins>0&&b[0].coins<=ECON.LEARN_COINS.ball);assert.equal(b[0].label,'Real football fact');assert.equal(b[0].prompt,'Pick up');}
});

ok('each ball sits in its zone’s treasure chest in swimmable water, clear of the buoy, start, finds, pickups, friend, sparkle and every solid piece',()=>{
 for(const s of D.DIVE_SPOTS){const b=balls(s)[0],L=LY.diveLayout(s),d=p=>Math.hypot(p.x-b.x,p.z-b.z),p=D.diveFindPoint(b,undefined,s.floor),r=D.diveDepthRange(b.x,b.z,s.floor);
  assert(Math.hypot(b.x,b.z)<D.DIVE_ROOM_R-4,'inside the room '+s.id);assert(LY.diveLayoutFree(L,s,b.x,b.z,.4,{lanes:false,finds:false,keep:1}),'inside the footprint, off the wreck / pitch / arch '+s.id);/* keep 1: the chest keeps the old coin's spot (Kelp Forest's is near the rim) */
  assert(Math.hypot(b.x,b.z)>5,'not by the buoy '+s.id);assert(d(L.start)>6,'not by the start / come-up point '+s.id);
  assert(p.y<D.DIVE_SURFACE_Y-1&&r.min<p.y+D.DIVE_FIND_RANGE,'under water and reachable by swimming '+s.id);
  assert(Math.min(...D.diveTaskFinds(s).map(d))>=3.6,'clear of the other finds '+s.id);
  assert(Math.min(...J.journeyPickups(s).map(d))>=1.5,'clear of the journey pickups (the chest is a path waypoint, as the coin was) '+s.id);assert(d(DL.friendHome(s))>=3,'clear of the zone friend '+s.id);
  for(let k=0;k<40;k++)assert(d(SP.sparkleSpot(s,SP.localDate(new Date(2026,9,1+k))))>=2.5,'clear of the sparkle '+s.id);
  for(const c of L.clusters)assert(d(c)>c.r+.5,'not inside coral '+s.id);for(const k of L.rocks)assert(d(k)>k.s+.5,'not inside a rock '+s.id);
  for(const c of L.crates)assert(d(c)>1.2,'not inside a crate '+s.id);for(const lb of L.balls)assert(d(lb)>1.5,'apart from the spilled balls '+s.id);
  if(L.pitch)assert(Math.hypot(b.x-L.pitch.cx,b.z-L.pitch.cz)>6,'away from the kickable ball');}
 assert.equal(new Set(D.DIVE_SPOTS.map(s=>{const b=balls(s)[0];return b.x+','+b.z;})).size,7,'seven different spots');
});

ok('the chest’s ball keeps the old coin’s place in the layout (nothing moved) and the reef journey never leads to it',()=>{
 for(const s of D.DIVE_SPOTS){const b0=balls(s)[0],coin={...s,finds:s.finds.map(f=>f.kind==='ball'?{...f,id:'treasure',kind:'treasure'}:f)},a=LY.buildLayout(s),b=LY.buildLayout(coin);
  for(const k of ['clusters','rocks','grass','kelp','crates','balls'])assert.equal(JSON.stringify(a[k]),JSON.stringify(b[k]),k+' '+s.id);
  assert.equal(B.diveBallFor(s.id).x,b0.x);assert.equal(b0.y,B.DIVE_BALL_CHEST_Y,'in the chest, over the sand');assert(!s.finds.some(f=>f.kind==='treasure'),'no coin find left '+s.id);
  assert(a.finds.some(f=>f.id===B.DIVE_BALL_FIND),'later placements keep off it '+s.id);
  assert(J.journeyPath(s).some(p=>p.id===B.DIVE_BALL_FIND),'the chest stays a waypoint (the pickups keep their places) '+s.id);assert.equal(J.journeyTotal(s),J.journeyPickups(s).length+3,'relic, coral, clam (the chest holds the secret ball)');
  const p=J.journeyPickups(s),out={x:0,z:0};assert.equal(J.nextTarget(s,p,p.map(()=>true),D.diveTaskFinds(s).map(f=>f.id),0,13,out),null,'the buddy does not lead to the hidden ball');}
});

ok('found state: saved in the dive finds store, kept on reload, credited once, the progress note counts it',()=>{
 let save=S.parseDiveFinds(null);const s=D.diveSpotById('turtle-pool');
 save=S.addDiveFind(save,s.id,B.DIVE_BALL_FIND);save=S.parseDiveFinds(JSON.parse(JSON.stringify(save)));assert.equal(JSON.stringify(save.spots[s.id]),JSON.stringify([B.DIVE_BALL_FIND]));
 assert.equal(B.diveBallsFound(save.spots),1);assert.equal(B.diveBallNote(1),'Explore balls found: 1 of 7');assert.equal(B.diveBallNote(7),'All 7 explore balls found');
 const all={};for(const z of D.DIVE_SPOTS)all[z.id]=[B.DIVE_BALL_FIND];assert(JSON.stringify(S.parseDiveFinds({version:1,spots:all})).length<400,'small in the save');
 const sess=S.createDiveSession(D.DIVE_SPOTS,id=>save.spots[id]??[]),ball=balls(s)[0];
 sess.state.spot=s;sess.state.phase='diving';sess.state.find=ball;let e=sess.use();assert.equal(e.firstFind,false,'already found: not again');assert.equal(e.coins,0);
 const fresh=S.createDiveSession(D.DIVE_SPOTS,()=>[]);fresh.state.spot=s;fresh.state.phase='diving';fresh.state.find=ball;e=fresh.use();assert.equal(e.firstFind,true);assert.equal(e.coins,B.DIVE_BALL_COINS);
 e=fresh.use();assert.equal(e.coins,0,'once per visit too');
});

// Every other content file a kid can meet text from: the game's code, data and docs, minus this feature's own files.
// diveBallLessons.ts (Oct 25 2026) is the seven balls' animated lessons: their own text, checked below so each topic stays in its own lesson.
const OWN=new Set(['lib/town/water/diveBalls.ts','lib/town/water/diveBallLessons.ts','lib/graphics/diveBall.ts','docs/explore-ball-lessons.md','tests/explore-balls.cjs']);
function walk(dir,out){for(const e of fs.readdirSync(path.join(base,dir),{withFileTypes:true})){const rel=path.join(dir,e.name);
 if(e.isDirectory()){if(!['node_modules','.next','designs'].includes(e.name)&&!e.name.startsWith('.next'))walk(rel,out);}
 else if(/\.(ts|tsx|json|md)$/.test(e.name)&&!OWN.has(rel)&&fs.statSync(path.join(base,rel)).size<3e6)out.push(rel);}return out;}
// Kid-facing text lives in lib, components and app (code and data) and the docs' lesson tables; analytics region names and the docs'
// design specs (museum ball briefs etc.) are not shown to kids.
const corpusFiles=['lib','components','app','docs'].filter(d=>fs.existsSync(path.join(base,d))).flatMap(d=>walk(d,[]))
 .filter(f=>!f.startsWith('lib/analytics/')&&(!f.startsWith('docs/')||/lesson|fact|ball-hunt|stor(y|ies)|audit/i.test(f)));
const norm=t=>t.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ');
const corpus=norm(corpusFiles.map(f=>fs.readFileSync(path.join(base,f),'utf8')).join(' \n '));

ok('the lessons: ≤ 280 characters, kid-short, a plain-text credit (no link) and a checked source URL',()=>{
 for(const b of B.DIVE_BALLS){assert(b.text.length<=280,b.spot+' '+b.text.length);assert(b.text.length>=120,b.spot);assert(b.title.length<=40);
  for(const t of [b.title,b.text,b.credit,b.name,b.hide])assert(!/https?:|www\.|\.com|\.org/.test(t),'no links in kid text: '+t);
  assert(/^https:\/\/[^\s]+$/.test(b.source),'a source URL '+b.spot);assert(b.topic.length>=1);}
 const docs=read('docs/explore-ball-lessons.md');for(const b of B.DIVE_BALLS){assert(docs.includes(b.source),'documented source '+b.spot);assert(docs.includes(b.title),'documented '+b.spot);}
});

ok('new and unrelated: no topic word is shared between the seven, and none appears anywhere else in the game ('+corpusFiles.length+' files)',()=>{
 const seen=new Set();
 for(const b of B.DIVE_BALLS)for(const k of b.topic){const n=norm(k).trim();assert(!seen.has(n),'topic repeated: '+k);seen.add(n);
  assert(norm(b.text+' '+b.title).includes(n),'the topic word is in its own lesson: '+k);
  const re=new RegExp('(^|[^a-z])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^a-z])');assert(!re.test(corpus),'topic “'+k+'” already appears in other game content');}
 for(const b of B.DIVE_BALLS)for(const o of B.DIVE_BALLS)if(o!==b)for(const k of o.topic)assert(!norm(b.text).includes(norm(k).trim()),b.spot+' touches '+o.spot+'’s topic');
});

ok('the animated lessons (diveBallLessons.ts, excluded from the corpus above) keep each topic in its own ball’s lesson, and hold nothing but the seven',()=>{
 const DL=load('lib/town/water/diveBallLessons.ts'),zones=[...B.DIVE_BALLS.map(b=>b.spot)].sort();
 assert.deepEqual(Object.keys(DL.DIVE_BALL_LESSONS).sort(),zones);assert.deepEqual(Object.keys(DL.DIVE_BALL_PRACTICE).sort(),zones);
 assert.deepEqual(Object.values(DL.DIVE_BALL_LESSONS).map(l=>l.kind).sort(),Object.keys(DL.DIVE_BALL_SCENES).sort(),'one scene per ball, no extras');
 const text=b=>{const l=DL.DIVE_BALL_LESSONS[b.spot],sc=DL.DIVE_BALL_SCENES[l.kind];return norm([...l.steps,...l.actions,DL.DIVE_BALL_PRACTICE[b.spot],JSON.stringify(sc)].join(' '));};
 for(const b of B.DIVE_BALLS)for(const o of B.DIVE_BALLS)if(o!==b)for(const k of o.topic){const n=norm(k).trim();assert(!new RegExp('(^|[^a-z])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^a-z])').test(text(b)),b.spot+'’s lesson touches '+o.spot+'’s topic “'+k+'”');}
 // And the lesson file is the only new home of the topics: the shared scene engine only spreads it in.
 assert(/\.\.\.DIVE_BALL_SCENES,/.test(read('lib/town/ballLessonScenes.ts')));
});

ok('no shared 6-word phrase with any other lesson, fact or story in the game (and not with the zone’s own finds)',()=>{
 for(const b of B.DIVE_BALLS){const w=norm(b.text).trim().split(' ');
  for(let i=0;i+6<=w.length;i++){const ph=' '+w.slice(i,i+6).join(' ')+' ';assert(!corpus.includes(ph),b.spot+': “'+ph.trim()+'” already in the game');}
  const s=D.diveSpotById(b.spot);for(const f of D.diveTaskFinds(s))assert.notEqual(norm(f.text),norm(b.text));}
});

ok('the room: one small vertex-coloured mesh (no texture) until found, the pick-up plays and hides it, no mesh once found',()=>{
 const R=load('lib/graphics/diveRoom.ts');
 for(const s of D.DIVE_SPOTS){const room=R.createDiveRoom(s,{phone:true,reduced:false,found:[]});let m=null;room.scene.traverse(o=>{if(o.name==='dive-hidden-ball')m=o;});
  assert(m&&m.isMesh,'the ball mesh '+s.id);assert(!m.material.map,'no texture');assert(m.material.vertexColors);assert(m.geometry.getAttribute('position').count/3<=1300,'small');
  const b=balls(s)[0];room.frame(1,1/30,{x:0,y:1,z:13,yaw:Math.PI});room.use(b,1);for(let i=0;i<40;i++)room.frame(1+i/30,1/30,{x:0,y:1,z:13,yaw:Math.PI});assert.equal(m.visible,false,'collected into the bag '+s.id);room.dispose();
  const done=R.createDiveRoom(s,{phone:true,reduced:false,found:[B.DIVE_BALL_FIND]});let n=0;done.scene.traverse(o=>{if(o.name==='dive-hidden-ball')n++;});assert.equal(n,0,'found: gone');done.dispose();}
 const looks=new Set();const DB=load('lib/graphics/diveBall.ts'),c=new T.Color(),v=new T.Vector3(.3,.8,.52).normalize();
 for(const b of B.DIVE_BALLS){DB.diveBallPaint(b.look,v,c);looks.add(b.look);}assert.equal(looks.size,7);
});

ok('analytics: wa:dive_ball_find registered, counted on a first ball find and on the Water admin tile',()=>{
 const C=load('lib/analytics/countIds.ts');assert(C.WATER_COUNT_EVENTS.some(([e])=>e==='dive_ball_find'));assert.equal(C.isCountId('wa:dive_ball_find'),true);
 assert(read('lib/analytics/waterEvents.ts').includes(`'wa:dive_ball_find'`));assert(read('app/admin/WaterSection.tsx').includes(`'wa:dive_ball_find'`));
 assert(/if\(f\.kind==='ball'\)\{countDiveBallFind\(\);/.test(read('components/Town.tsx')));
});

if(failed){console.log(`explore-balls: ${failed} failed`);process.exit(1);}console.log('explore-balls: all passed');
