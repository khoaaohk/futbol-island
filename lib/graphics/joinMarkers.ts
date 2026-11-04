import * as T from 'three';
// Join a live game (slice 1, Nov 4 2026): the on-pitch markers for the player who joined.
// - Compass ring at your feet in your bib colour with ONE chevron pointing at the goal you attack (who am I + which way).
// - The pass assist marker: a thin ring at the teammate a Pass reaches, and the compass shape (smaller) at the runner a
//   Forward pass would find, its chevron along his run.
// One shared material (bib colour, set once on join), two small geometries built once, ≤ 3 draw calls and only while
// joined; positions written into existing objects, no per-frame allocation. The head chevron is the existing hidden-
// player pin (lib/graphics/hiddenPlayerMarker.ts pinAt).
function compassGeometry(inner:number,outer:number,segments:number){
  const pos:number[]=[];
  for(let i=0;i<segments;i++){
    const a0=i/segments*Math.PI*2,a1=(i+1)/segments*Math.PI*2;
    const p=(r:number,a:number)=>[Math.sin(a)*r,0,Math.cos(a)*r];
    pos.push(...p(inner,a0),...p(outer,a0),...p(outer,a1),...p(inner,a0),...p(outer,a1),...p(inner,a1));
  }
  // chevron beyond the ring along +z (local "forward")
  const base=outer+.08,tip=outer+.55,half=.36,notch=outer+.3;
  pos.push(-half,0,base,0,0,tip,0,0,notch, 0,0,notch,0,0,tip,half,0,base);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeBoundingSphere();return g;
}
function ringGeometry(inner:number,outer:number,segments:number){const g=new T.RingGeometry(inner,outer,segments);g.rotateX(-Math.PI/2);return g;}
export function createJoinMarkers(scene:T.Scene){
  const material=new T.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.92,depthWrite:false,side:T.DoubleSide});
  const compassGeo=compassGeometry(.72,.9,40),ringGeo=ringGeometry(.5,.62,32);
  const make=(g:T.BufferGeometry,name:string)=>{const m=new T.Mesh(g,material);m.name=name;m.visible=false;m.renderOrder=3;m.frustumCulled=false;scene.add(m);return m;};
  const compass=make(compassGeo,'join-compass'),pass=make(ringGeo,'join-pass-target'),forward=make(compassGeo,'join-forward-target');forward.scale.setScalar(.7);
  return {
    setColour(hex:string){material.color.set(hex);},
    hide(){compass.visible=pass.visible=forward.visible=false;},
    /** Your feet: ring + chevron toward the goal (world yaw of the attack direction). */
    you(x:number,y:number,z:number,attackYaw:number){compass.visible=true;compass.position.set(x,y+.135,z);compass.rotation.y=attackYaw;},
    /** The assist's Pass target (NaN hides it). */
    passTarget(x:number,y:number,z:number,time:number,reduced:boolean){pass.visible=Number.isFinite(x);if(!pass.visible)return;pass.position.set(x,y+.14,z);pass.scale.setScalar(reduced?1:1+.08*Math.sin(time*5));},
    /** The Forward-pass runner (NaN hides it); chevron along his run toward the goal. */
    forwardTarget(x:number,y:number,z:number,yaw:number){forward.visible=Number.isFinite(x);if(!forward.visible)return;forward.position.set(x,y+.14,z);forward.rotation.y=yaw;},
    dispose(){[compass,pass,forward].forEach(m=>m.removeFromParent());compassGeo.dispose();ringGeo.dispose();material.dispose();},
  };
}
