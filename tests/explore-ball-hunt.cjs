// Explore ball hunt audit (Oct 25 2026; docs/EXPLORE_BALL_HUNT_AUDIT_OCT25.md). User: "Do an audit on the different explore sites and
// make sure to add ball hunt in each of these spots. instead of the pearl in the treasure chest. have it be a ball ... when collected
// give a mini lesson and allow to choose a card." Checks: every reef zone's chest holds its ball (no coin find, no coin mesh), the
// first pick-up earns a card choice (earnForDiveBall: kind 'ball', id dive:<zone>, off when card rewards are off) that waits for the
// lesson card (DiveHud holds card offers), the card reads as a mini lesson, and the East Jetty's new ball (on the plaza, clear of
// everything there, a lesson with a source and a scene, registered in the hunt, so the coin hunt spawns it and earnForBall fires).
// Run: node tests/explore-ball-hunt.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
function loader(stubs={}){const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>stubs[id]??(id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id))});loaded.set(file,mod.exports);return mod.exports;}return load;}
const load=loader(),read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const D=load('lib/town/water/diveSpots.ts'),B=load('lib/town/water/diveBalls.ts');

ok('reef zones: the treasure chest holds the zone’s ball (no coin find left), drawn at the ball find, ball mesh in the chest',()=>{
 for(const s of D.DIVE_SPOTS){assert(!s.finds.some(f=>f.kind==='treasure'||f.id==='treasure'),'no coin find '+s.id);const b=s.finds.filter(f=>f.kind==='ball');assert.equal(b.length,1,s.id);
  assert.equal(b[0].y,B.DIVE_BALL_CHEST_Y);assert(/treasure chest/.test(B.diveBallFor(s.id).hide),'hide line names the chest '+s.id);assert(/treasure chest/.test(b[0].aria));}
 const R=load('lib/graphics/diveRoom.ts');
 for(const s of D.DIVE_SPOTS){const room=R.createDiveRoom(s,{phone:true,reduced:false,found:[]});let ball=null,coin=0;room.scene.traverse(o=>{if(o.name==='dive-hidden-ball')ball=o;if(o.name==='dive-coin')coin++;});
  assert.equal(coin,0,'the coin mesh is gone '+s.id);assert(ball,'the ball is drawn '+s.id);const f=s.finds.find(q=>q.kind==='ball'),sand=D.diveFloor(f.x,f.z,s.floor);
  assert(Math.abs(ball.position.x-f.x)<1e-6&&Math.abs(ball.position.z-f.z)<1e-6,'at the chest');assert(Math.abs(ball.position.y-(sand+B.DIVE_BALL_CHEST_Y))<1e-6,'sitting in the open chest');
  room.dispose();}
 const src=read('lib/graphics/diveRoom.ts');assert(/const chestAt=findPt\(DIVE_BALL_FIND\)/.test(src),'the chest follows the ball find');assert(!/dive-coin|coinT/.test(src),'no coin mesh or animation');
});

ok('collecting a reef ball: card choice once (kind ball, id dive:<zone>), off when rewards are off, held until the lesson card closes',()=>{
 const calls=[];let active=true;
 const stubs={'./cardRewardStore':{earnCardOffer:r=>{calls.push(r);return calls.filter(c=>c.id===r.id).length>1?'paid':'offered';},cardRewardsActive:()=>active},
  './cardRewards':{TIER_TEACHING_LINE:'',themeFromText:t=>'theme:'+t},'../paths/formatPaths':{FORMAT_PATHS:[]},'./quizProgress':{CARD_QUIZ_FIRST_TRY:true,hasCorrectQuizAnswer:()=>false,quizCardEligible:()=>false},
  './exploreChecklist':{EXPLORE_ITEMS:[]},'./learningJourneys':{journeyById:()=>null},'../paths/stories':{STORY_CARDS:[]},'../paths/upcomingStories':{UPCOMING_STORIES:{}},
  '../arcade/arcadeWallet':{creditOnce:()=>Promise.resolve()},'./learnCoins':{createLearnCoins:()=>({pay:()=>Promise.resolve()}),LEARN_COINS_EARNED:'x'}};
 const TR=loader(stubs)('lib/town/cardRewardTriggers.ts'),spot=D.diveSpotById('turtle-pool'),ball=spot.finds.find(f=>f.kind==='ball');
 assert.equal(TR.earnForDiveBall(spot,ball),'offered');assert.equal(calls.length,1);
 assert.equal(calls[0].kind,'ball','the child chooses a card, as for an island ball');assert.equal(calls[0].id,'dive:turtle-pool');assert(calls[0].reason.includes(ball.title));assert.equal(calls[0].theme,'theme:'+ball.title);
 assert(!/https?:|www\./.test(calls[0].reason),'no link in kid UI');
 active=false;assert.equal(TR.earnForDiveBall(spot,ball),'off','respects cardRewardsActive()');assert.equal(calls.length,1);
 const town=read('components/Town.tsx');assert(/if\(f\.kind==='ball'\)\{countDiveBallFind\(\);const zone=dive\.session\.state\.spot;if\(zone\)earnForDiveBall\(zone,f\);/.test(town),'Town fires it on the first find only');
 assert(/found:\(f,first\)=>\{if\(first\)\{/.test(town),'inside the first-find branch');
 const hud=read('components/DiveHud.tsx');assert(/holdCardOffers\(CARD_HOLD,true\)/.test(hud)&&/holdCardOffers\(CARD_HOLD,false\)/.test(hud),'the find card holds card offers while it shows');
 assert(/v\.card\.lesson\?`Mini lesson · \$\{v\.card\.label\}`/.test(hud),'the ball card reads as a mini lesson');
 const rt=read('lib/town/water/diveRuntime.ts');assert(/lesson:f\.kind==='ball'/.test(rt));
 assert(rt.indexOf('holdCardOffers(DIVE_CARD_HOLD,true)')>0&&rt.indexOf('holdCardOffers(DIVE_CARD_HOLD,true)')<rt.indexOf('ports.found(f,ev.firstFind)'),'held before the found port earns the offer (no render race)');
 assert(/hidePrompt\(\);holdCardOffers\(DIVE_CARD_HOLD,false\)/.test(rt),'released on surfacing');
});

ok('East Jetty: one new hunt ball on the lighthouse plaza, clear of the lighthouse, hut, islanders, fishing stand and kick spot',()=>{
 const EP=load('lib/town/eastPier.ts'),J=load('lib/town/eastJettyBalls.ts'),Q=load('lib/town/coinQuest.ts');
 assert.equal(J.EAST_JETTY_BALL_SPOTS.length,1);const s=J.EAST_JETTY_BALL_SPOTS[0];
 assert.equal(Q.COIN_QUEST[Q.COIN_QUEST.length-1].id,s.id,'appended last (saved ids keep their order)');
 assert(EP.onEastPier(s.x,s.z),'on the walkable jetty');assert(Math.hypot(s.x-EP.EAST_PIER.cx,s.z-EP.EAST_PIER.cz)<=EP.EAST_PIER.plazaR-1.5,'on the plaza');
 assert(Math.hypot(s.x-EP.JETTY_BEACON.x,s.z-EP.JETTY_BEACON.z)>EP.JETTY_BEACON.r+1.5,'clear of the lighthouse');
 const H=EP.KEEPER_HUT;assert(Math.abs(s.x-H.x)>H.w/2+1.5||Math.abs(s.z-H.z)>H.d/2+1.5,'clear of the keeper’s hut');
 for(const p of [EP.EAST_PIER_NPC_SPOTS.fisher,EP.EAST_PIER_NPC_SPOTS.kid,EP.EAST_PIER_FISHING,EP.PIER_KICK_SPOT])assert(Math.hypot(s.x-p.x,s.z-p.z)>4,'clear of '+JSON.stringify(p));
 for(const o of Q.COIN_QUEST)if(o.id!==s.id)assert(Math.hypot(o.x-s.x,o.z-s.z)>8,'apart from '+o.id);
 assert.equal(s.kind,'hidden');assert(s.loose&&s.y===0,'a loose ball on the deck: walked over to pick up');
});

ok('East Jetty lesson: a new idea with its scene, practice prompt and source; plain-text kid UI; earnForBall fires for every hunt ball',()=>{
 const L=load('lib/town/ballHuntLessons.ts'),S=load('lib/town/ballHuntSources.ts'),J=load('lib/town/eastJettyBalls.ts'),Q=load('lib/town/coinQuest.ts'),s=J.EAST_JETTY_BALL_SPOTS[0];
 const l=L.BALL_HUNT_LESSONS[s.id];assert(l&&l.kind==='coin-toss'&&L.SCENES['coin-toss'],'lesson + scene');assert.equal(l.family,'Rules of the game');
 assert(L.BALL_HUNT_PRACTICE[s.id].length>30);assert(S.BALL_HUNT_SOURCES[s.id]?.length>=1&&S.BALL_HUNT_SOURCES[s.id].every(x=>/^https:\/\//.test(x.url)),'a checked source (docs and tests only)');
 for(const t of [s.teaching,s.clue,s.detail,s.near,...l.steps,...l.actions])assert(!/https?:|www\.|\.com/.test(t),'no links in kid UI: '+t);
 // The topic is new: nothing else a kid meets talks about the coin toss / choosing ends (the old dive "captain's coin" story was removed).
 const others=Q.COIN_QUEST.filter(o=>o.id!==s.id).map(o=>o.teaching).join(' ')+' '+Object.entries(L.BALL_HUNT_LESSONS).filter(([k])=>k!==s.id).map(([,x])=>x.steps.join(' ')).join(' ')+' '+B.DIVE_BALLS.map(b=>b.text).join(' ');
 for(const w of ['coin toss','tosses a coin','swap ends','change ends','wins the toss'])assert(!others.toLowerCase().includes(w),'topic not taught elsewhere: '+w);
 assert(/c=>\{earnForBall\(c\);setBallLessons/.test(read('components/Town.tsx')),'the coin hunt hands every collected ball (this one too) to earnForBall + the lesson');
 assert(read('lib/town/exploreChecklist.ts').includes("id:'walk-jetty'"),'the jetty is an Explore checklist place');
});

if(failed){console.log(`explore-ball-hunt: ${failed} failed`);process.exit(1);}console.log('explore-ball-hunt: all passed');
