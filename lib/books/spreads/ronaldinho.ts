/**
 * The six Ronaldinho pop-up spreads: an original riso paper retelling of the hardships in his life
 * (a brother's dream cut short, losing his father, being the smallest, being left out and injured) and the joy that came back.
 * pose(beat) is a pure function of Coach Bella's narration time (seconds) and the reader's action (0–1),
 * so pause, seek, replay and manual play all show the same paper state.
 * Timings follow public/voice/books/ronaldinho/narration.json. Kits are generic colours, never club crests.
 * Loss is shown only symbolically: an empty chair, a photo frame, a rain cloud that clears, stars that light.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob,PERSON_ASPECT,personSpec,type PersonOpts} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Person,type Part,beat,pulse,wave,clamp01,smooth,PAGE_D,PERSON_SCALE} from '../popupEngine';

const D2=PAGE_D/2;
const Z=(z:number)=>z+D2;
const spec=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key,w,h,paint,...extra});
const lerp=(a:number,b:number,u:number)=>a+(b-a)*u;
const RON={skin:'#7f5138',hair:'curly' as const,hairColor:'#231a1f',face:'grin' as const};
const FAM='#7f5138';
const GARNET='#a3234a',BLAUGRANA='#1f4fa0';

/* ───────────── page print helpers ───────────── */
function sand(k:Kit,x0:number,x1:number,y0:number,y1:number,tone=INK.sand){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,tone,.85);k.dots(p,INK.orange,.06,(x,y)=>.1+.08*Math.sin(x*2.1+y*1.3));}
function pitch(k:Kit,x0:number,x1:number,night=false){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,night?'#3f7f5a':INK.grass,night?.9:.72);
 for(let i=0;i<8;i++){if(i%2)k.dots(rect(x0,i*PAGE_D/8,x1-x0,PAGE_D/8),night?INK.navy:INK.leaf,.055,.3);}k.dots(p,night?INK.navy:INK.leaf,.08,.12);}
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c=INK.brown){for(let i=0;i<n;i++){const t=i/(n-1),x=lerp(x0,x1,t),y=lerp(y0,y1,t)+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function skyPanel(k:Kit,w:number,h:number,top=INK.sky,base=INK.sky2){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,top,.055,(x,y)=>.75-y/h*.75);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function seaBand(k:Kit,w:number,y0:number,y1:number,night=false){const s=rect(0,y0,w,y1-y0);k.fill(s,night?'#1f4f86':INK.blue);k.dots(s,INK.navy,.045,night?.5:.3);for(let i=0;i<6;i++)k.key(`M${.2+i*.75} ${y0+.12+(i%2)*.14} q.12 -.06 .24 0`,.012,INK.white);}
function crowdRows(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function townRow(k:Kit,y:number,dark=false){const cols=dark?['#34427a','#3c4d86','#2e3a6c','#44538e']:['#f28a3a','#ffd23f','#8fcbe6','#ff5fa2','#f6d9a4','#5daa6a','#e4574a','#ffd23f'];
 for(let i=0;i<8;i++){const x=.1+i*.55,h=.55+((i*5)%3)*.18,b=rect(x,y-h,.5,h+.55);k.fill(b,cols[i%cols.length]);k.dots(b,INK.navy,.04,.12);k.key(b,.012);k.fill(rect(x-.03,y-h-.07,.56,.08),dark?'#56607e':INK.white);
  const lit=dark&&i%3!==1;k.fill(rect(x+.08,y+.15-h,.14,.18),lit?INK.yellow:INK.navy);k.fill(rect(x+.28,y+.15-h,.14,.18),dark&&i%2?INK.yellow:INK.navy);}}

/* ───────────── Ronaldinho plates (original riso cut-outs) ───────────── */
/** A printed shirt panel laid over a brad figure's torso (kid proportions): stripes and a number, no crest. */
const kitOverlay=(key:string,h:number,base:string,stripes:string|null,num?:string,numInk=INK.yellow)=>spec(key,h*PERSON_SCALE*PERSON_ASPECT,h*PERSON_SCALE,k=>{
 k.at(0,0,k.h/512,()=>{const torso='M114 172 Q146 156 184 170 L196 208 L200 304 Q156 320 106 304 L108 220 Z';
  k.fill(torso,base);if(stripes)k.hatch(torso,stripes,34,Math.PI/2,17);k.key(torso,2);k.key('M126 172 Q149 192 172 172',2.6,numInk);
  if(num)k.text(num,152,276,44,numInk,{font:'Georgia,serif'});});},{rim:0});
/** A head-only face plate (same art as the figure) used to swap in a quieter expression. */
const faceSwap=(p:Person,key:string,o:PersonOpts,face:'sad'|'shy'):Part=>{const f=p.body.add(personSpec(key,p.h,{...o,face,headOnly:true}),0,0,{z:.005});f.visible=false;return f;};
const hut=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const body=rect(w*.08,h*.38,w*.84,h*.62);k.fill(body,'#f6d9a4');k.hatch(body,INK.wood,.08,Math.PI/2,.014);k.key(body,.014);
 const win=rect(w*.2,h*.5,w*.6,h*.2);k.fill(win,INK.navy);k.fill(rect(w*.14,h*.7,w*.72,h*.06),INK.wood);k.key(rect(w*.14,h*.7,w*.72,h*.06),.012);
 for(let i=0;i<3;i++)k.circle(w*(.32+i*.18),h*.64,.05,[INK.orange,INK.yellow,INK.leaf][i]);
 for(let i=0;i<6;i++){const x=i/6*w,p=poly([[x,h*.2],[x+w/6,h*.2],[x+w/6,h*.36],[x+w/12,h*.42],[x,h*.36]]);k.fill(p,i%2?INK.white:INK.teal);k.key(p,.01);}
 k.fill(poly([[0,h*.2],[w/2,0],[w,h*.2]]),INK.orange);k.key(poly([[0,h*.2],[w/2,0],[w,h*.2]]),.012);});
const surfaceCard=(key:string,w:number,h:number,label:string,kind:'street'|'sand'|'court')=>spec(key,w,h,k=>{const b=rect(0,0,w,h);
 if(kind==='street'){k.fill(b,INK.stone);for(let r=0;r<4;r++)for(let c=0;c<5;c++)k.key(ell(.08+c*w/5+(r%2)*.05,.08+r*h*.14,.05,.035),.008,INK.navy);}
 else if(kind==='sand'){k.fill(b,INK.sand);k.dots(b,INK.orange,.035,.4);footprints(k,.12,h*.45,w-.12,h*.2,4);}
 else{k.fill(b,INK.teal);k.key(`M${w/2} 0 L${w/2} ${h*.62}`,.02,INK.white);k.key(ell(w/2,h*.3,h*.16,h*.16),.02,INK.white);}
 k.fill(rect(0,h*.64,w,h*.36),INK.white);k.text(label,w/2,h*.92,h*.22,INK.navy,{max:w*.86});k.key(b,.014);},{rim:.02});
const pyramid=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const L=poly([[0,h],[w*.5,0],[w*.5,h]]),R=poly([[w*.5,0],[w,h],[w*.5,h]]);
 k.fill(L,'#f0c878');k.dots(L,INK.orange,.04,.18);k.fill(R,'#d99a5a');k.hatch(R,INK.brown,.05,-.9,.01);
 for(let i=1;i<6;i++){const y=h*i/6;k.key(`M${w*.5*(1-y/h)} ${y} L${w*.5} ${y}`,.008,INK.brown);k.key(`M${w*.5} ${y} L${w*(.5+.5*y/h)} ${y}`,.008,'#8a5238');}
 k.key(poly([[0,h],[w*.5,0],[w,h]]),.014);k.key(`M${w*.5} 0 L${w*.5} ${h}`,.01);});
const dune=(key:string,w:number,h:number,tone='#ecc47e')=>spec(key,w,h,k=>{const p=`M0 ${h} Q${w*.3} ${-h*.1} ${w*.55} ${h*.35} Q${w*.75} ${h*.1} ${w} ${h*.6} L${w} ${h} Z`;k.fill(p,tone);k.dots(p,INK.orange,.04,(x,y)=>.1+y/h*.3);k.key(p,.012);});
const plateCard=(key:string,w:number,h:number,lines:string[],color=INK.white,ink=INK.navy)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.1);k.key(b,.014);
 const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*(n>1?.24:.44),ink,{max:w*.88}));},{rim:.02});
/** A speech/feeling bubble with a word that always fits. */
const wordBubble=(key:string,w:number,h:number,word:string,ink=INK.pink,paper=INK.white)=>spec(key,w,h,k=>{const p=`M${w*.12} ${h*.05} L${w*.88} ${h*.05} Q${w} ${h*.05} ${w} ${h*.2} L${w} ${h*.6} Q${w} ${h*.75} ${w*.88} ${h*.75} L${w*.42} ${h*.75} L${w*.2} ${h} L${w*.26} ${h*.75} L${w*.12} ${h*.75} Q0 ${h*.75} 0 ${h*.6} L0 ${h*.2} Q0 ${h*.05} ${w*.12} ${h*.05} Z`;
 k.fill(p,paper);k.key(p,.013);k.text(word,w/2,h*.55,h*.34,ink,{max:w*.84,weight:900});});
const crowdStrip=(key:string,w:number,h:number,colors:string[],seed=1)=>spec(key,w,h,k=>{
 const u=h/.85,rows=[{y:h*.3,s:.9*u},{y:h*.62,s:u}];
 rows.forEach((r,ri)=>{const n=Math.round(w/(.2*r.s));for(let i=0;i<n;i++){const x=(i+.5)*w/n+(ri?0:.05),c=colors[(i*5+ri*3+seed)%colors.length],sk=['#f1b88f','#d99a6c','#b27650','#7f5138'][(i*3+seed+ri)%4];
  const up=(i+ri+seed)%3!==0,hy=r.y-.1*r.s;
  if(up){k.key(`M${x-.05*r.s} ${r.y} L${x-.03*r.s} ${hy-.12*r.s} M${x+.05*r.s} ${r.y} L${x+.03*r.s} ${hy-.12*r.s}`,.03*r.s,sk);k.circle(x,hy-.14*r.s,.025*r.s,sk);}
  k.fill(rect(x-.065*r.s,r.y-.02,.13*r.s,.2*r.s),c);k.key(rect(x-.065*r.s,r.y-.02,.13*r.s,.2*r.s),.008);k.circle(x,hy,.05*r.s,sk);k.key(ell(x,hy,.05*r.s,.05*r.s),.008);
  if((i+seed)%4===1){k.fill(rect(x-.08*r.s,r.y+.02,.16*r.s,.04*r.s),INK.yellow);}}});
 const bar=rect(0,h*.8,w,h*.2);k.fill(bar,INK.white);k.hatch(bar,INK.grey,.06,.6,.012);k.key(bar,.012);},{grain:.8});
const scarf=(key:string,w:number,h:number,a:string,b:string)=>spec(key,w,h,k=>{for(let i=0;i<6;i++)k.fill(rect(0,i*h/6,w,h/6),i%2?b:a);k.key(rect(0,0,w,h),.01);for(let i=0;i<4;i++)k.key(`M${w*(.2+i*.2)} ${h} L${w*(.2+i*.2)} ${h+.05}`,.012,a);k.circle(w/2,.03,.018,INK.gold);},{rim:.012});
const podium=(key:string,w:number,h:number,label:string,sub:string,color=INK.blue)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.3);k.key(b,.013);k.fill(rect(0,0,w,h*.1),INK.gold);k.text(label,w/2,h*.46,h*.3,INK.yellow,{max:w*.86});k.fill(rect(w*.06,h*.6,w*.88,h*.3),INK.white);k.text(sub,w/2,h*.83,h*.2,INK.navy,{max:w*.8});});
const camelPlate=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const body=blob([[w*.18,h*.5],[w*.3,h*.2],[w*.42,h*.36],[w*.55,h*.18],[w*.7,h*.42],[w*.8,h*.36],[w*.84,h*.08],[w*.98,h*.12],[w*.92,h*.24],[w*.86,h*.52],[w*.7,h*.62],[w*.3,h*.64]]);
 for(const x of [.26,.36,.62,.72])k.fill(rect(w*x,h*.55,w*.05,h*.45),'#c98f4d');k.fill(body,'#dca662');k.dots(body,INK.orange,.03,.35);k.key(body,.012);
 k.fill(rect(w*.34,h*.28,w*.3,h*.1),INK.pink);k.hatch(rect(w*.34,h*.28,w*.3,h*.1),INK.yellow,.04,Math.PI/2,.015);k.circle(w*.9,h*.15,.012,INK.navy,true);});
const cornerFlag=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.fill(rect(0,0,.04,h),INK.white);k.key(rect(0,0,.04,h),.01);const f=poly([[.04,.02],[w,.12],[.04,.3]]);k.fill(f,INK.yellow);k.hatch(f,INK.orange,.05,.6,.012);k.key(f,.01);});
const target=(key:string,r:number)=>spec(key,r*2,r*2,k=>{[INK.pink,INK.white,INK.pink,INK.yellow].forEach((c,i)=>k.fill(ell(r,r,r*(1-i*.24),r*(1-i*.24)),c));k.key(ell(r,r,r,r),.012);},{rim:.02});
/** A shipyard crane for the backdrop (where his father worked). */
const crane=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const tower=rect(w*.12,h*.2,w*.12,h*.8);k.fill(tower,INK.yellow);k.hatch(tower,INK.navy,.08,.8,.008);k.key(tower,.012);
 const jib=rect(0,h*.14,w,h*.07);k.fill(jib,INK.yellow);k.hatch(jib,INK.navy,.07,.8,.008);k.key(jib,.012);k.key(`M${w*.18} ${h*.02} L${w*.02} ${h*.14} M${w*.18} ${h*.02} L${w*.9} ${h*.14}`,.01);
 k.key(`M${w*.8} ${h*.21} L${w*.8} ${h*.52}`,.01);k.fill(rect(w*.72,h*.52,w*.16,h*.1),INK.red);k.key(rect(w*.72,h*.52,w*.16,h*.1),.01);});
/** The warm room behind the new home's door: four family heads under a heart. */
const homeInside=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.03,.35);k.key(b,.012);
 const cx=w/2,cy=h*.26;k.fill(`M${cx} ${cy+h*.12} C${cx-w*.34} ${cy-h*.02} ${cx-w*.14} ${cy-h*.2} ${cx} ${cy-h*.06} C${cx+w*.14} ${cy-h*.2} ${cx+w*.34} ${cy-h*.02} ${cx} ${cy+h*.12} Z`,INK.pink);
 [[.2,.62,.07],[.42,.58,.08],[.62,.66,.055],[.8,.68,.05]].forEach(([x,y,r])=>{k.fill(rect(w*x-r*1.1,h*y+r*.6,r*2.2,h*.3),INK.navy);k.circle(w*x,h*y,r,FAM);k.key(ell(w*x,h*y,r,r),.008);});},{rim:.01});
/** A framed photo of Dad on a little easel card. */
const photoFrame=(key:string,w:number,h:number,label:string)=>spec(key,w,h,k=>{const f=rect(0,0,w,h*.82);k.fill(f,INK.gold);k.hatch(f,INK.wood,.05,.7,.01);k.key(f,.014);
 const inner=rect(w*.12,h*.08,w*.76,h*.62);k.fill(inner,INK.sky2);k.dots(inner,INK.sky,.03,.5);k.key(inner,.01);
 const cx=w/2;k.fill(`M${w*.2} ${h*.7} Q${cx} ${h*.44} ${w*.8} ${h*.7} Z`,INK.navy);k.circle(cx,h*.34,w*.16,FAM);k.key(ell(cx,h*.34,w*.16,w*.16),.01);
 k.fill(`M${cx-w*.17} ${h*.3} Q${cx} ${h*.12} ${cx+w*.17} ${h*.3} Q${cx} ${h*.22} ${cx-w*.17} ${h*.3} Z`,'#231a1f');
 k.circle(cx-w*.06,h*.34,.012,INK.navy,true);k.circle(cx+w*.06,h*.34,.012,INK.navy,true);k.key(`M${cx-w*.07} ${h*.4} Q${cx} ${h*.45} ${cx+w*.07} ${h*.4}`,.01);
 k.fill(rect(w*.22,h*.84,w*.56,h*.16),INK.white);k.key(rect(w*.22,h*.84,w*.56,h*.16),.01);k.text(label,cx,h*.97,h*.12,INK.navy,{max:w*.5,weight:900});});
/** The empty chair: the quiet way the page shows someone is missing. */
const chair=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const back=rect(w*.14,0,w*.72,h*.5);k.fill(back,INK.wood);k.hatch(back,INK.brown,.06,Math.PI/2,.012);k.key(back,.013);
 const seat=rect(0,h*.5,w,h*.12);k.fill(seat,'#cf9b62');k.key(seat,.013);for(const x of [.06,.84])k.keyFill(rect(w*x,h*.62,w*.1,h*.38),INK.brown);
 k.fill(rect(w*.24,h*.12,w*.52,h*.26),'#e7b98a');k.dots(rect(w*.24,h*.12,w*.52,h*.26),INK.pink,.03,.25);});
const cradle=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const basket=`M0 ${h*.35} L${w} ${h*.35} Q${w*.95} ${h*.95} ${w/2} ${h*.95} Q${w*.05} ${h*.95} 0 ${h*.35} Z`;
 k.circle(w*.3,h*.3,h*.16,FAM);k.key(ell(w*.3,h*.3,h*.16,h*.16),.01);k.key(`M${w*.25} ${h*.3} Q${w*.28} ${h*.33} ${w*.31} ${h*.3}`,.008);
 k.fill(`M${w*.36} ${h*.36} Q${w*.6} ${h*.12} ${w*.96} ${h*.36} Z`,INK.sky);k.dots(`M${w*.36} ${h*.36} Q${w*.6} ${h*.12} ${w*.96} ${h*.36} Z`,INK.white,.03,.4);
 k.fill(basket,'#e8bf6e');k.hatch(basket,INK.wood,.05,.5,.01);k.hatch(basket,INK.wood,.05,-.5,.01);k.key(basket,.013);
 for(const x of [.2,.8])k.key(`M${w*x} ${h*.95} Q${w*(x<.5?x-.1:x+.1)} ${h} ${w*(x<.5?x-.14:x+.14)} ${h*.98}`,.012,INK.brown);});
const bigStar=(key:string,r:number,color=INK.yellow)=>spec(key,r*2,r*2,k=>{const p=poly(Array.from({length:10},(_,i)=>[r+Math.cos(i*.628-1.57)*(i%2?r*.42:r),r+Math.sin(i*.628-1.57)*(i%2?r*.42:r)]));k.fill(p,color);k.dots(p,INK.orange,.025,.3);k.key(p,.012);},{rim:.03});
const moonPlate=(key:string,r:number)=>spec(key,r*2,r*2,k=>{const p=`M${r*1.2} ${r*.1} A${r*.95} ${r*.95} 0 1 0 ${r*1.2} ${r*1.9} A${r*.72} ${r*.72} 0 1 1 ${r*1.2} ${r*.1} Z`;k.fill(p,'#fff3c4');k.dots(p,INK.yellow,.03,.4);k.key(p,.012);});
const flower=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M${w/2} ${h} Q${w*.42} ${h*.6} ${w/2} ${h*.32}`,.03,INK.green);k.fill(`M${w/2} ${h*.7} Q${w*.1} ${h*.6} ${w*.18} ${h*.5} Q${w*.38} ${h*.52} ${w/2} ${h*.7} Z`,INK.leaf);
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.fill(ell(w/2+Math.cos(a)*w*.2,h*.22+Math.sin(a)*w*.2,w*.14,w*.14),i%2?INK.pink:'#ff8fc0');}k.circle(w/2,h*.22,w*.12,INK.yellow);k.key(ell(w/2,h*.22,w*.12,w*.12),.01);});
/** A measuring post with tick marks: who is the smallest? */
const heightChart=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);
 for(let i=0;i<10;i++){const y=h*(.05+i*.095),c=[INK.pink,INK.orange,INK.yellow,INK.leaf,INK.sky][i%5];k.fill(rect(0,y,w,h*.095),c,.6);k.key(`M0 ${y} L${w*(i%2?.4:.65)} ${y}`,.012);}k.key(b,.013);});
const gateFrame=(key:string,w:number,h:number,label:string)=>spec(key,w,h,k=>{for(const x of [0,w-.1])k.keyFill(rect(x,h*.2,.1,h*.8),INK.navy);
 const arch=`M0 ${h*.24} Q${w/2} ${-h*.02} ${w} ${h*.24} L${w} ${h*.3} Q${w/2} ${h*.06} 0 ${h*.3} Z`;k.fill(arch,INK.yellow);k.key(arch,.012);k.text(label,w/2,h*.2,h*.1,INK.navy,{max:w*.6,weight:900});},{rim:.015});
const gateLeaf=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.key(b,.03,INK.navy);for(let i=1;i<5;i++)k.key(`M${i*w/5} 0 L${i*w/5} ${h}`,.02,INK.navy);k.key(`M0 ${h*.5} L${w} ${h*.5}`,.02,INK.navy);
 for(let i=0;i<5;i++)k.fill(poly([[i*w/5+.01,0],[i*w/5+w/10,-.06],[(i+1)*w/5-.01,0]]),INK.navy);},{rim:.012});
const aidBox=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,h*.18,w,h*.82);k.fill(b,INK.white);k.key(b,.013);k.key(`M${w*.3} ${h*.18} L${w*.3} ${h*.04} L${w*.7} ${h*.04} L${w*.7} ${h*.18}`,.02);
 k.fill(rect(w*.42,h*.36,w*.16,h*.48),INK.leaf);k.fill(rect(w*.26,h*.52,w*.48,h*.16),INK.leaf);});
const bag=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,INK.teal);k.dots(b,INK.navy,.03,.25);k.key(b,.013);k.key(`M${w*.3} ${h*.2} L${w*.3} ${h*.06} L${w*.7} ${h*.06} L${w*.7} ${h*.2}`,.02);
 k.key(`M${w*.08} ${h*.3} L${w*.08} ${h*.94} M${w*.92} ${h*.3} L${w*.92} ${h*.94}`,.02,INK.yellow);k.fill(rect(w*.18,h*.42,w*.3,h*.2),INK.paper);k.key(rect(w*.18,h*.42,w*.3,h*.2),.008);});
/** Two small tear drops placed just under a figure's eyes. */
const tears=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const x of [.2,.8])k.fill(`M${w*x} 0 Q${w*x+w*.12} ${h*.62} ${w*x} ${h} Q${w*x-w*.12} ${h*.62} ${w*x} 0 Z`,INK.sky);},{rim:.006});
const captainBand=(key:string,r:number)=>spec(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.yellow);k.key(ell(r,r,r,r),.012);k.text('C',r,r*1.45,r*1.2,INK.navy,{weight:900});},{rim:.01});
/** A grey rain cloud and its rain streaks: the gentle sign for a sad time. */
const rainCloud=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=blob([[w*.08,h*.95],[0,h*.62],[w*.18,h*.4],[w*.3,h*.1],[w*.55,0],[w*.72,h*.22],[w*.9,h*.3],[w,h*.68],[w*.9,h*.95]]);k.fill(p,'#9aa3b5');k.dots(p,INK.navy,.035,(x,y)=>.15+y/h*.4);k.key(p,.014);});
const rainLines=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(let i=0;i<11;i++){const x=w*((i*.37)%1)*.9+w*.05,y=h*((i*.53)%1)*.55;k.key(`M${x} ${y} L${x-.06} ${y+h*.4}`,.03,INK.blue);}},{rim:.012,grain:.5});
const stickGoal=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const x of [.03,w-.07])k.fill(rect(x,0,.05,h),INK.wood);k.key(`M.05 .04 Q${w/2} ${h*.16} ${w-.05} .04`,.012);
 for(let i=0;i<5;i++){const x=w*(.18+i*.16),y=.04+Math.sin((i+.5)/5*Math.PI)*h*.1;k.fill(poly([[x-.04,y],[x+.04,y],[x,y+.1]]),[INK.pink,INK.yellow,INK.teal][i%3]);}k.key(`M.03 0 L.03 ${h} M${w-.03} 0 L${w-.03} ${h}`,.01);});

/* =========================================================================================== */
/* 1 · A home full of football (porto): family, the new home, Roberto's dream cut short          */
/* =========================================================================================== */
const porto:SpreadDef={id:'porto',rest:23.2,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#e7dcc0');k.dots(p,INK.navy,.07,.07);
  const street=`M-5 ${Z(-1.7)} L-.25 ${Z(-2.3)} L-.25 ${Z(-.95)} L-5 ${Z(-.15)} Z`;k.fill(street,INK.stone);k.dots(street,INK.navy,.05,.2);
  for(let r=0;r<5;r++)for(let c=0;c<17;c++){const x=-4.9+c*.28+(r%2)*.14,y=Z(-1.62)+r*.28-(x+5)*.12;k.key(ell(x,y,.1,.07),.008,'#9c8a66');}
  k.key(`M-5 ${Z(-1.7)} L-.25 ${Z(-2.3)} M-5 ${Z(-.15)} L-.25 ${Z(-.95)}`,.022);
  const yard=rect(-4.7,Z(.2),4.3,1.85);k.fill(yard,INK.grass,.8);k.dots(yard,INK.leaf,.05,.25);k.key(yard,.02,'#9c8a66');
  for(let i=0;i<9;i++)k.circle(-4.4+i*.48,Z(1.9),.05,i%2?INK.pink:INK.yellow);
  footprints(k,-4.2,Z(1.5),-.9,Z(.6),10);
  k.text('PORTO ALEGRE',-2.55,Z(2.62),.5,INK.blue,{max:4.3});k.text('BRAZIL · 1980',-2.55,Z(2.93),.17,INK.navy,{weight:800,max:4});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,INK.grass,.75);k.dots(p,INK.leaf,.06,.22);
  const path=`M2.35 ${Z(-.95)} L2.85 ${Z(-.95)} L3.4 ${Z(2.2)} L1.7 ${Z(2.2)} Z`;k.fill(path,INK.stone);k.dots(path,INK.navy,.04,.15);
  for(let i=0;i<6;i++)k.key(`M${2.3-i*.1} ${Z(-.7)+i*.5} L${2.9+i*.09} ${Z(-.7)+i*.5}`,.01,'#9c8a66');
  for(let i=0;i<10;i++)k.circle(.35+((i*37)%41)/41*4.3,Z(-.2)+((i*29)%31)/31*2.2,.04,i%2?INK.white:INK.pink);
  k.text('A NEW HOME',2.5,Z(2.62),.46,INK.pink,{max:4});k.text('from the club Grêmio',2.5,Z(2.92),.17,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold(
   {key:'rdh-p-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hill=`M0 3 L0 1.5 Q1 1.1 2 1.45 Q3.2 1.85 4.5 1.35 L4.5 3 Z`;k.fill(hill,INK.leaf);k.dots(hill,INK.navy,.05,.25);
    townRow(k,2.45);k.key(`M0 1.95 Q1.1 2.1 2.2 1.9`,.01);for(let i=0;i<6;i++)k.fill(rect(.2+i*.33,1.97+Math.sin(i/6*Math.PI)*.1,.14,.18),[INK.pink,INK.yellow,INK.white,INK.teal][i%4]);
    k.fill(rect(0,2.85,4.5,.15),INK.stone);}},
   {key:'rdh-p-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);seaBand(k,4.5,1.75,3);const isl=`M2.4 1.78 Q3 1.2 3.6 1.5 Q4 1.3 4.5 1.55 L4.5 1.78 Z`;k.fill(isl,INK.green);k.dots(isl,INK.navy,.04,.3);k.key(isl,.012);
    for(const [x,y] of [[.8,2.1],[1.9,2.45]]){k.fill(poly([[x,y],[x+.36,y],[x+.3,y+.1],[x+.06,y+.1]]),INK.white);k.key(`M${x+.18} ${y} L${x+.18} ${y-.36} L${x+.36} ${y-.04} Z`,.01);k.fill(poly([[x+.2,y-.34],[x+.34,y-.05],[x+.2,y-.05]]),INK.pink);}}},
   -3.05,1.22);
  const sunP=bd.add(S.sun('rdh-p-sun',.42),'R',3.5,1.9,{out:.015});
  const cloud1=bd.add(S.cloud('rdh-p-cloud1',1.0,.46),'L',1.4,2.35),rain=bd.add(rainCloud('rdh-p-rain',1.5,.66),'R',1.3,1.95,{out:.03});
  const drops=bd.add(rainLines('rdh-p-drops',1.3,.8),'R',1.3,1.2,{out:.035});
  const bow=bd.add(S.rainbow('rdh-p-bow',2.2,1.1),'R',2.4,1.25,{out:.025});
  const craneP=bd.add(crane('rdh-p-crane',1.1,1.3),'R',3.9,1.55,{out:.012});
  // Left: the street where the family lived.
  B.stand(S.tree('rdh-p-palmL',1.1,2.0,'palm'),-4.35,-1.05,{layer:1});
  B.stand(S.lamp('rdh-p-lamp',.34,1.5),-.95,-2.2,{layer:1});B.stand(S.bush('rdh-p-bush',1.2,.4),-.95,-.35,{layer:2,tab:false});
  const post=B.stand(S.post('rdh-p-post',.1,1.3),-3.05,-1.25,{layer:1});
  post.add(S.flipCard('rdh-p-1980',.9,.46,'1980',INK.pink),0,.78,{z:.012});
  const cardBR=post.flap(S.flipCard('rdh-p-brazil',.9,.46,'BRAZIL',INK.yellow,INK.navy),0,.78+.46,{z:.024});
  const kid=B.person('rdh-p-kid',-2.2,1.25,.98,{shirt:'bib',...RON,legs:'kick',layer:3});
  const kball=B.stand(S.ball('rdh-p-kball',.1),-1.85,1.35,{layer:3,tab:false});
  // Mum's shop stall, and the card that flips from SALESPERSON to STUDYING TO BE A NURSE.
  const shop=B.stand(hut('rdh-p-shop',1.05,1.25),-4.15,.35,{layer:2,s:0});
  const mum=B.person('rdh-p-mum',-3.35,.65,1.5,{shirt:'casual',hair:'bun',skin:FAM,face:'smile',adult:true,layer:2});
  const jobPost=B.stand(S.post('rdh-p-jobpost',.08,1.25),-4.35,1.55,{layer:3,s:0});
  jobPost.add(plateCard('rdh-p-nurse',1.1,.5,['STUDYING TO','BE A NURSE'],INK.sky),0,.7,{z:.012});
  const jobFlap=jobPost.flap(plateCard('rdh-p-sales',1.1,.5,['SALESPERSON'],INK.yellow),0,1.2,{z:.022});
  // Dad: shipyard worker and local-club footballer.
  const dad=B.person('rdh-p-dad',-1.35,.1,1.55,{shirt:'navy',hair:'short',skin:FAM,face:'smile',adult:true,layer:2,holdR:'ball'});
  const dadPost=B.stand(S.post('rdh-p-dadpost',.08,1.25),-.55,1.05,{layer:3,s:0});
  dadPost.add(plateCard('rdh-p-club',1.0,.5,['LOCAL CLUB','FOOTBALLER'],INK.leaf,INK.white),0,.7,{z:.012});
  const dadFlap=dadPost.flap(plateCard('rdh-p-yard',1.0,.5,['SHIPYARD'],INK.orange,INK.white),0,1.2,{z:.022});
  // Right: the new home from Grêmio, with a door that opens.
  const home=B.stand(S.house('rdh-p-house',2.2,1.9),2.6,-1.3,{layer:1,s:0});
  home.add(homeInside('rdh-p-inside',.46,.66),0,.02,{z:.006});
  const door=home.flap(S.door('rdh-p-door',.46,.66),-.23,.02,{anchor:'bl',axis:'y',z:.012});
  const sign=B.stand(S.sign('rdh-p-sign',1.0,.9,'GRÊMIO'),4.3,-.5,{layer:2,s:0});
  B.stand(S.tree('rdh-p-treeR',.9,1.4),.6,-1.7,{layer:1});B.stand(S.bench('rdh-p-bench',1.0,.42),4.1,.95,{layer:2});
  const bro=B.person('rdh-p-bro',1.25,.75,1.36,{shirt:'fan',hair:'short',skin:FAM,face:'smile',legs:'kick',layer:3});
  const broO:PersonOpts={shirt:'fan',hair:'short',skin:FAM,legs:'kick'};const broSad=faceSwap(bro,'rdh-p-bro-sad',broO,'sad');
  const think=bro.body.add(S.bubble('rdh-p-think',.6,.5,'dots'),.5,1.8,{z:-.02});
  const bball=B.stand(S.ball('rdh-p-bball',.11),1.6,.85,{layer:3,tab:false});
  const heart=kid.body.add(S.bubble('rdh-p-heart',.55,.46,'heart'),.45,1.35,{z:-.02});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   sunP.dy=-.8+.8*beat(t,0,1.6)-.5*beat(t,26.8,28)+.55*beat(t,35.8,37.2);sunP.scale=1+.15*pulse(t,36,38.5);
   cloud1.dx=-.3+.8*beat(t,0,40);
   // Born in 1980: the sign pops, BRAZIL flips up to show 1980.
   post.s=beat(t,2.1,3.1);cardBR.flip=-2.85*beat(t,6.4,7.2);kid.body.s=beat(t,2.6,3.6);
   kid.armR.rot=.12+1.6*beat(t,4,4.6)-1.6*beat(t,8.6,9.3)+.3*wave(t,4.6,8.6,1.4);
   // Mum: salesperson, then studying to be a nurse.
   shop.s=beat(t,9.9,10.9);mum.body.s=beat(t,10.2,11.2);jobPost.s=beat(t,10.8,11.6);jobFlap.flip=-2.85*beat(t,12.6,13.4);
   mum.armR.rot=.12+1.3*beat(t,11.2,11.8)-1.3*beat(t,14.6,15.2)+.25*wave(t,11.8,14.6,1.2);
   // Dad: the crane rises for the shipyard; the card flips to his local football club.
   dad.body.s=beat(t,15.3,16.3);craneP.dy=-1.3+1.3*beat(t,15.8,17);dadPost.s=beat(t,16.2,17);dadFlap.flip=-2.85*beat(t,18.2,19);
   dad.armR.rot=.12+.9*pulse(t,18.8,20.4);dad.armL.rot=-.12-.4*pulse(t,19,20.4);
   kid.leg!.rot=.7*pulse(t,19.2,19.8)+.6*pulse(t,34,34.6);kball.dy=.35*pulse(t,19.4,20.2)+.3*pulse(t,34.2,34.9);kball.rot=-t*.4;
   // Roberto at Grêmio: the new home pops up, the club sign, the door opens.
   const A=smooth(clamp01(act*2.5));bro.body.s=Math.max(beat(t,20.6,21.5),A);home.s=Math.max(beat(t,22,23.2),A);sign.s=Math.max(beat(t,21.2,22),A);
   const open=Math.max(N?beat(t,24,25.2):0,act);door.flip=-1.35*open;
   const juggle=t>21.4&&t<26.4?Math.abs(Math.sin((t-21.4)*Math.PI*1.1)):0;bball.dy=.45*juggle;bro.leg!.rot=.8*Math.max(0,1-juggle*3)*(t>21.4&&t<26.4?1:0);
   bro.armL.rot=-.12-2.3*beat(t,24.6,25.2)+2.3*beat(t,26.2,26.8);bro.armR.rot=.12+2.3*beat(t,24.6,25.2)-2.3*beat(t,26.2,26.8);
   // The injury: a rain cloud drifts over, the ball rolls away, Roberto lowers his head.
   rain.visible=t>26.7&&t<37.4;rain.dx=1.0-1.0*beat(t,26.8,28.2)+1.3*beat(t,35.6,37.4);rain.dy=-.25*beat(t,26.8,28.2);
   drops.visible=t>27.6&&t<36.4;drops.dy=-.08*wave(t,27.6,36.4,1.4);drops.dx=rain.dx;
   const roll=beat(t,28.2,29.6);bball.x=lerp(1.6,.5,roll);bball.z=lerp(.85,1.7,roll);if(t>28.2)bball.rot=-roll*6;
   bro.body.rot=-.08*beat(t,28.4,29.2)*(1-beat(t,36,37));broSad.visible=t>28.6&&t<36.4;
   think.visible=t>31.4&&t<35.8;think.dy=-.5+.5*beat(t,31.5,32.1);
   // A dream ending is sad; the story goes on: cloud clears, rainbow, the family waves.
   bow.visible=t>36.2;bow.scale=beat(t,36.2,37.4);
   heart.visible=t>37;heart.dy=-.5+.5*beat(t,37.1,37.7);
   if(t>37.4){const u=beat(t,37.4,38);kid.armL.rot=-.12-2.3*u-.25*wave(t,38,41,1.6);kid.armR.rot=.12+2.3*u+.25*wave(t,38,41,1.5);bro.armR.rot=.12+1.6*u;mum.armL.rot=-.12-1.4*u;dad.armL.rot=-.12-1.4*u;}
   return N?-.75*beat(t,2.1,3.1)+1.55*beat(t,20.4,21.4)-.8*beat(t,35.6,36.6):(act>0?.6:0);
  };
 }};

/* =========================================================================================== */
/* 2 · Missing Dad (tricks id kept): the empty chair, feelings, three stars, the baby João        */
/* =========================================================================================== */
const tricks:SpreadDef={id:'tricks',rest:19.8,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#3d5a55');k.dots(p,INK.navy,.06,.35);
  const lawn=`M-5 ${Z(-.4)} Q-2.5 ${Z(-.8)} 0 ${Z(-.5)} L0 ${Z(2.25)} L-5 ${Z(2.25)} Z`;k.fill(lawn,'#4f7f62');k.dots(lawn,INK.navy,.05,.3);
  for(let i=0;i<7;i++)k.circle(-4.6+i*.7,Z(2.05),.05,i%2?INK.yellow:INK.pink);
  k.text('ALWAYS REMEMBERED',-2.5,Z(2.62),.36,INK.yellow,{max:4.3});k.text('keep the people you love close',-2.5,Z(2.93),.17,INK.white,{weight:800,max:4.2});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#3d5a55');k.dots(p,INK.navy,.06,.35);
  const lawn=`M0 ${Z(-.5)} Q2.5 ${Z(-.2)} 5 ${Z(-.6)} L5 ${Z(2.25)} L0 ${Z(2.25)} Z`;k.fill(lawn,'#4f7f62');k.dots(lawn,INK.navy,.05,.3);
  const rug=ell(2.8,Z(1.0),1.3,.5);k.fill(rug,INK.pink,.55);k.dots(rug,INK.yellow,.04,.35);k.key(rug,.02,INK.white);
  k.text('JOÃO · 2005',2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('named after his father',2.5,Z(2.93),.17,INK.white,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:'rdh-m-bdL',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);const hill=`M0 3 L0 1.7 Q1.2 1.3 2.4 1.65 Q3.5 1.95 4.5 1.6 L4.5 3 Z`;k.fill(hill,'#2f5a4a');k.dots(hill,INK.navy,.05,.35);townRow(k,2.5,true);k.fill(rect(0,2.85,4.5,.15),'#56607e');}},
   {key:'rdh-m-bdR',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);seaBand(k,4.5,1.9,3,true);for(let i=0;i<5;i++)k.fill(rect(2.6+i*.05,2.0+i*.16,.7-i*.12,.04),INK.yellow,.7);}},-3.05,1.22);
  const moon=bd.add(moonPlate('rdh-m-moon',.34),'R',3.1,1.95,{out:.015});
  const field=bd.add(S.stars('rdh-m-field',3.2,.8,8),'L',1.8,2.1,{out:.012});
  const stars=[bd.add(bigStar('rdh-m-star1',.3),'L',3.1,2.15,{out:.04}),bd.add(bigStar('rdh-m-star2',.34,INK.white),'L',1.4,2.45,{out:.04}),bd.add(bigStar('rdh-m-star3',.32),'R',1.3,2.35,{out:.04})];
  // Left: the garden at night. The empty chair and Dad's photo.
  B.stand(S.tree('rdh-m-tree',1.1,1.7,'round','#3f7a5a'),-4.4,-1.35,{layer:1});
  const lamp=B.stand(S.lamp('rdh-m-lamp',.34,1.4),-.6,-1.35,{layer:1});
  const seat=B.stand(chair('rdh-m-chair',.8,1.2),-1.35,-.45,{layer:2,s:0});
  const frame=B.stand(photoFrame('rdh-m-frame',1.05,1.3,'DAD'),-2.5,-1.15,{layer:1,s:0});
  const kidO:PersonOpts={shirt:'bib',skin:FAM,hair:'curly',hairColor:'#231a1f',face:'shy'};
  const kid=B.person('rdh-m-kid',-2.35,1.0,1.02,{...kidO,layer:3});const kidSad=faceSwap(kid,'rdh-m-kid-sad',kidO,'sad');
  const mum=B.person('rdh-m-mum',-3.6,.7,1.55,{shirt:'casual',hair:'bun',skin:FAM,face:'smile',adult:true,layer:2});
  const feel=[kid.body.add(wordBubble('rdh-m-sad',.95,.6,'SAD',INK.blue),-.85,1.4,{z:-.02}),kid.body.add(wordBubble('rdh-m-conf',1.25,.6,'CONFUSED',INK.navy),.1,1.85,{z:-.024}),kid.body.add(wordBubble('rdh-m-angry',1.05,.6,'ANGRY',INK.red),1.05,1.4,{z:-.028})];
  const talk=kid.body.add(S.bubble('rdh-m-talk',.55,.46,'dots'),-.55,1.35,{z:-.03}),love=mum.body.add(S.bubble('rdh-m-love',.6,.5,'heart'),.45,1.95,{z:-.02});
  B.stand(S.bush('rdh-m-bush',1.1,.36,'#3f7a5a'),-4.0,1.65,{layer:3,tab:false});
  // Right: years later, Ronaldinho's own son, named João after his father.
  const yr=B.stand(S.post('rdh-m-yrpost',.08,.95),1.45,-.5,{layer:1,s:0});yr.add(S.flipCard('rdh-m-2005',.9,.46,'2005',INK.pink),0,.45,{z:.012});
  const man=B.person('rdh-m-man',2.2,.95,1.55,{shirt:'navy',...RON,face:'smile',adult:true,layer:2});
  const baby=B.stand(cradle('rdh-m-cradle',1.25,.82),3.45,1.35,{layer:3,s:0});
  const name=baby.add(S.banner('rdh-m-name',1.1,.36,'JOÃO',INK.yellow,INK.navy),0,.9,{z:.012});
  const heartR=man.body.add(S.bubble('rdh-m-heartR',.6,.5,'heart'),.55,1.95,{z:-.02});
  const frameR=B.stand(photoFrame('rdh-m-frameR',.75,.95,'DAD'),4.15,-.55,{layer:1,s:0});
  B.stand(S.tree('rdh-m-treeR',.9,1.5,'round','#3f7a5a'),4.55,-1.7,{layer:1});B.stand(S.lamp('rdh-m-lampR',.34,1.4),.65,-1.1,{layer:1});
  B.stand(S.bush('rdh-m-bushR',1.2,.38,'#3f7a5a'),1.1,1.85,{layer:3,tab:false});B.stand(S.bench('rdh-m-benchR',1.1,.45),3.0,-1.25,{layer:1});
  const blooms=[B.stand(flower('rdh-m-fl1',.36,.6),4.45,1.5,{layer:3,s:0}),B.stand(flower('rdh-m-fl2',.32,.52),.45,.9,{layer:2,s:0})];
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   moon.dy=-.5+.5*beat(t,0,2);field.visible=true;field.dy=.04*wave(t,0,42,.3);
   // His father died when he was eight: an empty chair and a photo frame.
   const A=smooth(clamp01(act*3));kid.body.s=Math.max(beat(t,1.8,2.6),A);seat.s=Math.max(beat(t,3.4,4.4),A);frame.s=Math.max(beat(t,4.6,5.6),A);lamp.scale=1+.06*pulse(t,5,7);
   kidSad.visible=t>5.4&&t<27;kid.body.rot=-.05*beat(t,5.6,6.4)*(1-beat(t,26,27));
   // One of the hardest things: Mum comes close and reaches out a hand.
   mum.body.s=beat(t,7.8,8.8);mum.armR.rot=.12+1.25*beat(t,9.6,10.6)-.5*beat(t,34.9,35.6);mum.body.x=-3.6+.35*beat(t,9,10.4);
   // Sad, confused, angry, and those feelings come back again and again.
   feel.forEach((f,i)=>{const on=beat(t,13.4+i*1.4,14+i*1.4)*(1-beat(t,19.4,19.9));const again=1-.35*pulse(t,16.8+i*.4,17.8+i*.4)+.2*pulse(t,18+i*.3,18.8+i*.3);
    f.visible=on>.02;f.scale=on*again;f.dy=.03*wave(t,14,19.4,1+i*.2);});
   // Light the paper stars, one for each happy memory (the page action, 3 taps).
   const lit=Math.max(N?beat(t,20.3,21)+beat(t,21.4,22.1)+beat(t,22.5,23.2):0,act*3);
   stars.forEach((s,i)=>{const u=clamp01(lit-i);s.visible=u>.02;s.scale=smooth(u)*(1+.1*wave(t,23.4,42,.6+i*.15));s.rot=.2*(1-smooth(u));});
   kid.armR.rot=.12+1.6*beat(t,20.2,20.8)-1.6*beat(t,23.2,23.8)+(N?0:1.4*clamp01(act*3));kid.armL.rot=-.12-.4*pulse(t,21,23.4);
   // Families find ways to remember: the photo lifts and glows.
   frame.dy=.22*beat(t,24,25)-.22*beat(t,33.6,34.6);frame.scale=1+.08*pulse(t,24.6,26.4);
   // Years later: 2005, the baby João.
   blooms.forEach((f,i)=>{f.s=beat(t,29.8+i*.6,30.6+i*.6);});yr.s=beat(t,26.6,27.4);man.body.s=beat(t,27.2,28.2);baby.s=beat(t,28.6,29.6);
   name.visible=t>31.2;name.scale=beat(t,31.3,32);frameR.s=beat(t,32.4,33.3);heartR.visible=t>33.2;heartR.dy=-.5+.5*beat(t,33.3,33.9);
   man.armR.rot=.12+1.1*beat(t,29.4,30.2)-1.1*beat(t,33,33.6);man.armL.rot=-.12-.3*wave(t,30.2,33,.8);
   // Talk to someone you trust, and keep remembering.
   talk.visible=t>35.6;talk.dy=-.5+.5*beat(t,35.7,36.3);love.visible=t>37.4;love.dy=-.5+.5*beat(t,37.5,38.1);
   return N?-.7*beat(t,1.8,2.8)+.7*beat(t,19.8,20.6)+.8*beat(t,26.4,27.4)-.8*beat(t,34.8,35.8):0;
  };
 }};

/* =========================================================================================== */
/* 3 · The smallest player (u17): "inho", futsal and sand, 23–0 at 13, Egypt 1997                 */
/* =========================================================================================== */
const u17:SpreadDef={id:'u17',rest:29.6,
 left:k=>{pitch(k,-5,0);const p=rect(-4.8,Z(-.6),4.6,2.9);chalk(k,p);chalk(k,ell(-.2,Z(.85),.7,.7));
  const bars=[.2,.38,.56,.74,.92];bars.forEach((f,i)=>k.fill(rect(-4.95+i*.07,Z(-2.3)+(1-f)*.6,.05,f*.6),INK.white,.5));
  k.text('THE SMALLEST',-2.5,Z(2.62),.46,INK.pink,{max:4.2});k.text('often the youngest and the smallest',-2.5,Z(2.93),.17,INK.navy,{weight:800,max:4.2});},
 right:k=>{sand(k,0,5,0,Z(-1.2),'#f0cf8a');const p=rect(0,Z(-1.0),4.8,3.4);k.fill(p,INK.grass,.8);k.dots(p,INK.leaf,.06,.25);chalk(k,p);chalk(k,ell(0,Z(.7),.9,.9));chalk(k,`M4.8 ${Z(-.2)} L3.6 ${Z(-.2)} L3.6 ${Z(1.6)} L4.8 ${Z(1.6)}`);
  k.text('EGYPT 1997',2.5,Z(2.62),.46,INK.orange,{max:4});k.text('UNDER-17 WORLD CHAMPIONSHIP',2.5,Z(2.94),.15,INK.navy,{weight:900,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:'rdh-u-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hill=`M0 3 L0 1.2 Q.8 .8 1.6 1.1 Q2.6 1.5 3.4 1.2 Q4 1 4.5 1.3 L4.5 3 Z`;k.fill(hill,INK.green);k.dots(hill,INK.navy,.05,.2);
    townRow(k,2.1);const fence=`M0 2.1 L4.5 2.1 L4.5 2.7 L0 2.7 Z`;k.hatch(fence,INK.navy,.08,.78,.008);k.hatch(fence,INK.navy,.08,-.78,.008);k.fill(rect(0,2.7,4.5,.3),INK.grass);}},
   {key:'rdh-u-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3,INK.orange,'#ffe2a8');const nile=`M0 2.2 Q2 2.05 4.5 2.3 L4.5 2.55 Q2 2.35 0 2.5 Z`;
    const d1=`M0 3 L0 1.8 Q1 1.5 2.1 1.9 Q3.3 2.3 4.5 1.75 L4.5 3 Z`;k.fill(d1,'#ecc47e');k.dots(d1,INK.orange,.05,.25);k.fill(nile,INK.blue);k.dots(nile,INK.navy,.04,.3);
    for(let i=0;i<4;i++){const x=.4+i*1.1;k.keyFill(rect(x,1.75,.04,.45),INK.brown);for(let j=0;j<5;j++){const a=-Math.PI+j*Math.PI/4;k.key(`M${x+.02} 1.76 Q${x+.02+Math.cos(a)*.18} ${1.66+Math.sin(a)*.08} ${x+.02+Math.cos(a)*.3} ${1.8+Math.sin(a)*.12}`,.04,INK.green);}}
    crowdRows(k,4.5,2.55,2.9,[INK.white,INK.yellow,INK.red,INK.leaf,INK.navy],5);}},-3.05,1.22);
  const sunP=bd.add(S.sun('rdh-u-sun',.45,INK.yellow),'R',3.4,1.3,{out:.015});
  const conf=bd.add(S.confetti('rdh-u-cf',2.4,1.2,3),'L',1.2,1.4,{out:.03});
  // Left: the youth line-up, tallest to smallest, next to the measuring post.
  B.stand(heightChart('rdh-u-chart',.3,1.9),-4.65,-1.55,{layer:1});
  const big=[B.person('rdh-u-big1',-4.0,-1.2,1.42,{shirt:'navy',hair:'short',skin:'#f1b88f',face:'smile',layer:2}),B.person('rdh-u-big2',-3.3,-1.35,1.36,{shirt:'casual',hair:'bun',skin:'#d99a6c',face:'grin',layer:2}),B.person('rdh-u-big3',-2.6,-1.2,1.3,{shirt:'keeper',hair:'long',skin:'#b27650',face:'smile',layer:2,holdL:'glove',holdR:'glove'})];
  const kid=B.person('rdh-u-kid',-1.85,-1.05,.9,{shirt:'bib',...RON,legs:'kick',layer:2});B.slot(-1.85,-.9,-2.1,.7);
  const bloom=B.stand(flower('rdh-u-bloom',.4,.7),-1.25,-1.45,{layer:1,s:0});
  const board=B.stand(S.scoreboard('rdh-u-board',1.6,1.3,'AGE 13'),-.95,-2.15,{layer:1,s:0});
  board.add(S.flipCard('rdh-u-230',1.25,.56,'23 – 0',INK.yellow,INK.navy),0,.26,{z:.012});const b00=board.flap(S.flipCard('rdh-u-00',1.25,.56,'0 – 0',INK.blue),0,.82-.56,{anchor:'bottom',z:.022});
  const namePost=B.stand(S.post('rdh-u-namepost',.08,1.0),-.85,.7,{layer:2,s:0});
  namePost.add(S.flipCard('rdh-u-inho',1.35,.46,'RONALDINHO',INK.pink),0,.48,{z:.012});const nameFlap=namePost.flap(S.flipCard('rdh-u-ronaldo',1.35,.46,'RONALDO',INK.blue),0,.94,{z:.022});
  const inho=B.stand(plateCard('rdh-u-small',1.3,.62,['“INHO”','MEANS SMALL'],INK.yellow),-3.95,.55,{layer:2,s:0});
  const friendly=inho.add(S.bubble('rdh-u-friend',.55,.46,'heart'),.55,.55,{z:.02});
  const cards=[B.stand(surfaceCard('rdh-u-cCourt',.85,.62,'FUTSAL','court'),-3.7,1.85,{layer:3,s:0}),B.stand(surfaceCard('rdh-u-cSand',.85,.62,'BEACH','sand'),-2.75,1.95,{layer:3,s:0})];
  const ball=B.stand(S.ball('rdh-u-ball',.1),-1.55,-.95,{layer:3,tab:false});
  const star=kid.body.add(S.bubble('rdh-u-star',.55,.46,'star'),-.5,1.3,{z:-.02});
  // Right: Egypt 1997. Paper pyramids lie flat until they are raised.
  const pyr=[B.stand(pyramid('rdh-u-pyrL',1.9,1.3),1.7,-1.55,{layer:1,s:0}),B.stand(pyramid('rdh-u-pyrR',2.2,1.5),3.25,-1.3,{layer:1,s:0}),B.stand(pyramid('rdh-u-pyrS',1.3,.9),4.25,-1.0,{layer:1,s:0})];
  B.stand(dune('rdh-u-dune',1.6,.45),.9,-2.1,{layer:1,tab:false});B.stand(S.tree('rdh-u-palm',1.0,1.8,'palm'),4.5,-.6,{layer:1});
  const camel=B.stand(camelPlate('rdh-u-camel',1.0,.8),4.05,.75,{layer:2});
  const yr=B.stand(S.post('rdh-u-yrpost',.08,.9),.55,.1,{layer:2,s:0});yr.add(S.flipCard('rdh-u-1997',.9,.46,'1997',INK.orange),0,.42,{z:.012});
  const team=[B.person('rdh-u-m1',1.4,.55,1.2,{shirt:'bib',hair:'short',skin:'#d99a6c',face:'smile',layer:2}),B.person('rdh-u-hero',2.2,.95,1.08,{shirt:'bib',...RON,layer:3}),B.person('rdh-u-m2',3.0,.45,1.22,{shirt:'bib',hair:'bald',skin:'#b27650',face:'smile',layer:2})];
  const flag=bd.add(S.banner('rdh-u-brazil',2.0,.38,'BRAZIL',INK.yellow,INK.leaf),'R',1.5,1.55,{out:.03});
  const post=B.stand(S.post('rdh-u-ppost',.12,1.1),.3,2.0,{layer:3,s:0});
  const arm=post.arm(S.strip('rdh-u-strip',.09,2.3),0,1.08,{z:.02});const planeP=post.add(S.plane('rdh-u-plane',.6,.3),0,0,{z:.035,anchor:'center'});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   sunP.dy=.5*beat(t,0,2.4)+.2*pulse(t,30,33);
   // His football began to blossom at eight.
   kid.body.s=beat(t,2,2.8);bloom.s=beat(t,3,4.4);bloom.scale=1+.12*pulse(t,4.4,5.4);
   // Youngest and smallest: the big kids line up beside him.
   big.forEach((p,i)=>{p.body.s=beat(t,5.6+i*.6,6.4+i*.6);p.armL.rot=-.12-1.9*pulse(t,16.4+i*.3,18.2)-(t>35.9?2.3*beat(t,36+i*.2,36.6+i*.2):0);p.armR.rot=.12+1.9*pulse(t,16.4+i*.3,18.2)+(t>35.9?2.3*beat(t,36+i*.2,36.6+i*.2):0);});
   // So people called him Ronaldinho: RONALDO flips up to RONALDINHO.
   namePost.s=beat(t,9.4,10.2);nameFlap.flip=-2.85*beat(t,10.8,11.6);
   // "inho" means small, and it is a loving word.
   inho.s=beat(t,12.4,13.3);friendly.visible=t>15.4;friendly.scale=beat(t,15.5,16.1);
   // Futsal and beach football: he steps forward and the ball dances.
   const fwd=beat(t,18.6,19.8);kid.body.x=lerp(-1.85,-2.1,fwd);kid.body.z=lerp(-1.05,.7,fwd);
   cards.forEach((c,i)=>{c.s=beat(t,19.4+i*.9,20.2+i*.9);c.rot=.06*wave(t,22+i*.3,24.2,1.2);});
   const jug=t>20.6&&t<24.2?Math.abs(Math.sin((t-20.6)*Math.PI*1.3)):0;ball.x=kid.body.x+.3;ball.z=kid.body.z+.1;ball.dy=.42*jug;kid.leg!.rot=.8*Math.max(0,1-jug*3)*(t>20.6&&t<24.2?1:0);
   // At 13, all 23 goals in a 23–0 win.
   board.s=beat(t,24.2,25);b00.flip=1.75*beat(t,26.4,27.2);
   if(t>25.6&&t<28.6){const sh=beat(t,25.6,26.4);ball.x=lerp(kid.body.x+.3,-.9,sh);ball.z=lerp(kid.body.z+.1,-1.5,sh);ball.dy=.5*Math.sin(sh*Math.PI);kid.leg!.rot=1.1*pulse(t,25.4,26);}
   const cheer=beat(t,27.3,27.9)-beat(t,28.8,29.4)+(t>35.9?beat(t,36,36.6):0);kid.armL.rot=-.12-2.3*cheer-.25*wave(t,27.9,28.8,1.6);kid.armR.rot=.12+2.3*cheer+.25*wave(t,27.9,28.8,1.5);
   conf.visible=t>27.2&&t<31||t>36;conf.dy=-1+1.1*beat(t,27.3,28.6);
   // 1997, Egypt: raise the pyramids; the plane crosses; the team pops up.
   yr.s=Math.max(beat(t,29.1,29.8),smooth(clamp01(act*2.5)));
   const raise=Math.max(N?beat(t,30,32):0,act);pyr.forEach((p,i)=>{p.s=smooth(clamp01((raise-i*.16)/.68));});
   team.forEach((p,i)=>{p.body.s=Math.max(beat(t,31.4+i*.5,32.2+i*.5),N?0:smooth(clamp01((act-.3)/.5)));});
   flag.dy=-2.0+2.0*Math.max(beat(t,32,32.8),N?0:act);camel.dx=-.15*beat(t,30,36);camel.rot=.03*wave(t,30,36,.8);
   post.s=beat(t,32.2,32.8)-beat(t,35.4,35.9);const th=-.85+1.7*beat(t,32.6,35.2);arm.rot=Math.PI-th;planeP.dx=Math.sin(th)*2.2;planeP.dy=1.08+Math.cos(th)*2.2;planeP.rot=-th*.7;
   const up=(N?beat(t,33.4,34):smooth(clamp01((act-.8)/.2)));team.forEach(p=>{p.armL.rot=-.12-2.3*up-.25*wave(t,34,40.8,1.5);p.armR.rot=.12+2.3*up+.25*wave(t,34,40.8,1.6);});
   // Being small can be a strength.
   star.visible=t>36.1;star.dy=-.5+.5*beat(t,36.2,36.8);
   return N?-.75*beat(t,2,3)+1.5*beat(t,29,30)-.75*beat(t,35.9,36.9):(act>0?.6:0);
  };
 }};

/* =========================================================================================== */
/* 4 · A brother who helped (free id kept): 2002 free kick, then the family behind the scenes     */
/* =========================================================================================== */
const ARC_L=2.6,ARC_X=.75,ARC_Z=.75;
const free:SpreadDef={id:'free',rest:14.2,
 left:k=>{pitch(k,-5,0);chalk(k,ell(0,Z(.2),1,1));chalk(k,`M0 ${Z(-3.2)} L0 ${Z(3.2)}`,.02);
  k.key(`M-1.85 ${Z(.9)} Q-.6 ${Z(.25)} 0 ${Z(.35)}`,.03,INK.yellow);k.fill(ell(-1.85,Z(.88),.16,.07),INK.white,.6);
  k.text('BEHIND THE SCENES',-2.5,Z(2.62),.36,INK.pink,{max:4.3});k.text('family helped too',-2.5,Z(2.93),.18,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);chalk(k,`M5 ${Z(-1.3)} L2.2 ${Z(-1.3)} L2.2 ${Z(1.9)} L5 ${Z(1.9)}`);chalk(k,`M5 ${Z(-.35)} L3.5 ${Z(-.35)} L3.5 ${Z(1.05)} L5 ${Z(1.05)}`);k.circle(3.0,Z(.8),.05,INK.white);
  k.key(`M0 ${Z(.35)} Q2 ${Z(.15)} 3.35 ${Z(.55)}`,.03,INK.yellow);for(let i=0;i<4;i++)k.fill(rect(1.1+i*.3,Z(1.45),.18,.05),INK.white,.8);
  k.text('WORLD CUP 2002',2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('quarter-final v England',2.5,Z(2.92),.18,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:'rdh-f-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowdRows(k,4.5,1.0,2.6,[INK.yellow,INK.leaf,INK.yellow,INK.blue,INK.white],1);lightRig(k,1,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'rdh-f-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowdRows(k,4.5,1.0,2.6,[INK.white,INK.red,INK.white,INK.yellow,INK.leaf],4);lightRig(k,1.4,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner('rdh-f-banner',2.4,.42,'WORLD CUP 2002',INK.leaf),'L',1.3,1.55,{out:.03});
  const qf=B.stand(S.scoreboard('rdh-f-board',1.8,1.4,'QUARTER-FINAL'),1.5,-2.0,{layer:1});const vs=qf.add(S.flipCard('rdh-f-vs',1.45,.6,'BRAZIL v ENGLAND',INK.blue),0,.27,{z:.012});
  const flagL=B.stand(cornerFlag('rdh-f-flagL',.35,.8),-4.6,2.0,{layer:3}),flagR=B.stand(cornerFlag('rdh-f-flagR',.35,.8),4.6,2.0,{layer:3});
  const cup=B.stand(S.trophy('rdh-f-cup',.5,.85),-1.15,-1.55,{layer:1,s:0});
  const hero=B.person('rdh-f-hero',-2.3,1.05,1.34,{shirt:'bib',...RON,legs:'kick',layer:3});B.slot(-3.3,1.2,-2.3,1.1);
  const heart=hero.body.add(S.bubble('rdh-f-heart',.6,.5,'heart'),.6,1.74,{z:-.02});
  const eng=[1.25,1.62,1.99].map((x,i)=>{const p=B.person(`rdh-f-e${i}`,x,1.3-i*.05,1.18,{shirt:'ger',hair:(['short','bald','curly'] as const)[i],skin:['#f1b88f','#d99a6c','#f1b88f'][i],face:'open',layer:2});p.body.add(kitOverlay(`rdh-f-ek${i}`,1.18,INK.white,null,undefined,INK.navy),0,0,{z:.004});return p;});
  B.stand(S.goal('rdh-f-goal',1.55,.85),3.55,.5,{layer:2});
  const tgt=B.stand(target('rdh-f-target',.15),4.05,.52,{layer:2,tab:false,s:0});tgt.dy=.52;
  const gk=B.person('rdh-f-gk',2.7,1.0,1.22,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const pin=B.stand(S.post('rdh-f-pin',.14,.16),ARC_X,ARC_Z,{layer:3});
  const strip=pin.arm(S.strip('rdh-f-strip',.08,ARC_L+.05),0,.1,{z:.02});
  const ball=pin.add(S.ball('rdh-f-ball',.12),0,0,{z:.035,anchor:'center'});
  // Left, behind the scenes: Roberto (manager) and Deisi (press coordinator), and the flap that names them.
  const who=B.stand(S.post('rdh-f-whopost',.12,1.45),-3.2,-1.2,{layer:1});
  who.add(plateCard('rdh-f-names',1.9,.9,['ROBERTO · MANAGER','DEISI · PRESS COORDINATOR'],INK.yellow),0,.5,{z:.012});
  const whoFlap=who.flap(plateCard('rdh-f-who',1.9,.9,['WHO','HELPED?'],INK.pink,INK.white),0,1.4,{z:.024});
  const bro=B.person('rdh-f-bro',-4.45,-.2,1.5,{shirt:'fan',hair:'short',skin:FAM,face:'smile',adult:true,layer:2});
  const sis=B.person('rdh-f-sis',-1.75,-.5,1.42,{shirt:'coach',hair:'long',skin:FAM,face:'smile',adult:true,layer:2});
  const bootPost=B.stand(S.post('rdh-f-bootpost',.08,.9),-4.55,1.0,{layer:2,s:0});const boot=bootPost.add(S.icon('rdh-f-boot',.42,'boot'),0,.5,{z:.012});
  const mgr=bro.body.add(plateCard('rdh-f-mgr',.95,.36,['MANAGER'],INK.white),.05,1.95,{z:.02});
  const press=sis.body.add(plateCard('rdh-f-press',.85,.36,['PRESS'],INK.white),0,1.85,{z:.02});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   // 2002: Brazil win the World Cup: banner and cup pop.
   ban.dy=-.9+.9*beat(t,2,2.9);ban.visible=t>1.9;cup.s=beat(t,2.8,3.8);cup.scale=1+.12*pulse(t,3.8,5.2);flagL.rot=.12*wave(t,2,40,.7);flagR.rot=-.12*wave(t,2.3,40,.8);
   hero.armL.rot=-.12-2.3*(beat(t,3.4,4)-beat(t,6.2,6.8));hero.armR.rot=.12+2.3*(beat(t,3.4,4)-beat(t,6.2,6.8));
   // Quarter-final v England: the wall, the keeper, the free kick from far out curls in.
   qf.s=beat(t,6.8,7.5);vs.scale=beat(t,7.2,7.8);
   eng.forEach((e,i)=>{e.body.s=beat(t,7.4+i*.35,8.2+i*.35);e.armL.rot=-.12-.55*beat(t,8.8,9.3);e.armR.rot=.12+.55*beat(t,8.8,9.3);e.body.yaw=-.9*(beat(t,11,11.6)-beat(t,14,14.8));});
   gk.body.x=3.3-.6*beat(t,8.2,9.2);hero.body.x=-2.3-1.0*beat(t,8.4,9.2)+1.0*beat(t,9.4,10.1);
   const kick=beat(t,10.2,12.2);const th=-1.52+3.02*kick;strip.rot=Math.PI-th;ball.dx=Math.sin(th)*ARC_L;ball.dy=.1+Math.cos(th)*ARC_L;ball.rot=-kick*14;
   hero.leg!.rot=.9*pulse(t,9.9,10.6);tgt.s=beat(t,11.6,12.3);tgt.scale=1+.25*pulse(t,12.3,13.4);
   const late=smooth(clamp01((t-12.1)/.8));gk.armL.rot=-.12-2.3*late*(1-beat(t,13.6,14.2));gk.armR.rot=.12+2.3*late*(1-beat(t,13.6,14.2));gk.body.rot=.25*late;
   if(t>12.4&&t<14.4){const c=beat(t,12.4,12.9);hero.armL.rot=-.12-2.4*c;hero.armR.rot=.12+2.4*c;}
   // Behind the scenes (the page action lifts the flap and brings the family up).
   const fam=N?1:smooth(clamp01(act/.5));
   const A=smooth(clamp01(act/.5));bro.body.s=Math.max(N?beat(t,17.6,18.5):fam,A);bootPost.s=Math.max(N?beat(t,18.6,19.4):fam,A);boot.rot=.1*wave(t,19.4,22,1);
   mgr.visible=t>22.8||act>.6;mgr.scale=Math.max(N?beat(t,22.9,23.6):0,smooth(clamp01((act-.6)/.3)));
   bro.armR.rot=.12+1.4*beat(t,23,23.6)-1.4*beat(t,26,26.6);
   sis.body.s=Math.max(N?beat(t,26.6,27.5):fam,A);press.visible=t>28.2||act>.7;press.scale=Math.max(N?beat(t,28.3,29):0,smooth(clamp01((act-.7)/.3)));
   sis.armL.rot=-.12-1.4*beat(t,28.2,28.8)+1.4*beat(t,30.4,31);
   const lift=Math.max(N?beat(t,31.2,32.4):0,act);whoFlap.flip=-2.85*lift;
   // Families help each other: everyone celebrates together.
   heart.visible=t>33.6;heart.dy=-.5+.5*beat(t,33.7,34.3);
   const joy=N?beat(t,34.4,35):smooth(clamp01((act-.85)/.15));
   if(joy>0){for(const p of [bro,sis]){p.armL.rot=-.12-2.3*joy-.25*wave(t,35,39.5,1.5);p.armR.rot=.12+2.3*joy+.25*wave(t,35,39.5,1.6);}}
   return N?-.6*beat(t,1.9,2.9)+.6*beat(t,6.7,7.6)+.35*beat(t,11.4,12.2)-1.15*beat(t,14.4,15.4)+.8*beat(t,33.3,34.3):(act>0?-.6:0);
  };
 }};

/* =========================================================================================== */
/* 5 · Left out, then hurt (applause id kept): the closed gate of 2004, the injury of 2008        */
/* =========================================================================================== */
const applause:SpreadDef={id:'applause',rest:10.2,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-1.7)} L-2.6 ${Z(-1.7)} L-2.6 ${Z(-.4)} L-5 ${Z(-.4)}`);
  const walk=`M-1.8 ${Z(-.2)} L-1.2 ${Z(-.2)} L-1.0 ${Z(1.9)} L-2.0 ${Z(1.9)} Z`;k.fill(walk,INK.stone);k.dots(walk,INK.navy,.04,.15);
  k.text('LEFT OUT · 2004',-2.5,Z(2.62),.4,INK.blue,{max:4.2});k.text('then captain · 2005 Confederations Cup',-2.5,Z(2.93),.16,INK.navy,{weight:800,max:4.3});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,INK.stone);k.dots(p,INK.navy,.05,.14);for(let r=0;r<9;r++)k.key(`M0 ${Z(-3)+r*.7} L5 ${Z(-3)+r*.7}`,.008,'#a8987a');
  const turf=rect(.2,Z(-1.1),4.6,2.4);k.fill(turf,INK.grass,.75);k.dots(turf,INK.leaf,.05,.25);chalk(k,turf);
  k.text('A HARDER TIME',2.5,Z(2.62),.42,INK.pink,{max:4});k.text('2007–08 · then AC Milan',2.5,Z(2.93),.17,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:'rdh-l-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowdRows(k,4.5,1.0,2.6,[INK.yellow,INK.leaf,INK.yellow,INK.blue,INK.white],2);lightRig(k,1,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'rdh-l-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3,INK.grey,'#dfe3e6');townRow(k,2.55);k.fill(rect(0,2.85,4.5,.15),INK.stone);}},-3.05,1.22);
  const ban=bd.add(S.banner('rdh-l-cup',2.6,.4,'CONFEDERATIONS CUP 2005',INK.leaf),'L',1.5,1.55,{out:.03});
  const rain=bd.add(rainCloud('rdh-l-rain',1.6,.7),'R',2.2,2.0,{out:.03}),drops=bd.add(rainLines('rdh-l-drops',1.4,.85),'R',2.2,1.2,{out:.035});
  const sunP=bd.add(S.sun('rdh-l-sun',.4),'R',3.6,1.9,{out:.015});const shine=bd.add(S.stars('rdh-l-stars',2.2,.5,7),'R',2.4,1.4,{out:.03});
  // Left: the 2004 squad behind a fence, and a closed gate.
  const board=B.stand(S.scoreboard('rdh-l-board',1.8,1.4,'COPA AMÉRICA'),-1.0,-2.05,{layer:1,s:0});board.add(S.flipCard('rdh-l-2004',1.4,.6,'2004',INK.yellow,INK.navy),0,.27,{z:.012});
  const squad=[-4.3,-3.6,-2.9].map((x,i)=>B.person(`rdh-l-sq${i}`,x,-1.15-(i%2)*.2,1.24,{shirt:'bib',hair:(['short','bald','long'] as const)[i],skin:['#d99a6c','#b27650','#f1b88f'][i],face:'smile',layer:1}));
  const coach=B.person('rdh-l-coach',-2.05,-1.2,1.5,{shirt:'coach',hair:'short',skin:'#f1b88f',face:'open',adult:true,layer:1});
  const rest=coach.body.add(plateCard('rdh-l-rest',1.1,.36,['STARS RESTED'],INK.white),-.85,1.62,{z:.02});
  B.stand(S.fenceStrip('rdh-l-fenceL',2.7,.62),-3.5,-.3,{layer:2});B.stand(S.fenceStrip('rdh-l-fenceR',.75,.62),-.55,-.3,{layer:2});
  const gate=B.stand(gateFrame('rdh-l-gate',1.24,.95,'SQUAD'),-1.5,-.3,{layer:2});
  const leafL=gate.flap(gateLeaf('rdh-l-leafL',.52,.58),-.52,.02,{anchor:'bl',axis:'y',z:.012}),leafR=gate.flap(gateLeaf('rdh-l-leafR',.52,.58),.52,.02,{anchor:'br',axis:'y',z:.012});
  const heroO:PersonOpts={shirt:'bib',skin:FAM,hair:'curly',hairColor:'#231a1f',face:'shy',legs:'kick'};
  const hero=B.person('rdh-l-hero',-1.5,1.05,1.24,{...heroO,layer:3});B.slot(-1.5,1.05,-1.5,-.75);
  const band=hero.body.add(captainBand('rdh-l-c',.09),-.2,.95,{z:.012});
  B.stand(S.bench('rdh-l-bench',1.0,.42),-3.1,1.2,{layer:3});
  const cup=B.stand(S.trophy('rdh-l-trophy',.5,.85),-.55,.9,{layer:3,s:0});
  // Right: Barcelona, a season of injuries; then Milan and his best form again.
  const cal=B.stand(S.post('rdh-l-calpost',.1,1.2),.85,-1.35,{layer:1});cal.add(S.flipCard('rdh-l-april',1.0,.46,'APRIL 2008',INK.pink),0,.66,{z:.012});
  const calFlap=cal.flap(S.flipCard('rdh-l-0708',1.0,.46,'2007–08',INK.blue),0,1.12,{z:.022});
  const h2O:PersonOpts={shirt:'navy',...RON,face:'shy',legs:'kick'};
  const h2=B.person('rdh-l-h2',2.1,.7,1.3,{...h2O,layer:3});const barca=h2.body.add(kitOverlay('rdh-l-barca',1.3,BLAUGRANA,GARNET),0,0,{z:.004});
  const milan=h2.body.add(kitOverlay('rdh-l-milan',1.3,'#1b1b24',INK.red,undefined,INK.white),0,0,{z:.0045});
  const aid=B.stand(aidBox('rdh-l-aid',.55,.5),3.05,1.45,{layer:3,s:0});
  const physio=B.person('rdh-l-physio',3.5,.3,1.5,{shirt:'coach',hair:'bun',skin:'#d99a6c',face:'smile',adult:true,layer:2});
  B.stand(S.bench('rdh-l-rbench',1.1,.45),2.6,-.35,{layer:2});
  const over=B.stand(S.sign('rdh-l-over',1.1,.95,'SEASON OVER',INK.white),4.2,1.1,{layer:3,s:0});
  const milanSign=B.stand(S.sign('rdh-l-milan',1.1,.95,'AC MILAN',INK.red),4.2,1.1,{layer:3,s:0});
  const suitcase=B.stand(bag('rdh-l-bag',.5,.55),1.35,1.55,{layer:3,s:0});
  B.stand(S.goal('rdh-l-goal',1.3,.75),3.9,-1.3,{layer:1});
  const ball=B.stand(S.ball('rdh-l-ball',.11),2.45,.8,{layer:3,tab:false});
  const tips=['REST','ASK FOR HELP','TRY AGAIN'].map((l,i)=>B.stand(S.flipCard(`rdh-l-tip${i}`,1.1,.4,l,[INK.sky,INK.yellow,INK.pink][i],i===1?INK.navy:INK.white),.9+i*1.45,2.2,{layer:3,s:0}));
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   // 2004: the coach rests his stars; Ronaldinho is left outside the gate.
   board.s=beat(t,2.2,3);squad.forEach((p,i)=>{p.body.s=beat(t,3+i*.4,3.8+i*.4);});coach.body.s=beat(t,4.2,5);
   rest.visible=t>5.4&&t<10.6;rest.scale=beat(t,5.5,6.1);coach.armR.rot=.12+1.2*beat(t,5.4,6)-1.2*beat(t,9.6,10.2);
   hero.body.rot=-.05*beat(t,7.4,8.2)*(1-beat(t,10.4,11));
   // Open the gate: he comes back as captain (the page action).
   const open=Math.max(N?beat(t,10.6,11.8):0,act);leafL.flip=-1.35*open;leafR.flip=1.35*open;
   const walk=smooth(clamp01((open-.35)/.65));hero.body.z=lerp(1.05,-.75,walk);
   const aB=smooth(clamp01((act-.8)/.2)),aW=smooth(clamp01((act-.9)/.1));
   band.visible=t>12.6||act>.8;band.scale=Math.max(beat(t,12.7,13.3),aB);
   ban.visible=t>14.2||act>.9;ban.dy=-.9+.9*Math.max(beat(t,14.3,15.2),aW);cup.s=Math.max(beat(t,15,15.9),smooth(clamp01((act-.85)/.15)));
   const win=Math.max(beat(t,15.8,16.4)-beat(t,17.2,17.8),aW);
   for(const p of [hero,...squad]){p.armL.rot=-.12-2.3*win-.25*wave(t,16.4,17.2,1.6);p.armR.rot=.12+2.3*win+.25*wave(t,16.4,17.2,1.5);}
   // Later came a harder time: the rain cloud rolls in over the city.
   rain.visible=t>17.5&&t<35;rain.dx=1.2-1.2*beat(t,17.6,19)+1.4*beat(t,33,35);drops.visible=t>18.6&&t<34.2;drops.dx=rain.dx;drops.dy=-.08*wave(t,18.6,34.2,1.4);
   sunP.dy=-1.2*beat(t,17.6,19)+1.2*beat(t,33.2,34.6);sunP.visible=t<18.6||t>33.3;
   // 2007–08, full of injuries; April 2008, a muscle tear ends the season. Help arrives.
   h2.body.s=beat(t,19.6,20.4);cal.s=beat(t,20.1,20.9);
   const limp=pulse(t,22,23)+pulse(t,24.4,25.4);h2.body.rot=-.08*limp;h2.body.x=2.1+.3*beat(t,22,25.4)*(1-beat(t,28.4,29.4));
   calFlap.flip=-2.85*beat(t,25.2,26);physio.body.s=beat(t,23.2,24);physio.armL.rot=-.12-1.25*beat(t,24,24.8)+1.25*beat(t,29,29.6);
   aid.s=beat(t,24.4,25.2);over.s=beat(t,27.6,28.4)*(1-beat(t,30.4,31));
   // Barcelona sold him to AC Milan: the case and the new colours.
   suitcase.s=beat(t,30,30.8)*(1-beat(t,33.4,34));milanSign.s=beat(t,31,31.8);
   const toMilan=t>31.4;barca.visible=!toMilan;milan.visible=toMilan;milan.scale=toMilan?beat(t,31.4,32):1;
   // His second season: best form again. The sun, a shot into the goal, stars.
   const sh=beat(t,34.4,35.6);ball.x=lerp(2.45,3.9,sh);ball.z=lerp(.8,-1.15,sh);ball.dy=.5*Math.sin(sh*Math.PI);ball.rot=-ball.x*6;h2.leg!.rot=.9*pulse(t,34,34.7);
   shine.visible=t>35.4;shine.dy=-.6+.6*beat(t,35.5,36.3);
   const up=beat(t,35.8,36.4);if(t>35.8){h2.armL.rot=-.12-2.3*up-.25*wave(t,36.4,42.9,1.5);h2.armR.rot=.12+2.3*up+.25*wave(t,36.4,42.9,1.6);}
   // Rest, ask for help, try again.
   tips.forEach((c,i)=>{c.s=beat(t,37.6+i*1.2,38.4+i*1.2);});
   return N?-.8*beat(t,2.2,3.2)+1.6*beat(t,17.6,18.6)-.8*beat(t,37.2,38.2):(act>0?-.6:0);
  };
 }};

/* =========================================================================================== */
/* 6 · Tears of joy (joy): number 49 for his mother, 2013, the ovation at América in 2015         */
/* =========================================================================================== */
const AME=[INK.yellow,INK.yellow,INK.navy,INK.yellow,INK.white,INK.yellow,INK.navy,INK.yellow];
const joy:SpreadDef={id:'joy',rest:21.9,
 left:k=>{pitch(k,-5,0);chalk(k,ell(0,Z(.4),1,1));chalk(k,`M-5 ${Z(-1.7)} L-2.6 ${Z(-1.7)} L-2.6 ${Z(.5)} L-5 ${Z(.5)}`);
  k.text('NUMBER 49',-2.5,Z(2.62),.46,INK.navy,{max:4.2});k.text('for the year his mother was born',-2.5,Z(2.93),.17,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5,true);chalk(k,ell(0,Z(.4),1,1));chalk(k,`M5 ${Z(-1.7)} L2.6 ${Z(-1.7)} L2.6 ${Z(.5)} L5 ${Z(.5)}`);k.circle(3.3,Z(-.3),.05,INK.white);
  k.text('APRIL 2015',2.5,Z(2.62),.46,INK.yellow,{max:4});k.text('two goals away at América',2.5,Z(2.93),.17,INK.white,{weight:800,max:4});},
 build:B=>{
  const stand=(k:Kit)=>{nightSky(k,4.5,3);const tiers=rect(0,1.1,4.5,1.55);k.fill(tiers,'#56607e');for(let r=0;r<9;r++)k.key(`M0 ${1.18+r*.17} L4.5 ${1.18+r*.17}`,.02,'#8d97b5');
   for(let i=0;i<60;i++){const x=((i*37)%89)/89*4.4+.05,y=1.25+((i*53)%47)/47*1.3;k.circle(x,y,.04,AME[i%AME.length]);}
   k.fill(rect(0,.95,4.5,.16),INK.grey);k.key(rect(0,.95,4.5,.16),.012);k.fill(rect(0,2.65,4.5,.35),'#3f7f5a');};
  const bd=B.vfold({key:'rdh-j-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowdRows(k,4.5,1.0,2.6,[INK.white,'#26262e',INK.white,'#26262e',INK.yellow],3);lightRig(k,1,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'rdh-j-bdR',w:4.5,h:3.0,paint:k=>{stand(k);lightRig(k,1.3,.3);lightRig(k,3.9,.35);}},-3.05,1.22);
  const stars=bd.add(S.stars('rdh-j-stars',2.6,.6,9),'R',.9,2.35,{out:.02});
  const conf=[bd.add(S.confetti('rdh-j-cf1',2.4,1.2,1),'L',.6,1.4,{out:.03}),bd.add(S.confetti('rdh-j-cf2',2.4,1.2,3),'R',.6,1.4,{out:.03})];
  const madrid=bd.add(S.banner('rdh-j-madrid',2.0,.4,'MADRID 2005',INK.pink),'R',3.1,2.3,{out:.035});
  // Left: Atlético Mineiro, number 49, Mum, and the 2013 Copa Libertadores.
  const hero=B.person('rdh-j-hero',-2.2,.85,1.3,{shirt:'ger',...RON,legs:'kick',layer:3});hero.body.add(kitOverlay('rdh-j-hk',1.3,INK.white,'#26262e','49',INK.red),0,0,{z:.004});
  const lball=B.stand(S.ball('rdh-j-lball',.11),-1.85,.95,{layer:3,tab:false});
  const n49=B.stand(S.post('rdh-j-49post',.1,1.2),-3.35,-1.25,{layer:1,s:0});n49.add(S.flipCard('rdh-j-49',.8,.62,'49',INK.white,'#26262e'),0,.55,{z:.012});
  const mum=B.person('rdh-j-mum',-4.2,-.1,1.5,{shirt:'casual',hair:'bun',skin:FAM,face:'smile',adult:true,layer:2});
  const mumHeart=mum.body.add(S.bubble('rdh-j-mumheart',.6,.5,'heart'),.5,1.95,{z:-.02});
  const pod=B.stand(podium('rdh-j-pod',1.45,.75,'2013','COPA LIBERTADORES',INK.blue),-1.45,-1.35,{layer:1,s:0});const cupJ=pod.add(S.trophy('rdh-j-cup',.5,.85),0,.75,{z:.01});
  const flagL=B.stand(cornerFlag('rdh-j-flagL',.35,.8),-4.65,2.0,{layer:3});
  const bro=B.person('rdh-j-bro',-3.55,1.55,1.44,{shirt:'fan',hair:'short',skin:FAM,face:'smile',adult:true,layer:3}),sis=B.person('rdh-j-sis',-4.45,1.35,1.36,{shirt:'coach',hair:'long',skin:FAM,face:'smile',adult:true,layer:3});
  // Right: away at América, April 2015. The paper crowd rises to its feet.
  const rows=[B.stand(crowdStrip('rdh-j-crowdA',3.3,1.05,AME,1),2.4,-1.4,{layer:1,tab:false,s:0}),B.stand(crowdStrip('rdh-j-crowdB',2.2,.9,AME,4),1.4,-1.05,{layer:1,tab:false,s:0}),B.stand(crowdStrip('rdh-j-crowdC',1.6,.9,AME,2),3.9,-1.0,{layer:1,tab:false,s:0})];
  const scarves=[rows[0].arm(scarf('rdh-j-sc1',.1,.5,INK.yellow,INK.navy),-.9,.85,{z:-.01}),rows[0].arm(scarf('rdh-j-sc2',.1,.5,INK.yellow,INK.navy),1.0,.85,{z:-.01}),rows[1].arm(scarf('rdh-j-sc3',.1,.5,INK.navy,INK.yellow),.5,.75,{z:-.01})];
  B.stand(S.goal('rdh-j-goal',1.5,.8),4.1,-.3,{layer:2});
  const gk=B.person('rdh-j-gk',4.1,-.05,1.2,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const h2=B.person('rdh-j-h2',1.3,1.0,1.3,{shirt:'navy',...RON,legs:'kick',layer:3});h2.body.add(kitOverlay('rdh-j-h2k',1.3,BLAUGRANA,'#15172b',undefined,INK.white),0,0,{z:.004});
  const tear=h2.body.add(tears('rdh-j-tears',.2,.1),0,1.3*PERSON_SCALE*.715,{z:.012});
  const heart=h2.body.add(S.bubble('rdh-j-heart',.6,.5,'heart'),.55,1.75,{z:-.02});
  const goals=[0,1].map(i=>B.stand(S.icon(`rdh-j-goal${i}`,.3,'ball'),3.3+i*.4,1.75,{layer:3,s:0}));
  const ball=B.stand(S.ball('rdh-j-ball',.12),1.65,1.1,{layer:3,tab:false});
  const fan=B.person('rdh-j-fan',2.6,1.65,1.2,{shirt:'bib',hair:'bun',skin:'#d99a6c',face:'smile',layer:3});
  return (b:Beat)=>{const t=b.t,act=b.action,N=b.narrated;
   // He kept playing: Atlético Mineiro, number 49 for his mother.
   hero.body.s=beat(t,1.8,2.6);lball.dy=.4*Math.abs(Math.sin(Math.max(0,t-2.6)*Math.PI*1.2))*(t>2.6&&t<4.4?1:0);hero.leg!.rot=.6*pulse(t,2.7,3.3)+.6*pulse(t,3.5,4.1);
   n49.s=beat(t,5,5.8);mum.body.s=beat(t,8.4,9.2);mumHeart.visible=t>10;mumHeart.dy=-.5+.5*beat(t,10.1,10.7);
   hero.armR.rot=.12+1.3*beat(t,9.6,10.2)-1.3*beat(t,12,12.6);mum.armL.rot=-.12-.9*pulse(t,10,12.4);mum.armR.rot=.12+1.3*beat(t,9.8,10.4)-1.3*beat(t,12.2,12.8);
   // 2013: the club's first Copa Libertadores.
   pod.s=beat(t,12.2,13);cupJ.dy=.2*pulse(t,13.2,15);
   const w13=beat(t,13.4,14)-beat(t,15,15.6);hero.armL.rot=-.12-2.3*w13;hero.armR.rot+=2.3*w13;
   // April 2015, Querétaro: two goals away at América.
   h2.body.s=Math.max(beat(t,15.6,16.4),smooth(clamp01(act*2.5)));
   const hx=h2.body.x+.35,shoot=(u:number)=>{ball.x=lerp(hx,4.0,u);ball.z=lerp(1.1,-.2,u);ball.dy=.4*Math.sin(u*Math.PI);};
   const g1=beat(t,17,18.2),g2=beat(t,19.2,20.4);ball.x=hx;ball.z=1.1;ball.dy=0;if(t>17&&t<18.6)shoot(g1);if(t>19.2&&t<20.8)shoot(g2);ball.visible=!(t>18.2&&t<18.8)&&!(t>20.4&&t<21);ball.rot=-ball.x*6;
   h2.leg!.rot=-.9*pulse(t,16.7,17.3)-.9*pulse(t,18.9,19.5);
   gk.body.rot=-.7*pulse(t,17.4,18.6)+.7*pulse(t,19.6,20.8);gk.armL.rot=-.12-2*Math.max(pulse(t,17.4,18.6),pulse(t,19.6,20.8));gk.armR.rot=.12+2*Math.max(pulse(t,17.4,18.6),pulse(t,19.6,20.8));
   goals.forEach((g,i)=>{g.s=beat(t,18.2+i*2.2,18.8+i*2.2);});
   // Most fans there supported América, but they stood and applauded (the page action).
   const rise=Math.max(N?beat(t,22.4,24.2):0,act);rows.forEach((r,i)=>{r.s=smooth(clamp01((rise-[0,.15,.3][i])/.6));});
   scarves.forEach((s,i)=>{const on=rows[i<2?0:1].s;s.rot=Math.PI+(.35*wave(t,24.2+i*.2,40,1.2+i*.15)+(N?0:.3*Math.sin(act*Math.PI*3+i)))*on;s.visible=on>.3;});
   const clapUp=N?beat(t,23.4,24):smooth(clamp01((act-.5)/.3));const cl=.2*clapUp*Math.abs(wave(t,24,60,1.8));
   fan.armL.rot=-.12-3.0*clapUp+cl;fan.armR.rot=.12+3.0*clapUp-cl;gk.armL.rot+=-2.4*clapUp*(t>21?1:0);gk.armR.rot+=2.4*clapUp*(t>21?1:0);
   stars.visible=rise>.6;stars.dy=-.8+.8*smooth(clamp01((rise-.6)/.4));
   // He was moved to tears; a heart.
   tear.visible=(t>26.2&&t<33.8)||act>.95;tear.dy=-.02*pulse(t,26.4,27.4);heart.visible=t>27.2||act>.95;heart.dy=-.5+.5*Math.max(beat(t,27.3,27.9),act>.95?1:0);
   // Madrid fans had applauded him once before, in 2005.
   madrid.visible=t>28.8;madrid.dy=-.9+.9*beat(t,28.9,29.8);
   // Share the joy with the people who helped: family waves, confetti.
   bro.body.s=beat(t,33.8,34.6);sis.body.s=beat(t,34.2,35);conf.forEach((c,i)=>{c.visible=t>34.4;c.dy=-1+1.2*beat(t,34.5+i*.3,36+i*.3);});
   const all=beat(t,35,35.6);if(t>35){for(const p of [bro,sis,mum,hero,h2]){p.armL.rot=-.12-2.3*all-.25*wave(t,35.6,38.5,1.5);p.armR.rot=.12+2.3*all+.25*wave(t,35.6,38.5,1.6);}}
   flagL.rot=.12*wave(t,2,38,.7);
   return N?-.7*beat(t,1.8,2.8)+1.4*beat(t,15.4,16.4)-.7*beat(t,33.6,34.6):(act>0?.6:0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={porto,tricks,u17,free,applause,joy};
