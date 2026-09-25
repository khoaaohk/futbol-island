/** Shared by rendered fixtures and their collision bodies. */
export function fieldLightLayout(v:{id:string;width:number;length:number}){
 const roof=v.id==='knockout',height=v.id==='futsal'||roof?8:v.id==='11v11'?21:15;
 const side=v.width/2+(roof?.7:2.3),end=v.length/2+(roof?1.5:2.3);
 return {height,side,posts:[-1,1].flatMap(hand=>[-1,1].map(sign=>({x:hand*side,z:sign*end,hand})))};
}
