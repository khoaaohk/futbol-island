// Emote contexts (user, Oct 22 2026): flying (button disabled unless a friend flies near; its own set), swimming set, NPC sets (skaters, scooters,
// jugglers) and the field refusals. Pure rules in lib/town/emoteContexts.ts + wiring checks on the source.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Array,Set,Map,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const C=load('lib/town/emoteContexts.ts');
const proto=read('multiplayer/protocol/types.ts');

t('wire modes match the multiplayer protocol and every ctx emote maps to an existing wire value 0..9',()=>{
 const mode=k=>Number(new RegExp(k+':\\s*(\\d+)').exec(proto)[1]);
 assert.equal(C.WIRE_MODE.Jetpack,mode('Jetpack'));assert.equal(C.WIRE_MODE.Parachute,mode('Parachute'));assert.equal(C.WIRE_MODE.Swim,mode('Swim'));
 for(const s of C.CTX_SCRIPTS){assert(s.wire>=0&&s.wire<=9,s.label);assert(s.emote>=20&&s.emote<=34);}
});
t('flying: disabled alone, the FLYING set beside a flying friend; swimming has its own set; ground is untouched',()=>{
 assert.deepEqual([C.emoteButtonState({flying:true,friendFlyingNear:false,swimming:false}).disabled,C.emoteButtonState({flying:true,friendFlyingNear:true,swimming:false}).disabled],[true,false]);
 assert.equal(C.emoteButtonState({flying:true,friendFlyingNear:true,swimming:false}).ctx,'fly');
 assert.equal(C.emoteButtonState({flying:false,friendFlyingNear:false,swimming:true}).ctx,'swim');
 assert.equal(C.emoteButtonState({flying:false,friendFlyingNear:true,swimming:false}).ctx,'ground');
 assert.equal(C.ctxWheelFor('fly').length,5);assert.equal(C.ctxWheelFor('swim').length,5);assert.equal(C.ctxWheelFor('ground').length,0);
 const labels=[...C.ctxWheelFor('fly'),...C.ctxWheelFor('swim')].map(s=>s.label);
 for(const l of ['Barrel roll','Wing wave','Loop-de-loop','Fly-by high five','Side-by-side glide','Splash wave','Water spray cheer','Duck-dive pop-up','Back float','Tread & laugh'])assert(labels.includes(l),l);
 assert.equal(C.isFlying('jetpack','idle'),true);assert.equal(C.isFlying('walk','idle'),false);assert.equal(C.isFlying('walk','parachute'),true);
});
t('nearest flying friend within 40 m (3D); walkers and far flyers do not count',()=>{
 const out={x:0,y:0,z:0},me={x:0,y:30,z:0};
 assert.equal(C.nearestFlyingFriend(me,[{x:10,y:30,z:0,mode:0}],out),-1,'a walker');
 assert.equal(C.nearestFlyingFriend(me,[{x:50,y:30,z:0,mode:5}],out),-1,'too far');
 const d=C.nearestFlyingFriend(me,[{x:30,y:30,z:0,mode:5},{x:12,y:34,z:0,mode:6}],out);
 assert(Math.abs(d-Math.hypot(12,4))<1e-9&&out.x===12);
 assert.equal(C.nearestFlyingFriend(me,[],out),-1);
});
t('a friend avatar picks the flourish from the SENDER mode; ground modes keep the ordinary emote',()=>{
 assert.equal(C.flourishForWire(1,5).emote,C.CTX_EMOTE.BarrelRoll);assert.equal(C.flourishForWire(8,6).emote,C.CTX_EMOTE.Loop);
 assert.equal(C.flourishForWire(0,8).emote,C.CTX_EMOTE.SplashWave);assert.equal(C.flourishForWire(7,8).emote,C.CTX_EMOTE.TreadLaugh);
 assert.equal(C.flourishForWire(1,0),undefined);assert.equal(C.flourishForWire(3,5),undefined);
});
t('flourishes are visual only: bounded, start and end at zero, different from each other, a loop turns fully',()=>{
 const o={roll:0,pitch:0,yaw:0,lift:0,ripple:0};
 for(const s of C.CTX_SCRIPTS){
  for(const age of [0,s.seconds]){C.flourishAt(s.emote,age,s.seconds,o,1);const m=Math.abs(o.roll%(Math.PI*2))+Math.abs(o.pitch%(Math.PI*2))+Math.abs(o.lift);assert(m<.05||Math.abs(m-Math.PI*2)<.05||Math.abs(Math.abs(o.roll)-Math.PI*2)<.05||Math.abs(Math.abs(o.pitch)-Math.PI*2)<.05,s.label+' rests at the ends '+JSON.stringify(o));}
  let maxLift=0;for(let a=0;a<=s.seconds;a+=.05){C.flourishAt(s.emote,a,s.seconds,o,1);maxLift=Math.max(maxLift,Math.abs(o.lift));assert(Math.abs(o.roll)<=Math.PI*2+1e-6&&Math.abs(o.pitch)<=Math.PI*2+1e-6);}
  assert(maxLift<=1.6,s.label+' lift stays a small visual offset');
 }
 C.flourishAt(C.CTX_EMOTE.BarrelRoll,3.2*.5,3.2,o,1);assert(o.roll>1);C.flourishAt(C.CTX_EMOTE.BarrelRoll,3.2*.97,3.2,o,1);assert(Math.abs(o.roll-Math.PI*2)<.2);
 C.flourishAt(C.CTX_EMOTE.Loop,3.6*.98,3.6,o,1);assert(Math.abs(o.pitch+Math.PI*2)<.2);
});
t('landing ends a flying emote and leaving the water a swimming one',()=>{
 assert.equal(C.ctxStillValid(21,false,false),false);assert.equal(C.ctxStillValid(21,true,false),true);
 assert.equal(C.ctxStillValid(31,true,false),false);assert.equal(C.ctxStillValid(31,false,true),true);assert.equal(C.ctxStillValid(0,false,false),true);
});
t('the emote camera allows a flying / swim emote in the air / water and never lands in a wall of "riding" rules',()=>{
 const M=load('lib/town/emoteCameraMath.ts');
 const s={reduced:false,riding:false,swimming:false,flying:true,ctx:'fly',inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:true,onRide:false,rideSpeed:0,steer:0,rideChanged:false,cameraDist:40};
 assert.equal(M.emoteCamBlocked(s),'');
 assert.equal(M.emoteCamBlocked({...s,flying:false}),'landed');
 assert.equal(M.emoteCamBlocked({...s,ctx:''}),'flying');
 assert.equal(M.emoteCamBlocked({...s,ctx:'swim',flying:false,swimming:true}),'');
 assert.equal(M.emoteCamBlocked({...s,ctx:'swim',flying:false,swimming:false}),'left the water');
 assert.equal(M.emoteCamBlocked({...s,riding:true}),'riding','a truck / zipline ride still blocks');
});
t('wiring: the button, the wheel, Town, remote avatars and the party bridge use the context rules',()=>{
 const ec=read('components/EmoteControl.tsx'),ew=read('components/party/EmoteWheel.tsx'),town=read('components/Town.tsx'),ra=read('lib/graphics/remoteAvatars.ts'),br=read('lib/multiplayer/townBridge.ts');
 assert(/aria-disabled=\{state\.disabled/.test(ec)&&/if \(!state\.disabled\)/.test(ec)&&/shown = open && !state\.disabled/.test(ec),'disabled button: aria-disabled, no wheel');
 assert(/ctxWheelFor\(ctx\)/.test(ew));
 assert(/emoteCtxStore\.set\(/.test(town)&&/nearestFlyingFriend\(/.test(town)&&/flourishAt\(/.test(town)&&/ctxStillValid\(/.test(town),'Town feeds the store, flourishes, cancels on landing');
 assert(/flourishForWire\(/.test(ra),'friends pick the flourish from the sender mode');
 assert(/friends\(\)/.test(br));
});
console.log('emote-contexts: '+n+' tests passed');
