/**
 * The six Marta pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/marta/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play all show the same paper state.
 * Printed facts follow lib/books/stories/marta.ts exactly. Hardship is shown gently and symbolically
 * (an empty chair, a passing rain cloud, a closing door, a plaster, a paper bridge back); settings are imagined.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse,wave,clamp01,PAGE_D} from '../popupEngine';

const spec=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key,w,h,paint,...extra});
const Z=(z:number)=>z+PAGE_D/2;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const MSKIN='#a8704a',MHAIR='#2a1d22';
const TERRA='#d9774f',PASTEL=['#f6c1cf','#9fd8cf','#ffd98a','#c7b6ec','#f7b58a','#bfe0a4'];

/* ───────────── shared print + plate helpers ───────────── */
function skyPanel(k:Kit,w:number,h:number,night=false){const p=rect(0,0,w,h);k.fill(p,night?INK.night:INK.sky2);k.dots(p,night?INK.blue:INK.sky,.055,(x,y)=>night?.4-y/h*.25:.75-y/h*.75);
 if(night)for(let i=0;i<16;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.5,.018,i%3?INK.yellow:INK.white);}
function starPath(cx:number,cy:number,R:number,r=R*.42){return poly(Array.from({length:10},(_,i)=>[cx+Math.cos(i*Math.PI/5-Math.PI/2)*(i%2?r:R),cy+Math.sin(i*Math.PI/5-Math.PI/2)*(i%2?r:R)]));}
function pitchPrint(k:Kit,x0:number,x1:number,tone=INK.grass){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.75);for(let i=0;i<8;i++){if(i%2)k.dots(rect(x0,i*PAGE_D/8,x1-x0,PAGE_D/8),INK.leaf,.055,.3);}k.dots(p,INK.leaf,.08,.12);}
function chalk(k:Kit,d:string,w=.03){k.key(d,w,INK.white);}
function dusty(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#ecd29a');k.dots(p,INK.orange,.06,(x,y)=>.1+.08*Math.sin(x*1.7+y*.9));
 for(let i=0;i<26;i++){const x=x0+.2+((i*37)%53)/53*(x1-x0-.4),y=.25+((i*29)%47)/47*(PAGE_D-.5);k.key(`M${x-.05} ${y} L${x-.02} ${y-.08} M${x} ${y} L${x} ${y-.1} M${x+.05} ${y} L${x+.02} ${y-.08}`,.012,'#8a9a3f');}}
function street(k:Kit,x0:number,x1:number,z0:number,z1:number){const p=rect(x0,Z(z0),x1-x0,z1-z0);k.fill(p,INK.stone);k.dots(p,INK.navy,.05,.14);
 for(let r=0;r<Math.round((z1-z0)/.22);r++)for(let i=0;i<Math.round((x1-x0)/.3);i++){const x=x0+.15+i*.3+(r%2)*.15,y=Z(z0)+.12+r*.22;if(x>x1-.1)continue;k.key(ell(x,y,.12,.08),.008,'#a89c80');}
 k.key(`M${x0} ${Z(z0)} L${x1} ${Z(z0)} M${x0} ${Z(z1)} L${x1} ${Z(z1)}`,.02);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
const FANS=[INK.yellow,INK.green,INK.white,INK.blue,INK.yellow,INK.pink,INK.orange];

/* ───────────── Marta's own plates ───────────── */
/** A terrace of north-east Brazilian houses with curly parapets and shutters. doorAt leaves that doorway dark for a hinged door. */
const rowHouses=(key:string,w:number,h:number,cols:string[],doorAt=-1)=>spec(key,w,h,k=>{
 const n=cols.length,bw=w/n;
 for(let i=0;i<n;i++){const x=i*bw,top=h*(.16+((i*5)%3)*.07),c=cols[i];
  const roof=poly([[x+.05,top+.12],[x+bw*.5,top-.04],[x+bw-.05,top+.12]]);k.fill(roof,TERRA);k.hatch(roof,'#a9483a',.03,-.3,.01);
  const par=`M${x} ${h} L${x} ${top+.13} Q${x+bw*.14} ${top+.13} ${x+bw*.22} ${top+.05} Q${x+bw*.5} ${top-.1} ${x+bw*.78} ${top+.05} Q${x+bw*.86} ${top+.13} ${x+bw} ${top+.13} L${x+bw} ${h} Z`;
  k.fill(par,c);k.dots(par,INK.orange,.04,(xx,yy)=>.06+(yy-top)/h*.28);k.key(par,.012);
  k.fill(rect(x,top+.16,bw,.035),INK.white);k.fill(rect(x,h-.07,bw,.07),'#8e6a4c');
  const dw=bw*.28,dh=h*.42,dx=x+bw*.5-dw/2,door=`M${dx} ${h} L${dx} ${h-dh+dw/2} Q${dx+dw/2} ${h-dh-.02} ${dx+dw} ${h-dh+dw/2} L${dx+dw} ${h} Z`;
  k.fill(door,i===doorAt?'#2b2233':[INK.teal,INK.blue,INK.green,INK.red][i%4]);k.key(door,.012);
  if(i!==doorAt){k.key(`M${dx+dw/2} ${h-dh+.04} L${dx+dw/2} ${h}`,.008);k.circle(dx+dw*.62,h-dh*.45,.014,INK.gold);}
  for(const s of [-1,1]){const wx=x+bw*.5+s*bw*.32-bw*.08,wy=h-dh*.95,win=rect(wx,wy,bw*.16,dh*.42);k.fill(win,INK.sky);k.dots(win,INK.blue,.025,.55);k.key(win,.01);
   k.fill(rect(wx-bw*.05,wy,bw*.05,dh*.42),[INK.green,INK.blue,INK.pink,INK.teal][(i+1)%4]);k.fill(rect(wx+bw*.16,wy,bw*.05,dh*.42),[INK.green,INK.blue,INK.pink,INK.teal][(i+1)%4]);}
 }});
const church=(key:string,w:number,h:number)=>spec(key,w,h,k=>{
 const body=rect(w*.08,h*.42,w*.62,h*.58);k.fill(body,INK.white);k.dots(body,INK.sky,.035,.2);k.key(body,.013);
 const gable=`M${w*.06} ${h*.44} Q${w*.39} ${h*.24} ${w*.72} ${h*.44} Z`;k.fill(gable,INK.white);k.key(gable,.013);k.fill(rect(w*.08,h*.43,w*.62,.04),INK.blue);
 const tower=rect(w*.66,h*.12,w*.28,h*.88);k.fill(tower,'#fff3d6');k.dots(tower,INK.orange,.035,.15);k.key(tower,.013);
 const cap=poly([[w*.64,h*.13],[w*.8,0],[w*.96,h*.13]]);k.fill(cap,INK.blue);k.key(cap,.012);
 const bell=`M${w*.73} ${h*.3} L${w*.73} ${h*.2} Q${w*.8} ${h*.14} ${w*.87} ${h*.2} L${w*.87} ${h*.3} Z`;k.fill(bell,INK.navy);k.fill(ell(w*.8,h*.265,.045,.04),INK.gold);
 k.fill(ell(w*.39,h*.52,w*.07,w*.07),INK.yellow);k.key(ell(w*.39,h*.52,w*.07,w*.07),.01);
 const door=`M${w*.3} ${h} L${w*.3} ${h*.76} Q${w*.39} ${h*.66} ${w*.48} ${h*.76} L${w*.48} ${h} Z`;k.fill(door,INK.blue);k.key(door,.012);
 for(const x of [.15,.56]){const win=`M${w*x} ${h*.86} L${w*x} ${h*.7} Q${w*(x+.035)} ${h*.65} ${w*(x+.07)} ${h*.7} L${w*(x+.07)} ${h*.86} Z`;k.fill(win,INK.sky);k.key(win,.01);}
 k.fill(rect(w*.74,h*.5,w*.12,h*.12),INK.sky);k.key(rect(w*.74,h*.5,w*.12,h*.12),.01);k.fill(rect(w*.08,h-.06,w*.86,.06),INK.blue);});
const cactus=(key:string,w:number,h:number,tone='#4f9b62')=>spec(key,w,h,k=>{const cw=w*.26,cx=w/2;
 const col=(x:number,y0:number,y1:number,ww:number)=>`M${x-ww/2} ${y1} L${x-ww/2} ${y0+ww/2} Q${x} ${y0-ww*.2} ${x+ww/2} ${y0+ww/2} L${x+ww/2} ${y1} Z`;
 const armL=`M${cx-cw/2} ${h*.62} L${w*.14} ${h*.62} Q${w*.06} ${h*.6} ${w*.06} ${h*.5} L${w*.06} ${h*.3} Q${w*.14} ${h*.2} ${w*.22} ${h*.3} L${w*.22} ${h*.5} L${cx} ${h*.5} Z`;
 const armR=`M${cx+cw/2} ${h*.5} L${w*.8} ${h*.5} Q${w*.94} ${h*.48} ${w*.94} ${h*.36} L${w*.94} ${h*.14} Q${w*.86} ${h*.04} ${w*.78} ${h*.14} L${w*.78} ${h*.38} L${cx} ${h*.38} Z`;
 for(const p of [armL,armR,col(cx,0,h,cw)]){k.fill(p,tone);k.hatch(p,'#2f6e45',.035,1.57,.01);k.key(p,.012);}
 for(const [x,y] of [[w*.14,h*.24],[w*.86,h*.08],[cx,h*.02]])k.circle(x,y,.028,INK.pink);});
const hen=(key:string,s:number)=>spec(key,s*1.1,s,k=>{const w=s*1.1,b=blob([[w*.15,s*.45],[w*.35,s*.25],[w*.75,s*.3],[w*.95,s*.1],[w,s*.4],[w*.8,s*.78],[w*.3,s*.82]]);k.fill(b,INK.white);k.dots(b,INK.orange,.025,.35);k.key(b,.01);
 k.fill(poly([[w*.18,s*.3],[w*.26,s*.12],[w*.34,s*.28]]),INK.red);k.fill(poly([[w*.06,s*.42],[w*.16,s*.38],[w*.16,s*.46]]),INK.gold);k.circle(w*.24,s*.38,.012,INK.navy,true);
 k.key(`M${w*.45} ${s*.8} L${w*.42} ${s} M${w*.6} ${s*.8} L${w*.62} ${s}`,.012,INK.orange);});
const dog=(key:string,s:number)=>spec(key,s*1.4,s,k=>{const w=s*1.4,b=blob([[w*.2,s*.4],[w*.55,s*.35],[w*.82,s*.18],[w*.98,s*.3],[w*.92,s*.52],[w*.78,s*.6],[w*.62,s*.66],[w*.2,s*.68]]);k.fill(b,'#c98b52');k.dots(b,INK.brown,.03,.3);k.key(b,.011);
 k.fill(poly([[w*.84,s*.2],[w*.9,s*.02],[w*.94,s*.26]]),INK.brown);k.circle(w*.9,s*.3,.014,INK.navy,true);k.key(`M${w*.2} ${s*.45} Q${w*.02} ${s*.3} ${w*.06} ${s*.12}`,.03,'#c98b52');
 for(const x of [.26,.38,.62,.74])k.key(`M${w*x} ${s*.64} L${w*x} ${s}`,.035,'#c98b52');});
const baby=(key:string)=>spec(key,.34,.26,k=>{const b=ell(.17,.14,.16,.11);k.fill(b,INK.white);k.dots(b,INK.pink,.025,.5);k.key(b,.01);k.fill(ell(.26,.1,.06,.06),MSKIN);k.key(ell(.26,.1,.06,.06),.008);k.keyFill(`M.2 .08 Q.26 .02 .32 .08 Q.26 .06 .2 .08 Z`,MHAIR);},{rim:.02});
const stones=(key:string,w:number)=>spec(key,w,.3,k=>{for(const x of [.02,w-.3]){const r=blob([[x,.3],[x+.02,.14],[x+.12,.04],[x+.24,.08],[x+.28,.3]]);k.fill(r,INK.grey);k.dots(r,INK.navy,.03,.3);k.key(r,.012);}k.key(`M.3 .28 L${w-.3} .28`,.02,INK.white);});
const signpost=(key:string,w:number,h:number,text:string,color=INK.white)=>spec(key,w,h,k=>{k.keyFill(rect(w*.46,h*.25,w*.08,h*.75),INK.brown);const b=rect(0,0,w,h*.27);k.fill(b,color);k.dots(b,INK.sky,.03,.2);k.key(b,.013);k.text(text,w/2,h*.19,h*.12,INK.navy,{max:w*.86});});
const footPlate=(key:string)=>spec(key,.22,.2,k=>{k.fill(ell(.11,.1,.09,.08),INK.yellow);k.key(ell(.11,.1,.09,.08),.01);k.fill(ell(.11,.11,.03,.045),INK.navy);for(let i=0;i<4;i++)k.circle(.065+i*.03,.045,.011,INK.navy);},{rim:.018});
const clothesline=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M0 .05 Q${w/2} .2 ${w} .05`,.012);const cs=[INK.pink,INK.yellow,INK.sky,INK.white,INK.green];for(let i=0;i<5;i++){const x=.15+i*(w-.3)/4,y=.05+Math.sin((x/w)*Math.PI)*.15,sh=i%2?poly([[x-.1,y],[x+.1,y],[x+.12,y+.08],[x+.07,y+.08],[x+.07,y+.26],[x-.07,y+.26],[x-.07,y+.08],[x-.12,y+.08]]):rect(x-.08,y,.16,.22);k.fill(sh,cs[i]);k.key(sh,.008);}},{rim:.02});
/** An intercity coach facing right, luggage on the roof. */
const busPlate=(key:string,w:number,h:number)=>spec(key,w,h,k=>{
 k.fill(rect(w*.2,0,w*.22,h*.12),INK.red);k.key(rect(w*.2,0,w*.22,h*.12),.01);k.fill(rect(w*.46,h*.03,w*.16,h*.09),INK.yellow);k.key(rect(w*.46,h*.03,w*.16,h*.09),.01);
 const body=`M${w*.03} ${h*.14} L${w*.84} ${h*.14} Q${w*.97} ${h*.16} ${w} ${h*.46} L${w} ${h*.8} L${w*.02} ${h*.8} Q0 ${h*.8} 0 ${h*.7} L0 ${h*.2} Q0 ${h*.14} ${w*.03} ${h*.14} Z`;
 k.fill(body,INK.white);k.fill(rect(0,h*.52,w,h*.28),INK.blue);k.fill(rect(0,h*.56,w,h*.04),INK.yellow);k.dots(body,INK.sky,.035,.18);k.key(body,.014);
 for(let i=0;i<5;i++){const win=rect(w*(.05+i*.145),h*.22,w*.12,h*.24);k.fill(win,INK.sky2);k.dots(win,INK.blue,.025,.45);k.key(win,.01);}
 const ws=`M${w*.8} ${h*.2} L${w*.88} ${h*.2} Q${w*.96} ${h*.26} ${w*.97} ${h*.46} L${w*.8} ${h*.46} Z`;k.fill(ws,INK.sky);k.key(ws,.01);
 k.fill(rect(w*.8,h*.49,w*.12,h*.06),INK.navy);k.text('RIO',w*.86,h*.54,h*.06,INK.yellow,{max:w*.1});
 k.fill(ell(w*.975,h*.66,w*.018,h*.05),INK.yellow);k.key(rect(w*.72,h*.22,w*.06,h*.56),.01);
 for(const x of [.2,.78]){k.fill(ell(w*x,h*.82,h*.16,h*.16),'#2b2b33');k.fill(ell(w*x,h*.82,h*.07,h*.07),INK.grey);k.key(ell(w*x,h*.82,h*.16,h*.16),.012);}});
const busFace=(key:string)=>spec(key,.13,.15,k=>{k.keyFill(`M.01 .1 Q0 .01 .065 .005 Q.13 .01 .12 .1 L.125 .15 L.005 .15 Z`,MHAIR);k.fill(ell(.065,.075,.042,.05),MSKIN);k.circle(.05,.07,.006,INK.navy,true);k.circle(.08,.07,.006,INK.navy,true);k.key('M.05 .1 Q.065 .11 .08 .1',.005);},{rim:.012});
const hill=(key:string,w:number,h:number,tone=INK.leaf)=>spec(key,w,h,k=>{const p=`M0 ${h} Q${w*.08} ${h*.2} ${w*.45} ${h*.08} Q${w*.9} ${h*.05} ${w} ${h} Z`;k.fill(p,tone);k.dots(p,INK.navy,.04,(x,y)=>.12+y/h*.25);k.key(p,.013);
 for(let i=0;i<4;i++){const x=w*(.18+i*.2),y=h*(.35+(i%2)*.18);k.fill(ell(x,y,.09,.12),INK.green);k.key(ell(x,y,.09,.12),.01);}});
const town=(key:string,w:number,h:number,seed:number)=>spec(key,w,h,k=>{const n=3;for(let i=0;i<n;i++){const bw=w/n*.92,x=i*w/n,top=h*(.3+((i+seed)%3)*.12),b=rect(x,top,bw,h-top);k.fill(b,PASTEL[(i+seed)%PASTEL.length]);k.key(b,.011);
  k.fill(poly([[x-.02,top+.02],[x+bw/2,top-.14],[x+bw+.02,top+.02]]),TERRA);k.key(poly([[x-.02,top+.02],[x+bw/2,top-.14],[x+bw+.02,top+.02]]),.01);k.fill(rect(x+bw*.35,h-.2,bw*.3,.2),INK.navy);k.fill(rect(x+bw*.2,top+.1,bw*.22,.12),INK.sky);}
 if(seed%2){k.fill(rect(w*.44,0,w*.1,h*.35),INK.white);k.key(rect(w*.44,0,w*.1,h*.35),.01);k.fill(poly([[w*.42,.02],[w*.49,-.02],[w*.56,.02]]),INK.blue);}});
const mapCard=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.paper);k.dots(b,INK.sky,.035,.35);k.key(b,.013);
 const land=blob([[w*.22,h*.16],[w*.5,h*.1],[w*.76,h*.2],[w*.95,h*.34],[w*.88,h*.52],[w*.72,h*.68],[w*.54,h*.9],[w*.42,h*.78],[w*.26,h*.58],[w*.1,h*.44],[w*.1,h*.26]]);
 k.fill(land,INK.grass);k.dots(land,INK.leaf,.03,.45);k.key(land,.012);
 const a=[w*.86,h*.38],c=[w*.66,h*.7];k.key(`M${a[0]} ${a[1]} Q${w*.9} ${h*.6} ${c[0]} ${c[1]}`,.02,INK.pink);
 k.circle(a[0],a[1],.035,INK.red);k.circle(c[0],c[1],.035,INK.blue);k.text('DOIS RIACHOS',w*.55,h*.33,h*.075,INK.navy,{max:w*.5});k.text('RIO',w*.5,h*.74,h*.09,INK.navy);k.text('BRAZIL',w*.35,h*.5,h*.1,INK.green);});
const umbrella=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.48,h*.25,w*.04,h*.75),INK.brown);const c=`M0 ${h*.32} Q${w/2} ${-h*.1} ${w} ${h*.32} Z`;k.fill(c,INK.pink);for(let i=0;i<3;i++)k.fill(poly([[w/2,h*.02],[w*(.15+i*.3),h*.32],[w*(.3+i*.3),h*.32]]),INK.yellow);k.key(c,.012);});
const moon=(key:string,r:number)=>spec(key,r*2,r*2,k=>{const p=`M${r*1.3} ${r*.1} A${r} ${r} 0 1 0 ${r*1.3} ${r*1.9} A${r*.8} ${r*.8} 0 1 1 ${r*1.3} ${r*.1} Z`;k.fill(p,'#fff3b8');k.dots(p,INK.yellow,.03,.5);k.key(p,.012);});
const globe=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const cx=w/2,cy=w/2,r=w*.46;
 k.keyFill(poly([[cx-.04,cy+r],[cx+.04,cy+r],[cx+.06,h-.1],[cx-.06,h-.1]]),INK.brown);k.fill(ell(cx,h-.06,w*.28,.06),INK.wood);k.key(ell(cx,h-.06,w*.28,.06),.012);
 k.key(`M${cx-r-.06} ${cy+.1} A${r+.06} ${r+.06} 0 0 0 ${cx+r*.4} ${cy+r+.02}`,.03,INK.gold);
 k.fill(ell(cx,cy,r,r),INK.sky);k.dots(ell(cx,cy,r,r),INK.blue,.035,(x,y)=>.3+(x-cx)/r*.3);
 const lands=[[[.28,.2],[.46,.14],[.5,.3],[.38,.42],[.24,.36]],[[.34,.5],[.48,.5],[.5,.72],[.42,.9],[.36,.7]],[[.58,.16],[.8,.2],[.84,.34],[.66,.4],[.56,.3]],[[.6,.44],[.74,.46],[.72,.66],[.62,.64]]];
 for(const l of lands){const p=blob(l.map(([x,y])=>[x*w,y*w]));k.fill(p,INK.grass);k.dots(p,INK.leaf,.03,.4);k.key(p,.01);}
 k.key(ell(cx,cy,r,r),.014);k.key(`M${cx-r} ${cy} Q${cx} ${cy+.12} ${cx+r} ${cy}`,.008,INK.white);k.circle(cx,cy,.035,INK.gold);});
const arrowBoard=(key:string,w:number,h:number,text:string,dir:1|-1,color:string)=>spec(key,w,h,k=>{const p=dir>0?poly([[0,0],[w*.8,0],[w,h/2],[w*.8,h],[0,h]]):poly([[w*.2,0],[w,0],[w,h],[w*.2,h],[0,h/2]]);k.fill(p,color);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.text(text,dir>0?w*.43:w*.57,h*.68,h*.46,INK.white,{max:w*.7});},{rim:.018});
const pole=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=rect(0,0,w,h);k.fill(p,INK.wood);k.hatch(p,'#8a5238',.03,1.3,.008);k.key(p,.01);k.fill(ell(w/2,.02,w*.8,.04),INK.yellow);});
const suitcases=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const a=rect(0,h*.45,w,h*.55),b=rect(w*.12,h*.08,w*.72,h*.4);for(const [p,c] of [[a,INK.red],[b,INK.teal]] as const){k.fill(p,c);k.key(p,.012);}
 k.key(`M${w*.38} ${h*.08} L${w*.38} 0 L${w*.6} 0 L${w*.6} ${h*.08}`,.02);for(const [x,y,c] of [[.2,.62,INK.yellow],[.6,.75,INK.white],[.3,.24,INK.pink],[.62,.2,INK.yellow]] as const){k.fill(ell(w*x,h*y,.07,.05),c);k.key(ell(w*x,h*y,.07,.05),.008);}
 k.key(`M${w*.08} ${h*.5} L${w*.08} ${h*.96} M${w*.92} ${h*.5} L${w*.92} ${h*.96}`,.02,INK.yellow);});
const stage=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const top=poly([[w*.06,0],[w*.94,0],[w,h*.3],[0,h*.3]]);k.fill(top,INK.gold);k.dots(top,INK.orange,.03,.3);k.key(top,.012);const f=rect(0,h*.3,w,h*.7);k.fill(f,INK.blue);k.dots(f,INK.navy,.035,.3);k.key(f,.012);
 for(let i=0;i<5;i++)k.fill(starPath(w*(.12+i*.19),h*.65,h*.18),INK.yellow);});
const starPlate=(key:string,r:number,label:string,color=INK.yellow)=>spec(key,r*2,r*2+.16,k=>{const p=starPath(r,r,r,r*.45);k.fill(p,color);k.dots(p,INK.orange,.03,(x,y)=>.15+(x+y)/(r*4)*.5);k.key(p,.013);k.fill(ell(r*.8,r*.7,r*.12,r*.08),INK.white,.8);
 const t=rect(r-.24,r*2-.02,.48,.17);k.fill(t,INK.navy);k.text(label,r,r*2+.115,.12,INK.yellow,{max:.42});},{rim:.022});
const iconCard=(key:string,w:number,h:number,label:string,kind:'cone'|'bottle'|'board'|'team'|'hammock'|'food'|'bed',color:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.03,.2);k.key(b,.013);
 const c=w/2,m=h*.4;k.fill(ell(c,m,w*.36,h*.3),INK.white);k.key(ell(c,m,w*.36,h*.3),.01);
 if(kind==='cone'){k.fill(poly([[c,m-.17],[c+.1,m+.12],[c-.1,m+.12]]),INK.orange);k.fill(rect(c-.14,m+.1,.28,.05),INK.orange);k.fill(rect(c-.05,m-.04,.1,.05),INK.white);k.key(poly([[c,m-.17],[c+.1,m+.12],[c-.1,m+.12]]),.01);}
 else if(kind==='bottle'){const p=`M${c-.06} ${m+.16} L${c-.06} ${m-.06} Q${c-.06} ${m-.12} ${c-.02} ${m-.13} L${c-.02} ${m-.18} L${c+.02} ${m-.18} L${c+.02} ${m-.13} Q${c+.06} ${m-.12} ${c+.06} ${m-.06} L${c+.06} ${m+.16} Z`;k.fill(p,INK.sky);k.key(p,.01);k.fill(rect(c-.06,m,.12,.06),INK.blue);}
 else if(kind==='board'){const p=rect(c-.17,m-.12,.34,.24);k.fill(p,INK.green);k.key(p,.01);k.key(`M${c-.1} ${m+.05} Q${c} ${m-.12} ${c+.1} ${m}`,.012,INK.white);k.key(`M${c+.06} ${m-.04} L${c+.1} ${m} L${c+.05} ${m+.02}`,.012,INK.white);k.circle(c-.1,m+.05,.02,INK.yellow);}
 else if(kind==='team'){for(const [dx,col] of [[-.08,INK.yellow],[.08,INK.green]] as const){k.fill(ell(c+dx,m-.07,.045,.045),MSKIN);k.fill(`M${c+dx-.07} ${m+.14} Q${c+dx} ${m-.04} ${c+dx+.07} ${m+.14} Z`,col);k.key(`M${c+dx-.07} ${m+.14} Q${c+dx} ${m-.04} ${c+dx+.07} ${m+.14} Z`,.01);}}
 else if(kind==='hammock'){k.key(`M${c-.2} ${m-.1} L${c-.2} ${m+.15} M${c+.2} ${m-.1} L${c+.2} ${m+.15}`,.02,INK.brown);const hm=`M${c-.2} ${m-.06} Q${c} ${m+.18} ${c+.2} ${m-.06} Q${c} ${m+.06} ${c-.2} ${m-.06} Z`;k.fill(hm,INK.pink);k.key(hm,.01);}
 else if(kind==='food'){k.fill(ell(c,m+.05,.18,.08),INK.white);k.key(ell(c,m+.05,.18,.08),.01);k.fill(ell(c-.06,m,.07,.05),'#fff5dc');k.fill(ell(c+.05,m,.07,.05),INK.brown);k.circle(c+.02,m-.08,.04,INK.orange);k.circle(c-.08,m-.07,.03,INK.red);k.key(`M${c+.02} ${m-.12} L${c+.04} ${m-.15}`,.01,INK.green);}
 else {const bd=rect(c-.2,m-.02,.4,.12);k.fill(bd,INK.blue);k.key(bd,.01);k.fill(rect(c-.2,m-.08,.12,.07),INK.white);k.key(`M${c-.2} ${m-.12} L${c-.2} ${m+.16} M${c+.2} ${m+.02} L${c+.2} ${m+.16}`,.02,INK.brown);k.text('z',c+.1,m-.1,.1,INK.navy);}
 k.text(label,c,h*.9,h*.15,INK.navy,{max:w*.86});},{rim:.02});
const tallyBoard=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.12,h*.8,w*.05,h*.2),INK.brown);k.keyFill(rect(w*.83,h*.8,w*.05,h*.2),INK.brown);
 const b=rect(0,0,w,h*.84);k.fill(b,'#2f5f4a');k.dots(b,INK.navy,.04,.3);k.key(b,.018,'#1a2447');k.fill(rect(0,0,w,h*.16),INK.yellow);k.text('WORLD CUP GOALS',w/2,h*.12,h*.09,INK.navy,{max:w*.84});
 for(let i=0;i<17;i++){const [x,y]=goalSlot(i);k.key(ell(w/2+x,h-y,.13,.13),.01,'#9fc7b0');}});
/** Board-local positions (x from centre, y up from the base) of the 17 goal markers. */
function goalSlot(i:number):[number,number]{const row=i<6?0:i<12?1:2,j=row<2?i-row*6:i-12,cols=row<2?6:5;return [(j-(cols-1)/2)*.36,1.42-row*.38];}
const markerPlate=(key:string,n:number)=>spec(key,.28,.28,k=>{k.fill(ell(.14,.14,.13,.13),INK.white);k.key(ell(.14,.14,.13,.13),.012);k.fill(ell(.14,.14,.1,.1),INK.yellow);k.text(String(n),.14,.19,.13,INK.navy);},{rim:.016});
const pennant=(key:string,n:number,color:string)=>spec(key,.34,.46,k=>{const p=poly([[0,0],[.34,0],[.17,.46]]);k.fill(p,color);k.dots(p,INK.navy,.03,.2);k.key(p,.011);k.text(String(n),.17,.2,.15,INK.navy);},{rim:.016});
const podium=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const t=rect(0,0,w,h);k.fill(t,INK.white);k.dots(t,INK.sky,.03,.25);k.key(t,.013);k.fill(rect(0,0,w,h*.2),INK.gold);k.text('1',w/2,h*.85,h*.55,INK.blue);});
const tvSet=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M${w*.46} ${h*.16} L${w*.3} 0 M${w*.54} ${h*.16} L${w*.72} .02`,.015);
 const cab=rect(0,h*.14,w,h*.72);k.fill(cab,INK.wood);k.hatch(cab,'#8a5238',.04,.1,.008);k.key(cab,.014);
 const scr=rect(w*.08,h*.22,w*.68,h*.56);k.fill(scr,INK.grass);k.dots(scr,INK.leaf,.03,.4);k.key(`M${w*.42} ${h*.22} L${w*.42} ${h*.78}`,.01,INK.white);k.key(ell(w*.42,h*.5,.12,.12),.01,INK.white);
 for(const [x,y,c,pony] of [[.2,.4,INK.yellow,1],[.32,.62,INK.yellow,1],[.55,.42,INK.blue,1],[.64,.64,INK.blue,0],[.48,.56,INK.yellow,1]] as const){k.fill(rect(w*x-.03,h*y,.06,.08),c);k.circle(w*x,h*y-.02,.025,MSKIN);if(pony)k.key(`M${w*x+.02} ${h*y-.03} L${w*x+.05} ${h*y}`,.012,MHAIR);}
 k.circle(w*.44,h*.7,.022,INK.white);k.key(scr,.012);
 for(let i=0;i<2;i++){k.fill(ell(w*.88,h*(.34+i*.18),.05,.05),INK.gold);k.key(ell(w*.88,h*(.34+i*.18),.05,.05),.01);}
 k.keyFill(rect(w*.1,h*.86,w*.06,h*.14),INK.brown);k.keyFill(rect(w*.84,h*.86,w*.06,h*.14),INK.brown);});
const tvOff=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const s=rect(0,0,w,h);k.fill(s,'#3a4350');k.dots(s,INK.navy,.03,.5);k.fill(poly([[w*.1,h*.1],[w*.3,h*.1],[w*.12,h*.5]]),INK.white,.35);k.key(s,.012);},{rim:.012});
const building=(key:string,w:number,h:number,label:string,color:string)=>spec(key,w,h,k=>{const b=rect(0,h*.28,w,h*.72);k.fill(b,color);k.dots(b,INK.orange,.035,.15);k.key(b,.013);
 const roof=poly([[-.02,h*.3],[w/2,h*.04],[w+.02,h*.3]]);k.fill(roof,TERRA);k.key(roof,.012);k.fill(ell(w/2,h*.2,.09,.09),INK.white);k.key(ell(w/2,h*.2,.09,.09),.01);k.key(`M${w/2} ${h*.2} L${w/2} ${h*.15} M${w/2} ${h*.2} L${w/2+.05} ${h*.2}`,.01);
 k.fill(rect(w*.1,h*.36,w*.8,h*.14),INK.white);k.text(label,w/2,h*.47,h*.1,INK.navy,{max:w*.74});
 for(let i=0;i<3;i++){const win=rect(w*(.1+i*.3),h*.58,w*.2,h*.16);k.fill(win,INK.sky);k.key(win,.01);}k.fill(rect(w*.42,h*.8,w*.16,h*.2),INK.navy);});
const ballBag=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const [x,y] of [[.3,.55],[.62,.5],[.45,.3],[.46,.72]] as const){k.fill(ell(w*x,h*y,w*.2,w*.2),INK.white);k.key(ell(w*x,h*y,w*.2,w*.2),.01);k.keyFill(ell(w*x,h*y,w*.06,w*.06));}
 const net=`M${w*.08} ${h*.2} Q${w*.5} ${h*.05} ${w*.92} ${h*.2} L${w*.8} ${h} L${w*.2} ${h} Z`;k.hatch(net,INK.navy,.05,.8,.006);k.hatch(net,INK.navy,.05,-.8,.006);k.key(net,.01);k.key(`M${w*.5} ${h*.1} L${w*.5} 0`,.015);});
const kerb=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=rect(0,h*.35,w,h*.65);k.fill(p,'#e6b27a');k.dots(p,INK.orange,.03,.3);k.key(p,.012);for(let i=0;i<Math.round(w/.3);i++)k.key(`M${i*.3} ${h*.35} L${i*.3} ${h}`,.008);
 for(let i=0;i<Math.round(w/.42);i++){const x=.2+i*.42;k.fill(ell(x,h*.3,.1,.12),i%3?INK.leaf:INK.green);k.key(ell(x,h*.3,.1,.12),.008);k.circle(x,h*.22,.025,i%2?INK.pink:INK.yellow);}});

const stall=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const x of [.05,w-.1])k.keyFill(rect(x,h*.2,.05,h*.8),INK.brown);
 const aw=`M0 0 L${w} 0 L${w} ${h*.2} `+Array.from({length:6},(_,i)=>{const x1=w-(i+.5)*w/6,x2=w-(i+1)*w/6;return `Q${x1} ${h*.32} ${x2} ${h*.2} `;}).join('')+'Z';
 k.fill(aw,INK.white);for(let i=0;i<6;i+=2)k.fill(rect(i*w/6,0,w/6,h*.2),INK.pink);k.key(aw,.012);
 const tb=rect(0,h*.6,w,h*.1);k.fill(tb,INK.wood);k.key(tb,.012);const cr=rect(w*.06,h*.7,w*.88,h*.3);k.fill(cr,'#cf9b62');k.hatch(cr,'#8a5238',.05,0,.01);k.key(cr,.012);
 for(let i=0;i<7;i++)k.circle(w*(.12+i*.05),h*.55,.045,INK.orange);for(let i=0;i<5;i++)k.circle(w*(.15+i*.05),h*.48,.045,INK.orange);
 const wm=`M${w*.52} ${h*.6} A${w*.12} ${w*.12} 0 0 1 ${w*.76} ${h*.6} Z`;k.fill(wm,INK.red);k.key(wm,.01);k.key(`M${w*.52} ${h*.6} A${w*.12} ${w*.12} 0 0 1 ${w*.76} ${h*.6}`,.025,INK.green);
 for(let i=0;i<3;i++){const x=w*(.8+i*.05);k.key(`M${x} ${h*.44} Q${x+.06} ${h*.52} ${x+.02} ${h*.6}`,.035,INK.yellow);}});
const cornerFlag=(key:string,h:number)=>spec(key,.36,h,k=>{k.keyFill(rect(.02,0,.035,h),INK.white);k.key(rect(.02,0,.035,h),.008);const f=poly([[.055,.02],[.36,.12],[.055,.24]]);k.fill(f,INK.yellow);k.dots(f,INK.orange,.03,.3);k.key(f,.01);});
const woodDoor=(key:string,w:number,h:number,right=false)=>spec(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.wood);k.hatch(d,'#8a5238',.035,1.57,.008);k.key(d,.012);k.key(rect(w*.12,h*.1,w*.76,h*.8),.01,'#8a5238');k.circle(right?w*.14:w*.86,h*.5,.025,INK.gold);},{rim:.014});
const coverDoor=(key:string,w:number,h:number,num:string,label:string)=>spec(key,w,h,k=>{const c=rect(0,0,w,h);k.fill(c,INK.blue);k.dots(c,INK.navy,.04,.3);k.key(c,.014);k.text(num,w/2,h*.72,h*.62,INK.yellow);k.text(label,w/2,h*.92,h*.12,INK.white,{max:w*.8});},{rim:.018});

/* ───────────── hardship-story plates ───────────── */
/** One leaf of a slatted wooden garden gate (pointed pickets, two rails). */
const gateLeaf=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const n=4,sw=w/n;
 for(let i=0;i<n;i++){const x=i*sw+sw*.1,p=poly([[x,h],[x,h*.16],[x+sw*.4,0],[x+sw*.8,h*.16],[x+sw*.8,h]]);k.fill(p,i%2?INK.wood:'#c98b5e');k.hatch(p,'#8a5238',.03,1.57,.006);k.key(p,.01);}
 for(const y of [.32,.72]){const r=rect(0,h*y,w,h*.1);k.fill(r,INK.teal);k.key(r,.01);}k.key(`M0 ${h*.8} L${w} ${h*.34}`,.03,INK.teal);});
const gatePosts=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const x of [0,w-w*.1]){const p=rect(x,h*.08,w*.1,h*.92);k.fill(p,INK.white);k.dots(p,INK.sky,.03,.3);k.key(p,.012);k.fill(ell(x+w*.05,h*.07,w*.07,w*.07),INK.yellow);k.key(ell(x+w*.05,h*.07,w*.07,w*.07),.01);}
 for(let i=0;i<5;i++)k.circle(w*(.14+i*.18),h*.99,.035,i%2?INK.pink:INK.yellow);});
/** An empty wooden chair: the gentle sign of someone who is not there. */
const chair=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const back=rect(w*.12,0,w*.76,h*.46);k.fill(back,INK.wood);k.hatch(back,'#8a5238',.03,0,.006);k.key(back,.012);
 for(let i=1;i<4;i++)k.key(`M${w*(.12+i*.19)} ${h*.06} L${w*(.12+i*.19)} ${h*.42}`,.01,'#8a5238');
 const seat=rect(0,h*.46,w,h*.12);k.fill(seat,'#c98b5e');k.key(seat,.012);for(const x of [.06,.84])k.keyFill(rect(w*x,h*.58,w*.1,h*.42),INK.brown);});
/** A grey rain cloud that can pass over a page and clear again. */
const rainCloud=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const c=blob([[w*.05,h*.8],[w*.1,h*.45],[w*.3,h*.3],[w*.42,h*.08],[w*.66,h*.12],[w*.78,h*.36],[w*.95,h*.46],[w*.96,h*.8]]);k.fill(c,'#9aa3b5');k.dots(c,INK.navy,.035,.35);k.key(c,.013);});
const rain=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(let i=0;i<14;i++){const x=w*(((i*.37)%1)*.9+.05),y=h*((i*.61)%1)*.8;k.key(`M${x} ${y} L${x-.04} ${y+.16}`,.022,INK.blue);}},{rim:.01,grain:.5});
/** A thought bubble with a little house in it: missing home. */
const homeBubble=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=`M${w*.12} ${h*.05} L${w*.88} ${h*.05} Q${w} ${h*.05} ${w} ${h*.2} L${w} ${h*.6} Q${w} ${h*.75} ${w*.88} ${h*.75} L${w*.42} ${h*.75} L${w*.2} ${h} L${w*.26} ${h*.75} L${w*.12} ${h*.75} Q0 ${h*.75} 0 ${h*.6} L0 ${h*.2} Q0 ${h*.05} ${w*.12} ${h*.05} Z`;k.fill(p,INK.white);k.key(p,.013);
 const cx=w/2,b=rect(cx-w*.16,h*.32,w*.32,h*.3);k.fill(b,PASTEL[0]);k.key(b,.01);const r=poly([[cx-w*.22,h*.34],[cx,h*.14],[cx+w*.22,h*.34]]);k.fill(r,TERRA);k.key(r,.01);k.fill(rect(cx-w*.04,h*.46,w*.08,h*.16),INK.teal);});
/** The people she loves, carried in a heart-shaped bubble: four small family faces. */
const familyBubble=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const hp=`M${w/2} ${h*.95} C${w*.02} ${h*.62} ${w*.02} ${h*.1} ${w*.28} ${h*.08} C${w*.4} ${h*.07} ${w*.47} ${h*.16} ${w/2} ${h*.24} C${w*.53} ${h*.16} ${w*.6} ${h*.07} ${w*.72} ${h*.08} C${w*.98} ${h*.1} ${w*.98} ${h*.62} ${w/2} ${h*.95} Z`;
 k.fill(hp,INK.pink);k.dots(hp,INK.red,.03,.3);k.key(hp,.013);for(const [x,y,r,lg] of [[.34,.42,.07,1],[.52,.38,.055,0],[.66,.46,.05,0],[.48,.62,.05,1]] as const){k.fill(ell(w*x,h*y,w*r,w*r),MSKIN);k.key(ell(w*x,h*y,w*r,w*r),.008);k.keyFill(`M${w*(x-r)} ${h*y} Q${w*x} ${h*y-w*r*1.5} ${w*(x+r)} ${h*y} Q${w*x} ${h*y-w*r*.8} ${w*(x-r)} ${h*y} Z`,MHAIR);if(lg)k.key(`M${w*(x+r*.8)} ${h*y} L${w*(x+r)} ${h*y+w*r*1.3}`,.012,MHAIR);}},{rim:.02});
/** A red Swedish wooden house with white corners and snow on the roof. */
const redHouse=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(w*.06,h*.36,w*.88,h*.64);k.fill(b,'#b8483e');k.hatch(b,'#8b2f2a',.04,0,.008);k.key(b,.013);
 const roof=poly([[0,h*.4],[w/2,h*.04],[w,h*.4]]);k.fill(roof,INK.navy);k.key(roof,.012);const snow=`M${w*.02} ${h*.38} L${w/2} ${h*.04} L${w*.98} ${h*.38} Q${w*.8} ${h*.3} ${w*.7} ${h*.34} Q${w*.5} ${h*.2} ${w*.3} ${h*.34} Q${w*.15} ${h*.3} ${w*.02} ${h*.38} Z`;k.fill(snow,INK.white);k.key(snow,.01);
 for(const x of [.06,.88])k.fill(rect(w*x,h*.36,w*.06,h*.64),INK.white);for(const x of [.18,.62]){const wn=rect(w*x,h*.5,w*.2,h*.18);k.fill(wn,INK.yellow);k.key(wn,.01);k.key(`M${w*(x+.1)} ${h*.5} L${w*(x+.1)} ${h*.68}`,.008);}
 k.fill(rect(w*.42,h*.74,w*.16,h*.26),INK.navy);k.key(rect(w*.42,h*.74,w*.16,h*.26),.01);});
/** A big door frame. Its opening shows a painted Umeå pitch in the snow, revealed when the door swings open. */
const doorFrame=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const ox=w*.13,oy=h*.14,ow=w*.74,oh=h*.8;
 const view=rect(ox,oy,ow,oh);k.fill(view,INK.sky2);k.dots(view,INK.sky,.035,.4);const snow=`M${ox} ${oy+oh*.45} Q${ox+ow*.5} ${oy+oh*.35} ${ox+ow} ${oy+oh*.45} L${ox+ow} ${oy+oh} L${ox} ${oy+oh} Z`;k.fill(snow,INK.white);k.dots(snow,INK.sky,.03,.25);
 for(const x of [.1,.3,.8])k.fill(poly([[ox+ow*x-.1,oy+oh*.47],[ox+ow*x,oy+oh*.2],[ox+ow*x+.1,oy+oh*.47]]),INK.green);
 const pitch=poly([[ox+ow*.08,oy+oh*.98],[ox+ow*.2,oy+oh*.56],[ox+ow*.8,oy+oh*.56],[ox+ow*.92,oy+oh*.98]]);k.fill(pitch,INK.grass);k.dots(pitch,INK.leaf,.03,.3);k.key(pitch,.012,INK.white);k.key(`M${ox+ow*.14} ${oy+oh*.77} L${ox+ow*.86} ${oy+oh*.77}`,.01,INK.white);
 k.fill(rect(ox+ow*.42,oy+oh*.52,ow*.16,oh*.06),INK.white);for(let i=0;i<14;i++)k.circle(ox+ow*(((i*37)%29)/29),oy+oh*(((i*53)%31)/31)*.5,.018,INK.white);
 const fr=`M0 ${h} L0 ${h*.1} Q${w/2} ${-h*.04} ${w} ${h*.1} L${w} ${h} L${ox+ow} ${h} L${ox+ow} ${oy} L${ox} ${oy} L${ox} ${h} Z`;k.fill(fr,INK.yellow);k.dots(fr,INK.orange,.03,.3);k.key(fr,.014);k.key(view,.012);
 k.fill(rect(w*.3,h*.02,w*.4,h*.09),INK.blue);k.text('SWEDEN',w/2,h*.095,h*.06,INK.yellow,{max:w*.36});});
const swedenDoor=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.blue);k.dots(d,INK.navy,.035,.3);k.key(d,.014);k.fill(rect(w*.3,0,w*.14,h),INK.yellow);k.fill(rect(0,h*.38,w,h*.12),INK.yellow);
 k.key(rect(w*.08,h*.06,w*.84,h*.88),.01,INK.navy);k.circle(w*.86,h*.56,.03,INK.gold);k.key(ell(w*.86,h*.56,.03,.03),.008);},{rim:.016});
const snowPrint=(k:Kit,x0:number,x1:number)=>{const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#eef3f4');k.dots(p,INK.sky,.06,(x,y)=>.18+.12*Math.sin(x*1.1+y*.8));for(let i=0;i<30;i++)k.circle(x0+.2+((i*37)%53)/53*(x1-x0-.4),.2+((i*29)%47)/47*(PAGE_D-.4),.02,INK.white);};
/** A silver medal card on a ribbon, for the finals that were lost. */
const silverCard=(key:string,year:string,label:string)=>spec(key,.66,.9,k=>{const rib=poly([[.18,0],[.3,0],[.36,.36],[.3,.4]]),rib2=poly([[.48,0],[.36,0],[.3,.36],[.36,.4]]);k.fill(rib,INK.blue);k.fill(rib2,INK.green);k.key(rib,.008);k.key(rib2,.008);
 k.fill(ell(.33,.56,.2,.2),'#c9ced6');k.dots(ell(.33,.56,.2,.2),INK.navy,.025,(x,y)=>.1+(x+y)*.25);k.key(ell(.33,.56,.2,.2),.012);k.key(ell(.33,.56,.14,.14),.008,'#8e96a3');k.text(year,.33,.6,.1,INK.navy,{max:.26});
 const t=rect(.02,.78,.62,.12);k.fill(t,INK.navy);k.text(label,.33,.87,.08,INK.white,{max:.56});},{rim:.018});
const medalBoard=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.05,h*.2),INK.brown);k.keyFill(rect(w*.85,h*.8,w*.05,h*.2),INK.brown);
 const b=rect(0,0,w,h*.84);k.fill(b,'#39507f');k.dots(b,INK.navy,.04,.3);k.key(b,.016);k.fill(rect(0,0,w,h*.17),INK.white);k.text('SO CLOSE',w/2,h*.13,h*.11,INK.navy,{max:w*.8});
 for(let i=0;i<3;i++)k.circle(w*(.2+i*.3),h*.24,.03,INK.gold);});
/** The pedestal hiding what the 2007 World Cup also gave her, under the lift-up silver medal. */
const medalHolder=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,h*.12,w,h*.88);k.fill(b,INK.white);k.dots(b,INK.sky,.03,.25);k.key(b,.014);k.fill(rect(0,h*.12,w,h*.1),INK.gold);
 k.text('GOLDEN BALL · GOLDEN BOOT',w/2,h*.92,h*.075,INK.navy,{max:w*.9});k.text('7 GOALS',w/2,h*.8,h*.1,INK.pink,{max:w*.6});});
const silverFlap=(key:string,r:number)=>spec(key,r*2,r*2+.18,k=>{const rib=rect(r*.7,0,r*.6,.22);k.fill(rib,INK.blue);k.fill(rect(r*.95,0,r*.1,.22),INK.yellow);k.key(rib,.01);
 const c=ell(r,r+.16,r*.96,r*.96);k.fill(c,'#c9ced6');k.dots(c,INK.navy,.03,(x,y)=>.12+(x+y)/(r*4)*.4);k.key(c,.016);k.key(ell(r,r+.16,r*.72,r*.72),.012,'#8e96a3');k.text('SILVER',r,r+.24,r*.26,INK.navy,{max:r*1.2});k.fill(ell(r*.62,r*.64,r*.14,r*.08),INK.white,.8);},{rim:.022});
const bootPlate=(key:string,s:number)=>spec(key,s*1.3,s,k=>{const w=s*1.3,p=`M${w*.12} ${s*.1} L${w*.44} ${s*.1} L${w*.5} ${s*.5} Q${w*.92} ${s*.52} ${w*.96} ${s*.76} L${w*.96} ${s*.86} L${w*.08} ${s*.86} Z`;k.fill(p,INK.gold);k.dots(p,INK.orange,.025,.35);k.key(p,.013);
 for(let i=0;i<4;i++)k.fill(rect(w*(.18+i*.2),s*.86,w*.07,s*.1),INK.navy);k.key(`M${w*.2} ${s*.3} L${w*.4} ${s*.3} M${w*.2} ${s*.44} L${w*.42} ${s*.44}`,.01,'#9b6a14');});
/** A small sticking plaster for the knee: no injury is drawn, only the care. */
const plaster=(key:string)=>spec(key,.2,.1,k=>{const p=rect(0,0,.2,.1);k.fill(p,'#f5d7b5');k.key(p,.008);k.fill(rect(.07,.015,.06,.07),INK.white);for(let i=0;i<3;i++)k.circle(.09+i*.02,.05,.004,'#c9a27e');},{rim:.01});
const calendar=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.12,h*.84,w*.05,h*.16),INK.brown);k.keyFill(rect(w*.83,h*.84,w*.05,h*.16),INK.brown);
 const b=rect(0,h*.06,w,h*.8);k.fill(b,INK.white);k.dots(b,INK.sky,.03,.2);k.key(b,.015);k.fill(rect(0,h*.06,w,h*.16),INK.red);k.text('MANY MONTHS',w/2,h*.19,h*.1,INK.white,{max:w*.8});
 for(const x of [.25,.75])k.key(`M${w*x} 0 L${w*x} ${h*.12}`,.03,INK.navy);
 for(let r=0;r<3;r++)for(let c=0;c<6;c++){const cell=rect(w*(.06+c*.148),h*(.28+r*.18),w*.13,h*.15);k.fill(cell,r%2?'#f8efdc':'#eef6f4');k.key(cell,.006);}});
const tickMark=(key:string)=>spec(key,.14,.12,k=>{k.key('M.02 .06 L.055 .1 L.12 .02',.028,INK.green);},{rim:.012});
/** One plank of the paper bridge back, with its year printed on top. */
const plank=(key:string,w:number,h:number,label:string,color:string)=>spec(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,'#cf9b62');for(let i=1;i<6;i++)k.key(`M0 ${i*h/6} L${w} ${i*h/6}`,.01,'#8a5238');k.hatch(d,'#8a5238',.03,.1,.006);k.key(d,.014);
 const t=rect(w*.14,h*.34,w*.72,h*.32);k.fill(t,color);k.key(t,.012);k.text(label,w/2,h*.6,h*.22,INK.white,{max:w*.62});},{rim:.018});
const water=(k:Kit,x0:number,x1:number,z0:number,z1:number)=>{const p=rect(x0,Z(z0),x1-x0,z1-z0);k.fill(p,INK.sky);k.dots(p,INK.blue,.05,.4);for(let i=0;i<8;i++){const x=x0+.15+((i*37)%41)/41*(x1-x0-.3),y=Z(z0)+.15+((i*29)%31)/31*(z1-z0-.3);k.key(`M${x} ${y} q.08 -.05 .16 0 t.16 0`,.012,INK.white);}};
/** A television camera on a tripod, pointing at Marta. */
const tvCamera=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M${w*.5} ${h*.45} L${w*.12} ${h} M${w*.5} ${h*.45} L${w*.88} ${h} M${w*.5} ${h*.45} L${w*.5} ${h}`,.03,INK.navy);
 const body=rect(w*.14,h*.12,w*.56,h*.3);k.fill(body,'#3a4350');k.dots(body,INK.navy,.03,.4);k.key(body,.013);const lens=poly([[w*.7,h*.16],[w*.98,h*.08],[w*.98,h*.46],[w*.7,h*.38]]);k.fill(lens,'#2b2b33');k.key(lens,.012);
 k.fill(ell(w*.98,h*.27,w*.03,h*.14),INK.sky);k.circle(w*.22,h*.18,.03,INK.red);k.fill(rect(w*.26,h*.02,w*.3,h*.1),'#3a4350');k.key(rect(w*.26,h*.02,w*.3,h*.1),.01);});
const microphone=(key:string)=>spec(key,.12,.34,k=>{k.fill(ell(.06,.06,.055,.055),'#3a4350');k.key(ell(.06,.06,.055,.055),.01);k.keyFill(rect(.04,.1,.04,.24),INK.navy);k.fill(rect(.02,.12,.08,.06),INK.red);},{rim:.012});
const snowfall=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(let i=0;i<22;i++){const x=w*(((i*.37)%1)),y=h*((i*.61)%1);k.circle(x,y,.03,INK.white);k.key(ell(x,y,.03,.03),.006,INK.sky);}},{rim:.01,grain:.5});

/** Page title + subtitle, kept near the gutter so a phone framing both pages never clips them. */
function titles(k:Kit,side:-1|1,title:string,sub:string,color:string,subColor:string=INK.navy){const cx=side*1.9;k.text(title,cx,Z(2.2),.44,color,{max:2.9});k.text(sub,cx,Z(2.5),.15,subColor,{weight:800,max:2.9});}
/** Visible when narrated from its cue, or as soon as the reader starts the page action. */
const shown=(b:Beat,narr:number)=>b.narrated?Math.max(narr,beat(b.action,0,.12)):1;
/** Narrated value, or the resting value when the page is posed without narration. */
const nv=(b:Beat,narr:number,rest:number)=>b.narrated?narr:rest;

/* ───────────── 1 · A girl in the boys' game (village) ───────────── */
const village:SpreadDef={id:'village',rest:24,
 left:k=>{dusty(k,-5,0);street(k,-5,0,.55,1.75);footprints(k,-4.2,Z(1.5),-.6,Z(.95),10,INK.brown);
  titles(k,-1,'DOIS RIACHOS','NORTH-EAST BRAZIL · BORN 1986',INK.blue);},
 right:k=>{dusty(k,0,5);street(k,0,5,-1.4,1.75);
  chalk(k,`M.5 ${Z(-1.05)} L4.7 ${Z(-1.05)}`,.025);chalk(k,`M4.7 ${Z(-1.05)} L4.7 ${Z(1.6)}`,.025);
  footprints(k,4.3,Z(1.6),3.0,Z(.62),6);
  titles(k,1,'THE STREET GAME','PLAYING WITH THE BOYS',INK.pink);},
 build:B=>{
  const bd=B.vfold(
   {key:'marta-v-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 3 L0 1.75 Q1 1.35 2.1 1.62 Q3.3 1.9 4.5 1.5 L4.5 3 Z`;k.fill(hills,'#d9ad62');k.dots(hills,INK.orange,.05,.3);
    for(let i=0;i<8;i++){const x=.1+i*.55,top=1.72+((i*3)%4)*.06,b=rect(x,top,.5,2.6-top);k.fill(b,PASTEL[i%6]);k.key(b,.011);k.fill(poly([[x-.02,top],[x+.25,top-.14],[x+.52,top]]),TERRA);k.fill(rect(x+.18,2.3,.14,.3),INK.navy);k.fill(rect(x+.06,top+.12,.12,.12),INK.sky);}
    k.fill(rect(0,2.6,4.5,.4),'#e9cf95');k.dots(rect(0,2.6,4.5,.4),INK.orange,.05,.2);}},
   {key:'marta-v-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 1.6 Q1.4 1.2 2.6 1.55 Q3.7 1.85 4.5 1.35 L4.5 3 L0 3 Z`;k.fill(hills,'#c9a45d');k.dots(hills,INK.orange,.05,.28);
    for(const [x,s] of [[.6,.5],[3.4,.6],[4.1,.4]] as const){k.key(`M${x} 1.8 L${x} ${1.8-s} M${x} ${1.6} L${x-.12} ${1.6} L${x-.12} ${1.4} M${x} ${1.55} L${x+.12} ${1.55} L${x+.12} ${1.35}`,.05,'#4f7f52');}
    for(let i=0;i<7;i++){const x=.2+i*.62,top=1.62+((i*5)%3)*.1,b=rect(x,top,.56,2.6-top);k.fill(b,PASTEL[(i+3)%6]);k.key(b,.011);k.fill(poly([[x-.02,top],[x+.28,top-.14],[x+.58,top]]),TERRA);k.fill(rect(x+.2,2.28,.15,.32),INK.teal);k.fill(rect(x+.06,top+.12,.12,.12),INK.sky);}
    k.fill(rect(0,2.6,4.5,.4),INK.stone);k.dots(rect(0,2.6,4.5,.4),INK.navy,.05,.15);}},
   -3.05,1.22);
  const sunP=bd.add(S.sun('marta-v-sun',.36),'L',3.4,1.3,{out:.015}),cloudR=bd.add(S.cloud('marta-v-cloud2',.9,.42),'R',2.6,2.5);
  const grey=bd.add(rainCloud('marta-v-grey',1.3,.6),'L',2.6,2.25,{out:.03}),drops=bd.add(rain('marta-v-rain',1.1,.6),'L',2.55,1.7,{out:.028});
  const line=bd.add(clothesline('marta-v-line',1.5,.42),'L',.35,1.95,{out:.02});
  const bunt=bd.add(S.bunting('marta-v-bunting',3.8,.45,[INK.yellow,INK.green,INK.blue,INK.pink]),'R',.3,2.3,{out:.02});
  // Left page: the town where she was born, the family, and an empty chair.
  B.stand(church('marta-v-church',1.25,1.95),-3.95,-1.3,{layer:1});
  const houses=B.stand(rowHouses('marta-v-houses',2.3,1.35,[PASTEL[0],PASTEL[2],PASTEL[1]],1),-2.05,-1.95,{layer:1});
  const door=houses.flap(S.door('marta-v-door',.2,.56),-.1,0,{anchor:'bl',axis:'y',z:.012});
  B.stand(S.tree('marta-v-tree',1.0,1.5,'olive','#7f9f55'),-.62,-2.05,{layer:1});
  const chairP=B.stand(chair('marta-v-chair',.5,.72),-3.2,-.7,{layer:1});
  B.stand(cactus('marta-v-cactus',.7,1.05),-4.6,-.35,{layer:2});
  const mum=B.person('marta-v-mum',-2.6,.05,1.78,{shirt:'casual',hair:'long',hairColor:MHAIR,adult:true,skin:MSKIN,face:'smile',layer:2});
  const babyP=mum.body.add(baby('marta-v-baby'),.02,1.06,{z:.03,anchor:'center'});
  const post=B.stand(signpost('marta-v-sign',1.3,1.5,'DOIS RIACHOS'),-1.05,-.45,{layer:2});
  post.add(S.flipCard('marta-v-1986',.9,.44,'1986',INK.pink),0,.56,{z:.012});
  const born=post.flap(S.flipCard('marta-v-born',.9,.44,'BORN',INK.blue),0,1.0,{z:.024});
  const sibs=[B.person('marta-v-sib1',-3.55,.75,1.12,{shirt:'navy',hair:'short',skin:MSKIN,face:'smile',layer:3}),B.person('marta-v-sib2',-4.25,1.1,1.02,{shirt:'casual',hair:'curly',skin:MSKIN,face:'grin',layer:3}),B.person('marta-v-sib3',-1.75,.85,1.0,{shirt:'fan',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'smile',layer:3})];
  const fam=B.stand(S.banner('marta-v-family',2.9,.34,'TEREZA · JOSÉ · VALDIR · ANGELA',INK.teal),-2.55,1.75,{layer:3,tab:false,s:0});
  const henP=B.stand(hen('marta-v-hen',.32),-.7,1.3,{layer:3});
  B.stand(kerb('marta-v-kerbL',4.4,.2),-2.6,3.1,{layer:3,tab:false});
  // Right page: the boys' street game, and a closed gate she can open.
  B.stand(stones('marta-v-goal',1.3),3.7,-1.0,{layer:1});
  B.stand(cactus('marta-v-cactus2',.6,.95,'#5aa56a'),4.55,-.3,{layer:1});
  const watcher=B.person('marta-v-watch',1.25,-1.1,1.2,{shirt:'navy',hair:'short',skin:'#7f5138',face:'grin',layer:1});
  const d1=B.person('marta-v-d1',2.2,.3,1.3,{shirt:'casual',hair:'curly',skin:'#d99a6c',face:'open',layer:2});
  const d2=B.person('marta-v-d2',3.5,.3,1.3,{shirt:'ger',hair:'short',skin:'#f1b88f',face:'open',layer:2});
  const passer=B.person('marta-v-passer',1.0,1.25,1.3,{shirt:'bib',hair:'short',skin:'#b27650',legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball('marta-v-ball',.14),1.5,1.42,{layer:3,tab:false});B.slot(1.5,1.52,2.55,.72);
  const gate=B.stand(gatePosts('marta-v-gate',.9,.72),3.7,1.12,{layer:3});
  const leafL=gate.flap(gateLeaf('marta-v-leafL',.36,.56),-.36,.02,{anchor:'bl',axis:'y',z:.012}),leafR=gate.flap(gateLeaf('marta-v-leafR',.36,.56),.36,.02,{anchor:'br',axis:'y',z:.012});
  const marta=B.person('marta-v-marta',4.4,1.72,1.3,{shirt:'bib',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'shy',layer:3});B.slot(4.4,1.85,2.85,.6);
  const star=marta.body.add(S.bubble('marta-v-star',.55,.48,'star'),.5,1.7,{z:-.02});
  const dogP=B.stand(dog('marta-v-dog',.36),4.35,.4,{layer:2});
  const belong=B.stand(S.banner('marta-v-belong',2.2,.4,'YOU BELONG',INK.pink),2.0,1.85,{layer:3,tab:false,s:0});
  B.stand(kerb('marta-v-kerbR',4.4,.2),2.6,3.1,{layer:3,tab:false});
  const P0=[4.4,1.72],P1=[3.7,1.5],P2=[2.85,.6],B0=[1.5,1.42],BG=[2.52,.72];
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   sunP.dy=-.8*beat(t,0,2.2);cloudR.dx=-.7*beat(t,1,42)+.2;line.rot=.03*wave(t,4,40,.5);bunt.dy=.04*wave(t,20,42,1.1);
   // Born in 1986 in Dois Riachos: a door opens, a baby is rocked, a flip card turns.
   door.flip=-1.4*beat(t,2.8,3.6);mum.body.x=-2.6+.25*beat(t,3,4.2);
   const rock=N?beat(t,3.4,4.2):1;mum.armL.rot=-.12-.9*rock;mum.armR.rot=.12+.9*rock+.08*wave(t,4.2,36,.8);babyP.rot=.12*wave(t,4.2,36,.8);
   born.flip=-2.9*(N?beat(t,6.2,7):1);
   // Her father left while she was a baby: an empty chair, and a small cloud passes over.
   chairP.s=shown(b,beat(t,10.7,11.6));const gc=N?beat(t,10.5,11.3)*(1-beat(t,14.2,15)):0;grey.scale=gc;grey.visible=gc>.02;grey.dx=.5*beat(t,10.5,15);
   drops.visible=N&&t>11&&t<14.4;drops.dy=-((t*.8)%1)*.25;drops.dx=grey.dx;
   // Her mother Tereza and three siblings pop up beside her, and their names unfold.
   sibs.forEach((s,i)=>{s.body.s=shown(b,beat(t,14.5+i*.8,15.3+i*.8));s.armR.rot=.12+1.9*(N?pulse(t,16.2+i*.4,18.8+i*.3)+beat(t,29.2,29.8)-beat(t,33.4,34):0);});
   fam.s=shown(b,beat(t,16.8,17.8));henP.rot=.18*pulse(t,7.2,7.7)+.18*pulse(t,8.1,8.6);henP.x=-.7-.3*beat(t,7,9);
   // The street game with the boys pops up; she waits outside a closed gate.
   [d1,d2,passer,watcher].forEach((p,i)=>{p.body.s=shown(b,beat(t,20.4+i*.35,21.2+i*.35));});
   marta.body.s=shown(b,beat(t,21.6,22.4));
   const drib=.12*wave(t,21.5,28.2,1.1);d1.body.dx=.06*wave(t,21.5,28,.8);d2.body.dx=-.06*wave(t,21.5,28,.9);
   // Open the gate and let her in.
   const open=Math.max(N?beat(t,24.6,25.6):0,beat(A,0,.3));leafL.flip=-1.45*open;leafR.flip=1.45*open;
   const walk=Math.max(N?beat(t,25.8,27.8):0,beat(A,.2,.6)),w1=clamp01(walk*2),w2=clamp01(walk*2-1);
   marta.body.x=lerp(lerp(P0[0],P1[0],w1),P2[0],w2);marta.body.z=lerp(lerp(P0[1],P1[1],w1),P2[1],w2);marta.body.dy=.04*Math.abs(Math.sin(walk*14))*(walk>0&&walk<1?1:0);
   marta.armL.rot=-.12-.5*pulse(t,25.8,27.8)*(N?1:0);
   // Many children feel different; the pass still finds her.
   const pass=Math.max(N?beat(t,28.6,29.8):0,beat(A,.5,.85));ball.x=lerp(B0[0],BG[0],pass)+(pass<.02?drib:0);ball.z=lerp(B0[1],BG[1],pass);ball.rot=-ball.x*6;
   const kick=Math.max(N?pulse(t,28.2,29):0,pulse(A,.45,.6));passer.leg!.rot=.9*kick+.8*Math.abs(drib);passer.armL.rot=-.12-.5*kick;
   star.visible=N&&t>30&&t<34;star.dy=-.4+.4*beat(t,30,30.6);
   // She belongs as much as anyone: the boys cheer, then the lesson banner.
   const cheer=Math.max(N?beat(t,34.4,35):0,beat(A,.85,1));
   [d1,d2,passer,watcher].forEach((p,i)=>{p.armR.rot=.12+(i===2?.5*kick:0)+2.2*cheer;if(i!==2)p.armL.rot=-.12-2.2*cheer*(i%2?1:.9);});
   marta.armR.rot=.12+2.3*cheer;marta.armL.rot+=-2.2*cheer;
   belong.s=Math.max(N?beat(t,37.4,38.3):0,beat(A,.9,1));belong.rot=.04*wave(t,38.3,41.8,1.2);
   mum.armR.rot+=1.6*(N?beat(t,37.6,38.2):0);
   dogP.rot=.08*wave(t,25.6,27.5,2.4)+.08*wave(t,34.4,41,2.2);dogP.x=4.35-.3*beat(t,21,23);
   return N?-.7*beat(t,2.2,3.4)+1.4*beat(t,19.8,21)-.7*beat(t,37,38.2):(A>0?.5:0);
  };
 }};

/* ───────────── 2 · Leaving home at fourteen (bus) ───────────── */
const bus:SpreadDef={id:'bus',rest:16.4,
 left:k=>{dusty(k,-5,0);const road=rect(-5,Z(.45),5,.6);k.fill(road,'#8d8778');k.dots(road,INK.navy,.05,.25);k.key(`M-5 ${Z(.45)} L0 ${Z(.45)} M-5 ${Z(1.05)} L0 ${Z(1.05)}`,.02);for(let i=0;i<9;i++)k.fill(rect(-4.8+i*.55,Z(.73),.28,.05),INK.white);
  titles(k,-1,'LEAVING HOME','AGED 14 · ABOUT THREE DAYS BY BUS',INK.blue);},
 right:k=>{dusty(k,0,5);const pitch=rect(1.9,Z(-1.75),3.0,1.75);k.fill(pitch,INK.grass,.85);k.dots(pitch,INK.leaf,.05,.3);k.key(pitch,.025,INK.white);k.key(ell(3.4,Z(-.9),.3,.3),.02,INK.white);
  const road=rect(0,Z(.45),5,.6);k.fill(road,'#8d8778');k.dots(road,INK.navy,.05,.25);k.key(`M0 ${Z(.45)} L5 ${Z(.45)} M0 ${Z(1.05)} L5 ${Z(1.05)}`,.02);for(let i=0;i<9;i++)k.fill(rect(.25+i*.55,Z(.73),.28,.05),INK.white);
  const sand=`M0 ${Z(1.2)} L5 ${Z(1.2)} L5 ${Z(3.2)} L0 ${Z(3.2)} Z`;k.fill(sand,INK.sand);k.dots(sand,INK.orange,.05,.15);
  titles(k,1,'RIO DE JANEIRO','TRY-OUT AT VASCO DA GAMA',INK.pink);},
 build:B=>{
  const bd=B.vfold(
   {key:'marta-b-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 3 L0 1.9 Q1.1 1.5 2.2 1.8 Q3.4 2.1 4.5 1.7 L4.5 3 Z`;k.fill(hills,'#d9ad62');k.dots(hills,INK.orange,.05,.3);
    const far=`M0 2.1 Q1.6 1.75 3 2.05 Q3.8 2.2 4.5 2 L4.5 3 L0 3 Z`;k.fill(far,'#c29a55');k.dots(far,INK.brown,.05,.2);
    for(let i=0;i<5;i++){const x=.3+i*.45,top=2.05,b=rect(x,top,.4,.45);k.fill(b,PASTEL[i]);k.key(b,.01);k.fill(poly([[x-.02,top],[x+.2,top-.12],[x+.42,top]]),TERRA);}
    for(const x of [2.9,3.6,4.2])k.key(`M${x} 2.4 L${x} 1.95 M${x} 2.1 L${x-.1} 2.1 L${x-.1} 1.98`,.045,'#4f7f52');}},
   {key:'marta-b-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const sea=rect(0,2.2,4.5,.8);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);
    const loaf=`M2.5 2.25 Q2.7 .75 3.3 .72 Q3.75 .8 3.85 2.25 Z`,small=`M1.6 2.25 Q1.8 1.45 2.15 1.45 Q2.5 1.5 2.6 2.25 Z`,hills=`M0 2.3 Q.6 1.3 1.3 1.7 Q1.6 1.9 1.7 2.3 Z`;
    for(const [p,c] of [[hills,INK.leaf],[small,INK.green],[loaf,'#3f8a63']] as const){k.fill(p,c);k.dots(p,INK.navy,.04,.3);k.key(p,.013);}
    k.key(`M2.1 1.46 L3.25 .76`,.008);k.fill(rect(2.62,1.05,.1,.07),INK.red);
    for(let i=0;i<7;i++){const x=.1+i*.62,h=.3+((i*3)%4)*.1,b=rect(x,2.3-h,.5,h);k.fill(b,i%2?'#f0e0c0':'#f6c1cf');k.key(b,.01);}
    k.fill(rect(0,2.3,4.5,.12),INK.sand);}},
   -3.05,1.22);
  const sunP=bd.add(S.sun('marta-b-sun',.34),'L',3.3,1.1,{out:.015}),moonP=bd.add(moon('marta-b-moon',.24),'R',.9,1.7,{out:.015}),starsP=bd.add(S.stars('marta-b-stars',2.2,.5,8),'L',.6,2.9,{out:.02});
  const cloud=bd.add(S.cloud('marta-b-cloud',1.0,.44),'R',3.0,2.6);
  // Left page: a coach spots her, goodbye at the bus stop, the route on a paper map.
  B.stand(rowHouses('marta-b-houses',1.9,1.1,[PASTEL[3],PASTEL[4],PASTEL[0]]),-3.35,-1.55,{layer:1});
  B.stand(S.tree('marta-b-tree',.9,1.35,'olive','#7f9f55'),-4.6,-.85,{layer:1});
  B.stand(cactus('marta-b-cactus',.6,.95),-.5,-2.0,{layer:1});
  const board=B.stand(S.sign('marta-b-board',1.45,1.75,'THE ROUTE',INK.yellow),-1.75,-.75,{layer:1});
  const map=board.add(mapCard('marta-b-map',1.35,.95),0,1.24,{z:.03,anchor:'center'});
  const town1=B.stand(town('marta-b-town1',1.2,.85,1),-2.95,-.25,{layer:1,s:0});
  B.stand(signpost('marta-b-stop',.9,1.3,'BUS STOP',INK.white),-4.55,.25,{layer:2});
  const mum=B.person('marta-b-mum',-4.0,-.05,1.78,{shirt:'casual',hair:'long',hairColor:MHAIR,adult:true,skin:MSKIN,face:'smile',layer:2});
  const bro=B.person('marta-b-bro',-3.2,.15,1.0,{shirt:'navy',hair:'short',skin:MSKIN,face:'smile',layer:2});
  const scout=B.person('marta-b-scout',-.5,-.25,1.7,{shirt:'coach',hair:'bun',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const spot=scout.body.add(S.bubble('marta-b-spot',.5,.42,'star'),.5,1.55,{z:-.02});
  const hName=scout.body.add(S.flipCard('marta-b-hname',1.25,.28,'HELENA PACHECO',INK.teal),0,1.72,{z:.03,anchor:'center'});
  const kid=B.person('marta-b-kid',-2.2,1.55,1.22,{shirt:'bib',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'smile',holdR:'suitcase',layer:3});B.slot(-2.2,1.7,-3.1,1.5);
  const jug=B.stand(S.ball('marta-b-jug',.1),-1.75,1.62,{layer:3,tab:false});
  const day1=B.stand(S.flipCard('marta-b-day1',.7,.36,'DAY 1',INK.orange),-2.1,1.7,{layer:3,s:0});
  // The road: one bus per page; the hills hide the hand-over at the gutter.
  B.slot(-4.2,.75,-.7,.75);B.slot(.7,.75,4.2,.75);
  const busL=B.stand(busPlate('marta-b-busL',1.35,.66),-3.55,.75,{layer:3,tab:false});
  const faceL=busL.add(busFace('marta-b-faceL'),-.36,.36,{z:.012});
  const think=busL.add(homeBubble('marta-b-think',.5,.42),-.15,.75,{z:-.02});
  const busR=B.stand(busPlate('marta-b-busR',1.35,.66),.7,.75,{layer:3,tab:false});
  const faceR=busR.add(busFace('marta-b-faceR'),-.36,.36,{z:.012});
  B.stand(hill('marta-b-hillL',1.35,1.12),-.68,1.2,{layer:3});B.stand(hill('marta-b-hillR',1.35,1.12,INK.grass),.68,1.2,{layer:3});
  const days=[B.stand(S.flipCard('marta-b-day2',.7,.36,'DAY 2',INK.teal),1.55,1.7,{layer:3,s:0}),B.stand(S.flipCard('marta-b-day3',.7,.36,'DAY 3',INK.pink),2.45,1.7,{layer:3,s:0})];
  const town2=B.stand(town('marta-b-town2',1.0,.75,2),1.0,-1.2,{layer:1,s:0});
  // Right page: Rio and the try-out pitch; many feelings at once, and the people she loves in her heart.
  B.stand(S.goal('marta-b-goal',1.3,.7),3.45,-1.55,{layer:1});
  B.stand(S.tree('marta-b-palm',1.0,1.8,'palm'),4.55,-.8,{layer:1});
  B.stand(signpost('marta-b-club',1.3,1.15,'VASCO DA GAMA',INK.white),2.05,-1.4,{layer:1});
  const coach=B.person('marta-b-coach',2.8,-.8,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const g1=B.person('marta-b-g1',3.75,-.45,1.2,{shirt:'navy',hair:'bun',skin:'#7f5138',face:'shy',layer:2});
  const g2=B.person('marta-b-g2',4.4,-.1,1.2,{shirt:'casual',hair:'curly',skin:'#f1b88f',face:'shy',layer:2});
  const nerv=[g1.body.add(S.bubble('marta-b-n1',.44,.38,'dots'),.4,1.6,{z:-.02}),g2.body.add(S.bubble('marta-b-n2',.44,.38,'dots'),.4,1.6,{z:-.02})];
  const hero=B.person('marta-b-hero',3.6,1.5,1.25,{shirt:'bib',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'shy',legs:'kick',layer:3});
  const feel=[hero.body.add(S.bubble('marta-b-excited',.5,.42,'star'),-.48,1.6,{z:-.02}),hero.body.add(S.bubble('marta-b-scared',.5,.42,'dots'),-.48,1.6,{z:-.02}),hero.body.add(homeBubble('marta-b-homesick',.5,.42),-.48,1.6,{z:-.02})];
  const loved=hero.body.add(familyBubble('marta-b-loved',.62,.56),.5,1.55,{z:-.02,anchor:'center'});
  const kickBall=B.stand(S.ball('marta-b-ball',.12),4.02,1.62,{layer:3,tab:false});
  B.stand(umbrella('marta-b-umb',.8,.9),4.55,.3,{layer:3});
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   // A coach, Helena Pacheco, sees how talented she is.
   scout.body.s=N?beat(t,2.5,3.3):1;const hn=N?beat(t,3.2,4):1;hName.scale=hn;hName.visible=hn>.02;spot.visible=N&&t>4.4&&t<8;spot.dy=-.3+.3*beat(t,4.4,5);
   const j=N?Math.abs(Math.sin(Math.max(0,t-2.6)*3.4))*(t>2.6&&t<7.8?1:0):0;jug.dy=.4*j;jug.visible=N?t<8.4:false;kid.armL.rot=-.12-.3*j;
   scout.armR.rot=.12+1.9*(N?beat(t,5,5.6)-beat(t,7.4,8):0);
   // She leaves her family: walks to the bus with her suitcase and climbs aboard.
   const walk=N?Math.max(beat(t,8.6,10.8),beat(A,0,.1)):1,aboard=N?Math.max(beat(t,11,11.8),beat(A,0,.1)):1;
   kid.body.x=-2.2-.9*walk;kid.body.s=1-aboard;kid.body.dy=.04*Math.abs(Math.sin(walk*12))*(walk>0&&walk<1?1:0);
   faceL.visible=aboard>.5;
   mum.armR.rot=.12+2.1*(N?beat(t,9,9.8):1)+.35*wave(t,9.8,16.4,1.2);mum.armL.rot=-.12-.3*pulse(t,8.4,10);bro.armL.rot=-.12-2.2*(N?beat(t,9.4,10):1)-.3*wave(t,10,16,1.7);
   map.scale=N?Math.max(beat(t,12,13),beat(A,0,.1)):1;map.rot=.04*wave(t,13,16.4,.8);
   think.visible=N&&t>13.6&&t<16.6;think.dy=-.3+.3*beat(t,13.6,14.2);
   // Pull the bus: towns go by, day cards pop up, sun and moon take turns.
   const p=Math.max(N?beat(t,16.8,20.8):0,A);
   busL.x=-3.55+2.87*clamp01(p/.46);busL.visible=p<.47;busL.dy=.02*Math.abs(Math.sin(p*60))*(p>0&&p<.46?1:0);
   busR.x=.7+2.0*clamp01((p-.54)/.46);busR.visible=p>.52;busR.dy=.02*Math.abs(Math.sin(p*60))*(p>.54&&p<1?1:0);
   const arrived=Math.max(N?beat(t,20.9,21.6):0,beat(A,.92,1));faceR.visible=arrived<.5;
   day1.s=beat(p,.12,.24);days.forEach((d,i)=>{d.s=beat(p,[.62,.82][i],[.72,.92][i]);});
   town1.s=beat(p,.02,.16);town2.s=beat(p,.56,.7);
   const night=Math.sin(clamp01(p)*Math.PI*3);sunP.dy=-.8*beat(t,0,2.2)+.9*Math.max(0,night);starsP.visible=night>.2;starsP.dy=-.4*Math.max(0,night);moonP.dy=-.9*Math.max(0,night);moonP.visible=night>.05;cloud.dx=-.8*p;
   // Rio: a very big step. Excited, scared and homesick, all at once.
   hero.body.s=arrived;
   const fOn=[[25.2,26.7],[26.7,28.3],[28.3,29.9]];feel.forEach((f,i)=>{f.visible=N&&t>fOn[i][0]&&t<fOn[i][1];f.dy=-.25+.25*beat(t,fOn[i][0],fOn[i][0]+.4);});
   coach.armL.rot=-.12-1.9*beat(t,22,22.6)+1.9*beat(t,24.4,25);
   // Others are nervous too; being brave means keeping going.
   [g1,g2].forEach((g,i)=>{g.body.s=N?beat(t,30+i*.5,30.9+i*.5):1;nerv[i].visible=N&&t>30.6+i*.5&&t<33.6;g.armR.rot=.12+2.2*Math.max(N?beat(t,38.4+i*.3,39+i*.3):0,beat(A,.96,1));});
   // She carries the people she loves with her, then kicks the first ball.
   const lv=N?beat(t,33.8,34.6):0;loved.scale=lv;loved.visible=lv>.02&&t<42.5;loved.rot=.05*wave(t,34.6,42,1);
   const sh=beat(t,36,37.2);hero.leg!.rot=N?.7*beat(t,35.6,35.9)-1.4*beat(t,35.9,36.1)+.7*beat(t,36.5,37):0;
   kickBall.x=4.02-.45*sh;kickBall.z=1.62-2.9*sh;kickBall.dy=Math.sin(sh*Math.PI)*.9;kickBall.rot=-sh*9;kickBall.visible=arrived>.5;
   const yay=Math.max(N?beat(t,38.2,38.8):0,beat(A,.95,1));hero.armR.rot=.12+2.4*yay;hero.armL.rot=-.12-2.4*yay*(N&&t<42?1:A>.95?1:0);
   coach.armR.rot=.12+2.2*yay;
   const drive=-.65+1.3*p;
   return N?(t<16.6?-.6*beat(t,2.2,3.2)+.3*beat(t,13,14):t<20.8?drive:.65-.2*beat(t,33.6,34.6)-.45*beat(t,38.2,39.2)):(A>0?drive:0);
  };
 }};

/* ───────────── 3 · A door closes, a door opens (best) ───────────── */
const best:SpreadDef={id:'best',rest:33.2,
 left:k=>{dusty(k,-5,0);const path=`M-4.2 ${Z(.2)} Q-3 ${Z(.9)} -1.6 ${Z(.5)} Q-.8 ${Z(.3)} -.2 ${Z(.9)}`;k.key(path,.2,'#d8b77a');k.key(path,.02,INK.brown);footprints(k,-3.4,Z(.55),-.5,Z(.65),8,INK.brown);
  titles(k,-1,'BRAZIL','VASCO DA GAMA 2000 · SANTA CRUZ',INK.blue);},
 right:k=>{snowPrint(k,0,5);const path=`M.3 ${Z(1.3)} Q1.4 ${Z(1.1)} 2.7 ${Z(.1)}`;k.key(path,.22,'#dfe7ea');k.key(path,.015,INK.sky);footprints(k,.6,Z(1.35),2.5,Z(.25),7,INK.blue);
  titles(k,1,'SWEDEN','UMEÅ IK · 2004',INK.blue);},
 build:B=>{
  const bd=B.vfold(
   {key:'marta-s-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 3 L0 1.8 Q1.2 1.4 2.3 1.75 Q3.4 2.05 4.5 1.6 L4.5 3 Z`;k.fill(hills,'#d9ad62');k.dots(hills,INK.orange,.05,.3);
    const loaf=`M.6 2.3 Q.8 1.0 1.4 .98 Q1.85 1.05 1.95 2.3 Z`;k.fill(loaf,'#3f8a63');k.dots(loaf,INK.navy,.04,.3);k.key(loaf,.013);
    for(let i=0;i<7;i++){const x=.1+i*.62,h=.35+((i*3)%4)*.1,b=rect(x,2.4-h,.5,h);k.fill(b,PASTEL[i%6]);k.key(b,.01);}
    k.fill(rect(0,2.4,4.5,.6),'#e9cf95');k.dots(rect(0,2.4,4.5,.6),INK.orange,.05,.2);}},
   {key:'marta-s-bdR',w:4.5,h:3.0,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#dbe9f2');k.dots(p,INK.sky,.05,(x,y)=>.5-y/3*.4);
    const hills=`M0 2.2 Q1.3 1.6 2.4 1.95 Q3.5 2.25 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hills,INK.white);k.dots(hills,INK.sky,.04,.3);k.key(hills,.012);
    for(let i=0;i<11;i++){const x=.15+i*.42,top=1.55+((i*5)%3)*.12;const tr=poly([[x-.16,2.35],[x,top],[x+.16,2.35]]);k.fill(tr,i%2?INK.green:'#2f6e45');k.key(tr,.01);k.fill(poly([[x-.07,top+.2],[x,top],[x+.07,top+.2]]),INK.white);}
    for(let i=0;i<4;i++){const x=.4+i*1.1,b=rect(x,2.05,.5,.35);k.fill(b,'#b8483e');k.key(b,.01);k.fill(poly([[x-.04,2.07],[x+.25,1.86],[x+.54,2.07]]),INK.white);k.key(poly([[x-.04,2.07],[x+.25,1.86],[x+.54,2.07]]),.01);}
    k.fill(rect(0,2.4,4.5,.6),'#eef3f4');}},
   -3.05,1.22);
  const sunP=bd.add(S.sun('marta-s-sun',.32),'L',3.5,1.6,{out:.015});
  const grey=bd.add(rainCloud('marta-s-grey',1.4,.62),'L',3.3,2.25,{out:.03}),drops=bd.add(rain('marta-s-rain',1.2,.6),'L',3.25,1.7,{out:.028});
  const planeP=bd.add(S.plane('marta-s-plane',.6,.3),'R',.5,2.1,{out:.04});
  const snow=[bd.add(snowfall('marta-s-snow1',2.0,1.0),'R',.6,1.6,{out:.03}),bd.add(snowfall('marta-s-snow2',1.8,.9),'R',2.5,1.8,{out:.03})];
  // Left page: Vasco da Gama's door closes; the small club Santa Cruz; the arrow to Sweden.
  const vasco=B.stand(building('marta-s-vasco',1.5,1.5,'VASCO DA GAMA',PASTEL[4]),-3.4,-1.35,{layer:1});
  const vDoor=vasco.flap(woodDoor('marta-s-vdoor',.24,.3),-.12,0,{anchor:'bl',axis:'y',z:.012});
  const folded=vasco.add(S.flipCard('marta-s-folded',1.3,.32,'THE TEAM FOLDED',INK.red),0,1.52,{z:.03,anchor:'center'});
  B.stand(S.tree('marta-s-palm',.9,1.6,'palm'),-4.6,-.6,{layer:1});
  const yp=B.stand(signpost('marta-s-years',.9,1.3,'YEARS',INK.white),-2.0,-.75,{layer:1});
  yp.add(S.flipCard('marta-s-2002',.8,.4,'2002',INK.red),0,.5,{z:.012});
  const y2000=yp.flap(S.flipCard('marta-s-2000',.8,.4,'2000',INK.blue),0,.9,{z:.024});
  const santa=B.stand(building('marta-s-santa',1.15,1.2,'SANTA CRUZ',PASTEL[1]),-1.1,-1.75,{layer:1,s:0});
  const seasons=santa.add(S.flipCard('marta-s-seasons',1.05,.3,'TWO SEASONS',INK.teal),0,1.22,{z:.03,anchor:'center'});
  const young=B.person('marta-s-young',-3.4,.25,1.2,{shirt:'bib',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'sad',layer:2});
  const postP=B.stand(pole('marta-s-pole',.1,1.6),-.45,.35,{layer:2});
  const arrow=postP.flap(arrowBoard('marta-s-arrSwe',1.1,.32,'SWEDEN',1,INK.blue),0,1.35,{anchor:'bl',axis:'y',z:.012});
  const card04=postP.add(S.flipCard('marta-s-2004',.62,.32,'2004',INK.pink),0,.85,{z:.014,anchor:'center'});
  const cases=B.stand(suitcases('marta-s-cases',.7,.62),-1.45,1.2,{layer:3,s:0});
  B.stand(cactus('marta-s-cactus',.6,.95),-4.4,1.3,{layer:3});
  // Right page: Sweden. New country, new language, new home; the door to Umeå.
  B.stand(redHouse('marta-s-house1',1.1,1.0),4.3,-1.7,{layer:1});
  B.stand(S.tree('marta-s-pine1',.8,1.5,'pine','#2f6e45'),4.6,-.5,{layer:1});
  B.stand(S.tree('marta-s-pine2',.7,1.25,'pine'),.55,-1.5,{layer:1});
  const frame=B.stand(doorFrame('marta-s-frame',1.5,1.95),2.7,-.75,{layer:1});
  const bigDoor=frame.flap(swedenDoor('marta-s-door',1.1,1.56),-.555,0,{anchor:'bl',axis:'y',z:.014});
  const np=B.stand(pole('marta-s-pole2',.1,1.7),1.05,.2,{layer:2});
  const newCards=[['NEW COUNTRY',INK.blue],['NEW LANGUAGE',INK.pink],['NEW HOME',INK.teal]].map(([l,c],i)=>np.add(S.flipCard(`marta-s-new${i}`,1.1,.3,l,c),0,1.5-i*.38,{z:.014,anchor:'center'}));
  const cup=B.stand(S.trophy('marta-s-cup',.62,.9),4.25,.35,{layer:2,s:0});
  const cupBanner=B.stand(S.banner('marta-s-cupbanner',1.6,.34,'UEFA WOMEN’S CUP · 2004',INK.blue),4.0,.95,{layer:3,tab:false,s:0});
  const mates=[B.person('marta-s-mate1',3.75,-.25,1.24,{shirt:'arg',hair:'bun',skin:'#f1b88f',face:'grin',layer:2}),B.person('marta-s-mate2',1.75,-.35,1.22,{shirt:'arg',hair:'long',hairColor:'#e3c27a',skin:'#f1b88f',face:'grin',layer:2})];
  const hero=B.person('marta-s-hero',1.5,1.55,1.26,{shirt:'bib',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'shy',holdR:'suitcase',layer:3});B.slot(1.5,1.7,2.7,-.3);
  const talk=hero.body.add(S.bubble('marta-s-talk',.5,.42,'dots'),.48,1.6,{z:-.02});
  const conf=bd.add(S.confetti('marta-s-conf',2.2,1.1,4),'R',1.4,1.3,{out:.04});
  const H0=[1.5,1.55],H1=[2.7,-.3];
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   sunP.dy=-.5*beat(t,0,2.5);snow.forEach((s,i)=>{s.dy=-.12*((t*.18+i*.5)%1);});
   // Vasco da Gama, 2000. Two years later, the team folded: the door shuts, a cloud comes.
   const shut=N?beat(t,5.6,6.6):1;vDoor.flip=-1.3*(1-shut);y2000.flip=-2.9*(N?beat(t,6.4,7.2):1);
   const fo=N?beat(t,7.2,8):1;folded.scale=fo;folded.visible=fo>.02;
   const gc=N?beat(t,6,7)*(1-beat(t,9.6,10.6)):0;grey.scale=gc;grey.visible=gc>.02;drops.visible=N&&t>6.8&&t<10;drops.dy=-((t*.8)%1)*.25;
   young.armL.rot=-.12+.2*beat(t,6,7);
   // She kept going: to Santa Cruz for two seasons, then the arrow swings to Sweden.
   const toSanta=N?beat(t,11.8,14.6):1;santa.s=N?beat(t,11.6,12.6):1;const ss=N?beat(t,14.4,15.2):1;seasons.scale=ss;seasons.visible=ss>.02;
   const toPole=N?beat(t,18.4,20.6):0;young.body.x=lerp(-3.4,-1.95,toSanta)+.95*toPole;young.body.z=lerp(.25,.55,toSanta)+.35*toPole;young.body.dy=.04*Math.abs(Math.sin((toSanta+toPole)*12))*((toSanta>0&&toSanta<1)||(toPole>0&&toPole<1)?1:0);
   young.armR.rot=.12+1.9*(N?beat(t,9.8,10.4)-beat(t,11.4,12):0);
   arrow.flip=-1.5*(1-(N?beat(t,16.8,17.8):1));const c4=N?beat(t,17.6,18.4):1;card04.scale=c4;
   cases.s=N?beat(t,18.2,19):1;young.body.s=N?1-beat(t,20.8,21.4):0;
   planeP.dx=N?1.5*beat(t,19.8,22.4):1.5;planeP.dy=N?-.3*pulse(t,19.8,22.4):0;planeP.visible=N?t>19.6:true;
   // Sweden: a new country, a new language, a new home.
   newCards.forEach((c,i)=>{const s=N?beat(t,22.6+i*1.3,23.2+i*1.3):1;c.scale=s;c.visible=s>.02;});
   hero.body.s=N?beat(t,21.8,22.6):1;
   // She learned to speak Swedish, and helped Umeå win the UEFA Women's Cup.
   talk.visible=N&&t>27&&t<30;talk.dy=-.25+.25*beat(t,27,27.4);
   cup.s=N?beat(t,30,30.8):1;cupBanner.s=N?beat(t,30.6,31.4):1;cup.rot=.05*wave(t,31,33,1.4);
   // Open the paper door; she walks through into her new team.
   const open=Math.max(N?beat(t,33.6,34.6):0,beat(A,0,.35));bigDoor.flip=-1.5*open;
   const walk=Math.max(N?beat(t,34.6,36.4):0,beat(A,.3,.75));hero.body.x=lerp(H0[0],H1[0],walk);hero.body.z=lerp(H0[1],H1[1],walk);hero.body.dy=.04*Math.abs(Math.sin(walk*14))*(walk>0&&walk<1?1:0);
   const welcome=Math.max(N?beat(t,36.6,37.4):0,beat(A,.6,.9));mates.forEach((m,i)=>{m.body.s=welcome;m.armR.rot=.12+(i?2.1:1.4)*welcome;});
   // Ask for help: a teammate holds out a hand.
   const help=N?beat(t,41,41.8):0;mates[1].armR.rot=.12+1.4*Math.max(help,welcome*(N?0:1));mates[0].armL.rot=-.12-2.1*Math.max(N?beat(t,37,37.6):0,beat(A,.85,1));
   const joy=Math.max(N?beat(t,37.4,38):0,beat(A,.9,1));hero.armL.rot=-.12-2.2*joy;
   conf.dy=-1+1.1*joy;conf.visible=joy>.02;
   return N?-.7*beat(t,2.6,3.6)+1.4*beat(t,21.4,22.4)-.35*beat(t,40.4,41.4):(A>0?.5:0);
  };
 }};

/* ───────────── 4 · So close, again and again (goals) ───────────── */
const goals:SpreadDef={id:'goals',rest:29,
 left:k=>{pitchPrint(k,-5,0);chalk(k,ell(0,Z(0),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);
  titles(k,-1,'SO CLOSE','OLYMPICS 2004 AND 2008 · WORLD CUP 2007',INK.blue);},
 right:k=>{pitchPrint(k,0,5);chalk(k,ell(0,Z(0),1.1,1.1));chalk(k,`M5 ${Z(-2.3)} L2.3 ${Z(-2.3)} L2.3 ${Z(1.0)} L5 ${Z(1.0)}`);chalk(k,`M5 ${Z(-1.5)} L3.9 ${Z(-1.5)} L3.9 ${Z(.2)} L5 ${Z(.2)}`);
  k.circle(3.3,Z(-.5),.05,INK.white);
  titles(k,1,'WORLD CUP FINAL 2007','LOST 2–0 TO GERMANY',INK.pink);},
 build:B=>{
  const bd=B.vfold({key:'marta-g-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.05,2.6,FANS,2);k.key(`M0 .45 Q2.25 .75 4.5 .45`,.014);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'marta-g-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.05,2.6,FANS,5);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const grey=bd.add(rainCloud('marta-g-grey',1.5,.62),'R',2.4,2.35,{out:.03}),drops=bd.add(rain('marta-g-rain',1.3,.65),'R',2.35,1.75,{out:.028});
  const sunP=bd.add(S.sun('marta-g-sun',.34),'R',1.0,1.2,{out:.02});
  const conf=bd.add(S.confetti('marta-g-conf',2.4,1.1,2),'L',1.6,1.5,{out:.04});
  // Left page: the SO CLOSE board with three medals; the big silver medal lifts to show what else happened.
  B.stand(S.floodlight('marta-g-floodL',.5,1.9),-4.6,-1.15,{layer:1});
  const board=B.stand(medalBoard('marta-g-board',2.6,1.6),-2.4,-1.1,{layer:1});
  const medals=[['2004','OLYMPICS'],['2007','WORLD CUP'],['2008','OLYMPICS']].map(([y,l],i)=>board.add(silverCard(`marta-g-m${y}`,y,l),-.78+i*.78,.28,{z:.015}));
  const fans=[B.person('marta-g-fan1',-.7,.3,1.08,{shirt:'fan',hair:'long',skin:'#d99a6c',face:'sad',layer:2}),B.person('marta-g-fan2',-4.35,.4,1.02,{shirt:'casual',hair:'short',skin:'#7f5138',face:'sad',layer:2})];
  const holder=B.stand(medalHolder('marta-g-holder',1.5,1.05),-2.45,1.05,{layer:3});
  const gb=holder.add(S.goldenBall('marta-g-gb',.2),-.36,.3,{z:.012}),boot=holder.add(bootPlate('marta-g-boot',.32),.34,.34,{z:.012});
  const lid=holder.flap(silverFlap('marta-g-lid',.5),0,1.07,{anchor:'top',z:.03});
  const post=B.stand(pole('marta-g-post',.1,1.5),-.9,1.0,{layer:3});
  const same=[['BEST PLAYER',INK.pink],['TOP SCORER',INK.blue]].map(([l,c],i)=>post.add(S.flipCard(`marta-g-same${i}`,.95,.3,l,c),0,1.3-i*.38,{z:.014,anchor:'center'}));
  // Right page: the 2007 final. The score, the saved penalty, and a teammate who comes to her.
  B.stand(S.floodlight('marta-g-floodR',.5,1.9),4.65,-.95,{layer:1});
  B.stand(S.goal('marta-g-goal',1.8,.9),3.95,-1.4,{layer:1});
  const sb=B.stand(S.scoreboard('marta-g-sb',1.5,1.15,'FINAL · 2007'),1.2,-1.35,{layer:1,s:0});
  const score=sb.flap(S.scoreFlap('marta-g-score',1.3,.62,'BRAZIL','0–2','GERMANY'),0,.95,{z:.014});
  const keeper=B.person('marta-g-keeper',3.95,-1.15,1.22,{shirt:'keeper',hair:'long',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const hero=B.person('marta-g-hero',3.3,.35,1.3,{shirt:'bib',hair:'bun',hairColor:MHAIR,skin:MSKIN,face:'sad',legs:'kick',layer:2});
  const ball=B.stand(S.ball('marta-g-ball',.13),3.15,-.35,{layer:2,tab:false});
  const mate=B.person('marta-g-mate',1.4,1.35,1.28,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'smile',layer:3});B.slot(1.4,1.5,2.75,.55);
  const heart=mate.body.add(S.bubble('marta-g-heart',.5,.42,'heart'),.48,1.6,{z:-.02});
  B.stand(S.grassStrip('marta-g-grass',4.4,.18,INK.grass,false),2.55,3.12,{layer:3,tab:false});
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   // Brazil reached the biggest finals, and lost them: silver in 2004 and 2008.
   medals.forEach((m,i)=>{const s=N?beat(t,[7.4,13,10.2][i],[8,13.6,10.8][i]):1;m.scale=s;m.visible=s>.02;m.rot=.06*wave(t,8,20,.8+i*.2);});
   fans.forEach((f,i)=>{f.armL.rot=-.12-1.2*pulse(t,3,6.5+i*.3);});
   // The 2007 final: 2–0 to Germany, and her penalty is saved.
   sb.s=N?beat(t,12.6,13.4):1;const sc=N?beat(t,13.8,14.6):1;score.scale=sc;
   const run=N?beat(t,16,17):0,kick=N?beat(t,17,17.3):0,save=N?beat(t,17.3,18.2):0;
   hero.body.x=3.3-.1*run;hero.leg!.rot=N?.7*beat(t,16.6,17)-1.5*beat(t,17,17.2)+.8*beat(t,17.6,18):0;
   ball.x=lerp(3.15,3.75,save);ball.z=lerp(-.35,-1.05,save);ball.dy=Math.sin(save*Math.PI)*.35;ball.rot=-save*6;ball.visible=N?t<30||A>0:true;
   keeper.body.rot=-.6*save*(1-beat(t,19.6,20.4));keeper.body.dx=-.3*save*(1-beat(t,19.6,20.4));keeper.armL.rot=-.12-2.2*save;keeper.armR.rot=.12+2.2*save*(1-beat(t,26,27));
   // It hurts: a cloud and rain; her head goes down.
   const sad=N?beat(t,18.6,19.4)*(1-beat(t,36.8,37.6)):0;hero.body.rot=.05*sad;
   const gc=N?beat(t,18.6,19.6)*(1-beat(t,36.6,37.6)):0;grey.scale=gc;grey.visible=gc>.02;drops.visible=N&&t>19.4&&t<36.8;drops.dy=-((t*.8)%1)*.25;
   sunP.dy=-.9*(N?beat(t,37,39):beat(A,.7,1));
   // But at the same World Cup: best player and top scorer, seven goals.
   same.forEach((c,i)=>{const s=N?beat(t,21.4+i*2.6,22+i*2.6):1;c.scale=s;c.visible=s>.02;});
   // Lift the silver medal and look underneath.
   const lift=Math.max(N?beat(t,29.6,30.8):0,beat(A,0,.5));lid.flip=-2.9*lift;
   const pop=Math.max(N?beat(t,30.4,31.2):0,beat(A,.3,.7));gb.scale=.5+.5*pop;boot.scale=.5+.5*pop;gb.dy=.18*pop;boot.dy=.14*pop;
   // Losing a final hurts, and it is fine to be sad: a teammate comes to her.
   const come=Math.max(N?beat(t,32.6,34.6):0,beat(A,.55,.85));mate.body.x=lerp(1.4,2.75,come);mate.body.z=lerp(1.35,.55,come);mate.body.dy=.04*Math.abs(Math.sin(come*14))*(come>0&&come<1?1:0);
   mate.armR.rot=.12+1.3*Math.max(N?beat(t,34.6,35.2):0,beat(A,.8,.9));heart.visible=N&&t>35&&t<40.2;heart.dy=-.3+.3*beat(t,35,35.6);
   // One game never tells the whole story: the sun returns and she lifts her head.
   const up=Math.max(N?beat(t,38.6,39.4):0,beat(A,.85,1));hero.armR.rot=.12+2.3*up;hero.armL.rot=-.12-2.3*up;
   fans.forEach((f,i)=>{f.armR.rot=.12+2.1*Math.max(N?beat(t,40.6+i*.3,41.2+i*.3):0,beat(A,.9,1));});
   conf.dy=-1+1.1*Math.max(N?beat(t,31,33):0,beat(A,.6,.9));conf.visible=N?t>30.8&&t<37:A>.6;
   return N?-.65*beat(t,2.2,3.2)+1.3*beat(t,12.2,13.2)-1.3*beat(t,20.4,21.4)+1.3*beat(t,32,33)-.65*beat(t,40,41):(A>0?-.2:0);
  };
 }};

/* ───────────── 5 · A knee to heal (space) ───────────── */
const space:SpreadDef={id:'space',rest:31.4,
 left:k=>{pitchPrint(k,-5,0,'#b7c9d6');water(k,-2.05,0,.6,1.7);
  titles(k,-1,'MARCH 2022','LEFT KNEE · AN OPERATION · SEASON OVER',INK.blue);},
 right:k=>{pitchPrint(k,0,5);chalk(k,`M5 ${Z(-2.3)} L2.6 ${Z(-2.3)} L2.6 ${Z(-.6)} L5 ${Z(-.6)}`);water(k,0,1.05,.6,1.7);
  titles(k,1,'BACK ON THE PITCH','2023 · 18 GAMES · 2024 NWSL CHAMPIONS',INK.pink);},
 build:B=>{
  const bd=B.vfold({key:'marta-p-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);for(let i=0;i<9;i++){const x=.2+i*.5;k.fill(ell(x,1.9,.34,.5),i%2?INK.leaf:INK.green);}k.dots(rect(0,1.4,4.5,1),INK.navy,.05,.15);
    for(let i=0;i<5;i++){const x=.3+i*.85;k.key(`M${x} 2.45 L${x} 1.3`,.04,'#4f7f52');k.fill(poly([[x,1.3],[x-.32,1.46],[x-.05,1.34],[x+.32,1.44]]),'#3f8a63');}
    k.fill(rect(0,2.45,4.5,.55),'#b7c9d6');}},
   {key:'marta-p-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.15,2.5,[INK.pink,'#7b5ea7',INK.white,INK.yellow,'#7b5ea7'],3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const grey=bd.add(rainCloud('marta-p-grey',1.4,.6),'L',2.6,2.3,{out:.03}),drops=bd.add(rain('marta-p-rain',1.2,.6),'L',2.55,1.75,{out:.028});
  const sunP=bd.add(S.sun('marta-p-sun',.34),'L',1.2,1.5,{out:.015}),moonP=bd.add(moon('marta-p-moon',.22),'L',3.6,1.6,{out:.015});
  const conf=bd.add(S.confetti('marta-p-conf',2.4,1.2,3),'R',1.6,1.3,{out:.04});
  // Left page: Orlando, March 2022. The knee, the operation, the many months of patience.
  B.stand(S.tree('marta-p-tree',1.0,1.5,'palm'),-4.6,-1.05,{layer:1});B.stand(S.bench('marta-p-bench',1.1,.45),-3.6,-1.6,{layer:1});
  const cal=B.stand(calendar('marta-p-cal',1.7,1.35),-2.1,-1.25,{layer:1});
  const ticks=Array.from({length:12},(_,i)=>cal.add(tickMark(`marta-p-tick${i}`),-.66+(i%6)*.252,1.02-Math.floor(i/6)*.24,{z:.012,anchor:'center'}));
  const march=cal.flap(S.flipCard('marta-p-march',1.5,.5,'MARCH 2022',INK.red),0,.93,{z:.024});
  const cp=B.stand(pole('marta-p-pole',.1,1.55),-.55,-.55,{layer:2});
  const cards=[['LEFT KNEE',INK.pink],['OPERATION',INK.blue],['SEASON OVER',INK.navy]].map(([l,c],i)=>cp.add(S.flipCard(`marta-p-card${i}`,1.05,.3,l,c),0,1.35-i*.38,{z:.014,anchor:'center'}));
  const hero=B.person('marta-p-hero',-3.3,.55,1.3,{shirt:'fan',hair:'long',hairColor:MHAIR,skin:MSKIN,face:'sad',layer:2});
  const patch=hero.body.add(plaster('marta-p-plaster'),.12,.36,{z:.02,anchor:'center'});
  const carer=B.person('marta-p-carer',-4.25,.2,1.72,{shirt:'casual',hair:'bun',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const breath=hero.body.add(S.bubble('marta-p-breath',.5,.42,'breath'),.48,1.6,{z:-.02});
  // The paper bridge back: three planks, 2022, 2023, 2024.
  const planks=[B.flat(plank('marta-p-plank0',.95,1.05,'2022',INK.red),-1.95,1.68,{edge:'left',hinge:-1.45}),B.flat(plank('marta-p-plank1',.95,1.05,'2023',INK.teal),-.98,1.68,{edge:'left',hinge:-1.45}),B.flat(plank('marta-p-plank2',.95,1.05,'2024',INK.pink),.98,1.68,{edge:'right',hinge:1.45})];
  const walkL=B.person('marta-p-walkL',-2.6,1.2,1.2,{shirt:'arg',hair:'bun',hairColor:MHAIR,skin:MSKIN,face:'smile',layer:3,holdR:'ball'});
  // Right page: back to play in 2023, champions in 2024.
  B.stand(S.floodlight('marta-p-flood',.5,1.9),4.65,-1.05,{layer:1});
  B.stand(S.goal('marta-p-goal',1.7,.85),3.8,-1.6,{layer:1});
  const sb=B.stand(S.scoreboard('marta-p-sb',1.5,1.15,'ORLANDO PRIDE'),1.7,-1.3,{layer:1});
  sb.add(S.flipCard('marta-p-games',1.2,.56,'18 GAMES',INK.yellow,INK.navy),0,.3,{z:.012});
  const y23=sb.flap(S.flipCard('marta-p-2023',1.2,.56,'2023',INK.teal),0,.86,{z:.02});
  const cup=B.stand(S.trophy('marta-p-cup',.6,.88),3.2,-.45,{layer:2,s:0});
  const champs=B.stand(S.banner('marta-p-champs',2.3,.36,'NWSL CHAMPIONS · 2024',INK.pink),3.2,.35,{layer:2,tab:false,s:0});
  const mates=[B.person('marta-p-mate1',2.35,-.25,1.24,{shirt:'arg',hair:'curly',skin:'#7f5138',face:'grin',layer:2}),B.person('marta-p-mate2',4.2,-.15,1.24,{shirt:'arg',hair:'long',skin:'#f1b88f',face:'grin',layer:2})];
  const walkR=B.person('marta-p-walkR',.4,1.15,1.2,{shirt:'arg',hair:'bun',hairColor:MHAIR,skin:MSKIN,face:'grin',layer:3});
  B.stand(S.grassStrip('marta-p-grass',3.4,.18,INK.grass,false),3.25,3.12,{layer:3,tab:false});
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   // March 2022: a cloud; the knee card; a plaster, never an injury.
   const gc=N?beat(t,2,3)*(1-beat(t,13.8,14.8)):0;grey.scale=gc;grey.visible=gc>.02;drops.visible=N&&t>2.8&&t<14;drops.dy=-((t*.8)%1)*.25;
   cards.forEach((c,i)=>{const s=N?beat(t,[6.2,10.4,12.2][i],[6.8,11,12.8][i]):1;c.scale=s;c.visible=s>.02;});
   const pa=N?beat(t,7,7.6):1;patch.scale=pa;
   carer.body.s=N?beat(t,10.2,11):1;carer.armR.rot=.12+1.2*(N?beat(t,11.2,12)-beat(t,15,15.8):0);
   // Healing takes many months of patience: the calendar fills, the sun and moon take turns.
   march.flip=-2.9*(N?beat(t,14.2,15):1);ticks.forEach((k,i)=>{const s=N?beat(t,15+i*.18,15.3+i*.18):1;k.scale=s;k.visible=s>.02;});
   const cyc=N?Math.sin(clamp01((t-14)/3.4)*Math.PI*2):0;sunP.dy=-.4*beat(t,0,2)+.7*Math.max(0,cyc);moonP.dy=-.8*Math.max(0,cyc);moonP.visible=cyc>.05;
   breath.visible=N&&t>14.4&&t<17.2;breath.dy=-.25+.25*beat(t,14.4,14.8);
   // 2023: she comes back and plays 18 games.
   y23.flip=-2.9*(N?beat(t,19.6,20.4):1);
   // 2024: Orlando Pride win the NWSL Championship.
   cup.s=N?beat(t,23,23.8):1;champs.s=N?beat(t,24,24.8):1;cup.rot=.05*wave(t,25,31,1.2);
   mates.forEach((m,i)=>{m.body.s=N?beat(t,22.6+i*.4,23.4+i*.4):1;m.armR.rot=.12+2.2*Math.max(N?beat(t,26+i*.3,26.6+i*.3):0,beat(A,.95,1));m.armL.rot=-.12-2.2*Math.max(N?beat(t,26.2+i*.3,26.8+i*.3):0,beat(A,.95,1));});
   // Unfold the bridge one plank at a time; small steps carry her back to the pitch.
   planks.forEach((p,i)=>{p.s=Math.max(N?beat(t,32.4+i*1.5,33.4+i*1.5):0,clamp01(A*3-i));});
   hero.body.s=Math.min(N?1-beat(t,31.2,31.9):1,1-beat(A,0,.1));
   const wl=Math.max(N?beat(t,37.8,39.8):0,beat(A,.8,.92)),wr=Math.max(N?beat(t,39.8,41.6):0,beat(A,.9,1));
   walkL.body.s=Math.max(N?beat(t,31.4,32.2)*(1-beat(t,39.7,40)):0,beat(A,0,.1)*(A<.9?1:0));walkL.body.x=lerp(-2.6,-.35,wl);walkL.body.z=lerp(1.2,1.15,wl);walkL.body.dy=.04*Math.abs(Math.sin(wl*14))*(wl>0&&wl<1?1:0);
   walkR.body.s=Math.max(N?beat(t,39.7,40):0,beat(A,.88,.92));walkR.body.x=lerp(.35,2.1,wr);walkR.body.z=lerp(1.15,.9,wr);walkR.body.dy=.04*Math.abs(Math.sin(wr*14))*(wr>0&&wr<1?1:0);
   const joy=Math.max(N?beat(t,42.4,43):0,beat(A,.97,1));walkR.armR.rot=.12+2.3*joy;walkR.armL.rot=-.12-2.3*joy;
   conf.dy=-1+1.1*Math.max(N?beat(t,26,28)*(1-beat(t,30.6,31.2))+beat(t,42.4,44):0,beat(A,.95,1));conf.visible=conf.dy>-.98;
   return N?-.7*beat(t,1.6,2.6)+1.4*beat(t,17,18)-.7*beat(t,31,32):0;
  };
 }};

/* ───────────── 6 · Cry at the beginning (girls) ───────────── */
const girls:SpreadDef={id:'girls',rest:33.6,
 left:k=>{pitchPrint(k,-5,0);chalk(k,ell(0,Z(0),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);
  k.text('17',-3.2,Z(2.45),.78,INK.yellow);k.text('WORLD CUP GOALS',-1.55,Z(2.2),.2,INK.navy,{weight:800,max:2.1});k.text('WORLD CUP 2019',-1.55,Z(2.5),.2,INK.blue,{max:2.1});},
 right:k=>{lawn(k,0,5);street(k,0,5,.8,1.9);for(const [x,z] of [[1.2,1.3],[2.2,1.45],[3.2,1.55],[4.2,1.6]] as const)k.fill(ell(x,Z(z),.3,.15),INK.yellow,.45);
  titles(k,1,'KEEP THE GAME GOING','PASS IT TO THE NEXT GIRL',INK.pink);},
 build:B=>{
  const bd=B.vfold({key:'marta-e-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.05,2.6,FANS,4);k.key(`M0 .45 Q2.25 .75 4.5 .45`,.014);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'marta-e-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);for(let i=0;i<9;i++){const x=.2+i*.5;k.fill(ell(x,1.95,.34,.46),i%2?INK.leaf:INK.green);}
    for(let i=0;i<7;i++){const x=.15+i*.62,top=1.75+((i*3)%3)*.1,b=rect(x,top,.56,2.6-top);k.fill(b,PASTEL[(i+2)%6]);k.key(b,.011);k.fill(poly([[x-.02,top],[x+.28,top-.14],[x+.58,top]]),TERRA);k.fill(rect(x+.06,top+.12,.12,.12),INK.sky);}
    k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const grey=bd.add(rainCloud('marta-e-grey',1.5,.62),'L',2.4,2.35,{out:.03}),drops=bd.add(rain('marta-e-rain',1.3,.65),'L',2.35,1.75,{out:.028});
  const bow=bd.add(S.rainbow('marta-e-bow',3.6,1.4),'R',2.25,1.2,{out:.016});
  const sunP=bd.add(S.sun('marta-e-sun',.32),'R',3.8,1.4,{out:.02});
  const quote=bd.add(S.banner('marta-e-quote',3.9,.4,'CRY AT THE BEGINNING · SMILE AT THE END',INK.blue),'R',2.25,2.45,{out:.035});
  const conf=bd.add(S.confetti('marta-e-conf',2.4,1.1,5),'R',1.6,1.4,{out:.04});
  // Left page: the record. 17 World Cup goals, then the loss to France.
  B.stand(S.floodlight('marta-e-flood',.5,1.9),-4.6,-1.15,{layer:1});
  const board=B.stand(tallyBoard('marta-e-board',2.5,1.95),-2.3,-1.05,{layer:1});
  const markers=Array.from({length:17},(_,i)=>{const [x,y]=goalSlot(i);return board.add(markerPlate(`marta-e-m${i+1}`,i+1),x,y,{anchor:'center',z:.015});});
  const record=B.stand(S.banner('marta-e-record',2.7,.4,'MOST GOALS AT WORLD CUPS',INK.pink),-2.3,.55,{layer:2,tab:false,s:0});
  B.stand(podium('marta-e-podium',1.0,.5),-3.8,1.25,{layer:3});
  const star=B.person('marta-e-star',-3.8,1.15,1.3,{shirt:'bib',hair:'bun',hairColor:MHAIR,skin:MSKIN,face:'grin',layer:3});star.body.dy=.48;
  const card=star.body.add(S.flipCard('marta-e-17',.5,.36,'17',INK.pink),0,.9,{z:.03});
  const fans=[B.person('marta-e-fan1',-1.1,1.25,1.05,{shirt:'fan',hair:'long',skin:'#d99a6c',face:'grin',layer:3}),B.person('marta-e-fan2',-.45,.7,1.0,{shirt:'casual',hair:'curly',skin:'#7f5138',face:'grin',layer:2})];
  // Right page: she speaks to the cameras, and passes the ball to the next girl in line.
  const cam=B.stand(tvCamera('marta-e-cam',1.0,1.2),1.05,-.9,{layer:1});
  const un=B.stand(S.sign('marta-e-un',1.5,.95,'UNITED NATIONS · 2018',INK.sky),4.3,-1.55,{layer:1,s:0});
  const unCard=un.add(S.flipCard('marta-e-amb',1.35,.26,'WOMEN IN SPORT',INK.pink),0,.42,{z:.012,anchor:'center'});
  const marta=B.person('marta-e-marta',2.3,-.2,1.32,{shirt:'bib',hair:'bun',hairColor:MHAIR,skin:MSKIN,face:'open',holdL:'none',layer:2});
  const mic=marta.body.add(microphone('marta-e-mic'),-.42,.8,{z:.02});
  const speech=[marta.body.add(S.bubble('marta-e-say1',.52,.44,'heart'),.5,1.65,{z:-.02}),marta.body.add(S.bubble('marta-e-say2',.52,.44,'ball'),.5,1.65,{z:-.02}),marta.body.add(S.bubble('marta-e-say3',.52,.44,'star'),.5,1.65,{z:-.02})];
  const G=[[3.0,.55],[3.7,.95],[4.35,1.4],[3.35,1.75]];
  const line=G.map(([x,z],i)=>B.person(`marta-e-g${i}`,x,z,1.02+i*.03,{shirt:['keeper','navy','casual','ger'][i] as 'keeper',hair:['bun','long','curly','long'][i] as 'bun',skin:['#d99a6c','#7f5138','#f1b88f','#b27650'][i],face:'smile',legs:i<3?'kick':undefined,layer:i<3?2:3}));
  const ball=B.stand(S.ball('marta-e-ball',.12),2.55,.05,{layer:2,tab:false});B.slot(2.55,.1,3.4,1.7);
  const dogP=B.stand(dog('marta-e-dog',.34),1.3,1.4,{layer:3});
  const at=(i:number)=>i===0?[2.55,.05]:[G[i-1][0]-.3,G[i-1][1]+.1];
  return (b:Beat)=>{const t=b.t,A=b.action,N=b.narrated;
   // 2019: her seventeenth World Cup goal. The markers count up and the card rises.
   markers.forEach((m,i)=>{m.scale=shown(b,beat(t,2+i*.18,2.3+i*.18));});
   const lift=N?beat(t,5.4,6.4)*(1-beat(t,12.6,13.4)):1;card.dy=-.55+.95*lift;card.visible=lift>.02||!N;star.armL.rot=-.12-2.3*lift;star.armR.rot=.12+2.3*lift;
   record.s=shown(b,beat(t,8,9));record.rot=.03*wave(t,9,12,1);
   fans.forEach((f,i)=>{const c=N?beat(t,6+i*.3,6.6+i*.3)*(1-beat(t,12.4,13)):0;f.armL.rot=-.12-2.2*c;f.armR.rot=.12+2.2*c;});
   // Then Brazil were knocked out: a grey cloud, rain.
   const gc=N?beat(t,12.4,13.4)*(1-beat(t,26,27)):0;grey.scale=gc;grey.visible=gc>.02;drops.visible=N&&t>13.2&&t<26;drops.dy=-((t*.8)%1)*.25;
   // She speaks to the television cameras.
   cam.rot=N?.04*pulse(t,15.4,16.4):0;const say=N?[[15.8,19.3],[19.4,24],[24,33.6]]:[];speech.forEach((s,i)=>{s.visible=N&&t>say[i][0]&&t<say[i][1];s.dy=N?-.25+.25*beat(t,say[i][0],say[i][0]+.4):0;});
   mic.visible=N?t>15.3&&t<34:false;marta.armL.rot=-.12-(N?.9*beat(t,15.3,15.9)*(1-beat(t,33.6,34.2)):0);
   // Carry on women's football, value it more; cry at the beginning so you can smile at the end.
   line.forEach((g,i)=>{g.body.s=shown(b,beat(t,19.6+i*.5,20.4+i*.5));});
   const q=N?beat(t,24.2,25.2):1;quote.scale=q;quote.visible=q>.02;
   const bw=N?beat(t,27,28.6):1;bow.scale=bw;bow.visible=bw>.02;sunP.dy=-.8*(N?beat(t,26.6,28):1);
   un.s=N?beat(t,29.6,30.4):1;const uc=N?beat(t,30.8,31.4):1;unCard.scale=uc;
   // Pass the ball to the next girl in line, and keep it going.
   const pp=Math.max(N?beat(t,34,37.4):0,A),seg=Math.min(2,Math.floor(pp*3)),f=clamp01(pp*3-seg);
   const [ax,az]=at(seg),[bx,bz]=at(seg+1);ball.x=lerp(ax,bx,f);ball.z=lerp(az,bz,f);ball.rot=-pp*14;ball.dy=Math.sin(f*Math.PI)*.1;
   line.forEach((g,i)=>{if(g.leg)g.leg.rot=.8*pulse(pp,(i+1)/3-.08,(i+1)/3+.02);});
   marta.armR.rot=.12+1.6*pulse(pp,0,.2);
   // Lift others up: everyone cheers together.
   const all=Math.max(N?beat(t,38.8,39.6):0,beat(A,.92,1));line.forEach((g,i)=>{g.armR.rot=.12+2.2*all;g.armL.rot=-.12-2.2*all*(i===3?1:.95);});
   marta.armR.rot+=2.1*all;
   conf.dy=-1+1.1*all;conf.visible=all>.02;dogP.rot=.08*wave(t,34,43,2.2);dogP.x=1.3+.3*beat(t,34,36);
   return N?-.65*beat(t,1.6,2.6)+1.3*beat(t,14.8,15.8)-.65*beat(t,38.4,39.4):(A>0?.5:0);
  };
 }};

function lawn(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,INK.grass,.6);k.dots(p,INK.leaf,.06,(x,y)=>.18+.2*Math.sin(x*1.3+y*.7));}

export const SPREADS:Record<string,SpreadDef>={village,bus,best,goals,space,girls};
