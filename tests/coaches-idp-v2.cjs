#!/usr/bin/env node
/*
 * IDP v2 (Oct 9 2026, docs/idp/DESIGN.md): catalogue links, v1 → v2 migration, reducers, the save allowlist (no free text ever
 * synced), the QR goal / week-plan round trips, the no-ranking language rule, the analytics ids, the board contract and the
 * heat rules (no loops, no infinite animation). Static, no browser: node tests/coaches-idp-v2.cjs
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cache=new Map();
function load(file){
 file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file).exports;
 const m={exports:{}};cache.set(file,m);
 const src=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText;
 vm.runInNewContext(src,{module:m,exports:m.exports,process:{env:{NODE_ENV:'test'}},console,TextEncoder,
  require:id=>{if(id.endsWith('.json'))return require(path.resolve(path.dirname(file),id));if(id.startsWith('@/'))id=path.join(ROOT,id.slice(2));else if(id.startsWith('.'))id=path.resolve(path.dirname(file),id);else return require(id);
   for(const c of [id+'.ts',id+'.tsx',path.join(id,'index.ts')])if(fs.existsSync(c))return load(c);throw Error('cannot load '+id);}});
 return m.exports;
}
const J=x=>JSON.parse(JSON.stringify(x));
let passed=0;const ok=(name,fn)=>{fn();passed++;};
const IDP=load('lib/coaches/idp.ts'),SK=load('lib/coaches/idp/skills.ts'),ST=load('lib/coaches/idp/store.ts'),JO=load('lib/coaches/idp/journey.ts'),SH=load('lib/coaches/idp/share.ts');
const paths=require('../lib/paths/formatPaths.json'),players=require('../lib/town/positionPlayers.json');
const DAY=864e5,NOW=Date.UTC(2026,9,7,12);// a Wednesday
const mem=(init={})=>{const v=new Map(Object.entries(init));return {getItem:k=>v.has(k)?v.get(k):null,setItem:(k,x)=>v.set(k,String(x)),removeItem:k=>v.delete(k),get length(){return v.size},key:i=>[...v.keys()][i]??null,_v:v};};

// 1. Catalogue: "I can…" goals, skill families, missions linked to real island content.
ok('catalogue',()=>{
 const arcadeSrc=read('lib/arcade/arcadeCatalog.ts'),arcadeIds=[...arcadeSrc.matchAll(/\{id:'([a-z]+)'/g)].map(m=>m[1]);
 const cards=new Set(Object.values(players).flatMap(g=>g&&typeof g==='object'?[...(g.current||[]),...(g.allTime||[])]:[]));
 const storiesSrc=read('lib/paths/stories.ts'),storyIds=[...storiesSrc.matchAll(/\{id:'([a-z]+)',title/g)].map(m=>m[1]);
 const {PRACTICES}=load('lib/grownups/practice.ts');
 for(const g of IDP.IDP_GOALS){
  assert.match(g.ican,/^I can /,g.id+' is an "I can…" statement');assert.ok(g.ican.length<=60,g.id+' ican short enough for a kid');
  assert.ok(SK.SKILLS[g.skill],g.id+' skill '+g.skill);
 }
 for(const f of ['7v7','9v9','11v11','futsal']){const gs=IDP.goalsFor(f);assert.ok(gs.length>=4,f+' offers a real choice');
  if(f!=='futsal')assert.ok(new Set(gs.map(g=>g.corner)).size>=3,f+' spans at least three corners');}
 assert.ok(new Set(IDP.goalsFor('7v7').map(g=>g.corner)).size===4,'7v7 covers all four corners');
 for(const id of SK.SKILL_IDS){const s=SK.SKILLS[id];
  assert.equal(s.missions.length,3);assert.deepEqual(J(s.missions.map(m=>m.where).sort()),['home','island','training'],id+' has a home, a training and an island mission');
  for(const m of s.missions){assert.ok(m.steps.length>=1&&m.steps.length<=3,m.id+' ≤3 steps');assert.ok(m.steps.every(t=>t.split(' ').length<=16),m.id+' short sentences');
   if(m.link==='arcade')assert.ok(s.arcade,m.id+' arcade link needs an arcade');if(m.link==='card')assert.ok(s.card,m.id+' card link needs a card');if(m.link==='story')assert.ok(s.story,m.id+' story link needs a story');}
  if(s.arcade)assert.ok(arcadeIds.includes(s.arcade),id+' arcade '+s.arcade+' exists');
  if(s.card)assert.ok(cards.has(s.card.name),id+' card '+s.card.name+' is in the binder');
  if(s.story){assert.ok(storyIds.includes(s.story.id),id+' story exists');const p=paths.find(p=>p.format===s.story.format);assert.equal(p.openingStory,s.story.id,id+' story opens on its format\'s Paths');}
  assert.ok(PRACTICES.some(p=>p.id===s.home),id+' home activity '+s.home);
  assert.equal(s.askAbout.length,3);assert.equal(s.cues.length,3);
  for(const k of ['play','practice','playAgain'])assert.ok(s.session[k].length>10);
 }
 assert.equal(new Set(SK.SKILL_IDS.flatMap(id=>SK.SKILLS[id].missions.map(m=>m.id))).size,SK.SKILL_IDS.length*3,'unique mission ids');
 // Every mission of every goal resolves to a real, openable island target (missions → lessons/games/cards/stories).
 const empty={steps:new Set(),answers:new Set(),arcadePlayed:new Set(),cards:new Set(),stories:new Set()};
 let links=0;
 for(const g of IDP.IDP_GOALS)for(const m of SK.SKILLS[g.skill].missions){const t=JO.missionTarget(m,g,empty);assert.ok(t,`${g.id}/${m.id} has a target`);assert.equal(t.kind,m.link==='lesson'?'lesson':t.kind,`${g.id}/${m.id} lesson link`);
  if(t.open.kind==='lesson'){const p=paths.find(p=>p.format===t.open.format);assert.ok([...p.chapters.flatMap(c=>c.lessons),...p.depth].some(l=>l.id===t.open.lessonId),'lesson exists');assert.equal(t.open.format,g.format,'the goal\'s own format');}
  links++;}
 assert.ok(links>=IDP.IDP_GOALS.length*3);
});

// 2. Migration from v1 (versioned, nothing lost; words move to the device-only key; v1 readers keep working).
ok('migration',()=>{
 const v1={version:1,plan:{goalId:'7-look',setAt:NOW-20*DAY,reviewAt:NOW+22*DAY,reviews:[NOW-5*DAY],strength:{corner:'technical',text:'Sam is fast'},
  notes:[{id:'player-1',kind:'player',at:NOW-9*DAY,text:'I looked at Oak Hill School',tag:'tried'},{id:'player-2',kind:'player',at:NOW-8*DAY,text:'',tag:'want-help'},{id:'coach-1',kind:'coach',at:NOW-7*DAY,text:'Sam did well'}]},
  history:[{goalId:'7-open',setAt:NOW-90*DAY,closedAt:NOW-20*DAY,homework:{done:2,total:2}}]};
 const st=mem({'fi2-idp-plan-v1':JSON.stringify(v1)});
 const s=ST.loadIdp2(st);
 assert.equal(s.version,2);assert.equal(s.format,'7v7');assert.deepEqual(J(s.plan.goals),[{goalId:'7-look',setAt:NOW-20*DAY,source:'together'}]);
 assert.equal(s.plan.reviewAt,NOW+22*DAY);assert.deepEqual(J(s.plan.reviews),[{at:NOW-5*DAY,outcome:'keep'}]);assert.equal(s.plan.strength,'technical');
 assert.deepEqual(J(s.plan.checkins.map(c=>[c.feel,!!c.help])),[['getting',false],['tricky',true]],'tags become check-ins; want-help keeps its help flag');
 assert.deepEqual(J(s.history),[{goalId:'7-open',setAt:NOW-90*DAY,closedAt:NOW-20*DAY,outcome:'changed',practice:2}]);
 const text=ST.loadText(st);assert.deepEqual(J(text.notes.map(n=>[n.id,n.kind,n.text])),[['player-1','player','I looked at Oak Hill School'],['coach-1','coach','Sam did well']]);assert.equal(text.strength,'Sam is fast');
 const rawV2=st.getItem('fi2-idp-v2');for(const w of ['Sam','Oak Hill','fast'])assert.ok(!rawV2.includes(w),'no words in the v2 plan: '+w);
 const mirror=st.getItem('fi2-idp-plan-v1');for(const w of ['Sam','Oak Hill','fast'])assert.ok(!mirror.includes(w),'the v1 mirror is text-free: '+w);
 assert.equal(IDP.sanitizeIdp(JSON.parse(mirror)).plan.goalId,'7-look','v1 readers (Pass Puzzles format) still see the focus');
 // Idempotent: loading again reads v2 and doesn't duplicate the words.
 const again=ST.loadIdp2(st);assert.equal(JSON.stringify(again),JSON.stringify(s));assert.equal(ST.loadText(st).notes.length,2);
 // A v2 save always rewrites the mirror (older tabs see the new focus).
 const next=ST.addGoal(s,{goalId:'7-touch',source:'me'},NOW);ST.saveIdp2(next,st);
 assert.deepEqual(J(ST.loadIdp2(st).plan.goals.map(g=>g.goalId)),['7-look','7-touch']);
 // Broken, empty and denied storage never throw.
 for(const raw of ['{bad','null','42','{"version":2,"plan":{"goals":[{"goalId":"nope"}]}}'])assert.equal(ST.loadIdp2(mem({'fi2-idp-v2':raw})).plan,null,raw);
 const denied={getItem(){throw Error('no')},setItem(){throw Error('no')}};assert.equal(ST.loadIdp2(denied).plan,null);ST.saveIdp2(next,denied);ST.saveText(text,denied);
 // No v1 and no v2 → an empty plan in the grown-ups' format.
 assert.equal(ST.loadIdp2(mem(),'9v9').format,'9v9');
});

// 3. Reducers: co-created plan, missions, check-ins, journal, cheers, celebration and the next goal, reviews.
ok('reducers',()=>{
 let s=ST.startPlan(ST.emptyIdp2(),['9-scan','9-touch','9-cover'],'together',NOW,'social');
 assert.deepEqual(J(s.plan.goals.map(g=>g.goalId)),['9-scan','9-touch'],'at most two goals');assert.equal(s.format,'9v9');assert.equal(s.plan.strength,'social');assert.equal(s.plan.reviewAt,NOW+42*DAY);
 assert.equal(ST.startPlan(s,['nope'],'me',NOW),s,'unknown goals ignored');
 s=ST.markMission(s,'scan-fingers','9-scan',NOW);s=ST.markMission(s,'nope','9-scan',NOW);s=ST.markMission(s,'scan-fingers','7-look',NOW);
 assert.equal(s.plan.missions.length,1,'only real missions of open goals');
 s=ST.checkIn(s,{goalId:'9-scan',feel:'tricky',where:'training',help:true},NOW+DAY);s=ST.checkIn(s,{goalId:'9-scan',feel:'cando'},NOW+2*DAY);s=ST.checkIn(s,{goalId:'9-scan',feel:'meh'},NOW);
 assert.deepEqual(J(s.plan.checkins.map(c=>c.feel)),['tricky','cando']);
 s=ST.addProud(s,'helped',NOW+DAY,'9-scan');s=ST.addProud(s,'hack',NOW);assert.equal(s.plan.proud.length,1);
 s=ST.addCheer(s,'trying','home',NOW);s=ST.addCheer(s,'nope','home',NOW);assert.equal(s.plan.cheers.length,1);
 const g=IDP.goalById('9-scan'),empty={steps:new Set(),answers:new Set(),arcadePlayed:new Set(),cards:new Set(),stories:new Set()};
 assert.deepEqual(J(JO.goalGrowth(s.plan,g,empty)),{moments:3,missions:1,tries:2,lessons:0,pieces:3});
 assert.equal(JO.readyToCelebrate(s.plan,g,empty),true);assert.equal(JO.readyToCelebrate(s.plan,IDP.goalById('9-touch'),empty),false,'no practice → not yet');
 // Growth only goes up: a "still tricky" check-in still adds a piece.
 const more=ST.checkIn(s,{goalId:'9-scan',feel:'tricky'},NOW+3*DAY);assert.equal(JO.goalGrowth(more.plan,g,empty).pieces,4);
 // Celebrate → "Things I can do now" → choose the next goal.
 let m=ST.meetGoal(s,'9-scan',NOW+5*DAY);assert.deepEqual(J(m.history.at(-1)),{goalId:'9-scan',setAt:NOW,closedAt:NOW+5*DAY,outcome:'met',practice:3});
 assert.deepEqual(J(m.plan.goals.map(x=>x.goalId)),['9-touch']);
 m=ST.meetGoal(m,'9-touch',NOW+6*DAY);assert.equal(ST.needsNextGoal(m),true);
 const reloaded=ST.sanitizeIdp2(JSON.parse(JSON.stringify(m)));assert.equal(ST.needsNextGoal(reloaded),true,'a goal-less plan survives a reload');
 assert.equal(reloaded.plan.checkins.length,2,'the journal of a met goal is kept');
 m=ST.addGoal(m,{goalId:'9-switch',source:'me'},NOW+6*DAY);assert.deepEqual(J(m.plan.goals.map(x=>x.goalId)),['9-switch']);
 // Coach goal with two already: replaces the named one; a different format switches the plan's wording.
 let c=ST.startPlan(ST.emptyIdp2(),['7-look','7-open'],'me',NOW);
 c=ST.addGoal(c,{goalId:'7-touch',source:'coach',cue:1,play:'exgiveandgo'},NOW,'7-look');
 assert.deepEqual(J(c.plan.goals.map(x=>[x.goalId,x.source,x.cue,x.play])),[['7-open','me',null,null],['7-touch','coach',1,'exgiveandgo']]);
 assert.equal(c.history.at(-1).goalId,'7-look');
 const f=ST.addGoal(c,{goalId:'11-turn',source:'coach'},NOW);assert.equal(f.format,'11v11');assert.deepEqual(J(f.plan.goals.map(x=>x.goalId)),['11-turn']);
 assert.equal(ST.addGoal(c,{goalId:'7-touch',source:'coach',play:'BAD ID'},NOW).plan.goals[1].play,'exgiveandgo','bad play ids are dropped');
 // Reviews restart the window; end closes everything.
 const r=ST.reviewPlan2(c,'adapt',NOW+42*DAY);assert.equal(r.plan.reviewAt,NOW+84*DAY);assert.deepEqual(J(r.plan.reviews),[{at:NOW+42*DAY,outcome:'adapt'}]);
 assert.equal(ST.reviewDue2(c.plan,NOW+42*DAY),true);assert.equal(ST.reviewDue2(c.plan,NOW+41*DAY),false);
 const e=ST.endPlan2(c,NOW+DAY);assert.equal(e.plan,null);assert.ok(e.history.slice(-2).every(h=>h.outcome==='ended'));
 // Sanitising caps logs and drops garbage.
 let big=ST.startPlan(ST.emptyIdp2(),['7-look'],'me',NOW);for(let i=0;i<200;i++)big=ST.markMission(big,'scan-fingers','7-look',NOW+i);
 assert.equal(ST.sanitizeIdp2(J(big)).plan.missions.length,120);
 assert.equal(ST.sanitizeIdp2({version:2,plan:{goals:[{goalId:'7-look',setAt:1,source:'hax'}],setAt:1,reviewAt:2,missions:'x',checkins:[null,{goalId:'7-look',at:1,feel:'cando',help:'yes'}]}}).plan.checkins[0].help,undefined);
 // Unmark undoes this week's tap only.
 const u=ST.unmarkMission(big,'scan-fingers',NOW+199);assert.equal(big.plan.missions.length,120,'the reducer caps too');assert.equal(u.plan.missions.length,119);assert.equal(ST.unmarkMission(big,'scan-fingers',NOW+500).plan.missions.length,120,'older taps stay');
});

// 4. Journey (the story's data): this week's missions, stops, the feel line, the opening beat.
ok('journey',()=>{
 const one=ST.startPlan(ST.emptyIdp2(),['7-look'],'me',NOW);
 assert.deepEqual(J(JO.weekMissions(one.plan,NOW).map(x=>x.mission.id)),['scan-fingers','scan-two-looks','scan-strikers']);
 const two=ST.startPlan(ST.emptyIdp2(),['7-look','7-touch'],'me',NOW);
 const w0=JO.weekMissions(two.plan,NOW),w1=JO.weekMissions(two.plan,NOW+7*DAY);
 assert.equal(w0.length,3);assert.equal(w1.length,3);assert.deepEqual([w0.filter(x=>x.goal.id==='7-look').length,w1.filter(x=>x.goal.id==='7-look').length],[2,1],'two goals alternate who gets two missions');
 const ws=JO.weekStart(NOW);assert.equal(new Date(ws).getDay(),1,'weeks start on Monday');assert.ok(ws<=NOW&&NOW-ws<7*DAY);
 let s=ST.markMission(one,'scan-fingers','7-look',ws-1000);assert.equal(JO.doneThisWeek(s.plan,'scan-fingers','7-look',NOW),false,'last week does not count this week');
 s=ST.markMission(s,'scan-fingers','7-look',ws+1000);assert.equal(JO.doneThisWeek(s.plan,'scan-fingers','7-look',NOW),true);
 s=ST.checkIn(s,{goalId:'7-look',feel:'nochance'},NOW);s=ST.checkIn(s,{goalId:'7-look',feel:'getting'},NOW+1);
 assert.deepEqual(J(JO.feelLine(s.plan,'7-look').map(p=>p.level)),[1],'"no chance" is not a feeling about the skill');
 const stops=JO.journeyStops(s);assert.equal(stops[0].kind,'start');assert.ok(stops.slice(1).every((x,i)=>!i||x.at>=stops[i].at),'oldest first after the start');
 let many=s;for(let i=0;i<30;i++)many=ST.addProud(many,'fun',NOW+i*10);assert.equal(JO.journeyStops(many).length,10);assert.equal(JO.journeyStops(many)[0].kind,'start','the start stays on the path');
 assert.equal(JO.openingBeat(one,NOW),'goal','a new plan opens on its goal');assert.equal(JO.openingBeat(s,NOW),'practice');assert.equal(JO.openingBeat(s,s.plan.reviewAt),'next','review due opens on What\'s next');
 const sum=JO.weekSummary(ST.addProud(ST.checkIn(s,{goalId:'7-look',feel:'tricky',help:true},NOW),'brave',NOW),NOW);
 assert.deepEqual(J(sum),{missions:1,checkins:3,proud:['brave'],help:true,latestFeel:'tricky'});
});

// 5. The save allowlist: the plan and check-ins travel; typed words never do.
ok('allowlist',()=>{
 const S=load('lib/saves/snapshot.ts');
 assert.ok(S.SYNC_KEYS.includes('fi2-idp-v2'),'the v2 plan is synced');assert.ok(S.DEVICE_KEYS.includes('fi2-idp-text-v1'),'the words are a device key');
 assert.equal(S.isSyncKey('fi2-idp-text-v1'),false);
 let s=ST.startPlan(ST.emptyIdp2(),['7-look'],'together',NOW,'technical');s=ST.checkIn(s,{goalId:'7-look',feel:'getting',where:'match',help:true},NOW);s=ST.addProud(s,'brave',NOW);s=ST.addCheer(s,'watch','home',NOW);s=ST.markMission(s,'scan-fingers','7-look',NOW);
 let t=ST.addText(ST.emptyText(),'player','Sam from Oak Hill School looked twice',NOW);t=ST.addText(t,'coach','Sam scanned before the goal kick',NOW);t=ST.addText(t,'home','ask Sam about Leo',NOW);t=ST.setStrengthText(t,'Sam is brave');
 const st=mem();ST.saveIdp2(s,st);ST.saveText(t,st);st.setItem('fi2-music-volume','0.5');
 const snap=S.buildSnapshot(st,NOW),keys=Object.keys(snap.keys).sort();
 assert.deepEqual(keys,['fi2-idp-plan-v1','fi2-idp-v2'],'only the plan keys leave the device');
 const all=JSON.stringify(snap);for(const w of ['Sam','Oak Hill','Leo','brave is','scanned'])assert.ok(!all.includes(w),'no typed words in the save: '+w);
 assert.equal(S.stripIdpText(snap.keys['fi2-idp-v2']),snap.keys['fi2-idp-v2'],'the v2 plan has no text to strip (structural)');
 const back=ST.sanitizeIdp2(JSON.parse(snap.keys['fi2-idp-v2']));assert.equal(JSON.stringify(back),JSON.stringify(s),'the plan and check-ins round-trip through a save');
 // The v2 shape carries no free-text field at all.
 const fields=new Set();const walk=x=>{if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){fields.add(k);walk(v);}};walk(J(s));
 for(const k of ['text','note','notes','name','comment','message'])assert.ok(!fields.has(k),'no '+k+' field in the synced plan');
 // Restore onto another device keeps that device's own words (device key untouched).
 const other=mem({'fi2-idp-text-v1':JSON.stringify(ST.addText(ST.emptyText(),'home','mine',NOW))});
 S.applySnapshot(other,snap);assert.ok((other.getItem('fi2-idp-text-v1')||'').includes('mine'),'a restore never touches the device words');
 // The design doc's tables list both keys (tests/game-saves.cjs compares the code with them).
 const doc=read('docs/accounts-design.md');assert.ok(doc.includes('`fi2-idp-v2`')&&doc.includes('`fi2-idp-text-v1`'));
});

// 6. QR round trips: a coach's goal and a week's plan, inside a #fragment; tamper and junk rejected.
ok('share',()=>{
 const c={goals:['9-scan','9-cover'],cue:2,play:'pk3j2a9xyz1',team:true};
 const enc=SH.encodeCoachGoal(c);assert.match(enc,/^1~9-scan\+9-cover~q2~ppk3j2a9xyz1~t~k[0-9a-z]{3}$/);
 assert.deepEqual(J(SH.decodeCoachGoal(enc)),c);assert.deepEqual(J(SH.decodeCoachGoal(encodeURIComponent(enc))),c,'survives URL encoding');
 assert.deepEqual(J(SH.decodeCoachGoal(SH.encodeCoachGoal({goals:['f-look']}))),{goals:['f-look']});
 assert.equal(SH.decodeCoachGoal(enc.replace('9-cover','9-touch')),null,'a changed goal fails the check');
 assert.equal(SH.decodeCoachGoal(enc.slice(0,-1)+(enc.at(-1)==='a'?'b':'a')),null,'a changed check fails');
 const forge=(body)=>`${body}~k${SH.shareCheck(body)}`;
 assert.equal(SH.decodeCoachGoal(forge('1~nope')),null,'unknown goal');assert.equal(SH.decodeCoachGoal(forge('1~7-look+9-scan')),null,'mixed formats');
 assert.equal(SH.decodeCoachGoal(forge('1~7-look~xjunk')),null,'unknown field');assert.equal(SH.decodeCoachGoal(forge('2~7-look')),null,'future version');
 assert.equal(SH.decodeCoachGoal(forge('1~7-look~q7')),null,'cue out of range');assert.equal(SH.decodeCoachGoal(forge('1~7-look+7-open+7-touch')),null,'at most two');
 assert.throws(()=>SH.encodeCoachGoal({goals:['nope']}));
 const url=SH.coachGoalUrl('https://futbolisland.app',c);assert.ok(url.startsWith('https://futbolisland.app/plan#c='),'the goal rides in the fragment, never a query');
 assert.deepEqual(J(SH.readFragment(new URL(url).hash)),{kind:'coach',share:c});
 const w={format:'7v7',goals:['7-look'],missions:3,checkins:2,stickers:['brave','fun'],feel:'getting',help:true,reviewDay:SH.dayNumber(NOW)};
 const we=SH.encodeWeek(w);assert.deepEqual(J(SH.decodeWeek(we)),w);assert.ok(!/[A-Z ]/.test(we),'compact, no names');
 assert.equal(SH.decodeWeek(we.replace('m3','m9')),null);assert.deepEqual(J(SH.readFragment('#p='+we)),{kind:'week',share:w});
 assert.equal(SH.readFragment('#save=striker-volley-corner-427').kind,'bad');assert.equal(SH.readFragment('').kind,'none');
 assert.deepEqual(J(SH.decodeWeek(SH.encodeWeek({format:'9v9',goals:[],missions:0,checkins:0,stickers:[]}))),{format:'9v9',goals:[],missions:0,checkins:0,stickers:[]});
 // The landing page reads only the fragment and fetches nothing.
 const page=read('components/idp/PlanLink.tsx');assert.ok(/location\.hash/.test(page)&&!/fetch\(|sendBeacon|XMLHttpRequest|location\.search/.test(page));
});

// 7. No ranking, no scores, no comparison: every word a child or grown-up reads.
ok('language',()=>{
 const kid=[];for(const g of IDP.IDP_GOALS)kid.push(g.ican,g.title,g.why,g.tryIt,g.parentCue);
 for(const id of SK.SKILL_IDS){const s=SK.SKILLS[id];kid.push(s.kid,s.grownWhy,s.diagram.caption,...s.askAbout,s.avoid,...s.cues);for(const m of s.missions)kid.push(m.title,...m.steps);}
 for(const o of [SK.STICKERS,SK.FEELS])for(const v of Object.values(o))kid.push(v.kid,v.grown);kid.push(...Object.values(SK.CHEERS),...Object.values(SK.PLACES),...SK.SAY_INSTEAD);
 const ui=['components/idp/PlayerStory.tsx','components/idp/PlanBuilder.tsx','components/idp/Celebrate.tsx','components/idp/GrownUpWeek.tsx','components/idp/CoachTools.tsx','components/idp/PlanLink.tsx','components/IdpPlan.tsx','lib/coaches/idp/fridge.ts']
  .map(f=>read(f).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,''));
 const BANNED=[/\brank(s|ed|ing)?\b/i,/\bleaderboards?\b/i,/\bstreaks?\b/i,/\b(better|faster|smarter|stronger) than\b/i,/\bbest (player|in|on the)\b/i,/\bworst\b/i,/\btop \d+\b/i,/\blevel ?up\b/i,/\b(talented|gifted)\b/i,/\b(my|your|their|high|low|total|skill|ability|player) scores?\b/i,/\bscor(e|ed|ing) (you|them|the child|players|kids|children)\b/i,/\b\d+ points?\b/i,/\bpoints? (for|to) (you|them)\b/i,/\bearn(ed)? (stars|points)\b/i,/\d+ ?%/,/\bpercent/i,/\bxp\b/i,/\bbehind (the others|everyone|your teammates)\b/i,/\bthan (your )?(teammates|friends|others)\b/i];
 for(const t of [...kid,...ui])for(const re of BANNED)assert.ok(!re.test(t),`ranking/score language ${re} in: ${String(t).slice(0,90)}`);
 // Coach session drills may count points in a game, but never rank players.
 for(const id of SK.SKILL_IDS)for(const t of Object.values(SK.SKILLS[id].session))for(const re of [/\brank/i,/\bbest player/i,/\bworst/i,/leaderboard/i])assert.ok(!re.test(t),t);
 // Growth language is present where it matters.
 const story=read('components/idp/PlayerStory.tsx');assert.match(story,/only grows/);assert.match(read('components/idp/GrownUpWeek.tsx'),/aren’t a score, and there’s nothing to compare/);
 assert.ok(SK.AVOID_ALWAYS.some(a=>/Comparing/.test(a))&&SK.AVOID_ALWAYS.some(a=>/car home/.test(a)),'parents are told not to compare and about the car ride home');
});

// 8. Analytics: fixed ids, totals only, and only real events are counted.
ok('analytics',()=>{
 const K=load('lib/analytics/countIds.ts');
 for(const [e] of K.IDP_COUNT_EVENTS){assert.ok(K.isCountId('ip:'+e),e);assert.ok(K.FIXED_COUNT_IDS.includes('ip:'+e));}
 assert.equal(K.isCountId('ip:7-look'),false,'never a goal id');assert.equal(K.isCountId('ip:mission:scan-fingers'),false,'never a mission id');
 const events=new Set(K.IDP_COUNT_EVENTS.map(([e])=>e));
 const files=['components/IdpPlan.tsx',...fs.readdirSync(path.join(ROOT,'components/idp')).filter(f=>f.endsWith('.tsx')||f.endsWith('.ts')).map(f=>'components/idp/'+f)];
 const used=new Set();for(const f of files)for(const m of read(f).matchAll(/countIdp\(([^)]*)\)/g)){assert.match(m[1],/^'[a-z]+'$/,`${f}: countIdp takes a fixed literal (${m[1]})`);used.add(m[1].slice(1,-1));}
 for(const e of used)assert.ok(events.has(e),'counted event is on the allowlist: '+e);
 for(const e of ['open','set','mission','checkin','met','review','grown','fridge','coachqr','coachadd','week','helped'])assert.ok(used.has(e),'the design\'s measure is wired: '+e);
});

// 9. The board contract (docs/idp/BOARD-LINK.md): ids only, never board internals.
ok('board',()=>{
 const B=load('lib/coaches/idp/board.ts');
 for(const id of ['exgiveandgo','pk3j2a9xyz1','p0abc123def'])assert.ok(B.isBoardPlayId(id),id);
 for(const id of ['','Upper','has space','x'.repeat(33),'-lead',null,7])assert.equal(B.isBoardPlayId(id),false,String(id));
 for(const f of fs.readdirSync(path.join(ROOT,'components/idp')))assert.ok(!/coaches\/board\/|coaches-board\//.test(read('components/idp/'+f)),f+' never imports board internals');
 assert.ok(fs.existsSync(path.join(ROOT,'docs/idp/BOARD-LINK.md')),'the contract is documented for the board agent');
});

// 10. Heat and privacy: no loops, no infinite animation, nothing sent; printouts are self-contained.
ok('heat',()=>{
 const dir=path.join(ROOT,'components/idp');
 for(const f of [...fs.readdirSync(dir).map(f=>'components/idp/'+f),'components/IdpPlan.tsx','lib/coaches/idp/motion.ts']){const src=read(f).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
  assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(src),f+': no frame loops or timers');
  assert.ok(!/\binfinite\b/.test(src),f+': no infinite animation');
  assert.ok(!/fetch\(|sendBeacon|XMLHttpRequest|navigator\.share/.test(src),f+': sends nothing');}
 const css=read('components/idp/Idp.module.css');assert.match(css,/prefers-reduced-motion:reduce/);assert.ok(!/::view-transition/.test(css),'no global view-transition rules');
 assert.match(read('components/IdpPlan.tsx'),/dynamicImport\(\(\)=>import\('\.\/idp\/GrownUpWeek'\)/,'grown-up view is lazy');
 assert.match(read('components/CoachesCentre.tsx'),/const IdpPlan=dynamicImport\(\(\)=>import\('\.\/IdpPlan'\)/,'the plan loads with the Coaches Centre, on demand');
 const F=load('lib/coaches/idp/fridge.ts');
 let s=ST.startPlan(ST.emptyIdp2(),['7-look'],'together',NOW);s=ST.addProud(s,'brave',Date.now());
 const html=F.fridgeCardHtml(s,{printedAt:NOW,qrDataUrl:'data:image/png;base64,AAAA'});
 assert.match(html,/I can look around before the ball comes to me/);assert.match(html,/Finger flash/);assert.match(html,/Ask about/);assert.match(html,/Try not to/);assert.match(html,/Our player’s football plan/);
 assert.ok(!/<script|https?:\/\//i.test(html),'no scripts or links');assert.match(F.fridgeCardHtml(s,{firstName:'Sam<script>',printedAt:NOW}),/Samscript’s football plan/,'name cleaned to letters');
 assert.match(F.fridgeCardHtml(ST.emptyIdp2(),{printedAt:NOW}),/No goal right now/);
});
console.log(`PASS IDP v2: ${passed} groups (catalogue + mission links, v1 migration, reducers, journey, save allowlist, QR round trips, no-ranking language, analytics, board contract, heat/privacy)`);
