// Keepy-Uppy Beat bots (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md "Bot numbers"). The bots press the pads at song times,
// exactly as the shell does, so their results are the game's fairness and difficulty evidence:
//   perfect = every touch on the beat, every swipe and stall done: must be a FULL COMBO with three stars on every track, both feet.
//   expert / mid / careful = human-like thumbs: a timing error of about +-22 / +-40 / +-70 ms (bell-shaped), some missed balls (more when touches
//             come fast or on the weak foot), some wrong pads, some failed swipes and short stalls: the tuning targets.
//   masher  = taps every pad five times a second: must not earn stars.
//   node tests/keepyuppy-bots.cjs [--bots]   (--bots prints the table the direction doc quotes)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/keepyuppy/core.ts'),{TRACKS}=require('../lib/arcade/keepyuppy/charts.ts'),{KU}=C;
const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};
/** a bell-shaped error, about +-1 (never past +-2.5) */
const gauss=r=>Math.max(-2.5,Math.min(2.5,Math.sqrt(-2*Math.log(1-r()))*Math.cos(2*Math.PI*r())));
/** jitter: the usual timing error in seconds (one standard deviation). miss: chance to leave a ball. fast / faster: extra chance when the last touch was under 0.32 / 0.24 s ago.
 *  weak: extra on the weak foot. wrong: chance to hit another pad. swipe / hold: chance to fail the trick's gesture. */
const BOTS={
 perfect:{jitter:0,miss:0,fast:0,faster:0,weak:0,wrong:0,swipe:0,hold:0},
 expert:{jitter:.022,miss:.003,fast:.004,faster:.015,weak:.004,wrong:.002,swipe:.02,hold:.01},
 mid:{jitter:.04,miss:.012,fast:.03,faster:.09,weak:.015,wrong:.01,swipe:.07,hold:.04},
 careful:{jitter:.07,miss:.04,fast:.06,faster:.14,weak:.03,wrong:.03,swipe:.2,hold:.12},
};
/** Plays one track. Returns the run's numbers. */
function play(track,bot='perfect',seed=1,o={}){
 const g=C.createKeepy({track,strong:o.strong??'R',twist:o.twist??'',lesson:o.lesson,calib:o.calib}),N=g.chart.notes,r=rng(seed*7919+track*31+1),acts=[];
 if(bot==='masher'){for(let t=g.chart.start;t<g.chart.end;t+=.2)for(let l=0;l<4;l++)acts.push({t:t+l*.01,kind:'press',lane:l});}
 else{const b=BOTS[bot];N.forEach((n,i)=>{const prev=N[i-1],gap=prev?n.t-(prev.kind==='hold'?prev.tEnd:prev.t):9;
  const pMiss=b.miss+(gap<.24?b.faster:gap<.32?b.fast:0)+(n.part==='W'?b.weak:0);if(r()<pMiss)return;
  const t=n.t+gauss(r)*b.jitter*(n.part==='W'?1.25:1);
  if(r()<b.wrong){acts.push({t,kind:'press',lane:(n.lane+1+Math.floor(r()*3))%4});return;}
  acts.push({t,kind:'press',lane:n.lane});
  if(n.kind==='swipe'){if(r()>=b.swipe)acts.push({t:t+.09,kind:'swipe',lane:n.lane,dir:n.dir});}
  if(n.kind==='hold')acts.push({t:r()<b.hold?n.t+(n.tEnd-n.t)*.5:n.tEnd+.06,kind:'release',lane:n.lane});});}
 acts.sort((a,b)=>a.t-b.t);let k=0;const ev=[];
 for(let t=g.chart.start;!g.state.over;t+=1/120){while(k<acts.length&&acts[k].t<=t){const a=acts[k++];if(a.kind==='press')g.press(a.lane,a.t);else if(a.kind==='swipe')g.swipe(a.lane,a.dir,a.t);else g.release(a.lane,a.t);}g.advance(t);g.drain(e=>ev.push(e));if(t>g.chart.end+5)throw new Error('the run never ended');}
 const s=g.state;return {score:s.score,stars:g.stars(),acc:Math.round(g.accuracy()*100),weak:g.weakScore(),out:s.out,bestCombo:s.bestCombo,counts:{...s.counts},notes:N.length,secs:g.chart.end-g.chart.start,tricks:{...s.tricks},feats:g.feats(false),events:ev,lives:s.lives,stray:s.stray};
}
/** n seeded runs of one bot on one track */
function many(track,bot,n=120,o={}){let fin=0,acc=0,score=0;const stars=[0,0,0,0];for(let i=1;i<=n;i++){const p=play(track,bot,i,o);if(!p.out)fin++;acc+=p.acc;score+=p.score;stars[p.stars]++;}
 return {finish:fin/n,acc:acc/n,score:score/n,stars:stars.map(v=>v/n),meanStars:(stars[1]+2*stars[2]+3*stars[3])/n};}
let n=0;const TABLE=require.main===module&&process.argv.includes('--bots'),ok=(name,fn)=>{try{fn();n++;}catch(e){if(!TABLE)throw e;console.log('FAIL '+name+': '+e.message);}};

ok('perfect bot: a full combo and three stars on every track, either foot (every ball can be played)',()=>{
 TRACKS.forEach((tr,i)=>{for(const strong of ['L','R']){const p=play(i,'perfect',1,{strong});assert.equal(p.out,false);assert.equal(p.counts.sweet,p.notes,`${tr.id} ${strong}: every touch Sweet`);assert.equal(p.bestCombo,p.notes,`${tr.id}: full combo`);assert.equal(p.stars,3);assert.equal(p.acc,100);assert.equal(p.lives,tr.balls);assert.ok(p.feats.includes('full'));}});
 for(const d of C.DAILY_POOL){const p=play(d.track,'perfect',1,{twist:d.twist,strong:'L'});assert.equal(p.bestCombo,p.notes,`daily ${TRACKS[d.track].id} + ${d.twist}`);assert.equal(p.stars,3);}});
ok('determinism: the same thumbs give the same run',()=>{for(const b of ['mid','careful'])for(const i of [0,3,5]){const a=play(i,b,5),c=play(i,b,5);delete a.events;delete c.events;assert.deepEqual(a,c);}assert.notEqual(play(5,'mid',5).score,play(5,'mid',6).score);});
ok('difficulty: track 1 is kind, the last track is hard but can be done',()=>{
 const t=(i,b)=>many(i,b,100),last=TRACKS.length-1;
 {const c=t(0,'careful');assert.ok(c.finish>=.84,`a careful first-timer finishes track 1 (${c.finish})`);assert.ok(c.stars[0]<=.16,`and nearly always with a star (${c.stars})`);}
 {const m0=t(0,'mid'),m1=t(1,'mid'),m2=t(2,'mid'),m3=t(3,'mid'),mL=t(last,'mid');assert.ok(m0.stars[3]>=.9&&m1.stars[3]>=.9,`a mid player three-stars tracks 1-2 (${m0.stars[3]}, ${m1.stars[3]})`);
  assert.ok(m2.finish>=.9&&m3.finish>=.86,`and passes 3-4 (${m2.finish}, ${m3.finish})`);assert.ok(mL.meanStars<m0.meanStars-.4&&mL.finish<=.9,`and struggles on the last (${mL.stars})`);assert.ok(mL.finish>=.5,`but it is fair: the mid bot finishes it ${mL.finish}`);}
 {const e=t(last,'expert');assert.ok(e.finish>=.95&&e.stars[3]>=.9,`an expert three-stars the last track most of the time (${e.stars[3]})`);}
 {const c=t(last,'careful');assert.ok(c.finish<=.15,`the last track is too much for a first-timer (${c.finish})`);}
 for(let i=0;i<TRACKS.length;i++){const p=play(i,'masher');assert.ok(p.stars===0&&p.acc<35,`mashing every pad earns little on ${TRACKS[i].id} (${p.stars} stars, ${p.acc}%)`);}});

if(require.main===module){
 if(process.argv.includes('--bots')){
  console.log('track            bpm notes secs | perfect score | bot: finish% / accuracy / stars 0-1-2-3 % / mean score');
  TRACKS.forEach((tr,i)=>{const p=play(i,'perfect');console.log(`${(i+1+' '+tr.name).padEnd(22)} ${tr.bpm} ${String(p.notes).padStart(3)} ${p.secs.toFixed(0)}s | ${p.score}`);
   for(const b of ['expert','mid','careful']){const m=many(i,b,200);console.log(`   ${b.padEnd(8)} ${(m.finish*100).toFixed(0).padStart(3)}% / ${m.acc.toFixed(0)}% / ${m.stars.map(v=>(v*100).toFixed(0)).join('-')} / ${m.score.toFixed(0)}`);}
   const ms=play(i,'masher');console.log(`   masher   ${ms.out?'out':'fin'} / ${ms.acc}% / ${ms.stars} stars / ${ms.score}`);});}
 console.log(`keepyuppy-bots: ${n} checks ok`);}
module.exports={play,many,BOTS,rng};
