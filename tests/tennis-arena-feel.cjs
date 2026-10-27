// Futbol Tennis Oct 25 upgrade: arena dressing (court paint, light pools, confetti, desktop crowd + umpire),
// celebrations / plant / ready-bounce pose overlays, streak + comeback + match-point calls, and the new sound cues.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const T=require('three'),root=path.resolve(__dirname,'..');
// Minimal browser stubs: a 2D context that ignores drawing, a canvas, storage, a fake audio graph.
const ctx2d=new Proxy({},{get:(o,k)=>k==='measureText'?()=>({width:10}):k==='canvas'?o.canvas:k in o?o[k]:()=>({addColorStop(){}}),set:(o,k,v)=>{o[k]=v;return true;}});
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
const document={hidden:false,createElement:()=>{const c={width:0,height:0,getContext:()=>{ctx2d.canvas=c;return ctx2d;}};return c;}};
let vibrations=0;const navigator={vibrate:()=>{vibrations++;return true;}};
const stubs={'@/lib/graphics/player':{MOVE_PHASE:{bicycle:{contact:.4},scissor:{contact:.35}}},'../games/sound':{isSoundEnabled:()=>true,getSoundVolume:()=>1}};
const cache=new Map();
function resolve(from,id){if(id.startsWith('@/'))return path.join(root,id.slice(2))+'.ts';return path.resolve(path.dirname(from),id)+'.ts';}
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,Array,Object,String,Float32Array,Float64Array,Set,Map,WeakMap,Proxy,console,document,localStorage,navigator,performance,matchMedia:()=>({matches:false}),
  require:id=>stubs[id]??(id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id))});return m.exports;}
const game=load('lib/games/soccerTennis.ts'),arenaMod=load('lib/arcade/tennisArena.ts'),feelMod=load('lib/arcade/tennisFeel.ts'),audio=load('lib/arcade/tennisAudio.ts');

// 1. Pure reads.
const marks=arenaMod.tennisCourtMarks();assert.equal(marks.length,5,'service lines x2, centre service line, two baseline centre marks');
for(const [x0,z0,x1,z1] of marks){assert(x0<x1&&z0<z1,'marks are proper rectangles');assert(Math.abs(x0)<=5&&Math.abs(x1)<=5&&Math.abs(z0)<=8&&Math.abs(z1)<=8,'paint stays inside the court lines');}
assert.equal(arenaMod.tennisFanCount(),32);
assert.equal(arenaMod.tennisFanLift(0,0,1,0,0,1),0,'a calm crowd sits still');
let peak=0;for(let t=0;t<2;t+=.01)peak=Math.max(peak,arenaMod.tennisFanLift(1,0,t,0,0,1));assert(peak>.2&&peak<=.26,'a cheer bounces fans up to ~a quarter metre');
const along=[-4,-2,0,2,4].map(z=>arenaMod.tennisFanLift(0,1,1.3,0,z,1));assert(Math.max(...along)>Math.min(...along)+.1,'the wave lifts some seats and not others (it travels)');
// Round 3: court 1 is a gentle first to 5; court 2 keeps first to 7.
assert.equal(feelMod.tennisMatchPoint({score:{you:6,rival:2},level:2}),'you');assert.equal(feelMod.tennisMatchPoint({score:{you:3,rival:6},level:2}),'rival');
assert.equal(feelMod.tennisMatchPoint({score:{you:6,rival:6},level:2}),'both');assert.equal(feelMod.tennisMatchPoint({score:{you:5,rival:5},level:2}),'');
assert.equal(feelMod.tennisMatchPoint({score:{you:4,rival:1},level:1}),'you','court 1: first to 5');
assert.equal(feelMod.tennisMatchPoint({score:{you:6,rival:0},level:3}),'','the target drill has no match point');
assert(feelMod.tennisCelebrateLift(.25,false)>.15&&feelMod.tennisCelebrateLift(.6,false)===0,'a point gets one hop');
assert(feelMod.tennisCelebrateLift(.31,true)>.15&&feelMod.tennisCelebrateLift(.93,true)>.15&&feelMod.tennisCelebrateLift(2,true)===0,'a match win gets bouncy hops that end');

// 2. Feel + arena on a stub stage (desktop: crowd on; phone: no crowd).
function setup(mobile,reduced=false){const scene=new T.Scene(),bursts=[];const stage={scene,camera:new T.PerspectiveCamera(),reduced,mobile,burst:(x,y,z,p)=>bursts.push(p)};
 const s=game.createTennis(47,1),cues=[];const feel=feelMod.createTennisFeel(stage,s,c=>cues.push(c));return{scene,stage,s,feel,cues,bursts};}
const desk=setup(false),phone=setup(true);
const count=(scene,name)=>{let n=0;scene.traverse(o=>{if(o.name===name)n++;});return n;};
for(const name of['tennis-court-paint','tennis-floodlights','tennis-pool-you','tennis-pool-rival','tennis-confetti'])assert.equal(count(desk.scene,name),1,name);
assert.equal(count(desk.scene,'tennis-crowd'),1);assert.equal(count(phone.scene,'tennis-crowd'),0,'phones skip the crowd (off-frame on the top-down phone camera)');
const crowd=desk.scene.getObjectByName('tennis-crowd');assert.equal(crowd.count,33,'32 fans + the umpire');
let meshes=0;phone.scene.traverse(o=>{if(o.isMesh)meshes++;});assert(meshes<=12,`phone arena adds few meshes (${meshes})`);

// Point flow: three in a row = ON FIRE + streak cue + confetti; the winner hops, the loser droops.
const {s,feel,cues,scene}=desk;const pose={};
function point(winner){s.score[winner]++;s.pointsPlayed++;s.pointWinner=winner;s.phase=s.score[winner]>=7?'over':'point';s.phaseTime=0;if(s.phase==='over')s.winner=winner;feel.sync(1/30,0);}
function run(seconds){for(let t=0;t<seconds;t+=1/30){s.phaseTime+=1/30;feel.sync(1/30,0);}}
point('you');point('you');run(.1);point('you');
assert(cues.includes('tennis:streak:3'),'three points in a row plays the streak fanfare');
const confetti=scene.getObjectByName('tennis-confetti');assert(confetti.visible,'your point throws confetti');
run(.25);const hop=feel.pose(0,pose,false);assert(hop>.1,`the point winner jumps (${hop})`);
const rivalPose={};feel.pose(1,rivalPose,false);assert.equal(rivalPose.reaction,'dejected','the rival droops');
run(3);assert(!confetti.visible,'confetti lands and the pool hides');
// Comeback: the rival goes 3 ahead -> warm encouragement, never a scold.
s.score.you=1;s.score.rival=3;point('rival');assert(cues.includes('tennis:comeback'),'three behind: the coach says you can come back');
// Match point: said on the first touch of the point once someone needs one more.
run(3);s.score.you=6;s.score.rival=3;s.pointWinner=null;s.phase='rally';s.rally=1;feel.sync(1/30,0);
assert(cues.some(c=>c==='tennis:matchpoint:you'),'match point call for you');const mpCount=cues.filter(c=>c.startsWith('tennis:matchpoint')).length;feel.sync(1/30,0);
assert.equal(cues.filter(c=>c.startsWith('tennis:matchpoint')).length,mpCount,'said once per point');
// Match win: arms up and bouncy hops, then everything settles so the loop can sleep.
s.rally=4;point('you');run(.3);const winPose={};const lift=feel.pose(0,winPose,false);assert.equal(winPose.celebrate,1,'match winner throws both arms up');assert(lift>.1,'and jumps');
run(4);assert.equal(feel.active(),false,'celebrations, confetti and the crowd settle: the game can sleep');

// Plant: a hard stop from a sprint crouches, squeaks and puffs dust (once, then cools down).
const plant=setup(false);plant.s.phase='rally';plant.s.ball.last='you';Object.assign(plant.s.you,{vx:7,vy:0});plant.feel.sync(1/30,0);
Object.assign(plant.s.you,{vx:.5,vy:0});plant.feel.sync(1/30,0);
assert(plant.cues.includes('tennis:skid:you'),'hard stop squeaks');assert(plant.bursts.length>=1,'and puffs dust');
const crouch={};plant.feel.pose(0,crouch,false);plant.feel.sync(1/30,0);const crouch2={};plant.feel.pose(0,crouch2,false);assert(crouch2.anticipate>.3,'the body sinks into the plant');
Object.assign(plant.s.you,{vx:7,vy:0});plant.feel.sync(1/30,0);Object.assign(plant.s.you,{vx:0,vy:0});plant.feel.sync(1/30,0);
assert.equal(plant.cues.filter(c=>c==='tennis:skid:you').length,1,'skids cool down (no squeak spam)');
// Ready bounce: receiving and set -> a light bounce on the toes (and none with reduced motion).
const ready=setup(false);ready.s.phase='rally';ready.s.ball.last='rival';let maxReady=0;for(let i=0;i<40;i++){ready.s.clock+=1/30;ready.feel.sync(1/30,0);maxReady=Math.max(maxReady,ready.feel.pose(0,{},false));}
assert(maxReady>.015&&maxReady<.04,`ready bounce is small (${maxReady})`);
const calm=setup(false,true);calm.s.phase='rally';calm.s.ball.last='rival';let calmMax=0;for(let i=0;i<40;i++){calm.s.clock+=1/30;calm.feel.sync(1/30,0);calmMax=Math.max(calmMax,calm.feel.pose(0,{},false));}
assert.equal(calmMax,0,'reduced motion: no bounce');
calm.s.score.you=1;calm.s.pointsPlayed++;calm.s.pointWinner='you';calm.s.phase='point';calm.feel.sync(1/30,0);assert.equal(calm.scene.getObjectByName('tennis-confetti').visible,false,'reduced motion: no confetti');

// Dispose removes every arena mesh.
desk.feel.dispose();for(const name of['tennis-court-paint','tennis-floodlights','tennis-pool-you','tennis-confetti','tennis-crowd','tennis-stands'])assert.equal(count(desk.scene,name),0,`${name} removed`);

// 3. Sound cues: each new cue schedules voices on the game's context, stays under the voice cap, frees every node.
let live=0,made=0;const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
const node=(extra={})=>({connect(){},disconnect(){},...extra});
const ac={state:'running',currentTime:0,sampleRate:800,destination:{},
 createOscillator(){made++;live++;const o=node({type:'',frequency:param(),start(){},stop(){setTimeout(()=>{live--;o.onended?.();},0);}});return o;},
 createBufferSource(){made++;live++;const o=node({buffer:null,start(){setTimeout(()=>{live--;o.onended?.();},0);}});return o;},
 createGain:()=>node({gain:param()}),createBiquadFilter:()=>node({type:'',Q:{value:0},frequency:param()}),createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
const tick=()=>new Promise(r=>setTimeout(r,2));
(async()=>{const before=made;for(const cue of['tennis:skid:you','tennis:matchpoint:you','tennis:streak:4','tennis:comeback','tennis:bounce:.6:you:hard:12','tennis:kick:you:good:lob:9:.5:0:0','tennis:kick:you:good:auto:8:.9:0:0']){const n=made;audio.tennisSound(ac,cue);assert(made>n,`${cue} makes a sound`);assert(live<=14,'voice cap holds');await tick();}
 assert(made-before<=60,'new cues stay light');
 for(let i=0;i<6;i++)audio.tennisSound(ac,'tennis:matchpoint:both');assert(live<=14,'a burst of cues never passes the voice cap');
 await tick();assert.equal(live,0,'every voice frees itself');
 console.log('PASS tennis arena + feel: court paint, pools, confetti, desktop crowd, celebrations, plant + ready bounce, streak/comeback/match-point calls, new sound cues');})().catch(e=>{console.error(e);process.exit(1);});
