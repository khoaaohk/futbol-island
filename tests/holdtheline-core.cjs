// Hold the Line (Nov 21 2026, docs/arcade-aaa/holdtheline-direction.md): the defending game. The offside judge (Law 11: judged when
// the ball is played, against the second-last defender, the keeper included; level = onside; own half = never), determinism per seed,
// frame-rate independence (fixed 1/60 s steps), the daily seed, each answer (step, drop, slide, press) and what the wrong one costs,
// every wave winnable, the match rules, the trap book, the device save, the wiring, the shell and the sound.
// Fairness and difficulty: tests/holdtheline-bots.cjs.
//   node tests/holdtheline-core.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/holdtheline/core.ts'),S=require('../lib/arcade/holdtheline/save.ts'),B=require('./holdtheline-bots.cjs'),{HL,TEAMS,HL_FEATS}=C;
const read=p=>fs.readFileSync(p,'utf8');let n=0;const ok=(name,fn)=>{fn();n++;};
/** runs the game until `stop(state, look)` or `secs` pass; returns the events */
const run=(g,stop,secs=40,dt=1/60)=>{const ev=[];for(let t=0;t<secs&&!g.state.over;t+=dt){if(stop&&stop(g.state,g.look()))break;g.advance(dt);g.drain(e=>ev.push(e));}return ev;};
/** a match whose FIRST wave is of this kind, kicked off */
const first=(kind,league=0,skip=0)=>{for(let m=0;m<TEAMS.length;m++)for(let seed=1;seed<60;seed++){const g=C.createHoldTheLine({seed,league,match:m});if(g.plans[0].kind===kind&&skip--<=0){g.ack();g.drain(()=>{});return g;}}throw new Error('no '+kind);};
const toTell=(g,kind)=>run(g,(s,L)=>!!L.tell&&(!kind||L.tell.kind===kind)),toRes=g=>run(g,s=>s.phase==='res'),toEnd=g=>{const w=g.state.wave;return run(g,s=>s.wave!==w||s.phase==='gap');};

ok('offside is judged against the second-last defender, the keeper included',()=>{
 const J=C.judgeOffside,keeper=1.5;
 assert.equal(J({attackerY:19,ballY:30,defendersY:[keeper,20,20,20,20]}).offside,true,'past the line of four: offside');
 assert.equal(J({attackerY:19,ballY:30,defendersY:[keeper,20,20,20,20]}).line,20);
 assert.equal(J({attackerY:21,ballY:30,defendersY:[keeper,20,20,20,20]}).reason,'onside');
 // level with the second-last defender = onside (and "level" has a little give: HL.level)
 assert.deepEqual([J({attackerY:20,ballY:30,defendersY:[keeper,20,22]}).offside,J({attackerY:20,ballY:30,defendersY:[keeper,20,22]}).reason],[false,'level']);
 assert.equal(J({attackerY:20-HL.level+.01,ballY:30,defendersY:[keeper,20,22]}).reason,'level');assert.equal(J({attackerY:20-HL.level-.01,ballY:30,defendersY:[keeper,20,22]}).offside,true);
 // one defender dropped behind the others plays everyone onside: the line is the SECOND-last, not the highest
 assert.equal(J({attackerY:19,ballY:30,defendersY:[keeper,15,24,24,24]}).offside,false);assert.equal(J({attackerY:19,ballY:30,defendersY:[keeper,15,24,24,24]}).line,15);
 // the keeper counts as a defender only when he is one of the last two
 assert.equal(J({attackerY:12,ballY:30,defendersY:[15,10,20]}).line,15,'keeper (15) off his line is the second-last: he is the offside line');assert.equal(J({attackerY:12,ballY:30,defendersY:[15,10,20]}).offside,true);
 assert.equal(J({attackerY:18,ballY:30,defendersY:[25,10,20]}).line,20,'keeper (25) far out: the last two are outfield defenders');assert.equal(J({attackerY:18,ballY:30,defendersY:[25,10,20]}).offside,true);
 assert.equal(J({attackerY:21,ballY:30,defendersY:[25,10,20]}).offside,false);
 // your own half = never offside; on the halfway line counts as your own half
 assert.deepEqual([J({attackerY:HL.half+.5,ballY:42,defendersY:[keeper,37,37]}).offside,J({attackerY:HL.half+.5,ballY:42,defendersY:[keeper,37,37]}).reason],[false,'ownhalf']);
 assert.equal(J({attackerY:HL.half,ballY:42,defendersY:[keeper,37,37]}).reason,'ownhalf');assert.equal(J({attackerY:HL.half-.3,ballY:42,defendersY:[keeper,37,37]}).offside,true);
 // behind or level with the ball = never offside
 assert.equal(J({attackerY:12,ballY:11,defendersY:[keeper,20,20]}).reason,'behindball');assert.equal(J({attackerY:11,ballY:11,defendersY:[keeper,20,20]}).offside,false);
 assert.equal(J({attackerY:5,ballY:30,defendersY:[keeper]}).offside,true,'fewer than two defenders: nobody can play him onside');assert.equal(HL.half,36);});

ok('one seed, one match: the same waves, whatever the frame rate',()=>{
 const sig=(seed,dt,bot='ideal')=>{const p=B.play(seed,bot,{league:0,match:9,dt});return p.kinds.join(',')+'|'+p.log+'|'+p.score;};
 const raw=(seed,dt)=>{const g=C.createHoldTheLine({seed,match:9});g.ack();const out=[];let guard=0;while(!g.state.over&&guard++<40000){g.advance(dt);g.drain(e=>{if(e.type==='wave'||e.type==='goal'||e.type==='stop'||e.type==='kick')out.push(`${e.type}:${e.word}:${e.a}`);});}return out.join(' ');};
 assert.equal(raw(42,1/60),raw(42,1/60));assert.equal(raw(42,1/60),raw(42,1/30),'30 or 60 draws a second: the same match');assert.equal(raw(42,1/60),raw(42,.011));assert.notEqual(raw(42,1/60),raw(43,1/60));
 assert.equal(sig(7,1/60),sig(7,1/60));assert.equal(HL.step,1/60);
 const a=C.createHoldTheLine({seed:5,match:3}),b=C.createHoldTheLine({seed:5,match:3});assert.deepEqual(a.plans,b.plans);assert.equal(a.plans.length,HL.waves);assert.equal(HL.waves,12);});

ok('Match of the Day: one pattern a day, the same for everyone',()=>{
 const a=C.holdthelineDailySeed('2026-11-21');assert.equal(a,C.holdthelineDailySeed('2026-11-21'));assert.notEqual(a,C.holdthelineDailySeed('2026-11-22'));assert.ok(a>0&&a<=2_000_000_000);
 assert.equal(a,(()=>{let h=0x811c9dc5;for(const ch of 'holdtheline:2026-11-21'){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;})(),'the arcade daily seed: FNV-1a of id + day');
 const g=C.createHoldTheLine({seed:a,daily:true}),h=C.createHoldTheLine({seed:a,daily:true});assert.deepEqual(g.plans,h.plans);assert.equal(g.team.id,'motd');assert.equal(g.backs,4);
 assert.equal(new Set(g.plans.map(p=>p.kind)).size,9,'every kind of attack is in the day’s pattern');
 assert.notDeepEqual(g.plans.map(p=>p.kind+p.side),C.createHoldTheLine({seed:C.holdthelineDailySeed('2026-11-22'),daily:true}).plans.map(p=>p.kind+p.side));
 const p=B.play(a,'ideal',{daily:true});assert.equal(p.goals,0);assert.equal(p.stars,3);});

ok('step up during the wind-up: the runner is past the line when the ball is played = OFFSIDE',()=>{
 const g=first('thru');toTell(g,'thru');const s=g.state,line0=s.lineY;assert.equal(s.tell.kind,'thru');
 g.move(s.lineY+3,0);const ev=[...toRes(g)];const k=ev.find(e=>e.type==='kick');assert.equal(k.a,1,'the flag');assert.equal(k.word,'thru');assert.equal(s.res.kind,'offside');
 assert.ok(s.snap.offside&&s.snap.reason==='offside');assert.ok(s.snap.line>line0+HL.level,'the line moved up');assert.ok(Math.abs(s.snap.line-g.secondLast())<.2,'the snapshot is the second-last defender at the kick');
 assert.ok(Math.abs(s.snap.ry-(line0+g.tn.margin))<1e-6,'the runner timed his run to be just onside of where the line WAS');assert.ok(s.snap.ry<s.snap.line-HL.level);
 const st=ev.find(e=>e.type==='stop');assert.equal(st.word,'offside');assert.equal(st.points,150);assert.equal(s.goals,0);assert.equal(s.stops,1);assert.ok(s.feats.includes('first'));});

ok('hold = he is onside and through on goal; a step after the kick is too late; a step before the wind-up only makes the passer wait',()=>{
 let goals=0,saves=0;for(let k=0;k<12;k++){const g=first('thru',0,k);toTell(g,'thru');const ev=toRes(g),kick=ev.find(e=>e.type==='kick');assert.equal(kick.a,0);assert.equal(g.state.snap.reason,'onside');assert.equal(g.state.res.kind,'through');
  toEnd(g);goals+=g.state.goals;saves+=g.state.stats.saves;if(g.state.goals)assert.equal(g.state.stats.lastWhy,'held');}
 assert.ok(goals>=6&&saves>=1,`a one on one is usually a goal, sometimes a save (${goals} goals, ${saves} saves of 12)`);
 // late: the step comes just after the ball is played
 {let late=0;for(let k=0;k<12;k++){const g=first('thru',0,k);toTell(g,'thru');toRes(g);g.move(g.state.lineY+3,0);toEnd(g);assert.equal(g.state.res.kind,'through');if(g.state.goals){late++;assert.equal(g.state.stats.lastWhy,'late');}}assert.ok(late>=6);}
 // early: while the line is still stepping up the passer does not shape (the runner holds his run) ...
 {const g=first('thru');run(g,s=>s.bi===g.plans[0].beats.length-1&&s.stage==='hold');g.move(HL.maxY,0);const t0=g.state.t;run(g,(s,L)=>!!L.tell||s.t-t0>1.2);assert.equal(g.state.tell,null,'no wind-up while the line is moving up');assert.ok(g.state.lineY>26);
  // ... and a line pushed past halfway cannot catch anyone: the runner is in his own half
  run(g,s=>s.phase==='res');assert.equal(g.state.snap.reason,'ownhalf');assert.equal(g.state.snap.offside,false);assert.equal(g.state.res.kind,'through');toEnd(g);if(g.state.goals)assert.equal(g.state.stats.lastWhy,'ownhalf');}});

ok('a runner from deep and a decoy: the same judge; a decoy standing offside is not the one the ball is played to',()=>{
 {const g=first('deep');toTell(g,'thru');assert.ok(g.state.atk[5].y>g.state.lineY+3,'he starts well behind the line');g.move(g.state.lineY+3,0);toRes(g);assert.equal(g.state.res.kind,'offside');}
 {const g=first('decoy');toTell(g,'thru');g.move(g.state.lineY+3,0);toRes(g);assert.equal(g.state.res.kind,'offside');assert.ok(g.state.atk[6].y>g.state.snap.line,'the decoy checked short: he is in front of the line');}});

ok('a long ball from his own half: the runner cannot be offside; drop and it is swept up',()=>{
 {const g=first('long');toTell(g,'long');assert.ok(g.state.atk[g.state.holder].y>HL.half,'the passer is in his own half');g.move(g.state.lineY+4,0);const ev=run(g,s=>s.phase==='res');
  const k=ev.find(e=>e.type==='kick');assert.equal(k.a,0,'no flag');assert.equal(g.state.snap.reason,'ownhalf');assert.equal(g.state.res.kind,'through');toEnd(g);if(g.state.goals)assert.equal(g.state.stats.lastWhy,'long');}
 {const g=first('long');run(g,(s,L)=>L.deepPasser);g.move(15,0);const ev=run(g,s=>s.phase==='res');assert.equal(g.state.res.kind,'swept');assert.equal(ev.find(e=>e.type==='stop').word,'swept');assert.ok(g.state.feats.includes('sweep'));}});

ok('sit deep and they shoot from distance: the keeper saves most, not all; a press can block it',()=>{
 let goals=0,N=0;for(let m=0;m<TEAMS.length;m++)for(let seed=1;seed<8;seed++){const g=C.createHoldTheLine({seed,match:m});if(!['thru','decoy','deep'].includes(g.plans[0].kind))continue;g.ack();g.move(HL.minY,0);const ev=run(g,s=>s.phase==='res');
  assert.equal(ev.find(e=>e.type==='tell').word,'shot');assert.equal(g.state.res.kind,'shot');assert.equal(g.state.snap,null,'no ball in behind');toEnd(g);N++;goals+=g.state.goals;if(g.state.goals)assert.equal(g.state.stats.lastWhy,'deep');}
 assert.ok(N>=10&&goals/N>.25&&goals/N<.75,`from the edge of the box about half go in (${goals}/${N})`);assert.ok(C.saveChance(26)>.95&&C.saveChance(15)<.55);
 {const g=first('thru');g.move(HL.shotLine-.5,0);toTell(g,'shot');g.press(g.nearest());toRes(g);assert.equal(g.state.res.kind,'block');assert.ok(g.state.feats.includes('block'));}});

ok('out wide and the switch of play: slide across or the winger is free',()=>{
 for(const kind of ['wide','switch'])for(const league of [0,1]){
  {const g=first(kind,league);let side=0;run(g,(s,L)=>{if(L.wide){side=L.wide;return true;}return false;});assert.ok(side!==0);g.move(g.state.lineY,side*HL.maxX);const ev=run(g,s=>s.phase==='res');assert.equal(g.state.res.kind,'slide',`${kind} league ${league}: a slide in time covers the winger`);assert.equal(ev.find(e=>e.type==='stop').word,'slide');if(kind==='switch')assert.ok(g.state.feats.includes('slide'));}
  {const g=first(kind,league);run(g,s=>s.phase==='res');assert.equal(g.state.res.kind,'free');toEnd(g);if(g.state.goals)assert.equal(g.state.stats.lastWhy,'wide');}}
 {const g=first('switch');const b=g.plans[0].beats,w=b[b.length-1];assert.ok(w.sw&&w.k==='wide');assert.equal(w.to,g.plans[0].side<0?4:3,'the switch goes to the FAR winger');}});

ok('pressing: win a heavy touch or a passer who waits; press a plain pass and they play into the gap',()=>{
 {const g=first('heavy');run(g,(s,L)=>L.heavy);const i=g.nearest();assert.equal(g.press(i),true);assert.equal(g.press(i),false,'one presser at a time');const ev=run(g,s=>s.phase==='res');assert.equal(g.state.res.kind,'tackle');assert.equal(ev.find(e=>e.type==='stop').word,'tackle');assert.ok(g.state.feats.includes('tackle'));
  toEnd(g);run(g,s=>!s.press,6);assert.equal(g.state.press,null,'the presser comes back into the line');}
 {const g=first('heavy');toTell(g,'thru');g.move(g.state.lineY+3,0);toRes(g);assert.equal(g.state.res.kind,'offside','a heavy touch that is not pressed becomes a through ball: the step still works');}
 {const g=first('bend');run(g,(s,L)=>L.waiting);g.press(g.nearest());toRes(g);assert.equal(g.state.res.kind,'tackle');}
 {const g=first('bend');toTell(g,'thru');g.move(g.state.lineY+3,0);toRes(g);assert.equal(g.state.res.kind,'through','she bends her run and stays level');assert.equal(g.state.snap.reason,'level');assert.equal(g.state.snap.offside,false);toEnd(g);if(g.state.goals)assert.equal(g.state.stats.lastWhy,'bend');}
 {const g=first('thru');run(g,s=>s.stage==='hold'&&s.bi===0);const i=g.nearest();g.press(i);const x=g.state.defs[i].x;run(g,s=>s.phase==='res'||Math.abs(s.defs[i].y-s.lineY)>2,5);assert.ok(Math.abs(g.state.defs[i].y-g.state.lineY)>2,'the presser leaves the line: a gap');void x;
  run(g,s=>s.phase==='res',12);if(g.state.res.kind==='gap'){toEnd(g);if(g.state.goals)assert.equal(g.state.stats.lastWhy,'gap');}}
 {let gaps=0;for(let k=0;k<10;k++){const g=first('thru',0,k);run(g,s=>s.stage==='hold'&&s.bi===g.plans[0].beats.length-1);g.press(g.nearest());run(g,s=>s.phase==='res');if(g.state.res.kind==='gap')gaps++;}assert.ok(gaps>=8,`a press on a plain pass is passed round (${gaps}/10)`);}
 {const g=first('wide');run(g,(s,L)=>L.wide!==0&&s.stage==='hold');assert.equal(g.press(0),false,'only the midfield can be pressed');}});

ok('two balls in behind: a pass to feet (no flag), then the real one: step again',()=>{
 const g=first('double');toTell(g,'feet');g.move(g.state.lineY+2.5,0);const ev=run(g,(s,L)=>!!L.tell&&L.tell.kind==='thru');assert.equal(ev.find(e=>e.type==='kick').word,'feet');assert.equal(g.state.phase,'play');
 g.move(g.state.lineY+2.5,0);toRes(g);assert.equal(g.state.res.kind,'offside');assert.ok(g.state.feats.includes('double'));});

ok('the pass to feet is judged too: step right past the runner during that wind-up and he receives it OFFSIDE (verify Nov 21)',()=>{
 const g=first('double');toTell(g,'feet');const s=g.state;g.move(s.lineY+8,0);toRes(g);assert.equal(s.res.kind,'offside');assert.equal(s.snap.offside,true);assert.ok(!s.feats.includes('double'),'Twice bitten is for the SECOND ball');});
ok('a nearly-right read gives the keeper a better chance than none; the right read never asks the lucky number (verify Nov 21)',()=>{
 const src=read('lib/arcade/holdtheline/core.ts');assert.match(src,/late\?\.6:\.78/);assert.match(src,/near<=cover\+2\.5\?\.55:\.38/);assert.match(src,/sweepLine\+3\?\.55:\.8/);});
ok('every wave is winnable: the bot that reads and answers lets nothing in, against every team, in both leagues',()=>{
 let waves=0;for(let league=0;league<2;league++)for(let m=0;m<TEAMS.length;m++)for(let i=0;i<6;i++){const p=B.play(300+i*41+m,'ideal',{league,match:m});assert.equal(p.log,'1'.repeat(HL.waves),`league ${league} ${TEAMS[m].name} seed ${i}: ${p.kinds.join(',')} -> ${p.log}`);waves+=HL.waves;assert.equal(p.stars,3);}
 assert.equal(waves,1440);
 for(const t of TEAMS){assert.equal(t.deck.length,9);for(const k of t.deck)assert.ok(C.KIND_NAME[k]);assert.ok(t.lesson.length>8&&t.tip.length>40&&t.tip.length<190);}assert.equal(TEAMS.length,10);assert.deepEqual(TEAMS.slice(0,2).map(t=>t.back),[3,3],'the first two matches are small-sided: a back three');
 assert.equal(new Set(TEAMS.map(t=>t.style)).size,10);});

ok('the match: goals against a limit, stars, a clean sheet is the prize; harder league = less time',()=>{
 const p=B.play(11,'ideal',{league:0,match:0});assert.ok(p.won&&p.goals===0&&p.stars===3);const q=B.play(11,'drop',{league:0,match:0});assert.equal(q.won,false);assert.equal(q.stars,0);assert.ok(q.goals===C.tuning(0,0).limit+1,'the match ends when the limit is passed');
 assert.deepEqual([C.tuning(0,0).limit,C.tuning(0,5).limit,C.tuning(0,6).limit,C.tuning(1,0).limit],[3,2,1,1]);assert.deepEqual([C.tuning(0,0).aid,C.tuning(0,4).aid,C.tuning(0,8).aid,C.tuning(1,0).aid],[2,1,0,0],'the helper line fades out');
 for(let m=0;m<10;m++){assert.ok(C.tuning(1,m).W<C.tuning(0,m).W,'promoted: a shorter wind-up');assert.ok(C.tuning(1,m).W>=.5,'never shorter than a child can react to');if(m)assert.ok(C.tuning(0,m).W<C.tuning(0,m-1).W);}
 assert.ok(p.score>HL.medals[1]&&p.score<HL.scoreMax);assert.equal(C.medalFor(HL.medals[0]),1);assert.equal(C.medalFor(HL.medals[2]),3);assert.equal(C.medalFor(HL.medals[0]-1),0);
 const g=C.createHoldTheLine({seed:3});assert.equal(g.state.phase,'tip');g.advance(2);assert.equal(g.state.t>0&&g.state.phase==='tip',true,'nothing happens until the team card is read');assert.equal(g.ack(),true);assert.equal(g.ack(),false);
 const intro=C.createHoldTheLine({seed:3,intro:true});assert.equal(intro.plans[0].kind,'thru');for(const seed of [1,2,3,4,5,6,7,8])assert.equal(C.createHoldTheLine({seed,intro:true}).plans[0].kind,'thru','the guided first wave is a plain through ball');});

ok('the trap book: twelve feats, ids exported for a future weekly card',()=>{
 assert.equal(HL_FEATS.length,12);assert.deepEqual(C.HL_FEAT_IDS,HL_FEATS.map(f=>f.id));assert.equal(new Set(C.HL_FEAT_IDS).size,12);for(const f of HL_FEATS)assert.ok(f.name&&f.how.length>10&&/^#[0-9a-f]{6}$/.test(f.color));
 const p=B.play(21,'ideal',{league:0,match:4});assert.ok(p.stats.offsides>=3);assert.equal(C.createHoldTheLine({seed:21,match:4}).team.id,'mango');
 // an ideal clean sheet against the counter team earns its feats
 {const g=C.createHoldTheLine({seed:21,match:4});g.ack();let seen='',due=-1,act='';while(!g.state.over){const L=g.look(),s=g.state,tag=L.tell?L.tell.kind:L.deepPasser?'deep':'';if(tag&&tag!==seen){seen=tag;due=s.t+.2;act=tag==='thru'||tag==='feet'?'step':'drop';}if(!L.play)seen='';
   if(due>0&&s.t>=due){due=-1;g.move(act==='step'?s.lineY+2.6:15.5,0);}g.advance(1/60);g.drain(()=>{});}
  for(const id of ['first','three','sweep','five','clean','counter'])assert.ok(g.state.feats.includes(id),id);assert.ok(!g.state.feats.includes('motd3'));}});

ok('the device save: stars per match, promotion, the clean-sheet run, the daily; a bad save never throws',()=>{
 const e=S.emptyHoldthelineSave();assert.equal(S.HOLDTHELINE_KEY,'fi2-holdtheline-v1');assert.deepEqual(e.season,[Array(10).fill(0),Array(10).fill(0)]);
 for(const bad of ['x',[],null,7,undefined,{best:'x',book:'no',season:'x',daily:5},{season:[[9,-1,'a'],null],daily:{day:'<b>',stars:-4},cleanRun:5,cleanBest:2},{book:['first','nope',3],seen:['thru','x']}])assert.doesNotThrow(()=>S.sanitizeHoldthelineSave(bad),'a bad save never throws');
 {const s=S.sanitizeHoldthelineSave({season:[[9,-1,'a'],null],cleanRun:5,cleanBest:2,book:['first','nope',3],best:1e9,daily:{day:'<b>',stars:-4}});assert.deepEqual(s.season[0].slice(0,3),[3,0,0]);assert.deepEqual(s.season[1],Array(10).fill(0));assert.equal(s.cleanRun,2);assert.deepEqual(s.book,['first']);assert.equal(s.best,HL.scoreMax);assert.equal(s.daily.day,'');}
 assert.deepEqual(S.sanitizeHoldthelineSave(JSON.parse(JSON.stringify(e))),e);
 const stats={offsides:3,tackles:0,blocks:0,swept:0,slides:0,saves:0,covers:0,goals:0,presses:0,bestRow:3,lastWhy:''},base={score:2000,daily:false,day:'2026-11-21',league:0,match:0,won:true,stars:3,goals:0,stats,feats:['first','clean'],kinds:['thru']};
 let r=S.settleHoldtheline(e,base);assert.equal(r.save.season[0][0],3);assert.equal(r.opened,1);assert.equal(r.newBest,true);assert.equal(r.medal,1);assert.deepEqual(r.newFeats,['first','clean']);assert.equal(r.cleanRun,1);assert.equal(r.newCleanBest,true);assert.equal(S.nextMatch(r.save,0),1);
 assert.equal(S.matchOpen(r.save,0,1),true);assert.equal(S.matchOpen(r.save,0,2),false);assert.equal(S.leagueOpen(r.save,1),false);
 // a match that is not open yet cannot be credited; a loss changes nothing but the run
 assert.equal(S.settleHoldtheline(e,{...base,match:5}).save.season[0][5],0);
 {const l=S.settleHoldtheline(r.save,{...base,match:1,won:false,stars:0,goals:4,feats:[]});assert.equal(l.save.season[0][1],0);assert.equal(l.cleanRun,0);assert.equal(l.save.cleanBest,1,'the best run is kept');assert.equal(l.opened,-1);}
 // fewer stars later never lowers a match
 {const l=S.settleHoldtheline(r.save,{...base,stars:1,goals:2});assert.equal(l.save.season[0][0],3);assert.equal(l.newStars,false);assert.equal(l.cleanRun,0);}
 // promotion: the tenth win opens the Island Premier and earns the page
 {let s=e;let last;for(let m=0;m<10;m++){last=S.settleHoldtheline(s,{...base,match:m,stars:1,goals:1,feats:[]});s=last.save;}assert.equal(last.promoted,true);assert.ok(last.newFeats.includes('promo'));assert.equal(S.leagueOpen(s,1),true);assert.equal(S.matchOpen(s,1,0),true);assert.equal(S.matchOpen(s,1,1),false);assert.equal(S.seasonStars(s,0),10);
  assert.equal(S.settleHoldtheline(s,{...base,match:9,stars:2,goals:1,feats:[]}).promoted,false,'only once');const up=S.settleHoldtheline(s,{...base,league:1,match:0});assert.equal(up.save.season[1][0],3);}
 // the daily: stars out of three, the first finished one is the day's, a new day starts fresh
 {const d=S.settleHoldtheline(e,{...base,daily:true,stars:2,goals:1});assert.equal(d.dailyFirst,true);assert.equal(d.dailyStars,2);assert.equal(d.save.season[0][0],0,'the daily is not a season match');assert.equal(d.save.best,0);
  const d2=S.settleHoldtheline(d.save,{...base,daily:true,stars:3});assert.equal(d2.dailyFirst,false);assert.equal(d2.dailyStars,3);assert.equal(d2.save.daily.runs,2);const d3=S.settleHoldtheline(d2.save,{...base,daily:true,day:'2026-11-22',stars:1,goals:2});assert.equal(d3.dailyStars,1);assert.equal(d3.dailyFirst,true);assert.equal(d3.save.dailyBest,3);}
 for(const w of C.GOAL_WHYS)assert.ok(S.WHY_LINE[w].length>20);assert.ok(S.HOLDTHELINE_TIPS.length>=8);assert.match(S.HOLDTHELINE_TIPS[1].line,/moment the ball is played/);
 assert.match(S.nearMissLine({daily:false,won:false,stars:0,goals:3,limit:2,league:0,match:3,promoted:false,opened:-1,cleanRun:0,book:0}),/Keep it to 2 or fewer/);assert.match(S.nearMissLine({daily:true,won:true,stars:2,goals:1,limit:2,league:0,match:0,promoted:false,opened:-1,cleanRun:0,book:0}),/come back tomorrow for a new pattern/);
 assert.match(S.coachLine({...stats,goals:1,lastWhy:'late'},true),/judged when the ball is kicked/);assert.match(S.coachLine(stats,true),/clean sheet/i);});

ok('wiring: playable by /arcade?game=holdtheline, its own board, coins, analytics key, device save; no machine in the room yet',()=>{
 const cat=read('lib/arcade/arcadeCatalog.ts'),room=read('components/ArcadeRoom.tsx'),K=require('../lib/arcade/arcadeCatalog.ts');
 {const c=K.arcadeCabinets.find(c=>c.id==='holdtheline');assert.ok(c&&c.name==='Hold the Line'&&c.x===12.85&&c.z===5.2&&Math.abs(c.yaw+Math.PI/3)<1e-9,'on the east wall, toward the vending machine');}assert.ok(!K.ARCADE_ROW.includes('holdtheline')&&K.ARCADE_WALL_IDS.includes('holdtheline'));assert.equal(K.arcadeCabinets.length,13);
 assert.equal(K.arcadeAnalyticsId('holdtheline'),'holdtheline');assert.match(cat,/\{id:'holdtheline',name:'Hold the Line',short:'HOLD THE LINE'/);
 assert.match(room,/const HoldTheLine=dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/games\/HoldTheLineGame'\)\)/);assert.match(room,/holdtheline:\(\)=>import\('\.\/games\/HoldTheLineGame'\)/);assert.match(room,/arcadeUnplaced\.some\(c=>c\.id===id\)/);assert.match(room,/game==='holdtheline'\?<HoldTheLine onExit=\{back\}\/>/);
 const L=require('../lib/arcade/leaderboard.ts');assert.ok(L.BOARD_GAMES.includes('holdtheline'));assert.equal(L.BOARD_RULES.holdtheline.max,HL.scoreMax);assert.ok(L.HALL_MACHINES.includes('holdtheline'),'in the Hall since it has a machine (Nov 21 2026)');
 {const r=L.BOARD_RULES.holdtheline;let best=0;for(const league of [0,1])for(const m of [0,4,9])for(const seed of [11,12,13]){const o=B.play(seed,'ideal',{league,match:m});best=Math.max(best,o.score/o.secs);assert.ok(o.score<=r.base+r.perSecond*o.secs,'a perfect match fits the board\'s ceiling');assert.ok(o.secs>r.minSeconds);}assert.ok(best<r.perSecond,`the board's rate limit is above the best bot (${best.toFixed(0)} a second)`);}
 const W=require('../lib/arcade/arcadeWalletCore.ts');assert.equal(W.arcadeCoinTarget('holdtheline',{points:2600}),6);assert.equal(W.arcadeCoinTarget('holdtheline',{points:8000}),12,'capped like the other machines');assert.equal(C.holdthelineCoins(2600),6);
 assert.match(read('lib/analytics/islandIds.ts'),/'keepyuppy','holdtheline'(,'flickit')?\] as const/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_holdtheline','Arcade: Hold the Line'\]/);assert.match(read('lib/analytics/countIds.ts'),/'keepyuppy','holdtheline'(,'flickit')?\] as const/);
 assert.match(read('lib/saves/snapshot.ts'),/'fi2-holdtheline-v1'/);assert.match(read('lib/arcade/lastScore.ts'),/holdtheline_daily:\{game:'holdtheline',label:'Match of the Day',today:true\}/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'keepyuppy','holdtheline',('flickit',)?'runner'/);assert.match(read('components/games/skins/index.ts'),/holdtheline:holdtheline\.skin/);assert.match(read('scripts/check-arcade-load.cjs'),/'keepyuppy','holdtheline'/);
 const sql=read('docs/arcade-aaa/new-games-nov21-supabase.sql')/* Nov 21 2026: the one owner paste file for the two released games */;assert.match(sql,/'ballblaster', 'keepyuppy', 'holdtheline'\)\);/);assert.match(sql,/'arcade_ballblaster','arcade_keepyuppy','arcade_holdtheline',/);assert.match(sql,/OK, Keepy-Uppy Beat and Hold the Line installed/);assert.doesNotMatch(sql,/safe_?hands/i);assert.match(sql,/drop constraint if exists arcade_scores_game_check/);assert.doesNotMatch(sql,/drop table|delete from|truncate/i);
 for(const g of L.BOARD_GAMES.filter(g=>g!=='flickit'/* Nov 21 2026: Flick It's board and key come in docs/arcade-aaa/flickit-supabase.sql (tests/flickit-core.cjs) */))assert.ok(sql.includes(`'${g}'`),`the owner SQL keeps board ${g}`);for(const g of require('../lib/analytics/islandIds.ts').ARCADE_GAMES.filter(g=>g!=='flickit'))assert.ok(sql.includes(`'arcade_${g}'`),`the owner SQL keeps analytics key arcade_${g}`);
 assert.match(read('supabase/migrations/20261209_holdtheline_boards.sql'),/ 'keepyuppy', 'holdtheline'\)\);/);assert.match(read('supabase/migrations/20261210_analytics_holdtheline.sql'),/'arcade_keepyuppy','arcade_holdtheline'/);/* Nov 21 2026: renumbered from 20261207/20261208 (Keepy-Uppy Beat has those dates) */});

ok('the shell: one thumb, kid-safe come-back hooks, buttons in the UI sans, the loop sleeps off the pitch',()=>{
 const t=read('components/games/HoldTheLineGame.tsx'),css=read('components/games/HoldTheLineGame.module.css'),v=read('lib/arcade/holdtheline/view.ts');
 assert.match(t,/data-game="holdtheline" data-arcade-kind="holdtheline"/);assert.match(t,/useArcadeEntry\('holdtheline'\)/);assert.match(t,/<ArcadeTopBar game="holdtheline"[^>]*backTitle="Back to arcade"/);assert.match(t,/<ComicMedalTrack score=\{result\.score\}/);assert.match(t,/<ArcadePauseCard game="holdtheline"/);
 assert.match(t,/holdthelineDailySeed\(day\)/);assert.match(t,/data-holdtheline-shelf/);assert.match(t,/data-holdtheline-map/);assert.match(t,/data-holdtheline-near/);assert.match(t,/data-holdtheline-run/);assert.match(t,/else if\(s\.phase==='tip'\)return;\/\/ the team card is up: the loop sleeps/);
 assert.match(t,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/);assert.match(t,/document\.addEventListener\('visibilitychange',hidden\)/);assert.match(t,/frameMs\.current=1000\/\(mobile\?30:60\)/);
 assert.match(t,/if\(aid>=1\)stopUntil\.current=performance\.now\(\)\+\(aid>=2\?950:650\);/,'the decision moment: one brief hold with the offside line drawn, early matches only');
 assert.ok(t.includes("if(guideRef.current==='step'){v.render(g,now/1000,aidOf());return;}"),'the guided first step: the world holds on the wind-up until the child drags up');
 assert.match(t,/beanLookFor\(c\.loadCustomization\(p\.completed,p\.total\)\)/,'the back line is the player’s own island bean');
 assert.match(t,/\/\^\(Digit\|Numpad\)\[1-4\]\$\/\.test\(e\.code\)/,'1-4 press that defender');assert.match(t,/KeyW:'up'/);assert.match(t,/KeyA:'left'/);
 assert.doesNotMatch(t,/setInterval|Notification|streak\.day|liveStreak/);assert.doesNotMatch(css,/IslandBrush/);assert.doesNotMatch(css,/blur\(|backdrop-filter|linear-gradient\(/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(v,/getContext\('2d',\{alpha:false\}\)/);assert.match(v,/dpr=Math\.min\(2,Math\.max\(1,ratio\)\)/);assert.doesNotMatch(v,/requestAnimationFrame|setTimeout|setInterval|createLinearGradient|createRadialGradient|shadowBlur|filter\s*=/);
 assert.match(v,/INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8'/,'the comic kit’s hex values');assert.match(v,/'OFFSIDE LINE'/,'the offside line is drawn across the pitch and named');});

ok('sound: every voice -> master -> ONE limiter -> destination; nothing before a gesture; no loops',()=>{
 const a=read('lib/arcade/holdtheline/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);assert.match(read('components/games/HoldTheLineGame.tsx'),/\(audio\.current\?\?=createHoldthelineAudio\(\)\)\.unlock\(\)/);
 assert.match(read('scripts/check-arcade-audio.cjs'),/game==='holdtheline'/);});

if(require.main===module)console.log(`holdtheline-core: ${n} checks ok`);
module.exports={ok,read,C,S,B,run,first};
