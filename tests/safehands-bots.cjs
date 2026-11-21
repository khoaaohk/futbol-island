// Safe Hands bots (Nov 21 2026, docs/arcade-aaa/safehands-direction.md "Bot numbers"). The bots only use what a player can see
// (g.tells(): the planted foot, the lean, the wind-up; the cross's landing spot; the wall's place), so their results are the game's
// fairness and difficulty evidence:
//   oracle  = perfect position, acts 0.20 s after the planted foot: must save EVERY shot at every tier (a save was always possible).
//   reader  = "reads tells": good position, acts 0.25 s after the planted foot: saves most at every tier.
//   random  = random position, random action at a random time: saves few at every tier.
//   careful / mid / expert = human-like players (slower hands, some wrong reads, some wrong calls): the tuning targets.
//   node tests/safehands-bots.cjs [--bots]   (--bots prints the table the direction doc quotes)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/safehands/core.ts'),{SH,TIERS,STRIKERS}=C,PRINT=process.argv.includes('--bots'),MAIN=require.main===module;
const rng=seed=>{let a=seed>>>0||1;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};

/** react: seconds from seeing the planted foot to moving. pos: standing error (m). side / height: chance of a wrong read.
 *  call: chance of the right decision (wall size, cross). smother: dives on a heavy touch. habit: dives early on a known favourite. */
const BOTS={
 oracle:{react:.2,pos:0,side:0,height:0,call:1,smother:true,habit:false},
 reader:{react:.25,pos:.15,side:0,height:0,call:1,smother:true,habit:false},
 expert:{react:.3,pos:.25,side:.03,height:.06,call:.92,smother:true,habit:true},
 mid:{react:.4,pos:.5,side:.1,height:.18,call:.72,smother:false,habit:false},
 careful:{react:.5,pos:.7,side:.14,height:.26,call:.6,smother:false,habit:false},
 random:{random:true},
};
const ACTS=[null,'L','R','LH','RH','up'];
/** Plays one run. Returns the core's stats plus per-tier shots / saves / goals and the simulated seconds (tip cards count 3 s each). */
function play(seed,botName,opts={}){
 const bot=BOTS[botName],r=rng(seed*7919+botName.length*104729),g=C.createSafeHands({seed,daily:opts.daily,startTier:opts.startTier,lives:opts.lives});
 const tiers=TIERS.map(()=>({shots:0,saves:0,goals:0,cleared:false})),byKind={};let secs=0,mem={sh:null},guard=0,unsavable=[];
 const s=g.state,dt=1/60;
 while(!s.over&&guard++<60*60*20){
  if(s.phase==='tip'){g.ack();secs+=3;g.drain(()=>{});continue;}
  const sh=s.shot;
  if(sh&&sh!==mem.sh)mem={sh,ex:(r()*2-1)*(bot.pos??0),randX:(r()*2-1)*3,randD:r(),actAt:r(),act:ACTS[Math.floor(r()*ACTS.length)],e1:r(),e2:r(),right:r()<(bot.call??0),seen:null,done:false,runT:0,dec:['claim','punch','stay'][Math.floor(r()*3)]};
  if(sh&&s.phase==='wall'&&s.pt>.8)g.wall(bot.random?2+Math.floor(r()*3):mem.right?sh.wallBest:sh.wallBest===4?3:sh.wallBest+1);
  if(sh&&(s.phase==='set'||s.phase==='cross')){
   if(bot.random)g.move(mem.randX,mem.randD*sh.dmax);
   else{const d=sh.kind==='far'?2.5:sh.kind==='one'?sh.bz-5:sh.kind==='cross'?1:0,id=C.idealFor(sh,s.kd,g.strikerZ());g.move(id.x+mem.ex,Math.max(0,d-(bot.pos>.4&&sh.kind!=='one'?1:0)));
    const loose=g.looseBall();if(bot.smother&&loose&&loose.z-s.kd<=SH.smother-.4&&Math.abs(loose.x-s.kx)<2)g.act('down');}
  }
  if(sh&&s.phase==='cross'&&!s.decision&&s.pt>(bot.react??.3)+.35)g.choose(bot.random?mem.dec:mem.right?(sh.closeIn?(sh.crowd?'punch':'claim'):'stay'):(sh.closeIn?'stay':'claim'));
  if(sh&&(s.phase==='run'||s.phase==='fly')&&!s.act&&!mem.done){mem.runT+=dt;
   if(bot.random){if(mem.runT>=mem.actAt*(sh.runSecs+sh.stutter+sh.flight*.7)){mem.done=true;if(mem.act)g.act(mem.act);}}
   else{const tl=g.tells(),st=STRIKERS[sh.striker],wet=sh.wet;let seeSide=null,seeHigh=false,seePower=.5;
    if(tl.plant){if(mem.seen==null)mem.seen=s.t;seeSide=tl.plant.side;seeHigh=tl.plant.high;seePower=tl.plant.power;}
    else if(tl.hidden&&s.phase==='fly'){if(mem.seen==null)mem.seen=s.t;seeSide=sh.side;seeHigh=sh.high;seePower=sh.power;}// the view was blocked: he reacts to the ball itself
    else if(bot.habit&&st.fav&&sh.long&&!st.watcher&&s.phase==='run'&&s.pt>sh.runSecs*.55&&(sh.kind==='pen'||sh.kind==='far')){seeSide=st.fav.side;seeHigh=st.fav.high;seePower=st.power+.1;mem.seen=-9;}// a long run-up from a striker he knows
    if(seeSide!=null&&s.t>=mem.seen+bot.react){mem.done=true;
     /* labelled tells (aid 2) are hard to misread; with no aid and a short window wrong reads are more common */const k=[1.5,.9,.3][TIERS[s.tier].aid];mem.sideErr=mem.e1<(bot.side??0)*k;mem.heightErr=mem.e2<(bot.height??0)*k;let side=seeSide,high=seeHigh;if(mem.sideErr)side=side===0?(r()<.5?-1:1):-side;if(mem.heightErr)high=!high;
     const hard=seePower>(wet?SH.holdWet:SH.hold),a=side===0?(hard?(high?'up':'L'):null):(side<0?'L':'R')+(high?'H':'');if(a)g.act(a);}}
  }
  g.advance(dt);secs+=dt;
  g.drain(e=>{const T=tiers[s.tier];
   if(e.type==='attack'&&e.word!=='head'&&e.word!=='reb'){T.shots++;byKind[e.word]??={shots:0,saves:0};byKind[e.word].shots++;}
   if(e.type==='save'){T.saves++;const k=mem.sh.kind==='head'?'cross':mem.sh.kind;if(byKind[k])byKind[k].saves++;}
   if(e.type==='goal'){T.goals++;if(botName==='oracle')unsavable.push(`${mem.sh.kind} tier ${s.tier} seed ${seed}: ${e.word}`);}
   if(e.type==='clear')tiers[e.a].cleared=true;});
 }
 assert.ok(s.over,`the run ends (${botName}, seed ${seed})`);
 return {score:s.score,won:s.won,tier:s.tier,lives:s.lives,stats:s.stats,feats:s.feats,tiers,byKind,secs,unsavable,dailySaves:s.dailySaves};
}
/** Many runs: save rate per tier with endless lives (the pure difficulty of each tier), and real runs (3 lives) for how far a bot gets. */
function measure(botName,n=120){
 const rate=TIERS.map(()=>({shots:0,saves:0}));for(let i=0;i<n;i++){const o=play(1000+i*37,botName,{lives:99});o.tiers.forEach((t,k)=>{rate[k].shots+=t.saves+t.goals;rate[k].saves+=t.saves;});}
 const reach=[0,0,0,0,0];let score=0,secs=0;const scores=[];for(let i=0;i<n;i++){const o=play(5000+i*53,botName);const cleared=o.tiers.filter(t=>t.cleared).length;reach[cleared]++;score+=o.score;secs+=o.secs;scores.push(o.score);}
 scores.sort((a,b)=>a-b);
 return {save:rate.map(x=>x.shots?x.saves/x.shots:0),cleared:reach.map(x=>x/n),score:Math.round(score/n),p90:scores[Math.floor(n*.9)],max:scores[n-1],secs:Math.round(secs/n)};
}
module.exports={play,measure,BOTS};

if(MAIN){
 const pct=v=>`${Math.round(v*100)}%`.padStart(4),res={};
 for(const b of Object.keys(BOTS))res[b]=measure(b,b==='oracle'?200:120);
 if(PRINT){console.log('bot      | saves per tier (endless lives)      | rounds cleared in a real run: 0 1 2 3 4(cup) | mean score  p90   max | secs');
  for(const [b,m] of Object.entries(res))console.log(`${b.padEnd(8)} | ${m.save.map((v,i)=>`${TIERS[i].id} ${pct(v)}`).join('  ')} | ${m.cleared.map(pct).join(' ')} | ${String(m.score).padStart(6)} ${String(m.p90).padStart(6)} ${String(m.max).padStart(6)} | ${m.secs}`);}
 // fairness: with the right read every shot can be saved, at every tier, in the career and in the Daily Shootout
 for(let i=0;i<200;i++){const o=play(1000+i*37,'oracle',{lives:99});assert.deepEqual(o.unsavable,[],'the oracle saves every shot');assert.equal(o.stats.goals,0);}
 for(let i=0;i<60;i++){const o=play(C.safehandsDailySeed(`2026-12-${String(1+i%28).padStart(2,'0')}`)+i,'oracle',{daily:true});assert.equal(o.dailySaves,SH.dailyShots,'the oracle saves all five of a Daily Shootout');}
 res.reader.save.forEach((v,i)=>assert.ok(v>=.8,`the tell-reading bot saves most at ${TIERS[i].name}: ${pct(v)}`));
 res.random.save.forEach((v,i)=>assert.ok(v<=.3,`the random bot saves few at ${TIERS[i].name}: ${pct(v)}`));
 res.reader.save.forEach((v,i)=>assert.ok(v-res.random.save[i]>=.5,`reading beats guessing at ${TIERS[i].name}`));
 // the ramp: each human-like bot saves less at each tier, and better bots get further
 for(const b of ['careful','mid'])for(let i=1;i<TIERS.length;i++)assert.ok(res[b].save[i]<res[b].save[i-1]+.03,`${b}: ${TIERS[i].name} is not easier than ${TIERS[i-1].name}`);
 const got=(b,k)=>res[b].cleared.slice(k).reduce((a,x)=>a+x,0);
 assert.ok(got('careful',1)>=.7,`a careful first-time player clears Sunday league most of the time: ${pct(got('careful',1))}`);
 assert.ok(got('mid',2)>=.5&&got('mid',4)<=.25,`a mid player gets past the Academy and usually stops before the cup: ${pct(got('mid',2))} / ${pct(got('mid',4))}`);
 assert.ok(got('expert',4)>=.25&&got('expert',4)<=.9,`the Cup final is hard but can be won: expert wins ${pct(got('expert',4))}`);
 assert.ok(got('random',1)<=.1,'guessing does not clear Sunday league');
 for(const b of ['careful','mid','expert'])assert.ok(res[b].secs>=60&&res[b].secs<=260,`${b}: a run lasts one to four minutes (${res[b].secs} s)`);
 assert.ok(res.expert.max<SH.scoreMax,'the board ceiling is above the best bot');
 console.log('safehands-bots: ok');
}
