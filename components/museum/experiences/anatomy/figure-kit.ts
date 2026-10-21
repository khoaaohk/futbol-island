import {cameraOf,iso,pathOf,type Flat,type Projection,type SolidPaths} from './iso-kit';

/**
 * Figure kit v2 · the pure maths (Oct 21 2026; user: "Start with Telstar and VAR, build the shared kit first").
 * A figure that turns all the way round, a see-through, labels that light up and colour swatches, for any Paper exhibit that
 * opts in (FigureStage.tsx is the React side). No DOM here, so tests/museum-figure-kit.cjs checks every rule in Node.
 *
 * Ideas (not code) from Colorfigures / ISO-GLOW by April Zhu (MIT), which builds on iso-figure by Tolga Cohce (MIT): the camera
 * turns, not the object; every part carries a bounding box and is sorted by which side of the box the viewer is on; faces and
 * whatever sits on them are drawn only while they face the viewer; the case fades to a ghost and the insides draw over it;
 * labels sit in two columns either side of the object, sorted so leaders never cross, lit while their part works.
 *
 * Camera: the same one as iso-kit (azimuth = yaw, elevation = pitch), so every iso-kit solid (extrude, cylinder …) already
 * shades and hides its back faces correctly at any yaw. World axes: x, y on the floor, z up.
 */
export type V3=[number,number,number];
export type Box=readonly [V3,V3];

export const FRONT_YAW=45,FRONT_PITCH=30,PITCH_MIN=20,PITCH_MAX=60;
/** The most separate SVG parts one figure may draw (heat cap, checked by the tests). */
export const MAX_PARTS=120;
/** The see-through: the case fades to this opacity (ink outline kept); the cross-fade lasts XRAY_S seconds. */
export const GHOST=.18,XRAY_S=.25;

export const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
export const wrapYaw=(y:number)=>((y%360)+360)%360;
/** The shortest signed turn from one yaw to another, in (-180, 180]. */
export const shortest=(from:number,to:number)=>{const d=wrapYaw(to-from);return d>180?d-360:d;};
export const dot=(a:readonly number[],b:readonly number[])=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const unit=(v:V3):V3=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];};

/** The camera's right, up and toward-viewer vectors in world space (matching iso-kit's iso() and depthOf()). */
export function basis(yaw:number,pitch:number):{R:V3;U:V3;V:V3}{
 const a=yaw*Math.PI/180,e=pitch*Math.PI/180,sa=Math.sin(a),ca=Math.cos(a),se=Math.sin(e),ce=Math.cos(e);
 return {R:[sa,-ca,0],U:[-ca*se,-sa*se,ce],V:[ca*ce,sa*ce,se]};}
export const viewVector=(yaw:number,pitch:number):V3=>basis(yaw,pitch).V;
/** A face with outward normal n is drawn only while it faces the viewer. */
export const isFacing=(n:readonly number[],V:readonly number[],eps=1e-6)=>dot(n,V)>eps;
/** The view that looks straight at a direction n (yaw from its floor bearing, pitch clamped to the figure's range). */
export function aimAt(n:readonly number[],pitch:readonly [number,number]=[PITCH_MIN,PITCH_MAX]){
 const h=Math.hypot(n[0],n[1]);return {yaw:wrapYaw(h<1e-9?FRONT_YAW:Math.atan2(n[1],n[0])*180/Math.PI),pitch:clamp(Math.atan2(n[2],h)*180/Math.PI,pitch[0],pitch[1])};}

/**
 * A fixed fit for every view: the figure's bounding sphere fills the card, so it never jumps or rescales while it turns.
 * `points` are the figure's true extremes (box corners, the top of a lifted part).
 */
export function fitTurn(points:readonly V3[],w:number,h:number,yaw:number,pitch:number,{pad=24,top=0,bottom=0}:{pad?:number;top?:number;bottom?:number}={}):Projection{
 let cx=0,cy=0,cz=0;for(const p of points){cx+=p[0];cy+=p[1];cz+=p[2];}const n=points.length||1;cx/=n;cy/=n;cz/=n;
 let r=1e-6;for(const p of points)r=Math.max(r,Math.hypot(p[0]-cx,p[1]-cy,p[2]-cz));
 const availW=Math.max(40,w-pad*2),availH=Math.max(40,h-pad*2-top-bottom),k=Math.min(availW,availH)/(2*r);
 const P:Projection={origin:[0,0],scale:k/Math.sqrt(1.6),azimuth:yaw,elevation:pitch};
 const [sx,sy]=iso([cx,cy,cz],P);P.origin=[w/2-sx,top+pad+availH/2-sy];return P;}
/** The same fit turned to another view (the origin keeps the bounding sphere's centre in place). */
export function turnProjection(P:Projection,centre:V3,yaw:number,pitch:number):Projection{
 const before=iso(centre,P),Q:Projection={origin:[0,0],scale:P.scale,azimuth:yaw,elevation:pitch},[sx,sy]=iso(centre,Q);
 Q.origin=[before[0]-sx,before[1]-sy];return Q;}
export const centreOf=(points:readonly V3[]):V3=>{let x=0,y=0,z=0;for(const p of points){x+=p[0];y+=p[1];z+=p[2];}const n=points.length||1;return [x/n,y/n,z/n];};

// ── Turning: drag, keys, inertia, eased turns ──────────────────────────────────────────────────────────────────────────
/** One mutable turn state per figure (no allocation per frame: stepTurn only writes numbers). */
export type Turn={yaw:number;pitch:number;vy:number;vp:number;goalYaw:number;goalPitch:number;aiming:boolean;dragging:boolean;full:boolean;min:number;max:number;front:number};
export function newTurn({yaw=FRONT_YAW,pitch=FRONT_PITCH,full=true,range=[PITCH_MIN,PITCH_MAX] as readonly [number,number]}={}):Turn{
 return {yaw,pitch:clamp(pitch,range[0],range[1]),vy:0,vp:0,goalYaw:yaw,goalPitch:pitch,aiming:false,dragging:false,full,min:range[0],max:range[1],front:yaw};}
/** Degrees per px of drag: half a turn across the card's width. */
export const dragGain=(widthPx:number)=>180/Math.max(240,widthPx);
/** A drag step: the figure turns the way the finger moves; the speed is kept for the coast after release. */
export function dragBy(t:Turn,dx:number,dy:number,widthPx:number,dt:number){
 const g=dragGain(widthPx),dy0=-dx*g,dp=dy*g*.6;
 t.aiming=false;t.dragging=true;
 const y=t.full?t.yaw+dy0:clamp(t.yaw+dy0,t.front-60,t.front+60);
 const s=Math.max(1/120,dt);t.vy=t.vy*.4+((y-t.yaw)/s)*.6;t.vp=t.vp*.4+((clamp(t.pitch+dp,t.min,t.max)-t.pitch)/s)*.6;
 t.yaw=y;t.pitch=clamp(t.pitch+dp,t.min,t.max);}
export function release(t:Turn){t.dragging=false;if(Math.abs(t.vy)<12)t.vy=0;if(Math.abs(t.vp)<12)t.vp=0;t.vy=clamp(t.vy,-540,540);t.vp=clamp(t.vp,-240,240);}
/** Ease to a view by the shortest way round (keys, ⟲ ⟳, Front view, a tapped label). */
export function turnTo(t:Turn,yaw:number,pitch=t.pitch){t.goalYaw=t.yaw+shortest(t.yaw,yaw);t.goalPitch=clamp(pitch,t.min,t.max);t.aiming=true;t.vy=0;t.vp=0;}
export const turnBy=(t:Turn,dYaw:number,dPitch=0)=>turnTo(t,(t.aiming?t.goalYaw:t.yaw)+dYaw,(t.aiming?t.goalPitch:t.pitch)+dPitch);
/** One frame. Returns true while the figure still moves (the loop sleeps once it returns false). Reduced motion: jump. */
export function stepTurn(t:Turn,dt:number,reduced=false):boolean{
 if(t.dragging)return false;
 if(t.aiming){
  if(reduced){t.yaw=t.goalYaw;t.pitch=t.goalPitch;}
  else{const f=1-Math.exp(-dt/.11);t.yaw+=(t.goalYaw-t.yaw)*f;t.pitch+=(t.goalPitch-t.pitch)*f;}
  if(Math.abs(t.goalYaw-t.yaw)<.05&&Math.abs(t.goalPitch-t.pitch)<.05){t.yaw=wrapYaw(t.goalYaw);t.pitch=t.goalPitch;t.aiming=false;return false;}
  return true;}
 if(reduced||(t.vy===0&&t.vp===0)){t.vy=0;t.vp=0;return false;}
 t.yaw+=t.vy*dt;t.pitch=clamp(t.pitch+t.vp*dt,t.min,t.max);
 if(!t.full){const lo=t.front-60,hi=t.front+60;if(t.yaw<lo||t.yaw>hi){t.yaw=clamp(t.yaw,lo,hi);t.vy=0;}}
 const d=Math.exp(-dt*3.2);t.vy*=d;t.vp*=d;
 if(Math.abs(t.vy)<4&&Math.abs(t.vp)<4){t.vy=0;t.vp=0;t.yaw=t.full?wrapYaw(t.yaw):t.yaw;return false;}
 return true;}
/** The arrow keys (15° a press across, 8° up and down); Home = the front view. Returns true if the key was used. */
export function keyTurn(t:Turn,key:string,front:{yaw:number;pitch:number}):boolean{
 if(key==='ArrowLeft'){turnBy(t,-15);return true;}if(key==='ArrowRight'){turnBy(t,15);return true;}
 if(key==='ArrowUp'){turnBy(t,0,8);return true;}if(key==='ArrowDown'){turnBy(t,0,-8);return true;}
 if(key==='Home'){turnTo(t,front.yaw,front.pitch);return true;}return false;}
/** A cross-fade value moving toward 0 or 1 over XRAY_S seconds; returns true while it moves. */
export function fade(cur:{k:number},on:boolean,dt:number,reduced=false):boolean{
 const to=on?1:0;if(cur.k===to)return false;if(reduced){cur.k=to;return false;}
 const s=dt/XRAY_S;cur.k=on?Math.min(1,cur.k+s):Math.max(0,cur.k-s);return cur.k!==to;}
export const ease=(k:number)=>k<.5?2*k*k:1-((-2*k+2)**2)/2;
/** The case's opacity at see-through k (0 closed … 1 open) and the inner parts'. */
export const shellAlpha=(k:number)=>1-ease(clamp(k,0,1))*(1-GHOST);
export const innerAlpha=(k:number)=>ease(clamp(k,0,1));

// ── Painter's order for any view ───────────────────────────────────────────────────────────────────────────────────────
export type Layer='shell'|'inner'|'base';
export type Part={id:string;box:Box;svg:string;layer?:Layer;at?:V3};
const mid=(b:Box):V3=>[(b[0][0]+b[1][0])/2,(b[0][1]+b[1][1])/2,(b[0][2]+b[1][2])/2];
/** Two boxes separated along an axis: the one on the viewer's side goes later. 0 when they overlap on every axis. */
export function sepOrder(p:Box,q:Box,V:readonly number[]):number{
 for(let k=0;k<3;k++){if(p[1][k]<=q[0][k]+1e-6)return V[k]>=0?-1:1;if(q[1][k]<=p[0][k]+1e-6)return V[k]>=0?1:-1;}return 0;}
/** Back to front for this view: separated boxes by side, overlapping ones by their centre's depth. */
export function byDepth<T extends {box:Box;at?:V3}>(parts:readonly T[],V:readonly number[]):T[]{
 const list=parts.slice();
 // Insertion sort, so the pairwise side rule is respected even where the centre depth disagrees.
 for(let i=1;i<list.length;i++){const cur=list[i];let j=i-1;
  while(j>=0){const o=sepOrder(list[j].box,cur.box,V)||(dot(list[j].at??mid(list[j].box),V)-dot(cur.at??mid(cur.box),V));if(o<=0)break;list[j+1]=list[j];j--;}
  list[j+1]=cur;}
 return list;}

// ── Three-tone shading, ink and swatches ───────────────────────────────────────────────────────────────────────────────
export const INK='#3a3a3c',INK_MID='#6f6f72';
const hexRgb=(h:string)=>{const n=parseInt(h.replace('#','').padEnd(6,'0').slice(0,6),16);return [n>>16&255,n>>8&255,n&255];};
const rgbHex=(c:number[])=>'#'+c.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
export const mix=(a:string,b:string,t:number)=>{const A=hexRgb(a),B=hexRgb(b);return rgbHex(A.map((v,i)=>v+(B[i]-v)*t));};
/** Light / mid / dark of one body colour (the top, the lit sides, the turned-away sides). */
export const tones=(hex:string)=>({l:mix(hex,'#ffffff',.28),m:hex,d:mix(hex,'#1d1d1b',.22)});
/** The light comes from the viewer's top left, whatever the view (so a turned figure never goes dark). */
export function lightOf(yaw:number,pitch:number):V3{const {R,U,V}=basis(yaw,pitch);return unit([-.45*R[0]+.6*U[0]+.66*V[0],-.45*R[1]+.6*U[1]+.66*V[1],-.45*R[2]+.6*U[2]+.66*V[2]]);}
/** Three tones: a normal facing the light is l, side-on m, away d. */
export const shadeOf=(n:readonly number[],L:readonly number[],t:{l:string;m:string;d:string})=>{const s=dot(n,L);return s>.45?t.l:s>-.05?t.m:t.d;};

/** The gallery's swatches: tomato, mustard, mint, cobalt, blush, plus the Paper accents. */
export const SWATCHES=[
 {id:'tomato',name:'Tomato',hex:'#e5533d'},{id:'mustard',name:'Mustard',hex:'#e0a92e'},{id:'mint',name:'Mint',hex:'#6cc4a1'},
 {id:'cobalt',name:'Cobalt',hex:'#2f55c9'},{id:'blush',name:'Blush',hex:'#ef9fb0'},{id:'gallery',name:'Gallery red',hex:'#e4322b'},
] as const;
export type SwatchId=typeof SWATCHES[number]['id'];
export const swatchHex=(id:string|null|undefined)=>SWATCHES.find(s=>s.id===id)?.hex??null;
/** A designated part takes the swatch colour; every other part keeps its own. */
export const recolor=(base:string,swatch:string|null|undefined,designated:boolean)=>designated&&swatchHex(swatch)?swatchHex(swatch)!:base;

/** An iso-kit solid in its own colours (three tones from its shade buckets), as one SVG string. */
export function tintSvg(p:SolidPaths,hex:string,{ink=INK,alpha=1,crease=true}:{ink?:string;alpha?:number;crease?:boolean}={}){
 const t=tones(hex),sh=[t.d,mix(t.d,t.m,.5),t.m,mix(t.m,t.l,.5)];
 let s=`<path d="${p.fill}" fill="${t.m}"/>`;for(let i=0;i<p.shades.length;i++)if(p.shades[i])s+=`<path d="${p.shades[i]}" fill="${sh[i]}"/>`;
 s+=`<path d="${p.top}" fill="${t.l}"/>`;if(crease&&p.crease)s+=`<path d="${p.crease}" fill="none" stroke="${INK_MID}" stroke-width=".7"/>`;
 s+=`<path d="${p.outline}" fill="none" stroke="${ink}" stroke-width=".9" stroke-linejoin="round"/>`;
 return alpha<1?`<g opacity="${alpha.toFixed(3)}">${s}</g>`:s;}
/** The ghost of a shell: its silhouette ink only, over a faint fill. */
export const ghostSvg=(p:SolidPaths,alpha:number)=>`<g opacity="${Math.max(alpha,.35).toFixed(3)}"><path d="${p.fill}" fill="#f7f7f3" fill-opacity="${(alpha*.6).toFixed(3)}" stroke="${INK}" stroke-width=".9"/></g>`;
export const flatPath=(pts:readonly V3[],P:Projection,closed=true)=>pathOf(pts.map(p=>iso(p as V3,P)),closed);
export const screen=(p:V3,P:Projection):Flat=>iso(p,P);
export const kOf=(P:Projection)=>cameraOf(P).k;
/** The number of separate SVG elements in a drawing string (the heat cap counts these). */
export const countParts=(svg:string)=>(svg.match(/<(path|circle|ellipse|rect|line|polygon|text)\b/g)||[]).length;

// ── Labels ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
export type LabelAnchor={id:string;text:string;at:V3;normal?:V3;on?:boolean};
export type PlacedLabel={id:string;text:string;on:boolean;ax:number;ay:number;x:number;y:number;w:number;h:number;side:-1|1};
/** Pill size for a name at a font size (px): kid-readable type, at least 13 px. */
export const pillSize=(text:string,font:number)=>({w:Math.round(text.length*font*.6+font*1.7),h:Math.round(font*2)});
/**
 * Name tags in two columns either side of the object, each column sorted by height so the leaders never cross, pushed apart
 * so pills never overlap, and kept inside the card. Tags whose part faces away are hidden (a face, and its label, only while
 * it faces you). `obj` is the object's screen bounds.
 */
export function placeLabels(anchors:readonly LabelAnchor[],P:Projection,V:readonly number[],card:{w:number;h:number},obj:{l:number;r:number;t:number;b:number},{font=13,gap=6,top=8,bottom=8}:{font?:number;gap?:number;top?:number;bottom?:number}={}):PlacedLabel[]{
 const cx=(obj.l+obj.r)/2,cols:{[s:number]:PlacedLabel[]}={[-1]:[],[1]:[]};
 for(const a of anchors){if(a.normal&&!isFacing(a.normal,V,.05))continue;const [x,y]=iso(a.at,P),{w,h}=pillSize(a.text,font);
  cols[x<cx?-1:1].push({id:a.id,text:a.text,on:!!a.on,ax:x,ay:y,x:0,y,w,h,side:x<cx?-1:1});}
 // Balance: a crowded column hands its innermost tags to the other side.
 for(const s of [-1,1] as const){const o=-s as -1|1;while(cols[s].length>cols[o].length+2){cols[s].sort((a,b)=>s*(a.ax-b.ax));const m=cols[s].shift()!;m.side=o;cols[o].push(m);}}
 const out:PlacedLabel[]=[];
 for(const s of [-1,1] as const){const col=cols[s].sort((a,b)=>a.ay-b.ay);
  let y=-1e9;for(const c of col){c.y=Math.max(c.ay,y+c.h+gap,top+c.h/2);y=c.y;}
  let lim=card.h-bottom;for(let i=col.length-1;i>=0;i--){const c=col[i];if(c.y+c.h/2>lim)c.y=lim-c.h/2;lim=c.y-c.h/2-gap;}
  for(const c of col){const want=s<0?obj.l-14-c.w/2:obj.r+14+c.w/2;c.x=clamp(want,4+c.w/2,card.w-4-c.w/2);out.push(c);}}
 return out;}
const esc=(t:string)=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
/** The tags as SVG (a dot on the part, a leader, a pill; lit in the accent while the part works). Tappable via data-fig-label. */
export function labelsSvg(list:readonly PlacedLabel[],font=13,alpha=1){
 let s='';for(const c of list){const ex=c.x-c.side*c.w/2;
  s+=`<g data-fig-label="${esc(c.id)}"${c.on?' data-on=""':''} style="cursor:pointer"><path d="M${c.ax.toFixed(1)} ${c.ay.toFixed(1)}L${(ex-c.side*6).toFixed(1)} ${c.y.toFixed(1)}L${ex.toFixed(1)} ${c.y.toFixed(1)}" fill="none" stroke="${c.on?'var(--accent)':INK}" stroke-width="1"/>`
  +`<circle cx="${c.ax.toFixed(1)}" cy="${c.ay.toFixed(1)}" r="2.4" fill="${c.on?'var(--accent)':INK}"/>`
  +`<rect x="${(c.x-c.w/2).toFixed(1)}" y="${(c.y-c.h/2).toFixed(1)}" width="${c.w}" height="${c.h}" rx="${c.h/2}" fill="${c.on?'var(--accent)':'#fbfbf8'}" stroke="${c.on?'var(--accent)':INK}" stroke-width="1"/>`
  +`<text x="${c.x.toFixed(1)}" y="${(c.y+font*.36).toFixed(1)}" font-size="${font}" text-anchor="middle" font-family="ui-monospace,'SF Mono',Menlo,monospace" font-weight="700" fill="${c.on?'#fff':INK}">${esc(c.text)}</text></g>`;}
 return alpha<1?`<g opacity="${alpha.toFixed(3)}">${s}</g>`:s;}
