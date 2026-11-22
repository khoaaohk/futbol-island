// The three coach tools of Nov 22 2026, their pure logic (no browser):
//  1. Match timer (lib/site/tools/matchTimer.ts): periods, pause/resume by timestamps, added time, the last whistle, goals,
//     substitution reminders, the saved state read back.
//  2. Round-robin schedule (lib/site/tools/roundRobin.ts): every pair meets exactly once (twice when double), no team twice in a
//     time slot, never more games than fields, times add up, byes with an odd number of teams, the standings table.
//  3. Beep test (lib/site/tools/beepTest.ts): the standard 20 m table, the kids' levels, beat times and scores.
// usage: node tests/new-tools.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');
const load=rel=>{const file=path.join(root,rel),code=fs.readFileSync(file,'utf8');
 assert(!/^import /m.test(code),`${rel} is import-free`);
 assert(!/Math\.random|Date\.now|new Date|fetch\(|localStorage|window\./.test(code.replace(/\/\*[\s\S]*?\*\//g,'')),`${rel} is pure`);
 const out=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,m={};new Function('exports','require',out)(m,require);return m;};
const T=load('lib/site/tools/matchTimer.ts'),R=load('lib/site/tools/roundRobin.ts'),B=load('lib/site/tools/beepTest.ts');

// ---- 1. match timer --------------------------------------------------------------------------------------------------------
{const M=T.MIN;let c=T.newClock({periods:2,periodMin:25,breakMin:5,subEvery:5});
 assert.equal(c.phase,'ready');assert.equal(T.remaining(c,0),25*M);
 c=T.start(c,1000);assert.equal(c.phase,'running');assert.equal(T.elapsed(c,1000+10*M),10*M,'running clock = now - start');
 c=T.pause(c,1000+10*M);assert.equal(T.elapsed(c,1000+99*M),10*M,'paused clock does not move');
 c=T.start(c,2000*M);assert.equal(T.elapsed(c,2000*M+5*M),15*M,'resume keeps the banked time');
 c=T.addTime(c,2);assert.equal(T.periodLength(c),27*M,'added time');c=T.addTime(c,-5);assert.equal(T.periodLength(c),25*M,'added time never below zero');
 c=T.goal(c,0,2000*M+6*M);c=T.goal(c,1,2000*M+7*M);c=T.goal(c,1,2000*M+8*M);assert.deepEqual(c.goals,[1,2]);assert.equal(c.events.length,3);assert.equal(c.events[0].t,16);
 c=T.goal(c,1,0,-1);assert.deepEqual(c.goals,[1,1]);assert.equal(c.events.length,2);assert.deepEqual(T.goal(T.newClock(c.setup),0,0,-1).goals,[0,0],'never below zero');
 c=T.endPeriod(c,2000*M+25*M);assert.equal(c.phase,'break');assert.equal(c.period,0);
 c=T.start(c,3000*M);assert.equal(c.period,1,'the second half');assert.equal(T.elapsed(c,3000*M),0,'the new half starts at zero');
 c=T.endPeriod(c,3000*M+25*M);assert.equal(c.phase,'done','the last whistle ends the game');assert.equal(T.start(c,0),c,'a finished game does not restart');
 assert.deepEqual(T.subMarks({periods:2,periodMin:25,breakMin:5,subEvery:5}),[5,10,15,20]);assert.deepEqual(T.subMarks({periods:4,periodMin:10,breakMin:2,subEvery:0}),[]);
 assert.deepEqual(T.subMarks({periods:2,periodMin:30,breakMin:5,subEvery:7}),[7,14,21,28]);
 assert.equal(T.nextSub({periods:2,periodMin:25,breakMin:5,subEvery:5},5*M),10*M);assert.equal(T.nextSub({periods:2,periodMin:25,breakMin:5,subEvery:5},21*M),null);
 assert.deepEqual(T.crossed([5*M,10*M],4*M,10*M),[5*M,10*M]);assert.deepEqual(T.crossed([5*M],5*M,6*M),[],'a mark is beeped once');
 assert.equal(T.mmss(25*M),'25:00');assert.equal(T.mmss(61500),'1:02');assert.equal(T.mmss(-65000),'+1:05');
 for(const [p,w] of [[2,'half'],[4,'quarter'],[3,'third'],[1,'period']])assert.equal(T.periodWord(p),w);
 /* every period of a 4 x 10 game in order */
 let q=T.newClock({periods:4,periodMin:10,breakMin:2,subEvery:0}),seen=[];for(let i=0;i<4;i++){q=T.start(q,i*20*M);seen.push(q.period);q=T.endPeriod(q,i*20*M+10*M);}
 assert.deepEqual(seen,[0,1,2,3]);assert.equal(q.phase,'done');
 assert.equal(T.readClock(null),null);assert.equal(T.readClock({setup:{periods:2,periodMin:25},phase:'nope',goals:[],added:[]}),null);
 const back=T.readClock(JSON.parse(JSON.stringify(c)));assert.deepEqual(back.goals,[1,1]);assert.equal(back.phase,'done');
 assert.deepEqual(T.clampSetup({periods:9,periodMin:500,breakMin:-1,subEvery:99}),{periods:2,periodMin:60,breakMin:0,subEvery:30});}

// ---- 2. round robin --------------------------------------------------------------------------------------------------------
for(const n of [2,3,4,5,6,7,8,9,10,12,16])for(const fields of [1,2,3,4])for(const double of [false,true]){
 const names=Array.from({length:n},(_,i)=>`Team ${i+1}`),s=R.makeSchedule({teams:names,fields,matchMin:12,breakMin:3,startMin:540,double}),where=`${n} teams, ${fields} fields${double?', double':''}`;
 const pairs=new Map();for(const g of s.slots.flatMap(x=>x.games)){assert(g.a!==g.b,`${where}: no team plays itself`);const k=[g.a,g.b].sort((x,y)=>x-y).join('-');pairs.set(k,(pairs.get(k)??0)+1);}
 assert.equal(pairs.size,n*(n-1)/2,`${where}: every pair meets`);for(const [k,v] of pairs)assert.equal(v,double?2:1,`${where}: ${k} meets ${double?'twice':'once'}`);
 s.slots.forEach((sl,i)=>{const t=sl.games.flatMap(g=>[g.a,g.b]);assert.equal(new Set(t).size,t.length,`${where}: slot ${i} has no team twice`);
  assert(sl.games.length>=1&&sl.games.length<=fields,`${where}: slot ${i} fits the fields`);assert.deepEqual(sl.games.map(g=>g.field),sl.games.map((_,j)=>j+1),`${where}: fields 1..k`);
  assert.equal(sl.start,540+i*15,`${where}: slot ${i} start`);assert.equal(sl.end,sl.start+12);assert.equal(sl.resting.length+t.length,n,`${where}: playing + resting = all`);});
 const perRound=Math.floor(n/2);assert(s.slots.length>=Math.ceil(s.rounds.flat().length/Math.min(fields,perRound)),`${where}: no impossible packing`);
 if(double)for(const g of s.rounds.flat()){const back=s.rounds.flat().filter(x=>x.a===g.b&&x.b===g.a);assert.equal(back.length,1,`${where}: home and away swap`);}
 if(n%2)s.byes.forEach((b,r)=>assert.equal(b.length,1,`${where}: one bye in round ${r+1}`));
 assert.equal(new Set(s.rounds.flat().map(g=>g.id)).size,s.rounds.flat().length,`${where}: game ids unique`);
}
{const c=R.circleRounds(6);assert.equal(c.rounds.length,5);c.rounds.forEach(r=>{assert.equal(r.length,3);const t=r.flatMap(g=>[g.a,g.b]);assert.equal(new Set(t).size,6,'each team once a round');});
 const home=Array(6).fill(0);for(const g of c.rounds.flat())home[g.a]++;assert(Math.max(...home)-Math.min(...home)<=2,`home games are spread (${home})`);
 const c5=R.circleRounds(5);assert.equal(c5.rounds.length,5);assert.deepEqual(c5.byes.flat().sort(),[0,1,2,3,4],'each team rests once with 5 teams');}
{const s=R.makeSchedule({teams:['A','B','C','D'],fields:2,matchMin:10,breakMin:5,startMin:9*60});assert.equal(s.slots.length,3,'4 teams on 2 fields: 3 slots');assert.equal(R.clock(s.endMin),'09:40');}
{const s=R.makeSchedule({teams:['A','B','C','D','E','F'],fields:1,matchMin:10,breakMin:0,startMin:0});
 let backToBack=0;for(let i=1;i<s.slots.length;i++){const a=s.slots[i-1].games.flatMap(g=>[g.a,g.b]);if(s.slots[i].games.some(g=>a.includes(g.a)||a.includes(g.b)))backToBack++;}
 assert(backToBack<=4,`one field: few back-to-back games (${backToBack})`);}
assert.equal(R.makeSchedule({teams:['A'],fields:2,matchMin:10,breakMin:0,startMin:0}).slots.length,0,'one team: no games');
assert.equal(R.clock(9*60+5),'09:05');assert.equal(R.clock(25*60),'01:00');assert.equal(R.parseClock('9:30'),570);assert.equal(R.parseClock('nope'),null);
assert.deepEqual(R.parseTeams('Lions\n Tigers ,<b>Bears</b>\n\n'),['Lions','Tigers','bBears/b']);assert.equal(R.parseTeams(Array(30).fill('x').join('\n')).length,R.MAX_TEAMS);
{const games=[{id:'g1',round:1,a:0,b:1},{id:'g2',round:1,a:2,b:0},{id:'g3',round:2,a:1,b:2}];
 const t=R.standings(['A','B','C'],games,{g1:[2,0],g2:[1,1],g3:[0,3]});
 assert.deepEqual(t.map(r=>[r.name,r.p,r.w,r.d,r.l,r.gf,r.ga,r.gd,r.pts]),[['C',2,1,1,0,4,1,3,4],['A',2,1,1,0,3,1,2,4],['B',2,0,0,2,0,5,-5,0]],'points, then goal difference');
 assert.equal(R.standings(['A','B'],games.slice(0,1),{}).every(r=>r.p===0),true,'no score, no game counted');}

// ---- 3. beep test ----------------------------------------------------------------------------------------------------------
{const S=B.STANDARD;assert.equal(S.length,21);assert.deepEqual(S.slice(0,4).map(l=>[l.kmh,l.shuttles,l.shuttleSec]),[[8,7,9],[9,8,8],[9.5,8,7.58],[10,9,7.2]],'the published table');
 assert.equal(S[20].kmh,18.5);assert.equal(S[20].shuttles,16);assert.equal(S.reduce((a,l)=>a+l.shuttles,0)*20,4940,'4940 m to finish level 21');
 for(const l of S)assert(l.shuttles*l.shuttleSec>55&&l.shuttles*l.shuttleSec<70,`level ${l.level} lasts about a minute`);
 const K=B.KIDS;assert.equal(K[0].kmh,6);assert(K.every((l,i)=>i===0||l.kmh===K[i-1].kmh+.5),'kids: +0.5 km/h a level');assert(K[0].kmh<S[0].kmh,'kids start slower');
 for(const l of K)assert(l.shuttles*l.shuttleSec>50&&l.shuttles*l.shuttleSec<70,`kids level ${l.level} lasts about a minute`);
 const bs=B.beats(S);assert.equal(bs.length,S.reduce((a,l)=>a+l.shuttles,0));assert.equal(bs[0].t,9);assert.equal(bs[6].t,63);assert(bs[6].levelEnd&&!bs[5].levelEnd);assert.equal(bs[7].level,2);
 assert(bs.every((b,i)=>i===0||b.t>bs[i-1].t),'beats in order');
 let a=B.at(S,bs,0);assert.deepEqual([a.level,a.shuttle,a.completed,a.done],[1,1,0,false]);a=B.at(S,bs,9.5);assert.deepEqual([a.level,a.shuttle,a.completed],[1,2,1]);assert(Math.abs(a.progress-.5/9)<1e-9);
 a=B.at(S,bs,64);assert.deepEqual([a.level,a.shuttle],[2,1]);assert.equal(B.at(S,bs,1e6).done,true);
 assert.deepEqual(B.score(bs,0),{label:'0',level:0,shuttle:0,metres:0});const sc=B.score(bs,10);assert.equal(sc.label,'2.3');assert.equal(sc.metres,200);
 assert.equal(B.totalSec(S),bs[bs.length-1].t);assert.equal(B.levelsFor('kids'),K);}
console.log('new-tools: ok');
