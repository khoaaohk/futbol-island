import * as T from 'three';
/** Soft radial textures avoid a hard outline over the landing surface. */
export function createLandingMarker(){
 const root=new T.Group();root.name='jetpack-landing-marker';root.visible=false;
 const texture=(outline:boolean)=>{const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2)),alpha=outline?Math.exp(-(((r-.67)/.14)**2))*Math.max(0,Math.min(1,(1-r)*8)):Math.max(0,1-r)**2;const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(alpha*255);}const t=new T.DataTexture(data,size,size);t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;};
 const edgeTexture=texture(true),fillTexture=texture(false);
 const edge=new T.MeshBasicMaterial({color:'#ff3b36',map:edgeTexture,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const fill=new T.MeshBasicMaterial({color:'#ff3b36',map:fillTexture,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
 const ring=new T.Mesh(new T.PlaneGeometry(1.4,1.4),edge),disc=new T.Mesh(new T.PlaneGeometry(1.4,1.4),fill);root.add(disc,ring);
 const normal=new T.Vector3(),axis=new T.Vector3(0,0,1);let fade=0,lastTime:number|undefined,strength=1;
 return {root,update(target:{x:number;z:number}|null,height:number,surface:(x:number,z:number)=>number,visible:boolean,time=0,reduced=false){
  const dt=lastTime===undefined?1/60:Math.min(.1,Math.max(0,time-lastTime));lastTime=time;const show=visible&&target!==null;fade=reduced?(show?1:0):T.MathUtils.lerp(fade,show?1:0,1-Math.exp(-dt*8));root.visible=fade>.005;
  if(!show&&!root.visible)return;
  if(show&&target){const floor=surface(target.x,target.z),dx=surface(target.x+.1,target.z)-surface(target.x-.1,target.z),dz=surface(target.x,target.z+.1)-surface(target.x,target.z-.1);normal.set(Math.abs(dx)<.4?-dx/.2:0,1,Math.abs(dz)<.4?-dz/.2:0).normalize();root.quaternion.setFromUnitVectors(axis,normal);root.position.set(target.x,floor+.16,target.z);strength=T.MathUtils.clamp((height-floor)/2,.45,1);}
  const pulse=reduced?.5:(Math.sin(time*Math.PI*1.6)+1)/2;root.scale.setScalar(reduced?1:.9+pulse*.18);edge.opacity=(.08+pulse*.24)*strength*fade;fill.opacity=(.06+pulse*.08)*strength*fade;
 },dispose(){root.removeFromParent();ring.geometry.dispose();disc.geometry.dispose();edge.dispose();fill.dispose();edgeTexture.dispose();fillTexture.dispose();}};
}
