import * as T from 'three';
import type {MatchSim} from './match/matchSim';
import {fieldPoint,type Venue} from './venues';

export type MatchEvent={id:number;time:number;text:string};
/** Short, pooled ribbons follow actual ball flight; goals are driven by score changes. */
export function createMatchEffects(parent:T.Group,venue:Venue){
 const root=new T.Group();root.name='live-effects-'+venue.id;parent.add(root);
 const geometry=new T.BufferGeometry(),positions=new T.Float32BufferAttribute(new Float32Array(48*18),3),colors=new T.Float32BufferAttribute(new Float32Array(48*24),4);
 geometry.setAttribute('position',positions);geometry.setAttribute('color',colors);geometry.setDrawRange(0,0);
 const material=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}),ribbon=new T.Mesh(geometry,material);ribbon.frustumCulled=false;ribbon.name='ball-flight-trail';root.add(ribbon);
 const points=Array.from({length:48},()=>({x:0,y:0,z:0,age:9}));let used=0,lastGold=0,lastBlue=0,celebration=9,lastPasses=0,lastShots=0,lastTurnovers=0,sequence=0;
 const events:MatchEvent[]=[];const announce=(sim:MatchSim,text:string)=>{events.push({id:++sequence,time:sim.stats.time,text});if(events.length>80)events.shift();};
 const stats={passes:0,shots:0,goals:0,trailVertices:0};
 const ringGeometry=new T.RingGeometry(.85,1,40),ringMaterial=new T.MeshBasicMaterial({color:'#efbb54',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const rings=[new T.Mesh(ringGeometry,ringMaterial),new T.Mesh(ringGeometry,ringMaterial.clone())];rings.forEach(r=>{r.rotation.x=-Math.PI/2;root.add(r);});
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const badge=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));badge.name='goal-celebration';badge.renderOrder=9;root.add(badge);
 // One pooled billboard adds a team-colored light burst without real-time lights.
 const lightCanvas=document.createElement('canvas');lightCanvas.width=640;lightCanvas.height=320;
 const lightTexture=new T.CanvasTexture(lightCanvas);lightTexture.colorSpace=T.SRGBColorSpace;
 const light=new T.Sprite(new T.SpriteMaterial({map:lightTexture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending}));
 light.name='goal-score-lightning';light.renderOrder=8;light.visible=false;root.add(light);
 function paintLight(home:boolean){
  const c=lightCanvas.getContext('2d')!,color=home?'255,192,69':'108,183,255';c.clearRect(0,0,640,320);
  const glow=c.createRadialGradient(320,160,55,320,160,285);glow.addColorStop(0,`rgba(${color},0)`);glow.addColorStop(.45,`rgba(${color},.65)`);glow.addColorStop(1,`rgba(${color},0)`);c.fillStyle=glow;c.fillRect(0,0,640,320);
  c.strokeStyle=`rgb(${color})`;c.lineWidth=5;c.lineJoin='round';c.shadowColor=`rgb(${color})`;c.shadowBlur=14;
  for(const side of [-1,1])for(const row of [-1,1]){
   c.beginPath();c.moveTo(320+side*190,160+row*54);c.lineTo(320+side*229,160+row*79);c.lineTo(320+side*220,160+row*50);c.lineTo(320+side*289,160+row*106);c.stroke();
  }
  c.strokeStyle='#fff7d9';c.lineWidth=2;c.shadowBlur=4;
  for(const side of [-1,1]){c.beginPath();c.moveTo(275,160+side*74);c.lineTo(304,160+side*96);c.lineTo(324,160+side*83);c.lineTo(365,160+side*124);c.stroke();}
  // Feather the whole burst to transparent before the texture edge, including
  // the lightning strokes. The existing billboard and texture are reused.
  c.save();c.shadowBlur=0;c.globalCompositeOperation='destination-in';c.translate(320,160);c.scale(320,160);
  const edgeFade=c.createRadialGradient(0,0,0,0,0,1);edgeFade.addColorStop(0,'rgba(255,255,255,1)');edgeFade.addColorStop(.55,'rgba(255,255,255,1)');edgeFade.addColorStop(.78,'rgba(255,255,255,.55)');edgeFade.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=edgeFade;c.fillRect(-1,-1,2,2);c.restore();
  lightTexture.needsUpdate=true;
 }
 const gold=new T.Color('#efbb54'),blue=new T.Color('#609de3'),shotColor=new T.Color('#fff1bd');
 function update(sim:MatchSim,dt:number,enabled:boolean,reduced:boolean){
  root.visible=enabled;celebration+=dt;
  if(sim.stats.passes>lastPasses){stats.passes+=sim.stats.passes-lastPasses;announce(sim,`${sim.possession==='gold'?'Gold':'Blue'} passes${sim.ball.target?' to '+sim.ball.target.toUpperCase():''}.`);}
  if(sim.stats.shots>lastShots){stats.shots+=sim.stats.shots-lastShots;announce(sim,`${sim.possession==='gold'?'Gold':'Blue'} shoots toward goal.`);}
  if(sim.stats.turnovers>lastTurnovers)announce(sim,`${sim.possession==='gold'?'Gold':'Blue'} wins possession.`);lastTurnovers=sim.stats.turnovers;
  lastPasses=sim.stats.passes;lastShots=sim.stats.shots;
  if(sim.score.gold>lastGold||sim.score.blue>lastBlue){celebration=0;stats.goals++;announce(sim,`Goal for ${sim.score.gold>lastGold?'Gold':'Blue'}! Gold ${sim.score.gold}, Blue ${sim.score.blue}.`);const home=sim.score.gold>lastGold;paintLight(home);const c=canvas.getContext('2d')!;c.clearRect(0,0,512,192);c.fillStyle='rgba(243,166,196,.65)';c.fillRect(0,0,512,192);c.textAlign='center';c.fillStyle='#502b40';c.font='bold 72px Arial';c.fillText('GOAL!',256,82);c.fillStyle='#502b40';c.font='bold 40px Arial';c.fillText(`${sim.score.gold}  —  ${sim.score.blue}`,256,150);texture.needsUpdate=true;badge.position.set(venue.x,5,venue.z);rings.forEach(r=>{r.material.color.copy(home?gold:blue);r.position.set(venue.x,.24,venue.z+(home?-1:1)*venue.length/2);});}
  lastGold=sim.score.gold;lastBlue=sim.score.blue;
  badge.visible=enabled&&celebration<2.5;badge.material.opacity=Math.min(1,(2.5-celebration)*2);const pop=reduced?1:1+.1*Math.sin(Math.min(1,celebration/.35)*Math.PI);badge.scale.set(9*pop,3.375*pop,1);badge.position.y=5+(reduced?0:Math.min(.7,celebration*.3));
  light.visible=enabled&&celebration>=0&&celebration<(reduced?2.5:1.35);
  light.position.copy(badge.position);light.scale.set(14*(reduced?1:1+Math.min(1,celebration/1.35)*.16),7*(reduced?1:1+Math.min(1,celebration/1.35)*.16),1);
  // A single smooth burst; reduced motion keeps a quiet, stationary halo.
  light.material.opacity=reduced?.2*Math.max(0,Math.min(1,(2.5-celebration)*2)):Math.max(0,1-celebration/1.35)*Math.min(1,celebration/.08);
  rings.forEach((r,i)=>{const age=celebration-i*.2;r.visible=enabled&&!reduced&&age>=0&&age<1.3;r.scale.setScalar(1+Math.max(0,age)*5);r.material.opacity=Math.max(0,.65-age*.5);});
  for(let i=0;i<used;i++)points[i].age+=dt;
  const flying=enabled&&!reduced&&!sim.ball.owner&&Math.hypot(sim.ball.vx,sim.ball.vy)>2&&sim.goalHold<=0;
  if(!enabled){used=0;}else if(flying&&dt>0){const at=fieldPoint(venue,sim.ball),last=used?points[used-1]:null;
   if(last&&Math.hypot(last.x-at.x,last.z-at.z)>8)used=0;
   if(!last||Math.hypot(last.x-at.x,last.z-at.z)>.035){if(used===points.length){for(let i=1;i<used;i++)Object.assign(points[i-1],points[i]);used--;};Object.assign(points[used++],{x:at.x,y:.3+sim.ball.height,z:at.z,age:0});}
  }
  let count=0;const lifetime=sim.shotActive?.6:.38,width=sim.shotActive?.18:.09,color=sim.shotActive?shotColor:sim.possession==='blue'?blue:gold;
  for(let i=1;i<used;i++){const a=points[i-1],b=points[i];if(a.age>lifetime)continue;const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);if(length<.001)continue;const sx=-dz/length*width,sz=dx/length*width;
   for(const [p,side] of [[a,-1],[a,1],[b,-1],[a,1],[b,1],[b,-1]] as const){positions.setXYZ(count,p.x+sx*side,p.y,p.z+sz*side);colors.setXYZW(count,color.r,color.g,color.b,Math.max(0,1-p.age/lifetime)*.8);count++;}
  }
  geometry.setDrawRange(0,count);positions.needsUpdate=true;colors.needsUpdate=true;stats.trailVertices=count;
 }
 return {root,stats,events,update,dispose(){root.removeFromParent();geometry.dispose();material.dispose();ringGeometry.dispose();rings.forEach(r=>r.material.dispose());texture.dispose();badge.material.dispose();lightTexture.dispose();light.material.dispose();}};
}
