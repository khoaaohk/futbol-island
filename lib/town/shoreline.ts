// Shared by the rendered foundation and walking boundary.
const anchors=[[-85,-160],[-72,-228],[80,-243],[209,-218],[239,-150],[246,-30],[240,110],[242,190],[227,219],[145,224],[65,220],[40,211],[33,177],[25,155],[12,133],[-5,120],[-45,112],[-85,112],[-96,70],[-99,-40]];
export const ISLAND_SHORE: {x:number;z:number}[]=[];
for(let i=0;i<anchors.length;i++)for(let j=0;j<8;j++){
 const t=j/8,p0=anchors[(i+anchors.length-1)%anchors.length],p1=anchors[i],p2=anchors[(i+1)%anchors.length],p3=anchors[(i+2)%anchors.length];
 const at=(k:number)=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
 ISLAND_SHORE.push({x:at(0),z:at(1)});
}
export function onIsland(x:number,z:number){
 let inside=false;
 for(let i=0,j=ISLAND_SHORE.length-1;i<ISLAND_SHORE.length;j=i++){
  const a=ISLAND_SHORE[i],b=ISLAND_SHORE[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;
 }
 return inside;
}

/** Shared coastline widths keep the 3D sand and both maps in agreement. */
export const shoreSandWidth=(p:{x:number;z:number})=>p.z< -195?Math.min(36,5+(-p.z-195)*.75):p.z>110&&p.x<55?8:5;
export const SHORE_SAND=ISLAND_SHORE.map((p,i)=>{const previous=ISLAND_SHORE[(i+ISLAND_SHORE.length-1)%ISLAND_SHORE.length],next=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length],dx=next.x-previous.x,dz=next.z-previous.z,length=Math.hypot(dx,dz),width=shoreSandWidth(p);return {outer:p,inner:{x:p.x-dz/length*width,z:p.z+dx/length*width}};});
export const NORTH_BEACH_UMBRELLAS=[{x:-48,z:-218},{x:-15,z:-224},{x:22,z:-229},{x:62,z:-229},{x:105,z:-227},{x:145,z:-220},{x:178,z:-211}];
export const NORTH_BEACH_PATHS=[{x:-45,z:-185,w:3,d:52},{x:80,z:-189,w:3,d:60}];

/** Distance to the coast lets offshore landing searches skip empty ocean. */
export function distanceToShore(x:number,z:number){
 let squared=Infinity;
 for(let i=0;i<ISLAND_SHORE.length;i++){
  const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length],dx=b.x-a.x,dz=b.z-a.z;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  squared=Math.min(squared,(x-a.x-t*dx)**2+(z-a.z-t*dz)**2);
 }
 return Math.sqrt(squared);
}

/** Broad inland lawn, set back from the sand ribbon to retain a tan coastal margin. */
export const INTERIOR_GRASS_COLOR='#6e9678';
export const INTERIOR_GRASS=SHORE_SAND.map(({inner})=>({x:85+(inner.x-85)*.9,z:-10+(inner.z+10)*.9}));
