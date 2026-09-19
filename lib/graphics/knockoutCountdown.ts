import * as T from 'three';

/** Matches the live goal badge: pink card, plum text and a feathered gold burst. */
export function createKnockoutCountdown(parent:T.Group){
 const root=new T.Group();root.name='knockout-countdown';root.visible=false;parent.add(root);
 const labels=['3','2','1','GO!'].map(text=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;
  const c=canvas.getContext('2d')!;c.fillStyle='rgba(243,166,196,.65)';c.fillRect(0,0,512,192);
  c.fillStyle='#502b40';c.font='bold 128px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,101);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
 });
 const material=new T.SpriteMaterial({map:labels[0],transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
 const badge=new T.Sprite(material);badge.name='knockout-countdown-badge';badge.renderOrder=9;root.add(badge);
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=320;
 const c=canvas.getContext('2d')!,color='255,192,69';
 const glow=c.createRadialGradient(320,160,55,320,160,285);glow.addColorStop(0,`rgba(${color},0)`);glow.addColorStop(.45,`rgba(${color},.65)`);glow.addColorStop(1,`rgba(${color},0)`);c.fillStyle=glow;c.fillRect(0,0,640,320);
 c.strokeStyle=`rgb(${color})`;c.lineWidth=5;c.lineJoin='round';c.shadowColor=`rgb(${color})`;c.shadowBlur=14;
 for(const side of [-1,1])for(const row of [-1,1]){c.beginPath();c.moveTo(320+side*190,160+row*54);c.lineTo(320+side*229,160+row*79);c.lineTo(320+side*220,160+row*50);c.lineTo(320+side*289,160+row*106);c.stroke();}
 c.strokeStyle='#fff7d9';c.lineWidth=2;c.shadowBlur=4;
 for(const side of [-1,1]){c.beginPath();c.moveTo(275,160+side*74);c.lineTo(304,160+side*96);c.lineTo(324,160+side*83);c.lineTo(365,160+side*124);c.stroke();}
 c.save();c.shadowBlur=0;c.globalCompositeOperation='destination-in';c.translate(320,160);c.scale(320,160);
 const edge=c.createRadialGradient(0,0,0,0,0,1);edge.addColorStop(0,'rgba(255,255,255,1)');edge.addColorStop(.55,'rgba(255,255,255,1)');edge.addColorStop(.78,'rgba(255,255,255,.55)');edge.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=edge;c.fillRect(-1,-1,2,2);c.restore();
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const glowMaterial=new T.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending});
 const light=new T.Sprite(glowMaterial);light.name='knockout-countdown-burst';light.renderOrder=8;root.add(light);
 return {root,update(countdown:number,gameTime:number,reduced:boolean){
  const active=countdown>0||gameTime<.8;
  if(!active){if(root.visible)root.visible=false;return;}
  root.visible=true;
  const number=Math.ceil(countdown),index=countdown>0?3-number:3;
  if(material.map!==labels[index])material.map=labels[index];
  const age=countdown>0?number-countdown:gameTime,duration=countdown>0?1:.8;
  const fade=Math.min(1,Math.max(0,(duration-age)/.16));
  const pop=reduced?1:1+(index===3?.14:.1)*Math.sin(Math.min(1,age/.35)*Math.PI);
  badge.position.set(0,7+(reduced?0:Math.min(.3,age*.3)),0);badge.scale.set(6*pop,2.25*pop,1);material.opacity=fade;
  const life=index===3?.8:.75,expand=reduced?1:1+Math.min(1,age/life)*.16;
  light.visible=age<life;light.position.copy(badge.position);light.scale.set(9.4*expand,4.7*expand,1);
  glowMaterial.opacity=reduced?.2*fade:Math.max(0,1-age/life)*Math.min(1,age/.08)*fade;
 },dispose(){labels.forEach(t=>t.dispose());texture.dispose();material.dispose();glowMaterial.dispose();root.removeFromParent();}};
}
