/**
 * The six Saka pop-up spreads (after the penalty): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/saka/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The online racist abuse is shown gently and symbolically: wordless jagged bubbles and a storm that a shield and hearts push back.
 * Kits are plain (white for England, red-pink for his club), with no crests or logos.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='saka-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const BUK={skin:'#5a3a28',hair:'short' as const,hairColor:'#17110d'};
const ENG=[INK.white,INK.red,INK.white,INK.navy,INK.white,INK.red];

/* ───────────── page print helpers (solid ink) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){bar(k,x,y,x+w,y,lw,c);bar(k,x+w,y,x+w,y+h,lw,c);bar(k,x+w,y+h,x,y+h,lw,c);bar(k,x,y+h,x,y,lw,c);}
function ring(k:Kit,x:number,y:number,r:number,lw=.04,c:string=INK.white){k.fill(ell(x,y,r+lw/2,r+lw/2),c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function pavement(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#c9c3b5');k.dots(p,'#8e8878',.05,.2);for(let y=.4;y<PAGE_D;y+=.55)bar(k,x0,y,x1,y,.025,'#aaa394');for(let x=x0+.3;x<x1;x+=.7)for(let y=.4;y<PAGE_D;y+=1.1)bar(k,x,y,x,y+.55,.025,'#aaa394');}
function floor(k:Kit,x0:number,x1:number,tone:string,dot:string){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,dot,.06,(x,y)=>.16+.08*Math.sin(x*1.3+y));}
function caption(k:Kit,x:number,big:string,small:string,c:string=INK.navy,bigC:string=INK.pink,max=4.2){k.text(big,x,Z(2.62),.42,bigC,{max,weight:900});k.text(small,x,Z(2.92),.15,c,{weight:800,max});}
function penaltyBox(k:Kit,x0:number,x1:number){bar(k,x0,Z(-2.05),x1,Z(-2.05),.05);const cx=(x0+x1)/2;box(k,cx-1.5,Z(-2.05),3.0,1.3,.05);box(k,cx-.7,Z(-2.05),1.4,.5,.05);k.fill(ell(cx,Z(-.1),.07,.07),INK.white);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<16;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.45,.022,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function terraces(k:Kit,w:number,y:number){for(let i=0;i<9;i++){const x=i*.5,h=1.0+(i%2)*.08,b=rect(x,y-h,.5,h);k.fill(b,i%3===1?'#b86a4f':'#a95c45');k.dots(b,'#6e3527',.04,.3);k.key(b,.01);
 k.fill(poly([[x-.02,y-h],[x+.25,y-h-.22],[x+.52,y-h]]),'#5d6a86');k.keyFill(rect(x+.36,y-h-.3,.07,.14),'#8e5a48');
 for(const wy of [y-h+.18,y-h+.52])k.fill(rect(x+.08,wy,.14,.2),INK.yellow);k.fill(rect(x+.3,y-.34,.13,.34),[INK.blue,INK.red,INK.green][i%3]);k.fill(rect(x+.3,y-h+.52,.14,.2),INK.sky2);}}
function skyline(k:Kit,w:number,y:number,cs=['#8f95ad','#a3a8bd','#7e849e']){for(let i=0;i<12;i++){const x=i*w/12,h=.4+((i*7)%5)*.14,b=rect(x,y-h,w/12-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.07,.06),INK.yellow,.75);}}
function arch(k:Kit,w:number,y:number){k.key(`M${w*.08} ${y} Q${w*.5} ${y-2.2} ${w*.92} ${y}`,.07,INK.white);k.key(`M${w*.08} ${y} Q${w*.5} ${y-2.2} ${w*.92} ${y}`,.02,INK.grey);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#6f7590');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86,weight:900}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const qCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.fill(ell(w/2,h*.46,w*.26,w*.26),INK.white);k.text('?',w/2,h*.56,h*.34,INK.navy,{weight:900});},{rim:.015});
const board=(key:string,w:number,h:number,title:string,band:string=INK.navy)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.15),band);k.text(title,w/2,h*.115,h*.08,INK.yellow,{max:w*.86,weight:900});});
const faceCard=(key:string,w:number,h:number,label:string,skin:string,bg:string,beard=false)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,bg);k.dots(b,INK.navy,.03,.15);k.key(b,.012);const x=w/2,y=h*.38,r=w*.18;
 k.fill(`M${x-r*1.4} ${y+r*2.3} Q${x} ${y+r*.8} ${x+r*1.4} ${y+r*2.3} Z`,INK.navy);k.fill(ell(x,y,r,r*1.12),skin);k.key(ell(x,y,r,r*1.12),.012);k.fill(`M${x-r} ${y-r*.3} Q${x} ${y-r*1.45} ${x+r} ${y-r*.3} Q${x} ${y-r*.8} ${x-r} ${y-r*.3} Z`,'#17110d');
 k.circle(x-r*.36,y,r*.12,INK.white);k.circle(x+r*.36,y,r*.12,INK.white);k.circle(x-r*.36,y,r*.06,INK.navy);k.circle(x+r*.36,y,r*.06,INK.navy);k.key(`M${x-r*.38} ${y+r*.48} Q${x} ${y+r*.72} ${x+r*.38} ${y+r*.48}`,.014,INK.white);
 if(beard)k.fill(`M${x-r*.8} ${y+r*.3} Q${x} ${y+r*1.35} ${x+r*.8} ${y+r*.3} Q${x} ${y+r*.9} ${x-r*.8} ${y+r*.3} Z`,'#17110d');
 k.fill(rect(0,h*.8,w,h*.2),INK.white);k.text(label,w/2,h*.95,h*.12,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const anchor=(key:string,s:number)=>sp(key,s,s,k=>{const c=INK.navy;k.key(ell(s/2,s*.14,s*.08,s*.08),s*.05,c);k.keyFill(rect(s*.46,s*.2,s*.08,s*.62),c);k.keyFill(rect(s*.28,s*.3,s*.44,s*.07),c);
 k.key(`M${s*.12} ${s*.6} Q${s*.18} ${s*.92} ${s/2} ${s*.92} Q${s*.82} ${s*.92} ${s*.88} ${s*.6}`,s*.07,c);k.fill(poly([[s*.04,s*.64],[s*.2,s*.54],[s*.18,s*.72]]),c);k.fill(poly([[s*.96,s*.64],[s*.8,s*.54],[s*.82,s*.72]]),c);},{rim:.02});
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#b86a4f');k.dots(b,'#6e3527',.04,.25);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.08],[w+.05,h*.32]]);k.fill(roof,'#5d6a86');k.key(roof,.014);
 for(let i=0;i<4;i++){const wx=w*(.08+i*.24);k.fill(rect(wx,h*.5,w*.14,h*.18),INK.sky2);k.key(rect(wx,h*.5,w*.14,h*.18),.01);}
 const d=rect(w*.42,h*.72,w*.16,h*.28);k.fill(d,INK.navy);k.key(d,.012);const s=rect(w*.18,h*.34,w*.64,h*.12);k.fill(s,INK.white);k.key(s,.01);k.text('SCHOOL',w/2,h*.435,h*.085,INK.navy,{max:w*.58,weight:900});});
const reportCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);k.fill(rect(0,0,w,h*.2),INK.blue);k.text('EXAMS',w/2,h*.16,h*.12,INK.white,{weight:900});
 for(let i=0;i<7;i++){const x=w*(.14+(i%4)*.24),y=h*(.46+Math.floor(i/4)*.3);k.fill(ell(x,y,w*.1,w*.1),i<4?INK.gold:INK.yellow);k.key(ell(x,y,w*.1,w*.1),.01);k.text(i<4?'A*':'A',x,y+w*.045,w*.1,INK.navy,{weight:900});}},{rim:.015});
const chilli=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.2} ${h*.2} Q${w*.1} ${h*.7} ${w*.55} ${h*.95} Q${w*.98} ${h} ${w*.8} ${h*.8} Q${w*.45} ${h*.66} ${w*.46} ${h*.22} Z`;k.fill(p,INK.red);k.dots(p,'#9c2a22',.03,.3);k.key(p,.014);
 k.fill(`M${w*.18} ${h*.24} Q${w*.3} ${h*.08} ${w*.5} ${h*.24} Z`,INK.green);k.key(`M${w*.33} ${h*.16} Q${w*.34} ${h*.02} ${w*.46} 0`,.03,INK.green);},{rim:.02});
const heightChart=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);for(let i=0;i<16;i++){const y=h-.08-i*(h-.16)/15;k.key(`M0 ${y} L${i%5===0?w*.6:w*.3} ${y}`,.01,INK.navy);}const top=rect(0,0,w,h*.16);k.fill(top,INK.orange);k.text('TALL?',w/2,h*.12,h*.06,INK.white,{max:w*.86,weight:900});});
const shirtFlap=(key:string,w:number,h:number,c:string,label:string)=>sp(key,w,h,k=>{const p=poly([[w*.22,0],[w*.38,0],[w*.5,h*.1],[w*.62,0],[w*.78,0],[w,h*.22],[w*.86,h*.36],[w*.78,h*.3],[w*.78,h],[w*.22,h],[w*.22,h*.3],[w*.14,h*.36],[0,h*.22]]);k.fill(p,c);k.dots(p,INK.navy,.035,.2);k.key(p,.014);
 k.fill(poly([[w*.38,0],[w*.5,h*.1],[w*.62,0],[w*.58,0],[w*.5,h*.06],[w*.42,0]]),INK.white);k.text(label,w/2,h*.6,h*.14,INK.white,{weight:900,max:w*.5});},{rim:.015});
const spot=(key:string,w:number,label:string,c:string)=>sp(key,w,w*.5,k=>{const e=ell(w/2,w*.18,w*.3,w*.12);k.fill(e,c);k.key(e,.012);const b=rect(w*.05,w*.3,w*.9,w*.18);k.fill(b,INK.white);k.key(b,.01);k.text(label,w/2,w*.44,w*.12,INK.navy,{weight:900,max:w*.84});},{rim:.015});
const phone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#1e2233');k.key(b,.02);const sc=rect(w*.08,h*.07,w*.84,h*.84);k.fill(sc,'#39405e');k.dots(sc,INK.blue,.04,.3);k.fill(ell(w/2,h*.955,w*.05,w*.05),INK.grey);
 for(let i=0;i<5;i++){const y=h*(.14+i*.15),x=i%2?w*.3:w*.14,bw=w*.56;k.fill(rect(x,y,bw,h*.1),'#5b6280');for(let j=0;j<3;j++)k.key(`M${x+bw*.1} ${y+h*(.03+j*.025)} l${bw*(.3+.25*((i+j)%2))} 0`,.012,'#8a90aa');}},{rim:.02});
const jag=(key:string,w:number,h:number,c='#4a4f66')=>sp(key,w,h,k=>{const pts:number[][]=[];const n=14;for(let i=0;i<n;i++){const a=i/n*TAU,rr=i%2?.36:.5;pts.push([w/2+Math.cos(a)*w*rr,h*.45+Math.sin(a)*h*rr*.8]);}const p=poly(pts);k.fill(p,c);k.hatch(p,INK.navy,.04,.6,.01);k.key(p,.014);
 k.fill(poly([[w*.3,h*.72],[w*.2,h],[w*.46,h*.76]]),c);for(let i=0;i<3;i++)k.key(`M${w*.3} ${h*(.34+i*.1)} Q${w*.4} ${h*(.28+i*.1)} ${w*.5} ${h*(.36+i*.1)} T${w*.7} ${h*(.34+i*.1)}`,.014,'#9aa0b5');},{rim:.018});
const shield=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.5} ${h} Q${w*.02} ${h*.72} ${w*.04} ${h*.12} L${w*.5} 0 L${w*.96} ${h*.12} Q${w*.98} ${h*.72} ${w*.5} ${h} Z`;k.fill(p,INK.blue);k.dots(p,INK.navy,.04,.25);k.key(p,.02);
 const i=`M${w*.5} ${h*.9} Q${w*.14} ${h*.68} ${w*.15} ${h*.2} L${w*.5} ${h*.1} L${w*.85} ${h*.2} Q${w*.86} ${h*.68} ${w*.5} ${h*.9} Z`;k.key(i,.02,INK.white);
 const s=w*.2,hx=w/2,hy=h*.5;k.fill(`M${hx} ${hy+s*.6} C${hx-s} ${hy} ${hx-s*.5} ${hy-s*.9} ${hx} ${hy-s*.35} C${hx+s*.5} ${hy-s*.9} ${hx+s} ${hy} ${hx} ${hy+s*.6} Z`,INK.pink);k.key(`M${hx} ${hy+s*.6} C${hx-s} ${hy} ${hx-s*.5} ${hy-s*.9} ${hx} ${hy-s*.35} C${hx+s*.5} ${hy-s*.9} ${hx+s} ${hy} ${hx} ${hy+s*.6} Z`,.012);},{rim:.02});
const speech=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{const p=`M${w*.06} ${h*.05} L${w*.94} ${h*.05} Q${w} ${h*.05} ${w} ${h*.16} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.34} ${h*.74} L${w*.16} ${h} L${w*.2} ${h*.74} L${w*.06} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.16} Q0 ${h*.05} ${w*.06} ${h*.05} Z`;k.fill(p,INK.white);k.key(p,.014);
 lines.forEach((l,i)=>k.text(l,w/2,h*(.34+i*.24),h*.17,INK.navy,{weight:900,max:w*.86}));},{rim:.015});
const lectern=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[w*.1,h*.3],[w*.9,h*.3],[w*.78,h],[w*.22,h]]);k.fill(p,INK.wood);k.dots(p,INK.brown,.035,.35);k.key(p,.014);k.fill(rect(w*.04,h*.24,w*.92,h*.08),INK.brown);k.key(`M${w*.5} ${h*.24} L${w*.56} ${h*.06}`,.02);k.fill(ell(w*.57,h*.05,w*.05,w*.05),INK.navy);
 const s=w*.14,hx=w/2,hy=h*.6;k.fill(`M${hx} ${hy+s*.6} C${hx-s} ${hy} ${hx-s*.5} ${hy-s*.9} ${hx} ${hy-s*.35} C${hx+s*.5} ${hy-s*.9} ${hx+s} ${hy} ${hx} ${hy+s*.6} Z`,INK.pink);});
const mural=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.2,h*.86,w*.06,h*.14),'#2b2b33');k.keyFill(rect(w*.74,h*.86,w*.06,h*.14),'#2b2b33');const f=rect(0,0,w,h*.88);k.fill(f,'#2b2b33');k.key(f,.016);const sc=rect(w*.04,h*.05,w*.92,h*.78);k.fill(sc,INK.yellow);k.dots(sc,INK.pink,.04,(x,y)=>.2+.3*y/h);
 for(let i=0;i<3;i++){const x=w*(.22+i*.28),y=h*.36,r=w*.07;k.fill(`M${x-r*1.8} ${h*.83} L${x-r*1.4} ${y+r*1.4} Q${x} ${y+r*.9} ${x+r*1.4} ${y+r*1.4} L${x+r*1.8} ${h*.83} Z`,INK.white);k.key(`M${x-r*1.8} ${h*.83} L${x-r*1.4} ${y+r*1.4} Q${x} ${y+r*.9} ${x+r*1.4} ${y+r*1.4} L${x+r*1.8} ${h*.83}`,.012);k.fill(ell(x,y,r,r*1.15),['#5a3a28','#4a3024','#6b4430'][i]);k.key(ell(x,y,r,r*1.15),.012);}
 for(let i=0;i<5;i++){const s=w*.035,hx=w*(.1+i*.2),hy=h*.14;k.fill(`M${hx} ${hy+s*.6} C${hx-s} ${hy} ${hx-s*.5} ${hy-s*.9} ${hx} ${hy-s*.35} C${hx+s*.5} ${hy-s*.9} ${hx+s} ${hy} ${hx} ${hy+s*.6} Z`,INK.red);}});
const heartCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);const s=w*.8,hx=w/2,hy=h*.46;const p=`M${hx} ${hy+s*.42} C${hx-s*.62} ${hy} ${hx-s*.36} ${hy-s*.62} ${hx} ${hy-s*.24} C${hx+s*.36} ${hy-s*.62} ${hx+s*.62} ${hy} ${hx} ${hy+s*.42} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.text('LIFT',w/2,h*.93,h*.12,INK.navy,{weight:900});},{rim:.015});
const keeperGoal=(B:Builder,key:string,x:number,z:number,skin:string)=>{B.stand(S.goal(K+key+'-goal',1.8,.9),x,z,{layer:1});return B.person(K+key+'-gk',x,z+.4,1.4,{shirt:'keeper',hair:'short',skin,face:'open',layer:2,holdL:'glove',holdR:'glove'});};

/* ───────────── 1 · A family in Ealing (ealing) ───────────── */
const ealing:SpreadDef={id:'ealing',rest:17.8,
 left:k=>{pavement(k,-5,0);bar(k,-5,Z(-.9),0,Z(-.9),.06,'#8e8878');caption(k,-2.5,'EALING','LONDON · 2001',INK.navy,INK.red);},
 right:k=>{pavement(k,0,5);caption(k,2.5,'GROUNDED','AND HUMBLE',INK.navy,INK.blue);},
 build:B=>{
  const bd=B.vfold({key:K+'e-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#cfd6e3',INK.sky,y=>.5-y/3*.4);terraces(k,4.5,2.4);k.fill(rect(0,2.4,4.5,.6),'#c9c3b5');}},
   {key:K+'e-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);for(let i=0;i<14;i++)k.circle(.3+i*.3,1.2-Math.sin(i/13*Math.PI)*.8,.03,INK.navy);skyline(k,4.5,2.4,['#b8a07e','#a88f6e','#c7b08e']);k.fill(rect(0,2.4,4.5,.6),'#c9c3b5');}},-3.05,1.22);
  const cl=bd.add(S.cloud(K+'e-cl',1.0,.45),'L',1.4,2.7),sun=bd.add(S.sun(K+'e-sun',.3),'R',3.8,2.4,{out:.012});
  const planeP=bd.add(S.plane(K+'e-plane',.7,.35),'R',4.2,2.2,{out:.035});
  const sign=B.stand(S.sign(K+'e-sign',1.1,1.15,'EALING'),-.8,-1.3,{layer:1});const c01=sign.flap(S.flipCard(K+'e-2001',.85,.36,'2001',INK.red),0,1.15*.56,{z:.03});
  B.stand(S.lamp(K+'e-lamp',.3,1.4),-4.6,-1.0,{layer:1});
  const boy=B.person(K+'e-boy',-2.8,.9,.85,{shirt:'casual',...BUK,face:'grin',layer:3});
  const mum=B.person(K+'e-mum',-.6,.3,1.55,{shirt:'coach',hair:'bun',hairColor:'#17110d',adult:true,skin:'#6b4430',face:'smile',layer:2,holdL:'suitcase'});
  const dad=B.person(K+'e-dad',-.3,1.0,1.7,{shirt:'navy',hair:'short',hairColor:'#17110d',adult:true,skin:'#4a3024',face:'smile',layer:2,holdR:'suitcase'});
  const tags=[B.stand(S.flipCard(K+'e-tagA',.9,.28,'ADENIKE',INK.pink),-3.9,.1,{layer:2,s:0}),B.stand(S.flipCard(K+'e-tagY',.8,.28,'YOMI',INK.blue),-1.4,1.9,{layer:3,s:0})];
  const nig=B.stand(S.flipCard(K+'e-nig',1.2,.32,'FROM NIGERIA',INK.green),-3.3,-.5,{layer:2,s:0});
  const sch=B.stand(school('e-school',1.7,1.45),1.3,-1.5,{layer:1,s:0});const rep=B.stand(reportCard('e-rep',.9,.7),2.7,-.7,{layer:2,s:0});
  const boy2=B.person(K+'e-boy2',1.9,.3,1.05,{shirt:'casual',...BUK,face:'smile',layer:2});
  const bd2=B.stand(board('e-board',1.5,1.55,'WHO KEPT HIM STEADY?'),3.9,-1.45,{layer:1,s:0});bd2.add(faceCard('e-dadc',.86,.98,'DAD · YOMI','#4a3024',INK.yellow),0,.33,{z:.012});const flap=bd2.flap(qCover('e-q',.9,1.02,INK.orange),0,1.34,{z:.024});
  const dad2=B.person(K+'e-dad2',3.4,.7,1.7,{shirt:'navy',hair:'short',hairColor:'#17110d',adult:true,skin:'#4a3024',face:'smile',layer:3});
  const insp=B.stand(S.flipCard(K+'e-insp',1.2,.32,'INSPIRATION',INK.pink),4.3,1.3,{layer:2,s:0});
  const anc=B.stand(anchor('e-anchor',.8),.8,1.1,{layer:3,s:0});const words=[B.stand(S.flipCard(K+'e-gr',1.0,.3,'GROUNDED',INK.blue),.9,1.9,{layer:3,s:0}),B.stand(S.flipCard(K+'e-hu',.9,.3,'HUMBLE',INK.teal),2.2,1.95,{layer:3,s:0})];
  const hearts=[0,1,2].map(i=>B.stand(heart(`e-heart${i}`,.26),2.9+i*.5,2.1,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.8):b.t;
   cl.dx=.5*beat(t,0,36);sun.dy=.5*beat(t,0,3);c01.flip=-2.9+2.9*beat(t,2.6,3.4);boy.body.s=beat(t,4,4.8);boy.armR.rot=.12+1.6*beat(t,5,5.5)-1.6*beat(t,7,7.5);
   planeP.visible=t>7&&t<12.6;planeP.dx=-3.9*beat(t,7.3,12.4);planeP.dy=.3*Math.sin(beat(t,7.3,12.4)*Math.PI);
   nig.s=beat(t,8.2,9)*(1-beat(t,16.4,17));
   const walk=beat(t,8,11.4);mum.body.s=beat(t,7.4,8.2);dad.body.s=beat(t,7.8,8.6);mum.body.x=-.6-2.9*walk;dad.body.x=-.3-1.6*walk;mum.body.dy=dad.body.dy=.03*Math.abs(Math.sin(t*6))*(t>8&&t<11.4?1:0);
   tags.forEach((g,i)=>{g.s=beat(t,11.4+i*.4,12+i*.4)*(1-beat(t,16.6,17.2));});mum.armR.rot=.12+1.4*beat(t,12,12.6)*(1-beat(t,15,15.6));
   sch.s=beat(t,13.2,14);boy2.body.s=beat(t,13.8,14.6);rep.s=beat(t,15,15.8);cheer(boy2,beat(t,16,16.6)*(1-beat(t,17.4,18)));
   bd2.s=beat(t,16.6,17.4);const lift=Math.max(beat(t,18.6,19.8),manual?beat(act,0,.7):0);flap.flip=-2.9*lift;
   dad2.body.s=Math.max(beat(t,21,21.8),manual?beat(act,.5,.8):0);dad2.armR.rot=.12+2*beat(t,22,22.6)*(1-beat(t,25,25.6));insp.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.7,1):0);
   anc.s=beat(t,26,26.8);words.forEach((w,i)=>{w.s=beat(t,27.4+i*1.6,28.1+i*1.6);});
   const hug=beat(t,31.6,32.4);dad2.armL.rot=-.12-.9*hug;boy2.armR.rot+=1.1*hug;hearts.forEach((h,i)=>{h.s=beat(t,32.2+i*.5,32.8+i*.5);});
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,12.6,13.4)+.45*beat(t,17.2,18)-.45*beat(t,25.6,26.6):0;
  };
 }};

/* ───────────── 2 · Little Chilli (haleend) ───────────── */
const haleend:SpreadDef={id:'haleend',rest:21.1,
 left:k=>{pitch(k,-5,0,'#8fc467','#6fae5c');box(k,-4.6,Z(-2.0),4.2,3.4,.05);ring(k,-2.5,Z(-.3),.06);caption(k,-2.5,'HALE END','ACADEMY · AGED 7',INK.navy,INK.red);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);caption(k,2.5,'FIRST TEAM','2018 · AGED 17',INK.navy,INK.pink);},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);for(let i=0;i<7;i++){const x=.3+i*.65,t=blob([[x-.28,2.0],[x-.3,1.5],[x,1.1+(i%2)*.1],[x+.3,1.5],[x+.28,2.0]]);k.fill(t,INK.leaf);k.dots(t,INK.green,.04,.4);k.key(t,.01);}
    for(let x=.1;x<4.5;x+=.18)k.key(`M${x} 1.8 L${x} 2.35`,.012,'#5d6a86');k.key('M0 1.9 L4.5 1.9 M0 2.2 L4.5 2.2',.012,'#5d6a86');k.fill(rect(0,2.35,4.5,.65),'#8fc467');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.0,2.4,[INK.red,INK.white,INK.red,INK.yellow,INK.white],2);lightRig(k,1.0,.2);lightRig(k,3.6,.25);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'h-sun',.34),'L',3.7,1.2,{out:.012});
  const sign=B.stand(S.sign(K+'h-sign',1.1,1.15,'HALE END'),-.8,-1.5,{layer:1});const c7=sign.flap(S.flipCard(K+'h-7',.85,.36,'AGE 7',INK.red),0,1.15*.56,{z:.03});
  const kid=B.person(K+'h-kid',-2.6,.6,.95,{shirt:'coach',...BUK,face:'grin',legs:'kick',layer:2});
  const bigs=[[-3.5,.1,'#f1b88f','curly'],[-1.7,.2,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`h-big${i}`,x as number,z as number,1.3,{shirt:'coach',hair:hr as 'short',skin:sk as string,face:'smile',layer:2}));
  const chart=B.stand(heightChart('h-chart',.35,1.6),-4.4,-.6,{layer:1,s:0});
  const chil=B.stand(chilli('h-chilli',.55,.7),-4.3,1.4,{layer:3,s:0});const lc=B.stand(S.flipCard(K+'h-lc',1.3,.34,'LITTLE CHILLI',INK.red),-3.0,1.95,{layer:3,s:0});
  const zaps=[0,1,2].map(i=>B.stand(pow(`h-zap${i}`,.16),-3.1+i*.55,-.8+(i%2)*.3,{layer:1,s:0,tab:false}));
  const coach=B.person(K+'h-coach',-.9,.8,1.65,{shirt:'navy',hair:'short',adult:true,skin:'#e8b48f',face:'smile',layer:3});
  const note=B.stand(lineCard('h-note',1.2,.5,['STOOD OUT','GOOD CHARACTER'],INK.yellow,INK.navy),-1.15,1.95,{layer:3,s:0});
  const shirtB=B.stand(board('h-shirtb',1.3,1.3,'FLIP THE SHIRT',INK.red),1.0,-1.35,{layer:1,s:0});shirtB.add(lineCard('h-ft',.9,.66,['FIRST TEAM','2018'],INK.yellow,INK.navy),0,.36,{z:.012});
  const shirt=shirtB.flap(shirtFlap('h-shirt',1.0,.84,INK.pink,'ACADEMY'),0,1.08,{z:.024});
  const H2=B.person(K+'h-buk2',2.3,.4,1.2,{shirt:'coach',...BUK,face:'smile',layer:2});
  const spots=[B.stand(spot('h-wing',1.2,'WING',INK.yellow),3.5,-.9,{layer:1,s:0}),B.stand(spot('h-lb',1.2,'LEFT-BACK',INK.sky),3.9,.75,{layer:2,s:0})];
  const mates=[[1.2,1.3,'#b27650'],[4.6,-.2,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`h-m${i}`,x as number,z as number,1.2,{shirt:'coach',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`h-heart${i}`,.26),2.0+i*.5,1.95,{layer:3,s:0}));
  const ball=B.stand(S.ball(K+'h-ball',.1),-2.2,.75,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.1):b.t;
   sun.dy=.5*beat(t,0,2);c7.flip=-2.9+2.9*beat(t,1.8,2.6);kid.body.s=beat(t,3,3.8);ball.s=beat(t,3.8,4.4);const kick=t>4.4&&t<6.4;ball.dy=.3*Math.abs(Math.sin((t-4.4)*4))*(kick?1:0);kid.leg!.rot=-.7*Math.abs(Math.sin((t-4.4)*4))*(kick?1:0);
   bigs.forEach((p,i)=>{p.body.s=beat(t,6.6+i*.3,7.4+i*.3);});chart.s=beat(t,7.2,8);
   chil.s=beat(t,10.4,11.2);lc.s=beat(t,11,11.8);zaps.forEach((z,i)=>{z.s=pulse(t,12.4+i*.5,13.6+i*.5)+beat(t,14.6,15)*(1-beat(t,20,20.6));});cheer(kid,beat(t,12,12.6)*(1-beat(t,15.4,16)));
   coach.body.s=beat(t,16.2,17);coach.armR.rot=.12+1.4*beat(t,17,17.6)*(1-beat(t,20.4,21));note.s=beat(t,17.8,18.6);
   shirtB.s=beat(t,19.8,20.8);const flip=Math.max(beat(t,21.6,22.8),manual?beat(act,0,.6):0);shirt.flip=-2.9*flip;
   H2.body.s=Math.max(beat(t,23.2,24),manual?beat(act,.5,.8):0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,24.6+i*.4,25.4+i*.4),manual?beat(act,.6,.9):0);cheer(m,Math.max(beat(t,26+i*.3,26.6+i*.3)*(1-beat(t,28.4,29)),beat(t,35+i*.3,35.6+i*.3),manual?beat(act,.8,1):0));});
   cheer(H2,Math.max(beat(t,25.6,26.2)*(1-beat(t,28.4,29)),manual?beat(act,.85,1):0));
   spots.forEach((s,i)=>{s.s=beat(t,29.2+i*1.4,29.9+i*1.4);});const mv=track(t,[[0,2.3,.4],[30.2,2.3,.4],[31.4,3.4,-.55],[32.2,3.4,-.55],[33.4,3.8,.95]]);H2.body.x=mv[0];H2.body.z=mv[1];
   hearts.forEach((h,i)=>{h.s=beat(t,34.6+i*.5,35.2+i*.5);});
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,19.6,20.6)+.45*beat(t,22.6,23.4)-.45*beat(t,34,35):0;
  };
 }};

/* ───────────── 3 · The fifth penalty (fifth) ───────────── */
const fifth:SpreadDef={id:'fifth',rest:27.9,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);bar(k,-.03,0,-.03,PAGE_D,.05);k.fill(ell(0,Z(0),1.05,1.05),INK.white);k.fill(ell(0,Z(0),1.0,1.0),'#3f7f5a');k.dots(ell(0,Z(0),1.0,1.0),INK.navy,.08,.1);
  caption(k,-2.5,'EURO 2020 FINAL','WEMBLEY · 11 JULY 2021',INK.white,INK.yellow);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);penaltyBox(k,0,5);bar(k,.03,0,.03,PAGE_D,.05);caption(k,2.5,'THE FIFTH PENALTY','HIS FIRST FOR ENGLAND’S SENIOR TEAM',INK.white,INK.yellow);},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);arch(k,4.5,1.25);crowd(k,4.5,1.25,2.6,ENG,1);lightRig(k,.8,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#24356a');crowd(k,4.5,1.2,2.6,ENG,4);lightRig(k,1.2,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const sb=B.stand(S.scoreboard(K+'f-sb',1.8,1.4,'EURO 2020 FINAL'),-3.9,-1.5,{layer:1});sb.add(lineCard('f-ita',1.44,.64,['ITALY','WON'],INK.white,INK.navy),0,.38,{z:.012});
  const fl=[['SHOOT-OUT','#3d5da0'],['ENGLAND v ITALY',INK.red]].map(([l,c],i)=>sb.flap(lineCard(`f-f${i}`,1.44,.64,[l],c,INK.white),0,1.02,{z:.024+i*.006}));
  const age=B.stand(S.flipCard(K+'f-age',.9,.32,'AGE 19',INK.orange),-.8,-1.6,{layer:1,s:0});
  const subB=B.stand(lineCard('f-sub',.9,.5,['ON','SUB'],INK.yellow,INK.navy),-.6,-.6,{layer:2,s:0});
  const queue=[[-4.3,.9,'#f1b88f'],[-3.6,1.0,'#d99a6c'],[-2.9,1.1,'#b27650'],[-2.2,1.2,'#e8b48f']].map(([x,z,sk],i)=>B.person(K+`f-q${i}`,x as number,z as number,1.25,{shirt:'ger',hair:(['short','curly','short','bun'] as const)[i],skin:sk as string,face:'smile',layer:3}));
  const H=B.person(K+'f-buk',-1.3,1.3,1.25,{shirt:'ger',...BUK,face:'open',layer:3});
  const five=B.stand(S.flipCard(K+'f-5',.5,.34,'5',INK.red),-1.3,2.05,{layer:3,s:0});const first=B.stand(lineCard('f-first',1.4,.52,['FIRST SENIOR','PENALTY'],INK.white,INK.navy),-2.0,-1.2,{layer:1,s:0});
  const beatH=B.stand(heart('f-beat',.34,INK.red),-.7,.45,{layer:3,s:0});
  const gk=keeperGoal(B,'f-keep',2.5,-1.7,'#f1b88f');
  const H2=B.person(K+'f-buk2',2.2,.9,1.25,{shirt:'ger',...BUK,face:'open',legs:'kick',layer:3});
  const saved=B.stand(S.flipCard(K+'f-saved',.9,.32,'SAVED',INK.blue),4.2,-.3,{layer:2,s:0});
  const mates=[[1.0,1.5,'#f1b88f'],[3.6,1.5,'#b27650']].map(([x,z,sk],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.25,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,face:'smile',layer:3}));
  const brave=B.stand(heart('f-brave',.36),2.2,1.95,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'f-ball',.1),2.4,.95,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.9):b.t;
   fl[1].flip=-3.2*beat(t,11.8,12.4);fl[0].flip=-3.2*Math.max(beat(t,30.2,30.8),manual?beat(act,.7,.9):0);
   age.s=beat(t,9.6,10.4);subB.s=beat(t,12,12.8)*(1-beat(t,17,17.6));H.body.s=beat(t,12.4,13.2);H.body.x=-1.3+.0*t;
   queue.forEach((q,i)=>{q.body.s=beat(t,15+i*.3,15.8+i*.3);});five.s=beat(t,18.2,19);first.s=beat(t,21.8,22.6)*(1-beat(t,27.4,28));
   beatH.s=beat(t,25.6,26.2)*(1-beat(t,28,28.6))*(1+.18*Math.sin(t*9)*(t>26&&t<28?1:0));H.armL.rot=-.12-.3*pulse(t,25.6,28);
   gk.body.s=beat(t,26.4,27.2);H2.body.s=Math.max(beat(t,26.8,27.6),manual?1:0);ball.s=H2.body.s;
   // Kick: the keeper dives and saves.
   const kk=manual?beat(act,0,.35):beat(t,28.2,29.4);ball.x=2.4+.5*kk;ball.z=.95-2.3*kk;ball.dy=.35*Math.sin(kk*Math.PI)+.25*kk;ball.rot=-kk*8;
   const bounce=manual?beat(act,.35,.6):beat(t,29.4,30.4);ball.z+=.8*bounce;ball.x+=.5*bounce;ball.dy=ball.dy*(1-bounce);
   H2.leg!.rot=-1.1*(manual?pulse(act,0,.2):pulse(t,27.9,28.5));const dive=manual?beat(act,.1,.35)*(1-beat(act,.8,1)*.3):pulse(t,28.4,31.4);gk.body.rot=-.9*dive;gk.body.dx=.3*dive;gk.armL.rot=-.12-2.2*dive;gk.armR.rot=.12+2.2*dive;
   saved.s=Math.max(beat(t,29.8,30.6),manual?beat(act,.5,.8):0);H2.body.yaw=-.2*beat(t,30.6,31.6);
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,31.4+i*.4,32.2+i*.4),manual?beat(act,.8,1):0);const arm=beat(t,33+i*.3,33.6+i*.3);if(i===0)m.armR.rot=.12+1.3*arm;else m.armL.rot=-.12-1.3*arm;});
   brave.s=beat(t,35.4,36.2);
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,25.8,26.6)+.45*beat(t,26.6,27.6)-.45*beat(t,34.6,35.6):(manual?.35*beat(act,0,.2):0);
  };
 }};

/* ───────────── 4 · Unkind words (unkind) ───────────── */
const unkind:SpreadDef={id:'unkind',rest:18.3,
 left:k=>{floor(k,-5,0,'#6d6480','#433c58');caption(k,-2.5,'AFTER THE FINAL','HURTFUL RACIST MESSAGES ONLINE',INK.white,INK.sky);},
 right:k=>{floor(k,0,5,'#e9d9b4','#b9a57c');caption(k,2.5,'NEVER OKAY','BUKAYO SPOKE UP',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'u-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#4a4468',INK.navy,y=>.45-y*.08);skyline(k,4.5,2.5,['#5d566f','#6a6380','#544d66']);k.fill(rect(0,2.5,4.5,.5),'#6d6480');}},
   {key:K+'u-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe0b8',INK.pink,y=>.45-y/3*.4);skyline(k,4.5,2.5,['#c9b79a','#b5a488','#d8c6a6']);k.fill(rect(0,2.5,4.5,.5),'#e9d9b4');}},-3.05,1.22);
  const storm=[bd.add(stormCloud('u-st1',1.4,.7),'L',1.3,2.3,{out:.03}),bd.add(stormCloud('u-st2',1.2,.6),'L',3.3,2.6,{out:.035})];
  const sun=bd.add(S.sun(K+'u-sun',.34),'R',3.4,1.8,{out:.012});
  const ph=B.stand(phone('u-phone',.9,1.5),-4.1,-1.5,{layer:1,s:0});
  const jags=[[-3.0,-1.7,.8],[-2.1,-1.3,.7],[-4.5,-.4,.62],[-1.3,-1.8,.66],[-3.4,-.7,.6]].map(([x,z,w],i)=>B.stand(jag(`u-jag${i}`,w,w*.8),x,z,{layer:1,s:0}));
  const players=[[-3.2,.8,'#5a3a28','short'],[-2.3,1.1,'#4a3024','short'],[-1.4,.8,'#6b4430','short']].map(([x,z,sk,hr],i)=>B.person(K+`u-p${i}`,x as number,z as number,1.25,{shirt:'ger',hair:hr as 'short',hairColor:'#17110d',skin:sk as string,face:i===1?'sad':'shy',layer:3}));
  const names=[['MARCUS',-3.9],['BUKAYO',-2.3],['JADON',-.7]].map(([l,x],i)=>B.stand(S.flipCard(K+`u-n${i}`,.85,.28,l as string,[INK.blue,INK.red,INK.teal][i]),x as number,1.95,{layer:3,s:0}));
  const sh=B.stand(shield('u-shield',1.1,1.3),-2.3,-.25,{layer:2,s:0});
  const H2=B.person(K+'u-buk2',2.0,.6,1.3,{shirt:'casual',...BUK,face:'smile',layer:2});
  const talk=B.stand(speech('u-talk',1.3,.8,['SPEAKING','UP']),2.9,-.9,{layer:2,s:0});
  const card=B.stand(lineCard('u-stop',1.5,.6,['STOP THESE','MESSAGES'],INK.yellow,INK.navy),1.5,-1.5,{layer:1,s:0});const ph2=B.stand(phone('u-phone2',.6,1.0),.6,-.6,{layer:1,s:0});
  const never=B.stand(lineCard('u-never',1.5,.5,['NEVER OKAY'],INK.white,INK.red),-2.3,1.9,{layer:3,s:0});
  const adult=B.person(K+'u-adult',3.8,.9,1.65,{shirt:'coach',hair:'long',adult:true,skin:'#d99a6c',face:'smile',layer:3}),child=B.person(K+'u-child',4.4,1.3,.95,{shirt:'fan',hair:'curly',skin:'#7f5138',face:'smile',layer:3});
  const hearts=[0,1,2].map(i=>B.stand(heart(`u-heart${i}`,.26),2.4+i*.5,1.95,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.3):b.t;
   const shieldUp=Math.max(beat(t,18.6,19.8),manual?beat(act,0,.6):0);
   players.forEach((p,i)=>{p.body.s=beat(t,2.2+i*.4,3+i*.4);});names.forEach((n,i)=>{n.s=beat(t,5.6+i*1.2,6.3+i*1.2)*(1-beat(t,15.6,16.2));});
   ph.s=beat(t,8.8,9.6);const push=shieldUp;jags.forEach((j,i)=>{j.s=beat(t,9.4+i*.5,10+i*.5)*(1-.85*push);j.rot=.05*wave(t,10,18,.9+i*.2);});
   storm.forEach((c,i)=>{show(c,beat(t,12.2+i*.6,13.2+i*.6)*(1-.7*push)*(1-beat(t,30.6,33)));});
   players.forEach((p,i)=>{p.body.yaw=.15*(i-1)*pulse(t,12.4,16);});never.s=beat(t,16.4,17.2);
   sh.s=shieldUp;players[1].armR.rot=.12+.8*shieldUp;
   H2.body.s=Math.max(beat(t,20.4,21.2),manual?beat(act,.4,.7):0);H2.armR.rot=.12+1.5*beat(t,21.4,22)*(1-beat(t,30.2,30.8));talk.s=Math.max(beat(t,21.2,22),manual?beat(act,.6,.9):0);
   ph2.s=beat(t,25,25.8);card.s=beat(t,26,26.8);
   sun.dy=.6*Math.max(beat(t,20,23),manual?beat(act,.4,1):0);
   adult.body.s=beat(t,30.8,31.6);child.body.s=beat(t,31.2,32);adult.armR.rot=.12+1.1*beat(t,32.4,33);hearts.forEach((h,i)=>{h.s=beat(t,33.2+i*.5,33.8+i*.5);});
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,20,21)+.45*beat(t,21,22)-.45*beat(t,34.4,35.4):0;
  };
 }};

/* ───────────── 5 · Hearts and messages (support) ───────────── */
const support:SpreadDef={id:'support',rest:16.9,
 left:k=>{pavement(k,-5,0);caption(k,-2.5,'MANY PEOPLE','STOOD WITH BUKAYO',INK.navy,INK.red);},
 right:k=>{pavement(k,0,5);caption(k,2.5,'MANCHESTER','A DIGITAL MURAL',INK.navy,INK.pink);},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);skyline(k,4.5,2.4);k.fill(rect(0,2.4,4.5,.6),'#c9c3b5');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);for(let r=0;r<10;r++)for(let c=0;c<15;c++){const b=rect(c*.3+(r%2)*.15-.15,.6+r*.18,.28,.16);k.fill(b,(r+c)%3?'#b86a4f':'#a95c45');}k.fill(rect(0,2.4,4.5,.6),'#c9c3b5');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.32),'L',3.6,1.6,{out:.012}),cl=bd.add(S.cloud(K+'s-cl',1.0,.45),'R',1.0,2.7);
  const lec=B.stand(lectern('s-lec',.8,1.0),-3.4,-.9,{layer:2,s:0});const spk=B.person(K+'s-spk',-3.4,-1.5,1.6,{shirt:'navy',hair:'short',adult:true,skin:'#e8b48f',face:'open',layer:1});
  const fa=B.stand(lineCard('s-fa',1.5,.55,['THE FA: WE WILL','SUPPORT THE PLAYERS'],INK.white,INK.navy),-4.1,.3,{layer:2,s:0});
  const leaders=[[-1.6,-1.1,'#f1b88f','short'],[-.8,-.8,'#e8b48f','bald']].map(([x,z,sk,hr],i)=>B.person(K+`s-l${i}`,x as number,z as number,1.6,{shirt:i?'casual':'navy',hair:hr as 'short',adult:true,skin:sk as string,face:'open',layer:1}));
  const spoke=B.stand(S.flipCard(K+'s-spoke',1.3,.32,'LEADERS SPOKE OUT',INK.blue),-4.0,1.3,{layer:3,s:0});
  const hb=B.stand(board('s-hb',2.1,1.3,'LIFT THE HEARTS',INK.red),-1.5,1.2,{layer:3,s:0});
  const covers=['KINDNESS','SUPPORT','TOGETHER'].map((l,i)=>{const x=-2.1/2+.36+i*.69;hb.add(lineCard(`s-w${i}`,.58,.62,[l],[INK.yellow,INK.sky,INK.grass][i],INK.navy),x,.26,{z:.012});return hb.flap(heartCover(`s-hc${i}`,.6,.66,[INK.pink,INK.red,INK.pink][i]),x,.92,{z:.024});});
  const mur=B.stand(mural('s-mural',2.4,1.6),2.5,-1.5,{layer:1,s:0});
  const three=[[1.6,.6,'#6b4430'],[2.5,.9,'#5a3a28'],[3.4,.6,'#4a3024']].map(([x,z,sk],i)=>B.person(K+`s-t${i}`,x as number,z as number,1.25,{shirt:'casual',hair:'short',hairColor:'#17110d',skin:sk as string,face:'smile',layer:2}));
  const ty=B.stand(speech('s-ty',1.2,.7,['THANK','YOU']),4.3,-.2,{layer:2,s:0});
  const fans=[[.6,1.6,'#f1b88f','bun'],[4.5,1.4,'#b27650','curly']].map(([x,z,sk,hr],i)=>B.person(K+`s-fan${i}`,x as number,z as number,1.1,{shirt:'fan',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const hearts=Array.from({length:6},(_,i)=>B.stand(heart(`s-h${i}`,.24,i%2?INK.red:INK.pink),1.0+i*.65,1.95-(i%2)*.35,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   sun.dy=.5*beat(t,0,2);cl.dx=-.4*beat(t,0,36);
   spk.body.s=beat(t,4.8,5.6);lec.s=beat(t,5.2,6);fa.s=beat(t,7.4,8.2);spk.armR.rot=.12+1.2*beat(t,8,8.6)*(1-beat(t,11.4,12));
   leaders.forEach((l,i)=>{l.body.s=beat(t,12+i*.5,12.8+i*.5);l.armR.rot=.12+1.1*beat(t,13.4+i*.4,14+i*.4)*(1-beat(t,16.4,17));});spoke.s=beat(t,13.6,14.4);
   hb.s=beat(t,15.6,16.6);const n=manual?act*3:0;const open=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,[17.2,18.2,19.2][i],[17.8,18.8,19.8][i])));covers.forEach((c,i)=>{c.flip=-2.9*open[i];});
   mur.s=Math.max(beat(t,19.4,20.6),manual?beat(act,.7,1):0);
   three.forEach((p,i)=>{p.body.s=beat(t,21.4+i*.4,22.2+i*.4);});ty.s=beat(t,26,26.8);three.forEach((p,i)=>{p.armR.rot=.12+2*beat(t,26.4+i*.3,27+i*.3)+.3*wave(t,27,36,1.2+i*.1);});
   fans.forEach((f,i)=>{f.body.s=beat(t,28+i*.4,28.8+i*.4);cheer(f,beat(t,31+i*.3,31.6+i*.3));});
   hearts.forEach((h,i)=>{h.s=beat(t,31+i*.35,31.6+i*.35);h.dy=.15*Math.sin(t*2+i)*(t>31.6?1:0);});
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,15,16)-.45*beat(t,18.6,19.4)+.45*beat(t,19.4,20.2)+.45*beat(t,20.2,21)-.45*beat(t,33,34.2):0;
  };
 }};

/* ───────────── 6 · Stepping up again (again) ───────────── */
const again:SpreadDef={id:'again',rest:21.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);penaltyBox(k,-5,0);caption(k,-2.5,'EURO 2024','QUARTER-FINAL · SWITZERLAND',INK.white,INK.yellow);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);penaltyBox(k,0,5);caption(k,2.5,'SCORED!','PLAYER OF THE MATCH',INK.white,INK.pink);},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,[INK.white,INK.red,INK.white,INK.red,INK.white],2);lightRig(k,1.0,.3);lightRig(k,3.5,.25);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#24356a');crowd(k,4.5,1.1,2.6,ENG,5);lightRig(k,1.1,.25);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'a-fw1',.38,INK.red),'R',1.2,1.1,{out:.03}),bd.add(S.firework(K+'a-fw2',.34,INK.white),'R',3.3,.9,{out:.03})];
  const conf=bd.add(S.confetti(K+'a-conf',2.4,1.2,3),'R',1.0,1.3,{out:.04});const bow=bd.add(S.rainbow(K+'a-bow',3.0,1.2),'R',.6,2.4,{out:.02});
  const cups=[0,1].map(i=>B.stand(S.trophy(K+`a-poy${i}`,.4,.7),-4.5+i*.6,-.6,{layer:2,s:0}));const poy=B.stand(lineCard('a-poyc',1.4,.5,['PLAYER OF THE YEAR','2022 · 2023'],INK.gold,INK.navy),-4.1,.2,{layer:2,s:0});
  const sb=B.stand(S.scoreboard(K+'a-sb',1.8,1.4,'EURO 2024'),-.95,-1.55,{layer:1,s:0});sb.add(lineCard('a-thr',1.44,.64,['THROUGH!'],INK.yellow,INK.navy),0,.38,{z:.012});
  const fl=[['SHOOT-OUT','#3d5da0'],['1–1',INK.red],['v SWITZERLAND',INK.red]].map(([l,c],i)=>sb.flap(lineCard(`a-f${i}`,1.44,.64,[l],c,INK.white),0,1.02,{z:.024+i*.006}));
  const gk=keeperGoal(B,'a-kl',-2.6,-1.75,'#f1b88f');
  const H=B.person(K+'a-buk',-2.0,.9,1.3,{shirt:'ger',...BUK,legs:'kick',face:'smile',layer:3});
  const boom=B.stand(pow('a-pow',.26),-3.1,-1.3,{layer:2,s:0,tab:false});
  const gk2=keeperGoal(B,'a-kr',2.5,-1.75,'#e8b48f');
  const H2=B.person(K+'a-buk2',2.2,.9,1.3,{shirt:'ger',...BUK,legs:'kick',face:'smile',layer:3});
  const mem=B.stand(S.flipCard(K+'a-2024',.8,.32,'2024',INK.pink),.8,-.6,{layer:2,s:0});const memTop=mem.flap(S.flipCard(K+'a-2021',.8,.32,'2021',INK.grey,INK.navy),0,.32,{z:.02});
  const boom2=B.stand(pow('a-pow2',.28),2.0,-1.3,{layer:2,s:0,tab:false});const potm=B.stand(lineCard('a-potm',1.4,.5,['PLAYER OF','THE MATCH'],INK.gold,INK.navy),4.1,-.4,{layer:2,s:0});
  const mates=[[1.0,1.5,'#f1b88f'],[3.6,1.3,'#b27650'],[4.4,.5,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.25,{shirt:'ger',hair:(['short','curly','bun'] as const)[i],skin:sk as string,face:'grin',layer:3}));
  const ballL=B.stand(S.ball(K+'a-bl',.1),-1.8,1.0,{layer:3,tab:false,s:0}),ballR=B.stand(S.ball(K+'a-br',.1),2.4,.95,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.8):b.t;
   H.body.s=beat(t,2,2.8);cups.forEach((c,i)=>{c.s=beat(t,5.2+i*1.4,6+i*1.4);});poy.s=beat(t,6.4,7.2);cheer(H,beat(t,8,8.6)*(1-beat(t,10.4,11)));
   sb.s=beat(t,11.2,12);gk.body.s=beat(t,11.6,12.4);
   // The equaliser curls in.
   ballL.s=beat(t,12.6,13.2)*(1-beat(t,18,18.6));const u=beat(t,15,16.2);ballL.x=-1.8-1.3*u;ballL.z=1.0-2.3*u;ballL.dy=.35*Math.sin(u*Math.PI);ballL.rot=-u*9;H.leg!.rot=-1.1*pulse(t,14.7,15.3);
   gk.body.rot=.8*pulse(t,15.2,16.8);gk.body.dx=.3*pulse(t,15.2,16.8);boom.s=beat(t,16.1,16.4)*(1-beat(t,17.6,18.2));fl[2].flip=-3.2*beat(t,16.2,16.8);cheer(H,Math.max(beat(t,16.4,17),0)*(1-beat(t,18.4,19)));
   fl[1].flip=-3.2*beat(t,19,19.6);gk2.body.s=beat(t,19.4,20.2);H2.body.s=beat(t,19.8,20.6);ballR.s=H2.body.s;
   // The shoot-out kick: this time it goes in.
   const kk=manual?beat(act,0,.4):beat(t,22.2,23.4);ballR.x=2.4+.7*kk;ballR.z=.95-2.4*kk;ballR.dy=.4*Math.sin(kk*Math.PI)+.2*kk;ballR.rot=-kk*9;H2.leg!.rot=-1.1*(manual?pulse(act,0,.2):pulse(t,21.9,22.5));
   const dive=manual?beat(act,.1,.4):pulse(t,22.4,25);gk2.body.rot=.9*dive;gk2.body.dx=-.35*dive;
   const goal=Math.max(beat(t,23.3,23.7),manual?beat(act,.4,.5):0);boom2.s=goal*(1-beat(t,25.6,26.2));
   mem.s=beat(t,23.6,24.4);memTop.flip=-2.9*beat(t,25,25.8);
   fl[0].flip=-3.2*Math.max(beat(t,27.4,28),manual?beat(act,.6,.8):0);potm.s=Math.max(beat(t,29.8,30.6),manual?beat(act,.8,1):0);
   const joy=Math.max(beat(t,27.4,28),manual?beat(act,.5,.8):0);cheer(H2,joy);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,27.2+i*.3,28+i*.3),manual?beat(act,.5,.8):0);cheer(m,joy,.2*wave(t,28,37,1.2+i*.1));});
   fw.forEach((f,i)=>{show(f,Math.max(beat(t,28+i*.5,29+i*.5),manual?beat(act,.7+i*.1,.9+i*.1):0));f.rot=t*.2;});conf.visible=t>28||manual;conf.dy=-1.1+1.3*(manual?beat(act,.6,1):beat(t,28.2,31));
   show(bow,beat(t,32.8,34));
   return b.narrated?-.4*beat(t,1.6,2.4)+.4*beat(t,18.8,19.6)+.45*beat(t,19.6,20.4)-.45*beat(t,31.4,32.4):(manual?.35*beat(act,0,.2):0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={ealing,haleend,fifth,unkind,support,again};
void pulse;void wave;void clamp01;void blob;void ell;void track;
