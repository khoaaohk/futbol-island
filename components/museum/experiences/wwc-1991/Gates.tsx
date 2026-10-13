'use client';
import {forwardRef,useImperativeHandle,useMemo,useReducer} from 'react';
import {cylinder,depthOf,iso,lineOnTop,pathOf,segment,sideMatrix,slabOf,type Plan,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Ball,Line,Peg,Screw,Solid,basePlate,fit,painted,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {BANS} from './data';
import {GATES,RAIL0,RAIL1,YEAR0,YEAR1,locked,xAtYear,type GateState} from './model';

/**
 * wwc-1991 · OPEN THE GATES, drawn with the anatomy kit in the Paper theme (Oct 12 2026). A stadium wall on a heavy base plate:
 * brick piers with a coping, four gateways (England, Brazil, West Germany and the World Cup gate), each with a lintel and an
 * engraved sign, a barrier boom on a post with a signal lamp and, while it is banned, a padlock. A player waits at each country's
 * gate and walks through to the pitch behind when it opens. In front, the year rail: a ruled slide from 1920 to 1991 (a tick a
 * year, long every ten, the years of each ban inlaid in the accent) and the slider you drag. The accent marks the bans.
 * 10 world units = 1 m (the model's metres × 10).
 */
export type GatesApi={draw():void;proj():Projection|null};
const M=10,PLATE:Plan={x:-30,y:-96,w:192,d:166,r:12},WALL_H=24,RAIL_Y=46,RAIL_Z=4;

export const Gates=forwardRef<GatesApi,{w:number;h:number;top:number;bottom:number;g:GateState}>(function Gates({w,h,top,bottom,g},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const tall=w/Math.max(1,h-top)<1.1;
 const P=useMemo(()=>w&&h?fit([[PLATE.x,PLATE.y,-16],[PLATE.x+PLATE.w,PLATE.y,-16],[PLATE.x,PLATE.y+PLATE.d,-16],[PLATE.x+PLATE.w,PLATE.y+PLATE.d,-16],[0,0,WALL_H+12],[150,0,WALL_H+12]],w,h,
  {pad:w<600?2:22,top,bottom,azimuth:tall?72:68,elevation:tall?50:32}):null,[w,h,top,bottom,tall]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P}),[P]);
 const stat=useMemo(()=>P?staticItems(P):[],[P]);
 if(!P)return null;
 const items:Item[]=[...stat],k=scaleOf(P);
 for(const gt of GATES){const lockedNow=locked(gt.id,g.year),o=g.open[gt.id],hx=(gt.x+.25)*M,y=8,pz=10;
  // the boom: a round bar from the pivot on the post, lifting as the gate opens
  const L=(gt.w-.55)*M,ang=o*Math.PI*.44,a=iso([hx+1.5,y,pz],P),b=iso([hx+1.5+Math.cos(ang)*L,y,pz+Math.sin(ang)*L],P);
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,stripes:string[]=[];
  for(let i=1;i<6;i++){const f=i/6;stripes.push(`M${a[0]+dx*f-dy/len*1.6*k} ${a[1]+dy*f+dx/len*1.6*k}L${a[0]+dx*f+dy/len*1.6*k} ${a[1]+dy*f-dx/len*1.6*k}`);}
  items.push({k:depthOf([gt.x*M+gt.w*M/2,y,pz],P)+2,id:gt.id+'-boom',n:<g data-gate={gt.id} data-open={o.toFixed(2)} data-locked={lockedNow||undefined}>
   <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke="var(--anatomy-hi)" strokeWidth={3.4*k+1.6} strokeLinecap="round"/>
   <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} stroke="var(--anatomy-paper)" strokeWidth={3.4*k} strokeLinecap="round"/>
   <path d={stripes.join('')} stroke={lockedNow?'var(--acc)':'var(--anatomy-lo)'} strokeWidth={1.4} fill="none"/>
   {lockedNow&&o<.5&&(()=>{const m=iso([hx+1.5+L*.5,y+1,pz-1.5],P);return <g data-padlock>
    <path d={`M${m[0]-2.2*k} ${m[1]}V${m[1]-3.2*k}a${2.2*k} ${2.2*k} 0 0 1 ${4.4*k} 0V${m[1]}`} fill="none" className="iso-line" data-tone="hi" style={{strokeWidth:1.4}}/>
    <rect x={m[0]-3.4*k} y={m[1]} width={6.8*k} height={5.4*k} rx={1} className="dark" fill="#5c5c5e" stroke="#232325" strokeWidth={.8}/>
    <circle cx={m[0]} cy={m[1]+2.4*k} r={.8*k} fill="#232325"/></g>;})()}
  </g>});
  // the signal lamp on the post: accent while banned
  const lp=iso([hx,y,pz+4.4],P);
  items.push({k:depthOf([hx,y,pz],P)+3,id:gt.id+'-lamp',n:<Ball cx={lp[0]} cy={lp[1]} r={2.2*k} look={lockedNow?'acc':'paper'} seams={false}/>});
  // the player waiting at the gate walks through to the pitch when it opens
  if(gt.id!=='FIFA'){const wk=g.walk[gt.id],px=(gt.x+gt.w/2+.4)*M,py=(2.2+(-7.4-2.2)*wk)*M;
   items.push({k:depthOf([px,py,0],P),id:gt.id+'-peg',n:<g transform={shift(P,[px,py,0])} data-walker={gt.id}><Peg P={P} look={wk>.02&&wk<.98?'lit':'paper'} lift={wk>=.98?2:0}/></g>});}
 }
 if(g.year>=1991){const o=g.open.FIFA;
  for(let i=0;i<12;i++){const fx=(8.8+(i%6)*.9)*M,fy=(-3.4-Math.floor(i/6)*1.6)*M;items.push({k:depthOf([fx,fy,0],P),id:'team'+i,n:<g opacity={Math.min(1,o*1.2)}>{pennant(fx,fy,P)}</g>});}
  const py=-1.8*o*M;items.push({k:depthOf([117,py,0],P),id:'wwc-peg',n:<g transform={shift(P,[117,py,0])}><Peg P={P} look="lit" band="var(--acc)" lift={2}/></g>});}
 // the slider: a carriage on the rail with a stem and a ball knob, and the year board's figures
 const kx=xAtYear(g.year)*M;
 items.push({k:depthOf([kx,RAIL_Y,RAIL_Z],P)+20,id:'slider',n:<g transform={shift(P,[kx,0,0])} data-slider={g.year}>
  <Solid paths={slabOf({x:-4,y:RAIL_Y-5.5,w:8,d:11,r:1.4},RAIL_Z,4,P,3,.5)} tone="hi" lit><Screw x={-2} y={RAIL_Y+3.6} z={RAIL_Z+4} P={P} r={.7}/><Screw x={2} y={RAIL_Y+3.6} z={RAIL_Z+4} P={P} r={.7}/></Solid>
  <Solid paths={cylinder(0,RAIL_Y,1,RAIL_Z+4,9,P,14)} tone="hi"/>
  {(()=>{const [cx,cy]=iso([0,RAIL_Y,RAIL_Z+15.6],P);return <Ball cx={cx} cy={cy} r={3*k} look="acc" seams={false}/>;})()}
 </g>});
 items.push({k:depthOf([150,30,0],P)+5,id:'yearfig',n:<g transform={sideMatrix([139.6,24.2],7.4,P,'left')}><FaceText transform="translate(0 0)" size={6} tone="hi">{String(g.year)}</FaceText></g>});
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">{painted(items)}</svg>;
});

function pennant(x:number,y:number,P:Projection){
 return <g><Solid paths={cylinder(x,y,.5,0,14,P,10)} tone="hi"/><path d={pathOf([iso([x,y,13.6],P),iso([x+4.6,y+.4,11.8],P),iso([x,y,10],P)],true)} className="iso-acc-fill" stroke="var(--acc-e)" strokeWidth={.6}/></g>;
}

function staticItems(P:Projection):Item[]{
 const out:Item[]=[...basePlate('plate',PLATE,P,{h:10,feet:8,inset:18})];
 // Behind the wall: the pitch, mown in stripes, edge to edge inside the groove.
 const stripes:string[]=[];for(let y=PLATE.y+15;y<-4;y+=10)stripes.push(lineOnTop([PLATE.x+5,y],[PLATE.x+PLATE.w-5,y],0,P));
 out.push({k:-1e6,id:'stripes',n:<Line d={stripes.join('')} tone="faint"/>});
 // In front: the concourse paving, a slab a metre.
 const pave:string[]=[];for(let x=PLATE.x+10;x<PLATE.x+PLATE.w-5;x+=10)pave.push(lineOnTop([x,8],[x,PLATE.y+PLATE.d-5],0,P));
 for(let y=18;y<PLATE.y+PLATE.d-5;y+=10)pave.push(lineOnTop([PLATE.x+5,y],[PLATE.x+PLATE.w-5,y],0,P));
 out.push({k:-1e6+1,id:'pave',n:<Line d={pave.join('')} tone="faint"/>});
 // The wall: brick piers between the gateways, mortar courses on the front face, a coping on top.
 let x0=-16;const piers:[number,number][]=[];for(const gt of GATES){piers.push([x0,gt.x*M]);x0=(gt.x+gt.w)*M;}piers.push([x0,150]);
 for(const [a,b] of piers){if(b-a<=0)continue;const pl={x:a,y:0,w:b-a,d:6,r:.4};
  const courses:string[]=[];for(let z=3;z<WALL_H;z+=3)courses.push(segment([a,6,z],[b,6,z],P));
  for(let z=0,row=0;z<WALL_H;z+=3,row++)for(let x=a+(row%2?3:6);x<b-.5;x+=6)courses.push(segment([x,6,z],[x,6,Math.min(WALL_H,z+3)],P));
  out.push({k:depthOf([(a+b)/2,3,0],P),id:'pier'+a,n:<g><Solid paths={slabOf(pl,0,WALL_H,P,2)} tone="mid" inner={<Line d={courses.join('')} tone="faint"/>}/>
   <Solid paths={slabOf({x:a-.6,y:-.6,w:b-a+1.2,d:7.2,r:.6},WALL_H,2,P,2,.3)} tone="hi"/></g>});}
 for(const gt of GATES){const gx=gt.x*M,gw=gt.w*M,hx=gx+2.5,y=8;
  out.push({k:depthOf([gx+gw/2,3,WALL_H],P)+.5,id:gt.id+'-lintel',n:<g>
   <Solid paths={slabOf({x:gx,y:0,w:gw,d:6,r:.4},WALL_H-4,4,P,2)} tone="mid"/>
   <Solid paths={slabOf({x:gx-.6,y:-.6,w:gw+1.2,d:7.2,r:.6},WALL_H,2,P,2,.3)} tone="hi"/>
   <Solid paths={slabOf({x:gx+3,y:6,w:gw-6,d:1.2,r:.3},WALL_H-3.4,3,P,2)} tone="hi">
    <g transform={sideMatrix([gx+4.4,7.2],WALL_H-2.2,P,'left')}><FaceText transform="translate(0 0)" size={2} tone="hi">{gt.id==='FIFA'?'WORLD CUP':gt.id==='ENG'?'ENGLAND':gt.id==='BRA'?'BRAZIL':'W. GERMANY'}</FaceText></g>
   </Solid></g>});
  // the barrier's post and the rest the boom drops onto
  out.push({k:depthOf([hx,y,0],P)+1,id:gt.id+'-post',n:<g>
   <Solid paths={slabOf({x:hx-3,y:y-3,w:6,d:6,r:.8},0,1.4,P,2,.3)} tone="mid"/>
   <Solid paths={slabOf({x:hx-1.6,y:y-1.6,w:3.2,d:3.2,r:.5},1.4,10.4,P,2)} tone="hi"/>
   <Solid paths={cylinder(hx,y,1.8,11.8,1.2,P,16)} tone="mid"/>
  </g>});
  const rx=gx+gw-2;out.push({k:depthOf([rx,y,0],P)+1,id:gt.id+'-rest',n:<g><Solid paths={cylinder(rx,y,.9,0,9.2,P,12)} tone="hi"/><Solid paths={slabOf({x:rx-1.6,y:y-1.2,w:3.2,d:2.4,r:.4},9.2,.9,P,2)} tone="mid"/></g>});
 }
 // The year rail: a ruled slide, a tick a year (long every ten), the bans inlaid in the accent, decades engraved on its face.
 const rx0=(RAIL0-.5)*M,rx1=(RAIL1+.5)*M,rail={x:rx0,y:RAIL_Y-4,w:rx1-rx0,d:8,r:1.2};
 const minor:string[]=[],major:string[]=[];
 for(let y=YEAR0;y<=YEAR1;y++){const x=xAtYear(y)*M,big=y%10===0;(big?major:minor).push(lineOnTop([x,RAIL_Y+4],[x,RAIL_Y+4-(big?3.2:1.6)],RAIL_Z,P));}
 const bans=BANS.map((b,i)=>{const yy=RAIL_Y-3.2+i*1.4;return pathOf([iso([xAtYear(b.from)*M,yy,RAIL_Z],P),iso([xAtYear(b.to)*M,yy,RAIL_Z],P)]);});
 out.push({k:depthOf([(rx0+rx1)/2,RAIL_Y,0],P),id:'rail',n:<g>
  {[rx0+4,(rx0+rx1)/2,rx1-4].map(x=><Solid key={x} paths={slabOf({x:x-4,y:RAIL_Y-6,w:8,d:12,r:1},0,1,P,2,.3)} tone="mid"/>)}
  <Solid paths={slabOf(rail,1,RAIL_Z-1,P,3,.4)} tone="hi">
   <Line d={minor.join('')} tone="lo"/><Line d={major.join('')} tone="hi"/>
   <path d={bans.join('')} stroke="var(--acc)" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={.9}/>
   {[1920,1930,1940,1950,1960,1970,1980,1990].map(y=><g key={y} transform={sideMatrix([xAtYear(y)*M-3.4,RAIL_Y+4],RAIL_Z-.6,P,'left')}><FaceText transform="translate(0 0)" size={1.9} tone="mid">{String(y)}</FaceText></g>)}
  </Solid></g>});
 // The year board at the right end: a box with a window; its figures are drawn live.
 out.push({k:depthOf([150,30,0],P),id:'board',n:<g>
  <Solid paths={slabOf({x:136,y:14,w:22,d:10,r:1.2},0,20,P,3,.6)} tone="mid"/>
  <Solid paths={slabOf({x:137.4,y:23.4,w:19.2,d:.8,r:.3},4,12,P,2)} tone="hi" lit/>
 </g>});
 return out;
}
