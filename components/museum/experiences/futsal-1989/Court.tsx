'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {depthOf,iso,lineOnTop,pathOf,ring,type Plan,type Projection} from '../anatomy/iso-kit';
import {BallPart,Line,Peg,basePlate,dialGauge,fit,goalFrame,painted,rulerStrip,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {CONTROL,ROUND_S,aim,soleOut,type Rondo} from './model';

/**
 * futsal-1989 · THE RONDO on a table-top futsal court, drawn with the anatomy kit in the Paper theme (Oct 12 2026). A heavy board
 * on feet carries the court's lines (the goal line and touch line, the 6 m arcs of the penalty area, the half-way line and the
 * centre circle), the goal with its net, Brazil's pegs (paper; the one with the ball stands lit in an accent ring) and the two
 * Dutch defenders (dark). The ball is the accent when it is the futsal ball. Drag from the ball: an arrow on the floor shows the
 * pass (accent when it can be trapped, dashed dark when it is too hard for this ball). 10 world units = 1 m.
 */
export type CourtApi={draw():void;proj():Projection|null};
const M=10,PLATE:Plan={x:-44,y:-30,w:180,d:144,r:12};

export const Court=forwardRef<CourtApi,{w:number;h:number;top:number;bottom:number;r:Rondo;aimRef:{current:{x:number;y:number;power:number}|null}}>(function Court({w,h,top,bottom,r,aimRef},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const P=useMemo(()=>w&&h?fit([[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[-20,25,22],[-20,55,22]],w,h,
  {pad:w<600?4:22,top,bottom,azimuth:w/Math.max(1,h-top)>1.1?66:24,elevation:w/Math.max(1,h-top)>1.1?34:54}):null,[w,h,top,bottom]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P}),[P]);
 const stat=useMemo(()=>P?staticItems(P):[],[P]);
 if(!P)return null;
 const items:Item[]=[...stat],k=scaleOf(P),futsal=r.kind==='futsal',aimV=aimRef.current,clockF=r.reduced?0:1-r.clock/ROUND_S;
 items.push({k:depthOf([120,-14,0],P)+30,id:'needle',n:<path d={lineOnTop([120,-14],[120+Math.sin(clockF*Math.PI*2)*10,-14-Math.cos(clockF*Math.PI*2)*10],5.3,P)} className="iso-line" data-tone="lit" style={{strokeWidth:1.6}}/>});
 items.push({k:depthOf([-14,40,0],P),id:'keeper',n:<g transform={shift(P,[-14,40,0])}><Peg P={P} look="paper" band="var(--acc)"/></g>});
 r.mates.forEach((m,i)=>{const has=r.state==='hold'&&i===r.holder;
  items.push({k:depthOf([m.x*M,m.y*M,0],P),id:'mate'+i,n:<g transform={shift(P,[m.x*M,m.y*M,0])} data-mate={i} data-holder={has||undefined}><Peg P={P} look={has?'lit':'paper'} band="var(--acc)" ring={has}/></g>});});
 r.defs.forEach((d,i)=>items.push({k:depthOf([d.x*M,d.y*M,0],P),id:'def'+i,n:<g transform={shift(P,[d.x*M,d.y*M,0])} data-def={i}><Peg P={P} look="dark"/></g>}));
 const b=r.ball;
 items.push({k:depthOf([b.x*M,b.y*M,0],P)+.3,id:'ball',n:<g transform={shift(P,[b.x*M,b.y*M,0])} data-ball><BallPart P={P} r={2.6} lift={b.z*M} look={futsal?'acc':'paper'}/></g>});
 if(r.trail.length>1&&r.state!=='hold')items.push({k:-5e5,id:'trail',n:<path d={pathOf(r.trail.map(p=>iso([p.x*M,p.y*M,0],P)))} className="iso-line" data-tone="mid" data-dotted=""/>});
 if(aimV&&r.state==='hold'){const h0=r.mates[r.holder],a=aim(r,aimV.x,aimV.y),len=(1.2+aimV.power/12*4.2)*M,hard=soleOut(r.kind,aimV.power)>CONTROL;
  const p0=iso([h0.x*M,h0.y*M,.2],P),p1=iso([h0.x*M+a.x*len,h0.y*M+a.y*len,.2],P),ang=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]),hl=9;
  const head=`M${p1[0]+Math.cos(ang+2.6)*hl} ${p1[1]+Math.sin(ang+2.6)*hl}L${p1[0]} ${p1[1]}L${p1[0]+Math.cos(ang-2.6)*hl} ${p1[1]+Math.sin(ang-2.6)*hl}`;
  items.push({k:1e8,id:'aim',n:<g data-aim={hard?'hard':'ok'}>
   <path d={`M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}${head}`} fill="none" stroke={hard?'var(--anatomy-hi)':'var(--acc)'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={hard?'6 6':undefined}/>
   {a.mate>=0&&<path d={ring(r.mates[a.mate].x*M,r.mates[a.mate].y*M,9,.2,P,40)} fill="none" stroke={hard?'var(--anatomy-hi)':'var(--acc)'} strokeWidth={2} strokeDasharray={hard?'5 5':undefined}/>}
  </g>});}
 void k;
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

function staticItems(P:Projection):Item[]{
 const out:Item[]=[...basePlate('board',PLATE,P,{h:10,feet:8,inset:18})];
 const g={x:PLATE.x+5,y:PLATE.y+5,w:PLATE.w-10,d:PLATE.d-10};
 // parquet: planks every 0.5 m across, engraved edge to edge inside the groove
 const planks:string[]=[];for(let y=g.y+6;y<g.y+g.d-1;y+=6)planks.push(lineOnTop([g.x,y],[g.x+g.w,y],0,P));
 out.push({k:-1e6,id:'planks',n:<Line d={planks.join('')} tone="faint"/>});
 out.push(rulerStrip('ruler',PLATE.x+24,PLATE.x+PLATE.w-24,PLATE.y+PLATE.d-14,0,P,{d:6,step:5,every:2}));
 const L=(pts:[number,number][])=>pathOf(pts.map(([x,y])=>iso([x*M,y*M,0],P)));
 const arc=(cx:number,cy:number,rr:number,a0:number,a1:number,n=18)=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr] as [number,number];});
 const marks=[L([[-2,-1.6],[-2,9.6]]),L([[-2,-1.6],[12.6,-1.6]]),L([[11.4,-1.6],[11.4,9.6]]),L(arc(11.4,4,3,Math.PI/2,Math.PI*1.5)),
  L([...arc(-2,2.6,6,-Math.PI/2,0,24),...arc(-2,5.4,6,0,Math.PI/2,24)].filter(([,y])=>y>=-1.6&&y<=9.6)),L([[4,4],[4.01,4]])];
 out.push({k:-9e5,id:'lines',n:<g><path d={marks.join('')} fill="none" stroke="var(--anatomy-paper)" strokeWidth={4} strokeLinejoin="round"/>
  <path d={marks.join('')} className="iso-line" data-tone="mid" style={{strokeWidth:1}}/></g>});
 const gf=goalFrame('goal',-2*M,2.5*M,5.5*M,P,{gh:20,dm:10,era:'today',r:.9});out.push(...gf.back,...gf.front);
 out.push(dialGauge('clock',120,-14,0,12,P));
 return out;
}
