/**
 * The six Lucy Bronze pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/bronze/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a closed barrier, a long road, a door to help, a leg brace, a plan.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='bronze-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const LUCY={skin:'#e8b48c',hair:'curly' as const,hairColor:'#3b2a22'};
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
const car=(key:string,w:number,h:number,color:string)=>sp(key,w,h,k=>{const b=`M0 ${h*.8} L0 ${h*.46} L${w*.2} ${h*.4} L${w*.32} ${h*.08} L${w*.7} ${h*.08} L${w*.84} ${h*.4} L${w} ${h*.48} L${w} ${h*.8} Z`;k.fill(b,color);k.dots(b,INK.navy,.035,.2);k.key(b,.013);
 k.fill(poly([[w*.36,h*.16],[w*.5,h*.16],[w*.5,h*.4],[w*.27,h*.4]]),INK.sky);k.fill(poly([[w*.54,h*.16],[w*.67,h*.16],[w*.78,h*.4],[w*.54,h*.4]]),INK.sky);k.key(`M${w*.52} ${h*.1} L${w*.52} ${h*.78}`,.01);
 for(const x of [w*.22,w*.78]){k.fill(ell(x,h*.8,h*.19,h*.19),INK.navy);k.circle(x,h*.8,h*.07,INK.grey);}k.fill(rect(w*.93,h*.52,w*.07,h*.08),INK.yellow);},{rim:.02});
const pole=(key:string,h:number)=>sp(key,.1,h,k=>{const p=rect(0,0,.1,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.2)k.fill(rect(0,y,.1,.1),INK.pink);k.key(p,.008);for(let y=.1;y<h;y+=.1)k.key(`M0 ${y} L.04 ${y}`,.006);},{rim:.015});
const doorFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=`M0 ${h} L0 ${h*.12} Q${w/2} ${-h*.06} ${w} ${h*.12} L${w} ${h} L${w-.12} ${h} L${w-.12} ${h*.18} Q${w/2} ${h*.04} .12 ${h*.18} L.12 ${h} Z`;k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.3);k.key(f,.013);
 const inside=`M.12 ${h} L.12 ${h*.18} Q${w/2} ${h*.04} ${w-.12} ${h*.18} L${w-.12} ${h} Z`;k.fill(inside,INK.yellow);k.dots(inside,INK.orange,.04,(x,y)=>.2+y/h*.3);});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.navy);k.dots(d,INK.blue,.04,.3);k.key(d,.012,'#101a36');for(let i=0;i<2;i++)k.key(rect(w*.15,h*(.1+i*.45),w*.7,h*.35),.012,INK.sky);k.circle(w*.84,h*.55,.03,INK.gold);},{rim:.012});
const chair=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const back=rect(w*.1,0,w*.8,h*.5);k.fill(back,INK.blue);k.dots(back,INK.navy,.03,.3);k.key(back,.012);const seat=rect(0,h*.5,w,h*.14);k.fill(seat,INK.sky);k.key(seat,.012);k.keyFill(rect(w*.08,h*.64,w*.1,h*.36),INK.navy);k.keyFill(rect(w*.82,h*.64,w*.1,h*.36),INK.navy);});
const photoFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.gold);k.key(f,.014);const p=rect(w*.12,h*.1,w*.76,h*.8);k.fill(p,INK.sky2);k.dots(p,INK.sky,.03,.4);
 k.fill(ell(w/2,h*.4,w*.13,w*.13),INK.navy);k.fill(`M${w*.26} ${h*.9} Q${w*.3} ${h*.58} ${w/2} ${h*.58} Q${w*.7} ${h*.58} ${w*.74} ${h*.9} Z`,INK.navy);
 const c=w*.78,y=h*.2,s=w*.1;k.fill(`M${c} ${y+s} C${c-s*1.2} ${y} ${c-s*.4} ${y-s*.8} ${c} ${y-s*.1} C${c+s*.4} ${y-s*.8} ${c+s*1.2} ${y} ${c} ${y+s} Z`,INK.pink);},{rim:.02});
const calendar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.14),INK.red);for(let i=0;i<4;i++)k.circle(w*(.2+i*.2),h*.07,.03,INK.white,true);});
const monthCard=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.key(b,.012);k.text(label,w/2,h*.4,h*.28,INK.navy,{weight:900,max:w*.8});for(let r=0;r<3;r++)for(let c=0;c<5;c++)k.circle(w*(.14+c*.18),h*(.58+r*.13),.018,INK.navy);},{rim:.012});
const bandage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f6d8b8');k.key(b,.01);k.fill(rect(w*.35,0,w*.3,h),'#ecc39c');for(let i=0;i<3;i++)for(let j=0;j<2;j++)k.circle(w*(.42+i*.08),h*(.35+j*.3),.008,INK.brown);},{rim:.012});

/** Two ball cut-outs (one per page) share one trajectory so a pass can cross the gutter. */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
const cheer=(p:{armL:{rot:number};armR:{rot:number}},v:number,extra=0)=>{p.armL.rot=-.12-2.3*v-extra;p.armR.rot=.12+2.3*v+extra;};


/* ───────────── Bronze-only plates ───────────── */
const medal=(key:string,s:number,gold:boolean)=>sp(key,s,s*1.3,k=>{k.fill(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),gold?INK.blue:INK.grey);k.key(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),.008);const c=ell(s/2,s*.85,s*.4,s*.4);k.fill(c,gold?INK.gold:'#c9c4b6');k.dots(c,gold?INK.orange:INK.grey,.025,.35);k.key(c,.01);if(gold)k.fill(starShape(0,s*.2,s*.08).replace(/-?\d*\.?\d+ -?\d*\.?\d+/g,m=>{const [x,y]=m.split(' ').map(Number);return `${x+s/2} ${y+s*.85}`;}),INK.white);},{rim:.012});
const letterBase=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.03,.12);k.key(b,.013);lines.forEach((l,i)=>k.text(l,w/2,h*(.38+i*.26),h*.17,INK.navy,{weight:900,max:w*.86}));
 for(let i=0;i<3;i++){const x=w*(.25+i*.25);k.fill(ell(x,h*.84,.04,.04),SKINS[i]);k.fill(rect(x-.04,h*.87,.08,.08),INK.pink);}});
const envelopeFlap=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#e9d7b0');k.dots(b,INK.orange,.035,.15);k.key(b,.013);k.key(`M0 0 L${w/2} ${h*.55} L${w} 0`,.014,INK.brown);k.fill(ell(w/2,h*.55,.07,.07),INK.red);k.key(ell(w/2,h*.55,.07,.07),.008);},{rim:.015});
const barrier=(key:string,len:number)=>sp(key,.12,len,k=>{const p=rect(0,0,.12,len);k.fill(p,INK.white);for(let y=.05;y<len;y+=.24)k.fill(rect(0,y,.12,.12),INK.red);k.key(p,.01);},{rim:.012,grain:.5});
const clockFace=(key:string,r:number)=>sp(key,r*2,r*2.4,k=>{k.keyFill(rect(r*.9,r*2,r*.2,r*.4),INK.brown);const c=ell(r,r,r*.95,r*.95);k.fill(c,INK.white);k.key(c,.016);for(let i=0;i<12;i++){const a=i/12*TAU;k.key(`M${r+Math.cos(a)*r*.75} ${r+Math.sin(a)*r*.75} L${r+Math.cos(a)*r*.88} ${r+Math.sin(a)*r*.88}`,.014);}k.circle(r,r,.03,INK.navy,true);});
const hand=(key:string,len:number)=>sp(key,.05,len,k=>{k.fill(rect(0,0,.05,len),INK.pink);k.key(rect(0,0,.05,len),.006);},{rim:.006,grain:.4});
const bus=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,h*.05,w,h*.75);k.fill(b,INK.blue);k.dots(b,INK.navy,.035,.25);k.key(b,.014);for(let i=0;i<5;i++)k.fill(rect(w*(.06+i*.18),h*.15,w*.13,h*.25),INK.sky);k.fill(rect(0,h*.5,w,h*.1),INK.white);k.text(label,w/2,h*.59,h*.09,INK.navy,{weight:900,max:w*.8});for(const x of [w*.2,w*.8]){k.fill(ell(x,h*.82,h*.14,h*.14),INK.navy);k.circle(x,h*.82,h*.05,INK.grey);}},{rim:.02});
const pizzaShop=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.18,w,h*.82);k.fill(b,'#f1dcc0');k.dots(b,INK.orange,.04,.15);k.key(b,.014);const sign=rect(-.02,0,w+.04,h*.22);k.fill(sign,INK.red);k.key(sign,.012);k.text('PIZZA',w/2,h*.16,h*.13,INK.white,{weight:900});
 for(let i=0;i<6;i++)k.fill(poly([[w*i/6,h*.22],[w*(i+1)/6,h*.22],[w*(i+.5)/6,h*.34]]),i%2?INK.white:INK.red);const win=rect(w*.08,h*.42,w*.5,h*.34);k.fill(win,INK.sky);k.key(win,.012);k.fill(ell(w*.33,h*.62,w*.13,w*.08),INK.orange);k.dots(ell(w*.33,h*.62,w*.13,w*.08),INK.red,.03,.5);const d=rect(w*.66,h*.46,w*.24,h*.54);k.fill(d,INK.navy);k.key(d,.012);});
const planBoard=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.82,w*.08,h*.18),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(w*.35,-.02,w*.3,h*.07),INK.grey);k.text('MY PLAN',w/2,h*.17,h*.1,INK.pink,{weight:900});
 lines.forEach((l,i)=>{const y=h*(.3+i*.17);k.key(rect(w*.08,y,h*.1,h*.1),.012);k.text(l,w*.6,y+h*.085,h*.08,INK.navy,{weight:800,max:w*.65});});});
const tick=(key:string,s:number)=>sp(key,s,s,k=>{k.key(`M${s*.1} ${s*.55} L${s*.4} ${s*.85} L${s*.95} ${s*.12}`,s*.18,INK.grass);},{rim:.01});
const flagCloth=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,0],[w,h*.08],[w*.94,h*.5],[w,h*.92],[0,h]]);k.fill(p,INK.white);k.fill(rect(0,h*.4,w*.97,h*.2),INK.red);k.fill(rect(w*.4,0,w*.2,h),INK.red);k.dots(p,INK.navy,.03,.12);k.key(p,.012);},{rim:.015});
const bookStack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.blue,INK.yellow,INK.pink,INK.green];for(let i=0;i<4;i++){const r=rect(w*(.04+(i%2)*.05),h-(i+1)*h*.24,w*.88,h*.22);k.fill(r,cs[i]);k.key(r,.01);}k.text('SPORTS SCIENCE',w/2,h*.2,h*.11,INK.navy,{weight:900,max:w*.8});},{rim:.015});
const building=(key:string,w:number,h:number,label:string,wall:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,wall);k.dots(b,INK.navy,.045,.12);k.key(b,.014);const roof=poly([[-.04,h*.22],[w/2,0],[w+.04,h*.22]]);k.fill(roof,INK.grey);k.key(roof,.012);for(let i=0;i<4;i++)k.fill(rect(w*(.08+i*.24),h*.34,w*.12,h*.36),INK.white);k.fill(rect(w*.1,h*.78,w*.8,h*.12),INK.white);k.text(label,w/2,h*.87,h*.08,INK.navy,{weight:900,max:w*.76});});
const castle=(k:Kit,x:number,y:number)=>{const hill=`M${x-.6} ${y} Q${x} ${y-.55} ${x+.6} ${y} Z`;k.fill(hill,'#8fae78');k.key(hill,.01);const c=rect(x-.28,y-.75,.56,.4);k.fill(c,'#d9cbb0');k.key(c,.01);for(let i=0;i<4;i++)k.fill(rect(x-.28+i*.16,y-.82,.08,.08),'#d9cbb0');k.fill(rect(x-.05,y-.55,.1,.2),INK.navy);};
function carPair(B:Builder,key:string,color:string){const L=B.stand(car(key,.9,.45,color),-1,1,{layer:3,tab:false}),R=B.stand(car(key,.9,.45,color),1,1,{layer:3,tab:false});
 return (x:number,z:number,vis=true,flip=false)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;void flip;p.dy=.015*Math.abs(Math.sin(x*9));}}};}

/* ───────────── 1 · The rule that stopped her (alnwick) ───────────── */
const alnwick:SpreadDef={id:'alnwick',rest:20.0,
 left:k=>{pitch(k,-5,0,'#a7c47f',INK.leaf,.8);const sand=`M-5 ${Z(1.6)} Q-2.5 ${Z(1.3)} 0 ${Z(1.7)} L0 ${PAGE_D} L-5 ${PAGE_D} Z`;k.fill(sand,INK.sand);k.dots(sand,INK.orange,.05,.2);footprints(k,-4.2,Z(.9),-1.2,Z(.7),8,INK.white);
  k.text('NORTH OF ENGLAND',-2.5,Z(2.62),.38,INK.blue,{max:4.4});k.text('BORN 1991 · A PORTUGUESE DAD, AN ENGLISH MUM',-2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.4,Z(0),.7,.7));
  k.text('ALNWICK TOWN',2.5,Z(2.62),.42,INK.pink,{max:4.2});k.text('THE BOYS’ TEAM, UNTIL SHE TURNED TWELVE',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.6);const sea=rect(0,1.75,4.5,.7);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);for(let i=0;i<6;i++)k.key(`M${.4+i*.7} ${1.95+(i%2)*.2} l.25 0`,.012,INK.white);castle(k,1.4,1.85);
    k.fill(rect(0,2.45,4.5,.55),'#a7c47f');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.85,INK.leaf);roofs(k,1.6,4.4,2.35,2);const cl=rect(.3,1.6,1.1,.6);k.fill(cl,'#f1e3c6');k.key(cl,.012);k.fill(rect(.25,1.52,1.2,.1),INK.red);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'a-sun',.34),'L',3.4,2.2,{out:.012}),birds=bd.add(S.birds(K+'a-birds',.8,.3),'R',2.4,2.4,{out:.02}),cloud=bd.add(rainCloud('a-cloud',1.1,.6),'R',2.6,2.0,{out:.03});
  const sign=B.stand(S.sign(K+'a-sign',1.0,1.2,'BORN'),-4.2,-1.2,{layer:2});const y91=sign.flap(S.flipCard(K+'a-1991',.8,.36,'1991',INK.pink),0,1.2*.56,{z:.03});
  const dad=B.person(K+'a-dad',-3.2,-.55,1.72,{shirt:'casual',hair:'short',hairColor:'#2c2420',adult:true,skin:'#c98b62',face:'smile',layer:2});
  const mum=B.person(K+'a-mum',-2.3,-.75,1.66,{shirt:'coach',hair:'long',hairColor:'#b98a4e',adult:true,skin:'#f1c6a0',face:'smile',layer:2});
  const pt=dad.body.add(S.flipCard(K+'a-pt',.78,.26,'PORTUGAL',INK.green),0,dad.h*1.04,{z:-.02,anchor:'bottom'}),en=mum.body.add(S.flipCard(K+'a-en',.72,.26,'ENGLAND',INK.red),0,mum.h*1.04,{z:-.02,anchor:'bottom'});
  const bro=B.person(K+'a-bro',-3.9,.7,1.22,{shirt:'bib',hair:'short',hairColor:'#2c2420',skin:'#e0a57e',legs:'kick',face:'grin',layer:3});
  const pal=B.person(K+'a-pal',-.9,.2,1.18,{shirt:'casual',hair:'curly',skin:SKINS[3],face:'grin',layer:2});
  const LL=B.person(K+'a-lucyL',-2.4,.95,1.0,{shirt:'fan',...LUCY,legs:'kick',face:'smile',layer:3});
  B.stand(S.goal(K+'a-goal',1.5,.8),4.1,-1.75,{layer:1});
  const boys=[[2.0,-.9,'short'],[3.1,-.3,'cap'],[4.4,.35,'curly'],[3.7,1.35,'short']].map(([x,z,h],i)=>B.person(K+`a-boy${i}`,x as number,z as number,1.2,{shirt:'bib',hair:h as 'short',skin:SKINS[(i+1)%4],face:'grin',layer:i===0?1:i===3?3:2}));
  const L=B.person(K+'a-lucy',1.5,.6,1.1,{shirt:'bib',...LUCY,legs:'kick',face:'smile',layer:3});
  const Ls=B.person(K+'a-lucysad',1.1,.95,1.1,{shirt:'bib',...LUCY,face:'sad',layer:3});
  const medals=Array.from({length:8},(_,i)=>B.stand(medal(`a-m${i}`,.24,i!==2&&i!==5),.55+i*.34,1.95,{layer:3,s:0,tab:false}));
  const post=B.stand(S.post(K+'a-post',.16,.55,INK.white),.55,-.15,{layer:2});const bar=post.arm(barrier('a-bar',2.0),0,.46,{z:.02});bar.rot=Math.PI;
  const rule=B.stand(S.sign(K+'a-rule',.9,1.2,'AGE 12',INK.yellow),.55,-1.2,{layer:1,s:0});
  const coach=B.person(K+'a-coach',2.5,1.45,1.72,{shirt:'coach',hair:'cap',adult:true,skin:'#e3a47a',face:'open',layer:3});
  const talk=coach.body.add(S.bubble(K+'a-talk',.55,.46,'dots'),.5,coach.h*.95,{z:-.02});
  const letter=B.stand(letterBase('a-letter',1.2,.85,['MORE GIRLS’','TEAMS']),4.1,1.75,{layer:3});
  const env=letter.flap(envelopeFlap('a-env',1.2,.85),0,.85,{z:.02});
  const girls=[[3.0,2.25],[3.5,2.35],[4.6,2.3]].map(([x,z],i)=>B.person(K+`a-girl${i}`,x,z,.8,{shirt:'fan',hair:(['bun','long','short'] as const)[i],skin:SKINS[i],face:'grin',layer:3}));
  const ball=ballPair(B,'a-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.0):b.t;
   sun.dy=.3*beat(t,0,2);birds.dx=-1*beat(t,0,25);y91.flip=-2.9+2.9*beat(t,2.4,3.2);
   dad.body.s=beat(t,3.4,4.4);mum.body.s=beat(t,4,5);pt.scale=beat(t,5.4,6);en.scale=beat(t,6.2,6.8);pt.visible=pt.scale>.02;en.visible=en.scale>.02;
   LL.body.s=beat(t,8.6,9.4)*(1-beat(t,14.6,15.4));bro.body.s=beat(t,9.8,10.6);pal.body.s=beat(t,10.4,11.2);
   L.body.s=Math.max(beat(t,14,15),manual?1:0)*(1-beat(t,23.6,24.2));boys.forEach((p,i)=>{p.body.s=beat(t,13.6+i*.3,14.4+i*.3);});
   medals.forEach((m,i)=>{m.s=beat(t,16.8+i*.3,17.2+i*.3);});
   // The rule: the barrier swings down and a sign rises; Lucy has to step away.
   const down=beat(t,22.4,23.4);bar.rot=Math.PI-Math.PI/2*down;rule.s=beat(t,22.2,23);
   Ls.body.s=beat(t,23.6,24.2);Ls.body.x=1.1-.35*beat(t,24.2,25.6);boys.forEach(p=>{p.body.yaw=.5*beat(t,24,24.8);});
   cloud.scale=beat(t,23,24)*(1-beat(t,31.5,33));cloud.visible=cloud.scale>.02;
   coach.body.s=beat(t,27.6,28.6);talk.scale=beat(t,28.6,29.2)*(1-beat(t,31,31.6));talk.visible=talk.scale>.02;coach.armR.rot=.12+1.8*beat(t,28.4,29)-1.8*beat(t,31,31.6);
   const open=manual?beat(act,0,.7):beat(t,31.6,32.6);env.flip=-3.0*open;
   girls.forEach((p,i)=>{p.body.s=Math.max(beat(t,33.4+i*.5,34.2+i*.5),manual?beat(act,.5+i*.15,.7+i*.15):0);});
   cheer(Ls,beat(t,38.4,39));girls.forEach((p,i)=>cheer(p,beat(t,38.8+i*.3,39.4+i*.3)));
   let bx=-2.0,bz=1.0,by=0;
   if(t>9.6&&t<14.6)[bx,bz]=track(t,[[9.8,-2.0,1.0],[10.8,-3.5,.8],[11.6,-3.5,.8],[12.6,-1.2,.35],[13.4,-1.2,.35],[14.4,-2.0,1.0]]);
   else if(t>=14.6){bx=L.body.x+.35;bz=L.body.z+.1;if(t>16.8&&t<20)[bx,bz]=track(t,[[16.8,1.85,.7],[17.8,3.9,-1.4],[19.8,1.85,.7]]);}
   ball(bx,bz,by,t>8.8&&t<23.6);L.leg!.rot=-1*pulse(t,16.5,17.1);LL.leg!.rot=-1*pulse(t,12.4,13);bro.leg!.rot=-1*pulse(t,10.5,11.1);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,13.4,14.2)+.35*beat(t,22,22.8)-.35*beat(t,37,38):0;
  };
 }};

/* ───────────── 2 · The long road (sunderland) ───────────── */
const RZ=1.75;
const sunderland:SpreadDef={id:'sunderland',rest:17.6,
 left:k=>{pitch(k,-5,0,'#a7c47f',INK.leaf,.75);road(k,-5,0,Z(RZ));k.text('HOME',-4.3,Z(RZ+.42),.14,INK.navy,{weight:900});
  k.text('HOURS ON THE ROAD',-2.5,Z(2.62),.36,INK.blue,{max:4.4});k.text('SCHOOL, TRAINING, NOTHING ELSE',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);road(k,0,5,Z(RZ));chalk(k,`M.4 ${Z(-2.1)} L5 ${Z(-2.1)}`);k.text('SUNDERLAND',4.1,Z(RZ+.42),.14,INK.navy,{weight:900});
  k.text('SUNDERLAND',2.5,Z(2.62),.44,INK.pink,{max:4.2});k.text('THE NEAREST GIRLS’ TEAM',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'u-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.4);hills(k,4.5,3,1.9,'#b9c98a',INK.green);roofs(k,.2,2.2,2.4,3);k.fill(rect(0,2.4,4.5,.6),'#a7c47f');}},
   {key:K+'u-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.8,INK.leaf);const st=rect(1.6,1.45,2.3,.7);k.fill(st,'#f1e3c6');k.key(st,.012);k.fill(poly([[1.5,1.47],[4.0,1.47],[3.8,1.25],[1.7,1.25]]),INK.red);lightRig(k,1.0,.75);lightRig(k,4.2,.8);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'u-sun',.34),'L',2.4,2.1,{out:.012}),moon=bd.add(S.sun(K+'u-moon',.26,INK.white),'L',1.2,2.3,{out:.012});
  const planeP=bd.add(S.plane(K+'u-plane',.7,.35),'R',.6,2.45,{out:.03}),camp=bd.add(S.banner(K+'u-camp',2.4,.4,'SUMMER CAMPS IN AMERICA',INK.blue),'R',1.6,2.2,{out:.02});
  B.stand(S.house(K+'u-home',1.2,1.3),-4.1,-1.3,{layer:1});B.stand(S.tree(K+'u-tree',.9,1.4,'round'),-2.9,-1.9,{layer:1});
  const clock=B.stand(clockFace('u-clock',.36),-1.3,-1.55,{layer:1});const hh=clock.arm(hand('u-hh',.22),0,.36*1.4,{z:.02}),mh=clock.arm(hand('u-mh',.3),0,.36*1.4,{z:.024});
  const books=B.stand(bookStack('u-books',.7,.5),-2.0,-.5,{layer:2,s:0});void books;
  const mum=B.person(K+'u-mum',-3.3,.35,1.66,{shirt:'coach',hair:'long',hairColor:'#b98a4e',adult:true,skin:'#f1c6a0',face:'smile',layer:2});
  const L=B.person(K+'u-lucy',-2.7,.6,1.05,{shirt:'fan',...LUCY,face:'shy',layer:3});
  const quiet=L.body.add(S.bubble(K+'u-quiet',.45,.38,'dots'),.35,L.h*.95,{z:-.02});
  const tired=L.body.add(faceCard('u-tired',.34,'worried',INK.orange),.34,L.h*1.02,{z:-.02,anchor:'center'});
  const find=mum.body.add(S.bubble(K+'u-find',.5,.42,'star'),-.5,mum.h*.95,{z:-.02});
  const blyth=B.stand(S.sign(K+'u-blyth',1.2,1.15,'BLYTH TOWN',INK.yellow),-1.5,.05,{layer:2,s:0});
  const LB=B.person(K+'u-lucyB',-.55,.8,1.12,{shirt:'fan',...LUCY,legs:'kick',face:'grin',layer:3});
  const far=B.stand(S.flipCard(K+'u-far',1.1,.34,'HOURS AWAY',INK.pink),1.0,.8,{layer:2,s:0});
  B.stand(S.goal(K+'u-goal',1.5,.8),3.9,-1.8,{layer:1});
  const team=[[2.1,-.9,'bun'],[3.0,-.2,'short'],[4.3,-.6,'curly'],[3.8,.7,'long']].map(([x,z,h],i)=>B.person(K+`u-g${i}`,x as number,z as number,1.24,{shirt:'casual',hair:h as 'bun',skin:SKINS[(i+2)%4],face:'grin',layer:i===0?1:2}));
  const LS=B.person(K+'u-lucyS',1.7,.45,1.12,{shirt:'casual',...LUCY,face:'shy',layer:3});
  const tags=[['AUTISM',INK.sky],['ADHD',INK.yellow],['DYSLEXIA',INK.pink]].map(([l,c],i)=>B.stand(S.flipCard(K+`u-tag${i}`,.9,.32,l,c,INK.navy),-4.2+i*1.0,1.2,{layer:3,s:0,tab:false}));
  const car=carPair(B,'u-car',INK.red);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.6):b.t;
   mum.body.s=beat(t,1.6,2.4);L.body.s=beat(t,2,2.8)*(1-beat(t,26.8,27.6));L.body.x=-2.7-.15*beat(t,3,4);
   const q=beat(t,3.6,4.2)*(1-beat(t,6.4,7));quiet.scale=q;quiet.visible=q>.02;
   team.forEach((p,i)=>{p.body.s=beat(t,6.6+i*.35,7.4+i*.35);});LS.body.s=beat(t,8,8.8);far.s=beat(t,8.6,9.4)*(1-beat(t,16.8,17.4));
   books.s=beat(t,11.2,12);const spin=t<11.2?0:(Math.min(t,17.4)-11.2)*2.2;mh.rot=Math.PI+spin*6;hh.rot=Math.PI+.6+spin*.5;
   const night=pulse(t,12,17);sun.dy=-.9*night;moon.scale=night;moon.visible=night>.05;
   const tr=beat(t,14.2,14.8)*(1-beat(t,19.6,20.2));tired.scale=manual?0:tr;tired.visible=tired.scale>.02;
   // The long drive: home → Sunderland (and back), narrated and on tap.
   let cx=-4.2,flip=false;
   if(manual)cx=-4.2+8.3*beat(act,0,.95);
   else if(t>6.8&&t<17.2){const u=((t-6.8)/5.2)%1;cx=u<.5?-4.2+8.3*smooth(u*2):4.1-8.3*smooth((u-.5)*2);flip=u>=.5;}
   else if(t>=17.2)cx=-4.2+8.3*beat(t,17.8,20.2);
   car(cx,RZ,true,flip);
   find.scale=beat(t,20.6,21.2)*(1-beat(t,25.8,26.4));find.visible=find.scale>.02;mum.armR.rot=.12+1.8*beat(t,21.4,22)-1.8*beat(t,26,26.6);
   planeP.dx=1.1*beat(t,22.4,25.4);planeP.dy=.12*wave(t,22.4,26,.8);planeP.visible=t>22.2;camp.scale=beat(t,23,24);camp.visible=camp.scale>.02;
   blyth.s=beat(t,26.8,27.6);LB.body.s=beat(t,27.2,28);
   tags.forEach((q,i)=>{q.s=beat(t,31.6+i*.8,32.2+i*.8);});
   cheer(LB,beat(t,36.8,37.4));cheer(LS,beat(t,37.2,37.8));team.forEach((p,i)=>cheer(p,beat(t,37.4+i*.2,38+i*.2)*.9));
   return b.narrated?-.4*beat(t,1.4,2.4)+.4*beat(t,6.2,7)+.3*beat(t,21,22)-.3*beat(t,25.8,26.6)-.35*beat(t,31,31.8)+.35*beat(t,36.4,37.2):0;
  };
 }};

/* ───────────── 3 · Missing a friend (friend) ───────────── */
const friend:SpreadDef={id:'friend',rest:16.7,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-2.5,Z(.2),.7,.7));
  k.text('EUROPEAN CHAMPIONS',-2.5,Z(2.62),.34,INK.blue,{max:4.4});k.text('ENGLAND UNDER-19s · 2009',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{paving(k,0,5,'#e6dcc6');const tr=rect(.2,Z(.9),4.6,.9);k.fill(tr,'#e0876a');k.dots(tr,INK.red,.05,.25);for(let i=0;i<3;i++)chalk(k,`M.2 ${Z(.9)+i*.3} L4.8 ${Z(.9)+i*.3}`,.02);
  k.text('ASKING FOR HELP',2.5,Z(2.62),.38,INK.pink,{max:4.4});k.text('A SPORTS PSYCHOLOGIST HELPS WITH FEELINGS',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.3,2.5,[INK.white,INK.red,INK.white,INK.blue,INK.white],2);lightRig(k,1.0,.35);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9cdd6',INK.navy,y=>.28-y*.05);hills(k,4.5,3,1.9,'#a9b78a');for(let i=0;i<4;i++){const x=.6+i*1.05;k.fill(ell(x,1.7,.3,.45),i%2?INK.green:INK.leaf);k.keyFill(rect(x-.04,2.1,.08,.3),INK.brown);}k.fill(rect(0,2.4,4.5,.6),'#e6dcc6');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'f-ban',2.4,.42,'CHAMPIONS 2009',INK.red),'L',1.1,2.2,{out:.02});
  const conf=bd.add(S.confetti(K+'f-cf',2.4,1.1,1),'L',.6,1.3,{out:.04});
  const rain=bd.add(rainCloud('f-rain',1.3,.7),'R',2.4,1.9,{out:.03}),sun=bd.add(S.sun(K+'f-sun',.36),'R',3.5,2.1,{out:.012});
  const cup=B.stand(S.trophy(K+'f-cup',.55,.95),-2.5,-1.4,{layer:1,s:0});
  const team=[[-4.0,-.4,'bun'],[-1.3,-.6,'short'],[-3.6,1.0,'long'],[-1.0,.9,'curly']].map(([x,z,h],i)=>B.person(K+`f-e${i}`,x as number,z as number,1.24,{shirt:'ger',hair:h as 'bun',skin:SKINS[i%4],face:'grin',layer:i<2?2:3}));
  const L=B.person(K+'f-lucy',-2.4,.35,1.3,{shirt:'ger',...LUCY,face:'smile',layer:2});
  const frame=B.stand(photoFrame('f-photo',.7,.85),1.0,-1.5,{layer:1,s:0});
  const flowers=B.stand(S.bush(K+'f-flowers',.8,.3,INK.pink),1.0,-1.15,{layer:2,s:0,tab:false});
  const Lr=B.person(K+'f-lucyR',1.3,1.05,1.3,{shirt:'casual',...LUCY,face:'sad',layer:3});
  const heavy=Lr.body.add(rainCloud('f-heavy',.55,.32),.05,Lr.h*1.02,{z:-.02,anchor:'center'});
  const Lrun=B.person(K+'f-lucyRun',1.3,1.05,1.3,{shirt:'casual',...LUCY,legs:'run',face:'grin',layer:3});B.slot(1.3,1.35,4.4,1.35);
  const frameD=B.stand(doorFrame('f-frame',1.0,1.55),3.3,-1.2,{layer:1});
  const leaf=frameD.flap(doorLeaf('f-leaf',.76,1.4),-.38,0,{anchor:'bl',axis:'y',z:.02});
  const helper=B.person(K+'f-helper',3.3,-.95,1.66,{shirt:'navy',hair:'bun',hairColor:'#4a3326',adult:true,skin:SKINS[2],face:'smile',layer:2});
  const bench=B.stand(S.bench(K+'f-bench',1.3,.5),2.6,.1,{layer:2});void bench;
  const talkA=helper.body.add(S.bubble(K+'f-ta',.5,.42,'heart'),.45,helper.h*.95,{z:-.02}),talkB=Lr.body.add(S.bubble(K+'f-tb',.5,.42,'dots'),-.5,Lr.h*.95,{z:-.02});
  const hearts=[0,1,2].map(i=>B.stand(heartP(`f-h${i}`,.28),.7+i*1.6,1.95,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.7):b.t;
   L.body.s=beat(t,1.9,2.9);team.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.3,3.2+i*.3);});cup.s=beat(t,4.4,5.4);ban.scale=beat(t,5,6);ban.visible=ban.scale>.02;
   const party=beat(t,5.6,6.4)*(1-beat(t,9.2,10));team.forEach((p,i)=>cheer(p,party));cheer(L,party);conf.dy=-1.1+1.3*beat(t,5.6,7.8);conf.visible=t>5.5&&t<10.2;
   L.body.yaw=.5*beat(t,10,10.8);
   frame.s=beat(t,10.2,11.2);flowers.s=beat(t,11,11.8);
   rain.scale=beat(t,10.6,11.6)*(1-Math.max(beat(t,30,31.4),manual?beat(act,.4,.9):0));rain.visible=rain.scale>.02;rain.dx=.05*wave(t,11.6,30,.35);
   // Open the door: someone who helps.
   const open=manual?beat(act,0,.5):beat(t,17,18.2);leaf.flip=-1.9*open;
   const out=manual?beat(act,.3,.8):beat(t,18,20.4);helper.body.s=out;helper.body.z=-.95+.9*out;helper.body.x=3.3-.2*out;
   const run=beat(t,30.2,33.2);Lr.body.s=beat(t,12.4,13.2)*(1-beat(t,29.8,30.4));Lrun.body.s=beat(t,29.8,30.4);Lrun.body.x=1.3+2.6*run;Lrun.body.dy=.05*Math.abs(Math.sin(t*8))*(t>30.2&&t<33.2?1:0);
   const hv=beat(t,19.4,20)*(1-beat(t,23.6,24.2));heavy.scale=hv;heavy.visible=hv>.02;
   const chat=(t>24&&t<29.6);talkA.scale=chat?pulse((t-24)%2.6,0,1.3):0;talkA.visible=talkA.scale>.02;talkB.scale=chat?pulse((t-24+1.3)%2.6,0,1.3):0;talkB.visible=talkB.scale>.02;
   Lr.body.x=1.3+.5*beat(t,23.8,25);helper.armL.rot=-.12-.8*beat(t,24.2,24.8)+.8*beat(t,29,29.6);
   sun.scale=beat(t,30.6,31.6);sun.visible=sun.scale>.02;
   hearts.forEach((h,i)=>{h.s=beat(t,37.2+i*.5,37.8+i*.5);});cheer(Lrun,beat(t,38,38.6));helper.armR.rot=.12+2*beat(t,38.4,39);
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,9.4,10.4)+.4*beat(t,16.4,17.4)-.4*beat(t,36.4,37.2):0;
  };
 }};

/* ───────────── 4 · Across the ocean (carolina) ───────────── */
const carolina:SpreadDef={id:'carolina',rest:19.5,
 left:k=>{pitch(k,-5,0,'#a7c47f',INK.leaf,.75);const sea=rect(-5,Z(1.2),5,1.0);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.05,.3);for(let i=0;i<7;i++)k.key(`M${-4.7+i*.7} ${Z(1.5)+(i%2)*.3} l.3 0`,.02,INK.white);
  k.text('ENGLAND',-2.5,Z(2.62),.44,INK.navy,{max:4});k.text('TURNED DOWN AT SEVENTEEN',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);const sea=rect(0,Z(1.2),5,1.0);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.05,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.7} ${Z(1.5)+(i%2)*.3} l.3 0`,.02,INK.white);chalk(k,ell(2.8,Z(-.4),.6,.6));
  k.text('NORTH CAROLINA · 2009',2.5,Z(2.62),.34,INK.pink,{max:4.4});k.text('COLLEGE CHAMPIONS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#d9dde6',INK.navy,y=>.22-y*.04);hills(k,4.5,3,1.9,'#a9b78a');roofs(k,.4,3.0,2.35,4);k.fill(rect(0,2.35,4.5,.65),'#a7c47f');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.5);hills(k,4.5,3,1.8,INK.leaf);for(let i=0;i<5;i++){const x=.5+i*.95;k.fill(poly([[x,1.3],[x+.2,1.85],[x-.2,1.85]]),INK.green);}crowd(k,4.5,1.75,2.4,['#6fb6e2',INK.white,'#6fb6e2',INK.navy],3);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const grey=bd.add(rainCloud('c-grey',1.0,.55),'L',2.6,2.2,{out:.03}),sun=bd.add(S.sun(K+'c-sun',.36),'R',3.6,2.2,{out:.012});
  const planeL=bd.add(S.plane(K+'c-planeL',.8,.4),'L',3.6,2.0,{out:.03}),planeR=bd.add(S.plane(K+'c-planeR',.8,.4),'R',.2,2.0,{out:.03});
  const fw=[bd.add(S.firework(K+'c-fw1',.4,INK.pink),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'c-fw2',.36,INK.yellow),'R',2.6,2.1,{out:.03})];
  const uni=B.stand(building('c-uni',1.8,1.4,'UNIVERSITY','#e6d6b6'),-3.1,-1.7,{layer:1});void uni;
  const no=B.stand(S.flipCard(K+'c-no',.9,.4,'NOT NOW',INK.pink),-4.35,-.5,{layer:2,s:0});
  const eng=B.stand(S.sign(K+'c-eng',1.3,1.3,'ENGLAND',INK.white),-1.0,-.9,{layer:1,s:0});
  const engFlap=eng.flap(lineCard('c-engcard',1.2,.5,['PLAY HERE','TO BE PICKED'],INK.yellow),0,1.3*.58,{z:.03});
  const L=B.person(K+'c-lucyL',-2.1,.3,1.26,{shirt:'casual',...LUCY,face:'open',holdR:'suitcase',layer:2});
  const walk=B.stand(S.suitcaseProp(K+'c-case',.36,.36),-1.4,.8,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'c-goal',1.5,.8),4.1,-1.8,{layer:1});
  const team=[[2.0,-.9,'long'],[3.2,-.3,'bun'],[4.4,-.7,'short'],[4.2,.55,'curly']].map(([x,z,h],i)=>B.person(K+`c-t${i}`,x as number,z as number,1.34,{shirt:'fan',hair:h as 'long',skin:SKINS[(i+1)%4],face:'grin',layer:i===2?1:2}));
  const coach=B.person(K+'c-coach',.9,-.8,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#f1c6a0',face:'smile',layer:2});
  const R=B.person(K+'c-lucyR',1.6,.55,1.18,{shirt:'fan',...LUCY,legs:'kick',face:'smile',layer:3});
  const young=B.stand(S.flipCard(K+'c-young',1.0,.32,'YOUNGEST',INK.yellow,INK.navy),1.6,1.0,{layer:3,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'c-cup',.5,.9),3.0,.9,{layer:3,s:0});
  const champs=B.stand(S.flipCard(K+'c-champs',1.4,.34,'FIRST BRITISH WINNER',INK.pink),3.3,1.05,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'c-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.5):b.t;
   L.body.s=beat(t,2,2.8)*(1-beat(t,12.2,13));no.s=beat(t,4.4,5.2);grey.scale=beat(t,4.6,5.6)*(1-beat(t,8.6,9.6))+beat(t,30.6,31.6)*(1-beat(t,35.4,36.4));grey.visible=grey.scale>.02;
   L.body.yaw=-.4*beat(t,5.4,6);L.body.x=-2.1+.6*beat(t,8.6,10.2);L.armR.rot=.12+.3*wave(t,8.6,10.2,1.2);
   // Across the sea: one paper plane leaves at the gutter, its twin arrives on the other side.
   const fly=manual?beat(act,0,.9):Math.max(beat(t,10,13.4)*(1-beat(t,19.2,19.6)),beat(t,19.8,22.2));
   planeL.dx=1.6*clamp01(fly*2);planeL.dy=.3*Math.sin(clamp01(fly*2)*Math.PI);planeL.visible=fly<.5;
   planeR.dx=3.0*clamp01(fly*2-1);planeR.dy=.3*Math.sin(clamp01(fly*2-1)*Math.PI);planeR.visible=fly>=.5&&fly<.999;
   team.forEach((p,i)=>{p.body.s=beat(t,12.6+i*.3,13.4+i*.3);});R.body.s=Math.max(beat(t,14.4,15.2),manual?beat(act,.6,.9):0);coach.body.s=beat(t,15,15.8);
   young.s=beat(t,15.6,16.4)*(1-beat(t,22,22.6));coach.armR.rot=.12+1.4*pulse(t,16.4,19);
   R.body.x=1.6+1.0*beat(t,22.4,24);
   const kick=[23.8,25.4];R.leg!.rot=-1*maxOf(kick.map(a=>pulse(t,a-.3,a+.3)));
   let [bx,bz]=[1.95,.6];if(t>22.4)[bx,bz]=track(t,[[22.4,1.95,.6],[24,2.95,.6],[24.4,2.95,.6],[25.4,4.1,-1.5],[27,4.1,-1.5]]);ball(bx,bz,0,t>14.6&&t<27);
   cup.s=beat(t,26.4,27.4);champs.s=beat(t,27,27.8);fw.forEach((q,i)=>{q.scale=beat(t,26.6+i*.4,27.6+i*.4)*(1-beat(t,30.2,30.8));q.visible=q.scale>.02;});
   team.forEach((p,i)=>cheer(p,beat(t,26.8+i*.2,27.4+i*.2)*(1-beat(t,30.2,30.8))));cheer(R,beat(t,26.6,27.2)*(1-beat(t,30.2,30.8)));
   eng.s=beat(t,30.4,31.2);engFlap.flip=-2.9+2.9*beat(t,31.4,32.2);engFlap.visible=t>31.4;R.body.yaw=-.5*beat(t,31,31.6);
   sun.dy=.3*beat(t,0,2);R.armR.rot=.12+2.2*beat(t,36,36.6);walk.s=0;
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,12,13)+.35*beat(t,22,23)-.7*beat(t,30,31)+.35*beat(t,35,36):0;
  };
 }};

/* ───────────── 5 · The knee that would not heal (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:19.0,
 left:k=>{pitch(k,-5,0,'#b9cf9a',INK.leaf,.7);k.dots(rect(-5,0,5,PAGE_D),INK.white,.09,.25);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);road(k,-5,0,Z(2.0));
  k.text('DECEMBER 2009',-2.5,Z(2.62),.4,INK.navy,{max:4.2});k.text('A KNEE INJURY, A LEG BRACE',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{paving(k,0,5,'#e6dcc6');const g=rect(.2,Z(-1.2),4.6,1.7);k.fill(g,INK.grass,.7);k.dots(g,INK.leaf,.05,.3);
  k.text('EVERTON · A PIZZA SHOP',2.5,Z(2.62),.32,INK.blue,{max:4.4});k.text('HER OWN RECOVERY PLAN',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#d9dde6',INK.navy,y=>.25-y*.05);hills(k,4.5,3,1.9,'#dfe5e6',INK.sky);for(let i=0;i<5;i++){const x=.5+i*.9;k.fill(poly([[x,1.2],[x+.25,1.9],[x-.25,1.9]]),'#6d8f76');k.fill(poly([[x,1.2],[x+.1,1.45],[x-.1,1.45]]),INK.white);}k.fill(rect(0,2.4,4.5,.6),'#b9cf9a');}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.6);roofs(k,.2,4.4,2.35,5);k.fill(rect(0,2.35,4.5,.65),'#e6dcc6');}},-3.05,1.22);
  const snow=bd.add(S.stars(K+'k-snow',2.6,.8,12),'L',.8,2.1,{out:.02}),rain=bd.add(rainCloud('k-rain',1.2,.65),'L',2.4,2.1,{out:.03}),sun=bd.add(S.sun(K+'k-sun',.36),'R',3.6,2.1,{out:.012});
  const cal=B.stand(calendar('k-cal',.9,1.2),-4.3,-.9,{layer:2});
  const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG'];
  cal.add(monthCard('k-sep',.72,.72,'SEP',INK.grass),0,.28,{z:.012});
  const months=MONTHS.map((m,i)=>cal.flap(monthCard(`k-${m}`,.72,.72,m,[INK.yellow,INK.sky,INK.pink][i%3]),0,1.0,{z:.03-i*.002}));
  const chairs=[0,1,2].map(i=>B.stand(chair(`k-ch${i}`,.4,.5),-2.6+i*.5,-1.6,{layer:1}));void chairs;
  const L=B.person(K+'k-lucy',-2.4,.4,1.3,{shirt:'ger',...LUCY,legs:'kick',face:'smile',layer:2});
  const Ls=B.person(K+'k-lucysad',-2.1,.5,1.3,{shirt:'ger',...LUCY,face:'sad',layer:2});
  const brace=Ls.body.add(bandage('k-brace',.2,.26),-.09,Ls.h*.18,{z:.02,anchor:'center'});
  const busL=B.stand(bus('k-bus',1.5,.75,'YOUTH TOURNAMENT'),-3.2,1.95,{layer:3,tab:false,s:0});B.slot(-4.4,2.0,-.4,2.0);
  for(const [x,z] of [[-3.4,-.4],[-1.1,-.2]])B.stand(S.cone(K+`k-cone${x}`,.3),x,z,{layer:2});
  const shop=B.stand(pizzaShop('k-shop',1.8,1.6),3.8,-1.75,{layer:1,s:0});
  const plan=B.stand(planBoard('k-plan',1.5,1.4,['STRETCH','STRENGTH','RUN']),1.5,-1.3,{layer:1});
  const ticks=[0,1,2].map(i=>{const q=plan.add(tick(`k-t${i}`,.16),-1.5/2+1.5*.08+.07,1.4*(1-.3-i*.17)-.16,{z:.02,anchor:'bottom'});q.scale=0;return q;});
  const books=B.stand(bookStack('k-books',.8,.55),.8,.4,{layer:2,s:0});
  const benchR=B.stand(S.bench(K+'k-bench',1.3,.5),3.3,.1,{layer:2});void benchR;
  const R=B.person(K+'k-lucyR',2.9,.4,1.26,{shirt:'navy',...LUCY,face:'open',layer:2});
  const mates=[[3.8,.35],[4.4,.25]].map(([x,z],i)=>B.person(K+`k-e${i}`,x,z,1.26,{shirt:'navy',hair:i?'bun':'short',skin:SKINS[i+1],face:'grin',layer:2}));
  const RL=B.person(K+'k-lucyWork',2.4,1.55,1.26,{shirt:'navy',...LUCY,legs:'kick',face:'grin',layer:3});
  const pizzaBox=R.body.add(S.flipCard(K+'k-box',.4,.14,'PIZZA',INK.red),.3,R.h*.45,{z:.03,anchor:'center'});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.0):b.t;
   snow.dy=-.1*beat(t,0,20);
   const hurt=beat(t,4.4,5.2);L.body.s=beat(t,2,2.8)*(1-hurt);Ls.body.s=hurt;L.leg!.rot=-1*maxOf([2.8,3.8].map(a=>pulse(t,a-.3,a+.3)));
   brace.scale=beat(t,5,5.6)+.35*beat(t,8.2,9);brace.visible=brace.scale>.02;
   months.forEach((m,i)=>{m.flip=-3.2*beat(t,9+i*.45,9.4+i*.45);});
   busL.s=beat(t,12.8,13.4);busL.x=-3.2+2.6*beat(t,14,17);busL.visible=t<17.2;
   Ls.body.yaw=-.5*beat(t,14,14.8);rain.scale=beat(t,15.2,16.2)*(1-beat(t,33.6,35));rain.visible=rain.scale>.02;
   // Tick off the plan (three taps, or narrated as she builds it).
   ticks.forEach((q,i)=>{q.scale=manual?beat(act,i/3,(i+.8)/3):beat(t,28.4+i*1.6,29+i*1.6);q.visible=q.scale>.02;});
   shop.s=beat(t,22.6,23.6);R.body.s=beat(t,22.8,23.6)*(1-beat(t,26.6,27.2));mates.forEach((p,i)=>{p.body.s=beat(t,23+i*.3,23.8+i*.3);});
   pizzaBox.scale=beat(t,24.8,25.4);pizzaBox.visible=pizzaBox.scale>.02;
   books.s=beat(t,27,27.8);RL.body.s=Math.max(beat(t,26.8,27.6),manual?beat(act,0,.3):0);
   const ex=manual?act*3:Math.max(0,(t-28.4)/1.6);RL.armL.rot=-.12-2.2*pulse(ex%1,0,1)*(ex>0&&ex<3?1:0);RL.armR.rot=.12+2.2*pulse(ex%1,0,1)*(ex>0&&ex<3?1:0);RL.leg!.rot=-.8*pulse((ex+.5)%1,0,1)*(ex>0&&ex<3?1:0);
   sun.scale=Math.max(beat(t,34.2,35.2),manual?beat(act,.9,1):0);sun.visible=sun.scale>.02;cheer(RL,Math.max(beat(t,35,35.6),manual?beat(act,.95,1):0));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,18.6,19.6)+.3*beat(t,22,22.8)-.3*beat(t,33.6,34.4):0;
  };
 }};

/* ───────────── 6 · Stronger than before (comeback) ───────────── */
const comeback:SpreadDef={id:'comeback',rest:17.2,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-2.4,Z(.3),.7,.7));
  k.text('LIVERPOOL',-2.5,Z(2.62),.44,INK.red,{max:4});k.text('LEAGUE CHAMPIONS 2013 AND 2014',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.2 ${Z(-2.1)} L2.2 ${Z(-1.1)} L4.4 ${Z(-1.1)} L4.4 ${Z(-2.1)}`);dash(k,1.4,Z(.8),3.3,Z(-1.6),.03,INK.yellow);
  k.text('WORLD CUP 2015',2.5,Z(2.62),.42,INK.yellow,{max:4.2});k.text('ENGLAND 2–1 NORWAY',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'o-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.6);crowd(k,4.5,1.4,2.45,[INK.red,INK.white,INK.red,INK.yellow],1);lightRig(k,1.0,.4);lightRig(k,3.6,.35);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},
   {key:K+'o-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.3,2.5,[INK.white,INK.red,INK.white,INK.blue,INK.red],5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');}},-3.05,1.22);
  const cloud=bd.add(rainCloud('o-cloud',1.0,.55),'L',3.0,2.2,{out:.03});
  const conf=[bd.add(S.confetti(K+'o-cf1',2.2,1.1,3),'R',.5,1.3,{out:.04}),bd.add(S.confetti(K+'o-cf2',2.2,1.1,4),'L',.5,1.3,{out:.04})];
  const doubt=B.stand(S.sign(K+'o-doubt',1.2,1.3,'AGE 27?',INK.white),-4.2,-.9,{layer:2,s:0});
  const doubtFlap=doubt.flap(lineCard('o-still',1.1,.46,['STILL','PLAYING!'],INK.yellow),0,1.3*.58,{z:.03});
  const physio=B.person(K+'o-physio',-1.2,-.6,1.68,{shirt:'coach',hair:'short',adult:true,skin:SKINS[1],face:'smile',layer:2});
  const help=physio.body.add(S.bubble(K+'o-help',.5,.42,'heart'),.45,physio.h*.95,{z:-.02});
  const L=B.person(K+'o-lucyL',-2.3,.5,1.3,{shirt:'casual',...LUCY,face:'grin',layer:3});
  const cups=['2013','2014'].map((y,i)=>{const c=B.stand(S.trophy(K+`o-cup${y}`,.45,.8),-3.6+i*.8,1.55,{layer:3,s:0});const f=B.stand(S.flipCard(K+`o-y${y}`,.55,.26,y,i?INK.blue:INK.pink),-3.6+i*.8,2.1,{layer:3,s:0,tab:false});return [c,f];});
  const mast=B.stand(pole('o-pole',1.7),.55,.9,{layer:3});const flag=mast.add(flagCloth('o-flag',.5,.34),.3,.2,{z:.015});
  const board=B.stand(S.scoreboard(K+'o-board',1.6,1.25,'ENG – NOR'),1.4,-1.8,{layer:1});
  board.add(S.flipCard(K+'o-s21',1.2,.56,'2 – 1',INK.pink),0,.34,{z:.012});const f11=board.flap(S.flipCard(K+'o-s11',1.2,.56,'1 – 1','#3d5da0'),0,.9,{z:.024});
  B.stand(S.goal(K+'o-goal',1.8,.9),3.3,-1.85,{layer:1});
  const keeper=B.person(K+'o-keeper',3.3,-1.5,1.28,{shirt:'keeper',hair:'long',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const R=B.person(K+'o-lucyR',1.5,.85,1.32,{shirt:'ger',...LUCY,legs:'kick',face:'smile',layer:3});
  const op=R.body.add(bandage('o-op',.18,.2),-.09,R.h*.2,{z:.02,anchor:'center'});
  const mates=[[2.7,.4,'bun'],[4.3,.9,'short']].map(([x,z,h],i)=>B.person(K+`o-m${i}`,x as number,z as number,1.28,{shirt:'ger',hair:h as 'bun',skin:SKINS[i*2+1],face:'grin',layer:3}));
  const award=B.stand(S.trophy(K+'o-award',.55,.95),4.3,1.85,{layer:3,s:0,tab:false});
  const awardCard=B.stand(S.flipCard(K+'o-best',1.3,.3,'BEST IN THE WORLD',INK.yellow,INK.navy),3.2,2.25,{layer:3,s:0,tab:false});
  const ban=bd.add(S.banner(K+'o-ban',2.4,.4,'WORLD CUP 2015',INK.red),'R',1.0,2.45,{out:.02});
  const ball=ballPair(B,'o-ball',.12);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   doubt.s=beat(t,2.2,3);cloud.scale=beat(t,3.4,4.4)*(1-beat(t,9,10));cloud.visible=cloud.scale>.02;
   L.body.s=beat(t,8.8,9.6);physio.body.s=beat(t,9.6,10.4);help.scale=beat(t,11,11.6)*(1-beat(t,16.4,17));help.visible=help.scale>.02;physio.armL.rot=-.12-1.1*beat(t,11,11.6);
   cups.forEach(([c,f],i)=>{c.s=beat(t,13.4+i*1.2,14.2+i*1.2);f.s=beat(t,13.8+i*1.2,14.4+i*1.2);});cheer(L,beat(t,14.4,15)*(1-beat(t,16.6,17.2))+beat(t,37.6,38.2));
   // Raise the flag.
   const up=manual?beat(act,0,.8):beat(t,17.6,19.2);flag.dy=1.3*up;flag.rot=.04*wave(t,19.2,44,.9);
   op.scale=beat(t,19.4,20)*(1-beat(t,21.6,22.4));op.visible=op.scale>.02;ban.scale=beat(t,20.4,21.4);ban.visible=ban.scale>.02;
   R.body.s=Math.max(beat(t,18.8,19.6),manual?1:0);mates.forEach((p,i)=>{p.body.s=beat(t,21+i*.4,21.8+i*.4);});
   const shot=26.6;R.leg!.rot=-1.2*pulse(t,shot-.35,shot+.25);
   let [bx,bz,by]=[1.85,.95,0];if(t>shot)[bx,bz,by]=track(t,[[shot,1.85,.95,0],[shot+.7,2.7,-.4,.5],[shot+1.3,3.5,-1.7,.3]]);ball(bx,bz,by,t>19.4&&t<35);
   const dive=pulse(t,shot+.6,shot+2);keeper.body.rot=.8*dive;keeper.body.dx=-.25*dive;keeper.armL.rot=-.12-2.2*dive;keeper.armR.rot=.12+2.2*dive;
   f11.flip=-3.2*beat(t,28.4,29.2);cheer(R,beat(t,28.6,29.2)*(1-beat(t,31,31.6))+beat(t,37.6,38.2));mates.forEach((p,i)=>cheer(p,beat(t,28.8+i*.3,29.4+i*.3)*(1-beat(t,31,31.6))));
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*beat(t,28.8+i*.4,31+i*.4);c.visible=t>28.6;});
   award.s=beat(t,31.8,32.8);awardCard.s=beat(t,32.4,33.2);
   doubtFlap.flip=-2.9*(1-beat(t,37.4,38.4));doubtFlap.visible=t>37.4;
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,16.6,17.4)+.35*beat(t,19,20)-.35*beat(t,36.6,37.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={alnwick,sunderland,friend,carolina,knee,comeback};
void pulse;void clamp01;void TAU;void wave;void maxOf;
