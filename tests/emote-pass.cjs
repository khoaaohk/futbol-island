// Emote pass (user, Oct 22 2026): every one of the ten emotes animates you and a nearby townsperson for ~4 s, "Pass it" moves a real ball
// between the feet five times, and the emote camera never zooms into a wall (multi-ray test, other headings, skip when nothing is clear).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const R=load('lib/town/rideEmotes.ts');
const E=load('lib/town/emoteReact.ts',{rideEmotes:R,celebrations:{celebrationJump(){}}}),P=load('lib/graphics/emotePose.ts'),PB=load('lib/town/emotePass.ts');

// a fake rig: the four named joints
const joint=()=>({rotation:{x:0,y:0,z:0}});
const rig=()=>{const j={'left-shoulder':joint(),'right-shoulder':joint(),'left-elbow':joint(),'right-elbow':joint()};return {getObjectByName:n=>j[n],j};};
const moved=(kind,age)=>{const r=rig();P.applyEmoteArms(r,kind,age,E.emoteSeconds(kind));return Object.values(r.j).some(o=>Math.abs(o.rotation.x)+Math.abs(o.rotation.z)>.05);};

t('all ten emotes animate the body or the called arm, at several moments of the 4 s',()=>{
 for(const [name,kind] of Object.entries(E.EMOTE)){
  if(kind===E.EMOTE.PassBall||kind===E.EMOTE.HighFive)continue; // the ball sequence / the high-five variations have their own tests
  let any=0;for(const age of [.6,1.3,2,2.7,3.4]){const b=P.emoteBody(kind,age,E.emoteSeconds(kind));if(b.called>0||b.jump||moved(kind,age))any++;}
  assert(any>=4,name+' animates through the whole length ('+any+'/5)');
 }
});
t('each simple emote lasts about 4 s, Pass it about 6, and the moves differ from each other',()=>{
 for(const k of [0,1,3,4,5,7,8,9])assert.equal(E.emoteSeconds(k),4);
 assert(E.emoteSeconds(E.EMOTE.PassBall)>=5.5);
 const sig=k=>{const r=rig();P.applyEmoteArms(r,k,2,4);return Object.values(r.j).map(o=>o.rotation.x.toFixed(2)+'/'+o.rotation.z.toFixed(2)).join(',');};
 const set=new Set([E.EMOTE.PassToMe,E.EMOTE.Space,E.EMOTE.Laugh,E.EMOTE.Dance,E.EMOTE.Thanks,E.EMOTE.WellPlayed].map(sig));
 assert.equal(set.size,6,'six distinct arm poses');
});
t('Dance has a 4 s routine: arm changes, a spin in the middle, hops, a final pose; no motion changes at a high rate',()=>{
 const key=u=>{const r=rig();P.applyEmoteArms(r,E.EMOTE.Dance,u*4,4);return Object.values(r.j).map(o=>o.rotation.x.toFixed(1)+o.rotation.z.toFixed(1)).join();};
 assert(new Set([.1,.25,.45,.7,.95].map(key)).size>=4,'at least four different moves');
 assert.equal(P.danceTurn(.45),0);assert.equal(P.danceTurn(.8),1);assert(P.danceTurn(.62)>.3&&P.danceTurn(.62)<.7);
 assert(P.emoteBody(E.EMOTE.Dance,.5,4).jump,'beat hops');
});
t('Pass it: five passes alternate player -> partner, the ball really travels between the feet and ends within the sequence',()=>{
 const a={x:0,y:0,z:0},b={x:3,y:0,z:0},o=PB.createPassBallOut(),froms=[],idx=new Set();
 let maxY=0,prev=-1;
 for(let age=0;age<=E.PASS_SECONDS;age+=1/60){PB.passBallAt(age,a,b,o);if(o.index>=0){idx.add(o.index);if(o.index!==prev){froms.push(o.from);prev=o.index;}}maxY=Math.max(maxY,o.y);}
 assert.equal(idx.size,5);assert.equal(froms.join(),'0,1,0,1,0');assert(maxY>.4&&maxY<1.2,'a lifted pass, not a rocket: '+maxY);
 PB.passBallAt(PB.PASS_LEAD+.01,a,b,o);assert(o.x<1,'pass 1 starts at your feet');
 PB.passBallAt(PB.PASS_LEAD+PB.PASS_FLIGHT+.05,a,b,o);assert(o.x>2&&o.x<3,'pass 1 lands at the partner: '+o.x);
 PB.passBallAt(PB.PASS_LEAD+PB.PASS_PERIOD+PB.PASS_FLIGHT+.05,a,b,o);assert(o.x<1&&o.x>0,'pass 2 comes back to you: '+o.x);
 assert(PB.PASS_LEAD+PB.PASS_COUNT*PB.PASS_PERIOD<=E.PASS_SECONDS,'all five fit the emote length');
 assert.equal(PB.passBallAt(0,a,a,o).x===o.x,true,'a partner on top of you does not blow up (NaN)');assert(Number.isFinite(o.x));
});
t('source: Pass it is wired (bubble, ball, no rides, camera hold, cancel on walk, rename ThumbsUp -> PassBall)',()=>{
 const town=read('components/Town.tsx'),proto=read('multiplayer/protocol/types.ts'),npcs=read('lib/graphics/islandNpcs.ts');
 assert(/PassBall: 6/.test(proto)&&!/ThumbsUp/.test(proto+read('lib/graphics/remoteAvatars.ts')+read('lib/town/emoteReact.ts')),'wire value 6 unchanged, renamed');
 assert(/pick===EMOTE\.PassBall&&ecsRide\(\)\)return/.test(town),'never on a ride');
 assert(/pick===EMOTE\.PassBall&&reduced\)emoteFx\.dur=1\.5/.test(town),'reduced motion: bubble + one pass');
 assert(/emoteFx\.kind===EMOTE\.PassBall\)passStep\(\)/.test(town)&&/passBall\.hide\(\)/.test(town));
 assert(/if\(!onRideNow&&emoteMoving\(\)\)\{emoteFx\.kind=-1;passBall\.hide\(\)/.test(town),'walking away cancels');
 assert(/emoteSeconds\(entry\.fx\.kind\)/.test(npcs)&&/applyEmoteArms/.test(npcs),'the townsperson answers every kind for the same length');
 assert(/pass:\s*'/.test(read('components/party/PartyChip.tsx')),'the Pass it glyph exists');
});

t('ride emotes: each vehicle gets its own three scripted rides on the wheel; foot-only emotes are hidden on rides',()=>{
 for(const ride of ['moped','scooter','bike']){
  const w=E.wheelEmotesFor(ride),labels=w.map(x=>x.label);
  assert.equal(w.length,5,ride+' wheel: Wave, three scripts, Cheer');assert(labels.includes('Wave')&&labels.includes('Cheer'));
  assert(!labels.some(l=>/Pass it|Dance|Laugh|Thanks|Space|Pass to me/.test(l)),ride+' hides the foot-only emotes');
  assert.equal(R.rideScriptsFor(ride).length,3);
 }
 assert.equal(E.wheelEmotesFor('walk').length,10);assert.equal(E.wheelEmotesFor('jetpack').length,10);
 const all=new Set(R.RIDE_SCRIPTS.map(x=>x.label));assert.equal(all.size,9,'nine different scripts');
 assert.equal(new Set(R.RIDE_SCRIPTS.map(x=>x.icon)).size,9);
 assert(/'ride-weave'/.test(read('components/party/PartyChip.tsx')));
});
t('ride scripts: a few seconds, capped speed per vehicle, they differ, friends only get existing wire values',()=>{
 const mv={mag:0,turn:0};
 for(const sc of R.RIDE_SCRIPTS){
  assert(sc.seconds>=2.5&&sc.seconds<=6.5,sc.label+' lasts a few seconds');
  let top=0,turns=new Set();for(let a=0;a<=sc.seconds;a+=.1){sc.move(a,mv);top=Math.max(top,mv.mag);turns.add(Math.round(mv.turn*10));assert(mv.mag>=0&&mv.mag<=sc.maxMag+1e-9,sc.label+' stays under its cap');}
  assert(top*R.RIDE_SPEED_CAP[sc.ride]<=8.01,sc.label+' never asks for more than 8 m/s');
  assert(sc.wire===0||sc.wire===1,'wire values are existing protocol ones');assert(sc.emote>=10&&R.isRideEmote(sc.emote));
 }
 assert(R.RIDE_SPEED_CAP.scooter<R.RIDE_SPEED_CAP.bike&&R.RIDE_SPEED_CAP.bike<R.RIDE_SPEED_CAP.moped,'scooter < bike < moped');
 const eight=R.rideScriptFor(R.RIDE_EMOTE.MopedEight);eight.move(1,mv);const t1=mv.turn;eight.move(5,mv);assert(t1*mv.turn<0,'the figure eight turns left then right');
 const weave=R.rideScriptFor(R.RIDE_EMOTE.BikeWeave);let sg=new Set();for(let a=0;a<4;a+=.1){weave.move(a,mv);sg.add(Math.sign(Math.round(mv.turn*10)));}assert(sg.has(1)&&sg.has(-1),'the weave swings both ways');
 const spin=R.rideScriptFor(R.RIDE_EMOTE.ScooterSpin),wheelie=R.rideScriptFor(R.RIDE_EMOTE.BikeWheelie),rev=R.rideScriptFor(R.RIDE_EMOTE.MopedRev);
 assert(spin.trick&&spin.trick.action===0&&wheelie.trick&&wheelie.trick.action===1&&rev.trick,'tricks reuse createRideTricks: spin 360, back wheelie, moped stand-up');
 assert(R.rideScriptFor(R.RIDE_EMOTE.MopedCruise).ride==='moped'&&R.rideScriptFor(R.RIDE_EMOTE.BikeBell).ride==='bike'&&spin.ride==='scooter');
});
t('ride scripts: stick math points the ride where the script says, and every cancel rule ends it',()=>{
 const o={x:0,z:0};
 for(const h of [0,1,2.5,-1.2]){R.stickFor(h,1,o);const wx=o.x*.857+o.z*.515,wz=-o.x*.515+o.z*.857;assert(Math.abs(wx-Math.sin(h))<2e-3&&Math.abs(wz-Math.cos(h))<2e-3,'heading '+h);}
 const base={age:1,seconds:4,realInput:false,rideNow:'moped',rideWas:'moped',blockedAhead:false,trafficNear:false,water:false,crashed:false};
 assert.equal(R.rideScriptStop(base),'');
 assert.equal(R.rideScriptStop({...base,age:4}),'done');
 assert.equal(R.rideScriptStop({...base,realInput:true}),'input','any stick / key input cancels at once');
 assert.equal(R.rideScriptStop({...base,rideNow:'walk'}),'dismount');assert.equal(R.rideScriptStop({...base,rideNow:'bike'}),'dismount');
 assert.equal(R.rideScriptStop({...base,blockedAhead:true}),'blocked','the next step is blocked: abort');
 assert.equal(R.rideScriptStop({...base,trafficNear:true}),'traffic');assert.equal(R.rideScriptStop({...base,water:true}),'hazard');assert.equal(R.rideScriptStop({...base,crashed:true}),'hazard');
 const town=read('components/Town.tsx');
 assert(/groundBlocked\(location\.x\+hx\*L,location\.z\+hz\*L,world\.obstacles/.test(town),'uses the game collision for the look-ahead');
 assert(/joystickPointer\.current!==null\|\|keys\.size>0/.test(town)&&/rideScript\.s\)rideScriptStep\(/.test(town),'real input detection, stepped before the movement code');
 assert(/if\(!onRideNow&&emoteMoving\(\)\)/.test(town),'riding emotes are not cancelled by the ride moving');
 assert(/<EmoteControl ride=\{rideMode\}\/>/.test(town)&&/wheelEmotesFor\(ride\)/.test(read('components/party/EmoteWheel.tsx')));
});

// the emote camera and the walls
const CL=load('lib/town/emoteCamClear.ts');
const M=load('lib/town/emoteCameraMath.ts');
const fakeShot=()=>{let frame=null,on=false;return {begin(f){frame=f;on=true;frame(1.6);},end(){on=false;},get active(){return on;},apply(){return on;}};};
const CAMX=load('lib/town/emoteCamera.ts',{shotCamera:{createShotCamera:fakeShot},emoteCameraMath:M,emoteCamClear:CL});
const okS=()=>({reduced:false,riding:false,swimming:false,flying:false,inJob:false,cutscene:false,lesson:false,menuOpen:false,moving:false,cameraDist:43});
const world=(solids)=>({clear:()=>true,floorAt:()=>0,solids:()=>solids});
const wall=(x,z,w,d,top=12)=>({x,z,w,d,floor:0,top});
t('camera clear test: a box between the eye and a character blocks; the eye inside or touching a box blocks',()=>{
 const p={x:0,y:0,z:0},q={x:2,y:0,z:0};
 const eye={x:0,y:5,z:10};
 assert.equal(CL.viewClear([],eye.x,eye.y,eye.z,p,true,q,0),true);
 assert.equal(CL.viewClear([wall(0,5,6,1)],eye.x,eye.y,eye.z,p,true,q,0),false,'a tall wall in the way');
 assert.equal(CL.viewClear([wall(0,10,4,4)],eye.x,eye.y,eye.z,p,true,q,0),false,'the eye inside a building');
 assert.equal(CL.viewClear([wall(0,10.4,2,.4)],eye.x,eye.y,eye.z,p,true,q,0),false,'the eye less than 0.6 m from a wall');
 assert.equal(CL.viewClear([wall(30,30,4,4)],eye.x,eye.y,eye.z,p,true,q,0),true,'a far building does not matter');
 // a wall that only blocks the raised hands of the partner is caught too
 assert.equal(CL.viewClear([{x:2,z:5,w:3,d:1,floor:2,top:6}],eye.x,eye.y,eye.z,p,true,{x:2,y:0,z:0},0),false);
});
t('camera begin: a building on the default side -> another heading; walled in everywhere -> no zoom (stay on the follow camera)',()=>{
 const cam=CAMX.createEmoteCamera(fakeShot);
 const dir=M.emoteDir(M.EMOTE_CAM.yaw);
 // a big building exactly where the default eye would sit
 const bx=dir.x*8,bz=dir.z*8;
 assert.equal(cam.begin(okS(),0,0,0,{x:2,y:0,z:0},4,world([wall(bx,bz,10,10)]),.46),true,'zooms from another side');
 cam.cancel();
 const cam2=CAMX.createEmoteCamera(fakeShot);
 const ring=[];for(let a=0;a<12;a++)ring.push(wall(Math.sin(a*Math.PI/6)*6,Math.cos(a*Math.PI/6)*6,10,10,40));
 assert.equal(cam2.begin(okS(),0,0,0,{x:2,y:0,z:0},4,world(ring),.46),false,'enclosed by tall walls: no zoom');
});
t('source: Town gives the emote camera every wall and the big props; the zoom eases out when a wall comes between',()=>{
 const town=read('components/Town.tsx'),cam=read('lib/town/emoteCamera.ts');
 assert(/solids:emoteSolidsAt/.test(town)&&/ballWallGrid\.query\(x,z,r\)/.test(town)&&/ballObstacleGrid\.query\(x,z,r\)/.test(town));
 assert(/viewClear\(l, out\.eye\.x/.test(cam)&&/stop\(\)/.test(cam),'a wall that comes between ends the zoom');
 assert(/tries/.test(cam)&&/YAW_TRIES/.test(cam)&&/EYE_CLEAR/.test(read('lib/town/emoteCamClear.ts')));
});
console.log(`emote-pass: ${n} checks passed`);
