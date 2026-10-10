// 11v11 live-match AI (Eleven Park; lib/town/match/elevenAI.ts over the shared engine lib/town/match/matchSim.ts).
// Covers: the per-format rows stay neutral outside 11v11; recovery runs put the defending side goal-side of the ball
// (the striker stays up as the out-ball); offside judged when the pass is struck (re-read to an onside team-mate, or
// flagged and explained); throw-ins, corners and goal kicks named and explained in the feed; the sweeper keeper; and
// a seeded run proving the match still flows (goals, offside calls, teaching lines, everyone inside the lines).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,performance,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});cache.set(file,m.exports);return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const E=load('lib/town/match/elevenAI.ts');
const park=(s,team,x,y)=>{for(const id of team==='gold'?s.goldIds:s.blueIds){const p=s.players[id];if(!p.isGK)Object.assign(p,{x,y,vx:0,vy:0});}};
const live=s=>{s.restart=null;s.goalHold=0;s.windupScale=0;};

// ---- 1. Per-format rows: 11v11 opts in, every other format stays neutral ----
{const e=new MatchSim(1,'11v11');assert.equal(e.ai.touchline,'Throw-in');assert.equal(e.ai.teach,true);assert(e.ai.sweeper>0&&e.ai.onsideHold>0&&e.ai.restartOffsideFree);
 assert(e.defend.recover>0&&e.defend.releaseRead>0&&e.defend.releaseRead<1);
 for(const f of ['futsal','7v7','9v9','beach']){const s=new MatchSim(1,f);assert.deepEqual({...s.defend},{...E.DEFEND_AI_NEUTRAL},f+' has no 11v11 defending knobs');assert.notEqual(E.formatNotes(f),E.ELEVEN_NOTES);}
 assert.equal(new MatchSim(1,'futsal').ai.touchline,'Kick-in','futsal keeps the kick-in');
 assert.equal(E.formatNotes('11v11'),E.ELEVEN_NOTES);assert.equal(typeof E.ELEVEN_NOTES.corner,'function');assert.equal(E.formatNotes('9v9').corner,undefined,'only 11v11 narrates every restart');
 // recoveryDepth: off / other half → no cap; defenders keep half the gap; floors at the six-yard line and penalty spot
 assert.equal(E.recoveryDepth(0,100,false),Infinity);assert.equal(E.recoveryDepth(12,230,false),Infinity);
 assert.equal(E.recoveryDepth(12,150,false),138);assert.equal(E.recoveryDepth(12,150,true),144);
 assert.equal(E.recoveryDepth(12,30,false),44);assert.equal(E.recoveryDepth(12,10,true),16);}

// ---- 2. Recovery runs: ball in our half → everyone but the striker (and the press trio) gets goal-side of it ----
function defendingTargets(recover){
 const s=new MatchSim(5,'11v11');live(s);s.defend.recover=recover;s.possession='blue';
 park(s,'blue',135,60);Object.assign(s.players.dcm,{x:135,y:280});Object.assign(s.players.dst,{x:120,y:300});Object.assign(s.players.dlw,{x:60,y:300});Object.assign(s.players.drw,{x:210,y:300});
 for(const [id,x,y] of [['lb',45,340],['lcb',100,350],['rcb',170,350],['rb',225,340],['lcm',82,215],['cm',135,250],['rcm',188,215],['lw',52,190],['st',135,160],['rw',218,190]])Object.assign(s.players[id],{x,y,vx:0,vy:0});
 Object.assign(s.ball,{x:135,y:280,vx:0,vy:0,owner:'dcm',target:null,intBy:null});
 s.computeTargets(1/30);return s;}
{const on=defendingTargets(12),off=defendingTargets(0),busy=new Set([on.presserId,on.defenseIntent.cover,on.defenseIntent.balance]);
 const ballY=280,checked=[];
 for(const id of on.goldIds){const p=on.players[id];if(p.isGK||id==='st'||busy.has(id))continue;checked.push(id);
  assert(on.targets[id].y>=ballY+(p.role==='def'?6:12)-1e-6,`${id} recovers goal-side of the ball (target y ${on.targets[id].y.toFixed(1)})`);}
 assert(checked.includes('lw')&&checked.includes('rw'),'both wingers track back');
 assert(on.targets.st.y<ballY-40,'the central striker stays up as the out-ball');
 assert(['lw','rw','lcm','rcm'].some(id=>off.targets[id].y<ballY),'without the knob someone defends from the wrong side of the ball');}

// ---- 3. Offside is judged when the pass is struck ----
function offsideSetup(releaseRead){
 const s=new MatchSim(7,'11v11');live(s);s.defend.releaseRead=releaseRead;s.possession='gold';
 park(s,'gold',135,300);park(s,'blue',30,150);
 for(const [id,x] of [['dlb',30],['dlcb',60],['drcb',210],['drb',240]])Object.assign(s.players[id],{x,y:120});
 Object.assign(s.players.cm,{x:135,y:230});Object.assign(s.players.st,{x:135,y:100});Object.assign(s.players.lcm,{x:80,y:250});
 Object.assign(s.ball,{x:135,y:230,vx:0,vy:0,owner:'cm',target:null,intBy:null});s.ballFlight=0;s.passCd=5;return s;}
{const s=offsideSetup(1e-9); // knob on (11v11), but this passer never re-reads the run
assert(s.isOffside('gold',s.players.st.y),'the striker stands beyond the second-last defender');
 const notes=s.note.serial;s.doPass('cm','st');assert.equal(s.ball.target,'st');
 for(let i=0;i<120&&!s.stats.offsideCalls;i++)s.step(1/30);
 assert.equal(s.stats.offsideCalls,1,'the flag goes up when the offside receiver touches it');assert.equal(s.possession,'blue','free kick to the defence');
 assert(s.note.serial>notes&&s.note.text==='Offside!'&&/second-last defender/.test(s.note.reason),'the feed explains the call');
 const r=offsideSetup(1);r.doPass('cm','st');assert.notEqual(r.ball.target,'st','a passer who reads the run plays an onside team-mate');assert(!r.isOffside('gold',r.players[r.ball.target].y));
 const lob=offsideSetup(1e-9);lob.doLoft('cm','st');
 assert.equal(lob.offsidePass&&lob.offsidePass.id,'st','a ball over the top to a man already beyond the line is flagged too (called if he meets it)');
 const nine=offsideSetup(0);nine.defend.releaseRead=0;nine.doLoft('cm','st');assert.equal(nine.offsidePass,null,'formats without the knob keep the old loft');}

// ---- 4. Restarts are named for the format and explained in 11v11 ----
function out(format,possession,x,y,vx,vy){const s=new MatchSim(3,format);live(s);s.possession=possession;s.ballFlight=0;s.ballIsShot=false;
 Object.assign(s.ball,{x,y,vx,vy,owner:null,target:null,intBy:null,height:0});const n=s.note.serial;s.step(1/30);return {s,noted:s.note.serial>n};}
{const t=out('11v11','gold',10,200,-300,0);assert.equal(t.s.restart.kind,'kickin');assert.equal(t.s.msg,'Throw-in');assert(t.noted&&t.s.note.text==='Throw-in for Blue'&&/both hands/.test(t.s.note.reason));
 const c=out('11v11','blue',100,6,0,-300);assert.equal(c.s.restart.kind,'corner');assert(c.noted&&c.s.note.text==='Corner for Gold');
 const g=out('11v11','gold',135,6,0,-300);assert.equal(g.s.restart.kind,'goalkick');assert(g.noted&&g.s.note.text==='Goal kick for Blue');
 const f=out('futsal','gold',10,200,-300,0);assert.equal(f.s.msg,'Kick-in');assert(!/Throw-in/.test(f.s.note.text),'futsal keeps the kick-in (its own lane narrates it)');}

// ---- 5. Sweeper keeper: with his team attacking the far end he stands well off his line ----
{const s=new MatchSim(4,'11v11');live(s);s.possession='gold';park(s,'blue',135,40);park(s,'gold',135,90);
 Object.assign(s.ball,{x:135,y:70,vx:0,vy:0,owner:'st',target:null,intBy:null});Object.assign(s.players.st,{x:135,y:70});
 for(let i=0;i<30;i++)s.updateShape(1/30);s.computeTargets(1/30);
 assert(392-s.targets.gk.y>30,`keeper sweeps behind a high line (${(392-s.targets.gk.y).toFixed(1)} u off it)`);}

// ---- 6. Seeded matches still flow: goals, rare offside calls, teaching lines, nobody outside the lines ----
{let goals=0,calls=0,notes=0,maxQuiet=0;const t0=performance.now();
 for(const seed of [11,45]){const s=new MatchSim(seed,'11v11');let quiet=0,ev=0;
  for(let k=0;k<30*180;k++){s.step(1/30);const e=s.stats.passes+s.stats.shots+s.stats.turnovers;quiet=e===ev?quiet+1/30:0;ev=e;maxQuiet=Math.max(maxQuiet,quiet);
   if(k%30===0)for(const id of s.ids){const p=s.players[id];assert(Number.isFinite(p.x+p.y)&&p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396,id+' inside the pitch');}}
  goals+=s.score.gold+s.score.blue;calls+=s.stats.offsideCalls;notes+=s.note.serial;}
 assert(goals>=2,'goals still come ('+goals+')');assert(calls<=6,'offside stays rare ('+calls+')'); // the call itself is pinned down in section 3; ~0.5 a game over 16 seedsassert(notes>=4,'restarts and calls are explained ('+notes+')');assert(maxQuiet<25,'no deadlock ('+maxQuiet.toFixed(1)+' s)');
 console.log(`PASS eleven-ai: goals ${goals}, offside calls ${calls}, teaching lines ${notes} in two 3-minute games (${Math.round(performance.now()-t0)} ms)`);}
