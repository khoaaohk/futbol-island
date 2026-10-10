import * as T from 'three';
import type {ArcadePoseOptions} from './arcadePlayerMotion';
import {TENNIS_COURTS,TENNIS_DRILL,TENNIS_GOLD,TENNIS_HEAD_HEIGHT,tennisTempo,tennisOpenSide,tennisRivalTire,type TennisState,type TennisGrade} from '@/lib/games/soccerTennis';
import {MOVE_PHASE,type PlayerMotion} from '@/lib/graphics/player';

/** Futbol Tennis game-feel layer: touch-grade call-outs, the rival's telegraph,
 * point banners, net wobble, a ball drop-line, split-step hops and hit-stop.
 * Event-driven: labels redraw their small canvas only when the text changes; nothing
 * allocates per frame and every effect is pooled (3 label meshes + 1 drop line). */
type Stage={scene:T.Scene;camera:T.Camera;reduced:boolean;mobile:boolean;ring?:(x:number,z:number,r:number,color:string)=>T.Mesh;burst?:(x:number,y:number,z:number,power?:number)=>void};
type Label={mesh:T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>;ctx:CanvasRenderingContext2D;tex:T.CanvasTexture;text:string;age:number;life:number;x:number;y:number;z:number;rise:number;w:number;h:number;size:number;pill:boolean};

/** Touch-grade call-outs: the grade, then a 3–5 word fix the player can try on the next ball. */
export const TENNIS_GRADE_LABEL:Record<Exclude<TennisGrade,''>,{text:string;color:string;sub:string}>={
 perfect:{text:'PERFECT!',color:'#73fff1',sub:'Bounce · plant · strike'},good:{text:'GOOD TOUCH',color:'#ffe084',sub:'Clean and balanced'},
 heavy:{text:'HEAVY TOUCH',color:'#ffb27a',sub:'Slow your feet first'},early:{text:'EARLY',color:'#ff9a78',sub:'Let it bounce first'},
 late:{text:'LATE',color:'#ff9a78',sub:'Meet it as it rises'},stretched:{text:'STRETCHED',color:'#ffb27a',sub:'Get your body beside it'},
};
/** Colours of the one pooled flight-read ring: a ball flying out, or the spot to head a high ball. */
const TENNIS_EDGE={x:4.95,y:7.75};
export const TENNIS_SPOT_COLOR={out:'#ff6b6b',head:'#74d6f2'};
/** The open-space ring (where to aim) uses the rival call-out pink, distinct from your yellow aim ring. */
export const TENNIS_SPACE_COLOR='#ff83d3';
/** Rival call-out text, from the player's view (camera looks up the court: -x is screen-left). */
export function tennisIntentLabel(shot:string|null,x:number){return shot==='drop'?'SHORT BALL!':shot==='lob'?'HIGH LOB!':x<0?'◀ YOUR LEFT':'YOUR RIGHT ▶';}
/** Long rallies warm the court: 0 until the 5th touch, then a gentle rise to 0.45. */
export const tennisRallyHeat=(s:Pick<TennisState,'phase'|'rally'>)=>s.phase==='rally'?Math.min(.45,Math.max(0,(s.rally-4)/14)):0;
/** Hit-stop lengths (seconds). A short freeze sells the contact without shaking the camera. */
export const TENNIS_HIT_STOP={perfect:.075,slam:.05,golden:.11};
/** Move call-outs for the expanded repertoire (kickStyle → label). */
export const TENNIS_MOVE_LABEL:Record<number,{text:string;color:string}>={6:{text:'BICYCLE KICK!',color:'#ffc93c'},7:{text:'SHARK ATTACK!',color:'#ff7659'},9:{text:'SLIDING STRETCH',color:'#ffb27a'},10:{text:'RAINBOW FLICK!',color:'#ffc0e8'}};
/** Stars are saved per court, best only; they never expire and cost nothing. */
export const TENNIS_STARS_KEY='fi2-tennis-stars-v1';
export function readTennisStars():number[]{try{const v=JSON.parse(localStorage.getItem(TENNIS_STARS_KEY)||'[]');return Array.isArray(v)?TENNIS_COURTS.map((_,i)=>Math.max(0,Math.min(3,Number(v[i])||0))):TENNIS_COURTS.map(()=>0);}catch{return TENNIS_COURTS.map(()=>0);}}
export function saveTennisStars(level:number,stars:number){const all=readTennisStars(),best=Math.max(all[level-1]??0,stars);all[level-1]=best;try{localStorage.setItem(TENNIS_STARS_KEY,JSON.stringify(all));}catch{}return best;}
const starText=(n:number)=>'★'.repeat(n)+'☆'.repeat(Math.max(0,3-n));

export function createTennisFeel(stage:Stage,tennis:TennisState,emit:(cue:string)=>void){
 const {scene,camera}=stage;
 function label(w:number,h:number,px:number):Label{
  const canvas=document.createElement('canvas');canvas.width=px;canvas.height=Math.round(px*h/w);
  const ctx=canvas.getContext('2d')!,tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));
  mesh.material.userData.arcadeSpill=true; // lets stage.dispose() free the canvas map too
  mesh.renderOrder=20;mesh.visible=false;mesh.frustumCulled=false;scene.add(mesh);
  return{mesh,ctx,tex,text:'',age:0,life:0,x:0,y:0,z:0,rise:0,w,h,size:1,pill:false};
 }
 function draw(l:Label,text:string,color:string,sub=''){
  if(l.text===text+sub)return;l.text=text+sub;const {ctx}=l,W=ctx.canvas.width,H=ctx.canvas.height;ctx.clearRect(0,0,W,H);
  if(l.pill){ctx.fillStyle='rgba(8,18,34,.62)';ctx.beginPath();ctx.roundRect(W*.06,H*.06,W*.88,H*.88,H*.3);ctx.fill();}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const big=Math.round(H*(sub?.46:.62));let size=big;ctx.font=`900 ${size}px system-ui,-apple-system,Segoe UI,sans-serif`;
  while(ctx.measureText(text).width>W*.92&&size>10){size-=2;ctx.font=`900 ${size}px system-ui,-apple-system,Segoe UI,sans-serif`;}
  const y=sub?H*.36:H*.52;ctx.lineWidth=Math.max(4,size*.2);ctx.strokeStyle='rgba(8,18,34,.92)';ctx.strokeText(text,W/2,y);ctx.fillStyle=color;ctx.fillText(text,W/2,y);
  if(sub){ctx.font=`800 ${Math.round(H*.22)}px system-ui,-apple-system,Segoe UI,sans-serif`;ctx.lineWidth=6;ctx.strokeText(sub,W/2,H*.78);ctx.fillStyle='#fff6df';ctx.fillText(sub,W/2,H*.78);}
  l.tex.needsUpdate=true;
 }
 function show(l:Label,x:number,y:number,z:number,life:number,rise:number,size=1){l.x=x;l.y=y;l.z=z;l.age=0;l.life=life;l.rise=rise;l.size=size;l.mesh.visible=true;}
 // Far-court labels are drawn larger so perspective doesn't shrink the rival's cues.
 const touch=label(3.3,.95,512),intent=label(3.2,.74,512),banner=label(6.6,1.8,768);banner.pill=true;
 touch.mesh.name='tennis-touch-label';intent.mesh.name='tennis-intent-label';banner.mesh.name='tennis-banner';
 // Ball drop-line: a thin vertical stalk joins a high ball to its shadow, so height reads from above.
 const stalk=new T.Mesh(new T.CylinderGeometry(.018,.018,1,6,1,true),new T.MeshBasicMaterial({color:'#fff6c8',transparent:true,opacity:.35,depthWrite:false}));stalk.visible=false;stalk.name='tennis-drop-line';scene.add(stalk);
 const net=scene.getObjectByName('tennis-net'),tape=scene.getObjectByName('tennis-tape');
 let kickSeen=tennis.kickCount,bounceSeen=tennis.bounceEvents,netSeen=tennis.netEvents,pointSeen=tennis.score.you+tennis.score.rival,planSeen=false;
 let hitStop=0,realDt=0,wrongSeen=tennis.wrongFooted,netWobble=0,netAge=0,netAmp=0,lastRallyCall=0;
 let outSeen=tennis.outEvents,trapSeen=tennis.trapEvents,targetSeen=tennis.targetEvents,goldSeen=false,fakeSeen=false,fakeAge=1,tempoSeen=0,introLevel=0,surfaceLevel=0;
 // Pooled move poses (no per-frame allocation): bicycle, shark (airborne scissor), rival sole-roll fake, flick-up serve wind-up.
 const movePose:Array<NonNullable<PlayerMotion['move']>>=[{kind:'bicycle',progress:0,side:1,height:1},{kind:'bicycle',progress:0,side:1,height:1}];
 const skillPose:Array<NonNullable<PlayerMotion['skill']>>=[{type:'rainbowFlick',progress:0,side:1},{type:'rainbowFlick',progress:0,side:1}];
 // Drill target: one gold ring (+1 draw only on the drill court). Sand: one shared material swap, no new draws.
 const target=new T.Mesh(new T.RingGeometry(TENNIS_DRILL.radius-.17,TENNIS_DRILL.radius,48),new T.MeshBasicMaterial({color:'#ffc93c',transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
 target.rotation.x=-Math.PI/2;target.position.set(0,.04,-4.6);target.name='tennis-drill-target';target.visible=false;target.renderOrder=2;scene.add(target);
 // Flight read: one ring, shown only while an incoming ball is in the air (+1 draw then). Red = flying out, let it go.
 // Blue = where a high ball drops through head height: stand there to head it.
 const spot=new T.Mesh(new T.RingGeometry(.42,.58,40),new T.MeshBasicMaterial({color:TENNIS_SPOT_COLOR.head,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
 spot.rotation.x=-Math.PI/2;spot.name='tennis-flight-spot';spot.visible=false;spot.renderOrder=3;scene.add(spot);let spotKick=-1,spotAge=0;
 // Open space: one pink ring on the side of the rival's court it has left empty, shown while you receive (+1 draw then).
 // Aim there (stick / arrow keys as you kick) and the yellow aim ring slides onto it.
 const space=new T.Mesh(new T.RingGeometry(.5,.74,40),new T.MeshBasicMaterial({color:TENNIS_SPACE_COLOR,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
 space.rotation.x=-Math.PI/2;space.position.set(0,.045,-5.2);space.name='tennis-open-space';space.visible=false;space.renderOrder=3;scene.add(space);let spaceAge=0,tireSeen=false;
 const halves:T.Mesh[]=[];scene.traverse(o=>{if(o.name==='tennis-court-half'&&(o as T.Mesh).isMesh)halves.push(o as T.Mesh);});
 const hardMats=halves.map(h=>h.material);const sandMat=new T.MeshStandardMaterial({color:'#c99448',roughness:1,emissive:'#4a2e0c',emissiveIntensity:.35});
 function surface(){if(surfaceLevel===tennis.level)return;surfaceLevel=tennis.level;const sand=TENNIS_COURTS[tennis.level-1].surface==='sand';halves.forEach((h,i)=>{h.material=sand?sandMat:hardMats[i];});}
 const hop=new Float32Array(2),hopAge=new Float32Array([1,1]);
 function reset(){kickSeen=tennis.kickCount;bounceSeen=tennis.bounceEvents;netSeen=tennis.netEvents;pointSeen=tennis.score.you+tennis.score.rival;planSeen=false;hitStop=netWobble=netAge=netAmp=lastRallyCall=realDt=0;wrongSeen=tennis.wrongFooted;hop.fill(0);hopAge.fill(1);
  trapSeen=tennis.trapEvents;targetSeen=tennis.targetEvents;goldSeen=false;fakeSeen=false;fakeAge=1;tempoSeen=0;introLevel=0;surface();
  for(const l of[touch,intent,banner]){l.mesh.visible=false;l.life=0;}stalk.visible=false;spot.visible=false;spotKick=-1;space.visible=false;spaceAge=0;tireSeen=false;outSeen=tennis.outEvents;if(net)net.position.z=0;if(tape)tape.position.z=0;}
 /** Scales the simulation step: returns 0 while a hit-stop holds the contact frame. */
 function scale(dt:number){realDt=dt;if(hitStop<=0)return dt;hitStop-=dt;return 0;}
 function events(){
  const s=tennis,b=s.ball;
  if(s.kickCount!==kickSeen){kickSeen=s.kickCount;const side=s.lastKicker,kicker=s[side],grade=s.touchGrade;
   // the receiver split-steps as the opponent strikes: a small hop, then ready to push off
   hopAge[side==='you'?1:0]=0;
   const moveLabel=s.goldenShot&&kicker.kickStyle!==6?{text:'GOLDEN TOUCH!',color:'#ffc93c'}:TENNIS_MOVE_LABEL[kicker.kickStyle];
   if(moveLabel){draw(touch,side==='rival'?'RIVAL '+moveLabel.text:moveLabel.text,moveLabel.color);show(touch,kicker.x,2.75,kicker.y,1.05,.55,side==='rival'?1.35:1.1);}
   else if(side==='rival'&&s.lastShot==='header'){draw(touch,'RIVAL HEADER','#74d6f2','A soft loop: move in');show(touch,kicker.x,2.75,kicker.y,1,.5,1.35);}
   else if(side==='rival'&&grade==='stretched'){draw(touch,'RIVAL STRETCHED','#ffb27a','Attack the weak return');show(touch,kicker.x,2.75,kicker.y,.95,.55,1.35);}
   else if(grade&&side==='you'){const g=TENNIS_GRADE_LABEL[grade],clean=grade==='good'||grade==='perfect';
    // Name the touch the player made when it was clean (chest, header, volley); otherwise name the habit to fix.
    const text=clean&&s.lastShot==='chest'?'CHEST TRAP!':clean&&s.lastShot==='header'?'HEADER!':clean&&s.touchVolley?'VOLLEY!':grade==='perfect'&&s.perfectStreak>=2?`PERFECT ×${s.perfectStreak}`:g.text;
    const sub=clean&&s.lastShot==='header'?'Guided into space':clean&&s.touchVolley?'Set early, clean contact':grade==='perfect'&&s.gold>0&&!s.goldReady?`${g.sub} · gold ${s.gold}/${TENNIS_GOLD}`:g.sub;
    draw(touch,text,clean&&(s.lastShot==='header'||s.touchVolley)?'#74d6f2':g.color,sub);show(touch,kicker.x,2.75,kicker.y,grade==='good'?.9:1.15,.55,grade==='perfect'||!clean?1.08:1);}
   if(side==='you'&&!stage.reduced)hitStop=s.goldenShot?TENNIS_HIT_STOP.golden:grade==='perfect'?TENNIS_HIT_STOP.perfect:s.lastShot==='slam'||s.lastShot==='scissor'||s.lastShot==='shark'?TENNIS_HIT_STOP.slam:0;
   if(s.goldenShot)emit('tennis:golden:'+s.lastShot);
   if(intent.text!=='WRONG-FOOTED!')intent.life=Math.min(intent.life,intent.age+.12);planSeen=false;
   if(s.wrongFooted!==wrongSeen){wrongSeen=s.wrongFooted;draw(intent,'WRONG-FOOTED!','#73fff1');show(intent,s.rival.x,3.1,s.rival.y,1.1,.2,1.35);}
   emit(`tennis:kick:${side}:${grade||'serve'}:${s.lastShot}:${s.rally}:${kicker.kickPower.toFixed(2)}:${side==='you'?s.perfectStreak:0}:${s.touchVolley?1:0}`);
   // Rally milestones and tempo steps share one banner: when both land on the same touch, say both.
   const tempoNow=tennisTempo(s);if(s.rally<lastRallyCall)lastRallyCall=0; // a new point: milestones count again
   if(s.rally>=5&&s.rally%5===0&&s.rally!==lastRallyCall){lastRallyCall=s.rally;draw(banner,`${s.rally}-TOUCH RALLY!`,'#ffe084',tempoNow>tempoSeen?'Tempo up · the ball is faster':'Keep moving into position');show(banner,0,2.3,-1.5,1.1,.25);if(tempoNow>tempoSeen){tempoSeen=tempoNow;emit(`tennis:tempo:${tempoNow}`);}}
   // Long rally on an early court: the rival tires and is slow to recover. Say where that leaves space.
   if(s.rally<=1)tireSeen=false;else if(!tireSeen&&side==='you'&&tennisRivalTire(s)>0){tireSeen=true;draw(banner,'RIVAL IS TIRING!','#ff9fc8','Aim into the open space');show(banner,0,2.3,-1.5,1.4,.25);emit('tennis:tire');}
  }
  if(s.bounceEvents!==bounceSeen){bounceSeen=s.bounceEvents;const sand=TENNIS_COURTS[s.level-1].surface==='sand';emit(`tennis:bounce:${s.fxLandI.toFixed(2)}:${b.y>0?'you':'rival'}${sand?':sand':''}`);if(sand)stage.burst?.(b.x,.06,b.y,.35);}
  // Trap: name the touch (thigh/chest) and what it sets up.
  if(s.trapEvents!==trapSeen){trapSeen=s.trapEvents;const who=s[s.trapSide],chest=who.kickStyle===5;
   if(s.trapSide==='you'){const good=s.trapGrade==='good';draw(touch,good?(chest?'CHEST TRAP · SET!':'THIGH TRAP · SET!'):'HEAVY TRAP',good?'#73fff1':'#ffb27a',good?'Now strike it':s.trapGrade==='heavy'?'Slow your feet first':'Get your body in line');show(touch,who.x,2.6,who.y,.9,.45);}
   else{draw(intent,'IT TRAPS · GET SET','#ffc0e8');show(intent,who.x,3.1,who.y,1,.15,1.35);}
   emit(`tennis:trap:${s.trapSide}:${chest?'chest':'thigh'}`);}
  if(s.outEvents!==outSeen){outSeen=s.outEvents;if(s.incomingOut&&s.phase==='rally'){draw(intent,'GOING OUT · LET IT GO','#ff8a8a');show(intent,s.you.x,3.3,s.you.y,1.3,.15,1.2);emit('tennis:out');}}
  if(s.goldReady&&!goldSeen){goldSeen=true;draw(banner,'GOLDEN TOUCH READY',('#ffc93c'),TENNIS_COURTS[s.level-1].aerial?'Your next shot is pure. Scissor = bicycle kick':'Your next shot is pure and fast');show(banner,0,2.3,-1.5,1.6,.25);emit('tennis:goldready');}
  if(!s.goldReady)goldSeen=false;
  // Trickster tell: the sole-roll fake shows before it switches sides.
  if(s.rivalFake&&s.fakeShown&&!fakeSeen){fakeSeen=true;fakeAge=0;draw(intent,'FAKE! STAY CENTRAL','#ffc0e8');show(intent,s.rival.x,3.1,s.rival.y,1.1,.15,1.35);emit('tennis:fake');}
  if(!s.fakeShown)fakeSeen=false;
  if(s.targetEvents!==targetSeen){targetSeen=s.targetEvents;draw(touch,'TARGET!','#ffc93c');show(touch,s.fxLandX,1.6,s.fxLandY,.9,.4,1.35);emit('tennis:target');}
  const tempo=s.phase==='rally'?tennisTempo(s):0;if(tempo>tempoSeen&&s.phase==='rally'){draw(banner,'TEMPO UP!','#ffe084',`Rally ${s.rally} · the ball is faster`);show(banner,0,2.3,-1.5,.9,.2,.72);emit(`tennis:tempo:${tempo}`);}tempoSeen=tempo;
  // Court intro: shown on the first rally touch (never during the idle serve, so the serve loop can sleep).
  if(introLevel!==s.level&&s.phase==='rally'&&s.rally===1){introLevel=s.level;const c=TENNIS_COURTS[s.level-1],best=readTennisStars()[s.level-1]??0;draw(intent,c.rival,'#ffc0e8');show(intent,s.rival.x,3.1,s.rival.y,1.6,.15,1.35);if(best){draw(banner,`BEST ${starText(best)}`,'#ffe084',`3rd star: ${c.star3}`);show(banner,0,2.3,-1.5,1.4,.2);}}
  if(s.netEvents!==netSeen){netSeen=s.netEvents;netAge=0;netAmp=Math.min(.09,.03+s.netPace*.006);netWobble=.6;emit(`tennis:net:${s.netKind}`);}
  // The rival commits before contact; on the first two courts we say it out loud.
  if(s.rivalPlan&&!planSeen&&s.phase==='rally'){planSeen=true;if(s.level<=2&&s.rally>1){draw(intent,tennisIntentLabel(s.rivalPlan,s.rivalPlanX),'#ffc0e8');show(intent,s.rival.x,3.1,s.rival.y,1.4,.15,1.35);if(touch.mesh.visible&&s.lastKicker==='rival')touch.mesh.visible=false;}}
  const points=s.score.you+s.score.rival;
  if(points!==pointSeen){pointSeen=points;const you=s.pointWinner==='you',over=s.phase==='over';
   const sub=s.pointKind==='space'?(you?'Into the open space':'It found the open space'):s.pointKind==='letgo'?(you?'The rival let it go':'Never let it go'):s.pointKind==='net'?(you?'The rival hit the net':'Lift it over the net'):s.pointKind==='out'?(you?(s.incomingOut?'Good leave: you judged it out':'The rival hit it out'):'Aim inside the lines'):'Get it over the net';
   const drill=TENNIS_COURTS[s.level-1].style==='drill',best=over?saveTennisStars(s.level,s.stars):0;
   if(drill&&!over)return;
   draw(banner,over?(drill?`DRILL ${starText(s.stars)}`:you?`COURT WON! ${starText(s.stars)}`:'GOOD GAME!'):you?'YOUR POINT!':'RIVAL POINT',you||drill&&s.stars>0?'#73fff1':'#ff9fc8',over?(drill?`${s.drillHits} targets · best ${starText(best)}`:`${s.score.you} : ${s.score.rival} · best ${starText(best)}`):sub);show(banner,0,2.3,-1.5,over?2.2:1.35,.2);
   emit(`tennis:${over?'match':'point'}:${s.pointWinner}:${s.rally}:${s.pointKind}`);touch.life=Math.min(touch.life,touch.age+.15);intent.life=0;intent.mesh.visible=false;
  }
 }
 const ease=(t:number)=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
 function tick(l:Label,dt:number){if(!l.mesh.visible)return;l.age+=dt;if(l.age>=l.life){l.mesh.visible=false;return;}
  const t=l.age/l.life,pop=stage.reduced?1:.55+.45*ease(Math.min(1,l.age/.16)),fade=t>.7?1-(t-.7)/.3:1;
  l.mesh.position.set(l.x,l.y+(stage.reduced?0:l.rise*Math.sqrt(t)),l.z);l.mesh.quaternion.copy(camera.quaternion);l.mesh.scale.setScalar(Math.max(.01,pop)*l.size*(stage.mobile?1.12:1));l.mesh.material.opacity=fade;}
 function sync(dt:number,ballY:number){
  events();
  // UI-ish effects run on real time, so a hit-stop freezes the players and ball, not the call-outs.
  const ui=realDt||dt;realDt=0;
  tick(touch,ui);tick(intent,ui);tick(banner,ui);
  if(intent.mesh.visible&&intent.text!=='GOING OUT · LET IT GO'){intent.x=tennis.rival.x;intent.z=tennis.rival.y;}
  // Net cord: the whole net and tape shiver from the hit point, decaying quickly.
  if(netWobble>0){netWobble=Math.max(0,netWobble-ui);netAge+=ui;const z=stage.reduced?0:Math.sin(netAge*42)*netAmp*(netWobble/.6);if(net)net.position.z=z;if(tape)tape.position.z=z*.6;}
  surface();{const drill=TENNIS_COURTS[tennis.level-1].style==='drill';target.visible=drill&&tennis.phase!=='over';if(target.visible){target.position.x=tennis.targetX;target.position.z=tennis.targetY;}}
  if(fakeAge<1)fakeAge=Math.min(1,fakeAge+ui/.8);
  {const s=tennis,b=s.ball,live=s.phase==='rally'&&b.last==='rival'&&b.bounces===0&&(s.incomingOut||s.headSpot&&b.z>TENNIS_HEAD_HEIGHT*.75);
   if(live&&spotKick!==s.kickCount+s.netEvents*1000){spotKick=s.kickCount+s.netEvents*1000;spotAge=0;spot.material.color.set(s.incomingOut?TENNIS_SPOT_COLOR.out:TENNIS_SPOT_COLOR.head);// An out ball is marked where it leaves the court (on the line), so the ring stays on screen above the controls.
    if(s.incomingOut)spot.position.set(Math.max(-TENNIS_EDGE.x,Math.min(TENNIS_EDGE.x,s.landX)),.05,Math.min(TENNIS_EDGE.y,s.landY));else spot.position.set(s.headX,.05,s.headY);}
   spot.visible=live;if(live){spotAge+=ui;spot.scale.setScalar(stage.reduced?1:1+.12*Math.sin(spotAge*9));}}
  {const s=tennis,side=tennisOpenSide(s),live=s.phase==='rally'&&s.ball.last==='rival'&&side!==0&&TENNIS_COURTS[s.level-1].style!=='drill';space.visible=live;
   if(live){space.position.x=side*3.7;spaceAge+=ui;space.scale.setScalar(stage.reduced?1:1+.1*Math.sin(spaceAge*7));space.material.opacity=Math.abs(s.shotAim*3.7-side*3.7)<1?1:.7;}else spaceAge=0;}
  const b=tennis.ball,high=tennis.phase==='rally'&&ballY>.75;stalk.visible=high;
  if(high){stalk.position.set(b.x,ballY/2,b.y);stalk.scale.set(1,Math.max(.01,ballY-.05),1);stalk.material.opacity=Math.min(.38,(ballY-.75)*.5);}
  for(let i=0;i<2;i++){if(hopAge[i]<1){hopAge[i]=Math.min(1,hopAge[i]+dt/.26);hop[i]=stage.reduced?0:Math.sin(Math.PI*hopAge[i])*.075;}else hop[i]=0;}
 }
 /** Overlay this game's reactions on a player's pose; returns the split-step hop height. */
 function pose(i:number,p:ArcadePoseOptions,kicking:boolean){
  const s=tennis,side=i?'rival':'you';
  p.stun=i&&s.rivalStumble>0?Math.min(1,s.rivalStumble/.4):0;
  const P=i?s.rival:s.you,prog=1-P.kick/Math.max(.01,P.kickSpan);p.slide=0;p.skill=undefined;
  let lift=0;
  if(kicking&&P.kickStyle===6){const m=movePose[i],c=MOVE_PHASE.bicycle.contact;m.kind='bicycle';m.progress=c+prog*(1-c);m.side=P.kickContactX<0?-1:1;m.height=1;p.move=m;p.reaction=undefined;lift=stage.reduced?0:Math.sin(Math.PI*Math.min(1,prog*1.6))*.45;}
  else if(kicking&&P.kickStyle===7){const m=movePose[i],c=MOVE_PHASE.scissor.contact;m.kind='scissor';m.progress=c+prog*(1-c);m.side=P.kickContactX<0?-1:1;m.height=1;p.move=m;p.reaction=undefined;lift=stage.reduced?0:Math.sin(Math.PI*Math.min(1,prog*1.4))*.55;}
  else if(kicking&&P.kickStyle===8){p.reaction='thigh';p.reactionProgress=prog;p.move=undefined;}
  else if(kicking&&P.kickStyle===9){p.slide=prog<.75?1:(1-prog)*4;p.move=undefined;}
  else if(kicking&&P.kickStyle===10){const k=skillPose[i];k.type='rainbowFlick';k.progress=.45+prog*.55;k.side=1;p.skill=k;p.move=undefined;}
  else if(!kicking&&i&&s.rivalFake&&s.fakeShown&&s.rivalPlan&&fakeAge<1){const m=movePose[i];m.kind='soleRoll';m.progress=fakeAge;m.side=s.rivalPlanX<0?1:-1;m.height=0;p.move=m;}
  else if(!kicking&&s.phase==='serve'&&s.server===side&&side==='rival'){const m=movePose[i];m.kind='flickUp';m.progress=Math.min(1,s.phaseTime/1.1);m.side=1;m.height=0;p.move=m;}
  if(lift>0)return lift;
  if(!kicking&&(s.phase==='point'||s.phase==='over')&&s.pointWinner&&s.pointWinner!==side){p.reaction='dejected';p.reactionProgress=Math.min(1,s.phaseTime/.8);}
  return kicking?0:hop[i];
 }
 function active(){return fakeAge<1||hitStop>0||netWobble>0||touch.mesh.visible||intent.mesh.visible||banner.mesh.visible||hopAge[0]<1||hopAge[1]<1;}
 function dispose(){sandMat.dispose();target.geometry.dispose();target.material.dispose();target.removeFromParent();halves.forEach((h,i)=>{h.material=hardMats[i];});for(const l of[touch,intent,banner]){l.tex.dispose();l.mesh.geometry.dispose();l.mesh.material.dispose();l.mesh.removeFromParent();}stalk.geometry.dispose();stalk.material.dispose();stalk.removeFromParent();spot.geometry.dispose();spot.material.dispose();spot.removeFromParent();space.geometry.dispose();space.material.dispose();space.removeFromParent();}
 return{scale,sync,pose,reset,active,dispose,heat:()=>tennisRallyHeat(tennis)};
}
