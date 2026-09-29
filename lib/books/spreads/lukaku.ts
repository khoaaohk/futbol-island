/**
 * The six Lukaku pop-up spreads (a promise to my mother): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/lukaku/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: things folding away, a lamp gone dark, a rain cloud, a long bench,
 * grey jagged speech bubbles. Kits are plain colours with no crests.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Part,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='lukaku-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const ROM={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a22'};
const MUM={skin:'#7f5138',hair:'long' as const,hairColor:'#1d1a22'};
const DAD={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a22'};
const SK=['#f1b88f','#d99a6c','#b27650','#7f5138','#e8b48f'];

/* ───────────── page print helpers (solid ink: key lines don't read on prints) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w:number,c:string){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function boxLines(k:Kit,x0:number,x1:number,y:number,d:number){bar(k,x0,Z(y),x1,Z(y),.05,INK.white);bar(k,x0,Z(y),x0,Z(y+d),.05,INK.white);bar(k,x0,Z(y+d),x1,Z(y+d),.05,INK.white);bar(k,x1,Z(y+d),x1,Z(y),.05,INK.white);}
function floorboards(k:Kit,x0:number,x1:number,tone='#e3c79a',line='#b99664'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let y=.4;y<PAGE_D;y+=.4)bar(k,x0,y,x1,y,.025,line);for(let i=0;i<30;i++){const x=x0+((i*37)%50)/50*(x1-x0),y=Math.floor(((i*53)%64)/4)*.4;bar(k,x,y,x,y+.4,.025,line);}}
function cobbles(k:Kit,x0:number,x1:number,tone='#cfc6b0',line='#a3967b'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.18);for(let y=0;y<PAGE_D;y+=.4)for(let x=x0+((y/.4)%2)*.3;x<x1;x+=.6)k.fill(ell(x+.3,y+.2,.25,.15),'#d9d0bb');}
function rug(k:Kit,x:number,y:number,w:number,h:number,c:string){const r=rect(x,y,w,h);k.fill(r,c);k.dots(r,INK.navy,.05,.25);bar(k,x+.1,y+.1,x+w-.1,y+.1,.05,INK.yellow);bar(k,x+.1,y+h-.1,x+w-.1,y+h-.1,.05,INK.yellow);}
function stones(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;k.fill(ell(x,y,.16,.1),c);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function gables(k:Kit,w:number,base:number,seed=1){const cs=['#e7c9a0','#d9a47a','#f0dcb4','#c98c68'];for(let i=0;i<Math.ceil(w/.5);i++){const x=i*.5,h=.9+((i+seed)%3)*.18,b=rect(x,base-h,.46,h);k.fill(b,cs[(i+seed)%4]);k.key(b,.01);
 const st=[[x,base-h],[x,base-h-.08],[x+.08,base-h-.08],[x+.08,base-h-.16],[x+.16,base-h-.16],[x+.16,base-h-.26],[x+.3,base-h-.26],[x+.3,base-h-.16],[x+.38,base-h-.16],[x+.38,base-h-.08],[x+.46,base-h-.08],[x+.46,base-h]];k.fill(poly(st),cs[(i+seed)%4]);k.key(poly(st),.01);
 for(let r=0;r<3;r++)k.fill(rect(x+.1,base-h+.1+r*.26,.1,.14),(r+i)%3?INK.sky2:INK.yellow);k.fill(rect(x+.26,base-h+.1,.1,.14),INK.sky2);}}
function spire(k:Kit,x:number,base:number,h:number){const t=rect(x-.14,base-h*.6,.28,h*.6);k.fill(t,'#cbbd9c');k.key(t,.012);k.fill(poly([[x-.16,base-h*.6],[x,base-h],[x+.16,base-h*.6]]),'#8f95ad');k.key(poly([[x-.16,base-h*.6],[x,base-h],[x+.16,base-h*.6]]),.012);k.fill(ell(x,base-h*.45,.07,.07),INK.white);k.key(ell(x,base-h*.45,.07,.07),.008);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26/Math.max(1,n*.62),ink,{max:w*.86,weight:900}));},{rim:.018});
function heartPath(cx:number,cy:number,s:number){return `M${cx} ${cy+s*.45} C${cx-s*.9} ${cy-s*.1} ${cx-s*.4} ${cy-s*.8} ${cx} ${cy-s*.25} C${cx+s*.4} ${cy-s*.8} ${cx+s*.9} ${cy-s*.1} ${cx} ${cy+s*.45} Z`;}
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const doorLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,c);k.dots(d,INK.navy,.03,.25);k.key(d,.012);k.fill(rect(w*.15,h*.1,w*.7,h*.3),INK.sky2);k.key(rect(w*.15,h*.1,w*.7,h*.3),.01);k.circle(w*.82,h*.6,.02,INK.gold);},{rim:.012});
const tv=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.8);k.fill(b,'#4a4d5c');k.key(b,.014);k.fill(rect(w*.08,h*.08,w*.84,h*.62),INK.sky);k.dots(rect(w*.08,h*.08,w*.84,h*.62),INK.blue,.03,.4);k.keyFill(rect(w*.2,h*.8,w*.1,h*.2),'#4a4d5c');k.keyFill(rect(w*.7,h*.8,w*.1,h*.2),'#4a4d5c');},{rim:.014});
const radio=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,INK.red);k.key(b,.012);k.fill(ell(w*.3,h*.6,w*.18,w*.18),'#4a4d5c');k.fill(rect(w*.58,h*.4,w*.3,h*.1),INK.white);k.key(`M${w*.2} ${h*.2} L${w*.5} 0`,.014);},{rim:.012});
const soldStamp=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.9);k.key(b,.03,INK.red);k.text('SOLD',w/2,h*.72,h*.56,INK.red,{weight:900});},{rim:.012});
const lampP=(key:string,w:number,h:number,on:boolean)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.3,w*.08,h*.62),INK.brown);k.fill(rect(w*.25,h*.92,w*.5,h*.08),INK.brown);const shade=poly([[w*.2,h*.32],[w*.8,h*.32],[w*.66,0],[w*.34,0]]);k.fill(shade,on?INK.yellow:'#8d93a8');k.dots(shade,on?INK.orange:INK.navy,.03,.3);k.key(shade,.012);},{rim:.014});
const lampGlow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{for(let i=0;i<3;i++)k.fill(ell(r,r,r*(1-i*.28),r*(1-i*.28)),INK.yellow,.22+i*.12);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.fill(poly([[r+Math.cos(a)*r*.75,r+Math.sin(a)*r*.75],[r+Math.cos(a+.08)*r,r+Math.sin(a+.08)*r],[r+Math.cos(a-.08)*r,r+Math.sin(a-.08)*r]]),INK.yellow);}},{rim:0});
const tableP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=poly([[w*.04,h*.2],[w*.96,h*.2],[w,h*.38],[0,h*.38]]);k.fill(top,INK.wood);k.dots(top,INK.brown,.04,.3);k.key(top,.012);for(const x of [.06,.9])k.keyFill(rect(w*x,h*.38,w*.04,h*.62),INK.brown);k.fill(ell(w*.5,h*.28,w*.1,h*.05),INK.white);k.key(ell(w*.5,h*.28,w*.1,h*.05),.008);});
const photo=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.4);k.key(f,.016);const m=rect(w*.1,h*.1,w*.8,h*.7);k.fill(m,INK.grass);k.dots(m,INK.leaf,.04,.3);k.key(m,.012);
 const cx=w/2;k.fill(`M${cx-w*.2} ${h*.8} L${cx-w*.16} ${h*.46} Q${cx} ${h*.38} ${cx+w*.16} ${h*.46} L${cx+w*.2} ${h*.8} Z`,INK.grass);k.fill(`M${cx-w*.2} ${h*.8} L${cx-w*.16} ${h*.46} Q${cx} ${h*.38} ${cx+w*.16} ${h*.46} L${cx+w*.2} ${h*.8} Z`,INK.yellow,.9);k.key(`M${cx-w*.2} ${h*.8} L${cx-w*.16} ${h*.46} Q${cx} ${h*.38} ${cx+w*.16} ${h*.46} L${cx+w*.2} ${h*.8}`,.01);
 k.fill(ell(cx,h*.3,w*.11,h*.1),'#7f5138');k.key(ell(cx,h*.3,w*.11,h*.1),.01);k.circle(cx+w*.24,h*.7,w*.07,INK.white);const pl=rect(w*.15,h*.84,w*.7,h*.12);k.fill(pl,INK.gold);k.text(label,w/2,h*.93,h*.08,INK.navy,{max:w*.66,weight:900});});
const jar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const j=`M${w*.2} ${h*.12} L${w*.8} ${h*.12} L${w*.86} ${h*.3} L${w*.86} ${h} L${w*.14} ${h} L${w*.14} ${h*.3} Z`;k.fill(j,INK.sky2,.9);k.dots(j,INK.sky,.03,.3);k.key(j,.014);k.fill(rect(w*.16,0,w*.68,h*.13),INK.brown);k.key(rect(w*.16,0,w*.68,h*.13),.012);k.fill(ell(w*.5,h*.93,w*.12,h*.035),INK.gold);});
const promiseCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.pink,.035,.12);k.key(b,.014);k.text('MY PROMISE',w/2,h*.28,h*.13,INK.navy,{max:w*.86,weight:900});k.text('PRO BY 16',w/2,h*.6,h*.2,INK.red,{max:w*.86,weight:900});k.fill(heartPath(w/2,h*.82,h*.14),INK.pink);},{rim:.016});
const wing=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.fill(heartPath(w/2,h/2,h*.3),INK.white,.7);},{rim:.014});
const bigHeart=(key:string,s:number)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.92} C${s*.02} ${s*.55} ${s*.02} ${s*.08} ${s/2} ${s*.3} C${s*.98} ${s*.08} ${s*.98} ${s*.55} ${s/2} ${s*.92} Z`;k.fill(p,INK.red);k.dots(p,INK.pink,.035,.35);k.key(p,.016);k.text('PRO BY 16',s/2,s*.56,s*.13,INK.white,{weight:900,max:s*.6});},{rim:.02});
const counter=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.84);k.fill(b,INK.night);k.dots(b,INK.blue,.04,.35);k.key(b,.016,'#101a36');k.fill(rect(w*.44,h*.84,w*.12,h*.16),'#1a2447');k.text(title,w/2,h*.14,h*.09,INK.yellow,{max:w*.86,weight:900});});
const digit=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.3);k.key(b,.014,'#101a36');k.key(`M0 ${h/2} L${w} ${h/2}`,.012,'#101a36');k.text(label,w/2,h*.74,h*.62,INK.white,{weight:900});},{rim:.014});
const calendarP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.84);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.2),INK.red);k.text('2008',w/2,h*.15,h*.11,INK.white,{weight:900});k.keyFill(rect(w*.46,h*.84,w*.08,h*.16),INK.brown);});
const cake=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(w*.1,h*.45,w*.8,h*.55);k.fill(b,INK.pink);k.dots(b,INK.white,.035,.3);k.key(b,.014);k.fill(rect(w*.1,h*.45,w*.8,h*.1),INK.white);for(let i=0;i<4;i++){const x=w*(.25+i*.17);k.fill(rect(x-.015,h*.22,.03,h*.23),INK.sky);k.fill(ell(x,h*.17,.03,.05),INK.yellow);}k.text('16',w/2,h*.88,h*.28,INK.white,{weight:900});});
const contract=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.012);k.text('CONTRACT',w/2,h*.18,h*.11,INK.navy,{max:w*.86,weight:900});for(let i=0;i<4;i++)k.fill(rect(w*.12,h*(.3+i*.1),w*.76,h*.025),INK.grey);k.key(`M${w*.2} ${h*.82} q${w*.1} ${-h*.12} ${w*.2} 0 t${w*.2} 0`,.014,INK.blue);k.text('13 MAY 2009',w/2,h*.95,h*.08,INK.navy,{max:w*.86,weight:900});},{rim:.014});
const stadiumFace=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,'#e2d7bd');k.dots(b,INK.grey,.04,.3);k.key(b,.014);k.fill(rect(0,h*.14,w,h*.1),INK.pink);k.key(rect(0,h*.14,w,h*.1),.01);for(let i=0;i<7;i++){const x=w*(.05+i*.135);k.fill(rect(x,h*.3,w*.09,h*.18),INK.sky2);k.key(rect(x,h*.3,w*.09,h*.18),.008);}
 const arch=rect(w*.3,h*.52,w*.4,h*.48);k.fill(arch,INK.grass);k.dots(arch,INK.leaf,.035,.3);k.fill(rect(w*.3,h*.52,w*.4,h*.14),'#2d3f73');k.key(arch,.012);k.text('STADIUM',w/2,h*.215,h*.07,INK.white,{max:w*.6,weight:900});});
const bench=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const roof=`M0 ${h*.3} Q${w/2} ${-h*.05} ${w} ${h*.3} L${w} ${h*.42} Q${w/2} ${h*.08} 0 ${h*.42} Z`;k.fill(roof,INK.sky2,.8);k.key(roof,.014);for(const x of [.04,.93])k.keyFill(rect(w*x,h*.36,w*.03,h*.64),INK.grey);k.fill(rect(w*.05,h*.72,w*.9,h*.08),INK.navy);k.key(rect(w*.05,h*.72,w*.9,h*.08),.01);k.fill(rect(w*.05,h*.55,w*.9,h*.06),INK.navy);});
const signArm=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const p=poly([[0,0],[w*.86,0],[w,h/2],[w*.86,h],[0,h]]);k.fill(p,c);k.dots(p,INK.navy,.035,.2);k.key(p,.014);k.circle(w*.08,h/2,.03,INK.gold);k.text(label,w*.52,h*.7,h*.46,INK.white,{max:w*.72,weight:900});},{rim:.014});
const postP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.35,0,w*.3,h),INK.brown);k.fill(rect(0,h*.94,w,h*.06),INK.grey);},{rim:.012});
const bus=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.1,w,h*.7);k.fill(b,INK.blue);k.dots(b,INK.navy,.035,.25);k.key(b,.014);for(let i=0;i<5;i++)k.fill(rect(w*(.06+i*.18),h*.2,w*.13,h*.24),INK.sky2);k.fill(rect(0,h*.5,w,h*.06),INK.white);k.text('WEST BROM',w*.5,h*.72,h*.13,INK.white,{max:w*.8,weight:900});for(const x of [.2,.8]){k.fill(ell(w*x,h*.84,h*.14,h*.14),INK.navy);k.circle(w*x,h*.84,h*.06,INK.grey);}});
const bubbleBad=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const pts:number[][]=[];for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=i%2?.38:.5;pts.push([w/2+Math.cos(a)*w*r,h*.45+Math.sin(a)*h*r*.8]);}k.fill(poly(pts),'#5d6275');k.key(poly(pts),.012,'#2b2b33');k.fill(poly([[w*.3,h*.8],[w*.2,h],[w*.45,h*.82]]),'#5d6275');k.text('# ! ?',w/2,h*.55,h*.26,'#c9ccd9',{weight:900});},{rim:.012});
const megaphone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,h*.35],[w*.35,h*.35],[w,0],[w,h],[w*.35,h*.65],[0,h*.65]]);k.fill(p,INK.yellow);k.dots(p,INK.orange,.03,.3);k.key(p,.012);k.fill(rect(w*.15,h*.65,w*.1,h*.3),INK.navy);},{rim:.012});
const bannerPoles=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{for(const x of [0,w-.07]){const p=rect(x,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(x,y,.07,.08),INK.navy);k.key(p,.008);}
 const b=rect(.1,h*.06,w-.2,h*.5);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.2);k.key(b,.014);k.fill(rect(.1,h*.06,w-.2,h*.08),INK.red);lines.forEach((l,i)=>k.text(l,w/2,h*(.3+i*.17),h*.12,INK.navy,{max:w*.8,weight:900}));});
const kidsRow=(key:string,w:number,h:number,n:number,seed=0)=>sp(key,w,h,k=>{for(let i=0;i<n;i++){const x=w*(i+.5)/n,s=h*(.8+((i*7+seed)%3)*.1),c=[INK.yellow,INK.sky,INK.pink,INK.orange,INK.grass][(i+seed)%5],sk=SK[(i*3+seed)%5];
 k.fill(`M${x-s*.22} ${h} L${x-s*.2} ${h-s*.55} Q${x} ${h-s*.68} ${x+s*.2} ${h-s*.55} L${x+s*.22} ${h} Z`,c);k.key(`M${x-s*.22} ${h} L${x-s*.2} ${h-s*.55} Q${x} ${h-s*.68} ${x+s*.2} ${h-s*.55} L${x+s*.22} ${h}`,.01);k.fill(ell(x,h-s*.78,s*.15,s*.17),sk);k.key(ell(x,h-s*.78,s*.15,s*.17),.01);k.fill(`M${x-s*.15} ${h-s*.8} Q${x} ${h-s*1.02} ${x+s*.15} ${h-s*.8} Z`,'#2e2230');}},{rim:.015});
const pow=(key:string,r:number,c:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),c);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const starCard=(key:string,s:number,label:string)=>sp(key,s,s,k=>{const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i/10*Math.PI*2,r=i%2?s*.22:s*.5;return [s/2+Math.cos(a)*r,s/2+Math.sin(a)*r];});k.fill(poly(pts),INK.gold);k.dots(poly(pts),INK.orange,.03,.35);k.key(poly(pts),.014);k.text(label,s/2,s*.58,s*.11,INK.navy,{weight:900,max:s*.4});},{rim:.018});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · When money ran out (wintam) ───────────── */
const wintam:SpreadDef={id:'wintam',rest:33.8,
 left:k=>{cobbles(k,-5,0);
  k.text('ANTWERP · 1993',-2.5,Z(2.62),.42,INK.red,{max:4});k.text('HIS PARENTS CAME FROM ZAIRE',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{floorboards(k,0,5);rug(k,1.0,Z(.4),3.0,1.6,INK.red);
  k.text('WINTAM',2.5,Z(2.62),.46,INK.blue,{max:4});k.text('MONEY GOT VERY TIGHT',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);spire(k,3.3,2.2,2.0);gables(k,4.5,2.35,1);k.fill(rect(0,2.35,4.5,.65),'#cfc6b0');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f0dcb4');k.dots(p,INK.orange,.05,.14);const win=rect(2.6,.45,1.3,1.0);k.fill(win,'#bfe2ef');k.key(win,.03,INK.white);k.key('M3.25 .45 L3.25 1.45',.03,INK.white);k.fill(rect(0,2.3,4.5,.7),'#e3c79a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'w-sun',.3),'L',1.0,2.4,{out:.012}),storm=bd.add(stormCloud('w-storm',1.3,.66),'R',3.3,2.6,{out:.03});
  const dadPhoto=bd.add(photo('w-photo',.8,1.0,'ZAIRE'),'R',1.4,1.0,{out:.02});
  const sign=B.stand(S.sign(K+'w-sign',1.2,1.2,'ANTWERP',INK.white),-.85,-1.6,{layer:1});const c93=sign.flap(S.flipCard(K+'w-1993',.9,.36,'1993',INK.red),0,1.2*.56,{z:.03});
  const boy=B.person(K+'w-boy',-2.4,1.0,.9,{shirt:'casual',...ROM,face:'grin',layer:3});
  const mumL=B.person(K+'w-mum',-3.3,.5,1.55,{shirt:'coach',...MUM,adult:true,face:'smile',layer:2});
  const dadL=B.person(K+'w-dad',-4.1,.3,1.7,{shirt:'keeper',...DAD,adult:true,face:'smile',layer:2});
  const zaire=B.stand(S.flipCard(K+'w-zaire',1.3,.32,'FROM ZAIRE',INK.yellow,INK.navy),-3.7,1.55,{layer:3,s:0}),drc=B.stand(S.flipCard(K+'w-drc',1.3,.3,'NOW DR CONGO',INK.blue),-3.7,2.0,{layer:3,s:0});
  const pro=B.stand(S.flipCard(K+'w-pro',1.4,.3,'PRO FOOTBALLER',INK.grass),1.4,-.2,{layer:2,s:0});
  const am=B.stand(S.flipCard(K+'w-1999',1.3,.32,'1999 · AMATEUR',INK.white,INK.navy),-1.6,-.5,{layer:2,s:0});
  const jarP=B.stand(jar('w-jar',.45,.56),-1.2,1.7,{layer:3,s:0});
  const tvP=B.stand(tv('w-tv',.9,.8),3.9,-1.2,{layer:1});const radioP=B.stand(radio('w-radio',.5,.45),2.7,-1.35,{layer:1});
  const sold=[B.stand(soldStamp('w-sold1',.7,.28),3.9,-.3,{layer:2,s:0}),B.stand(soldStamp('w-sold2',.7,.28),2.7,-.7,{layer:2,s:0})];
  const tbl=B.stand(tableP('w-table',1.4,.75),2.4,.35,{layer:2});
  const lampOff=B.stand(lampP('w-lampoff',.7,1.8,false),4.35,.8,{layer:2});const lampOn=B.stand(lampP('w-lampon',.7,1.8,true),4.35,.8,{layer:2,s:0,tab:false});const glowP=lampOn.add(lampGlow('w-glow',.8),0,1.55,{anchor:'center',z:-.02});
  const noPower=B.stand(S.flipCard(K+'w-nopower',1.4,.3,'NO ELECTRICITY',INK.navy),4.05,2.15,{layer:3,s:0});
  const fam=[B.person(K+'w-fmum',1.3,1.1,1.5,{shirt:'coach',...MUM,adult:true,face:'smile',layer:3}),B.person(K+'w-fdad',2.1,1.3,1.65,{shirt:'casual',...DAD,adult:true,face:'smile',layer:3}),B.person(K+'w-from',2.8,1.6,.95,{shirt:'bib',...ROM,face:'smile',layer:3}),B.person(K+'w-fjordan',3.35,1.7,.8,{shirt:'fan',...ROM,face:'grin',layer:3})];
  const hearts=[0,1,2].map(i=>B.stand(heart(`w-h${i}`,.28),1.4+i*.8,2.1,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,33.8):b.t;
   c93.flip=-2.9+2.9*beat(t,2.6,3.4);boy.body.s=beat(t,3.6,4.4);
   dadL.body.s=beat(t,7.6,8.4);mumL.body.s=beat(t,8,8.8);zaire.s=beat(t,8.8,9.5)*(1-beat(t,17,17.6));drc.s=beat(t,10.2,10.9)*(1-beat(t,17,17.6));
   show(dadPhoto,beat(t,12.4,13.4));pro.s=beat(t,13.4,14.1)*(1-beat(t,18.2,18.8));dadL.armR.rot=.12+1.6*beat(t,13,13.6)-1.6*beat(t,17.6,18.2);
   am.s=beat(t,19,19.7);const st=beat(t,20.4,21.6)*(1-Math.max(beat(t,35,37),manual?beat(act,.4,1):0));storm.scale=st;storm.visible=st>.02;storm.dx=-.2*wave(t,21,34,.25);
   jarP.s=beat(t,22,22.7);jarP.rot=.06*wave(t,22.7,24.4,2);
   const sell=[beat(t,25.4,26.4),beat(t,26.6,27.6)];tvP.s=1-sell[0];radioP.s=1-sell[1];sold.forEach((q,i)=>{q.s=beat(t,25+i*1.2,25.5+i*1.2)*(1-beat(t,29.4,30));});
   tbl.s=1;fam.forEach((p,i)=>{p.body.s=beat(t,28+i*.3,28.7+i*.3);});
   noPower.s=beat(t,30.6,31.3)*(1-Math.max(beat(t,35,35.6),manual?beat(act,0,.4):0));
   const on=Math.max(beat(t,34.6,35.6),manual?beat(act,0,.6):0);lampOn.s=on>.02?1:0;lampOff.s=1-(on>.5?1:0);lampOn.visible=on>.02;show(glowP,on);glowP.rot=t*.3;
   fam.forEach((p,i)=>cheer(p,Math.max(beat(t,36.6+i*.25,37.2+i*.25),manual?beat(act,.6+i*.08,.85+i*.08):0)*(i<2?.55:1)));
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,37.4+i*.5,38+i*.5),manual?beat(act,.8+i*.06,.95+i*.05):0);});sun.dy=.4*beat(t,36,38);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,11.6,12.6)+.45*beat(t,12.6,13.4)-.45*beat(t,18.4,19.2)+.45*beat(t,24.4,25.4):0;
  };
 }};

/* ───────────── 2 · A promise to his mother (promise) ───────────── */
const promise:SpreadDef={id:'promise',rest:14.3,
 left:k=>{pitch(k,-5,0);boxLines(k,-4.2,-1.4,-2.0,.9);
  k.text('RUPEL BOOM',-2.5,Z(2.62),.44,INK.navy,{max:4});k.text('HIS FIRST CLUB',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{floorboards(k,0,5);stones(k,.6,Z(2.0),4.4,Z(.2),7,INK.gold);
  k.text('PRO BY SIXTEEN',2.5,Z(2.62),.4,INK.red,{max:4});k.text('LIERSE · 121 GOALS IN 68 MATCHES',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'r-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);gables(k,4.5,2.0,3);k.fill(rect(0,2.0,4.5,.4),'#b9c98a');k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3dfb4');k.dots(p,INK.pink,.05,.12);const win=rect(.4,.5,1.3,1.0);k.fill(win,INK.sky2);k.key(win,.03,INK.white);k.fill(rect(0,2.3,4.5,.7),'#e3c79a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'r-sun',.3),'L',3.9,2.5,{out:.012}),cloud=bd.add(stormCloud('r-cloud',1.2,.6),'R',3.0,2.5,{out:.03});
  const shirtFrame=bd.add(photo('r-dadshirt',.8,1.0,'DAD'),'R',3.3,1.1,{out:.02});
  const likeDad=B.stand(S.flipCard(K+'r-likedad',1.3,.3,'LIKE HIS FATHER',INK.yellow,INK.navy),3.3,-1.35,{layer:1,s:0});
  const club=B.stand(S.sign(K+'r-club',1.4,1.25,'RUPEL BOOM',INK.white),-4.25,-1.1,{layer:1,s:0});
  const goalP=B.stand(S.goal(K+'r-goal',1.5,.8),-2.8,-1.55,{layer:1});void goalP;
  const small=B.person(K+'r-small',-2.2,.6,.9,{shirt:'bib',...ROM,legs:'kick',face:'grin',layer:3});
  const mates=[[-3.6,.2,'#f1b88f','curly'],[-1.2,1.2,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`r-m${i}`,x as number,z as number,.9,{shirt:'bib',skin:sk as string,hair:hr as 'short',face:'smile',layer:2}));
  const mum=B.person(K+'r-mum',1.1,-.6,1.55,{shirt:'coach',...MUM,adult:true,face:'smile',layer:2});
  const kid=B.person(K+'r-kid',2.0,-.3,1.0,{shirt:'casual',...ROM,face:'smile',layer:2});
  const note=B.stand(promiseCard('r-note',1.2,.9),2.4,.9,{layer:3,s:0});
  const wl=note.flap(wing('r-wl',.6,.9,INK.pink),-.6,0,{anchor:'bl',axis:'y',z:.02}),wr=note.flap(wing('r-wr',.6,.9,INK.red),.6,0,{anchor:'br',axis:'y',z:.024});
  const hp=B.stand(bigHeart('r-heart',.9),2.4,1.35,{layer:3,s:0});
  const board=B.stand(S.scoreboard(K+'r-board',1.7,1.35,'LIERSE'),-1.1,-1.7,{layer:1,s:0});
  const goalsC=board.flap(lineCard('r-121',1.36,.6,['121 GOALS','68 MATCHES'],INK.yellow),0,.98,{z:.02});
  const anderlecht=B.stand(S.sign(K+'r-and',1.4,1.25,'ANDERLECHT',INK.pink),4.3,-.6,{layer:2,s:0});const age13=B.stand(S.flipCard(K+'r-13',.8,.3,'AGE 13',INK.yellow,INK.navy),4.3,.3,{layer:2,s:0});
  const stepsP=[0,1,2,3].map(i=>B.stand(starCard(`r-st${i}`,.32,''),.6+i*1.1,1.95-i*.5,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'r-ball',.1),-1.8,.7,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.3):b.t;
   mum.body.s=beat(t,2.4,3.2);kid.body.s=beat(t,2.8,3.6);show(shirtFrame,beat(t,5,6));likeDad.s=beat(t,6,6.7)*(1-beat(t,13,13.6));kid.armR.rot=.12+1.6*beat(t,6.4,7)-1.6*beat(t,8.6,9.2);
   const c=beat(t,2.2,3.2)*(1-beat(t,6,7.4));cloud.scale=c;cloud.visible=c>.02;
   club.s=beat(t,9.2,10);small.body.s=beat(t,9.8,10.6);mates.forEach((p,i)=>{p.body.s=beat(t,10.4+i*.4,11.1+i*.4);});
   ball.s=beat(t,10.4,10.9);const [bx,bz,dy]=track(t,[[0,-1.8,.7,0],[11.6,-1.8,.7,0],[12.4,-2.8,-1.25,.3],[13.4,-2.8,-1.25,0],[14,-1.9,.8,0]]);ball.x=bx;ball.z=bz;ball.dy=dy;small.leg!.rot=-1.1*pulse(t,11.3,11.9);
   const fold=Math.max(beat(t,14.8,16.2),manual?beat(act,0,.55):0);
   // Before the fold the wings stand open; folding brings them in, and a heart pops up.
   note.s=Math.max(beat(t,13.2,13.9),manual?1:0);wl.flip=-2.8*(1-fold);wr.flip=2.8*(1-fold);
   hp.s=Math.max(beat(t,16.2,17),manual?beat(act,.55,.85):0);hp.rot=.08*wave(t,17,30,1);
   mum.armL.rot=-.12-1.5*Math.max(beat(t,17.6,18.2)*(1-beat(t,22,22.6)),manual?beat(act,.7,1):0);cheer(kid,Math.max(beat(t,19.6,20.2)*(1-beat(t,22.4,23)),manual?beat(act,.8,1):0)*.8);
   board.s=beat(t,23,23.8);goalsC.flip=-2.9+2.9*beat(t,24.2,25);
   anderlecht.s=beat(t,28,28.8);age13.s=beat(t,28.8,29.5);
   stepsP.forEach((q,i)=>{q.s=beat(t,31.6+i*.6,32.2+i*.6);});cheer(small,beat(t,34.6,35.2));mates.forEach((p,i)=>cheer(p,beat(t,35+i*.3,35.6+i*.3)));sun.dy=.5*beat(t,31,33);
   return b.narrated?.45*beat(t,1.8,2.8)-.9*beat(t,8.6,9.6)+.9*beat(t,14.2,15.2)-.45*beat(t,22.4,23.4):0;
  };
 }};

/* ───────────── 3 · Asking for a chance (deal) ───────────── */
const deal:SpreadDef={id:'deal',rest:18.9,
 left:k=>{pitch(k,-5,0);boxLines(k,-4.2,-1.2,-2.0,.9);
  k.text('ANDERLECHT YOUTH',-2.5,Z(2.62),.36,INK.pink,{max:4.2});k.text('AGE 15 · A DEAL WITH HIS COACH',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4});},
 right:k=>{pitch(k,0,5);boxLines(k,1.2,4.2,-2.0,.9);
  k.text('25 GOALS',2.5,Z(2.62),.46,INK.navy,{max:4});k.text('IN NOVEMBER · A MONTH EARLY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);k.hatch(rect(0,1.9,4.5,.5),INK.navy,.08,.78,.008);k.hatch(rect(0,1.9,4.5,.5),INK.navy,.08,-.78,.008);lightRig(k,1.0,.9);lightRig(k,3.6,.9);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.5,[INK.pink,INK.white,INK.pink,INK.navy,INK.white],2);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'d-sun',.3),'L',3.8,2.5,{out:.012});
  const R=B.person(K+'d-rom',-2.85,.4,1.25,{shirt:'coach',...ROM,number:'9',legs:'kick',face:'smile',layer:3});
  const coach=B.person(K+'d-coach',-1.8,.1,1.6,{shirt:'navy',skin:'#f1b88f',hair:'short',hairColor:'#8a6a40',adult:true,face:'smile',layer:2});
  const fifteen=B.stand(S.flipCard(K+'d-15',.8,.3,'AGE 15',INK.yellow,INK.navy),-3.9,1.3,{layer:3,s:0});
  const more=B.stand(S.flipCard(K+'d-more',1.4,.3,'MORE PLAYING TIME?',INK.white,INK.navy),-2.1,1.55,{layer:3,s:0});
  const dealC=B.stand(lineCard('d-dealc',1.15,.72,['25 GOALS','BY DECEMBER'],INK.yellow),-.64,-.9,{layer:2,s:0});
  const cal=B.stand(calendarP('d-cal',1.0,1.2),-4.1,-1.5,{layer:1});
  cal.add(S.flipCard(K+'d-dec',.8,.4,'DEC',INK.pink),0,.35,{z:.012});const nov=cal.flap(S.flipCard(K+'d-nov',.8,.4,'NOV',INK.grass),0,.75,{z:.02});
  const bold=B.stand(pow('d-bold',.3),-.6,1.9,{layer:3,s:0,tab:false});
  const cnt=B.stand(counter('d-count',1.6,1.5,'GOALS'),1.3,-1.4,{layer:1});
  cnt.add(digit('d-0',1.0,.8,'0',INK.navy),0,.35,{z:.012});
  const digits=['5','10','15','20','25'].map((l,i)=>cnt.flap(digit(`d-${l}`,1.0,.8,l,i===4?INK.pink:INK.blue),0,1.15,{z:.018+i*.005}));
  const goalP=B.stand(S.goal(K+'d-goal',1.7,.9),3.4,-1.3,{layer:1});void goalP;
  const keeper=B.person(K+'d-keeper',3.4,-.95,1.25,{shirt:'keeper',hair:'short',skin:'#e8b48f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const R2=B.person(K+'d-rom2',2.5,.9,1.25,{shirt:'coach',...ROM,number:'9',legs:'kick',face:'smile',layer:3});
  const nets=[0,1,2,3,4].map(i=>B.stand(S.ball(K+`d-net${i}`,.09),2.8+i*.28,-1.15,{layer:2,s:0,tab:false}));
  const early=B.stand(S.flipCard(K+'d-early',1.4,.32,'A MONTH EARLY',INK.pink),4.1,.6,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.9):b.t;
   R.body.s=beat(t,2.2,3);fifteen.s=beat(t,2.8,3.5)*(1-beat(t,18,18.6));more.s=beat(t,5,5.7)*(1-beat(t,9.6,10.2));
   coach.body.s=beat(t,7.6,8.4);const shake=beat(t,8.4,9)*(1-beat(t,15,15.6));R.armR.rot=.12+1.2*shake;coach.armL.rot=-.12-1.2*shake;
   dealC.s=beat(t,10.4,11.2);cal.s=beat(t,12.6,13.4);bold.s=beat(t,16.6,17)*(1-beat(t,18.4,18.8));
   const steps=manual?act*5:0;const auto=(i:number)=>beat(t,19.4+i*.45,19.8+i*.45);
   const lv=[0,1,2,3,4].map(i=>Math.max(clamp01(steps-i),auto(i)));
   digits.forEach((d,i)=>{d.flip=-2.9+2.9*lv[i];});nets.forEach((n,i)=>{n.s=lv[i];});
   R2.body.s=beat(t,18.4,19);const kick=maxK(lv);R2.leg!.rot=-1.1*kick;keeper.body.rot=.7*kick;
   nov.flip=-2.9+2.9*Math.max(beat(t,23,23.8),manual?beat(act,.9,1):0);
   early.s=Math.max(beat(t,25.2,25.9),manual?beat(act,.95,1):0);cheer(R2,Math.max(beat(t,24,24.6),manual?beat(act,.95,1):0));
   cheer(coach,beat(t,28.4,29)*.7);cheer(R,beat(t,28.8,29.4));sun.dy=.5*beat(t,27,29);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,18.4,19.2)+.45*beat(t,19.2,20)-.45*beat(t,27,28):0;
  };
 }};
function maxK(lv:number[]){let m=0;for(let i=0;i<lv.length;i++){const v=lv[i];m=Math.max(m,v>0&&v<1?Math.sin(v*Math.PI):0);}return m;}

/* ───────────── 4 · A promise kept (sixteen) ───────────── */
const sixteen:SpreadDef={id:'sixteen',rest:13.4,
 left:k=>{floorboards(k,-5,0);rug(k,-4.2,Z(.3),3.0,1.5,INK.blue);
  k.text('13 MAY 2009',-2.5,Z(2.62),.44,INK.red,{max:4});k.text('HIS SIXTEENTH BIRTHDAY',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);boxLines(k,1.2,4.2,-2.1,1.0);
  k.text('ANDERLECHT',2.5,Z(2.62),.44,INK.pink,{max:4});k.text('TOP SCORER · CHAMPIONS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3dfb4');k.dots(p,INK.pink,.05,.12);const win=rect(1.6,.45,1.3,1.0);k.fill(win,INK.sky2);k.key(win,.03,INK.white);k.fill(rect(0,2.3,4.5,.7),'#e3c79a');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.5,[INK.pink,INK.white,INK.pink,INK.navy,INK.white,INK.pink],3);lightRig(k,1.1,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const bunt=bd.add(S.bunting(K+'s-bunt',2.8,.4,[INK.pink,INK.yellow,INK.sky,INK.white]),'L',.8,2.6,{out:.03});
  const fw=[bd.add(S.firework(K+'s-fw1',.36,INK.pink),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'s-fw2',.34,INK.yellow),'R',3.2,2.3,{out:.03}),bd.add(S.firework(K+'s-fw3',.3,INK.white),'R',2.2,2.05,{out:.03})];
  const cakeP=B.stand(cake('s-cake',.8,.7),-4.1,-.2,{layer:2,s:0});
  const deskP=B.stand(tableP('s-desk',1.5,.8),-2.2,-.7,{layer:2});const paper=deskP.add(contract('s-contract',.55,.7),.1,.6,{z:.02});
  const R=B.person(K+'s-rom',-1.1,.3,1.3,{shirt:'casual',...ROM,face:'smile',layer:2});
  const mum=B.person(K+'s-mum',-3.2,.8,1.5,{shirt:'coach',...MUM,adult:true,face:'grin',layer:3});
  const kept=B.stand(S.flipCard(K+'s-kept',1.3,.34,'PROMISE KEPT',INK.pink),-2.3,1.7,{layer:3,s:0});const hp=B.stand(heart('s-heart',.4),-3.9,1.6,{layer:3,s:0});
  const stad=B.stand(stadiumFace('s-stad',2.6,1.6),2.5,-1.4,{layer:1});
  const dl=stad.flap(doorLeaf('s-dl',.52,.77,INK.navy),-.52,0,{anchor:'bl',axis:'y',z:.02}),dr=stad.flap(doorLeaf('s-dr',.52,.77,INK.navy),.52,0,{anchor:'br',axis:'y',z:.02});
  const eleven=B.stand(S.flipCard(K+'s-11',1.3,.32,'11 DAYS LATER',INK.yellow,INK.navy),.75,.2,{layer:2,s:0});
  const R2=B.person(K+'s-rom2',2.5,.3,1.3,{shirt:'coach',...ROM,number:'9',legs:'kick',face:'grin',layer:3});
  const mates=[[3.6,.9,'#f1b88f','short'],[1.9,1.25,'#d99a6c','curly'],[4.3,.2,'#e8b48f','bald']].map(([x,z,sk,hr],i)=>B.person(K+`s-mate${i}`,x as number,z as number,1.25,{shirt:'coach',skin:sk as string,hair:hr as 'short',face:'grin',layer:3}));
  const top=B.stand(lineCard('s-top',1.4,.44,['TOP SCORER'],INK.yellow),3.6,-.6,{layer:2,s:0});const trophy=B.stand(S.trophy(K+'s-trophy',.5,.85),4.4,1.3,{layer:3,s:0});const champs=B.stand(S.flipCard(K+'s-champs',1.2,.3,'CHAMPIONS',INK.pink),3.4,1.9,{layer:3,s:0});
  const star=B.stand(starCard('s-star',.9,'2009'),-.7,-1.5,{layer:1,s:0});const talent=B.stand(S.flipCard(K+'s-talent',1.5,.3,'BIGGEST YOUNG TALENT',INK.gold,INK.navy),-.8,-.4,{layer:2,s:0});
  const ball=ballPair(B,'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.4):b.t;
   cakeP.s=beat(t,2.4,3.2);R.body.s=beat(t,2.8,3.6);paper.s=beat(t,5,5.8);R.armR.rot=.12+1.1*pulse(t,6.4,8.6);
   mum.body.s=beat(t,10.4,11.2);kept.s=beat(t,11,11.7);hp.s=beat(t,11.6,12.2);const hug=beat(t,12,12.6);mum.armR.rot=.12+1.4*hug;R.armL.rot=-.12-1.4*hug;bunt.scale=beat(t,10.6,11.6);bunt.visible=bunt.scale>.02;
   const open=Math.max(beat(t,14,15.2),manual?beat(act,0,.55):0);dl.flip=-1.3*open;dr.flip=1.3*open;
   R2.body.s=Math.max(beat(t,16.2,17),manual?beat(act,.5,.8):0);R2.body.z=.3+.6*Math.max(beat(t,16.4,18.2),manual?beat(act,.55,.9):0);eleven.s=Math.max(beat(t,16.6,17.3),manual?beat(act,.6,.85):0);
   mates.forEach((p,i)=>{p.body.s=Math.max(beat(t,18+i*.4,18.7+i*.4),manual?beat(act,.7+i*.08,.9+i*.03):0);});
   let [bx,bz,dy]=track(t,[[0,2.9,1.0,0],[21.6,2.9,1.0,0],[22.4,2.8,-1.2,.3],[23.2,2.8,-1.2,0],[24,3.2,1.1,0],[24.8,2.2,-1.2,.3]]);ball(bx,bz,dy,t>19||manual);R2.leg!.rot=-1.1*Math.max(pulse(t,21.3,21.9),pulse(t,24.5,25.1));
   top.s=beat(t,22.6,23.3);trophy.s=beat(t,26,26.8);champs.s=beat(t,26.6,27.3);cheer(R2,Math.max(beat(t,26.8,27.4),manual?beat(act,.95,1):0));mates.forEach((p,i)=>cheer(p,beat(t,27.2+i*.25,27.8+i*.25)));
   star.s=beat(t,29.2,30);talent.s=beat(t,30,30.7);
   fw.forEach((f,i)=>{const a=Math.max(beat(t,35+i*.5,36+i*.5),manual?beat(act,.85+i*.04,.97+i*.01):0);f.scale=a;f.visible=a>.02;f.rot=t*.2;});cheer(mum,beat(t,35.4,36)*.6);cheer(R,beat(t,35.8,36.4));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,13.4,14.2)+.45*beat(t,14.2,15)-.45*beat(t,28.4,29.2)-.45*beat(t,29.2,30)+.45*beat(t,34.6,35.4):0;
  };
 }};

/* ───────────── 5 · Left on the bench (bench) ───────────── */
const benchS:SpreadDef={id:'bench',rest:22.3,
 left:k=>{pitch(k,-5,0);bar(k,-5,Z(-.9),0,Z(-.9),.06,INK.white);
  k.text('LONDON · 2011',-2.5,Z(2.62),.42,INK.blue,{max:4});k.text('MOSTLY WITH THE RESERVES',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#8e8f98');k.dots(p,'#5d5f6c',.05,.25);for(let x=.2;x<4.8;x+=.55)bar(k,x,Z(.9),x+.3,Z(.9),.06,INK.white);pitch(k,0,5,INK.grass,INK.leaf);const road=rect(0,Z(.5),5,.8);k.fill(road,'#6f7282');for(let x=.2;x<4.8;x+=.55)bar(k,x,Z(.9),x+.3,Z(.9),.06,INK.white);
  k.text('17 GOALS',2.5,Z(2.62),.46,INK.navy,{max:4});k.text('ON LOAN AT WEST BROMWICH ALBION',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ccd9',INK.navy,y=>.3-y/3*.2);crowd(k,4.5,1.2,2.5,[INK.blue,INK.white,INK.blue,INK.sky,INK.white],1);lightRig(k,1.1,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.5,[INK.navy,INK.white,INK.navy,INK.white,INK.sky],4);lightRig(k,3.8,.4);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('b-rain',1.3,.66),'L',2.2,2.3,{out:.03}),sun=bd.add(S.sun(K+'b-sun',.32),'R',3.2,2.5,{out:.012});
  const sign=B.stand(S.sign(K+'b-sign',1.2,1.2,'LONDON',INK.white),-4.3,-1.2,{layer:1});const c11=sign.flap(S.flipCard(K+'b-2011',.9,.36,'2011',INK.blue),0,1.2*.56,{z:.03});
  const dug=B.stand(bench('b-bench',2.0,1.0),-2.6,-.9,{layer:2});
  const R=B.person(K+'b-rom',-2.6,-.75,1.3,{shirt:'navy',...ROM,number:'18',adult:true,face:'shy',layer:2});
  const reserves=B.stand(S.flipCard(K+'b-res',1.2,.3,'RESERVES',INK.white,INK.navy),-2.6,.1,{layer:2,s:0});
  const trophy=B.stand(S.trophy(K+'b-trophy',.55,.9),-1.0,.9,{layer:3,s:0});const cl=B.stand(S.flipCard(K+'b-cl',1.5,.3,'CHAMPIONS 2012',INK.gold,INK.navy),-1.3,1.8,{layer:3,s:0});
  const team=[[-4.2,.8,'#f1b88f'],[-3.5,1.3,'#b27650'],[-1.6,1.45,'#e8b48f']].map(([x,z,sk],i)=>B.person(K+`b-t${i}`,x as number,z as number,1.3,{shirt:'navy',skin:sk as string,hair:(['short','curly','bald'] as const)[i],adult:true,face:'grin',layer:3}));
  const teamWon=B.stand(lineCard('b-teamwon',1.6,.44,['THE TEAM WON'],INK.sky2),-3.35,1.95,{layer:2,s:0});
  const post=B.stand(postP('b-post',.16,1.8),2.0,-.9,{layer:2});post.add(signArm('b-armwb',1.5,.42,'WEST BROM',INK.grass),.62,1.2,{z:.02});const armS=post.flap(signArm('b-arm',1.5,.42,'LONDON',INK.blue),.62,1.62,{z:.03});
  const busP=B.stand(bus('b-bus',1.6,.8),4.0,1.35,{layer:3,s:0,tab:false});B.slot(1.0,1.55,4.6,1.55);
  const R2=B.person(K+'b-rom2',3.4,-.2,1.3,{shirt:'fan',...ROM,number:'20',legs:'kick',adult:true,face:'grin',layer:2});
  const goalP=B.stand(S.goal(K+'b-goal',1.4,.75),3.9,-1.3,{layer:1,s:0});
  const seventeen=B.stand(lineCard('b-17',1.2,.46,['17 GOALS'],INK.yellow),1.2,.3,{layer:2,s:0});const most=B.stand(S.flipCard(K+'b-most',1.7,.3,'MORE THAN ANY CHELSEA PLAYER',INK.pink),4.1,.55,{layer:2,s:0});
  const ball=ballPair(B,'b-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.3):b.t;
   c11.flip=-2.9+2.9*beat(t,2.6,3.4);dug.s=beat(t,4.4,5.2);R.body.s=beat(t,4.8,5.6);
   const r=beat(t,8.6,9.8)*(1-Math.max(beat(t,24,26),manual?beat(act,.3,.9):0));rain.scale=r;rain.visible=r>.02;rain.dx=.15*wave(t,9.8,24,.3);reserves.s=beat(t,10.6,11.3)*(1-beat(t,22,22.6));
   trophy.s=beat(t,14,14.8);cl.s=beat(t,14.6,15.3);team.forEach((p,i)=>{p.body.s=beat(t,14.4+i*.35,15.1+i*.35);cheer(p,beat(t,15.6+i*.3,16.2+i*.3)*(1-beat(t,33,33.6)));});
   R.body.x=-2.6+.2*beat(t,16.6,17.4);R.armL.rot=-.12;R.armR.rot=.12+.6*beat(t,19.4,20)*(1-beat(t,22,22.6));teamWon.s=beat(t,19.4,20.1);
   const swing=Math.max(beat(t,23,24.4),manual?beat(act,0,.55):0);armS.flip=-2.9*swing;
   busP.s=Math.max(beat(t,25,25.6),manual?beat(act,.4,.6):0);busP.x=4.0-2.6*Math.max(beat(t,25.4,27.8),manual?beat(act,.5,.9):0);
   R.body.s=beat(t,4.8,5.6)*(1-Math.max(beat(t,26.8,27.4),manual?beat(act,.55,.7):0));goalP.s=beat(t,27,27.8);
   R2.body.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.75,.95):0);
   let [bx,bz,dy]=track(t,[[0,3.0,0,0],[28.6,3.0,0,0],[29.4,3.9,-1.05,.3],[30.2,3.9,-1.05,0],[30.8,2.9,.1,0],[31.6,3.7,-1.05,.3]]);ball(bx,bz,dy,t>28.3||manual);R2.leg!.rot=-1.1*Math.max(pulse(t,28.3,28.9),pulse(t,31.3,31.9));
   seventeen.s=beat(t,29.6,30.3);most.s=beat(t,31,31.7);cheer(R2,Math.max(beat(t,32,32.6),manual?beat(act,.95,1):0));sun.dy=.5*beat(t,33,35);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,22.2,23)+.45*beat(t,23,23.8)-.45*beat(t,33.4,34.2):0;
  };
 }};

/* ───────────── 6 · Speaking up (voice) ───────────── */
const voice:SpreadDef={id:'voice',rest:21.0,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);bar(k,-5,Z(-2.0),0,Z(-2.0),.05,INK.white);k.circle(-2.5,Z(0),.06,INK.white);
  k.text('ITALY · 2019',-2.5,Z(2.62),.44,INK.navy,{max:4});k.text('HE SPOKE OUT',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5);
  k.text('SAY NO TO RACISM',2.5,Z(2.62),.36,INK.red,{max:4.4});k.text('BELGIUM’S ALL-TIME TOP GOALSCORER',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'v-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,[INK.navy,INK.blue,INK.white,INK.navy,INK.sky],5);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'v-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.2,2.5,[INK.red,INK.yellow,INK.white,INK.red,INK.navy],6);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const storms=[bd.add(stormCloud('v-st1',1.3,.66),'L',1.4,2.3,{out:.03}),bd.add(stormCloud('v-st2',1.1,.56),'L',3.4,2.6,{out:.03})];
  const sun=bd.add(S.sun(K+'v-sun',.34),'R',3.8,2.2,{out:.012}),bow=bd.add(S.rainbow(K+'v-bow',3.0,1.2),'R',.5,2.5,{out:.016});
  const sign=B.stand(S.sign(K+'v-sign',1.3,1.2,'INTER MILAN',INK.white),-4.3,-1.2,{layer:1});const c19=sign.flap(S.flipCard(K+'v-2019',.9,.36,'2019',INK.blue),0,1.2*.56,{z:.03});
  const R=B.person(K+'v-rom',-2.4,.6,1.35,{shirt:'navy',...ROM,number:'9',adult:true,face:'smile',layer:3});
  const bubbles=[[-3.3,-.9],[-1.4,-1.2],[-2.6,-1.6],[-.8,-.3]].map(([x,z],i)=>B.stand(bubbleBad(`v-bub${i}`,.8,.6),x,z,{layer:1+(i%2),s:0,tab:false}));
  const defC=B.stand(lineCard('v-def',1.9,.5,['RACISM IS UNFAIR'],INK.white),-3.4,1.5,{layer:3,s:0});
  const mega=R.body.add(megaphone('v-mega',.45,.3),.4,1.35*1.22*.72,{z:.03});
  const speak=B.stand(S.flipCard(K+'v-speak',1.5,.3,'FOOTBALL, DO MORE!',INK.yellow,INK.navy),-1.4,1.9,{layer:3,s:0});
  B.stand(S.goal(K+'v-goal',1.3,.7),4.2,-1.3,{layer:1});B.stand(S.flipCard(K+'v-corner',.9,.3,'SPEAK UP',INK.red),.9,-.9,{layer:2});B.stand(S.cone(K+'v-cone1',.3),1.1,.9,{layer:2});B.stand(S.cone(K+'v-cone2',.3),4.5,.9,{layer:2});
  const banner=B.stand(bannerPoles('v-banner',3.0,1.5,['SAY NO','TO RACISM']),2.5,-1.4,{layer:1,s:0});
  const R2=B.person(K+'v-rom2',2.1,.6,1.35,{shirt:'navy',...ROM,number:'9',adult:true,face:'smile',layer:3});
  const blm=B.stand(S.flipCard(K+'v-blm',1.6,.3,'BLACK LIVES MATTER',INK.navy),1.35,2.1,{layer:3,s:0});
  const record=B.stand(lineCard('v-record',1.6,.5,['BELGIUM’S TOP SCORER'],INK.yellow),4.0,-.2,{layer:2,s:0});const trophy=B.stand(S.trophy(K+'v-trophy',.45,.8),4.55,.75,{layer:2,s:0});
  const kids=B.stand(kidsRow('v-kids',2.6,.8,7,2),3.5,1.9,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`v-h${i}`,.28,i===1?INK.red:INK.pink),.6+i*.45,1.5-i*.05,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21):b.t;
   c19.flip=-2.9+2.9*beat(t,2,2.8);R.body.s=beat(t,2.6,3.4);
   bubbles.forEach((q,i)=>{q.s=beat(t,7+i*.6,7.6+i*.6)*(1-Math.max(beat(t,22.6+i*.2,23.4+i*.2),manual?beat(act,.2,.6):0));q.rot=.06*wave(t,7.6,20,1.2+i*.2);});
   storms.forEach((s2,i)=>{const v=beat(t,7.4+i*.6,8.4+i*.6)*(1-Math.max(beat(t,23,25),manual?beat(act,.2,.8):0));s2.scale=v;s2.visible=v>.02;s2.dx=.15*wave(t,8,22,.3);});
   R.body.yaw=0;R.armL.rot=-.12-.5*beat(t,9,9.6)*(1-beat(t,16.6,17.2));defC.s=beat(t,12,12.8)*(1-beat(t,20.4,21));
   show(mega,beat(t,17,17.6));R.armR.rot=.12+1.4*beat(t,17,17.6)*(1-Math.max(beat(t,22,22.6),manual?beat(act,.4,.6):0));speak.s=beat(t,18.2,18.9);
   const raise=Math.max(beat(t,21.4,22.8),manual?beat(act,0,.6):0);banner.s=raise;
   R2.body.s=Math.max(beat(t,23.4,24.2),manual?beat(act,.5,.8):0);const kneel=Math.max(beat(t,25.8,26.8),manual?beat(act,.7,.9):0);R2.body.dy=-.22*kneel;R2.armR.rot=.12+2.9*kneel;blm.s=Math.max(beat(t,26.4,27.2),manual?beat(act,.8,1):0);
   record.s=beat(t,31,31.7);trophy.s=beat(t,31.6,32.4);cheer(R,beat(t,32.2,32.8)*.8);
   kids.s=beat(t,35.6,36.6);hearts.forEach((h,i)=>{h.s=beat(t,36.6+i*.5,37.2+i*.5);});sun.dy=.5*beat(t,23,25);bow.scale=beat(t,35,36.4);bow.visible=bow.scale>.02;
   return b.narrated?-.4*beat(t,1.4,2.4)+.4*beat(t,20.8,21.6)+.45*beat(t,21.6,22.4)-.45*beat(t,35,36):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={wintam,promise,deal,sixteen,bench:benchS,voice};
