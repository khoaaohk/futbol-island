// Slow walks and 30 fps turns keep planted boots planted (A7, Oct 2026). Run: node tests/player-slow-gait.cjs
// 1. Island NPCs stroll at .65–.92 m/s and a part-tilted stick walks slowly; the gait's step length used to shrink with
//    speed while the cycle still advanced by distance, so stance boots slid 12–30 % of the distance travelled.
// 2. At the 30 fps phone cap a 34 ms chop step landed in one frame: a grounded boot jumped ~27 cm with no lift.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,performance,Float64Array});return m.exports;}
const ROOT=path.join(__dirname,'..');
const {createPlayer,ROLE_PROFILES}=load(path.join(ROOT,'lib/graphics/player.ts')),{stepPlayer}=load(path.join(ROOT,'lib/town/simulation.ts'));
// Ground skid: an ankle at sole height (< 8 cm) moving faster than .25 m/s.
function skid(drive,fps,frames,profile='you',id='slow-'+profile){
 const r=createPlayer(id,'home',false);r.setProfile(ROLE_PROFILES[profile]);const ank=['left-ankle','right-ankle'].map(n=>r.root.getObjectByName(n)),prev=[new T.Vector3(),new T.Vector3()],cur=new T.Vector3(),dt=1/fps;
 let slide=0,travel=0,worstJump=0,px=0,pz=0;
 for(let f=0;f<frames;f++){const p=drive(f,dt);travel+=Math.hypot(p.x-px,p.z-pz);px=p.x;pz=p.z;r.update(p.x,p.z,dt,f*dt,false,p.motion);r.root.updateMatrixWorld(true);
  for(let i=0;i<2;i++){ank[i].getWorldPosition(cur);if(f>fps&&cur.y<.08&&prev[i].y<.08){const d=Math.hypot(cur.x-prev[i].x,cur.z-prev[i].z);if(d/dt>.25)slide+=d;worstJump=Math.max(worstJump,d);}prev[i].copy(cur);}}
 r.dispose();return{perMetre:slide/Math.max(.01,travel),worstJump};
}
const report={};
for(const fps of[30,60])for(const v of[.5,.65,.8,.9,1.1])for(const prof of['you','npc','def','fwd']){
 const s=skid((f,dt)=>({x:0,z:f*dt*v,motion:{facing:0}}),fps,fps*4,prof);report[`${prof}@${v}/${fps}`]=+s.perMetre.toFixed(3);
 assert(s.perMetre<.02,`steady ${v} m/s (${prof}, ${fps} fps): boots stay planted, skid ${s.perMetre.toFixed(3)} m per metre`);
}
// The real walking controller weaving at the phone cap (and at 60 fps): no grounded boot jumps along the pitch.
for(const fps of[30,60])for(const id of['h','slalom-a','slalom-b','you','npc-7'])for(const w of[2.4,3]){const loc={x:0,z:0},vel={x:0,z:0};
 const s=skid((f,dt)=>{const t=f*dt,sx=Math.sin(t*w),sy=-1,ix=sx*.857+sy*.515,iz=-sx*.515+sy*.857;stepPlayer(loc,vel,{x:ix,z:iz,sprint:false},dt,[],'walk');return{x:loc.x,z:loc.z,motion:{intentHeading:Math.atan2(ix,iz),brake:0,travelMode:'walk'}};},fps,fps*5,'you',id);
 const key=`slalom/${fps}/${id}/${w}`;report[key]=+(s.worstJump*100).toFixed(1);
 assert(s.worstJump<.1,`${key}: a grounded boot moved ${(s.worstJump*100).toFixed(1)} cm in one frame`);
 assert(s.perMetre<.01,`${key}: skid ${s.perMetre.toFixed(3)} m per metre`);
}
// `windup` (Rooftop Knockout's request): the support boot plants, the kicking leg draws back and up; the strike then
// continues from kick .15. Absent, it changes nothing.
{const a=createPlayer('wind','home',false),b=createPlayer('wind','home',false),W=(r,n)=>r.root.getObjectByName(n).getWorldPosition(new T.Vector3());
 for(let f=0;f<80;f++){const w=f<10?undefined:Math.min(1,(f-10)/40);a.update(0,0,1/60,f/60,false,{facing:0,windup:w,kickSide:1,shotPower:.6});b.update(0,0,1/60,f/60,false,{facing:0,kickSide:1,shotPower:.6});
  a.root.updateMatrixWorld(true);b.root.updateMatrixWorld(true);if(f<10)assert(W(a,'right-ankle').distanceTo(W(b,'right-ankle'))<1e-9,'no windup field, no change');}
 const kickBoot=W(a,'right-ankle'),support=W(a,'left-ankle');
 assert(kickBoot.y>.25&&kickBoot.z<-.25,'wound up: kicking leg drawn back and up '+kickBoot.toArray().map(v=>v.toFixed(2)));
 assert(support.y<.09&&support.z>.1,'wound up: support boot planted beside the ball '+support.toArray().map(v=>v.toFixed(2)));
 a.dispose();b.dispose();}
console.log('PLAYER_SLOW_GAIT_PASS',JSON.stringify(report));
