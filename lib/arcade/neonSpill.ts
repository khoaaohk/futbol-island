import * as T from 'three';
/** Cached-at-construction soft light spill. One flat draw, no extra scene lights. */
export function createNeonSpill(width:number,length:number,y:number,color='#55ffeb'){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!;
 ctx.shadowColor='#ffffff';ctx.shadowBlur=12;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(17,17,94,94,9);ctx.fill();ctx.shadowBlur=0;ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.roundRect(20,20,88,88,8);ctx.fill();
 const map=new T.CanvasTexture(canvas);const material=new T.MeshBasicMaterial({map,color,transparent:true,opacity:.38,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});material.userData.arcadeSpill=true;
 const mesh=new T.Mesh(new T.PlaneGeometry(width*1.36,length*1.36),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.name='neon-court-spill';return mesh;
}
