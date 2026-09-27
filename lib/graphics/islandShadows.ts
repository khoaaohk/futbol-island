import * as T from 'three';

/** Fit the fixed island view, including ground below rooftops and tall buildings.
 * Quality pass (Sep 26 2026): in light space a caster and its shadow share x/y, so only the visible RECEIVERS need covering: for each
 * corner ray, where it meets the ground (y = 0) and roof height (≤ 20 m, when the camera is above it), with receivers 0–24 m tall
 * there, plus a small filter margin. The old fit used a y = −8 plane and ±8 m margins: about 2× the area on phones, i.e. softer
 * shadows at the same map size. The normal bias follows the texel so acne cannot come back (pass 3/4 roof stripes). */
export function fitIslandShadows(light:T.DirectionalLight,view:T.PerspectiveCamera,elevation=0){
 const reference=new T.PerspectiveCamera(view.fov,view.aspect,.1,500);
 reference.position.set(18,23+elevation,30);reference.lookAt(2,elevation,-3);reference.updateMatrixWorld();
 const shadowView=new T.OrthographicCamera();shadowView.position.set(-288,252,198);shadowView.lookAt(0,0,0);shadowView.updateMatrixWorld();
 const ray=new T.Vector3(),point=new T.Vector3(),hit=new T.Vector3();
 let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,near=Infinity,far=-Infinity;
 const planes=[0,Math.min(20,reference.position.y-2)];
 for(const x of [-1,1])for(const y of [-1,1]){
  ray.set(x,y,.5).unproject(reference).sub(reference.position).normalize();
  for(const plane of planes){
   if(ray.y>=0&&plane<=reference.position.y)continue;
   const distance=(plane-reference.position.y)/ray.y;if(!(distance>0))continue;
   hit.copy(reference.position).addScaledVector(ray,distance);
   for(const height of [0,24]){
    point.set(hit.x,height,hit.z).applyMatrix4(shadowView.matrixWorldInverse);
    left=Math.min(left,point.x);right=Math.max(right,point.x);bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);near=Math.min(near,-point.z);far=Math.max(far,-point.z);
   }
  }
 }
 const camera=light.shadow.camera,margin=4;
 Object.assign(camera,{left:Math.floor(left-margin),right:Math.ceil(right+margin),bottom:Math.floor(bottom-margin),top:Math.ceil(top+margin),near:Math.max(.1,near-40),far:far+32});
 camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
 // ≈ 0.92 texel of normal offset: the tuned .12 at 2048² over the old 268 m frustum.
 light.shadow.normalBias=.92*Math.max(camera.right-camera.left,camera.top-camera.bottom)/Math.max(1,light.shadow.mapSize.x);
}

/** Quality pass: the isolated watch view looks at one pitch from a high, angled camera, so the view-based fit spanned ~680 × 190 m of
 * light space (≈ 67 cm per texel under the players). Fit the shadow camera to the watched pitch instead (receivers only: the pitch
 * box ± halfW/halfD around the sun target, yMin–yMax tall; casters above share their light-space x/y and are kept by a deep near). */
export function fitShadowsToBox(light:T.DirectionalLight,halfW:number,halfD:number,yMin:number,yMax:number){
 const shadowView=new T.OrthographicCamera();shadowView.position.set(-288,252,198);shadowView.lookAt(0,0,0);shadowView.updateMatrixWorld();
 const point=new T.Vector3();let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,near=Infinity,far=-Infinity;
 for(const x of [-halfW,halfW])for(const z of [-halfD,halfD])for(const y of [yMin,yMax]){point.set(x,y,z).applyMatrix4(shadowView.matrixWorldInverse);
  left=Math.min(left,point.x);right=Math.max(right,point.x);bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);near=Math.min(near,-point.z);far=Math.max(far,-point.z);}
 const camera=light.shadow.camera,margin=2;
 Object.assign(camera,{left:Math.floor(left-margin),right:Math.ceil(right+margin),bottom:Math.floor(bottom-margin),top:Math.ceil(top+margin),near:Math.max(.1,near-60),far:far+32});
 camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
 light.shadow.normalBias=.92*Math.max(camera.right-camera.left,camera.top-camera.bottom)/Math.max(1,light.shadow.mapSize.x);
}
