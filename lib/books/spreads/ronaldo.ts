/**
 * The six Ronaldo Nazário pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/ronaldo/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically: a heart card parting, a bus leaving, a team sheet flipping, rain clouds, a stand folding flat.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='ronaldo-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const R9={skin:'#a8704a',hair:'short' as const,hairColor:'#2a211c'};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers (solid ink: key lines don't read on prints) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function asphalt(k:Kit,x0:number,x1:number,tone='#8e8f98'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,'#5d5f6c',.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));}
function court(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#e7b06a');k.dots(p,INK.wood,.05,.28);for(let x=x0+.5;x<x1;x+=.5)line(k,x,0,x,PAGE_D,.01,'#c98f52');}
function tiles(k:Kit,x0:number,x1:number,a='#dfe9ee',b='#c6d8e0'){for(let x=x0;x<x1;x+=.5)for(let y=0;y<PAGE_D;y+=.5)k.fill(rect(x,y,.5,.5),((x-x0)/.5+y/.5)%2<1?a:b);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function hills(k:Kit,w:number,y:number,tone:string,seed=0){const pts:number[][]=[[0,3.2],[0,y+.3]];for(let i=0;i<=6;i++){const x=i/6*w;pts.push([x,y-(i%2?.25+((i+seed)%3)*.18:0)]);}pts.push([w,y+.3],[w,3.2]);const p=poly(pts);k.fill(p,tone);k.dots(p,INK.green,.05,.3);k.key(p,.012);}
function sugarloaf(k:Kit,x:number,y:number,s:number){const p=`M${x-s} ${y} Q${x-s*.55} ${y-s*1.9} ${x} ${y-s*2} Q${x+s*.5} ${y-s*1.85} ${x+s*.9} ${y} Z`;k.fill(p,'#6f8d7a');k.hatch(p,INK.navy,.06,.7,.008);k.key(p,.012);}
function favela(k:Kit,x0:number,w:number,y:number,seed=1){const cs=['#f6d9a4','#ffb3c8','#bfe2ef','#f0c89a','#c9e6a8'];for(let i=0;i<Math.round(w/.26);i++){const x=x0+i*.26,h=.22+((i*5+seed)%4)*.07,b=rect(x,y-h,.24,h);k.fill(b,cs[(i+seed)%cs.length]);k.key(b,.008);k.fill(rect(x+.07,y-h+.06,.08,.07),INK.navy,.7);}}
function skyline(k:Kit,w:number,y:number){const cs=['#8f95ad','#a3a8bd','#7e849e'];for(let i=0;i<11;i++){const x=i*w/11,h=.4+((i*7)%5)*.14,b=rect(x,y-h,w/11-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.06,.06),INK.yellow,.7);}}
function spireChurch(k:Kit,x:number,y:number){const b=rect(x,y-.7,1.1,.7);k.fill(b,'#eee5d2');k.key(b,.012);for(let i=0;i<7;i++){const sx=x+.05+i*.165;k.fill(poly([[sx,y-.7],[sx+.05,y-1.15-(i%2)*.15],[sx+.1,y-.7]]),'#e2d6bd');k.key(poly([[sx,y-.7],[sx+.05,y-1.15-(i%2)*.15],[sx+.1,y-.7]]),.008);}for(let i=0;i<4;i++)k.fill(rect(x+.15+i*.23,y-.5,.1,.3),INK.sky);}
function stormCloud(key:string,w:number,h:number){return sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const house=(key:string,w:number,h:number,wall:string,roof:string)=>sp(key,w,h,k=>{const b=rect(0,h*.35,w,h*.65);k.fill(b,wall);k.dots(b,INK.orange,.04,.15);k.key(b,.013);const r=poly([[-.05,h*.37],[w/2,0],[w+.05,h*.37]]);k.fill(r,roof);k.hatch(r,INK.navy,.05,.5,.008);k.key(r,.013);
 const d=rect(w*.4,h*.66,w*.2,h*.34);k.fill(d,INK.blue);k.key(d,.01);for(const x of [.12,.68]){const wn=rect(w*x,h*.5,w*.2,h*.16);k.fill(wn,INK.yellow);k.key(wn,.01);}});
const gymHall=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.22,w,h*.78);k.fill(b,'#f2e6cc');k.dots(b,INK.sky,.045,.2);k.key(b,.014);const roof=`M-.04 ${h*.24} Q${w/2} ${-h*.02} ${w+.04} ${h*.24} Z`;k.fill(roof,INK.blue);k.key(roof,.013);
 const s=rect(w*.15,h*.28,w*.7,h*.14);k.fill(s,INK.pink);k.key(s,.01);k.text('FUTSAL',w/2,h*.39,h*.1,INK.white,{max:w*.62,weight:900});
 const inside=rect(w*.2,h*.48,w*.6,h*.52);k.fill(inside,'#e7b06a');k.dots(inside,INK.wood,.04,.3);k.key(inside,.012);k.fill(rect(w*.2,h*.48,w*.6,h*.14),INK.yellow);k.text('SOCIAL RAMOS',w/2,h*.58,h*.07,INK.navy,{max:w*.56,weight:900});
 for(let i=0;i<3;i++){const x=w*(.3+i*.2),y=h*.8;k.fill(ell(x,y-.1,.05,.05),'#7f5138');k.fill(rect(x-.06,y-.05,.12,.16),[INK.orange,INK.sky,INK.yellow][i]);}
 k.fill(ell(w*.5,h*.94,.045,.045),INK.white);k.key(ell(w*.5,h*.94,.045,.045),.008);});
const hallDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.red);k.dots(b,INK.navy,.03,.25);k.key(b,.013);k.key(rect(w*.12,h*.08,w*.76,h*.36),.01);k.key(rect(w*.12,h*.52,w*.76,h*.4),.01);k.circle(w*.8,h*.5,.025,INK.gold);},{rim:.012});
const bus=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.85} L0 ${h*.12} Q0 0 ${w*.08} 0 L${w*.92} 0 Q${w} 0 ${w} ${h*.14} L${w} ${h*.85} Z`;k.fill(b,INK.yellow);k.dots(b,INK.orange,.035,.25);k.key(b,.014);
 for(let i=0;i<5;i++){const wn=rect(w*(.05+i*.18),h*.12,w*.14,h*.3);k.fill(wn,INK.sky2);k.key(wn,.01);}k.fill(rect(0,h*.52,w,h*.08),INK.green);k.text('RIO',w*.8,h*.76,h*.14,INK.navy,{weight:900});
 for(const x of [.2,.78]){k.fill(ell(w*x,h*.86,h*.13,h*.13),INK.navy);k.circle(w*x,h*.86,h*.05,INK.grey);}});
const busStop=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.18,w*.08,h*.82),INK.grey);const s=ell(w/2,h*.14,w*.42,h*.13);k.fill(s,INK.blue);k.key(s,.012);k.text('BUS',w/2,h*.18,h*.1,INK.white,{weight:900});});
const pocket=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M0 0 L${w} 0 L${w} ${h*.7} Q${w/2} ${h*1.05} 0 ${h*.7} Z`;k.fill(p,'#3a5f9a');k.dots(p,INK.navy,.03,.3);k.key(p,.013);k.key(`M${w*.1} ${h*.12} L${w*.9} ${h*.12}`,.01,INK.white);k.text('FARE?',w/2,h*.55,h*.2,INK.white,{weight:900,max:w*.85});},{rim:.014});
const coin=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.gold);k.dots(ell(r,r,r,r),INK.orange,.025,.4);k.key(ell(r,r,r,r),.012);k.key(ell(r,r,r*.62,r*.62),.008,INK.orange);},{rim:.012});
const gatePost=(key:string,w:number,h:number,label:string,c:string=INK.navy)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,c);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.yellow,{max:w*.62,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);},{rim:.012});
const signPost=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.1,w*.08,h*.9),INK.brown);});
const arrowSign=(key:string,w:number,h:number,label:string,c:string,ink:string=INK.white)=>sp(key,w,h,k=>{const p=poly([[0,0],[w*.82,0],[w,h/2],[w*.82,h],[0,h]]);k.fill(p,c);k.dots(p,INK.navy,.03,.15);k.key(p,.013);k.text(label,w*.44,h*.66,h*.4,ink,{max:w*.74,weight:900});},{rim:.014});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
const teamSheet=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.78,w*.08,h*.22),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.dots(b,INK.grey,.035,.2);k.key(b,.014);k.fill(rect(0,0,w,h*.16),INK.navy);k.text('TEAM SHEET',w/2,h*.12,h*.08,INK.yellow,{max:w*.84,weight:900});
 for(let i=0;i<5;i++){const y=h*(.24+i*.1);k.fill(ell(w*.12,y,.03,.03),INK.navy);k.fill(rect(w*.2,y-.02,w*(i%2?.5:.62),.04),INK.grey);}});
const tower=(k:Kit,x:number,y:number,s:number)=>{const p=`M${x-s*.5} ${y} Q${x-s*.18} ${y-s*1.1} ${x-s*.06} ${y-s*2.3} L${x+s*.06} ${y-s*2.3} Q${x+s*.18} ${y-s*1.1} ${x+s*.5} ${y} L${x+s*.3} ${y} Q${x} ${y-s*.5} ${x-s*.3} ${y} Z`;k.fill(p,'#6a6f86');k.key(p,.01);k.fill(rect(x-s*.26,y-s*.9,s*.52,s*.06),'#6a6f86');k.fill(rect(x-s*.02,y-s*2.5,s*.04,s*.22),'#6a6f86');};
const pedestal=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(w*.1,h*.2,w*.8,h*.8);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.2);k.key(b,.013);const t=rect(0,0,w,h*.2);k.fill(t,INK.navy);k.key(t,.012);k.text(label,w/2,h*.64,h*.16,INK.navy,{max:w*.74,weight:900});});
const clockFace=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.white);k.key(ell(r,r,r,r),.02);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${r+Math.sin(a)*r*.78} ${r-Math.cos(a)*r*.78} L${r+Math.sin(a)*r*.9} ${r-Math.cos(a)*r*.9}`,.012);}k.fill(`M${r} ${r} L${r} ${r*.12} A${r*.88} ${r*.88} 0 0 1 ${r+Math.sin(.63)*r*.88} ${r-Math.cos(.63)*r*.88} Z`,INK.pink,.45);k.text('6 MIN',r,r*1.55,r*.3,INK.navy,{weight:900});},{rim:.015});
const hand=(key:string,l:number)=>sp(key,.05,l,k=>{k.fill(rect(0,0,.05,l),INK.navy);},{rim:.008});
const clinic=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.15,w,h*.85);k.fill(b,'#f5f7f8');k.dots(b,INK.sky,.04,.2);k.key(b,.014);k.fill(rect(-.04,h*.1,w+.08,h*.08),INK.teal);
 const c=ell(w/2,h*.36,w*.13,w*.13);k.fill(c,INK.teal);k.fill(rect(w/2-w*.03,h*.36-w*.09,w*.06,w*.18),INK.white);k.fill(rect(w/2-w*.09,h*.36-w*.03,w*.18,w*.06),INK.white);
 for(let i=0;i<3;i++){const wn=rect(w*(.1+i*.3),h*.58,w*.2,h*.16);k.fill(wn,INK.sky);k.key(wn,.01);}const d=rect(w*.4,h*.78,w*.2,h*.22);k.fill(d,INK.teal);k.key(d,.01);});
const stairs=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=3;for(let i=0;i<n;i++){const x=i*w/n,top=h-(i+1)*h/n,b=rect(x,top,w/n,h-top);k.fill(b,[INK.yellow,INK.orange,INK.pink][i]);k.dots(b,INK.navy,.035,.18);k.key(b,.013);k.text(String(i+1),x+w/n/2,top+h/n*.62,h/n*.45,INK.navy,{weight:900});}});
const bike=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w*.2} ${h*.95} L${w*.3} ${h*.45} L${w*.7} ${h*.45} L${w*.8} ${h*.95}`,.04,INK.grey);k.fill(ell(w*.5,h*.72,w*.22,w*.22),INK.navy);k.circle(w*.5,h*.72,w*.08,INK.grey);k.key(`M${w*.3} ${h*.45} L${w*.26} ${h*.2} M${w*.18} ${h*.18} L${w*.36} ${h*.18} M${w*.7} ${h*.45} L${w*.74} ${h*.3}`,.035,INK.navy);k.fill(ell(w*.75,h*.28,w*.1,h*.05),INK.navy);});
const dumbbell=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(w*.2,h*.42,w*.6,h*.16),INK.grey);k.key(rect(w*.2,h*.42,w*.6,h*.16),.01);for(const x of [0,w*.8]){const p=rect(x,0,w*.2,h);k.fill(p,INK.navy);k.key(p,.01);}},{rim:.012});
const thought=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.1,h*.7],[0,h*.4],[w*.15,h*.1],[w*.45,0],[w*.75,h*.05],[w,h*.35],[w*.9,h*.7],[w*.55,h*.8]]);k.fill(p,INK.white);k.dots(p,INK.sky,.035,.18);k.key(p,.013);
 const cx=w*.5,cy=h*.42,s=h*.3;const cup=`M${cx-s*.5} ${cy-s*.8} L${cx+s*.5} ${cy-s*.8} Q${cx+s*.45} ${cy} ${cx+s*.12} ${cy+s*.2} L${cx+s*.2} ${cy+s*.7} L${cx-s*.2} ${cy+s*.7} L${cx-s*.12} ${cy+s*.2} Q${cx-s*.45} ${cy} ${cx-s*.5} ${cy-s*.8} Z`;k.fill(cup,INK.gold);k.dots(cup,INK.orange,.03,.3);k.key(cup,.012);
 k.circle(w*.2,h*.9,.05,INK.white,true);k.circle(w*.1,h*.98,.03,INK.white,true);},{rim:.016});
const sunPost=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.55,w*.08,h*.45),INK.brown);const r=w*.34,cx=w/2,cy=h*.3;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.fill(poly([[cx+Math.cos(a-.12)*r,cy+Math.sin(a-.12)*r],[cx+Math.cos(a)*r*1.4,cy+Math.sin(a)*r*1.4],[cx+Math.cos(a+.12)*r,cy+Math.sin(a+.12)*r]]),INK.orange);}k.fill(ell(cx,cy,r,r),INK.yellow);k.dots(ell(cx,cy,r,r),INK.orange,.03,.3);k.key(ell(cx,cy,r,r),.012);
 k.circle(cx-r*.3,cy-r*.1,r*.08,INK.navy,true);k.circle(cx+r*.3,cy-r*.1,r*.08,INK.navy,true);k.key(`M${cx-r*.35} ${cy+r*.25} Q${cx} ${cy+r*.5} ${cx+r*.35} ${cy+r*.25}`,.014);});
const roadSign=(key:string,w:number,h:number,top:string,bottom:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.5,w*.08,h*.5),INK.grey);const b=rect(0,0,w,h*.52);k.fill(b,INK.green);k.key(b,.014);k.key(rect(.04,.04,w-.08,h*.52-.08),.01,INK.white);k.text(top,w/2,h*.22,h*.12,INK.white,{max:w*.86,weight:900});k.text(bottom,w/2,h*.42,h*.12,INK.yellow,{max:w*.86,weight:900});});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const cupTrophy=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cup=`M${w*.12} 0 L${w*.88} 0 Q${w*.86} ${h*.45} ${w*.6} ${h*.55} L${w*.66} ${h*.82} L${w*.34} ${h*.82} L${w*.4} ${h*.55} Q${w*.14} ${h*.45} ${w*.12} 0 Z`;k.fill(cup,INK.gold);k.dots(cup,INK.orange,.03,.35);k.key(cup,.013);const base=rect(w*.22,h*.82,w*.56,h*.18);k.fill(base,INK.green);k.key(base,.012);k.fill(ell(w*.5,h*.22,w*.14,h*.12),INK.yellow);});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),Rt=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[Rt,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A boy and a ball (street) ───────────── */
const street:SpreadDef={id:'street',rest:28.1,
 left:k=>{asphalt(k,-5,0,'#9a9aa2');for(let x=-4.8;x<0;x+=.9)line(k,x,Z(-.1),x+.45,Z(-.1),.05,INK.yellow);footprints(k,-4.2,Z(1.6),-1,Z(1.2),10,INK.navy);
  k.text('BENTO RIBEIRO',-2.5,Z(2.62),.42,INK.yellow,{max:4.3});k.text('RIO DE JANEIRO · BRAZIL · 1976',-2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 right:k=>{court(k,0,5);box(k,.4,Z(-2.3),4.2,4.3,.05);line(k,2.5,Z(-2.3),2.5,Z(2),.05);ring(k,2.5,Z(-.15),.55,.05);box(k,.4,Z(-.75),.5,1.2,.05);box(k,4.1,Z(-.75),.5,1.2,.05);
  k.text('SOCIAL RAMOS',2.5,Z(2.62),.4,INK.navy,{max:4.2});k.text('166 GOALS IN HIS FIRST SEASON',2.5,Z(2.9),.15,INK.red,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.5);sugarloaf(k,3.6,2.1,.5);hills(k,4.5,2.0,'#8fb37a',1);favela(k,.1,3.2,2.35,1);k.fill(rect(0,2.35,4.5,.65),'#9a9aa2');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);hills(k,4.5,2.0,'#9cbf84',3);favela(k,1.2,3.2,2.35,3);k.fill(rect(0,2.35,4.5,.65),'#e7b06a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.34),'R',3.8,1.9,{out:.012}),cloud=bd.add(S.cloud(K+'s-cloud',1.0,.45),'R',1.4,2.6);
  const rain=bd.add(stormCloud('s-rain',1.3,.66),'L',1.6,1.55,{out:.03}),birds=bd.add(S.birds(K+'s-birds',.8,.3),'L',2.6,2.5,{out:.02});
  const home=B.stand(house('s-home',1.35,1.3,'#ffe0b0',INK.red),-3.9,-1.5,{layer:1});
  B.stand(S.tree(K+'s-palm',.8,1.6,'palm'),-2.75,-1.85,{layer:1});const lamp=B.stand(S.lamp(K+'s-lamp',.3,1.5),-.55,-1.6,{layer:1});void lamp;
  const c76=B.stand(S.flipCard(K+'s-1976',.9,.36,'1976',INK.pink),-1.6,-1.2,{layer:1,s:0});
  const boy=B.person(K+'s-boy',-2.9,.5,1.0,{shirt:'bib',...R9,legs:'kick',face:'grin',layer:2});
  const pals=[[-1.4,.9,'#7f5138','curly'],[-4.2,1.2,'#f1b88f','short']].map(([x,z,sk,hr],i)=>B.person(K+`s-pal${i}`,x as number,z as number,.98,{shirt:i?'fan':'casual',hair:hr as 'short',skin:sk as string,legs:i?'kick':undefined,face:'grin',layer:3}));
  const mum=B.person(K+'s-mum',-4.45,-.45,1.6,{shirt:'coach',hair:'long',hairColor:'#2a211c',adult:true,skin:'#b27650',face:'smile',layer:2});
  const dad=B.person(K+'s-dad',-3.35,-.5,1.72,{shirt:'navy',hair:'short',hairColor:'#2a211c',adult:true,skin:'#a8704a',face:'smile',layer:2});
  const hL=B.stand(heart(`s-hL`,.5,INK.pink),-3.95,.9,{layer:3,s:0,tab:false}),hR=B.stand(heart(`s-hR`,.5,INK.pink),-3.95,.9,{layer:3,s:0,tab:false});
  const change=B.stand(S.flipCard(K+'s-change',1.2,.32,'A HARD CHANGE',INK.blue),-2.6,1.75,{layer:3,s:0});
  // Right page: the futsal hall opens.
  const hall=B.stand(gymHall('s-hall',2.0,1.7),2.5,-1.75,{layer:1});
  const dL=hall.flap(hallDoor('s-dL',.6,.88),-.6,0,{anchor:'bl',axis:'y',z:.014}),dR=hall.flap(hallDoor('s-dR',.6,.88),.6,0,{anchor:'br',axis:'y',z:.014});
  const boy2=B.person(K+'s-boy2',1.2,.6,1.05,{shirt:'casual',...R9,number:'9',legs:'kick',face:'grin',layer:2});
  const mates=[[3.3,.3,'#d99a6c','bun'],[3.9,1.3,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.0,{shirt:'casual',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const goal=B.stand(S.goal(K+'s-goal',1.1,.6),4.45,-.2,{layer:2,s:0});void goal;
  const tally=B.stand(S.scoreboard(K+'s-tally',1.2,1.0,'GOALS'),.75,-1.1,{layer:1,s:0});tally.add(lineCard('s-166',.95,.45,['166'],INK.yellow),0,.28,{z:.012});
  const love=B.stand(heart('s-love',.42,INK.red),1.9,1.55,{layer:3,s:0,tab:false});const loveCard=B.stand(S.flipCard(K+'s-lovec',1.2,.3,'FIRST LOVE',INK.pink),2.9,1.9,{layer:3,s:0});
  const ball=ballPair(B,'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,28.1):b.t;
   sun.dy=.5*beat(t,0,2.4);cloud.dx=-.5*beat(t,0,45);birds.dx=.8*beat(t,2,14);
   c76.s=beat(t,2.2,3);boy.body.s=beat(t,3,3.8);home.s=beat(t,1,2);
   pals.forEach((p,i)=>{p.body.s=beat(t,8+i*.5,8.8+i*.5);});
   // Street football between friends.
   let bx:number,bz:number,dy=0;
   if(manual||t>=22.2){[bx,bz]=[1.6,.75];}
   else [bx,bz]=track(t,[[0,-2.5,.6],[9.4,-2.5,.6],[10.4,-1.4,1.0],[11.4,-1.4,1.0],[12.4,-3.9,1.3],[13.2,-3.9,1.3],[14.2,-2.5,.6]]);
   dy=.08*Math.abs(Math.sin(t*4))*(t>9.4&&t<14.2?1:0);
   boy.leg!.rot=-1*maxOf([9.4,14.2].map(a=>pulse(t,a-.3,a+.3)));pals[1].leg!.rot=-1*pulse(t,11.9,12.5);
   // Parents appear; the heart parts (they separated) and a cloud passes over.
   mum.body.s=beat(t,15.2,16);dad.body.s=beat(t,15.5,16.3);
   const heartOn=beat(t,15.8,16.5);const part=beat(t,17,18.6);hL.s=heartOn;hR.s=heartOn*(1-beat(t,16.9,17.1));hL.visible=true;hR.visible=part<.05;
   hL.dx=-.35*part;hL.rot=-.3*part;hL.s*=1-beat(t,19.6,20.6);
   dad.body.x=-3.35+.0;dad.body.dx=.55*part;dad.body.yaw=.25*part;mum.body.dx=-.15*part;
   const rn=beat(t,18.6,19.8)*(1-beat(t,26,28.5))*(manual?1-beat(act,0,.4):1);rain.scale=rn;rain.visible=rn>.02;rain.dx=.2*wave(t,19.8,26,.3);
   change.s=beat(t,19.2,19.9)*(1-beat(t,22.4,23));
   boy.body.yaw=0;boy.armR.rot=.12;
   // He kept playing: over on the futsal court.
   boy2.body.s=Math.max(beat(t,22.4,23.2),manual?1:0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,24.2+i*.5,25+i*.5),manual?1:0);});
   hall.s=beat(t,21.8,22.8);
   const open=Math.max(beat(t,28.4,29.8),manual?beat(act,0,.6):0);dL.flip=-1.3*open;dR.flip=1.3*open;
   goal.s=Math.max(beat(t,29.6,30.4),manual?beat(act,.5,.8):0);
   tally.s=Math.max(beat(t,31,31.8),manual?beat(act,.7,1):0);
   let rbx=1.6,rbz=.75,rdy=0;
   if(manual){[rbx,rbz]=track(act,[[.6,1.6,.75],[.95,4.35,-.05]]);rdy=.1*pulse(act,.6,.95);}
   else if(t>=22.2){[rbx,rbz]=track(t,[[24.8,1.6,.75],[25.6,3.3,.4],[26.4,3.3,.4],[27.2,1.6,.75],[32,1.6,.75],[32.8,4.35,-.05],[33.6,4.35,-.05],[34.2,1.6,.75],[34.8,1.6,.75],[35.6,4.35,-.05]]);rdy=.12*(pulse(t,32,32.8)+pulse(t,34.8,35.6));}
   if(t>=22.2||manual)ball(rbx,rbz,rdy,true);else ball(bx,bz,dy,t>8.8);
   boy2.leg!.rot=-1*Math.max(maxOf([24.8,27.2,32,34.8].map(a=>pulse(t,a-.3,a+.3))),manual?pulse(act,.5,.7):0);
   const goalJoy=Math.max(beat(t,33,33.5)*(1-beat(t,34.4,34.8)),beat(t,35.8,36.3),manual?beat(act,.95,1):0);cheer(boy2,goalJoy);mates.forEach((m,i)=>cheer(m,Math.max(beat(t,36+i*.3,36.6+i*.3),manual?beat(act,.95,1):0)));
   love.s=Math.max(beat(t,36.8,37.6),manual?beat(act,.9,1):0);love.dy=.1*wave(t,37.6,46,.5);loveCard.s=beat(t,37.4,38.2);
   const hug=beat(t,40,41);mum.armR.rot=.12+1.8*hug+.3*wave(t,41,46,1.2);dad.armL.rot=-.12-1.6*hug;
   cheer(boy,beat(t,40.4,41));pals.forEach((p,i)=>cheer(p,beat(t,40.8+i*.3,41.4+i*.3)));
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,21.8,22.8)+.45*beat(t,22.8,23.8)-.45*beat(t,39.4,40.4):0;
  };
 }};

/* ───────────── 2 · The bus fare (busfare) ───────────── */
const busfare:SpreadDef={id:'busfare',rest:29.1,
 left:k=>{asphalt(k,-5,0);line(k,-5,Z(-.35),0,Z(-.35),.05,INK.white);for(let x=-4.8;x<0;x+=.8)line(k,x,Z(.35),x+.4,Z(.35),.05,INK.yellow);line(k,-5,Z(1.05),0,Z(1.05),.05,INK.white);
  k.text('ONE HOUR BY BUS',-2.5,Z(2.62),.4,INK.yellow,{max:4.3});k.text('HE COULD NOT AFFORD THE FARE',-2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.6,Z(-2.1),1.8,.9,.05);ring(k,0,Z(.1),.9,.05);
  k.text('A NEW ROAD',2.5,Z(2.62),.44,INK.navy,{max:4});k.text('1994 · YOUNGEST IN BRAZIL’S WORLD CUP SQUAD',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);sugarloaf(k,1.0,2.1,.45);skyline(k,4.5,2.35);k.fill(rect(0,2.35,4.5,.65),'#8e8f98');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.6-y/3*.5);crowd(k,4.5,1.3,2.45,[INK.yellow,INK.green,INK.blue,INK.white],2);lightRig(k,1.0,.4);lightRig(k,3.6,.45);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'b-sun',.32),'R',3.9,1.85,{out:.012}),cloud=bd.add(stormCloud('b-cloud',1.2,.6),'L',2.6,1.6,{out:.03});
  const bunt=bd.add(S.bunting(K+'b-bunt',3.0,.4,[INK.yellow,INK.green,INK.blue,INK.white]),'R',.8,2.7,{out:.03});
  const club=B.stand(gatePost('b-club',1.5,1.45,'PRACTICE',INK.red),-1.0,-1.6,{layer:1});
  const gl=club.flap(gateLeaf('b-gl',.56,1.0,INK.navy),-1.5/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=club.flap(gateLeaf('b-gr',.56,1.0,INK.navy),1.5/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const flCard=B.stand(S.flipCard(K+'b-fla',1.1,.32,'FLAMENGO',INK.red),-1.0,-.9,{layer:1,s:0});
  const stop=B.stand(busStop('b-stop',.6,1.5),-3.2,-.9,{layer:2});
  B.slot(-4.8,-1.55,-2.2,-1.55);const coach=B.stand(bus('b-bus',1.6,.8),-3.4,-1.55,{layer:1,tab:false});
  const H=B.person(K+'b-boy',-2.55,.45,1.02,{shirt:'casual',...R9,face:'open',layer:2});
  const purse=B.stand(pocket('b-pocket',.6,.55),-1.75,.9,{layer:3,s:0});const coins=[0,1].map(i=>purse.add(coin(`b-coin${i}`,.06),.18+i*.24,.52,{anchor:'center',z:.02}));
  const no=B.stand(stamp('b-no',1.2,.36,'TURNED DOWN'),-1.0,.2,{layer:2,s:0});
  const jair=B.person(K+'b-jair',-4.0,.75,1.72,{shirt:'coach',hair:'short',hairColor:'#2a211c',adult:true,skin:'#7f5138',face:'smile',layer:3});
  const scCard=B.stand(S.flipCard(K+'b-sc',1.3,.32,'SÃO CRISTÓVÃO',INK.white,INK.navy),-4.0,1.75,{layer:3,s:0});
  const youth=[[-1.7,1.6,'#d99a6c'],[-.7,1.3,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`b-y${i}`,x as number,z as number,1.0,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  // Right page: the road sign turns to Cruzeiro, then the 1994 squad.
  const post=B.stand(signPost('b-post',.3,1.6),.9,-.7,{layer:2});
  const signA=post.flap(arrowSign('b-sA',1.1,.36,'CRUZEIRO',INK.blue),.05,1.45,{anchor:'top',z:.02}),signB=post.flap(arrowSign('b-sB',1.1,.36,'NO FARE',INK.grey,INK.navy),.05,1.45,{anchor:'top',z:.03});
  const boy2=B.person(K+'b-boy2',1.8,.55,1.1,{shirt:'navy',...R9,legs:'kick',face:'grin',layer:3});
  const squad=[[3.0,-.9],[3.7,-1.2],[4.4,-.9]].map(([x,z],i)=>B.person(K+`b-sq${i}`,x,z,1.45,{shirt:'bib',hair:(['short','curly','bald'] as const)[i],skin:['#7f5138','#d99a6c','#b27650'][i],face:'grin',adult:true,layer:1}));
  const boy3=B.person(K+'b-boy3',3.3,.75,1.25,{shirt:'bib',...R9,number:'20',face:'grin',layer:2});
  const age=B.stand(S.flipCard(K+'b-17',.9,.32,'AGE 17',INK.pink),4.3,1.3,{layer:3,s:0});const cup=B.stand(cupTrophy('b-cup',.45,.7),4.2,.2,{layer:2,s:0});
  const ball=B.stand(S.ball(K+'b-ball',.1),2.15,.65,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,29.1):b.t;
   sun.dy=.5*beat(t,0,2);club.s=beat(t,1.9,2.9);flCard.s=beat(t,2.6,3.4);H.body.s=beat(t,3.2,4);
   // Bus arrives, the fare is missing, the bus drives off without him.
   coach.x=-2.2+(-1.2)*beat(t,6,8)-1.4*beat(t,11.4,14);coach.s=beat(t,5.6,6.4)*(1-beat(t,13.8,14.6));stop.s=beat(t,5.8,6.6);
   purse.s=beat(t,8.4,9.2)*(1-beat(t,15,16));coins.forEach((c,i)=>{c.visible=t<9.6+i*.4;c.dy=-.3*beat(t,9.2+i*.4,9.6+i*.4);});
   H.armL.rot=-.12-.8*pulse(t,8.6,11);H.body.yaw=-.35*pulse(t,11.4,14.8);
   const shut=beat(t,11.6,12.6);gl.flip=-1.2*(1-shut);gr.flip=1.2*(1-shut);no.s=beat(t,12.6,13.3)*(1-beat(t,22,23));
   cloud.scale=beat(t,11.4,12.6)*(1-beat(t,16,18));cloud.visible=cloud.scale>.02;
   // Jairzinho believes in him.
   jair.body.s=beat(t,15,15.8);scCard.s=beat(t,16.8,17.6);jair.armR.rot=.12+1.3*beat(t,19.4,20)-1.3*beat(t,22.6,23);H.body.x=-2.55;H.body.dx=-.55*beat(t,19.6,21);
   youth.forEach((y,i)=>{y.body.s=beat(t,23.4+i*.4,24.2+i*.4);});cheer(H,beat(t,24,24.6)*(1-beat(t,26,26.6)));
   post.s=beat(t,26.6,27.6);
   const turn=Math.max(beat(t,29.6,30.6),manual?beat(act,0,.6):0);signB.flip=-3.1*turn;signA.flip=0;
   boy2.body.s=Math.max(beat(t,30.6,31.4),manual?beat(act,.5,.8):0);ball.s=boy2.body.s;ball.x=2.15+.35*pulse(t,31.4,32.6);boy2.leg!.rot=-1*pulse(t,31.3,32.1);
   squad.forEach((p,i)=>{p.body.s=beat(t,32+i*.3,32.8+i*.3);});boy3.body.s=beat(t,33.2,34);age.s=beat(t,34.4,35.2);cup.s=beat(t,36,36.8);
   bunt.scale=beat(t,35.4,36.4);bunt.visible=bunt.scale>.02;
   const joy=beat(t,37,37.6);squad.forEach((p,i)=>cheer(p,beat(t,37+i*.2,37.6+i*.2)));cheer(boy3,joy);cheer(boy2,Math.max(beat(t,40.4,41),manual?beat(act,.8,1):0));
   jair.armL.rot=-.12-2*beat(t,40.6,41.2);cheer(H,beat(t,41,41.6));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,26.2,27.2)+.45*beat(t,27.2,28.2)-.45*beat(t,39.4,40.4):0;
  };
 }};

/* ───────────── 3 · Hours before the final (paris) ───────────── */
const paris:SpreadDef={id:'paris',rest:29.2,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);k.circle(-2.65,Z(.4),.05,INK.white);
  k.text('FRANCE · 1998',-2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('HOURS BEFORE THE FINAL',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#f3e3c3');k.dots(p,INK.pink,.06,.12);for(let x=.4;x<5;x+=.8)line(k,x,0,x,PAGE_D,.012,'#e1c9a0');
  k.text('BEST PLAYER',2.5,Z(2.62),.44,INK.pink,{max:4});k.text('OF THE TOURNAMENT',2.5,Z(2.9),.17,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.yellow,INK.blue,INK.white,INK.red,INK.white],1);lightRig(k,1.1,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.4);tower(k,3.4,2.3,.7);skyline(k,4.5,2.4);k.fill(rect(0,2.4,4.5,.6),'#f3e3c3');}},-3.05,1.22);
  const rainA=bd.add(stormCloud('p-rainA',1.4,.7),'L',1.3,2.0,{out:.03}),rainB=bd.add(stormCloud('p-rainB',1.2,.6),'L',3.4,2.3,{out:.035});
  const sun=bd.add(S.sun(K+'p-sun',.34),'R',1.4,1.5,{out:.012}),bow=bd.add(S.rainbow(K+'p-bow',3.0,1.2),'R',.6,2.5,{out:.016});
  const news=B.stand(lineCard('p-news',1.2,.8,['THE BEST','IN THE WORLD?'],INK.white,INK.red),-4.3,-1.0,{layer:1,s:0});
  const goal=B.stand(S.goal(K+'p-goal',1.6,.85),-2.65,-1.8,{layer:1});void goal;
  const H=B.person(K+'p-r9',-2.2,.7,1.3,{shirt:'bib',...R9,number:'9',legs:'kick',face:'smile',layer:2});
  const goals=[0,1,2,3].map(i=>B.stand(S.ball(K+`p-g${i}`,.1),-4.5+i*.32,1.9,{layer:3,s:0,tab:false}));const four=B.stand(S.flipCard(K+'p-four',1.0,.3,'4 GOALS',INK.yellow,INK.navy),-3.9,1.45,{layer:3,s:0});
  const board=B.stand(S.scoreboard(K+'p-board',1.6,1.2,'FINAL'),-.9,-1.35,{layer:1,s:0});
  board.add(S.scoreFlap(K+'p-03',1.3,.5,'BRA','0–3','FRA'),0,.32,{z:.012});const vs=board.flap(lineCard('p-vs',1.3,.5,['BRAZIL v FRANCE'],INK.white),0,.82,{z:.03});
  const sheet=B.stand(teamSheet('p-sheet',1.0,1.3),-4.2,.35,{layer:2,s:0});
  const nameIn=sheet.flap(S.flipCard(K+'p-in',.8,.26,'RONALDO',INK.yellow,INK.navy),0,1.3*.36,{z:.03}),nameOut=sheet.flap(S.flipCard(K+'p-out',.8,.26,'NOT PLAYING',INK.grey,INK.navy),0,1.3*.36,{z:.024});
  const bench=B.stand(S.bench(K+'p-bench',1.0,.42),-1.2,.95,{layer:2,s:0});
  const sick=B.person(K+'p-sick',-1.2,1.1,1.1,{shirt:'bib',...R9,number:'9',face:'sad',layer:3});
  const ill=B.stand(S.flipCard(K+'p-ill',1.0,.3,'VERY ILL',INK.blue),-1.3,1.9,{layer:3,s:0});
  // Right page: the golden ball lifts from its stand, and his words.
  const ped=B.stand(pedestal('p-ped',.9,.8,'1998'),1.3,-.7,{layer:2});
  const gb=B.stand(S.goldenBall(K+'p-gb',.28),1.3,-.6,{layer:2,s:0});
  const best=B.stand(S.flipCard(K+'p-best',1.3,.32,'BEST PLAYER',INK.gold,INK.navy),1.3,.1,{layer:3,s:0});
  const quote=bd.add(lineCard('p-quote',2.1,.95,['“WE LOST THE WORLD CUP','BUT I WON ANOTHER CUP','– MY LIFE.”'],INK.white),'R',2.9,1.25,{out:.04});
  B.stand(S.tree(K+'p-tree1',.7,1.3,'round'),4.6,-.6,{layer:1});B.stand(S.lamp(K+'p-lamp',.3,1.4),.45,-1.8,{layer:1});
  const R2=B.person(K+'p-r9b',2.35,.55,1.3,{shirt:'casual',...R9,face:'smile',layer:3});
  const fam=[[4.3,1.0,'#b27650','long'],[3.4,1.5,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`p-f${i}`,x as number,z as number,1.5,{shirt:i?'navy':'coach',hair:hr as 'short',hairColor:'#2a211c',skin:sk as string,adult:true,face:'smile',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`p-h${i}`,.28),2.4+i*.6,1.95,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'p-ball',.11),-1.75,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,29.2):b.t;
   H.body.s=beat(t,2.2,3)*(1-beat(t,13.6,14.4))+beat(t,24.2,25)*(1-beat(t,29.4,30.2));news.s=beat(t,4.4,5.2)*(1-beat(t,13,13.8));
   // Four goals on the way to the final.
   goals.forEach((g,i)=>{g.s=beat(t,8.6+i*.7,9+i*.7);});four.s=beat(t,11.4,12);
   let bx=-1.75,bz=.8,dy=0,vis=t<13.6||(t>24.2&&t<29.4);
   const shots=[8.4,9.1,9.8,10.5];for(const s0 of shots)if(t>=s0&&t<s0+.6){const u=(t-s0)/.6;bx=-1.75-.9*u;bz=.8-2.4*u;dy=.25*Math.sin(u*Math.PI);}
   if(t>25.4&&t<27.6){const u=beat(t,25.4,27.6);bx=-1.75-.4*u;bz=.8-1.2*u;dy=.1*Math.sin(u*Math.PI);}
   ball.x=bx;ball.z=bz;ball.dy=dy;ball.visible=vis;H.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.25,a+.25)));
   board.s=beat(t,11,11.8);
   // Suddenly very ill: the rain comes, he sits on the bench.
   const rn=beat(t,13.2,14.4)*(1-beat(t,32,34))*(manual?1-beat(act,0,.5):1);rainA.scale=rn;rainA.visible=rn>.02;rainB.scale=beat(t,24.9,26)*(1-beat(t,32,34))*(manual?1-beat(act,0,.5):1);rainB.visible=rainB.scale>.02;
   bench.s=beat(t,13.4,14.2);sick.body.s=beat(t,14,14.8)*(1-beat(t,23.6,24.4));ill.s=beat(t,15,15.6)*(1-beat(t,23.6,24.2));
   // Team sheet: taken off, then back in.
   sheet.s=beat(t,17.6,18.4);nameIn.flip=-3.1*beat(t,19,19.6)+3.1*beat(t,22.6,23.2);nameOut.flip=0;
   sick.armL.rot=-.12-1.6*beat(t,21.6,22.2)+1.6*beat(t,23,23.4);
   vs.flip=-3.1*beat(t,27,27.6);H.body.yaw=-.3*pulse(t,26.6,29);
   // Lift the golden ball.
   const lift=Math.max(beat(t,29.6,31),manual?beat(act,0,.7):0);gb.s=lift;gb.dy=.9*lift;best.s=Math.max(beat(t,31.6,32.4),manual?beat(act,.6,.9):0);
   R2.body.s=Math.max(beat(t,28.4,29.2),manual?1:0);cheer(R2,Math.max(beat(t,32,32.6)*(1-beat(t,34.4,35)),manual?beat(act,.8,1):0));
   quote.scale=beat(t,35,36);quote.visible=quote.scale>.02;fam.forEach((p,i)=>{p.body.s=beat(t,36.4+i*.4,37.2+i*.4);p.armR.rot=.12+1.4*beat(t,38+i*.3,38.6+i*.3);});
   sun.scale=Math.max(beat(t,33.4,34.6),manual?beat(act,.4,.9):0);sun.visible=sun.scale>.02;sun.dy=.5*sun.scale;
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,40.6+i*.5,41.2+i*.5),manual?beat(act,.8+i*.06,.9+i*.06):0);});
   bow.scale=beat(t,41.6,43);bow.visible=bow.scale>.02;R2.armR.rot+=.9*beat(t,40.6,41.2);
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,28.6,29.4)+.45*beat(t,29.4,30.2)-.45*beat(t,40,41):0;
  };
 }};

/* ───────────── 4 · The knee that gave way (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:30.8,
 left:k=>{pitch(k,-5,0);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-4,Z(-2.0),2.6,1.0,.05);ring(k,0,Z(.1),.9,.05);
  k.text('MILAN · 1999',-2.5,Z(2.62),.42,INK.navy,{max:4});k.text('NOVEMBER · AGAINST LECCE',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#9bbf7c','#6f9d62');const road=`M.2 ${Z(1.9)} Q1.6 ${Z(.8)} 2.6 ${Z(1.1)} Q3.8 ${Z(1.4)} 4.8 ${Z(.2)}`;for(let i=0;i<20;i++){const u=i/19,x=.2+4.6*u,y=Z(1.9-1.7*u+.5*Math.sin(u*Math.PI));k.fill(ell(x,y,.12,.05),'#cdbf9f');}void road;
  k.text('12 APRIL 2000',2.5,Z(2.62),.42,INK.pink,{max:4});k.text('A LONG ROAD AHEAD',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);spireChurch(k,.5,2.1);skyline(k,4.5,2.35);crowd(k,4.5,2.1,2.6,[INK.blue,INK.navy,INK.white],3);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.05);hills(k,4.5,2.2,'#a3b57c',2);k.fill(rect(0,2.45,4.5,.55),'#9bbf7c');}},-3.05,1.22);
  const rainL=bd.add(stormCloud('k-rainL',1.3,.66),'L',2.6,2.3,{out:.03}),rainR=bd.add(stormCloud('k-rainR',1.5,.75),'R',2.2,1.9,{out:.03});
  const bow=bd.add(S.rainbow(K+'k-bow',3.0,1.2),'R',.6,2.55,{out:.016});
  const sign=B.stand(S.sign(K+'k-sign',1.2,1.15,'MILAN'),-4.3,-1.6,{layer:1});const inter=sign.flap(S.flipCard(K+'k-inter',1.05,.34,'INTER',INK.blue),0,1.15*.56,{z:.03});
  const H=B.person(K+'k-r9',-2.6,.3,1.3,{shirt:'navy',...R9,number:'9',legs:'kick',face:'smile',layer:2});
  const mate=B.person(K+'k-mate',-1.3,.7,1.3,{shirt:'navy',hair:'curly',skin:'#f1b88f',face:'open',layer:2});
  const oops=B.stand(pow('k-pow',.22),-2.2,-.2,{layer:2,s:0,tab:false});
  const cl=B.stand(clinic('k-clinic',1.4,1.3),-1.0,-1.65,{layer:1,s:0});const op=B.stand(S.flipCard(K+'k-op',1.1,.32,'OPERATION',INK.teal),-3.9,1.55,{layer:3,s:0});
  // Right page: back after five months, six minutes on the clock, then the knee again.
  const cal=B.stand(S.scoreboard(K+'k-cal',1.1,1.0,'2000'),.8,-1.6,{layer:1,s:0});cal.add(S.flipCard(K+'k-apr',.85,.4,'12 APRIL',INK.pink),0,.28,{z:.012});const nov=cal.flap(S.flipCard(K+'k-nov',.85,.4,'5 MONTHS',INK.blue),0,.68,{z:.03});
  const clock=B.stand(clockFace('k-clock',.36),2.2,-1.2,{layer:1,s:0});const hnd=clock.arm(hand('k-hand',.3),0,.36,{z:.02});
  const R2=B.person(K+'k-r9b',3.0,.4,1.3,{shirt:'navy',...R9,number:'9',legs:'kick',face:'smile',layer:2});
  const end=B.stand(S.flipCard(K+'k-end',1.1,.32,'THE END?',INK.grey,INK.navy),1.2,1.55,{layer:3,s:0});const notEnd=B.stand(S.flipCard(K+'k-notend',1.3,.32,'NOT THE END',INK.yellow,INK.navy),1.2,1.55,{layer:3,s:0});
  const sunP=B.stand(sunPost('k-sunpost',1.0,1.5),4.2,-1.0,{layer:1});const cover=sunP.flap(stormCloud('k-cover',1.1,.62),0,1.5*.58,{anchor:'top',z:.02});
  const team=[[4.4,1.1,'#7f5138'],[1.9,.9,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`k-t${i}`,x as number,z as number,1.3,{shirt:'navy',hair:i?'bald':'short',skin:sk as string,face:'smile',layer:3}));
  const hearts=[0,1].map(i=>B.stand(heart(`k-h${i}`,.3),2.6+i*1.1,1.95,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'k-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,30.8):b.t;
   inter.flip=-2.9+2.9*beat(t,2.4,3.2);H.body.s=beat(t,3,3.8);mate.body.s=beat(t,4,4.8);
   // Playing, then the knee buckles and he limps off with help.
   let bx:number,bz:number,dy=0;[bx,bz]=track(t,[[0,-2.2,.45],[4.8,-2.2,.45],[5.6,-1.0,.8],[6.4,-1.0,.8],[7.2,-2.2,.45]]);
   ball(bx,bz,dy,t<9||t>17.5&&t<22.6||manual);H.leg!.rot=-1*pulse(t,4.5,5.1);
   const buckle=pulse(t,8.6,10.2);H.body.rot=.18*buckle;oops.s=buckle;
   const limp=beat(t,10.4,12.8);H.body.dx=-.9*limp;mate.body.dx=-1.05*limp;mate.armL.rot=-.12-1.2*beat(t,10.2,10.8)*(1-beat(t,13,13.6));H.body.dy=.03*Math.abs(Math.sin(t*6))*(t>10.4&&t<12.8?1:0);
   H.body.s*=1-beat(t,16.6,17.4);mate.body.s*=1-beat(t,16.6,17.4);
   rainL.scale=beat(t,8.4,9.6)*(1-beat(t,16,17.6));rainL.visible=rainL.scale>.02;
   cl.s=beat(t,13.4,14.4)*(1-beat(t,17.2,18));op.s=beat(t,14.2,15)*(1-beat(t,17.2,18));
   // Five months later, 12 April 2000.
   cal.s=beat(t,17.6,18.4);nov.flip=-3.1*beat(t,19.4,20.2);R2.body.s=beat(t,20,20.8)*(1-.62*beat(t,24.2,25.6));clock.s=beat(t,21.4,22.2);
   hnd.rot=Math.PI*2*(.1*beat(t,22.2,24.2));
   if(t>17.5&&t<22.6&&!manual){[bx,bz]=track(t,[[20.4,3.4,.55],[21.2,4.3,-.2],[21.8,3.4,.55]]);ball(bx,bz,0,true);}
   R2.leg!.rot=-1*pulse(t,20.2,20.8);R2.body.rot=-.2*pulse(t,23.8,25.2);
   const rr=beat(t,24,25.4)*(1-Math.max(beat(t,31.2,32.6),manual?beat(act,0,.6):0));rainR.scale=rr;rainR.visible=rr>.02;
   end.s=beat(t,28.2,29)*(1-Math.max(beat(t,33.2,33.8),manual?beat(act,.6,.8):0));
   // Lift the rain cloud: the sun was there all along.
   sunP.s=beat(t,26.4,27.4);const lift=Math.max(beat(t,31.2,32.6),manual?beat(act,0,.7):0);cover.flip=-2.9*lift;
   notEnd.s=Math.max(beat(t,33.6,34.4),manual?beat(act,.7,.95):0);R2.body.s=Math.max(R2.body.s,beat(t,34.6,35.8),manual?beat(act,.6,1):0);
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,35.4+i*.4,36.2+i*.4),manual?beat(act,.8,1):0);p.armR.rot=.12+1.6*beat(t,38.4+i*.3,39+i*.3);});
   hearts.forEach((h,i)=>{h.s=beat(t,39.6+i*.6,40.3+i*.6);});bow.scale=beat(t,40.8,42.2);bow.visible=bow.scale>.02;
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,17,18)+.45*beat(t,18,19)-.45*beat(t,38,39):0;
  };
 }};

/* ───────────── 5 · Step by step (recovery) ───────────── */
const recovery:SpreadDef={id:'recovery',rest:28.1,
 left:k=>{tiles(k,-5,0);line(k,-5,Z(1.3),0,Z(1.3),.05,INK.teal);
  k.text('TWO OPERATIONS',-2.5,Z(2.62),.42,INK.teal,{max:4});k.text('AND MONTHS OF REHABILITATION',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);ring(k,0,Z(.1),.9,.05);
  k.text('LATE 2001',2.5,Z(2.62),.44,INK.navy,{max:4});k.text('RONALDO BECAME INTER’S CAPTAIN',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'r-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#e6f0f2');k.dots(p,INK.teal,.05,.12);for(let i=0;i<3;i++){const w=rect(.4+i*1.4,.6,1.0,.9);k.fill(w,INK.sky2);k.key(w,.012);k.key(`M${.9+i*1.4} .6 L${.9+i*1.4} 1.5 M${.4+i*1.4} 1.05 L${1.4+i*1.4} 1.05`,.012);}k.fill(rect(0,2.2,4.5,.8),'#c6d8e0');k.key('M0 2.2 L4.5 2.2',.014);}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.25,2.5,[INK.blue,INK.navy,INK.white,INK.yellow],4);lightRig(k,1.0,.35);lightRig(k,3.6,.4);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'r-sun',.3),'R',3.9,1.9,{out:.012});
  const dream=bd.add(thought('r-dream',1.3,.9),'R',1.4,1.25,{out:.035});
  const cal=B.stand(S.scoreboard(K+'r-cal',1.1,1.0,'MONTHS'),-4.2,-1.55,{layer:1,s:0});cal.add(S.flipCard(K+'r-m0',.85,.4,'2002',INK.pink),0,.28,{z:.012});
  const months=['2001','2000'].map((m,i)=>cal.flap(S.flipCard(K+`r-m${m}`,.85,.4,m,i?'#3d5da0':INK.blue),0,.68,{z:.03-i*.006}));
  const ops=['1','2'].map((n,i)=>B.stand(lineCard(`r-op${n}`,.5,.5,[n],INK.teal,INK.white),-3.3+i*.62,-1.8,{layer:1,s:0}));
  const H=B.person(K+'r-r9',-2.4,.35,1.25,{shirt:'casual',...R9,face:'smile',layer:2});
  const bk=B.stand(bike('r-bike',.9,.8),-3.6,.75,{layer:2,s:0});const db=B.stand(dumbbell('r-db',.5,.2),-1.7,1.35,{layer:3,s:0,tab:false});
  const surgeon=B.person(K+'r-doc',-1.2,-.5,1.7,{shirt:'ger',hair:'short',hairColor:'#8a7a6a',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const docCard=B.stand(S.flipCard(K+'r-docc',1.4,.3,'GÉRARD SAILLANT',INK.white,INK.navy),-1.2,.4,{layer:2,s:0});
  const medics=[[-4.3,1.3,'#d99a6c','bun'],[-.6,1.6,'#7f5138','curly']].map(([x,z,sk,hr],i)=>B.person(K+`r-med${i}`,x as number,z as number,1.5,{shirt:'ger',hair:hr as 'short',skin:sk as string,adult:true,face:'smile',layer:3}));
  const season=B.stand(stamp('r-season',1.5,.4,'MISSED 2000–01'),-2.8,1.95,{layer:3,s:0});
  // Right page: three steps back to the pitch, and the captain's armband.
  const steps=B.stand(stairs('r-stairs',1.8,.9),2.6,-.4,{layer:2});
  const R2=B.person(K+'r-r9b',1.5,.0,1.2,{shirt:'navy',...R9,number:'9',face:'smile',layer:2});
  const zan=B.person(K+'r-zan',4.2,-1.1,1.35,{shirt:'navy',hair:'long',hairColor:'#2a211c',skin:'#f1b88f',face:'smile',layer:1});
  const band=B.stand(S.flipCard(K+'r-band',1.0,.3,'CAPTAIN',INK.yellow,INK.navy),4.2,-.3,{layer:1,s:0});
  const band2=B.stand(S.flipCard(K+'r-band2',1.0,.3,'CAPTAIN',INK.yellow,INK.navy),3.2,1.35,{layer:3,s:0});
  const late=B.stand(S.flipCard(K+'r-late',1.0,.3,'LATE 2001',INK.pink),1.4,1.6,{layer:3,s:0});
  const cup=B.stand(cupTrophy('r-cup',.4,.62),4.5,.9,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`r-h${i}`,.26),-4.3+i*1.3,2.2,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,28.1):b.t;
   sun.dy=.4*beat(t,0,2);cal.s=beat(t,1.8,2.6);months.forEach((m,i)=>{m.flip=-3.1*beat(t,3+i*9,3.8+i*9);});
   H.body.s=beat(t,2.6,3.4);ops.forEach((o,i)=>{o.s=beat(t,5+i*1.2,5.6+i*1.2);});
   // Rehabilitation: bike and weights, slowly.
   bk.s=beat(t,8.6,9.4);db.s=beat(t,9.4,10.2);const ex=wave(t,10,19,.6);H.armL.rot=-.12-1.2*Math.abs(ex);H.armR.rot=.12+1.2*Math.abs(ex);
   surgeon.body.s=beat(t,12.2,13);docCard.s=beat(t,13,13.8);surgeon.armR.rot=.12+1.1*beat(t,14,14.6)-1.1*beat(t,17,17.6);
   medics.forEach((m,i)=>{m.body.s=beat(t,15.6+i*.5,16.4+i*.5);m.armR.rot=.12+1.2*beat(t,17+i*.3,17.6+i*.3)-1.2*beat(t,21,21.6);});
   season.s=beat(t,19.4,20.2)*(1-beat(t,26,27));
   // Zanetti wears the armband while he is away.
   zan.body.s=beat(t,23.4,24.2);band.s=beat(t,24.6,25.4)*(1-beat(t,31.4,32));steps.s=beat(t,26,27);R2.body.s=beat(t,26.6,27.4);
   // Climb the three steps (one tap each).
   const n=manual?act*3:0;const up=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,28.6+i*.9,29.3+i*.9)));const lvl=up[0]+up[1]+up[2];
   R2.body.x=1.5+.6*lvl;R2.body.dy=.3*lvl;R2.body.z=0;
   band2.s=Math.max(beat(t,31,31.8),manual?beat(act,.9,1):0);late.s=beat(t,30.4,31.2);zan.armR.rot=.12+1.6*beat(t,30.6,31.2)*(1-beat(t,33,33.6));
   cheer(R2,Math.max(beat(t,32,32.6)*(1-beat(t,34,34.6)),manual?beat(act,.95,1):0));
   dream.scale=beat(t,34.8,36);dream.visible=dream.scale>.02;dream.dy=.05*wave(t,36,46,.4);cup.s=beat(t,37.6,38.4);
   hearts.forEach((h,i)=>{h.s=beat(t,41+i*.5,41.6+i*.5);});medics.forEach((m,i)=>{if(t>40.7)cheer(m,beat(t,41.2+i*.3,41.8+i*.3));});surgeon.armL.rot=-.12-1.8*beat(t,41.4,42);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,22.8,23.8)+.45*beat(t,23.8,24.8)-.45*beat(t,40.2,41.2):0;
  };
 }};

/* ───────────── 6 · The comeback (yokohama) ───────────── */
const yokohama:SpreadDef={id:'yokohama',rest:20.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);
  k.text('2002 · 8 GOALS',-2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('SOUTH KOREA AND JAPAN',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05);box(k,1.3,Z(-2.0),2.5,1.0,.05);
  k.text('YOKOHAMA',2.5,Z(2.62),.44,INK.pink,{max:4});k.text('BRAZIL 2–0 GERMANY',2.5,Z(2.9),.17,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'y-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.yellow,INK.green,INK.blue,INK.white],2);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'y-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.yellow,INK.white,INK.green,INK.blue],5);lightRig(k,1.1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'y-fw1',.4,INK.yellow),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'y-fw2',.36,INK.green),'R',3.4,.9,{out:.03}),bd.add(S.firework(K+'y-fw3',.38,INK.pink),'L',2.2,1.0,{out:.03})];
  const conf=[bd.add(S.confetti(K+'y-cf1',2.2,1.1,2),'R',.5,1.2,{out:.04}),bd.add(S.confetti(K+'y-cf2',2.2,1.1,4),'R',2.4,1.4,{out:.04})];
  const H=B.person(K+'y-r9',-2.5,.55,1.3,{shirt:'bib',...R9,number:'9',legs:'kick',face:'grin',layer:2});
  const tally=Array.from({length:8},(_,i)=>B.stand(S.ball(K+`y-t${i}`,.09),-4.6+i*.3,1.95,{layer:3,s:0,tab:false}));
  const eight=B.stand(S.flipCard(K+'y-8',1.0,.3,'8 GOALS',INK.yellow,INK.navy),-3.55,1.45,{layer:3,s:0});
  const goalL=B.stand(S.goal(K+'y-goalL',1.5,.8),-2.65,-1.8,{layer:1});void goalL;
  const surgeon=B.person(K+'y-doc',-4.4,-.9,1.5,{shirt:'casual',hair:'short',hairColor:'#8a7a6a',adult:true,skin:'#f1b88f',face:'grin',layer:2});
  const guest=B.stand(S.flipCard(K+'y-guest',1.1,.3,'HIS SURGEON',INK.white,INK.navy),-4.2,-.05,{layer:2,s:0});
  const award=B.stand(lineCard('y-forteam',1.5,.8,['FOR THE','MEDICAL TEAM'],INK.teal,INK.white),-1.35,-1.5,{layer:1,s:0});
  const forTeam=award.flap(lineCard('y-award',1.5,.8,['WORLD PLAYER','OF THE YEAR'],INK.gold),0,.8,{z:.02});
  const medics=[[-2.3,.9,'#d99a6c','bun'],[-.3,.9,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`y-med${i}`,x as number,z as number,1.45,{shirt:'ger',hair:hr as 'short',skin:sk as string,adult:true,face:'smile',layer:3}));
  // Right page: the final.
  const goal=B.stand(S.goal(K+'y-goal',1.7,.85),2.55,-1.8,{layer:1});void goal;
  const keeper=B.person(K+'y-keeper',2.55,-1.35,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const board=B.stand(S.scoreboard(K+'y-board',1.4,1.1,'FINAL'),4.3,-1.6,{layer:1});board.add(S.scoreFlap(K+'y-20',1.15,.46,'BRA','2–0','GER'),0,.3,{z:.012});
  const s10=board.flap(S.scoreFlap(K+'y-10',1.15,.46,'BRA','1–0','GER'),0,.76,{z:.03}),s00=board.flap(S.scoreFlap(K+'y-00',1.15,.46,'BRA','0–0','GER'),0,.76,{z:.036});
  const R2=B.person(K+'y-r9b',1.6,.7,1.3,{shirt:'bib',...R9,number:'9',legs:'kick',face:'grin',layer:3});
  const cupP=B.stand(cupTrophy('y-cup',.45,.72),1.6,.9,{layer:3,s:0,tab:false});
  const ger=[[3.6,.5],[4.3,1.3]].map(([x,z],i)=>B.person(K+`y-ger${i}`,x,z,1.3,{shirt:'ger',hair:i?'short':'bald',skin:'#f1b88f',face:'sad',layer:3}));
  const kind=B.stand(heart('y-kind',.34,INK.red),3.9,1.95,{layer:3,s:0,tab:false});
  const boom=B.stand(pow('y-pow',.26),2.2,-1.3,{layer:2,s:0,tab:false});
  const ball=ballPair(B,'y-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.8):b.t;
   H.body.s=beat(t,1.8,2.6);
   // Eight goals, one by one.
   tally.forEach((g,i)=>{g.s=beat(t,10.9+i*.4,11.3+i*.4);});eight.s=beat(t,13.4,14);
   let bx:number,bz:number,dy=0,vis=true;
   const lshots=[4.6,6.8,9];let shot=-1;lshots.forEach((a,i)=>{if(t>=a&&t<a+.7)shot=i;});
   if(t<14.4){if(shot>=0){const u=(t-lshots[shot])/.7;bx=-2.1-.6*u+.3*shot*u;bz=.65-2.3*u;dy=.25*Math.sin(u*Math.PI);}else{bx=-2.1;bz=.65;}}
   else{const f=manual?20:t;[bx,bz]=track(f,[[14.4,2.0,.8],[15.8,2.0,.8],[16.5,2.9,-1.4],[17.2,2.0,.8],[18.2,2.0,.8],[18.9,2.2,-1.4],[20.4,2.0,.95]]);dy=.25*(pulse(f,15.8,16.5)+pulse(f,18.2,18.9));vis=!(f>20.4);}
   ball(bx,bz,dy,vis&&!(manual));H.leg!.rot=-1*maxOf(lshots.map(a=>pulse(t,a-.3,a+.3)));
   cheer(H,beat(t,10.2,10.8)*(1-beat(t,13,13.6)));
   R2.leg!.rot=-1*maxOf([15.8,18.2].map(a=>pulse(t,a-.3,a+.3)));const sv=pulse(t,16.1,17.4)+pulse(t,18.5,19.8);keeper.body.rot=(t<17.6?-.8:.8)*Math.min(1,sv);
   boom.s=beat(t,16.4,16.7)*(1-beat(t,17.6,17.9))+beat(t,18.8,19.1)*(1-beat(t,20,20.3));
   s00.flip=-3.1*beat(t,16.6,17.2);s10.flip=-3.1*beat(t,19,19.6);
   // Lift the World Cup trophy.
   const lift=Math.max(beat(t,21.2,22.6),manual?beat(act,0,.7):0);cupP.s=lift;cupP.dy=1.35*lift;cheer(R2,Math.max(lift*(1-beat(t,23.6,24.4)),beat(t,39,39.6)));
   fw.forEach((f,i)=>{const a=Math.max(beat(t,21.8+i*.4,22.8+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   conf.forEach((c,i)=>{const on=t>21.6||manual;c.dy=-1.1+1.3*(manual?beat(act,.6,1):beat(t,21.8+i*.4,24+i*.4));c.visible=on;});
   // He comforts the German players.
   ger.forEach((p,i)=>{p.body.s=beat(t,23.4+i*.4,24.2+i*.4);});const walk=beat(t,24.4,26);R2.body.dx=1.35*walk;cupP.dx=1.35*walk;cupP.s*=1-beat(t,24,24.6);
   R2.armR.rot+=1.2*beat(t,26,26.6)*(1-beat(t,31,31.6));kind.s=beat(t,26.6,27.4);ger[0].armL.rot=-.12-1*beat(t,27,27.6);
   surgeon.body.s=beat(t,28.2,29);guest.s=beat(t,29,29.8);cheer(surgeon,beat(t,29.6,30.2)*(1-beat(t,31,31.4))+beat(t,40,40.6));
   award.s=beat(t,31.4,32.2);forTeam.flip=-2.9*beat(t,34,34.8);medics.forEach((m,i)=>{m.body.s=beat(t,35+i*.4,35.8+i*.4);cheer(m,beat(t,36.4+i*.3,37+i*.3)*(1-beat(t,38.2,38.8))+beat(t,40.4+i*.3,41+i*.3));});
   cheer(H,Math.max(beat(t,10.2,10.8)*(1-beat(t,13,13.6)),beat(t,39.4,40)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,14,14.8)+.45*beat(t,14.8,15.6)-.45*beat(t,27.6,28.4)-.3*beat(t,28.4,29.2)+.3*beat(t,38.2,39):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={street,busfare,paris,knee,recovery,yokohama};
void wave;void clamp01;void pulse;
