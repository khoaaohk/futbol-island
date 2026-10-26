// Futbol Pinball Oct 25 upgrade: crew reactions (goal / drain / save / kick-off),
// eased envelopes, switch-feet streak calls, confetti trigger, first-ball lesson
// step two, and the new crowd/drum voices staying inside the polyphony cap.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();
const globals={Math,Number,console,Map,WeakMap,Array,Object,String,Float32Array,
 localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false},performance:{now:()=>0},navigator:{},matchMedia:()=>({matches:false})};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{...globals,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const p=load('lib/games/soccerPinball.ts'),f=load('lib/games/soccerPinballFeel.ts'),a=load('lib/games/soccerPinballAudio.ts'),c=load('lib/games/soccerPinballCrew.ts');
const idle={left:false,right:false};
const run=(s,feel,seconds,input=idle,hz=60,cues=[])=>{for(let i=0;i<Math.round(seconds*hz);i++){p.stepPinball(s,input,(1/hz)*f.pinballTimeScale(feel));f.stepPinballFeel(feel,s,1/hz,(g,q)=>cues.push(q));}return cues;};
const pose=()=>({celebrate:0,anticipate:0});

// 1. Goal: keeper and back line go dejected, one after another; it eases out and sleeps.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);s.moveTime=0;Object.assign(s.ball,{x:180,y:47,vx:0,vy:-600});
 run(s,feel,1/60);assert.equal(s.phase,'goal');assert.equal(feel.crew.kind,'goal');assert.ok(feel.confettiSerial===1&&feel.confettiTime>0,'goal fires confetti');
 assert.ok(f.pinballFeelActive(feel),'reaction keeps frames awake');
 s.keeperCommit=0;run(s,feel,.3);const k=pose(),d=pose();c.pinballCrewPose(feel.crew,s,0,k,false);c.pinballCrewPose(feel.crew,s,3,d,false);
 assert.equal(k.reaction,'dejected','keeper slumps');assert.equal(d.reaction,'dejected','defender slumps too');
 const late=pose();feel.crew.age=.1;c.pinballCrewPose(feel.crew,s,3,late,false);assert.equal(late.reaction,undefined,'defender 3 reacts on his own, later beat');
 feel.crew.age=.3;run(s,feel,2.2);assert.equal(feel.crew.kind,'none','reaction ends');const after=pose();c.pinballCrewPose(feel.crew,s,0,after,false);assert.equal(after.reaction,undefined);}

// 2. Drain: defenders celebrate with an eased hop (never a snap); reduced motion keeps the arm, drops the hop.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:180,y:625,vx:0,vy:400});
 run(s,feel,.05);assert.equal(s.balls,2);assert.equal(feel.crew.kind,'drain');
 const crew={kind:'drain',age:.02,serial:1},q=pose();const h0=c.pinballCrewPose(crew,s,1,q,false);assert.ok(q.celebrate<.15,'eases in, no snap');
 let peakHop=0,peakArm=0;for(let t=0;t<1.4;t+=1/60){crew.age=t;const o=pose();peakHop=Math.max(peakHop,c.pinballCrewPose(crew,s,2,o,false));peakArm=Math.max(peakArm,o.celebrate);}
 assert.ok(peakArm>.9&&peakHop>.1&&peakHop<.3,'arm up and a real but small hop: '+peakHop);
 crew.age=.6;const r=pose();assert.equal(c.pinballCrewPose(crew,s,2,r,true),0,'reduced motion: no hop');assert.ok(r.celebrate>.5,'reduced motion keeps the readable arm-up');
 crew.age=1.45+.24;const end=pose();c.pinballCrewPose(crew,s,2,end,false);assert.ok(end.celebrate<.05,'eases out by the end of his (delayed) life');}

// 3. A save never interrupts a bigger moment; on its own only the keeper reacts.
{const crew=c.createPinballCrew();c.triggerPinballCrew(crew,'goal');c.triggerPinballCrew(crew,'save');assert.equal(crew.kind,'goal');
 const solo=c.createPinballCrew(),s=p.createPinballState();c.triggerPinballCrew(solo,'save');solo.age=.3;const k=pose(),d=pose();c.pinballCrewPose(solo,s,0,k,false);c.pinballCrewPose(solo,s,1,d,false);
 assert.ok(k.celebrate>.5&&d.celebrate===0,'keeper only');}

// 4. Kick-off: the keeper gets set as the plunger comes back.
{const s=p.createPinballState(),crew=c.createPinballCrew(),k=pose();s.plunger=.8;c.pinballCrewPose(crew,s,0,k,false);assert.ok(k.anticipate>.6);const d=pose();c.pinballCrewPose(crew,s,1,d,false);assert.equal(d.anticipate,0);}

// 5. Streak call: the 3rd alternating-foot strike gets its own popup + cue, once per rally.
{const s=p.createPinballState(),feel=f.createPinballFeel();p.launchPinball(s);run(s,feel,1/60);const cues=[];
 for(const n of [2,3,3,4]){s.combination=n;s.cue='strike';s.score+=25*n;s.hitId++;f.stepPinballFeel(feel,s,1/60,(g,q)=>cues.push(q));}
 assert.equal(cues.filter(q=>q==='pb-streak').length,2,'3x and 4x each celebrated once');
 assert.ok(feel.popups.some(q=>/^SWITCH FEET! 3×/.test(q.text)));assert.ok(feel.popups.some(q=>/^ON FIRE! 4×/.test(q.text)));}

// 6. First-ball lesson, step two: after the first kick, teach switching feet.
{const s=p.createPinballState();p.launchPinball(s);s.cueTime=0;s.sfx.flipper=1;s.combination=1;assert.match(f.pinballTableMessage(s),/OTHER foot/);
 s.combination=2;assert.doesNotMatch(f.pinballTableMessage(s)??'',/OTHER foot/,'gone once a combo lands');}

// 7. New voices play and the goal still respects the 14-voice cap.
{let live=0,peak=0;const node=()=>({connect(){},disconnect(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){},value:0},gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:0},playbackRate:{value:1},start(){live++;peak=Math.max(peak,live);},stop(){},set onended(fn){this._end=fn;}});
 const started=[];const ctx={state:'running',currentTime:1,sampleRate:8000,destination:{},createOscillator(){const n=node();started.push(n);return n;},createGain:node,createBiquadFilter:node,createBufferSource(){const n=node();started.push(n);return n;},createBuffer:(ch,len)=>({getChannelData:()=>new Float32Array(len)})};
 const s=p.createPinballState();s.combination=4;s.sfx.keeperV=700;
 for(const cue of ['pb-streak','strike','pb-parry','save']){const before=started.length;a.playPinballCue(ctx,cue,s);assert.ok(started.length>before,cue+' plays');ctx.currentTime+=2;for(const n of started)if(n._end){const e=n._end;n._end=null;live--;e();}}
 peak=0;s.lastGoalBonus=200;a.playPinballCue(ctx,'goal',s);assert.ok(peak<=14,'goal with bonus stays within the cap: '+peak);}
console.log('PASS pinball crew oct25: goal/drain/save/kick-off reactions, eased hop + reduced motion, streak calls, confetti, switch-feet lesson, crowd/drum voices capped');
