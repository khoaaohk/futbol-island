/**
 * The six Maldini pop-up spreads: the hardships of Paolo Maldini's career told in riso paper with
 * narration-timed mechanics. Milan players wear an original red-and-black striped kit painted over the
 * shared brad-jointed character (no crests or logos); Italy wears plain blue; Liverpool plain red.
 * Hardship is shown gently and symbolically: grey clouds and rain, an empty plinth, a photo frame,
 * a teammate's hand on a shoulder. Each pose(beat) is a pure function of the Coach Bella narration
 * time and the reader's action, timed to public/voice/books/maldini/narration.json.
 */
import {INK,type Kit,type PlateSpec,type PersonOpts,type Hair,poly,rect,ell,SKIN,PERSON_ASPECT,JOINTS,personSpec,armSpec,legSpec} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,clamp01,PAGE_D,PERSON_SCALE} from '../popupEngine';

const D2=PAGE_D/2;
const Z=(z:number)=>z+D2;
const MR='#d8323d',MB='#28232c',SILVER='#d3dade',AZ='#2f6fc0',ITG='#3a9a5b',LR='#c8202e',STORM='#8e97a8',STORM2='#6f7a8e';
const spec=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key,w,h,paint,...extra});

/* ───────────── kits: original stripes painted over the shared paper character ───────────── */
type KitDef={shirt:string;stripe?:string;shorts:string;sock:string};
const MILAN:KitDef={shirt:MR,stripe:MB,shorts:INK.white,sock:MB};
const ITALY:KitDef={shirt:AZ,shorts:INK.white,sock:AZ};
const LIVERPOOL:KitDef={shirt:LR,shorts:LR,sock:LR};
const TORSO_KID='M114 172 Q146 156 184 170 L196 208 L200 304 Q156 320 106 304 L108 220 Z';
const TORSO_AD='M108 168 Q152 150 196 168 L206 212 L204 306 Q154 322 102 306 L100 214 Z';
const SHORTS='M104 298 Q153 314 202 300 L206 340 L166 346 L154 324 L144 346 L102 338 Z';
type Hold='suitcase'|'ball'|'glove'|'none';
type Face=PersonOpts['face'];
type KP={kit:KitDef;hair?:Hair;hairColor?:string;skin?:string;number?:string;face?:Face;alt?:Face;legs?:'stand'|'kick'|'wide';adult?:boolean;armband?:boolean;holdL?:Hold;holdR?:Hold;layer?:number;yaw?:number;tab?:boolean;beard?:boolean};
function kitBody(k:Kit,kit:KitDef,o:KP){
 k.at(0,0,k.h/512,()=>{
  k.fill('M100 420 L134 424 L128 456 L98 452 Z',kit.sock);if(o.legs!=='kick')k.fill('M176 424 L204 420 L208 452 L180 456 Z',kit.sock);
  k.fill(SHORTS,kit.shorts);k.dots(SHORTS,INK.navy,7,.12);
  const torso=o.adult?TORSO_AD:TORSO_KID;k.fill(torso,kit.shirt);
  if(kit.stripe)k.hatch(torso,kit.stripe,34,Math.PI/2,16);else k.dots(torso,INK.navy,7,.14);
  if(o.number){k.text(o.number,153,279,50,INK.navy,{font:'Georgia,serif'});k.text(o.number,150,276,50,INK.white,{font:'Georgia,serif'});}
 });
}
function kitSleeve(k:Kit,kit:KitDef,band:boolean){
 k.at(k.w/2,.012,(k.h-.012)/170,()=>{const sl='M-18 4 Q0 -8 18 4 L17 62 L-17 62 Z';k.fill(sl,kit.shirt);if(kit.stripe)k.hatch(sl,kit.stripe,24,Math.PI/2,11);
  if(band){const a=rect(-18,38,36,14);k.fill(a,INK.yellow);k.key(a,1.4);}
  k.circle(0,6,5.5,INK.gold);k.key(ell(0,6,5.5,5.5),1);});
}
function kitLeg(k:Kit,kit:KitDef){k.at(k.w/2,.012,(k.h-.012)/170,()=>{k.fill('M-22 -4 L22 -4 L20 26 L-20 26 Z',kit.shorts);k.fill('M-13 100 L14 100 L14 136 L-13 136 Z',kit.sock);k.circle(0,6,5.5,INK.gold);k.key(ell(0,6,5.5,5.5),1);});}
type KPerson=Person&{alt?:Part};
/** A brad-jointed paper player in a painted kit (same joints and scale as B.person). `alt` adds a hidden head overlay with another face. */
function kp(B:Builder,key:string,x:number,z:number,h:number,o:KP):KPerson{
 const H=h*PERSON_SCALE,po:PersonOpts={shirt:'bib',skin:o.skin,hair:o.hair,hairColor:o.hairColor,face:o.face,legs:o.legs,adult:o.adult,beard:o.beard};
 const base=personSpec(key,H,po);
 const body=B.stand({...base,paint:k=>{base.paint(k);kitBody(k,o.kit,o);}},x,z,{layer:o.layer??3,yaw:o.yaw,tab:o.tab});
 const w=H*PERSON_ASPECT,jx=(j:number[])=>(j[0]/320-.5)*w,jy=(j:number[])=>H*(1-j[1]/512);
 const arm=(side:'L'|'R',hold:Hold)=>{const a=armSpec(`${key}-arm${side}`,H,{shirt:'bib',skin:o.skin,hold,adult:o.adult});const j=side==='L'?JOINTS.shoulderL:JOINTS.shoulderR;
  return body.arm({...a,paint:k=>{a.paint(k);kitSleeve(k,o.kit,side==='R'&&!!o.armband);}},jx(j),jy(j));};
 const armL=arm('L',o.holdL??'none'),armR=arm('R',o.holdR??'none');armL.rot=-.12;armR.rot=.12;
 let leg:Part|undefined;
 if(o.legs==='kick'){const l=legSpec(`${key}-leg`,H,{shirt:'bib',skin:o.skin});leg=body.arm({...l,paint:k=>{l.paint(k);kitLeg(k,o.kit);}},jx(JOINTS.hipR),jy(JOINTS.hipR),{z:-.006});}
 let alt:Part|undefined;if(o.alt){alt=body.add(personSpec(`${key}-alt`,H,{...po,face:o.alt,headOnly:true}),0,0,{z:.004});alt.visible=false;}
 return {body,armL,armR,leg,h:H,alt};
}
const PAOLO={hair:'long' as Hair,hairColor:'#4a3528',skin:SKIN[0],number:'3'};

/* ───────────── shared prints ───────────── */
function pitch(k:Kit,x0:number,x1:number,night=false){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,night?'#3f7f5a':INK.grass,night?.9:.72);
 for(let i=0;i<8;i++){if(i%2)k.dots(rect(x0,i*PAGE_D/8,x1-x0,PAGE_D/8),night?INK.navy:INK.leaf,.055,night?.35:.3);}k.dots(p,night?INK.navy:INK.leaf,.08,.12);}
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function daySky(k:Kit,w:number,h:number,tone=INK.sky){const p=rect(0,0,w,h);k.fill(p,INK.sky2);k.dots(p,tone,.055,(x,y)=>.75-y/h*.75);}
function greySky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,'#c9ccd2');k.dots(p,STORM2,.055,(x,y)=>.6-y/h*.5);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
const MILAN_FANS=[MR,MB,INK.white,MR,MB,MR,INK.white];
const ITALY_FANS=[AZ,INK.white,AZ,ITG,INK.white,MR,AZ];
const LIV_FANS=[LR,INK.white,LR,INK.yellow,LR,INK.white];
function stripedPanel(k:Kit,d:string,w=.14){k.fill(d,MR);k.hatch(d,MB,w*2,Math.PI/2,w);}

/* ───────────── plates ───────────── */
const SHIRT_PATH=(x:number,y:number,w:number,h:number)=>poly([[.34,0],[.5,.1],[.66,0],[.86,.08],[1,.34],[.82,.44],[.79,.34],[.79,1],[.21,1],[.21,.34],[.18,.44],[0,.34],[.14,.08]].map(([u,v])=>[x+u*w,y+v*h]));
function paintShirt(k:Kit,x:number,y:number,w:number,h:number,kit:KitDef,num=''){const p=SHIRT_PATH(x,y,w,h);k.fill(p,kit.shirt);if(kit.stripe)k.hatch(p,kit.stripe,w*.2,Math.PI/2,w*.1);else k.dots(p,INK.navy,.03,.2);
 k.key(p,Math.max(.008,w*.02));k.key(`M${x+.34*w} ${y} Q${x+.5*w} ${y+.16*h} ${x+.66*w} ${y}`,Math.max(.008,w*.025),INK.white);
 if(num){k.text(num,x+w*.5+w*.02,y+h*.8+w*.02,h*.46,INK.navy,{font:'Georgia,serif'});k.text(num,x+w*.5,y+h*.8,h*.46,INK.white,{font:'Georgia,serif'});}}
/** A hanging shirt with a clothes peg and a name tag. */
const shirtTag=(key:string,w:number,kit:KitDef,num:string,tag:string)=>spec(key,w,w*1.32,k=>{const h=w*1.05;paintShirt(k,0,.06,w,h,kit,num);
 k.fill(rect(w*.44,0,w*.12,.12),INK.wood);k.key(rect(w*.44,0,w*.12,.12),.008);
 const t=rect(w*.12,h+.08,w*.76,w*.2);k.fill(t,INK.white);k.key(t,.01);k.text(tag,w/2,h+.08+w*.16,w*.13,INK.navy,{max:w*.68});},{rim:.022});
const tram=(key:string)=>spec(key,1.3,.72,k=>{const b=rect(0,.18,1.3,.44);k.fill(b,INK.orange);k.dots(b,INK.red,.035,.3);k.fill(rect(0,.4,1.3,.07),INK.white);k.key(b,.014);
 for(let i=0;i<5;i++){const wn=rect(.08+i*.24,.23,.17,.14);k.fill(wn,INK.sky);k.dots(wn,INK.blue,.03,.5);k.key(wn,.01);}
 k.fill(rect(.06,.12,1.18,.07),INK.grey);k.key(rect(.06,.12,1.18,.07),.01);k.key('M.55 .12 L.7 .02 L.85 .12 M.6 .02 L.8 .02',.012);
 for(const x of [.2,.4,.9,1.1])k.keyFill(ell(x,.63,.06,.06));});
const stadium=(key:string,w:number,h:number)=>spec(key,w,h,k=>{
 for(const x of [.06,w-.4]){const t=rect(x,.22,.34,h-.22);k.fill(t,INK.stone);k.hatch(t,'#8d8574',.09,.5,.018);k.key(t,.014);}
 const band=rect(.3,.4,w-.6,.55);k.fill(band,'#2d3f73');for(let r=0;r<3;r++)for(let i=0;i<Math.round((w-.7)/.12);i++){k.circle(.38+i*.12+(r%2)*.05,.5+r*.15,.045,MILAN_FANS[(i*3+r)%MILAN_FANS.length]);}
 const roof=poly([[.2,.26],[w-.2,.26],[w-.26,.42],[.26,.42]]);k.fill(roof,MR);k.hatch(roof,MB,.14,Math.PI/2,.06);k.key(roof,.014);
 const fac=`M.3 ${h} L.3 .95 L${w-.3} .95 L${w-.3} ${h} Z`;k.fill(fac,INK.stone);k.dots(fac,INK.orange,.04,.14);k.key(fac,.014);
 for(let i=0;i<9;i++){const x=.42+i*(w-.84)/8;if(Math.abs(x-w/2)<.62)continue;k.fill(`M${x-.08} ${h-.1} L${x-.08} 1.3 Q${x} 1.18 ${x+.08} 1.3 L${x+.08} ${h-.1} Z`,INK.navy);}
 const cx=w/2,arch=`M${cx-.5} ${h} L${cx-.5} 1.32 Q${cx-.38} .96 ${cx} .9 Q${cx+.38} .96 ${cx+.5} 1.32 L${cx+.5} ${h} Z`;k.fill(arch,'#2d3f73');k.hatch(arch,MR,.12,Math.PI/2,.055);
 k.fill(rect(cx-.5,1.62,1,h-1.62),INK.grass);k.dots(rect(cx-.5,1.62,1,h-1.62),INK.leaf,.04,.4);chalk(k,`M${cx-.5} 1.64 L${cx+.5} 1.64`,.016);
 k.key(arch,.016);k.fill(rect(.3,.9,w-.6,.06),MR);});
const gate=(key:string,right:boolean)=>spec(key,.5,1.2,k=>{k.at(right?.5:0,0,1,()=>{const g='M0 1.2 L0 .42 Q.12 .06 .5 0 L.5 1.2 Z';k.fill(g,MR);k.dots(g,MB,.03,.35);
 for(let i=1;i<6;i++)k.key(`M${i*.085} ${1.18} L${i*.085} ${.45-i*.06}`,.018);k.key('M0 .8 L.5 .8 M0 .5 L.5 .5',.014);k.key(g,.016);k.circle(.44,.72,.03,INK.gold);},right);},{rim:.016});
const cup=(key:string,w:number,h:number,year='')=>spec(key,w,h,k=>{const cx=w/2,bh=year?h*.78:h*.84;
 for(const s of [-1,1]){const hd=`M${cx+s*w*.26} ${bh*.12} Q${cx+s*w*.56} ${bh*.02} ${cx+s*w*.47} ${bh*.34} Q${cx+s*w*.4} ${bh*.52} ${cx+s*w*.16} ${bh*.5}`;k.key(hd,w*.1,SILVER);k.key(hd,w*.018);}
 const bowl=`M${cx-w*.3} ${bh*.06} L${cx+w*.3} ${bh*.06} Q${cx+w*.3} ${bh*.55} ${cx} ${bh*.62} Q${cx-w*.3} ${bh*.55} ${cx-w*.3} ${bh*.06} Z`;k.fill(bowl,SILVER);k.dots(bowl,'#7d8a96',.025,(x)=>.12+(x-cx)/w*1.2);k.key(bowl,.012);
 k.fill(ell(cx-w*.13,bh*.2,w*.05,bh*.08),INK.white);
 const stem=poly([[cx-w*.05,bh*.6],[cx+w*.05,bh*.6],[cx+w*.12,bh*.86],[cx-w*.12,bh*.86]]);k.fill(stem,SILVER);k.key(stem,.01);
 const base=poly([[cx-w*.28,bh*.86],[cx+w*.28,bh*.86],[cx+w*.32,bh],[cx-w*.32,bh]]);k.fill(base,SILVER);k.key(base,.01);
 if(year){const t=rect(cx-w*.42,bh+.01,w*.84,h-bh-.01);k.fill(t,INK.navy);k.key(t,.01);k.text(year,cx,h-(h-bh)*.24,(h-bh)*.72,INK.yellow,{max:w*.76});}});
const card=(key:string,w:number,h:number,lines:string[],bg=INK.white,ink=INK.navy)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,bg);k.dots(b,INK.navy,.03,.14);k.key(b,.013);
 const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,n===1?h*.68:h*(.45+i*.36),n===1?h*.46:h*.3,ink,{max:w*.86}));},{rim:.018});
/** A card with one big headline and a smaller line underneath. */
const yearCard=(key:string,w:number,h:number,big:string,small:string,bg=INK.white,ink=INK.navy)=>spec(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,bg);k.dots(b,INK.navy,.03,.14);k.key(b,.013);
 k.text(big,w/2,h*.52,h*.36,ink,{max:w*.9});k.text(small,w/2,h*.84,h*.22,MR,{max:w*.94,weight:800});},{rim:.018});
const cabinet=(key:string)=>spec(key,3.4,2.3,k=>{const b=rect(0,0,3.4,2.3);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.04,.1,.008);k.key(b,.016);
 const back=rect(.1,.38,3.2,1.84);k.fill(back,INK.night);k.dots(back,INK.blue,.045,.4);k.key(back,.012);
 k.text('FIVE TIMES',1.7,.27,.2,INK.yellow);
 for(let i=0;i<5;i++){const x=.34+i*.68;k.key(`M${x} 1.14 L${x} 2.12`,.05,'#3f3424');k.key(`M${x} 1.14 L${x} 2.12`,.022,'#15100a');}
 const sh=rect(.06,1,3.28,.09);k.fill(sh,'#cf9b62');k.key(sh,.012);const fl=rect(.06,2.2,3.28,.1);k.fill(fl,'#cf9b62');k.key(fl,.012);
 for(let i=0;i<4;i++)k.key(`M${.4+i*.8} .5 L${.2+i*.8} .9`,.012,'#ffffff55');});
const tribune=(key:string)=>spec(key,3.4,1.45,k=>{const seats=poly([[.1,1.45],[.1,.5],[3.3,.5],[3.3,1.45]]);k.fill(seats,'#2d3f73');
 for(let r=0;r<5;r++)for(let i=0;i<24;i++){const x=.2+i*.13+(r%2)*.05,y=.62+r*.16;k.circle(x,y,.045,MILAN_FANS[(i*5+r*2)%MILAN_FANS.length]);k.fill(rect(x-.05,y+.03,.1,.07),MILAN_FANS[(i*5+r*2)%MILAN_FANS.length]);}
 const roof=poly([[0,.22],[3.4,.22],[3.3,.44],[.1,.44]]);stripedPanel(k,roof,.12);k.key(roof,.014);for(let i=0;i<5;i++){const x=.2+i*.75;k.keyFill(rect(x,.44,.05,1.01),'#1a2447');}
 k.key('M.2 .22 L1.7 0 L3.2 .22',.02,INK.grey);k.fill(rect(.1,1.3,3.2,.15),INK.stone);k.key(seats,.014);});
const lockers=(key:string)=>spec(key,1.9,1.7,k=>{for(let i=0;i<3;i++){const x=.05+i*.6,b=rect(x,.05,.58,1.62);k.fill(b,'#7fa3b9');k.dots(b,INK.navy,.035,.2);k.key(b,.014);
  if(i!==1){for(let j=0;j<4;j++)k.key(`M${x+.14} ${.2+j*.06} L${x+.44} ${.2+j*.06}`,.012);k.circle(x+.48,.9,.025,INK.grey);}}
 const inner=rect(.67,.12,.56,1.5);k.fill(inner,'#1a2447');k.dots(inner,INK.blue,.035,.3);k.key('M.72 .3 L1.18 .3',.02,INK.grey);paintShirt(k,.72,.32,.46,.52,MILAN,'3');});
const lockerDoor=(key:string)=>spec(key,.56,1.5,k=>{const b=rect(0,0,.56,1.5);k.fill(b,'#8fb1c6');k.dots(b,INK.navy,.035,.2);k.key(b,.014);for(let j=0;j<4;j++)k.key(`M.12 ${.14+j*.06} L.44 ${.14+j*.06}`,.012);
 const plate=rect(.14,.5,.28,.2);k.fill(plate,INK.white);k.key(plate,.01);k.text('3',.28,.66,.16,MR,{font:'Georgia,serif'});},{rim:.014});
const padlock=(key:string)=>spec(key,.2,.26,k=>{k.key('M.05 .12 L.05 .07 Q.1 -.0 .15 .07 L.15 .12',.03,INK.grey);const b=rect(.01,.11,.18,.15);k.fill(b,INK.gold);k.key(b,.01);k.keyFill(ell(.1,.17,.02,.025));},{rim:.012});
const hand=(key:string,len:number,wd:number)=>spec(key,wd,len,k=>{const p=poly([[wd*.2,0],[wd*.8,0],[wd*.6,len],[wd*.4,len]]);k.fill(p,INK.navy);k.circle(wd/2,.012,wd*.5,INK.gold);},{rim:.008});
const pole=(key:string,h:number)=>spec(key,.16,h,k=>{const p=rect(.055,.08,.05,h-.08);k.fill(p,INK.white);k.key(p,.01);k.circle(.08,.07,.06,INK.gold);k.key(ell(.08,.07,.06,.06),.01);k.key(`M.13 .1 L.13 ${h-.1}`,.008,INK.navy);},{rim:.016});
const moon=(key:string,r:number)=>spec(key,r*2,r*2,k=>{const m=`M${r*1.3} ${r*.1} A${r*.9} ${r*.9} 0 1 0 ${r*1.3} ${r*1.9} A${r*.72} ${r*.72} 0 1 1 ${r*1.3} ${r*.1} Z`;k.fill(m,INK.yellow);k.dots(m,INK.orange,.03,.3);k.key(m,.01);});
/** A grey paper storm cloud: overlapping puffs with one outer keyline. */
const stormCloud=(key:string,w:number,h:number,tone=STORM)=>spec(key,w,h,k=>{const E=([[.24,.62,.22,.3],[.44,.42,.24,.36],[.68,.48,.22,.32],[.84,.68,.15,.24],[.52,.74,.42,.22]] as const).map(([x,y,rx,ry])=>ell(x*w,y*h,rx*w,ry*h));
 for(const e of E)k.key(e,.05);for(const e of E)k.fill(e,tone);for(const e of E)k.dots(e,INK.navy,.035,.28);k.key(`M${w*.2} ${h*.86} Q${w*.5} ${h*.96} ${w*.82} ${h*.86}`,.012,STORM2);});
/** Blue rain streaks hanging under a cloud. */
const rain=(key:string,w:number,h:number)=>spec(key,w,h,k=>{for(let i=0;i<7;i++){const x=w*(.08+i*.14),y=((i*37)%5)/5*h*.4;k.key(`M${x} ${y} L${x-.05} ${y+h*.45}`,.035,INK.sky);k.key(`M${x} ${y} L${x-.05} ${y+h*.45}`,.01,INK.blue);}},{rim:.012,grain:.5});
/** A wooden coat stand with a crossbar for a shirt. */
const hanger=(key:string)=>spec(key,1.4,2.3,k=>{const p=rect(.66,.18,.08,2.02);k.fill(p,INK.wood);k.hatch(p,'#8a5238',.03,1.2,.01);k.key(p,.012);
 const bar=rect(.12,.14,1.16,.08);k.fill(bar,INK.wood);k.key(bar,.012);k.circle(.7,.1,.06,INK.gold);k.key(ell(.7,.1,.06,.06),.01);
 const foot=poly([[.3,2.3],[1.1,2.3],[.8,2.16],[.6,2.16]]);k.fill(foot,INK.brown);k.key(foot,.012);});
/** A tall paper storyboard frame with two portraits (no likenesses, just paper people). */
const photoFrame=(key:string)=>spec(key,1.6,1.3,k=>{k.key('M.5 1.02 L.36 1.3 M1.1 1.02 L1.24 1.3',.05,INK.brown);const f=rect(0,0,1.6,1.06);k.fill(f,INK.gold);k.hatch(f,INK.orange,.04,.7,.01);k.key(f,.016);
 const p=rect(.1,.1,1.4,.86);k.fill(p,INK.sky2);k.dots(p,INK.sky,.035,.4);k.key(p,.012);
 for(const [cx,hair,shirt] of [[.5,INK.grey,MR],[1.1,'#6b4a36',INK.pink]] as const){const bd=`M${cx-.24} .96 Q${cx-.22} .62 ${cx} .6 Q${cx+.22} .62 ${cx+.24} .96 Z`;k.fill(bd,shirt);k.key(bd,.012);
  k.fill(ell(cx,.44,.13,.15),SKIN[0]);k.key(ell(cx,.44,.13,.15),.012);k.fill(`M${cx-.14} .42 Q${cx} .2 ${cx+.14} .42 Q${cx} .32 ${cx-.14} .42 Z`,hair);k.key(`M${cx-.05} .5 Q${cx} .54 ${cx+.05} .5`,.01);}
 const t=rect(.1,.99,1.4,0);k.key(t,.001);});
/** An empty trophy plinth: a dotted outline where a cup would stand. */
const plinth=(key:string)=>spec(key,.9,1.2,k=>{const b=rect(.12,.72,.66,.48);k.fill(b,INK.stone);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.fill(rect(.06,.66,.78,.08),INK.white);k.key(rect(.06,.66,.78,.08),.012);
 const ghost=`M.24 .06 L.66 .06 Q.66 .4 .45 .44 Q.24 .4 .24 .06 Z M.4 .44 L.36 .62 L.54 .62 L.5 .44`;for(let i=0;i<9;i++){k.circle(.24+i*.0525,.06,.012,INK.grey);}k.key(ghost,.012,INK.grey);
 k.text('ITALY',.45,1.02,.13,AZ);});
/** A football clock where one full turn is 90 minutes. */
const matchClock=(key:string)=>spec(key,.95,1.35,k=>{k.keyFill(rect(.44,.9,.07,.45),'#1a2447');const f=ell(.475,.475,.44,.44);k.fill(f,MR);k.key(f,.014);const fi=ell(.475,.475,.37,.37);k.fill(fi,INK.white);k.dots(fi,INK.sky,.03,.2);
 const sh=`M.475 .475 L.475 .845 A.37 .37 0 0 1 .105 .475 Z`;
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${.475+Math.sin(a)*.3} ${.475-Math.cos(a)*.3} L${.475+Math.sin(a)*.35} ${.475-Math.cos(a)*.35}`,i%3?.012:.028);}
 k.fill(`M.475 .475 L.475 .105 A.37 .37 0 0 1 .845 .475 A.37 .37 0 0 1 .475 .845 Z`,INK.yellow,.28);k.key(sh,.001,INK.white);
 k.text('90',.475,.3,.1,MR);k.text('45',.475,.74,.1,MR);});
/** A standing year board: the base page shows 2007, the flap page 2005. */
const yearBoard=(key:string)=>spec(key,1.9,2.2,k=>{k.key('M.3 1.7 L.18 2.2 M1.6 1.7 L1.72 2.2',.05,INK.wood);k.key('M.3 1.7 L.18 2.2 M1.6 1.7 L1.72 2.2',.012);
 const b=rect(0,.12,1.9,1.64);k.fill(b,INK.wood);k.hatch(b,'#8a5238',.04,.1,.008);k.key(b,.014);
 const pg=rect(.1,.32,1.7,1.34);k.fill(pg,INK.yellow);k.dots(pg,INK.orange,.035,.3);k.key(pg,.012);k.text('2007',.95,1.2,.62,MR,{font:'Georgia,serif'});k.text('ATHENS',.95,1.52,.2,INK.navy);
 k.fill(rect(.05,.14,1.8,.18),MB);for(let i=0;i<8;i++){k.circle(.2+i*.214,.23,.04,INK.grey);k.key(ell(.2+i*.214,.23,.04,.04),.008);}});
const yearPage=(key:string)=>spec(key,1.7,1.34,k=>{const w=1.7,h=1.34,b=rect(0,0,w,h);k.fill(b,'#9aa3b5');k.dots(b,INK.navy,.035,.3);k.key(b,.013);
 k.text('2005',w/2,.82,.56,INK.white,{font:'Georgia,serif'});for(let i=0;i<5;i++){const x=.3+i*.28;k.key(`M${x} 1 L${x-.05} 1.2`,.03,INK.sky);}for(let i=0;i<8;i++)k.circle(.1+i*.214,.06,.025,INK.navy,true);},{rim:.016});
/** A Greek temple silhouette for the Athens backdrop. */
function temple(k:Kit,cx:number,base:number,w:number){const h=w*.42,top=base-h;
 const ped=poly([[cx-w*.54,top+.02],[cx,top-w*.14],[cx+w*.54,top+.02]]);k.fill(ped,INK.stone);k.dots(ped,INK.orange,.03,.2);k.key(ped,.012);
 const ent=rect(cx-w*.52,top,w*1.04,w*.07);k.fill(ent,INK.stone);k.key(ent,.012);
 for(let i=0;i<7;i++){const x=cx-w*.46+i*w*.153,c=rect(x,top+w*.07,w*.07,h-w*.1);k.fill(c,'#efe3c8');k.hatch(c,'#b9ab8c',w*.03,Math.PI/2,.006);k.key(c,.008);}
 const st=rect(cx-w*.56,base-w*.04,w*1.12,w*.05);k.fill(st,INK.stone);k.key(st,.012);}

/* ───────────── 1 · The captain's son ───────────── */
const SIGN_POS=[[1.25,1.25],[2.55,.4],[3.85,-.4]] as const;
const WALK=[[.55,1.75],[1.75,1.35],[3.05,.55],[4.3,-.2]] as const;
const family:SpreadDef={id:'family',rest:26.6,
 left:k=>{const pz=rect(-5,0,5,PAGE_D);k.fill(pz,INK.stone);k.dots(pz,INK.orange,.06,.12);for(let i=0;i<10;i++)k.key(`M-5 ${Z(-1.2)+i*.52} L0 ${Z(-1.2)+i*.52}`,.008,'#b9ab8c');
  k.key(`M-5 ${Z(-1.25)} L0 ${Z(-1.25)} M-5 ${Z(-1.45)} L0 ${Z(-1.45)}`,.02,'#6d6452');
  k.text('MILAN',-2.6,Z(2.5),.62,MR,{max:3.4});k.text('ITALY · 1968',-2.6,Z(2.84),.2,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);const C=[[0,2],[.8,1.85],[1.6,1.55],[2.3,1],[3.1,.4],[3.9,-.1],[5,-.55]],path=poly([...C.map(([x,z])=>[x,Z(z+.3)]),...C.slice().reverse().map(([x,z])=>[x,Z(z-.3)])]);k.fill(path,INK.sand);k.dots(path,INK.orange,.05,.25);k.key(path,.014,'#b9975a');
  for(let i=0;i<9;i++){const u=i/8,x=.4+u*4.2,z=1.8-u*2.3;k.fill(ell(x,Z(z),.06,.04),INK.brown,.35);}
  k.text('HIS OWN PATH',2.6,Z(2.6),.36,MB,{max:3.6});for(let i=0;i<14;i++){const x=.5+i*.3;k.fill(rect(x,Z(2.8),.15,.07),i%2?MB:MR);}},
 build:B=>{
  const bd=B.vfold(
   {key:'maldini-f-bdL',w:4.5,h:3,paint:k=>{daySky(k,4.5,3);
    for(let i=0;i<6;i++){const x=i<3?.05+i*.42:3.55+(i-3)*.33,hh=.6+((i*7)%3)*.2,b=rect(x,2.45-hh,.38,hh);k.fill(b,i%2?'#f2c47c':'#e79a8f');k.key(b,.012);for(let j=0;j<2;j++)k.fill(rect(x+.08,2.55-hh+j*.2,.1,.1),INK.blue);}
    const cx=2.55,top=1.4,base=2.45,body=rect(cx-1.05,top,2.1,base-top);k.fill(body,'#f6e7dc');k.dots(body,INK.pink,.04,.14);k.key(body,.014);
    const gab=poly([[cx-.6,top],[cx,top-.45],[cx+.6,top]]);k.fill(gab,'#f6e7dc');k.dots(gab,INK.pink,.04,.16);k.key(gab,.014);
    for(let i=-5;i<=5;i++){const x=cx+i*.2,hh=.32+(i%2?0:.16);const sp=poly([[x-.04,top+.02],[x,top-hh],[x+.04,top+.02]]);k.fill(sp,'#efd9cc');k.key(sp,.008);}
    const tall=poly([[cx-.07,top-.4],[cx,top-1.12],[cx+.07,top-.4]]);k.fill(tall,'#efd9cc');k.key(tall,.01);k.circle(cx,top-1.16,.045,INK.gold);
    k.fill(ell(cx,top+.3,.16,.16),INK.sky);k.dots(ell(cx,top+.3,.16,.16),INK.blue,.03,.5);k.key(ell(cx,top+.3,.16,.16),.012);
    for(let i=-2;i<=2;i++){const x=cx+i*.38;k.fill(`M${x-.09} ${base} L${x-.09} ${base-.24} Q${x} ${base-.36} ${x+.09} ${base-.24} L${x+.09} ${base} Z`,INK.navy);}
    const pz=rect(0,base,4.5,.55);k.fill(pz,INK.stone);k.dots(pz,INK.navy,.05,.12);k.key(`M0 ${base} L4.5 ${base}`,.014);}},
   {key:'maldini-f-bdR',w:4.5,h:3,paint:k=>{daySky(k,4.5,3);const hill=`M0 2.2 Q1.4 1.8 2.6 2.05 Q3.6 2.25 4.5 1.9 L4.5 3 L0 3 Z`;k.fill(hill,INK.leaf);k.dots(hill,INK.navy,.05,.2);
    for(let i=0;i<7;i++){const x=.15+i*.6,hh=.7+((i*5)%4)*.18,b=rect(x,2.45-hh,.48,hh);k.fill(b,i%3?'#f0c89a':'#f6d9a4');k.key(b,.012);
     for(let j=0;j<3;j++)k.fill(rect(x+.08,2.55-hh+j*.2,.12,.1),INK.blue);if(i%2){const f=rect(x+.28,2.6-hh,.12,.2);stripedPanel(k,f,.03);k.key(f,.008);}}
    lightRig(k,.6,.5);lightRig(k,3.9,.45);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},
   -3.05,1.22);
  const sunP=bd.add(S.sun('maldini-f-sun',.38),'R',2.6,1.6,{out:.015}),cl1=bd.add(S.cloud('maldini-f-cl1',1.1,.48),'L',3.4,2.35),cl2=bd.add(S.cloud('maldini-f-cl2',1,.45),'R',1.3,2.4);
  const capBan=bd.add(S.banner('maldini-f-bancap',3,.42,'CAPTAIN · MILAN AND ITALY',MR),'L',2.3,2.45,{out:.022});
  const u21=bd.add(S.banner('maldini-f-banu21',2.4,.4,'ITALY U-21 · 1986',AZ),'L',2.3,2.02,{out:.024});
  const selfBan=bd.add(S.banner('maldini-f-banself',2.5,.42,'BE YOURSELF',MB),'R',2.4,2.45,{out:.022});
  const storm=bd.add(stormCloud('maldini-f-storm',1.5,.72),'L',2.15,1.45,{out:.03}),stormRain=bd.add(rain('maldini-f-rain',1.1,.5),'L',2.1,1.0,{out:.028});
  const conf=bd.add(S.confetti('maldini-f-conf',2.4,1.2,4),'R',1.4,1.3,{out:.03}),bunt=bd.add(S.bunting('maldini-f-bunt',3.2,.4,[MR,MB,INK.white]),'R',2.2,2.1,{out:.018});
  const tramP=B.stand(tram('maldini-f-tram'),-3.7,-1.35,{layer:1,tab:false});B.slot(-4.3,-1.25,-1.9,-1.25);
  B.stand(S.tree('maldini-f-tree',.9,1.45,'round'),-4.55,-.75,{layer:1});
  const sign=B.stand(S.sign('maldini-f-sign',1.05,1.1,'1968'),-.6,-1.3,{layer:1});
  const milanCard=sign.flap(card('maldini-f-milancard',.98,.44,['MILAN'],INK.white,MR),0,1.1,{z:.03});
  B.stand(S.lamp('maldini-f-lamp',.3,1.45),-.35,.9,{layer:2});
  const cesare=kp(B,'maldini-f-cesare',-3.85,-.3,1.5,{kit:MILAN,adult:true,hair:'short',hairColor:'#8f8a84',armband:true,face:'smile',skin:SKIN[1],layer:2});
  const u21Card=cesare.body.add(card('maldini-f-u21card',.7,.4,['U-21'],AZ,INK.white),.62,1.25,{z:-.02});
  const paolo=kp(B,'maldini-f-paolo',-2.55,.6,1.18,{kit:MILAN,...PAOLO,face:'smile',alt:'shy',layer:3});
  const hang=B.stand(hanger('maldini-f-hanger'),-1.55,.45,{layer:2});
  const shirt=hang.add(shirtTag('maldini-f-shirt',1.05,MILAN,'3','PAOLO'),0,2.1,{anchor:'top',z:.02});
  const tag=hang.flap(card('maldini-f-tag',.86,.26,['CESARE'],INK.white,MR),0,.94,{z:.036});
  const talkers=[B.person('maldini-f-p1',-4.35,1.7,1.25,{shirt:'casual',hair:'bun',adult:true,skin:SKIN[2],face:'open',layer:3}),B.person('maldini-f-p2',-.6,1.8,1.2,{shirt:'fan',hair:'cap',adult:true,skin:SKIN[1],face:'open',layer:3})];
  const bubbles=talkers.map((p,i)=>p.body.add(S.bubble(`maldini-f-talk${i}`,.5,.42,'dots'),i?-.45:.45,1.62,{z:-.02}));
  const std=B.stand(stadium('maldini-f-stadium',3.2,2.1),2.75,-1.3,{layer:1});
  const gateL=std.flap(gate('maldini-f-gateL',false),-.5,0,{anchor:'bl',axis:'y',z:.014}),gateR=std.flap(gate('maldini-f-gateR',true),.5,0,{anchor:'br',axis:'y',z:.014});
  const posts=(['WINGER','RIGHT-BACK · 14','LEFT-BACK'] as const).map((l,i)=>B.stand(S.sign(`maldini-f-post${i}`,1.3,1.1,l,[INK.yellow,INK.white,MR][i]),SIGN_POS[i][0],SIGN_POS[i][1],{layer:2,s:0}));
  const walker=kp(B,'maldini-f-walker',WALK[0][0],WALK[0][1],1.18,{kit:MILAN,...PAOLO,face:'grin',layer:3,tab:false});
  for(let i=0;i<3;i++)B.slot(WALK[i][0],WALK[i][1]+.12,WALK[i+1][0],WALK[i+1][1]+.12);
  const heart=walker.body.add(S.bubble('maldini-f-heart',.55,.46,'heart'),.5,1.5,{z:-.02});
  B.stand(S.bush('maldini-f-bush',1.1,.42),4.35,1.75,{layer:3,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   sunP.dy=-.8*beat(t,0,2.4);cl1.dx=-.8*beat(t,0,46)+.2;cl2.dx=.7*beat(t,1,46)-.2;tramP.x=-3.7+1.75*beat(t,.4,6.4);
   // 1968: born in Milan. The MILAN card lifts to show the year and little Paolo pops up.
   milanCard.flip=-2.9*beat(t,2.4,3.4);paolo.body.s=beat(t,3.6,4.7);
   paolo.armR.rot=.12+1.9*beat(t,4.7,5.4)-1.9*beat(t,6.4,7)+.3*wave(t,5.4,6.4,1.4);
   // His father Cesare: defender and captain of Milan and of Italy.
   cesare.body.s=beat(t,7.2,8.3);capBan.scale=beat(t,8.8,10);
   // Sixteen: the number three shirt his father once wore pops onto the stand, tagged CESARE.
   hang.s=Math.max(beat(t,13.4,14.4),beat(act,0,.1));const sh=Math.max(beat(t,15.6,16.6),beat(act,0,.1));shirt.scale=sh;tag.scale=sh;
   const point=beat(t,16.8,17.5)-beat(t,19.8,20.4);paolo.armR.rot+=1.3*point;
   // 1986: his father calls him up to Italy's under-21 team.
   u21.scale=beat(t,21.3,22.4);const lift=beat(t,22.6,23.4)-beat(t,26.4,27);u21Card.scale=beat(t,22.4,23.2);
   cesare.armR.rot=.12+2.3*lift+.2*wave(t,23.4,26.4,1.2);cesare.armL.rot=-.12-.9*beat(t,9.2,10)+.9*beat(t,12,12.8)-1.6*beat(t,43,43.7)-.25*wave(t,43.7,46.4,1.2);
   // Lift the name tag: under CESARE it says PAOLO.
   tag.flip=-2.9*Math.max(n?beat(t,27.6,28.8):0,act);
   // Pressure: people compare, a grey cloud gathers over young Paolo.
   const talk=beat(t,30,30.8);talkers.forEach((p,i)=>{p.body.s=beat(t,29.8+i*.3,30.6+i*.3);p.armR.rot=.12+1.2*pulse(t,30.6+i*.4,32.6+i*.4);p.armL.rot=-.12-1.2*pulse(t,31+i*.4,33+i*.4);});
   bubbles.forEach((q,i)=>{q.dy=-.5+.5*beat(t,30.4+i*.4,31.1+i*.4);q.visible=t>30.3+i*.4&&t<34;});
   const cloud=beat(t,30.6,31.8)-beat(t,33.6,34.8);storm.scale=cloud;stormRain.scale=cloud;stormRain.dy=-.04*wave(t,31.8,33.6,1.6);storm.dx=.9*beat(t,33.6,34.8);
   if(paolo.alt)paolo.alt.visible=t>30.8&&t<34;
   // His path was his own: Paolo sets off down the printed path, past three signposts.
   walker.body.s=beat(t,33.8,34.8);
   const legs=[beat(t,36,37.3),beat(t,38.2,39.5),beat(t,40.2,41.5)];let wx:number=WALK[0][0],wz:number=WALK[0][1];
   legs.forEach((l,i)=>{wx+=(WALK[i+1][0]-WALK[i][0])*l;wz+=(WALK[i+1][1]-WALK[i][1])*l;});
   walker.body.x=wx;walker.body.z=wz;walker.body.dy=.03*Math.abs(Math.sin((legs[0]+legs[1]+legs[2])*12));
   posts.forEach((p,i)=>{p.s=beat(t,[36.2,38.3,40.3][i],[37,39.1,41.1][i]);});
   walker.armR.rot=.12+.35*wave(t,36,41.6,1.5)+2.3*beat(t,42.6,43.3);walker.armL.rot=-.12-.35*wave(t,36,41.6,1.5)-2.3*beat(t,42.6,43.3)-.25*wave(t,43.3,46.4,1.4);
   // Be yourself.
   selfBan.scale=beat(t,42.4,43.5);heart.dy=-.6+.6*beat(t,43.2,44);heart.visible=t>43.1;const open=beat(t,13.4,14.8);gateL.flip=-1.95*open;gateR.flip=1.95*open;
   bunt.dy=.04*wave(t,42.5,46.4,1.1);conf.dy=-1+1*beat(t,43.6,45);conf.visible=t>43.5;
   return n?-.6*beat(t,2,3.5)+.1*beat(t,26.6,27.6)+1.2*beat(t,33.4,34.6)-.6*beat(t,42.2,43.2):(act>0?-.4:0);
  };
 }};

/* ───────────── 2 · So close with Italy ───────────── */
const FLIPS=[11.8,17.3,24.8,36.3];
const debut:SpreadDef={id:'debut',rest:21.9,
 left:k=>{pitch(k,-5,0,true);chalk(k,`M-5 ${Z(-.8)} L0 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  const fl=rect(-4.6,Z(2.22),.9,.5);k.fill(rect(-4.6,Z(2.22),.3,.5),ITG);k.fill(rect(-4.3,Z(2.22),.3,.5),INK.white);k.fill(rect(-4,Z(2.22),.3,.5),MR);k.key(fl,.012);
  k.text('SO CLOSE',-2.3,Z(2.55),.5,INK.white,{max:3});k.text('ITALY · 1990 TO 2002',-2.3,Z(2.86),.18,INK.yellow,{weight:800});},
 right:k=>{pitch(k,0,5,true);chalk(k,`M0 ${Z(-.8)} L5 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  k.text('126 GAMES',2.5,Z(2.5),.42,INK.white,{max:4.2});k.text('CAPTAIN FOR 8 YEARS',2.5,Z(2.84),.2,INK.yellow,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:'maldini-o-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,ITALY_FANS,2);lightRig(k,.9,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'maldini-o-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,ITALY_FANS,5);lightRig(k,1.2,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const tri=bd.add(S.bunting('maldini-o-tri',3.4,.42,[ITG,INK.white,MR]),'L',.6,2.5,{out:.02});
  const clouds=[[ 'L',3.3,1.9],['L',1.9,2.05],['R',.8,2.0],['R',2.4,2.1]].map(([s,a,u],i)=>bd.add(stormCloud(`maldini-o-cl${i}`,1.05,.5,i%2?STORM2:STORM),s as 'L'|'R',a as number,u as number,{out:.03+i*.003}));
  const more=bd.add(S.banner('maldini-o-more',3,.42,'MORE THAN ONE RESULT',AZ),'R',2.2,2.45,{out:.024});
  const fw=[bd.add(S.firework('maldini-o-fw1',.4,INK.white),'R',3.5,1.55,{out:.03}),bd.add(S.firework('maldini-o-fw2',.42,ITG),'L',1.2,1.6,{out:.03})];
  const italy=kp(B,'maldini-o-paolo',-2.4,.3,1.42,{kit:ITALY,...PAOLO,adult:true,face:'smile',alt:'sad',layer:3});
  const mates=[kp(B,'maldini-o-it1',-1.3,-.55,1.3,{kit:ITALY,adult:true,hair:'short',skin:SKIN[1],face:'smile',alt:'sad',layer:2}),kp(B,'maldini-o-it2',-3.7,-.35,1.3,{kit:ITALY,adult:true,hair:'curly',skin:SKIN[0],face:'smile',alt:'sad',layer:2})];
  const capSign=B.stand(S.sign('maldini-o-capsign',1.7,1.05,'CAPTAIN · 8 YEARS',INK.yellow),-4.1,1.55,{layer:3,s:0});
  const board=B.stand(S.scoreboard('maldini-o-board',2.8,2.2,'ITALY'),2.2,-1.1,{layer:1,s:0});
  B.stand(S.goal('maldini-o-goal',1.4,.75),4.1,.1,{layer:2});B.stand(S.ball('maldini-o-spot',.12),3.7,1.2,{layer:3,tab:false});
  board.add(yearCard('maldini-o-126',2.38,1.0,'126 GAMES','FOR ITALY',INK.yellow),0,.56,{z:.012});
  const flaps=([['1990','SEMI-FINAL · PENALTIES'],['1994','FINAL · BRAZIL · PENALTIES'],['1998','FRANCE · PENALTIES'],['EURO 2000','FINAL · EXTRA TIME']] as const)
     .map((l,i)=>board.flap(yearCard(`maldini-o-f${i}`,2.38,1.0,l[0],l[1],[INK.white,INK.sky,INK.white,INK.sky][i]),0,1.56,{z:.05-i*.009}));
  const plin=B.stand(plinth('maldini-o-plinth'),.8,.9,{layer:2,s:0});
  const fans=[B.person('maldini-o-fan1',2.15,1.9,1.05,{shirt:'fan',hair:'short',skin:SKIN[2],face:'open',layer:3}),B.person('maldini-o-fan2',3.6,1.9,1,{shirt:'fan',hair:'bun',skin:SKIN[0],face:'open',layer:3})];
  const love=[italy.body.add(S.bubble('maldini-o-heart',.55,.46,'heart'),.5,1.65,{z:-.02}),mates[0].body.add(S.bubble('maldini-o-star',.5,.42,'star'),-.45,1.5,{z:-.02})];
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   tri.dy=.04*wave(t,2,6.3,1.2);
   // With Italy: Paolo and his teammates pop up; so close to the biggest trophies.
   italy.body.s=Math.max(beat(t,2.2,3.2),beat(act,0,.1));mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,2.8+i*.4,3.7+i*.4),beat(act,0,.1));});tri.scale=beat(t,1.6,2.6);
   // Each lost shootout: the board shows the year and a grey cloud gathers.
   const on=beat(act,0,.1);board.s=Math.max(beat(t,6.4,7.4),on);
   const lostAt=[7.4,12.6,18.2,26.6];clouds.forEach((c,i)=>{c.scale=beat(t,lostAt[i],lostAt[i]+.9)-beat(t,36.4,37.6);c.dx=(i<2?-1:1)*.5*beat(t,36.4,37.6);});
   const sad=t>7.8&&t<36.4;italy.alt!.visible=sad;mates.forEach(m=>{m.alt!.visible=sad;});
   const droop=.08*beat(t,7.6,8.4)-.08*beat(t,36.2,36.9);italy.body.rot=-droop;mates[0].body.rot=droop;mates[1].body.rot=-droop;
   // Flip the scoreboard through the finals (four taps, or narrated), revealing 126 GAMES.
   flaps.forEach((f,i)=>{const v=Math.max(n?beat(t,FLIPS[i],FLIPS[i]+.8):0,clamp01((act-i/4)*4));f.flip=-2.9*v;});
   // Never won a trophy with Italy: the empty plinth.
   plin.s=beat(t,33.4,34.3);
   // Still: 126 games and captain for eight years. Clouds clear and the teammates put their arms up.
   const up=beat(t,37,37.8);italy.armL.rot=-.12-2.4*up-.25*wave(t,37.8,46.9,1.3);italy.armR.rot=.12+2.4*up+.25*wave(t,37.8,46.9,1.4);
   mates.forEach((m,i)=>{const c=beat(t,37.3+i*.3,38+i*.3);m.armL.rot=-.12-2.3*c-.25*wave(t,38,46.9,1.5+i*.1);m.armR.rot=.12+2.3*c+.25*wave(t,38,46.9,1.4+i*.1);});
   capSign.s=beat(t,39.4,40.2);
   fans.forEach((f,i)=>{f.body.s=beat(t,37.2+i*.4,38.1+i*.4);const w=beat(t,38.2+i*.3,38.8+i*.3);f.armL.rot=-.12-2.4*w-.3*wave(t,38.8,46.9,1.5+i*.2);f.armR.rot=.12+2.4*w+.3*wave(t,38.8,46.9,1.4+i*.2);});
   fw.forEach((f,i)=>{const a=beat(t,37.8+i*.6,38.8+i*.6);f.scale=a;f.rot=a*1.2+(t>38?(t-38)*.15:0);});
   // You are more than one result.
   more.scale=beat(t,42.6,43.7);love.forEach((q,i)=>{q.dy=-.5+.5*beat(t,43.4+i*.4,44.1+i*.4);q.visible=t>43.3+i*.4;});
   return n?-.5*beat(t,1.8,3)+1.3*beat(t,6.2,7.4)-.8*beat(t,33,34.4)-.5*beat(t,36.2,37.4)+.2*beat(t,42.4,43.4):(act>0?.6:.5);
  };
 }};

/* ───────────── 3 · Captain in the hard years ───────────── */
const read:SpreadDef={id:'read',rest:25.9,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-.6)} L0 ${Z(-.6)}`);chalk(k,ell(0,Z(.4),1.1,1.1));
  k.text('THE HARD YEARS',-2.55,Z(2.55),.44,MB,{max:4});k.text('MILAN · 1996 TO 2001',-2.55,Z(2.86),.18,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-.6)} L5 ${Z(-.6)}`);chalk(k,ell(0,Z(.4),1.1,1.1));
  k.text('SERIE A 1999',2.5,Z(2.52),.44,MR,{max:3.8});k.text('BY ONE POINT',2.5,Z(2.84),.2,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:'maldini-h-bdL',w:4.5,h:3,paint:k=>{greySky(k,4.5,3);crowd(k,4.5,1.2,2.6,MILAN_FANS,2);lightRig(k,1,.4);lightRig(k,3.6,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'maldini-h-bdR',w:4.5,h:3,paint:k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.6,MILAN_FANS,6);lightRig(k,1.3,.35);lightRig(k,3.9,.4);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},-3.05,1.22);
  const sunP=bd.add(S.sun('maldini-h-sun',.42),'R',2.3,1.2,{out:.012});
  const CL=[['L',2.9,1.75],['R',.9,1.85],['R',3.1,1.75]] as const;
  const clouds=CL.map(([s,a,u],i)=>({c:bd.add(stormCloud(`maldini-h-cl${i}`,1.6,.76,i===1?STORM2:STORM),s,a,u,{out:.03+i*.004}),r:bd.add(rain(`maldini-h-rn${i}`,1.2,.55),s,a-(s==='L'?-.05:.05),u-.5,{out:.028+i*.004})}));
  const later=[bd.add(stormCloud('maldini-h-late0',1,.46),'L',1.3,2.2,{out:.034}),bd.add(stormCloud('maldini-h-late1',1,.46,STORM2),'R',4,2.25,{out:.034})];
  const capBan=bd.add(S.banner('maldini-h-cap',2.4,.4,'CAPTAIN · 1997',MR),'L',2.4,2.5,{out:.022});
  const passBan=bd.add(S.banner('maldini-h-pass',2.8,.42,'HARD SEASONS PASS',MB),'R',2.3,2.5,{out:.022});
  const sign=B.stand(S.sign('maldini-h-sign',1.35,1.25,''),-4.05,-1.15,{layer:1,s:0});
  sign.add(card('maldini-h-noeu',1.27,.5,['NO EUROPE','TWO SEASONS'],INK.pink,INK.white),0,.76,{z:.02});
  const noEu=sign.flap(card('maldini-h-1996',1.27,.5,['1996'],INK.white),0,1.27,{z:.034});
  const coach=B.person('maldini-h-coach',-1.7,-.8,1.75,{shirt:'coach',hair:'short',adult:true,skin:SKIN[1],face:'smile',layer:1});B.slot(-4.6,-.68,-1.7,-.68);
  const baresi=kp(B,'maldini-h-baresi',-3.1,.45,1.4,{kit:MILAN,adult:true,hair:'bald',skin:SKIN[1],number:'6',armband:true,face:'smile',layer:2});
  const paolo=kp(B,'maldini-h-paolo',-1.55,.95,1.42,{kit:MILAN,...PAOLO,adult:true,face:'smile',layer:3,tab:false});B.slot(-1.55,1.07,-1.55,1.45);
  const band=paolo.body.add(card('maldini-h-band',.24,.2,['C'],INK.yellow),.24,1.0,{z:.03});
  const mate0=kp(B,'maldini-h-m0',-4.2,1.5,1.25,{kit:MILAN,hair:'curly',skin:SKIN[3],face:'smile',layer:3});
  const mates=[kp(B,'maldini-h-m1',2.6,.3,1.3,{kit:MILAN,adult:true,hair:'short',skin:SKIN[2],face:'grin',layer:2}),kp(B,'maldini-h-m2',3.85,1.1,1.25,{kit:MILAN,hair:'bun',skin:SKIN[0],face:'grin',layer:3}),kp(B,'maldini-h-m3',4.35,-.35,1.3,{kit:MILAN,adult:true,hair:'curly',skin:SKIN[1],face:'grin',layer:1})];
  const trophy=B.stand(cup('maldini-h-cup',.8,1.02,'1999'),1.3,.95,{layer:3,s:0});
  const pt=B.stand(card('maldini-h-pt',1.2,.46,['+1 POINT'],INK.yellow),1.3,1.95,{layer:3,s:0,tab:false});
  const conf=bd.add(S.confetti('maldini-h-conf',2.4,1.2,3),'R',.9,1.2,{out:.036});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   // 1996: the coach leaves, grey clouds roll in over disappointing seasons.
   coach.body.s=beat(t,2.2,3)-beat(t,7.4,8.2);coach.body.x=-1.7-2.6*beat(t,4.4,7.6);coach.armR.rot=.12+2*beat(t,3.2,3.8)-2*beat(t,6.8,7.4)+.3*wave(t,3.8,6.8,1.5);
   sign.s=beat(t,2.8,3.6);
   const step=(i:number)=>Math.max(n?beat(t,[26.1,27.4,28.7][i],[26.9,28.2,29.5][i]):0,clamp01((act-i/3)*3));
   clouds.forEach(({c,r},i)=>{const g=beat(t,4+i*1.1,5+i*1.1),cl=step(i);c.scale=g*(1-.7*cl);r.scale=g*(1-cl);c.dy=.6*cl;c.dx=(i===0?-1:1)*1.1*cl;r.dy=-.05*wave(t,5,26,1.3)*(1-cl);});
   // Two seasons in a row without Europe.
   noEu.flip=-2.9*beat(t,10.2,11);
   // 1997: Franco Baresi retires and Paolo becomes captain.
   baresi.body.s=beat(t,14.6,15.4)-beat(t,21.4,22.3);const hand=beat(t,16.4,17.2)-beat(t,19.6,20.2);baresi.armR.rot=.12+1.6*hand;baresi.armL.rot=-.12-2*beat(t,20.2,20.8)+.3*wave(t,20.8,22,1.5);
   paolo.body.s=beat(t,1.6,2.6);band.scale=beat(t,18.4,19.2);capBan.scale=beat(t,18.8,19.9);paolo.armL.rot=-.12-1.5*beat(t,19.2,19.9)+1.5*beat(t,21.4,22);
   mate0.body.s=beat(t,9.4,10.3);mate0.armR.rot=.12+1.4*pulse(t,10.6,13);
   // Clear the clouds (three taps): sunshine and the 1999 title by one point.
   const clear=Math.min(step(0),step(1),step(2));sunP.dy=-.9*clear;sunP.scale=.4+.6*clear;
   trophy.s=clear;pt.s=Math.max(n?beat(t,31,31.8):0,beat(act,.9,1));conf.dy=-1+beat(t,30.2,31.6)*(n?1:0)+(n?0:beat(act,.85,1));conf.visible=n?t>30.1:act>.84;
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,24.8+i*.3,25.6+i*.3),beat(act,0,.1));const up=Math.max(n?beat(t,29.6+i*.3,30.2+i*.3):0,beat(act,.85,1));m.armL.rot=-.12-2.4*up-.25*wave(t,30.2,33,1.5+i*.1);m.armR.rot=.12+2.4*up+.25*wave(t,30.2,33,1.4+i*.1);});
   const cheer=Math.max(n?beat(t,29.8,30.5)-beat(t,33,33.6):0,beat(act,.85,1));paolo.armR.rot=.12+2.3*cheer+1.1*beat(t,39.3,40)-1.1*beat(t,41.2,41.8);paolo.armL.rot-=2.3*cheer;
   // Then more hard seasons: two smaller clouds; Paolo keeps showing up, stepping forward.
   later.forEach((c,i)=>{c.scale=beat(t,33.2+i*.5,34.1+i*.5)-.6*beat(t,42.4,43.6);c.dx=(i?1:-1)*.4*beat(t,42.4,43.6);});
   paolo.body.z=.95+.35*beat(t,39.3,40.4);
   passBan.scale=beat(t,41.6,42.7);
   mates.forEach((m,i)=>{const w=beat(t,42.2+i*.3,42.8+i*.3);m.armL.rot-=2*w;m.armR.rot+=2*w;});mate0.armL.rot=-.12-2.2*beat(t,42.4,43)-.25*wave(t,43,46.5,1.4);
   return n?-.6*beat(t,2,3.2)+1.2*beat(t,23.6,25)-.9*beat(t,32.8,34)+.3*beat(t,41.6,42.6):(act>0?.6:-.3);
  };
 }};

/* ───────────── 4 · The finals that got away ───────────── */
const line:SpreadDef={id:'line',rest:25.7,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-.8)} L0 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  k.text('FINALS THAT',-2.55,Z(2.44),.36,MB,{max:4});k.text('GOT AWAY',-2.55,Z(2.86),.36,MB,{max:4});},
 right:k=>{pitch(k,0,5,true);chalk(k,`M0 ${Z(-.8)} L5 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  k.text('2005 FINAL',2.5,Z(2.5),.42,INK.white,{max:4});k.text('HALF-TIME 3–0',2.5,Z(2.84),.2,INK.yellow,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:'maldini-g-bdL',w:4.5,h:3,paint:k=>{greySky(k,4.5,3);crowd(k,4.5,1.2,2.6,MILAN_FANS,3);lightRig(k,.9,.4);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:'maldini-g-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,2.25,1.1,2.6,MILAN_FANS,5);k.at(2.25,0,1,()=>crowd(k,2.25,1.1,2.6,LIV_FANS,2));lightRig(k,1.2,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const oldClouds=[bd.add(stormCloud('maldini-g-c93',.95,.44),'L',3.6,2.05,{out:.03}),bd.add(stormCloud('maldini-g-c95',.95,.44,STORM2),'L',1.7,2.15,{out:.032})];
  const nightCloud=bd.add(stormCloud('maldini-g-night',1.5,.7,STORM2),'R',1.2,1.55,{out:.034}),nightRain=bd.add(rain('maldini-g-rain',1.1,.55),'R',1.2,1.05,{out:.03});
  const talkBan=bd.add(S.banner('maldini-g-talk',3.3,.42,'TALK TO SOMEONE YOU TRUST',INK.blue),'L',2.3,2.5,{out:.022});
  const cards=[B.stand(yearCard('maldini-g-93',1.6,.72,'1993','LOST 1–0 · MARSEILLE'),-3.7,-.7,{layer:2,s:0}),B.stand(yearCard('maldini-g-95',1.6,.72,'1995','LOST 1–0 · AJAX'),-1.75,-.2,{layer:2,s:0})];
  const mate=kp(B,'maldini-g-mate',.55,1.75,1.35,{kit:MILAN,adult:true,hair:'curly',skin:SKIN[3],face:'smile',layer:3,tab:false});B.slot(.55,1.87,1.4,1.42);
  const bubble=mate.body.add(S.bubble('maldini-g-dots',.55,.46,'dots'),.5,1.62,{z:-.02});
  const board=B.stand(S.scoreboard('maldini-g-board',1.9,1.5,'2005 FINAL'),1.2,-1.3,{layer:1,s:0});
  board.add(card('maldini-g-pens',1.62,.66,['LIVERPOOL WON','ON PENALTIES'],INK.pink,INK.white),0,.38,{z:.012});
  // Hinged on its right edge: the HALF-TIME card swings open like a door, so the board's 2005 FINAL header stays readable.
  const ht=board.flap(card('maldini-g-ht',1.62,.66,['HALF-TIME','MILAN 3–0'],INK.yellow),.81,.38,{anchor:'br',axis:'y',z:.026});
  B.stand(S.goal('maldini-g-goal',1.5,.8),3.75,-1.2,{layer:1});
  const keeper=B.person('maldini-g-keeper',3.75,-.95,1,{shirt:'keeper',hair:'short',skin:SKIN[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const paolo=kp(B,'maldini-g-paolo',2.05,.95,1.42,{kit:MILAN,...PAOLO,adult:true,armband:true,legs:'kick',face:'smile',alt:'sad',layer:2});
  const ball=B.stand(S.ball('maldini-g-ball',.12),2.4,1.1,{layer:3,tab:false,s:0});B.slot(2.45,1.15,3.7,-.9);
  const heart=paolo.body.add(S.bubble('maldini-g-heart',.55,.46,'heart'),-.5,1.72,{z:-.02});
  const livs=[kp(B,'maldini-g-l1',3.25,.3,1.28,{kit:LIVERPOOL,adult:true,hair:'short',skin:SKIN[2],face:'smile',layer:2}),kp(B,'maldini-g-l2',4.45,1.0,1.24,{kit:LIVERPOOL,hair:'curly',skin:SKIN[0],face:'smile',layer:3})];
  const clk=B.stand(matchClock('maldini-g-clock'),3.35,1.8,{layer:3,s:0});
  const minute=clk.arm(hand('maldini-g-min',.33,.06),0,.875,{z:.02});
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   // The pain of losing big finals: 1993 and 1995, each lost 1–0.
   cards.forEach((c,i)=>{c.s=beat(t,[8.6,12.6][i],[9.4,13.4][i]);});
   oldClouds.forEach((c,i)=>{c.scale=beat(t,[9.2,13.2][i],[10.1,14.1][i])-.5*beat(t,38,39.5);});
   mate.body.s=beat(t,3,3.9);
   // 2005: the final against Liverpool. Paolo scores in the first minute; 3–0 at half-time.
   const on=beat(act,0,.1);paolo.body.s=Math.max(beat(t,15.4,16.4),on);livs.forEach((l,i)=>{l.body.s=Math.max(beat(t,16.2+i*.4,17.1+i*.4),on);});board.s=Math.max(beat(t,17,18),on);
   const kick=beat(t,20.6,21.1);paolo.leg!.rot=.7*kick-1.9*beat(t,21.1,21.35)+1.2*beat(t,21.9,22.4);ball.s=beat(t,19.6,20.4);
   const fly=beat(t,21.25,22.2);ball.x=2.4+1.3*fly;ball.z=1.1-2.1*fly;ball.rot=-fly*12;
   keeper.armR.rot=.12+1.8*beat(t,21.5,21.9)-1.8*beat(t,23,23.6);
   const joy=beat(t,22.2,22.9);
   // Turn the clock to the second half: Liverpool fight back, penalties, the HALF-TIME card lifts away.
   clk.s=Math.max(beat(t,24.2,25),on);const turn=Math.max(n?beat(t,28.6,30.8):0,act);minute.rot=-Math.PI*turn;
   ht.flip=2.2*Math.max(n?beat(t,31.1,31.9):0,beat(act,.55,1));
   const liv=Math.max(n?beat(t,31.4,32.1):0,beat(act,.6,1));livs.forEach((l,i)=>{l.armL.rot=-.12-2.4*liv-.3*wave(t,32.1,36,1.4+i*.2);l.armR.rot=.12+2.4*liv+.3*wave(t,32.1,36,1.5+i*.2);});
   const low=Math.max(n?beat(t,31.4,32.2):0,beat(act,.6,1));
   paolo.armL.rot=-.12-2.3*joy*(1-low);paolo.armR.rot=.12+2.3*joy*(1-low)+.25*wave(t,22.9,25.6,1.4)*(1-low);paolo.body.rot=.06*low;paolo.alt!.visible=low>.5;
   // The worst moment of his career: rain over Paolo.
   const storm=Math.max(n?beat(t,33.3,34.3):0,beat(act,.7,1));nightCloud.scale=storm-(n?.5*beat(t,41,42.2):0);nightRain.scale=storm-(n?beat(t,41,42.2):0);nightRain.dy=-.05*wave(t,34.3,41,1.4);
   // It can hurt for a long time. A teammate comes over; it's okay to talk about it.
   const come=beat(t,36.9,38.6);mate.body.x=.55+.85*come;mate.body.z=1.75-.45*come;mate.body.dy=.03*Math.abs(Math.sin(come*14));
   mate.armR.rot=.12+2.2*beat(t,38.6,39.3);mate.armL.rot=-.12;
   bubble.dy=-.5+.5*beat(t,40.3,41);bubble.visible=t>40.2;heart.dy=-.5+.5*beat(t,41.6,42.3);heart.visible=t>41.5;talkBan.scale=beat(t,40.4,41.5);
   return n?-.6*beat(t,2.2,3.4)+1.3*beat(t,14.8,16)-.3*beat(t,36.6,38)-.4*beat(t,40,41):(act>0?.5:.4);
  };
 }};

/* ───────────── 5 · Two years later ───────────── */
const YEARS=['1989','1990','1994','2003','2007'];
const europe:SpreadDef={id:'europe',rest:18.9,
 left:k=>{pitch(k,-5,0,true);chalk(k,`M-5 ${Z(-.8)} L0 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  k.text('ATHENS 2007',-2.4,Z(2.55),.46,INK.white,{max:3.6});k.text('MILAN 2 · LIVERPOOL 1',-2.4,Z(2.86),.18,INK.yellow,{weight:800});},
 right:k=>{pitch(k,0,5,true);chalk(k,`M0 ${Z(-.8)} L5 ${Z(-.8)}`);chalk(k,ell(0,Z(.2),1.1,1.1));
  k.text('FIVE TIMES',2.5,Z(2.5),.4,INK.white,{max:4.2});k.text(YEARS.join(' · '),2.5,Z(2.84),.2,INK.yellow,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:'maldini-a-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);const hill=`M0 1.5 Q1.2 1.05 2.3 1.12 Q3.4 1.2 4.5 1.4 L4.5 3 L0 3 Z`;k.fill(hill,'#4f5f8f');k.dots(hill,INK.navy,.05,.3);
    temple(k,2.3,1.16,1.5);crowd(k,4.5,1.55,2.6,MILAN_FANS,2);lightRig(k,.5,.6);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'maldini-a-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,MILAN_FANS,1);lightRig(k,1.2,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const moonP=bd.add(moon('maldini-a-moon',.26),'L',3.9,2.25,{out:.015});
  const storm=bd.add(stormCloud('maldini-a-storm',1.4,.66),'L',1.2,1.85,{out:.034}),stormRain=bd.add(rain('maldini-a-rain',1,.5),'L',1.2,1.4,{out:.03});
  const bow=bd.add(S.rainbow('maldini-a-rainbow',2.2,1.05),'L',2.3,1.15,{out:.024});
  const keep=bd.add(S.banner('maldini-a-keep',2.4,.42,'KEEP GOING',MR),'R',2.3,2.45,{out:.022});
  const fw=[bd.add(S.firework('maldini-a-fw1',.42,MR),'R',1.1,1.7,{out:.03}),bd.add(S.firework('maldini-a-fw2',.4,INK.white),'R',3.5,1.6,{out:.03}),bd.add(S.firework('maldini-a-fw3',.42,INK.yellow),'L',3.3,1.5,{out:.03})];
  const conf=bd.add(S.confetti('maldini-a-conf',2.4,1.2,2),'R',.8,1.3,{out:.036});
  const board=B.stand(S.scoreboard('maldini-a-board',1.5,1.2,'FINAL'),-4.05,-1.2,{layer:1,s:0});
  board.add(card('maldini-a-21',1.24,.56,['MILAN 2','LIVERPOOL 1'],INK.white),0,.32,{z:.012});
  const yb=B.stand(yearBoard('maldini-a-years'),-1.55,-1.2,{layer:1});
  const y05=yb.flap(yearPage('maldini-a-2005'),0,1.88,{z:.016});
  const livs=[kp(B,'maldini-a-l1',-3.1,.95,1.26,{kit:LIVERPOOL,adult:true,hair:'short',skin:SKIN[2],face:'smile',layer:2}),kp(B,'maldini-a-l2',-2.2,1.7,1.22,{kit:LIVERPOOL,hair:'bun',skin:SKIN[1],face:'smile',layer:3})];
  const cap=kp(B,'maldini-a-cap',.95,.85,1.44,{kit:MILAN,...PAOLO,adult:true,armband:true,face:'smile',layer:2});
  const held=cap.body.add(cup('maldini-a-held',.55,.7),0,.55,{z:-.02});
  const age=B.stand(card('maldini-a-38',1.1,.5,['AGED 38'],INK.yellow),1.75,1.95,{layer:3,s:0});
  const cab=B.stand(cabinet('maldini-a-cab'),3.05,-1.25,{layer:1});
  const cups=YEARS.map((y,i)=>cab.add(cup(`maldini-a-cup${i}`,.5,.62,y),-1.36+i*.68,.1,{z:.014}));
  const mates=[kp(B,'maldini-a-m1',2.6,1.55,1.2,{kit:MILAN,hair:'curly',skin:SKIN[3],face:'grin',layer:3}),kp(B,'maldini-a-m2',4.2,1.2,1.2,{kit:MILAN,adult:true,hair:'short',skin:SKIN[2],face:'grin',layer:3})];
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   moonP.dy=-.3*beat(t,0,3);
   // 2007, Athens: the final again. The year board still shows 2005 under its grey cloud.
   storm.scale=1;stormRain.scale=1;stormRain.dy=-.04*wave(t,0,20,1.3);
   const on=beat(act,0,.1);cap.body.s=Math.max(beat(t,2.4,3.4),on);
   // Liverpool, once more.
   livs.forEach((l,i)=>{l.body.s=Math.max(beat(t,8.1+i*.4,9+i*.4),on);});
   // This time Milan won 2–1.
   board.s=Math.max(beat(t,11.2,12.1),on);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,11.6+i*.3,12.5+i*.3),on);});
   // At 38, the oldest captain to lift the trophy.
   age.s=beat(t,14.4,15.2);const lift=Math.max(n?beat(t,15.8,17.4):0,beat(act,.3,1));held.dy=-.7+1.9*lift;held.visible=lift>.02;
   // Flip the calendar from 2005 to 2007: the cloud drifts away, the celebration starts.
   const flip=Math.max(n?beat(t,20.3,21.4):0,act);y05.flip=-2.9*flip;
   storm.dx=-1.3*flip;storm.dy=.5*flip;storm.scale=1-.8*flip;stormRain.scale=1-flip;
   const party=Math.max(n?beat(t,21.2,22.2):0,beat(act,.5,1));
   cap.armL.rot=-.12-2.55*lift-.25*wave(t,17.4,46,1.3)*lift;cap.armR.rot=.12+2.55*lift+.25*wave(t,17.4,46,1.4)*lift;
   mates.forEach((m,i)=>{const up=Math.max(party,n?beat(t,12.6+i*.3,13.2+i*.3):0);m.armL.rot=-.12-2.4*up-.3*wave(t,13.2,46,1.5+i*.1);m.armR.rot=.12+2.4*up+.3*wave(t,13.2,46,1.4+i*.1);});
   livs.forEach((l,i)=>{l.armR.rot=.12+1.3*beat(t,9.6+i*.3,10.2+i*.3)-1.3*beat(t,11.6,12.2);});
   fw.forEach((f,i)=>{const a=Math.max(n?beat(t,21.6+i*.5,22.6+i*.5):0,beat(act,.55+i*.1,.85+i*.05))*(n?1-beat(t,26,27):1)+(n?beat(t,38.6+i*.4,39.6+i*.4):0);f.scale=Math.min(1,a);f.rot=a*1.2+(t>22?(t-22)*.15:0);});
   conf.dy=-1+party;conf.visible=party>.02;
   // Five European Cups in all: 1989, 1990, 1994, 2003 and 2007.
   const yrs=[28.3,29.7,31.1,32.5,33.9];cups.forEach((c,i)=>{c.scale=beat(t,yrs[i],yrs[i]+.7);c.dy=.12*pulse(t,yrs[i]+.3,yrs[i]+1.1);});
   // The worst night did not stop him: a rainbow where the cloud was. Not the end of his story.
   bow.scale=beat(t,35.2,36.6);keep.scale=beat(t,41.2,42.3);
   return n?.35*beat(t,2,3.4)-1*beat(t,7.8,8.8)+.65*beat(t,13.6,14.6)-.6*beat(t,19.2,20.4)+.9*beat(t,26.8,28)-.9*beat(t,34.8,35.8)+.3*beat(t,41,42):(act>0?-.2:-.3);
  };
 }};

/* ───────────── 6 · Not everyone cheered ───────────── */
const three:SpreadDef={id:'three',rest:21.9,
 left:k=>{pitch(k,-5,0,true);chalk(k,`M-5 ${Z(-.9)} L0 ${Z(-.9)}`);chalk(k,ell(0,Z(.1),1.1,1.1));
  k.text('SAN SIRO',-2.5,Z(2.52),.5,INK.yellow,{max:3.4});k.text('MAY 2009',-2.5,Z(2.86),.2,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,true);chalk(k,`M0 ${Z(-.9)} L5 ${Z(-.9)}`);chalk(k,ell(0,Z(.1),1.1,1.1));
  k.text('NUMBER 3 · RETIRED',2.5,Z(2.6),.3,INK.white,{max:4.2});for(let i=0;i<14;i++){const x=.5+i*.3;k.fill(rect(x,Z(2.8),.15,.07),i%2?MB:MR);}},
 build:B=>{
  const bd=B.vfold({key:'maldini-t-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,MILAN_FANS,2);lightRig(k,1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'maldini-t-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,MILAN_FANS,7);lightRig(k,1.3,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const moonP=bd.add(moon('maldini-t-moon',.3),'L',3.6,2.2,{out:.015}),starsP=bd.add(S.stars('maldini-t-stars',2.6,.7,10),'R',.6,2.2,{out:.02});
  const twin=[bd.add(S.stars('maldini-t-star1',.36,.36,1),'L',1.7,2.35,{out:.03}),bd.add(S.stars('maldini-t-star2',.36,.36,1),'L',1.15,2.45,{out:.03})];
  const fw=[bd.add(S.firework('maldini-t-fw1',.42,MR),'R',1.4,1.6,{out:.03}),bd.add(S.firework('maldini-t-fw2',.38,INK.white),'L',2.6,1.7,{out:.03})];
  const scarves=bd.add(S.bunting('maldini-t-bunt',3.6,.42,[MR,MB,INK.white]),'R',.4,2.5,{out:.02});
  const grey=bd.add(stormCloud('maldini-t-grey',1.1,.5,STORM2),'R',4.05,1.35,{out:.032});
  const loveBan=bd.add(S.banner('maldini-t-love',3,.42,'PEOPLE WHO LOVE YOU',MR),'L',2.3,2.5,{out:.022});
  const lk=B.stand(lockers('maldini-t-lockers'),-3.85,-1.05,{layer:1});
  const door=lk.flap(lockerDoor('maldini-t-door'),-.28,.05,{anchor:'bl',axis:'y',z:.014});
  const lock=lk.add(padlock('maldini-t-lock'),.14,.66,{z:.03});
  const board=B.stand(S.scoreboard('maldini-t-board',1.4,1.1,'2009'),-1.45,-1.3,{layer:1,s:0});
  const noCard=board.add(card('maldini-t-no3',1.14,.5,['NO. 3'],MR,INK.white),0,.3,{z:.012});
  const paolo=kp(B,'maldini-t-paolo',-2.65,.35,1.44,{kit:MILAN,...PAOLO,adult:true,armband:true,face:'smile',layer:3});
  const frame=B.stand(photoFrame('maldini-t-frame'),-4.1,1.3,{layer:3,s:0});
  const fcard=frame.add(card('maldini-t-names',1.4,.3,['CESARE · MARISA'],INK.white),0,-.02,{z:.02});
  const sons=[B.person('maldini-t-son1',-1.6,1.4,.95,{shirt:'casual',hair:'short',skin:SKIN[0],face:'smile',layer:3}),B.person('maldini-t-son2',-.8,1.7,.88,{shirt:'fan',hair:'long',hairColor:'#4a3528',skin:SKIN[0],face:'smile',layer:3})];
  const heart=paolo.body.add(S.bubble('maldini-t-heart',.55,.46,'heart'),.55,1.72,{z:-.02});
  const trib=B.stand(tribune('maldini-t-tribune'),2.55,-1.3,{layer:1});
  const protest=trib.add(card('maldini-t-protest',1.0,.42,[''],'#6f7a8e'),1.15,1.0,{z:.03});
  const beams=[B.stand(S.beam('maldini-t-beam1',1.2,2.3),1.35,-1.0,{layer:1,tab:false,s:0}),B.stand(S.beam('maldini-t-beam2',1.2,2.3),3.85,-1.0,{layer:1,tab:false,s:0})];
  const mast=B.stand(pole('maldini-t-pole',3.1),2.4,-.7,{layer:2});
  const flag=mast.add(shirtTag('maldini-t-shirt',.95,MILAN,'3','MALDINI'),.56,1.3,{anchor:'top',z:.02});
  const fans=[B.person('maldini-t-fan1',1.25,1.45,1.1,{shirt:'fan',hair:'cap',adult:true,skin:SKIN[1],face:'open',layer:3}),B.person('maldini-t-fan2',2.55,1.8,1,{shirt:'fan',hair:'bun',skin:SKIN[2],face:'open',layer:3}),B.person('maldini-t-fan3',4.2,1.35,1.1,{shirt:'casual',hair:'curly',adult:true,skin:SKIN[3],face:'shy',layer:3})];
  return (b:Beat)=>{const t=b.t,act=b.action,n=b.narrated;
   moonP.dy=-.3*beat(t,0,3);starsP.dy=.03*wave(t,0,46,.4);
   // May 2009: his last home game at San Siro.
   const on=beat(act,0,.1);paolo.body.s=Math.max(beat(t,2.1,3.1),on);board.s=beat(t,3.2,4.2);
   const wv=beat(t,4.2,4.9)-beat(t,7.4,8);
   // The standing ovation.
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,8.5+i*.3,9.4+i*.3),on);});
   const ov=beat(t,9.4,10.1);[fans[0],fans[1]].forEach((f,i)=>{f.armL.rot=-.12-2.4*ov-.3*wave(t,10.1,46,1.5+i*.2);f.armR.rot=.12+2.4*ov+.3*wave(t,10.1,46,1.4+i*.2);});
   beams.forEach((bm,i)=>{bm.s=Math.max(beat(t,9+i*.3,10+i*.3)-(n?beat(t,12,13):0),n?beat(t,23+i*.3,24+i*.3):0,beat(act,.4,1));});
   // A group of ultras protested: a blank grey banner and a grey cloud at one end of the stand.
   protest.scale=beat(t,12.4,13.2);grey.scale=beat(t,13,14)-.7*beat(t,42,43.4);fans[2].body.rot=0;
   // Not everyone cheered; Paolo still waves calmly.
   paolo.armR.rot=.12+2.2*wv+.35*wave(t,4.9,7.4,1.3)+1.2*beat(t,19.2,19.8)-1.2*beat(t,21.3,21.9)+.2*wave(t,19.8,21.3,1.2)+2*beat(t,43,43.6);
   // Raise the number three shirt above the stand.
   const raise=Math.max(n?beat(t,22.6,24.6):0,act);flag.dy=1.72*raise;flag.rot=.06*wave(t,24.6,46,.5)*raise;scarves.dy=.04*wave(t,23,46,1.1);
   // Retired: the locker closes and locks; NO. 3.
   door.flip=-1.9+1.9*beat(t,25,26);lock.scale=beat(t,26.1,26.7);noCard.scale=beat(t,26.4,27.2);
   fw.forEach((f,i)=>{const a=beat(t,24.8+i*.5,25.8+i*.5)-beat(t,28.4,29.2);f.scale=Math.max(0,a);f.rot=a*1.2;});
   // 2016: his father Cesare and his mother Marisa died. A photo frame and two bright stars.
   frame.s=beat(t,29.4,30.4);fcard.scale=beat(t,30.2,30.9);twin.forEach((s,i)=>{s.scale=beat(t,33.4+i*1.4,34.4+i*1.4);s.rot=.1*wave(t,34.4,46,.3);});
   paolo.armL.rot=-.12-1.2*beat(t,31,31.8)-2*beat(t,43,43.6)-.25*wave(t,43.6,46.4,1.3);
   // Losing a parent is sad at any age: his sons come close.
   sons.forEach((s,i)=>{s.body.s=beat(t,38.1+i*.5,39+i*.5);s.armL.rot=-.12-1.8*beat(t,39.4+i*.3,40+i*.3)-.6*beat(t,43,43.6);s.armR.rot=.12+.6*beat(t,43,43.6);});
   heart.dy=-.5+.5*beat(t,39.8,40.5);heart.visible=t>39.7;
   // Not everyone will cheer, and that's okay. Hold on to the people who love you.
   loveBan.scale=beat(t,41,42.1);
   return n?-.6*beat(t,2,3.2)+1.2*beat(t,8.2,9.2)-.6*beat(t,12,13)+.3*beat(t,21.6,22.6)-.3*beat(t,26.8,27.8)-.55*beat(t,28.4,29.4)+.55*beat(t,40.8,41.8):(act>0?.6:0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={family,debut,read,line,europe,three};
