/**
 * The six Didier Drogba pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/drogba/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a rain cloud over a far-away home, CLOSED signs, stamps that fade,
 * and for the civil war only grey clouds that clear when the peace banner unfolds and doves fly.
 * Kits are plain colours with no crests or logos.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,clamp01,smooth,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='drogba-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
/** Both hands forward and together, beating: a clap. */
const clap=(p:Person,a:number,t:number)=>{const c=.18*Math.abs(Math.sin(t*9))*a;p.armL.rot=-.12-1.25*a+c;p.armR.rot=.12+1.25*a-c;};

/* ───────────── page print helpers (solid inks: key lines do not show on page prints) ───────────── */
const line=(k:Kit,x0:number,y0:number,x1:number,y1:number,w:number,c:string)=>{const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);};
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.035,c:string=INK.white,seg=.14){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);line(k,x0+(x1-x0)*a,y0+(y1-y0)*a,x0+(x1-x0)*b,y0+(y1-y0)*b,w,c);}}
function dirt(k:Kit,x0:number,x1:number,tone='#d9b47a'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,'#a9793f',.06,(x,y)=>.18+.12*Math.sin(x*1.7+y*.9));
 for(let i=0;i<16;i++){const x=x0+.3+((i*37)%41)/41*(x1-x0-.6),y=.4+((i*53)%47)/47*5.4,r=.04+(i%3)*.03;k.fill(ell(x,y,r*1.5,r),'#b88c52');}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function planks(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#caa06e');k.dots(p,'#8a5238',.06,.14);for(let y=.5;y<PAGE_D;y+=.5)line(k,x0,y,x1,y,.025,'#9a6a42');}
function cobbles(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#e2d6bc');k.dots(p,'#9f9378',.06,.16);for(let r=0;r<13;r++)for(let c=0;c<11;c++){const x=x0+.1+c*.46+(r%2)*.23,y=.2+r*.48;if(x>x1-.3)continue;k.fill(ell(x+.2,y+.2,.19,.17),r%3?'#d4c6a6':'#cbbd9c');}}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.brown){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.45);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}
function tinRoofs(k:Kit,x0:number,n:number,y:number,seed=1){for(let i=0;i<n;i++){const x=x0+i*.4,h=.26+((i*5+seed)%3)*.07,b=rect(x,y-h,.34,h);k.fill(b,['#e9c58f','#d9a877','#efd6a6'][(i+seed)%3]);k.key(b,.01);const r=poly([[x-.04,y-h],[x+.38,y-h-.06],[x+.38,y-h+.04],[x-.04,y-h+.08]]);k.fill(r,'#a9aebb');k.hatch(r,'#6f7486',.035,1.5,.01);k.key(r,.008);k.fill(rect(x+.12,y-.14,.09,.14),INK.brown);}}
function roofs(k:Kit,x0:number,n:number,y:number,seed=1){for(let i=0;i<n;i++){const x=x0+i*.36,h=.25+((i*5+seed)%3)*.08,b=rect(x,y-h,.3,h);k.fill(b,i%2?'#f0c89a':'#f6d9a4');k.key(b,.01);k.fill(poly([[x-.03,y-h],[x+.15,y-h-.12],[x+.33,y-h]]),INK.red);k.key(poly([[x-.03,y-h],[x+.15,y-h-.12],[x+.33,y-h]]),.008);}}
function palms(k:Kit,xs:number[],y:number){for(const x of xs){k.key(`M${x} ${y} Q${x+.05} ${y-.4} ${x+.02} ${y-.75}`,.03,INK.brown);for(let i=0;i<5;i++){const a=-Math.PI+.3+i*.6;k.key(`M${x+.02} ${y-.75} Q${x+Math.cos(a)*.2} ${y-.85+Math.sin(a)*.1} ${x+Math.cos(a)*.32} ${y-.7+Math.sin(a)*.2}`,.03,INK.green);}}}
function stormCloud(key:string,w:number,h:number){return sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const shack=(key:string,w:number,h:number,wall:string)=>sp(key,w,h,k=>{const wl=rect(w*.04,h*.3,w*.92,h*.7);k.fill(wl,wall);k.hatch(wl,'#a9793f',.06,1.57,.01);k.key(wl,.014);
 const roof=poly([[-.04,h*.34],[w*.1,h*.08],[w*1.02,h*.02],[w+.04,h*.3]]);k.fill(roof,'#aab0bf');k.hatch(roof,'#6f7486',.05,1.4,.012);k.key(roof,.014);
 const d=rect(w*.16,h*.55,w*.24,h*.45);k.fill(d,INK.brown);k.key(d,.012);const wn=rect(w*.56,h*.46,w*.26,h*.2);k.fill(wn,INK.yellow);k.key(wn,.012);k.key(`M${w*.69} ${h*.46} L${w*.69} ${h*.66}`,.01);});
const sockBall=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const c=r;k.fill(ell(c,c,r,r),'#ece6d6');k.hatch(ell(c,c,r,r),INK.grey,.028,.35,.01);
 for(let i=0;i<3;i++)k.key(`M${c-r*.7} ${c-r*.35+i*r*.35} Q${c} ${c-r*.5+i*r*.35} ${c+r*.7} ${c-r*.3+i*r*.35}`,r*.05,'#6d6a64');
 const band=`M${c-r} ${c+r*.1} Q${c} ${c+r*.45} ${c+r} ${c+r*.1} L${c+r*.92} ${c+r*.45} Q${c} ${c+r*.78} ${c-r*.92} ${c+r*.45} Z`;k.fill(band,INK.red);k.fill(`M${c-r*.9} ${c+r*.26} Q${c} ${c+r*.6} ${c+r*.9} ${c+r*.26} L${c+r*.88} ${c+r*.33} Q${c} ${c+r*.66} ${c-r*.88} ${c+r*.33} Z`,INK.white);
 k.key(ell(c,c,r,r),r*.07);},{rim:.02,roll:true});
const sock=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.2} 0 L${w*.62} 0 L${w*.62} ${h*.6} Q${w} ${h*.62} ${w} ${h*.86} Q${w*.96} ${h} ${w*.7} ${h} L${w*.3} ${h} Q${w*.18} ${h} ${w*.2} ${h*.8} Z`;k.fill(p,INK.white);for(let i=0;i<3;i++)k.fill(rect(w*.2,h*(.06+i*.12),w*.42,h*.05),INK.red);k.key(p,.012);});
const newsSheet=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f3efe4');k.dots(b,INK.grey,.03,.3);k.key(b,.012);k.fill(rect(w*.08,h*.08,w*.84,h*.14),INK.navy);k.text('NEWS',w/2,h*.2,h*.1,INK.white);for(let i=0;i<6;i++)k.key(`M${w*.1} ${h*(.34+i*.1)} L${w*(i%2?.55:.9)} ${h*(.34+i*.1)}`,.012,INK.grey);k.text('LIFT',w/2,h*.97,h*.08,INK.red);},{rim:.014});
const crate=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.04,0,.01);k.key(b,.014);k.key(`M0 0 L${w} ${h} M${w} 0 L0 ${h}`,.02,'#8a5238');});
const stickGoal=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.07]){const s=poly([[x,h],[x+.01,0],[x+.07,.02],[x+.07,h]]);k.fill(s,INK.wood);k.key(s,.012);}for(const x of [.05,w-.1])k.fill(ell(x,h-.04,.1,.05),INK.stone);k.key(`M.04 .04 Q${w/2} .12 ${w-.04} .04`,.02,INK.brown);});
const star=(key:string,s:number,c:string=INK.yellow)=>sp(key,s,s,k=>{const p=poly(Array.from({length:10},(_,i)=>[s/2+Math.cos(i*.628-1.57)*(i%2?s*.2:s*.5),s/2+Math.sin(i*.628-1.57)*(i%2?s*.2:s*.5)]));k.fill(p,c);k.dots(p,INK.orange,.03,.3);k.key(p,.012);},{rim:.016});
const pennant=(key:string,w:number,h:number,text:string,c:string)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.05,h),INK.brown);const f=poly([[.05,.02],[w,h*.22],[.05,h*.45]]);k.fill(f,c);k.dots(f,INK.navy,.035,.2);k.key(f,.012);k.text(text,w*.4,h*.28,h*.1,INK.white,{max:w*.6});});
const portrait=(key:string,w:number,h:number,name:string,skin:string,hair:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.4);k.key(f,.016);const m=rect(w*.1,h*.1,w*.8,h*.72);k.fill(m,INK.sky2);k.dots(m,INK.yellow,.04,(x,y)=>.5-y/h*.4);k.key(m,.012);
 const cx=w/2,cy=h*.42,r=w*.2;k.fill(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82} Z`,INK.navy);k.key(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82}`,.012);
 k.fill(ell(cx,cy,r,r*1.15),skin);k.key(ell(cx,cy,r,r*1.15),.012);k.fill(`M${cx-r} ${cy-r*.3} Q${cx-r*.9} ${cy-r*1.25} ${cx} ${cy-r*1.2} Q${cx+r*.9} ${cy-r*1.25} ${cx+r} ${cy-r*.3} Q${cx} ${cy-r*.8} ${cx-r} ${cy-r*.3} Z`,hair);
 k.circle(cx-r*.38,cy-r*.05,r*.09,INK.navy,true);k.circle(cx+r*.38,cy-r*.05,r*.09,INK.navy,true);k.key(`M${cx-r*.35} ${cy+r*.5} Q${cx} ${cy+r*.72} ${cx+r*.35} ${cy+r*.5}`,.012);
 const pl=rect(w*.2,h*.85,w*.6,h*.1);k.fill(pl,INK.gold);k.key(pl,.01);k.text(name,w/2,h*.93,h*.075,INK.navy,{max:w*.56});});
const frameCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f3d9e4');k.dots(b,INK.pink,.04,.3);k.key(b,.014);for(let i=0;i<5;i++){const x=w*(.2+(i%3)*.3),y=h*(.25+Math.floor(i/3)*.4);k.fill(`M${x} ${y+.05} C${x-.08} ${y-.02} ${x-.05} ${y-.08} ${x} ${y-.03} C${x+.05} ${y-.08} ${x+.08} ${y-.02} ${x} ${y+.05} Z`,INK.pink);}k.text('LIFT',w/2,h*.92,h*.1,INK.navy);},{rim:.015});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const chair=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const back=rect(w*.15,0,w*.7,h*.5);k.fill(back,INK.wood);k.hatch(back,'#8a5238',.04,1.57,.01);k.key(back,.012);const seat=poly([[0,h*.5],[w,h*.5],[w*.92,h*.62],[w*.08,h*.62]]);k.fill(seat,'#c98d5d');k.key(seat,.012);for(const x of [.1,.82])k.keyFill(rect(w*x,h*.6,w*.08,h*.4),INK.brown);});
const train=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(w*.25,h*.2,w*.75,h*.55);k.fill(b,INK.red);k.dots(b,INK.navy,.035,.2);k.key(b,.012);const cab=rect(0,0,w*.3,h*.75);k.fill(cab,'#3d5da0');k.key(cab,.012);k.fill(rect(w*.05,h*.1,w*.18,h*.22),INK.yellow);k.fill(rect(w*.32,0,w*.1,h*.2),INK.navy);
 for(const x of [.12,.4,.64,.88]){k.fill(ell(w*x,h*.84,h*.15,h*.15),INK.navy);k.circle(w*x,h*.84,h*.05,INK.grey);}k.circle(w*.37,-.02,.05,INK.white);},{rim:.015});
const gatePost=(key:string,w:number,h:number,label:string,c:string=INK.navy)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.3} Q${w/2} ${h*.1} .08 ${h*.3} Z`;k.fill(arch,c);k.key(arch,.012);k.text(label,w/2,h*.22,h*.075,INK.yellow,{max:w*.62});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,c,.25);k.key(f,.03,c);for(let i=1;i<5;i++)k.key(`M${i*w/5} 0 L${i*w/5} ${h}`,.024,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);for(let i=0;i<5;i++)k.fill(poly([[i*w/5+.02,0],[(i+.5)*w/5,-.08],[(i+1)*w/5-.02,0]]),c);},{rim:.012});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.95);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.7,h*.46,c,{max:w*.84});},{rim:.015});
const shirt=(key:string,s:number,c:string,stripe?:string)=>sp(key,s,s,k=>{const p=poly([[s*.3,s*.08],[s*.42,s*.14],[s*.58,s*.14],[s*.7,s*.08],[s*.96,s*.28],[s*.84,s*.44],[s*.76,s*.38],[s*.76,s*.94],[s*.24,s*.94],[s*.24,s*.38],[s*.16,s*.44],[s*.04,s*.28]]);k.fill(p,c);if(stripe)for(const y of [.4,.62,.84])k.fill(rect(s*.24,s*y,s*.52,s*.08),stripe);k.dots(p,INK.navy,.03,.15);k.key(p,.014);},{rim:.018});
const suitcaseBody=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.14,w,h*.86);k.fill(b,INK.brown);k.key(b,.014);const inner=rect(w*.06,h*.2,w*.88,h*.74);k.fill(inner,'#f0d9b0');k.dots(inner,INK.orange,.035,.2);k.key(inner,.01);
 k.key(`M${w*.36} ${h*.14} L${w*.36} ${h*.02} L${w*.64} ${h*.02} L${w*.64} ${h*.14}`,.03,INK.navy);
 const ph=rect(w*.12,h*.3,w*.36,h*.5);k.fill(ph,INK.white);k.key(ph,.01);k.fill(rect(w*.15,h*.34,w*.3,h*.34),INK.sky2);for(const [x,s,hh] of [[.22,.06,.46],[.34,.07,.42]] as const){k.fill(ell(w*x,h*hh,w*s*.8,w*s*.8),'#7f5138');k.fill(`M${w*(x-s)} ${h*.68} Q${w*x} ${h*(hh+.06)} ${w*(x+s)} ${h*.68} Z`,x<.3?INK.pink:INK.blue);}
 k.text('HOME',w*.3,h*.77,h*.06,INK.navy);
 const lt=rect(w*.54,h*.3,w*.34,h*.44);k.fill(lt,INK.white);k.key(lt,.01);for(let i=0;i<4;i++)k.key(`M${w*.58} ${h*(.4+i*.08)} L${w*.84} ${h*(.4+i*.08)}`,.01,INK.grey);k.fill(`M${w*.71} ${h*.36} C${w*.66} ${h*.32} ${w*.64} ${h*.38} ${w*.71} ${h*.42} C${w*.78} ${h*.38} ${w*.76} ${h*.32} ${w*.71} ${h*.36} Z`,INK.pink);});
const suitcaseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.red);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.fill(rect(w*.12,0,w*.08,h),INK.brown);k.fill(rect(w*.8,0,w*.08,h),INK.brown);const tag=rect(w*.34,h*.3,w*.32,h*.3);k.fill(tag,INK.paper);k.key(tag,.01);k.text('LISBON',w/2,h*.5,h*.1,INK.navy,{max:w*.28});k.text('OPEN',w/2,h*.88,h*.1,INK.yellow);},{rim:.015});
const bubbleHome=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.12} ${h*.05} L${w*.88} ${h*.05} Q${w} ${h*.05} ${w} ${h*.2} L${w} ${h*.6} Q${w} ${h*.75} ${w*.88} ${h*.75} L${w*.42} ${h*.75} L${w*.2} ${h} L${w*.26} ${h*.75} L${w*.12} ${h*.75} Q0 ${h*.75} 0 ${h*.6} L0 ${h*.2} Q0 ${h*.05} ${w*.12} ${h*.05} Z`;k.fill(p,INK.white);k.key(p,.013);
 const hx=w/2,hy=h*.4;k.fill(poly([[hx-w*.2,hy],[hx,hy-h*.22],[hx+w*.2,hy]]),INK.red);k.fill(rect(hx-w*.15,hy,w*.3,h*.2),'#f0b86a');k.fill(rect(hx-w*.04,hy+h*.06,w*.08,h*.14),INK.brown);k.key(rect(hx-w*.15,hy,w*.3,h*.2),.01);});
const clubFlag=(key:string,w:number,h:number,c:string,c2:string)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.06,h),INK.brown);const f=rect(.06,.04,w-.06,h*.42);k.fill(f,c);k.fill(rect(.06,.04+h*.14,w-.06,h*.14),c2);k.key(f,.012);});
const goldenBoot=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.22} 0 L${w*.56} 0 L${w*.6} ${h*.5} Q${w*.96} ${h*.54} ${w} ${h*.74} L${w} ${h*.86} L${w*.18} ${h*.86} Z`;k.fill(b,INK.gold);k.dots(b,INK.orange,.03,.4);k.key(b,.013);for(let i=0;i<4;i++)k.circle(w*(.3+i*.18),h*.93,.03,INK.navy,true);k.key(`M${w*.26} ${h*.2} L${w*.52} ${h*.24} M${w*.26} ${h*.34} L${w*.54} ${h*.38}`,.014,'#9b6a14');});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const tear=(key:string,s:number)=>sp(key,s*.6,s,k=>{const w=s*.6,p=`M${w/2} 0 Q${w} ${s*.6} ${w/2} ${s} Q0 ${s*.6} ${w/2} 0 Z`;k.fill(p,INK.sky);k.dots(p,INK.blue,.025,.4);k.key(p,.01);},{rim:.012});
const bannerPoles=(key:string,w:number,h:number,lines:string[],c:string=INK.red)=>sp(key,w,h,k=>{for(const x of [0,w-.07]){const p=rect(x,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(x,y,.07,.08),c);k.key(p,.008);}
 const b=rect(.1,h*.06,w-.2,h*.46);k.fill(b,c);k.dots(b,INK.navy,.035,.2);k.key(b,.014);lines.forEach((l,i)=>k.text(l,w/2,h*(.25+i*.17),h*.12,INK.white,{max:w*.8}));});

const signBoard=(key:string,w:number,h:number,text:string,color:string=INK.white)=>sp(key,w,h,k=>{const post=rect(w*.46,h*.4,w*.08,h*.6);k.fill(post,INK.brown);k.key(post,.01);const b=rect(0,0,w,h*.42);k.fill(b,color);k.key(b,.013);k.text(text,w/2,h*.29,h*.19,INK.navy,{max:w*.86});});

/* ───────────── shared mechanics ───────────── */
/** One ball per page (a cut-out never crosses the gutter): the visible twin follows x. */
function ballPair(B:Builder,spec:PlateSpec,spec2:PlateSpec){const L=B.stand(spec,-1,1,{layer:3,tab:false}),R=B.stand(spec2,1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── Drogba-only plates ───────────── */
const DID={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a1f'};
const planeStrip=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const s=rect(w/2-.03,0,.06,h-.3);k.fill(s,INK.stock);k.key(s,.008,'#9c8a66');k.circle(w/2,.03,.02,INK.gold);
 const px=w/2,py=h-.22,pl=poly([[px-.28,py-.08],[px+.3,py-.2],[px-.04,py+.02],[px-.02,py+.2]]);k.fill(pl,INK.white);k.dots(poly([[px+.3,py-.2],[px-.04,py+.02],[px-.02,py+.2]]),INK.sky,.025,.6);k.key(pl,.012);k.key(`M${px+.3} ${py-.2} L${px-.04} ${py+.02}`,.01);},{rim:.012});
const postP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=rect(w/2-.05,0,.1,h);k.fill(p,INK.wood);k.key(p,.01);k.fill(ell(w/2,.05,.09,.09),INK.gold);k.key(ell(w/2,.05,.09,.09),.01);});
const car=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const body=`M0 ${h*.8} L0 ${h*.5} L${w*.2} ${h*.45} L${w*.32} ${h*.12} L${w*.72} ${h*.12} L${w*.86} ${h*.45} L${w} ${h*.52} L${w} ${h*.8} Z`;k.fill(body,c);k.dots(body,INK.navy,.035,.2);k.key(body,.014);
 k.fill(poly([[w*.36,h*.18],[w*.5,h*.18],[w*.5,h*.44],[w*.26,h*.44]]),INK.sky2);k.fill(poly([[w*.54,h*.18],[w*.7,h*.18],[w*.8,h*.44],[w*.54,h*.44]]),INK.sky2);for(const x of [.22,.78]){k.fill(ell(w*x,h*.82,h*.17,h*.17),INK.navy);k.circle(w*x,h*.82,h*.07,INK.grey);}});
const shop=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,'#f0c89a');k.dots(b,INK.orange,.04,.2);k.key(b,.014);const aw=poly([[-.04,h*.2],[w+.04,h*.2],[w,h*.36],[0,h*.36]]);k.fill(aw,INK.green);for(let i=0;i<6;i++)k.fill(rect(i*w/6,h*.2,w/12,h*.16),INK.white);k.key(aw,.012);
 const s2=rect(w*.1,0,w*.8,h*.18);k.fill(s2,INK.white);k.key(s2,.012);k.text(label,w/2,h*.14,h*.1,INK.navy,{max:w*.74});const d=rect(w*.36,h*.5,w*.28,h*.5);k.fill(d,INK.brown);k.key(d,.012);for(const x of [.08,.72]){k.fill(rect(w*x,h*.46,w*.2,h*.22),INK.sky);k.key(rect(w*x,h*.46,w*.2,h*.22),.01);}});
const blockP=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.key(rect(.04,.04,w-.08,h-.08),.01,INK.white);k.text(label,w/2,h*.66,h*.4,INK.navy,{max:w*.8});},{rim:.014});
const pram=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.1} ${h*.3} L${w*.9} ${h*.3} Q${w*.9} ${h*.72} ${w*.5} ${h*.72} Q${w*.1} ${h*.72} ${w*.1} ${h*.3} Z`;k.fill(b,INK.sky);k.dots(b,INK.blue,.03,.3);k.key(b,.013);const hood=`M${w*.1} ${h*.32} Q${w*.1} 0 ${w*.46} 0 L${w*.46} ${h*.32} Z`;k.fill(hood,INK.blue);k.key(hood,.012);k.fill(ell(w*.62,h*.28,w*.09,w*.09),'#7f5138');k.key(ell(w*.62,h*.28,w*.09,w*.09),.01);
 k.key(`M${w*.9} ${h*.34} L${w} ${h*.1}`,.02);for(const x of [.26,.74]){k.fill(ell(w*x,h*.86,h*.13,h*.13),INK.navy);k.circle(w*x,h*.86,h*.05,INK.grey);}});
const arrowArm=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const s=rect(w/2-.03,0,.06,h*.55);k.fill(s,INK.wood);k.key(s,.008);const a=poly([[w/2-.14,h*.5],[w/2+.14,h*.5],[w/2+.14,h*.78],[w/2+.26,h*.78],[w/2,h],[w/2-.26,h*.78],[w/2-.14,h*.78]]);k.fill(a,INK.yellow);k.dots(a,INK.orange,.03,.3);k.key(a,.012);k.circle(w/2,.03,.02,INK.gold);},{rim:.012});
const lockers=(k:Kit,x0:number,n:number,y:number,h:number)=>{for(let i=0;i<n;i++){const x=x0+i*.42,l=rect(x,y,.38,h);k.fill(l,i%2?'#e89a5a':INK.orange);k.key(l,.012);k.key(`M${x+.06} ${y+.12} L${x+.32} ${y+.12} M${x+.06} ${y+.2} L${x+.32} ${y+.2}`,.01);k.circle(x+.3,y+h*.5,.02,INK.navy,true);}};
const camera=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const [x0,x1] of [[.5,.2],[.5,.8],[.5,.5]])k.key(`M${w*x0} ${h*.45} L${w*x1} ${h}`,.025,INK.navy);const b=rect(w*.12,0,w*.6,h*.42);k.fill(b,INK.grey);k.key(b,.013);const lens=rect(w*.72,h*.1,w*.24,h*.22);k.fill(lens,INK.navy);k.circle(w*.2,h*.08,.03,INK.red);k.text('TV',w*.42,h*.3,h*.16,INK.navy);});
const dove=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const body=`M${w*.1} ${h*.6} Q${w*.4} ${h*.4} ${w*.8} ${h*.5} Q${w} ${h*.52} ${w*.92} ${h*.66} Q${w*.6} ${h*.8} ${w*.1} ${h*.6} Z`;k.fill(body,INK.white);k.key(body,.012);const wing=`M${w*.35} ${h*.55} Q${w*.4} 0 ${w*.7} ${h*.05} Q${w*.62} ${h*.4} ${w*.55} ${h*.55} Z`;k.fill(wing,INK.white);k.dots(wing,INK.sky,.025,.4);k.key(wing,.012);k.circle(w*.84,h*.53,.015,INK.navy,true);
 k.fill(poly([[w*.95,h*.55],[w*1.05,h*.6],[w*.95,h*.62]]),INK.orange);k.key(`M${w*.9} ${h*.66} Q${w*.98} ${h*.8} ${w*1.02} ${h*.72}`,.012,INK.green);},{rim:.016});
const doveBubble=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.12} ${h*.05} L${w*.88} ${h*.05} Q${w} ${h*.05} ${w} ${h*.2} L${w} ${h*.6} Q${w} ${h*.75} ${w*.88} ${h*.75} L${w*.62} ${h*.75} L${w*.8} ${h} L${w*.5} ${h*.75} L${w*.12} ${h*.75} Q0 ${h*.75} 0 ${h*.6} L0 ${h*.2} Q0 ${h*.05} ${w*.12} ${h*.05} Z`;k.fill(p,INK.white);k.key(p,.013);
 const cx=w/2,cy=h*.4;k.fill(`M${cx-w*.26} ${cy+h*.04} Q${cx} ${cy-h*.06} ${cx+w*.22} ${cy} Q${cx+w*.3} ${cy+h*.04} ${cx+w*.2} ${cy+h*.12} Q${cx} ${cy+h*.18} ${cx-w*.26} ${cy+h*.04} Z`,INK.sky2);k.fill(`M${cx-w*.08} ${cy} Q${cx-w*.02} ${cy-h*.26} ${cx+w*.12} ${cy-h*.24} Q${cx+w*.06} ${cy-h*.08} ${cx+w*.04} ${cy} Z`,INK.sky);k.key(`M${cx-w*.26} ${cy+h*.04} Q${cx} ${cy-h*.06} ${cx+w*.22} ${cy}`,.01);});
const peaceBanner=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.016);for(let i=0;i<3;i++)k.fill(rect(0,i*h/3,w*.06,h/3),[INK.orange,INK.white,INK.green][i]);for(let i=0;i<3;i++)k.fill(rect(w*.94,i*h/3,w*.06,h/3),[INK.orange,INK.white,INK.green][i]);k.text('PEACE',w/2,h*.68,h*.5,INK.blue,{max:w*.78});},{rim:.016});
const bannerFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.08]){const p=rect(x,0,.08,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(x,y,.08,.08),INK.orange);k.key(p,.008);}const bar=rect(0,0,w,.1);k.fill(bar,INK.wood);k.key(bar,.01);for(const x of [.02,w-.1])k.fill(ell(x+.04,.05,.07,.07),INK.gold);});
const bannerRoll=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const r=rect(0,0,w,h);k.fill(r,INK.wood);k.hatch(r,'#8a5238',.03,0,.01);k.key(r,.012);k.text('UNFOLD',w/2,h*.75,h*.6,INK.white,{max:w*.6});},{rim:.012});
const stadium=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=`M0 ${h} L0 ${h*.35} Q${w/2} ${h*.1} ${w} ${h*.35} L${w} ${h} Z`;k.fill(b,'#e8dcc4');k.dots(b,INK.grey,.04,.25);k.key(b,.014);for(let i=0;i<7;i++)k.fill(rect(w*(.06+i*.13),h*.5,w*.08,h*.2),INK.navy,.8);k.fill(rect(0,h*.8,w,h*.2),INK.orange);k.text(label,w/2,h*.95,h*.13,INK.white,{max:w*.8});lightRig(k,w*.12,h*.05);lightRig(k,w*.88,h*.05);});
const hospitalFloor=(key:string,w:number,h:number,top:boolean)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.014);for(let i=0;i<4;i++){const wn=rect(w*(.08+i*.23),h*.2,w*.16,h*.5);k.fill(wn,INK.sky);k.key(wn,.01);}if(top){k.fill(rect(0,0,w,h*.1),INK.green);}},{rim:.014});
const hospitalBase=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.014);const d=rect(w*.4,h*.35,w*.2,h*.65);k.fill(d,INK.blue);k.key(d,.012);for(const x of [.1,.72]){const wn=rect(w*x,h*.3,w*.18,h*.35);k.fill(wn,INK.sky);k.key(wn,.01);}const st=rect(w*.3,h*.05,w*.4,h*.22);k.fill(st,INK.green);k.key(st,.01);k.text('HOSPITAL',w/2,h*.21,h*.12,INK.white,{max:w*.36});});
const hSign=(key:string,s:number)=>sp(key,s,s,k=>{const b=rect(0,0,s,s);k.fill(b,INK.blue);k.key(b,.013);k.text('H',s/2,s*.78,s*.72,INK.white);},{rim:.016});
const magazine=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.2),INK.red);k.text('100',w/2,h*.17,h*.15,INK.white);k.fill(ell(w/2,h*.48,w*.18,w*.2),'#7f5138');k.key(ell(w/2,h*.48,w*.18,w*.2),.01);k.fill(`M${w*.2} ${h*.86} Q${w/2} ${h*.55} ${w*.8} ${h*.86} Z`,INK.orange);k.text('MOST INFLUENTIAL',w/2,h*.95,h*.07,INK.navy,{max:w*.86});},{rim:.016});
const coinJar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const j=`M${w*.2} ${h*.12} L${w*.8} ${h*.12} L${w*.86} ${h*.3} L${w*.86} ${h} L${w*.14} ${h} L${w*.14} ${h*.3} Z`;k.fill(j,INK.sky2,.9);k.dots(j,INK.sky,.03,.3);k.key(j,.014);k.fill(rect(w*.16,0,w*.68,h*.13),INK.brown);k.key(rect(w*.16,0,w*.68,h*.13),.012);for(let i=0;i<5;i++){const c=ell(w*(.3+(i%3)*.2),h*(.9-Math.floor(i/3)*.08),w*.12,h*.035);k.fill(c,INK.gold);k.key(c,.008);}});
const coin=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.gold);k.dots(ell(r,r,r,r),INK.orange,.025,.4);k.key(ell(r,r,r,r),.012);k.key(ell(r,r,r*.62,r*.62),.008,INK.orange);},{rim:.012});

/* ───────────── 1 · Homesick (homesick) ───────────── */
const homesick:SpreadDef={id:'homesick',rest:19.6,
 left:k=>{cobbles(k,-5,0);k.text('FRANCE',-2.5,Z(2.6),.5,INK.blue,{max:3});k.text('AGE 5 · WITH UNCLE MICHEL',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#8e8f98');k.dots(p,'#5d5f6c',.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));for(let i=0;i<5;i++)line(k,.6+i*.9,Z(-1.3),.6+i*.9,Z(-.3),.05,INK.white);dash(k,0,Z(.2),5,Z(.2),.05,INK.yellow);
  k.text('ABIDJAN',2.5,Z(2.6),.5,INK.orange,{max:3.2});k.text('IVORY COAST · THE CAR PARK PITCH',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c3c9d9',INK.navy,y=>.3-y*.06);roofs(k,.1,12,1.9,2);roofs(k,.3,11,2.4,4);k.fill(rect(0,2.4,4.5,.6),'#e2d6bc');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);sea(k,4.5,1.8,.4);roofs(k,.3,10,2.3,3);palms(k,[.5,3.8,4.3],2.2);k.fill(rect(0,2.3,4.5,.7),'#8e8f98');}},-3.05,1.22);
  const rain=bd.add(stormCloud('h-rain',1.3,.66),'L',2.2,2.3,{out:.03}),sun=bd.add(S.sun(K+'h-sun',.34),'R',3.2,2.0,{out:.012});
  const sign=B.stand(signBoard('h-sign',1.3,1.15,'ABIDJAN'),1.6,-1.4,{layer:1,s:0});const c78=sign.flap(S.flipCard(K+'h-1978',1.2,.44,'1978',INK.pink),0,1.15*.56,{z:.03});
  const mum=B.person(K+'h-mum',2.6,-.4,1.6,{skin:'#7f5138',hair:'long',hairColor:'#1d1a1f',shirt:'coach',adult:true,face:'smile',layer:2});
  const dad=B.person(K+'h-dad',3.4,-.6,1.72,{...DID,shirt:'navy',adult:true,face:'smile',layer:2});
  const boyR=B.person(K+'h-boyR',1.6,.3,.85,{...DID,shirt:'casual',face:'shy',layer:3,holdR:'suitcase'});
  const uncle=B.person(K+'h-uncle',-3.3,-.3,1.72,{...DID,shirt:'navy',number:'9',adult:true,face:'smile',layer:2});
  const tagU=B.stand(S.flipCard(K+'h-tagU',1.3,.3,'UNCLE MICHEL GOBA',INK.white,INK.navy),-3.3,.45,{layer:2,s:0});
  const boyL=B.person(K+'h-boyL',-2.2,.7,.85,{...DID,shirt:'casual',face:'sad',layer:3});
  const bub=B.stand(S.bubble(K+'h-bub',.55,.5,'heart'),-1.6,-.5,{layer:2,s:0});
  const post=B.stand(postP('h-post',.3,1.9),-.25,-.9,{layer:2,s:0,tab:false});const arm=post.arm(planeStrip('h-strip',.7,1.9),0,1.86,{z:.02});
  const boyR2=B.person(K+'h-boyR2',1.3,1.0,.9,{...DID,shirt:'casual',face:'grin',legs:'kick',layer:3});
  const cars=[B.stand(car('h-car1',1.1,.55,INK.red),1.4,-.9,{layer:1,s:0}),B.stand(car('h-car2',1.05,.52,INK.yellow),4.3,.2,{layer:2,s:0})];
  const kids=[[2.6,1.5,'#b27650','curly'],[3.6,1.2,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`h-k${i}`,x as number,z as number,.9,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:i?'bib':'fan',face:'grin',layer:3}));
  const tito=B.stand(S.flipCard(K+'h-tito',.8,.32,'TITO',INK.orange,INK.white),2.2,.45,{layer:2,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`h-heart${i}`,.26),2.4+i*.6,-1.1,{layer:1,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'h-ball',.1),1.7,1.05,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   sign.s=beat(t,1.8,2.6);c78.flip=-2.9+2.9*beat(t,4,4.8);mum.body.s=beat(t,2.6,3.4);dad.body.s=beat(t,3,3.8);boyR.body.s=beat(t,3.6,4.4)*(1-beat(t,9.2,10));
   boyR.body.x=1.6-1.0*beat(t,7.6,9.4);mum.armR.rot=.12+2*beat(t,8,8.6)+.3*wave(t,8.6,12,1.2)-2*beat(t,12,12.6);
   uncle.body.s=beat(t,10.4,11.2);tagU.s=beat(t,11.6,12.4)*(1-beat(t,15,15.6));boyL.body.s=beat(t,9.8,10.6)*(1-Math.max(beat(t,21.2,22),manual?beat(act,.5,.7):0));uncle.armL.rot=-.12-.8*beat(t,12,12.6);
   // Homesick: grey rain over France and a heart bubble for home.
   rain.scale=beat(t,15.2,16.4)*(1-Math.max(beat(t,21,23),manual?beat(act,.3,.8):0));rain.visible=rain.scale>.02;rain.dx=.12*wave(t,16,21,.3);
   bub.s=beat(t,16.4,17.2)*(1-Math.max(beat(t,20.6,21.4),manual?beat(act,0,.3):0));
   // Fly the plane home: a paper plane on a strip swings from France over the gutter to Abidjan.
   post.s=beat(t,18.2,19);const fly=Math.max(manual?beat(act,0,.8):0,beat(t,19.8,21.4));arm.rot=-1.45+2.9*fly;
   boyR2.body.s=Math.max(manual?beat(act,.6,.9):0,beat(t,21.8,22.6));
   cars.forEach((c,i)=>{c.s=beat(t,24.4+i*.4,25.2+i*.4);});kids.forEach((c,i)=>{c.body.s=beat(t,25.4+i*.4,26.2+i*.4);});
   ball.s=boyR2.body.s;let bx=1.7,bz=1.05,dy=0;if(t>26){[bx,bz]=track(t,[[26,1.7,1.05],[27,3.2,1.4],[27.6,3.2,1.4],[28.6,1.7,1.05],[29.6,3.5,1.1]]);dy=.1*Math.abs(Math.sin(t*4));}ball.x=bx;ball.z=bz;ball.dy=dy;ball.rot=-bx*5;
   boyR2.leg!.rot=-1*Math.max(pulse(t,25.7,26.3),pulse(t,28.3,28.9));
   tito.s=beat(t,29.8,30.6);mum.armL.rot=-.12-1.2*pulse(t,29.8,33);hearts.forEach((h,i)=>{h.s=beat(t,31+i*.5,31.6+i*.5);});
   cheer(boyR2,Math.max(beat(t,34,34.6),manual?beat(act,.85,1):0));kids.forEach((c,i)=>cheer(c,beat(t,34.4+i*.3,35+i*.3)));sun.dy=.5*beat(t,21,25);
   return b.narrated?.45*beat(t,1.4,2.2)-.45*beat(t,9.4,10.2)-.45*beat(t,10.2,11)+.45*beat(t,18,19)+.45*beat(t,21.6,22.4)-.45*beat(t,32.2,33):0;
  };
 }};

/* ───────────── 2 · Together again (together) ───────────── */
const together:SpreadDef={id:'together',rest:16.0,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#8e8f98');k.dots(p,'#5d5f6c',.05,.22);dash(k,-5,Z(.4),0,Z(.4),.05,INK.yellow);
  k.text('ABIDJAN',-2.5,Z(2.6),.5,INK.orange,{max:3.2});k.text('BOTH PARENTS LOST THEIR JOBS',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{cobbles(k,0,5);
  k.text('VANNES · ANTONY',2.5,Z(2.6),.42,INK.blue,{max:4.2});k.text('1991 TO 1993 · TOGETHER AGAIN',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);sea(k,4.5,1.8,.4);roofs(k,.2,12,2.3,1);palms(k,[3.9],2.2);k.fill(rect(0,2.3,4.5,.7),'#8e8f98');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c3c9d9',INK.navy,y=>.3-y*.06);roofs(k,.1,12,1.9,5);roofs(k,.3,11,2.4,2);k.fill(rect(0,2.4,4.5,.6),'#e2d6bc');}},-3.05,1.22);
  const rain=bd.add(stormCloud('t-rain',1.3,.66),'R',2.0,2.2,{out:.03}),sun=bd.add(S.sun(K+'t-sun',.34),'R',3.6,2.0,{out:.012});
  const shops=[B.stand(shop('t-shop1',1.3,1.2,'WORK'),-3.8,-1.2,{layer:1,s:0}),B.stand(shop('t-shop2',1.2,1.1,'JOBS'),-1.5,-1.7,{layer:1,s:0})];
  const closed=[B.stand(stamp('t-cl1',1.0,.34,'CLOSED'),-3.8,-.3,{layer:2,s:0}),B.stand(stamp('t-cl2',1.0,.34,'CLOSED'),-1.5,-.7,{layer:2,s:0})];
  const mum=B.person(K+'t-mum',-2.95,.55,1.6,{skin:'#7f5138',hair:'long',hairColor:'#1d1a1f',shirt:'coach',adult:true,face:'sad',layer:2});
  const dad=B.person(K+'t-dad',-2.2,.35,1.72,{...DID,shirt:'navy',adult:true,face:'sad',layer:2});
  const boyL=B.person(K+'t-boyL',-1.4,1.0,.95,{...DID,shirt:'casual',face:'sad',layer:3,holdR:'suitcase'});
  const uncle=B.person(K+'t-uncle',3.9,-.5,1.72,{...DID,shirt:'navy',number:'9',adult:true,face:'smile',layer:2});
  const boyR=B.person(K+'t-boyR',3.1,.2,.95,{...DID,shirt:'casual',face:'shy',layer:2});
  const signV=B.stand(signBoard('t-vannes',1.2,1.1,'VANNES'),1.1,-1.7,{layer:1,s:0});const cA=signV.flap(S.flipCard(K+'t-1991',1.1,.4,'1991',INK.pink),0,1.1*.56,{z:.03});
  const signA=B.stand(signBoard('t-antony',1.2,1.1,'ANTONY'),2.6,-1.62,{layer:1,s:0});const cB=signA.flap(S.flipCard(K+'t-1993',1.1,.4,'1993',INK.blue),0,1.1*.56,{z:.03});
  const mumR=B.person(K+'t-mumR',.8,1.2,1.6,{skin:'#7f5138',hair:'long',hairColor:'#1d1a1f',shirt:'coach',adult:true,face:'grin',layer:3});
  const dadR=B.person(K+'t-dadR',.6,1.8,1.72,{...DID,shirt:'navy',adult:true,face:'grin',layer:3});
  B.slot(.3,1.5,2.2,1.5);
  const teen=B.person(K+'t-teen',3.0,1.3,1.15,{...DID,shirt:'casual',face:'grin',layer:3});
  const sibs=[[3.8,1.6,.95,'bun'],[4.4,1.0,.85,'short'],[3.5,2.1,.8,'curly']].map(([x,z,h,hr],i)=>B.person(K+`t-sib${i}`,x as number,z as number,h as number,{skin:'#7f5138',hair:hr as 'short',hairColor:'#1d1a1f',shirt:(['bib','fan','keeper'] as const)[i],face:'grin',layer:3}));
  const fifteen=B.stand(S.flipCard(K+'t-15',.9,.3,'AGE 15',INK.yellow,INK.navy),4.55,-.6,{layer:2,s:0});
  const home=B.stand(S.house(K+'t-house',1.3,1.2),4.2,-1.1,{layer:1,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`t-heart${i}`,.26),1.6+i*.6,.6,{layer:2,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16):b.t;
   mum.body.s=beat(t,1.6,2.4);dad.body.s=beat(t,2,2.8);boyL.body.s=beat(t,2.4,3.2)*(1-beat(t,8.6,9.4));
   shops.forEach((s2,i)=>{s2.s=beat(t,.6+i*.3,1.4+i*.3);});closed.forEach((c,i)=>{c.s=beat(t,4.6+i*.8,5.2+i*.8);});
   boyL.body.x=-1.4+.9*beat(t,7,8.8);uncle.body.s=beat(t,8.4,9.2);boyR.body.s=beat(t,9,9.8)*(1-beat(t,26.6,27.4));uncle.armL.rot=-.12-.9*beat(t,9.6,10.2);
   mum.armR.rot=.12+1.8*beat(t,7.4,8)+.25*wave(t,8,11,1.2)-1.8*beat(t,11,11.6);
   rain.scale=beat(t,10.9,12)*(1-Math.max(beat(t,17,19),manual?beat(act,.2,.7):0));rain.visible=rain.scale>.02;rain.dx=.12*wave(t,11,17,.3);
   // Slide the family together: the parents leave Abidjan and slide in along the slot on the right page.
   const slide=Math.max(manual?beat(act,0,.8):0,beat(t,16.2,18.6));
   mum.body.s*=1-beat(slide,0,.2);dad.body.s*=1-beat(slide,0,.2);
   mumR.body.s=beat(slide,.15,.35);dadR.body.s=beat(slide,.2,.4);mumR.body.x=.8+1.2*slide;dadR.body.x=.6+1.2*slide;
   signV.s=beat(t,18.4,19.2);cA.flip=-2.9+2.9*beat(t,19.4,20.2);signA.s=beat(t,23.2,24);cB.flip=-2.9+2.9*beat(t,24.4,25.2);
   teen.body.s=beat(t,27,27.8);fifteen.s=beat(t,27.2,28);sibs.forEach((c,i)=>{c.body.s=beat(t,29.2+i*.4,30+i*.4);});
   home.s=beat(t,31.6,32.4);hearts.forEach((h,i)=>{h.s=Math.max(beat(t,32.6+i*.4,33.2+i*.4),manual?beat(act,.8+i*.06,.95+i*.06):0);});
   const hug=beat(t,32.4,33.2);mumR.armR.rot=.12+1.8*Math.max(hug,manual?beat(act,.85,1):0);dadR.armR.rot=.12+1.4*hug;cheer(teen,beat(t,33,33.6));sibs.forEach((c,i)=>cheer(c,beat(t,33.2+i*.2,33.8+i*.2)));
   sun.scale=Math.max(beat(t,34.8,36),manual?beat(act,.6,1):0);sun.visible=sun.scale>.02;
   return b.narrated?-.45*beat(t,1.4,2.2)+.45*beat(t,8.2,9)+.45*beat(t,15.4,16.2)-.45*beat(t,16.2,17)+.45*beat(t,18.2,19)-.45*beat(t,33.8,34.6):0;
  };
 }};

/* ───────────── 3 · A late start (latestart) ───────────── */
const latestart:SpreadDef={id:'latestart',rest:30.3,
 left:k=>{pitch(k,-5,0);line(k,-5,Z(-1.9),0,Z(-1.9),.05,INK.white);
  k.text('LEVALLOIS',-2.5,Z(2.6),.48,INK.blue,{max:3.6});k.text('A GOAL, BUT NOT ENOUGH YET',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#9ccf7a',INK.leaf);line(k,0,Z(-1.9),5,Z(-1.9),.05,INK.white);
  k.text('LE MANS',2.5,Z(2.6),.5,INK.red,{max:3.2});k.text('FOUR YEARS TO BUILD UP',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c3c9d9',INK.navy,y=>.3-y*.06);roofs(k,.1,12,2.0,3);crowd(k,4.5,2.0,2.5,[INK.white,INK.blue,INK.white,INK.red],2);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);roofs(k,.2,12,2.1,5);const u=rect(2.6,.9,1.6,1.2);k.fill(u,'#f2e6cc');k.key(u,.012);k.fill(poly([[2.5,.9],[3.4,.55],[4.3,.9]]),INK.blue);k.text('UNIVERSITY',3.4,1.3,.14,INK.navy);k.fill(rect(0,2.3,4.5,.7),'#9ccf7a');}},-3.05,1.22);
  const rain=bd.add(stormCloud('l-rain',1.3,.66),'R',1.6,2.3,{out:.03}),sun=bd.add(S.sun(K+'l-sun',.34),'R',3.8,2.2,{out:.012});
  const club=B.stand(signBoard('l-club',1.3,1.1,'LEVALLOIS'),-3.9,-1.12,{layer:1,s:0});
  const goalL=B.stand(S.goal(K+'l-goalL',1.5,.8),-2.0,-1.8,{layer:1});void goalL;
  const did=B.person(K+'l-did',-2.6,.6,1.15,{...DID,shirt:'fan',face:'grin',legs:'kick',layer:3});
  const goals=[0,1,2,3].map(i=>B.stand(S.ball(K+`l-g${i}`,.09),-4.5+i*.28,.3,{layer:2,s:0,tab:false}));
  const coach=B.person(K+'l-coach',-.9,-.6,1.75,{skin:'#f1b88f',hair:'short',hairColor:'#6b5a48',shirt:'coach',adult:true,face:'shy',layer:2});
  const notYet=B.stand(stamp('l-ni',1.5,.38,'NOT IMPRESSED'),-1.3,1.5,{layer:3,s:0});
  const academy=B.stand(signBoard('l-acad',1.2,1.1,'ACADEMY',INK.grey),-3.9,1.4,{layer:3,s:0});const xmark=B.stand(stamp('l-x',1.2,.34,'NEVER WENT'),-3.9,2.0,{layer:3,s:0});
  const leMans=B.stand(signBoard('l-lemans',1.2,1.1,'LE MANS',INK.yellow),.9,-1.7,{layer:1,s:0});
  const study=B.stand(S.flipCard(K+'l-study',1.2,.32,'UNIVERSITY TOO',INK.blue),.9,-.6,{layer:2,s:0});
  const adult=B.person(K+'l-adult',2.0,.2,1.3,{...DID,shirt:'bib',face:'smile',layer:2});
  const adultSad=B.person(K+'l-adultSad',2.0,.2,1.3,{...DID,shirt:'bib',face:'sad',layer:2});
  const cones=[[3.0,-.8],[3.6,-.3],[4.2,-.8]].map(([x,z],i)=>B.stand(S.cone(K+`l-cone${i}`,.3),x,z,{layer:2,s:0}));
  const base=B.stand(S.strip(K+'l-base',.9,.08,INK.wood),3.5,1.1,{layer:3,s:0,tab:false});
  const blocks=['YEAR 1','YEAR 2','YEAR 3','YEAR 4'].map((l,i)=>base.add(blockP(`l-b${i}`,.8,.34,l,[INK.yellow,INK.sky,INK.pink,INK.green][i]),0,.08+i*.36,{z:.01+i*.002}));
  const quote=B.stand(lineCard('l-quote',2.0,.56,['TRAIN EVERY DAY','PLAY EVERY WEEK'],INK.white),1.7,1.95,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'l-ball',.1),-2.35,.65,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,30.3):b.t;
   club.s=beat(t,2,2.8);did.body.s=beat(t,2.6,3.4);goals.forEach((g,i)=>{g.s=beat(t,7.8+i*.5,8.3+i*.5);});
   ball.s=did.body.s*(1-beat(t,14,14.6));const kk=t>=10.6&&t<11.6?beat(t,10.6,11.6):t>=11.6?1:0;ball.x=-2.35+.35*kk;ball.z=.65-2.3*kk;ball.dy=.35*Math.sin(kk*Math.PI);ball.rot=-kk*10;did.leg!.rot=-1.1*pulse(t,10.3,10.9);
   cheer(did,beat(t,11.4,12)*(1-beat(t,13.4,14)));
   coach.body.s=beat(t,12.8,13.6);notYet.s=beat(t,14,14.8)*(1-beat(t,19,19.8));
   academy.s=beat(t,16.6,17.4);xmark.s=beat(t,17.4,18);
   leMans.s=beat(t,20.4,21.2);study.s=beat(t,24.4,25.2);
   const hurt=beat(t,27.6,28.2)*(1-Math.max(beat(t,31,31.8),manual?beat(act,.1,.4):0));adult.body.s=beat(t,21.4,22.2)*(1-hurt);adultSad.body.s=beat(t,21.4,22.2)*hurt;
   rain.scale=hurt;rain.visible=hurt>.02;
   cones.forEach((c,i)=>{c.s=beat(t,22.4+i*.3,23+i*.3);});
   adult.armR.rot=.12+.6*wave(t,23,27,.8);
   // Stack the four blocks, one year at a time (four taps).
   base.s=beat(t,29.6,30.2);const n=manual?act*4:0;
   blocks.forEach((q,i)=>{const on=Math.max(clamp01(n-i),beat(t,30.6+i*.8,31.2+i*.8));q.scale=Math.max(.001,beat(on,0,.5));q.dy=.5*(1-on);q.visible=on>.02;});
   quote.s=beat(t,33.4,34.2);cheer(adult,Math.max(beat(t,36.8,37.4),manual?beat(act,.9,1):0));
   sun.dy=.5*beat(t,31,35);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,19.8,20.6)-.45*beat(t,38.4,39.2):0;
  };
 }};

/* ───────────── 4 · Patience pays off (patience) ───────────── */
const patience:SpreadDef={id:'patience',rest:31.5,
 left:k=>{pitch(k,-5,0,'#9ccf7a',INK.leaf);line(k,-5,Z(-1.9),0,Z(-1.9),.05,INK.white);
  k.text('1999',-2.5,Z(2.6),.52,INK.red,{max:2.4});k.text('FIRST CONTRACT · SON ISAAC',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-1.9),5,Z(-1.9),.05,INK.white);line(k,1.3,Z(-1.9),1.3,Z(-1.0),.05,INK.white);line(k,3.7,Z(-1.9),3.7,Z(-1.0),.05,INK.white);line(k,1.3,Z(-1.0),3.7,Z(-1.0),.05,INK.white);
  k.text('17 GOALS',2.5,Z(2.6),.5,INK.yellow,{max:3.4});k.text('GUINGAMP · THANKS TO THE TEAM',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);roofs(k,.2,12,2.1,4);crowd(k,4.5,2.1,2.5,[INK.red,INK.white,INK.yellow],3);k.fill(rect(0,2.5,4.5,.5),'#9ccf7a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.2,2.4,[INK.red,INK.white,INK.navy,INK.white],6);lightRig(k,1.1,.4);lightRig(k,3.6,.4);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('p-rain',1.4,.7),'L',2.3,2.3,{out:.03}),sun=bd.add(S.sun(K+'p-sun',.34),'R',3.9,2.2,{out:.012});
  const age=B.stand(S.scoreboard(K+'p-age',1.2,1.1,'AGE'),-4.0,-1.12,{layer:1,s:0});age.add(S.flipCard(K+'p-21',.9,.44,'21',INK.pink),0,.3,{z:.012});
  const did=B.person(K+'p-did',-2.7,.2,1.3,{...DID,shirt:'bib',face:'smile',layer:2});
  const contract=B.stand(lineCard('p-contract',1.3,.5,['FIRST','CONTRACT'],INK.yellow),-1.2,-1.1,{layer:1,s:0});
  const prm=B.stand(pram('p-pram',.7,.55),-1.6,.8,{layer:3,s:0});const isaac=B.stand(S.flipCard(K+'p-isaac',.8,.3,'ISAAC',INK.sky,INK.navy),-1.6,1.45,{layer:3,s:0});
  const post=B.stand(postP('p-post',.3,1.4),-3.9,1.0,{layer:2,s:0,tab:false});const arrowA=post.arm(arrowArm('p-arrow',.6,.9),0,1.36,{z:.02});
  const stamps=['INJURED','LOST HIS PLACE','NO GOALS'].map((l,i)=>B.stand(stamp(`p-st${i}`,1.3,.36,l),-4.0+i*.9,1.3+(i%2)*.55,{layer:3,s:0}));
  const coaches=[B.person(K+'p-c1',.8,-.6,1.7,{skin:'#f1b88f',hair:'short',hairColor:'#6b5a48',shirt:'coach',adult:true,face:'shy',layer:2}),B.person(K+'p-c2',.65,.3,1.65,{skin:'#d99a6c',hair:'bald',shirt:'coach',adult:true,face:'shy',layer:2})];
  const qb=B.stand(S.bubble(K+'p-q',.5,.46,'dots'),1.3,-1.5,{layer:1,s:0});
  const goal=B.stand(S.goal(K+'p-goal',1.6,.8),2.5,-1.64,{layer:1});void goal;
  const keeper=B.person(K+'p-keeper',2.5,-1.22,1.2,{shirt:'keeper',skin:'#f1b88f',hair:'short',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const did2=B.person(K+'p-did2',2.3,.8,1.3,{...DID,shirt:'casual',face:'grin',legs:'kick',layer:3});
  const mal=B.person(K+'p-mal',4.2,1.3,1.25,{skin:'#7f5138',hair:'bald',shirt:'casual',face:'grin',legs:'kick',layer:3});
  const tagM=B.stand(S.flipCard(K+'p-tagM',1.1,.3,'FLORENT MALOUDA',INK.white,INK.navy),4.1,2.0,{layer:3,s:0});
  const board=B.stand(S.scoreboard(K+'p-board',1.3,1.5,'NEXT SEASON'),4.3,-.9,{layer:2,s:0});board.add(S.flipCard(K+'p-17',1.0,.44,'17 GOALS',INK.yellow,INK.navy),0,.3,{z:.012});const bq=board.flap(S.flipCard(K+'p-bq',1.0,.44,'?',INK.blue),0,.74,{z:.03});
  const heartP=B.stand(heart('p-heart',.3),3.3,1.4,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'p-ball',.1),3.9,1.35,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,31.5):b.t;
   age.s=beat(t,2.2,3);did.body.s=beat(t,2.8,3.6);did.armR.rot=.12+1*pulse(t,4,7.6);
   contract.s=beat(t,9,9.8);prm.s=beat(t,12.2,13);isaac.s=beat(t,12.8,13.6);did.armL.rot=-.12-1.2*beat(t,13,13.6)+1.2*beat(t,15,15.6);
   post.s=beat(t,15.6,16.4);arrowA.rot=-1.2+2.7*beat(t,16.6,17.8);
   const bad=beat(t,20.2,21)*(1-beat(t,28,30));rain.scale=bad;rain.visible=bad>.02;rain.dx=.12*wave(t,21,28,.3);
   stamps.forEach((s2,i)=>{s2.s=beat(t,22.2+i*1.3,22.9+i*1.3)*(1-beat(t,28.6,29.4));});
   coaches.forEach((c,i)=>{c.body.s=beat(t,26.8+i*.4,27.6+i*.4);});qb.s=beat(t,27.8,28.6)*(1-beat(t,30,30.6));coaches[0].armR.rot=.12+.9*beat(t,29.8,30.4);
   keeper.body.s=beat(t,25.8,26.6);did2.body.s=beat(t,27.2,28);mal.body.s=beat(t,28.4,29.2);
   // Pass the ball to Didier: Malouda passes, Didier shoots, the card flips to 17.
   const u=manual?act:clamp01((t-31.8)/3.4);
   let bx:number,bz:number,dy=0;[bx,bz]=track(u,[[0,3.9,1.35],[.35,2.55,.85],[.5,2.55,.85],[.8,2.3,-1.38],[1,2.3,-1.38]]);dy=.3*pulse(u,.5,.8);
   ball.s=mal.body.s;ball.x=bx;ball.z=bz;ball.dy=dy;ball.rot=-bx*5;
   mal.leg!.rot=-1*pulse(u,-.02,.12);did2.leg!.rot=-1.1*pulse(u,.44,.56);
   const dive=pulse(u,.55,.95);keeper.body.rot=.8*dive;keeper.armL.rot=-.12-2*dive;keeper.armR.rot=.12+2*dive;
   board.s=beat(t,30.8,31.6);bq.flip=-3.1*Math.max(manual?beat(act,.8,1):0,beat(t,34.4,35));
   const joy=Math.max(beat(t,35,35.6),manual?beat(act,.9,1):0);cheer(did2,joy*(1-beat(t,37.4,38)));did2.armR.rot=Math.max(did2.armR.rot,.12+1.5*beat(t,37.8,38.4));
   tagM.s=beat(t,38.4,39.2);heartP.s=beat(t,39,39.6);cheer(mal,joy);
   sun.dy=.5*beat(t,31,35);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,26.2,27)+.45*beat(t,27,27.8)-.45*beat(t,40.2,41):0;
  };
 }};

/* ───────────── 5 · A wish for peace (peace) ───────────── */
const peace:SpreadDef={id:'peace',rest:23.2,
 left:k=>{pitch(k,-5,0,'#7fb862',INK.green);line(k,-5,Z(-1.9),0,Z(-1.9),.05,INK.white);
  k.text('IVORY COAST',-2.5,Z(2.6),.46,INK.orange,{max:4});k.text('8 OCTOBER 2005 · FIRST WORLD CUP!',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 right:k=>{planks(k,0,5);
  k.text('A WISH FOR PEACE',2.5,Z(2.6),.38,INK.blue,{max:4.3});k.text('HE ASKED FOR THE FIGHTING TO STOP',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.3,2.4,[INK.orange,INK.white,INK.green,INK.white],2);lightRig(k,1.0,.5);lightRig(k,3.6,.45);k.fill(rect(0,2.4,4.5,.6),'#7fb862');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{const wl=rect(0,0,4.5,3);k.fill(wl,'#e9e1cf');k.dots(wl,INK.grey,.05,.2);lockers(k,.2,10,.9,1.5);k.fill(rect(0,2.4,4.5,.6),'#caa06e');k.fill(rect(0,2.2,4.5,.2),INK.wood);k.key('M0 2.2 L4.5 2.2',.012);}},-3.05,1.22);
  const storms=[bd.add(stormCloud('w-st1',1.4,.7),'L',1.3,2.2,{out:.03}),bd.add(stormCloud('w-st2',1.2,.6),'L',3.3,2.5,{out:.03})];
  const sun=bd.add(S.sun(K+'w-sun',.36),'L',2.3,1.6,{out:.012});
  const doves=[bd.add(dove('w-d1',.5,.36),'L',1.0,2.3,{out:.04}),bd.add(dove('w-d2',.45,.32),'L',3.4,2.5,{out:.04}),bd.add(dove('w-d3',.5,.36),'R',1.6,2.55,{out:.04})];
  const five=B.stand(S.flipCard(K+'w-five',1.5,.32,'FIVE YEARS OF WAR',INK.grey,INK.navy),-2.5,-1.6,{layer:1,s:0});
  const qual=B.stand(lineCard('w-qual',1.8,.56,['WORLD CUP','QUALIFIED!'],INK.orange,INK.white),-3.4,-.9,{layer:1,s:0});
  const team=[[-4.2,.4,'#7f5138','short'],[-3.3,1.0,'#b27650','curly'],[-2.2,.5,'#7f5138','bald'],[-1.2,1.1,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`w-p${i}`,x as number,z as number,1.25,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:'casual',face:'grin',layer:3}));
  const cam=B.stand(camera('w-cam',.8,1.2),4.2,-.2,{layer:2,s:0});
  const did=B.person(K+'w-did',1.5,.1,1.3,{...DID,shirt:'casual',face:'open',layer:2});
  const mates=[B.person(K+'w-m1',.85,-.55,1.25,{skin:'#b27650',hair:'curly',hairColor:'#1d1a1f',shirt:'casual',face:'smile',layer:1}),B.person(K+'w-m2',2.4,-.7,1.25,{skin:'#7f5138',hair:'short',hairColor:'#1d1a1f',shirt:'casual',face:'smile',layer:1})];
  const bub=B.stand(doveBubble('w-bub',.8,.62),2.3,.85,{layer:3,s:0});
  const frame=B.stand(bannerFrame('w-frame',1.9,1.3),3.15,1.6,{layer:3,s:0});
  const ban=frame.flap(peaceBanner('w-ban',1.72,.7),0,1.2,{anchor:'top',z:.012});const roll=frame.add(bannerRoll('w-roll',1.72,.14),0,1.22,{anchor:'top',z:.02});
  const bouake=B.stand(stadium('w-bouake',1.8,1.2,'BOUAKÉ'),-1.1,-1.55,{layer:1,s:0});
  const fans=[[-.8,1.9,'coach'],[-1.8,2.0,'fan'],[-.4,1.3,'casual']].map(([x,z,sh],i)=>B.person(K+`w-f${i}`,x as number,z as number,.95,{skin:['#7f5138','#b27650','#d99a6c'][i],hair:(['bun','short','curly'] as const)[i],hairColor:'#1d1a1f',shirt:sh as 'fan',face:'grin',layer:3}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.2):b.t;
   const war=beat(t,2,3.2)*(1-Math.max(beat(t,25.6,27.6),manual?beat(act,.4,1):0));storms.forEach((s2,i)=>{s2.scale=war;s2.visible=war>.02;s2.dx=.12*wave(t,3,25,.25+i*.1);});
   five.s=beat(t,3,3.8)*(1-beat(t,7.2,8));sun.scale=Math.max(beat(t,26,27.4),manual?beat(act,.6,1):0);sun.visible=sun.scale>.02;
   qual.s=beat(t,8.2,9);team.forEach((p,i)=>{p.body.s=beat(t,7.6+i*.3,8.4+i*.3);cheer(p,beat(t,10+i*.2,10.6+i*.2)*(1-beat(t,14,14.6))+beat(t,31+i*.2,31.6+i*.2));});
   cam.s=beat(t,15.2,16);did.body.s=beat(t,15.6,16.4);mates.forEach((m,i)=>{m.body.s=beat(t,16+i*.4,16.8+i*.4);});
   did.armR.rot=.12+1.3*beat(t,17,17.6)-1.3*beat(t,22.6,23.2)+.2*wave(t,17.6,22.6,.8);did.armL.rot=-.12-.9*pulse(t,19.4,23);
   bub.s=beat(t,19.6,20.4)*(1-Math.max(beat(t,23.4,24.2),manual?beat(act,0,.3):0));
   // Unfold the peace banner: the rolled banner drops open from its rod.
   frame.s=beat(t,21.8,22.6);const un=Math.max(manual?beat(act,0,.7):0,beat(t,23.4,24.8));ban.flip=-2.9+2.9*un;roll.dy=-.7*un;
   doves.forEach((d,i)=>{const a=Math.max(manual?beat(act,.5+i*.1,.8+i*.1):0,beat(t,25.8+i*.5,26.6+i*.5));d.scale=Math.max(.001,a);d.visible=a>.02;d.dx=(i===2?-.4:.4)*beat(t,27,33);d.dy=.1*Math.sin(t*2+i);});
   cheer(did,Math.max(beat(t,26,26.6),manual?beat(act,.85,1):0));mates.forEach((m,i)=>cheer(m,beat(t,26.3+i*.2,26.9+i*.2)));
   bouake.s=beat(t,28.8,29.6);fans.forEach((f,i)=>{f.body.s=beat(t,30+i*.4,30.8+i*.4);cheer(f,beat(t,31.6+i*.2,32.2+i*.2),.2*wave(t,32.2,40,1.1+i*.1));});
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14.6,15.4)-.45*beat(t,27.8,28.6)+.0:0;
  };
 }};

/* ───────────── 6 · Giving back (hospital) ───────────── */
const hospital:SpreadDef={id:'hospital',rest:31.7,
 left:k=>{cobbles(k,-5,0);
  k.text('2007 · 2010',-2.5,Z(2.6),.46,INK.blue,{max:3.4});k.text('GOODWILL AMBASSADOR · ONE OF 100',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 right:k=>{dirt(k,0,5,'#d9c29a');footprints(k,.4,Z(1.9),4.6,Z(1.4),14);
  k.text('ABIDJAN',2.5,Z(2.6),.5,INK.orange,{max:3.2});k.text('A HOSPITAL FOR HIS HOMETOWN',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);roofs(k,.1,12,2.0,1);roofs(k,.3,11,2.45,3);k.fill(rect(0,2.45,4.5,.55),'#e2d6bc');}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);sea(k,4.5,1.8,.4);roofs(k,.3,10,2.3,6);palms(k,[.4,4.2],2.2);k.fill(rect(0,2.3,4.5,.7),'#d9c29a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'k-sun',.36),'R',2.2,1.9,{out:.012});const smallH=[bd.add(hSign('k-h1',.3),'R',.6,1.6,{out:.03}),bd.add(hSign('k-h2',.3),'R',3.6,1.5,{out:.03})];
  const bunt=bd.add(S.bunting(K+'k-bunt',2.6,.4,[INK.orange,INK.white,INK.green]),'R',.8,2.6,{out:.03});
  const did=B.person(K+'k-did',-2.6,.3,1.35,{...DID,shirt:'casual',adult:true,face:'smile',layer:2});
  const amb=B.stand(lineCard('k-amb',1.9,.56,['GOODWILL AMBASSADOR','UNITED NATIONS · 2007'],INK.sky),-3.75,-1.28,{layer:1,s:0});
  const mag=B.stand(magazine('k-mag',.8,1.1),-1.1,-1.3,{layer:1,s:0});const magC=B.stand(S.flipCard(K+'k-2010',.8,.3,'2010',INK.red),-1.1,-.3,{layer:2,s:0});
  const doveP=B.stand(dove('k-dove',.5,.36),-4.2,.2,{layer:2,s:0,tab:false});
  const jar=B.stand(coinJar('k-jar',.5,.62),-1.3,1.3,{layer:3,s:0});const coins=[0,1,2].map(i=>jar.add(coin(`k-coin${i}`,.07),.25,1.1,{anchor:'center',z:.02}));
  const money=B.stand(lineCard('k-money',1.8,.5,['THREE MILLION','POUNDS'],INK.gold),-3.4,1.6,{layer:3,s:0});
  const hbase=B.stand(hospitalBase('k-base',1.9,.7),2.6,-1.3,{layer:1,s:0});
  const floors=[0,1].map(i=>hbase.add(hospitalFloor(`k-f${i}`,1.9,.5,i===1),0,.7+i*.5,{z:.01}));const hs=hbase.add(hSign('k-hs',.36),0,1.72,{z:.012});
  const did2=B.person(K+'k-did2',1.3,.5,1.35,{...DID,shirt:'casual',adult:true,face:'smile',layer:2});
  const kid=B.person(K+'k-kid',2.0,1.2,.85,{...DID,shirt:'casual',face:'grin',layer:3});
  const people=[[3.5,.6,'coach','long'],[4.3,1.1,'fan','short'],[3.1,1.6,'bib','bun']].map(([x,z,sh,hr],i)=>B.person(K+`k-p${i}`,x as number,z as number,i===2?.9:1.5,{skin:['#7f5138','#b27650','#7f5138'][i],hair:hr as 'short',hairColor:'#1d1a1f',shirt:sh as 'fan',adult:i<2,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`k-heart${i}`,.26),1.2+i*.7,2.1,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,31.7):b.t;
   did.body.s=beat(t,1.2,2);amb.s=beat(t,2.6,3.4);did.armR.rot=.12+1.2*pulse(t,3.4,6.6);
   mag.s=beat(t,8,8.8);magC.s=beat(t,8.6,9.4);doveP.s=beat(t,13,13.8);doveP.dy=.08*Math.sin(t*2);
   jar.s=beat(t,17,17.8);coins.forEach((c,i)=>{const d=beat(t,[18.4,19.4,20.4][i],[19,20,21][i]);c.dy=-.45*d;c.visible=t>[18,19,20][i]&&d<.98;c.rot=t*2;});money.s=beat(t,21.4,22.2);
   did2.body.s=beat(t,22.6,23.4);smallH.forEach((h,i)=>{h.scale=Math.max(.001,beat(t,27.2+i*.6,27.8+i*.6));h.visible=h.scale>.02;});did2.body.x=1.3+.3*wave(t,27.4,31,.4);did2.armR.rot=.12+1.2*pulse(t,27.6,30.6);
   // Build the hospital: the base stands up, then two floors and the H sign pop up in turn.
   const build=Math.max(manual?act:0,beat(t,31.8,33.6));hbase.s=Math.max(beat(t,30.6,31.4),manual?1:0);
   floors.forEach((f,i)=>{const a=beat(build,.15+i*.3,.45+i*.3);f.scale=Math.max(.001,a);f.visible=a>.02;f.dy=.3*(1-a);});const ha=beat(build,.75,1);hs.scale=Math.max(.001,ha);hs.visible=ha>.02;
   kid.body.s=beat(t,33.8,34.6);did2.armL.rot=-.12-.8*beat(t,34.6,35.2);kid.armR.rot=.12+.8*beat(t,34.6,35.2);
   people.forEach((p,i)=>{p.body.s=Math.max(beat(t,35+i*.4,35.8+i*.4),manual?beat(act,.8,1):0);cheer(p,beat(t,37.6+i*.2,38.2+i*.2));});
   hearts.forEach((h,i)=>{h.s=beat(t,38+i*.5,38.6+i*.5);});bunt.scale=beat(t,36.4,37.4);bunt.visible=bunt.scale>.02;cheer(kid,beat(t,38.4,39));
   sun.dy=.5*beat(t,16,20);
   return b.narrated?-.45*beat(t,1,2)+.45*beat(t,16.4,17.2)-.45*beat(t,17.2,18)+.45*beat(t,22.2,23)-.45*beat(t,37,38):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={homesick,together,latestart,patience,peace,hospital};
