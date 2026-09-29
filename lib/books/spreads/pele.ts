/**
 * The six Pelé pop-up spreads: the hardships he met (poverty, doubt, injuries at the biggest moments, rough play)
 * and how he kept going, told as original riso paper artwork with narration-timed paper mechanics.
 * Hardship is shown gently and symbolically: a price tag, a bench, a knee wrap, a rain cloud, a closing door.
 * Each spread's pose(beat) is a pure function of Coach Bella's narration time (seconds) and the reader's
 * own action (0–1; the thousand page steps 0, 1/3, 2/3, 1), so pause, seek and replay show the same paper.
 * Timings follow the sentence cues in public/voice/books/pele/narration.json.
 * Kits are plain colours only (no badges): Santos white, Brazil yellow with blue shorts (blue shirts in the 1958 final, when hosts Sweden wore yellow), Italy blue.
 */
import {INK,type Kit,type PlateSpec,type PersonOpts,type Shirt,poly,rect,ell,blob,personSpec,armSpec,legSpec,JOINTS} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,clamp01,PAGE_D,PERSON_SCALE} from '../popupEngine';

const D2=PAGE_D/2;
const Z=(z:number)=>z+D2;
const spec=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key,w,h,paint,...extra});
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

/* ───────────── Pelé and kits ───────────── */
const PELE={skin:'#6e452f',hair:'short' as const,hairColor:'#1c1820'};
const WHITE='#fbf5e6',BRA_BLUE='#2f6fc0';
/** brazil58: in the 1958 final Brazil wore blue shirts, because hosts Sweden kept yellow. */
type KitName='santos'|'brazil'|'brazil58';
type POpts=PersonOpts&{layer?:number;holdL?:'suitcase'|'ball'|'glove'|'none';holdR?:'suitcase'|'ball'|'glove'|'none';yaw?:number;kit?:KitName};
const SHORTS='M104 298 Q153 314 202 300 L206 340 L166 346 L154 324 L144 346 L102 338 Z';
function overBody(k:Kit,kit:KitName,legs:PersonOpts['legs'],adult:boolean,number58?:string){
 k.at(0,0,k.h/512,()=>{
  if(kit==='santos'){k.fill('M104 232 L204 232 L204 246 L104 246 Z',WHITE);k.fill(SHORTS,WHITE);k.key('M110 306 L108 330 M196 308 L198 332',2.4,'#2b2b33');return;}
  if(kit==='brazil58'){const torso=adult?'M108 168 Q152 150 196 168 L206 212 L204 306 Q154 322 102 306 L100 214 Z':'M114 172 Q146 156 184 170 L196 208 L200 304 Q156 320 106 304 L108 220 Z';
   k.fill(torso,BRA_BLUE);k.key(torso,2);k.fill(SHORTS,WHITE);k.key(SHORTS,1.6);
   const socks=legs==='run'?['M84 420 L108 430 L96 450 L72 440 Z','M222 424 L244 412 L256 432 L232 444 Z']:legs==='kick'?['M100 420 L134 424 L128 456 L98 452 Z']:['M100 420 L134 424 L128 456 L98 452 Z','M176 424 L204 420 L208 452 L180 456 Z'];
   for(const sk of socks)k.fill(sk,WHITE);k.key(adult?'M124 170 Q150 192 178 170':'M126 172 Q149 192 172 172',3.4,WHITE);
   if(number58)k.text(number58,152,272,40,WHITE,{font:'Georgia,serif'});return;}
  // Brazil: yellow shirt, blue shorts, white socks, green collar.
  k.fill(SHORTS,BRA_BLUE);k.key('M110 306 L108 330 M196 308 L198 332',2.4,WHITE);
  const socks=legs==='run'?['M84 420 L108 430 L96 450 L72 440 Z','M222 424 L244 412 L256 432 L232 444 Z']:legs==='kick'?['M100 420 L134 424 L128 456 L98 452 Z']:['M100 420 L134 424 L128 456 L98 452 Z','M176 424 L204 420 L208 452 L180 456 Z'];
  for(const s of socks)k.fill(s,WHITE);
  k.key(adult?'M124 170 Q150 192 178 170':'M126 172 Q149 192 172 172',3.4,INK.green);
 });
}
function overArm(k:Kit){k.at(k.w/2,.012,(k.h-.012)/170,()=>{const sl='M-18 4 Q0 -8 18 4 L17 62 L-17 62 Z';k.fill(sl,BRA_BLUE);k.key(sl,1.8);k.circle(0,6,5.5,INK.gold);});}
function overLeg(k:Kit,kit:KitName){k.at(k.w/2,.012,(k.h-.012)/170,()=>{if(kit==='brazil58'){k.fill('M-22 -4 L22 -4 L20 26 L-20 26 Z',WHITE);k.fill('M-13 100 L14 100 L14 136 L-13 136 Z',WHITE);return;}if(kit==='santos'){k.fill('M-22 -4 L22 -4 L20 26 L-20 26 Z',WHITE);}else{k.fill('M-22 -4 L22 -4 L20 26 L-20 26 Z',BRA_BLUE);k.fill('M-13 100 L14 100 L14 136 L-13 136 Z',WHITE);}});}
/** B.person with a plain club/country kit painted over a base shirt (same brads and joints as the engine's person). */
function person(B:Builder,key:string,x:number,z:number,h:number,o:POpts):Person{
 const kit=o.kit;if(!kit)return B.person(key,x,z,h,o);
 h*=PERSON_SCALE;const base:Shirt=kit==='santos'?'ger':'bib';const po:PersonOpts={...o,shirt:base};
 const bs=personSpec(key,h,po);
 const body=B.stand({...bs,paint:k=>{bs.paint(k);overBody(k,kit,o.legs,!!o.adult,o.number);}},x,z,{layer:o.layer??3,yaw:o.yaw});
 const w=h*320/512,jx=(j:number[])=>(j[0]/320-.5)*w,jy=(j:number[])=>h*(1-j[1]/512);
 const arm=(side:'L'|'R')=>{const as=armSpec(`${key}-arm${side}`,h,{shirt:base,skin:o.skin,hold:(side==='L'?o.holdL:o.holdR)??'none',adult:o.adult});return kit==='brazil58'&&!o.adult?{...as,paint:(k:Kit)=>{as.paint(k);overArm(k);}}:as;};
 const armL=body.arm(arm('L'),jx(JOINTS.shoulderL),jy(JOINTS.shoulderL));
 const armR=body.arm(arm('R'),jx(JOINTS.shoulderR),jy(JOINTS.shoulderR));
 armL.rot=-.12;armR.rot=.12;
 let leg:Person['leg'];if(o.legs==='kick'){const ls=legSpec(`${key}-leg`,h,{shirt:base,skin:o.skin});leg=body.arm({...ls,paint:k=>{ls.paint(k);overLeg(k,kit);}},jx(JOINTS.hipR),jy(JOINTS.hipR),{z:-.006});}
 return {body,armL,armR,leg,h};
}

/* ───────────── shared print helpers ───────────── */
function lawn(k:Kit,x0:number,x1:number,y0:number,y1:number,tone=INK.grass){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,tone,.55);k.dots(p,INK.leaf,.06,(x,y)=>.18+.2*Math.sin(x*1.3+y*.7));}
function dirt(k:Kit,d:string){k.fill(d,'#e3b27a',.85);k.dots(d,INK.brown,.055,(x,y)=>.14+.1*Math.sin(x*2.1+y*1.3));}
function cobbles(k:Kit,d:string,x0:number,x1:number,y0:number,y1:number){k.fill(d,INK.stone);k.dots(d,INK.navy,.05,.12);for(let y=y0+.08;y<y1;y+=.16)for(let x=x0+((y*6|0)%2)*.09;x<x1;x+=.18)k.key(ell(x,y,.07,.05),.006,'#9c8a66');}
function pitchPrint(k:Kit,x0:number,x1:number,night=false){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,night?'#3f7f5a':INK.grass,night?.9:.7);
 for(let i=0;i<8;i++){const y=i*PAGE_D/8;if(i%2)k.dots(rect(x0,y,x1-x0,PAGE_D/8),night?INK.navy:INK.leaf,.055,night?.35:.3);}k.dots(p,night?INK.navy:INK.leaf,.08,.12);}
function chalk(k:Kit,d:string,w=.03){k.key(d,w,INK.white);}
function skyPanel(k:Kit,w:number,h:number,top=INK.sky){const p=rect(0,0,w,h);k.fill(p,INK.sky2);k.dots(p,top,.055,(x,y)=>.75-y/h*.75);}
function hotSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,'#ffe3a3');k.dots(p,INK.orange,.055,(x,y)=>.55-y/h*.5);}
function sunsetSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,'#ffc98e');k.dots(p,INK.pink,.055,(x,y)=>.75-y/h*.7);k.dots(rect(0,0,w,h*.45),'#6b5aa8',.06,(x,y)=>.5-y/h*1.1);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1,stand='#2d3f73'){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,stand);k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function flag(k:Kit,x:number,y:number,w:number,h:number,c:'bra'|'swe'|'ita'){const r=rect(x,y,w,h);
 if(c==='bra'){k.fill(r,INK.green);k.fill(poly([[x+w*.08,y+h/2],[x+w/2,y+h*.1],[x+w*.92,y+h/2],[x+w/2,y+h*.9]]),INK.yellow);k.fill(ell(x+w/2,y+h/2,h*.22,h*.22),INK.navy);}
 else if(c==='swe'){k.fill(r,INK.blue);k.fill(rect(x,y+h*.4,w,h*.2),INK.yellow);k.fill(rect(x+w*.3,y,w*.15,h),INK.yellow);}
 else{k.fill(rect(x,y,w/3,h),INK.green);k.fill(rect(x+w/3,y,w/3,h),WHITE);k.fill(rect(x+w*2/3,y,w/3,h),INK.red);}
 k.key(r,.01);k.keyFill(rect(x-.025,y,.02,h*1.9));}
/** Low Bauru houses with tiled roofs, a row across a backdrop panel. */
function casas(k:Kit,x0:number,x1:number,base:number,seed:number,lit=false){const walls=['#f6c9a0','#bfe2ef','#f7e08a','#f4a9b8','#cfe7b0','#fff1d6'];let x=x0,i=0;
 while(x<x1-.3){const w=.55+((i*7+seed)%3)*.14,h=.5+((i*5+seed*3)%4)*.12,wall=rect(x,base-h,w,h);k.fill(wall,walls[(i+seed)%walls.length]);k.dots(wall,INK.orange,.045,.12);k.key(wall,.012);
  const roof=poly([[x-.04,base-h+.02],[x+w*.5,base-h-.2],[x+w+.04,base-h+.02]]);k.fill(roof,INK.red);k.hatch(roof,'#b9383a',.035,-.4,.01);k.key(roof,.012);
  const d=rect(x+w*.14,base-h*.62,w*.2,h*.62);k.fill(d,i%2?INK.blue:INK.green);k.key(d,.01);
  const win=rect(x+w*.52,base-h*.72,w*.3,h*.3);k.fill(win,lit?INK.yellow:INK.sky);k.dots(win,lit?INK.orange:INK.blue,.03,.5);k.key(win,.01);
  x+=w+.06;i++;}}

/* ───────────── Pelé book plates ───────────── */
const sockBall=(key:string,r:number)=>spec(key,r*2.2,r*2.3,k=>{const cx=r*1.1,cy=r*1.28;
 const body=blob([[cx-r,cy],[cx-r*.82,cy-r*.72],[cx,cy-r*.95],[cx+r*.86,cy-r*.68],[cx+r,cy+r*.06],[cx+r*.76,cy+r*.8],[cx,cy+r*.96],[cx-r*.8,cy+r*.72]]);
 k.fill(body,INK.white);k.dots(body,INK.grey,r*.14,(x,y)=>.25+(y-cy)/r*.3);
 for(const [dy,c] of [[-.5,INK.red],[-.3,INK.blue],[.42,INK.red]] as const){const hw=r*Math.sqrt(1-dy*dy)*.9,y=cy+dy*r;k.fill(poly([[cx-hw,y],[cx+hw,y-r*.04],[cx+hw*.98,y+r*.1],[cx-hw*.98,y+r*.13]]),c);}
 const paper=poly([[cx-r*.62,cy-r*.66],[cx-r*.1,cy-r*1.18],[cx+r*.18,cy-r*.8]]);k.fill(paper,'#e9e4d6');k.key(paper,r*.05);for(let i=0;i<3;i++)k.key(`M${cx-r*.42+i*r*.1} ${cy-r*.76-i*r*.08} L${cx-r*.1+i*r*.1} ${cy-r*.9-i*r*.08}`,r*.035,'#8a8578');
 k.key(`M${cx-r} ${cy+r*.05} Q${cx} ${cy+r*.28} ${cx+r} ${cy}`,r*.07,'#b98a4a');k.key(`M${cx+r*.05} ${cy-r*.95} Q${cx+r*.3} ${cy} ${cx} ${cy+r*.96}`,r*.07,'#b98a4a');
 k.key(`M${cx+r*.05} ${cy-r*.95} q${r*.25} ${-r*.3} ${r*.45} ${-r*.2} M${cx+r*.05} ${cy-r*.95} q${-r*.1} ${-r*.3} ${r*.12} ${-r*.3}`,r*.06,'#b98a4a');
 k.key(body,r*.08);},{rim:.02});
const sockLong=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=`M${w*.25} 0 L${w*.62} 0 L${w*.6} ${h*.62} Q${w} ${h*.66} ${w} ${h*.86} Q${w*.98} ${h} ${w*.7} ${h} L${w*.3} ${h} Q${w*.2} ${h*.94} ${w*.22} ${h*.7} Z`;k.fill(p,INK.white);k.dots(p,INK.grey,.025,.3);
 k.fill(rect(w*.25,h*.06,w*.37,h*.1),INK.red);k.fill(rect(w*.25,h*.2,w*.37,h*.06),INK.blue);k.key(p,.012);k.key(`M${w*.3} ${h*.9} Q${w*.5} ${h*.8} ${w*.7} ${h*.9}`,.01,INK.grey);},{rim:.018});
const scraps=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(let i=0;i<3;i++){const cx=w*(.2+i*.3),cy=h*(.55+(i%2)*.15),r=h*.3;const p=blob(Array.from({length:7},(_,j)=>{const a=j/7*Math.PI*2,rr=r*(.75+((j*5+i)%3)*.14);return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];}));k.fill(p,'#ece7da');k.hatch(p,'#8a8578',.022,.3+i,.006);k.key(p,.01);}},{rim:.015});
const crate=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#cf9b62');for(let i=1;i<4;i++)k.key(`M0 ${i*h/4} L${w} ${i*h/4}`,.01,'#8a5238');k.hatch(b,'#8a5238',.03,.05,.005);k.key(`M0 0 L${w} ${h} M${w} 0 L0 ${h}`,.014,'#8a5238');k.key(b,.014);});
const shop=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const wall=rect(w*.04,h*.28,w*.92,h*.72);k.fill(wall,'#f7e08a');k.dots(wall,INK.orange,.04,.15);k.key(wall,.013);
 for(let i=0;i<6;i++){const s=poly([[i*w/6,h*.12],[(i+1)*w/6,h*.12],[(i+1)*w/6,h*.3],[(i+.5)*w/6,h*.36],[i*w/6,h*.3]]);k.fill(s,i%2?WHITE:INK.pink);k.key(s,.01);}
 k.fill(rect(0,0,w,h*.13),INK.blue);k.key(rect(0,0,w,h*.13),.012);
 const win=rect(w*.12,h*.42,w*.56,h*.34);k.fill(win,INK.sky2);k.dots(win,INK.blue,.03,.3);k.key(win,.013);
 const bc=[w*.3,h*.62];k.fill(ell(bc[0],bc[1],h*.1,h*.1),'#b0703f');k.key(ell(bc[0],bc[1],h*.1,h*.1),.012);k.key(`M${bc[0]-h*.1} ${bc[1]} Q${bc[0]} ${bc[1]-h*.04} ${bc[0]+h*.1} ${bc[1]} M${bc[0]} ${bc[1]-h*.1} L${bc[0]} ${bc[1]+h*.1}`,.008,'#5b3420');
 const boot=`M${w*.44} ${h*.6} L${w*.52} ${h*.6} L${w*.53} ${h*.67} Q${w*.62} ${h*.68} ${w*.63} ${h*.72} L${w*.44} ${h*.72} Z`;k.keyFill(boot,'#2b2b33');
 const d=rect(w*.74,h*.46,w*.16,h*.54);k.fill(d,INK.green);k.key(d,.012);k.circle(w*.87,h*.74,.015,INK.gold);});
const priceTag=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M${w/2} 0 L${w/2} ${h*.28}`,.008,INK.navy);const t=poly([[w*.1,h*.36],[w*.5,h*.26],[w*.9,h*.36],[w*.9,h],[w*.1,h]]);k.fill(t,WHITE);k.key(t,.01);k.circle(w/2,h*.36,.012,INK.navy,true);for(let i=0;i<3;i++){k.circle(w*(.28+i*.22),h*.7,w*.1,INK.gold);k.key(ell(w*(.28+i*.22),h*.7,w*.1,w*.1),.006);}},{rim:.012});
const wallHouse=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const hw=w*.42;
 const front=rect(0,h*.22,hw,h*.78);k.fill(front,'#f4a9b8');k.dots(front,INK.pink,.04,.2);k.key(front,.013);
 const roof=poly([[-.03,h*.25],[hw*.5,0],[hw+.03,h*.25]]);k.fill(roof,INK.red);k.hatch(roof,'#b9383a',.035,-.4,.01);k.key(roof,.013);
 const win=rect(hw*.14,h*.4,hw*.34,h*.24);k.fill(win,INK.navy);k.dots(win,INK.blue,.03,.4);k.key(win,.012);
 const d=rect(hw*.6,h*.46,hw*.28,h*.54);k.fill(d,'#3b2e3f');k.key(d,.012);
 const wall=rect(hw,h*.36,w-hw,h*.64);k.fill(wall,'#f3ead2');k.dots(wall,INK.orange,.045,(x,y)=>.08+y/h*.18);k.key(wall,.013);k.fill(rect(hw,h*.33,w-hw,h*.05),INK.red);
 for(let i=0;i<5;i++){const bx=hw+.12+((i*37)%7)/7*(w-hw-.4),by=h*(.45+((i*3)%4)*.12);k.fill(rect(bx,by,.16,.06),'#e0906a');k.key(rect(bx,by,.16,.06),.006);}
 const g=`M${hw+.25} ${h} L${hw+.25} ${h*.56} L${w-.2} ${h*.56} L${w-.2} ${h}`;k.key(g,.024,WHITE);k.hatch(`M${hw+.27} ${h} L${hw+.27} ${h*.58} L${w-.22} ${h*.58} L${w-.22} ${h} Z`,WHITE,.06,.78,.006);
 const tc=[(hw+w)/2,h*.74];k.key(ell(tc[0],tc[1],.12,.12),.016,INK.yellow);k.circle(tc[0],tc[1],.03,INK.yellow);});
const shutter=(key:string,w:number,h:number,color:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);for(let i=1;i<6;i++)k.key(`M0 ${i*h/6} L${w} ${i*h/6}`,.007,'#1f5a3f');k.key(b,.01);},{rim:.01});
const pole=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=rect(w*.44,h*.04,w*.12,h*.96);k.fill(p,INK.wood);k.hatch(p,'#8a5238',.03,1.3,.008);k.key(p,.01);k.fill(rect(0,h*.1,w,h*.04),INK.wood);k.key(rect(0,h*.1,w,h*.04),.01);
 for(const x of [.06,.3,.7,.94])k.circle(w*x,h*.09,.025,INK.white);k.key(`M0 ${h*.09} Q${w*.2} ${h*.16} ${w*.35} ${h*.09}`,.006);});
const kite=(key:string,w:number,h:number,c1:string,c2:string)=>spec(key,w,h,k=>{const cx=w*.5,kh=h*.55;const p=poly([[cx,0],[w*.9,kh*.4],[cx,kh],[w*.1,kh*.4]]);k.fill(p,c1);k.fill(poly([[cx,0],[w*.9,kh*.4],[cx,kh*.4]]),c2);k.fill(poly([[cx,kh],[w*.1,kh*.4],[cx,kh*.4]]),c2);k.key(p,.01);k.key(`M${cx} 0 L${cx} ${kh} M${w*.1} ${kh*.4} L${w*.9} ${kh*.4}`,.006);
 k.key(`M${cx} ${kh} Q${cx+w*.3} ${kh+h*.15} ${cx-w*.1} ${kh+h*.3} Q${cx-w*.3} ${kh+h*.38} ${cx+w*.05} ${h}`,.008);for(let i=0;i<3;i++)k.fill(poly([[cx-.03+i*.01,kh+h*(.12+i*.1)],[cx+.03,kh+h*(.1+i*.1)],[cx+.01,kh+h*(.17+i*.1)]]),i%2?c1:c2);},{rim:.015});
type IconKind='sock'|'fruit'|'paper'|'book'|'heart';
const iconCard=(key:string,s:number,kind:IconKind,label:string,color=INK.white)=>spec(key,s,s*1.25,k=>{const b=rect(0,0,s,s*1.25);k.fill(b,color);k.dots(b,INK.navy,.03,.12);k.key(b,.012);const c=s/2,cy=s*.48;
 if(kind==='sock'){const r=s*.26;const p=blob([[c-r,cy],[c,cy-r],[c+r,cy],[c,cy+r]]);k.fill(p,INK.white);k.fill(rect(c-r*.8,cy-r*.35,r*1.6,r*.22),INK.red);k.key(p,.01);k.key(`M${c} ${cy-r} Q${c+r*.3} ${cy} ${c} ${cy+r}`,.01,'#b98a4a');}
 else if(kind==='fruit'){const r=s*.24;k.fill(ell(c,cy,r,r),'#f6b04a');k.dots(ell(c,cy,r,r),INK.orange,.02,.35);k.key(ell(c,cy,r,r),.01);k.fill(`M${c} ${cy-r} Q${c+r*.5} ${cy-r*1.4} ${c+r*.9} ${cy-r*1.05} Q${c+r*.4} ${cy-r*.85} ${c} ${cy-r} Z`,INK.leaf);}
 else if(kind==='paper'){const p=poly([[c-s*.28,cy-s*.2],[c+s*.24,cy-s*.26],[c+s*.3,cy+s*.2],[c-s*.24,cy+s*.24]]);k.fill(p,'#ece7da');k.key(p,.01);for(let i=0;i<4;i++)k.key(`M${c-s*.18} ${cy-s*.1+i*s*.09} L${c+s*.18} ${cy-s*.14+i*s*.09}`,.008,'#8a8578');k.fill(rect(c-s*.2,cy-s*.2,s*.18,s*.08),'#8a8578');}
 else if(kind==='book'){for(const sg of [-1,1]){const p=poly([[c,cy-s*.16],[c+sg*s*.32,cy-s*.22],[c+sg*s*.32,cy+s*.18],[c,cy+s*.24]]);k.fill(p,sg<0?INK.white:INK.sky2);k.key(p,.01);for(let i=0;i<3;i++)k.key(`M${c+sg*s*.07} ${cy-s*.08+i*s*.08} L${c+sg*s*.25} ${cy-s*.12+i*s*.08}`,.007,INK.blue);}}
 else{k.fill(`M${c} ${cy+s*.2} C${c-s*.36} ${cy-s*.02} ${c-s*.16} ${cy-s*.3} ${c} ${cy-s*.1} C${c+s*.16} ${cy-s*.3} ${c+s*.36} ${cy-s*.02} ${c} ${cy+s*.2} Z`,INK.pink);}
 k.text(label,c,s*1.12,s*.17,INK.navy,{max:s*.88});},{rim:.018});
const station=(key:string,w:number,h:number,name:string,wallC:string)=>spec(key,w,h,k=>{const wall=rect(w*.08,h*.36,w*.84,h*.64);k.fill(wall,wallC);k.dots(wall,INK.orange,.04,.15);k.key(wall,.013);
 const roof=poly([[0,h*.4],[w*.12,h*.18],[w*.88,h*.18],[w,h*.4]]);k.fill(roof,INK.red);k.hatch(roof,'#b9383a',.035,-.3,.01);k.key(roof,.013);
 const board=rect(w*.2,0,w*.6,h*.2);k.fill(board,WHITE);k.key(board,.014);k.text(name,w/2,h*.155,h*.13,INK.navy,{max:w*.54});
 for(let i=0;i<3;i++){const win=rect(w*(.16+i*.26),h*.5,w*.16,h*.24);k.fill(win,i===1?INK.navy:INK.sky);k.dots(win,INK.blue,.03,.4);k.key(win,.011);}
 k.fill(ell(w*.5,h*.3,h*.06,h*.06),WHITE);k.key(ell(w*.5,h*.3,h*.06,h*.06),.01);k.key(`M${w*.5} ${h*.3} L${w*.5} ${h*.26} M${w*.5} ${h*.3} L${w*.53} ${h*.3}`,.008);
 k.fill(rect(0,h*.9,w,h*.1),INK.grey);k.key(rect(0,h*.9,w,h*.1),.01);});
const engine=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const boiler=`M${w*.34} ${h*.3} L${w*.9} ${h*.3} Q${w*.98} ${h*.3} ${w*.98} ${h*.5} Q${w*.98} ${h*.7} ${w*.9} ${h*.7} L${w*.34} ${h*.7} Z`;k.fill(boiler,INK.navy);k.dots(boiler,INK.blue,.03,.35);k.key(boiler,.013,'#101a36');
 for(const x of [.5,.66,.82])k.fill(rect(w*x,h*.3,w*.03,h*.4),INK.gold);
 const cab=rect(w*.04,h*.08,w*.32,h*.66);k.fill(cab,INK.red);k.key(cab,.013);k.fill(rect(0,h*.02,w*.4,h*.08),INK.navy);const cw=rect(w*.1,h*.18,w*.18,h*.2);k.fill(cw,INK.yellow);k.key(cw,.01);
 const chim=poly([[w*.78,h*.3],[w*.78,h*.12],[w*.74,h*.06],[w*.9,h*.06],[w*.86,h*.12],[w*.86,h*.3]]);k.fill(chim,'#2b2b33');k.key(chim,.01);k.fill(rect(w*.56,h*.2,w*.08,h*.1),INK.gold);
 k.fill(poly([[w*.95,h*.72],[w,h*.95],[w*.86,h*.95]]),INK.red);k.circle(w*.97,h*.42,h*.05,INK.yellow);
 for(const [x,r] of [[.2,.16],[.5,.13],[.72,.13]] as const){k.fill(ell(w*x,h*(1-r),h*r,h*r),INK.red);k.key(ell(w*x,h*(1-r),h*r,h*r),.012);k.circle(w*x,h*(1-r),h*.03,INK.navy,true);}
 k.key(`M${w*.2} ${h*.84} L${w*.72} ${h*.87}`,.018,INK.grey);});
const carriage=(key:string,w:number,h:number,color:string)=>spec(key,w,h,k=>{const b=rect(0,h*.14,w,h*.62);k.fill(b,color);k.dots(b,INK.navy,.035,.2);k.key(b,.013);
 k.fill(poly([[-.02,h*.16],[w*.1,h*.02],[w*.9,h*.02],[w+.02,h*.16]]),INK.navy);for(let i=0;i<3;i++){const win=rect(w*(.1+i*.3),h*.26,w*.22,h*.24);k.fill(win,INK.sky2);k.key(win,.01);}
 k.fill(rect(0,h*.62,w,h*.06),INK.yellow);for(const x of [.2,.8]){k.fill(ell(w*x,h*.86,h*.13,h*.13),'#2b2b33');k.circle(w*x,h*.86,h*.04,INK.grey);}
 k.fill(rect(-.05,h*.66,.07,h*.05),'#2b2b33');});
/** A face at the carriage window: the boy riding to the coast. */
const windowKid=(key:string,s:number)=>spec(key,s,s,k=>{k.fill(ell(s/2,s*.55,s*.3,s*.34),PELE.skin);k.key(ell(s/2,s*.55,s*.3,s*.34),.008);k.keyFill(`M${s*.2} ${s*.45} Q${s*.2} ${s*.16} ${s/2} ${s*.16} Q${s*.8} ${s*.16} ${s*.8} ${s*.45} Q${s/2} ${s*.3} ${s*.2} ${s*.45} Z`,PELE.hairColor);
 k.circle(s*.4,s*.55,s*.035,INK.navy,true);k.circle(s*.6,s*.55,s*.035,INK.navy,true);k.key(`M${s*.4} ${s*.7} Q${s/2} ${s*.78} ${s*.6} ${s*.7}`,.008);k.fill(rect(s*.72,s*.6,s*.2,s*.08),PELE.skin);},{rim:.008});
const smoke=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=blob([[w*.1,h*.8],[0,h*.5],[w*.2,h*.2],[w*.45,0],[w*.75,h*.12],[w,h*.45],[w*.85,h*.85],[w*.5,h]]);k.fill(p,WHITE);k.dots(p,INK.grey,.03,(x,y)=>y/h*.6);k.key(`M${w*.25} ${h*.55} Q${w*.4} ${h*.35} ${w*.55} ${h*.5}`,.01,INK.grey);},{rim:.015});
const arrowSign=(key:string,w:number,h:number,a:string,b:string)=>spec(key,w,h,k=>{k.keyFill(rect(w*.46,h*.1,w*.08,h*.9),INK.brown);
 const L=poly([[0,h*.18],[w*.12,h*.06],[w*.92,h*.06],[w*.92,h*.3],[w*.12,h*.3]]);k.fill(L,INK.yellow);k.key(L,.012);k.text(a,w*.52,h*.25,h*.14,INK.navy,{max:w*.72});
 const R=poly([[w*.08,h*.36],[w*.88,h*.36],[w,h*.48],[w*.88,h*.6],[w*.08,h*.6]]);k.fill(R,INK.blue);k.key(R,.012);k.text(b,w*.48,h*.55,h*.14,WHITE,{max:w*.72});});
const noticeBoard=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(const x of [.12,.82])k.keyFill(rect(w*x,h*.5,w*.06,h*.5),INK.brown);const b=rect(0,0,w,h*.66);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.03,.1,.006);k.key(b,.013);
 const card=rect(w*.08,h*.06,w*.84,h*.54);k.fill(card,WHITE);k.key(card,.01);k.text('1956',w/2,h*.33,h*.2,INK.navy);k.text('FIRST TEAM',w/2,h*.47,h*.08,INK.pink,{max:w*.76});k.text('AGED 15',w/2,h*.56,h*.07,INK.navy,{max:w*.7});});
const poster=(key:string,w:number,h:number,title:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.blue);k.dots(b,INK.navy,.035,.3);k.key(b,.012);k.text(title,w/2,h*.4,h*.24,WHITE,{max:w*.84});k.fill(ell(w/2,h*.7,h*.13,h*.13),WHITE);k.key(ell(w/2,h*.7,h*.13,h*.13),.01);k.keyFill(ell(w/2,h*.7,h*.045,h*.045));},{rim:.016});
const rosette=(key:string,r:number,text:string,color=INK.yellow)=>spec(key,r*2,r*2.8,k=>{for(const [dx,c] of [[-1,INK.green],[1,INK.blue]] as const){const t=poly([[r+dx*r*.1,r*1.5],[r+dx*r*.7,r*2.8],[r+dx*r*.35,r*2.55],[r+dx*r*.1,r*2.8],[r+dx*r*.05,r*1.5]]);k.fill(t,c);k.key(t,.01);}
 const s=poly(Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2,rr=i%2?r*.86:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];}));k.fill(s,color);k.dots(s,INK.orange,.03,.3);k.key(s,.012);k.fill(ell(r,r,r*.62,r*.62),WHITE);k.key(ell(r,r,r*.62,r*.62),.01);k.text(text,r,r*1.22,r*.62,INK.navy,{max:r*1.1});},{rim:.02});
const marker=(key:string,label:string,color:string)=>spec(key,.46,.8,k=>{k.keyFill(rect(.03,0,.03,.8),INK.navy);const f=poly([[.06,.02],[.46,.14],[.06,.3]]);k.fill(f,color);k.dots(f,INK.navy,.03,.18);k.key(f,.01);k.text(label,.2,.2,.095,INK.navy,{max:.26});
 k.fill(ell(.045,.78,.06,.025),INK.white);},{rim:.016});
const telstar=(key:string,r:number)=>spec(key,r*2,r*2,k=>{const c=r;k.fill(ell(c,c,r,r),INK.white);k.dots(ell(c,c,r,r),INK.grey,r*.12,(x,y)=>((x-c)+(y-c))/r*.3+.15);
 const pent=(x:number,y:number,s:number,rot:number)=>poly(Array.from({length:5},(_,i)=>[x+Math.cos(i*1.2566+rot)*s,y+Math.sin(i*1.2566+rot)*s]));
 k.keyFill(pent(c,c,r*.26,-1.57),'#15151a');for(let i=0;i<5;i++){const a=i*1.2566-1.57+.628,x=c+Math.cos(a)*r*.8,y=c+Math.sin(a)*r*.8;const p=pent(x,y,r*.24,a);k.keyFill(p,'#15151a');}
 for(let i=0;i<5;i++){const a=i*1.2566-1.57;k.key(`M${c+Math.cos(a)*r*.26} ${c+Math.sin(a)*r*.26} L${c+Math.cos(a)*r*.62} ${c+Math.sin(a)*r*.62}`,r*.035,'#15151a');}
 k.key(ell(c,c,r,r),r*.06,'#15151a');},{rim:.02});
const mural=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,h*.06,w,h*.94);k.fill(b,'#f3ead2');k.dots(b,INK.orange,.045,.14);k.key(b,.014);k.fill(rect(0,h*.02,w,h*.06),INK.red);k.key(rect(0,h*.02,w,h*.06),.01);
 const art=rect(w*.06,h*.14,w*.88,h*.78);k.fill(art,INK.green);k.dots(art,INK.navy,.045,.2);
 k.fill(poly([[w*.12,h*.9],[w*.5,h*.28],[w*.88,h*.9]]),INK.yellow,.9);k.dots(poly([[w*.12,h*.9],[w*.5,h*.28],[w*.88,h*.9]]),INK.orange,.04,.25);
 const cx=w*.5,sy=h*.46;const shirt=`M${cx-w*.2} ${sy} L${cx-w*.08} ${sy-h*.06} Q${cx} ${sy} ${cx+w*.08} ${sy-h*.06} L${cx+w*.2} ${sy} L${cx+w*.26} ${sy+h*.12} L${cx+w*.16} ${sy+h*.15} L${cx+w*.15} ${sy+h*.4} L${cx-w*.15} ${sy+h*.4} L${cx-w*.16} ${sy+h*.15} L${cx-w*.26} ${sy+h*.12} Z`;
 k.fill(shirt,INK.yellow);k.key(shirt,.014);k.key(`M${cx-w*.08} ${sy-h*.06} Q${cx} ${sy+h*.03} ${cx+w*.08} ${sy-h*.06}`,.02,INK.green);k.text('10',cx,sy+h*.3,h*.16,INK.green,{font:'Georgia,serif'});
 const cr=poly([[cx-w*.14,sy-h*.1],[cx-w*.16,sy-h*.26],[cx-w*.07,sy-h*.17],[cx,sy-h*.3],[cx+w*.07,sy-h*.17],[cx+w*.16,sy-h*.26],[cx+w*.14,sy-h*.1]]);k.fill(cr,INK.gold);k.key(cr,.012);for(const dx of [-.08,0,.08])k.circle(cx+w*dx,sy-h*.14,.025,INK.pink);
 k.text('O REI',w*.5,h*.22,h*.07,WHITE,{max:w*.4});k.text('1940 – 2022',w*.5,h*.99,h*.055,INK.navy,{weight:800,max:w*.5});
 for(const [x,y] of [[.16,.3],[.84,.34],[.2,.62],[.82,.66]])k.fill(poly(Array.from({length:10},(_,j)=>[w*x+Math.cos(j*.628-1.57)*(j%2?.03:.07),h*y+Math.sin(j*.628-1.57)*(j%2?.03:.07)])),INK.yellow);});
const crown=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=poly([[0,h*.35],[w*.2,h*.62],[w*.33,h*.1],[w*.5,h*.55],[w*.67,h*.1],[w*.8,h*.62],[w,h*.35],[w*.9,h],[w*.1,h]]);k.fill(p,INK.gold);k.dots(p,INK.orange,.035,(x)=>.12+x/w*.4);k.key(p,.014);
 k.fill(rect(w*.1,h*.78,w*.8,h*.1),INK.red);for(const [x,c] of [[.3,INK.blue],[.5,INK.pink],[.7,INK.green]] as const)k.circle(w*x,h*.83,h*.06,c);for(const x of [0,.33,.67,1])k.circle(w*x,h*(x===0||x===1?.35:.1),h*.06,INK.white);},{rim:.022});
const flowers=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const n=Math.round(w/.2);for(let i=0;i<n;i++){const x=(i+.5)*w/n,top=h*(.2+((i*3)%4)*.1);k.key(`M${x} ${h} Q${x+.03} ${(h+top)/2} ${x} ${top}`,.014,INK.green);k.fill(ell(x+.05,(h+top)/2+.04,.05,.025),INK.leaf);
 const c=[INK.yellow,INK.pink,WHITE,INK.orange][i%4];for(let j=0;j<5;j++){const a=j*1.2566;k.fill(ell(x+Math.cos(a)*.04,top+Math.sin(a)*.04,.035,.035),c);}k.circle(x,top,.025,j2(i));}
 function j2(i:number){return i%2?INK.orange:INK.brown;}},{rim:.018});
const cupCard=(key:string,w:number,h:number,year:string)=>spec(key,w,h,k=>{const b=rect(0,h*.72,w,h*.28);k.fill(b,INK.navy);k.key(b,.01);k.text(year,w/2,h*.94,h*.2,INK.yellow,{max:w*.84});
 const cx=w/2,top=h*.02;const cup=`M${cx-w*.2} ${top+h*.36} Q${cx-w*.34} ${top+h*.06} ${cx-w*.12} ${top} L${cx+w*.12} ${top} Q${cx+w*.34} ${top+h*.06} ${cx+w*.2} ${top+h*.36} Q${cx+w*.1} ${top+h*.44} ${cx} ${top+h*.44} Q${cx-w*.1} ${top+h*.44} ${cx-w*.2} ${top+h*.36} Z`;
 k.fill(cup,INK.gold);k.dots(cup,INK.orange,.025,(x)=>.12+(x-cx)/w*.8);k.key(cup,.01);const st=poly([[cx-w*.06,top+h*.44],[cx+w*.06,top+h*.44],[cx+w*.16,h*.72],[cx-w*.16,h*.72]]);k.fill(st,INK.gold);k.key(st,.01);},{rim:.018});
const streetDeck=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const d=rect(0,0,w,h);cobbles(k,d,0,w,0,h);k.fill(rect(0,0,w,h*.08),INK.grey);k.fill(rect(0,h*.92,w,h*.08),INK.grey);k.key(d,.014);for(let i=0;i<3;i++)k.fill(rect(w*.2+i*w*.26,h*.47,w*.14,h*.05),WHITE,.9);},{rim:.02});
const fieldStrip=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=blob([[0,h],[0,h*.5],[w*.2,h*.2],[w*.45,h*.4],[w*.7,h*.1],[w,h*.45],[w,h]]);k.fill(p,INK.leaf);k.dots(p,INK.navy,.04,.2);k.key(p,.012);for(let i=0;i<Math.round(w/.18);i++){const x=.1+i*.18;k.key(`M${x} ${h} L${x+.05} ${h*.55}`,.012,INK.green);}});
const hut=(key:string,w:number,h:number,c:string)=>spec(key,w,h,k=>{const wall=rect(w*.08,h*.35,w*.84,h*.65);k.fill(wall,c);k.dots(wall,INK.orange,.04,.15);k.key(wall,.012);const roof=poly([[0,h*.4],[w*.5,0],[w,h*.4]]);k.fill(roof,INK.red);k.hatch(roof,'#b9383a',.035,-.4,.01);k.key(roof,.012);
 const d=rect(w*.4,h*.6,w*.2,h*.4);k.fill(d,INK.navy);k.key(d,.01);const win=rect(w*.16,h*.5,w*.16,h*.16);k.fill(win,INK.yellow);k.key(win,.01);});

/* ───────────── hardship plates ───────────── */
const grapefruit=(key:string,r:number)=>spec(key,r*2.2,r*2.4,k=>{const cx=r*1.1,cy=r*1.34;k.fill(ell(cx,cy,r,r),'#f6b04a');k.dots(ell(cx,cy,r,r),INK.orange,r*.16,(x,y)=>.2+((x-cx)+(y-cy))/r*.25);
 for(let i=0;i<7;i++){const a=i*.9,d=r*.55;k.circle(cx+Math.cos(a)*d,cy+Math.sin(a)*d,r*.05,'#d98a2e');}k.key(ell(cx,cy,r,r),r*.07);
 const leaf=`M${cx} ${cy-r} Q${cx+r*.5} ${cy-r*1.35} ${cx+r*.8} ${cy-r*1.05} Q${cx+r*.4} ${cy-r*.9} ${cx} ${cy-r} Z`;k.fill(leaf,INK.leaf);k.key(leaf,r*.05);},{rim:.02});
/** The tea tray the boy carried when he worked as a server in tea shops. */
const teaTray=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const tray=rect(0,h*.78,w,h*.12);k.fill(tray,INK.wood);k.key(tray,.01);
 for(const x of [.28,.7]){const cx=w*x,top=h*.46;const cup=`M${cx-w*.14} ${top} L${cx+w*.14} ${top} L${cx+w*.1} ${h*.78} L${cx-w*.1} ${h*.78} Z`;k.fill(cup,WHITE);k.key(cup,.01);k.fill(rect(cx-w*.13,top+.01,w*.26,h*.06),INK.pink);
  k.key(`M${cx+w*.12} ${top+h*.08} q${w*.08} ${h*.06} 0 ${h*.14}`,.01);k.key(`M${cx-w*.04} ${top-h*.06} q${w*.05} ${-h*.12} 0 ${-h*.24} q${-w*.05} ${-h*.1} 0 ${-h*.18}`,.01,INK.grey);}},{rim:.012});
/** A plain cream knee wrap: the only sign of an injury in this book. */
const kneeWrap=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,WHITE);for(let i=1;i<4;i++)k.key(`M${i*w/4} 0 L${i*w/4-w*.08} ${h}`,.006,INK.grey);k.key(b,.008);},{rim:.008});
const flagPlate=(key:string,c:'bra'|'swe'|'ita')=>spec(key,.5,.66,k=>flag(k,.06,.03,.4,.28,c),{rim:.014});
/** A stone archway whose door can close (the 1966 exit) and open again (the 1970 return). */
const gate=(key:string,w:number,h:number,label:string)=>spec(key,w,h,k=>{const frame=`M0 ${h} L0 ${h*.2} Q${w/2} ${-h*.04} ${w} ${h*.2} L${w} ${h} L${w*.8} ${h} L${w*.8} ${h*.32} Q${w/2} ${h*.2} ${w*.2} ${h*.32} L${w*.2} ${h} Z`;
 k.fill(rect(w*.2,h*.3,w*.6,h*.7),INK.sky2);k.dots(rect(w*.2,h*.3,w*.6,h*.7),INK.blue,.04,.3);k.fill(rect(w*.2,h*.84,w*.6,h*.16),INK.grass);
 k.fill(frame,'#bdb8aa');k.dots(frame,INK.navy,.04,.2);k.key(frame,.013);for(let i=0;i<5;i++)k.key(`M0 ${h*(.4+i*.12)} L${w*.2} ${h*(.4+i*.12)} M${w*.8} ${h*(.4+i*.12)} L${w} ${h*(.4+i*.12)}`,.007,'#8a8578');
 k.text(label,w/2,h*.2,h*.085,INK.navy,{max:w*.66,weight:800});});
const rainCloud=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const p=blob([[w*.08,h*.95],[0,h*.62],[w*.18,h*.4],[w*.3,h*.1],[w*.55,0],[w*.72,h*.22],[w*.9,h*.3],[w,h*.68],[w*.9,h*.95]]);k.fill(p,'#b9bfca');k.dots(p,INK.navy,.045,(x,y)=>.1+y/h*.35);k.key(p,.012);},{rim:.02});
function greySky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,'#dfe4ea');k.dots(p,'#7f8aa0',.055,(x,y)=>.6-y/h*.5);}
function andes(k:Kit,w:number,y:number){const mt=`M0 ${y} L.5 ${y-.55} L1.1 ${y-.2} L1.8 ${y-.75} L2.6 ${y-.25} L3.3 ${y-.65} L4 ${y-.3} L${w} ${y-.5} L${w} ${y+.2} L0 ${y+.2} Z`;k.fill(mt,'#8f86b0');k.dots(mt,INK.navy,.05,.3);
 for(const [x,t] of [[.5,.55],[1.8,.75],[3.3,.65]] as const)k.fill(poly([[x-.16,y-t+.2],[x,y-t],[x+.16,y-t+.2]]),WHITE);}

/* ───────────── 1 · A ball made from a sock (sock): poverty, making do ───────────── */
const sock:SpreadDef={id:'sock',rest:20.9,
 left:k=>{dirt(k,rect(-5,0,5,PAGE_D));lawn(k,-5,-3.2,Z(1.9),PAGE_D);lawn(k,-5,0,0,Z(-1.9));
  const path=`M-5 ${Z(.95)} Q-3 ${Z(1.35)} -.02 ${Z(1.05)} L-.02 ${Z(1.95)} Q-3 ${Z(2.1)} -5 ${Z(1.9)} Z`;k.fill(path,'#d59a5e',.6);
  for(let i=0;i<14;i++){const x=-4.7+((i*37)%41)/41*4.2,y=Z(-1.6)+((i*23)%29)/29*2;k.key(`M${x} ${y} l.05 -.1 M${x+.04} ${y} l.06 -.08`,.012,INK.green);}
  k.text('BAURU',-2.5,Z(2.62),.62,INK.blue,{max:3.6});k.text('BRAZIL · 1940',-2.5,Z(2.92),.17,INK.navy,{weight:800,max:3.4});},
 right:k=>{dirt(k,rect(0,0,5,PAGE_D));lawn(k,0,5,0,Z(-1.5));
  const road=`M0 ${Z(-.7)} L5 ${Z(-.55)} L5 ${Z(1.95)} L0 ${Z(1.95)} Z`;cobbles(k,road,0,5,Z(-.7),Z(1.95));k.key(`M0 ${Z(-.7)} L5 ${Z(-.55)} M0 ${Z(1.95)} L5 ${Z(1.95)}`,.02,INK.navy);
  k.key(`M2.3 ${Z(1.2)} Q3.1 ${Z(.1)} 3.55 ${Z(-.85)}`,.02,INK.white);k.key(`M2.45 ${Z(1.3)} Q3.35 ${Z(.2)} 3.75 ${Z(-.8)}`,.012,INK.yellow);
  k.text('A SOCK BALL',2.5,Z(2.55),.36,INK.pink,{max:3.9});k.text('stuffed with newspaper',2.5,Z(2.85),.17,INK.navy,{weight:700,max:3.4});},
 build:B=>{
  const bd=B.vfold({key:'pele-s-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 3 L0 1.9 Q1.2 1.5 2.4 1.8 Q3.5 2.05 4.5 1.75 L4.5 3 Z`;k.fill(hills,INK.grass);k.dots(hills,INK.leaf,.05,.35);casas(k,.1,4.5,2.55,1);k.fill(rect(0,2.55,4.5,.45),'#e3b27a');k.dots(rect(0,2.55,4.5,.45),INK.brown,.05,.2);
    const church=`M1.9 1.0 L2.25 1.0 L2.25 2.0 L1.9 2.0 Z`;k.fill(church,WHITE);k.key(church,.012);k.fill(poly([[1.86,1.02],[2.075,.7],[2.29,1.02]]),INK.blue);k.key(`M2.075 .7 L2.075 .5 M2.02 .57 L2.13 .57`,.014);}},
   {key:'pele-s-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 2 Q1.5 1.5 2.8 1.85 Q3.8 2.1 4.5 1.6 L4.5 3 L0 3 Z`;k.fill(hills,INK.leaf);k.dots(hills,INK.navy,.05,.2);casas(k,0,4.4,2.6,4);k.fill(rect(0,2.6,4.5,.4),'#e3b27a');
    k.key(`M.2 1.6 Q1.6 1.9 3 1.55 Q3.8 1.4 4.5 1.5`,.01);for(let i=0;i<6;i++){const x=.5+i*.55,y=1.62+Math.sin(i*1.1)*.12;k.fill(rect(x,y,.22,.2),[INK.pink,INK.yellow,WHITE,INK.sky][i%4]);k.key(rect(x,y,.22,.2),.008);}}},-3.05,1.22);
  const sunP=bd.add(S.sun('pele-s-sun',.4),'L',3.3,1.35,{out:.015}),cloudR=bd.add(S.cloud('pele-s-cloud',1.0,.46),'R',1.4,2.45);
  const kiteP=bd.add(kite('pele-s-kite',.5,1.0,INK.pink,INK.yellow),'R',3.4,2.3,{out:.02});
  const banner=bd.add(S.banner('pele-s-ban2',3.3,.42,'MAKE THE MOST OF WHAT YOU HAVE',INK.pink),'R',1.8,1.2,{out:.025});
  // Left page: the family home in Bauru.
  const home=B.stand(S.house('pele-s-house',1.8,1.6),-3.15,-1.35,{layer:1});
  const door=home.flap(S.door('pele-s-door',.28,.44),-.1,.02,{anchor:'bl',axis:'y',z:.012});
  B.stand(S.tree('pele-s-mango',1.2,1.6,'round'),-4.55,-.95,{layer:1});
  const post=B.stand(S.sign('pele-s-sign',1.2,1.3,''),-1.5,-1.1,{layer:1});
  post.add(S.flipCard('pele-s-bauru',1.1,.46,'BAURU',INK.blue),0,.8,{z:.014});
  const born=post.flap(S.flipCard('pele-s-brazil',1.1,.46,'BRAZIL',INK.pink),0,1.26,{z:.026});
  const year=B.stand(S.flipCard('pele-s-1940',.7,.44,'1940',INK.yellow,INK.navy),-.62,-1.55,{layer:1,s:0});
  const mum=B.person('pele-s-mum',-4.2,.05,1.8,{shirt:'casual',hair:'bun',adult:true,skin:'#7f5138',face:'smile',layer:2});
  const dad=B.person('pele-s-dad',-3.3,.6,1.85,{shirt:'coach',hair:'short',adult:true,skin:'#6e452f',hairColor:'#1c1820',face:'grin',layer:3});
  const dname=B.stand(S.flipCard('pele-s-dondinho',1.05,.34,'DONDINHO',INK.yellow,INK.navy),-3.75,1.8,{layer:3,s:0});
  const boy=B.person('pele-s-boy',-2.35,1.0,1.18,{shirt:'casual',...PELE,face:'grin',layer:3});B.slot(-2.35,1.12,-1.95,1.12);
  const tray=boy.body.add(teaTray('pele-s-tea',.46,.4),.34,boy.h*.42,{z:.03});
  const box=B.stand(crate('pele-s-crate',.6,.42),-1.4,.55,{layer:3});
  const fruit=box.add(grapefruit('pele-s-fruit',.12),0,.42,{z:.02});
  const sockP=box.add(sockLong('pele-s-sock',.36,.46),-.05,.42,{z:.024}),paper=box.add(scraps('pele-s-scraps',.5,.2),.05,.62,{z:.03}),made=box.add(sockBall('pele-s-ball',.12),0,.42,{z:.035});
  B.stand(S.grassStrip('pele-s-grass',1.3,.3),4.3,3.02,{layer:3,tab:false});
  // The street: two cobbled halves stand closed across the gutter until the reader opens it.
  const deckL=B.flat(streetDeck('pele-s-deckL',.96,1.1),-.98,2.02,{edge:'left',hinge:-1.4}),deckR=B.flat(streetDeck('pele-s-deckR',.96,1.1),.98,2.02,{edge:'right',hinge:1.4});
  // Right page: the shop window with a ball the family could not afford, and the wall he kicked against.
  const shopP=B.stand(shop('pele-s-shop',1.3,1.2),1.45,-1.45,{layer:1});
  const tag=shopP.flap(priceTag('pele-s-tag',.26,.32),-.2,.78,{z:.02});
  const wall=B.stand(wallHouse('pele-s-wall',2.1,1.45),3.55,-1.25,{layer:1});
  const shL=wall.flap(shutter('pele-s-shL',.15,.35,INK.green),-.927,.52,{anchor:'bl',axis:'y',z:.014}),shR=wall.flap(shutter('pele-s-shR',.15,.35,INK.green),-.627,.52,{anchor:'br',axis:'y',z:.014});
  B.stand(pole('pele-s-pole',.7,2.1),4.7,-.45,{layer:2});
  const kid=B.person('pele-s-kid',2.3,1.2,1.18,{shirt:'casual',...PELE,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(sockBall('pele-s-sball',.11),2.7,1.35,{layer:3,tab:false});B.slot(2.75,1.3,3.5,-.95);
  const pal1=B.person('pele-s-pal1',1.25,.2,1.12,{shirt:'fan',hair:'curly',skin:'#b27650',face:'grin',layer:2});
  const pal2=B.person('pele-s-pal2',4.4,.95,1.1,{shirt:'bib',hair:'short',skin:'#d99a6c',face:'smile',layer:3});
  const icons=[iconCard('pele-s-i1',.42,'fruit','GRAPEFRUIT'),iconCard('pele-s-i2',.42,'sock','SOCK'),iconCard('pele-s-i3',.42,'paper','NEWSPAPER')].map((c,i)=>B.stand(c,1.55+i*.55,2.08,{layer:3,s:0}));
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   sunP.dy=-.35*beat(t,0,2.2);cloudR.dx=-.7*beat(t,0,42)+.2;kiteP.rot=.12*Math.sin(t*1.3);kiteP.dy=-.08*Math.sin(t*.9);
   // Born in Brazil in 1940; the door of the family home opens.
   year.s=beat(t,3.4,4.4);door.flip=-1.3*beat(t,2.4,3.4)+1.3*beat(t,20,20.8);
   mum.armR.rot=.12+1.6*beat(t,2.6,3.4)-1.6*beat(t,6.8,7.6)+.25*wave(t,3.4,6.8,1.2);
   // He grew up in poverty in Bauru: the sign flips to BAURU and the family draws close.
   born.flip=-2.8*beat(t,9,10);
   mum.armL.rot=-.12-.45*beat(t,9.4,10.2)+.45*beat(t,11.6,12.2);dad.armR.rot=.12+.5*beat(t,9.6,10.4)-.5*beat(t,11.6,12.2);
   boy.body.yaw=-.3*pulse(t,9.2,11.9);
   // Earning money as a server in tea shops: the boy carries the tea tray along the slot.
   const tea=beat(t,12.2,12.9)*(1-beat(t,15.3,15.9));tray.visible=tea>.01;tray.scale=Math.max(.001,tea);tray.dy=.02*wave(t,13,15.2,1.6);
   boy.body.x=-2.35+.35*beat(t,12.6,14)-.35*beat(t,14.8,15.8);
   // His father, Dondinho, a footballer, taught his son to play.
   dname.s=beat(t,16.2,17);dname.dy=.05*pulse(t,16.2,17.4);
   dad.armL.rot=-.12-1.9*beat(t,16.8,17.4)+1.9*beat(t,19.8,20.4)-.25*wave(t,17.4,19.8,1.3);
   // Open the street: the cobbled halves come down, shutters open, the friends run out.
   const open=Math.max(n?beat(t,21.2,22.6):0,act);deckL.s=.03+.97*open;deckR.s=.03+.97*open;
   shL.flip=-1.9*beat(open,.2,.8);shR.flip=1.9*beat(open,.2,.8);
   kid.body.s=Math.max(n?beat(t,21.8,22.8):0,beat(act,.35,.85));pal1.body.s=Math.max(n?beat(t,22.2,23.2):0,beat(act,.45,.95));pal2.body.s=Math.max(n?beat(t,3,4):1,beat(act,.2,.5));
   // They could not afford a proper ball: the price tag on the shop ball swings; the kid looks, then turns away.
   tag.flip=-.5*wave(t,23.4,26.2,1.1);tag.rot=.3*wave(t,23.4,26.2,.8);kid.body.yaw=-.35*pulse(t,23.3,26.2);
   // A grapefruit, or a sock stuffed with newspaper and tied up: made on the crate.
   icons.forEach((c,i)=>{const at=[26.6,28.3,29.6][i];c.s=beat(t,at,at+.8);c.dy=.06*pulse(t,at,at+1.2);});
   fruit.scale=Math.max(.001,beat(t,26.6,27.2)*(1-beat(t,28,28.4)));fruit.visible=t>26.5&&t<28.5;fruit.rot=.3*wave(t,27.2,28,1.2);
   sockP.scale=Math.max(.001,beat(t,28.3,29)*(1-beat(t,31,31.5)));sockP.visible=t>28.2&&t<31.6;
   paper.visible=t>29.6&&t<31.3;paper.dy=-.34*beat(t,29.8,31);paper.scale=Math.max(.001,1-.6*beat(t,30.2,31.2));
   made.scale=Math.max(.001,beat(t,31,31.8));made.visible=t>30.9||!n;made.rot=.3*wave(t,31.8,32.6,1.4);
   boy.armR.rot=.12+1.1*beat(t,12.3,12.9)-1.1*beat(t,15.3,15.9)+1.4*beat(t,28.4,29)-1.4*beat(t,31.4,32)+.4*pulse(t,17.6,19.8);
   boy.armL.rot=-.12-.5*pulse(t,17.4,20);
   // He played for small teams and kept on playing: three kicks against the wall.
   const kicks=[33,34.4,35.8];let travel=0,swing=0;
   for(const at of kicks){travel=Math.max(travel,pulse(t,at,at+1.2));swing=Math.max(swing,pulse(t,at-.3,at+.2));}
   const actKick=n?0:pulse(act,.55,1)*(act<1?1:0);travel=Math.max(travel,actKick);
   kid.leg!.rot=-1.1*Math.max(swing,n?0:pulse(act,.45,.7));
   ball.x=2.72+.8*travel;ball.z=1.3-2.2*travel;ball.rot=-travel*8;
   kid.armL.rot=-.12-.5*swing;kid.armR.rot=.12+.5*swing+2.3*beat(t,37,37.8);
   pal1.armL.rot=-.12-2.3*beat(t,36.4,37)-.3*wave(t,37,41,1.5);pal2.armR.rot=.12+2.5*beat(t,35.2,35.8)+.3*wave(t,35.8,41,1.4)+2*beat(act,.8,1)*(n?0:1);
   // Make the most of what you have.
   banner.dy=-.9+.9*beat(t,37,38);banner.visible=t>36.8;
   return n?-.6*beat(t,2.2,3.4)+.6*beat(t,20.9,21.8)+.6*beat(t,23.2,24)-.6*beat(t,26.3,27.1)+.6*beat(t,32.5,33.3)-.6*beat(t,36.9,37.8):(act>0?.3*act:0);
  };
 }};

/* ───────────── 2 · Too young? (santos): doubted, then believed in ───────────── */
const santos:SpreadDef={id:'santos',rest:28.2,
 left:k=>{lawn(k,-5,0,0,PAGE_D,INK.grass);for(let i=0;i<6;i++){const y=Z(-1.9)+i*.28;k.key(`M-5 ${y} Q-3 ${y-.12} -1.4 ${y+.02}`,.03,INK.green);}
  const ear=`M-5 ${Z(-.1)} L0 ${Z(-.1)} L0 ${Z(.85)} L-5 ${Z(.85)} Z`;dirt(k,ear);
  k.fill(rect(-5,Z(.28),5,.3),'#b9a88a');for(let x=-4.9;x<0;x+=.16)k.fill(rect(x,Z(.25),.07,.36),INK.brown);k.key(`M-5 ${Z(.3)} L0 ${Z(.3)} M-5 ${Z(.52)} L0 ${Z(.52)}`,.022,'#3a3a40');
  const court=rect(-4.85,Z(1.0),3.9,1.4);k.fill(court,'#e79a5c');k.dots(court,INK.red,.05,.16);k.key(court,.024,WHITE);k.key(`M-2.9 ${Z(1.0)} L-2.9 ${Z(2.4)}`,.02,WHITE);k.key(ell(-2.9,Z(1.7),.26,.26),.02,WHITE);
  k.key(`M-.95 ${Z(1.35)} Q-1.4 ${Z(1.7)} -.95 ${Z(2.05)}`,.02,WHITE);k.key(`M-4.85 ${Z(1.35)} Q-4.4 ${Z(1.7)} -4.85 ${Z(2.05)}`,.02,WHITE);
  k.text('FUTSAL',-3.9,Z(2.3),.16,WHITE,{weight:800});k.text('BAURU',-2.9,Z(2.82),.46,INK.blue,{max:3.4});},
 right:k=>{const sand=rect(0,0,5,PAGE_D);k.fill(sand,INK.sand,.85);k.dots(sand,INK.orange,.06,.12);
  const sea=`M1.6 0 L5 0 L5 ${Z(-.6)} Q3.6 ${Z(-.95)} 2.4 ${Z(-1.5)} Q1.9 ${Z(-2)} 1.6 ${Z(-2.6)} Z`;k.fill(sea,INK.sky);k.dots(sea,INK.blue,.05,.5);for(let i=0;i<4;i++)k.key(`M${2.8+i*.4} ${Z(-1.1)-i*.14} q.15 -.08 .3 0`,.012,WHITE);
  k.fill(rect(0,Z(.28),5,.3),'#b9a88a');for(let x=.05;x<5;x+=.16)k.fill(rect(x,Z(.25),.07,.36),INK.brown);k.key(`M0 ${Z(.3)} L5 ${Z(.3)} M0 ${Z(.52)} L5 ${Z(.52)}`,.022,'#3a3a40');
  const pitch=rect(.6,Z(1.25),4.2,1.25);k.fill(pitch,INK.grass,.85);k.dots(pitch,INK.leaf,.06,.25);k.key(pitch,.022,WHITE);k.key(`M2.7 ${Z(1.25)} L2.7 ${Z(2.5)}`,.02,WHITE);
  k.text('SANTOS',2.7,Z(2.85),.5,INK.pink,{max:3.2});k.text('BY THE SEA',2.7,Z(3.1),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:'pele-t-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 3 L0 1.7 Q1.3 1.35 2.5 1.7 Q3.6 2 4.5 1.65 L4.5 3 Z`;k.fill(hills,INK.grass);k.dots(hills,INK.leaf,.05,.35);
    for(let r=0;r<4;r++)k.key(`M0 ${2.1+r*.22} Q2.2 ${1.95+r*.24} 4.5 ${2.1+r*.2}`,.03,INK.green);casas(k,2.4,4.5,2.1,2);
    for(let i=0;i<5;i++){const x=.3+i*.42;k.fill(ell(x,1.85,.18,.2),INK.green);k.keyFill(rect(x-.02,1.95,.04,.2),INK.brown);}}},
   {key:'pele-t-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const mt=`M0 2.2 L0 1.0 Q.6 .8 1.1 1.2 Q1.6 1.5 2.2 2.1 L2.2 3 L0 3 Z`;k.fill(mt,INK.green);k.dots(mt,INK.navy,.05,.3);
    for(let i=0;i<4;i++){const x=.1+i*.2,h=.25+(i%3)*.12;k.fill(rect(x,1.05-h,.16,h),'#bdb8aa');k.key(rect(x,1.05-h,.16,h),.008);}
    const sea=rect(1.6,2.1,2.9,.9);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);for(let i=0;i<5;i++)k.key(`M${1.8+i*.55} ${2.3+(i%2)*.2} q.12 -.06 .24 0`,.012,WHITE);
    const beach=`M1.4 3 L1.4 2.4 Q2.6 2.2 4.5 2.55 L4.5 3 Z`;k.fill(beach,INK.sand);k.dots(beach,INK.orange,.05,.15);
    k.keyFill(rect(3.6,1.2,.05,.95),'#2b2b33');k.keyFill(poly([[3.2,1.22],[4.3,1.22],[4.3,1.3],[3.2,1.3]]),'#2b2b33');k.key(`M3.3 1.3 L3.3 1.8`,.008,'#2b2b33');
    const ship=poly([[2.3,2.02],[3.1,2.02],[2.95,2.16],[2.4,2.16]]);k.fill(ship,INK.red);k.key(ship,.01);k.fill(rect(2.5,1.88,.3,.14),WHITE);k.key(rect(2.5,1.88,.3,.14),.008);}},-3.05,1.22);
  const sunP=bd.add(S.sun('pele-t-sun',.38),'R',3.4,1.0,{out:.015}),cloud=bd.add(S.cloud('pele-t-cloud',1.1,.5),'L',1.4,2.4),gulls=bd.add(S.birds('pele-t-gulls',.9,.35),'R',2.2,1.8,{out:.02});
  const ban=bd.add(S.banner('pele-t-ban2',3.0,.42,'BELIEVE IN YOURSELF',INK.blue),'L',1.7,1.25,{out:.025});
  // Left: Bauru, its futsal court and the station.
  B.stand(S.tree('pele-t-tree',1.1,1.5,'round'),-4.6,-.5,{layer:1});
  B.stand(hut('pele-t-hut',1.0,.9,'#f7e08a'),-3.6,-1.3,{layer:1});
  B.stand(station('pele-t-bauru',1.9,1.25,'BAURU','#f6c9a0'),-1.55,-.55,{layer:1});
  const sign=B.stand(S.sign('pele-t-sign',1.3,1.3,''),-2.75,.62,{layer:2});
  sign.add(S.flipCard('pele-t-top',1.2,.46,'TOP SCORER',INK.yellow,INK.navy),0,.8,{z:.014});
  const doubt=sign.flap(S.flipCard('pele-t-tooyoung',1.2,.46,'TOO YOUNG?',INK.pink),0,1.26,{z:.026});
  const ump=B.person('pele-t-ump',-4.15,.7,1.75,{shirt:'navy',hair:'bald',adult:true,skin:'#d99a6c',face:'open',layer:2});
  const hmm=ump.body.add(S.bubble('pele-t-hmm',.55,.46,'dots'),.5,1.95,{z:-.02});
  const fgoal=B.stand(S.goal('pele-t-fgoal',.8,.48),-1.45,1.5,{layer:2});
  const kid=B.person('pele-t-kid',-3.55,1.85,1.2,{shirt:'casual',...PELE,legs:'kick',face:'grin',layer:3});
  const fball=B.stand(S.ball('pele-t-fball',.09),-3.2,1.9,{layer:3,tab:false});B.slot(-3.2,1.9,-1.7,1.55);
  const star=kid.body.add(S.bubble('pele-t-star',.52,.44,'star'),.45,1.5,{z:-.02});
  const coach=B.person('pele-t-coach',-1.8,1.4,1.8,{shirt:'coach',hair:'short',adult:true,skin:'#b27650',face:'smile',layer:3});
  const cname=B.stand(S.flipCard('pele-t-wdb',1.75,.34,'WALDEMAR DE BRITO',INK.yellow,INK.navy),-2.2,2.35,{layer:3,s:0});
  const heart=coach.body.add(S.bubble('pele-t-heart',.55,.46,'heart'),.5,1.95,{z:-.02});
  const boy=B.person('pele-t-boy',-1.0,.95,1.28,{shirt:'casual',...PELE,face:'grin',holdR:'suitcase',layer:3});
  const age=B.stand(rosette('pele-t-15',.24,'15',INK.yellow),-.45,1.4,{layer:3,s:0});
  // Right: the train rides along the slot to the coast.
  B.slot(.35,.42,4.6,.42);
  const train=B.stand(engine('pele-t-engine',.95,.62),1.15,.4,{layer:2,tab:false});
  const car1=train.add(carriage('pele-t-car1',.62,.5,INK.yellow),-.83,0,{z:-.004}),car2=train.add(carriage('pele-t-car2',.62,.5,INK.pink),-1.49,0,{z:-.006});
  const face=train.add(windowKid('pele-t-face',.13),-.83-.12,.28,{z:.008});void car1;void car2;
  const puff1=train.add(smoke('pele-t-puff1',.3,.22),.34,.64,{z:-.01}),puff2=train.add(smoke('pele-t-puff2',.4,.28),.12,.86,{z:-.012});
  B.stand(arrowSign('pele-t-arrows2',1.3,1.2,'BAURU','SANTOS'),1.05,-1.6,{layer:1});
  const board=B.stand(noticeBoard('pele-t-board',1.0,1.0),2.2,-1.3,{layer:1});
  const flapP=board.flap(poster('pele-t-poster',.86,.56,'SANTOS'),0,.93,{z:.02});
  B.stand(S.tree('pele-t-palm',.9,1.7,'palm'),3.05,-1.75,{layer:1});
  B.stand(station('pele-t-santos',1.5,1.1,'SANTOS',WHITE),3.85,-.6,{layer:1});
  B.stand(S.tree('pele-t-palm2',.9,1.6,'palm'),4.75,-.35,{layer:1});
  const signed=B.stand(S.flipCard('pele-t-signed',.95,.38,'SIGNED',INK.yellow,INK.navy),.75,1.15,{layer:2,s:0});
  const vet1=person(B,'pele-t-vet1',1.35,2.0,1.72,{kit:'santos',shirt:'ger',hair:'curly',adult:true,skin:'#b27650',face:'smile',layer:3});
  const vet2=person(B,'pele-t-vet2',2.55,2.15,1.72,{kit:'santos',shirt:'ger',hair:'short',adult:true,skin:'#d99a6c',face:'grin',legs:'kick',layer:3});
  const young=person(B,'pele-t-young',4.25,1.85,1.3,{kit:'santos',shirt:'ger',...PELE,number:'10',legs:'kick',face:'open',layer:3});B.slot(4.3,2.0,3.55,2.0);
  const yball=B.stand(S.ball('pele-t-yball',.1),3.9,2.05,{layer:3,tab:false});
  const tick=B.stand(S.icon('pele-t-tick',.3,'tick'),4.55,1.2,{layer:2,s:0,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   cloud.dx=.6*beat(t,0,40)-.2;gulls.dx=.8*beat(t,2,12)-.6*beat(t,28,40);gulls.dy=-.12*Math.sin(t*1.1);sunP.dy=-.4*beat(t,0,1.6);
   // Futsal in Bauru: a fast game on a small court.
   const kicks=[3.4,5.2];let fb=0,sw=0;for(const at of kicks){fb=Math.max(fb,pulse(t,at,at+1.3));sw=Math.max(sw,pulse(t,at-.3,at+.2));}
   // People first thought he was too young: the official doubts, the sign asks.
   hmm.visible=t>7.1&&t<11;hmm.scale=Math.max(.001,beat(t,7.1,7.6));ump.armL.rot=-.12-.9*beat(t,7.4,8)+.9*beat(t,10.6,11.2);
   // He ended up as the top scorer: two goals, and the sign flips.
   for(const at of [11.3,12.6]){fb=Math.max(fb,beat(t,at,at+.6)*(1-beat(t,at+.8,at+1)));sw=Math.max(sw,pulse(t,at-.3,at+.2));}
   doubt.flip=-2.8*beat(t,12.2,13.2);kid.leg!.rot=-1.1*sw;
   fball.x=-3.2+1.5*fb;fball.z=1.9-.35*fb;fball.rot=-fb*8;fball.s=kid.body.s;
   // “That gave me a lot of confidence”: a star over his head.
   star.visible=t>13.9&&t<17.4;star.scale=Math.max(.001,beat(t,13.9,14.5));kid.armL.rot=-.12-2.2*beat(t,13.8,14.4)+2.2*beat(t,16.8,17.4);kid.armR.rot=.12+2.2*beat(t,13.8,14.4)-2.2*beat(t,16.8,17.4);
   // His youth coach, Waldemar de Brito, believed in him.
   fgoal.s=1-beat(t,17.2,17.8);coach.body.s=beat(t,17.5,18.4);cname.s=beat(t,17.9,18.7);heart.visible=t>19&&t<21.4;heart.scale=Math.max(.001,beat(t,19,19.5));
   coach.armL.rot=-.12-1.1*beat(t,18.4,19)+1.1*beat(t,21,21.5);coach.armR.rot=.12+2.1*beat(t,21.8,22.4)-2.1*beat(t,24.8,25.4);
   // 1956: aged fifteen, off to try out for Santos. The futsal boy folds; the traveller stands at the station.
   kid.body.s=1-beat(t,21.6,22.2);boy.body.s=beat(t,22.2,23);age.s=beat(t,23,23.8);age.dy=.08*pulse(t,23,24.4);
   // Ride to Santos: the boy boards, the train rolls from Bauru to the coast.
   const ride=Math.max(n?beat(t,28.5,31):0,act);
   boy.body.s*=1-beat(ride,0,.12);face.scale=beat(ride,.05,.18)*(1-(n?beat(t,31.4,31.9):0));
   train.x=1.15+2.9*smooth2(ride);coach.armR.rot+=2.3*beat(ride,.05,.25)+(n?.35*wave(t,28.7,31,1.5):.35*Math.sin(ride*Math.PI*4)*(ride<1?1:0));
   const chug=ride>0&&ride<1?1:0;puff1.scale=.6+.4*Math.abs(Math.sin(ride*14))*chug+(1-chug)*.4;puff2.scale=.5+.5*Math.abs(Math.cos(ride*11))*chug+(1-chug)*.3;puff2.dy=.08*Math.sin(ride*9);
   // He impressed the coach, signed for Santos and scored in his first game for the first team.
   const arrive=Math.max(n?beat(t,31,32):0,beat(act,.85,1));
   vet1.body.s=Math.max(n?beat(t,31.2,32):0,n?0:1,beat(act,.7,.9));vet2.body.s=Math.max(n?beat(t,31.5,32.3):0,n?0:1,beat(act,.75,.95));young.body.s=arrive;
   vet1.armR.rot=.12+2.2*beat(t,32,32.6)-2.2*beat(t,36.6,37.2);signed.s=Math.max(beat(t,32.6,33.4),n?0:beat(act,.9,1));
   young.body.x=4.25-.7*beat(t,32,33.6);
   young.leg!.rot=.5*beat(t,34.2,34.6)-1.4*beat(t,34.6,34.9)+.9*beat(t,35.4,36);const yf=beat(t,34.7,35.5);
   yball.x=3.9-.7*beat(t,32,33.6)+.55*yf;yball.z=2.05-1.0*yf;yball.dy=.3*Math.sin(yf*Math.PI);yball.rot=-yf*8;yball.s=young.body.s;
   tick.s=beat(t,35.5,36.1);flapP.flip=-2.7*beat(t,35.6,36.6);
   vet2.armR.rot=.12+2.2*beat(t,35.8,36.4);young.armR.rot=.12+2.4*beat(t,36,36.6);young.armL.rot=-.12-2.4*beat(t,36,36.6);
   // When someone believes in you, it can help you believe in yourself.
   ban.dy=-.9+.9*beat(t,37.5,38.5);ban.visible=t>37.3;
   return n?-.7*beat(t,1.5,2.6)+.3*beat(t,21.6,22.6)+.8*beat(t,28.4,29.6)+.2*beat(t,31,32)-.6*beat(t,37.3,38.3):(act>0&&act<1?.3:0);
  };
 }};
function smooth2(v:number){v=clamp01(v);return v<.5?2*v*v:1-Math.pow(-2*v+2,2)/2;}

/* ───────────── 3 · Waiting on the bench (fiftyeight): hurt, doubted, then chosen ───────────── */
const fiftyeight:SpreadDef={id:'fiftyeight',rest:23.4,
 left:k=>{pitchPrint(k,-5,0);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);k.text('1958',-2.6,Z(2.6),.6,INK.blue,{max:3.2});k.text('WORLD CUP · SWEDEN',-2.6,Z(2.92),.18,INK.navy,{weight:800,max:3.4});},
 right:k=>{pitchPrint(k,0,5);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M5 ${Z(-2.3)} L2.5 ${Z(-2.3)} L2.5 ${Z(-.1)} L5 ${Z(-.1)}`);k.circle(3.7,Z(-.55),.05,INK.white);
  k.text('BE PATIENT',2.6,Z(2.62),.36,INK.pink,{max:3.6});k.text('your chance can still come',2.6,Z(2.92),.17,INK.navy,{weight:700,max:3.4});},
 build:B=>{
  const cols=[INK.yellow,INK.green,WHITE,INK.blue,INK.yellow,'#6fb6e2',INK.pink];
  const bd=B.vfold({key:'pele-f-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.1,2.6,cols,1,'#4a5f93');flag(k,.5,.35,.5,.34,'bra');flag(k,3.4,.3,.5,.34,'swe');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'pele-f-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);crowd(k,4.5,1.1,2.6,cols,4,'#4a5f93');flag(k,1.2,.3,.5,.34,'swe');flag(k,3.7,.35,.5,.34,'bra');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const bunt=bd.add(S.bunting('pele-f-bunt',3.6,.45,[INK.yellow,INK.green,INK.blue,INK.yellow]),'L',1.95,2.55,{out:.02});
  const bunt2=bd.add(S.bunting('pele-f-bunt2',3.4,.45,[INK.blue,INK.yellow,INK.green]),'R',1.85,2.6,{out:.02});
  const lesson=bd.add(S.banner('pele-f-chance',3.2,.44,'YOUR CHANCE CAN STILL COME',INK.pink),'R',1.8,1.35,{out:.028});
  const conf=bd.add(S.confetti('pele-f-conf',2.6,1.4,2),'L',1.5,1.0,{out:.03});
  // Scoreboard: lift FINAL to see the score.
  const board=B.stand(S.scoreboard('pele-f-board',2.3,1.7,'FINAL · 1958'),-2.1,-1.55,{layer:1});
  board.add(S.scoreFlap('pele-f-score',2.1,.9,'BRAZIL','5 – 2','SWEDEN'),0,.3,{z:.012});
  const cover=board.flap(poster('pele-f-cover',2.14,1.08,'FINAL'),-1.07,.26,{anchor:'bl',axis:'y',z:.024});
  B.stand(S.floodlight('pele-f-flood',.5,1.9),-4.6,-1.2,{layer:1});
  const mate1=person(B,'pele-f-m1',-4.1,.15,1.34,{kit:'brazil58',shirt:'bib',hair:'curly',skin:'#b27650',number:'7',face:'grin',layer:2});
  const mate2=person(B,'pele-f-m2',-.55,-.8,1.34,{kit:'brazil58',shirt:'bib',hair:'short',skin:'#d99a6c',number:'8',face:'smile',layer:2});
  // The doubter and the coach.
  const psy=B.person('pele-f-psy',-2.95,.75,1.75,{shirt:'casual',hair:'short',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const talk=psy.body.add(S.bubble('pele-f-talk',.55,.46,'dots'),-.5,1.95,{z:-.02});
  const coach=B.person('pele-f-feola',-1.75,1.05,1.8,{shirt:'coach',hair:'bald',adult:true,skin:'#f1b88f',face:'smile',layer:3});
  const sign=B.stand(S.sign('pele-f-sign',1.4,1.3,''),-.75,1.55,{layer:3});
  sign.add(S.flipCard('pele-f-chosen',1.3,.46,'CHOSEN TO PLAY',INK.yellow,INK.navy),0,.8,{z:.014});
  const doubt=sign.flap(S.flipCard('pele-f-childish',1.3,.46,'TOO CHILDISH?',INK.pink),0,1.26,{z:.026});
  // The bench, the knee wrap and the two games he sat out.
  B.stand(S.bench('pele-f-bench',1.3,.5),-3.4,1.25,{layer:3});
  const bp=person(B,'pele-f-bp',-3.75,1.55,1.3,{kit:'brazil58',shirt:'bib',...PELE,number:'10',face:'shy',layer:3});B.slot(-3.75,1.62,-1.3,1.62);
  const wrap=bp.body.add(kneeWrap('pele-f-wrap',.2,.1),.1,bp.h*.2,{z:.02});
  const rose=B.stand(rosette('pele-f-17',.26,'17'),-4.6,2.05,{layer:3,s:0});
  const games=['GAME 1','GAME 2'].map((g,i)=>B.stand(S.flipCard(`pele-f-game${i}`,.74,.3,g,INK.sky2,INK.navy),-3.85+i*.8,2.0,{layer:3,s:0}));
  // Right: the pitch he was sent on to.
  const goal=B.stand(S.goal('pele-f-goal',1.75,.9),3.75,-1.45,{layer:1});
  const tick=goal.add(S.icon('pele-f-tick',.26,'tick'),-1.1,.9,{z:.03,anchor:'center'});
  const keeper=B.person('pele-f-keeper',3.75,-1.15,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const def=B.person('pele-f-def',2.25,-.95,1.3,{shirt:'bib',hair:'bald',skin:'#f1b88f',face:'open',layer:2});
  const pele=person(B,'pele-f-pele',1.55,.85,1.36,{kit:'brazil58',shirt:'bib',...PELE,number:'10',legs:'kick',face:'smile',layer:3});
  const ball=B.stand(S.ball('pele-f-ball',.12),1.95,1.0,{layer:3,tab:false});B.slot(1.95,1.0,3.1,-1.35);
  const stages=['QUARTER-FINAL','SEMI-FINAL','FINAL'].map((l,i)=>B.stand(S.flipCard(`pele-f-st${i}`,1.0,.32,l,INK.yellow,INK.navy),1.2+i*1.12,2.1,{layer:3,s:0}));
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   bunt.dy=.05*wave(t,0,6,1.1);bunt2.dy=.05*wave(t,.4,6,1.2);
   // 1958: the World Cup in Sweden. His teammates line up; he waits on the bench.
   mate1.body.s=beat(t,2.3,3.2);mate2.body.s=beat(t,2.7,3.6);bp.body.s=beat(t,3.2,4.2);
   // Only seventeen, and arriving with a knee injury.
   rose.s=beat(t,6.8,7.6);rose.dy=.08*pulse(t,6.8,8);wrap.scale=Math.max(.001,beat(t,8.6,9.3));wrap.visible=t>8.5;
   // He sat out Brazil's first two matches.
   games.forEach((g,i)=>{g.s=beat(t,11.2+i*1.1,11.9+i*1.1);});
   mate1.armR.rot=.12+2.2*beat(t,11.4,12)-2.2*beat(t,13.4,14);mate2.armL.rot=-.12-2.2*beat(t,12.4,13)+2.2*beat(t,13.6,14.1);
   bp.armL.rot=-.12-.4*pulse(t,11.2,14);
   // A team psychologist said he was too childish to play.
   psy.body.s=beat(t,14.3,15.1);talk.visible=t>15.2&&t<19.2;talk.scale=Math.max(.001,beat(t,15.2,15.7));psy.armR.rot=.12+1.2*beat(t,15.4,16)-1.2*beat(t,18.6,19.2);
   sign.s=beat(t,15.8,16.6);
   // The coach, Vicente Feola, chose to play him anyway.
   coach.body.s=beat(t,19.5,20.3);doubt.flip=-2.8*beat(t,21,22);coach.armL.rot=-.12-1.6*beat(t,20.4,21)+1.6*beat(t,23,23.5);
   // Send him on from the paper bench: he slides off the bench and pops up on the pitch.
   const send=Math.max(n?beat(t,23.8,25.6):0,act);
   bp.body.x=-3.75+2.4*beat(send,0,.6);bp.body.s*=1-beat(send,.55,.75);wrap.scale*=1-beat(send,.2,.5);
   pele.body.s=beat(send,.65,.95);
   // Goals in the quarter-final and the semi-final, then twice in the final: Brazil 5–2 Sweden.
   const shots=[26.7,28.6,30.6,32.4];let p=0,leg=0,dive=0,sgn=1;
   if(n)shots.forEach((at,i)=>{if(t>at-.7){p=beat(t,at,at+.8)*(t<at+1.3?1:0);sgn=i%2?-1:1;}leg+=.7*beat(t,at-.6,at-.2)-1.9*beat(t,at-.2,at)+1.2*beat(t,at+.4,at+1);dive=Math.max(dive,pulse(t,at+.1,at+1.3));});
   pele.leg!.rot=leg;ball.x=lerp(1.95,3.12+(sgn<0?-.9:0),p);ball.z=lerp(1.0,-1.33,p);ball.dy=.21*Math.sin(p*Math.PI)+.12*p;ball.rot=-p*9;
   ball.s=pele.body.s;keeper.body.rot=-.9*sgn*dive;keeper.body.dx=.25*sgn*dive;keeper.armL.rot=-.12-2.3*dive;keeper.armR.rot=.12+2.3*dive;
   stages.forEach((c,i)=>{c.s=beat(t,[27.2,29.1,31][i],[27.9,29.8,31.7][i]);});
   tick.scale=Math.max(.001,n?pulse(t,27.4,28.4)+pulse(t,29.3,30.3)+pulse(t,31.3,32.3)+pulse(t,33.1,34.1):0);
   cover.flip=-1.5*beat(t,31.2,32.2);def.armL.rot=-.12-.6*pulse(t,26.8,28.4);
   // He cried as his teammates congratulated him: everyone's arms go up.
   const cheer=Math.max(n?beat(t,34.1,34.8):0,act>0?beat(act,.85,1):0);pele.armL.rot=-.12-2.3*cheer;pele.armR.rot=.12+2.3*cheer;
   mate1.armL.rot=-.12-2.3*(n?beat(t,34.3,35):0);mate2.armR.rot=.12+2.3*(n?beat(t,34.5,35.2):0);coach.armR.rot=.12+2.2*(n?beat(t,34.6,35.3):0);
   conf.dy=-1+1.1*beat(t,34.2,35.8);conf.visible=t>34;
   // When you are hurt, be patient. Your chance can still come.
   lesson.dy=-.9+.9*beat(t,38.6,39.6);lesson.visible=t>38.4;
   return n?-.6*beat(t,3,4)+.6*beat(t,23.6,24.4)+.5*beat(t,26.3,27)-.5*beat(t,31,31.8)+.0:(act>0?.3*act:0);
  };
 }};

/* ───────────── 4 · Hurt again (thousand, 3 steps): 1962, sitting out, still part of the team ───────────── */
const thousand:SpreadDef={id:'thousand',rest:20.0,
 left:k=>{pitchPrint(k,-5,0);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);k.text('1962',-2.6,Z(2.6),.6,INK.blue,{max:3.2});k.text('WORLD CUP · CHILE',-2.6,Z(2.92),.18,INK.navy,{weight:800,max:3.4});},
 right:k=>{pitchPrint(k,0,5);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M5 ${Z(-2.3)} L2.3 ${Z(-2.3)} L2.3 ${Z(.2)} L5 ${Z(.2)}`);k.circle(3.3,Z(-.25),.06,INK.white);
  k.text('STILL PART OF THE TEAM',2.5,Z(2.62),.3,INK.pink,{max:3.8});k.text('cheer them on',2.5,Z(2.92),.17,INK.navy,{weight:700});},
 build:B=>{
  const cols=[WHITE,INK.yellow,INK.red,'#6fb6e2',INK.orange,INK.green,WHITE];
  const bd=B.vfold({key:'pele-k-bdL',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);andes(k,4.5,1.25);crowd(k,4.5,1.3,2.6,cols,1,'#4a5f93');flag(k,.6,.5,.45,.3,'bra');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'pele-k-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);andes(k,4.5,1.2);crowd(k,4.5,1.3,2.6,cols,5,'#4a5f93');flag(k,3.6,.5,.45,.3,'bra');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const sunP=bd.add(S.sun('pele-k-sun',.36),'R',1.4,1.9,{out:.015});
  const bunt=bd.add(S.bunting('pele-k-bunt',3.6,.45,[INK.yellow,INK.green,INK.blue]),'L',1.95,2.6,{out:.02});
  const lesson=bd.add(S.banner('pele-k-team',3.2,.44,'STILL PART OF THE TEAM',INK.blue),'L',1.75,1.0,{out:.028});
  const conf=[bd.add(S.confetti('pele-k-cf1',2.4,1.3,1),'L',1.4,1.0,{out:.03}),bd.add(S.confetti('pele-k-cf2',2.4,1.3,3),'R',1.4,1.0,{out:.03})];
  // Left: the trophy stand, the bench, his flags and the medal flap.
  const cup=B.stand(S.trophy('pele-k-cup',.8,1.15),-2.25,-1.35,{layer:1,s:0});
  B.stand(S.floodlight('pele-k-fl1',.5,2.0),-4.55,-1.1,{layer:1});
  B.stand(S.bench('pele-k-bench',1.3,.5),-3.3,1.1,{layer:2});
  const bp=person(B,'pele-k-bp',-3.65,1.4,1.34,{kit:'brazil',shirt:'bib',...PELE,number:'10',face:'shy',layer:3});
  const wrap=bp.body.add(kneeWrap('pele-k-wrap',.2,.1),.1,bp.h*.2,{z:.02});
  const flags=[0,1,2].map(i=>B.stand(flagPlate(`pele-k-flag${i}`,'bra'),-4.3+i*.5,2.15,{layer:3,s:0,tab:false}));
  const post=B.stand(S.sign('pele-k-msign',1.2,1.4,''),-1.35,1.55,{layer:3});
  post.add(rosette('pele-k-2007',.2,'2007',INK.gold),0,.8,{z:.014});
  const later=post.flap(S.flipCard('pele-k-1962',1.1,.56,'1962',INK.pink),0,1.38,{z:.026});
  // Right: the pitch, the goal, and teammates who play on.
  const goal=B.stand(S.goal('pele-k-goal',1.75,.9),3.75,-1.2,{layer:1});void goal;
  B.stand(S.floodlight('pele-k-fl2',.5,1.9),4.75,-.9,{layer:1});
  const keeper=B.person('pele-k-keeper',3.75,-.95,1.28,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const pele=person(B,'pele-k-pele',1.9,.9,1.4,{kit:'brazil',shirt:'bib',...PELE,number:'10',legs:'kick',face:'smile',layer:3});B.slot(1.4,1.05,2.3,1.05);
  const best=pele.body.add(S.bubble('pele-k-best',.55,.46,'star'),.55,1.55,{z:-.02});
  const ball=B.stand(S.ball('pele-k-ball',.12),2.3,1.05,{layer:3,tab:false});
  const mA=person(B,'pele-k-mA',1.15,2.0,1.34,{kit:'brazil',shirt:'bib',hair:'curly',skin:'#b27650',number:'7',face:'smile',layer:3});
  const mB=person(B,'pele-k-mB',3.1,1.75,1.34,{kit:'brazil',shirt:'bib',hair:'short',skin:'#d99a6c',number:'8',face:'smile',layer:3});
  const medA=mA.body.add(rosette('pele-k-medA',.1,'',INK.gold),0,mA.h*.46,{z:.03}),medB=mB.body.add(rosette('pele-k-medB',.1,'',INK.gold),0,mB.h*.46,{z:.03});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   sunP.dy=-.3*beat(t,0,1.7);bunt.dy=.05*wave(t,0,6,1.1);
   // 1962 in Chile: many people thought he was the best player in the world.
   best.visible=t>3.6&&t<8.4;best.scale=Math.max(.001,beat(t,3.6,4.2));pele.armL.rot=-.12-.6*pulse(t,4,7.6);
   // He scored in Brazil's first match.
   const g1=beat(t,9.2,10),w1=.7*beat(t,8.6,9)-1.9*beat(t,9,9.2)+1.2*beat(t,9.6,10.2);
   // Against Czechoslovakia, he was hurt trying a long shot: he steps back, shoots, and stops.
   const back=beat(t,11.6,12.6),w2=.7*beat(t,13,13.4)-1.9*beat(t,13.4,13.6)+1.2*beat(t,14,14.6),g2=beat(t,13.5,14.5);
   pele.body.x=1.9-.5*back;pele.leg!.rot=w1+w2;pele.body.rot=.12*beat(t,14.4,15.2);pele.armR.rot=.12+.5*beat(t,14.6,15.4);
   const dive=pulse(t,9.3,10.6);keeper.body.rot=-.9*dive;keeper.body.dx=.25*dive;keeper.armL.rot=-.12-2.3*Math.max(dive,pulse(t,13.8,15));keeper.armR.rot=.12+2.3*Math.max(dive,pulse(t,13.8,15));
   if(t<11){ball.x=lerp(2.3,3.3,g1);ball.z=lerp(1.05,-1.0,g1);ball.dy=.3*Math.sin(g1*Math.PI)+.1*g1;ball.rot=-g1*9;ball.s=1-beat(t,10.4,10.9);}
   else{ball.x=lerp(1.8,3.9,g2);ball.z=lerp(1.05,-1.3,g2);ball.dy=1.1*Math.sin(g2*Math.PI*.8);ball.rot=-g2*10;ball.s=beat(t,11,11.5)*(1-beat(t,14.6,15.2));}
   // He could not play again in that World Cup: he leaves the pitch and sits by the bench, knee wrapped.
   pele.body.s=n?1-beat(t,17.3,18):0;bp.body.s=Math.max(beat(t,17.8,18.6),n?0:1);wrap.scale=Math.max(.001,beat(t,18.6,19.2));
   // Tap three times to cheer his teammates on (narrated at 20.6, 21.6 and, as they win the final, 23.4).
   const ct=(beat(t,20.6,21.2)+beat(t,21.6,22.2)+beat(t,23.4,24))/3,c=Math.max(n?ct:0,act);
   flags.forEach((f,i)=>{f.s=beat(c,i/3,i/3+.3);f.rot=.1*wave(t,21+i*.3,26,1.2);});
   mA.body.s=Math.max(n?beat(t,20.3,21):1,act>0?1:0);mB.body.s=Math.max(n?beat(t,20.5,21.2):1,act>0?1:0);
   bp.armR.rot=.12+2.2*(pulse(c,.04,.32)+pulse(c,.37,.65))+2.2*beat(c,.9,1);bp.armL.rot=-.12-2.2*beat(c,.9,1)*(n?1-beat(t,29.5,30):1);
   mA.armL.rot=-.12-2.3*beat(c,.3,.4)+2.3*beat(c,.6,.66)-2.3*beat(c,.9,1);mB.armR.rot=.12+2.3*beat(c,.62,.72)+2.3*beat(c,.9,1)-2.3*beat(c,.72,.8);
   // Brazil kept going and won the final.
   cup.s=beat(c,.8,1);conf.forEach((f,i)=>{f.dy=-1+1.1*beat(c,.84+i*.05,1);f.visible=c>.82;});
   mA.armR.rot=.12+2.3*beat(c,.9,1);mB.armL.rot=-.12-2.3*beat(c,.9,1);
   // Back then, only players in the final got a medal.
   medA.scale=Math.max(.001,n?beat(t,26.5,27.1):0);medB.scale=Math.max(.001,n?beat(t,27,27.6):0);medA.visible=medB.visible=n&&t>26.4;
   // Many years later, in 2007, Pelé was given his winner's medal too.
   later.flip=-2.8*beat(t,30.4,31.4);bp.armR.rot+=n?1.4*beat(t,31.6,32.2):0;
   // Even when you cannot play, you are still part of the team.
   lesson.dy=-.9+.9*beat(t,36,37);lesson.visible=t>35.8;
   return n?.5*beat(t,1.7,2.6)-1.1*beat(t,17.2,18.2)+.6*beat(t,20.1,21)+.4*beat(t,26.1,27)-1.0*beat(t,29.9,30.8)+.6*beat(t,35.8,36.6):0;
  };
 }};

/* ───────────── 5 · Knocked down, back up (seventy): 1966 rough play, 1970 return ───────────── */
const seventy:SpreadDef={id:'seventy',rest:32.6,
 left:k=>{pitchPrint(k,-5,0);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);k.text('1966',-2.6,Z(2.95),.5,INK.blue,{max:3.2});k.text('ENGLAND',-.95,Z(2.95),.18,INK.navy,{weight:800});},
 right:k=>{pitchPrint(k,0,5);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M5 ${Z(-2.3)} L2.4 ${Z(-2.3)} L2.4 ${Z(-.1)} L5 ${Z(-.1)}`);chalk(k,`M5 ${Z(-2.3)} L3.4 ${Z(-2.3)} L3.4 ${Z(-1.4)} L5 ${Z(-1.4)}`,.024);
  k.text('1970',1.9,Z(2.95),.5,INK.orange,{max:3.2});k.text('MEXICO',3.6,Z(2.95),.18,INK.navy,{weight:800});},
 build:B=>{
  const cols=[INK.yellow,INK.green,WHITE,INK.blue,INK.yellow,INK.red,WHITE];
  const bd=B.vfold({key:'pele-v-bdL2',w:4.5,h:3.0,paint:k=>{greySky(k,4.5,3);crowd(k,4.5,1.25,2.6,[WHITE,INK.red,INK.yellow,'#6fb6e2',INK.green],3,'#56607a');flag(k,.6,.5,.45,.3,'bra');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'pele-v-bdR',w:4.5,h:3.0,paint:k=>{hotSky(k,4.5,3);const mt=`M0 1.2 L1 .75 L1.9 1.05 L3 .6 L4.5 1.1 L4.5 1.4 L0 1.4 Z`;k.fill(mt,'#c98a6a');k.dots(mt,INK.navy,.05,.25);crowd(k,4.5,1.25,2.6,cols,6,'#7a5a8a');flag(k,1.6,.45,.45,.3,'bra');flag(k,3.9,.5,.45,.3,'ita');k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const cloudP=bd.add(rainCloud('pele-v-rain',1.7,.7),'L',2.2,1.95,{out:.03}),drops=bd.add(S.drops('pele-v-drops',1.5,.75),'L',2.2,1.2,{out:.025});
  const sunP=bd.add(S.sun('pele-v-sun',.42),'R',3.3,1.25,{out:.015});
  const bigBall=bd.add(telstar('pele-v-telstar',.36),'R',1.3,2.35,{out:.03});
  const lesson=bd.add(S.banner('pele-v-back',3.2,.42,'YOU CAN COME BACK',INK.pink),'L',2.0,2.45,{out:.028});
  const conf=bd.add(S.confetti('pele-v-conf',2.6,1.4,4),'R',1.5,1.0,{out:.035});
  // Left, 1966: the archway door, the rough tackles and the long limp.
  const arch=B.stand(gate('pele-v-gate',1.25,1.35,'WORLD CUP'),-4.15,-1.2,{layer:1});
  const door=arch.flap(S.door('pele-v-door',.75,.9),-.375,0,{anchor:'bl',axis:'y',z:.012});
  const board=B.stand(S.scoreboard('pele-v-board',2.2,1.6,'FINAL · 1970'),-1.85,-1.55,{layer:1});
  board.add(S.scoreFlap('pele-v-score',1.8,.98,'BRAZIL','4 – 1','ITALY'),0,.28,{z:.012});
  const cover=board.flap(poster('pele-v-cover',1.9,1.02,'FINAL'),-.95,.26,{anchor:'bl',axis:'y',z:.024});
  const bul=B.person('pele-v-bul',-3.55,.75,1.34,{shirt:'ger',hair:'short',skin:'#f1b88f',legs:'kick',face:'open',layer:2});
  const por=B.person('pele-v-por',-3.5,.8,1.34,{shirt:'casual',hair:'curly',skin:'#d99a6c',legs:'kick',face:'open',layer:2});
  const p66=person(B,'pele-v-p66',-2.65,1.0,1.36,{kit:'brazil',shirt:'bib',...PELE,number:'10',face:'shy',layer:3});B.slot(-2.75,1.08,-1.85,1.08);
  const wrap=p66.body.add(kneeWrap('pele-v-wrap',.2,.1),.1,p66.h*.2,{z:.02});
  const nosubs=B.stand(S.flipCard('pele-v-nosubs',1.5,.36,'NO SUBSTITUTES',INK.sky2,INK.navy),-1.25,2.1,{layer:3,s:0});
  const cups=['1958','1962','1970'].map((y,i)=>B.stand(cupCard(`pele-v-cup${y}`,.46,.62,y),-4.45+i*.55,2.05,{layer:3,s:0}));
  const crosser=person(B,'pele-v-crosser',-2.0,1.45,1.32,{kit:'brazil',shirt:'bib',hair:'curly',skin:'#b27650',number:'7',legs:'kick',face:'open',layer:3});
  // The 1970 ball on a swinging strip across the page.
  const post=B.stand(S.post('pele-v-post',.12,.9),.28,1.85,{layer:3});
  const arm=post.arm(S.strip('pele-v-strip',.08,2.08),0,.88,{z:.02});
  const fly=post.add(telstar('pele-v-fly',.13),0,0,{z:.035,anchor:'center'});
  // Right, 1970: the header into the goal.
  const goal=B.stand(S.goal('pele-v-goal',1.8,.92),3.85,-1.35,{layer:1});void goal;
  const keeper=B.person('pele-v-keeper',3.85,-1.05,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const ita=B.person('pele-v-ita',2.95,.55,1.32,{shirt:'navy',hair:'short',skin:'#f1b88f',face:'open',layer:2});
  const pele=person(B,'pele-v-pele',2.05,1.45,1.36,{kit:'brazil',shirt:'bib',...PELE,number:'10',face:'open',layer:3});
  const head=B.stand(telstar('pele-v-head',.13),2.05,1.5,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   // 1966: rain over England. Bulgaria's players foul him again and again.
   const rain=beat(t,1.8,2.8)*(1-beat(t,22.6,23.6));drops.scale=Math.max(.001,rain);drops.visible=rain>.01;drops.dy=-.06*((t*1.2)%1);
   cloudP.dx=-.8*beat(t,22.6,24.2);cloudP.scale=Math.max(.001,(1+.12*beat(t,17.6,18.6))*(1-beat(t,22.8,24.2)));cloudP.visible=t<24.3;
   const gone=beat(t,23.2,24);p66.body.s=beat(t,2.4,3.2)*(1-gone);
   const sweep=(at:number)=>.6*beat(t,at-.4,at-.1)-1.6*beat(t,at-.1,at+.1)+1.0*beat(t,at+.5,at+.9);
   bul.body.s=beat(t,2.8,3.6)*(1-beat(t,10.2,10.8));bul.leg!.rot=sweep(4.4)+sweep(6.4)+sweep(8.4);
   let knock=0;for(const at of [4.4,6.4,8.4])knock-=.3*pulse(t,at,at+.9);
   wrap.scale=Math.max(.001,beat(t,9,9.6));wrap.visible=t>8.9;
   // Against Portugal he was fouled twice more.
   por.body.s=beat(t,10.4,11.2)*(1-gone);por.leg!.rot=sweep(11.6)+sweep(12.9);for(const at of [11.6,12.9])knock-=.3*pulse(t,at,at+.9);
   p66.body.rot=knock;p66.armL.rot=-.12-.5*Math.abs(knock)*2;p66.armR.rot=.12+.5*Math.abs(knock)*2;
   // No substitutes, so he limped on.
   nosubs.s=beat(t,13.9,14.6)*(1-beat(t,22.6,23.2));
   p66.body.x=-2.65+.7*beat(t,14.6,17.2);p66.body.dy=.035*Math.abs(Math.sin((t-14.6)*5))*(t>14.6&&t<17.2?1:0);
   // Brazil went out; he said he would never play at a World Cup again: the door closes, the rain grows.
   door.flip=-1.4+1.4*beat(t,18,19)-1.4*beat(t,22.8,23.8);p66.body.yaw=-.5*beat(t,17.6,18.4)+.5*beat(t,22.6,23.2);
   // But when Brazil asked, he came back: the cloud blows away, the sun comes out, the door opens.
   sunP.dy=-.35*beat(t,22.6,23.8);sunP.scale=Math.max(.001,beat(t,22.5,23.3));
   // The 1970 final in Mexico: a header, and Brazil beat Italy 4–1.
   bigBall.scale=Math.max(.001,beat(t,25.6,26.4));bigBall.rot=.4*(t-25.6)*(t>25.6?1:0);
   crosser.body.s=Math.max(beat(t,25.8,26.6),n?0:1,act>0?1:0);pele.body.s=Math.max(beat(t,24.6,25.4),n?0:1,act>0?1:0);cover.flip=-1.5*beat(t,31,32);
   const run=(a:number,d:number)=>({k:beat(t,a,a+.35*d),s:beat(t,a+.3*d,a+1.7*d),j:pulse(t,a+1.2*d,a+2.1*d),h:beat(t,a+1.65*d,a+2.3*d),end:a+2.3*d});
   let K=0,sw=0,J=0,H=0,hide=1;
   if(n){const r=t<32.6?run(28.3,1):run(33,1);K=r.k;sw=r.s;J=r.j;H=r.h;hide=1-beat(t,r.end+.9,r.end+1.3);if(t>r.end+1.3)sw=0;}
   if(act>0){K=beat(act,0,.14);sw=beat(act,.1,.58);J=pulse(act,.4,.78);H=beat(act,.55,.8);hide=1;}
   crosser.leg!.rot=.7*beat(K,0,.4)-1.9*beat(K,.4,1)+1.2*beat(sw,0,.3);crosser.armL.rot=-.12-1.2*pulse(K,0,1);
   const th=-1.95+2.95*sw,L=2.0;arm.rot=Math.PI-th;fly.dx=Math.sin(th)*L;fly.dy=.88+Math.cos(th)*L;fly.rot=-sw*6;fly.visible=H<.02;
   pele.body.dy=.42*J;pele.armL.rot=-.12-1.3*J;pele.armR.rot=.12+1.3*J;ita.body.dy=.22*J;ita.armL.rot=-.12-1.2*J;
   head.s=H>.01?hide:0;head.x=lerp(2.1,3.35,H);head.z=lerp(1.5,-1.3,H);head.dy=lerp(1.95,.12,H)+.15*Math.sin(H*Math.PI);head.rot=-H*8;
   const dive=Math.max(n?pulse(t,30,31.2)+pulse(t,34.6,35.8):0,act>0?beat(act,.6,.85):0);keeper.body.rot=-.85*Math.min(1,dive);keeper.body.dx=.25*Math.min(1,dive);keeper.armL.rot=-.12-2.3*Math.min(1,dive);keeper.armR.rot=.12+2.3*Math.min(1,dive);
   // The only player to win three World Cups.
   cups.forEach((c,i)=>{c.s=beat(t,35.2+i*.6,35.9+i*.6);c.dy=.08*pulse(t,35.9+i*.6,36.8+i*.6);});
   const cheer=Math.max(n?beat(t,35.6,36.2):0,act>0?beat(act,.85,1):0);pele.armL.rot+=-2.3*cheer;pele.armR.rot+=2.3*cheer;crosser.armR.rot=.12+2.3*cheer;
   conf.dy=-1+1.1*Math.max(n?beat(t,30.4,31.6)-beat(t,32.4,32.8)+beat(t,35.6,36.8):0,act>0?beat(act,.8,1):0);conf.visible=conf.dy>-.95;
   // A setback is not the end of the story. You can come back.
   lesson.dy=-.9+.9*beat(t,38.5,39.5);lesson.visible=t>38.3;
   return n?-.7*beat(t,2.1,3)+.7*beat(t,22.5,23.4)+.6*beat(t,27.8,28.6)-1.0*beat(t,30.9,31.6)+1.0*beat(t,32.8,33.5)-1.2*beat(t,34.9,35.6)+.6*beat(t,38.3,39.1):(act>0?.25*act:0);
  };
 }};

/* ───────────── 6 · Helping others (king): O Rei, his foundation, his legacy ───────────── */
const king:SpreadDef={id:'king',rest:33.2,
 left:k=>{dirt(k,rect(-5,0,5,PAGE_D));lawn(k,-5,0,0,Z(-1.7));const road=`M-5 ${Z(-.5)} L0 ${Z(-.6)} L0 ${Z(1.4)} L-5 ${Z(1.5)} Z`;cobbles(k,road,-5,0,Z(-.6),Z(1.5));
  k.text('O REI',-2.6,Z(2.85),.6,INK.orange,{max:3.2});k.text('THE KING',-2.6,Z(3.12),.17,INK.navy,{weight:800});},
 right:k=>{dirt(k,rect(0,0,5,PAGE_D));lawn(k,0,5,0,Z(-1.6));const road=`M0 ${Z(-.6)} L5 ${Z(-.5)} L5 ${Z(2.1)} L0 ${Z(2.1)} Z`;cobbles(k,road,0,5,Z(-.6),Z(2.1));
  for(const [x,z] of [[1.35,1.3],[2.65,.35],[3.75,1.05]])k.key(ell(x,Z(z),.3,.12),.018,WHITE);
  k.text('PASS IT ON',2.5,Z(2.62),.36,INK.pink,{max:3.8});k.text('share what you have',2.5,Z(2.9),.17,INK.navy,{weight:700});},
 build:B=>{
  const bd=B.vfold({key:'pele-r-bdL',w:4.5,h:3.0,paint:k=>{sunsetSky(k,4.5,3);const hills=`M0 3 L0 1.95 Q1.4 1.6 2.6 1.9 Q3.6 2.1 4.5 1.8 L4.5 3 Z`;k.fill(hills,'#7a6aa8');k.dots(hills,INK.navy,.05,.3);casas(k,.1,4.5,2.6,3,true);k.fill(rect(0,2.6,4.5,.4),'#d9a878');}},
   {key:'pele-r-bdR',w:4.5,h:3.0,paint:k=>{sunsetSky(k,4.5,3);const hills=`M0 2 Q1.5 1.6 2.8 1.9 Q3.8 2.1 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hills,'#7a6aa8');k.dots(hills,INK.navy,.05,.3);casas(k,0,4.4,2.62,5,true);k.fill(rect(0,2.62,4.5,.38),'#d9a878');
    k.key(`M0 1.55 Q2.2 1.85 4.5 1.5`,.01);for(let i=0;i<9;i++){const x=.3+i*.47,y=1.6+Math.sin(i*.9)*.1+(i>4?-.02:.04);k.fill(poly([[x,y],[x+.16,y],[x+.08,y+.2]]),[INK.yellow,INK.green,INK.pink,INK.blue][i%4]);}}},-3.05,1.22);
  const sunP=bd.add(S.sun('pele-r-sun',.42,INK.orange),'L',3.1,1.9,{out:.015});
  const crownP=bd.add(crown('pele-r-crown',1.0,.62),'R',2.3,1.95,{out:.03});
  const starsP=bd.add(S.stars('pele-r-stars',3.4,.8,11),'R',1.8,1.05,{out:.02}),stars2=bd.add(S.stars('pele-r-stars2',3.0,.7,8),'L',1.6,.95,{out:.02});
  const lesson=bd.add(S.banner('pele-r-help',3.0,.42,'USE IT TO HELP OTHERS',INK.pink),'R',1.9,2.35,{out:.03});
  // Left: the mural, the boy who became a man who spoke up, his foundation.
  B.stand(mural('pele-r-mural',2.2,1.7),-2.75,-1.3,{layer:1});
  const blooms=B.stand(flowers('pele-r-flowers',2.2,.36),-2.75,-.6,{layer:2,s:0,tab:false});
  const found=B.stand(station('pele-r-found',1.45,1.15,'PELÉ FOUNDATION',WHITE),-.85,-.95,{layer:1,s:0});
  const y2018=found.add(S.flipCard('pele-r-2018',.62,.3,'2018',INK.yellow,INK.navy),0,1.18,{z:.02});
  B.stand(S.lamp('pele-r-lamp',.4,1.9),.75,-1.2,{layer:1});
  const glow=B.stand(S.beam('pele-r-glow',1.1,1.8),.75,-1.15,{layer:1,tab:false,s:0});
  const gran=B.person('pele-r-gran',-4.1,.75,1.75,{shirt:'casual',hair:'bun',adult:true,skin:'#6e452f',hairColor:'#d8d0c4',face:'smile',layer:3});
  const fan=B.person('pele-r-fan',-3.35,.3,1.8,{shirt:'fan',hair:'short',adult:true,skin:'#f1b88f',face:'grin',layer:2});
  const young=B.person('pele-r-boy',-2.35,1.2,1.2,{shirt:'casual',...PELE,face:'grin',layer:3});
  const sball=young.body.add(sockBall('pele-r-sb',.1),.36,.02,{z:.02});void sball;
  const man=B.person('pele-r-man',-2.35,1.2,1.85,{shirt:'navy',...PELE,adult:true,face:'smile',layer:3});
  const speak=man.body.add(S.bubble('pele-r-speak',.6,.5,'dots'),.55,2.25,{z:-.02}),care=man.body.add(S.bubble('pele-r-care',.6,.5,'heart'),.55,2.25,{z:-.018});
  const cards=[iconCard('pele-r-c1',.46,'heart','CHILDREN',INK.yellow),iconCard('pele-r-c2',.46,'book','EDUCATION',INK.sky2)].map((c,i)=>B.stand(c,-4.4+i*.62,2.1,{layer:3,s:0}));
  const crowdCard=B.stand(S.flipCard('pele-r-230',1.0,.4,'230,000',INK.pink),-1.45,2.2,{layer:3,s:0});
  // Right: children play on the street where it all began.
  B.stand(wallHouse('pele-r-wall',2.0,1.4),3.7,-1.2,{layer:1});
  B.stand(S.tree('pele-r-palm',1.0,1.8,'palm'),1.45,-1.95,{layer:1});
  const kA=B.person('pele-r-kA',1.3,1.35,1.28,{shirt:'bib',hair:'short',skin:'#6e452f',hairColor:'#1c1820',legs:'kick',face:'grin',layer:3});
  const kB=B.person('pele-r-kB',2.65,.35,1.26,{shirt:'casual',hair:'curly',skin:'#b27650',legs:'kick',face:'smile',layer:2});
  const kC=B.person('pele-r-kC',3.65,1.05,1.3,{shirt:'fan',hair:'bun',skin:'#d99a6c',legs:'kick',face:'open',layer:3});
  const ball=B.stand(sockBall('pele-r-ball',.14),1.65,1.45,{layer:3,tab:false});
  B.stand(S.bench('pele-r-bench',1.1,.46),4.4,1.9,{layer:3});const kD=B.person('pele-r-kD',4.5,2.15,1.0,{shirt:'arg',hair:'long',skin:'#7f5138',face:'grin',layer:3});
  // Waypoints: A's foot → B's foot → C's foot → D on the bench.
  const WP=[[1.65,1.45,0],[2.85,.5,0],[3.85,1.1,0],[4.3,1.95,.35]];
  const along=(p:number)=>{const seg=Math.min(2,Math.floor(p*3)),f=p*3-seg,a=WP[seg],c=WP[seg+1];const arc=seg===1?.6:.25;return [lerp(a[0],c[0],f),lerp(a[1],c[1],f),lerp(a[2],c[2],f)+arc*Math.sin(f*Math.PI)];};
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   sunP.dy=-.9*beat(t,0,30);glow.s=beat(t,19.2,20.4);
   // O Rei, the King: the crown rises.
   crownP.dy=-.8+.8*beat(t,1.9,3.1);crownP.visible=t>1.8||!n;starsP.scale=Math.max(.001,beat(t,2.4,3.6));starsP.dy=.03*Math.sin(t*1.3+1);
   // The boy who grew up poor became a man who spoke up for poor people.
   young.body.s=beat(t,4.8,5.6)*(1-beat(t,6.8,7.4));man.body.s=beat(t,7.2,8)*(1-beat(t,19.6,20.6));
   speak.visible=t>8&&t<10.4;speak.scale=Math.max(.001,beat(t,8,8.5));man.armR.rot=.12+1.4*beat(t,8,8.6)-1.4*beat(t,10,10.6);
   // Children's charities, and in 2018 the Pelé Foundation, for poverty and education.
   care.visible=t>10.6&&t<14;care.scale=Math.max(.001,beat(t,10.6,11.1));cards[0].s=beat(t,10.8,11.6);
   found.s=beat(t,12.6,13.6);y2018.scale=Math.max(.001,beat(t,14,14.6));y2018.dy=.05*pulse(t,14,15.2);
   cards[1].s=beat(t,16.4,17.2);man.armL.rot=-.12-1.6*beat(t,13.4,14)+1.6*beat(t,17.6,18.2);
   // Pelé died in 2022, aged 82, after an illness: the lamp comes on, flowers bloom at the mural, first stars.
   blooms.s=beat(t,20.4,21.6);stars2.scale=Math.max(.001,beat(t,20.8,21.8));stars2.dy=.03*Math.sin(t*1.5);
   // More than 230,000 people came to say goodbye.
   crowdCard.s=beat(t,24.4,25.2);gran.armR.rot=.12+.8*beat(t,24.6,25.2)-.8*beat(t,27.6,28.2);
   fan.armL.rot=-.12-2.2*beat(t,24.8,25.4)+2.2*beat(t,27.8,28.4)-.25*wave(t,25.4,27.8,1.3);gran.armL.rot=-.12-.6*pulse(t,25,28);
   // Children play on the street where it all began.
   [kA,kB,kC,kD].forEach((kk,i)=>{kk.body.s=Math.max(beat(t,29+i*.5,29.9+i*.5),n?0:1,act>0?1:0);});
   // Pass the ball on (narrated at 33.5; the reader's action replays it).
   let p=n?beat(t,33.5,35.4):0;if(act>0)p=beat(act,.08,.9);
   kA.leg!.rot=.6*beat(p,0,.03)-1.7*beat(p,.03,.1)+1.1*beat(p,.2,.3);kB.leg!.rot=.6*beat(p,.28,.32)-1.7*beat(p,.32,.36)+1.1*beat(p,.45,.55);kC.leg!.rot=.6*beat(p,.61,.65)-1.7*beat(p,.65,.69)+1.1*beat(p,.78,.88);
   const pos=along(p);ball.x=pos[0];ball.z=pos[1];ball.dy=pos[2];ball.rot=-p*14;
   const got=Math.max(n?beat(t,35.3,35.8):0,act>0?beat(act,.88,1):0);kD.armL.rot=-.12-2.2*got;kD.armR.rot=.12+2.2*got;
   // When things go well for you, use it to help others.
   lesson.dy=-.9+.9*beat(t,35.5,36.5);lesson.visible=t>35.3;
   const wv=n?beat(t,36,36.8):0;kA.armL.rot=-.12-2.3*wv-.3*wave(t,36.8,39,1.5);kB.armR.rot=.12+2.3*wv;kC.armL.rot=-.12-2.3*wv;gran.armR.rot+=2*wv;
   return n?-.6*beat(t,4.6,5.4)+.6*beat(t,24,24.8)+.6*beat(t,28.8,29.6)-.6*beat(t,35.2,36):(act>0?.4*act:0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={sock,santos,fiftyeight,thousand,seventy,king};
void blob;
