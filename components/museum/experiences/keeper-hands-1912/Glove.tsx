'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,extrude,iso,lineOnTop,onTop,sideArc,sideSeam,slabOf,type Flat,type Plan,type Plane,type Point3,type Projection} from '../anatomy/iso-kit';
import {Tint} from '../anatomy/bench';
import {Line,Screw,Solid,basePlate,fit,labelPlate,painted,type Item} from '../anatomy/paper-kit';
import {LAYERS,LAYER_T,gloveLayers,layerZ,type GloveEra,type Layer} from './model';
import {Crank} from './Board';

/**
 * keeper-hands-1912 · THE GLOVE STAND (Oct 14 2026 redo; the breakdown, like the stadiums' layers). One keeper's glove, palm side
 * down, its layers on carriers that ride two guide pillars at the back of a small bench. Turn the crank on the right (or use the
 * slider) and the carriers spread up the pillars: grip palm, your hand, the finger protectors, the segmented back, the wrist strap.
 * The era buttons swap which layers a keeper had: before the 1970s mostly bare hands; 1970s a simple glove; since the 1980s the full
 * glove (Wikipedia, Kit (association football)). A layer the era didn't have fades to a ghost.
 */
const PLATE:Plan={x:-80,y:-92,w:170,d:176,r:10},PILLAR_Y=-74,PILLAR_X=46;
export const STAND_CRANK={x:PLATE.x+PLATE.w+2,y:44,z:17,r:14};
const gapOf=(wide:boolean)=>wide?30:42,topOf=(wide:boolean)=>layerZ(LAYERS.length-1,1,gapOf(wide))+LAYER_T.strap+14;
const GREEN='#3f9a6c';
/** A right hand, palm down, fingers pointing back (−y), wrist at the front (+y); about 76 across and 100 long. */
const HAND:Plane[]=([[-16,0],[-20,18],[-22,30],[-34,46],[-40,56],[-38,62],[-31,60],[-22,50],[-21,58],[-22,84],[-19,89],[-14,90],[-10,86],[-9.5,62],[-8,64],[-8.5,93],[-5,98],[0,98.5],[4,94],[3.5,64],
 [5,63],[6,89],[9,93],[13.5,92],[16,87],[15.5,62],[17,60],[19,78],[22,82],[26,81],[28,76],[26,52],[24,36],[21,16],[16,0]] as Plane[]).map(([x,y])=>[x,52-y]);
const grow=(pts:Plane[],k:number,dy=0):Plane[]=>pts.map(([x,y])=>[x*k,(y-2)*k+2+dy]);
const FINGERS:[Plane,Plane][]=[[[-15.5,52-62],[-15.5,52-86]],[[-2,52-66],[-2,52-94]],[[10.5,52-65],[10.5,52-88]],[[21.5,52-58],[22,52-78]]];

export type GloveView={era:GloveEra;apart:number;crank:number;focus:Layer|'crank'|null};
export type GloveApi={draw():void;proj():Projection|null;anchor(l:Layer):Flat|null;crankCentre():Flat|null};

export const GloveStand=forwardRef<GloveApi,{w:number;h:number;view:{current:GloveView};top:number;bottom:number;side:'left'|'right'}>(function GloveStand({w,h,view,top,bottom,side},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const wide=w/Math.max(1,h)>1.1;
 const P=useMemo(()=>{if(!w||!h)return null;const pts:Point3[]=[];
  for(const [x,y] of [[PLATE.x,PLATE.y],[PLATE.x+PLATE.w,PLATE.y],[PLATE.x,PLATE.y+PLATE.d],[PLATE.x+PLATE.w,PLATE.y+PLATE.d]])pts.push([x,y,-16],[x,y,0]);
  const TOP=topOf(wide);pts.push([-PILLAR_X,PILLAR_Y,TOP],[PILLAR_X,PILLAR_Y,TOP],[0,0,TOP-6]);
  // Leave room for the labels on one side: fit into the other ~60% of the card.
  const ww=wide?w*.56:w*.6,P0=fit(pts,ww,h,{pad:wide?20:8,top,bottom,azimuth:wide?50:74,elevation:wide?32:28});
  return {...P0,origin:[P0.origin[0]+(side==='left'?w-ww-(wide?10:0):(wide?10:0)),P0.origin[1]] as Flat};},[w,h,top,bottom,wide,side]);
 const stat=useMemo(()=>P?staticItems(P,topOf(wide)):[],[P,wide]);
 // Closed, the stand sits centred and a little bigger; as it comes apart it slides over to make room for the labels.
 const zoomAt=(a:number)=>{if(!P)return {Z:1,tx:0,ty:0};const u=1-Math.min(1,a/.6),e=u*u*(3-2*u),c=iso([0,-10,20],P),Z=1+.22*e;
  const tx=((side==='left'?-1:1)*(w*(wide?.22:.17)))*e;return {Z,tx:c[0]*(1-Z)+tx,ty:c[1]*(1-Z)+e*h*.06};};
 const nodes=useMemo(()=>P?layerNodes(P):null,[P]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P,
  anchor:(l)=>{if(!P)return null;const i=LAYERS.indexOf(l),z=layerZ(i,view.current.apart,gapOf(wide))+LAYER_T[l]/2,pts:Record<Layer,Point3>={palm:[-36,4,z],hand:[-30,10,z],spines:[-16,-22,z],back:[-36,0,z],strap:[-24,40,z]};
   const p=pts[l],q=iso(side==="left"?p:[30,p[1],p[2]],P),zz=zoomAt(view.current.apart);return [q[0]*zz.Z+zz.tx,q[1]*zz.Z+zz.ty];},
  crankCentre:()=>{if(!P)return null;const q=iso([STAND_CRANK.x+6,STAND_CRANK.y,STAND_CRANK.z],P),z=zoomAt(view.current.apart);return [q[0]*z.Z+z.tx,q[1]*z.Z+z.ty];}}),[P,side,w,h]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!P||!nodes)return null;
 const v=view.current,items:Item[]=[...stat],have=gloveLayers(v.era);
 LAYERS.forEach((l,i)=>{const z=layerZ(i,v.apart,gapOf(wide)),on=have.includes(l),lit=v.focus===l;
  const sh=(()=>{const a=iso([0,0,0],P),b=iso([0,0,z],P);return `translate(${(b[0]-a[0]).toFixed(2)} ${(b[1]-a[1]).toFixed(2)})`;})();
  items.push({k:1000+i*10,id:'carrier'+l,n:<g transform={sh} data-carrier={l}>{nodes.carrier}</g>});
  items.push({k:1000+i*10+1,id:'layer'+l,n:<g transform={sh} data-layer={l} data-on={on||undefined} style={{opacity:on?1:.14,transition:'opacity .35s ease'}}>
   {nodes[l]}{lit&&<path d={onTop(l==='strap'?grow(HAND,1.08,0).filter(([,y])=>y>30):grow(HAND,l==='hand'||l==='spines'?1:1.08),LAYER_T[l]+.2,P,true)} fill="none" stroke="var(--accent)" strokeWidth={1.8} vectorEffect="non-scaling-stroke"/>}
  </g>});});
 items.push({k:2000,id:'crank',n:<Crank P={P} c={[STAND_CRANK.x+6,STAND_CRANK.y,STAND_CRANK.z]} r={STAND_CRANK.r} axis="x" ang={v.crank*Math.PI*2} focus={v.focus==='crank'} hit="glovecrank" label="Stand crank: turn it to take the glove apart"/>});
 const z=zoomAt(v.apart);
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false" data-glove-stand><g transform={`translate(${z.tx.toFixed(2)} ${z.ty.toFixed(2)}) scale(${z.Z.toFixed(4)})`}>{painted(items)}</g></svg>;
});

function staticItems(P:Projection,TOP:number):Item[]{
 const out:Item[]=[...basePlate('gplate',PLATE,P,{h:10,feet:7,inset:20})];
 // The two guide pillars at the back with their collars, and the rack on the right one (the crank's pinion drives it).
 for(const x of [-PILLAR_X,PILLAR_X])out.push({k:-100+(x>0?1:0),id:'pillar'+x,n:<g>
  <Solid paths={cylinder(x,PILLAR_Y,8,0,4,P,32,.5)} tone="mid"/>
  <Solid paths={cylinder(x,PILLAR_Y,3.2,4,TOP-4,P,24)} tone="hi" inner={<>{[TOP*.33,TOP*.66].map(z=><Line key={z} d={sideArc(x,PILLAR_Y,3.2,z,P,14)} tone="faint"/>)}</>}/>
  <Solid paths={cylinder(x,PILLAR_Y,5,TOP,3,P,24,.4)} tone="mid"/>
 </g>});
 out.push({k:-99,id:'topbar',n:<Solid paths={slabOf({x:-PILLAR_X-5,y:PILLAR_Y-4,w:PILLAR_X*2+10,d:8,r:2},TOP+3,5,P,3,.5)} tone="mid" inner={<Line d={sideSeam({x:-PILLAR_X-5,y:PILLAR_Y-4,w:PILLAR_X*2+10,d:8,r:2},TOP+5,P,3)} tone="faint"/>}/>});
 // The crank's bearing block on the right edge, with a shaft into the base.
 out.push({k:1990,id:'cbear',n:<Solid paths={slabOf({x:STAND_CRANK.x-8,y:STAND_CRANK.y-6,w:8,d:12,r:1.5},0,STAND_CRANK.z+5,P,3,.5)} tone="mid"/>});
 out.push(labelPlate('glabel',{x:-70,y:PLATE.y+PLATE.d-22,w:44,d:14,r:1.5},0,P,-90));
 return out;
}
/** Each layer built once at z = 0 (moved up by a transform), and the carrier that holds it on the pillars. */
function layerNodes(P:Projection){
 const glove=grow(HAND,1.08),back=grow(HAND,1.08);
 const seams:string[]=[];// segmentation: cuts across each finger of the back, every 8 units
 for(const [[ax,ay],[,by]] of FINGERS)for(let y=ay-6;y>by+2;y-=8)seams.push(lineOnTop([ax*1.08-5.6,(y-2)*1.08+2],[ax*1.08+5.6,(y-2)*1.08+2],LAYER_T.back+.05,P));
 const ex=(pts:Plane[],h:number)=>extrude(pts,0,h,P,{convex:false});
 const strapPl:Plan={x:-24,y:32,w:50,d:14,r:3};
 return {
  carrier:<g>
   {[-PILLAR_X,PILLAR_X].map(x=><Solid key={x} paths={cylinder(x,PILLAR_Y,5.4,-1.5,4,P,24,.4)} tone="mid"/>)}
   <Solid paths={slabOf({x:-PILLAR_X,y:PILLAR_Y-2.5,w:PILLAR_X*2,d:5,r:1},-1.2,2.4,P,3)} tone="mid"/>
   <Solid paths={slabOf({x:-3,y:PILLAR_Y+2,w:6,d:22,r:1},-1.2,1.6,P,3)} tone="mid"><Screw x={0} y={PILLAR_Y+20} z={.4} P={P} r={.8}/></Solid>
  </g>,
  palm:<g>
   <Tint paths={ex(glove,LAYER_T.palm)} color={GREEN} edge="hi"/>
   <path d={onTop(grow(HAND,.98),LAYER_T.palm+.05,P,true)} fill="none" stroke="#bfe3cd" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  </g>,
  hand:<Solid paths={ex(HAND,LAYER_T.hand)} tone="hi" lit>
   {FINGERS.map(([[ax,ay]],i)=><Line key={i} d={lineOnTop([ax-4,ay+2],[ax+4,ay+2],LAYER_T.hand,P)} tone="faint"/>)}
  </Solid>,
  spines:<g>{FINGERS.map(([[ax,ay],[bx,by]],i)=><g key={i}>
   <Solid paths={extrude([[ax-2.2,ay],[ax+2.2,ay],[bx+2.2,by],[bx-2.2,by]],0,LAYER_T.spines,P,{convex:true})} tone="hi"/>
   {[0,.25,.5,.75,1].map(f=>{const x=ax+(bx-ax)*f,y=ay+(by-ay)*f;return <Line key={f} d={lineOnTop([x-2.2,y],[x+2.2,y],LAYER_T.spines,P)} tone="lo"/>;})}
  </g>)}
   <Solid paths={slabOf({x:-20,y:-12,w:44,d:6,r:2},0,LAYER_T.spines,P,3)} tone="mid"/></g>,
  back:<Solid paths={ex(back,LAYER_T.back)} tone="hi"><Line d={seams.join('')} tone="mid"/><Line d={onTop(grow(HAND,1.0),LAYER_T.back+.05,P,true)} tone="faint"/></Solid>,
  strap:<g>
   <Solid paths={slabOf(strapPl,0,LAYER_T.strap,P,4,.5)} tone="hi"><Line d={onTop([[strapPl.x+3,strapPl.y+3],[strapPl.x+strapPl.w-3,strapPl.y+3],[strapPl.x+strapPl.w-3,strapPl.y+strapPl.d-3],[strapPl.x+3,strapPl.y+strapPl.d-3]],LAYER_T.strap,P,true)} tone="faint"/></Solid>
   <g style={{['--band' as string]:GREEN}}><Tint paths={slabOf({x:strapPl.x+strapPl.w-14,y:strapPl.y+1,w:22,d:strapPl.d-2,r:3},LAYER_T.strap,1.4,P,4)} color={GREEN} edge="hi"/></g>
  </g>,
 } as Record<Layer|'carrier',JSX.Element>;
}
