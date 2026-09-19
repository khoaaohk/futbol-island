import * as T from 'three';

/** Fit the fixed island view, including ground below rooftops and tall buildings. */
export function fitIslandShadows(light:T.DirectionalLight,view:T.PerspectiveCamera,elevation=0){
 const reference=new T.PerspectiveCamera(view.fov,view.aspect,.1,500);
 reference.position.set(18,23+elevation,30);reference.lookAt(2,elevation,-3);reference.updateMatrixWorld();
 const shadowView=new T.OrthographicCamera();shadowView.position.set(-288,252,198);shadowView.lookAt(0,0,0);shadowView.updateMatrixWorld();
 const ray=new T.Vector3(),point=new T.Vector3();
 let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,near=Infinity,far=-Infinity;
 for(const x of [-1,1])for(const y of [-1,1]){
  ray.set(x,y,.5).unproject(reference).sub(reference.position).normalize();
  const distance=(-8-reference.position.y)/ray.y;
  const ground=reference.position.clone().addScaledVector(ray,distance);
  for(const height of [-8,24]){
   point.set(ground.x,height,ground.z).applyMatrix4(shadowView.matrixWorldInverse);
   left=Math.min(left,point.x);right=Math.max(right,point.x);bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);near=Math.min(near,-point.z);far=Math.max(far,-point.z);
  }
 }
 const camera=light.shadow.camera;
 Object.assign(camera,{left:Math.floor(left-8),right:Math.ceil(right+8),bottom:Math.floor(bottom-8),top:Math.ceil(top+8),near:Math.max(.1,near-32),far:far+32});
 camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
}
