const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path');
const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});cache.set(file,m.exports);return m.exports;}
const {MatchSim}=load(path.resolve('lib/town/match/matchSim.ts'));
// Deliberate wall pass: original passer runs beyond receiver and can be selected again.
const s=new MatchSim(9,'7v7');s.restart=null;s.possession='gold';
for(const id of s.blueIds){s.players[id].x=250;s.players[id].y=40;}
Object.assign(s.players.lm,{x:90,y:240});Object.assign(s.players.cm,{x:124,y:225});
s.ball.owner='lm';s.doPass('lm','cm');assert(s.combination,'short pass opens a purposeful run');
s.computeTargets(.03);assert(s.targets.lm.y<240,'passer runs forward instead of standing or dropping behind');
s.ball.owner='cm';Object.assign(s.players.lm,{x:95,y:205});assert.equal(s.combinationReturn('cm'),'lm','safe return to previous passer is allowed');
Object.assign(s.players.dcm,{x:109.5,y:215});assert.equal(s.combinationReturn('cm'),null,'screened return is rejected');assert.equal(s.combination,null,'blocked combination expires instead of forcing a pass');
// A covered central lane does not hide the available diagonal carry.
Object.assign(s.players.lm,{x:135,y:220});for(const id of s.blueIds)Object.assign(s.players[id],{x:250,y:40});Object.assign(s.players.dcm,{x:135,y:195});
assert(s.openLaneLen('lm')>=25);assert(Math.abs(s.carryDirection.x)>.5,'carrier sees free diagonal rather than blindly driving central');
// Tiny nearest-player changes retain the press assignment; significant changes hand it off.
s.ball.owner='lm';Object.assign(s.players.dlm,{x:145,y:220});Object.assign(s.players.dcm,{x:144,y:220});s.presserId='dlm';s.computeTargets(.03);assert.equal(s.presserId,'dlm');
Object.assign(s.players.dlm,{x:175,y:220});s.computeTargets(.03);assert.equal(s.presserId,'dcm');
for(const id of s.blueIds)Object.assign(s.players[id],{x:250,y:40});
Object.assign(s.players.dcm,{x:135,y:218});Object.assign(s.players.dlm,{x:145,y:229});Object.assign(s.players.drm,{x:148,y:208});
s.presserId=null;s.computeTargets(.03);assert.equal(s.tacticalIntent.defense.cover,'drm','goal-side cover wins over a slightly closer defender stranded beyond the ball');
assert(s.targets.drm.y<220,'cover protects space toward own goal');
// Same layout produces a shorter futsal rotation, not merely quicker outdoor football.
function rotation(format){const q=new MatchSim(9,format);for(const id of q.blueIds)Object.assign(q.players[id],{x:250,y:40});const [a,b]=q.goldIds.filter(id=>!q.players[id].isGK).slice(-2);Object.assign(q.players[a],{x:90,y:240});Object.assign(q.players[b],{x:124,y:225});q.ball.owner=a;q.doPass(a,b);return q.combination;}
assert(rotation('futsal').y>rotation('7v7').y,'futsal uses shorter rotation depth');
// A clean, already-running receiver keeps progressing while cushioning the ball.
const receive=new MatchSim(21,'7v7');receive.restart=null;receive.rng=()=>.9;
for(const id of receive.blueIds)Object.assign(receive.players[id],{x:250,y:40});
Object.assign(receive.players.cm,{x:135,y:230,vx:0,vy:-35});
Object.assign(receive.ball,{x:126,y:230,vx:140,vy:0,owner:null,target:'cm',intBy:null});receive.ballFlight=0;receive.ballIsShot=false;
receive.ballLogic(1/30);assert.equal(receive.ball.owner,'cm');assert(receive.carrying,'safe receive immediately plans a carry through the touch');
const receivedY=receive.players.cm.y;
for(let i=0;i<6;i++){receive.computeTargets(1/30);receive.integrate(1/30);}
assert(receive.players.cm.y<receivedY-4,'receiver keeps moving through first 200 ms');assert(receive.players.cm.vy<-20,'receiving does not impose a stop');
receive.kickOff('gold');assert.equal(receive.combination,null);assert.equal(receive.carrying,false,'restart cancels prior movement intent');
const summary=[];
for(const format of ['futsal','7v7','9v9','11v11']){
 let passes=0,carries=0,returns=0,turnovers=0,shots=0,maxQuiet=0,moving=0,samples=0;const start=performance.now();
 for(const seed of [7,19,43]){
  const m=new MatchSim(seed,format);let quiet=0,events=0;
  for(let tick=0;tick<30*180;tick++){
   m.step(1/30);
   const next=m.stats.passes+m.stats.turnovers+m.stats.shots;
   quiet=next===events?quiet+1/30:0;events=next;maxQuiet=Math.max(maxQuiet,quiet);
   if(tick%30===0){
    for(const p of Object.values(m.players)){assert(Number.isFinite(p.x+p.y+p.vx+p.vy));assert(p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396);if(!p.isGK){samples++;if(Math.hypot(p.vx,p.vy)>1)moving++;}}
   }
  }
  passes+=m.stats.passes;carries+=m.stats.carries;returns+=m.stats.combinationReturns;turnovers+=m.stats.turnovers+m.stats.interceptions+m.stats.looseOpp;shots+=m.stats.shots;
 }
 assert(passes>60,format+' builds connected play');assert(carries>3,format+' uses sustained carries');assert(returns>0,format+' completes return-pass choices');assert(turnovers>5,format+' defense regains possession');assert(shots>5,format+' progresses to shots');assert(maxQuiet<35,format+' has no long deadlock');assert(moving/samples>.5,format+' players adjust purposefully');
 summary.push({format,passes,carries,returnPasses:returns,turnovers,shots,maxQuiet:+maxQuiet.toFixed(2),movingShare:+(moving/samples).toFixed(3),cpuMs:Math.round(performance.now()-start)});
}
console.table(summary);console.log('PASS conditional combinations, carry corridors, stable pressure, distinct futsal rotations and 12 seeded three-minute matches');
