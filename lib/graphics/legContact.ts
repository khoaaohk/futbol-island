import * as T from 'three';

/** Two-bone solve with an explicit knee pole. Scratch storage belongs to the rig.
 * No iterations, allocations or world-matrix traversal in the pose loop.
 */
export function createLegContactSolver(){
 const down=new T.Vector3(0,-1,0),axis=new T.Vector3(),bend=new T.Vector3(),upper=new T.Vector3(),lower=new T.Vector3(),side=new T.Vector3(),normal=new T.Vector3();
 const basis=new T.Matrix4(),kneeBasis=new T.Matrix4(),upperQ=new T.Quaternion(),lowerQ=new T.Quaternion();
 return (hip:T.Object3D,knee:T.Object3D,target:T.Vector3,pole:T.Vector3,thigh:number,shin:number)=>{
  const distance=Math.max(.001,Math.min(target.length(),thigh+shin-.002));axis.copy(target).normalize();
  bend.copy(pole).addScaledVector(axis,-pole.dot(axis));
  if(bend.lengthSq()<1e-8)bend.set(0,0,1).addScaledVector(axis,-axis.z);
  bend.normalize();
  const along=(thigh*thigh+distance*distance-shin*shin)/(2*distance),height=Math.sqrt(Math.max(0,thigh*thigh-along*along));
  upper.copy(axis).multiplyScalar(along).addScaledVector(bend,height).normalize();
  lower.copy(axis).multiplyScalar(distance).addScaledVector(upper,-thigh).normalize();
  side.crossVectors(bend,axis).normalize();
  normal.crossVectors(side,upper).negate().normalize();
  basis.makeBasis(side,down.copy(upper).negate(),normal);upperQ.setFromRotationMatrix(basis);
  normal.crossVectors(side,lower).negate().normalize();
  kneeBasis.makeBasis(side,down.copy(lower).negate(),normal);lowerQ.setFromRotationMatrix(kneeBasis);
  hip.quaternion.copy(upperQ);knee.quaternion.copy(upperQ.invert()).multiply(lowerQ);
 };
}
