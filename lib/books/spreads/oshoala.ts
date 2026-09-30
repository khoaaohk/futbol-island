/**
 * The six Asisat Oshoala pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/oshoala/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Her parents are shown as kind and worried (a SCHOOL FIRST card, a talk, then a phone call), never as villains.
 * Kits: Nigeria in green and white, Liverpool in red, Barcelona in blue and red stripes — no crests or badges.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='oshoala-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const ASI={skin:'#7f5138',hair:'bun' as const,hairColor:'#1d1512'};
const SKINS=['#7f5138','#5b3a28','#8a5a3c','#6b452f'];
const NG_GREEN='#1f8a4c',BARCA_BLUE='#1f4f9c',BARCA_RED='#b8284a',LFC_RED='#c8352f';
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function dirt(k:Kit,x0:number,x1:number,tone='#d9a870'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,INK.brown,.06,(x,y)=>.14+.08*Math.sin(x*1.7+y*.9));}
function floor(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#f0dcb4');k.dots(p,INK.orange,.06,.1);for(let y=.4;y<PAGE_D;y+=.6)for(let x=x0+.3;x<x1;x+=.6)k.fill(rect(x-.24,y-.24,.48,.48),'#e6c894');}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
/** Low Lagos houses with tin roofs and bright walls. */
function lagosRow(k:Kit,w:number,y:number,seed=0){for(let i=0;i<9;i++){const x=i*w/9+.02,bw=w/9-.05,hh=.5+((i*5+seed)%3)*.14,b=rect(x,y-hh,bw,hh);k.fill(b,['#f2c46d','#e98f73','#9fd1c2','#f4dfb0','#c9a3d6'][(i+seed)%5]);k.dots(b,INK.orange,.04,.12);k.key(b,.01);
 const roof=poly([[x-.04,y-hh],[x+bw/2,y-hh-.16],[x+bw+.04,y-hh]]);k.fill(roof,'#9aa4ad');k.hatch(roof,INK.navy,.03,.2,.008);k.key(roof,.01);k.fill(rect(x+bw*.3,y-hh*.55,bw*.4,hh*.55),INK.navy);}}
function palms(k:Kit,w:number,y:number){for(let i=0;i<5;i++){const x=.4+i*w/5;k.key(`M${x} ${y} Q${x+.05} ${y-.3} ${x+.02} ${y-.55}`,.03,INK.brown);for(let j=0;j<5;j++){const a=-Math.PI+j*Math.PI/4;k.key(`M${x+.02} ${y-.55} Q${x+.02+Math.cos(a)*.12} ${y-.6+Math.sin(a)*.1} ${x+.02+Math.cos(a)*.22} ${y-.5+Math.sin(a)*.12}`,.025,INK.green);}}}
function skyline(k:Kit,w:number,y:number,cs=['#8f95ad','#a3a8bd','#7e849e']){for(let i=0;i<11;i++){const x=i*w/11,h=.4+((i*7)%5)*.14,b=rect(x,y-h,w/11-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.06,.06),INK.yellow,.7);}}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const bubble=(key:string,w:number,h:number,text:string,c:string=INK.white)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.36} ${h*.74} L${w*.2} ${h} L${w*.24} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,c);k.dots(p,INK.sky,.035,.15);k.key(p,.013);k.text(text,w/2,h*.5,h*.3,INK.navy,{max:w*.84,weight:900});},{rim:.016});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
/** A football shirt seen from the back, with a name and number (or a blank name bar). */
const shirtBack=(key:string,w:number,h:number,base:string,stripe:string|null,name:string,num:string)=>sp(key,w,h,k=>{
 const s=`M${w*.28} 0 Q${w*.5} ${h*.08} ${w*.72} 0 L${w} ${h*.16} L${w*.9} ${h*.42} L${w*.78} ${h*.36} L${w*.78} ${h} L${w*.22} ${h} L${w*.22} ${h*.36} L${w*.1} ${h*.42} L0 ${h*.16} Z`;
 k.fill(s,base);if(stripe)for(const x of [.3,.5,.7])k.fill(rect(w*x-w*.05,h*.02,w*.1,h*.98),stripe);k.key(s,.013);
 if(name){k.fill(rect(w*.26,h*.2,w*.48,h*.16),INK.white,.85);k.text(name,w/2,h*.33,h*.12,INK.navy,{max:w*.44,weight:900});}
 else{k.fill(rect(w*.3,h*.22,w*.4,h*.1),INK.white,.5);k.text('?',w/2,h*.31,h*.12,INK.navy,{weight:900});}
 if(num)k.text(num,w/2,h*.78,h*.34,INK.white,{weight:900});},{rim:.016});
const goldCard=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.gold);k.dots(b,INK.orange,.03,.3);k.key(b,.013);k.text(label,w/2,h*.64,h*.42,INK.navy,{max:w*.86,weight:900});},{rim:.016});
const flagNG=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.04,h),INK.brown);const f=rect(.04,0,w-.04,h*.55);k.fill(f,INK.white);k.fill(rect(.04,0,(w-.04)/3,h*.55),NG_GREEN);k.fill(rect(.04+(w-.04)*2/3,0,(w-.04)/3,h*.55),NG_GREEN);k.key(f,.012);});
const mapleLeaf=(key:string,s:number)=>sp(key,s,s,k=>{const cx=s/2,cy=s*.48,r=s*.42;const pts=[[0,-1],[.18,-.55],[.5,-.7],[.38,-.3],[.8,-.28],[.62,-.05],[.8,.12],[.3,.12],[.06,.5],[.06,.9],[-.06,.9],[-.06,.5],[-.3,.12],[-.8,.12],[-.62,-.05],[-.8,-.28],[-.38,-.3],[-.5,-.7],[-.18,-.55]].map(([x,y])=>[cx+x*r,cy+y*r]);k.fill(poly(pts),INK.red);k.key(poly(pts),.012);},{rim:.016});
const phone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.12} 0 L${w*.88} 0 Q${w} 0 ${w} ${h*.08} L${w} ${h*.92} Q${w} ${h} ${w*.88} ${h} L${w*.12} ${h} Q0 ${h} 0 ${h*.92} L0 ${h*.08} Q0 0 ${w*.12} 0 Z`;k.fill(b,INK.navy);k.key(b,.012);const s=rect(w*.1,h*.1,w*.8,h*.72);k.fill(s,INK.sky2);k.fill(ell(w*.5,h*.4,w*.2,w*.2),INK.white);k.key(ell(w*.5,h*.4,w*.2,w*.2),.01);k.keyFill(ell(w*.5,h*.4,w*.07,w*.07));k.circle(w*.5,h*.9,w*.06,INK.grey);},{rim:.014});
const tvSet=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.44,h*.78,w*.12,h*.22),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,'#3a3550');k.key(b,.014);const s=rect(w*.07,h*.07,w*.86,h*.64);k.fill(s,INK.grass);k.dots(s,INK.leaf,.035,.3);line(k,w*.5,h*.07,w*.5,h*.71,.012);k.key(ell(w*.5,h*.39,w*.12,w*.12),.012,INK.white);k.circle(w*.66,h*.46,.04,INK.white);k.fill(rect(w*.2,h*.3,.04,.1),BARCA_BLUE);k.fill(rect(w*.72,h*.5,.04,.1),INK.red);},{rim:.016});
const kiosk=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#f2c46d');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const aw=poly([[-.04,h*.34],[w+.04,h*.34],[w-.06,h*.12],[.06,h*.12]]);k.fill(aw,INK.red);for(let x=.1;x<w;x+=.28)k.fill(poly([[x,h*.12],[x+.14,h*.12],[x+.14,h*.34],[x,h*.34]]),INK.white);k.key(aw,.012);
 k.fill(rect(w*.12,h*.48,w*.76,h*.2),INK.white);k.text('SHOP',w/2,h*.63,h*.13,INK.navy,{weight:900});for(let i=0;i<4;i++)k.circle(w*(.2+i*.2),h*.82,.05,[INK.orange,INK.yellow,INK.green,INK.red][i]);});
const shopCounter=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.03,.1,.008);k.key(b,.013);for(let i=0;i<5;i++)k.circle(w*(.12+i*.19),-.0+h*.25,.06,[INK.orange,INK.yellow,INK.green,INK.red,INK.pink][i]);});
const flapCover=(key:string,w:number,h:number,c:string,n:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.text(n,w/2,h*.55,h*.4,INK.white,{weight:900});k.text('LIFT',w/2,h*.88,h*.13,INK.white,{weight:900});},{rim:.015});
const wordCard=(key:string,w:number,h:number,label:string,kind:'heart'|'hands'|'clock',c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.03,.14);k.key(b,.012);const cx=w/2,cy=h*.38,r=w*.2;
 if(kind==='heart')k.fill(`M${cx} ${cy+r} C${cx-r*1.6} ${cy} ${cx-r*.8} ${cy-r*1.2} ${cx} ${cy-r*.3} C${cx+r*.8} ${cy-r*1.2} ${cx+r*1.6} ${cy} ${cx} ${cy+r} Z`,INK.pink);
 else if(kind==='hands'){k.fill(ell(cx-r*.5,cy,r*.6,r*.4),'#7f5138');k.fill(ell(cx+r*.5,cy,r*.6,r*.4),'#d99a6c');k.key(ell(cx-r*.5,cy,r*.6,r*.4),.01);k.key(ell(cx+r*.5,cy,r*.6,r*.4),.01);}
 else{k.fill(ell(cx,cy,r,r),INK.white);k.key(ell(cx,cy,r,r),.012);k.key(`M${cx} ${cy} L${cx} ${cy-r*.7} M${cx} ${cy} L${cx+r*.5} ${cy}`,.014);}
 k.fill(rect(0,h*.74,w,h*.26),INK.white);k.text(label,w/2,h*.93,h*.16,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const board=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.15),INK.navy);k.text(title,w/2,h*.11,h*.08,INK.yellow,{max:w*.86,weight:900});});
const stepBlock=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.03,.2);k.key(b,.013);k.text(label,w/2,h*.62,Math.min(h*.36,.16),INK.navy,{max:w*.86,weight:900});},{rim:.016});
const iceBag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.1,h*.3],[w*.5,0],[w*.9,h*.3],[w,h*.8],[w*.5,h],[0,h*.8]]);k.fill(p,INK.sky);k.dots(p,INK.blue,.03,.3);k.key(p,.012);k.text('ICE',w/2,h*.7,h*.3,INK.navy,{weight:900});},{rim:.015});
const shirtBox=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.25,w,h*.75);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.03,.2,.008);k.key(b,.013);for(let i=0;i<3;i++){const x=w*(.15+i*.25);k.fill(rect(x,0,w*.22,h*.3),[INK.yellow,NG_GREEN,INK.pink][i]);k.key(rect(x,0,w*.22,h*.3),.01);}k.text('KIT',w/2,h*.75,h*.26,INK.white,{weight:900});});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.11){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),Rt=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[Rt,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A girl who loved football (street) ───────────── */
const street:SpreadDef={id:'street',rest:27.4,
 left:k=>{dirt(k,-5,0,'#d8b07e');line(k,-5,Z(1.3),0,Z(1.3),.04,'#b88a58');footprints(k,-4.4,Z(.9),-.4,Z(1.1),12,INK.brown);
  k.text('IKORODU · 1994',-2.5,Z(2.62),.42,INK.navy,{max:4.2});k.text('LAGOS STATE, NIGERIA',-2.5,Z(2.9),.16,NG_GREEN,{weight:800});},
 right:k=>{dirt(k,0,5);box(k,.6,Z(-.6),3.9,2.5,.04,'#fff3dc');for(const x of [.6,4.5]){line(k,x,Z(.2),x,Z(.9),.08,INK.white);}
  k.text('STREET FOOTBALL',2.5,Z(2.62),.4,INK.red,{max:4.3});k.text('EVERYONE DESERVES A GAME',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe6b0',INK.orange,y=>.4-y/3*.3);lagosRow(k,4.5,2.4,0);palms(k,4.5,2.3);k.fill(rect(0,2.4,4.5,.6),'#d8b07e');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);lagosRow(k,4.5,2.4,2);k.fill(rect(0,2.4,4.5,.6),'#d9a870');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.32),'R',3.9,1.7,{out:.012});const birds=bd.add(S.birds(K+'s-birds',.9,.3),'L',2.2,1.1,{out:.02});
  // Left page: born in Ikorodu, a big family, worried parents.
  const yr=B.stand(S.flipCard(K+'s-1994',.9,.34,'1994',INK.pink),-.8,-2.1,{layer:1,s:0});
  const flag=B.stand(flagNG('s-flag',.7,.9),-4.5,-.75,{layer:1,s:0});
  const baby=B.person(K+'s-baby',-2.8,-1.0,.6,{shirt:'bib',...ASI,face:'grin',layer:2});
  const sibs=[[-4.3,.1,'short'],[-3.5,-.5,'curly'],[-1.4,-.4,'bun'],[-.7,.4,'short'],[-4.0,1.3,'long']].map(([x,z,hr],i)=>B.person(K+`s-sib${i}`,x as number,z as number,.78+(i%2)*.12,{shirt:(['fan','casual','bib','ger','casual'] as const)[i],hair:hr as 'short',hairColor:'#1d1512',skin:SKINS[i%4],face:'grin',layer:3}));
  const mum=B.person(K+'s-mum',-3.3,.35,1.55,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:SKINS[1],face:'shy',layer:2});
  const dad=B.person(K+'s-dad',-2.2,.15,1.68,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:SKINS[0],face:'shy',layer:2});
  const school=B.stand(lineCard('s-school',1.3,.44,['SCHOOL FIRST'],INK.yellow),-2.7,1.45,{layer:2,s:0});
  // Right page: "football is not for girls?", Asisat plays anyway, hides behind the shop, rolls the ball.
  const doubt=B.stand(bubble('s-doubt',1.5,.7,'NOT FOR GIRLS?',INK.white),3.9,-1.0,{layer:1,s:0,tab:false});
  const shop=B.stand(kiosk('s-kiosk',1.3,1.2),.95,-1.5,{layer:1});
  const A=B.person(K+'s-a',2.0,.1,1.0,{shirt:'casual',...ASI,legs:'kick',face:'grin',layer:2});
  const boys=[[4.1,.2,'short'],[3.3,.8,'curly']].map(([x,z,hr],i)=>B.person(K+`s-boy${i}`,x as number,z as number,1.0,{shirt:i?'fan':'bib',hair:hr as 'short',hairColor:'#1d1512',skin:SKINS[(i+2)%4],face:'grin',layer:2}));
  const shh=B.stand(bubble('s-shh',.7,.5,'SHH!',INK.yellow),.5,-.5,{layer:2,s:0,tab:false});
  B.slot(.8,1.35,4.2,1.35);const ball=B.stand(S.ball(K+'s-ball',.11),.9,1.35,{layer:3,tab:false,s:0});
  const shirt=B.stand(shirtBack('s-shirt',.9,.9,INK.white,null,'','10'),2.6,1.9,{layer:3,s:0});
  const newKid=B.person(K+'s-join',1.2,1.8,.9,{shirt:'fan',hair:'long',hairColor:'#1d1512',skin:SKINS[2],face:'grin',layer:3});
  const hearts=[0,1].map(i=>B.stand(heart(`s-h${i}`,.26),-3.4+i*5.4,2.2,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.4):b.t;
   sun.dy=.5*beat(t,0,3);birds.dx=.8*beat(t,0,40);
   // Born in 1994 in Ikorodu, Lagos State.
   yr.s=beat(t,4,4.8)*(1-beat(t,19.6,20.4));flag.s=beat(t,6.4,7.2);baby.body.s=beat(t,3,3.8)*(1-beat(t,17.8,18.6));
   // A big family.
   sibs.forEach((p,i)=>{p.body.s=beat(t,9.2+i*.5,10+i*.5)*(1-beat(t,19.4+i*.1,20.2+i*.1));});sibs.forEach((p,i)=>cheer(p,beat(t,12+i*.2,12.6+i*.2)*(1-beat(t,13.4,14))));
   // Many thought football was not for girls.
   doubt.s=beat(t,13.8,14.6)*(1-Math.max(beat(t,18.6,19.4),manual?1:0));doubt.dy=.05*wave(t,14.6,18.4,.6);
   // She loved it anyway.
   A.body.s=beat(t,17.8,18.6);cheer(A,beat(t,18.6,19.2)*(1-beat(t,20,20.6)));
   // Her parents did not want her to play: school first.
   mum.body.s=beat(t,20.4,21.2);dad.body.s=beat(t,20.8,21.6);school.s=beat(t,21.4,22.2)*(1-beat(t,34.6,35.4));dad.armR.rot=.12+1.1*pulse(t,21.6,23.4);
   // She hid where she was going: slips round the shop.
   const hide=beat(t,23.4,25)*(1-beat(t,26.2,27.2));A.body.dx=.25*hide;A.body.dz=-1.35*hide;shh.s=beat(t,24,24.6)*(1-beat(t,26.4,27));A.body.yaw=-.3*hide;
   boys.forEach((p,i)=>{p.body.s=beat(t,24.8+i*.4,25.6+i*.4);});
   // Roll the ball down the street.
   const roll=Math.max(beat(t,27.8,29.6),manual?beat(act,0,.8):0);ball.s=Math.max(beat(t,26.4,27),manual?1:0);ball.x=.9+3.1*roll;ball.rot=-roll*9;A.leg!.rot=-1*Math.max(pulse(t,27.6,28.3),manual?pulse(act,0,.3):0);
   boys.forEach((p,i)=>cheer(p,Math.max(beat(t,29.6+i*.2,30.2+i*.2)*(1-beat(t,31,31.6)),manual?beat(act,.8+i*.08,.95+i*.05):0)));
   // No shirt with a woman player's name on the back.
   shirt.s=beat(t,30.4,31.2);shirt.dy=.03*wave(t,31.2,34.8,.5);
   // Everyone deserves a game: make room for any player.
   newKid.body.s=beat(t,35.2,36);cheer(newKid,beat(t,36.4,37));boys.forEach((p,i)=>{if(t>35)cheer(p,beat(t,36.6+i*.3,37.2+i*.3));});cheer(A,beat(t,37,37.6));
   hearts.forEach((h,i)=>{h.s=beat(t,37.4+i*.5,38.1+i*.5);});mum.armR.rot=.12+1.3*beat(t,38,38.6);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,13.4,14.2)-.45*beat(t,20,20.8)+.45*beat(t,23,23.8)-.45*beat(t,34.4,35.2):0;
  };
 }};

/* ───────────── 2 · A grandmother who believed (grandma) ───────────── */
const grandma:SpreadDef={id:'grandma',rest:24.9,
 left:k=>{floor(k,-5,0);k.fill(rect(-4.6,Z(-.2),2.2,1.4),'#c9573f',.55);k.dots(rect(-4.6,Z(-.2),2.2,1.4),INK.yellow,.06,.3);
  k.text('AT HOME',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('SO WHO BELIEVED IN HER?',-2.5,Z(2.9),.16,INK.red,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(1.9),5,Z(1.9),.05);ring(k,2.5,Z(1.9),.7,.05);
  k.text('HER GRANDMOTHER',2.5,Z(2.62),.38,INK.navy,{max:4.3});k.text('GOOD · RESPECTFUL · DISCIPLINED',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'g-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3e3c0');k.dots(p,INK.orange,.05,.12);const w=rect(.5,.5,1.1,1.0);k.fill(w,INK.sky2);k.key(w,.012);line(k,1.05,.5,1.05,1.5,.02,INK.navy);
   const d=rect(2.6,.8,.9,1.6);k.fill(d,INK.wood);k.key(d,.012);k.circle(3.35,1.6,.04,INK.gold);k.fill(rect(0,2.4,4.5,.6),'#e6c894');}},
   {key:K+'g-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.6,2.45,[NG_GREEN,INK.white,NG_GREEN,INK.yellow],2);lightRig(k,1.0,.6);lightRig(k,3.6,.55);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const moon=bd.add(S.sun(K+'g-sun',.28),'L',3.7,1.9,{out:.012});
  // Left page: trouble at home, the question.
  const mum=B.person(K+'g-mum',-3.6,.3,1.55,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:SKINS[1],face:'shy',layer:2});
  const A=B.person(K+'g-a',-2.1,.4,1.0,{shirt:'casual',...ASI,face:'sad',layer:2,holdR:'ball'});
  const mud=B.stand(bubble('g-late',.9,.55,'LATE!',INK.yellow),-4.4,1.4,{layer:2,s:0,tab:false});
  const qs=[0,1,2].map(i=>B.stand(bubble(`g-q${i}`,.42,.46,'?',[INK.white,INK.yellow,INK.sky2][i]),-1.5+i*.5,-1.9+(i%2)*.2,{layer:1,s:0,tab:false}));
  const gran=B.person(K+'g-gran',-1.0,1.2,1.4,{shirt:'casual',hair:'bun',hairColor:'#cfc8bd',adult:true,skin:SKINS[3],face:'smile',layer:3});
  const talk=B.stand(bubble('g-talk',1.0,.55,'BE GOOD',INK.white),-.55,.2,{layer:2,s:0,tab:false});
  const hearts=[0,1].map(i=>B.stand(heart(`g-h${i}`,.26),-4.2+i*.8,1.9,{layer:3,s:0,tab:false}));
  // Right page: the three flaps and Asisat walking onto the pitch.
  const bdW=2.6,brd=B.stand(board('g-board',bdW,2.6,'WHAT GRANDMA SAID'),3.15,-.7,{layer:1,s:0});
  const words=([['GOOD','heart',INK.yellow],['RESPECTFUL','hands',INK.sky],['DISCIPLINED','clock',INK.pink]] as const).map(([l,kd,c],i)=>{const x=-bdW/2+.45+i*.85;brd.add(wordCard(`g-w${i}`,.72,.9,l,kd,c),x,.3,{z:.012});return brd.flap(flapCover(`g-f${i}`,.74,.92,[NG_GREEN,INK.orange,INK.blue][i],String(i+1)),x,1.21,{z:.024});});
  const A2=B.person(K+'g-a2',1.3,.2,1.25,{shirt:'ger',...ASI,face:'grin',legs:'run',layer:2});
  const mates=[[.35,.9,'short'],[.8,1.9,'curly']].map(([x,z,hr],i)=>B.person(K+`g-m${i}`,x as number,z as number,1.15,{shirt:'ger',hair:hr as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%4],face:'grin',layer:2}));
  const coach=B.stand(lineCard('g-coach',1.5,.44,['EVERY COACH WANTS'],INK.gold),3.4,2.05,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,24.9):b.t;
   // Trouble at home for playing football.
   A.body.s=beat(t,2,2.8);mum.body.s=beat(t,2.6,3.4);mud.s=beat(t,3.4,4.2)*(1-beat(t,8.6,9.2));mum.armR.rot=.12+1.2*pulse(t,3.6,6.8);A.body.yaw=-.3*pulse(t,3.8,7);
   // So who believed in her?
   qs.forEach((q,i)=>{q.s=beat(t,7.1+i*.3,7.6+i*.3)*(1-beat(t,9.4,10));q.dy=.05*wave(t,7.6,9.4,.8+i*.2);});
   // Her grandmother.
   gran.body.s=beat(t,9.3,10.1);gran.armL.rot=-.12-1.4*beat(t,10.2,10.8);moon.dy=.4*beat(t,9,12);
   // Be good, respectful and disciplined.
   talk.s=beat(t,11.2,12)*(1-beat(t,19.4,20));talk.dy=.04*wave(t,12,19,.5);gran.armR.rot=.12+.5*wave(t,11.4,19,.7);
   A.body.yaw+=.35*beat(t,11.6,12.4)*(1-beat(t,19,19.6));hearts.forEach((h,i)=>{h.s=beat(t,17+i*.5,17.7+i*.5);});
   // She remembers those words walking onto the pitch.
   A2.body.s=beat(t,19.4,20.2);A2.body.dx=-.6*(1-beat(t,19.6,22));mates.forEach((m,i)=>{m.body.s=beat(t,20.6+i*.4,21.4+i*.4);});brd.s=beat(t,21.8,22.8);
   // Open the three flaps: one per tap.
   const n=manual?act*3:0;const open=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,[27.1,28.5,30.3][i],[27.7,29.1,30.9][i])));words.forEach((f,i)=>{f.flip=-2.9*open[i];});
   cheer(A2,Math.max(open[2]*(1-beat(t,33,33.6)),manual?beat(act,.95,1):0));
   // Talent helps, but respect and discipline make you a player every coach wants.
   coach.s=beat(t,33.4,34.2);mates.forEach((m,i)=>cheer(m,beat(t,34.4+i*.3,35+i*.3)));cheer(gran,beat(t,35,35.6));cheer(A2,beat(t,35.4,36));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,18.8,19.6)+.45*beat(t,21,21.8)-.45*beat(t,32,33):0;
  };
 }};

/* ───────────── 3 · The best player in Canada (u20) ───────────── */
const u20:SpreadDef={id:'u20',rest:23.1,
 left:k=>{pitch(k,-5,0,'#9fcb7a','#79ab5e');box(k,-4.6,Z(-2.0),4.2,3.6,.05);ring(k,-2.5,Z(-.2),.6,.05);
  k.text('NIGERIA',-2.5,Z(2.62),.46,NG_GREEN,{max:4});k.text('FC ROBO · RIVERS ANGELS',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('CANADA · 2014',2.5,Z(2.62),.42,INK.red,{max:4.2});k.text('FIFA UNDER-20 WOMEN’S WORLD CUP',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'u-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe6b0',INK.orange,y=>.45-y/3*.35);lagosRow(k,4.5,2.1,3);palms(k,4.5,2.2);k.fill(rect(0,2.45,4.5,.55),'#9fcb7a');}},
   {key:K+'u-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.45,[NG_GREEN,INK.white,INK.red,INK.white],1);lightRig(k,1.0,.4);lightRig(k,3.6,.35);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const plane=bd.add(S.plane(K+'u-plane',.8,.36),'L',.3,1.2,{out:.035});const leaf=bd.add(mapleLeaf('u-leaf',.5),'R',3.9,.9,{out:.02});
  // Left page: the Nigerian clubs and, later, the African title.
  const clubs=[['FC ROBO',-3.9,-1.2],['RIVERS ANGELS',-1.6,-1.8]].map(([l,x,z],i)=>B.stand(S.sign(K+`u-club${i}`,1.4,1.2,l as string,i?INK.yellow:INK.white),x as number,z as number,{layer:1,s:0}));
  const A=B.person(K+'u-a',-2.6,.1,1.15,{shirt:'ger',...ASI,legs:'kick',face:'grin',layer:2});
  const mates=[[-4.2,.8,'short'],[-1.1,.6,'curly']].map(([x,z,hr],i)=>B.person(K+`u-m${i}`,x as number,z as number,1.05,{shirt:'ger',hair:hr as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%4],face:'grin',layer:2}));
  const cup=B.stand(S.trophy(K+'u-cup',.6,.9),-3.3,1.5,{layer:3,s:0});const afr=B.stand(lineCard('u-afr',1.7,.5,['AFRICAN CHAMPIONS'],NG_GREEN,INK.white),-1.6,1.75,{layer:3,s:0});
  // Right page: the tournament, seven goals, best player, second place.
  const goal=B.stand(S.goal(K+'u-goal',1.6,.85),2.5,-1.5,{layer:1});void goal;
  const keeper=B.person(K+'u-keeper',2.5,-1.25,1.2,{shirt:'keeper',hair:'long',hairColor:'#5a3b22',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const A2=B.person(K+'u-a2',1.6,.5,1.25,{shirt:'ger',...ASI,legs:'kick',face:'grin',layer:2});
  const tally=B.stand(S.scoreboard(K+'u-tally',1.3,1.1,'GOALS'),3.9,-.2,{layer:1,s:0});const seven=tally.add(lineCard('u-7',1.05,.46,['7 GOALS'],INK.yellow),0,.3,{z:.012});
  const golden=B.stand(S.goldenBall(K+'u-gb',.26),.8,-1.1,{layer:2,s:0});const best=B.stand(lineCard('u-best',1.4,.5,['BEST PLAYER'],INK.gold),1.0,1.5,{layer:3,s:0});
  const second=B.stand(S.flipCard(K+'u-2nd',1.2,.32,'NIGERIA · 2ND',INK.white,NG_GREEN),3.9,1.9,{layer:3,s:0});
  const boom=B.stand(pow('u-pow',.24),3.4,-1.45,{layer:2,s:0,tab:false});
  const ball=ballPair(B,'u-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.1):b.t;
   // Clubs in Nigeria: FC Robo and Rivers Angels.
   A.body.s=beat(t,2,2.8);clubs.forEach((c,i)=>{c.s=beat(t,3.4+i*1.8,4.2+i*1.8);});mates.forEach((m,i)=>{m.body.s=beat(t,4+i*.5,4.8+i*.5);});
   // To Canada in 2014.
   const fl=beat(t,8.4,12);plane.dx=3.6*fl;plane.dy=-.6*fl;plane.visible=fl>0&&fl<.98;leaf.scale=beat(t,11,12);leaf.visible=leaf.scale>.02;
   A2.body.s=beat(t,12,12.8);{const k=beat(t,12.6,13.4);keeper.body.scale=Math.max(.001,k);keeper.body.visible=k>.01;}tally.s=beat(t,14.8,15.6);seven.s=beat(t,15.8,16.6);
   // Seven goals, best player; Nigeria second.
   golden.s=beat(t,18,18.8);best.s=beat(t,18.6,19.4);second.s=beat(t,21,21.8);cheer(A2,beat(t,16.6,17.2)*(1-beat(t,19.6,20.2)));
   // Shoot at goal.
   const kick=Math.max(beat(t,23.5,24.6),manual?beat(act,0,.6):0);let bx=-2.2,bz=.3,dy=0,vis=t>2.4;
   if(t<8)[bx,bz]=[-2.2+.8*pulse(t,5,6.4),.3-.3*pulse(t,5,6.4)];else if(t>=12||manual){bx=2.0;bz=.6;if(kick>0){bx=2.0+1.0*kick;bz=.6-1.9*kick;dy=.3*Math.sin(kick*Math.PI);}}else vis=false;
   ball(bx,bz,dy,vis||manual);A2.leg!.rot=-1.1*Math.max(pulse(t,23.2,23.9),manual?pulse(act,0,.3):0);keeper.body.rot=.8*Math.max(pulse(t,23.8,25.4),manual?pulse(act,.1,.7):0);
   boom.s=Math.max(beat(t,24.4,24.7)*(1-beat(t,26,26.4)),manual?beat(act,.55,.7):0);cheer(A2,Math.max(beat(t,24.8,25.3)*(1-beat(t,27,27.6)),manual?beat(act,.8,1):0));
   // Months later: African champions.
   cup.s=beat(t,25.4,26.2);afr.s=beat(t,26,26.8);cheer(A,beat(t,26.6,27.2));mates.forEach((m,i)=>cheer(m,beat(t,27+i*.3,27.6+i*.3)));
   // Time your run.
   A2.body.dx=-.5*pulse(t,31,33.4);cheer(A2,beat(t,35,35.6));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,8,9)+.45*beat(t,12,12.8)-.45*beat(t,25,25.8):0;
  };
 }};

/* ───────────── 4 · Her parents became believers (believers) ───────────── */
const believers:SpreadDef={id:'believers',rest:22.0,
 left:k=>{floor(k,-5,0);k.fill(ell(-2.6,Z(.4),1.7,1.0),'#c9573f',.5);k.dots(ell(-2.6,Z(.4),1.7,1.0),INK.yellow,.06,.3);
  k.text('A BIG TALK',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('HER PARENTS LISTENED',-2.5,Z(2.9),.16,INK.red,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);ring(k,0,Z(.2),.9,.05);
  k.text('BELIEVERS',2.5,Z(2.62),.46,NG_GREEN,{max:4});k.text('THEY KNOW HER GAME',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3e3c0');k.dots(p,INK.orange,.05,.12);const w=rect(2.6,.4,1.2,1.0);k.fill(w,INK.sky2);k.dots(w,INK.blue,.04,.2);k.key(w,.012);for(let i=0;i<3;i++){const f=rect(.4+i*.62,.7,.46,.56);k.fill(f,[INK.yellow,INK.sky,INK.pink][i]);k.key(f,.01);}k.fill(rect(0,2.4,4.5,.6),'#e6c894');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.5,2.45,[BARCA_BLUE,BARCA_RED,NG_GREEN,INK.white],3);lightRig(k,1.0,.5);lightRig(k,3.6,.45);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'b-sun',.3),'L',3.9,1.4,{out:.012});
  // Left page: the talk, the listening, the TV.
  const mum=B.person(K+'b-mum',-3.9,.35,1.5,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:SKINS[1],face:'smile',layer:2});
  const dad=B.person(K+'b-dad',-3.0,.1,1.62,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:SKINS[0],face:'smile',layer:2});
  const A=B.person(K+'b-a',-1.6,.5,1.25,{shirt:'casual',...ASI,face:'open',layer:2});
  const dream=B.stand(bubble('b-dream',1.3,.66,'DREAMS!',INK.yellow),-1.0,-1.7,{layer:1,s:0,tab:false});
  const good=B.stand(lineCard('b-good',1.6,.5,['SOMETHING GOOD'],INK.white),-1.3,1.35,{layer:3,s:0});
  const ears=[0,1].map(i=>B.stand(bubble(`b-ear${i}`,.52,.46,'…',INK.sky2),-4.5+i*1.1,1.4,{layer:3,s:0,tab:false}));
  const believe=B.stand(lineCard('b-believe',1.9,.5,['WE BELIEVE IN YOU'],INK.pink,INK.white),-2.9,1.95,{layer:3,s:0});
  const tv=B.stand(tvSet('b-tv',.9,.8),-.7,-.4,{layer:2,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`b-h${i}`,.26),-4.4+i*.5,2.2,{layer:3,s:0,tab:false}));
  // Right page: grown-up Asisat on the pitch, the call.
  const A2=B.person(K+'b-a2',2.0,-.2,1.3,{shirt:'navy',...ASI,face:'grin',layer:2});
  const call=B.stand(bubble('b-call',1.0,.6,'RING!',INK.white),3.1,-1.2,{layer:1,s:0,tab:false});
  const tactic=B.stand(lineCard('b-know',1.5,.56,['WE SAW YOUR','RUN!'],INK.sky2),3.8,.5,{layer:2,s:0});
  const clock=B.stand(S.icon(K+'b-clock',.44,'tick'),4.3,1.6,{layer:3,s:0,tab:false});
  const mateR=B.person(K+'b-m',3.9,-1.0,1.2,{shirt:'navy',hair:'curly',hairColor:'#2a2220',skin:'#d99a6c',face:'grin',layer:1});
  // The phone travels across the gutter: one cut-out per page on a printed slot.
  B.slot(-2.4,1.3,1.8,1.3);
  const phL=B.stand(phone('b-phL',.34,.56),-1,1.3,{layer:3,tab:false}),phR=B.stand(phone('b-phR',.34,.56),1,1.3,{layer:3,tab:false});
  const phoneAt=(x:number,vis:boolean)=>{for(const [p,on] of [[phL,x<0],[phR,x>=0]] as const){p.visible=vis&&on;p.x=x;}};
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22):b.t;
   // A big talk with her parents.
   mum.body.s=beat(t,2.4,3.2);dad.body.s=beat(t,2.8,3.6);A.body.s=beat(t,3.4,4.2);
   // When young people follow their dreams, something good can come.
   dream.s=beat(t,7.3,8.1)*(1-beat(t,14,14.6));dream.dy=.05*wave(t,8,13,.5);A.armR.rot=.12+1.2*beat(t,7.6,8.2)*(1-beat(t,12.6,13.2));good.s=beat(t,10.4,11.2)*(1-beat(t,16.4,17));
   // Her parents listened.
   ears.forEach((e,i)=>{e.s=beat(t,13.1+i*.4,13.7+i*.4)*(1-beat(t,15.4,16));});mum.body.yaw=.25*pulse(t,13,15.4);dad.body.yaw=.25*pulse(t,13.2,15.4);
   // Today they believe in her.
   believe.s=beat(t,15.2,16);hearts.forEach((h,i)=>{h.s=beat(t,15.8+i*.4,16.5+i*.4);});
   // They call her and know her game before she tells them.
   A2.body.s=beat(t,17.2,18);mateR.body.s=beat(t,17.6,18.4);tv.s=beat(t,17.8,18.6);call.s=beat(t,18.6,19.4)*(1-beat(t,25,25.6));call.rot=.06*wave(t,19.4,22,3);tactic.s=beat(t,20,20.8);
   dad.armR.rot=.12+1.6*beat(t,20.2,20.8)*(1-beat(t,21.6,22));
   // Pass the phone to her parents: it slides along the slot from Asisat to her mum and dad.
   const pass=Math.max(beat(t,22.4,24.2),manual?beat(act,0,.8):0);phoneAt(1.6-3.8*pass,t>18.6||manual);
   cheer(mum,Math.max(beat(t,24.2,24.8)*(1-beat(t,26.6,27.2)),manual?beat(act,.85,1):0));A.body.s*=1-beat(t,18,18.8)*(1-beat(t,28,28.8));
   // People need time to understand: the sun rises.
   sun.dy=-.6*beat(t,24.5,28.5);clock.s=beat(t,25.4,26.2);
   // Talk calmly and kindly.
   cheer(A2,beat(t,30,30.6));cheer(dad,beat(t,31,31.6));cheer(mateR,beat(t,31.6,32.2));
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,16.8,17.6)+.45*beat(t,17.6,18.4)-.45*beat(t,22,22.6)-.45*beat(t,22.6,23.2)+.45*beat(t,28.4,29.2):0;
  };
 }};

/* ───────────── 5 · A long way from home (europe) ───────────── */
const europe:SpreadDef={id:'europe',rest:26.6,
 left:k=>{pitch(k,-5,0,'#7fb368','#5f9656');box(k,-4.6,Z(-2.0),4.2,3.6,.05);ring(k,-2.5,Z(-.2),.6,.05);
  k.text('LIVERPOOL · 2015',-2.5,Z(2.62),.42,LFC_RED,{max:4.2});k.text('FIRST AFRICAN PLAYER IN THE WSL',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05);box(k,1.3,Z(-2.0),2.5,1.0,.05);
  k.text('BARCELONA · 2019',2.5,Z(2.62),.4,INK.yellow,{max:4.2});k.text('2021 · CHAMPIONS LEAGUE WINNER',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'e-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ced9',INK.navy,y=>.3-y*.05);skyline(k,4.5,1.9,['#b6a79a','#c9b8a8','#a9998c']);crowd(k,4.5,1.9,2.45,[LFC_RED,INK.white,LFC_RED],2);k.fill(rect(0,2.45,4.5,.55),'#7fb368');}},
   {key:K+'e-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/3*.3);crowd(k,4.5,1.1,2.6,[BARCA_BLUE,BARCA_RED,INK.yellow,BARCA_BLUE],4);lightRig(k,1.1,.3);lightRig(k,3.5,.25);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const rain=bd.add(S.drops(K+'e-rain',1.4,.6),'L',1.4,.9,{out:.03});
  const fw=[bd.add(S.firework(K+'e-fw1',.36,BARCA_RED),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'e-fw2',.34,INK.yellow),'R',3.9,1.9,{out:.03})];
  const conf=bd.add(S.confetti(K+'e-conf',2.2,1.0,5),'R',1.1,1.3,{out:.04});
  // Left page: Liverpool, the knee, the comeback.
  const A=B.person(K+'e-a',-2.3,.2,1.25,{shirt:'casual',...ASI,legs:'kick',face:'grin',layer:2,holdL:'suitcase'});
  const first=B.stand(lineCard('e-first',1.8,.5,['FIRST AFRICAN PLAYER'],INK.gold),-1.3,-1.8,{layer:1,s:0});
  const sad=B.person(K+'e-sad',-3.9,.5,1.15,{shirt:'casual',...ASI,face:'sad',layer:2});
  const ice=B.stand(iceBag('e-ice',.5,.44),-3.3,1.0,{layer:3,s:0,tab:false});const cal=B.stand(S.flipCard(K+'e-2m',1.2,.32,'TWO MONTHS OUT',INK.sky,INK.navy),-3.9,1.7,{layer:3,s:0});
  const goalL=B.stand(S.goal(K+'e-goalL',1.4,.75),-3.6,-1.3,{layer:1});void goalL;
  const steps=([['REST',INK.sky],['REHAB',INK.yellow],['RETURN',INK.grass]] as const).map(([l,c],i)=>B.stand(stepBlock(`e-st${i}`,.8,.36+i*.18,l,c),-1.9+i*.8,1.55,{layer:3,s:0}));
  // Right page: Barcelona, the final goal, the 2021 trophy.
  const goalR=B.stand(S.goal(K+'e-goalR',1.7,.85),2.55,-1.5,{layer:1});void goalR;
  const keeper=B.person(K+'e-keeper',2.55,-1.2,1.25,{shirt:'keeper',hair:'long',hairColor:'#e0c070',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const A2=B.person(K+'e-a2',1.5,.4,1.3,{shirt:'navy',...ASI,legs:'kick',face:'grin',layer:2});
  const barca=B.stand(shirtBack('e-barca',.8,.8,BARCA_BLUE,BARCA_RED,'OSHOALA',''),.9,-1.3,{layer:1,s:0});
  const scored=B.stand(lineCard('e-scored',1.8,.56,['FIRST AFRICAN TO','SCORE IN A FINAL'],INK.yellow),3.95,-.45,{layer:2,s:0});
  B.slot(1.9,.3,3.1,-1.2);
  const cup=B.stand(S.trophy(K+'e-cup',.7,1.0),2.6,1.6,{layer:3,s:0});const y21=B.stand(S.flipCard(K+'e-2021',.9,.32,'2021',INK.pink),4.3,1.8,{layer:3,s:0});
  const mates=[[.5,-.3,'#d99a6c','short'],[.7,1.3,'#f1b88f','bun']].map(([x,z,sk,hr],i)=>B.person(K+`e-m${i}`,x as number,z as number,1.1,{shirt:'navy',hair:hr as 'short',hairColor:'#2a2220',skin:sk as string,face:'grin',layer:3}));
  const ball=ballPair(B,'e-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.6):b.t;
   // 2015: Liverpool, first African player in the WSL.
   A.body.s=beat(t,2.2,3);A.body.dx=-.8*(1-beat(t,2.4,4.4));first.s=beat(t,6.4,7.2);
   // She hurt her knee and missed two months; came back and kept scoring.
   const hurt=beat(t,10.4,11.2)*(1-beat(t,13.6,14.2));sad.body.s=hurt;A.body.s*=1-hurt;ice.s=hurt;cal.s=beat(t,11.4,12.2)*(1-beat(t,14,14.6));rain.scale=hurt;rain.visible=hurt>.02;
   const back=beat(t,13.8,14.6);let bx=-2.3,bz=.4,dy=0,vis=t>2.4&&hurt<.5;
   if(t>=14.2&&t<15.2){const u=(t-14.2);bx=-2.3-1.3*u;bz=.4-1.5*u;dy=.2*Math.sin(u*Math.PI);}else if(t>=15.2&&t<17){bx=-3.6;bz=-1.1;}
   A.leg!.rot=-1*pulse(t,13.9,14.5);cheer(A,back*(1-beat(t,16,16.6)));
   // 2019: Barcelona. The final: she scored.
   A2.body.s=beat(t,15.4,16.2);barca.s=beat(t,16,16.8);{const k=beat(t,18.6,19.4);keeper.body.scale=Math.max(.001,k);keeper.body.visible=k>.01;}scored.s=beat(t,23,23.8);
   // Slide the ball past the keeper.
   const kick=Math.max(beat(t,27,28.4),manual?beat(act,0,.7):0);
   if(t>=17||manual){vis=true;bx=1.9+1.2*kick;bz=.3-1.5*kick;dy=0;}
   ball(bx,bz,dy,vis);A2.leg!.rot=-1.1*Math.max(pulse(t,26.8,27.5),manual?pulse(act,0,.3):0);keeper.body.rot=.9*Math.max(pulse(t,27.2,29),manual?pulse(act,.1,.8):0);
   cheer(A2,Math.max(beat(t,28.4,29)*(1-beat(t,29.6,30)),manual?beat(act,.85,1):0));
   // 2021: Champions League winner.
   cup.s=beat(t,29.8,30.6);y21.s=beat(t,30.4,31.2);mates.forEach((m,i)=>{m.body.s=beat(t,30.2+i*.4,31+i*.4);const c=beat(t,31.4+i*.3,32+i*.3);if(i)cheer(m,c);else m.armL.rot=-.12-2.3*c;});cheer(A2,beat(t,31.6,32.2));
   fw.forEach((f,i)=>{const a=beat(t,31+i*.5,32+i*.5);f.scale=a;f.rot=t*.2;f.visible=a>.02;});conf.visible=t>31;conf.dy=-1.0+1.2*beat(t,31.2,33.6);
   // Rest, rehab, return.
   steps.forEach((s,i)=>{s.s=beat(t,36.4+i*1,37.1+i*1);});cheer(A,beat(t,39.2,39.8));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15,15.8)+.45*beat(t,15.8,16.6)-.45*beat(t,35.4,36.2)-.45*beat(t,36.2,37):0;
  };
 }};

/* ───────────── 6 · Helping the next girls (foundation) ───────────── */
const foundation:SpreadDef={id:'foundation',rest:23.4,
 left:k=>{dirt(k,-5,0,'#dcb886');footprints(k,-4.6,Z(1.1),-.4,Z(1.3),12,INK.brown);
  k.text('SIX TIMES',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('AFRICAN WOMEN’S FOOTBALLER OF THE YEAR',-2.5,Z(2.9),.14,NG_GREEN,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);
  k.text('FOOTBALL FOR GIRLS',2.5,Z(2.62),.38,INK.red,{max:4.3});k.text('LAGOS · 2019 · HER FOUNDATION',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe6b0',INK.orange,y=>.45-y/3*.35);lagosRow(k,4.5,2.4,1);k.fill(rect(0,2.4,4.5,.6),'#dcb886');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);palms(k,4.5,2.3);lagosRow(k,4.5,2.45,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'f-sun',.32),'R',3.9,1.6,{out:.012});const bunt=bd.add(S.bunting(K+'f-bunt',2.6,.4,[NG_GREEN,INK.white,INK.yellow,INK.pink]),'R',.8,2.4,{out:.03});
  // Left page: six awards; Barcelona shirts with her name back home.
  const cups=[0,1,2,3,4,5].map(i=>B.stand(S.trophy(K+`f-cup${i}`,.36,.54),-4.4+i*.62,-.7+(i%2)*.2,{layer:1,s:0}));
  const six=B.stand(goldCard('f-six',.7,.5,'×6'),-.8,-1.8,{layer:1,s:0});
  const A=B.person(K+'f-a',-.55,.9,1.3,{shirt:'ger',...ASI,face:'grin',layer:2});
  const fans=[[-4.3,1.2],[-3.3,1.6],[-2.2,1.3]].map(([x,z],i)=>B.stand(shirtBack(`f-fan${i}`,.72,.72,BARCA_BLUE,BARCA_RED,'OSHOALA',''),x,z,{layer:3,s:0}));
  const home=bd.add(bubble('f-home',1.3,.62,'REMEMBER HOME',INK.yellow),'L',2.4,1.5,{out:.03});
  // Right page: the foundation, the tournament, the shirts.
  const found=bd.add(lineCard('f-found',1.8,.56,['HER FOUNDATION','2019'],NG_GREEN,INK.white),'R',1.6,1.3,{out:.03});
  const goal=B.stand(S.goal(K+'f-goal',1.5,.8),3.6,-1.3,{layer:1,s:0});
  const A2=B.person(K+'f-a2',1.0,.3,1.3,{shirt:'casual',...ASI,face:'grin',layer:2});
  const kit=B.stand(shirtBox('f-box',.8,.5),1.4,1.3,{layer:3,s:0});
  const girls=[[2.5,.9,'bun'],[3.4,.5,'curly'],[4.3,.9,'long']].map(([x,z,hr],i)=>B.person(K+`f-g${i}`,x as number,z as number,.95,{shirt:'casual',hair:hr as 'short',hairColor:'#1d1512',skin:SKINS[(i+1)%4],face:'grin',layer:2}));
  const newShirts=girls.map((g,i)=>B.stand(shirtBack(`f-new${i}`,.46,.46,[INK.yellow,NG_GREEN,INK.pink][i],null,'',String(i+7)),1.4,1.6,{layer:3,s:0,tab:false}));
  const lift=B.stand(lineCard('f-lift',1.8,.44,['LIFT EVERYONE UP'],INK.gold),3.3,1.9,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'f-ball',.1),3.2,-.4,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.4):b.t;
   // Six awards.
   A.body.s=beat(t,2.2,3);cups.forEach((c,i)=>{c.s=beat(t,3.2+i*.55,3.8+i*.55);});six.s=beat(t,6.8,7.6);cheer(A,beat(t,7.4,8)*(1-beat(t,9,9.6)));
   // Barcelona shirts with her name back in Nigeria.
   fans.forEach((f,i)=>{f.s=beat(t,9.6+i*.6,10.3+i*.6);f.dy=.04*wave(t,10.4,15,.6+i*.2);});
   // 2019: a foundation and a girls' tournament in Lagos.
   found.scale=beat(t,15.4,16.2);found.visible=found.scale>.02;bunt.scale=beat(t,16,17);bunt.visible=bunt.scale>.02;A2.body.s=beat(t,16.4,17.2);goal.s=beat(t,17.4,18.2);
   girls.forEach((g,i)=>{g.body.s=beat(t,18.4+i*.5,19.2+i*.5);});ball.s=beat(t,20,20.8);ball.x=3.2+.6*pulse(t,21,22.6);ball.rot=-ball.x*5;kit.s=beat(t,21.6,22.4);
   // Hand out the new shirts: each flies from the box to a girl.
   const n=Math.max(manual?act*3:0,[0,1,2].reduce((s,i)=>s+beat(t,23.8+i*.6,24.4+i*.6),0));
   newShirts.forEach((sh,i)=>{const u=clamp01(n-i);sh.s=1;sh.visible=u>0;sh.scale=Math.max(.001,clamp01(u*6));sh.x=1.4+(girls[i].body.x-1.4)*u;sh.z=1.6+(girls[i].body.z+.35-1.6)*u;sh.dy=.5*Math.sin(u*Math.PI);cheer(girls[i],beat(u,.85,1));});
   A2.armR.rot=.12+1.4*Math.max(pulse(t,23.6,25.6),manual?pulse(act,0,1):0);
   // Remember where you come from.
   home.scale=beat(t,26,26.8);home.visible=home.scale>.02;sun.dy=.4*beat(t,26,30);
   // Lift everyone up.
   lift.s=beat(t,31.6,32.4);cheer(A2,beat(t,32.4,33));A.armR.rot=.12+2.2*beat(t,32.8,33.4);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15,15.8)+.45*beat(t,15.8,16.6)-.45*beat(t,30.6,31.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={street,grandma,u20,believers,europe,foundation};
void blob;
