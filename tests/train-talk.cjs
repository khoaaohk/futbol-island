// Island Line train talk (Nov 24 2026): talkable passengers with real content, and every train NPC line tied to football.
// Run: node tests/train-talk.cjs
//  1. pools: every passenger archetype has teaching topics, quizzes, banter and liked events; every fact carries a source comment
//     and `src`; Learn links are real pages; events come from game data
//  2. football tags: every station islander / Kenji / passenger line has a football topic tag (social `ride` only on social lines)
//  3. rotation: no repeats in a session until a pool is used up; a talk definition has banter + 3 topics + a quick question
//  4. picking: Talk only within range and in view (standing), a tap / aim within ~2 seats (seated), no passenger labels while riding
//  5. runtime: the talk opens on a tap and closes; the talked-to passenger turns toward me; Town hooks
const assert=require('node:assert/strict');
const T=require('three');
const fs=require('node:fs');
const {L,read}=require('./lib/tsLoad.cjs');
const PL=L('lib/town/trainPassengerTalkPools.ts'),TK=L('lib/town/trainPassengerTalk.ts'),PX=L('lib/town/trainPassengers.ts'),TG=L('lib/town/trainTalkTags.ts');
const TOPICS=new Set(TG.FOOTBALL_TOPICS);
// ---- 1. pools
{const roles=new Set(PX.CAST.filter(c=>!c.boarder).map(c=>c.role));
 for(const r of roles)assert(PL.isTalkRole(r),'every cast role has a talk pool: '+r);
 for(const r of PL.TALK_ROLES){const p=PL.ROLE_POOLS[r];assert(p.teach.length>=4&&p.quiz.length>=2&&p.banter.length>=4&&p.likes.length>=2,'pools for '+r);
  for(const q of p.quiz){assert.equal(q.options.length,3);assert(q.correct>=0&&q.correct<3&&q.right&&q.wrong,'quiz '+q.id);}
  assert(p.banter.some(b=>b.includes('{next}')),'banter about the next stop: '+r);}
 const src=read('lib/town/trainPassengerTalkPools.ts');
 const facts=[...PL.ALL_TEACH,...PL.ALL_QUIZ,...PL.FITNESS.filter(f=>f.src)];
 for(const f of [...PL.ALL_TEACH,...PL.ALL_QUIZ])assert(f.src&&f.src.length>3,'source on '+f.id);
 const comments=(src.match(/\/\/ (Source|Football idea)/g)||[]).length;
 assert(comments>=PL.ALL_TEACH.length+PL.ALL_QUIZ.length+PL.FITNESS.length,`a source comment per fact (${comments} for ${facts.length})`);
 // Learn links: real pages
 const terms=read('lib/site/terms.ts'),rules=read('lib/site/rules.ts');
 for(const t of [...PL.ALL_TEACH,...PL.FITNESS])if(t.learn){const m=t.learn.match(/^\/learn\/(soccer-terms|soccer-rules)\/([a-z0-9-]+)$/);
  if(m)assert((m[1]==='soccer-terms'?terms:rules).includes(`slug:'${m[2]}'`),'Learn page exists: '+t.learn);
  else assert(fs.existsSync(`app/(site)${t.learn}/page.tsx`)||fs.existsSync(`app/(site)${t.learn}`),'Learn page exists: '+t.learn);}
 // events from real game data
 const {arcadeCabinets}=L('lib/arcade/arcadeCatalog.ts'),{STAMPS}=L('lib/town/islandStamps.ts');
 assert.equal(PL.EVENTS.arcade.length,arcadeCabinets.length,'one arcade line per real cabinet');
 for(const e of PL.EVENTS.arcade)assert(arcadeCabinets.some(c=>e.answer.includes(c.name)),e.id);
 assert(PL.EVENTS.stamps[0].answer.includes(String(STAMPS.length)),'stamp count from the stamp book');
 assert(PL.EVENTS.live.length>=4&&PL.EVENTS.live.some(e=>/futsal/.test(e.answer))&&PL.EVENTS.live.some(e=>/beach/.test(e.answer)),'live games');
 for(const p of PL.PLACE_STOPS)assert(STAMPS.some(s=>s.where==='station'&&s.name===p.station)&&(STAMPS.some(s=>s.place.toLowerCase().includes(p.place.toLowerCase()))||p.place==='Summit 5s'),'place by its station: '+p.place);}
console.log('train-talk pools ok');
// ---- 2. football tags on every train NPC line
{const {STATION_NPCS}=L('lib/town/stationNpcs.ts'),{PART_10}=L('lib/town/npcFresh/part10.ts'),{KENJI_NPC}=L('lib/town/trainConductor.ts');
 const need=(tags,key,social,who)=>{const t=tags[key];assert(t,`${who}: "${key}" has no football tag`);assert(TOPICS.has(t)||(social&&t===TG.SOCIAL_TAG),`${who}: "${key}" tag ${t}`);};
 for(const n of [...STATION_NPCS,KENJI_NPC]){const tags=TG.tagsOf(n.id),f=PART_10[n.id];need(tags,'g',true,n.id);(n.lines??[]).forEach((_,i)=>need(tags,'l'+i,true,n.id));
  n.topics.forEach((t,i)=>need(tags,n.id==='train-kenji'?'k'+i:'t'+i,false,n.id));
  if(f){f.topics.forEach(t=>need(tags,t.id,false,n.id));f.challenges.forEach(c=>need(tags,c.id,false,n.id));f.openers.forEach((_,i)=>need(tags,'o'+i,true,n.id));f.returning.forEach((_,i)=>need(tags,'r'+i,true,n.id));
   const known=new Set([...f.topics.map(t=>t.id),...f.challenges.map(c=>c.id)]);for(const k of Object.keys(tags))if(!/^[gltkor]\d*$/.test(k))assert(known.has(k),`${n.id}: stale tag ${k}`);}}
 for(const t of [...PL.ALL_TEACH,...PL.ALL_QUIZ,...PL.FITNESS])assert(TOPICS.has(PL.talkTagOf(t.id)),'passenger tag: '+t.id);
 for(const k of Object.keys(PL.EVENTS))for(const e of PL.EVENTS[k])assert.equal(PL.talkTagOf(e.id),'island');
 // the owner's screenshot (Nov 24): pure train trivia is gone
 const all=JSON.stringify([STATION_NPCS,PART_10,KENJI_NPC]);for(const bad of ['603 km/h','How many cars does our train have','Which bird inspired','Gotthard','tunnel boring','Who built the steam engine'])assert(!all.includes(bad),'no pure train trivia: '+bad);
 // the mix: no more than ~40 % of a station islander's topics mention trains at all
 for(const n of STATION_NPCS){const f=PART_10[n.id],ts=[...n.topics,...f.topics],tr=ts.filter(t=>/\btrains?\b|railway|\bstations?\b|platform|tunnel/i.test(t.question+' '+t.answer)).length;assert(tr/ts.length<=.4,`${n.id}: ${tr}/${ts.length} train-themed`);}
 // the stop announcements and stamp facts teach football
 const RD=read('lib/town/trainRide.ts');for(const id of ['north','west','south','summit','cay'])assert(new RegExp(` ${id}:'[^']*(match|half|football|games|players|team)`).test(RD),'stop fact is football: '+id);
 const {STAMPS}=L('lib/town/islandStamps.ts');for(const s of STAMPS)assert(/football|match|player|ball|boots|beach soccer|team|shirt/i.test(s.fact),'stamp fact is football: '+s.id);}
console.log('train-talk football tags ok');
// ---- 3. rotation + the talk definition
{TK.resetTalkRotation();const pool=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];const got=[];for(let i=0;i<4;i++)got.push(TK.take('x',pool,1)[0].id);
 assert.equal(new Set(got).size,4,'no repeats until the pool is used up: '+got);const nx=TK.take('x',pool,1)[0].id;assert.notEqual(nx,got[3],'restart skips the last one');
 TK.resetTalkRotation();const kid=PX.CAST.find(c=>c.role==='Kid with a ball');const seenQ=new Set();
 for(let i=0;i<PL.ROLE_POOLS['Kid with a ball'].teach.length;i++){const d=TK.talkDefFor(kid,'South');assert.equal(d.topics.length,3);assert(d.fresh.challenges.length===1&&d.fresh.challenges[0].options.length===3,'a quick question');
  assert(!d.greeting.includes('{next}'),'banter filled');assert(d.id===kid.id&&d.name===kid.name,'same passenger');
  const teachQ=d.topics[1].question;assert(!seenQ.has(teachQ),'teaching tip repeats in a session: '+teachQ);seenQ.add(teachQ);
  assert(d.topics.every(t=>t.followUp&&t.followUp.answer),'follow-ups');}
 const boarder=PX.CAST.find(c=>c.boarder);assert.equal(TK.talkDefFor(boarder,'South'),boarder,'station islanders keep their own talk');
 const FP=L('lib/town/npcFreshPicker.ts');const mem={v:null},store={get:()=>mem.v,set:v=>{mem.v=v;}};const d=TK.talkDefFor(kid,'North');
 const plan=FP.planNpcVisit(d,{store});assert.equal(plan.challenge?.id,d.fresh.challenges[0].id,'the chat shows its quick question (existing challenge UI)');assert.equal(plan.topics.length,3);}
console.log('train-talk rotation ok');
// ---- 4. picking
{const spot=(x,z,o={})=>({cast:1,x,y:1,z,k:0,standing:false,kid:false,fx:x,fz:z,...o});
 const list=[spot(1,0,{standing:true}),spot(3,0,{standing:true,cast:2})];
 assert.equal(TK.pickStanding(list,2,0,{x:0,z:0},{x:1,z:0}),0,'standing: 1 m ahead, in view: Talk');
 assert.equal(TK.pickStanding(list,2,0,{x:0,z:0},{x:-1,z:0}),-1,'behind me: no prompt');
 assert.equal(TK.pickStanding([spot(2,0,{standing:true})],1,0,{x:0,z:0},{x:1,z:0}),-1,`beyond ${TK.TALK_STAND} m: no prompt`);
 assert.equal(TK.pickStanding(list,2,1,{x:0,z:0},{x:1,z:0}),-1,'only the train I ride');
 const o={x:0,y:2.2,z:0},dir=new T.Vector3(2,-.6,0).normalize();
 assert.equal(TK.pickRay([spot(2,0)],1,0,o,dir,{x:0,z:0},TK.SEAT_REACH),0,'seated: aim / tap at a passenger 2 m away hits');
 assert.equal(TK.pickRay([spot(2,0)],1,0,o,new T.Vector3(0,0,1),{x:0,z:0},TK.SEAT_REACH),-1,'looking away: miss');
 const far=new T.Vector3(4,-.6,0).normalize();assert.equal(TK.pickRay([spot(4,0)],1,0,o,far,{x:0,z:0},TK.SEAT_REACH),-1,'more than ~2 seats away: no');}
console.log('train-talk picking ok');
// ---- 5. runtime: tap opens, close, face me; no labels; Town hooks
{const scene=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,500);const pax=PX.createTrainPassengers(scene,{away:()=>true});
 const states=[0,1,2].map(i=>({s:200+i*300,at:-1,next:1,t:60,doors:0,dwellLeft:0,v:10}));
 const carM=(k,c,out)=>{out.identity();if(c%2)out.makeRotationY(Math.PI);out.setPosition(states[k].s,1,-c*12.4);return out;};const run={states,carMatrixOf:carM};
 cam.position.set(200,3,4);cam.lookAt(200,1,0);cam.updateMatrixWorld();pax.update(run,60,cam,0,0,false);const {list,count}=pax.spots();assert(count>0,'riders this frame');
 const s=list[0];const opened=[];const talk=TK.createTrainPassengerTalk(scene,pax,{states:()=>states,open:n=>opened.push(n),blocked:()=>false});
 assert(!talk.ring.visible,'nothing drawn by default (no labels)');
 // stand next to the rider, facing them: Talk offered; at a stop with Get off up and not aiming: nothing
 const me={x:s.x-.9,z:s.z};cam.position.set(me.x,s.y+1.6,me.z);cam.lookAt(s.x+1,s.y+3,s.z+.6);cam.updateMatrixWorld();/* looking past them, up: not aimed, but in view */
 const fwdCam=new T.Vector3();cam.getWorldDirection(fwdCam);const c1=talk.candidate(cam,0,true,me.x,me.z,false);
 const inView=(s.x-me.x)*fwdCam.x+(s.z-me.z)*fwdCam.z>0;assert(inView&&c1&&c1.id===PX.CAST[s.cast].id&&!talk.aimed,'standing by them, in view: Talk');
 cam.position.set(s.x-2.5,s.y+1.6,s.z);cam.lookAt(s.x+1,s.y+3,s.z+.6);cam.updateMatrixWorld();{const c3=talk.candidate(cam,0,true,s.x-2.5,s.z,false);assert(!c3||c3.id!==PX.CAST[s.cast].id,'2.5 m away, not aiming: no prompt for them');}cam.position.set(me.x,s.y+1.6,me.z);
 cam.lookAt(s.x,s.y+1,s.z);cam.updateMatrixWorld();const c2=talk.candidate(cam,0,true,me.x,me.z,true);assert(c2&&talk.aimed,'Get off up, but aiming at them: Talk');
 cam.lookAt(me.x-5,s.y+1.6,me.z);cam.updateMatrixWorld();assert.equal(talk.candidate(cam,0,true,me.x,me.z,true),null,'Get off up, not aiming: no Talk');
 assert.equal(talk.candidate(cam,-1,true,me.x,me.z,false),null,'not riding: nothing');
 // open via the runtime (tap path) then close: they face me while open
 const h={},el={style:{},addEventListener:(t,f)=>{h[t]=f;},removeEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};talk.attach(el);
 cam.position.set(me.x,s.y+1.6,me.z);cam.lookAt(s.x,s.y+1,s.z);cam.updateMatrixWorld();
 talk.frame(cam,0,true,me.x,me.z,null);let stopped=0;const ev=o=>({...o,stopImmediatePropagation(){stopped++;},preventDefault(){}});
 h.pointerdown({clientX:50,clientY:50,pointerId:1});h.pointerup(ev({clientX:52,clientY:51,pointerId:1}));h.click(ev({}));
 assert.equal(stopped,2,'a passenger tap never reaches the island\'s own canvas click targets (stamp house, machines)');
 assert.equal(opened.length,1,'a tap on the passenger opens the talk');assert(opened[0].topics.length===3&&opened[0].fresh.challenges.length===1,'with its content');
 h.pointerdown({clientX:50,clientY:50,pointerId:2});h.pointerup(ev({clientX:90,clientY:50,pointerId:2}));talk.frame(cam,0,true,me.x,me.z,null);assert.equal(opened.length,1,'a drag (the ride camera look) does not open');
 h.pointermove({pointerType:'mouse',clientX:50,clientY:50});talk.frame(cam,0,true,me.x,me.z,null);assert(talk.ring.visible&&el.style.cursor==='pointer','desktop hover: a faint ring + pointer only');
 talk.frame(cam,0,true,me.x,me.z,opened[0].id);assert(!talk.ring.visible,'open: no hover ring');
 talk.frame(cam,0,true,me.x,me.z,null);const again=talk.candidate(cam,0,true,me.x,me.z,false);assert(again&&again!==opened[0],'closed: the next talk gets fresh content');
 const def=talk.candidate((cam.lookAt(s.x,s.y+1,s.z),cam.updateMatrixWorld(),cam),0,true,me.x,me.z,false);talk.frame(cam,0,true,me.x,me.z,def.id);
 pax.update(run,60.1,cam,0,0,false);talk.frame(cam,0,true,me.x,me.z,null);
 const src=read('lib/town/trainPassengers.ts');assert(/faceCast===who\.cast&&k===ridingK/.test(src)&&/who=was;\/\/ train-talk/.test(src),'talked-to passenger turns and keeps their seat');
 talk.dispose();assert(!scene.getObjectByName('train-talk-hover'),'disposed');}
{const town=read('components/Town.tsx');
 assert(/kenjiFig\.npc\(\):trainTalk\.candidate\(camera,trainRide\.train,trainRide\.standing,location\.x,location\.z,/.test(town),'riding: Talk only via trainTalk (close / aimed)');
 assert(/trainTalk\.frame\(camera,trainRide\.active\?trainRide\.train:-1/.test(town),'per-frame hook');
 assert(/trainTalk\.aimed\/\* train-talk \*\/\|\|!trainRideStore\.get\(\)\.canGetOff/.test(town),'E at a stop only when aiming');
 assert(/stadiumSit\.seated\|\|trainRide\.active/.test(town),'no islander tags while riding');
 const tt=read('lib/town/trainPassengerTalk.ts');assert(!/CSS2DObject|Sprite|textContent|createElement/.test(tt),'no labels or DOM tags from the talk module');
 assert(!/send|presence|broadcast/i.test(tt.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'local only: nothing sent');}
console.log('train-talk runtime ok');
