/**
 * The six Falcão pop-up spreads: original riso paper artwork of the setbacks in his story (his father's nickname and
 * the grass game that never fitted, trial doors that stayed shut, losing his father, World Cup defeats, the 2012
 * injury and the 2016 goodbye), with narration-timed paper mechanics. Each pose(beat) is a pure function of Coach
 * Bella's narration time and the reader's action (0–1), so pause, seek, replay and manual play show the same state.
 * Timings follow the sentence cues in public/voice/books/falcao/narration.json. Kits are plain colours, no crests.
 * Hardship is drawn symbolically: an empty chair and a photo frame, a rain cloud that clears, doors, a signpost.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse,wave,clamp01,PAGE_D} from '../popupEngine';

const F='falcao-',D2=PAGE_D/2;
const Z=(z:number)=>z+D2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:F+key,w,h,paint,...extra});
const WOOD='#ecb87a',WOOD2='#c98b52',FLOOR='#3b74b5',HERO_SKIN='#a86f4c';
const BRA=[INK.yellow,'#3f9567',INK.yellow,INK.white,'#3f9567',INK.yellow,INK.blue];
const MIX=[INK.yellow,INK.white,INK.red,INK.yellow,'#3f9567',INK.white,INK.orange,'#6fb6e2'];
const IRAN=[INK.white,'#3f9567',INK.red,INK.white,INK.yellow,'#3f9567'];
const SPFC=[INK.white,INK.red,'#2b2b2b',INK.white,INK.red,INK.yellow];
/** 1 while any of the given moments is being touched (a short pulse around each). */
const taps=(t:number,at:number[],w=.5)=>at.reduce((m,a)=>Math.max(m,pulse(t,a-w/2,a+w/2)),0);
const count=(t:number,at:number[])=>at.reduce((n,a)=>n+(t>=a?1:0),0);
const pop=(t:number,a:number,d=.8)=>beat(t,a,a+d);

/* ───────────── page prints ───────────── */
const CZ0=-2.55,CZ1=1.7,CX=4.7,CZM=(CZ0+CZ1)/2;
function court(k:Kit,side:'L'|'R',o:{floor?:string;wood?:string;dim?:boolean}={}){
 const x0=side==='L'?-5:0,sx=side==='L'?-1:1,a=side==='L'?-CX:0,b=side==='L'?0:CX,y0=Z(CZ0),y1=Z(CZ1);
 const all=rect(x0,0,5,PAGE_D);k.fill(all,o.floor??FLOOR,.92);k.dots(all,INK.navy,.06,.26);
 const c=rect(a,y0,b-a,y1-y0);k.fill(c,o.wood??WOOD);
 for(let y=y0+.2;y<y1-.01;y+=.2)k.key(`M${a} ${y} L${b} ${y}`,.007,WOOD2);
 for(let i=0;i<46;i++){const row=Math.floor(((i*37)%97)/97*21),y=y0+row*.2,x=a+((i*53)%89)/89*(b-a);if(y+.2<=y1)k.key(`M${x} ${y} L${x} ${y+.2}`,.007,WOOD2);}
 k.dots(c,INK.orange,.05,(x,y)=>.1+.08*Math.sin(x*1.1+y*.6));
 const L=(d:string)=>k.key(d,.035,INK.white),e=sx*CX;
 L(`M0 ${y0} L${e} ${y0} L${e} ${y1} L0 ${y1}`);L(`M${sx*.03} ${y0} L${sx*.03} ${y1}`);
 k.key(`M0 ${Z(CZM-.75)} A.75 .75 0 0 ${side==='L'?0:1} 0 ${Z(CZM+.75)}`,.035,INK.white);k.circle(sx*.05,Z(CZM),.05,INK.white);
 const d=sx*1.45;L(`M${e} ${Z(CZM-1.35)} Q${e-d} ${Z(CZM-1.3)} ${e-d} ${Z(CZM-.28)} L${e-d} ${Z(CZM+.28)} Q${e-d} ${Z(CZM+1.3)} ${e} ${Z(CZM+1.35)}`);
 k.circle(e-sx*1.45,Z(CZM),.05,INK.white);k.circle(e-sx*2.4,Z(CZM),.05,INK.white);
 for(const m of [1.25,2.45])L(`M${sx*m} ${y1-.12} L${sx*m} ${y1+.12}`);
 if(o.dim)k.dots(c,INK.navy,.05,.14);
}
/** The neighbourhood field: packed earth with chalk lines, the kind of pitch his father played on. */
function varzea(k:Kit){
 const all=rect(-5,0,5,PAGE_D);k.fill(all,'#c98f5a');k.dots(all,INK.brown,.055,(x,y)=>.18+.1*Math.sin(x*1.7+y*1.3));
 const f=rect(-4.75,Z(-2.5),4.55,Z(1.7)-Z(-2.5));k.fill(f,'#dcae78');k.dots(f,INK.orange,.05,.16);
 k.key(`M-4.75 ${Z(-2.5)} L-.2 ${Z(-2.5)} L-.2 ${Z(1.7)} L-4.75 ${Z(1.7)} Z`,.03,INK.white);k.key(ell(-2.5,Z(-.4),.6,.6),.03,INK.white);k.key(`M-2.5 ${Z(-2.5)} L-2.5 ${Z(1.7)}`,.03,INK.white);
 for(let i=0;i<14;i++){const x=-4.8+((i*37)%47)/47*4.6,y=Z(-2.9+((i*23)%31)/31*.3);k.key(`M${x} ${y} L${x+.04} ${y-.1} M${x+.06} ${y} L${x+.1} ${y-.12}`,.014,INK.leaf);}
 for(let i=0;i<7;i++){const x=-4.3+i*.55,y=Z(1.95)+(i%2)*.05;k.fill(ell(x,y,.05,.08),INK.brown,.35);}
}
function street(k:Kit){
 const all=rect(-5,0,5,PAGE_D);k.fill(all,INK.stone);k.dots(all,INK.navy,.05,.14);
 for(let y=.3;y<PAGE_D;y+=.42)k.key(`M-5 ${y} L0 ${y}`,.008,'#b7ab91');
 for(let i=0;i<24;i++){const r=Math.floor(i/6),x=-5+((i%6)+(r%2)*.5)*.84,y=.3+r*.42;k.key(`M${x} ${y} L${x} ${y+.42}`,.008,'#b7ab91');}
 const path=`M-4.8 ${Z(1.2)} Q-3.4 ${Z(.2)} -2.4 ${Z(.7)} Q-1.2 ${Z(1.2)} -.1 ${Z(.3)}`;k.key(path,.2,INK.sand);k.key(path,.02,INK.yellow);
 for(let i=0;i<8;i++){const x=-4.5+i*.55,y=Z(1.0-Math.sin(i*.8)*.35);k.fill(ell(x,y,.05,.08),INK.navy,.3);}
}
function grassPage(k:Kit,side:'L'|'R'){
 const x0=side==='L'?-5:0;for(let i=0;i<10;i++){const s=rect(x0+i*.5,0,.5,PAGE_D);k.fill(s,i%2?INK.grass:'#7fb85b');}
 k.dots(rect(x0,0,5,PAGE_D),INK.leaf,.05,.25);const sx=side==='L'?-1:1,e=sx*4.7;
 k.key(`M0 ${Z(-2.5)} L${e} ${Z(-2.5)} L${e} ${Z(1.7)} L0 ${Z(1.7)}`,.035,INK.white);
 k.key(`M${e} ${Z(-1.5)} L${e-sx*1.3} ${Z(-1.5)} L${e-sx*1.3} ${Z(.7)} L${e} ${Z(.7)}`,.035,INK.white);
}
function homeFloor(k:Kit){
 const floor=rect(-5,0,5,PAGE_D);k.fill(floor,'#e2b98c');for(let y=.2;y<PAGE_D;y+=.26)k.key(`M-5 ${y} L0 ${y}`,.008,'#b98a5a');k.dots(floor,INK.brown,.05,.12);
 const rug=ell(-2.4,Z(.2),1.9,1.1);k.fill(rug,INK.teal,.8);k.dots(rug,INK.navy,.05,.25);k.key(ell(-2.4,Z(.2),1.7,.95),.02,INK.yellow);
}
function word(k:Kit,text:string,x:number,y:number,size:number,color:string,max=3.2){k.text(text,x,y,size,INK.navy,{max});k.text(text,x-.03,y-.03,size,color,{max});}

/* ───────────── backdrop painters (4.5 × 3 V-fold panels) ───────────── */
function hall(k:Kit,w:number,h:number,o:{tone?:string;flip?:boolean;bars?:boolean;clock?:boolean}={}){
 const wall=rect(0,0,w,h);k.fill(wall,o.tone??'#f3dcae');k.dots(wall,INK.orange,.05,(x,y)=>.08+y/h*.22);
 for(let y=1.3;y<h-.75;y+=.16)k.key(`M0 ${y} L${w} ${y}`,.005,'#d8b27c');
 const roof=rect(0,0,w,.34);k.fill(roof,INK.navy);k.dots(roof,INK.blue,.04,.45);
 for(let i=0;i<6;i++){const x=i*w/6;k.key(`M${x} .34 L${x+w/12} .06 L${x+w/6} .34`,.014,INK.grey);}
 const n=4,gw=(w-.4)/n;for(let i=0;i<n;i++){const x=.3+i*gw,ww=gw-.2,win=rect(x,.52,ww,.62);k.fill(win,INK.sky2);k.dots(win,INK.blue,.03,(_,y)=>.7-(y-.5)*1.1);k.key(win,.016);k.key(`M${x+ww/2} .52 L${x+ww/2} 1.14 M${x} .83 L${x+ww} .83`,.01);}
 for(let i=0;i<3;i++){const x=w*(.2+i*.3);k.key(`M${x} .34 L${x} .42`,.012);k.fill(`M${x-.14} .5 L${x+.14} .5 L${x+.08} .42 L${x-.08} .42 Z`,INK.grey);k.circle(x,.52,.04,INK.yellow);}
 if(o.bars){const x0=o.flip?w-1.45:.35;for(let i=0;i<5;i++)k.fill(rect(x0+i*.26,1.3,.045,h-2.02),INK.wood);for(let j=0;j<6;j++)k.fill(rect(x0-.04,1.38+j*.15,1.14,.035),INK.wood);k.key(rect(x0-.04,1.3,1.14,h-2.02),.01,INK.brown);}
 if(o.clock){const cx=o.flip?.75:w-.75;k.fill(ell(cx,1.6,.22,.22),INK.white);k.key(ell(cx,1.6,.22,.22),.022);k.key(`M${cx} 1.6 L${cx} 1.45 M${cx} 1.6 L${cx+.1} 1.65`,.02);}
 const pad=rect(0,h-.72,w,.52);k.fill(pad,INK.blue);k.dots(pad,INK.navy,.04,.28);k.key(pad,.012);
 for(let i=1;i<9;i++)k.key(`M${i*w/9} ${h-.72} L${i*w/9} ${h-.2}`,.012,INK.navy);
 k.fill(rect(0,h-.2,w,.2),WOOD);k.key(`M0 ${h-.2} L${w} ${h-.2}`,.012);
}
function arena(k:Kit,w:number,h:number,colors:string[],seed=1,floorTone=FLOOR){
 const sky=rect(0,0,w,h);k.fill(sky,'#233566');k.dots(sky,INK.blue,.06,(_,y)=>.4-y/h*.3);
 k.fill(rect(0,0,w,.28),'#141f40');for(let i=0;i<8;i++){const x=i*w/8;k.key(`M${x} .28 L${x+w/16} .04 L${x+w/8} .28`,.012,INK.grey);}
 for(let i=0;i<3;i++){const x=w*(.18+i*.32);k.fill(rect(x-.28,.3,.56,.14),INK.grey);k.key(rect(x-.28,.3,.56,.14),.01);for(let j=0;j<5;j++)k.circle(x-.2+j*.1,.37,.035,INK.yellow);}
 const y0=.62,y1=2.18;k.fill(rect(0,y0,w,y1-y0),'#2d3f73');
 const rows=Math.floor((y1-y0-.06)/.15);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.15;for(let i=0;i<Math.round(w/.12);i++){const x=.06+i*.12+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.042,c);k.fill(rect(x-.047,y+.03,.094,.065),c);}}
 for(let r=1;r<4;r++)k.key(`M0 ${y0+r*(y1-y0)/4} L${w} ${y0+r*(y1-y0)/4}`,.012,'#1a2447');
 const hc=[INK.blue,INK.white,INK.yellow,INK.white];for(let i=0;i<6;i++){const b=rect(i*w/6,y1,w/6,.34);k.fill(b,hc[(i+seed)%hc.length]);k.key(b,.01);k.dots(b,INK.navy,.035,.12);}
 const floor=rect(0,y1+.34,w,h-y1-.34);k.fill(floor,floorTone);k.dots(floor,INK.navy,.05,.3);
}
function saoPaulo(k:Kit,w:number,h:number){
 const sky=rect(0,0,w,h);k.fill(sky,INK.sky2);k.dots(sky,INK.sky,.055,(_,y)=>.8-y/h*.8);
 const tones=['#c9c3b3','#e7a79b','#f2d895','#b9c9d6','#d9cfb8','#f0b86a'];
 for(let i=0;i<13;i++){const x=.05+i*.34,top=.55+((i*7)%5)*.2,bw=.3,b=rect(x,top,bw,2.2-top);k.fill(b,tones[i%tones.length]);k.key(b,.012);
  for(let r=0;r<Math.floor((2.1-top)/.14);r++)for(let c=0;c<2;c++)k.fill(rect(x+.05+c*.12,top+.08+r*.14,.07,.06),INK.blue,.8);}
 const hill=`M0 ${h} L0 2.0 Q1.4 1.6 2.6 1.95 Q3.6 2.2 ${w} 1.85 L${w} ${h} Z`;k.fill(hill,INK.leaf);k.dots(hill,INK.navy,.05,.2);
 const hc=[INK.pink,INK.yellow,INK.orange,INK.sky,INK.white,'#7fc6a4'];
 for(let i=0;i<16;i++){const x=.05+((i*29)%44)/44*(w-.35),y=2.0+((i*17)%7)*.1,b=rect(x,y,.28,.22);k.fill(b,hc[i%hc.length]);k.key(b,.01);k.fill(rect(x+.1,y+.08,.07,.07),INK.navy);}
 const road=rect(0,h-.3,w,.3);k.fill(road,INK.stone);k.dots(road,INK.navy,.04,.2);k.key(`M0 ${h-.3} L${w} ${h-.3}`,.012);
}
function home(k:Kit,w:number,h:number){
 const wall=rect(0,0,w,h);k.fill(wall,'#f6d7c3');for(let x=.1;x<w;x+=.3)k.fill(rect(x,0,.12,h-.5),'#f2c4b0');k.dots(wall,INK.pink,.05,.1);
 const win=rect(1.6,.45,1.4,1.1);k.fill(win,INK.sky);k.dots(win,INK.blue,.035,(_,y)=>.6-(y-.45)*.5);k.key(win,.02);k.key(`M2.3 .45 L2.3 1.55 M1.6 1.0 L3.0 1.0`,.014);
 k.fill(`M1.45 .38 L3.15 .38 L3.1 .45 L1.5 .45 Z`,INK.wood);for(const x of [1.35,3.05])k.fill(rect(x,.38,.2,1.3),INK.teal,.85);
 const fr2=rect(3.45,.8,.6,.7);k.fill(fr2,INK.blue);k.key(fr2,.016);k.fill(rect(3.53,.88,.44,.54),INK.sky2);k.fill(poly([[3.6,1.35],[3.75,1.05],[3.9,1.35]]),INK.pink);
 k.fill(rect(0,h-.5,w,.12),INK.white);k.key(`M0 ${h-.5} L${w} ${h-.5}`,.012);k.fill(rect(0,h-.38,w,.38),'#d9a36b');k.dots(rect(0,h-.38,w,.38),INK.brown,.04,.25);
}

/* ───────────── plates ───────────── */
const futsalBall=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const c=r;const o=ell(c,c,r,r);k.fill(o,INK.white);k.dots(o,INK.sky,.022,(x,y)=>((x-c)+(y-c))/r*.35+.2);
 k.fill(`M${c-r*.96} ${c-r*.1} Q${c} ${c-r*.9} ${c+r*.96} ${c-r*.1} L${c+r*.92} ${c+r*.22} Q${c} ${c-r*.5} ${c-r*.92} ${c+r*.22} Z`,INK.yellow);
 k.fill(`M${c-r*.8} ${c+r*.55} Q${c} ${c+r*.15} ${c+r*.8} ${c+r*.55} L${c+r*.62} ${c+r*.78} Q${c} ${c+r*.45} ${c-r*.62} ${c+r*.78} Z`,INK.blue);
 k.key(o,r*.09);},{rim:.018});
const wallBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=Math.max(2,Math.round(w/.55));for(let i=0;i<n;i++){const b=rect(i*w/n,0,w/n,h);k.fill(b,i%2?INK.white:INK.blue);k.dots(b,INK.navy,.035,i%2?.1:.3);k.key(b,.012);}k.fill(rect(0,0,w,h*.14),INK.navy);});
const twoLine=(key:string,w:number,h:number,l1:string,l2:string,color:string,ink=INK.white)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.03,.22);k.key(b,.012);if(l2){k.text(l1,w/2,h*.44,h*.3,ink,{max:w*.86});k.text(l2,w/2,h*.84,h*.3,ink,{max:w*.86});}else k.text(l1,w/2,h*.7,h*.48,ink,{max:w*.86});},{rim:.016});
const stopwatch=(key:string,r:number,label:string)=>sp(key,r*2,r*2.3,k=>{const c=r,cy=r*1.3;k.fill(rect(c-r*.16,0,r*.32,r*.3),INK.grey);k.key(rect(c-r*.16,0,r*.32,r*.3),.012);k.fill(ell(c,cy,r,r),INK.pink);k.key(ell(c,cy,r,r),.016);
 const f=ell(c,cy,r*.8,r*.8);k.fill(f,INK.white);k.key(f,.012);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${c+Math.cos(a)*r*.66} ${cy+Math.sin(a)*r*.66} L${c+Math.cos(a)*r*.76} ${cy+Math.sin(a)*r*.76}`,i%3?.01:.022);}
 k.text(label,c,cy+r*.42,r*.2,INK.navy,{weight:800,max:r*1.3});});
const hand=(key:string,w:number,h:number,color=INK.navy)=>sp(key,w,h,k=>{const p=poly([[w*.2,0],[w*.8,0],[w*.62,h],[w*.38,h]]);k.fill(p,color);k.circle(w/2,.03,Math.min(.03,w*.45),INK.gold);},{rim:.008,grain:.5});
const plinth=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const col=poly([[w*.12,h*.1],[w*.88,h*.1],[w*.8,h],[w*.2,h]]);k.fill(col,INK.white);k.dots(col,INK.sky,.03,.35);k.key(col,.013);k.fill(rect(0,0,w,h*.12),INK.navy);k.key(rect(0,0,w,h*.12),.012);k.fill(rect(w*.2,h*.88,w*.6,h*.05),INK.gold);});
const resultFlap=(key:string,w:number,h:number,top:string,big:string,bottom:string,color=INK.blue)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.3);k.key(b,.014,'#101a36');
 k.text(top,w/2,h*.27,h*.18,INK.yellow,{max:w*.88});k.text(big,w/2,h*.63,h*.32,INK.white,{max:w*.88});k.text(bottom,w/2,h*.88,h*.17,INK.yellow,{max:w*.88});k.fill(rect(w*.44,h*.93,w*.12,h*.07),INK.yellow);},{rim:.018});
const clockFace=(key:string,r:number,label:string)=>sp(key,r*2,r*2.4,k=>{const c=r;k.fill(ell(c,c,r,r),INK.white);k.key(ell(c,c,r,r),.02);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${c+Math.cos(a)*r*.72} ${c+Math.sin(a)*r*.72} L${c+Math.cos(a)*r*.86} ${c+Math.sin(a)*r*.86}`,.012);}
 const tag=rect(0,r*2.02,r*2,r*.38);k.fill(tag,INK.pink);k.key(tag,.01);k.text(label,c,r*2.3,r*.24,INK.white,{max:r*1.8});});
const tower=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const col=poly([[w*.1,h*.2],[w*.9,h*.2],[w*.84,h],[w*.16,h]]);k.fill(col,INK.gold);k.dots(col,INK.orange,.035,(x)=>.12+x/w*.4);k.key(col,.015);
 for(let i=0;i<5;i++){const x=w*(.14+i*.18);k.fill(poly(Array.from({length:10},(_,j)=>[x+Math.cos(j*.628-1.57)*(j%2?.035:.085),h*.1+Math.sin(j*.628-1.57)*(j%2?.035:.085)])),i%2?INK.white:INK.yellow);}
 k.text('48',w/2,h*.56,h*.3,INK.navy);k.text('WORLD CUP',w/2,h*.7,h*.07,INK.navy,{weight:800,max:w*.7});k.text('GOALS',w/2,h*.79,h*.07,INK.navy,{weight:800,max:w*.7});k.fill(rect(w*.22,h*.86,w*.56,h*.03),INK.pink);k.text('RECORD',w/2,h*.95,h*.06,INK.pink,{max:w*.66});});
const marker=(key:string,s:number,n:string)=>sp(key,s,s*1.7,k=>{k.keyFill(rect(s*.45,s*.9,s*.1,s*.8),INK.navy);const f=ell(s/2,s/2,s*.48,s*.48);k.fill(f,INK.yellow);k.key(f,.012);k.text(n,s/2,s*.66,s*.46,INK.navy);},{rim:.016});
const hourglass=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(0,0,w,h*.1),INK.wood);k.fill(rect(0,h*.9,w,h*.1),INK.wood);const g=`M${w*.15} ${h*.1} L${w*.85} ${h*.1} Q${w*.85} ${h*.4} ${w*.54} ${h*.5} Q${w*.85} ${h*.6} ${w*.85} ${h*.9} L${w*.15} ${h*.9} Q${w*.15} ${h*.6} ${w*.46} ${h*.5} Q${w*.15} ${h*.4} ${w*.15} ${h*.1} Z`;
 k.fill(g,INK.sky2);k.fill(`M${w*.3} ${h*.9} Q${w*.5} ${h*.62} ${w*.7} ${h*.9} Z`,INK.sand);k.fill(`M${w*.28} ${h*.24} L${w*.72} ${h*.24} Q${w*.6} ${h*.42} ${w*.5} ${h*.47} Q${w*.4} ${h*.42} ${w*.28} ${h*.24} Z`,INK.sand);k.key(g,.013);k.key(rect(0,0,w,h*.1),.01);k.key(rect(0,h*.9,w,h*.1),.01);});
const kidBoard=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.44,h*.6,w*.12,h*.4),INK.grey);const b=rect(0,0,w,h*.62);k.fill(b,INK.night);k.dots(b,INK.blue,.04,.35);k.key(b,.016,'#101a36');k.text(title,w/2,h*.13,h*.08,INK.yellow,{max:w*.84});for(let i=0;i<6;i++)k.circle(w*(.15+i*.14),h*.03,.016,INK.yellow);});
/** The butcher's shop: striped awning, counter window and a plain word sign (no real shop). */
const butcherShop=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wall=rect(0,h*.26,w,h*.74);k.fill(wall,'#f3e2c2');k.dots(wall,INK.orange,.04,.14);k.key(wall,.014);
 const sign=rect(w*.08,0,w*.84,h*.14);k.fill(sign,INK.navy);k.key(sign,.012);k.text('BUTCHER',w/2,h*.115,h*.09,INK.yellow,{max:w*.76});
 for(let i=0;i<8;i++){const x=i*w/8,s=`M${x} ${h*.15} L${x+w/8} ${h*.15} L${x+w/8} ${h*.28} Q${x+w/16} ${h*.34} ${x} ${h*.28} Z`;k.fill(s,i%2?INK.white:INK.red);k.key(s,.008);}
 const win=rect(w*.08,h*.4,w*.52,h*.36);k.fill(win,INK.sky2);k.dots(win,INK.blue,.03,.3);k.key(win,.014);k.fill(rect(w*.08,h*.66,w*.52,h*.1),INK.white);k.key(rect(w*.08,h*.66,w*.52,h*.1),.01);
 for(let i=0;i<3;i++)k.fill(ell(w*(.18+i*.16),h*.62,w*.05,h*.03),INK.pink);
 const d=rect(w*.68,h*.42,w*.22,h*.58);k.fill(d,INK.wood);k.key(d,.012);k.circle(w*.72,h*.72,.02,INK.gold);});
const grassBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.66,w*.08,h*.34),INK.brown);const b=rect(0,0,w,h*.68);for(let i=0;i<6;i++){const s=rect(i*w/6,0,w/6,h*.68);k.fill(s,i%2?INK.grass:'#7fb85b');}k.key(b,.016);
 k.key(rect(w*.06,h*.12,w*.88,h*.5),.012,INK.white);k.key(`M${w/2} ${h*.12} L${w/2} ${h*.62}`,.012,INK.white);k.key(ell(w/2,h*.37,h*.1,h*.1),.012,INK.white);
 const lbl=rect(w*.12,h*.02,w*.76,h*.14);k.fill(lbl,INK.white);k.key(lbl,.01);k.text('GRASS · BIG FIELD',w/2,h*.13,h*.08,INK.navy,{weight:800,max:w*.7});});
/** A doorway in a wall: a club's name on the lintel and a glimpse of what lies behind. */
const doorFrame=(key:string,w:number,h:number,l1:string,l2:string,color:string,inside:'grass'|'court')=>sp(key,w,h,k=>{const wall=rect(0,0,w,h);k.fill(wall,'#e9dcc0');k.dots(wall,INK.orange,.04,.14);k.key(wall,.014);
 const lint=rect(0,0,w,h*.24);k.fill(lint,color);k.dots(lint,INK.navy,.035,.25);k.key(lint,.012);k.text(l1,w/2,h*.12,h*.1,INK.white,{max:w*.86});k.text(l2,w/2,h*.21,h*.07,INK.yellow,{weight:800,max:w*.8});
 const o=rect(w*.2,h*.3,w*.6,h*.7);
 if(inside==='grass'){k.fill(o,INK.grass);k.dots(o,INK.leaf,.035,.35);k.fill(rect(w*.2,h*.3,w*.6,h*.22),INK.sky2);k.key(`M${w*.32} ${h*.62} L${w*.32} ${h*.5} L${w*.68} ${h*.5} L${w*.68} ${h*.62}`,.014,INK.white);}
 else{k.fill(o,INK.yellow);k.dots(o,INK.orange,.035,(_,y)=>.1+(y-h*.3)/h*.4);k.fill(rect(w*.2,h*.78,w*.6,h*.22),WOOD);k.key(`M${w*.2} ${h*.86} L${w*.8} ${h*.86}`,.012,INK.white);for(let i=0;i<5;i++)k.key(`M${w*(.3+i*.1)} ${h*.34} L${w*(.26+i*.12)} ${h*.74}`,.012,INK.white);}
 k.key(o,.02,INK.brown);});
const doorLeaf=(key:string,w:number,h:number,color:string)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,color);k.dots(d,INK.navy,.035,.3);k.key(d,.014,'#101a36');
 for(const [y,hh] of [[.08,.34],[.5,.42]] as const){const p=rect(w*.14,h*y,w*.72,h*hh);k.key(p,.012,'#101a36');}k.circle(w*.84,h*.52,.03,INK.gold);},{rim:.014});
/** The photo on the shelf: a father's portrait on a small easel. */
const portrait=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(poly([[w*.3,h*.78],[w*.36,h*.78],[w*.26,h],[w*.2,h]]),INK.brown);k.keyFill(poly([[w*.64,h*.78],[w*.7,h*.78],[w*.8,h],[w*.74,h]]),INK.brown);
 const fr=rect(0,0,w,h*.8);k.fill(fr,INK.gold);k.dots(fr,INK.orange,.03,.3);k.key(fr,.016);const inner=rect(w*.1,h*.07,w*.8,h*.66);k.fill(inner,INK.sky2);k.dots(inner,INK.sky,.03,.3);
 const sh=`M${w*.14} ${h*.73} Q${w*.18} ${h*.5} ${w*.5} ${h*.5} Q${w*.82} ${h*.5} ${w*.86} ${h*.73} Z`;k.fill(sh,INK.red);k.dots(sh,INK.navy,.03,.2);
 k.fill(rect(w*.44,h*.44,w*.12,h*.08),HERO_SKIN);const hd=ell(w*.5,h*.32,w*.17,h*.15);k.fill(hd,HERO_SKIN);k.key(hd,.01);
 k.fill(`M${w*.33} ${h*.3} Q${w*.34} ${h*.15} ${w*.5} ${h*.16} Q${w*.66} ${h*.15} ${w*.67} ${h*.3} Q${w*.6} ${h*.22} ${w*.5} ${h*.22} Q${w*.4} ${h*.22} ${w*.33} ${h*.3} Z`,'#2b2320');
 k.fill(`M${w*.42} ${h*.37} Q${w*.5} ${h*.34} ${w*.58} ${h*.37} L${w*.56} ${h*.39} Q${w*.5} ${h*.37} ${w*.44} ${h*.39} Z`,'#2b2320');
 for(const x of [.44,.56])k.circle(w*x,h*.3,.018,INK.navy);k.key(`M${w*.45} ${h*.41} Q${w*.5} ${h*.43} ${w*.55} ${h*.41}`,.008);k.key(inner,.012,INK.brown);});
const armchair=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const back=`M${w*.12} ${h*.6} L${w*.12} ${h*.1} Q${w*.5} 0 ${w*.88} ${h*.1} L${w*.88} ${h*.6} Z`;k.fill(back,INK.pink);k.dots(back,INK.red,.035,.25);k.key(back,.013);
 const seat=rect(w*.06,h*.55,w*.88,h*.24);k.fill(seat,'#f28bb8');k.key(seat,.013);for(const x of [0,w*.8])k.fill(rect(x,h*.36,w*.2,h*.44),INK.pink);k.key(rect(0,h*.36,w*.2,h*.44),.012);k.key(rect(w*.8,h*.36,w*.2,h*.44),.012);
 for(const x of [.1,.84])k.keyFill(rect(w*x,h*.8,w*.06,h*.2),INK.brown);});
/** A dream cloud with a big grass pitch inside. */
const dreamBubble=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cl=[[.3,.32,.26],[.55,.24,.28],[.78,.36,.22],[.5,.5,.4]] as const;for(const [x,y,r] of cl)k.fill(ell(w*x,h*y,w*r,h*r*1.1),INK.white);for(const [x,y,r] of cl)k.key(ell(w*x,h*y,w*r,h*r*1.1),.012);for(const [x,y,r] of cl)k.fill(ell(w*x,h*y,w*r-.012,h*r*1.1-.012),INK.white);
 const p=rect(w*.22,h*.3,w*.56,h*.34);for(let i=0;i<5;i++)k.fill(rect(w*.22+i*w*.112,h*.3,w*.112,h*.34),i%2?INK.grass:'#7fb85b');k.key(p,.012,INK.white);k.key(`M${w/2} ${h*.3} L${w/2} ${h*.64}`,.01,INK.white);k.key(ell(w/2,h*.47,h*.07,h*.07),.01,INK.white);
 k.fill(ell(w*.16,h*.86,w*.05,h*.05),INK.white);k.key(ell(w*.16,h*.86,w*.05,h*.05),.01);k.fill(ell(w*.07,h*.96,w*.03,h*.03),INK.white);k.key(ell(w*.07,h*.96,w*.03,h*.03),.008);},{rim:.018});
const signArrow=(key:string,w:number,h:number,label:string,color:string,dir:'L'|'R',ink=INK.navy)=>sp(key,w,h,k=>{const p=dir==='R'?poly([[0,0],[w*.8,0],[w,h/2],[w*.8,h],[0,h]]):poly([[w*.2,0],[w,0],[w,h],[w*.2,h],[0,h/2]]);k.fill(p,color);k.dots(p,INK.navy,.03,.2);k.key(p,.013);k.text(label,dir==='R'?w*.42:w*.58,h*.68,h*.44,ink,{max:w*.66});},{rim:.016});
const bandage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.hatch(b,INK.sky,.03,.8,.006);k.key(b,.01);},{rim:.008});
const shirtPlate=(key:string,w:number,h:number,num:string)=>sp(key,w,h,k=>{const s=poly([[w*.3,0],[w*.7,0],[w,h*.2],[w*.86,h*.4],[w*.76,h*.32],[w*.76,h],[w*.24,h],[w*.24,h*.32],[w*.14,h*.4],[0,h*.2]]);k.fill(s,INK.yellow);k.dots(s,INK.orange,.03,.25);k.key(s,.014);
 k.fill(`M${w*.38} 0 Q${w/2} ${h*.12} ${w*.62} 0 Z`,'#3f9567');k.text(num,w/2,h*.74,h*.36,'#3f9567');});

/* ═════════════ 1 · A nickname from Dad (court) ═════════════ */
const courtSpread:SpreadDef={id:'court',rest:38.4,
 left:k=>{varzea(k);word(k,'SÃO PAULO',-2.15,Z(2.42),.46,INK.yellow,2.8);k.text('THE NORTH · NEIGHBOURHOOD FIELDS',-2.15,Z(2.72),.15,INK.white,{weight:800,max:3.1});},
 right:k=>{court(k,'R');word(k,'FUTSAL',2.15,Z(2.42),.44,INK.pink,2.6);k.text('THE SMALL INDOOR GAME',2.15,Z(2.72),.15,INK.white,{weight:800,max:2.9});},
 build:B=>{
  const bd=B.vfold({key:F+'c-bdL',w:4.5,h:3,paint:k=>saoPaulo(k,4.5,3)},{key:F+'c-bdR',w:4.5,h:3,paint:k=>hall(k,4.5,3,{clock:true})},-3.05,1.22);
  const sunP=bd.add(S.sun(F+'c-sun',.4),'L',3.4,1.3,{out:.015}),cloud=bd.add(S.cloud(F+'c-cloud',1.0,.45),'L',1.5,2.3,{out:.02});
  const gua=bd.add(S.banner(F+'c-gua',2.3,.4,'GUAPIRA · AGE 12',INK.blue),'R',2.0,1.3,{out:.02});
  const back=bd.add(S.banner(F+'c-back',2.3,.4,'BACK TO FUTSAL',INK.pink),'R',2.0,2.0,{out:.02});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  // Left page: the neighbourhood, the butcher's shop and the field where his father played.
  const shop=B.stand(butcherShop('c-shop',1.75,1.45),-3.55,-1.25,{layer:1,s:0});
  const goalV=B.stand(S.goal(F+'c-vgoal',1.05,.7),-1.15,-1.9,{layer:1,s:0});
  const dad=P('c-dad',-2.6,-.1,1.5,{shirt:'casual',hair:'short',skin:HERO_SKIN,adult:true,beard:true,legs:'kick',face:'smile',layer:2});
  const dadBall=B.stand(S.ball(F+'c-dball',.12),-2.15,.02,{layer:2,tab:false,s:0});B.slot(-2.15,.02,-1.25,-1.55);
  const dadTag=dad.body.add(twoLine('c-tagD',1.0,.44,'FALCÃO','DAD · JOÃO',INK.yellow,INK.navy),0,1.72,{z:-.02});
  const kid=P('c-kid',-1.75,.85,1.1,{shirt:'casual',hair:'short',skin:HERO_SKIN,legs:'kick',face:'grin',layer:3});
  const kidBall=B.stand(futsalBall('c-kball',.1),-1.36,.98,{layer:3,tab:false,s:0});
  const kidTag=kid.body.add(twoLine('c-tagK',.9,.42,'FALCÃO','SON',INK.pink),0,1.3,{z:-.02});
  // Right page: the futsal club, the grass game he kept trying, and the tally of tries.
  const teen=P('c-teen',1.7,.75,1.22,{shirt:'bib',hair:'short',skin:HERO_SKIN,legs:'kick',face:'smile',layer:3});
  const teenBall=B.stand(futsalBall('c-tball',.1),2.1,.9,{layer:3,tab:false,s:0});
  const tally=B.stand(S.scoreboard(F+'c-tally',1.2,1.25,'GRASS TRIES'),1.0,-2.05,{layer:1,s:0});
  tally.add(S.flipCard(F+'c-n7',.8,.55,'7',INK.pink),0,.38,{z:.01});
  const cards=[0,1,2,3,4,5,6].map(i=>tally.flap(S.flipCard(F+`c-n${i}`,.8,.55,String(i),i%2?INK.pink:INK.blue),0,.93,{z:.014+(7-i)*.003}));
  const grass=B.stand(grassBoard('c-grass',1.8,1.2),3.3,-1.35,{layer:1,s:0});
  const wallR=B.stand(wallBoard('c-wallR',2.2,.3),2.7,-1.7,{layer:1,tab:false,s:0});
  const goalR=B.stand(S.goal(F+'c-goalR',1.2,.8),4.2,-.35,{layer:1,yaw:-.55,s:0});
  const keeper=P('c-keep',3.95,-.1,1.12,{shirt:'keeper',hair:'short',skin:'#d99a6c',holdL:'glove',holdR:'glove',face:'grin',layer:2});
  const mates=[P('c-m1',2.7,-.85,1.12,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'grin',layer:2}),P('c-m2',3.3,.45,1.14,{shirt:'bib',hair:'long',skin:'#f1b88f',face:'grin',layer:2})];
  const tryT=[29.2,30.5,31.8,33.1,34.4,35.7,37.0];
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   sunP.dy=-.55*beat(t,0,2.6);cloud.dx=.7*beat(t,0,44)-.2;
   // The boy in the north of São Paulo.
   kid.body.s=pop(t,2.6);kidBall.s=pop(t,3.0);const kp=taps(t,[3.9,4.7,5.5,6.3],.45);kid.leg!.rot=-.7*kp;kidBall.dy=.06*kp;kidBall.rot=-t*.8;
   // His father: a butcher who played on neighbourhood fields.
   shop.s=pop(t,7.3);dad.body.s=pop(t,7.9);dadBall.s=pop(t,8.6);goalV.s=pop(t,9.2);
   const dk=beat(t,10.9,11.8);dadBall.x=-2.15+.9*dk;dadBall.z=.02-1.57*dk;dadBall.rot=-dk*7;dad.leg!.rot=-1.0*pulse(t,10.3,11.1)-.4*taps(t,[9.6],.5);
   dad.armL.rot=-.12-.4*pulse(t,10.3,11.4);
   // People called him Falcão, and his son was given the same name.
   dadTag.visible=t>12.9;dadTag.dy=-.55+.55*beat(t,12.9,13.7);kidTag.visible=t>15.9;kidTag.dy=-.5+.5*beat(t,15.9,16.7);
   dad.armR.rot=.12+1.25*beat(t,15.6,16.4)-1.25*beat(t,18.4,19.2);
   // Guapira at twelve: the small futsal club near home.
   gua.scale=pop(t,18.3,1);gua.visible=gua.scale>.02;const A=act>0?1:0;teen.body.s=Math.max(pop(t,18.9),A);teenBall.s=Math.max(pop(t,19.3),A);
   const tp=taps(t,[20.2,21,21.8,22.6],.45);teen.leg!.rot=-.7*tp;teenBall.dy=.05*tp;
   // Corinthians: trying the big grass game again and again, seven times, then back to futsal.
   const open=(i:number)=>Math.max(N?beat(t,37.5+i*.25,38.3+i*.25):0,clamp01(act*2.2-i*.14));
   tally.s=pop(t,23.6);grass.s=pop(t,24.3)*(1-open(0));
   const trip=taps(t,tryT,1.1);cards.forEach((c,i)=>{c.flip=t>=tryT[i]?-2.9:0;});void count;
   teen.body.x=1.7+1.25*trip;teen.body.z=.75-.85*trip;teenBall.x=teen.body.x+.4;teenBall.z=teen.body.z+.15;teenBall.visible=trip<.15;
   wallR.s=open(0);goalR.s=open(1);keeper.body.s=open(2);mates.forEach((m,i)=>{m.body.s=open(3+i);});back.scale=open(4);back.visible=back.scale>.02;
   const cheer=Math.max(N?beat(t,38.9,39.6):0,clamp01(act*2-1));teen.armL.rot=-.12-2.3*cheer;teen.armR.rot=.12+2.3*cheer;
   mates.forEach((m,i)=>{m.armL.rot=-.12-2.3*cheer*(i%2?1:.4);m.armR.rot=.12+2.3*cheer;});keeper.armL.rot=-.12-.6*cheer;
   if(N)return -.7*beat(t,2.2,3.2)+1.4*beat(t,18,19)-.7*beat(t,38.4,39.4);
   return act>0?.5:0;
  };
 }};

/* ═════════════ 2 · Doors that stayed shut (sole, 3 knocks) ═════════════ */
const soleSpread:SpreadDef={id:'sole',rest:28.8,
 left:k=>{street(k);word(k,'NEW CLUBS',-2.15,Z(2.45),.48,INK.yellow,2.8);k.text('2001 · 2002 · KEEP KNOCKING',-2.15,Z(2.78),.16,INK.navy,{weight:800,max:2.9});},
 right:k=>{court(k,'R');word(k,'JARAGUÁ',2.15,Z(2.45),.46,INK.pink,2.8);k.text('2003 · THE TEAM WHERE HE SETTLED',2.15,Z(2.78),.15,INK.white,{weight:800,max:2.9});},
 build:B=>{
  const bd=B.vfold({key:F+'s-bdL',w:4.5,h:3,paint:k=>saoPaulo(k,4.5,3)},{key:F+'s-bdR',w:4.5,h:3,paint:k=>hall(k,4.5,3,{bars:true})},-3.05,1.22);
  const jb=bd.add(S.banner(F+'s-jb',2.2,.4,'JARAGUÁ · 2003',INK.blue),'R',2.0,2.05,{out:.02});
  const birds=bd.add(S.birds(F+'s-birds',.9,.35),'L',2.2,2.3,{out:.02});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  const d1=B.stand(doorFrame('s-d1',1.45,1.6,'PALMEIRAS','2001 · TRIAL','#2f6b4f','grass'),-3.85,-1.1,{layer:1,s:0});
  const l1=d1.flap(doorLeaf('s-l1',.87,1.12,'#3f9567'),-.435,0,{anchor:'bl',axis:'y'});
  const d2=B.stand(doorFrame('s-d2',1.45,1.6,'PORTUGUESA','2002',INK.red,'grass'),-1.55,-1.85,{layer:1,s:0});
  const l2=d2.flap(doorLeaf('s-l2',.87,1.12,'#c4473d'),-.435,0,{anchor:'bl',axis:'y'});
  const d3=B.stand(doorFrame('s-d3',1.6,1.75,'JARAGUÁ','2003',INK.blue,'court'),2.2,-1.75,{layer:1,s:0});
  const l3=d3.flap(doorLeaf('s-l3',.96,1.225,INK.navy),-.48,0,{anchor:'bl',axis:'y'});
  const hero=P('s-hero',-4.3,.7,1.32,{shirt:'bib',hair:'bald',skin:HERO_SKIN,holdR:'suitcase',legs:'kick',face:'smile',layer:3});
  const praise=hero.body.add(S.bubble(F+'s-praise',.6,.5,'star'),.55,1.62,{z:-.02}),noAns=hero.body.add(S.bubble(F+'s-noans',.6,.5,'dots'),.55,1.62,{z:-.024});
  const arrows=[0,1,2].map(i=>B.stand(S.arrow(F+`s-arr${i}`,.62,.3),-4.3+i*.8,1.8,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(F+'s-ball',.1),-3.0,.2,{layer:3,tab:false,s:0});B.slot(-3.0,.2,-3.8,-.8);
  const futSign=B.stand(S.sign(F+'s-fs',.95,.8,'FUTSAL',INK.yellow),-.55,.35,{layer:2,s:0});
  const crosses=[B.stand(S.icon(F+'s-x1',.3,'cross'),-3.25,-.5,{layer:2,s:0,tab:false}),B.stand(S.icon(F+'s-x2',.3,'cross'),-1.0,-1.1,{layer:2,s:0,tab:false})];
  // Right page: behind the third door, a futsal team.
  const heroJ=P('s-heroJ',1.5,.75,1.32,{shirt:'bib',hair:'bald',skin:HERO_SKIN,legs:'kick',face:'grin',layer:3});
  const jBall=B.stand(futsalBall('s-jball',.1),1.9,.9,{layer:3,tab:false,s:0});
  const goal=B.stand(S.goal(F+'s-goal',1.15,.76),4.25,-.4,{layer:1,yaw:-.55,s:0});
  const mates=[P('s-m1',3.4,.25,1.14,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'grin',layer:2}),P('s-m2',2.75,1.35,1.14,{shirt:'bib',hair:'short',skin:'#f1b88f',face:'grin',layer:3}),
   P('s-gk',4.0,-.15,1.1,{shirt:'keeper',hair:'short',skin:'#d99a6c',holdL:'glove',holdR:'glove',face:'grin',layer:2})];
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   birds.dx=.9*beat(t,0,44);
   // Changing teams again and again: the suitcase walk.
   const walk=beat(t,2.3,6.1);arrows.forEach((a,i)=>{a.s=pop(t,2.7+i*1.0,.6);});
   let hx=-4.3+.8*walk,hz=.7;hero.body.dy=.05*Math.abs(Math.sin(t*6))*pulse(t,2.3,6.3);
   // 2001: Palmeiras' door opens onto grass; he scores; praise, then no clear answer, and the door shuts.
   const A=act>0?1:0;d1.s=Math.max(pop(t,6.3),A);l1.flip=-1.75*(beat(t,7.3,8.2)-beat(t,18.2,19.1));
   const to1=beat(t,8.3,9.6)-beat(t,20.1,21.3);hx+=(-3.35-hx)*to1;hz+=(.1-hz)*to1;
   ball.s=pop(t,9.4,.5)*(t<13.4?1:0);const sh=beat(t,12.5,13.3);ball.x=-3.0-.8*sh;ball.z=.2-1.0*sh;ball.rot=sh*6;hero.leg!.rot=-1.05*pulse(t,12.1,12.8);
   praise.visible=t>13.3&&t<16.6;praise.dy=-.5+.5*beat(t,13.3,13.9);
   noAns.visible=(t>16.6&&t<20)||(t>25.4&&t<28.6);noAns.dy=-.5+.5*Math.max(beat(t,16.6,17.2),beat(t,25.4,26));
   // Back to his futsal team.
   futSign.s=pop(t,20.3);hx+=(-2.6-hx)*beat(t,20.2,21.3)*(1-to1);hz+=(.6-hz)*beat(t,20.2,21.3)*(1-to1);
   // 2002: Portuguesa, and again it did not work out.
   d2.s=Math.max(pop(t,22.9),A);l2.flip=-1.75*(beat(t,23.9,24.7)-beat(t,26.8,27.6));const to2=beat(t,23.2,24.4)-beat(t,27.4,28.5);hx+=(-1.95-hx)*to2;hz+=(-.45-hz)*to2;
   // Knock on the three doors: two stay shut, the third opens at Jaraguá.
   const pN=N?beat(t,29.3,30.2)+beat(t,31.5,32.3)+beat(t,33.5,34.5):0,p=Math.max(pN,act*3);
   const k1=pulse(p,0,1),k2=pulse(p,1,2),k3=pulse(p,2,3);
   d1.dx=.035*Math.sin(p*40)*k1;d2.dx=.035*Math.sin(p*40)*k2;
   crosses[0].s=beat(p,.55,1);crosses[1].s=beat(p,1.55,2);
   d3.s=Math.max(N?pop(t,28.9):1,A);l3.flip=-1.8*clamp01(p-2);jb.scale=beat(p,2.3,3);jb.visible=jb.scale>.02;
   hero.armL.rot=-.12-2.1*Math.max(k1,k2,k3);
   hero.body.x=hx;hero.body.z=hz;hero.body.s=Math.max(pop(t,.8),A)*(1-beat(p,2.35,2.9));
   heroJ.body.s=beat(p,2.45,3);jBall.s=beat(p,2.55,3);goal.s=beat(p,2.2,2.8);mates.forEach((m,i)=>{m.body.s=beat(p,2.4+i*.15,2.9+i*.12);});
   const jt=taps(t,[35.6,36.4,37.2,38],.45);heroJ.leg!.rot=-.7*jt;jBall.dy=.05*jt;jBall.x=1.9+.5*beat(t,35.4,38.4);heroJ.body.x=1.5+.5*beat(t,35.4,38.4);
   const cheer=Math.max(N?beat(t,40.3,41):0,N?0:clamp01(act*3-2));
   heroJ.armL.rot=-.12-2.3*cheer;heroJ.armR.rot=.12+2.3*cheer;mates.forEach((m,i)=>{m.armL.rot=-.12-2.2*cheer;m.armR.rot=.12+2.2*cheer*(i===2?.4:1);});
   if(N)return -.6*beat(t,2.1,3)+.6*beat(t,28.6,29.4)+.6*beat(t,33.4,34.4)-.6*beat(t,40.1,41);
   return act>.66?.4:0;
  };
 }};

/* ═════════════ 3 · A dream for Dad (golden) ═════════════ */
const goldenSpread:SpreadDef={id:'golden',rest:30.9,
 left:k=>{homeFloor(k);word(k,"DAD'S DREAM",-2.15,Z(2.45),.44,INK.yellow,2.8);k.text('A BIG GRASS PITCH',-2.15,Z(2.76),.16,INK.navy,{weight:800,max:2.9});},
 right:k=>{grassPage(k,'R');word(k,'ON GRASS',2.15,Z(2.45),.46,INK.pink,2.8);k.text('2005 · 13 GAMES · ABOUT 6 MONTHS',2.15,Z(2.76),.15,INK.white,{weight:800,max:2.9});},
 build:B=>{
  const bd=B.vfold({key:F+'g-bdL',w:4.5,h:3,paint:k=>home(k,4.5,3)},{key:F+'g-bdR',w:4.5,h:3,paint:k=>arena(k,4.5,3,SPFC,2,'#5f9e4a')},-3.05,1.22);
  const cloud=bd.add(S.cloud(F+'g-rain',1.1,.48),'L',2.3,2.2,{out:.03}),drops=bd.add(S.drops(F+'g-drops',.9,.62),'L',2.3,1.55,{out:.028});
  const sunL=bd.add(S.sun(F+'g-sun',.36),'L',1.0,2.05,{out:.02});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  const chair=B.stand(armchair('g-chair',1.15,1.05),-3.55,-1.35,{layer:1,s:0});
  const frame=B.stand(portrait('g-frame',.95,1.2),-2.05,-1.85,{layer:1,s:0});
  const dream=frame.add(dreamBubble('g-dream',1.3,.9),.85,1.15,{z:-.01});
  const hero=P('g-hero',-1.35,.35,1.35,{shirt:'casual',hair:'bald',skin:HERO_SKIN,face:'sad',layer:3});
  const heart=hero.body.add(S.bubble(F+'g-heart',.6,.5,'heart'),-.55,1.62,{z:-.02});
  const pl=B.stand(plinth('g-plinth',.6,.6),-3.9,.95,{layer:3,s:0});const gb=pl.add(S.goldenBall(F+'g-gb',.16),0,.6,{z:.01});
  const best=B.stand(twoLine('g-best',1.15,.46,'BEST IN THE','WORLD · 2004',INK.blue),-2.85,1.85,{layer:3,s:0});
  // Right page: a big grass pitch, 2005.
  const contract=B.stand(twoLine('g-spfc',1.25,.52,'SÃO PAULO','2005',INK.red),1.3,-1.95,{layer:1,s:0});
  const yearCard=B.stand(twoLine('g-year',1.25,.52,'ONE YEAR','LATER',INK.navy),3.45,-1.45,{layer:1,s:0});
  const goal=B.stand(S.goal(F+'g-goal',1.15,.76),4.25,-.45,{layer:1,yaw:-.55,s:0});
  const heroG=P('g-heroG',2.15,.3,1.35,{shirt:'ger',hair:'bald',skin:HERO_SKIN,legs:'kick',face:'smile',layer:3});
  const gBall=B.stand(S.ball(F+'g-ball',.11),2.55,.45,{layer:3,tab:false,s:0});B.slot(2.55,.45,3.95,-.3);
  const fBall=B.stand(futsalBall('g-fball',.1),1.7,.5,{layer:3,tab:false,s:0});
  const note=B.stand(S.noteCard(F+'g-note',.8,.9,["DAD'S",'DREAM']),4.3,1.35,{layer:3,s:0});
  const games=B.stand(twoLine('g-games',1.1,.46,'13 GAMES','ABOUT 6 MONTHS',INK.pink),1.1,1.75,{layer:3,s:0});
  const post=B.stand(S.post(F+'g-post',.12,1.3),3.0,1.55,{layer:3,s:0});
  post.add(signArrow('g-fut',1.05,.34,'FUTSAL',INK.yellow,'L'),0,.72,{z:.012});
  const grassArrow=post.flap(signArrow('g-grs',1.05,.34,'GRASS',INK.leaf,'R',INK.white),0,1.06,{z:.022});
  const brave=heroG.body.add(S.bubble(F+'g-brave',.6,.5,'star'),.55,1.62,{z:-.02});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   // Early in 2004 his father died: an empty chair, a photo, a rain cloud.
   frame.s=pop(t,2.1);chair.s=pop(t,2.6);hero.body.s=pop(t,3.2);
   const clear=beat(t,40.8,42.6);cloud.dx=-1.6*clear;drops.visible=clear<.3;drops.dy=-.06*((t*.9)%1)*(1+beat(t,15.3,16))-.1*clear;
   sunL.scale=beat(t,40.9,41.9);sunL.visible=sunL.scale>.02;
   // His dad's dream: football on a big grass pitch.
   dream.scale=beat(t,6.1,7.1)*(1-beat(t,19.2,20));dream.visible=dream.scale>.02;
   hero.armL.rot=-.12-.9*beat(t,7.4,8.2)+.9*beat(t,10.6,11.2);
   // That year he was named best in the world, and still, a deep sadness.
   pl.s=pop(t,11.5);gb.dy=-.5+.5*beat(t,11.9,12.8);gb.visible=t>11.8;best.s=pop(t,12.6);
   hero.armR.rot=.12+.5*beat(t,15.4,16.4)-.5*beat(t,19.4,20.2);
   // 2005: São Paulo signs him to play on grass.
   const A=act>0?1:0;contract.s=Math.max(pop(t,20.5),A);goal.s=Math.max(pop(t,21),A);heroG.body.s=Math.max(pop(t,21.4),A);gBall.s=pop(t,21.8);
   const dt=taps(t,[22.8,23.5,24.2],.45),kick=beat(t,24.6,25.4);heroG.leg!.rot=-.6*dt-1.05*pulse(t,24.3,25);gBall.x=2.55+1.4*kick;gBall.z=.45-.75*kick;gBall.rot=-kick*8;gBall.visible=t<29.5||!N;
   // His first game came exactly one year after his father died.
   yearCard.s=pop(t,26.1);note.s=pop(t,27.2);note.dy=.04*wave(t,28,35,1);
   // Thirteen games, about six months, then back to futsal (turn the signpost).
   games.s=pop(t,30.5);post.s=Math.max(pop(t,30.1),N?0:1,A);
   const turn=Math.max(N?beat(t,32.4,33.4):0,act);grassArrow.flip=-2.85*turn;
   heroG.body.x=2.15-.75*turn;fBall.s=beat(turn,.5,1);fBall.x=heroG.body.x-.42;
   heroG.armR.rot=.12+1.1*pulse(turn,0,1)+.9*(N?beat(t,35.6,36.3)-beat(t,39.6,40.2):0);
   brave.visible=N&&t>35.7&&t<40.4;brave.dy=-.5+.5*beat(t,35.7,36.3);
   // It is okay to feel sad and to talk about someone you miss: the cloud clears.
   heart.visible=N&&t>40.8;heart.dy=-.5+.5*beat(t,40.8,41.5);
   if(N)return -.6*beat(t,1.9,2.9)+1.2*beat(t,20.2,21.2)-.6*beat(t,40.3,41.2);
   return act>0?.55:0;
  };
 }};

/* ═════════════ 4 · So close, again and again (twelve, 2000–2008) ═════════════ */
const twelveSpread:SpreadDef={id:'twelve',rest:31.3,
 left:k=>{court(k,'L');word(k,'SO CLOSE',-2.15,Z(2.45),.46,INK.yellow,2.8);k.text('2000 · 2004 · THE WAIT WENT ON',-2.15,Z(2.76),.15,INK.white,{weight:800,max:2.9});},
 right:k=>{court(k,'R');word(k,'BRAZIL 2008',2.15,Z(2.45),.4,INK.pink,2.8);k.text('CHAMPIONS AT HOME',2.15,Z(2.76),.16,INK.white,{weight:800,max:2.9});},
 build:B=>{
  const bd=B.vfold({key:F+'w-bdL',w:4.5,h:3,paint:k=>arena(k,4.5,3,MIX,2)},{key:F+'w-bdR',w:4.5,h:3,paint:k=>arena(k,4.5,3,BRA,4)},-3.05,1.22);
  const ban=bd.add(S.banner(F+'w-ban',2.4,.4,'FUTSAL WORLD CUP',INK.blue),'L',2.0,1.5,{out:.02});
  const host=bd.add(S.banner(F+'w-host',1.7,.4,'BRAZIL 2008',INK.yellow,INK.navy),'R',3.3,2.0,{out:.02});
  const conf=bd.add(S.confetti(F+'w-conf',1.8,1.2,2),'R',2.4,1.2,{out:.035}),conf2=bd.add(S.confetti(F+'w-conf2',1.6,1.2,5),'L',1.2,1.2,{out:.035});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  const age=B.stand(twoLine('w-age',1.2,.48,'FIRST WORLD CUP','2000 · AGE 23',INK.blue),-4.0,1.75,{layer:3,s:0});
  const hero=P('w-hero',-2.55,.45,1.34,{shirt:'bib',hair:'bald',skin:HERO_SKIN,face:'smile',layer:3}),heroS=P('w-heroS',-2.55,.45,1.34,{shirt:'bib',hair:'bald',skin:HERO_SKIN,face:'sad',layer:3});
  const b00=B.stand(S.scoreboard(F+'w-b00',1.5,1.3,'2000 FINAL'),-3.75,-1.2,{layer:1,s:0});
  b00.add(twoLine('w-b00r',1.26,.6,'SPAIN WIN','4 – 3',INK.pink),0,.36,{z:.01});const f00=b00.flap(twoLine('w-b00f',1.26,.6,'BRAZIL','v SPAIN',INK.blue),0,.96,{z:.02});
  const b04=B.stand(S.scoreboard(F+'w-b04',1.5,1.3,'2004'),-1.45,-2.0,{layer:1,s:0});
  b04.add(twoLine('w-b04r',1.26,.6,'BRAZIL','THIRD',INK.teal),0,.36,{z:.01});const f04=b04.flap(twoLine('w-b04f',1.26,.6,'BEST','PLAYER',INK.yellow,INK.navy),0,.96,{z:.02});
  const pl=B.stand(plinth('w-pl',.55,.55),-1.0,.75,{layer:2,s:0});const gb04=pl.add(S.goldenBall(F+'w-gb04',.15),0,.55,{z:.01});
  const glass=B.stand(hourglass('w-glass',.36,.55),-4.3,.25,{layer:2,s:0});
  // Right page: 2008 at home.
  const board=B.stand(S.scoreboard(F+'w-b08',2.3,1.75,'2008 · AT HOME'),1.65,-1.8,{layer:1,s:0});
  board.add(resultFlap('w-res',2.0,1.02,'BRAZIL 2008','CHAMPIONS','AT HOME',INK.pink),0,.3,{z:.01});
  const flap=board.flap(resultFlap('w-flap',2.0,1.02,'WORLD CUP','BRAZIL','FLIP TO SEE'),0,1.32,{z:.022});
  const heroR=P('w-heroR',2.55,.55,1.34,{shirt:'bib',hair:'bald',skin:HERO_SKIN,face:'open',layer:3});
  const worry=heroR.body.add(S.bubble(F+'w-worry',.6,.5,'dots'),.55,1.62,{z:-.02});
  const gb08=heroR.body.add(S.goldenBall(F+'w-gb08',.15),0,.66,{z:.03});
  const shirt=B.stand(shirtPlate('w-shirt',.62,.62,'12'),3.55,1.25,{layer:3,s:0});
  const team=[P('w-t1',1.25,1.2,1.1,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'open',layer:3}),P('w-t2',3.6,.1,1.1,{shirt:'bib',hair:'short',skin:'#f1b88f',face:'open',layer:2}),
   P('w-t3',4.3,1.35,1.1,{shirt:'bib',hair:'long',skin:'#d99a6c',face:'open',layer:3}),P('w-gk',1.1,-.3,1.1,{shirt:'keeper',hair:'short',skin:'#d99a6c',holdL:'glove',holdR:'glove',face:'open',layer:2})];
  const again=B.stand(S.banner(F+'w-again',2.0,.4,'TRY AGAIN',INK.pink),-2.4,2.05,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   ban.scale=pop(t,.3,1);ban.visible=ban.scale>.02;
   // 2000, aged 23.
   hero.body.s=pop(t,2.9)*(1-beat(t,11,11.6));age.s=pop(t,3.6);
   // Brazil reached the final but lost to Spain, 4–3.
   b00.s=pop(t,7.8);f00.flip=-2.9*beat(t,10.2,11);heroS.body.s=beat(t,11.2,11.9);
   // 2004: best player of the tournament, yet Brazil finished third.
   b04.s=pop(t,12.4);pl.s=pop(t,13.2);gb04.dy=-.5+.5*beat(t,13.6,14.5);gb04.visible=t>13.5;f04.flip=-2.9*beat(t,16.2,17);
   // The wait went on.
   glass.s=pop(t,19);glass.rot=Math.PI*beat(t,19.6,21);
   // 2008 at home, and the pressure he spoke about.
   host.scale=pop(t,21.7,1);host.visible=host.scale>.02;const A=act>0?1:0;board.s=Math.max(pop(t,22.1),A);heroR.body.s=Math.max(pop(t,22.7),A);
   shirt.s=pop(t,25.9);shirt.dy=.05*wave(t,26.5,31,1.2);worry.visible=t>26.4&&t<31.4;worry.dy=-.5+.5*beat(t,26.4,27);
   // Flip the scoreboard: champions at home.
   const lift=Math.max(N?beat(t,31.6,32.6):0,act);flap.flip=-2.75*lift;
   conf.visible=conf2.visible=lift>.3;conf.dy=conf2.dy=-1+1.1*clamp01(lift*1.4-.3);
   const up=Math.max(N?beat(t,33.4,34.1):0,clamp01(act*2-.8));
   team.forEach((p,i)=>{p.body.s=Math.max(N?beat(t,32.8+i*.25,33.5+i*.25):0,clamp01(act*2.4-.6-i*.1));p.armL.rot=-.12-2.3*up;p.armR.rot=.12+2.3*up;});
   // Best player of the tournament once more.
   gb08.visible=N&&t>36;gb08.dy=-.5+1.05*beat(t,36.1,37.2);const hold=N?beat(t,36.6,37.3):0;
   heroR.armL.rot=-.12-2.35*Math.max(up,hold);heroR.armR.rot=.12+2.35*Math.max(up,hold);
   again.s=N?pop(t,40.1):0;
   if(N)return -.6*beat(t,2.4,3.3)+1.2*beat(t,21.5,22.4)-.6*beat(t,39.8,40.6);
   return act>0?.55:0;
  };
 }};

/* ═════════════ 5 · Hurt, but not alone (record, 2012) ═════════════ */
const recordSpread:SpreadDef={id:'record',rest:30.6,
 left:k=>{court(k,'L',{dim:true});word(k,'THAILAND 2012',-2.15,Z(2.45),.4,INK.yellow,2.8);k.text('DAYS BEFORE THE WORLD CUP',-2.15,Z(2.76),.16,INK.white,{weight:800,max:2.9});},
 right:k=>{court(k,'R');word(k,'THE FINAL',2.15,Z(2.45),.44,INK.pink,2.8);k.text('37 MINUTES IN THE WHOLE TOURNAMENT',2.15,Z(2.76),.14,INK.white,{weight:800,max:3.0});},
 build:B=>{
  const bd=B.vfold({key:F+'r-bdL',w:4.5,h:3,paint:k=>hall(k,4.5,3,{bars:true})},{key:F+'r-bdR',w:4.5,h:3,paint:k=>arena(k,4.5,3,MIX,6)},-3.05,1.22);
  const clock=bd.add(clockFace('r-clock',.36,'3 MIN LEFT'),'R',3.4,1.05,{out:.02}),clockHand=bd.add(hand('r-chand',.06,.28,INK.pink),'R',3.4,1.05+.86-.36,{out:.03});
  const conf=bd.add(S.confetti(F+'r-conf',2.4,1.3,5),'R',2.2,.9,{out:.035});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  // Left page: the injury, the squad list, the coaches who kept him.
  const hero=P('r-hero',-2.55,.45,1.36,{shirt:'bib',hair:'bald',skin:HERO_SKIN,face:'sad',layer:3});
  const wrap=hero.body.add(bandage('r-wrap',.2,.1),-.1,.24,{z:.02});
  const stress=hero.body.add(S.cloud(F+'r-stress',.72,.32),0,1.75,{z:-.02}),sdrops=hero.body.add(S.drops(F+'r-sdrops',.5,.3),0,1.48,{z:-.024});
  const calf=B.stand(twoLine('r-calf',1.05,.46,'LEFT CALF','HURT',INK.pink),-1.2,1.8,{layer:3,s:0});
  const squad=B.stand(kidBoard('r-squad',1.4,1.45,'THE SQUAD'),-3.8,-1.2,{layer:1,s:0});
  squad.add(S.flipCard(F+'r-sq0',1.2,.26,'· · · · ·',INK.blue),0,.38,{z:.01});
  const card12=squad.flap(S.flipCard(F+'r-sq12',1.2,.3,'12 · FALCÃO',INK.yellow,INK.navy),0,1.02,{z:.02});
  const treat=B.stand(twoLine('r-treat',1.25,.5,'INTENSIVE','TREATMENT',INK.teal),-1.45,-1.85,{layer:1,s:0});
  const c1=P('r-c1',-4.0,.25,1.45,{shirt:'coach',hair:'short',skin:'#f1b88f',adult:true,face:'smile',layer:2}),c2=P('r-c2',-1.35,-.55,1.45,{shirt:'coach',hair:'cap',skin:'#7f5138',adult:true,face:'smile',layer:2});
  const care=c1.body.add(S.bubble(F+'r-care',.6,.5,'heart'),.55,1.85,{z:-.02});
  // Right page: the final.
  const watch=B.stand(stopwatch('r-watch',.3,'37 MIN'),.95,1.95,{layer:3,s:0});const needle=watch.arm(hand('r-needle',.05,.22),0,.39,{z:.012});
  const board=B.stand(S.scoreboard(F+'r-board',1.9,1.5,'FINAL · BRAZIL v SPAIN'),1.45,-2.1,{layer:1,s:0});
  board.add(twoLine('r-win',1.6,.72,'BRAZIL','WIN 3 – 2',INK.yellow,INK.navy),0,.3,{z:.01});
  const cards=['BEHIND','LEVEL','EXTRA TIME'].map((l,i)=>board.flap(twoLine(`r-l${i}`,1.6,.72,l,'',[INK.blue,INK.pink,INK.teal][i]),0,1.02,{z:.014+(3-i)*.004}));
  const goal=B.stand(S.goal(F+'r-goal',1.15,.76),4.25,-.45,{layer:1,yaw:-.55});void goal;
  const keeper=P('r-keeper',3.95,-.2,1.12,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',holdL:'glove',holdR:'glove',layer:2});
  const defs=[P('r-d1',3.0,-.9,1.12,{shirt:'navy',hair:'curly',skin:'#f1b88f',face:'open',layer:1}),P('r-d2',3.1,.55,1.14,{shirt:'navy',hair:'long',skin:'#b27650',face:'open',layer:2})];
  const heroF=P('r-heroF',1.55,.6,1.34,{shirt:'bib',hair:'bald',skin:HERO_SKIN,legs:'kick',face:'smile',layer:3});
  const neto=P('r-neto',2.25,1.4,1.22,{shirt:'bib',hair:'curly',skin:'#7f5138',legs:'kick',face:'smile',layer:3});
  const netoTag=neto.body.add(twoLine('r-netoT',.62,.3,'NETO','',INK.navy),.0,1.36,{z:-.02});
  const s1=B.stand(futsalBall('r-s1',.1),1.95,.75,{layer:3,tab:false,s:0});B.slot(1.95,.75,3.95,-.35);
  const s2=B.stand(futsalBall('r-s2',.1),2.62,1.5,{layer:3,tab:false,s:0});B.slot(2.62,1.5,3.95,-.1);
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   // Days before the World Cup: a hurt left calf; nearly left out.
   hero.body.s=pop(t,2.2);wrap.visible=t>4.6;wrap.scale=beat(t,4.6,5.2);calf.s=pop(t,5.4);
   squad.s=pop(t,6.6);const wob=beat(t,7.6,8.4)-beat(t,10.6,11.4);card12.flip=-.95*wob+.12*wave(t,8.4,10.6,1.3);
   // The coaches insisted he stay, with intensive treatment.
   c1.body.s=pop(t,10.4);c2.body.s=pop(t,10.8);c1.armR.rot=.12+1.0*beat(t,11,11.8);c2.armL.rot=-.12-1.1*beat(t,11.4,12.2);
   treat.s=pop(t,12.6);care.visible=t>13.2&&t<37.3;care.dy=-.5+.5*beat(t,13.2,13.9);
   // The stress: a small cloud, for a while.
   const sc=beat(t,15.4,16.2)*(1-beat(t,19.2,20));stress.scale=sc;stress.visible=sc>.02;sdrops.visible=sc>.6;sdrops.dy=-.05*((t*1.1)%1);
   // Only 37 minutes in the whole tournament.
   const A=act>0?1:0;watch.s=pop(t,20);needle.rot=Math.PI+Math.PI*2*.62*beat(t,20.8,23.2);heroF.body.s=Math.max(pop(t,20.4),A);
   // The final: behind with three minutes left.
   board.s=Math.max(pop(t,23.8),A);keeper.body.s=Math.max(pop(t,24.2),A);defs.forEach((d,i)=>{d.body.s=pop(t,24.4+i*.3);});neto.body.s=pop(t,24.9);
   clock.scale=pop(t,25.6);clock.visible=clock.scale>.02;clockHand.visible=clock.visible;clockHand.rot=-Math.PI*.3*beat(t,26,29);
   s1.s=Math.max(pop(t,26.3,.5),N?0:1,A);
   // Score the equaliser (Coach Bella or the reader).
   const eq=Math.max(N?beat(t,31.1,32.1):0,act);s1.x=1.95+2.0*eq;s1.z=.75-1.1*eq;s1.rot=-eq*8;
   heroF.leg!.rot=-1.15*Math.max(N?pulse(t,30.6,31.4):0,act>0&&act<1?pulse(act,0,.5):0);
   const dive=Math.max(N?pulse(t,31.5,32.6):0,act>0&&act<1?pulse(act,.4,1):0,N?pulse(t,35.3,36.3):0);keeper.body.rot=-.85*dive;keeper.armL.rot=-.12-2.3*dive;keeper.armR.rot=.12+2.3*dive;
   cards[0].flip=-2.9*clamp01(eq*1.6-.6);cards[1].flip=N?-2.9*beat(t,33.2,33.8):0;
   // Then Neto wins it in extra time, 3–2.
   s2.s=N?pop(t,33.6,.5):0;const w2=N?beat(t,34.9,35.7):0;s2.x=2.62+1.33*w2;s2.z=1.5-1.6*w2;s2.rot=-w2*8;neto.leg!.rot=-1.1*(N?pulse(t,34.4,35.2):0);
   cards[2].flip=N?-2.9*beat(t,36,36.6):0;netoTag.visible=N&&t>34;
   const cheer=Math.max(clamp01(eq*2-1)*(N&&t>32.9&&t<36.6?0:1),N?beat(t,36.6,37.3):0);
   heroF.armL.rot=-.12-2.3*cheer;heroF.armR.rot=.12+2.3*cheer;neto.armL.rot=-.12-2.3*(N?beat(t,36,36.7):0);neto.armR.rot=.12+2.3*(N?beat(t,36,36.7):0);
   conf.visible=cheer>.2;conf.dy=-1+1.1*cheer;
   // A team can carry you through: the coaches celebrate too.
   const all=N?beat(t,37.6,38.3):0;c1.armL.rot=-.12-2.3*all;if(all>0){c1.armR.rot=.12+2.3*all;c2.armL.rot=-.12-2.3*all;c2.armR.rot=.12+2.3*all;}
   hero.armL.rot=-.12-2.3*all;hero.armR.rot=.12+2.3*all;
   if(N)return -.6*beat(t,2,2.9)+1.2*beat(t,19.7,20.6)-.6*beat(t,37.2,38);
   return act>0?.55:0;
  };
 }};

/* ═════════════ 6 · One last World Cup (play, 2016) ═════════════ */
const playSpread:SpreadDef={id:'play',rest:29.6,
 left:k=>{court(k,'L');word(k,'COLOMBIA 2016',-2.15,Z(2.62),.36,INK.yellow,2.8);k.text('10 GOALS · 48 IN WORLD CUP HISTORY',-2.15,Z(2.92),.14,INK.white,{weight:800,max:3.0});},
 right:k=>{court(k,'R');word(k,'RESPECT',2.15,Z(2.55),.42,INK.pink,2.8);k.text('EVEN THE OTHER TEAM HONOURED HIM',2.15,Z(2.85),.14,INK.white,{weight:800,max:3.0});},
 build:B=>{
  const bd=B.vfold({key:F+'p-bdL',w:4.5,h:3,paint:k=>arena(k,4.5,3,MIX,3)},{key:F+'p-bdR',w:4.5,h:3,paint:k=>arena(k,4.5,3,IRAN,7)},-3.05,1.22);
  const ban=bd.add(S.banner(F+'p-ban',2.5,.42,'COLOMBIA 2016',INK.yellow,INK.navy),'L',2.0,1.5,{out:.02});
  const starsP=bd.add(S.stars(F+'p-stars',2.0,.6,8),'L',2.0,2.05,{out:.02});
  const respect=bd.add(S.banner(F+'p-respect',2.0,.42,'RESPECT',INK.pink),'R',2.2,2.0,{out:.02}),starsR=bd.add(S.stars(F+'p-starsR',2.0,.5,7),'R',2.2,1.35,{out:.02});
  const P=(key:string,x:number,z:number,h:number,o:Parameters<typeof B.person>[4])=>B.person(F+key,x,z,h,o);
  // Left page: one more World Cup, ten goals, the record.
  const last=B.stand(S.scoreboard(F+'p-lastB',1.4,1.3,'2012'),-3.8,-1.2,{layer:1,s:0});
  last.add(twoLine('p-more',1.2,.6,'ONE','MORE',INK.pink),0,.36,{z:.01});const lastF=last.flap(twoLine('p-last',1.2,.6,'LAST','WORLD CUP?',INK.blue),0,.96,{z:.02});
  const age=B.stand(twoLine('p-age',1.25,.5,'AGE 39','PREPARED ALL YEAR',INK.teal),-4.0,1.1,{layer:3,s:0});
  const goalL=B.stand(S.goal(F+'p-goalL',1.1,.72),-4.3,-.2,{layer:1,yaw:.55,s:0});
  const keeper=P('p-keeper',-4.0,.05,1.1,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',holdL:'glove',holdR:'glove',layer:2});
  const hero=P('p-hero',-2.35,.45,1.34,{shirt:'bib',hair:'bald',skin:HERO_SKIN,legs:'kick',face:'grin',layer:3});
  const shot=B.stand(futsalBall('p-shot',.1),-2.0,.6,{layer:3,tab:false,s:0});B.slot(-2.0,.6,-3.8,-.1);
  const col=B.stand(tower('p-tower',1.1,1.7),-1.25,-2.2,{layer:1,s:0});
  const markers=Array.from({length:10},(_,i)=>B.stand(marker(`p-m${i}`,.28,String(i+1)),-4.45+i*.41,1.95,{layer:3,s:0}));
  // Right page: Brazil v Iran, the shootout, and the lift.
  const board=B.stand(S.scoreboard(F+'p-board',1.8,1.4,'BRAZIL v IRAN'),1.35,-2.0,{layer:1,s:0});
  board.add(twoLine('p-out',1.5,.64,'KNOCKED','OUT',INK.blue),0,.3,{z:.01});const bflap=board.flap(twoLine('p-draw',1.5,.64,'4 – 4','',INK.pink),0,.94,{z:.02});
  const pen=B.stand(S.icon(F+'p-pen',.3,'tick'),3.3,-1.35,{layer:1,s:0,tab:false}),penX=B.stand(S.icon(F+'p-penX',.3,'cross'),3.75,-1.35,{layer:1,s:0,tab:false});
  const three=B.stand(twoLine('p-three',.95,.44,'3 GOALS','+ HIS PENALTY',INK.yellow,INK.navy),4.2,-.55,{layer:2,s:0});
  const heroR=P('p-heroR',2.6,.6,1.3,{shirt:'bib',hair:'bald',skin:HERO_SKIN,face:'sad',layer:3});
  const tears=heroR.body.add(S.drops(F+'p-tears',.26,.26),.05,.98,{z:.02});
  const iran=[P('p-i1',1.55,.35,1.16,{shirt:'ger',hair:'short',skin:'#d99a6c',face:'grin',layer:3}),P('p-i2',3.7,.4,1.16,{shirt:'ger',hair:'curly',skin:'#b27650',face:'grin',layer:3}),
   P('p-i3',2.65,-.55,1.14,{shirt:'ger',hair:'short',skin:'#f1b88f',face:'grin',layer:2})];
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   ban.scale=pop(t,.2,1);ban.visible=ban.scale>.02;
   // He said 2012 was his last, then changed his mind.
   last.s=pop(t,2.4)*(1-beat(t,11.8,12.5));lastF.flip=-2.9*beat(t,6.6,7.4);
   // At 39, he prepared all year.
   age.s=pop(t,9.0);
   // Ten goals and the all-time record of 48.
   goalL.s=pop(t,12.6);keeper.body.s=pop(t,12.8);hero.body.s=pop(t,12.9);shot.s=pop(t,13.1,.4);
   const shots=[14.2,15.4,16.6];let sx=0;shots.forEach(a=>{const f=beat(t,a-.5,a);if(t>a-.5&&t<a+.7)sx=f;});
   shot.x=-2.0-1.8*sx;shot.z=.6-.7*sx;shot.rot=sx*6;shot.visible=t<19;hero.leg!.rot=-1.1*Math.max(...shots.map(a=>pulse(t,a-.7,a-.2)));
   keeper.body.rot=.7*Math.max(...shots.map((a,i)=>pulse(t,a-.3,a+.6)*(i%2?-1:1)));keeper.armL.rot=-.12-2*Math.abs(keeper.body.rot);keeper.armR.rot=.12+2*Math.abs(keeper.body.rot);
   markers.forEach((m,i)=>{m.s=pop(t,13.6+i*.5,.45);});col.s=pop(t,17.3,1);starsP.scale=pop(t,18,1);starsP.visible=starsP.scale>.02;
   const yay=beat(t,17.6,18.3)*(1-beat(t,19.2,19.8));hero.armL.rot=-.12-2.3*yay;hero.armR.rot=.12+2.3*yay;
   // Brazil v Iran, four goals each.
   const A=act>0?1:0;board.s=Math.max(pop(t,19.5),A);heroR.body.s=Math.max(pop(t,19.9),A);iran.forEach((p,i)=>{p.body.s=Math.max(pop(t,20.3+i*.3),A);});
   // Three goals and his penalty; then the shootout is lost.
   three.s=pop(t,23.6);pen.s=pop(t,25.2);penX.s=pop(t,27.2);bflap.flip=-2.9*beat(t,27.7,28.4);
   const iCheer=beat(t,28,28.6)*(1-beat(t,29.3,29.9));
   // Lift the paper players: the Iran team raise him to honour him.
   const lift=Math.max(N?beat(t,30.3,31.8):0,act);
   const gather=Math.max(lift,N?beat(t,29.6,30.4):0);iran[0].body.x=1.55+.6*gather;iran[1].body.x=3.7-.62*gather;iran[2].body.z=-.55+.55*gather;
   iran.forEach(p=>{const a=Math.max(iCheer,lift);p.armL.rot=-.12-2.35*a;p.armR.rot=.12+2.35*a;p.body.dy=.03*Math.abs(Math.sin(t*5))*iCheer;});
   heroR.body.dy=.55*lift+.05*wave(t,33,37,1.3)*lift;heroR.armL.rot=-.12-.5*lift;heroR.armR.rot=.12+.5*lift;
   // And he cried.
   tears.visible=N?t>34.3:lift>.9;tears.dy=-.04*((t*.8)%1);
   // A sad ending can still be full of respect.
   respect.scale=Math.max(N?pop(t,37.2,1):0,beat(act,.6,1));respect.visible=respect.scale>.02;starsR.scale=Math.max(N?pop(t,40.5,1):0,beat(act,.7,1));starsR.visible=starsR.scale>.02;
   if(N)return -.6*beat(t,2,2.9)+1.2*beat(t,19.2,20.1)-.6*beat(t,40.2,41);
   return act>0?.55:0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={court:courtSpread,sole:soleSpread,golden:goldenSpread,twelve:twelveSpread,record:recordSpread,play:playSpread};
