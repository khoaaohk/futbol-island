// Futbol Pinball game feel: per-ball save, hit-stop as an input buffer,
// weighted shake, pooled pop-ups, end-of-ball summary and bounded audio.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();
const globals={Math,Number,console,Map,WeakMap,Array,Object,String,Float32Array,
 localStorage:{getItem:()=>null},document:{hidden:false},performance:{now:()=>0},navigator:{},matchMedia:()=>({matches:false})};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{...globals,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const p=load('lib/games/soccerPinball.ts'),f=load('lib/games/soccerPinballFeel.ts'),a=load('lib/games/soccerPinballAudio.ts');
const idle={left:false,right:false};
const run=(s,feel,seconds,input=idle,hz=60,cues=[])=>{for(let i=0;i<Math.round(seconds*hz);i++){p.stepPinball(s,input,(1/hz)*f.pinballTimeScale(feel));f.stepPinballFeel(feel,s,1/hz,(g,c)=>cues.push(c));}return cues;};

// 1. Every new ball gets a ball save; a rescued relaunch never gets another.
{const s=p.createPinballState(),feel=f.createPinballFeel();
 p.launchPinball(s);assert.equal(s.launchGrace,3,'first ball is protected');
 s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:180,y:625,vx:0,vy:400});const cues=run(s,feel,.05);
 assert.equal(s.balls,2);assert.equal(s.phase,'lost');assert.ok(cues.includes('pb-drain'),'real drain plays the soft drain cue');
 assert.match(f.pinballFeelMessage(feel,s),/^Ball 1 · \+0 · 0 goals/,'end-of-ball summary appears');
 run(s,feel,1.1);assert.equal(s.phase,'ready');assert.ok(s.openingRescue,'next ball re-arms the save');
 assert.match(f.pinballFeelMessage(feel,s),/2 balls left/,'summary stays readable on the plunger');
 p.launchPinball(s);assert.equal(s.launchGrace,3);assert.equal(f.pinballFeelMessage(feel,s),null,'summary clears on launch');
 Object.assign(s.ball,{x:180,y:625,vx:0,vy:400});run(s,feel,.05);assert.equal(s.balls,2,'second ball is saved too');assert.equal(s.cue,'rescue');
 run(s,feel,1.1);p.launchPinball(s);assert.equal(s.launchGrace,0,'rescue cannot be farmed by relaunching');
 assert.deepEqual([1,2,3,4].map(p.pinballBallSaveTime),[3,3,2.5,2],'ball save tightens with the division ramp');}

// 2. Goal: hit-stop freezes the sim, keeps a flipper tap buffered, pops a label.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);s.moveTime=0;Object.assign(s.ball,{x:180,y:47,vx:0,vy:-600});
 run(s,feel,1/60);assert.equal(s.phase,'goal');assert.ok(feel.hitStop>0,'goal triggers hit-stop');assert.equal(f.pinballTimeScale(feel),0);
 assert.ok(feel.popups.some(q=>q.text==='GOAL! +500'&&q.kind==='goal'),'goal pop-up shows the points');assert.ok(feel.shake>.5,'goal is a big shake');
 const timer=s.timer;run(s,feel,.05);assert.equal(s.timer,timer,'frozen simulation does not advance');run(s,feel,.2);assert.ok(s.timer<timer,'simulation resumes after the freeze');}
// 2b. A flipper tap pressed during a knock-down freeze is buffered, not lost.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);const d=p.pinballDefenders(0)[0];
 for(let i=0;i<12&&!feel.hitStop;i++){if(i===0)Object.assign(s.ball,{x:d.x+1,y:d.y+21,vx:0,vy:-650});run(s,feel,1/60);}
 if(s.cue==='dazed'){assert.ok(feel.hitStop>0,'knock-down triggers hit-stop');p.tapPinballFlipper(s,0);const y=s.ball.y;run(s,feel,1/60);assert.equal(s.ball.y,y,'ball frozen');assert.equal(s.flipperPulse[0],.065,'tap kept during the freeze');run(s,feel,.1);assert.ok(s.left>0,'buffered tap fires on resume');}else assert.fail('knock-down fixture did not daze: '+s.cue);}

// 3. Shake is weighted: wall ticks barely move the camera; a knock-down does.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);Object.assign(s.ball,{x:29,y:400,vx:-300,vy:0});const cues=run(s,feel,.04);
 assert.ok(cues.includes('pb-wall'),'wall contact is audible');assert.ok(feel.shake<.05,'soft wall hit does not shake');
 const k=p.createPinballState(),kf=f.createPinballFeel();p.launchPinball(k);k.openingRescue=false;const d=p.pinballDefenders(0)[0];Object.assign(k.ball,{x:d.x,y:d.y+30,vx:0,vy:-600});run(k,kf,.05);
 assert.ok(['dazed','block'].includes(k.cue));assert.ok(kf.shake>.15,'defender hit shakes');assert.ok(kf.popups.some(q=>q.text==='+10'),'defender hit pops +10');}

// 4. Lighting the goal plays the mode sting once.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);Object.assign(s.ball,{x:180,y:300,vx:0,vy:0});const cues=[];
 run(s,feel,1/60,idle,60,cues);s.moveTime=14;run(s,feel,.2,idle,60,cues);assert.equal(cues.filter(c=>c==='pb-lit').length,1);assert.ok(feel.popups.some(q=>q.text==='GOAL LIT!'));}

// 5. Pop-up pool is fixed; reset reuses it.
{const feel=f.createPinballFeel(),pool=feel.popups;assert.equal(pool.length,f.PINBALL_POPUPS);f.resetPinballFeel(feel);assert.equal(feel.popups,pool,'reset keeps the pooled objects');}

// 6. Audio: every cue plays on a fake context, voices are capped and released.
{let live=0,peak=0;const node=()=>({connect(){},disconnect(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){},value:0},gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:0},playbackRate:{value:1},start(){live++;peak=Math.max(peak,live);},stop(){},set onended(fn){this._end=fn;}});
 const started=[];const ctx={state:'running',currentTime:1,sampleRate:8000,destination:{},createOscillator(){const n=node();started.push(n);return n;},createGain:node,createBiquadFilter:node,createBufferSource(){const n=node();started.push(n);return n;},createBuffer:(c,len)=>({getChannelData:()=>new Float32Array(len)})};
 const s=p.createPinballState();
 for(const cue of ['left','right','launch','strike','pb-wall','pb-gate','dazed','block','save','control','pass','attack','pb-lit','goal','level','pb-drain','concede','rescue','nudge','pb-whistle','pb-over','touch']){a.playPinballCue(ctx,cue,s);ctx.currentTime+=.5;for(const n of started)if(n._end){const end=n._end;n._end=null;live--;end();}}
 assert.ok(started.length>40,'cues produce layered voices');
 for(let i=0;i<10;i++)a.playPinballCue(ctx,'goal',s);assert.ok(peak<=14,'polyphony is capped');for(const n of started)if(n._end){const end=n._end;n._end=null;live--;end();}
 a.playPinballCue(ctx,'pb-wall',s);const before=started.length;a.playPinballCue(ctx,'pb-wall',s);assert.equal(started.length,before,'wall rattle is throttled');
 ctx.currentTime+=1;a.playPinballCue(ctx,'goal',s);assert.ok(started.length>before,'voices are released after ending');}

console.log('PASS pinball feel: per-ball save, hit-stop buffer, weighted shake, pop-ups, lit sting, summary and capped layered audio');
