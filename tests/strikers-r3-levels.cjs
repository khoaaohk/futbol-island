// Strikers round 3 hard levels + gentle first minute + adaptive flow (docs/ARCADE_STRIKERS_R3_OCT26.md).
// Rounds 5 Storm Press (rain) and 6 Island Legends (small goals) sit above the Neon Final with a smarter, faster press and keeper;
// old saves keep their stars and unlocks; a first-ever Round 1 eases Blue for 45 s; Blue eases when Gold trails by 2 and pushes when
// Gold leads by 3. Run: node tests/strikers-r3-levels.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const load=(f,ctx={})=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math,JSON,Number,Array,require:()=>({}),...ctx});return m.exports;};
const M=load('lib/arcade/strikerMatch.ts'),T=M.STRIKER_TUNING;
assert.deepEqual([...M.STRIKER_ROUNDS].slice(4),['Storm Press','Island Legends']);
for(const k of Object.keys(T))assert.equal(T[k].length,6,k+' has a value per round');
// A clear ladder: every numeric knob gets harder (or holds) round over round, and the top rounds beat the Neon Final.
const up=['speed','keeperDive','interceptSkill'],down=['tackleWindup','tackleThink','carrierThink','keeperReact','interceptRead'];
for(const k of up)for(let i=1;i<6;i++)assert.ok(T[k][i]>=T[k][i-1],k+' climbs');for(const k of down)for(let i=1;i<6;i++)assert.ok(T[k][i]<=T[k][i-1],k+' tightens');
for(const k of [...up,...down])assert.notEqual(T[k][5],T[k][3],k+' differs from the Neon Final');
assert.ok(T.tackleWindup[5]>=.28,'still a readable tackle telegraph at the top');
assert.equal(JSON.stringify(M.STRIKER_ROUND_MODS[4]),JSON.stringify({rain:true}));assert.equal(JSON.stringify(M.STRIKER_ROUND_MODS[5]),JSON.stringify({small:true}));
assert.equal(M.STRIKER_FOCUS.length,6);assert.equal(M.STRIKER_CHALLENGES.length,6);assert.equal(M.STRIKER_BLUE_STRIKES.length,6);assert.equal(M.STRIKER_SPIRIT.blueScale.length,6);
// Stars: round 5's third star is a set-piece goal; round 6's a clean-sheet win.
const st=(level,o)=>M.strikerStars({level,score:[1,0],focus:0,habitGoals:0,firstTimeGoals:0,setPieceGoals:0,...o});
assert.equal(st(5,{}).challenge,false);assert.equal(st(5,{setPieceGoals:1}).challenge,true);assert.equal(st(6,{}).challenge,true);assert.equal(st(6,{score:[2,1]}).challenge,false);
// The sim runs the hard rounds cleanly (no NaN, clock ends) at their modifiers.
for(const level of [5,6]){const g=M.createStrikerMatch(),s=g.state;s.level=level;g.configure({mods:M.STRIKER_ROUND_MODS[level-1]});g.reset();const i=M.strikerInput();
 assert.equal(s.mods.rain,level===5);assert.equal(s.goalHalf,level===6?M.STRIKER_SMALL_GOAL_HALF:M.STRIKER_GOAL_HALF);
 for(let t=0;t<200&&!s.finished;t+=1/30){i.x=Math.sin(t);i.z=Math.cos(t*.7)*.5;i.pass=(Math.floor(t*30)%45)===0;g.step(1/30,i);}
 assert.ok(s.finished,'full time');for(const p of s.players)assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));
 // A win at the top stays at the top.
 s.score[0]=2;s.score[1]=0;g.reset(true);assert.equal(s.level,Math.min(6,level+1));}
// Gentle first minute: only when asked, fades to normal by 45 s; adapt is damped and bounded.
{const g=M.createStrikerMatch(),s=g.state;g.configure({gentle:true});g.reset();assert.equal(s.gentle,true);g.configure({});assert.equal(s.gentle,false);
 g.configure({gentle:true});g.reset();s.score[1]=2;const i=M.strikerInput();for(let k=0;k<300;k++)g.step(1/30,i);assert.ok(s.adapt<-.5&&s.adapt>=-1,'eases while Gold trails by 2 ('+s.adapt.toFixed(2)+')');
 s.score[0]=5;for(let k=0;k<900&&!s.finished;k++)g.step(1/30,i);assert.ok(s.adapt>0&&s.adapt<=1,'pushes while Gold leads by 3');g.reset();assert.equal(s.adapt,0,'reset clears it');}
assert.ok(M.STRIKER_GENTLE.speed<0&&M.STRIKER_GENTLE.tackleThink>0&&M.STRIKER_GENTLE_SECONDS===45);
// Saves: old 4-round star lists keep their stars and pad with zeros; records allow unlocks up to 6 (unchanged file).
const store={};const local={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}};
const S=load('lib/arcade/strikerStars.ts',{localStorage:local});store['fi2-strikers-stars-v1']=JSON.stringify([3,2,1,0]);
assert.equal(JSON.stringify(S.readStrikerStars()),'[3,2,1,0,0,0]','old saves keep every star');assert.equal(JSON.stringify(S.saveStrikerStars(6,2)),'[3,2,1,0,0,2]');
assert.match(read('lib/arcade/arcadeRecords.ts'),/Math\.min\(6,Math\.floor\(value\.unlocked\)\)/);
// UI: the component configures rounds with their modifier, eases a first-ever Round 1, caps by the round count, marks HARD rounds.
const live=read('components/LiveArcadeMatch.tsx');
assert.match(live,/const roundOpts=\(level:number\)=>\(\{mods:STRIKER_ROUND_MODS\[level-1\]\?\?\{\},gentle:level===1&&\(readStrikerStars\(\)\[0\]\?\?0\)===0\}\)/);
assert.match(live,/data-hard=\{i>=4\|\|undefined\}/);assert.doesNotMatch(live,/Math\.min\(4,/,'no hard-coded 4-round caps left');
assert.equal((live.match(/ROUND_TIPS=\[([^\]]*)\]/)[1].match(/','|^'|'$/g)||[]).length>=5,true);
// Match events: one at a time, not in a first-ever match, not before 25 s; a power zone fills the first runner's sprint; wind drifts a loose ball.
{const g=M.createStrikerMatch(),s=g.state,i=M.strikerInput();g.configure({});g.reset();
 s.time=30;s.eventClock=999;s.nextEvent=0;g.step(1/30,i);assert.ok(s.windT>0||s.zoneT>0,'an event starts');assert.ok(['wind','zone'].includes(s.eventKind));
 s.windT=0;s.zoneT=M.STRIKER_ZONE_SECONDS;s.zoneX=10;s.zoneZ=0;const p=s.players[1];p.x=10;p.z=0;p.stamina=.2;g.step(1/30,i);assert.equal(s.zoneT,0);assert.equal(s.eventKind,'zonegot');assert.ok(p.stamina>.95||s.players.some(q=>q.stamina===1));
 s.zoneT=0;s.windT=5;s.windZ=1.6;Object.assign(s.ball,{owner:-1,x:0,z:0,vx:0,vz:0,y:.25,lock:0});const before=s.ball.vz;g.step(1/30,i);assert.ok(s.ball.vz>before,'wind drifts the loose ball');
 const h=M.createStrikerMatch();h.configure({gentle:true});h.reset();h.state.time=30;h.state.eventClock=999;h.state.nextEvent=0;h.step(1/30,i);assert.equal(h.state.windT+h.state.zoneT,0,'no events in a first-ever match');
 const e=M.createStrikerMatch();e.configure({});e.reset();e.state.time=10;e.state.eventClock=999;e.state.nextEvent=0;e.step(1/30,i);assert.equal(e.state.windT+e.state.zoneT,0,'not in the first 25 s');}
console.log('strikers-r3-levels ok');
