/**
 * The six Zidane pop-up spreads: a riso paper retelling of the hardships in his life (an immigrant family,
 * leaving home at fourteen, insults and anger, a red card and a comeback, returning to help France, and the
 * 2006 final), drawn gently and symbolically. pose(beat) is a pure function of Coach Bella's narration time
 * (public/voice/books/zidane/narration.json) and the reader's action (0–1), so pause, seek, replay and manual
 * play show the same paper state.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='zidane-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
/** Rotation that points a hanging arm strip toward (dx,dy) (y up). */
const aim=(dx:number,dy:number)=>Math.atan2(dx,-dy);
const eye=(p:Person)=>[(151/320-.5)*p.h*320/512,p.h*(1-104/512)] as const;
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
/** Show a part only while it has size. */
const pop=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
/** Raise both arms (celebrate / wave) by amount a with a little flutter. */
const cheer=(p:Person,a:number,t:number,hz=1.4)=>{p.armL.rot=-.12-2.3*a-.25*a*Math.sin(t*hz*TAU);p.armR.rot=.12+2.3*a+.25*a*Math.sin(t*hz*TAU+1);};

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
function concrete(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#dcd1b8');k.dots(p,'#9f9378',.06,(x,y)=>.16+.1*Math.sin(x*1.7+y*.9));
 for(let x=Math.ceil(x0/.8)*.8;x<x1-.01;x+=.8)k.key(`M${x} 0 L${x} ${PAGE_D}`,.012,'#a3967b');
 for(let y=.4;y<PAGE_D;y+=.8)k.key(`M${x0} ${y} L${x1} ${y}`,.012,'#a3967b');
 for(let i=0;i<6;i++){const cx=x0+.6+((i*37)%41)/41*(x1-x0-1.2),cy=.6+((i*53)%47)/47*5.2;k.key(`M${cx} ${cy} L${cx+.18} ${cy+.1} L${cx+.26} ${cy+.05} L${cx+.4} ${cy+.14}`,.01,'#7d7159');}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
/** A printed river running along the gutter (the bridge unfolds over it). */
function river(k:Kit,x0:number,x1:number){const r=rect(x0,Z(1.15),x1-x0,1.5);k.fill(r,INK.sky);k.dots(r,INK.blue,.05,.45);for(let i=0;i<5;i++)k.key(`M${x0+.1+((i*37)%9)/9*(x1-x0-.4)} ${Z(1.35+i*.26)} l.22 0`,.014,INK.white);k.key(`M${x0} ${Z(1.15)} L${x1} ${Z(1.15)} M${x0} ${Z(2.65)} L${x1} ${Z(2.65)}`,.02,INK.navy);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function tower(k:Kit,x:number,y:number,w:number,h:number,c:string,seed=0){const b=rect(x,y,w,h);k.fill(b,c);k.dots(b,INK.orange,.04,.14);k.fill(rect(x+w*.8,y,w*.2,h),INK.navy,.12);k.key(b,.012);k.fill(rect(x-.02,y-.05,w+.04,.06),INK.grey);
 const cols=Math.max(2,Math.round(w/.2)),cw=(w-.12)/cols;for(let r=0;y+.15+r*.22<y+h-.15;r++)for(let c2=0;c2<cols;c2++){const wx=x+.06+c2*cw,wy=y+.15+r*.22,n=(r*5+c2*3+seed)%7;k.fill(rect(wx+.02,wy,cw-.05,.1),n===0?INK.yellow:INK.blue);k.key(`M${wx} ${wy+.14} L${wx+cw-.01} ${wy+.14}`,.008);if(n===3)k.fill(rect(wx+.03,wy+.14,cw*.3,.06),INK.pink);}}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function pines(k:Kit,x0:number,x1:number,y:number,tone:string=INK.green){for(let x=x0;x<x1;x+=.34){const h=.35+((x*17|0)%3)*.1,p=poly([[x,y-h],[x+.16,y],[x-.16,y]]);k.fill(p,tone);k.key(p,.01);}}
/** Kabylia: mountains, olive trees and small flat-roofed village houses. */
function village(k:Kit,w:number,h:number){wash(k,w,h,INK.sky2,INK.yellow,y=>.55-y/h*.55);
 const m1=`M0 1.8 L.7 .85 L1.3 1.35 L2.2 .55 L3.1 1.3 L3.7 .95 L4.5 1.45 L4.5 3 L0 3 Z`;k.fill(m1,'#b9a27a');k.dots(m1,INK.navy,.05,.2);k.key(m1,.012);
 k.fill(`M2.0 .72 L2.2 .55 L2.42 .75 L2.3 .8 L2.2 .7 L2.1 .8 Z`,INK.white);
 const m2=`M0 2.15 Q1.1 1.6 2.3 1.95 Q3.3 2.25 4.5 1.75 L4.5 3 L0 3 Z`;k.fill(m2,'#9dbb72');k.dots(m2,INK.green,.05,.3);k.key(m2,.01);
 for(let i=0;i<8;i++){const x=.3+i*.52,y=2.05+Math.sin(i*1.3)*.12,hh=.24+(i%3)*.05,b=rect(x,y-hh,.36,hh);k.fill(b,i%2?'#f3e4c4':'#ead3a6');k.key(b,.01);k.fill(rect(x+.13,y-hh*.55,.09,hh*.55),INK.navy);k.fill(rect(x-.02,y-hh-.03,.4,.04),INK.brown);if(i%3===1)k.fill(rect(x+.04,y-hh+.05,.07,.06),INK.blue);}
 for(let i=0;i<5;i++){const x=.55+i*.9,y=2.45;k.fill(ell(x,y-.13,.16,.12),INK.leaf);k.dots(ell(x,y-.13,.16,.12),INK.green,.03,.4);k.key(ell(x,y-.13,.16,.12),.008);k.fill(rect(x-.02,y-.03,.04,.12),INK.brown);}
 k.fill(rect(0,2.7,w,.3),INK.sand);k.key(`M0 2.7 L${w} 2.7`,.014);}

/* ───────────── book-specific plates ───────────── */
const flats=(key:string,w:number,h:number,wall:string,shade:string,seed=1)=>sp(key,w,h,k=>{
 const b=rect(0,h*.05,w,h*.95);k.fill(b,wall);k.dots(b,shade,.045,(x,y)=>.1+y/h*.3);k.fill(rect(w*.84,h*.05,w*.16,h*.95),shade,.4);k.key(b,.014);
 const roof=rect(-.03,0,w+.06,h*.06);k.fill(roof,INK.grey);k.key(roof,.012);
 const cols=Math.max(2,Math.round(w/.3)),rows=Math.max(3,Math.floor((h*.78)/.3)),cw=(w-.16)/cols,rh=(h*.74)/rows;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=.08+c*cw,y=h*.1+r*rh,n=(r*7+c*13+seed*5)%11;
  const win=rect(x+cw*.2,y+rh*.12,cw*.6,rh*.46);k.fill(win,n%4===0?INK.yellow:INK.blue);if(n%3===1){k.fill(rect(x+cw*.06,y+rh*.12,cw*.14,rh*.46),INK.green);k.fill(rect(x+cw*.8,y+rh*.12,cw*.14,rh*.46),INK.green);}k.key(win,.008);
  const bal=rect(x+cw*.08,y+rh*.6,cw*.84,rh*.12);k.fill(bal,INK.white);k.key(bal,.008);
  if(n===2||n===7){k.key(`M${x+cw*.1} ${y+rh*.62} L${x+cw*.9} ${y+rh*.62}`,.006);for(let i=0;i<3;i++)k.fill(rect(x+cw*(.16+i*.25),y+rh*.62,cw*.15,rh*.22),[INK.pink,INK.yellow,INK.sky][(i+n)%3]);}
  if(n===5)k.circle(x+cw*.84,y+rh*.28,cw*.1,INK.white);}
 const door=rect(w*.4,h-.26,w*.2,.26);k.fill(door,INK.navy);k.key(door,.012);});
const laundry=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M0 ${h*.1} Q${w/2} ${h*.3} ${w} ${h*.1}`,.012);const cs=[INK.pink,INK.white,INK.yellow,INK.sky,INK.orange];for(let i=0;i<5;i++){const t=(i+.5)/5,x=t*w,y=h*.1+Math.sin(t*Math.PI)*h*.2;
 const s=i%2?rect(x-.06,y,.12,h*.45):poly([[x-.09,y],[x+.09,y],[x+.09,y+h*.18],[x+.06,y+h*.18],[x+.06,y+h*.62],[x-.06,y+h*.62],[x-.06,y+h*.18],[x-.09,y+h*.18]]);k.fill(s,cs[i]);k.key(s,.008);}},{rim:.015});
function mapCard(k:Kit,x:number,y:number,w:number,h:number,north='FRANCE',south='ALGERIA'){const c=rect(x,y,w,h);k.fill(c,INK.white);k.key(c,.014);const sea=rect(x+.08,y+.08,w-.16,h-.16);k.fill(sea,INK.sky);k.dots(sea,INK.blue,.04,.45);
 const nth=`M${x+.08} ${y+.08} L${x+w-.08} ${y+.08} L${x+w-.08} ${y+.42} Q${x+w*.62} ${y+.56} ${x+w*.45} ${y+.4} Q${x+w*.3} ${y+.5} ${x+.08} ${y+.36} Z`;k.fill(nth,INK.sand);k.key(nth,.01);
 const sth=`M${x+.08} ${y+h-.08} L${x+w-.08} ${y+h-.08} L${x+w-.08} ${y+h-.46} Q${x+w*.5} ${y+h-.36} ${x+.08} ${y+h-.52} Z`;k.fill(sth,INK.orange,.85);k.key(sth,.01);
 const mx=x+w*.45,my=y+.42,ax=x+w*.58,ay=y+h-.4;k.circle(mx,my,.045,INK.red);k.circle(ax,ay,.045,INK.navy);
 for(let i=0;i<10;i+=2){const p=(u:number)=>[ax+(mx-ax)*u+Math.sin(u*Math.PI)*.22,ay+(my-ay)*u];const a=p(i/10),b=p((i+1)/10);k.key(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`,.02,INK.navy);}
 k.text(north,x+w*.45,y+.27,.12,INK.navy,{max:w*.8});k.text(south,x+w*.5,y+h-.16,.12,INK.navy,{max:w*.8});}
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const redCard=sp('red',.15,.21,k=>{const b=rect(0,0,.15,.21);k.fill(b,INK.red);k.key(b,.012);},{rim:.015});
const moodMeter=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.44,h*.8,w*.12,h*.2),INK.brown);const tube=rect(w*.3,h*.14,w*.4,h*.52);[INK.red,INK.orange,INK.yellow,INK.grass,INK.sky].forEach((c,i)=>k.fill(rect(w*.3,h*(.14+i*.104),w*.4,h*.104),c));k.dots(tube,INK.navy,.03,.15);k.key(tube,.014);
 const face=(cy:number,angry:boolean)=>{const r=w*.22;k.fill(ell(w/2,cy,r,r),angry?INK.pink:INK.white);k.key(ell(w/2,cy,r,r),.012);k.circle(w/2-r*.35,cy-r*.15,r*.1,INK.navy,true);k.circle(w/2+r*.35,cy-r*.15,r*.1,INK.navy,true);
  if(angry)k.key(`M${w/2-r*.6} ${cy-r*.55} L${w/2-r*.2} ${cy-r*.35} M${w/2+r*.6} ${cy-r*.55} L${w/2+r*.2} ${cy-r*.35} M${w/2-r*.35} ${cy+r*.45} L${w/2+r*.35} ${cy+r*.45}`,.014);else k.key(`M${w/2-r*.4} ${cy+r*.25} Q${w/2} ${cy+r*.65} ${w/2+r*.4} ${cy+r*.25}`,.014);};
 face(h*.07,true);face(h*.73,false);});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const pole=(key:string,h:number)=>sp(key,.07,h,k=>{const p=rect(0,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(0,y,.07,.08),INK.red);k.key(p,.008);},{rim:.015});
const flagP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,0],[w,h*.1],[w*.9,h*.5],[w,h*.9],[0,h]]);k.fill(p,INK.yellow);k.fill(poly([[0,0],[w,h*.1],[w*.9,h*.5],[0,h*.5]]),INK.pink);k.dots(p,INK.orange,.03,.3);k.key(p,.01);},{rim:.015});
const pow=(key:string,r:number,color:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),color);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const sightCone=(key:string,len:number,spread:number)=>sp(key,spread,len,k=>{const c=spread/2,p=`M${c-.03} 0 L${c+.03} 0 L${spread} ${len*.88} Q${c} ${len} 0 ${len*.88} Z`;k.fill(p,INK.yellow);k.dots(p,INK.orange,.04,(x,y)=>.12+y/len*.45);
 k.key(`M${c} .03 L${spread*.97} ${len*.87} M${c} .03 L${spread*.03} ${len*.87}`,.012);k.circle(c,len*.9,.03,INK.pink);},{rim:.02,grain:.6});
function cone(p:Person,key:string,len=1.5,spread=.66):Part{const [ex,ey]=eye(p);const q=p.body.arm(sightCone(key,len,spread),ex,ey,{z:-.01});q.scale=0;return q;}
/** A lift-flap over a person's head printed with a cross face; the person's own calm face is underneath. */
const angryHead=(key:string,personH:number,skin:string,hairC='#3b2e3f')=>{const s=personH/512;return sp(key,108*s,132*s,k=>{k.at(-96*s,-30*s,s,()=>{
 const head='M112 76 Q114 42 150 40 Q186 42 188 76 L187 116 Q182 150 152 156 Q122 150 114 122 L106 104 Q102 92 112 88 Z';k.fill(head,skin);k.fill('M186 92 Q200 86 199 102 Q197 118 186 118 Z',skin);k.fill('M114 92 Q100 86 101 102 Q103 118 114 118 Z',skin);k.key(head,1.8);
 k.keyFill('M112 84 Q108 44 150 40 Q192 44 188 84 L180 64 Q150 54 120 64 Z',hairC);
 k.circle(136,106,3.8,INK.navy,true);k.circle(166,106,3.8,INK.navy,true);k.key('M126 90 L144 99 M158 99 L176 90',3);k.key('M136 140 Q152 128 168 140',2.6);k.key('M151 108 L147 121 L154 123',1.6);
 k.dots(ell(128,122,10,6),INK.red,4.5,.95);k.dots(ell(176,122,10,6),INK.red,4.5,.95);});},{rim:.012});};
/** The referee's red card rides his raised right hand. */
function refCard(RF:Person){const [sx,sy]=[(190/320-.5)*RF.h*320/512,RF.h*(1-186/512)],armLen=RF.h*140/512;const card=RF.body.add(redCard,sx,sy,{anchor:'center',z:.02});
 return (raise:number)=>{RF.armR.rot=.12+2.6*raise;card.dx=Math.sin(RF.armR.rot)*armLen;card.dy=-Math.cos(RF.armR.rot)*armLen+.06;card.visible=raise>.75;};}

// Page 1: the family's suitcase, night shifts, the guiding light.
const caseBody=sp('case',1.3,.9,k=>{const w=1.3,h=.9,b=rect(0,.12,w,h-.12);k.fill(b,'#8a5a3c');k.key(b,.016);const inn=rect(.07,.19,w-.14,h-.26);k.fill(inn,'#f2dcb4');k.dots(inn,INK.orange,.04,.25);k.key(inn,.01);
 const ph=rect(.14,.25,.46,.52);k.fill(ph,INK.white);k.key(ph,.01);k.fill(rect(.18,.29,.38,.38),INK.sky);
 for(let i=0;i<7;i++){const x=.21+i*.052,hh=i<2?.2:.07+(7-i)*.013;k.circle(x,.66-hh-.022,.02,INK.brown);k.fill(rect(x-.02,.66-hh,.04,hh),[INK.pink,INK.blue,INK.yellow,INK.green,INK.orange,INK.red,INK.navy][i]);}
 k.fill(rect(.18,.69,.38,.05),INK.paper);
 const mp=rect(.7,.25,.46,.52);k.fill(mp,INK.sky);k.key(mp,.01);k.fill(`M.7 .25 L1.16 .25 L1.16 .42 Q.95 .5 .7 .4 Z`,INK.sand);k.fill(`M.7 .77 L1.16 .77 L1.16 .6 Q.95 .54 .7 .64 Z`,INK.orange);k.circle(.9,.36,.025,INK.red);k.circle(.98,.69,.025,INK.navy);dash(k,.98,.69,.9,.36,.012,INK.navy,.04);
 k.key(`M${w*.35} .12 L${w*.35} .02 L${w*.65} .02 L${w*.65} .12`,.025);});
const caseLid=sp('lid',1.3,.78,k=>{const b=rect(0,0,1.3,.78);k.fill(b,INK.red);k.dots(b,'#b9383a',.04,.3);k.key(b,.016);k.key('M.3 0 L.3 .78 M1.0 0 L1.0 .78',.03,INK.yellow);const l=rect(.45,.25,.4,.24);k.fill(l,INK.paper);k.key(l,.01);k.text('1953',.65,.43,.13,INK.navy);},{rim:.016});
const boxes=sp('boxes',.9,.7,k=>{for(const [x,y,w,h] of [[0,.35,.45,.35],[.45,.35,.45,.35],[.2,0,.45,.35]]){const b=rect(x+.01,y+.01,w-.02,h-.02);k.fill(b,'#d6a868');k.dots(b,INK.brown,.04,.2);k.key(b,.012);k.key(`M${x+w/2} ${y+.01} L${x+w/2} ${y+h*.35}`,.02,INK.brown);}});
const moon=sp('moon',.5,.5,k=>{const p=`M.3 .03 A.23 .23 0 1 0 .47 .36 A.19 .19 0 1 1 .3 .03 Z`;k.fill(p,INK.yellow);k.dots(p,INK.orange,.03,.3);k.key(p,.012);},{rim:.02});
// Page 2: a balance that levels.
const scaleBeam=sp('beam',1.2,.6,k=>{k.fill(rect(0,.04,1.2,.05),INK.brown);k.key(rect(0,.04,1.2,.05),.01);for(const x of [.1,1.1]){k.key(`M${x} .09 L${x-.09} .44 M${x} .09 L${x+.09} .44`,.008);const pan=`M${x-.13} .44 L${x+.13} .44 Q${x} .6 ${x-.13} .44 Z`;k.fill(pan,INK.gold);k.key(pan,.01);}k.fill(`M.1 .42 C.04 .36 .07 .3 .1 .35 C.13 .3 .16 .36 .1 .42 Z`,INK.pink);k.fill(rect(1.04,.34,.12,.08),INK.blue);k.fill(poly([[1.02,.34],[1.1,.28],[1.18,.34]]),INK.red);k.circle(.6,.065,.035,INK.gold);},{rim:.012});
const trainee=(key:string)=>sp(key,1.2,.5,k=>{for(let i=0;i<5;i++){const x=.12+i*.24;k.circle(x,.14,.07,['#d99a6c','#7f5138','#f1b88f','#b27650','#d99a6c'][i]);k.key(ell(x,.14,.07,.07),.008);k.fill(rect(x-.08,.21,.16,.29),[INK.yellow,INK.orange,INK.sky,INK.pink,INK.leaf][i]);k.key(rect(x-.08,.21,.16,.29),.008);}},{rim:.015});
// Page 3: insults, cleaning duty, who helped.
const jab=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cx=w/2,cy=h*.42,pts:number[][]=[];for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?.66:1;pts.push([cx+Math.cos(a)*w*.46*r,cy+Math.sin(a)*h*.4*r]);}const p=poly(pts);k.fill(p,'#5b5f78');k.key(p,.012);k.fill(poly([[cx-.05,cy+h*.26],[cx+.06,cy+h*.28],[cx-.13,h]]),'#5b5f78');
 k.key(`M${cx-w*.22} ${cy} l${w*.08} ${-h*.1} l${w*.08} ${h*.16} l${w*.08} ${-h*.16} l${w*.08} ${h*.12} l${w*.06} ${-h*.08}`,.02,INK.yellow);},{rim:.018});
const broom=sp('broom',.3,1.0,k=>{k.fill(rect(.13,0,.04,.7),INK.wood);k.key(rect(.13,0,.04,.7),.008);const b=poly([[.06,.7],[.24,.7],[.3,1],[0,1]]);k.fill(b,INK.yellow);k.hatch(b,INK.orange,.03,1.4,.008);k.key(b,.01);},{rim:.012});
const bucket=sp('bucket',.4,.38,k=>{const b=poly([[0,.08],[.4,.08],[.34,.38],[.06,.38]]);k.fill(b,INK.sky);k.dots(b,INK.blue,.03,.4);k.key(b,.012);k.key('M.04 .08 Q.2 -.1 .36 .08',.012);k.fill(ell(.2,.09,.18,.03),INK.blue);});
const helpFrame=sp('help',1.1,1.35,k=>{k.keyFill(rect(.2,1.12,.08,.23),INK.brown);k.keyFill(rect(.82,1.12,.08,.23),INK.brown);const b=rect(0,0,1.1,1.12);k.fill(b,INK.white);k.key(b,.016);const inn=rect(.08,.08,.94,.8);k.fill(inn,INK.sky2);k.dots(inn,INK.sky,.04,.4);
 k.fill('M.22 .88 Q.26 .6 .55 .58 Q.84 .6 .88 .88 Z',INK.navy);k.circle(.55,.42,.14,'#d99a6c');k.key(ell(.55,.42,.14,.14),.01);k.fill('M.39 .37 Q.55 .19 .71 .37 Z',INK.navy);k.fill(rect(.36,.35,.38,.04),INK.navy);k.key('M.49 .48 Q.55 .53 .61 .48',.012);k.circle(.5,.42,.013,INK.navy,true);k.circle(.6,.42,.013,INK.navy,true);
 k.fill(`M.5 .64 C.44 .58 .47 .54 .5 .58 C.53 .54 .56 .58 .5 .64 Z`,INK.pink);
 const band=rect(.06,.92,.98,.15);k.fill(band,INK.yellow);k.key(band,.01);k.text('JEAN VARRAUD',.55,1.03,.09,INK.navy,{max:.9});});
const helpFlap=sp('helpflap',1.1,1.12,k=>{const b=rect(0,0,1.1,1.12);k.fill(b,INK.pink);k.dots(b,INK.navy,.035,.2);k.key(b,.016);k.text('WHO',.55,.45,.24,INK.white);k.text('HELPED?',.55,.76,.22,INK.white,{max:.95});k.fill(`M.47 .88 L.63 .88 L.55 .98 Z`,INK.yellow);},{rim:.016});
// Page 4: the players' tunnel with a see-through railing gate.
const tunnel=sp('tunnel',1.4,1.25,k=>{const a=`M0 1.25 L0 .4 Q.7 -.05 1.4 .4 L1.4 1.25 Z`;k.fill(a,'#3a4d86');k.dots(a,INK.blue,.04,.35);k.key(a,.014);const m=`M.2 1.25 L.2 .52 Q.7 .22 1.2 .52 L1.2 1.25 Z`;k.fill(m,'#141d3a');k.dots(m,INK.navy,.04,.4);k.key(m,.012);k.text('TUNNEL',.7,.38,.1,INK.yellow);});
const gatePosts=sp('posts',1.2,.8,k=>{for(const x of [0,1.12]){const p=rect(x,0,.08,.8);k.fill(p,INK.white);k.key(p,.01);k.circle(x+.04,.04,.04,INK.gold);}});
const gateLeaf=(key:string)=>sp(key,.52,.66,k=>{k.fill(rect(0,.06,.52,.05),INK.red);k.fill(rect(0,.56,.52,.05),INK.red);for(let i=0;i<6;i++){const x=.02+i*.096;k.fill(rect(x,0,.035,.66),INK.white);k.key(rect(x,0,.035,.66),.006);}k.key(rect(0,.06,.52,.05),.006);k.key(rect(0,.56,.52,.05),.006);},{rim:.012});
// Page 5: shirt on the peg, the group table.
const shirtHook=sp('shirt',.7,.82,k=>{k.key('M.35 0 L.35 .12',.02);k.circle(.35,.04,.03,INK.gold);const s=poly([[.1,.2],[.26,.12],[.35,.18],[.44,.12],[.6,.2],[.68,.38],[.56,.42],[.54,.8],[.16,.8],[.14,.42],[.02,.38]]);k.fill(s,INK.blue);k.dots(s,INK.navy,.035,.25);k.key(s,.012);k.text('10',.35,.6,.2,INK.white);},{rim:.016});
const groupTable=sp('table',1.3,1.5,k=>{k.keyFill(rect(.2,1.2,.08,.3),INK.brown);k.keyFill(rect(1.02,1.2,.08,.3),INK.brown);const b=rect(0,0,1.3,1.2);k.fill(b,INK.white);k.key(b,.016);k.fill(rect(0,0,1.3,.2),INK.navy);k.text('GROUP',.65,.15,.12,INK.white);
 for(let i=0;i<4;i++){const y=.26+i*.23;k.fill(rect(.06,y,1.18,.19),i%2?INK.sky2:INK.stock);k.key(rect(.06,y,1.18,.19),.006);k.text(String(i+1),.16,y+.14,.12,INK.navy);}});
// Page 6: fourteen red cards.
const tally=sp('tally',1.5,1.25,k=>{k.keyFill(rect(.3,1.0,.08,.25),INK.brown);k.keyFill(rect(1.12,1.0,.08,.25),INK.brown);const b=rect(0,0,1.5,1.0);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.15);k.key(b,.016);k.text('RED CARDS',.75,.17,.12,INK.navy);
 for(let i=0;i<14;i++){const c=i%7,r=i/7|0,x=.14+c*.184,y=.3+r*.33;const cd=rect(x,y,.12,.25);k.fill(cd,INK.red);k.key(cd,.01);}});

/* ───────────── 1 · Two homes, one family (marseille) ───────────── */
const marseille:SpreadDef={id:'marseille',rest:22.9,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,INK.sand);k.dots(p,INK.orange,.06,(x,y)=>.14+.08*Math.sin(x*1.3+y));
  const road=`M-5 ${Z(.35)} Q-3.4 ${Z(-.1)} -2.4 ${Z(.75)} Q-1.2 ${Z(1.35)} 0 ${Z(.9)} L0 ${Z(1.45)} Q-1.3 ${Z(1.95)} -2.6 ${Z(1.3)} Q-3.6 ${Z(.5)} -5 ${Z(.95)} Z`;k.fill(road,'#e6c27f');k.key(road,.012,'#b88f4e');
  footprints(k,-4.7,Z(.62),-.3,Z(1.2),15,INK.brown);
  mapCard(k,-4.85,Z(1.5),1.3,1.45,'FRANCE','ALGERIA');
  k.text('KABYLIA',-1.95,Z(2.62),.48,INK.orange,{max:2.8});k.text('ALGERIA · 1953',-1.95,Z(2.9),.17,INK.navy,{weight:800});},
 right:k=>{concrete(k,0,5);chalk(k,ell(0,Z(.3),1.05,1.05));for(let i=0;i<5;i++)chalk(k,rect(4.5,Z(.7)+i*.34,.32,.32),.02);
  k.text('LA CASTELLANE',2.4,Z(2.62),.36,INK.pink,{max:3.6});k.text('MARSEILLE · 1972',2.4,Z(2.9),.17,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>village(k,4.5,3)},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const sea=rect(0,1.5,4.5,.55);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);for(let i=0;i<6;i++)k.key(`M${.5+i*.7} ${1.7+(i%2)*.15} l.25 0`,.012,INK.white);
    const land=`M0 2.0 L4.5 2.05 L4.5 3 L0 3 Z`;k.fill(land,'#e7d3a6');k.dots(land,INK.orange,.05,.15);
    for(let i=0;i<7;i++){const x=1.9+i*.36,h=.25+((i*5)%3)*.08,b=rect(x,2.05-h+.25,.3,h);k.fill(b,i%2?'#f0c89a':'#f6d9a4');k.key(b,.01);k.fill(poly([[x-.03,2.3-h],[x+.15,2.3-h-.12],[x+.33,2.3-h]]),INK.red);}
    tower(k,.1,.6,.85,2.4,'#f1c9b0',5);tower(k,1.05,1.05,.7,1.95,'#eedcae',6);k.fill(rect(0,2.7,4.5,.3),INK.stone);k.key(`M0 2.7 L4.5 2.7`,.014);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'m-sun',.36),'L',3.5,1.9,{out:.012}),cloud=bd.add(S.cloud(K+'m-cloud',1.0,.45),'R',2.8,2.45),birds=bd.add(S.birds(K+'m-birds',.9,.35),'L',1.6,2.35,{out:.02});
  const moonP=bd.add(moon,'R',3.6,2.3,{out:.02}),starsP=bd.add(S.stars(K+'m-stars',1.8,.5,7),'R',1.3,2.4,{out:.02});
  const bunt=bd.add(S.bunting(K+'m-bunt',3.6,.4,[INK.blue,INK.white,INK.red,INK.green,INK.white,INK.red]),'R',.4,2.45,{out:.03});
  const wash1=bd.add(laundry('m-laundry',.9,.32),'R',1.1,1.3,{out:.02});
  B.stand(S.tree(K+'m-olive',1.1,1.3,'olive'),-4.35,-1.35,{layer:1});
  const paris=B.stand(S.sign(K+'m-paris',1.0,1.2,'PARIS'),-.6,-1.65,{layer:1,s:0});
  const flatsR=B.stand(flats('m-flatsR',1.35,2.4,'#f0b7a4','#cf7b6b',2),3.95,-1.33,{layer:1,s:0});
  const msign=B.stand(S.sign(K+'m-msign',1.1,1.2,'MARSEILLE'),1.35,-1.6,{layer:1,s:0});
  const c60=msign.flap(S.flipCard(K+'m-1960s',.85,.36,'1960s',INK.pink),0,1.2*.56,{z:.03});
  B.stand(S.bench(K+'m-bench',1.0,.42),2.55,-1.45,{layer:1});
  const lampS=B.stand(S.lamp(K+'m-lamp',.4,1.7),-.14,-.8,{layer:2,s:0});const glow=lampS.add(pow('m-glow',.26),0,1.53,{anchor:'center',z:-.01});
  const boxS=B.stand(boxes,-.5,.5,{layer:2,s:0});const night=boxS.add(S.flipCard(K+'m-night',1.0,.3,'NIGHT SHIFT',INK.navy,INK.yellow),0,.74,{z:.012});
  const mum=B.person(K+'m-mum',-3.7,-.2,1.72,{shirt:'coach',hair:'long',adult:true,skin:'#b27650',face:'smile',layer:2,holdR:'suitcase'});
  const dad=B.person(K+'m-dad',-3.1,0,1.8,{shirt:'casual',hair:'short',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const caseS=B.stand(caseBody,-2.35,1.55,{layer:3,s:0});const lid=caseS.flap(caseLid,0,.78,{z:.02});const love=caseS.add(S.bubble(K+'m-love',.5,.42,'heart'),.95,.75,{anchor:'center',z:.03});
  const kidsX=[.95,1.5,2.05,2.55,3.05],kidsH=[1.3,1.24,1.16,1.08,.98];
  const kids=kidsX.map((x,i)=>B.person(K+`m-kid${i}`,x,.95-(i%2)*.2,kidsH[i],{shirt:i===4?'navy':'casual',hair:(['long','short','bun','curly','short'] as const)[i],skin:['#b27650','#d99a6c','#b27650','#d99a6c','#d99a6c'][i],face:i===4?'smile':'grin',layer:3}));
  const H=kids[4];const c72=H.body.add(S.flipCard(K+'m-1972',.62,.3,'1972',INK.pink),0,H.h*1.04,{z:.02});
  const heartH=H.body.add(S.bubble(K+'m-hH',.46,.4,'heart'),-.42,H.h*1.0,{z:-.02}),heartD=dad.body.add(S.bubble(K+'m-hD',.5,.44,'heart'),.45,dad.h*1.0,{z:-.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.9):b.t;
   sun.dy=.4*beat(t,0,2.2);pop(sun,1-beat(t,25.2,26.2)+beat(t,35.6,36.6));birds.dx=1.1*beat(t,1,20);birds.dy=.06*wave(t,1,20,.8);cloud.dx=-.7*beat(t,0,40);wash1.rot=.05*wave(t,13,40,.6);
   pop(moonP,beat(t,25.4,26.2)*(1-beat(t,35.4,36.2)));pop(starsP,beat(t,25.8,26.6)*(1-beat(t,35.4,36.2)));pop(bunt,beat(t,36.1,37));bunt.dy=.03*wave(t,37,46,.6);
   // 1953: the parents leave their village with a suitcase; Paris; then La Castellane.
   mum.body.s=beat(t,2.8,3.6);dad.body.s=beat(t,3.2,4);caseS.s=beat(t,5.4,6.2);
   const walk=beat(t,8.4,10)*.6+beat(t,13.4,16)*.4;mum.body.x=-3.7+1.4*walk;dad.body.x=-3.1+1.4*walk;
   paris.s=beat(t,7.6,8.4);
   const shrug=pulse(t,10.4,12.4);dad.armL.rot=-.12-1.1*shrug;dad.armR.rot=.12+1.1*shrug;mum.armL.rot=-.12-.4*shrug;
   flatsR.s=beat(t,12.8,13.8);msign.s=beat(t,14,14.8);c60.flip=-2.9+2.9*beat(t,14.9,15.6);
   kids.forEach((p,i)=>{p.body.s=beat(t,17.5+i*.62,18.3+i*.62);});pop(c72,beat(t,20.6,21.3));
   // Open the suitcase: the family photo and the route from Algeria.
   const open=manual?beat(act,0,.6):beat(t,23.2,24.4);lid.flip=-2.7*open;pop(love,manual?beat(act,.55,.85):beat(t,24.2,24.9)*(1-beat(t,29.5,30.2)));
   // Night shifts: moon, the warehouse boxes; then the guiding light.
   boxS.s=beat(t,25.6,26.4);pop(night,beat(t,26.2,26.9));
   const lift=pulse(t,27,29.6);dad.armR.rot+=.9*lift;
   lampS.s=beat(t,30.4,31.2);pop(glow,beat(t,31,31.8)*(1+.08*Math.sin(t*3)));glow.rot=t*.3;
   dad.armR.rot+=2.2*beat(t,31.6,32.2)-2.2*beat(t,34.6,35.2);H.body.yaw=-.5*pulse(t,30.6,35.2);
   pop(heartH,beat(t,37,37.6)*(1-beat(t,41.2,41.8)));pop(heartD,beat(t,37.4,38)*(1-beat(t,41.2,41.8)));
   kids.forEach((p,i)=>{if(t>41.2)cheer(p,beat(t,41.5+i*.15,42.1+i*.15),t+i);else if(i<4)p.armR.rot=.12+.3*wave(t,19,22,1.2+i*.2);});
   if(t>41.2){cheer(mum,beat(t,42.2,42.8),t);cheer(dad,beat(t,42.4,43),t+.5);}
   return b.narrated?-.4*beat(t,2.3,3.4)+.4*beat(t,12.4,13.4)+.35*beat(t,17,18)-.35*beat(t,22.5,23.3)-.3*beat(t,25.2,26)+.3*beat(t,35.2,36.2):0;
  };
 }};

/* ───────────── 2 · Far from home (scan) ───────────── */
const scan:SpreadDef={id:'scan',rest:19.3,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(0,Z(.2),1.0,1.0));dash(k,-3.6,Z(.95),-2.2,Z(.6),.03,INK.yellow);
  k.text('AGED 14',-2.3,Z(2.62),.46,INK.pink,{max:3.6});k.text('SPOTTED AT A TRAINING CAMP',-2.3,Z(2.9),.15,INK.navy,{weight:800,max:4});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#f1dcb0');k.dots(p,INK.orange,.06,.14);for(let x=.5;x<5;x+=.5)k.key(`M${x} 0 L${x} ${PAGE_D}`,.01,'#d2b682');for(let y=.5;y<PAGE_D;y+=.5)k.key(`M0 ${y} L5 ${y}`,.01,'#d2b682');
  footprints(k,1.9,Z(1.25),2.55,Z(.75),6,INK.brown);
  k.text('CANNES',2.5,Z(2.62),.5,INK.blue,{max:3.6});k.text('A NEW HOME WITH THE ELINEAU FAMILY',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:2.9,paint:k=>{wash(k,4.5,2.9,INK.sky2,INK.sky,y=>.75-y/2.9*.75);const hills=`M0 1.9 Q1 1.3 2.2 1.6 Q3.4 1.9 4.5 1.5 L4.5 2.9 L0 2.9 Z`;k.fill(hills,'#b9c98a');k.dots(hills,INK.green,.05,.3);pines(k,.1,4.4,1.95);
    const club=rect(.5,1.45,1.5,.8);k.fill(club,'#f6e4c0');k.key(club,.013);k.fill(poly([[.4,1.5],[1.25,1.18],[2.1,1.5]]),INK.red);k.key(poly([[.4,1.5],[1.25,1.18],[2.1,1.5]]),.012);for(let i=0;i<3;i++)k.fill(rect(.68+i*.44,1.7,.28,.24),INK.blue);
    k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,.78,.008);k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,-.78,.008);k.fill(rect(0,2.4,4.5,.5),INK.grass);}},
   {key:K+'s-bdR',w:4.5,h:2.9,paint:k=>{wash(k,4.5,2.9,INK.sky2,INK.yellow,y=>.5-y/2.9*.5);const sea=rect(0,1.45,4.5,.6);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.6} ${1.62+(i%2)*.18} l.22 0`,.012,INK.white);
    for(let i=0;i<6;i++){const x=.2+i*.72,h=.45+(i%3)*.15,b=rect(x,2.1-h,.55,h);k.fill(b,i%2?'#f6e0bd':'#f3cfa8');k.key(b,.01);for(let j=0;j<2;j++)k.fill(rect(x+.08+j*.24,2.1-h+.1,.14,.12),INK.sky);}
    for(const x of [.6,2.3,3.9]){k.key(`M${x} 2.4 Q${x+.05} 1.9 ${x+.02} 1.6`,.03,INK.brown);for(let a=0;a<5;a++){const r=a/4*Math.PI;k.key(`M${x+.02} 1.6 Q${x+.02+Math.cos(r)*.18} ${1.5} ${x+.02+Math.cos(r)*.3} ${1.62+Math.abs(Math.sin(r))*-.02+.08}`,.028,INK.leaf);}}
    const prom=rect(0,2.3,4.5,.6);k.fill(prom,INK.sand);k.dots(prom,INK.orange,.05,.2);k.key(`M0 2.3 L4.5 2.3`,.014);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.34),'R',3.6,2.2,{out:.012}),clouds=[bd.add(S.cloud(K+'s-cl1',1.0,.45),'L',2.2,2.35),bd.add(S.cloud(K+'s-cl2',.8,.36),'R',1.4,2.4)];
  B.stand(S.tree(K+'s-pine',1.0,1.7,'pine'),-.45,-1.75,{layer:1});
  for(const [x,z] of [[-1.9,-.9],[-2.6,-.4],[-.8,-.2]])B.stand(S.cone(K+`s-cone${x}`,.32),x,z,{layer:2});
  const cal=B.stand(S.scoreboard(K+'s-cal',1.9,1.45,'CANNES'),-2.5,-1.6,{layer:1,s:0});
  cal.add(S.flipCard(K+'s-4y',1.45,.62,'4 YEARS',INK.pink),0,.4,{z:.012});const w6=cal.flap(S.flipCard(K+'s-6w',1.45,.62,'6 WEEKS','#3d5da0'),0,1.02,{z:.024});
  const scout=B.person(K+'s-scout',-1.25,-.25,1.72,{shirt:'coach',hair:'cap',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const star=scout.body.add(S.bubble(K+'s-star',.56,.48,'star'),.55,scout.h*.98,{z:-.02});
  const A=B.person(K+'s-kidA',-3.1,.75,1.26,{shirt:'navy',hair:'short',skin:'#d99a6c',legs:'kick',face:'smile',layer:3});
  const ball=B.stand(S.ball(K+'s-ball',.12),-2.7,.85,{layer:3,tab:false});
  const mum=B.person(K+'s-mum',-4.3,-.8,1.7,{shirt:'coach',hair:'long',adult:true,skin:'#b27650',face:'smile',layer:1}),dad=B.person(K+'s-dad',-3.7,-1.0,1.78,{shirt:'casual',hair:'short',adult:true,skin:'#d99a6c',face:'smile',layer:1});
  const dorm=B.stand(flats('s-dorm',1.3,2.1,'#efe0c2','#c7a978',3),1.05,-1.7,{layer:1,s:0});const dl=dorm.add(S.flipCard(K+'s-dorml',1.2,.28,'DORMITORY',INK.navy,INK.white),0,2.12,{z:.012});
  const trainees=B.stand(trainee('s-train'),1.1,-.75,{layer:2,s:0});
  const house=B.stand(S.house(K+'s-house',1.55,1.75),3.85,-.55,{layer:2});const door=house.flap(S.door(K+'s-door',.3,.5),-.15,.02,{anchor:'bl',axis:'y',z:.012});
  const E=B.person(K+'s-eli',3.05,-.05,1.78,{shirt:'casual',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const E2=B.person(K+'s-eli2',4.75,.35,1.68,{shirt:'coach',hair:'bun',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const heartE=E.body.add(S.bubble(K+'s-hE',.5,.44,'heart'),-.5,E.h*.98,{z:-.02});
  const Bk=B.person(K+'s-kidB',1.95,1.05,1.26,{shirt:'navy',hair:'short',skin:'#d99a6c',face:'smile',layer:3,holdL:'suitcase'});B.slot(1.9,1.15,2.55,.62);
  const heartB=Bk.body.add(S.bubble(K+'s-hB',.46,.4,'heart'),-.42,Bk.h*.98,{z:-.02});
  const knocks=[0,1,2].map(i=>B.stand(S.flipCard(K+`s-knock${i}`,.62,.28,'KNOCK',[INK.yellow,INK.orange,INK.pink][i],INK.navy),3.0+i*.7,1.95,{layer:3,s:0}));
  const post=B.stand(S.post(K+'s-bpost',.08,1.0),.75,1.0,{layer:3,s:0});const beam=post.arm(scaleBeam,0,.96,{z:.02});
  const balCard=B.stand(S.flipCard(K+'s-bal',.9,.3,'BALANCE',INK.yellow,INK.navy),.75,1.85,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.3):b.t;
   sun.dy=.3*beat(t,0,2);clouds[0].dx=.5*beat(t,0,40);clouds[1].dx=-.4*beat(t,0,40);
   // Spotted at a training camp by a scout.
   A.body.s=beat(t,.6,1.5)*(1-beat(t,13.6,14.4));ball.visible=A.body.s>.3;
   const dr=[3,3.8,4.6,5.4,6.2,7];ball.x=-2.7+.08*wave(t,2.5,13,1.2);ball.dy=.12*maxOf(dr.map(a=>pulse(t,a-.3,a+.3)));A.leg!.rot=-.7*maxOf(dr.map(a=>pulse(t,a-.3,a)));
   scout.body.s=beat(t,2.2,3);pop(star,beat(t,5.4,6)*(1-beat(t,8.6,9.2)));scout.armR.rot=.12+1.5*beat(t,5.6,6.2)-1.5*beat(t,8.4,9);
   // Six weeks became four years.
   cal.s=beat(t,8.8,9.6);w6.flip=-3.2*beat(t,11.1,11.9);
   // Leaving his family: they wave goodbye; the dormitory with the other trainees.
   mum.body.s=beat(t,13.5,14.3);dad.body.s=beat(t,13.8,14.6);const bye=beat(t,14.6,15.2)*(1-beat(t,18.6,19.2));mum.armR.rot=.12+2.1*bye+.3*bye*Math.sin(t*8);dad.armL.rot=-.12-2.1*bye-.3*bye*Math.sin(t*8+1);
   dorm.s=beat(t,14,15);pop(dl,beat(t,14.8,15.4));trainees.s=beat(t,15.6,16.6);
   Bk.body.s=beat(t,14.2,15);const bw=manual?1:beat(t,16.8,19);Bk.body.x=1.95+.6*bw;Bk.body.z=1.05-.45*bw;
   // Knock three times; the door opens; a kind family reaches out.
   const k1=manual?beat(act,.12,.3):beat(t,19.7,20.1),k2=manual?beat(act,.45,.63):beat(t,20.4,20.8),k3=manual?beat(act,.78,.9):beat(t,21.1,21.5);
   knocks[0].s=k1;knocks[1].s=k2;knocks[2].s=k3;
   const kn=manual?Math.max(pulse(act,0,.3),pulse(act,.34,.63),pulse(act,.67,.9)):maxOf([19.9,20.6,21.3].map(a=>pulse(t,a-.3,a+.25)));Bk.armR.rot=.12+1.5*kn;
   const open=manual?beat(act,.85,1):beat(t,22.2,23.2);door.flip=-1.8*open;
   E.body.s=manual?beat(act,.88,1):beat(t,22.6,23.4);E2.body.s=manual?beat(act,.92,1):beat(t,24,24.8);
   const reach=manual?beat(act,.9,1):beat(t,23.6,24.4);E.armL.rot=-.12-1.35*reach;E2.armR.rot=.12+.6*beat(t,25,25.6);
   // Balance.
   post.s=beat(t,29.6,30.4);beam.rot=.34*(1-beat(t,31,32.6))+.05*wave(t,32.6,36,.8);balCard.s=beat(t,31.6,32.3);
   pop(heartE,beat(t,34.2,34.8));pop(heartB,beat(t,35,35.6));
   if(t>38.8){cheer(Bk,beat(t,39,39.6),t);cheer(E2,beat(t,39.4,40),t+.4);}
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,12.8,13.6)+.45*beat(t,19,20)-.45*beat(t,29.2,30):0;
  };
 }};

/* ───────────── 3 · Words that hurt (ninetyeight) ───────────── */
const ninetyeight:SpreadDef={id:'ninetyeight',rest:19.1,
 left:k=>{pitch(k,-5,0,'#7fa77a','#4f7f6a',.85);chalk(k,ell(0,Z(-.4),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('WORDS THAT HURT',-2.4,Z(2.62),.36,INK.pink,{max:4});k.text('INSULTS ARE NEVER OKAY',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,ell(0,Z(-.4),1.0,1.0));chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.9 ${Z(-2.1)} L2.9 ${Z(-1.2)} L5 ${Z(-1.2)}`);dash(k,.7,Z(1.3),3.6,Z(-1.0),.03,INK.yellow);
  k.text('FOCUS',2.5,Z(2.62),.5,INK.blue,{max:3.4});k.text('TURN ANGER INTO FOCUS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#a9a3c4',INK.navy,y=>.35-y*.08);crowd(k,4.5,1.55,2.65,['#6f7fb0',INK.white,'#9aa3c7','#8d93a8'],2);k.fill(rect(0,2.65,4.5,.35),'#7fa77a');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.5);const hill=`M0 2.1 Q1.5 1.5 2.8 1.9 Q3.8 2.2 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hill,INK.grass);k.dots(hill,INK.leaf,.05,.35);pines(k,2.6,4.4,2.05,INK.leaf);k.fill(rect(0,2.65,4.5,.35),INK.grass);}},-3.05,1.22);
  const jabs=[[3.8,1.9],[2.9,2.2],[1.9,1.85],[1.0,2.25]].map(([a,u],i)=>bd.add(jab(`w-jab${i}`,.62,.46),'L',a,u,{out:.03}));
  const storm=bd.add(stormCloud('w-storm',1.4,.72),'L',1.4,1.25,{out:.04});
  const sun=bd.add(S.sun(K+'w-sun',.4),'R',2.2,1.2,{out:.015}),birds=bd.add(S.birds(K+'w-birds',.9,.35),'R',3.2,2.2,{out:.02});
  B.stand(S.tree(K+'w-tree',1.0,1.5,'round','#6d8f76'),-4.5,-1.4,{layer:1});
  const H=B.person(K+'w-hero',-1.55,.85,1.34,{shirt:'navy',hair:'short',skin:'#d99a6c',face:'smile',layer:3});
  const bwH=H.h*320/512,crossF=H.body.flap(angryHead('w-cross',H.h,'#d99a6c'),(150/320-.5)*bwH,H.h*(1-30/512),{anchor:'top',z:.016});
  const brm=H.body.arm(broom,.28,H.h*.5,{z:.02});
  const heartH=H.body.add(S.bubble(K+'w-hH',.5,.44,'heart'),.45,H.h*.98,{z:-.02});
  const sight=cone(H,'w-sight',1.9,.7);
  const O=B.person(K+'w-opp',-2.85,.35,1.3,{shirt:'casual',hair:'curly',skin:'#f1b88f',face:'open',layer:2});
  const bang=B.stand(pow('w-bang',.22),-2.2,.7,{layer:3,tab:false,s:0});const no=B.stand(S.icon(K+'w-no',.34,'cross'),-2.2,1.2,{layer:3,tab:false,s:0});
  const buck=B.stand(bucket,-.75,1.45,{layer:3,s:0});
  const fr=B.stand(S.flipCard(K+'w-fr',.9,.32,'FRANCE',INK.blue),-4.1,1.75,{layer:3,s:0}),dz=B.stand(S.flipCard(K+'w-dz',.9,.32,'ALGERIA',INK.green),-3.05,1.75,{layer:3,s:0});
  const frame=B.stand(helpFrame,2.35,-1.0,{layer:1});const flap=frame.flap(helpFlap,0,1.35,{z:.02});
  const V=B.person(K+'w-coach',.95,.25,1.76,{shirt:'coach',hair:'cap',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  B.stand(S.goal(K+'w-goal',1.4,.75),4.0,-1.36,{layer:1});
  const ball=B.stand(S.ball(K+'w-ball',.12),.7,1.3,{layer:3,tab:false});
  const T1=B.person(K+'w-t1',4.2,.9,1.24,{shirt:'navy',hair:'curly',skin:'#7f5138',face:'grin',layer:3});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.1):b.t;
   // Insults from the stands; a storm gathers.
   jabs.forEach((j,i)=>{pop(j,beat(t,2+i*.55,2.5+i*.55)*(1-beat(t,32.6+i*.25,33.3+i*.25)));j.rot=.06*wave(t,2.5,32,.9+i*.15);});
   pop(storm,beat(t,4.8,6)*(1-beat(t,32.8,34.2)));storm.dx=.06*wave(t,6,32,.3);
   pop(sun,beat(t,33.6,34.6));sun.dy=.8*beat(t,33.6,36);birds.dx=-1*beat(t,34,44);birds.visible=t>34;
   // Sensitive; the cross face drops down. Later the calm face returns.
   const calm=manual?beat(act,.55,.9):beat(t,24,24.8);const cross=beat(t,8,8.6)*(1-calm);crossF.flip=-2.75*(1-cross);crossF.visible=cross>.02;
   H.armL.rot=-.12-.35*pulse(t,2.4,6);H.body.yaw=-.35*pulse(t,2.4,6.4);
   // Once he hit back; then cleaning duty.
   O.body.s=beat(t,11.2,12);O.armL.rot=-.12-1.2*pulse(t,11.8,13.2);
   const hit=pulse(t,13.1,13.9);H.body.x=-1.55-.35*hit;H.armR.rot=.12+1.3*hit;O.body.rot=.18*pulse(t,13.3,14.4);
   bang.s=hit;bang.visible=hit>.02;
   const sweep=beat(t,15.4,16)*(1-beat(t,19.3,19.9));pop(brm,manual?0:sweep);brm.rot=.35*Math.sin(t*3.4)*sweep;buck.s=beat(t,15.6,16.3)*(1-beat(t,19.8,20.6));if(manual)buck.s=0;
   if(sweep>.02)H.armR.rot=.12+.5*sweep+.2*Math.sin(t*3.4)*sweep;
   // Who helped: lift the flap; the coach steps in and reaches out.
   const lift=manual?beat(act,0,.5):beat(t,19.6,20.8);flap.flip=-2.8*lift;
   V.body.s=manual?beat(act,.3,.6):beat(t,21.7,22.5);const reach=manual?beat(act,.5,.8):beat(t,22.8,23.6);V.armL.rot=-.12-1.35*reach*(1-beat(t,33,33.8));
   pop(sight,manual?beat(act,.75,1):beat(t,25,25.8)*(1-beat(t,31.8,32.4)));sight.rot=1.25;
   const shot=beat(t,26.4,27.8);ball.x=.7+2.95*shot;ball.z=1.3-2.35*shot;ball.rot=-shot*9;
   // Two cultures.
   fr.s=beat(t,28.1,28.8);dz.s=beat(t,28.7,29.4);fr.yaw=.25*beat(t,30,31);dz.yaw=-.25*beat(t,30,31);
   // Hitting back only makes things harder.
   no.s=beat(t,34.6,35.2)*(1-beat(t,38.2,38.8));
   pop(heartH,beat(t,39,39.6));if(t>38.6){H.body.yaw=.4*beat(t,38.8,39.4);cheer(T1,beat(t,40,40.6),t);}
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,18.6,19.4)+.4*beat(t,21.4,22.2)-.4*beat(t,27.6,28.4)-.3*beat(t,32.2,33)+.3*beat(t,38.4,39.2):0;
  };
 }};

/* ───────────── 4 · Sent off, then back (volley, 1998) ───────────── */
const FRA=[INK.blue,INK.white,INK.red,INK.blue,INK.white,INK.yellow,INK.blue];
const N_PIV=.27,N_L=2.5,N_TH0=-1.5,N_TH1=.95,N_X=-1.3,N_Z=1.2,N_SHOTS=[[28.0,29.2],[30.1,31.3]];
function swing(t:number,shots:number[][],th0:number,th1:number){let th=th0,vis=true,hit=-1;
 for(let i=0;i<shots.length;i++){const [a,b]=shots[i];if(t<a-.9)break;
  if(t<a){th=i===0?th0:th1+(th0-th1)*smooth((t-(a-.9))/.9);vis=i===0;hit=-1;}
  else if(t<b){const u=(t-a)/(b-a);th=th0+(th1-th0)*(u*.7+smooth(u)*.3);vis=true;hit=-1;}
  else{th=th1;vis=false;hit=t-b;}}
 return {th,vis,hit};}
const volley:SpreadDef={id:'volley',rest:18.6,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(1.55)} L0 ${Z(1.55)}`);chalk(k,`M-4.65 ${Z(1.0)} A.45 .45 0 0 0 -4.2 ${Z(1.55)}`);chalk(k,ell(0,Z(-1.4),1.0,1.0));footprints(k,-3.9,Z(-.7),-2.4,Z(.35),6,INK.white);
  k.text('1998',-2.2,Z(2.62),.56,INK.yellow,{max:2.6});k.text('FRANCE HOSTED THE WORLD CUP',-2.2,Z(2.9),.15,INK.white,{weight:800,max:4});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(1.55)} L5 ${Z(1.55)}`);chalk(k,`M2.2 ${Z(-1.35)} L2.2 ${Z(.45)} L5 ${Z(.45)}`);chalk(k,`M3.2 ${Z(-1.35)} L3.2 ${Z(-.55)} L5 ${Z(-.55)}`);k.circle(1.45,Z(-.1),.05,INK.white);
  k.text('FRANCE 3–0 BRAZIL',2.5,Z(2.62),.38,INK.yellow,{max:4.2});k.text('TWO HEADERS IN THE FINAL',2.5,Z(2.9),.15,INK.white,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:K+'v-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);
    const e='M1.0 .15 L1.06 .15 L1.14 .7 L1.3 1.2 L.76 1.2 L.92 .7 Z';k.fill(e,'#3a4d86');k.hatch(e,INK.yellow,.05,.7,.008);k.hatch(e,INK.yellow,.05,-.7,.008);k.key(e,.012);k.key('M.84 .95 L1.22 .95 M.9 .7 L1.16 .7',.012);k.circle(1.03,.12,.03,INK.yellow);
    crowd(k,4.5,1.2,2.6,FRA,1);lightRig(k,2.3,.3);lightRig(k,3.8,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'v-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.yellow,INK.green,INK.blue,INK.white,INK.yellow,INK.red,INK.white],3);lightRig(k,1.2,.3);lightRig(k,3.7,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'v-ban',2.6,.4,'WORLD CUP 1998',INK.blue),'L',1.55,2.8,{out:.02});
  const fw=[bd.add(S.firework(K+'v-fw1',.42,INK.red),'R',1.3,1.75,{out:.03}),bd.add(S.firework(K+'v-fw2',.38,INK.white),'R',3.2,1.6,{out:.03}),bd.add(S.firework(K+'v-fw3',.4,'#6fb6e2'),'L',2.6,1.9,{out:.03})];
  const conf=[bd.add(S.confetti(K+'v-cf1',2.2,1.1,1),'R',.4,1.3,{out:.04}),bd.add(S.confetti(K+'v-cf2',2.2,1.1,2),'L',.5,1.3,{out:.04})];
  const board=B.stand(S.scoreboard(K+'v-board',2.0,1.5,'FRANCE – BRAZIL'),-2.1,-1.6,{layer:1});
  board.add(S.flipCard(K+'v-s3',1.5,.7,'3 – 0',INK.pink),0,.4,{z:.012});
  const flaps=['FINAL','0 – 0','1 – 0','2 – 0'].map((l,i)=>board.flap(S.flipCard(K+`v-s${i}`,1.5,.7,l,i%2?INK.blue:'#3d5da0'),0,1.1,{z:.03-i*.005}));
  const tun=B.stand(tunnel,-4.05,-1.3,{layer:1});void tun;
  const gp=B.stand(gatePosts,-4.05,-.55,{layer:2});const gL=gp.flap(gateLeaf('v-gL'),-.54,0,{anchor:'bl',axis:'y',z:.014}),gR=gp.flap(gateLeaf('v-gR'),.54,0,{anchor:'br',axis:'y',z:.014});
  const trophy=B.stand(S.trophy(K+'v-trophy',.55,.95),1.35,-1.55,{layer:1,s:0});
  B.stand(S.goal(K+'v-goal',1.9,.95),3.9,-1.3,{layer:1});
  const keeper=B.person(K+'v-keeper',3.9,-1.05,1.32,{shirt:'keeper',hair:'short',skin:'#b27650',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const BD=B.person(K+'v-bd',2.15,.55,1.32,{shirt:'bib',hair:'curly',skin:'#7f5138',number:'4',face:'open',layer:2});
  const mate=B.person(K+'v-mate',2.95,.95,1.3,{shirt:'navy',hair:'short',skin:'#f1b88f',number:'7',face:'smile',layer:3});
  const mate2=B.person(K+'v-mate2',4.55,.1,1.3,{shirt:'navy',hair:'curly',skin:'#7f5138',number:'8',face:'smile',layer:2});
  const flagPole=B.stand(pole('v-pole',1.0),-4.65,1.15,{layer:3});const flag=flagPole.flap(flagP('v-flag',.36,.24),.035,1.0,{anchor:'bl',axis:'y',z:.01});
  const kicker=B.person(K+'v-kick',-4.05,1.2,1.3,{shirt:'navy',hair:'curly',skin:'#d99a6c',legs:'kick',face:'smile',layer:3});
  const RF=B.person(K+'v-ref',-.75,.5,1.7,{shirt:'ger',hair:'short',skin:'#f1b88f',adult:true,face:'open',layer:2});const raiseCard=refCard(RF);
  const first=B.stand(S.flipCard(K+'v-first',1.5,.32,'FIRST FRENCH RED CARD',INK.red),-2.05,1.9,{layer:3,s:0});
  const HL=B.person(K+'v-heroL',-2.2,.5,1.36,{shirt:'navy',hair:'bald',skin:'#d99a6c',number:'10',face:'smile',layer:3});
  const HR=B.person(K+'v-hero',.73,1.2,1.36,{shirt:'navy',hair:'bald',skin:'#d99a6c',number:'10',face:'open',layer:3});
  const boom=HR.body.add(pow('v-pow',.2),0,HR.h*.98,{anchor:'center',z:.02});
  const post=B.stand(S.post(K+'v-post',.12,.3),N_X,N_Z,{layer:3});const arm=post.arm(S.strip(K+'v-strip',.09,2.62),0,N_PIV,{z:.02});const ballA=post.add(S.ball(K+'v-ballA',.13),0,0,{z:.035,anchor:'center'});
  const hball=B.stand(S.ball(K+'v-hball',.13),1,1,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.6):b.t;
   ban.dy=.04*wave(t,2.2,40,.6);
   // Sent off in the second match; the first French red card at a World Cup.
   RF.body.s=beat(t,6.2,7);raiseCard(beat(t,8.2,8.9)*(1-beat(t,11,11.6)));HL.body.yaw=-.6*beat(t,9.6,10.2)*(1-beat(t,15,15.6));
   first.s=beat(t,11.6,12.3)*(1-beat(t,21,21.8));
   // He walks behind the railing gate and can only watch; the gate opens and he comes back.
   const gOpen=manual?beat(act,0,.4):beat(t,19,20.2);gL.flip=-1.95*gOpen;gR.flip=1.95*gOpen;
   const away=beat(t,12.4,15),back=manual?beat(act,.35,1):beat(t,20.2,23.4);
   const [hx,hz]=back>0?track(back,[[0,-4.05,-.9],[.5,-3.2,-.1],[1,-2.3,.35]]):track(away,[[0,-2.2,.5],[.5,-3.3,-.2],[1,-4.05,-.9]]);HL.body.x=hx;HL.body.z=hz;
   HL.armL.rot=-.12-.4*pulse(t,15.6,18.4);HL.armR.rot=.12+.4*pulse(t,15.6,18.4);
   HL.body.s=manual?1:1-beat(t,24.6,25.3);HR.body.s=manual?0:beat(t,25,25.8);
   // The team won without him; all the way to the final against Brazil.
   const win=beat(t,21.8,22.4)*(1-beat(t,23.6,24.2));cheer(mate,win,t);cheer(mate2,win,t+.3);
   flaps[0].flip=-3.2*beat(t,26.1,26.8);
   // Two headers from corners, then 3–0.
   const sw=swing(t,N_SHOTS,N_TH0,N_TH1);
   arm.rot=Math.PI-sw.th;ballA.dx=Math.sin(sw.th)*N_L;ballA.dy=N_PIV+Math.cos(sw.th)*N_L;ballA.visible=sw.vis&&t>24;ballA.rot=-sw.th*3;arm.visible=t>24&&t<32.6;
   const hp=sw.hit<0?-1:clamp01(sw.hit/.75);hball.visible=hp>=0&&!manual;if(hp>=0){hball.x=.73+3.0*hp;hball.z=N_Z-2.25*hp;hball.dy=1.72-1.27*hp;hball.rot=-hp*8;}
   const strikes=N_SHOTS.map(s=>s[1]),starts=N_SHOTS.map(s=>s[0]);
   const jump=maxOf(strikes.map(x=>pulse(t,x-.35,x+.35)));HR.body.dy=.34*jump;
   pop(boom,maxOf(strikes.map(x=>pulse(t,x-.05,x+.4))));
   let leg=0;for(const a of starts)leg+=.6*beat(t,a-.5,a-.15)-1.8*beat(t,a-.15,a+.05)+1.2*beat(t,a+.4,a+.9);kicker.leg!.rot=leg;
   let fl=0;for(const a of starts)fl+=.6*wave(t,a-.9,a,1.6);flag.flip=fl;
   let dive=0;strikes.forEach((x,i)=>{const d=pulse(t,x+.15,x+1.3);if(d>Math.abs(dive))dive=(i%2?1:-1)*d;});
   keeper.body.rot=dive*.9;keeper.body.dx=-dive*.25;keeper.armL.rot=-.12-2.2*Math.abs(dive);keeper.armR.rot=.12+2.2*Math.abs(dive);
   BD.body.dy=.18*maxOf(strikes.map(x=>pulse(t,x-.05,x+.55)));
   flaps[1].flip=-3.2*beat(t,29.4,30);flaps[2].flip=-3.2*beat(t,31.5,32.1);flaps[3].flip=-3.2*beat(t,32.4,33);
   // Not the end of his story: trophy, fireworks, everyone celebrates.
   trophy.s=beat(t,33.3,34.3);
   fw.forEach((f,i)=>{pop(f,beat(t,33.2+i*.4,34+i*.4));f.rot=t*.2;});
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*beat(t,33.4+i*.4,35.6+i*.4);c.visible=t>33.3;});
   const party=beat(t,33.4,34);cheer(HR,Math.max(party,jump*.5),t);cheer(kicker,party,t+.2);if(t>33.3){cheer(mate,party,t+.4);cheer(mate2,party,t+.6);}
   if(manual)cheer(HL,beat(act,.85,1),t);
   return b.narrated?-.45*beat(t,5.8,6.8)+.45*beat(t,23.6,24.6)+.2*beat(t,27.6,28.4)-.2*beat(t,33,33.8):0;
  };
 }};

/* ───────────── 5 · Coming back (calm, 2004–2005) ───────────── */
const calm:SpreadDef={id:'calm',rest:17.2,
 left:k=>{pitch(k,-5,0,'#7fa77a','#4f7f6a',.85);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);river(k,-1.15,0);footprints(k,-2.9,Z(1.05),-1.35,Z(1.25),5,INK.white);
  k.text('2004',-3.0,Z(2.62),.5,INK.navy,{max:2.4});k.text('RETIRED FROM FRANCE',-3.0,Z(2.9),.15,INK.navy,{weight:800,max:3.4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);river(k,0,1.15);chalk(k,ell(2.9,Z(-.3),.8,.8));
  k.text('2005',3.0,Z(2.62),.5,INK.blue,{max:2.4});k.text('BACK AS CAPTAIN',3.0,Z(2.9),.15,INK.navy,{weight:800,max:3.4});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#a9a3c4',INK.navy,y=>.35-y*.08);const hills=`M0 2.1 Q1.3 1.6 2.4 1.9 Q3.5 2.2 4.5 1.8 L4.5 3 L0 3 Z`;k.fill(hills,'#6d8f76');k.dots(hills,INK.navy,.05,.3);crowd(k,4.5,2.05,2.65,['#6f7fb0',INK.white,'#9aa3c7',INK.white],2);k.fill(rect(0,2.65,4.5,.35),'#7fa77a');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.5);crowd(k,4.5,1.7,2.65,FRA,4);lightRig(k,1.3,.7);lightRig(k,3.6,.6);k.fill(rect(0,2.65,4.5,.35),INK.grass);}},-3.05,1.22);
  const stormR=bd.add(stormCloud('c-storm',1.3,.7),'R',2.3,1.05,{out:.04});
  const sun=bd.add(S.sun(K+'c-sun',.42),'R',3.2,1.0,{out:.015}),birds=bd.add(S.birds(K+'c-birds',.9,.35),'R',1.6,2.2,{out:.02});
  const ban=bd.add(S.banner(K+'c-ban',2.6,.38,'BACK AS CAPTAIN',INK.blue),'R',.5,2.8,{out:.02});
  const board=B.stand(S.scoreboard(K+'c-board',2.0,1.5,'EURO 2004'),-2.9,-1.6,{layer:1});
  board.add(lineCard('c-out',1.5,.7,['KNOCKED','OUT'],INK.white),0,.4,{z:.012});const fGreece=board.flap(S.flipCard(K+'c-gre',1.5,.7,'GREECE','#3d5da0'),0,1.1,{z:.024});
  B.stand(S.tree(K+'c-tree',1.0,1.5,'round','#6d8f76'),-4.55,-1.25,{layer:1});
  const hook=B.stand(shirtHook,-4.35,-.25,{layer:2,s:0});
  const H=B.person(K+'c-hero',-2.3,.85,1.36,{shirt:'navy',hair:'bald',skin:'#d99a6c',face:'sad',layer:3});
  const capt=H.body.add(S.flipCard(K+'c-capt',.8,.28,'CAPTAIN',INK.yellow,INK.navy),0,H.h*1.03,{z:.02});
  const heartH=H.body.add(S.bubble(K+'c-hH',.5,.44,'heart'),-.45,H.h*1.0,{z:-.02});
  const TH=B.person(K+'c-thuram',-3.85,.6,1.34,{shirt:'navy',hair:'short',skin:'#7f5138',face:'smile',layer:2}),MK=B.person(K+'c-make',-.8,-.25,1.28,{shirt:'navy',hair:'bald',skin:'#7f5138',face:'smile',layer:2});
  const nTH=TH.body.add(S.flipCard(K+'c-nth',.78,.26,'THURAM',INK.white,INK.navy),0,TH.h*1.03,{z:.02}),nMK=MK.body.add(S.flipCard(K+'c-nmk',.9,.26,'MAKÉLÉLÉ',INK.white,INK.navy),0,MK.h*1.03,{z:.02});
  const deckL=B.flat(S.bridgeDeck(K+'c-deckL',.96,1.25),-.98,1.9,{edge:'left',hinge:-1.45}),deckR=B.flat(S.bridgeDeck(K+'c-deckR',.96,1.25),.98,1.9,{edge:'right',hinge:1.45});
  const C=B.person(K+'c-coach',1.6,-.35,1.78,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const P=[[2.4,.6],[3.2,-.1],[4.3,.9],[2.5,-.95],[3.35,-1.0]].map(([x,z],i)=>B.person(K+`c-p${i}`,x,z,1.26,{shirt:'navy',hair:(['short','curly','long','short','curly'] as const)[i],skin:['#f1b88f','#7f5138','#d99a6c','#b27650','#f1b88f'][i],face:'open',layer:i<3?3:2}));
  const table=B.stand(groupTable,4.15,-.85,{layer:1,s:0});const tok=table.add(S.flipCard(K+'c-tok',.8,.17,'FRANCE',INK.pink),.1,.455,{anchor:'center',z:.014});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   // 2004: knocked out by Greece; he retires from France and hangs up his shirt.
   H.body.s=beat(t,1.8,2.6);fGreece.flip=-3.2*beat(t,5.6,6.3);H.body.yaw=-.6*beat(t,7.4,8.2)*(1-beat(t,20.4,21));hook.s=beat(t,8.2,9);
   // Other older players leave too; France struggle: storm, fourth place.
   P.forEach((p,i)=>{const gone=i>=2?beat(t,11.2+(i-2)*.7,12+(i-2)*.7):0;p.body.s=beat(t,10.4+i*.2,11+i*.2)*(1-gone)+(i>=2?beat(t,33.2+i*.2,34+i*.2):0);p.body.dx=.5*gone;});
   pop(stormR,beat(t,11,12)*(1-beat(t,31.9,33.2)));stormR.dx=.06*wave(t,12,31,.3);
   table.s=beat(t,14,14.9);pop(tok,beat(t,14.9,15.6));
   // Unfold the bridge back to the team.
   const open=manual?beat(act,0,.45):beat(t,17.5,19);deckL.s=open;deckR.s=open;
   // The coach urges him to return; he comes back as captain with Thuram and Makélélé.
   C.body.s=beat(t,20.2,21);const reach=beat(t,21.1,21.8)*(1-beat(t,26,26.6));C.armL.rot=-.12-1.4*reach;
   const step=manual?beat(act,.4,.8):beat(t,23.4,25.6);H.body.x=-2.3+.9*step;
   pop(capt,manual?beat(act,.75,1):beat(t,26,26.8));
   TH.body.s=beat(t,27.8,28.6);pop(nTH,beat(t,28.3,28.9));MK.body.s=beat(t,28.8,29.6);pop(nMK,beat(t,29.3,29.9));
   // From fourth place to the top of the group; the storm clears.
   tok.dy=.69*beat(t,32,35);pop(sun,beat(t,32.2,33.2));sun.dy=.8*beat(t,32.2,35);birds.dx=1.1*beat(t,33,44);birds.visible=t>33;pop(ban,beat(t,34.4,35.2));ban.dy=.04*wave(t,35,45,.6);
   pop(heartH,beat(t,37,37.6));
   const party=beat(t,34.8,35.4);[P[0],P[1]].forEach((p,i)=>cheer(p,party,t+i*.3));
   if(t>40.2){cheer(H,beat(t,40.5,41.1),t);cheer(TH,beat(t,40.8,41.4),t+.3);cheer(MK,beat(t,41,41.6),t+.6);cheer(C,beat(t,41.3,41.9),t+.9);}
   if(manual)cheer(C,beat(act,.8,1),t);
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,10,11)+.3*beat(t,11,11.8)-.3*beat(t,16.6,17.4)+.3*beat(t,31.4,32.2)-.3*beat(t,36.2,37):0;
  };
 }};

/* ───────────── 6 · A hard night, and after (coach, 2006 and later) ───────────── */
const coach:SpreadDef={id:'coach',rest:20.2,
 left:k=>{pitch(k,-5,0,'#3a6f55',INK.navy,.92);chalk(k,ell(0,Z(-.4),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-5 ${Z(-1.2)} L-3.9 ${Z(-1.2)} L-3.9 ${Z(-2.1)}`);k.circle(-3.3,Z(.6),.05,INK.white);
  footprints(k,-2.2,Z(1.25),-4.2,Z(1.5),7,INK.white);
  k.text('2006',-2.4,Z(2.62),.56,INK.white,{max:2.4});k.text('WORLD CUP FINAL',-2.4,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,ell(0,Z(-.4),1.0,1.0));chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);footprints(k,2.2,Z(1.55),3.3,Z(1.6),5);
  k.text('BREATHE',2.5,Z(2.62),.5,INK.blue,{max:3.4});k.text('WALK AWAY · YOU ARE MORE THAN ONE MOMENT',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.25,2.6,[INK.blue,INK.white,'#6fb6e2',INK.white,INK.blue,INK.red],2);lightRig(k,1.4,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3a6f55');}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);tower(k,.3,.9,.8,1.3,'#f1c9b0',2);tower(k,1.3,.7,.9,1.5,'#eedcae',3);
    const e='M3.2 .3 L3.26 .3 L3.34 .85 L3.5 1.4 L2.96 1.4 L3.12 .85 Z';k.fill(e,'#8c7a6b');k.hatch(e,INK.navy,.05,.7,.008);k.hatch(e,INK.navy,.05,-.7,.008);k.key(e,.012);k.key('M3.04 1.1 L3.42 1.1 M3.1 .85 L3.36 .85',.012);
    crowd(k,4.5,1.6,2.65,FRA,5);k.fill(rect(0,2.65,4.5,.35),INK.grass);}},-3.05,1.22);
  const storm=bd.add(stormCloud('k-storm',1.5,.78),'L',1.6,1.35,{out:.04}),storm2=bd.add(stormCloud('k-storm2',1.0,.52),'L',3.3,1.7,{out:.035});
  const sun=bd.add(S.sun(K+'k-sun',.4),'L',2.6,1.3,{out:.02});
  const bunt=bd.add(S.bunting(K+'k-bunt',3.8,.4,[INK.blue,INK.white,INK.red]),'R',.3,2.5,{out:.03});
  const conf=bd.add(S.confetti(K+'k-cf',2.2,1.1,3),'R',.5,1.3,{out:.04});
  const board=B.stand(S.scoreboard(K+'k-board',2.0,1.5,'WORLD CUP FINAL'),-2.1,-1.6,{layer:1});
  board.add(lineCard('k-lost',1.5,.7,['LOST ON','PENALTIES'],INK.white),0,.4,{z:.012});const fIt=board.flap(S.flipCard(K+'k-ita',1.5,.7,'FRANCE – ITALY','#3d5da0'),0,1.1,{z:.024});
  B.stand(S.goal(K+'k-goal',1.5,.8),-4.35,-1.36,{layer:1});
  const keeper=B.person(K+'k-keeper',-4.35,-1.1,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const Zz=B.person(K+'k-zz',-2.25,.85,1.36,{shirt:'navy',hair:'bald',skin:'#d99a6c',number:'10',legs:'kick',face:'sad',layer:3});
  const ball=B.stand(S.ball(K+'k-ball',.12),-2.0,1.0,{layer:3,tab:false});
  const O=B.person(K+'k-opp',-1.0,.5,1.32,{shirt:'casual',hair:'curly',skin:'#f1b88f',face:'open',layer:2});
  const words=O.body.add(jab('k-jab',.6,.44),.5,O.h*.98,{z:-.02});
  const RF=B.person(K+'k-ref',-2.95,.1,1.7,{shirt:'ger',hair:'short',skin:'#f1b88f',adult:true,face:'open',layer:2});const raiseCard=refCard(RF);
  const fans=[[1.2,-.95],[2.0,-1.2],[2.9,-1.0],[3.8,-1.25],[4.6,-.9]].map(([x,z],i)=>B.person(K+`k-fan${i}`,x,z,1.3,{shirt:'navy',hair:(['short','long','curly','bun','cap'] as const)[i],skin:['#f1b88f','#b27650','#7f5138','#d99a6c','#f1b88f'][i],face:'grin',layer:1}));
  const hearts=[0,1].map(i=>fans[i*2+1].body.add(S.bubble(K+`k-heart${i}`,.46,.4,'heart'),.4,1.3*1.22,{z:-.02}));
  const tally0=B.stand(tally,1.4,.35,{layer:2,s:0});const c12=tally0.add(S.flipCard(K+'k-12',1.1,.34,'12 OF 14',INK.yellow,INK.navy),0,1.27,{z:.014});
  const KD=B.person(K+'k-kid',2.3,1.35,1.3,{shirt:'bib',hair:'short',skin:'#b27650',face:'smile',layer:3});B.slot(2.2,1.5,3.3,1.5);
  const bwK=KD.h*320/512,crossK=KD.body.flap(angryHead('k-cross',KD.h,'#b27650'),(150/320-.5)*bwK,KD.h*(1-30/512),{anchor:'top',z:.016});
  const breath=KD.body.add(S.bubble(K+'k-breath',.6,.5,'breath'),.6,KD.h*.9,{z:-.02,anchor:'center'});
  const CZ=B.person(K+'k-coachZ',4.2,.35,1.78,{shirt:'coach',hair:'bald',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const cups=[0,1,2].map(i=>B.stand(S.trophy(K+`k-cup${i}`,.42,.72),3.55+i*.55,1.85,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.2):b.t;
   // His last match; he scores a penalty.
   const kick=pulse(t,8.5,9.1);Zz.leg!.rot=-1.1*kick;const pen=beat(t,8.8,9.6);ball.x=-2.0-1.8*pen;ball.z=1.0-2.25*pen;ball.dy=.35*Math.sin(pen*Math.PI);ball.rot=-pen*9;
   keeper.body.rot=.8*pulse(t,9,10.4);keeper.armR.rot=.12+2*pulse(t,9,10.4);
   // An insult about his sister; he reacts; a storm gathers.
   O.body.s=beat(t,10.4,11.2);pop(words,beat(t,11.6,12.2)*(1-beat(t,16.4,17)));
   const push=pulse(t,14.2,15.4);Zz.body.x=-2.25+.55*beat(t,13.4,14.2)*(1-beat(t,17.6,18.4));Zz.body.rot=-.12*push;O.body.rot=.2*pulse(t,14.5,15.7);
   const clear=manual?beat(act,.05,.7):beat(t,20.5,22);
   pop(storm,beat(t,13.8,14.9)*(1-clear));pop(storm2,beat(t,14.6,15.6)*(1-clear));storm.dx=.06*wave(t,15,20,.3);
   // Sent off; France lost on penalties.
   RF.body.s=beat(t,15.8,16.6);raiseCard(beat(t,16.8,17.5)*(1-beat(t,19.4,20)));
   Zz.body.yaw=-.7*beat(t,17.8,18.4);const off=beat(t,18.2,20);Zz.body.x-=1.5*off;Zz.body.z=.85+.45*off;
   fIt.flip=-3.2*beat(t,18.6,19.3);
   // Clear the storm: fans in Paris still cheer his name.
   pop(sun,clear);sun.dy=.7*clear;
   fans.forEach((f,i)=>{f.body.s=manual?beat(act,.4+i*.1,.6+i*.1):beat(t,22.4+i*.3,23.2+i*.3);if(f.body.s>.5)cheer(f,beat(t,23.4+i*.2,24+i*.2)*(1-beat(t,26.2,26.8))+(manual?beat(act,.7,1):0),t+i*.4);});
   pop(bunt,manual?beat(act,.6,1):beat(t,22.3,23.1));bunt.dy=.03*wave(t,23,46,.6);conf.dy=-1.1+1.3*beat(t,23,25.2);conf.visible=t>22.9;
   hearts.forEach((h,i)=>pop(h,beat(t,24.6+i*.4,25.2+i*.4)*(1-beat(t,26.4,27))));
   // Twelve of his fourteen red cards came after provocation; no excuse.
   tally0.s=beat(t,26.8,27.6);pop(c12,beat(t,29.2,29.9));
   // Later, a coach: three Champions League trophies.
   CZ.body.s=beat(t,34.3,35.1);cups.forEach((c,i)=>{c.s=beat(t,35.6+i*.8,36.4+i*.8);});cheer(CZ,beat(t,37.8,38.4)*(1-beat(t,39.6,40.2)),t);
   // Breathe and walk away.
   const cross=beat(t,31.4,32)*(1-beat(t,41.8,42.6));crossK.flip=-2.75*(1-cross);crossK.visible=cross>.02;
   const br=t>40&&t<44.4?.35+.8*Math.sin(Math.PI*(t-40)/4.4):0;pop(breath,br);KD.armL.rot=-.12-.4*br;KD.armR.rot=.12+.4*br;
   KD.body.x=2.3+.9*beat(t,43,45.6);KD.body.yaw=.5*pulse(t,43,45.8);
   return b.narrated?-.45*beat(t,2.2,3.2)+.45*beat(t,19.8,20.6)+.4*beat(t,22,22.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={marseille,scan,ninetyeight,volley,calm,coach};
void aim;
