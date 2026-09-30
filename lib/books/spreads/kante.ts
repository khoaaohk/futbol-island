/**
 * The six N’Golo Kanté pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/kante/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: his father is remembered by a star rising in the evening sky while the family
 * holds together; rejection is a row of closed academy gates and cards that turn over to "NO". Kits are plain colours, no crests.
 */
import {INK,type Kit,type PlateSpec,personSpec,poly,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='kante-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const NG={skin:'#6b4430',hair:'short' as const,hairColor:'#1d1512'};
const FAM={skin:'#6b4430',hairColor:'#1d1512'};
/** Both arms up (the engine swaps in the grin face). */
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const showPart=(q:Part,a:number)=>{q.scale=a;q.visible=a>.02;};

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.035,c:string=INK.white,seg=.14){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);line(k,x0+(x1-x0)*a,y0+(y1-y0)*a,x0+(x1-x0)*b,y0+(y1-y0)*b,w,c);}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function asphalt(k:Kit,x0:number,x1:number,tone='#a7a3a6'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,'#5d5f6c',.05,(x,y)=>.18+.1*Math.sin(x*2.1+y*1.3));}
function floorboards(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#d9b98a');k.dots(p,INK.brown,.06,.12);for(let y=.4;y<PAGE_D;y+=.4)line(k,x0,y,x1,y,.012,'#b08a5c');}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function titles(k:Kit,x:number,big:string,small:string,c:string=INK.navy,sc:string=INK.navy,size=.42){k.text(big,x,Z(2.62),size,c,{max:4.2});k.text(small,x,Z(2.9),.15,sc,{weight:800,max:4.3});}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.45,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
/** Paris roofs: zinc mansards, chimneys and one lattice tower. */
function parisRoofs(k:Kit,w:number,y:number){for(let i=0;i<9;i++){const x=i*w/9,h=.42+((i*5)%3)*.12,b=rect(x,y-h,w/9-.03,h);k.fill(b,['#efe0c0','#e6d2ae','#f3e6cb'][i%3]);k.key(b,.01);
  const roof=poly([[x-.01,y-h],[x+.06,y-h-.14],[x+w/9-.1,y-h-.14],[x+w/9-.02,y-h]]);k.fill(roof,'#7d8aa3');k.key(roof,.01);
  for(let c=0;c<2;c++)k.fill(rect(x+.06+c*.18,y-h+.1,.08,.1),INK.sky);}
 const tx=w*.72,ty=y-.3;const tw=poly([[tx-.32,ty],[tx-.05,ty-1.55],[tx+.05,ty-1.55],[tx+.32,ty]]);k.fill(tw,'#a07a5a');k.hatch(tw,INK.navy,.05,.78,.008);k.hatch(tw,INK.navy,.05,-.78,.008);k.key(tw,.012);
 k.fill(`M${tx-.2} ${ty} Q${tx} ${ty-.3} ${tx+.2} ${ty} Z`,INK.sky2);k.fill(rect(tx-.24,ty-.6,.48,.05),'#a07a5a');k.fill(rect(tx-.015,ty-1.75,.03,.2),INK.navy);}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.86,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const star=(key:string,r:number,c:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const p=poly(Array.from({length:10},(_,i)=>[r+Math.cos(i*.628-1.57)*(i%2?r*.42:r),r+Math.sin(i*.628-1.57)*(i%2?r*.42:r)]));k.fill(p,c);k.dots(p,INK.orange,.025,.3);k.key(p,.012);},{rim:.016});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
const bubble=(key:string,w:number,h:number,text:string,c:string=INK.white)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.36} ${h*.74} L${w*.2} ${h} L${w*.24} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,c);k.dots(p,INK.sky,.035,.15);k.key(p,.013);k.text(text,w/2,h*.5,h*.3,INK.navy,{max:w*.84,weight:900});},{rim:.016});
/** A club football shirt (no crest): body, sleeves, collar and a stripe. */
const jersey=(key:string,w:number,h:number,base:string,stripe:string)=>sp(key,w,h,k=>{const p=poly([[w*.3,0],[w*.4,h*.06],[w*.6,h*.06],[w*.7,0],[w,h*.18],[w*.86,h*.42],[w*.76,h*.36],[w*.76,h],[w*.24,h],[w*.24,h*.36],[w*.14,h*.42],[0,h*.18]]);
 k.fill(p,base);k.fill(rect(w*.45,h*.06,w*.1,h*.94),stripe);k.dots(p,INK.navy,.03,.15);k.key(p,.014);k.key(`M${w*.4} ${h*.06} Q${w*.5} ${h*.16} ${w*.6} ${h*.06}`,.014);},{rim:.018});
/** A walk-in academy gate: stone posts, an arch with the word ACADEMY, bars. */
const academyGate=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.3} Q${w/2} ${h*.12} .08 ${h*.3} Z`;k.fill(arch,c);k.key(arch,.012);k.text('ACADEMY',w/2,h*.24,h*.085,INK.yellow,{max:w*.6,weight:900});
 const bars=6;for(let i=1;i<bars;i++){const x=.16+(w-.32)*i/bars;k.keyFill(rect(x-.015,h*.32,.03,h*.68),INK.navy);}k.keyFill(rect(.16,h*.55,w-.32,.03),INK.navy);});
/** The front of a trial card (turned over it becomes a NO card). */
const trialCard=(key:string,w:number,h:number,age:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.sky2);k.dots(b,INK.blue,.035,.25);k.key(b,.014);k.fill(rect(0,0,w,h*.24),INK.navy);k.text('TRIAL',w/2,h*.17,h*.12,INK.yellow,{weight:900,max:w*.8});
 k.fill(ell(w/2,h*.46,w*.16,w*.16),INK.white);k.key(ell(w/2,h*.46,w*.16,w*.16),.012);k.keyFill(ell(w/2,h*.46,w*.05,w*.05));k.text(age,w/2,h*.84,h*.15,INK.navy,{weight:900,max:w*.84});},{rim:.018});
const noCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.pink);k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.text('NO',w/2,h*.62,h*.4,INK.white,{weight:900,max:w*.8});k.key(`M${w*.2} ${h*.8} L${w*.8} ${h*.8}`,.02,INK.white);},{rim:.018});
/** A row of taller academy players, painted on one plate (they stand behind the gates on the backdrop). */
const academyRow=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=5;for(let i=0;i<n;i++){const x=w*(i+.5)/n,s=h*(.86+((i*3)%3)*.07),y=h;const c=[INK.red,INK.blue,INK.green,INK.orange,INK.red][i];
 k.fill(ell(x,y-s*.88,s*.1,s*.1),['#f1b88f','#b27650','#d99a6c','#7f5138','#f1b88f'][i]);k.fill(poly([[x-s*.14,y-s*.76],[x+s*.14,y-s*.76],[x+s*.12,y-s*.36],[x-s*.12,y-s*.36]]),c);k.fill(rect(x-s*.1,y-s*.36,s*.08,s*.36),INK.navy);k.fill(rect(x+s*.02,y-s*.36,s*.08,s*.36),INK.navy);k.key(poly([[x-s*.14,y-s*.76],[x+s*.14,y-s*.76],[x+s*.12,y-s*.36],[x-s*.12,y-s*.36]]),.01);}},{rim:.014});
/** A measuring post with a small star at the height of a small boy. */
const heightChart=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.04,(x,y)=>.1+y/h*.3);k.key(b,.013);
 for(let i=1;i<14;i++){const y=h-i*h/14;k.key(`M0 ${y} L${w*(i%2?.3:.55)} ${y}`,.012);}
 const bands=[INK.pink,INK.orange,INK.yellow,INK.grass,INK.sky];bands.forEach((c,i)=>k.fill(rect(w*.62,h-(i+1)*h/5,w*.3,h/5-.02),c,.7));});
/** The division ladder: seven rungs, the bottom one the second team, the top one the top division. A slot runs up its middle. */
const ladder=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [.02,w-.1]){const r=rect(x,0,.08,h);k.fill(r,INK.wood);k.key(r,.01);}
 for(let i=0;i<7;i++){const y=h-.22-i*(h-.44)/6,r=rect(.08,y-.035,w-.16,.07);k.fill(r,i===6?INK.gold:i===5?INK.sky:'#d7a36f');k.key(r,.01);}
 k.key(`M${w/2} .2 L${w/2} ${h-.1}`,.05,'#3f3424');k.key(`M${w/2} .2 L${w/2} ${h-.1}`,.025,'#15100a');
 k.text('TOP',w*.25,.16,.1,INK.navy,{weight:900});},{rim:.02});
/** A little brad-free player token that slides in the ladder slot. */
const tokenSpec=(key:string)=>personSpec(K+key,.62,{shirt:'bib',...NG,face:'grin'});
const book=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const L=poly([[0,h*.1],[w*.5,h*.18],[w*.5,h],[0,h*.92]]),R=poly([[w,h*.1],[w*.5,h*.18],[w*.5,h],[w,h*.92]]);k.fill(L,INK.white);k.fill(R,INK.white);k.key(L,.012);k.key(R,.012);
 for(let i=0;i<4;i++){k.key(`M${w*.08} ${h*(.34+i*.14)} L${w*.42} ${h*(.38+i*.14)}`,.01,INK.grey);}k.text('1+2=3',w*.75,h*.5,h*.14,INK.blue,{weight:800,max:w*.4});k.fill(rect(0,0,w,h*.08),INK.navy);k.text(label,w/2,h*.07,h*.07,INK.yellow,{weight:900,max:w*.9});},{rim:.016});
const desk=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [.06,.88])k.keyFill(rect(w*x,h*.25,w*.06,h*.75),INK.brown);const top=rect(0,h*.12,w,h*.16);k.fill(top,INK.wood);k.key(top,.012);k.fill(rect(w*.1,h*.62,w*.8,h*.06),INK.wood);});
/** Flag pole with a printed slot; the flag slides up it. */
const pole=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=rect(w*.35,0,w*.3,h);k.fill(p,INK.grey);k.key(p,.01);k.key(`M${w/2} .1 L${w/2} ${h-.1}`,.02,'#15100a');k.circle(w/2,.05,w*.3,INK.gold);k.fill(rect(0,h-.1,w,.1),INK.navy);},{rim:.012});
const flag=(key:string,w:number,h:number,lines:string[],c:string,ink:string=INK.white)=>sp(key,w,h,k=>{const p=poly([[0,0],[w,h*.05],[w*.9,h*.5],[w,h*.95],[0,h]]);k.fill(p,c);k.dots(p,INK.navy,.035,.2);k.key(p,.012);lines.forEach((l,i)=>k.text(l,w*.46,h*(.42+i*.36),h*.26,ink,{weight:900,max:w*.8}));},{rim:.016});
/** A substitution board. */
const subBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.45,h*.55,w*.1,h*.45),INK.navy);const b=rect(0,0,w,h*.58);k.fill(b,'#1b1f2b');k.key(b,.014);k.text('IN',w*.2,h*.36,h*.18,'#7cf29a',{weight:900});k.text('OUT',w*.72,h*.36,h*.18,INK.red,{weight:900});k.fill(ell(w*.2,h*.46,w*.06,h*.03),'#7cf29a');},{rim:.016});
const eyeBubble=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.64} ${h*.74} L${w*.8} ${h} L${w*.5} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,INK.white);k.key(p,.013);
 const e=`M${w*.28} ${h*.36} Q${w*.5} ${h*.1} ${w*.72} ${h*.36} Q${w*.5} ${h*.62} ${w*.28} ${h*.36} Z`;k.fill(e,INK.sky2);k.key(e,.012);k.fill(ell(w*.5,h*.36,h*.1,h*.1),INK.navy);k.circle(w*.53,h*.33,h*.03,INK.white);},{rim:.016});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.1){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A small club near Paris (suresnes) ───────────── */
const suresnes:SpreadDef={id:'suresnes',rest:23.3,
 left:k=>{asphalt(k,-5,0,'#c9c2b8');footprints(k,-4.4,Z(1.5),-.3,Z(1.2),14,INK.navy);titles(k,-2.5,'PARIS · 1991','HIS PARENTS HAD MOVED TO FRANCE FROM MALI',INK.blue);},
 right:k=>{pitch(k,0,5);line(k,0,Z(-1.9),5,Z(-1.9),.05);box(k,2.0,Z(-1.9),2.4,.8,.05);ring(k,0,Z(.3),.8,.05);titles(k,2.5,'JS SURESNES','A SMALL CLUB NEAR PARIS · AGE 8',INK.navy);},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#f6d9b8',INK.orange,y=>.5-y/3*.5);parisRoofs(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#c9c2b8');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);for(let i=0;i<9;i++){const x=.25+i*.5;k.fill(ell(x,1.95,.3,.34),i%2?INK.leaf:INK.green);k.key(ell(x,1.95,.3,.34),.01);}
    for(let i=0;i<18;i++)k.keyFill(rect(.05+i*.25,2.05,.03,.4),INK.white);k.fill(rect(0,2.12,4.5,.04),INK.white);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.3),'R',3.8,1.3,{out:.012});
  const dusk=bd.add(star('s-star',.22),'L',1.2,1.4,{out:.03});
  const birds=bd.add(S.birds(K+'s-birds',.9,.35),'R',1.2,2.2,{out:.02});
  // Left page: Paris, 1991, a family from Mali.
  const y91=B.stand(S.flipCard(K+'s-1991',.9,.34,'1991',INK.pink),-1.1,-1.55,{layer:1,s:0});
  const map=bd.add(lineCard('s-map',1.5,.56,['MALI → FRANCE'],INK.yellow),'L',3.3,1.25,{out:.04});
  const plane=bd.add(S.plane(K+'s-plane',.36,.18),'L',3.85,1.9,{out:.05});
  const dad=B.person(K+'s-dad',-3.1,.1,1.62,{shirt:'casual',hair:'short',...FAM,adult:true,face:'smile',layer:2});
  const mum=B.person(K+'s-mum',-2.1,.3,1.5,{shirt:'coach',hair:'bun',...FAM,adult:true,face:'smile',layer:2});
  const baby=B.person(K+'s-baby',-2.6,1.05,.62,{shirt:'bib',...NG,face:'grin',layer:3});
  const sibs=[[-4.3,.9,'long'],[-1.1,1.2,'curly']].map(([x,z,hr],i)=>B.person(K+`s-sib${i}`,x as number,z as number,.86,{shirt:i?'fan':'casual',hair:hr as 'short',...FAM,face:'smile',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`s-h${i}`,.24),-3.8+i*1.2,2.05,{layer:3,s:0,tab:false}));
  // Right page: the small club, the shirt, ten years of training.
  const sign=B.stand(S.sign(K+'s-sign',1.5,1.2,'JS SURESNES',INK.white),1.2,-1.85,{layer:1,s:0});
  const goal=B.stand(S.goal(K+'s-goal',1.5,.8),3.0,-.85,{layer:1,s:0});
  const coach=B.person(K+'s-coach',4.35,-.2,1.45,{shirt:'coach',hair:'short',hairColor:'#3b2e3f',skin:'#d99a6c',adult:true,face:'smile',layer:2});
  const boy=B.person(K+'s-boy',1.7,.4,1.0,{shirt:'casual',...NG,legs:'kick',face:'smile',layer:2});
  const club=B.person(K+'s-club',1.7,.4,1.0,{shirt:'fan',...NG,legs:'kick',face:'grin',layer:2});
  const shirt=B.stand(jersey('s-shirt',.62,.56,'#6fb6e2','#fbf5e6'),1.7,.55,{layer:2,tab:false,s:0});
  const mates=[[3.0,.9,'#d99a6c','curly'],[4.1,1.25,'#f1b88f','short']].map(([x,z,sk,hr],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.0,{shirt:'fan',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const years=B.stand(S.flipCard(K+'s-years',1.6,.32,'ABOUT 10 YEARS',INK.yellow,INK.navy),2.4,1.95,{layer:3,s:0});
  const ball=ballPair(B,'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.3):b.t;
   // Born in Paris in 1991.
   y91.s=beat(t,2.8,3.6);baby.body.s=beat(t,3.6,4.4)*(1-beat(t,9.6,10.4));
   // His parents had moved from Mali: the map card and its little plane.
   dad.body.s=beat(t,6.8,7.6);mum.body.s=beat(t,7.2,8);showPart(map,beat(t,7.4,8.2));showPart(plane,beat(t,7.8,8.2));plane.dx=1.0*beat(t,8.2,9.6);
   // Age eight: JS Suresnes.
   sign.s=beat(t,10,10.8);goal.s=beat(t,10.6,11.4);boy.body.s=beat(t,11.4,12.2);coach.body.s=beat(t,12.4,13.2);coach.armR.rot=.12+1.4*beat(t,13.4,14)-1.4*beat(t,14.8,15.4);
   // When he was eleven, his father died: the family holds together; a star rises in the evening sky.
   const gone=beat(t,15.8,17.4);dad.body.s*=1-gone;dusk.dy=.9*gone;dusk.scale=beat(t,15.6,17);dusk.visible=dusk.scale>.02;sun.dy=-.6*beat(t,15.4,18);
   sibs.forEach((p,i)=>{p.body.s=beat(t,18.8+i*.5,19.6+i*.5);});mum.armL.rot=-.12-.9*beat(t,19.4,20.2);mum.armR.rot=.12+.9*beat(t,19.6,20.4);
   hearts.forEach((h,i)=>{h.s=beat(t,20.6+i*.5,21.3+i*.5);h.dy=.05*wave(t,21.5,30,.5+i*.1);});
   // Pull on the club shirt: it drops over his head and he is in the club colours.
   const pull=Math.max(beat(t,23.7,25.2),manual?beat(act,0,.8):0);shirt.s=pull>0&&pull<.9?1:0;shirt.dy=1.2*(1-pull);
   const swap=pull>.9?1:0;boy.body.visible=swap<1;club.body.s=boy.body.s*swap;boy.body.s*=1-swap;
   cheer(club,Math.max(beat(t,25.4,26)*(1-beat(t,26.6,27.2)),manual?beat(act,.85,1):0));
   // He kept training, for about ten years.
   years.s=beat(t,26.4,27.2);mates.forEach((m,i)=>{m.body.s=beat(t,26+i*.4,26.8+i*.4);});
   let [bx,bz]=track(t,[[26,2.1,.5],[27.6,2.1,.5],[28.4,3.1,1.0],[29.2,3.1,1.0],[30,4.0,1.3],[30.8,4.0,1.3],[31.6,2.2,.55]]);if(manual){bx=2.1;bz=.5;}
   ball(bx,bz,.05*Math.abs(Math.sin(t*4)),t>25.8||manual);club.leg!.rot=-1*maxOf([27.5,31.5].map(a=>pulse(t,a-.3,a+.3)));
   mates.forEach((m,i)=>cheer(m,beat(t,32.6+i*.3,33.2+i*.3)));cheer(club,Math.max(beat(t,33.4,34),manual?beat(act,.85,1):0));coach.armL.rot=-.12-1.4*beat(t,33.8,34.4);
   birds.dx=.6*beat(t,0,36);
   return b.narrated?-.45*beat(t,2.2,3.2)+.45*beat(t,9.6,10.4)+.45*beat(t,10.4,11.2)-.45*beat(t,15.2,16)-.45*beat(t,16,16.8)+.45*beat(t,23,23.8)+.45*beat(t,23.8,24.6)-.45*beat(t,30.6,31.4):0;
  };
 }};

/* ───────────── 2 · The answer was always no (trials) ───────────── */
const trials:SpreadDef={id:'trials',rest:23.3,
 left:k=>{asphalt(k,-5,0,'#b9b3a8');footprints(k,-4.6,Z(1.0),-.4,Z(.9),14,INK.navy);titles(k,-2.5,'TRIALS AT 12, 14 AND 16','THE ACADEMIES OF PROFESSIONAL CLUBS',INK.red,INK.navy,.36);},
 right:k=>{pitch(k,0,5,'#9fcb7a','#79ab5e');ring(k,0,Z(-.4),.8,.05);titles(k,2.5,'SMALL · NEVER SHOWED OFF','HIS COACH AT SURESNES',INK.navy,INK.navy,.34);},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#dfe3ea',INK.navy,y=>.22-y*.04);for(let i=0;i<3;i++){const x=.3+i*1.45,b=rect(x,1.0,1.2,1.45);k.fill(b,'#c9ced8');k.dots(b,INK.navy,.05,.2);k.key(b,.012);k.fill(poly([[x-.08,1.0],[x+.6,.62],[x+1.28,1.0]]),INK.navy);}k.fill(rect(0,2.45,4.5,.55),'#b9b3a8');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);for(let i=0;i<18;i++)k.keyFill(rect(.05+i*.25,1.95,.03,.5),INK.white);k.fill(rect(0,2.05,4.5,.04),INK.white);k.fill(rect(0,2.45,4.5,.55),'#9fcb7a');}},-3.05,1.22);
  const rain=bd.add(S.cloud(K+'t-cloud',1.1,.5),'L',1.5,2.15,{out:.03});
  const row=bd.add(academyRow('t-row',2.0,.62),'L',1.2,1.55,{out:.04});
  const better=bd.add(lineCard('t-better',2.0,.5,['PLAYERS LIKE HIM, OR BETTER'],INK.white),'L',3.2,1.0,{out:.05});
  const sun=bd.add(S.sun(K+'t-sun',.3),'R',3.9,.9,{out:.012});
  const keep=bd.add(lineCard('t-keep',1.7,.46,['KEEP WORKING'],INK.yellow),'R',1.5,1.3,{out:.05});
  // Left page: three academy gates, three ages.
  const gates=[[-3.9,-.6,INK.red],[-2.5,-1.2,INK.blue],[-1.0,-1.6,INK.green]].map(([x,z,c],i)=>B.stand(academyGate(`t-gate${i}`,1.3,1.25,c as string),x as number,z as number,{layer:1,s:0}));
  const nos=gates.map((g,i)=>g.add(stamp(`t-no${i}`,.6,.3,'NO'),0,.6,{z:.02}));
  const ages=[.95,1.05,1.15].map((h,i)=>B.person(K+`t-ng${i}`,[-3.9,-2.5,-1.0][i],.35,h,{shirt:'fan',...NG,face:'smile',layer:2}));
  const ageCards=['AGE 12','AGE 14','AGE 16'].map((l,i)=>B.stand(S.flipCard(K+`t-age${i}`,.8,.3,l,INK.white,INK.navy),[-3.9,-2.5,-1.0][i],1.45,{layer:3,s:0}));
  // Right page: the coach, the height post, the three trial cards.
  const coach=B.person(K+'t-coach',3.95,.1,1.5,{shirt:'coach',hair:'short',hairColor:'#3b2e3f',skin:'#d99a6c',adult:true,face:'smile',layer:2});
  const chart=B.stand(heightChart('t-chart',.4,1.6),3.1,-1.35,{layer:1,s:0});
  const small=B.person(K+'t-small',2.45,-.75,.95,{shirt:'fan',...NG,face:'shy',layer:2});
  const quote=B.stand(lineCard('t-quote',1.5,.56,['SMALL','NEVER SHOWED OFF'],INK.white),4.1,.95,{layer:3,s:0});
  const cx=[.75,1.75,2.75];
  const fronts=['AGE 12','AGE 14','AGE 16'].map((l,i)=>B.stand(trialCard(`t-card${i}`,.78,.95,l),cx[i],1.55,{layer:3,s:0}));
  const backs=cx.map((x,i)=>B.stand(noCard(`t-nocard${i}`,.78,.95),x,1.55,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'t-ball',.1),2.0,-.55,{layer:2,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.3):b.t;
   // At twelve, fourteen and sixteen: trials at three academies.
   gates.forEach((g,i)=>{g.s=beat(t,2.6+i*.5,3.4+i*.5);});ages.forEach((p,i)=>{p.body.s=beat(t,4+i*1.4,4.8+i*1.4);});ageCards.forEach((c,i)=>{c.s=beat(t,4.4+i*1.4,5.2+i*1.4);});
   // The answer was always no.
   nos.forEach((n,i)=>showPart(n,beat(t,9.6+i*.5,10.1+i*.5)));ages.forEach((p,i)=>{p.body.yaw=-.3*pulse(t,10+i*.5,12+i*.5);});
   const rn=beat(t,9.6,10.6)*(1-beat(t,27.8,29));rain.scale=rn;rain.visible=rn>.02;rain.dx=.2*wave(t,10.6,27,.3);
   // They already had players like him, or better.
   row.scale=beat(t,12.8,13.8);row.visible=row.scale>.02;better.scale=beat(t,13.8,14.6)*(1-beat(t,22,23));better.visible=better.scale>.02;
   // His coach: small, never showed off.
   coach.body.s=beat(t,16.6,17.4);chart.s=beat(t,17.2,18);small.body.s=beat(t,17.8,18.6);quote.s=beat(t,19.4,20.2);coach.armR.rot=.12+1.3*beat(t,18.6,19.2)-1.3*beat(t,21.6,22.2);
   // Turn over the three cards: each card turns edge-on, and the NO side turns into view.
   fronts.forEach((f,i)=>{f.s=beat(t,21.4+i*.3,22+i*.3);});
   cx.forEach((_,i)=>{const n=manual?clamp01(act*3-i):beat(t,23.7+i*.6,24.3+i*.6);const a=clamp01(n*2),c=clamp01(n*2-1);
    fronts[i].yaw=Math.PI/2*a;fronts[i].visible=a<.98;backs[i].s=c>0?1:0;backs[i].yaw=-Math.PI/2*(1-c);});
   // He was honest with himself, and kept working: the ball, the sun, KEEP WORKING.
   small.body.yaw=-.3*pulse(t,25.8,28);ball.s=beat(t,28.6,29.2);ball.dy=.35*Math.abs(Math.sin((t-28.6)*3.2))*beat(t,29,29.6);small.armR.rot=.12+.8*wave(t,29,36,.8);
   sun.dy=.6*beat(t,28.4,31);keep.scale=beat(t,29.4,30.2);keep.visible=keep.scale>.02;
   cheer(small,beat(t,34,34.6));coach.armL.rot=-.12-1.5*beat(t,34.4,35);
   return b.narrated?-.45*beat(t,2.2,3.2)+.45*beat(t,16.2,17)+.45*beat(t,17,17.8)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 3 · Six divisions from the top (boulogne) ───────────── */
const boulogne:SpreadDef={id:'boulogne',rest:17.1,
 left:k=>{floorboards(k,-5,0);footprints(k,-4.6,Z(-.4),-3.0,Z(.2),6,INK.navy);titles(k,-2.5,'BOULOGNE · AGE 19','SECOND TEAM · SIX DIVISIONS BELOW THE TOP',INK.blue);},
 right:k=>{pitch(k,0,5);line(k,0,Z(-1.9),5,Z(-1.9),.05);ring(k,0,Z(.3),.8,.05);titles(k,2.5,'FIRST GAME · MAY 2012','THE LAST ELEVEN MINUTES',INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);sea(k,4.5,1.55,.5);for(let i=0;i<8;i++){const x=.1+i*.55,h=.35+((i*3)%4)*.1,b=rect(x,2.05-h,.5,h);k.fill(b,['#efe0c0','#f0b9a0','#bfd6c9'][i%3]);k.key(b,.01);k.fill(poly([[x-.02,2.05-h],[x+.25,2.05-h-.15],[x+.52,2.05-h]]),INK.red);}k.fill(rect(0,2.05,4.5,.95),'#d9b98a');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.55,2.45,[INK.red,INK.white,INK.navy],2);lightRig(k,.6,.6);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const gull=bd.add(S.birds(K+'b-gulls',.9,.35),'L',1.0,2.2,{out:.02});
  const board=bd.add(S.scoreboard(K+'b-board',1.3,1.05,'MAY 2012'),'R',3.1,1.25,{out:.03});
  const mins=bd.add(lineCard('b-11',1.05,.42,['LAST 11 MIN'],INK.yellow),'R',3.1,1.62,{out:.05});
  // Left page: arriving at Boulogne, the second team, studying.
  const sign=B.stand(S.sign(K+'b-sign',1.4,1.15,'BOULOGNE',INK.white),-1.2,-1.85,{layer:1,s:0});
  const ng=B.person(K+'b-ng',-4.3,.1,1.2,{shirt:'casual',...NG,face:'smile',layer:2,holdR:'suitcase'});
  const age=B.stand(S.flipCard(K+'b-19',.9,.32,'AGE 19',INK.pink),-4.2,1.35,{layer:3,s:0});
  const team2=B.stand(lineCard('b-team2',1.4,.56,['SECOND TEAM','6 DIVISIONS DOWN'],INK.white),-2.9,-1.3,{layer:1,s:0});
  const tbl=B.stand(desk('b-desk',1.3,.62),-1.5,.95,{layer:3,s:0});
  const study=tbl.add(book('b-book',.8,.5,'ACCOUNTANCY'),-.1,.55,{z:.02});
  const pencil=B.stand(sp('b-pencil',.08,.4,k=>{k.fill(rect(0,0,.08,.32),INK.yellow);k.key(rect(0,0,.08,.32),.01);k.fill(poly([[0,.32],[.08,.32],[.04,.4]]),INK.wood);},{rim:.01}),-.95,1.0,{layer:3,s:0,tab:false});
  // Right page: the ladder, the first team, the first game.
  const lad=B.stand(ladder('b-ladder',.8,2.3),1.0,-1.45,{layer:1,s:0});
  const tok=lad.add(tokenSpec('b-token'),0,.04,{z:.03});
  const six=bd.add(S.flipCard(K+'b-six',1.3,.3,'FIRST TEAM',INK.sky,INK.navy),'R',1.3,2.2,{out:.04});
  const pros=[[3.0,-.5,'#f1b88f'],[4.0,-.3,'#b27650']].map(([x,z,sk],i)=>B.person(K+`b-pro${i}`,x as number,z as number,1.35,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,adult:true,legs:i?'stand':'kick',face:'smile',layer:2}));
  const ng2=B.person(K+'b-ng2',2.0,1.0,1.2,{shirt:'ger',...NG,legs:'run',face:'open',layer:3});
  const age21=B.stand(S.flipCard(K+'b-21',.9,.3,'AGE 21',INK.pink),3.1,1.7,{layer:3,s:0});
  const sub=B.stand(subBoard('b-sub',.7,1.0),4.4,1.0,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'b-ball',.1),3.5,-.1,{layer:2,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.1):b.t;
   // At nineteen, his chance at Boulogne.
   sign.s=beat(t,2.4,3.2);ng.body.s=beat(t,3,3.8);ng.body.dx=1.1*beat(t,3.8,5.6);age.s=beat(t,4.4,5.2);gull.dx=.5*beat(t,0,20);
   // The second team, six divisions below the top: the ladder unfolds with his token at the bottom.
   team2.s=beat(t,7,7.8)*(1-beat(t,11.6,12.2));lad.s=beat(t,8.2,9.2);tok.scale=beat(t,9.2,9.8);tok.visible=tok.scale>.02;
   // At the same time he studied accountancy.
   tbl.s=beat(t,12.2,13);showPart(study,beat(t,12.8,13.6));pencil.s=beat(t,13.2,14);pencil.rot=.25*wave(t,14,16.8,1.6);ng.body.dx+=.8*beat(t,12.2,13.4);ng.armR.rot=.12+.5*beat(t,13.4,14);
   // Slide him up the ladder: from the second team toward the first team.
   const up=Math.max(beat(t,17.4,19.4),manual?beat(act,0,.9):0);tok.dy=1.66*up;showPart(six,Math.max(beat(t,19,19.8),manual?beat(act,.8,1):0));
   // At twenty-one, training with the first team, watching how they work.
   pros.forEach((p,i)=>{p.body.s=beat(t,19.8+i*.5,20.6+i*.5);});ng2.body.s=beat(t,20.8,21.6);age21.s=beat(t,21.4,22.2);ng2.body.yaw=.35*pulse(t,22.4,25.4);
   ball.s=beat(t,21.8,22.4);ball.x=3.5-.4*pulse(t,22.6,23.8)+.4*pulse(t,23.8,25);pros[0].leg!.rot=-.9*pulse(t,22.4,23);
   // May 2012: his first professional game, the last eleven minutes.
   const gm=beat(t,25.9,26.8);board.scale=gm;board.visible=gm>.02;const m=beat(t,28.6,29.4);mins.scale=m;mins.visible=m>.02;
   sub.s=beat(t,27.4,28.2);ng2.body.dx=-.3*beat(t,29.4,30.4);cheer(ng2,beat(t,30.6,31.2)*(1-beat(t,32.2,32.8)));
   pros.forEach((p,i)=>cheer(p,beat(t,34+i*.3,34.6+i*.3)));cheer(ng2,beat(t,35,35.6));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,17,17.8)-.45*beat(t,33,33.8):0;
  };
 }};

/* ───────────── 4 · Winning the ball back (caen) ───────────── */
const caen:SpreadDef={id:'caen',rest:21.3,
 left:k=>{pitch(k,-5,0);line(k,-5,Z(-1.9),0,Z(-1.9),.05);box(k,-3.7,Z(-1.9),2.4,.8,.05);
  for(let i=0;i<38;i++){const x=-4.7+(i%19)*.24,y=Z(1.85)+Math.floor(i/19)*.22;line(k,x,y,x,y+.16,.03,INK.white);}
  titles(k,-2.5,'CAEN · 2013','ALL 38 LEAGUE GAMES · PROMOTION',INK.navy);},
 right:k=>{pitch(k,0,5,'#8fc467','#6ea552');dash(k,3.9,Z(-.35),1.3,Z(-1.15),.04,INK.yellow);titles(k,2.5,'WIN THE BALL BACK','MORE THAN ANY OTHER PLAYER IN EUROPE',INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.2,2.45,[INK.red,INK.blue,INK.white],1);lightRig(k,.7,.3);lightRig(k,3.8,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.6,2.45,[INK.white,INK.sky,INK.yellow],3);k.fill(rect(0,2.45,4.5,.55),'#8fc467');}},-3.05,1.22);
  const words=['SMALL','QUICK','CLEVER'].map((w,i)=>bd.add(S.flipCard(K+`c-w${i}`,.95,.32,w,[INK.pink,INK.yellow,INK.sky][i],INK.navy),'L',2.0+i*1.05,1.95,{out:.04}));
  const balls=[0,1,2,3,4].map(i=>bd.add(S.icon(K+'c-won',.3,'ball'),'R',.8+i*.7,1.05,{out:.04}));
  const europe=bd.add(lineCard('c-eu',1.9,.42,['MOST IN EUROPE'],INK.gold),'R',2.2,.45,{out:.05});
  // Left page: Caen, 38 games, promotion.
  const sign=B.stand(S.sign(K+'c-sign',1.2,1.1,'CAEN',INK.white),-1.2,-1.85,{layer:1,s:0});
  const ng=B.person(K+'c-ng',-2.05,.2,1.2,{shirt:'fan',...NG,legs:'kick',face:'smile',layer:2});
  const games=B.stand(lineCard('c-38',1.3,.5,['38 GAMES'],INK.white),-3.45,-1.4,{layer:1,s:0});
  const arrow=B.stand(S.arrow(K+'c-up',.9,.46,INK.yellow),-3.5,1.1,{layer:3,s:0,tab:false});
  const promo=B.stand(S.flipCard(K+'c-promo',1.3,.32,'PROMOTION!',INK.green,INK.white),-1.9,1.75,{layer:3,s:0});
  const mates=[[-1.0,.9,'#f1b88f'],[-4.45,.2,'#d99a6c']].map(([x,z,sk],i)=>B.person(K+`c-m${i}`,x as number,z as number,1.15,{shirt:'fan',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:2}));
  // Right page: read the pass, step in, steal it.
  const passer=B.person(K+'c-passer',4.2,-.45,1.3,{shirt:'casual',hair:'short',skin:'#f1b88f',legs:'kick',adult:true,face:'open',layer:2});
  const target=B.person(K+'c-target',1.1,-1.35,1.2,{shirt:'casual',hair:'curly',skin:'#b27650',adult:true,face:'open',layer:1});
  const ng2=B.person(K+'c-ng2',2.4,.75,1.15,{shirt:'fan',...NG,legs:'run',face:'smile',layer:3});
  const eye=B.stand(eyeBubble('c-eye',.7,.55),3.3,1.55,{layer:3,s:0,tab:false});
  const read=B.stand(lineCard('c-read',1.2,.34,['READ THE PASS'],INK.white),4.3,1.95,{layer:3,s:0});
  const inter=B.stand(lineCard('c-inter',1.5,.42,['INTERCEPTION!'],INK.yellow),1.0,1.6,{layer:3,s:0});
  const ball=ballPair(B,'c-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.3):b.t;
   // 2013: he joins Caen.
   sign.s=beat(t,2,2.8);ng.body.s=beat(t,2.8,3.6);
   // All 38 league games, and promotion.
   games.s=beat(t,6.2,7);mates.forEach((m,i)=>{m.body.s=beat(t,7+i*.5,7.8+i*.5);});
   const pr=beat(t,9.6,10.6);arrow.s=pr;arrow.rot=Math.PI/2*pr;arrow.dy=.3*pr;promo.s=beat(t,10.4,11.2);
   cheer(ng,beat(t,10.8,11.4)*(1-beat(t,13,13.6)));mates.forEach((m,i)=>cheer(m,beat(t,11+i*.3,11.6+i*.3)*(1-beat(t,13.2,13.8))));
   // The next season: more balls won back than anyone in Europe.
   balls.forEach((q,i)=>showPart(q,beat(t,12.6+i*.5,13.1+i*.5)));const eu=beat(t,15.4,16.2);europe.scale=eu;europe.visible=eu>.02;
   // He read the game early.
   passer.body.s=beat(t,17.4,18.2);target.body.s=beat(t,17.8,18.6);ng2.body.s=beat(t,18.2,19);eye.s=beat(t,18.8,19.6);eye.dy=.05*wave(t,19.6,33,.6);
   // Win the ball back: the pass goes, he steps across the lane and takes it.
   const w=Math.max(beat(t,21.5,23),manual?beat(act,0,.8):0);passer.leg!.rot=-1*Math.max(pulse(t,21.3,21.9),manual?pulse(act,0,.25):0);
   const kick=clamp01(w*1.6);const bx=3.9+(2.6-3.9)*kick,bz=-.35+(-.75+.35)*kick;
   ng2.body.dx=.2*clamp01(w*1.4);ng2.body.dz=-1.7*clamp01(w*1.4);target.body.yaw=-.4*w;
   ball(bx,bz,.04,t>18.2||manual);inter.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.8,1):0);cheer(ng2,Math.max(beat(t,23.2,23.8)*(1-beat(t,26.8,27.4)),manual?beat(act,.9,1):0));
   // Small, quick and clever.
   words.forEach((q,i)=>showPart(q,beat(t,23.6+i*1,24.2+i*1)));
   // Watch the passer's eyes and hips, get on your toes, step in early.
   read.s=beat(t,27.8,28.6);ng2.body.dy=.06*Math.abs(Math.sin((t-29.6)*6))*beat(t,29.6,30)*(1-beat(t,32.4,33));cheer(ng2,Math.max(beat(t,31.8,32.4),manual?beat(act,.9,1):0));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,16.8,17.6)-.45*beat(t,30.6,31.4):0;
  };
 }};

/* ───────────── 5 · Champions, and champions again (leicester) ───────────── */
const leicester:SpreadDef={id:'leicester',rest:24.9,
 left:k=>{pitch(k,-5,0,'#8fc467','#6ea552');ring(k,0,Z(0),.9,.05);titles(k,-2.5,'LEICESTER · 2016','PREMIER LEAGUE CHAMPIONS',INK.blue);},
 right:k=>{pitch(k,0,5,'#8fc467','#6ea552');line(k,0,Z(-1.9),5,Z(-1.9),.05);titles(k,2.5,'CHELSEA · 2017','CHAMPIONS AGAIN',INK.navy);},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.25,2.45,[INK.blue,INK.white,INK.blue,INK.sky],1);lightRig(k,.8,.35);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),'#8fc467');}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.25,2.45,[INK.navy,INK.blue,INK.white],2);lightRig(k,.7,.3);lightRig(k,3.8,.35);k.fill(rect(0,2.45,4.5,.55),'#8fc467');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'l-fw1',.38,INK.sky),'L',1.5,1.55,{out:.03}),bd.add(S.firework(K+'l-fw2',.34,INK.yellow),'L',3.6,1.4,{out:.03})];
  const conf=bd.add(S.confetti(K+'l-conf',2.2,1.0,2),'R',1.0,1.2,{out:.04});
  // Left page: Leicester 2015, the doubters, the title, the tackles.
  const sign=B.stand(S.sign(K+'l-sign',1.4,1.15,'LEICESTER',INK.white),-1.2,-1.85,{layer:1,s:0});
  const y15=bd.add(S.flipCard(K+'l-2015',.9,.32,'2015',INK.pink),'L',2.4,2.3,{out:.04});
  const ng=B.person(K+'l-ng',-2.1,.4,1.2,{shirt:'fan',...NG,legs:'kick',face:'smile',layer:2});
  const doubter=B.person(K+'l-doubt',-4.2,-.35,1.4,{shirt:'casual',hair:'short',skin:'#f1b88f',adult:true,face:'open',layer:2});
  const q=doubter.body.add(bubble('l-q',.5,.46,'?'),.35,1.85,{z:.02});
  const cup=B.stand(S.trophy(K+'l-cup',.6,.85),-3.2,-.95,{layer:1,s:0});
  const champs=B.stand(S.flipCard(K+'l-champs',1.5,.32,'2016 CHAMPIONS',INK.gold,INK.navy),-3.5,1.45,{layer:3,s:0});
  const stats=B.stand(lineCard('l-stats',1.7,.56,['MOST TACKLES AND','INTERCEPTIONS'],INK.white),-1.2,1.55,{layer:3,s:0});
  // Right page: Chelsea 2017, the title flag, voted the best.
  const sign2=B.stand(S.sign(K+'l-sign2',1.4,1.15,'CHELSEA',INK.white),1.2,-1.85,{layer:1,s:0});
  const y17=bd.add(S.flipCard(K+'l-2017',.9,.32,'2017',INK.pink),'R',3.0,2.3,{out:.04});
  const ng2=B.person(K+'l-ng2',2.2,.5,1.2,{shirt:'navy',...NG,legs:'kick',face:'smile',layer:2});
  const mast=B.stand(pole('l-pole',.16,2.3),3.9,-.4,{layer:2,s:0,tab:false});
  const flg=mast.add(flag('l-flag',.95,.55,['CHAMPIONS','2017'],INK.blue),.52,.2,{z:.02});
  const mates=[[3.3,1.1,'#f1b88f'],[4.5,.9,'#b27650']].map(([x,z,sk],i)=>B.person(K+`l-m${i}`,x as number,z as number,1.15,{shirt:'navy',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const voted=B.stand(lineCard('l-voted',1.6,.56,['VOTED BY THE PLAYERS','BEST IN ENGLAND'],INK.gold),1.0,-.8,{layer:2,s:0});
  const ball=ballPair(B,'l-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,24.9):b.t;
   // 2015: to Leicester.
   sign.s=beat(t,3.4,4.2);showPart(y15,beat(t,4.2,5));ng.body.s=beat(t,5,5.8);
   // Few people expected anything: a doubter and a question mark… then champions!
   doubter.body.s=beat(t,8,8.8);showPart(q,beat(t,8.8,9.4)*(1-beat(t,11.6,12)));doubter.body.yaw=-.3*pulse(t,9,11.6);
   cup.s=beat(t,11.8,12.6);champs.s=beat(t,12.4,13.2);cheer(ng,beat(t,12.6,13.2)*(1-beat(t,14.6,15.2)));cheer(doubter,beat(t,13,13.6)*(1-beat(t,15,15.6)));
   fw.forEach((f,i)=>{const a=beat(t,12.4+i*.4,13.4+i*.4)*(1-beat(t,19,20));f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   // More tackles and interceptions than anyone: he nips the ball away.
   stats.s=beat(t,15.6,16.4);let bx=-3.6,bz=.4;if(t>16.8){[bx,bz]=track(t,[[16.8,-3.6,.4],[17.6,-2.4,.8],[18.6,-2.4,.8],[19.4,-1.0,.6]]);}
   doubter.armR.rot=.12+.6*pulse(t,16.2,17.4);ng.leg!.rot=-1*pulse(t,17.2,17.9);
   // Then Chelsea, and the league again in 2017.
   sign2.s=beat(t,20.4,21.2);showPart(y17,beat(t,22.4,23.2));ng2.body.s=beat(t,21,21.8);mast.s=beat(t,22.8,23.6);mates.forEach((m,i)=>{m.body.s=beat(t,23.4+i*.4,24.2+i*.4);});
   if(t>20.2&&!manual){[bx,bz]=track(t,[[20.2,1.5,.9],[21.8,1.5,.9],[30.8,1.5,.9],[31.8,3.0,1.3],[33.6,3.0,1.3],[34.6,1.6,.95]]);}if(manual){bx=1.5;bz=.9;}
   ball(bx,bz,.04,t>16.4||manual);ng2.leg!.rot=-1*maxOf([31.4,34.2].map(a=>pulse(t,a-.3,a+.3)));
   // Lift the title flag.
   const lift=Math.max(beat(t,25.1,26.8),manual?beat(act,0,.8):0);flg.dy=1.5*lift;
   const conf2=Math.max(beat(t,26.4,27.4),manual?beat(act,.7,1):0);conf.scale=conf2;conf.visible=conf2>.02;conf.dy=-.3*conf2;
   mates.forEach((m,i)=>cheer(m,Math.max(beat(t,26.6+i*.3,27.2+i*.3)*(1-beat(t,30.4,31)),manual?beat(act,.8,1):0)));
   // Voted the best player in England by the players.
   voted.s=beat(t,27.6,28.4);
   // Hard work helps the team: win it, give it quickly to a teammate.
   mates.forEach((m,i)=>{if(t>33)cheer(m,beat(t,34.8+i*.3,35.4+i*.3));});if(t>28.4)cheer(ng2,Math.max(beat(t,28.6,29.2)*(1-beat(t,30.4,31)),beat(t,35.2,35.8)));else ng2.armR.rot=.12+1.4*lift*(manual?1:1-beat(t,27.6,28.2));
   return b.narrated?-.45*beat(t,2.8,3.6)+.45*beat(t,19.8,20.6)+.45*beat(t,20.6,21.4)-.45*beat(t,30.6,31.4):0;
  };
 }};

/* ───────────── 6 · World champion (worldcup) ───────────── */
const worldcup:SpreadDef={id:'worldcup',rest:12.2,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);ring(k,0,Z(-.2),.9,.05);titles(k,-2.5,'RUSSIA · 2018','ALL SEVEN MATCHES',INK.yellow,INK.white);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-1.9),5,Z(-1.9),.05);titles(k,2.5,'WORLD CHAMPIONS','FINAL · FRANCE 4–2 CROATIA',INK.yellow,INK.white);},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.blue,INK.white,INK.red,INK.white],1);lightRig(k,1.1,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.blue,INK.white,INK.red,INK.sky],3);lightRig(k,1.0,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const bunt=bd.add(S.bunting(K+'w-bunt',3.0,.4,[INK.blue,INK.white,INK.red]),'L',.7,.35,{out:.03});
  const fw=[bd.add(S.firework(K+'w-fw1',.4,INK.blue),'R',1.2,1.7,{out:.03}),bd.add(S.firework(K+'w-fw2',.36,INK.white),'R',3.7,1.8,{out:.03}),bd.add(S.firework(K+'w-fw3',.36,INK.red),'L',3.6,1.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'w-conf',2.2,1.0,5),'R',1.2,1.35,{out:.04});
  // Left page: 2018, seven matches, the small boy who was told no.
  const y18=B.stand(S.flipCard(K+'w-2018',.9,.32,'2018',INK.pink),-1.1,-1.6,{layer:1,s:0});
  const ng=B.person(K+'w-ng',-2.4,.1,1.25,{shirt:'navy',...NG,legs:'kick',face:'smile',layer:2});
  const ticks=Array.from({length:7},(_,i)=>B.stand(S.flipCard(K+`w-match${i}`,.36,.36,String(i+1),i===6?INK.gold:INK.white,INK.navy),-4.6+i*.52,1.65,{layer:3,s:0,tab:false}));
  const kid=B.person(K+'w-kid',-4.1,-.2,.82,{shirt:'fan',...NG,face:'shy',layer:2});
  const nos=[0,1,2].map(i=>B.stand(stamp(`w-no${i}`,.5,.26,'NO'),-4.6+i*.58,.75,{layer:3,s:0,tab:false}));
  // Right page: the final, the trophy, the team.
  const board=B.stand(S.scoreboard(K+'w-board',1.3,1.05,'FINAL'),1.2,-1.8,{layer:1,s:0});
  const score=board.add(lineCard('w-42',1.05,.44,['4–2'],INK.white),0,.3,{z:.012});
  const ng2=B.person(K+'w-ng2',2.5,.3,1.3,{shirt:'navy',...NG,face:'grin',layer:2});
  const cupH=1.3*1.22;const cup=ng2.body.add(S.trophy(K+'w-cup',.46,.66),0,cupH*.42,{z:.03});
  const mates=[[1.1,1.0,'#f1b88f','curly'],[3.7,1.0,'#b27650','short'],[4.4,-.2,'#d99a6c','bald']].map(([x,z,sk,hr],i)=>B.person(K+`w-m${i}`,x as number,z as number,1.2,{shirt:'navy',hair:hr as 'short',skin:sk as string,face:'grin',layer:i===2?2:3}));
  const share=B.stand(lineCard('w-share',1.8,.5,['SUCCESS IS SHARED'],INK.gold),2.6,1.85,{layer:3,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`w-h${i}`,.26),-1.2+i*.5,1.2,{layer:3,s:0,tab:false}));
  const ball=B.stand(S.ball(K+'w-ball',.1),-1.7,.4,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,12.2):b.t;
   // 2018: France at the World Cup.
   y18.s=beat(t,2.2,3);ng.body.s=beat(t,2.6,3.4);bunt.scale=beat(t,3.4,4.4);bunt.visible=bunt.scale>.02;ball.s=beat(t,3.6,4.2);ball.x=-1.7-.2*pulse(t,4.4,5.4);ng.leg!.rot=-.9*pulse(t,4.4,5);
   // All seven matches, then the final: 4–2.
   ticks.forEach((q,i)=>{q.s=beat(t,6.8+i*.4,7.3+i*.4);});board.s=beat(t,9.4,10.2);showPart(score,beat(t,10.4,11));ng2.body.s=beat(t,9.8,10.6);
   // Raise the trophy.
   const lift=Math.max(beat(t,12.5,14),manual?beat(act,0,.8):0);showPart(cup,Math.max(beat(t,12.2,12.6),manual?1:0));cup.dy=cupH*.58*lift;
   cheer(ng2,Math.max(lift*(1-beat(t,19,19.6)),manual?beat(act,.4,1):0));
   fw.forEach((f,i)=>{const a=Math.max(beat(t,13.2+i*.4,14.2+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   const c=Math.max(beat(t,13.4,15),manual?beat(act,.7,1):0);conf.scale=c;conf.visible=c>.02;conf.dy=-.3*c;
   // The small boy the academies turned down: the NO cards fold away.
   kid.body.s=beat(t,14.6,15.4);nos.forEach((n,i)=>{n.s=beat(t,15+i*.3,15.6+i*.3)*(1-beat(t,17.2+i*.3,17.8+i*.3));});cheer(kid,beat(t,17.8,18.4));
   // Success is something you share: the team gathers round.
   mates.forEach((m,i)=>{m.body.s=beat(t,19.6+i*.5,20.4+i*.5);});share.s=beat(t,21.4,22.2);
   mates.forEach((m,i)=>{m.armL.rot=-.12-.8*beat(t,22.6+i*.3,23.2+i*.3);m.armR.rot=.12+.8*beat(t,22.6+i*.3,23.2+i*.3);});
   // Play for your team: everyone celebrates.
   hearts.forEach((h,i)=>{h.s=beat(t,24+i*.5,24.7+i*.5);h.dy=.05*wave(t,25,33,.5);});
   if(t>27.5){cheer(ng,beat(t,28,28.6));mates.forEach((m,i)=>cheer(m,beat(t,28.3+i*.3,28.9+i*.3)));cheer(kid,beat(t,29,29.6));cheer(ng2,beat(t,29.2,29.8));}
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,9,9.8)+.45*beat(t,9.8,10.6)-.45*beat(t,14.2,15)-.45*beat(t,15,15.8)+.45*beat(t,19.2,20)-.45*beat(t,27.4,28.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={suresnes,trials,boulogne,caen,leicester,worldcup};
