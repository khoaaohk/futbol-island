import * as k from '../anatomy/iso-kit';
import {INK,INK_MID,dot,innerAlpha,isFacing,mix,norm3,shadeOf,shellAlpha,spherePath,tones,type LabelAnchor,type Swatch,type V3} from '../anatomy/figure-kit';
import type {FigureSpec,FigureView} from '../anatomy/FigureStage';
import {PANELS} from '../telstar-1970/model';

/**
 * laced-leather · "Turn the ball" (museum-figures-2, figure kit v2). An old laced leather match ball on a display cup: drag it all
 * the way round to see its leather panels (18, in six groups of three strips: the classic laced-ball pattern), the lace and the
 * lace-up opening. See-through fades the leather to a ghost and shows the rubber bladder inside and its inflation tube, tucked
 * under the laces. "Old vs New" swaps in a modern size 5 ball: stitched panels, a sealed bladder and the small valve you pump it
 * up through. Labels light while you touch them and as the part turns to face you; swatches are leather tones.
 *
 * Truth first (facts.ts LOOK, sourced): the bladder was blown up through its tube, the tube was tucked in and the opening laced
 * shut; the lace made heading painful; leather drank water and got heavier in the rain; a valve later let you pump the ball up
 * without unlacing it. We draw only these parts (no lining, no stats). Parts: ≤ 18 panels + stand + lace + bladder ≈ 50.
 */
export const R=60;
const STAND={plinthR:64,plinthH:12,cupR:26,cupH:16},CZ=STAND.plinthH+STAND.cupH+Math.sqrt(R*R-(STAND.cupR-2)**2);
export const CENTRE:V3=[0,0,CZ];
export const POINTS:V3[]=[[-STAND.plinthR,0,0],[STAND.plinthR,0,0],[0,STAND.plinthR,0],[0,-STAND.plinthR,0],[0,0,CZ+R],[R,0,CZ],[-R,0,CZ],[0,R,CZ],[0,-R,CZ]];
/** Leather tones for the swatches ("Real" = the dry tan of the weather machine). */
export const LEATHERS:readonly Swatch[]=[{id:'tan',name:'Tan',hex:'#b9834c'},{id:'chestnut',name:'Chestnut',hex:'#8a4b2a'},{id:'oxblood',name:'Oxblood',hex:'#5e1f1c'},{id:'white',name:'White leather',hex:'#ece4d2'}];
const TAN='#b9834c',LACE='#efe2c2',BLADDER='#a2553a',MODERN_BLADDER='#c9a15c';
const f1=(n:number)=>n.toFixed(1);

// The ball's own turn: its lace panel looks up toward the front view, so you meet the lace first.
const D=norm3([.62,.62,1.15]);
const rot=(()=>{const z:V3=[0,0,1],a=norm3([z[1]*D[2]-z[2]*D[1],z[2]*D[0]-z[0]*D[2],z[0]*D[1]-z[1]*D[0]]),c=dot(z,D),s=Math.sqrt(1-c*c);
 return (p:readonly number[]):V3=>{const kd=dot(a,p),cr:V3=[a[1]*p[2]-a[2]*p[1],a[2]*p[0]-a[0]*p[2],a[0]*p[1]-a[1]*p[0]];
  return [p[0]*c+cr[0]*s+a[0]*kd*(1-c),p[1]*c+cr[1]*s+a[1]*kd*(1-c),p[2]*c+cr[2]*s+a[2]*kd*(1-c)];};})();
/** A point on the cube face (axis a, sign sg) at (u, v) on its two tangent axes, pushed onto the ball and turned. */
const onBall=(a:number,sg:number,u:number,v:number):V3=>{const p=[0,0,0];p[a]=sg;p[(a+1)%3]=u;p[(a+2)%3]=v;return rot(norm3(p));};
type Panel={dirs:V3[];c:V3;lace:boolean};
/** 18 panels: each cube face split into three strips, each face's strips turned a quarter to its neighbours' (they interlock). */
export const PANELS18:Panel[]=(()=>{const out:Panel[]=[];
 for(let a=0;a<3;a++)for(const sg of [1,-1])for(let s=0;s<3;s++){const u0=-1+s*2/3,u1=u0+2/3,dirs:V3[]=[];
  for(let i=0;i<=2;i++)dirs.push(onBall(a,sg,u0+(u1-u0)*i/2,-1));for(let i=1;i<=5;i++)dirs.push(onBall(a,sg,u1,-1+i*2/5));
  for(let i=1;i<=2;i++)dirs.push(onBall(a,sg,u1-(u1-u0)*i/2,1));for(let i=4;i>=1;i--)dirs.push(onBall(a,sg,u0,-1+i*2/5));
  out.push({dirs,c:onBall(a,sg,(u0+u1)/2,0),lace:a===2&&sg===1&&s===1});}
 return out;})();
export const LACE_DIR=PANELS18.find(p=>p.lace)!.c;
/** The slit and its six cross-laces, on the lace panel (cube face +z, middle strip). */
const SLIT:V3[]=[-.62,-.3,0,.3,.62].map(v=>onBall(2,1,0,v));
const STITCHES:[V3,V3][]=Array.from({length:6},(_,i)=>{const v=-.55+i*.22;return [onBall(2,1,-.16,v),onBall(2,1,.16,v+.11)];});
/** The bladder's tube: out of the bladder under the opening, folded flat under the laces. */
const TUBE:V3[]=[[0,-.5,1],[0,-.4,1],[0,-.1,1],[0,.25,1]].map(([u,v],i)=>{const d=onBall(2,1,u,v);const r=i===0?.82:.93;return [d[0]*r,d[1]*r,d[2]*r] as V3;});
/** The modern ball: 32 panels (12 pentagons, 20 hexagons), its valve on a hexagon. */
const MOD=PANELS.map(p=>({kind:p.kind,dirs:p.pts.map(q=>norm3(q)),c:norm3(p.c)}));
const MOD_VALVE=MOD.findIndex(p=>p.kind==='hex');

export type BallMode='old'|'new';
export function makeLeatherFigure(){
 const st={mode:'old' as BallMode};
 const draw=(v:FigureView)=>{
  const P=v.P,kk=k.cameraOf(P).k,c=k.iso(CENTRE,P),rad=R*kk,x=v.xray,sa=shellAlpha(x),ia=innerAlpha(x),old=st.mode==='old';
  const at=(d:readonly number[],r=R):V3=>[CENTRE[0]+d[0]*r,CENTRE[1]+d[1]*r,CENTRE[2]+d[2]*r];
  const scr=(d:readonly number[],r=R)=>k.iso(at(d,r),P);
  const line=(pts:readonly (readonly number[])[],r=R)=>pts.map((d,i)=>{const q=scr(d,r);return (i?'L':'M')+f1(q[0])+' '+f1(q[1]);}).join('');
  let s=`<defs><radialGradient id="fig-ll-round" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient></defs>`;
  s+=`<path class="iso-halo" d="${k.cylinder(0,0,STAND.plinthR+4,0,1,P,40).fill}"/>`;
  s+=k.solidSvg(k.cylinder(0,0,STAND.plinthR,0,STAND.plinthH,P,48,2));
  s+=k.solidSvg(k.cylinder(0,0,STAND.cupR,STAND.plinthH,STAND.cupH,P,32,1));
  const on=(id:string)=>v.active.has(id);
  const labels:LabelAnchor[]=[];
  // The inside (see-through): the bladder, and on the old ball its tube under the laces; on the new one the valve's stem.
  if(x>0){const g=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rad*.82)}" fill="url(#fig-ll-round)"/>`;
   s+=`<g data-bladder opacity="${ia.toFixed(3)}"><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rad*.82)}" fill="${old?BLADDER:MODERN_BLADDER}" stroke="${INK}" stroke-width="${on('bladder')?1.8:1}"/>${g}`;
   if(old)s+=`<path data-tube d="${line(TUBE,1)}" fill="none" stroke="${on('tube')?'var(--accent)':'#4a2a1c'}" stroke-width="${f1(Math.max(3.5,kk*5))}" stroke-linecap="round" stroke-linejoin="round"/>`;
   else{const vd=MOD[MOD_VALVE].c,a=scr(vd,R*.82),b=scr(vd);s+=`<path data-valve-stem d="M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}" fill="none" stroke="${on('valve')?'var(--accent)':'#5b4a38'}" stroke-width="${f1(Math.max(3.5,kk*4.5))}" stroke-linecap="round"/>`;}
   s+=`</g>`;}
  // The leather (or the modern panels): only the half facing you, back to front.
  s+=`<g data-shell="${st.mode}" opacity="${x>0?Math.max(sa,.35).toFixed(3):'1'}">`;
  if(old){const t=tones(v.swatchHex??TAN),order=PANELS18.map((p,i)=>i).filter(i=>dot(PANELS18[i].c,v.V)>-.3).sort((a,b)=>dot(PANELS18[a].c,v.V)-dot(PANELS18[b].c,v.V));
   for(const i of order){const p=PANELS18[i],lit=p.lace?false:on('panel')&&i===order[order.length-1];
    s+=`<path data-panel${p.lace?' data-lace-panel':''} d="${spherePath(p.dirs,c,rad,v)}" fill="${shadeOf(p.c,v.L,t)}" fill-opacity="${(x>0?sa:1).toFixed(3)}" stroke="${lit?'var(--accent)':mix(t.d,'#000',.35)}" stroke-width="${lit?2:1.1}" stroke-linejoin="round"/>`;}}
  else{const W={l:'#fbfbf8',m:'#ecece7',d:'#d3d3ce'},pent=tones('#2b3135');
   const order=MOD.map((p,i)=>i).filter(i=>dot(MOD[i].c,v.V)>-.3).sort((a,b)=>dot(MOD[a].c,v.V)-dot(MOD[b].c,v.V));
   for(const i of order){const p=MOD[i];s+=`<path data-panel="${p.kind}" d="${spherePath(p.dirs,c,rad,v)}" fill="${shadeOf(p.c,v.L,p.kind==='pent'?pent:W)}" fill-opacity="${(x>0?sa:1).toFixed(3)}" stroke="${INK_MID}" stroke-width=".9"/>`;}}
  if(x<1)s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rad)}" fill="url(#fig-ll-round)" opacity="${(1-x).toFixed(3)}"/>`;
  s+=`</g>`;
  // The lace-up opening and its lace (old) or the valve hole (new), only while they face you.
  if(old){const face=dot(LACE_DIR,v.V);
   if(face>.02){const a=x>0?Math.max(sa,.45):1;
    s+=`<g data-lacing opacity="${a.toFixed(3)}"><path data-opening d="${line(SLIT,R*1.003)}" fill="none" stroke="${on('opening')?'var(--accent)':'#2a1a0c'}" stroke-width="${f1(Math.max(3,kk*4))}" stroke-linecap="round"/>`
     +`<path data-lace d="${STITCHES.map(([p,q])=>line([p,q],R*1.01)).join('')}" fill="none" stroke="${on('lace')?'var(--accent)':LACE}" stroke-width="${f1(Math.max(2.2,kk*2.6))}" stroke-linecap="round"/></g>`;}}
  else{const vd=MOD[MOD_VALVE].c;if(isFacing(vd,v.V,.02)&&x<.6){const q=scr(vd);s+=`<circle data-valve cx="${f1(q[0])}" cy="${f1(q[1])}" r="${f1(Math.max(2.4,kk*2.8))}" fill="${on('valve')?'var(--accent)':'#3b3128'}" stroke="${INK}" stroke-width=".8"/>`;}}
  s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(rad)}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
  // Labels: every part keeps its tag from any side (round parts slide to the edge); a part lights as it turns to face you.
  const facing=(d:readonly number[])=>dot(d,v.V)>.9;
  if(old){let best=-1,bd=-9;for(let i=0;i<PANELS18.length;i++){if(PANELS18[i].lace)continue;const d=dot(PANELS18[i].c,v.V);if(d>bd){bd=d;best=i;}}
   const pc=PANELS18[best].c,lace=onBall(2,1,.16,.22),open=onBall(2,1,0,-.45);
   labels.push({id:'panel',text:'Leather panel',at:at(pc),normal:pc,centre:CENTRE},{id:'lace',text:'Lace',at:at(lace),normal:lace,centre:CENTRE,on:facing(LACE_DIR)},
    {id:'opening',text:'Lace-up opening',at:at(open),normal:open,centre:CENTRE});
   if(x>.5)labels.push({id:'bladder',text:'Bladder',at:at(norm3([-v.R[0]+v.U[0]*.4,-v.R[1]+v.U[1]*.4,-v.R[2]+v.U[2]*.4]),R*.82)},{id:'tube',text:'Inflation tube',at:at(TUBE[2],1)});}
  else{let best=-1,bd=-9;for(let i=0;i<MOD.length;i++){if(i===MOD_VALVE)continue;const d=dot(MOD[i].c,v.V);if(d>bd){bd=d;best=i;}}
   const pc=MOD[best].c,vd=MOD[MOD_VALVE].c;
   labels.push({id:'panel',text:'Panel',at:at(pc),normal:pc,centre:CENTRE},{id:'valve',text:'Valve',at:at(vd),normal:vd,centre:CENTRE,on:facing(vd)});
   if(x>.5)labels.push({id:'bladder',text:'Sealed bladder',at:at(norm3([-v.R[0]+v.U[0]*.4,-v.R[1]+v.U[1]*.4,-v.R[2]+v.U[2]*.4]),R*.82)});}
  const pr=STAND.plinthR*kk,base=k.iso([0,0,0],P);
  return {svg:s,labels,obj:{l:Math.min(c[0]-rad,base[0]-pr),r:Math.max(c[0]+rad,base[0]+pr),t:c[1]-rad,b:base[1]+pr*.6}};};
 const spec:FigureSpec={id:'laced-leather',points:POINTS,seeThrough:true,labels:true,swatches:LEATHERS,swatchLabel:'Real',draw};
 return {spec,get mode(){return st.mode;},setMode(m:BallMode){st.mode=m;}};
}
