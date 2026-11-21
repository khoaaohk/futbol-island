// Hold the Line bots (Nov 21 2026, docs/arcade-aaa/holdtheline-direction.md "Bot numbers"). The bots only use what a player can see
// (g.look(): the passer's wind-up, a heavy touch, a passer who waits, a ball going wide, a passer far back in his own half), so their
// results are the game's fairness and difficulty evidence:
//   ideal   = reads every attack and answers 0.20 s later (step / drop / slide / press): must concede almost nothing in every match.
//   late    = the same reads, but steps just AFTER the ball is played: beaten in behind.
//   drop    = always drops to the edge of its own box: concedes long shots and never wins the ball itself.
//   random  = random drags and presses: loses.
//   careful / mid / expert = human-like players (slower thumbs, some missed reads, some bad presses): the tuning targets.
//   node tests/holdtheline-bots.cjs [--bots]   (--bots prints the table the direction doc quotes)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/holdtheline/core.ts'),{HL,TEAMS}=C,PRINT=process.argv.includes('--bots'),MAIN=require.main===module;
const rng=seed=>{let a=seed>>>0||1;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};

/** react: seconds from seeing a thing to answering (+ up to `jitter`). miss: chance of not answering a read at all.
 *  press: chance of pressing a heavy touch / a waiting passer. badPress: chance per wave of pressing a plain pass. */
const BOTS={
 ideal:{react:.2,jitter:0,miss:0,press:1,badPress:0},
 late:{react:.2,jitter:0,miss:0,press:1,badPress:0,late:true},
 expert:{react:.3,jitter:.1,miss:.03,press:.9,badPress:0},
 mid:{react:.4,jitter:.18,miss:.09,press:.6,badPress:.06},
 careful:{react:.5,jitter:.22,miss:.11,press:.4,badPress:.04},
 drop:{drop:true},
 random:{random:true},
};

/** One match by a bot. Returns the result and how long it took (seconds of play). */
function play(seed,name,o={}){
 const bot=BOTS[name],g=C.createHoldTheLine({seed,league:o.league??0,match:o.match??0,daily:!!o.daily}),s=g.state,hard=Math.pow(1.05/g.tn.W,2.4),/* less time to read = more missed reads */r=rng(seed*31+name.length*7+(o.league??0)*101+(o.match??0)*13),dt=1/60;
 g.ack();let secs=0,wave=-1,seen='',due=-1,act=null,pressed=false,bad=-1,nextRand=0;const kinds=[];
 while(!s.over&&secs<600){
  if(s.wave!==wave){wave=s.wave;seen='';due=-1;act=null;pressed=false;bad=bot.badPress&&r()<bot.badPress?s.t+.6+r()*1.2:-1;}
  const L=g.look();
  if(bot.random){if(s.t>=nextRand){nextRand=s.t+.3+r()*.7;g.move(HL.minY+r()*(HL.maxY-HL.minY),(r()*2-1)*HL.maxX);if(r()<.25)g.press(Math.floor(r()*g.backs));}}
  else if(bot.drop){g.move(HL.minY,0);}
  else if(L.play){
   // one thing is "seen" at a time; the answer comes `react` later
   const tag=L.tell?'tell:'+L.tell.kind:L.wide?'wide:'+L.wide:L.heavy?'heavy':L.waiting?'waiting':L.deepPasser?'deep':'';
   if(tag&&tag!==seen){seen=tag;const skip=r()<bot.miss*hard;due=skip?-1:s.t+bot.react+r()*bot.jitter+(bot.late&&L.tell&&(L.tell.kind==='thru'||L.tell.kind==='feet')?L.tell.W-bot.react+.08:0);
    act=L.tell?(L.tell.kind==='thru'||L.tell.kind==='feet'?'step':L.tell.kind==='long'?'drop':'press'):L.wide?['slide',L.wide]:(L.heavy||L.waiting)?(r()<bot.press?'press':L.waiting?'sit':null):'drop';if(!act)due=-1;}
   if(bad>0&&s.t>=bad&&!pressed){bad=-1;g.press(g.nearest());}
  }
  if(!bot.random&&!bot.drop&&due>0&&s.t>=due&&(s.phase==='play'||s.phase==='res')){due=-1;
   if(act==='step')g.move(s.lineY+2.6,s.wantX);else if(act==='drop')g.move(Math.min(s.wantY,15.5),s.wantX);else if(act==='sit')g.move(Math.min(s.wantY,HL.shotLine-.5),s.wantX);
   else if(act==='press'){if(g.press(g.nearest()))pressed=true;}else if(Array.isArray(act))g.move(s.wantY,act[1]*HL.maxX);}
  g.advance(dt);secs+=dt;g.drain(e=>{if(e.type==='wave')kinds.push(e.word);});
 }
 return {won:s.won,goals:s.goals,stops:s.stops,score:s.score,stars:s.stars,secs,stats:{...s.stats},kinds,log:s.log};
}
/** N matches by a bot against one team: win rate, goals a match, stops, mean score, clean sheets, seconds. */
function table(name,o,N=60){let won=0,goals=0,stops=0,score=0,clean=0,secs=0,own=0;
 for(let i=0;i<N;i++){const p=play(1000+i*17,name,o);won+=p.won?1:0;goals+=p.goals;stops+=p.stops;score+=p.score;clean+=p.goals===0&&p.won?1:0;secs+=p.secs;own+=p.stats.offsides+p.stats.tackles+p.stats.blocks+p.stats.slides+p.stats.swept;}
 return {won:won/N,goals:goals/N,stops:stops/N,score:score/N,clean:clean/N,secs:secs/N,own:own/N};}
/** A season played in order by a bot: how many matches it wins before the first loss (three tries a match). */
function season(name,league,seed){let m=0;for(;m<TEAMS.length;m++){let ok=false;for(let k=0;k<3&&!ok;k++)ok=play(seed+m*7+k*131,name,{league,match:m}).won;if(!ok)break;}return m;}

if(MAIN){
 const pct=v=>(v*100).toFixed(0)+'%';
 // fairness: the ideal bot concedes almost nothing in every match of both leagues and on the daily; every wave it faces ends in a stop
 for(let league=0;league<2;league++)for(let m=0;m<TEAMS.length;m++){const t=table('ideal',{league,match:m},20);assert.ok(t.goals<=.05,`ideal vs ${TEAMS[m].name} league ${league}: ${t.goals} goals a match`);assert.equal(t.won,1);}
 {const t=table('ideal',{daily:true},30);assert.ok(t.goals<=.05&&t.won===1,'ideal on the daily');}
 for(let league=0;league<2;league++){
  const avg=name=>{const a={won:0,goals:0,stops:0,score:0,clean:0,secs:0,own:0};for(let m=0;m<TEAMS.length;m++){const t=table(name,{league,match:m},league?24:24);for(const k of Object.keys(a))a[k]+=t[k]/TEAMS.length;}return a;};
  const I=avg('ideal'),La=avg('late'),D=avg('drop'),R=avg('random'),E=avg('expert'),M=avg('mid'),Ca=avg('careful');
  assert.ok(La.goals>=1.7&&La.won<.5,`late is beaten in behind (league ${league}: ${La.goals.toFixed(1)} goals, wins ${pct(La.won)})`);
  assert.ok(D.goals>=1.7&&D.won<.4,`always-drop concedes long shots (league ${league}: ${D.goals.toFixed(1)} goals, wins ${pct(D.won)})`);assert.ok(D.own<=1.5,`always-drop hardly ever wins the ball itself (${D.own.toFixed(2)} a match)`);
  assert.ok(R.won<.25&&R.goals>=1.7,`random loses (league ${league}: wins ${pct(R.won)})`);
  assert.ok(E.won>M.won&&M.won>=Ca.won-.05,'better players win more');
  if(PRINT){console.log(`league ${league} (${C.LEAGUES[league].name}): bot | wins | goals a match | stops | clean sheets | mean score | match secs`);
   for(const [n,t] of [['ideal',I],['expert',E],['mid',M],['careful',Ca],['late',La],['drop',D],['random',R]])console.log(` ${n.padEnd(8)}| ${pct(t.won).padStart(4)} | ${t.goals.toFixed(2)} | ${t.stops.toFixed(1)} | ${pct(t.clean).padStart(4)} | ${Math.round(t.score)} | ${Math.round(t.secs)}`);
   for(const n of ['careful','mid','expert']){const per=TEAMS.map((_,m)=>pct(table(n,{league,match:m},30).won));console.log(` ${n} wins by match: ${per.join(' ')}`);}
   for(const n of ['careful','mid','expert']){let sum=0;const N=30;for(let i=0;i<N;i++)sum+=season(n,league,5000+i*977);console.log(` ${n}: matches won in a row from the start (3 tries each): ${(sum/N).toFixed(1)} of ${TEAMS.length}`);}}
 }
 // tuning targets: a careful first-timer wins the first match; a mid player gets through about half the Coast League
 {const c=table('careful',{league:0,match:0},80);assert.ok(c.won>=.75,`a careful first-timer wins the first match most of the time (${pct(c.won)})`);
  const t=table('ideal',{league:0,match:0},20);assert.ok(t.secs>=90&&t.secs<=200,`a match lasts 1.5 to 3.3 minutes of play (${Math.round(t.secs)} s)`);}
 if(PRINT){const d=n=>{const t=table(n,{daily:true},60);return `${n} ${pct(t.won)} wins, ${t.goals.toFixed(2)} goals`;};console.log('Match of the Day: '+['ideal','expert','mid','careful','random'].map(d).join(' | '));}
 console.log('holdtheline-bots: ok');
}
module.exports={play,table,season,BOTS};
