import * as T from 'three';

/**
 * Pickup glint (owner Nov 27 2026, shots 210 / 211: "these white things are floating in the air and on the track"). The beach finds'
 * marker used to be a white octahedron stretched 1.5x and hung 0.75 m over the find: from the play camera a flat white card in the
 * air. Now ONE instanced draw (same as before) of two quads an instance:
 *  - a small camera-facing four-point glint (soft core + thin rays, additive) just over the find, bobbing gently and twinkling;
 *  - a faint warm contact glow lying on the sand under it, so the marker reads as belonging to the thing on the ground.
 * Per instance: the matrix = the find's ground point (translation only) and `aGlint` = (lift above the ground in m, twinkle 0..1).
 * Cost: 4 triangles an instance (was 8), ≤ 12 instances, a few ALU a pixel on ~20x20 px quads; no texture, no light. Reduced motion:
 * the caller passes a still lift and twinkle 1.
 */
export const GLINT_SIZE=.13,GLOW_RADIUS=.5,GLINT_LIFT=.34;
export function createPickupGlints(max:number,name='pickup-glints'){
 const g=new T.BufferGeometry();
 const pos=[-1,-1,0,1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0,-1,1,0],uv=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1],kind=[0,0,0,0,1,1,1,1];
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('aKind',new T.Float32BufferAttribute(kind,1));
 // the ground quad winds up-facing in world space (x, z from position.xy); the glint faces the camera
 g.setIndex([0,1,2,0,2,3,4,6,5,4,7,6]);
 const glint=new T.InstancedBufferAttribute(new Float32Array(max*2),2);glint.setUsage(T.DynamicDrawUsage);g.setAttribute('aGlint',glint);
 g.boundingSphere=new T.Sphere(new T.Vector3(),1e5);
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
  uniforms:{uSize:{value:GLINT_SIZE},uGlow:{value:GLOW_RADIUS}},
  vertexShader:`attribute float aKind;attribute vec2 aGlint;uniform float uSize,uGlow;varying vec2 vP;varying float vKind,vTw;
void main(){vec4 c=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);vP=uv*2.-1.;vKind=aKind;vTw=aGlint.y;
 if(aKind<.5){vec4 mv=viewMatrix*vec4(c.xyz+vec3(0.,aGlint.x,0.),1.);mv.xy+=position.xy*uSize*(.75+.45*aGlint.y);gl_Position=projectionMatrix*mv;}
 else gl_Position=projectionMatrix*viewMatrix*vec4(c.x+position.x*uGlow,c.y+.035,c.z+position.y*uGlow,1.);}`,
  fragmentShader:`varying vec2 vP;varying float vKind,vTw;
void main(){float d=length(vP);vec3 col;
 if(vKind<.5){float core=exp(-d*d*16.),rx=max(0.,1.-abs(vP.y)*10.)*(1.-abs(vP.x)),ry=max(0.,1.-abs(vP.x)*10.)*(1.-abs(vP.y));
  col=vec3(1.,.95,.78)*(core*1.1+(rx+ry)*(.35+.6*vTw));}
 else col=vec3(1.,.86,.55)*exp(-d*d*4.5)*(1.-smoothstep(.75,1.,d))*(.16+.1*vTw);
 gl_FragColor=vec4(col,1.);}`});
 mat.name='pickup-glint';
 const mesh=new T.InstancedMesh(g,mat,max);mesh.name=name;mesh.frustumCulled=false;mesh.count=0;mesh.renderOrder=2;
 const M=new T.Matrix4();
 /** Place instance i over the ground point (x, y, z): `lift` m up (bob included), `tw` twinkle 0..1. */
 const set=(i:number,x:number,y:number,z:number,lift:number,tw:number)=>{M.makeTranslation(x,y,z);mesh.setMatrixAt(i,M);glint.setXY(i,lift,tw);};
 const commit=(n:number)=>{mesh.count=n;mesh.instanceMatrix.needsUpdate=true;glint.needsUpdate=true;};
 return {mesh,set,commit,dispose(){g.dispose();mat.dispose();}};
}
