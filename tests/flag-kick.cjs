// Kicking a plaza flag pole (Nov 13 2026, owner N1): the press goes to a pole in reach ahead (lib/town/flagKick.ts), plays the tree
// kick's pose and, at contact, the flag's own kick animation (plazaFlags.ts kickFlag): the pole shakes hard and the cloth whips,
// stronger than a ball's or a walker's sway, then settles to exactly zero; reduced motion is the gentle version; shader-driven
// with fixed uniform arrays (no allocation). usage: node tests/flag-kick.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,performance,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){let file=path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const e of ['.ts','.tsx'])if(fs.existsSync(file+e)){file+=e;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id));cache.set(file,mod.exports);return mod.exports;}
const K=load('lib/town/flagKick.ts'),F=load('lib/town/plazaFlags.ts'),{plazaFlagPoles}=load('lib/town/stadiumSeats.ts'),{PROP_REACTIONS}=load('lib/graphics/propReactions.ts'),{TREE_KICK_CONTACT}=load('lib/graphics/jobPoses.ts');
const poles=plazaFlagPoles(),p0=poles[3];

// ---- 1. Which pole a press goes to.
const yawTo=(x,z,t)=>Math.atan2(t.x-x,t.z-z);
assert.equal(K.flagKickTarget(poles,p0.x-1.1,p0.z,yawTo(p0.x-1.1,p0.z,p0)),3,'a pole in reach ahead takes the press');
assert.equal(K.flagKickTarget(poles,p0.x-1.1,p0.z,yawTo(p0.x-1.1,p0.z,p0)+Math.PI),-1,'not one behind');
assert.equal(K.flagKickTarget(poles,p0.x-3,p0.z,yawTo(p0.x-3,p0.z,p0)),-1,'not one out of reach');
{const st=K.flagKickStance(p0,Math.PI);assert(Math.hypot(st.root.x-p0.x,st.root.z-p0.z)>.15+.3+.32,'the stance is clear of the pole collider');}

// ---- 2. The runtime: take the press, pose, one strike at contact, cooldown.
{const log=[];let press=null,ball=false;const kick=K.createFlagKick({poles,pressed:()=>press,hasBall:()=>ball,take:()=>{log.push('take');press=null;},pose:(p,how)=>log.push(['pose',how.lead]),strike:(k,dx,dz)=>log.push(['strike',k,dx,dz])});
 const at={x:p0.x-1.2,z:p0.z},inp=o=>({dt:1/60,x:at.x,z:at.z,yaw:yawTo(at.x,at.z,p0),onFoot:true,canEnter:true,reduced:false,...o});
 kick.update(inp({x:500,z:500}));assert(kick.stats.idle===1,'off the plaza: one box test');
 // Kick audit (Nov 13 2026): with the ball at the feet the press is always the shot; without it, the pole takes the kick.
 ball=true;press={};kick.update(inp());assert.equal(log.length,0,'with the ball: the press stays a shot');ball=false;press=null;kick.update(inp());
 press={};kick.update(inp());assert.equal(log[0],'take','without the ball: the press is taken (no shot)');assert.equal(log[1][0],'pose','the kick pose plays');
 for(let i=0;i<120;i++)kick.update(inp());const strikes=log.filter(e=>e[0]==='strike');assert.equal(strikes.length,1,'one strike');assert.equal(strikes[0][1],3);assert(strikes[0][2]>.9,'along the kick');
 assert(!kick.kicking,'done');press={};kick.update(inp({onFoot:false}));assert.equal(log.filter(e=>e==='take').length,1,'riding: the press stays a shot');
 const k2=K.createFlagKick({poles,pressed:()=>press,take:()=>{press=null;},pose(){},strike(){}});press={};k2.update(inp());press={};k2.update(inp({dt:.1}));assert.equal(k2.stats.kicks,1,'cooldown: no second kick at once');}

// ---- 3. The flag: its own animation, stronger than the sway, settling to exactly zero; reduced is gentle.
const flags=F.createPlazaFlags(poles),whipRef=flags.whip,shakeRef=flags.shake;
let maxA=0,maxW=0;flags.kickFlag(3,1,0,false);for(let t=0;t<3.2;t+=1/60){flags.update(1/60,false);maxA=Math.max(maxA,Math.abs(flags.shake[9]));maxW=Math.max(maxW,flags.whip[3]);
 for(let k=0;k<poles.length;k++)if(k!==3)assert.equal(flags.shake[k*3],0,'only the kicked flag shakes');}
const swayMax=PROP_REACTIONS.flag.tilt;// a hard ball's tilt (a walker's bump is ~40% of it)
assert(maxA>swayMax,`the pole shakes harder than a ball's sway (${maxA.toFixed(3)} > ${swayMax})`);
assert(F.FLAG_KICK.whipAmp*maxW+F.FLAG_WAVE.kickAmp>F.FLAG_WAVE.kickAmp*1.8,'the cloth whips far harder than the flutter');
assert.equal(flags.shake[9],0);assert.equal(flags.whip[3],0);assert(!flags.kicking,'it settles to exactly zero');
assert(flags.whip===whipRef&&flags.shake===shakeRef&&flags.uniforms.uWhip.value===whipRef&&flags.uniforms.uShake.value===shakeRef,'fixed uniform arrays (no allocation)');
{let r=0;flags.kickFlag(3,0,1,true);for(let t=0;t<2;t+=1/60){flags.update(1/60,true);r=Math.max(r,Math.abs(flags.shake[9]));}assert(r>0&&r<maxA*.4,'reduced motion: a gentle version');assert(!flags.kicking);}
for(let a=0;a<3;a+=.05){const f=F.flagKickAt(a),g=F.flagKickAt(a,true);assert(Math.abs(g.angle)<=Math.abs(f.angle)+.11&&g.whip<=f.whip+1e-9);}
// ---- 4. The shader: the kick's uniforms and the tilt about the foot are compiled in.
{const sh={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};flags.material.onBeforeCompile(sh);
 assert(/uniform vec3 uShake\[14\]/.test(sh.vertexShader)&&/uniform float uWhip\[14\]/.test(sh.vertexShader)&&/uFoot\[fI\]/.test(sh.vertexShader),'the shader reads the kick');
 assert(sh.uniforms.uShake===flags.uniforms.uShake&&sh.uniforms.uWhip===flags.uniforms.uWhip,'the shader shares the uniform objects');}
flags.dispose();
// ---- 5. Town wiring.
const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
assert(/createFlagKick\(\{poles:world\.plazaFlags\.poles,pressed:\(\)=>shotHold\.current,take:cancelShotHold/.test(town),'Town hands the kick the press');
assert(/jobMoves\.start\('treekick',jobPlayer\(\),pole/.test(town)&&/world\.plazaFlags\.kickFlag\(k,dx,dz,reduced\)/.test(town)&&/flagKick\.update\(\{/.test(town),'pose, strike and update wired');
assert(TREE_KICK_CONTACT>0&&TREE_KICK_CONTACT<1);
console.log(`flag kick: ok (peak tilt ${(maxA*180/Math.PI).toFixed(1)}°, ball sway ${(swayMax*180/Math.PI).toFixed(1)}°)`);
})().catch(e=>{console.error(e);process.exit(1);});
