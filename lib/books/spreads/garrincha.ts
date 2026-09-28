/**
 * The six Garrincha pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/garrincha/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically and gently: a doctor's note, closed gates, a bench on the sidelines, rain clouds that clear.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='garrincha-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const MANE={skin:'#b27650',hair:'short' as const,hairColor:'#231a16'};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function earth(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#d9b98a');k.dots(p,INK.brown,.06,(x,y)=>.14+.1*Math.sin(x*1.7+y*.9));
 for(let i=0;i<18;i++){const x=x0+.3+((i*37)%41)/41*(x1-x0-.6),y=.4+((i*53)%47)/47*5.4;k.fill(ell(x,y,.08,.05),'#b89a6c');}
 for(let i=0;i<20;i++){const x=x0+.2+((i*29)%43)/43*(x1-x0-.4),y=.3+((i*31)%37)/37*5.6;line(k,x,y,x+.04,y-.12,.018,INK.green);line(k,x+.06,y,x+.08,y-.14,.018,INK.green);}}
function cobbles(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#c9bfae');for(let x=x0;x<x1;x+=.34)for(let y=0;y<PAGE_D;y+=.26)k.fill(ell(x+.17+((y/.26)%2)*.12,y+.13,.14,.1),'#b3a894');}
function planks(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#d8b98e');k.dots(p,INK.wood,.05,.25);for(let y=.4;y<PAGE_D;y+=.4)line(k,x0,y,x1,y,.015,'#b8956a');}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function wingPath(k:Kit,x:number){for(let y=.4;y<PAGE_D-1;y+=.35)k.fill(ell(x,y,.05,.1),INK.yellow,.8);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function mountains(k:Kit,w:number,y:number,tone:string,seed=0){const pts:number[][]=[[0,3.2],[0,y+.4]];for(let i=0;i<=8;i++){const x=i/8*w;pts.push([x,y-(i%2?.45+((i*3+seed)%4)*.15:.05)]);}pts.push([w,y+.4],[w,3.2]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);}
function jungle(k:Kit,w:number,y:number){for(let i=0;i<14;i++){const x=.15+i*w/14,r=.18+((i*7)%3)*.05;k.fill(ell(x,y-r*.6,r,r*.8),i%2?INK.leaf:INK.green);k.key(ell(x,y-r*.6,r,r*.8),.008);}}
function roofs(k:Kit,x0:number,n:number,y:number,seed=1){for(let i=0;i<n;i++){const x=x0+i*.36,h=.25+((i*5+seed)%3)*.08,b=rect(x,y-h,.3,h);k.fill(b,i%2?'#f0c89a':'#f6d9a4');k.key(b,.01);k.fill(poly([[x-.03,y-h],[x+.15,y-h-.12],[x+.33,y-h]]),INK.red);}}
function chimneyFactory(k:Kit,x:number,y:number){const b=rect(x,y-.6,1.5,.6);k.fill(b,'#c98a6a');k.key(b,.012);for(let i=0;i<4;i++){const sx=x+i*.375;k.fill(poly([[sx,y-.6],[sx+.375,y-.85],[sx+.375,y-.6]]),'#a86a52');}k.fill(rect(x+1.2,y-1.4,.14,.8),'#a86a52');k.key(rect(x+1.2,y-1.4,.14,.8),.01);}
function stormCloud(key:string,w:number,h:number){return sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
/** A little brown wren with its tail cocked up. */
const wren=(key:string,s:number)=>sp(key,s*1.3,s,k=>{const w=s*1.3;const body=blob([[w*.2,s*.62],[w*.35,s*.38],[w*.62,s*.34],[w*.8,s*.46],[w*.72,s*.72],[w*.42,s*.8]]);k.fill(body,'#9b6a45');k.hatch(body,INK.brown,.03,.6,.008);k.key(body,.012);
 const tail=poly([[w*.24,s*.55],[w*.02,s*.12],[w*.12,s*.08],[w*.32,s*.46]]);k.fill(tail,'#7a4d35');k.key(tail,.01);for(let i=0;i<3;i++)k.key(`M${w*(.08+i*.06)} ${s*(.16+i*.08)} l${w*.05} ${s*.04}`,.008,INK.stock);
 const head=ell(w*.76,s*.36,w*.13,s*.15);k.fill(head,'#9b6a45');k.key(head,.012);k.fill(poly([[w*.88,s*.34],[w,s*.38],[w*.88,s*.4]]),INK.orange);k.circle(w*.8,s*.33,.02,INK.navy,true);k.key(`M${w*.66} ${s*.3} Q${w*.76} ${s*.26} ${w*.86} ${s*.3}`,.008,INK.stock);
 const wing=blob([[w*.38,s*.5],[w*.52,s*.4],[w*.64,s*.5],[w*.5,s*.64]]);k.fill(wing,'#7a4d35');k.hatch(wing,INK.stock,.025,.3,.006);k.key(wing,.01);k.key(`M${w*.5} ${s*.8} L${w*.48} ${s*.95} M${w*.6} ${s*.78} L${w*.62} ${s*.95}`,.012,INK.orange);},{rim:.016});
const wrenCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.15);k.key(b,.014);k.fill(rect(0,h*.78,w,h*.22),INK.brown);k.text('GARRINCHA = WREN',w/2,h*.94,h*.11,INK.white,{max:w*.9,weight:900});
 k.at(w*.15,h*.1,1,()=>{const s=h*.62,ww=s*1.3;const body=blob([[ww*.2,s*.62],[ww*.35,s*.38],[ww*.62,s*.34],[ww*.8,s*.46],[ww*.72,s*.72],[ww*.42,s*.8]]);k.fill(body,'#9b6a45');k.key(body,.012);k.fill(poly([[ww*.24,s*.55],[ww*.02,s*.12],[ww*.12,s*.08],[ww*.32,s*.46]]),'#7a4d35');k.fill(ell(ww*.76,s*.36,ww*.13,s*.15),'#9b6a45');k.circle(ww*.8,s*.33,.02,INK.navy,true);k.fill(poly([[ww*.88,s*.34],[ww,s*.38],[ww*.88,s*.4]]),INK.orange);});},{rim:.018});
const nestTree=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const trunk=poly([[w*.44,h],[w*.46,h*.4],[w*.3,h*.28],[w*.34,h*.26],[w*.5,h*.36],[w*.62,h*.24],[w*.66,h*.27],[w*.55,h*.42],[w*.56,h]]);k.fill(trunk,INK.brown);k.hatch(trunk,INK.navy,.04,.4,.008);k.key(trunk,.012);
 for(const [x,y,r] of [[.3,.2,.2],[.55,.12,.24],[.78,.24,.2],[.45,.3,.18]])k.fill(ell(w*x,h*y,w*r,h*r*.7),INK.leaf),k.dots(ell(w*x,h*y,w*r,h*r*.7),INK.green,.04,.35),k.key(ell(w*x,h*y,w*r,h*r*.7),.01);
 const nest=`M${w*.52} ${h*.44} Q${w*.66} ${h*.52} ${w*.8} ${h*.44} Q${w*.66} ${h*.48} ${w*.52} ${h*.44} Z`;k.fill(`M${w*.52} ${h*.43} Q${w*.66} ${h*.56} ${w*.8} ${h*.43} Z`,'#b8895a');k.key(nest,.012,INK.brown);k.key(`M${w*.54} ${h*.46} L${w*.78} ${h*.45}`,.01,INK.brown);});
const shack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.36,w,h*.64);k.fill(b,'#e9cf9e');for(let x=.08;x<w;x+=.14)k.key(`M${x} ${h*.36} L${x} ${h}`,.008,'#b8956a');k.key(b,.013);const r=poly([[-.06,h*.4],[w*.5,h*.04],[w+.06,h*.4]]);k.fill(r,'#c9774f');k.hatch(r,INK.navy,.05,.5,.008);k.key(r,.013);
 const d=rect(w*.4,h*.62,w*.22,h*.38);k.fill(d,INK.brown);k.key(d,.01);const wn=rect(w*.1,h*.52,w*.2,h*.16);k.fill(wn,INK.yellow);k.key(wn,.01);});
const docNote=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);for(let i=0;i<6;i++)k.key(`M${w*.08} ${h*(.3+i*.1)} L${w*.92} ${h*(.3+i*.1)}`,.006,INK.sky);k.fill(rect(0,0,w,h*.16),INK.teal);k.text('DOCTOR',w/2,h*.12,h*.09,INK.white,{weight:900});
 k.key(`M${w*.36} ${h*.26} Q${w*.26} ${h*.5} ${w*.34} ${h*.74}`,.03,INK.navy);k.key(`M${w*.64} ${h*.26} Q${w*.76} ${h*.5} ${w*.66} ${h*.86}`,.03,INK.navy);k.key(`M${w*.28} ${h*.8} L${w*.72} ${h*.8}`,.01,INK.red);k.text('6 CM',w*.5,h*.94,h*.1,INK.red,{weight:900});},{rim:.016});
const gatePost=(key:string,w:number,h:number,label:string,c:string=INK.navy)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,c);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.yellow,{max:w*.62,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);},{rim:.012});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
const factory=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.32,w,h*.68);k.fill(b,'#d98f6c');for(let r=0;r<5;r++)for(let c=0;c<9;c++)k.key(rect(c*w/9+(r%2)*w/18,h*.34+r*h*.13,w/9,h*.13),.006,'#b56f52');k.key(b,.014);
 for(let i=0;i<4;i++){const x=i*w/4;const t=poly([[x,h*.32],[x+w/4,h*.14],[x+w/4,h*.32]]);k.fill(t,'#a86a52');k.key(t,.012);k.fill(poly([[x+w/4-.02,h*.16],[x+w/4-.02,h*.31],[x+w*.18,h*.31]]),INK.sky2);}
 k.fill(rect(w*.82,0,w*.08,h*.2),'#a86a52');k.key(rect(w*.82,0,w*.08,h*.2),.01);const s=rect(w*.2,h*.4,w*.6,h*.12);k.fill(s,INK.white);k.key(s,.01);k.text('CLOTH FACTORY',w/2,h*.49,h*.08,INK.navy,{max:w*.56,weight:900});
 for(let i=0;i<3;i++){const wn=rect(w*(.1+i*.3),h*.6,w*.18,h*.16);k.fill(wn,INK.yellow);k.key(wn,.01);}});
const spool=(key:string,s:number,c:string)=>sp(key,s*.8,s,k=>{const w=s*.8;k.fill(rect(w*.1,0,w*.8,s*.1),INK.wood);k.fill(rect(w*.1,s*.9,w*.8,s*.1),INK.wood);const th=rect(w*.2,s*.1,w*.6,s*.8);k.fill(th,c);k.hatch(th,INK.navy,.025,.1,.006);k.key(th,.01);k.key(rect(w*.1,0,w*.8,s),.012);},{rim:.012});
const clockFace=(key:string,r:number,label:string)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.white);k.key(ell(r,r,r,r),.02);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${r+Math.sin(a)*r*.78} ${r-Math.cos(a)*r*.78} L${r+Math.sin(a)*r*.9} ${r-Math.cos(a)*r*.9}`,.012);}k.text(label,r,r*1.55,r*.26,INK.navy,{weight:900,max:r*1.4});},{rim:.015});
const hand=(key:string,l:number)=>sp(key,.05,l,k=>{k.fill(rect(0,0,.05,l),INK.navy);},{rim:.008});
const arrowSign=(key:string,w:number,h:number,label:string,c:string,ink:string=INK.white)=>sp(key,w,h,k=>{const p=poly([[0,0],[w*.82,0],[w,h/2],[w*.82,h],[0,h]]);k.fill(p,c);k.dots(p,INK.navy,.03,.15);k.key(p,.013);k.text(label,w*.44,h*.66,h*.4,ink,{max:w*.74,weight:900});},{rim:.014});
const helpBoard=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.16),INK.navy);k.text(title,w/2,h*.12,h*.09,INK.yellow,{max:w*.84,weight:900});});
const portrait=(key:string,w:number,h:number,name:string,skin:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.035,.2);k.key(b,.013);const cx=w/2,cy=h*.4,r=w*.2;k.fill(`M${cx-w*.34} ${h*.8} Q${cx} ${h*.46} ${cx+w*.34} ${h*.8} Z`,INK.white);k.key(`M${cx-w*.34} ${h*.8} Q${cx} ${h*.46} ${cx+w*.34} ${h*.8}`,.01);
 k.fill(ell(cx,cy,r,r*1.12),skin);k.key(ell(cx,cy,r,r*1.12),.012);k.fill(`M${cx-r} ${cy-r*.3} Q${cx} ${cy-r*1.5} ${cx+r} ${cy-r*.3} Q${cx} ${cy-r*.8} ${cx-r} ${cy-r*.3} Z`,'#231a16');k.circle(cx-r*.36,cy,r*.1,INK.navy,true);k.circle(cx+r*.36,cy,r*.1,INK.navy,true);k.key(`M${cx-r*.4} ${cy+r*.45} Q${cx} ${cy+r*.75} ${cx+r*.4} ${cy+r*.45}`,.012);
 k.fill(rect(0,h*.8,w,h*.2),INK.navy);k.text(name,w/2,h*.95,h*.11,INK.white,{max:w*.9,weight:900});},{rim:.016});
const qCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.fill(ell(w/2,h*.46,w*.24,w*.24),INK.white);k.text('?',w/2,h*.56,h*.3,INK.navy,{weight:900});k.text('LIFT',w/2,h*.92,h*.1,INK.white,{weight:900});},{rim:.015});
const newspaper=(key:string,w:number,h:number,head:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.72,w*.08,h*.28),INK.brown);const b=rect(0,0,w,h*.74);k.fill(b,INK.white);k.dots(b,INK.grey,.035,.35);k.key(b,.013);k.fill(rect(0,0,w,h*.14),INK.navy);k.text('NEWS',w/2,h*.11,h*.08,INK.white,{weight:900});
 k.text(head,w/2,h*.3,h*.09,INK.red,{max:w*.88,weight:900});for(let i=0;i<5;i++)k.key(`M${w*.08} ${h*(.4+i*.06)} L${w*(i%2?.6:.9)} ${h*(.4+i*.06)}`,.012,INK.grey);});
const squadBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.sky2);k.key(b,.015);k.fill(rect(0,0,w,h*.18),INK.navy);k.text('1954 SQUAD',w/2,h*.13,h*.1,INK.yellow,{weight:900,max:w*.8});
 for(let r=0;r<2;r++)for(let c=0;c<5;c++){const x=w*(.12+c*.19),y=h*(.36+r*.24);k.fill(ell(x,y,w*.035,w*.035),['#b27650','#f1b88f','#7f5138','#d99a6c'][(r+c)%4]);k.fill(rect(x-w*.05,y+w*.03,w*.1,h*.08),INK.yellow);}});
const drawingTest=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.14),INK.pink);k.text('DRAWING TEST',w/2,h*.11,h*.08,INK.white,{weight:900,max:w*.9});
 const cx=w*.5;k.key(ell(cx,h*.3,w*.12,w*.12),.02);k.key(`M${cx} ${h*.3+w*.12} L${cx} ${h*.66} M${cx-w*.25} ${h*.45} L${cx+w*.25} ${h*.45} M${cx} ${h*.66} L${cx-w*.18} ${h*.9} M${cx} ${h*.66} L${cx+w*.18} ${h*.9}`,.02);},{rim:.016});
const scoreBoard=(key:string,w:number,h:number,title:string)=>S.scoreboard(K+key,w,h,title);
const pitchPanel=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.grass);for(let i=0;i<6;i++)if(i%2)k.fill(rect(0,i*h/6,w,h/6),INK.leaf,.35);k.key(b,.02,INK.white);k.key(`M${w/2} 0 L${w/2} ${h}`,.02,INK.white);k.key(ell(w/2,h/2,h*.18,h*.18),.02,INK.white);},{rim:.014});
const cupTrophy=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cup=`M${w*.12} 0 L${w*.88} 0 Q${w*.86} ${h*.45} ${w*.6} ${h*.55} L${w*.66} ${h*.82} L${w*.34} ${h*.82} L${w*.4} ${h*.55} Q${w*.14} ${h*.45} ${w*.12} 0 Z`;k.fill(cup,INK.gold);k.dots(cup,INK.orange,.03,.35);k.key(cup,.013);const base=rect(w*.22,h*.82,w*.56,h*.18);k.fill(base,INK.green);k.key(base,.012);});
const bannerPoles=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{for(const x of [0,w-.07]){const p=rect(x,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(x,y,.07,.08),INK.green);k.key(p,.008);}
 const b=rect(.1,h*.06,w-.2,h*.46);k.fill(b,INK.yellow);k.dots(b,INK.orange,.035,.2);k.key(b,.014);for(let i=0;i<8;i++){const x=.1+i*(w-.2)/8;k.fill(rect(x,h*.06,(w-.2)/16,h*.06),INK.green);}
 lines.forEach((l,i)=>k.text(l,w/2,h*(.3+i*.16),h*.12,INK.navy,{max:w*.8,weight:900}));});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const wings=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const s of [-1,1]){const cx=w/2;const p=`M${cx} ${h*.6} Q${cx+s*w*.2} ${h*.05} ${cx+s*w*.5} ${h*.1} Q${cx+s*w*.42} ${h*.4} ${cx+s*w*.46} ${h*.5} Q${cx+s*w*.3} ${h*.62} ${cx} ${h*.6} Z`;k.fill(p,INK.white);k.hatch(p,INK.sky,.03,s*.6,.008);k.key(p,.012);}},{rim:.015});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.11){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),Rt=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[Rt,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · The little wren (wren) ───────────── */
const wrenPage:SpreadDef={id:'wren',rest:33.2,
 left:k=>{earth(k,-5,0);footprints(k,-4.4,Z(1.8),-.6,Z(1.3),10,INK.brown);
  k.text('PAU GRANDE',-2.5,Z(2.62),.46,INK.brown,{max:4});k.text('RIO DE JANEIRO STATE · BRAZIL · 1933',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 right:k=>{earth(k,0,5);
  k.text('GARRINCHA',2.5,Z(2.62),.5,INK.brown,{max:4});k.text('A LITTLE BROWN BIRD · A WREN',2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.5);mountains(k,4.5,1.7,'#86a67c',1);chimneyFactory(k,2.6,2.3);jungle(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#d9b98a');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);mountains(k,4.5,1.8,'#93b287',4);jungle(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#d9b98a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'w-sun',.34),'L',3.7,1.7,{out:.012}),cloud=bd.add(S.cloud(K+'w-cloud',1.0,.45),'R',2.6,2.6);
  const rain=bd.add(stormCloud('w-rain',1.2,.6),'L',1.2,1.7,{out:.03});
  const home=B.stand(shack('w-home',1.4,1.25),-3.9,-1.55,{layer:1});B.stand(S.tree(K+'w-palm',.8,1.6,'palm'),-2.6,-1.9,{layer:1});
  const c33=B.stand(S.flipCard(K+'w-1933',.9,.36,'1933',INK.pink),-1.2,-1.5,{layer:1,s:0});
  const mum=B.person(K+'w-mum',-4.5,-.4,1.55,{shirt:'coach',hair:'bun',hairColor:'#231a16',adult:true,skin:'#b27650',face:'smile',layer:2});
  const sibs=[[-3.8,.1,'curly'],[-3.2,-.2,'bun'],[-4.3,.75,'short'],[-2.5,-.1,'long']].map(([x,z,hr],i)=>B.person(K+`w-sib${i}`,x as number,z as number,.82+(i%2)*.1,{shirt:(['casual','fan','bib','casual'] as const)[i],hair:hr as 'short',hairColor:'#231a16',skin:['#b27650','#a8704a','#7f5138','#b27650'][i],face:'grin',layer:2}));
  const boy=B.person(K+'w-boy',-2.8,.75,.88,{shirt:'casual',...MANE,face:'smile',layer:3});
  const note=B.stand(docNote('w-note',.7,.9),.75,1.0,{layer:3,s:0});
  const doc=B.person(K+'w-doc',1.6,.25,1.65,{shirt:'ger',hair:'short',hairColor:'#8a7a6a',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const sister=B.person(K+'w-sister',-3.7,1.45,.95,{shirt:'fan',hair:'bun',hairColor:'#231a16',skin:'#a8704a',face:'grin',layer:3});
  // Right page: the nest, the wren card and the bird that flies.
  const tree=B.stand(nestTree('w-tree',1.6,1.9),1.5,-1.3,{layer:1});
  const bird=tree.arm(wren('w-bird',.34),1.6*.16,1.9*.55,{z:.03});
  const card=B.stand(wrenCard('w-card',1.2,.8),3.4,-1.6,{layer:1,s:0});
  const flock=[0,1].map(i=>B.stand(wren(`w-fl${i}`,.26),3.6+i*.7,-.4+i*.3,{layer:2,s:0,tab:false}));
  const nameCard=B.stand(S.flipCard(K+'w-name',1.4,.34,'GARRINCHA',INK.brown),3.3,.8,{layer:3,s:0});
  const boy2=B.person(K+'w-boy2',2.3,.9,.95,{shirt:'casual',...MANE,legs:'kick',face:'grin',layer:3});
  const pals=[[4.2,1.4,'#7f5138'],[1.0,1.6,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`w-pal${i}`,x as number,z as number,.9,{shirt:i?'bib':'fan',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`w-h${i}`,.26),-4.2+i*1.4,2.15,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'w-ball',.1),2.7,1.0,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,33.2):b.t;
   sun.dy=.55*beat(t,0,2.4);cloud.dx=-.5*beat(t,0,43);
   c33.s=beat(t,2,2.8);home.s=beat(t,1.6,2.6);mum.body.s=beat(t,4.4,5.2);boy.body.s=beat(t,6,6.8);
   sibs.forEach((p,i)=>{p.body.s=beat(t,11.6+i*.4,12.3+i*.4);p.armR.rot=.12+.8*wave(t,12.4,14,1.2);});
   // Bent legs, one 6 cm shorter: the doctor's note.
   note.s=beat(t,15.8,16.6);const rn=beat(t,20.2,21.4)*(1-beat(t,27,29));rain.scale=rn;rain.visible=rn>.02;
   doc.body.s=beat(t,20.2,21);doc.armR.rot=.12+1.3*beat(t,21.4,22)-1.3*beat(t,24,24.6);doc.body.s*=1-beat(t,27.4,28.4);note.s*=1-beat(t,27.4,28.4);
   boy.body.yaw=-.25*pulse(t,21,25);
   sister.body.s=beat(t,24.6,25.4);sister.armR.rot=.12+1.6*beat(t,26.2,26.8)-1.6*beat(t,29,29.6);
   card.s=beat(t,29.8,30.6);tree.s=beat(t,28.4,29.4);
   // Let the little bird fly: it swings up out of the nest on its paper arm.
   const fly=Math.max(beat(t,33.6,35.2),manual?beat(act,0,.7):0);bird.rot=-1.2*fly;bird.dy=.5*fly;bird.dx=.3*fly;
   flock.forEach((f,i)=>{f.s=Math.max(beat(t,34.6+i*.4,35.3+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);f.dy=.35*f.s+.08*wave(t,35.5,43,.6+i*.2);});
   nameCard.s=Math.max(beat(t,35.6,36.3),manual?beat(act,.7,.9):0);boy2.body.s=Math.max(beat(t,35.8,36.6),manual?beat(act,.75,1):0);ball.s=boy2.body.s;
   ball.x=2.7+.5*wave(t,37,43,.35);boy2.leg!.rot=-.8*Math.abs(wave(t,37,43,.7));
   pals.forEach((p,i)=>{p.body.s=beat(t,37.2+i*.4,38+i*.4);cheer(p,beat(t,39+i*.3,39.6+i*.3));});
   hearts.forEach((h,i)=>{h.s=beat(t,38.4+i*.5,39+i*.5);});cheer(boy,beat(t,38.2,38.8));mum.armR.rot=.12+1.6*beat(t,38.6,39.2);cheer(sister,beat(t,39.4,40));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15,16)-.45*beat(t,24,25)+.45*beat(t,28,29)+.45*beat(t,29,30)-.45*beat(t,37,38):0;
  };
 }};

/* ───────────── 2 · Waiting for a chance (factory) ───────────── */
const factoryPage:SpreadDef={id:'factory',rest:27.8,
 left:k=>{cobbles(k,-5,0);line(k,-1.2,Z(.5),0,Z(.5),.6,'#b3a894');
  k.text('AGE 14',-2.5,Z(2.62),.5,INK.navy,{max:3});k.text('A CLOTH FACTORY AND A LONG WAIT',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);ring(k,0,Z(.1),.9,.05);wingPath(k,4.55);
  k.text('SERRANO',2.4,Z(2.62),.46,INK.navy,{max:3.6});k.text('PETRÓPOLIS · THEN THE RIGHT WING',2.4,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#d4d0dd',INK.navy,y=>.25-y*.05);mountains(k,4.5,1.9,'#8fa68a',2);roofs(k,.2,12,2.35,2);k.fill(rect(0,2.35,4.5,.65),'#c9bfae');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);mountains(k,4.5,1.6,'#93b287',5);crowd(k,4.5,1.75,2.45,[INK.white,INK.sky,INK.yellow],3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'f-sun',.34),'R',3.8,1.8,{out:.012}),rain=bd.add(stormCloud('f-rain',1.2,.6),'L',2.8,1.4,{out:.03});
  const fac=B.stand(factory('f-fac',2.0,1.5),-3.6,-1.6,{layer:1});
  const spools=[INK.pink,INK.sky,INK.yellow].map((c,i)=>B.stand(spool(`f-sp${i}`,.4,c),-4.5+i*.45,-.5,{layer:2,s:0}));
  const boy=B.person(K+'f-boy',-2.6,-.2,1.05,{shirt:'casual',...MANE,face:'smile',layer:2});
  const bench=B.stand(S.bench(K+'f-bench',1.0,.42),-2.9,.95,{layer:2,s:0});
  const coachL=B.person(K+'f-coach',-1.5,.55,1.7,{shirt:'coach',hair:'short',hairColor:'#231a16',adult:true,skin:'#d99a6c',face:'open',layer:3});
  const notYet=B.stand(stamp('f-young',1.1,.34,'TOO YOUNG'),-4.1,1.5,{layer:3,s:0});
  const bigs=[[-4.4,.6],[-3.7,.3]].map(([x,z],i)=>B.person(K+`f-big${i}`,x,z,1.6,{shirt:'navy',hair:i?'bald':'short',skin:i?'#7f5138':'#f1b88f',face:'open',adult:true,layer:2}));
  const clock=B.stand(clockFace('f-clock',.32,'WAITING'),-1.7,-1.2,{layer:1,s:0});const hnd=clock.arm(hand('f-hand',.26),0,.32,{z:.02});
  const gate=B.stand(gatePost('f-gate',1.4,1.5,'PAU GRANDE',INK.brown),-.85,1.1,{layer:3});
  const gl=gate.flap(gateLeaf('f-gl',.54,1.05,INK.navy),-1.4/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('f-gr',.54,1.05,INK.navy),1.4/2-.16,0,{anchor:'br',axis:'y',z:.012});
  // Right page: Serrano in Petrópolis, almost a year, then the right wing.
  const sign=B.stand(S.sign(K+'f-sign',1.3,1.2,'SERRANO',INK.white),1.0,-1.7,{layer:1,s:0});
  const cal=B.stand(scoreBoard('f-cal',1.2,1.0,'ALMOST'),2.6,-1.6,{layer:1,s:0});cal.add(S.flipCard(K+'f-year',.95,.4,'A YEAR',INK.pink),0,.28,{z:.012});
  const months=['MONTH 9','MONTH 6','MONTH 3'].map((m,i)=>cal.flap(S.flipCard(K+`f-mo${i}`,.95,.4,m,i%2?INK.blue:'#3d5da0'),0,.68,{z:.03-i*.005}));
  const G2=B.person(K+'f-g2',1.6,.5,1.1,{shirt:'fan',...MANE,legs:'kick',face:'grin',layer:2});
  const mates=[[2.9,.2,'#d99a6c'],[3.4,1.3,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.1,{shirt:'fan',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:2}));
  const coachR=B.person(K+'f-coachR',1.0,1.5,1.7,{shirt:'coach',hair:'short',hairColor:'#231a16',adult:true,skin:'#d99a6c',face:'smile',layer:3});
  const wing=B.stand(arrowSign('f-wing',1.3,.36,'RIGHT WING',INK.yellow,INK.navy),3.9,-.8,{layer:1,s:0});
  const G3=B.person(K+'f-g3',4.4,1.4,1.15,{shirt:'fan',...MANE,number:'7',legs:'kick',face:'grin',layer:3});
  const ball=ballPair(B,'f-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.8):b.t;
   fac.s=beat(t,1.8,2.8);boy.body.s=beat(t,2.6,3.4);spools.forEach((s,i)=>{s.s=beat(t,3.6+i*.4,4.2+i*.4);});
   // The town team: he waits on the bench.
   bench.s=beat(t,6.4,7.2);const toBench=beat(t,7.2,8.6);boy.body.x=-2.6;boy.body.dx=-.3*toBench;boy.body.dz=1.25*toBench;
   coachL.body.s=beat(t,7.8,8.6)*(1-Math.max(beat(t,29.8,30.4),manual?1:0));coachL.armL.rot=-.12-1.5*beat(t,9.6,10.2)+1.5*beat(t,12,12.6);
   notYet.s=beat(t,12.4,13.1)*(1-beat(t,20.4,21.2));bigs.forEach((p,i)=>{p.body.s=beat(t,14.4+i*.4,15.2+i*.4)*(1-beat(t,19.6,20.4));});
   clock.s=beat(t,17.6,18.4)*(1-beat(t,26,27));hnd.rot=Math.PI*2*1.5*beat(t,18.4,21);
   const rn=beat(t,12,13.4)*(1-beat(t,24,26));rain.scale=rn;rain.visible=rn>.02;
   boy.body.yaw=-.3*pulse(t,18,20.6);boy.body.s=beat(t,2.6,3.4)*(1-beat(t,20.6,21.4));
   // Serrano in Petrópolis.
   sign.s=beat(t,20.8,21.6);G2.body.s=beat(t,21.4,22.2);cal.s=beat(t,23.6,24.4);months.forEach((m,i)=>{m.flip=-3.1*beat(t,24.6+i*.8,25.2+i*.8);});
   mates.forEach((m,i)=>{m.body.s=beat(t,22.4+i*.4,23.2+i*.4);});
   let bx:number,bz:number,dy=0,vis=t>21.6||manual;
   if(manual)[bx,bz]=track(act,[[.5,2.0,.6],[1,4.5,-1.5]]);
   else [bx,bz]=track(t,[[21.6,2.0,.6],[22.6,2.9,.35],[23.4,2.9,.35],[24.2,2.0,.6],[31.6,4.5,1.5],[34.6,4.5,-1.5],[35.4,4.5,-1.5]]);
   dy=.06*Math.abs(Math.sin(t*5))*(t>31.6&&t<34.6?1:0);ball(bx,bz,dy,vis);G2.leg!.rot=-1*maxOf([21.8,24.2].map(a=>pulse(t,a-.3,a+.3)));
   // Swing the factory gate open.
   const open=Math.max(beat(t,28.2,29.6),manual?beat(act,0,.6):0);gl.flip=-1.25*open;gr.flip=1.25*open;gate.s=beat(t,26.4,27.4);
   coachR.body.s=Math.max(beat(t,30.4,31.2),manual?beat(act,.4,.7):0);coachR.armR.rot=.12+1.6*Math.max(beat(t,31.2,31.8),manual?beat(act,.6,.8):0);
   wing.s=Math.max(beat(t,31.6,32.4),manual?beat(act,.6,.9):0);
   G2.body.s*=1-Math.max(beat(t,30.6,31.2),manual?1:0);G3.body.s=Math.max(beat(t,30.8,31.6),manual?beat(act,.5,.8):0);
   const run=manual?beat(act,.6,1):beat(t,31.6,34.6);G3.body.dz=-2.8*run;G3.leg!.rot=-.8*Math.abs(Math.sin(t*6))*(t>31.6&&t<34.6?1:0);
   cheer(G3,Math.max(beat(t,35,35.6),manual?beat(act,.95,1):0));mates.forEach((m,i)=>cheer(m,beat(t,36+i*.3,36.6+i*.3)));cheer(coachR,beat(t,37,37.6));
   sun.dy=.5*beat(t,24,27);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,20.4,21.4)+.45*beat(t,21.4,22.4)-.45*beat(t,27.2,28)-.2*beat(t,28,28.6)+.2*beat(t,30.2,30.8):0;
  };
 }};

/* ───────────── 3 · Two clubs said no (trials) ───────────── */
const trials:SpreadDef={id:'trials',rest:29.2,
 left:k=>{cobbles(k,-5,0);footprints(k,-4.6,Z(1.7),-.4,Z(.9),12,INK.navy);
  k.text('TWO CLUBS SAID NO',-2.5,Z(2.62),.38,INK.red,{max:4.3});k.text('VASCO · SÃO CRISTÓVÃO',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('BOTAFOGO · 1953',2.5,Z(2.62),.4,INK.navy,{max:4.2});k.text('19 JULY 1953 · THREE GOALS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);mountains(k,4.5,1.7,'#86a67c',3);roofs(k,.1,12,2.35,5);k.fill(rect(0,2.35,4.5,.65),'#c9bfae');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.25,2.45,[INK.white,'#2b2b33',INK.white,INK.grey],2);lightRig(k,1.0,.4);lightRig(k,3.5,.35);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'t-sun',.34),'R',3.9,1.7,{out:.012}),rain=bd.add(stormCloud('t-rain',1.2,.6),'L',2.2,1.5,{out:.03});
  const gates=[['VASCO',-4.0],['SÃO CRISTÓVÃO',-2.3]].map(([l,x],i)=>{const g=B.stand(gatePost(`t-gate${i}`,1.4,1.4,l as string,INK.navy),x as number,-1.6,{layer:1,s:0});g.add(gateLeaf(`t-gl${i}`,1.05,.98,INK.navy),0,0,{z:.01});return g;});
  const nos=[0,1].map(i=>B.stand(stamp(`t-no${i}`,.7,.32,'NO'),[-4.0,-2.3][i],-.8,{layer:2,s:0}));
  const G=B.person(K+'t-g',-3.1,.7,1.1,{shirt:'casual',...MANE,face:'shy',layer:2});
  const arati=B.person(K+'t-arati',-1.3,.35,1.7,{shirt:'navy',hair:'short',hairColor:'#231a16',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const aCard=B.stand(S.flipCard(K+'t-arc',.9,.3,'ARATI',INK.white,INK.navy),-1.3,1.25,{layer:3,s:0});
  const bag=B.stand(S.suitcaseProp(K+'t-bag',.4,.34),-2.6,1.4,{layer:3,s:0});
  // Right page: first training, Nílton Santos, the flap and the hat trick.
  const nilton=B.person(K+'t-nilton',2.6,.3,1.5,{shirt:'ger',hair:'short',hairColor:'#231a16',adult:true,skin:'#7f5138',face:'open',layer:2});
  const G2=B.person(K+'t-g2',1.3,.7,1.15,{shirt:'ger',...MANE,number:'7',legs:'kick',face:'grin',layer:3});
  const board=B.stand(helpBoard('t-board',1.4,1.3,'WHO SPOKE UP?'),3.8,-1.3,{layer:1,s:0});
  board.add(portrait('t-nil',.95,.9,'NÍLTON SANTOS','#7f5138'),0,.12,{z:.012});const flap=board.flap(qCover('t-q',.98,.94,INK.pink),0,1.05,{z:.024});
  const goal=B.stand(S.goal(K+'t-goal',1.6,.8),2.5,-1.85,{layer:1});void goal;
  const tally=[0,1,2].map(i=>B.stand(S.ball(K+`t-tl${i}`,.1),.6+i*.34,1.95,{layer:3,s:0,tab:false}));const date=B.stand(S.flipCard(K+'t-date',1.3,.3,'19 JULY 1953',INK.yellow,INK.navy),1.2,1.5,{layer:3,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`t-h${i}`,.3),3.3+i*1.0,1.6,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'t-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,29.2):b.t;
   sun.dy=.5*beat(t,0,2);G.body.s=beat(t,1.8,2.6);arati.body.s=beat(t,3.4,4.2);aCard.s=beat(t,4.2,5);arati.armR.rot=.12+1.3*beat(t,5,5.6)-1.3*beat(t,8,8.6);
   // Two closed gates, two NOs.
   gates.forEach((g,i)=>{g.s=beat(t,9+i*1.8,9.8+i*1.8);});nos.forEach((n,i)=>{n.s=beat(t,10+i*1.8,10.6+i*1.8)*(1-beat(t,21,22));});
   const rn=beat(t,10,11.2)*(1-beat(t,16,18));rain.scale=rn;rain.visible=rn>.02;G.body.yaw=-.3*pulse(t,10,14.4);
   bag.s=beat(t,6,6.6);
   // Training: past Nílton Santos, ball through his legs.
   nilton.body.s=beat(t,14.6,15.4);G2.body.s=beat(t,15,15.8);
   let bx:number,bz:number,dy=0,vis=t>15.6||manual;
   if(t<31.9||manual)[bx,bz]=track(manual?24:t,[[15.6,1.6,.75],[17.6,1.6,.75],[18.8,2.6,.45],[19.6,3.4,.2],[21,3.4,.2],[22,2.0,.7]]);
   else{const shots=[33.2,35,36.6];let s=-1;shots.forEach((a,i)=>{if(t>=a&&t<a+.7)s=i;});if(s>=0){const u=(t-shots[s])/.7;bx=2.0+(s-1)*.3*u;bz=.7-2.4*u;dy=.25*Math.sin(u*Math.PI);}else[bx,bz]=[2.0,.7];}
   ball(bx,bz,dy,vis);
   const dash=beat(t,18.4,20.4);G2.body.dx=1.9*dash*(1-beat(t,21.4,22.6))+.6*beat(t,21.4,22.6);G2.body.dz=-.4*dash*(1-beat(t,21.4,22.6));G2.leg!.rot=-.8*Math.abs(Math.sin(t*6))*(t>18.2&&t<20.6?1:0);
   nilton.body.yaw=.4*pulse(t,18.6,20.6);nilton.armR.rot=.12+1.8*beat(t,25.2,25.8)*(1-beat(t,29,29.6));
   board.s=beat(t,26.4,27.4);const lift=Math.max(beat(t,29.6,31),manual?beat(act,0,.7):0);flap.flip=-2.9*lift;
   cheer(G2,Math.max(beat(t,30.6,31.2)*(1-beat(t,32.4,33)),manual?beat(act,.8,1):0));
   G2.leg!.rot=Math.min(G2.leg!.rot,-1*maxOf([33.2,35,36.6].map(a=>pulse(t,a-.3,a+.3))));
   tally.forEach((g,i)=>{g.s=beat(t,33.6+i*1.7,34+i*1.7);});date.s=beat(t,32.2,33);
   hearts.forEach((h,i)=>{h.s=beat(t,39+i*.6,39.7+i*.6);});cheer(G2,beat(t,39.2,39.8));nilton.armL.rot=-.12-2*beat(t,39.6,40.2);cheer(arati,beat(t,40,40.6));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14,15)+.45*beat(t,15,16)-.45*beat(t,38,39):0;
  };
 }};

/* ───────────── 4 · Left out (leftout) ───────────── */
const leftout:SpreadDef={id:'leftout',rest:18.1,
 left:k=>{pitch(k,-5,0,'#9bbf7c','#6f9d62');for(let i=0;i<5;i++)k.fill(ell(-4.2+i*.8,Z(1.3+(i%2)*.3),.08,.05),INK.orange);
  k.text('1954',-2.5,Z(2.62),.52,INK.navy,{max:3});k.text('NOT PICKED FOR THE WORLD CUP',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('1957',2.5,Z(2.62),.52,INK.navy,{max:3});k.text('20 GOALS IN 26 GAMES · CAMPEONATO CARIOCA',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.05);crowd(k,4.5,1.4,2.45,[INK.grey,INK.white,INK.sky],1);k.fill(rect(0,2.45,4.5,.55),'#9bbf7c');}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.2,2.45,[INK.white,'#2b2b33',INK.white,INK.yellow],4);lightRig(k,1.0,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('l-rain',1.3,.65),'L',2.0,1.5,{out:.03}),sun=bd.add(S.sun(K+'l-sun',.34),'R',3.9,1.8,{out:.012});
  const conf=bd.add(S.confetti(K+'l-conf',2.2,1.1,3),'R',1.2,1.3,{out:.04});
  const news=B.stand(newspaper('l-news',1.0,1.3,'TOO MUCH DRIBBLING?'),-4.1,-1.2,{layer:1,s:0});
  const squad=B.stand(squadBoard('l-squad',1.8,1.3),-1.6,-1.6,{layer:1,s:0});
  const G=B.person(K+'l-g',-2.9,.3,1.2,{shirt:'ger',...MANE,number:'7',legs:'kick',face:'shy',layer:2});
  const cones=[0,1,2,3].map(i=>B.stand(S.cone(K+`l-cone${i}`,.28),-2.2+i*.5,1.25+(i%2)*.3,{layer:3,s:0}));
  const own=B.stand(S.flipCard(K+'l-own',1.3,.32,'HIS OWN WAY',INK.yellow,INK.navy),-1.3,1.9,{layer:3,s:0});
  // Right page: flip the scoreboard, the Carioca title and the call to Sweden.
  const board=B.stand(scoreBoard('l-board',1.5,1.2,'BOTAFOGO 1957'),1.1,-1.5,{layer:1});
  board.add(lineCard('l-20',1.25,.6,['20 GOALS','IN 26 GAMES'],INK.yellow),0,.34,{z:.012});const cover=board.flap(lineCard('l-q',1.25,.6,['?'],INK.white),0,.94,{z:.03});
  const G2=B.person(K+'l-g2',2.4,.6,1.25,{shirt:'ger',...MANE,number:'7',legs:'kick',face:'grin',layer:2});
  const goal=B.stand(S.goal(K+'l-goal',1.5,.8),3.2,-1.85,{layer:1});void goal;
  const cup=B.stand(cupTrophy('l-cup',.5,.8),4.4,-.6,{layer:2,s:0});const car=B.stand(S.flipCard(K+'l-car',1.2,.3,'CARIOCA 1957',INK.white,INK.navy),4.3,.15,{layer:2,s:0});
  const mates=[[3.6,1.2,'#7f5138'],[1.3,1.4,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`l-m${i}`,x as number,z as number,1.2,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const call=B.stand(lineCard('l-call',1.5,.6,['PICKED FOR','SWEDEN 1958'],INK.pink,INK.white),4.0,1.8,{layer:3,s:0});
  const ball=ballPair(B,'l-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.1):b.t;
   news.s=beat(t,2,2.8)*(1-beat(t,14,15));G.body.s=beat(t,1.8,2.6);
   // The squad is picked without him.
   squad.s=beat(t,7.6,8.4);G.body.yaw=-.35*pulse(t,8.4,14);const rn=beat(t,9,10.2)*(1-beat(t,16,18));rain.scale=rn;rain.visible=rn>.02;
   // He keeps playing his own way: weaving the cones.
   cones.forEach((c,i)=>{c.s=beat(t,14.6+i*.2,15+i*.2);});own.s=beat(t,15.6,16.3);
   let bx:number,bz:number,dy=0;
   if(t<20.1&&!manual){const u=beat(t,15,18);bx=-2.6+2.3*u;bz=1.4+.25*Math.sin(u*Math.PI*4);G.body.dx=2.2*u;G.body.dz=.6*u;}else{bx=2.8;bz=.7;G.body.dx=2.2;G.body.dz=.6;}
   G.leg!.rot=-.7*Math.abs(Math.sin(t*6))*(t>15&&t<18?1:0);
   // Flip the scoreboard.
   const flip=Math.max(beat(t,18.6,19.6),manual?beat(act,0,.6):0);cover.flip=-3.1*flip;
   G2.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.4,.7):0);
   if(t>=20.1||manual){const shots=[21,23.2,25.4];let s=-1;const tt=manual?25.4+act*.6:t;shots.forEach((a,i)=>{if(tt>=a&&tt<a+.7)s=i;});if(s>=0){const u=(tt-shots[s])/.7;bx=2.8+.3*(s-1)*u;bz=.7-2.5*u;dy=.25*Math.sin(u*Math.PI);}
    G2.leg!.rot=-1*maxOf(shots.map(a=>pulse(tt,a-.3,a+.3)));}
   ball(bx,bz,dy,t>14.8||manual);
   cup.s=beat(t,26.4,27.2);car.s=beat(t,27.2,28);mates.forEach((m,i)=>{m.body.s=beat(t,25.6+i*.4,26.4+i*.4);cheer(m,beat(t,27.6+i*.3,28.2+i*.3));});cheer(G2,Math.max(beat(t,27.4,28),manual?beat(act,.8,1):0));
   conf.visible=t>27||manual;conf.dy=-1.1+1.3*(manual?beat(act,.8,1):beat(t,27.4,29.8));
   call.s=beat(t,31,31.8);sun.dy=.5*beat(t,18,21);cheer(G,beat(t,33,33.6));
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,17.6,18.6)+.45*beat(t,18.6,19.6)-.45*beat(t,36,37):0;
  };
 }};

/* ───────────── 5 · A test and a chance (sweden) ───────────── */
const sweden:SpreadDef={id:'sweden',rest:30.4,
 left:k=>{planks(k,-5,0);
  k.text('A DRAWING TEST',-2.5,Z(2.62),.42,INK.pink,{max:4});k.text('1958 · LEFT OUT OF TWO MATCHES',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);
  k.text('SWEDEN · 1958',2.5,Z(2.62),.42,INK.navy,{max:4});k.text('THE BEST THREE MINUTES',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f1e4c8');k.dots(p,INK.orange,.05,.12);for(let i=0;i<2;i++){const w=rect(.6+i*2.1,.6,1.2,1.0);k.fill(w,INK.sky2);k.key(w,.012);k.key(`M${1.2+i*2.1} .6 L${1.2+i*2.1} 1.6`,.012);}const bb=rect(1.6,.4,1.2,.8);k.fill(bb,'#2f5d4a');k.key(bb,.014);k.fill(rect(0,2.2,4.5,.8),'#d8b98e');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.25,2.45,[INK.yellow,INK.blue,INK.white,INK.yellow],5);lightRig(k,1.0,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('s-rain',1.2,.6),'L',3.0,1.9,{out:.03}),sun=bd.add(S.sun(K+'s-sun',.34),'R',3.9,1.8,{out:.012});
  const conf=bd.add(S.confetti(K+'s-conf',2.2,1.1,5),'R',1.0,1.3,{out:.04});
  const desk=B.stand(S.bench(K+'s-desk',1.2,.5),-3.0,-1.0,{layer:1});void desk;
  const test=B.stand(drawingTest('s-test',.8,1.0),-3.0,-.85,{layer:1,s:0});
  const psy=B.person(K+'s-psy',-4.3,-.7,1.65,{shirt:'coach',hair:'bald',adult:true,skin:'#f1b88f',face:'open',layer:2,beard:true});
  const G=B.person(K+'s-g',-1.9,-.1,1.2,{shirt:'bib',...MANE,face:'smile',layer:2});
  const low=B.stand(stamp('s-low',1.0,.34,'LOW SCORE'),-3.9,.8,{layer:3,s:0});const mis=B.stand(stamp('s-mis',1.3,.34,'A MISTAKE?',INK.navy),-2.6,1.35,{layer:3,s:0});
  const bench=B.stand(S.bench(K+'s-bench',1.1,.45),-1.3,1.25,{layer:3,s:0});
  const ticks=[['MATCH 1',-4.2],['MATCH 2',-3.1]].map(([l,x],i)=>B.stand(S.flipCard(K+`s-mt${i}`,.9,.3,l as string,INK.grey,INK.navy),x as number,1.95,{layer:3,s:0}));
  // Right page: match three, the best three minutes, then the pitch unfolds to the final.
  const G2=B.person(K+'s-g2',1.3,.1,1.25,{shirt:'bib',...MANE,legs:'kick',face:'grin',layer:2});
  const opp=[[2.6,-.5],[3.4,.1]].map(([x,z],i)=>B.person(K+`s-o${i}`,x,z,1.3,{shirt:'casual',hair:i?'short':'bald',skin:'#f1b88f',face:'open',layer:2}));
  const goal=B.stand(S.goal(K+'s-goal',1.6,.8),2.5,-1.85,{layer:1});void goal;
  const clock=B.stand(clockFace('s-clock',.34,'3 MIN'),4.4,-1.4,{layer:1,s:0});const hnd=clock.arm(hand('s-hand',.28),0,.34,{z:.02});
  const best=B.stand(S.flipCard(K+'s-best',1.6,.32,'BEST THREE MINUTES',INK.yellow,INK.navy),4.0,-.55,{layer:1,s:0});
  const deckL=B.flat(pitchPanel('s-deckL',1.3,1.4),.35,1.75,{edge:'left',hinge:-1.5}),deckR=B.flat(pitchPanel('s-deckR',1.3,1.4),2.95,1.75,{edge:'right',hinge:1.5});
  const champs=B.stand(lineCard('s-champ',1.7,.6,['FIRST WORLD CUP','1958'],INK.gold),3.6,1.0,{layer:3,s:0});const cup=B.stand(cupTrophy('s-cup',.42,.66),4.6,1.8,{layer:3,s:0});
  const mate=B.person(K+'s-vava',3.2,1.8,1.25,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'grin',layer:3});
  const boom=B.stand(pow('s-pow',.24),2.2,-1.35,{layer:2,s:0,tab:false});
  const ball=ballPair(B,'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,30.4):b.t;
   psy.body.s=beat(t,2.4,3.2);test.s=beat(t,4.6,5.4);G.body.s=beat(t,3.2,4);G.armR.rot=.12+1.2*wave(t,5.6,8.4,.8);
   low.s=beat(t,9.6,10.3)*(1-beat(t,19.4,20.2));mis.s=beat(t,11.6,12.3)*(1-beat(t,19.4,20.2));psy.armR.rot=.12+1.4*beat(t,11.8,12.4)-1.4*beat(t,14.4,15);
   const rn=beat(t,9.6,10.8)*(1-beat(t,19,21));rain.scale=rn;rain.visible=rn>.02;
   // Left out: to the bench for matches one and two.
   bench.s=beat(t,15,15.8);const sit=beat(t,15.6,17);G.body.dx=.6*sit;G.body.dz=1.45*sit;G.body.yaw=-.3*pulse(t,15.6,19.4);
   ticks.forEach((c,i)=>{c.s=beat(t,16.6+i*.9,17.2+i*.9);});G.body.s*=1-beat(t,19.2,20);
   // Match three: he finally plays.
   G2.body.s=beat(t,19.4,20.2);opp.forEach((o,i)=>{o.body.s=beat(t,20+i*.3,20.8+i*.3);});
   clock.s=beat(t,24.2,25);hnd.rot=Math.PI*2*.05*beat(t,25,29.6);best.s=beat(t,27.4,28.2);
   let bx:number,bz:number,dy=0;
   if(t<30.4&&!manual)[bx,bz]=track(t,[[20,1.7,.25],[22.4,1.7,.25],[23.4,2.9,.4],[24.4,3.8,-.4],[25.2,3.2,-1.5],[26,1.7,.25],[27,2.9,-1.1],[27.8,1.7,.25]]);else[bx,bz]=[1.7,.25];
   const drb=beat(t,22.4,24.4)*(1-beat(t,25.2,26));G2.body.dx=2.0*drb;G2.body.dz=-.2*drb;G2.leg!.rot=-.8*Math.abs(Math.sin(t*6))*(t>22.4&&t<24.4?1:0)-1*pulse(t,24.2,24.8);
   opp.forEach((o,i)=>{o.body.rot=(i?-.3:.3)*pulse(t,22.8+i*.6,24+i*.6);});
   // Unfold the pitch: two panels lie down, then two crosses and the final.
   const unfold=Math.max(beat(t,30.8,32.4),manual?beat(act,0,.6):0);deckL.s=unfold;deckR.s=unfold;
   if(t>=32.5||manual){const shots=[33.2,35.2];const tt=manual?33.2+act*.7:t;let s=-1;shots.forEach((a,i)=>{if(tt>=a&&tt<a+.7)s=i;});if(s>=0){const u=(tt-shots[s])/.7;bx=1.7+.2*s*u;bz=.25-1.6*u;dy=.3*Math.sin(u*Math.PI);}}
   ball(bx,bz,dy,t>20||manual);boom.s=Math.max(pulse(t,33.8,34.6),pulse(t,35.8,36.6),manual?pulse(act,.6,1):0);
   mate.body.s=Math.max(beat(t,32.8,33.6),manual?beat(act,.5,.8):0);champs.s=beat(t,36.4,37.2);cup.s=beat(t,37,37.8);
   const joy=Math.max(beat(t,36.2,36.8),manual?beat(act,.9,1):0);cheer(G2,joy);cheer(mate,joy);opp.forEach(o=>{o.body.s*=1-beat(t,32.6,33.4);});
   conf.visible=t>36||manual;conf.dy=-1.1+1.3*(manual?beat(act,.8,1):beat(t,36.4,38.6));sun.dy=.5*beat(t,19.4,22);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,19,20)+.45*beat(t,20,21)-.45*beat(t,38,39):0;
  };
 }};

/* ───────────── 6 · The Joy of the People (chile) ───────────── */
const chile:SpreadDef={id:'chile',rest:26.7,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);
  k.text('CHILE · 1962',-2.5,Z(2.62),.44,INK.yellow,{max:4});k.text('BRAZIL 3–1 CZECHOSLOVAKIA',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);wingPath(k,4.5);
  k.text('JOY OF THE PEOPLE',2.5,Z(2.62),.36,INK.yellow,{max:4.3});k.text('THE BENT-LEGGED ANGEL',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.4-y/3*.4);mountains(k,4.5,1.3,'#a9a3c0',6);crowd(k,4.5,1.5,2.6,[INK.yellow,INK.blue,INK.white,INK.red],1);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.4-y/3*.4);mountains(k,4.5,1.25,'#a9a3c0',2);crowd(k,4.5,1.5,2.6,[INK.yellow,INK.green,INK.blue,INK.white],6);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'c-fw1',.4,INK.yellow),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'c-fw2',.36,INK.green),'R',3.5,.8,{out:.03}),bd.add(S.firework(K+'c-fw3',.36,INK.pink),'L',3.2,.9,{out:.03})];
  const conf=bd.add(S.confetti(K+'c-conf',2.4,1.1,2),'R',1.0,1.2,{out:.04});
  const pele=B.person(K+'c-pele',-3.6,.2,1.2,{shirt:'bib',hair:'short',hairColor:'#231a16',skin:'#7f5138',number:'10',face:'smile',layer:2});
  const bench=B.stand(S.bench(K+'c-bench',1.0,.42),-4.3,1.2,{layer:3,s:0});
  const hurt=B.stand(S.flipCard(K+'c-hurt',.9,.3,'INJURED',INK.blue),-4.3,1.95,{layer:3,s:0});
  const G=B.person(K+'c-g',-2.2,.6,1.3,{shirt:'bib',...MANE,legs:'kick',face:'grin',layer:2});
  const lead=B.stand(S.flipCard(K+'c-lead',1.2,.3,'STEPPED UP',INK.yellow,INK.navy),-1.0,1.4,{layer:3,s:0});
  const goal=B.stand(S.goal(K+'c-goal',1.6,.85),-2.65,-1.8,{layer:1});void goal;
  const tally=[0,1,2,3].map(i=>B.stand(S.ball(K+`c-tl${i}`,.09),-2.5+i*.3,1.95,{layer:3,s:0,tab:false}));
  const eng=B.stand(S.flipCard(K+'c-eng',1.0,.28,'ENGLAND 2',INK.white,INK.navy),-.9,-.6,{layer:2,s:0}),chi=B.stand(S.flipCard(K+'c-chi',1.0,.28,'CHILE 2',INK.red),-.9,-.1,{layer:2,s:0});
  const board=B.stand(scoreBoard('c-board',1.4,1.15,'FINAL 1962'),4.2,-1.7,{layer:1,s:0});board.add(S.scoreFlap(K+'c-31',1.15,.48,'BRA','3–1','TCH'),0,.32,{z:.012});
  const s00=board.flap(S.scoreFlap(K+'c-00',1.15,.48,'BRA','0–0','TCH'),0,.8,{z:.03});
  const gb=B.stand(S.goldenBall(K+'c-gb',.26),.8,-.9,{layer:2,s:0});const gbc=B.stand(S.flipCard(K+'c-gbc',1.2,.28,'BEST PLAYER',INK.gold,INK.navy),.9,-.3,{layer:2,s:0});
  // Right page: raise the banner, the angel, and the dribble down the wing.
  const banner=B.stand(bannerPoles('c-banner',2.6,1.45,['JOY OF THE','PEOPLE']),2.1,-1.75,{layer:1,s:0});
  const angel=B.stand(wings('c-wings',1.4,.6),2.6,-.75,{layer:2,s:0});const angelC=B.stand(S.flipCard(K+'c-angel',1.6,.3,'BENT-LEGGED ANGEL',INK.white,INK.navy),2.6,-.15,{layer:2,s:0});
  const birdP=B.stand(wren('c-wren',.3),3.4,-1.2,{layer:2,s:0,tab:false});
  const fans=[[.7,1.8,'coach','long'],[1.5,1.5,'fan','short'],[2.4,1.9,'casual','curly'],[3.3,1.7,'bib','bun']].map(([x,z,sh,hr],i)=>B.person(K+`c-fan${i}`,x as number,z as number,i%2?1.35:1.15,{shirt:sh as 'fan',hair:hr as 'short',skin:['#f1b88f','#d99a6c','#b27650','#7f5138'][i],face:'grin',adult:i%2===1,layer:3}));
  const G2=B.person(K+'c-g2',4.4,1.2,1.3,{shirt:'bib',...MANE,legs:'kick',face:'grin',layer:3});
  const defs=[[4.0,.3],[4.6,-.4],[4.1,-1.1]].map(([x,z],i)=>B.person(K+`c-d${i}`,x,z,1.25,{shirt:'ger',hair:(['short','bald','curly'] as const)[i],skin:'#f1b88f',face:'open',layer:2}));
  const ball=ballPair(B,'c-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.7):b.t;
   // Pelé is injured after the second match and rests on the bench.
   pele.body.s=beat(t,2.6,3.4);bench.s=beat(t,5.6,6.4);const rest=beat(t,6.4,8);pele.body.dx=-.7*rest;pele.body.dz=1.0*rest;hurt.s=beat(t,7,7.7);pele.armR.rot=.12+1.4*beat(t,10,10.6)*(1-beat(t,12,12.6));
   // Garrincha steps up.
   G.body.s=beat(t,8.8,9.6);G.body.dz=-.4*beat(t,9.4,11);lead.s=beat(t,10,10.7)*(1-beat(t,22,23));
   let bx:number,bz:number,dy=0;const shots=[12.8,14,15.2,16.4];let s=-1;shots.forEach((a,i)=>{if(t>=a&&t<a+.7)s=i;});
   if(t<26.7&&!manual){if(s>=0){const u=(t-shots[s])/.7;bx=-1.9+(s-1.5)*.25*u;bz=.25-2.0*u;dy=.25*Math.sin(u*Math.PI);}else{bx=-1.9;bz=.25;}}
   else{const f=manual?33.6+act*5:t;[bx,bz]=track(f,[[27,4.35,1.3],[33.6,4.35,1.3],[34.8,4.4,.1],[36,4.3,-.7],[37.4,3.4,-1.6]]);dy=0;}
   ball(bx,bz,dy,t>9||manual);G.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   tally.forEach((g,i)=>{g.s=beat(t,13.2+i*1.2,13.6+i*1.2);});eng.s=beat(t,14.2,14.9);chi.s=beat(t,16.4,17.1);
   board.s=beat(t,17.4,18.2);s00.flip=-3.1*beat(t,19.8,20.4);cheer(G,beat(t,20.4,21)*(1-beat(t,22.4,23)));
   gb.s=beat(t,23.2,24);gbc.s=beat(t,24,24.8);cheer(pele,beat(t,24.4,25));
   // Raise the banner.
   const raise=Math.max(beat(t,27.2,28.6),manual?beat(act,0,.7):0);banner.s=raise;
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,26+i*.25,26.7+i*.25),manual?1:0);const w=Math.max(beat(t,28.8+i*.2,29.4+i*.2),manual?beat(act,.6,.9):0);cheer(f,w,.25*wave(t,29.4,43,1.2+i*.1));});
   angel.s=beat(t,30.8,31.6);angelC.s=beat(t,31.4,32.2);birdP.s=beat(t,31,31.6);birdP.dy=.6*beat(t,31.6,34)+.1*wave(t,34,43,.5);birdP.dx=-.8*beat(t,31.6,34);
   // The boy with bent legs dribbles past three defenders.
   G2.body.s=Math.max(beat(t,33,33.8),manual?beat(act,.4,.7):0);defs.forEach((d,i)=>{d.body.s=Math.max(beat(t,33.2+i*.2,34+i*.2),manual?beat(act,.5,.8):0);d.body.rot=(i%2?.3:-.3)*pulse(manual?34+act*4:t,34.6+i*1.1,35.8+i*1.1);});
   const run=manual?beat(act,.6,1):beat(t,33.8,37.4);G2.body.dz=-2.8*run;G2.body.dx=-.9*run;G2.leg!.rot=-.8*Math.abs(Math.sin(t*6))*(t>33.8&&t<37.4?1:0);
   cheer(G2,Math.max(beat(t,38.4,39),manual?beat(act,.95,1):0));
   fw.forEach((f,i)=>{const a=Math.max(beat(t,28.4+i*.5,29.4+i*.5),manual?beat(act,.7+i*.08,.85+i*.08):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   conf.visible=t>38.5||manual;conf.dy=-1.1+1.3*(manual?beat(act,.8,1):beat(t,38.7,41));cheer(G,Math.max(beat(t,20.4,21)*(1-beat(t,22.4,23)),beat(t,39.4,40)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,17,17.8)+.45*beat(t,17.8,18.6)-.45*beat(t,38.4,39.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={wren:wrenPage,factory:factoryPage,trials,leftout,sweden,chile};
void clamp01;void pulse;
