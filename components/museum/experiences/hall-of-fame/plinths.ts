import {boxCorners,corners,cylinder,depthOf,fitProjection,iso,ring,sideArc,sideSeam,slabOf,topTicks,translateAlong,
 type Plan,type Projection} from '../anatomy/iso-kit';
import {piece,type Item} from './board';

/**
 * Hall of Fame · the gallery furniture (Oct 12 2026, anatomy restyle): plinths with a brass plaque, a turned trophy cup and the
 * same game piece the pitch uses, on a long base plate. Used by the arena's cover (six plinths, one per position), the legends
 * picker (one plinth per position) and Your Hall (four plinths stepping up, futsal → 11v11). Pure geometry: tests build them.
 */
export type Group={key:number;items:Item[];tr?:string;id?:string};
const AZ=34;

/** A base plate on feet (halo, feet, plate with a seam, corner screws, a ruler strip along the front edge). */
export function basePlate(P:Projection,plan:Plan,z=0,h=.5):Item[]{
 const it:Item[]=[],zf=z-h-.35,feet=[...corners(plan,Math.min(1,plan.w*.12))].sort((a,b)=>depthOf([a[0],a[1],0],P)-depthOf([b[0],b[1],0],P));
 it.push({k:'shadow',d:slabOf({...plan,x:plan.x+.2,w:plan.w-.4},zf,.05,P).fill,o:1});
 for(const [x,y] of feet){it.push({k:'solid',paths:cylinder(x,y,.34,zf,.06,P,24),tone:'lo'});it.push({k:'solid',paths:cylinder(x,y,.24,zf+.06,.29,P,24),tone:'mid'});}
 it.push({k:'solid',paths:slabOf(plan,z-h,h,P,8,.12),tone:'mid',inner:sideSeam(plan,z-h*.45,P,8)});
 it.push({k:'line',d:corners(plan,.35).map(([x,y])=>ring(x,y,.11,z,P,14)).join(''),tone:'lo'});
 it.push({k:'dots',pts:corners(plan,.35).map(([x,y])=>iso([x,y,z],P)),size:.7,tone:'mid'});
 if(plan.w>4){const s:Plan={x:plan.x+1,y:plan.y+plan.d-.5,w:plan.w-2,d:.3,r:.05};
  it.push({k:'solid',paths:slabOf(s,z,.04,P,3),tone:'lo',crease:'none'});
  const t=topTicks(s.x+.2,s.x+s.w-.2,.25,4,s.y+.01,z+.04,[.1,.2],P,'x');it.push({k:'line',d:t.minor,tone:'lo'},{k:'line',d:t.major,tone:'mid'});}
 return it;
}
/** A plinth: body with a seam under the cap, an overhanging cap, and a brass plaque with two screws on the front face. */
export function plinthItems(P:Projection,x:number,y:number,h:number,{w=1.8,z=0,lit=false,id}:{w?:number;z?:number;lit?:boolean;id?:string}={}):Item[]{
 const body:Plan={x:x-w/2,y:y-w/2,w,d:w,r:.08},cap:Plan={x:x-w/2-.1,y:y-w/2-.1,w:w+.2,d:w+.2,r:.1},it:Item[]=[];
 it.push({k:'shadow',d:slabOf(body,z,.02,P).fill,o:.7});
 it.push({k:'solid',paths:slabOf(body,z,h-.16,P,4),tone:'mid',inner:sideSeam(body,z+.18,P,4),cls:id?'plinth':undefined});
 it.push({k:'solid',paths:slabOf(cap,z+h-.16,.16,P,4,.05),tone:lit?'hi':'mid',lit});
 const pl:Plan={x:x+w/2,y:y-w*.28,w:.03,d:w*.56,r:0},pz=z+Math.max(.1,h*.32);
 it.push({k:'solid',paths:slabOf(pl,pz,Math.min(.42,h*.34),P,1),tone:'lo',crease:'none'});
 it.push({k:'dots',pts:[iso([x+w/2+.03,y-w*.2,pz+Math.min(.42,h*.34)/2],P),iso([x+w/2+.03,y+w*.2,pz+Math.min(.42,h*.34)/2],P)],size:.6,tone:'mid'});
 return it;
}
/** A turned trophy cup: foot, block, stem, bowl with a rim, two handles. Lit when earned. */
export function cupItems(P:Projection,x:number,y:number,z:number,lit=true):Item[]{
 const it:Item[]=[];
 it.push({k:'solid',paths:cylinder(x,y,.42,z,.1,P,28,.02),tone:'mid'});
 it.push({k:'solid',paths:cylinder(x,y,.3,z+.1,.26,P,24),tone:'mid'});
 it.push({k:'solid',paths:cylinder(x,y,.07,z+.36,.36,P,14),tone:'hi',crease:'none'});
 it.push({k:'solid',paths:slabOf({x:x-.05,y:y-.62,w:.1,d:.16,r:.04},z+.86,.34,P,3),tone:'hi'});
 it.push({k:'solid',paths:cylinder(x,y,.48,z+.72,.62,P,36,.03),tone:'hi',lit,inner:sideArc(x,y,.48,z+1.2,P,24)});
 it.push({k:'line',d:ring(x,y,.4,z+1.34,P,36),tone:'lo'});
 it.push({k:'solid',paths:slabOf({x:x-.05,y:y+.46,w:.1,d:.16,r:.04},z+.86,.34,P,3),tone:'hi'});
 return it;
}
/** The game piece standing at (x, y, z): its own group, moved by a transform. */
export const pieceAt=(P:Projection,x:number,y:number,z:number):{items:Item[];tr:string}=>({items:piece({...P}),tr:translateAlong(P,[x,y,z])});

/** The arena's cover: six plinths, one per position (goal to goal), on one plate; the striker's piece lit, a ball at its feet. */
export function coverScene(w:number,h:number):{P:Projection;groups:Group[]}{
 const plate:Plan={x:-1.6,y:-1.8,w:15.2,d:3.6,r:.25},hs=[1.1,1.5,1.9,2.3,1.9,1.5];
 const P=fitProjection([...boxCorners(plate,-.9,4.8)],w,h,{pad:18,azimuth:AZ+30,elevation:32});
 const groups:Group[]=[{key:-1e9,items:basePlate(P,plate)}];
 hs.forEach((ph,i)=>{const x=i*2.4,y=0;groups.push({key:depthOf([x,y,0],P),items:plinthItems(P,x,y,ph,{w:1.6,lit:i===5})});
  const pc=pieceAt(P,x,y,ph);groups.push({key:depthOf([x,y,0],P)+.01,items:pc.items,tr:pc.tr});});
 groups.sort((a,b)=>a.key-b.key);
 return {P,groups};
}
/** One position's plinth for the picker: a plinth with its piece, a small plate under it. */
export function positionScene(w:number,h:number,height=1.2):{P:Projection;groups:Group[]}{
 const plate:Plan={x:-1.7,y:-1.7,w:3.4,d:3.4,r:.2};
 const P=fitProjection([...boxCorners(plate,-.9,height+2.8)],w,h,{pad:8,azimuth:AZ,elevation:30});
 const pc=pieceAt(P,0,0,height);
 return {P,groups:[{key:0,items:basePlate(P,plate)},{key:1,items:plinthItems(P,0,0,height,{w:1.6})},{key:2,items:pc.items,tr:pc.tr}]};
}
/** Your Hall: four plinths stepping up (futsal → 11v11), a cup on each graduated one, on one long plate. */
export const HALL_X=[0,2.6,5.2,7.8] as const,HALL_H=[.9,1.6,2.3,3] as const;
export function hallScene(w:number,h:number,earned:readonly boolean[],selected:number):{P:Projection;groups:Group[]}{
 const plate:Plan={x:-1.6,y:-1.6,w:11,d:3.2,r:.25};
 const P=fitProjection([...boxCorners(plate,-.9,HALL_H[3]+1.5)],w,h,{pad:16,azimuth:AZ+30,elevation:28});
 const groups:Group[]=[{key:-1e9,items:basePlate(P,plate)}];
 HALL_X.forEach((x,i)=>{const k=depthOf([x,0,0],P);groups.push({key:k,id:String(i),items:plinthItems(P,x,0,HALL_H[i],{w:1.5,lit:i===selected,id:String(i)})});
  if(earned[i])groups.push({key:k+.01,items:cupItems(P,x,0,HALL_H[i],true)});});
 groups.sort((a,b)=>a.key-b.key);
 return {P,groups};
}
