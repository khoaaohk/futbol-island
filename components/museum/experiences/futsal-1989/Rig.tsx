'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,depthOf,iso,lineOnTop,planOutline,segment,sideMatrix,sideSeam,slabOf,type Plan,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {BallPart,Line,Screw,Solid,basePlate,fit,labelPlate,painted,rulerStrip,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {BALL} from './content';
import {reboundCm,type Drop,type Kind} from './model';

/**
 * futsal-1989 · THE DROP RIG, drawn with the anatomy kit in the Paper theme (Oct 12 2026). A gantry on a heavy base plate holds
 * a futsal ball (the accent: the low ball is the idea) and a grass ball 2 m over two hard court tiles. Beside each ball a ruler
 * post (a tick every 10 cm, long every 50 cm) carries its Law band (futsal 50–65 cm, grass 120–165 cm) and a sliding collar
 * that stops at the first rebound; the bounce trace is dotted on the ruler. Tap a ball to guess which bounces higher.
 * Heights: 0.8 world units per cm; the tiles' tops are at TILE.
 */
export type RigApi={draw():void};
const U=64,TILE=4,R=11;
type Layout={col:Record<Kind,number>;up:number;plate:Plan;az:number;el:number};
const WIDE:Layout={col:{futsal:-100,grass:100},up:176,plate:{x:-226,y:-56,w:452,d:132,r:12},az:60,el:22};
const TALL:Layout={col:{futsal:-46,grass:46},up:88,plate:{x:-116,y:-56,w:232,d:150,r:12},az:50,el:26};
const Y=12,RY=-20,BEAM=TILE+2*U+2*R+14;

export const Rig=forwardRef<RigApi,{w:number;h:number;top:number;bottom:number;drop:Drop;guess:Kind|null;onGuess:(k:Kind)=>void}>(function Rig({w,h,top,bottom,drop,guess,onGuess},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);useImperativeHandle(ref,()=>({draw:()=>bump()}),[]);
 const L=w/Math.max(1,h-top)>1.1?WIDE:TALL,PL=L.plate;
 const P=useMemo(()=>w&&h?fit([[PL.x,PL.y,-15],[PL.x+PL.w,PL.y,-15],[PL.x,PL.y+PL.d,-15],[PL.x+PL.w,PL.y+PL.d,-15],[-L.up,Y,BEAM+12],[L.up,Y,BEAM+12]],w,h,
  {pad:w<600?6:26,top,bottom,azimuth:L.az,elevation:L.el}):null,[w,h,top,bottom,L,PL]);
 const stat=useMemo(()=>P?staticItems(P,L):[],[P,L]);
 if(!P)return null;
 const items:Item[]=[...stat],k=scaleOf(P);
 for(const kind of ['futsal','grass'] as Kind[]){
  const x=L.col[kind],b=drop.balls[kind],rx=x-26,front=RY+5;
  // the guess: an accent outline round the tile you picked
  if(guess===kind)items.push({k:depthOf([x,Y,TILE],P)-1,id:kind+'-guess',n:<path d={planOutline({x:x-33,y:Y-33,w:66,d:66,r:3},TILE+.05,P,3)} fill="none" stroke="var(--acc)" strokeWidth={2.2} vectorEffect="non-scaling-stroke"/>});
  // the trace of every hop, dotted on the ruler's face; the collar at the first rebound
  const dots=b.trail.map(z=>iso([rx+9.4,front,TILE+z*U],P));
  items.push({k:depthOf([rx,RY,0],P)+.5,id:kind+'-trace',n:<g className="iso-dots" data-tone="mid">{dots.map(([sx,sy],i)=><circle key={i} cx={sx} cy={sy} r={1.1} style={{fill:kind==='futsal'?'var(--acc)':'var(--anatomy-dot)',opacity:.7}}/>)}</g>});
  const fz=TILE+b.first*U;
  if(b.first>0)items.push({k:depthOf([rx,RY,0],P)+.6,id:kind+'-collar',n:<g transform={shift(P,[0,0,fz])} data-rebound={kind} data-cm={reboundCm(b)}>
   <g className={kind==='futsal'?'acc':'dark'}><Solid paths={slabOf({x:rx-2,y:RY-5,w:14,d:12,r:1.4},-2,4,P,3,.3)} tone="hi" className={kind==='futsal'?'acc':'dark'}/></g>
   <Line d={segment([rx+12,RY+1,0],[rx+20,RY+1,0],P)} tone="hi"/></g>});
  // the ball (it falls from the claw, bounces on the tile)
  items.push({k:depthOf([x,Y,0],P)+8,id:kind+'-ball',n:<g transform={shift(P,[x,Y,TILE])} data-ball={kind}><BallPart P={P} r={R} lift={b.z*U} look={kind==='futsal'?'acc':'paper'}/></g>});
  // the claw's jaws open when the rig drops
  const open=drop.dropped?7:0,jz=TILE+2*U+R-7;
  items.push({k:depthOf([x,Y,0],P)+9,id:kind+'-jaws',n:<g>{[-1,1].map(sd=><g key={sd} transform={shift(P,[sd*open,0,0])}>
   <Solid paths={slabOf({x:x+sd*(R+1.5)-1.5,y:Y-5,w:3,d:10,r:.8},jz,BEAM-jz,P,3)} tone="hi" lit={!drop.dropped}/></g>)}</g>});
  // hit area: tap a ball to guess
  const [cx,cy]=iso([x,Y,TILE+2*U+R],P),[fx,fy]=iso([x,Y,TILE+R],P);
  items.push({k:1e9,id:kind+'-hit',n:<path className="iso-hit" d={`M${cx-R*k*2.2} ${cy}L${cx+R*k*2.2} ${cy}L${fx+R*k*2.6} ${fy}L${fx-R*k*2.6} ${fy}Z`} data-guess-hit={kind}
   role="button" aria-label={`Guess: the ${kind} ball bounces higher`} onPointerDown={e=>{e.stopPropagation();onGuess(kind);}}/>});
 }
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

function staticItems(P:Projection,L:Layout):Item[]{
 const PL=L.plate,out:Item[]=[...basePlate('plate',PL,P,{h:9,feet:7,inset:16})];
 out.push(rulerStrip('ruler',PL.x+22,PL.x+PL.w-22,PL.y+PL.d-13,0,P,{d:7,step:4,every:5}));
 out.push(labelPlate('label',{x:-24,y:PL.y+PL.d-34,w:48,d:12,r:1.5},0,P));
 // Gantry: two uprights on foot plates, the beam with its bolts.
 for(const x of [-L.up,L.up]){out.push({k:depthOf([x,Y,60],P),id:'up'+x,n:<g>
  <Solid paths={slabOf({x:x-11,y:Y-11,w:22,d:22,r:2},0,3,P,3,.5)} tone="mid">{[[-7,-7],[7,-7],[-7,7],[7,7]].map(([u,v],i)=><Screw key={i} x={x+u} y={Y+v} z={3} P={P} r={1.2}/>)}</Solid>
  <Solid paths={slabOf({x:x-4.5,y:Y-4.5,w:9,d:9,r:1},3,BEAM-3,P,3)} tone="hi" inner={<>{[50,110,170].map(z=><Line key={z} d={sideSeam({x:x-4.5,y:Y-4.5,w:9,d:9,r:1},z,P,3)} tone="faint"/>)}</>}/>
 </g>});}
 out.push({k:depthOf([0,Y,BEAM],P)+40,id:'beam',n:<Solid paths={slabOf({x:-L.up-8,y:Y-7,w:L.up*2+16,d:14,r:2},BEAM,10,P,4,.6)} tone="mid" inner={<Line d={sideSeam({x:-L.up-8,y:Y-7,w:L.up*2+16,d:14,r:2},BEAM+4,P,4)} tone="faint"/>}>
  {[-L.up,L.up].map(x=><Screw key={x} x={x} y={Y} z={BEAM+10} P={P} r={2}/>)}</Solid>});
 for(const kind of ['futsal','grass'] as Kind[]){
  const x=L.col[kind],rx=x-26,front=RY+5,band=kind==='futsal'?[BALL.futsal.lo,BALL.futsal.hi]:[BALL.grass.lo,BALL.grass.hi];
  // The hard court tile (a square of sports floor) with its engraved name on the front.
  const tile={x:x-30,y:Y-30,w:60,d:60,r:2};
  out.push({k:depthOf([x,Y,0],P)-2,id:kind+'-tile',n:<Solid paths={slabOf(tile,0,TILE,P,3,.5)} tone="hi">
   {[-15,0,15].map(u=><Line key={'a'+u} d={lineOnTop([x+u,Y-30],[x+u,Y+30],TILE,P)} tone="faint"/>)}
   {[-15,0,15].map(v=><Line key={'b'+v} d={lineOnTop([x-30,Y+v],[x+30,Y+v],TILE,P)} tone="faint"/>)}
   <FaceText transform={sideMatrix([x-27,Y+30],TILE-.8,P,'left')} size={2.6} tone="mid">{kind==='futsal'?'FUTSAL BALL':'GRASS BALL'}</FaceText>
  </Solid>});
  // The ruler post: a bar with a tick every 10 cm on its front face, long every 50 cm, and the Law's band.
  const ticks:string[]=[],major:string[]=[];
  for(let cm=0;cm<=200;cm+=10){const z=TILE+cm*U/100,big=cm%50===0;(big?major:ticks).push(segment([rx,front,z],[rx+(big?7:4),front,z],P));}
  const b0=TILE+band[0]*U/100,b1=TILE+band[1]*U/100;
  out.push({k:depthOf([rx,RY,0],P),id:kind+'-ruler',n:<g>
   <Solid paths={slabOf({x:rx-8,y:RY-8,w:22,d:16,r:2},0,3,P,3,.4)} tone="mid"/>
   <Solid paths={slabOf({x:rx,y:RY-5,w:10,d:10,r:.6},3,TILE+2*U+8-3,P,2)} tone="hi">
    <path d={[segment([rx+.2,front,b0],[rx+9.8,front,b0],P),segment([rx+9.8,front,b0],[rx+9.8,front,b1],P),segment([rx+9.8,front,b1],[rx+.2,front,b1],P)].join('')}
     fill="none" className="iso-line" data-tone="mid"/>
    <path d={(()=>{const a=iso([rx,front,b0],P),bq=iso([rx+10,front,b0],P),c=iso([rx+10,front,b1],P),d=iso([rx,front,b1],P);return `M${a}L${bq}L${c}L${d}Z`;})()}
     style={{fill:kind==='futsal'?'var(--acc)':'var(--anatomy-mid)',opacity:kind==='futsal'?.38:.22}}/>
    <Line d={ticks.join('')} tone="lo"/><Line d={major.join('')} tone="hi"/>
   </Solid>
   <Solid paths={cylinder(rx+5,RY,4,TILE+2*U+8,3,P,20,.4)} tone="mid"/>
  </g>});
  // The claw: a housing under the beam.
  const jz=TILE+2*U+R-7;
  out.push({k:depthOf([x,Y,BEAM],P)+41,id:kind+'-claw',n:<g>
   <Solid paths={slabOf({x:x-14,y:Y-8,w:28,d:16,r:2},BEAM-8,8,P,3,.5)} tone="mid"><Screw x={x-9} y={Y} z={BEAM} P={P} r={1}/><Screw x={x+9} y={Y} z={BEAM} P={P} r={1}/></Solid>
   <Line d={segment([x,Y+8,BEAM-4],[x,Y+8,jz+20],P)} tone="faint"/>
  </g>});
 }
 return out;
}
