/**
 * The six Mané pop-up spreads (leaving the village): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/mane/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: an empty stool and a covered photo frame, a night road, a rain cloud lifting.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='mane-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const SADIO={skin:'#6b4430',hair:'short' as const,hairColor:'#17110d'};
const SKINS=['#6b4430','#8a5a3c','#5a3a28','#7f5138'];
const SEN=[INK.grass,INK.yellow,INK.red,INK.white,INK.green,INK.yellow];

/* ───────────── page print helpers (solid ink: key lines don't print on pages) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function dashes(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.05,c:string=INK.white,seg=.2){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);bar(k,x0+(x1-x0)*a,y0+(y1-y0)*a,x0+(x1-x0)*b,y0+(y1-y0)*b,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){bar(k,x,y,x+w,y,lw,c);bar(k,x+w,y,x+w,y+h,lw,c);bar(k,x+w,y+h,x,y+h,lw,c);bar(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function sand(k:Kit,x0:number,x1:number,tone='#e6c98f',dot='#b98a4f'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,dot,.06,(x,y)=>.14+.1*Math.sin(x*1.7+y*.9));
 for(let i=0;i<16;i++){const x=x0+.3+((i*37)%41)/41*(x1-x0-.6),y=.4+((i*53)%47)/47*5.4;k.fill(ell(x,y,.05,.03),dot,.6);}}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function road(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.6,tone='#c9a66b'){bar(k,x0,y0,x1,y1,w,tone);dashes(k,x0,y0,x1,y1,.04,INK.white,.22);}
function caption(k:Kit,x:number,big:string,small:string,c:string=INK.navy,bigC:string=INK.pink,max=4.2){k.text(big,x,Z(2.62),.44,bigC,{max,weight:900});k.text(small,x,Z(2.92),.15,c,{weight:800,max});}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<16;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.45,.022,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}
function dunes(k:Kit,w:number,y:number,tone='#e0bd7c'){const p=`M0 ${y} Q${w*.2} ${y-.3} ${w*.45} ${y-.08} Q${w*.7} ${y+.12} ${w} ${y-.25} L${w} 3 L0 3 Z`;k.fill(p,tone);k.dots(p,'#b98a4f',.05,.3);}
function hutBack(k:Kit,x:number,y:number,s:number,wall='#c98c55'){const b=rect(x-s*.4,y-s*.5,s*.8,s*.5);k.fill(b,wall);k.dots(b,INK.brown,.035,.3);k.key(b,.01);const r=poly([[x-s*.55,y-s*.48],[x,y-s*1.05],[x+s*.55,y-s*.48]]);k.fill(r,'#d9b25e');k.hatch(r,INK.brown,.035,.9,.008);k.key(r,.01);k.fill(rect(x-s*.1,y-s*.3,s*.2,s*.3),INK.brown);}
function baobabBack(k:Kit,x:number,y:number,s:number,tone='#8a6a4a'){const t=`M${x-s*.16} ${y} L${x-s*.12} ${y-s*.7} Q${x-s*.4} ${y-s*.95} ${x-s*.5} ${y-s*1.05} M${x+s*.16} ${y} L${x+s*.12} ${y-s*.7}`;void t;
 k.fill(poly([[x-s*.18,y],[x-s*.12,y-s*.72],[x+s*.12,y-s*.72],[x+s*.18,y]]),tone);for(const [dx,dy] of [[-.45,-1.0],[-.15,-1.15],[.2,-1.1],[.45,-.95]])k.key(`M${x} ${y-s*.7} L${x+dx*s} ${y+dy*s}`,s*.05,tone);
 k.fill(blob([[x-s*.6,y-s*.95],[x-s*.3,y-s*1.25],[x+s*.1,y-s*1.3],[x+s*.55,y-s*1.12],[x+s*.6,y-s*.9],[x,y-s*1.02]]),'#6f9a52');}
function skyline(k:Kit,w:number,y:number){const cs=['#c9b79a','#b5a488','#d8c6a6'];for(let i=0;i<12;i++){const x=i*w/12,h=.35+((i*7)%5)*.13,b=rect(x,y-h,w/12-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.07,.06),INK.yellow,.75);}}
function senFlag(k:Kit,x:number,y:number,w:number,h:number){const t=w/3;k.fill(rect(x,y,t,h),INK.green);k.fill(rect(x+t,y,t,h),INK.yellow);k.fill(rect(x+2*t,y,t,h),INK.red);const cx=x+w/2,cy=y+h/2,r=h*.18;k.fill(poly(Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];})),INK.green);k.key(rect(x,y,w,h),.01);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86,weight:900}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const hut=(key:string,w:number,h:number,wall='#c98c55')=>sp(key,w,h,k=>{const b=rect(w*.1,h*.45,w*.8,h*.55);k.fill(b,wall);k.dots(b,INK.brown,.04,.35);k.key(b,.014);
 for(let i=0;i<3;i++)k.key(`M${w*.1} ${h*(.6+i*.12)} Q${w/2} ${h*(.63+i*.12)} ${w*.9} ${h*(.6+i*.12)}`,.008,INK.brown);
 const r=poly([[-.04,h*.5],[w/2,0],[w+.04,h*.5]]);k.fill(r,'#dcb562');k.hatch(r,INK.brown,.04,1.1,.01);k.key(r,.014);for(let i=0;i<9;i++)k.key(`M${w*(i/8)} ${h*.5} l${w*.02} ${h*.06}`,.012,INK.brown);
 const d=`M${w*.4} ${h} L${w*.4} ${h*.72} Q${w/2} ${h*.62} ${w*.6} ${h*.72} L${w*.6} ${h} Z`;k.fill(d,INK.brown);k.key(d,.012);});
const baobab=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const trunk=`M${w*.36} ${h} Q${w*.3} ${h*.6} ${w*.4} ${h*.36} L${w*.6} ${h*.36} Q${w*.7} ${h*.6} ${w*.64} ${h} Z`;k.fill(trunk,'#9b7a5a');k.hatch(trunk,INK.brown,.05,1.4,.01);k.key(trunk,.014);
 for(const [x2,y2] of [[.08,.12],[.28,.02],[.55,0],[.8,.06],[.95,.2]]){k.key(`M${w/2} ${h*.38} Q${w*(x2+.5)/2} ${h*.3} ${w*x2} ${h*y2+.08}`,.05,'#9b7a5a');}
 for(const [x,y,r] of [[.12,.14,.13],[.33,.06,.15],[.58,.05,.15],[.84,.12,.14]]){const c=ell(w*x,h*y+.06,w*r,h*.07);k.fill(c,'#6f9a52');k.dots(c,INK.green,.035,.4);k.key(c,.01);}});
const openBook=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(poly([[w*.1,h],[w*.5,h*.55],[w*.9,h],[w*.8,h],[w*.5,h*.7],[w*.2,h]]),INK.wood);k.key(poly([[w*.1,h],[w*.5,h*.55],[w*.9,h]]),.012);
 const L=`M${w*.5} ${h*.62} Q${w*.3} ${h*.5} ${w*.04} ${h*.56} L${w*.04} ${h*.08} Q${w*.3} ${0} ${w*.5} ${h*.12} Z`,R=`M${w*.5} ${h*.62} Q${w*.7} ${h*.5} ${w*.96} ${h*.56} L${w*.96} ${h*.08} Q${w*.7} ${0} ${w*.5} ${h*.12} Z`;
 k.fill(L,INK.white);k.fill(R,INK.white);k.key(L,.012);k.key(R,.012);for(let i=0;i<4;i++){k.key(`M${w*.1} ${h*(.18+i*.09)} L${w*.42} ${h*(.18+i*.09)}`,.01,INK.green);k.key(`M${w*.58} ${h*(.18+i*.09)} L${w*.9} ${h*(.18+i*.09)}`,.01,INK.green);}});
const stool=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=ell(w/2,h*.22,w*.46,h*.12);k.fill(top,INK.wood);k.dots(top,INK.brown,.03,.3);k.key(top,.012);for(const x of [.2,.5,.8])k.keyFill(poly([[w*x-.03,h*.3],[w*x+.03,h*.3],[w*x+.02+(x-.5)*.1,h],[w*x-.04+(x-.5)*.1,h]]),INK.brown);});
const portrait=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.4);k.key(f,.016);const m=rect(w*.1,h*.1,w*.8,h*.72);k.fill(m,INK.sky2);k.dots(m,INK.yellow,.04,(x,y)=>.5-y/h*.4);k.key(m,.012);
 const cx=w/2,cy=h*.44,r=w*.19;k.fill(`M${cx-w*.32} ${h*.82} Q${cx} ${h*.52} ${cx+w*.32} ${h*.82} Z`,INK.white);k.key(`M${cx-w*.32} ${h*.82} Q${cx} ${h*.52} ${cx+w*.32} ${h*.82}`,.012);
 k.fill(ell(cx,cy,r,r*1.15),'#6b4430');k.key(ell(cx,cy,r,r*1.15),.012);k.fill(`M${cx-r*.95} ${cy-r*.45} Q${cx} ${cy-r*1.6} ${cx+r*.95} ${cy-r*.45} Z`,INK.white);k.key(`M${cx-r*.95} ${cy-r*.45} Q${cx} ${cy-r*1.6} ${cx+r*.95} ${cy-r*.45} Z`,.01);
 k.fill(`M${cx-r*.75} ${cy+r*.35} Q${cx} ${cy+r*1.45} ${cx+r*.75} ${cy+r*.35} Q${cx} ${cy+r*.8} ${cx-r*.75} ${cy+r*.35} Z`,'#2a2320');
 k.circle(cx-r*.38,cy-r*.02,r*.1,INK.white);k.circle(cx+r*.38,cy-r*.02,r*.1,INK.white);k.circle(cx-r*.38,cy-r*.02,r*.05,INK.navy);k.circle(cx+r*.38,cy-r*.02,r*.05,INK.navy);
 const pl=rect(w*.3,h*.85,w*.4,h*.1);k.fill(pl,INK.gold);k.key(pl,.01);const s=h*.05,hx=w/2,hy=h*.9;k.fill(`M${hx} ${hy+s*.6} C${hx-s} ${hy} ${hx-s*.5} ${hy-s*.9} ${hx} ${hy-s*.35} C${hx+s*.5} ${hy-s*.9} ${hx+s} ${hy} ${hx} ${hy+s*.6} Z`,INK.pink);});
const frameCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f3e2c0');k.dots(b,INK.orange,.04,.3);k.key(b,.014);for(let i=0;i<6;i++){const x=w*(.2+(i%3)*.3),y=h*(.2+Math.floor(i/3)*.36);k.fill(poly(Array.from({length:10},(_,j)=>{const a=-Math.PI/2+j*Math.PI/5,rr=j%2?.03:.07;return [x+Math.cos(a)*rr,y+Math.sin(a)*rr];})),INK.gold);}k.text('LIFT',w/2,h*.9,h*.11,INK.navy,{weight:900});},{rim:.015});
const thought=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const c=blob([[w*.1,h*.5],[w*.2,h*.15],[w*.5,h*.05],[w*.82,h*.14],[w*.95,h*.45],[w*.8,h*.72],[w*.45,h*.76],[w*.18,h*.72]]);k.fill(c,INK.white);k.key(c,.014);k.circle(w*.22,h*.86,w*.05,INK.white);k.circle(w*.12,h*.96,w*.03,INK.white);
 const r=h*.2,cx=w/2,cy=h*.42;k.fill(ell(cx,cy,r,r),INK.white);k.key(ell(cx,cy,r,r),.012);const pent=poly(Array.from({length:5},(_,i)=>{const a=-Math.PI/2+i*TAU/5;return [cx+Math.cos(a)*r*.38,cy+Math.sin(a)*r*.38];}));k.fill(pent,INK.navy);for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;k.key(`M${cx+Math.cos(a)*r*.38} ${cy+Math.sin(a)*r*.38} L${cx+Math.cos(a)*r} ${cy+Math.sin(a)*r}`,.01);}},{rim:.015});
const handStop=(key:string,s:number)=>sp(key,s,s,k=>{const b=ell(s/2,s/2,s*.46,s*.46);k.fill(b,INK.red);k.key(b,.014);k.fill(ell(s/2,s/2,s*.38,s*.38),INK.white);const p=`M${s*.36} ${s*.78} L${s*.34} ${s*.42} Q${s*.34} ${s*.36} ${s*.38} ${s*.36} L${s*.38} ${s*.26} Q${s*.42} ${s*.2} ${s*.46} ${s*.26} L${s*.46} ${s*.22} Q${s*.5} ${s*.16} ${s*.54} ${s*.22} L${s*.54} ${s*.26} Q${s*.58} ${s*.2} ${s*.62} ${s*.28} L${s*.62} ${s*.62} Q${s*.62} ${s*.78} ${s*.5} ${s*.8} Z`;k.fill(p,'#8a5a3c');k.key(p,.012);},{rim:.015});
const signpost=(key:string,w:number,h:number,a:string,b:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.12,w*.08,h*.88),INK.brown);
 const L=poly([[w*.02,h*.14],[w*.44,h*.14],[w*.44,h*.3],[w*.02,h*.3],[0,h*.22]]);const R=poly([[w*.56,h*.34],[w*.96,h*.34],[w,h*.42],[w*.96,h*.5],[w*.56,h*.5]]);
 k.fill(poly([[0,h*.22],[w*.1,h*.12],[w*.46,h*.12],[w*.46,h*.32],[w*.1,h*.32]]),INK.white);k.key(poly([[0,h*.22],[w*.1,h*.12],[w*.46,h*.12],[w*.46,h*.32],[w*.1,h*.32]]),.012);void L;
 k.fill(R,INK.yellow);k.key(R,.012);k.text(a,w*.25,h*.26,h*.09,INK.navy,{max:w*.38,weight:900});k.text(b,w*.76,h*.46,h*.09,INK.navy,{max:w*.36,weight:900});});
const doorFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,'#e2b77a');k.dots(f,INK.brown,.04,.3);k.key(f,.016);const o=rect(w*.14,h*.12,w*.72,h*.88);k.fill(o,INK.sky2);k.dots(o,INK.yellow,.035,(x,y)=>.6-y/h*.5);
 const sk=['#c9b79a','#b5a488','#d8c6a6'];for(let i=0;i<5;i++){const x=w*.16+i*w*.14,hh=h*(.25+((i*3)%4)*.08),b=rect(x,h-hh,w*.12,hh);k.fill(b,sk[i%3]);k.key(b,.008);for(let r=0;r<3;r++)k.fill(rect(x+w*.03,h-hh+.05+r*.1,w*.05,.05),INK.yellow);}
 k.fill(rect(w*.14,h*.92,w*.72,h*.08),'#c9a66b');k.fill(rect(w*.2,h*.14,w*.6,h*.14),INK.white);k.text('DAKAR',w/2,h*.25,h*.09,INK.navy,{max:w*.55,weight:900});});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,'#3f7f5a');k.dots(d,INK.navy,.035,.3);k.key(d,.014);for(let i=1;i<5;i++)k.key(`M${i*w/5} ${h*.04} L${i*w/5} ${h*.96}`,.01,'#2a5a3f');k.circle(w*.84,h*.55,.03,INK.gold);k.text('OPEN',w/2,h*.4,h*.1,INK.white,{weight:900,max:w*.8});},{rim:.014});
const helpBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.14),INK.green);k.text('WHO HELPED?',w/2,h*.11,h*.08,INK.yellow,{max:w*.8,weight:900});});
const helperCard=(key:string,w:number,h:number,who:'friend'|'family'|'club',label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,who==='friend'?INK.yellow:who==='family'?INK.sky:INK.grass);k.dots(b,INK.navy,.03,.15);k.key(b,.012);
 const face=(x:number,y:number,r:number,skin:string,head='#17110d',scarf?:string)=>{k.fill(`M${x-r*1.3} ${y+r*2.2} Q${x} ${y+r*.8} ${x+r*1.3} ${y+r*2.2} Z`,scarf??INK.orange);k.fill(ell(x,y,r,r*1.1),skin);k.key(ell(x,y,r,r*1.1),.01);k.fill(`M${x-r} ${y-r*.2} Q${x} ${y-r*1.5} ${x+r} ${y-r*.2} Q${x} ${y-r*.7} ${x-r} ${y-r*.2} Z`,head);k.circle(x-r*.35,y,r*.12,INK.white);k.circle(x+r*.35,y,r*.12,INK.white);k.circle(x-r*.35,y,r*.06,INK.navy);k.circle(x+r*.35,y,r*.06,INK.navy);k.key(`M${x-r*.35} ${y+r*.45} Q${x} ${y+r*.7} ${x+r*.35} ${y+r*.45}`,.012,INK.white);};
 if(who==='friend')face(w*.5,h*.38,w*.17,'#7f5138');
 else if(who==='family'){face(w*.3,h*.36,w*.12,'#6b4430',INK.pink,INK.pink);face(w*.7,h*.36,w*.12,'#8a5a3c','#17110d',INK.blue);face(w*.5,h*.5,w*.09,'#6b4430');}
 else{const s=poly([[w*.3,h*.14],[w*.7,h*.14],[w*.7,h*.42],[w*.5,h*.62],[w*.3,h*.42]]);k.fill(s,INK.white);k.key(s,.012);const r=w*.1,cx=w/2,cy=h*.36;k.fill(ell(cx,cy,r,r),INK.white);k.key(ell(cx,cy,r,r),.01);k.fill(ell(cx,cy,r*.4,r*.4),INK.navy);}
 k.fill(rect(0,h*.78,w,h*.22),INK.white);k.text(label,w/2,h*.94,h*.13,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const qCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.fill(ell(w/2,h*.46,w*.26,w*.26),INK.white);k.text('?',w/2,h*.56,h*.34,INK.navy,{weight:900});},{rim:.015});
const upArrow=(key:string,w:number,h:number,c:string=INK.grass,down=false)=>sp(key,w,h,k=>{const pts=[[w*.5,0],[w,h*.42],[w*.68,h*.42],[w*.68,h],[w*.32,h],[w*.32,h*.42],[0,h*.42]].map(([x,y])=>[x,down?h-y:y]);const p=poly(pts);k.fill(p,c);k.dots(p,INK.navy,.03,.25);k.key(p,.014);},{rim:.02});
const castle=(k:Kit,x:number,y:number,s:number)=>{const b=rect(x,y-s*.5,s*1.4,s*.5);k.fill(b,'#e8dcc0');k.dots(b,INK.grey,.035,.3);k.key(b,.012);for(let i=0;i<6;i++)k.fill(rect(x+i*s*.26,y-s*.58,s*.14,s*.1),'#e8dcc0');const t=rect(x+s*.5,y-s*.95,s*.32,s*.5);k.fill(t,'#e8dcc0');k.key(t,.012);k.fill(poly([[x+s*.46,y-s*.95],[x+s*.66,y-s*1.25],[x+s*.86,y-s*.95]]),INK.green);};
function peaks(k:Kit,w:number,y:number,tone:string,seed=0){const pts:number[][]=[[0,y+.6]];for(let i=0;i<=8;i++){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);pts.push([x,i%2?top:y+.15]);}pts.push([w,y+.6],[w,3.2],[0,3.2]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);
 for(let i=1;i<=8;i+=2){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);k.fill(poly([[x,top],[x+.12,top+.16],[x+.04,top+.12],[x-.04,top+.18],[x-.12,top+.16]]),INK.white);}}
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.08],[w+.05,h*.32]]);k.fill(roof,INK.green);k.key(roof,.014);
 for(let i=0;i<4;i++){const wx=w*(.08+i*.24);k.fill(rect(wx,h*.5,w*.14,h*.18),INK.sky);k.key(rect(wx,h*.5,w*.14,h*.18),.01);}
 const d=rect(w*.42,h*.72,w*.16,h*.28);k.fill(d,INK.red);k.key(d,.012);const s=rect(w*.18,h*.34,w*.64,h*.12);k.fill(s,INK.white);k.key(s,.01);k.text('SCHOOL',w/2,h*.435,h*.085,INK.navy,{max:w*.58,weight:900});});
const hospital=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.18,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.014);k.fill(rect(-.03,h*.14,w+.06,h*.06),INK.teal);
 for(let r=0;r<2;r++)for(let c=0;c<4;c++){if(r===1&&(c===1||c===2))continue;const wx=w*(.08+c*.23),wy=h*(.44+r*.26);k.fill(rect(wx,wy,w*.14,h*.14),INK.sky);k.key(rect(wx,wy,w*.14,h*.14),.01);}
 const d=rect(w*.38,h*.72,w*.24,h*.28);k.fill(d,INK.teal);k.key(d,.012);const s=rect(w*.12,h*.24,w*.76,h*.13);k.fill(s,INK.teal);k.key(s,.01);k.text('HOSPITAL',w/2,h*.335,h*.085,INK.white,{max:w*.7,weight:900});
 const hs=h*.06,hx=w/2,hy=h*.6;k.fill(`M${hx} ${hy+hs*.6} C${hx-hs} ${hy} ${hx-hs*.5} ${hy-hs*.9} ${hx} ${hy-hs*.35} C${hx+hs*.5} ${hy-hs*.9} ${hx+hs} ${hy} ${hx} ${hy+hs*.6} Z`,INK.pink);});
const skyCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.sky2);k.dots(b,INK.yellow,.04,(x,y)=>.6-y/h*.5);k.key(b,.014);
 const cx=w/2,cy=h*.4,r=h*.16;for(let i=0;i<12;i++){const a=i/12*TAU;k.fill(poly([[cx+Math.cos(a)*r*1.2,cy+Math.sin(a)*r*1.2],[cx+Math.cos(a+.12)*r*1.9,cy+Math.sin(a+.12)*r*1.9],[cx+Math.cos(a+.24)*r*1.2,cy+Math.sin(a+.24)*r*1.2]]),INK.yellow);}k.fill(ell(cx,cy,r,r),INK.yellow);k.key(ell(cx,cy,r,r),.012);k.dots(ell(cx,cy,r,r),INK.orange,.03,.35);});
const cloudFlap=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.02,h*.9],[0,h*.4],[w*.14,h*.08],[w*.4,0],[w*.66,h*.04],[w*.9,h*.1],[w,h*.45],[w*.98,h*.9],[w*.5,h*.98]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<5;i++){const x=w*(.16+i*.17),y=h*.7;k.fill(`M${x} ${y} Q${x+.035} ${y+.07} ${x} ${y+.1} Q${x-.035} ${y+.07} ${x} ${y} Z`,INK.sky);}k.text('LIFT',w/2,h*.45,h*.14,INK.white,{weight:900});},{rim:.02});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const flagPlate=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.05,h),INK.brown);senFlag(k,.05,.02,w-.05,h*.55);},{rim:.015});
const pirogue=(k:Kit,x:number,y:number,s:number,c:string)=>{const p=`M${x-s*.5} ${y-s*.08} Q${x} ${y+s*.14} ${x+s*.5} ${y-s*.08} L${x+s*.4} ${y} Q${x} ${y+s*.08} ${x-s*.4} ${y} Z`;k.fill(p,c);k.key(p,.01);k.fill(rect(x-s*.3,y-s*.06,s*.6,s*.03),INK.yellow);};

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.11){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A dream in Bambali (bambali) ───────────── */
const bambali:SpreadDef={id:'bambali',rest:28.6,
 left:k=>{sand(k,-5,0);footprints(k,-4.3,Z(1.5),-1.2,Z(1.9),10,INK.brown);bar(k,-4.9,Z(-.1),-.1,Z(-.3),.05,'#b98a4f');
  caption(k,-2.5,'BAMBALI','SENEGAL · 1992',INK.navy,INK.green);},
 right:k=>{sand(k,0,5,'#ecd29a');const mat=rect(.5,Z(.35),2.2,1.2);k.fill(mat,'#e9c16b');for(let i=0;i<7;i++)bar(k,.5,Z(.35)+.1+i*.16,2.7,Z(.35)+.1+i*.16,.05,i%2?INK.red:INK.green);box(k,.5,Z(.35),2.2,1.2,.04,INK.brown);
  caption(k,2.5,'AGED SEVEN','REMEMBERING HIS FATHER',INK.navy,INK.orange);},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe0a6',INK.orange,y=>.45-y/3*.4);dunes(k,4.5,2.1,'#e3c27f');baobabBack(k,.7,2.25,.9);hutBack(k,2.2,2.35,.7);hutBack(k,3.1,2.3,.6,'#b87a48');baobabBack(k,4.0,2.3,.7);k.fill(rect(0,2.45,4.5,.55),'#e6c98f');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9b0',INK.pink,y=>.35-y/3*.3);dunes(k,4.5,2.0,'#e0bd7c');
    const m=rect(2.3,1.3,1.3,1.0);k.fill(m,'#f4ead0');k.dots(m,INK.sky,.04,.2);k.key(m,.012);k.fill(`M2.55 1.3 Q2.95 .72 3.35 1.3 Z`,INK.teal);k.key(`M2.55 1.3 Q2.95 .72 3.35 1.3 Z`,.012);
    const mn=rect(3.75,.7,.22,1.6);k.fill(mn,'#f4ead0');k.key(mn,.012);k.fill(poly([[3.72,.7],[3.86,.42],[4.0,.7]]),INK.teal);for(let i=0;i<3;i++)k.fill(rect(2.5+i*.36,1.65,.2,.34),INK.teal);
    hutBack(k,1.0,2.35,.7);k.fill(rect(0,2.45,4.5,.55),'#ecd29a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'b-sun',.34),'L',3.4,1.9,{out:.012}),birds=bd.add(S.birds(K+'b-birds',.8,.3),'R',1.6,2.5,{out:.02});
  const storm=bd.add(stormCloud('b-storm',1.5,.78),'R',2.0,1.9,{out:.03});
  const sign=B.stand(S.sign(K+'b-sign',1.1,1.15,'BAMBALI'),-.75,-1.3,{layer:1});const card92=sign.flap(S.flipCard(K+'b-1992',.85,.36,'1992',INK.green),0,1.15*.56,{z:.03});
  const hut1=B.stand(hut('b-hut1',1.5,1.35),-3.7,-1.2,{layer:1}),hut2=B.stand(hut('b-hut2',1.2,1.1,'#b87a48'),-2.2,-1.9,{layer:1});
  const tree=B.stand(baobab('b-tree',1.3,1.6),-4.45,-.5,{layer:1});
  const guinea=B.stand(S.flipCard(K+'b-guinea',1.4,.34,'PARENTS FROM GUINEA',INK.yellow,INK.navy),-2.5,.35,{layer:2,s:0});
  const mum=B.person(K+'b-mum',-3.3,.2,1.55,{shirt:'coach',hair:'bun',hairColor:'#17110d',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const dad=B.person(K+'b-dad',-1.7,-.1,1.72,{shirt:'ger',hair:'bald',adult:true,skin:'#6b4430',face:'smile',layer:2,beard:true});
  const boy=B.person(K+'b-boy',-2.55,1.3,.95,{shirt:'casual',...SADIO,face:'smile',legs:'kick',layer:3});
  const dream=B.stand(thought('b-dream',.9,.7),-3.5,1.6,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'b-ball',.1),-2.05,1.45,{layer:3,tab:false,s:0});
  const stop=B.stand(handStop('b-stop',.55),-1.05,.55,{layer:3,s:0});
  const rest=B.stand(openBook('b-book',.8,.55),1.4,.2,{layer:2,s:0});const study=B.stand(S.flipCard(K+'b-study',1.2,.32,'STUDIES FIRST',INK.teal),1.4,.75,{layer:2,s:0});
  const boy2=B.person(K+'b-boy2',2.3,.95,.95,{shirt:'casual',...SADIO,face:'shy',layer:3});
  const seat=B.stand(stool('b-stool',.7,.52),3.7,.05,{layer:2,s:0});const seven=B.stand(S.flipCard(K+'b-seven',.9,.32,'AGE 7',INK.orange),3.7,.6,{layer:2,s:0});
  const frame=B.stand(portrait('b-frame',1.2,1.5),3.35,-1.05,{layer:1,s:0});const cover=frame.flap(frameCover('b-cover',1.2,1.5),0,1.5,{z:.02});
  for(const [x,z,w] of [[-4.6,1.9,.8],[-.55,2.0,.7],[4.6,1.95,.7]])B.stand(S.bush(K+`b-bush${x}`,w,w*.45,'#9fb86a'),x,z,{layer:3,tab:false});
  const mum2=B.person(K+'b-mum2',1.5,1.55,1.5,{shirt:'coach',hair:'bun',hairColor:'#17110d',adult:true,skin:'#7f5138',face:'smile',layer:3});
  const hearts=[0,1,2].map(i=>B.stand(heart(`b-heart${i}`,.3),2.9+i*.55,1.6,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,28.6):b.t;
   sun.dy=.5*beat(t,0,2.2)-.8*beat(t,24,27)+.8*beat(t,32,35);birds.dx=-1.2*beat(t,1,14);birds.visible=t<23;
   card92.flip=-2.9+2.9*beat(t,3,3.8);hut1.s=beat(t,2.2,3.2);hut2.s=beat(t,2.6,3.6);tree.s=beat(t,5,6);
   mum.body.s=beat(t,8.2,9);dad.body.s=beat(t,8.6,9.4)*(1-beat(t,24.6,26));guinea.s=beat(t,9.8,10.6)*(1-beat(t,15.6,16.2));
   boy.body.s=beat(t,12.7,13.5)*(1-beat(t,20.6,21.4));dream.s=beat(t,13.4,14.2)*(1-beat(t,16.8,17.6));ball.s=beat(t,14.4,15)*(1-beat(t,17,17.6));ball.dy=.25*Math.abs(Math.sin((t-14.4)*4.5))*(t>14.4&&t<17?1:0);
   boy.leg!.rot=-.7*Math.abs(Math.sin((t-14.4)*4.5))*(t>14.4&&t<16.8?1:0);
   // Father says no: a raised hand; studies first.
   const no=beat(t,16.5,17.2)*(1-beat(t,23.6,24.4));stop.s=no;dad.armR.rot=.12+1.9*no;mum.armL.rot=-.12-.5*beat(t,17.4,18)*(1-beat(t,23,23.6));
   rest.s=beat(t,20.6,21.4);study.s=beat(t,21.2,22)*(1-beat(t,27,27.8));boy2.body.s=beat(t,21,21.8);boy2.armL.rot=-.12-.6*beat(t,22,22.6);
   // Loss: the father's cut-out folds away; an empty stool; the sky dims.
   const st=beat(t,24.4,25.6)*(1-beat(t,31.6,34)*(manual?1:1));show(storm,st*(manual?1-.8*beat(act,.4,1):1));storm.dx=.2*wave(t,25,31,.25);
   seat.s=beat(t,25.4,26.2);seven.s=beat(t,25.9,26.6);
   frame.s=beat(t,27.4,28.4);const lift=Math.max(manual?beat(act,0,.7):0,beat(t,29.4,30.6));cover.flip=-2.85*lift;
   mum2.body.s=Math.max(beat(t,30.4,31.2),manual?beat(act,.5,.8):0);const hug=Math.max(beat(t,32,32.8),manual?beat(act,.7,1):0);mum2.armR.rot=.12+1.3*hug;boy2.armR.rot=.12+1.2*hug;
   hearts.forEach((h,i)=>{h.s=Math.max(manual?beat(act,.6+i*.12,.8+i*.12):0,beat(t,33+i*.6,33.7+i*.6));});
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,20,21)+.45*beat(t,21,22)-.45*beat(t,35,36.5):0;
  };
 }};

/* ───────────── 2 · Leaving the village (secret) ───────────── */
const secret:SpreadDef={id:'secret',rest:17.1,
 left:k=>{sand(k,-5,0,'#8f7e8f','#5d506a');road(k,-4.6,Z(1.2),0,Z(.4),.55,'#b7a07a');footprints(k,-4.2,Z(1.15),-.4,Z(.45),12,INK.white);
  caption(k,-2.5,'AGED 15','A VERY BIG CHOICE',INK.white,INK.yellow);},
 right:k=>{sand(k,0,5,'#e6c98f');road(k,0,Z(.4),5,Z(-.4),.55,'#c9a66b');footprints(k,.4,Z(.35),4.6,Z(-.35),12,INK.brown);
  caption(k,2.5,'DAKAR','A LONG WAY FROM HOME',INK.navy,INK.green);},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);dunes(k,4.5,2.1,'#4a4468');hutBack(k,.9,2.3,.7,'#6a5a6a');hutBack(k,1.8,2.35,.6,'#5d506a');baobabBack(k,3.2,2.35,.8,'#4d4050');k.fill(rect(0,2.45,4.5,.55),'#8f7e8f');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.45);sea(k,4.5,1.9,.35);skyline(k,4.5,2.25);k.fill(rect(0,2.25,4.5,.75),'#e6c98f');}},-3.05,1.22);
  const moon=bd.add(S.sun(K+'s-moon',.26,INK.white),'L',3.8,2.0,{out:.012}),stars=bd.add(S.stars(K+'s-stars',2.2,.8),'L',1.2,2.1,{out:.02});
  const sun=bd.add(S.sun(K+'s-sun',.34),'R',3.6,1.6,{out:.012}),birds=bd.add(S.birds(K+'s-birds',.8,.3),'R',1.4,2.3,{out:.02});
  const hut1=B.stand(hut('s-hut1',1.4,1.25,'#8a6a60'),-3.9,-1.2,{layer:1});B.stand(baobab('s-tree',1.2,1.5),-2.4,-1.9,{layer:1});
  const post=B.stand(signpost('s-post',1.5,1.5,'VILLAGE','DAKAR'),-.95,-1.1,{layer:1,s:0});
  const H=B.person(K+'s-sadio',-3.3,.7,1.1,{shirt:'casual',...SADIO,face:'smile',layer:2,holdR:'suitcase'});
  const choice=B.stand(S.flipCard(K+'s-choice',1.2,.34,'A BIG CHOICE',INK.yellow,INK.navy),-3.3,1.55,{layer:3,s:0});
  const luc=B.person(K+'s-luc',-2.3,.9,1.12,{shirt:'bib',skin:'#7f5138',hair:'curly',hairColor:'#17110d',face:'grin',layer:2});
  const lucTag=B.stand(S.flipCard(K+'s-luctag',1.0,.3,'LUC DJIBOUNE',INK.pink),-1.9,1.75,{layer:3,s:0});
  const frame=B.stand(doorFrame('s-door',1.3,1.6),.95,-1.2,{layer:1,s:0});const leaf=frame.flap(doorLeaf('s-leaf',1.3*.72,1.6*.88),-1.3*.36,0,{anchor:'bl',axis:'y',z:.02});
  const H2=B.person(K+'s-sadio2',1.1,.9,1.1,{shirt:'casual',...SADIO,face:'smile',layer:3,holdR:'suitcase'});
  const luc2=B.person(K+'s-luc2',.6,1.5,1.12,{shirt:'bib',skin:'#7f5138',hair:'curly',hairColor:'#17110d',face:'grin',layer:3});
  const far=B.stand(S.flipCard(K+'s-far',1.2,.34,'A LONG WAY',INK.orange),2.4,1.95,{layer:2,s:0});
  const mum=B.person(K+'s-mum',3.5,-.75,1.5,{shirt:'coach',hair:'bun',hairColor:'#17110d',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const uncle=B.person(K+'s-fam',4.35,-.25,1.65,{shirt:'ger',hair:'short',hairColor:'#17110d',adult:true,skin:'#5a3a28',face:'smile',layer:2});
  const fam=B.stand(S.flipCard(K+'s-famc',1.2,.32,'FAMILY SUPPORT',INK.green),3.9,.75,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`s-heart${i}`,.28),2.9+i*.6,1.6,{layer:3,s:0}));
  for(const [x,z,w,c] of [[-4.5,1.9,.8,'#6a6a7a'],[-.6,2.0,.6,'#6a6a7a'],[4.6,1.9,.7,'#9fb86a']] as const)B.stand(S.bush(K+`s-bush${x}`,w,w*.45,c),x,z,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.1):b.t;
   stars.dx=.2*beat(t,0,30);moon.dy=.3*beat(t,0,3)-.6*beat(t,18,22);sun.dy=.6*Math.max(beat(t,19,22),manual?beat(act,.4,1):0);birds.dx=-1*beat(t,20,34);
   hut1.s=beat(t,.5,1.5);H.body.s=beat(t,2,2.8);H.armL.rot=-.12-.5*pulse(t,3,4.6);
   post.s=beat(t,4.8,5.6);choice.s=beat(t,5.4,6.2)*(1-beat(t,9,9.6));H.body.yaw=-.3*pulse(t,5.2,8);
   luc.body.s=beat(t,8.3,9.1);lucTag.s=beat(t,9,9.8)*(1-beat(t,16,16.6));luc.armR.rot=.12+1.8*beat(t,11,11.6)-1.8*beat(t,13.4,14);
   const walk=beat(t,13.6,16.4);H.body.x=-3.3+1.9*walk;luc.body.x=-2.3+1.3*walk;H.body.dy=.03*Math.abs(Math.sin(t*6))*(t>13.6&&t<16.4?1:0);
   frame.s=beat(t,14.6,15.6);const open=Math.max(beat(t,17.4,18.6),manual?beat(act,0,.6):0);leaf.flip=1.55*open;
   // Through the door: the second cut-outs walk the long road to Dakar.
   const out=Math.max(beat(t,18.6,19.4),manual?beat(act,.4,.7):0);H2.body.s=out;luc2.body.s=out;H.body.s=beat(t,2,2.8)*(1-out);luc.body.s=beat(t,8.3,9.1)*(1-out);
   const go=Math.max(beat(t,19.6,24.4),manual?beat(act,.6,1):0);H2.body.x=1.1+1.1*go;H2.body.z=.9-.45*go;luc2.body.x=.6+1.1*go;luc2.body.z=1.5-.45*go;
   far.s=beat(t,20.4,21.2);
   mum.body.s=beat(t,25,25.8);uncle.body.s=beat(t,25.4,26.2);fam.s=beat(t,26.2,27);mum.armR.rot=.12+2.1*beat(t,27,27.6)+.3*wave(t,27.6,36,1.2);uncle.armL.rot=-.12-2*beat(t,27.2,27.8);
   H2.armR.rot=.12;H2.armL.rot=-.12-2*beat(t,28,28.6);
   hearts.forEach((h,i)=>{h.s=beat(t,30.4+i*.5,31+i*.5);});
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,16.4,17.2)+.45*beat(t,17.2,18)-.45*beat(t,34,35.5):0;
  };
 }};

/* ───────────── 3 · Someone noticed (dakar) ───────────── */
const dakar:SpreadDef={id:'dakar',rest:13.0,
 left:k=>{sand(k,-5,0,'#e3c48a');box(k,-4.7,Z(-2.1),4.4,3.2,.05,INK.white);bar(k,-2.5,Z(-2.1),-2.5,Z(1.1),.05,INK.white);
  caption(k,-2.5,'M’BOUR · 2009','SCOUTS SPOTTED HIM',INK.navy,INK.orange);},
 right:k=>{pitch(k,0,5);bar(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,2.4,Z(-2.1),2.2,.9,.05);k.fill(ell(0,Z(0),.07,.07),INK.white);
  caption(k,2.5,'GÉNÉRATION FOOT','PROMOTED · 2010–11',INK.navy,INK.green);},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);sea(k,4.5,1.7,.55);pirogue(k,1.0,2.1,.9,INK.red);pirogue(k,2.3,2.0,.8,INK.green);pirogue(k,3.5,2.15,.9,INK.blue);k.fill(rect(0,2.25,4.5,.75),'#e3c48a');}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);lightRig(k,.9,.9);lightRig(k,3.7,.85);crowd(k,4.5,1.7,2.4,SEN,2);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'d-sun',.34),'L',3.6,1.4,{out:.012}),cl=bd.add(S.cloud(K+'d-cl',1.0,.45),'R',2.4,2.6);
  const bunt=bd.add(S.bunting(K+'d-bunt',2.8,.4,SEN),'R',.8,2.5,{out:.03});
  const goalL=B.stand(S.goal(K+'d-goalL',1.4,.75),-4.0,-1.3,{layer:1});void goalL;
  const H=B.person(K+'d-sadio',-2.7,.6,1.15,{shirt:'casual',...SADIO,legs:'kick',face:'smile',layer:2});
  const scouts=[B.person(K+'d-sc0',-1.0,-.8,1.65,{shirt:'navy',hair:'cap',adult:true,skin:'#5a3a28',face:'open',layer:1}),B.person(K+'d-sc1',-.45,-.3,1.6,{shirt:'coach',hair:'short',adult:true,skin:'#8a5a3c',face:'open',layer:2})];
  const note=B.stand(S.noteCard(K+'d-note',.8,.6,['SADIO','FAST!']),-.6,.6,{layer:3,s:0});
  const spot=B.stand(S.flipCard(K+'d-spot',1.0,.34,'SPOTTED!',INK.orange),-3.9,1.3,{layer:3,s:0});
  const gfSign=B.stand(S.sign(K+'d-gf',1.5,1.25,'GÉNÉRATION FOOT',INK.yellow),.82,-1.7,{layer:1,s:0});
  const board=B.stand(helpBoard('d-board',2.1,1.45),2.62,-.6,{layer:1,s:0});
  const who=([['friend','LUC'],['family','FAMILY'],['club','THE CLUB']] as const).map(([w,l],i)=>{const x=-2.1/2+.36+i*.69;board.add(helperCard(`d-card${i}`,.58,.72,w,l),x,.28,{z:.012});return board.flap(qCover(`d-q${i}`,.6,.74,[INK.yellow,INK.orange,INK.green][i]),x,.28,{anchor:'bottom',z:.024});});
  const mates=[[.4,1.35,'#7f5138'],[4.1,1.3,'#5a3a28'],[.95,.35,'#8a5a3c']].map(([x,z,sk],i)=>B.person(K+`d-m${i}`,x as number,z as number,1.15,{shirt:'bib',hair:(['curly','short','short'] as const)[i],hairColor:'#17110d',skin:sk as string,face:'grin',layer:3}));
  const H2=B.person(K+'d-sadio2',1.3,1.2,1.2,{shirt:'bib',...SADIO,face:'smile',layer:3});
  const arrow=B.stand(upArrow('d-up',.55,.8),4.45,-1.55,{layer:1,s:0});const promo=B.stand(S.flipCard(K+'d-promo',1.2,.34,'PROMOTED!',INK.green),4.2,-.85,{layer:2,s:0});
  for(const [x,z] of [[-1.6,1.4],[-4.4,.3],[.6,-1.0],[4.6,1.9]])B.stand(S.cone(K+`d-cone${x}`,.28),x,z,{layer:2,tab:false});
  const hearts=[0,1,2].map(i=>B.stand(heart(`d-heart${i}`,.26),.6+i*.5,2.05,{layer:3,s:0}));
  const ball=ballPair(B,'d-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13):b.t;
   sun.dy=.5*beat(t,0,2);cl.dx=-.5*beat(t,0,34);
   H.body.s=beat(t,1.9,2.7);
   let bx:number,bz:number,dy=0;[bx,bz]=track(t,[[0,-2.3,.7],[4.2,-2.3,.7],[5,-3.6,-.9],[6,-3.6,-.9],[6.8,-2.3,.75],[8,-2.3,.75],[8.8,-3.9,-1.05],[12.5,-3.9,-1.05]]);dy=.2*pulse(t,4.2,5)+.25*pulse(t,8,8.8);ball(bx,bz,dy,t>1.9&&t<12.6);
   H.leg!.rot=-1*Math.max(pulse(t,3.9,4.5),pulse(t,7.7,8.3));
   scouts.forEach((s,i)=>{s.body.s=beat(t,4.4+i*.5,5.2+i*.5);});scouts[0].armR.rot=.12+1.8*beat(t,6.6,7.2)-1.8*beat(t,9,9.6);note.s=beat(t,7,7.8)*(1-beat(t,12,12.6));spot.s=beat(t,8.6,9.3);
   gfSign.s=beat(t,9.7,10.6);H2.body.s=beat(t,10.6,11.4);board.s=beat(t,12,12.8);
   const n=manual?act*3:0;const open=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,[16.2,18.4,20.2][i],[16.9,19.1,20.9][i])));
   // Each ? cover drops forward off its card, so WHO HELPED? on the board stays readable.
   who.forEach((f,i)=>{f.flip=1.45*open[i];});
   H2.armR.rot=.12+1.4*Math.max(open[0],open[1],open[2])*(1-beat(t,22.6,23.2));
   mates.forEach((m,i)=>{m.body.s=beat(t,21.4+i*.4,22.2+i*.4);cheer(m,beat(t,25+i*.3,25.6+i*.3)*(1-beat(t,29.4,30))+beat(t,31.6+i*.3,32.2+i*.3));});
   arrow.s=beat(t,24,24.8);arrow.dy=.2*beat(t,24.8,27);promo.s=beat(t,25.4,26.2);cheer(H2,beat(t,25.6,26.2)*(1-beat(t,29.4,30))+beat(t,31.4,32));
   hearts.forEach((h,i)=>{h.s=beat(t,30.8+i*.5,31.4+i*.5);});
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,9.4,10.2)+.45*beat(t,12,13)-.45*beat(t,33,34.5):0;
  };
 }};

/* ───────────── 4 · A new country (metz) ───────────── */
const metz:SpreadDef={id:'metz',rest:19.1,
 left:k=>{pitch(k,-5,0,'#7fa77a','#5c7f63');bar(k,-5,Z(-2.1),0,Z(-2.1),.05);box(k,-4.1,Z(-2.1),2.8,1.0,.05);
  caption(k,-2.5,'FRANCE · 2011','A LONG WAY FROM HOME',INK.navy,INK.blue);},
 right:k=>{pitch(k,0,5);bar(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.3,Z(-2.1),2.8,1.0,.05);
  caption(k,2.5,'SALZBURG · 2012','THE LEAGUE AND THE CUP',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb',INK.navy,y=>.35-y*.06);
    for(let i=0;i<9;i++){const x=.1+i*.48,h=.5+((i*5)%3)*.14,b=rect(x,2.3-h,.42,h);k.fill(b,i%2?'#e8d6b0':'#d9c7a0');k.key(b,.01);k.fill(poly([[x-.02,2.3-h],[x+.21,2.3-h-.3],[x+.44,2.3-h]]),'#5d6a86');k.fill(rect(x+.14,2.3-h+.12,.13,.14),INK.yellow);}
    const c=rect(2.0,.8,.5,1.5);k.fill(c,'#d9c7a0');k.key(c,.012);k.fill(poly([[1.98,.8],[2.25,.2],[2.52,.8]]),'#5d6a86');k.fill(rect(0,2.3,4.5,.7),'#7fa77a');}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);peaks(k,4.5,1.6,'#aab2c7',2);castle(k,2.6,1.85,.6);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('m-rain',1.5,.78),'L',2.2,2.2,{out:.03});
  const sun=bd.add(S.sun(K+'m-sun',.36),'R',3.6,2.2,{out:.012}),bow=bd.add(S.rainbow(K+'m-bow',3.0,1.2),'R',.5,2.5,{out:.016});
  const planeP=bd.add(S.plane(K+'m-plane',.7,.35),'R',.6,2.55,{out:.035});
  const sign=B.stand(S.sign(K+'m-sign',1.1,1.1,'FRANCE'),-3.9,-.95,{layer:1});
  for(const [x,z] of [[-4.6,1.8],[-.5,1.6],[4.6,1.8],[.5,-1.2]])B.stand(S.cone(K+`m-cone${x}`,.28),x,z,{layer:2,tab:false});const c11=sign.flap(S.flipCard(K+'m-2011',.85,.34,'2011',INK.blue),0,1.1*.56,{z:.03});
  const H=B.person(K+'m-sadio',-2.9,.5,1.25,{shirt:'navy',...SADIO,legs:'kick',face:'open',layer:2});
  const bag=B.stand(S.suitcaseProp(K+'m-bag',.45,.4),-3.6,.9,{layer:3,s:0});const age=B.stand(S.flipCard(K+'m-19',.8,.34,'AGE 19',INK.orange),-4.1,1.6,{layer:3,s:0});
  const board=B.stand(S.scoreboard(K+'m-board',1.8,1.4,'FIRST SEASON'),-1.4,-1.5,{layer:1,s:0});
  board.add(lineCard('m-rel',1.44,.64,['RELEGATED'],INK.white,INK.red),0,.38,{z:.012});const games=board.flap(lineCard('m-games',1.44,.64,['19 GAMES','1 GOAL'],'#3d5da0',INK.white),0,1.02,{z:.03});
  const down=B.stand(upArrow('m-down',.5,.7,INK.red,true),-.5,.3,{layer:2,s:0});
  const deckL=B.flat(S.bridgeDeck(K+'m-deckL',.96,1.25),-.98,1.9,{edge:'left',hinge:-1.45}),deckR=B.flat(S.bridgeDeck(K+'m-deckR',.96,1.25),.98,1.9,{edge:'right',hinge:1.45});
  const aus=B.stand(S.sign(K+'m-aus',1.1,1.1,'AUSTRIA',INK.red),.9,-1.6,{layer:1,s:0});
  const H2=B.person(K+'m-sadio2',1.6,.6,1.25,{shirt:'ger',...SADIO,face:'smile',layer:2});
  const cups=[B.stand(S.trophy(K+'m-cup0',.45,.75),2.8,-1.2,{layer:1,s:0}),B.stand(S.trophy(K+'m-cup1',.4,.65),3.4,-1.0,{layer:1,s:0})];
  const lc=B.stand(S.flipCard(K+'m-lc',1.3,.32,'LEAGUE + CUP',INK.gold,INK.navy),3.4,1.95,{layer:2,s:0});
  const eng=B.stand(S.sign(K+'m-eng',1.2,1.1,'ENGLAND 2014',INK.white),4.3,-.2,{layer:2,s:0});
  const mates=[[2.3,1.3,'#f1b88f'],[3.2,.9,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`m-mate${i}`,x as number,z as number,1.2,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const ball=ballPair(B,'m-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.1):b.t;
   c11.flip=-2.9+2.9*beat(t,2.2,3);H.body.s=beat(t,3.2,4);bag.s=beat(t,4.2,4.8);age.s=beat(t,6.8,7.5);
   const r=beat(t,8.2,9.4)*(1-beat(t,20,22))*(manual?1-beat(act,.2,.7):1);show(rain,r);rain.dx=.15*wave(t,9,20,.25);
   board.s=beat(t,10.2,11);games.flip=-3.2*beat(t,15.6,16.3);down.s=beat(t,16.2,17);down.dy=-.15*beat(t,17,18.4);
   let bx=-2.4,bz=.65,dy=0;if(t>11.4&&t<14.2){const u=beat(t,11.6,12.8);bx=-2.4-1.4*u;bz=.65-2.2*u;dy=.25*Math.sin(u*Math.PI);}ball(bx,bz,dy,(t>11&&t<14.2));H.leg!.rot=-1*pulse(t,11.3,11.9);
   H.body.yaw=-.25*pulse(t,16.4,19);
   const unfold=Math.max(beat(t,19.6,21.2),manual?beat(act,0,.6):0);deckL.s=unfold;deckR.s=unfold;
   aus.s=Math.max(beat(t,21.8,22.6),manual?beat(act,.5,.8):0);H2.body.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.6,.9):0);
   cups.forEach((c,i)=>{c.s=beat(t,25+i*.7,25.8+i*.7);});lc.s=beat(t,26.2,27);cheer(H2,beat(t,25.4,26)*(1-beat(t,27.6,28.2))+beat(t,33,33.6)+(manual?beat(act,.85,1):0));
   eng.s=beat(t,28,28.8);planeP.visible=t>28&&t<32.5;planeP.dx=2.6*beat(t,28.2,32.4);planeP.dy=.1*Math.sin(t*1.6);
   mates.forEach((m,i)=>{m.body.s=beat(t,24+i*.4,24.8+i*.4);cheer(m,beat(t,33.2+i*.3,33.8+i*.3));});
   const sunUp=Math.max(beat(t,21,23),manual?beat(act,.6,1):0);sun.dy=.5*sunUp;show(bow,beat(t,33,34.4));
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,18.8,19.6)+.45*beat(t,21.4,22.2)-.45*beat(t,32.4,33.4):0;
  };
 }};

/* ───────────── 5 · Missed penalties (penalty) ───────────── */
const penalty:SpreadDef={id:'penalty',rest:26.1,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);bar(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-4.1,Z(-2.0),2.9,1.1,.05);k.fill(ell(-2.65,Z(.2),.06,.06),INK.white);
  caption(k,-2.5,'2017','QUARTER-FINAL · CAMEROON',INK.white,INK.yellow);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);bar(k,0,Z(-2.0),5,Z(-2.0),.05);box(k,1.2,Z(-2.0),2.9,1.1,.05);
  caption(k,2.5,'2019','FINAL · ALGERIA 1–0',INK.white,INK.yellow);},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.55,SEN,1);lightRig(k,1.1,.25);lightRig(k,3.5,.3);k.fill(rect(0,2.55,4.5,.45),'#3f7f5a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#24356a');crowd(k,4.5,1.1,2.55,SEN,3);lightRig(k,1.0,.3);lightRig(k,3.6,.25);k.fill(rect(0,2.55,4.5,.45),'#3f7f5a');}},-3.05,1.22);
  const flag=B.stand(flagPlate('p-flag',.9,.9),-4.6,-.9,{layer:1});
  const board=B.stand(S.scoreboard(K+'p-board',1.6,1.3,'AFCON 2017'),-.9,-1.6,{layer:1,s:0});
  board.add(lineCard('p-out',1.3,.6,['KNOCKED','OUT'],INK.white,INK.red),0,.34,{z:.012});const qf=board.flap(lineCard('p-qf',1.3,.6,['SHOOT-OUT'],'#3d5da0',INK.white),0,.94,{z:.03});
  const goalL=B.stand(S.goal(K+'p-goalL',1.6,.85),-2.65,-1.7,{layer:1});void goalL;
  const keeper=B.person(K+'p-keeper',-2.65,-1.3,1.25,{shirt:'keeper',hair:'short',skin:'#5a3a28',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'p-sadio',-2.2,.9,1.3,{shirt:'ger',...SADIO,legs:'kick',face:'sad',layer:3});
  const missed=B.stand(S.flipCard(K+'p-missed',.9,.3,'MISSED',INK.blue),-4.1,.8,{layer:3,s:0});
  const board2=B.stand(S.scoreboard(K+'p-board2',1.6,1.3,'AFCON 2019'),1.1,-1.6,{layer:1,s:0});
  board2.add(lineCard('p-final',1.3,.6,['FINAL','ALGERIA 1–0'],INK.white,INK.navy),0,.34,{z:.012});const two=board2.flap(lineCard('p-two',1.3,.6,['2 MISSED'],'#3d5da0',INK.white),0,.94,{z:.03});
  const H2=B.person(K+'p-sadio2',2.6,.3,1.3,{shirt:'ger',...SADIO,face:'sad',layer:2});
  const medal=B.stand(S.flipCard(K+'p-medal',1.1,.3,'RUNNERS-UP',INK.grey,INK.navy),2.6,1.25,{layer:3,s:0});
  const sky=B.stand(skyCard('p-sky',1.5,1.3),3.85,-1.4,{layer:1,s:0});const cloudF=sky.flap(cloudFlap('p-cloud',1.56,1.12),0,1.3,{z:.02});
  const tott=B.stand(lineCard('p-tott',1.5,.55,['TEAM OF THE','TOURNAMENT'],INK.gold,INK.navy),3.85,1.95,{layer:2,s:0});
  const mates=[[1.6,1.1,'#7f5138'],[3.7,1.2,'#5a3a28'],[4.5,.4,'#8a5a3c']].map(([x,z,sk],i)=>B.person(K+`p-mate${i}`,x as number,z as number,1.25,{shirt:'ger',hair:i%2?'curly':'short',hairColor:'#17110d',skin:sk as string,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`p-heart${i}`,.26),1.4+i*.5,2.1,{layer:3,s:0}));
  const ball=B.stand(S.ball(K+'p-ball',.1),-2.4,1.0,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.1):b.t;
   flag.s=beat(t,2.2,3);flag.rot=.04*wave(t,3,40,.6);H.body.s=beat(t,2.6,3.4);
   board.s=beat(t,5.4,6.2);keeper.body.s=beat(t,6.4,7.2);qf.flip=-3.2*beat(t,13.6,14.3);
   // The 2017 kick goes wide of the post.
   ball.s=beat(t,9,9.6)*(1-beat(t,15,15.6));const u=beat(t,12.6,13.6);ball.x=-2.4-1.35*u;ball.z=1.0-2.9*u;ball.dy=.4*Math.sin(u*Math.PI);ball.rot=-u*8;
   H.leg!.rot=-1.1*pulse(t,12.3,12.9);keeper.body.rot=.8*pulse(t,12.8,14.4);keeper.body.dx=.25*pulse(t,12.8,14.4);missed.s=beat(t,13.8,14.5)*(1-beat(t,25,26));
   H.body.yaw=-.3*beat(t,14.6,15.6);
   board2.s=beat(t,16.6,17.4);two.flip=-3.2*beat(t,21.8,22.5);H2.body.s=beat(t,17.6,18.4);medal.s=beat(t,23.4,24.2);
   sky.s=beat(t,24.6,25.6);const lift=Math.max(beat(t,26.6,27.8),manual?beat(act,0,.6):0);cloudF.flip=-2.85*lift;
   tott.s=Math.max(beat(t,29.4,30.2),manual?beat(act,.6,.9):0);
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,30.6+i*.3,31.4+i*.3),manual?beat(act,.65,.95):0);cheer(m,Math.max(beat(t,32.2+i*.3,32.8+i*.3),manual?beat(act,.85,1):0));});
   cheer(H2,Math.max(beat(t,31.4,32),manual?beat(act,.8,1):0));
   hearts.forEach((h,i)=>{h.s=beat(t,35+i*.5,35.6+i*.5);});
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,16,17)+.45*beat(t,25.4,26.4)-.45*beat(t,34.6,35.6):0;
  };
 }};

/* ───────────── 6 · Brave enough to try again (final) ───────────── */
const final:SpreadDef={id:'final',rest:22.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);bar(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-4.1,Z(-2.0),2.9,1.1,.05);k.fill(ell(-2.65,Z(.2),.06,.06),INK.white);
  caption(k,-2.5,'CHAMPIONS!','AFRICA CUP OF NATIONS · 2021',INK.white,INK.yellow);},
 right:k=>{sand(k,0,5,'#ecd29a');road(k,0,Z(1.1),5,Z(1.1),.5,'#d9b77a');
  caption(k,2.5,'BAMBALI','A SCHOOL AND A HOSPITAL',INK.navy,INK.green);},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.55,SEN,4);lightRig(k,1.2,.25);lightRig(k,3.4,.3);k.fill(rect(0,2.55,4.5,.45),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe0a6',INK.orange,y=>.45-y/3*.4);dunes(k,4.5,2.1);baobabBack(k,.6,2.3,.8);hutBack(k,2.0,2.35,.6);baobabBack(k,4.0,2.3,.75);k.fill(rect(0,2.4,4.5,.6),'#ecd29a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'f-fw1',.4,INK.yellow),'L',1.0,1.2,{out:.03}),bd.add(S.firework(K+'f-fw2',.36,INK.grass),'L',3.4,1.0,{out:.03}),bd.add(S.firework(K+'f-fw3',.38,INK.red),'L',2.2,1.5,{out:.03})];
  const conf=bd.add(S.confetti(K+'f-conf',2.4,1.2,2),'L',1.2,1.3,{out:.04});
  const sun=bd.add(S.sun(K+'f-sun',.34),'R',3.1,1.8,{out:.012});const bunt=bd.add(S.bunting(K+'f-bunt',2.8,.4,SEN),'R',.8,2.6,{out:.03});
  const board=B.stand(S.scoreboard(K+'f-board',1.7,1.35,'FINAL'),-4.1,-1.25,{layer:1});
  board.add(lineCard('f-champ',1.36,.62,['FIRST','TITLE!'],INK.yellow,INK.navy),0,.36,{z:.012});
  const fl=[['SHOOT-OUT','#3d5da0'],['7TH MINUTE',INK.orange],['SENEGAL v EGYPT',INK.green]].map(([l,c],i)=>board.flap(lineCard(`f-f${i}`,1.36,.62,[l],c,INK.white),0,.98,{z:.024+i*.006}));
  const goalP=B.stand(S.goal(K+'f-goal',1.7,.85),-2.65,-1.7,{layer:1});void goalP;
  const keeper=B.person(K+'f-keeper',-2.65,-1.3,1.25,{shirt:'keeper',hair:'short',skin:'#c98c63',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'f-sadio',-1.7,.8,1.3,{shirt:'ger',...SADIO,legs:'kick',face:'smile',layer:3});
  const saved=B.stand(S.flipCard(K+'f-saved',.8,.3,'SAVED',INK.blue),-3.1,.3,{layer:2,s:0}),again=B.stand(S.flipCard(K+'f-again',1.1,.3,'STEP UP AGAIN',INK.yellow,INK.navy),-3.7,1.05,{layer:3,s:0});
  const boom=B.stand(pow('f-pow',.28),-2.0,-1.3,{layer:2,s:0,tab:false});const win=B.stand(S.flipCard(K+'f-win',1.2,.32,'WINNING KICK!',INK.pink),-.9,2.05,{layer:2,s:0});
  const mates=[[-3.6,1.5,'#7f5138'],[-.7,1.6,'#5a3a28']].map(([x,z,sk],i)=>B.person(K+`f-mate${i}`,x as number,z as number,1.25,{shirt:'ger',hair:i?'curly':'short',hairColor:'#17110d',skin:sk as string,face:'grin',layer:3}));

  const ball=B.stand(S.ball(K+'f-ball',.1),-2.1,.9,{layer:3,tab:false});
  const sch=B.stand(school('f-school',1.6,1.4),1.4,-1.5,{layer:1,s:0}),hosp=B.stand(hospital('f-hosp',1.7,1.45),3.7,-1.4,{layer:1,s:0});
  const H2=B.person(K+'f-sadio2',2.2,.55,1.3,{shirt:'ger',...SADIO,face:'smile',layer:2});const cup=H2.body.add(S.trophy(K+'f-cup',.36,.6),.02,1.3*1.22*.86,{z:.03});
  const team=[[1.2,.2,'#7f5138','short'],[3.2,.35,'#5a3a28','curly']].map(([x,z,sk,hr],i)=>B.person(K+`f-tm${i}`,x as number,z as number,1.25,{shirt:'ger',hair:hr as 'short',hairColor:'#17110d',skin:sk as string,face:'grin',layer:2}));
  const cupCard=B.stand(S.flipCard(K+'f-cupc',1.3,.34,'FIRST TIME EVER',INK.gold,INK.navy),2.2,1.35,{layer:3,s:0});
  const kids=[[.6,1.2,'bib','curly'],[4.2,1.05,'casual','bun'],[4.6,.1,'bib','short'],[1.2,1.85,'fan','short']].map(([x,z,sh,hr],i)=>B.person(K+`f-kid${i}`,x as number,z as number,.95,{shirt:sh as 'bib',hair:hr as 'short',hairColor:'#17110d',skin:SKINS[i%4],face:'grin',layer:3}));
  const home=B.stand(heart('f-home',.34,INK.red),3.4,1.6,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.8):b.t;
   H.body.s=beat(t,2.4,3.2);keeper.body.s=beat(t,3,3.8);
   // 7th minute: saved. Shoot-out: the winning kick.
   let bx=-2.1,bz=.9,dy=0,vis=true;
   if(t<9.4){}else if(t<10.4){const u=beat(t,9.4,10.4);bx=-2.1-.4*u;bz=.9-2.0*u;dy=.35*Math.sin(u*Math.PI);}
   else if(t<14.6){bx=-2.5;bz=-1.1;dy=.45;vis=t<12.2;}
   else if(t<18.6){bx=-2.1;bz=.9;vis=t>15.4;}
   else if(t<19.6){const u=beat(t,18.6,19.6);bx=-2.1-1.1*u;bz=.9-2.2*u;dy=.4*Math.sin(u*Math.PI)+.12*u;}
   else if(t<22){bx=-3.2;bz=-1.3;dy=.12;}else vis=false;
   ball.x=bx;ball.z=bz;ball.dy=dy;ball.visible=vis;ball.rot=-bx*4;
   H.leg!.rot=-1.1*Math.max(pulse(t,9.1,9.7),pulse(t,18.3,18.9));
   const save=pulse(t,9.7,11.6);keeper.armL.rot=-.12-2.1*save;keeper.armR.rot=.12+2.1*save;keeper.body.dy=.15*save;
   const dive=pulse(t,18.8,20.6);keeper.body.rot=.9*dive;keeper.body.dx=.3*dive;
   fl[2].flip=-3.2*beat(t,8.6,9.2);fl[1].flip=-3.2*beat(t,14.2,14.8);fl[0].flip=-3.2*Math.max(beat(t,19.8,20.4),manual?beat(act,.2,.5):0);
   saved.s=beat(t,10.8,11.4)*(1-beat(t,21,21.6));again.s=beat(t,14,14.6)*(1-beat(t,21,21.6));
   boom.s=beat(t,19.5,19.8)*(1-beat(t,21.6,22.2));win.s=beat(t,19.8,20.5);
   const joy=beat(t,19.8,20.4);mates.forEach((m,i)=>{m.body.s=beat(t,5+i*.4,5.8+i*.4);cheer(m,Math.max(joy,manual?beat(act,.6,1):0),.2*wave(t,20.4,34,1.2+i*.1));});
   fw.forEach((f,i)=>{const a=Math.max(beat(t,20+i*.4,21+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);show(f,a);f.rot=t*.2;});
   conf.visible=t>20||manual;conf.dy=-1.1+1.3*(manual?beat(act,.6,1):beat(t,20.2,23));
   // Raise the trophy.
   cheer(H,joy);H2.body.s=beat(t,20.2,21);team.forEach((m,i)=>{m.body.s=beat(t,20.6+i*.3,21.4+i*.3);cheer(m,Math.max(beat(t,21.4+i*.3,22+i*.3),manual?beat(act,.5,.9):0),.2*wave(t,22,34,1.1+i*.2));});
   const lift=Math.max(beat(t,23.3,24.6),manual?beat(act,0,.6):0);cup.visible=lift>.02;cup.scale=lift;cup.dy=.12*lift;cheer(H2,lift);cupCard.s=Math.max(beat(t,24,24.8),manual?beat(act,.5,.9):0);
   sch.s=beat(t,25.2,26);hosp.s=beat(t,26.6,27.4);
   kids.forEach((k2,i)=>{k2.body.s=beat(t,27.8+i*.3,28.6+i*.3);cheer(k2,beat(t,31.4+i*.25,32+i*.25));});
   home.s=beat(t,29.6,30.4);sun.dy=.5*beat(t,24.8,27);show(bunt,beat(t,31.2,32.2));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,24.4,25.2)+.5*beat(t,25.2,26)-.5*beat(t,33.6,34.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={bambali,secret,dakar,metz,penalty,final};
void pulse;void wave;void clamp01;void blob;void ell;
