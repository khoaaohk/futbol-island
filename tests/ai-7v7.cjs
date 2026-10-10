// AI 7v7 live match (Old Town Ground, Oct 10 2026): the US Youth small-sided rules the 7v7 lessons teach, played by the
// island's live AI match (lib/town/match/matchSim.ts, knobs in formatAI.ts "7v7", helpers in sevenAI.ts).
// Covers: offside only past the build-out line, onside waiting, the build-out retreat on the keeper's hands but not on
// a back pass to his feet (and the view keeping the ball at his feet), the keeper recycle, width in possession /
// narrow block without it, the centre-backs splitting on a build-out, the teaching feed, and seeded match health.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const F=load('lib/town/match/formatAI.ts'),S=load('lib/town/match/sevenAI.ts'),B=load('lib/town/buildOut.ts');
const DT=1/30;

// ---- 1. Knobs: 7v7 opts in, a format without an entry stays neutral on every 7v7 knob ----
{const seven=F.formatAI('7v7'),beach=F.formatAI('beach'),N=F.FORMAT_AI_NEUTRAL;
 for(const k of ['attackWidth','defendNarrow','buildOutSplit','offsideZone','handsBuildOut','shotRange','coach7','finishMul','keeperRecycle'])assert.equal(beach[k],N[k],'beach keeps neutral '+k);
 assert.equal(N.defendNarrow,1);assert.equal(N.shotRange,1);assert.equal(N.finishMul,1);assert.equal(N.offsideZone,false);
 assert(seven.offsideZone&&seven.handsBuildOut&&seven.coach7);assert(seven.attackWidth>90&&seven.attackWidth<120,'wide players ≈ 3 m inside the touchline');
 assert(seven.defendNarrow<1&&seven.defendNarrow>.7);assert(seven.shotRange<1);assert.equal(seven.touchline,'Throw-in','US 7v7 restarts the touchline with a throw-in');}

// ---- 2. Offside zone geometry (pure) ----
{const Z=S.SEVEN_OFFSIDE_ZONE_DEPTH;
 assert(Math.abs(Z-(400-B.sevenBuildOutY('blue')))<1e-9);assert(Math.abs(Z-B.sevenBuildOutY('gold'))<1e-9,'the two build-out lines are symmetric');
 assert(Z>240&&Z<275,'the zone starts at the build-out line, between halfway and the box ('+Z.toFixed(1)+')');
 assert.equal(S.sevenOffside(Z-1,150,150),false,'short of the build-out line: never offside, even behind every defender');
 assert.equal(S.sevenOffside(Z+30,Z,200),true,'past the line and beyond the second-last defender and the ball: offside');
 assert.equal(S.sevenOffside(Z+30,Z+28,200),false,'level with the second-last defender: onside');
 assert.equal(S.sevenOffside(Z+30,Z,Z+28),false,'level with the ball: onside');
 assert.equal(S.sevenOnsideDepth(150,120,2),Z,'anywhere short of the zone is fine');
 assert.equal(S.sevenOnsideDepth(320,200,2),318,'past it, wait level with the second-last defender');
 assert.equal(S.sevenWideX(58,135,104),31);assert.equal(S.sevenWideX(212,135,104),239);}

const fresh=(seed=9)=>{const s=new MatchSim(seed,'7v7');s.restart=null;s.windupScale=0;s.combos=null;return s;};
const park=(s,team,x,y)=>{for(const id of (team==='gold'?s.goldIds:s.blueIds))if(!s.players[id].isGK)Object.assign(s.players[id],{x,y,vx:0,vy:0});};

// ---- 3. The sim plays the zone: an attacker behind the defence but short of the line is a target; past it, not ----
{const s=fresh();const Z=S.SEVEN_OFFSIDE_ZONE_DEPTH;
 park(s,'blue',135,40);park(s,'gold',135,330);Object.assign(s.players.dlcb,{x:60,y:60});Object.assign(s.players.drcb,{x:210,y:60});
 s.possession='gold';s.ball.owner='cm';Object.assign(s.players.cm,{x:135,y:260});s.ball.x=135;s.ball.y=260;
 const yAt=d=>400-d; // gold attacks toward y = 0
 // every blue outfielder at y 40 (depth 360): the forward at depth Z-10 is goal-side of nobody but short of the line
 Object.assign(s.players.st,{x:135,y:yAt(Z-10)});assert.equal(s.isOffside('gold',s.players.st.y),false,'short of the build-out line');
 Object.assign(s.players.st,{x:135,y:yAt(Z+20)});
 park(s,'blue',135,yAt(Z-5));Object.assign(s.players.dgk,{y:20});
 assert.equal(s.isOffside('gold',s.players.st.y),true,'past the line and beyond the last defender');
 Object.assign(s.players.lm,{x:60,y:250});Object.assign(s.players.rm,{x:210,y:250});
 for(let i=0;i<40;i++)assert.notEqual(s.bestPass('cm'),'st','the AI never picks an offside forward');
 // the onside wait: an off-ball forward beyond the line holds level with the second-last defender
 s.computeTargets(DT);const capY=yAt(S.sevenOnsideDepth(s.offsideLine('gold'),s.depth('gold',s.ball.y),F.formatAI('7v7').onsideHold));
 assert(s.targets.st.y>=capY-1e-6,'the forward waits on the line ('+s.targets.st.y.toFixed(1)+' ≥ '+capY.toFixed(1)+')');}

// ---- 4. Build-out: hands yes, back pass no (pass-back rule), and the view keeps the ball at his feet ----
{const s=fresh(11);park(s,'blue',135,150);park(s,'gold',135,300);
 s.possession='gold';const gk=s.players.gk;Object.assign(gk,{x:135,y:372});
 Object.assign(s.players.lcb,{x:100,y:330});s.ball.owner='lcb';s.ball.x=100;s.ball.y=330;
 s.doPass('lcb','gk',.95);assert.equal(s.seven.backPasses,1);assert.equal(s.note.text,S.SEVEN_NOTES.backPass[0]);
 for(let i=0;i<90&&s.ball.owner!=='gk';i++)s.ballLogic(DT);
 assert.equal(s.ball.owner,'gk','the keeper takes the back pass');assert.equal(s.keeperHands,false,'with his feet');assert.equal(s.buildOutTeam,null,'no retreat on a back pass');
 assert(s.passCd<=.45,'and he moves it on quickly');
 // his release ends the feet touch; a save is his hands → the other team must retreat
 s.doPass('gk','rcb',1);assert.equal(s.keeperHands,true);
 const h=fresh(12);park(h,'blue',135,330);h.possession='blue';h.ball.owner=null;Object.assign(h.players.gk,{x:135,y:370});
 Object.assign(h.ball,{x:135,y:360,vx:0,vy:60,target:null,intBy:null});h.ballIsShot=true;h.shotIsGoal=false;h.ballFlight=0;h.saveRoll=.9;h.lastFrom='dst';
 for(let i=0;i<30&&h.ball.owner!=='gk';i++)h.ballLogic(DT);
 assert.equal(h.ball.owner,'gk','the keeper saves it');assert.equal(h.keeperHands,true);assert.equal(h.buildOutTeam,'gold','hands → build-out retreat');
 h.computeTargets(DT);for(const id of h.blueIds)if(!h.players[id].isGK)assert(B.behindBuildOut(h.targets[id].y,'gold',0),id+' retreats behind the build-out line');
 assert.equal(h.note.text,S.SEVEN_NOTES.buildOut[0],'the feed names the build-out line');
 // the centre-backs split to the edges of the box for the first pass
 assert(Math.abs(h.targets.lcb.x-135)>=79&&Math.abs(h.targets.rcb.x-135)>=79,'centre-backs split wide ('+h.targets.lcb.x.toFixed(0)+', '+h.targets.rcb.x.toFixed(0)+')');
 const view=fs.readFileSync('lib/town/fieldRuntime.ts','utf8');assert(/isGK&&e\.sim\.keeperHands\)\{const keeper=/.test(view),'the view puts the ball in his hands only when he has it in his hands');}

// ---- 5. Keeper recycle: pressed in our own third with the keeper free ----
{const s=fresh(13);park(s,'blue',230,60);park(s,'gold',230,200);s.possession='gold';
 Object.assign(s.players.gk,{x:135,y:370});Object.assign(s.players.lcb,{x:110,y:320});Object.assign(s.players.dst,{x:110,y:310});
 assert.equal(s.keeperRecycleTarget('lcb'),'gk','free keeper behind a pressed defender');
 Object.assign(s.players.dlm,{x:122,y:346});assert.equal(s.keeperRecycleTarget('lcb'),null,'a screened lane is no option');
 Object.assign(s.players.dlm,{x:230,y:60});Object.assign(s.players.dcm,{x:140,y:368});assert.equal(s.keeperRecycleTarget('lcb'),null,'a marked keeper is no option');}

// ---- 6. Shape: wide with the ball, narrow without it (compared with the neutral engine on the same layout) ----
function settle(ai,poss){const s=fresh(15);if(ai)s.ai={...s.ai,...ai};s.possession=poss;
 const owner=poss==='gold'?'cm':'dcm';s.ball.owner=owner;Object.assign(s.players[owner],{x:135,y:200});s.ball.x=135;s.ball.y=200;
 for(let i=0;i<120;i++)s.computeTargets(DT);return s;}
{const neutral={attackWidth:0,defendNarrow:1};
 const wideAI=settle(null,'gold'),wideN=settle(neutral,'gold');
 const spread=s=>Math.abs(s.targets.lm.x-s.targets.rm.x);
 assert(spread(wideAI)>spread(wideN)+30,'in possession the wide players stretch the pitch ('+spread(wideN).toFixed(0)+' → '+spread(wideAI).toFixed(0)+' u)');
 assert(spread(wideAI)>190,'touchline to touchline');
 const narAI=settle(null,'blue'),narN=settle(neutral,'blue');
 assert(spread(narAI)<spread(narN)-10,'out of possession the block squeezes ('+spread(narN).toFixed(0)+' → '+spread(narAI).toFixed(0)+' u)');}

// ---- 7. Seeded matches: healthy, inside the pitch, the rules visible, and a contest ----
{let goals=0,backPasses=0,feet=0,onside=0,viol=0,notes=0,maxQuiet=0;const SEEDS=[11,28,45,62,79,96],SECONDS=150;
 const widthGap=[];
 for(const seed of SEEDS){const s=new MatchSim(seed,'7v7');let quiet=0,ev=0,lastOwner=null,lastHands=false,lastNote=0,win=0,wout=0,n=0;
  for(let t=0;t<SECONDS/DT;t++){s.step(DT);
   const e=s.stats.passes+s.stats.turnovers+s.stats.shots;quiet=e===ev?quiet+DT:0;ev=e;maxQuiet=Math.max(maxQuiet,quiet);
   if(s.note.serial!==lastNote){lastNote=s.note.serial;notes++;}
   // at the keeper's release from his hands every opponent is behind the build-out line
   const o=s.ball.owner;if(o!==lastOwner){if(lastOwner&&s.players[lastOwner].isGK&&lastHands&&o===null){const tm=s.players[lastOwner].team;for(const id of s.foes(tm))if(!B.behindBuildOut(s.players[id].y,tm,-2))viol++;}lastOwner=o;}
   lastHands=!!o&&s.players[o].isGK&&s.keeperHands;
   if(t%15===0&&!s.restart&&s.goalHold<=0){for(const tm of ['gold','blue']){let a=1e9,b=-1e9;for(const id of s.mates(tm)){const p=s.players[id];if(p.isGK)continue;a=Math.min(a,p.x);b=Math.max(b,p.x);}if(s.possession===tm)win+=b-a;else wout+=b-a;}n++;}
   if(t%30===0)for(const p of Object.values(s.players)){assert(Number.isFinite(p.x+p.y+p.vx+p.vy));assert(p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396);}}
  goals+=s.score.gold+s.score.blue;backPasses+=s.seven.backPasses;feet+=s.seven.keeperFeet;onside+=s.seven.onsideWaits;widthGap.push((win-wout)/n);}
 const perGame=goals/SEEDS.length,gap=widthGap.reduce((a,b)=>a+b,0)/widthGap.length;
 assert(perGame>=1.2&&perGame<=6,'goals per game in range ('+perGame.toFixed(2)+')');
 assert(backPasses>=2&&feet>=2,'the keeper is used as the spare player ('+backPasses+' back passes)');
 assert(onside>0,'forwards wait on the line');assert(notes>=SEEDS.length,'the feed teaches the 7v7 rules');
 assert.equal(viol,0,'opponents respect the build-out line while the keeper holds it ('+viol+')');
 assert(gap>30,'wider with the ball than without it ('+gap.toFixed(1)+' u)');assert(maxQuiet<35,'no deadlock');
 console.log('ai-7v7',JSON.stringify({goalsPerGame:+perGame.toFixed(2),backPasses,keeperFeet:feet,widthGapU:+gap.toFixed(1),notes,maxQuiet:+maxQuiet.toFixed(1)}));}
console.log('PASS ai-7v7: offside zone, onside wait, build-out on hands only, keeper recycle, width/narrow shape, split centre-backs, teaching feed, seeded match health');
