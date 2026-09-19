import * as T from 'three';
import {BALL_COLORS,type CharacterCustomization} from '../town/customization';
type BallStyle=CharacterCustomization['ball'];
/** Tiny, locally drawn skins shared by the store and equipped ball. Textures are
 * created only when selected, reused for that renderer, and disposed with it. */
export function createBallAppearance(material:T.MeshStandardMaterial){
 const textures=new Map<BallStyle,T.CanvasTexture>();
 function texture(style:BallStyle){
  const saved=textures.get(style);if(saved)return saved;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const c=canvas.getContext('2d')!;
  c.fillStyle=BALL_COLORS[style];c.fillRect(0,0,128,64);
  if(style==='frost'){
   c.strokeStyle='#649fc6';c.lineWidth=2;c.lineJoin='round';
   for(let row=-1;row<4;row++)for(let col=-1;col<5;col++){
    const x=col*32+(row%2)*16,y=row*24;c.beginPath();c.moveTo(x,y+6);c.lineTo(x+16,y);c.lineTo(x+32,y+6);c.lineTo(x+32,y+18);c.lineTo(x+16,y+24);c.lineTo(x,y+18);c.closePath();c.stroke();
    c.strokeStyle='#ecfaff';c.lineWidth=1;c.beginPath();c.moveTo(x+8,y+10);c.lineTo(x+16,y+7);c.lineTo(x+23,y+10);c.stroke();c.strokeStyle='#649fc6';c.lineWidth=2;
   }
  }else if(style==='solar'){
   c.fillStyle='#e18d29';c.fillRect(0,4,128,3);c.fillRect(0,57,128,3);
   for(const x of [24,88]){
    c.strokeStyle='#a9651d';c.lineWidth=2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(x+Math.cos(a)*11,32+Math.sin(a)*11);c.lineTo(x+Math.cos(a)*17,32+Math.sin(a)*17);c.stroke();}
    c.fillStyle='#fff0a8';c.beginPath();c.arc(x,32,9,0,Math.PI*2);c.fill();c.stroke();
   }
  }else if(style==='cosmic'){
   c.fillStyle='#5b3b9b';c.fillRect(0,0,128,64);
   for(let i=0;i<22;i++){
    const x=(i*47+11)%128,y=(i*29+7)%64,r=i%4===0?3:1.4;c.fillStyle=i%3?'#ead9ff':'#bba4ff';c.beginPath();
    for(let n=0;n<8;n++){const a=n*Math.PI/4,rr=n%2?r*.25:r;n?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();
   }
   c.strokeStyle='#a889e0';c.lineWidth=1.5;c.beginPath();c.ellipse(64,32,22,8,-.35,0,Math.PI*2);c.stroke();
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.name='ball-skin-'+style;textures.set(style,map);return map;
 }
 let current:BallStyle|undefined;
 return{setStyle(style:BallStyle){
  if(style===current)return;current=style;const patterned=style==='frost'||style==='solar'||style==='cosmic';
  material.map=patterned?texture(style):null;material.color.set(patterned?'#ffffff':BALL_COLORS[style]);
  material.emissive.set(style==='neon'?'#527627':style==='frost'?'#305770':style==='solar'?'#8b5116':style==='cosmic'?'#4b287b':'#000000');
  material.emissiveIntensity=style==='cosmic'?.2:.25;material.roughness=style==='frost'?.4:.7;material.needsUpdate=true;
 },dispose(){for(const map of textures.values())map.dispose();textures.clear();material.map=null;current=undefined;}};
}
