'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,depthOf,iso,lineOnTop,pathOf,ring,sideMatrix,slabOf,type Plan,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {BallPart,Line,Peg,Solid,basePlate,fit,goalFrame,painted,rulerStrip,shift,type Item} from '../anatomy/paper-kit';
import {MID,POST_A,POST_B,PASS_DELAY,type Chance,type Play,type V} from './model';

/**
 * wwc-1991 · SCORE AKERS'S WINNER on a table-top pitch, drawn with the anatomy kit in the Paper theme (Oct 12 2026). The 1991
 * final, minute 78, 1–1: Norway's goal with its net and the box lines on a heavy board; Norway's keeper and defender are dark pegs,
 * Michelle Akers the lit peg in an accent ring. The back pass to come is a dashed accent line to a ring; the run you draw is a
 * solid accent line; after the play the ball's path is dotted. A scoreboard behind the goal keeps the score and the minute.
 * 10 world units = 1 m.
 */
export type FinalApi={draw():void;proj():Projection|null};
const M=10,PLATE:Plan={x:-34,y:-30,w:188,d:164,r:12};

export const Final=forwardRef<FinalApi,{w:number;h:number;top:number;bottom:number;src:{play:{current:Play|null};run:{current:V[]};cursor:{current:V|null}};chance:Chance}>(function Final({w,h,top,bottom,src,chance:chance0},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const tall=w/Math.max(1,h-top)<1.1;
 const P=useMemo(()=>w&&h?fit([[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[-26,30,44],[-26,80,44],[0,POST_A*M,26]],w,h,
  {pad:w<600?2:22,top,bottom,azimuth:tall?24:60,elevation:tall?54:32}):null,[w,h,top,bottom,tall]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P}),[P]);
 const stat=useMemo(()=>P?staticItems(P):[],[P]);
 if(!P)return null;
 const p=src.play.current,run=src.run.current,cursor=src.cursor.current,c=p?.chance??chance0,score:[number,number]=[p?.done&&p.outcome==='goal'?2:1,1],items:Item[]=[...stat];
 const k=p?p.keeper:c.keeper,d=p?p.def:c.def,a=p?p.akers:c.akers;
 items.push({k:depthOf([-26,55,0],P)+1,id:'score',n:<g transform={sideMatrix([-25.9,76],34,P,'right')}><FaceText transform="translate(0 0)" size={5.2} tone="hi">{`USA ${score[0]}–${score[1]} NOR`}</FaceText>
  <FaceText transform="translate(0 7.4)" size={3.6} tone="mid">{p?'78:30':'78:00'}</FaceText></g>});
 const kDown=!!p&&(p.kState==='dive'||p.kState==='down');
 items.push({k:depthOf([k.x*M,k.y*M,0],P),id:'keeper',n:<g transform={shift(P,[k.x*M,k.y*M,0])} data-peg="keeper"><Peg P={P} look="dark" lying={kDown?((p!.ball.y<k.y)?-Math.PI/2:Math.PI/2):null}/></g>});
 items.push({k:depthOf([d.x*M,d.y*M,0],P),id:'def',n:<g transform={shift(P,[d.x*M,d.y*M,0])} data-peg="defender"><Peg P={P} look="dark"/></g>});
 const cheer=p?.outcome==='goal'&&p.done;
 items.push({k:depthOf([a.x*M,a.y*M,0],P),id:'akers',n:<g transform={shift(P,[a.x*M,a.y*M,0])} data-peg="akers"><Peg P={P} look="lit" band="var(--acc)" ring lift={cheer?3:0}/></g>});
 const ball=p?(p.keeperHas?{x:k.x+.25,y:k.y+.2,z:1}:p.ball):{x:c.def.x+.3,y:c.def.y+.2,z:0};
 items.push({k:depthOf([ball.x*M,ball.y*M,0],P)+.3,id:'ball',n:<g transform={shift(P,[ball.x*M,ball.y*M,0])} data-ball><BallPart P={P} r={2.6} lift={ball.z*M}/></g>});
 // Markers on the grass: the back pass to come, your run, the cursor, the ball's path after the play.
 if(!p){const a0=iso([c.def.x*M,c.def.y*M,.2],P),a1=iso([c.to.x*M,c.to.y*M,.2],P);
  items.push({k:-4e5,id:'pass',n:<g data-pass><path d={`M${a0[0]} ${a0[1]}L${a1[0]} ${a1[1]}`} stroke="var(--acc)" strokeWidth={2} strokeDasharray="7 6" strokeLinecap="round" fill="none"/>
   <path d={ring(c.to.x*M,c.to.y*M,5,.2,P,32)} fill="none" stroke="var(--acc)" strokeWidth={1.6}/></g>});}
 if(run.length>1)items.push({k:-3e5,id:'run',n:<path data-run d={pathOf(run.map(q=>iso([q.x*M,q.y*M,.2],P)))} fill="none" stroke="var(--acc)" strokeWidth={p?2:3.4} strokeLinecap="round" strokeLinejoin="round" opacity={p?.55:1}/>});
 if(p&&p.trail.length>1)items.push({k:-2e5,id:'trail',n:<path d={pathOf(p.trail.map(q=>iso([q.x*M,q.y*M,.2],P)))} className="iso-line" data-tone="hi" data-dotted=""/>});
 if(cursor)items.push({k:1e8,id:'cursor',n:<path d={ring(cursor.x*M,cursor.y*M,5,.2,P,32)} fill="none" stroke="var(--anatomy-hi)" strokeWidth={2} strokeDasharray="4 4"/>});
 void PASS_DELAY;
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

function staticItems(P:Projection):Item[]{
 const out:Item[]=[...basePlate('board',PLATE,P,{h:10,feet:8,inset:18})];
 const g={x:PLATE.x+5,y:PLATE.y+5,w:PLATE.w-10,d:PLATE.d-10};
 const stripes:string[]=[];for(let x=g.x+15;x<g.x+g.w-1;x+=20)stripes.push(lineOnTop([x,g.y],[x,g.y+g.d],0,P));
 out.push({k:-1e6,id:'stripes',n:<Line d={stripes.join('')} tone="faint"/>});
 out.push(rulerStrip('ruler',PLATE.x+24,PLATE.x+PLATE.w-24,PLATE.y+PLATE.d-14,0,P,{d:6,step:5,every:2}));
 const y0=g.y,y1=g.y+g.d,yc=(v:number)=>Math.max(y0,Math.min(y1,v)),L=(pts:[number,number][])=>pathOf(pts.map(([x,y])=>iso([x,y,0],P)));
 const marks=[L([[0,y0],[0,y1]]),L([[0,yc((POST_A-5.5)*M)],[55,yc((POST_A-5.5)*M)],[55,yc((POST_B+5.5)*M)],[0,yc((POST_B+5.5)*M)]]),
  L([[0,yc((POST_A-12.8)*M)],[g.x+g.w>165?165:g.x+g.w,yc((POST_A-12.8)*M)]]),L([[0,yc((POST_B+12.8)*M)],[165>g.x+g.w?g.x+g.w:165,yc((POST_B+12.8)*M)]]),
  L(Array.from({length:17},(_,i)=>{const t=-0.93+1.86*i/16;return [110+Math.cos(t)*91.5,MID*M+Math.sin(t)*91.5] as [number,number];}).filter(([x])=>x>=165).map(([x,y])=>[Math.min(x,g.x+g.w),y] as [number,number]))];
 out.push({k:-9e5,id:'lines',n:<g><path d={marks.join('')} fill="none" stroke="var(--anatomy-paper)" strokeWidth={4} strokeLinejoin="round"/>
  <path d={marks.join('')} className="iso-line" data-tone="mid" style={{strokeWidth:1}}/>
  <Solid paths={cylinder(110,MID*M,1.6,0,.3,P,16)} tone="mid"/></g>});
 const gf=goalFrame('goal',0,POST_A*M,POST_B*M,P,{gh:24.4,dm:14,era:'today',r:1});out.push(...gf.back,...gf.front);
 // The scoreboard behind the goal on two legs, facing the play (its figures are drawn live).
 out.push({k:depthOf([-26,55,0],P),id:'board',n:<g>
  {[34,76].map(y=><Solid key={y} paths={cylinder(-28,y,1.6,0,24,P,14)} tone="mid"/>)}
  <Solid paths={slabOf({x:-30,y:30,w:4,d:50,r:1},24,16,P,3,.6)} tone="hi"/>
 </g>});
 return out;
}
