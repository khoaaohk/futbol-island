import * as T from 'three';
type Tree={kind:string;x:number;z:number;w:number;d:number;canopyHeight?:number;visualW?:number;visualD?:number;baseY?:number};
/** A fixed pool: palms shed narrow fronds; other trees shed small fluttering leaves. */
export function createTreeDebris(scene:T.Scene,assets:Tree[],floor:(x:number,z:number)=>number){
 const trees=assets.filter(a=>a.kind==='tree'||a.kind==='palm'||a.kind==='small-tree'||a.kind==='planter'),cooldowns=new Map<Tree,number>();
 const root=new T.Group();root.name='tree-kick-debris';scene.add(root);
 const geometry=new T.PlaneGeometry(1,1),materials=[0x86a85c,0xb4ba66,0x987344,0x5e9559].map(color=>new T.MeshBasicMaterial({color,side:T.DoubleSide}));
 const particles=Array.from({length:48},()=>{const mesh=new T.Mesh(geometry,materials[0]);mesh.visible=false;root.add(mesh);return {mesh,age:9,life:0,vx:0,vz:0,vy:0,spin:0,phase:0,sx:0,sy:0,palm:false};});
 let clock=0,next=0;const stats={bursts:0,palmBursts:0,treeBursts:0,active:0};
 function hit(x:number,y:number,z:number,speed:number,reduced:boolean){
  if(speed<1.2)return;
  const tree=trees.find(t=>{const base=t.baseY??0,top=t.canopyHeight??(t.kind==='palm'?6:t.kind==='planter'?1.95:4.4),canopy=y>=top-(t.kind==='palm'?1.4:t.kind==='tree'?3:1.6);return y>=base&&y<=top+.25&&Math.abs(x-t.x)<=(canopy?(t.visualW??t.w)/2:t.w/2)+.3&&Math.abs(z-t.z)<=(canopy?(t.visualD??t.d)/2:t.d/2)+.3;});
  if(!tree||clock<(cooldowns.get(tree)??-1))return;cooldowns.set(tree,clock+.3);
  const palm=tree.kind==='palm',height=tree.canopyHeight??(palm?6:tree.kind==='planter'?1.95:4.4);stats.bursts++;if(palm)stats.palmBursts++;else stats.treeBursts++;
  for(let i=0;i<(reduced?4:palm?9:12);i++){
   const p=particles[next++%particles.length],angle=i*2.399+clock,r=.25+(i%4)*.18;
   p.age=0;p.life=palm?2.5:1.9;p.palm=palm;p.phase=angle;p.vx=Math.cos(angle)*(reduced?.18:.4);p.vz=Math.sin(angle)*(reduced?.18:.4);p.vy=reduced?-.25:-1.15;p.spin=reduced?0:(i%2?1:-1)*(palm?1.2:3);
   p.sx=palm?.09:.16;p.sy=palm?.5:.23;
   p.mesh.material=materials[palm?3:i%2];p.mesh.position.set(tree.x+Math.cos(angle)*r+(palm?height*.035:0),height-.5+(i%3)*.13,tree.z+Math.sin(angle)*r);p.mesh.rotation.set(.7,angle,.5);p.mesh.scale.set(p.sx,p.sy,1);p.mesh.visible=true;
  }
 }
 function update(dt:number,enabled:boolean,reduced:boolean){
  clock+=dt;root.visible=enabled;stats.active=0;
  for(const p of particles){if(!p.mesh.visible)continue;p.age+=dt;
   if(p.age>=p.life){p.mesh.visible=false;continue;}
   p.vy-=dt*(p.palm?1.35:1.8);p.mesh.position.x+=(p.vx+(reduced?0:Math.sin(p.age*5+p.phase)*.3))*dt;p.mesh.position.z+=p.vz*dt;p.mesh.position.y=Math.max(floor(p.mesh.position.x,p.mesh.position.z)+.025,p.mesh.position.y+p.vy*dt);p.mesh.rotation.z+=p.spin*dt;p.mesh.rotation.y+=p.spin*.4*dt;
   const fade=Math.min(1,(p.life-p.age)/.5);p.mesh.scale.set(p.sx*fade,p.sy*fade,1);stats.active++;
  }
 }
 return {root,stats,hit,update,dispose(){root.removeFromParent();geometry.dispose();materials.forEach(m=>m.dispose());cooldowns.clear();}};
}
