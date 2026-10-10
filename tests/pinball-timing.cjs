// Futbol Pinball lesson "Read the rebound. Time your block." (Oct 9 2026):
// strike timing grades (PERFECT / EARLY / LATE), the perfect streak, the
// rebound read forecast and its division scaffolding, read credit, and the
// feel layer's popups, coaching lines and sounds for both.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();
const globals={Math,Number,console,Map,WeakMap,Array,Object,String,JSON,Float32Array,
 localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false},performance:{now:()=>0},navigator:{},matchMedia:()=>({matches:false})};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{...globals,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const P=load('lib/games/soccerPinball.ts'),F=load('lib/games/soccerPinballFeel.ts'),A=load('lib/games/soccerPinballAudio.ts');
const idle={left:false,right:false},L={left:true,right:false},R={left:false,right:true};
const advance=(s,seconds,input=idle)=>{for(let i=0;i<Math.round(seconds/P.PINBALL_STEP);i++)P.stepPinball(s,input,P.PINBALL_STEP);};
const active=(x,y,vx,vy)=>{const s=P.createPinballState();P.launchPinball(s);s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x,y,vx,vy});return s;};

// 1. A press that meets the ball mid-swing is PERFECT: points, streak, stats.
{const s=active(145,540,0,100),score=s.score;advance(s,.075,L);
 assert.equal(s.cue,'strike');assert.equal(s.timing.grade,'perfect','a fresh flick meets the ball mid-swing');
 assert.equal(s.stats.perfect,1);assert.equal(s.timing.streak,1);assert.equal(s.sfx.grade,1);assert.ok(s.score-score>=P.PERFECT_POINTS,'perfect pays');
 advance(s,.2);Object.assign(s.ball,{x:215,y:540,vx:0,vy:100});advance(s,.075,R);
 assert.equal(s.timing.grade,'perfect');assert.equal(s.timing.streak,2,'perfect strikes chain into a streak');assert.equal(s.timing.best,2);}

// 2. A bat raised and held long before a firm drop is EARLY (and breaks the streak).
{const s=active(120,300,0,0);s.timing.streak=3;advance(s,.3,L);assert.equal(s.left,1);
 Object.assign(s.ball,{x:125,y:500,vx:0,vy:520});const before=s.sfx.flipper;advance(s,.08,L);
 assert.equal(s.sfx.flipper,before,'a held-up bat is not a strike');assert.equal(s.timing.grade,'early');assert.equal(s.stats.early,1);assert.equal(s.timing.streak,0);
 const grades=s.sfx.grade;advance(s,.1,L);assert.equal(s.sfx.grade,grades,'one early grade per drop, not a rattle');}

// 3. Pressing just after the ball slipped through the centre is LATE.
{const s=active(180,548,0,420);advance(s,.04);assert.ok(s.timing.passedAt>0,'the ball passing the bats is noted');
 advance(s,.02,L);assert.equal(s.timing.grade,'late');assert.equal(s.stats.late,1);
 const t=active(180,548,0,420);advance(t,.6);advance(t,.02,L);assert.notEqual(t.timing.grade,'late','a press long after is not judged');}

// 4. A real drain ends the streak; the best streak is kept for the run.
{const s=active(180,625,0,400);s.timing.streak=4;s.timing.best=4;advance(s,.05);assert.equal(s.balls,2);assert.equal(s.timing.streak,0);assert.equal(s.timing.best,4);}

// 5. Rebound read: one forecast per free flight, right bat, right colour side, gap detection.
{const s=active(270,230,0,0);s.lastStrikeAt=-10;s.read.dirty=true;advance(s,1/240);
 assert.ok(s.read.live,'a free drop is forecast');assert.equal(s.read.side,1,'right-hand drop reads the right flipper');assert.ok(s.read.fromRebound);
 assert.ok(Math.abs(s.read.x-270)<2,'a straight drop lands straight down');assert.ok(s.read.eta>1&&s.read.eta<1.3,'eta follows table gravity');assert.ok(s.read.n>=5,'path dots are sampled');
 const dots=s.read.dots;s.read.dirty=true;advance(s,1/240);assert.equal(s.read.dots,dots,'the forecast reuses its scratch buffer');
 const shown=P.pinballReadShow(s);assert.ok(shown.ring>0&&shown.path>0,'Build Up shows the ring and the path');
 s.level=3;assert.equal(P.pinballReadShow(s).path,0,'Play the Angles shows the ring only');assert.ok(P.pinballReadShow(s).ring>0);
 s.level=4;assert.equal(P.pinballReadShow(s).ring,0,'Complete Forward hides an early ring');advance(s,.8);assert.ok(P.pinballReadShow(s).ring>0,'…and shows it late');
 const l=active(120,420,0,0);l.lastStrikeAt=-10;l.read.dirty=true;advance(l,1/240);assert.equal(l.read.side,0);
 const g=active(180,430,0,0);g.lastStrikeAt=-10;g.read.dirty=true;advance(g,1/240);assert.equal(g.read.side,-1,'the centre gap is called out');
 assert.match(F.pinballTimingMessage(Object.assign(g,{ball:Object.assign(g.ball,{vy:50})})),/gap/i);
 const up=active(270,230,0,-900);up.read.dirty=true;advance(up,1/240);assert.equal(up.read.live,false,'a shot climbing to the goal is not a readable drop');
 const lane=P.createPinballState();lane.read.dirty=true;advance(lane,.05);assert.equal(lane.read.live,false,'nothing is forecast on the plunger');}

// 6. Reading the rebound and meeting it on time earns READ credit once.
{const s=active(230,470,0,0);s.lastStrikeAt=-10;s.read.dirty=true;advance(s,1/240);assert.equal(s.read.side,1);
 Object.assign(s.ball,{x:215,y:540,vx:0,vy:100});const score=s.score;advance(s,.075,R);
 assert.equal(s.timing.read,true,'struck with the forecast flipper');assert.equal(s.stats.reads,1);assert.ok(s.score-score>=P.PERFECT_POINTS+P.READ_POINTS);
 advance(s,.3);Object.assign(s.ball,{x:215,y:540,vx:0,vy:100});advance(s,.075,R);assert.equal(s.stats.reads,1,'a read pays once');
 const own=active(230,470,0,0);own.lastStrikeAt=own.time;own.read.dirty=true;advance(own,1/240);Object.assign(own.ball,{x:215,y:540,vx:0,vy:100});advance(own,.075,R);assert.equal(own.stats.reads,0,'your own shot coming straight back is not a rebound read');}

// 7. Feel layer: popups, sounds and coaching lines for each grade.
{const s=active(145,540,0,100),f=F.createPinballFeel(),cues=[];const run=sec=>{for(let i=0;i<Math.round(sec*60);i++){P.stepPinball(s,inp,(1/60)*F.pinballTimeScale(f));F.stepPinballFeel(f,s,1/60,(g,c)=>cues.push(c));}};let inp=L;run(1/60*4);
 assert.ok(cues.includes('pb-perfect'),'perfect has its own ping');assert.ok(f.popups.some(q=>/^PERFECT/.test(q.text)),'perfect pops');assert.ok(f.hitStop>0||cues.length>0);
 assert.match(F.pinballTimingMessage(s),/PERFECT/);
 s.timing.grade='early';s.timing.at=s.time;s.sfx.grade++;inp=idle;run(1/60);assert.ok(cues.includes('pb-early'));assert.ok(f.popups.some(q=>q.text==='TOO EARLY'));assert.match(F.pinballTimingMessage(s),/Wait for the ball/);
 s.timing.grade='late';s.timing.at=s.time;s.sfx.grade++;run(1/60);assert.ok(cues.includes('pb-late'));assert.match(F.pinballTimingMessage(s),/TOO LATE/);
 s.time+=2;assert.equal(F.pinballTimingMessage(s),null,'grades fade after a moment');}

// 8. The new cues play on a fake context without throwing.
{const node=()=>({connect(){},disconnect(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{},playbackRate:{},start(){},stop(){}});
 let made=0;const ctx={state:'running',currentTime:1,sampleRate:8000,destination:{},createOscillator(){made++;return node();},createGain:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(c,len)=>({getChannelData:()=>new Float32Array(len)})};
 const s=P.createPinballState();for(const cue of ['pb-perfect','pb-read','pb-early','pb-late'])A.playPinballCue(ctx,cue,s);assert.ok(made>=5,'timing cues are voiced');}

console.log('PASS pinball timing: perfect/early/late grades, streak, rebound read forecast + division fade, read credit, popups, lines and cues');
