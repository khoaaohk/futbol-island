/**
 * The six Alphonso Davies pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/davies/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically and gently: dark clouds over a city, a long walk of paper footprints, a tent lit by a lamp,
 * question marks and jumbled letters for a new language, a closed gate that opens.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='davies-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const PHONZIE={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1512'};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function sand(k:Kit,x0:number,x1:number,tone='#e3c48f'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,INK.orange,.06,(x,y)=>.12+.08*Math.sin(x*1.9+y*.7));}
function asphalt(k:Kit,x0:number,x1:number,tone='#9a9aa2'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,'#5d5f6c',.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function schoolyard(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#b9c3cf');k.dots(p,INK.navy,.05,.12);for(let i=0;i<5;i++)box(k,x0+.4+i*.55,Z(1.5),.45,.45,.03,INK.yellow);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.5,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function skyline(k:Kit,w:number,y:number,cs=['#8f95ad','#a3a8bd','#7e849e']){for(let i=0;i<11;i++){const x=i*w/11,h=.4+((i*7)%5)*.14,b=rect(x,y-h,w/11-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.06,.06),INK.yellow,.7);}}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}
function peaks(k:Kit,w:number,y:number,tone:string,snow=true,seed=0){const pts:number[][]=[[0,y+.6]];for(let i=0;i<=8;i++){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);pts.push([x,i%2?top:y+.15]);}pts.push([w,y+.6],[w,3.2],[0,3.2]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);
 if(snow)for(let i=1;i<=8;i+=2){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);k.fill(poly([[x,top],[x+.12,top+.16],[x+.04,top+.12],[x-.04,top+.18],[x-.12,top+.16]]),INK.white);}}
function pines(k:Kit,w:number,y:number){for(let i=0;i<16;i++){const x=.12+i*w/16,h=.3+((i*5)%3)*.08;const p=poly([[x-.1,y],[x,y-h],[x+.1,y]]);k.fill(p,i%2?INK.green:'#2f7a55');k.key(p,.008);}}
function palms(k:Kit,w:number,y:number){for(let i=0;i<6;i++){const x=.3+i*w/6;k.key(`M${x} ${y} Q${x+.05} ${y-.3} ${x+.02} ${y-.55}`,.03,INK.brown);for(let j=0;j<5;j++){const a=-Math.PI+j*Math.PI/4;k.key(`M${x+.02} ${y-.55} Q${x+.02+Math.cos(a)*.12} ${y-.6+Math.sin(a)*.1} ${x+.02+Math.cos(a)*.22} ${y-.5+Math.sin(a)*.12}`,.025,INK.green);}}}
function stormCloud(key:string,w:number,h:number){return sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#7d8298');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const tent=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const p=poly([[0,h],[w*.5,0],[w,h]]);k.fill(p,c);k.hatch(p,INK.navy,.05,.2,.008);k.key(p,.014);k.key(`M${w*.5} 0 L${w*.5} ${h}`,.012);const d=poly([[w*.34,h],[w*.5,h*.42],[w*.66,h]]);k.fill(d,'#3b3550');k.key(d,.012);});
/** The lit inside of a tent door (sits behind the door flap). */
const tentGlow=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=poly([[0,h],[w*.5,0],[w,h]]);k.fill(d,INK.yellow);k.dots(d,INK.orange,.03,.35);k.key(d,.012);k.fill(ell(w*.5,h*.66,w*.12,h*.12),INK.white);k.fill(rect(w*.46,h*.74,w*.08,h*.18),INK.brown);},{rim:.01});
const tentDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=poly([[0,h],[w*.5,0],[w,h]]);k.fill(d,'#3b3550');k.hatch(d,INK.navy,.03,.6,.008);k.key(d,.012);},{rim:.01});
const halo=(key:string,r:number)=>sp(key,r*2,r*2,k=>{for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.fill(poly([[r+Math.cos(a-.1)*r*.5,r+Math.sin(a-.1)*r*.5],[r+Math.cos(a)*r,r+Math.sin(a)*r],[r+Math.cos(a+.1)*r*.5,r+Math.sin(a+.1)*r*.5]]),INK.yellow);}k.fill(ell(r,r,r*.5,r*.5),INK.yellow,.9);k.dots(ell(r,r,r*.5,r*.5),INK.orange,.03,.3);},{rim:.012});
const walkers=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=Math.round(w/.2);for(let i=0;i<n;i++){const x=.1+i*.2,s=h*(.7+((i*7)%3)*.1),y=h;k.fill(ell(x,y-s*.86,s*.1,s*.1),'#5b4a44');k.fill(poly([[x-s*.12,y-s*.72],[x+s*.12,y-s*.72],[x+s*.1,y-s*.3],[x-s*.1,y-s*.3]]),[INK.pink,INK.sky,INK.yellow,INK.orange,INK.teal][i%5]);k.fill(rect(x-s*.08,y-s*.3,s*.06,s*.3),'#5b4a44');k.fill(rect(x+s*.02,y-s*.3,s*.06,s*.3),'#5b4a44');if(i%3===0)k.fill(rect(x+s*.12,y-s*.5,s*.14,s*.14),INK.brown);}},{rim:.012});
const cityBlock=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=['#e7cfa4','#f0b9a0','#bfd6c9'];for(let i=0;i<3;i++){const bw=w/3,x=i*bw,bh=h*(.6+(i%2)*.4),b=rect(x,h-bh,bw-.03,bh);k.fill(b,cs[i]);k.key(b,.012);for(let r=0;r<Math.floor(bh/.2)-1;r++)for(let c=0;c<2;c++)k.fill(rect(x+.06+c*bw*.45,h-bh+.08+r*.2,bw*.28,.1),INK.sky);}});
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.28,w,h*.72);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const roof=poly([[-.05,h*.3],[w/2,h*.06],[w+.05,h*.3]]);k.fill(roof,INK.red);k.key(roof,.014);
 const s=rect(w*.12,h*.33,w*.76,h*.12);k.fill(s,INK.white);k.key(s,.01);k.text('SCHOOL',w/2,h*.42,h*.08,INK.navy,{max:w*.6,weight:900});
 for(let i=0;i<2;i++){const wx=w*(.08+i*.66);k.fill(rect(wx,h*.5,w*.2,h*.16),INK.sky);k.key(rect(wx,h*.5,w*.2,h*.16),.01);}
 const inside=rect(w*.32,h*.52,w*.36,h*.48);k.fill(inside,INK.yellow);k.dots(inside,INK.orange,.03,.3);k.key(inside,.012);k.text('ABC',w/2,h*.7,h*.1,INK.navy,{weight:900});for(let i=0;i<3;i++){const x=w*(.38+i*.12);k.fill(ell(x,h*.85,.04,.04),['#7f5138','#f1b88f','#d99a6c'][i]);k.fill(rect(x-.05,h*.88,.1,.1),[INK.pink,INK.sky,INK.green][i]);}});
const schoolDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.blue);k.dots(b,INK.navy,.03,.25);k.key(b,.013);k.key(rect(w*.15,h*.08,w*.7,h*.4),.01,INK.white);k.circle(w*.82,h*.55,.025,INK.gold);},{rim:.012});
const bubble=(key:string,w:number,h:number,text:string,c:string=INK.white)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.36} ${h*.74} L${w*.2} ${h} L${w*.24} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,c);k.dots(p,INK.sky,.035,.15);k.key(p,.013);k.text(text,w/2,h*.5,h*.3,INK.navy,{max:w*.84,weight:900});},{rim:.016});
const helpBoard=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.15),INK.navy);k.text(title,w/2,h*.11,h*.08,INK.yellow,{max:w*.86,weight:900});});
const giftCard=(key:string,w:number,h:number,kind:'fees'|'kit'|'ride',label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,[INK.yellow,INK.sky,INK.pink][kind==='fees'?0:kind==='kit'?1:2]);k.dots(b,INK.navy,.03,.15);k.key(b,.012);const cx=w/2,cy=h*.4;
 if(kind==='fees'){k.fill(ell(cx,cy,w*.22,w*.22),INK.gold);k.key(ell(cx,cy,w*.22,w*.22),.012);k.text('0',cx,cy+w*.08,w*.26,INK.navy,{weight:900});}
 else if(kind==='kit'){const s=`M${cx-w*.3} ${cy-h*.12} L${cx-w*.12} ${cy-h*.2} Q${cx} ${cy-h*.12} ${cx+w*.12} ${cy-h*.2} L${cx+w*.3} ${cy-h*.12} L${cx+w*.22} ${cy} L${cx+w*.16} ${cy-h*.04} L${cx+w*.16} ${cy+h*.22} L${cx-w*.16} ${cy+h*.22} L${cx-w*.16} ${cy-h*.04} L${cx-w*.22} ${cy} Z`;k.fill(s,INK.white);k.key(s,.012);}
 else{const v=`M${cx-w*.34} ${cy+h*.14} L${cx-w*.34} ${cy-h*.1} L${cx+w*.2} ${cy-h*.1} L${cx+w*.34} ${cy+h*.02} L${cx+w*.34} ${cy+h*.14} Z`;k.fill(v,INK.white);k.key(v,.012);k.fill(rect(cx-w*.28,cy-h*.06,w*.4,h*.08),INK.sky);for(const x of [-.2,.2])k.fill(ell(cx+w*x,cy+h*.16,w*.07,w*.07),INK.navy);}
 k.fill(rect(0,h*.78,w,h*.22),INK.white);k.text(label,w/2,h*.94,h*.13,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const qCover=(key:string,w:number,h:number,c:string,label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.text(label,w/2,h*.46,h*.18,INK.white,{max:w*.86,weight:900});k.text('LIFT',w/2,h*.88,h*.11,INK.white,{weight:900});},{rim:.015});
const suitcase=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,c);k.dots(b,INK.navy,.03,.2);k.key(b,.013);k.key(`M${w*.3} ${h*.2} L${w*.3} ${h*.04} L${w*.7} ${h*.04} L${w*.7} ${h*.2}`,.02);k.fill(rect(w*.12,h*.2,w*.08,h*.8),INK.brown);k.fill(rect(w*.8,h*.2,w*.08,h*.8),INK.brown);k.fill(ell(w*.5,h*.6,w*.14,h*.12),INK.white);k.text('14',w*.5,h*.66,h*.16,INK.navy,{weight:900});});
const contract=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.18),INK.navy);k.text('CONTRACT',w/2,h*.13,h*.1,INK.yellow,{weight:900});for(let i=0;i<4;i++)k.key(`M${w*.1} ${h*(.32+i*.12)} L${w*(i%2?.7:.9)} ${h*(.32+i*.12)}`,.01,INK.grey);k.key(`M${w*.12} ${h*.86} q${w*.1} -${h*.1} ${w*.2} 0 t${w*.2} 0`,.018,INK.blue);},{rim:.016});
const passport=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f3ead6');k.dots(b,INK.sky,.035,.2);k.key(b,.014);k.fill(rect(w*.08,h*.1,w*.32,h*.42),INK.sky2);k.key(rect(w*.08,h*.1,w*.32,h*.42),.01);k.fill(ell(w*.24,h*.26,w*.08,w*.08),'#7f5138');k.fill(rect(w*.16,h*.36,w*.16,h*.14),INK.orange);
 for(let i=0;i<4;i++)k.key(`M${w*.48} ${h*(.18+i*.1)} L${w*.92} ${h*(.18+i*.1)}`,.01,INK.grey);k.text('CITIZENSHIP',w/2,h*.92,h*.1,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const stampMark=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(ell(w/2,h/2,w*.46,h*.44),.03,INK.red);k.key(ell(w/2,h/2,w*.38,h*.36),.012,INK.red);k.text('CANADIAN',w/2,h*.58,h*.22,INK.red,{weight:900,max:w*.7});},{rim:.01});
const stamper=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(w*.35,0,w*.3,h*.6),INK.wood);k.key(rect(w*.35,0,w*.3,h*.6),.012);k.fill(ell(w/2,h*.06,w*.24,h*.07),INK.brown);k.fill(rect(0,h*.6,w,h*.3),INK.navy);k.key(rect(0,h*.6,w,h*.3),.012);k.fill(rect(w*.05,h*.9,w*.9,h*.1),INK.red);},{rim:.014});
const leafDream=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.1,h*.7],[0,h*.4],[w*.15,h*.1],[w*.45,0],[w*.75,h*.05],[w,h*.35],[w*.9,h*.7],[w*.55,h*.8]]);k.fill(p,INK.white);k.dots(p,INK.sky,.035,.18);k.key(p,.013);
 const cx=w*.5,cy=h*.42,s=h*.3;const pts=[[0,-1],[.18,-.55],[.5,-.7],[.38,-.3],[.8,-.28],[.62,-.05],[.8,.12],[.3,.12],[.06,.5],[.06,.8],[-.06,.8],[-.06,.5],[-.3,.12],[-.8,.12],[-.62,-.05],[-.8,-.28],[-.38,-.3],[-.5,-.7],[-.18,-.55]].map(([x,y])=>[cx+x*s,cy+y*s]);k.fill(poly(pts),INK.red);k.key(poly(pts),.01);
 k.circle(w*.2,h*.9,.05,INK.white,true);k.circle(w*.1,h*.98,.03,INK.white,true);},{rim:.016});
const gatePost=(key:string,w:number,h:number,label:string,c:string=INK.navy)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,c);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.yellow,{max:w*.62,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);},{rim:.012});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
const phone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.12} 0 L${w*.88} 0 Q${w} 0 ${w} ${h*.08} L${w} ${h*.92} Q${w} ${h} ${w*.88} ${h} L${w*.12} ${h} Q0 ${h} 0 ${h*.92} L0 ${h*.08} Q0 0 ${w*.12} 0 Z`;k.fill(b,INK.navy);k.key(b,.012);const s=rect(w*.1,h*.1,w*.8,h*.72);k.fill(s,INK.sky2);const c=w*.5,y=h*.46,r=w*.22;k.fill(`M${c} ${y+r*.9} C${c-r*1.6} ${y} ${c-r*.8} ${y-r*1.2} ${c} ${y-r*.3} C${c+r*.8} ${y-r*1.2} ${c+r*1.6} ${y} ${c} ${y+r*.9} Z`,INK.pink);k.circle(w*.5,h*.9,w*.06,INK.grey);},{rim:.014});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const globe=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.blue);k.dots(ell(r,r,r,r),INK.navy,.03,.3);k.fill(blob([[r*.5,r*.5],[r*.9,r*.35],[r*1.1,r*.8],[r*.8,r*1.2],[r*.55,r*.95]]),INK.green);k.fill(blob([[r*1.2,r*1.1],[r*1.6,r*.9],[r*1.7,r*1.3],[r*1.35,r*1.6]]),INK.green);k.key(ell(r,r,r,r),.014);},{rim:.016});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.11){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),Rt=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[Rt,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · Born in a refugee camp (camp) ───────────── */
const camp:SpreadDef={id:'camp',rest:32.6,
 left:k=>{asphalt(k,-5,0,'#a9a3a0');footprints(k,-4.2,Z(1.5),-.2,Z(.6),16,INK.navy);
  k.text('MONROVIA',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('LIBERIA · HIS PARENTS HAD TO FLEE',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{sand(k,0,5);footprints(k,.2,Z(.6),1.6,Z(.9),6,INK.navy);
  k.text('BUDUBURAM',2.5,Z(2.62),.46,INK.brown,{max:4});k.text('A REFUGEE CAMP IN GHANA · 2000',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#cfd3dc',INK.navy,y=>.25-y*.05);sea(k,4.5,1.9,.4);skyline(k,4.5,2.35,['#c9b8a8','#d8c5ad','#b9a896']);palms(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#a9a3a0');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);const hill=`M0 2.0 Q1.4 1.6 2.6 1.9 Q3.6 2.1 4.5 1.8 L4.5 3 L0 3 Z`;k.fill(hill,'#6b5f4a');k.dots(hill,INK.navy,.05,.3);k.fill(rect(0,2.45,4.5,.55),'#e3c48f');}},-3.05,1.22);
  const day=bd.add(S.sun(K+'c-sun',.3),'L',3.9,1.7,{out:.012});
  const storms=[bd.add(stormCloud('c-st1',1.4,.7),'L',1.2,2.0,{out:.03}),bd.add(stormCloud('c-st2',1.2,.6),'L',3.3,2.3,{out:.035})];
  const moon=bd.add(S.sun(K+'c-moon',.26,INK.white),'R',3.8,2.2,{out:.012});const stars=bd.add(S.stars(K+'c-stars',2.4,.8,9),'R',1.4,2.5,{out:.02});
  const plane=bd.add(S.plane(K+'c-plane',.8,.36),'R',.3,2.3,{out:.035});
  // Left page: Monrovia, the parents, the war clouds, the long walk.
  const city=B.stand(cityBlock('c-city',1.8,1.4),-3.6,-1.6,{layer:1});
  const mon=B.stand(S.flipCard(K+'c-mon',1.2,.34,'MONROVIA',INK.blue),-1.4,-1.5,{layer:1,s:0});
  const dad=B.person(K+'c-dad',-2.6,-.3,1.72,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2,holdL:'suitcase'});
  const mum=B.person(K+'c-mum',-3.4,-.1,1.6,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2,holdR:'suitcase'});
  const names=B.stand(S.flipCard(K+'c-names',1.6,.32,'DEBEAH · VICTORIA',INK.white,INK.navy),-3.0,.75,{layer:3,s:0});
  B.slot(-4.8,1.55,-.3,1.55);const walk=B.stand(walkers('c-walk',1.8,.5),-4.0,1.55,{layer:3,s:0,tab:false});
  const many=B.stand(lineCard('c-450',1.6,.5,['450,000','FORCED FROM HOME'],INK.white),-1.4,.3,{layer:2,s:0});
  // Right page: the camp.
  const tents=[[1.0,-1.7,INK.sky],[2.4,-1.9,INK.pink],[4.4,-1.7,INK.teal]].map(([x,z,c],i)=>B.stand(tent(`c-tent${i}`,1.1,.8,c as string),x as number,z as number,{layer:1,s:0}));
  const home=B.stand(tent('c-home',1.5,1.1,INK.orange),3.4,-.6,{layer:1});
  home.add(tentGlow('c-glow',.5,.6),0,0,{anchor:'bottom',z:.01});const door=home.flap(tentDoor('c-door',.52,.62),-.26,0,{anchor:'bl',axis:'y',z:.02});
  const light=B.stand(halo('c-halo',.4),3.4,-.55,{layer:1,s:0,tab:false});
  const year=B.stand(S.flipCard(K+'c-2000',.9,.34,'2000',INK.pink),1.1,-.9,{layer:1,s:0});
  const mum2=B.person(K+'c-mum2',1.6,.3,1.6,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const dad2=B.person(K+'c-dad2',2.4,.1,1.72,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const baby=B.person(K+'c-baby',2.0,.95,.62,{shirt:'bib',...PHONZIE,face:'grin',layer:3});
  const def=B.stand(lineCard('c-def',2.0,.62,['REFUGEE: LEAVING HOME','TO STAY SAFE'],INK.yellow),2.5,1.85,{layer:3,s:0});
  const sibs=[[.8,1.3,'curly'],[3.1,1.2,'bun'],[4.3,.7,'short'],[.7,.5,'long']].map(([x,z,hr],i)=>B.person(K+`c-sib${i}`,x as number,z as number,.8+(i%2)*.14,{shirt:(['fan','casual','bib','fan'] as const)[i],hair:hr as 'short',hairColor:'#1d1512',skin:'#7f5138',face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`c-h${i}`,.26),1.4+i*1.2,2.25,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,32.6):b.t;
   // Born in the camp (right page first).
   tents.forEach((p,i)=>{p.s=beat(t,2.6+i*.4,3.4+i*.4);});year.s=beat(t,3.6,4.4);mum2.body.s=beat(t,5,5.8);dad2.body.s=beat(t,5.4,6.2);baby.body.s=beat(t,6,6.8);
   // His parents came from Monrovia.
   city.s=beat(t,8.6,9.6);mon.s=beat(t,9.4,10.2);mum.body.s=beat(t,10.6,11.4);dad.body.s=beat(t,11,11.8);names.s=beat(t,11.8,12.6)*(1-beat(t,17.4,18));
   day.dy=.4*beat(t,8.6,10)-.9*beat(t,14.6,16);
   // War: dark clouds, and they had to flee.
   const st=beat(t,14.6,15.8)*(1-beat(t,35,38));storms.forEach((c,i)=>{c.scale=st;c.visible=st>.02;c.dx=.15*wave(t,15.8,34,.3+i*.1);});
   const flee=beat(t,16,17.8);mum.body.dx=2.2*flee;dad.body.dx=2.0*flee;mum.body.s*=1-beat(t,17.4,18.2);dad.body.s*=1-beat(t,17.6,18.4);
   walk.s=beat(t,18,18.8);walk.x=-4.0+2.6*beat(t,18.6,23);walk.s*=1-beat(t,23,23.8);many.s=beat(t,19.4,20.2)*(1-beat(t,36.6,37.4));
   // A refugee is someone who has to leave home to stay safe.
   def.s=beat(t,23.6,24.4)*(1-beat(t,36.6,37.2));mum2.armR.rot=.12+1.2*beat(t,24.6,25.2);dad2.armL.rot=-.12-1.2*beat(t,25,25.6);
   sibs.forEach((p,i)=>{p.body.s=beat(t,28.2+i*.5,29+i*.5);});
   // Light the lamp in the tent.
   const lit=Math.max(beat(t,33,34.4),manual?beat(act,0,.7):0);door.flip=-1.3*lit;light.s=lit;light.rot=.2*t;
   moon.dy=.3*beat(t,30,33);stars.scale=Math.max(beat(t,30,32),manual?1:0);
   // His story was only beginning: a plane crosses the night sky.
   const fl=Math.max(beat(t,35,38.4),manual?beat(act,.6,1):0);plane.dx=2.6*fl;plane.dy=.5*fl;plane.visible=fl>0&&fl<1;
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,37.8+i*.5,38.5+i*.5),manual?beat(act,.8+i*.06,.9+i*.06):0);});
   sibs.forEach((p,i)=>cheer(p,beat(t,38.4+i*.3,39+i*.3)));mum2.armL.rot=-.12-1.5*beat(t,39,39.6);cheer(baby,beat(t,39.6,40.2));
   return b.narrated?.45*beat(t,2.2,3.2)-.45*beat(t,8.2,9)-.45*beat(t,9,9.8)+.45*beat(t,22.8,23.6)+.45*beat(t,23.6,24.4)-.45*beat(t,37,38):0;
  };
 }};

/* ───────────── 2 · A brand-new country (canada) ───────────── */
const canada:SpreadDef={id:'canada',rest:28.2,
 left:k=>{asphalt(k,-5,0);line(k,-5,Z(.4),0,Z(.4),.05,INK.white);
  k.text('EDMONTON · 2005',-2.5,Z(2.62),.42,INK.navy,{max:4.2});k.text('A NEW HOME IN CANADA',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{schoolyard(k,0,5);
  k.text('A NEW SCHOOL',2.5,Z(2.62),.44,INK.red,{max:4});k.text('MOTHER TERESA ELEMENTARY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'n-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);skyline(k,4.5,2.3);pines(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#9a9aa2');}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);pines(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#b9c3cf');}},-3.05,1.22);
  const plane=bd.add(S.plane(K+'n-plane',.9,.4),'L',.2,2.4,{out:.035});const sun=bd.add(S.sun(K+'n-sun',.32),'R',3.9,1.8,{out:.012});
  const sign=B.stand(S.sign(K+'n-sign',1.3,1.2,'EDMONTON'),-1.0,-1.7,{layer:1,s:0});
  const card05=B.stand(S.flipCard(K+'n-2005',.9,.34,'2005',INK.pink),-3.9,-1.3,{layer:1,s:0});
  const fam=[B.person(K+'n-dad',-3.6,-.2,1.72,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2,holdL:'suitcase'}),B.person(K+'n-mum',-4.4,.1,1.6,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2,holdR:'suitcase'})];
  const A=B.person(K+'n-a',-2.7,.6,.85,{shirt:'bib',...PHONZIE,face:'open',layer:3});
  const sibs=[[-3.5,1.2,'bun'],[-2.0,1.3,'curly']].map(([x,z,hr],i)=>B.person(K+`n-sib${i}`,x as number,z as number,.9+i*.1,{shirt:i?'fan':'casual',hair:hr as 'short',hairColor:'#1d1512',skin:'#7f5138',face:'smile',layer:3}));
  const qs=[0,1,2].map(i=>B.stand(bubble(`n-q${i}`,.42,.46,'?',[INK.white,INK.yellow,INK.sky2][i]),-2.9+i*.55,1.95,{layer:3,s:0,tab:false}));
  // Right page: the school, the words, the classmates, the door.
  const sch=B.stand(school('n-school',2.2,1.7),2.6,-1.7,{layer:1});
  const dL=sch.flap(schoolDoor('n-dL',.4,.82),-.4,0,{anchor:'bl',axis:'y',z:.014}),dR=sch.flap(schoolDoor('n-dR',.4,.82),.4,0,{anchor:'br',axis:'y',z:.014});
  const A2=B.person(K+'n-a2',1.4,.4,1.0,{shirt:'bib',...PHONZIE,face:'shy',layer:2});
  const words=[['ABC',INK.white],['HELLO?',INK.yellow],['…',INK.sky2]].map(([w,c],i)=>B.stand(bubble(`n-w${i}`,.8,.5,w as string,c as string),.8+i*.75,-.5+(i%2)*.25,{layer:2,s:0,tab:false}));
  const mates=[[3.1,.7,'#7f5138','curly'],[3.9,1.1,'#5b3a28','bun']].map(([x,z,sk,hr],i)=>B.person(K+`n-m${i}`,x as number,z as number,1.0,{shirt:i?'fan':'casual',hair:hr as 'short',hairColor:'#1d1512',skin:sk as string,face:'grin',layer:2}));
  const lib=B.stand(S.flipCard(K+'n-lib',1.4,.3,'ALSO FROM LIBERIA',INK.white,INK.navy),3.6,1.8,{layer:3,s:0});
  const soccer=B.stand(bubble('n-soccer',1.0,.55,'SOCCER!',INK.green),1.2,1.55,{layer:3,s:0,tab:false});
  const hearts=[0,1].map(i=>B.stand(heart(`n-h${i}`,.28),2.2+i*1.9,2.2,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'n-ball',.1),1.8,.6,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,28.2):b.t;
   // 2005: the plane lands, the family arrives.
   const fl=beat(t,1.8,5.4);plane.dx=3.6*fl;plane.dy=-.9*fl;plane.visible=fl>0&&fl<.98;card05.s=beat(t,2.6,3.4);
   fam.forEach((p,i)=>{p.body.s=beat(t,5+i*.4,5.8+i*.4);});A.body.s=beat(t,5.6,6.4);sibs.forEach((p,i)=>{p.body.s=beat(t,6.2+i*.4,7+i*.4);});
   sign.s=beat(t,8.4,9.2);sch.s=beat(t,11.4,12.4);A2.body.s=beat(t,12.6,13.4);A.body.s*=1-beat(t,12.4,13.2);
   // Everything was new: question marks.
   qs.forEach((q,i)=>{q.s=beat(t,14.4+i*.4,15+i*.4)*(1-beat(t,23,24));q.dy=.06*wave(t,15,23,.7+i*.2);});
   // A new language: words in bubbles.
   words.forEach((w,i)=>{w.s=beat(t,17.4+i*1.2,18+i*1.2)*(1-beat(t,27.6,28.4));w.dy=.05*wave(t,18,27,.5+i*.2);});A2.body.yaw=-.3*pulse(t,17,24.6);
   mates.forEach((m,i)=>{m.body.s=beat(t,25+i*.5,25.8+i*.5);m.armR.rot=.12+1.5*beat(t,26+i*.3,26.6+i*.3);});lib.s=beat(t,26.2,27);
   // Open the school door.
   const open=Math.max(beat(t,28.6,30),manual?beat(act,0,.6):0);dL.flip=-1.3*open;dR.flip=1.3*open;
   const inn=manual?beat(act,.5,1):beat(t,30.4,33);A2.body.dz=-.25*inn;A2.body.dx=.5*inn;
   ball.s=Math.max(beat(t,33.2,34),manual?beat(act,.7,1):0);ball.x=1.8+.9*pulse(t,34.6,36.2)+(manual?.9*pulse(act,.8,1):0);soccer.s=Math.max(beat(t,35.4,36.2),manual?beat(act,.85,1):0);
   cheer(A2,Math.max(beat(t,36.2,36.8),manual?beat(act,.9,1):0));mates.forEach((m,i)=>cheer(m,beat(t,36.6+i*.3,37.2+i*.3)));
   hearts.forEach((h,i)=>{h.s=beat(t,38.8+i*.6,39.5+i*.6);});fam.forEach((p,i)=>{p.armR.rot=.12+1.5*beat(t,39+i*.3,39.6+i*.3);});sibs.forEach((p,i)=>cheer(p,beat(t,39.6+i*.3,40.2+i*.3)));
   sun.dy=.5*beat(t,28,32);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,11,12)+.45*beat(t,12,13)-.45*beat(t,38,39):0;
  };
 }};

/* ───────────── 3 · Everyone can play (freefootie) ───────────── */
const freefootie:SpreadDef={id:'freefootie',rest:16.1,
 left:k=>{pitch(k,-5,0,'#9fcb7a','#79ab5e');box(k,-4.6,Z(-2.0),4.2,3.6,.05);ring(k,-2.5,Z(-.2),.6,.05);
  k.text('FREE FOOTIE',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('AN AFTER-SCHOOL LEAGUE',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('EDMONTON CLUBS',2.5,Z(2.62),.4,INK.navy,{max:4.2});k.text('INTERNATIONALS · STRIKERS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);skyline(k,4.5,2.3);pines(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#9fcb7a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.4,2.45,[INK.white,INK.sky,INK.yellow,INK.pink],3);lightRig(k,1.0,.5);lightRig(k,3.6,.45);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'f-sun',.32),'L',3.9,1.8,{out:.012}),bunt=bd.add(S.bunting(K+'f-bunt',2.6,.4,[INK.pink,INK.yellow,INK.sky,INK.white]),'L',.8,2.6,{out:.03});
  const board=B.stand(helpBoard('f-board',2.2,1.5,'WHAT FREE FOOTIE GAVE'),2.5,-1.2,{layer:1,s:0});
  const gifts=([['fees','NO FEES'],['kit','KIT'],['ride','A RIDE']] as const).map(([w,l],i)=>{const x=-2.2/2+.38+i*.72;board.add(giftCard(`f-g${i}`,.62,.78,w,l),x,.3,{z:.012});return board.flap(qCover(`f-q${i}`,.64,.8,[INK.pink,INK.orange,INK.blue][i],['FEES?','KIT?','RIDE?'][i]),x,1.1,{z:.024});});
  const A=B.person(K+'f-a',-2.5,.6,1.0,{shirt:'bib',...PHONZIE,legs:'kick',face:'grin',layer:2});
  const kids=[[-4.1,.9,'#f1b88f','bun'],[-1.2,1.1,'#d99a6c','curly'],[-3.4,1.7,'#b27650','short']].map(([x,z,sk,hr],i)=>B.person(K+`f-k${i}`,x as number,z as number,.95,{shirt:'bib',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const cones=[[-4.4,-.2],[-.7,-.1]].map(([x,z],i)=>B.stand(S.cone(K+`f-cone${i}`,.3),x,z,{layer:2}));void cones;
  const worries=['FEES','KIT','RIDE'].map((w,i)=>B.stand(stamp(`f-w${i}`,.7,.3,w+'?',INK.navy),-4.3+i*.9,1.95,{layer:3,s:0}));
  // Right page: the Edmonton clubs, and giving back today.
  const clubs=[['INTERNATIONALS',1.3,-1.6],['STRIKERS',3.6,-1.7]].map(([l,x,z],i)=>B.stand(S.sign(K+`f-club${i}`,1.4,1.2,l as string,i?INK.yellow:INK.white),x as number,z as number,{layer:1,s:0}));
  const A2=B.person(K+'f-a2',2.0,.3,1.15,{shirt:'fan',...PHONZIE,legs:'kick',face:'grin',layer:2});
  const mates=[[3.3,.1,'#7f5138'],[4.3,.8,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.1,{shirt:'fan',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:2}));
  const amb=B.stand(S.flipCard(K+'f-amb',1.5,.32,'CLUB AMBASSADOR',INK.yellow,INK.navy),2.2,1.3,{layer:3,s:0});
  const A3=B.person(K+'f-a3',1.2,1.4,1.45,{shirt:'casual',...PHONZIE,adult:true,face:'grin',layer:3});
  const little=[[3.2,1.7,'#d99a6c','bun'],[3.9,1.5,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`f-l${i}`,x as number,z as number,.85,{shirt:'bib',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const ball=ballPair(B,'f-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.1):b.t;
   sun.dy=.5*beat(t,0,2);A.body.s=beat(t,2.4,3.2);kids.forEach((p,i)=>{p.body.s=beat(t,3.4+i*.4,4.2+i*.4);});bunt.scale=beat(t,5,6);bunt.visible=bunt.scale>.02;
   // Who it was for: fees, kit, a ride to games.
   worries.forEach((w,i)=>{w.s=beat(t,10+i*1.6,10.6+i*1.6)*(1-Math.max(beat(t,20+i*1.6,20.6+i*1.6),manual?clamp01(act*3-i):0));});
   board.s=Math.max(beat(t,15.2,16)*(1-beat(t,24.2,24.9)),manual?1:0);
   // Lift the three flaps (one tap each).
   const n=manual?act*3:0;const open=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,[19.8,21.6,22.8][i],[20.5,22.3,23.5][i])));gifts.forEach((f,i)=>{f.flip=-2.9*open[i];});
   cheer(A,Math.max(open[2]*(1-beat(t,24.4,25)),manual?beat(act,.95,1):0));
   let bx:number,bz:number,dy=0;
   if(t<24.3||manual)[bx,bz]=track(manual?6:t,[[0,-2.1,.7],[5.2,-2.1,.7],[6,-1.2,1.2],[6.8,-1.2,1.2],[7.6,-3.4,1.8],[8.4,-3.4,1.8],[9.2,-2.1,.7]]);
   else [bx,bz]=track(t,[[24.3,2.4,.4],[26.2,2.4,.4],[27,3.3,.2],[27.8,3.3,.2],[28.6,2.4,.4],[35,2.4,.4],[35.8,3.5,1.6],[36.6,3.5,1.6],[37.4,2.2,1.5]]);
   dy=.06*Math.abs(Math.sin(t*4));ball(bx,bz,dy,t>2.8||manual);A.leg!.rot=-1*maxOf([5.2,9.2].map(a=>pulse(t,a-.3,a+.3)));
   // Later: the Edmonton Internationals and Strikers.
   clubs.forEach((c,i)=>{c.s=beat(t,24.8+i*1.8,25.6+i*1.8);});A2.body.s=beat(t,25.4,26.2);mates.forEach((m,i)=>{m.body.s=beat(t,26+i*.4,26.8+i*.4);});
   A2.leg!.rot=-1*maxOf([26.2,28.6].map(a=>pulse(t,a-.3,a+.3)));
   // Today: an ambassador for one of his old clubs.
   A3.body.s=beat(t,30,30.8);amb.s=beat(t,30.8,31.6);little.forEach((p,i)=>{p.body.s=beat(t,31.4+i*.4,32.2+i*.4);});A3.armR.rot=.12+1.5*beat(t,32.4,33)+.2*wave(t,33,41,1.1);
   little.forEach((p,i)=>cheer(p,beat(t,35.6+i*.3,36.2+i*.3)));kids.forEach((p,i)=>cheer(p,beat(t,36+i*.3,36.6+i*.3)));cheer(A2,beat(t,37.4,38));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14.8,15.6)+.45*beat(t,15.6,16.4)-.45*beat(t,34.2,35):0;
  };
 }};

/* ───────────── 4 · Moving away at fourteen (vancouver) ───────────── */
const vancouver:SpreadDef={id:'vancouver',rest:17.1,
 left:k=>{asphalt(k,-5,0);footprints(k,-3.6,Z(1.3),-.3,Z(1.3),10,INK.white);
  k.text('EDMONTON',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('2015 · MOVING AWAY AT FOURTEEN',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('VANCOUVER',2.5,Z(2.62),.46,INK.blue,{max:4});k.text('JULY 2016 · FIRST MLS GAME',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'v-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);skyline(k,4.5,2.3);pines(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#9a9aa2');}},
   {key:K+'v-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);peaks(k,4.5,1.4,'#8f9fbd',true,3);sea(k,4.5,1.75,.35);crowd(k,4.5,1.9,2.45,[INK.white,INK.blue,INK.sky],2);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'v-sun',.32),'R',3.9,1.6,{out:.012}),cloud=bd.add(S.cloud(K+'v-cloud',1.0,.45),'L',1.6,2.6);
  const home=B.stand(S.house(K+'v-house',1.4,1.3),-3.8,-1.6,{layer:1});void home;
  const fam=[B.person(K+'v-mum',-4.3,-.3,1.6,{shirt:'coach',hair:'bun',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2}),B.person(K+'v-dad',-3.5,-.5,1.72,{shirt:'navy',hair:'short',hairColor:'#1d1512',adult:true,skin:'#7f5138',face:'smile',layer:2})];
  const A=B.person(K+'v-a',-2.4,.3,1.15,{shirt:'casual',...PHONZIE,face:'smile',layer:2});
  const age=B.stand(S.flipCard(K+'v-14',.9,.32,'AGE 14',INK.pink),-1.2,-1.3,{layer:1,s:0});
  const big=B.stand(lineCard('v-step',1.5,.5,['A VERY BIG STEP'],INK.yellow),-1.4,-.4,{layer:1,s:0});
  B.slot(-4.3,1.35,-.3,1.35);const bagL=B.stand(suitcase('v-bagL',.5,.44,INK.red),-2.4,1.35,{layer:3,tab:false});
  const phoneL=B.stand(phone('v-phoneL',.34,.56),-4.2,1.9,{layer:3,s:0,tab:false});
  // Right page: Vancouver, the contract, the first game.
  B.slot(.3,1.35,2.4,1.35);const bagR=B.stand(suitcase('v-bagR',.5,.44,INK.red),.4,1.35,{layer:3,tab:false,s:0});
  const res=B.stand(S.sign(K+'v-res',1.5,1.2,'RESIDENCY',INK.white),1.1,-1.7,{layer:1,s:0});
  const A2=B.person(K+'v-a2',1.9,.3,1.2,{shirt:'ger',...PHONZIE,legs:'kick',face:'grin',layer:2});
  const paper=B.stand(contract('v-contract',.7,.9),3.2,-1.5,{layer:1,s:0});const fifteen=B.stand(S.flipCard(K+'v-15',.9,.3,'AGE 15',INK.pink),3.2,-.8,{layer:1,s:0});
  const goal=B.stand(S.goal(K+'v-goal',1.5,.8),2.5,-1.9,{layer:1,s:0});void goal;
  const july=B.stand(S.flipCard(K+'v-july',1.3,.32,'JULY 2016 · MLS',INK.blue),4.2,.2,{layer:2,s:0});
  const first=B.stand(lineCard('v-first',1.8,.56,['FIRST PLAYER BORN','IN THE 2000s'],INK.gold),3.6,1.75,{layer:3,s:0});
  const mates=[[3.2,.7,'#f1b88f'],[4.4,-.4,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`v-m${i}`,x as number,z as number,1.25,{shirt:'ger',hair:i?'curly':'bald',skin:sk as string,face:'grin',layer:2}));
  const phoneR=B.stand(phone('v-phoneR',.34,.56),1.0,1.95,{layer:3,s:0,tab:false});
  const hearts=[B.stand(heart('v-hL',.26),-3.6,2.1,{layer:3,s:0,tab:false}),B.stand(heart('v-hR',.26),1.6,2.15,{layer:3,s:0,tab:false})];
  const ball=B.stand(S.ball(K+'v-ball',.1),2.3,.4,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.1):b.t;
   cloud.dx=.5*beat(t,0,40);fam.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.4,3.2+i*.4);});A.body.s=beat(t,3,3.8);age.s=beat(t,4.4,5.2);
   res.s=beat(t,8.4,9.2);
   // Waving goodbye.
   fam.forEach((p,i)=>{p.armR.rot=.12+1.8*beat(t,10+i*.3,10.6+i*.3)+.3*wave(t,10.6,16,1.2);});
   big.s=beat(t,13.4,14.2);
   // Slide the suitcase to Vancouver: one cut-out slides to the gutter, the other carries on.
   const slide=Math.max(beat(t,17.5,19.4),manual?beat(act,0,.7):0);bagL.x=-2.4+2.0*clamp01(slide*2);bagL.s=1-beat(slide,.45,.55);A.body.dx=2.0*clamp01(slide*2);A.body.s*=1-beat(slide,.45,.55);
   bagR.s=beat(slide,.5,.6);bagR.x=.4+1.6*clamp01(slide*2-1);
   A2.body.s=Math.max(beat(t,19,19.8),manual?beat(act,.6,.9):0);
   paper.s=beat(t,20.2,21);fifteen.s=beat(t,21,21.8);A2.armR.rot=.12+1.2*beat(t,21.2,21.8)-1.2*beat(t,23.4,24);
   goal.s=beat(t,8.8,9.6);mates.forEach((m,i)=>{m.body.s=beat(t,24.6+i*.4,25.4+i*.4);});july.s=beat(t,25.6,26.4);ball.s=beat(t,25,25.8);
   ball.x=2.3+.4*pulse(t,26.4,27.4);ball.z=.4-1.8*beat(t,27.6,28.4);ball.visible=t<28.6;A2.leg!.rot=-1*pulse(t,27.3,27.9);
   cheer(A2,Math.max(beat(t,28.4,29)*(1-beat(t,30.6,31.2)),manual?beat(act,.9,1):0));mates.forEach((m,i)=>cheer(m,beat(t,28.6+i*.3,29.2+i*.3)*(1-beat(t,31,31.6))));
   first.s=beat(t,29.8,30.6);
   // Stay in touch: phones and hearts on both pages.
   phoneL.s=beat(t,34,34.8);phoneR.s=beat(t,34.4,35.2);hearts.forEach((h,i)=>{h.s=beat(t,35.2+i*.4,35.9+i*.4);h.dy=.08*wave(t,36,41,.6);});
   fam.forEach((p,i)=>{if(t>33.7)p.armR.rot=.12+1.4*beat(t,35+i*.3,35.6+i*.3);});cheer(A2,beat(t,37.6,38.2));
   sun.dy=.5*beat(t,17,20);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,19.4,20.2)+.45*beat(t,20.2,21)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 5 · Officially Canadian (citizen) ───────────── */
const citizen:SpreadDef={id:'citizen',rest:21.8,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#efe1c2');k.dots(p,INK.orange,.06,.12);for(let y=.5;y<PAGE_D;y+=.5)line(k,-5,y,0,y,.012,'#dcc7a0');
  k.text('A DREAM · MARCH 2017',-2.5,Z(2.62),.36,INK.red,{max:4.3});k.text('6 JUNE 2017 · A CANADIAN CITIZEN',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('YOUNGEST EVER',2.5,Z(2.62),.42,INK.red,{max:4.2});k.text('GOLD CUP · TOP SCORER',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'z-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f6ead0');k.dots(p,INK.orange,.05,.12);for(let i=0;i<2;i++){const w=rect(.6+i*2.3,.5,1.0,1.0);k.fill(w,INK.sky2);k.key(w,.012);}const f=rect(1.9,.5,.8,1.4);k.key(f,.012);k.fill(rect(0,2.2,4.5,.8),'#dcc7a0');}},
   {key:K+'z-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.2,2.45,[INK.red,INK.white,INK.red,INK.orange],2);lightRig(k,1.0,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const dream=bd.add(leafDream('z-dream',1.3,.9),'L',1.6,1.3,{out:.035});
  const fw=[bd.add(S.firework(K+'z-fw1',.36,INK.red),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'z-fw2',.34,INK.white),'R',3.4,.9,{out:.03})];
  const gate=B.stand(gatePost('z-gate',1.5,1.45,'CANADA TEAM',INK.red),-1.0,-1.55,{layer:1});
  const gl=gate.flap(gateLeaf('z-gl',.56,1.0,INK.navy),-1.5/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('z-gr',.56,1.0,INK.navy),1.5/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const notYet=B.stand(stamp('z-notyet',1.0,.32,'NOT YET'),-1.0,-.75,{layer:2,s:0});
  const A=B.person(K+'z-a',-2.6,.2,1.2,{shirt:'casual',...PHONZIE,face:'smile',layer:2});
  const test=B.stand(lineCard('z-test',1.2,.8,['CITIZENSHIP','TEST PASSED'],INK.white),-4.1,-1.2,{layer:1,s:0});
  const desk=B.stand(S.bench(K+'z-desk',1.3,.5),-3.3,1.2,{layer:3});void desk;
  const pass=B.stand(passport('z-pass',.9,.62),-3.3,1.3,{layer:3,s:0});const mark=pass.add(stampMark('z-mark',.5,.36),.18,.12,{anchor:'bottom',z:.02});
  const press=B.stand(stamper('z-stamper',.36,.5),-2.4,1.25,{layer:3,s:0});
  const judge=B.person(K+'z-judge',-4.4,.4,1.65,{shirt:'navy',hair:'long',hairColor:'#6b4a2f',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  // Right page: the youngest ever, the Gold Cup goals.
  const A2=B.person(K+'z-a2',1.5,.4,1.25,{shirt:'casual',...PHONZIE,legs:'kick',face:'grin',layer:2});
  const young=B.stand(S.flipCard(K+'z-young',1.4,.32,'AGE 16 · YOUNGEST',INK.yellow,INK.navy),1.3,1.4,{layer:3,s:0});
  const goal=B.stand(S.goal(K+'z-goal',1.6,.8),2.5,-1.85,{layer:1});void goal;
  const keeper=B.person(K+'z-keeper',2.5,-1.4,1.25,{shirt:'keeper',hair:'short',skin:'#b27650',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const board=B.stand(S.scoreboard(K+'z-board',1.3,1.1,'GOLD CUP'),4.3,-1.5,{layer:1,s:0});board.add(lineCard('z-2g',1.05,.46,['2 GOALS'],INK.yellow),0,.3,{z:.012});
  const top=B.stand(lineCard('z-top',1.3,.5,['TOP SCORER'],INK.gold),3.9,.9,{layer:3,s:0});const boot=B.stand(S.icon(K+'z-boot',.4,'boot'),4.4,1.6,{layer:3,s:0,tab:false});
  const mates=[[3.5,.3,'#f1b88f'],[.8,1.9,'#b27650']].map(([x,z,sk],i)=>B.person(K+`z-m${i}`,x as number,z as number,1.2,{shirt:'casual',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`z-h${i}`,.26),-4.3+i*.9,2.2,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'z-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.8):b.t;
   A.body.s=beat(t,2,2.8);gate.s=beat(t,1.8,2.8);notYet.s=beat(t,4.6,5.3)*(1-Math.max(beat(t,22.4,23),manual?beat(act,.5,.7):0));A.body.yaw=-.25*pulse(t,5,8.8);
   // A dream: the red leaf.
   dream.scale=beat(t,9.2,10.4)*(1-beat(t,21,22));dream.visible=dream.scale>.02;dream.dy=.05*wave(t,10.4,21,.4);cheer(A,beat(t,10.6,11.2)*(1-beat(t,13.6,14.2)));
   // The citizenship test.
   judge.body.s=beat(t,14.8,15.6);test.s=beat(t,15.8,16.6);pass.s=beat(t,17.6,18.4);press.s=beat(t,18.4,19.2);judge.armR.rot=.12+1.3*beat(t,19.6,20.2);
   // Stamp the passport: the stamp comes down, lifts, and the mark is there.
   const st=Math.max(beat(t,22.1,23.4),manual?beat(act,0,.7):0);press.dy=.3*(1-pulse(st,.2,.9))*st-.02;press.dx=-.7*beat(st,0,.35);mark.visible=st>.55;mark.s=beat(st,.5,.7);
   const openG=Math.max(beat(t,23,24.4),manual?beat(act,.6,1):0);gl.flip=-1.25*openG;gr.flip=1.25*openG;cheer(A,Math.max(beat(t,23.4,24)*(1-beat(t,25.6,26.2)),manual?beat(act,.8,1):0));
   // One week later: the youngest ever.
   A2.body.s=Math.max(beat(t,24,24.8),manual?beat(act,.7,1):0);young.s=beat(t,26.4,27.2);keeper.body.s=beat(t,30,30.8);board.s=beat(t,30.6,31.4);mates.forEach((m,i)=>{m.body.s=beat(t,31+i*.4,31.8+i*.4);});
   let bx=1.9,bz=.5,dy=0;const shots=[32.2,34.4];let s=-1;shots.forEach((a,i)=>{if(t>=a&&t<a+.7)s=i;});
   if(s>=0){const u=(t-shots[s])/.7;bx=1.9+(s?.9:-.1)*u;bz=.5-2.2*u;dy=.25*Math.sin(u*Math.PI);}
   ball(bx,bz,dy,t>30.4);A2.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));keeper.body.rot=(t<33.5?-.8:.8)*Math.min(1,pulse(t,32.4,33.6)+pulse(t,34.6,35.8));
   cheer(A2,beat(t,33,33.5)*(1-beat(t,34,34.4))+beat(t,35.2,35.7));mates.forEach((m,i)=>cheer(m,beat(t,35.4+i*.3,36+i*.3)));top.s=beat(t,36.2,37);boot.s=beat(t,36.8,37.6);
   hearts.forEach((h,i)=>{h.s=beat(t,39.2+i*.5,39.9+i*.5);});cheer(judge,beat(t,39.6,40.2));
   fw.forEach((f,i)=>{const a=beat(t,35.4+i*.5,36.4+i*.5);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,23.4,24.2)+.45*beat(t,24.2,25)-.45*beat(t,38.4,39.2):0;
  };
 }};

/* ───────────── 6 · Try again (worldcup) ───────────── */
const worldcup:SpreadDef={id:'worldcup',rest:24.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);k.circle(-2.65,Z(.2),.06,INK.white);
  k.text('QATAR · 2022',-2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('V BELGIUM · THE PENALTY WAS SAVED',-2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05);box(k,1.3,Z(-2.0),2.5,1.0,.05);
  k.text('V CROATIA · FOUR DAYS LATER',2.5,Z(2.62),.28,INK.yellow,{max:4.4});k.text('CANADA’S FIRST MEN’S WORLD CUP GOAL',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.white,INK.red,INK.yellow],1);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.white,INK.blue,INK.white],4);lightRig(k,1.1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const rain=bd.add(stormCloud('w-rain',1.3,.66),'L',1.4,1.9,{out:.03});
  const fw=[bd.add(S.firework(K+'w-fw1',.4,INK.red),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'w-fw2',.36,INK.white),'R',3.4,.8,{out:.03}),bd.add(S.firework(K+'w-fw3',.38,INK.yellow),'L',3.2,.9,{out:.03})];
  const conf=bd.add(S.confetti(K+'w-conf',2.2,1.1,4),'R',1.0,1.3,{out:.04});
  const since=B.stand(lineCard('w-since',1.6,.6,['FIRST WORLD CUP','SINCE 1986'],INK.red,INK.white),-4.2,-1.2,{layer:1,s:0});
  const goalL=B.stand(S.goal(K+'w-goalL',1.6,.85),-2.65,-1.8,{layer:1});void goalL;
  const keeperL=B.person(K+'w-kL',-2.65,-1.35,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const A=B.person(K+'w-a',-2.1,.55,1.3,{shirt:'casual',...PHONZIE,legs:'kick',face:'smile',layer:2});
  const saved=B.stand(S.flipCard(K+'w-saved',.9,.3,'SAVED',INK.blue),-4.2,.6,{layer:2,s:0});
  const board=B.stand(S.scoreboard(K+'w-board',1.3,1.05,'BELGIUM'),-.8,-1.4,{layer:1,s:0});board.add(lineCard('w-10',1.05,.44,['1–0'],INK.white),0,.3,{z:.012});
  const again=B.stand(S.flipCard(K+'w-again',1.1,.3,'TRY AGAIN',INK.yellow,INK.navy),-1.2,1.5,{layer:3,s:0});
  const mates=[[-4.3,1.3,'#f1b88f'],[-3.4,1.8,'#b27650']].map(([x,z,sk],i)=>B.person(K+`w-m${i}`,x as number,z as number,1.25,{shirt:'casual',hair:i?'curly':'short',skin:sk as string,face:'smile',layer:3}));
  // Right page: Croatia, the goal, the captain and the refugee agency.
  const goalR=B.stand(S.goal(K+'w-goalR',1.7,.85),2.55,-1.8,{layer:1});void goalR;
  const keeperR=B.person(K+'w-kR',2.55,-1.35,1.3,{shirt:'keeper',hair:'bald',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const A2=B.person(K+'w-a2',1.6,.45,1.3,{shirt:'casual',...PHONZIE,legs:'kick',face:'grin',layer:2});
  const boom=B.stand(pow('w-pow',.28),2.3,-1.3,{layer:2,s:0,tab:false});const first=B.stand(lineCard('w-first',1.6,.5,['FIRST GOAL!'],INK.yellow),3.3,.9,{layer:3,s:0});
  const cap=B.stand(S.flipCard(K+'w-cap',1.0,.3,'CAPTAIN',INK.yellow,INK.navy),.9,1.35,{layer:3,s:0});
  const earth=B.stand(globe('w-globe',.36),4.45,-1.75,{layer:1,s:0});const unhcr=B.stand(lineCard('w-unhcr',1.6,.6,['UN REFUGEE AGENCY','AMBASSADOR'],INK.sky,INK.navy),3.95,-.35,{layer:2,s:0});
  const kidsR=[[3.3,1.8,'#7f5138','bun'],[4.2,1.5,'#d99a6c','short'],[2.4,1.9,'#b27650','curly']].map(([x,z,sk,hr],i)=>B.person(K+`w-k${i}`,x as number,z as number,.85,{shirt:(['bib','fan','casual'] as const)[i],hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const ball=ballPair(B,'w-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,24.8):b.t;
   since.s=beat(t,2.4,3.2);A.body.s=beat(t,2,2.8);mates.forEach((m,i)=>{m.body.s=beat(t,4+i*.4,4.8+i*.4);cheer(m,beat(t,5+i*.3,5.6+i*.3)*(1-beat(t,7.6,8.2)));});
   // Penalty against Belgium: saved.
   let bx=-2.3,bz=.3,dy=0,vis=t<17;
   if(t>=11&&t<12){const u=t-11;bx=-2.3-.4*u;bz=.3-1.6*u;dy=.25*Math.sin(u*Math.PI);}else if(t>=12&&t<17){bx=-2.8;bz=-1.1;dy=.3;}
   const save=pulse(t,11.2,13.4);keeperL.body.rot=-.7*save;keeperL.armL.rot=-.12-2*save;keeperL.armR.rot=.12+2*save;A.leg!.rot=-1*pulse(t,10.7,11.3);
   saved.s=beat(t,12.6,13.3)*(1-beat(t,21,22));board.s=beat(t,15,15.8);const rn=beat(t,13,14.2)*(1-beat(t,19,21));rain.scale=rn;rain.visible=rn>.02;A.body.yaw=-.35*pulse(t,13.4,17.4);
   again.s=beat(t,17.4,18.2);cheer(A,beat(t,18.2,18.8)*(1-beat(t,20.4,21)));
   // Four days later, against Croatia.
   A2.body.s=beat(t,17.6,18.4);keeperR.body.s=beat(t,18,18.8);
   const kick=Math.max(beat(t,25.2,26.2),manual?beat(act,0,.6):0);
   if(t>=17.6||manual){vis=true;if(kick<=0){bx=2.0;bz=.55;}else{bx=2.0+.5*kick;bz=.55-2.1*kick;dy=.35*Math.sin(kick*Math.PI);}}
   ball(bx,bz,dy,vis);A2.leg!.rot=-1.1*Math.max(pulse(t,24.9,25.6),manual?pulse(act,0,.3):0);keeperR.body.rot=-.8*Math.max(pulse(t,25.4,26.8),manual?pulse(act,.1,.7):0);
   boom.s=Math.max(beat(t,26,26.3)*(1-beat(t,28,28.4)),manual?beat(act,.55,.7):0);first.s=Math.max(beat(t,26.4,27.2),manual?beat(act,.6,.9):0);
   cheer(A2,Math.max(beat(t,26.4,27)*(1-beat(t,28.6,29.2)),beat(t,39,39.6),manual?beat(act,.8,1):0));
   fw.forEach((f,i)=>{const a=Math.max(beat(t,26.4+i*.4,27.4+i*.4),manual?beat(act,.7+i*.08,.85+i*.08):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   conf.visible=t>26||manual;conf.dy=-1.1+1.3*(manual?beat(act,.7,1):beat(t,26.6,29));
   // Captain, and ambassador for the UN refugee agency.
   cap.s=beat(t,28.8,29.6);earth.s=beat(t,31.4,32.2);earth.rot=.1*t;unhcr.s=beat(t,32.2,33);kidsR.forEach((p,i)=>{p.body.s=beat(t,33.4+i*.4,34.2+i*.4);cheer(p,beat(t,35.2+i*.3,35.8+i*.3));});
   A2.armR.rot+=.9*beat(t,34,34.6);mates.forEach((m,i)=>{if(t>38)cheer(m,beat(t,38.6+i*.3,39.2+i*.3));});cheer(A,Math.max(beat(t,18.2,18.8)*(1-beat(t,20.4,21)),beat(t,39.2,39.8)));
   return b.narrated?-.4*beat(t,1.4,2.4)+.4*beat(t,17,17.8)+.45*beat(t,17.8,18.6)-.45*beat(t,37.6,38.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={camp,canada,freefootie,vancouver,citizen,worldcup};
void pulse;
