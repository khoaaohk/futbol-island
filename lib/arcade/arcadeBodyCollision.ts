export type ArcadeBody={x:number;z:number};
export const ARCADE_BODY_SPACING=.84;
/** Resolve penetration along the contact normal, retaining tangential movement. */
export function separateArcadeBody(body:ArcadeBody,other:ArcadeBody){
 const dx=body.x-other.x,dz=body.z-other.z,d=Math.hypot(dx,dz);
 if(d>=ARCADE_BODY_SPACING)return false;
 const nx=d>.0001?dx/d:1,nz=d>.0001?dz/d:0;
 body.x=other.x+nx*ARCADE_BODY_SPACING;body.z=other.z+nz*ARCADE_BODY_SPACING;
 return true;
}
