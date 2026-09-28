/**
 * The six Jamie Vardy pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/vardy/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a closing gate, a rain cloud, a shut door, a helping flap.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='vardy-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const SKIN_J='#f1b88f',HAIR_J='#6b4a2e';
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

/* ───────────── 1 · Told he was too small (released) ───────────── */
const released:SpreadDef={id:'released',rest:17.9,
 left:k=>{street(k,-5,0);footprints(k,-2.4,Z(1.3),-.5,Z(1.1),8,INK.navy);
  k.text('HILLSBOROUGH',-2.5,Z(2.6),.46,INK.blue,{max:4});k.text('SHEFFIELD · ENGLAND',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.2),1.0,1.0));
  k.text('TOO SMALL?',2.55,Z(2.6),.46,INK.pink,{max:4});k.text('ONE CLUB’S OPINION DID NOT DECIDE',2.55,Z(2.9),.14,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'r-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.55);hills(k,4.5,3,1.35,'#9fb87a',INK.green);
    terraceRow(k,.1,1.2,2.1,.55,1);terraceRow(k,2.3,1.35,2.1,.5,2);terraceRow(k,.3,1.95,4.0,.6,0);k.fill(rect(0,2.65,4.5,.35),INK.stone);k.key('M0 2.65 L4.5 2.65',.014);}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.5,INK.leaf);smallStand(k,1.0,1.35,2.4,.75,INK.blue);lightRig(k,.5,.7);lightRig(k,4.0,.65);
    k.hatch(rect(0,2.05,4.5,.4),INK.navy,.08,.78,.008);k.hatch(rect(0,2.05,4.5,.4),INK.navy,.08,-.78,.008);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'r-sun',.36),'R',3.5,1.55,{out:.012}),cloud=bd.add(S.cloud(K+'r-cloud',1.0,.45),'R',1.4,2.35),birds=bd.add(S.birds(K+'r-birds',.9,.35),'L',2.6,2.4,{out:.02});
  const rain=bd.add(stormCloud('r-rain',1.4,.72),'L',2.2,1.9,{out:.035}),drops=bd.add(S.drops(K+'r-drops',1.1,.6),'L',2.35,1.25,{out:.03});
  const home=B.stand(terraces('r-houses',2.1,1.6,3),-3.6,-1.65,{layer:1});
  B.stand(S.tree(K+'r-tree',.9,1.5,'round'),-1.2,-2.0,{layer:1});B.stand(S.bush(K+'r-bush',.8,.3),-.7,-.9,{layer:2});B.stand(S.bench(K+'r-bench',.9,.4),-1.7,-1.3,{layer:1});B.stand(S.lamp(K+'r-lamp',.4,1.7),-4.65,-.2,{layer:2});
  const mum=B.person(K+'r-mum',-3.55,-.55,1.62,{shirt:'coach',hair:'long',adult:true,skin:SKIN_J,hairColor:'#8a5a3a',face:'smile',layer:2});
  const dad=B.person(K+'r-dad',-2.85,-.4,1.72,{shirt:'casual',hair:'short',adult:true,skin:'#e9b08a',face:'smile',layer:2});
  const J=B.person(K+'r-home',-2.1,.95,1.1,{shirt:'arg',hair:'short',hairColor:HAIR_J,skin:SKIN_J,legs:'kick',face:'open',layer:3});
  const sad=J.body.add(faceCard('r-sad',.36,'sad',INK.sky),.42,J.h*1.02,{anchor:'center',z:.02});
  const boots=B.stand(S.icon(K+'r-boots',.34,'boot'),-.8,.2,{layer:2,s:0});
  const chart=B.stand(heightChart('r-chart',.32,1.9),.85,-1.7,{layer:1});
  const sign=B.stand(placard('r-sign',1.5,1.7,'SHEFFIELD WEDNESDAY'),2.05,-1.45,{layer:1});
  sign.add(lineCard('r-yet',1.3,.5,['NOT FOR EVER'],INK.yellow),0,.98,{z:.012});const tooSmall=sign.flap(lineCard('r-small',1.3,.5,['TOO SMALL?'],INK.pink,INK.white),0,1.48,{z:.028});
  const team=[[3.0,.45,'curly'],[3.85,-.3,'short'],[4.55,.75,'long']].map(([x,z,h],i)=>B.person(K+`r-t${i}`,x as number,z as number,1.36,{shirt:'arg',hair:h as 'short',skin:['#d99a6c','#f1b88f','#b27650'][i],face:'smile',layer:2}));
  const coach=B.person(K+'r-coach',3.9,-1.45,1.7,{shirt:'coach',hair:'cap',adult:true,skin:'#e9b08a',face:'open',layer:1});
  const JT=B.person(K+'r-youth',1.5,1.05,1.1,{shirt:'arg',hair:'short',hairColor:HAIR_J,skin:SKIN_J,legs:'kick',face:'smile',layer:3});
  const post=B.stand(gatePost('r-post',.75),.5,1.55,{layer:3});const gateF=post.flap(gate('r-gate',.95,.6),.05,.05,{anchor:'bl',axis:'y',z:.01});
  const ball=ballPair(B,'r-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.9):b.t;
   sun.dy=.4*beat(t,0,2);cloud.dx=-.6*beat(t,0,38);birds.dx=1.1*beat(t,33,38);birds.visible=t>32.5;
   // Hillsborough: home, family.
   home.s=beat(t,1.8,2.8);mum.body.s=beat(t,2.6,3.6);dad.body.s=beat(t,3.0,4.0);dad.armR.rot=.12+1.8*beat(t,4.2,4.8)-1.8*beat(t,6.2,6.8);
   // The youth team: Jamie joins (6.8), the gate closes and he is let go (12.4), the height chart and sign (15.9).
   const inTeam=beat(t,7.0,7.9)*(1-beat(t,12.8,13.6));team.forEach((p,i)=>{p.body.s=beat(t,7.4+i*.4,8.2+i*.4);});coach.body.s=beat(t,8.4,9.2);
   JT.body.s=inTeam;J.body.s=(1-beat(t,6.9,7.6))+beat(t,13.6,14.4);J.body.x=-2.1+1.2*beat(t,13.6,15.2);
   gateF.flip=-1.45*(1-beat(t,12.6,14.0));
   coach.armR.rot=.12+1.3*beat(t,9.2,9.8)-1.3*beat(t,11.4,12)+1.0*pulse(t,12.6,15.8);
   const lit=beat(t,15.9,16.6);chart.s=beat(t,15.8,16.8)*.999+.001;sign.s=beat(t,16.2,17.1);
   // Stopped playing: boots put away, rain; feeling hurt: sad face; one opinion didn't decide: the sign flips, sun.
   boots.s=beat(t,20.2,21);const rainA=beat(t,20,21.2)*(1-beat(t,29,30.4))*(manual?1-beat(act,0,.6):1);showPart(rain,rainA);showPart(drops,rainA);drops.dy=-.08*((t*1.5)%1)*rainA;
   showPart(sad,beat(t,24,24.8)*(1-beat(t,29,29.8))*(manual?1-beat(act,0,.4):1));
   tooSmall.flip=-3.2*Math.max(beat(t,29.6,30.6),manual?beat(act,.1,.9):0);
   const joy=Math.max(beat(t,33.4,34.2),manual?beat(act,.6,1):0);cheer(J,joy,.25*wave(t,34.2,38,1.3));
   team.forEach(p=>{p.armR.rot=.12+.3*wave(t,8.4,12,1.1);});
   // The ball: kick-about at home, passing in the team, left behind by the gate, back with Jamie at the end.
   let bx:number,bz:number,by=0;
   if(t<7)[bx,bz]=track(t,[[0,-1.62,1.05],[4.4,-1.62,1.05],[5.2,-3.0,.2],[5.8,-3.0,.2],[6.6,-1.62,1.05]]);
   else if(t<13)[bx,bz]=track(t,[[7,1.98,1.1],[8.6,1.98,1.1],[9.4,3.4,.5],[10,3.4,.5],[10.8,4.1,-.2],[11.4,4.1,-.2],[12.4,1.98,1.1]]);
   else if(t<30){bx=.55+.02;bz=2.0;}
   else [bx,bz]=track(t,[[30,.6,2.0],[31.5,-.55,1.05]]);
   if(t>=30&&joy>0){by=.25*Math.abs(Math.sin(t*4))*joy;}
   ball(bx,bz,by,t>1.5);
   J.leg!.rot=-.9*maxOf([4.4,6.6].map(a=>pulse(t,a-.25,a+.25)));JT.leg!.rot=-.9*maxOf([8.6,12.4].map(a=>pulse(t,a-.25,a+.25)));
   void lit;
   return b.narrated?-.45*beat(t,1.8,3)+.45*beat(t,6.6,7.6)+.4*beat(t,7.6,8.6)-.4*beat(t,17.6,18.6)-.35*beat(t,19.6,20.6)+.35*beat(t,28.4,29.4):0;
  };
 }};

/* ───────────── 2 · Work and football (steels) ───────────── */
const SPL_X0=-4.45,SPL_X1=-1.45,SPL_GAP=1.0;
const steels:SpreadDef={id:'steels',rest:19.5,
 left:k=>{floor(k,-5,0);k.text('WORKSHOP',-2.5,Z(2.6),.46,INK.navy,{max:3.6});k.text('MAKING MEDICAL SPLINTS',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#86b85f');chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.2),1.0,1.0));chalk(k,`M3.3 ${Z(-2.0)} L3.3 ${Z(-1.0)} L5 ${Z(-1.0)}`);
  k.text('STOCKSBRIDGE PARK STEELS',2.5,Z(2.6),.3,INK.blue,{max:4.4});k.text('A SMALL CLUB · 55 GOALS',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold(workshopWall('s-bdL'),
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.35,'#8fae6e',INK.green);
    for(const [x,h] of [[3.3,.9],[3.7,1.2]] as const){const c=rect(x,1.95-h,.18,h);k.fill(c,'#9a8f86');k.key(c,.01);}
    smallStand(k,.4,1.5,1.6,.55,INK.yellow);lightRig(k,2.4,.8);k.fill(rect(0,2.3,4.5,.7),INK.grass);k.dots(rect(0,2.3,4.5,.7),INK.leaf,.05,.3);}},-3.05,1.22);
  const smoke=bd.add(S.cloud(K+'s-smoke',.7,.32),'R',3.6,1.9,{out:.02}),sun=bd.add(S.sun(K+'s-sun',.3),'R',1.2,2.3,{out:.012});
  const bench=B.stand(workbench('s-bench',1.5,.95),-3.6,-1.55,{layer:1});
  B.stand(conveyor('s-belt',3.3,.55),-2.95,-.35,{layer:2});B.stand(S.lamp(K+'s-lamp',.36,1.5),-.55,-1.7,{layer:1});
  B.stand(sp('s-boxes',.8,.9,k=>{for(let r=0;r<3;r++)for(let c=0;c<(r===0?1:2);c++){const x=r===0?.2:c*.4,y=r*.3,bx=rect(x,y,.38,.28);k.fill(bx,[INK.orange,INK.yellow,INK.sky][(r+c)%3]);k.dots(bx,INK.navy,.03,.15);k.key(bx,.01);k.text('SPLINTS',x+.19,y+.18,.06,INK.navy,{max:.32,weight:800});}}),-4.5,-.85,{layer:1});B.slot(SPL_X0,-.3,SPL_X1,-.3);
  const splints=[0,1,2,3].map(i=>{const q=B.stand(splint(`s-spl${i}`,.62,.26),SPL_X0,-.3,{layer:2,tab:false});q.dy=.44;return q;});
  const tab=B.stand(pullTab('s-tab',.7,.34),-1.2,1.95,{layer:3,tab:false});B.slot(-1.6,2.05,-.5,2.05);
  const JW=B.person(K+'s-work',-2.3,.7,1.4,{shirt:'casual',hair:'short',hairColor:HAIR_J,skin:SKIN_J,face:'smile',layer:3});
  const mate=B.person(K+'s-mate',-4.2,.9,1.62,{shirt:'coach',hair:'bun',adult:true,skin:'#b27650',face:'smile',layer:3});
  const done=['1','2','3'].map((l,i)=>B.stand(S.icon(K+`s-done${i}`,.28,'tick'),-4.55+i*.36,1.85,{layer:3,s:0}));
  const JF=B.person(K+'s-play',1.5,.8,1.4,{shirt:'bib',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',legs:'kick',face:'smile',layer:3});
  const T1=B.person(K+'s-t1',2.6,-.4,1.34,{shirt:'bib',hair:'curly',skin:'#7f5138',number:'4',legs:'kick',face:'grin',layer:2});
  const keeper=B.person(K+'s-keep',4.2,-1.25,1.34,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  B.stand(S.goal(K+'s-goal',1.5,.8),4.2,-1.6,{layer:1});
  const pay=B.stand(S.flipCard(K+'s-pay',1.1,.4,'£120 A WEEK',INK.yellow,INK.navy),.95,-1.35,{layer:1,s:0});
  const bars=B.stand(growBars('s-bars',.8,.8),3.2,1.25,{layer:3,s:0});
  const board=B.stand(S.scoreboard(K+'s-board',1.2,1.0,'GOALS'),2.95,-1.85,{layer:1,s:0});
  const flaps=counter(board,'s-g',.9,.44,.28,['0','20','40'],'55');
  const first=JF.body.add(S.flipCard(K+'s-first',.8,.28,'FIRST TEAM',INK.pink),0,JF.h*1.05,{anchor:'center',z:.02});
  const ball=ballPair(B,'s-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.5):b.t;
   sun.dy=.3*beat(t,0,2);smoke.dx=.4*beat(t,0,38);smoke.dy=.05*wave(t,0,38,.3);
   // Football first (1.9), pay card (9.8), then the job (13.1), both side by side (22.7), first team and goals (27.9).
   const play=Math.max(beat(t,2.2,3.0)*(1-beat(t,13.1,13.8)),beat(t,23.2,24.0));JF.body.s=play;T1.body.s=beat(t,3.4,4.2);keeper.body.s=beat(t,3.8,4.6);
   const work=beat(t,13.6,14.4)*(1-beat(t,22.8,23.4))+beat(t,33.6,34.4)*0;JW.body.s=Math.max(work,t<2?0:0);mate.body.s=beat(t,14.4,15.2);
   bench.s=beat(t,13.2,14.2)*.999+.001;
   pay.s=beat(t,10,10.8);bars.s=beat(t,25,26);board.s=beat(t,28,28.8);
   flaps.forEach((f,i)=>{f.flip=-3.2*beat(t,[29.2,30.4,31.6][i],[29.8,31,32.2][i]);});
   showPart(first,beat(t,28.1,28.8)*(1-beat(t,33,33.6)));
   // The belt: splints move along each time the belt steps (narrated), or with the reader's pull.
   const steps=beat(t,15.4,16.4)+beat(t,17.2,18.2)+beat(t,20.3,21.6)+beat(t,34.5,35.5)+(manual?1.6*act:0);
   splints.forEach((q,i)=>{const u=((i*SPL_GAP+steps*SPL_GAP)%(SPL_GAP*4)),x=SPL_X0+u;q.x=Math.min(x,SPL_X1+.3);q.s=clamp01((SPL_X1+.3-x)/.3)*clamp01(u/.3)*beat(t,14.4,15.2);});
   tab.x=-1.2+.55*Math.max(pulse(t,20.3,21.8),manual?(act<.9?beat(act,0,.4):1-beat(act,.9,1)):0);tab.scale=1+.08*wave(t,19.7,20.3,2);
   done.forEach((d,i)=>{d.s=Math.max(beat(t,16.4+i*1.8,17+i*1.8),manual?beat(act,.3+i*.2,.45+i*.2):0);});
   JW.armL.rot=-.12-.9*maxOf([15.4,17.2,20.3].map(a=>pulse(t,a-.3,a+.8)))-(manual?.9*pulse(act,0,.6):0);JW.armR.rot=.12+.6*wave(t,14.4,22.6,1.1);
   mate.armR.rot=.12+1.4*beat(t,15.4,16)-1.4*beat(t,19,19.6)+2.0*beat(t,34,34.6);
   // Ball: passing (2–9), shots into the goal (29–32.5).
   let bx:number,bz:number;
   if(t<13)[bx,bz]=track(t,[[0,1.9,.85],[4.4,1.9,.85],[5.2,2.8,-.35],[6,2.8,-.35],[6.8,1.9,.85],[8.2,1.9,.85],[9,2.8,-.35]]);
   else if(t<28.6){bx=1.9;bz=.85;}
   else{const shots=[29,30.3,31.6];let u=-1,k2=0;for(let i=0;i<3;i++)if(t>=shots[i]&&t<shots[i]+1.2){u=(t-shots[i])/.6;k2=i;}
    if(u>=0&&u<1){bx=1.9+2.2*smooth(u);bz=.85-2.3*smooth(u)+k2*.05;}else if(u>=1){bx=4.1;bz=-1.45;}else{bx=1.9;bz=.85;}}
   ball(bx,bz,0,play>.3||t>28.4);
   const kicks=[4.4,6.8,29,30.3,31.6];JF.leg!.rot=-1.0*maxOf(kicks.map(a=>pulse(t,a-.25,a+.25)));T1.leg!.rot=-1.0*maxOf([6,9].map(a=>pulse(t,a-.3,a+.3)));
   keeper.body.rot=.6*maxOf([29.5,30.8,32.1].map(a=>pulse(t,a,a+.9)));
   cheer(JF,beat(t,33.8,34.6),.2*wave(t,34.6,38.6,1.3));T1.armL.rot=-.12-2.2*beat(t,34.2,34.8);T1.armR.rot=.12+2.2*beat(t,34.2,34.8);
   return b.narrated?.35*beat(t,1.6,2.6)-.8*beat(t,12.8,13.8)+.8*beat(t,22.6,23.6)-.35*beat(t,33.2,34.2):0;
  };
 }};

/* ───────────── 3 · A door that stayed shut (trial) ───────────── */
const trial:SpreadDef={id:'trial',rest:18.7,
 left:k=>{street(k,-5,0);footprints(k,-3.9,Z(1.0),-2.5,Z(.2),6);footprints(k,-2.5,Z(.4),-3.9,Z(1.3),6,'#8a7c63');
  k.text('2009 · A TRIAL',-2.5,Z(2.6),.42,INK.navy,{max:3.8});k.text('A WEEK AT CREWE ALEXANDRA',-2.5,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.2),1.0,1.0));footprints(k,.6,Z(1.3),2.1,Z(.2),6);
  k.text('FC HALIFAX TOWN',2.5,Z(2.6),.38,INK.blue,{max:4.2});k.text('2010 · TOP SCORER · 25 GOALS',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9d6dc','#8d9aa5',y=>.45-y/3*.3);hills(k,4.5,3,1.6,'#a6b48c',INK.green);terraceRow(k,.2,1.7,4.1,.6,2);k.fill(rect(0,2.4,4.5,.6),INK.stone);}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.6-y/3*.6);hills(k,4.5,3,1.45,INK.leaf);smallStand(k,2.6,1.4,1.7,.6,INK.blue);lightRig(k,.6,.75);
    k.fill(rect(0,2.3,4.5,.7),INK.grass);k.dots(rect(0,2.3,4.5,.7),INK.leaf,.05,.3);}},-3.05,1.22);
  const rain=bd.add(stormCloud('t-rain',1.3,.66),'L',2.2,2.0,{out:.035}),drops=bd.add(S.drops(K+'t-drops',1.0,.55),'L',2.3,1.4,{out:.03});
  const sun=bd.add(S.sun(K+'t-sun',.38),'R',1.4,1.9,{out:.012}),birds=bd.add(S.birds(K+'t-birds',.9,.35),'R',3.0,2.4,{out:.02});
  const crewe=B.stand(facade('t-crewe',1.9,1.75,'CREWE','#e3d6bd',INK.red),-2.5,-1.55,{layer:1});
  const doorL=crewe.flap(S.door(K+'t-doorL',.53,.84),-.265,0,{anchor:'bl',axis:'y',z:.012});
  const cal=B.stand(S.scoreboard(K+'t-cal',.9,.9,'TRIAL'),-4.3,-1.2,{layer:1,s:0});const week=counter(cal,'t-w',.66,.34,.24,['DAY 1','DAY 4'],'1 WEEK',INK.orange);
  const no=B.stand(S.flipCard(K+'t-no',1.1,.38,'NO MOVE',INK.grey,INK.navy),-1.0,-.6,{layer:2,s:0});
  B.stand(S.lamp(K+'t-lamp',.4,1.6),-4.6,.2,{layer:2});
  const JL=B.person(K+'t-jl',-3.9,1.0,1.36,{shirt:'bib',hair:'short',hairColor:HAIR_J,skin:SKIN_J,face:'open',layer:3});B.slot(-4.0,1.2,-2.4,1.2);
  const halifax=B.stand(facade('t-halifax',1.9,1.75,'HALIFAX','#d6e3ef',INK.blue),2.2,-1.55,{layer:1});
  const doorR=halifax.flap(S.door(K+'t-doorR',.53,.84),-.265,0,{anchor:'bl',axis:'y',z:.012});
  const aspin=B.person(K+'t-aspin',2.25,-1.05,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const JR=B.person(K+'t-jr',1.2,1.05,1.36,{shirt:'navy',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',legs:'kick',face:'smile',layer:3});
  const mates=[[3.3,.3,'curly','#7f5138'],[4.35,.95,'short','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`t-m${i}`,x as number,z as number,1.3,{shirt:'navy',hair:h as 'short',skin:s as string,face:'grin',layer:i?3:2}));
  const board=B.stand(S.scoreboard(K+'t-board',1.15,1.0,'GOALS'),4.25,-1.4,{layer:1,s:0});const goals=counter(board,'t-g',.86,.42,.26,['0','10','20'],'25');
  const cup=B.stand(S.trophy(K+'t-cup',.45,.8),.75,-.35,{layer:2,s:0});const cupCard=B.stand(lineCard('t-ppl',1.0,.42,['PLAYERS’ PLAYER'],INK.yellow),.9,.35,{layer:2,s:0});
  const bub=aspin.body.add(S.bubble(K+'t-bub',.55,.46,'star'),.5,aspin.h*.95,{z:-.02});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.7):b.t;
   const k1=manual?beat(act,0,.45):0,k2=manual?beat(act,.5,.95):beat(t,19.4,20.4);
   // 2009: the trial week, a shut door, walking back in the rain.
   JL.body.x=-3.9+1.3*beat(t,2.6,4.6)-1.3*beat(t,10,12.4)+(manual?.9*pulse(act,0,.45):0);JL.body.yaw=Math.PI*beat(t,9.8,10.4)*(1-beat(t,12.4,13));
   cal.s=beat(t,4.8,5.6);week.forEach((f,i)=>{f.flip=-3.2*beat(t,6.4+i*1.2,7+i*1.2);});
   const knock=maxOf([3.4,4.2].map(a=>pulse(t,a+1.0,a+1.3)))+(manual?maxOf([.1,.2,.3].map(a=>pulse(act,a,a+.08))):0)+maxOf([10.2,10.6].map(a=>pulse(t,a-1.2,a-1.0)));
   JL.armR.rot=.12+1.6*beat(t,4.4,4.8)-1.6*beat(t,9,9.4)+.5*knock+(manual?1.6*pulse(act,0,.45):0);doorL.flip=.06*Math.sin(knock*TAU);
   no.s=Math.max(beat(t,9.6,10.4),k1);
   const rainA=beat(t,13.4,14.4)*(1-beat(t,20,21.4)*(manual?1:1));showPart(rain,manual?1-k2:rainA);showPart(drops,manual?1-k2:rainA);drops.dy=-.08*((t*1.5)%1);
   JL.body.s=1-beat(t,19.0,19.8)*(manual?0:1)-(manual?k2:0);
   // 2010: another door opens; Neil Aspin; top scorer; teammates' vote.
   doorR.flip=-1.9*k2;aspin.body.s=beat(Math.max(k2,0),.2,.8)*1;aspin.armR.rot=.12+1.5*k2*(1-beat(t,27.6,28.2))+2.0*beat(t,33.4,34)-.3*wave(t,21,26,1);
   showPart(bub,beat(t,21,21.8)*(1-beat(t,27,27.6)));
   JR.body.s=manual?beat(act,.7,1):beat(t,21.6,22.6);mates.forEach((m,i)=>{m.body.s=beat(t,23+i*.5,23.8+i*.5);});
   board.s=beat(t,27.8,28.6);goals.forEach((f,i)=>{f.flip=-3.2*beat(t,29+i*1.1,29.6+i*1.1);});
   JR.leg!.rot=-1*maxOf([29,30.1,31.2].map(a=>pulse(t,a-.3,a+.3)));
   cup.s=beat(t,32.2,33);cupCard.s=beat(t,32.4,33.2);mates.forEach((m,i)=>{m.armL.rot=-.12-2.2*beat(t,33+i*.3,33.6+i*.3);m.armR.rot=.12+2.2*beat(t,33+i*.3,33.6+i*.3);});
   cheer(JR,beat(t,36,36.8),.25*wave(t,36.8,41,1.3));sun.dy=.4*k2;birds.dx=1.1*beat(t,36,41);birds.visible=t>35.8;
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,17,18.2)+.45*beat(t,18.6,19.6)-.45*beat(t,35.2,36.2):0;
  };
 }};

/* ───────────── 4 · One step at a time (ladder) ───────────── */
const STEPS=[{x:-3.45,z:.35,h:.4},{x:-1.3,z:.05,h:.8},{x:1.45,z:-.25,h:1.2}];
const ladder:SpreadDef={id:'ladder',rest:2.05,
 left:k=>{pitch(k,-5,0,'#8fbf6a');footprints(k,-4.4,Z(1.6),-3.6,Z(.9),5);footprints(k,-3.0,Z(.8),-1.6,Z(.55),6);
  k.text('FLEETWOOD TOWN',-2.5,Z(2.6),.4,INK.red,{max:4.2});k.text('2011 · 31 LEAGUE GOALS · PROMOTED',-2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);footprints(k,-0,Z(.5),1.1,Z(.3),4);
  k.text('LEICESTER CITY',2.55,Z(2.6),.42,INK.blue,{max:4.2});k.text('2012 · A RECORD FEE · AGED 25',2.55,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const sea=rect(0,1.55,4.5,.45);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);for(let i=0;i<6;i++)k.key(`M${.4+i*.7} ${1.7+(i%2)*.12} l.25 0`,.012,INK.white);
    smallStand(k,.5,1.7,2.0,.6,INK.red);k.fill(rect(0,2.3,4.5,.7),INK.grass);k.dots(rect(0,2.3,4.5,.7),INK.leaf,.05,.3);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.55);crowd(k,4.5,1.2,2.3,[INK.blue,INK.white,INK.blue,INK.sky,INK.yellow],2);lightRig(k,.8,.35);lightRig(k,3.8,.35);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'l-sun',.34),'L',3.6,1.3,{out:.012}),ban=bd.add(S.banner(K+'l-ban',2.4,.38,'ONE STEP AT A TIME',INK.pink),'R',.5,2.8,{out:.02});
  const blocks=[['HALIFAX','2010',INK.blue],['FLEETWOOD','2011',INK.red],['LEICESTER','2012','#2f5fb0']].map(([l,y,c],i)=>B.stand(block(`l-b${i}`,1.25,STEPS[i].h,l,y,c),STEPS[i].x,STEPS[i].z,{layer:2}));
  const kits=['fan','ger','navy'] as const;
  const J=STEPS.map((s,i)=>B.person(K+`l-j${i}`,s.x,s.z+.06,1.3,{shirt:kits[i],hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',face:'smile',layer:3}));
  J.forEach((p,i)=>{p.body.dy=STEPS[i].h;});
  const board=B.stand(S.scoreboard(K+'l-board',1.15,1.0,'GOALS'),-4.3,-1.55,{layer:1,s:0});const goals=counter(board,'l-g',.86,.42,.26,['0','10','20'],'31');
  const cup=B.stand(S.trophy(K+'l-cup',.5,.9),-2.5,-1.6,{layer:1,s:0});const up=B.stand(S.arrow(K+'l-up',.7,.4,INK.yellow),-1.3,-1.55,{layer:1,s:0,anchor:'center'});
  const tag=blocks[2].flap(priceTag('l-tag',1.0,.36,'£1 MILLION'),.3,STEPS[2].h-.02,{z:.02});
  const rec=B.stand(S.flipCard(K+'l-rec',1.2,.36,'RECORD FEE',INK.pink),3.3,-1.35,{layer:1,s:0});
  const age=J[2].body.add(S.flipCard(K+'l-25',.44,.34,'25',INK.yellow,INK.navy),.42,J[2].h*1.0,{anchor:'center',z:.02});
  const teens=[[3.1,.9],[3.95,.2],[4.6,1.1]].map(([x,z],i)=>B.person(K+`l-teen${i}`,x,z,.98,{shirt:'navy',hair:(['curly','short','long'] as const)[i],skin:['#7f5138','#d99a6c','#b27650'][i],face:'smile',layer:3}));
  const stars=bd.add(S.stars(K+'l-stars',2.2,.6,8),'R',1.6,2.2,{out:.03});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=b.t;
   // Where is Jamie? 0 Halifax, 1 Fleetwood (2.1), 2 Leicester (17.2). Manual: each tap climbs one step.
   const u1=manual?beat(act,.02,.3):beat(t,3.0,4.2),u2=manual?beat(act,.36,.64):beat(t,18.0,19.2),u3=manual?beat(act,.7,1):beat(t,26.0,26.8);
   J[0].body.s=1-u1;J[1].body.s=u1*(1-u2);J[2].body.s=u2;
   J[1].armR.rot=.12+2.0*beat(t,5,5.6)-2.0*beat(t,7,7.6);cheer(J[1],manual?0:beat(t,12.2,12.8)*(1-beat(t,15,15.6)));
   board.s=manual?u1:beat(t,6.8,7.6);goals.forEach((f,i)=>{f.flip=-3.2*(manual?beat(act,.08+i*.06,.14+i*.06):beat(t,8+i*1.1,8.6+i*1.1));});
   cup.s=manual?u1:beat(t,11.4,12.2);up.s=manual?u1:beat(t,13.2,14);up.rot=Math.PI/2;up.dy=.08*wave(t,14,17,1);
   blocks[2].scale=1;tag.flip=-.25*wave(t,20,25,.8);showPart(tag,manual?u2:beat(t,20.2,21));rec.s=manual?u2:beat(t,22.6,23.4);
   showPart(age,u3);
   teens.forEach((p,i)=>{p.body.s=manual?0:beat(t,28.6+i*.5,29.4+i*.5);p.armR.rot=.12+1.8*beat(t,29.6+i*.4,30.2+i*.4)*(1-beat(t,33.4,34));});
   const joy=manual?beat(act,.8,1):beat(t,35.2,36);cheer(J[2],joy,.25*wave(t,36,40,1.3));showPart(stars,joy);stars.rot=.05*Math.sin(t);
   ban.dy=.04*wave(t,1,40,.6);sun.dy=.3*beat(t,0,2);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,16.4,17.4)+.4*beat(t,17.4,18.4)-.4*beat(t,34.2,35.2):0;
  };
 }};

/* ───────────── 5 · When he nearly quit (doubt) ───────────── */
const doubt:SpreadDef={id:'doubt',rest:14.8,
 left:k=>{pitch(k,-5,0,'#8aa38a','#5f7f6f',.85);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);footprints(k,-2.4,Z(1.2),-4.4,Z(1.6),6,'#5f6b7a');
  k.text('A HARD FIRST SEASON',-2.5,Z(2.6),.36,INK.navy,{max:4.2});k.text('LEICESTER · 2012',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(.2),1.0,1.0));
  k.text('HE STAYED',2.5,Z(2.6),.46,INK.pink,{max:3.8});k.text('NEXT SEASON: 16 LEAGUE GOALS · PROMOTED',2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb','#6f7690',y=>.4-y*.06);hills(k,4.5,3,1.7,'#7f9a82',INK.navy);lightRig(k,.6,.8);lightRig(k,3.9,.75);
    k.hatch(rect(0,2.05,4.5,.4),INK.navy,.08,.78,.008);k.fill(rect(0,2.45,4.5,.55),'#8aa38a');}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.6-y/3*.6);crowd(k,4.5,1.25,2.35,[INK.blue,INK.white,INK.blue,INK.sky,INK.yellow],4);lightRig(k,1.0,.4);lightRig(k,3.6,.4);k.fill(rect(0,2.35,4.5,.65),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('d-rain',1.5,.76),'L',2.3,1.9,{out:.035}),drops=bd.add(S.drops(K+'d-drops',1.2,.6),'L',2.4,1.25,{out:.03});
  const notes=[[3.9,1.3],[1.0,1.4],[3.2,2.35]].map(([a,u],i)=>bd.add(comment(`d-c${i}`,.62,.48),'L',a,u,{out:.04+i*.005}));
  const sun=bd.add(S.sun(K+'d-sun',.4),'L',1.2,2.4,{out:.012}),fw=[bd.add(S.firework(K+'d-fw1',.38,INK.pink),'R',1.2,1.9,{out:.03}),bd.add(S.firework(K+'d-fw2',.34,INK.yellow),'R',3.4,1.8,{out:.03})];
  const conf=bd.add(S.confetti(K+'d-cf',2.4,1.1,3),'R',.5,1.3,{out:.04});
  const noticeB=B.stand(S.scoreboard(K+'d-notice',2.0,1.8,'WHO HELPED?'),-2.3,-1.6,{layer:1});
  noticeB.add(helpers('d-helpers',1.7,1.1),0,.34,{z:.012});const flap=noticeB.flap(lineCard('d-flap',1.7,1.1,['WHO','HELPED?'],INK.pink,INK.white),0,1.44,{z:.028});
  const exit=B.stand(exitSign('d-exit',1.1,1.3),-.75,-.7,{layer:2});
  B.stand(S.bench(K+'d-bench',1.1,.45),-4.1,-1.5,{layer:1});
  const J=B.person(K+'d-j',-2.4,.9,1.36,{shirt:'navy',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',face:'sad',layer:3});B.slot(-3.4,1.1,-1.2,1.1);
  const NP=B.person(K+'d-np',-4.3,.35,1.7,{shirt:'coach',hair:'bald',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const CS=B.person(K+'d-cs',-3.5,1.35,1.7,{shirt:'casual',hair:'short',adult:true,skin:'#e9b08a',face:'smile',layer:3});
  const JR=B.person(K+'d-jr',1.4,.85,1.36,{shirt:'navy',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',legs:'kick',face:'smile',layer:3});
  B.stand(S.goal(K+'d-goal',1.6,.85),3.9,-1.55,{layer:1});
  const board=B.stand(S.scoreboard(K+'d-board',1.15,1.0,'LEAGUE GOALS'),1.9,-1.6,{layer:1,s:0});const goals=counter(board,'d-g',.86,.42,.26,['0','8','12'],'16');
  const cup=B.stand(S.trophy(K+'d-cup',.5,.9),.65,-.6,{layer:2,s:0});const promo=B.stand(S.flipCard(K+'d-promo',1.25,.38,'PROMOTED!',INK.yellow,INK.navy),3.2,1.9,{layer:3,s:0});
  const mates=[[3.0,.1,'curly','#7f5138'],[4.35,.75,'long','#d99a6c']].map(([x,z,h,s],i)=>B.person(K+`d-m${i}`,x as number,z as number,1.3,{shirt:'navy',hair:h as 'short',skin:s as string,face:'smile',layer:2}));
  const ball=ballPair(B,'d-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.8):b.t;
   const lift=Math.max(beat(t,15.4,16.6),manual?beat(act,0,.7):0);
   // A hard first season: lost form, unkind comments online, thinking of leaving.
   J.body.s=beat(t,1.6,2.6)*(1-beat(t,22.2,23));
   const notesA=(i:number)=>beat(t,5.2+i*.9,5.8+i*.9)*(1-lift);notes.forEach((q,i)=>{showPart(q,notesA(i));q.rot=.06*wave(t,6,15,.6+i*.2);});
   const rainA=beat(t,2.2,3.4)*(1-Math.max(beat(t,19,21),manual?beat(act,.3,.9):0));showPart(rain,rainA);showPart(drops,rainA);drops.dy=-.08*((t*1.5)%1)*rainA;
   exit.s=beat(t,9.8,10.6);const leave=beat(t,10.2,12.2)*(1-Math.max(beat(t,19.2,21),manual?beat(act,.4,1):0));J.body.x=-2.4+1.0*leave;J.body.yaw=.5*leave;
   // Who helped: the flap lifts; Nigel Pearson and Craig Shakespeare pop up and convince him to stay.
   flap.flip=-3.2*lift;NP.body.s=manual?beat(act,.3,.8):beat(t,16.6,17.6);CS.body.s=manual?beat(act,.4,.9):beat(t,17.2,18.2);
   NP.armR.rot=.12+1.5*beat(t,18,18.6)-1.5*beat(t,21.4,22)+(manual?1.5*beat(act,.8,1):0);CS.armL.rot=-.12-1.4*beat(t,18.6,19.2)+1.4*beat(t,21.4,22);
   showPart(sun,Math.max(beat(t,20,21),manual?beat(act,.6,1):0));sun.dy=.3*Math.max(beat(t,20,22),manual?beat(act,.6,1):0);
   // The next season: 16 goals, champions, promoted, the players' vote.
   JR.body.s=beat(t,22.4,23.2);board.s=beat(t,22.8,23.6);goals.forEach((f,i)=>{f.flip=-3.2*beat(t,23.6+i*.8,24.1+i*.8);});
   cup.s=beat(t,26.4,27.2);promo.s=beat(t,28,28.8);mates.forEach((m,i)=>{m.body.s=beat(t,26.8+i*.5,27.6+i*.5);m.armL.rot=-.12-2.2*beat(t,31+i*.3,31.6+i*.3);m.armR.rot=.12+2.2*beat(t,31+i*.3,31.6+i*.3);});
   fw.forEach((f,i)=>{showPart(f,beat(t,27+i*.6,27.8+i*.6));f.rot=t*.2;});conf.dy=-1.0+1.2*beat(t,27.2,29.4);conf.visible=t>27;
   let bx:number,bz:number;const sh=[23.6,24.4,25.2];let u=-1;for(const a of sh)if(t>=a&&t<a+.8)u=(t-a)/.6;
   if(u>=0&&u<1){bx=1.8+2.1*smooth(u);bz=.9-2.3*smooth(u);}else{bx=1.8;bz=.9;}
   ball(bx,bz,0,t>22.6);JR.leg!.rot=-1*maxOf(sh.map(a=>pulse(t,a-.3,a+.2)));
   cheer(JR,beat(t,34.8,35.6),.25*wave(t,35.6,39,1.3));NP.armL.rot=-.12-1.8*beat(t,35,35.6);CS.armR.rot=.12+1.8*beat(t,35.2,35.8);
   return b.narrated?-.45*beat(t,1.6,2.6)+.9*beat(t,21.8,22.8)-.45*beat(t,33.8,34.8):0;
  };
 }};

/* ───────────── 6 · Champions of England (champions) ───────────── */
const FANS=[INK.blue,INK.white,INK.blue,INK.sky,INK.yellow,INK.white];
const champions:SpreadDef={id:'champions',rest:17.4,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('11 MATCHES IN A ROW',-2.5,Z(2.62),.36,INK.yellow,{max:4.2});k.text('A NEW PREMIER LEAGUE RECORD',-2.5,Z(2.9),.15,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('CHAMPIONS OF ENGLAND',2.5,Z(2.62),.34,INK.yellow,{max:4.4});k.text('2015–16 · PLAYER OF THE SEASON',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,FANS,1);lightRig(k,1.0,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,FANS,3);lightRig(k,1.2,.3);lightRig(k,3.7,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'c-ban',2.8,.4,'PREMIER LEAGUE 2015–16',INK.blue),'R',.4,2.8,{out:.02});
  const fw=[bd.add(S.firework(K+'c-fw1',.42,INK.pink),'R',1.3,1.8,{out:.03}),bd.add(S.firework(K+'c-fw2',.38,INK.yellow),'L',3.2,1.7,{out:.03}),bd.add(S.firework(K+'c-fw3',.4,INK.sky),'R',3.4,1.6,{out:.03})];
  const conf=[bd.add(S.confetti(K+'c-cf1',2.2,1.1,1),'R',.4,1.3,{out:.04}),bd.add(S.confetti(K+'c-cf2',2.2,1.1,2),'L',.5,1.3,{out:.04})];
  B.stand(S.goal(K+'c-goal',1.6,.85),-4.0,-1.6,{layer:1});
  const keeper=B.person(K+'c-keep',-4.0,-1.25,1.3,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const J=B.person(K+'c-j',-1.6,.55,1.4,{shirt:'navy',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'9',legs:'kick',face:'smile',layer:2});
  const icons=Array.from({length:11},(_,i)=>B.stand(S.icon(K+`c-m${i}`,.3,'ball'),-4.6+i*.39,1.95,{layer:3,s:0,tab:false}));
  const board=B.stand(S.scoreboard(K+'c-board',2.1,1.55,'PREMIER LEAGUE'),2.4,-1.6,{layer:1});
  board.add(lineCard('c-champ',1.6,.72,['CHAMPIONS'],INK.yellow),0,.42,{z:.012});const under=board.flap(lineCard('c-under',1.6,.72,['UNDERDOGS'],'#3d5da0',INK.white),0,1.14,{z:.026});
  const doubts=[[.9,-.5],[4.3,-.4]].map(([x,z],i)=>B.stand(S.sign(K+`c-q${i}`,.55,1.0,'?',INK.white),x,z,{layer:2,s:0}));
  const cup=B.stand(S.trophy(K+'c-cup',.6,1.05),4.45,-1.2,{layer:1,s:0});
  const medal=J.body.add(lineCard('c-pos',1.2,.46,['PLAYER OF','THE SEASON'],INK.pink,INK.white),0,J.h*1.12,{anchor:'center',z:.02});
  const JE=B.person(K+'c-eng',3.7,.75,1.4,{shirt:'ger',hair:'short',hairColor:HAIR_J,skin:SKIN_J,number:'11',face:'smile',layer:3});
  const engCard=JE.body.add(S.flipCard(K+'c-eng-card',.9,.3,'ENGLAND',INK.white,INK.red),0,JE.h*1.08,{anchor:'center',z:.02});
  const boy=B.person(K+'c-boy',1.5,1.35,.95,{shirt:'arg',hair:'short',hairColor:HAIR_J,skin:SKIN_J,face:'smile',layer:3});
  const chart=B.stand(heightChart('c-chart',.28,1.6),.7,.9,{layer:3,s:0});
  const arrowP=B.stand(S.arrow(K+'c-arrow',.8,.36,INK.yellow),2.35,1.7,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'c-ball');
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   // Eleven matches in a row: one ball ticket for each, with a strike into the goal.
   const kicks=[2.6,4.4,6.2,8.0];let bx=-1.2,bz=.65;for(const a of kicks)if(t>=a&&t<a+1.2){const u=clamp01((t-a)/.6);bx=-1.2-2.6*smooth(u);bz=.65-2.1*smooth(u);}
   ball(bx,bz,0,t<10.2);J.leg!.rot=-1*maxOf(kicks.map(a=>pulse(t,a-.3,a+.2)));keeper.body.rot=-.7*maxOf(kicks.map(a=>pulse(t,a+.2,a+1)));
   icons.forEach((q,i)=>{q.s=beat(t,2.4+i*.66,2.8+i*.66);});
   // Underdogs: question marks; champions: the trophy, then the reader flips the scoreboard.
   doubts.forEach((d,i)=>{d.s=beat(t,11+i*.6,11.8+i*.6)*(1-beat(t,15.2,16));});
   cup.s=beat(t,15.4,16.4);
   const flip=Math.max(beat(t,18.2,19.2),manual?beat(act,0,.8):0);under.flip=-3.2*flip;
   fw.forEach((f,i)=>{showPart(f,Math.max(beat(t,15.6+i*.4,16.4+i*.4)*(1-beat(t,18,18.6)),beat(t,19+i*.3,19.8+i*.3)*(1-beat(t,24,25)),beat(t,31+i*.4,31.8+i*.4),manual?beat(act,.5+i*.1,.8+i*.1):0));f.rot=t*.2;});
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*Math.max(beat(t,18.6+i*.4,21+i*.4),manual?beat(act,.4,1):0);c.visible=t>18.4||manual;});
   cheer(J,Math.max(beat(t,16,16.8)*(1-beat(t,19.4,20)),beat(t,31.2,32)),.25*wave(t,32,35.9,1.3));
   // Player of the Season, England, and the boy who was once let go.
   showPart(medal,beat(t,20,20.8)*(1-beat(t,25,25.6)));JE.body.s=beat(t,22.6,23.4);showPart(engCard,beat(t,23,23.8));
   boy.body.s=beat(t,25.8,26.6);chart.s=beat(t,26,26.8);arrowP.s=beat(t,27.4,28.2);arrowP.dx=.08*wave(t,28.2,31,1.2);
   boy.armR.rot=.12+2.0*beat(t,28.4,29)*(1-beat(t,30.4,31));cheer(boy,beat(t,31.4,32.2));cheer(JE,beat(t,31.6,32.4));
   ban.dy=.04*wave(t,1,36,.6);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,10,11)+.4*beat(t,19.4,20.4)-.4*beat(t,30.6,31.4):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={released,steels,trial,ladder,doubt,champions};
void TAU;void poly;
