import {FOOD_MENU} from './food';
import {Iso,rng,tone,softShadow,steam,sheen,ngon,lerp3,TAU,type C,type V3,type P2,type Rng} from './isoArt';
import {drinkRevealLayers,drinkShadow} from '../graphics/drinkArt';
import {DRINKS,type DrinkArt} from '../town/drinkMachines';
/**
 * Layered isometric art for every Konbini food and drink (user, Sep 29 2026: "The Konbini items need better graphics, at an
 * angle to see more depth. Also add more details."). Chunky voxel / low-poly food in a true 30° iso view with 3-tone face
 * shading, seeded pixel textures (grill marks, rice grains, sesame, crumbs), a fitting vessel and a soft shadow, drawn with the
 * shared kit in isoArt.ts. Original art only: generic packaging, no brands or logos.
 *
 * One source of truth, painted once and cached by every caller:
 *  - the shelf atlas (konbiniAtlas.ts) paints the finished stack into its cell once per visit (and the eat sprite reuses it);
 *  - the backpack collection tiles and silhouettes paint `drawFood` once per size (foodBitmap, a small LRU cache);
 *  - the big purchase reveal (components/KonbiniReveal.tsx) builds the SAME art layer by layer: each layer drops and snaps in, a
 *    `pull` layer (onigiri film, cup-noodle lid, bento lid) slides away, a `pour` layer (hot water) streams in and is gone at the
 *    end, `steam` rises and stays, a `replace` layer (the sando cut, the dorayaki bite) cross-fades over what came before.
 * Coordinates: a 64-unit cell centred on (x, y); the reveal scales the context.
 */
/** `glint` fades in like steam but stays on every finished picture (condensation beads, sparkles). */
export type LayerKind='drop'|'pull'|'pour'|'steam'|'glint'|'replace';
export type FoodLayer={name:string;kind?:LayerKind;draw:(c:CanvasRenderingContext2D,x:number,y:number,t?:number)=>void};
/** Soft cast shadow per item, relative to the cell centre (drawn under the first layer). */
export type FoodShadow={rx:number;ry:number;dy:number};
export const FOOD_SHADOW:Record<string,FoodShadow>={};

type Draw=(I:Iso,r:Rng,c:C,t:number)=>void;
type Spec=[name:string,draw:Draw,kind?:LayerKind];
/** Builds an item's layers: `g` moves its ground centre below the cell centre so the finished art sits centred in the cell. */
function item(id:string,g:number,shadow:{rx:number;ry:number},specs:Spec[]):FoodLayer[]{
 FOOD_SHADOW[id]={rx:shadow.rx,ry:shadow.ry,dy:g};
 return specs.map(([name,draw,kind])=>({name,kind,draw:(c,x,y,t=1)=>{c.save();c.lineJoin='round';draw(new Iso(c,x,y+g),rng(`${id}|${name}`),c,t);c.restore();}}));
}

// ---- Palette ------------------------------------------------------------------------------------------------------------------
const RICE='#f4f0e3',RICE_G=['#ffffff','#e2dbc8','#fffdf6'],RICE_R=['#cfc7b2','#e9e3d2'];
const NORI='#27352e',NORI_T=['#36473d','#1b241f','#40544a'];
const MEAT='#e8897f',EGG='#ffd34d',STICK='#ecd9a8',KRAFT='#d6ae74';
const MOCHI:[number,number][]=[[0,.8],[.16,1],[.45,.95],[.75,.7],[.93,.35],[1,0]];
const BUN:[number,number][]=[[0,.84],[.18,1],[.5,.9],[.78,.6],[.94,.25],[1,0]];
/** Visible arc of a horizontal ring (angles whose normal faces the viewer). */
const arc=(cx:number,cy:number,r:number,z:number,ry=r,from=-40,to=130,step=10):V3[]=>{const o:V3[]=[];for(let d=from;d<=to;d+=step){const a=d*Math.PI/180;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*ry,z]);}return o;};
/** Points in a 3D line of pixels (grill marks, drizzles). */
const dash=(a:V3,b:V3,n:number):V3[]=>Array.from({length:n},(_,i)=>lerp3(a,b,n<2?0:i/(n-1)));
const shift=(poly:P2[],dx:number,dy:number):P2[]=>poly.map(([u,v])=>[u+dx,v+dy]);

/**
 * The back half of a round food, split open toward the viewer: its outer shell, the cut face in dough and the filling in the
 * middle (nikuman, daifuku, mango mochi).
 */
function halfCut(I:Iso,r:Rng,cx:number,cy:number,z:number,R:number,H:number,dough:string,fill:string,spk:string[]){
 const prof=MOCHI;I.lathe([cx,cy,z],[cx,cy,z+H],prof.map(([t,k])=>[t,k*R] as [number,number]),dough,{segs:8,th:[Math.PI*.75,Math.PI*1.75],cap:false});
 const d1:V3=[.7071,-.7071,0],d2:V3=[-.7071,.7071,0],side=(d:V3,k:number,t:number):V3=>[cx+d[0]*k*R,cy+d[1]*k*R,z+t*H];
 const cut:V3[]=[...prof.map(([t,k])=>side(d1,k,t)),...[...prof].reverse().map(([t,k])=>side(d2,k,t))];I.face(cut,dough,-.03);
 const ring:V3[]=Array.from({length:12},(_,i)=>{const a=i/12*TAU;return [cx+d1[0]*Math.cos(a)*R*.52,cy+d1[1]*Math.cos(a)*R*.52,z+H*.42+Math.sin(a)*H*.27] as V3;});
 I.face(ring,fill,-.06);I.speckQuad([side(d1,.4,.25),side(d2,.4,.25),side(d2,.3,.6),side(d1,.3,.6)],9,spk,r,1.2,1.1,.12);
 const [sx,sy]=I.p(cx+d2[0]*R*.15,cy+d2[1]*R*.15,z+H*.62);sheen(I.c,sx,sy,2.4,'rgba(255,255,255,.6)');
}

// ---- Spam musubi -----------------------------------------------------------------------------------------------------------
type MusubiKind='classic'|'tamago'|'teriyaki'|'furikake'|'katsu'|'double';
function musubi(id:string,v:MusubiKind):FoodLayer[]{
 const tray:Spec=['plastic tray',I=>{I.box(0,0,0,36,19,2.6,'#cfe0e4',{top:'#dcebee'});
  I.line([[-16.4,-7.8,2.62],[16.4,-7.8,2.62],[16.4,7.8,2.62],[-16.4,7.8,2.62],[-16.4,-7.8,2.62]],'rgba(255,255,255,.85)',.6);
  I.dots([[-13,9.55,1.3],[-8.5,9.55,1.3],[18.05,-5,1.3]],'rgba(255,255,255,.9)',2.4,.7);}];
 const rice=(name:string,z:number,h:number):Spec=>[name,(I,r)=>{const f=I.box(0,0,z,26,12,h,RICE);I.speckQuad(f.top,14,RICE_G,r,1.3,.9);I.speckQuad(f.left,Math.round(h*2.6),RICE_G,r,1.3,.9);I.speckQuad(f.right,Math.round(h),RICE_R,r,1.2,.9);}];
 const slice=(name:string,z:number):Spec=>[name,(I,r,c)=>{const f=I.box(0,0,z,25,11.6,3.4,MEAT,{right:'#e37d73'});const top=z+3.42;
  for(let i=0;i<5;i++){const X=-9.6+i*4.8;I.dots(dash([X-2,-4.9,top],[X+2,4.9,top],7),['#8d3a2f','#a8483c'],1.3,1.1);}
  I.speckQuad(f.left,9,['#c96b5f','#f4b1a6'],r,1.1,.8);const [sx,sy]=I.p(-6,-3,top);sheen(c,sx,sy,3,'rgba(255,255,255,.7)');}];
 const L:Spec[]=[tray];let top:number;
 if(v==='double'){L.push(rice('rice',2.6,7.5),slice('grilled slice',10.1),rice('second rice',13.5,7.5),slice('second slice',21));top=24.4;}
 else{
  L.push(rice('rice',2.6,9),slice('grilled slice',11.6));top=15;
  if(v==='teriyaki')L.push(['teriyaki glaze',(I,r,c)=>{const f=I.box(0,0,15,25.2,11.8,.9,'#8a4217');
   for(const [x,h] of [[-9,2.6],[-3.5,1.6],[2,3],[7.5,1.8]] as const)I.line([[x,5.95,15.2],[x,5.95,15.2-h]],'#8a4217',1.5);
   I.speckQuad(f.top,8,'#f5e6b8',r,1.4,.8);const [sx,sy]=I.p(-5,-3,15.9);sheen(c,sx,sy,5);const [tx,ty]=I.p(6,-1,15.9);sheen(c,tx,ty,2.5);}]);top=15.9;
  if(v==='tamago'){L.push(['rolled egg',(I,r)=>{const f=I.box(0,0,15,25,11.6,4.2,EGG,{right:'#f5c33b'});for(const z of [16.4,17.8])I.line([[-12.5,5.81,z],[12.5,5.81,z]],'#eeb22a',.6);
   I.speckQuad(f.top,10,['#f0b52a','#ffe58a'],r,1.3,1);}]);top=19.2;}
  if(v==='katsu'){L.push(['crispy crumb',(I,r)=>{const f=I.box(0,0,15,25.6,12.2,4.4,'#d99a3a');const cr=['#b8741f','#f2c46a','#9a5a18'];I.speckQuad(f.top,34,cr,r,1.2,1.2);I.speckQuad(f.left,16,cr,r,1.2,1.2);I.speckQuad(f.right,8,cr,r,1.2,1.2);
   I.line([[-10,-3,19.45],[-7,3,19.45],[-4,-3,19.45],[-1,3,19.45],[2,-3,19.45],[5,3,19.45],[8,-3,19.45]],'#5a2d17',1.3);}]);top=19.4;}
  if(v==='furikake')L.push(['furikake sprinkle',(I,r)=>{const cols=['#1f2a22','#f3e2b0','#4f7a3a','#e98b5a'];I.speckQuad([[-13,6,2.8],[13,6,2.8],[13,6,11.4],[-13,6,11.4]],30,cols,r,1.3,.9,.03);
   I.speckQuad([[13,-6,2.8],[13,6,2.8],[13,6,11.4],[13,-6,11.4]],10,cols,r,1.2,.9,.05);I.speckQuad([[-12.5,-5.8,15.02],[12.5,-5.8,15.02],[12.5,5.8,15.02],[-12.5,5.8,15.02]],10,['#1f2a22','#f3e2b0'],r,1.2,.8);}]);
 }
 const t=top;L.push(['nori band',(I,r)=>{const f=I.box(0,0,2.3,9,12.8,t-2.3+.4,NORI,{skip:'r'});I.speckQuad(f.left,Math.round(t*1.4),NORI_T,r,1.2,.8);I.speckQuad(f.top,8,NORI_T,r,1.2,.8);
  I.line([[-4.5,6.42,t-.1],[4.5,6.42,t-.1]],'#46594e',.6);}]);
 return item(id,v==='double'?9:5,{rx:22,ry:10},L);
}

// ---- Onigiri --------------------------------------------------------------------------------------------------------------
const TRI:P2[]=[[-10,0],[10,0],[13,2.6],[2.6,22.5],[-2.6,22.5],[-13,2.6]];
function onigiri(id:string,f:{col:string;spk:string[];label:string}):FoodLayer[]{
 const leaf:P2[]=[];for(let i=0;i<=12;i++)leaf.push([-21+3.5*i,8.5*Math.sin(Math.PI*i/12)]);for(let i=11;i>0;i--)leaf.push([-21+3.5*i,-8.5*Math.sin(Math.PI*i/12)]);
 const rot=(p:P2):P2=>[p[0]*.96+p[1]*.28,-p[0]*.28+p[1]*.96];
 return item(id,9,{rx:22,ry:9},[
  ['bamboo leaf',(I,r)=>{I.extrude(leaf.map(rot),0,.9,'#5f9e45',{top:'#6aad4d'});const a=rot([-19,0]),b=rot([19,0]);I.line([[a[0],a[1],.95],[b[0],b[1],.95]],'#9fd077',.7);
   for(const s of [-12,-6,0,6,12]){const p=rot([s,0]),q=rot([s+3.5,5.5]),q2=rot([s+3.5,-5.5]);I.line([[p[0],p[1],.95],[q[0],q[1],.95]],'#8cc466',.5);I.line([[p[0],p[1],.95],[q2[0],q2[1],.95]],'#8cc466',.5);}void r;}],
  ['rice triangle',(I,r)=>{I.extrude(TRI,-5,10,RICE,{plane:'xz'});I.speckPoly(TRI,(u,v)=>[u,5.05,v],42,RICE_G,r,1.3,.9);
   I.speckQuad([[13,-5,2.6],[13,5,2.6],[2.6,5,22.5],[2.6,-5,22.5]],14,RICE_R,r,1.2,.9);}],
  ['filling',(I,r)=>{I.fill([[-4.8,5.06,11],[4.8,5.06,11],[5.2,5.06,15],[0,5.06,19.4],[-5.2,5.06,15]],'#d9d1bd');
   I.lathe([0,5,14.6],[0,9.4,14.6],[[0,4.4],[.45,4.1],[.8,2.7],[1,0]],f.col,{segs:9,wobble:{r,amt:.28}});
   I.dots(Array.from({length:9},()=>[(r()-.5)*6,7.6+r()*1.4,12.6+r()*4.4] as V3),f.spk,1.3,1.1);}],
  ['nori sheet',(I,r)=>{const sheet:P2[]=[[-8.5,0],[8.5,0],[8.5,11],[-8.5,11]];I.extrude(sheet,5,.5,NORI,{plane:'xz'});I.speckPoly(sheet,(u,v)=>[u,5.55,v],18,NORI_T,r,1.2,.8);
   for(const v of [3.6,7.4])I.line([[-8.3,5.56,v],[8.3,5.56,v]],'#34453b',.5);}],
  ['film pulled away',(I,r,c)=>{c.save();c.globalAlpha*=.5;I.extrude(TRI.map(([u,v])=>[u*1.08,v*1.07-.4] as P2),5.6,.3,'#dff3ff',{plane:'xz'});c.restore();
   I.extrude([[-1,-.6],[1,-.6],[1,24.6],[-1,24.6]],5.95,.3,'#d8342c',{plane:'xz'});I.extrude([[-2.2,24.4],[2.2,24.4],[0,27.6]],5.95,.3,'#d8342c',{plane:'xz'});
   I.extrude([[4,3.2],[11,3.2],[11,8.2],[4,8.2]],5.95,.25,f.label,{plane:'xz'});I.line([[4.6,6.3,5.7],[10.4,6.3,5.7]].map(([x,,z])=>[x,6.25,z] as V3),'#ffffff',.8);void r;},'pull'],
 ]);
}

// ---- Sandos -----------------------------------------------------------------------------------------------------------------
function sando(id:string,kind:'egg'|'tropical'):FoodLayer[]{
 const BREAD='#fbf3de',BSIDE='#f1dfb8',W=15,fillCol=kind==='egg'?'#ffd966':'#fffaf0';
 const u:P2=[.7071,-.7071],v:P2=[.7071,.7071],Lh=24,Wh=11.5,trayPts:P2[]=[[1,1],[-1,1],[-1,-1],[1,-1]].map(([a,b])=>[u[0]*Lh*a+v[0]*Wh*b,u[1]*Lh*a+v[1]*Wh*b]);
 const tray:Draw=(I)=>{I.extrude(trayPts,0,1.8,'#d8bc8a',{top:'#e8d3a8'});const inner=trayPts.map(([a,b])=>[a*.9,b*.84,1.82] as V3);I.line([...inner,inner[0]],'#cfb07c',.6);};
 const bits=(I:Iso,r:Rng,q:V3[],n:number)=>kind==='egg'?I.speckQuad(q,n,['#fffbe8','#f2c23a','#fff3c4'],r,1.8,1.2,.1):I.speckQuad(q,n,['#ffb52e','#f6e04a','#ff9b2e'],r,2.6,2,.12);
 const half=(I:Iso,r:Rng,ox:number,oy:number)=>{const tri=shift([[-W/2,-W/2],[W/2,-W/2],[-W/2,W/2]],ox,oy),a:V3=[W/2+ox,-W/2+oy,0],b:V3=[-W/2+ox,W/2+oy,0];
  const at=(p:V3,z:number):V3=>[p[0],p[1],z],cutQ=(z0:number,z1:number):V3[]=>[at(a,z0),at(b,z0),at(b,z1),at(a,z1)];
  I.extrude(tri,1.8,3.8,BSIDE,{top:BREAD});I.speckQuad(cutQ(1.8,5.6),7,['#e8d6ad','#fffaf0'],r,1.1,.9);
  I.extrude(tri,5.6,4.6,fillCol);bits(I,r,cutQ(5.6,10.2),kind==='egg'?14:9);
  I.extrude(tri,10.2,3.8,BSIDE,{top:BREAD});I.speckQuad(cutQ(10.2,14),7,['#e8d6ad','#fffaf0'],r,1.1,.9);I.speckPoly(tri,(p,q)=>[p,q,14.02],6,'#efe2c2',r,1.1,.9);};
 const whole=(name:string,z:number):Spec=>[name,(I,r)=>{const f=I.box(0,0,z,W,W,3.8,BSIDE,{top:BREAD});I.speckQuad(f.top,8,'#efe2c2',r,1.1,.9);}];
 const L:Spec[]=[['paper tray',tray],whole('bottom bread',1.8)];
 if(kind==='egg')L.push(['egg salad',(I,r)=>{const f=I.box(0,0,5.6,W-.3,W-.3,4.6,fillCol);bits(I,r,f.left,10);bits(I,r,f.right,5);}]);
 else L.push(['cream',I=>{I.box(0,0,5.6,W-.3,W-.3,4.6,fillCol);}],['mango and pineapple',(I,r)=>{bits(I,r,[[-8,8.4,6],[8,8.4,6],[8,8.4,9.8],[-8,8.4,9.8]],6);bits(I,r,[[8.4,-8,6],[8.4,8,6],[8.4,8,9.8],[8.4,-8,9.8]],4);}]);
 L.push(whole('top bread',10.2),['cut in half',(I,r)=>{tray(I,r,I.c,1);half(I,r,-9.6,7.6);half(I,r,7.8,-9.4);},'replace']);
 return item(id,6,{rx:24,ry:10},L);
}

// ---- Hot counter --------------------------------------------------------------------------------------------------------------
const steamAt=(p:V3,spread=7,height=16):Spec=>['steam',(I,r,c,t)=>{const [x,y]=I.p(p[0],p[1],p[2]);steam(c,x,y,t,spread,height);void r;},'steam'];
function karaage(id:string):FoodLayer[]{
 const pieces:[number,number,number,number][]=[[-5,-5,15.5,7.6],[5,-4,16,7.2],[-4,4.4,16.4,7.4],[5.4,5,15.8,7]];
 return item(id,12,{rx:18,ry:9},[
  ['paper cup',I=>{I.lathe([0,0,0],[0,0,18],[[0,11],[.18,11.6],[.34,12.1],[.74,13.6],[.88,14.1],[1,14.6]],'#f6f1e4',{segs:12,cap:'#b98a4a',colAt:ring=>ring===1||ring===3?'#e0503c':undefined});
   I.lathe([0,0,17.3],[0,0,18.3],[[0,14.9],[1,14.9]],'#fbf8f0',{segs:12,cap:false});}],
  ['karaage',(I,r)=>{for(const [x,y,z,s] of pieces){I.dome(x,y,z,s,s*.92,s*.9,'#c8782c',{segs:7,wobble:{r,amt:.34},shape:[[0,.8],[.3,1],[.72,.78],[1,.28]]});
   I.speckDisc(x,y,z+s*.62,s*.66,s*.6,10,['#eaa651','#8e4d17','#f7cf82'],r,1.2,1.2);}}],
  ['skewer',I=>{I.lathe([2,0,17],[10,-8,35],[[0,.75],[1,.6]],STICK,{segs:4});}],
  ['lemon wedge',(I,r)=>{const wedge:P2[]=Array.from({length:9},(_,i)=>{const a=i/8*Math.PI;return [Math.cos(a)*6-11,Math.sin(a)*6+16] as P2;});
   I.extrude(wedge,4.6,2.4,'#f2c21a',{plane:'xz',top:'#fff27a'});for(let i=1;i<4;i++){const a=i/4*Math.PI;I.line([[-11,7.05,16.3],[Math.cos(a)*5.2-11,7.05,Math.sin(a)*5.2+16]],'#f3d23a',.6);}void r;}],
 ]);
}
function nikuman(id:string):FoodLayer[]{
 return item(id,6,{rx:24,ry:12},[
  ['bamboo steamer',I=>{I.lathe([0,0,0],[0,0,8],[[0,19],[.66,19],[.68,19.6],[1,19.6]],'#d9b27a',{segs:16,cap:'#c49a5e'});for(const z of [2.2,4.4])I.line(arc(0,0,19.1,z),'#b8894e',.7);
   for(let k=-3;k<=3;k++){const y=k*5,w=Math.sqrt(Math.max(0,19.2*19.2-y*y));I.line([[-w,y,8.05],[w,y,8.05]],'#b08045',.6);}}],
  ['paper square',I=>{I.box(0,0,8,25,25,.5,'#fbf6ea',{top:'#fdfaf1'});}],
  ['fluffy bun',(I,r)=>{I.dome(-3,-3,8.5,11,11,11.5,'#f8f2e4',{segs:14,shape:BUN});I.speckDisc(-3,-3,15,8,8,6,'#ffffff',r,1.1,1.1);}],
  ['pleated top',I=>{const apex:V3=[-3,-3,19.8];for(let s=0;s<14;s++){const a=Math.PI/4-Math.PI/14+s*TAU/14;if(Math.cos(a)+Math.sin(a)<-.5)continue;
    const e:V3=[-3+Math.cos(a)*9.2,-3+Math.sin(a)*9.2,13.4],m=lerp3(apex,e,.5);m[0]+=Math.cos(a+1.2)*1.1;m[1]+=Math.sin(a+1.2)*1.1;I.line([apex,m,e],'#ddd0b4',.8);}
   I.dome(-3,-3,19,2.2,2.2,1.9,'#ece2cc',{segs:6});}],
  ['broken open',(I,r)=>halfCut(I,r,9,8,8.5,8.4,9,'#f8f2e4','#8a4b2e',['#a8653e','#5e2f1c','#6a9a3a'])],
  steamAt([-3,-3,23],6,15),
 ]);
}
function oden(id:string):FoodLayer[]{
 return item(id,12,{rx:18,ry:9},[
  ['broth cup',(I,r,c)=>{I.lathe([0,0,0],[0,0,14],[[0,11],[.55,12.2],[.62,12.4],[.72,12.7],[1,13.5]],'#f3efe6',{segs:14,cap:'#d9a25a',colAt:ring=>ring===1||ring===2?'#2f8f8a':undefined});
   I.lathe([0,0,13.4],[0,0,14.3],[[0,13.9],[1,13.9]],'#fbf9f3',{segs:14,cap:false});I.speckDisc(0,0,14,11,11,10,['#f6d58f','#b8793a'],r,1.3,1);const [sx,sy]=I.p(4,-6,14);sheen(c,sx,sy,4);}],
  ['fish cake skewer',(I,r)=>{I.lathe([-2,-8,9],[1,-12,32],[[0,.7],[1,.6]],STICK,{segs:4});
   const tri:P2[]=[[-4.6,0],[4.6,0],[0,7.4]];I.extrude(shift(tri,-1.2,13.5),-10.8,2.2,'#8f8a84',{plane:'xz'});I.speckPoly(shift(tri,-1.2,13.5),(u,v)=>[u,-8.55,v],10,['#5d5955','#b1aca5'],r,1,1);
   I.lathe([-5.2,-10.2,24],[5.6,-11.4,25.2],[[0,2.8],[1,2.8]],'#e4bb80',{segs:8,colAt:(ring,seg)=>seg>=3&&seg<=6?'#b8773e':undefined});
   const [ex,ey]=I.p(5.7,-11.4,25.2);I.c.fillStyle='#8a5a2a';I.c.beginPath();I.c.ellipse(ex+.4,ey,1.4,1.2,0,0,TAU);I.c.fill();}],
  ['daikon radish',(I,r)=>{I.lathe([-5,4,11.2],[-5,4,17],[[0,6.2],[1,6.2]],'#f3e3bf',{segs:9,cap:'#e7c98c'});I.line([[-8,2,17.05],[-2,6,17.05]],'#d2ab69',.6);I.line([[-8,6,17.05],[-2,2,17.05]],'#d2ab69',.6);void r;}],
  ['boiled egg',(I,r,c)=>{I.dome(5,-1,10.6,5,4.5,9,'#dcb57e',{segs:9,shape:[[0,.7],[.25,.98],[.55,.95],[.85,.6],[1,0]]});const [sx,sy]=I.p(3.5,-1,17);sheen(c,sx,sy,2.2);void r;}],
  ['karashi mustard',I=>{I.dome(11.6,3,13.9,2.1,1.7,1.5,'#e8b923',{segs:6});}],
  steamAt([0,0,17],7,14),
 ]);
}
function yakiimo(id:string):FoodLayer[]{
 const A:V3=[-9,4,6],B:V3=[12,-7,19],ax=(():V3=>{const d:V3=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(...d);return [d[0]/l,d[1]/l,d[2]/l];})();
 const side=((): V3=>{const s:V3=[ax[1],-ax[0],0],l=Math.hypot(...s);return [s[0]/l,s[1]/l,0];})(),up:V3=[side[1]*ax[2]-0*ax[1],0*ax[0]-side[0]*ax[2],side[0]*ax[1]-side[1]*ax[0]];
 const upv:V3=up[2]<0?[-up[0],-up[1],-up[2]]:up;
 const prof:[number,number][]=[[0,2.2],[.12,5.2],[.35,6.8],[.65,6.6],[.88,4.6],[1,1.6]];
 const rad=(t:number)=>{for(let i=0;i<prof.length-1;i++)if(t<=prof[i+1][0]){const k=(t-prof[i][0])/(prof[i+1][0]-prof[i][0]);return prof[i][1]+(prof[i+1][1]-prof[i][1])*k;}return prof[prof.length-1][1];};
 const on=(t:number,s:number,out=.93):V3=>{const c=lerp3(A,B,t),R=rad(t);return [c[0]+upv[0]*R*out+side[0]*R*s,c[1]+upv[1]*R*out+side[1]*R*s,c[2]+upv[2]*R*out+side[2]*R*s];};
 const opening=(k:number):V3[]=>{const pts:V3[]=[];for(let i=0;i<=8;i++){const t=.2+.62*i/8;pts.push(on(t,.55*k*Math.sin(Math.PI*i/8)));}for(let i=8;i>=0;i--){const t=.2+.62*i/8;pts.push(on(t,-.55*k*Math.sin(Math.PI*i/8)));}return pts;};
 const walls={back:[[[-8,-6,0],[8,-6,0],[8,-6,15],[-8,-6,15]],[[-8,-6,0],[-8,6,0],[-8,6,15],[-8,-6,15]]] as V3[][]};
 return item(id,10,{rx:19,ry:10},[
  ['paper bag',(I,r)=>{I.face(walls.back[0],KRAFT,-.16);I.face(walls.back[1],KRAFT,-.34);I.speckQuad(walls.back[0],5,'#c69c62',r,1.1,1);}],
  ['sweet potato',(I,r)=>{const res=I.lathe(A,B,prof,'#7b3868',{segs:9,wobble:{r,amt:.12}});for(const f of res.faces){const n=f.n!;if(n[0]+n[1]+n[2]>.3&&r()<.6)I.speckQuad(f.pts,1,['#5a2450','#9a4f86'],r,1.1,.9,.2);}}],
  ['split open',(I,r,c)=>{I.fill(opening(1.12),'#4e1d45');I.fill(opening(1),'#ffc23d');I.fill(opening(.55),'#ffdf85');
   I.dots(Array.from({length:10},()=>on(.24+r()*.54,(r()-.5)*.7,.96)),['#ffe9a8','#e89b1f'],1.2,1.1);const [sx,sy]=I.p(...on(.5,.1,.97));sheen(c,sx-2,sy,3,'rgba(255,255,255,.7)');}],
  ['bag front',(I,r)=>{const L:V3[]=[[-8,6,0],[8,6,0],[8,6,15],[-8,6,15]],R:V3[]=[[8,-6,0],[8,6,0],[8,6,15],[8,-6,15]];I.face(L,KRAFT,0);I.face(R,KRAFT,-.24);
   I.box(0,0,12.6,16.6,12.6,2.6,tone(KRAFT,-.08),{skip:'t'});I.line([[-8.3,-6.3,15.2],[8.3,-6.3,15.2],[8.3,6.3,15.2],[-8.3,6.3,15.2],[-8.3,-6.3,15.2]],'#c89b5e',.6);
   I.speckQuad(L,6,'#c69c62',r,1.1,1);I.text('やきいも',[0,6.25,6.6],'left',4.1,'#b8322a',14,'800');}],
  steamAt([2,-2,25],6,14),
 ]);
}
function cupnoodles(id:string):FoodLayer[]{
 const CUP:[number,number][]=[[0,10.5],[.3,11.5],[.33,11.6],[.62,12.9],[.65,13],[.7,13.2],[.94,14.1],[.96,14.8],[1,14.8]];
 const band=(ring:number)=>ring===1||ring===3?'#ffd35c':ring===2?'#f07a5f':undefined,disc=(r:number,z:number):V3[]=>ngon(r,16).map(([x,y])=>[x,y,z] as V3);
 return item(id,12,{rx:17,ry:9},[
  ['cup',(I,r,c)=>{I.lathe([0,0,0],[0,0,22],CUP,'#fbfaf5',{segs:16,cap:'#e6dcc4',colAt:band});I.dots(arc(0,0,12.4,10.4,12.4,-35,125,20),'#ffffff',1.4,1.4);I.dots(arc(0,0,12.1,8.6,12.1,-25,115,20),'#ffffff',1.4,1.4);
   I.text('NOODLE',[9.2,9.2,15.1],'front',3.4,'#f07a5f',16,'900');const [sx,sy]=I.p(-9,10,6);sheen(c,sx,sy,2.5);void r;}],
  ['noodle block',(I,r)=>{I.fill(disc(13.9,21.2),'#f0d58a');for(let k=-4;k<=4;k++){const y=k*2.8,w=Math.sqrt(Math.max(0,12.8*12.8-y*y));const pts:V3[]=[];for(let x=-w;x<=w;x+=1.6)pts.push([x,y+Math.sin(x*1.3+k)*.7,21.25]);if(pts.length>1)I.line(pts,'#d6ae55',.7);}void r;}],
  ['egg, shrimp and green onion',(I,r)=>{for(const [x,y] of [[-6,-4],[-2.5,-7],[-7,1]] as const)I.box(x,y,21.3,3,3,1.6,EGG);for(const [x,y] of [[5,-4],[1,4]] as const)I.line(arc(x,y,2.2,22.2,2.2,-60,200,40),'#ff8a6a',1.7);
   I.dots([[5.5,-6,22.4],[2,2,22.4]],'#ffffff',1,1);I.box(6,4,21.3,2.4,2.4,1.4,'#8a5a3a');I.dots(Array.from({length:10},()=>[(r()-.5)*20,(r()-.5)*20,21.5] as V3).filter(p=>Math.hypot(p[0],p[1])<12),['#5cb85c','#a6e08a'],1.6,1.3);}],
  ['lid peeled back',I=>{I.extrude(ngon(14.9,16),22,.5,'#efe9da',{top:'#f4efe3'});I.fill(disc(6,22.55),'#f07a5f');I.box(13.5,6,22,4,3,.5,'#f07a5f');},'pull'],
  ['hot water from the dispenser',(I,r,c,t)=>{const [x,y]=I.p(0,0,22);c.fillStyle='rgba(150,205,240,.85)';c.fillRect(x-1.6,y-26,3.2,26*t);c.fillStyle='rgba(255,255,255,.8)';c.fillRect(x-.6,y-26,1,26*t);void r;},'pour'],
  ['broth',(I,r,c)=>{I.fill(disc(13.2,21.55),'rgba(214,160,80,.42)');I.speckDisc(0,0,21.6,11,11,8,'rgba(255,236,170,.9)',r,1.2,1);const [sx,sy]=I.p(-4,-6,21.6);sheen(c,sx,sy,4);}],
  ['lid folded back',I=>{const a1=200*Math.PI/180,a2=250*Math.PI/180,p1:V3=[Math.cos(a1)*14.8,Math.sin(a1)*14.8,22.2],p2:V3=[Math.cos(a2)*14.8,Math.sin(a2)*14.8,22.2];
   const q1:V3=[p1[0]-2.6,p1[1]-2.6,30],q2:V3=[p2[0]-2.6,p2[1]-2.6,30];I.face([p1,p2,q2,q1],'#efe9da',.06);I.line([lerp3(p1,q1,.55),lerp3(p2,q2,.55)],'#f07a5f',2);I.line([lerp3(p1,q1,.75),lerp3(p2,q2,.75)],'#ffd35c',1);}],
  steamAt([3,3,22],7,14),
 ]);
}

// ---- Bento ----------------------------------------------------------------------------------------------------------------
function bento(id:string,kind:'island'|'locomoco'):FoodLayer[]{
 const Z=3.2;
 const nuggets=(I:Iso,r:Rng,list:[number,number][],col:string)=>{for(const [x,y] of list){I.dome(x,y,Z,3.6,3.3,3.6,col,{segs:7,wobble:{r,amt:.3},shape:[[0,.8],[.3,1],[.72,.78],[1,.3]]});I.speckDisc(x,y,Z+2.6,2.4,2.2,4,['#f5d6a0','#6a3414'],r,1,1);}};
 const L:Spec[]=[
  ['bento box',(I,r)=>{I.box(0,0,0,38,28,Z,'#2b2b31',{top:'#3a3a42'});I.line([[-18.2,-13.2,Z+.02],[18.2,-13.2,Z+.02],[18.2,13.2,Z+.02],[-18.2,13.2,Z+.02],[-18.2,-13.2,Z+.02]],'#55555e',.8);I.dots([[-15,14.05,1.6],[-11,14.05,1.6]],'rgba(255,255,255,.35)',2.4,.6);void r;}],
  ['rice',(I,r)=>{const w=kind==='island'?16:20,cx=-17.4+w/2,f=I.box(cx,0,Z,w,25.6,4.6,RICE);I.speckQuad(f.top,26,RICE_G,r,1.3,.9);I.speckQuad(f.left,10,RICE_G,r,1.3,.9);
   if(kind==='island'){I.dome(cx,0,Z+4.6,2.3,2.3,2,'#c2334d',{segs:7});I.speckQuad([[cx-6,-11,Z+4.62],[cx+6,-11,Z+4.62],[cx+6,-4,Z+4.62],[cx-6,-4,Z+4.62]],8,'#1f2a22',r,1,.8);}}],
 ];
 const baran:Draw=(I,r)=>{const x=kind==='island'?-.6:3.4,zig:P2[]=[[-12.6,0],[12.6,0],[12.6,Z+5]];for(let i=0;i<=12;i++)zig.push([12.6-i*2.1,Z+(i%2?7.4:5.4)]);I.extrude(zig,x-.3,.6,'#3fa34d',{plane:'yz'});void r;};
 if(kind==='island')L.push(
  ['chicken',(I,r,c)=>{baran(I,r,c,1);nuggets(I,r,[[5,-8],[11.5,-8.4],[8,-3.6],[14.6,-3.4]],'#b8642a');const [sx,sy]=I.p(5,-9,Z+3.5);sheen(c,sx,sy,2);}],
  ['vegetables',(I,r)=>{for(const [x,y] of [[3.6,4.2],[5.4,9]] as const){I.lathe([x,y,Z],[x,y,Z+2],[[0,.7],[1,.7]],'#8cc466',{segs:4});I.dome(x,y,Z+1.8,3,2.8,3.4,'#4f9a3a',{segs:7,wobble:{r,amt:.25}});I.speckDisc(x,y,Z+4.6,2.2,2,5,['#6fbf4f','#2f6b2a'],r,1,1);}
   for(const [x,y] of [[9.6,10.4],[9.2,6.8]] as const)I.lathe([x,y,Z],[x,y,Z+1.6],[[0,2.1],[1,2.1]],'#f08a2a',{segs:7,cap:'#ffa24a'});}],
  ['rolled egg',(I,r)=>{for(const x of [13.2,16.4]){const f=I.box(x,5.8,Z,3.2,11,4.6,EGG,{right:'#f5c33b'});void f;}I.line([[11.6,11.32,Z+1.2],[14.8,11.32,Z+1.2]],'#eeb22a',.6);I.line([[11.6,11.32,Z+2.7],[14.8,11.32,Z+2.7]],'#eeb22a',.6);I.speckQuad([[11.6,.3,Z+4.62],[18,.3,Z+4.62],[18,11.3,Z+4.62],[11.6,11.3,Z+4.62]],8,['#f0b52a','#ffe58a'],r,1.2,1);}],
 );
 else L.push(
  ['patty',(I,r)=>{I.extrude(ngon(7,12,1,1,-7.4,0),Z+4.6,2.6,'#6a3a24',{top:'#7a4629'});I.speckDisc(-7.4,0,Z+7.25,5,5,10,['#4a2616','#9a6038'],r,1.2,1);}],
  ['gravy',(I,r,c)=>{const pts:V3[]=ngon(5.8,10,1,1,-7.8,.4).map(([x,y],i)=>[x+(i%3-1)*.6,y,Z+7.3] as V3);I.fill(pts,'#7a4524');I.line([[-7.8,6.2,Z+7.2],[-7.4,6.9,Z+4.8]],'#7a4524',1.5);I.line([[-2,1,Z+7.1],[-1.4,1.8,Z+5]],'#7a4524',1.3);const [sx,sy]=I.p(-9,-2,Z+7.3);sheen(c,sx,sy,3);void r;}],
  ['fried egg',(I,r)=>{const white:P2[]=ngon(5.2,11,1,1,-8.6,-1.4).map(([x,y],i)=>[x+(i%2?.9:-.4),y+(i%3?.5:-.5)] as P2);I.extrude(white,Z+7.4,.8,'#fbfaf2');I.dome(-8.2,-1.2,Z+8.2,2.2,2.1,1.9,'#ffb72e',{segs:8});void r;}],
  ['salad',(I,r,c)=>{baran(I,r,c,1);for(const [x,y] of [[7,-8],[12.6,-7],[16,-2.4],[8.4,-2.2],[11.6,3.6],[7.2,8.6],[15.4,8.6]] as const){I.dome(x,y,Z,4,3.6,3.6,'#7cc04a',{segs:7,wobble:{r,amt:.35}});I.speckDisc(x,y,Z+3,3,2.6,4,['#a8dc6a','#4f8f32'],r,1.1,1);}
   for(const [x,y] of [[10.6,-3.4],[13.2,6.2]] as const){I.dome(x,y,Z+2,2.3,2.2,2.4,'#e43b4b',{segs:8});const [sx,sy]=I.p(x-.8,y-.8,Z+4.2);sheen(c,sx,sy,1.4);}
   I.dots(Array.from({length:6},()=>[6+r()*10,-6+r()*14,Z+3.8] as V3),'#ffd34d',1.2,1.2);}],
 );
 L.push(['chopsticks',I=>{I.box(0,16.6,0,34,1.1,1.1,'#e2c48f');I.box(0,18.2,0,34,1.1,1.1,'#d9b87c');I.box(-7,17.4,0,9,3.6,1.5,'#d8342c');I.line([[-11.4,19.25,.8],[-2.6,19.25,.8]],'#ffffff',.7);}],
  ['clear lid lifted',(I,r,c)=>{c.save();c.globalAlpha*=.42;I.box(0,0,Z,38.6,28.6,5.2,'#dcefff');c.restore();I.line([[-19.3,14.3,Z+5.2],[19.3,14.3,Z+5.2],[19.3,-14.3,Z+5.2]],'rgba(255,255,255,.95)',.8);const [sx,sy]=I.p(-12,-8,Z+5.2);sheen(c,sx,sy,6);void r;},'pull']);
 return item(id,3,{rx:27,ry:13},L);
}

// ---- Sweets -------------------------------------------------------------------------------------------------------------------
function melonpan(id:string):FoodLayer[]{
 const R=15.6,z0=3.2,H=9.6,surf=(x:number,y:number)=>z0+H*Math.sqrt(Math.max(0,1-(x*x+y*y)/(R*R)));
 return item(id,1,{rx:21,ry:11},[
  ['paper square',I=>{I.box(0,0,0,33,33,.7,'#eee0c4',{top:'#f6ecd8'});}],
  ['bun',I=>{I.dome(0,0,.7,15,15,12,'#e0a647',{segs:16,shape:[[0,.88],[.12,1],[.4,.94],[.7,.7],[.9,.36],[1,0]]});}],
  ['cookie top',(I,r)=>{I.dome(0,0,z0,R,R,H,'#f6d57a',{segs:16,shape:[[0,.98],[.2,.96],[.5,.8],[.8,.48],[1,0]]});I.speckDisc(0,0,z0,R*.8,R*.8,14,'#e6b44e',r,1.1,1,d=>H*Math.sqrt(1-d*d*.8));}],
  ['melon grid',I=>{const vis=(x:number,y:number)=>{const z=surf(x,y)-z0;return x/(R*R)+y/(R*R)+z/(H*H)>0;};
   for(let k=-3;k<=3;k++)for(const along of [0,1]){let seg:V3[]=[];for(let s=-R;s<=R;s+=1.1){const x=along?k*4.3:s,y=along?s:k*4.3;const ok=x*x+y*y<(R*.92)**2&&vis(x,y);
    if(ok)seg.push([x,y,surf(x,y)+.12]);else{if(seg.length>1)I.line(seg,'#d69e3c',.9);seg=[];}}if(seg.length>1)I.line(seg,'#d69e3c',.9);}}],
  ['sugar sparkle',(I,r)=>{I.speckDisc(0,0,z0,R*.85,R*.85,26,['#fffbe8','#ffffff','#fff0c0'],r,1.1,1.1,d=>H*Math.sqrt(Math.max(0,1-d*d*.85)));}],
 ]);
}
function daifuku(id:string):FoodLayer[]{
 return item(id,2,{rx:25,ry:12},[
  ['slate plate',(I,r)=>{const f=I.box(0,0,0,40,30,3,'#3b4046',{top:'#474d54'});I.speckQuad(f.top,26,['#586068','#30353a'],r,1.2,1.2);I.speckQuad(f.left,8,'#30353a',r,1.2,1);}],
  ['white mochi',(I,r)=>{I.dome(-8,-5,3,9,8.5,9,'#fbf5f3',{segs:12,shape:MOCHI});void r;}],
  ['pink mochi',(I,r)=>{I.dome(9,-3,3,8.5,8,8.5,'#f6bfcd',{segs:12,shape:MOCHI});void r;}],
  ['red bean peek',(I,r)=>halfCut(I,r,0,8,3,8.2,7.6,'#fbf5f3','#6b2433',['#8a3344','#4e1826','#a24a5a'])],
  ['rice-flour dusting',(I,r)=>{I.speckDisc(-8,-5,3,6,5.5,14,'#ffffff',r,1,1,d=>9*Math.sqrt(Math.max(0,1-d*d)));I.speckDisc(9,-3,3,5.6,5.2,12,'#ffffff',r,1,1,d=>8.5*Math.sqrt(Math.max(0,1-d*d)));
   I.speckQuad([[-19,-14,3.02],[19,-14,3.02],[19,14,3.02],[-19,14,3.02]],14,'#e9e6e0',r,1,1);}],
 ]);
}
function mangomochi(id:string):FoodLayer[]{
 return item(id,4,{rx:22,ry:11},[
  ['paper liner',I=>{I.lathe([0,0,0],[0,0,4.5],[[0,14.5],[1,17]],'#fdfaf2',{segs:18,cap:'#f3ecdc',colAt:(ring,seg)=>seg%2?'#ebe2cf':undefined});}],
  ['mochi',(I,r)=>{I.dome(-3,-4,4,12.5,12,12.5,'#fff1da',{segs:12,shape:MOCHI});I.speckDisc(-3,-4,12,6,6,7,'#ffd9a0',r,1.4,1.2);}],
  ['mango inside',(I,r)=>halfCut(I,r,8.5,7.5,4,8.6,8.6,'#fff1da','#ffb52e',['#ffd06a','#f59a1a','#fff0c0'])],
  ['dusting',(I,r)=>{I.speckDisc(-3,-4,4,8.5,8,18,'#ffffff',r,1,1,d=>12.5*Math.sqrt(Math.max(0,1-d*d)));}],
 ]);
}
function malasada(id:string):FoodLayer[]{
 const balls:[number,number,number,number][]=[[-7,-3,10,9.2],[8,3,9.4,8.8]];
 const shape:[number,number][]=[[0,.8],[.15,.97],[.3,1],[.5,.93],[.78,.62],[1,0]];
 return item(id,2,{rx:24,ry:12},[
  ['paper boat',I=>{I.box(0,0,0,36,24,4,KRAFT,{top:'#fbf7ee'});for(let i=0;i<9;i++)for(let j=0;j<6;j++)if((i+j)%2){const x=-18+i*4,y=-12+j*4;I.fill([[x,y,4.02],[x+4,y,4.02],[x+4,y+4,4.02],[x,y+4,4.02]],'#e24a3b');}}],
  ['dough ball',I=>{for(const [x,y,r,h] of balls)I.dome(x,y,4,r,r,h,'#f3dfb0',{segs:12,shape});}],
  ['fried golden',I=>{for(const [x,y,r,h] of balls)I.dome(x,y,4,r,r,h,'#d98f35',{segs:12,shape,colAt:ring=>ring===1?'#f3d9a2':undefined});}],
  ['sugar coat',(I,r)=>{for(const [x,y,R,h] of balls)I.speckDisc(x,y,4,R*.85,R*.85,34,['#ffffff','#f5efe2','#fffdf5'],r,1.1,1.1,d=>h*Math.sqrt(Math.max(0,1-d*d*.9)));}],
 ]);
}
/** A pancake outline, optionally with a bite (two scalloped tooth arcs) taken from its front-right edge. */
function biteOutline(R:number,bitten:boolean):{pts:P2[];bite:number}{
 if(!bitten)return {pts:ngon(R,20),bite:-1};
 const th=-8*Math.PI/180,b=6.2,d=R+2.3,cb:P2=[Math.cos(th)*d,Math.sin(th)*d],phi=Math.acos((R*R+d*d-b*b)/(2*R*d)),pts:P2[]=[];
 for(let i=0;i<=18;i++){const a=th+phi+(TAU-2*phi)*i/18;pts.push([Math.cos(a)*R,Math.sin(a)*R]);}
 const p1=pts[pts.length-1],p2=pts[0],a1=Math.atan2(p1[1]-cb[1],p1[0]-cb[0]);let a2=Math.atan2(p2[1]-cb[1],p2[0]-cb[0]);while(a2<a1)a2+=TAU;
 const via=th+Math.PI;let v=via;while(v<a1)v+=TAU;const cw=v>a2;
 const start=pts.length;for(let i=1;i<10;i++){const k=i/10,a=cw?a1-(TAU-(a2-a1))*k:a1+(a2-a1)*k,rr=b*(1+.07*Math.sin(k*Math.PI*3));pts.push([cb[0]+Math.cos(a)*rr,cb[1]+Math.sin(a)*rr]);}
 return {pts,bite:start-1};
}
function dorayaki(id:string):FoodLayer[]{
 const PALE='#f0c77a',CRUMB='#f7dfa0',BEAN='#5e1f2c';
 const board:Draw=(I,r)=>{const f=I.box(0,0,0,40,28,3,'#c9955a',{top:'#d8a86c'});for(const y of [-9,-2,6])I.line([[-19,y,3.02],[-6,y+.8,3.02],[8,y-.4,3.02],[19,y+.4,3.02]],'#bf8a4e',.6);I.speckQuad(f.left,5,'#b07a42',r,1.4,.8);};
 const pancake=(I:Iso,bitten:boolean,z:number,h:number,top:string)=>{const o=biteOutline(14.5,bitten);I.extrude(o.pts,z,h,PALE,{top,side:i=>o.bite>=0&&i>=o.bite?CRUMB:undefined});};
 const filling=(I:Iso,r:Rng,bitten:boolean)=>{const o=biteOutline(13.3,bitten);I.extrude(o.pts,6.2,2.4,BEAN);I.dots(arc(0,0,13.4,7.4,13.4,-30,120,12),['#7a2e3a','#4a1522'],1.3,1.2);void r;};
 const topCake=(I:Iso,r:Rng,c:C,bitten:boolean)=>{pancake(I,bitten,8.6,3.4,'#a85a22');I.fill(ngon(9.6,16).map(([x,y])=>[x,y,12.04] as V3),'#bd7430');I.fill(ngon(5.6,14).map(([x,y])=>[x-1,y-1,12.06] as V3),'#c98540');
  const [sx,sy]=I.p(-4,-5,12.1);sheen(c,sx,sy,4,'rgba(255,255,255,.55)');I.speckDisc(0,0,12.06,11,11,8,'#8f4a1a',r,1.1,1);};
 return item(id,3,{rx:25,ry:12},[
  ['wooden board',board],
  ['bottom pancake',I=>pancake(I,false,3,3.2,PALE)],
  ['red bean filling',(I,r)=>filling(I,r,false)],
  ['top pancake',(I,r,c)=>topCake(I,r,c,false)],
  ['a big bite',(I,r,c)=>{board(I,r,c,1);pancake(I,true,3,3.2,PALE);filling(I,r,true);topCake(I,r,c,true);I.dots([[20.5,-1,3.05],[19,4,3.05],[22,3,3.05],[18,-4,3.05]],['#e9c27a','#5e1f2c'],1.3,1.1);},'replace'],
 ]);
}

// ---- Drinks (the same iso bottles, cartons and cans as the outdoor drink machines, lib/graphics/drinkArt.ts) ------------
export const KONBINI_DRINK_ART:Record<string,DrinkArt>={
 'drink-water':{shape:'bottle',body:'#c9ecfa',label:'#2f8f8a',ink:'#fff6dc',cap:'#2f8f8a',word:'WATER'},
 'drink-greentea':{shape:'bottle',body:'#9ccb72',label:'#fff6dc',ink:'#2f6b2a',cap:'#3d7a3a',word:'TEA'},
 'drink-sports':{shape:'bottle',body:'#c6e9f7',label:'#1f6fb2',ink:'#ffffff',cap:'#ffffff',word:'SPORT'},
 'drink-milk':{shape:'carton',body:'#fbfbf6',label:'#5fb8f2',ink:'#ffffff',cap:'#5fb8f2',word:'MILK'},
 'drink-pineapple':{shape:'carton',body:'#ffe28a',label:'#2f8f8a',ink:'#fff6dc',cap:'#f07a5f',word:'PINE'},
 'drink-coconut':{shape:'tallcan',body:'#e9f4ef',label:'#6b4a2e',ink:'#fbfaf5',cap:'#c9ced4',word:'COCO'},
};
/** Where a drink stands in its 64-unit cell (base and height), shared with the reveal and the atlas. */
export const DRINK_BASE=27;export const drinkHeight=(a:DrinkArt)=>a.shape==='can'?56:50;
function drinkItem(id:string,a:DrinkArt):FoodLayer[]{const s=drinkShadow(a,drinkHeight(a));FOOD_SHADOW[id]={rx:s.rx,ry:s.ry,dy:DRINK_BASE+s.dy};return drinkRevealLayers(a);}

export const FOOD_LAYERS:Record<string,FoodLayer[]>={
 'musubi-classic':musubi('musubi-classic','classic'),'musubi-tamago':musubi('musubi-tamago','tamago'),'musubi-furikake':musubi('musubi-furikake','furikake'),
 'musubi-teriyaki':musubi('musubi-teriyaki','teriyaki'),'musubi-katsu':musubi('musubi-katsu','katsu'),'musubi-double':musubi('musubi-double','double'),
 'onigiri-salmon':onigiri('onigiri-salmon',{col:'#f08a5d',spk:['#ffb08a','#d86a3f','#fff0e6'],label:'#f08a5d'}),
 'onigiri-tuna':onigiri('onigiri-tuna',{col:'#f1e2b8',spk:['#d9c48f','#fffaf0','#c8b07a'],label:'#2f8f8a'}),
 'onigiri-ume':onigiri('onigiri-ume',{col:'#c2334d',spk:['#e0566b','#8f1f33','#f07a8a'],label:'#c2334d'}),
 'onigiri-kombu':onigiri('onigiri-kombu',{col:'#3d4a2a',spk:['#5a6a3a','#26301a','#f3e2b0'],label:'#3d7a3a'}),
 'sando-tamago':sando('sando-tamago','egg'),'sando-tropical':sando('sando-tropical','tropical'),
 'hot-karaage':karaage('hot-karaage'),'hot-nikuman':nikuman('hot-nikuman'),'hot-oden':oden('hot-oden'),'hot-yakiimo':yakiimo('hot-yakiimo'),'hot-cupnoodles':cupnoodles('hot-cupnoodles'),
 'bento-small':bento('bento-small','island'),'bento-locomoco':bento('bento-locomoco','locomoco'),
 'sweet-melonpan':melonpan('sweet-melonpan'),'sweet-daifuku':daifuku('sweet-daifuku'),'sweet-mangomochi':mangomochi('sweet-mangomochi'),'sweet-malasada':malasada('sweet-malasada'),'sweet-dorayaki':dorayaki('sweet-dorayaki'),
 ...Object.fromEntries(Object.entries(KONBINI_DRINK_ART).map(([id,a])=>[id,drinkItem(id,a)])),
};
/** Visible layers of the finished item (pulled films/lids and the pour are gone; a `replace` layer hides what came before). */
export function finishedLayers(id:string,effects=true):FoodLayer[]{
 const all=FOOD_LAYERS[id]??[];let start=0;all.forEach((l,i)=>{if(l.kind==='replace')start=i;});
 return all.slice(start).filter(l=>l.kind!=='pull'&&l.kind!=='pour'&&(effects||l.kind!=='steam'));
}
export const foodShadow=(id:string):FoodShadow=>FOOD_SHADOW[id]??{rx:18,ry:8,dy:10};
/** The soft cast shadow under an item (the reveal fades it in with the first layer). */
export function drawFoodShadow(c:C,id:string,x:number,y:number,alpha=1){const s=foodShadow(id);softShadow(c,x,y+s.dy,s.rx,s.ry,alpha);}
/** The finished item with its shadow. Steam (`effects`) is left off the shelf and tiles, kept on posters and the reveal. */
export function drawFood(c:C,id:string,x:number,y:number,effects=false){drawFoodShadow(c,id,x,y);for(const l of finishedLayers(id,effects))l.draw(c,x,y,1);}
/** Checked by tests/konbini.cjs: every menu item has a complete, named layer sequence ending in a drawable finish. */
export function layerAudit(){return FOOD_MENU.map(f=>{const L=FOOD_LAYERS[f.id]??[];return {id:f.id,layers:L.length,names:L.map(l=>l.name),finished:finishedLayers(f.id).length,shadow:!!FOOD_SHADOW[f.id]};});}
/** STABLE API: add reveal layers for another consumable (e.g. a drink machine's bottle → label → cap → condensation). */
export function registerFoodLayers(id:string,layers:FoodLayer[],shadow?:FoodShadow){if(!FOOD_LAYERS[id]&&layers.length){FOOD_LAYERS[id]=layers;if(shadow)FOOD_SHADOW[id]=shadow;}}
/** A drink machine drink's shadow in the same cell space as its reveal layers. */
export function drinkCellShadow(a:DrinkArt):FoodShadow{const s=drinkShadow(a,drinkHeight(a));return {rx:s.rx,ry:s.ry,dy:DRINK_BASE+s.dy};}

// ---- Cached bitmaps (collection tiles, silhouettes, the pouch) --------------------------------------------------------------
const bitmaps=new Map<string,HTMLCanvasElement>();
/** Max cached tiles: 48 × (96 css px × dpr 2)² × 4 B ≈ 7 MB worst case, usually far less (tiles are 64–96 px). */
export const FOOD_BITMAP_CACHE=48;
/**
 * The finished art painted ONCE into a canvas of `px` device pixels (a small LRU cache), so tiles and silhouettes blit a
 * bitmap instead of re-running the painter on every mount. Browser only.
 */
export function foodBitmap(id:string,px:number):HTMLCanvasElement|null{
 if(!FOOD_LAYERS[id]||typeof document==='undefined')return null;const key=`${id}@${px}`,hit=bitmaps.get(key);
 if(hit){bitmaps.delete(key);bitmaps.set(key,hit);return hit;}
 const cv=document.createElement('canvas');cv.width=cv.height=px;const c=cv.getContext('2d');if(!c)return null;c.scale(px/64,px/64);drawFood(c,id,32,34);
 bitmaps.set(key,cv);while(bitmaps.size>FOOD_BITMAP_CACHE){const first=bitmaps.keys().next().value as string;bitmaps.delete(first);}return cv;
}

// The drink machines' drinks (lib/town/drinkMachines.ts) get their reveal layers here, wherever this module loads (the Backpack pouch,
// the Konbini Collection). Lazy-load pass, Oct 7 2026: drinkMachines.ts used to import this module to register them, which put all
// of the Konbini food art in the island's boot bundle.
for(const d of DRINKS)registerFoodLayers(d.id,drinkRevealLayers(d.art),drinkCellShadow(d.art));
