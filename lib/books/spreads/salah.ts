/**
 * The six Mohamed Salah pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/salah/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a long road, a rain cloud, a closed gate with flowers, a bench, a shirt to remember.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='salah-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
/** Both arms up (the engine swaps in the grin face). */
function cheer(p:Person,a:number,wob=0){p.armL.rot=-.12-2.25*a-wob;p.armR.rot=.12+2.25*a+wob;}
function showPart(q:Part,a:number){q.scale=a;q.visible=a>.02;}

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function street(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#d8cdb4');k.dots(p,'#9f9378',.06,(x,y)=>.14+.08*Math.sin(x*1.3+y*.7));
 for(let y=.3;y<PAGE_D;y+=.32)for(let x=x0+((y*10|0)%2)*.2;x<x1;x+=.4)k.key(`M${x} ${y} L${x+.34} ${y}`,.008,'#b3a78c');
 const kerb=rect(x0,Z(-1.0),x1-x0,.12);k.fill(kerb,INK.stone);k.key(kerb,.01,'#9f9378');}
function floor(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#cbd3d6');k.dots(p,'#7c8a93',.06,.18);for(let x=Math.ceil(x0/.64)*.64;x<x1;x+=.64)k.key(`M${x} 0 L${x} ${PAGE_D}`,.01,'#95a2aa');for(let y=.32;y<PAGE_D;y+=.64)k.key(`M${x0} ${y} L${x1} ${y}`,.01,'#95a2aa');
 const hz=rect(x0+.2,Z(1.75),x1-x0-.4,.14);k.fill(hz,INK.yellow);k.hatch(hz,INK.navy,.09,.8,.03);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function terraceRow(k:Kit,x0:number,y:number,w:number,h:number,seed=0){const n=Math.max(2,Math.round(w/.42)),hw=w/n;
 for(let i=0;i<n;i++){const x=x0+i*hw,c=['#c9765a','#b8674f','#d48a68'][(i+seed)%3],b=rect(x,y,hw,h);k.fill(b,c);k.dots(b,INK.red,.04,.2);k.key(b,.01);
  k.fill(rect(x+hw*.14,y+h*.22,hw*.3,h*.26),(i+seed)%4===1?INK.yellow:INK.sky);k.key(rect(x+hw*.14,y+h*.22,hw*.3,h*.26),.008);
  k.fill(rect(x+hw*.58,y+h*.52,hw*.26,h*.48),[INK.navy,INK.green,INK.red,INK.blue][(i*3+seed)%4]);k.key(rect(x+hw*.58,y+h*.52,hw*.26,h*.48),.008);
  k.fill(rect(x+hw*.14,y+h*.6,hw*.3,h*.24),INK.sky);k.key(rect(x+hw*.14,y+h*.6,hw*.3,h*.24),.008);
  if(i%2===0){const c2=rect(x+hw*.7,y-h*.28,hw*.16,h*.3);k.fill(c2,'#9a5a45');k.key(c2,.008);}}
 const roof=poly([[x0-.03,y+.01],[x0+w*.02,y-h*.16],[x0+w*.98,y-h*.16],[x0+w+.03,y+.01]]);k.fill(roof,'#6c7486');k.hatch(roof,INK.navy,.04,.1,.006);k.key(roof,.01);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function smallStand(k:Kit,x:number,y:number,w:number,h:number,roofC:string){const b=rect(x,y,w,h);k.fill(b,'#e9e1cc');k.key(b,.012);const roof=poly([[x-.08,y],[x+w+.08,y],[x+w,y-.14],[x,y-.14]]);k.fill(roof,roofC);k.key(roof,.012);
 for(let i=0;i<Math.round(w/.12);i++){const cx=x+.07+i*.12;k.circle(cx,y+h*.45,.04,[INK.yellow,INK.blue,INK.white,INK.pink][i%4]);k.fill(rect(cx-.045,y+h*.45+.03,.09,.06),[INK.yellow,INK.blue,INK.white,INK.pink][i%4]);}k.fill(rect(x,y+h*.72,w,h*.28),'#bdb3a0');}
function hills(k:Kit,w:number,h:number,y:number,tone:string,dot:string=INK.navy){const p=`M0 ${y} Q${w*.25} ${y-.5} ${w*.5} ${y-.15} Q${w*.75} ${y+.15} ${w} ${y-.35} L${w} ${h} L0 ${h} Z`;k.fill(p,tone);k.dots(p,dot,.05,.22);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
/** A three-flap counter on a scoreboard: flaps show labels[0..n-1] and flip away in order, revealing `final`. */
function counter(board:ReturnType<Builder['stand']>,key:string,w:number,h:number,y:number,labels:string[],final:string,color=INK.pink){
 board.add(S.flipCard(K+key+'-f',w,h,final,color),0,y,{z:.012});
 return labels.map((l,i)=>board.flap(S.flipCard(K+key+i,w,h,l,i%2?INK.blue:'#3d5da0'),0,y+h,{z:.03-i*.005}));}

const SKIN_M='#b27650',HAIR_M='#241a1f';
const PURPLE='#7a4ea3';
/** Flat-roofed village house, pale plaster with small windows and a roof-top store. */
function eHouse(k:Kit,x:number,y:number,w:number,h:number,wall:string,seed=0){const b=rect(x,y,w,h);k.fill(b,wall);k.dots(b,INK.orange,.04,.18);k.key(b,.012);k.fill(rect(x-.02,y-.04,w+.04,.06),'#c9a877');
 const n=Math.max(1,Math.round(w/.3));for(let i=0;i<n;i++){const wx=x+w*(i+.5)/n-.06,win=rect(wx,y+h*.25,.12,.14);k.fill(win,(i+seed)%3===0?INK.yellow:INK.teal);k.key(win,.008);}
 k.fill(rect(x+w*.4,y+h*.62,w*.2,h*.38),[INK.blue,INK.green,INK.red][seed%3]);k.key(rect(x+w*.4,y+h*.62,w*.2,h*.38),.008);if(seed%2===0){const st=rect(x+w*.1,y-.18,w*.3,.16);k.fill(st,'#d7b98a');k.key(st,.008);}}
const houseStand=(key:string,w:number,h:number,seed=0)=>sp(key,w,h,k=>{eHouse(k,0,h*.18,w*.55,h*.82,'#ecd3a4',seed);eHouse(k,w*.5,h*.34,w*.5,h*.66,'#e6c08f',seed+1);});
const minaret=(k:Kit,x:number,y:number,h:number)=>{const t=rect(x-.07,y,.14,h);k.fill(t,'#efe0bf');k.key(t,.01);k.fill(rect(x-.11,y+h*.3,.22,.05),'#c9a877');k.fill(poly([[x-.08,y],[x,y-.2],[x+.08,y]]),INK.teal);k.key(poly([[x-.08,y],[x,y-.2],[x+.08,y]]),.01);};
function skyline(k:Kit,w:number,y:number){const xs=[[.1,.5,'#e9c9a0'],[.55,.9,'#d8b28a'],[.95,.4,'#f0d8b0'],[1.35,1.2,'#c9a6a0'],[1.75,.7,'#e3c79a'],[2.2,1.0,'#d6b894'],[2.7,.6,'#efd6ad'],[3.1,1.3,'#bfa2a8'],[3.55,.8,'#e1c392'],[3.95,.5,'#ecd0a6']] as const;
 for(const [x,h,c] of xs){const b=rect(x,y-h,.38,h);k.fill(b,c);k.dots(b,INK.orange,.04,.15);k.key(b,.01);for(let r=0;r<Math.floor(h/.16);r++)for(let cc=0;cc<2;cc++)k.fill(rect(x+.06+cc*.16,y-h+.08+r*.16,.08,.07),(r+cc)%4===0?INK.yellow:INK.blue);}}
const clock=(key:string,s:number)=>sp(key,s,s*1.25,k=>{k.keyFill(rect(s*.46,s*.9,s*.08,s*.35),INK.brown);const c=s/2,r=s*.45;k.fill(ell(c,c,r,r),INK.white);k.dots(ell(c,c,r,r),INK.sky,.03,.2);k.key(ell(c,c,r,r),.016);
 for(let i=0;i<12;i++){const a=i/12*TAU;k.key(`M${c+Math.cos(a)*r*.78} ${c+Math.sin(a)*r*.78} L${c+Math.cos(a)*r*.92} ${c+Math.sin(a)*r*.92}`,i%3?.008:.018);}k.circle(c,c,.03,INK.navy,true);});
const hand=(key:string,len:number)=>sp(key,.05,len,k=>{const p=poly([[.025,0],[.05,len*.2],[.035,len],[.015,len],[0,len*.2]]);k.fill(p,INK.pink);k.key(p,.006);},{rim:.008});
const milestone=(key:string,label:string)=>sp(key,.5,.55,k=>{const p=`M0 .55 L0 .2 Q0 0 .25 0 Q.5 0 .5 .2 L.5 .55 Z`;k.fill(p,INK.white);k.dots(p,INK.sky,.03,.2);k.key(p,.012);k.fill(rect(0,0,.5,.12),INK.red);k.text(label,.25,.36,.1,INK.navy,{max:.44,weight:900});});
const gateArch=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.18,.16,h*.82);k.fill(p,color);k.dots(p,INK.navy,.04,.2);k.key(p,.012);}const top=rect(0,0,w,h*.22);k.fill(top,color);k.key(top,.012);k.text(label,w/2,h*.15,h*.1,INK.white,{max:w*.86,weight:900});});
const bowl=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.45} L${w} ${h*.45} Q${w*.9} ${h} ${w/2} ${h} Q${w*.1} ${h} 0 ${h*.45} Z`;k.fill(b,INK.white);k.key(b,.012);for(let i=0;i<5;i++)k.circle(w*(.18+i*.16),h*.4-(i%2)*h*.08,w*.08,[INK.grass,INK.orange,INK.red,INK.yellow,INK.leaf][i]);k.fill(rect(w*.1,h*.62,w*.8,h*.06),INK.sky);},{rim:.016});
const plan=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.012);k.fill(rect(0,0,w,h*.18),INK.blue);k.text('PLAN',w/2,h*.14,h*.11,INK.white,{max:w*.8,weight:900});for(let i=0;i<4;i++){const y=h*(.32+i*.17);k.key(`M${w*.12} ${y} l.04 .04 l.08 -.08`,.012,INK.green);k.key(`M${w*.36} ${y} L${w*.86} ${y}`,.01,INK.grey);}},{rim:.016});
const lockers=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=Math.round(w/.36);for(let i=0;i<n;i++){const b=rect(i*w/n,0,w/n-.02,h);k.fill(b,[INK.sky,INK.teal][i%2]);k.dots(b,INK.navy,.035,.2);k.key(b,.01);for(let j=0;j<3;j++)k.key(`M${i*w/n+.06} ${.12+j*.06} L${(i+1)*w/n-.08} ${.12+j*.06}`,.008);k.circle((i+1)*w/n-.08,h*.5,.02,INK.navy,true);}});
const shirtCard=(key:string,w:number,h:number,num:string,color:string,ink:string=INK.white)=>sp(key,w,h,k=>{const p=poly([[w*.3,0],[w*.7,0],[w,h*.18],[w*.88,h*.4],[w*.78,h*.34],[w*.78,h],[w*.22,h],[w*.22,h*.34],[w*.12,h*.4],[0,h*.18]]);k.fill(p,color);k.dots(p,INK.navy,.035,.2);k.key(p,.014);k.key(`M${w*.38} 0 Q${w/2} ${h*.12} ${w*.62} 0`,.014);if(num)k.text(num,w/2,h*.72,h*.36,ink,{max:w*.5,weight:900});},{rim:.02});
const rail=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [.04,w-.08])k.keyFill(rect(x,.02,.04,h),INK.grey);k.keyFill(rect(0,0,w,.05),INK.grey);k.keyFill(rect(w*.46,.05,.03,.1),INK.navy);});
const flowers=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<6;i++){const x=w*(.1+i*.16),top=h*(.2+(i%3)*.12);k.key(`M${x} ${h} Q${x+.03} ${(h+top)/2} ${x} ${top}`,.014,INK.green);const c=[INK.white,INK.yellow,INK.pink][i%3];for(let j=0;j<5;j++){const a=j/5*TAU;k.circle(x+Math.cos(a)*.04,top+Math.sin(a)*.04,.03,c);}k.circle(x,top,.022,INK.orange);}},{rim:.018});
const candle=(key:string)=>sp(key,.14,.36,k=>{const b=rect(.03,.12,.08,.24);k.fill(b,INK.white);k.key(b,.008);k.fill(`M.07 0 Q.11 .06 .07 .11 Q.03 .06 .07 0 Z`,INK.yellow);k.key(`M.07 0 Q.11 .06 .07 .11 Q.03 .06 .07 0 Z`,.006,INK.orange);},{rim:.012});
const doorFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,'#b9774f');k.key(f,.014);const o=rect(.1,.1,w-.2,h-.1);k.fill(o,INK.sky2);k.dots(o,INK.sky,.04,.4);
 const m=`M.1 ${h} L.1 ${h*.6} L${w*.35} ${h*.3} L${w*.55} ${h*.5} L${w*.75} ${h*.25} L${w-.1} ${h*.55} L${w-.1} ${h} Z`;k.fill(m,'#9aa9c2');k.fill(`M${w*.28} ${h*.37} L${w*.35} ${h*.3} L${w*.42} ${h*.37} Z`,INK.white);k.fill(`M${w*.68} ${h*.32} L${w*.75} ${h*.25} L${w*.82} ${h*.32} Z`,INK.white);k.fill(rect(.1,h*.78,w-.2,h*.22),INK.grass);k.key(o,.012);});
const speech=(key:string,w:number,h:number,glyphs:string)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.15} L${w} ${h*.62} Q${w} ${h*.76} ${w*.9} ${h*.76} L${w*.36} ${h*.76} L${w*.18} ${h} L${w*.22} ${h*.76} L${w*.1} ${h*.76} Q0 ${h*.76} 0 ${h*.62} L0 ${h*.15} Q0 0 ${w*.1} 0 Z`;k.fill(p,INK.white);k.key(p,.012);k.text(glyphs,w/2,h*.52,h*.34,INK.navy,{max:w*.84,weight:900});},{rim:.016});
const bench2=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const roof=`M0 ${h*.1} Q${w/2} -${h*.05} ${w} ${h*.1} L${w} ${h*.3} L0 ${h*.3} Z`;k.fill(roof,'#c9d6e6');k.dots(roof,INK.blue,.04,.3);k.key(roof,.012);for(const x of [0,w-.06])k.keyFill(rect(x,h*.2,.06,h*.8),INK.grey);const seat=rect(.06,h*.66,w-.12,h*.1);k.fill(seat,INK.blue);k.key(seat,.01);k.fill(rect(.06,h*.4,w-.12,h*.26),INK.blue,.35);});
const schoolPart=(key:string,w:number,h:number,part:'base'|'walls'|'roof')=>sp(key,w,h,k=>{
 if(part==='base'){const b=rect(0,h*.6,w,h*.4);k.fill(b,'#cdb58a');k.dots(b,INK.navy,.04,.2);k.key(b,.012);for(let i=0;i<5;i++)k.key(`M${w*(i+1)/6} ${h*.6} L${w*(i+1)/6} ${h}`,.008,'#8f7c58');}
 else if(part==='walls'){const b=rect(0,0,w,h);k.fill(b,'#f1dfb8');k.dots(b,INK.orange,.04,.15);k.key(b,.013);for(let i=0;i<4;i++){const win=rect(w*(.08+i*.24),h*.2,w*.14,h*.3);k.fill(win,INK.sky);k.key(win,.008);}const d=rect(w*.42,h*.6,w*.16,h*.4);k.fill(d,INK.green);k.key(d,.01);}
 else{const r=poly([[0,h],[w*.1,h*.45],[w*.9,h*.45],[w,h]]);k.fill(r,INK.teal);k.hatch(r,INK.navy,.05,.2,.008);k.key(r,.012);const s=rect(w*.25,0,w*.5,h*.45);k.fill(s,INK.white);k.key(s,.012);k.text('SCHOOL',w/2,h*.33,h*.24,INK.navy,{max:w*.46,weight:900});}});
const hospital=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.013);k.fill(rect(0,h*.2,w,h*.08),INK.teal);const s=ell(w/2,h*.14,h*.13,h*.13);k.fill(s,INK.teal);k.key(s,.01);k.text('H',w/2,h*.2,h*.16,INK.white,{weight:900});
 for(let i=0;i<3;i++)k.fill(rect(w*(.12+i*.28),h*.42,w*.18,h*.18),INK.sky);k.fill(rect(w*.4,h*.7,w*.2,h*.3),INK.teal);});

/* ───────────── 1 · A village boy (village) ───────────── */
const village:SpreadDef={id:'village',rest:21.1,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,INK.sand);k.dots(p,INK.orange,.06,(x,y)=>.12+.08*Math.sin(x*1.4+y));const lane=`M-5 ${Z(.7)} L0 ${Z(.5)} L0 ${Z(1.7)} L-5 ${Z(1.9)} Z`;k.fill(lane,'#e3c48c');k.key(`M-5 ${Z(.7)} L0 ${Z(.5)} M-5 ${Z(1.9)} L0 ${Z(1.7)}`,.012,'#b8955e');
  footprints(k,-4.2,Z(1.4),-.6,Z(1.1),10,'#9b7a4a');k.text('NAGRIG',-2.5,Z(2.62),.5,INK.teal,{max:3.6});k.text('A VILLAGE IN THE NORTH OF EGYPT',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#e8cf96');k.dots(p,INK.orange,.06,.12);const f=rect(.6,Z(-1.9),4.2,3.3);k.fill(f,INK.grass,.75);k.dots(f,INK.leaf,.05,.3);k.key(f,.03,INK.white);chalk(k,`M2.7 ${Z(-1.9)} L2.7 ${Z(1.4)}`);chalk(k,ell(2.7,Z(-.25),.55,.55));
  const lane=`M0 ${Z(.5)} L.6 ${Z(.45)} L.6 ${Z(1.65)} L0 ${Z(1.7)} Z`;k.fill(lane,'#e3c48c');
  k.text('AGED 12',2.5,Z(2.62),.46,INK.pink,{max:3.4});k.text('ITTIHAD BASYOUN, THEN TANTA',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'v-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a6',INK.orange,y=>.45-y/3*.45);minaret(k,3.6,.9,1.2);eHouse(k,.2,1.3,1.0,.8,'#ecd3a4',1);eHouse(k,1.3,1.1,.9,1.0,'#e8c797',2);eHouse(k,2.3,1.4,1.1,.7,'#f0dab0',0);eHouse(k,3.3,1.5,1.0,.6,'#e6c08f',3);
    k.fill(rect(0,2.1,4.5,.9),'#e8cf96');k.dots(rect(0,2.1,4.5,.9),INK.orange,.05,.15);k.key('M0 2.1 L4.5 2.1',.014);}},
   {key:K+'v-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a6',INK.sky,y=>.5-y/3*.5);const fld=rect(0,1.5,4.5,.6);k.fill(fld,INK.leaf);for(let i=0;i<9;i++)k.key(`M${i*.5} 1.5 L${i*.5+.3} 2.1`,.01,INK.green);const canal=rect(0,2.1,4.5,.16);k.fill(canal,INK.blue);k.dots(canal,INK.navy,.04,.3);
    for(let i=0;i<5;i++){const x=.4+i*.9;k.key(`M${x} 1.5 L${x} 1.0`,.03,INK.wood);k.fill(ell(x,.95,.22,.12),INK.green);}k.fill(rect(0,2.26,4.5,.74),'#e8cf96');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'v-sun',.4),'R',3.5,1.6,{out:.012}),birds=bd.add(S.birds(K+'v-birds',.9,.35),'L',1.8,2.5,{out:.02});
  const houses=B.stand(houseStand('v-houses',2.2,1.5,0),-3.6,-1.38,{layer:1});
  B.stand(S.tree(K+'v-palm1',.9,1.9,'palm'),-1.35,-1.9,{layer:1});B.stand(S.tree(K+'v-palm2',.8,1.6,'palm'),4.6,-1.3,{layer:1});
  const mum=B.person(K+'v-mum',-3.9,-.4,1.62,{shirt:'coach',hair:'long',adult:true,skin:SKIN_M,hairColor:HAIR_M,face:'smile',layer:2});
  const dad=B.person(K+'v-dad',-3.1,-.3,1.74,{shirt:'casual',hair:'short',adult:true,skin:SKIN_M,hairColor:HAIR_M,face:'smile',layer:2});
  const hosp=B.stand(S.flipCard(K+'v-hosp',1.1,.34,'HOSPITAL OFFICE',INK.teal,INK.white),-2.0,-.9,{layer:2,s:0});
  const M=B.person(K+'v-mo',-3.5,1.35,1.15,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,legs:'kick',face:'grin',layer:3});
  const kids=[[-2.2,.75,'short','#7f5138'],[-1.2,1.45,'bun','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`v-k${i}`,x as number,z as number,1.1,{shirt:i?'bib':'ger',hair:h as 'short',skin:s as string,legs:'kick',face:'grin',layer:3}));
  const stonePlate=(key:string)=>sp(key,.26,.2,k=>{const p=blob([[.02,.2],[0,.1],[.08,.02],[.18,0],[.26,.08],[.24,.2]]);k.fill(p,'#b5a58a');k.dots(p,INK.navy,.03,.25);k.key(p,.01);},{rim:.012});
  const stones=[B.stand(stonePlate('v-st1'),.3,1.0,{layer:3,s:0,tab:false}),B.stand(stonePlate('v-st2'),.3,1.65,{layer:3,s:0,tab:false})];
  const sign=B.stand(S.sign(K+'v-sign',1.2,1.25,'LOCAL CLUB'),1.3,-1.7,{layer:1,s:0});
  sign.add(lineCard('v-tanta',1.0,.42,['TANTA'],INK.yellow),0,.25,{z:.012});const basy=sign.flap(lineCard('v-basy',1.0,.42,['ITTIHAD BASYOUN'],INK.teal,INK.white),0,.67,{z:.028});
  const MT=B.person(K+'v-team',2.2,.6,1.2,{shirt:'bib',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'11',legs:'kick',face:'smile',layer:3});
  const team=[[3.3,-.2,'short','#d99a6c'],[4.1,.7,'curly','#7f5138']].map(([x,z,h,s],i)=>B.person(K+`v-t${i}`,x as number,z as number,1.24,{shirt:'bib',hair:h as 'short',skin:s as string,face:'smile',layer:2}));
  B.stand(S.goal(K+'v-goal',1.3,.7),3.0,-1.55,{layer:1});
  const ball=ballPair(B,'v-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.1):b.t;
   sun.dy=.4*beat(t,0,2.2);birds.dx=1.2*beat(t,2,20);birds.dy=.06*wave(t,2,20,.8);
   houses.s=beat(t,2,3);mum.body.s=beat(t,11.8,12.6);dad.body.s=beat(t,12.3,13.1);hosp.s=beat(t,14,14.8)*(1-beat(t,20.6,21));
   dad.armR.rot=.12+1.4*beat(t,13.4,14)-1.4*beat(t,16,16.6);mum.armL.rot=-.12-1.6*beat(t,32.4,33)-.3*wave(t,33,35.8,1.3);
   M.body.s=beat(t,4,5);kids.forEach((p,i)=>{p.body.s=beat(t,17+i*.5,17.8+i*.5);});
   stones.forEach(s=>{s.s=beat(t,18.6,19.4);});
   // Street football: passes along the lane, then the roll down the street between the stone goalposts.
   const roll=Math.max(beat(t,21.8,23.4),manual?beat(act,.05,.8):0);
   let bx:number,bz:number;
   if(t<17.2)[bx,bz]=[-3.1,1.4];
   else if(t<21.6)[bx,bz]=track(t,[[17.2,-3.1,1.4],[18.2,-3.1,1.4],[18.8,-1.8,.85],[19.4,-1.8,.85],[20.1,-.85,1.45],[20.6,-.85,1.45],[21.4,-3.1,1.4]]);
   else if(t<23.6||manual)[bx,bz]=[-3.1+3.55*roll,1.4-.1*roll];
   else [bx,bz]=track(t,[[23.6,.45,1.3],[25.4,.45,1.3],[26.4,2.4,.7],[29,2.4,.7],[29.8,3.7,-.1],[31.4,3.7,-.1],[32.4,2.4,.7]]);
   ball(bx,bz,0,t>4.5);
   M.leg!.rot=-1*Math.max(maxOf([18.2,21.4,21.8].map(a=>pulse(t,a-.3,a+.3))),manual?pulse(act,0,.15):0);kids[0].leg!.rot=-1*pulse(t,19.1,19.7);kids[1].leg!.rot=-1*pulse(t,20.3,20.9);
   cheer(M,Math.max(beat(t,23.2,23.9)*(1-beat(t,25,25.6)),manual?beat(act,.75,1):0,beat(t,32.4,33.2)),.2*wave(t,33.2,35.8,1.3));
   // A local team at twelve, a year later Tanta.
   sign.s=beat(t,24,24.8);basy.flip=-3.2*beat(t,28.2,29);MT.body.s=beat(t,25,25.8);team.forEach((p,i)=>{p.body.s=beat(t,25.4+i*.4,26.2+i*.4);p.armR.rot=.12+2.1*beat(t,32.6+i*.3,33.2+i*.3);});
   MT.leg!.rot=-1*maxOf([25.4,29,32.4].map(a=>pulse(t,a-.3,a+.3)));
   return b.narrated?-.4*beat(t,1.8,3)+.4*beat(t,23.4,24.4)+.35*beat(t,24.4,25.4)-.35*beat(t,31.6,32.6):0;
  };
 }};

/* ───────────── 2 · The long journey (journey) ───────────── */
const ROAD=[[-4.1,1.5],[-2.6,.9],[-1.2,1.2],[1.1,1.0],[2.6,.5],[3.4,-.6]];
const roadAt=(u:number)=>{const f=clamp01(u)*(ROAD.length-1),i=Math.min(ROAD.length-2,Math.floor(f)),v=f-i;return [ROAD[i][0]+(ROAD[i+1][0]-ROAD[i][0])*v,ROAD[i][1]+(ROAD[i+1][1]-ROAD[i][1])*v];};
/** The road printed as overlapping ink dots (colour drum), clipped to one page. */
function roadPrint(k:Kit,side:'L'|'R'){for(let i=0;i<ROAD.length-1;i++){const [x0,z0]=ROAD[i],[x1,z1]=ROAD[i+1],L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/.04);
 for(let j=0;j<=n;j++){const u=j/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(side==='L'?x>0:x<0)continue;k.fill(ell(x,Z(z),.19,.19),'#7a7680');}
 for(let j=0;j<n;j+=6){const u=j/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(side==='L'?x>-.05:x<.05)continue;k.fill(ell(x,Z(z),.07,.025),INK.yellow);}}}
const journey:SpreadDef={id:'journey',rest:19.6,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#e8cf96');k.dots(p,INK.orange,.06,.12);for(let i=0;i<4;i++){const f=rect(-4.9+i*1.2,Z(-2.2),1.1,1.0);k.fill(f,i%2?INK.leaf:INK.grass,.8);k.dots(f,INK.green,.05,.3);}
  roadPrint(k,'L');k.text('NAGRIG',-2.5,Z(2.62),.46,INK.teal,{max:3.4});k.text('MORE THAN 150 KILOMETRES TO CAIRO',-2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#ddd3c0');k.dots(p,'#8f8367',.06,.12);roadPrint(k,'R');
  const f=rect(3.0,Z(-2.1),1.8,1.3);k.fill(f,INK.grass,.8);k.dots(f,INK.leaf,.05,.3);
  k.text('CAIRO',2.5,Z(2.62),.46,INK.blue,{max:3.4});k.text('AL MOKAWLOON · AGED 14',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'j-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.5);const fld=rect(0,1.6,4.5,.5);k.fill(fld,INK.leaf);k.dots(fld,INK.green,.05,.3);
    for(let i=0;i<6;i++){const x=.3+i*.75;k.key(`M${x} 1.65 L${x} 1.1`,.03,INK.wood);k.fill(ell(x,1.05,.22,.12),INK.green);}eHouse(k,.2,1.3,.8,.5,'#ecd3a4',1);minaret(k,1.2,1.0,.8);k.fill(rect(0,2.1,4.5,.9),'#e8cf96');}},
   {key:K+'j-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a6',INK.sky,y=>.5-y/3*.5);skyline(k,4.5,2.0);const nile=rect(0,2.0,4.5,.18);k.fill(nile,INK.blue);k.dots(nile,INK.navy,.04,.3);k.fill(rect(0,2.18,4.5,.82),'#ddd3c0');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'j-sun',.36),'L',3.4,1.1,{out:.012}),moon=bd.add(sp('j-moon',.4,.4,k=>{k.fill(`M.28 .02 A.19 .19 0 1 0 .38 .3 A.15 .15 0 1 1 .28 .02 Z`,INK.yellow);k.key(`M.28 .02 A.19 .19 0 1 0 .38 .3 A.15 .15 0 1 1 .28 .02 Z`,.012);},{rim:.02}),'L',2.4,1.9,{out:.015});
  const night=bd.add(S.stars(K+'j-stars',2.6,.8,10),'L',.9,2.2,{out:.03});
  const home=B.stand(houseStand('j-home',1.6,1.2,2),-4.1,-1.4,{layer:1});
  const school=B.stand(S.sign(K+'j-school',1.1,1.2,'SCHOOL'),-1.7,-1.6,{layer:1});const miss=school.flap(S.flipCard(K+'j-miss',.8,.34,'MISSED',INK.pink),0,.58,{z:.02});miss.scale=0;
  const clk=B.stand(clock('j-clock',.8),-.85,-.2,{layer:2,s:0});const hnd=clk.arm(hand('j-hand',.3),0,.8*1.25-.4,{z:.02});
  const stones=['50 KM','100 KM','150 KM'].map((l,i)=>B.stand(milestone(`j-ms${i}`,l),[-2.1,.55,3.0][i],[.45,.45,-.5][i],{layer:2,s:0}));
  const gate=B.stand(gateArch('j-gate',1.9,1.5,'AL MOKAWLOON',INK.yellow),3.6,-1.2,{layer:1,s:0});
  const scout=B.person(K+'j-scout',1.5,-.9,1.7,{shirt:'coach',hair:'cap',adult:true,skin:SKIN_M,face:'open',layer:1});
  const star=scout.body.add(S.bubble(K+'j-star',.55,.46,'star'),.5,scout.h*.95,{z:-.02});
  const other=B.person(K+'j-other',2.4,.1,1.15,{shirt:'ger',hair:'short',skin:'#d99a6c',legs:'kick',face:'smile',layer:2});
  const MR=B.person(K+'j-mr',3.4,.7,1.15,{shirt:'bib',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,legs:'kick',face:'grin',layer:3});
  const ML=B.person(K+'j-ml',-3.6,1.3,1.18,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,face:'smile',holdR:'suitcase',layer:3});
  const MT=B.person(K+'j-mt',1.2,1.0,1.18,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,face:'smile',holdR:'suitcase',layer:3});
  const zzz=ML.body.add(S.bubble(K+'j-zzz',.5,.42,'dots'),.45,ML.h*.95,{z:-.02});
  const ball=B.stand(S.ball(K+'j-ball',.11),2.7,.35,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   // The scout came for another child and noticed Mohamed (1.9–10.6).
   scout.body.s=beat(t,2.2,3);other.body.s=beat(t,2.6,3.4);MR.body.s=beat(t,4.6,5.4)*(1-beat(t,19.6,20.2));
   scout.body.yaw=-.4*beat(t,3.2,3.8)*(1-beat(t,6.4,7))+.35*beat(t,6.4,7);showPart(star,beat(t,7.2,7.9)*(1-beat(t,12,12.6)));
   scout.armR.rot=.12+1.6*beat(t,7.4,8)-1.6*beat(t,11,11.6);
   const [bx,bz]=track(t,[[0,2.7,.35],[4,2.7,.35],[4.6,3.2,.65],[5.6,3.2,.65],[6.3,3.6,-.5],[7,3.6,-.5],[7.6,3.2,.65],[8.8,3.2,.65],[9.6,4.1,-.8]]);ball.x=bx;ball.z=bz;ball.rot=-bx*5;ball.visible=t>2.6&&t<19.6;
   other.leg!.rot=-1*pulse(t,3.8,4.4);MR.leg!.rot=-1*maxOf([5.6,8.8].map(a=>pulse(t,a-.3,a+.3)));
   // Al Mokawloon in Cairo, 150 km away (10.6–19.8).
   gate.s=beat(t,11,11.8);stones.forEach((q,i)=>{q.s=Math.max(beat(t,13.4+i*1.4,14+i*1.4),manual?beat(act,i/3,i/3+.15):0);});home.s=beat(t,16.6,17.4)*.999+.001;
   // The road: three hours each time, missing school; home at night, asleep, up early again.
   const u=manual?act:track(t,[[0,0],[22.2,0],[27.2,1],[27.8,1],[28.6,0]])[0];
   const [rx,rz]=roadAt(u);const onL=rx<0;ML.body.x=onL?rx:-.3;ML.body.z=onL?rz:1.2;MT.body.x=onL?.4:rx;MT.body.z=onL?1.0:rz;
   ML.body.s=beat(t,16.8,17.6)*(onL?1:0);MT.body.s=onL?0:1;ML.body.yaw=t>27.8&&t<28.6&&!manual?Math.PI:0;
   ML.armL.rot=-.12-.35*wave(t,22.2,27,1.6);MT.armL.rot=-.12-.35*wave(t,22.2,27,1.6)-(manual?2.2*beat(act,.9,1):0);
   clk.s=Math.max(beat(t,22,22.8),manual?beat(act,0,.2):0);hnd.rot=Math.PI+TAU*3*(manual?act:beat(t,22.4,27.2));
   miss.scale=Math.max(beat(t,24.8,25.4),manual?beat(act,.2,.35):0);miss.visible=miss.scale>.02;miss.flip=-.2*wave(t,25.4,27.4,.8);
   const nt=manual?0:beat(t,28,29)*(1-beat(t,32.6,33.6));showPart(moon,nt);showPart(night,nt);sun.dy=-.9*nt+.3*beat(t,0,2);showPart(sun,1-nt);showPart(zzz,manual?0:beat(t,29.6,30.2)*(1-beat(t,32.6,33.2)));
   ML.armR.rot=.12+1.7*beat(t,34.8,35.4);
   return b.narrated?.45*beat(t,1.6,2.6)-.9*beat(t,15.6,16.6)+.45*beat(t,24.8,26)-.45*beat(t,27.6,28.4)+.45*beat(t,34,35):0;
  };
 }};

/* ───────────── 3 · Tears after the game (tears) ───────────── */
const tears:SpreadDef={id:'tears',rest:32.6,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#cfe0de');for(let x=-5;x<0;x+=.4)k.key(`M${x} 0 L${x} ${PAGE_D}`,.01,'#9fb8b6');for(let y=0;y<PAGE_D;y+=.4)k.key(`M-5 ${y} L0 ${y}`,.01,'#9fb8b6');k.dots(p,INK.teal,.06,.1);
  k.text('DRESSING ROOM',-2.5,Z(2.62),.4,INK.teal,{max:4});k.text('AL MOKAWLOON · 2010',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.1),1.0,1.0));chalk(k,`M3.2 ${Z(-2.0)} L3.2 ${Z(-.9)} L5 ${Z(-.9)}`);
  k.text('FIRST GOAL',2.5,Z(2.62),.46,INK.yellow,{max:3.6});k.text('CHRISTMAS DAY 2010',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#e3ece8',INK.teal,y=>.18);for(let i=0;i<8;i++){k.keyFill(rect(.3+i*.52,.9,.04,.1),INK.grey);const s=poly([[.2+i*.52,1.0],[.44+i*.52,1.0],[.48+i*.52,1.12],[.42+i*.52,1.1],[.42+i*.52,1.45],[.22+i*.52,1.45],[.22+i*.52,1.1],[.16+i*.52,1.12]]);k.fill(s,i%2?INK.yellow:INK.white);k.key(s,.008);}
    k.fill(rect(0,2.0,4.5,1.0),'#b7cfcc');k.key('M0 2 L4.5 2',.014);}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.3,[INK.yellow,INK.white,INK.red,INK.yellow,INK.sky],2);lightRig(k,.8,.5);lightRig(k,3.7,.5);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'t-ban',2.6,.38,'EGYPTIAN PREMIER LEAGUE',INK.red),'R',1.55,2.8,{out:.02});
  const sun=bd.add(S.sun(K+'t-sun',.36),'L',3.4,2.4,{out:.012});
  B.stand(lockers('t-lockers',2.2,1.3),-3.5,-1.36,{layer:1});
  B.stand(S.bench(K+'t-bench',1.4,.45),-2.2,-.7,{layer:2});
  const coach=B.person(K+'t-coach',-4.2,-.1,1.72,{shirt:'coach',hair:'short',adult:true,skin:SKIN_M,hairColor:HAIR_M,face:'smile',layer:2});
  const M=B.person(K+'t-mo',-2.3,.9,1.25,{shirt:'bib',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'11',face:'sad',layer:3});
  const food=B.stand(bowl('t-bowl',.6,.4),-1.2,.1,{layer:2,s:0}),planP=B.stand(plan('t-plan',.6,.75),-.6,-.5,{layer:2,s:0});
  const cloud=M.body.add(stormCloud('t-cloud',.9,.46),0,M.h*1.12,{anchor:'center',z:.03});const rainD=M.body.add(S.drops(K+'t-rain',.7,.36),0,M.h*.9,{anchor:'center',z:.025});
  const tearsP=M.body.add(sp('t-tears',.2,.14,k=>{for(const x of [.04,.16])k.fill(`M${x} 0 Q${x+.03} .07 ${x} .1 Q${x-.03} .07 ${x} 0 Z`,INK.sky);},{rim:.008}),0,M.h*.72,{anchor:'center',z:.02});
  const MR=B.person(K+'t-mr',1.6,.7,1.3,{shirt:'bib',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'11',legs:'kick',face:'smile',layer:3});
  const mates=[[2.7,-.2,'short','#d99a6c'],[.9,-.9,'long','#7f5138']].map(([x,z,h,s],i)=>B.person(K+`t-m${i}`,x as number,z as number,1.28,{shirt:'bib',hair:h as 'short',skin:s as string,face:'smile',layer:2}));
  const keeper=B.person(K+'t-keep',4.2,-1.08,1.3,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  B.stand(S.goal(K+'t-goal',1.6,.85),4.2,-1.34,{layer:1});
  const goalCard=B.stand(S.flipCard(K+'t-goalcard',1.2,.38,'FIRST GOAL!',INK.pink),3.3,1.5,{layer:3,s:0});
  const miss=[0,1,2].map(i=>B.stand(S.icon(K+`t-x${i}`,.26,'cross'),2.2+i*.34,1.9,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'t-ball',.12),2.0,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,32.6):b.t;
   const lift=Math.max(beat(t,33,34.2),manual?beat(act,0,.6):0);
   // Moved up at fifteen; still growing: a special diet and plan (2.1–14.8).
   coach.body.s=beat(t,2.4,3.2);M.body.s=beat(t,3.0,3.8);coach.armR.rot=.12+1.5*beat(t,4,4.6)-1.5*beat(t,8.8,9.4);
   food.s=beat(t,10.2,11);planP.s=beat(t,11.2,12);
   // Playing in the league (14.8); struggling to score (21.4): missed chances.
   MR.body.s=beat(t,15,15.8);mates.forEach((m,i)=>{m.body.s=beat(t,15.4+i*.4,16.2+i*.4);});keeper.body.s=beat(t,15.8,16.6);ban.dy=.04*wave(t,15,43,.6);
   miss.forEach((q,i)=>{q.s=beat(t,22+i*.7,22.5+i*.7)*(1-lift);});
   const shots=[22,22.7,23.4];let bx=2.0,bz=.8;for(const a of shots)if(t>=a&&t<a+.7){const u=(t-a)/.6;bx=2.0+2.6*smooth(u);bz=.8-2.6*smooth(u)+.6;}
   // Crying after matches (24.8), the manager's support (28.9), the cloud lifts, first goal (33).
   const sad=beat(t,21.6,22.6)*(1-lift);showPart(cloud,sad);cloud.dy=M.h*1.12+1.2*lift;showPart(rainD,sad);rainD.dy=M.h*.9-.06*((t*1.6)%1);
   showPart(tearsP,beat(t,25,25.6)*(1-beat(t,29.4,30)));
   coach.body.x=-4.2+1.2*beat(t,28.9,30.4);coach.armR.rot+=1.3*beat(t,30.4,31)*(1-lift);
   showPart(sun,Math.max(lift,0));sun.dy=-.9+.9*lift;
   const g=manual?beat(act,.5,.8):beat(t,34.4,35.2);if(g>0){bx=2.0+1.55*g;bz=.8-2.05*g;}
   ball.x=bx;ball.z=bz;ball.rot=-bx*5;ball.visible=t>15.2;
   MR.leg!.rot=-1*Math.max(maxOf([...shots,34.4].map(a=>pulse(t,a-.3,a+.3))),manual?pulse(act,.4,.6):0);
   keeper.body.rot=.7*Math.max(maxOf([22.4,23.1,23.8].map(a=>pulse(t,a,a+.6))),pulse(t,34.8,36),manual?pulse(act,.7,1):0);
   goalCard.s=Math.max(beat(t,35.2,36),manual?beat(act,.8,1):0);
   cheer(MR,Math.max(beat(t,35.2,36),manual?beat(act,.8,1):0),.2*wave(t,36,43,1.3));mates.forEach((m,i)=>cheer(m,beat(t,35.6+i*.3,36.2+i*.3)));
   M.armL.rot=-.12-1.4*beat(t,38,38.6);
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,14.4,15.4)+.45*beat(t,15.4,16.2)-.45*beat(t,24.2,25)-.45*beat(t,25,25.8)+.45*beat(t,33.4,34.4):0;
  };
 }};

/* ───────────── 4 · A new country (basel) ───────────── */
const basel:SpreadDef={id:'basel',rest:17.5,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#d9d2c2');k.dots(p,'#8f8367',.06,.14);k.text('PORT SAID · 2012',-2.5,Z(2.62),.4,INK.navy,{max:4});k.text('THE LEAGUE WAS STOPPED',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.1),1.0,1.0));
  k.text('BASEL · SWITZERLAND',2.5,Z(2.62),.34,INK.red,{max:4.2});k.text('SWISS LEAGUE CHAMPIONS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b9c0d4','#7c86a3',y=>.35-y*.05);const st=`M0 2.3 L0 1.2 L4.5 1.0 L4.5 2.3 Z`;k.fill(st,'#9aa3b8');for(let r=0;r<6;r++)k.key(`M0 ${1.3+r*.17} L4.5 ${1.1+r*.2}`,.012,'#7c86a3');k.key(st,.012);k.fill(rect(0,2.3,4.5,.7),'#c2bba9');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const m=`M0 1.6 L.8 .7 L1.3 1.1 L2.1 .4 L2.9 1.0 L3.5 .6 L4.5 1.4 L4.5 2.0 L0 2.0 Z`;k.fill(m,'#9aa9c2');k.dots(m,INK.navy,.05,.2);k.key(m,.012);
    for(const [x,y] of [[.8,.7],[2.1,.4],[3.5,.6]] as const)k.fill(poly([[x-.2,y+.24],[x,y],[x+.2,y+.24]]),INK.white);const river=rect(0,2.0,4.5,.2);k.fill(river,INK.blue);k.dots(river,INK.navy,.04,.3);smallStand(k,1.4,1.55,1.8,.42,INK.red);k.fill(rect(0,2.2,4.5,.8),INK.grass);}},-3.05,1.22);
  const cloud=bd.add(stormCloud('b-cloud',1.3,.62),'L',2.2,2.2,{out:.03});
  const sun=bd.add(S.sun(K+'b-sun',.36),'R',3.9,2.1,{out:.012}),birds=bd.add(S.birds(K+'b-birds',.9,.35),'R',1.6,2.5,{out:.02});
  const gateL=B.stand(sp('b-gate',2.0,1.2,k=>{for(let i=0;i<=10;i++)k.keyFill(rect(i*.19,.1,.04,1.1),INK.navy);k.keyFill(rect(0,.3,2,.05),INK.navy);k.keyFill(rect(0,.95,2,.05),INK.navy);const s=rect(.5,.45,1.0,.3);k.fill(s,INK.white);k.key(s,.01);k.text('CLOSED',1.0,.66,.16,INK.navy,{weight:900});}),-2.8,-1.6,{layer:1,s:0});
  const flw=[B.stand(flowers('b-fl1',.8,.45),-3.5,-.9,{layer:2,s:0}),B.stand(flowers('b-fl2',.7,.4),-2.1,-.85,{layer:2,s:0})];
  const cands=[-3.0,-2.75,-2.5].map((x,i)=>B.stand(candle(`b-c${i}`),x,-.7,{layer:2,s:0,tab:false}));
  const M=B.person(K+'b-mo',-2.0,1.1,1.36,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,face:'open',holdR:'suitcase',layer:3});B.slot(-3.2,1.3,-.9,1.3);
  const frame=B.stand(doorFrame('b-frame',1.2,1.7),.95,-.3,{layer:2});const door=frame.flap(sp('b-door',1.0,1.6,k=>{const d=rect(0,0,1.0,1.6);k.fill(d,INK.red);k.dots(d,INK.navy,.04,.2);k.key(d,.014);k.fill(rect(.15,.15,.7,.5),'#c54a3e');k.key(rect(.15,.15,.7,.5),.01);k.fill(rect(.15,.8,.7,.6),'#c54a3e');k.key(rect(.15,.8,.7,.6),.01);k.circle(.84,.9,.04,INK.gold);k.text('SWITZERLAND',.5,.46,.1,INK.white,{max:.64,weight:900});}),-.5,0,{anchor:'bl',axis:'y',z:.012});
  const MB=B.person(K+'b-mb',1.9,.8,1.36,{shirt:'navy',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'22',face:'smile',layer:3});
  const q=MB.body.add(speech('b-q',.45,.4,'?'),.42,MB.h*.98,{z:-.02});
  const mates=[[3.1,.0,'short','#f1b88f'],[4.2,.8,'long','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`b-m${i}`,x as number,z as number,1.32,{shirt:'navy',hair:h as 'short',skin:s as string,face:'smile',layer:2}));
  const talk=mates.map((m,i)=>m.body.add(speech(`b-talk${i}`,.62,.46,'. . .'),-.4,m.h*.98,{z:-.02}));
  const star=B.stand(sp('b-star',.9,1.1,k=>{const b=rect(0,0,.9,1.1);k.fill(b,INK.white);k.key(b,.013);const st=poly(Array.from({length:10},(_,j)=>[.45+Math.cos(j*.628-1.57)*(j%2?.12:.3),.45+Math.sin(j*.628-1.57)*(j%2?.12:.3)]));k.fill(st,INK.yellow);k.key(st,.01);}),3.7,-1.38,{layer:1,s:0});
  const cup=B.stand(S.trophy(K+'b-cup',.55,.95),2.5,-1.5,{layer:1,s:0});const champ=B.stand(S.flipCard(K+'b-champ',1.3,.38,'CHAMPIONS',INK.yellow,INK.navy),3.4,1.9,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.5):b.t;
   // Port Said: a closed gate, flowers and candles to remember (1.9–15.2), handled gently.
   gateL.s=beat(t,2.2,3.2);flw.forEach((f,i)=>{f.s=beat(t,5.4+i*.6,6.2+i*.6);});cands.forEach((c,i)=>{c.s=beat(t,6.6+i*.4,7.2+i*.4);});
   showPart(cloud,beat(t,2,3)*(1-Math.max(beat(t,30,32),manual?beat(act,.5,1):0)));
   M.body.s=beat(t,11,11.8);M.body.x=-2.0+.8*Math.max(beat(t,15.4,17),manual?beat(act,0,.3):0);
   // Open the door: Switzerland.
   const open=Math.max(beat(t,17.9,19),manual?beat(act,.1,.6):0);door.flip=-1.9*open;
   MB.body.s=Math.max(beat(t,19.2,20),manual?beat(act,.5,.9):0);M.body.s*=1-Math.max(beat(t,19,19.6),manual?beat(act,.45,.7):0);
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,20+i*.5,20.8+i*.5),manual?beat(act,.7,1):0);});
   // Hard to settle: a language he did not speak; replacing a well-known player.
   talk.forEach((q2,i)=>{showPart(q2,beat(t,25.2+i*.8,25.8+i*.8)*(1-beat(t,29.6,30.2)));});showPart(q,beat(t,26.6,27.2)*(1-beat(t,29.6,30.2)));
   star.s=beat(t,27.8,28.6);
   // Champions in the first season.
   cup.s=beat(t,30,30.8);champ.s=beat(t,30.4,31.2);cheer(MB,beat(t,30.6,31.4),.2*wave(t,31.4,39,1.3));mates.forEach((m,i)=>cheer(m,beat(t,30.8+i*.3,31.6+i*.3)));
   showPart(sun,beat(t,19,20)*.999+.001);birds.dx=1.1*beat(t,31,39);birds.visible=t>30.8;
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14.6,15.6)+.45*beat(t,19.4,20.4)-.45*beat(t,32.6,33.6):0;
  };
 }};

/* ───────────── 5 · Left on the bench (bench) ───────────── */
const bench:SpreadDef={id:'bench',rest:19.4,
 left:k=>{pitch(k,-5,0,'#7fa77a','#4f7f6a',.85);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(.1),1.0,1.0));
  k.text('LONDON · 2014',-2.5,Z(2.62),.42,INK.blue,{max:3.8});k.text('ONLY THREE PREMIER LEAGUE GAMES',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.1),1.0,1.0));
  k.text('FIORENTINA, THEN ROMA',2.5,Z(2.62),.3,PURPLE,{max:4.4});k.text('ROMA PLAYER OF THE SEASON · 15 GOALS',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'n-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c3cad8','#7c86a3',y=>.35-y*.05);for(let i=0;i<7;i++){const x=.2+i*.62,h=.5+((i*7)%4)*.2,b=rect(x,1.9-h,.5,h);k.fill(b,'#9aa3b8');k.key(b,.01);for(let r=0;r<Math.floor(h/.15);r++)k.fill(rect(x+.08,1.9-h+.06+r*.15,.34,.06),r%3?INK.sky2:INK.yellow);}
    crowd(k,4.5,1.9,2.5,[INK.blue,INK.white,INK.blue,INK.sky],2);k.fill(rect(0,2.5,4.5,.5),'#7fa77a');}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a6',INK.orange,y=>.45-y/3*.45);hills(k,4.5,3,1.5,'#b9c98a',INK.green);
    const dome=`M.6 1.6 L.6 1.1 Q.95 .5 1.3 1.1 L1.3 1.6 Z`;k.fill(dome,'#d9784f');k.hatch(dome,INK.navy,.05,1.4,.008);k.key(dome,.012);k.fill(rect(.5,1.5,.9,.3),'#efe0bf');k.key(rect(.5,1.5,.9,.3),.01);
    const col=`M2.6 1.8 L2.6 1.0 Q3.3 .75 4.0 1.0 L4.0 1.8 Z`;k.fill(col,'#e3c79a');k.key(col,.012);for(let r=0;r<3;r++)for(let c=0;c<6;c++){const a=rect(2.7+c*.21,1.08+r*.24,.12,.16);k.fill(a,'#9b7a4a');}
    for(let i=0;i<4;i++)k.fill(ell(1.7+i*.25,1.55,.06,.3),INK.green);k.fill(rect(0,1.8,4.5,1.2),INK.grass);k.dots(rect(0,1.8,4.5,1.2),INK.leaf,.05,.3);}},-3.05,1.22);
  const rain=bd.add(stormCloud('n-rain',1.2,.6),'L',2.0,2.45,{out:.03}),drops=bd.add(S.drops(K+'n-drops',1.0,.5),'L',2.1,1.9,{out:.028});
  const sun=bd.add(S.sun(K+'n-sun',.36),'R',2.2,2.4,{out:.012});
  const dug=B.stand(bench2('n-dug',1.8,1.0),-2.6,-1.5,{layer:1});
  const M=B.person(K+'n-mo',-2.6,-1.25,1.28,{shirt:'navy',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'17',face:'sad',layer:1});
  const P=[[-3.9,.6,'short','#f1b88f'],[-1.3,1.1,'long','#d99a6c'],[-.45,-.15,'curly','#7f5138']].map(([x,z,h,s],i)=>B.person(K+`n-p${i}`,x as number,z as number,1.3,{shirt:'navy',hair:h as 'short',skin:s as string,legs:'kick',face:'smile',layer:i===2?2:3}));
  const boss=B.person(K+'n-boss',-4.3,-.9,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#e9b08a',face:'open',layer:2});
  const crit=boss.body.add(sp('n-crit',.62,.48,k=>{const w=.62,h=.48;const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.15} L${w} ${h*.62} Q${w} ${h*.76} ${w*.9} ${h*.76} L${w*.36} ${h*.76} L${w*.18} ${h} L${w*.22} ${h*.76} L${w*.1} ${h*.76} Q0 ${h*.76} 0 ${h*.62} L0 ${h*.15} Q0 0 ${w*.1} 0 Z`;k.fill(p,'#d9d5e6');k.key(p,.012);k.key(`M${w*.3} ${h*.2} L${w*.5} ${h*.55} M${w*.5} ${h*.2} L${w*.3} ${h*.55}`,.03,INK.red);k.key(`M${w*.62} ${h*.2} L${w*.62} ${h*.44} M${w*.62} ${h*.52} L${w*.62} ${h*.56}`,.03,INK.red);},{rim:.016}),.5,boss.h*.95,{z:-.02});
  const count=B.stand(S.scoreboard(K+'n-count',1.0,.9,'GAMES'),-1.25,-1.85,{layer:1,s:0});const games=counter(count,'n-g',.72,.36,.24,['1','2'],'3');
  const shirtRail=B.stand(rail('n-rail',1.3,1.7),1.25,-1.2,{layer:1,s:0});
  shirtRail.add(shirtCard('n-74',.9,.95,'74',PURPLE),0,.55,{z:.012});const flapShirt=shirtRail.flap(shirtCard('n-blank',.9,.95,'',PURPLE),0,1.5,{z:.028});
  const flw=B.stand(flowers('n-flw',.8,.4),1.3,-.3,{layer:2,s:0});
  const MR=B.person(K+'n-mr',2.6,.8,1.34,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'11',legs:'kick',face:'smile',layer:3});
  const goals=B.stand(S.scoreboard(K+'n-goals',1.1,.95,'ROMA GOALS'),3.85,-1.36,{layer:1,s:0});const gl=counter(goals,'n-gl',.8,.38,.26,['0','5','10'],'15');
  const pos=B.stand(lineCard('n-pos',1.5,.5,['PLAYER OF','THE SEASON'],INK.yellow),3.8,1.7,{layer:3,s:0});
  const mate=B.person(K+'n-rm',4.3,.4,1.3,{shirt:'casual',hair:'short',skin:'#f1b88f',face:'smile',layer:2});
  const ball=ballPair(B,'n-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.4):b.t;
   // Chelsea: first Egyptian (2), rarely picked (8.2), three games, public criticism (11.9).
   P.forEach((p,i)=>{p.body.s=beat(t,2.4+i*.4,3.2+i*.4);});M.body.s=beat(t,3.4,4.2)*(1-Math.max(beat(t,19.8,20.4),manual?beat(act,.2,.5):0));dug.s=beat(t,2.8,3.6)*.999+.001;
   const [bx,bz]=track(t,[[0,-3.5,.7],[4.4,-3.5,.7],[5.4,-1.0,1.0],[6.2,-1.0,1.0],[7.2,-.45,-.05],[8,-.45,-.05],[9,-3.5,.7],[10.4,-3.5,.7],[11.4,-1.0,1.0]]);
   ball(bx,bz,0,t>3&&t<19.6);P[0].leg!.rot=-1*maxOf([4.4,10.4].map(a=>pulse(t,a-.3,a+.3)));P[1].leg!.rot=-1*pulse(t,5.9,6.5);P[2].leg!.rot=-1*pulse(t,7.7,8.3);
   const rainA=beat(t,8.4,9.4)*(1-Math.max(beat(t,19.8,21),manual?beat(act,.3,.8):0));showPart(rain,rainA);showPart(drops,rainA);drops.dy=-.08*((t*1.5)%1)*rainA;
   count.s=beat(t,12,12.8);games.forEach((f,i)=>{f.flip=-3.2*beat(t,13+i*.9,13.5+i*.9);});
   boss.body.s=beat(t,14.4,15.2);showPart(crit,beat(t,15.4,16)*(1-Math.max(beat(t,19.6,20.2),manual?beat(act,0,.2):0)));boss.armR.rot=.12+1.4*beat(t,15.4,16)*(1-beat(t,19.6,20.2));
   // Flip the shirt: Fiorentina, number 74 to remember the people of Port Said.
   shirtRail.s=Math.max(beat(t,17.6,18.4),manual?1:0)*.999+.001;flapShirt.flip=-3.2*Math.max(beat(t,25,26.2),manual?beat(act,.1,.8):0);
   flw.s=Math.max(beat(t,26.8,27.6),manual?beat(act,.6,1):0);showPart(sun,Math.max(beat(t,20,21),manual?beat(act,.4,.9):0));sun.dy=.3*beat(t,20,22);
   // Roma: 15 goals, Player of the Season.
   MR.body.s=Math.max(beat(t,20.2,21),manual?beat(act,.4,.9):0);mate.body.s=beat(t,30.4,31.2);goals.s=beat(t,30.6,31.4);gl.forEach((f,i)=>{f.flip=-3.2*beat(t,31.6+i*.9,32.1+i*.9);});
   pos.s=beat(t,34.4,35.2);cheer(MR,beat(t,34.8,35.6),.2*wave(t,35.6,41.8,1.3));mate.armR.rot=.12+2.2*beat(t,35,35.6);
   MR.leg!.rot=-1*maxOf([31.4,32.3,33.2].map(a=>pulse(t,a-.3,a+.3)));
   return b.narrated?-.45*beat(t,1.8,2.8)+.9*beat(t,17.4,18.4)-.45*beat(t,36,37):0;
  };
 }};

/* ───────────── 6 · Remembering home (liverpool) ───────────── */
const liverpool:SpreadDef={id:'liverpool',rest:20.5,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(.1),1.0,1.0));
  k.text('32 GOALS',-2.5,Z(2.62),.5,INK.yellow,{max:3.4});k.text('A RECORD FOR A 38-GAME SEASON',-2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,INK.sand);k.dots(p,INK.orange,.06,.12);footprints(k,.5,Z(1.6),3.8,Z(1.2),10,'#9b7a4a');
  k.text('BACK IN NAGRIG',2.5,Z(2.62),.42,INK.teal,{max:4});k.text('A SCHOOL AND A HOSPITAL',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'l-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.red,INK.white,INK.red,INK.yellow,INK.red],1);lightRig(k,.9,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe2a6',INK.orange,y=>.45-y/3*.45);minaret(k,.6,1.0,1.1);eHouse(k,1.0,1.4,.9,.7,'#ecd3a4',1);eHouse(k,2.0,1.3,1.0,.8,'#e8c797',2);eHouse(k,3.1,1.45,1.2,.65,'#f0dab0',0);
    for(let i=0;i<3;i++){const x=1.5+i*1.2;k.key(`M${x} 2.1 L${x} 1.5`,.03,INK.wood);k.fill(ell(x,1.45,.22,.12),INK.green);}k.fill(rect(0,2.1,4.5,.9),INK.sand);k.dots(rect(0,2.1,4.5,.9),INK.orange,.05,.15);}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'l-fw1',.4,INK.red),'L',1.2,1.8,{out:.03}),bd.add(S.firework(K+'l-fw2',.36,INK.yellow),'L',3.4,1.7,{out:.03})];
  const sun=bd.add(S.sun(K+'l-sun',.38),'R',3.8,.9,{out:.012}),birds=bd.add(S.birds(K+'l-birds',.9,.35),'R',2.0,2.5,{out:.02});
  B.stand(S.goal(K+'l-goal',1.6,.85),-4.0,-1.36,{layer:1});
  const keeper=B.person(K+'l-keep',-4.0,-1.08,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const M=B.person(K+'l-mo',-1.6,.7,1.4,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,number:'11',legs:'kick',face:'smile',beard:true,layer:3});
  const board=B.stand(S.scoreboard(K+'l-board',1.2,1.0,'LEAGUE GOALS'),-2.3,-1.7,{layer:1,s:0});const gl=counter(board,'l-g',.9,.44,.26,['0','10','20'],'32');
  const cups=[['EUROPE',-3.9],['ENGLAND',-3.0]].map(([l,x],i)=>({cup:B.stand(S.trophy(K+`l-cup${i}`,.5,.9),x as number,.6+i*.35,{layer:2,s:0}),card:B.stand(S.flipCard(K+`l-cc${i}`,.9,.3,l as string,i?INK.blue:INK.red),x as number,1.3+i*.35,{layer:3,s:0})}));
  const base=B.stand(schoolPart('l-base',2.0,.5,'base'),2.3,-1.35,{layer:1,s:0}),walls=B.stand(schoolPart('l-walls',1.8,.85,'walls'),2.3,-1.3,{layer:1,s:0}),roof=B.stand(schoolPart('l-roof',2.0,.7,'roof'),2.3,-1.25,{layer:1,s:0});
  walls.dy=.2;roof.dy=1.0;
  const hosp=B.stand(hospital('l-hosp',1.1,1.3),4.3,-1.0,{layer:1,s:0});
  const MA=B.person(K+'l-ma',1.0,.3,1.45,{shirt:'casual',hair:'curly',hairColor:HAIR_M,skin:SKIN_M,adult:true,beard:true,face:'smile',layer:2});
  const kids=[[2.0,1.2,'bun','#b27650'],[2.9,.8,'short','#7f5138'],[3.8,1.35,'long','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`l-k${i}`,x as number,z as number,1.05,{shirt:(['bib','ger','casual'] as const)[i],hair:h as 'short',skin:s as string,face:'grin',layer:3}));
  const fam=B.person(K+'l-fam',4.5,.2,1.6,{shirt:'coach',hair:'long',adult:true,skin:SKIN_M,hairColor:HAIR_M,face:'smile',layer:2});
  const heart=MA.body.add(S.bubble(K+'l-heart',.55,.46,'heart'),.5,MA.h*.98,{z:-.02});
  const ball=B.stand(S.ball(K+'l-ball',.12),-1.2,.75,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.5):b.t;
   // Liverpool: 32 goals (5.8), champions of Europe and England (13.1).
   M.body.s=beat(t,2,2.8);board.s=beat(t,6,6.8);gl.forEach((f,i)=>{f.flip=-3.2*beat(t,7.2+i*1.2,7.8+i*1.2);});
   const kicks=[7.2,8.4,9.6,10.8];let bx=-1.2,bz=.75;for(const a of kicks)if(t>=a&&t<a+1){const u=clamp01((t-a)/.6);bx=-1.2-2.2*smooth(u);bz=.75-1.98*smooth(u);}
   ball.x=bx;ball.z=bz;ball.rot=-bx*5;ball.visible=t>2.4&&t<19;M.leg!.rot=-1*maxOf(kicks.map(a=>pulse(t,a-.3,a+.2)));keeper.body.rot=-.7*maxOf(kicks.map(a=>pulse(t,a+.2,a+.9)));
   cups.forEach((c,i)=>{c.cup.s=beat(t,13.6+i*1.8,14.4+i*1.8);c.card.s=beat(t,13.9+i*1.8,14.6+i*1.8);});
   fw.forEach((f,i)=>{showPart(f,beat(t,14+i*1.6,14.8+i*1.6)*(1-beat(t,19,19.6)));f.rot=t*.2;});cheer(M,beat(t,14.2,15)*(1-beat(t,19,19.6)),.2*wave(t,15,19,1.3));
   // Build the school: base, walls, roof; the hospital; families helped.
   const s1=manual?beat(act,0,.3):beat(t,23.6,24.6),s2=manual?beat(act,.34,.64):beat(t,25,26),s3=manual?beat(act,.68,1):beat(t,26.4,27.4);
   base.s=s1;walls.s=s1*.999*beat(Math.max(s1,0),.4,1);roof.s=s2;hosp.s=Math.max(s3,beat(t,27.2,28));
   MA.body.s=manual?1:beat(t,19.4,20.2);showPart(heart,beat(t,21.2,22)*(1-beat(t,23.4,24)));MA.armR.rot=.12+1.5*Math.max(pulse(t,23.6,27.6),manual?pulse(act,0,1):0);
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,29.6+i*.4,30.4+i*.4),manual?beat(act,.8+i*.05,.95+i*.02):0);cheer(p,beat(t,31+i*.3,31.6+i*.3),.2*wave(t,31.6,39.4,1.2+i*.2));});
   fam.body.s=beat(t,28.4,29.2);fam.armL.rot=-.12-1.8*beat(t,34.8,35.4);cheer(MA,beat(t,35,35.8));
   birds.dx=1.1*beat(t,30,39);birds.visible=t>29.6;sun.dy=.3*beat(t,20,22);
   return b.narrated?-.45*beat(t,1.6,2.6)+.9*beat(t,19.4,20.4)-.45*beat(t,34,35):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={village,journey,tears,basel,bench,liverpool};
void poly;void blob;void Z;
