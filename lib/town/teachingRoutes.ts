export function trimTeachingRoute(ax:number,az:number,bx:number,bz:number,startClearance:number,endClearance:number){
 const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
 if(!Number.isFinite(length)||length<=startClearance+endClearance+.15)return null;
 const ux=dx/length,uz=dz/length;
 return{ax:ax+ux*startClearance,az:az+uz*startClearance,bx:bx-ux*endClearance,bz:bz-uz*endClearance};
}

/** Consume only the travelled portion of an already ring-trimmed pass route.
 * Sampling the displayed ball keeps pause, slow motion and seeking in sync. */
export function remainingPassRoute(route:NonNullable<ReturnType<typeof trimTeachingRoute>>,ballX:number,ballZ:number,landed=false){
 const dx=route.bx-route.ax,dz=route.bz-route.az,length=Math.hypot(dx,dz);
 if(landed||length<.15)return null;
 const travelled=Math.max(0,Math.min(length,((ballX-route.ax)*dx+(ballZ-route.az)*dz)/length));
 const remaining=length-travelled;
 if(remaining<.15)return null;
 return{...route,ax:route.ax+dx/length*travelled,az:route.az+dz/length*travelled,
  opacity:Math.min(1,remaining/Math.min(1.5,length*.2))};
}
