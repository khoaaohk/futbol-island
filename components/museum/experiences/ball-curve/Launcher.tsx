'use client';
import {memo,useMemo} from 'react';
import {cylinder,depthOf,iso,lineOnTop,pathOf,ring,sideArc,slabOf,topMatrix,type Flat,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Line,Peg,Screw,Solid,basePlate,dialGauge,fit,goalFrame,needleD,painted,rulerStrip,shift,type Item} from '../anatomy/paper-kit';
import {Ball} from '../anatomy/paper-kit';
import {Hit,Post,Rod,kScale} from '../free-kick-wall/rig-parts';
import {BAR,KNUCKLE_SET,POST,WALL_SET,spinOf,type Challenge,type Sample} from './physics';
import {BigBall} from './parts';
import {sphereRadius} from './ballgeom';

/**
 * ball-curve · Fig. 2, THE CURL LAUNCHER (Oct 14 2026 redo). A scale lane (10 world units = 1 m) with the goal, the keeper and,
 * for the free kick, a wall of four at 9.15 m. At the near end, the launcher: a hammer on a pendulum between two posts on a
 * turntable. Pull the HAMMER back for power, turn the TURNTABLE to aim, and drag the dot on the big CONTACT BALL (the ball as the
 * kicker sees it) to choose where the hammer hits it: that sets the spin. A dial reads the spin. Three lines tell the story: a
 * hairline for the straight line of the aim (no spin), the dashed accent prediction (the same physics without the knuckle
 * wobble), and the solid flight once you kick, with its shadow on the grass.
 */
export const M=10;
export const goalYOf=(c:Challenge)=>c==='knuckle'?KNUCKLE_SET.goalY:WALL_SET.goalY;
export const goalXOf=(c:Challenge)=>c==='knuckle'?KNUCKLE_SET.goalX:WALL_SET.goalX;
/** Physics metres (x across, + = the kicker's right; y forward from the ball) → world (the goal line at X = 0). */
export const toW=(c:Challenge)=>(x:number,y:number,z=0):Point3=>[(goalYOf(c)-y)*M,-x*M,z*M];
const plateOf=(c:Challenge)=>{const L=goalYOf(c)*M;return {x:-26,y:-62,w:L+112,d:124,r:14};};
const TT_R=17,TT_TOP=2.6,PIV_Z=25,ARM=21,BR=1.8;
/** The big contact ball on its stand beside the launcher (world). */
export const dialAt=(c:Challenge):Point3=>[goalYOf(c)*M+60,24,30];
export const DIAL_R=13;
export function useLaneProjection(c:Challenge,w:number,h:number,top:number,bottom:number){
 return useMemo(()=>{if(!w||!h)return null;const p=plateOf(c),wide=w/Math.max(1,h-top)>1.1;
  const pts:Point3[]=[[p.x,p.y,-16],[p.x+p.w,p.y,-16],[p.x,p.y+p.d,-16],[p.x+p.w,p.y+p.d,-16],[0,-46,BAR*M+2],[0,46,BAR*M+2],[dialAt(c)[0],dialAt(c)[1],dialAt(c)[2]+DIAL_R+2]];
  return fit(pts,w,h,{pad:wide?-4:-10,top,bottom,azimuth:wide?56:12,elevation:wide?38:42});},[c,w,h,top,bottom]);
}
/** The rig's frame for an aim (degrees, + = right): f towards the target, s to the kicker's right (world). */
export function frame(aim:number){const a=aim*Math.PI/180;return {f:[-Math.cos(a),-Math.sin(a)] as [number,number],s:[Math.sin(a),-Math.cos(a)] as [number,number]};}
export const cockOf=(power:number)=>14+62*Math.max(0,Math.min(1,power));
/** The hammer's head (world) for a power (pulled back) and an aim. */
export function hammerAt(c:Challenge,aim:number,deg:number,cx=0,cy=0):Point3{const {f,s}=frame(aim),B=[goalYOf(c)*M,0],th=deg*Math.PI/180,piv=[B[0]-f[0]*3.4,B[1]-f[1]*3.4];
 return [piv[0]-f[0]*Math.sin(th)*ARM+s[0]*cx*1.1,piv[1]-f[1]*Math.sin(th)*ARM+s[1]*cx*1.1,PIV_Z-Math.cos(th)*ARM+cy*1];}
/** The contact dot on the big ball, in screen px, for a contact (cx right, cy up as the kicker sees it). */
export function dotAt(c:Challenge,P:Projection,cx:number,cy:number):Flat{const [x,y]=iso(dialAt(c),P),R=sphereRadius(DIAL_R,P)*.8;return [x+cx*R,y-cy*R];}

export type LaneView={c:Challenge;strike:{cx:number;cy:number;power:number};aim:number;hammer:number;pred:readonly Sample[];
 actual:{s:readonly Sample[];upto:number}|null;keeperDive:number;yaw:number;active:string|null};

export function Lane({P,w,h,v}:{P:Projection;w:number;h:number;v:LaneView}){
 const c=v.c,W=toW(c),k=kScale(P),items:Item[]=[],B:Point3=[goalYOf(c)*M,0,0];
 const {f,s}=frame(v.aim),th=v.hammer*Math.PI/180,piv:Point3=[B[0]-f[0]*3.4,B[1]-f[1]*3.4,PIV_Z];
 // the wall and the keeper (the keeper dives after the kick)
 if(c==='wall'){const n=4;for(let i=0;i<n;i++){const x=WALL_SET.wall.x0+(i+.5)*(WALL_SET.wall.x1-WALL_SET.wall.x0)/n,p=W(x,WALL_SET.wall.y);
  items.push({k:depthOf(p,P)+i*.01,id:'wp'+i,n:<g transform={shift(P,p)} data-wall-player={i}><Peg P={P} band="#c8372d" h={18}/></g>});}}
 {const kx=(c==='wall'?WALL_SET.keeper.x:KNUCKLE_SET.goalX)+v.keeperDive,p=W(kx,goalYOf(c)-.7);
  items.push({k:depthOf(p,P),id:'keeper',n:<g transform={shift(P,p)} data-keeper><Peg P={P} band="#e2b622" h={19} lying={Math.abs(v.keeperDive)>.7?(v.keeperDive<0?Math.PI/2:-Math.PI/2):null}/></g>});}
 // the lines: straight aim (no spin), the prediction, the flight and its shadow
 const a=v.aim*Math.PI/180,L=goalYOf(c)+1;
 items.push({k:-3e6,id:'straight',n:<path data-straight d={pathOf([iso(W(0,0,.02),P),iso(W(Math.sin(a)*L,Math.cos(a)*L,.02),P)])} className="bc-straight"/>});
 const vis=(p:Sample)=>{const d=Math.hypot(p.x,p.y);return p.z*M+(TT_TOP+BR-1.1)*Math.max(0,1-d/3);};
 if(v.pred.length>1&&!v.actual)items.push({k:9e8,id:'pred',n:<path data-prediction d={pathOf(v.pred.map(p=>iso([W(p.x,p.y)[0],W(p.x,p.y)[1],vis(p)],P)))} className="bc-pred"/>});
 if(v.actual){const pts=v.actual.s.slice(0,Math.max(2,v.actual.upto));
  items.push({k:-2.9e6,id:'shadow',n:<path d={pathOf(pts.map(p=>iso(W(p.x,p.y,.01),P)))} className="bc-shadow"/>});
  items.push({k:9e8+1,id:'actual',n:<path data-actual d={pathOf(pts.map(p=>iso([W(p.x,p.y)[0],W(p.x,p.y)[1],vis(p)],P)))} className="bc-flight"/>});}
 // the ball (on its spot, or in flight)
 {const b=v.actual?v.actual.s[Math.min(v.actual.s.length-1,Math.max(0,v.actual.upto-1))]:null,p:Point3=b?[W(b.x,b.y)[0],W(b.x,b.y)[1],vis(b)]:[B[0],B[1],TT_TOP+BR],q=iso(p,P),g=iso([p[0],p[1],b?0:TT_TOP],P);
  items.push({k:b?depthOf(p,P)+.5:depthOf(B,P)+3,id:'ball',n:<g data-ball><ellipse cx={g[0]} cy={g[1]} rx={BR*k*.9} ry={BR*k*.45} className="iso-halo" style={{filter:'blur(1.5px)',transform:'none',opacity:.32}}/>
   <Ball cx={q[0]} cy={q[1]} r={BR*k} edge="lit"/></g>});}
 // the launcher: the turntable's top, the posts, the axle, the hammer
 {const scr=[45,135,225,315].map(d=>{const t=d*Math.PI/180;return [B[0]+(f[0]*Math.cos(t)+s[0]*Math.sin(t))*12.4,B[1]+(f[1]*Math.cos(t)+s[1]*Math.sin(t))*12.4] as [number,number];});
  items.push({k:depthOf(B,P)-40,id:'ttop',n:<g data-turntable={v.aim.toFixed(1)}><Solid paths={cylinder(B[0],B[1],15,1.4,TT_TOP-1.4,P,56,.5)} tone="hi" lit={v.active==='aim'}/>
   <path d={pathOf([iso([B[0]+f[0]*4,B[1]+f[1]*4,TT_TOP],P),iso([B[0]+f[0]*14,B[1]+f[1]*14,TT_TOP],P)])} stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
   {scr.map(([x,y],i)=><Screw key={i} x={x} y={y} z={TT_TOP} P={P} r={1}/>)}</g>});
  const pL:Point3=[piv[0]-s[0]*8,piv[1]-s[1]*8,0],pR:Point3=[piv[0]+s[0]*8,piv[1]+s[1]*8,0];
  for(const [p,id] of [[pL,'pL'],[pR,'pR']] as [Point3,string][])items.push({k:depthOf([p[0],p[1],PIV_Z/2],P),id,n:<g><Post x={p[0]} y={p[1]} z={TT_TOP} r={1.2} h={PIV_Z+1.4-TT_TOP} P={P}/>
   <Solid paths={cylinder(p[0],p[1],2,PIV_Z+.6,2.2,P,20,.4)} tone="mid"/></g>});
  items.push({k:depthOf(piv,P)+.1,id:'axle',n:<Rod a={iso([pL[0],pL[1],PIV_Z+1.5],P)} b={iso([pR[0],pR[1],PIV_Z+1.5],P)} r={k}/>});
  const head=hammerAt(c,v.aim,v.hammer,v.strike.cx,v.strike.cy),dir:[number,number,number]=[-f[0]*Math.sin(th),-f[1]*Math.sin(th),-Math.cos(th)];
  const top:Point3=[head[0]-dir[0]*ARM,head[1]-dir[1]*ARM,head[2]-dir[2]*ARM];
  items.push({k:depthOf(head,P)+2,id:'hammer',n:<g data-hammer={v.hammer.toFixed(1)}>
   <Rod a={iso(top,P)} b={iso(head,P)} r={1.3*k}/>
   <Rod a={iso([head[0]-f[0]*3,head[1]-f[1]*3,head[2]],P)} b={iso([head[0]+f[0]*2.2,head[1]+f[1]*2.2,head[2]],P)} r={2.7*k} tint="var(--acc)" lit={v.active==='power'}/>
   <circle cx={iso(top,P)[0]} cy={iso(top,P)[1]} r={2.2*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/><circle cx={iso(top,P)[0]} cy={iso(top,P)[1]} r={.9} fill="var(--anatomy-dot)"/></g>});
 }
 // the big contact ball: the ball as the kicker sees it, a crosshair, the dot where the hammer will hit, the spin it gives
 {const D=dialAt(c),[dx,dy]=iso(D,P),R=sphereRadius(DIAL_R,P),[px,py]=dotAt(c,P,v.strike.cx,v.strike.cy),sp=spinOf({...v.strike,aim:0});
  items.push({k:depthOf(D,P)+500,id:'dial',n:<g data-contact-ball={`${v.strike.cx.toFixed(2)},${v.strike.cy.toFixed(2)}`}>
   <BigBall c={D} r={DIAL_R} P={P} spin={{yaw:v.yaw,tilt:.9}} edge={v.active==='contact'?'lit':'hi'}/>
   <path d={`M${dx-R*.92} ${dy}H${dx+R*.92}M${dx} ${dy-R*.92}V${dy+R*.92}`} className="bc-cross"/>
   <circle cx={dx} cy={dy} r={R*.8} className="bc-cross" fill="none"/>
   <circle cx={px} cy={py} r={Math.max(7,R*.13)} fill="var(--accent)" stroke="#fff" strokeWidth={2}/>
   {Math.abs(sp.side)>2&&<SpinArrow x={dx} y={dy} R={R} left={sp.side>0}/>}
  </g>});
  // the spin gauge (turns a second) on the stand's base
 }
 const sp=spinOf({...v.strike,aim:0}),turns=Math.abs(sp.total)/(2*Math.PI);
 items.push({k:9e7,id:'spinNeedle',n:<path d={needleD(goalYOf(c)*M+66,50,5+5,8.4,turns/12,P)} stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" data-spin-gauge={turns.toFixed(1)}/>});
 // controls
 const tt:Flat[]=[];for(let i=0;i<40;i++){const t=i/40*Math.PI*2;tt.push(iso([B[0]+Math.cos(t)*(TT_R+3),B[1]+Math.sin(t)*(TT_R+3),TT_TOP],P));}
 const hd=hammerAt(c,v.aim,v.hammer,v.strike.cx,v.strike.cy),pw=Math.round(v.strike.power*100);
 const hits=[<Hit key="aim" id="aim" d={pathOf(tt,true)} label="Turntable: aim the launcher" value={v.aim} min={-30} max={30} text={`${Math.abs(v.aim)} degrees ${v.aim<0?'left':v.aim>0?'right':'straight'}`}/>,
  <Hit key="power" id="power" c={iso(hd,P)} r={Math.max(22,8*k)} label="Hammer: pull it back for more power" value={v.strike.power} min={0} max={1} text={`${pw}% power`}/>,
  <Hit key="contact" id="contact" c={dotAt(c,P,v.strike.cx,v.strike.cy)} r={Math.max(24,sphereRadius(DIAL_R,P)*.3)} label="Contact dot: where the hammer hits the ball" value={v.strike.cx} min={-1} max={1}
   text={`${Math.abs(v.strike.cx)<.12?'the middle':v.strike.cx>0?'right of the middle':'left of the middle'}${v.strike.cy<-.15?', low':v.strike.cy>.15?', high':''}`}/>];
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-hidden="true" focusable="false">
  <LaneStatic P={P} c={c}/>
  {painted(items)}
  <g data-hits>{hits}</g>
 </svg>;
}

/** A curved arrow over the contact ball: which way its front turns (+ sidespin = anticlockwise from above = the front moves left). */
function SpinArrow({x,y,R,left}:{x:number;y:number;R:number;left:boolean}){
 const s=left?-1:1,x0=x-s*R*.55,x1=x+s*R*.55,yy=y-R*1.14,mid=y-R*1.34,ex=x1,ey=yy,tx=x1-x0,ty=0,l=Math.hypot(tx,ty)||1,ux=tx/l;
 return <g data-spin-dir={left?'left':'right'}><path d={`M${x0} ${yy}Q${x} ${mid} ${x1} ${yy}`} className="bc-spinarc"/>
  <path d={`M${ex-ux*8} ${ey-7}L${ex} ${ey}L${ex-ux*9} ${ey+3}`} className="bc-spinarc"/></g>;
}
const LaneStatic=memo(function LaneStatic({P,c}:{P:Projection;c:Challenge}){
 const items=useMemo(()=>{const W=toW(c),pl=plateOf(c),out:Item[]=[...basePlate('plate',pl,P,{h:10,feet:8,inset:22})],B=[goalYOf(c)*M,0];
  const felt={x:pl.x+7,y:pl.y+7,w:goalYOf(c)*M+60,d:pl.d-14,r:6},stripes:string[]=[];
  for(let x=0;x<felt.x+felt.w;x+=40){const x0=Math.max(felt.x,x),x1=Math.min(felt.x+felt.w,x+20);if(x1>x0)stripes.push(slabOf({x:x0,y:felt.y,w:x1-x0,d:felt.d,r:0},0,.42,P,1).top);}
  out.push({k:-9e6,id:'felt',n:<g><Solid paths={slabOf(felt,0,.4,P,4)} tone="mid" crease="none"/><path d={slabOf(felt,0,.4,P,4).top} fill="#86b17f"/><path d={stripes.join('')} fill="#8fb988"/><Line d={slabOf(felt,0,.4,P,4).outline} tone="mid"/></g>});
  const gx=goalXOf(c),half=felt.d/2/M-.2,L=(pts:[number,number][])=>pathOf(pts.map(([x,y])=>iso([y*M,-x*M,.45],P)));// pitch metres: x across (+ right), y out from the goal line
  const arc:[number,number][]=[];for(let i=0;i<=40;i++){const a=Math.PI*.25+Math.PI*.5*i/40,x=gx+Math.cos(a)*9.15,y=11+Math.sin(a)*9.15;if(y>=16.5&&Math.abs(x)<=half)arc.push([x,y]);}
  out.push({k:-8.9e6,id:'lines',n:<path d={[L([[-half,0],[half,0]]),L([[-half,5.5],[half,5.5]]),L([[-half,16.5],[half,16.5]]),L(arc)].join('')} fill="none" stroke="#fff" strokeWidth={2.4} vectorEffect="non-scaling-stroke"/>});
  out.push(rulerStrip('ruler',-2,felt.x+felt.w-2,57.5,0,P,{d:5,step:M,every:5}));
  const gf=goalFrame('goal',0,-(gx+POST)*M,-(gx-POST)*M,P,{gh:BAR*M,dm:16,era:'today',r:.8});out.push(...gf.back,...gf.front);
  // the turntable's fixed ring and its degree scale
  const tk:string[]=[],tm:string[]=[];for(let d=-30;d<=30;d+=3){const a=Math.PI+d*Math.PI/180,big=d%15===0,r1=TT_R-.6,r0=r1-(big?2.4:1.3);(big?tm:tk).push(lineOnTop([B[0]+Math.cos(a)*r0,B[1]+Math.sin(a)*r0],[B[0]+Math.cos(a)*r1,B[1]+Math.sin(a)*r1],1.4,P));}
  out.push({k:depthOf([B[0],B[1],0],P)-60,id:'tbase',n:<g><Solid paths={cylinder(B[0],B[1],TT_R,0,1.4,P,64,.4)} tone="mid" inner={<Line d={sideArc(B[0],B[1],TT_R,.7,P,40)} tone="faint"/>}/><Line d={tk.join('')} tone="lo"/><Line d={tm.join('')} tone="hi"/></g>});
  // the contact ball's stand: a foot, a post, a cup; the spin gauge beside it
  const D=dialAt(c);
  out.push({k:depthOf([D[0],D[1],0],P)-20,id:'stand',n:<g><Solid paths={cylinder(D[0],D[1],9,0,2.2,P,40,.5)} tone="mid"/><Post x={D[0]} y={D[1]} z={2.2} r={1.6} h={D[2]-DIAL_R-2.2+1} P={P}/>
   <Solid paths={cylinder(D[0],D[1],4.6,D[2]-DIAL_R-1.6,2,P,28,.4)} tone="mid"/></g>});
  out.push({...dialGauge('spin',goalYOf(c)*M+66,50,5,8.4,P),k:depthOf([goalYOf(c)*M+66,50,0],P)});
  out.push({k:depthOf([goalYOf(c)*M+66,50,0],P)-1,id:'gstand',n:<Solid paths={slabOf({x:goalYOf(c)*M+56,y:41,w:20,d:18,r:2},0,3,P,3,.5)} tone="mid"><FaceText transform={topMatrix([goalYOf(c)*M+57,58],3,P,'x')} size={2.2} tone="mid">TURNS/S</FaceText></Solid>});
  void W;return out;},[P,c]);
 return <g data-static>{painted(items)}</g>;
});
