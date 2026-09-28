import * as T from 'three';
import {createNeonSpill} from './neonSpill';
/** One instanced light grid + a transparent glass skin; updated by the game's existing loop. */
export function createGlassFloor(scene:T.Object3D,width:number,length:number,columns=8,rows=14,y=.018){
 const spill=createNeonSpill(width,length,y-.003);
 const root=new T.Group(),tile=new T.Object3D(),base=new T.Color('#10243b'),cyan=new T.Color('#42ffef'),pink=new T.Color('#ff69cd'),gold=new T.Color('#fff17d'),color=new T.Color(),energy=new Float32Array(columns*rows);
 const mesh=new T.InstancedMesh(new T.PlaneGeometry(width/columns-.045,length/rows-.045),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.72,depthWrite:false,toneMapped:false}),columns*rows);mesh.name='reactive-glass-tiles';tile.rotation.x=-Math.PI/2;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){tile.position.set((col-(columns-1)/2)*width/columns,y,(row-(rows-1)/2)*length/rows);tile.updateMatrix();mesh.setMatrixAt(row*columns+col,tile.matrix);mesh.setColorAt(row*columns+col,base);}
 mesh.instanceColor!.setUsage(T.DynamicDrawUsage);root.add(mesh);
 const glass=new T.Mesh(new T.PlaneGeometry(width,length),new T.MeshStandardMaterial({color:'#c5d7ff',transparent:true,opacity:.07,roughness:.16,metalness:.25,depthWrite:false}));glass.name='glass-surface';glass.rotation.x=-Math.PI/2;glass.position.y=y+.001;root.add(glass,spill);scene.add(root);
 function update(dt:number,x:number,z:number,power=0,impact=0){spill.material.opacity=.26+power*.18+impact*.15;for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const index=row*columns+col,tx=(col-(columns-1)/2)*width/columns,tz=(row-(rows-1)/2)*length/rows,d=Math.hypot(tx+root.position.x-x,tz+root.position.z-z),radius=Math.max(width/columns,length/rows)*1.8;
 const target=Math.max(0,1-d/(radius+power*3+impact*4))*(.3+power*.35+impact*.25);energy[index]+=(target-energy[index])*(dt>0?1-Math.exp(-dt*10):1);color.copy(base).lerp(power>.15?gold:impact>.1?pink:cyan,Math.min(.8,energy[index]));mesh.setColorAt(index,color);}mesh.instanceColor!.needsUpdate=true;}
 function dispose(){spill.geometry.dispose();spill.material.map?.dispose();spill.material.dispose();mesh.geometry.dispose();mesh.material.dispose();glass.geometry.dispose();glass.material.dispose();root.removeFromParent();}
 return{root,update,dispose};
}
