'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,depthOf,iso,lineOnTop,pathOf,segment,sideMatrix,slabOf,type Plan,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {BallPart,Line,Peg,Solid,basePlate,dialGauge,fit,goalFrame,needleD,painted,rulerStrip,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {actorsAt,ballAt} from './film';
import {FILMS,MID,POST_A,POST_B,type MatchView} from './model';

/**
 * laws-1863 · REF THE MATCH on a table-top pitch, drawn with the anatomy kit in the Paper theme (Oct 12 2026). A heavy board on
 * feet; under the Laws of 1863 it carries only two bare posts with flags (no bar, no net, no lines) and two boundary flags;
 * under today's Laws the goal with its crossbar and net, the goal line, touch line, boxes and the spot. The pegs (table-football
 * figures) play the moment's film; the rulebook placard behind the goal says which Laws you are refereeing; the stopwatch on
 * the corner counts the call down. 10 world units = 1 m.
 */
export type PitchApi={draw():void};
const M=10,PLATE:Plan={x:-44,y:-36,w:220,d:186,r:12};
const RED='var(--acc)',BLUE='#2a5bd7';

export const Pitch=forwardRef<PitchApi,{w:number;h:number;view:MatchView;top:number;bottom:number}>(function Pitch({w,h,view,top,bottom},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);useImperativeHandle(ref,()=>({draw:()=>bump()}),[]);
 const P=useMemo(()=>w&&h?fit([[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[0,0,31],[-30,96,54],[-30,136,54],[-14,POST_A*M,26]],w,h,
  {pad:w<600?4:24,top,bottom,...(w/Math.max(1,h-top)<1.1?{azimuth:22,elevation:54}:{azimuth:42})}):null,[w,h,top,bottom]);
 const old=view.era==='1863';
 const stat=useMemo(()=>P?staticItems(P,old):[],[P,old]);
 if(!P)return null;
 const f=FILMS[view.event.id],t=view.t,items:Item[]=[...stat],k=scaleOf(P);
 // The stopwatch needle: the share of the call's time used.
 const used=view.fuse==null?0:1-view.fuse;
 items.push({k:depthOf([150,-14,0],P)+30,id:'needle',n:<path d={needleD(150,-14,5,15,used,P)} className="iso-line" data-tone="lit" style={{strokeWidth:1.6}}/>});
 for(const a of actorsAt(f.actors,t)){
  const keeper=a.id==='k',look=keeper&&!old?'dark':'paper',band=a.kit==='red'?RED:BLUE;
  const lying=a.pose==='dive'?(a.flip?Math.PI/2:-Math.PI/2):null,lift=a.pose==='cheer'?3:0;
  items.push({k:depthOf([a.x*M,a.y*M,0],P),id:'p-'+a.id,n:<g transform={shift(P,[a.x*M,a.y*M,a.z*M])} data-peg={a.id}><Peg P={P} look={look} band={band} lying={lying} lift={lift}/></g>});
 }
 const b=ballAt(f.ball,t);
 items.push({k:depthOf([b.x*M,b.y*M,0],P)+.2,id:'ball',n:<g transform={shift(P,[b.x*M,b.y*M,0])} data-ball><BallPart P={P} r={3.2} lift={b.z*M}/></g>});
 if(f.star&&t>=f.star.t&&t<=f.star.t+.5){const [sx,sy]=iso([f.star.x*M,f.star.y*M,f.star.z*M+8],P),o=1-(t-f.star.t)/.5,r0=5*k,r1=(10+8*(1-o))*k;
  items.push({k:1e6,id:'star',n:<g opacity={o}>{Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return <path key={i} d={`M${sx+Math.cos(a)*r0} ${sy+Math.sin(a)*r0}L${sx+Math.cos(a)*r1} ${sy+Math.sin(a)*r1}`} stroke="var(--acc)" strokeWidth={2.2} strokeLinecap="round"/>;})}</g>});}
 if(f.boot&&t>=f.boot.t){const bx=f.boot.x*M,by=f.boot.y*M;
  items.push({k:1e6+1,id:'boot',n:<g data-boot><Solid paths={slabOf({x:bx-6,y:by-2.6,w:12,d:5.2,r:2.2},26,2.4,P,4)} tone="hi" className="dark"/>
   {[-3.6,-1.2,1.2,3.6].map(u=><Solid key={u} paths={cylinder(bx+u,by,.7,23.4,2.6,P,10)} tone="hi"/>)}</g>});}
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

function staticItems(P:Projection,old:boolean):Item[]{
 const out:Item[]=[...basePlate('board',PLATE,P,{h:10,feet:8,inset:18})];
 // Mowing stripes, engraved every 2 m, edge to edge inside the groove.
 const g={x:PLATE.x+5,y:PLATE.y+5,w:PLATE.w-10,d:PLATE.d-10};const stripes:string[]=[];
 for(let x=g.x+20;x<g.x+g.w-1;x+=20)stripes.push(lineOnTop([x,g.y],[x,g.y+g.d],0,P));
 out.push({k:-1e6,id:'stripes',n:<Line d={stripes.join('')} tone="faint"/>});
 out.push(rulerStrip('ruler',PLATE.x+24,PLATE.x+PLATE.w-24,PLATE.y+PLATE.d-14,0,P,{d:6,step:5,every:2}));
 const y0=g.y,y1=g.y+g.d,x1=g.x+g.w;
 if(!old){
  const L=(pts:[number,number][])=>pathOf(pts.map(([x,y])=>iso([x,y,0],P)));
  const yc=(v:number)=>Math.max(y0,Math.min(y1,v));
  const marks=[L([[0,y0],[0,y1]]),L([[0,0],[x1,0]]),L([[0,yc((POST_A-5.5)*M)],[55,yc((POST_A-5.5)*M)],[55,yc((POST_B+5.5)*M)],[0,yc((POST_B+5.5)*M)]]),
   L([[0,yc((POST_A-12.8)*M)],[165,yc((POST_A-12.8)*M)],[165,yc((POST_B+12.8)*M)]])];
  out.push({k:-9e5,id:'lines',n:<g><path d={marks.join('')} fill="none" stroke="var(--anatomy-paper)" strokeWidth={4} strokeLinejoin="round"/>
   <path d={marks.join('')} className="iso-line" data-tone="mid" style={{strokeWidth:1}}/>
   <Solid paths={cylinder(110,MID*M,1.6,0,.3,P,16)} tone="mid"/></g>});
  out.push({k:depthOf([0,0,0],P),id:'corner',n:flagPole(0,0,P)});
 }else{
  for(const x of [0,160])out.push({k:depthOf([x,-2,0],P),id:'bflag'+x,n:flagPole(x,-2,P)});
 }
 const gf=goalFrame('goal',0,POST_A*M,POST_B*M,P,{gh:24.4,dm:14,era:old?'1863':'today',r:1});
 out.push(...gf.back,...gf.front);
 // The rulebook placard behind the goal, facing the play: which Laws you are refereeing.
 const bx=-30,by0=96,by1=136,bz=26,kb=depthOf([bx,(by0+by1)/2,0],P)-40;
 out.push({k:kb,id:'placard',n:<g>
  {[by0+4,by1-4].map(y=><Solid key={y} paths={cylinder(bx-2,y,1.6,0,bz+2,P,14)} tone="mid"/>)}
  <Solid paths={slabOf({x:bx-4,y:by0,w:4,d:by1-by0,r:1},bz,26,P,3,.6)} tone="hi">
   <g transform={sideMatrix([bx,by1-5],bz+9,P,'right')}><FaceText transform="translate(0 0)" size={old?12.5:9} tone="hi">{old?'1863':'TODAY'}</FaceText></g>
   <Line d={segment([bx,by1-4,bz+5],[bx,by0+4,bz+5],P)} tone="faint"/>
  </Solid></g>});
 out.push(dialGauge('watch',150,-14,0,15,P));
 return out;
}
/** A thin pole with an accent pennant (1863 boundary flags, today's corner flag). */
function flagPole(x:number,y:number,P:Projection){
 return <g><Solid paths={cylinder(x,y,.7,0,30,P,12)} tone="hi"/>
  <path d={pathOf([iso([x,y,29.6],P),iso([x-6,y+.6,27],P),iso([x,y,24.4],P)],true)} className="iso-acc-fill" stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/></g>;
}
