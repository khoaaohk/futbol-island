// Tier 2 match balance (Nov 7 2026; lib/town/match/humanDefence.ts HUMAN_CHASE / HUMAN_CONTEST / HUMAN_FEED / HUMAN_SIDE):
// the AI side chasing a kid's lead, a contest for the ball near a defending human, the give-and-go return, the 11v11 human
// side (pace, finishing, crosses) and the eased 11v11 AI defence. Every change is gated on a human being joined: the AI-only
// fixture stays byte-identical and the sim stays seeded. Measured with scripted kids (48 seeds x 6 real min per small-sided
// format, 32 x 3 on the 9v9 / 11v11): see the Tier 2 report; this file keeps cheap guards + one small seeded band.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const HD=load('lib/town/match/humanDefence.ts');
const {settlePace}=load('lib/town/match/matchMotion.ts');
const DT=1/30,F5=['7v7','futsal','9v9','11v11','beach'];
const outfield=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
const put=(sim,id,x,y)=>{const p=sim.players[id];p.x=x;p.y=y;p.vx=0;p.vy=0;};
function clear(sim){for(const id of sim.ids){const p=sim.players[id];if(p.isGK)continue;put(sim,id,p.team==='gold'?250:20,p.team==='gold'?380:20);}}

// ---- 1. AI-only: the seeded fixture is unchanged; the chase / contest read 0 with no human ----
{const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 assert.deepEqual(S.all(MatchSim),expected,'AI-only matches stay byte-identical');
 const sim=new MatchSim(5,'7v7');sim.windupScale=.32;for(let i=0;i<600;i++)sim.step(DT*.32);
 assert.equal(sim.chaseK('gold')+sim.chaseK('blue'),0,'no chase without a human');
 assert.equal(sim.contestLoose(sim.players[outfield(sim,'gold')[0]]),0,'no contest without a human');}

// ---- 2. Chase strength: only while the human side leads (7v7 / 9v9 from level), never more when he is behind ----
{const C=HD.HUMAN_CHASE,S=HD.chaseStrength;
 for(const f of F5){const c=C[f];
  assert.equal(S(c,3,true),0,f+': friends on both sides: no chase');
  assert(S(c,-3,false)<=S(c,0,false),f+': behind is never harder than level (no rubber band against a losing kid)');
  for(let l=0;l<4;l++)assert(S(c,l+1,false)>=S(c,l,false),f+': grows with the lead');
  assert.equal(S(c,c.full,false),1,f+': full at '+c.full+' goals');
  for(const k of ['attack','range','finish'])assert(c[k]>=1&&c[k]<=4,f+' '+k+' is a boost, bounded: '+c[k]);
  assert(c.ease>0&&c.ease<=1,f+': the leading side eases off, never tightens');}
 assert.equal(S(C['7v7'],0,false),C['7v7'].level,'7v7: the AI side wants a goal from level');
 assert.equal(S(C.futsal,1,false),0,'futsal: only a 2-goal lead starts the chase');
 // in the sim: the human side's lead since the join
 const sim=new MatchSim(9,'7v7');sim.windupScale=.32;const me=outfield(sim,'gold')[0];sim.lockHuman(me);
 assert.equal(sim.chaseK('blue'),C['7v7'].level,'level at the join');sim.score.gold+=2;assert.equal(sim.chaseK('blue'),1,'two up: full chase');
 assert.equal(sim.chaseK('gold'),0,'the human side never chases');sim.score.blue+=4;assert.equal(sim.chaseK('blue'),C['7v7'].level,'behind: back to level, not less');}

// ---- 3. Contest: a heavy-touch chance on an AI claim only with a HUMAN opponent close by ----
{const sim=new MatchSim(11,'7v7');sim.windupScale=.32;clear(sim);const [me]=outfield(sim,'gold'),[ai]=outfield(sim,'blue'),[mate]=outfield(sim,'gold').slice(1);sim.lockHuman(me);
 const r=sim.humanContest.r;put(sim,ai,135,200);put(sim,me,135,200+r*.3);
 const near=sim.contestLoose(sim.players[ai]);assert(near>0&&near<=sim.humanContest.loose,'a human defender close by: '+near.toFixed(3));
 put(sim,me,135,200+r*1.2);assert.equal(sim.contestLoose(sim.players[ai]),0,'out of range: none');
 put(sim,me,135,200+r*.3);assert.equal(sim.contestLoose(sim.players[mate]),0,'his own team-mate is never contested');
 for(const f of F5)assert(HD.HUMAN_CONTEST[f].loose<=.25&&HD.HUMAN_CONTEST[f].r<=60,f+': a little error, not a lottery');}

// ---- 4. Give-and-go: the AI team-mate he just passed to plays it straight back when he is open ----
{const sim=new MatchSim(13,'7v7');sim.windupScale=.32;clear(sim);const [me,mate]=outfield(sim,'gold');sim.lockHuman(me);
 put(sim,mate,135,220);put(sim,me,100,170);Object.assign(sim.ball,{owner:mate,target:null,intBy:null,x:135,y:218,vx:0,vy:0,height:0});sim.possession='gold';
 sim.lastFrom=me;assert.equal(sim.callerFor(mate),me,'open after his pass: the return');
 sim.lastFrom=null;assert.equal(sim.callerFor(mate),null,'no pass from him: no return');
 const foe=outfield(sim,'blue')[0];sim.lastFrom=me;put(sim,foe,101,172);assert.equal(sim.callerFor(mate),null,'marked: no return');}

// ---- 5. 11v11 human side: run x HUMAN_SIDE.pace, the sprint top and the tackle lunge stay under the pose limit ----
{const sim=new MatchSim(17,'11v11');sim.windupScale=.32;assert.equal(sim.humanPace,HD.HUMAN_SIDE['11v11'].pace);assert(Math.abs(sim.humanPace*sim.humanSprintBoost-1.3)<1e-9,'sprint top unchanged');
 const top=(lunge)=>{const s=new MatchSim(17,'11v11');s.windupScale=.32;for(let i=0;i<30;i++)s.step(DT*.32);clear(s);const me=outfield(s,'gold')[0],c=outfield(s,'blue')[0];s.lockHuman(me);let v=0;
  for(let i=0;i<60;i++){put(s,c,135,lunge?100:395);if(lunge)Object.assign(s.ball,{owner:c,target:null,intBy:null,x:135,y:102,vx:0,vy:0,height:0});s.possession=lunge?'blue':'gold';
   const p=s.players[me];if(i===0)put(s,me,135,lunge?122:300);if(lunge&&p.y<114)put(s,me,135,122);s.humanInput(me,{mx:0,my:-1,sprint:true,tackle:lunge&&i%10===0});s.step(DT*.32);if(i>20)v=Math.max(v,Math.hypot(p.vx,p.vy));}return v;};
 const sprint=top(false),lunge=top(true);if(process.env.V)console.log('11v11 sprint',sprint.toFixed(1),'lunge',lunge.toFixed(1));assert(lunge<=sprint*1.02,'the lunge never passes his sprint top ('+lunge.toFixed(1)+' vs '+sprint.toFixed(1)+')');
 const e=HD.HUMAN_SIDE['11v11'];assert(e.pace>=1.1&&e.pace<=1.2&&e.finish<=1.6&&e.shoot<=1.4,'11v11: a modest lift for the human side');}

// ---- 6. Seeded band: a scripted kid on the 7v7 concedes some goals now and keeps his touches (8 seeds x 4 real min) ----
function kidRun(format,seed,mins){const SP=format==='futsal'||format==='beach'?.48:.32;const sim=new MatchSim(270+seed*41,format);sim.windupScale=SP;sim.receiveSettle=settlePace(sim.goalVenue.width,SP);
 const me=outfield(sim,'gold').sort((a,b)=>Math.hypot(sim.players[a].x-135,sim.players[a].y-230)-Math.hypot(sim.players[b].x-135,sim.players[b].y-230))[0];sim.lockHuman(me);
 let r=seed*7919+1;const rnd=()=>{r=(r*1103515245+12345)>>>0;return r/4294967296;};
 let touches=0,prev=null,next=0,t=0,f={mx:0,my:0};const n=Math.round(mins*60/DT),s0={...sim.score};
 for(let i=0;i<n;i++){t+=DT;const p=sim.players[me],b=sim.ball,o=b.owner;
  if(t>=next){next=t+.35*(.7+.6*rnd());const to=(x,y)=>{const a=Math.atan2(y-p.y,x-p.x)+(rnd()*2-1)*.7;return {mx:Math.cos(a),my:Math.sin(a)};};
   if(o===me){f=to(135,8);if(Math.hypot(135-p.x,8-p.y)<150&&rnd()<.6)Object.assign(f,{shoot:true,shootPower:.3});else if(rnd()<.35)f.pass=true;}
   else if(o&&sim.players[o].team==='gold'){f=to(Math.max(30,Math.min(240,p.x+(rnd()-.5)*40)),Math.max(40,sim.players[o].y-70));}
   else if(o){const c=sim.players[o];f=to(c.x,c.y+6);if(Math.hypot(c.x-p.x,c.y-p.y)<22&&rnd()<.45)f.tackle=true;}else f=to(b.x,b.y);}
  sim.humanInput(me,f);delete f.shoot;delete f.pass;delete f.tackle;sim.step(DT*SP);
  if(sim.ball.owner===me&&prev!==me)touches++;prev=sim.ball.owner;}
 return {touches,gf:sim.score.gold-s0.gold,ga:sim.score.blue-s0.blue};}
{let T=0,GF=0,GA=0;const seeds=[1,2,3,4,5,6,7,8],mins=4;for(const s of seeds){const r=kidRun('7v7',s,mins);T+=r.touches;GF+=r.gf;GA+=r.ga;}
 const m=seeds.length*mins;if(process.env.V)console.log('7v7 kid: GF',(GF/m).toFixed(2),'GA',(GA/m).toFixed(2),'touches',(T/m).toFixed(2));
 assert(GA/m>=.1&&GA/m<=.5,'7v7: the AI side scores against a kid now ('+(GA/m).toFixed(2)+'/min; was ~0.07)');
 assert(GF/m>=.2,'7v7: the kid side still scores ('+(GF/m).toFixed(2)+'/min)');assert(T/m>=5.3,'7v7: kid touches '+(T/m).toFixed(2)+'/min');}

// ---- 7. Wiring (all gated on a human) ----
{const ms=fs.readFileSync('lib/town/match/matchSim.ts','utf8');
 assert.match(ms,/const contest = this\.humans\.size && !this\.humans\.has\(claimer\)/,'the contest only reads with a human joined');
 assert.match(ms,/if \(this\.humans\.size\) \{ const ck = this\.chaseK\(from\.team\)/,'the chase finish only reads with a human joined');
 assert.match(ms,/if \(this\.humans\.size && this\.humanChase\.counter > 0 && this\.possession === t/,'the chase counter phase only with a human joined');}

console.log('PASS live balance (Tier 2): AI-only unchanged, chase only on a human lead (7v7 / 9v9 from level), contest near a human, give-and-go, 11v11 pace + lunge under the pose limit, 7v7 kid band');
