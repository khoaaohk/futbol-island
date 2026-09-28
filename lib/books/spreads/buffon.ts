/**
 * The six Buffon pop-up spreads (hardship and getting help): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/buffon/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Depression is shown gently and symbolically: a small grey cloud, a smiling flap, a door to someone who listens, a sun that returns.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='buffon-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const JUVE=[INK.white,'#2b2b33',INK.white,'#2b2b33',INK.yellow,INK.white,'#2b2b33'],MILAN=[INK.red,'#2b2b33',INK.red,INK.white,'#2b2b33',INK.red,INK.white];
const ITALY=[INK.blue,INK.white,INK.blue,INK.green,INK.white,INK.red,INK.blue];

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function floor(k:Kit,x0:number,x1:number,tone='#e9d9b4',line='#b9a57c'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.14);for(let y=.5;y<PAGE_D;y+=.5)k.key(`M${x0} ${y} L${x1} ${y}`,.01,line);}
function path(k:Kit,pts:number[][],w=.5,tone='#dcc9a0'){for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1];k.key(`M${x0} ${y0} L${x1} ${y1}`,w,tone);}for(const [x,y] of pts)k.fill(ell(x,y,w/2,w/2),tone);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function hills(k:Kit,w:number,y:number,tone:string,dot:string){const p=`M0 ${y} Q${w*.25} ${y-.5} ${w*.5} ${y-.15} Q${w*.75} ${y+.15} ${w} ${y-.35} L${w} 3 L0 3 Z`;k.fill(p,tone);k.dots(p,dot,.05,.3);}
function town(k:Kit,x0:number,n:number,base:number){for(let i=0;i<n;i++){const x=x0+i*.38,h=.3+((i*5)%3)*.1,b=rect(x,base-h,.32,h);k.fill(b,i%2?'#f0c89a':'#f6d9a4');k.key(b,.01);k.fill(poly([[x-.03,base-h],[x+.16,base-h-.13],[x+.35,base-h]]),INK.red);k.fill(rect(x+.1,base-h+.08,.1,.08),INK.blue);}}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number,rain=true)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 if(rain)for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const faceCard=(key:string,s:number,mood:'happy'|'sad'|'tired'|'empty',color:string)=>sp(key,s,s,k=>{const c=s/2,r=s*.46;k.fill(ell(c,c,r,r),color);k.dots(ell(c,c,r,r),INK.navy,.03,.18);k.key(ell(c,c,r,r),.014);const lw=s*.05;
 if(mood==='tired'){k.key(`M${c-s*.22} ${c-s*.05} Q${c-s*.15} ${c+s*.01} ${c-s*.08} ${c-s*.05} M${c+s*.08} ${c-s*.05} Q${c+s*.15} ${c+s*.01} ${c+s*.22} ${c-s*.05}`,lw*.8);k.key(ell(c,c+s*.2,s*.06,s*.05),lw*.7);}
 else{k.circle(c-s*.15,c-s*.06,s*.045,INK.navy,true);k.circle(c+s*.15,c-s*.06,s*.045,INK.navy,true);
  if(mood==='happy')k.key(`M${c-s*.18} ${c+s*.1} Q${c} ${c+s*.3} ${c+s*.18} ${c+s*.1}`,lw);
  else if(mood==='sad')k.key(`M${c-s*.16} ${c+s*.25} Q${c} ${c+s*.08} ${c+s*.16} ${c+s*.25}`,lw);
  else k.key(`M${c-s*.14} ${c+s*.2} L${c+s*.14} ${c+s*.2}`,lw);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
/** A lift-flap over a person's head printed with a smiling face; the figure's own (sad) face is underneath. */
const smileHead=(key:string,personH:number,skin:string,hairC='#3b2e3f')=>{const s=personH/512;return sp(key,108*s,132*s,k=>{k.at(-96*s,-30*s,s,()=>{
 const head='M112 76 Q114 42 150 40 Q186 42 188 76 L187 116 Q182 150 152 156 Q122 150 114 122 L106 104 Q102 92 112 88 Z';k.fill(head,skin);k.fill('M186 92 Q200 86 199 102 Q197 118 186 118 Z',skin);k.fill('M114 92 Q100 86 101 102 Q103 118 114 118 Z',skin);k.key(head,1.8);
 k.keyFill('M112 84 Q108 44 150 40 Q192 44 188 84 L180 64 Q150 54 120 64 Z',hairC);
 k.circle(136,104,3.8,INK.navy,true);k.circle(166,104,3.8,INK.navy,true);k.key('M130 94 L142 92 M160 92 L172 94',2.2);k.fill('M132 124 Q152 150 172 124 Z','#fbf5e6');k.key('M132 124 Q152 150 172 124 Z',2.2);k.key('M151 106 L147 119 L154 121',1.6);
 k.dots(ell(128,120,9,5),INK.pink,4.5,.95);k.dots(ell(176,120,9,5),INK.pink,4.5,.95);});},{rim:.012});};
/** A head in profile with a small cloud inside: "an illness of the mind". */
const mindCard=(key:string)=>sp(key,1.0,1.45,k=>{const w=1.0,h=1.45;k.keyFill(rect(w*.46,h*.78,w*.08,h*.22),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.3);k.key(b,.014);
 const head=`M${w*.3} ${h*.72} L${w*.32} ${h*.56} Q${w*.14} ${h*.44} ${w*.2} ${h*.26} Q${w*.3} ${h*.07} ${w*.56} ${h*.08} Q${w*.82} ${h*.1} ${w*.82} ${h*.34} L${w*.9} ${h*.44} L${w*.8} ${h*.47} Q${w*.82} ${h*.58} ${w*.66} ${h*.6} L${w*.66} ${h*.72} Z`;k.fill(head,INK.sky2);k.key(head,.016);
 const c=blob([[w*.34,h*.36],[w*.32,h*.28],[w*.42,h*.2],[w*.54,h*.18],[w*.64,h*.24],[w*.68,h*.33],[w*.56,h*.38]]);k.fill(c,'#8d93a8');k.hatch(c,INK.navy,.035,-.5,.008);k.key(c,.01);});
const bench=(key:string,w:number)=>S.bench(K+key,w,w*.42);
/** An empty keeper's gloves card: the missed game. */
const gloves=(key:string)=>sp(key,.62,.34,k=>{for(const x of [.02,.32]){const g=`M${x} .34 L${x} .12 Q${x+.02} .02 ${x+.08} .03 L${x+.2} .03 Q${x+.27} .05 ${x+.28} .14 L${x+.28} .34 Z`;k.fill(g,'#e9e24a');k.dots(g,INK.green,.03,.45);k.key(g,.012);k.key(`M${x+.07} .04 L${x+.07} .16 M${x+.14} .03 L${x+.14} .16 M${x+.21} .04 L${x+.21} .16`,.008);}},{rim:.02});
/** Wobbly worry lines beside the keeper (panic attacks, drawn softly). */
const worry=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<3;i++){const x=w*(.15+i*.3);k.key(`M${x} ${h*.05} Q${x+w*.12} ${h*.25} ${x} ${h*.45} Q${x-w*.12} ${h*.65} ${x} ${h*.95}`,.03,i===1?INK.pink:INK.navy);}},{rim:.02,grain:.6});
const starCard=(key:string,r:number,color:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const p=poly(Array.from({length:10},(_,i)=>[r+Math.cos(i*.628-1.57)*(i%2?r*.42:r),r+Math.sin(i*.628-1.57)*(i%2?r*.42:r)]));k.fill(p,color);k.dots(p,INK.orange,.03,.35);k.key(p,.012);},{rim:.02});
const heart=(key:string,s:number,color:string=INK.pink)=>sp(key,s,s*.9,k=>{const w=s,h=s*.9,p=`M${w/2} ${h} C${-w*.1} ${h*.5} ${w*.05} ${-h*.05} ${w/2} ${h*.25} C${w*.95} ${-h*.05} ${w*1.1} ${h*.5} ${w/2} ${h} Z`;k.fill(p,color);k.dots(p,INK.red,.03,.3);k.key(p,.012);},{rim:.02});
/** A little office with a doorway; the door itself is a hinged flap. */
const office=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const roofY=h*.26,wall=rect(w*.04,roofY,w*.92,h-roofY);k.fill(wall,'#f3e2bd');k.dots(wall,INK.orange,.04,(x,y)=>.08+y/h*.25);k.key(wall,.014);
 const roof=poly([[0,roofY+.03],[w*.5,0],[w,roofY+.03]]);k.fill(roof,INK.teal);k.hatch(roof,INK.navy,.04,-.4,.01);k.key(roof,.014);
 const win=rect(w*.64,h*.42,w*.22,h*.22);k.fill(win,INK.yellow);k.dots(win,INK.orange,.03,.35);k.key(win,.013);k.key(`M${w*.75} ${h*.42} L${w*.75} ${h*.64} M${w*.64} ${h*.53} L${w*.86} ${h*.53}`,.01);
 const dw=rect(w*.14,h*.38,w*.36,h*.62);k.fill(dw,'#f7c96b');k.dots(dw,INK.orange,.03,.4);k.key(dw,.013);
 for(let i=0;i<4;i++)k.circle(w*(.6+i*.09),h*.94,.03,i%2?INK.pink:INK.yellow);});
const door=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.navy);k.dots(d,INK.blue,.035,.3);k.key(d,.012,'#101a36');k.fill(rect(w*.18,h*.1,w*.64,h*.28),INK.blue);k.fill(rect(w*.18,h*.5,w*.64,h*.34),'#2d4a8a');k.circle(w*.82,h*.56,.03,INK.gold);},{rim:.012});
const chair=(key:string,w:number,h:number,color:string)=>sp(key,w,h,k=>{const back=`M${w*.12} ${h*.62} L${w*.12} ${h*.12} Q${w*.5} 0 ${w*.88} ${h*.12} L${w*.88} ${h*.62} Z`;k.fill(back,color);k.dots(back,INK.navy,.035,.2);k.key(back,.013);
 const seat=rect(0,h*.58,w,h*.18);k.fill(seat,color);k.key(seat,.013);k.keyFill(rect(w*.08,h*.76,w*.08,h*.24));k.keyFill(rect(w*.84,h*.76,w*.08,h*.24));});
const clockFace=(key:string,r:number)=>sp(key,r*2,r*2+.5,k=>{k.keyFill(rect(r-.03,r*2-.05,.06,.55),INK.brown);k.fill(ell(r,r,r,r),INK.white);k.dots(ell(r,r,r,r),INK.sky,.03,.3);k.key(ell(r,r,r,r),.02);
 for(let i=0;i<12;i++){const a=i/12*TAU;k.key(`M${r+Math.cos(a)*r*.78} ${r+Math.sin(a)*r*.78} L${r+Math.cos(a)*r*.9} ${r+Math.sin(a)*r*.9}`,.018);}k.circle(r,r,.03,INK.navy,true);});
const hand=(key:string,len:number,color:string=INK.pink)=>sp(key,.07,len,k=>{const p=poly([[.035,0],[.07,len*.15],[.05,len],[.02,len],[0,len*.15]]);k.fill(p,color);k.key(p,.008);k.circle(.035,.03,.018,INK.gold);},{rim:.01,grain:.5});
const feelBox=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.18,w,h*.82);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.04,.3,.008);k.key(b,.014);const l=rect(w*.2,h*.45,w*.6,h*.3);k.fill(l,INK.paper);k.key(l,.01);k.text('FEELINGS',w/2,h*.66,h*.12,INK.navy,{max:w*.55});});
const lid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#9a5b3b');k.key(b,.013);k.fill(rect(w*.44,h*.3,w*.12,h*.4),INK.gold);},{rim:.014});
const stone=(key:string,w:number,color:string)=>sp(key,w,w*.5,k=>{const p=ell(w/2,w*.25,w*.48,w*.22);k.fill(p,color);k.dots(p,INK.navy,.03,.25);k.key(p,.012);},{rim:.015});
const ladder=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [w*.12,w*.82]){const r=rect(x,0,w*.06,h);k.fill(r,INK.wood);k.key(r,.012);}
 for(let y=h*.08;y<h;y+=h*.12){const r=rect(w*.12,y,w*.76,.05);k.fill(r,'#d99a6c');k.key(r,.008);}
 const a=rect(0,-.0,w,h*.1),b=rect(0,h*.9,w,h*.1);k.fill(a,INK.yellow);k.key(a,.012);k.fill(b,INK.grey);k.key(b,.012);
 k.text('SERIE A',w/2,h*.075,h*.06,INK.navy,{max:w*.9});k.text('SERIE B',w/2,h*.975,h*.06,INK.navy,{max:w*.9});});
const pennant=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(0,0,.05,h),INK.brown);k.key(rect(0,0,.05,h),.008);const f=poly([[.05,.02],[w,h*.2],[.05,h*.42]]);k.fill(f,INK.white);k.fill(poly([[.05,.02],[w*.52,h*.11],[w*.52,h*.33],[.05,h*.42]]),'#2b2b33');k.key(f,.012);},{rim:.016});
const noticeBoard=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{k.keyFill(rect(w*.14,h*.7,w*.06,h*.3),INK.brown);k.keyFill(rect(w*.8,h*.7,w*.06,h*.3),INK.brown);const b=rect(0,0,w,h*.72);k.fill(b,'#c9a26a');k.dots(b,INK.brown,.04,.3);k.key(b,.014);
 const p=rect(w*.1,h*.08,w*.8,h*.56);k.fill(p,INK.white);k.key(p,.01);k.circle(w*.5,h*.1,.03,INK.red);lines.forEach((l,i)=>k.text(l,w/2,h*(.3+i*.2),h*.12,i?INK.navy:INK.red,{max:w*.72}));});
const mic=(key:string,h:number)=>sp(key,.4,h,k=>{k.keyFill(rect(.18,.2,.04,h-.26),'#2b2b33');k.fill(ell(.2,h-.03,.18,.04),'#2b2b33');const m=ell(.2,.12,.09,.12);k.fill(m,INK.grey);k.hatch(m,INK.navy,.025,.78,.006);k.key(m,.012);});
const bookCover=(key:string,w:number,h:number,title:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.25);k.key(b,.014);k.fill(rect(0,0,w*.08,h),INK.navy);
 k.text(title,w*.54,h*.36,h*.14,INK.white,{max:w*.78});const g=`M${w*.4} ${h*.82} L${w*.4} ${h*.58} Q${w*.54} ${h*.48} ${w*.68} ${h*.58} L${w*.68} ${h*.82} Z`;k.fill(g,'#e9e24a');k.key(g,.012);},{rim:.016});
const bookInside=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.key(`M${w/2} 0 L${w/2} ${h}`,.012,INK.grey);
 for(let i=0;i<5;i++){k.key(`M${w*.06} ${h*(.18+i*.13)} L${w*.44} ${h*(.18+i*.13)}`,.012,INK.grey);}
 const hp=`M${w*.75} ${h*.42} C${w*.6} ${h*.3} ${w*.62} ${h*.12} ${w*.75} ${h*.2} C${w*.88} ${h*.12} ${w*.9} ${h*.3} ${w*.75} ${h*.42} Z`;k.fill(hp,INK.pink);k.key(hp,.01);
 lines.forEach((l,i)=>k.text(l,w*.75,h*(.62+i*.16),h*.11,INK.navy,{max:w*.44}));});
const rainbowArc=(key:string,w:number,h:number)=>S.rainbow(K+key,w,h);

/* ───────────── 1 · Even the best can lose (final, 2003) ───────────── */
const final:SpreadDef={id:'final',rest:19.4,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('2003',-2.4,Z(2.62),.56,INK.yellow,{max:2.4});k.text('CHAMPIONS LEAGUE FINAL',-2.4,Z(2.9),.16,INK.white,{weight:800,max:3.6});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.4 ${Z(-2.1)} L2.4 ${Z(.1)} L5 ${Z(.1)}`);k.circle(2.2,Z(.45),.05,INK.white);
  k.text('JUVENTUS · MILAN',2.5,Z(2.62),.36,INK.pink,{max:4.2});k.text('PENALTY SHOOT-OUT',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,JUVE,1);lightRig(k,1.2,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,MILAN,3);lightRig(k,1.2,.3);lightRig(k,3.7,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'f-ban',2.9,.4,'CHAMPIONS LEAGUE FINAL 2003',INK.blue),'R',.3,2.8,{out:.02});
  const stars=[0,1,2].map(i=>bd.add(starCard(`f-star${i}`,.18),'L',1.2+i*1.1,2.55+(i%2)*.15,{out:.03}));
  const rain=bd.add(stormCloud('f-rain',1.5,.75),'L',2.2,1.55,{out:.04});
  const board=B.stand(S.scoreboard(K+'f-board',2.1,1.55,'JUVENTUS – MILAN'),-2.5,-1.55,{layer:1});
  board.add(lineCard('f-lost',1.6,.72,['LOST ON','PENALTIES'],INK.white),0,.42,{z:.012});
  const flap=board.flap(S.flipCard(K+'f-00',1.6,.72,'FINAL','#3d5da0'),0,1.14,{z:.024});
  const award=B.stand(lineCard('f-award',1.3,.62,['BEST CLUB','PLAYER 2003'],INK.yellow),-3.95,-.75,{layer:2,s:0});
  const cup=B.stand(S.trophy(K+'f-cup',.45,.8),-4.5,.55,{layer:2,s:0});
  B.stand(S.floodlight(K+'f-flood',.5,1.9),-4.6,-1.9,{layer:1});
  B.stand(S.goal(K+'f-goal',2.0,1.0),3.7,-1.1,{layer:1});
  const H=B.person(K+'f-hero',3.7,-.75,1.5,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'1',face:'smile',layer:2,holdL:'glove',holdR:'glove'});
  const cloudHead=H.body.add(stormCloud('f-mini',.62,.34),0,H.h*1.02,{z:-.02});
  const T1=B.person(K+'f-t1',-1.4,.5,1.3,{shirt:'ger',hair:'curly',skin:'#d99a6c',face:'open',layer:2}),T2=B.person(K+'f-t2',-2.7,1.35,1.3,{shirt:'ger',hair:'short',skin:'#b27650',face:'open',layer:3});
  const O1=B.person(K+'f-o1',.9,-.6,1.3,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'grin',layer:2});
  const taker=B.person(K+'f-kick',1.55,.75,1.32,{shirt:'casual',hair:'curly',skin:'#7f5138',legs:'kick',face:'open',layer:3});
  const ball=B.stand(S.ball(K+'f-ball',.13),2.1,.8,{layer:3,tab:false});
  const pal=B.person(K+'f-pal',-.6,1.9,1.26,{shirt:'ger',hair:'long',skin:'#f1b88f',face:'smile',layer:3});
  const still=B.stand(S.flipCard(K+'f-still',1.2,.36,'STILL BUFFON',INK.pink),3.4,1.9,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.4):b.t;
   H.body.s=beat(t,2.3,3.2);stars.forEach((q,i)=>show(q,beat(t,3+i*.5,3.6+i*.5)));
   const save=pulse(t,4.6,6.2);H.body.rot=-.5*save;H.body.dx=-.2*save;H.armL.rot=-.12-2.2*save;H.armR.rot=.12+2.2*save+2.2*beat(t,9,9.6)-2.2*beat(t,13,13.6);H.armL.rot+=-2.2*beat(t,9,9.6)+2.2*beat(t,13,13.6);
   award.s=beat(t,8.4,9.2);cup.s=beat(t,9.2,10);
   T1.body.s=beat(t,14.4,15.2);T2.body.s=beat(t,14.8,15.6);O1.body.s=beat(t,15.2,16);taker.body.s=beat(t,15.6,16.4);ban.dy=.04*wave(t,14,40,.6);
   // The shoot-out: the penalty goes in; the scoreboard flips to its result.
   const kick=manual?beat(act,.2,.7):beat(t,22,23.4);
   taker.leg!.rot=-1.2*(manual?pulse(act,.1,.35):pulse(t,21.7,22.3));
   ball.x=2.1+1.05*kick;ball.z=.8-1.75*kick;ball.dy=.5*Math.sin(kick*Math.PI)+.25*kick;ball.rot=-kick*8;ball.visible=t>15.6||manual;
   const dive=manual?pulse(act,.3,.95):pulse(t,22.2,24.4);H.body.rot+= .9*dive;H.body.dx+=.3*dive;
   flap.flip=-3.2*Math.max(beat(t,20,21),manual?beat(act,.55,.9):0);
   O1.armL.rot=-.12-2.3*beat(t,23.6,24.2);O1.armR.rot=.12+2.3*beat(t,23.6,24.2);
   // A hard season follows: rain over the stands, heads low; a small grey cloud comes to rest over the keeper.
   show(rain,beat(t,26.4,27.6)*(1-beat(t,36.5,38)));rain.dx=.1*wave(t,27.6,36.5,.3);
   T1.body.x=-1.4-.4*beat(t,26.6,28);T2.body.yaw=-.4*beat(t,27,28);
   show(cloudHead,beat(t,31,32.2)*(1-beat(t,37,38.2)));cloudHead.dy=.03*wave(t,32.2,37,.8);
   // Lesson: a teammate comes over; a loss does not change who you are.
   pal.body.s=beat(t,36,36.8);pal.armR.rot=.12+1.6*beat(t,37,37.6);still.s=beat(t,37.8,38.6);
   return b.narrated?-.4*beat(t,7.6,8.4)+.4*beat(t,13.6,14.4)-.35*beat(t,19.4,20.2)+.75*beat(t,21.2,22)-.4*beat(t,26,27):0;
  };
 }};

/* ───────────── 2 · A heavy grey cloud (cloud, 2003–2004) ───────────── */
const cloud:SpreadDef={id:'cloud',rest:19.2,
 left:k=>{floor(k,-5,0,'#d9d3e6','#a7a0c0');footprints(k,-4.4,Z(1.9),-3.1,Z(1.4),6);
  k.text('DEC 2003 – JUNE 2004',-2.5,Z(2.62),.34,INK.navy,{max:4});k.text('AN ILLNESS OF THE MIND',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.4 ${Z(-2.1)} L2.4 ${Z(-.4)} L5 ${Z(-.4)}`);
  k.text('INSIDE AND OUTSIDE',2.5,Z(2.62),.34,INK.blue,{max:4.2});k.text('FEELINGS ARE REAL, EVEN WHEN HIDDEN',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b4b0c9',INK.navy,y=>.35-y*.08);hills(k,4.5,2.2,'#7d8f86',INK.navy);town(k,.3,9,2.5);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.5,2.6,JUVE,2);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'c-sun',.36),'R',3.4,2.1,{out:.015});
  const bigCloud=bd.add(stormCloud('c-big',1.6,.8),'L',2.4,1.7,{out:.03});
  const moods=(['sad','tired','empty'] as const).map((m,i)=>bd.add(faceCard(`c-face${i}`,.5,m,[INK.sky,INK.orange,INK.grey][i]),'L',3.6-i*.95,2.45,{out:.02}));
  const words=['SAD','TIRED','EMPTY'].map((l,i)=>bd.add(S.flipCard(K+`c-w${i}`,.62,.24,l,[INK.blue,INK.orange,'#6f7fb0'][i]),'L',3.6-i*.95,2.15,{out:.025}));
  const cal=['DEC 2003','JUNE 2004'].map((l,i)=>bd.add(S.flipCard(K+`c-cal${i}`,.85,.32,l,i?INK.orange:INK.blue),'L',4.0-i*1.3,1.25,{out:.02}));
  const arrowC=bd.add(S.arrow(K+'c-arr',.36,.22,INK.yellow),'L',3.35,1.3,{out:.025});
  const mind=B.stand(mindCard('c-mind'),-1.2,-1.5,{layer:1,s:0});
  B.stand(S.tree(K+'c-tree',.8,1.2,'round','#7d8f86'),-4.5,1.7,{layer:3});
  B.stand(S.goal(K+'c-goal',1.8,.9),3.9,-1.55,{layer:1});
  const bigStar=B.stand(starCard('c-bigstar',.32),3.9,-1.45,{layer:1,s:0,tab:false});bigStar.dy=.55;
  const H=B.person(K+'c-hero',-2.4,1.1,1.65,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'1',face:'sad',layer:3,holdL:'glove',holdR:'glove'});
  const bw=H.h*320/512,mask=H.body.flap(smileHead('c-mask',H.h,'#f1b88f'),(150/320-.5)*bw,H.h*(1-30/512),{anchor:'top',z:.016});
  const inner=H.body.add(stormCloud('c-inner',.6,.34),0,H.h*1.02,{z:-.02});
  const shake=H.body.add(worry('c-worry',.42,.5),.55,H.h*.55,{z:-.02,anchor:'center'});
  const benchP=B.stand(bench('c-bench',1.2),2.2,-.4,{layer:2});void benchP;
  const gl=B.stand(gloves('c-gloves'),2.2,-.35,{layer:2,s:0,tab:false});gl.dy=.34;
  const fans=[0,1,2].map(i=>B.person(K+`c-fan${i}`,2.2+i*1.0,1.2+(i%2)*.5,1.2,{shirt:'ger',hair:(['curly','bun','short'] as const)[i],skin:['#d99a6c','#7f5138','#f1b88f'][i],face:'grin',layer:3}));
  const fanStars=fans.map((f,i)=>f.body.add(starCard(`c-fs${i}`,.13),.0,f.h*1.02,{z:-.02}));
  const friend=B.person(K+'c-friend',-.8,1.7,1.3,{shirt:'casual',hair:'long',skin:'#b27650',face:'smile',layer:3});
  const hb=friend.body.add(S.bubble(K+'c-hb',.55,.48,'heart'),.42,friend.h*.98,{z:-.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.2):b.t;
   H.body.s=beat(t,.4,1.4);
   cal.forEach((c,i)=>show(c,beat(t,2.6+i*2.4,3.4+i*2.4)));show(arrowC,beat(t,4,4.8));
   show(bigCloud,beat(t,5.5,6.8));bigCloud.dx=.1*wave(t,6.8,41,.25);
   mind.s=beat(t,8.3,9.2);
   moods.forEach((m,i)=>{show(m,beat(t,11.6+i*1.1,12.2+i*1.1));m.rot=.06*wave(t,12.2,19,.5+i*.1);});words.forEach((w,i)=>show(w,beat(t,12+i*1.1,12.6+i*1.1)));
   show(sun,beat(t,16.2,17.2));sun.rot=.2*t;
   // The smiling flap lifts: underneath, the keeper's face shows how he really feels.
   const lift=Math.max(beat(t,19.8,21),manual?beat(act,.1,.8):0);mask.flip=-2.75*lift;
   show(inner,Math.max(beat(t,20.6,21.6),manual?beat(act,.5,.95):0)*(1-beat(t,37.5,39)));inner.dy=.03*wave(t,21.6,37,.7);
   show(shake,pulse(t,22.2,27.5));shake.rot=.12*wave(t,22.2,27.5,2);
   H.body.x=-2.4-.3*pulse(t,22,29);
   gl.s=beat(t,26.6,27.4);
   bigStar.s=beat(t,30,30.8);bigStar.rot=.1*wave(t,30.8,41,.4);
   fans.forEach((f,i)=>{const c=beat(t,30.1+i*.3,30.7+i*.3)*(1-beat(t,33,33.6));f.armL.rot=-.12-2.3*c;f.armR.rot=.12+2.3*c;show(fanStars[i],c);});
   show(inner,Math.max(inner.scale,1.25*beat(t,32.8,33.6)*(1-beat(t,35.5,36.5))));
   friend.body.s=beat(t,35.4,36.2);friend.armL.rot=-.12-1.4*beat(t,36.4,37);show(hb,beat(t,37,37.7));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,10.6,11.4)-.35*beat(t,19.2,20)+.35*beat(t,21.6,22.4)+.45*beat(t,29.6,30.4)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 3 · Someone to talk to (help) ───────────── */
const help:SpreadDef={id:'help',rest:19.6,
 left:k=>{floor(k,-5,0,'#e6dcc4','#b9a57c');path(k,[[-4.6,Z(1.6)],[-3,Z(1.2)],[-1.4,Z(1.4)],[0,Z(1.1)]],.55);
  k.text('WEEK AFTER WEEK',-2.4,Z(2.62),.4,INK.pink,{max:4});k.text('DECEMBER 2003 TO JUNE 2004',-2.4,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{floor(k,0,5,'#f0e2c0','#c2ab7e');path(k,[[0,Z(1.1)],[1.2,Z(.8)],[2.2,Z(.2)]],.55);
  const rug=ell(3.6,Z(1.0),1.2,.55);k.fill(rug,INK.pink,.45);k.dots(rug,INK.red,.05,.3);
  k.text('LISTEN · TALK',2.5,Z(2.62),.44,INK.blue,{max:4});k.text('A PSYCHOLOGIST HELPS WITH FEELINGS',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);hills(k,4.5,2.2,'#8fa28c',INK.navy);town(k,.2,11,2.55);}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2b0',INK.pink,y=>.4-y/3*.4);hills(k,4.5,2.1,INK.grass,INK.leaf);town(k,2.3,5,2.5);}},-3.05,1.22);
  const cal=['DEC 2003','JUNE 2004'].map((l,i)=>bd.add(S.flipCard(K+`h-cal${i}`,.85,.32,l,i?INK.orange:INK.blue),'L',3.7-i*1.3,2.45,{out:.02}));
  const sun=bd.add(S.sun(K+'h-sun',.34),'R',3.6,1.5,{out:.015});
  const off=B.stand(office('h-office',2.1,2.0),2.2,-1.1,{layer:1});
  const dr=off.flap(door('h-door',.72,1.22),-.76,0,{anchor:'bl',axis:'y',z:.02});
  const helper=B.person(K+'h-helper',3.8,-.35,1.72,{shirt:'coach',hair:'bun',adult:true,skin:'#b27650',face:'smile',layer:2});
  const ear=helper.body.add(S.bubble(K+'h-ear',.6,.5,'heart'),.5,helper.h*.98,{z:-.02});
  const chA=B.stand(chair('h-chA',.7,.8,INK.sky),3.05,.35,{layer:2,s:0}),chB=B.stand(chair('h-chB',.7,.8,INK.yellow),4.35,.9,{layer:3,s:0});
  const box=B.stand(feelBox('h-box',1.1,.8),-3.3,-.5,{layer:2});const bl=box.flap(lid('h-lid',1.14,.14),0,.8*.82+.14,{anchor:'top',z:.02});
  const boxBub=box.add(S.bubble(K+'h-bb',.55,.46,'dots'),.1,.82,{z:-.02});
  const H=B.person(K+'h-hero',.55,1.25,1.5,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'shy',layer:3,adult:true});B.slot(.5,1.4,1.9,1.4);
  const cloudHead=H.body.add(stormCloud('h-mini',.6,.34),0,H.h*1.02,{z:-.02});
  const talkB=H.body.add(S.bubble(K+'h-talk',.55,.46,'dots'),.5,H.h*.98,{z:-.02});
  const ticks=Array.from({length:6},(_,i)=>B.stand(S.icon(K+`h-tick${i}`,.3,'tick'),-3.9+i*.5,1.2,{layer:3,s:0,tab:false}));
  const clock=B.stand(clockFace('h-clock',.4),-1.4,-1.2,{layer:1,s:0});const cH=clock.arm(hand('h-hand',.32),0,.5+.4,{z:.02});
  const stones=[0,1,2,3].map(i=>B.stand(stone(`h-st${i}`,.5,[INK.sky,INK.grass,INK.yellow,INK.pink][i]),-3.8+i*.9,2.05-(i%2)*.15,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   H.body.s=beat(t,.4,1.3);show(cloudHead,(1-beat(t,28.6,33)));cloudHead.scale*=1-.5*beat(t,28.2,30.5);
   // Feelings are not kept inside: the box lid opens.
   bl.flip=-2.2*beat(t,2.4,3.4);show(boxBub,beat(t,3.2,4));boxBub.dy=.2*beat(t,3.2,4.6);
   cal.forEach((c,i)=>show(c,beat(t,5.4+i*2.6,6.2+i*2.6)));
   // Walking the path to the door (slot slider).
   const walk=manual?1:beat(t,6,12);H.body.x=.55+1.25*walk;
   show(ear,beat(t,13,13.8)*(1-beat(t,19,19.6)));helper.armL.rot=-.12-1.2*pulse(t,14,16.5);
   // Knock three times, then the door opens.
   const n=manual?Math.round(act*3):0;const kn=manual?Math.max(pulse(act,0,.2),pulse(act,.34,.5),pulse(act,.67,.8)):Math.max(pulse(t,20,20.5),pulse(t,20.6,21.1),pulse(t,21.2,21.7));
   H.armR.rot=.12+1.9*Math.max(kn,manual&&n<3?.2:0)*(1-(manual?beat(act,.9,1):beat(t,22,22.6)));
   const open=manual?beat(act,.8,1):beat(t,21.8,23);dr.flip=-.8*open;
   // Week after week: ticks; talking together in two chairs.
   const inside=manual?beat(act,.9,1):beat(t,22.6,24);H.body.x+=1.2*inside;H.body.z=1.25-.25*inside;
   chA.s=beat(t,22.2,23);chB.s=beat(t,22.6,23.4);
   ticks.forEach((q,i)=>{q.s=beat(t,22.4+i*.55,22.8+i*.55);});
   show(talkB,pulse(t,23.5,25.5)+pulse(t,31,33.4));show(ear,Math.max(ear.scale,pulse(t,24.8,27)+pulse(t,33,35)));
   helper.body.yaw=-.35*inside;
   clock.s=beat(t,25.9,26.6);cH.rot=TAU*1.5*beat(t,26.2,28.2)+Math.PI*.6;
   stones.forEach((q,i)=>{q.s=beat(t,28.4+i*.9,28.9+i*.9);});
   show(sun,beat(t,30,31.5));sun.dy=.5*beat(t,30,34);
   H.armL.rot=-.12-2.2*beat(t,34.4,35);H.armR.rot+=2.2*beat(t,34.4,35);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,5,6)+.5*beat(t,12,13)-.5*beat(t,19.2,20)+.45*beat(t,23,24)-.45*beat(t,25.8,26.6):0;
  };
 }};

/* ───────────── 4 · The sun comes back (sunrise, 2004–2006) ───────────── */
const sunrise:SpreadDef={id:'sunrise',rest:14.8,
 left:k=>{pitch(k,-5,0,INK.grass,INK.leaf,.7);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('EURO 2004',-2.4,Z(2.62),.46,INK.blue,{max:3.8});k.text('EVERY ONE OF ITALY’S MATCHES',-2.4,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,INK.grass,INK.leaf,.7);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);
  k.text('2006 WORLD CUP',2.5,Z(2.62),.4,INK.pink,{max:4});k.text('ITALY ARE WORLD CHAMPIONS',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.4);hills(k,4.5,2.1,INK.leaf,INK.navy);town(k,.4,8,2.55);}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.6,2.6,ITALY,4);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.42),'L',1.15,.3,{out:.015});
  const grey=bd.add(stormCloud('s-grey',1.4,.7),'L',2.6,1.9,{out:.03});
  const rb=bd.add(rainbowArc('s-rb',2.0,.95),'L',2.9,1.45,{out:.025});
  const birds=bd.add(S.birds(K+'s-birds',.9,.35),'L',3.2,2.3,{out:.02});
  const fw=[bd.add(S.firework(K+'s-fw1',.4,INK.blue),'R',1.2,2.2,{out:.03}),bd.add(S.firework(K+'s-fw2',.36,INK.red),'R',3.3,2.3,{out:.03})];
  const conf=bd.add(S.confetti(K+'s-cf',2.4,1.1,2),'R',.5,1.4,{out:.04});
  const H=B.person(K+'s-hero',-2.3,.8,1.4,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'1',face:'smile',layer:3,holdL:'glove',holdR:'glove'});
  const cloudHead=H.body.add(stormCloud('s-mini',.6,.34),0,H.h*1.02,{z:-.02});
  const ticks=[0,1,2].map(i=>B.stand(S.icon(K+`s-tick${i}`,.3,'tick'),-4.3+i*.45,-.9,{layer:2,s:0,tab:false}));
  B.stand(S.tree(K+'s-tree',1.0,1.5,'round'),-4.5,-1.8,{layer:1});
  const board=B.stand(S.scoreboard(K+'s-board',2.0,1.5,'WORLD CUP 2006'),2.0,-1.6,{layer:1,s:0});
  board.add(lineCard('s-two',1.55,.7,['2 GOALS IN','7 MATCHES'],INK.white),0,.4,{z:.012});
  const glovesRow=Array.from({length:5},(_,i)=>B.stand(S.icon(K+`s-cs${i}`,.3,'glove'),2.85+i*.38,2.05,{layer:3,s:0,tab:false}));
  const cs=B.stand(S.flipCard(K+'s-csl',1.6,.34,'FIVE CLEAN SHEETS',INK.blue),1.55,2.05,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'s-goal',1.5,.8),4.3,-1.85,{layer:1});
  const cup=B.stand(S.trophy(K+'s-cup',.6,1.0),.8,.1,{layer:2,s:0});
  const best=B.stand(S.flipCard(K+'s-best',1.5,.36,'BEST GOALKEEPER',INK.pink),.95,1.1,{layer:3,s:0,tab:false});
  const mates=[0,1,2].map(i=>B.person(K+`s-m${i}`,2.2+i*1.05,.9+(i%2)*.55,1.28,{shirt:'navy',hair:(['curly','short','long'] as const)[i],skin:['#d99a6c','#f1b88f','#b27650'][i],face:'grin',layer:3}));
  const ball=B.stand(S.ball(K+'s-ball',.13),-1.2,.9,{layer:3,tab:false});
  const euro=[0,1].map(i=>B.person(K+`s-e${i}`,-3.9+i*2.6,-.5+i*.2,1.26,{shirt:'navy',hair:(['short','curly'] as const)[i],skin:['#d99a6c','#f1b88f'][i],face:'smile',layer:2}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.8):b.t;
   H.body.s=beat(t,.3,1.2);
   // Overcoming depression: the grey cloud shrinks and drifts away.
   const away=beat(t,3,8.5);show(cloudHead,1-away);show(grey,1-.6*away-.4*Math.max(beat(t,15,16.4),manual?beat(act,.2,.8):0));grey.dx=1.2*away;
   H.body.yaw=0;H.armL.rot=-.12-1.2*beat(t,6.5,7.5)+1.2*beat(t,9,9.6);H.armR.rot=.12+1.2*beat(t,6.5,7.5)-1.2*beat(t,9,9.6);
   ticks.forEach((q,i)=>{q.s=beat(t,10+i*1.1,10.5+i*1.1);});euro.forEach((e,i)=>{e.body.s=beat(t,9.4+i*.5,10.2+i*.5);e.armR.rot=.12+1.4*pulse(t,11+i,13+i);});
   // Pull the sun up over the hills.
   const up=Math.max(beat(t,14.8,16.6),manual?beat(act,0,.85):0);sun.dy=1.6*up;sun.rot=.15*t;
   board.s=beat(t,17,17.8);glovesRow.forEach((g,i)=>{g.s=beat(t,21.8+i*.5,22.2+i*.5);});cs.s=beat(t,24.2,24.9);
   const bx=track(t,[[0,-1.2,.9],[18.6,-1.2,.9],[19.6,-2.6,.95],[20.4,-2.6,.95]]);ball.x=bx[0];ball.z=bx[1];ball.dy=.4*pulse(t,18.6,19.6);ball.visible=t>18||manual;
   const save=pulse(t,19,20.6);H.body.rot=-.4*save;H.armR.rot+=1.6*save;
   cup.s=beat(t,26,26.8);best.s=beat(t,28.4,29.2);
   mates.forEach((m,i)=>{m.body.s=beat(t,25.9+i*.35,26.6+i*.35);const c=beat(t,26.8+i*.3,27.4+i*.3);m.armL.rot=-.12-2.3*c-.25*wave(t,27.4,31,1.3+i*.2);m.armR.rot=.12+2.3*c;});
   fw.forEach((f,i)=>{show(f,beat(t,26.4+i*.5,27.4+i*.5));f.rot=t*.2;});conf.dy=-1+1.2*beat(t,26.2,28.6);conf.visible=t>26.1;
   const cheer=beat(t,27,27.6);H.armL.rot+=-2.2*cheer;H.armR.rot+=2.2*cheer*(1-save);
   show(rb,beat(t,31.3,32.6));show(birds,beat(t,33.8,34.6));birds.dx=1.1*beat(t,34,38.8);
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,14,14.8)+.45*beat(t,16.6,17.4)-.45*beat(t,30.8,31.6)-.3*beat(t,31.6,32.4)+.3*beat(t,34,35):0;
  };
 }};

/* ───────────── 5 · Staying with his team (serieb, 2006–2007) ───────────── */
const LAD_H=2.6,LAD_LO=.3,LAD_HI=2.1;
const serieb:SpreadDef={id:'serieb',rest:18.4,
 left:k=>{pitch(k,-5,0,'#9fbf86','#6f9a66',.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.4),1.0,1.0));
  k.text('2006',-2.4,Z(2.62),.52,INK.navy,{max:2.4});k.text('SENT DOWN TO SERIE B',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.4),1.0,1.0));
  k.text('HE STAYED',2.5,Z(2.62),.48,INK.pink,{max:4});k.text('37 MATCHES · BACK UP TO SERIE A',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b9b6c8',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.6,2.6,JUVE,5);k.fill(rect(0,2.6,4.5,.4),'#9fbf86');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.55,2.6,JUVE,6);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const storm=bd.add(stormCloud('b-storm',1.5,.75),'L',2.3,1.5,{out:.03});
  const sun=bd.add(S.sun(K+'b-sun',.38),'R',3.4,1.3,{out:.015});
  const ban=bd.add(S.banner(K+'b-ban',2.4,.38,'SERIE B TITLE 2007',INK.navy),'R',.4,2.85,{out:.02});
  const notice=B.stand(noticeBoard('b-notice',1.6,1.35,['2006','CALCIOPOLI']),-3.0,-1.55,{layer:1,s:0});
  const lad=B.stand(ladder('b-ladder',1.1,LAD_H),-.95,-1.3,{layer:1});
  const flag=lad.add(pennant('b-flag',.6,.6),.05,LAD_LO,{z:.03});
  const H=B.person(K+'b-hero',-2.5,.7,1.4,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'1',face:'smile',layer:3,holdL:'glove',holdR:'glove'});
  const stay=B.stand(S.flipCard(K+'b-stay',.9,.36,'STAY',INK.pink),-3.9,1.2,{layer:3,s:0,tab:false});
  const hb=H.body.add(S.bubble(K+'b-hb',.52,.44,'heart'),.46,H.h*.98,{z:-.02});
  const mates=[0,1,2].map(i=>B.person(K+`b-m${i}`,1.2+i*1.45,.5+(i%2)*.6,1.3,{shirt:'ger',hair:(['curly','short','bun'] as const)[i],skin:['#7f5138','#d99a6c','#f1b88f'][i],face:i===1?'sad':'open',layer:i===1?3:2}));
  const counter=B.stand(S.scoreboard(K+'b-count',1.2,1.1,'MATCHES'),1.9,-1.7,{layer:1,s:0});counter.add(S.flipCard(K+'b-37',.9,.48,'37',INK.pink),0,.28,{z:.012});
  const balls=Array.from({length:6},(_,i)=>B.stand(S.icon(K+`b-bi${i}`,.28,'ball'),1.5+i*.4,2.05,{layer:2,s:0,tab:false}));
  const cup=B.stand(S.trophy(K+'b-cup',.55,.9),4.2,1.9,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.4):b.t;
   H.body.s=beat(t,.3,1.2);mates.forEach((m,i)=>{m.body.s=beat(t,.8+i*.3,1.6+i*.3);});
   notice.s=beat(t,2.6,3.4);show(storm,beat(t,4.2,5.4)*(1-beat(t,31.6,33)));storm.dx=.1*wave(t,5.4,31.6,.3);
   // The flag slides down the ladder to Serie B, then climbs back up.
   const span=LAD_HI-LAD_LO,upT=manual?beat(act,.05,.95):beat(t,26,30.5);
   flag.dy=span*(1-beat(t,10.2,12.4))+span*upT;
   mates.forEach((m,i)=>{m.body.yaw=(i-1)*.3*beat(t,15.6,16.6)*(1-beat(t,31.4,32.2));});
   // He decides to stay.
   stay.s=beat(t,21,21.8);show(hb,beat(t,21.4,22.2)*(1-beat(t,25,25.6)));H.body.x=-2.5+1.2*beat(t,22.2,23.6);
   counter.s=beat(t,24.1,24.9);balls.forEach((q,i)=>{q.s=beat(t,25+i*.35,25.4+i*.35);});
   cup.s=beat(t,29.2,30);ban.dy=.04*wave(t,29,38,.6);show(ban,beat(t,29,30));
   const cheer=beat(t,31.5,32.1);mates.forEach((m,i)=>{m.armL.rot=-.12-2.3*cheer-.25*wave(t,32.1,36,1.3+i*.2);m.armR.rot=.12+2.3*cheer;});
   H.armL.rot=-.12-2.3*cheer;H.armR.rot=.12+2.3*cheer;
   show(sun,beat(t,34.4,35.4));sun.dy=.5*beat(t,34.4,37);sun.rot=.2*t;
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,9,10)+.3*beat(t,20.6,21.4)-.3*beat(t,23.6,24.4)+.4*beat(t,24.4,25)-.4*beat(t,31,32):0;
  };
 }};

/* ───────────── 6 · Brave enough to tell (talk, 2008 and after) ───────────── */
const talk:SpreadDef={id:'talk',rest:17.9,
 left:k=>{floor(k,-5,0,'#eadfc6','#bda97f');const rug=ell(-2.4,Z(.4),1.6,.7);k.fill(rug,INK.sky,.45);k.dots(rug,INK.blue,.05,.3);
  k.text('NUMERO 1',-2.4,Z(2.62),.46,INK.blue,{max:3.6});k.text('HIS BOOK · 2008',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{floor(k,0,5,'#f3e3bf','#c7af82');const st=ell(2.7,Z(.9),1.9,.8);k.fill(st,INK.pink,.35);k.dots(st,INK.red,.05,.25);
  k.text('FALL · GET BACK UP',2.5,Z(2.62),.4,INK.pink,{max:4.2});k.text('SPEAKING UP HELPS OTHERS TOO',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,2.1,INK.leaf,INK.navy);town(k,.3,10,2.5);}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2b0',INK.pink,y=>.4-y/3*.4);const cur=rect(0,0,4.5,.5);k.fill(cur,INK.red);k.dots(cur,'#b9383a',.04,.4);for(let x=.25;x<4.5;x+=.5)k.key(`M${x} 0 L${x} .5`,.01,'#8e2c2c');hills(k,4.5,2.2,INK.grass,INK.leaf);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'t-sun',.34),'L',3.6,2.0,{out:.015});
  const hearts=[0,1,2].map(i=>bd.add(heart(`t-h${i}`,.3),'R',1+i*1.1,2.0+(i%2)*.3,{out:.03}));
  bd.add(S.bunting(K+'t-bunt',3.6,.4,[INK.pink,INK.yellow,INK.sky,INK.orange]),'R',2.2,2.35,{out:.02});
  for(const [x,z] of [[1.9,-.6],[3.8,-.4]])B.stand(S.bench(K+`t-bench${x}`,1.1,.46),x,z,{layer:1});
  B.stand(S.lamp(K+'t-lamp',.4,1.7),4.6,-1.2,{layer:1});B.stand(S.bush(K+'t-bush',.9,.36),4.4,2.2,{layer:3,tab:false});
  const bookS=B.stand(sp('t-stand',2.0,.4,k=>{const p=rect(0,0,2.0,.4);k.fill(p,INK.wood);k.key(p,.012);k.keyFill(rect(.1,.4-.05,1.8,.05),INK.brown);}),-2.9,-1.3,{layer:1,s:0});
  const inside=bookS.add(bookInside('t-in',2.0,1.3,['FALL,','GET BACK UP']),0,.4,{z:.01});
  const cover=bookS.flap(bookCover('t-cover',1.0,1.3,'NUMERO 1',INK.blue),0,.4,{anchor:'bl',axis:'y',z:.02});
  const H=B.person(K+'t-hero',-4.2,.5,1.5,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'smile',layer:3,adult:true});
  const say=H.body.add(S.bubble(K+'t-say',.55,.46,'dots'),.5,H.h*.98,{z:-.02});
  const yrs=['2013','2019'].map((l,i)=>B.stand(S.flipCard(K+`t-y${l}`,.7,.34,l,i?INK.orange:INK.blue),-1.35+i*.85,.3,{layer:2,s:0}));
  const micP=B.stand(mic('t-mic',1.3),-1.75,.55,{layer:2,s:0});
  const K2=B.person(K+'t-keeper',-3.2,1.75,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'1',face:'grin',layer:3,holdL:'glove',holdR:'glove'});
  const age=B.stand(S.flipCard(K+'t-45',.6,.4,'45',INK.pink),-2.3,2.1,{layer:3,s:0,tab:false});
  const book2=B.stand(bookCover('t-b2',.62,.84,'2024',INK.orange),-1.0,-1.3,{layer:1,s:0});
  const kids=[0,1,2].map(i=>B.person(K+`t-kid${i}`,1.5+i*1.2,.9+(i%2)*.55,1.36,{shirt:(['bib','fan','casual'] as const)[i],hair:(['bun','curly','short'] as const)[i],skin:['#7f5138','#d99a6c','#b27650'][i],face:'smile',layer:3}));
  const kb=kids.map((kd,i)=>kd.body.add(S.bubble(K+`t-kb${i}`,.44,.38,'heart'),.36,kd.h*.98,{z:-.02}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.9):b.t;
   H.body.s=beat(t,.3,1.2);bookS.s=beat(t,2.3,3.2);
   show(say,pulse(t,7.8,10.8)+pulse(t,12.2,16.8));H.armR.rot=.12+1.2*pulse(t,8,10.6);
   yrs.forEach((y,i)=>{y.s=beat(t,11.2+i*1.6,11.9+i*1.6);});micP.s=beat(t,11,11.8);H.body.x=-4.2+2.0*beat(t,11,12.6);H.body.z=.5+.35*beat(t,11,12.6);
   // Open the book: inside, the message of his life.
   const open=Math.max(beat(t,18,19.4),manual?beat(act,.05,.9):0);cover.flip=-2.9*open;
   K2.body.s=beat(t,19.4,20.2);age.s=beat(t,21.2,22);const dive=pulse(t,20.4,22);K2.body.rot=-.5*dive;K2.armL.rot=-.12-2*dive;K2.armR.rot=.12+2*dive;
   book2.s=beat(t,23.7,24.5);
   // Fall, get back up again, fall, get back up again.
   const fall=Math.max(pulse(t,27.3,29.3),pulse(t,29.7,31.8));K2.body.rot+=1.25*fall;
   kids.forEach((kd,i)=>{kd.body.s=beat(t,7.8+i*.4,8.6+i*.4);show(kb[i],beat(t,33.4+i*.4,34+i*.4));kd.armR.rot=.12+1.6*beat(t,34.4+i*.3,35+i*.3);});
   hearts.forEach((h,i)=>{show(h,beat(t,33+i*.5,33.6+i*.5));h.dy=.05*wave(t,33.6,41,.6+i*.1);});
   show(sun,beat(t,36.4,37.4));sun.dy=.4*beat(t,36.4,39);sun.rot=.2*t;
   const cheer=beat(t,37,37.6);K2.armL.rot+=-2.2*cheer;K2.armR.rot+=2.2*cheer;
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,10.4,11.2)+.4*beat(t,11.2,12)-.4*beat(t,16.8,17.6)+.5*beat(t,32,33)-.5*beat(t,36,37):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={final,cloud,help,sunrise,serieb,talk};
void clamp01;
