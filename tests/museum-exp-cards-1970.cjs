// cards-1970 "Ref at match speed" (Oct 12 2026 anatomy Paper rebuild): the case's facts and sources are kept and shown; nine
// made-up Law 12 moments cover play-on, careless, yellow and red; the scoring (whistle timing + the right card); every film
// is drawn as paper mannequins on an isometric table-top pitch with Ken Aston's traffic light (anatomy kit, no pixel kit); the
// play area fills the screen; and the exhibit contract (Room → ExperienceBack, data-* hooks, best-score key, onComplete only
// after the round + quick check, one frame loop that sleeps at rest, reduced motion = a turn-based version, the lab route).
// usage: node tests/museum-exp-cards-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/cards-1970/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require('../'+dir+'content.ts'),M=require('../'+dir+'model.ts'),S=require('../'+dir+'scene.ts'),F=require('../components/museum/experiences/anatomy/figure.ts');
const exp=read(dir+'Experience.tsx'),paper=read('components/museum/experiences/anatomy/PaperStage.tsx'),css=read('components/museum/experiences/anatomy/PaperStage.module.css'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts'),files=fs.readdirSync(path.join(root,dir));
const src=files.filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>read(dir+f)).join('\n');

// 1. Facts: the case's own lines word for word, the 1966 story, the firsts and Law 12's ladder; all shown.
{const e=X.EXHIBITS.find(x=>x.id==='cards-1970');
 for(const f of e.facts)assert.ok(Object.values(C.CASE_FACTS).includes(f),'case fact quoted: '+f);
 assert.equal(C.CASE_FACTS.forYourGame,e.forYourGame);
 for(const k of ['aston','mexico','language','forYourGame'])assert.ok(exp.includes('CASE_FACTS.'+k),k+' is shown');
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/STORY_1966\.map/);assert.match(exp,/STORY_TAGS\[i\]/);assert.match(exp,/FIRSTS\.map/);assert.match(exp,/LADDER\.map/);assert.match(exp,/\{TWO_YELLOWS\}/);
 assert.equal(C.STORY_1966.length,4);assert.match(C.STORY_1966[3],/Kensington High Street/);assert.equal(C.LADDER.length,3);
 console.log('PASS facts: the case’s three facts and take-away, the 1966 story, the firsts and the ladder are kept and shown');}

// 2. Sources: cited with URLs, IFAB Law 12 included, rendered; the practice moments are labelled made-up.
{const urls=C.SOURCES.map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 assert.ok(urls.includes('https://www.theifab.com/laws/latest/fouls-and-misconduct/'));
 for(const host of ['inside.fifa.com','referee.com','topendsports.com','guinnessworldrecords.com'])assert.ok(urls.some(u=>u.includes(host)),host+' cited');
 assert.match(exp,/list=\{\[\.\.\.SOURCES,\.\.\.exhibit\.sources\]\}/);assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/made-up/);
 assert.ok(!/@gmail|khoa/i.test(src+JSON.stringify(C)));
 console.log('PASS sources: '+urls.length+' cited and listed; practice moments labelled made-up');}

// 3. The moments: readable fouls covering every call, each with a Law 12 reason and a replay "tell"; rounds cover every call.
{const ids=M.MOMENTS.map(m=>m.id);assert.deepEqual([...ids].sort(),['dive','handball','push','shin','shirt','shoulder','studs','tackle','trip']);
 const by=id=>M.MOMENTS.find(m=>m.id===id);
 assert.deepEqual(by('shoulder').answer,{whistle:false,card:'none'},'a fair shoulder charge: play on');assert.deepEqual(by('tackle').answer,{whistle:false,card:'none'});
 assert.deepEqual(by('trip').answer,{whistle:true,card:'none'});assert.deepEqual(by('push').answer,{whistle:true,card:'none'},'a careless push: free kick, no card');
 for(const id of ['shirt','dive','shin'])assert.equal(by(id).answer.card,'yellow',id);for(const id of ['studs','handball'])assert.equal(by(id).answer.card,'red',id);
 assert.equal(by('dive').who,9,'the diver gets the yellow');assert.equal(by('dive').contact.hit,false,'no contact to see on a dive');
 for(const m of M.MOMENTS){assert.ok(m.tc>.5&&m.tc<m.T-.8,m.id+' contact mid-film');assert.match(m.law,/^Law 12/);assert.ok(m.why.length>60&&m.watch.length>10&&m.tell.length>20);
  for(const a of m.actors){assert.equal(a.keys[0].t,0);for(let i=1;i<a.keys.length;i++)assert.ok(a.keys[i].t>=a.keys[i-1].t,m.id+' keys in order');}}
 for(const seed of [1,2,3,1970,99]){const r=M.makeRound(seed);assert.equal(r.length,M.ROUND);assert.equal(new Set(r.map(m=>m.id)).size,M.ROUND);
  assert.ok(r.some(m=>!m.answer.whistle)&&r.some(m=>m.answer.whistle&&m.answer.card==='none')&&r.filter(m=>m.answer.card==='yellow').length>=2&&r.some(m=>m.answer.card==='red'),'round covers every call');}
 assert.deepEqual(M.makeRound(7).map(m=>m.id),M.makeRound(7).map(m=>m.id),'seeded: replayable');
 console.log('PASS nine moments (fair charge, fair tackle, trip, push, shirt pull, dive, late shin kick, studs, handball); rounds cover every call');}

// 4. Scoring: whistle after the contact (faster = more), too early = 0 for the whistle, the right card +100, play-on rewarded.
{const sh=M.MOMENTS.find(m=>m.id==='shirt'),fair=M.MOMENTS.find(m=>m.id==='shoulder');
 assert.equal(M.judge(fair,null,null).points,200);assert.equal(M.judge(fair,1.4,'none').points,0);assert.ok(M.judge(fair,1.4,null).wrongWhistle);
 assert.equal(M.judge(sh,sh.tc+.1,'yellow').points,200,'quick and right');assert.equal(M.judge(sh,sh.tc+2,'yellow').points,150,'slow and right');
 assert.equal(M.judge(sh,sh.tc+.1,'red').points,100);const early=M.judge(sh,sh.tc-.5,'yellow');assert.ok(early.early&&!early.right&&early.points===100);
 assert.equal(M.judge(sh,null,null).points,0);assert.ok(M.judge(sh,null,null).missed);assert.equal(M.judge(sh,sh.tc+1.2,'yellow',false).points,200,'untimed (reduced motion): full whistle points');
 assert.equal(M.maxRound(),1200);assert.equal(M.lampOf('yellow'),'yellow');assert.equal(M.lampOf('none'),'green');
 console.log('PASS scoring: whistle timing + the right card; early whistles and missed fouls cost; untimed play is fair');}

// 5. The films draw as paper figures: the fouls are really there at the contact (bodies meet, studs show, the dive leaves a gap).
{const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
 const at=(id,t)=>{const m=M.MOMENTS.find(x=>x.id===id);return Object.fromEntries(M.actorsAt(m,t).map(f=>[f.id,F.joints(f)]));};
 const studs=M.MOMENTS.find(m=>m.id==='studs'),J=at('studs',studs.tc);assert.ok(J.D.footL[2]>.55&&J.D.footR[2]>.55,'studs: both soles face forward');
 assert.ok(Math.min(dist(J.D.toeL,J.A.ankleL),dist(J.D.toeL,J.A.ankleR),dist(J.D.toeR,J.A.kneeL),dist(J.D.toeR,J.A.ankleR))<60,'studs: the boots reach the legs');
 const dv=M.MOMENTS.find(m=>m.id==='dive'),Dv=at('dive',dv.tc+.2);const near=Math.min(...['toeL','toeR','handL','handR','head'].flatMap(a=>['toeL','toeR','handL','handR','kneeL','kneeR'].map(b=>dist(Dv.A[a],Dv.D[b]))));
 assert.ok(near>60,'dive: a clear gap, nobody touches ('+Math.round(near)+' cm)');
 const hb=M.MOMENTS.find(m=>m.id==='handball'),H=at('handball',hb.tc),b=M.ballAt(hb,hb.tc);assert.ok(dist(H.D.handR,[b.x,b.y,b.z+11])<40,'handball: the raised hand meets the ball');
 for(const m of M.MOMENTS)for(const [w,h] of [[1392,734],[358,688]]){const P=S.cameraFor(m,w,h);for(const t of [0,m.tc,m.T]){
   const a=S.actorItems(m,{t,ref:'card',card:'red',lamp:'red'},P,w<h);assert.ok(a.items.length>40,'figures drawn');for(const it of a.items)if(it.kind==='cap')assert.ok(Number.isFinite(it.a[0])&&Number.isFinite(it.b[1]));}
  const c=S.contactOn(m,P);assert.ok(c[0]>0&&c[0]<w&&c[1]>0&&c[1]<h,m.id+' contact on the card at '+w+'×'+h);
  const parts=S.benchParts(m,'yellow',P,w<h);assert.ok(parts.filter(p=>p.kind==='solid').length>=20,'a detailed bench');assert.ok(parts.some(p=>p.kind==='lens'&&p.on==='yellow'),'the lamp lights the call');}
 const card=F.figureItems({id:'ref',x:0,y:0,h:0,kit:'dark',pose:F.POSES.card,card:'red'},S.cameraFor(M.MOMENTS[0],800,500));assert.ok(card.some(i=>i.kind==='poly'&&i.tone==='red'),'the referee holds the card up');
 console.log('PASS films: paper mannequins on the iso bench; studs, contact and the dive’s gap are really in the geometry; the light and the card show the call');}

// 6. Style, fill-screen layout, contract and heat.
{assert.doesNotMatch(src,/pixeliso|PixelStage|Press Start|Pixelify|#000048|Mega ?Drive/i,'no pixel kit, fonts or dark cabinet');assert.match(src,/from '\.\.\/anatomy\/iso-kit'/,'drawn with the anatomy kit');
 assert.match(css,/\.screen\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/,'play screen = 100dvh: label · card · controls');
 assert.match(css,/\.svg\{position:absolute;inset:0;[^}]*width:100%;height:100%/,'the drawing fills the card');assert.match(css,/--anatomy-card:#e0e0db/);assert.match(css,/--anatomy-paper:#f7f7f3/);
 assert.match(exp,/viewBox=\{`0 0 \$\{box\.w\} \$\{box\.h\}`\}/,'viewBox = the card size');
 assert.match(paper,/<ExperienceBack onClose=\{onClose\}\/>/);assert.match(paper,/data-museum-experience=\{id\}/);assert.match(paper,/role="dialog" aria-modal="true"/);assert.match(paper,/e\.key==='Escape'/);assert.match(exp,/<Room id="cards-1970"/);
 for(const h of ["'data-phase'","data-card=","data-whistle","'data-result'","data-play","data-next","data-playon"])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/BEST_KEY='futbol\.museum\.cards-1970\.liveBest'/,'progress key kept');
 assert.match(exp,/const finish=\(\)=>\{if\(!done\.current\)\{done\.current=true;cb\.current\?\.\(\);\}\}/);assert.equal((exp.match(/cb\.current\?\.\(\)/g)||[]).length,1,'onComplete called in one place only');
 assert.match(exp,/<StepCheck[^\n]*onDone=\{\(\)=>setChecked\(true\)\}/);assert.match(exp,/<Ending reached onComplete=\{finish\}/,'the ending (after the quick check) awards the stamp');
 assert.match(exp,/useFrames\(/);assert.match(paper,/export \{useFrames\} from '\.\/paper-loop'/);assert.match(loopSrc,/IntersectionObserver/);assert.match(loopSrc,/cancelAnimationFrame/);
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.ok(!/requestAnimationFrame\(|setInterval\(/.test(read(dir+f)),'no own rAF/interval in '+f);
 assert.match(exp,/reduced\?\{t:mm\.tc\+HOLD/,'reduced motion: frozen on the contact');assert.match(exp,/data-playon onClick=\{playOn\}/,'reduced motion: whistle or play on');
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/cards-1970/page.tsx')),'lab route');assert.match(read('components/museum/experiences/index.tsx'),/'cards-1970':load\(\(\)=>import\('\.\/cards-1970\/Experience'\)\)/);
 console.log('PASS style + contract: anatomy Paper, no pixel kit, play area fills 100dvh, Back/Escape, data hooks, best key, onComplete once after the check, one sleeping loop, reduced = turn-based');}
