'use client';
import {useMemo,type KeyboardEvent as RKE,type PointerEvent as RPE} from 'react';
import * as k from '../anatomy/iso-kit';
import {frameFor} from '../anatomy/bench';
import {painted} from '../anatomy/paper-kit';
import {BRASS,FELT,WHITE,WOOD_DARK,Engrave,Knob3,Line,Rod,Solid,Tint,benchTop,cyl,dep,dialNode,dirOf,fitRect,fpath,knobNode,knobTop,mix,onTop,pieceNode,ruler,scr,screw,slab,sliderNodes,
 type FPlan,type Frame,type Item,type V2} from './rig';
import {ERA_ANGLES,ERAS,GAUGE_FULL,GK,HOLE,ZONES,type Mode,type Pt,type Reading} from './model';

/**
 * formations-history · THE TACTICS MACHINE (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do
 * something", "like the stadiums ... the breakdown of the layers"). A pegboard tactics table on a wooden bench: a felt pitch in a
 * brass frame, drilled with a hole every 4 m, and eleven turned pegs coloured by the line they stand in. Controls:
 *  - the ERA SELECTOR, a big knurled knob with six detents (2-3-5, WM, 4-2-4, 4-4-2, 4-3-3, 4-2-3-1): the pegs hop out of their
 *    holes and drop into the next shape;
 *  - the WIDTH rail (along the far end) and the DEPTH rail (along the side): sliders that squeeze or stretch the shape;
 *  - three dial gauges, WIDTH, DEPTH and GAP, each with a green zone: the balance needles;
 *  - the LIFT lever: the lines rise on brass trays and guide posts (the breakdown), each tray labelled, then snap back;
 *  - the HISTORY / BUILD switch: in BUILD the pegs are yours to drag (or move with the arrow keys), hole to hole.
 * Two benches: landscape (controls along the front) and portrait (two rows under the pitch).
 */
export const S=2;
export const LIFT_STEP=24;
export type Lay={wide:boolean;F:Frame;up:V2;right:V2;table:FPlan;knob:{a:number;b:number;R:number};dials:{a:number;b:number;R:number}[];
 lever:{a:number;b:number};sw:{a:number;b:number};wrail:{a:number;b:number;len:number};drail:{a:number;b:number;len:number};label:{a:number;b:number};pts:[number,number,number][]};
const box=(a0:number,b0:number,a1:number,b1:number,z0:number,z1:number):[number,number,number][]=>[[a0,b0,z0],[a1,b0,z0],[a0,b1,z0],[a1,b1,z0],[a0,b0,z1],[a1,b0,z1],[a0,b1,z1],[a1,b1,z1]];
export function layoutFor(wide:boolean):Lay{
 if(wide){const F=frameFor('wide',12);return {wide,F,up:[0,-1],right:[1,0],table:{a:-30,b:-58,w:298,d:252,r:10},
  knob:{a:58,b:166,R:18},dials:[{a:116,b:166,R:16},{a:160,b:166,R:16},{a:204,b:166,R:16}],lever:{a:248,b:166},sw:{a:6,b:166},
  wrail:{a:230,b:4,len:120},drail:{a:20,b:-30,len:160},label:{a:244,b:-36},pts:[...box(-30,-58,268,194,-18,0),...box(0,0,200,128,0,LIFT_STEP*3.4)]};}
 const F=frameFor('tall',8);return {wide,F,up:[1,0],right:[0,1],table:{a:-140,b:-14,w:394,d:174,r:10},
  knob:{a:-48,b:64,R:16},dials:[{a:-104,b:24,R:15},{a:-104,b:66,R:15},{a:-104,b:108,R:15}],lever:{a:-46,b:118},sw:{a:-48,b:16},
  wrail:{a:228,b:4,len:120},drail:{a:20,b:146,len:160},label:{a:-134,b:142},pts:[...box(-140,-14,254,160,-18,0),...box(0,0,200,128,0,LIFT_STEP*2.4)]};
}
export const projFor=(L:Lay,w:number,h:number,top:number,bottom:number)=>fitRect(L.F,L.pts,{x:0,y:top,w,h:h-top-bottom},L.wide?14:2,L.wide?32:40);
export const LEVER_LEN=38,LEVER_PIV=-6;
export const leverHandle=(L:Lay,deg:number):[number,number,number]=>{const t=deg*Math.PI/180,s=Math.sin(t)*LEVER_LEN;return [L.lever.a+L.right[0]*s,L.lever.b+L.right[1]*s,LEVER_PIV+Math.cos(t)*LEVER_LEN];};
export const switchHandle=(L:Lay,deg:number):[number,number,number]=>{const t=deg*Math.PI/180,s=Math.sin(t)*15;return [L.sw.a+L.right[0]*s,L.sw.b+L.right[1]*s,4+Math.cos(t)*15];};
/** Line colours: the line a peg stands in is the subject, so it gets a colour (defence blue, midfield gold, attack red). */
const BLUE='#2f5f9f',TEAL='#2c8a7a',GOLD='#d9a521',RED='#c8372d';
export const lineColors=(n:number)=>n<=1?[GOLD]:n===2?[BLUE,RED]:n===3?[BLUE,GOLD,RED]:n===4?[BLUE,TEAL,GOLD,RED]:[BLUE,...Array.from({length:n-2},(_,i)=>i%2?GOLD:TEAL),RED];

export type Ctl='knob'|'width'|'depth'|'lever'|'switch'|`peg${number}`;
export type View={mode:Mode;era:number;knobDeg:number;wT:number;dT:number;lift:number;leverDeg:number;switchDeg:number;pos:Pt[];hop:number;reading:Reading;names:string[];focus:Ctl|null};
type Props={L:Lay;P:k.Projection;w:number;h:number;v:View;label:string;onDown:(c:Ctl,e:RPE<SVGElement>)=>void;onKey:(c:Ctl,e:RKE<SVGElement>)=>void;onFocus:(c:Ctl|null)=>void;
 aria:Record<'knob'|'width'|'depth'|'lever'|'switch',{label:string;text:string;now?:number;min?:number;max?:number}>};

export function Machine({L,P,w,h,v,label,onDown,onKey,onFocus,aria}:Props){
 const F=L.F,kk=k.cameraOf(P).k;
 const stat=useMemo(()=>staticItems(L,P),[L,P]);
 const cols=lineColors(v.reading.lines.length);
 const pegs=useMemo(()=>{const o:Record<string,JSX.Element>={gk:pieceNode(P,WHITE)};for(const c of [BLUE,TEAL,GOLD,RED])o[c]=pieceNode(P,c);return o;},[P]);
 const items:Item[]=[...stat],lineOf:number[]=[];v.reading.lines.forEach((ix,li)=>ix.forEach(i=>{lineOf[i]=li;}));
 const zLine=(li:number)=>(li+1)*LIFT_STEP*v.lift,TRAY=2.2,world=(a:number,b:number):[number,number]=>[F.u[0]*a+F.v[0]*b,F.u[1]*a+F.v[1]*b];
 // the goalkeeper (always on the board) and the ten outfield pegs (on their line's tray when lifted)
 {const a=GK.x*S,b=GK.y*S;items.push({k:dep(F,P,a,b,0),id:'gk',n:<g transform={k.translateAlong(P,[...world(a,b),0])} data-peg="gk">{pegs.gk}</g>});}
 v.pos.forEach((p,i)=>{const a=p.x*S,b=p.y*S,li=lineOf[i]??0,z=v.lift>0?zLine(li):v.hop;
  items.push({k:dep(F,P,a,b,z)+.3,id:'peg'+i,n:<g transform={k.translateAlong(P,[...world(a,b),z])} data-peg={i} data-line={li}>{pegs[cols[li]??GOLD]}
   {v.focus===`peg${i}`&&<path d={k.ring(0,0,8,.4,P,40)} fill="none" stroke="var(--acc)" strokeWidth={2.4}/>}</g>});});
 // the trays the lines ride on when lifted, with guide posts down to the board, and their labels
 if(v.lift>.01)v.reading.lines.forEach((ix,li)=>{const as=ix.map(i=>v.pos[i].x*S),bs=ix.map(i=>v.pos[i].y*S),a0=Math.min(...as)-8,a1=Math.max(...as)+8,b0=Math.min(...bs)-9,b1=Math.max(...bs)+9,z=zLine(li);
  const tray:FPlan={a:a0,b:b0,w:a1-a0,d:b1-b0,r:3},am=(a0+a1)/2,col=cols[li]??GOLD;
  items.push({k:dep(F,P,am,(b0+b1)/2,z)-1,id:'tray'+li,n:<g opacity={Math.min(1,v.lift*3)} data-tray={li}>
   <path className="iso-halo" style={{opacity:.2*v.lift,filter:'blur(5px)',transform:'none'}} d={slab(F,tray,3.4,.1,P,4).fill}/>
   {[[am,b0+3],[am,b1-3]].map(([pa,pb])=><Solid key={pb} paths={cyl(F,P,pa,pb,1.2,3.4,Math.max(.1,z-TRAY-3.4),12)} tone="mid" crease="none"/>)}
   <Tint paths={slab(F,tray,z-TRAY,TRAY,P,4,.4)} color={mix(col,'#ffffff',.55)} inner={<Line d={k.ringSeam(ringOf(F,tray,4),z-TRAY*.5,P)} tone="faint"/>}/>
  </g>});
  const e0=scr(F,P,am,b0,z),e1=scr(F,P,am,b1,z),[lx,ly]=e0[0]>e1[0]?e0:e1,name=`${v.names[li]??'Line'} · ${ix.length}`,tw=Math.max(84,name.length*7.4+22),room=lx+18+tw<w-6;
  const [tx,ty]=room?[lx+18,ly-11]:[Math.max(6,Math.min(w-tw-6,(e0[0]+e1[0])/2-tw/2)),Math.min(e0[1],e1[1])-36];
  items.push({k:1e6+li,id:'tag'+li,n:<g opacity={Math.min(1,Math.max(0,v.lift*2.4-1.2))} data-line-tag={li}>
   {room&&<><path d={`M${lx.toFixed(1)} ${ly.toFixed(1)}h16`} className="iso-line" data-tone="hi"/><circle cx={lx} cy={ly} r={2} fill="var(--anatomy-hi)"/></>}
   <g transform={`translate(${tx.toFixed(1)} ${ty.toFixed(1)})`}><rect width={tw} height={22} rx={11} fill="#fbfbf8" stroke={col} strokeWidth={1.6}/>
    <circle cx={12} cy={11} r={4.5} fill={col}/><text x={22} y={15} fontSize={12.5} fontWeight={700} fill="#1d1d1b" style={{fontFamily:'var(--sans)'}}>{name}</text></g></g>});});

 // ── controls
 const {up,right}=L;
 items.push({k:dep(F,P,L.knob.a,L.knob.b,0),id:'knob',n:<g data-era={ERAS[v.era].id}>{knobNode(F,P,L.knob.a,L.knob.b,L.knob.R,v.knobDeg,{up,right,marks:ERA_ANGLES,locked:v.mode==='build'})}</g>});
 const R=v.reading,vals=[R.width,R.depth,R.gap],full=[GAUGE_FULL.width,GAUGE_FULL.depth,GAUGE_FULL.gap],zones=[ZONES.width,ZONES.depth,ZONES.gap];
 L.dials.forEach((d,i)=>items.push({k:dep(F,P,d.a,d.b,0),id:'dial'+i,n:<g data-dial={['width','depth','gap'][i]} data-value={Math.round(vals[i])} data-ok={[R.ok.width,R.ok.depth,R.ok.cover][i]||undefined}>
  {dialNode(F,P,d.a,d.b,d.R,Math.min(.999,vals[i]/full[i]),{up,right,zone:[zones[i][0]/full[i],Math.min(.999,zones[i][1]/full[i])]})}</g>}));
 const ws=sliderNodes('width',F,P,L.wrail.a,L.wrail.b,L.wrail.len,'b',v.wT),ds=sliderNodes('depth',F,P,L.drail.a,L.drail.b,L.drail.len,'a',v.dT);
 items.push(ws.rail,ws.carriage,ds.rail,ds.carriage);
 const hp=leverHandle(L,v.leverDeg),ex=(deg:number,len:number,a:number,b:number):[number,number,number]=>[a+right[0]*Math.tan(deg*Math.PI/180)*len,b+right[1]*Math.tan(deg*Math.PI/180)*len,3.4];
 items.push({k:dep(F,P,hp[0],hp[1],2)+2,id:'lever',n:<g data-lift={v.lift.toFixed(2)}>
  <Rod a={scr(F,P,...ex(v.leverDeg,9.4,L.lever.a,L.lever.b))} b={scr(F,P,hp[0],hp[1],hp[2])} r={1.9*kk} color="#e6e3da"/>
  <Knob3 c={scr(F,P,hp[0],hp[1],hp[2])} r={5.2*kk} color={RED}/></g>});
 const sp=switchHandle(L,v.switchDeg);
 items.push({k:dep(F,P,sp[0],sp[1],2)+2,id:'switch',n:<g data-mode={v.mode}>
  <Solid paths={cyl(F,P,L.sw.a,L.sw.b,3.6,3,2.6,24,.4)} tone="mid"/>
  <Rod a={scr(F,P,L.sw.a,L.sw.b,5.6)} b={scr(F,P,sp[0],sp[1],sp[2])} r={1.4*kk} color="#dedbd2"/>
  <Knob3 c={scr(F,P,sp[0],sp[1],sp[2])} r={3.2*kk} color={v.mode==='build'?GOLD:'#efece4'}/></g>});

 // ── hit targets
 const hits:{c:Ctl;at:k.Flat;r:number}[]=[
  {c:'knob',at:scr(F,P,L.knob.a,L.knob.b,knobTop(L.knob.R)),r:Math.max(24,(L.knob.R+3)*kk)},
  {c:'width',at:scr(F,P,...ws.grip),r:Math.max(24,9*kk)},{c:'depth',at:scr(F,P,...ds.grip),r:Math.max(24,9*kk)},
  {c:'lever',at:scr(F,P,hp[0],hp[1],hp[2]),r:Math.max(24,8*kk)},{c:'switch',at:scr(F,P,sp[0],sp[1],sp[2]),r:Math.max(24,7*kk)},
 ];
 if(v.mode==='build'&&v.lift<.02)v.pos.forEach((p,i)=>hits.push({c:`peg${i}`,at:scr(F,P,p.x*S,p.y*S,9),r:Math.max(22,8*kk)}));
 const ARIA=(c:Ctl)=>c.startsWith('peg')?{label:`Peg ${Number(c.slice(3))+2}: drag it, or use the arrow keys`,text:`${Math.round(v.pos[Number(c.slice(3))].x)} m up, ${Math.round(v.pos[Number(c.slice(3))].y)} m across`}:aria[c as keyof typeof aria];
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={label} data-machine data-proj={[P.origin[0],P.origin[1],P.scale,P.elevation??30,F.u[0],F.u[1],F.v[0],F.v[1]].map(n=>n.toFixed(4)).join(',')}>
  <g aria-hidden="true">{painted(items)}</g>
  {v.focus&&!v.focus.startsWith('peg')&&(()=>{const H=hits.find(x=>x.c===v.focus);return H?<circle cx={H.at[0]} cy={H.at[1]} r={H.r} fill="none" stroke="var(--acc)" strokeWidth={2.5} pointerEvents="none" data-focus-ring/>:null;})()}
  {hits.map(H=>{const A=ARIA(H.c),peg=H.c.startsWith('peg');return <circle key={H.c} className="iso-hit" data-ctl={H.c} cx={H.at[0]} cy={H.at[1]} r={H.r} tabIndex={0}
   role={H.c==='switch'||H.c==='lever'?'switch':peg?'button':'slider'} aria-label={A.label} aria-valuetext={H.c==='switch'||H.c==='lever'||peg?undefined:A.text}
   aria-checked={H.c==='switch'?v.mode==='build':H.c==='lever'?v.lift>.5:undefined} aria-description={peg?A.text:undefined}
   aria-valuenow={'now' in A?A.now:undefined} aria-valuemin={'min' in A?A.min:undefined} aria-valuemax={'max' in A?A.max:undefined}
   data-axle={H.c==='knob'?H.at.map(n=>n.toFixed(1)).join(' '):undefined} style={{cursor:'grab',touchAction:'none'}}
   onPointerDown={e=>onDown(H.c,e)} onKeyDown={e=>onKey(H.c,e)} onFocus={()=>onFocus(H.c)} onBlur={()=>onFocus(null)}/>;})}
 </svg>;
}
const ringOf=(F:Frame,p:FPlan,steps=8)=>k.roundedPlan({x:p.a,y:p.b,w:p.w,d:p.d,r:p.r},steps).map(([a,b])=>[F.u[0]*a+F.v[0]*b,F.u[1]*a+F.v[1]*b] as [number,number]);

function staticItems(L:Lay,P:k.Projection):Item[]{
 const F=L.F,out:Item[]=[...benchTop('bench',F,P,L.table)],kz=(a:number,b:number,z:number)=>dep(F,P,a,b,z),FZ=3.4;
 // the pegboard pitch: a brass frame, the felt, the markings, a hole every 4 m (HOLE), two goals with nets
 const frame:FPlan={a:-10,b:-10,w:220,d:148,r:4},felt:FPlan={a:-6,b:-6,w:212,d:140,r:2};
 const holes:string[]=[],r=.55,hk=k.cameraOf(P).k*r;
 for(let x=HOLE;x<100;x+=HOLE)for(let y=HOLE;y<64;y+=HOLE){const [sx,sy]=scr(F,P,x*S,y*S,FZ);holes.push(`M${(sx-hk*1.4).toFixed(1)} ${sy.toFixed(1)}a${(hk*1.4).toFixed(2)} ${(hk*.8).toFixed(2)} 0 1 0 ${(hk*2.8).toFixed(2)} 0a${(hk*1.4).toFixed(2)} ${(hk*.8).toFixed(2)} 0 1 0 ${(-hk*2.8).toFixed(2)} 0Z`);}
 const box16=(x0:number,x1:number,w2:number)=>fpath(F,P,[[x0,64-w2,FZ],[x1,64-w2,FZ],[x1,64+w2,FZ],[x0,64+w2,FZ]]);
 out.push({k:-1e6,id:'pitch',n:<g>
  <Tint paths={slab(F,frame,0,2.4,P,4,.5)} color={BRASS}/>
  <Tint paths={slab(F,felt,0,FZ,P,3)} color={FELT} crease={false}/>
  <path d={holes.join('')} fill={mix(FELT,'#000000',.38)} opacity={.55}/>
  <g fill="none" stroke="#fbfbf6" strokeWidth={1.3}>
   <path d={fpath(F,P,[[0,0,FZ],[200,0,FZ],[200,128,FZ],[0,128,FZ]],true)}/><path d={fpath(F,P,[[100,0,FZ],[100,128,FZ]])}/>
   <path d={(()=>{const pts:[number,number,number][]=[];for(let i=0;i<=40;i++){const t=i/40*Math.PI*2;pts.push([100+Math.cos(t)*18,64+Math.sin(t)*18,FZ]);}return fpath(F,P,pts);})()}/>
   <path d={box16(0,33,40)+box16(200,167,40)}/><path d={box16(0,11,18)+box16(200,189,18)}/></g>
  {[[-8,-8],[208,-8],[-8,136],[208,136]].map(([a,b],i)=><g key={i}>{screw(F,P,a,b,2.4,1.2)}</g>)}
 </g>});
 for(const ga of [0,200]){const back=ga===0?-9:209,net:string[]=[];for(let s=0;s<=6;s++){const b=64-7.3+14.6*s/6;net.push(fpath(F,P,[[ga,b,FZ+10],[back,b,FZ+7],[back,b,FZ]]));}
  for(let z=0;z<=3;z++)net.push(fpath(F,P,[[back,64-7.3,FZ+z*2.3],[back,64+7.3,FZ+z*2.3]]));
  out.push({k:kz(ga+(ga?6:-6),64,4),id:'net'+ga,n:<Line d={net.join('')} tone="faint"/>});
  for(const gb of [64-7.3,64+7.3])out.push({k:kz(ga,gb,6),id:`post${ga}${gb}`,n:<Solid paths={cyl(F,P,ga,gb,.9,FZ,10,12)} tone="hi"/>});
  out.push({k:kz(ga,64,FZ+10)+.2,id:'bar'+ga,n:<Solid paths={slab(F,{a:ga-.9,b:64-7.3,w:1.8,d:14.6,r:.8},FZ+9.2,1.8,P,3)} tone="hi"/>});}
 const {up,right}=L,dn:V2=[-up[0],-up[1]];
 // the deck: the era knob's six shapes engraved round it, the dials' names, the lever's slotted plate, the switch plate
 {const {a,b,R}=L.knob;out.push({k:kz(a,b,0)-1,id:'eranames',n:<g>
  {ERA_ANGLES.map((m,i)=>{const d=dirOf(up,right,m);return <Engrave key={m} F={F} P={P} a={a+d[0]*(R+20)} b={b+d[1]*(R+20)} z={0} r={right} d={dn} size={L.wide?5:4.6}>{ERAS[i].id==='wm'?'WM':ERAS[i].shape}</Engrave>;})}
  <Engrave F={F} P={P} a={a+dn[0]*(R+14)} b={b+dn[1]*(R+14)} z={0} r={right} d={dn} size={4} tone="lo">ERA</Engrave></g>});}
 L.dials.forEach((d,i)=>out.push({k:kz(d.a,d.b,0)-1,id:'dn'+i,n:<Engrave F={F} P={P} a={d.a+dn[0]*(d.R+7)} b={d.b+dn[1]*(d.R+7)} z={0} r={right} d={dn} size={4.4} tone="lo">{['WIDTH m','DEPTH m','GAP m'][i]}</Engrave>}));
 {const {a:la,b:lb}=L.lever,plate:FPlan=L.wide?{a:la-28,b:lb-8,w:56,d:16,r:3}:{a:la-8,b:lb-28,w:16,d:56,r:3},slot:FPlan=L.wide?{a:la-21,b:lb-1.6,w:42,d:3.2,r:1.6}:{a:la-1.6,b:lb-21,w:3.2,d:42,r:1.6};
  out.push({k:kz(la,lb,0),id:'leverplate',n:<g>
   <Tint paths={slab(F,plate,0,3.4,P,4,.5)} color={BRASS}/><path d={k.onTop(ringOf(F,slot,4),3.4,P,true)} fill="#3a3a3c"/>
   {[-24,24].map(s=><g key={s}>{screw(F,P,la+right[0]*s,lb+right[1]*s,3.4,1.1)}</g>)}
   <Engrave F={F} P={P} a={la-right[0]*16+dn[0]*14} b={lb-right[1]*16+dn[1]*14} z={0} r={right} d={dn} size={4.6}>TOGETHER</Engrave>
   <Engrave F={F} P={P} a={la+right[0]*18+dn[0]*14} b={lb+right[1]*18+dn[1]*14} z={0} r={right} d={dn} size={4.6}>LIFT</Engrave></g>});}
 {const {a,b}=L.sw,pl:FPlan=L.wide?{a:a-14,b:b-7,w:28,d:14,r:2.4}:{a:a-7,b:b-14,w:14,d:28,r:2.4};
  out.push({k:kz(a,b,0)-.5,id:'swplate',n:<g><Tint paths={slab(F,pl,0,3,P,4,.4)} color={BRASS}/>
   {[-10,10].map(s=><g key={s}>{screw(F,P,a+right[0]*s,b+right[1]*s,3,1)}</g>)}
   <Engrave F={F} P={P} a={a-right[0]*10+dn[0]*13} b={b-right[1]*10+dn[1]*13} z={0} r={right} d={dn} size={4.4}>HISTORY</Engrave>
   <Engrave F={F} P={P} a={a+right[0]*12+dn[0]*13} b={b+right[1]*12+dn[1]*13} z={0} r={right} d={dn} size={4.4}>BUILD</Engrave></g>});}
 // the rails' names, a ruler and the maker's plate
 {const {a,b,len}=L.wrail;out.push({k:kz(a,b+len/2,0)-1,id:'wname',n:<Engrave F={F} P={P} a={a+(L.wide?14:-14)} b={b+len/2} z={0} r={[0,1]} d={[L.wide?-1:1,0]} size={4.4} tone="lo">WIDTH</Engrave>});}
 {const {a,b,len}=L.drail;out.push({k:kz(a+len/2,b,0)-1,id:'dname',n:<Engrave F={F} P={P} a={a+len/2} b={b+(L.wide?-13:13)} z={0} r={[1,0]} d={[0,L.wide?1:-1]} size={4.4} tone="lo">DEPTH</Engrave>});}
 if(L.wide)out.push(ruler('ruler',F,P,-14,-50,120,'a'));else out.push(ruler('ruler',F,P,-136,4,96,'b'));
 {const {a,b}=L.label,pl:FPlan=L.wide?{a:a-17,b:b-6,w:34,d:12,r:1.5}:{a:a-6,b:b-17,w:12,d:34,r:1.5};
  out.push({k:kz(a,b,0),id:'label',n:<Solid paths={slab(F,pl,0,.8,P,4)} tone="mid">
   <Engrave F={F} P={P} a={a} b={b} z={.8} r={right} d={dn} size={4} tone="hi">SINCE 1880</Engrave></Solid>});}
 return out;
}
export {onTop,WOOD_DARK};
