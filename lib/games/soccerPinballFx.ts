import * as T from 'three';
import {PINBALL_POPUP_LIFE,type PinballFeel,type PinballPopupKind} from './soccerPinballFeel';
import {pinballReadShow,PINBALL_READ_DOTS,type PinballState} from './soccerPinball';

/* Futbol Pinball visual juice, built once and pooled:
 *  - 4 billboarded score pop-ups (one small canvas texture each, redrawn only
 *    when a pop-up spawns, never per frame);
 *  - 3 neon hit rings sharing one geometry;
 *  - one "BALL SAVE" insert between the flippers that lights while the ball
 *    save is armed, flashes green on a rescue and coral on a drain;
 *  - the rebound READ marker: a landing ring on the flipper line in the
 *    receiving bat's colour (yellow left, pink right, coral = the centre
 *    gap) that closes in as the ball arrives — fully closed = strike now —
 *    plus up to 8 path dots in one instanced draw (early divisions only);
 *  - the 2v1 multiball's second football: a clone of the game ball (shared
 *    geometry and materials), drawn only while that ball is live.
 * Idle pieces are hidden, so the steady-state cost is the insert's single
 * draw call. Every material is a Mesh material flagged arcadeSpill, so the
 * stage's dispose() frees textures with it — no separate teardown. */

const POPUP_COLORS:Record<PinballPopupKind,string>={score:'#73fff1',goal:'#ffe86d',lit:'#ffe86d',save:'#fff0cf',rescue:'#8dff9e',warn:'#ff7a8a'};
const RING_LIFE=.38;

export function createPinballFx(scene:T.Scene,camera:T.Camera,px:(x:number)=>number,pz:(y:number)=>number,mobile:boolean){
 const font=(()=>{try{return getComputedStyle(document.documentElement).getPropertyValue('--btn-font').trim();}catch{return'';}})()||'"Arial Black",Arial,sans-serif';
 const plane=new T.PlaneGeometry(1,1);
 const popups=Array.from({length:4},(_,i)=>{
  const canvas=document.createElement('canvas');canvas.width=mobile?288:384;canvas.height=mobile?72:96;
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});material.userData.arcadeSpill=true;
  const mesh=new T.Mesh(plane,material);mesh.name=`pinball-popup-${i}`;mesh.visible=false;mesh.renderOrder=20;mesh.frustumCulled=false;scene.add(mesh);
  return{mesh,canvas,texture,material,serial:0,aspect:3.2};
 });
 const ringGeometry=new T.RingGeometry(.82,1,40);
 const rings=Array.from({length:3},(_,i)=>{
  const material=new T.MeshBasicMaterial({color:i===1?'#ff62c2':'#73fff1',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});
  const mesh=new T.Mesh(ringGeometry,material);mesh.name=`pinball-hit-ring-${i}`;mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.renderOrder=5;scene.add(mesh);
  return{mesh,material,age:RING_LIFE,power:1};
 });
 let ringSerial=0,ringCursor=0;
 // Ball-save insert: painted once.
 const insertCanvas=document.createElement('canvas');insertCanvas.width=256;insertCanvas.height=64;
 {const g=insertCanvas.getContext('2d');if(g){g.clearRect(0,0,256,64);g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.roundRect?.(4,6,248,52,26);g.fill();g.globalCompositeOperation='destination-out';g.font=`900 30px ${font}`;g.textAlign='center';g.textBaseline='middle';g.fillText('BALL SAVE',128,33);}}
 const insertTexture=new T.CanvasTexture(insertCanvas);insertTexture.colorSpace=T.SRGBColorSpace;
 const insertMaterial=new T.MeshBasicMaterial({map:insertTexture,color:'#8dff9e',transparent:true,opacity:.16,depthWrite:false,toneMapped:false});insertMaterial.userData.arcadeSpill=true;
 const insert=new T.Mesh(plane,insertMaterial);insert.name='pinball-ball-save';insert.rotation.x=-Math.PI/2;insert.position.set(px(180),.03,pz(586));insert.scale.set(2.5,.62,1);scene.add(insert);
 // Second ball for the 2v1 multiball: shares the real ball's meshes/materials.
 const source=scene.getObjectByName('pinball-ball');
 const extra=source?source.clone(true):null,extraRoll=extra?.getObjectByName('pinball-rolling')??null;let extraSpin=0;
 if(extra){extra.name='pinball-ball-2';extra.visible=false;extra.scale.setScalar(1);scene.add(extra);}
 const green=new T.Color('#8dff9e'),coral=new T.Color('#ff7a6b'),gold=new T.Color('#ffe86d');
 // Rebound read: 2 draw calls while visible, none otherwise.
 const READ_COLORS=[new T.Color('#ffe86d'),new T.Color('#ff62c2'),new T.Color('#ff7a6b')];
 const readMaterial=new T.MeshBasicMaterial({color:READ_COLORS[0],transparent:true,opacity:0,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const readRing=new T.Mesh(new T.RingGeometry(.7,.9,36),readMaterial);readRing.name='pinball-read-ring';readRing.rotation.x=-Math.PI/2;readRing.visible=false;readRing.renderOrder=6;scene.add(readRing);
 const dotMaterial=new T.MeshBasicMaterial({color:READ_COLORS[0],transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const readDots=new T.InstancedMesh(new T.CircleGeometry(.075,10),dotMaterial,PINBALL_READ_DOTS);readDots.name='pinball-read-dots';readDots.count=0;readDots.visible=false;readDots.frustumCulled=false;readDots.renderOrder=6;scene.add(readDots);
 const dot=new T.Object3D();dot.rotation.x=-Math.PI/2;let readDrawn=-1;

 function paint(p:typeof popups[number],text:string,kind:PinballPopupKind){
  const g=p.canvas.getContext('2d');if(!g)return;const w=p.canvas.width,h=p.canvas.height;g.clearRect(0,0,w,h);
  let size=h*.62;g.font=`900 ${size}px ${font}`;const measured=g.measureText(text).width;if(measured>w*.94){size*=w*.94/measured;g.font=`900 ${size}px ${font}`;}
  g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=size*.2;g.strokeStyle='rgba(14,20,44,.92)';g.strokeText(text,w/2,h/2+2);g.fillStyle=POPUP_COLORS[kind];g.fillText(text,w/2,h/2+2);
  p.aspect=w/h;p.texture.needsUpdate=true;
 }

 function update(f:PinballFeel,s:PinballState,dt:number,reduced:boolean){
  // Pop-ups: spring in, drift up, fade. Reduced motion: no drift or scale pop.
  for(let i=0;i<popups.length;i++){
   const p=popups[i],src=f.popups[i];
   if(src.serial!==p.serial){p.serial=src.serial;paint(p,src.text,src.kind);}
   const alive=src.age<PINBALL_POPUP_LIFE&&src.serial>0;p.mesh.visible=alive;if(!alive)continue;
   const t=src.age/PINBALL_POPUP_LIFE,big=src.kind==='goal'?2.1:src.kind==='lit'||src.kind==='rescue'?1.6:1;
   const pop=reduced?1:t<.14?1.18*Math.sin(t/.14*Math.PI*.5):1+.18*Math.exp(-(t-.14)*14);
   const height=.6*big*(mobile?1.15:1)*pop,rise=reduced?0:1-(1-t)*(1-t);
   p.mesh.scale.set(height*p.aspect,height,1);
   // Drift up-table as well as up, so the rise reads from the top-down camera.
   p.mesh.position.set(px(src.x),1+rise*.8,pz(src.y)-rise*.9);
   p.mesh.quaternion.copy(camera.quaternion);
   p.material.opacity=t<.6?1:1-(t-.6)/.4;
  }
  // Neon hit rings.
  if(f.ringSerial!==ringSerial){ringSerial=f.ringSerial;if(!reduced){const r=rings[ringCursor];ringCursor=(ringCursor+1)%rings.length;r.age=0;r.power=f.ringPower;r.mesh.position.set(px(f.ringX),.06,pz(f.ringY));}}
  for(const r of rings){
   if(r.age>=RING_LIFE){r.mesh.visible=false;continue;}
   r.age=Math.min(RING_LIFE,r.age+dt);const t=r.age/RING_LIFE,ease=1-(1-t)*(1-t)*(1-t);
   r.mesh.visible=true;r.mesh.scale.setScalar(.25+ease*1.25*r.power);r.material.opacity=(1-t)*.85;
  }
  // Rebound read marker.
  {const show=pinballReadShow(s),r=s.read;
   if(show.ring>0){
    const colour=READ_COLORS[r.side<0?2:r.side],left=Math.max(0,r.eta-(s.time-r.at)),close=Math.min(1,left/.6);
    readMaterial.color.copy(colour);readMaterial.opacity=show.ring*(.55+.4*(1-close));
    readRing.position.set(px(r.x),.07,pz(505));readRing.scale.setScalar(.38+close*.9);readRing.visible=true;
   }else readRing.visible=false;
   if(show.path>0&&r.n>0){
    if(readDrawn!==r.at){readDrawn=r.at;for(let i=0;i<r.n;i++){dot.position.set(px(r.dots[i*2]),.065,pz(r.dots[i*2+1]));dot.updateMatrix();readDots.setMatrixAt(i,dot.matrix);}readDots.count=r.n;readDots.instanceMatrix.needsUpdate=true;}
    dotMaterial.color.copy(READ_COLORS[r.side<0?2:r.side]);dotMaterial.opacity=show.path*.7;readDots.visible=true;
   }else readDots.visible=false;}
  // Ball-save insert: lit while armed (blinks in its final second), green
  // flash on a rescue, coral flash on a real drain, dim otherwise.
  if(extra){const on=s.extraLive&&s.phase==='playing';extra.visible=on;if(on){const b=s.extra,speed=Math.hypot(b.vx,b.vy);extra.position.set(px(b.x),7/30,pz(b.y));if(speed>1)extra.rotation.set(0,-Math.atan2(b.vy,b.vx),0);extraSpin+=speed*dt/7;if(extraRoll)extraRoll.rotation.set(0,0,extraSpin);}}
  const multiSave=s.extraLive&&s.mbSave>0&&s.phase==='playing';
  const armed=multiSave||s.openingRescue&&(s.phase==='ready'||s.phase==='playing'&&s.launchGrace>0);
  const blink=s.phase==='playing'&&(multiSave?s.mbSave:s.launchGrace)<1&&!reduced?(Math.sin(s.time*Math.PI*8)>0?1:.35):1;
  let opacity=armed?(s.phase==='ready'?.62:.92*blink):.14;
  insertMaterial.color.copy(green);
  if(f.rescueFlash>0){opacity=Math.max(opacity,reduced?.9:.55+.45*f.rescueFlash);}
  if(f.drainFlash>0){insertMaterial.color.lerp(coral,Math.min(1,f.drainFlash*1.5));opacity=Math.max(opacity,reduced?.6:.2+.7*f.drainFlash);}
  if(s.phase==='goal'){insertMaterial.color.copy(gold);opacity=Math.max(opacity,.5);}
  insertMaterial.opacity=opacity;
 }
 return{update};
}
