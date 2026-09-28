/**
 * The six Johan Cruyff hardship pop-up spreads (loss, a family's new way, a second family, injury, defeat, giving back):
 * original riso paper artwork and narration-timed paper mechanics; hardship is shown gently and symbolically.
 * Every pose(beat) is a pure function of Coach Bella's narration time and the reader's action (0–1),
 * so pause, seek, replay and manual play all show the same paper state. Cue times follow
 * public/voice/books/cruyff/narration.json. Kits are painted here (no crests or logos).
 */
import {INK,type Kit,type PlateSpec,type PersonOpts,type Shirt,poly,rect,ell,personSpec,armSpec,legSpec,JOINTS} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D,PERSON_SCALE} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2;
const K=(s:string)=>'cruyff-'+s;
const spec=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K(key),w,h,paint,...extra});
const C={brick:'#b8563f',brickD:'#8e3b2c',cream:'#efe0bd',slate:'#3d4a6b',canal:'#3f7d62',ochre:'#d69a4a',rose:'#c96d62',ajax:'#d8343c',white:'#fbf5e6',
 orange:'#f07a22',garnet:'#9e2a47',barca:'#2a4f9e',sweY:'#f5cf2a',sweB:'#2f5fae',water:'#5aa6c9',silver:'#cfd2d6',wood:'#a8693f',turf:'#4f9e5e'};

/* ───────────── timing helpers ───────────── */
/** Keyframed value [[time,value],…]: holds outside the keys, eased between neighbours. */
function kf(t:number,keys:number[][]):number{
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++){const [b,vb]=keys[i];if(t<=b){const [a,va]=keys[i-1];return va+(vb-va)*smooth((t-a)/Math.max(.001,b-a));}}
 return keys[keys.length-1][1];
}
/** Keyframed page point [[time,x,z],…]. */
function kp(t:number,keys:number[][]):[number,number]{return [kf(t,keys.map(k=>[k[0],k[1]])),kf(t,keys.map(k=>[k[0],k[2]]))];}
const lerp=(a:number,b:number,f:number)=>a+(b-a)*f;

/* ───────────── painted kits on the shared brad-jointed characters ───────────── */
type Hold='suitcase'|'ball'|'glove'|'none';
type KitName='ajax'|'ned'|'swe'|'ger'|'barca'|'suit'|'plain';
type PO=Omit<PersonOpts,'shirt'>&{shirt?:Shirt;kit?:KitName;layer?:number;yaw?:number;holdL?:Hold;holdR?:Hold};
const KIT_BASE:Record<KitName,Shirt>={ajax:'ger',ned:'casual',swe:'bib',ger:'ger',barca:'navy',suit:'casual',plain:'casual'};
const T_KID='M114 172 Q146 156 184 170 L196 208 L200 304 Q156 320 106 304 L108 220 Z',T_ADULT='M108 168 Q152 150 196 168 L206 212 L204 306 Q154 322 102 306 L100 214 Z';
const SHORTS='M104 298 Q153 314 202 300 L206 340 L166 346 L154 324 L144 346 L102 338 Z';
const socks=(legs:string)=>legs==='run'?['M84 420 L108 430 L96 450 L72 440 Z','M222 424 L244 412 L256 432 L232 444 Z']:['M100 420 L134 424 L128 456 L98 452 Z','M176 424 L204 420 L208 452 L180 456 Z'];
function kitBody(k:Kit,kit:KitName,o:PO){
 if(kit==='plain'||kit==='ger')return;
 k.at(0,0,k.h/512,()=>{const T=o.adult?T_ADULT:T_KID,legs=o.legs??'stand',[sl,sr]=socks(legs);
  const sock=(c:string)=>{k.fill(sl,c);if(legs!=='kick')k.fill(sr,c);};
  if(kit==='ajax'){k.fill('M104 232 L204 232 L204 246 L104 246 Z',INK.paper);k.fill(T,C.white);k.fill(o.adult?'M137 157 L168 157 L169 313 L138 313 Z':'M134 162 L164 163 L166 311 L136 310 Z',C.ajax);k.fill(SHORTS,C.white);sock(C.white);k.dots(sl,C.ajax,7,.25);if(o.number)k.text(o.number,152,262,44,C.white,{font:'Georgia,serif'});}
  else if(kit==='ned'){if(!o.adult){k.fill(SHORTS,C.white);sock(C.orange);}else k.fill(T,C.orange);}
  else if(kit==='swe'){k.fill(SHORTS,C.sweB);sock(C.sweY);}
  else if(kit==='barca'){k.fill(T,C.barca);for(const x of o.adult?[122,152,182]:[124,150,176])k.fill(`M${x-7} 166 L${x+7} 166 L${x+7} 310 L${x-7} 310 Z`,C.garnet);}
  else if(kit==='suit'){k.fill(T,'#2c3a66');k.dots(T,INK.navy,7,.25);k.fill('M138 164 L152 214 L166 164 Z',C.white);k.fill('M149 176 L155 176 L158 214 L152 224 L146 214 Z',C.orange);k.key('M138 164 L152 214 L166 164',1.6);}
 });
}
function kitArm(k:Kit,kit:KitName){
 if(kit!=='barca'&&kit!=='suit')return;
 k.at(k.w/2,.012,(k.h-.012)/170,()=>{
  if(kit==='barca'){k.fill('M-18 4 Q0 -8 18 4 L17 62 L-17 62 Z',C.barca);k.fill('M-4 0 L6 0 L7 62 L-3 62 Z',C.garnet);}
  else k.fill('M-17 4 Q0 -6 17 4 L15 118 L-15 118 Z','#2c3a66');
  k.circle(0,6,5.5,INK.gold);});
}
function kitLeg(k:Kit,kit:KitName){
 const sh=kit==='ajax'||kit==='ned'?C.white:kit==='swe'?C.sweB:null,so=kit==='ajax'?C.white:kit==='ned'?C.orange:kit==='swe'?C.sweY:null;
 k.at(k.w/2,.012,(k.h-.012)/170,()=>{if(sh)k.fill('M-22 -4 L22 -4 L20 26 L-20 26 Z',sh);if(so)k.fill('M-13 100 L14 100 L14 136 L-13 136 Z',so);k.circle(0,6,5.5,INK.gold);});
}
const over=(s:PlateSpec,f:(k:Kit)=>void):PlateSpec=>({...s,paint:k=>{s.paint(k);f(k);}});
/** Same brad-jointed paper character as B.person, with a kit painted over the base shirt. */
function player(B:Builder,key:string,x:number,z:number,h:number,o:PO):Person{
 const kit=o.kit??'plain',shirt:Shirt=o.shirt??KIT_BASE[kit],po:PersonOpts={...o,shirt};key=K(key);
 h*=PERSON_SCALE;const body=B.stand(over(personSpec(key,h,po),k=>kitBody(k,kit,o)),x,z,{layer:o.layer??3,yaw:o.yaw});
 const w=h*320/512,jx=(j:number[])=>(j[0]/320-.5)*w,jy=(j:number[])=>h*(1-j[1]/512);
 const arm=(side:'L'|'R',hold:Hold)=>body.arm(over(armSpec(`${key}-arm${side}`,h,{shirt,skin:o.skin,hold,adult:o.adult}),k=>kitArm(k,kit)),jx(side==='L'?JOINTS.shoulderL:JOINTS.shoulderR),jy(side==='L'?JOINTS.shoulderL:JOINTS.shoulderR));
 const armL=arm('L',o.holdL??'none'),armR=arm('R',o.holdR??'none');armL.rot=-.12;armR.rot=.12;
 const leg=o.legs==='kick'?body.arm(over(legSpec(`${key}-leg`,h,{shirt,skin:o.skin}),k=>kitLeg(k,kit)),jx(JOINTS.hipR),jy(JOINTS.hipR),{z:-.006}):undefined;
 return {body,armL,armR,leg,h};
}
const BROWN='#5a3b24';

/* ───────────── page prints ───────────── */
function cobbles(k:Kit,x0:number,x1:number,y0:number,y1:number,tone='#d8ccb2'){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,tone);k.dots(p,INK.navy,.06,.09);
 for(let y=y0+.05,r=0;y<y1-.1;y+=.16,r++)for(let x=x0+(r%2?.1:0)+.03;x<x1-.15;x+=.2)k.key(rect(x,y,.15,.11),.008,'#9c8a66');}
function canal(k:Kit,side:'L'|'R',y0=0,y1=PAGE_D){const x0=side==='L'?-.95:0,x1=side==='L'?0:.95;const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,C.water);k.dots(p,INK.navy,.05,.28);
 for(let y=y0+.25;y<y1;y+=.5)k.key(`M${x0+.12} ${y} Q${(x0+x1)/2} ${y-.08} ${x1-.12} ${y+.04}`,.014,INK.white);
 const qx=side==='L'?-.95:.95;k.fill(rect(qx-.06,y0,.12,y1-y0),'#a99b84');k.key(`M${qx-.06} ${y0} L${qx-.06} ${y1} M${qx+.06} ${y0} L${qx+.06} ${y1}`,.012);}
function pitchPrint(k:Kit,x0:number,x1:number,night=false){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,night?'#3f7f5a':INK.grass,night?.9:.7);
 for(let i=0;i<8;i++){const y=i*PAGE_D/8;if(i%2)k.dots(rect(x0,y,x1-x0,PAGE_D/8),night?INK.navy:INK.leaf,.055,night?.35:.3);}k.dots(p,night?INK.navy:INK.leaf,.08,.12);}
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function dashes(k:Kit,pts:number[][],color:string=INK.yellow,w=.035){for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.max(2,Math.round(Math.hypot(bx-ax,by-ay)/.16));for(let j=0;j<n;j+=2){const f0=j/n,f1=Math.min(1,(j+1)/n);k.key(`M${lerp(ax,bx,f0)} ${lerp(ay,by,f0)} L${lerp(ax,bx,f1)} ${lerp(ay,by,f1)}`,w,color);}}}
function bollards(k:Kit,x:number,y0:number,y1:number){for(let y=y0;y<=y1;y+=.42){k.fill(ell(x+.03,y+.04,.07,.05),'#00000033');k.fill(ell(x,y,.055,.055),'#7a2e24');k.key(ell(x,y,.055,.055),.01);k.circle(x-.015,y-.015,.015,INK.white);}}
function planter(k:Kit,x:number,y:number){const b=rect(x-.2,y-.08,.4,.16);k.fill(b,C.wood);k.key(b,.01);for(let i=0;i<4;i++)k.circle(x-.14+i*.09,y-.1,.045,i%2?INK.pink:C.ajax);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function sky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.sky2);k.dots(p,INK.sky,.055,(x,y)=>.75-y/h*.75);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function roofline(k:Kit,w:number,y:number){const r=poly([[0,y+.18],[w,y],[w,y+.14],[0,y+.3]]);k.fill(r,INK.navy);k.hatch(r,INK.blue,.05,.2,.012);}
const AJAX_FANS=[C.white,C.ajax,C.white,C.ajax,INK.yellow,C.white];
const NED_FANS=[C.orange,C.orange,C.white,INK.yellow,C.orange,C.white,INK.navy];

/* ───────────── scenery plates ───────────── */
/** A tall Amsterdam canal house with a step, bell or neck gable. */
function canalHouse(k:Kit,x:number,base:number,w:number,h:number,c:string,g:number){
 const top=base-h,gh=w*.5;let d:string;
 if(g%3===0){const s=w/6,a=gh/3;d=poly([[x,base],[x,top],[x+s,top],[x+s,top-a],[x+2*s,top-a],[x+2*s,top-2*a],[x+4*s,top-2*a],[x+4*s,top-a],[x+5*s,top-a],[x+5*s,top],[x+w,top],[x+w,base]]);}
 else if(g%3===1)d=`M${x} ${base} L${x} ${top} Q${x+w*.06} ${top-gh*.4} ${x+w*.24} ${top-gh*.45} Q${x+w*.24} ${top-gh} ${x+w/2} ${top-gh} Q${x+w*.76} ${top-gh} ${x+w*.76} ${top-gh*.45} Q${x+w*.94} ${top-gh*.4} ${x+w} ${top} L${x+w} ${base} Z`;
 else d=poly([[x,base],[x,top],[x+w*.18,top],[x+w*.26,top-gh*.45],[x+w*.3,top-gh*.45],[x+w*.3,top-gh*.85],[x+w*.5,top-gh*1.05],[x+w*.7,top-gh*.85],[x+w*.7,top-gh*.45],[x+w*.74,top-gh*.45],[x+w*.82,top],[x+w,top],[x+w,base]]);
 k.fill(d,c);k.hatch(d,'rgba(34,54,107,.22)',.07,0,.006);k.dots(d,INK.navy,.05,(xx,yy)=>.08+(yy-top)/h*.12);k.key(d,.014);
 const floors=Math.max(1,Math.floor((h-.34)/.36));
 for(let f=0;f<floors;f++){const y=top+.1+f*.36;for(const fx of [.14,.56]){const wx=x+w*fx,ww=w*.3,win=rect(wx,y,ww,.24);k.fill(win,C.white);k.fill(rect(wx+.025,y+.025,ww-.05,.19),INK.blue);k.dots(rect(wx+.025,y+.025,ww-.05,.19),INK.sky,.03,.5);k.key(win,.01);k.key(`M${wx+ww/2} ${y} L${wx+ww/2} ${y+.24} M${wx} ${y+.12} L${wx+ww} ${y+.12}`,.008,C.white);}}
 k.fill(rect(x+w*.4,top-gh*.55,w*.2,gh*.3),C.white);k.key(rect(x+w*.4,top-gh*.55,w*.2,gh*.3),.01);
 const dr=rect(x+w*.36,base-.3,w*.28,.3);k.fill(dr,g%2?C.canal:INK.navy);k.key(dr,.012);k.fill(rect(x+w*.3,base-.04,w*.4,.04),'#9c8a66');
 k.key(`M${x+w*.5} ${top-gh*.82} L${x+w*.5} ${top-gh*.62} L${x+w*.58} ${top-gh*.62}`,.016);
}
const HOUSE_TONES=[C.brick,C.slate,C.cream,C.canal,C.ochre,C.rose,C.brickD];
/** A row of canal houses along a plate (base at the plate's bottom). */
const houseRow=(key:string,w:number,h:number,widths:number[],seed=0)=>spec(key,w,h,k=>{let x=0;widths.forEach((ww,i)=>{const hh=h-ww*.62-((i+seed)%3)*.18;canalHouse(k,x,h,ww,hh,HOUSE_TONES[(i+seed)%HOUSE_TONES.length],i+seed);x+=ww+.01;});});
function housePanel(k:Kit,w:number,h:number,base:number,seed:number){let x=-.1,i=0;while(x<w){const ww=.55+((i*7+seed)%3)*.12,hh=1.05+((i*5+seed)%4)*.18;canalHouse(k,x,base,ww,hh,HOUSE_TONES[(i+seed)%HOUSE_TONES.length],i+seed);x+=ww+.02;i++;}}
function treeBlob(k:Kit,x:number,y:number,r:number,c:string=INK.leaf){const p=ell(x,y,r,r*.85);k.fill(p,c);k.dots(p,INK.navy,.04,.2);k.key(p,.01);}

/** Stadium entrance building: roof, crowd tier, brick front with a gate opening for the door flap. */
const stadiumFront=(key:string,w:number,h:number,title:string)=>spec(key,w,h,k=>{
 for(const x of [.16,w-.16]){k.keyFill(rect(x-.025,.1,.05,h*.5),'#1a2447');const l=rect(x-.17,0,.34,.16);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<3;i++)k.circle(x-.1+i*.1,.08,.03,INK.yellow);}
 const roof=poly([[0,.42],[w/2,.26],[w,.42],[w,.54],[0,.54]]);k.fill(roof,INK.navy);k.hatch(roof,INK.blue,.05,.3,.012);k.key(roof,.012);
 const tier=rect(.04,.54,w-.08,.42);k.fill(tier,'#2d3f73');for(let r=0;r<3;r++)for(let i=0;i<Math.round(w/.12);i++){const x=.1+i*.12+(r%2)*.05,y=.62+r*.12;if(x>w-.08)continue;const c=AJAX_FANS[(i*5+r*3)%AJAX_FANS.length];k.circle(x,y,.035,c);k.fill(rect(x-.04,y+.025,.08,.05),c);}
 const base=rect(0,.96,w,h-.96);k.fill(base,C.brick);k.hatch(base,'rgba(34,54,107,.3)',.08,0,.007);k.dots(base,INK.navy,.05,.12);k.key(base,.014);
 for(const x of [.35,.75,w-.75,w-.35]){const a=`M${x-.12} ${h} L${x-.12} ${h-.3} Q${x} ${h-.44} ${x+.12} ${h-.3} L${x+.12} ${h} Z`;k.fill(a,'#3a2d2a');k.key(a,.01);}
 const gate=rect(w/2-.26,h-.62,.52,.62);k.keyFill(gate,'#1c1a24');k.fill(rect(w/2-.34,.98,.68,.14),C.white);k.key(rect(w/2-.34,.98,.68,.14),.01);k.text(title,w/2,1.095,.11,C.ajax,{max:.6});
 k.fill(rect(0,.93,w,.05),C.white);
});
const gateDoor=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,C.canal);k.dots(d,INK.navy,.035,.25);for(let i=1;i<4;i++)k.key(`M${i*w/4} 0 L${i*w/4} ${h}`,.01,'#1f4a38');k.key(d,.012);k.circle(w*.82,h*.55,.02,INK.gold);},{rim:.012});
const brickWall=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,.07,w,h-.07);k.fill(b,C.brick);k.dots(b,INK.navy,.045,.14);
 for(let r=0,y=.07;y<h;y+=.1,r++){k.key(`M0 ${y} L${w} ${y}`,.008,'#f0d9b8');for(let x=(r%2?.1:0);x<w;x+=.2)k.key(`M${x} ${y} L${x} ${Math.min(h,y+.1)}`,.008,'#f0d9b8');}
 k.fill(rect(-.02,0,w+.04,.08),INK.stone);k.key(rect(-.02,0,w+.04,.08),.01);k.key(b,.012);
 k.key(`M${w*.55} ${h*.3} L${w*.85} ${h*.3} L${w*.85} ${h*.85} M${w*.55} ${h*.3} L${w*.55} ${h*.85}`,.022,C.white);k.circle(w*.7,h*.58,.05,C.white);k.text('1 · 2',w*.25,h*.62,.13,C.white,{max:.4});});
const bike=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const r=h*.3;for(const x of [r+.02,w-r-.02]){k.fill(ell(x,h-r-.01,r,r),INK.paper);k.dots(ell(x,h-r-.01,r,r),INK.sky,.03,.35);k.key(ell(x,h-r-.01,r,r),.022);for(let i=0;i<4;i++){const a=i*Math.PI/4;k.key(`M${x-Math.cos(a)*r} ${h-r-.01-Math.sin(a)*r} L${x+Math.cos(a)*r} ${h-r-.01+Math.sin(a)*r}`,.006);}}
 const fx=r+.02,bx=w-r-.02,y=h-r-.01;k.key(`M${fx} ${y} L${w*.42} ${y} L${w*.62} ${h*.3} L${w*.3} ${h*.3} L${fx} ${y} M${w*.42} ${y} L${w*.3} ${h*.18} M${w*.62} ${h*.3} L${bx} ${y} M${w*.66} ${h*.18} L${w*.62} ${h*.3}`,.028,C.ajax);
 k.keyFill(rect(w*.22,h*.12,w*.16,h*.07));k.key(`M${w*.6} ${h*.16} L${w*.74} ${h*.14}`,.03);const bs=rect(w*.7,h*.14,w*.24,h*.2);k.fill(bs,C.wood);k.hatch(bs,'#6d4128',.025,.8,.006);k.key(bs,.01);for(let i=0;i<3;i++)k.circle(w*(.75+i*.07),h*.12,.03,i%2?INK.pink:INK.yellow);});
/** The European Cup: a silver cup with its two very big handles. */
const bigEars=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const cx=w/2;
 for(const s of [-1,1]){k.key(`M${cx+s*w*.18} ${h*.1} C${cx+s*w*.62} ${h*.02} ${cx+s*w*.6} ${h*.52} ${cx+s*w*.12} ${h*.42}`,w*.075,'#7d8794');k.key(`M${cx+s*w*.18} ${h*.1} C${cx+s*w*.62} ${h*.02} ${cx+s*w*.6} ${h*.52} ${cx+s*w*.12} ${h*.42}`,w*.035,C.silver);}
 const bowl=`M${cx-w*.26} ${h*.06} L${cx+w*.26} ${h*.06} Q${cx+w*.24} ${h*.46} ${cx} ${h*.54} Q${cx-w*.24} ${h*.46} ${cx-w*.26} ${h*.06} Z`;k.fill(bowl,C.silver);k.dots(bowl,INK.blue,.025,(x)=>.12+(x-cx)/w*.9);k.key(bowl,.012);
 k.fill(ell(cx-w*.1,h*.18,w*.05,h*.06),INK.white,.9);const stem=poly([[cx-w*.05,h*.53],[cx+w*.05,h*.53],[cx+w*.09,h*.74],[cx-w*.09,h*.74]]);k.fill(stem,C.silver);k.key(stem,.01);
 const base=poly([[cx-w*.24,h*.74],[cx+w*.24,h*.74],[cx+w*.3,h],[cx-w*.3,h]]);k.fill(base,INK.navy);k.key(base,.012);k.fill(rect(cx-w*.24,h*.83,w*.48,h*.04),C.silver);});
const arrowSpec=(key:string,w:number,h:number,color:string,dir=1)=>spec(key,w,h,k=>k.at(dir>0?0:w,0,1,()=>{const p=poly([[0,h*.33],[w*.6,h*.33],[w*.6,h*.06],[w,h*.5],[w*.6,h*.94],[w*.6,h*.67],[0,h*.67]]);k.fill(p,color);k.dots(p,INK.orange,.03,.35);k.key(p,.013);},dir<0));
const card=(key:string,w:number,h:number,label:string,color:string,ink:string=INK.white,sub?:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.03,.2);k.key(b,.012);k.text(label,w/2,sub?h*.56:h*.7,h*(sub?.4:.5),ink,{max:w*.84});if(sub)k.text(sub,w/2,h*.86,h*.18,ink,{max:w*.84,weight:800});},{rim:.016});
const post=(key:string,w:number,h:number)=>S.post(K(key),w,h,C.cream);


/* ───────────── hardship-story plates (symbolic, gentle) ───────────── */
/** A plain wooden kitchen chair, seen from the front: the empty chair at home. */
const chair=(key:string,w:number,h:number)=>spec(key,w,h,k=>{
 for(const x of [w*.1,w*.78]){const p=rect(x,0,w*.12,h*.62);k.fill(p,C.wood);k.hatch(p,'#6d4128',.03,1.3,.006);k.key(p,.012);}
 for(const [y,hh] of [[h*.08,h*.1],[h*.26,h*.08]]){const s=rect(w*.1,y,w*.8,hh);k.fill(s,C.wood);k.key(s,.01);}
 const seat=poly([[0,h*.5],[w,h*.5],[w*.94,h*.62],[w*.06,h*.62]]);k.fill(seat,'#c7864f');k.dots(seat,INK.navy,.03,.2);k.key(seat,.012);
 for(const x of [w*.1,w*.78]){const l=rect(x,h*.62,w*.12,h*.38);k.fill(l,C.wood);k.key(l,.012);}});
/** Simple painted people for photos and portraits. */
function mini(k:Kit,x:number,base:number,hh:number,shirt:string,hair:string,skin='#f1b88f'){const r=hh*.16;
 const body=`M${x-hh*.2} ${base} L${x-hh*.18} ${base-hh*.55} Q${x} ${base-hh*.66} ${x+hh*.18} ${base-hh*.55} L${x+hh*.2} ${base} Z`;k.fill(body,shirt);k.key(body,.008);
 k.fill(ell(x,base-hh*.72-r*.2,r,r),skin);k.key(ell(x,base-hh*.72-r*.2,r,r),.008);k.fill(`M${x-r} ${base-hh*.74} Q${x} ${base-hh*.98} ${x+r} ${base-hh*.74} Q${x} ${base-hh*.86} ${x-r} ${base-hh*.74} Z`,hair);
 k.circle(x-r*.35,base-hh*.72,r*.12,INK.navy);k.circle(x+r*.35,base-hh*.72,r*.12,INK.navy);k.key(`M${x-r*.35} ${base-hh*.64} Q${x} ${base-hh*.58} ${x+r*.35} ${base-hh*.64}`,.006);}
/** A framed family photo: four people and a caption. */
const photoFrame=(key:string,w:number,h:number,people:[string,string,number][],caption:string)=>spec(key,w,h,k=>{
 const f=rect(0,0,w,h);k.fill(f,INK.gold);k.hatch(f,C.wood,.03,.8,.006);k.key(f,.014);const inner=rect(w*.08,h*.08,w*.84,h*.66);k.fill(inner,'#f1dcb2');k.dots(inner,C.wood,.03,.25);k.key(inner,.01);
 people.forEach(([sh,hr,s],i)=>mini(k,w*(.2+i*.6/Math.max(1,people.length-1)),h*.74,h*.56*s,sh,hr));
 k.text(caption,w/2,h*.93,h*.16,INK.navy,{max:w*.84});});
/** The family home: a tall canal house with a big front window (the photo sits behind a shutter). */
const homeHouse=(key:string)=>spec(key,1.6,2.6,k=>{canalHouse(k,0,2.6,1.6,1.75,C.brick,1);
 const win=rect(.24,.98,1.12,.84);k.fill(win,C.white);k.key(win,.016);k.fill(rect(.3,1.04,1.0,.72),'#2a2f45');k.fill(rect(.18,1.82,1.24,.07),INK.stone);k.key(rect(.18,1.82,1.24,.07),.01);});
const shutterFlap=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,C.canal);k.dots(b,INK.navy,.03,.25);k.key(b,.014);k.key(`M${w/2} 0 L${w/2} ${h}`,.014);
 for(let i=1;i<7;i++)k.key(`M.04 ${i*h/7} L${w-.04} ${i*h/7}`,.008,'#1f4a38');k.fill(ell(w/2,h*.55,.07,.07),INK.gold);k.key(ell(w/2,h*.55,.07,.07),.008);},{rim:.012});
/** A paper rain cloud with drops hanging under it. */
const rainCloud=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const c=`M${w*.1} ${h*.55} Q0 ${h*.3} ${w*.2} ${h*.22} Q${w*.3} 0 ${w*.52} ${h*.1} Q${w*.72} 0 ${w*.82} ${h*.22} Q${w} ${h*.28} ${w*.9} ${h*.55} Z`;
 k.fill(c,'#8c93a8');k.dots(c,INK.navy,.035,.35);k.key(c,.012);for(let i=0;i<6;i++){const x=w*(.18+i*.13),y=h*(.66+(i%2)*.14);k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.08} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);k.key(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.08} Q${x-.03} ${y+.06} ${x} ${y} Z`,.006);}});
const heartSpec=(key:string,w:number,color:string=INK.pink)=>spec(key,w,w*.9,k=>{const h=w*.9,p=`M${w/2} ${h*.95} C${w*.1} ${h*.62} 0 ${h*.3} ${w*.24} ${h*.1} C${w*.38} 0 ${w*.5} ${h*.12} ${w/2} ${h*.24} C${w*.5} ${h*.12} ${w*.62} 0 ${w*.76} ${h*.1} C${w} ${h*.3} ${w*.9} ${h*.62} ${w/2} ${h*.95} Z`;
 k.fill(p,color);k.dots(p,INK.red,.035,.3);k.key(p,.014);k.fill(ell(w*.3,h*.3,w*.07,h*.05),INK.white,.8);});
const bigStar=(key:string,r:number)=>spec(key,r*2,r*2,k=>{const p=poly(Array.from({length:10},(_,j)=>{const a=-Math.PI/2+j*Math.PI/5,rr=j%2?r*.45:r*.95;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];}));k.fill(p,INK.yellow);k.dots(p,INK.orange,.03,.3);k.key(p,.012);});
const glow=(key:string,r:number)=>spec(key,r*2,r*2,k=>{k.dots(ell(r,r,r,r),INK.yellow,.03,(x,y)=>.9-Math.hypot(x-r,y-r)/r*.9);},{rim:0});
/** The vegetable shop: awning, sign and an open doorway (its door is a flap). */
const shopFront=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const wall=rect(0,.5,w,h-.5);k.fill(wall,C.cream);k.hatch(wall,'rgba(34,54,107,.18)',.07,0,.006);k.key(wall,.014);
 const sg=rect(.1,.08,w-.2,.34);k.fill(sg,C.canal);k.key(sg,.012);k.text('VEGETABLES',w/2,.33,.2,C.white,{max:w-.4});
 for(let i=0;i<8;i++){const x=i*w/8,s=poly([[x,.5],[x+w/8,.5],[x+w/8,.72],[x,.72]]);k.fill(s,i%2?C.white:INK.grass);k.key(s,.008);}
 for(let i=0;i<8;i++)k.fill(`M${i*w/8} .72 Q${i*w/8+w/16} .82 ${(i+1)*w/8} .72 Z`,i%2?C.white:INK.grass);
 const dw=rect(w*.56,.95,w*.34,h-.95);k.fill(dw,'#3a2d2a');k.key(dw,.012);for(let i=0;i<3;i++)k.fill(rect(w*.6,1.15+i*.22,w*.26,.03),C.wood);
 const win=rect(w*.08,1.0,w*.4,.55);k.fill(win,INK.sky2);k.dots(win,INK.blue,.03,.3);k.key(win,.012);});
const crate=(key:string,w:number,h:number,veg:string)=>spec(key,w,h,k=>{const b=rect(0,h*.4,w,h*.6);k.fill(b,C.wood);k.hatch(b,'#6d4128',.04,0,.008);k.key(b,.012);
 for(let i=0;i<5;i++)k.fill(ell(w*(.14+i*.18),h*.38,w*.1,h*.14),veg),k.key(ell(w*(.14+i*.18),h*.38,w*.1,h*.14),.008);for(let i=0;i<4;i++)k.fill(ell(w*(.22+i*.18),h*.24,w*.09,h*.12),veg);});
/** The club building with lockers behind a door flap. */
const clubFront=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,.3,w,h-.3);k.fill(b,C.brick);k.hatch(b,'rgba(34,54,107,.3)',.08,0,.007);k.dots(b,INK.navy,.05,.12);k.key(b,.014);
 const roof=poly([[-.02,.34],[w/2,0],[w+.02,.34]]);k.fill(roof,INK.navy);k.hatch(roof,INK.blue,.05,.3,.012);k.key(roof,.012);
 k.fill(rect(.15,.42,w-.3,.26),C.white);k.key(rect(.15,.42,w-.3,.26),.01);k.text('AJAX',w/2,.62,.2,C.ajax,{max:w*.6});
 const dw=rect(w*.2,.82,w*.6,h-.82);k.fill(dw,'#e9dcc0');k.key(dw,.012);
 for(let i=0;i<4;i++){const lx=w*.23+i*w*.14,l=rect(lx,.88,w*.12,h-.95);k.fill(l,i%2?INK.sky:'#9fb8c9');k.key(l,.01);k.key(`M${lx+.03} ${1.0} L${lx+w*.09} 1.0 M${lx+.03} 1.06 L${lx+w*.09} 1.06`,.008);k.text(String(i+1),lx+w*.06,1.3,.1,INK.navy);}});
const mopBucket=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.key(`M${w*.7} 0 L${w*.5} ${h*.8}`,.03,C.wood);const mop=poly([[w*.32,h*.78],[w*.66,h*.78],[w*.72,h],[w*.26,h]]);k.fill(mop,C.white);k.hatch(mop,INK.stone,.02,1.4,.006);k.key(mop,.008);
 const bk=poly([[0,h*.55],[w*.36,h*.55],[w*.32,h],[w*.04,h]]);k.fill(bk,INK.blue);k.dots(bk,INK.navy,.03,.3);k.key(bk,.01);k.key(`M.01 ${h*.55} Q${w*.18} ${h*.35} ${w*.35} ${h*.55}`,.01);});
const dumbbell=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.fill(rect(w*.2,h*.42,w*.6,h*.16),INK.grey);k.key(rect(w*.2,h*.42,w*.6,h*.16),.01);for(const x of [0,w*.8]){const p=rect(x,0,w*.2,h);k.fill(p,INK.navy);k.dots(p,INK.blue,.03,.4);k.key(p,.01);}});
const foodPlate=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.46,h*.5,w*.08,h*.5),C.wood);const t=ell(w/2,h*.35,w*.48,h*.2);k.fill(t,C.white);k.key(t,.012);
 k.fill(ell(w*.35,h*.3,w*.12,h*.1),INK.orange);k.fill(ell(w*.56,h*.28,w*.13,h*.1),INK.grass);k.fill(ell(w*.68,h*.36,w*.1,h*.08),C.ochre);k.fill(rect(w*.8,h*.02,w*.1,h*.26),C.white);k.key(rect(w*.8,h*.02,w*.1,h*.26),.008);});
/** A portrait card for the "people who helped" board. */
const portrait=(key:string,w:number,h:number,name:string,shirt:string,hair:string,skin:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f6e8c8');k.dots(b,INK.orange,.04,.15);k.key(b,.012);
 mini(k,w/2,h*.78,h*.8,shirt,hair,skin);k.fill(rect(0,h*.78,w,h*.22),INK.navy);k.text(name,w/2,h*.94,h*.12,INK.white,{max:w*.9});},{rim:.012});
const coverCard=(key:string,w:number,h:number,n:string)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,C.ajax);k.dots(b,INK.navy,.035,.2);k.key(b,.012);k.fill(heartSpecPath(w/2,h*.42,w*.36),C.white);k.text(n,w/2,h*.9,h*.14,C.white,{max:w*.8});},{rim:.016});
function heartSpecPath(cx:number,cy:number,s:number){return `M${cx} ${cy+s*.45} C${cx-s*.5} ${cy+s*.1} ${cx-s*.5} ${cy-s*.4} ${cx} ${cy-s*.15} C${cx+s*.5} ${cy-s*.4} ${cx+s*.5} ${cy+s*.1} ${cx} ${cy+s*.45} Z`;}
/** A football shirt with a big number. */
const shirtSpec=(key:string,w:number,h:number,num:string,base:string,stripe:string|null,ink:string)=>spec(key,w,h,k=>{const s=poly([[w*.3,0],[w*.7,0],[w,h*.18],[w*.88,h*.4],[w*.78,h*.33],[w*.78,h],[w*.22,h],[w*.22,h*.33],[w*.12,h*.4],[0,h*.18]]);
 k.fill(s,base);if(stripe)k.fill(rect(w*.4,0,w*.2,h),stripe);k.dots(s,INK.navy,.035,.15);k.key(s,.014);k.key(`M${w*.38} 0 Q${w/2} ${h*.12} ${w*.62} 0`,.012);k.text(num,w/2,h*.78,h*.5,ink,{max:w*.5,font:'Georgia,serif'});},{rim:.014});
const calendarBase=(key:string,w:number,h:number)=>spec(key,w,h,k=>{k.keyFill(rect(w*.46,h*.7,w*.08,h*.3),C.wood);const b=rect(0,0,w,h*.72);k.fill(b,C.white);k.key(b,.014);k.fill(rect(0,0,w,h*.14),C.ajax);for(let i=0;i<4;i++)k.circle(w*(.2+i*.2),h*.07,.025,INK.navy);});
const hospital=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,.25,w,h-.25);k.fill(b,'#eef0f2');k.dots(b,INK.sky,.04,.2);k.key(b,.014);k.fill(rect(-.02,.18,w+.04,.1),INK.blue);k.key(rect(-.02,.18,w+.04,.1),.01);
 k.fill(heartSpecPath(w/2,.12,.22),INK.pink);k.key(heartSpecPath(w/2,.12,.22),.01);for(let r=0;r<3;r++)for(let c=0;c<4;c++){const wn=rect(.12+c*(w-.24)/4,.42+r*.32,.2,.2);k.fill(wn,INK.sky);k.key(wn,.008);}
 k.text('HOSPITAL',w/2,h-.08,.13,INK.blue,{max:w*.7});});
const cigPack=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,C.white);k.fill(rect(0,0,w,h*.35),INK.red);k.key(b,.01);k.key(`M${w*.1} ${h*.1} L${w*.9} ${h*.9} M${w*.9} ${h*.1} L${w*.1} ${h*.9}`,.03,INK.navy);},{rim:.012});
const bin=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const b=poly([[0,h*.1],[w,h*.1],[w*.88,h],[w*.12,h]]);k.fill(b,INK.grey);k.hatch(b,INK.navy,.04,1.57,.006);k.key(b,.012);k.fill(rect(-.02,0,w+.04,h*.12),INK.navy);});
const poster=(key:string,w:number,h:number,l1:string,l2:string,color:string)=>spec(key,w,h,k=>{k.keyFill(rect(w*.46,h*.6,w*.08,h*.4),C.wood);const b=rect(0,0,w,h*.62);k.fill(b,color);k.dots(b,INK.navy,.03,.2);k.key(b,.014);
 k.text(l1,w/2,h*.28,h*.16,INK.white,{max:w*.86});k.text(l2,w/2,h*.5,h*.1,INK.white,{max:w*.86,weight:800});});
const houseRoof=(key:string,w:number,h:number)=>spec(key,w,h,k=>{const r=poly([[0,h*.55],[w/2,0],[w,h*.55],[w*.9,h*.55],[w*.9,h],[w*.84,h],[w*.84,h*.6],[w*.16,h*.6],[w*.16,h],[w*.1,h],[w*.1,h*.55]]);k.fill(r,INK.red);k.hatch(r,'#b9383a',.035,-.4,.012);k.key(r,.014);
 k.fill(heartSpecPath(w/2,h*.3,.2),INK.white);});

/* ───────────── 1 · The empty chair (ajax) ───────────── */
const ajaxPage:SpreadDef={id:'ajax',rest:26.4,
 left:k=>{cobbles(k,-5,-.95,0,PAGE_D);canal(k,'L');
  const pave=rect(-5,Z(-.2),4.05,1.9);k.fill(pave,'#e6dcc4',.7);for(let y=0;y<1.7;y+=.42)k.key(`M-5 ${Z(y)} L-.95 ${Z(y)}`,.008,'#9c8a66');
  footprints(k,-2.3,Z(-.05),-1.1,Z(.9),6);footprints(k,-2.05,Z(.1),-1.05,Z(1.25),5,INK.blue);bollards(k,-1.1,Z(-2.2),Z(.1));planter(k,-4.3,Z(-.6));
  k.text('AMSTERDAM',-2.95,Z(2.62),.5,INK.blue,{max:3.7});k.text('THE NETHERLANDS · 1947',-2.95,Z(2.92),.16,INK.navy,{weight:800});},
 right:k=>{cobbles(k,.95,5,0,PAGE_D);canal(k,'R');
  const pave=rect(.95,Z(-.4),4.05,2.6);k.fill(pave,'#e6dcc4',.7);for(let y=-.2;y<2.2;y+=.42)k.key(`M.95 ${Z(y)} L5 ${Z(y)}`,.008,'#9c8a66');
  footprints(k,1.05,Z(1.25),1.9,Z(.3),5);bollards(k,1.1,Z(-2.2),Z(-.5));
  k.text('FIVE MINUTES FROM AJAX',2.95,Z(2.72),.27,INK.pink,{max:3.8});},
 build:B=>{
  const bd=B.vfold(spec('h1-bdL',4.5,3,k=>{sky(k,4.5,3);treeBlob(k,.4,2.1,.35);housePanel(k,4.5,3,2.55,1);const w=rect(0,2.55,4.5,.45);k.fill(w,C.water);k.dots(w,INK.navy,.04,.3);}),
   spec('h1-bdR',4.5,3,k=>{sky(k,4.5,3);roofline(k,4.5,.95);crowd(k,4.5,1.25,2.25,AJAX_FANS,2);lightRig(k,.8,.35);lightRig(k,3.7,.3);
    const base=rect(0,2.25,4.5,.75);k.fill(base,C.brick);k.hatch(base,'rgba(34,54,107,.3)',.08,0,.007);k.key(base,.012);treeBlob(k,4.25,2.6,.3);}),-3.05,1.22);
  const sunP=bd.add(S.sun(K('h1-sun'),.36),'L',3.4,1.3,{out:.015}),cloudL=bd.add(S.cloud(K('h1-cloud1'),1.0,.46),'L',1.4,1.05);
  const rainL=bd.add(rainCloud('h1-rainL',1.3,.8),'L',1.1,2.05,{out:.03}),rainR=bd.add(rainCloud('h1-rainR',1.2,.74),'R',2.2,1.9,{out:.03});
  const flags=bd.add(S.bunting(K('h1-bunting'),3.8,.4,[C.ajax,C.white]),'R',.35,1.25,{out:.02}),birdsP=bd.add(S.birds(K('h1-birds'),.8,.3),'L',2.2,.6,{out:.02});
  // Left: the family home with its big window; the photo waits behind the shutter.
  B.stand(houseRow('h1-houses',1.45,2.25,[.7,.72],3),-4.2,-1.45,{layer:1});
  const home=B.stand(homeHouse('h1-home'),-2.45,-1.1,{layer:1});
  home.add(photoFrame('h1-photo',.94,.68,[[C.slate,BROWN,1],[C.rose,BROWN,.92],[C.orange,BROWN,.7],[C.ajax,BROWN,.62]],'MANUS · NEL · HENNY · JOHAN'),0,.83,{z:.008});
  const shutter=home.flap(shutterFlap('h1-shutter',1.06,.78),0,1.6,{z:.016});
  const yearCard=home.add(card('h1-1947',.5,.3,'1947',INK.yellow,INK.navy),.52,2.05,{z:.02});
  B.stand(S.tree(K('h1-tree'),.9,1.4,'round'),-.75,-1.4,{layer:1});
  const signP=B.stand(S.sign(K('h1-sign'),1.0,.85,'AJAX · 5 MIN'),-1.2,-.35,{layer:2});
  const dad=player(B,'h1-dad',-3.0,.45,1.72,{kit:'plain',shirt:'fan',hair:'short',hairColor:BROWN,adult:true,layer:2,face:'smile'});B.slot(-3.0,.6,-1.5,.6);
  const boy=player(B,'h1-boy',-2.4,.95,1.1,{kit:'plain',shirt:'casual',hair:'messi',hairColor:BROWN,face:'grin',holdL:'ball'});B.slot(-2.4,1.1,-1.3,1.1);
  const chairP=B.stand(chair('h1-chair',.62,.9),-3.35,.55,{layer:2});
  const mum=player(B,'h1-mum',-2.05,1.35,1.66,{kit:'plain',shirt:'fan',hair:'bun',hairColor:BROWN,adult:true,face:'sad',layer:3});
  const boySad=player(B,'h1-boySad',-1.35,1.6,1.1,{kit:'plain',shirt:'casual',hair:'messi',hairColor:BROWN,face:'sad'});
  const heart=mum.body.add(S.bubble(K('h1-heart'),.56,.46,'heart'),-.5,1.95,{z:-.02});
  const lampP=B.stand(S.lamp(K('h1-lamp'),.28,1.2),-.55,2.1,{layer:3});const halo=lampP.add(glow('h1-glow',.3),0,.82,{z:-.01,anchor:'center'});
  // Right: the stadium next door, father and son, the tenth birthday, then the date.
  const stadium=B.stand(stadiumFront('h1-stadium',2.8,1.55,'AJAX'),3.1,-1.2,{layer:1});
  const gate=stadium.flap(gateDoor('h1-gate',.5,.6),-.25,.01,{anchor:'bl',axis:'y',z:.012});
  const dadR=player(B,'h1-dadR',2.0,-.1,1.72,{kit:'plain',shirt:'fan',hair:'short',hairColor:BROWN,adult:true,layer:2,face:'grin'});
  const boyR=player(B,'h1-boyR',2.7,.35,1.1,{kit:'plain',shirt:'casual',hair:'messi',hairColor:BROWN,face:'grin',layer:2});
  const junior=player(B,'h1-junior',3.3,.85,1.14,{kit:'ajax',hair:'messi',hairColor:BROWN,face:'grin'});
  const youth=[player(B,'h1-y1',4.35,.2,1.12,{kit:'ajax',hair:'short',skin:'#d99a6c',face:'smile',layer:2}),player(B,'h1-y2',4.55,1.25,1.1,{kit:'ajax',hair:'curly',skin:'#7f5138',face:'smile'})];
  const ten=B.stand(card('h1-ten',.62,.5,'10',INK.yellow,INK.navy,'BIRTHDAY'),2.0,1.35,{layer:3,tab:false});
  const date=B.stand(card('h1-date',1.3,.5,'8 JULY 1959',INK.navy,INK.white),1.75,2.05,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,T=b.narrated?Math.max(b.t,act>0?26.4:0):26.4;
   sunP.dy=-.8*beat(T,0,2.2)+.9*beat(T,20,22)-.9*beat(T,39,41);cloudL.dx=.6*beat(T,0,44)-.3;birdsP.dx=1.2*beat(T,3,9);
   // 1947, Amsterdam: the home rises, the year card pops.
   home.s=beat(T,1.9,3);yearCard.scale=beat(T,5.6,6.3);
   // Five minutes from the stadium; his father, an Ajax fan, walks there with him.
   dad.body.s=beat(T,8.3,9.2)*(1-beat(T,13.4,14.1));boy.body.s=beat(T,8.6,9.5)*(1-beat(T,13.6,14.3));
   const walk=beat(T,10,13.5);dad.body.x=-3.0+1.5*walk;boy.body.x=-2.4+1.1*walk;dad.armR.rot=.12+.5*wave(T,10,13.5,1.6);boy.armR.rot=.12+.5*wave(T,10,13.5,1.8);
   signP.s=beat(T,9.4,10.2);stadium.s=beat(T,9.8,11);gate.flip=-1.4*beat(T,12.8,13.6);
   dadR.body.s=beat(T,13.8,14.6)*(1-beat(T,21.6,23.4));boyR.body.s=beat(T,14,14.8)*(1-beat(T,15.6,16.2));
   dadR.armL.rot=-.12-2.3*beat(T,14.6,15.1)+2.3*beat(T,19.8,20.4);dadR.armR.rot=.12+2.3*beat(T,14.6,15.1)-2.3*beat(T,19.8,20.4)+.25*wave(T,15.1,19.8,1.4);
   flags.dy=.05*wave(T,14,19.5,1.2)-.25*beat(T,20,21.5);
   // Tenth birthday: he joins the Ajax youth team.
   junior.body.s=beat(T,15.7,16.5);ten.s=beat(T,16.2,17);youth.forEach((y,i)=>{y.body.s=beat(T,16.4+i*.4,17.2+i*.4);const up=beat(T,17.2,17.7)-beat(T,19.3,19.9);y.armL.rot=-.12-2.2*up;y.armR.rot=.12+2.2*up;});
   junior.armL.rot=-.12-2.3*(beat(T,17,17.5)-beat(T,19.3,19.9));junior.armR.rot=.12+2.3*(beat(T,17,17.5)-beat(T,19.3,19.9));
   // 8 July 1959: rain clouds; his father's figure folds away; at home, the empty chair.
   const rain=beat(T,19.8,21.4)*(1-beat(T,39,41.5));rainL.visible=rainR.visible=rain>.02;rainL.dy=-.9*(1-rain);rainR.dy=-.9*(1-rain);rainL.dx=-.4*(1-rain);
   date.s=beat(T,20.4,21.2);chairP.s=beat(T,23.2,24.2);
   // Lift the shutter: the family photo, all four of them.
   shutter.flip=-2.75*Math.max(beat(T,27,28.2),beat(act,0,1));
   // Losing a parent is hard: his mother and the boy close together.
   mum.body.s=beat(T,30.2,31.1);boySad.body.s=beat(T,30.6,31.5);mum.armL.rot=-.12-1.1*beat(T,31.6,32.4);boySad.armR.rot=.12+.9*beat(T,31.9,32.6);
   // Shaped his life: the lamp lights; then talk to someone you trust.
   halo.scale=beat(T,35.3,36.3);heart.visible=T>38.8;heart.dy=-.5+.5*beat(T,38.8,39.4);
   return b.narrated?kf(T,[[1.9,0],[2.6,-.7],[8,-.7],[9.6,0],[13.6,.7],[19.4,.7],[20,0],[26.4,0],[27,-.7],[38.4,-.7],[39.2,-.3]]):(act>0?-.7:0);
  };
 }};

/* ───────────── 2 · A new way for the family (total) ───────────── */
const familyPage:SpreadDef={id:'total',rest:19.4,
 left:k=>{cobbles(k,-5,0,0,PAGE_D);const pave=rect(-5,Z(-.6),5,1.4);k.fill(pave,'#e6dcc4',.7);
  const path=[[-2.3,Z(1.2)],[-1.5,Z(1.45)],[-.6,Z(1.3)],[0,Z(1.2)]];dashes(k,path,INK.pink,.05);
  k.text('AFTER 1959',-2.55,Z(2.62),.44,INK.blue,{max:4.2});k.text('A NEW WAY FOR THE FAMILY',-2.55,Z(2.92),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{cobbles(k,0,5,0,PAGE_D);const pave=rect(0,Z(-.6),5,1.4);k.fill(pave,'#e6dcc4',.7);dashes(k,[[0,Z(1.2)],[.8,Z(1.1)],[1.6,Z(.7)]],INK.pink,.05);
  k.text('NEL · HENK · JOHAN',2.55,Z(2.7),.3,INK.pink,{max:4.2});},
 build:B=>{
  const bd=B.vfold(spec('h2-bdL',4.5,3,k=>{sky(k,4.5,3);housePanel(k,4.5,3,2.75,4);k.fill(rect(0,2.75,4.5,.25),INK.stone);}),
   spec('h2-bdR',4.5,3,k=>{sky(k,4.5,3);roofline(k,4.5,.95);crowd(k,4.5,1.25,2.35,AJAX_FANS,3);lightRig(k,.8,.35);lightRig(k,3.7,.3);k.fill(rect(0,2.35,4.5,.65),C.brick);k.key('M0 2.35 L4.5 2.35',.012);}),-3.05,1.22);
  const sunP=bd.add(S.sun(K('h2-sun'),.34),'R',3.6,1.9,{out:.015}),cloud=bd.add(S.cloud(K('h2-cloud'),1.0,.45),'L',1.5,1.9);
  const bunt=bd.add(S.bunting(K('h2-bunt'),3.4,.4,[C.ajax,C.white,INK.pink]),'R',.5,1.5,{out:.02});
  // Left: the vegetable shop Nel could not keep going alone.
  const shop=B.stand(shopFront('h2-shop',2.5,2.0),-2.9,-1.1,{layer:1});
  const door=shop.flap(spec('h2-door',.82,1.02,k=>{const d=rect(0,0,.82,1.02);k.fill(d,C.canal);k.dots(d,INK.navy,.03,.25);k.key(d,.012);k.fill(rect(.12,.1,.58,.36),INK.sky2);k.key(rect(.12,.1,.58,.36),.01);k.circle(.7,.6,.025,INK.gold);},{rim:.012}),.2,.02,{anchor:'bl',axis:'y',z:.012});
  const closedCard=shop.add(card('h2-closed',.62,.28,'CLOSED',INK.red),-.62,.98,{z:.02});
  const openCard=shop.flap(card('h2-open',.62,.28,'OPEN',INK.grass),-.62,1.26,{z:.028});
  const crates=[B.stand(crate('h2-c1',.62,.42,INK.orange),-4.3,.15,{layer:2}),B.stand(crate('h2-c2',.62,.42,INK.grass),-3.6,.3,{layer:2}),B.stand(crate('h2-c3',.55,.4,C.ajax),-1.65,.25,{layer:2})];
  const nelL=player(B,'h2-nelL',-2.6,.7,1.66,{kit:'plain',shirt:'fan',hair:'bun',hairColor:BROWN,adult:true,face:'open'});B.slot(-2.6,.85,-.9,.85);
  const pathL=B.flat(spec('h2-pathL',1.1,.5,k=>{const p=rect(0,0,1.1,.5);k.fill(p,INK.yellow);k.dots(p,INK.orange,.04,.3);k.key(p,.012);k.fill(poly([[.75,.1],[1.0,.25],[.75,.4]]),INK.pink);k.text('1',.35,.34,.22,INK.navy);}),-1.35,1.95,{edge:'right',hinge:1.45});
  // Right: the club where Nel cleans the lockers; Henk, the caretaker.
  const club=B.stand(clubFront('h2-club',2.2,1.9),2.2,-1.15,{layer:1});
  const cdoor=club.flap(spec('h2-cdoor',1.32,1.08,k=>{const d=rect(0,0,1.32,1.08);k.fill(d,INK.navy);k.dots(d,INK.blue,.03,.3);k.key(d,.012);k.key('M.66 0 L.66 1.08',.012,'#101a36');k.circle(.58,.55,.025,INK.gold);k.circle(.74,.55,.025,INK.gold);},{rim:.012}),-.66,.0,{anchor:'bl',axis:'y',z:.014});
  const nelR=player(B,'h2-nelR',1.25,.35,1.66,{kit:'plain',shirt:'fan',hair:'bun',hairColor:BROWN,adult:true,face:'smile',layer:2});
  const mop=B.stand(mopBucket('h2-mop',.55,.85),.75,.75,{layer:3});
  const henk=player(B,'h2-henk',3.7,.2,1.74,{kit:'plain',shirt:'navy',hair:'cap',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const love=henk.body.add(S.bubble(K('h2-love'),.56,.46,'heart'),-.55,2.0,{z:-.02});
  const pathR=B.flat(spec('h2-pathR',1.1,.5,k=>{const p=rect(0,0,1.1,.5);k.fill(p,INK.yellow);k.dots(p,INK.orange,.04,.3);k.key(p,.012);k.fill(poly([[.75,.1],[1.0,.25],[.75,.4]]),INK.pink);k.text('2',.35,.34,.22,INK.navy);}),.15,1.95,{edge:'left',hinge:-1.45});
  // The family grows: a family photo under a paper roof, and Johan in front.
  const roof=B.stand(houseRoof('h2-roof',2.0,1.75),3.3,.95,{layer:3,tab:false});
  const photo=B.stand(photoFrame('h2-family',1.3,.9,[[C.rose,BROWN,1],[INK.navy,INK.navy,1.05],[C.ajax,BROWN,.8],[C.orange,BROWN,.82]],'OUR FAMILY'),3.3,1.15,{layer:3,tab:false});
  const johan=player(B,'h2-johan',4.55,1.75,1.28,{kit:'ajax',hair:'messi',hairColor:BROWN,face:'grin'});
  return (b:Beat)=>{const act=b.action,T=b.narrated?Math.max(b.t,act>0?19.4:0):19.4;
   cloud.dx=.8*beat(T,0,40)-.3;sunP.dy=-.6*beat(T,34.8,36.5);
   // The shop, Nel and the crates; she cannot keep it going alone.
   shop.s=beat(T,2.2,3.2);nelL.body.s=beat(T,2.8,3.7)*(1-beat(T,9.2,9.9));
   crates.forEach((c,i)=>{c.s=beat(T,3.2+i*.3,4+i*.3)*(1-beat(T,6.6+i*.3,7.3+i*.3));});
   nelL.armR.rot=.12+1.4*beat(T,4.4,5)-1.4*beat(T,6.2,6.8);const go=beat(T,7.4,9.2);nelL.body.x=-2.6+1.6*go;nelL.armL.rot=-.12-.4*wave(T,7.4,9.2,1.6);
   // Step 1: the shop door closes and the sign turns to CLOSED.
   const s1=Math.max(beat(T,23.4,24.3),beat(act,0,.3));door.flip=-1.35*(1-s1);openCard.flip=-2.8*s1;closedCard.scale=1;pathL.s=.03+.97*s1;
   // Work at Ajax: the club, Nel with her mop; the locker room.
   club.s=beat(T,9.3,10.3);nelR.body.s=beat(T,9.8,10.7);mop.s=beat(T,10.3,11.1);
   nelR.armR.rot=.12+.7*wave(T,11.2,14,1.2);
   // Step 2: the club door opens on the lockers (also shown while she is cleaning them).
   const s2=Math.max(beat(T,11.2,12)*(1-beat(T,18.2,19)),beat(T,25,25.9),beat(act,.34,.64));cdoor.flip=-1.45*s2;pathR.s=.03+.97*Math.max(beat(T,25,25.9),beat(act,.34,.64));
   // Henk Angel, the caretaker; later they marry.
   henk.body.s=beat(T,14.5,15.4);henk.armL.rot=-.12-2.1*beat(T,15.4,15.9)+2.1*beat(T,16.8,17.3);love.visible=T>16.6;love.dy=-.5+.5*beat(T,16.6,17.2);
   bunt.visible=T>17.2;bunt.dy=-.7+.7*beat(T,17.2,18);nelR.armL.rot=-.12-.9*beat(T,17,17.6);
   // Step 3: the family grows, under one roof.
   const s3=Math.max(beat(T,26.6,27.5),beat(act,.68,.98));photo.s=s3;
   roof.s=beat(T,29.8,30.8);johan.body.s=beat(T,28.4,29.3);johan.armR.rot=.12+1.5*beat(T,31.2,31.8);
   const wave1=beat(T,35.4,36)*(1)+(b.narrated?0:0);[nelR,henk].forEach((p,i)=>{p.armR.rot+=1.6*wave1+.3*wave(T,36,40,1.3+i*.2);});johan.armL.rot=-.12-2.2*beat(T,35.6,36.2);
   return b.narrated?kf(T,[[2,0],[2.8,-.65],[9,-.65],[9.8,.65],[19.2,.65],[19.8,0],[23,0],[23.4,-.5],[24.6,-.5],[25,.6],[33.8,.6],[35,0]]):(act>0?0:0);
  };
 }};

/* ───────────── 3 · A second family (cups) ───────────── */
const cupsPage:SpreadDef={id:'cups',rest:25,
 left:k=>{cobbles(k,-5,0,0,PAGE_D);const pg=rect(-4.8,Z(-.4),4.4,2.3);k.fill(pg,INK.sand);k.dots(pg,INK.orange,.05,.25);k.key(pg,.014);
  for(const x of [-4.6,-.6])k.key(`M${x} ${Z(-.2)} L${x} ${Z(1.7)}`,.03,INK.white);
  k.text('AJAX · 1957 TO 1973',-2.55,Z(2.62),.36,INK.blue,{max:4.2});k.text('A SECOND FAMILY',-2.55,Z(2.92),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{const f=rect(0,0,5,PAGE_D);k.fill(f,'#caa27a');k.dots(f,C.wood,.05,.25);for(let y=.35;y<PAGE_D;y+=.42)k.key(`M0 ${y} L5 ${y}`,.012,'#8a5238');
  const rug=rect(.7,Z(.1),3.7,1.9);k.fill(rug,C.ajax,.85);k.dots(rug,INK.navy,.05,.2);k.fill(rect(.9,Z(.3),3.3,1.5),C.white,.9);k.fill(rect(2.2,Z(.3),.7,1.5),C.ajax,.85);k.key(rug,.014);
  k.text('PEOPLE WHO HELPED',2.55,Z(2.68),.34,INK.pink,{max:4.2});},
 build:B=>{
  const bd=B.vfold(spec('h3-bdL',4.5,3,k=>{sky(k,4.5,3);housePanel(k,4.5,3,2.7,2);k.fill(rect(0,2.7,4.5,.3),INK.stone);}),
   spec('h3-bdR',4.5,3,k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3e3c0');for(let x=.15;x<4.5;x+=.3)k.fill(rect(x,0,.12,3),'#ecd3a8');k.dots(p,INK.orange,.06,.1);
    for(let i=0;i<3;i++){const x=.35+i*.75,pen=poly([[x,.4],[x+.6,.55],[x,.7]]);k.fill(pen,i%2?C.white:C.ajax);k.key(pen,.01);k.key(`M${x} .3 L${x} .8`,.02,C.wood);}
    const skirt=rect(0,2.55,4.5,.45);k.fill(skirt,C.wood);k.key(`M0 2.55 L4.5 2.55`,.02);}),-3.05,1.22);
  const ban=bd.add(S.banner(K('h3-ban'),2.3,.36,'EUROPEAN CUP',C.ajax),'R',1.9,2.25,{out:.02}),conf=bd.add(S.confetti(K('h3-conf'),2.4,1.2,4),'R',.4,1.3,{out:.03});
  const cloud=bd.add(S.cloud(K('h3-cloud'),1.0,.45),'L',1.4,2.1);
  // Left: the playground, and three coaches who each helped.
  B.stand(S.fenceStrip(K('h3-fence'),3.2,.4,C.white),-2.6,-1.5,{layer:1,tab:false});
  const boy=player(B,'h3-boy',-3.2,.85,1.0,{kit:'plain',shirt:'casual',hair:'messi',hairColor:BROWN,legs:'kick',face:'grin'});
  const ball=B.stand(S.ball(K('h3-ball'),.11),-2.85,1.0,{layer:3,tab:false});
  const jany=player(B,'h3-jany',-4.35,-.3,1.66,{kit:'plain',shirt:'coach',hair:'short',hairColor:'#7a6a5a',adult:true,face:'smile',layer:2});
  const vic=player(B,'h3-vic',-2.75,-.75,1.7,{kit:'plain',shirt:'navy',hair:'bald',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const rinus=player(B,'h3-rinus',-1.3,-.2,1.7,{kit:'suit',hair:'short',hairColor:'#2b2b33',adult:true,face:'smile',layer:2});
  const bell=B.stand(dumbbell('h3-bell',.5,.2),-2.2,1.55,{layer:3,tab:false}),food=B.stand(foodPlate('h3-food',.62,.5),-4.25,1.5,{layer:3});
  const argue=[rinus.body.add(S.bubble(K('h3-arg2'),.5,.42,'dots'),-.5,1.95,{z:-.02}),boy.body.add(S.bubble(K('h3-arg3'),.46,.4,'dots'),.4,1.3,{z:-.02})];
  const heartL=rinus.body.add(S.bubble(K('h3-heart'),.5,.42,'heart'),.5,1.95,{z:-.02});
  // Right: the shelf of European Cups, and the board of three flaps.
  const shelf=B.stand(spec('h3-shelf',3.4,2.1,k=>{const back=rect(.1,.1,3.2,2.0);k.fill(back,'#e9d2a4');k.dots(back,INK.orange,.05,.12);
    for(const x of [0,3.28]){const s=rect(x,0,.12,2.1);k.fill(s,C.wood);k.hatch(s,'#6d4128',.03,1.3,.008);k.key(s,.012);}
    const crown=rect(-.05,0,3.5,.14);k.fill(crown,C.wood);k.key(crown,.012);k.text('EUROPEAN CUP',1.7,.115,.1,INK.gold,{max:2});
    const board=rect(.1,.75,3.2,.16);k.fill(board,'#8a5238');k.key(board,.014);
    ['1971','1972','1973'].forEach((y,i)=>{const x=.75+i*.95;k.text(y,x,.875,.11,INK.white,{max:.6});k.fill(ell(x,.5,.34,.22),C.white,.5);});
    k.fill(rect(.1,2.02,3.2,.08),'#6d4128');}),2.55,-1.1,{layer:1});
  const cups=[0,1,2].map(i=>shelf.add(bigEars(`h3-cup${i}`,.72,.84),-.95+i*.95,1.35,{z:.02}));
  const board=B.stand(spec('h3-board',3.3,1.25,k=>{const b=rect(0,0,3.3,1.05);k.fill(b,INK.navy);k.dots(b,INK.blue,.04,.3);k.key(b,.016,'#101a36');k.keyFill(rect(.3,1.05,.08,.2),C.wood);k.keyFill(rect(2.92,1.05,.08,.2),C.wood);}),2.55,.55,{layer:2});
  const HELP:[string,string,string,string][]=[['JANY VAN DER VEEN',INK.pink,'#7a6a5a','#f1b88f'],['VIC BUCKINGHAM',INK.navy,'#f1b88f','#f1b88f'],['RINUS MICHELS','#2c3a66','#2b2b33','#f1b88f']];
  HELP.forEach(([n,sh,hr,sk],i)=>board.add(portrait(`h3-por${i}`,.95,.9,n,sh,hr,sk),-1.07+i*1.07,.28,{z:.01}));
  const covers=[0,1,2].map(i=>board.flap(coverCard(`h3-cov${i}`,.97,.92,String(i+1)),-1.07+i*1.07,1.19,{z:.02}));
  const mates=[player(B,'h3-m1',.65,1.75,1.14,{kit:'ajax',hair:'short',hairColor:'#c9a063',face:'smile'}),player(B,'h3-m2',4.45,1.75,1.14,{kit:'ajax',hair:'curly',skin:'#7f5138',face:'smile'})];
  return (b:Beat)=>{const act=b.action,T=b.narrated?Math.max(b.t,act>0?25:0):25;
   cloud.dx=.8*beat(T,0,42)-.3;
   // Jany van der Veen spots the boy playing and invites him in.
   boy.body.s=beat(T,2,2.9);ball.s=boy.body.s;const kick=Math.max(pulse(T,3.2,3.7),pulse(T,5.2,5.7),pulse(T,7.2,7.7));boy.leg!.rot=.6*kick-1.2*Math.max(0,kick-.5);
   const bx=kf(T,[[3.3,-2.85],[4.3,-1.9],[5.3,-2.85],[6.3,-1.9],[7.3,-2.85]]);ball.x=bx;ball.rot=-bx*5;
   jany.body.s=beat(T,3.6,4.5);jany.armR.rot=.12+2.0*beat(T,6.4,7)-2.0*beat(T,9,9.6)+.3*wave(T,7,9,1.4);
   // Small and not yet strong: Vic Buckingham, the gym and better food.
   vic.body.s=beat(T,9.8,10.7);bell.s=beat(T,12.6,13.4);food.s=beat(T,15,15.8);
   vic.armL.rot=-.12-1.6*beat(T,12.7,13.2)+1.6*beat(T,14.2,14.7)-1.6*beat(T,15.1,15.6)+1.6*beat(T,17.4,18);
   boy.armL.rot=-.12-2.2*beat(T,13.3,13.8)+2.2*beat(T,14.6,15);
   // Rinus Michels: almost like a father, even though they argued.
   rinus.body.s=beat(T,18.4,19.3);
   const arg=beat(T,21.6,22.1)*(1-beat(T,23.4,23.8));argue[0].visible=argue[1].visible=arg>.02;argue[0].dy=argue[1].dy=-.4*(1-arg);
   heartL.visible=T>23.6&&T<28.5;heartL.dy=-.5+.5*beat(T,23.6,24.2);rinus.armL.rot=-.12-1.0*beat(T,19.6,20.2)+1.0*beat(T,21.4,21.8);
   // Right: the board and shelf are ready; lift the flaps to meet the helpers.
   board.s=beat(T,2.2,3.2);
   shelf.s=beat(T,2.6,3.6);
   let open=0;covers.forEach((c,i)=>{const o=Math.max(beat(T,[4.2,10.4,18.9][i],[4.9,11.1,19.6][i])*(1-beat(T,24,24.6)),beat(T,26+i*.8,26.7+i*.8),clamp01(act*3-i));c.flip=-2.8*o;open+=o;});
   // With them, Ajax won the European Cup in 1971, 1972 and 1973.
   cups.forEach((c,i)=>{const l=Math.max(beat(T,[30.4,32.4,34.4][i],[31.2,33.2,35.2][i]),clamp01(act*3-i));c.dy=-1.3*(1-l);c.visible=l>.01;});
   ban.scale=beat(T,29.5,30.3);conf.visible=T>34.8||act>=1;conf.dy=-1.1+1.2*Math.max(beat(T,34.8,37),act>=1?1:0);
   mates.forEach((m,i)=>{m.body.s=beat(T,28.8+i*.3,29.6+i*.3);const up=beat(T,35.4,36)+(act>=1?1:0);m.armL.rot=-.12-2.3*Math.min(1,up);m.armR.rot=.12+2.3*Math.min(1,up);});
   // You can find a second family.
   [jany,vic].forEach((p,i)=>{p.armR.rot+=1.2*beat(T,37+i*.3,37.6+i*.3);});rinus.armR.rot=.12+1.6*beat(T,37.2,37.8);
   return b.narrated?kf(T,[[2,0],[2.6,-.6],[24.6,-.6],[25.2,.6],[36.2,.6],[36.8,0]]):(act>0?.6:0);
  };
 }};

/* ───────────── 4 · Hurt, then back (turn) ───────────── */
type TurnPose={x:number;yaw:number;leg:number;armL:number;armR:number;bx:number;bz:number;ox:number;orot:number;oyaw:number;oarm:number};
function turnPose(p:number):TurnPose{
 const leg=.7*beat(p,0,.12)-1.4*beat(p,.12,.24)+.7*beat(p,.24,.3)+.55*beat(p,.32,.48)-.55*beat(p,.52,.62);
 const [bx,bz]=kp(p,[[.3,4.12,.78],[.45,3.75,.42],[.58,3.48,.3],[.66,3.3,.3],[.95,2.2,.36]]);
 return {x:lerp(3.7,2.7,beat(p,.64,1)),yaw:.55*beat(p,.56,.7)-.3*beat(p,.85,1),leg,armL:-.12-.9*beat(p,.1,.25)+.9*beat(p,.3,.4)-1.1*pulse(p,.62,1),armR:.12+.6*beat(p,.1,.25)-.6*beat(p,.3,.4)+1.1*pulse(p,.62,1),
  bx,bz,ox:4.5+.25*beat(p,.12,.3)-.1*beat(p,.75,1),orot:-.28*beat(p,.12,.3)+.12*beat(p,.75,1),oyaw:-.5*beat(p,.66,.9),oarm:2.0*beat(p,.12,.28)-.9*beat(p,.75,1)};
}
const turnPage:SpreadDef={id:'turn',rest:23.5,
 left:k=>{const f=rect(-5,0,5,PAGE_D);k.fill(f,'#caa27a');k.dots(f,C.wood,.05,.25);for(let y=.35;y<PAGE_D;y+=.42)k.key(`M-5 ${y} L0 ${y}`,.012,'#8a5238');
  const mat=rect(-4.6,Z(-.5),2.6,1.5);k.fill(mat,INK.sky);k.dots(mat,INK.blue,.05,.3);k.key(mat,.014);
  k.text('1970–71 SEASON',-2.55,Z(2.62),.4,INK.blue,{max:4.2});k.text('REST · HEAL · COME BACK',-2.55,Z(2.92),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitchPrint(k,0,5);chalk(k,`M.02 0 L.02 ${PAGE_D}`);chalk(k,ell(0,Z(0),1.0,1.0));
  k.text('NUMBER 14',3.2,Z(2.7),.36,INK.yellow,{max:3.2});k.text('PULL',.75,Z(2.95),.13,INK.white,{weight:900});},
 build:B=>{
  const bd=B.vfold(spec('h4-bdL',4.5,3,k=>{const p=rect(0,0,4.5,3);k.fill(p,'#e8dcc6');k.dots(p,INK.sky,.06,.12);
    const win=rect(1.2,.4,2.0,1.3);k.fill(win,'#6f7f9c');k.dots(win,INK.navy,.05,.3);for(let i=0;i<14;i++){const x=1.3+((i*37)%19)/19*1.8,y=.5+((i*23)%11)/11*1.0;k.key(`M${x} ${y} L${x-.04} ${y+.14}`,.012,INK.sky2);}
    k.key(win,.04,C.wood);k.key('M2.2 .4 L2.2 1.7 M1.2 1.05 L3.2 1.05',.025,C.wood);k.fill(rect(0,2.55,4.5,.45),C.wood);k.key('M0 2.55 L4.5 2.55',.02);}),
   spec('h4-bdR',4.5,3,k=>{sky(k,4.5,3);roofline(k,4.5,.85);crowd(k,4.5,1.2,2.6,[C.orange,C.white,C.ajax,C.sweY,C.orange,C.white],5);lightRig(k,1.3,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}),-3.05,1.22);
  const rainP=bd.add(rainCloud('h4-rain',1.2,.72),'L',2.2,1.75,{out:.03}),sunP=bd.add(S.sun(K('h4-sun'),.34),'L',2.9,1.5,{out:.02});
  const ban=bd.add(S.banner(K('h4-ban'),2.6,.4,'THE CRUYFF TURN',INK.pink),'R',1.1,1.15,{out:.02}),starsP=bd.add(S.stars(K('h4-stars'),2.4,.6,9),'R',.6,.55,{out:.03});
  // Left: resting the injury; a physio; the calendar pages turn until 30 October 1970.
  const benchP=B.stand(S.bench(K('h4-bench'),1.5,.55),-3.3,-.35,{layer:2});
  const physio=player(B,'h4-physio',-4.3,.35,1.66,{kit:'plain',shirt:'coach',hair:'cap',adult:true,skin:'#b27650',face:'smile',layer:2});
  const hurt=player(B,'h4-hurt',-2.8,.75,1.26,{kit:'ajax',hair:'messi',hairColor:BROWN,face:'shy'});
  const restB=hurt.body.add(S.bubble(K('h4-rest'),.52,.44,'breath'),.5,1.5,{z:-.02});
  const cal=B.stand(calendarBase('h4-cal',1.1,1.35),-1.3,-.9,{layer:1});
  cal.add(card('h4-cal4',.94,.66,'30 OCT','#fbf5e6',INK.navy,'1970 · BACK!'),0,.4,{z:.01});
  const pages=['WEEK 3','WEEK 2','WEEK 1','INJURED'].map((l,i)=>cal.flap(card(`h4-cal${i}`,.94,.66,l,i===3?INK.red:'#fbf5e6',i===3?INK.white:INK.navy,i===3?'1970–71':'REST'),0,1.08,{z:.02+i*.006}));
  // Right: back against PSV; a teammate has number 9; the shirt board and its lever.
  const sign=B.stand(card('h4-psv',1.3,.42,'AJAX · PSV',C.white,C.ajax,'30 OCTOBER 1970'),4.1,-1.55,{layer:1,tab:false});
  const nine=player(B,'h4-nine',4.1,-.8,1.2,{kit:'ajax',hair:'short',hairColor:'#c9a063',face:'smile',number:'9',layer:1,yaw:0});
  const back=player(B,'h4-back',2.7,-.35,1.3,{kit:'ajax',hair:'messi',hairColor:BROWN,face:'grin',layer:2});
  const chest=back.body.add(card('h4-chest',.26,.2,'14',C.ajax,C.white),0,.78,{z:.01});
  const frame=B.stand(spec('h4-frame',1.3,1.5,k=>{const b=rect(0,0,1.3,1.2);k.fill(b,INK.navy);k.dots(b,INK.blue,.04,.3);k.key(b,.02,C.wood);k.keyFill(rect(.2,1.2,.08,.3),C.wood);k.keyFill(rect(1.02,1.2,.08,.3),C.wood);}),1.15,1.95,{layer:3});
  frame.add(shirtSpec('h4-s14',.95,.9,'14',C.white,C.ajax,INK.navy),0,.48,{z:.01});
  const shirt9=frame.flap(shirtSpec('h4-s9',.97,.92,'9',C.white,C.ajax,INK.navy),0,1.39,{z:.02});
  const leverPost=B.stand(post('h4-post',.16,.95),.35,2.2,{layer:3});
  const lever=leverPost.arm(spec('h4-lever',.2,.9,k=>{const s=rect(.06,0,.08,.72);k.fill(s,C.cream);k.key(s,.01,'#9c8a66');k.fill(ell(.1,.78,.1,.1),C.orange);k.key(ell(.1,.78,.1,.1),.012);k.circle(.1,.03,.02,INK.gold);},{rim:.012}),0,.93,{z:.02});
  // 1974: back at his best, Cruyff (14) turns away from a Swedish defender.
  const cruyff=player(B,'h4-cruyff',3.7,.6,1.34,{kit:'ned',hair:'messi',hairColor:BROWN,legs:'kick',face:'grin',number:'14',layer:2});
  const olsson=player(B,'h4-olsson',4.5,.25,1.26,{kit:'swe',hair:'short',hairColor:'#d9b36a',legs:'wide',face:'open',layer:1});
  const ball=B.stand(S.ball(K('h4-ball'),.12),4.12,.78,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,T=b.narrated?Math.max(b.t,act>0?23.5:0):23.5;
   // Often injured or unwell: rain at the window; the bench, the physio.
   const rain=beat(T,2,3.4)*(1-beat(T,12.8,14.2));rainP.visible=rain>.02;rainP.dy=-.8*(1-rain);sunP.dy=-.9*(1-beat(T,13.4,15));
   benchP.s=beat(T,2.2,3);hurt.body.s=beat(T,2.6,3.5)*(1-beat(T,13.4,14.2));physio.body.s=beat(T,3.6,4.5);physio.armR.rot=.12+2.2*beat(T,41,41.6);
   physio.armL.rot=-.12-1.3*beat(T,7.4,8)+1.3*beat(T,11.8,12.4);restB.visible=T>8&&T<13.2;restB.dy=-.4+.4*beat(T,8,8.5);
   // The season calendar: injured, then weeks of rest, then 30 October 1970.
   cal.s=beat(T,6.4,7.2);pages.forEach((p,i)=>{const j=3-i,at=[8.2,9.6,11,12.4][j];p.flip=-2.8*beat(T,at,at+.6);});
   // He comes back against PSV; number 9 is taken.
   sign.s=beat(T,14,14.8)*(1-beat(T,31.6,32.4));back.body.s=beat(T,14.6,15.5)*(1-beat(T,31.6,32.4));nine.body.s=beat(T,17,17.8)*(1-beat(T,31.8,32.6));
   nine.body.yaw=Math.PI*beat(T,18.4,19.2)*(1-beat(T,21.8,22.6));nine.armR.rot=.12+1.8*beat(T,19.3,19.8)-1.8*beat(T,21.2,21.8);
   frame.s=beat(T,20.4,21.2);leverPost.s=beat(T,21.2,22);
   // Pull the lever: the shirt turns from 9 to 14 and he wears it.
   const turn=Math.max(beat(T,24.2,25.6),beat(act,0,.7));shirt9.flip=-2.85*turn;lever.rot=Math.PI+.55-1.1*turn;chest.scale=Math.max(beat(T,22.3,23),beat(act,.6,.9));
   const joy=Math.max(beat(T,25.6,26.2)*(1-beat(T,30.8,31.4)),beat(act,.75,1));back.armL.rot=-.12-2.4*joy;back.armR.rot=.12+2.4*joy;
   // Number 14 became famous.
   starsP.visible=T>28;starsP.dy=-.8+.8*beat(T,28,29.2);
   // 1974 World Cup: the Cruyff Turn against Sweden.
   cruyff.body.s=beat(T,32.2,33);olsson.body.s=beat(T,32.5,33.3);ball.s=cruyff.body.s;
   const p=kf(T,[[35,0],[36.4,.3],[37.8,.6],[39.4,1]]),P=turnPose(p);
   cruyff.body.x=P.x;cruyff.body.yaw=P.yaw;cruyff.leg!.rot=P.leg;cruyff.armL.rot=P.armL-2.2*beat(T,40.9,41.5);cruyff.armR.rot=P.armR+2.2*beat(T,40.9,41.5);
   ball.x=P.bx;ball.z=P.bz;ball.rot=-ball.x*5;olsson.body.x=P.ox;olsson.body.rot=P.orot;olsson.body.yaw=P.oyaw;olsson.armR.rot=.12+P.oarm;olsson.armL.rot=-.12-.5*P.oarm;
   ban.scale=beat(T,38.4,39.2);
   return b.narrated?kf(T,[[1.8,0],[2.6,-.65],[13.4,-.65],[14.2,.65],[40.4,.65],[41.2,0]]):(act>0?.65:0);
  };
 }};

/* ───────────── 5 · So close (final, 1974) ───────────── */
const finalPage:SpreadDef={id:'final',rest:21.5,
 left:k=>{pitchPrint(k,-5,0);chalk(k,`M-.02 0 L-.02 ${PAGE_D}`);chalk(k,ell(0,Z(0),1.0,1.0));chalk(k,`M-5 ${Z(-1.55)} L-2.3 ${Z(-1.55)} L-2.3 ${Z(1.35)} L-5 ${Z(1.35)}`);k.fill(ell(-3.45,Z(.75),.06,.04),INK.white);
  k.text('1974 WORLD CUP FINAL',-2.55,Z(2.62),.36,INK.yellow,{max:4.2});k.text('THE NETHERLANDS · WEST GERMANY',-2.55,Z(2.92),.15,INK.white,{weight:800,max:4.2});},
 right:k=>{pitchPrint(k,0,5);chalk(k,`M.02 0 L.02 ${PAGE_D}`);chalk(k,ell(0,Z(0),1.0,1.0));
  k.text('MORE THAN ONE RESULT',2.55,Z(2.66),.27,INK.pink,{max:4.3});k.text('brave, exciting football',2.55,Z(2.95),.14,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold(spec('fi-bdL',4.5,3,k=>{sky(k,4.5,3);roofline(k,4.5,.9);crowd(k,4.5,1.2,2.6,[C.white,'#2b2b33',C.white,C.orange,C.white,INK.yellow],1);lightRig(k,.9,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),INK.grass);}),
   spec('fi-bdR',4.5,3,k=>{sky(k,4.5,3);roofline(k,4.5,.85);crowd(k,4.5,1.2,2.6,NED_FANS,6);lightRig(k,1.2,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}),-3.05,1.22);
  const bunt=bd.add(S.bunting(K('fi-bunt'),3.6,.45,[C.orange,C.white,C.orange]),'R',.4,1.75,{out:.02}),starsP=bd.add(S.stars(K('fi-stars'),2.4,.6,9),'R',.6,.75,{out:.03});
  const rainP=bd.add(rainCloud('h5-rain',1.4,.8),'R',2.3,2.0,{out:.035});
  // Left: Cruyff is fouled in the first minute; Neeskens scores the penalty.
  B.stand(S.goal(K('fi-goal'),1.5,.8),-3.85,-1.2,{layer:1});
  const keeper=player(B,'fi-keep',-3.85,-.95,1.12,{kit:'plain',shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const taker=player(B,'fi-taker',-3.8,1.0,1.18,{kit:'ned',hair:'curly',hairColor:BROWN,legs:'kick',face:'grin'});
  const pen=B.stand(S.ball(K('fi-pen'),.12),-3.45,.75,{layer:3,tab:false});B.slot(-3.45,.75,-3.7,-.9);
  const cruyff=player(B,'h5-cruyff',-1.2,.55,1.24,{kit:'ned',hair:'messi',hairColor:BROWN,face:'grin',number:'14',legs:'run'});B.slot(-1.2,.7,-2.2,.7);
  const ger=[player(B,'fi-g1',-2.55,-.2,1.12,{kit:'ger',hair:'short',hairColor:'#c9a063',face:'grin',layer:2}),player(B,'fi-g2',-4.55,.45,1.12,{kit:'ger',hair:'bald',skin:'#f1b88f',face:'grin',layer:2})];
  const clock=B.stand(spec('fi-clock',.6,1.0,k=>{k.keyFill(rect(.27,.55,.06,.45),'#3a2d2a');k.fill(ell(.3,.3,.28,.28),C.white);k.key(ell(.3,.3,.28,.28),.02);for(let i=0;i<12;i++){const a=i*Math.PI/6;k.key(`M${.3+Math.sin(a)*.2} ${.3-Math.cos(a)*.2} L${.3+Math.sin(a)*.25} ${.3-Math.cos(a)*.25}`,.012);}k.fill(`M.3 .3 L.3 .05 A.25 .25 0 0 1 .33 .05 Z`,INK.red);}),-1.25,-1.45,{layer:1});
  const hand=clock.arm(spec('fi-hand',.04,.22,k=>{k.keyFill(rect(.012,0,.016,.22));},{rim:.006}),0,.7,{z:.015});
  const tag=clock.add(card('fi-tag',.5,.3,"1'",INK.red),.42,.62,{z:.02});
  const ref=player(B,'fi-ref',-2.6,1.55,1.5,{kit:'plain',shirt:'navy',hair:'bald',adult:true,skin:'#f1b88f',face:'open'});
  // Best player of the tournament.
  const plinth=B.stand(spec('h5-plinth',1.4,.36,k=>{const b=rect(0,0,1.4,.36);k.fill(b,INK.navy);k.dots(b,INK.blue,.035,.3);k.key(b,.014);k.text('BEST PLAYER',.7,.16,.12,INK.gold,{max:1.25});k.text('1974 WORLD CUP',.7,.3,.09,INK.white,{max:1.25,weight:800});}),-.85,2.05,{layer:3});
  const gold=plinth.add(S.goldenBall(K('h5-gold'),.16),0,.36,{z:.01});
  // Right: the score cards, the team, the fans.
  const board=B.stand(spec('fi-board',2.6,1.9,k=>{const b=rect(0,0,2.6,1.5);k.fill(b,INK.night);k.dots(b,INK.blue,.04,.35);k.key(b,.016,'#101a36');for(let i=0;i<11;i++)k.circle(.25+i*.21,.08,.02,INK.yellow);
    k.text('NETHERLANDS',.68,.98,.12,C.orange,{max:1.1});k.text('WEST GERMANY',1.92,.98,.12,C.white,{max:1.1});k.key('M1.3 .86 L1.3 1.04',.012,INK.grey);k.fill(rect(.2,1.12,2.2,.26),INK.yellow);k.text('1974 WORLD CUP FINAL',1.3,1.31,.15,INK.navy,{max:2.1});
    k.keyFill(rect(.35,1.5,.1,.4),INK.grey);k.keyFill(rect(2.15,1.5,.1,.4),INK.grey);}),2.5,-1.05,{layer:1});
  board.add(card('fi-c12',1.5,.62,'1 – 2','#3b3b44',C.white,'FULL TIME'),0,1.13,{z:.012});
  const c10=board.flap(card('fi-c10',1.5,.62,'1 – 0',C.orange,C.white),0,1.75,{z:.02}),c00=board.flap(card('fi-c00',1.5,.62,'KICK-OFF',INK.blue,C.white),0,1.75,{z:.028});
  const team=[player(B,'fi-n1',1.2,.95,1.14,{kit:'ned',hair:'short',skin:'#d99a6c',face:'shy',layer:2}),player(B,'fi-n2',2.55,1.3,1.16,{kit:'ned',hair:'curly',hairColor:BROWN,face:'shy'}),player(B,'fi-n3',3.9,.9,1.14,{kit:'ned',hair:'curly',skin:'#7f5138',face:'shy',layer:2})];
  const bubbles=[team[0].body.add(S.bubble(K('fi-b1'),.5,.42,'dots'),-.45,1.46,{z:-.02}),team[1].body.add(S.bubble(K('fi-b2'),.5,.42,'heart'),.42,1.5,{z:-.02}),team[2].body.add(S.bubble(K('fi-b3'),.5,.42,'dots'),.4,1.46,{z:-.02})];
  const fans=[player(B,'fi-f1',4.55,1.75,1.5,{kit:'ned',hair:'long',adult:true,skin:'#f1b88f',face:'smile'}),player(B,'fi-f2',.7,2.0,1.05,{kit:'ned',hair:'bun',skin:'#b27650',face:'smile'})];
  return (b:Beat)=>{const act=b.action,T0=b.narrated?b.t:21.5,T=act>0&&T0<21.5?21.5:T0;
   board.s=beat(T,1.8,2.8);keeper.body.s=beat(T,2.3,3.3);ger.forEach((g,i)=>{g.body.s=beat(T,2.6+i*.3,3.6+i*.3);});clock.s=beat(T,3.4,4.4);cruyff.body.s=beat(T,3,4);
   team.forEach((m,i)=>{m.body.s=beat(T,4.6+i*.35,5.6+i*.35);});fans.forEach((f,i)=>{f.body.s=beat(T,5.6+i*.4,6.6+i*.4);});
   // First minute: Cruyff runs at goal and is fouled; a penalty.
   const run=beat(T,8.2,9.4);cruyff.body.x=-1.2-1.0*run;cruyff.armL.rot=-.12-.6*wave(T,8.2,9.4,2);cruyff.armR.rot=.12+.6*wave(T,8.2,9.4,2);
   const foul=pulse(T,9.4,11.2);cruyff.body.rot=.55*foul;ger[0].armR.rot=.12+.9*pulse(T,9.2,10.4);
   hand.rot=Math.PI-.105*beat(T,8,8.8);tag.scale=beat(T,8.4,9);ref.body.s=beat(T,9.6,10.3);ref.armR.rot=.12+1.4*beat(T,10.3,10.8)-1.4*beat(T,12.2,12.8);
   taker.body.s=beat(T,10.6,11.4);pen.s=taker.body.s;const shot=beat(T,12.6,13.2);
   taker.leg!.rot=.7*beat(T,12,12.35)-1.9*beat(T,12.35,12.6)+1.2*beat(T,13,13.6);pen.x=lerp(-3.45,-3.7,shot);pen.z=lerp(.75,-.9,shot);pen.dy=.35*Math.sin(shot*Math.PI);pen.rot=-shot*8;
   const dive=beat(T,12.6,13.1);keeper.body.rot=.9*dive*(1-beat(T,15,15.8));keeper.body.dx=-.25*dive;keeper.armL.rot=-.12-2.2*dive;keeper.armR.rot=.12+2.2*dive;
   const joy=beat(T,13.3,13.9)-beat(T,14.6,15.2);taker.armL.rot=-.12-2.4*joy;taker.armR.rot=.12+2.4*joy;
   // West Germany come back and win 2–1.
   const back=beat(T,15,15.7)*(1-beat(T,20.6,21.2));ger.forEach((g,i)=>{g.armL.rot=-.12-2.5*back-.3*wave(T,15.7,20.4,1.7+i*.2);g.armR.rot+=2.5*back+.3*wave(T,15.7,20.4,1.6+i*.2);});
   // The score cards: kick-off → 1–0 → 1–2; shown again when Coach Bella says "flip".
   const f1=kf(T,[[13.3,0],[13.9,1],[22,1],[22.5,0],[23,0],[23.6,1]]),f2=kf(T,[[16.2,0],[16.8,1],[22,1],[22.5,0],[24.3,0],[24.9,1]]);
   c00.flip=-2.9*Math.max(b.narrated?f1:0,beat(act,.05,.42));c10.flip=-2.9*Math.max(b.narrated?f2:0,beat(act,.55,.95));
   // The defeat hurt the whole country: rain over the fans; heads down; they comfort each other.
   const rain=beat(T,18.3,19.4)*(1-beat(T,27.8,29));rainP.visible=rain>.02;rainP.dy=-.9*(1-rain);bunt.dy=-.3*beat(T,18.4,19.4)+.3*beat(T,28,29);
   bubbles.forEach((q,i)=>{const on=beat(T,19+i*.4,19.5+i*.4)*(1-beat(T,25.2,25.6));q.visible=on>.02;q.dy=-.45*(1-on);});
   // Best player of the tournament; fans everywhere loved the football.
   plinth.s=beat(T,26,26.8);gold.scale=beat(T,27,27.6);gold.dy=.12*pulse(T,27,27.8);cruyff.armL.rot+=-2.2*beat(T,28,28.6);
   starsP.visible=T>30.5;starsP.dy=-.8+.8*beat(T,30.5,31.6);
   fans.forEach((f,i)=>{const cheer=beat(T,31+i*.3,31.6+i*.3);f.armL.rot=-.12-2.4*cheer-.3*wave(T,31.6,35,1.4+i*.2);f.armR.rot=.12+2.4*cheer+.3*wave(T,31.6,35,1.5);});
   team.forEach((m,i)=>{const hug=beat(T,19.6,20.4)*(1-beat(T,33.2,33.8)),proud=beat(T,35.8+i*.3,36.5+i*.3);m.armL.rot=-.12-(i>0?1.4*hug:0)-2.4*proud;m.armR.rot=.12+(i<2?1.4*hug:0)+2.4*proud;});
   return b.narrated?kf(T,[[1.6,0],[7.8,0],[8.2,-.65],[14.6,-.65],[15.2,0],[16,.6],[25.6,.6],[26,-.5],[29.6,-.5],[30.4,.5],[35.2,.5],[35.8,0]]):(act>0?.4:0);
  };
 }};

/* ───────────── 6 · Making space for others (courts) ───────────── */
const courtHalf=(key:string,w:number,h:number,flip:boolean)=>spec(key,w,h,k=>k.at(flip?w:0,0,1,()=>{
 const t=rect(0,0,w,h);k.fill(t,C.orange);k.dots(t,INK.red,.04,.3);const g=rect(.1,.1,w-.1,h-.2);k.fill(g,C.turf);for(let y=.1;y<h-.1;y+=.3)k.dots(rect(.1,y,w-.1,.15),INK.navy,.04,.22);
 k.key(`M${w} .18 L.18 .18 L.18 ${h-.18} L${w} ${h-.18}`,.03,INK.white);k.key(`M.18 ${h/2} L${w} ${h/2}`,.03,INK.white);
 k.key(`M${w} ${h/2-.34} A.34 .34 0 0 0 ${w} ${h/2+.34}`,.03,INK.white);k.key(`M${w} .18 L${w-.55} .18 L${w-.55} .55 L${w} .55 M${w} ${h-.18} L${w-.55} ${h-.18} L${w-.55} ${h-.55} L${w} ${h-.55}`,.025,INK.white);
 k.key(t,.014);},flip));
const courtsPage:SpreadDef={id:'courts',rest:25,
 left:k=>{cobbles(k,-5,0,0,PAGE_D);const pave=rect(-5,Z(-.5),5,1.8);k.fill(pave,'#e6dcc4',.7);
  k.text('LOOK AFTER YOUR BODY',-2.55,Z(2.62),.34,INK.blue,{max:4.3});k.text('JOHAN CRUYFF FOUNDATION · 1997',-2.55,Z(2.92),.15,INK.navy,{weight:800,max:4.3});},
 right:k=>{cobbles(k,0,5,0,PAGE_D);const lot=rect(1.3,Z(-.4),2.6,2.3);k.fill(lot,INK.sand);k.dots(lot,INK.orange,.05,.25);k.key(lot,.012);
  footprints(k,.35,Z(2.1),1.3,Z(1.4),5);footprints(k,4.7,Z(2.1),3.9,Z(1.3),5);
  k.text('SPACE FOR EVERY CHILD',2.6,Z(2.72),.28,INK.pink,{max:4.4});},
 build:B=>{
  const bd=B.vfold(spec('h6-bdL',4.5,3,k=>{sky(k,4.5,3);housePanel(k,4.5,3,2.7,5);k.fill(rect(0,2.7,4.5,.3),INK.stone);k.key('M0 2.7 L4.5 2.7',.014);}),
   spec('co-bdR',4.5,3,k=>{sky(k,4.5,3);treeBlob(k,4.1,2.2,.35);housePanel(k,4.5,3,2.7,3);k.fill(rect(0,2.7,4.5,.3),INK.stone);k.key('M0 2.7 L4.5 2.7',.014);}),-3.05,1.22);
  const heartBig=bd.add(heartSpec('h6-heart',.7),'L',3.3,1.9,{out:.03});
  const fBan=bd.add(S.banner(K('h6-ban'),2.8,.4,'JOHAN CRUYFF FOUNDATION',INK.pink),'L',1.75,.5,{out:.03});
  const sunP=bd.add(S.sun(K('co-sun'),.36),'R',3.3,1.9,{out:.015}),cloud=bd.add(S.cloud(K('co-cloud'),1.0,.45),'R',1.3,2.2);
  const starP=bd.add(bigStar('h6-star',.34),'R',2.0,1.75,{out:.03});
  // Left: the coach, the hospital, giving up smoking, the foundation's children.
  const hosp=B.stand(hospital('h6-hosp',1.7,1.7),-3.7,-1.35,{layer:1});
  const cal=B.stand(card('h6-feb',1.3,.46,'FEBRUARY 1991',INK.navy,INK.white),-2.1,-1.35,{layer:1,tab:false});
  const coach=player(B,'h6-coach',-2.2,.35,1.66,{kit:'suit',hair:'short',hairColor:'#7a6a5a',adult:true,face:'smile',layer:2});
  const pack=B.stand(cigPack('h6-pack',.26,.36),-1.6,.75,{layer:3,tab:false});B.slot(-1.6,.8,-.75,.8);
  const binP=B.stand(bin('h6-bin',.4,.5),-.6,.75,{layer:3});
  const noSmoke=B.stand(poster('h6-poster',1.1,1.1,'NO SMOKING','a healthy heart',INK.blue),-.75,-.45,{layer:2});
  const kidsL=[player(B,'h6-k4',-4.2,1.2,1.0,{kit:'plain',shirt:'bib',hair:'curly',skin:'#7f5138',face:'smile'}),player(B,'h6-k5',-3.35,1.55,.98,{kit:'plain',shirt:'fan',hair:'bun',skin:'#f1b88f',face:'smile'}),player(B,'h6-k6',-2.5,1.7,1.0,{kit:'plain',shirt:'casual',hair:'short',skin:'#d99a6c',face:'smile'})];
  const hearts=kidsL.map((c,i)=>c.body.add(S.bubble(K(`h6-kh${i}`),.44,.38,'heart'),.35,1.2,{z:-.02}));
  // Right: a neighbourhood, and the court that unfolds between the houses.
  const block=B.stand(spec('co-block',2.0,1.25,k=>{const b=rect(0,.1,2.0,1.15);k.fill(b,'#e7b77a');k.dots(b,INK.orange,.04,.15);k.key(b,.014);k.fill(rect(-.04,0,2.08,.12),C.brickD);k.key(rect(-.04,0,2.08,.12),.01);
    for(let r=0;r<3;r++)for(let c=0;c<5;c++){const x=.14+c*.37,y=.25+r*.3,wn=rect(x,y,.22,.18);k.fill(wn,INK.blue);k.dots(wn,INK.sky,.03,.5);k.key(wn,.01);k.fill(rect(x-.03,y+.18,.28,.03),(r+c)%2?INK.pink:C.white);}}),2.6,-1.55,{layer:1});
  const houseA=B.stand(houseRow('co-hA',.95,1.9,[.95],0),.75,-.75,{layer:1}),houseB=B.stand(houseRow('co-hB',.95,1.8,[.95],4),4.45,-.55,{layer:1});
  const fence=B.stand(S.fenceStrip(K('co-fence'),2.4,.36,C.white),2.6,-.5,{layer:1,tab:false});
  const halfL=B.flat(courtHalf('co-halfL',1.25,2.2,false),1.35,1.85,{edge:'left',hinge:-1.45}),halfR=B.flat(courtHalf('co-halfR',1.25,2.2,true),3.85,1.85,{edge:'right',hinge:1.45});
  const goalB=B.stand(S.goal(K('co-goalB'),.8,.44),2.6,-.28,{layer:2,tab:false});
  const signP=B.stand(S.sign(K('co-sign'),1.0,.85,'CRUYFF COURT'),4.45,.9,{layer:2});
  const count=B.stand(card('h6-count',1.5,.52,'200+ COURTS',INK.yellow,INK.navy,'22 COUNTRIES'),.75,.55,{layer:2,tab:false});
  const lampP=B.stand(S.lamp(K('co-lamp'),.28,1.15),4.6,2.05,{layer:3}),halo=lampP.add(glow('h6-glow',.3),0,.78,{z:-.01,anchor:'center'});
  const treeP=B.stand(S.tree(K('co-tree'),.75,1.0,'round'),.65,2.05,{layer:3});
  const k1=player(B,'co-k1',1.85,1.3,1.0,{kit:'plain',shirt:'casual',hair:'short',skin:'#7f5138',legs:'kick',face:'grin'});
  const k2=player(B,'co-k2',3.3,.25,1.0,{kit:'plain',shirt:'fan',hair:'long',skin:'#f1b88f',legs:'run',face:'open',layer:2});B.slot(3.3,.4,3.55,1.35);
  const k3=player(B,'co-k3',2.35,.2,1.0,{kit:'plain',shirt:'bib',hair:'bun',skin:'#d99a6c',face:'smile',layer:2});
  const cball=B.stand(S.ball(K('co-ball'),.11),2.15,1.45,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,T=b.narrated?Math.max(b.t,act>0?25:0):25;
   cloud.dx=.9*beat(T,0,45)-.3;
   // A smoker since his teens: the coach and a cigarette packet.
   coach.body.s=beat(T,2.2,3.1)*(1-beat(T,37.2,39.4));pack.s=beat(T,3,3.6);
   // February 1991: a heart attack and heart surgery.
   cal.s=beat(T,6,6.8);hosp.s=beat(T,6.6,7.6);heartBig.scale=beat(T,7.4,8.2)*(1+.08*wave(T,8.2,11.6,1.2));
   // He gives up smoking: the packet slides into the bin; a health poster.
   binP.s=beat(T,11.4,12);const toss=beat(T,12.4,13.6);pack.x=lerp(-1.6,-.62,toss);pack.dy=.4*Math.sin(toss*Math.PI);pack.s=beat(T,3,3.6)*(1-beat(T,13.5,13.9));
   coach.armR.rot=.12+1.4*pulse(T,12.2,13.6)+1.6*beat(T,14.4,15)-1.6*beat(T,16.4,17);noSmoke.s=beat(T,13.8,14.7);
   // 1997: the Johan Cruyff Foundation, for children.
   fBan.scale=beat(T,16.4,17.2);kidsL.forEach((c,i)=>{c.body.s=beat(T,18.4+i*.4,19.3+i*.4);const up=beat(T,21.2+i*.3,21.8+i*.3);c.armL.rot=-.12-2.2*up;c.armR.rot=.12+.3*wave(T,21.8,24.6,1.5+i*.2);});
   hearts.forEach((h,i)=>{h.visible=T>22.2+i*.4&&T<26;h.dy=-.4+.4*beat(T,22.2+i*.4,22.7+i*.4);});coach.armL.rot=-.12-1.5*beat(T,19.4,20)+1.5*beat(T,24.4,25);
   // The neighbourhood rises.
   block.s=beat(T,16,16.8);houseA.s=beat(T,16.5,17.3);houseB.s=beat(T,17,17.8);treeP.s=beat(T,17.4,18.2);fence.s=beat(T,23.6,24.4);lampP.s=beat(T,24,24.8);
   // Unfold the court.
   const open=Math.max(beat(T,25.6,27.4),beat(act,0,.5));halfL.s=halfR.s=.03+.97*open;
   goalB.s=Math.max(beat(T,27,27.8),beat(act,.42,.6));signP.s=Math.max(beat(T,27.6,28.4),beat(act,.5,.7));
   // More than 200 courts in 22 countries: children of all backgrounds play.
   count.s=beat(T,29.4,30.4);
   [k1,k2,k3].forEach((c,i)=>{c.body.s=Math.max(beat(T,31+i*.4,31.9+i*.4),beat(act,.62+i*.1,.8+i*.1));});cball.s=k1.body.s;
   const run=beat(T,32.4,33.8);k2.body.x=lerp(3.3,3.55,run);k2.body.z=lerp(.25,1.25,run);k2.armL.rot=-.12-.7*wave(T,32.4,33.8,2)-2.4*beat(T,42,42.6);k2.armR.rot=.12+.7*wave(T,32.4,33.8,2)+2.4*beat(T,42,42.6);
   k1.leg!.rot=.6*beat(T,34,34.25)-1.7*beat(T,34.25,34.45)+1.1*beat(T,34.9,35.4);const pass=beat(T,34.4,35.6);cball.x=lerp(2.15,3.3,pass);cball.z=lerp(1.45,1.42,pass);cball.rot=-cball.x*5;
   k3.armR.rot=.12+2.0*beat(T,42.2,42.8);
   // 2016: the coach's figure folds gently away; a star rises over the court and the lamp glows.
   starP.visible=T>37;starP.dy=-.9+.9*beat(T,37.4,39.4);halo.scale=beat(T,38.6,39.6);sunP.dy=.5*beat(T,36.5,39);
   return b.narrated?kf(T,[[2,0],[2.6,-.65],[15.4,-.65],[16,0],[25,0],[25.4,.65],[36,.65],[36.6,0]]):(act>0?.65:0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={ajax:ajaxPage,total:familyPage,cups:cupsPage,turn:turnPage,final:finalPage,courts:courtsPage};
