// Rooftop Knockout polish (Oct 4 2026, A6): telegraphed bot kicks, fairness, difficulty ramp, knock-back, solid bodies,
// aim assist, kick-on-press with buffer, dodge, hit-stop events and pooled telegraph meshes.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),ts=require(process.cwd()+'/node_modules/typescript'),T=require(process.cwd()+'/node_modules/three');
const cache=new Map(),context={fillStyle:'',beginPath(){},roundRect(){},fill(){},fillText(){},fillRect(){},createRadialGradient(){return{addColorStop(){}};},moveTo(){},lineTo(){},stroke(){},save(){},restore(){},translate(){},scale(){}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,WeakMap,document:{createElement:()=>({getContext:()=>context})},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(require.resolve(id,{paths:[process.cwd()]}))});return m.exports;}
const K=load('lib/games/rooftopKnockout.ts'),{createKnockout,botTuning,START_GRACE,AIM_LOCK,MAX_LEVEL}=K,{HIT_RECOVERY}=load('lib/games/knockoutAnimation.ts');
const solo=(level=0)=>{const g=createKnockout({level,seed:3});g.start();g.state.players.slice(2).forEach(p=>{p.alive=false;});g.state.remaining=2;return g;};
// 1. No bot kicks during the start grace, and every bot kick is preceded by a planted wind-up.
{const g=createKnockout({seed:5});g.start();let firstKick=Infinity;const windups=new Set();
 for(let i=0;i<60*20;i++){for(const p of g.state.players)if(p.id&&p.windup>0)windups.add(p.id);const before=g.state.events.botKicks;g.update(1/60,{x:0,z:0});if(g.state.events.botKicks>before&&firstKick===Infinity)firstKick=g.state.time;}
 assert(firstKick>=START_GRACE+botTuning(0).windup-.02,'no shot before grace + a full wind-up ('+firstKick+')');assert(windups.size>0);}
{const g=solo();const me=g.state.players[0],bot=g.state.players[1];Object.assign(me,{x:0,z:10});Object.assign(bot,{x:0,z:3,cooldown:0});Object.assign(g.state.balls[0],{x:0,z:3.6});g.state.time=START_GRACE;
 g.update(1/60,{x:0,z:0});assert(bot.windup>0&&bot.target===0,'bot plants and winds up at the user');const lockedAt=bot.windupTotal*(1-AIM_LOCK);
 const kicks=g.state.events.botKicks;let positions=[];while(bot.windup>0){positions.push(bot.x);g.update(1/60,{x:0,z:0});}
 assert.equal(g.state.events.botKicks,kicks+1,'wind-up ends in exactly one kick');assert(Math.max(...positions)-Math.min(...positions)<.15,'bot stays planted while winding up');
 assert(lockedAt>.25,'the locked aim leaves a readable reaction window');}
// 2. Aim locks: after the lock, moving the target does not move the arrow.
{const g=solo(MAX_LEVEL);const me=g.state.players[0],bot=g.state.players[1];Object.assign(me,{x:0,z:10});Object.assign(bot,{x:0,z:3,cooldown:0});Object.assign(g.state.balls[0],{x:0,z:3.6});g.state.time=START_GRACE;g.update(1/60,{x:0,z:0});
 while(bot.windup>bot.windupTotal*(1-AIM_LOCK)-.02)g.update(1/60,{x:0,z:0});const yaw=bot.aimYaw;Object.assign(me,{x:4,z:10});g.update(1/60,{x:0,z:0});assert.equal(bot.aimYaw,yaw,'aim is locked: sidestepping beats it');}
// 3. Only one bot winds up at the user at a time when another target is available.
{let overlap=0;for(let s=1;s<=6;s++){const g=createKnockout({seed:s,level:MAX_LEVEL});g.start();for(let i=0;i<60*30&&g.state.phase==='playing';i++){g.update(1/60,{x:0,z:0});if(g.state.players.filter(p=>p.id&&p.alive&&p.windup>0&&p.target===0).length>1)overlap++;}}assert(overlap<30,'bots rarely double-team the user ('+overlap+' frames)');}
// 4. Difficulty ramp is monotonic.
{const a=botTuning(0),b=botTuning(1);assert(b.windup<a.windup&&b.shotSpeed>a.shotSpeed&&b.aimError<a.aimError&&b.lead>a.lead);assert(a.runSpeed<3.7,'level-0 bots are slower than the walking user');assert(a.windup>=.8);}
// 5. Knock-back along the shot, walls stop it, and recovery is short.
{const g=solo();const me=g.state.players[0];g.state.players[1].cooldown=999;Object.assign(me,{x:0,z:12});Object.assign(g.state.balls[0],{x:0,z:13,vx:0,vz:-14,owner:1,life:5,heldBy:-1,shotAge:1});for(let i=0;i<5&&!me.hits;i++)g.update(1/60,{x:0,z:0});
 assert.equal(me.hits,1);assert(me.kz<0,'knock-back follows the ball');const z=me.z;for(let i=0;i<60;i++)g.update(1/60,{x:0,z:0});assert(z-me.z>.5&&z-me.z<1.2,'slides about a body length');assert(HIT_RECOVERY<=1.2);
 assert.equal(g.state.hitLog.filter(h=>h.victim===0).length,1,'impact logged for effects');}
// 6. Bodies do not overlap.
{const g=solo();const me=g.state.players[0],bot=g.state.players[1];bot.cooldown=999;Object.assign(me,{x:0,z:10});Object.assign(bot,{x:.1,z:10.1});g.update(1/60,{x:0,z:0});assert(Math.hypot(bot.x-me.x,bot.z-me.z)>=K.BODY_RADIUS*2-.01,'bot is pushed out of the user');assert.equal(me.x,0,'the user is never shoved by the arena');}
// 7. Aim assist: snaps inside the cone, leads a runner, ignores shielded and out-of-cone targets.
{const g=solo();const me=g.state.players[0],bot=g.state.players[1];Object.assign(me,{x:-10,z:-4,yaw:0});Object.assign(bot,{x:-8.5,z:4,vx:0,vz:0});const direct=Math.atan2(1.5,8);assert(Math.abs(g.assistAim(0,0)-direct)<.02);
 bot.vx=3;assert(g.assistAim(0,0)>direct+.05,'leads a runner');bot.shield=2;assert.equal(g.assistAim(0,0),0,'shielded players are not assisted');bot.shield=0;assert.equal(g.assistAim(0,Math.PI/2),Math.PI/2,'outside the cone keeps your aim');}
// 8. Live controls: kick fires on press, release does not double-kick, presses are buffered, J dodges.
{const {createLiveKnockout,KICK_BUFFER,DODGE_SPEED}=load('lib/graphics/liveKnockout.ts');const scene=new T.Scene(),arena=createLiveKnockout(scene),camera=new T.PerspectiveCamera(50,1,.1,500);camera.position.set(66,40,200);camera.lookAt(66,10,151.75);camera.updateMatrixWorld(true);
 const at={x:66,z:151.75+12};const step=(dt=1/30)=>arena.update(dt,at,10.23,true,camera,true,false,Math.PI);
 step();assert(arena.joined);for(let i=0;i<100;i++)step();const s=arena.state,me=s.players[0];s.players.slice(1).forEach(p=>{p.cooldown=999;p.x=10;p.z=-19;});
 const input={kick:false,juggle:false,charging:false,shotPower:0};s.balls.forEach((b,i)=>Object.assign(b,{x:-11+i*.8,z:-23,heldBy:-1,life:0,vx:0,vz:0}));step();
 // press with no ball nearby, then the ball arrives within the buffer
 input.charging=true;arena.buttons(input);step(.05);assert.equal(s.events.kicks,0);Object.assign(s.balls[0],{x:0,z:11.5,life:0,heldBy:-1});step(.05);assert.equal(s.events.kicks,1,'buffered press kicks when the ball arrives');
 input.charging=false;input.kick=true;arena.buttons(input);assert.equal(input.kick,false);me.cooldown=0;Object.assign(s.balls[1],{x:0,z:11.5,life:0,heldBy:-1});step(.05);assert.equal(s.events.kicks,1,'release of the same press does not kick again');
 // tap between ticks arrives only as the release kick
 for(let i=0;i<20;i++)step();me.cooldown=0;input.kick=true;arena.buttons(input);step(.05);assert.equal(s.events.kicks,2,'a quick tap kicks');
 // stale press expires
 for(let i=0;i<20;i++)step();input.charging=true;arena.buttons(input);input.charging=false;arena.buttons(input);for(let i=0;i<Math.ceil(KICK_BUFFER/.05)+2;i++)step(.05);me.cooldown=0;const k=s.events.kicks;Object.assign(s.balls[2],{x:0,z:11.5,life:0,heldBy:-1});s.balls.forEach(b=>{if(b.heldBy===0)b.heldBy=-1;});step(.05);assert.equal(s.events.kicks,k,'an old press does not fire later');
 const v={x:0,z:0};input.juggle=true;arena.buttons(input);arena.steer(v,1,0,1/30);assert(Math.abs(v.x-DODGE_SPEED)<1e-9&&input.juggle===false,'J/Dodge bursts along the stick');const feint=arena.dodgeSkill;assert(feint&&feint.type==='bodyFeint'&&feint.progress>=0&&feint.progress<=1,'dodge drives the bodyFeint rig pose');for(let i=0;i<10;i++)arena.steer(v,1,0,1/30);v.x=0;input.juggle=true;arena.buttons(input);arena.steer(v,1,0,1/30);assert.equal(v.x,0,'dodge has a cooldown');
 const played=[];const sound={ball:k=>played.push(k),impact:()=>played.push('impact'),boost:()=>played.push('boost')};arena.feedback(sound,true);arena.feedback(sound,true);
 for(let i=0;i<20;i++){step();arena.steer(v,0,0,1/30);}assert.equal(arena.dodgeSkill,undefined,'feint pose ends');assert(typeof arena.status==='string'&&!/1 hits/.test(arena.status));arena.dispose();assert.equal(scene.children.length,0);}
// 9. Telegraph pools: bounded instances, hidden when idle, disposal.
{const {createKnockoutTelegraphs}=load('lib/graphics/knockoutTelegraphs.ts');const root=new T.Group(),tg=createKnockoutTelegraphs(root);const bots=Array.from({length:6},(_,i)=>({id:i+1,x:i,z:0,alive:true,windup:.3,windupTotal:.8,aimYaw:0,target:0}));const hits=Array.from({length:8},()=>({x:0,z:0,time:1,ko:true}));
 tg.update(bots,hits,1.1,1,{x:0,z:0},false);assert.equal(tg.visibleMeshes,3);tg.update(bots.map(b=>({...b,windup:0})),hits,9,0,null,false);assert.equal(tg.visibleMeshes,0,'idle telegraphs draw nothing');tg.dispose();assert.equal(root.children.length,0);}
console.log('PASS telegraphed planted wind-ups, start grace, aim lock, no double-teaming, difficulty ramp, knock-back, solid bodies, aim assist, kick-on-press + buffer, dodge, telegraph pools');
