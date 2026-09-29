/**
 * The six Alexia Putellas pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/putellas/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a closed gate, a door, an empty seat, a star, a rain cloud, stairs.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='putellas-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const ALEXIA={skin:'#f1b88f',hair:'long' as const,hairColor:'#6b4630'};
const SKINS=['#f1b88f','#7f5138','#d99a6c','#b27650'];

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function paving(k:Kit,x0:number,x1:number,tone='#e3d6bb',line='#b2a283'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.14);
 for(let y=.5;y<PAGE_D;y+=.5)k.key(`M${x0} ${y} L${x1} ${y}`,.01,line);for(let r=0;r<13;r++)for(let x=x0+(r%2)*.4;x<x1;x+=.8)k.key(`M${x} ${r*.5} L${x} ${r*.5+.5}`,.01,line);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function road(k:Kit,x0:number,x1:number,y:number){const r=rect(x0,y-.22,x1-x0,.44);k.fill(r,'#8d8a86');k.dots(r,INK.navy,.05,.2);dash(k,x0+.1,y,x1-.1,y,.03,INK.yellow,.2);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function hills(k:Kit,w:number,h:number,y:number,tone:string,dot:string=INK.navy){const p=`M0 ${y} Q${w*.28} ${y-.5} ${w*.52} ${y-.15} Q${w*.78} ${y+.1} ${w} ${y-.3} L${w} ${h} L0 ${h} Z`;k.fill(p,tone);k.dots(p,dot,.05,.22);}
function roofs(k:Kit,x0:number,x1:number,y:number,seed=1){for(let x=x0,i=0;x<x1;x+=.42,i++){const hh=.3+((i*7+seed)%4)*.09,b=rect(x,y-hh,.36,hh);k.fill(b,['#f2d3a0','#f0b7a4','#f6e2b8','#e9c28e'][(i+seed)%4]);k.key(b,.01);k.fill(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),INK.red);k.key(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),.01);k.fill(rect(x+.12,y-hh+.08,.1,.1),(i+seed)%3?INK.blue:INK.yellow);}}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const faceCard=(key:string,s:number,mood:'happy'|'sad'|'worried',color:string)=>sp(key,s,s,k=>{const c=s/2,r=s*.46;k.fill(ell(c,c,r,r),color);k.dots(ell(c,c,r,r),INK.navy,.03,.18);k.key(ell(c,c,r,r),.014);
 k.circle(c-s*.15,c-s*.06,s*.045,INK.navy,true);k.circle(c+s*.15,c-s*.06,s*.045,INK.navy,true);const lw=s*.05;
 if(mood==='happy')k.key(`M${c-s*.18} ${c+s*.1} Q${c} ${c+s*.3} ${c+s*.18} ${c+s*.1}`,lw);
 else if(mood==='sad')k.key(`M${c-s*.16} ${c+s*.25} Q${c} ${c+s*.08} ${c+s*.16} ${c+s*.25}`,lw);
 else k.key(`M${c-s*.18} ${c+s*.2} Q${c-s*.09} ${c+s*.12} ${c} ${c+s*.2} Q${c+s*.09} ${c+s*.28} ${c+s*.18} ${c+s*.2}`,lw*.9);},{rim:.02});
const rainCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.7],[0,h*.45],[w*.16,h*.24],[w*.32,h*.05],[w*.56,0],[w*.74,h*.16],[w*.92,h*.24],[w,h*.52],[w*.88,h*.7]]);k.fill(p,'#9aa0b4');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<5;i++){const x=w*(.16+i*.17),y=h*(.78+(i%2)*.1);k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const heartP=(key:string,s:number,color:string=INK.pink)=>sp(key,s,s,k=>{const c=s/2,p=`M${c} ${s*.9} C${s*.02} ${s*.5} ${s*.12} ${s*.05} ${c} ${s*.3} C${s*.88} ${s*.05} ${s*.98} ${s*.5} ${c} ${s*.9} Z`;k.fill(p,color);k.dots(p,INK.red,.03,.35);k.key(p,.012);},{rim:.02});
const starShape=(c:number,r:number,ri:number)=>poly(Array.from({length:10},(_,i)=>{const a=i/10*TAU-Math.PI/2,rr=i%2?ri:r;return [c+Math.cos(a)*rr,c+Math.sin(a)*rr];}));
const bigStar=(key:string,r:number,lit:boolean)=>sp(key,r*2,r*2,k=>{const p=starShape(r,r,r*.45);k.fill(p,lit?INK.yellow:'#8d93a8');k.dots(p,lit?INK.orange:INK.navy,.03,.3);k.key(p,.014);},{rim:.02});
const glow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{for(let i=0;i<16;i++){const a=i/16*TAU;k.key(`M${r+Math.cos(a)*r*.55} ${r+Math.sin(a)*r*.55} L${r+Math.cos(a)*r*(i%2?.8:.98)} ${r+Math.sin(a)*r*(i%2?.8:.98)}`,.03,INK.yellow);}},{rim:.015});
const armband=(key:string,s:number)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),INK.yellow);k.key(ell(s/2,s/2,s*.46,s*.46),.01);k.text('C',s/2,s*.7,s*.6,INK.navy);},{rim:.012});
const car=(key:string,w:number,h:number,color:string)=>sp(key,w,h,k=>{const b=`M0 ${h*.8} L0 ${h*.46} L${w*.2} ${h*.4} L${w*.32} ${h*.08} L${w*.7} ${h*.08} L${w*.84} ${h*.4} L${w} ${h*.48} L${w} ${h*.8} Z`;k.fill(b,color);k.dots(b,INK.navy,.035,.2);k.key(b,.013);
 k.fill(poly([[w*.36,h*.16],[w*.5,h*.16],[w*.5,h*.4],[w*.27,h*.4]]),INK.sky);k.fill(poly([[w*.54,h*.16],[w*.67,h*.16],[w*.78,h*.4],[w*.54,h*.4]]),INK.sky);k.key(`M${w*.52} ${h*.1} L${w*.52} ${h*.78}`,.01);
 for(const x of [w*.22,w*.78]){k.fill(ell(x,h*.8,h*.19,h*.19),INK.navy);k.circle(x,h*.8,h*.07,INK.grey);}k.fill(rect(w*.93,h*.52,w*.07,h*.08),INK.yellow);},{rim:.02});
const stadiumBowl=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=`M0 ${h*.3} Q${w/2} ${h*.05} ${w} ${h*.3} L${w*.94} ${h} L${w*.06} ${h} Z`;k.fill(b,'#dcd5c4');k.dots(b,INK.navy,.04,.2);k.key(b,.014);
 for(let i=0;i<3;i++)k.key(`M${w*.04} ${h*(.45+i*.16)} Q${w/2} ${h*(.22+i*.16)} ${w*.96} ${h*(.45+i*.16)}`,.012,INK.blue);
 for(let i=0;i<12;i++)k.fill(rect(w*(.1+i*.068),h*.58+(i%3)*.02,w*.04,h*.1),[INK.blue,INK.red,INK.yellow][i%3]);k.text(label,w/2,h*.92,h*.16,INK.navy,{max:w*.8,weight:900});},{rim:.02});
const schoolHouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.25,w,h*.75);k.fill(b,'#f3dcb0');k.dots(b,INK.orange,.045,.15);k.key(b,.014);const roof=poly([[-.04,h*.28],[w/2,0],[w+.04,h*.28]]);k.fill(roof,INK.red);k.key(roof,.013);
 k.fill(ell(w/2,h*.17,h*.07,h*.07),INK.white);k.key(ell(w/2,h*.17,h*.07,h*.07),.01);for(let r=0;r<2;r++)for(let c=0;c<4;c++){if(r===1&&(c===1||c===2))continue;const win=rect(w*(.08+c*.23),h*(.38+r*.3),w*.14,h*.16);k.fill(win,INK.sky);k.key(win,.01);}
 const d=rect(w*.4,h*.7,w*.2,h*.3);k.fill(d,INK.blue);k.key(d,.012);k.fill(rect(w*.15,h*.3,w*.7,h*.08),INK.white);k.text('SCHOOL',w/2,h*.37,h*.07,INK.navy,{weight:900,max:w*.6});});
const gatePosts=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.12]){const p=rect(x,h*.1,.12,h*.9);k.fill(p,INK.stone);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.fill(ell(x+.06,h*.1,.08,.05),INK.grey);}
 k.key(`M.06 ${h*.14} Q${w/2} ${-h*.02} ${w-.06} ${h*.14}`,.03,INK.navy);});
const gateLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M0 .02 L${w} .02 M0 ${h-.03} L${w} ${h-.03}`,.035,INK.navy);for(let x=.04;x<w;x+=.1)k.key(`M${x} 0 L${x} ${h}`,.022,INK.navy);k.circle(w*.5,h*.5,.05,INK.gold);},{rim:.012,grain:.5});
const pitchCard=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.grass);k.dots(b,INK.leaf,.04,.35);k.key(b,.013);k.key(`M${w*.3} ${h*.75} L${w*.3} ${h*.3} L${w*.7} ${h*.3} L${w*.7} ${h*.75}`,.025,INK.white);k.hatch(rect(w*.3,h*.3,w*.4,h*.45),INK.white,.05,.78,.006);k.text(label,w/2,h*.2,h*.16,INK.navy,{weight:900,max:w*.9});});
const pole=(key:string,h:number)=>sp(key,.1,h,k=>{const p=rect(0,0,.1,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.2)k.fill(rect(0,y,.1,.1),INK.pink);k.key(p,.008);for(let y=.1;y<h;y+=.1)k.key(`M0 ${y} L.04 ${y}`,.006);},{rim:.015});
const doorFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=`M0 ${h} L0 ${h*.12} Q${w/2} ${-h*.06} ${w} ${h*.12} L${w} ${h} L${w-.12} ${h} L${w-.12} ${h*.18} Q${w/2} ${h*.04} .12 ${h*.18} L.12 ${h} Z`;k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.3);k.key(f,.013);
 const inside=`M.12 ${h} L.12 ${h*.18} Q${w/2} ${h*.04} ${w-.12} ${h*.18} L${w-.12} ${h} Z`;k.fill(inside,INK.yellow);k.dots(inside,INK.orange,.04,(x,y)=>.2+y/h*.3);});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.navy);k.dots(d,INK.blue,.04,.3);k.key(d,.012,'#101a36');for(let i=0;i<2;i++)k.key(rect(w*.15,h*(.1+i*.45),w*.7,h*.35),.012,INK.sky);k.circle(w*.84,h*.55,.03,INK.gold);},{rim:.012});
const bleachers=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<4;i++){const y=h*(.1+i*.22),r=rect(0,y,w,h*.22);k.fill(r,i%2?'#cfd6e6':'#e4e9f2');k.key(r,.01);for(let x=.08;x<w-.05;x+=.2)k.fill(rect(x,y+h*.04,.13,h*.1),[INK.red,INK.blue,INK.yellow][(i+Math.round(x*5))%3]);}k.fill(rect(0,0,w,h*.1),INK.grey);k.key(rect(0,0,w,h*.1),.012);});
const chair=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const back=rect(w*.1,0,w*.8,h*.5);k.fill(back,INK.blue);k.dots(back,INK.navy,.03,.3);k.key(back,.012);const seat=rect(0,h*.5,w,h*.14);k.fill(seat,INK.sky);k.key(seat,.012);k.keyFill(rect(w*.08,h*.64,w*.1,h*.36),INK.navy);k.keyFill(rect(w*.82,h*.64,w*.1,h*.36),INK.navy);});
const photoFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.gold);k.key(f,.014);const p=rect(w*.12,h*.1,w*.76,h*.8);k.fill(p,INK.sky2);k.dots(p,INK.sky,.03,.4);
 k.fill(ell(w/2,h*.4,w*.13,w*.13),INK.navy);k.fill(`M${w*.26} ${h*.9} Q${w*.3} ${h*.58} ${w/2} ${h*.58} Q${w*.7} ${h*.58} ${w*.74} ${h*.9} Z`,INK.navy);
 const c=w*.78,y=h*.2,s=w*.1;k.fill(`M${c} ${y+s} C${c-s*1.2} ${y} ${c-s*.4} ${y-s*.8} ${c} ${y-s*.1} C${c+s*.4} ${y-s*.8} ${c+s*1.2} ${y} ${c} ${y+s} Z`,INK.pink);},{rim:.02});
const bookP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);k.fill(rect(0,0,w*.1,h),INK.blue);k.fill(rect(w*.45,h*.2,w*.14,h*.5),INK.red);k.fill(rect(w*.3,h*.38,w*.44,h*.14),INK.red);k.text('MEDICINE',w*.55,h*.88,h*.12,INK.navy,{weight:900,max:w*.8});},{rim:.018});
const contract=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.12);k.key(b,.013);k.text('CONTRACT',w/2,h*.16,h*.1,INK.navy,{weight:900,max:w*.8});for(let i=0;i<5;i++)k.key(`M${w*.12} ${h*(.3+i*.1)} L${w*(.88-(i%2)*.15)} ${h*(.3+i*.1)}`,.01,INK.grey);
 k.key(`M${w*.18} ${h*.86} C${w*.3} ${h*.7} ${w*.36} ${h*.95} ${w*.46} ${h*.8} S${w*.62} ${h*.86} ${w*.78} ${h*.78}`,.018,INK.blue);k.key(`M${w*.12} ${h*.9} L${w*.88} ${h*.9}`,.01);});
const tattoo=(key:string,s:number)=>sp(key,s,s,k=>{const c=s/2;k.fill(ell(c,c,s*.47,s*.47),'#f4d3b4');k.dots(ell(c,c,s*.47,s*.47),INK.orange,.03,.2);k.key(ell(c,c,s*.47,s*.47),.014);
 const n=INK.navy;k.fill(ell(s*.38,s*.26,s*.08,s*.08),n);k.fill(`M${s*.25} ${s*.84} L${s*.28} ${s*.44} Q${s*.38} ${s*.34} ${s*.48} ${s*.44} L${s*.5} ${s*.84} Z`,n);
 k.key(`M${s*.45} ${s*.48} Q${s*.56} ${s*.5} ${s*.6} ${s*.42}`,s*.04,n);k.fill(ell(s*.63,s*.38,s*.07,s*.05),n);k.fill(ell(s*.7,s*.36,s*.035,s*.035),n);
 k.key(`M${s*.46} ${s*.6} Q${s*.6} ${s*.66} ${s*.68} ${s*.6}`,s*.035,n);k.fill(ell(s*.74,s*.62,s*.055,s*.055),INK.white);k.key(ell(s*.74,s*.62,s*.055,s*.055),.01,n);},{rim:.02});
const thanksBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.key(b,.014);k.keyFill(rect(w*.46,h*.82,w*.08,h*.18),INK.brown);
 const l=rect(w*.06,h*.08,w*.42,h*.66);k.fill(l,INK.sky2);k.key(l,.01);k.fill(ell(w*.27,h*.32,w*.07,w*.07),INK.navy);k.fill(`M${w*.15} ${h*.62} Q${w*.17} ${h*.44} ${w*.27} ${h*.44} Q${w*.37} ${h*.44} ${w*.39} ${h*.62} Z`,INK.navy);k.text('DAD',w*.27,h*.72,h*.1,INK.navy,{weight:900});
 const r=rect(w*.52,h*.08,w*.42,h*.66);k.fill(r,INK.yellow);k.key(r,.01);for(let i=0;i<3;i++){const x=w*(.6+i*.13);k.fill(ell(x,h*.38,w*.045,w*.045),SKINS[i+1]);k.fill(rect(x-w*.05,h*.46,w*.1,h*.14),INK.navy);}k.text('TEAM',w*.73,h*.72,h*.1,INK.navy,{weight:900});});
const stairs=(key:string,w:number,h:number,labels:string[])=>sp(key,w,h,k=>{const n=labels.length,sw=w/n,sh=h/n;for(let i=0;i<n;i++){const r=rect(i*sw,h-(i+1)*sh,sw,(i+1)*sh);k.fill(r,[INK.sky,INK.yellow,INK.pink][i%3]);k.dots(r,INK.navy,.035,.18);k.key(r,.013);k.fill(rect(i*sw,h-(i+1)*sh,sw,.06),INK.white);k.text(labels[i],i*sw+sw/2,h-(i+1)*sh+sh*.62,Math.min(.2,sh*.4),INK.navy,{weight:900,max:sw*.85});}});
const calendar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.14),INK.red);for(let i=0;i<4;i++)k.circle(w*(.2+i*.2),h*.07,.03,INK.white,true);});
const monthCard=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.key(b,.012);k.text(label,w/2,h*.4,h*.28,INK.navy,{weight:900,max:w*.8});for(let r=0;r<3;r++)for(let c=0;c<5;c++)k.circle(w*(.14+c*.18),h*(.58+r*.13),.018,INK.navy);},{rim:.012});
const bandage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f6d8b8');k.key(b,.01);k.fill(rect(w*.35,0,w*.3,h),'#ecc39c');for(let i=0;i<3;i++)for(let j=0;j<2;j++)k.circle(w*(.42+i*.08),h*(.35+j*.3),.008,INK.brown);},{rim:.012});

const markCard=(key:string,w:number,h:number,label:string,ok:boolean)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,ok?INK.grass:INK.pink);k.dots(b,INK.navy,.03,.2);k.key(b,.012);k.text(label,w*.4,h*.72,h*.5,INK.navy,{weight:900,max:w*.62});const x=w*.85,y=h*.5,r=h*.26;
 if(ok)k.key(`M${x-r} ${y} L${x-r*.3} ${y+r*.7} L${x+r} ${y-r*.8}`,.03,INK.navy);else k.key(`M${x-r} ${y-r} L${x+r} ${y+r} M${x+r} ${y-r} L${x-r} ${y+r}`,.03,INK.white);},{rim:.015});
const leftArrow=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[w,h*.35],[w*.38,h*.35],[w*.38,h*.1],[0,h*.5],[w*.38,h*.9],[w*.38,h*.65],[w,h*.65]]);k.fill(p,INK.pink);k.dots(p,INK.red,.03,.35);k.key(p,.013);},{rim:.02});
/** Two ball cut-outs (one per page) share one trajectory so a pass can cross the gutter. */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
const cheer=(p:{armL:{rot:number};armR:{rot:number}},v:number,extra=0)=>{p.armL.rot=-.12-2.3*v-extra;p.armR.rot=.12+2.3*v+extra;};

/* ───────────── 1 · A girl who loved football (mollet) ───────────── */
const mollet:SpreadDef={id:'mollet',rest:20.5,
 left:k=>{paving(k,-5,0);road(k,-5,0,Z(2.05));footprints(k,-3.6,Z(.95),-.7,Z(.9),9);
  k.text('MOLLET DEL VALLÈS',-2.5,Z(2.62),.36,INK.blue,{max:4.4});k.text('1994 · NEAR BARCELONA',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{paving(k,0,5,'#e9dcc0');const yard=rect(.3,Z(-.2),4.5,2.3);k.fill(yard,INK.grass,.6);k.dots(yard,INK.leaf,.05,.3);chalk(k,rect(.5,Z(0),4.1,1.9));chalk(k,ell(2.55,Z(.95),.45,.45));
  k.text('THE SCHOOL GATE',2.5,Z(2.62),.36,INK.pink,{max:4.2});k.text('HER FAMILY ACCEPTED HER DREAMS',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.5);hills(k,4.5,3,1.9,'#c9b58a');roofs(k,.1,4.4,2.55,1);
    const tw=rect(3.2,.95,.34,1.25);k.fill(tw,'#e9c28e');k.key(tw,.012);k.fill(poly([[3.14,.97],[3.37,.62],[3.6,.97]]),INK.red);k.circle(3.37,1.2,.08,INK.white);k.fill(rect(0,2.55,4.5,.45),INK.stone);}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,2.0,'#b9c98a',INK.green);roofs(k,2.3,4.4,2.6,3);k.fill(rect(0,2.6,4.5,.4),INK.stone);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'m-sun',.34),'L',1.0,2.2,{out:.012}),cloud=bd.add(S.cloud(K+'m-cloud',1.0,.42),'R',3.2,2.4);
  const stad=bd.add(stadiumBowl('m-stad',1.9,.8,'CAMP NOU'),'R',.9,1.35,{out:.02});
  const storm=bd.add(rainCloud('m-storm',1.3,.7),'R',2.3,1.9,{out:.03}),sun2=bd.add(S.sun(K+'m-sun2',.36),'R',3.3,1.6,{out:.012});
  const flags=bd.add(S.bunting(K+'m-bunt',3.4,.4,[INK.pink,INK.yellow,INK.sky,INK.orange]),'R',.5,2.5,{out:.02});
  const sign=B.stand(S.sign(K+'m-sign',1.1,1.2,'MOLLET'),-4.25,-1.1,{layer:1});
  const card94=sign.flap(S.flipCard(K+'m-1994',.86,.38,'1994',INK.pink),0,1.2*.56,{z:.03});
  B.stand(S.house(K+'m-h1',1.2,1.3),-2.7,-1.6,{layer:1});B.stand(S.house(K+'m-h2',1.0,1.15),-1.25,-1.85,{layer:1});
  B.stand(S.lamp(K+'m-lamp',.4,1.7),-4.75,.4,{layer:2});B.stand(S.bush(K+'m-bush',.9,.34),-4.3,1.55,{layer:3,tab:false});B.stand(S.bench(K+'m-bench',1.0,.42),-1.0,.2,{layer:2});B.stand(S.tree(K+'m-tree',.9,1.4,'round'),-.55,-.9,{layer:1});
  const dad=B.person(K+'m-dad',-3.05,.55,1.75,{shirt:'casual',hair:'short',adult:true,skin:'#e3a47a',beard:true,face:'smile',layer:2});
  const girl=B.person(K+'m-girl',-2.45,.85,1.0,{shirt:'navy',...ALEXIA,face:'grin',layer:3});
  B.slot(-3.5,1.25,-1.4,1.25);
  B.stand(schoolHouse('m-school',2.0,1.5),3.35,-1.3,{layer:1});
  const teamCard=B.stand(pitchCard('m-team',1.3,.95,'TEAM'),1.55,-1.6,{layer:1});
  const gate=B.stand(gatePosts('m-gate',1.7,1.05),1.55,-.8,{layer:2});
  const gL=gate.flap(gateLeaf('m-gl',.73,.8),-.73,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(gateLeaf('m-gr',.73,.8),.73,.02,{anchor:'br',axis:'y',z:.02});
  const A=B.person(K+'m-alexia',2.6,.95,1.05,{shirt:'bib',...ALEXIA,legs:'kick',face:'smile',layer:3});
  const kids=[[3.7,.35,'short',SKINS[1]],[4.4,1.25,'curly',SKINS[2]],[3.35,1.55,'bun',SKINS[3]]].map(([x,z,h,s],i)=>B.person(K+`m-kid${i}`,x as number,z as number,1.05,{shirt:i===2?'casual':'bib',hair:h as 'short',skin:s as string,face:'grin',layer:3}));
  const mum=B.person(K+'m-mum',4.45,-.35,1.7,{shirt:'coach',hair:'long',hairColor:'#4a3326',adult:true,skin:'#eab08a',face:'smile',layer:2});
  const sis=B.person(K+'m-sis',4.0,-.05,.85,{shirt:'fan',hair:'bun',hairColor:'#6b4630',skin:'#f1b88f',face:'grin',layer:2});
  const bubble=A.body.add(S.bubble(K+'m-dream',.62,.52,'star'),.45,A.h*.95,{z:-.02});
  const q=B.stand(lineCard('m-job',1.2,.42,['A JOB IN FOOTBALL?'],INK.white),1.05,1.95,{layer:3,s:0});
  const cTeam=mum.body.add(markCard('m-cteam',.8,.32,'TEAM',true),-.75,mum.h*.62,{z:.03,anchor:'center'}),cSchool=mum.body.add(markCard('m-cschool',.95,.32,'SCHOOL',false),-.75,mum.h*.4,{z:.03,anchor:'center'});
  const fair=B.stand(lineCard('m-everyone',1.25,.5,['FOR EVERYONE'],INK.yellow),.95,1.95,{layer:3,s:0});
  const unfair=fair.flap(lineCard('m-notgirls',1.25,.5,['NOT FOR GIRLS?'],INK.grey),0,.5,{z:.02});
  const heart=mum.body.add(heartP('m-heart',.3),.4,mum.h*.95,{z:-.02,anchor:'center'});
  const ball=ballPair(B,'m-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.5):b.t;
   sun.dy=.3*beat(t,0,2);cloud.dx=-.5*beat(t,0,40);card94.flip=-2.9+2.9*beat(t,2.6,3.4);
   dad.body.s=beat(t,3.6,4.6);girl.body.s=beat(t,4.2,5.2);
   const walk=beat(t,9,12.6);dad.body.x=-3.05+1.45*walk;girl.body.x=-2.45+1.45*walk;dad.body.dy=girl.body.dy=.04*Math.abs(Math.sin(t*7))*(t>9&&t<12.6?1:0);
   stad.scale=beat(t,8.8,9.8);stad.visible=stad.scale>.02;
   dad.armR.rot=.12+2.0*beat(t,11.4,12)-2.0*beat(t,13.4,14)+2.3*beat(t,34,34.6);dad.armL.rot=-.12-.6*beat(t,9,9.6)+.6*beat(t,13.4,14)-2.3*beat(t,34,34.6);
   girl.armR.rot=.12+.5*beat(t,9,9.6)-.5*beat(t,13.4,14)+2.2*beat(t,11.8,12.3)-2.2*beat(t,13,13.5);
   // School playground: she plays, dreams, doubts.
   A.body.s=beat(t,13.8,14.8);kids.forEach((p,i)=>{p.body.s=beat(t,14.2+i*.4,15+i*.4);});
   const dream=beat(t,16.2,16.9)*(1-beat(t,19.6,20.2));bubble.scale=dream;bubble.visible=dream>.02;
   q.s=beat(t,17.2,18)*(1-beat(t,19.6,20.3));
   // The gate: narrated at 21, or the reader's tap.
   const open=manual?beat(act,0,.6):beat(t,21,22.4);gL.flip=-1.9*open;gR.flip=1.9*open;
   const run=manual?beat(act,.4,1):beat(t,33.8,36.5);A.body.x=2.6-.5*run;A.body.z=.95-.9*run;
   mum.body.s=beat(t,22.9,23.9);cTeam.scale=beat(t,24.3,25)*(1-beat(t,33.4,34));cSchool.scale=beat(t,25.2,25.9)*(1-beat(t,33.4,34));cTeam.visible=cTeam.scale>.02;cSchool.visible=cSchool.scale>.02;mum.armR.rot=.12+1.5*beat(t,24.2,24.8)-1.5*beat(t,27,27.6);
   fair.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.2,.45):0);unfair.flip=-3.1*Math.max(beat(t,33.6,34.6),manual?beat(act,.5,.9):0);
   storm.scale=beat(t,28.2,29.2)*(1-Math.max(beat(t,33.6,35),manual?beat(act,.3,.8):0));storm.visible=storm.scale>.02;storm.dx=.06*wave(t,29,33.6,.4);
   sun2.scale=Math.max(beat(t,34.4,35.4),manual?beat(act,.6,1):0);sun2.visible=sun2.scale>.02;
   sis.body.s=beat(t,34.2,35);heart.scale=beat(t,35,35.6);heart.visible=heart.scale>.02;
   flags.scale=beat(t,39,40);flags.visible=flags.scale>.02;
   cheer(A,Math.max(beat(t,39.4,40),manual?beat(act,.85,1):0));kids.forEach((p,i)=>cheer(p,beat(t,39.8+i*.3,40.4+i*.3)));
   // The ball: bounces at school, then rolls with her through the gate.
   let bx=A.body.x+.35,bz=A.body.z+.12,by=0;
   if(!manual&&t>15&&t<20.4){const ph=(t-15)/1.4%1,pts=[[A.body.x+.35,.97],[3.5,.45],[4.2,1.3],[3.1,1.6]],i=Math.floor((t-15)/1.4)%4,a=pts[i],c=pts[(i+1)%4];bx=a[0]+(c[0]-a[0])*ph;bz=a[1]+(c[1]-a[1])*ph;by=.25*Math.sin(ph*Math.PI);}
   ball(bx,bz,by,t>14||manual);A.leg!.rot=-.8*maxOf([15,16.4,19.2].map(a=>pulse(t,a-.3,a+.2)));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,12.6,13.6)+.3*beat(t,21,22)-.3*beat(t,33,34):0;
  };
 }};

/* ───────────── 2 · Small, but finding space (sabadell) ───────────── */
const sabadell:SpreadDef={id:'sabadell',rest:22.6,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.75);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-2.5,Z(0),.7,.7));road(k,-5,0,Z(2.05));
  k.text('A BOYS’ TEAM',-2.5,Z(2.62),.4,INK.navy,{max:4});k.text('ONLY THREE TRAININGS',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.4 ${Z(-2.1)} L2.4 ${Z(-1.3)} L5 ${Z(-1.3)}`);
  const s1=ell(3.95,Z(1.2),.55,.34);k.fill(s1,INK.yellow,.75);k.dots(s1,INK.orange,.05,.4);k.text('SPACE',3.95,Z(1.26),.15,INK.navy,{weight:900});dash(k,1.8,Z(1.15),3.5,Z(1.2),.03,INK.white);
  k.text('SABADELL',2.5,Z(2.62),.44,INK.blue,{max:4});k.text('THE GIRLS’ TEAM · AGED SEVEN',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:2.9,paint:k=>{wash(k,4.5,2.9,'#c9cdd6',INK.navy,y=>.28-y*.05);hills(k,4.5,2.9,1.9,'#a9b78a');const club=rect(.6,1.35,1.6,.8);k.fill(club,'#e8dcc4');k.key(club,.012);k.fill(rect(.5,1.28,1.8,.1),INK.grey);
    for(let i=0;i<3;i++)k.fill(rect(.75+i*.5,1.55,.3,.25),INK.blue);k.fill(rect(0,2.3,4.5,.6),'#9dbd78');}},
   {key:K+'s-bdR',w:4.5,h:2.9,paint:k=>{wash(k,4.5,2.9,INK.sky2,INK.sky,y=>.7-y/2.9*.7);hills(k,4.5,2.9,1.8,INK.leaf);const st=rect(1.2,1.5,2.4,.6);k.fill(st,'#f1e3c6');k.key(st,.012);k.fill(poly([[1.1,1.52],[3.7,1.52],[3.5,1.3],[1.3,1.3]]),INK.blue);
    for(let i=0;i<10;i++)k.circle(1.35+i*.23,1.8,.05,[INK.blue,INK.white,INK.pink][i%3]);lightRig(k,.6,.8);lightRig(k,4.0,.8);k.fill(rect(0,2.3,4.5,.6),INK.grass);}},-3.05,1.22);
  const grey=bd.add(rainCloud('s-grey',.9,.5),'L',1.7,2.1,{out:.03}),sun=bd.add(S.sun(K+'s-sun',.32),'R',3.6,2.1,{out:.012}),birds=bd.add(S.birds(K+'s-birds',.8,.3),'R',1.8,2.3,{out:.02});
  const tally=B.stand(S.scoreboard(K+'s-tally',1.5,1.25,'TRAININGS'),-4.15,-.75,{layer:2});
  const ticks=['1','2','3'].map((l,i)=>{const q=tally.add(S.flipCard(K+`s-t${l}`,.36,.4,l,[INK.pink,INK.orange,INK.yellow][i],INK.navy),-.45+i*.45,.45,{z:.015});q.scale=0;return q;});
  B.stand(S.goal(K+'s-goalL',1.4,.75),-1.6,-1.95,{layer:1});
  const boys=[[-2.9,-.6],[-1.9,.3],[-3.5,1.05]].map(([x,z],i)=>B.person(K+`s-boy${i}`,x,z,1.3,{shirt:'bib',hair:(['short','cap','curly'] as const)[i],skin:SKINS[(i+1)%4],legs:'kick',face:'open',layer:i===0?1:2}));
  const AL=B.person(K+'s-al',-1.3,1.05,1.0,{shirt:'casual',...ALEXIA,face:'shy',layer:3});
  const lcloud=AL.body.add(rainCloud('s-lcloud',.5,.3),.1,AL.h*1.02,{z:-.02,anchor:'center'});
  const carP=B.stand(car('s-car',1.0,.5,INK.blue),-4.4,2.05,{layer:3,tab:false});B.slot(-4.5,2.05,-.6,2.05);
  const sign=B.stand(S.sign(K+'s-sign',1.2,1.2,'SABADELL'),1.1,-1.75,{layer:1});void sign;
  B.stand(S.goal(K+'s-goal',1.5,.8),4.05,-1.3,{layer:1});
  const mates=[[2.0,-.85,'bun'],[4.45,.45,'short'],[3.4,-1.2,'curly']].map(([x,z,h],i)=>B.person(K+`s-mate${i}`,x as number,z as number,1.34,{shirt:'arg',hair:h as 'bun',skin:SKINS[(i+2)%4],face:'grin',layer:i===2?1:2}));
  const def=[[2.75,.35],[2.75,2.0]].map(([x,z],i)=>B.person(K+`s-def${i}`,x,z,1.3,{shirt:'navy',hair:i?'long':'short',skin:SKINS[i*2],face:'open',layer:3}));
  const A=B.person(K+'s-alexia',1.1,1.15,1.0,{shirt:'arg',...ALEXIA,legs:'kick',face:'smile',layer:3});
  const ruler=B.stand(pole('s-ruler',1.75),.45,1.0,{layer:3,s:0});
  const worried=A.body.add(faceCard('s-worried',.36,'worried',INK.orange),.35,A.h*1.02,{z:-.02,anchor:'center'});
  const band=A.body.add(armband('s-band',.14),.16,A.h*.62,{z:.02,anchor:'center'});
  const cap=B.stand(S.flipCard(K+'s-captain',1.0,.36,'CAPTAIN',INK.yellow,INK.navy),1.2,2.25,{layer:3,s:0});
  const spaceCard=B.stand(S.flipCard(K+'s-space',.8,.36,'SPACE!',INK.yellow,INK.navy),4.3,1.6,{layer:3,s:0});
  const y04=B.stand(S.flipCard(K+'s-2004',.8,.38,'2004',INK.pink),-2.4,2.3,{layer:3,s:0,tab:false});
  const icons=[0,1,2,3].map(i=>B.stand(S.icon(K+`s-ic${i}`,.26,'ball'),-1.7+i*.34,2.35,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'s-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.6):b.t;
   birds.dx=-1*beat(t,0,20);sun.dy=.3*beat(t,0,2);
   boys.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.35,3.2+i*.35);});AL.body.s=beat(t,3.2,4);
   ticks.forEach((q,i)=>{q.scale=beat(t,[4.6,6.4,8.2][i],[5.1,6.9,8.7][i]);q.visible=q.scale>.02;});
   const gl=beat(t,7.2,8)*(1-beat(t,10.6,11.2));lcloud.scale=gl;lcloud.visible=gl>.02;grey.scale=beat(t,6.6,7.6);grey.visible=grey.scale>.02;
   AL.body.yaw=Math.PI*.9*beat(t,9.4,10);AL.body.x=-1.3+.7*beat(t,10,11);AL.body.s=beat(t,3.2,4)*(1-beat(t,10.8,11.4));
   // boys pass among themselves (the ball stays on the left until she moves on)
   A.body.s=beat(t,11,12);mates.forEach((p,i)=>{p.body.s=beat(t,11.6+i*.4,12.4+i*.4);});def.forEach((p,i)=>{p.body.s=beat(t,12.8+i*.3,13.6+i*.3);});
   ruler.s=beat(t,14.6,15.4)*(1-beat(t,20.6,21.2));
   const w=beat(t,20.9,21.6)*(1-beat(t,25.6,26.2));worried.scale=manual?0:w;worried.visible=worried.scale>.02;
   const through=manual?beat(act,.15,.8):beat(t,25.5,27.4);
   let bx:number,bz:number,by=0;
   if(t<11.2&&!manual){[bx,bz]=track(t,[[0,-2.6,-.2],[3.8,-2.6,-.2],[4.8,-1.6,.5],[5.8,-1.6,.5],[6.8,-3.3,1.05],[7.8,-3.3,1.05],[8.8,-2.6,-.2]]);}
   else if(!manual&&t>17.2&&t<21.4){const u=beat(t,17.6,19.4);bx=1.45+1.1*u;bz=1.2-.25*u;by=.5*Math.sin(u*Math.PI)*(1-u*.4);if(t>19.4){bx=2.55-.15*beat(t,19.4,20.4);bz=.95;by=0;}}
   else if(through>0){bx=1.45+2.5*through;bz=1.2;}
   else{bx=1.45;bz=1.2;}
   ball(bx,bz,by,t>2.6||manual);
   A.leg!.rot=-1*Math.max(pulse(t,17.3,17.9),pulse(t,25.2,25.8),manual?pulse(act,0,.2):0);
   boys[0].leg!.rot=-1*pulse(t,3.5,4.1);boys[1].leg!.rot=-1*pulse(t,5.5,6.1);boys[2].leg!.rot=-1*pulse(t,7.5,8.1);
   def[0].body.z=.35+.2*beat(t,27,28);def[1].body.z=2.0-.2*beat(t,27,28);def.forEach(p=>{p.body.yaw=.5*through;});
   spaceCard.s=Math.max(beat(t,27.2,28),manual?beat(act,.75,.95):0);mates[1].armR.rot=.12+2.1*Math.max(pulse(t,26,29.5),manual?beat(act,.8,1):0);
   band.scale=beat(t,29.3,29.9);band.visible=band.scale>.02;cap.s=beat(t,29.6,30.4);
   carP.x=-4.4+3.6*beat(t,32,35.4);carP.dy=.02*Math.abs(Math.sin(t*9))*(t>32&&t<35.4?1:0);
   y04.s=beat(t,35.6,36.3);icons.forEach((q,i)=>{q.s=beat(t,36.2+i*.4,36.6+i*.4);});
   cheer(A,beat(t,38.8,39.4));mates.forEach((p,i)=>{if(i!==1)cheer(p,beat(t,39.2+i*.3,39.8+i*.3));});
   return b.narrated?-.45*beat(t,2.2,3.2)+.45*beat(t,10.4,11.4)+.35*beat(t,14,15)-.35*beat(t,31.4,32.2)+.3*beat(t,38,39):0;
  };
 }};

/* ───────────── 3 · The door that closed (masia) ───────────── */
const masia:SpreadDef={id:'masia',rest:19.6,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-2.6,Z(.2),.8,.8));footprints(k,-2.0,Z(1.0),-.5,Z(.75),7,INK.white);
  k.text('BARCELONA · 2005',-2.5,Z(2.62),.38,INK.blue,{max:4.4});k.text('HER DREAM CLUB',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#93c87a',INK.leaf);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(3.0,Z(.2),.8,.8));
  k.text('ESPANYOL · AGED 12',2.6,Z(2.62),.36,INK.blue,{max:4.4});k.text('A NEW CLUB, THE SAME DREAM',2.6,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.45);hills(k,4.5,3,1.95,'#c9b58a');
    const farm=rect(1.4,1.35,1.5,.9);k.fill(farm,'#f3e2bf');k.dots(farm,INK.orange,.04,.15);k.key(farm,.012);k.fill(poly([[1.3,1.38],[2.15,1.0],[3.0,1.38]]),INK.red);k.key(poly([[1.3,1.38],[2.15,1.0],[3.0,1.38]]),.012);for(let i=0;i<3;i++)k.fill(rect(1.55+i*.45,1.6,.25,.3),INK.blue);
    k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.8,INK.leaf);const st=rect(.9,1.35,3.0,.75);k.fill(st,INK.white);k.dots(st,INK.blue,.04,.3);k.key(st,.012);
    for(let i=0;i<12;i++)k.fill(rect(1.0+i*.24,1.5,.12,.5),i%2?INK.blue:INK.white);lightRig(k,.5,.7);lightRig(k,4.1,.75);k.fill(rect(0,2.4,4.5,.6),'#93c87a');}},-3.05,1.22);
  const stars=bd.add(S.stars(K+'d-stars',2.2,.6,9),'L',.8,2.3,{out:.02}),sun=bd.add(S.sun(K+'d-sun',.36),'R',3.5,2.2,{out:.012});
  const flags=bd.add(S.bunting(K+'d-bunt',3.4,.4,[INK.blue,INK.white,INK.blue,INK.white]),'R',.5,2.55,{out:.02});
  const board=B.stand(S.scoreboard(K+'d-board',1.8,1.45,'GIRLS’ TEAMS'),-2.55,-1.55,{layer:1});
  board.add(lineCard('d-noteam',1.3,.62,['NO TEAM'],INK.grey),0,.36,{z:.012});
  const ageFlap=board.flap(lineCard('d-herage',1.3,.62,['HER AGE'],INK.yellow),-.65,.36,{anchor:'bl',axis:'y',z:.024});
  const trophy=B.stand(S.trophy(K+'d-trophy',.5,.9),-4.3,-.95,{layer:2,s:0});
  const league=B.stand(S.flipCard(K+'d-league',.8,.32,'LEAGUE',INK.pink),-4.3,-.55,{layer:2,s:0});
  const mates=[[-3.5,.2,'bun'],[-1.4,-.45,'short'],[-3.05,1.4,'curly']].map(([x,z,h],i)=>B.person(K+`d-mate${i}`,x as number,z as number,1.2,{shirt:'navy',hair:h as 'bun',skin:SKINS[(i+1)%4],face:'grin',layer:i===1?1:2}));
  const AL=B.person(K+'d-al',-2.3,.75,1.2,{shirt:'navy',...ALEXIA,face:'smile',layer:3});
  const coach=B.person(K+'d-coach',-1.0,1.6,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#e3a47a',face:'smile',layer:3});
  const hope=coach.body.add(S.bubble(K+'d-hope',.55,.46,'star'),.5,coach.h*.95,{z:-.02});
  const frame=B.stand(doorFrame('d-frame',1.0,1.55),.85,-.2,{layer:2});
  const leaf=frame.flap(doorLeaf('d-leaf',.76,1.4),-.38,0,{anchor:'bl',axis:'y',z:.02});
  const A12=B.person(K+'d-a12',1.1,.5,1.2,{shirt:'fan',...ALEXIA,face:'smile',layer:3});
  const A16=B.person(K+'d-a16',2.0,.9,1.42,{shirt:'fan',...ALEXIA,legs:'kick',face:'grin',layer:3});
  const girls=[[2.7,-.55,'bun'],[3.6,.2,'short'],[4.3,-.95,'curly'],[4.5,1.0,'long'],[3.3,1.55,'short']].map(([x,z,h],i)=>B.person(K+`d-girl${i}`,x as number,z as number,1.2,{shirt:'fan',hair:h as 'bun',skin:SKINS[i%4],face:'grin',layer:i===2?1:i<2?2:3}));
  const first=B.stand(S.sign(K+'d-first',1.3,1.3,'AT 16',INK.yellow),2.0,-1.45,{layer:1,s:0});
  const firstCard=first.flap(S.flipCard(K+'d-fcard',1.1,.36,'FIRST TEAM',INK.pink),0,1.3*.56,{z:.03});
  const back=B.stand(leftArrow('d-back',.9,.4),1.3,2.15,{layer:3,s:0});
  const ball=ballPair(B,'d-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   stars.scale=beat(t,2,3);stars.visible=stars.scale>.02;sun.dy=.3*beat(t,0,2);
   AL.body.s=beat(t,2.4,3.4);mates.forEach((p,i)=>{p.body.s=beat(t,6+i*.4,6.8+i*.4);});
   trophy.s=beat(t,8.6,9.6);league.s=beat(t,9.2,9.9);const win=beat(t,9.4,10)*(1-beat(t,11.2,11.8));cheer(AL,win);mates.forEach((p,i)=>cheer(p,win*(i===1?1:.9)));
   ageFlap.flip=-1.5*beat(t,13.6,14.4);
   AL.body.yaw=-.6*beat(t,15.4,16)+.6*beat(t,18,18.6);
   const leave=beat(t,18.2,19.4);AL.body.x=-2.3+1.55*leave;AL.body.z=.75-.25*leave;
   mates.forEach((p,i)=>{p.armR.rot=.12+1.9*beat(t,18.4+i*.2,18.9+i*.2)+.3*wave(t,18.9,21,1.5);});
   const open=manual?beat(act,0,.5):beat(t,20,21.4);leaf.flip=-1.9*open;
   const through=manual?beat(act,.35,.9):beat(t,21,22.6);AL.body.s=beat(t,2.4,3.4)*(1-through);
   A12.body.s=through*(1-beat(t,30.4,31.2));A12.body.x=1.1+.6*through;
   girls.forEach((p,i)=>{p.body.s=beat(t,22.8+i*.7,23.6+i*.7);});
   // two teammates from the old club came too
   mates[0].body.s=beat(t,6,6.8)*(1-beat(t,24.2,25));mates[2].body.s=beat(t,6.8,7.6)*(1-beat(t,25,25.8));
   A16.body.s=beat(t,30.6,31.4);first.s=beat(t,31,31.8);firstCard.flip=-2.9+2.9*beat(t,32,32.8);
   A16.leg!.rot=-1*maxOf([32.6,34].map(a=>pulse(t,a-.3,a+.3)));
   coach.body.s=beat(t,35.6,36.6);hope.scale=beat(t,37,37.6);hope.visible=hope.scale>.02;coach.armR.rot=.12+1.8*beat(t,37.2,37.8);
   back.s=beat(t,38,38.8);back.dx=-.08*wave(t,38.8,47,1.1);
   flags.scale=beat(t,41.8,42.8);flags.visible=flags.scale>.02;cheer(A16,beat(t,42.4,43));girls.forEach((p,i)=>cheer(p,beat(t,42.8+i*.2,43.4+i*.2)*.9));
   let bx=-1.9,bz=.85;if(t>31)[bx,bz]=track(t,[[32.3,2.4,1.0],[33,3.6,.7],[33.7,3.6,.7],[34.4,2.4,1.0]]);
   ball(bx,bz,0,(t>2.6&&t<18.2)||t>31);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,17.6,18.6)+.4*beat(t,22,23)-.4*beat(t,35,36)+.4*beat(t,37.6,38.4)-.4*beat(t,41.5,42.3):0;
  };
 }};

/* ───────────── 4 · Her biggest fan (father) ───────────── */
const father:SpreadDef={id:'father',rest:25.2,
 left:k=>{pitch(k,-5,0,'#8fbf70',INK.leaf);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-1.6,Z(.3),.7,.7));road(k,-5,0,Z(2.05));k.text('MOLLET',-3.45,Z(1.7),.12,INK.navy,{weight:900});k.text('VALENCIA',-.65,Z(1.7),.12,INK.navy,{weight:900});
  k.text('VALENCIA · LEVANTE',-2.5,Z(2.62),.36,INK.blue,{max:4.4});k.text('FAR FROM HOME · AGED 17',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.6,Z(.3),.7,.7));
  k.text('SPAIN · 2012',2.5,Z(2.62),.42,INK.yellow,{max:4.2});k.text('CAPTAIN, LESS THAN A MONTH LATER',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.4);hills(k,4.5,3,1.95,'#c9b58a');roofs(k,.2,2.4,2.4,2);
    const sea=rect(2.5,2.0,2.0,.4);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);k.fill(rect(0,2.4,4.5,.6),'#8fbf70');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.6,2.55,[INK.orange,INK.yellow,INK.red,INK.white,INK.yellow],2);lightRig(k,.7,.8);lightRig(k,3.9,.85);k.fill(rect(0,2.55,4.5,.45),'#3f7f5a');}},-3.05,1.22);
  const rain=bd.add(rainCloud('f-rain',1.4,.75),'L',2.2,2.0,{out:.03}),frameP=bd.add(photoFrame('f-photo',.7,.8),'L',3.6,1.2,{out:.025});
  const dim=bd.add(bigStar('f-dim',.32,false),'R',2.25,2.1,{out:.02}),lit=bd.add(bigStar('f-lit',.32,true),'R',2.25,2.1,{out:.03}),rays=bd.add(glow('f-glow',.6),'R',2.25,1.83,{out:.025});
  const beam=bd.add(S.beam(K+'f-beam',1.0,1.6),'R',2.25,.3,{out:.028});
  const seats=B.stand(bleachers('f-seats',1.9,1.0),-3.4,-1.35,{layer:1});void seats;
  const seat=B.stand(chair('f-chair',.42,.5),-3.35,-.9,{layer:1});void seat;
  const dad=B.person(K+'f-dad',-3.35,-.85,1.45,{shirt:'casual',hair:'short',adult:true,skin:'#e3a47a',beard:true,face:'grin',layer:1});
  const love=dad.body.add(S.bubble(K+'f-love',.5,.42,'heart'),.45,dad.h*.95,{z:-.02});
  B.stand(S.goal(K+'f-goalL',1.3,.7),-1.3,-1.95,{layer:1});
  const carP=B.stand(car('f-car',.95,.48,INK.red),-4.4,2.05,{layer:3,tab:false});B.slot(-4.5,2.05,-.7,2.05);
  const AL=B.person(K+'f-al',-1.9,.7,1.3,{shirt:'navy',...ALEXIA,legs:'kick',face:'smile',layer:2});
  const mate=B.person(K+'f-mate',-4.2,.35,1.25,{shirt:'navy',hair:'bun',skin:SKINS[1],face:'grin',layer:2});
  const think=AL.body.add(S.bubble(K+'f-think',.5,.42,'dots'),-.5,AL.h*.96,{z:-.02});
  const book=B.stand(bookP('f-book',.75,.55),-.75,.2,{layer:2,s:0});
  const A=B.person(K+'f-alexia',1.6,.7,1.34,{shirt:'casual',...ALEXIA,legs:'kick',face:'smile',layer:3});
  const band=A.body.add(armband('f-band',.15),.17,A.h*.62,{z:.02,anchor:'center'});
  const team=[[2.7,-.35,'bun'],[3.6,.4,'short'],[4.4,-.8,'curly'],[4.3,1.4,'long']].map(([x,z,h],i)=>B.person(K+`f-sp${i}`,x as number,z as number,1.28,{shirt:'casual',hair:h as 'bun',skin:SKINS[(i+1)%4],face:'grin',layer:i===2?1:i===3?3:2}));
  const capCard=B.stand(S.flipCard(K+'f-cap',1.0,.36,'CAPTAIN',INK.yellow,INK.navy),2.9,2.05,{layer:3,s:0});
  const hearts=[0,1].map(i=>B.stand(heartP(`f-h${i}`,.3),1.0+i*3.2,1.9,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'f-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.2):b.t;
   AL.body.s=beat(t,1.9,2.9);mate.body.s=beat(t,2.6,3.4);
   // Dad in the stands, then again and again on the road to Valencia.
   const gone=beat(t,20.4,22.6);dad.body.s=beat(t,8.2,9.2)*(1-gone);
   dad.armR.rot=.12+2.2*pulse(t,12.4,14.6);dad.armL.rot=-.12-2.2*pulse(t,12.4,14.6);
   love.scale=beat(t,10.4,11)*(1-beat(t,15,15.6));love.visible=love.scale>.02;
   const trip=(t-8.6)/3.2;carP.x=t<8.6||t>15.4?-4.4:-4.4+3.6*(trip%1<.5?smooth(trip%1*2):smooth(2-trip%1*2));carP.dy=.02*Math.abs(Math.sin(t*9))*(t>8.6&&t<15.4?1:0);
   const th=beat(t,15.5,16.2)*(1-beat(t,19.4,20));think.scale=th;think.visible=th>.02;book.s=beat(t,16,16.8)*(1-beat(t,19.6,20.4));
   rain.scale=beat(t,20.2,21.4)*(1-beat(t,34.2,35.6));rain.visible=rain.scale>.02;rain.dx=.05*wave(t,21,34,.35);
   frameP.scale=beat(t,22.4,23.4);frameP.visible=frameP.scale>.02;
   AL.body.yaw=-.4*beat(t,21,21.8);
   // Light the star.
   const on=manual?beat(act,0,.5):beat(t,25.6,26.6);lit.scale=on;lit.visible=on>.02;dim.visible=on<.98;rays.scale=on;rays.visible=on>.02;
   A.body.s=Math.max(beat(t,24.6,25.4),manual?1:0);A.armR.rot=.12+2.75*Math.max(beat(t,26,26.6)*(1-beat(t,28.6,29.2)),manual?beat(act,.3,.7):0);
   team.forEach((p,i)=>{p.body.s=beat(t,28+i*.4,28.8+i*.4);});band.scale=beat(t,29.2,29.8);band.visible=band.scale>.02;capCard.s=beat(t,30.2,31);
   const bm=Math.max(beat(t,34,35),manual?beat(act,.5,1):0);beam.scale=bm;beam.visible=bm>.02;
   hearts.forEach((h,i)=>{h.s=beat(t,36.2+i*.5,36.8+i*.5);});
   const hug=beat(t,40,40.8);team.forEach((p,i)=>{p.body.x=[2.7,3.6,4.4,4.3][i]-.4*hug;p.armL.rot=-.12-.5*hug;});A.armL.rot=-.12-.5*hug;
   let bx=-1.5,bz=.8,by=0;const juggle=t>34.4&&t<39.4;if(juggle){bx=1.95;bz=.85;by=.35*Math.abs(Math.sin((t-34.4)*3.2));}else if(t>28){bx=1.95;bz=.85;}
   else if(t>3.5&&t<8){[bx,bz]=track(t,[[3.5,-1.5,.8],[4.5,-3.9,.45],[5.8,-3.9,.45],[6.8,-1.5,.8]]);}
   ball(bx,bz,by,t>2.6);AL.leg!.rot=-1*pulse(t,3.3,3.9);A.leg!.rot=juggle?-.7*Math.abs(Math.sin((t-34.4)*3.2+1.2)):0;
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,24.8,25.6)+.3*beat(t,27.6,28.4)-.3*beat(t,39,40):0;
  };
 }};

/* ───────────── 5 · Fingers to the sky (sky) ───────────── */
const sky:SpreadDef={id:'sky',rest:20.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.3)} L-1.6 ${Z(-1.3)} L-1.6 ${Z(-2.1)}`);chalk(k,ell(-2.6,Z(.6),.7,.7));
  k.text('BARCELONA',-2.5,Z(2.62),.44,INK.blue,{max:4.2});k.text('SIGNED ON 10 JULY 2012',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#2a2a5e');k.dots(p,INK.pink,.06,.18);const stage=ell(2.5,Z(-.6),2.1,.8);k.fill(stage,INK.gold,.8);k.dots(stage,INK.orange,.05,.35);k.key(stage,.02,INK.white);
  k.text('BALLON D’OR · 2021',2.5,Z(2.62),.36,INK.yellow,{max:4.4});k.text('FOR HER FATHER, WITH HER TEAM',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.6);crowd(k,4.5,1.3,2.5,[INK.blue,INK.red,INK.yellow,INK.blue,INK.red,INK.white],1);lightRig(k,1.0,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#2a2a5e',INK.pink);for(let i=0;i<5;i++){const c=rect(i*.95,0,.5,3);k.fill(c,INK.red,.85);k.hatch(c,'#9c2f3a',.06,1.5,.01);}k.fill(rect(0,2.4,4.5,.6),INK.gold);k.dots(rect(0,2.4,4.5,.6),INK.orange,.05,.4);}},-3.05,1.22);
  const skyStars=bd.add(S.stars(K+'k-stars',2.4,.7,10),'L',1.0,2.25,{out:.02}),bigS=bd.add(bigStar('k-star',.26,true),'L',3.8,2.2,{out:.03});
  const beams=[bd.add(S.beam(K+'k-beam1',1.1,2.2),'R',1.2,.2,{out:.025}),bd.add(S.beam(K+'k-beam2',1.1,2.2),'R',3.4,.2,{out:.025})];
  const conf=[bd.add(S.confetti(K+'k-cf1',2.2,1.1,1),'R',.4,1.4,{out:.04}),bd.add(S.confetti(K+'k-cf2',2.2,1.1,2),'L',.5,1.4,{out:.04})];
  const doc=B.stand(contract('k-contract',.9,1.1),-4.2,-1.2,{layer:2});
  const date=doc.add(S.flipCard(K+'k-date',.9,.3,'10 JULY',INK.pink),0,1.12,{z:.015});date.scale=0;
  B.stand(S.goal(K+'k-goal',1.9,.95),-2.6,-1.55,{layer:1});
  const keeper=B.person(K+'k-keeper',-2.6,-1.25,1.28,{shirt:'keeper',hair:'bun',skin:SKINS[2],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const cup=B.stand(S.trophy(K+'k-cup',.5,.9),-.8,-1.2,{layer:2,s:0});
  const title=B.stand(S.flipCard(K+'k-title',1.0,.32,'FIRST LEAGUE',INK.yellow,INK.navy),-.8,-.75,{layer:2,s:0});
  const AL=B.person(K+'k-al',-2.2,.75,1.34,{shirt:'navy',...ALEXIA,legs:'kick',face:'smile',layer:3});
  const mateL=B.person(K+'k-mateL',-4.1,.9,1.28,{shirt:'navy',hair:'short',skin:SKINS[3],face:'grin',layer:3});
  const ped=B.stand(S.post(K+'k-ped',.5,.5,INK.white),2.5,-1.1,{layer:1,s:0});const gball=ped.add(S.goldenBall(K+'k-gold',.3),0,.5,{z:.01});
  const A=B.person(K+'k-alexia',1.75,.5,1.34,{shirt:'navy',...ALEXIA,face:'smile',layer:2});
  const board=B.stand(thanksBoard('k-thanks',1.5,1.25),3.85,.25,{layer:2});
  const cover=board.flap(lineCard('k-cover',1.4,.96,['WHO DOES','SHE THANK?'],INK.pink,INK.white),0,1.2,{z:.02});
  const mates=[[2.8,1.55,'bun'],[4.45,1.5,'curly']].map(([x,z,h],i)=>B.person(K+`k-m${i}`,x as number,z as number,1.28,{shirt:'navy',hair:h as 'bun',skin:SKINS[i*2+1],face:'grin',layer:3}));
  const tat=B.stand(tattoo('k-tattoo',1.0),1.0,1.9,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'k-ball',.12);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.0):b.t;
   AL.body.s=beat(t,2.2,3.2);mateL.body.s=beat(t,2.8,3.6);date.scale=beat(t,7.2,8);date.visible=date.scale>.02;AL.armR.rot=.12+1.2*pulse(t,6.4,9.4);
   cup.s=beat(t,11,12);title.s=beat(t,11.6,12.4);cheer(mateL,beat(t,12,12.6)*(1-beat(t,13.6,14.2)));
   // She scores, then points both hands to the sky.
   const [bx,bz,by]=t<14.6?[-1.8,.9,0]:track(t,[[14.6,-1.8,.9,0],[15.6,-2.8,-1.4,.35]]);ball(bx,bz,by,t>2.4&&t<18);
   AL.leg!.rot=-1.1*pulse(t,14.3,14.9);keeper.body.s=beat(t,3,3.8);keeper.body.rot=-.6*pulse(t,15,16.4);keeper.body.dx=.2*pulse(t,15,16.4);
   const point=Math.max(beat(t,16.2,17)*(1-beat(t,21.6,22.4)),0);AL.armL.rot=-.12-2.85*point;AL.armR.rot=Math.max(AL.armR.rot,.12+2.85*point);
   skyStars.scale=beat(t,16.4,17.4);skyStars.visible=skyStars.scale>.02;bigS.scale=beat(t,16.8,17.6);bigS.visible=bigS.scale>.02;bigS.rot=.15*wave(t,17.6,45,.4);
   // The gala.
   A.body.s=Math.max(beat(t,19.4,20),manual?1:0);beams.forEach((q,i)=>{q.scale=beat(t,22.6+i*.3,23.4+i*.3);q.visible=q.scale>.02;});
   ped.s=beat(t,23.2,24.2);A.armR.rot=.12+1.6*beat(t,25,25.6)-1.6*beat(t,28.8,29.4);
   const lift=Math.max(beat(t,29.6,30.6),manual?beat(act,0,.7):0);cover.flip=-2.8*lift;
   mates.forEach((p,i)=>{p.body.s=beat(t,31+i*.4,31.8+i*.4);p.armR.rot=.12+2.1*beat(t,32+i*.3,32.6+i*.3);});
   tat.s=beat(t,33.8,34.8);
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*beat(t,39.8+i*.4,42+i*.4);c.visible=t>39.6;});
   cheer(A,beat(t,40.2,40.8));mates.forEach((p,i)=>{p.armL.rot=-.12-2.2*beat(t,40.4+i*.3,41+i*.3);});
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,19.4,20.2)+.3*beat(t,22.4,23.2)-.3*beat(t,39,40):0;
  };
 }};

/* ───────────── 6 · The long way back (knee) ───────────── */
const ST_X=2.45,ST_W=3.0,ST_H=1.35,ST_Z=.55;
const knee:SpreadDef={id:'knee',rest:20.4,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);for(let i=0;i<5;i++)k.circle(-4.4+i*.5,Z(1.5),.06,INK.orange);
  k.text('5 JULY 2022',-2.5,Z(2.62),.44,INK.navy,{max:4});k.text('THE DAY BEFORE THE EUROPEAN CHAMPIONSHIP',-2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);footprints(k,.4,Z(.55),1.2,Z(.5),4,INK.white);
  k.text('WORLD CUP FINAL · 2023',2.5,Z(2.62),.32,INK.navy,{max:4.4});k.text('SMALL STEPS, ONE AT A TIME',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'n-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.5);hills(k,4.5,3,1.95,'#a9b78a');const hq=rect(.6,1.45,1.8,.8);k.fill(hq,INK.white);k.dots(hq,INK.sky,.04,.2);k.key(hq,.012);for(let i=0;i<4;i++)k.fill(rect(.75+i*.42,1.65,.26,.3),INK.blue);k.fill(rect(0,2.4,4.5,.6),'#9dbd78');}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.3,2.45,[INK.red,INK.yellow,INK.orange,INK.white,INK.red],4);lightRig(k,.8,.35);lightRig(k,3.8,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const rain=bd.add(rainCloud('n-rain',1.5,.8),'L',2.4,1.95,{out:.03}),rainbow=bd.add(S.rainbow(K+'n-rainbow',2.2,1.0),'L',1.2,1.5,{out:.025});
  const ban=bd.add(S.banner(K+'n-ban',2.4,.42,'ELEVEN FOUNDATION',INK.pink),'R',1.3,2.4,{out:.02});
  const fw=[bd.add(S.firework(K+'n-fw1',.42,INK.red),'R',1.2,2.0,{out:.03}),bd.add(S.firework(K+'n-fw2',.38,INK.yellow),'R',3.4,1.9,{out:.03})];
  const cal=B.stand(calendar('n-cal',1.0,1.3),-4.3,-.55,{layer:2});
  const MONTHS=['JUL','AUG','SEP','OCT','NOV','DEC','JAN','FEB','MAR'];
  cal.add(monthCard('n-apr',.8,.8,'APR',INK.grass),0,.3,{z:.012});
  const months=MONTHS.map((m,i)=>cal.flap(monthCard(`n-${m}`,.8,.8,m,[INK.yellow,INK.sky,INK.pink][i%3]),0,1.1,{z:.03-i*.002}));
  B.stand(S.bench(K+'n-bench',1.2,.5),-1.5,-1.6,{layer:1});
  for(const [x,z] of [[-3.4,.2],[-2.2,-.6],[-.9,.4]])B.stand(S.cone(K+`n-cone${x}`,.32),x,z,{layer:2});
  const AL=B.person(K+'n-al',-2.6,.8,1.3,{shirt:'casual',...ALEXIA,legs:'kick',face:'smile',layer:3});
  const sad=B.person(K+'n-sad',-2.4,.8,1.3,{shirt:'casual',...ALEXIA,face:'sad',layer:3});
  const wrap=sad.body.add(bandage('n-bandage',.16,.12),-.08,sad.h*.2,{z:.02,anchor:'center'});
  B.slot(-2.4,1.0,-1.5,-.9);
  const doc=B.person(K+'n-doc',-3.6,.9,1.7,{shirt:'coach',hair:'short',adult:true,skin:SKINS[3],face:'smile',layer:3});
  const hurt=B.stand(heartP('n-heart',.32,INK.sky),-1.0,2.1,{layer:3,s:0,tab:false});
  const steps=B.stand(stairs('n-stairs',ST_W,ST_H,['HEAL','PLAY','FINAL']),ST_X,ST_Z,{layer:2});
  const cup=steps.add(S.trophy(K+'n-cup',.36,.66),ST_W/2-.2,ST_H,{z:.01});cup.scale=0;
  const A=B.person(K+'n-alexia',.8,ST_Z+.3,1.2,{shirt:'casual',...ALEXIA,face:'smile',layer:3});
  const kids=[[1.7,2.0,'bun'],[2.5,2.15,'curly'],[3.3,2.0,'short']].map(([x,z,h],i)=>B.person(K+`n-kid${i}`,x as number,z as number,.95,{shirt:'bib',hair:h as 'bun',skin:SKINS[(i+1)%4],face:'grin',layer:3}));
  const kidHeart=kids[1].body.add(S.bubble(K+'n-kh',.45,.38,'heart'),.35,kids[1].h*.95,{z:-.02});
  const team=[[4.3,-1.0,'bun'],[4.55,.9,'short']].map(([x,z,h],i)=>B.person(K+`n-t${i}`,x as number,z as number,1.28,{shirt:'casual',hair:h as 'bun',skin:SKINS[i*2+1],face:'grin',layer:2}));
  const ball=ballPair(B,'n-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.4):b.t;
   // The injury: she stops; a sad face and a bandage; a helper beside her.
   const hurtT=beat(t,4.4,5.2);AL.body.s=beat(t,1.9,2.8)*(1-hurtT)+beat(t,39,40)*hurtT;sad.body.s=hurtT*(1-beat(t,38.6,39.4));
   AL.leg!.rot=-1*maxOf([2.6,3.6].map(a=>pulse(t,a-.3,a+.3)));wrap.scale=beat(t,5.2,5.8);wrap.visible=wrap.scale>.02;
   doc.body.s=beat(t,7,8)*(1-beat(t,13,14));doc.armL.rot=-.12-1.2*beat(t,8,8.6);
   const toBench=beat(t,12.6,15);sad.body.x=-2.4+.9*toBench;sad.body.z=.8-1.9*toBench;
   months.forEach((m,i)=>{m.flip=-3.2*beat(t,10.9+i*.62,11.4+i*.62);});
   rain.scale=beat(t,17.6,18.6)*(1-beat(t,37.8,39));rain.visible=rain.scale>.02;rain.dx=.05*wave(t,18.6,38,.35);
   hurt.s=beat(t,18.2,19)*(1-beat(t,38,38.8));
   rainbow.scale=beat(t,39.2,40.4);rainbow.visible=rainbow.scale>.02;
   const [bx,bz]=track(t,[[0,-2.1,.9],[2.6,-2.1,.9],[3.5,-1.2,.6],[4.4,-1.35,.62]]);ball(bx,bz,0,t>2.2&&t<12.6);
   // Climb the steps: the reader taps three times, or the narration climbs at each milestone.
   const sw=ST_W/3,sh=ST_H/3,x0=ST_X-ST_W/2;
   const stepN=manual?act*3:beat(t,21.4,22.6)+beat(t,31.6,32.8)+beat(t,34,35.2);
   const n=Math.floor(Math.min(2.999,stepN)),u=stepN-Math.floor(stepN),cur=Math.min(3,stepN);
   const xAt=(s:number)=>s<=0?.8:x0+sw*(s-.5),yAt=(s:number)=>s<=0?0:sh*s;
   const s0=Math.floor(cur),s1=Math.min(3,s0+1),f=cur>=3?0:u;void n;
   A.body.x=xAt(s0)+(xAt(s1)-xAt(s0))*f;A.body.dy=yAt(s0)+(yAt(s1)-yAt(s0))*f+.25*Math.sin(f*Math.PI);
   A.body.s=Math.max(beat(t,19.4,20.2),manual?1:0);
   kids.forEach((p,i)=>{p.body.s=beat(t,24.4+i*.5,25.2+i*.5);});kidHeart.scale=beat(t,27.5,28.2);kidHeart.visible=kidHeart.scale>.02;
   ban.scale=beat(t,26.2,27.2);ban.visible=ban.scale>.02;
   const top=Math.max(beat(t,35.2,36),manual?beat(act,.9,1):0);cup.scale=top;cup.visible=top>.02;
   team.forEach((p,i)=>{p.body.s=beat(t,32.4+i*.4,33.2+i*.4);cheer(p,beat(t,35.6+i*.3,36.2+i*.3));});
   cheer(A,Math.max(beat(t,36,36.6),manual?beat(act,.92,1):0));kids.forEach((p,i)=>cheer(p,beat(t,39.6+i*.3,40.2+i*.3)*.9));
   fw.forEach((q,i)=>{q.scale=Math.max(beat(t,35.4+i*.5,36.4+i*.5),manual?beat(act,.92,1):0);q.visible=q.scale>.02;q.rot=t*.2;});
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,20,21)+.35*beat(t,23.4,24.2)-.35*beat(t,38,39):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={mollet,sabadell,masia,father,sky,knee};
void pulse;void clamp01;void TAU;
