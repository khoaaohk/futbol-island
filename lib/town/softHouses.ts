import * as T from 'three';
import {awningColour,type BuildingScheme} from './buildingStyles';
import {softPrism,softBlock,barrelStrip,archSlab,corners,type BuildingShape,type Corner,type Corners,type Ring} from './buildingShapes';

/**
 * The generic house/shop recipe with soft silhouettes (Oct 12 2026). Replaces world.ts building()+house()'s box version for
 * every building that has a paint scheme (landmarks keep the old recipe and look). Visual only: world.ts still records the
 * building's footprint, height, obstacle (with its collision corner radius, if any) and the rest of its data, unchanged.
 *
 * Rules that keep gameplay identical:
 *  - every wall, tower, plinth and cornice stays inside the footprint (cornice overhang as before) and the walkable roof
 *    height (h+0.23); the corner tower's low cap tops out 0.37 m above the roof, like the parapet rails it replaces, so the
 *    roof-obstacle scan (world.ts, max.y > roof+0.4) skips it;
 *  - roof furniture that the scan turns into roof obstacles keeps its exact bounding box: the roof room becomes a rounded
 *    tier whose cap spans the old box (its body is marked skipRoofObstacle so the scan still records one obstacle), and the
 *    small roof box becomes a rounded box of the same size;
 *  - doors, door steps and plaques keep their positions.
 *
 * Heat: corners use 2–3 segments, chamfers 1. Balcony balusters drop from 10-sided capped cylinders (40 triangles each) to
 * 5-sided open ones (10 each), which pays for most of the curves. Everything joins the static chunk batches.
 */
export type SoftKit={
  put:(g:T.BufferGeometry,color:string,x:number,y:number,z:number)=>T.Mesh;
  box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>T.Mesh;
  cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>T.Mesh;
  sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string)=>T.Mesh;
};
export type SoftHouse={x:number;z:number;w:number;d:number;h:number;label:string;index:number;scheme:BuildingScheme;shape:BuildingShape;
  /** Collision corner radius from world.ts (0 = square collision): the visual corners never get tighter than this. */ dataRadius:number;
  /** Wall colour (the scheme's wall). */ wall:string;};

const GLASS='#365b56',SIDE_GLASS='#3d625c',SHOP_GLASS='#274c48',PLINTH='#d2bc94',BALCONY='#e9cfa5',RAIL='#526b5e',BALUSTER='#647169';
const C=(r:number,seg?:number):Corner=>({r,seg:seg??(r>=1.4?3:2)});

export function buildSoftHouse(kit:SoftKit,o:SoftHouse){
  const {put,box,cylinder,sign}=kit,{x,z,w,d,h,label,index,scheme,dataRadius}=o,{outline,detail}=o.shape;
  const a=w/2,b=d/2,front=z+b;
  const deco=(m:T.Mesh)=>{m.userData.skipRoofObstacle=true;return m;};
  // ---- Corners per silhouette (never tighter than the collision radius).
  const soft=Math.max(dataRadius,o.shape.radius);
  const towerR=Math.min(1.9,w*.18,d*.18);
  // Crisp: square corners (a 0.35 m ease where the collision corner is rounded, so the wall never pokes past it).
  const crisp=outline==='crisp',crispR=dataRadius?.35:0;
  let cs:Corners;
  switch(outline){
    case 'crisp':cs=corners(C(crispR,2));break;
    case 'roundEnds':cs=corners(C(Math.max(dataRadius,Math.min(2.1,w*.18,d*.18)),3));break;
    case 'cornerTower':cs=[C(towerR,3),C(Math.max(dataRadius,.7)),C(Math.max(dataRadius,.7)),C(Math.max(dataRadius,.7))];break;
    case 'chamfer':cs=corners(C(Math.max(1.25,dataRadius),1),C(Math.max(dataRadius,.7)));break;
    default:cs=corners(C(soft));
  }
  const rFR=cs[0].r,rFL=cs[1].r,rBR=cs[3].r;
  // ---- Body. Crisp: the old box wall, plinth and square cornice slab. Others: soft plinth, wall and a pillowy cornice whose
  // top is the roof seen from the play camera (same top height, h+0.195).
  if(crisp&&!crispR){
    deco(box(w+.15,.35,d+.16,PLINTH,x,.18,z));deco(box(w,h,d,o.wall,x,h/2,z));deco(box(w+.45,.23,d+.5,scheme.roof,x,h+.08,z));
  }else{
    deco(put(softPrism(w,d,[{o:.08,y:.005},{o:.08,y:.24},{o:0,y:.4}],cs),PLINTH,x,0,z));
    deco(put(softPrism(w,d,[{o:0,y:0},{o:0,y:h}],cs),o.wall,x,0,z));
    const cornice:Ring[]=crisp?[{o:0,y:h-.035},{o:.24,y:h-.035},{o:.24,y:h+.195}]:[{o:0,y:h-.12},{o:.24,y:h-.01},{o:.26,y:h+.1},{o:.18,y:h+.195}];
    deco(put(softPrism(w,d,cornice,cs,{top:true}),scheme.roof,x,0,z));
  }
  // ---- Corner tower: a round cream turret at the front-right corner, its low cap in the roof paint.
  const tower=outline==='cornerTower';
  if(tower){
    const tx=x+a-towerR,tz=z+b-towerR,tr=towerR+.12;
    deco(put(new T.CylinderGeometry(tr,tr,h+.25,12,1,true),scheme.trim,tx,(h+.25)/2,tz));
    deco(put(new T.CylinderGeometry(tr*.55,tr+.16,.35,12,1,false),scheme.roof,tx,h+.425,tz));
    // One window per floor on the turret's diagonal face.
    for(let floor=0;floor<Math.min(4,Math.floor(h/2.5));floor++){
      const m=deco(box(.7,1.15,.06,GLASS,tx+Math.SQRT1_2*(tr+.02),1.4+floor*2.45,tz+Math.SQRT1_2*(tr+.02)));m.rotation.y=Math.PI/4;
    }
  }
  // ---- Front run: windows, sign, awning and shopfront sit on the flat part of the facade.
  const left=-a+Math.max(dataRadius,rFL*.7),right=tower?a-2*towerR-.3:a-Math.max(dataRadius,rFR*.7);
  const run=right-left,cx=x+(left+right)/2;
  const floors=Math.min(4,Math.floor(h/2.5)),columns=Math.max(2,Math.min(6,Math.floor(run/2)));
  const sill=scheme.trim,odd=scheme.balconyOdd&&columns>2?1:0;
  for(let floor=0;floor<floors;floor++)for(let col=0;col<columns;col++){
    const xx=cx-run/2+(col+.5)*run/columns,yy=1.35+floor*2.45,balcony=floor>0&&col%2===odd;
    if(balcony&&detail==='bays'){
      // A rounded bay window in the trim paint, glazed on its face (replaces the balcony).
      deco(put(softBlock(1.5,1.7,.62,[C(.4),C(.4),C(0),C(0)],yy-.85),scheme.trim,xx,0,front+.31));
      deco(box(.88,1.25,.06,GLASS,xx,yy,front+.65));
      continue;
    }
    if(detail==='portholes'&&floor===floors-1&&floor>0){
      const ring=deco(put(new T.CylinderGeometry(.55,.55,.05,10,1,false),sill,xx,yy+.05,front+.03));ring.rotation.x=Math.PI/2;
      const glass=deco(put(new T.CylinderGeometry(.42,.42,.07,10,1,false),GLASS,xx,yy+.05,front+.06));glass.rotation.x=Math.PI/2;
      continue;
    }
    deco(box(.88,1.25,.06,GLASS,xx,yy,front+.04));deco(box(1.04,.09,.21,sill,xx,yy-.65,front+.1));
    if(detail==='arches')deco(put(archSlab(.44,.06,6),GLASS,xx,yy+.625,front+.04));
    if(balcony){
      deco(box(1.4,.11,.7,BALCONY,xx,yy-.64,front+.35));
      for(let q=-2;q<=2;q++)deco(put(new T.CylinderGeometry(.018,.018,.55,5,1,true),BALUSTER,xx+q*.26,yy-.32,front+.65));
      deco(box(1.4,.04,.045,RAIL,xx,yy-.04,front+.65));
    }
  }
  // Side windows (+x face) on its flat run, clear of both corners.
  const sBack=-b+rBR*.7+.1,sFront=tower?b-2*towerR-.3:b-rFR*.7-.1,sRun=sFront-sBack;
  for(let floor=0;floor<floors;floor++)for(let k=0;k<3;k++)deco(box(.065,1.22,Math.min(.86,sRun/3-.2),SIDE_GLASS,x+a+.035,1.4+floor*2.45,z+sBack+(k+.5)*sRun/3));
  // ---- Shopfront.
  if(label)sign(label,run*.86,.62,cx,2.45,front+.1,scheme.sign);
  const barrel=outline==='roundEnds'||detail==='portholes'||(!crisp&&detail==='bays');
  for(let col=0;col<8;col++){
    const colour=awningColour(scheme,col,8),sx=cx-run/2+(col+.5)*run/8;
    if(barrel)deco(put(barrelStrip(run/8+.002,1.3,.4),colour,sx,2.12,front+.01));
    else{const awning=deco(box(run/8,.10,1.3,colour,sx,2.08,front+.58));awning.rotation.x=.14;}
  }
  deco(box(run-.6,1.65,.06,SHOP_GLASS,cx,.97,front+.07));
  for(let col=1;col<3;col++)deco(box(.055,1.7,.09,sill,cx-run/2+col*run/3,.96,front+.13));
  // ---- Roof: the small roof box (a roof obstacle) keeps its exact box, only its edges soften.
  if(crisp)box(1.2,1.1,1.1,'#dbccaa',x+w*.22,h+.7,z-d*.2);else put(softBlock(1.2,1.1,1.1,corners(C(.28)),h+.15),'#dbccaa',x+w*.22,0,z-d*.2);
  // Tanks stay as they were (already round).
  if(index%3===0){cylinder(.75,1.25,'#d2bc94',x-w*.23,h+.8,z-d*.18);cylinder(.82,.12,'#9d805b',x-w*.23,h+1.46,z-d*.18);}
  // Stepped top: the roof room becomes a rounded tier with its own pillow cap. The cap spans the old room's box (same roof
  // obstacle); the body sits inside it and is skipped by the scan.
  if(index%3===1&&crisp)box(w*.35,1.45,d*.42,o.wall,x-w*.16,h+.78,z-d*.12);
  else if(index%3===1){
    const tw=w*.35,td=d*.42,tx=x-w*.16,tz=z-d*.12,y0=h+.055,y1=h+1.505,rr=Math.min(.9,tw*.25,td*.25),tc=corners(C(rr));
    deco(put(softPrism(tw-.24,td-.24,[{o:0,y:y0},{o:0,y:y1-.2}],tc),o.wall,tx,0,tz));
    put(softPrism(tw-.24,td-.24,[{o:0,y:y1-.29},{o:.12,y:y1-.17},{o:.12,y:y1-.07},{o:.06,y:y1}],tc,{top:true}),scheme.roof,tx,0,tz);
  }
  // Drainpipe on the facade's flat end, door, doorstep and plaque (same door position as before).
  deco(cylinder(.045,h,'#9d805b',tower?x+right:x+a-Math.max(rFR,.08)-.1,h/2,front+.14));
  box(1.15,1.95,.13,scheme.door,x-w*.26,1.02,front+.2);
  box(1.65,.15,.8,PLINTH,x-w*.26,.1,front+.45);
  box(.18,.07,.05,'#f8d9a2',x-w*.26+.34,1.01,front+.29);
  if(index%2===0){const fx=Math.min(x+w*.25,cx+run/2-.65);deco(box(1.1,.34,.42,'#b88472',fx,3.1,front+.45));for(const dx of [-.3,0,.3])deco(put(new T.IcosahedronGeometry(.22,0),'#739568',fx+dx,3.38,front+.45));}
}
