/**
 * The six George Weah pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/weah/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: parents stepping apart, a bench, rain clouds that clear, a points card.
 * Kits are plain colours with no crests or logos.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,clamp01,smooth,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='weah-',TAU=Math.PI*2;
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

/* ───────────── Weah-only plates ───────────── */
const GEO={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a1f'};
const GRAN={skin:'#7f5138',hair:'bun' as const,hairColor:'#d8d4cc'};
const houseInside=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wl=rect(0,h*.2,w,h*.8);k.fill(wl,'#f6d9a4');k.dots(wl,INK.orange,.04,.2);k.key(wl,.014);
 const face=(x:number,y:number,r:number,hair:string,c:string)=>{k.fill(`M${x-r*1.3} ${y+r*2.1} Q${x} ${y+r*.8} ${x+r*1.3} ${y+r*2.1} Z`,c);k.fill(ell(x,y,r,r*1.1),'#7f5138');k.key(ell(x,y,r,r*1.1),.01);k.fill(`M${x-r} ${y-r*.3} Q${x} ${y-r*1.5} ${x+r} ${y-r*.3} Q${x} ${y-r*.8} ${x-r} ${y-r*.3} Z`,hair);k.circle(x-r*.35,y,r*.12,INK.navy,true);k.circle(x+r*.35,y,r*.12,INK.navy,true);k.key(`M${x-r*.35} ${y+r*.45} Q${x} ${y+r*.7} ${x+r*.35} ${y+r*.45}`,.01);};
 face(w*.5,h*.4,w*.09,'#d8d4cc',INK.pink);
 [[.16,.62,INK.yellow],[.3,.7,INK.sky],[.7,.7,INK.green],[.84,.62,INK.orange],[.23,.46,INK.blue],[.77,.46,INK.red]].forEach(([x,y,c])=>face(w*(x as number),h*(y as number),w*.055,'#1d1a1f',c as string));
 k.fill(rect(w*.3,h*.9,w*.4,h*.08),INK.white);k.text('GRANDMA EMMA',w/2,h*.965,h*.05,INK.navy,{max:w*.38});});
const houseFront=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wl=rect(w*.04,h*.26,w*.92,h*.74);k.fill(wl,'#e9c58f');k.hatch(wl,'#a9793f',.06,1.57,.01);k.key(wl,.014);
 const roof=poly([[-.04,h*.3],[w*.5,0],[w+.04,h*.3]]);k.fill(roof,'#aab0bf');k.hatch(roof,'#6f7486',.05,1.4,.012);k.key(roof,.014);
 const d=rect(w*.42,h*.56,w*.16,h*.44);k.fill(d,INK.brown);k.key(d,.012);for(const x of [.14,.7]){const wn=rect(w*x,h*.46,w*.16,h*.16);k.fill(wn,INK.yellow);k.key(wn,.012);}k.text('LIFT',w/2,h*.2,h*.08,INK.navy);},{rim:.015});
const cradle=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.4} Q${w/2} ${h*1.05} ${w} ${h*.4} Z`;k.fill(b,INK.wood);k.hatch(b,'#8a5238',.03,.4,.01);k.key(b,.013);k.fill(ell(w*.36,h*.36,w*.12,w*.12),'#7f5138');k.key(ell(w*.36,h*.36,w*.12,w*.12),.01);k.fill(`M${w*.46} ${h*.46} Q${w*.7} ${h*.2} ${w*.92} ${h*.42} Z`,INK.sky);k.key(`M${w*.46} ${h*.46} Q${w*.7} ${h*.2} ${w*.92} ${h*.42}`,.01);});
const stepBlock=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.fill(rect(0,0,w,.08),INK.white);k.text(label,w/2,Math.min(h*.6,.42),.2,INK.navy,{max:w*.8});});
const switchboard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.8);k.fill(b,INK.wood);k.key(b,.014);const p=rect(w*.08,h*.08,w*.84,h*.5);k.fill(p,INK.night);k.key(p,.01);for(let r=0;r<3;r++)for(let c=0;c<6;c++)k.circle(w*(.16+c*.136),h*(.18+r*.14),.03,(r*6+c)%4===0?INK.yellow:INK.grey);
 k.key(`M${w*.2} ${h*.32} Q${w*.35} ${h*.7} ${w*.52} ${h*.46} M${w*.6} ${h*.18} Q${w*.72} ${h*.66} ${w*.84} ${h*.32}`,.02,INK.red);k.fill(rect(0,h*.62,w,h*.18),'#c98d5d');for(const x of [.06,.88])k.keyFill(rect(w*x,h*.8,w*.06,h*.2),INK.brown);k.text('TELEPHONE',w/2,h*.75,h*.08,INK.white,{max:w*.8});});
const doorway=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wl=rect(0,h*.1,w,h*.9);k.fill(wl,'#f2dcb8');k.dots(wl,INK.pink,.04,.2);k.key(wl,.014);const top=rect(-.04,0,w+.08,h*.14);k.fill(top,INK.red);k.key(top,.012);k.text('MONACO',w/2,h*.11,h*.08,INK.white,{max:w*.8});
 const o=rect(w*.2,h*.26,w*.6,h*.74);k.fill(o,INK.sky2);k.dots(o,INK.yellow,.04,(x,y)=>.6-y/h*.5);const sea2=rect(w*.2,h*.64,w*.6,h*.18);k.fill(sea2,INK.blue);k.fill(rect(w*.2,h*.82,w*.6,h*.18),INK.grass);k.key(o,.014);});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,'#3d5da0');k.hatch(d,INK.navy,.05,1.57,.01);k.key(d,.014);k.fill(rect(w*.15,h*.1,w*.7,h*.3),INK.sky);k.key(rect(w*.15,h*.1,w*.7,h*.3),.01);k.circle(w*.85,h*.55,.03,INK.gold);k.text('OPEN',w/2,h*.75,h*.09,INK.yellow);},{rim:.014});
const planeP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const body=`M0 ${h*.5} Q${w*.1} ${h*.35} ${w*.9} ${h*.4} L${w} ${h*.5} L${w*.9} ${h*.6} Q${w*.1} ${h*.65} 0 ${h*.5} Z`;k.fill(body,INK.white);k.key(body,.012);k.fill(poly([[w*.4,h*.45],[w*.62,0],[w*.7,0],[w*.58,h*.45]]),'#9aa0b5');k.fill(poly([[w*.4,h*.55],[w*.62,h],[w*.7,h],[w*.58,h*.55]]),'#9aa0b5');k.fill(poly([[w*.84,h*.45],[w*.92,h*.1],[w*.98,h*.1],[w*.96,h*.45]]),'#9aa0b5');for(let i=0;i<5;i++)k.circle(w*(.3+i*.1),h*.47,.018,INK.sky);},{rim:.015});
const libFlag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.05,h),INK.brown);const fw=w-.05,fh=h*.5;for(let i=0;i<11;i++)k.fill(rect(.05,.02+i*fh/11,fw,fh/11),i%2?INK.white:INK.red);const c=rect(.05,.02,fw*.4,fh*5/11);k.fill(c,INK.navy);const cx=.05+fw*.2,cy=.02+fh*2.5/11,r=fh*.16;k.fill(poly(Array.from({length:10},(_,i)=>[cx+Math.cos(i*.628-1.57)*(i%2?r*.4:r),cy+Math.sin(i*.628-1.57)*(i%2?r*.4:r)])),INK.white);k.key(rect(.05,.02,fw,fh),.01);});
const pointsBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.84);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.15);k.key(b,.016);k.fill(rect(0,0,w,h*.16),INK.navy);k.text('2002 QUALIFYING',w/2,h*.12,h*.08,INK.yellow,{max:w*.84});for(const x of [.12,.84])k.keyFill(rect(w*x,h*.84,w*.05,h*.16),INK.brown);});
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.06],[w+.05,h*.32]]);k.fill(roof,INK.blue);k.key(roof,.014);
 for(let i=0;i<4;i++){const wx=w*(.06+i*.25);if(i===1||i===2)continue;k.fill(rect(wx,h*.45,w*.16,h*.18),INK.sky);k.key(rect(wx,h*.45,w*.16,h*.18),.01);}
 const s2=rect(w*.2,h*.33,w*.6,h*.1);k.fill(s2,INK.white);k.key(s2,.01);k.text('SCHOOL',w/2,h*.41,h*.075,INK.navy,{max:w*.55});
 const d=rect(w*.34,h*.52,w*.32,h*.48);k.fill(d,INK.yellow);k.dots(d,INK.orange,.03,.3);k.key(d,.012);for(let i=0;i<4;i++)k.fill(rect(w*(.37+i*.07),h*.62,w*.04,h*.3),INK.navy,.7);});
const schoolDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.red);k.hatch(d,'#9c3a30',.04,1.57,.01);k.key(d,.013);k.circle(w*.5,h*.55,.025,INK.gold);},{rim:.012});
const books=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.red,INK.blue,INK.yellow,INK.green];for(let i=0;i<4;i++){const b=rect(w*(.04+i*.02),h*(.75-i*.22),w*.9,h*.2);k.fill(b,cs[i]);k.key(b,.012);k.fill(rect(w*(.1+i*.02),h*(.8-i*.22),w*.7,h*.04),INK.white);}});

/* ───────────── 1 · Grandma Emma's house (claratown) ───────────── */
const claratown:SpreadDef={id:'claratown',rest:17.7,
 left:k=>{dirt(k,-5,0,'#d6bd8e');footprints(k,-4.2,Z(1.5),-.5,Z(.9),11);
  k.text('MONROVIA',-2.5,Z(2.6),.5,INK.blue,{max:3.6});k.text('LIBERIA · 1 OCTOBER 1966',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{dirt(k,0,5);footprints(k,.5,Z(1.8),4.4,Z(1.4),12);
  k.text('CLARA TOWN',2.5,Z(2.6),.46,INK.red,{max:4});k.text('RAISED BY GRANDMA EMMA',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.5);sea(k,4.5,1.6,.5);roofs(k,.2,12,2.3,2);palms(k,[.4,3.1],2.2);k.fill(rect(0,2.3,4.5,.7),'#d6bd8e');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);tinRoofs(k,.1,11,2.0,3);tinRoofs(k,.3,10,2.45,5);palms(k,[3.8],2.0);k.fill(rect(0,2.45,4.5,.55),'#d9b47a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'c-sun',.34),'R',3.6,1.8,{out:.012}),cloud=bd.add(S.cloud(K+'c-cloud',.9,.4),'L',2.8,2.5),birds=bd.add(S.birds(K+'c-birds',.8,.3),'L',1.3,2.3,{out:.02});
  const sign=B.stand(signBoard('c-sign',1.3,1.15,'MONROVIA'),-3.8,-1.2,{layer:1,s:0});const c66=sign.flap(S.flipCard(K+'c-1966',1.2,.44,'1966',INK.pink),0,1.15*.56,{z:.03});
  const crib=B.stand(cradle('c-crib',.9,.5),-2.4,.9,{layer:3,s:0});
  const pa=B.person(K+'c-pa',-3.1,.3,1.7,{...GEO,shirt:'navy',adult:true,face:'smile',layer:2}),ma=B.person(K+'c-ma',-1.7,.3,1.6,{skin:'#7f5138',hair:'long',hairColor:'#1d1a1f',shirt:'coach',adult:true,face:'smile',layer:2});
  const town=B.stand(signBoard('c-town',1.3,1.15,'CLARA TOWN',INK.yellow),-.9,-1.7,{layer:1,s:0});
  const cloudL=bd.add(stormCloud('c-grey',1.2,.6),'L',1.6,1.9,{out:.03});
  const house=B.stand(houseInside('c-inside',2.1,1.6),2.4,-1.3,{layer:1,s:0});const roof=house.flap(houseFront('c-front',2.1,1.6),0,1.6,{z:.02});
  const gran=B.person(K+'c-gran',1.3,.3,1.55,{...GRAN,shirt:'coach',adult:true,face:'smile',layer:2});
  const kids=[[2.2,.6,1.0,'short','bib'],[3.0,.35,.95,'bun','fan'],[3.8,.6,1.05,'curly','casual'],[2.6,1.4,.9,'short','navy'],[3.5,1.5,.95,'bun','bib'],[4.4,1.2,1.0,'short','fan']].map(([x,z,h,hr,sh],i)=>B.person(K+`c-kid${i}`,x as number,z as number,h as number,{skin:['#7f5138','#b27650'][i%2],hair:hr as 'short',hairColor:'#1d1a1f',shirt:sh as 'bib',face:'grin',layer:3}));
  const george=B.person(K+'c-george',1.6,1.6,.9,{...GEO,shirt:'casual',face:'grin',layer:3});
  const thirteen=B.stand(S.flipCard(K+'c-13',1.2,.34,'13 CHILDREN',INK.yellow,INK.navy),.8,-.6,{layer:2,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`c-heart${i}`,.26),1.5+i*1.2,2.15,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.7):b.t;
   sun.dy=.5*beat(t,0,2.2);cloud.dx=.4*beat(t,0,40);birds.dx=.9*beat(t,1,12);
   sign.s=beat(t,2.2,3);c66.flip=-2.9+2.9*beat(t,4.8,5.6);crib.s=beat(t,6,6.8);pa.body.s=beat(t,6.6,7.4);ma.body.s=beat(t,7,7.8);
   town.s=beat(t,9.6,10.4);
   // The parents separate: they step apart and fold away; the cradle stays in the middle.
   const apart=beat(t,14,15.6);pa.body.x=-3.1-.9*apart;ma.body.x=-1.7+.9*apart;pa.body.s*=1-beat(t,16,17);ma.body.s*=1-beat(t,16,17);
   cloudL.scale=beat(t,13.8,14.8)*(1-beat(t,19,21));cloudL.visible=cloudL.scale>.02;
   house.s=beat(t,16.4,17.3);const lift=Math.max(manual?beat(act,0,.7):0,beat(t,17.9,19.3));roof.flip=-2.85*lift;
   gran.body.s=Math.max(manual?beat(act,.4,.8):0,beat(t,19.8,20.8));thirteen.s=beat(t,22.6,23.4);
   kids.forEach((c,i)=>{c.body.s=Math.max(manual?beat(act,.55+i*.07,.8+i*.07):0,beat(t,23.4+i*.4,24+i*.4));});george.body.s=beat(t,21.4,22.2);
   // Growing up together: hands reach out, arms wave.
   const tog=beat(t,27.6,28.6);kids.forEach((c,i)=>{c.armL.rot=-.12-1.1*tog;c.armR.rot=.12+1.1*tog+.25*wave(t,28.6,34,1+i*.1);});gran.armL.rot=-.12-1.5*tog;gran.armR.rot=.12+1.5*tog;cheer(george,Math.max(beat(t,36,36.6),manual?beat(act,.9,1):0));
   hearts.forEach((h,i)=>{h.s=beat(t,31+i*.5,31.6+i*.5);});
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,16,16.8)+.45*beat(t,16.8,17.6)-.45*beat(t,34.4,35.2):0;
  };
 }};

/* ───────────── 2 · The Young Survivors (survivors) ───────────── */
const survivors:SpreadDef={id:'survivors',rest:19.1,
 left:k=>{dirt(k,-5,0);dash(k,-4.7,Z(-.8),-.3,Z(-.8),.04,INK.white);
  k.text('YOUNG SURVIVORS',-2.5,Z(2.6),.4,INK.pink,{max:4.3});k.text('CLARA TOWN · 1981',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,.4,Z(1.3),4.6,Z(-1.4),.06,INK.white);for(let i=0;i<4;i++)k.fill(ell(.8+i*1.2,Z(1.05-i*.85),.12,.08),INK.white);
  k.text('STEP BY STEP',2.5,Z(2.6),.44,INK.blue,{max:4});k.text('TWO PROMOTIONS IN THREE YEARS',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);tinRoofs(k,.2,11,2.3,1);palms(k,[1.2,3.6],2.1);k.fill(rect(0,2.3,4.5,.7),'#d9b47a');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.4,2.4,[INK.red,INK.white,INK.blue,INK.white],2);lightRig(k,1.3,.6);lightRig(k,3.6,.5);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.34),'L',3.8,1.9,{out:.012});
  const club=B.stand(S.banner(K+'s-club',2.2,.46,'YOUNG SURVIVORS',INK.pink),-2.8,-1.5,{layer:1,s:0});
  const goal=B.stand(stickGoal('s-goal',1.4,.7),-1.2,-1.85,{layer:1});void goal;
  const geo=B.person(K+'s-geo',-2.6,.6,1.15,{...GEO,shirt:'bib',face:'grin',legs:'kick',layer:3});
  const card15=B.stand(S.flipCard(K+'s-15',.9,.32,'AGE 15',INK.yellow,INK.navy),-4.2,.2,{layer:2,s:0});
  const mates=[[-3.9,1.2,'#b27650','curly'],[-1.6,1.3,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.1,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:'bib',face:'grin',layer:3}));
  const pows=[0,1].map(i=>B.stand(pow(`s-pow${i}`,.2),-1.6+i*.5,-1.4,{layer:2,s:0,tab:false}));
  const goals34=B.stand(lineCard('s-34',1.3,.5,['1982','34 GOALS'],INK.yellow),-4.0,-.55,{layer:2,s:0});
  const steps=[['4TH',.35,INK.sky],['3RD',.7,INK.yellow],['2ND',1.05,INK.pink]].map(([l,h,c],i)=>B.stand(stepBlock(`s-step${i}`,.95,h as number,l as string,c as string),1.1+i*1.2,.6-i*.8,{layer:2,s:0}));
  const climber=B.person(K+'s-geo2',1.1,.75,1.15,{...GEO,shirt:'bib',face:'grin',layer:3});
  const flagP=B.stand(clubFlag('s-flag',.6,1.0,INK.pink,INK.white),4.4,-1.08,{layer:1,s:0});
  const arrowP=B.stand(S.arrow(K+'s-up',.9,.4,INK.yellow),.7,1.9,{layer:3,s:0});
  const ball=ballPair(B,S.ball(K+'s-ball',.1),S.ball(K+'s-ball',.1));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.1):b.t;
   sun.dy=.5*beat(t,0,2);geo.body.s=beat(t,2.2,3);card15.s=beat(t,2.8,3.6)*(1-beat(t,9,9.6));club.s=beat(t,7.2,8);mates.forEach((m,i)=>{m.body.s=beat(t,4.4+i*.5,5.2+i*.5);});
   // Two amazing goals on his first game.
   const kicks=[10.4,12.6];let bx=-2.4,bz=.65,dy=0;for(const k0 of kicks)if(t>=k0&&t<k0+.8){const u=(t-k0)/.8;bx=-2.4+1.2*u;bz=.65-2.3*u;dy=.4*Math.sin(u*Math.PI);}
   geo.leg!.rot=-1.1*Math.max(...kicks.map(k0=>pulse(t,k0-.25,k0+.35)));pows.forEach((p,i)=>{p.s=pulse(t,kicks[i]+.7,kicks[i]+1.8);});
   cheer(geo,beat(t,14.2,14.8)*(1-beat(t,17.6,18.2)));mates.forEach((m,i)=>cheer(m,beat(t,14.4+i*.2,15+i*.2)*(1-beat(t,17.6,18.2))+beat(t,36.8,37.4)));
   goals34.s=beat(t,15.2,16);
   steps.forEach((s2,i)=>{s2.s=Math.max(beat(t,17+i*.4,17.8+i*.4),manual?1:0);});
   climber.body.s=beat(t,17.8,18.6);
   // Climb: 4th → 3rd → 2nd. Stepped action: 1/2 then 2/2.
   const n=manual?act*2:0,up1=Math.max(clamp01(n),beat(t,25.6,26.8)),up2=Math.max(clamp01(n-1),beat(t,28.8,30));
   climber.body.x=1.1+1.2*up1+1.2*up2;climber.body.z=.75-.8*up1-.8*up2;climber.body.dy=.35+.35*up1+.35*up2+.25*Math.sin(Math.PI*up1)*(up1<1?1:0)+.25*Math.sin(Math.PI*up2)*(up2<1?1:0);
   climber.body.visible=true;
   flagP.s=beat(t,21,21.8);arrowP.s=beat(t,32,32.8);arrowP.rot=.5-.5*beat(t,32.8,33.4);arrowP.dx=.3*wave(t,33,36,.6);
   cheer(climber,Math.max(beat(t,30.2,30.8)*(1-beat(t,31.8,32.4))+beat(t,36.8,37.4),manual?beat(act,.9,1):0));
   ball(bx,bz,dy,t>9.8&&t<16);
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,16.6,17.6)-.45*beat(t,36,37):0;
  };
 }};

/* ───────────── 3 · Left on the bench (bench) ───────────── */
const bench:SpreadDef={id:'bench',rest:19.4,
 left:k=>{pitch(k,-5,0);line(k,-5,Z(-1.9),0,Z(-1.9),.05,INK.white);for(let i=0;i<5;i++)k.fill(rect(-4.5+i*.9,Z(1.2),.5,.08),INK.white);
  k.text('LEFT ON THE BENCH',-2.5,Z(2.6),.38,INK.red,{max:4.3});k.text('MIGHTY BARROLLE · 1985',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-1.9),5,Z(-1.9),.05,INK.white);
  k.text('CHAMPIONS · 1987',2.5,Z(2.6),.4,INK.blue,{max:4.2});k.text('INVINCIBLE ELEVEN · TOP SCORER',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.4,[INK.blue,INK.white,INK.yellow,INK.white],1);lightRig(k,1.0,.5);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.4,[INK.navy,INK.white,INK.red,INK.white],5);lightRig(k,3.5,.5);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'b-sun',.34),'R',3.9,2.2,{out:.012});
  const clubL=B.stand(signBoard('b-clubL',1.4,1.1,'MIGHTY BARROLLE',INK.yellow),-3.9,-1.12,{layer:1,s:0});
  const goalL=B.stand(S.goal(K+'b-goalL',1.4,.75),-1.6,-1.8,{layer:1});void goalL;
  const starters=[[-2.2,-.5,'#b27650','curly'],[-.9,-.2,'#7f5138','short']].map(([x,z,sk,hr],i)=>B.person(K+`b-st${i}`,x as number,z as number,1.3,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:'bib',face:'grin',layer:2}));
  const geo=B.person(K+'b-geo',-3.3,.75,1.3,{...GEO,shirt:'bib',face:'shy',layer:2});
  const benchP=B.stand(S.bench(K+'b-bench',1.5,.5),-3.3,1.05,{layer:3});
  const goals=[0,1,2].map(i=>B.stand(S.ball(K+`b-g${i}`,.09),-4.4+i*.28,.2,{layer:2,s:0,tab:false}));
  const notPicked=B.stand(stamp('b-np',1.3,.38,'NOT PICKED'),-4.0,1.9,{layer:3,s:0});
  const sw=B.stand(switchboard('b-switch',1.1,.9),-1.1,1.3,{layer:3,s:0});
  B.slot(-2.7,1.55,-.5,1.55);
  const clubR=B.stand(signBoard('b-clubR',1.5,1.1,'INVINCIBLE ELEVEN',INK.white),1.0,-1.6,{layer:1,s:0});const c86=clubR.flap(S.flipCard(K+'b-86',1.3,.4,'1986',INK.pink),0,1.1*.56,{z:.03});
  const geo2=B.person(K+'b-geo2',.9,.4,1.3,{...GEO,shirt:'navy',face:'grin',legs:'kick',layer:3});
  const team=[[2.2,-.3,'#b27650','curly'],[3.3,.6,'#7f5138','short'],[4.3,-.1,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`b-t${i}`,x as number,z as number,1.3,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:'navy',face:'grin',layer:2}));
  const cup=B.stand(S.trophy(K+'b-cup',.55,.9),3.0,-1.5,{layer:1,s:0});
  const cards=[B.stand(S.flipCard(K+'b-top',1.1,.32,'TOP SCORER',INK.yellow,INK.navy),2.0,1.5,{layer:3,s:0}),B.stand(S.flipCard(K+'b-pos',1.5,.32,'PLAYER OF THE SEASON',INK.pink),3.8,1.95,{layer:3,s:0})];
  const ball=ballPair(B,S.ball(K+'b-ball',.1),S.ball(K+'b-ball',.1));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.4):b.t;
   clubL.s=beat(t,2.2,3);starters.forEach((p,i)=>{p.body.s=beat(t,3+i*.4,3.8+i*.4);});geo.body.s=beat(t,3.8,4.6);
   goals.forEach((g,i)=>{g.s=beat(t,7.6+i*.5,8.1+i*.5);});
   notPicked.s=beat(t,10,10.8)*(1-Math.max(beat(t,19.8,20.6),manual?beat(act,0,.3):0));
   sw.s=beat(t,12.6,13.4);geo.armR.rot=.12+1.2*pulse(t,13.4,18);
   // Slide him off the bench: along the slot to the gutter, then the new club on the right.
   const slide=Math.max(manual?beat(act,0,.55):0,beat(t,19.6,21));geo.body.x=-3.3+2.6*slide;geo.body.z=.75+.8*slide;geo.body.s=beat(t,3.8,4.6)*(1-Math.max(manual?beat(act,.5,.65):0,beat(t,21,21.6)));
   clubR.s=beat(t,20.8,21.6);c86.flip=-2.9+2.9*beat(t,22.4,23.2);
   geo2.body.s=Math.max(manual?beat(act,.6,.85):0,beat(t,21.6,22.4));team.forEach((p,i)=>{p.body.s=beat(t,24+i*.4,24.8+i*.4);});
   let bx=1.3,bz=.45,dy=0,vis=t>21.8||manual;if(t>=26.4&&t<27.4){const u=beat(t,26.4,27.4);bx=1.3+1.6*u;bz=.45-2.2*u;dy=.35*Math.sin(u*Math.PI);}else if(t>=27.4){bx=2.9;bz=-1.75;vis=t<28.4;}
   if(t<21.8&&!manual){vis=t>2&&t<18;bx=-2.0;bz=-.3;dy=.2*Math.abs(Math.sin(t*3));}
   geo2.leg!.rot=-1.1*pulse(t,26.1,26.7);
   cup.s=beat(t,28.6,29.4);cards.forEach((c,i)=>{c.s=beat(t,30.6+i*1.6,31.4+i*1.6);});
   const joy=Math.max(beat(t,29,29.6),manual?beat(act,.85,1):0);cheer(geo2,joy);team.forEach((p,i)=>cheer(p,beat(t,29.4+i*.2,30+i*.2)));
   sun.dy=.5*beat(t,21,24);ball(bx,bz,dy,vis);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,20.6,21.4)+.45*beat(t,21.4,22.2)-.45*beat(t,35,35.8):0;
  };
 }};

/* ───────────── 4 · Someone who believed (monaco) ───────────── */
const monaco:SpreadDef={id:'monaco',rest:21.4,
 left:k=>{pitch(k,-5,0,'#7fb862',INK.green);line(k,-5,Z(-1.9),0,Z(-1.9),.05,INK.white);
  k.text('CAMEROON · 1987',-2.5,Z(2.6),.4,INK.green,{max:4.2});k.text('TONNERRE YAOUNDÉ',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{cobbles(k,0,5);
  k.text('MONACO · 1988',2.5,Z(2.6),.42,INK.red,{max:4.2});k.text('ARSÈNE WENGER BELIEVED IN HIM',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);const hill=`M0 1.8 Q1.2 1.1 2.4 1.6 Q3.6 1.9 4.5 1.4 L4.5 3 L0 3 Z`;k.fill(hill,'#7fb862');k.dots(hill,INK.green,.05,.35);roofs(k,.4,10,2.35,2);k.fill(rect(0,2.4,4.5,.6),'#7fb862');}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const hill=`M0 1.2 Q1.4 .6 2.8 1.0 Q3.8 1.3 4.5 .9 L4.5 3 L0 3 Z`;k.fill(hill,'#a9bd7e');roofs(k,.2,12,1.8,3);sea(k,4.5,1.9,.5);k.fill(rect(0,2.4,4.5,.6),'#e2d6bc');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'m-sun',.34),'R',3.8,2.3,{out:.012});
  const flyR=bd.add(planeP('m-planeR',.9,.4),'R',.4,2.3,{out:.035}),flyL=bd.add(planeP('m-planeL',.9,.4),'L',.6,2.3,{out:.035});
  const sign=B.stand(signBoard('m-sign',1.3,1.1,'CAMEROON'),-3.9,-1.12,{layer:1,s:0});
  const goalL=B.stand(S.goal(K+'m-goal',1.4,.75),-1.9,-1.8,{layer:1});void goalL;
  const geo=B.person(K+'m-geo',-2.4,.5,1.3,{...GEO,shirt:'ger',face:'grin',legs:'kick',layer:3});
  const pows=[0,1].map(i=>B.stand(pow(`m-pow${i}`,.2),-2.3+i*.5,-1.45,{layer:2,s:0,tab:false}));
  const twice=B.stand(S.flipCard(K+'m-2',1.3,.32,'2 GOALS · FIRST GAME',INK.yellow,INK.navy),-4.1,1.0,{layer:3,s:0});
  const leroy=B.person(K+'m-leroy',-.9,-.3,1.7,{skin:'#f1b88f',hair:'short',hairColor:'#8a8a8a',shirt:'coach',adult:true,face:'smile',layer:2});
  const tagL=B.stand(S.flipCard(K+'m-tagL',1.1,.3,'CLAUDE LE ROY',INK.white,INK.navy),-.9,.45,{layer:2,s:0});
  const bubL=B.stand(S.bubble(K+'m-bub',.55,.5,'star'),-.45,-1.2,{layer:1,s:0});
  const wenger=B.person(K+'m-wenger',3.9,-.1,1.8,{skin:'#f1b88f',hair:'short',hairColor:'#b9b3a7',shirt:'navy',adult:true,face:'smile',layer:2});
  const tagW=B.stand(S.flipCard(K+'m-tagW',1.2,.3,'ARSÈNE WENGER',INK.white,INK.navy),3.9,.65,{layer:2,s:0});
  const doorF=B.stand(doorway('m-door',1.4,1.6),1.7,-1.2,{layer:1,s:0});const leaf=doorF.flap(doorLeaf('m-leaf',.84,1.18),-1.4*.3,0,{anchor:'bl',axis:'y',z:.012});
  const geo2=B.person(K+'m-geo2',1.7,-.4,1.3,{...GEO,shirt:'bib',face:'grin',layer:2});
  const signed=B.stand(lineCard('m-1988',1.1,.5,['1988','SIGNED'],INK.pink,INK.white),.9,1.2,{layer:3,s:0});
  const award=B.stand(S.trophy(K+'m-award',.5,.8),3.0,1.3,{layer:3,s:0});const awardC=B.stand(lineCard('m-afoy',1.8,.56,['AFRICAN FOOTBALLER','OF THE YEAR · 1989'],INK.yellow),3.2,2.05,{layer:3,s:0});
  const flags=[B.stand(libFlag('m-flag0',.6,.9),-3.9,1.7,{layer:3,s:0}),B.stand(libFlag('m-flag1',.6,.9),-1.6,1.8,{layer:3,s:0})];
  const ball=ballPair(B,S.ball(K+'m-ball',.1),S.ball(K+'m-ball',.1));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.4):b.t;
   sign.s=beat(t,2,2.8);geo.body.s=beat(t,2.6,3.4);
   const kicks=[6,7.6];let bx=-2.2,bz=.55,dy=0;for(const k0 of kicks)if(t>=k0&&t<k0+.8){const u=(t-k0)/.8;bx=-2.2+.2*u;bz=.55-2.2*u;dy=.4*Math.sin(u*Math.PI);}
   geo.leg!.rot=-1.1*Math.max(...kicks.map(k0=>pulse(t,k0-.25,k0+.35)));pows.forEach((p,i)=>{p.s=pulse(t,kicks[i]+.7,kicks[i]+1.8);});twice.s=beat(t,8.4,9.2);cheer(geo,beat(t,8.6,9.2)*(1-beat(t,10.4,11)));
   leroy.body.s=beat(t,10.5,11.3);tagL.s=beat(t,11.3,12);leroy.armR.rot=.12+1.6*beat(t,12,12.6)-1.6*beat(t,16,16.6);bubL.s=beat(t,14,14.8)*(1-beat(t,18,18.8));
   wenger.body.s=beat(t,14.6,15.4);tagW.s=beat(t,15.4,16.2);
   // Wenger flies to Africa: a paper plane crosses the backdrop from the right panel to the left.
   const fl=beat(t,17.9,20.4);flyR.dx=-1.6*clamp01(fl*2);flyR.visible=fl>0&&fl<.5;flyL.dx=-2.6*clamp01(fl*2-1);flyL.visible=fl>=.5&&fl<1;flyR.dy=flyL.dy=.1*Math.sin(t*2);
   wenger.armL.rot=-.12-1.2*pulse(t,18,21);
   doorF.s=beat(t,19.6,20.6);const open=Math.max(manual?beat(act,0,.6):0,beat(t,21.6,23));leaf.flip=-1.35*open;
   geo2.body.s=Math.max(manual?beat(act,.4,.75):0,beat(t,22.6,23.4));geo2.body.z=-.4+.9*Math.max(manual?beat(act,.6,1):0,beat(t,23.4,25));
   signed.s=beat(t,24,24.8);wenger.armR.rot=.12+1.2*beat(t,27,27.6)-1.2*beat(t,30,30.6);
   award.s=beat(t,31.6,32.4);awardC.s=beat(t,32.4,33.2);flags.forEach((f,i)=>{f.s=beat(t,35.4+i*.5,36.2+i*.5);f.rot=.06*wave(t,36,45,1+i*.3);});
   cheer(geo2,Math.max(beat(t,33,33.6),manual?beat(act,.85,1):0));cheer(geo,beat(t,36,36.6));
   sun.dy=.4*beat(t,21,24);ball(bx,bz,dy,t>3&&t<10.4);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14.2,15)-.45*beat(t,17.4,18)+.45*beat(t,20.8,21.6)+.45*beat(t,21.6,22.4)-.45*beat(t,34.6,35.4):0;
  };
 }};

/* ───────────── 5 · One point short (onepoint) ───────────── */
const onepoint:SpreadDef={id:'onepoint',rest:26.0,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#3b3f6e');k.dots(p,INK.navy,.06,.3);const st=ell(-2.5,Z(-.2),2.1,1.1);k.fill(st,INK.red,.85);k.dots(st,'#9c3a30',.05,.3);
  k.text('1995',-2.5,Z(2.6),.52,INK.gold,{max:2.4});k.text('BALLON D’OR · FIFA WORLD PLAYER',-2.5,Z(2.9),.15,INK.white,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-1.9),5,Z(-1.9),.05,INK.white);
  k.text('ONE POINT SHORT',2.5,Z(2.6),.4,INK.red,{max:4.3});k.text('2002 WORLD CUP QUALIFYING',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'o-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);for(const x of [.2,3.7]){const c=rect(x,0,.6,3);k.fill(c,INK.red);k.hatch(c,'#9c3a30',.06,1.57,.012);k.key(c,.012);}lightRig(k,1.4,.5);lightRig(k,3.1,.5);k.fill(rect(0,2.5,4.5,.5),'#3b3f6e');}},
   {key:K+'o-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);tinRoofs(k,.1,11,2.2,2);palms(k,[.5,3.9],2.1);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const storms=[bd.add(stormCloud('o-st1',1.3,.66),'R',1.2,2.2,{out:.03}),bd.add(stormCloud('o-st2',1.1,.56),'R',3.2,2.5,{out:.03})];
  const sunR=bd.add(S.sun(K+'o-sun',.34),'R',2.2,1.9,{out:.012}),bow=bd.add(S.rainbow(K+'o-bow',3.0,1.2),'R',.6,2.5,{out:.016});
  const geo=B.person(K+'o-geo',-2.5,.1,1.3,{...GEO,shirt:'casual',adult:true,face:'grin',layer:2});
  const gb=B.stand(S.goldenBall(K+'o-gb',.26),-3.6,-.9,{layer:1,s:0}),cup=B.stand(S.trophy(K+'o-cup',.5,.85),-1.4,-.9,{layer:1,s:0});
  const first=bd.add(lineCard('o-first',1.8,.56,['FIRST AFRICAN','WINNER'],INK.gold),'L',2.3,1.75,{out:.03});
  const thanks=B.stand(lineCard('o-thanks',1.6,.5,['FOR','ARSÈNE WENGER'],INK.white),-3.7,1.4,{layer:3,s:0});
  const small=B.stand(libFlag('o-flag',.7,1.1),1.0,-1.3,{layer:1,s:0});
  const geo2=B.person(K+'o-geo2',2.3,.2,1.3,{...GEO,shirt:'navy',face:'smile',layer:2});
  const roles=['PLAYED','COACHED','HELPED PAY'].map((l,i)=>B.stand(S.flipCard(K+`o-role${i}`,1.1,.32,l,[INK.yellow,INK.sky,INK.pink][i],INK.navy),.9+i*1.3,1.3+(i%2)*.5,{layer:3,s:0}));
  const board=B.stand(pointsBoard('o-board',1.7,1.4),3.8,-1.08,{layer:1,s:0});
  board.add(lineCard('o-short',1.44,.66,['MISSED BY','ONE POINT'],INK.red,INK.white),0,.36,{z:.012});const pflap=board.flap(S.flipCard(K+'o-q',1.44,.66,'?',INK.blue),0,1.02,{z:.03});
  const mates=[[1.3,.6,'#b27650','curly'],[3.3,.7,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`o-m${i}`,x as number,z as number,1.25,{skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',shirt:'navy',face:'smile',layer:2}));
  const hearts=[0,1].map(i=>B.stand(heart(`o-heart${i}`,.28),1.6+i*1.4,-.45,{layer:2,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26):b.t;
   geo.body.s=beat(t,2,2.8);gb.s=beat(t,4.6,5.4);cup.s=beat(t,6.6,7.4);first.scale=Math.max(.001,beat(t,5.4,6.2));first.visible=first.scale>.02;cheer(geo,beat(t,7.4,8)*(1-beat(t,9.8,10.4)));
   thanks.s=beat(t,9.8,10.6);geo.armR.rot=.12+1.2*beat(t,10.6,11.2)-1.2*beat(t,13,13.6)+(t<7.4?0:0);
   const st=beat(t,14.6,15.8)*(1-Math.max(beat(t,36,38),manual?beat(act,.6,1):0));storms.forEach((s2,i)=>{s2.scale=st;s2.visible=st>.02;s2.dx=.12*wave(t,15,36,.25+i*.1);});
   small.s=beat(t,13.6,14.4);small.rot=.05*wave(t,14.4,19,1);
   geo2.body.s=beat(t,19.8,20.6);roles.forEach((r,i)=>{r.s=beat(t,20.2+i*1.2,20.9+i*1.2);});geo2.armR.rot=.12+1.3*pulse(t,21,25);
   board.s=beat(t,24.4,25.2);const flip=Math.max(manual?beat(act,0,.6):0,beat(t,28.2,29));pflap.flip=-3.1*flip;
   geo2.body.yaw=0;
   // Together as a team: teammates come close, arms around.
   mates.forEach((m,i)=>{m.body.s=beat(t,34.6+i*.4,35.4+i*.4);});const arms=Math.max(beat(t,35.6,36.6),manual?beat(act,.6,.95):0);mates[0].armR.rot=.12+1.6*arms;mates[1].armL.rot=-.12-1.6*arms;
   if(manual)mates.forEach(m=>{m.body.s=Math.max(m.body.s,beat(act,.5,.8));});
   hearts.forEach((h,i)=>{h.s=beat(t,37+i*.5,37.6+i*.5);});
   sunR.scale=Math.max(beat(t,38,39),manual?beat(act,.7,1):0);sunR.visible=sunR.scale>.02;bow.scale=beat(t,39.6,41);bow.visible=bow.scale>.02;
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,13,13.8)-.45*beat(t,38.8,39.8):0;
  };
 }};

/* ───────────── 6 · School first (school) ───────────── */
const schoolS:SpreadDef={id:'school',rest:15.4,
 left:k=>{dirt(k,-5,0,'#d6bd8e');footprints(k,-4.4,Z(1.9),-.4,Z(1.3),12);
  k.text('LIBERIA',-2.5,Z(2.6),.5,INK.blue,{max:3});k.text('FOOTBALL TO BRING HAPPINESS',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,.3,Z(.3),4.7,Z(.3),.05,INK.white);
  k.text('SCHOOL FIRST',2.5,Z(2.6),.46,INK.pink,{max:4});k.text('JUNIOR PROFESSIONAL · MONROVIA · 1994',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);tinRoofs(k,.2,11,2.3,4);palms(k,[.6,3.4],2.1);k.fill(rect(0,2.3,4.5,.7),'#d6bd8e');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);roofs(k,.2,12,2.2,4);palms(k,[3.9],2.2);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const storms=[bd.add(stormCloud('h-st1',1.3,.66),'L',1.3,2.2,{out:.03}),bd.add(stormCloud('h-st2',1.2,.6),'L',3.3,2.4,{out:.03})];
  const sunL=bd.add(S.sun(K+'h-sunL',.34),'L',2.3,1.9,{out:.012}),sunR=bd.add(S.sun(K+'h-sunR',.32),'R',3.6,2.1,{out:.012}),bunt=bd.add(S.bunting(K+'h-bunt',2.6,.4,[INK.red,INK.white,INK.blue,INK.yellow]),'R',.6,2.55,{out:.03});
  const geo=B.person(K+'h-geo',-2.6,-.2,1.35,{...GEO,shirt:'casual',adult:true,face:'smile',layer:2});
  const amb=B.stand(lineCard('h-amb',1.9,.56,['GOODWILL AMBASSADOR','UNITED NATIONS'],INK.sky),-2.6,-1.6,{layer:1,s:0});
  const kidsL=[[-4.1,.9,'curly'],[-3.3,1.5,'bun'],[-1.6,1.1,'short'],[-.8,1.7,'bun']].map(([x,z,hr],i)=>B.person(K+`h-k${i}`,x as number,z as number,.95,{skin:['#7f5138','#b27650'][i%2],hair:hr as 'short',hairColor:'#1d1a1f',shirt:(['bib','fan','casual','coach'] as const)[i],face:'grin',layer:3}));
  const ballL=B.stand(S.ball(K+'h-ballL',.1),-2.4,1.3,{layer:3,tab:false,s:0});
  const sch=B.stand(school('h-school',2.0,1.5),2.5,-1.5,{layer:1,s:0});
  const dl=sch.flap(schoolDoor('h-dl',.32,.72),-.32,0,{anchor:'bl',axis:'y',z:.012}),dr=sch.flap(schoolDoor('h-dr',.32,.72),.32,0,{anchor:'br',axis:'y',z:.012});
  const club=B.stand(S.banner(K+'h-club',2.4,.44,'JUNIOR PROFESSIONAL',INK.blue),2.5,-.4,{layer:2,s:0});
  const rule=B.stand(signBoard('h-rule',1.5,1.1,'GO TO SCHOOL!',INK.yellow),.8,.3,{layer:2,s:0});
  const bookP=B.stand(books('h-books',.5,.5),.9,1.4,{layer:3,s:0});
  const pupils=[[1.8,1.0,'short'],[2.7,1.3,'bun'],[3.6,1.0,'curly'],[4.4,1.5,'short']].map(([x,z,hr],i)=>B.person(K+`h-p${i}`,x as number,z as number,1.0,{skin:['#7f5138','#b27650'][i%2],hair:hr as 'short',hairColor:'#1d1a1f',shirt:'navy',face:'grin',legs:i===1?'kick':undefined,layer:3}));
  const forLib=B.stand(S.flipCard(K+'h-lib',1.4,.32,'PLAYED FOR LIBERIA',INK.red,INK.white),3.9,-.4,{layer:2,s:0});
  const award=B.stand(S.trophy(K+'h-award',.45,.75),-.7,-1.0,{layer:1,s:0});const awardC=B.stand(lineCard('h-2004',1.6,.5,['COURAGE AWARD','2004'],INK.gold),-.9,.2,{layer:2,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`h-heart${i}`,.24),-4.4+i*.8,-.6,{layer:2,s:0,tab:false}));
  const ballR=B.stand(S.ball(K+'h-ballR',.1),3.0,1.35,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.4):b.t;
   const st=beat(t,1.6,2.6)*(1-beat(t,5.6,8));storms.forEach((s2,i)=>{s2.scale=st;s2.visible=st>.02;s2.dx=.12*wave(t,2,6,.3+i*.1);});
   sunL.scale=beat(t,7,8.4);sunL.visible=sunL.scale>.02;
   geo.body.s=beat(t,5.2,6);amb.s=beat(t,6.2,7);
   kidsL.forEach((c,i)=>{c.body.s=beat(t,9.4+i*.4,10.1+i*.4);cheer(c,beat(t,12+i*.2,12.6+i*.2)*(1-beat(t,14.4,15))+beat(t,37+i*.2,37.6+i*.2));});hearts.forEach((h,i)=>{h.s=beat(t,11+i*.5,11.6+i*.5);});
   ballL.s=beat(t,10,10.6);ballL.dy=.3*Math.abs(Math.sin(t*3))*beat(t,10.6,11);ballL.rot=t*2;
   sch.s=beat(t,13.4,14.4);const open=Math.max(manual?beat(act,0,.6):0,beat(t,15.6,17));dl.flip=-1.35*open;dr.flip=1.35*open;
   club.s=beat(t,17.8,18.6);rule.s=beat(t,23.6,24.4);bookP.s=beat(t,24.6,25.4);
   pupils.forEach((p,i)=>{p.body.s=Math.max(manual?beat(act,.5+i*.1,.75+i*.1):0,beat(t,19+i*.4,19.8+i*.4));});
   forLib.s=beat(t,27.8,28.6);pupils.forEach((p,i)=>cheer(p,beat(t,28.2+i*.2,28.8+i*.2)*(1-beat(t,30.8,31.4))+(manual?beat(act,.9,1):0)));
   ballR.s=beat(t,20,20.6);const kk=((t-20.6)%1.4)/1.4;ballR.dy=t>20.6?.35*Math.sin(kk*Math.PI):0;pupils[1].leg!.rot=t>20.6?-.6*Math.abs(Math.sin(kk*Math.PI)):0;
   award.s=beat(t,31.6,32.4);awardC.s=beat(t,32.2,33);cheer(geo,beat(t,33,33.6));
   sunR.dy=.4*beat(t,15,18);bunt.scale=beat(t,36.4,37.4);bunt.visible=bunt.scale>.02;
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,14.6,15.4)-.45*beat(t,30.8,31.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={claratown,survivors,bench,monaco,onepoint,school:schoolS};
