// Arcade beat director (Nov 10 2026, arcade part 3): the cinemas share lib/arcade/beatDirector.ts (real-time clock, gap gates,
// reduced-motion gate, smoothstep easing). Golden test: each cinema's output (time scale, camera push, flags) over a fixed
// script of triggers / skips / ticks was recorded from the code BEFORE the refactor (tests/fixtures/arcade-beat-director.json)
// and must be reproduced bit for bit. Re-record only on purpose: RECORD=1 node -r ./scripts/test-ts-cache.cjs tests/arcade-beat-director.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),path=require('node:path');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const FIX=path.join(__dirname,'fixtures/arcade-beat-director.json');
const dt=1/60,frames=n=>Array.from({length:n},(_,i)=>i);
const out={};
// Breakaway Run
for(const reduced of [false,true]){const C=require('../lib/arcade/runnerCinema.ts'),c=C.createRunnerCinema(reduced),rec=[];
 const at={0:'intro',90:'dodge',100:'hurdle',150:'goal',200:'duel',230:'dodge',260:'finish',400:'bigair',420:'power',700:'save',760:'dodge',790:'finish'};
 for(const i of frames(900)){if(at[i])rec.push(['t',at[i],c.trigger(at[i])]);if(i===300||i===775)c.skip();if(i===850)c.reset();c.step(i%7===0?dt*2:dt);
  rec.push([c.timeScale(),c.zoom(),c.low(),c.lift(),c.back(),c.flare(),c.active(),c.kind()]);}
 rec.push(c.debug());out[`runner${reduced?'-reduced':''}`]=rec;}
// Island Strikers
for(const reduced of [false,true]){const C=require('../lib/arcade/strikerCinema.ts'),c=C.createStrikerCinema({reduced}),rec=[];
 const at={0:['kickoff',0,0],60:['through',10,2,25,0],70:['tackle',3,1],120:['charge',12,0,25,0],130:['charge',14,1,25,0],200:['strike',15,0,25,0],230:['goal',24,0],400:['save',22,1],420:['save',22,1],500:['setpiece',20,-8,25,0],560:['through',8,0,25,0],900:['through',8,0,25,0],1000:['fulltime',0,0]};
 for(const i of frames(1150)){const a=at[i];if(a)rec.push(['t',a[0],c.trigger(...a)]);if(i===210)c.release();if(i>=200&&i<230)c.follow(15+i*.1,0);if(i===520)c.skip();c.update(i%11===0?.15:dt);
  rec.push([c.timeScale,c.amount,c.zoom,c.dolly,c.low,c.sweep,c.tx,c.tz,c.gx,c.gz,c.beat,c.slowCount,c.slowing]);}
 out[`striker${reduced?'-reduced':''}`]=rec;}
// Futbol Tennis
for(const reduced of [false,true]){const C=require('../lib/arcade/tennisCinema.ts'),c=C.createTennisCinema(reduced),rec=[];
 for(const i of frames(1000)){if(i===10)rec.push(['s',c.strike(1)]);if(i===40)rec.push(['p',c.push(.8)]);if(i===100)rec.push(['s',c.strike(.4)]);if(i===150)rec.push(['p',c.push(.5)]);
  if(i===400)rec.push(['s',c.strike(.9)]);if(i===420)c.skip();if(i===500)rec.push(['p',c.push()]);if(i===800)rec.push(['s',c.strike(.6)]);if(i===900)c.reset();
  const s=c.update(dt,i>=600&&i<700||i>=820&&i<830,i>=600&&i<650,i>=812&&i<815);rec.push([s.scale,s.close,s.follow,s.push,s.flash,s.kind,c.active(),c.sinceSlow()]);}
 out[`tennis${reduced?'-reduced':''}`]=rec;}
// Futbol Pinball
for(const reduced of [false,true]){const C=require('../lib/games/soccerPinballCinema.ts'),c=C.createPinballCinema(reduced),rec=[];
 const s={phase:'playing',ball:{x:180,y:300,vx:0,vy:0}},shot={k:.1,ax:0,az:0,ay:0,tilt:.2,name:'play'};
 const at={5:['launch',180,560],30:['save',180,560],60:['keeper',150,83],200:['target',120,200],210:['goal',180,60],500:['mode',180,300],700:['drain',150,520],760:['drain',150,520],1100:['save',180,560]};
 for(const i of frames(1200)){const a=at[i];if(a)rec.push(['t',a[0],C.triggerCinema(c,...a)]);if(i===80||i===720)C.skipCinema(c);if(i===900)C.resetPinballCinema(c);s.ball.x=180+Math.sin(i*.05)*80;s.ball.y=300+Math.cos(i*.04)*200;
  C.stepPinballCinema(c,i%9===0?dt*3:dt,s);shot.k=.1;shot.ax=0;shot.az=0;shot.ay=0;shot.tilt=.2;shot.name='play';C.cinemaShot(c,shot);
  rec.push([C.cinemaTimeScale(c),C.cinemaWeight(c),C.cinemaActive(c),c.kind,c.age,c.skipped,c.clock,c.lastSlow,c.lastCam,c.count,shot.k,shot.ax,shot.az,shot.ay,shot.tilt,shot.name]);}
 out[`pinball${reduced?'-reduced':''}`]=rec;}
// Pass Puzzles
for(const reduced of [false,true]){const C=require('../lib/passPuzzle/cinematic.ts'),c=C.createCinematic(reduced),rec=[];
 for(const i of frames(900)){if(i===0)c.intro(0,10,5,20);if(i===150)c.play('strike',3,4);if(i>150&&i<200)c.follow(3+i*.1,4+i*.05);if(i===200)c.play('arrive',8,12);if(i===260)c.play('goal',0,30);
  if(i===300)c.skip();if(i===320)c.play('miss',1,1);if(i===400){c.resetBudget();c.play('goal',2,2);}if(i===600)c.setReduced(true);if(i===620)c.play('hint',4,4);if(i===640)c.setReduced(false);if(i===660)c.play('strike',5,5);
  const live=c.update(i%13===0?.2:dt);rec.push([c.timeScale,c.push,c.focus.x,c.focus.z,c.active,c.beat,live,C.zoomFor(c.push)]);}
 out[`puzzle${reduced?'-reduced':''}`]=rec;}

// The fixture keeps a sha1 of every cinema's full trace (exact doubles) plus every 25th row, to show where a change starts.
const digest=rec=>require('node:crypto').createHash('sha1').update(JSON.stringify(rec)).digest('hex');
const pack=o=>Object.fromEntries(Object.entries(o).map(([k,rec])=>[k,{rows:rec.length,sha1:digest(rec),sample:rec.filter((_,i)=>i%25===0)}]));
if(process.env.RECORD){fs.writeFileSync(FIX,JSON.stringify(pack(out)));console.log('arcade-beat-director: recorded',Object.keys(out).join(', '));process.exit(0);}
const want=JSON.parse(fs.readFileSync(FIX,'utf8')),got=pack(JSON.parse(JSON.stringify(out)));
for(const k of Object.keys(want)){assert.equal(got[k].rows,want[k].rows,k);
 for(let i=0;i<want[k].sample.length;i++)assert.deepStrictEqual(got[k].sample[i],want[k].sample[i],`${k} row ${i*25} changed`);
 assert.equal(got[k].sha1,want[k].sha1,`${k}: the full trace changed`);}
// The shared director exists and the migrated cinemas use it.
const D=require('../lib/arcade/beatDirector.ts');
assert.equal(D.smoothstep(-1),0);assert.equal(D.smoothstep(2),1);assert.equal(D.smoothstep(.5),.5);
{const d=D.createBeatDirector({reduced:false,gaps:{slow:6,cam:2.5}});assert.equal(d.ready('slow'),true);d.mark('slow');assert.equal(d.ready('slow'),false);d.tick(6);assert.equal(d.ready('slow'),true);assert.equal(d.ready('cam'),true);
 const r=D.createBeatDirector({reduced:true,gaps:{slow:6}});assert.equal(r.reduced,true);}
for(const f of ['lib/arcade/runnerCinema.ts','lib/arcade/strikerCinema.ts','lib/arcade/tennisCinema.ts','lib/games/soccerPinballCinema.ts'])assert.match(fs.readFileSync(f,'utf8'),/from '(\.\/|\.\.\/arcade\/)beatDirector'/,`${f} uses the beat director`);
console.log('arcade-beat-director: ok (5 cinemas reproduce the recorded beats exactly)');
