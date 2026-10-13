/**
 * telstar-1970 · the ball as pure geometry (Oct 10 2026 modern gallery pass, docs/museum-modern-style.md). Pure maths, no DOM,
 * so tests/museum-exp-telstar-1970.cjs can check it in Node.
 *
 * The Telstar is a truncated icosahedron: 12 black pentagons (5 sides) and 20 white hexagons (6 sides), 32 panels. We stand one
 * pentagon at the pole and draw the ball as two flat orthographic discs, FRONT and BACK, like a map of a globe: each disc carries
 * 16 panels (6 pentagons + 10 hexagons), 12 + 20 = 32. Panel outlines are curved (each edge split in 4) and points that fall
 * behind the limb are pinned to it, so the discs read as spheres drawn with a ruler and compass.
 */
export type PanelKind='pent'|'hex';
type V3=[number,number,number];
export type Panel={kind:PanelKind;c:V3;pts:V3[]};

const PHI=(1+Math.sqrt(5))/2;
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=(a:V3):V3=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};

/** The 32 panels: unit-sphere centres and curved outlines (each edge split in 4). Pentagons first. */
export function buildPanels():Panel[]{
 const V:V3[]=[];for(const a of [-1,1])for(const b of [-1,1]){V.push([0,a,b*PHI],[a,b*PHI,0],[b*PHI,0,a]);}
 const near=(i:number)=>V.map((_,j)=>j).filter(j=>j!==i&&Math.abs(Math.hypot(...sub(V[i],V[j]))-2)<1e-6);
 const ring=(centre:V3,pts:V3[])=>{const n=norm(centre),u=norm(cross(n,Math.abs(n[0])<.9?[1,0,0]:[0,1,0])),v=cross(n,u);
  return pts.slice().sort((p,q)=>Math.atan2(dot(sub(p,centre),v),dot(sub(p,centre),u))-Math.atan2(dot(sub(q,centre),v),dot(sub(q,centre),u)));};
 const curve=(pts:V3[])=>{const out:V3[]=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let k=0;k<4;k++)out.push(norm(add(a,mul(sub(b,a),k/4))));}return out;};
 const third=(a:V3,b:V3)=>add(a,mul(sub(b,a),1/3));
 const panels:Panel[]=[];
 V.forEach((a,i)=>{const pts=ring(a,near(i).map(j=>third(a,V[j])));panels.push({kind:'pent',c:norm(a),pts:curve(pts)});});
 for(let i=0;i<12;i++)for(const j of near(i))if(j>i)for(const k of near(j))if(k>j&&near(i).includes(k)){
  const a=V[i],b=V[j],c=V[k],centre=mul(add(add(a,b),c),1/3);
  const pts=ring(centre,[third(a,b),third(a,c),third(b,a),third(b,c),third(c,a),third(c,b)]);
  panels.push({kind:'hex',c:norm(centre),pts:curve(pts)});}
 return panels;
}

// Rotations as 3×3 row matrices.
type M3=[V3,V3,V3];
const rotAxis=(axis:V3,ang:number):M3=>{const [x,y,z]=norm(axis),c=Math.cos(ang),s=Math.sin(ang),t=1-c;
 return [[t*x*x+c,t*x*y-s*z,t*x*z+s*y],[t*x*y+s*z,t*y*y+c,t*y*z-s*x],[t*x*z-s*y,t*y*z+s*x,t*z*z+c]];};
const mm=(a:M3,b:M3):M3=>[0,1,2].map(i=>[0,1,2].map(j=>a[i][0]*b[0][j]+a[i][1]*b[1][j]+a[i][2]*b[2][j])) as M3;
const mv=(m:M3,v:V3):V3=>[dot(m[0],v),dot(m[1],v),dot(m[2],v)];
/** The rotation that stands pentagon 0 at the viewer (+z), then turns it `spin` about the view axis and tips it `tilt` about x. */
function pose(panels:Panel[],spin=0,tilt=0):M3{
 const c=panels[0].c,z:V3=[0,0,1],ax=cross(c,z),s=Math.hypot(...ax);
 const toPole=s<1e-9?rotAxis([1,0,0],dot(c,z)>0?0:Math.PI):rotAxis(ax,Math.atan2(s,dot(c,z)));
 return mm(rotAxis([1,0,0],tilt),mm(rotAxis(z,spin),toPole));
}

export type Flat={i:number;kind:PanelKind;x:number;y:number;z:number;d:string};
const f1=(n:number)=>Math.round(n*10)/10;
/** One orthographic disc of radius r centred on (cx, cy): the panels whose centres face the viewer, as SVG path data. */
function disc(panels:Panel[],R:M3,cx:number,cy:number,r:number,keep:(z:number)=>boolean,pinAll=false):Flat[]{
 const out:Flat[]=[];
 panels.forEach((p,i)=>{const c=mv(R,p.c);if(!keep(c[2]))return;
  const pts=p.pts.map(q=>{const v=mv(R,q);let x=v[0],y=v[1];if(v[2]<0||pinAll&&v[2]<0){const l=Math.hypot(x,y)||1;x/=l;y/=l;}return [f1(cx+x*r),f1(cy-y*r)];});
  out.push({i,kind:p.kind,x:f1(cx+c[0]*r),y:f1(cy-c[1]*r),z:c[2],d:'M'+pts.map(q=>q.join(' ')).join('L')+'Z'});});
 return out.sort((a,b)=>a.z-b.z);
}
/** The two discs of the "12 + 20" map: FRONT (the panels facing you) and BACK (the ones behind, seen from behind). 16 + 16. */
export function hemispheres(r=100){
 const panels=buildPanels(),R=pose(panels,.18);
 const back:M3=mm([[-1,0,0],[0,1,0],[0,0,-1]],R);// turn round to look at the back
 const front=disc(panels,R,0,0,r,z=>z>0),rear=disc(panels,back,0,0,r,z=>z>0);
 return {front,back:rear};
}
/** The close-up ball: every panel with a visible part, back to front, tipped so no symmetry hides a spin. */
export function closeUp(r=100,tilt=.62,spin=.3){
 const panels=buildPanels(),R=pose(panels,spin,tilt);
 return disc(panels,R,0,0,r,z=>z>.02);
}
/** Gap order for the "Stitch" tray: front disc first, centre outwards, then the back disc. */
export function gapOrder(front:readonly Flat[],back:readonly Flat[]){
 const rank=(f:Flat)=>-f.z;
 return [...[...front].sort((a,b)=>rank(a)-rank(b)).map(f=>f.i),...[...back].sort((a,b)=>rank(a)-rank(b)).map(f=>f.i)];
}
export const SIDES:Record<PanelKind,number>={pent:5,hex:6};
/** A regular polygon's points (for the tray pieces and the 12 + 20 card), first vertex up. */
export function polygon(n:number,cx:number,cy:number,r:number){
 return Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return `${f1(cx+r*Math.cos(a))},${f1(cy+r*Math.sin(a))}`;}).join(' ');
}

/**
 * The broadcast's colours, chosen so the lesson is true on screen: under a black-and-white picture (CSS grayscale, the Rec. 709
 * weights) the brown leather ball and the grass come out the same mid-grey (≈ 110 v ≈ 113 of 255) and the ball disappears,
 * while the Telstar's white and black stay at the two ends of the scale.
 */
export const GRASS='#5a7d3c',LEATHER='#a0662e',LEATHER_SEAM='#93602c';
export const grey=(hex:string)=>{const n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return .2126*r+.7152*g+.0722*b;};
