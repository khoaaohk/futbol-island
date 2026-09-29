/**
 * The six Futbol Island pop-up spreads (the free starter book): original riso paper artwork of the island's real
 * places and activities, with narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/island/narration.json) and the
 * reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob,SKIN} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='island-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
/** Piecewise linear map (used to replay a narrated sequence from the reader's action). */
const lerpMap=(v:number,f:number[][]):number=>{if(v<=f[0][0])return f[0][1];for(let i=1;i<f.length;i++)if(v<f[i][0]){const a=f[i-1],b=f[i];return a[1]+(b[1]-a[1])*(v-a[0])/Math.max(1e-4,b[0]-a[0]);}return f[f.length-1][1];};
const pop=(t:number,a:number,d=.7)=>beat(t,a,a+d);
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const eye=(p:Person)=>[(151/320-.5)*p.h*320/512,p.h*(1-104/512)] as const;
type P2=[number,number];

/* ───────────── page print helpers ───────────── */
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
function seaPrint(k:Kit,x0:number,x1:number,y0=0,y1=PAGE_D){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,INK.sky);k.dots(p,INK.blue,.06,(x,y)=>.28+.14*Math.sin(x*2.1+y*2.7));
 for(let i=0;i<16;i++){const x=x0+.25+((i*37)%53)/53*(x1-x0-.6),y=y0+.25+((i*61)%47)/47*(y1-y0-.5);k.key(`M${x} ${y} Q${x+.08} ${y-.07} ${x+.16} ${y} Q${x+.24} ${y+.07} ${x+.32} ${y}`,.014,INK.white);}}
function grassPrint(k:Kit,x0:number,x1:number,y0=0,y1=PAGE_D,tone:string=INK.grass){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,tone,.85);k.dots(p,INK.leaf,.07,.16);}
function stripes(k:Kit,x0:number,x1:number,y0:number,y1:number,n=8){const h=(y1-y0)/n;for(let i=0;i<n;i++)if(i%2)k.dots(rect(x0,y0+i*h,x1-x0,h),INK.leaf,.055,.3);}
function pavePrint(k:Kit,x0:number,x1:number,y0:number,y1:number){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,'#e6dcc4');k.dots(p,'#a59a80',.06,.14);for(let x=Math.ceil(x0/.5)*.5;x<x1;x+=.5)k.key(`M${x} ${y0} L${x} ${y1}`,.008,'#b5a98d');}
function roadPrint(k:Kit,x0:number,x1:number,y:number,h:number){const p=rect(x0,y,x1-x0,h);k.fill(p,'#8c8a84');k.dots(p,'#56544f',.05,.28);k.key(`M${x0} ${y} L${x1} ${y} M${x0} ${y+h} L${x1} ${y+h}`,.035,INK.white);dash(k,x0,y+h/2,x1,y+h/2,.035,INK.yellow,.2);}
function chalk(k:Kit,d:string,w=.03){k.key(d,w,INK.white);}
/** The two printed caption lines at the foot of a page. */
function caption(k:Kit,x:number,big:string,small:string,color:string=INK.navy,sub:string=INK.navy,w=4.2){k.text(big,x,Z(2.62),.4,color,{max:w});k.text(small,x,Z(2.9),.15,sub,{weight:800,max:w});}
function manhole(k:Kit,x:number,y:number){k.fill(ell(x,y,.2,.12),'#6d6a64');k.key(ell(x,y,.2,.12),.012);k.key(ell(x,y,.12,.07),.01,INK.yellow);k.fill(ell(x,y,.05,.03),INK.white);}

/* ───────────── backdrop helpers ───────────── */
function sky(k:Kit,w:number,h:number,base:string=INK.sky2,dot:string=INK.sky){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>.7-y/h*.7);}
function seaBand(k:Kit,w:number,y0:number,y1:number){const s=rect(0,y0,w,y1-y0);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y0+.12+(i%2)*.14} l.22 0`,.012,INK.white);}
function hills(k:Kit,w:number,y:number,tone:string,seed=1){const d=`M0 ${y} Q${w*.2} ${y-.45-seed*.05} ${w*.42} ${y-.1} Q${w*.62} ${y-.5} ${w*.8} ${y-.15} Q${w*.92} ${y-.3} ${w} ${y-.05} L${w} ${y+.5} L0 ${y+.5} Z`;k.fill(d,tone);k.dots(d,INK.navy,.05,.2);k.key(d,.012);}
function roofs(k:Kit,x0:number,x1:number,y:number,seed=1){const cs=['#f0c273','#e78a86','#f2d895','#f6e4c0','#e9b9a0'];for(let x=x0,i=0;x<x1;i++){const w=.28+((i*7+seed)%3)*.08,h=.22+((i*5+seed)%4)*.07,b=rect(x,y-h,w,h);k.fill(b,cs[(i+seed)%cs.length]);k.key(b,.01);const r=poly([[x-.03,y-h],[x+w/2,y-h-.13],[x+w+.03,y-h]]);k.fill(r,INK.red);k.key(r,.01);k.fill(rect(x+w*.35,y-h*.6,w*.3,h*.3),INK.blue);x+=w+.04;}}
function palms(k:Kit,xs:number[],y:number){for(const x of xs){k.key(`M${x} ${y} Q${x+.05} ${y-.3} ${x+.02} ${y-.55}`,.035,INK.wood);for(let i=0;i<5;i++){const a=-Math.PI+i*Math.PI/4,x2=x+.02+Math.cos(a)*.3,y2=y-.55+Math.sin(a)*.12+.08;k.fill(`M${x+.02} ${y-.55} Q${(x+x2)/2} ${y-.75} ${x2} ${y2} Q${(x+x2)/2} ${y-.6} ${x+.02} ${y-.52} Z`,INK.leaf);}}}

/* ───────────── limbs and small riders (drawn straight onto a plate) ───────────── */
function limb(k:Kit,a:P2,b:P2,w:number,c:string){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.max(1e-4,Math.hypot(dx,dy)),nx=-dy/L*w/2,ny=dx/L*w/2;const p=poly([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]]);k.fill(p,c);k.circle(a[0],a[1],w/2,c);k.circle(b[0],b[1],w/2,c);k.key(p,.009);}
type KidPose={hip:P2;knee:P2;foot:P2;shoulder:P2;hand:P2;head:P2;shirt:string;skin:string;helmet:string};
function kid(k:Kit,o:KidPose){limb(k,o.hip,o.knee,.09,INK.navy);limb(k,o.knee,o.foot,.075,o.skin);k.keyFill(ell(o.foot[0]+.03,o.foot[1],.06,.03));
 limb(k,o.hip,o.shoulder,.19,o.shirt);limb(k,o.shoulder,o.hand,.075,o.shirt);k.circle(o.hand[0],o.hand[1],.04,o.skin);
 const [hx,hy]=o.head,r=.11;k.fill(ell(hx,hy,r,r),o.skin);k.key(ell(hx,hy,r,r),.012);
 const helm=`M${hx-r*1.1} ${hy-r*.05} Q${hx-r*1.05} ${hy-r*1.25} ${hx} ${hy-r*1.2} Q${hx+r*1.15} ${hy-r*1.15} ${hx+r*1.15} ${hy-r*.05} Z`;k.fill(helm,o.helmet);k.key(helm,.012);k.fill(rect(hx+r*.3,hy-r*.3,r*.9,r*.16),o.helmet);
 k.circle(hx+r*.45,hy+r*.12,.014,INK.navy,true);k.key(`M${hx+r*.2} ${hy+r*.5} Q${hx+r*.5} ${hy+r*.7} ${hx+r*.8} ${hy+r*.45}`,.01);k.dots(ell(hx+r*.1,hy+r*.45,r*.25,r*.15),INK.pink,.02,.8);}
const wheel=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.navy);k.fill(ell(r,r,r*.72,r*.72),INK.grey);k.dots(ell(r,r,r*.72,r*.72),INK.navy,.02,.2);for(let i=0;i<5;i++){const a=i/5*TAU;k.key(`M${r} ${r} L${r+Math.cos(a)*r*.7} ${r+Math.sin(a)*r*.7}`,.012);}k.circle(r,r,r*.2,INK.gold);},{rim:.012});
type RiderKind='scooter'|'bike'|'moped';
/** A ride with its rider; the wheels are separate brad plates so they can turn. */
const RIDERS:Record<RiderKind,{w:number;h:number;r:number;wheels:P2[]}>={scooter:{w:1.0,h:1.25,r:.11,wheels:[[.2,1.14],[.86,1.14]]},bike:{w:1.2,h:1.12,r:.2,wheels:[[.24,.92],[.96,.92]]},moped:{w:1.3,h:1.15,r:.15,wheels:[[.26,1.0],[1.05,1.0]]}};
const rider=(key:string,kind:RiderKind,body:string,shirt:string,skin:string,helmet:string)=>{const R=RIDERS[kind];return sp(key,R.w,R.h,k=>{const h=R.h;
 if(kind==='scooter'){const deck=rect(.16,h-.24,.66,.07);k.fill(deck,body);k.key(deck,.012);limb(k,[.84,h-.14],[.8,.5],.05,INK.navy);limb(k,[.7,.5],[.9,.48],.045,INK.navy);k.keyFill(rect(.14,h-.2,.06,.08));
  kid(k,{hip:[.47,.74],knee:[.52,.93],foot:[.5,h-.26],shoulder:[.56,.44],hand:[.78,.5],head:[.6,.27],shirt,skin,helmet});}
 else if(kind==='bike'){const bb:P2=[.54,h-.22],seat:P2=[.42,.5],head:P2=[.86,.48],[w1,w2]=R.wheels;for(const [a,b] of [[w1,bb],[bb,seat],[bb,head],[seat,head],[seat,w1],[head,w2]] as [P2,P2][])limb(k,a,b,.05,body);k.fill(rect(.33,.45,.2,.05),INK.navy);limb(k,[.84,.42],[.94,.38],.04,INK.navy);
  kid(k,{hip:[.44,.45],knee:[.62,.6],foot:[.56,h-.2],shoulder:[.62,.2],hand:[.88,.4],head:[.71,.11],shirt,skin,helmet});}
 else{const back=`M.08 ${h-.22} Q.04 .62 .3 .56 L.62 .56 Q.66 ${h-.3} .72 ${h-.26} L.86 ${h-.26} L.9 .5 L.98 .5 L1.02 ${h-.18} Q.6 ${h-.12} .08 ${h-.22} Z`;k.fill(back,body);k.dots(back,INK.red,.035,.3);k.key(back,.013);k.fill(rect(.16,.5,.42,.07),INK.navy);k.circle(1.0,.58,.05,INK.yellow);k.key(ell(1.0,.58,.05,.05),.01);limb(k,[.9,.5],[.9,.4],.04,INK.navy);limb(k,[.82,.4],[.98,.38],.04,INK.navy);
  kid(k,{hip:[.4,.48],knee:[.6,.56],foot:[.72,h-.3],shoulder:[.56,.22],hand:[.9,.4],head:[.62,.1],shirt,skin,helmet});}
});};

/* ───────────── book-specific plates ───────────── */
const sightCone=(key:string,len:number,spread:number)=>sp(key,spread,len,k=>{const c=spread/2,p=`M${c-.03} 0 L${c+.03} 0 L${spread} ${len*.88} Q${c} ${len} 0 ${len*.88} Z`;k.fill(p,INK.yellow);k.dots(p,INK.orange,.04,(x,y)=>.12+y/len*.45);
 k.key(`M${c} .03 L${spread*.97} ${len*.87} M${c} .03 L${spread*.03} ${len*.87}`,.012);},{rim:.02,grain:.6});
function cone(p:Person,key:string,len=1.5,spread=.66):Part{const [ex,ey]=eye(p);const q=p.body.arm(sightCone(key,len,spread),ex,ey,{z:-.01});q.scale=0;return q;}
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const jetpack=(key:string,w:number,h:number,color='#c68853')=>sp(key,w,h,k=>{const tw=w*.3;for(const x0 of [0,w-tw]){const t=`M${x0} ${h*.14} Q${x0} 0 ${x0+tw/2} 0 Q${x0+tw} 0 ${x0+tw} ${h*.14} L${x0+tw} ${h*.84} L${x0} ${h*.84} Z`;k.fill(t,color);k.dots(t,INK.orange,.03,x=>.15+(x-x0)/tw*.5);k.key(t,.012);const n=rect(x0+tw*.2,h*.84,tw*.6,h*.16);k.fill(n,INK.grey);k.key(n,.01);k.fill(rect(x0,h*.3,tw,h*.07),INK.navy);}
 k.fill(rect(tw*.9,h*.36,w-tw*1.8,h*.1),INK.navy);},{rim:.02});
const flame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const o=`M${w/2} ${h} Q${-w*.05} ${h*.45} ${w*.12} 0 L${w*.88} 0 Q${w*1.05} ${h*.45} ${w/2} ${h} Z`;k.fill(o,INK.orange);k.dots(o,INK.red,.03,.3);k.fill(`M${w/2} ${h*.72} Q${w*.2} ${h*.35} ${w*.3} 0 L${w*.7} 0 Q${w*.8} ${h*.35} ${w/2} ${h*.72} Z`,INK.yellow);k.key(o,.01);},{rim:.015,grain:.5});
const roofCourt=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=h*.34,b=rect(0,top,w,h-top);k.fill(b,'#e9b9a0');k.dots(b,INK.orange,.04,.18);k.fill(rect(w*.84,top,w*.16,h-top),INK.navy,.12);k.key(b,.014);
 for(let r=0;r<4;r++)for(let c=0;c<3;c++){const y=top+.14+r*.25;if(y+.15>h-.3)continue;const win=rect(w*(.1+c*.3),y,w*.2,.14);k.fill(win,(r+c)%3?INK.blue:INK.yellow);k.key(win,.009);}
 k.fill(rect(w*.4,h-.3,w*.2,.3),INK.navy);
 const court=poly([[w*.03,top],[w*.97,top],[w*.92,top-.12],[w*.08,top-.12]]);k.fill(court,INK.teal);k.key(court,.012);k.key(`M${w/2} ${top} L${w/2} ${top-.12}`,.01,INK.white);
 k.hatch(rect(0,top-.52,w,.4),INK.navy,.08,.78,.005);k.key(`M0 ${top} L0 ${top-.52} L${w} ${top-.52} L${w} ${top}`,.014);
 for(const gx of [w*.1,w*.76]){k.key(`M${gx} ${top-.1} L${gx} ${top-.32} L${gx+w*.14} ${top-.32} L${gx+w*.14} ${top-.1}`,.025,INK.white);}
 k.circle(w*.5,top-.17,.05,INK.white);k.key(ell(w*.5,top-.17,.05,.05),.008);});
const beachPitch=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const s=`M0 ${h} L0 ${h*.55} Q${w*.3} ${h*.4} ${w*.5} ${h*.48} Q${w*.75} ${h*.36} ${w} ${h*.5} L${w} ${h} Z`;k.fill(s,INK.sand);k.dots(s,INK.orange,.04,.3);k.key(s,.013);
 for(const gx of [w*.06,w*.8]){k.hatch(rect(gx,h*.12,w*.14,h*.36),INK.navy,.05,.78,.006);k.key(`M${gx} ${h*.5} L${gx} ${h*.12} L${gx+w*.14} ${h*.12} L${gx+w*.14} ${h*.5}`,.03,INK.white);}
 for(let i=0;i<5;i++){const x=w*(.25+i*.12);k.fill(poly([[x,h*.3],[x+.08,h*.36],[x,h*.42]]),i%2?INK.pink:INK.yellow);k.key(`M${x} ${h*.3} L${x} ${h*.55}`,.01);}});
const thought=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const c=blob([[w*.1,h*.1],[w*.5,0],[w*.9,h*.1],[w,h*.45],[w*.9,h*.75],[w*.5,h*.8],[w*.1,h*.75],[0,h*.45]]);k.fill(c,INK.white);k.key(c,.013);
 const p=rect(w*.14,h*.14,w*.72,h*.52);k.fill(p,INK.green);k.dots(p,INK.leaf,.03,.4);k.key(p,.01,INK.white);k.key(`M${w/2} ${h*.14} L${w/2} ${h*.66}`,.008,INK.white);k.key(ell(w/2,h*.4,h*.08,h*.08),.008,INK.white);
 for(const [x,y] of [[.3,.3],[.4,.55],[.62,.25],[.7,.5]])k.circle(w*x,h*y,.03,INK.pink);k.circle(w*.52,h*.44,.025,INK.white);
 k.circle(w*.2,h*.9,.04,INK.white);k.key(ell(w*.2,h*.9,.04,.04),.01);k.circle(w*.1,h*.98,.025,INK.white);},{rim:.02});
const wordCard=(key:string,w:number,h:number,word:string,color:string=INK.yellow,ink:string=INK.navy)=>S.flipCard(K+key,w,h,word,color,ink);

/* explore */
const cafe=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=h*.28,b=rect(0,top,w,h-top);k.fill(b,'#f2d895');k.dots(b,INK.orange,.04,.15);k.key(b,.014);
 const win=rect(w*.1,top+.34,w*.5,h*.3);k.fill(win,INK.sky);k.dots(win,INK.blue,.03,.5);k.key(win,.012);k.fill(rect(w*.68,top+.34,w*.2,h-top-.34),INK.navy);
 const n=6,aw=poly([[-.04,top+.3],[w+.04,top+.3],[w-.04,top+.05],[.04,top+.05]]);k.fill(aw,INK.white);for(let i=0;i<n;i+=2){k.fill(poly([[i*w/n-.04,top+.3],[(i+1)*w/n-.04,top+.3],[(i+1)*w/n-.03,top+.05],[i*w/n-.03,top+.05]]),INK.pink);}k.key(aw,.012);
 const sg=rect(w*.2,0,w*.6,top*.8);k.fill(sg,INK.navy);k.key(sg,.012);k.text('CAFÉ',w/2,top*.62,top*.46,INK.yellow,{max:w*.5});
 for(const x of [w*.18,w*.52]){k.fill(ell(x,h-.28,.12,.03),INK.white);k.key(ell(x,h-.28,.12,.03),.01);k.keyFill(rect(x-.015,h-.28,.03,.28));}});
const stall=(key:string,w:number,h:number,label:string,goods:string[],stripe:string=INK.green,aw0=.34)=>sp(key,w,h,k=>{const top=h*aw0,cy=h*.62;
 k.keyFill(rect(w*.04,top,.05,h-top),INK.brown);k.keyFill(rect(w*.96-.05,top,.05,h-top),INK.brown);
 const n=7,a0=Math.min(h*.12,.16),aw=poly([[-.05,top],[w+.05,top],[w-.02,a0],[.02,a0]]);k.fill(aw,INK.white);for(let i=0;i<n;i+=2)k.fill(poly([[i*w/n-.05,top],[(i+1)*w/n-.05,top],[(i+1)*w/n-.02,a0],[i*w/n-.02,a0]]),stripe);k.key(aw,.012);
 for(let i=0;i<n;i++){const x=i*w/n+w/n/2-.05;k.fill(`M${x-w/n/2} ${top} Q${x} ${top+.1} ${x+w/n/2} ${top} Z`,i%2?INK.white:stripe);}
 const sg=rect(w*.18,0,w*.64,a0);k.fill(sg,INK.yellow);k.key(sg,.012);k.text(label,w/2,a0*.78,a0*.6,INK.navy,{max:w*.6});
 const counter=rect(0,cy,w,h-cy);k.fill(counter,INK.wood);k.hatch(counter,'#8a5238',.04,.1,.008);k.key(counter,.014);
 goods.forEach((g,i)=>{const bx=w*(.06+i*(.88/goods.length)),bw=w*.88/goods.length-.04,box=rect(bx,cy-.14,bw,.16);k.fill(box,'#cf9b62');k.key(box,.01);for(let j=0;j<4;j++)k.circle(bx+bw*(.18+j*.21),cy-.15,.055,g);});});
const parcel=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,'#cf9b62');k.hatch(b,'#8a5238',.05,.3,.006);k.key(b,.014);k.fill(rect(w*.44,h*.2,w*.12,h*.8),INK.yellow);k.fill(ell(w/2,h*.62,w*.17,w*.17),INK.white);k.key(ell(w/2,h*.62,w*.17,w*.17),.012);k.keyFill(ell(w/2,h*.62,w*.06,w*.06));});
const lid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#b9774f');k.key(b,.012);k.fill(rect(w*.44,0,w*.12,h),INK.yellow);},{rim:.012});
const clueCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.2);k.key(b,.013);k.fill(rect(0,0,w,h*.28),INK.pink);k.text('BALL HUNT CLUE',w/2,h*.2,h*.14,INK.white,{max:w*.86});
 ['LOOK FOR A','FOOTBALL INSTEAD','OF FRUIT'].forEach((l,i)=>k.text(l,w/2,h*(.46+i*.17),h*.12,INK.navy,{max:w*.84}));
 k.key(ell(w*.82,h*.8,h*.07,h*.07),.018);k.key(`M${w*.82+h*.05} ${h*.85} L${w*.82+h*.12} ${h*.93}`,.02);},{rim:.018});

/* harvest */
const dock=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<5;i++){const x=w*(.05+i*.22);const p=rect(x,h*.18,.08,h*.82);k.fill(p,INK.wood);k.hatch(p,'#8a5238',.03,1.3,.008);k.key(p,.01);}
 const d=rect(0,0,w,h*.22);k.fill(d,'#cf9b62');for(let i=1;i<12;i++)k.key(`M${i*w/12} 0 L${i*w/12} ${h*.22}`,.008,'#8a5238');k.key(d,.013);
 const wv=`M0 ${h} L0 ${h*.62} Q${w*.1} ${h*.52} ${w*.2} ${h*.62} Q${w*.3} ${h*.72} ${w*.4} ${h*.62} Q${w*.5} ${h*.52} ${w*.6} ${h*.62} Q${w*.7} ${h*.72} ${w*.8} ${h*.62} Q${w*.9} ${h*.52} ${w} ${h*.62} L${w} ${h} Z`;k.fill(wv,INK.blue);k.dots(wv,INK.navy,.04,.3);k.key(wv,.012);});
const waterBack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M0 ${h} L0 ${h*.3} Q${w*.25} ${h*.1} ${w*.5} ${h*.3} Q${w*.75} ${h*.5} ${w} ${h*.3} L${w} ${h} Z`;k.fill(p,INK.sky);k.dots(p,INK.blue,.035,.45);k.key(p,.012);
 for(let i=0;i<3;i++)k.key(ell(w*(.3+i*.2),h*.62,w*.08,h*.08),.01,INK.white);});
const wavesFront=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=6;let d=`M0 ${h} L0 ${h*.4}`;for(let i=0;i<n;i++){const x0=i*w/n,x1=(i+1)*w/n;d+=` Q${(x0+x1)/2} ${-h*.2} ${x1} ${h*.4}`;}d+=` L${w} ${h} Z`;k.fill(d,INK.blue);k.dots(d,INK.navy,.035,.35);k.key(d,.012);for(let i=0;i<n;i++)k.key(`M${(i+.3)*w/n} ${h*.35} Q${(i+.5)*w/n} ${h*.1} ${(i+.7)*w/n} ${h*.35}`,.012,INK.white);},{rim:.015});
const bobber=(key:string,r:number)=>sp(key,r*2,r*3,k=>{k.key(`M${r} 0 L${r} ${r*.8}`,.012);const top=`M0 ${r*1.8} A${r} ${r} 0 0 1 ${r*2} ${r*1.8} Z`;k.fill(ell(r,r*1.8,r,r),INK.white);k.fill(top,INK.red);k.key(ell(r,r*1.8,r,r),.01);},{rim:.012});
const fish=(key:string,w:number,h:number,color:string=INK.teal)=>sp(key,w,h,k=>{const b=`M0 ${h/2} Q${w*.3} ${-h*.1} ${w*.75} ${h/2} Q${w*.3} ${h*1.1} 0 ${h/2} Z`;const t=poly([[w*.72,h/2],[w,h*.1],[w*.94,h/2],[w,h*.9]]);k.fill(t,color);k.key(t,.01);k.fill(b,color);k.dots(b,INK.navy,.03,.3);k.key(b,.012);k.circle(w*.14,h*.42,.022,INK.white);k.circle(w*.14,h*.42,.01,INK.navy,true);k.key(`M${w*.3} ${h*.3} Q${w*.36} ${h/2} ${w*.3} ${h*.7}`,.01);},{rim:.015});
const line=(key:string,len:number)=>sp(key,.024,len,k=>{k.key(`M.012 0 L.012 ${len}`,.012,INK.navy);},{rim:.006,grain:.3});
const rod=(key:string,len:number)=>sp(key,.07,len,k=>{const p=poly([[.02,0],[.05,0],[.06,len],[.01,len]]);k.fill(p,INK.brown);k.key(p,.008);k.fill(rect(0,len*.12,.07,len*.12),INK.navy);k.circle(.035,len*.3,.03,INK.grey);},{rim:.012});
const bucket=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=poly([[0,h*.2],[w,h*.2],[w*.88,h],[w*.12,h]]);k.fill(b,INK.blue);k.dots(b,INK.navy,.03,.3);k.key(b,.012);k.fill(ell(w/2,h*.2,w/2,h*.08),INK.navy);k.key(`M0 ${h*.2} Q${w/2} ${-h*.3} ${w} ${h*.2}`,.012,INK.grey);});
const vegBed=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const bed=rect(0,h*.55,w,h*.45);k.fill(bed,INK.wood);k.hatch(bed,'#8a5238',.04,.1,.008);k.key(bed,.013);k.fill(rect(0,h*.52,w,h*.08),INK.brown);
 const cols=[[INK.red,'straw'],[INK.red,'tom'],[INK.orange,'carrot']] as const;cols.forEach(([c,kind],i)=>{const x0=w*(.04+i*.33),x1=x0+w*.28;for(let j=0;j<3;j++){const x=x0+(x1-x0)*(j+.5)/3;
  if(kind==='carrot'){k.fill(poly([[x-.04,h*.55],[x+.04,h*.55],[x,h*.72]]),c);for(const a of [-.4,0,.4])k.key(`M${x} ${h*.55} L${x+a*.12} ${h*.2}`,.02,INK.leaf);}
  else if(kind==='tom'){k.key(`M${x} ${h*.55} L${x} ${h*.05}`,.015,INK.brown);k.fill(ell(x,h*.3,.1,.07),INK.leaf);k.circle(x-.05,h*.38,.045,c);k.circle(x+.04,h*.24,.04,c);}
  else{k.fill(ell(x,h*.45,.1,.07),INK.leaf);k.fill(`M${x-.03} ${h*.44} Q${x} ${h*.62} ${x+.03} ${h*.44} Z`,c);k.circle(x-.03,h*.48,.008,INK.yellow);}}});},{rim:.02});
const fruitDot=(key:string,r:number,color:string)=>sp(key,r*2,r*2.3,k=>{k.fill(ell(r,r*1.3,r,r),color);k.dots(ell(r,r*1.3,r,r),INK.red,.02,.25);k.key(ell(r,r*1.3,r,r),.01);k.fill(ell(r*1.4,r*.3,r*.45,r*.22),INK.leaf);},{rim:.012});
const basket=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=poly([[0,h*.3],[w,h*.3],[w*.85,h],[w*.15,h]]);k.fill(b,'#cf9b62');k.hatch(b,'#8a5238',.03,.7,.008);k.hatch(b,'#8a5238',.03,-.7,.008);k.key(b,.012);k.key(`M${w*.08} ${h*.3} Q${w/2} ${-h*.25} ${w*.92} ${h*.3}`,.02,INK.brown);});
const coin=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.gold);k.dots(ell(r,r,r,r),INK.orange,.02,.35);k.key(ell(r,r,r,r),.012);k.key(ell(r,r,r*.7,r*.7),.008,'#9b6a14');k.text('C',r,r*1.35,r*1.1,'#9b6a14');},{rim:.012});
const leafPile=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.orange,INK.red,INK.gold,INK.brown];const p=blob([[0,h],[w*.1,h*.5],[w*.4,h*.1],[w*.7,h*.2],[w*.95,h*.6],[w,h]]);k.fill(p,INK.orange);k.dots(p,INK.red,.03,.4);k.key(p,.012);
 for(let i=0;i<7;i++){const x=w*(.15+((i*37)%70)/100),y=h*(.35+((i*23)%50)/100);k.fill(ell(x,y,.05,.025),cs[i%4]);k.key(`M${x-.05} ${y} L${x+.05} ${y}`,.006);}});
const rake=(key:string,len:number)=>sp(key,.3,len,k=>{k.fill(rect(.13,0,.04,len-.08),INK.brown);k.key(rect(.13,0,.04,len-.08),.008);k.fill(rect(0,len-.1,.3,.05),INK.grey);for(let i=0;i<6;i++)k.key(`M${.02+i*.052} ${len-.05} L${.02+i*.052} ${len}`,.012);},{rim:.012});

/* arcade */
const ARC=[{name:'STRIKERS',color:'#ff65c8'},{name:'BREAKAWAY',color:'#60e9f2'},{name:'TENNIS',color:'#b991ff'},{name:'PINBALL',color:'#60e9f2'},{name:'PASS PUZZLES',color:'#ff65c8'}];
const cabinet=(key:string,w:number,h:number,color:string,name:string)=>sp(key,w,h,k=>{const b=poly([[w*.08,h*.14],[w*.92,h*.14],[w*.92,h*.6],[w,h*.7],[w,h],[0,h],[0,h*.7],[w*.08,h*.6]]);k.fill(b,INK.night);k.dots(b,INK.blue,.035,.3);k.key(b,.014);
 const mq=rect(0,0,w,h*.15);k.fill(mq,color);k.key(mq,.012);k.text(name,w/2,h*.11,h*.07,INK.navy,{max:w*.88});
 const scr=rect(w*.16,h*.2,w*.68,h*.36);k.fill(scr,'#101a36');k.key(scr,.012,color);
 const pan=poly([[0,h*.7],[w,h*.7],[w*.92,h*.6],[w*.08,h*.6]]);k.fill(pan,color);k.key(pan,.01);k.circle(w*.3,h*.65,.04,INK.navy,true);k.circle(w*.62,h*.65,.03,INK.yellow);k.circle(w*.75,h*.65,.03,INK.pink);
 k.fill(rect(w*.38,h*.8,w*.24,h*.05),INK.yellow);k.key(rect(w*.38,h*.8,w*.24,h*.05),.008);});
/** A cabinet screen: switched off, or showing its football game art. */
const screen=(key:string,w:number,h:number,kind:number|null,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,kind===null?'#1d2544':'#16305e');k.key(b,.01,color);
 if(kind===null){k.hatch(b,'#3a4a7a',.03,.2,.006);return;}
 const g=rect(w*.06,h*.12,w*.88,h*.76);k.fill(g,INK.green,.9);k.dots(g,INK.leaf,.025,.35);k.key(`M${w/2} ${h*.12} L${w/2} ${h*.88}`,.008,INK.white);
 if(kind===0){k.circle(w*.3,h*.55,.035,INK.pink);k.circle(w*.55,h*.35,.035,INK.pink);k.circle(w*.7,h*.6,.035,INK.sky);dash(k,w*.3,h*.55,w*.55,h*.35,.012,INK.yellow,.04);k.fill(rect(w*.9,h*.35,w*.05,h*.3),INK.white);}
 else if(kind===1){k.circle(w*.2,h*.5,.04,INK.yellow);for(const x of [.45,.62])k.fill(rect(w*x,h*.3,w*.06,h*.4),INK.pink);dash(k,w*.2,h*.5,w*.86,h*.5,.012,INK.white,.04);}
 else if(kind===2){k.key(`M${w*.08} ${h*.6} Q${w*.5} ${h*.05} ${w*.92} ${h*.6}`,.012,INK.yellow);k.fill(rect(w*.48,h*.45,w*.04,h*.43),INK.white);k.circle(w*.7,h*.35,.03,INK.white);}
 else if(kind===3){k.key(`M${w*.2} ${h*.8} L${w*.4} ${h*.7} M${w*.8} ${h*.8} L${w*.6} ${h*.7}`,.02,INK.yellow);for(const [x,y] of [[.3,.35],[.5,.25],[.7,.4]])k.key(ell(w*x,h*y,.04,.04),.012,INK.pink);k.circle(w*.55,h*.5,.025,INK.white);}
 else{for(const [x,y] of [[.2,.3],[.35,.7],[.6,.45]])k.circle(w*x,h*y,.03,INK.sky);for(const [x,y] of [[.45,.3],[.75,.65]])k.circle(w*x,h*y,.03,INK.pink);dash(k,w*.2,h*.3,w*.6,h*.45,.014,INK.yellow,.035);}},{rim:.01});
const neon=(key:string,w:number,h:number,lit:boolean)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.night);k.key(b,.014);k.text('ARCADE',w/2,h*.72,h*.56,lit?'#ff65c8':'#5a4a6a',{max:w*.9});if(lit){k.text('ARCADE',w/2,h*.72,h*.56,'#ffb3e4',{max:w*.9,onKey:true});for(let i=0;i<9;i++)k.circle(w*(.06+i*.11),h*.1,.025,i%2?'#60e9f2':INK.yellow);}},{rim:.02});
function glyph(k:Kit,kind:string,cx:number,cy:number,s:number){
 if(kind==='pack'){const p=rect(cx-s*.28,cy-s*.36,s*.56,s*.72);k.fill(p,INK.pink);k.key(p,.012);k.fill(rect(cx-s*.28,cy-s*.2,s*.56,s*.1),INK.yellow);k.fill(poly([[cx,cy-s*.02],[cx+s*.08,cy+s*.12],[cx,cy+s*.26],[cx-s*.08,cy+s*.12]]),INK.white);}
 else if(kind==='ball'){k.fill(ell(cx,cy,s*.32,s*.32),INK.white);k.key(ell(cx,cy,s*.32,s*.32),.012);k.keyFill(ell(cx,cy,s*.11,s*.11));}
 else if(kind==='scooter'||kind==='bike'||kind==='moped'){const c=kind==='scooter'?INK.pink:kind==='bike'?INK.blue:INK.orange;const r=s*(kind==='bike'?.16:.1);k.key(ell(cx-s*.26,cy+s*.2,r,r),.016);k.key(ell(cx+s*.26,cy+s*.2,r,r),.016);
  if(kind==='scooter'){k.fill(rect(cx-s*.26,cy+s*.12,s*.46,s*.05),c);k.key(`M${cx+s*.24} ${cy+s*.14} L${cx+s*.2} ${cy-s*.3} L${cx+s*.08} ${cy-s*.3}`,.02,c);}
  else if(kind==='bike')k.key(`M${cx-s*.26} ${cy+s*.2} L${cx-s*.04} ${cy+s*.2} L${cx-s*.1} ${cy-s*.1} L${cx+s*.2} ${cy-s*.1} L${cx+s*.26} ${cy+s*.2} M${cx-s*.04} ${cy+s*.2} L${cx+s*.2} ${cy-s*.1}`,.022,c);
  else{k.fill(`M${cx-s*.36} ${cy+s*.14} Q${cx-s*.36} ${cy-s*.1} ${cx-s*.1} ${cy-s*.1} L${cx+s*.1} ${cy+s*.1} L${cx+s*.2} ${cy-s*.25} L${cx+s*.28} ${cy+s*.14} Z`,c);k.key(`M${cx-s*.36} ${cy+s*.14} Q${cx-s*.36} ${cy-s*.1} ${cx-s*.1} ${cy-s*.1} L${cx+s*.1} ${cy+s*.1} L${cx+s*.2} ${cy-s*.25} L${cx+s*.28} ${cy+s*.14} Z`,.01);}}
 else if(kind==='jet'){for(const dx of [-.14,.14]){const t=rect(cx+s*dx-s*.1,cy-s*.3,s*.2,s*.46);k.fill(t,'#c68853');k.key(t,.01);k.fill(poly([[cx+s*dx-s*.08,cy+s*.18],[cx+s*dx+s*.08,cy+s*.18],[cx+s*dx,cy+s*.4]]),INK.orange);}}
 else if(kind==='fish'){const w=s*.7,h=s*.36,x=cx-w/2,y=cy-h/2;k.fill(`M${x} ${y+h/2} Q${x+w*.3} ${y-h*.1} ${x+w*.75} ${y+h/2} Q${x+w*.3} ${y+h*1.1} ${x} ${y+h/2} Z`,INK.teal);k.fill(poly([[x+w*.72,y+h/2],[x+w,y],[x+w,y+h]]),INK.teal);k.key(`M${x} ${y+h/2} Q${x+w*.3} ${y-h*.1} ${x+w*.75} ${y+h/2} Q${x+w*.3} ${y+h*1.1} ${x} ${y+h/2} Z`,.01);k.circle(x+w*.14,y+h*.42,.02,INK.navy,true);}
 else if(kind==='fruit'){k.fill(ell(cx,cy+s*.05,s*.28,s*.28),INK.orange);k.key(ell(cx,cy+s*.05,s*.28,s*.28),.012);k.fill(ell(cx+s*.12,cy-s*.26,s*.14,s*.07),INK.leaf);}
 else if(kind==='game'){const p=`M${cx-s*.36} ${cy} Q${cx-s*.36} ${cy-s*.2} ${cx-s*.16} ${cy-s*.2} L${cx+s*.16} ${cy-s*.2} Q${cx+s*.36} ${cy-s*.2} ${cx+s*.36} ${cy} Q${cx+s*.36} ${cy+s*.22} ${cx+s*.2} ${cy+s*.2} L${cx-s*.2} ${cy+s*.2} Q${cx-s*.36} ${cy+s*.22} ${cx-s*.36} ${cy} Z`;k.fill(p,INK.night);k.key(p,.01);k.key(`M${cx-s*.22} ${cy} L${cx-s*.1} ${cy} M${cx-s*.16} ${cy-s*.06} L${cx-s*.16} ${cy+s*.06}`,.016,INK.white);k.circle(cx+s*.14,cy-s*.03,s*.04,INK.pink);k.circle(cx+s*.22,cy+s*.05,s*.04,INK.yellow);}
 else if(kind==='quiz'){const p=rect(cx-s*.3,cy-s*.36,s*.6,s*.72);k.fill(p,INK.white);k.key(p,.012);k.text('?',cx,cy+s*.16,s*.5,INK.pink);}
 else if(kind==='book'){k.fill(poly([[cx-s*.36,cy-s*.2],[cx,cy-s*.1],[cx,cy+s*.3],[cx-s*.36,cy+s*.2]]),INK.yellow);k.fill(poly([[cx+s*.36,cy-s*.2],[cx,cy-s*.1],[cx,cy+s*.3],[cx+s*.36,cy+s*.2]]),INK.sky);k.key(`M${cx-s*.36} ${cy-s*.2} L${cx} ${cy-s*.1} L${cx+s*.36} ${cy-s*.2} L${cx+s*.36} ${cy+s*.2} L${cx} ${cy+s*.3} L${cx-s*.36} ${cy+s*.2} Z M${cx} ${cy-s*.1} L${cx} ${cy+s*.3}`,.012);k.fill(poly([[cx-s*.14,cy-s*.05],[cx-s*.04,cy-s*.32],[cx+s*.06,cy-s*.05]]),INK.pink);}
}
const medal=(key:string,s:number,kind:string,color:string,label?:string)=>sp(key,s,label?s*1.28:s,k=>{const r=s/2;k.fill(ell(r,r,r,r),color);k.dots(ell(r,r,r,r),INK.navy,.03,.16);k.key(ell(r,r,r,r),.014);k.fill(ell(r,r,r*.78,r*.78),INK.white);k.key(ell(r,r,r*.78,r*.78),.01);glyph(k,kind,r,r,s*.78);
 if(label){const b=rect(s*.02,s*1.0,s*.96,s*.26);k.fill(b,INK.navy);k.key(b,.01);k.text(label,r,s*1.19,s*.16,INK.white,{max:s*.9});}},{rim:.02});
const vending=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#d8342c');k.dots(b,'#8e1d18',.04,.22);k.key(b,.016);k.fill(rect(0,0,w,h*.12),'#ffd9c9');k.key(rect(0,0,w,h*.12),.012);k.text('VENDING',w/2,h*.09,h*.07,'#5a0f0b',{max:w*.8});
 const g=rect(w*.07,h*.16,w*.62,h*.56);k.fill(g,INK.sky2);k.dots(g,INK.sky,.03,.35);k.key(g,.014);
 const kinds=[['pack','pack','pack'],['ball','ball','book'],['scooter','bike','moped']];kinds.forEach((row,r)=>{const y=h*(.16+.56*(r+.5)/3);k.key(`M${w*.07} ${y+h*.085} L${w*.69} ${y+h*.085}`,.012,INK.grey);row.forEach((kd,c)=>glyph(k,kd,w*(.07+.62*(c+.5)/3),y,w*.17));});
 const pad=rect(w*.74,h*.2,w*.2,h*.3);k.fill(pad,INK.navy);k.key(pad,.012);for(let i=0;i<3;i++)for(let j=0;j<2;j++)k.circle(w*(.79+j*.1),h*(.26+i*.06),.02,INK.white);
 k.fill(rect(w*.78,h*.54,w*.12,h*.03),INK.night);k.text('COINS',w*.84,h*.61,h*.03,INK.white,{max:w*.18});
 const tray=rect(w*.12,h*.78,w*.5,h*.14);k.fill(tray,INK.night);k.key(tray,.012);});
const trayFlap=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#b52a23');k.dots(b,'#5a0f0b',.03,.3);k.key(b,.012);k.text('PUSH',w/2,h*.66,h*.4,'#ffd9c9',{max:w*.6});},{rim:.012});
const button=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.yellow);k.dots(ell(r,r,r,r),INK.orange,.02,.4);k.key(ell(r,r,r,r),.012);k.fill(ell(r*.8,r*.7,r*.3,r*.2),INK.white,.8);},{rim:.012});
const packPlate=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,h*.06],[w*.5,0],[w,h*.06],[w,h*.94],[w*.5,h],[0,h*.94]]);k.fill(p,INK.pink);k.dots(p,INK.navy,.03,.2);k.key(p,.013);k.fill(rect(0,h*.2,w,h*.14),INK.yellow);k.text('CARDS',w/2,h*.31,h*.1,INK.navy,{max:w*.8});k.fill(poly([[w/2,h*.44],[w*.62,h*.6],[w/2,h*.76],[w*.38,h*.6]]),INK.white);k.key(poly([[w/2,h*.44],[w*.62,h*.6],[w/2,h*.76],[w*.38,h*.6]]),.01);},{rim:.018});
const cardPlate=(key:string,w:number,h:number,color:string,shirt:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.key(b,.013);const f=rect(w*.1,h*.08,w*.8,h*.58);k.fill(f,INK.sky2);k.key(f,.01);k.fill(ell(w/2,h*.3,w*.16,w*.16),SKIN[1]);k.key(ell(w/2,h*.3,w*.16,w*.16),.01);k.fill(`M${w*.22} ${h*.66} Q${w*.22} ${h*.44} ${w/2} ${h*.44} Q${w*.78} ${h*.44} ${w*.78} ${h*.66} Z`,shirt);k.key(`M${w*.22} ${h*.66} Q${w*.22} ${h*.44} ${w/2} ${h*.44} Q${w*.78} ${h*.44} ${w*.78} ${h*.66} Z`,.01);
 k.fill(rect(w*.1,h*.72,w*.8,h*.08),INK.white);k.fill(rect(w*.1,h*.84,w*.5,h*.06),INK.white,.7);},{rim:.016});
const miniBook=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const L=poly([[0,h*.3],[w/2,h*.45],[w/2,h],[0,h*.85]]),R=poly([[w,h*.3],[w/2,h*.45],[w/2,h],[w,h*.85]]);k.fill(L,INK.yellow);k.fill(R,INK.sky);k.dots(L,INK.orange,.03,.3);k.key(L,.012);k.key(R,.012);
 const pop1=poly([[w*.2,h*.5],[w*.34,h*.05],[w*.48,h*.5]]);k.fill(pop1,INK.green);k.key(pop1,.01);k.fill(ell(w*.66,h*.3,w*.1,w*.1),INK.white);k.key(ell(w*.66,h*.3,w*.1,w*.1),.01);k.keyFill(ell(w*.66,h*.3,w*.035,w*.035));});
const bookCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.blue);k.dots(b,INK.navy,.03,.3);k.key(b,.012);k.text('POP-UP',w/2,h*.45,h*.22,INK.yellow,{max:w*.8});k.text('BOOK',w/2,h*.75,h*.22,INK.white,{max:w*.8});},{rim:.014});

/* learn */
const quizCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const bh=h*.86;k.keyFill(rect(w*.46,bh,w*.08,h-bh),INK.brown);const b=rect(0,0,w,bh);k.fill(b,INK.white);k.key(b,.016);k.fill(rect(0,0,w,h*.14),INK.blue);k.text('QUIZ · QUESTION 5 OF 5',w/2,h*.1,h*.065,INK.white,{max:w*.9});
 k.text('WHERE IS THE SPACE?',w/2,h*.21,h*.065,INK.navy,{max:w*.9});
 const p=rect(w*.06,h*.25,w*.88,h*.4);k.fill(p,INK.green);k.dots(p,INK.leaf,.035,.35);k.key(p,.012,INK.white);k.key(`M${w/2} ${h*.25} L${w/2} ${h*.65}`,.01,INK.white);k.key(ell(w/2,h*.45,h*.07,h*.07),.01,INK.white);
 for(const [x,y] of [[.3,.38],[.62,.52],[.42,.58]])k.circle(w*x,h*y,.05,INK.pink);k.circle(w*.2,h*.5,.05,INK.sky);
 ([['A',.36,.32],['B',.8,.42],['C',.7,.6]] as const).forEach(([l,x,y])=>{k.fill(ell(w*x,h*y,.085,.085),INK.yellow);k.key(ell(w*x,h*y,.085,.085),.012);k.text(l,w*x,h*y+.045,.12,INK.navy);});
 const a=rect(w*.05,h*.67,w*.9,h*.17);k.fill(a,INK.stone);k.key(a,.01);});
const answerFlap=(key:string,w:number,h:number,front:boolean)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,front?INK.pink:INK.grass);k.dots(b,INK.navy,.03,.2);k.key(b,.013);
 if(front){k.text('TAP TO CHECK',w/2,h*.64,h*.36,INK.white,{max:w*.86});}else{k.key(`M${w*.12} ${h*.5} L${w*.22} ${h*.72} L${w*.34} ${h*.28}`,.05,INK.white);k.text('B · CORRECT!',w*.62,h*.66,h*.36,INK.white,{max:w*.58});}},{rim:.016});
const cardBack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.navy);k.dots(b,INK.blue,.035,.4);k.key(b,.013);k.fill(ell(w/2,h/2,w*.3,w*.3),INK.white);k.key(ell(w/2,h/2,w*.3,w*.3),.012);k.text('?',w/2,h/2+w*.12,w*.36,INK.pink);},{rim:.016});
const signpost=(key:string,h:number)=>sp(key,.12,h,k=>{const p=rect(.03,0,.06,h);k.fill(p,INK.wood);k.hatch(p,'#8a5238',.03,1.3,.008);k.key(p,.01);k.circle(.06,.04,.04,INK.gold);},{rim:.015});
const arrowSign=(key:string,w:number,h:number,label:string,color:string,left=false)=>sp(key,w,h,k=>{const p=left?poly([[0,h/2],[w*.16,0],[w,0],[w,h],[w*.16,h]]):poly([[0,0],[w*.84,0],[w,h/2],[w*.84,h],[0,h]]);k.fill(p,color);k.dots(p,INK.navy,.03,.18);k.key(p,.012);k.text(label,left?w*.58:w*.44,h*.72,h*.56,INK.white,{max:w*.7});},{rim:.016});
const lessonStack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<4;i++){const b=rect(w*.04+i*.02,h*(.5-i*.1),w*.9,h*.46);k.fill(b,[INK.sky,INK.yellow,INK.pink,INK.white][i]);k.key(b,.012);}k.text('12',w*.52,h*.3,h*.26,INK.navy);k.text('CORE LESSONS',w*.52,h*.4,h*.08,INK.navy,{max:w*.8});},{rim:.016});
const whistle=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w*.1} ${h*.2} Q${w*.3} ${h*.6} ${w*.45} ${h*.6}`,.012,INK.navy);const b=`M${w*.4} ${h*.45} L${w*.9} ${h*.45} L${w*.9} ${h*.62} Q${w*.9} ${h*.95} ${w*.62} ${h*.95} Q${w*.4} ${h*.95} ${w*.4} ${h*.7} Z`;k.fill(b,INK.grey);k.key(b,.012);for(let i=0;i<3;i++)k.key(`M${w*(.92+i*.03)} ${h*(.3-i*.1)} l${w*.06} ${-h*.08}`,.014,INK.pink);},{rim:.015});

/* together */
const valueCards:[string,string][]=[['LOOK UP',INK.yellow],['FIND SPACE',INK.sky],['BE PATIENT',INK.grass],['TRY AGAIN',INK.pink]];

/* ───────────── shared mechanics ───────────── */
/** Two ball cut-outs (one per page) share one trajectory so a pass can cross the gutter. */
function ballPair(B:Builder,key:string,r=.13){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
/** Arms up in celebration with a small wave. */
function cheer(p:Person,up:number,t:number,a=0,b=0,hz=1.4){p.armL.rot=-.12-2.3*up-.25*wave(t,a,b,hz);p.armR.rot=.12+2.3*up+.25*wave(t,a,b,hz*1.1);}

/* ───────────── 1 · A flying start (welcome) ───────────── */
const W_PX=-1.15,W_PZ=1.15,W_PY=.34,W_L=2.4,W_AY=.72,W_TH0=-1.41;
const welcome:SpreadDef={id:'welcome',rest:18.6,
 left:k=>{seaPrint(k,-5,0);const land=blob([[-4.7,1.0],[-3.2,.35],[-1.2,.45],[.2,.3],[.2,5.3],[-1.6,5.5],[-3.6,5.2],[-4.75,3.6]]);k.fill(land,INK.grass,.9);k.dots(land,INK.leaf,.06,.2);k.key(land,.02,INK.sand);
  const tn=rect(-4.4,.8,3.9,1.4);k.fill(tn,INK.stone);k.dots(tn,'#a59a80',.05,.2);for(let x=-4.2;x<-.6;x+=.7)k.key(`M${x} .8 L${x} 2.2`,.012,'#a59a80');
  const pad=ell(-3.5,Z(1.35),.5,.26);k.fill(pad,INK.yellow);k.dots(pad,INK.orange,.04,.4);k.key(pad,.03,INK.navy);k.text('TAKE OFF',-3.5,Z(1.43),.14,INK.navy);
  caption(k,-2.5,'FUTBOL ISLAND','LOOK UP · SEE THE WHOLE PITCH',INK.blue,INK.navy,4.3);},
 right:k=>{seaPrint(k,0,5);const land=blob([[-.2,.3],[1.8,.4],[3.8,.6],[4.7,1.4],[4.7,4.2],[3.6,5.4],[1.4,5.5],[-.2,5.3]]);k.fill(land,INK.grass,.9);k.dots(land,INK.leaf,.06,.2);k.key(land,.02,INK.sand);
  const beachP=blob([[3.1,.7],[4.6,1.1],[4.8,2.4],[3.4,2.2]]);k.fill(beachP,INK.sand);k.dots(beachP,INK.orange,.05,.25);
  for(const [x,y,w,h] of [[.45,2.6,1.2,.8],[1.9,3.0,1.25,.85],[3.3,2.6,1.3,.95]]){const f=rect(x,y,w,h);k.fill(f,INK.green,.9);stripes(k,x,x+w,y,y+h,4);chalk(k,f,.02);chalk(k,`M${x+w/2} ${y} L${x+w/2} ${y+h}`,.015);chalk(k,ell(x+w/2,y+h/2,.12,.12),.015);}
  caption(k,2.5,'PITCHES EVERYWHERE','FUTSAL · BEACH · 7v7 · 9v9 · 11v11',INK.pink,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{sky(k,4.5,3);seaBand(k,4.5,1.9,2.4);hills(k,4.5,2.35,'#b9c98a',1);roofs(k,.2,4.3,2.55,1);k.fill(rect(0,2.6,4.5,.4),INK.grass);k.key('M0 2.6 L4.5 2.6',.012);}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3);seaBand(k,4.5,1.8,2.5);hills(k,4.5,2.4,INK.leaf,2);palms(k,[3.1,3.5,4.0],2.55);k.fill(rect(0,2.6,4.5,.4),INK.sand);k.key('M0 2.6 L4.5 2.6',.012);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'w-sun',.34),'R',3.5,1.35,{out:.012}),cloud=bd.add(S.cloud(K+'w-cloud',1.0,.42),'L',3.2,2.55),cloud2=bd.add(S.cloud(K+'w-cloud2',.8,.34),'R',1.6,2.7),birds=bd.add(S.birds(K+'w-birds',.8,.3),'R',2.4,2.2,{out:.02});
  const ferry=bd.add(sp('w-ferry',.8,.36,k=>{const w=.8,h=.36,hull=poly([[0,h*.55],[w,h*.55],[w*.86,h],[w*.1,h]]);k.fill(hull,INK.navy);k.fill(rect(0,h*.55,w,h*.1),INK.red);const cab=rect(w*.2,h*.22,w*.55,h*.33);k.fill(cab,INK.white);k.key(cab,.01);for(let i=0;i<4;i++)k.fill(rect(w*(.25+i*.12),h*.3,w*.07,h*.1),INK.blue);k.key(hull,.012);},{rim:.02}),'R',1.0,.72,{out:.02});
  const banner=bd.add(S.banner(K+'w-ban',3.3,.42,'WELCOME TO FUTBOL ISLAND',INK.blue),'L',2.05,2.0,{out:.03});
  B.stand(S.cityBlock(K+'w-city',1.35,1.9),-3.95,-1.3,{layer:1});
  B.stand(S.house(K+'w-house',1.0,1.2),-2.75,-1.75,{layer:1});
  const roof=B.stand(roofCourt('w-roof',1.4,1.8),-1.45,-1.5,{layer:1});const futsal=roof.add(wordCard('w-futsal',.8,.3,'FUTSAL',INK.teal,INK.white),-.75,2.12,{z:.03,anchor:'center'});
  B.stand(S.tree(K+'w-palmL',.9,1.4,'palm'),-4.6,-.35,{layer:2});
  const beachS=B.stand(beachPitch('w-beach',1.7,.75),3.75,-1.2,{layer:1});const beachC=beachS.add(wordCard('w-beachC',.75,.3,'BEACH',INK.sand,INK.navy),0,1.0,{z:.03,anchor:'center'});
  B.stand(S.tree(K+'w-palmR',.9,1.5,'palm'),4.6,-.35,{layer:2});B.stand(S.tree(K+'w-tree',.9,1.3,'round'),1.4,-1.75,{layer:1});
  const fields=[['7v7',1.05,-.55,INK.yellow],['9v9',2.52,-.15,INK.sky],['11v11',3.95,-.55,INK.pink]].map(([l,x,z,c],i)=>B.stand(wordCard(`w-fc${i}`,.62,.3,l as string,c as string,INK.navy),x as number,z as number,{layer:2,s:0}));
  const F1=B.person(K+'w-f1',-4.3,.55,1.12,{shirt:'bib',hair:'curly',skin:SKIN[3],face:'grin',layer:2});
  const F2=B.person(K+'w-f2',4.1,1.35,1.18,{shirt:'fan',hair:'bun',skin:SKIN[1],legs:'kick',face:'smile',layer:3});
  const P10=B.person(K+'w-p10',1.55,1.3,1.24,{shirt:'navy',hair:'short',skin:SKIN[2],number:'10',face:'smile',layer:3});
  const look=cone(P10,'w-look',1.3,.55),idea=P10.body.add(thought('w-idea',1.25,1.0),.75,P10.h*1.02,{z:-.02});idea.scale=0;
  const ball=B.stand(S.ball(K+'w-ball',.12),3.7,1.45,{layer:3,tab:false});
  const post=B.stand(S.post(K+'w-post',.12,.34),W_PX,W_PZ,{layer:3});const strip=post.arm(S.strip(K+'w-strip',.08,W_L+.1),0,W_PY,{z:.02});
  const H=B.person(K+'w-hero',W_PX,W_PZ+.06,1.2,{shirt:'casual',hair:'cap',skin:SKIN[1],face:'grin',layer:3});
  const pack=H.body.add(jetpack('w-pack',.5,.52),0,H.h*.6,{z:-.014,anchor:'center'});void pack;
  const flames=[-.175,.175].map((x,i)=>{const f=H.body.add(flame(`w-flame${i}`,.12,.3),x,H.h*.6-.27,{z:-.016,anchor:'top'});f.scale=0;return f;});
  const sight=cone(H,'w-sight',1.9,.9);
  B.slot(-2.7,2.0,-1.35,2.0);const tab=B.stand(wordCard('w-tab',.5,.26,'PULL',INK.pink,INK.white),-2.7,2.0,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.6):b.t;
   sun.dy=.5*beat(t,0,1.9);cloud.dx=-.7*beat(t,0,36);cloud2.dx=.5*beat(t,0,36);birds.dx=-1.2*beat(t,1,20);birds.dy=.06*wave(t,1,20,.8);ferry.dx=1.8*beat(t,3,30);ferry.dy=.02*wave(t,3,30,1.1);
   banner.scale=pop(t,1.95,.8);banner.visible=banner.scale>.02;banner.dy=.03*wave(t,2.8,36,.5);
   cheer(F1,beat(t,2.2,2.7)*(1-beat(t,4.2,4.8))+beat(t,32.4,33)*1,t,2.7,36,1.3);
   // Flight on the swing strip: zoom over the rooftops, land, then the pull-cord take-off.
   const pull=manual?beat(act,0,.3):beat(t,18.9,19.8),launch=manual?beat(act,.22,1):beat(t,19.6,21.6);
   let th=track(t,[[4.4,W_TH0],[6.6,-.25],[8.6,.55],[12.6,.2],[16.2,-.3],[18.3,W_TH0]])[0];
   if(t>=18.3||manual)th=W_TH0+(0-W_TH0)*launch+.08*wave(t,22,36,.35);
   strip.rot=Math.PI-th;H.body.dx=Math.sin(th)*W_L;H.body.dy=Math.max(0,W_PY+Math.cos(th)*W_L-W_AY);
   const flying=clamp01(H.body.dy/.25);H.body.rot=-.18*Math.sin(th)*flying;
   flames.forEach((f,i)=>{f.scale=flying*(.85+.15*Math.sin(t*23+i*2));f.visible=f.scale>.03;});
   H.armL.rot=-.12-1.1*flying-.9*beat(t,32.4,33);H.armR.rot=.12+1.1*flying+.9*beat(t,32.4,33)+.3*wave(t,2.2,4.4,1.5);
   tab.x=-2.7+1.3*pull;
   sight.scale=beat(t,22.1,22.8)*(1-beat(t,25.3,25.9));sight.rot=track(t,[[22.1,-.35],[23.8,.55],[25.3,.2]])[0];
   futsal.scale=pop(t,10.4,.6);futsal.visible=futsal.scale>.02;beachC.scale=pop(t,12.9,.6);beachC.visible=beachC.scale>.02;
   fields.forEach((f,i)=>{f.s=pop(t,[15.6,16.4,17.1][i],.6);});
   // Good footballers: the pass is coming, so the number 10 looks up and pictures the pitch first.
   const lk=-.6*pulse(t,26,27.2)+.6*pulse(t,27.2,28.4);P10.body.yaw=lk;look.scale=clamp01(Math.abs(lk)/.35);look.rot=lk<0?4.2:2.05;
   idea.scale=beat(t,28.3,29)*(1-beat(t,31.8,32.3));idea.visible=idea.scale>.02;
   F2.leg!.rot=-1.0*pulse(t,28.6,29.2);const bu=beat(t,28.9,30.4);ball.x=3.7-2.0*bu;ball.z=1.45-.05*bu;ball.rot=-ball.x*5;
   P10.armR.rot=.12+.5*beat(t,29.6,30.1)+2.1*beat(t,32.4,33);P10.armL.rot=-.12-2.1*beat(t,32.4,33);F2.armL.rot=-.12-2.2*beat(t,32.6,33.2);F2.armR.rot=.12+.4*beat(t,29.3,29.9);
   return b.narrated?-.35*beat(t,18.6,19.4)+.35*beat(t,25.4,26)+.55*beat(t,25.8,26.6)-.55*beat(t,32,32.6):manual?-.3*beat(act,0,.2):0;
  };
 }};

/* ───────────── 2 · Ride around the town (explore) ───────────── */
type Ride={piece:ReturnType<Builder['stand']>;wheels:Part[];r:number;x0:number;park:number;end:number;enter:number;ride:number[]};
const explore:SpreadDef={id:'explore',rest:17.7,
 left:k=>{pavePrint(k,-5,0,0,3.35);roadPrint(k,-5,0,Z(.25),1.55);k.fill(rect(-5,Z(2.05),5,PAGE_D-Z(2.05)),'#e6dcc4');
  for(let i=0;i<6;i++)k.fill(rect(-1.05,Z(.3)+i*.26,.5,.14),INK.white,.9);
  manhole(k,-3.3,Z(-.6));manhole(k,-1.6,Z(2.25));
  caption(k,-2.5,'BALL HUNT','80 HIDDEN MATCHDAY BALLS · EACH ONE TEACHES A TIP',INK.pink,INK.navy,4.3);},
 right:k=>{pavePrint(k,0,5,0,3.35);roadPrint(k,0,5,Z(.25),1.55);k.fill(rect(0,Z(2.05),5,PAGE_D-Z(2.05)),'#e6dcc4');
  manhole(k,3.2,Z(-.5));manhole(k,1.2,Z(2.25));
  caption(k,2.5,'RIDE AND EXPLORE','SCOOTER · BIKE · MOPED',INK.blue,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'e-bdL',w:4.5,h:3,paint:k=>{sky(k,4.5,3);hills(k,4.5,1.9,'#b9c98a',1);roofs(k,.1,4.4,2.35,2);roofs(k,.3,4.3,2.62,4);k.fill(rect(0,2.6,4.5,.4),INK.stone);k.key('M0 2.6 L4.5 2.6',.012);}},
   {key:K+'e-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3);seaBand(k,4.5,1.75,2.3);const pier=rect(2.4,1.95,1.9,.1);k.fill(pier,INK.wood);k.key(pier,.01);for(let i=0;i<6;i++)k.keyFill(rect(2.5+i*.35,2.05,.05,.25),INK.brown);roofs(k,.1,2.2,2.62,3);k.fill(rect(0,2.6,4.5,.4),INK.stone);k.key('M0 2.6 L4.5 2.6',.012);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'e-sun',.3),'R',3.7,1.5,{out:.012}),cloud=bd.add(S.cloud(K+'e-cloud',.9,.38),'L',2.8,2.5);
  const bunt=bd.add(S.bunting(K+'e-bunt',3.6,.4,[INK.pink,INK.yellow,INK.sky,INK.green]),'L',.4,1.2,{out:.03});
  const house=B.stand(S.house(K+'e-house',1.1,1.4),-4.15,-1.3,{layer:1});const door=house.flap(S.door(K+'e-door',.2,.34),-.02,.36,{anchor:'top',axis:'y'});
  B.stand(S.cityBlock(K+'e-city',1.2,1.8),-2.75,-1.7,{layer:1});
  const cafeS=B.stand(cafe('e-cafe',1.3,1.5),-1.25,-1.55,{layer:1});
  const stallS=B.stand(stall('e-stall',1.5,1.35,'MARKET',[INK.orange,INK.red,INK.yellow]),1.35,-1.5,{layer:1});
  B.stand(S.tree(K+'e-tree',.95,1.5,'round'),2.85,-1.8,{layer:1});
  B.stand(S.house(K+'e-house2',1.05,1.35),4.1,-1.3,{layer:1});
  const bush=B.stand(S.bush(K+'e-bush',.8,.4),-3.95,-.55,{layer:2});
  B.stand(S.lamp(K+'e-lamp',.35,1.5),-.25,-1.0,{layer:1});B.stand(S.lamp(K+'e-lamp2',.35,1.5),4.65,-.4,{layer:2});
  const hid=[bush.add(S.ball(K+'e-hb1',.1),.12,.2,{z:-.01,anchor:'center'}),stallS.add(S.ball(K+'e-hb2',.09),.35,.62,{z:.02,anchor:'center'}),cafeS.add(S.ball(K+'e-hb3',.09),-.28,.36,{z:.02,anchor:'center'})];
  const box=B.stand(parcel('e-parcel',.5,.42),.45,-.3,{layer:2});const boxLid=box.flap(lid('e-lid',.54,.1),0,.34,{anchor:'bottom',z:.015});const found=box.add(S.ball(K+'e-found',.12),0,.34,{z:-.008,anchor:'bottom'});found.scale=0;
  const clue=B.stand(sp('e-clueStand',.08,.9,k=>{k.fill(rect(0,0,.08,.9),INK.wood);k.key(rect(0,0,.08,.9),.01);}),2.95,-.55,{layer:2});const clueC=clue.add(clueCard('e-clue',1.05,.72),0,.85,{anchor:'bottom',z:.02});clueC.scale=0;
  const tip=B.stand(S.bubble(K+'e-tip',.6,.5,'star'),3.45,-.35,{layer:2,s:0});
  const counter=B.stand(S.scoreboard(K+'e-count',.95,.9,'BALLS FOUND'),4.2,-.7,{layer:2});counter.add(wordCard('e-c1',.7,.34,'1 / 80',INK.pink,INK.white),0,.28,{z:.012});const cnt0=counter.flap(wordCard('e-c0',.7,.34,'0 / 80',INK.blue,INK.white),0,.62,{z:.026});
  const gaps=[B.stand(wordCard('e-gap1',.62,.28,'SPACE'),-3.25,-1.35,{layer:2,s:0}),B.stand(wordCard('e-gap2',.62,.28,'SPACE'),2.2,-1.35,{layer:2,s:0})];
  const kidW=B.person(K+'e-kid',1.25,-.05,1.12,{shirt:'fan',hair:'long',skin:SKIN[0],face:'smile',layer:2});const kL=cone(kidW,'e-kL',1.2,.55),kR=cone(kidW,'e-kR',1.2,.55);kL.rot=4.4;kR.rot=1.88;
  const mk=(key:string,kind:RiderKind,x0:number,z:number,body:string,shirt:string,skin:string,helmet:string,park:number,end:number,enter:number,ride:number[]):Ride=>{const R=RIDERS[kind];const piece=B.stand(rider(key,kind,body,shirt,skin,helmet),x0,z,{layer:3,tab:false});
   const wheels=R.wheels.map(([wx,wy],i)=>piece.add(wheel(`${key}-w${i}`,R.r),wx-R.w/2,R.h-wy,{z:.012,anchor:'center'}));B.slot(x0,z+.05,x0+end,z+.05);return {piece,wheels,r:R.r,x0,park,end,enter,ride};};
  const rides=[mk('e-scoot','scooter',-4.35,.62,INK.pink,INK.yellow,SKIN[1],INK.blue,1.3,3.55,2.2,[17.9,19.3]),mk('e-bike','bike',.55,1.05,INK.blue,INK.pink,SKIN[3],INK.yellow,1.4,3.7,3.7,[19.3,20.8]),mk('e-moped','moped',-4.3,1.55,INK.orange,INK.sky,SKIN[0],INK.pink,1.0,2.6,5.2,[20.8,22.6])];
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.7):b.t;
   sun.dy=.4*beat(t,0,2);cloud.dx=-.6*beat(t,0,36);bunt.dy=.03*wave(t,0,36,.4);door.flip=-1.2*pulse(t,2.4,4.2);
   // Enter and park (2–8 s), then each tap (or "tap three times", 17.8–23.2 s) rides one on down the street.
   rides.forEach((r,i)=>{r.piece.s=pop(t,r.enter,.5);const go=manual?clamp01(act*3-i):beat(t,r.ride[0],r.ride[1]);const d=r.park*beat(t,r.enter+.2,r.enter+2.1)+(r.end-r.park)*go;r.piece.x=r.x0+d;
    r.wheels.forEach(w=>{w.rot=-d/r.r;});r.piece.dy=.015*Math.abs(Math.sin(d*9));});
   hid.forEach((h,i)=>{const a=pop(t,[8.1,8.8,9.6][i],.6);if(i===0)h.dy=.2*a;else{h.scale=a;h.visible=a>.02;}});
   clueC.scale=pop(t,11.3,.8);clueC.visible=clueC.scale>.02;clueC.rot=.03*wave(t,12,17.8,.7);
   tip.s=pop(t,15.2,.7);
   const done=manual?beat(act,.86,1):beat(t,22.5,23.2);boxLid.flip=1.9*done;found.scale=done;found.dy=.22*done;cnt0.flip=-3.2*(manual?beat(act,.9,1):beat(t,22.9,23.5));
   gaps.forEach((g,i)=>{g.s=pop(t,24.2+i*.8,.6);g.dy=.04*wave(t,25,31.7,1);});
   const kl=-.8*pulse(t,27.3,28.8)+.8*pulse(t,29,30.5);kidW.body.yaw=kl;kL.scale=clamp01(-kl/.4);kR.scale=clamp01(kl/.4);
   kidW.armR.rot=.12+1.6*pulse(t,30.4,31.6)+2.2*beat(t,32,32.6);kidW.armL.rot=-.12-2.2*beat(t,32,32.6);
   return manual?(act<=1/3?-.45:act<=2/3?.45:-.45):b.narrated?-.4*beat(t,2,2.8)+.4*beat(t,7.4,8)+.35*beat(t,10.9,11.6)-.35*beat(t,17.4,18)-.45*beat(t,18,18.6)+.9*beat(t,19.2,19.8)-.9*beat(t,20.7,21.3)+.45*beat(t,22.6,23.2):0;
  };
 }};

/* ───────────── 3 · Fish, fruit and coins (harvest) ───────────── */
/** Fisher-local points: where the bobber lands on the water and where the catch drops in the bucket. */
const H_LX=-1.6,H_LY=-.25,H_BX=.95,H_BY=.05;
const harvest:SpreadDef={id:'harvest',rest:2.3,
 left:k=>{seaPrint(k,-5,0,0,PAGE_D);const quay=rect(-5,Z(1.7),5,PAGE_D-Z(1.7));k.fill(quay,INK.stone);k.dots(quay,'#a59a80',.06,.2);k.key(`M-5 ${Z(1.7)} L0 ${Z(1.7)}`,.03,INK.navy);
  for(let x=-4.8;x<0;x+=.6)k.key(`M${x} ${Z(1.7)} L${x} ${PAGE_D}`,.01,'#a59a80');
  caption(k,-2.5,'CAST · WAIT · REACT','A NIBBLE IS LIKE A DUMMY · STAY SET',INK.blue,INK.navy,4.3);},
 right:k=>{grassPrint(k,0,5);const path=`M0 ${Z(.9)} Q2.4 ${Z(.5)} 5 ${Z(1.0)} L5 ${Z(1.5)} Q2.4 ${Z(1.0)} 0 ${Z(1.4)} Z`;k.fill(path,INK.sand);k.dots(path,INK.orange,.05,.2);
  for(const [x,y] of [[1.5,Z(-1.2)],[3.2,Z(-1.25)]]){const bed=rect(x-.6,y-.2,1.2,.4);k.fill(bed,INK.brown,.7);k.dots(bed,INK.navy,.04,.3);}
  caption(k,2.5,'ROSA’S MARKET STAND','TRADE FISH AND FRUIT FOR COINS',INK.pink,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{sky(k,4.5,3);seaBand(k,4.5,1.6,3);for(const [x,c] of [[1.0,INK.red],[3.2,INK.yellow]] as const){const hull=poly([[x,2.1],[x+.7,2.1],[x+.6,2.3],[x+.1,2.3]]);k.fill(hull,c);k.key(hull,.01);k.key(`M${x+.35} 2.1 L${x+.35} 1.6`,.014);k.fill(poly([[x+.37,1.62],[x+.66,2.0],[x+.37,2.0]]),INK.white);k.key(poly([[x+.37,1.62],[x+.66,2.0],[x+.37,2.0]]),.008);}}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3);hills(k,4.5,2.1,'#b9c98a',3);const cls=rect(2.4,1.4,1.7,1.2);k.fill(cls,'#f6e4c0');k.key(cls,.013);k.fill(poly([[2.3,1.45],[3.25,1.05],[4.2,1.45]]),INK.red);k.key(poly([[2.3,1.45],[3.25,1.05],[4.2,1.45]]),.012);for(let i=0;i<3;i++)k.fill(rect(2.6+i*.5,1.7,.3,.3),INK.blue);k.text('COMMUNITY GARDEN',1.2,1.1,.17,INK.navy,{max:2.1});
    k.fill(rect(0,2.6,4.5,.4),INK.grass);k.key('M0 2.6 L4.5 2.6',.012);for(let x=.1;x<2.3;x+=.3)k.key(`M${x} 2.6 L${x} 2.3 M${x-.1} 2.4 L${x+.2} 2.4`,.012,INK.white);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'h-sun',.32),'L',3.4,1.3,{out:.012}),birds=bd.add(S.birds(K+'h-birds',.8,.3),'L',1.4,2.3,{out:.02}),cloud=bd.add(S.cloud(K+'h-cloud',.9,.36),'R',1.2,2.5);
  // Fishing post: dock, fisher with rod, water piece with bobber, fish and a front wave strip glued in layers.
  B.stand(dock('h-dock',1.9,.62),-2.6,.1,{layer:2});B.stand(S.sign(K+'h-fsign',.95,1.15,'FISHING'),-4.55,-.95,{layer:1});
  B.stand(sp('h-crate',.9,.32,k=>{const b=rect(0,.06,.9,.26);k.fill(b,'#cf9b62');k.hatch(b,'#8a5238',.04,.1,.008);k.key(b,.012);for(let i=0;i<4;i++){const x=.08+i*.2;k.fill(`M${x} .12 Q${x+.08} 0 ${x+.16} .12 Q${x+.08} .22 ${x} .12 Z`,[INK.teal,INK.sky,INK.orange,INK.teal][i]);k.key(`M${x} .12 Q${x+.08} 0 ${x+.16} .12 Q${x+.08} .22 ${x} .12 Z`,.008);}}),-1.0,1.95,{layer:3});
  const FI=B.person(K+'h-fisher',-2.3,.08,1.18,{shirt:'casual',hair:'cap',skin:SKIN[2],face:'smile',layer:2});FI.body.dy=.54;
  const sx=(112/320-.5)*FI.h*320/512,sy=FI.h*(1-186/512),ROD=1.25;const rodP=FI.body.arm(rod('h-rod',ROD),sx,sy,{z:.02});
  const lineP=FI.body.arm(line('h-line',1),sx,sy,{z:.018});
  const flyBob=FI.body.add(bobber('h-fbob',.06),0,0,{z:.022,anchor:'top'});
  const hooked=FI.body.add(fish('h-fish',.46,.22),0,0,{z:.024,anchor:'center'});hooked.visible=false;
  const W=B.stand(waterBack('h-water',2.3,.6),-3.95,1.0,{layer:3});
  const bob=W.add(bobber('h-bob',.06),0,.16,{z:.01,anchor:'bottom'});
  W.add(wavesFront('h-waves',2.4,.24),0,-.02,{z:.024,anchor:'bottom'});
  const bucketS=B.stand(bucket('h-bucket',.42,.4),-1.35,.35,{layer:3});const inB=bucketS.add(fish('h-fish2',.4,.19,INK.teal),0,.5,{z:-.01,anchor:'center'});inB.rot=-1.25;
  const keeper=B.person(K+'h-keeper',-.85,-1.0,1.16,{shirt:'keeper',hair:'short',skin:SKIN[0],face:'open',layer:1,holdL:'glove',holdR:'glove',legs:'wide'});keeper.body.s=0;
  const setCard=B.stand(wordCard('h-set',.9,.32,'STAY SET',INK.yellow),-.85,.55,{layer:2,s:0});
  // Garden.
  const orange=B.stand(S.tree(K+'h-orange',1.2,1.7,'round'),.7,-1.85,{layer:1});const oranges=[[-.3,1.2],[.25,1.35],[0,.95],[.35,1.0]].map(([x,y],i)=>orange.add(fruitDot(`h-o${i}`,.07,INK.orange),x,y,{z:.012,anchor:'center'}));
  const cherry=B.stand(S.tree(K+'h-cherry',1.0,1.5,'olive'),4.35,-1.2,{layer:1});const cherries=[[-.25,1.05],[.2,1.15],[0,.85]].map(([x,y],i)=>cherry.add(fruitDot(`h-c${i}`,.05,INK.red),x,y,{z:.012,anchor:'center'}));
  B.stand(vegBed('h-bed',1.35,.5),2.05,-1.6,{layer:1});
  const picker=B.person(K+'h-picker',1.05,-1.05,1.12,{shirt:'bib',hair:'curly',skin:SKIN[3],face:'grin',layer:2});
  const bask=B.stand(basket('h-basket',.46,.36),1.6,-.75,{layer:2});const inBask=[0,1,2,3].map(i=>bask.add(fruitDot(`h-bf${i}`,.06,[INK.orange,INK.red,INK.orange,INK.red][i]),-.12+i*.08,.36,{z:-.008,anchor:'center'}));
  // Rosa's market stand.
  const rosa=B.person(K+'h-rosa',3.45,.15,1.15,{shirt:'coach',hair:'long',skin:SKIN[1],face:'smile',adult:true,layer:1});
  const stallS=B.stand(stall('h-stall',1.85,1.7,'ROSA’S STAND',[INK.teal,INK.orange,INK.red],INK.pink,.24),3.45,.35,{layer:2});
  const crates=[stallS.add(fish('h-cf',.3,.14),-.55,.72,{z:.02,anchor:'center'}),stallS.add(fruitDot('h-cfr',.08,INK.orange),.55,.74,{z:.02,anchor:'center'})];
  const coins=[0,1,2,3].map(i=>B.stand(coin(`h-coin${i}`,.13),2.75+i*.34,1.3,{layer:3,s:0,tab:false}));
  const wallet=B.stand(wordCard('h-wallet',.9,.32,'+ COINS',INK.gold,INK.navy),4.45,1.6,{layer:3,s:0});
  // Island jobs: raking leaves and a ball kid.
  const raker=B.person(K+'h-raker',.75,1.25,1.1,{shirt:'bib',hair:'short',skin:SKIN[0],face:'smile',layer:3});const rk=raker.body.arm(rake('h-rake',.95),(190/320-.5)*raker.h*320/512,raker.h*(1-186/512),{z:.02});rk.rot=.5;
  const leaves=[B.stand(leafPile('h-l1',.42,.22),.2,1.55,{layer:3,tab:false}),B.stand(leafPile('h-l2',.36,.2),1.35,1.7,{layer:3,tab:false})];
  const bk=B.person(K+'h-bk',2.0,.75,1.08,{shirt:'navy',hair:'bun',skin:SKIN[2],face:'grin',layer:2,holdR:'ball'});
  // Hung on the backdrop sky: standing on the lawn it was hidden by the raker once he steps across.
  const jobs=bd.add(wordCard('h-jobs',1.25,.34,'EVERY JOB TEACHES',INK.sky),'R',3.25,2.45,{out:.03});jobs.scale=0;
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,2.3):b.t;
   sun.dy=.4*beat(t,0,2.3);birds.dx=1.1*beat(t,0,30);cloud.dx=-.5*beat(t,0,39);
   // The fishing timeline; the page action replays it from the cast to the catch.
   const ft=manual?lerpMap(act,[[0,2.4],[.3,4.6],[.45,6.8],[.7,12.5],[1,14.4]]):t;
   const wind=beat(ft,2.6,3.1),throwF=beat(ft,3.1,3.5),jerk=beat(ft,12.75,13.05),settle=beat(ft,14,14.6);
   rodP.rot=-2.5-.6*wind+1.2*throwF-.9*jerk+.3*settle;FI.armL.rot=.55*rodP.rot;
   const tipX=sx+Math.sin(rodP.rot)*ROD,tipY=sy-Math.cos(rodP.rot)*ROD,hang=tipY-.28;
   const fly=beat(ft,3.35,4.4),inWater=ft>=4.4&&ft<13.0,reel=beat(ft,13.0,14.2);
   const nib=.035*maxOf([7.1,7.9,8.7,10.8].map(a=>pulse(ft,a,a+.35))),plunge=beat(ft,12.55,12.75)*(1-beat(ft,13.0,13.2));
   let ex=tipX,ey=hang;
   if(inWater){ex=H_LX;ey=H_LY-(nib+.12*plunge)*.8;}
   else if(ft>=3.35&&ft<4.4){ex=tipX+(H_LX-tipX)*fly;ey=hang+(H_LY-hang)*fly+.8*Math.sin(fly*Math.PI);}
   else if(ft>=13.0&&ft<14.2){ex=H_LX+(H_BX-H_LX)*reel;ey=H_LY+(H_BY-H_LY)*reel+1.0*Math.sin(reel*Math.PI);}
   flyBob.visible=!inWater&&!(ft>=13.0&&ft<14.2);flyBob.dx=ex;flyBob.dy=ey;
   hooked.visible=ft>=13.0&&ft<14.2;hooked.dx=ex;hooked.dy=ey-.2;hooked.rot=Math.PI/2+.3*Math.sin(ft*9);
   bob.visible=inWater;bob.dy=-(nib+.12*plunge)+.012*wave(ft,4.4,12.5,1.1);
   const ldx=ex-tipX,ldy=ey-tipY;lineP.dx=tipX-sx;lineP.dy=tipY-sy;lineP.rot=Math.atan2(ldx,-ldy);lineP.scale=Math.max(.02,Math.hypot(ldx,ldy));
   inB.scale=beat(ft,14.1,14.4);inB.visible=inB.scale>.02;
   FI.armR.rot=.12+2.1*beat(t,35.6,36.2);
   keeper.body.s=pop(t,9.4,.7);keeper.body.dy=-.06*beat(t,10.1,10.6);keeper.armL.rot=-.12-1.0*beat(t,10,10.6)-1.2*beat(t,35.5,36.1);keeper.armR.rot=.12+1.0*beat(t,10,10.6)+1.2*beat(t,35.5,36.1);
   setCard.s=pop(t,10.6,.6);
   // Garden picking: oranges, then the bed, then cherries, into the basket.
   const pk=[15.1,18.7,19.4,20.1];picker.armR.rot=.12+2.4*maxOf(pk.map(a=>pulse(t,a-.5,a+.5)))+2.2*beat(t,35.7,36.3);picker.armL.rot=-.12-2.2*beat(t,35.7,36.3)-.8*pulse(t,16.2,18.3);
   oranges[1].scale=1-beat(t,15.1,15.3);oranges[3].scale=1-beat(t,18.7,18.9);cherries[1].scale=1-beat(t,19.4,19.6);cherries[0].scale=1-beat(t,20.1,20.3);
   inBask.forEach((f,i)=>{f.scale=beat(t,pk[i]+.3,pk[i]+.6);f.visible=f.scale>.02;});
   picker.body.dx=.25*beat(t,16,16.6)-.25*beat(t,18.2,18.6);
   // Market: crates fill, Rosa waves, coins pop up.
   crates.forEach((c,i)=>{c.scale=pop(t,21+i*.6,.5);c.visible=c.scale>.02;});
   rosa.armR.rot=.12+2.0*beat(t,21.8,22.3)-2.0*beat(t,24.6,25)+.3*wave(t,22.3,24.6,1.4)+2.2*beat(t,35.8,36.4);rosa.armL.rot=-.12-2.2*beat(t,35.8,36.4);
   coins.forEach((c,i)=>{const a=22.8+i*.45;c.s=pop(t,a,.35);c.dy=.35*pulse(t,a,a+.7);c.rot=.4*wave(t,a,a+.8,1.2);});wallet.s=pop(t,24.6,.6);
   // Jobs.
   rk.rot=.5+.35*wave(t,26.6,29.4,1.1);leaves.forEach((l,i)=>{l.s=1-beat(t,27.6+i*.8,28.4+i*.8);});raker.body.dx=.25*beat(t,27.2,29);
   bk.body.dx=-.45*beat(t,29.6,30.6)+.45*beat(t,30.8,31.8);bk.armR.rot=.12+.6*beat(t,29.4,29.8)+2.1*beat(t,35.8,36.4);bk.armL.rot=-.12-2.2*beat(t,35.8,36.4);
   jobs.scale=pop(t,32.5,.7);jobs.visible=jobs.scale>.02;
   return manual?-.45*beat(act,0,.1):b.narrated?-.45*beat(t,2.3,3)+.45*beat(t,14.2,14.9)+.45*beat(t,14.9,15.6)-.45*beat(t,25.4,26)-.2*beat(t,26,26.6)+.2*beat(t,32.2,32.8):0;
  };
 }};

/* ───────────── 4 · Games and vending machines (arcade) ───────────── */
const arcade:SpreadDef={id:'arcade',rest:30.0,
 left:k=>{const fl=rect(-5,0,5,PAGE_D);k.fill(fl,'#2b2f5c');for(let y=0;y<PAGE_D;y+=.5)for(let x=-5;x<0;x+=.5)if(((x*2+y*2)|0)%2===0)k.fill(rect(x,y,.5,.5),'#3a3f75');k.dots(fl,INK.pink,.08,.08);
  k.fill(rect(-5,Z(1.75),5,.08),'#60e9f2');k.fill(rect(-5,Z(1.85),5,.05),'#ff65c8');
  caption(k,-2.5,'THE ARCADE','ISLAND STRIKERS · BREAKAWAY RUN · TENNIS · PINBALL · PASS PUZZLES','#ff65c8',INK.white,4.4);},
 right:k=>{pavePrint(k,0,5,0,PAGE_D);k.fill(rect(0,Z(1.75),5,.08),INK.red);
  caption(k,2.5,'VENDING MACHINES','CARD PACKS · BALLS · RIDES · FLYING GEAR · BOOKS',INK.red,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.35-y/3*.2);for(let i=0;i<10;i++)k.circle(((i*53)%97)/97*4.5,((i*31)%41)/41*1,.02,i%3?INK.yellow:INK.white);
    const wall=rect(0,1.0,4.5,2.0);k.fill(wall,'#34306a');k.dots(wall,'#ff65c8',.06,.1);k.key(wall,.012);for(let i=0;i<9;i++)k.circle(.25+i*.5,1.15,.04,i%2?'#60e9f2':'#ff65c8');k.fill(rect(0,2.6,4.5,.4),'#2b2f5c');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3,'#ffd9b0',INK.orange);hills(k,4.5,2.1,'#b9c98a',2);roofs(k,.2,4.3,2.6,5);k.fill(rect(0,2.6,4.5,.4),INK.stone);k.key('M0 2.6 L4.5 2.6',.012);}},-3.05,1.22);
  const signOff=bd.add(neon('a-neonOff',2.2,.62,false),'L',1.1,2.55,{out:.02}),signOn=bd.add(neon('a-neonOn',2.2,.62,true),'L',1.1,2.55,{out:.026});
  const sun=bd.add(S.sun(K+'a-sun',.3,INK.yellow),'R',3.0,2.45,{out:.012});
  const spots:[number,number][]=[[-4.3,-.2],[-3.45,-1.05],[-2.35,-1.4],[-1.25,-1.05],[-.5,-.15]];
  const cabs=ARC.map((c,i)=>{const pc=B.stand(cabinet(`a-cab${i}`,.78,1.55,c.color,c.name),spots[i][0],spots[i][1],{layer:i===2?1:2});const on=pc.add(screen(`a-scr${i}`,.52,.54,i,c.color),0,1.55*.62,{z:.012,anchor:'center'});return {pc,on};});
  const gamer=B.person(K+'a-gamer',-2.4,.35,1.14,{shirt:'fan',hair:'short',skin:SKIN[2],face:'open',layer:3});
  const skills=[B.stand(wordCard('a-sk1',1.0,.3,'FIRST TOUCH','#b991ff',INK.white),-3.6,1.2,{layer:3,s:0}),B.stand(wordCard('a-sk2',1.1,.3,'SEE THE SPACE','#ff65c8',INK.white),-1.2,1.25,{layer:3,s:0})];
  // Vending machine with button, dropping pack and tray flap.
  const VW=1.3,VH=2.12,vm=B.stand(vending('a-vend',VW,VH),2.35,-.95,{layer:1});
  const btn=vm.add(button('a-btn',.07),VW*.34,VH*.62,{z:.014,anchor:'center'});
  const drop=vm.add(packPlate('a-drop',.2,.28),-.425,VH*.74,{z:.008,anchor:'center'});drop.visible=false;
  const tray=vm.flap(trayFlap('a-tray',VW*.5,VH*.14),-VW*.13,VH*.22,{anchor:'top',z:.016});
  const coinP=vm.add(coin('a-coin',.07),VW*.34+.35,VH*.46,{z:.02,anchor:'center'});
  const buyer=B.person(K+'a-buyer',3.35,.8,1.14,{shirt:'bib',hair:'bun',skin:SKIN[0],face:'smile',layer:2});
  const packS=B.stand(packPlate('a-pack',.55,.78),2.2,.85,{layer:3,s:0});const cards=[0,1,2].map(i=>packS.add(cardPlate(`a-card${i}`,.36,.5,[INK.gold,INK.sky,INK.pink][i],[INK.blue,INK.red,INK.navy][i]),0,.6,{z:-.01,anchor:'bottom'}));
  const kinds:[string,string,string][]=[['pack',INK.pink,'CARD PACKS'],['ball',INK.white,'BALLS'],['scooter',INK.pink,'SCOOTERS'],['bike',INK.blue,'BIKES'],['moped',INK.orange,'MOPEDS'],['jet','#c68853','FLYING GEAR']];
  // Product badges hang on the backdrop wall in two columns (either side of the machine), so no badge stands in front of another's label.
  const prod=kinds.map(([kd,c,l],i)=>{const m=bd.add(medal(`a-m${i}`,.6,kd,c,l),'R',i<3?.75:3.95,[1.9,1.05,.2][i%3],{out:.03});m.scale=0;return m;});
  const bookS=B.stand(sp('a-bookStand',.9,.5,k=>{const b=rect(0,.18,.9,.32);k.fill(b,INK.wood);k.key(b,.012);k.fill(rect(0,.1,.9,.1),'#8a5238');}),4.3,1.3,{layer:3});
  const mini=bookS.add(miniBook('a-mini',.62,.5),0,.5,{z:.012,anchor:'bottom'});const cover=bookS.flap(bookCover('a-cover',.34,.42),.16,.93,{anchor:'top',axis:'y',z:.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,30.0):b.t;
   const flick=t<.4?0:t<.6?1:t<.8?0:t<1.2?1:t<1.35?0:1;signOn.visible=flick>0;signOff.visible=!signOn.visible;signOn.scale=1+.03*pulse(t,35.6,36.4);
   sun.dy=-.3*beat(t,18,26);
   const named=[5.4,6.9,8.1,9.4,10.6];cabs.forEach((c,i)=>{c.on.scale=pop(t,named[i],.45);c.on.visible=c.on.scale>.02;c.pc.dy=.05*pulse(t,named[i],named[i]+.5)+.03*pulse(t,35.6+i*.15,36.2+i*.15);});
   gamer.armL.rot=-.12-1.2*beat(t,11.8,12.3)+1.2*beat(t,18,18.4)+.35*wave(t,12.3,18,2.2)-2.2*beat(t,35.7,36.2);gamer.armR.rot=.12+1.2*beat(t,11.8,12.3)-1.2*beat(t,18,18.4)+.35*wave(t,12.3,18,2.6)+2.2*beat(t,35.7,36.2);gamer.body.yaw=.5*beat(t,11.8,12.3)*(1-beat(t,18,18.4));
   skills.forEach((s,i)=>{s.s=pop(t,[15.2,16.9][i],.6);});
   prod.forEach((p,i)=>{p.scale=pop(t,[19.9,20.8,21.5,22.3,23.1,24.2][i],.55);p.visible=p.scale>.02;p.dy=.03*wave(t,25,36,.6+i*.1);});
   mini.scale=pop(t,26.6,.6);mini.visible=mini.scale>.02;cover.flip=-2.6*beat(t,27.4,28.4);
   // The machine: coin in, button, the pack drops, the tray opens and the cards fan out.
   const vt=manual?lerpMap(act,[[0,30.15],[1,35.4]]):t;
   buyer.armR.rot=.12+1.5*beat(vt,30.4,30.9)-1.5*beat(vt,31.7,32.1);buyer.armL.rot=-.12-1.6*beat(vt,31.8,32.2)+1.6*beat(vt,32.6,33)-2.2*beat(t,35.7,36.2);buyer.body.dx=-.3*beat(vt,30.2,30.8);
   coinP.visible=vt>30.4&&vt<31.7;coinP.dx=-.35*beat(vt,30.9,31.6);coinP.scale=1-.6*beat(vt,31.3,31.7);
   btn.scale=1-.3*pulse(vt,32.0,32.5);
   const fall=beat(vt,32.4,33.2);drop.visible=vt>32.3&&vt<33.4;drop.dy=-VH*.57*fall;
   tray.flip=1.7*beat(vt,33.2,33.6);
   const out=beat(vt,33.5,34.2);packS.s=out;packS.dy=.1*pulse(vt,33.5,34.3);
   cards.forEach((c,i)=>{const f=beat(vt,34.2+i*.2,34.9+i*.2);c.dy=.3*f;c.rot=(i-1)*.55*f;c.scale=.5+.5*f;});
   return manual?.5*beat(act,0,.15):b.narrated?-.5*beat(t,2.2,3)+.5*beat(t,18.2,18.9)+.5*beat(t,18.9,19.6)-.5*beat(t,35.4,36):0;
  };
 }};

/* ───────────── 5 · Watch, learn and quiz (learn) ───────────── */
const learn:SpreadDef={id:'learn',rest:29.1,
 left:k=>{grassPrint(k,-5,0,0,PAGE_D,INK.grass);stripes(k,-5,0,0,PAGE_D,10);chalk(k,`M-4.8 .3 L-.02 .3 L-.02 ${Z(2.35)} L-4.8 ${Z(2.35)} Z`);chalk(k,`M-3.6 .3 L-3.6 1.3 L-1.2 1.3 L-1.2 .3`);chalk(k,`M-3.1 ${Z(2.35)} A1.1 .8 0 0 1 -1.7 ${Z(2.35)}`);
  dash(k,-4.0,Z(1.2),-2.5,Z(.1),.04,INK.yellow);dash(k,-2.5,Z(.1),-1.1,Z(-.2),.04,INK.yellow);
  caption(k,-2.5,'LEARN PLAYS','FOLLOW THE BALL, THE ARROWS AND THE PLAYERS',INK.white,INK.navy,4.3);},
 right:k=>{pavePrint(k,0,5,0,PAGE_D);const lawn=rect(0,Z(.8),5,Z(2.35)-Z(.8));k.fill(lawn,INK.grass,.8);k.dots(lawn,INK.leaf,.06,.2);
  caption(k,2.5,'QUIZ · PATHS · COACHES','5 QUESTIONS · 12 CORE LESSONS · COACHES CENTRE',INK.blue,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{sky(k,4.5,3);hills(k,4.5,1.9,'#b9c98a',2);for(const x of [.8,3.3]){k.keyFill(rect(x-.03,.9,.06,1.7),'#1a2447');const l=rect(x-.22,.7,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,.81,.035,INK.yellow);}
    k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,.78,.008);k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,-.78,.008);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3);hills(k,4.5,2.0,INK.leaf,1);const bl=rect(1.3,1.0,2.6,1.6);k.fill(bl,'#f6e4c0');k.dots(bl,INK.orange,.05,.12);k.key(bl,.014);k.fill(rect(1.2,.8,2.8,.26),INK.blue);k.key(rect(1.2,.8,2.8,.26),.012);k.text('COACHES CENTRE',2.6,1.0,.17,INK.white,{max:2.6});
    for(let i=0;i<4;i++)k.fill(rect(1.5+i*.6,1.3,.36,.4),INK.sky);k.fill(rect(2.4,2.0,.4,.6),INK.navy);k.fill(rect(0,2.6,4.5,.4),INK.stone);k.key('M0 2.6 L4.5 2.6',.012);}},-3.05,1.22);
  const cloud=bd.add(S.cloud(K+'l-cloud',.9,.36),'L',3.0,2.6),sun=bd.add(S.sun(K+'l-sun',.28),'R',.7,1.7,{out:.012});
  B.stand(S.goal(K+'l-goal',1.9,.95),-2.4,-1.6,{layer:1});
  const keeper=B.person(K+'l-keeper',-2.4,-1.4,1.14,{shirt:'keeper',hair:'short',skin:SKIN[1],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const learnBtn=B.stand(S.sign(K+'l-btn',1.1,1.3,'LEARN PLAYS',INK.yellow),-4.4,-1.3,{layer:1,s:0});
  const A=B.person(K+'l-a',-4.0,1.2,1.2,{shirt:'navy',hair:'short',skin:SKIN[0],number:'4',legs:'kick',face:'smile',layer:3});
  const Bp=B.person(K+'l-b',-2.5,.1,1.2,{shirt:'navy',hair:'curly',skin:SKIN[3],number:'8',legs:'kick',face:'grin',layer:2});
  const C=B.person(K+'l-c',-1.1,-.2,1.2,{shirt:'navy',hair:'long',skin:SKIN[2],number:'9',legs:'kick',face:'smile',layer:2});
  const D1=B.person(K+'l-d1',-3.1,-.45,1.18,{shirt:'casual',hair:'short',skin:SKIN[1],face:'open',layer:2});
  const D2p=B.person(K+'l-d2',-1.55,-1.0,1.18,{shirt:'casual',hair:'bun',skin:SKIN[0],face:'open',layer:1});
  const arrows=[[-3.4,.75,-.6],[-1.9,-.2,-.2],[-2.0,.55,0]].map(([x,z,r],i)=>{const a=B.stand(S.arrow(K+`l-ar${i}`,.7,.3,INK.yellow),x,z,{layer:3,s:0,tab:false});a.rot=r;return a;});
  const ball=B.stand(S.ball(K+'l-ball',.12),-3.7,1.3,{layer:3,tab:false});
  const QH=1.9,quiz=B.stand(quizCard('l-quiz',2.0,QH),1.75,-.95,{layer:2,s:0});
  quiz.add(answerFlap('l-ansB',1.8,QH*.17,false),0,QH*.16,{z:.012,anchor:'bottom'});const ansF=quiz.flap(answerFlap('l-ansF',1.8,QH*.17,true),0,QH*.16,{anchor:'bottom',z:.022});
  const ticks=Array.from({length:5},(_,i)=>B.stand(S.icon(K+`l-t${i}`,.26,'tick'),1.05+i*.36,.35,{layer:3,s:0}));
  const cardS=B.stand(cardPlate('l-card',.62,.86,INK.gold,INK.blue),3.35,.55,{layer:3,s:0});const cardB=cardS.flap(cardBack('l-cardB',.62,.86),-.31,0,{anchor:'bl',axis:'y',z:.014});
  const post=B.stand(signpost('l-post',1.9),4.45,-1.45,{layer:1});
  const paths=([['FUTSAL',INK.teal,false],['7v7',INK.green,true],['9v9',INK.orange,false],['11v11',INK.blue,true]] as const).map(([l,c,left],i)=>{const q=post.add(arrowSign(`l-p${i}`,.78,.24,l,c,left),left?-.36:.36,1.78-i*.32,{z:.012,anchor:'center'});q.scale=0;return q;});
  const lessons=B.stand(lessonStack('l-lessons',.8,.7),4.2,-.35,{layer:2,s:0});
  const coach=B.person(K+'l-coach',2.75,-.05,1.3,{shirt:'coach',hair:'short',skin:SKIN[2],face:'smile',adult:true,layer:2});coach.body.s=0;
  const wh=coach.body.add(whistle('l-wh',.4,.3),.42,coach.h*.95,{z:-.01,anchor:'center'});
  const kid=B.person(K+'l-kid',.7,1.35,1.1,{shirt:'fan',hair:'cap',skin:SKIN[3],face:'grin',layer:3});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,29.1):b.t;
   cloud.dx=-.6*beat(t,0,36);sun.dy=.3*beat(t,0,2.4);
   learnBtn.s=pop(t,3.1,.7);kid.armL.rot=-.12-1.7*beat(t,3.4,3.9)+1.7*beat(t,5.4,5.9);
   // The play: pass, run, pass, shot.
   let bx:number,bz:number;[bx,bz]=track(t,[[0,-3.7,1.3],[6.0,-3.7,1.3],[7.0,-2.3,.2],[7.3,-2.3,.2],[8.7,-1.75,.55],[9.2,-1.75,.55],[10.0,-1.0,-.1],[10.3,-1.0,-.1],[11.1,-2.3,-1.35]]);
   ball.x=bx;ball.z=bz;ball.rot=-bx*5;ball.visible=!(t>11.2&&t<13);
   A.leg!.rot=-1.1*pulse(t,5.7,6.2);Bp.leg!.rot=-1.0*pulse(t,8.9,9.4);C.leg!.rot=-1.2*pulse(t,10.1,10.5);
   Bp.body.x=-2.5+.55*beat(t,7.4,8.7);Bp.body.z=.1+.35*beat(t,7.4,8.7);D1.body.x=-3.1+.5*beat(t,7.2,8.8);D2p.body.x=-1.55-.35*beat(t,9.3,10.4);
   arrows.forEach((a,i)=>{a.s=pop(t,[5.6,7.2,8.2][i],.5);});
   const dive=pulse(t,10.6,11.9);keeper.body.rot=.8*dive;keeper.body.dx=-.2*dive;keeper.armL.rot=-.12-2*dive;keeper.armR.rot=.12+2*dive;
   C.armL.rot=-.12-2.2*beat(t,11.1,11.5)+2.2*beat(t,12.4,12.8);C.armR.rot=.12+2.2*beat(t,11.1,11.5)-2.2*beat(t,12.4,12.8);
   quiz.s=pop(t,11.5,.8);
   ticks.forEach((q,i)=>{q.s=pop(t,13.8+i*.45,.35);});cardS.s=pop(t,16.6,.7);
   paths.forEach((p,i)=>{p.scale=pop(t,[19.3,20.5,21.4,22.4][i],.5);p.visible=p.scale>.02;});
   lessons.s=pop(t,24.3,.7);coach.body.s=pop(t,26.6,.7);wh.scale=pulse(t,27.4,28.8);wh.visible=wh.scale>.02;coach.armR.rot=.12+1.9*beat(t,27.2,27.7)-1.9*beat(t,28.6,29)+2.2*beat(t,33.2,33.8);coach.armL.rot=-.12-2.2*beat(t,33.2,33.8);
   // Flip the quiz card: the answer is right, and the player card turns over.
   const flip=manual?beat(act,0,.5):beat(t,29.6,30.5),turn=manual?beat(act,.45,1):beat(t,30.9,31.9);
   ansF.flip=1.7*flip;cardB.flip=-2.3*turn;cardS.dy=.12*pulse(manual?act:t,manual?.45:30.9,manual?1:31.9);
   kid.armR.rot=.12+1.4*beat(t,29.3,29.8)-1.4*beat(t,30.4,30.8)+2.3*Math.max(beat(t,33,33.5),manual?beat(act,.6,1):0);kid.armL.rot=Math.min(kid.armL.rot,-.12-2.3*Math.max(beat(t,33,33.5),manual?beat(act,.6,1):0));
   return manual?.45*beat(act,0,.1):b.narrated?-.45*beat(t,2.4,3.2)+.45*beat(t,11.1,11.8)+.45*beat(t,11.8,12.5)-.45*beat(t,32.8,33.4):0;
  };
 }};

/* ───────────── 6 · Everything is futbol (together) ───────────── */
const together:SpreadDef={id:'together',rest:19.9,
 left:k=>{grassPrint(k,-5,0);stripes(k,-5,0,0,PAGE_D,10);chalk(k,`M-4.8 .3 L0 .3 M-4.8 ${Z(2.3)} L0 ${Z(2.3)} M-4.8 .3 L-4.8 ${Z(2.3)}`);chalk(k,`M0 ${Z(.2)-1.1} A1.1 1.1 0 0 0 0 ${Z(.2)+1.1}`);chalk(k,`M-4.8 ${Z(-.9)} L-3.9 ${Z(-.9)} L-3.9 ${Z(1.2)} L-4.8 ${Z(1.2)}`);
  caption(k,-2.5,'THE BEAUTIFUL GAME','LOOK UP · FIND SPACE · BE PATIENT · TRY AGAIN',INK.white,INK.navy,4.3);},
 right:k=>{grassPrint(k,0,5);stripes(k,0,5,0,PAGE_D,10);chalk(k,`M0 .3 L4.8 .3 M0 ${Z(2.3)} L4.8 ${Z(2.3)} M4.8 .3 L4.8 ${Z(2.3)}`);chalk(k,`M0 ${Z(.2)-1.1} A1.1 1.1 0 0 1 0 ${Z(.2)+1.1}`);chalk(k,`M4.8 ${Z(-.9)} L3.9 ${Z(-.9)} L3.9 ${Z(1.2)} L4.8 ${Z(1.2)}`);
  caption(k,2.5,'PLAY TOGETHER','LEARN · HELP EACH OTHER · HAVE FUN',INK.yellow,INK.navy,4.3);},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{sky(k,4.5,3,'#ffe6b8',INK.orange);seaBand(k,4.5,1.9,2.2);hills(k,4.5,2.2,'#b9c98a',1);roofs(k,.2,4.3,2.62,6);k.fill(rect(0,2.6,4.5,.4),INK.green);}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{sky(k,4.5,3,'#ffe6b8',INK.orange);seaBand(k,4.5,1.9,2.2);hills(k,4.5,2.2,INK.leaf,3);palms(k,[.6,3.3,3.9],2.6);roofs(k,1.1,2.9,2.62,2);k.fill(rect(0,2.6,4.5,.4),INK.green);}},-3.05,1.22);
  const acts:[string,string,'L'|'R',number,number][]=[['jet','#c68853','L',3.7,1.55],['scooter',INK.pink,'L',2.6,1.75],['fish',INK.teal,'L',1.5,1.6],['fruit',INK.orange,'R',1.5,1.6],['game','#b991ff','R',2.6,1.75],['quiz',INK.blue,'R',3.7,1.55]];
  const medals=acts.map(([kd,c,side,along,up],i)=>{const m=bd.add(medal(`t-a${i}`,.62,kd,c),side,along,up,{out:.03});m.scale=0;return m;});
  const banner=bd.add(S.banner(K+'t-ban',3.4,.42,'THE BEAUTIFUL GAME',INK.pink),'R',2.0,2.45,{out:.035});banner.scale=0;
  const buntL=bd.add(S.bunting(K+'t-buL',4.0,.4,[INK.pink,INK.yellow,INK.sky,INK.green]),'L',2.25,1.05,{out:.02}),buntR=bd.add(S.bunting(K+'t-buR',4.0,.4,[INK.yellow,INK.sky,INK.pink,INK.green]),'R',2.25,1.05,{out:.02});
  const fw=[bd.add(S.firework(K+'t-fw1',.4,INK.pink),'L',1.4,2.2,{out:.04}),bd.add(S.firework(K+'t-fw2',.38,INK.yellow),'R',2.3,2.25,{out:.04})];
  const conf=[bd.add(S.confetti(K+'t-cf1',2.2,1.1,5),'L',.5,1.3,{out:.05}),bd.add(S.confetti(K+'t-cf2',2.2,1.1,6),'R',.5,1.3,{out:.05})];
  B.stand(S.goal(K+'t-goalL',1.3,.8),-4.55,-.3,{layer:1,yaw:.9});B.stand(S.goal(K+'t-goalR',1.3,.8),4.55,-.3,{layer:1,yaw:-.9});
  const values=valueCards.map(([l,c],i)=>B.stand(wordCard(`t-v${i}`,.95,.3,l,c),[-3.45,-1.35,1.35,3.45][i],1.95,{layer:3,s:0}));
  const hero=B.person(K+'t-hero',-1.3,.55,1.24,{shirt:'navy',hair:'short',skin:SKIN[2],number:'10',legs:'kick',face:'smile',layer:3});
  const friend=B.person(K+'t-friend',1.45,.35,1.2,{shirt:'fan',hair:'bun',skin:SKIN[1],legs:'kick',face:'smile',layer:3});
  const crew:Person[]=[
   B.person(K+'t-k1',-3.85,-.3,1.16,{shirt:'keeper',hair:'curly',skin:SKIN[3],face:'grin',layer:2,holdL:'glove',holdR:'glove'}),
   B.person(K+'t-rosa',-3.2,-1.3,1.3,{shirt:'coach',hair:'long',skin:SKIN[1],face:'grin',adult:true,layer:1}),
   B.person(K+'t-c2',-2.55,.25,1.12,{shirt:'bib',hair:'short',skin:SKIN[0],legs:'kick',face:'grin',layer:2}),
   B.person(K+'t-c3',-.7,-1.0,1.14,{shirt:'casual',hair:'cap',skin:SKIN[2],face:'grin',layer:1}),
   B.person(K+'t-c4',.75,-1.25,1.14,{shirt:'navy',hair:'curly',skin:SKIN[3],number:'7',face:'grin',layer:1}),
   B.person(K+'t-coach',2.55,-.9,1.32,{shirt:'coach',hair:'bald',skin:SKIN[2],face:'grin',adult:true,beard:true,layer:1}),
   B.person(K+'t-c5',2.8,.65,1.12,{shirt:'bib',hair:'long',skin:SKIN[0],legs:'kick',face:'grin',layer:2}),
   B.person(K+'t-k2',4.25,-.35,1.16,{shirt:'keeper',hair:'short',skin:SKIN[1],face:'grin',layer:2,holdL:'glove',holdR:'glove'}),
  ];
  const ball=ballPair(B,'t-ball');
  const PASS:[number,number][]=[[-1.0,.75],[1.7,.55],[2.85,.85],[-2.3,.45],[-.95,.75]];
  const JOIN=[20.6,20.95,21.3,21.65,22.0,22.35,22.7,23.05];
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.9):b.t;
   const jt=manual?lerpMap(act,[[0,20.2],[.5,23.4],[1,28.3]]):t;
   medals.forEach((m,i)=>{m.scale=pop(t,[3.0,4.2,5.5,6.9,8.4,9.8][i],.6);m.visible=m.scale>.02;m.dy=.04*wave(t,11,35,.5+i*.07);});
   banner.scale=pop(t,11.0,.8);banner.visible=banner.scale>.02;buntL.dy=.03*wave(t,0,35,.4);buntR.dy=.03*wave(t,0,35,.45);
   values.forEach((v,i)=>{v.s=pop(t,[13.2,14.3,15.4,16.4][i],.55);});
   hero.body.s=pop(t,17.3,.7);friend.body.s=pop(t,17.8,.7);
   crew.forEach((p,i)=>{p.body.s=pop(jt,JOIN[i],.55);});
   // Passing together: around the team and back to the number 10.
   const legs=[[24.0,25.0],[25.0,25.9],[25.9,26.8],[26.8,27.7]];let bx=PASS[0][0],bz=PASS[0][1],by=0;
   for(let i=0;i<legs.length;i++){const [a,c]=legs[i];if(jt>=a){const u=clamp01((jt-a)/(c-a));bx=PASS[i][0]+(PASS[i+1][0]-PASS[i][0])*u;bz=PASS[i][1]+(PASS[i+1][1]-PASS[i][1])*u;by=.25*Math.sin(u*Math.PI)*(i%2);}}
   ball(bx,bz,by,t>17.6);
   hero.leg!.rot=-1.0*pulse(jt,23.7,24.2);friend.leg!.rot=-1.0*pulse(jt,24.8,25.2);crew[6].leg!.rot=-1.0*pulse(jt,25.7,26.1);crew[2].leg!.rot=-1.0*pulse(jt,26.6,27.0);
   const up=Math.max(beat(t,23.9,24.5)*(1-beat(t,27.9,28.4)),beat(t,30.3,30.9),manual?beat(act,.85,1):0);
   crew.forEach((p,i)=>cheer(p,up*(i%2?1:.9),t,28.4,30.2,1.2+i*.08));
   cheer(hero,Math.max(beat(t,28.4,28.9)*.5,beat(t,30.3,30.9),manual?beat(act,.85,1):0),t,28.4,34.8,1.3);
   cheer(friend,Math.max(beat(t,28.4,28.9)*.5,beat(t,30.3,30.9),manual?beat(act,.85,1):0),t,28.4,34.8,1.5);
   fw.forEach((f,i)=>{f.scale=pop(t,30.4+i*.5,.8);f.visible=f.scale>.02;f.rot=t*.2;});
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*beat(t,30.5+i*.4,32.8+i*.4);c.visible=t>30.4;});
   return b.narrated?-.4*beat(t,2.8,3.4)+.4*beat(t,5.9,6.5)+.4*beat(t,6.5,7.1)-.4*beat(t,10.4,11):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={welcome,explore,harvest,arcade,learn,together};
void TAU;
