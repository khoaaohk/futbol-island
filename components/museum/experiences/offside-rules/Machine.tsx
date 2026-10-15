'use client';
import {forwardRef,memo,useImperativeHandle,useMemo,useReducer,type ReactNode} from 'react';
import {circleRing,cylinder,depthOf,extrude,iso,knurl,lineOnTop,onTop,pathOf,planOutline,radialTicks,ring,segment,sideArc,sideMatrix,sideSeam,slabOf,topMatrix,topTicks,towardViewer,
 type Flat,type Plan,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Tint} from '../anatomy/bench';
import {BallPart,Line,Peg,Screw,Solid,basePlate,fit,labelPlate,painted,scaleOf,shift,type Item} from '../anatomy/paper-kit';
import {CAMS,ERAS,HALF,eraOf,type CamId,type Era,type Scene} from './model';

/**
 * offside-rules · THE OFFSIDE LINE MACHINE (Oct 14 2026 redo, anatomy Paper style). A long bench instrument:
 *  - a heavy base plate on feet, a grass strip (the attacking half from just behind halfway to the goal line) with its halfway
 *    line, penalty area and a small goal; a ruler strip along the front edge;
 *  - six RAILS, one per player, each with end stops; a CARRIAGE on every rail carries a table-football figure (four defenders in
 *    dark with the goalkeeper's yellow band, the passer and the striker in the accent). Drag a carriage along its rail;
 *  - the LINE GANTRY: two uprights on outer guide rails and a crossbar with a laser head; it runs on its own to the era's offside
 *    line, drawing the line on the grass and a faint light sheet. The assistant referee's FLAG is hinged on its near upright and
 *    pops up when the pass is offside;
 *  - the PASS LEVER at the halfway end: pull it and the ball rolls from the passer to the striker;
 *  - the JUDGE: a drum on a plinth at the goal end holding the RULE CAMS on a spindle (ball cam, counting wheel, halfway stop,
 *    level shim), four lamps on its sleeve; open it (the sleeve lifts, the cams spread) and the camera leans in;
 *  - the ERA DIAL in front of the judge: a knurled knob with five detents (1863 · 1866 · 1907 · 1925 · 1990–now). A cam that is
 *    not part of that year's law slides out of the drum.
 * Static parts are built once per card size (memoised on the projection); moving parts re-render on draw().
 */
/** Board x (40 … 100) → world x (0 … 300). */
export const WX=(bx:number)=>(bx-40)*5;
const DEF_Y=[46,10,28,64],PASS_Y=84,ATT_Y=102,STRIP:Plan={x:-14,y:0,w:314,d:112,r:2},GUIDE_Y=[-12,124];
const PLATE:Plan={x:-74,y:-30,w:478,d:192,r:12};
export const JUDGE={x:352,y:48},DIAL={x:352,y:122,r:15},LEVER={x:-40,y:93,z:12,len:30};
const CAM_R=19,CAM_T=[5,5.5,5,2.6],DRUM_Z=10,SLEEVE_H=34,GAP=15;
const BAND={att:'#e4322b',gk:'#f2c230'};

export type MachineView={scene:Scene;era:Era;/** the dial's live angle (deg) */dial:number;/** 0 rest … 1 pulled */lever:number;
 /** the ball: null at the passer's feet, else 0…1 of its roll to the striker */roll:number|null;
 /** the gantry's live line (board x) */line:number;flag:number;/** each cam's 0…1 in the drum (1 = in) */camIn:Record<CamId,number>;
 /** each cam's lamp: null off, true green (clears), false red */lamps:Record<CamId,boolean|null>;open:number;focus:string|null;wide:boolean};
export type MachineApi={draw():void;proj():Projection|null;zoom():{Z:number;tx:number;ty:number};camAnchor(c:CamId):Flat|null;dialCentre():Flat|null;zDial():number};

type Layout={wide:boolean;az:number;el:number};
const LAY_W:Layout={wide:true,az:64,el:32},LAY_T:Layout={wide:false,az:9,el:56};

export const Machine=forwardRef<MachineApi,{w:number;h:number;view:{current:MachineView};top:number;bottom:number}>(function Machine({w,h,view,top,bottom},ref){
 const [,bump]=useReducer((n:number)=>n+1,0);
 const L=w/Math.max(1,h)>1.1?LAY_W:LAY_T;
 const P=useMemo(()=>{if(!w||!h)return null;const pts:Point3[]=[];
  for(const [x,y] of [[PLATE.x,PLATE.y],[PLATE.x+PLATE.w,PLATE.y],[PLATE.x,PLATE.y+PLATE.d],[PLATE.x+PLATE.w,PLATE.y+PLATE.d]])pts.push([x,y,-15],[x,y,0]);
  pts.push([0,GUIDE_Y[0],44],[300,GUIDE_Y[0],44],[JUDGE.x,JUDGE.y,62],[LEVER.x,LEVER.y,44]);
  return fit(pts,w,h,{pad:L.wide?18:6,top,bottom,azimuth:L.az,elevation:L.el});},[w,h,top,bottom,L]);
 // The breakdown's camera: lean in on the judge (zoom about its centre, the drum placed right of centre so the labels fit left).
 const Zt=useMemo(()=>{if(!P)return null;
  const pts:Point3[]=[[JUDGE.x-32,JUDGE.y-32,0],[JUDGE.x+32,JUDGE.y+32,0],[JUDGE.x-32,JUDGE.y+32,0],[JUDGE.x+32,JUDGE.y-32,0],[JUDGE.x,JUDGE.y,DRUM_Z+4*6+4*GAP+22+SLEEVE_H+6]];
  const f=pts.map(p=>iso(p,P)),xs=f.map(p=>p[0]),ys=f.map(p=>p[1]),bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
  const Z=Math.max(1,Math.min(3.4,(h-top-bottom-16)/bh,(w*(L.wide?.34:.46))/bw));
  const C:Flat=[(Math.max(...xs)+Math.min(...xs))/2,(Math.max(...ys)+Math.min(...ys))/2];
  const T:Flat=[w*(L.wide?.66:.7),top+(h-top-bottom)/2+4];
  return {Z,C,T};},[P,w,h,top,bottom,L]);
 const zoomAt=(e:number)=>{if(!Zt)return {Z:1,tx:0,ty:0};const u=e*e*(3-2*e),Z=1+(Zt.Z-1)*u,Tx=Zt.C[0]+(Zt.T[0]-Zt.C[0])*u,Ty=Zt.C[1]+(Zt.T[1]-Zt.C[1])*u;
  return {Z,tx:Tx-Zt.C[0]*Z,ty:Ty-Zt.C[1]*Z};};
 const statics=useMemo(()=>P?staticItems(P):[],[P]);
 const pegs=useMemo(()=>P?{def:<Peg P={P} look="dark" h={22}/>,gk:<Peg P={P} look="dark" h={22} band={BAND.gk}/>,att:<Peg P={P} look="paper" h={22} band={BAND.att}/>,carriage:carriageNode(P)}:null,[P]);
 useImperativeHandle(ref,()=>({draw:()=>bump(),proj:()=>P,zoom:()=>zoomAt(view.current.open),
  camAnchor:(c)=>{if(!P)return null;const v=view.current,z=camZ(CAMS.indexOf(c),v.open),o=camOffset(P,v.camIn[c]);const [vx,vy]=towardViewer(P);
   const p=iso([JUDGE.x+o[0]-vy*CAM_R*.9,JUDGE.y+o[1]+vx*CAM_R*.9,z+CAM_T[CAMS.indexOf(c)]/2],P),zz=zoomAt(v.open);return [p[0]*zz.Z+zz.tx,p[1]*zz.Z+zz.ty];},
  dialCentre:()=>{if(!P)return null;const p=iso([DIAL.x,DIAL.y,9],P),zz=zoomAt(view.current.open);return [p[0]*zz.Z+zz.tx,p[1]*zz.Z+zz.ty];},
  zDial:()=>9}),[P,Zt]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!P||!pegs)return null;
 const v=view.current,k=scaleOf(P),items:Item[]=[...statics];
 // Carriages and figures.
 const rider=(id:string,bx:number,y:number,node:ReactNode,label:string)=>{const X=WX(bx),c=iso([X,y,12],P);
  items.push({k:depthOf([X,y,8],P),id,n:<g data-rider={id}>
   <g transform={shift(P,[X,y,0])}>{pegs.carriage}</g>
   <g transform={shift(P,[X,y,8])}>{node}</g>
   {v.focus===id&&<path d={ring(X,y,9,4.2,P,36)} fill="none" stroke="var(--accent)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
   <circle className="iso-hit" cx={c[0]} cy={c[1]} r={Math.max(22,13*k)} data-hit={id} tabIndex={0} role="slider" aria-label={label}
    aria-valuemin={40} aria-valuemax={100} aria-valuenow={Math.round(bx)} aria-valuetext={`${Math.round((100-bx)*1.05)} metres from their goal line`}/>
  </g>});};
 v.scene.defs.forEach((d,i)=>rider('def'+i,d,DEF_Y[i],i===0?pegs.gk:pegs.def,i===0?'Goalkeeper':`Defender ${i}`));
 rider('ball',v.scene.ball,PASS_Y,pegs.att,'Passer');
 rider('att',v.scene.att,ATT_Y,pegs.att,'Striker');
 // The ball: at the passer's feet, or rolling to the striker's.
 {const a:Point3=[WX(v.scene.ball)+13,PASS_Y+3,4.2],b:Point3=[WX(v.scene.att)-13,ATT_Y-3,4.2],t=v.roll??0,e=t*t*(3-2*t);
  const p:Point3=[a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e,a[2]+Math.sin(Math.PI*e)*5];
  items.push({k:depthOf(p,P)+1,id:'theball',n:<g transform={shift(P,[p[0],p[1],p[2]-3.2])} data-ball={v.roll==null?'feet':v.roll>=1?'striker':'rolling'}><BallPart P={P} r={3.2} lift={p[2]-4.2}/></g>});}
 items.push(...gantry(P,WX(v.line),v.flag));
 items.push(...judge(P,v));
 items.push(dial(P,v.dial,v.era,v.focus==='dial'));
 items.push(lever(P,v.lever,v.focus==='lever'));
 const z=zoomAt(v.open);
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false" data-machine>
  <g transform={`translate(${z.tx.toFixed(2)} ${z.ty.toFixed(2)}) scale(${z.Z.toFixed(4)})`}>{painted(items)}</g>
 </svg>;
});

/** The cams' z (bottom of cam i) for an opening 0…1, and the sleeve's lift. */
export const camZ=(i:number,open:number)=>DRUM_Z+CAM_T.slice(0,i).reduce((a,b)=>a+b+.6,0)+open*GAP*(i+1);
const sleeveLift=(open:number)=>open*(GAP*4+22);
/** A cam that is not in this era's law slides out sideways (screen right), by 46 units. */
function camOffset(P:Projection,inn:number):[number,number]{const [vx,vy]=towardViewer(P),o=(1-inn)*46;return [vy*o,-vx*o];}

// ── Rods and small parts ──────────────────────────────────────────────────────────────────────────────────────────────────
function Rod({a,b,r,tone='hi'}:{a:Flat;b:Flat;r:number;tone?:'hi'|'acc'}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g>
  <path d={d} stroke={tone==='acc'?'var(--acc-e)':'var(--anatomy-hi)'} strokeWidth={r*2+1.4} strokeLinecap="round" fill="none"/>
  <path d={d} stroke={tone==='acc'?'var(--accent)':'var(--anatomy-shade-1)'} strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]-nx*r*.35).toFixed(1)} ${(a[1]-ny*r*.35).toFixed(1)}L${(b[0]-nx*r*.35).toFixed(1)} ${(b[1]-ny*r*.35).toFixed(1)}`} stroke="#ffffff" strokeWidth={r*.6} strokeLinecap="round" fill="none" opacity={tone==='acc'?.4:.9}/>
 </g>;
}
const LAMP={on:'#1f8a5b',off:'#e4322b'};
function Lamp({P,x,y,z,state,r=2.4}:{P:Projection;x:number;y:number;z:number;state:boolean|null;r?:number}){
 const c=state==null?'#cfcfc8':state?LAMP.on:LAMP.off,p=cylinder(x,y,r,z,1.4,P,20);
 return <g data-lamp={state==null?'off':state?'green':'red'}>
  {state!=null&&<circle cx={iso([x,y,z+1.4],P)[0]} cy={iso([x,y,z+1.4],P)[1]} r={r*scaleOf(P)*1.7} fill={c} opacity={.2}/>}
  <path d={p.fill} fill={c} stroke="var(--anatomy-hi)" strokeWidth={.7} vectorEffect="non-scaling-stroke"/>
  <path d={p.top} fill={state==null?'#e4e4de':c} opacity={state==null?1:.8}/>
  <circle cx={iso([x-r*.3,y-r*.3,z+1.4],P)[0]} cy={iso([x-r*.3,y-r*.3,z+1.4],P)[1]} r={Math.max(.6,r*.3*scaleOf(P))} fill="#fff" opacity={.8}/>
 </g>;
}

// ── The carriage (built at the origin, on its rail top z = 4) ───────────────────────────────────────────────────────────
function carriageNode(P:Projection){
 const pl:Plan={x:-9,y:-6.5,w:18,d:13,r:2};
 return <g>
  <path className="iso-halo" style={{opacity:.22,filter:'blur(3px)',transform:'none'}} d={slabOf(pl,3.4,.2,P).fill}/>
  {[-6,6].map(x=><Solid key={x} paths={slabOf({x:x-2.6,y:-4.4,w:5.2,d:8.8,r:1},3.4,1.4,P,3)} tone="mid"/>)}
  <Solid paths={slabOf(pl,4.6,3.4,P,4,.6)} tone="mid" inner={<Line d={sideSeam(pl,6,P,4)} tone="faint"/>}>
   {[[-6.4,-4],[6.4,-4],[-6.4,4],[6.4,4]].map(([x,y],i)=><Screw key={i} x={x} y={y} z={8} P={P} r={1}/>)}
  </Solid>
 </g>;
}

// ── Static: plate, grass, rails, ruler, goal, labels ─────────────────────────────────────────────────────────────────────
function staticItems(P:Projection):Item[]{
 const out:Item[]=[...basePlate('plate',PLATE,P,{h:10,feet:7,inset:20})];
 const K=-5e6;// everything flat on the plate paints before anything that stands
 const grass='#cfe0c3',stripe='#c3d8b6';
 const stripes:string[]=[];for(let x=0,i=0;x<300;x+=30,i++)if(i%2)stripes.push(onTop([[x,1],[x+30,1],[x+30,STRIP.d-1],[x,STRIP.d-1]],1.6,P,true));
 const chalk=(d:string,w=1.1)=><path d={d} fill="none" stroke="#fbfbf6" strokeWidth={w} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>;
 const box={x:WX(100-15.7),y:12,w:300-WX(100-15.7),d:68,r:0},six={x:WX(100-5.2),y:31,w:300-WX(100-5.2),d:30,r:0};
 out.push({k:K,id:'grass',n:<g>
  <Tint paths={slabOf(STRIP,0,1.6,P,3)} color={grass} edge="mid"/>
  {stripes.map((d,i)=><path key={i} d={d} fill={stripe}/>)}
  {chalk(lineOnTop([WX(HALF),2],[WX(HALF),STRIP.d-2],1.6,P),1.4)}
  {chalk(onTop([[box.x+box.w,box.y],[box.x,box.y],[box.x,box.y+box.d],[box.x+box.w,box.y+box.d]],1.6,P))}
  {chalk(onTop([[six.x+six.w,six.y],[six.x,six.y],[six.x,six.y+six.d],[six.x+six.w,six.y+six.d]],1.6,P))}
  {chalk(lineOnTop([300,2],[300,STRIP.d-2],1.6,P),1.4)}
  {chalk(onTop(circleRing(WX(HALF),56,22,48).filter(([x])=>x>=WX(HALF)).sort((a,b)=>a[1]-b[1]),1.6,P))}
  <circle cx={iso([WX(100-10.5),46,1.6],P)[0]} cy={iso([WX(100-10.5),46,1.6],P)[1]} r={1.3} fill="#fbfbf6"/>
 </g>});
 // The ruler strip (one tick a metre-ish) along the front edge, numbered by its major ticks only.
 const ry=PLATE.y+PLATE.d-15,t=topTicks(-50,300,5,5,ry+.6,.6,[2.2,4],P);
 out.push({k:K+1,id:'ruler',n:<Solid paths={slabOf({x:-54,y:ry,w:358,d:7,r:1},0,.6,P,3)} tone="lo" crease="none"><Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/></Solid>});
 // The gantry's guide rails (outside the grass), with end stops.
 GUIDE_Y.forEach((y,i)=>{out.push({k:K+2+i,id:'guide'+i,n:<g>
  <Solid paths={slabOf({x:-16,y:y-3,w:322,d:6,r:1.2},0,3,P,3,.4)} tone="mid" inner={<Line d={sideSeam({x:-16,y:y-3,w:322,d:6,r:1.2},1.4,P,3)} tone="faint"/>}/>
  {[-22,306].map(x=><Solid key={x} paths={slabOf({x:x,y:y-5,w:6,d:10,r:1.2},0,7,P,3,.5)} tone="mid"/>)}
 </g>});});
 // Six rails, each with two end stops and a row of screws.
 [...DEF_Y,PASS_Y,ATT_Y].forEach((y,i)=>{const r:Plan={x:-12,y:y-2.4,w:312,d:4.8,r:1};out.push({k:K+10+i+y*.001,id:'rail'+i,n:<g>
  <Solid paths={slabOf(r,1.6,2,P,3,.3)} tone="mid"/>
  <Line d={lineOnTop([-10,y],[298,y],3.6,P)} tone="faint"/>
  {[-18,300].map(x=><Solid key={x} paths={slabOf({x,y:y-4.5,w:5,d:9,r:1},1.6,6,P,3,.4)} tone="mid"><Screw x={x+2.5} y={y} z={7.6} P={P} r={1}/></Solid>)}
 </g>});});
 out.push(labelPlate('label',{x:-66,y:118,w:42,d:16,r:1.5},0,P,K+30));
 // The goal at the goal line: two posts, a crossbar and a net running back off the grass.
 const gy0=38,gy1=54,gh=14,gx=300,dm=12,net:string[]=[];
 for(let y=gy0;y<=gy1+1e-6;y+=2)net.push(segment([gx+dm,y,0],[gx+dm,y,gh*.8],P),segment([gx+dm,y,gh*.8],[gx,y,gh],P));
 for(let z=0;z<=gh*.8+1e-6;z+=gh*.8/5)net.push(segment([gx+dm,gy0,z],[gx+dm,gy1,z],P));
 for(const y of [gy0,gy1])for(let i=0;i<=4;i++){const f=i/4;net.push(segment([gx+dm*f,y,0],[gx+dm*f,y,gh-(gh*.2)*f],P));}
 out.push({k:depthOf([gx+dm,(gy0+gy1)/2,0],P),id:'net',n:<g><Line d={net.join('')} tone="faint"/><Solid paths={slabOf({x:gx,y:gy0,w:dm+1,d:gy1-gy0,r:.4},0,.5,P,2)} tone="lo" crease="none"/></g>});
 for(const y of [gy0,gy1])out.push({k:depthOf([gx,y,gh/2],P),id:'post'+y,n:<Solid paths={cylinder(gx,y,.9,0,gh,P,14)} tone="hi"/>});
 out.push({k:depthOf([gx,(gy0+gy1)/2,gh],P)+.4,id:'bar',n:<Solid paths={slabOf({x:gx-.9,y:gy0,w:1.8,d:gy1-gy0,r:.8},gh-.9,1.8,P,3)} tone="hi"/>});
 // The lever's foot block and the judge's plinth.
 out.push({k:depthOf([LEVER.x,LEVER.y,0],P)-1,id:'leverfoot',n:<g>
  <Solid paths={slabOf({x:LEVER.x-9,y:LEVER.y-9,w:18,d:18,r:2},0,4,P,4,.6)} tone="mid">{[[-6,-6],[6,-6],[-6,6],[6,6]].map(([x,y],i)=><Screw key={i} x={LEVER.x+x} y={LEVER.y+y} z={4} P={P} r={1}/>)}</Solid>
  <Solid paths={slabOf({x:LEVER.x-4,y:LEVER.y-6,w:8,d:2.6,r:.6},4,LEVER.z-1,P,3,.3)} tone="mid"/>
 </g>});
 out.push({k:depthOf([LEVER.x,LEVER.y,0],P)+4,id:'leverfoot2',n:<Solid paths={slabOf({x:LEVER.x-4,y:LEVER.y+3.4,w:8,d:2.6,r:.6},4,LEVER.z-1,P,3,.3)} tone="mid"/>});
 const J=JUDGE;
 out.push({k:depthOf([J.x,J.y,0],P)-40,id:'plinth',n:<g>
  <path className="iso-halo" style={{opacity:.25}} d={cylinder(J.x,J.y,32,0,6,P,48).fill}/>
  <Solid paths={cylinder(J.x,J.y,32,0,4,P,64,.6)} tone="mid" inner={<Line d={sideArc(J.x,J.y,32,2,P,32)} tone="faint"/>}/>
  <Line d={ring(J.x,J.y,28,4,P,64)} tone="faint"/>
  {[0,1,2,3,4,5].map(i=>{const a=i/6*Math.PI*2+.3;return <Screw key={i} x={J.x+Math.cos(a)*30} y={J.y+Math.sin(a)*30} z={4} P={P} r={1.1}/>;})}
  <Solid paths={cylinder(J.x,J.y,27,4,DRUM_Z-4,P,64,.5)} tone="mid"/>
  <FaceText transform={sideMatrix([J.x-12,J.y+27],8.4,P,'left')} size={3.2} tone="mid">LAW 11</FaceText>
 </g>});
 // The dial's base: a flange with its detent ticks and the years engraved round it.
 const D=DIAL,tk=radialTicks(D.x,D.y,D.r+6,32,4,3,[1.4,3],P,-100*Math.PI/180,200*Math.PI/180);
 out.push({k:depthOf([D.x,D.y,0],P)-2,id:'dialbase',n:<g>
  <path className="iso-halo" style={{opacity:.25}} d={cylinder(D.x,D.y,D.r+8,0,3,P,48).fill}/>
  <Solid paths={cylinder(D.x,D.y,D.r+8,0,3,P,64,.5)} tone="mid"><Line d={tk.minor} tone="lo"/>
   {ERAS.map((e,i)=>{const a=[-80,-40,0,40,80][i]*Math.PI/180,r0=D.r+2.2,r1=D.r+7;
    return <Line key={e.id} d={lineOnTop([D.x+Math.sin(a)*r0,D.y-Math.cos(a)*r0],[D.x+Math.sin(a)*r1,D.y-Math.cos(a)*r1],3,P)} tone="hi"/>;})}
  </Solid>
  {scaleOf(P)>=1.8&&ERAS.map((e,i)=>{const a=[-80,-40,0,40,80][i]*Math.PI/180,r=D.r+13,q=iso([D.x+Math.sin(a)*r,D.y-Math.cos(a)*r,0],P);
   return <text key={e.id} x={q[0].toFixed(1)} y={(q[1]+3).toFixed(1)} textAnchor="middle" className="iso-face-text" data-tone="hi" fontSize={Math.max(8,3.6*scaleOf(P))} data-dial-year={e.id}>{e.id}</text>;})}
 </g>});
 return out;
}

// ── The gantry: uprights, crossbar, laser head, light sheet and the flag (all at the line x) ─────────────────────────────
function gantry(P:Projection,X:number,flag:number):Item[]{
 const out:Item[]=[],zb=40,acc='var(--accent)';
 GUIDE_Y.forEach((y,i)=>{out.push({k:depthOf([X,y,16],P),id:'up'+i,n:<g data-gantry-up={i}>
  <Solid paths={slabOf({x:X-6,y:y-5,w:12,d:10,r:1.5},3,4,P,3,.5)} tone="mid">{[[-4,-3],[4,-3],[-4,3],[4,3]].map(([a,b],j)=><Screw key={j} x={X+a} y={y+b} z={7} P={P} r={.8}/>)}</Solid>
  <Solid paths={slabOf({x:X-2.2,y:y-2.2,w:4.4,d:4.4,r:.8},7,zb-7,P,3)} tone="hi" inner={<Line d={sideSeam({x:X-2.2,y:y-2.2,w:4.4,d:4.4,r:.8},20,P,3)} tone="faint"/>}/>
 </g>});});
 // The light sheet and the crossbar in segments between the rails, each painted at its own depth.
 const ys=[GUIDE_Y[0],5,19,37,55,74,93,111,GUIDE_Y[1]];
 for(let i=0;i<ys.length-1;i++){const y0=ys[i]+(i===0?2.2:0),y1=ys[i+1]-(i===ys.length-2?2.2:0),m=(y0+y1)/2;
  const sheet=pathOf([iso([X,y0,1.6],P),iso([X,y1,1.6],P),iso([X,y1,zb-2],P),iso([X,y0,zb-2],P)],true);
  out.push({k:depthOf([X,m,20],P),id:'sheet'+i,n:<g>
   <path d={sheet} fill={acc} opacity={.08}/>
   {y0>=0&&y1<=STRIP.d?<path d={lineOnTop([X,Math.max(0,y0),],[X,Math.min(STRIP.d,y1)],1.7,P)} stroke={acc} strokeWidth={2.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" data-laser/>:null}
   <Solid paths={slabOf({x:X-2.4,y:y0,w:4.8,d:y1-y0,r:.4},zb,4,P,2)} tone="hi"/>
  </g>});}
 // The laser head in the middle of the bar.
 const hy=56;
 out.push({k:depthOf([X,hy,zb+4],P)+.5,id:'head',n:<g>
  <Solid paths={slabOf({x:X-5,y:hy-7,w:10,d:14,r:1.6},zb-4,9,P,4,.5)} tone="hi" lit inner={<Line d={sideSeam({x:X-5,y:hy-7,w:10,d:14,r:1.6},zb,P,4)} tone="faint"/>}/>
  <path d={cylinder(X,hy,1.8,zb-5.4,1.4,P,16).fill} fill={acc} stroke="var(--acc-e)" strokeWidth={.6} vectorEffect="non-scaling-stroke"/>
  <Screw x={X} y={hy-4} z={zb+5} P={P} r={.9}/><Screw x={X} y={hy+4} z={zb+5} P={P} r={.9}/>
 </g>});
 // The flag, hinged on the near upright's outside face: down along the post (onside), swung up (offside).
 const y=GUIDE_Y[1]+3,pz=zb-6,a=(-.92+flag*(1.92))*Math.PI/2,len=30,s=scaleOf(P);
 const tip:Point3=[X,y+Math.cos(a)*4,pz+Math.sin(a)*len],base:Point3=[X,y,pz];
 const along=(f:number):Point3=>[X,y+Math.cos(a)*4*f,pz+Math.sin(a)*len*f];
 const c0=along(.5),c1=along(1);
 const cloth=pathOf([iso(c0,P),iso(c1,P),iso([c1[0]+14,c1[1],c1[2]-1],P),iso([c0[0]+14,c0[1],c0[2]-1],P)],true);
 out.push({k:depthOf([X,y,20],P)+2,id:'flag',n:<g data-flag={flag>.5?'up':'down'}>
  <path d={cloth} fill={acc} stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
  <path d={pathOf([iso([c0[0]+7,c0[1],c0[2]-.5],P),iso([c1[0]+7,c1[1],c1[2]-.5],P)])} stroke="#f2c230" strokeWidth={2} vectorEffect="non-scaling-stroke"/>
  <Rod a={iso(base,P)} b={iso(tip,P)} r={1.1*s}/>
  <circle cx={iso(base,P)[0]} cy={iso(base,P)[1]} r={2.2*s} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <circle cx={iso(base,P)[0]} cy={iso(base,P)[1]} r={.9} fill="var(--anatomy-dot)"/>
 </g>});
 return out;
}

// ── The judge: the drum, the cams on their spindle, the sleeve with its four lamps ───────────────────────────────────────
function camPaths(c:CamId,x:number,y:number,z:number,P:Projection){
 const t=CAM_T[CAMS.indexOf(c)];
 if(c==='ball'){const pts=circleRing(0,0,1,48).map(([cx,cy]):[number,number]=>{const a=Math.atan2(cy,cx),r=CAM_R+6*Math.max(0,Math.cos(a-2.4))**4;return [x+Math.cos(a)*r,y+Math.sin(a)*r];});
  return extrude(pts,z,t,P,{convex:true,bevel:.4});}
 if(c==='count'){const pts:[number,number][]=[];for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r=i%2?CAM_R-1.6:CAM_R+.4;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}
  return extrude(pts,z,t,P,{convex:false});}
 if(c==='half')return cylinder(x,y,CAM_R,z,t,P,64,.4);
 return cylinder(x,y,CAM_R+1.2,z,t,P,64,.3);
}
function camDetail(c:CamId,x:number,y:number,z:number,P:Projection,era:Era){
 const top=z+CAM_T[CAMS.indexOf(c)];
 if(c==='ball')return <>
  <Line d={ring(x,y,CAM_R-4,top,P,48)} tone="faint"/>
  <path d={ring(x+Math.cos(2.4)*(CAM_R-1),y+Math.sin(2.4)*(CAM_R-1),2.6,top,P,20)} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
 </>;
 if(c==='count'){const need=eraOf(era).need??3;return <>
  <Line d={ring(x,y,CAM_R-4,top,P,48)} tone="faint"/>
  <FaceTop P={P} x={x-3.6} y={y+4.2} z={top} size={10} text={String(need)}/>
 </>;}
 if(c==='half')return <>
  <Line d={lineOnTop([x-CAM_R+1,y],[x+CAM_R-1,y],top,P)} tone="mid"/>
  <Solid paths={cylinder(x+CAM_R*.55,y-CAM_R*.4,2.2,top,5,P,16)} tone="hi"/>
 </>;
 const tk=radialTicks(x,y,CAM_R+1.2,60,5,top,[1,2],P);
 return <><Line d={tk.minor} tone="lo"/><Line d={tk.major} tone="mid"/></>;
}
/** Text lying on a top face, reading along x. */
function FaceTop({P,x,y,z,size,text}:{P:Projection;x:number;y:number;z:number;size:number;text:string}){
 return <text className="iso-face-text" data-tone="hi" transform={topMatrix([x,y],z,P,'x')} fontSize={size} style={{fontWeight:700,fill:'var(--accent)',fontFamily:'var(--sans)'}}>{text}</text>;
}
function judge(P:Projection,v:MachineView):Item[]{
 const out:Item[]=[],J=JUDGE,k0=depthOf([J.x,J.y,0],P),[vx,vy]=towardViewer(P);
 // Spindle segments and cams bottom-up so each cam covers the spindle below it and the segment above covers its top face.
 let z0=DRUM_Z,n=0;
 const camsDraw:ReactNode[]=[];
 CAMS.forEach((c,i)=>{const z=camZ(i,v.open),o=camOffset(P,v.camIn[c]),x=J.x+o[0],y=J.y+o[1],t=CAM_T[i],dim=v.camIn[c]<.5,lit=v.focus==='cam-'+c;
  if(z>z0+.01&&v.camIn[c]>.02)camsDraw.push(<Solid key={'sp'+i} paths={cylinder(J.x,J.y,3,z0,z-z0,P,20)} tone="hi"/>);
  const lx=x+vx*(CAM_R-4)-vy*3,ly=y+vy*(CAM_R-4)+vx*3;
  camsDraw.push(<g key={c} data-cam={c} data-in={v.camIn[c]>.5||undefined} opacity={dim?.42:1}>
   <path className="iso-halo" style={{opacity:.18,filter:'blur(4px)',transform:'none'}} d={cylinder(x,y,CAM_R,z-1,.5,P,32).fill}/>
   <Solid paths={camPaths(c,x,y,z,P)} tone="hi" lit={lit}>{camDetail(c,x,y,z,P,v.era)}</Solid>
   <Line d={ring(x,y,4,z+t,P,20)} tone="mid"/>
   <Lamp P={P} x={lx} y={ly} z={z+t} state={v.camIn[c]>.5?v.lamps[c]:null} r={2.2}/>
  </g>);
  if(v.camIn[c]>.02){z0=z+t;n++;}});
 // The top of the spindle and its nut.
 camsDraw.push(<Solid key="sptop" paths={cylinder(J.x,J.y,3,z0,4,P,20)} tone="hi"/>);
 camsDraw.push(<Solid key="nut" paths={cylinder(J.x,J.y,4.4,z0+4,2.2,P,6,.3)} tone="mid"/>);
 out.push({k:k0,id:'cams',n:<g data-cams={n}>{camsDraw}</g>});
 // The spare-cam post: the cams out of this era's law rest on it.
 const o=camOffset(P,0),sx=J.x+o[0],sy=J.y+o[1],top=camZ(3,v.open)+6;
 out.push({k:k0-.5,id:'spare',n:<g>
  <Solid paths={cylinder(sx,sy,6,0,2,P,24,.4)} tone="mid"/>
  <Solid paths={cylinder(sx,sy,2.2,2,top,P,16)} tone="mid" inner={<Line d={sideArc(sx,sy,2.2,top*.5,P,12)} tone="faint"/>}/>
 </g>});
 // The sleeve (housing) with its lamps; it lifts off when the judge is opened.
 const lift=sleeveLift(v.open),sz=DRUM_Z+lift,fade=v.open>.05?Math.max(.18,1-v.open*1.4):1;
 const lamps=CAMS.map((c,i)=>({c,z:sz+6+i*7}));
 out.push({k:k0+(v.open>.05?60:1),id:'sleeve',n:<g opacity={fade} data-sleeve={v.open>.5?'off':'on'}>
  <Solid paths={cylinder(J.x,J.y,24,sz,SLEEVE_H,P,64,.6)} tone="hi" inner={<>{[sz+3,sz+SLEEVE_H-3].map(z=><Line key={z} d={sideArc(J.x,J.y,24,z,P,40)} tone="faint"/>)}</>}>
   <Line d={ring(J.x,J.y,20,sz+SLEEVE_H,P,48)} tone="faint"/>
  </Solid>
  <Solid paths={cylinder(J.x,J.y,9,sz+SLEEVE_H,3,P,32,.4)} tone="mid" inner={<Line d={knurl(J.x,J.y,9,sz+SLEEVE_H,sz+SLEEVE_H+3,28,P,.3)} tone="faint"/>}/>
  {lamps.map(({c,z})=><Lamp key={c} P={P} x={J.x+vx*24.2} y={J.y+vy*24.2} z={z} state={v.camIn[c]>.5?v.lamps[c]:null} r={2}/>)}
 </g>});
 return out;
}

// ── The era dial and the pass lever ──────────────────────────────────────────────────────────────────────────────────────
function dial(P:Projection,deg:number,era:Era,focus:boolean):Item{
 const D=DIAL,z=3,h=7,a=deg*Math.PI/180,top=z+h,c=iso([D.x,D.y,top],P),s=scaleOf(P);
 return {k:depthOf([D.x,D.y,0],P),id:'dial',n:<g data-dial={era}>
  <Solid paths={cylinder(D.x,D.y,D.r,z,h,P,64,.7)} tone="hi" inner={<Line d={knurl(D.x,D.y,D.r,z,top,64,P,.6)} tone="lo"/>}>
   <Line d={ring(D.x,D.y,D.r-3,top,P,48)} tone="faint"/>
  </Solid>
  <path d={lineOnTop([D.x-Math.sin(a)*3,D.y+Math.cos(a)*3],[D.x+Math.sin(a)*(D.r-1.5),D.y-Math.cos(a)*(D.r-1.5)],top+.2,P)} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
  <path d={ring(D.x,D.y,2.2,top,P,16)} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  {focus&&<path d={ring(D.x,D.y,D.r+10,3,P,48)} fill="none" stroke="var(--accent)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
  <circle className="iso-hit" cx={c[0]} cy={c[1]} r={Math.max(26,(D.r+8)*s*1.05)} data-hit="dial" tabIndex={0} role="slider" aria-label="Era dial"
   aria-valuemin={1863} aria-valuemax={1990} aria-valuenow={Number(era)} aria-valuetext={`${eraOf(era).tab}: ${eraOf(era).head}`}/>
 </g>};
}
function lever(P:Projection,pull:number,focus:boolean):Item{
 const L=LEVER,a=(118-pull*78)*Math.PI/180,end:Point3=[L.x+Math.cos(a)*L.len,L.y,L.z+Math.sin(a)*L.len],p0=iso([L.x,L.y,L.z],P),p1=iso(end,P),s=scaleOf(P);
 return {k:depthOf([L.x,L.y,0],P)+2,id:'lever',n:<g data-lever={pull.toFixed(2)}>
  <Rod a={p0} b={p1} r={1.6*s}/>
  <circle cx={p1[0]} cy={p1[1]} r={4.6*s} fill="var(--accent)" stroke="var(--acc-e)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/>
  <circle cx={p1[0]-1.4*s} cy={p1[1]-1.6*s} r={1.6*s} fill="#fff" opacity={.55}/>
  <circle cx={p0[0]} cy={p0[1]} r={2.8*s} fill="var(--anatomy-paper)" stroke="var(--anatomy-hi)" strokeWidth={.8} vectorEffect="non-scaling-stroke"/><circle cx={p0[0]} cy={p0[1]} r={.9} fill="var(--anatomy-dot)"/>
  {focus&&<circle cx={p1[0]} cy={p1[1]} r={8*s} fill="none" stroke="var(--accent)" strokeWidth={1.6} vectorEffect="non-scaling-stroke"/>}
  <circle className="iso-hit" cx={(p0[0]+p1[0])/2} cy={(p0[1]+p1[1])/2} r={Math.max(26,L.len*.6*s)} data-hit="lever" tabIndex={0} role="button" aria-label="Pass lever: pull to play the pass"/>
 </g>};
}
export const MachineMemo=memo(Machine);
