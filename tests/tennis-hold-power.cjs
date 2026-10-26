// Futbol Tennis upgrade 2 (Oct 26 2026): hold-to-power for Kick / Lob / Drop. A tap is the old shot exactly; a hold
// winds up (sweet window, overhit penalty), each shot reads the charge its own way, the stick places it, the sim
// strikes for you at the last moment, the rival winds up (telegraphed) and reads your wind-up on later courts.
// Also the UI wiring (touch, mouse, keys, cancel paths), the court meter bands and the wind-up voice.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),cache=new Map();
let vibrations=[];const navigator={vibrate:p=>{vibrations.push(p);return true;}};
const stubs={'../games/sound':{isSoundEnabled:()=>true,getSoundVolume:()=>1}};
function resolve(from,id){if(id.startsWith('@/'))return path.join(root,id.slice(2))+'.ts';return path.resolve(path.dirname(from),id)+'.ts';}
function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,Array,Object,String,Float32Array,Set,Map,WeakMap,console,navigator,performance,localStorage:{getItem:()=>null},document:{hidden:false},matchMedia:()=>({matches:false}),
  require:id=>stubs[id]??(id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id))});return m.exports;}
const t=load('lib/games/soccerTennis.ts'),P=load('lib/games/tennisPower.ts');
const advance=(s,seconds,hz=120)=>{for(let i=0;i<Math.round(seconds*hz);i++)t.tickTennis(s,1/hz);};
/** A ball at your feet a beat after the bounce: any pressed shot strikes on the next step. */
function atFeet(level=1,extra={}){const s=t.createTennis(47,level);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0});
 Object.assign(s.ball,{x:.25,y:5.05,z:.32,vx:0,vy:.4,vz:.6,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:1});s.bounceAge=.1;return s;}
function strike(shot,level,{hold=0,stick=null,assist=0}={}){const s=atFeet(level);s.assist=assist;if(stick)t.setTennisMovement(s,stick[0],stick[1]);
 if(hold>0){assert(t.startTennisCharge(s,shot));s.chargeTime=hold;s.charge=P.tennisChargeLevel(hold);t.releaseTennisCharge(s);}else t.requestTennisKick(s,undefined,shot);
 const kicks=s.kickCount;advance(s,1/120);assert.equal(s.kickCount,kicks+1,`${shot} struck`);const land=t.tennisLanding(s),b=s.ball;return {s,land,vy:b.vy,vz:b.vz,speed:Math.hypot(b.vx,b.vy),apex:b.z+Math.max(0,b.vz)**2/(2*t.TENNIS.gravity)};}

// 1. Pure maths: bands, grades and amounts.
const C=P.TENNIS_CHARGE;assert(C.tap<C.soft&&C.soft<C.sweetLo&&C.sweetLo<C.sweetHi&&C.sweetHi<C.max);
assert.equal(P.tennisPowerGrade(.05),'',"a tap has no grade");assert.equal(P.tennisPowerGrade(.3),'soft');assert.equal(P.tennisPowerGrade(.6),'power');assert.equal(P.tennisPowerGrade(.9),'sweet');assert.equal(P.tennisPowerGrade(1.2),'over');
assert.equal(P.tennisChargeLevel(C.full),1,'a full hold reaches 1 in TENNIS_CHARGE.full seconds');assert.equal(P.tennisChargeLevel(99),C.max,'the hold caps');
assert.equal(P.tennisPowerAmount(.1),0);assert.equal(P.tennisPowerAmount(1.3),1);assert.equal(P.tennisOverAmount(.9),0);assert(P.tennisOverAmount(1.4)===1);
assert(P.tennisPowerQuality(.7,.9)>.7&&P.tennisPowerQuality(.7,1.35)<.6,'sweet cleans the touch, overhit dirties it');
assert(!P.tennisChargeable('header')&&!P.tennisChargeable('scissor')&&!P.tennisChargeable('trap')&&P.tennisChargeable('lob'),'aerial moves stay taps');
assert(P.tennisChargeFeet(1)<1&&P.tennisChargeFeet(0)===1,'feet slow a little while winding up');

// 2. A tap is the old shot, bit for bit; a press shorter than the tap threshold is a tap too.
for(const shot of ['auto','lob','drop']){const a=strike(shot,1),b=strike(shot,1,{hold:C.tap*C.full*.5});
 assert.equal(a.vy,b.vy,`${shot}: a quick press = tap (vy)`);assert.equal(a.vz,b.vz,`${shot}: a quick press = tap (vz)`);assert.equal(b.s.powerGrade,'');}

// 3. Each shot reads the hold its own way.
const tapKick=strike('auto',1),sweetKick=strike('auto',1,{hold:.9*C.full});
assert(sweetKick.speed>tapKick.speed*1.15,'held Kick: a harder drive');assert(sweetKick.apex<tapKick.apex,'held Kick: flatter');assert(sweetKick.land.y<tapKick.land.y-.3,'held Kick: deeper');
assert.equal(sweetKick.s.powerGrade,'sweet');assert.equal(sweetKick.s.sweetShots,1);assert.equal(sweetKick.s.powerEvents,1);assert.match(sweetKick.s.message,/SWEET STRIKE/);
assert(sweetKick.s.you.kickPower>tapKick.s.you.kickPower,'a wound-up strike hits harder (louder contact)');
const tapLob=strike('lob',1),sweetLob=strike('lob',1,{hold:.9*C.full});
assert(sweetLob.apex>tapLob.apex+.5,'held Lob: higher');assert(sweetLob.land.y<tapLob.land.y-.3,'held Lob: deeper');assert(sweetLob.land.time>tapLob.land.time,'held Lob: more hang time');
const tapDrop=strike('drop',1),sweetDrop=strike('drop',1,{hold:.9*C.full});
assert(sweetDrop.land.y>tapDrop.land.y,'held Drop: shorter, dies nearer the net');assert(sweetDrop.s.ball.wx*tapDrop.s.ball.wx>=0,'same spin direction');assert.match(sweetDrop.s.message,/SWEET DROP/);
// Overhit: the kick sails long and the drop catches the tape more often than the sweet version (over seeds).
let longOver=0,longSweet=0,dropOver=0,dropSweet=0;
for(let seed=1;seed<=40;seed++){for(const [hold,count] of [[1.4*C.full,'over'],[.9*C.full,'sweet']]){
 const k=atFeet(5);k.seed=seed;t.startTennisCharge(k,'auto');k.chargeTime=hold;k.charge=P.tennisChargeLevel(hold);t.releaseTennisCharge(k);advance(k,1/120);const f=t.tennisLanding(k);if(f.y<-8||Math.abs(f.x)>5){if(count==='over')longOver++;else longSweet++;}
 const d=atFeet(5);d.seed=seed;t.startTennisCharge(d,'drop');d.chargeTime=hold;d.charge=P.tennisChargeLevel(hold);t.releaseTennisCharge(d);advance(d,1/120);const g=t.tennisLanding(d);if(count==='over')dropOver+=-g.y;else dropSweet+=-g.y;}}
assert(longOver>longSweet,`overhit kicks land out more (${longOver} vs ${longSweet})`);assert(dropOver>dropSweet+40,`overhit drops float long, a sitter (${(dropOver/40).toFixed(1)} m vs ${(dropSweet/40).toFixed(1)} m)`);
const over=strike('auto',1,{hold:1.4*C.full});assert.equal(over.s.powerGrade,'over');assert.equal(over.s.overShots,1);assert.match(over.s.message,/OVERHIT/);

// 4. Placement: the stick at release. Up (toward the net) = deeper, down = shorter; sideways still aims.
const deep=strike('auto',1,{hold:.7*C.full,stick:[0,-1]}),short=strike('auto',1,{hold:.7*C.full,stick:[0,1]});
assert(deep.land.y<short.land.y-.8,'stick up sends it deeper than stick down');
const left=strike('auto',1,{hold:.7*C.full,stick:[-1,0]}),right=strike('auto',1,{hold:.7*C.full,stick:[1,0]});assert(left.land.x<right.land.x-2,'sideways still aims');

// 5. Holding is safe: cancel, point end, last-chance strike, slower feet, no hold on aerial moves.
let s=t.createTennis(47,1);t.beginTennis(s);assert(t.startTennisCharge(s,'lob'));advance(s,.2);assert(s.charge>0&&s.chargeShot==='lob');t.cancelTennisCharge(s);assert.equal(s.chargeShot,null);assert.equal(s.charge,0);
assert.equal(t.releaseTennisCharge(s),false,'nothing to release after a cancel');
assert.equal(t.startTennisCharge(s,'header'),false,'header is a tap');s.phase='point';assert.equal(t.startTennisCharge(s,'auto'),false,'no wind-up between points');
s=atFeet(1);t.startTennisCharge(s,'auto');s.phase='point';advance(s,1/120);assert.equal(s.chargeShot,null,'a point ending drops the hold');
// The ball passes you while you keep holding: the sim strikes at the last moment instead of letting the point go.
s=t.createTennis(47,1);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0});Object.assign(s.ball,{x:-.2,y:4.2,z:.4,vx:0,vy:2.4,vz:2.2,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:1});s.bounceAge=.3;
t.startTennisCharge(s,'auto');const k0=s.kickCount;for(let i=0;i<120&&s.kickCount===k0;i++)advance(s,1/120);assert.equal(s.kickCount,k0+1,'held through the contact: struck at the last chance');assert.equal(s.chargeShot,null);
const run=(hold)=>{const r=t.createTennis(47,1);r.phase='rally';r.aiReaction=99;Object.assign(r.ball,{x:0,y:-6,z:.3,vx:0,vy:0,vz:0,last:'you',crossed:false,bounces:0});Object.assign(r.you,{x:0,y:5,vx:0,vy:0});if(hold){t.startTennisCharge(r,'auto');r.chargeTime=C.full;}t.setTennisMovement(r,1,0);advance(r,.3);return r.you.x;};
assert(run(true)<run(false)*.95,'winding up slows your feet');
// Serve: hold Kick to serve harder.
s=t.createTennis(47,1);t.beginTennis(s);const servePlain=t.createTennis(47,1);t.beginTennis(servePlain);t.requestTennisKick(servePlain);advance(servePlain,1/120);
t.startTennisCharge(s,'auto');s.chargeTime=.9*C.full;s.charge=P.tennisChargeLevel(s.chargeTime);t.releaseTennisCharge(s);advance(s,1/120);
assert.equal(s.phase,'rally');assert(Math.hypot(s.ball.vx,s.ball.vy)>Math.hypot(servePlain.ball.vx,servePlain.ball.vy)*1.1,'a held serve is faster');

// 6. The rival winds up too (court 2+), telegraphs it, and reads your wind-up from court 4.
s=t.createTennis(47,1);s.phase='rally';s.rally=4;Object.assign(s.you,{x:0,y:5.3});Object.assign(s.ball,{x:0,y:-3,z:.5,vx:0,vy:-3,vz:0,last:'you',crossed:true,bounces:0});
let rivalPowers=0;for(let seed=1;seed<=60;seed++){const r=t.createTennis(seed,1);r.phase='rally';r.rally=4;Object.assign(r.you,{x:3,y:4.5});Object.assign(r.ball,{x:0,y:-3,z:.5,vx:0,vy:-3,vz:0,last:'you',crossed:true,bounces:0});r.aiReaction=0;r.aiThink=0;advance(r,1/120);if(r.rivalPower>0)rivalPowers++;}
assert.equal(rivalPowers,0,'court 1 rival never winds up');
rivalPowers=0;let shown=0;for(let seed=1;seed<=60;seed++){const r=t.createTennis(seed,4);r.phase='rally';r.rally=4;Object.assign(r.you,{x:3,y:4.5});Object.assign(r.ball,{x:-1,y:-3,z:.5,vx:0,vy:-3,vz:0,last:'you',crossed:true,bounces:0});advance(r,1/120);if(r.rivalPower>0){rivalPowers++;if(/POWER|DEEP|SHORT/.test(r.rivalIntent))shown++;}}
assert(rivalPowers>0,'later rivals wind up power shots');assert(shown>0,'its intent call-out names the power shot');
const reads=(level,shot)=>{const r=t.createTennis(47,level);r.phase='rally';r.rally=4;Object.assign(r.ball,{x:0,y:-4,z:.6,vx:0,vy:-3,vz:1,last:'rival',crossed:false,bounces:0});r.aiThink=0;r.aiReaction=0;if(shot){t.startTennisCharge(r,shot);r.chargeTime=C.full;r.charge=1;}t.tickTennis(r,1/120);return r.rival.targetY;};
assert.equal(reads(2,'lob'),reads(2,null),'early courts do not read your wind-up');
assert(reads(5,'lob')<reads(5,null)-.4,'court 5 backs off a wound-up lob');assert(reads(5,'drop')>reads(5,null)+.4,'court 5 creeps in for a wound-up drop');
const rivalKick=t.createTennis(47,5);rivalKick.phase='rally';rivalKick.rally=4;Object.assign(rivalKick.rival,{x:0,y:-5.3});Object.assign(rivalKick.ball,{x:.2,y:-5.1,z:.35,vx:0,vy:-.3,vz:.5,last:'you',crossed:true,bounces:1});rivalKick.rivalPlan='drive';rivalKick.rivalPlanX=2;rivalKick.rivalPower=.92;rivalKick.aiReaction=0;
advance(rivalKick,1/60);assert.equal(rivalKick.lastKicker,'rival');assert.equal(rivalKick.rivalPower,0,'the rival power is spent on its kick');assert(['sweet','power'].includes(rivalKick.rivalPowerGrade));

// 7. UI wiring: hold on touch / mouse / keys, clean cancel paths, the charge ring, the help text.
const ui=fs.readFileSync(path.join(root,'components/games/ArcadeGame3D.tsx'),'utf8'),css=fs.readFileSync(path.join(root,'components/games/ArcadeGame3D.module.css'),'utf8'),games=fs.readFileSync(path.join(root,'lib/arcade/arcadeGames.ts'),'utf8');
for(const [i,name] of [[0,'kick'],[1,'lob'],[2,'drop']])assert(new RegExp(`data-tennis-action="${name}"[^>]*\\{\\.\\.\\.holdShot\\(${i}\\)\\}`).test(ui),`${name} button holds`);
assert(/onPointerCancel:[^\n]*endTennisHold\(false\)/.test(ui)&&/onLostPointerCapture:[^\n]*endTennisHold\(false\)/.test(ui),'pointer cancel / lost capture cancels the hold (no shot)');
assert(/onPointerUp:[^\n]*endTennisHold\(true\)/.test(ui),'lifting the finger strikes');
assert(/const release=\(\)=>\{if\(tennisHold\.current\)\{game\.current\?\.chargeCancel\(\);dropTennisHold\(false\);\}/.test(ui),'pause / blur / phase change drop the hold');
assert(/e\.code==='Space'\|\|e\.code==='KeyJ'\|\|e\.code==='KeyK'\)\)\{[^\n]*startTennisHold/.test(ui)&&/tennisHold\.current\.key===e\.code\)endTennisHold\(true\)/.test(ui),'Space / J / K hold and release');
assert(/tennisHold\.current\?\.pointer===e\.pointerId/.test(ui),'only the finger that started the hold ends it (joystick thumb is separate)');
assert(/chargeStart\(id:number\)/.test(games)&&/chargeRelease\(\)/.test(games)&&/chargeCancel\(\)/.test(games));
assert(/button\[data-charging\]::before\{[^}]*conic-gradient\(var\(--charge-fill\)/.test(css),'charge ring around the held button');
assert(/data-power=sweet/.test(css)&&/data-power=over/.test(css),'gold sweet and red overhit ring states');
assert(/HOLD to wind up/.test(ui)&&/HOLD to wind up/.test(ui.split('touchHelp')[1]),'keyboard and touch help explain the hold');

// 8. Court meter bands and the wind-up voice.
const fx=load('lib/arcade/tennisPowerFx.ts');const bands=Array.from({length:fx.TENNIS_METER_SEGMENTS},(_,i)=>fx.tennisMeterBand(i));
assert.equal(bands.filter(b=>b==='sweet').length,4,'the gold sweet band is 4 of 28 segments');assert.equal(bands.filter(b=>b==='over').length,8);assert.equal(bands[0],'build');
assert.equal(fx.tennisMeterFilled(0),0);assert.equal(fx.tennisMeterFilled(C.max),fx.TENNIS_METER_SEGMENTS);assert.equal(fx.tennisMeterFilled(1),20);
const T=require('three'),scene=new T.Scene(),pfx=fx.createTennisPowerFx({scene,reduced:false});s=atFeet(1);t.startTennisCharge(s,'auto');s.charge=.9;
assert.equal(pfx.sync(1/30,s),true);assert.equal(pfx.meter.visible,true,'meter shows while holding');t.cancelTennisCharge(s);pfx.sync(1/30,s);assert.equal(pfx.meter.visible,false);
s.bounceEvents=1;pfx.sync(1/30,s);s.bounceEvents=2;s.fxLandX=1;s.fxLandY=-3;assert.equal(pfx.sync(1/30,s),true,'a bounce leaves a fading mark');assert.equal(pfx.marks.count,fx.TENNIS_BOUNCE_MARKS);for(let i=0;i<60;i++)pfx.sync(1/30,s);assert.equal(pfx.marks.count,0,'marks fade out and sleep');
const audio=load('lib/arcade/tennisAudio.ts');let live=0;const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
const ctx={state:'running',currentTime:0,destination:{},createOscillator(){live++;const o={type:'',frequency:param(),detune:param(),connect(){},disconnect(){live--;},start(){},stop(){setTimeout(()=>o.onended&&o.onended(),0);}};return o;},createGain(){return {gain:param(),connect(){},disconnect(){}};}};
vibrations=[];const v=audio.tennisChargeVoice(ctx);v.set(.5,.1);v.set(.85,.1);v.set(1.2,.2);v.stop(true,'over');assert(vibrations.length>=1,'haptics on press (rate limited)');
setTimeout(()=>{assert.equal(live,0,'the wind-up voice (and its sweet tick / overhit buzz) frees every node');
console.log('PASS tennis hold-to-power: tap = old shot, sweet window + overhit, Kick/Lob/Drop shapes, stick placement, cancel + last-chance strike, held serve, rival wind-up + reads, UI wiring, meter bands, wind-up voice');},5);
