import {createBallSparkles} from './ballSparkles';
import * as T from 'three';
import {SWIM_RIPPLE_CAP} from './swimRipples';
import type {CharacterCustomization} from '../town/customization';
export function createBallEffects(){
 const root=new T.Group();root.name='ball-shot-effects';const sparkles=createBallSparkles();root.add(sparkles.root);
 const points=Array.from({length:20},()=>new T.Vector3()),positions=new Float32Array(60),geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));
 const material=new T.LineBasicMaterial({color:'#fff1b3',transparent:true,opacity:.6,depthWrite:false});const trail=new T.Line(geometry,material);trail.frustumCulled=false;root.add(trail);
 const ghostGeometry=new T.SphereGeometry(.16,8,6),ghostMaterial=new T.MeshBasicMaterial({color:'#fff1b3',transparent:true,opacity:.42,depthWrite:false}),ghosts=Array.from({length:14},()=>{const ghost=new T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>(ghostGeometry,ghostMaterial);root.add(ghost);return ghost;});
 const shardGeometry=new T.IcosahedronGeometry(.16,0);
 const starShape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.06:.16;i?starShape.lineTo(Math.cos(a)*r,Math.sin(a)*r):starShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}starShape.closePath();const starGeometry=new T.ShapeGeometry(starShape);
 const ringGeometry=new T.RingGeometry(.8,1,24),rings=Array.from({length:5},()=>{const material=new T.MeshBasicMaterial({color:'#fff3c2',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});const mesh=new T.Mesh(ringGeometry,material);mesh.visible=false;root.add(mesh);return{mesh,material,age:1,power:0,flat:false,size:1};});let cursor=0,wasShot=false,clock=0,hidden=false,lastColor="";
 // Swim ripples (swimRipples.ts): a second small pool of thin, longer-lived, wobbling flat rings in world space (SWIM_RIPPLE_CAP live); hidden = no draw.
 const rippleGeometry=new T.RingGeometry(.9,1,40),swimRipples=Array.from({length:SWIM_RIPPLE_CAP},()=>{const material=new T.MeshBasicMaterial({color:'#e3f8ff',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});const mesh=new T.Mesh(rippleGeometry,material);mesh.name='swim-ripple';mesh.visible=false;mesh.renderOrder=1;mesh.frustumCulled=false;root.add(mesh);return{mesh,material,age:1,life:1,maxR:1,op:0,stretch:1,angle:0,still:0,seed:0};});let rippleCursor=0,rippleSeed=0;
 const solarMaterial=new T.MeshBasicMaterial({color:'#ffd36b',transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide}),solarRings=Array.from({length:3},()=>{const ring=new T.Mesh(ringGeometry,solarMaterial);ring.name='solar-ball-trail-ring';root.add(ring);return ring;});
 const chargeMaterial=new T.MeshBasicMaterial({color:'#ffdc79',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}),chargeRing=new T.Mesh(ringGeometry,chargeMaterial);chargeRing.name='ball-charge-glow';root.add(chargeRing);
 const energyMaterial=new T.MeshBasicMaterial({color:'#fff2a6',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}),energy=Array.from({length:8},()=>{const mesh=new T.Mesh(ghostGeometry,energyMaterial);mesh.name='ball-charge-energy';root.add(mesh);return mesh;});
 // A splash-down's burst (lib/town/water, user Oct 15 2026: "a real splash"): the 14 ghost spheres are the spray crown (a column
 // thrown up that falls back) and the 8 charge spheres the droplets flung wider, on gravity arcs from the hit point, for
 // SPLASH_BURST_S. The ball is parked on the sand while anyone is in the sea, so the trail and the charge never want them at the
 // same time; the burst borrows their materials (recoloured to water, restored through `lastColor` when it ends). Bounded: 22
 // instances already in the pool, no allocation at the hit (the per-droplet seeds live in one typed array), nothing at rest.
 const SPLASH_BURST_S=.95,DROPS=ghosts.length+energy.length,seeds=new Float32Array(DROPS*4);/* angle, up speed, out speed, size per drop */
 const burst={age:SPLASH_BURST_S,x:0,y:0,z:0,power:0,drips:false};let burstWas=false;
 const seed=(power:number,drips:boolean)=>{for(let i=0;i<DROPS;i++){const o=i*4,crown=i<ghosts.length,u=((i*0.618034)%1),v=((i*0.381966+.17)%1);
   seeds[o]=u*Math.PI*2;seeds[o+1]=drips?.4+v*.5:crown?(3.2+v*1.6)*(.55+.45*power):(2+v*2.2)*(.55+.45*power);
   seeds[o+2]=drips?.15+u*.25:crown?.25+v*.55:(1.1+u*1.5)*(.6+.4*power);seeds[o+3]=drips?.1:crown?.38+v*.3:.16+v*.14;}};
 return {root,impact(x:number,y:number,z:number){const ring=rings[cursor++%rings.length];ring.age=0;ring.power=0;ring.flat=false;ring.size=1;ring.material.color.set('#fff3c2');ring.mesh.position.set(x,y,z);},
  /** A ball landing in the sea (ballSea.ts): two pooled rings, one lying flat on the water and one small upright burst. */
  /** A ripple ring on the water (wading, swimming, surfacing; lib/town/water): one pooled flat ring, `power` its size. */
  /** A swim ripple (swimRipples.ts): a thin ring that spreads to `maxR` m over `life` s and fades (opacity ≤ .35), slightly wobbly; `stretch` lengthens it along `angle` (the bow wake's V), `still` = 1 holds it at `maxR` (reduced motion). */
  swimRipple(x:number,y:number,z:number,maxR:number,life:number,opacity:number,stretch=1,angle=0,still=0){const r=swimRipples[rippleCursor++%swimRipples.length];r.age=0;r.life=life;r.maxR=maxR;r.op=Math.min(.35,opacity);r.stretch=stretch;r.angle=angle;r.still=still;r.seed=(rippleSeed=(rippleSeed+2.399)%6.283);r.mesh.position.set(x,y+.05,z);},
  ripple(x:number,y:number,z:number,power:number,size=1){const ring=rings[cursor++%rings.length];ring.age=0;ring.power=power;ring.flat=true;ring.size=size;ring.material.color.set('#dffbff');ring.mesh.position.set(x,y+.03,z);},
  splash(x:number,y:number,z:number){for(const [flat,power] of [[true,1.1],[false,.2]] as const){const ring=rings[cursor++%rings.length];ring.age=0;ring.power=power;ring.flat=flat;ring.size=1;ring.material.color.set('#e8fbff');ring.mesh.position.set(x,y+(flat?.03:.25),z);}},
  /**
   * A splash-down (a fall, a roof jump, a ride launch, the jetpack "Drop in" hitting the sea): the whole ring pool as the crown
   * (a wide foam ring on the water, two upright crown rings lifted above it, two later foam rings spreading out), plus the spray
   * burst of ghost spheres and droplets. `size` ≈ 0.6 (feet first from low) … 1.6 (a clean dive from high up). Reduced motion:
   * one foam ring, no burst (the sound still plays: the host's cue).
   */
  splashDown(x:number,y:number,z:number,size:number,reduced:boolean){
   const s=Math.max(.5,Math.min(1.7,size));
   const crown=(flat:boolean,power:number,scale:number,lift:number,delay:number)=>{const ring=rings[cursor++%rings.length];ring.age=-delay;ring.power=power;ring.flat=flat;ring.size=scale;ring.material.color.set(flat?'#eafdff':'#ffffff');ring.mesh.position.set(x,y+lift,z);};
   crown(true,.9*s,1.3*s,.03,0);
   if(reduced)return;
   crown(false,.5*s,.9*s,.35*s,.02);crown(false,.35*s,.7*s,.75*s,.08);crown(true,.6*s,1.1*s,.03,.22);crown(true,.4*s,1.4*s,.03,.45);
   burst.age=0;burst.x=x;burst.y=y;burst.z=z;burst.power=s;burst.drips=false;seed(s,false);
  },
  /** Surfacing after the dip: a few drips falling off the head and shoulders (the droplet spheres, small and close). */
  drips(x:number,y:number,z:number,reduced:boolean){if(reduced)return;burst.age=0;burst.x=x;burst.y=y;burst.z=z;burst.power=.3;burst.drips=true;seed(.3,true);},launch(x:number,y:number,z:number,power:number){if(power<=.05)return;for(let i=0;i<3;i++){const ring=rings[cursor++%rings.length];ring.age=-i*.065;ring.power=power;ring.size=1;ring.material.color.set(i%2?'#fff8db':'#ffce67');ring.mesh.position.set(x,y,z);}},update(dt:number,p:{x:number;y:number;z:number},shot:boolean,reduced:boolean,camera:T.Camera,power=0,charging=-1,color='#eee4c4',style:CharacterCustomization['ball']='classic'){
  sparkles.update(dt,p,shot,root.visible,reduced,color);
  if(!root.visible){if(!hidden){hidden=true;wasShot=false;burst.age=SPLASH_BURST_S;for(const ring of rings){ring.age=1;ring.mesh.visible=false;}for(const r of swimRipples){r.age=r.life;r.mesh.visible=false;}chargeRing.visible=trail.visible=false;for(const mesh of [...energy,...ghosts,...solarRings])mesh.visible=false;}return;}hidden=false;
  clock+=dt;chargeRing.visible=charging>=0;chargeRing.position.set(p.x,p.y,p.z);chargeRing.quaternion.copy(camera.quaternion);chargeRing.scale.setScalar(.27+Math.max(0,charging)*.13+(reduced?0:Math.sin(clock*12)*.025));chargeMaterial.opacity=charging>=0?.3+charging*.35:0;material.opacity=.6+power*.3;ghostMaterial.opacity=.42+power*.2;if(color!==lastColor){lastColor=color;material.color.set(color);ghostMaterial.color.copy(material.color);solarMaterial.color.set(color);chargeMaterial.color.set(color);energyMaterial.color.set(color);}
  energyMaterial.opacity=charging>=0?.4+charging*.5:0;energy.forEach((mesh,i)=>{mesh.visible=charging>=0&&!reduced;if(!mesh.visible)return;const phase=(clock*(.8+Math.max(0,charging)*.7)+i/8)%1,angle=i*Math.PI*.75+clock*1.4,radius=.2+(1-phase)*(.45+Math.max(0,charging)*.3);mesh.position.set(p.x+Math.cos(angle)*radius,p.y+Math.sin(angle)*radius*.65,p.z+Math.sin(angle+.8)*radius);mesh.scale.setScalar(.1+phase*.17);});
  if(!shot||!wasShot)points.forEach(v=>v.set(p.x,p.y,p.z));else if(dt>0){for(let i=points.length-1;i>0;i--)points[i].copy(points[i-1]);points[0].set(p.x,p.y,p.z);}wasShot=shot;trail.visible=shot&&!reduced;
  ghosts.forEach((ghost,i)=>{ghost.visible=shot&&!reduced;if(!ghost.visible)return;ghost.position.copy(points[i+1]);ghost.geometry=style==='frost'?shardGeometry:style==='cosmic'?starGeometry:ghostGeometry;ghost.scale.setScalar((1-i/15)*(1+power*.65));if(style==='frost'){ghost.scale.set(.45*(1-i/15),1.5*(1-i/15),.45*(1-i/15));ghost.rotation.set(clock*2+i,i*.7,clock+i);}else if(style==='cosmic'){const radius=(1-i/15)*.18,angle=clock*8+i*.9;ghost.position.x+=Math.cos(angle)*radius;ghost.position.y+=Math.sin(angle)*radius;ghost.quaternion.copy(camera.quaternion);}else ghost.rotation.set(0,0,0);});
  solarRings.forEach((ring,i)=>{ring.visible=shot&&!reduced&&style==='solar';if(!ring.visible)return;ring.position.copy(points[3+i*4]);ring.quaternion.copy(camera.quaternion);ring.scale.setScalar(.15+((clock*2+i/3)%1)*.3);});
  // The splash burst: spray spheres and droplets on gravity arcs from the hit, fading and shrinking; they stop at the water line.
  // Takes the ghost and charge spheres only while the ball is neither shot nor charging (it is parked on the sand in the sea).
  if(burst.age<SPLASH_BURST_S&&!shot&&charging<0&&!reduced){
   burst.age+=dt;const t=burst.age,life=burst.drips?.6:SPLASH_BURST_S,k=Math.min(1,t/life);
   if(!burstWas){burstWas=true;ghostMaterial.color.set('#f4ffff');energyMaterial.color.set('#dffaff');}
   ghostMaterial.opacity=(1-k)*.85;energyMaterial.opacity=(1-k)*.9;
   for(let i=0;i<DROPS;i++){const o=i*4,mesh=i<ghosts.length?ghosts[i]:energy[i-ghosts.length],a=seeds[o],up=seeds[o+1],out=seeds[o+2];
    const h=up*t-4.9*t*t,r=out*t;mesh.visible=h>-.05&&k<1;if(!mesh.visible)continue;
    mesh.position.set(burst.x+Math.cos(a)*r,burst.y+(burst.drips?1.2:0)+h,burst.z+Math.sin(a)*r);mesh.scale.setScalar(seeds[o+3]*(1-k*.6));mesh.geometry=ghostGeometry;mesh.rotation.set(0,0,0);}
   if(k>=1)burst.age=SPLASH_BURST_S;
  }else if(burstWas){burstWas=false;burst.age=SPLASH_BURST_S;lastColor='';for(const mesh of ghosts)mesh.visible=false;for(const mesh of energy)mesh.visible=false;}
  if(trail.visible){points.forEach((point,i)=>point.toArray(positions,i*3));geometry.attributes.position.needsUpdate=true;}
  for(const r of swimRipples){if(r.age>=r.life){if(r.mesh.visible)r.mesh.visible=false;continue;}r.age+=dt;const t=r.age/r.life;r.mesh.visible=t<1;if(t>=1)continue;
   const grow=r.still?1:.12+.88*(1-(1-t)*(1-t)),wob=reduced||r.still?0:.07,wx=1+wob*Math.sin(r.age*5+r.seed),wz=1+wob*Math.cos(r.age*4.3+r.seed*1.7);
   r.mesh.rotation.set(-Math.PI/2,0,r.angle+(wob?.12*Math.sin(r.age*2.6+r.seed):0));r.mesh.scale.set(r.maxR*grow*wx*r.stretch,r.maxR*grow*wz,1);
   r.material.opacity=r.op*(r.still?Math.min(1,t*6,(1-t)*3):Math.min(1,t*12)*(1-t)*(1-t));}
  for(const ring of rings){ring.age+=dt;const t=ring.age/.38;ring.mesh.visible=t>=0&&t<1;if(t>=0&&t<1){if(ring.flat)ring.mesh.rotation.set(-Math.PI/2,0,0);else ring.mesh.quaternion.copy(camera.quaternion);ring.mesh.scale.setScalar((reduced?.4:.15+t*(.95+ring.power*2.2))*ring.size);ring.material.opacity=(1-t)*.75;}}
 },dispose(){sparkles.dispose();solarMaterial.dispose();shardGeometry.dispose();starGeometry.dispose();energyMaterial.dispose();chargeMaterial.dispose();ghostGeometry.dispose();ghostMaterial.dispose();geometry.dispose();material.dispose();ringGeometry.dispose();rings.forEach(r=>r.material.dispose());swimRipples.forEach(r=>r.material.dispose());rippleGeometry.dispose();root.removeFromParent();}};
}
