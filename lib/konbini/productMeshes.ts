import * as T from 'three';
/**
 * Chunky low-poly 3D shelf products for the Konbini (user, Sep 29 2026: "the items on the shelf need to be isometric too, to
 * give more depth and volume"). Every food, drink and piece of shelf stock is a tiny flat-shaded mesh with vertex colours in the
 * same palette as the 2D iso art (lib/konbini/foodArt.ts), so the zoomed shelf shows tops and sides that catch the store light.
 *
 * Heat (docs/performance-guide.md, "Walk-in Konbini"): the scene clones these into its ONE merged static Lambert mesh, so the
 * products add no draw calls; each geometry is built once per key per scene (cached, disposed with the scene). Faces are flat
 * (non-indexed, face normals) with a mild baked tone (tops lighter, sides darker) so the three-tone iso read survives the light.
 * Hidden faces are never built: no bottoms, no backs on boxes. Base at y = 0, front faces local +z, nominal footprint ≈ 0.3 m.
 * Generic, original packaging only: no brands or logos.
 */
type V=[number,number,number];
const color=new T.Color();
class Builder{
 pos:number[]=[];col:number[]=[];
 /** One triangle; wound so its normal points away from `center` (every part is convex). */
 tri(a:V,b:V,c:V,hex:string,center:V){
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-12)return;nx/=l;ny/=l;nz/=l;
  const mx=(a[0]+b[0]+c[0])/3-center[0],my=(a[1]+b[1]+c[1])/3-center[1],mz=(a[2]+b[2]+c[2])/3-center[2];
  if(nx*mx+ny*my+nz*mz<0){[b,c]=[c,b];nx=-nx;ny=-ny;nz=-nz;}
  // Never seen: products are always viewed from their front and above (shelf fronts face the aisle and the zoom camera), so
  // back-facing and downward faces are not built at all.
  if((nz<-.3&&ny<.45)||ny<-.6)return;
  // Baked tone: tops a touch lighter, left/right sides a touch darker, fronts as-is (the scene light adds the rest).
  const f=Math.max(.6,Math.min(1.2,1+.1*ny-.16*Math.abs(nx)));color.set(hex);
  for(const p of [a,b,c]){this.pos.push(p[0],p[1],p[2]);this.col.push(color.r*f,color.g*f,color.b*f);}
 }
 quad(a:V,b:V,c:V,d:V,hex:string,center:V){this.tri(a,b,c,hex,center);this.tri(a,c,d,hex,center);}
 /** Box without bottom (and without back unless asked): top, front, left, right. */
 box(x:number,y:number,z:number,w:number,h:number,d:number,hex:string,o:{top?:string;front?:string;side?:string;back?:boolean}={}){
  const x0=x-w/2,x1=x+w/2,y1=y+h,z0=z-d/2,z1=z+d/2,c:V=[x,y+h/2,z];
  this.quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],o.top??hex,c);
  this.quad([x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],o.front??hex,c);
  this.quad([x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],o.side??hex,c);
  this.quad([x1,y,z0],[x1,y,z1],[x1,y1,z1],[x1,y1,z0],o.side??hex,c);
  if(o.back)this.quad([x0,y,z0],[x1,y,z0],[x1,y1,z0],[x0,y1,z0],hex,c);
 }
 /** Upright n-sided frustum (sides + optional top cap). `sz` squashes the depth (oval footprints). */
 cyl(x:number,y:number,z:number,r0:number,r1:number,h:number,n:number,hex:string,o:{top?:string|false;rot?:number;sz?:number}={}){
  const rot=o.rot??Math.PI/n,sz=o.sz??1,c:V=[x,y+h/2,z],ring=(r:number,yy:number)=>Array.from({length:n},(_,i)=>{const a=rot+i*Math.PI*2/n;return [x+Math.sin(a)*r,yy,z+Math.cos(a)*r*sz] as V;});
  const A=ring(r0,y),B=ring(r1,y+h);
  for(let i=0;i<n;i++){const j=(i+1)%n;this.quad(A[i],A[j],B[j],B[i],hex,c);}
  if(o.top!==false&&r1>1e-4){const top:V=[x,y+h,z];for(let i=0;i<n;i++)this.tri(top,B[i],B[(i+1)%n],o.top??hex,[x,y+h-1,z]);}
 }
 /** A soft dome: `rings` latitude bands from the base ring to the crown; colAt(ring,seg) picks each band's colour. */
 dome(x:number,y:number,z:number,r:number,h:number,n:number,rings:number,hex:string,o:{colAt?:(ring:number,seg:number)=>string|undefined;bulge?:number;sz?:number}={}){
  const sz=o.sz??1,c:V=[x,y,z],rot=Math.PI/n,prof=(k:number)=>{const t=k/rings,a=t*Math.PI/2;return {rr:r*Math.cos(a)*(k===0?1-(o.bulge??0):1),yy:y+h*Math.sin(a)};};
  const ringAt=(k:number)=>{const {rr,yy}=prof(k);return Array.from({length:n},(_,i)=>{const a=rot+i*Math.PI*2/n;return [x+Math.sin(a)*rr,yy,z+Math.cos(a)*rr*sz] as V;});};
  let prev=ringAt(0);
  for(let k=1;k<=rings;k++){
   if(k===rings){const top:V=[x,y+h,z];for(let i=0;i<n;i++)this.tri(prev[i],prev[(i+1)%n],top,o.colAt?.(k-1,i)??hex,c);break;}
   const next=ringAt(k);for(let i=0;i<n;i++){const j=(i+1)%n;this.quad(prev[i],prev[j],next[j],next[i],o.colAt?.(k-1,i)??hex,c);}prev=next;
  }
 }
 /** A convex polygon in the x–y plane extruded along z (front cap, back cap optional, sides except flat bottoms). */
 prism(poly:[number,number][],z0:number,z1:number,hex:string,o:{front?:string;side?:string|((i:number)=>string);back?:boolean}={}){
  const cx=poly.reduce((s,p)=>s+p[0],0)/poly.length,cy=poly.reduce((s,p)=>s+p[1],0)/poly.length,c:V=[cx,cy,(z0+z1)/2];
  const F=poly.map(p=>[p[0],p[1],z1] as V),Bk=poly.map(p=>[p[0],p[1],z0] as V);
  for(let i=1;i<poly.length-1;i++)this.tri(F[0],F[i],F[i+1],o.front??hex,c);
  if(o.back)for(let i=1;i<poly.length-1;i++)this.tri(Bk[0],Bk[i],Bk[i+1],hex,c);
  for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;if(Math.abs(poly[i][1])<1e-6&&Math.abs(poly[j][1])<1e-6)continue;// flat bottom edge: hidden
   this.quad(F[i],F[j],Bk[j],Bk[i],typeof o.side==='function'?o.side(i):o.side??hex,c);}
 }
 /** An n-sided cylinder between two points (potatoes, skewers, banana segments), with an optional cap colour at `b`. */
 rod(a:V,b:V,r:number,n:number,hex:string,capB?:string){
  const ax=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize(),u=new T.Vector3().crossVectors(ax,Math.abs(ax.y)>.9?new T.Vector3(1,0,0):new T.Vector3(0,1,0)).normalize(),w=new T.Vector3().crossVectors(ax,u);
  const ring=(p:V)=>Array.from({length:n},(_,i)=>{const t=i*Math.PI*2/n,cx=Math.cos(t)*r,sy=Math.sin(t)*r;return [p[0]+u.x*cx+w.x*sy,p[1]+u.y*cx+w.y*sy,p[2]+u.z*cx+w.z*sy] as V;});
  const A=ring(a),B=ring(b),c:V=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  for(let i=0;i<n;i++){const j=(i+1)%n;this.quad(A[i],A[j],B[j],B[i],hex,c);}
  if(capB)for(let i=1;i<n-1;i++)this.tri(B[0],B[i],B[i+1],capB,c);
 }
 /** Low-poly ball: the icosahedron's corner faces white, the 20 centre faces in the accent colour (a patterned match ball). */
 ball(x:number,y:number,z:number,r:number,accent:string,base='#fbfaf5'){
  const g=new T.IcosahedronGeometry(r,1),p=g.attributes.position,c:V=[x,y+r,z],verts=new T.IcosahedronGeometry(1,0).attributes.position,dirs:T.Vector3[]=[];
  for(let i=0;i<verts.count;i++){const v=new T.Vector3().fromBufferAttribute(verts,i).normalize();if(!dirs.some(d=>d.distanceTo(v)<1e-3))dirs.push(v);}
  for(let i=0;i<p.count;i+=3){const a:V=[p.getX(i)+x,p.getY(i)+y+r,p.getZ(i)+z],b:V=[p.getX(i+1)+x,p.getY(i+1)+y+r,p.getZ(i+1)+z],d:V=[p.getX(i+2)+x,p.getY(i+2)+y+r,p.getZ(i+2)+z];
   // A corner face touches one of the 12 original vertices; the centre face of each subdivided triangle touches none.
   const corner=[i,i+1,i+2].some(k=>{const v=new T.Vector3(p.getX(k),p.getY(k),p.getZ(k)).normalize();return dirs.some(dd=>dd.distanceTo(v)<1e-3);});
   this.tri(a,b,d,corner?base:accent,c);}
  g.dispose();
 }
 geometry(){
  const g=new T.BufferGeometry(),n=this.pos.length/3;
  g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));
  g.computeVertexNormals();// non-indexed → each triangle keeps its own face normal (flat shading)
  g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(n*2),2));
  // A trivial index so it merges with the store's indexed BoxGeometry boxes.
  g.setIndex(Array.from({length:n},(_,i)=>i));
  g.computeBoundingBox();return g;
 }
}

// ---- Palette (shared with the 2D iso art) ------------------------------------------------------------------------------------
const RICE='#f4f0e3',NORI='#26332c',MEAT='#e8897f',EGG='#ffd34d',TRAY='#d6e6ea',KRAFT='#d8b27a',CUP='#f6f1e4',CORAL='#f07a5f',TEAL='#2f8f8a',YELLOW='#ffd35c';

function musubi(b:Builder,v:string){
 b.box(0,0,0,.28,.015,.15,TRAY);
 const tier=(y:number)=>{b.box(0,y,0,.24,.085,.12,RICE);b.box(0,y+.085,0,.23,.035,.11,MEAT,{top:'#ef9a8f'});return y+.12;};
 let top=tier(.015);
 if(v==='double')top=tier(top);
 if(v==='tamago'){b.box(0,top,0,.23,.035,.11,EGG);top+=.035;}
 if(v==='katsu'){b.box(0,top,0,.235,.035,.115,'#d99a3a',{top:'#e8ad4f'});top+=.035;}
 if(v==='teriyaki'){b.box(0,top,0,.232,.01,.112,'#7a3a14');top+=.01;}
 if(v==='furikake')for(const [dx,dy,col] of [[-.09,.05,'#1f2a22'],[-.06,.07,'#f3e2b0'],[.07,.045,'#1f2a22'],[.1,.068,'#4f7a3a'],[-.1,.075,'#f3e2b0']] as const)b.quad([dx,dy,.0605],[dx+.014,dy,.0605],[dx+.014,dy+.012,.0605],[dx,dy+.012,.0605],col,[0,.05,0]);
 b.box(0,.013,0,.08,top-.013+.006,.126,NORI,{top:'#34453b'});
}
function onigiri(b:Builder,fill:string){
 const tri:[number,number][]=[[-.1,0],[.1,0],[.125,.025],[.028,.2],[-.028,.2],[-.125,.025]];
 b.prism(tri,-.045,.045,RICE);
 b.box(0,0,0,.15,.085,.096,NORI,{top:'#34453b'});// the nori wraps the bottom
 b.box(0,.155,.046,.035,.025,.004,fill);// the filling peeks out at the top
 b.quad([-.007,.085,.0485],[.007,.085,.0485],[.009,.19,.0465],[-.009,.19,.0465],'#d8342c',[0,.1,0]);// the red tear strip on the film
 b.quad([.03,.03,.0485],[.065,.03,.0485],[.065,.065,.0485],[.03,.065,.0485],fill,[.04,.04,0]);// a label sticker in the filling's colour
}
function sando(b:Builder,filling:string,bits:string){
 b.box(0,0,0,.3,.012,.13,'#dcc08f');
 for(const s of [-1,1]){// two halves standing back to back; the sloped cut faces show bread | filling | bread
  const poly:[number,number][]=s<0?[[-.14,0],[-.005,0],[-.005,.19]]:[[.005,0],[.14,0],[.005,.19]];
  b.prism(poly,-.055,-.02,'#fbf3de',{side:'#fbf3de'});b.prism(poly,-.02,.02,filling,{front:filling,side:filling});b.prism(poly,.02,.055,'#fbf3de',{front:'#fbf3de',side:'#fbf3de'});
  b.box(s*.06,.03,.021,.02,.02,.002,bits);}
}
function cup(b:Builder,y:number,r0:number,r1:number,bands:[number,string][],n:number,top:string){
 let yy=y,rr=r0;const total=bands.reduce((s,x)=>s+x[0],0);
 bands.forEach(([h,col],i)=>{const r2=rr+(r1-r0)*h/total;b.cyl(0,yy,0,rr,r2,h,n,col,{top:i===bands.length-1?top:false});yy+=h;rr=r2;});
 return yy;
}
function bottle(b:Builder,body:string,label:string,cap:string){
 const n=6,r=.065;b.cyl(0,0,0,r,r,.07,n,body,{top:false});b.cyl(0,.07,0,r,r,.11,n,label,{top:false});b.cyl(0,.18,0,r,r*.95,.035,n,body,{top:false});
 b.cyl(0,.215,0,r*.95,.028,.055,n,body,{top:false});b.cyl(0,.27,0,.03,.03,.035,n,cap,{top:cap});
}
function carton(b:Builder,body:string,label:string,straw?:string){
 b.box(0,0,0,.13,.2,.13,body,{front:body});b.box(0,.07,0,.132,.08,.132,label);
 b.prism([[-.065,.2],[.065,.2],[0,.25]],-.065,.065,'#e9e9e2',{front:body,back:false});
 b.box(0,.245,0,.02,.02,.13,'#e9e9e2');
 if(straw)b.rod([.03,.2,.03],[.05,.31,.04],.008,4,straw,straw);
}
function can(b:Builder,x:number,body:string,band:string,h:number,r:number,n=7){
 b.cyl(x,0,0,r,r,h*.4,n,body,{top:false});b.cyl(x,h*.4,0,r,r,h*.32,n,band,{top:false});b.cyl(x,h*.72,0,r,r,h*.22,n,body,{top:false});
 b.cyl(x,h*.94,0,r,r*.86,h*.06,n,'#c9ced4',{top:'#dfe3e7'});
}

const FOOD:Record<string,(b:Builder)=>void>={
 'musubi-classic':b=>musubi(b,'classic'),'musubi-tamago':b=>musubi(b,'tamago'),'musubi-furikake':b=>musubi(b,'furikake'),
 'musubi-teriyaki':b=>musubi(b,'teriyaki'),'musubi-katsu':b=>musubi(b,'katsu'),'musubi-double':b=>musubi(b,'double'),
 'onigiri-salmon':b=>onigiri(b,'#f08a5d'),'onigiri-tuna':b=>onigiri(b,'#e9d49a'),'onigiri-ume':b=>onigiri(b,'#c2334d'),'onigiri-kombu':b=>onigiri(b,'#4a5a30'),
 'sando-tamago':b=>sando(b,'#ffd966','#fff3c4'),'sando-tropical':b=>sando(b,'#fffaf0','#ffb52e'),
 'hot-karaage':b=>{const top=cup(b,0,.075,.095,[[.05,CUP],[.03,'#e0503c'],[.04,CUP]],6,'#d9d0bb');
  for(const [x,z,s] of [[-.035,-.02,1],[.035,-.015,.95],[0,.03,1.05]] as const)b.dome(x,top-.02,z,.05*s,.055*s,5,2,'#c8782c',{colAt:k=>k?'#e3a04f':undefined});
  b.rod([.02,top,.0],[.07,top+.13,-.02],.006,4,'#e8d3a0');},
 'hot-nikuman':b=>{b.cyl(0,0,0,.14,.14,.05,8,'#d9b27a',{top:'#c49a5e'});
  for(const [x,z] of [[-.055,-.01],[.06,.015]] as const){b.dome(x,.05,z,.07,.085,6,2,'#f7f1e3',{bulge:.12});b.cyl(x,.13,z,.012,.004,.012,4,'#e9dfc8');}},
 'hot-oden':b=>{const top=cup(b,0,.08,.1,[[.07,'#f7f5ee'],[.025,'#d8342c']],7,'#d9a25a');
  b.rod([0,top-.02,0],[0,top+.2,0],.006,4,'#e8d3a0');b.cyl(0,top-.01,0,.05,.05,.04,6,'#f3e3bf',{top:'#e9cf94'});
  b.dome(0,top+.035,0,.04,.055,6,2,'#d9b98a');b.prism([[-.045,0],[.045,0],[0,.06]].map(([x,y])=>[x,y+top+.09] as [number,number]),-.015,.015,'#d8a868');},
 'hot-yakiimo':b=>{b.rod([-.02,.08,0],[.09,.24,-.01],.042,6,'#7b3868','#ffc23d');b.box(0,0,0,.16,.14,.1,KRAFT,{top:'#6b4a2e'});b.box(0,.05,.051,.1,.03,.002,'#c23b2b');},
 'hot-cupnoodles':b=>{cup(b,0,.08,.1,[[.05,'#fbfaf5'],[.07,CORAL],[.015,YELLOW],[.055,'#fbfaf5']],8,'#efe9da');b.box(.06,.19,.03,.05,.005,.04,CORAL);},
 'bento-small':b=>{b.box(0,0,0,.28,.05,.2,'#2a2a2e',{top:'#3a3a40'});b.box(-.07,.05,0,.12,.02,.17,RICE);b.dome(-.07,.07,.02,.018,.015,5,1,'#c2334d');
  b.box(.06,.05,-.045,.12,.03,.08,'#b8641f',{top:'#c9782c'});b.box(.035,.05,.045,.07,.025,.07,'#6fbf4f');b.box(.1,.05,.045,.05,.035,.07,EGG);b.box(0,.05,.101,.285,.012,.004,'#dff3fb');},
 'bento-locomoco':b=>{b.box(0,0,0,.28,.05,.2,'#2a2a2e',{top:'#3a3a40'});b.box(-.05,.05,0,.16,.02,.17,RICE);b.cyl(-.05,.07,0,.06,.055,.025,7,'#6a3a24',{top:'#8a5a2b'});
  b.cyl(-.04,.095,.01,.04,.04,.006,6,'#fbfaf5');b.dome(-.04,.101,.01,.016,.014,5,1,'#ffc23d');b.box(.09,.05,0,.08,.035,.17,'#6fbf4f',{top:'#8fd46a'});b.dome(.09,.085,.04,.02,.02,5,1,'#e43b4b');b.box(0,.05,.101,.285,.012,.004,'#dff3fb');},
 'sweet-melonpan':b=>{b.box(0,0,0,.26,.008,.26,'#e7d3ae');b.dome(0,.008,0,.12,.1,8,3,'#f5d77a',{colAt:(k,i)=>k===0?'#e7b95a':(k+i)%2?'#f5d77a':'#e3bd57'});},
 'sweet-daifuku':b=>{b.box(0,0,0,.28,.02,.18,'#3b3f44',{top:'#4a4f55'});b.dome(-.06,.02,-.01,.07,.07,7,2,'#fbf6f6',{bulge:.12});b.dome(.07,.02,.01,.07,.07,7,2,'#f6c1cf',{bulge:.12});},
 'sweet-mangomochi':b=>{b.cyl(0,0,0,.1,.12,.03,8,'#fff',{top:'#f3e6c8'});b.dome(0,.03,0,.1,.09,7,2,'#fff4e0',{bulge:.1});b.dome(.06,.03,.05,.035,.03,5,1,'#ffb52e');},
 'sweet-malasada':b=>{b.box(0,0,0,.28,.02,.16,'#e0503c',{top:'#fbfaf5'});
  for(const [x,z] of [[-.065,-.01],[.07,.01]] as const)b.dome(x,.02,z,.075,.075,6,2,'#d9923a',{colAt:k=>k===1?'#fbe9c4':undefined});},
 'sweet-dorayaki':b=>{let y=0;for(const [x,z] of [[0,0],[.02,-.01]] as const){b.cyl(x,y,z,.11,.11,.025,6,'#f0c77a',{top:false});b.cyl(x,y+.025,z,.1,.1,.018,6,'#5e1f2c',{top:false});b.cyl(x,y+.043,z,.11,.105,.028,6,'#f0c77a',{top:'#a8591f'});y+=.071;}},
 'drink-water':b=>bottle(b,'#c6ecfa',TEAL,TEAL),'drink-greentea':b=>bottle(b,'#8cc46a','#fff6dc','#3d7a3a'),'drink-sports':b=>bottle(b,'#bfe8f7','#ffffff','#1f6fb2'),
 'drink-milk':b=>carton(b,'#ffffff','#5fb8f2'),'drink-pineapple':b=>carton(b,'#ffe28a',TEAL,CORAL),
 'drink-coconut':b=>can(b,0,'#e9f4ef','#6b4a2e',.3,.06),
};
const BALL_ACCENT:Record<string,string>={sunset:'#f07a5f',neon:'#7ad84a',frost:'#7fc6f0',solar:'#f2b42a',cosmic:'#7a5be0'};
const DECOR:Record<string,(b:Builder)=>void>={
 ball:b=>b.ball(0,0,0,.12,'#1f3d3a'),
 pack:b=>{b.box(0,0,0,.16,.22,.035,TEAL);b.box(0,.08,0,.162,.04,.037,YELLOW);b.box(0,.2,0,.12,.012,.036,'#fff6dc');},
 goal:b=>{b.box(-.12,0,0,.018,.18,.018,'#fbfaf5');b.box(.12,0,0,.018,.18,.018,'#fbfaf5');b.box(0,.18,0,.258,.018,.018,'#fbfaf5');b.quad([-.12,0,-.08],[.12,0,-.08],[.12,.17,-.01],[-.12,.17,-.01],'#c9d6d2',[0,.1,.2]);},
 shinpads:b=>{for(const x of [-.055,.055]){b.box(x,0,0,.085,.18,.035,CORAL,{top:'#f59a82'});b.box(x,.19,0,.075,.03,.03,'#f59a82');b.box(x,.05,0,.087,.022,.037,'#fbfaf5');}},
 bagA:b=>{b.box(0,0,0,.18,.22,.07,'#f07a5f');b.box(0,.215,0,.17,.03,.03,'#f59a82');b.quad([0,.05,.0355],[.045,.095,.0355],[0,.14,.0355],[-.045,.095,.0355],YELLOW,[0,.09,0]);},
 bagB:b=>{b.box(0,0,0,.18,.22,.07,'#5b6fb8');b.box(0,.215,0,.17,.03,.03,'#7a8cd0');b.box(0,.09,0,.182,.04,.072,'#9ad04a');},
 crackers:b=>{b.box(0,0,0,.24,.15,.08,'#fff1d3');b.box(0,.1,0,.242,.03,.082,'#c98a3a');for(const x of [-.06,0,.06])b.quad([x,.02,.041],[x+.022,.042,.041],[x,.064,.041],[x-.022,.042,.041],'#c98a3a',[x,.04,0]);},
 banana:b=>{const P:V[]=[[-.1,.14,0],[-.05,.06,0],[.04,.04,0],[.11,.1,0]];for(let i=0;i<3;i++)b.rod(P[i],P[i+1],.025,5,'#f2d24b',i===2?'#6b4a2e':undefined);},
 cans:b=>{can(b,-.09,'#d8342c','#fbfaf5',.15,.045,6);can(b,0,TEAL,YELLOW,.15,.045,6);can(b,.09,YELLOW,CORAL,.15,.045,6);},
 noodles:b=>{cup(b,0,.08,.1,[[.05,'#fbfaf5'],[.07,CORAL],[.015,YELLOW],[.055,'#fbfaf5']],8,'#efe9da');},
 cone:b=>{b.box(0,0,0,.18,.015,.18,'#ff8a2a');b.cyl(0,.015,0,.08,.05,.08,6,'#ff8a2a',{top:false});b.cyl(0,.095,0,.05,.04,.035,6,'#fbfaf5',{top:false});b.cyl(0,.13,0,.04,.008,.09,6,'#ff8a2a');},
 bottleRow:b=>{for(const [x,body,cap] of [[-.09,'#bfe6f5',TEAL],[0,'#8cc46a','#3d7a3a'],[.09,'#7fd3f0','#1f6fb2']] as const){b.cyl(x,0,0,.04,.04,.08,6,body,{top:false});b.cyl(x,.08,0,.041,.041,.05,6,x?'#fff6dc':TEAL,{top:false});b.cyl(x,.13,0,.04,.018,.07,6,body,{top:false});b.cyl(x,.2,0,.02,.02,.025,6,cap,{top:cap});}},
};
/** Every product key: the Konbini foods and drinks, the shelf decor stock, and `ball:<style>` for the gear balls. */
export const PRODUCT_KEYS=[...Object.keys(FOOD),...Object.keys(DECOR)];
export const hasProduct=(key:string)=>key in FOOD||key in DECOR||key.startsWith('ball:');
/** Nominal footprint the builders are drawn at; the scene scales by (slot width / NOMINAL). */
export const PRODUCT_NOMINAL=.36;
export function buildProduct(key:string):T.BufferGeometry{
 const b=new Builder();
 if(key.startsWith('ball:'))b.ball(0,0,0,.12,BALL_ACCENT[key.slice(5)]??'#1f3d3a');
 else (FOOD[key]??DECOR[key]??DECOR.pack)(b);
 return b.geometry();
}
/** A per-scene cache: one geometry per key (clone it for merging; the lift mesh uses it directly). */
export function createProductCache(){
 const cache=new Map<string,T.BufferGeometry>();
 return {get(key:string){let g=cache.get(key);if(!g){g=buildProduct(key);cache.set(key,g);}return g;},dispose(){cache.forEach(g=>g.dispose());cache.clear();},get size(){return cache.size;}};
}
export const productTriangles=(g:T.BufferGeometry)=>(g.index?g.index.count:g.attributes.position.count)/3;

// ---- Shelf stocking (pure: shared by the scene and tests/konbini-shelf.cjs) --------------------------------------------------
/** Front facings per shelf row and how many copies deep each fixture is stocked. */
export const STOCK={fridgeDepth:3,riceDepth:2,gondolaDepth:2,depthStep:{fridge:.17,rice:.15,gondola:.14}} as const;
export const fridgeDoors=(len:number)=>Math.max(1,Math.round(len/1.1));
export const riceFacings=(len:number)=>Math.floor(len/.46);
export const gondolaFacings=(len:number)=>Math.max(2,Math.floor(len/.42));
/** How many product meshes a fixture holds (fronts × depth), for the triangle budget. */
export function fixtureProductCount(kind:string,len=2){
 switch(kind){
  case 'fridgeWall':return fridgeDoors(len)*4*2*STOCK.fridgeDepth;
  case 'riceCase':return riceFacings(len)*3*STOCK.riceDepth;
  case 'gondola':return gondolaFacings(len)*3*(STOCK.gondolaDepth+1);// the aisle-facing side is stocked deep, the back side (behind the divider) one deep
  case 'gearRack':return 6;
  case 'counter':return 8;
  default:return 0;
 }
}
/** Seeded jitter so the shelves look hand-stocked (deterministic per slot). */
export function stockJitter(seed:number){let a=seed*2654435761>>>0;const r=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};return {yaw:(r()-.5)*.24,x:(r()-.5)*.04};}
