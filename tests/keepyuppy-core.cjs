// Keepy-Uppy Beat (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md): the juggling rhythm game. Chart validity (every ball can be
// played with two thumbs, either foot, every daily twist), the timing windows, scoring, balls, tricks, lessons, the tap-timing check,
// the Track of the Day, the music's event times, the song clock, the device save, the wiring and the sound. Difficulty and fairness:
// tests/keepyuppy-bots.cjs.
//   node tests/keepyuppy-core.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/keepyuppy/core.ts'),S=require('../lib/arcade/keepyuppy/save.ts'),M=require('../lib/arcade/keepyuppy/music.ts'),{TRACKS}=require('../lib/arcade/keepyuppy/charts.ts'),B=require('./keepyuppy-bots.cjs'),{KU}=C;
const read=p=>fs.readFileSync(p,'utf8');let n=0;const ok=(name,fn)=>{fn();n++;};
const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e,`${a} is not ${b}`);
/** a game on track `i`; `hit(g,k,d)` presses note k's pad d seconds off the beat */
const game=(i=0,o={})=>C.createKeepy({track:i,strong:'R',...o}),hit=(g,k,d=0)=>{const nn=g.chart.notes[k];g.advance(nn.t+d-.001);return g.press(nn.lane,nn.t+d);};
const events=g=>{const ev=[];g.drain(e=>ev.push(e));return ev;};

ok('chart text: bars of 4 / 8 / 16 slots, feet written as strong and weak, tricks, and loud errors for typos',()=>{
 const p=C.parseChart('S.W. T...H... [TST]..A.. N=====.. S.......W.......');assert.equal(p.bars,5);assert.deepEqual(p.notes.map(x=>x.beat),[0,2,4,6,8,8.5,9,10.5,12,16,18]);
 assert.deepEqual(p.notes.slice(4,7).map(x=>x.trick),['tft','tft','tft']);assert.equal(p.notes[7].kind,'swipe');assert.equal(p.notes[7].trick,'atw');assert.equal(p.notes[8].kind,'hold');assert.equal(p.notes[8].len,3);
 assert.notEqual(p.notes[4].group,0);assert.equal(p.notes[4].group,p.notes[6].group);assert.notEqual(p.notes[7].group,p.notes[8].group);
 for(const bad of ['S..','S...Q...','[TS]......','[TST......','=.......','[TNT].....'])assert.throws(()=>C.parseChart(bad),undefined,bad);
 assert.equal(C.laneOf('S','R'),3);assert.equal(C.laneOf('W','R'),0);assert.equal(C.laneOf('S','L'),0);assert.equal(C.laneOf('W','L'),3);assert.equal(C.laneOf('T','L'),1);assert.equal(C.laneOf('H','R'),2);});

ok('six tracks, slow to fast, 45-75 s each; every chart is playable with two thumbs for both feet; weak-foot sections are weak-foot only',()=>{
 assert.equal(TRACKS.length,6);assert.deepEqual(TRACKS.map(t=>t.bpm),[80,92,104,116,128,140]);assert.equal(new Set(TRACKS.map(t=>t.id)).size,6);assert.equal(KU.unlock.length,TRACKS.length);
 TRACKS.forEach((tr,i)=>{for(const f of ['L','R']){const c=C.buildChart(tr.chart,tr.bpm,f);assert.deepEqual(C.chartProblems(c),[],`${tr.id} ${f}`);
   const secs=c.end;assert.ok(secs>=45&&secs<=75,`${tr.id} lasts ${secs.toFixed(0)} s`);near(c.start,-240/tr.bpm);
   for(let k=1;k<c.notes.length;k++)assert.ok(c.notes[k].t>c.notes[k-1].t+KU.minGap-1e-6,'one ball: one touch at a time, in order');
   const [w0,w1]=tr.weak,sec=c.notes.filter(x=>x.beat>=(w0-1)*4&&x.beat<w1*4&&(x.part==='S'||x.part==='W'));assert.ok(sec.length>=6&&sec.every(x=>x.part==='W'),`${tr.id}: bars ${w0}-${w1} are weak foot only`);
   assert.ok(c.weakTotal>=10,'every track asks for the weak foot');assert.ok(c.notes.filter(x=>x.part==='W').every(x=>x.lane===(f==='R'?0:3)),'the weak foot is the other foot');}
  if(i)assert.ok(C.buildChart(tr.chart,tr.bpm,'R').notes.length/(60*4*C.parseChart(tr.chart).bars/tr.bpm)>=C.buildChart(TRACKS[i-1].chart,TRACKS[i-1].bpm,'R').notes.length/(60*4*C.parseChart(TRACKS[i-1].chart).bars/TRACKS[i-1].bpm)-.25,'touches per second do not fall back');
  assert.ok(tr.tip.line.length>30&&tr.venue.length>5);for(const k of ['kick','clap','shaker','bass','motif'])assert.equal(tr.music[k].length%16,0,`${tr.id} ${k} is whole bars`);});
 assert.deepEqual(TRACKS.map(t=>C.buildChart(t.chart,t.bpm,'R').tricks),[[],['tft'],['seal','stall'],['tft','atw'],['seal','stall','heel','cross'],['tft','seal','stall','atw','heel','cross']],'tricks arrive one or two at a time');
 for(const id of C.TRICK_IDS)for(const fast of [false,true])for(const f of ['L','R']){const c=C.buildChart(C.lessonSource(id,fast),100,f);assert.deepEqual(C.chartProblems(c),[],`lesson ${id}`);assert.deepEqual(c.tricks,[id]);assert.ok(c.end-c.start<=12.5,'a lesson is about ten seconds');}
 assert.deepEqual(C.chartProblems(C.buildChart('SW...... S.......',140,'R')),[]);assert.match(C.chartProblems(C.buildChart('ST......',140,'L'))[0],/same thumb/);assert.match(C.chartProblems(C.buildChart('SS......',104,'R'))[0],/same pad/);
 assert.match(C.chartProblems(C.buildChart('AW......',140,'R')).join(),/swipe/);assert.match(C.chartProblems(C.buildChart('S... .... S...',80,'R'))[0],/no touch/);});

ok('timing windows: Sweet 55 ms, Good 110 ms, Early / Late 170 ms either side of the beat; later than that the ball is dropped',()=>{
 assert.deepEqual([KU.sweet,KU.good,KU.ok],[.055,.11,.17]);
 for(const [d,want] of [[0,'sweet'],[.05,'sweet'],[-.05,'sweet'],[.08,'good'],[-.1,'good'],[.14,'late'],[-.15,'early']]){const g=game();assert.equal(hit(g,0,d),want,`${d}`);assert.equal(g.chart.notes[0].grade,want);}
 {const g=game();assert.equal(hit(g,0,-.25),'','too early: the tap is not a touch, and costs nothing');assert.equal(g.state.stray,1);assert.equal(g.chart.notes[0].st,0);assert.equal(hit(g,0,.01),'sweet','and the ball can still be played');}
 {const g=game();g.advance(g.chart.notes[0].t+.171);const ev=events(g);assert.equal(ev[0].type,'drop');assert.equal(g.state.lives,TRACKS[0].balls-1);assert.equal(g.chart.notes[0].grade,'drop');assert.equal(g.press(g.chart.notes[0].lane,g.chart.notes[0].t+.18),'');}
 {const g=game(),n0=g.chart.notes[0];g.advance(n0.t-.01);assert.equal(g.press((n0.lane+1)%4,n0.t),'wrong','the other pad: the ball stays up but the touch is wasted');assert.equal(g.state.lives,TRACKS[0].balls);assert.equal(g.state.combo,0);}
 {const g=game(5),N=g.chart.notes,k=N.findIndex((x,i)=>i>0&&x.t-N[i-1].t<.22&&x.lane!==N[i-1].lane);assert.ok(k>0);for(let i=0;i<k-1;i++)hit(g,i);/* note k-1 is left; note k's pad is pressed on its beat */assert.equal(hit(g,k),'sweet');assert.equal(N[k-1].grade,'drop','the ball before it was dropped');}});

ok('scoring: 100 / 60 / 20 a touch, the combo adds 10% every ten clean touches (to x2), tricks add 150, a clean finish adds 300 a star',()=>{
 const g=game();hit(g,0);hit(g,1,.08);hit(g,2,.15);assert.equal(g.state.score,180);assert.equal(g.state.combo,0);assert.equal(g.state.bestCombo,2);
 for(let i=3;i<13;i++)hit(g,i);assert.equal(g.state.combo,10);near(g.mult(),1.1);hit(g,13);assert.equal(g.state.score,180+1000+110);
 const ev=events(g);assert.ok(ev.some(e=>e.type==='combo'&&e.a===10));
 const p=B.play(0,'perfect');assert.equal(p.events.at(-1).type,'over');assert.equal(p.events.at(-1).points,900);assert.ok(p.score<=KU.scoreMax);assert.ok(B.play(5,'perfect').score<=KU.scoreMax*.75,'room under the board cap');
 assert.equal(C.medalFor(3999),0);assert.equal(C.medalFor(4000),1);assert.equal(C.medalFor(20000),3);assert.ok(B.play(0,'perfect').score>=KU.medals[0],'bronze can be won on track 1');assert.ok(B.play(5,'perfect').score>=KU.medals[2]);
 assert.equal(C.keepyCoins(0),0);assert.equal(C.keepyCoins(4100),2);assert.equal(C.keepyCoins(99999),12);});

ok('balls: a drop loses the combo and one ball, eight touches that stay up win one back, no balls left ends the run early',()=>{
 assert.deepEqual(TRACKS.map(t=>t.balls),[5,5,5,3,3,3]);
 const g=game(3),N=g.chart.notes;g.advance(N[0].t+.2);assert.equal(g.state.lives,2);for(let i=1;i<=8;i++)hit(g,i,i%2?.14:0);assert.equal(g.state.lives,3,'Early and Late touches still count toward winning a ball back');assert.equal(g.state.regained,1);
 for(let i=9;i<=16;i++)hit(g,i);assert.equal(g.state.lives,3,'never more than the track gives');
 const h=game(3);h.advance(h.chart.notes[2].t+.2);const ev=events(h);assert.equal(h.state.over,true);assert.equal(h.state.out,true);assert.equal(ev.at(-1).type,'over');assert.equal(ev.at(-1).a,0);assert.equal(h.stars(),0);assert.equal(h.weakScore(),-1);assert.equal(h.press(0,9),'');
 assert.deepEqual(KU.stars,[.4,.7,.88]);});

ok('tricks: a stall is held, a swipe is swiped, a tap trick is three clean taps; each landing counts for the Trick Book',()=>{
 const upTo=(g,k)=>{for(let i=0;i<k;i++){const x=g.chart.notes[i];g.advance(x.t-.001);g.press(x.lane,x.t);if(x.kind==='swipe')g.swipe(x.lane,x.dir,x.t+.05);if(x.kind==='hold'){g.advance(x.tEnd);}}g.drain(()=>{});};
 {const g=game(2),k=g.chart.notes.findIndex(x=>x.kind==='hold'),x=g.chart.notes[k];upTo(g,k);assert.equal(hit(g,k),'held');assert.equal(x.st,1);g.advance(x.tEnd-.5);assert.equal(x.st,1);g.advance(x.tEnd);assert.equal(x.grade,'sweet');assert.equal(g.state.tricks.stall,1);assert.ok(events(g).some(e=>e.type==='trick'&&C.TRICK_IDS[e.a]==='stall'&&e.points>=150));}
 {const g=game(2),k=g.chart.notes.findIndex(x=>x.kind==='hold'),x=g.chart.notes[k];upTo(g,k);hit(g,k);assert.equal(g.release(x.lane,x.t+.4),true);assert.equal(x.grade,'slip','let go too soon');assert.equal(g.state.tricks.stall,undefined);assert.equal(g.state.lives,TRACKS[2].balls,'a slip keeps the ball');}
 {const g=game(2),k=g.chart.notes.findIndex(x=>x.kind==='hold'),x=g.chart.notes[k];upTo(g,k);hit(g,k);assert.equal(g.release(x.lane,x.tEnd-.15),true);assert.equal(x.grade,'sweet','letting go just before the end is fine');}
 {const g=game(3),k=g.chart.notes.findIndex(x=>x.trick==='atw'),x=g.chart.notes[k];upTo(g,k);assert.equal(hit(g,k),'held');assert.equal(g.swipe(x.lane,'side',x.t+.1),true);assert.equal(x.grade,'sweet','Around the World: any swipe');assert.equal(g.state.tricks.atw,1);}
 {const g=game(4),k=g.chart.notes.findIndex(x=>x.trick==='heel'),x=g.chart.notes[k];upTo(g,k);hit(g,k);g.swipe(x.lane,'side',x.t+.1);assert.equal(x.grade,'slip','a Heel Flick is a swipe UP');}
 {const g=game(4),k=g.chart.notes.findIndex(x=>x.trick==='cross'),x=g.chart.notes[k];upTo(g,k);hit(g,k);g.swipe(x.lane,'any',x.t+.1);assert.equal(x.grade,'sweet','the keyboard swipe does every swipe');}
 {const g=game(4),k=g.chart.notes.findIndex(x=>x.trick==='heel'),x=g.chart.notes[k];upTo(g,k);hit(g,k);g.advance(x.t+KU.swipeWait+.01);assert.equal(x.grade,'slip','a tap is not a swipe');}
 {const g=game(1),k=g.chart.notes.findIndex(x=>x.trick==='tft');upTo(g,k);hit(g,k);hit(g,k+1,.09);assert.equal(g.state.tricks.tft,undefined);hit(g,k+2);assert.equal(g.state.tricks.tft,1);
  const h=game(1);upTo(h,k);hit(h,k);hit(h,k+1,.15);hit(h,k+2);assert.equal(h.state.tricks.tft,undefined,'a Late touch in the middle: not landed');}
 assert.equal(C.TRICKS.length,6);assert.deepEqual(C.TRICK_IDS,['tft','seal','stall','atw','heel','cross']);for(const t of C.TRICKS)assert.ok(t.how.length>30&&t.fact.length>30&&/^#[0-9a-f]{6}$/.test(t.color));});

ok('lessons and the tap-timing check: nothing to lose, no score; eight taps give the offset',()=>{
 const l=C.createKeepy({track:3,strong:'R',lesson:'atw'});assert.equal(l.mode,'lesson');assert.equal(l.chart.bpm,100);l.advance(l.chart.end);assert.equal(l.state.out,false);assert.equal(l.state.score,0);assert.equal(l.state.lives,3);assert.equal(l.stars(),0);assert.deepEqual(l.feats(false),[]);
 assert.equal(C.createKeepy({track:0,strong:'R',lesson:'tft'}).chart.bpm,80,'a lesson is never faster than its track');
 const c=C.createKeepy({strong:'L',calib:true});assert.equal(c.chart.notes.length,KU.calibTaps);for(const x of c.chart.notes){c.advance(x.t);c.press((x.i%4),x.t+.062+(x.i%2?.004:-.004));}c.advance(c.chart.end);assert.equal(c.state.offsets.length,8,'any pad counts');assert.equal(C.calibOffset(c.state.offsets),62);
 assert.equal(C.calibOffset([.1,.1]),null);assert.equal(C.calibOffset([.9,.9,.5,.5,.5,.5,.5,.5]),200,'clamped');assert.equal(C.calibOffset([0,0,-.03,-.02,-.04,-.03,.2,-.03]),-30,'the median ignores one wild tap');});

ok('Track of the Day: the same track and twist for everyone that day, a fair chart, one of the first three tracks',()=>{
 assert.equal(C.keepyDailySeed('2026-11-21'),C.keepyDailySeed('2026-11-21'));assert.notEqual(C.keepyDailySeed('2026-11-21'),C.keepyDailySeed('2026-11-22'));
 assert.deepEqual(C.dailyPick(C.keepyDailySeed('2026-11-21')),C.dailyPick(C.keepyDailySeed('2026-11-21')));assert.ok(C.DAILY_POOL.length>=12);assert.ok(C.DAILY_POOL.every(p=>p.track<3),'the day\'s track is one of the first four');
 const seen=new Set(),tracks=new Set();for(let d=1;d<=28;d++){const p=C.dailyPick(C.keepyDailySeed(`2026-12-${String(d).padStart(2,'0')}`));seen.add(p.track+p.twist);tracks.add(p.track);assert.ok(C.DAILY_POOL.some(q=>q.track===p.track&&q.twist===p.twist));}assert.ok(seen.size>=6&&tracks.size>=3,'the days differ');
 for(const p of C.DAILY_POOL)for(const f of ['L','R'])assert.deepEqual(C.chartProblems(C.buildChart(TRACKS[p.track].chart,TRACKS[p.track].bpm,f,p.twist)),[]);
 const w=C.buildChart(TRACKS[0].chart,80,'R','weak');assert.ok(w.notes.every(x=>x.part!=='S'));assert.ok(C.buildChart(TRACKS[1].chart,92,'R','nothigh').notes.every(x=>x.part!=='T'&&x.trick!=='tft'));assert.ok(C.buildChart(TRACKS[0].chart,80,'R','low').notes.every(x=>x.part!=='H'));
 const s=C.buildChart(TRACKS[1].chart,92,'R','speedup'),b=C.buildChart(TRACKS[1].chart,92,'R');assert.equal(s.bpm2,103);assert.ok(s.end<b.end);near(C.timeOfBeat(s,s.speedAt+4)-C.timeOfBeat(s,s.speedAt),240/103);near(C.beatAtTime(s,C.timeOfBeat(s,70.5)),70.5);near(C.beatAtTime(b,C.timeOfBeat(b,-3)),-3);
 assert.equal(C.TWISTS.length,5);assert.equal(C.KU_FEAT_IDS.length,13);assert.equal(new Set(C.KU_FEAT_IDS).size,13);});

ok('music: every event sits exactly on its sixteenth at every tempo; the count-in is four clicks; lessons are drums only',()=>{
 for(const tr of TRACKS){const c=C.buildChart(tr.chart,tr.bpm,'R'),all=M.musicEvents(tr.music,-4,c.bars*4+1,c.bars);
  for(const e of all){assert.ok(Number.isInteger(e.beat*4),'on the sixteenth grid');near(C.timeOfBeat(c,e.beat),e.beat*60/tr.bpm);}
  assert.deepEqual(all.filter(e=>e.beat<0).map(e=>[e.beat,e.voice]),[[-4,'click'],[-3,'click'],[-2,'click'],[-1,'click']]);
  const kicks=all.filter(e=>e.voice==='kick');assert.ok(kicks.length>=c.bars*2);assert.ok(kicks.some(e=>e.beat===0),'the kick marks the first beat');for(let b=0;b<c.bars;b++)assert.ok(kicks.some(e=>e.beat===b*4),'a kick on every bar line');
  assert.equal(all.at(-1).voice,'crash');assert.equal(all.at(-1).beat,c.bars*4);for(const v of ['clap','shaker','bass','lead'])assert.ok(all.some(e=>e.voice===v),`${tr.id} has a ${v} part`);
  for(const e of all.filter(x=>x.voice==='bass'||x.voice==='lead'))assert.ok(e.v>=28&&e.v<=96,'notes in a sane range');
  // scheduling in chunks (as the look-ahead does) gives the same events, none twice, none lost
  const chunks=[];for(let b=-4;b<c.bars*4+1;b+=.37)chunks.push(...M.musicEvents(tr.music,b,Math.min(c.bars*4+1,b+.37),c.bars));assert.deepEqual(chunks,all);
  assert.ok(M.musicEvents(tr.music,0,16,4,'drums').every(e=>e.voice==='kick'||e.voice==='clap'));assert.deepEqual(M.musicEvents(tr.music,0,4,2,'click').map(e=>e.beat),[0,1,2,3]);}
 const fast=C.buildChart(TRACKS[1].chart,92,'R','speedup'),e=M.musicEvents(TRACKS[1].music,fast.speedAt,fast.speedAt+1,fast.bars);near(C.timeOfBeat(fast,e.at(-1).beat)-C.timeOfBeat(fast,e[0].beat),(e.at(-1).beat-e[0].beat)*60/103,1e-9);
 assert.equal(new Set(TRACKS.map(t=>t.music.motif)).size,6,'six tunes of their own');});

ok('the song clock: follows the audio clock when there is one, runs alone when sound is off, holds still on pause',()=>{
 let p=10,a=null;const k=M.createSongClock(()=>p,()=>a);assert.equal(k.now(),0);k.start(-3);near(k.now(),-3);p=11;near(k.now(),-2);near(k.at(10.5),-2.5,1e-9);
 a=-1.95;near(k.now(),-1.95,1e-9);p=12;a=-.95;near(k.now(),-.95,1e-9);a=-.945;near(k.now(),-.95,1e-9);/* under 12 ms: the smooth clock is kept */
 k.pause();p=20;near(k.now(),-.95,1e-9);assert.equal(k.running,false);a=null;k.resume();p=21;near(k.now(),.05,1e-9);});

ok('the device save: missing, corrupt and hostile data all load; stars open tracks; weak-foot bests and the Trick Book grow',()=>{
 const E=S.emptyKeepySave();assert.deepEqual(S.sanitizeKeepySave(null),E);assert.deepEqual(S.sanitizeKeepySave('x'),E);assert.deepEqual(S.sanitizeKeepySave([1,2]),E);assert.deepEqual(S.sanitizeKeepySave({v:9,tracks:5,tricks:'a',seen:{},feats:7,daily:[]}).tracks,{});
 const bad=S.sanitizeKeepySave({strong:'X',offset:1e9,best:-5,medal:99,tracks:{park:{stars:9,best:1e12,acc:500,weak:NaN,plays:-1},nope:{stars:3}},tricks:{atw:1e9,evil:3,stall:-2},seen:['atw','x'],feats:['full','zzz'],daily:{day:'tomorrow',stars:7}});
 assert.equal(bad.strong,'');assert.equal(bad.offset,200);assert.equal(bad.best,0);assert.equal(bad.medal,3);assert.deepEqual(bad.tracks,{park:{stars:3,best:KU.scoreMax,acc:100,weak:-1,plays:0}});assert.deepEqual(bad.tricks,{atw:999});assert.deepEqual(bad.seen,['atw']);assert.deepEqual(bad.feats,['full']);assert.equal(bad.daily.day,'');assert.equal(bad.daily.stars,3);
 assert.deepEqual(S.sanitizeKeepySave(JSON.parse(JSON.stringify(E))),E);
 const run=(o={})=>({track:0,daily:false,day:'2026-11-21',score:5000,stars:2,acc:80,weak:60,out:false,tricks:{},feats:['first'],lessons:[],...o});
 let r=S.settleKeepy(E,run());assert.equal(r.save.tracks.park.stars,2);assert.equal(r.starsGained,2);assert.equal(r.opened,1,'one star opens track 2');assert.equal(r.newBest,true);assert.equal(r.medal,1);assert.equal(r.newMedal,true);assert.deepEqual(r.newFeats,['first']);assert.equal(r.weakUp,false);assert.equal(r.save.plays,1);
 assert.equal(S.trackOpen(r.save,1),true);assert.equal(S.trackOpen(r.save,2),false);assert.equal(S.totalStars(r.save),2);
 let r2=S.settleKeepy(r.save,run({score:4000,stars:1,acc:70,weak:75}));assert.equal(r2.save.tracks.park.stars,2,'stars are never lost');assert.equal(r2.save.tracks.park.best,5000);assert.equal(r2.weakUp,true);assert.equal(r2.weakBefore,60);assert.equal(r2.save.tracks.park.weak,75);assert.equal(r2.newBest,false);assert.deepEqual(r2.newFeats,[]);
 let r3=S.settleKeepy(r2.save,run({out:true,stars:0,acc:20,weak:-1,score:900}));assert.equal(r3.save.tracks.park.weak,75);assert.equal(r3.save.tracks.park.plays,3);
 let r4=S.settleKeepy(r3.save,run({track:3,tricks:{atw:3,tft:5},lessons:['atw','tft']}));assert.deepEqual(r4.newCards,['tft']);assert.equal(r4.save.tricks.atw,3);assert.deepEqual(r4.save.seen,['tft','atw']);assert.equal(S.cardsFull(r4.save),1);r4=S.settleKeepy(r4.save,run({track:3,tricks:{atw:2}}));assert.deepEqual(r4.newCards,['atw']);
 const d=S.settleKeepy(r4.save,run({daily:true,track:2,stars:3,score:9000,feats:['daily3']}));assert.equal(d.dailyFirst,true);assert.equal(d.save.daily.stars,3);assert.equal(d.save.tracks.beach,undefined,'the twisted track does not give career stars');assert.deepEqual(d.newFeats,['daily3']);assert.equal(d.save.best,r4.save.best);
 const d2=S.settleKeepy(d.save,run({daily:true,track:2,stars:1,score:100}));assert.equal(d2.dailyFirst,false);assert.equal(d2.save.daily.stars,3);assert.equal(d2.save.daily.runs,2);const d3=S.settleKeepy(d2.save,run({daily:true,day:'2026-11-22',track:1,stars:1,score:100}));assert.equal(d3.save.daily.stars,1);assert.equal(d3.dailyFirst,true);
 {let s=E;for(let i=0;i<6;i++)s=S.settleKeepy(s,run({track:i,stars:3})).save;assert.equal(S.totalStars(s),18);assert.ok(s.feats.includes('stars9')&&s.feats.includes('stars18'));const tr={};for(const id of C.TRICK_IDS)tr[id]=5;assert.ok(S.settleKeepy(s,run({tricks:tr})).newFeats.includes('book'));}
 assert.deepEqual(KU.unlock,[0,1,3,5,8,11]);assert.ok(S.KEEPY_TIPS.length>=8);
 assert.match(S.nearMissLine({daily:false,out:false,stars:1,acc:62,track:0,opened:-1,starsTotal:1,weak:50,weakBefore:-1,newBest:true,score:3000,best:0,medalBefore:0}),/8 more points of accuracy for 2 stars/);
 assert.match(S.nearMissLine({daily:false,out:false,stars:2,acc:80,track:0,opened:1,starsTotal:2,weak:50,weakBefore:-1,newBest:true,score:3000,best:0,medalBefore:0}),/New track open: Schoolyard Shuffle/);
 assert.match(S.nearMissLine({daily:true,out:false,stars:2,acc:80,track:0,opened:-1,starsTotal:2,weak:50,weakBefore:-1,newBest:true,score:3000,best:0,medalBefore:0}),/tomorrow/);
 const z={sweet:0,good:0,early:0,late:0,wrong:0,slip:0,drop:0};assert.match(S.coachLine({...z,sweet:9},false),/clean/);assert.match(S.coachLine({...z,early:5,late:1},false),/early/);assert.match(S.coachLine({...z,late:5},false),/late/);assert.match(S.coachLine({...z,wrong:4},false),/which pad/);assert.match(S.coachLine({...z,drop:3},true),/No balls left/);});

ok('wiring: playable by /arcade?game=keepyuppy, its own board, coins, analytics key, device save; no machine in the room yet',()=>{
 const cat=read('lib/arcade/arcadeCatalog.ts'),room=read('components/ArcadeRoom.tsx'),K=require('../lib/arcade/arcadeCatalog.ts');
 assert.deepEqual(K.arcadeUnplaced.map(c=>c.id),['footgolf','flickit']/* Nov 21 2026: placed; Flick It waits there (tests/flickit-core.cjs) */);{const c=K.arcadeCabinets.find(c=>c.id==='keepyuppy');assert.ok(c&&c.x===11.75&&c.z===2.85&&Math.abs(c.yaw+Math.PI/3)<1e-9,'on the east wall, by the prize counter');}assert.ok(!K.ARCADE_ROW.includes('keepyuppy')&&K.ARCADE_WALL_IDS.includes('keepyuppy'),'a wall machine, not in the back row');
 assert.equal(K.arcadeAnalyticsId('keepyuppy'),'keepyuppy');assert.match(cat,/\{id:'keepyuppy',name:'Keepy-Uppy Beat',short:'KEEPY-UPPY',lesson:'Soft touches\. Both feet\. Find the rhythm\.'/);
 assert.match(room,/const KeepyUppy=dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/games\/KeepyUppyGame'\)\)/);assert.match(room,/keepyuppy:\(\)=>import\('\.\/games\/KeepyUppyGame'\)/);assert.match(room,/arcadeUnplaced\.some\(c=>c\.id===id\)/);assert.match(room,/game==='keepyuppy'\?<KeepyUppy onExit=\{back\}\/>/);
 const L=require('../lib/arcade/leaderboard.ts');assert.ok(L.BOARD_GAMES.includes('keepyuppy'));assert.equal(L.BOARD_RULES.keepyuppy.max,KU.scoreMax);assert.ok(L.HALL_MACHINES.includes('keepyuppy'),'in the Hall since it has a machine (Nov 21 2026)');
 {const r=L.BOARD_RULES.keepyuppy;for(let i=0;i<TRACKS.length;i++){const p=B.play(i,'perfect');assert.ok(p.score<r.base+r.perSecond*p.secs,`a perfect ${TRACKS[i].id} fits the board's rate limit`);assert.ok(p.secs>r.minSeconds);}}
 const W=require('../lib/arcade/arcadeWalletCore.ts');assert.equal(W.arcadeCoinTarget('keepyuppy',{points:4100}),2);assert.equal(W.arcadeCoinTarget('keepyuppy',{points:39000}),12,'capped like the other machines');assert.equal(C.keepyCoins(4100),2);
 assert.match(read('lib/analytics/islandIds.ts'),/'ballblaster','keepyuppy','holdtheline'(,'footgolf')?(,'flickit')?\] as const/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_keepyuppy','Arcade: Keepy-Uppy Beat'\]/);assert.match(read('lib/analytics/countIds.ts'),/'ballblaster','keepyuppy','holdtheline'(,'footgolf')?(,'flickit')?\] as const/);
 assert.match(read('lib/saves/snapshot.ts'),/'fi2-keepyuppy-v1'/);assert.equal(S.KEEPYUPPY_KEY,'fi2-keepyuppy-v1');assert.match(read('lib/arcade/lastScore.ts'),/keepyuppy_daily:\{game:'keepyuppy',label:'Track of the Day',today:true\}/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'keepyuppy','holdtheline',('footgolf',)?('flickit',)?'runner'/);assert.match(read('components/games/skins/index.ts'),/keepyuppy:keepyuppy\.skin/);assert.match(read('scripts/check-arcade-load.cjs'),/'keepyuppy'/);
 const sql=read('docs/arcade-aaa/new-games-nov21-supabase.sql')/* Nov 21 2026: the one owner paste file for the two released games */;assert.match(sql,/'arcade_ballblaster','arcade_keepyuppy',/);assert.match(sql,/OK, Keepy-Uppy Beat and Hold the Line installed/);assert.doesNotMatch(sql,/safe_?hands/i);assert.match(sql,/drop constraint if exists arcade_scores_game_check/);assert.doesNotMatch(sql,/drop table|delete from|truncate/i);
 for(const g of L.BOARD_GAMES.filter(g=>g!=='footgolf'/* Nov 21 2026: FootGolf Island, built unplaced; its board and key come in docs/arcade-aaa/footgolf-supabase.sql (tests/footgolf-core.cjs) */).filter(g=>g!=='flickit'/* Nov 21 2026: Flick It's board and key come in docs/arcade-aaa/flickit-supabase.sql (tests/flickit-core.cjs) */))assert.ok(sql.includes(`'${g}'`),`the owner SQL keeps board ${g}`);assert.match(read('supabase/migrations/20261207_keepyuppy_boards.sql'),/ 'keepyuppy'\)\);/);assert.match(read('supabase/migrations/20261208_analytics_keepyuppy.sql'),/'arcade_keepyuppy'/);
 {const old=read('supabase/migrations/20261204_analytics_ballblaster.sql').split('\n').slice(3).join('\n'),now=read('supabase/migrations/20261208_analytics_keepyuppy.sql').split('\n').slice(3).join('\n');assert.equal(now,old.replace("'arcade_ballblaster',","'arcade_ballblaster','arcade_keepyuppy',").replace("prosrc like '%exhibit_throw-in%')","prosrc like '%exhibit_throw-in%' and prosrc like '%arcade_keepyuppy%')").replace("'OK, Ball Blaster activity installed' else 'NOT INSTALLED: analytics_ingest (arcade_ballblaster)'","'OK, Keepy-Uppy Beat activity installed' else 'NOT INSTALLED: analytics_ingest (arcade_keepyuppy)'"),'the ingest function is Ball Blaster\'s plus one key');}});

ok('the shell: four pads, kid-safe come-back hooks, buttons in the UI sans, the loop and the audio clock sleep off the pitch',()=>{
 const t=read('components/games/KeepyUppyGame.tsx'),css=read('components/games/KeepyUppyGame.module.css'),v=read('lib/arcade/keepyuppy/view.ts');
 assert.match(t,/data-game="keepyuppy" data-arcade-kind="keepyuppy"/);assert.match(t,/useArcadeEntry\('keepyuppy'\)/);assert.match(t,/<ArcadeTopBar game="keepyuppy"[^>]*backTitle="Back to arcade"/);assert.match(t,/<ComicMedalTrack score=\{result\.score\}/);assert.match(t,/data-hs-slot/);
 assert.match(t,/dailyPick\(keepyDailySeed\(day\)\)/);assert.match(t,/data-keepyuppy-shelf/);assert.match(t,/data-keepyuppy-book/);assert.match(t,/data-keepyuppy-near/);assert.match(t,/data-keepyuppy-weak=/);assert.match(t,/data-keepyuppy-foot="L"/);assert.match(t,/data-keepyuppy-card="calib"/);
 assert.match(t,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/);assert.match(t,/document\.addEventListener\('visibilitychange',hidden\)/);assert.match(t,/clock\.current\.pause\(\);audio\.current\?\.hush\(true\);change\('paused'\)/,'pause stops the song clock and suspends the AudioContext');
 assert.match(t,/frameMs\.current=1000\/\(reduced\.current\?30:60\)/,'60 draws a second for a rhythm game (30 with reduced motion); the cost is in the direction doc');
 assert.match(t,/g\.press\(lane,judgeTime\(e\.timeStamp\)\)/,'a tap is judged at its own event time, not at the next frame');assert.match(t,/clock\.current\.at\(ms\/1000\)-lat\.current-off\.current/);assert.match(t,/ptrs=useRef\(new Map</,'every pointer is its own touch (multi-touch safe)');
 assert.match(t,/audio\.current\?\.pump\(song\)/);assert.match(t,/audio\.current\?\.rest\(\)/);
 assert.match(t,/beanLookFor\(c\.loadCustomization\(p\.completed,p\.total\)\)/,'the juggler is the player’s own island bean');
 assert.doesNotMatch(t,/setInterval|Notification|streak|Math\.random/);assert.doesNotMatch(css,/IslandBrush/);assert.doesNotMatch(css,/blur\(|backdrop-filter|linear-gradient\(/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(v,/getContext\('2d',\{alpha:false\}\)/);assert.match(v,/dpr=Math\.min\(2,Math\.max\(1,ratio\)\)/);assert.doesNotMatch(v,/requestAnimationFrame|setTimeout|setInterval|createLinearGradient|createRadialGradient|shadowBlur|filter\s*=|Math\.random/);
 assert.match(v,/INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8'/,'the comic kit’s hex values');assert.match(v,/\.5\*G\*tau\*\(T-tau\)/,'the ball flies the real parabola: a longer gap is a higher ball');assert.match(v,/const TAU=Math\.PI\*2,G=9\.8,/);
 for(const f of ['core','charts','music','save'])assert.doesNotMatch(read(`lib/arcade/keepyuppy/${f}.ts`),/Math\.random|Date\.now|performance\.now|document\.|window\./,`${f}.ts is pure`);});

ok('sound: every voice -> master -> ONE limiter -> destination; scheduled on the audio clock; nothing before a gesture; no timers, no files',()=>{
 const a=read('lib/arcade/keepyuppy/audio.ts');assert.match(a,/bus\.connect\(master\);master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);assert.equal((a.match(/ctx\.destination/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true|new Audio|fetch\(|\.mp3|\.ogg|\.wav|decodeAudioData/);assert.match(a,/function unlock\(\)/);assert.match(a,/const t=song\.t0\+song\.timeOf\(e\.beat\);/,'each music event gets its exact AudioContext time');assert.match(a,/LOOK=\.25/);
 assert.match(a,/if\(typeof window==='undefined'\|\|!wanted\(\)\)return;/,'sound off: no AudioContext at all');assert.match(a,/void ctx\.suspend\(\)/);
 assert.match(read('components/games/KeepyUppyGame.tsx'),/\(audio\.current\?\?=createKeepyAudio\(\)\)\.unlock\(\)/);assert.match(read('scripts/check-arcade-audio.cjs'),/game==='keepyuppy'/);});

ok('verifier (Nov 21 2026): the guided first touches wait for each tap, once; a suspended sound pauses the run',()=>{
 for(const f of ['L','R']){const c=C.buildChart(C.GUIDE_SOURCE,C.GUIDE_BPM,f);assert.equal(c.notes.length,8);assert.deepEqual(C.chartProblems(c),[]);assert.deepEqual([...new Set(c.notes.map(x=>x.lane))].sort(),[0,1,2,3],'every pad');}
 const g=C.createKeepy({strong:'R',guide:true}),N=g.chart.notes;assert.equal(g.mode,'guide');
 g.advance(N[0].t+3);assert.equal(N[0].st,0,'the ball is never dropped: it waits');assert.equal(g.state.t,N[0].t);assert.equal(g.waiting(),N[0]);
 assert.equal(g.press((N[0].lane+1)%4,N[0].t+3),'','the other pad is only a knock');assert.equal(N[0].st,0);
 assert.equal(g.press(N[0].lane,N[0].t+3),'sweet');assert.equal(g.waiting(),undefined);assert.equal(g.state.score,0,'nothing to win or lose');
 for(let k=1;k<8;k++){g.advance(N[k].t+1);g.press(N[k].lane,N[k].t+1);}g.advance(g.chart.end+1);assert.ok(g.state.over&&!g.state.out);assert.equal(g.state.counts.sweet,8);
 assert.equal(S.sanitizeKeepySave({guided:true}).guided,true);assert.equal(S.sanitizeKeepySave({guided:'yes'}).guided,false);assert.equal(S.emptyKeepySave().guided,false);
 const sh=read('components/games/KeepyUppyGame.tsx');assert.match(sh,/if\(!solo&&!sv\.guided&&sv\.plays===0\)stages\.push\(\{kind:'guide'\}\)/,'shown once, on a first-ever run');assert.match(sh,/if\(audio\.current\?\.lost\)\{pauseRef\.current\(\);return;\}/);
 assert.match(read('lib/arcade/keepyuppy/audio.ts'),/get lost\(\)\{return !!song&&!!song\.live&&!!ctx&&ctx\.state!=='running'&&!quiet&&wanted\(\);\}/);});

if(require.main===module)console.log(`keepyuppy-core: ${n} checks ok`);
module.exports={ok,read,C,S};
