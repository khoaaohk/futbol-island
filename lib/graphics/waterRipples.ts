import * as T from 'three';

/** A small, once-painted tile animates on the existing ocean mesh. */
export function createWaterRipples() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#eef5ff';ctx.fillRect(0,0,256,256);
  ctx.lineCap='round';
  // Scattered at seeded random spots with a slight tilt each (beach waves, Oct 12 2026): the old x = 97i, y = 61i lattice put
  // the strokes on diagonal rows that merged into long straight streaks across the sea from the island camera.
  let seed=20261012;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<24;i++){
    const x=rand()*256,y=rand()*256,length=16+rand()*44,tilt=(rand()-.5)*.5,bend=(rand()-.5)*8,dx=Math.cos(tilt)*length,dy=Math.sin(tilt)*length;
    // Wrap each stroke across tile boundaries for a seamless repeating surface.
    for(const ox of [-256,0,256])for(const oy of [-256,0,256]){
      const gradient=ctx.createLinearGradient(x+ox,y+oy,x+ox+dx,y+oy+dy);
      gradient.addColorStop(0,'rgba(255,255,255,0)');
      gradient.addColorStop(.35,'rgba(255,255,255,.85)');
      gradient.addColorStop(.7,'rgba(255,255,255,.6)');
      gradient.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=gradient;ctx.lineWidth=1.4+(i%3)*.4;ctx.beginPath();
      ctx.moveTo(x+ox,y+oy);
      ctx.bezierCurveTo(x+ox+dx*.3,y+oy+dy*.3-3+bend*.4,x+ox+dx*.65,y+oy+dy*.65+4-bend*.4,x+ox+dx,y+oy+dy);
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
