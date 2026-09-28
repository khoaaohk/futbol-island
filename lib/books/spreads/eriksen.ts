/**
 * The six Eriksen pop-up spreads (a team around you): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/eriksen/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The cardiac arrest is told gently and symbolically: a quiet heart card, a circle of friends, helpers, a heart that beats again.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='eriksen-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const DEN=[INK.red,INK.white,INK.red,INK.red,INK.white,INK.pink,INK.red],FIN=[INK.white,INK.blue,INK.white,INK.sky,INK.blue,INK.white,INK.white];

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

/* ───────────── Eriksen plates ───────────── */
const heartPath=(cx:number,cy:number,s:number)=>`M${cx} ${cy+s*.42} C${cx-s*.62} ${cy} ${cx-s*.32} ${cy-s*.5} ${cx} ${cy-s*.18} C${cx+s*.32} ${cy-s*.5} ${cx+s*.62} ${cy} ${cx} ${cy+s*.42} Z`;
/** A heart card on a stand: 'quiet' (grey, flat line) or 'beat' (red, heartbeat line). */
const heartCard=(key:string,w:number,state:'quiet'|'beat')=>sp(key,w,w*1.25,k=>{const h=w*1.25;k.keyFill(rect(w*.46,h*.78,w*.08,h*.22),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.dots(b,state==='beat'?INK.pink:INK.grey,.04,.25);k.key(b,.014);
 const hp=heartPath(w/2,h*.3,w*.62);k.fill(hp,state==='beat'?INK.red:'#a9a6b8');k.dots(hp,state==='beat'?INK.pink:INK.navy,.03,.25);k.key(hp,.014);
 const y=h*.64;k.key(state==='beat'?`M${w*.08} ${y} L${w*.34} ${y} L${w*.42} ${y-h*.1} L${w*.52} ${y+h*.07} L${w*.6} ${y} L${w*.92} ${y}`:`M${w*.08} ${y} L${w*.92} ${y}`,.022,state==='beat'?INK.red:INK.navy);});
const bigHeart=(key:string,s:number,color:string=INK.red)=>sp(key,s,s,k=>{const hp=heartPath(s/2,s*.5,s*.95);k.fill(hp,color);k.dots(hp,INK.pink,.03,.35);k.key(hp,.014);},{rim:.022});
const pole=(key:string,h:number)=>sp(key,.07,h,k=>{const p=rect(0,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(0,y,.07,.08),INK.red);k.key(p,.008);},{rim:.015});
const helpFlag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,0],[w,h*.1],[w*.9,h*.5],[w,h*.9],[0,h]]);k.fill(p,INK.yellow);k.dots(p,INK.orange,.03,.3);k.key(p,.012);k.fill(heartPath(w*.45,h*.52,h*.62),INK.red);},{rim:.015});
const medKit=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w*.35} ${h*.2} L${w*.35} ${h*.05} L${w*.65} ${h*.05} L${w*.65} ${h*.2}`,.03);const b=rect(0,h*.2,w,h*.8);k.fill(b,INK.green);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.fill(heartPath(w/2,h*.58,h*.5),INK.white);},{rim:.018});
const aedBox=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#e9e24a');k.dots(b,INK.green,.035,.3);k.key(b,.014);k.fill(heartPath(w/2,h*.42,h*.5),INK.red);k.key(`M${w*.5} ${h*.22} L${w*.42} ${h*.44} L${w*.56} ${h*.44} L${w*.48} ${h*.64}`,.02,INK.white);k.fill(rect(w*.15,h*.78,w*.7,h*.1),INK.navy);},{rim:.018});
const cprCard=(key:string,s:number)=>sp(key,s,s,k=>{const b=rect(0,0,s,s);k.fill(b,INK.sky2);k.key(b,.013);k.fill(heartPath(s/2,s*.58,s*.55),INK.pink);k.key(heartPath(s/2,s*.58,s*.55),.01);
 for(const [x,r] of [[s*.42,0],[s*.58,0]]){void r;const hd=`M${x-s*.1} ${s*.44} Q${x} ${s*.3} ${x+s*.1} ${s*.44} L${x+s*.08} ${s*.18} L${x-s*.08} ${s*.18} Z`;k.fill(hd,'#e8b58f');k.key(hd,.01);}},{rim:.018});
const hospital=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.12,w,h*.88);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.25);k.key(b,.014);k.fill(rect(-.02,h*.08,w+.04,h*.06),INK.teal);
 for(let r=0;r<3;r++)for(let c=0;c<4;c++){const win=rect(w*(.08+c*.23),h*(.3+r*.2),w*.14,h*.12);k.fill(win,(r+c)%3===0?INK.yellow:INK.sky);k.key(win,.01);}
 const s=rect(w*.25,h*.14,w*.5,h*.12);k.fill(s,INK.teal);k.key(s,.01);k.text('HOSPITAL',w/2,h*.235,h*.08,INK.white,{max:w*.44});k.fill(rect(w*.42,h*.86,w*.16,h*.14),INK.navy);});
const icdCard=(key:string,w:number)=>sp(key,w,w*1.1,k=>{const h=w*1.1,b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.25);k.key(b,.014);
 const hp=heartPath(w*.4,h*.34,w*.5);k.fill(hp,INK.red);k.key(hp,.012);const dv=`M${w*.66} ${h*.22} L${w*.86} ${h*.22} Q${w*.9} ${h*.22} ${w*.9} ${h*.27} L${w*.9} ${h*.42} Q${w*.9} ${h*.47} ${w*.86} ${h*.47} L${w*.66} ${h*.47} Q${w*.62} ${h*.47} ${w*.62} ${h*.42} L${w*.62} ${h*.27} Q${w*.62} ${h*.22} ${w*.66} ${h*.22} Z`;k.fill(dv,INK.grey);k.key(dv,.012);k.key(`M${w*.62} ${h*.36} Q${w*.52} ${h*.4} ${w*.48} ${h*.36}`,.01);
 const y=h*.66;k.key(`M${w*.08} ${y} L${w*.3} ${y} L${w*.36} ${y-h*.08} L${w*.44} ${y+h*.06} L${w*.5} ${y} L${w*.62} ${y} L${w*.68} ${y-h*.08} L${w*.76} ${y+h*.06} L${w*.82} ${y} L${w*.92} ${y}`,.018,INK.red);k.text('ICD',w/2,h*.92,h*.14,INK.navy);},{rim:.018});
const gateLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,INK.navy);for(let x=w*.15;x<w;x+=w*.17)k.keyFill(rect(x-.015,0,.03,h),INK.navy);k.fill(rect(0,h*.45,w,.05),INK.yellow);k.key(rect(0,h*.45,w,.05),.008);for(let x=w*.15;x<w;x+=w*.17)k.fill(poly([[x-.04,0],[x,-.0-.001],[x+.04,0]]),INK.navy);},{rim:.016});
const arrowSign=(key:string,w:number,h:number,text:string,color:string,left=false)=>sp(key,w,h+.6,k=>{k.keyFill(rect(w*.46,h,w*.08,.6),INK.brown);const p=left?poly([[0,h/2],[w*.18,0],[w,0],[w,h],[w*.18,h]]):poly([[0,0],[w*.82,0],[w,h/2],[w*.82,h],[0,h]]);k.fill(p,color);k.dots(p,INK.navy,.03,.18);k.key(p,.012);k.text(text,left?w*.58:w*.42,h*.7,h*.46,INK.white,{max:w*.66});});
const house=(key:string,w:number,h:number)=>S.house(K+key,w,h);
const doorP=(key:string,w:number,h:number)=>S.door(K+key,w,h);

/* ───────────── 1 · A sudden, scary moment (parken) ───────────── */
const parken:SpreadDef={id:'parken',rest:17.6,
 left:k=>{pitch(k,-5,0);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('EURO 2020',-2.4,Z(2.62),.5,INK.red,{max:3.6});k.text('DENMARK · FINLAND',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M4.85 ${Z(-2.1)} L4.85 ${Z(2.3)}`);
  k.text('COPENHAGEN',2.5,Z(2.62),.42,INK.blue,{max:4});k.text('12 JUNE 2021',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.6,DEN,1);lightRig(k,1.2,.4);lightRig(k,3.6,.45);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.25,2.6,FIN,3);lightRig(k,1.2,.4);lightRig(k,3.7,.45);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'p-ban',2.4,.4,'EURO 2020',INK.red),'L',.3,2.8,{out:.02});
  const heartQ=bd.add(heartCard('p-heart',.7,'quiet'),'R',2.2,1.2,{out:.03});
  const rare=bd.add(S.flipCard(K+'p-rare',1.0,.34,'VERY RARE',INK.blue),'R',3.5,1.35,{out:.03});
  const board=B.stand(S.scoreboard(K+'p-board',2.0,1.5,'DENMARK – FINLAND'),-2.6,-1.6,{layer:1});board.add(S.flipCard(K+'p-00',1.5,.7,'0 – 0','#3d5da0'),0,.4,{z:.012});
  B.stand(S.floodlight(K+'p-flood',.5,1.9),-4.6,-1.8,{layer:1});
  B.stand(S.bench(K+'p-bench',1.2,.5),-4.1,-.3,{layer:2});
  const coachP=B.person(K+'p-coach',-3.6,-.1,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const d1=B.person(K+'p-d1',-1.6,.4,1.3,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'6',face:'open',layer:2});
  const f1=B.person(K+'p-f1',-3.0,1.2,1.3,{shirt:'fan',hair:'curly',skin:'#f1b88f',face:'open',layer:3});
  const H=B.person(K+'p-hero',2.0,.7,1.4,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'10',face:'smile',layer:3});
  const thrower=B.person(K+'p-throw',4.55,.1,1.32,{shirt:'casual',hair:'curly',skin:'#d99a6c',number:'2',face:'open',layer:2,holdL:'ball',holdR:'none'});
  const kjaer=B.person(K+'p-kjaer',3.3,1.35,1.42,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'4',face:'open',layer:3});
  const flagPole=B.stand(pole('p-pole',1.2),3.85,1.6,{layer:3});const flag=flagPole.flap(helpFlag('p-flag',.5,.34),.035,1.2,{anchor:'bl',axis:'y',z:.01});
  const medics=[0,1].map(i=>B.person(K+`p-med${i}`,4.4-i*.2,-1.0+i*.7,1.6,{shirt:'keeper',hair:(['short','bun'] as const)[i],skin:['#d99a6c','#f1b88f'][i],adult:true,face:'open',layer:2}));
  const kit=B.stand(medKit('p-kit',.5,.42),2.9,-.3,{layer:2,s:0,tab:false});
  const signs=[['STAY CALM',-3.9],['GET A GROWN-UP',-1.6]].map(([l,x],i)=>B.stand(S.sign(K+`p-sg${i}`,1.5,1.1,l as string,INK.yellow),x as number,2.0,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.6):b.t;
   ban.dy=.04*wave(t,1,38,.5);
   const pop=[d1,f1,H,thrower,kjaer].map((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);return p;});void pop;
   coachP.body.s=beat(t,5,5.8);
   // The throw-in: arms up, the ball ready; then he suddenly goes down (the paper figure folds gently flat).
   const up=beat(t,10.2,11)*(1-beat(t,13.4,14));thrower.armL.rot=-.12-2.6*up;thrower.armR.rot=.12+2.6*up;
   H.body.yaw=.5*beat(t,10.6,11.4);
   const down=beat(t,13.6,15.2);H.body.s=beat(t,4.2,5)*(1-.86*down);
   [d1,f1,thrower,kjaer].forEach((p,i)=>{p.body.yaw=(i%2?-.4:.4)*beat(t,14.6+i*.2,15.4+i*.2);});
   coachP.armR.rot=.12+1.3*beat(t,15.4,16);
   // Wave the help flag.
   const fl=manual?(act<.9?.8*Math.sin(act/.9*TAU*2):0):.8*wave(t,17.8,19.6,1.4);flag.flip=fl;
   kjaer.armR.rot=.12+2.4*Math.max(beat(t,17.6,18)*(1-beat(t,19.6,20.2)),manual?pulse(act,0,1):0);
   // His heart had stopped beating properly (a quiet heart card); it is very rare.
   show(heartQ,beat(t,19.8,20.8)*(1-beat(t,36,37.5)));show(rare,beat(t,23,23.8));
   // Kjær turns him onto his side; the medical team rushes on.
   kjaer.body.x=3.3-.75*beat(t,26.6,28);kjaer.body.z=1.35-.35*beat(t,26.6,28);
   medics.forEach((m,i)=>{m.body.s=beat(t,29.8+i*.4,30.6+i*.4);m.body.x=(4.4-i*.2)-(1.1-i*.2)*beat(t,30.4+i*.3,32.4+i*.3);});kit.s=beat(t,31.6,32.4);
   signs.forEach((s,i)=>{s.s=beat(t,34.4+i*1.2,35.2+i*1.2);});
   return b.narrated?.45*beat(t,9.6,10.4)+.2*beat(t,14,15)-.65*beat(t,34,35):0;
  };
 }};

/* ───────────── 2 · A circle of friends (circle) ───────────── */
const RING=[[1.3,.35],[1.75,-.75],[2.9,-1.15],[4.05,-.75],[4.4,.35],[3.7,1.2],[1.9,1.25]];
const circle:SpreadDef={id:'circle',rest:14.0,
 left:k=>{pitch(k,-5,0);chalk(k,ell(0,Z(-.6),1.0,1.0));chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);
  k.text('TOGETHER',-2.4,Z(2.62),.5,INK.red,{max:3.6});k.text('THEY STOOD BY THEIR FRIEND',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,ell(2.85,Z(.1),1.7,1.05));
  k.text('A CIRCLE OF FRIENDS',2.5,Z(2.62),.36,INK.blue,{max:4.2});k.text('A WALL OF BACKS FOR PRIVACY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.6,DEN,5);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.25,2.6,DEN,6);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const hearts=[0,1,2,3].map(i=>bd.add(bigHeart(`c-h${i}`,.32,[INK.red,INK.pink,INK.red,INK.pink][i]),i<2?'L':'R',1.2+(i%2)*1.6,2.1+(i%2)*.3,{out:.03}));
  const ban=bd.add(S.banner(K+'c-ban',2.6,.4,'STAND TOGETHER',INK.red),'R',.4,2.8,{out:.02});
  const centre=B.stand(bigHeart('c-centre',.6),2.85,.1,{layer:2});
  const ring=RING.map(([x,z],i)=>B.person(K+`c-r${i}`,x,z,1.3,{shirt:'casual',hair:(['short','curly','short','long','short','curly','bun'] as const)[i],skin:['#f1b88f','#d99a6c','#f1b88f','#f1b88f','#b27650','#f1b88f','#d99a6c'][i],number:String([3,5,8,9,14,18,21][i]),face:'open',layer:z>.8?3:z<-.5?1:2}));
  const kjaer=B.person(K+'c-kjaer',-3.2,.6,1.45,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'4',face:'smile',layer:3});
  const partner=B.person(K+'c-partner',-2.1,.4,1.62,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'sad',layer:2});
  const hb=kjaer.body.add(S.bubble(K+'c-hb',.55,.46,'heart'),-.4,kjaer.h*.98,{z:-.02});
  const m1=B.person(K+'c-m1',-4.3,-.8,1.28,{shirt:'casual',hair:'curly',skin:'#d99a6c',face:'open',layer:2}),m2=B.person(K+'c-m2',-3.6,-1.0,1.28,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'open',layer:2});
  const board=B.stand(S.scoreboard(K+'c-board',1.8,1.35,'EURO 2020'),-1.2,-1.7,{layer:1});
  B.stand(S.floodlight(K+'c-flood',.5,1.9),-4.6,-1.9,{layer:1});B.stand(S.bench(K+'c-bench',1.2,.5),-2.7,-1.5,{layer:1});
  const staff=B.person(K+'c-staff',-2.4,-1.2,1.62,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'open',layer:1});board.add(S.flipCard(K+'c-dk',1.4,.62,'DENMARK',INK.red),0,.36,{z:.012});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.0):b.t;
   show(ban,beat(t,29.4,30.2));ban.dy=.04*wave(t,30.2,35,.6);
   centre.s=beat(t,1,1.8);
   // The ring gathers, closes part-way (a wall of backs), then closes completely.
   const close=manual?.6+.4*beat(act,.05,.9):.6*beat(t,8.2,10.8)+.4*beat(t,14.1,15.4);
   ring.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.35,3.2+i*.35);const [x,z]=RING[i],cx=2.85,cz=.1,k2=1-.38*close;p.body.x=cx+(x-cx)*k2;p.body.z=cz+(z-cz)*k2;
    const link=beat(t,9.5,10.8);p.armL.rot=-.12-.9*link;p.armR.rot=.12+.9*link;});
   // Kjær comforts Eriksen's partner; teammates support each other.
   kjaer.body.s=beat(t,15.8,16.6);partner.body.s=beat(t,16,16.8);kjaer.armR.rot=.12+1.1*beat(t,17,17.8);show(hb,beat(t,17.6,18.4));
   staff.armL.rot=-.12-1.0*beat(t,20.4,21.2);
   m1.armR.rot=.12+1.0*beat(t,20,20.8);m2.armL.rot=-.12-1.0*beat(t,20,20.8);
   hearts.forEach((h,i)=>{show(h,beat(t,23+i*.5,23.6+i*.5));h.dy=.05*wave(t,23.6,35,.5+i*.1);});
   centre.scale=1+.08*Math.max(0,wave(t,27,29,1.2));
   return b.narrated?.45*beat(t,1.6,2.4)-.9*beat(t,15.2,16)+.45*beat(t,22.4,23.2):0;
  };
 }};

/* ───────────── 3 · Helpers who knew what to do (helpers) ───────────── */
const HELPERS=['CAPTAIN','MEDICAL TEAM','TEAMMATES'];
const helpers:SpreadDef={id:'helpers',rest:16.9,
 left:k=>{floor(k,-5,0,'#e8efe6','#a9bfa6');
  k.text('HELPERS ARE HEROES',-2.4,Z(2.62),.36,INK.green,{max:4});k.text('UEFA PRESIDENT’S AWARD 2021',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,ell(0,Z(-.6),1.0,1.0));
  k.text('CPR · DEFIBRILLATOR',2.5,Z(2.62),.36,INK.red,{max:4.2});k.text('QUICK HELP SAVED HIS LIFE',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#dff0e6',INK.teal,y=>.35-y/3*.3);hills(k,4.5,2.2,INK.leaf,INK.navy);town(k,.3,10,2.55);}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.4,2.6,DEN,7);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const hosp=bd.add(hospital('h-hosp',1.4,1.1),'L',1.1,1.35,{out:.03});
  const sun=bd.add(S.sun(K+'h-sun',.34),'L',3.7,2.1,{out:.015});
  const board=B.stand(sp('h-board',3.4,1.3,k=>{k.keyFill(rect(.3,1.0,.06,.3),INK.brown);k.keyFill(rect(3.04,1.0,.06,.3),INK.brown);const b=rect(0,0,3.4,1.02);k.fill(b,'#c9a26a');k.dots(b,INK.brown,.04,.3);k.key(b,.014);}),-2.5,-1.2,{layer:1});
  const faces=HELPERS.map((l,i)=>board.add(lineCard(`h-face${i}`,.98,.82,[l],[INK.yellow,INK.sky,INK.pink][i]),-1.1+i*1.1,.4,{z:.01}));void faces;
  const flaps=HELPERS.map((_,i)=>board.flap(S.flipCard(K+`h-q${i}`,.98,.82,'?',[INK.red,INK.green,INK.blue][i]),-1.1+i*1.1,1.22,{z:.02}));
  const award=B.stand(lineCard('h-award',1.5,.66,['PRESIDENT’S','AWARD 2021'],INK.yellow),-3.6,.7,{layer:2,s:0});
  const cup=B.stand(S.trophy(K+'h-cup',.5,.85),-2.4,.9,{layer:2,s:0});
  B.stand(S.floodlight(K+'h-flood',.5,1.9),-4.6,-1.9,{layer:1});
  const mates=[0,1].map(i=>B.person(K+`h-m${i}`,-4.3+i*.9,.2+i*.5,1.3,{shirt:'casual',hair:(['curly','short'] as const)[i],skin:['#d99a6c','#f1b88f'][i],number:String([6,18][i]),face:'open',layer:2}));
  const kjaer=B.person(K+'h-kjaer',-1.2,.9,1.42,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'4',face:'smile',layer:3});
  const clockP=B.stand(S.flipCard(K+'h-hour',1.2,.34,'AN HOUR LATER',INK.teal),-4.1,1.9,{layer:3,s:0,tab:false});
  const awake=B.stand(S.flipCard(K+'h-awake',1.3,.34,'STABLE · AWAKE',INK.green),-2.6,1.9,{layer:3,s:0,tab:false});
  const learn=B.stand(S.sign(K+'h-learn',1.5,1.1,'LEARN FIRST AID',INK.yellow),-.9,2.0,{layer:3,s:0});
  const heartB=B.stand(heartCard('h-heartB',.8,'beat'),2.6,-1.4,{layer:1});const heartQ=heartB.add(heartCard('h-heartQ',.8,'quiet'),0,0,{z:.015});
  const medics=[0,1].map(i=>B.person(K+`h-med${i}`,1.4+i*2.6,.3-i*.2,1.62,{shirt:'keeper',hair:(['short','bun'] as const)[i],skin:['#d99a6c','#f1b88f'][i],adult:true,face:'open',layer:2}));
  const cpr=B.stand(cprCard('h-cpr',.6),2.0,.9,{layer:3,s:0,tab:false});
  const aed=B.stand(aedBox('h-aed',.5,.62),3.3,.95,{layer:3,s:0,tab:false});
  const kit=B.stand(medKit('h-kit',.5,.42),4.4,1.3,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   medics.forEach((m,i)=>{m.body.s=beat(t,1+i*.4,1.8+i*.4);});
   cpr.s=beat(t,3.2,4);medics[0].armR.rot=.12+1.2*beat(t,4,4.6)*(1-beat(t,15,15.6))+.15*wave(t,4.6,8.6,1.8);
   aed.s=beat(t,9,9.8);medics[1].armL.rot=-.12-1.2*beat(t,9.6,10.2)*(1-beat(t,15,15.6));kit.s=beat(t,6,6.8);
   // Their quick work saved his life: the quiet heart card lifts away to show a beating heart.
   const live=beat(t,14.4,15.6);heartQ.dy=-1.4*live;heartQ.scale=1-live;heartQ.visible=live<.98;heartB.scale=1+.06*Math.max(0,Math.sin(Math.max(0,t-15.6)*TAU*1.1))*(t>15.6?1:0);
   // Turn over the helper cards.
   flaps.forEach((f,i)=>{const n=manual?beat(act,i/3,i/3+.3):beat(t,[17.3,17.9,18.5][i],[17.8,18.4,19][i]);f.flip=-3.2*n;});
   show(hosp,beat(t,19.2,20));clockP.s=beat(t,19.6,20.4);awake.s=beat(t,21.4,22.2);
   mates.forEach((m,i)=>{m.body.s=beat(t,1.6+i*.4,2.4+i*.4);m.armR.rot=.12+.9*beat(t,19.4,20)*(1-beat(t,23,23.6));});
   award.s=beat(t,24,24.8);cup.s=beat(t,25,25.8);kjaer.body.s=beat(t,2.4,3.2);kjaer.armR.rot=.12+1.4*beat(t,27.4,28);
   const cheer=beat(t,29,29.6)*(1-beat(t,32,32.6));medics.forEach(m=>{m.armL.rot+=-2.2*cheer;m.armR.rot+=2.2*cheer;});
   learn.s=beat(t,33.6,34.4);show(sun,beat(t,33,34));sun.dy=.3*beat(t,33,37);
   return b.narrated?.45*beat(t,1.8,2.6)-.45*beat(t,16.4,17.2)-.35*beat(t,23.4,24)+.35*beat(t,32,33):0;
  };
 }};

/* ───────────── 4 · A tiny helper inside (icd) ───────────── */
const icd:SpreadDef={id:'icd',rest:17.6,
 left:k=>{floor(k,-5,0,'#e5eef0','#a9c3c9');
  k.text('A TINY HELPER',-2.4,Z(2.62),.46,INK.teal,{max:4});k.text('AN ICD WATCHES THE HEARTBEAT',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{path(k,[[.2,Z(1.6)],[1.4,Z(1.2)],[2.6,Z(.5)],[3.3,Z(-.6)]],.55);const g=rect(0,0,5,PAGE_D);k.fill(g,INK.grass,.45);k.dots(g,INK.leaf,.06,.15);path(k,[[.2,Z(1.6)],[1.4,Z(1.2)],[2.6,Z(.5)],[3.3,Z(-.6)]],.55);
  k.text('HOME',2.5,Z(2.62),.5,INK.pink,{max:4});k.text('DENMARK 4–1 RUSSIA · SEMI-FINALS',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'i-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#dff0e6',INK.teal,y=>.35-y/3*.3);hills(k,4.5,2.3,INK.leaf,INK.navy);}},
   {key:K+'i-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2b0',INK.pink,y=>.4-y/3*.4);hills(k,4.5,2.1,INK.grass,INK.leaf);town(k,.3,10,2.45);}},-3.05,1.22);
  const bunt=bd.add(S.bunting(K+'i-bunt',3.4,.4,[INK.red,INK.white,INK.red,INK.white]),'R',2.2,2.4,{out:.02});
  const sun=bd.add(S.sun(K+'i-sun',.36),'R',3.9,1.9,{out:.015});
  const hosp=B.stand(hospital('i-hosp',2.2,1.8),-2.9,-1.5,{layer:1});void hosp;
  const doc=B.person(K+'i-doc',-1.4,-.3,1.66,{shirt:'fan',hair:'short',adult:true,skin:'#b27650',face:'smile',layer:2});
  const nurse=B.person(K+'i-nurse',-4.3,-.2,1.6,{shirt:'keeper',hair:'bun',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const card=B.stand(icdCard('i-card',1.1),-2.6,.6,{layer:2,s:0});
  const June=B.stand(S.flipCard(K+'i-18',1.2,.4,'18 JUNE',INK.orange),-3.9,1.8,{layer:3,s:0,tab:false});
  const H=B.person(K+'i-hero',.7,1.4,1.46,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'smile',layer:3,adult:true});B.slot(.7,1.55,2.3,1.55);
  const home=B.stand(house('i-house',1.7,1.7),3.4,-1.1,{layer:1});const hd=home.flap(doorP('i-door',.34,.5),-.17,0,{anchor:'bl',axis:'y',z:.02});
  const fam=[B.person(K+'i-partner',4.4,-.3,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'grin',layer:2}),B.person(K+'i-kid1',4.1,.5,1.0,{shirt:'bib',hair:'short',skin:'#f1b88f',face:'grin',layer:3}),B.person(K+'i-kid2',4.7,.7,.95,{shirt:'fan',hair:'bun',skin:'#f1b88f',face:'grin',layer:3})];
  const mates=[0,1].map(i=>B.person(K+`i-m${i}`,1.5+i*.8,-.6+i*.3,1.3,{shirt:'casual',hair:(['curly','short'] as const)[i],skin:['#d99a6c','#f1b88f'][i],number:String([4,9][i]),face:'grin',layer:2}));
  const score=B.stand(S.scoreboard(K+'i-score',1.5,1.15,'DENMARK – RUSSIA'),-.8,1.7,{layer:3,s:0});score.add(S.flipCard(K+'i-41',1.1,.5,'4 – 1',INK.red),0,.3,{z:.012});
  const semi=B.stand(S.flipCard(K+'i-semi',1.3,.36,'SEMI-FINALS',INK.blue),2.2,2.05,{layer:3,s:0,tab:false});
  const hearts=[0,1].map(i=>B.stand(bigHeart(`i-h${i}`,.3),3.7+i*.8,1.8,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.6):b.t;
   doc.body.s=beat(t,2.4,3.2);nurse.body.s=beat(t,2.8,3.6);card.s=beat(t,4.2,5.2);doc.armL.rot=-.12-1.3*pulse(t,6.8,12);
   card.scale=1+.05*Math.max(0,Math.sin(Math.max(0,t-7)*TAU))*(t>7&&t<14.6?1:0);
   June.s=beat(t,14.8,15.6);H.body.s=beat(t,15,15.8);nurse.armR.rot=.12+1.6*beat(t,15.6,16.2)+.3*wave(t,16.2,19,1.4);
   // He visits his teammates, then the door home opens.
   mates.forEach((m,i)=>{m.body.s=beat(t,19.9+i*.4,20.7+i*.4)*(1-beat(t,23.4,24.2));m.armR.rot=.12+2.0*beat(t,20.6,21.2);});
   const open=Math.max(beat(t,18,19.4),manual?beat(act,.05,.7):0);hd.flip=-.9*open;
   const walk=manual?beat(act,.3,1):beat(t,21.4,23.6);H.body.x=.7+1.9*walk;H.body.z=1.4-.5*walk;
   fam.forEach((f,i)=>{f.body.s=beat(t,15.8+i*.35,16.6+i*.35);const hug=Math.max(beat(t,22.8,23.6),manual?beat(act,.7,1):0);f.armL.rot=-.12-(i?2.2:1.3)*hug;f.armR.rot=.12+(i?2.2:0)*hug;});
   H.armR.rot=.12+1.3*Math.max(beat(t,22.8,23.6),manual?beat(act,.7,1):0);
   score.s=beat(t,24.2,25);semi.s=beat(t,28.6,29.4);show(bunt,beat(t,28.8,29.8));
   hearts.forEach((h,i)=>{h.s=beat(t,32+i*.5,32.8+i*.5);});show(sun,beat(t,31.8,32.8));sun.dy=.3*beat(t,31.8,36);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,14.4,15.2)+.4*beat(t,17.6,18.4)-.4*beat(t,23.6,24.4):0;
  };
 }};

/* ───────────── 5 · A new way back (inter) ───────────── */
const inter:SpreadDef={id:'inter',rest:18.9,
 left:k=>{floor(k,-5,0,'#e6dcc4','#b9a57c');
  k.text('ITALY · 2021',-2.4,Z(2.62),.46,INK.blue,{max:4});k.text('THE RULES DID NOT ALLOW AN ICD',-2.4,Z(2.9),.15,INK.navy,{weight:800,max:4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);path(k,[[.3,Z(1.5)],[1.6,Z(.9)],[2.5,Z(.2)]],.45,'#cfe0a8');
  k.text('BRENTFORD',2.5,Z(2.62),.46,INK.red,{max:4});k.text('PLAYING AGAIN, EIGHT MONTHS LATER',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'n-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d8',INK.navy,y=>.3-y*.06);hills(k,4.5,2.2,'#8fa28c',INK.navy);town(k,.2,11,2.55);}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.5,2.6,[INK.red,INK.white,INK.red,INK.yellow,INK.white],2);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const cloudL=bd.add(stormCloud('n-cloud',1.4,.7,false),'L',2.4,1.9,{out:.03});
  const ban=bd.add(S.banner(K+'n-ban',2.4,.4,'BRENTFORD · ENGLAND',INK.red),'R',.4,2.8,{out:.02});
  const sun=bd.add(S.sun(K+'n-sun',.36),'R',3.8,1.6,{out:.015});
  const notice=B.stand(noticeBoard('n-notice',1.7,1.4,['ITALY','RULES: NO ICD']),-3.3,-1.5,{layer:1,s:0});
  const cstand=B.stand(sp('n-cstand',1.5,.3,k=>{const p=rect(0,0,1.5,.3);k.fill(p,INK.wood);k.key(p,.012);}),-1.3,-1.0,{layer:1,s:0});
  cstand.add(lineCard('n-ended',1.3,.9,['CONTRACT','ENDED'],INK.pink,INK.white),0,.3,{z:.01});const cflap=cstand.flap(lineCard('n-contract',1.3,.9,['INTER','CONTRACT'],INK.white),0,1.2,{z:.02});
  const dec=B.stand(S.flipCard(K+'n-dec',1.4,.38,'DECEMBER 2021',INK.blue),-3.4,.6,{layer:2,s:0,tab:false});
  const signL=B.stand(arrowSign('n-sgL',1.1,.36,'NEW WAY',INK.green),-1.4,1.3,{layer:3,s:0});
  const H=B.person(K+'n-hero',.8,1.2,1.45,{shirt:'casual',hair:'short',skin:'#f1b88f',legs:'kick',face:'smile',layer:3});
  const gL=B.stand(sp('n-post1',.12,1.3,k=>{const p=rect(0,0,.12,1.3);k.fill(p,INK.grey);k.key(p,.01);}),1.75,.25,{layer:2});
  const leafL=gL.flap(gateLeaf('n-leafL',.62,1.0),.06,0,{anchor:'bl',axis:'y',z:.02});
  const gR=B.stand(sp('n-post2',.12,1.3,k=>{const p=rect(0,0,.12,1.3);k.fill(p,INK.grey);k.key(p,.01);}),3.15,.25,{layer:2});
  const leafR=gR.flap(gateLeaf('n-leafR',.62,1.0),-.06,0,{anchor:'br',axis:'y',z:.02});
  const ob=B.stand(S.flipCard(K+'n-ob',1.1,.36,'OB · DENMARK',INK.blue),.9,-.2,{layer:2,s:0,tab:false});
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+`n-cone${i}`,.3),.4+i*.5,.55,{layer:2,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'n-ball',.12),1.3,1.3,{layer:3,tab:false});
  const mates=[0,1].map(i=>B.person(K+`n-m${i}`,3.6+i*.8,-.8+i*.5,1.3,{shirt:'arg',hair:(['curly','short'] as const)[i],skin:['#7f5138','#f1b88f'][i],face:'grin',layer:2}));
  const eight=B.stand(S.flipCard(K+'n-8',1.3,.36,'8 MONTHS',INK.pink),4.0,1.9,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.9):b.t;
   H.body.s=beat(t,.3,1.1);show(cloudL,beat(t,2,3.2)*(1-beat(t,26,28)));
   notice.s=beat(t,4.4,5.2);cstand.s=beat(t,11.4,12);cflap.flip=-3.2*beat(t,13.4,14.4);dec.s=beat(t,11.8,12.6);
   signL.s=beat(t,16,16.8);H.body.yaw=.4*pulse(t,16,18.4);
   // Open the gate to a new club.
   const open=Math.max(beat(t,19,20.4),manual?beat(act,.05,.8):0);leafL.flip=-1.1*open;leafR.flip=1.1*open;
   // Training alone at OB, then through the gate to Brentford.
   ob.s=beat(t,21,21.8);cones.forEach((c,i)=>{c.s=beat(t,21.4+i*.3,21.9+i*.3);});
   const drib=beat(t,22.2,24.6);ball.x=1.3+.9*drib;ball.z=1.3-.4*drib+.0;ball.rot=-drib*8;ball.visible=t<25.4||manual;
   H.leg!.rot=-.8*Math.max(pulse(t,22.3,22.8),pulse(t,23.3,23.8));
   const through=manual?beat(act,.5,1):beat(t,25.4,27.6);H.body.x=.8+1.6*through+(t>22.2&&!manual?.9*drib*(1-through):0);H.body.z=1.2-1.0*through;
   show(ban,beat(t,25.2,26));mates.forEach((m,i)=>{m.body.s=beat(t,26+i*.4,26.8+i*.4);m.armR.rot=.12+2.0*beat(t,27.6,28.2);});
   eight.s=beat(t,29,29.8);show(sun,beat(t,31.4,32.4));sun.dy=.4*beat(t,31.4,35);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15.8,16.6)+.45*beat(t,20.6,21.4)-.45*beat(t,31,31.8):0;
  };
 }};

/* ───────────── 6 · Back with his team (back) ───────────── */
const back:SpreadDef={id:'back',rest:16.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,`M-5 ${Z(-1.4)} L-3.9 ${Z(-1.4)} L-3.9 ${Z(.2)} L-5 ${Z(.2)}`);
  k.text('MARCH 2022',-2.4,Z(2.62),.46,INK.red,{max:4});k.text('BACK FOR DENMARK · A GOAL IN TWO MINUTES',-2.4,Z(2.9),.14,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.6),1.0,1.0));
  k.text('133 GAMES',2.5,Z(2.62),.46,INK.pink,{max:4});k.text('THE MOST EVER FOR DENMARK',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.6,DEN,8);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.6,DEN,9);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'b-ban',2.6,.4,'THANK YOU, HELPERS',INK.red),'R',.4,2.8,{out:.02});
  const conf=bd.add(S.confetti(K+'b-cf',2.4,1.1,3),'L',.5,1.4,{out:.04});
  B.stand(S.goal(K+'b-goal',1.6,.85),-4.4,-1.2,{layer:1,yaw:.5});
  const keeper=B.person(K+'b-gk',-4.2,-.9,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const HL=B.person(K+'b-heroL',-2.2,.6,1.42,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'10',legs:'kick',face:'smile',layer:3});
  const two=B.stand(S.flipCard(K+'b-2min',1.3,.36,'2 MINUTES',INK.pink),-2.9,1.9,{layer:3,s:0,tab:false});
  const cups=[['LEAGUE CUP',-1.4],['FA CUP',-.5]].map(([l,x],i)=>({cup:B.stand(S.trophy(K+`b-cup${i}`,.45,.78),x as number,-1.2,{layer:1,s:0}),tag:B.stand(S.flipCard(K+`b-tag${i}`,.85,.28,l as string,INK.red),x as number,-.55,{layer:2,s:0,tab:false})}));
  const ballL=B.stand(S.ball(K+'b-ballL',.13),-1.8,.7,{layer:3,tab:false});
  const counter=B.stand(S.scoreboard(K+'b-count',2.0,1.5,'GAMES FOR DENMARK'),2.4,-1.6,{layer:1});
  counter.add(S.flipCard(K+'b-133',1.5,.7,'133',INK.pink),0,.4,{z:.012});
  const cflaps=['130','131','132'].map((l,i)=>counter.flap(S.flipCard(K+`b-c${l}`,1.5,.7,l,i%2?INK.blue:'#3d5da0'),0,1.1,{z:.028-i*.005}));
  const HR=B.person(K+'b-heroR',1.2,.6,1.42,{shirt:'casual',hair:'short',skin:'#f1b88f',number:'10',face:'grin',layer:3});
  const euro=B.stand(S.flipCard(K+'b-euro',1.3,.36,'EURO 2024',INK.blue),.9,1.9,{layer:3,s:0,tab:false});
  const team=[['keeper','bun','#d99a6c',true],['casual','short','#f1b88f',false],['coach','long','#f1b88f',true],['keeper','short','#b27650',true],['casual','curly','#d99a6c',false]].map(([sh,hr,sk,ad],i)=>B.person(K+`b-t${i}`,2.3+i*.62,.2+(i%2)*.7,ad?1.55:1.3,{shirt:sh as 'keeper',hair:hr as 'bun',skin:sk as string,adult:ad as boolean,face:'grin',layer:i%2?3:2}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.0):b.t;
   HL.body.s=beat(t,1.8,2.6);keeper.body.s=beat(t,2,2.8);
   const shot=beat(t,5.2,6.2);ballL.x=-1.8-2.4*shot;ballL.z=.7-1.7*shot;ballL.dy=.3*Math.sin(shot*Math.PI);ballL.rot=-shot*8;
   HL.leg!.rot=-1.2*pulse(t,4.9,5.5);keeper.body.rot=.8*pulse(t,5.5,7);keeper.armL.rot=-.12-2*pulse(t,5.5,7);
   two.s=beat(t,6.4,7.2);const cheerL=beat(t,6.6,7.2)*(1-beat(t,12.5,13.2));HL.armL.rot=-.12-2.3*cheerL;HL.armR.rot=.12+2.3*cheerL;conf.dy=-1+1.2*beat(t,6.4,8.6);conf.visible=t>6.3&&t<14;
   cups.forEach((c,i)=>{c.cup.s=beat(t,11.6+i*1.2,12.4+i*1.2);c.tag.s=beat(t,11.9+i*1.2,12.6+i*1.2);});
   HR.body.s=beat(t,14.6,15.4);
   // Flip the counter: 130, 131, 132 … 133.
   cflaps.forEach((f,i)=>{const n=manual?beat(act,.1+i*.28,.3+i*.28):beat(t,[17,19.6,22.4][i],[17.6,20.2,23][i]);f.flip=-3.2*n;});
   euro.s=beat(t,16.6,17.4);HR.armR.rot=.12+2.2*beat(t,18,18.6)*(1-beat(t,20,20.6));
   team.forEach((m,i)=>{m.body.s=beat(t,27.2+i*.3,28+i*.3);const c=beat(t,29.2+i*.2,29.8+i*.2);m.armL.rot=-.12-2.2*c;m.armR.rot=.12+2.2*c;});
   const cheer=beat(t,29,29.6);HR.armL.rot=-.12-2.3*cheer;HR.armR.rot+=2.2*cheer;show(ban,beat(t,31.4,32.2));ban.dy=.04*wave(t,32.2,37,.6);
   return b.narrated?-.5*beat(t,1.4,2.4)+.5*beat(t,13.8,14.8)+.45*beat(t,26.6,27.4)-.45*beat(t,31,31.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={parken,circle,helpers,icd,inter,back};
void clamp01;void track;
