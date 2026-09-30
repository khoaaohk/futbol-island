import type {Drink,DrinkArt} from '../town/drinkMachines';
import type {FaceRect} from './vendingFaceLayout';
import {Iso,rng,tone,type V3} from '../konbini/isoArt';

/**
 * Drink machine art (Sep 29 2026; lib/town/drinkMachines.ts). Generic, original packages only: plain bottles, cans, a tall can
 * and a small carton with a coloured label band and one short word. No real brands, logos or trade dress.
 *
 * Shared by three places, all painted ONCE (no loops):
 * - the far machine: `drawDrinkTile` paints the drink machine's glass into the shared vending atlas (lib/graphics/vendingMachines.ts);
 * - the close-up face and the pouch: components/DrinkArt.tsx paints `drawDrink` into a small canvas;
 * - the reveal: the same package drawn in LAYERS (bottle → label wrap → cap → condensation sparkle), one canvas per layer, stacked
 *   and animated by one-shot CSS (components/DrinkMachine.module.css).
 */
export type DrinkLayer='bottle'|'label'|'cap'|'sparkle';
export const DRINK_LAYERS:DrinkLayer[]=['bottle','label','cap','sparkle'];
type C=CanvasRenderingContext2D;
const rr=(c:C,x:number,y:number,w:number,h:number,r:number)=>{c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);};

const NAT={bottle:{H:46,R:8.2},tallcan:{H:46,R:8.4},can:{H:30,R:10.4},carton:{H:46,R:8}} as const;
/** Visible arc of a vertical cylinder in the iso view: angles whose normal faces the viewer (−45°…135°). */
const arc=(r:number,z:number,from=-40,to=130,step=10):V3[]=>{const out:V3[]=[];for(let d=from;d<=to;d+=step){const a=d*Math.PI/180;out.push([Math.cos(a)*r,Math.sin(a)*r,z]);}return out;};
const onBody=(r:number,deg:number,z:number):V3=>{const a=deg*Math.PI/180;return [Math.cos(a)*r,Math.sin(a)*r,z];};
function droplet(c:C,x:number,y:number,r:number,col:string){c.fillStyle=col;c.beginPath();c.moveTo(x,y-r*1.8);c.quadraticCurveTo(x+r*1.2,y,x,y+r);c.quadraticCurveTo(x-r*1.2,y,x,y-r*1.8);c.fill();}
function glint(c:C,x:number,y:number,r:number){c.fillStyle='#ffffff';c.fillRect(x-r,y-.5,r*2,1);c.fillRect(x-.5,y-r,1,r*2);c.fillRect(x-1,y-1,2,2);}
/**
 * Paints one drink (all layers, or just one) in the Konbini isometric style (lib/konbini/isoArt.ts): low-poly bottles and cans
 * with faceted light-to-dark sides, a gable-top carton, a printed label band with the drink's one short word, a cap / ring
 * pull / straw, and cold condensation beads. Base centre-front at (x, y), `h` tall (a regular can is 0.66 h).
 */
/** How a drink is drawn: 'iso' (the Konbini reveal and collection tiles) or 'front' (a flat, straight-on machine face). */
export type DrinkView='iso'|'front';
/** Front-view proportions (fractions of `h`): cans a bit shorter than bottles, cartons with a flat front and a small top. */
export function frontSize(a:DrinkArt,h:number){return a.shape==='can'?{w:h*.42,h:h*.62}:a.shape==='tallcan'?{w:h*.34,h:h*.9}:a.shape==='carton'?{w:h*.5,h:h*.86}:{w:h*.36,h};}
/** Left-to-right cylinder shading: a bright stripe left of centre, darker toward the edges (flat bands, riso-style). */
const BANDS=[-.14,.1,.24,.1,0,-.1,-.2,-.3];
function banded(c:C,col:string,x0:number,w:number,y0:number,y1:number){const n=BANDS.length;for(let i=0;i<n;i++){c.fillStyle=tone(col,BANDS[i]);c.fillRect(x0+w*i/n-.3,y0,w/n+.6,y1-y0);}}
/**
 * The FRONT mode (user, Sep 30 2026: "fix the perspective of the bottles" on the drink machine glass): upright and symmetric,
 * seen from a slight 12° elevation (a sliver of cap / can top as an ellipse), cylinders shaded left to right, the label wrapping
 * with a slight curve, condensation beads and a soft floor shadow. Base centre at (x, y).
 */
function drawDrinkFront(c:C,a:DrinkArt,x:number,y:number,h:number,only?:DrinkLayer){
 const show=(l:DrinkLayer)=>!only||only===l,{w,h:H}=frontSize(a,h),L=x-w/2,E=.2,ry=w/2*E,top=y-H,lw=Math.max(.8,h*.012);
 const r=rng(`front:${a.shape}:${a.word}:${a.body}`);c.save();c.lineJoin='round';
 // Silhouette (shared by the body, the label clip and the outline).
 const neck=w*.4,sh=y-H*.62,nk=y-H*.8,capY=y-H*.88;
 const sil=()=>{c.beginPath();
  if(a.shape==='bottle'){c.moveTo(L,y-ry);c.lineTo(L,sh);c.quadraticCurveTo(L,nk+H*.04,x-neck/2,nk);c.lineTo(x-neck/2,capY);c.lineTo(x+neck/2,capY);c.lineTo(x+neck/2,nk);c.quadraticCurveTo(x+w/2,nk+H*.04,x+w/2,sh);c.lineTo(x+w/2,y-ry);c.ellipse(x,y-ry,w/2,ry,0,0,Math.PI);}
  else if(a.shape==='carton'){c.rect(L,top+H*.2,w,H*.8);}
  else{c.moveTo(L,top+ry);c.lineTo(L,y-ry);c.ellipse(x,y-ry,w/2,ry,0,Math.PI,0,true);c.lineTo(x+w/2,top+ry);c.ellipse(x,top+ry,w/2,ry,0,0,Math.PI);}
  c.closePath();};
 const inBody=(fn:()=>void)=>{c.save();sil();c.clip();fn();c.restore();};
 if(show('bottle')){
  c.fillStyle='rgba(20,40,60,.16)';c.beginPath();c.ellipse(x+w*.06,y,w*.66,Math.max(1.2,w*.15),0,0,Math.PI*2);c.fill();
  if(a.shape==='carton'){const ft=top+H*.2,ridge=top+H*.04;
   inBody(()=>{c.fillStyle=a.body;c.fillRect(L,ft,w,H*.8);c.fillStyle=tone(a.body,-.2);c.fillRect(L+w*.9,ft,w*.1,H*.8);c.fillStyle=tone(a.body,.12);c.fillRect(L,ft,w*.08,H*.8);});
   c.fillStyle=tone(a.body,.16);c.beginPath();c.moveTo(L,ft);c.lineTo(L+w*.08,ridge);c.lineTo(L+w*.92,ridge);c.lineTo(L+w,ft);c.closePath();c.fill();
   c.fillStyle=tone(a.body,.04);c.fillRect(L+w*.06,ridge-H*.05,w*.88,H*.05);
   c.strokeStyle=tone(a.body,-.4);c.lineWidth=lw;sil();c.stroke();c.beginPath();c.moveTo(L,ft);c.lineTo(L+w*.08,ridge);c.lineTo(L+w*.92,ridge);c.lineTo(L+w,ft);c.stroke();}
  else{const can=a.shape!=='bottle',M='#c9ced4';
   inBody(()=>{banded(c,a.body,L,w,top-2,y+2);if(can){banded(c,M,L,w,top,top+ry*2+H*.05);banded(c,M,L,w,y-ry*2-H*.04,y+1);}
    c.fillStyle='rgba(255,255,255,.7)';c.fillRect(L+w*.24,top+H*.12,Math.max(1,w*.07),H*.62);});
   if(a.shape==='bottle')for(const k of [.08,.14]){c.strokeStyle=tone(a.body,-.22);c.lineWidth=lw*.8;c.beginPath();c.ellipse(x,y-H*k,w/2,ry,0,0,Math.PI);c.stroke();}
   c.strokeStyle=tone(a.body,-.42);c.lineWidth=lw;sil();c.stroke();
   if(can){c.fillStyle='#dfe3e7';c.beginPath();c.ellipse(x,top+ry,w/2,ry,0,0,Math.PI*2);c.fill();c.strokeStyle='#8f979f';c.lineWidth=lw*.8;c.stroke();}
   else{c.fillStyle=tone(a.body,.2);c.beginPath();c.ellipse(x,capY,neck/2,neck/2*E,0,0,Math.PI*2);c.fill();}}
 }
 if(show('label')){
  const y0=a.shape==='bottle'?y-H*.56:a.shape==='carton'?top+H*.42:top+H*.26,y1=a.shape==='bottle'?y-H*.28:a.shape==='carton'?top+H*.76:y-H*.24,cv=a.shape==='carton'?0:ry;
  inBody(()=>{c.save();c.beginPath();c.moveTo(L-1,y0);c.quadraticCurveTo(x,y0+cv*2,x+w/2+1,y0);c.lineTo(x+w/2+1,y1);c.quadraticCurveTo(x,y1+cv*2,L-1,y1);c.closePath();c.clip();
   if(a.shape==='carton'){c.fillStyle=a.label;c.fillRect(L,y0,w,y1-y0+2);c.fillStyle=tone(a.label,-.22);c.fillRect(L+w*.9,y0,w*.1,y1-y0+2);}else banded(c,a.label,L,w,y0,y1+cv*2);
   c.fillStyle=tone(a.label,.35);c.fillRect(L,y0+cv*.6,w,Math.max(.8,(y1-y0)*.08));c.restore();});
  c.fillStyle=a.ink;c.textAlign='center';c.textBaseline='middle';c.font=`900 ${Math.max(5,Math.min((y1-y0)*.46,w*1.5/Math.max(3,a.word.length)))}px system-ui,sans-serif`;c.fillText(a.word,x,(y0+y1)/2+cv*.7,w*.88);
 }
 if(show('cap')){
  if(a.shape==='bottle'){const cw=neck*1.16,ch=H*.12,cy=top;c.save();c.beginPath();c.rect(x-cw/2,cy+ch*.1,cw,ch);c.clip();banded(c,a.cap,x-cw/2,cw,cy,cy+ch+2);c.restore();
   c.fillStyle=tone(a.cap,-.18);c.beginPath();c.ellipse(x,cy+ch*1.1,cw/2,cw/2*E,0,0,Math.PI);c.fill();c.fillStyle=tone(a.cap,.2);c.beginPath();c.ellipse(x,cy+ch*.1,cw/2,cw/2*E,0,0,Math.PI*2);c.fill();
   c.strokeStyle=tone(a.cap,-.3);c.lineWidth=lw*.7;for(let i=1;i<5;i++){const lx=x-cw/2+cw*i/5;c.beginPath();c.moveTo(lx,cy+ch*.35);c.lineTo(lx,cy+ch);c.stroke();}}
  else if(a.shape==='carton'){c.fillStyle=a.cap;const sx=x+w*.18;c.fillRect(sx,top-H*.08,Math.max(1.2,w*.08),H*.16);c.fillRect(sx,top-H*.08,w*.2,Math.max(1.2,w*.08));}
  else{c.strokeStyle='#8f979f';c.lineWidth=lw*.7;c.beginPath();c.ellipse(x,top+ry,w*.4,ry*.8,0,0,Math.PI*2);c.stroke();c.fillStyle='#6c747d';c.beginPath();c.ellipse(x+w*.12,top+ry*1.1,w*.12,ry*.4,0,0,Math.PI*2);c.fill();c.fillStyle='#aab1b8';c.fillRect(x-w*.18,top+ry*.6,w*.2,Math.max(1,ry*.6));}
 }
 if(show('sparkle')){const zones=a.shape==='bottle'?[[.06,.26],[.6,.78]]:a.shape==='carton'?[[.25,.4],[.8,.95]]:[[.08,.22],[.8,.92]];
  for(let i=0;i<9;i++){const [z0,z1]=zones[i%2],t=z0+r()*(z1-z0),u=.12+r()*.76,px=L+w*u,py=a.shape==='carton'?top+H*t:y-H*(1-t);const d=Math.max(1,h*.02);c.fillStyle='rgba(30,70,100,.28)';c.fillRect(px,py+d*.5,d,d);c.fillStyle='#ffffffe8';c.fillRect(px-d*.4,py-d*.5,d,d*1.3);}
  const g=(gx:number,gy:number,gr:number)=>{c.fillStyle='#ffffff';c.fillRect(gx-gr,gy-.5,gr*2,1);c.fillRect(gx-.5,gy-gr,1,gr*2);};g(x+w*.6,top+H*.14,h*.06);g(L-w*.08,y-H*.5,h*.04);}
 c.restore();
}
export function drawDrink(c:C,a:DrinkArt,x:number,y:number,h:number,only?:DrinkLayer,view:DrinkView='iso'){
 if(view==='front'){drawDrinkFront(c,a,x,y,h,only);return;}
 const g=NAT[a.shape],real=a.shape==='can'?h*.66:a.shape==='tallcan'?h*.95:h,k=real/g.H,show=(l:DrinkLayer)=>!only||only===l,R=g.R,H=g.H;
 c.save();c.translate(x,y-(a.shape==='carton'?R:R*.707)*k);c.scale(k,k);c.lineJoin='round';const I=new Iso(c,0,0),r=rng(`drink:${a.shape}:${a.word}:${a.body}`);
 const can=a.shape==='can'||a.shape==='tallcan',METAL='#c9ced4';
 if(a.shape==='carton'){
  const hb=H*.72,W=R*2;
  if(show('bottle')){I.box(0,0,0,W,W,hb,a.body,{top:tone(a.body,-.02)});
   I.extrude([[-R,hb],[R,hb],[0,hb+7]],-R,W,tone(a.body,.04),{plane:'yz'});I.box(0,0,hb+6.2,W,1.3,2.4,tone(a.body,.02));
   I.line([[-R,R,hb],[R,R,hb]],tone(a.body,-.12),.5);}
  if(show('label')){const z0=hb*.3,lh=hb*.46;I.box(0,0,z0,W+.4,W+.4,lh,a.label,{skip:'t'});I.line([[-R-.2,R+.2,z0+lh-1.4],[R+.2,R+.2,z0+lh-1.4],[R+.2,-R-.2,z0+lh-1.4]],tone(a.label,.35),.8);
   I.text(a.word,[0,R+.25,z0+lh*.52],'left',Math.min(6.2,24/Math.max(3,a.word.length)),a.ink,W*.9);
   const [dx,dy]=I.p(R+.25,0,z0+lh*.5);c.save();c.translate(dx,dy);c.transform(1,-.58,0,1,0,0);droplet(c,0,0,2.2,a.ink);c.restore();}
  if(show('cap')){I.lathe([3.2,2.2,hb+2.5],[5.4,-1,hb+13],[[0,.85],[1,.85]],a.cap,{segs:4});I.lathe([5.4,-1,hb+13],[8.2,-1.6,hb+14.8],[[0,.85],[1,.85]],a.cap,{segs:4});}
  if(show('sparkle')){const z0=hb*.3,z1=hb*.76;for(const [lo,hi,n] of [[1.5,z0-1,4],[z1+1,hb-1,3]] as const){I.speckQuad([[-R,R+.3,lo],[R,R+.3,lo],[R,R+.3,hi],[-R,R+.3,hi]],n,'#ffffffe0',r,1.3,1.6,.1);I.speckQuad([[R+.3,-R,lo],[R+.3,R,lo],[R+.3,R,hi],[R+.3,-R,hi]],2,'#ffffffc0',r,1.2,1.5,.1);}
   const [gx,gy]=I.p(R,-R,hb);glint(c,gx+3,gy,3);const [hx,hy]=I.p(-R,R,hb*.5);glint(c,hx-3,hy,2.2);}
 }else if(can){
  const top=H;
  if(show('bottle')){I.lathe([0,0,0],[0,0,top],[[0,R*.88],[.035,R],[.94,R],[1,R*.86]],a.body,{segs:12,cap:'#d7dce0',colAt:ring=>ring===0||ring===2?METAL:undefined});
   I.line(arc(R+.15,top*.94),tone(METAL,-.1),.6);I.line(arc(R*.99,top*.035+.2),tone(METAL,-.1),.6);
   I.line([onBody(R+.2,108,top*.1),onBody(R+.2,108,top*.86)],'rgba(255,255,255,.7)',1.6);}
  if(show('label')){const z0=top*.22,z1=top*.72;I.lathe([0,0,z0],[0,0,z1],[[0,R+.25],[1,R+.25]],a.label,{segs:12,cap:false});
   I.line(arc(R+.3,z1-1.2,-38,128,8),tone(a.label,.35),.8);I.line(arc(R+.3,z0+1.2,-38,128,8),tone(a.label,-.2),.6);
   I.text(a.word,[R*.72,R*.72,(z0+z1)/2],'front',Math.min(a.shape==='can'?6.4:5.6,26/Math.max(3,a.word.length)),a.ink,R*2.1);}
  if(show('cap')){const rr=R*.86;I.line(arc(rr-.8,top+.05,-180,180,20),tone(METAL,-.22),.7);
   const o=I.p(1.6,1.6,top+.05);c.fillStyle='#5f666e';c.beginPath();c.ellipse(o[0],o[1],2.6,1.1,0,0,Math.PI*2);c.fill();
   const t=I.p(-.8,-.8,top+.1);c.fillStyle='#aab1b8';c.fillRect(t[0]-2.2,t[1]-1,4.4,2);c.fillStyle='#8a929a';c.fillRect(t[0]-.6,t[1]-.5,1.2,1);}
  if(show('sparkle')){for(const [d,t] of [[0,.12],[40,.16],[88,.1],[18,.8],[66,.86],[112,.78],[-20,.84],[52,.08]] as const){const [px,py]=I.p(...onBody(R+.35,d,top*t));c.fillStyle='rgba(40,80,110,.3)';c.fillRect(px-.2,py+.4,1.3,1.3);c.fillStyle='#ffffffe8';c.fillRect(px-.7,py-.8,1.3,1.6);}
   const [gx,gy]=I.p(R*.7,-R*.7,top*.9);glint(c,gx+2.5,gy,3);}
 }else{
  // Bottle: a faceted PET bottle with waist ridges, a label band and a ribbed cap.
  if(show('bottle')){I.lathe([0,0,0],[0,0,H],[[0,R*.9],[.03,R],[.62,R],[.68,R*.93],[.77,R*.62],[.84,R*.43],[.88,R*.41]],a.body,{segs:10,cap:tone(a.body,.1)});
   for(const t of [.1,.16])I.line(arc(R+.12,H*t),tone(a.body,-.2),.6);
   I.line([onBody(R+.2,112,H*.08),onBody(R+.2,112,H*.6)],'rgba(255,255,255,.75)',1.7);I.line([onBody(R*.8,110,H*.7),onBody(R*.5,108,H*.8)],'rgba(255,255,255,.7)',1.1);}
  if(show('label')){const z0=H*.28,z1=H*.56;I.lathe([0,0,z0],[0,0,z1],[[0,R+.25],[1,R+.25]],a.label,{segs:10,cap:false});
   I.line(arc(R+.3,z1-1.1,-38,128,8),tone(a.label,.35),.8);
   I.text(a.word,[R*.72,R*.72,(z0+z1)/2+.6],'front',Math.min(5.8,24/Math.max(3,a.word.length)),a.ink,R*2.1);}
  if(show('cap')){I.lathe([0,0,H*.87],[0,0,H],[[0,R*.47],[.85,R*.47],[1,R*.42]],a.cap,{segs:10});
   for(const d of [0,30,60,90])I.line([onBody(R*.48,d,H*.885),onBody(R*.48,d,H*.975)],tone(a.cap,-.25),.5);}
  if(show('sparkle')){for(const [d,t] of [[-10,.16],[30,.21],[80,.12],[118,.2],[10,.62],[58,.68],[98,.64],[40,.75]] as const){const [px,py]=I.p(...onBody(R+.35,d,H*t));c.fillStyle='rgba(40,80,110,.28)';c.fillRect(px-.2,py+.4,1.2,1.2);c.fillStyle='#ffffffe8';c.fillRect(px-.65,py-.8,1.3,1.6);}
   const [gx,gy]=I.p(R*.5,-R*.5,H*.84);glint(c,gx+4.5,gy,3);const [hx,hy]=I.p(-R,R*.3,H*.5);glint(c,hx-3,hy,2.2);}
 }
 c.restore();
}
/** The soft cast shadow under a drink standing at (x, y) (the reveal and the atlas draw it before the layers). */
export function drinkShadow(a:DrinkArt,h:number){const real=a.shape==='can'?h*.66:a.shape==='tallcan'?h*.95:h,k=real/NAT[a.shape].H,R=NAT[a.shape].R*k;return {rx:R*1.3,ry:R*.58,dy:-R*.5};}

/**
 * The drink machine's glass for the shared atlas, painted in the same 512×423 logical space as the snack machines' glass (the
 * caller scales it into its atlas tile). Rects come from VENDING_FACE_LAYOUT so the far machine lines up with the close-up face.
 * Look: a cool blue/white Japanese drink machine: icy glass with rows of bottles and cans, a small lit price button under each,
 * and the つめた～い / あったか～い (COLD / HOT) strip under every button, red on the warm can.
 */
export function drawDrinkTile(c:C,drinks:readonly Drink[],L:{glass:FaceRect;prev:FaceRect;label:FaceRect;next:FaceRect;slots:readonly FaceRect[];slotPush:{y:number;h:number};cols:number},title:string){
 const [X,Y,W,H]=[0,0,512,423],G=L.glass,px=(r:FaceRect)=>[X+(r.x-G.x)/G.w*W,Y+(r.y-G.y)/G.h*H,r.w/G.w*W,r.h/G.h*H];
 c.fillStyle='#dfe9f2';c.fillRect(X,Y,W,H);
 const g=c.createLinearGradient(0,Y,0,Y+H);g.addColorStop(0,'#eaf7ff');g.addColorStop(1,'#bfe0f5');c.fillStyle=g;c.fillRect(X+8,Y+8,W-16,H-16);
 // Header: one lit banner across prev · label · next ("のみもの DRINKS").
 {const [x,y]=px(L.prev),[x2,,w2]=px(L.next),[,,,h]=px(L.label),bw=x2+w2-x,bg=c.createLinearGradient(x,0,x+bw,0);bg.addColorStop(0,'#1d5fb8');bg.addColorStop(.5,'#3f8ee6');bg.addColorStop(1,'#1d5fb8');
  c.fillStyle=bg;rr(c,x,y,bw,h,8);c.fill();c.fillStyle='#ffffff';c.textAlign='center';c.textBaseline='middle';c.font='900 22px system-ui,sans-serif';c.fillText(`のみもの  ${title}`,x+bw/2,y+h/2+1,bw-20);}
 // A back row of small bottles on each shelf: the dense "rows of drinks" look of a real machine.
 for(let row=0;row<2;row++){const r=L.slots[row*L.cols],[sx,sy,,sh]=px(r),rowW=W-2*(sx-X);
  const shelfY=sy+sh*.6;
  for(let i=0;i<11;i++){const dd=drinks[(i+row*3)%drinks.length];if(!dd)continue;c.globalAlpha=.45;drawDrink(c,dd.art,sx+14+i*(rowW-28)/10,shelfY-4,sh*.34,undefined,'front');c.globalAlpha=1;}
  c.fillStyle='#8fb4cc';c.fillRect(sx,shelfY-2,rowW,5);
 }
 L.slots.forEach((r,i)=>{const dk=drinks[i];if(!dk)return;const [x,y,w,h]=px(r),cx=x+w/2,shelfY=y+h*.6;
  drawDrink(c,dk.art,cx,shelfY,h*.5,undefined,'front');
  // Temperature strip (the Japanese machine's blue つめた～い / red あったか～い tag) and the lit price button.
  const sY=y+h*.66,sH=h*.12,hot=dk.temp==='hot';c.fillStyle=hot?'#d8342c':'#2a74d1';rr(c,x+8,sY,w-16,sH,4);c.fill();
  c.fillStyle='#ffffff';c.font=`900 ${Math.round(sH*.62)}px system-ui,sans-serif`;c.textAlign='center';c.fillText(hot?'あったか～い HOT':'つめた～い COLD',cx,sY+sH/2+1,w-22);
  const pY=y+h*L.slotPush.y-h*.04,pH=h*L.slotPush.h+h*.02;c.fillStyle='#1c1f25';rr(c,x+10,pY,w-20,pH,pH/2);c.fill();
  c.fillStyle='#ffd23f';c.beginPath();c.arc(x+10+pH*.6,pY+pH/2,pH*.22,0,Math.PI*2);c.fill();
  c.fillStyle='#7cf29a';c.font=`800 ${Math.round(pH*.62)}px ui-monospace,Menlo,monospace`;c.fillText(String(dk.price),cx+6,pY+pH/2+1);
 });
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(X+W*.3,Y);c.lineTo(X+W*.4,Y);c.lineTo(X+W*.2,Y+H);c.lineTo(X+W*.1,Y+H);c.fill();
 c.strokeStyle='#23313f';c.lineWidth=8;c.strokeRect(X+4,Y+4,W-8,H-8);
}

/**
 * The drink as Konbini reveal layers (components/KonbiniReveal.tsx STABLE API: FoodLayer[] on a 64-unit cell centred on x, y):
 * bottle → label wrap → cap → condensation sparkle. The sparkle is a `glint` layer: it fades in and stays on the finished drink (shelf, tiles and reveal).
 */
export function drinkRevealLayers(a:DrinkArt):import('../konbini/foodArt').FoodLayer[]{
 const at=(layer:DrinkLayer)=>(c:C,x:number,y:number)=>drawDrink(c,a,x,y+27,a.shape==='can'?56:50,layer);
 return [
  {name:a.shape==='can'||a.shape==='tallcan'?'can':a.shape==='carton'?'carton':'bottle',draw:at('bottle')},
  {name:'label wrap',draw:at('label')},
  {name:a.shape==='bottle'?'cap':a.shape==='carton'?'straw tab':'ring pull',draw:at('cap')},
  {name:'condensation sparkle',kind:'glint',draw:at('sparkle')},
 ];
}
