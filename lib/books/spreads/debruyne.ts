/**
 * The six De Bruyne pop-up spreads (not wanted, not finished): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/debruyne/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Rejection is shown gently and symbolically: a suitcase, a closed door, a bench, a calendar, a door that opens.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='debruyne-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const GENK=[INK.blue,INK.white,INK.blue,INK.sky,INK.white,INK.blue,INK.yellow],CHE=[INK.blue,INK.white,INK.blue,INK.blue,INK.white,INK.navy,INK.blue],WOB=[INK.green,INK.white,INK.green,INK.leaf,INK.white,INK.green,INK.white],MCI=[INK.sky,INK.white,INK.sky,INK.navy,INK.white,INK.sky,INK.white];
const GINGER='#c8693a';

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

/* ───────────── De Bruyne plates ───────────── */
const house=(key:string,w:number,h:number)=>S.house(K+key,w,h);
const doorP=(key:string,w:number,h:number)=>S.door(K+key,w,h);
const suitcase=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.12,w,h*.88);k.fill(b,INK.red);k.dots(b,'#b9383a',.035,.3);k.key(b,.014);k.key(`M${w*.12} ${h*.2} L${w*.12} ${h*.95} M${w*.88} ${h*.2} L${w*.88} ${h*.95}`,.02,INK.yellow);k.fill(rect(w*.3,h*.45,w*.4,h*.2),INK.paper);k.text('KEVIN',w/2,h*.6,h*.1,INK.navy,{max:w*.36});});
const caseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#b9383a');k.key(b,.014);k.key(`M${w*.38} 0 L${w*.38} ${-h*.5} L${w*.62} ${-h*.5} L${w*.62} 0`,.02);k.fill(rect(w*.44,h*.3,w*.12,h*.4),INK.gold);},{rim:.014});
const caseInside=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.paper);k.key(b,.012);const f=rect(w*.1,h*.12,w*.36,h*.76);k.fill(f,INK.gold);k.key(f,.01);k.fill(rect(w*.15,h*.2,w*.26,h*.5),INK.sky2);
 k.fill(poly([[w*.17,h*.62],[w*.28,h*.36],[w*.39,h*.62]]),INK.red);k.fill(ell(w*.72,h*.5,w*.12,h*.2),INK.white);k.key(ell(w*.72,h*.5,w*.12,h*.2),.01);k.keyFill(ell(w*.72,h*.5,w*.04,h*.07));},{rim:.012});
const boarding=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,h*.14,w,h*.86);k.fill(b,'#d9c7a6');k.dots(b,INK.brown,.04,.2);k.key(b,.014);k.fill(rect(-.03,h*.08,w+.06,h*.08),INK.grey);k.key(rect(-.03,h*.08,w+.06,h*.08),.01);
 for(let r=0;r<3;r++)for(let c=0;c<3;c++){const win=rect(w*(.1+c*.3),h*(.26+r*.2),w*.18,h*.12);k.fill(win,(r*3+c)%4===1?INK.yellow:INK.blue);k.key(win,.01);}
 k.fill(rect(w*.4,h*.84,w*.2,h*.16),INK.navy);const s=rect(w*.15,h*.15,w*.7,h*.09);k.fill(s,INK.white);k.key(s,.008);k.text(label,w/2,h*.215,h*.06,INK.navy,{max:w*.64});});
const bubbleText=(key:string,w:number,h:number,text:string,color:string=INK.grey)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.15} L${w} ${h*.62} Q${w} ${h*.76} ${w*.9} ${h*.76} L${w*.36} ${h*.76} L${w*.2} ${h} L${w*.24} ${h*.76} L${w*.1} ${h*.76} Q0 ${h*.76} 0 ${h*.62} L0 ${h*.15} Q0 0 ${w*.1} 0 Z`;k.fill(p,color);k.key(p,.012);k.text(text,w/2,h*.5,h*.26,INK.navy,{max:w*.84});},{rim:.018});
const calPage=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);k.fill(rect(0,0,w,h*.28),color);k.text(label,w/2,h*.2,h*.16,INK.white,{max:w*.86});
 for(let r=0;r<3;r++)for(let c=0;c<5;c++)k.key(rect(w*(.08+c*.17),h*(.36+r*.2),w*.13,h*.14),.006,INK.grey);});
const frameDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.key(f,.014);const o=rect(w*.12,h*.1,w*.76,h*.9);k.fill(o,INK.leaf);k.dots(o,INK.green,.035,.35);k.key(o,.012);k.text('WOLFSBURG',w/2,h*.075,h*.06,INK.white,{max:w*.8});});
const bigDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.teal);k.dots(d,INK.navy,.035,.25);k.key(d,.013);k.key(rect(w*.12,h*.08,w*.76,h*.36),.01);k.key(rect(w*.12,h*.52,w*.76,h*.38),.01);k.circle(w*.84,h*.5,.03,INK.gold);},{rim:.012});
const ginger=(o:Record<string,unknown>)=>({hairColor:GINGER,...o});

/* ───────────── 1 · Far from home (genk) ───────────── */
const genk:SpreadDef={id:'genk',rest:14.0,
 left:k=>{floor(k,-5,0,'#e9dcbc','#bea77a');path(k,[[-4.4,Z(1.5)],[-2.6,Z(1.1)],[-1,Z(1.3)],[0,Z(1.0)]],.5);
  k.text('DRONGEN',-2.4,Z(2.62),.5,INK.blue,{max:3.6});k.text('HOME, NEAR GHENT · BELGIUM',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);path(k,[[0,Z(1.0)],[1.4,Z(1.3)]],.5);
  k.text('GENK',2.5,Z(2.62),.5,INK.pink,{max:3.6});k.text('THE YOUTH ACADEMY · AGED 14',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'g-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,2.1,INK.leaf,INK.navy);town(k,.3,10,2.5);}},
   {key:K+'g-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.7,2.6,GENK,2);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'g-sun',.34),'L',3.6,2.0,{out:.015});
  const cloudR=bd.add(stormCloud('g-cloud',1.2,.6,false),'R',2.2,2.0,{out:.03});
  B.stand(house('g-home',1.7,1.6),-3.2,-1.3,{layer:1});B.stand(S.tree(K+'g-tree',1.0,1.5,'round'),-1.3,-1.8,{layer:1});
  const mum=B.person(K+'g-mum',-4.2,-.2,1.62,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const dad=B.person(K+'g-dad',-2.2,-.1,1.72,ginger({shirt:'casual',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2}) as never);
  const kidL=B.person(K+'g-kidL',-3.1,.9,1.2,ginger({shirt:'bib',hair:'short',skin:'#f1b88f',face:'smile',layer:3,holdR:'suitcase'}) as never);
  const fourteen=B.stand(S.flipCard(K+'g-14',1.0,.36,'AGED 14',INK.orange),-1.3,1.9,{layer:3,s:0,tab:false});
  const board=B.stand(boarding('g-board',1.5,1.7,'BOARDING HOUSE'),1.4,-1.5,{layer:1,s:0});
  const host=B.stand(house('g-host',1.5,1.4),3.8,-1.3,{layer:1,s:0});
  const hostP=[B.person(K+'g-h1',3.3,-.4,1.64,{shirt:'coach',hair:'bun',adult:true,skin:'#f1b88f',face:'open',layer:2}),B.person(K+'g-h2',4.3,-.3,1.72,{shirt:'casual',hair:'short',adult:true,skin:'#d99a6c',face:'open',layer:2})];
  const kidR=B.person(K+'g-kidR',1.9,.8,1.2,ginger({shirt:'bib',hair:'short',skin:'#f1b88f',face:'shy',layer:3}) as never);
  const cs=B.stand(suitcase('g-case',.8,.55),2.9,1.3,{layer:3,s:0});const inner=cs.add(caseInside('g-in',.72,.42),0,.06,{z:.006});inner.scale=1;
  const lid=cs.flap(caseLid('g-lid',.84,.14),0,.55*.88+.14+.02,{anchor:'top',z:.02});
  const mini=kidR.body.add(stormCloud('g-mini',.5,.28),0,kidR.h*1.02,{z:-.02});
  const hb=kidR.body.add(S.bubble(K+'g-hb',.5,.42,'heart'),.4,kidR.h*.98,{z:-.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.0):b.t;
   mum.body.s=beat(t,1.9,2.7);dad.body.s=beat(t,2.2,3);kidL.body.s=beat(t,2.5,3.3)*(1-beat(t,8.8,9.6));
   fourteen.s=beat(t,7.4,8.2);mum.armR.rot=.12+2.2*beat(t,8.4,9)-2.2*beat(t,12,12.6)+.3*wave(t,9,12,1.3);dad.armL.rot=-.12-2.2*beat(t,8.6,9.2)+2.2*beat(t,12,12.6)-.3*wave(t,9.2,12,1.2);
   kidL.body.x=-3.1+2.4*beat(t,7.6,9.4);
   kidR.body.s=beat(t,9.4,10.2);cs.s=beat(t,9.8,10.6);
   // Open the suitcase: inside, a picture of home.
   const open=Math.max(beat(t,14.6,16),manual?beat(act,.05,.9):0);lid.flip=-2.6*open;
   board.s=beat(t,16.6,17.4);host.s=beat(t,20.2,21);hostP.forEach((p,i)=>{p.body.s=beat(t,20.6+i*.4,21.4+i*.4);});kidR.body.x=1.9+.4*beat(t,20,21.4);
   show(mini,beat(t,25.6,26.6));show(cloudR,beat(t,25.4,26.6));
   show(hb,beat(t,29.4,30.2));kidR.armR.rot=.12+1.5*beat(t,29.6,30.2);show(sun,beat(t,29,30));
   return b.narrated?-.5*beat(t,1.6,2.4)+.5*beat(t,8.8,9.8)+.45*beat(t,10,10.8)-.45*beat(t,28.2,29):0;
  };
 }};

/* ───────────── 2 · Not welcome any more (host) ───────────── */
const host:SpreadDef={id:'host',rest:11.5,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.4),1.0,1.0));
  k.text('AGED 16',-2.4,Z(2.62),.5,INK.blue,{max:3.6});k.text('BEING QUIET IS NOT A BAD THING',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{floor(k,0,5,'#e9dcbc','#bea77a');path(k,[[.7,Z(1.3)],[2.4,Z(1.45)],[4.3,Z(1.2)]],.5);
  k.text('A NEW ROOM',2.5,Z(2.62),.5,INK.pink,{max:3.8});k.text('ANOTHER BOARDING HOUSE',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'o-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.8,2.6,GENK,4);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'o-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);hills(k,4.5,2.2,'#8fa28c',INK.navy);town(k,.3,10,2.5);}},-3.05,1.22);
  const words=['TOO QUIET','TOO SHY','TOO STUBBORN'].map((l,i)=>bd.add(bubbleText(`o-w${i}`,1.1,.5,l),'L',3.7-i*1.3,1.9+(i%2)*.3,{out:.03}));
  const rain=bd.add(stormCloud('o-rain',1.4,.7),'R',2.2,1.9,{out:.03});
  const sun=bd.add(S.sun(K+'o-sun',.34),'R',3.6,2.2,{out:.015});
  const others=[0,1,2].map(i=>B.person(K+`o-p${i}`,-4.1+i*1.2,-.8+(i%2)*.5,1.2,{shirt:'navy',hair:(['curly','short','long'] as const)[i],skin:['#7f5138','#f1b88f','#d99a6c'][i],face:'grin',layer:2}));
  B.stand(S.goal(K+'o-goal',1.5,.8),-2.6,-1.8,{layer:1});B.stand(S.bench(K+'o-bench',1.1,.45),-1.1,.9,{layer:3});
  const hh=B.stand(house('o-host',1.6,1.5),1.2,-1.1,{layer:1});const hd=hh.flap(doorP('o-door',.3,.45),-.15,0,{anchor:'bl',axis:'y',z:.02});
  const hostP=[B.person(K+'o-h1',.55,-.3,1.64,{shirt:'coach',hair:'bun',adult:true,skin:'#f1b88f',face:'open',layer:2}),B.person(K+'o-h2',1.9,-.35,1.72,{shirt:'casual',hair:'short',adult:true,skin:'#d99a6c',face:'open',layer:2})];
  const bh=B.stand(boarding('o-board',1.6,1.8,'BOARDING HOUSE'),3.9,-1.4,{layer:1});void bh;
  const kid=B.person(K+'o-kid',1.0,1.3,1.3,ginger({shirt:'bib',hair:'short',skin:'#f1b88f',face:'shy',layer:3,holdR:'suitcase'}) as never);B.slot(1.0,1.45,3.9,1.45);
  const mini=kid.body.add(stormCloud('o-mini',.5,.28),0,kid.h*1.02,{z:-.02});
  const sixteen=B.stand(S.flipCard(K+'o-16',1.0,.36,'AGED 16',INK.orange),4.2,2.05,{layer:3,s:0,tab:false});
  const quiet=B.stand(S.sign(K+'o-quiet',1.5,1.1,'QUIET IS OKAY',INK.yellow),-2.6,2.0,{layer:3,s:0});
  const star=bd.add(starCard('o-star',.2),'R',1.2,2.3,{out:.03});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,11.5):b.t;
   others.forEach((p,i)=>{p.body.s=beat(t,.4+i*.3,1.2+i*.3);});hostP.forEach((p,i)=>{p.body.s=beat(t,2.3+i*.4,3.1+i*.4);});kid.body.s=beat(t,2.6,3.4);
   hostP[0].armR.rot=.12+1.2*pulse(t,3.6,7);
   words.forEach((w,i)=>show(w,beat(t,7.5+i*1.3,8.2+i*1.3)*(1-beat(t,27.6,28.6))));
   // Carry the suitcase to the new house (slot slider); the host family's door closes.
   const walk=Math.max(beat(t,12.2,18.6),manual?beat(act,.05,.95):0);kid.body.x=1.0+2.6*walk;
   hd.flip=-.9*(1-beat(t,13.6,15));hostP.forEach(p=>{p.body.s*=1-.0;});
   sixteen.s=beat(t,14.8,15.6);
   show(mini,beat(t,19.4,20.4)*(1-beat(t,29,30)));show(rain,beat(t,20,21.4)*(1-beat(t,29,30.4)));
   quiet.s=beat(t,28.6,29.4);show(sun,beat(t,29.6,30.6));sun.dy=.3*beat(t,29.6,34);show(star,beat(t,31,31.8));
   kid.armL.rot=-.12-1.4*beat(t,31.2,31.8);
   return b.narrated?-.45*beat(t,.4,1.4)+.9*beat(t,2.2,3.2)-.9*beat(t,7,7.8)+.9*beat(t,12,13)-.9*beat(t,27.6,28.6):0;
  };
 }};

/* ───────────── 3 · Five goals in one half (five) ───────────── */
const F_SHOTS=[8.4,9.5,10.6,11.7,12.8];
const five:SpreadDef={id:'five',rest:8.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.4),1.0,1.0));for(let i=0;i<5;i++)k.circle(-4.4+i*.5,Z(1.1),.05,INK.orange);
  k.text('TRAIN HARDER',-2.4,Z(2.62),.46,INK.blue,{max:3.8});k.text('GENK · 2009 AND 2011',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.2 ${Z(-2.1)} L2.2 ${Z(-.2)} L5 ${Z(-.2)}`);
  k.text('FIVE GOALS',2.5,Z(2.62),.5,INK.pink,{max:3.8});k.text('IN ONE HALF, AS A SUBSTITUTE',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.6,2.6,GENK,5);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.6,2.6,GENK,6);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'f-ban',2.8,.4,'GENK · CHAMPIONS 2011',INK.blue),'L',.4,2.8,{out:.02});
  const conf=bd.add(S.confetti(K+'f-cf',2.4,1.1,4),'L',.5,1.4,{out:.04});
  const coachP=B.person(K+'f-coach',-4.2,-.4,1.72,{shirt:'coach',hair:'cap',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const sub=B.stand(S.flipCard(K+'f-sub',1.1,.38,'SUBSTITUTE',INK.orange),-2.8,-1.2,{layer:1,s:0});
  const life=B.stand(lineCard('f-life',1.4,.66,['A LESSON','FOR LIFE'],INK.yellow),-1.3,-1.0,{layer:1,s:0});
  const debut=B.stand(S.flipCard(K+'f-2009',1.3,.36,'2009 · FIRST TEAM',INK.blue),-3.4,1.2,{layer:3,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'f-cup',.55,.9),-1.4,1.1,{layer:3,s:0});
  const mates=[0,1].map(i=>B.person(K+`f-m${i}`,-3.2+i*1.3,.2+i*.3,1.3,{shirt:'navy',hair:(['curly','short'] as const)[i],skin:['#7f5138','#f1b88f'][i],face:'grin',layer:2}));
  B.stand(S.goal(K+'f-goal',2.0,1.0),3.5,-1.33,{layer:1});
  const gk=B.person(K+'f-gk',3.5,-1.08,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'f-hero',1.3,.9,1.36,ginger({shirt:'navy',hair:'short',skin:'#f1b88f',number:'7',legs:'kick',face:'smile',layer:3}) as never);
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+`f-cone${i}`,.3),.5+i*.6,1.8,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'f-ball',.13),1.75,1.0,{layer:3,tab:false});
  const counter=B.stand(S.scoreboard(K+'f-count',1.2,1.2,'GOALS'),1.2,-1.5,{layer:1});counter.add(S.flipCard(K+'f-c5',.9,.5,'5',INK.pink),0,.3,{z:.012});
  const cnt=['0','1','2','3','4'].map((l,i)=>counter.flap(S.flipCard(K+`f-c${l}`,.9,.5,l,i%2?INK.blue:'#3d5da0'),0,.8,{z:.034-i*.004}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,8.0):b.t;
   H.body.s=beat(t,1.9,2.7);coachP.body.s=beat(t,2.2,3);mates.forEach((m,i)=>{m.body.s=beat(t,2.6+i*.3,3.4+i*.3);});
   // Training harder: a cone slalom.
   cones.forEach((c,i)=>{c.s=beat(t,4.6+i*.3,5.1+i*.3);});const sl=beat(t,5,6.8);H.body.x=1.3+.5*Math.sin(sl*Math.PI*2)*(t<7?1:0);
   sub.s=beat(t,7,7.8);coachP.armR.rot=.12+1.5*beat(t,7.2,7.8)*(1-beat(t,9,9.6));
   // Five goals: each kick flips the counter.
   const n=manual?act*5:F_SHOTS.reduce((a,s)=>a+beat(t,s,s+.6),0);
   const k=Math.min(4,Math.floor(n)),u=manual?clamp01((act*5-k)):clamp01(n-k);
   const shotU=n>=5?1:u;ball.x=1.75+1.9*shotU;ball.z=1.0-2.2*shotU;ball.dy=.35*Math.sin(shotU*Math.PI);ball.rot=-shotU*8;
   const kickP=manual?pulse(u,0,.25):maxKick(t);H.leg!.rot=-1.1*kickP;
   cnt.forEach((c,i)=>{c.flip=-3.2*clamp01((n-i-.4)/.5);});
   const dive=Math.sin(Math.min(1,u)*Math.PI)*(n<5||u<1?1:0);gk.body.rot=(k%2?.7:-.7)*dive;gk.armL.rot=-.12-2*dive;gk.armR.rot=.12+2*dive;
   life.s=beat(t,16.4,17.2);debut.s=beat(t,21.4,22.2);cup.s=beat(t,25.8,26.6);show(ban,beat(t,26,26.8));conf.dy=-1+1.2*beat(t,26,28.4);conf.visible=t>25.9;
   const cheer=beat(t,26.4,27);mates.forEach((m,i)=>{m.armL.rot=-.12-2.2*cheer-.25*wave(t,27,31,1.2+i*.2);m.armR.rot=.12+2.2*cheer;});
   H.armL.rot=-.12-2.2*Math.max(beat(t,13.4,14)*(1-beat(t,15.4,16)),cheer);H.armR.rot=.12+2.2*Math.max(beat(t,13.4,14)*(1-beat(t,15.4,16)),cheer);
   return b.narrated?.45*beat(t,3.8,4.6)-.45*beat(t,15.6,16.4)-.45*beat(t,20.6,21.4)+.45*beat(t,29,30):0;
  };
 }};
function maxKick(t:number){let m=0;for(const s of F_SHOTS)m=Math.max(m,pulse(t,s-.3,s+.2));return m;}

/* ───────────── 4 · Stuck on the bench (chelsea) ───────────── */
const chelsea:SpreadDef={id:'chelsea',rest:16.0,
 left:k=>{pitch(k,-5,0,'#8fbf77','#5daa6a',.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('WERDER BREMEN',-2.4,Z(2.62),.4,INK.green,{max:4});k.text('ON LOAN IN GERMANY · 2012',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.6),1.0,1.0));
  k.text('CHELSEA',2.5,Z(2.62),.5,INK.blue,{max:3.8});k.text('MOSTLY ON THE BENCH · 2013',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.6,2.6,WOB,3);k.fill(rect(0,2.6,4.5,.4),'#8fbf77');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.5,2.6,CHE,4);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const cloudR=bd.add(stormCloud('c-cloud',1.3,.65),'R',2.6,1.9,{out:.03});
  const dream=bd.add(bubbleText('c-dream',1.2,.5,'A DREAM MOVE',INK.yellow),'R',1.0,2.0,{out:.03});
  const HB=B.person(K+'c-heroB',-2.6,.6,1.36,ginger({shirt:'arg',hair:'short',skin:'#f1b88f',legs:'kick',face:'grin',layer:3}) as never);
  const ticks=[0,1,2].map(i=>B.stand(S.icon(K+`c-t${i}`,.3,'tick'),-4.3+i*.45,1.9,{layer:3,s:0,tab:false}));
  const ballB=B.stand(S.ball(K+'c-ballB',.12),-2.1,.7,{layer:3,tab:false});
  B.stand(S.goal(K+'c-goalB',1.6,.85),-3.9,-1.4,{layer:1});
  const brem=[0,1].map(i=>B.person(K+`c-w${i}`,-4.3+i*2.9,.3+i*.9,1.28,{shirt:'arg',hair:(['curly','short'] as const)[i],skin:['#d99a6c','#f1b88f'][i],face:'grin',layer:i?3:2}));
  const cal=B.stand(sp('c-calstand',1.3,.3,k=>{const p=rect(0,0,1.3,.3);k.fill(p,INK.wood);k.key(p,.012);}),-1.2,-1.4,{layer:1});
  cal.add(calPage('c-cal3',1.1,.9,'DEC 2013',INK.red),0,.3,{z:.01});const pages=['AUG 2013','SEP 2013','OCT 2013'].map((l,i)=>cal.flap(calPage(`c-cal${i}`,1.1,.9,l,[INK.blue,INK.teal,INK.orange][i]),0,1.2,{z:.03-i*.005}));
  B.stand(S.bench(K+'c-bench',1.6,.6),3.3,-1.2,{layer:1});
  const mgr=B.person(K+'c-mgr',4.5,-.8,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const H=B.person(K+'c-hero',1.2,.6,1.36,ginger({shirt:'navy',hair:'short',skin:'#f1b88f',legs:'kick',face:'smile',layer:3}) as never);B.slot(1.2,.75,2.9,-.3);
  const mate=B.person(K+'c-mate',3.4,1.3,1.32,{shirt:'navy',hair:'curly',skin:'#7f5138',legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'c-ball',.12),1.65,.7,{layer:3,tab:false});
  const mini=H.body.add(stormCloud('c-mini',.5,.28),0,H.h*1.02,{z:-.02});
  const friend=B.person(K+'c-friend',-.8,1.5,1.3,{shirt:'casual',hair:'short',skin:'#d99a6c',face:'smile',layer:3});
  const hb=friend.body.add(S.bubble(K+'c-hb',.5,.42,'heart'),.4,friend.h*.98,{z:-.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.0):b.t;
   show(dream,beat(t,3,3.8)*(1-beat(t,8,8.6)));H.body.s=beat(t,2.4,3.2);mate.body.s=beat(t,12.4,13.2);
   HB.body.s=beat(t,7.4,8.2)*(1-beat(t,12,12.6));brem.forEach((m,i)=>{m.body.s=beat(t,7.6+i*.3,8.4+i*.3);const c=beat(t,10,10.5)*(1-beat(t,11.6,12));m.armL.rot=-.12-2.2*c;m.armR.rot=.12+2.2*c;});ticks.forEach((q,i)=>{q.s=beat(t,9.2+i*.6,9.7+i*.6)*(1-beat(t,12,12.6));});
   const sh=beat(t,9,10);ballB.x=-2.1-1.6*sh;ballB.z=.7-1.9*sh;ballB.dy=.3*Math.sin(sh*Math.PI);ballB.visible=t>7.6&&t<12.3;HB.leg!.rot=-1.1*pulse(t,8.7,9.3);
   // The assist in his first league game.
   const ps=beat(t,13.2,14);const sc=beat(t,14.4,15.2);ball.x=1.65+(3.2-1.65)*ps+(4.0-3.2)*sc;ball.z=.7+(1.35-.7)*ps+(-1.4-1.35)*sc;ball.dy=.3*Math.sin(sc*Math.PI);ball.visible=t>2.4&&t<16.4;
   H.leg!.rot=-1.1*pulse(t,12.9,13.5);mate.leg!.rot=-1.1*pulse(t,14.1,14.7);const c1=beat(t,15,15.4)*(1-beat(t,16.2,16.6));mate.armL.rot=-.12-2.2*c1;mate.armR.rot=.12+2.2*c1;
   // Turn the calendar pages: time passes on the bench.
   pages.forEach((p,i)=>{const n=manual?beat(act,i/3,i/3+.3):beat(t,[16.8,17.5,18.2][i],[17.3,18,18.7][i]);p.flip=-3.2*n;});
   const sit=manual?beat(act,.2,.9):beat(t,18.8,21);H.body.x=1.2+1.7*sit;H.body.z=.6-.9*sit;
   mgr.body.s=beat(t,21.6,22.4);mgr.armL.rot=-.12-1.3*pulse(t,22.6,26.4);
   show(mini,beat(t,27,28));show(cloudR,beat(t,27.2,28.4));H.body.yaw=-.3*beat(t,27,28);
   friend.body.s=beat(t,31,31.8);show(hb,beat(t,31.8,32.6));
   return b.narrated?-.45*beat(t,7,7.8)+.9*beat(t,12,12.8)-.45*beat(t,16.4,17.2)+.45*beat(t,18.6,19.4)-.45*beat(t,30.6,31.4):0;
  };
 }};

/* ───────────── 5 · Brave enough to move (wolfsburg) ───────────── */
const wolfsburg:SpreadDef={id:'wolfsburg',rest:15.4,
 left:k=>{floor(k,-5,0,'#e6dcc4','#b9a57c');
  k.text('BELGIUM',-2.4,Z(2.62),.5,INK.red,{max:3.6});k.text('PLAY AS MUCH AS YOU CAN',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#8fbf77','#5daa6a',.8);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.6),1.0,1.0));
  k.text('WOLFSBURG',2.5,Z(2.62),.5,INK.green,{max:3.8});k.text('21 ASSISTS · CUP WINNERS 2015',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);hills(k,4.5,2.2,'#8fa28c',INK.navy);town(k,.3,10,2.5);}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.5,2.6,WOB,5);k.fill(rect(0,2.6,4.5,.4),'#8fbf77');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'w-ban',2.4,.4,'GERMAN CUP 2015',INK.green),'R',.4,2.8,{out:.02});
  const conf=bd.add(S.confetti(K+'w-cf',2.4,1.1,5),'R',.5,1.4,{out:.04});
  const bcoach=B.person(K+'w-coach',-4.1,-.4,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const tip=bcoach.body.add(bubbleText('w-tip',1.2,.5,'PLAY!',INK.yellow),.7,bcoach.h*.98,{z:-.02});
  const bel=[0,1].map(i=>B.person(K+`w-b${i}`,-3.0+i*.9,-1.0+i*.3,1.28,{shirt:'casual',hair:(['curly','short'] as const)[i],skin:['#7f5138','#f1b88f'][i],face:'grin',layer:1}));
  const HL=B.person(K+'w-heroL',-1.8,.8,1.38,ginger({shirt:'casual',hair:'short',skin:'#f1b88f',face:'shy',layer:3}) as never);
  const hand=HL.body.add(S.bubble(K+'w-ask',.5,.42,'dots'),.42,HL.h*.98,{z:-.02});
  const jan=B.stand(S.flipCard(K+'w-jan',1.3,.38,'JANUARY 2014',INK.blue),-3.4,1.9,{layer:3,s:0,tab:false});
  const frame=B.stand(frameDoor('w-frame',1.1,1.7),1.1,-.6,{layer:2});const dr=frame.flap(bigDoor('w-door',.84,1.53),-.42,0,{anchor:'bl',axis:'y',z:.02});
  const HR=B.person(K+'w-heroR',2.6,.5,1.38,ginger({shirt:'arg',hair:'short',skin:'#f1b88f',legs:'kick',face:'grin',layer:3}) as never);
  const mates=[0,1].map(i=>B.person(K+`w-m${i}`,3.6+i*.8,-1.0+i*.9,1.3,{shirt:'arg',hair:(['short','curly'] as const)[i],skin:['#f1b88f','#d99a6c'][i],legs:'kick',face:'grin',layer:2}));
  const assists=Array.from({length:7},(_,i)=>B.stand(S.arrow(K+`w-a${i}`,.34,.2,INK.yellow),1.3+i*.45,2.05,{layer:3,s:0,tab:false}));
  const rec=B.stand(S.flipCard(K+'w-rec',1.3,.36,'21 ASSISTS',INK.pink),.9,1.5,{layer:3,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'w-cup',.55,.9),4.5,1.2,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'w-ball',.12),3.0,.55,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.4):b.t;
   bcoach.body.s=beat(t,2.2,3);show(tip,beat(t,3.4,4.2)*(1-beat(t,7,7.6)));bel.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.3,3.4+i*.3);});
   HL.body.s=beat(t,6.8,7.6)*(1-beat(t,16.6,17.4));HL.armR.rot=.12+2.4*beat(t,8,8.6)*(1-beat(t,11,11.6));show(hand,beat(t,8.4,9.2)*(1-beat(t,11.2,11.8)));
   jan.s=beat(t,11.6,12.4);
   // Open the door to Wolfsburg.
   const open=Math.max(beat(t,16.2,17.6),manual?beat(act,.05,.8):0);dr.flip=-.95*open;
   HR.body.s=Math.max(beat(t,17.6,18.4),manual?beat(act,.6,.95):0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,18.2+i*.4,19+i*.4),manual?beat(act,.7,1):0);});
   // 21 assists: passes to teammates, arrows pop.
   const pass=(a:number)=>beat(t,a,a+.6);const p1=pass(23.4),p2=pass(25.4);ball.x=3.0+(3.6-3.0)*p1+(3.0-3.6)*0;ball.z=.55+(-1.0-.55)*p1;
   if(t>25.4){ball.x=3.0+(4.4-3.0)*p2;ball.z=.55+(-.1-.55)*p2;}ball.visible=t>18||manual;
   HR.leg!.rot=-1.1*Math.max(pulse(t,23.1,23.7),pulse(t,25.1,25.7));
   assists.forEach((a,i)=>{a.s=beat(t,22.8+i*.5,23.2+i*.5);});rec.s=beat(t,24.6,25.4);
   cup.s=beat(t,29.8,30.6);show(ban,beat(t,30,30.8));conf.dy=-1+1.2*beat(t,30,32.4);conf.visible=t>29.9;
   const cheer=beat(t,30.6,31.2);[HR,...mates].forEach(m=>{m.armL.rot=-.12-2.2*cheer;m.armR.rot=.12+2.2*cheer;});
   return b.narrated?-.5*beat(t,1.8,2.8)+.5*beat(t,15.4,16.2)+.45*beat(t,17,17.8)-.45*beat(t,32.4,33.2):0;
  };
 }};

/* ───────────── 6 · Not finished (city) ───────────── */
const city:SpreadDef={id:'city',rest:18.4,
 left:k=>{floor(k,-5,0,'#e1ecf3','#a7c0d1');
  k.text('2015 · MANCHESTER',-2.4,Z(2.62),.4,INK.blue,{max:4});k.text('TEN SEASONS · A CLUB RECORD FEE',-2.4,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.6),1.0,1.0));
  k.text('NOT FINISHED',2.5,Z(2.62),.5,INK.pink,{max:3.8});k.text('KEEP GOING',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'y-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,2.2,INK.leaf,INK.navy);town(k,.3,10,2.5);}},
   {key:K+'y-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.4,2.6,MCI,6);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'y-ban',2.4,.4,'NOT FINISHED',INK.pink),'R',.4,2.8,{out:.02});
  const fw=[bd.add(S.firework(K+'y-fw1',.4,INK.sky),'R',1.2,2.2,{out:.03}),bd.add(S.firework(K+'y-fw2',.36,INK.pink),'R',3.3,2.3,{out:.03})];
  const sun=bd.add(S.sun(K+'y-sun',.34),'L',3.6,2.0,{out:.015});
  const fee=B.stand(lineCard('y-fee',1.5,.66,['2015','CLUB RECORD'],INK.sky),-3.45,-1.3,{layer:1,s:0});
  const ten=B.stand(S.flipCard(K+'y-10',1.3,.36,'TEN SEASONS',INK.blue),-2.1,-1.5,{layer:1,s:0});
  const big=B.stand(S.trophy(K+'y-cl',.8,1.3),-4.35,.5,{layer:2,s:0});
  const pl=Array.from({length:6},(_,i)=>B.stand(S.trophy(K+`y-pl${i}`,.3,.5),-2.8+i*.42,.5,{layer:2,s:0}));
  const pts=B.stand(S.scoreboard(K+'y-pts',1.3,1.1,'POINTS'),-.9,-1.2,{layer:1,s:0});pts.add(S.flipCard(K+'y-100',1.0,.5,'100',INK.pink),0,.27,{z:.012});
  const cups=[['5 LEAGUE CUPS',-3.4],['2 FA CUPS',-1.6]].map(([l,x],i)=>B.stand(S.flipCard(K+`y-lc${i}`,1.5,.36,l as string,i?INK.orange:INK.teal),x as number,1.9,{layer:3,s:0,tab:false}));
  const H=B.person(K+'y-hero',2.4,.5,1.5,ginger({shirt:'fan',hair:'short',skin:'#f1b88f',adult:true,face:'smile',layer:3}) as never);
  const lift=H.body.add(S.trophy(K+'y-lift',.5,.8),0,H.h*.62,{z:.03});
  const mates=[0,1,2].map(i=>B.person(K+`y-m${i}`,[1.0,3.8,4.3][i],[-.6,1.1,-.7][i],1.34,{shirt:'fan',hair:(['curly','short','long'] as const)[i],skin:['#7f5138','#d99a6c','#f1b88f'][i],face:'grin',layer:i===1?3:2}));
  const kid=B.person(K+'y-kid',1.2,1.6,1.0,ginger({shirt:'bib',hair:'short',skin:'#f1b88f',face:'smile',layer:3,holdR:'suitcase'}) as never);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.4):b.t;
   fee.s=beat(t,2.2,3);H.body.s=beat(t,1.9,2.7);ten.s=beat(t,7.6,8.4);
   big.s=beat(t,10,10.8);pl.forEach((q,i)=>{q.s=beat(t,11.2+i*.35,11.7+i*.35);});pts.s=beat(t,15,15.8);
   mates.forEach((m,i)=>{m.body.s=beat(t,9.8+i*.4,10.6+i*.4);});
   // Raise the trophy: it lifts up above his head on his arms.
   const up=Math.max(beat(t,19.4,20.8),manual?beat(act,.05,.9):0);lift.dy=H.h*.5*up;lift.scale=.6+.4*up;
   H.armL.rot=-.12-2.6*up;H.armR.rot=.12+2.6*up;
   fw.forEach((f,i)=>{show(f,beat(t,20.4+i*.5,21.4+i*.5));f.rot=t*.2;});
   cups.forEach((c,i)=>{c.s=beat(t,21.4+i*.9,22.2+i*.9);});
   const cheer=beat(t,21,21.6);mates.forEach((m,i)=>{m.armL.rot=-.12-2.2*cheer-.25*wave(t,21.6,26,1.2+i*.2);m.armR.rot=.12+2.2*cheer;});
   // The boy who was sent away: a small cut-out of him with his suitcase stands beside the star.
   kid.body.s=beat(t,24.8,25.6);kid.armL.rot=-.12-1.6*beat(t,26,26.6);
   show(ban,beat(t,31.4,32.2));ban.dy=.04*wave(t,32.2,36,.6);show(sun,beat(t,31.6,32.6));
   return b.narrated?-.5*beat(t,1.6,2.4)+.5*beat(t,18.6,19.4)+.3*beat(t,24.4,25.2)-.3*beat(t,31,31.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={genk,host,five,chelsea,wolfsburg,city};
void track;
