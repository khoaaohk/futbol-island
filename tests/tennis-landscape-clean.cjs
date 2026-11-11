// Futbol Tennis, Oct 27 2026 (owner): played sideways like Strikers (requestLandscape + RotateLock + a 4:3 frame in tall windows),
// no crowd (no stands, fans, umpire or crowd sounds) and a clean court in play (score, controls and a short point line only).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const T=require('three'),root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx2d=new Proxy({},{get:(o,k)=>k==='measureText'?()=>({width:10}):k==='canvas'?o.canvas:k in o?o[k]:()=>({addColorStop(){}}),set:(o,k,v)=>{o[k]=v;return true;}});
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
const dataset={},document={hidden:false,documentElement:{dataset},createElement:()=>{const c={width:0,height:0,getContext:()=>{ctx2d.canvas=c;return ctx2d;}};return c;}};
const locks=[],screen={orientation:{lock:o=>{locks.push(o);return Promise.resolve();}}};
const stubs={'@/lib/graphics/player':{MOVE_PHASE:{bicycle:{contact:.4},scissor:{contact:.35}}},'../games/sound':{isSoundEnabled:()=>true,getSoundVolume:()=>1}};
const cache=new Map();
function resolve(from,id){if(id.startsWith('@/'))return path.join(root,id.slice(2))+'.ts';return path.resolve(path.dirname(from),id)+'.ts';}
function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,Array,Object,String,Float32Array,Float64Array,Set,Map,WeakMap,Proxy,Promise,console,document,localStorage,screen,navigator:{vibrate:()=>true},performance,matchMedia:()=>({matches:false}),
  require:id=>stubs[id]??(id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id))});return m.exports;}

// 1. Tennis stays PORTRAIT (owner, Oct 27 2026: "football tennis should not play horizontal"): it never asks for landscape; only Breakaway does.
const game3d=read('components/games/ArcadeGame3D.tsx');
// Nov 11 2026: Breakaway no longer asks for landscape either; it plays upright or sideways (requestAnyOrientation, tests/runner-upright.cjs).
assert.match(game3d,/useEffect\(\(\)=>kind==='runner'\?requestAnyOrientation\(\):undefined,\[kind\]\);/,'only the runner kind changes the orientation rule (either way up)');assert.doesNotMatch(game3d,/requestLandscape/,'no 3D arcade game asks for landscape');
assert.doesNotMatch(game3d,/kind==='tennis'\?requestLandscape/,'tennis does not ask for landscape');
const css=read('components/games/ArcadeGame3D.module.css');
assert.doesNotMatch(css,/Sideways phones: stick on the left thumb/,'no sideways tennis layout');
assert.doesNotMatch(css,/height:75vw;max-height:100dvh[^}]*\n[^}]*tennis|tennis\]\{isolation:isolate;height:75vw/,'no 4:3 tennis frame');
assert.match(css,/\.game\[data-arcade-kind=tennis\] \.headerScore span,\.game\[data-arcade-kind=tennis\] \.message,\.game\[data-arcade-kind=tennis\] \[data-tennis-chips\]\{display:none\}/,'no tips, captions or chips over the court');
assert.match(game3d,/window\.addEventListener\('blur',pause\)/);

// 2. No crowd in the tennis scene, on desktop or phone (fewer draws): only paint, floodlights, two pools and confetti.
const arenaSrc=read('lib/arcade/tennisArena.ts');
assert.doesNotMatch(arenaSrc,/tennis-crowd|tennis-stands|umpire\b.*InstancedMesh|tennisFanLift|fansPerRow/,'no crowd code left');
// Club Marea (Nov 10 2026, arcade AAA rebuild): the plain backdrop is replaced by the beach-club world built by the look's environment.
assert.match(read('lib/arcade/games/tennisGame.ts'),/const world=stage\.scenery\.userData\.tennisWorld as TennisWorld/,'the court sits in the Club Marea world (lib/arcade/tennisWorld.ts)');assert.doesNotMatch(read('lib/arcade/games/tennisGame.ts'),/createGlassFloor|stage\.scenery\.visible=false/,'no neon glass floor, the world stays visible');
const game=load('lib/games/soccerTennis.ts'),arenaMod=load('lib/arcade/tennisArena.ts'),feelMod=load('lib/arcade/tennisFeel.ts'),audio=load('lib/arcade/tennisAudio.ts');
const banned=/crowd|fan|stand|spectator|audience|umpire|bleacher/i;
for(const mobile of[false,true]){
 const scene=new T.Scene(),stage={scene,camera:new T.PerspectiveCamera(),reduced:false,mobile,burst(){}};
 const s=game.createTennis(47,1),arena=arenaMod.createTennisArena(stage,s);
 const names=[];let meshes=0;scene.traverse(o=>{if(o.name)names.push(o.name);if(o.isMesh)meshes++;});
 assert.deepEqual(names.filter(n=>banned.test(n)),[],`${mobile?'phone':'desktop'}: no crowd objects`);
 assert.equal(meshes,3,`${mobile?'phone':'desktop'}: arena = 2 player discs + confetti (${meshes}); comic house style dropped the floodlight glow quad, and the court marks are baked into the world's court sheet`);
 arena.cheer('you',true);arena.roar(12);for(let i=0;i<120;i++)arena.sync(1/30);assert.equal(arena.active(),false,'celebrations settle without a crowd');
 arena.dispose();
}

// 3. Clean court: in play no label shows over the court; after a point only the short point line (no sub-line).
{const scene=new T.Scene(),stage={scene,camera:new T.PerspectiveCamera(),reduced:false,mobile:true,burst(){}};
 const s=game.createTennis(47,2),feel=feelMod.createTennisFeel(stage,s,()=>{});
 const shown=()=>['tennis-touch-label','tennis-intent-label','tennis-banner'].filter(n=>scene.getObjectByName(n).visible);
 s.phase='rally';s.rally=1;s.wind=.6;s.rivalFake=true;s.fakeShown=true;s.goldReady=true;s.wrongFooted++;s.kickCount++;s.ball.last='you';
 for(let i=0;i<20;i++){s.clock+=1/30;s.rally=Math.min(20,s.rally+1);feel.sync(1/30,0);assert.deepEqual(shown(),[],'no in-play text over the court');}
 s.score.you++;s.pointsPlayed++;s.pointWinner='you';s.phase='point';s.phaseTime=0;feel.sync(1/30,0);
 assert.deepEqual(shown(),['tennis-banner'],'a short line after the point');
 feel.dispose();}
const feelSrc=read('lib/arcade/tennisFeel.ts');
assert.match(feelSrc,/if\(!pointLine\)return;sub='';/,'labels draw only for the point line, never with a sub-line');

// 4. No crowd sounds: no murmur, gasp, "ooh", hush or applause layers.
const audioSrc=read('lib/arcade/tennisAudio.ts');
assert.doesNotMatch(audioSrc,/\/\/ applause|crowd gasp|crowd hushes|crowd 'ooh'|Crowd leans in|disappointed murmur/);
let made=0;const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
const node=(x={})=>({connect(){},disconnect(){},...x}),ac={state:'running',currentTime:0,sampleRate:800,destination:{},
 createOscillator(){made++;return node({type:'',frequency:param(),start(){},stop(){}});},createBufferSource(){made+=100;return node({buffer:null,start(){},stop(){}});},
 createGain:()=>node({gain:param()}),createBiquadFilter:()=>node({type:'',Q:{value:0},frequency:param()}),createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
// Club Marea (Nov 10 2026, arcade AAA rebuild; the brief asks for a sea bed and polite club applause): points now end with the umpire's bell and
// applause (one cached clap buffer, one voice) over a surf swell; still no gasps, murmurs or 'ooh' reactions (regex above), no timers, no loops.
for(const cue of['tennis:point:rival:3']){/* one cue: this fake context never ends a voice, so a second cue would hit the voice cap */made=0;audio.tennisSound(ac,cue);assert(made>=100&&made<400,`${cue}: bell + one applause voice + at most one surf swell`);}
assert.match(audioSrc,/function applause\(/);assert.match(audioSrc,/function surf\(/);assert.doesNotMatch(audioSrc,/setInterval|setTimeout/,'the bed is scheduled from cues: no timers');
console.log('PASS tennis clean court: stays portrait, no crowd meshes or crowd sounds, only the point line over the court');
