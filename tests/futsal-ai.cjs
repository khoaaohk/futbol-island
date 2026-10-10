// Futsal AI on the Palm Coast Rooftop (lib/town/match/futsalAI.ts + the futsal knobs in formatAI.ts, used by matchSim.ts):
// the FIFA Futsal laws the live match now plays (5 m at kick-ins and corners, the keeper's back-pass rule, the thrown goal
// clearance), its coaching habits (man-oriented marking, the extra pass, no speculative long shots through a defender),
// the balance band, the zero-allocation steering targets, and that the knobs stay neutral in every other format.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map(),ctx=new Proxy({measureText:text=>({width:text.length*20}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={innerHeight:800,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Math,Number,document,window,console,performance,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const F=load('lib/town/match/futsalAI.ts'),A=load('lib/town/match/formatAI.ts'),{MatchSim}=load('lib/town/match/matchSim.ts'),V=load('lib/town/venues.ts');
const DT=1/30,FUT=V.liveVenueById('futsal'),W=FUT.width,L=FUT.length;

// ---- 1. Pure helpers ----
{const out={x:0,y:0};
 // a defender 2 m from a kick-in spot on the left touchline is moved to just beyond 5 m, inside the pitch
 const sx=16,sy=200,x=sx+2*250/W,y=sy;
 assert.equal(F.ringPush(out,x,y,sx,sy,5,W,L),true);
 const m=F.metresBetween(out.x,out.y,sx,sy,W,L);assert(m>=5&&m<5.6,'pushed to the 5 m ring ('+m.toFixed(2)+' m)');
 assert(out.x>=14&&out.x<=256&&out.y>=12&&out.y<=388,'stays on the pitch');
 // already 6 m away: untouched
 assert.equal(F.ringPush(out,sx+6*250/W,sy,sx,sy,5,W,L),false);assert.equal(out.x,sx+6*250/W);
 // standing on the spot: steps toward the middle
 F.ringPush(out,sx,sy,sx,sy,5,W,L);assert(out.x>sx&&F.metresBetween(out.x,out.y,sx,sy,W,L)>=5,'off the spot, infield');
 // a corner spot: the clamp can never leave him inside the ring
 for(const [px,py] of [[18,16],[20,14],[30,30],[14,40]]){F.ringPush(out,px,py,18,14,5,W,L);assert(F.metresBetween(out.x,out.y,18,14,W,L)>=4.99,`corner ring from ${px},${py}`);}
 // marking spot: goal-side (nearer the defended goal than the attacker) and shaded toward the ball
 const gy=392;F.markSpot(out,100,250,gy,100,240,9,.35);assert(out.y>250&&Math.abs(out.x-100)<6,'touch-tight and goal-side next to the ball');
 F.markSpot(out,230,200,gy,40,200,9,.35);assert(out.x<230-20,'far from the ball the marker sags inside to help');assert(out.y>200,'still goal-side');
 // assignment: one attacker each, cheapest first, sticky
 const res=[-1,-1,-1],used=[false,false,false];
 F.assignMarks([0,100,200],[0,0,0],3,[205,95,5],[0,0,0],3,[-1,-1,-1],0,res,used);assert.deepEqual(res,[2,1,0]);
 F.assignMarks([0,100],[0,0],2,[60,40],[0,0],2,[0,1],30,res,used);assert.deepEqual(res.slice(0,2),[0,1],'a current pairing survives a small advantage elsewhere');
 F.assignMarks([0,100],[0,0],2,[60,40],[0,0],2,[-1,-1],30,res,used);assert.deepEqual(res.slice(0,2),[1,0],'without history the nearest pairs win');
 F.assignMarks([0,100,200],[0,0,0],3,[10],[0],1,[-1,-1,-1],0,res,used);assert.deepEqual(res,[0,-1,-1],'spare defenders stay free');
 // chance quality falls with range and angle; the extra pass needs a clearly better chance
 assert(F.chanceQuality(135,40,8)>F.chanceQuality(135,140,8));assert(F.chanceQuality(135,60,8)>F.chanceQuality(215,60,8));
 assert.equal(F.isBetterChance(.05,.06,1.35),false);assert.equal(F.isBetterChance(.05,.12,1.35),true);assert.equal(F.isBetterChance(.2,.25,1.35),false);
 assert.equal(F.laneFactor(0),1);assert(F.laneFactor(2)<F.laneFactor(1));}

// ---- 2. Knobs: futsal opts in, every other format stays neutral ----
{const f=A.formatAI('futsal');
 assert.equal(f.restartRing,F.FUTSAL_RING_M);assert.equal(f.keeperBackPass,true);assert.equal(f.goalClearance,true);
 assert(f.manMark>0&&f.manMark<=1&&f.extraPass>0&&f.shotPatience>0&&f.shotPatience<1);
 assert.equal(f.teach,false,'futsal narrates its own laws, not the 9v9 lines (throw-ins, offside)');
 for(const fmt of ['7v7','9v9','11v11','beach']){const n=A.formatAI(fmt);assert.equal(n.restartRing,0,fmt);assert.equal(n.keeperBackPass,false,fmt);assert.equal(n.goalClearance,false,fmt);assert.equal(n.manMark,0,fmt);assert.equal(n.extraPass,0,fmt);assert.equal(n.shotPatience,0,fmt);}}

// ---- 3. The live futsal match plays the laws ----
const P=MatchSim.prototype,doPass=P.doPass;let backPasses=0;
P.doPass=function(from,to,firm){const t=this.players[to],f=this.players[from];if(t.isGK&&!f.isGK&&this.gkPlayed[t.team]&&this.ai.keeperBackPass)backPasses++;return doPass.call(this,from,to,firm);};
const T={games:0,goals:{gold:0,blue:0},shots:0,kickins:0,kickinClose:0,clearances:0,notes:new Set(),marked:0,markFrames:0,dupMarks:0,oob:0,extra:0,ring:0};
for(let g=0;g<10;g++){
 const sim=new MatchSim(300+g*13,'futsal');T.games++;let restart=null,lastMsg='',noteSerial=0;const target0=sim.targets;let firstTarget=null;
 for(let i=0;i<180/DT;i++){
  sim.step(DT);
  if(sim.note.serial!==noteSerial){noteSerial=sim.note.serial;T.notes.add(sim.note.text.replace(/ for (Gold|Blue)$/,''));}
  if(i===30)firstTarget=sim.targets[sim.ids[1]];
  const r=sim.restart;
  if(r&&!r.carry)restart={kind:r.kind,x:r.x,y:r.y,team:sim.players[r.taker].team,t:r.t};
  else if(restart&&!r){
   if(restart.kind==='kickin'||restart.kind==='corner'){T.kickins++;
    if(restart.t>=-3)for(const id of sim.ids){const p=sim.players[id];if(p.team!==restart.team&&!p.isGK&&F.metresBetween(p.x,p.y,restart.x,restart.y,W,L)<4)T.kickinClose++;}}
   restart=null;}
  if(sim.restart?.kind==='goalkick'&&sim.msg!==lastMsg){lastMsg=sim.msg;if(sim.msg==='Goal clearance')T.clearances++;else assert.fail('futsal restarts from the keeper with a goal clearance, not "'+sim.msg+'"');}
  if(!sim.restart)lastMsg='';
  // marking: while a team defends a carrier, its outfielders (bar the presser) each have their own attacker
  if(i%15===0&&sim.ball.owner&&!sim.restart&&sim.goalHold<=0){
   const att=sim.players[sim.ball.owner].team,def=att==='gold'?'blue':'gold',seen=new Set();T.markFrames++;
   for(const id of att==='gold'?sim.goldIds:sim.blueIds)assert(!sim.markOf[id],'the attacking side marks nobody');
   for(const id of def==='gold'?sim.goldIds:sim.blueIds){const m=sim.markOf[id];if(!m)continue;T.marked++;assert.equal(sim.players[m].team,att,'a marker marks an attacker');assert(!sim.players[m].isGK,'nobody marks the keeper');if(seen.has(m))T.dupMarks++;seen.add(m);}
  }
  for(const id of sim.ids){const p=sim.players[id];if(!(p.x>=8&&p.x<=262&&p.y>=4&&p.y<=396))T.oob++;}
 }
 assert.equal(sim.targets[sim.ids[1]],firstTarget,'steering targets are reused objects (no per-frame allocation)');void target0;
 T.goals.gold+=sim.score.gold;T.goals.blue+=sim.score.blue;T.shots+=sim.stats.shots;T.extra+=sim.futsalStats.extraPasses;T.ring+=sim.futsalStats.ringPushes;
}
P.doPass=doPass;
assert.equal(backPasses,0,'no team-mate passes back to a keeper who already released it (futsal Law 12)');
assert(T.kickins>=8,'kick-ins happen ('+T.kickins+')');assert.equal(T.kickinClose,0,'opponents stand ~5 m away when a kick-in or corner is taken');
assert(T.ring>0,'the 5 m ring moved defenders back');
assert(T.clearances>0,'goal clearances happen');
assert(T.markFrames>100&&T.marked/T.markFrames>=1.5,'defenders pick up attackers ('+(T.marked/T.markFrames).toFixed(2)+' per frame)');assert.equal(T.dupMarks,0,'never two markers on one attacker');
assert.equal(T.oob,0,'nobody leaves the court');
assert(T.notes.has('Kick-in')&&T.notes.has('Goal clearance')&&T.notes.has('Pick up your player'),'the feed teaches the futsal laws: '+[...T.notes].join(' | '));
assert(![...T.notes].some(n=>/Throw-in|Offside|Onside/.test(n)),'no 9v9 lines on the futsal court');
const gpg=(T.goals.gold+T.goals.blue)/T.games;assert(gpg>=3&&gpg<=7,'goals per 3-minute game stay in the lively band ('+gpg+')');
assert(T.goals.gold>0&&T.goals.blue>0,'both teams score');assert(T.shots/T.games>=15,'plenty of shots ('+T.shots/T.games+')');

// ---- 4. Determinism, and the other formats never mark man-to-man or push a 5 m ring ----
{const a=new MatchSim(77,'futsal'),b=new MatchSim(77,'futsal');for(let i=0;i<1800;i++){a.step(DT);b.step(DT);}
 assert.deepEqual(a.score,b.score);assert.equal(a.ball.x,b.ball.x);assert.equal(JSON.stringify(a.futsalStats),JSON.stringify(b.futsalStats));
 for(const fmt of ['7v7','9v9','11v11','beach']){const s=new MatchSim(5,fmt);for(let i=0;i<1800;i++)s.step(DT);
  assert(Object.values(s.markOf).every(v=>!v),fmt+' keeps its zonal block');assert.equal(JSON.stringify(s.futsalStats),JSON.stringify({ringPushes:0,backPassBlocked:0,extraPasses:0,markSwitches:0}),fmt);}}

console.log('PASS futsal AI: 5 m kick-in ring, keeper back-pass rule, goal clearance, man-oriented marking, extra pass, futsal feed, balance band ('+gpg.toFixed(1)+' goals / 3 min, '+(T.shots/T.games).toFixed(1)+' shots), other formats neutral, reused targets');
