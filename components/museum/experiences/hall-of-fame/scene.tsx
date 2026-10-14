'use client';
import {memo,type ReactNode} from 'react';
import * as k from '../anatomy/iso-kit';
import {Solid,Line,Dots,Wire,FaceText} from '../anatomy/draw';
import {drawTrophy,MATS,type Mark,type Mat,type Pose,type Trophyish} from './model';
import {TROPHIES,byId,footOf,reach,type Trophy,type TrophyId} from './trophies';

/**
 * Trophy room · the furniture (Oct 12 2026), drawn with the shared anatomy kit (../anatomy/iso-kit, ../anatomy/draw) in the Paper
 * theme: off-white solids in four tones, hairlines, a soft halo under each base. Colour only where colour is the subject (gold,
 * silver, malachite, wood) and one accent, yellow, for what you earned and what you picked.
 *  - the cabinet: a glass-fronted display case, every trophy at true size on its own puck with a label plate;
 *  - the turntable stand: a plate on feet, a knurled turntable with a crank, and a height gauge (a ruler column with a sliding
 *    arm that comes down onto the trophy's top: the readout is the arm's height);
 *  - the plinths of the matching game, with a paper screen for the shadow round;
 *  - the measuring bench: a pan balance (a Roberval: the pans stay level while the beam tips) with a ruler column between.
 * World units are centimetres: x along the furniture, y into it, z up. One camera everywhere: azimuth 62°, elevation 20°.
 */
export const AZ=62,EL=20,ACCENT='#f2c230';
export type Box={x:number;y:number;w:number;h:number};
const D2R=Math.PI/180;
export const kOf=(P:k.Projection)=>k.cameraOf(P).k;
export const poseAt=(P:k.Projection,x:number,y:number,z:number,spin:number,apart=0,sil=false):Pose=>({c:k.iso([x,y,z],P),k:kOf(P),elev:P.elevation??EL,spin,apart,sil});

/** The sphere shading, once per svg. */
export function TrophyDefs(){
 return <defs>{(Object.keys(MATS) as Mat[]).map(m=><radialGradient key={m} id={`tr-ball-${m}`} cx=".36" cy=".3" r=".8">
  <stop offset="0" stopColor={MATS[m].ball[0]}/><stop offset=".55" stopColor={MATS[m].ball[1]}/><stop offset="1" stopColor={MATS[m].ball[2]}/></radialGradient>)}
  {(Object.keys(MATS) as Mat[]).map(m=><linearGradient key={'in'+m} id={`tr-in-${m}`} x1="0" y1="0" x2="0" y2="1">
   <stop offset="0" stopColor={MATS[m].t[1]}/><stop offset=".45" stopColor={MATS[m].t[2]}/><stop offset=".8" stopColor={MATS[m].t[4]}/><stop offset="1" stopColor={MATS[m].inner}/></linearGradient>)}</defs>;
}
export function Marks({list}:{list:readonly Mark[]}){
 return <>{list.map((m,i)=><path key={i} d={m.d} fill={m.fill??'none'} stroke={m.stroke} strokeWidth={m.w} opacity={m.op} strokeLinecap="round" strokeLinejoin="round"/>)}</>;
}
/** One trophy at a pose (memoised: a static trophy is painted once). */
export const TrophyArt=memo(function TrophyArt({t,pose}:{t:Trophyish;pose:Pose}){return <Marks list={drawTrophy(t,pose).marks}/>;},
 (a,b)=>a.t===b.t&&a.pose.c[0]===b.pose.c[0]&&a.pose.c[1]===b.pose.c[1]&&a.pose.k===b.pose.k&&a.pose.spin===b.pose.spin&&a.pose.apart===b.pose.apart&&a.pose.sil===b.pose.sil);

// ── Shared parts ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** A base plate on four feet: halo, bevelled slab with a side seam, a groove, corner screws, and a ruler strip on the front edge. */
export function Plate({plan,z,h,P,ruler=true}:{plan:k.Plan;z:number;h:number;P:k.Projection;ruler?:boolean}){
 const top=z+h,feet=k.corners(plan,16).sort((a,b)=>k.depthOf([...a,0],P)-k.depthOf([...b,0],P));
 const strip:k.Plan={x:plan.x+34,y:plan.y+plan.d-10,w:plan.w-68,d:6,r:1};
 const t=k.topTicks(strip.x+3,strip.x+strip.w-3,2,5,strip.y+.6,top+.5,[1.8,3.2],P,'x');
 return <g data-plate="">
  <path className="iso-halo" d={k.slabOf(plan,z-5,h,P).fill}/>
  {feet.map(([x,y],i)=><g key={i}><Solid paths={k.cylinder(x,y,7,z-5,2,P,24)} tone="mid"/><Solid paths={k.cylinder(x,y,5,z-3,3,P,24)} tone="mid"/></g>)}
  <Solid paths={k.slabOf(plan,z,h,P,8,1.2)} tone="mid" inner={<Line d={k.sideSeam(plan,z+h*.45,P)} tone="faint"/>}/>
  <Line d={k.planOutline(k.insetPlan(plan,5),top,P)} tone="lo"/>
  {k.corners(plan,10).map(([x,y],i)=><Line key={i} d={k.ring(x,y,2.2,top,P,16)} tone="lo"/>)}
  <Dots points={k.corners(plan,10).map(([x,y])=>k.iso([x,y,top],P))} size={.6} tone="hi"/>
  {ruler&&<><Solid paths={k.slabOf(strip,top,.5,P,3)} tone="lo" crease="none"/><Line d={t.minor} tone="lo"/><Line d={t.major} tone="mid"/></>}
 </g>;
}
/** A label plate lying on a surface: a framed plate, three rule lines that stand for its text, two screws. */
export function Label({x,y,w,d,z,P,lit=false,text}:{x:number;y:number;w:number;d:number;z:number;P:k.Projection;lit?:boolean;text?:string}){
 return <g data-label="">
  <Solid paths={k.slabOf({x,y,w,d,r:1},z,.7,P,3)} tone="mid" lit={lit}/>
  <Line d={k.planOutline({x:x+1.2,y:y+1.2,w:w-2.4,d:d-2.4,r:.5},z+.7,P,3)} tone="faint"/>
  {text?<FaceText transform={k.topMatrix([x+3.2,y+d*.66],z+.7,P)} size={Math.min(3.4,d*.5)} tone="hi">{text}</FaceText>
   :[.32,.55,.78].map((f,i)=><Line key={i} d={k.lineOnTop([x+3,y+d*f],[x+3+(w-9)*[1,.7,.5][i],y+d*f],z+.7,P)} tone="lo" free/>)}
  <Dots points={[k.iso([x+w-2.2,y+d*.3,z+.7],P),k.iso([x+w-2.2,y+d*.72,z+.7],P)]} size={.5} tone="hi"/>
  {lit&&<path d={k.slabOf({x:x+w-6,y:y+1.6,w:3.6,d:3.6,r:1.8},z+.7,.6,P,6).fill} fill={ACCENT} stroke="var(--anatomy-hi)" strokeWidth={.6}/>}
 </g>;
}
/** A turned puck (a trophy's stand on a shelf or a pan). */
export const Puck=({x,y,z,r,P}:{x:number;y:number;z:number;r:number;P:k.Projection})=><g>
 <Solid paths={k.cylinder(x,y,r,z,1.6,P,40,.4)} tone="mid"/><Line d={k.ring(x,y,r-1.4,z+1.6,P,40)} tone="faint"/></g>;

// ── 1. The cabinet ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** Rows top first (reading order). Wide cards: one long vitrine, each bay as wide as its trophy. Tall: 3 × 3 even bays. */
export type CabLayout={rows:readonly (readonly (TrophyId|'yours')[])[];minBay:number};
export const CAB_WIDE:CabLayout={rows:[['worldcup','womens','ucl','copa','afcon','euro','asian','facup']],minBay:0};
export const CAB_TALL:CabLayout={rows:[['worldcup','womens','ucl'],['copa','afcon','euro'],['asian','facup','yours']],minBay:66};
const CH=94,CD=34,WALL=3,DIV=2,SHELF=3,BASE=14;
/** The cabinet is seen nearly face on (the bays are narrow and deep things would hide behind the dividers). */
export const AZ_CAB=74;
const bayOf=(id:TrophyId|'yours',min:number)=>Math.max(min,id==='yours'?42:Math.max(34,2*reach(byId(id)!)+12));
export type Slot={id:TrophyId|'yours';row:number;x0:number;x1:number;x:number;y:number;z:number;first:boolean};
export function cabinet(L:CabLayout){
 const n=L.rows.length,widths=L.rows.map(r=>r.reduce((a,id)=>a+bayOf(id,L.minBay),0)+(r.length-1)*DIV),inner=Math.max(...widths),W=inner+WALL*2;
 const top=BASE+n*(CH+SHELF)+SHELF,slots:Slot[]=[];
 L.rows.forEach((r,ri)=>{const row=n-1-ri,f=(inner-(r.length-1)*DIV)/r.reduce((a,id)=>a+bayOf(id,L.minBay),0);let x=WALL;
  r.forEach((id,i)=>{const w=bayOf(id,L.minBay)*f;slots.push({id,row,x0:x,x1:x+w,x:x+w/2,y:CD/2+1,z:BASE+row*(CH+SHELF)+SHELF,first:i===0});x+=w+DIV;});});
 return {W,top,rows:n,slots,points:k.boxCorners({x:-6,y:-4,w:W+12,d:CD+10,r:0},-8,top+10)};
}
export function Cabinet({L,P,seen,spin,hot}:{L:CabLayout;P:k.Projection;seen:ReadonlySet<string>;spin:number;hot:string|null}){
 const C=cabinet(L),W=C.W,top=C.top,front=CD+4;
 const rows=Array.from({length:C.rows},(_,r)=>r);
 return <g data-cabinet="">
  {/* plinth on feet, back and left walls */}
  <path className="iso-halo" d={k.slabOf({x:0,y:0,w:W,d:CD+4,r:2},-6,top,P).fill}/>
  {k.corners({x:0,y:0,w:W,d:CD+4,r:0},8).sort((a,b)=>k.depthOf([...a,0],P)-k.depthOf([...b,0],P)).map(([x,y],i)=><Solid key={i} paths={k.cylinder(x,y,4,-6,6,P,20)} tone="mid"/>)}
  <Solid paths={k.slabOf({x:0,y:0,w:W,d:CD+4,r:1},0,BASE,P,4,1)} tone="mid" inner={<Line d={k.sideSeam({x:0,y:0,w:W,d:CD+4,r:1},BASE-4,P,4)} tone="faint"/>}/>
  <Solid paths={k.slabOf({x:0,y:0,w:W,d:3,r:0},BASE,top-BASE,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:0,y:0,w:WALL,d:CD+4,r:0},BASE,top-BASE,P,1)} tone="mid"/>
  {rows.map(r=>{const z0=BASE+r*(CH+SHELF),inRow=C.slots.filter(s=>s.row===r);return <g key={r} data-row={r}>
   {/* the shelf this row stands on and the back panel's grooves (three per bay) */}
   <Solid paths={k.slabOf({x:WALL,y:3,w:W-WALL*2,d:CD+1,r:0},z0,SHELF,P,1)} tone="mid"/>
   <Line d={inRow.flatMap(s=>[.25,.5,.75].map(f=>k.segment([s.x0+(s.x1-s.x0)*f,3,z0+SHELF+.5],[s.x0+(s.x1-s.x0)*f,3,z0+SHELF+CH-1],P))).join('')} tone="faint"/>
   {inRow.map(s=>{const t=s.id==='yours'?null:byId(s.id)!;
    return <g key={s.id}>
     {!s.first&&<Solid paths={k.slabOf({x:s.x0-DIV,y:3,w:DIV,d:CD+1,r:0},z0+SHELF,CH,P,1)} tone="mid"/>}
     {/* a small lamp under the shelf above, at the back of the bay */}
     <Solid paths={k.slabOf({x:s.x-6,y:5,w:12,d:3,r:1},z0+SHELF+CH-2.4,2.4,P,3)} tone="hi"/>
     {t?<g data-slot={t.id} data-seen={seen.has(t.id)||undefined}>
       <Puck x={s.x} y={s.y} z={s.z} r={Math.min(footOf(t)+2.4,(s.x1-s.x0)/2-3)} P={P}/>
       <TrophyArt t={t} pose={poseAt(P,s.x,s.y,s.z+1.6,spin)}/>
       <Label x={s.x-Math.min(12,(s.x1-s.x0)/2-3)} y={CD-6} w={Math.min(24,s.x1-s.x0-6)} d={6} z={s.z} P={P} lit={seen.has(t.id)||hot===t.id}/>
      </g>
      :<YoursSlot x={s.x} y={s.y} z={s.z} P={P}/>}
    </g>;})}
  </g>;})}
  {/* the crown, the right wall (nearest the viewer of the two) */}
  <Solid paths={k.slabOf({x:WALL,y:3,w:W-WALL*2,d:CD+1,r:0},top-SHELF,SHELF,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:W-WALL,y:0,w:WALL,d:CD+4,r:0},BASE,top-BASE,P,1)} tone="mid"/>
  <Solid paths={k.slabOf({x:-2,y:-2,w:W+4,d:CD+8,r:1.5},top,4,P,4,.8)} tone="mid" inner={<Line d={k.sideSeam({x:-2,y:-2,w:W+4,d:CD+8,r:1.5},top+2,P,4)} tone="faint"/>}/>
  <Solid paths={k.slabOf({x:2,y:1,w:W-4,d:CD+3,r:1},top+4,3,P,4,.6)} tone="mid"/>
  {/* glass doors: a frame per bay, the pane, two glints, hinges and a knob */}
  {C.slots.map(sl=>{const z0=sl.z,x0=sl.x0-(sl.first?0:DIV/2),x1=sl.x1+(sl.x1<W-WALL-1?DIV/2:0),bw=x1-x0;
   const q=(x:number,z:number)=>k.iso([x,front,z],P),pane=[q(x0+2,z0+2),q(x1-2,z0+2),q(x1-2,z0+CH-2),q(x0+2,z0+CH-2)];
   const gx=(f:number)=>x0+bw*f,g1=[q(gx(.12),z0+CH-8),q(gx(.12)+7,z0+CH-8),q(gx(.12)+7+bw*.3,z0+8),q(gx(.12)+bw*.3,z0+8)],g2=[q(gx(.34),z0+CH-8),q(gx(.34)+3,z0+CH-8),q(gx(.34)+3+bw*.3,z0+8),q(gx(.34)+bw*.3,z0+8)];
   return <g key={sl.id} pointerEvents="none" data-glass="">
    <path d={k.pathOf(pane,true)} fill="#ffffff" opacity={.1}/>
    <path d={k.pathOf(g1,true)} fill="#ffffff" opacity={.3}/><path d={k.pathOf(g2,true)} fill="#ffffff" opacity={.24}/>
    <Solid paths={k.slabOf({x:x0,y:front,w:bw,d:1.4,r:0},z0,2,P,1)} tone="mid"/>
    <Solid paths={k.slabOf({x:x0,y:front,w:2,d:1.4,r:0},z0,CH,P,1)} tone="mid"/>
    <Solid paths={k.slabOf({x:x1-2,y:front,w:2,d:1.4,r:0},z0,CH,P,1)} tone="mid"/>
    <Solid paths={k.slabOf({x:x0,y:front,w:bw,d:1.4,r:0},z0+CH-2,2,P,1)} tone="mid"/>
    <Dots points={[q(x0+1,z0+CH*.2),q(x0+1,z0+CH*.8)]} size={.9} tone="hi"/>
    <Solid paths={k.cylinder(x1-4.5,front+2.2,1.1,z0+CH*.5-2,4,P,12)} tone="hi"/>
   </g>;})}
 </g>;
}
/** The tall cabinet's ninth bay: your own shelf's sign (a framed certificate on an easel and a small cup). */
function YoursSlot({x,y,z,P}:{x:number;y:number;z:number;P:k.Projection}){
 return <g data-slot="yours">
  <Solid paths={k.slabOf({x:x-15,y:y-10,w:30,d:3,r:.6},z,36,P,2,.5)} tone="hi"/>
  <Line d={k.pathOf([k.iso([x-11,y-7,z+5],P),k.iso([x+11,y-7,z+5],P),k.iso([x+11,y-7,z+31],P),k.iso([x-11,y-7,z+31],P)],true)} tone="lo"/>
  {[14,18,22].map((h,i)=><Line key={i} d={k.segment([x-7,y-7,z+h+4],[x+7-i*3,y-7,z+h+4],P)} tone="lo" free/>)}
  <path d={k.cylinder(x+6,y-7,2.6,z+8,.2,P,20).fill} fill={ACCENT} stroke="var(--anatomy-hi)" strokeWidth={.6}/>
  <Puck x={x+2} y={y+8} z={z} r={7} P={P}/>
  <TrophyArt t={KID_CUP} pose={poseAt(P,x+2,y+8,z+1.6,.6)}/>
 </g>;
}

/** Your own cup (the shelf's prize for a graduated path): a small turned cup with two handles, in the accent yellow. */
export const KID_CUP:Trophyish={parts:[{id:'cup',lift:0}],model:[
 {k:'lathe',part:'cup',mat:'paper',prof:[[5.4,0],[5.5,.3],[5.5,2.2],[4.6,3]]},
 {k:'lathe',part:'cup',mat:'yellow',prof:[[1.7,3],[1.4,6],[2.4,7.4],[1.6,8.6],[2.6,10.4]]},
 {k:'lathe',part:'cup',mat:'yellow',prof:[[2.6,10.4],[5,12.4],[6.4,15.6],[6.8,19],[7,20.6]],open:true,rings:[18]},
 {k:'handle',part:'cup',mat:'yellow',at:[Math.PI/2,-Math.PI/2],t:.55,curve:[[6.7,19.4],[9.2,19.6],[10,16.6],[8.4,13.6],[6.2,13.4]]},
]};

// ── 2. The turntable stand ───────────────────────────────────────────────────────────────────────────────────────────────
export function stand(t:Trophy){
 const rt=Math.max(15,footOf(t)+5),Z0=12,ruler=Math.ceil((t.drawH+4)/10)*10,gx=-rt-20,gy=-4;
 const maxLift=Math.max(...t.parts.map(p=>p.lift)),R=reach(t);
 const plan:k.Plan={x:gx-16,y:-rt-12,w:rt+18-(gx-16)+Math.max(0,R-rt),d:rt*2+26,r:6};
 return {rt,Z0,ruler,gx,gy,plan,R,maxLift,
  /** Fit: the plate, the ruler's top, the exploded top and the label column to the right. */
  points:[...k.boxCorners(plan,-8,0),[gx,gy,Z0+ruler+6],[0,0,Z0+t.drawH+maxLift+4],[R+26,0,Z0+t.drawH*.5],[R+26,0,Z0]] as k.Point3[]};
}
export const StandStatic=memo(function StandStatic({t,P}:{t:Trophy;P:k.Projection}){
 const S=stand(t),{rt,Z0,gx,gy,plan}=S;
 const ticks=k.radialTicks(0,0,rt-1,48,6,Z0,[1.4,3],P);
 return <g data-stand="">
  <Plate plan={plan} z={-6} h={6} P={P}/>
  <Label x={plan.x+plan.w-46} y={plan.y+plan.d-26} w={30} d={10} z={0} P={P}/>
  {/* turntable: a drum, a knurled ring, a ticked top */}
  <path className="iso-halo" d={k.cylinder(0,0,rt+1,-1,3,P,48).fill}/>
  <Solid paths={k.cylinder(0,0,rt-2,0,Z0-4,P,56,.8)} tone="mid" inner={<Line d={k.sideArc(0,0,rt-2,(Z0-4)/2,P,40)} tone="faint"/>}/>
  <Solid paths={k.cylinder(0,0,rt,Z0-4,4,P,64,.8)} tone="hi"/>
  <Line d={k.knurl(0,0,rt,Z0-4,Z0,96,P)} tone="faint"/>
  <Line d={ticks.minor} tone="lo"/><Line d={ticks.major} tone="mid"/>
  <Line d={k.ring(0,0,rt-6,Z0,P,48)} tone="faint"/>
 </g>;
});
/** The height gauge (drawn after the trophy: its arm is above the trophy's top). `armZ` is the arm's height above the turntable. */
export function Gauge({t,P,armZ,show,part}:{t:Trophy;P:k.Projection;armZ:number;show:boolean;part:'column'|'arm'}){
 const S=stand(t),{Z0,gx,gy,ruler}=S,col:k.Plan={x:gx-3,y:gy-3,w:6,d:6,r:.6};
 const face=gy+3,tk:string[]=[],mj:string[]=[];
 for(let cm=0;cm<=ruler;cm++){const z=Z0+cm,len=cm%10===0?3.2:cm%5===0?2.2:1.2;(cm%10===0?mj:tk).push(k.segment([gx+3,face,z],[gx+3-len,face,z],P));}
 const nums=Array.from({length:ruler/10+1},(_,i)=>i*10);
 const az=Z0+armZ,arm:k.Plan={x:gx+3,y:gy-1.2,w:-gx-3,d:2.4,r:.4};
 const col_=<g data-gauge="">
  <Solid paths={k.slabOf({x:gx-8,y:gy-8,w:16,d:16,r:2},0,4,P,4,.6)} tone="mid"/>
  <Dots points={k.corners({x:gx-8,y:gy-8,w:16,d:16,r:0},3).map(([x,y])=>k.iso([x,y,4],P))} size={.55} tone="hi"/>
  <Solid paths={k.slabOf(col,4,Z0+ruler+2-4,P,2)} tone="hi"/>
  <Line d={tk.join('')} tone="lo"/><Line d={mj.join('')} tone="hi"/>
  {nums.map(n=><text key={n} x={k.iso([gx-4.5,face,Z0+n],P)[0]} y={k.iso([gx-4.5,face,Z0+n],P)[1]+3} className="tr-num" textAnchor="end">{n}</text>)}
  <Solid paths={k.cylinder(gx,gy,2.4,Z0+ruler+2,1.4,P,16)} tone="mid"/>
 </g>;
 if(part==='arm')return show?<g data-arm={Math.round(armZ*10)/10}>
   <Solid paths={k.slabOf({x:gx-4.4,y:gy-4.4,w:8.8,d:8.8,r:1},az-2,6,P,3,.5)} tone="mid"/>
   <Solid paths={k.cylinder(gx-4.4-1.6,gy,1.6,az,2.2,P,14)} tone="mid"/>
   <Line d={k.knurl(gx-6,gy,1.6,az,az+2.2,14,P)} tone="faint"/>
   <Solid paths={k.slabOf(arm,az+.4,1.6,P,2)} tone="hi"/>
   <Solid paths={k.slabOf({x:-1.6,y:gy-1.8,w:3.2,d:3.6,r:.6},az,2.4,P,3)} tone="mid" lit/>
   <Line d={k.segment([0,0,az],[0,gy+1.2,az],P)} tone="lit"/>
  </g>:null;
 return col_;
}
/** The crank on the turntable's rim: it goes round with the spin. */
export function Crank({t,P,spin}:{t:Trophy;P:k.Projection;spin:number}){
 const {rt,Z0}=stand(t),a=Math.PI*.42-spin,x=Math.cos(a)*(rt+.2),y=Math.sin(a)*(rt+.2),front=k.depthOf([x,y,0],P)>k.depthOf([0,0,0],P);
 return <g data-crank={front?'front':'back'}>
  <Solid paths={k.cylinder(x,y,1.5,Z0-3,1.2,P,14)} tone="mid"/>
  <Solid paths={k.cylinder(x,y,1,Z0-1.8,4.4,P,12)} tone="hi"/>
 </g>;
}
/** Leader lines for the exploded view: a wire from each part to a mono label in a column to the right. */
export function Leaders({anchors,labels,x0,box}:{anchors:{part:string;x:number;y:number}[];labels:Record<string,string>;x0:number;box:Box}){
 const rows=[...anchors].filter(a=>labels[a.part]).sort((a,b)=>a.y-b.y).map(a=>({...a,ly:a.y}));
 for(let i=1;i<rows.length;i++)rows[i].ly=Math.max(rows[i].ly,rows[i-1].ly+22);
 const over=rows.length?rows[rows.length-1].ly-(box.y+box.h-14):0;if(over>0)for(const r of rows)r.ly-=over;
 const lx=Math.min(box.x+box.w-120,Math.max(x0,...rows.map(r=>r.x+18)));
 return <g data-leaders={rows.length}>
  {rows.map(r=><g key={r.part}><Wire from={[r.x,r.y]} via={[[lx-10,r.ly]]} to={[lx,r.ly]} tone="hi" size={1.6}/>
   <text x={lx+6} y={r.ly+4} className="tr-leader">{labels[r.part]}</text></g>)}
 </g>;
}

// ── 3. The plinths (matching game) ───────────────────────────────────────────────────────────────────────────────────────
export const PLINTH_GAP=72;
export function plinths(n:number){
 const xs=n===1?[0]:[-PLINTH_GAP,0,PLINTH_GAP],plan:k.Plan={x:xs[0]-48,y:-34,w:(xs[xs.length-1]-xs[0])+96,d:68,r:6};
 return {xs,plan,h:22,points:[...k.boxCorners(plan,-8,0),...xs.map(x=>[x,0,22+80] as k.Point3),...(n===1?[[-44,-30,90],[44,-30,90]] as k.Point3[]:[])]};
}
export const PlinthsStatic=memo(function PlinthsStatic({n,P,screen}:{n:number;P:k.Projection;screen:boolean}){
 const S=plinths(n);
 return <g data-plinths={n}>
  <Plate plan={S.plan} z={-6} h={6} P={P}/>
  {screen&&<g data-screen="">
   {[-42,42].map(x=><Solid key={x} paths={k.slabOf({x:x-3,y:-32,w:6,d:6,r:.6},0,2,P,3)} tone="mid"/>)}
   <Solid paths={k.slabOf({x:-44,y:-30,w:88,d:3,r:.5},2,88,P,2,.6)} tone="mid"/>
   <path d={k.pathOf([[-40,-27,7],[40,-27,7],[40,-27,86],[-40,-27,86]].map(p=>k.iso(p as k.Point3,P)),true)} fill="#fbfbf8" stroke="var(--anatomy-faint)" strokeWidth={.8}/>
  </g>}
  {S.xs.map((x,i)=><g key={i}>
   <Solid paths={k.slabOf({x:x-20,y:-20,w:40,d:40,r:2},0,3,P,4,.6)} tone="mid"/>
   <Solid paths={k.slabOf({x:x-16,y:-16,w:32,d:32,r:1.5},3,S.h-6,P,4,.6)} tone="hi" inner={<Line d={k.sideSeam({x:x-16,y:-16,w:32,d:32,r:1.5},S.h-8,P,4)} tone="faint"/>}/>
   <Solid paths={k.slabOf({x:x-18,y:-18,w:36,d:36,r:2},S.h-3,3,P,4,.6)} tone="mid"/>
  </g>)}
 </g>;
});
/** The engraved letter plate on a plinth's front face. */
export function PlinthLetter({x,P,letter,lit}:{x:number;P:k.Projection;letter:string;lit:boolean}){
 return <g data-letter={letter}>
  <path d={k.pathOf([[x-6,16.4,7],[x+6,16.4,7],[x+6,16.4,15],[x-6,16.4,15]].map(p=>k.iso(p as k.Point3,P)),true)} fill={lit?ACCENT:'var(--anatomy-face)'} stroke="var(--anatomy-hi)" strokeWidth={.7}/>
  <FaceText transform={k.sideMatrix([x,16.4],13.2,P,'left')} size={6.4} tone="hi" anchor="middle">{letter}</FaceText>
 </g>;
}

// ── 4. The measuring bench (a pan balance and a ruler column) ────────────────────────────────────────────────────────────
export const BEAM=46,PAN_R=17,PILLAR=34,AZ_BENCH=76;
/** A pan's top: + tilt sends the right pan down. */
export const panZ=(side:-1|1,tilt:number)=>PILLAR+6-side*BEAM*Math.sin(tilt);
export const BENCH_PLAN:k.Plan={x:-98,y:-34,w:196,d:68,r:6};
export const benchPoints=(top:number)=>[...k.boxCorners(BENCH_PLAN,-8,0),[-BEAM-32,0,PILLAR+6+top],[BEAM+32,0,PILLAR+6+top],[0,-22,PILLAR+6+top+6]] as k.Point3[];
export const BenchStatic=memo(function BenchStatic({P,ruler}:{P:k.Projection;ruler:number}){
 const base=PILLAR+6,tk:string[]=[],mj:string[]=[];
 for(let cm=0;cm<=ruler;cm++){const z=base+cm,len=cm%10===0?3.6:cm%5===0?2.4:1.3;(cm%10===0?mj:tk).push(k.segment([-3.5,-19.5,z],[-3.5+len,-19.5,z],P));}
 return <g data-bench="">
  <Plate plan={BENCH_PLAN} z={-6} h={6} P={P}/>
  <Label x={BENCH_PLAN.x+14} y={BENCH_PLAN.y+BENCH_PLAN.d-28} w={30} d={10} z={0} P={P}/>
  {/* the ruler column at the back: zero at the pans' level */}
  <Solid paths={k.slabOf({x:-10,y:-30,w:20,d:20,r:2},0,4,P,4,.6)} tone="mid"/>
  <Solid paths={k.slabOf({x:-4,y:-26,w:8,d:6.5,r:.6},4,base+ruler+2-4,P,2)} tone="hi"/>
  <Line d={tk.join('')} tone="lo"/><Line d={mj.join('')} tone="hi"/>
  {Array.from({length:ruler/10+1},(_,i)=>i*10).map(n=>{const [x,y]=k.iso([4.5,-19.5,base+n],P);return <text key={n} x={x+3} y={y+3} className="tr-num">{n}</text>;})}
  {/* the pillar of the balance */}
  <Solid paths={k.cylinder(0,0,12,0,3,P,40,.6)} tone="mid"/>
  <Solid paths={k.slabOf({x:-5,y:-5,w:10,d:10,r:1.4},3,PILLAR-3,P,4,.5)} tone="mid" inner={<Line d={k.sideSeam({x:-5,y:-5,w:10,d:10,r:1.4},PILLAR*.5,P,4)} tone="faint"/>}/>
  <Solid paths={k.slabOf({x:-7,y:-7,w:14,d:14,r:1.4},PILLAR,2.4,P,4,.5)} tone="mid"/>
 </g>;
});
/** The beam, the two pan posts and the pans, at a tilt (a Roberval: the pans stay level). Drawn before the trophies. */
export function Beam({P,tilt,locked}:{P:k.Projection;tilt:number;locked:boolean}){
 const c=PILLAR+5,s=Math.sin(tilt),cx=Math.cos(tilt)*BEAM;
 const bar=(dy:number)=>{const a=k.iso([-cx,dy,c+BEAM*s],P),b=k.iso([cx,dy,c-BEAM*s],P);return k.pathOf([a,b]);};
 const needle=k.iso([16*Math.sin(tilt),2.4,c+16*Math.cos(tilt)],P),hub=k.iso([0,2.4,c],P);
 const arcPt=(deg:number,r:number)=>k.iso([r*Math.sin(deg*D2R),1.2,c+r*Math.cos(deg*D2R)],P);
 return <g data-beam={Math.round(tilt/D2R*10)/10}>
  <path d={bar(-1.5)} stroke="var(--anatomy-hi)" strokeWidth={kOf(P)*3.4+1.6} strokeLinecap="round"/>
  <path d={bar(-1.5)} stroke="#f2f2ee" strokeWidth={kOf(P)*3.4} strokeLinecap="round"/>
  <path d={bar(-1.5)} stroke="#ffffff" strokeWidth={kOf(P)*1} strokeLinecap="round" transform="translate(0 -1)"/>
  <Solid paths={k.cylinder(0,-3,2.2,c-2.2,4.4,P,16)} tone="hi"/>
  {locked&&<Solid paths={k.slabOf({x:-2,y:3,w:4,d:3,r:.4},PILLAR+2.4,6,P,2)} tone="mid" lit/>}
  {/* the balance's dial: an arc scale on the pillar head and a needle fixed to the beam */}
  <path d={k.pathOf([...Array.from({length:13},(_,i)=>arcPt(-24+i*4,21)),...Array.from({length:13},(_,i)=>arcPt(24-i*4,13))],true)} fill="var(--anatomy-face)" stroke="var(--anatomy-hi)" strokeWidth={.8}/>
  <Line d={Array.from({length:13},(_,i)=>k.pathOf([arcPt(-24+i*4,21),arcPt(-24+i*4,i===6?16:i%3===0?17.6:19)])).join('')} tone="mid"/>
  <path d={k.pathOf([hub,needle])} stroke="var(--anatomy-hi)" strokeWidth={2.2} strokeLinecap="round"/>
  <path d={k.pathOf([hub,needle])} stroke="#f2c230" strokeWidth={1} strokeLinecap="round"/>
  <circle cx={hub[0]} cy={hub[1]} r={2.4} fill="var(--anatomy-face)" stroke="var(--anatomy-hi)" strokeWidth={.8}/>
  {([-1,1] as const).map(side=>{const x=side*cx,z=panZ(side,tilt);
   return <g key={side}>
    <Solid paths={k.cylinder(x,0,2,c-side*BEAM*s-1,z-(c-side*BEAM*s)-1,P,16)} tone="mid" crease="none"/>
    <Solid paths={k.cylinder(x,0,5,z-3,1.4,P,24)} tone="mid"/>
    <Solid paths={k.cylinder(x,0,PAN_R,z-1.6,1.6,P,56,.5)} tone="hi"/>
    <Line d={k.ring(x,0,PAN_R-2.4,z,P,56)} tone="faint"/>
   </g>;})}
 </g>;
}
/** The ruler's two cursors: a sliding arm from the column toward each trophy's top. */
export function Cursors({P,left,right,show}:{P:k.Projection;left:number;right:number;show:boolean}){
 if(!show)return null;const base=PILLAR+6;
 return <g data-cursors="">{([[-1,left],[1,right]] as const).map(([side,h])=>{const z=base+h,x1=side*BEAM,path=k.pathOf([k.iso([side*5,-22,z],P),k.iso([x1,-22,z],P),k.iso([x1,0,z],P)]),tip=k.iso([x1,0,z],P);
  return <g key={side} data-cursor={Math.round(h*10)/10}>
   <Solid paths={k.slabOf({x:-5,y:-27,w:10,d:8.5,r:.8},z-1.6,3.2,P,3,.4)} tone="mid"/>
   <path d={path} stroke="var(--anatomy-hi)" strokeWidth={2.6} fill="none" strokeLinejoin="round"/>
   <path d={path} stroke={ACCENT} strokeWidth={1.4} fill="none" strokeLinejoin="round"/>
   <circle cx={tip[0]} cy={tip[1]} r={2.4} fill={ACCENT} stroke="var(--anatomy-hi)" strokeWidth={.8}/>
  </g>;})}</g>;
}
export const KG=(v:number)=>v.toLocaleString('en-GB',{maximumFractionDigits:3});
export {TROPHIES};
export const Group=({children}:{children:ReactNode})=><g>{children}</g>;
