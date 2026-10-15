'use client';
import {memo,useMemo,type KeyboardEvent as RKE,type PointerEvent as RPE} from 'react';
import * as k from '../anatomy/iso-kit';
import {frameFor} from '../anatomy/bench';
import {painted} from '../anatomy/paper-kit';
import {BRASS,FELT,NAVY,WHITE,WOOD,WOOD_DARK,Engrave,Knob3,Line,Rod,Solid,Tint,arcAt,ballNode,benchTop,cyl,dep,dialNode,dirOf,faceMatrix,fitRect,fpath,knobNode,knobTop,knurlAt,mix,onTop,pieceNode,ringAt,ruler,scr,screw,slab,sliderNodes,
 type FPlan,type Frame,type Item,type V2} from './rig';
import {GAIN_FULL,KNOB_ANGLES,LIFT_LEVEL,LINES,PASS_LENGTHS,PLAYERS,STYLE_TEAM,TIME_FULL,rackOf,type Pt,type Style,type Team} from './model';

/**
 * first-international-1872 · THE MATCH ANALYSER (Oct 14 2026 redo; user: "make it possible to turn knobs and things to make it do
 * something", "like the stadiums"). A brass-and-wood instrument on a bench: a felt pitch in a brass frame with 22 lead pieces
 * (England white, Scotland navy) and the leather ball; 1872 goals (two posts and a tape) and corner flags. On the front deck:
 * the STYLE LEVER in a slotted plate (DRIBBLE / PASS), the PASS-LENGTH KNOB with four detents (10, 20, 30, 40 m), the GAIN and
 * TIME dial gauges, and the LIFT-THE-LINES slider. Beside the pitch, the CLOCKWORK box with its crank (three turns wind the
 * whole move through); behind it, the flip SCOREBOARD. Lifting the lines raises the attacking team's lines onto labelled rack
 * bars (goalkeeper, backs, half-backs, forwards) like the stadium's layers.
 * Two benches: landscape (controls along the front) and portrait (controls in two rows under the pitch). Static parts are built
 * once per card size; the pieces reuse one memoised node per team, moved by transforms.
 */
export const S=2;// drawing units per metre
export const LIFT_H=66;
export type Lay={wide:boolean;F:Frame;up:V2;right:V2;table:FPlan;lever:{a:number;b:number};knob:{a:number;b:number;R:number};gain:{a:number;b:number;R:number};time:{a:number;b:number;R:number};
 slider:{a:number;b:number;len:number;axis:'a'|'b'};crank:{a:number;b:number};board:{a:number;b:number;along:V2};label:{a:number;b:number};pts:[number,number,number][]};
const box=(a0:number,b0:number,a1:number,b1:number,z0:number,z1:number):[number,number,number][]=>[[a0,b0,z0],[a1,b0,z0],[a0,b1,z0],[a1,b1,z0],[a0,b0,z1],[a1,b0,z1],[a0,b1,z1],[a1,b1,z1]];
export function layoutFor(wide:boolean):Lay{
 if(wide){const F=frameFor('wide',12);return {wide,F,up:[0,-1],right:[1,0],table:{a:-30,b:-74,w:322,d:268,r:10},
  lever:{a:14,b:164},knob:{a:68,b:166,R:13},gain:{a:120,b:166,R:17},time:{a:166,b:166,R:17},slider:{a:202,b:166,len:76,axis:'a'},crank:{a:248,b:70},
  board:{a:100,b:-50,along:[1,0]},label:{a:264,b:120},pts:[...box(-30,-74,292,194,-18,0),...box(52,-52,148,-48,0,64),...box(0,0,200,128,0,LIFT_H*.5)]};}
 const F=frameFor('tall',8);return {wide,F,up:[1,0],right:[0,1],table:{a:-134,b:-16,w:396,d:160,r:10},
  lever:{a:-44,b:22},knob:{a:-44,b:66,R:12},gain:{a:-98,b:22,R:15},time:{a:-98,b:60,R:15},slider:{a:-98,b:86,len:46,axis:'b'},crank:{a:-46,b:112},
  board:{a:230,b:64,along:[0,1]},label:{a:-128,b:120},pts:[...box(-134,-16,262,144,-18,0),...box(226,16,234,112,0,64),...box(0,0,200,128,0,LIFT_H*.72)]};
}
export function projFor(L:Lay,w:number,h:number,top:number,bottom:number){
 return fitRect(L.F,L.pts,{x:0,y:top,w,h:h-top-bottom},L.wide?14:2,L.wide?32:38);
}
/** The lever: pivot 6 under the deck, 40 long; θ tilts it toward `right`. */
export const LEVER_LEN=40,LEVER_PIV=-6;
export const leverHandle=(L:Lay,deg:number):[number,number,number]=>{const t=deg*Math.PI/180,s=Math.sin(t)*LEVER_LEN;return [L.lever.a+L.right[0]*s,L.lever.b+L.right[1]*s,LEVER_PIV+Math.cos(t)*LEVER_LEN];};
/** The crank: a vertical axle on the clockwork box; the arm (radius 20) at angle deg from `up`. */
export const CRANK_Z=34,CRANK_R=20;
export const crankHandle=(L:Lay,deg:number):[number,number,number]=>{const d=dirOf(L.up,L.right,deg);return [L.crank.a+d[0]*CRANK_R,L.crank.b+d[1]*CRANK_R,CRANK_Z+14];};
export const BOARD_W=96,BOARD_Z0=24,BOARD_Z1=60;

export type Ctl='crank'|'knob'|'lever'|'slider'|'board';
export type View={style:Style;lenIdx:number;crankDeg:number;leverDeg:number;knobDeg:number;lift:number;flip:number;pos:Pt[];ball:Pt;air:number;owner:number;gain:number;time:number;focus:Ctl|null};
type Props={L:Lay;P:k.Projection;w:number;h:number;v:View;label:string;
 onDown:(c:Ctl,e:RPE<SVGElement>)=>void;onKey:(c:Ctl,e:RKE<SVGElement>)=>void;onFocus:(c:Ctl|null)=>void;aria:Record<Ctl,{label:string;text:string;now?:number;min?:number;max?:number}>};

export function Analyser({L,P,w,h,v,label,onDown,onKey,onFocus,aria}:Props){
 const F=L.F;
 const stat=useMemo(()=>staticItems(L,P),[L,P]);
 const pieces=useMemo(()=>({scotland:pieceNode(P,NAVY,'hi'),england:pieceNode(P,WHITE,'hi')}),[P]);
 const team=STYLE_TEAM[v.style],items:Item[]=[...stat];
 // ── the pieces, the ball, and (lifted) the rack bars of the attacking team's lines
 const lift=v.lift;
 const el=lift<.5?2*lift*lift:1-(-2*lift+2)**2/2,posOf=(i:number)=>{const p=v.pos[i];if(PLAYERS[i].team!==team||lift<=0)return p;const r=rackOf(i);return {x:p.x+(r.x-p.x)*el,y:p.y+(r.y-p.y)*el};};
 PLAYERS.forEach((pl,i)=>{const p=posOf(i),a=p.x*S,b=p.y*S,mine=pl.team===team,z=mine?LIFT_LEVEL[pl.role]*LIFT_H*lift:0;
  items.push({k:dep(F,P,a,b,z)+(mine?.2:0),id:'pc'+i,n:<g transform={k.translateAlong(P,[...F.u.map((u,j)=>u*a+F.v[j]*b) as [number,number],z])} opacity={!mine&&lift>.02?1-.6*Math.min(1,lift*1.5):1}
   data-piece={pl.id} data-owner={v.owner===i||undefined}>{pieces[pl.team]}
   {v.owner===i&&lift<.05&&<path d={k.ring(0,0,7.6,.4,P,40)} fill="none" stroke="var(--acc)" strokeWidth={2} />}</g>});});
 if(lift>.01)for(const ln of LINES[team]){const idx=PLAYERS.map((p,i)=>i).filter(i=>PLAYERS[i].team===team&&PLAYERS[i].role===ln.role),z=LIFT_LEVEL[ln.role]*LIFT_H*lift;
  const as=idx.map(i=>posOf(i).x*S),bs=idx.map(i=>posOf(i).y*S),am=as.reduce((s,x)=>s+x,0)/as.length,b0=Math.min(...bs)-9,b1=Math.max(...bs)+9;
  const bar:FPlan={a:am-4,b:b0,w:8,d:b1-b0,r:2};
  items.push({k:dep(F,P,am,(b0+b1)/2,z)-.4,id:'bar'+ln.role,n:<g opacity={Math.min(1,lift*3)}>
   <path className="iso-halo" style={{opacity:.22*lift,filter:'blur(4px)',transform:'none'}} d={slab(F,bar,3.4,.1,P,3).fill}/>
   {[b0+3,b1-3].map(b=><Solid key={b} paths={cyl(F,P,am,b,1.1,0,Math.max(.1,z-2.2),12)} tone="mid" crease="none"/>)}
   <Tint paths={slab(F,bar,z-2.2,2.2,P,3,.4)} color={BRASS}/>
  </g>});
  const e0=scr(F,P,am,b0,z),e1=scr(F,P,am,b1,z),[lx,ly]=e0[0]>e1[0]?e0:e1,tw=ln.role==='gk'?92:104,room=lx+18+tw<w-6;
  const [tx,ty]=room?[lx+18,ly-11]:[Math.min(w-tw-6,(e0[0]+e1[0])/2-tw/2),Math.min(e0[1],e1[1])-34];
  items.push({k:1e6+z,id:'tag'+ln.role,n:<g opacity={Math.min(1,Math.max(0,lift*2.4-1.2))} data-line-tag={ln.role}>
   {room?<><path d={`M${lx.toFixed(1)} ${ly.toFixed(1)}h16`} className="iso-line" data-tone="hi"/><circle cx={lx} cy={ly} r={2} fill="var(--anatomy-hi)"/></>:null}
   <g transform={`translate(${tx.toFixed(1)} ${ty.toFixed(1)})`}><rect width={tw} height={22} rx={11} fill="#fbfbf8" stroke="#3a3a3c" strokeWidth={.8}/>
    <text x={10} y={15} fontSize={12.5} fontWeight={700} fill="#1d1d1b" style={{fontFamily:'var(--sans)'}}>{ln.role==='gk'?'Goalkeeper':`${ln.n} ${ln.name}`}</text></g></g>});}
 {const [ba,bb]=[v.ball.x*S,v.ball.y*S];
  items.push({k:dep(F,P,ba,bb,v.air*S)+.6,id:'ball',n:<g opacity={Math.max(0,1-lift*4)} transform={k.translateAlong(P,[...F.u.map((u,j)=>u*ba+F.v[j]*bb) as [number,number],0])} data-ball>{ballNode(P,2.6,v.air*S)}</g>});}

 // ── the controls (dynamic parts)
 const {a:la,b:lb}=L.lever,hp=leverHandle(L,v.leverDeg),exit:[number,number,number]=[la+L.right[0]*Math.tan(v.leverDeg*Math.PI/180)*9.4,lb+L.right[1]*Math.tan(v.leverDeg*Math.PI/180)*9.4,3.4];
 items.push({k:dep(F,P,hp[0],hp[1],2)+2,id:'lever',n:<g data-lever={v.style}>
  <Rod a={scr(F,P,...exit)} b={scr(F,P,hp[0],hp[1],hp[2])} r={1.9*k.cameraOf(P).k} color="#e6e3da"/>
  <Knob3 c={scr(F,P,hp[0],hp[1],hp[2])} r={5.2*k.cameraOf(P).k} color={v.style==='pass'?NAVY:WHITE}/></g>});
 items.push({k:dep(F,P,L.knob.a,L.knob.b,0),id:'knob',n:<g data-knob={PASS_LENGTHS[v.lenIdx]}>{knobNode(F,P,L.knob.a,L.knob.b,L.knob.R,v.knobDeg,{up:L.up,right:L.right,marks:KNOB_ANGLES,locked:v.style==='dribble'})}</g>});
 items.push({k:dep(F,P,L.gain.a,L.gain.b,0),id:'gain',n:<g data-gain={Math.round(v.gain)}>{dialNode(F,P,L.gain.a,L.gain.b,L.gain.R,Math.min(.999,v.gain/GAIN_FULL),{up:L.up,right:L.right,zone:[40/GAIN_FULL,.999]})}</g>});
 items.push({k:dep(F,P,L.time.a,L.time.b,0),id:'time',n:<g data-time={v.time.toFixed(1)}>{dialNode(F,P,L.time.a,L.time.b,L.time.R,Math.min(.999,v.time/TIME_FULL),{up:L.up,right:L.right})}</g>});
 const sl=sliderNodes('lift',F,P,L.slider.a,L.slider.b,L.slider.len,L.slider.axis,v.lift);items.push(sl.rail,sl.carriage);
 // the crank: arm and handle on the axle boss
 {const {a:ca,b:cb}=L.crank,hd=crankHandle(L,v.crankDeg),kk=k.cameraOf(P).k,hub=scr(F,P,ca,cb,CRANK_Z+1.6),end=scr(F,P,hd[0],hd[1],CRANK_Z+1.6);
  items.push({k:dep(F,P,ca,cb,CRANK_Z)+1,id:'crank',n:<g data-crank={Math.round(v.crankDeg)}>
   <Rod a={hub} b={end} r={2.2*kk} color={BRASS}/>
   <Tint paths={cyl(F,P,ca,cb,4.4,CRANK_Z,3.4,28,.4)} color={BRASS}/>
   <Line d={ringAt(F,P,ca,cb,1.6,CRANK_Z+3.4,16)} tone="hi"/>
   <Solid paths={cyl(F,P,hd[0],hd[1],2.6,CRANK_Z+.4,3,20)} tone="mid"/>
   <Tint paths={cyl(F,P,hd[0],hd[1],2.4,CRANK_Z+3.4,10,24)} color={WOOD_DARK} inner={<Line d={arcAt(F,P,hd[0],hd[1],2.4,CRANK_Z+8.4,16)} tone="faint"/>}/>
   <Knob3 c={scr(F,P,hd[0],hd[1],CRANK_Z+14)} r={3*kk} color={mix(WOOD_DARK,'#ffffff',.15)}/></g>});}
 // the scoreboard's flip cards
 items.push(...scoreCards(L,P,v.flip));

 // ── hit targets (on top), focusable: arrows turn, Enter / Space press
 const kk=k.cameraOf(P).k,hits:{c:Ctl;at:k.Flat;r:number}[]=[
  {c:'crank',at:scr(F,P,...crankHandle(L,v.crankDeg)),r:Math.max(24,6*kk)},
  {c:'knob',at:scr(F,P,L.knob.a,L.knob.b,knobTop(L.knob.R)),r:Math.max(24,(L.knob.R+3)*kk)},
  {c:'lever',at:scr(F,P,hp[0],hp[1],hp[2]),r:Math.max(24,8*kk)},
  {c:'slider',at:scr(F,P,...sl.grip),r:Math.max(24,9*kk)},
  {c:'board',at:scr(F,P,L.board.a,L.board.b,(BOARD_Z0+BOARD_Z1)/2),r:Math.max(26,BOARD_W*.32*kk)},
 ];
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="group" aria-label={label} data-analyser>
  <g aria-hidden="true">{painted(items)}</g>
  {v.focus&&(()=>{const H=hits.find(x=>x.c===v.focus);return H?<circle cx={H.at[0]} cy={H.at[1]} r={H.r} fill="none" stroke="var(--acc)" strokeWidth={2.5} opacity={.9} pointerEvents="none" data-focus-ring/>:null;})()}
  {hits.map(H=>{const A=aria[H.c];return <circle key={H.c} className="iso-hit" data-ctl={H.c} cx={H.at[0]} cy={H.at[1]} r={H.r} tabIndex={0}
   role={H.c==='board'?'button':H.c==='lever'?'switch':'slider'} aria-label={A.label} aria-valuetext={H.c==='board'||H.c==='lever'?undefined:A.text}
   aria-checked={H.c==='lever'?v.style==='pass':undefined} aria-valuenow={A.now} aria-valuemin={A.min} aria-valuemax={A.max}
   data-axle={H.c==='crank'?scr(F,P,L.crank.a,L.crank.b,CRANK_Z+14).map(n=>n.toFixed(1)).join(' '):H.c==='knob'?scr(F,P,L.knob.a,L.knob.b,knobTop(L.knob.R)).map(n=>n.toFixed(1)).join(' '):undefined}
   style={{cursor:'grab',touchAction:'none'}}
   onPointerDown={e=>onDown(H.c,e)} onKeyDown={e=>onKey(H.c,e)} onFocus={()=>onFocus(H.c)} onBlur={()=>onFocus(null)}/>;})}
 </svg>;
}

/** The scoreboard's two flip cards: a dash until it flips, then the real full-time score, 0 and 0. The top flap falls toward you. */
function scoreCards(L:Lay,P:k.Projection,flip:number):Item[]{
 const F=L.F,{a,b,along}=L.board,nrm:V2=[-L.up[0],-L.up[1]],fa=a+nrm[0]*3.2,fb=b+nrm[1]*3.2,out:Item[]=[],tag=L.wide?'w':'t';
 const f=Math.min(1,Math.max(0,flip)),c=Math.cos(f*Math.PI);
 for(const [i,off] of [[0,-22],[1,22]] as const){const ca=fa+along[0]*off,cb=fb+along[1]*off,cw=18,z0=33,z1=56,zm=(z0+z1)/2;
  const q=(u0:number,z:number,o=0):k.Flat=>scr(F,P,ca+along[0]*u0+nrm[0]*o,cb+along[1]*u0+nrm[1]*o,z);
  const quad=(za:number,zb:number)=>k.pathOf([q(-cw/2,za),q(cw/2,za),q(cw/2,zb),q(-cw/2,zb)],true);
  const edgeZ=zm+(z1-zm)*c,o=Math.sin(f*Math.PI)*(z1-zm),flap=k.pathOf([q(-cw/2,zm),q(cw/2,zm),q(cw/2,edgeZ,o),q(-cw/2,edgeZ,o)],true);
  const digit=(txt:string,half:'top'|'bot')=><g clipPath={`url(#sc${i}${half}${tag})`}><text className="iso-face-text" data-tone="hi" transform={faceMatrix(F,P,ca,cb,z0+4.2,along)} fontSize={20} textAnchor="middle" style={{fontWeight:800,fill:'#1d1d1b',fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif'}}>{txt}</text></g>;
  out.push({k:dep(F,P,ca,cb,zm)+40,id:'card'+i,n:<g data-score-card={i} data-shown={f>=1?'0':'-'}>
   <defs><clipPath id={`sc${i}top${tag}`}><path d={quad(z1+2,zm)}/></clipPath><clipPath id={`sc${i}bot${tag}`}><path d={quad(zm,z0-2)}/></clipPath></defs>
   <path d={quad(z0,z1)} style={{fill:'#fbfbf8'}} className="iso-line" data-tone="hi"/>
   {digit(f>0?'0':'–','top')}{digit(f>=1?'0':'–','bot')}
   {f>0&&f<1&&<path d={flap} style={{fill:c>0?'#fbfbf8':'#ecebe5'}} className="iso-line" data-tone="hi"/>}
   <path d={k.pathOf([q(-cw/2,zm),q(cw/2,zm)])} className="iso-line" data-tone="mid"/>
   {[-cw/2-1.6,cw/2+1.6].map(u=><circle key={u} cx={q(u,zm)[0]} cy={q(u,zm)[1]} r={1.1} fill="var(--anatomy-hi)"/>)}
  </g>});}
 return out;
}

function staticItems(L:Lay,P:k.Projection):Item[]{
 const F=L.F,out:Item[]=[...benchTop('bench',F,P,L.table)],kz=(a:number,b:number,z:number)=>dep(F,P,a,b,z);
 // the pitch: a brass frame, the felt, the 1872 markings (boundary, centre), goals of two posts and a tape, corner flags
 const frame:FPlan={a:-10,b:-10,w:220,d:148,r:4},felt:FPlan={a:-6,b:-6,w:212,d:140,r:2},FZ=3.4;
 out.push({k:-1e6,id:'frame',n:<g><Tint paths={slab(F,frame,0,2.4,P,4,.5)} color={BRASS}/>
  <Tint paths={slab(F,felt,0,FZ,P,3)} color={FELT} crease={false}/>
  <path d={fpath(F,P,[[0,0,FZ],[200,0,FZ],[200,128,FZ],[0,128,FZ]],true)} fill="none" stroke="#fbfbf6" strokeWidth={1.4}/>
  <path d={fpath(F,P,[[100,0,FZ],[100,128,FZ]])} fill="none" stroke="#fbfbf6" strokeWidth={.8} opacity={.7}/>
  <path d={cyl(F,P,100,64,1.4,FZ,0,16).top} fill="#fbfbf6"/>
  {[[-8,-8],[208,-8],[-8,136],[208,136]].map(([a,b],i)=><g key={i}>{screw(F,P,a,b,2.4,1.2)}</g>)}
 </g>});
 for(const ga of [0,200])for(const gb of [64-7.3,64+7.3])out.push({k:kz(ga,gb,8),id:`post${ga}-${gb}`,n:<Solid paths={cyl(F,P,ga,gb,.9,FZ,15,12)} tone="hi"/>});
 for(const ga of [0,200])out.push({k:kz(ga,64,FZ+14)+.3,id:'tape'+ga,n:<path d={fpath(F,P,[[ga,64-7.3,FZ+13.4],[ga,64+7.3,FZ+13.4]])} stroke="#fbfbf6" strokeWidth={1.6} fill="none" style={{filter:'drop-shadow(0 0 .6px #3a3a3c)'}}/>});
 for(const [a,b] of [[0,0],[200,0],[0,128],[200,128]] as const){const fl=b===0?-1:1;out.push({k:kz(a,b,6),id:`flag${a}${b}`,n:<g>
  <Solid paths={cyl(F,P,a,b,.55,FZ,13,10)} tone="hi"/>
  <path d={fpath(F,P,[[a,b,FZ+13],[a+(a===0?6:-6),b+fl*.01,FZ+11],[a,b,FZ+9]],true)} className="iso-acc-fill" stroke="var(--acc-e)" strokeWidth={.6}/></g>});}
 // the deck: the lever's slotted plate with its two words, the knob's numbers, the dials' names, the slider's name
 const {up,right}=L,dn:V2=[-up[0],-up[1]],{a:la,b:lb}=L.lever,plate:FPlan=L.wide?{a:la-30,b:lb-8,w:60,d:16,r:3}:{a:la-8,b:lb-30,w:16,d:60,r:3};
 const slot:FPlan=L.wide?{a:la-22,b:lb-1.6,w:44,d:3.2,r:1.6}:{a:la-1.6,b:lb-22,w:3.2,d:44,r:1.6};
 out.push({k:kz(la,lb,0),id:'leverplate',n:<g>
  <Tint paths={slab(F,plate,0,3.4,P,4,.5)} color={BRASS}/>
  <path d={k.onTop(ringOf(F,slot,4),3.4,P,true)} fill="#3a3a3c"/>
  {[-26,26].map(s=><g key={s}>{screw(F,P,la+right[0]*s,lb+right[1]*s,3.4,1.2)}</g>)}
  <Engrave F={F} P={P} a={la-right[0]*16+dn[0]*15} b={lb-right[1]*16+dn[1]*15} z={0} r={right} d={dn} size={5.4}>DRIBBLE</Engrave>
  <Engrave F={F} P={P} a={la+right[0]*18+dn[0]*15} b={lb+right[1]*18+dn[1]*15} z={0} r={right} d={dn} size={5.4}>PASS</Engrave>
 </g>});
 {const {a,b,R}=L.knob;out.push({k:kz(a,b,0)-1,id:'knobnums',n:<g>
  {KNOB_ANGLES.map((m,i)=>{const d=dirOf(up,right,m);return <Engrave key={m} F={F} P={P} a={a+d[0]*(R+15)} b={b+d[1]*(R+15)} z={0} r={right} d={dn} size={5.2}>{PASS_LENGTHS[i]}</Engrave>;})}
  <Engrave F={F} P={P} a={a+dn[0]*(R+13)} b={b+dn[1]*(R+13)} z={0} r={right} d={dn} size={4} tone="lo">PASS m</Engrave></g>});}
 for(const [g,name] of [[L.gain,'GAIN m'],[L.time,'TIME s']] as const)out.push({k:kz(g.a,g.b,0)-1,id:'n'+name,n:<Engrave F={F} P={P} a={g.a+dn[0]*(g.R+8)} b={g.b+dn[1]*(g.R+8)} z={0} r={right} d={dn} size={4.6} tone="lo">{name}</Engrave>});
 {const s=L.slider,mid:V2=s.axis==='a'?[s.a+s.len/2,s.b]:[s.a,s.b+s.len/2];out.push({k:kz(mid[0],mid[1],0)-1,id:'nslider',n:<Engrave F={F} P={P} a={mid[0]+dn[0]*14} b={mid[1]+dn[1]*14} z={0} r={right} d={dn} size={4.4} tone="lo">LIFT THE LINES</Engrave>});}
 // the clockwork box: a wooden case with brass corners, the brass top plate with a ratchet ring, a gear, the axle boss
 {const {a,b}=L.crank,cb:FPlan={a:a-20,b:b-20,w:40,d:40,r:3},tp:FPlan={a:a-18,b:b-18,w:36,d:36,r:2},[x,y]=[...F.u.map((u,j)=>u*a+F.v[j]*b)];
  const rt=k.radialTicks(x,y,16.6,24,6,26.4,[1.6,2.8],P);
  out.push({k:kz(a,b,10),id:'clockwork',n:<g>
   <Tint paths={slab(F,cb,0,24,P,4,.8)} color={WOOD_DARK} inner={<><Line d={k.ringSeam(ringOf(F,cb),8,P)} tone="faint"/><Line d={k.ringSeam(ringOf(F,cb),16,P)} tone="faint"/></>}/>
   <Tint paths={slab(F,tp,24,2.4,P,3,.5)} color={BRASS}/>{[[-14,-14],[14,-14],[-14,14],[14,14]].map(([da,db],i)=><g key={i}>{screw(F,P,a+da,b+db,26.4,1.1)}</g>)}
   <Line d={rt.minor} tone="lo"/><Line d={rt.major} tone="hi"/>
   <Tint paths={cyl(F,P,a,b,12,26.4,3.4,48,.4)} color={mix(BRASS,'#ffffff',.12)} inner={<Line d={knurlAt(F,P,a,b,12,26.4,29.8,40)} tone="lo"/>}/>
   <Line d={ringAt(F,P,a,b,8,29.8,40)} tone="lo"/>
   <Solid paths={cyl(F,P,a,b,3,29.8,4.2,20)} tone="mid"/>
   <Engrave F={F} P={P} a={a+dn[0]*30} b={b+dn[1]*30} z={0} r={right} d={dn} size={4.6} tone="lo">WIND</Engrave>
  </g>});}
 // the flip scoreboard on two posts, its names engraved on the top rail
 {const {a,b,along}=L.board,nrm:V2=[-L.up[0],-L.up[1]],hw=BOARD_W/2,pl:FPlan=along[0]?{a:a-hw,b:b-2.6,w:BOARD_W,d:5.2,r:1.2}:{a:a-2.6,b:b-hw,w:5.2,d:BOARD_W,r:1.2};
  const fa=a+nrm[0]*2.7,fb=b+nrm[1]*2.7;
  for(const s of [-hw+6,hw-6])out.push({k:kz(a+along[0]*s,b+along[1]*s,10)-2,id:'bpost'+s,n:<g>
   <Tint paths={cyl(F,P,a+along[0]*s,b+along[1]*s,4.6,0,2,24,.4)} color={BRASS}/>
   <Tint paths={cyl(F,P,a+along[0]*s,b+along[1]*s,2.2,2,BOARD_Z0,18)} color={WOOD_DARK}/></g>});
  out.push({k:kz(a,b,40),id:'board',n:<g>
   <Tint paths={slab(F,pl,BOARD_Z0,BOARD_Z1-BOARD_Z0,P,3,.6)} color={WOOD} inner={<Line d={k.ringSeam(ringOf(F,pl,3),BOARD_Z0+4,P)} tone="faint"/>}/>
   <Tint paths={slab(F,along[0]?{a:a-hw-2,b:b-3.6,w:BOARD_W+4,d:7.2,r:1.4}:{a:a-3.6,b:b-hw-2,w:7.2,d:BOARD_W+4,r:1.4},BOARD_Z1,2.6,P,3,.4)} color={BRASS}/>
   <text className="iso-face-text" data-tone="mid" transform={faceMatrix(F,P,fa-along[0]*22,fb-along[1]*22,BOARD_Z0+2.2,along)} fontSize={4.8} textAnchor="middle" style={{fontWeight:700}}>SCOTLAND</text>
   <text className="iso-face-text" data-tone="mid" transform={faceMatrix(F,P,fa+along[0]*22,fb+along[1]*22,BOARD_Z0+2.2,along)} fontSize={4.8} textAnchor="middle" style={{fontWeight:700}}>ENGLAND</text>
   <text className="iso-face-text" data-tone="lo" transform={faceMatrix(F,P,fa,fb,BOARD_Z0+19,along)} fontSize={4.4} textAnchor="middle">v</text>
  </g>});}
 // a ruler along the bench's near edge and the maker's label plate
 if(L.wide)out.push(ruler('ruler',F,P,-12,-66,46,'a'),ruler('ruler2',F,P,156,-66,120,'a'));else out.push(ruler('ruler',F,P,-130,4,96,'b'));
 {const {a,b}=L.label,pl:FPlan=L.wide?{a:a-18,b:b-6,w:36,d:12,r:1.5}:{a:a-6,b:b-18,w:12,d:36,r:1.5};
  out.push({k:kz(a,b,0),id:'label',n:<Solid paths={slab(F,pl,0,.8,P,4)} tone="mid">
   <Line d={k.onTop(ringOf(F,{a:pl.a+1.6,b:pl.b+1.6,w:pl.w-3.2,d:pl.d-3.2,r:.6},4),.8,P,true)} tone="faint"/>
   <Engrave F={F} P={P} a={a} b={b} z={.8} r={L.right} d={[-L.up[0],-L.up[1]]} size={4.2} tone="hi">1872</Engrave></Solid>});}
 return out;
}
const ringOf=(F:Frame,p:FPlan,steps=8)=>k.roundedPlan({x:p.a,y:p.b,w:p.w,d:p.d,r:p.r},steps).map(([a,b])=>[F.u[0]*a+F.v[0]*b,F.u[1]*a+F.v[1]*b] as [number,number]);
export const AnalyserMemo=memo(Analyser);
export {onTop};
