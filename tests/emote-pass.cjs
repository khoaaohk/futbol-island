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
 for(const k of [0,1,4,5,7,8,9])assert.equal(E.emoteSeconds(k),4);
 assert(E.emoteSeconds(E.EMOTE.PassBall)>=6.5&&E.emoteSeconds(E.EMOTE.JuggleWithMe)>=8);
 const sig=k=>{const r=rig();P.applyEmoteArms(r,k,2,4);return Object.values(r.j).map(o=>o.rotation.x.toFixed(2)+'/'+o.rotation.z.toFixed(2)).join(',');};
 const set=new Set([E.EMOTE.JuggleWithMe,E.EMOTE.ShowOff,E.EMOTE.Laugh,E.EMOTE.Dance,E.EMOTE.Thanks,E.EMOTE.WellPlayed].map(sig));
 assert.equal(set.size,6,'six distinct arm poses');
});
t('Dance has a 4 s routine (one of ten whole-body dances, tests/emote-dance-show.cjs): the arms change through the move',()=>{
 const r=rig(),key=u=>{P.applyEmoteArms(r,E.EMOTE.Dance,u*4,4);return Object.values(r.j).map(o=>o.rotation.x.toFixed(1)+o.rotation.z.toFixed(1)).join();};
 assert(new Set([.1,.25,.45,.7,.95].map(key)).size>=4,'at least four different moves');
 assert.equal(P.emoteBody(E.EMOTE.Dance,.5,4).jump,undefined,'the dance hops the hips itself');
});
const SM=load('lib/graphics/strikeMotion.ts');
const ballOut=()=>PB.createPassBallOut();
t('Pass it: GROUND passing routines; the passes alternate between you and the partner, leave the foot on the strike contact frame and roll low',()=>{
 const a={x:0,y:0,z:0},b={x:3.3,y:0,z:0},o=ballOut();
 for(let i=0;i<PB.PASS_ROUTINES.length;i++){const r=PB.PASS_ROUTINES[i];o.routine=i;
  const sends=r.contacts.filter(c=>c.how!=='trap'&&c.how!=='catch'),froms=new Set(sends.map(c=>c.who));
  assert(sends.length>=3&&froms.size===2,r.id+': both actors play the ball ('+sends.length+' touches)');
  let low=0,all=0;for(let age=0;age<=E.PASS_SECONDS;age+=1/60){PB.passBallAt(age,a,b,o);all++;if(o.y<.4)low++;assert(Number.isFinite(o.x+o.y+o.z));}
  assert(low/all>.8,r.id+' rolls along the ground: '+(low/all).toFixed(2));
 }
 const kickAtContact=PB.KICK_FROM+(1-PB.KICK_FROM)*PB.contactAfterWindup(.42)/.42;assert(Math.abs(kickAtContact-SM.STRIKE_CONTACT)<1e-9,'contact = the rig\'s STRIKE_CONTACT ('+SM.STRIKE_CONTACT+')');
 o.routine=0;const first=PB.PASS_ROUTINES[0].contacts[0];PB.passBallAt(first.t-.02,a,b,o);const bx=o.x;assert(Math.abs(bx-PB.PASS_REACH*1)<.05,'before the contact frame the ball is on the passer\'s foot: '+bx);
 PB.passBallAt(first.t+.05,a,b,o);assert(o.x>bx+.05,'after the contact frame the ball has left the foot');
 assert.equal(PB.passBallAt(0,a,a,o).x===o.x,true);assert(Number.isFinite(o.x),'a partner on top of you does not blow up (NaN)');
});
t('Pass it: the NPC half = real kicks (wind-up, swing, follow-through) and traps, one kicker at a time',()=>{
 const a={x:0,y:0,z:0},b={x:3.3,y:0,z:0},o=ballOut();
 for(let i=0;i<PB.PASS_ROUTINES.length;i++){o.routine=i;let npcKick=0,maxKick=0,npcWind=0,npcRecv=0,npcBody=0;
  for(let age=0;age<=E.PASS_SECONDS;age+=1/60){PB.passBallAt(age,a,b,o);const n=o.actors[1];
   if(n.kick!==undefined){npcKick++;maxKick=Math.max(maxKick,n.kick);}if(n.windup!==undefined)npcWind++;if(n.receive>0)npcRecv++;if(n.skill||n.move||n.jump&&n.jump.height>.1||Math.abs(Math.sin(n.turn))>.3)npcBody++;
   assert(!(o.actors[0].kick!==undefined&&n.kick!==undefined),'only one kicker at a time');}
  const r=PB.PASS_ROUTINES[i].id;assert(npcRecv>15||npcKick>40,r+' the partner cushions the ball (or plays it first time)');assert(npcKick+npcBody>20,r+' the partner kicks or moves');
 }
 const sp={forward:0,height:0,open:0,pitch:0,load:0,drive:0,follow:0};let lo=9,hi=-9;for(let p=0;p<=1;p+=.02){SM.strikePose(p,'pass',.5,sp);lo=Math.min(lo,sp.forward);hi=Math.max(hi,sp.forward);}
 assert(lo<-.1&&hi>.4,'foot-pose amplitude: back-lift '+lo.toFixed(2)+' to forward swing '+hi.toFixed(2));
});
t('Juggle with me: close (2.7-3.4 m, the pair fits the zoomed frame), the ball goes back and forth IN THE AIR, foot / knee / head / chest touches',()=>{
 assert(PB.JUGGLE_GAP.min>=2.5&&PB.JUGGLE_GAP.max<=3.5&&PB.PASS_GAP.max<=3.8);
 const a={x:0,y:0,z:0},b={x:3,y:0,z:0},o=ballOut(),kinds=new Set();
 for(let i=0;i<PB.JUGGLE_ROUTINES.length;i++){o.routine=i;let maxY=0,flights=0,prevAir=false,touches0=0,touches1=0;
  for(let age=0;age<=E.emoteSeconds(E.EMOTE.JuggleWithMe);age+=1/60){PB.juggleBallAt(age,a,b,o);maxY=Math.max(maxY,o.y);
   o.actors.forEach(ac=>{if(ac.juggle!==undefined)kinds.add(ac.juggleTouch);if(ac.reaction)kinds.add(ac.reaction);});
   if(o.air&&!prevAir)flights++;prevAir=o.air;assert(Number.isFinite(o.x+o.y+o.z));}
  for(const c of PB.JUGGLE_ROUTINES[i].contacts){if(c.who===0)touches0++;else touches1++;}
  assert(maxY>1.9&&maxY<3,PB.JUGGLE_ROUTINES[i].id+' high but short arcs: '+maxY.toFixed(2));assert(touches0+touches1>=9,'many touches');assert(touches0>=3&&touches1>=3,'both keep it up');
 }
 for(const k of ['foot','knee','head','chest'])assert(kinds.has(k),k);
 assert(E.emoteSeconds(E.EMOTE.JuggleWithMe)>=8&&E.emoteSeconds(E.EMOTE.JuggleWithMe)<=10);
 o.routine=0;PB.juggleBallAt(E.emoteSeconds(E.EMOTE.JuggleWithMe),a,b,o);assert(Math.hypot(o.x-PB.PASS_REACH,o.z)<.3&&o.y<.4,'ends settled at your feet');
});
t('Juggle with me alone: solo keep-up routines of about 5-6 s at your feet, no partner needed',()=>{
 const a={x:2,y:0,z:3},o=ballOut();const kinds=new Set();
 for(let i=0;i<PB.JUGGLE_SOLO_ROUTINES.length;i++){o.routine=i;let maxY=0;
  for(let age=0;age<=PB.JUGGLE_SOLO_SECONDS;age+=1/60){PB.juggleSoloAt(age,a,0,o);maxY=Math.max(maxY,o.y);if(o.actors[0].juggle!==undefined)kinds.add(o.actors[0].juggleTouch);assert(Math.hypot(o.x-2,o.z-3)<.8,'stays at the feet');}
  assert(maxY>1.2,'keep-ups at least knee high');}
 assert(kinds.size>=4);assert(PB.JUGGLE_SOLO_SECONDS>=5&&PB.JUGGLE_SOLO_SECONDS<=6.5);
});
t('ONE ball: Pass it / Juggle with me move the player\'s own ball; the pooled pass ball mesh is gone; the sequences end by handing the ball back at the feet',()=>{
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts');
 assert(!fs.existsSync(path.join(ROOT,'lib/graphics/passBall.ts'))&&!/createPassBall\b|passBall\.set|passBall\.hide/.test(town),'no second ball mesh');
 assert(/if\(passOnBall&&walkingBall&&emoteFx\.kind>=0\)\{ball\.position\.set\(passOut\.x,passOut\.y,passOut\.z\)/.test(town),'the existing ball is driven');
 assert(/walkBall\.reset\(dribblePlayer\)/.test(town),'a ball that is away is summoned to the feet first');
 assert(/const endBallEmote=\(\)=>\{passOnBall=false/.test(town)&&/emoteFx\.age>=emoteFx\.dur\)\{emoteFx\.kind=-1;endBallEmote\(\)/.test(town),'normal dribble resumes at the feet');
 assert(/\.\.\.passMotionNow\(\)/.test(town)&&/PlayerMotion/.test(town),'the player\'s kick / trap / keep-up poses come from the rig motion');
 assert(/pick===EMOTE\.PassBall&&ecsRide\(\)\)return/.test(town)&&/ballEmote&&\(rideRef\.current!=='walk'\|\|water\.inWater/.test(town),'skipped on rides, flying, swimming');
 assert(/npcPassMotion\(entry\.pass,entry\.passBall/.test(npcs)&&/spacing\?:\{min:number;max:number\}/.test(npcs),'the townsperson kicks / juggles and steps to the right gap');
 assert(/EMOTE\.JuggleWithMe/.test(read('lib/town/emoteReact.ts'))&&/label: 'Juggle with me'/.test(read('lib/town/emoteReact.ts'))&&!/PassToMe/.test(read('multiplayer/protocol/types.ts')+read('lib/town/emoteReact.ts')),'renamed');
 assert(/JuggleWithMe: 3/.test(read('multiplayer/protocol/types.ts')),'wire value 3 unchanged');
 assert(/'juggle-air':/.test(read('components/party/PartyChip.tsx')));
});
t('source: Pass it is wired (bubble, camera hold, cancel on walk, renamed ThumbsUp -> PassBall)',()=>{
 const town=read('components/Town.tsx'),proto=read('multiplayer/protocol/types.ts'),npcs=read('lib/graphics/islandNpcs.ts');
 assert(/PassBall: 6/.test(proto)&&!/ThumbsUp/.test(proto+read('lib/graphics/remoteAvatars.ts')+read('lib/town/emoteReact.ts')),'wire value 6 unchanged, renamed');
 assert(/pick===EMOTE\.PassBall&&reduced\)emoteFx\.dur=1\.5/.test(town),'reduced motion: bubble + one pass');
 assert(/emoteFx\.kind===EMOTE\.PassBall\|\|emoteFx\.kind===EMOTE\.JuggleWithMe\)passStep\(\)/.test(town));
 assert(/if\(!onRideNow&&emoteMoving\(\)\)\{emoteFx\.kind=-1;endBallEmote\(\)/.test(town),'walking away cancels');
 assert(/emoteSeconds\(entry\.fx\.kind\)/.test(npcs)&&/applyEmoteArms/.test(npcs),'the townsperson answers every kind for the same length');
 assert(/pass:\s*'/.test(read('components/party/PartyChip.tsx')),'the Pass it glyph exists');
});

t('ride emotes v2: each vehicle gets Wave + its own five in-place tricks on the wheel; foot-only emotes are hidden on rides',()=>{
 for(const ride of ['moped','scooter','bike']){
  const w=E.wheelEmotesFor(ride),labels=w.map(x=>x.label);
  assert.equal(w.length,6,ride+' wheel: Wave + five tricks');assert.equal(labels[0],'Wave');
  assert(!labels.some(l=>/Pass it|Dance|Laugh|Thanks|Space|Juggle with me/.test(l)),ride+' hides the foot-only emotes');
  assert.equal(R.rideScriptsFor(ride).length,5);
 }
 assert.equal(E.wheelEmotesFor('walk').length,10);assert.equal(E.wheelEmotesFor('jetpack').length,10);
 assert.equal(new Set(R.RIDE_SCRIPTS.map(x=>x.label)).size,15,'fifteen different tricks');
 assert.equal(new Set(R.RIDE_SCRIPTS.map(x=>x.icon)).size,15);assert.equal(new Set(R.RIDE_SCRIPTS.map(x=>x.emoji)).size,15,'an emoji bubble each');
 const chip=read('components/party/PartyChip.tsx');for(const sc of R.RIDE_SCRIPTS)assert(chip.includes(`'${sc.icon}':`),'glyph for '+sc.icon);
});
t('ride tricks: a few seconds, in place (no speed asked), friends only get existing wire values (never Wave or a ball emote)',()=>{
 for(const sc of R.RIDE_SCRIPTS){
  assert(sc.seconds>=2.5&&sc.seconds<=4,sc.label+' lasts a few seconds');assert(!('move' in sc)&&!('maxMag' in sc),sc.label+' never drives the vehicle');
  assert([1,2,4,5,7,8,9].includes(sc.wire),sc.label+' wire '+sc.wire);assert(sc.emote>=60&&R.isRideEmote(sc.emote));assert.equal(sc.arm,sc.emote);
 }
 for(const ride of ['moped','scooter','bike'])assert.equal(new Set(R.rideScriptsFor(ride).map(s=>s.wire)).size,5,ride+': a different wire value per trick');
 assert(!R.isRideEmote(18)&&!R.isRideEmote(10)&&R.isRideEmote(60)&&R.isRideEmote(74)&&!R.isRideEmote(75));
});
t('ride tricks: every cancel rule ends it',()=>{
 const base={age:1,seconds:4,realInput:false,rideNow:'moped',rideWas:'moped',blockedAhead:false,trafficNear:false,water:false,crashed:false};
 assert.equal(R.rideScriptStop(base),'');
 assert.equal(R.rideScriptStop({...base,age:4}),'done');
 assert.equal(R.rideScriptStop({...base,realInput:true}),'input','any stick / key input cancels at once');
 assert.equal(R.rideScriptStop({...base,rideNow:'walk'}),'dismount');assert.equal(R.rideScriptStop({...base,rideNow:'bike'}),'dismount');
 assert.equal(R.rideScriptStop({...base,blockedAhead:true}),'blocked','the next step is blocked: abort');
 assert.equal(R.rideScriptStop({...base,trafficNear:true}),'traffic');assert.equal(R.rideScriptStop({...base,water:true}),'hazard');assert.equal(R.rideScriptStop({...base,crashed:true}),'hazard');
 const town=read('components/Town.tsx');
 assert(/blockedAhead:braking&&groundBlocked\(location\.x\+r\.dx\*1\.2,location\.z\+r\.dz\*1\.2,world\.obstacles/.test(town),'only while braking: the game collision checks the stop');
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
