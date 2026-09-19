import * as T from 'three';
import type {CoinSpot} from '../town/coinQuest';
/** Short-lived, fixed pools: no work or draw calls after the celebration settles. */
export function createCoinEffects(ballGeometry:T.BufferGeometry){
 let activeFor=0;
 const root=new T.Group();root.name='ball-hunt-effects';
 const geometry=new T.BoxGeometry(1,1,1),material=new T.MeshBasicMaterial();
 const fragments=new T.InstancedMesh(geometry,material,36);fragments.name='broken-box-pieces';fragments.instanceMatrix.setUsage(T.DynamicDrawUsage);fragments.frustumCulled=false;fragments.count=0;fragments.visible=false;root.add(fragments);
 const sparkleGeometry=new T.IcosahedronGeometry(1,0),sparkleMaterial=new T.MeshBasicMaterial({color:'#ffffff',toneMapped:false});
 const sparkles=new T.InstancedMesh(sparkleGeometry,sparkleMaterial,72);sparkles.name='collected-ball-particles';sparkles.instanceMatrix.setUsage(T.DynamicDrawUsage);sparkles.frustumCulled=false;sparkles.count=0;sparkles.visible=false;root.add(sparkles);
 const sparkleColors=[new T.Color('#ffe18a'),new T.Color('#fffaf0'),new T.Color('#8fe6bb')];
 const sparks=Array.from({length:72},()=>({x:0,y:0,z:0,vx:0,vy:0,vz:0,age:2,life:0,size:0,color:0}));let sparkCursor=0,sparksActive=false;
 const colors=[new T.Color('#c19861'),new T.Color('#e9c75f'),new T.Color('#477c6a')];
 const pieces=Array.from({length:36},()=>({age:2,life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,rx:0,ry:0,sx:.5,sy:.3,sz:.1,color:0}));let cursor=0;
 const pixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),a=Math.exp(-Math.pow((r-.65)/.13,2))*Math.max(0,1-r);const i=(y*64+x)*4;pixels[i]=255;pixels[i+1]=218;pixels[i+2]=110;pixels[i+3]=Math.round(255*a);}
 const texture=new T.DataTexture(pixels,64,64);texture.needsUpdate=true;const ringGeometry=new T.PlaneGeometry(1,1);
 const rewards=Array.from({length:3},()=>{const mat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false});const ball=new T.Mesh(ballGeometry,mat);ball.name='collected-ball-celebration';const glowMat=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});const glow=new T.Mesh(ringGeometry,glowMat);glow.rotation.x=-Math.PI/2;ball.visible=glow.visible=false;root.add(ball,glow);return{ball,mat,glow,glowMat,age:2,x:0,y:0,z:0};});let rewardIndex=0;const dummy=new T.Object3D();
 function breakBox(s:CoinSpot,reduced:boolean){if(reduced)return;activeFor=Math.max(activeFor,1.1);const wall=!!s.wall,w=wall?3.75:1.5,h=wall?1.25:.9,depth=wall?.4:1.2;
  for(let i=0;i<12;i++){const p=pieces[cursor++%pieces.length],face=Math.floor(i/3),a=face*Math.PI/2,u=(i%3-1)/3;p.age=0;p.life=1.1;const east=s.wall?.facing==='east',localX=Math.sin(a)*w*.42+Math.cos(a)*u*w,localZ=Math.cos(a)*depth*.42-Math.sin(a)*u*depth;p.x=(s.wall?.x??s.x)+(east?localZ:localX);p.z=(s.wall?.z??s.z)+(east?-localX:localZ);p.y=s.y+(s.wall?.y??.45)+(i%3-1)*h*.18;p.vx=Math.sin(a)*(2.2+i%3*.5);p.vz=Math.cos(a)*(2.2+i%3*.5);p.vy=2.7+i%3*.45;p.rx=0;p.ry=a;p.sx=w*.3;p.sy=h*.4;p.sz=.12;p.color=i%4===0?1:0;}
 }
 function collect(s:CoinSpot){
  activeFor=1.6;
  sparksActive=true;
  for(let i=0;i<24;i++){const spark=sparks[sparkCursor++%sparks.length],angle=i*2.399,radius=.18+(i%3)*.09,speed=1.4+(i%4)*.35;spark.x=s.x+Math.cos(angle)*radius;spark.y=s.y+1.25+(i%3)*.1;spark.z=s.z+Math.sin(angle)*radius;spark.vx=Math.cos(angle)*speed;spark.vy=2.6+(i%5)*.5;spark.vz=Math.sin(angle)*speed;spark.age=-i*.004;spark.life=1.05+(i%3)*.12;spark.size=.075+(i%3)*.022;spark.color=i%3;}
  const p=rewards[rewardIndex++%rewards.length];p.age=0;p.x=s.x;p.y=s.y+1.25;p.z=s.z;p.ball.position.set(p.x,p.y,p.z);p.glow.position.set(p.x,s.y+.18,p.z);}
 function update(dt:number,reduced:boolean){if(activeFor<=0)return;activeFor=Math.max(0,activeFor-dt);let count=0;
  for(const p of pieces){p.age+=dt;if(p.age>=p.life||reduced)continue;p.vy-=dt*8;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rx+=dt*4;p.ry+=dt*3;const shrink=1-T.MathUtils.smoothstep(p.age,.7,p.life);dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,0);dummy.scale.set(p.sx*shrink,p.sy*shrink,p.sz*shrink);dummy.updateMatrix();fragments.setMatrixAt(count,dummy.matrix);fragments.setColorAt(count++,colors[p.color]);}
  fragments.count=count;fragments.visible=count>0;if(count){fragments.instanceMatrix.needsUpdate=true;if(fragments.instanceColor)fragments.instanceColor.needsUpdate=true;}
  if(sparksActive){let visible=0,pending=false;
   for(const spark of sparks){spark.age+=dt;if(reduced){spark.life=0;continue;}if(spark.age>=spark.life)continue;pending=true;if(spark.age<0)continue;spark.vy-=dt*3;spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.z+=spark.vz*dt;const size=spark.size*(1-T.MathUtils.smoothstep(spark.age/spark.life,.35,1));dummy.position.set(spark.x,spark.y,spark.z);dummy.rotation.set(spark.age*4,spark.age*3,0);dummy.scale.set(size,size*1.5,size);dummy.updateMatrix();sparkles.setMatrixAt(visible,dummy.matrix);sparkles.setColorAt(visible++,sparkleColors[spark.color]);}
   sparkles.count=visible;sparkles.visible=visible>0;sparksActive=pending;if(visible){sparkles.instanceMatrix.needsUpdate=true;if(sparkles.instanceColor)sparkles.instanceColor.needsUpdate=true;}
  }
  for(const p of rewards){p.age+=dt;const alive=p.age<1.6;p.ball.visible=p.glow.visible=alive;if(!alive)continue;const t=p.age/1.6,fade=1-T.MathUtils.smoothstep(t,.55,1),pop=reduced?1.5:1+1.8*Math.sin(Math.min(1,t/.32)*Math.PI/2);p.ball.position.y=p.y+(reduced?0:t*2.6);p.ball.scale.setScalar(pop);p.ball.rotation.y=reduced?0:t*Math.PI*2;p.mat.opacity=fade;p.glow.scale.setScalar(reduced?3:1+t*6);p.glowMat.opacity=fade;}
 }
 return{root,breakBox,collect,update,get settled(){return activeFor<=0;},dispose(){root.removeFromParent();geometry.dispose();material.dispose();fragments.dispose();sparkleGeometry.dispose();sparkleMaterial.dispose();sparkles.dispose();ringGeometry.dispose();texture.dispose();for(const p of rewards){p.mat.dispose();p.glowMat.dispose();}}};
}
