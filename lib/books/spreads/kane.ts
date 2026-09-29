/**
 * The six Harry Kane pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/kane/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a turning signpost, a height chart, a suitcase, a bandage, a rain cloud.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='kane-',TAU=Math.PI*2;
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
const terraces=(key:string,w:number,h:number,seed=0)=>sp(key,w,h,k=>{terraceRow(k,0,h*.22,w,h*.78,seed);});
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const faceCard=(key:string,s:number,mood:'happy'|'sad',color:string)=>sp(key,s,s,k=>{const c=s/2,r=s*.46;k.fill(ell(c,c,r,r),color);k.dots(ell(c,c,r,r),INK.navy,.03,.18);k.key(ell(c,c,r,r),.014);
 k.circle(c-s*.15,c-s*.06,s*.045,INK.navy,true);k.circle(c+s*.15,c-s*.06,s*.045,INK.navy,true);const lw=s*.05;
 if(mood==='happy')k.key(`M${c-s*.18} ${c+s*.1} Q${c} ${c+s*.3} ${c+s*.18} ${c+s*.1}`,lw);else k.key(`M${c-s*.16} ${c+s*.25} Q${c} ${c+s*.08} ${c+s*.16} ${c+s*.25}`,lw);},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
/** A measuring post: ticks up the side and a star at the top. */
const heightChart=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.04,(x,y)=>.1+y/h*.3);k.key(b,.013);
 for(let i=1;i<14;i++){const y=h-i*h/14;k.key(`M0 ${y} L${w*(i%2?.3:.55)} ${y}`,.012);}
 const bands=[INK.pink,INK.orange,INK.yellow,INK.grass,INK.sky];bands.forEach((c,i)=>k.fill(rect(w*.62,h-(i+1)*h/5,w*.3,h/5-.02),c,.7));
 const st=poly(Array.from({length:10},(_,j)=>[w/2+Math.cos(j*.628-1.57)*(j%2?w*.12:w*.3),w*.35+Math.sin(j*.628-1.57)*(j%2?w*.12:w*.3)]));k.fill(st,INK.yellow);k.key(st,.01);});
const gate=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const bars=Math.round(w/.12);for(let i=0;i<=bars;i++){const x=i*w/bars;k.keyFill(rect(Math.min(x,w-.03),h*.08,.03,h*.92),INK.navy);}
 for(const y of [h*.2,h*.85])k.keyFill(rect(0,y,w,.04),INK.navy);k.key(`M0 ${h*.85} L${w} ${h*.2}`,.02,INK.navy);for(let i=0;i<=bars;i+=2)k.circle(Math.min(i*w/bars,w-.015)+.015,h*.06,.03,INK.navy,true);},{rim:.012});
const gatePost=(key:string,h:number)=>sp(key,.1,h,k=>{const p=rect(0,0,.1,h);k.fill(p,INK.navy);k.key(p,.01,'#101a36');k.circle(.05,.05,.05,INK.yellow);},{rim:.014});
const splint=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.08} ${h*.2} Q${w*.08} 0 ${w*.3} 0 L${w*.92} ${h*.1} Q${w} ${h*.5} ${w*.92} ${h*.9} L${w*.3} ${h} Q${w*.08} ${h} ${w*.08} ${h*.8} Z`;k.fill(b,INK.sky);k.dots(b,INK.blue,.03,.35);k.key(b,.012);
 for(const x of [.3,.55,.78]){const s=rect(w*x,0,w*.1,h);k.fill(s,INK.white);k.key(s,.008);}},{rim:.016});
const conveyor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [.08,.5,.9])k.keyFill(rect(w*x-.03,h*.35,.06,h*.65),'#56607a');const belt=rect(0,h*.08,w,h*.3);k.fill(belt,'#3f4a63');k.dots(belt,INK.navy,.03,.4);k.key(belt,.012);
 for(let x=.1;x<w;x+=.24)k.circle(x,h*.23,.05,INK.grey);k.fill(rect(0,h*.02,w,h*.07),INK.yellow);k.hatch(rect(0,h*.02,w,h*.07),INK.navy,.08,.8,.02);});
const workbench=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [.08,.86])k.keyFill(rect(w*x,h*.45,w*.06,h*.55),INK.brown);const top=rect(0,h*.36,w,h*.12);k.fill(top,INK.wood);k.key(top,.012);k.fill(rect(w*.1,h*.72,w*.8,h*.06),INK.wood);
 const box=rect(w*.12,h*.08,w*.26,h*.28);k.fill(box,INK.orange);k.key(box,.01);k.text('SPLINTS',w*.25,h*.26,h*.07,INK.navy,{max:w*.24,weight:800});
 k.keyFill(`M${w*.55} ${h*.36} L${w*.6} ${h*.16} L${w*.64} ${h*.16} L${w*.66} ${h*.36} Z`,INK.grey);k.fill(ell(w*.78,h*.3,w*.07,h*.05),INK.sky);k.key(ell(w*.78,h*.3,w*.07,h*.05),.01);});
const pullTab=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[0,h*.15],[w*.72,h*.15],[w,h*.5],[w*.72,h*.85],[0,h*.85]]);k.fill(p,INK.pink);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.text('PULL',w*.4,h*.68,h*.42,INK.white,{max:w*.6});},{rim:.018});
const workshopWall=(key:string)=>({key:K+key,w:4.5,h:3,paint:(k:Kit)=>{wash(k,4.5,3,'#e6e0d0','#b9b09a',y=>.15+y*.05);
 for(let i=0;i<3;i++){const x=.35+i*1.4,win=rect(x,.35,1.0,.9);k.fill(win,INK.sky2);k.dots(win,INK.sky,.04,.4);k.key(win,.014);k.key(`M${x+.5} .35 L${x+.5} 1.25 M${x} .8 L${x+1} .8`,.012);}
 k.fill(rect(0,1.45,4.5,.08),INK.grey);for(let i=0;i<9;i++){const x=.2+i*.48,b=rect(x,1.53,.36,.3);k.fill(b,[INK.orange,INK.sky,INK.yellow][i%3]);k.key(b,.01);}
 k.fill(rect(0,2.0,4.5,1.0),'#b7c0c4');k.dots(rect(0,2.0,4.5,1.0),INK.navy,.05,.12);k.key('M0 2 L4.5 2',.014);}});
const facade=(key:string,w:number,h:number,label:string,wall:string,roofC:string)=>sp(key,w,h,k=>{const b=rect(0,h*.18,w,h*.82);k.fill(b,wall);k.dots(b,INK.navy,.045,.12);k.key(b,.014);
 const roof=poly([[-.04,h*.2],[w*.5,0],[w+.04,h*.2]]);k.fill(roof,roofC);k.key(roof,.013);const s=rect(w*.14,h*.24,w*.72,h*.16);k.fill(s,INK.white);k.key(s,.01);k.text(label,w/2,h*.36,h*.1,INK.navy,{max:w*.66,weight:900});
 for(const x of [.08,.72]){const win=rect(w*x,h*.48,w*.2,h*.2);k.fill(win,INK.sky);k.key(win,.01);}
 const dr=rect(w*.36,h*.52,w*.28,h*.48);k.fill(dr,INK.yellow);k.dots(dr,INK.orange,.04,.5);k.key(dr,.012);});
const block=(key:string,w:number,h:number,label:string,year:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.04,.2);k.key(b,.015);k.fill(rect(0,0,w,.06),INK.white);
 k.text(label,w/2,h*.48+.02,Math.min(.2,h*.3),INK.white,{max:w*.86,weight:900});k.text(year,w/2,h*.48+.22,.13,INK.yellow,{max:w*.8,weight:800});});
const priceTag=(key:string,w:number,h:number,text:string)=>sp(key,w,h,k=>{const p=poly([[w*.18,0],[w,0],[w,h],[w*.18,h],[0,h*.5]]);k.fill(p,INK.yellow);k.dots(p,INK.orange,.03,.3);k.key(p,.012);k.circle(w*.16,h*.5,.03,INK.navy);k.text(text,w*.6,h*.66,h*.36,INK.navy,{max:w*.74,weight:900});},{rim:.016});
const comment=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.15} L${w} ${h*.62} Q${w} ${h*.76} ${w*.9} ${h*.76} L${w*.36} ${h*.76} L${w*.18} ${h} L${w*.22} ${h*.76} L${w*.1} ${h*.76} Q0 ${h*.76} 0 ${h*.62} L0 ${h*.15} Q0 0 ${w*.1} 0 Z`;k.fill(p,'#d9d5e6');k.key(p,.012);
 for(let i=0;i<3;i++)k.key(`M${w*.14} ${h*(.2+i*.18)} Q${w*.3} ${h*(.14+i*.18)} ${w*.46} ${h*(.2+i*.18)} T${w*(.62+(i%2)*.1)} ${h*(.2+i*.18)}`,.014,'#6a6480');
 k.key(`M${w*.74} ${h*.18} L${w*.88} ${h*.5} M${w*.88} ${h*.18} L${w*.74} ${h*.5}`,.025,INK.red);},{rim:.016});
const exitSign=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.3,w*.08,h*.7),INK.brown);const a=poly([[w*.12,h*.02],[w*.84,h*.02],[w,h*.14],[w*.84,h*.26],[w*.12,h*.26]]);k.fill(a,'#9aa0b4');k.key(a,.012);k.text('LEAVE?',w*.48,h*.2,h*.14,INK.white,{max:w*.66,weight:900});});
/** The helpers card hidden under the "Who helped?" flap. */
const helpers=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.yellow,.04,.3);k.key(b,.014);
 for(const [cx,c] of [[w*.27,INK.pink],[w*.73,INK.blue]] as const){k.fill(ell(cx,h*.34,w*.14,w*.14),c,.35);k.circle(cx,h*.3,w*.07,'#e3a987');k.key(ell(cx,h*.3,w*.07,w*.07),.01);k.fill(`M${cx-w*.12} ${h*.62} Q${cx} ${h*.4} ${cx+w*.12} ${h*.62} Z`,c);k.key(`M${cx-w*.12} ${h*.62} Q${cx} ${h*.4} ${cx+w*.12} ${h*.62} Z`,.01);}
 k.text('NIGEL PEARSON',w*.27,h*.78,h*.08,INK.navy,{max:w*.44,weight:900});k.text('CRAIG SHAKESPEARE',w*.73,h*.78,h*.08,INK.navy,{max:w*.44,weight:900});k.key(`M${w*.2} ${h*.9} L${w*.8} ${h*.9}`,.03,INK.yellow);});
/** A post with a tall blank placard (cards pin onto it) and a small title strip at its foot. */
const placard=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.45,h*.55,w*.1,h*.45),INK.brown);const b=rect(0,0,w,h*.58);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.014);
 const t=rect(w*.06,h*.46,w*.88,h*.1);k.fill(t,INK.blue);k.text(title,w/2,h*.535,h*.065,INK.white,{max:w*.82,weight:900});});
const growBars=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.sky,INK.yellow,INK.pink];for(let i=0;i<3;i++){const bh=h*(.35+i*.3),b=rect(w*(.05+i*.32),h-bh,w*.26,bh);k.fill(b,cs[i]);k.dots(b,INK.navy,.03,.2);k.key(b,.012);}});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
/** A three-flap counter on a scoreboard: flaps show labels[0..n-1] and flip away in order, revealing `final`. */
function counter(board:ReturnType<Builder['stand']>,key:string,w:number,h:number,y:number,labels:string[],final:string,color=INK.pink){
 board.add(S.flipCard(K+key+'-f',w,h,final,color),0,y,{z:.012});
 return labels.map((l,i)=>board.flap(S.flipCard(K+key+i,w,h,l,i%2?INK.blue:'#3d5da0'),0,y+h,{z:.03-i*.005}));}

const SKIN_H='#f1b88f',HAIR_H='#8a6a45';
const signPost=(key:string,h:number)=>sp(key,.12,h,k=>{const p=rect(0,0,.12,h);k.fill(p,INK.wood);k.hatch(p,INK.brown,.03,1.2,.008);k.key(p,.01);k.circle(.06,.08,.035,INK.gold);},{rim:.014});
/** A pointing arm hung from its pivot (drawn pointing down; rotate to aim). */
const pointer=(key:string,len:number,label:string,color:string)=>sp(key,.36,len,k=>{const p=poly([[.02,0],[.34,0],[.34,len-.18],[.18,len],[.02,len-.18]]);k.fill(p,color);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.circle(.18,.08,.03,INK.gold);k.text(label,.18,len*.55,.1,INK.white,{max:len*.8,weight:900,rotate:Math.PI/2});},{rim:.016});
const bench2=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const roof=`M0 ${h*.1} Q${w/2} -${h*.05} ${w} ${h*.1} L${w} ${h*.3} L0 ${h*.3} Z`;k.fill(roof,'#c9d6e6');k.dots(roof,INK.blue,.04,.3);k.key(roof,.012);for(const x of [0,w-.06])k.keyFill(rect(x,h*.2,.06,h*.8),INK.grey);const seat=rect(.06,h*.66,w-.12,h*.1);k.fill(seat,INK.navy);k.key(seat,.01);k.fill(rect(.06,h*.4,w-.12,h*.26),INK.navy,.35);});
const bandage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=`M${w*.1} ${h*.1} L${w*.45} ${h*.1} L${w*.5} ${h*.55} Q${w*.95} ${h*.55} ${w*.95} ${h*.8} Q${w*.95} ${h} ${w*.7} ${h} L${w*.1} ${h} Z`;k.fill(f,INK.white);k.key(f,.013);for(let i=0;i<4;i++)k.key(`M${w*.1} ${h*(.25+i*.18)} L${w*(.5+i*.1)} ${h*(.3+i*.18)}`,.012,INK.sky);k.fill(ell(w*.3,h*.2,w*.08,w*.08),INK.pink,.6);},{rim:.02});
const teamSheet=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.7,w*.08,h*.3),INK.brown);const b=rect(0,0,w,h*.72);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.1),INK.navy);k.text('TEAM SHEET',w/2,h*.075,h*.05,INK.white,{max:w*.8,weight:900});
 for(let i=0;i<9;i++){const y=h*(.16+i*.055);k.key(`M${w*.12} ${y} L${w*.88} ${y}`,.008,INK.grey);}});
const gFlip=(key:string,w:number,h:number,lines:string[],color:string,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.03,.14);k.key(b,.012);lines.forEach((l,i)=>k.text(l,w/2,h*(.42+i*.34),h*.26,ink,{max:w*.86,weight:900}));},{rim:.016});
const goldenBoot=(key:string,s:number)=>sp(key,s,s,k=>{const b=`M${s*.2} ${s*.1} L${s*.5} ${s*.1} L${s*.55} ${s*.55} Q${s*.95} ${s*.6} ${s*.95} ${s*.8} L${s*.95} ${s*.9} L${s*.15} ${s*.9} Z`;k.fill(b,INK.gold);k.dots(b,INK.orange,.03,.4);k.key(b,.013);for(let i=0;i<3;i++)k.circle(s*(.3+i*.22),s*.94,s*.04,INK.navy,true);},{rim:.02});
const mapPin=(key:string,label:string,color:string)=>sp(key,.9,.9,k=>{const p=`M.45 .9 L.25 .45 A.22 .22 0 1 1 .65 .45 Z`;k.fill(p,color);k.key(p,.012);k.circle(.45,.36,.08,INK.white);k.fill(rect(0,.0,.9,.0),INK.white);k.text(label,.45,.14,.1,INK.navy,{max:.86,weight:900});},{rim:.018});
function riverPrint(k:Kit,x0:number,x1:number){const pts:number[][]=[];for(let x=x0;x<=x1+.001;x+=.1)pts.push([x,Z(.1+.35*Math.sin(x*1.3))]);for(const [x,y] of pts)k.fill(ell(x,y,.18,.18),INK.sky);for(const [x,y] of pts)k.fill(ell(x,y,.05,.03),INK.white,.6);}
const SPURS=[INK.white,INK.navy,INK.white,INK.sky,INK.white];

/* ───────────── 1 · Let go by Arsenal (released) ───────────── */
const released:SpreadDef={id:'released',rest:22.5,
 left:k=>{street(k,-5,0);const park=rect(-4.8,Z(.2),2.4,1.6);k.fill(park,INK.grass,.8);k.dots(park,INK.leaf,.05,.3);
  k.text('LONDON · 1993',-2.5,Z(2.62),.42,INK.blue,{max:3.8});k.text('RIDGEWAY ROVERS FROM AGED 6',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);k.text('LET GO AFTER ONE SEASON',2.5,Z(2.62),.3,INK.pink,{max:4.4});k.text('A YOUTH ACADEMY AT AGE 8',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'r-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);terraceRow(k,.1,1.35,2.1,.55,1);terraceRow(k,2.3,1.25,2.1,.6,2);terraceRow(k,.3,1.95,4.0,.6,0);k.fill(rect(0,2.6,4.5,.4),INK.stone);}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.5,INK.leaf);lightRig(k,.5,.7);lightRig(k,4.0,.65);k.hatch(rect(0,2.0,4.5,.45),INK.navy,.08,.78,.008);k.hatch(rect(0,2.0,4.5,.45),INK.navy,.08,-.78,.008);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'r-sun',.34),'L',3.7,2.2,{out:.012}),cloud=bd.add(stormCloud('r-cloud',1.2,.6),'R',2.2,2.2,{out:.03}),birds=bd.add(S.birds(K+'r-birds',.9,.35),'L',1.6,2.5,{out:.02});
  const fam=[['coach','long',-4.3,-.5,1.62],['casual','short',-3.6,-.35,1.74],['ger','short',-2.9,-.2,1.3]].map(([sh,hr,x,z,h],i)=>B.person(K+`r-f${i}`,x as number,z as number,h as number,{shirt:sh as 'coach',hair:hr as 'short',adult:i<2,skin:SKIN_H,hairColor:i===0?'#b58a52':HAIR_H,face:'smile',layer:2}));
  B.stand(S.goal(K+'r-pgoal',1.1,.6),-4.3,1.0,{layer:2});
  const H=B.person(K+'r-h',-2.9,1.4,1.1,{shirt:'bib',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'9',legs:'kick',face:'smile',layer:3});
  const pal=B.person(K+'r-pal',-1.6,.9,1.1,{shirt:'bib',hair:'curly',skin:'#7f5138',legs:'kick',face:'grin',layer:3});
  const post=B.stand(signPost('r-post',1.7),-.75,-.6,{layer:2});const arm=post.arm(pointer('r-arm',1.0,'THIS WAY','#2f5fb0'),.06,1.58,{z:.02});
  const acad=B.stand(facade('r-acad',1.8,1.6,'ACADEMY','#f1dfc6',INK.red),1.9,-1.55,{layer:1});const doorA=acad.flap(S.door(K+'r-doorA',.5,.77),-.25,0,{anchor:'bl',axis:'y',z:.012});
  const trial=B.stand(facade('r-trial',1.6,1.5,'TRIAL','#dde6ef',INK.navy),4.0,-1.35,{layer:1,s:0});const doorT=trial.flap(S.door(K+'r-doorT',.45,.72),-.225,0,{anchor:'bl',axis:'y',z:.012});
  const HA=B.person(K+'r-ha',1.9,.3,1.1,{shirt:'casual',hair:'short',hairColor:HAIR_H,skin:SKIN_H,legs:'kick',face:'smile',layer:3});
  const coach=B.person(K+'r-coach',3.0,-.6,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#e9b08a',face:'open',layer:2});
  const note=B.stand(gFlip('r-note',1.3,.42,['NOT VERY ATHLETIC?'],INK.pink,INK.white),3.3,.9,{layer:3,s:0});
  const notyet=B.stand(gFlip('r-notyet',.9,.36,['NOT YET'],INK.grey),4.3,.2,{layer:2,s:0});
  const ball=ballPair(B,'r-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.5):b.t;
   sun.dy=.3*beat(t,0,2);
   fam.forEach((p,i)=>{p.body.s=beat(t,2.2+i*.5,3+i*.5);});fam[1].armR.rot=.12+1.4*beat(t,3.6,4.2)-1.4*beat(t,5.6,6.2);
   // Ridgeway Rovers at six (6), then the academy at eight (10.9), let go after a season (14.7).
   const away=beat(t,11.2,12)*(1-beat(t,30.2,31));H.body.s=beat(t,6.2,7)*(1-away);pal.body.s=beat(t,6.6,7.4);
   HA.body.s=beat(t,11.6,12.4)*(1-beat(t,15.6,16.4));coach.body.s=beat(t,12,12.8);
   doorA.flip=-1.8*beat(t,11.2,12)*(1-beat(t,15,15.8));
   note.s=beat(t,18.2,19)*(1-beat(t,34.6,35.4));coach.armR.rot=.12+1.4*beat(t,18.4,19)-1.4*beat(t,21.8,22.4);
   showPart(cloud,beat(t,15.4,16.4)*(1-Math.max(beat(t,30.6,32),manual?beat(act,.5,1):0)));
   // Tottenham trial: a second door that did not open at first.
   trial.s=beat(t,24.8,25.6);doorT.flip=-.9*pulse(t,26,28.6);notyet.s=beat(t,28.4,29.2);
   // The signpost turns back towards Ridgeway Rovers.
   const turn=Math.max(beat(t,30.2,31.4),manual?beat(act,0,.7):0);arm.rot=Math.PI/2-Math.PI*turn;
   const back=Math.max(beat(t,30.6,31.4),manual?beat(act,.6,1):0);if(back>0)H.body.s=Math.max(H.body.s,back);
   cheer(H,Math.max(beat(t,35,35.8),manual?beat(act,.8,1):0),.2*wave(t,35.8,40,1.3));cheer(pal,beat(t,35.3,36.1));
   let bx:number,bz:number;
   if(t<11)[bx,bz]=track(t,[[0,-2.5,1.4],[7.6,-2.5,1.4],[8.4,-1.25,.9],[9,-1.25,.9],[9.8,-3.9,1.1]]);
   else if(t<16)[bx,bz]=track(t,[[11,2.3,.35],[13,2.3,.35],[13.8,3.4,-.3]]);
   else [bx,bz]=track(t,[[16,-2.5,1.4],[32,-2.5,1.4],[32.8,-1.25,.9],[33.4,-1.25,.9],[34.2,-3.9,1.1]]);
   ball(bx,bz,0,(t>6.6&&t<11)||(t>=11&&t<16&&HA.body.s>.3)||(t>=16&&H.body.s>.3));
   H.leg!.rot=-1*maxOf([7.6,32].map(a=>pulse(t,a-.3,a+.3)));pal.leg!.rot=-1*maxOf([9,33.4].map(a=>pulse(t,a-.3,a+.3)));HA.leg!.rot=-1*pulse(t,12.7,13.3);
   birds.dx=1.1*beat(t,35,40);birds.visible=t>34.8;
   return b.narrated?-.45*beat(t,1.8,2.8)+.9*beat(t,10.6,11.6)-.5*beat(t,29.6,30.6)+.05:0;
  };
 }};

/* ───────────── 2 · Not the biggest, not the fastest (growing) ───────────── */
const growing:SpreadDef={id:'growing',rest:25.7,
 left:k=>{pitch(k,-5,0,'#8fc467');k.text('WATFORD TRIAL',-2.5,Z(2.62),.42,INK.orange,{max:4});k.text('2004 · AGED 11',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);k.text('ANOTHER CHANCE',2.5,Z(2.62),.4,INK.blue,{max:4});k.text('TOTTENHAM HOTSPUR ACADEMY',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'g-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.55);hills(k,4.5,3,1.5,'#9fb87a',INK.green);smallStand(k,.8,1.45,2.2,.6,INK.yellow);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},
   {key:K+'g-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.3,SPURS,2);lightRig(k,.8,.5);lightRig(k,3.7,.5);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'g-sun',.34),'L',3.6,2.2,{out:.012});
  const wSign=B.stand(S.sign(K+'g-wsign',1.1,1.2,'TRIAL'),-4.2,-1.4,{layer:1});
  const HW=B.person(K+'g-hw',-2.4,.8,1.08,{shirt:'bib',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'10',legs:'kick',face:'smile',layer:3});
  const wm=B.person(K+'g-wm',-3.6,.1,1.2,{shirt:'bib',hair:'curly',skin:'#7f5138',face:'smile',layer:2});
  const opp=B.person(K+'g-opp',-1.0,-.3,1.25,{shirt:'ger',hair:'short',skin:'#d99a6c',face:'open',layer:2});
  const scout=B.person(K+'g-scout',-.9,-1.4,1.7,{shirt:'navy',hair:'cap',adult:true,skin:'#e9b08a',face:'open',layer:1});
  const star=scout.body.add(S.bubble(K+'g-star',.55,.46,'star'),.5,scout.h*.95,{z:-.02});
  const big=[[2.4,.2,'curly','#b27650'],[3.4,-.4,'short','#d99a6c'],[4.3,.5,'long','#f1b88f']].map(([x,z,h,s],i)=>B.person(K+`g-b${i}`,x as number,z as number,1.42,{shirt:'ger',hair:h as 'short',skin:s as string,legs:'run',face:'smile',layer:2}));
  const HS=B.person(K+'g-hs',1.3,1.1,1.05,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'18',legs:'kick',face:'open',layer:3});
  const HT=B.person(K+'g-ht',1.3,1.1,1.45,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'18',legs:'kick',face:'smile',layer:3});
  const chart=B.stand(heightChart('g-chart',.3,1.8),.6,.6,{layer:2,s:0});
  const cal=B.stand(S.scoreboard(K+'g-cal',1.0,.9,'BIRTHDAY'),4.45,-1.3,{layer:1,s:0});const julyF=counter(cal,'g-m',.74,.36,.24,[],'JULY',INK.orange);
  const ticks=[0,1,2,3].map(i=>B.stand(S.icon(K+`g-tick${i}`,.26,'tick'),2.2+i*.34,2.0,{layer:3,s:0,tab:false}));
  const coach=B.person(K+'g-coach',2.0,-1.35,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#d99a6c',face:'smile',layer:1});
  const tab=B.stand(sp('g-tab',.66,.32,k=>{const p=poly([[0,.05],[.48,.05],[.66,.16],[.48,.27],[0,.27]]);k.fill(p,INK.pink);k.key(p,.012);k.text('PULL',.26,.22,.12,INK.white,{weight:900});},{rim:.016}),.3,2.05,{layer:3,tab:false});B.slot(.25,2.15,1.1,2.15);
  const ball=ballPair(B,'g-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.7):b.t;
   const grow=Math.max(beat(t,31.2,32.6),manual?beat(act,.15,.8):0);
   // Watford trial (2.7) and the match against Tottenham (8.1): a scout notices.
   HW.body.s=beat(t,3,3.8)*(1-beat(t,13.8,14.6));wm.body.s=beat(t,3.4,4.2);opp.body.s=beat(t,8.4,9.2);scout.body.s=beat(t,9,9.8);
   showPart(star,beat(t,11,11.7)*(1-beat(t,14,14.6)));scout.armR.rot=.12+1.5*beat(t,11.2,11.8)-1.5*beat(t,13.4,14);
   let bx:number,bz:number;
   if(t<14)[bx,bz]=track(t,[[0,-2.0,.9],[4.6,-2.0,.9],[5.4,-3.2,.15],[6,-3.2,.15],[6.8,-2.0,.9],[9.8,-2.0,.9],[10.6,-.6,.9],[11.2,-.6,.9]]);
   else [bx,bz]=track(t,[[14,1.65,1.15],[17.4,1.65,1.15],[18.2,2.8,.3],[18.6,2.8,.3],[19.4,4.4,.9]]);
   ball(bx,bz,0,t>3.2);HW.leg!.rot=-1*maxOf([4.6,6.8,9.8].map(a=>pulse(t,a-.3,a+.3)));
   // Tottenham: bigger, quicker boys; Harry not big, not very quick; born in July.
   big.forEach((p,i)=>{p.body.s=beat(t,14+i*.4,14.8+i*.4);p.body.x=[2.4,3.4,4.3][i]+.35*beat(t,17,18.6);});
   HS.body.s=beat(t,14.4,15.2)*(1-grow);HS.body.x=1.3+.15*beat(t,17,18.6);HT.body.s=grow;HT.body.x=HS.body.x;
   cal.s=beat(t,20,20.8);julyF.forEach(f=>{f.flip=-3.2*beat(t,21.6,22.4);});
   // His coaches noticed his wish to improve (25.9); the growth spurt (30.3).
   coach.body.s=beat(t,25.8,26.6);coach.armR.rot=.12+1.4*beat(t,26.6,27.2)-1.4*beat(t,29.6,30.2);
   ticks.forEach((q,i)=>{q.s=Math.max(beat(t,27+i*.6,27.4+i*.6),manual?beat(act,i*.2,i*.2+.15):0);});
   chart.s=Math.max(beat(t,30.4,31.2),manual?beat(act,0,.2):0);
   tab.x=.3+.65*Math.max(pulse(t,31,32.8),manual?(act<.9?beat(act,0,.5):1-beat(act,.9,1)):0);
   HS.leg!.rot=-1*pulse(t,17.1,17.7);cheer(HT,Math.max(beat(t,36,36.8),manual?beat(act,.8,1):0),.2*wave(t,36.8,41,1.3));
   big.forEach((p,i)=>{p.armR.rot=.12+2.0*beat(t,36.4+i*.3,37+i*.3);});
   return b.narrated?-.45*beat(t,2.4,3.4)+.9*beat(t,13.4,14.4)-.45*beat(t,35.4,36.2):0;
  };
 }};

/* ───────────── 3 · Sent away to learn (loans) ───────────── */
const PATH=[[-3.0,1.1],[-1.0,.8],[1.5,.55],[3.6,.9]];
const loans:SpreadDef={id:'loans',rest:12.3,
 left:k=>{pitch(k,-5,0);riverPrint(k,-5,0);footprints(k,-3.0,Z(1.3),-.4,Z(1.0),9,INK.white);
  k.text('TOTTENHAM · 2010',-2.5,Z(2.62),.4,INK.navy,{max:4});k.text('A FIRST PROFESSIONAL CONTRACT',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#e2dccb');k.dots(p,'#8f8367',.06,.12);riverPrint(k,0,5);footprints(k,.3,Z(1.0),3.3,Z(1.1),10,INK.navy);
  k.text('ON LOAN',2.5,Z(2.62),.46,INK.pink,{max:3.4});k.text('LEYTON ORIENT, THEN MILLWALL',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.4,2.3,SPURS,1);lightRig(k,.7,.6);lightRig(k,3.8,.6);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);terraceRow(k,.1,1.5,4.3,.5,1);for(let i=0;i<5;i++){const x=.3+i*.9,b=rect(x,.7,.5,.8);k.fill(b,'#b9c0cf');k.key(b,.01);}k.fill(rect(0,2.0,4.5,1.0),'#e2dccb');}},-3.05,1.22);
  const rain=bd.add(stormCloud('l-rain',1.2,.6),'R',3.0,2.3,{out:.03}),sun=bd.add(S.sun(K+'l-sun',.34),'R',1.2,2.2,{out:.012});
  const sher=B.person(K+'l-sher',-3.9,-.3,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#e9b08a',face:'smile',layer:2});
  const contract=B.stand(gFlip('l-contract',1.2,.42,['CONTRACT · 2010'],INK.white),-2.2,-1.4,{layer:1,s:0});
  const pen=B.stand(S.icon(K+'l-tick',.3,'tick'),-1.4,-1.35,{layer:1,s:0});
  const HL=B.person(K+'l-hl',-3.0,1.1,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,face:'smile',holdR:'suitcase',layer:3});
  const HR=B.person(K+'l-hr',1.5,.55,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,face:'smile',holdR:'suitcase',layer:3});
  const orient=B.stand(facade('l-orient',1.5,1.4,'LEYTON ORIENT','#f3dcd6',INK.red),1.4,-1.5,{layer:1,s:0});
  const mill=B.stand(facade('l-mill',1.5,1.4,'MILLWALL','#dbe3f0',INK.blue),3.6,-1.25,{layer:1,s:0});
  const HO=B.person(K+'l-ho',1.5,-.6,1.3,{shirt:'casual',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'19',face:'smile',layer:2});
  const HM=B.person(K+'l-hm',3.6,.9,1.36,{shirt:'navy',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'10',legs:'kick',face:'smile',layer:3});
  const goals=B.stand(S.scoreboard(K+'l-goals',1.05,.9,'LAST 14 GAMES'),4.5,-.4,{layer:2,s:0});const gl=counter(goals,'l-g',.78,.36,.24,['0','3','5'],'7');
  const award=B.stand(gFlip('l-award',1.4,.5,['YOUNG PLAYER','OF THE YEAR'],INK.yellow),2.6,1.9,{layer:3,s:0});
  const cup=B.stand(S.trophy(K+'l-cup',.45,.8),.6,1.6,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'l-ball',.11),3.9,.95,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,12.3):b.t;
   const st1=manual?beat(act,.05,.45):beat(t,13,15.6),st2=manual?beat(act,.55,.95):beat(t,16.2,17.8);
   // The contract (2), the coach's idea (7.1), off on loan (12.5).
   contract.s=beat(t,2.4,3.2);pen.s=beat(t,4.4,5);sher.body.s=beat(t,7.2,8);sher.armR.rot=.12+1.5*beat(t,8.4,9)-1.5*beat(t,12,12.6)+1.6*beat(t,13,13.6)+.3*wave(t,13.6,16,1.4);
   HL.body.s=beat(t,2.2,3)*(1-beat(t,13.6,14.4))*(manual?1-beat(act,.25,.35):1);const [lx,lz]=track(st1*.6,[[0,...PATH[0]],[.6,...PATH[1]]]);HL.body.x=lx;HL.body.z=lz;HL.armL.rot=-.12-.3*wave(t,12.5,14,1.6);
   orient.s=Math.max(beat(t,12.8,13.6),manual?beat(act,0,.25):0);mill.s=Math.max(beat(t,15.2,16),manual?beat(act,.45,.6):0);
   const onR=beat(t,14,14.8);HR.body.s=manual?(act>.02&&act<.98?1:0):onR*(1-beat(t,18.2,18.8));const [rx,rz]=track(st2,[[0,...PATH[2]],[1,...PATH[3]]]);HR.body.x=rx;HR.body.z=rz;
   HO.body.s=manual?beat(act,.4,.5)*(1-beat(act,.55,.65)):beat(t,15,15.6)*(1-beat(t,16.4,17));
   // At Millwall: a slow start (rain), then 7 goals in his last 14 games, Young Player of the Year.
   HM.body.s=manual?beat(act,.9,1):beat(t,18.6,19.4);
   showPart(rain,beat(t,20.2,21)*(1-Math.max(beat(t,23.4,24.6),manual?beat(act,.8,1):0)));showPart(sun,Math.max(beat(t,23.6,24.6),manual?beat(act,.9,1):0));
   goals.s=beat(t,23.6,24.4);gl.forEach((f,i)=>{f.flip=-3.2*beat(t,24.6+i*1.2,25.2+i*1.2);});
   const shots=[24.6,25.8,27];let bx=3.9,bz=.95;for(const a of shots)if(t>=a&&t<a+.9){const u=(t-a)/.6;bx=3.9+.7*smooth(u);bz=.95-1.9*smooth(u);}
   ball.x=bx;ball.z=bz;ball.visible=HM.body.s>.5&&t>18.8;HM.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   award.s=beat(t,28.4,29.2);cup.s=beat(t,28.8,29.6);cheer(HM,Math.max(beat(t,29,29.8),manual?beat(act,.95,1):0),.2*wave(t,29.8,40,1.3));
   return b.narrated?-.45*beat(t,1.8,2.8)+.9*beat(t,12.2,13.2)-.45*beat(t,33.8,34.8):0;
  };
 }};

/* ───────────── 4 · A broken foot (injury) ───────────── */
const injury:SpreadDef={id:'injury',rest:16.8,
 left:k=>{pitch(k,-5,0,'#9ccf6a');k.text('NORWICH · 2012',-2.5,Z(2.62),.42,INK.green,{max:4});k.text('A BROKEN BONE IN HIS FOOT',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);k.text('LEICESTER · 2013',2.5,Z(2.62),.42,INK.blue,{max:4});k.text('A GOAL ON HIS HOME DEBUT',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'i-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c8d3cf',INK.teal,y=>.3-y*.05);crowd(k,4.5,1.4,2.3,[INK.yellow,INK.green,INK.yellow,INK.white],2);lightRig(k,.8,.6);lightRig(k,3.7,.6);k.fill(rect(0,2.3,4.5,.7),'#9ccf6a');}},
   {key:K+'i-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.3,[INK.blue,INK.white,INK.blue,INK.sky],3);lightRig(k,.8,.5);lightRig(k,3.7,.5);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('i-rain',1.3,.64),'L',2.3,2.3,{out:.03}),sun=bd.add(S.sun(K+'i-sun',.34),'L',1.0,2.3,{out:.012});
  const rain2=bd.add(stormCloud('i-rain2',1.1,.55),'R',3.2,2.35,{out:.03});
  const HN=B.person(K+'i-hn',-2.6,.7,1.36,{shirt:'bib',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'19',legs:'kick',face:'smile',layer:3});
  const opp=B.person(K+'i-opp',-1.4,.1,1.3,{shirt:'navy',hair:'curly',skin:'#7f5138',face:'open',layer:2});
  const foot=B.stand(bandage('i-foot',.6,.45),-1.2,1.4,{layer:3,s:0});
  const medic=B.person(K+'i-medic',-3.9,.2,1.66,{shirt:'coach',hair:'bun',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const cal=B.stand(S.scoreboard(K+'i-cal',1.4,1.25,'GETTING BETTER'),-3.3,-1.55,{layer:1});const steps=counter(cal,'i-c',1.1,.44,.3,['REST','STRETCH','TRAIN'],'BACK TO PLAY',INK.yellow);
  const HB=B.person(K+'i-hb',-1.0,-.9,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,face:'smile',layer:1});
  const dug=B.stand(bench2('i-dug',1.8,1.0),2.2,-1.5,{layer:1,s:0});
  const HL=B.person(K+'i-hl',2.2,-1.3,1.28,{shirt:'navy',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'19',face:'open',layer:1});
  const HP=B.person(K+'i-hp',1.4,.9,1.36,{shirt:'navy',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'19',legs:'kick',face:'smile',layer:3});
  B.stand(S.goal(K+'i-goal',1.5,.8),4.2,-1.4,{layer:1});const keeper=B.person(K+'i-keep',4.2,-1.1,1.3,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const out=B.stand(gFlip('i-out',1.4,.38,['PLAY-OFFS: OUT'],INK.grey),3.4,1.8,{layer:3,s:0});
  const ball=ballPair(B,'i-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.8):b.t;
   // Norwich (1.9); the broken bone (6), rest and recovery at Tottenham (10.2).
   HN.body.s=beat(t,2.2,3)*(1-beat(t,10.4,11.2));opp.body.s=beat(t,2.6,3.4)*(1-beat(t,10.4,11.2));
   const hurt=beat(t,7.2,7.8);HN.body.rot=.08*hurt*(1-beat(t,10.2,10.8));foot.s=beat(t,7.8,8.6)*(1-Math.max(beat(t,20.2,21),manual?beat(act,.7,1):0));
   showPart(rain,beat(t,7.4,8.4)*(1-Math.max(beat(t,19,20.4),manual?beat(act,.6,1):0)));showPart(sun,Math.max(beat(t,19.4,20.4),manual?beat(act,.7,1):0));
   medic.body.s=beat(t,8.2,9);medic.armR.rot=.12+1.2*beat(t,8.8,9.4)*(1-beat(t,12,12.6));
   HB.body.s=beat(t,11,11.8)*(1-beat(t,20.6,21.4));
   // Flip the calendar: rest, stretch, train, back to play.
   steps.forEach((f,i)=>{f.flip=-3.2*Math.max(beat(t,17.4+i*.9,17.9+i*.9),manual?beat(act,i/3,i/3+.25):0);});
   HB.armL.rot=-.12-1.4*pulse(t,18.2,19)-(manual?1.4*pulse(act,.3,.6):0);cheer(HB,Math.max(beat(t,19.8,20.4)*(1-beat(t,20.8,21.2)),manual?beat(act,.85,1):0));
   // Leicester: a goal on his home debut; often on the bench; out in the play-offs.
   HP.body.s=beat(t,21,21.8)*(1-beat(t,27.2,27.8));dug.s=beat(t,21.2,22);HL.body.s=beat(t,27.4,28.2);
   const g=beat(t,24.8,25.5);let bx=1.6,bz=.95;if(g>0&&g<1){bx=1.6+2.5*g;bz=.95-2.3*g;}else if(g>=1){bx=4.1;bz=-1.35;}
   let nx=-2.3,nz=.75;const pz=[[3.2,-2.3,.75],[4,-1.6,.2],[4.6,-2.3,.75],[6.8,-2.3,.75]];[nx,nz]=track(t,pz);
   if(t<11)ball(nx,nz,0,HN.body.s>.3);else ball(bx,bz,0,t>21.2&&t<27.4);
   HN.leg!.rot=-1*maxOf([3.2,4.6].map(a=>pulse(t,a-.3,a+.3)));HP.leg!.rot=-1*pulse(t,24.5,25.1);keeper.body.rot=.7*pulse(t,25,26);
   cheer(HP,beat(t,25.6,26.2)*(1-beat(t,27,27.4)));
   out.s=beat(t,29,29.8);showPart(rain2,beat(t,29,30)*(1-beat(t,31.4,32.4)));
   HL.armR.rot=.12+1.6*beat(t,32,32.6);
   return b.narrated?-.45*beat(t,1.6,2.6)+.9*beat(t,20.2,21.2)-.45*beat(t,30.8,31.6):0;
  };
 }};

/* ───────────── 5 · Ready for his chance (chance) ───────────── */
const chance:SpreadDef={id:'chance',rest:19.5,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);k.text('APRIL 2014',-2.5,Z(2.62),.44,INK.navy,{max:4});k.text('A FIRST PREMIER LEAGUE START · 21 GOALS NEXT SEASON',-2.5,Z(2.9),.12,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);k.text('YOUNG PLAYER OF THE YEAR',2.5,Z(2.62),.28,INK.pink,{max:4.4});k.text('2015 · A GOAL ON HIS ENGLAND DEBUT',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.2,2.3,SPURS,1);lightRig(k,.8,.4);lightRig(k,3.7,.4);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.3,[INK.white,INK.red,INK.white,INK.navy],2);lightRig(k,1.0,.3);lightRig(k,3.6,.3);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('c-rain',1.2,.6),'R',3.0,2.2,{out:.03});const fw=[bd.add(S.firework(K+'c-fw1',.38,INK.red),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'c-fw2',.34,INK.white),'R',3.4,1.8,{out:.03})];
  const dug=B.stand(bench2('c-dug',1.7,.95),-3.8,-1.3,{layer:1});
  const H=B.person(K+'c-h',-3.8,-1.05,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'18',legs:'kick',face:'smile',layer:1});
  const poch=B.person(K+'c-poch',-2.6,-.9,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#e9b08a',hairColor:'#c9c3b8',face:'smile',layer:2});
  const sheet=B.stand(teamSheet('c-sheet',1.4,1.6),-1.1,-1.3,{layer:1});
  sheet.add(gFlip('c-in',1.1,.5,['STARTING:','KANE'],INK.yellow),0,.62,{z:.012});const benchCard=sheet.flap(gFlip('c-sub',1.1,.5,['SUBSTITUTE'],INK.grey),0,1.12,{z:.028});
  const ticks=[0,1,2].map(i=>B.stand(S.icon(K+`c-t${i}`,.28,'tick'),-2.2+i*.36,1.95,{layer:3,s:0,tab:false}));
  const board=B.stand(S.scoreboard(K+'c-board',1.05,.9,'LEAGUE GOALS'),-4.4,.3,{layer:2,s:0});const gl=counter(board,'c-g',.78,.36,.24,['0','10','15'],'21');
  const HP=B.person(K+'c-hp',-2.2,.9,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'18',legs:'kick',face:'smile',layer:3});
  const final=B.stand(S.scoreboard(K+'c-final',1.5,1.2,'LEAGUE CUP FINAL'),1.4,-1.55,{layer:1,s:0});final.add(gFlip('c-lost',1.1,.46,['LOST'],INK.grey),0,.36,{z:.012});
  const sad=B.person(K+'c-sad',1.2,.3,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'18',face:'sad',layer:2});
  const cup=B.stand(S.trophy(K+'c-cup',.5,.9),3.0,-1.4,{layer:1,s:0});const ypy=B.stand(gFlip('c-ypy',1.3,.46,['YOUNG PLAYER','OF THE YEAR'],INK.yellow),3.2,1.9,{layer:3,s:0});
  const HE=B.person(K+'c-he',2.6,.9,1.36,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'9',legs:'kick',face:'smile',layer:3});
  const eng=HE.body.add(S.flipCard(K+'c-eng',.8,.28,'ENGLAND',INK.white,INK.red),0,HE.h*1.08,{anchor:'center',z:.02});
  B.stand(S.goal(K+'c-goalR',1.4,.75),4.3,-1.0,{layer:1});
  const ball=ballPair(B,'c-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.5):b.t;
   // April 2014: off the bench, a first start, a goal (2–9).
   dug.s=beat(t,2,2.8)*.999+.001;H.body.s=beat(t,2.2,3)*(1-beat(t,4.6,5.2));HP.body.s=beat(t,5,5.8);
   // Pochettino picked him again and again (9–14.9); 21 league goals (14.9).
   poch.body.s=beat(t,9.2,10);poch.armR.rot=.12+1.4*beat(t,10.4,11)-1.4*beat(t,14,14.6);ticks.forEach((q,i)=>{q.s=beat(t,11.2+i*.8,11.6+i*.8);});
   board.s=beat(t,15,15.8);gl.forEach((f,i)=>{f.flip=-3.2*beat(t,15.8+i*.6,16.2+i*.6);});
   benchCard.flip=-3.2*Math.max(beat(t,19.8,20.6),manual?beat(act,0,.8):0);cheer(HP,Math.max(beat(t,20.6,21.2)*(1-beat(t,21.8,22.2)),manual?beat(act,.7,1):0));
   // Hard moments: the League Cup final lost (19.7–27.4).
   final.s=beat(t,20.2,21);sad.body.s=beat(t,22.2,23)*(1-beat(t,27.4,28.2));showPart(rain,beat(t,22.4,23.4)*(1-beat(t,27.4,28.6)));
   // Young Player of the Year and a goal on his England debut (27.4).
   cup.s=beat(t,27.8,28.6);ypy.s=beat(t,28.2,29);HE.body.s=beat(t,30.2,31);showPart(eng,beat(t,30.6,31.4));
   fw.forEach((f,i)=>{showPart(f,beat(t,32.6+i*.4,33.4+i*.4));f.rot=t*.2;});cheer(HE,beat(t,33,33.8),.2*wave(t,33.8,39.7,1.3));
   let bx:number,bz:number;const vis=t>5.2;
   if(t<20)[bx,bz]=track(t,[[0,-1.8,.95],[6.6,-1.8,.95],[7.4,-4.3,-.4],[8.6,-4.3,-.4],[9.2,-1.8,.95]]);
   else [bx,bz]=track(t,[[20,3.0,.95],[31.6,3.0,.95],[32.4,4.3,-.8]]);
   ball(bx,bz,0,vis&&(t<20||t>30.4));HP.leg!.rot=-1*pulse(t,6.3,6.9);HE.leg!.rot=-1*pulse(t,31.3,31.9);
   return b.narrated?-.45*beat(t,1.8,2.8)+.9*beat(t,19.8,20.8)-.45*beat(t,34,35):0;
  };
 }};

/* ───────────── 6 · After the missed penalty (penalty) ───────────── */
const penalty:SpreadDef={id:'penalty',rest:23.2,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,`M-4.9 ${Z(-2.0)} L-4.9 ${Z(-.6)} L-2.3 ${Z(-.6)} L-2.3 ${Z(-2.0)}`);k.fill(ell(-3.2,Z(.6),.05,.05),INK.white);
  k.text('2022 · QUARTER-FINAL',-2.5,Z(2.62),.36,INK.yellow,{max:4.2});k.text('FRANCE 2–1 ENGLAND',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,`M2.3 ${Z(-2.0)} L2.3 ${Z(-.6)} L4.9 ${Z(-.6)} L4.9 ${Z(-2.0)}`);k.fill(ell(3.6,Z(.6),.05,.05),INK.white);
  k.text('2023 · 54 GOALS',2.5,Z(2.62),.42,INK.yellow,{max:4});k.text('ENGLAND’S ALL-TIME TOP SCORER',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.white,INK.red,INK.blue,INK.white,INK.blue],1);lightRig(k,1.0,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.white,INK.sky,INK.red,INK.white,INK.blue],3);lightRig(k,1.2,.3);lightRig(k,3.7,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const rain=bd.add(stormCloud('p-rain',1.3,.64),'L',2.2,2.2,{out:.03});
  const fw=[bd.add(S.firework(K+'p-fw1',.42,INK.red),'R',1.3,1.8,{out:.03}),bd.add(S.firework(K+'p-fw2',.38,INK.white),'R',3.3,1.7,{out:.03})];
  const conf=bd.add(S.confetti(K+'p-cf',2.2,1.1,2),'R',.5,1.3,{out:.04});
  const boot=B.stand(goldenBoot('p-boot',.6),-1.0,-1.5,{layer:1,s:0});const bootCard=B.stand(gFlip('p-bootcard',1.3,.38,['2018 TOP SCORER'],INK.yellow),-1.0,-.8,{layer:2,s:0});
  B.stand(S.goal(K+'p-goalL',1.7,.9),-3.6,-1.35,{layer:1});
  const kL=B.person(K+'p-kl',-3.6,-1.0,1.32,{shirt:'keeper',hair:'short',skin:'#b27650',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const HL=B.person(K+'p-hl',-2.8,.9,1.38,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'9',legs:'kick',face:'open',beard:true,layer:3});
  const board=B.stand(S.scoreboard(K+'p-board',1.3,1.0,'QUARTER-FINAL'),-4.3,.4,{layer:2,s:0});board.add(gFlip('p-21',1.0,.44,['FRA 2–1 ENG'],INK.white),0,.28,{z:.012});
  const mates=[[-1.4,.2,'curly','#7f5138'],[-.8,1.2,'short','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`p-m${i}`,x as number,z as number,1.34,{shirt:'ger',hair:h as 'short',skin:s as string,face:'smile',layer:i?3:2}));
  B.stand(S.goal(K+'p-goalR',1.7,.9),3.6,-1.35,{layer:1});
  const kR=B.person(K+'p-kr',3.6,-1.0,1.32,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const HR=B.person(K+'p-hr',2.6,.9,1.38,{shirt:'ger',hair:'short',hairColor:HAIR_H,skin:SKIN_H,number:'9',legs:'kick',face:'smile',beard:true,layer:3});
  const count=B.stand(S.scoreboard(K+'p-count',1.2,1.0,'ENGLAND GOALS'),1.0,-1.5,{layer:1,s:0});const cnt=counter(count,'p-c',.9,.42,.26,['52','53'],'54');
  const record=B.stand(gFlip('p-rec',1.5,.46,['ALL-TIME','TOP SCORER'],INK.pink,INK.white),4.2,1.8,{layer:3,s:0});
  const bl=B.stand(S.ball(K+'p-bl',.12),-3.2,.62,{layer:3,tab:false}),br=B.stand(S.ball(K+'p-br',.12),3.6,.62,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.2):b.t;
   // England captain; 2018 World Cup top scorer (2.3).
   boot.s=beat(t,5,5.8)*(1-beat(t,8.6,9.4));bootCard.s=beat(t,5.4,6.2)*(1-beat(t,8.6,9.4));
   // 2022 quarter-final: the penalty goes over the bar; France win 2–1.
   HL.body.s=beat(t,2.4,3.2);kL.body.s=beat(t,8.8,9.6);
   const shotL=beat(t,12.6,13.6);bl.x=-3.2-.5*shotL;bl.z=.62-1.95*shotL;bl.dy=1.35*shotL;bl.visible=t<14.2;bl.rot=-shotL*6;
   HL.leg!.rot=-1.1*pulse(t,12.3,12.9);kL.body.rot=.6*pulse(t,12.8,14);
   board.s=beat(t,14.6,15.4);
   // Feeling sad; teammates close by (16.8).
   showPart(rain,beat(t,14.4,15.4)*(1-Math.max(beat(t,22,23.4),manual?beat(act,0,.5):0)));
   mates.forEach((m,i)=>{m.body.s=beat(t,17+i*.5,17.8+i*.5);m.armL.rot=-.12-1.2*beat(t,18.4+i*.4,19+i*.4)*(1-beat(t,21.6,22.2));});
   // Take the next penalty: 2023, against Italy: goal number 54.
   HR.body.s=Math.max(beat(t,21.4,22.2),manual?1:0);kR.body.s=Math.max(beat(t,21.8,22.6),manual?1:0);
   const shotR=manual?beat(act,.1,.5):beat(t,26.4,27.2);br.x=3.6+.45*shotR;br.z=.62-1.85*shotR;br.dy=.25*Math.sin(shotR*Math.PI);br.rot=-shotR*6;
   HR.leg!.rot=-1.1*Math.max(pulse(t,26.1,26.7),manual?pulse(act,0,.2):0);kR.body.rot=-.8*Math.max(pulse(t,26.6,28),manual?beat(act,.3,.6):0);kR.body.dx=-.3*Math.max(pulse(t,26.6,28),manual?beat(act,.3,.6):0);
   count.s=Math.max(beat(t,30.8,31.6),manual?beat(act,.4,.6):0);cnt.forEach((f,i)=>{f.flip=-3.2*Math.max(beat(t,31.8+i*.8,32.3+i*.8),manual?beat(act,.55+i*.12,.65+i*.12):0);});
   record.s=Math.max(beat(t,33.6,34.4),manual?beat(act,.8,1):0);
   const joy=Math.max(beat(t,27.6,28.4),manual?beat(act,.55,.8):0);cheer(HR,joy,.2*wave(t,28.4,40,1.3));
   fw.forEach((f,i)=>{showPart(f,Math.max(beat(t,27.8+i*.4,28.6+i*.4),manual?beat(act,.6+i*.1,.9):0));f.rot=t*.2;});conf.dy=-1.0+1.2*Math.max(beat(t,28,30.2),manual?beat(act,.6,1):0);conf.visible=t>27.8||manual;
   cheer(HL,beat(t,36.6,37.4));mates.forEach(m=>cheer(m,beat(t,36.8,37.6)));
   return b.narrated?-.45*beat(t,2,3)+.9*beat(t,21,22)-.45*beat(t,35.8,36.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={released,growing,loans,injury,chance,penalty};
void poly;void blob;void TAU;
