import * as T from 'three';

/** A small, once-painted tile animates on the existing ocean mesh. */
export function createWaterRipples() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#edf5f2';ctx.fillRect(0,0,256,256);
  ctx.lineCap='round';
  for(let i=0;i<22;i++){
    const x=(i*97)%256,y=(i*61)%256,length=18+(i*13)%48;
    // Wrap each stroke across tile boundaries for a seamless repeating surface.
    for(const ox of [-256,0,256])for(const oy of [-256,0,256]){
      const gradient=ctx.createLinearGradient(x+ox,y+oy,x+ox+length,y+oy);
      gradient.addColorStop(0,'rgba(255,255,255,0)');
      gradient.addColorStop(.35,'rgba(255,255,255,.85)');
      gradient.addColorStop(.7,'rgba(255,255,255,.6)');
      gradient.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=gradient;ctx.lineWidth=1.4+(i%3)*.4;ctx.beginPath();
      ctx.moveTo(x+ox,y+oy);
      ctx.bezierCurveTo(x+ox+length*.3,y+oy-3,x+ox+length*.65,y+oy+4,x+ox+length,y+oy);
      ctx.stroke();
    }
  }
  const texture=new T.CanvasTexture(canvas);texture.name='ocean-ripple-tile';
  texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.repeat.set(44,44);
  return {texture,update(dt:number,reduced:boolean){
    if(reduced||dt<=0)return;
    const step=Math.min(dt,.05);
    texture.offset.x=(texture.offset.x+step*.014)%1;
    texture.offset.y=(texture.offset.y+step*.006)%1;
  }};
}
