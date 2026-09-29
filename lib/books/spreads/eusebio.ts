/**
 * The six Eusébio pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/eusebio/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: an empty chair, a covered photo frame, closed doors, a rain cloud.
 * Kits are plain colours with no crests or logos.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,clamp01,smooth,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='eusebio-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const EUS={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a1f'};
const MUM={skin:'#7f5138',hair:'bun' as const,hairColor:'#1d1a1f'};
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

/* ───────────── 1 · A ball made of socks (sockball) ───────────── */
const sockball:SpreadDef={id:'sockball',rest:21.2,
 left:k=>{dirt(k,-5,0);footprints(k,-4.4,Z(1.9),-.4,Z(1.2),12);
  k.text('MAFALALA',-2.5,Z(2.6),.5,INK.red,{max:3.4});k.text('MOZAMBIQUE · 1942',-2.5,Z(2.9),.17,INK.navy,{weight:800});},
 right:k=>{dirt(k,0,5,'#dcbb83');dash(k,.5,Z(-.7),4.6,Z(-.7),.04,INK.white);dash(k,2.5,Z(-.7),2.5,Z(1.8),.04,INK.white);
  k.text('OS BRASILEIROS',2.5,Z(2.6),.4,INK.blue,{max:4.2});k.text('A BALL MADE OF SOCKS AND NEWSPAPER',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);palms(k,[.5,3.9],2.1);tinRoofs(k,.2,11,2.35,1);k.fill(rect(0,2.35,4.5,.65),'#d9b47a');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);sea(k,4.5,1.75,.45);roofs(k,.4,10,2.2,2);palms(k,[3.2],2.2);k.fill(rect(0,2.3,4.5,.7),'#dcbb83');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.34),'L',3.4,1.7,{out:.012}),cloud=bd.add(S.cloud(K+'s-cloud',.9,.4),'R',2.8,2.55),birds=bd.add(S.birds(K+'s-birds',.8,.3),'R',1.2,2.3,{out:.02});
  const shacks=[B.stand(shack('s-shack1',1.3,1.1,'#e9c58f'),-4.05,-1.12,{layer:1,s:0}),B.stand(shack('s-shack2',1.1,1.0,'#d9a877'),-2.55,-1.72,{layer:1,s:0})];
  const sign=B.stand(signBoard('s-sign',1.4,1.2,'LOURENÇO MARQUES'),1.0,-1.5,{layer:1,s:0});
  const now=sign.flap(S.flipCard(K+'s-maputo',1.2,.44,'MAPUTO',INK.pink),0,1.2*.99,{z:.03});
  const eus=B.person(K+'s-eus',-3.2,.6,1.0,{...EUS,shirt:'casual',face:'grin',legs:'kick',layer:3});
  const friends=[[-2.1,.1,'#b27650','curly','bib'],[1.3,.9,'#7f5138','short','fan'],[-4.2,1.2,'#d99a6c','bun','navy']].map(([x,z,sk,hr,sh],i)=>B.person(K+`s-f${i}`,x as number,z as number,1.0,{shirt:sh as 'bib',skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',face:'grin',layer:i===2?3:2}));
  const qs=B.stand(S.bubble(K+'s-q',.5,.46,'dots'),-2.5,-.45,{layer:2,s:0});
  const box=B.stand(crate('s-crate',.62,.34),-.7,1.75,{layer:3});
  const sockP=box.add(sock('s-sock',.22,.3),-.12,.34,{z:.01}),paper=box.flap(newsSheet('s-news',.5,.44),.08,.34+.44,{anchor:'top',z:.02});
  const sockBallTop=box.add(sockBall('s-sb0',.14),.14,.34,{z:.024});
  const goal=B.stand(stickGoal('s-goal',1.4,.7),3.3,-1.3,{layer:1});void goal;
  const team=bd.add(S.banner(K+'s-team',2.2,.46,'OS BRASILEIROS',INK.blue),'R',2.3,2.05,{out:.03});
  const mates=[[2.3,.3,'#7f5138','short','bib'],[3.9,.5,'#b27650','curly','fan'],[2.9,1.5,'#d99a6c','short','navy']].map(([x,z,sk,hr,sh],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.0,{shirt:sh as 'bib',skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',face:'grin',layer:3}));
  const stars=mates.map((m,i)=>m.body.add(star(`s-star${i}`,.3,i===1?INK.yellow:INK.gold),0,1.0*1.22+.04,{z:.02}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`s-heart${i}`,.26),-4.3+i*1.3,2.15,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,sockBall('s-sb',.12),sockBall('s-sb',.12));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.2):b.t;
   sun.dy=.5*beat(t,0,2.2);cloud.dx=-.4*beat(t,0,43);birds.dx=-.8*beat(t,2,20);
   shacks.forEach((s2,i)=>{s2.s=beat(t,2.4+i*.5,3.4+i*.5);});sign.s=beat(t,4,5);eus.body.s=beat(t,5.2,6);
   now.flip=-2.9+2.9*beat(t,8.8,9.6);
   friends.forEach((f,i)=>{f.body.s=beat(t,12.6+i*.45,13.4+i*.45);f.body.x=[-2.1,1.3,-4.2][i]+.3*Math.sin((t-13)*1.6+i)*beat(t,14.5,15)*(1-beat(t,17.6,18.2));});
   eus.body.x=-3.2+.35*Math.sin((t-13)*1.5)*beat(t,14.5,15)*(1-beat(t,17.6,18.2));
   qs.s=beat(t,18.4,19)*(1-beat(t,21,21.6));friends.forEach((f,i)=>{f.armR.rot=.12+.9*pulse(t,18.6+i*.2,20.6+i*.2);});
   // Roll up the sock ball: the newspaper folds over the sock, and a round paper ball pops out.
   const fold=Math.max(manual?beat(act,0,.45):0,beat(t,21.6,22.6)),made=Math.max(manual?beat(act,.4,.7):0,beat(t,22.6,23.4));
   paper.flip=-2.9+2.9*fold;paper.scale=1-.9*made;paper.visible=made<.95;sockP.scale=1-.999*made;sockP.visible=made<.99;sockBallTop.scale=Math.max(.001,made)*(1-(manual?beat(act,.72,.8):beat(t,24,24.4)));sockBallTop.visible=sockBallTop.scale>.02;
   let bx:number,bz:number,dy=0;
   if(manual){[bx,bz]=track(act,[[.72,-.62,1.7],[1,-2.75,.75]]);}
   else [bx,bz]=track(t,[[0,-.62,1.7],[24.2,-.62,1.7],[25.6,-2.75,.75],[26.3,-2.75,.75],[27.6,3.25,-1.1],[31,3.25,-1.1],[32,-.6,1.2],[33,-.6,1.2]]);
   if(!manual)dy=.3*pulse(t,26.3,27.6);
   ball(bx,bz,dy,manual?act>.72:t>24);
   eus.leg!.rot=-1.05*pulse(t,26,26.6);
   team.scale=Math.max(.001,beat(t,28.1,29));team.visible=team.scale>.02;mates.forEach((m,i)=>{m.body.s=beat(t,28.6+i*.4,29.4+i*.4);});stars.forEach((s2,i)=>{s2.scale=Math.max(.001,beat(t,30.8+i*.6,31.4+i*.6));s2.visible=s2.scale>.02;s2.rot=.1*wave(t,31.4,40,.6+i*.2);});
   const joy=beat(t,33.4,34)*(1-beat(t,35.2,35.8))+beat(t,38,38.6);[...mates,...friends].forEach((m,i)=>cheer(m,beat(t,33.4+i*.1,34+i*.1)*(1-beat(t,35.2,35.8))+beat(t,38+i*.1,38.6+i*.1)));cheer(eus,Math.max(joy,manual?beat(act,.85,1):0));
   hearts.forEach((h,i)=>{h.s=beat(t,36+i*.5,36.6+i*.5);});
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,17.8,18.6)-.4*beat(t,21.2,22)+.4*beat(t,27.4,28.2)+.4*beat(t,28.2,29)-.4*beat(t,35,36):0;
  };
 }};

/* ───────────── 2 · The photo on the wall (father) ───────────── */
const father:SpreadDef={id:'father',rest:18.0,
 left:k=>{dirt(k,-5,0,'#d6bd8e');line(k,-5,Z(-1.1),0,Z(-1.1),.05,'#7a4d35');line(k,-5,Z(-.7),0,Z(-.7),.05,'#7a4d35');for(let x=-4.9;x<0;x+=.32)line(k,x,Z(-1.2),x,Z(-.6),.06,'#9a6a42');
  k.text('LAURINDO',-2.5,Z(2.6),.5,INK.blue,{max:3.4});k.text('HE WORKED ON THE RAILWAY',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{planks(k,0,5);const rug=ell(2.5,Z(.6),1.7,.9);k.fill(rug,INK.pink,.7);k.dots(rug,INK.red,.05,.3);
  k.text('1950',2.5,Z(2.6),.5,INK.pink,{max:2.4});k.text('ELISA RAISED THE FAMILY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.4-y/3*.35);tinRoofs(k,.3,10,2.0,3);const st=rect(2.8,1.1,1.3,.9);k.fill(st,'#f0d9b0');k.key(st,.012);k.fill(poly([[2.7,1.1],[3.45,.8],[4.2,1.1]]),INK.red);k.text('STATION',3.45,1.45,.14,INK.navy);k.fill(rect(0,2.0,4.5,1.0),'#d6bd8e');k.fill(rect(0,2.3,4.5,.06),'#7a4d35');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{const wl=rect(0,0,4.5,3);k.fill(wl,'#f2dcb8');k.dots(wl,INK.orange,.05,.16);const wn=rect(.4,.5,1.2,1.0);k.fill(wn,INK.sky2);k.dots(wn,INK.sky,.04,.4);k.key(wn,.016);k.key('M1 .5 L1 1.5 M.4 1 L1.6 1',.014);k.fill(rect(0,2.4,4.5,.6),'#caa06e');k.key('M0 2.4 L4.5 2.4',.014);k.circle(3.0,.5,.04,INK.brown);}},-3.05,1.22);
  const trainP=bd.add(train('f-train',1.3,.5),'L',1.1,2.0,{out:.03});const sunP=bd.add(S.sun(K+'f-sun',.3),'L',1.2,2.3,{out:.012});
  const rain=[bd.add(stormCloud('f-rain1',1.3,.66),'L',2.2,2.35,{out:.035}),bd.add(stormCloud('f-rain2',1.1,.56),'R',3.5,2.5,{out:.035})];
  const dad=B.person(K+'f-dad',-2.4,.2,1.72,{shirt:'navy',hair:'cap',adult:true,skin:'#f1b88f',face:'smile',layer:2,legs:'kick'});
  const railSign=B.stand(signBoard('f-rsign',1.1,1.1,'RAILWAY'),-4.1,-1.12,{layer:1,s:0});
  const scarf=B.stand(pennant('f-scarf',.9,1.1,'BENFICA',INK.red),-1.1,-.9,{layer:1,s:0});
  const young=B.stand(S.flipCard(K+'f-young',1.1,.32,'A YOUNG PLAYER',INK.yellow,INK.navy),-3.6,1.0,{layer:3,s:0});
  const chairP=B.stand(chair('f-chair',.7,1.0),-2.4,.25,{layer:2,s:0});
  const card8=B.stand(S.flipCard(K+'f-eight',1.0,.32,'EUSÉBIO WAS 8',INK.blue),-1.3,1.55,{layer:3,s:0});
  const frame=B.stand(portrait('f-frame',1.05,1.3,'LAURINDO','#f1b88f','#3b2e3f'),1.0,-1.6,{layer:1,s:0});
  const cover=frame.flap(frameCover('f-cover',1.05,1.3),0,1.3,{z:.02});
  const mum=B.person(K+'f-mum',2.4,-.3,1.6,{...MUM,shirt:'coach',adult:true,face:'smile',layer:2});
  const kids=[[1.3,.8,1.2,'short'],[1.9,1.45,1.12,'curly'],[3.1,1.35,1.05,'short'],[3.8,.7,1.15,'bun'],[2.55,1.9,.95,'short']].map(([x,z,h,hr],i)=>B.person(K+`f-kid${i}`,x as number,z as number,h as number,{shirt:(['bib','fan','navy','coach','casual'] as const)[i],skin:'#7f5138',hair:hr as 'short',hairColor:'#1d1a1f',face:i===4?'shy':'smile',layer:3}));
  const five=B.stand(S.flipCard(K+'f-five',1.1,.32,'FIVE CHILDREN',INK.pink),4.1,-.9,{layer:2,s:0});
  const brotherTag=B.stand(S.flipCard(K+'f-bro',1.0,.3,'BIG BROTHER',INK.yellow,INK.navy),4.0,1.95,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`f-heart${i}`,.28),.45+i*.5,-.55,{layer:2,s:0,tab:false}));
  const ball=ballPair(B,S.ball(K+'f-ball',.1),S.ball(K+'f-ball',.1));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18):b.t;
   trainP.dx=-2.6*beat(t,1.2,6.4);trainP.visible=t<6.4;railSign.s=beat(t,2.2,3);dad.body.s=beat(t,2.8,3.8)*(1-beat(t,13.2,14.6));
   dad.armR.rot=.12+1.6*beat(t,4,4.6)-1.6*beat(t,5.6,6.2);
   scarf.s=beat(t,8.6,9.4)*(1-beat(t,14,14.8));young.s=beat(t,6.4,7.2)*(1-beat(t,10.8,11.4));
   let bx=-1.95,bz=.4,dy=0;if(t>6.8&&t<10.8){const u=((t-6.8)%1.3)/1.3;dy=.4*Math.sin(u*Math.PI);}ball(bx,bz,dy,t>6.6&&t<11);dad.leg!.rot=-.7*(t>6.8&&t<10.8?Math.abs(Math.sin((t-6.8)/1.3*Math.PI)):0);
   // The loss: the figure folds away and an empty chair stands in its place; rain gathers, the sun sets.
   chairP.s=beat(t,14.4,15.4);card8.s=beat(t,11.8,12.6)*(1-beat(t,16.4,17.2));
   const grey=beat(t,12.4,14)*(1-beat(t,32,36))*(manual?1-beat(act,.3,.9):1);rain.forEach((r,i)=>{r.scale=grey*(i?beat(t,20,21):1);r.visible=r.scale>.02;r.dx=.12*wave(t,13,32,.25+i*.1);});
   sunP.dy=-1.2*beat(t,11,13)+1.2*Math.max(beat(t,35,38),manual?beat(act,.5,1):0);
   frame.s=beat(t,16.6,17.6);const lift=Math.max(manual?beat(act,0,.7):0,beat(t,18.4,19.8));cover.flip=-2.85*lift;
   hearts.forEach((h,i)=>{h.s=Math.max(manual?beat(act,.55+i*.12,.75+i*.12):0,beat(t,19.8+i*.5,20.4+i*.5));});
   mum.body.s=beat(t,20.9,21.8);mum.armL.rot=-.12-.8*beat(t,22.4,23.2);mum.armR.rot=.12+.8*beat(t,22.4,23.2);
   kids.forEach((c,i)=>{c.body.s=beat(t,26.4+i*.35,27.1+i*.35);});five.s=beat(t,27.2,28);
   const help=beat(t,29.4,30.4);kids[0].body.x=1.3+.5*help;kids[0].armR.rot=.12+1.4*help*(1-beat(t,34,34.6));brotherTag.s=beat(t,30,30.8);mum.armR.rot+=.9*help*(1-beat(t,34,34.6));kids[4].armL.rot=-.12-.6*help;
   const warm=beat(t,36.6,37.4);[mum,...kids].forEach((p,i)=>{if(i===0)return;p.armR.rot=Math.max(p.armR.rot,.12+2*beat(t,36.6+i*.15,37.2+i*.15));});cheer(kids[4],Math.max(warm,manual?beat(act,.8,1):0));
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,16.2,17)+.45*beat(t,20.6,21.4)-.45*beat(t,34.6,35.4):0;
  };
 }};

/* ───────────── 3 · Turned away (doors) ───────────── */
const doors:SpreadDef={id:'doors',rest:21.2,
 left:k=>{dirt(k,-5,0);footprints(k,-4.3,Z(.9),-.4,Z(1.1),12);
  k.text('NO, AND NO AGAIN',-2.5,Z(2.6),.4,INK.red,{max:4.2});k.text('TWO CLUBS TURNED HIM AWAY',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);line(k,.3,Z(-2.0),4.8,Z(-2.0),.05,INK.white);line(k,2.3,Z(-2.0),2.3,Z(-1.2),.05,INK.white);line(k,4.3,Z(-2.0),4.3,Z(-1.2),.05,INK.white);line(k,2.3,Z(-1.2),4.3,Z(-1.2),.05,INK.white);
  k.text('77 GOALS',2.5,Z(2.6),.46,INK.yellow,{max:3.4});k.text('SPORTING LOURENÇO MARQUES · 1957 TO 1960',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#e6d3b3',INK.orange,y=>.3-y*.05);tinRoofs(k,.1,11,2.3,2);const wl=rect(0,1.55,4.5,.8);k.fill(wl,'#e8dcc4');k.dots(wl,INK.grey,.04,.25);k.key('M0 1.55 L4.5 1.55',.014);k.fill(rect(0,2.35,4.5,.65),'#d9b47a');}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.4,[INK.green,INK.white,INK.yellow,INK.white],3);lightRig(k,1.0,.5);lightRig(k,3.7,.45);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'d-sun',.34),'R',3.8,2.2,{out:.012}),storm=bd.add(stormCloud('d-storm',1.5,.75),'L',2.4,2.2,{out:.03});
  const g1=B.stand(gatePost('d-g1',1.35,1.45,'DESPORTIVO'),-3.75,-1.18,{layer:1,s:0}),g2=B.stand(gatePost('d-g2',1.35,1.45,'FERROVIÁRIO','#3d5da0'),-1.4,-1.4,{layer:1,s:0});
  for(const g of [g1,g2]){g.add(gateLeaf(g===g1?'d-l1':'d-l2',.52,1.0,INK.navy),-.28,0,{z:.01});g.add(gateLeaf(g===g1?'d-r1':'d-r2',.52,1.0,INK.navy),.28,0,{z:.01});}
  const no1=B.stand(stamp('d-no1',.7,.34,'NO'),-3.75,-.3,{layer:2,s:0}),no2=B.stand(stamp('d-no2',.7,.34,'NO'),-1.4,-.85,{layer:2,s:0});
  const unfair=B.stand(stamp('d-unfair',1.3,.4,'NOT FAIR'),-2.6,1.95,{layer:3,s:0});
  const group=[[-3.4,.3,'#7f5138','short','casual'],[-4.1,.75,'#b27650','curly','bib'],[-2.8,.95,'#d99a6c','short','fan']].map(([x,z,sk,hr,sh],i)=>B.person(K+`d-kid${i}`,x as number,z as number,1.0,{shirt:sh as 'bib',skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',face:i===0?'smile':'smile',layer:2}));
  const sadGroup=[0,1,2].map(i=>B.person(K+`d-sg${i}`,-1.3+i*.55-.6,.8+(i%2)*.45,1.0,{shirt:(['casual','bib','fan'] as const)[i],skin:['#7f5138','#b27650','#d99a6c'][i],hair:(['short','curly','short'] as const)[i],hairColor:'#1d1a1f',face:'sad',layer:2}));
  const g3=B.stand(gatePost('d-g3',1.55,1.6,'SPORTING L.M.',INK.green),1.4,-.85,{layer:2,s:0});
  const gl=g3.flap(gateLeaf('d-gL',.6,1.12,INK.gold),-1.55/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=g3.flap(gateLeaf('d-gR',.6,1.12,INK.gold),1.55/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const yes=g3.add(S.flipCard(K+'d-yes',.9,.34,'YES!',INK.green),0,1.64,{z:.02});
  const club=[[.7,1.1,'#7f5138','short'],[2.2,1.35,'#b27650','curly'],[1.35,1.85,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`d-c${i}`,x as number,z as number,i===0?1.1:1.0,{shirt:'keeper',skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',face:'grin',legs:i===0?'kick':undefined,layer:3}));
  const kit=B.stand(shirt('d-kit',.5,INK.green,INK.white),3.5,1.7,{layer:1,s:0});
  const board=B.stand(S.scoreboard(K+'d-board',1.6,1.25,'1957 TO 1960'),4.1,-.6,{layer:2,s:0});
  board.add(lineCard('d-77',1.3,.56,['77 GOALS','42 GAMES'],INK.yellow),0,.36,{z:.012});
  const hide=board.flap(S.flipCard(K+'d-hide',1.3,.56,'?',INK.blue),0,.92,{z:.03});
  const goalP=B.stand(S.goal(K+'d-goal',1.4,.75),3.2,-1.38,{layer:1});void goalP;
  const ball=B.stand(S.ball(K+'d-ball',.1),1.15,1.2,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.2):b.t;
   group.forEach((p,i)=>{p.body.s=beat(t,1.8+i*.35,2.6+i*.35)*(1-beat(t,10.4,11));});
   g1.s=beat(t,2.6,3.6);g2.s=beat(t,10.8,11.6);
   // Knock: the friends face the first gate; a NO stamp; they move on to the second; another NO.
   group.forEach((p,i)=>{p.armR.rot=.12+1.3*pulse(t,5.4+i*.2,6.8+i*.2);});
   no1.s=beat(t,7.2,7.8);no1.rot=-.1;
   sadGroup.forEach((p,i)=>{p.body.s=beat(t,10.8+i*.3,11.6+i*.3);p.armR.rot=.12+1.2*pulse(t,11.6+i*.2,12.8);});
   no2.s=beat(t,12.8,13.4);no2.rot=.08;
   storm.scale=beat(t,14.3,15.4)*(1-beat(t,21.4,23.4))*(manual?1-beat(act,.2,.8):1);storm.visible=storm.scale>.02;storm.dx=.15*wave(t,15,21,.3);
   unfair.s=beat(t,16.6,17.4)*(1-beat(t,21,21.8));
   g3.s=beat(t,19.8,20.8);
   const open=Math.max(manual?beat(act,0,.6):0,beat(t,21.6,23));gl.flip=-1.3*open;gr.flip=1.3*open;
   yes.scale=Math.max(.001,manual?beat(act,.5,.8):0,beat(t,23.2,24));yes.visible=yes.scale>.02;
   club.forEach((p,i)=>{p.body.s=Math.max(manual?beat(act,.6+i*.1,.85+i*.1):0,beat(t,24.4+i*.5,25.2+i*.5));});
   sadGroup.forEach(p=>{p.body.s*=1-Math.max(manual?beat(act,.4,.7):0,beat(t,23.4,24.4));});
   kit.s=beat(t,29.6,30.4);board.s=beat(t,31.2,32);hide.flip=-3.1*beat(t,33.6,34.4);
   ball.s=club[0].body.s;const dr=beat(t,34.6,36.4);ball.x=1.15+2.2*dr;ball.z=1.2-2.45*dr;ball.dy=.3*Math.sin(dr*Math.PI);ball.rot=-dr*10;club[0].leg!.rot=-1.1*pulse(t,34.3,34.9);
   club.forEach((p,i)=>cheer(p,Math.max(beat(t,36.4+i*.2,37+i*.2)*(1-beat(t,38.2,38.8))+beat(t,40+i*.2,40.6+i*.2),manual?beat(act,.85,1):0)));
   sun.dy=.4*Math.max(beat(t,22,25),manual?beat(act,.5,1):0);
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,19.4,20.4)+.45*beat(t,20.4,21.2)-.45*beat(t,37.6,38.6):0;
  };
 }};

/* ───────────── 4 · Far from home (lisbon) ───────────── */
const lisbon:SpreadDef={id:'lisbon',rest:22.2,
 left:k=>{const s=rect(-5,0,5,PAGE_D);k.fill(s,INK.sand);k.dots(s,INK.orange,.06,.15);const w=rect(-5,Z(-3.2),5,1.7);k.fill(w,INK.blue);k.dots(w,INK.navy,.05,.3);footprints(k,-3.8,Z(1.6),-.6,Z(.9),10);
  k.text('MOZAMBIQUE',-2.5,Z(2.6),.46,INK.green,{max:4});k.text('MUM STAYED AT HOME',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{cobbles(k,0,5);
  k.text('LISBON',2.5,Z(2.6),.5,INK.red,{max:3});k.text('15 DECEMBER 1960 · HE WAS 18',2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.4);sea(k,4.5,1.6,1.0);palms(k,[.6,1.4],2.6);k.fill(rect(0,2.6,4.5,.4),INK.sand);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);const hill=`M0 1.4 Q1.4 .9 2.6 1.3 Q3.6 1.5 4.5 1.1 L4.5 3 L0 3 Z`;k.fill(hill,'#e8d2a6');roofs(k,.1,12,1.9,3);roofs(k,.3,11,2.4,5);k.fill(rect(0,2.4,4.5,.6),'#e2d6bc');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'l-sun',.32),'R',3.8,2.2,{out:.012}),birds=bd.add(S.birds(K+'l-birds',.8,.3),'L',2.4,2.3,{out:.02});
  const mum=B.person(K+'l-mum',-3.4,.3,1.6,{...MUM,shirt:'coach',adult:true,face:'smile',layer:2});
  const bro=B.person(K+'l-bro',-4.3,.6,1.6,{...EUS,shirt:'navy',adult:true,face:'smile',layer:2});
  const young=B.person(K+'l-eus0',-1.9,1.0,1.2,{...EUS,shirt:'casual',face:'smile',layer:3,holdR:'suitcase'});
  const eus=B.person(K+'l-eus',1.1,.6,1.2,{...EUS,shirt:'casual',face:'shy',layer:3,holdL:'suitcase'});
  const date=B.stand(signBoard('l-date',1.2,1.1,'LISBON'),.9,-1.6,{layer:1,s:0});const dcard=date.flap(S.flipCard(K+'l-dec',1.1,.4,'DEC 1960',INK.pink),0,1.1*.56,{z:.03});
  const flags=[B.stand(clubFlag('l-fa',.9,1.4,INK.green,INK.white),2.3,-1.3,{layer:1,s:0}),B.stand(clubFlag('l-fb',.9,1.4,INK.red,INK.white),3.5,-1.3,{layer:1,s:0})];
  const bangs=[B.stand(pow('l-p1',.18),2.55,-.6,{layer:2,s:0,tab:false}),B.stand(pow('l-p2',.18),3.75,-.6,{layer:2,s:0,tab:false})];
  const cal=B.stand(S.scoreboard(K+'l-cal',1.1,1.0,'WAITING'),4.3,-.3,{layer:2,s:0});cal.add(S.flipCard(K+'l-may',.86,.42,'MAY',INK.pink),0,.28,{z:.012});
  const months=['APR','MAR','FEB','JAN'].map((m,i)=>cal.flap(S.flipCard(K+`l-${m}`,.86,.42,m,i%2?INK.blue:'#3d5da0'),0,.7,{z:.03-i*.005}));
  const beachHouse=B.stand(S.house(K+'l-beach',1.1,1.0),2.9,-1.55,{layer:1,s:0});
  const homeB=B.stand(bubbleHome('l-bub',.7,.6),2.6,-.4,{layer:2,s:0});
  const cas=B.stand(suitcaseBody('l-case',1.3,.95),2.7,1.1,{layer:3,s:0});const lid=cas.flap(suitcaseLid('l-lid',1.3,.84),0,.84,{z:.02});
  const signed=B.stand(lineCard('l-signed',1.0,.5,['MUM','SIGNED'],INK.yellow),-4.0,1.65,{layer:3,s:0});
  const exam=B.stand(lineCard('l-exam',1.0,.5,['SCHOOL EXAM','PASSED'],INK.white),4.3,1.95,{layer:3,s:0});
  const first=B.stand(lineCard('l-first',1.2,.5,['MAY 1961','3 GOALS'],INK.red,INK.white),.7,1.95,{layer:3,s:0});
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`l-b${i}`,.1),1.7+i*.3,1.95,{layer:3,s:0,tab:false}));
  const hearts=[0,1].map(i=>B.stand(heart(`l-heart${i}`,.28),-2.9+i*.8,-.9,{layer:2,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.2):b.t;
   birds.dx=1.2*beat(t,1,10);mum.body.s=beat(t,1.8,2.6);bro.body.s=beat(t,2.2,3);young.body.s=beat(t,2.6,3.4)*(1-beat(t,5.6,6.4));young.body.x=-1.9+1.2*beat(t,3.6,5.8);
   mum.armR.rot=.12+2.2*beat(t,4,4.6)+.3*wave(t,4.6,10,1.2)-2.2*beat(t,10,10.6);
   eus.body.s=beat(t,5.8,6.8);date.s=beat(t,6.4,7.2);dcard.flip=-2.9+2.9*beat(t,7.4,8.2);
   flags.forEach((f,i)=>{f.s=beat(t,11.4+i*.4,12.2+i*.4)*(1-beat(t,15.4,16));f.rot=.06*wave(t,12.4,15.6,1+i*.3);});bangs.forEach((p,i)=>{p.s=pulse(t,12.6+i*.6,15);});
   cal.s=beat(t,13.4,14.2);months.forEach((m,i)=>{m.flip=-3.2*beat(t,14.4+i*.35,14.8+i*.35);});
   beachHouse.s=beat(t,16.2,17);eus.body.x=1.1+.8*beat(t,17,18.4)-.8*beat(t,22.2,23.4);
   homeB.s=beat(t,19,19.8)*(1-beat(t,22.4,23.2));eus.armR.rot=.12+1.1*pulse(t,19,22);
   cas.s=beat(t,20.4,21.2);const open=Math.max(manual?beat(act,0,.7):0,beat(t,22.4,23.8));lid.flip=-2.85*open;
   hearts.forEach((h,i)=>{h.s=Math.max(manual?beat(act,.6+i*.15,.85+i*.15):0,beat(t,24.2+i*.5,24.8+i*.5));});
   signed.s=beat(t,25,25.8);mum.armL.rot=-.12-1.2*pulse(t,25,28);bro.armR.rot=.12+1.2*pulse(t,24.4,27.6);
   exam.s=beat(t,28.6,29.4);first.s=beat(t,31.8,32.6);balls.forEach((bb,i)=>{bb.s=beat(t,33+i*.6,33.5+i*.6);});
   cheer(eus,Math.max(beat(t,34.6,35.2),manual?beat(act,.85,1):0));
   const bye=beat(t,38.2,38.8);mum.armR.rot+=2*bye+.3*wave(t,38.8,44,1.2);bro.armR.rot+=1.6*bye;
   sun.dy=.4*beat(t,30,33);
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,5.6,6.4)+.45*beat(t,6.4,7.2)-.45*beat(t,15.4,16.2)+.4*beat(t,20,21)-.4*beat(t,37.4,38.2):0;
  };
 }};

/* ───────────── 5 · The Game of Tears (tears) ───────────── */
const tears:SpreadDef={id:'tears',rest:27.4,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05,INK.white);line(k,-4.1,Z(-2.0),-4.1,Z(-1.0),.05,INK.white);line(k,-1.3,Z(-2.0),-1.3,Z(-1.0),.05,INK.white);line(k,-4.1,Z(-1.0),-1.3,Z(-1.0),.05,INK.white);
  k.text('1966',-2.5,Z(2.6),.52,INK.yellow,{max:2.4});k.text('FROM 3–0 DOWN TO 5–3',-2.5,Z(2.9),.17,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05,INK.white);line(k,1.2,Z(-2.0),1.2,Z(-1.0),.05,INK.white);line(k,3.8,Z(-2.0),3.8,Z(-1.0),.05,INK.white);line(k,1.2,Z(-1.0),3.8,Z(-1.0),.05,INK.white);
  k.text('THE GAME OF TEARS',2.5,Z(2.6),.36,INK.pink,{max:4.3});k.text('COMFORTED BY BOTH TEAMS',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.red,INK.white,INK.green,INK.white,INK.yellow],1);lightRig(k,1.1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.white,INK.red,INK.navy,INK.white,INK.sky],4);lightRig(k,1.3,.3);lightRig(k,3.7,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const rain=bd.add(stormCloud('t-rain',1.4,.7),'R',2.3,2.3,{out:.03}),sunP=bd.add(S.sun(K+'t-sun',.34),'R',3.8,2.0,{out:.012});
  const board=B.stand(S.scoreboard(K+'t-board',1.8,1.4,'PORTUGAL · N. KOREA'),-3.75,-1.08,{layer:1});
  board.add(lineCard('t-s53',1.44,.62,['5–3','WON!'],INK.yellow),0,.36,{z:.012});
  const scores=['4–3','3–3','2–3','1–3','0–3'].map((s,i)=>board.flap(S.flipCard(K+`t-s${i}`,1.44,.62,s,i%2?INK.blue:'#3d5da0'),0,.98,{z:.016+i*.005}));
  const goalL=B.stand(S.goal(K+'t-goalL',1.6,.8),-2.2,-1.75,{layer:1});void goalL;
  const eus=B.person(K+'t-eus',-2.2,.7,1.3,{...EUS,shirt:'casual',face:'open',legs:'kick',layer:3});
  const never=B.stand(S.flipCard(K+'t-never',1.2,.34,'DON’T GIVE UP',INK.yellow,INK.navy),-4.0,1.3,{layer:3,s:0});
  const pows=[0,1,2,3].map(i=>B.stand(pow(`t-pow${i}`,.2),-2.9+i*.45,-1.25,{layer:2,s:0,tab:false}));
  const goalR=B.stand(S.goal(K+'t-goalR',1.6,.8),2.5,-1.6,{layer:1});void goalR;
  const semi=B.stand(lineCard('t-semi',1.1,.5,['SEMI-FINAL','LOST 2–1'],INK.white),4.4,-1.0,{layer:1,s:0});
  const eus2=B.person(K+'t-eus2',2.5,.3,1.3,{...EUS,shirt:'casual',face:'sad',layer:2});
  const drops=[0,1].map(i=>eus2.body.add(tear(`t-tear${i}`,.12),(i?.07:-.11),1.3*1.22*.72,{z:.02}));
  const mates=[B.person(K+'t-mate',1.0,.9,1.3,{shirt:'casual',skin:'#f1b88f',hair:'short',face:'smile',layer:3}),B.person(K+'t-opp',3.8,.9,1.3,{shirt:'ger',skin:'#f1b88f',hair:'curly',hairColor:'#c9a46a',face:'smile',layer:3})];
  const heartP=eus2.body.add(heart('t-heart',.34),0,1.3*1.22+.05,{z:.02});
  const name=B.stand(S.banner(K+'t-name',2.2,.44,'GAME OF TEARS',INK.pink),2.5,1.95,{layer:3,s:0});
  const boot=B.stand(goldenBoot('t-boot',.6,.5),-.8,1.2,{layer:3,s:0});const nine=B.stand(S.flipCard(K+'t-nine',1.1,.32,'TOP SCORER · 9',INK.gold,INK.navy),-1.0,1.9,{layer:3,s:0});
  const ball=ballPair(B,S.ball(K+'t-ball',.1),S.ball(K+'t-ball',.1));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.4):b.t;
   eus.body.s=beat(t,2.2,3);board.s=beat(t,1.2,2);
   never.s=beat(t,8.6,9.4)*(1-beat(t,15,15.6));eus.armR.rot=.12+1.4*beat(t,8.8,9.4)-1.4*beat(t,10.6,11.2);
   // Four goals in a row: each kick flips a score card.
   const kicks=[11.2,11.9,12.6,13.3];let bx=-2.0,bz=.75,dy=0,vis=t>2.6&&t<15.2;
   for(const k0 of kicks){if(t>=k0&&t<k0+.7){const u=(t-k0)/.7;bx=-2.0-.2*u;bz=.75-2.3*u;dy=.35*Math.sin(u*Math.PI);}}
   eus.leg!.rot=-1.1*Math.max(...kicks.map(k0=>pulse(t,k0-.25,k0+.35)));
   scores.forEach((s,i)=>{const f=i===0?beat(t,14.4,14.9):beat(t,kicks[4-i]+.5,kicks[4-i]+.8);s.flip=-3.2*f;s.visible=f<.999;});
   pows.forEach((p,i)=>{p.s=pulse(t,kicks[i]+.55,kicks[i]+1.3);});
   // Semi-final: a penalty scored, then the loss.
   eus2.body.s=beat(t,15.6,16.4);semi.s=beat(t,19.8,20.6);
   if(t>=17.2&&t<18.2){const u=(t-17.2);bx=2.5-.4*u;bz=.1-1.7*u;dy=.3*Math.sin(u*Math.PI);vis=true;}else if(t>=18.2&&t<19.6){bx=2.1;bz=-1.6;dy=0;vis=true;}
   cheer(eus2,beat(t,18,18.4)*(1-beat(t,19.6,20)));
   const cry=beat(t,22.4,23.2);drops.forEach((d,i)=>{d.visible=cry>.05&&!(manual&&act>.9);d.scale=cry;d.dy=-.04*((t*1.3+i*.5)%1)*cry;});
   eus2.body.x=2.5+.0*cry;rain.scale=beat(t,21,22.4)*(1-Math.max(beat(t,35,37),manual?beat(act,.4,1):0));rain.visible=rain.scale>.02;rain.dx=.15*wave(t,22,35,.3);
   // Both teams come in close, then (the page action) wrap him in a hug.
   const near=beat(t,23.8,26.4),hug=Math.max(manual?beat(act,0,.7):0,beat(t,27.6,29));
   mates[0].body.s=beat(t,23,23.8);mates[1].body.s=beat(t,23.4,24.2);mates[0].body.x=1.0+.5*near+.35*hug;mates[1].body.x=3.8-.5*near-.35*hug;
   mates[0].armR.rot=.12+1.9*hug;mates[1].armL.rot=-.12-1.9*hug;eus2.armL.rot=-.12-.6*hug;eus2.armR.rot=.12+.6*hug;
   heartP.scale=Math.max(.001,manual?beat(act,.6,.9):0,beat(t,28.6,29.4));heartP.visible=heartP.scale>.02;
   name.s=beat(t,29.6,30.4);boot.s=beat(t,33.4,34.2);nine.s=beat(t,34,34.8);
   sunP.scale=Math.max(beat(t,38.6,39.8),manual?beat(act,.7,1):0);sunP.visible=sunP.scale>.02;cheer(eus,beat(t,34.4,35));
   ball(bx,bz,dy,vis);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15,15.8)+.45*beat(t,15.8,16.6)-.45*beat(t,32.6,33.4):0;
  };
 }};

/* ───────────── 6 · Clapping for the other side (applause) ───────────── */
const applause:SpreadDef={id:'applause',rest:22.2,
 left:k=>{pitch(k,-5,0);line(k,-5,Z(-2.0),0,Z(-2.0),.05,INK.white);line(k,-4.0,Z(-2.0),-4.0,Z(-1.0),.05,INK.white);line(k,-1.4,Z(-2.0),-1.4,Z(-1.0),.05,INK.white);line(k,-4.0,Z(-1.0),-1.4,Z(-1.0),.05,INK.white);
  k.text('WEMBLEY · 1968',-2.5,Z(2.6),.42,INK.blue,{max:4});k.text('A GREAT SAVE DESERVES APPLAUSE',-2.5,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{dirt(k,0,5,'#e2c28c');footprints(k,.4,Z(1.8),4.6,Z(1.2),14);
  k.text('PERSEVERANCE',2.5,Z(2.6),.4,INK.green,{max:4});k.text('MOZAMBIQUE · 2019',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.5);crowd(k,4.5,1.1,2.5,[INK.red,INK.white,INK.blue,INK.white],2);lightRig(k,1.0,.3);lightRig(k,3.6,.3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a8',INK.orange,y=>.45-y/3*.4);sea(k,4.5,1.8,.4);tinRoofs(k,.3,10,2.45,4);palms(k,[.4,4.1],2.3);k.fill(rect(0,2.45,4.5,.55),'#e2c28c');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'a-sun',.36),'R',2.2,1.9,{out:.012}),bunt=bd.add(S.bunting(K+'a-bunt',2.6,.4,[INK.green,INK.yellow,INK.red,INK.white]),'R',.8,2.6,{out:.03});
  const goal=B.stand(S.goal(K+'a-goal',1.7,.85),-2.7,-1.52,{layer:1});void goal;
  const keeper=B.person(K+'a-keeper',-2.7,-1.1,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const eus=B.person(K+'a-eus',-2.2,.9,1.3,{...EUS,shirt:'casual',face:'smile',legs:'kick',layer:3});
  const saved=B.stand(S.flipCard(K+'a-saved',.9,.32,'SAVED!',INK.blue),-4.2,.1,{layer:2,s:0});
  const board=B.stand(S.scoreboard(K+'a-board',1.5,1.2,'FINAL 1968'),-.8,-1.55,{layer:1,s:0});board.add(lineCard('a-41',1.2,.5,['LOST 4–1','EXTRA TIME'],INK.white),0,.34,{z:.012});
  const bravo=[0,1,2].map(i=>B.stand(S.flipCard(K+`a-clap${i}`,.8,.3,'CLAP!',[INK.yellow,INK.pink,INK.sky][i],INK.navy),-4.3+i*.7,1.5+(i%2)*.4,{layer:3,s:0}));
  const kid=B.person(K+'a-kid',1.3,.5,1.0,{...EUS,shirt:'casual',face:'grin',legs:'kick',layer:3});
  const title=B.stand(lineCard('a-first',1.9,.62,['AFRICA’S FIRST','GREAT FOOTBALLER'],INK.yellow),3.2,-1.4,{layer:1,s:0});
  const year=B.stand(signBoard('a-2019',1.1,1.1,'2019'),4.3,-.2,{layer:2,s:0});
  const per=B.stand(S.banner(K+'a-per',2.1,.44,'PERSEVERANCE',INK.green),2.8,1.95,{layer:3,s:0});
  const stars=[0,1,2].map(i=>B.stand(star(`a-star${i}`,.3),2.0+i*.7,.3+(i%2)*.4,{layer:2,s:0,tab:false}));
  const fans=[[3.6,1.0,'#7f5138','bun','coach'],[2.4,1.2,'#b27650','short','fan']].map(([x,z,sk,hr,sh],i)=>B.person(K+`a-fan${i}`,x as number,z as number,i?1.0:1.45,{shirt:sh as 'fan',skin:sk as string,hair:hr as 'short',hairColor:'#1d1a1f',adult:i===0,face:'grin',layer:3}));
  const ball=ballPair(B,S.ball(K+'a-ball',.1),sockBall('a-sb',.11));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.2):b.t;
   keeper.body.s=beat(t,1.2,2);eus.body.s=beat(t,2.4,3.2);
   // The last-second shot, and the save.
   let bx=-2.0,bz=.95,dy=0,vis=t>3&&t<24;
   if(t>=7.6&&t<8.6){const u=beat(t,7.6,8.6);bx=-2.0-.4*u;bz=.95-2.0*u;dy=.35*Math.sin(u*Math.PI);}else if(t>=8.6&&t<24){bx=-2.5;bz=-.9;dy=.45;}
   eus.leg!.rot=-1.1*pulse(t,7.3,7.9);
   const dive=beat(t,8,8.6);keeper.armL.rot=-.12-2.3*dive;keeper.armR.rot=.12+2.3*dive;keeper.body.rot=.25*dive*(1-beat(t,11,12));saved.s=beat(t,9,9.6)*(1-beat(t,15.6,16.2));
   // He claps for the goalkeeper right away; then the scoreboard; then he congratulates him.
   const c1=beat(t,12.4,13)*(1-beat(t,15.4,16));
   const shake=beat(t,17.6,19)*(1-beat(t,21.4,22));eus.body.x=-2.2+.0*shake;eus.body.z=.9-.9*shake;keeper.armR.rot+=-1.2*shake;
   board.s=beat(t,15.9,16.7);
   const cl=Math.max(manual?beat(act,0,.4):0,beat(t,22.4,23.2))*(manual?1:1-beat(t,26,26.6));
   clap(eus,Math.max(c1,cl),t);if(Math.max(c1,cl)<.02)eus.armR.rot=.12+1.4*shake;
   bravo.forEach((c,i)=>{c.s=Math.max(manual?beat(act,.3+i*.15,.55+i*.15):0,beat(t,22.8+i*.4,23.4+i*.4)*(1-beat(t,34,35)));});
   keeper.armL.rot+=manual?-1.8*beat(act,.7,1):-1.8*beat(t,24,24.6)*(1-beat(t,26,26.6));
   // Mafalala: the barefoot boy with a sock ball, then the words.
   kid.body.s=beat(t,24.4,25.2);title.s=beat(t,25.4,26.4);
   if(t>=25.2){vis=true;const u=((t-25.2)%1.6)/1.6;bx=1.75;bz=.6;dy=.35*Math.sin(u*Math.PI);kid.leg!.rot=-.6*Math.abs(Math.sin(u*Math.PI));}
   year.s=beat(t,30.2,31);fans.forEach((f,i)=>{f.body.s=beat(t,31+i*.4,31.8+i*.4);});per.s=beat(t,33.4,34.2);stars.forEach((s2,i)=>{s2.s=beat(t,34.4+i*.4,35+i*.4);s2.rot=.1*wave(t,35,44,.7+i*.2);});
   fans.forEach((f,i)=>cheer(f,beat(t,38+i*.3,38.6+i*.3)));cheer(kid,beat(t,38.4,39));if(t>38)clap(eus,beat(t,38,38.6),t);
   bunt.scale=beat(t,34,35);bunt.visible=bunt.scale>.02;sun.dy=.5*beat(t,24,28);
   ball(bx,bz,dy,vis);
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,23.8,24.6)+.45*beat(t,24.6,25.4)-.45*beat(t,36.8,37.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={sockball,father,doors,lisbon,tears,applause};
void clamp01;
