'use client';
import {useMemo,type KeyboardEvent as RKeyboardEvent,type PointerEvent as RPointerEvent,type ReactNode} from 'react';
import {cylinder,depthOf,insetPlan,iso,knurl,lineOnTop,onTop,pathOf,planOutline,radialTicks,ring,segment,sideArc,sideMatrix,sideSeam,slabOf,topMatrix,
 type Flat,type Plan,type Point3,type Projection} from '../anatomy/iso-kit';
import {FaceText} from '../anatomy/draw';
import {Ball,Line,Screw,Solid,basePlate,fit,labelPlate,painted,rulerStrip,scaleOf,type Item} from '../anatomy/paper-kit';
import {Tint,Sphere} from '../anatomy/bench';
import {AIM_MAX,BODY,CHECKS,FOOT_MAX,FOOT_MIN,LINE_W,MIN_GAP,OVER_FROM,ROUNDS,backFoot,joints,judge,landing,lobZ,type Check,type Joints,type Rig,type V3} from './model';

/**
 * throw-in · THE THROW-IN TRAINER, drawn with the anatomy kit in the Paper theme (Oct 14 2026 redo). A heavy bench at the
 * touchline of a model pitch: the touchline and the turf are inlaid in its top, a jointed wooden mannequin (ball pivots at every
 * joint) stands on it facing the pitch, and every setting of the throw is a real control on the bench:
 *  - two FOOT CARRIAGES on railed rulers (drag them across the line: each one pushes its foot by a rod);
 *  - the LIFT LEVER on a three-notch quadrant (flat, heel up, foot off the ground) that raises the back foot;
 *  - the HANDS SWITCH, a toggle with engraved 1 and 2 (one arm drops to the side);
 *  - the ARM KNOB, a knurled knob over a dial whose green arc is "behind and over the head" (measured on the mannequin);
 *  - the REFEREE'S BOX: four flags (one per check of Law 15) that flip up on a foul, a lamp (green fair, red foul) and a whistle
 *    on a hinged arm that tips up when the throw is a foul;
 *  - for the throw: the AIM DIAL (its pointer points where the ball goes), the POWER SLIDE and the RELEASE BUTTON.
 * Team-mates and defenders are smaller mannequins on rails across the model pitch.
 * The view eases from the bench (`zoom` 0) out to the whole pitch (`zoom` 1). `explode` lifts the mannequin into four labelled
 * layers (feet, body, arms, ball).
 */
export type Ctl='footL'|'footR'|'lift'|'hands'|'arm'|'aim'|'power'|'release';
export type View={rig:Rig;aim:number;power:number;zoom:number;explode:number;round:number;phase:'intro'|'build'|'throw'|'score';
 /** the throw in flight: t seconds since the release; at = landing; caught mate */
 fly:{t:number;dur:number;at:[number,number];power:number;result:string;mate:number}|null;slide:number;press:number;whistle:number};
export const LAYERS=[{id:'feet',z:0},{id:'body',z:1},{id:'arms',z:2},{id:'ball',z:3}] as const;
const GAP=46;
export type Layout={wide:boolean;az:number;el:number};
export const layoutOf=(w:number,h:number):Layout=>w/Math.max(1,h)>1.1?{wide:true,az:-146,el:30}:{wide:false,az:-166,el:44};

// Where each control sits on the bench (world cm; the bench top is z = 0).
export const AT={
 bench:{x:-210,y:-160,w:420,d:280,r:14} as Plan,
 railX:34,arm:[-150,-52] as [number,number],hands:[-158,-122] as [number,number],lift:[-78,-124] as [number,number],
 power:[70,-122] as [number,number],aim:[150,-62] as [number,number],release:[160,-128] as [number,number],ref:[-140,62] as [number,number],
};
const GROUND=-18;
const BUILD_PTS:Point3[]=[[-210,-160,GROUND],[210,-160,GROUND],[-210,120,GROUND],[210,120,GROUND],[0,-30,236],[0,30,236]];
const THROW_PTS:Point3[]=[[-640,-170,GROUND],[720,-170,GROUND],[-640,780,GROUND],[720,780,GROUND],[0,0,230]];
/** The camera for a zoom between the bench (0) and the whole pitch (1): projections are linear in origin and scale, so a lerp is exact. */
export function projectionFor(w:number,h:number,zoom:number,top:number,bottom:number,explode=0):Projection{
 const L=layoutOf(w,h),o={pad:w<600?10:30,top,bottom,azimuth:L.az,elevation:L.el};
 const a=fit(explode>0?[...BUILD_PTS,[0,-30,236+explode*GAP*3] as Point3]:BUILD_PTS,w,h,o),b=fit(THROW_PTS,w,h,o),t=zoom;
 return {origin:[a.origin[0]+(b.origin[0]-a.origin[0])*t,a.origin[1]+(b.origin[1]-a.origin[1])*t],scale:a.scale+(b.scale-a.scale)*t,azimuth:L.az,elevation:L.el};
}
/** Dial angles: the arm knob sweeps 270°; a = 0 is the ball at the chest. */
const armDial=(a:number)=>(-135+a*270)*Math.PI/180;
export const armFromDial=(rad:number)=>{let d=rad*180/Math.PI;while(d>180)d-=360;while(d<-180)d+=360;return Math.max(0,Math.min(1,(d+135)/270));};

// ── The mannequin ───────────────────────────────────────────────────────────────────────────────────────────────────────
type Look='wood'|'mate'|'def';
const FILL:Record<Look,string>={wood:'#f4efe4',mate:'#f7f7f3',def:'#5c5c5e'};
const EDGE:Record<Look,string>={wood:'#4a4238',mate:'#3a3a3c',def:'#232325'};
/** A limb: a round bar between two points (a cylinder seen from the side projects to a capsule), with a light band. */
function Cap({a,b,r,look}:{a:Flat;b:Flat;r:number;look:Look}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
 let nx=-dy/l,ny=dx/l;if(nx+ny>0){nx=-nx;ny=-ny;}// the band sits toward the light (top left)
 const o=r*.38,sh=look==='def'?'#46464a':'#e2dccd';
 return <g>
  <path d={d} stroke={EDGE[look]} strokeWidth={r*2+1.5} strokeLinecap="round" fill="none"/>
  <path d={d} stroke={sh} strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]+nx*o*.4).toFixed(1)} ${(a[1]+ny*o*.4).toFixed(1)}L${(b[0]+nx*o*.4).toFixed(1)} ${(b[1]+ny*o*.4).toFixed(1)}`} stroke={FILL[look]} strokeWidth={r*1.3} strokeLinecap="round" fill="none"/>
  {look!=='def'&&<path d={`M${(a[0]+nx*o*1.5).toFixed(1)} ${(a[1]+ny*o*1.5).toFixed(1)}L${(b[0]+nx*o*1.5).toFixed(1)} ${(b[1]+ny*o*1.5).toFixed(1)}`} stroke="#ffffff" strokeWidth={Math.max(.8,r*.32)} strokeLinecap="round" fill="none" opacity={.85}/>}
 </g>;
}
/** A ball pivot with its pin. */
function Pivot({c,r,look}:{c:Flat;r:number;look:Look}){
 return <g><circle cx={c[0]} cy={c[1]} r={r} fill={look==='def'?'#4d4d4f':'#e9e2d2'} stroke={EDGE[look]} strokeWidth={1}/>
  <circle cx={c[0]-r*.28} cy={c[1]-r*.3} r={r*.42} fill="#ffffff" opacity={look==='def'?.18:.8}/>
  <circle cx={c[0]} cy={c[1]} r={Math.max(.7,r*.2)} fill={EDGE[look]}/></g>;
}
const off=(v:V3,o:V3):Point3=>[v[0]+o[0],v[1]+o[1],v[2]+o[2]];
/** The mannequin as depth-sorted items. `lift[i]` raises layer i (feet, body, arms, ball) for the exploded view. `flip` turns it to face −Y. */
export function mannequin(id:string,j:Joints,P:Projection,{look='wood',at=[0,0],flip=false,lift=[0,0,0,0],ball=true,scale=1}:{look?:Look;at?:[number,number];flip?:boolean;lift?:number[];ball?:boolean;scale?:number}={}):Item[]{
 const k=scaleOf(P)*scale,out:Item[]=[];
 const W=(v:V3,layer:number):Point3=>{const x=(flip?-v[0]:v[0])*scale+at[0],y=(flip?-v[1]:v[1])*scale+at[1];return [x,y,v[2]*scale+(lift[layer]||0)];};
 const cap=(a:V3,b:V3,r:number,layer:number,bias=0)=>{const A=W(a,layer),B=W(b,layer);out.push({k:depthOf([(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],P)+bias,id:`${id}-c${out.length}`,n:<Cap a={iso(A,P)} b={iso(B,P)} r={r*k} look={look}/>});};
 const piv=(c:V3,r:number,layer:number,bias=.4)=>{const C=W(c,layer);out.push({k:depthOf(C,P)+bias,id:`${id}-p${out.length}`,n:<Pivot c={iso(C,P)} r={r*k} look={look}/>});};
 // feet layer (0): shins, feet, ankles, knees
 for(const s of ['L','R'] as const){const kn=s==='L'?j.kneeL:j.kneeR,an=s==='L'?j.ankleL:j.ankleR,he=s==='L'?j.heelL:j.heelR,to=s==='L'?j.toeL:j.toeR,hip=s==='L'?j.hipL:j.hipR;
  cap(he,to,4.6,0,-.5);piv(an,3.8,0);cap(kn,an,5,0);piv(kn,5.4,0);cap(hip,kn,6.6,0,-.3);}
 // body layer (1): pelvis, waist, chest, neck, head
 cap(j.hipL,j.hipR,9,1,-1);piv(j.waist,7.4,1,0);
 const chest:V3=[0,j.neck[1]+(j.waist[1]-j.neck[1])*.28,j.neck[2]-(j.neck[2]-j.waist[2])*.28];
 cap(j.waist,chest,11.5,1,-1.2);cap(j.shL,j.shR,5.4,1,-.8);cap(j.neck,j.head,3.4,1,-1.5);
 const H=W(j.head,1);out.push({k:depthOf(H,P)+.2,id:id+'-head',n:<g><Ball cx={iso(H,P)[0]} cy={iso(H,P)[1]-BODY.head*.12*k} r={BODY.head*1.05*k} seams={false} look={look==='def'?'dark':'paper'} edge="hi"/></g>});
 // arms layer (2)
 for(const s of ['L','R'] as const){const sh=s==='L'?j.shL:j.shR,el=s==='L'?j.elL:j.elR,ha=s==='L'?j.haL:j.haR;
  piv(sh,5.6,2);cap(sh,el,5,2);piv(el,4.4,2);cap(el,ha,4.2,2);piv(ha,4.6,2,.6);}
 // the ball (3), in the exhibit's one accent
 if(ball){const B=W(j.ball,3),c=iso(B,P);out.push({k:depthOf(B,P)+(j.ball[1]<j.head[1]?-2:2),id:id+'-ball',n:<g data-ti-ball><Ball cx={c[0]} cy={c[1]} r={BODY.ball*k} look="acc" edge="mid"/></g>});}
 return out;
}

// ── Static parts (built once per camera) ────────────────────────────────────────────────────────────────────────────────
function staticItems(P:Projection,wideView:boolean):Item[]{
 const out:Item[]=[],kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P);
 // The model pitch: mown stripes of turf beyond the line, the white touchline, and the 2 m arc opponents keep out of.
 const turf={x:-720,y:LINE_W,w:1520,d:840,r:0};
 out.push({k:-3e9,id:'turf',n:<g><path className="iso-halo" style={{opacity:.18}} d={slabOf(turf,GROUND-2,2,P,2).fill}/>
  <Tint paths={slabOf(turf,GROUND-2,2,P,2)} color="#b8d0ad" edge="lo" crease={false}/>
  {Array.from({length:8},(_,i)=>i%2?null:<path key={i} d={slabOf({x:-720,y:LINE_W+i*105,w:1520,d:105,r:0},GROUND,0,P,2).top} fill="#aac69e"/>)}
 </g>});
 out.push({k:-2.9e9,id:'line',n:<Solid paths={slabOf({x:-720,y:0,w:1520,d:LINE_W,r:0},GROUND,.6,P,2)} tone="lo" crease="none"/>});
 const arc:Flat[]=[];for(let i=0;i<=48;i++){const a=-Math.PI/2+Math.PI*i/48;arc.push(iso([Math.sin(a)*MIN_GAP,LINE_W+Math.cos(a)*MIN_GAP,GROUND+.2],P));}
 out.push({k:-2.8e9,id:'gap',n:<path d={pathOf(arc)} fill="none" stroke="var(--acc-e)" strokeWidth={1.4} strokeDasharray="6 5" opacity={.7}/>});
 // Rails across the pitch the players slide along.
 for(const r of ROUNDS)for(const p of [...r.mates,...r.defs]){const y=p.y;out.push({k:-2.7e9+y,id:`rail-${r.id}-${p.x}`,n:<g>
  <Solid paths={slabOf({x:p.rail[0]-12,y:y-4,w:p.rail[1]-p.rail[0]+24,d:8,r:3},GROUND,1.2,P,4)} tone="lo" crease="none"/>
  <Line d={lineOnTop([p.rail[0]-6,y],[p.rail[1]+6,y],GROUND+1.2,P)} tone="mid"/>
  <circle cx={iso([p.rail[0]-6,y,GROUND+1.2],P)[0]} cy={iso([p.rail[0]-6,y,GROUND+1.2],P)[1]} r={1.1} fill="var(--anatomy-dot)"/>
  <circle cx={iso([p.rail[1]+6,y,GROUND+1.2],P)[0]} cy={iso([p.rail[1]+6,y,GROUND+1.2],P)[1]} r={1.1} fill="var(--anatomy-dot)"/></g>});}
 // The bench: plate on feet, its inlaid touchline and turf, ruler and label.
 const B=AT.bench;
 out.push(...basePlate('bench',B,P,{h:10,feet:8,inset:20}));
 out.push({k:-9e6,id:'inlay',n:<g>
  <Tint paths={slabOf({x:B.x+8,y:LINE_W,w:B.w-16,d:B.y+B.d-8-LINE_W,r:0},0,.4,P,2)} color="#b8d0ad" edge="lo" crease={false}/>
  {[0,2].map(i=><path key={i} d={slabOf({x:B.x+8,y:LINE_W+18+i*36,w:B.w-16,d:18,r:0},.4,0,P,2).top} fill="#aac69e"/>)}
  <Solid paths={slabOf({x:B.x+8,y:0,w:B.w-16,d:LINE_W,r:0},0,.8,P,2)} tone="mid" crease="none"/>
 </g>});
 out.push(rulerStrip('ruler',B.x+30,B.x+B.w-30,B.y+8,0,P,{d:7,step:5,every:5,k:-8e6}));
 out.push(labelPlate('label',{x:-30,y:B.y+18,w:60,d:13,r:1.5},0,P,-7.9e6));
 // Foot rails with their rulers (the line crosses them at 0–12).
 for(const s of [-1,1]){const x=s*AT.railX,y0=FOOT_MIN-14,y1=FOOT_MAX+14;
  out.push({k:kz(x,0,0)-40,id:'rail'+s,n:<g>
   <Solid paths={slabOf({x:x-5,y:y0,w:10,d:y1-y0,r:2},0,2.4,P,4,.4)} tone="mid"><Line d={lineOnTop([x,y0+3],[x,y1-3],2.4,P)} tone="lo"/></Solid>
   {[y0+3,y1-3].map(y=><Solid key={y} paths={slabOf({x:x-6,y:y-3,w:12,d:6,r:1.5},2.4,3,P,3)} tone="mid"/>)}
   <Solid paths={slabOf({x:x+s*7-3,y:y0,w:6,d:y1-y0,r:1},0,.6,P,3)} tone="lo" crease="none"/>
   <Line d={Array.from({length:Math.floor((y1-y0-4)/4)+1},(_,i)=>{const y=y0+2+i*4,big=i%5===0;return lineOnTop([x+s*7+(s>0?-2.6:2.6)*(big?0:.4)-s*.4,y],[x+s*(7+(big?2.8:1.4)),y],.6,P);}).join('')} tone="lo"/>
  </g>});}
 // The arm knob's dial (the knob itself turns): a pedestal, a dial plate, ticks and the green "over the head" arc.
 {const [x,y]=AT.arm,top=12;
  out.push({k:kz(x,y,0),id:'armDial',n:<g>
   <Solid paths={slabOf({x:x-30,y:y-30,w:60,d:60,r:6},0,8,P,6,1)} tone="mid" inner={<Line d={sideSeam({x:x-30,y:y-30,w:60,d:60,r:6},3,P,6)} tone="faint"/>}>
    {[[x-24,y-24],[x+24,y-24],[x-24,y+24],[x+24,y+24]].map(([a,b],i)=><Screw key={i} x={a} y={b} z={8} P={P} r={1.6}/>)}</Solid>
   <Solid paths={cylinder(x,y,25,8,top-8,P,56,.6)} tone="hi"/>
   <path d={arcBand(x,y,17,23.5,armDial(OVER_FROM),armDial(1),top,P)} className="iso-acc-fill" opacity={.85}/>
   <Line d={radialTicks(x,y,23.5,28,4,top,[2.6,4.4],P,armDial(0)-0*Math.PI,Math.PI*1.5).minor} tone="lo"/>
   <Line d={radialTicks(x,y,23.5,28,4,top,[2.6,4.4],P,armDial(0),Math.PI*1.5).major} tone="mid"/>
  </g>});}
 // Hands switch box with 1 and 2 engraved.
 {const [x,y]=AT.hands,b={x:x-22,y:y-15,w:44,d:30,r:4};
  out.push({k:kz(x,y,0)-1,id:'handsBox',n:<Solid paths={slabOf(b,0,14,P,6,1)} tone="mid" inner={<Line d={sideSeam(b,5,P,6)} tone="faint"/>}>
   <Line d={planOutline(insetPlan(b,3),14,P,6)} tone="faint"/>
   <Solid paths={slabOf({x:x-11,y:y-4,w:22,d:8,r:3},14,2,P,4)} tone="hi"/>
   <FaceText transform={topMatrix([x-17,y+9],14,P,'x')} size={7} tone="hi">1</FaceText>
   <FaceText transform={topMatrix([x+12,y+9],14,P,'x')} size={7} tone="hi">2</FaceText>
  </Solid>});}
 // Lift lever's quadrant with three notches.
 {const [x,y]=AT.lift,b={x:x-24,y:y-12,w:48,d:24,r:3};
  out.push({k:kz(x,y,0)-1,id:'liftBase',n:<g><Solid paths={slabOf(b,0,6,P,4,.8)} tone="mid"/>
   <Solid paths={slabOf({x:x-20,y:y-2,w:40,d:4,r:1},6,16,P,3)} tone="hi" inner={<Line d={sideSeam({x:x-20,y:y-2,w:40,d:4,r:1},10,P,3)} tone="faint"/>}/>
   {[-1,0,1].map(i=>{const a=i*.62,px=x+Math.sin(a)*17,pz=6+Math.cos(a)*17;return <circle key={i} cx={iso([px,y-2.1,pz],P)[0]} cy={iso([px,y-2.1,pz],P)[1]} r={1.3} fill="var(--anatomy-dot)"/>;})}
  </g>});}
 // Power slide's slotted plate, with its ruler.
 {const [x,y]=AT.power,b={x:x-34,y:y-12,w:68,d:24,r:4};
  out.push({k:kz(x,y,0)-1,id:'powerBase',n:<Solid paths={slabOf(b,0,7,P,6,1)} tone="mid" inner={<Line d={sideSeam(b,3,P,6)} tone="faint"/>}>
   <Solid paths={slabOf({x:x-26,y:y-2,w:52,d:4,r:2},6.4,.6,P,4)} tone="lo" crease="none"/>
   <Line d={Array.from({length:11},(_,i)=>lineOnTop([x-25+i*5,y+5],[x-25+i*5,y+(i%5===0?10:7.5)],7,P)).join('')} tone="mid"/>
  </Solid>});}
 // Aim dial: a turntable plate with ticks every 15°; its pointer turns.
 {const [x,y]=AT.aim;
  out.push({k:kz(x,y,0)-1,id:'aimBase',n:<g><Solid paths={cylinder(x,y,30,0,6,P,60,.8)} tone="mid" inner={<Line d={sideArc(x,y,30,3,P,40)} tone="faint"/>}/>
   <Line d={radialTicks(x,y,28,24,4,6,[2.4,4.2],P,0,Math.PI*2).minor} tone="lo"/>
   <Line d={radialTicks(x,y,28,24,4,6,[2.4,4.2],P,0,Math.PI*2).major} tone="mid"/></g>});}
 // Release button housing.
 {const [x,y]=AT.release;
  out.push({k:kz(x,y,0)-1,id:'relBase',n:<g><Solid paths={slabOf({x:x-18,y:y-18,w:36,d:36,r:5},0,10,P,6,1)} tone="mid" inner={<Line d={sideSeam({x:x-18,y:y-18,w:36,d:36,r:5},4,P,6)} tone="faint"/>}>
   {[[x-13,y-13],[x+13,y-13],[x-13,y+13],[x+13,y+13]].map(([a,b],i)=><Screw key={i} x={a} y={b} z={10} P={P} r={1.4}/>)}</Solid>
   <Solid paths={cylinder(x,y,12,10,3,P,40,.5)} tone="hi"/></g>});}
 // The referee's box.
 {const [x,y]=AT.ref,b={x:x-44,y:y-26,w:88,d:52,r:5};
  out.push({k:kz(x,y,0)-6,id:'refBox',n:<Solid paths={slabOf(b,0,34,P,6,1.2)} tone="mid" inner={<>{[10,24].map(z=><Line key={z} d={sideSeam(b,z,P,6)} tone="faint"/>)}</>}>
   <Line d={planOutline(insetPlan(b,4),34,P,6)} tone="faint"/>
   {[[x-38,y-20],[x+38,y-20],[x-38,y+20],[x+38,y+20]].map(([a,c],i)=><Screw key={i} x={a} y={c} z={34} P={P} r={1.5}/>)}
  </Solid>});}
 void wideView;
 return out;
}
/** A band between two radii on a top face, from angle a0 to a1 (clockwise from +Y toward +X). */
function arcBand(x:number,y:number,r0:number,r1:number,a0:number,a1:number,z:number,P:Projection){
 const pts:Flat[]=[],n=24;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;pts.push(iso([x+Math.sin(a)*r1,y+Math.cos(a)*r1,z],P));}
 for(let i=n;i>=0;i--){const a=a0+(a1-a0)*i/n;pts.push(iso([x+Math.sin(a)*r0,y+Math.cos(a)*r0,z],P));}return pathOf(pts,true);
}

/** Where things are on screen (for the HTML labels and the hit targets). */
export function anchors(v:View,P:Projection){
 const j=joints(v.rig),lift=LAYERS.map(l=>v.explode*GAP*l.z);
 return {
  feet:iso([0,(v.rig.footL+v.rig.footR)/2,6+lift[0]],P),body:iso([j.waist[0],j.waist[1],j.waist[2]+20+lift[1]],P),
  arms:iso([j.elR[0],j.elR[1],j.elR[2]+lift[2]],P),ball:iso([j.ball[0],j.ball[1],j.ball[2]+lift[3]],P),
 };
}

export function Scene({w,h,P,v,focusCtl,onCtlDown,onCtlKey,labels}:{w:number;h:number;P:Projection;v:View;focusCtl:Ctl|null;
 onCtlDown:(c:Ctl,e:RPointerEvent<SVGElement>)=>void;onCtlKey:(c:Ctl,e:RKeyboardEvent<SVGElement>)=>void;labels:ReactNode}){
 const wide=layoutOf(w,h).wide;
 const stat=useMemo(()=>staticItems(P,wide),[P,wide]);
 const k=scaleOf(P),r=v.rig,verdict=judge(r),fly=v.fly,items:Item[]=[...stat];
 const lift=LAYERS.map(l=>v.explode*GAP*l.z);
 // The swing: the arms come over in the first quarter second of the throw.
 const swing=fly?Math.min(1,fly.t/.25):0,j=joints(r,swing);
 const released=!!fly&&fly.t>.25;
 items.push(...mannequin('thrower',j,P,{lift,ball:!released}));
 // Explode guides: a thin dashed post between the layers.
 if(v.explode>.02)items.push({k:depthOf([0,j.pelvis[1],0],P)-60,id:'guides',n:<g opacity={Math.min(1,v.explode*2)}>
  <path d={segment([0,j.pelvis[1]-34,0],[0,j.pelvis[1]-34,240+lift[3]],P)} stroke="var(--anatomy-faint)" strokeWidth={1.2} strokeDasharray="4 4" fill="none"/></g>});
 // The ball in flight, with its shadow on the turf.
 if(released&&fly){const u=Math.min(1,(fly.t-.25)/fly.dur),x=fly.at[0]*u,y=j.ball[1]+(fly.at[1]-j.ball[1])*u,z=lobZ(fly.power,u)+GROUND*(u>.98?1:0);
  const zz=u>=1?GROUND+BODY.ball:z,c=iso([x,y,zz],P),sc=iso([x,y,GROUND],P);
  items.push({k:depthOf([x,y,GROUND],P)-1,id:'ballShadow',n:<ellipse cx={sc[0]} cy={sc[1]} rx={BODY.ball*k*1.1} ry={BODY.ball*k*.55} className="iso-halo" style={{opacity:.25,filter:'blur(2px)',transform:'none'}}/>});
  const trail:Flat[]=[];for(let i=0;i<=24;i++){const uu=u*i/24;trail.push(iso([fly.at[0]*uu,j.ball[1]+(fly.at[1]-j.ball[1])*uu,lobZ(fly.power,uu)],P));}
  items.push({k:depthOf([x,y,zz],P)+300,id:'trail',n:<path d={pathOf(trail)} fill="none" stroke="var(--acc)" strokeWidth={2} strokeDasharray="1 5" strokeLinecap="round" opacity={.8}/>});
  items.push({k:depthOf([x,y,zz],P)+300.5,id:'ballFly',n:<g data-ti-ball="fly"><Ball cx={c[0]} cy={c[1]} r={BODY.ball*k} look="acc" edge="mid"/></g>});}
 // The aim line and the landing ring on the pitch (throw phase).
 if(v.phase==='throw'&&!fly){const at=landing(v.aim,v.power),pts:Flat[]=[];for(let i=0;i<=24;i++){const u=i/24;pts.push(iso([at[0]*u,LINE_W+(at[1]-LINE_W)*u,GROUND+.4],P));}
  items.push({k:-2.6e9,id:'aimLine',n:<g><path d={pathOf(pts)} fill="none" stroke="var(--acc)" strokeWidth={2} strokeDasharray="7 6" opacity={.75}/>
   <path d={ring(at[0],at[1],60,GROUND+.4,P,40)} fill="color-mix(in srgb,var(--acc) 18%,transparent)" stroke="var(--acc)" strokeWidth={1.6}/>
   <path d={ring(at[0],at[1],14,GROUND+.4,P,24)} fill="var(--acc)" opacity={.6}/></g>});}
 // Team-mates and defenders on their rails.
 if(v.phase==='throw'||v.phase==='score'){const R=ROUNDS[Math.min(v.round,ROUNDS.length-1)],stand=joints({footL:-6,footR:6,lift:0,hands:2,arm:.12});
  const slideX=(p:{x:number;rail:[number,number]})=>p.rail[0]+(p.x-p.rail[0])*v.slide;
  R.mates.forEach((m,i)=>{const hop=fly&&fly.mate===i&&fly.result==='caught'&&fly.t>.25+fly.dur?Math.sin(Math.min(1,(fly.t-.25-fly.dur)/.4)*Math.PI)*18:0;
   items.push(...mannequin('mate'+i,{...stand},P,{look:'mate',at:[slideX(m),m.y],flip:true,ball:false,lift:[hop,hop,hop,hop]}));
   items.push({k:depthOf([slideX(m),m.y,GROUND],P)-5,id:'mateHalo'+i,n:<path d={ring(slideX(m),m.y,26,GROUND+.5,P,28)} fill="color-mix(in srgb,var(--acc) 30%,transparent)" stroke="var(--acc)" strokeWidth={1.4}/>});});
  R.defs.forEach((d,i)=>items.push(...mannequin('def'+i,stand,P,{look:'def',at:[slideX(d),d.y],flip:true,ball:false})));}
 // Moving parts of the controls.
 items.push(...controls(P,v,verdict.fouls,k));
 // Hit targets (on top of everything), each one focusable, with keyboard.
 const hits=hitTargets(v,P,k);
 return <svg className="iso-svg" viewBox={`0 0 ${w} ${h}`} role="group" aria-label="The throw-in trainer">
  <g>{painted(items)}</g>
  {labels}
  <g data-hits>{hits.filter(h=>h.on).map(hh=><circle key={hh.c} cx={hh.at[0]} cy={hh.at[1]} r={hh.r} className="iso-hit" data-ctl={hh.c} data-focus={focusCtl===hh.c||undefined}
   tabIndex={0} role={hh.role} aria-label={hh.label} aria-valuetext={hh.value} aria-valuenow={hh.now} aria-valuemin={hh.role==='slider'?0:undefined} aria-valuemax={hh.role==='slider'?100:undefined}
   onPointerDown={e=>onCtlDown(hh.c,e)} onKeyDown={e=>onCtlKey(hh.c,e)}/>)}</g>
 </svg>;
}

type Hit={c:Ctl;at:Flat;r:number;on:boolean;role:'slider'|'button'|'switch';label:string;value:string;now?:number};
const LIFT_WORD=['flat','heel up','off the ground'];
export function hitTargets(v:View,P:Projection,k=scaleOf(P)):Hit[]{
 const r=v.rig,min=22,throwOn=v.phase==='throw'&&!v.fly,on=v.phase==='build'||v.phase==='throw';
 const R=(world:number)=>Math.max(min,world*k);
 return [
  {c:'footL',at:iso([-AT.railX,r.footL,6],P),r:R(12),on,role:'slider',label:'Left foot carriage: drag across the line',value:`${Math.round(r.footL)} cm`,now:Math.round((r.footL-FOOT_MIN)/(FOOT_MAX-FOOT_MIN)*100)},
  {c:'footR',at:iso([AT.railX,r.footR,6],P),r:R(12),on,role:'slider',label:'Right foot carriage: drag across the line',value:`${Math.round(r.footR)} cm`,now:Math.round((r.footR-FOOT_MIN)/(FOOT_MAX-FOOT_MIN)*100)},
  {c:'lift',at:iso([AT.lift[0],AT.lift[1],20],P),r:R(20),on,role:'slider',label:'Lift lever for the back foot',value:LIFT_WORD[r.lift],now:r.lift*50},
  {c:'hands',at:iso([AT.hands[0],AT.hands[1],18],P),r:R(20),on,role:'switch',label:`Hands switch: ${r.hands===2?'two hands':'one hand'}`,value:r.hands===2?'two hands':'one hand'},
  {c:'arm',at:iso([AT.arm[0],AT.arm[1],16],P),r:R(28),on,role:'slider',label:'Arm knob: where the ball starts',value:r.arm>=OVER_FROM?'behind and over the head':'in front of the head',now:Math.round(r.arm*100)},
  {c:'aim',at:iso([AT.aim[0],AT.aim[1],8],P),r:R(30),on:throwOn,role:'slider',label:'Aim dial',value:`${Math.round(v.aim)} degrees`,now:Math.round((v.aim+AIM_MAX)/(2*AIM_MAX)*100)},
  {c:'power',at:iso([AT.power[0]-26+v.power*52,AT.power[1],16],P),r:R(16),on:throwOn,role:'slider',label:'Power slide',value:`${Math.round(v.power*100)} percent`,now:Math.round(v.power*100)},
  {c:'release',at:iso([AT.release[0],AT.release[1],13],P),r:R(18),on:throwOn,role:'button',label:'Release: throw the ball',value:''},
 ];
}

function controls(P:Projection,v:View,fouls:readonly Check[],k:number):Item[]{
 const out:Item[]=[],r=v.rig,kz=(x:number,y:number,z:number)=>depthOf([x,y,z],P),j=joints(r);
 // Foot carriages with a knurled thumb knob and the push rod to the heel.
 for(const s of ['L','R'] as const){const x=(s==='L'?-1:1)*AT.railX,y=s==='L'?r.footL:r.footR,heel=s==='L'?j.heelL:j.heelR,sg=s==='L'?-1:1;
  out.push({k:kz(x,y,4),id:'car'+s,n:<g data-carriage={s}>
   <Solid paths={slabOf({x:x-8,y:y-9,w:16,d:18,r:2.5},2.4,5,P,4,.6)} tone="hi"/>
   <Solid paths={cylinder(x,y,5,7.4,7,P,28,.4)} tone="hi" inner={<Line d={knurl(x,y,5,8,13.6,22,P,.2)} tone="faint"/>}/>
   <Line d={ring(x,y,2.4,14.4,P,16)} tone="lo"/>
   <Line d={segment([x-sg*8,y,5],[heel[0]+sg*2,heel[1]+4,Math.max(3,heel[2]-1)],P)} tone="hi"/>
   <circle cx={iso([heel[0]+sg*2,heel[1]+4,Math.max(3,heel[2]-1)],P)[0]} cy={iso([heel[0]+sg*2,heel[1]+4,Math.max(3,heel[2]-1)],P)[1]} r={1.3} fill="var(--anatomy-dot)"/>
  </g>});}
 // Lift lever: swings across the quadrant.
 {const [x,y]=AT.lift,a=(r.lift-1)*.62,base=iso([x,y-3,6],P),tip=iso([x+Math.sin(a)*26,y-3,6+Math.cos(a)*26],P);
  out.push({k:kz(x,y,10)+2,id:'liftLever',n:<g data-lift={r.lift}><Rod a={base} b={tip} r={1.9*k}/><Ball cx={tip[0]} cy={tip[1]} r={4.4*k} seams={false} edge="hi"/>
   <circle cx={base[0]} cy={base[1]} r={2.6*k} fill="var(--anatomy-paper)" className="iso-line" data-tone="hi"/></g>});}
 // Hands toggle: a bat lever leaning to 1 or 2.
 {const [x,y]=AT.hands,a=r.hands===2?.55:-.55,base=iso([x,y,16],P),tip=iso([x+Math.sin(a)*16,y,16+Math.cos(a)*16],P);
  out.push({k:kz(x,y,16)+2,id:'handsLever',n:<g data-hands={r.hands}><Rod a={base} b={tip} r={1.8*k}/><Ball cx={tip[0]} cy={tip[1]} r={3.4*k} seams={false} edge="hi"/></g>});}
 // Arm knob: a knurled knob whose pointer points along the dial.
 {const [x,y]=AT.arm,a=armDial(r.arm),z=12;
  out.push({k:kz(x,y,z)+3,id:'armKnob',n:<g data-arm={r.arm.toFixed(2)}>
   <Solid paths={cylinder(x,y,14,z,9,P,48,.6)} tone="hi" inner={<Line d={knurl(x,y,14,z+1,z+8,48,P,.2)} tone="faint"/>}/>
   <Line d={ring(x,y,10,z+9,P,40)} tone="faint"/>
   <path d={lineOnTop([x+Math.sin(a)*2,y+Math.cos(a)*2],[x+Math.sin(a)*13,y+Math.cos(a)*13],z+9.1,P)} stroke={r.arm>=OVER_FROM?'var(--acc)':'var(--anatomy-hi)'} strokeWidth={3} strokeLinecap="round"/>
   <circle cx={iso([x,y,z+9],P)[0]} cy={iso([x,y,z+9],P)[1]} r={1.4} fill="var(--anatomy-dot)"/></g>});}
 // Aim dial pointer: points the way the ball will go.
 {const [x,y]=AT.aim,a=v.aim*Math.PI/180;
  const ptr:[number,number][]=[[-2.4,0],[2.4,0],[1.2,25],[-1.2,25]].map(([u,w2])=>[x+u*Math.cos(a)+w2*Math.sin(a),y-u*Math.sin(a)+w2*Math.cos(a)]);
  out.push({k:kz(x,y,6)+3,id:'aimPtr',n:<g data-aim={Math.round(v.aim)}>
   <Solid paths={cylinder(x,y,9,6,6,P,36,.5)} tone="hi" inner={<Line d={knurl(x,y,9,6.8,11.2,30,P,.2)} tone="faint"/>}/>
   <path d={onTop(ptr,12,P,true)} fill="var(--acc)" stroke="var(--acc-e)" strokeWidth={1}/>
   <circle cx={iso([x,y,12],P)[0]} cy={iso([x,y,12],P)[1]} r={1.5} fill="var(--anatomy-dot)"/></g>});}
 // Power slide: a carriage in the slot with a lever and a ball knob, leaning forward with the power.
 {const [x,y]=AT.power,cx=x-26+v.power*52,top=iso([cx,y,7.4],P),tip=iso([cx+6,y,26],P);
  out.push({k:kz(cx,y,8)+2,id:'powerCar',n:<g data-power={v.power.toFixed(2)}><Solid paths={slabOf({x:cx-6,y:y-7,w:12,d:14,r:2},7,4,P,3,.4)} tone="hi"/>
   <Rod a={top} b={tip} r={1.8*k}/><Ball cx={tip[0]} cy={tip[1]} r={4.6*k} seams={false} edge="hi"/></g>});}
 // Release button: pushes in.
 {const [x,y]=AT.release,dz=v.press*2.4;
  out.push({k:kz(x,y,13)+2,id:'relBtn',n:<g data-press={v.press>0||undefined}><g className="acc"><Solid paths={cylinder(x,y,9,13-dz,4,P,40,.6)} tone="hi" className="acc"/></g></g>});}
 // The referee's box: four flags, the lamp and the whistle.
 {const [x,y]=AT.ref,fair=fouls.length===0;
  CHECKS.forEach((c,i)=>{const fx=x-30+i*20,fy=y+8,bad=fouls.includes(c),up=bad?1:0;
   const pole=iso([fx,fy,34],P),poleTop=iso([fx,fy,60],P);
   const flag=up?[[fx,fy,60],[fx+15,fy,55.5],[fx,fy,51]]:[[fx,fy,36],[fx+.5,fy-12,36],[fx,fy,40]];
   out.push({k:kz(fx,fy,40)+5+i*.01,id:'flag'+c,n:<g data-flag={c} data-up={bad||undefined}>
    <Solid paths={cylinder(fx,fy,2.6,34,2,P,20,.3)} tone="mid"/>
    <path d={`M${pole[0]} ${pole[1]}L${poleTop[0]} ${poleTop[1]}`} stroke="var(--anatomy-hi)" strokeWidth={1.6}/>
    <path d={pathOf(flag.map(p=>iso(p as Point3,P)),true)} fill={bad?'#d23b2f':'#f7f7f3'} stroke={bad?'#7d1d16':'var(--anatomy-mid)'} strokeWidth={1}/>
    {!bad&&<circle cx={iso([fx-5,fy-5,34.2],P)[0]} cy={iso([fx-5,fy-5,34.2],P)[1]} r={2.2*k+.6} fill="var(--acc)"/>}
    <FaceText transform={sideMatrix([fx-3.2,y+26],26,P,'left')} size={9} tone="hi">{String(i+1)}</FaceText>
   </g>});});
  const lx=x+30,ly=y-14,lamp=iso([lx,ly,66],P);
  out.push({k:kz(lx,ly,50)+6,id:'lamp',n:<g data-lamp={fair?'fair':'foul'}>
   <Solid paths={cylinder(lx,ly,7,34,4,P,28,.4)} tone="mid"/><Solid paths={cylinder(lx,ly,2.6,38,18,P,20)} tone="hi"/>
   <Solid paths={cylinder(lx,ly,10,56,3,P,32,.4)} tone="mid"/>
   <circle cx={lamp[0]} cy={lamp[1]} r={16*k*1.6} fill={fair?'#2fbf71':'#ff4b3a'} opacity={.22} style={{filter:'blur(4px)'}}/>
   <Sphere c={lamp} r={10.5*k} color={fair?'#2fa866':'#d93a2c'}/>
   <Solid paths={cylinder(lx,ly,10.6,58.6,1.2,P,32,.3)} tone="mid"/>
  </g>});
  // Whistle on a hinged arm: lies down when fair, tips up (and shakes as it blows) on a foul.
  const wx=x-36,wy=y-16,tilt=(fair?0:1)*1.1+Math.sin(v.whistle*30)*v.whistle*.25,piv=iso([wx,wy,36],P),end=iso([wx,wy+Math.cos(tilt)*18,36+Math.sin(tilt)*18],P);
  out.push({k:kz(wx,wy,40)+6,id:'whistle',n:<g data-whistle={fair?'down':'up'}>
   <Solid paths={slabOf({x:wx-4,y:wy-4,w:8,d:8,r:1.5},34,3,P,3)} tone="mid"/>
   <Rod a={piv} b={end} r={1.4*k}/>
   <Sphere c={end} r={5.2*k} color="#c9c9c4"/>
   <circle cx={end[0]} cy={end[1]} r={1.6*k} fill="#3a3a3c"/>
  </g>});}
 return out;
}

/** A round bar between two screen points. */
export function Rod({a,b,r}:{a:Flat;b:Flat;r:number}){
 const d=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`,dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g>
  <path d={d} stroke="var(--anatomy-hi)" strokeWidth={r*2+1.6} strokeLinecap="round" fill="none"/>
  <path d={d} stroke="var(--anatomy-shade-1)" strokeWidth={r*2} strokeLinecap="round" fill="none"/>
  <path d={`M${(a[0]-nx*r*.35).toFixed(1)} ${(a[1]-ny*r*.35).toFixed(1)}L${(b[0]-nx*r*.35).toFixed(1)} ${(b[1]-ny*r*.35).toFixed(1)}`} stroke="#ffffff" strokeWidth={r*.7} strokeLinecap="round" fill="none" opacity={.9}/>
 </g>;
}
export {backFoot};
