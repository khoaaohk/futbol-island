import * as T from 'three';
/** One shared, static panel map for every live ball. Broad panels remain readable at match distance. */
export function createMatchBallTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
 const c=canvas.getContext('2d')!;c.fillStyle='#fff4db';c.fillRect(0,0,256,128);
 c.strokeStyle='#a29d87';c.lineWidth=1.5;
 for(let row=-1;row<4;row++)for(let col=-1;col<5;col++){
  const x=col*64+(row%2)*32,y=20+row*44;
  c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5,px=x+Math.cos(a)*16,py=y+Math.sin(a)*14;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();
  c.fillStyle=row===1&&col===2?'#b45b32':'#203b3a';c.fill();c.stroke();
 }
 const map=new T.CanvasTexture(canvas);map.name='shared-live-football-panels';map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;
 return map;
}
