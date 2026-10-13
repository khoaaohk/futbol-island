'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer,type PointerEvent as RPointerEvent} from 'react';
import {cylinder,depthOf,insetPlan,iso,lineOnTop,planOutline,ring,segment,sideArc,sideMatrix,sideSeam,slabOf,type Plan,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Ball,Line,Screw,Solid,basePlate,fit,labelPlate,painted,rulerStrip,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {BED_Z,CARD,CARD_T,DIE_T,LEVER,PLATEN_T,PLATEN_UP,barAngle,cardPos,platenZ,type Die,type PressState} from './model';

/**
 * laws-1863 · THE RULE PRESS, drawn with the anatomy kit in the Paper theme (Oct 12 2026). A cast-iron lever press on a heavy
 * base plate: a foot and a bed with a law card on it, two turned posts with collars, a crown with an engraved name, a tall
 * gland the ram slides out of, the platen with the stamp die under it (the one accent: the die and the ink it prints), and the
 * lever with a ball knob. In front, two trays with ✓ (still a rule) and ✗ (changed) on their fronts. Around it: an ink tin, a
 * stack of blank cards, a ruler strip and a label plate.
 * The static parts are built once per card size; the platen, ram, lever and card move by transform / a re-built lever path.
 */
export type PressApi={draw():void;proj():Projection|null};
const WALL=12;
/** Two benches: a wide one for a landscape card (trays to the sides) and a deep one for a phone (trays in front). */
type Layout={wide:boolean;az:number;el:number;plate:Plan;trays:Record<Die,{x:number;y:number}>;tin:[number,number];stack:[number,number];candle:[number,number];book:[number,number];label:Plan};
const WIDE:Layout={wide:true,az:64,el:30,plate:{x:-200,y:-62,w:400,d:152,r:12},trays:{kept:{x:-128,y:30},changed:{x:128,y:30}},
 tin:[-164,-30],stack:[132,-36],candle:[-96,-40],book:[78,-34],label:{x:-26,y:64,w:52,d:12,r:1.5}};
const TALL:Layout={wide:false,az:52,el:42,plate:{x:-114,y:-62,w:228,d:246,r:12},trays:{kept:{x:-52,y:110},changed:{x:52,y:110}},
 tin:[-88,-40],stack:[70,-42],candle:[-88,40],book:[84,40],label:{x:-26,y:150,w:52,d:12,r:1.5}};
const TRAY_PLAN=(L:Layout,d:Die):Plan=>({x:L.trays[d].x-34,y:L.trays[d].y-25,w:68,d:50,r:3});

/** ✓ and ✗ as strokes in a 10 × 9 box (local face or top coordinates). */
export const GLYPH:Record<Die,string>={kept:'M0.5 5L3.8 8.3L9.5 0.8',changed:'M1 1L9 8.6M9 1L1 8.6'};

export const Press=forwardRef<PressApi,{w:number;h:number;state:PressState;flash:{current:number};onTray:(d:Die)=>void;top:number;bottom:number}>(function Press({w,h,state,flash,onTray,top,bottom},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const L=w/Math.max(1,h-top)>1.15?WIDE:TALL,PL=L.plate;
 const P=useMemo(()=>w&&h?fit([[PL.x,PL.y,-15],[PL.x+PL.w,PL.y,-15],[PL.x,PL.y+PL.d,-15],[PL.x+PL.w,PL.y+PL.d,-15],[0,0,156],[86,0,194],[-40,0,110]],w,h,
  {pad:w<600?-4:28,top,bottom,azimuth:L.az,elevation:L.el}):null,[w,h,top,bottom,L,PL]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P}),[P]);
 const stat=useMemo(()=>P?staticItems(P,L):[],[P,L]);
 const platenNode=useMemo(()=>P?platen(P):null,[P]);
 if(!P)return null;
 const s=state,k=scaleOf(P),items:Item[]=[...stat],fl=flash.current;
 // Trays: their walls are static; the die you picked lights its tray; the stacked cards sit inside.
 for(const d of ['kept','changed'] as Die[])items.push(...tray(L,d,P,s.die===d,s.stacks[d],onTray));
 // The moving platen + ram + die (one group, moved down by the pull).
 const dz=platenZ(s.pull)-PLATEN_UP,kP=depthOf([0,0,60],P);
 items.push({k:kP-.5,id:'ram',n:<g transform={shift(P,[0,0,dz])}>{platenNode?.ram}</g>});
 items.push({k:kP,id:'platen',n:<g transform={shift(P,[0,0,dz])} data-platen={s.pull.toFixed(2)}>{platenNode?.platen}<g transform={sideMatrix([-27,19],PLATEN_UP+PLATEN_T-1.4,P,'left')}>
   <path d={GLYPH[s.die]} transform="translate(22 0.4) scale(.56)" fill="none" stroke="var(--acc)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></g></g>});
 // The lever: a round bar from the pivot, swinging in the x–z plane, with a ball knob.
 const a=barAngle(s.pull),p0=iso([LEVER.x,LEVER.y,LEVER.z],P),end:[number,number,number]=[LEVER.x+Math.cos(a)*LEVER.len,LEVER.y,LEVER.z+Math.sin(a)*LEVER.len],p1=iso(end,P);
 items.push({k:depthOf([0,0,160],P)+60,id:'lever',n:<g data-lever>
  <Rod a={p0} b={p1} r={2.6*k}/>
  <Ball cx={p1[0]} cy={p1[1]} r={6.2*k} edge="hi" seams={false}/>
  <circle cx={p0[0]} cy={p0[1]} r={3.2*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/><circle cx={p0[0]} cy={p0[1]} r={1} fill="var(--anatomy-dot)"/>
 </g>});
 // The card: on the bed, or sliding into its tray.
 if(s.card){const c=s.slide>0?cardPos(s,L.trays):{x:0,y:0,z:BED_Z};
  items.push({k:s.slide>0?depthOf([c.x,c.y,c.z],P)+40:depthOf([0,0,BED_Z],P)+1,id:'card',n:<g transform={shift(P,[c.x,c.y,c.z])} data-card-on={s.slide>0?'slide':'bed'}>
   {cardNode(P,s.stamped,true)}
   {fl>0&&<path d={ring(0,0,8+30*(1-fl),CARD_T,P,40)} fill="none" stroke="var(--acc)" strokeWidth={2} opacity={fl} vectorEffect="non-scaling-stroke"/>}
  </g>});}
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

/** A round bar between two screen points (a cylinder seen side-on projects to a capsule). */
function Rod({a,b,r}:{a:[number,number];b:[number,number];r:number}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g>
  <path d={d} stroke="var(--anatomy-hi)" strokeWidth={r*2+1.6} strokeLinecap="round" fill="none"/>
  <path d={d} stroke="var(--anatomy-shade-1)" strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]-nx*r*.35).toFixed(1)} ${(a[1]-ny*r*.35).toFixed(1)}L${(b[0]-nx*r*.35).toFixed(1)} ${(b[1]-ny*r*.35).toFixed(1)}`} stroke="#ffffff" strokeWidth={r*.7} strokeLinecap="round" fill="none" opacity={.9}/>
 </g>;
}

function staticItems(P:Projection,L:Layout):Item[]{
 const PL=L.plate,out:Item[]=[...basePlate('plate',PL,P,{h:9,feet:7,inset:16})],kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P);
 out.push(rulerStrip('ruler',PL.x+22,PL.x+PL.w-22,PL.y+PL.d-13,0,P,{d:7,step:4,every:5}));
 out.push(labelPlate('label',L.label,0,P));
 // Ink tin (the accent ink the die prints with), a stack of blank cards, a candlestick and the minute book.
 const [tx,ty]=L.tin;
 out.push({k:kz(tx,ty,0),id:'tin',n:<g><Solid paths={cylinder(tx,ty,13,0,6,P,48,.5)} tone="mid" inner={<Line d={sideArc(tx,ty,13,3,P,30)} tone="faint"/>}/>
  <Line d={ring(tx,ty,11.2,6,P,48)} tone="lo"/><path d={cylinderTop(tx,ty,10,6,P)} className="iso-acc-fill" opacity={.92}/><Line d={ring(tx,ty,10,6,P,48)} tone="mid"/></g>});
 const [bx,by]=L.stack;
 for(let i=0;i<7;i++)out.push({k:kz(bx,by,i)+i*.01,id:'blank'+i,n:<Solid paths={slabOf({x:bx-CARD.w/2+(i%2)*.8,y:by-CARD.d/2+(i%3)*.6,w:CARD.w,d:CARD.d,r:1},i*CARD_T,CARD_T,P,3)} tone="hi" crease="none"/>});
 const [cx,cy]=L.candle;
 out.push({k:kz(cx,cy,0),id:'candle',n:<g>
  <Solid paths={cylinder(cx,cy,10,0,1.8,P,40,.4)} tone="mid"/><Solid paths={cylinder(cx,cy,2.2,1.8,12,P,20)} tone="hi"/>
  <Solid paths={cylinder(cx,cy,6.4,13.8,1.4,P,32,.3)} tone="mid"/><Solid paths={cylinder(cx,cy,3.2,15.2,20,P,24)} tone="hi" lit inner={<Line d={sideArc(cx,cy,3.2,31,P,16)} tone="faint"/>}/>
  <Line d={segment([cx,cy,35.2],[cx+.4,cy,38],P)} tone="hi"/>
  <path d={(()=>{const [fx,fy]=iso([cx+.4,cy,38],P),k=scaleOf(P);return `M${fx} ${fy-9*k}C${fx+3.2*k} ${fy-4*k} ${fx+2.6*k} ${fy+1*k} ${fx} ${fy+1*k}C${fx-2.6*k} ${fy+1*k} ${fx-3.2*k} ${fy-4*k} ${fx} ${fy-9*k}Z`;})()} className="iso-line" data-tone="mid" fill="#fbfbf8"/>
 </g>});
 const [ox,oy]=L.book,bk={x:ox-22,y:oy-15,w:44,d:30,r:1.5};
 out.push({k:kz(ox,oy,0),id:'book',n:<g>
  <Solid paths={slabOf(bk,0,9,P,3)} tone="hi" inner={<>{[2.6,4.6,6.6].map(z=><Line key={z} d={sideSeam(insetPlan(bk,.01),z,P,3)} tone="faint"/>)}</>}/>
  <Solid paths={slabOf({x:bk.x-1.2,y:bk.y-1.2,w:bk.w+2.4,d:bk.d+2.4,r:2},9,1.4,P,3,.3)} tone="mid"><Line d={planOutline(insetPlan({x:bk.x-1.2,y:bk.y-1.2,w:bk.w+2.4,d:bk.d+2.4,r:2},4),10.4,P,3)} tone="faint"/></Solid>
 </g>});
 // The press: foot, bed, guides.
 const kB=kz(0,0,0);
 out.push({k:kB-3,id:'foot',n:<Solid paths={slabOf({x:-54,y:-36,w:108,d:72,r:6},0,10,P,6,1.2)} tone="mid" inner={<Line d={sideSeam({x:-54,y:-36,w:108,d:72,r:6},4,P,6)} tone="faint"/>}>
  {[[-46,-28],[46,-28],[-46,28],[46,28]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={10} P={P} r={2}/>)}</Solid>});
 out.push({k:kB-2,id:'bed',n:<Solid paths={slabOf({x:-42,y:-28,w:84,d:56,r:3},10,BED_Z-10,P,4,.8)} tone="hi">
  <Line d={planOutline({x:-38,y:-24,w:76,d:48,r:2},BED_Z,P,4)} tone="faint"/></Solid>});
 out.push({k:kB-1.5,id:'guide',n:<Solid paths={slabOf({x:-24,y:-23,w:48,d:3,r:.8},BED_Z,2.2,P,3)} tone="mid"/>});
 // Posts with base and top collars (the left post sorts behind the platen, the right one in front).
 for(const x of [-36,36]){out.push({k:kz(x,0,40),id:'post'+x,n:<g>
  <Solid paths={cylinder(x,0,6.6,BED_Z,4,P,32,.5)} tone="mid"/>
  <Solid paths={cylinder(x,0,4.4,BED_Z+4,72,P,28)} tone="hi" inner={<>{[30,56].map(z=><Line key={z} d={sideArc(x,0,4.4,z,P,18)} tone="faint"/>)}</>}/>
  <Solid paths={cylinder(x,0,6.6,BED_Z+76,2,P,32,.5)} tone="mid"/>
 </g>});}
 // Crown with its engraved name, the gland on top and the lever's pivot boss.
 const kC=kz(0,0,100);
 out.push({k:kC+1,id:'crown',n:<Solid paths={slabOf({x:-48,y:-11,w:96,d:22,r:4},95,13,P,6,1)} tone="mid" inner={<Line d={sideSeam({x:-48,y:-11,w:96,d:22,r:4},99,P,6)} tone="faint"/>}>
  {[-36,36].map(x=><Screw key={x} x={x} y={0} z={108} P={P} r={2.6}/>)}
  <FaceText transform={sideMatrix([-44,11],105.6,P,'left')} size={4.4} tone="mid">LAWS 1863</FaceText>
 </Solid>});
 out.push({k:kC+2,id:'gland',n:<g>
  <Solid paths={cylinder(0,0,12,108,4,P,40,.6)} tone="mid"/>
  <Solid paths={cylinder(0,0,8.6,112,40,P,36)} tone="hi" inner={<>{[124,140].map(z=><Line key={z} d={sideArc(0,0,8.6,z,P,24)} tone="faint"/>)}</>}/>
  <Line d={ring(0,0,4,152,P,24)} tone="lo"/>
 </g>});
 out.push({k:kC+3,id:'boss',n:<Solid paths={slabOf({x:7,y:-7,w:8,d:14,r:1.4},134,15,P,3,.5)} tone="mid"/>});
 return out;
}
/** The top face of a cylinder (a filled ellipse), for an inlay. */
function cylinderTop(cx:number,cy:number,r:number,z:number,P:Projection){return cylinder(cx,cy,r,z,0,P,48).top;}

function platen(P:Projection){
 const z=PLATEN_UP;
 return {
  ram:<g><Solid paths={cylinder(0,0,3.6,z+PLATEN_T,80,P,24)} tone="hi"/><Solid paths={cylinder(0,0,6,z+PLATEN_T,3.2,P,28,.5)} tone="mid"/></g>,
  platen:<g>
   <g className="acc"><Solid paths={slabOf({x:-13,y:-9,w:26,d:18,r:1.5},z-DIE_T,DIE_T,P,3)} tone="hi" className="acc"/></g>
   <Solid paths={slabOf({x:-27,y:-19,w:54,d:38,r:2.4},z,PLATEN_T,P,4,1)} tone="hi" lit inner={<Line d={sideSeam({x:-27,y:-19,w:54,d:38,r:2.4},z+3,P,4)} tone="faint"/>}>
    {[[-22,-14],[22,-14],[-22,14],[22,14]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={z+PLATEN_T} P={P} r={1.4}/>)}
   </Solid>
  </g>,
 };
}

/** A law card built at the origin (its centre), lying on z = 0: engraved rule lines, the law tag and (once stamped) the mark. */
function cardNode(P:Projection,stamped:Die|null,lit:boolean){
 const {w,d}=CARD,x=-w/2,y=-d/2,z=CARD_T;
 return <g>
  <Solid paths={slabOf({x,y,w,d,r:1},0,CARD_T,P,3)} tone="hi" lit={lit}>
   <Line d={planOutline({x:x+3,y:y+3,w:12,d:5,r:.8},z,P,3)} tone="mid"/>
   {[11,15.5,20,24.5].map((yy,i)=><Line key={i} d={lineOnTop([x+3,y+yy],[x+(i===3?24:w-4),y+yy],z,P)} tone="lo" free/>)}
  </Solid>
  {stamped&&<g data-stamp={stamped}>{stampStrokes(P,stamped,x+w-17,y+d-17,z)}</g>}
 </g>;
}
/** The printed ✓ / ✗ lying on the card's top face (accent ink). */
function stampStrokes(P:Projection,die:Die,x:number,y:number,z:number){
 const pts=die==='kept'?[[[0,6],[4.4,11],[13,1]]]:[[[1,1],[13,13]],[[13,1],[1,13]]];
 const sq=insetPlan({x:x-2,y:y-2,w:18,d:18,r:2},0);
 return <g>
  <path d={planOutline(sq,z,P,3)} fill="none" stroke="var(--acc)" strokeWidth={1.4} vectorEffect="non-scaling-stroke"/>
  {pts.map((ln,i)=><path key={i} d={ln.map(([u,v],j)=>{const [sx,sy]=iso([x+u,y+v,z],P);return `${j?'L':'M'}${sx.toFixed(1)} ${sy.toFixed(1)}`;}).join('')} fill="none" stroke="var(--acc)" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>)}
 </g>;
}

/** A tray: floor and back/left walls behind its card stack, front/right walls in front; ✓ or ✗ on its front. */
function tray(L:Layout,d:Die,P:Projection,on:boolean,n:number,onTray:(d:Die)=>void):Item[]{
 const T=L.trays,pl=TRAY_PLAN(L,d),{x,y,w,d:dd}=pl,k0=depthOf([T[d].x,T[d].y,0],P),t=2.4,out:Item[]=[];
 out.push({k:k0-2,id:d+'-floor',n:<g><path className="iso-halo" style={{opacity:.22}} d={slabOf(pl,0,WALL,P).fill}/>
  <Solid paths={slabOf(pl,0,3,P,3,.5)} tone="mid"/>
  <Solid paths={slabOf({x,y,w,d:t,r:1},3,WALL-3,P,3)} tone="mid"/>
  <Solid paths={slabOf({x,y,w:t,d:dd,r:1},3,WALL-3,P,3)} tone="mid"/></g>});
 for(let i=0;i<n;i++)out.push({k:k0-1+i*.01,id:`${d}-card${i}`,n:<g transform={shift(P,[T[d].x+(i%2?.8:-.6),T[d].y+(i%3)*.5,3+i*CARD_T])}>{cardNode(P,d,false)}</g>});
 out.push({k:k0+1,id:d+'-front',n:<g data-tray={d} data-on={on||undefined}>
  <Solid paths={slabOf({x:x+w-t,y,w:t,d:dd,r:1},3,WALL-3,P,3)} tone={on?'hi':'mid'} lit={on}/>
  <Solid paths={slabOf({x,y:y+dd-t,w,d:t,r:1},3,WALL-3,P,3)} tone={on?'hi':'mid'} lit={on}>
   <g transform={sideMatrix([x+w/2-4.3,y+dd],WALL-1.6,P,'left')}>
    <path d={GLYPH[d]} transform="scale(.85)" fill="none" stroke={on?'var(--acc)':'var(--anatomy-mid)'} strokeWidth={on?3:1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></g>
  </Solid>
  {on&&<path d={planOutline({x:x+.6,y:y+.6,w:w-1.2,d:dd-1.2,r:2.4},WALL,P,3)} fill="none" stroke="var(--acc)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
  <path className="iso-hit" d={slabOf(pl,0,WALL,P).fill} data-tray-hit={d} role="button" aria-label={d==='kept'?'Still a rule today':'Changed since 1863'}
   onPointerDown={(e:RPointerEvent)=>{e.stopPropagation();onTray(d);}}/>
 </g>});
 return out;
}
