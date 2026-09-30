/**
 * The six Cafu pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/cafu/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently: a row of club cards that each say NO, a rain cloud that clears, a gate that finally opens.
 * Kits are generic (no crests): Brazil is a yellow shirt; São Paulo is a white shirt with a red and black band.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='cafu-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const SKIN_C='#7f5138';
const KID={skin:SKIN_C,hair:'short' as const,hairColor:'#1d1512'};
const MAN={skin:SKIN_C,hair:'bald' as const,adult:true};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function street(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#c9b48f');k.dots(p,INK.brown,.06,(x,y)=>.14+.1*Math.sin(x*1.7+y*.9));
 const road=rect(x0,Z(.75),x1-x0,1.2);k.fill(road,'#9a9aa2');k.dots(road,'#5d5f6c',.05,.25);for(let x=x0+.2;x<x1-.2;x+=.6)line(k,x,Z(1.35),x+.3,Z(1.35),.04,INK.yellow);}
function court(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#e59a5c');k.dots(p,INK.red,.06,.14);box(k,x0+.25,Z(-2.9),x1-x0-.5,4.6,.04);line(k,x0+.25,Z(-.6),x1-.25,Z(-.6),.04);ring(k,(x0+x1)/2,Z(-.6),.5,.04);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function dashes(k:Kit,x:number,y0:number,y1:number,c:string=INK.yellow){for(let y=y0;y>y1;y-=.32)k.fill(ell(x,y,.05,.1),c,.9);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.5,.02,i%3?INK.yellow:INK.white);}
/** Jardim Irene on its hill: small, bright, stacked houses with flat roofs. */
function hillHouses(k:Kit,w:number,y:number,seed=0){const hill=`M0 ${y+.2} Q${w*.3} ${y-.9} ${w*.62} ${y-.5} Q${w*.85} ${y-.3} ${w} ${y-.7} L${w} 3 L0 3 Z`;k.fill(hill,'#b98a5e');k.dots(hill,INK.brown,.05,.25);
 const cs=['#f0b86a','#e78a86','#8fcbe6','#f2d895','#9fcb7a','#f4ecd8','#d9a0c8'];
 for(let r=0;r<4;r++)for(let i=0;i<11;i++){const x=.05+i*w/11+(r%2)*.12,yy=y-.55+r*.34+.12*Math.sin(i*1.3+seed),bw=.3+((i*7+r)%3)*.06,bh=.26;
  const b=rect(x,yy,bw,bh);k.fill(b,cs[(i*3+r*5+seed)%cs.length]);k.key(b,.008);k.fill(rect(x+bw*.3,yy+bh*.3,bw*.3,bh*.35),INK.navy);k.fill(rect(x-.02,yy-.03,bw+.04,.04),'#8a7a6a');}}
function brickWall(k:Kit,w:number,y0:number,y1:number){const p=rect(0,y0,w,y1-y0);k.fill(p,'#d98a64');for(let y=y0;y<y1;y+=.14)line(k,0,y,w,y,.01,'#a85e43');for(let i=0;i<4;i++){const win=rect(.35+i*1.05,y0+.15,.6,.4);k.fill(win,INK.sky2);k.key(win,.01);}}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const bubble=(key:string,w:number,h:number,text:string,c:string=INK.white)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.36} ${h*.74} L${w*.2} ${h} L${w*.24} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,c);k.dots(p,INK.sky,.035,.15);k.key(p,.013);k.text(text,w/2,h*.5,h*.3,INK.navy,{max:w*.84,weight:900});},{rim:.016});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
/** A small Jardim Irene house: plastered block, flat slab roof, a water tank, a window and a door. */
const houseBlock=(key:string,w:number,h:number,wall:string,trim:string)=>sp(key,w,h,k=>{const b=rect(0,h*.14,w,h*.86);k.fill(b,wall);k.dots(b,INK.orange,.04,.16);k.key(b,.013);
 k.fill(rect(-.02,h*.1,w+.04,h*.06),'#8a7a6a');k.key(rect(-.02,h*.1,w+.04,h*.06),.01);const tank=rect(w*.62,0,w*.22,h*.12);k.fill(tank,INK.sky);k.key(tank,.01);
 const win=rect(w*.14,h*.32,w*.3,h*.24);k.fill(win,INK.sky2);k.key(win,.01);k.key(`M${w*.29} ${h*.32} L${w*.29} ${h*.56}`,.008);
 const d=rect(w*.58,h*.5,w*.26,h*.5);k.fill(d,trim);k.key(d,.012);k.fill(rect(w*.08,h*.72,w*.36,h*.06),INK.white);});
/** Trial card base: the word revealed when the club flap is lifted. */
const wordCard=(key:string,w:number,h:number,word:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.orange,.035,(x,y)=>y/h*.4);k.key(b,.013);k.text(word,w/2,h*.58,h*.24,INK.navy,{max:w*.86,weight:900});},{rim:.016});
/** Trial card flap: the club's name and a red NO stamp (no crests). */
const clubCard=(key:string,w:number,h:number,names:string[],c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.dots(b,INK.sky,.035,.12);k.fill(rect(0,0,w,h*.34),c);k.key(b,.013);
 names.forEach((n,i)=>k.text(n,w/2,h*(names.length>1?.15+i*.13:.22),h*(names.length>1?.1:.12),INK.white,{max:w*.86,weight:900}));
 k.key(ell(w/2,h*.66,w*.34,h*.2),.03,INK.red);k.text('NO',w/2,h*.74,h*.24,INK.red,{weight:900,max:w*.56});},{rim:.016});
const gatePost=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,c);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.white,{max:w*.62,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);},{rim:.012});
/** Coach's tactics board: a half pitch seen from above with the team as dots (the right side is the right wing). */
const tacticsBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.82,w*.05,h*.18),INK.brown);k.keyFill(rect(w*.85,h*.82,w*.05,h*.18),INK.brown);
 const b=rect(0,0,w,h*.84);k.fill(b,'#3f7f5a');k.dots(b,INK.navy,.05,.2);k.key(b,.016);k.fill(rect(0,0,w,h*.13),INK.navy);k.text('THE COACH’S IDEA',w/2,h*.095,h*.07,INK.yellow,{max:w*.86,weight:900});
 box(k,w*.08,h*.17,w*.84,h*.62,.014);box(k,w*.34,h*.17,w*.32,h*.1,.012);line(k,w*.08,h*.79,w*.92,h*.79,.014);
 for(const [x,y] of [[.2,.3],[.5,.26],[.8,.3],[.3,.46],[.62,.44],[.2,.66],[.42,.7],[.6,.7]])k.circle(w*x,h*y,.055,INK.yellow);
 k.key(ell(w*.82,h*.68,.075,.075),.012,INK.white);});
const token=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.red);k.key(ell(r,r,r,r),.012);k.text('C',r,r*1.36,r*1.1,INK.white,{weight:900});},{rim:.012});
const upArrow=(key:string,w:number,h:number,c:string=INK.yellow)=>sp(key,w,h,k=>{const p=poly([[w*.5,0],[w,h*.3],[w*.68,h*.3],[w*.68,h],[w*.32,h],[w*.32,h*.3],[0,h*.3]]);k.fill(p,c);k.dots(p,INK.orange,.03,.35);k.key(p,.013);},{rim:.016});
const aidCard=(key:string,s:number)=>sp(key,s,s,k=>{const b=rect(0,0,s,s);k.fill(b,INK.white);k.key(b,.012);k.fill(rect(s*.4,s*.18,s*.2,s*.64),INK.red);k.fill(rect(s*.18,s*.4,s*.64,s*.2),INK.red);},{rim:.016});
const subBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.44,h*.62,w*.12,h*.38),'#3a3f47');const b=rect(0,0,w,h*.64);k.fill(b,'#1d1f25');k.key(b,.012);
 k.fill(poly([[w*.25,h*.1],[w*.4,h*.3],[w*.3,h*.3],[w*.3,h*.54],[w*.2,h*.54],[w*.2,h*.3],[w*.1,h*.3]]),'#7cf29a');
 k.fill(poly([[w*.75,h*.54],[w*.9,h*.34],[w*.8,h*.34],[w*.8,h*.1],[w*.7,h*.1],[w*.7,h*.34],[w*.6,h*.34]]),INK.red);},{rim:.016});
const podium=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const steps:[number,number,number,string][]=[[0,.45,.55,INK.sky],[.33,0,1,INK.gold],[.67,.3,.7,INK.pink]];
 for(const [x,y,,c] of steps){const s=rect(w*x,h*y,w*.33,h*(1-y));k.fill(s,c);k.dots(s,INK.navy,.035,.2);k.key(s,.013);}k.text('1',w/2,h*.5,h*.34,INK.navy,{weight:900});});
const band=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{k.fill(rect(0,0,w,h),c);},{rim:.004,grain:.5});
const shirtPatch=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.008);k.text('100%',w/2,h*.78,h*.62,INK.red,{max:w*.9,weight:900});},{rim:.006});
const cloudRain=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#7d8298');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const starBadge=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const p=poly(Array.from({length:10},(_,i)=>[r+Math.cos(i*.628-1.57)*(i%2?r*.45:r),r+Math.sin(i*.628-1.57)*(i%2?r*.45:r)]));k.fill(p,INK.gold);k.dots(p,INK.orange,.03,.35);k.key(p,.013);k.text('3',r,r*1.28,r*.7,INK.navy,{weight:900});},{rim:.02});

/* ───────────── kits ───────────── */
/** São Paulo-style kit: the white 'ger' shirt (black band) plus a red band just above it. No crest. */
function spfc(B:Builder,key:string,x:number,z:number,h:number,o:Omit<Parameters<Builder['person']>[4],'shirt'>):Person{
 const p=B.person(key,x,z,h,{...o,shirt:'ger'});const W=p.h*320/512;
 p.body.add(band(`band-${p.h.toFixed(3)}`,W*92/320,p.h*14/512,INK.red),(152/320-.5)*W,p.h*(1-230/512),{z:.006});
 return p;}
/** Brazil: the yellow 'bib' shirt with navy shorts. */
function brazil(B:Builder,key:string,x:number,z:number,h:number,o:Omit<Parameters<Builder['person']>[4],'shirt'>):Person{return B.person(key,x,z,h,{...o,shirt:'bib'});}

/* ───────────── 1 · Football in Jardim Irene (jardim) ───────────── */
const jardim:SpreadDef={id:'jardim',rest:27.4,
 left:k=>{street(k,-5,0);footprints(k,-4.4,Z(1.9),-.6,Z(1.9),14,INK.navy);
  k.text('JARDIM IRENE',-2.5,Z(2.62),.44,INK.navy,{max:4.3});k.text('SÃO PAULO · BRAZIL · 1970',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{court(k,0,5);dashes(k,4.5,Z(1.9),Z(-.9));
  k.text('CAFU',2.5,Z(2.62),.46,INK.navy,{max:4});k.text('MARCOS · NAMED AFTER THE WINGER CAFURINGA',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'j-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);hillHouses(k,4.5,1.9,1);k.fill(rect(0,2.45,4.5,.55),'#c9b48f');}},
   {key:K+'j-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);brickWall(k,4.5,1.2,2.45);k.fill(rect(0,2.45,4.5,.55),'#e59a5c');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'j-sun',.3),'L',3.9,2.0,{out:.012}),birds=bd.add(S.birds(K+'j-birds',1.0,.4),'R',1.4,2.3,{out:.02});
  // Left page: the neighbourhood, the family of six children, street football.
  const houses=[[-4.0,-.9,'#f0b86a',INK.blue],[-2.85,-1.2,'#e78a86',INK.green],[-1.65,-1.65,'#8fcbe6',INK.red]].map(([x,z,c,d],i)=>B.stand(houseBlock(`j-house${i}`,1.05,1.05,c as string,d as string),x as number,z as number,{layer:1}));
  const y1970=bd.add(S.flipCard(K+'j-1970',.9,.34,'1970',INK.pink),'L',.9,2.35,{out:.03});
  const city=bd.add(S.flipCard(K+'j-sp',1.3,.32,'SÃO PAULO',INK.white,INK.navy),'L',2.4,2.4,{out:.03});
  const kidsAt:[number,number,string][]=[[-4.4,.25,'bun'],[-3.6,.45,'curly'],[-1.0,.2,'long'],[-.5,.9,'short'],[-4.4,1.25,'curly']];
  const kids=kidsAt.map(([x,z,hr],i)=>B.person(K+`j-kid${i}`,x,z,.78+(i%3)*.07,{shirt:(['fan','casual','bib','fan','casual'] as const)[i],hair:hr as 'short',hairColor:'#1d1512',skin:['#7f5138','#b27650','#7f5138','#a8704a','#7f5138'][i],face:'grin',layer:2}));
  const cafu=B.person(K+'j-cafu',-2.5,.9,.92,{shirt:'casual',...KID,legs:'kick',face:'grin',layer:3});
  const six=B.stand(S.flipCard(K+'j-six',1.1,.3,'SIX CHILDREN',INK.yellow,INK.navy),-3.5,1.95,{layer:3,s:0});
  B.slot(-2.2,1.2,-.3,1.2);
  // Right page: Marcos becomes Cafu, the winger Cafuringa, the football school and futsal, the wing.
  const nameBoard=B.stand(lineCard('j-cafuname',1.3,.9,['CAFU'],INK.yellow),1.25,-1.5,{layer:1,s:0});
  const marcos=nameBoard.flap(lineCard('j-marcos',1.34,.94,['MARCOS'],INK.white),0,.94,{z:.02});
  const winger=B.person(K+'j-wing',2.15,-.6,1.5,{shirt:'fan',hair:'curly',hairColor:'#1d1512',adult:true,skin:'#a8704a',face:'smile',layer:2});
  const wingName=B.stand(S.flipCard(K+'j-cafuringa',1.3,.3,'CAFURINGA',INK.blue),2.15,.25,{layer:2,s:0});
  const school=B.stand(S.sign(K+'j-school',1.5,1.1,'FOOTBALL SCHOOL',INK.white),3.85,-1.1,{layer:1,s:0});
  const seven=B.stand(S.flipCard(K+'j-7',.8,.3,'AGE 7',INK.pink),3.75,-.25,{layer:2,s:0});
  const futsal=B.person(K+'j-futsal',1.0,.9,.95,{shirt:'bib',...KID,face:'grin',layer:3});
  const fball=B.stand(S.ball(K+'j-fball',.09),1.35,1.05,{layer:3,tab:false,s:0});
  const futsalCard=B.stand(S.flipCard(K+'j-futsalcard',.9,.28,'FUTSAL',INK.orange),1.1,1.85,{layer:3,s:0});
  B.slot(4.5,1.9,4.5,-.6);const runner=brazil(B,K+'j-run',4.5,1.7,1.2,{...MAN,legs:'run',face:'grin',layer:3});
  const wingArrow=B.stand(upArrow('j-up',.34,.6),3.95,1.6,{layer:3,s:0,tab:false});
  const quick=B.stand(bubble('j-quick',1.2,.6,'QUICK FEET!',INK.yellow),-3.3,1.9,{layer:3,s:0,tab:false});
  const hearts=[0,1].map(i=>B.stand(heart(`j-h${i}`,.26),2.4+i*.9,1.9,{layer:3,s:0,tab:false}));
  const lBall=B.stand(S.ball(K+'j-ballL',.1),-3,1,{layer:3,tab:false}),rBall=B.stand(S.ball(K+'j-ballR',.1),1,1,{layer:3,tab:false});
  const ball=(x:number,z:number,dy:number,vis:boolean)=>{for(const [p,on] of [[lBall,x<0],[rBall,x>=0]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,27.4):b.t;
   houses.forEach((h,i)=>{h.dy=.04*pulse(t,.3+i*.4,1.1+i*.4);});sun.dy=.4*beat(t,0,3);birds.dx=.6*beat(t,0,40);
   // Born in 1970 in São Paulo.
   y1970.scale=beat(t,2.6,3.4);y1970.visible=y1970.scale>.02;city.scale=beat(t,4.4,5.2);city.visible=city.scale>.02;
   // One of six children, in Jardim Irene.
   kids.forEach((p,i)=>{p.body.s=beat(t,7.4+i*.55,8.1+i*.55);});cafu.body.s=beat(t,7.2,8);six.s=beat(t,10.4,11.2);
   // Street football: the ball is passed between the children.
   let bx:number,bz:number,dy=0;
   [bx,bz]=track(t,[[12.8,-2.2,1.1],[13.6,-3.5,.6],[14.4,-4.2,1.1],[15.2,-2.6,.95],[16,-2.2,1.1]]);
   if(t>=28){[bx,bz]=[-2.2,1.1];}
   dy=.05*Math.abs(Math.sin(t*5))*pulse(t,12.8,16);
   kids.forEach((p,i)=>{if(i<2||i===4)p.armR.rot=.12+.6*pulse(t,13+i*.6,14+i*.6);});
   cafu.leg!.rot=-.9*pulse(t,12.6,13.2);
   // Kick the ball along the street (the reader's action).
   const kick=Math.max(beat(t,27.8,29.8),manual?beat(act,.1,.9):0);
   cafu.leg!.rot+=-1.1*Math.max(pulse(t,27.6,28.2),manual?pulse(act,0,.25):0);
   if(kick>0){bx=-2.2+1.9*kick;bz=1.15;dy=.08*Math.abs(Math.sin(kick*9));}
   cafu.body.dx=1.2*kick;
   ball(bx,bz,dy,t>12.6||manual);
   // His real name is Marcos: lift MARCOS, and CAFU is underneath.
   nameBoard.s=beat(t,15.9,16.7);marcos.flip=-2.9*beat(t,19.2,20.2);
   winger.body.s=beat(t,20.2,21);wingName.s=beat(t,20.8,21.6);winger.armR.rot=.12+1.4*beat(t,21.2,21.8)+.25*wave(t,21.8,26,1.1);
   // Football school at seven, and futsal.
   school.s=beat(t,23.2,24);seven.s=beat(t,24,24.8);futsal.body.s=beat(t,25.2,26);fball.s=beat(t,25.6,26.2);futsalCard.s=beat(t,26.2,27);
   fball.dy=.35*Math.abs(Math.sin((t-25.6)*3.2))*pulse(t,25.8,27.6);
   // Running up and down the wing.
   runner.body.s=beat(t,30.2,31);wingArrow.s=beat(t,30.8,31.6);
   const [rz]=track(t,[[31.2,1.7],[32.6,-.4],[34,1.2]]);runner.body.z=rz;runner.body.dz=0;runner.armL.rot=-.12-.5*wave(t,31.2,34,1.8);runner.armR.rot=.12+.5*wave(t,31.2,34,1.8);
   // Street games and futsal teach quick feet.
   quick.s=beat(t,34.6,35.4);hearts.forEach((h,i)=>{h.s=beat(t,36.4+i*.5,37.1+i*.5);});
   kids.forEach((p,i)=>cheer(p,beat(t,35.4+i*.3,36+i*.3)));cheer(cafu,Math.max(beat(t,36.8,37.4),manual?beat(act,.9,1):0));cheer(futsal,beat(t,37.2,37.8));cheer(runner,beat(t,34.2,34.8)*(1-beat(t,38.6,39.2)));
   return b.narrated?-.45*beat(t,2.2,3)+.45*beat(t,15.2,16)+.45*beat(t,16,16.8)-.45*beat(t,27,27.8)+.45*beat(t,29.8,30.6)-.45*beat(t,34,34.8):0;
  };
 }};

/* ───────────── 2 · No, no, no, no, no (trials) ───────────── */
const CLUBS:[string[],string,string][]=[[['CORINTHIANS'],'#2b2b33','KEEP'],[['PALMEIRAS'],INK.green,'TRAINING'],[['SANTOS'],'#4a4a55','AND'],[['ATLÉTICO','MINEIRO'],'#3a3f47','KEEP'],[['PORTUGUESA'],INK.red,'TRYING']];
const trials:SpreadDef={id:'trials',rest:18.9,
 left:k=>{pitch(k,-5,0,'#9fcb7a','#79ab5e');for(let i=0;i<6;i++)k.circle(-4.6+i*.8,Z(1.55),.06,INK.orange);
  k.text('NO, NO, NO, NO, NO',-2.5,Z(2.62),.36,INK.red,{max:4.4});k.text('TRIALS AT BRAZIL’S BIGGEST CLUBS',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);footprints(k,.6,Z(1.25),4.4,Z(1.25),14,INK.white);
  k.text('KEEP TRYING',2.5,Z(2.62),.44,INK.navy,{max:4.2});k.text('HE KEPT TRAINING',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#cfd3dc',INK.navy,y=>.3-y*.06);crowd(k,4.5,1.3,2.45,[INK.white,'#2b2b33',INK.green,INK.red],2);lightRig(k,1.1,.4);lightRig(k,3.5,.45);k.fill(rect(0,2.45,4.5,.55),'#9fcb7a');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);hillHouses(k,4.5,2.0,3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const rain=bd.add(cloudRain('t-rain',1.4,.7),'L',1.5,2.0,{out:.03}),sun=bd.add(S.sun(K+'t-sun',.32),'R',3.8,1.2,{out:.012});
  // Left page: five trial cards, each a NO, with a word hidden underneath.
  const cards=CLUBS.map(([names,c,word],i)=>{const x=-4.5+i*.95,st=B.stand(wordCard(`t-word${i}`,.84,1.0,word,[INK.yellow,INK.sky,INK.white,INK.yellow,INK.pink][i]),x,-.75,{layer:2,s:0});
   const flap=st.flap(clubCard(`t-club${i}`,.88,1.04,names,c),0,1.02,{z:.02});return {st,flap};});
  const boy=B.person(K+'t-boy',-2.5,1.05,.95,{shirt:'casual',...KID,face:'shy',layer:3,holdR:'suitcase'});
  const scout=B.person(K+'t-scout',-4.4,.75,1.5,{shirt:'navy',hair:'short',hairColor:'#8a7a6a',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const lots=B.stand(stamp('t-lots',1.3,.36,'A LOT OF NO'),-.9,1.8,{layer:3,s:0});
  // Right page: he keeps training.
  const cones=[1.3,2.2,3.1,4.0].map((x,i)=>B.stand(S.cone(K+`t-cone${i}`,.32),x,.55,{layer:2,s:0}));
  B.slot(.7,1.05,4.4,1.05);const runner=B.person(K+'t-run',.9,1.05,.98,{shirt:'casual',...KID,legs:'run',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'t-ball',.09),1.2,1.15,{layer:3,tab:false,s:0});
  const keep=B.stand(S.banner(K+'t-keep',2.2,.46,'KEEP TRYING',INK.yellow,INK.navy),2.6,-1.5,{layer:1,s:0});
  const coach=B.person(K+'t-coach',4.2,-.4,1.5,{shirt:'coach',hair:'short',hairColor:'#3b2e3f',adult:true,skin:'#b27650',face:'smile',layer:2});
  const star=B.stand(S.bubble(K+'t-star',.6,.55,'star'),3.3,1.85,{layer:3,s:0,tab:false});
  const hearts=[0,1].map(i=>B.stand(heart(`t-h${i}`,.26),1.4+i*1.0,1.9,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.9):b.t;
   boy.body.s=beat(t,2.4,3.2);scout.body.s=beat(t,3.4,4.2);
   // Each club says no: its card pops up at its sentence.
   const at=[7.1,9.3,11.3,13.4,15.0];cards.forEach((c,i)=>{c.st.s=beat(t,at[i],at[i]+.7);c.st.rot=.06*wave(t,17.1,19,1.6+i*.2);});
   scout.body.yaw=.35*wave(t,7.2,16.8,.6);boy.body.yaw=-.3*pulse(t,11,17);
   lots.s=beat(t,17.2,17.9)*(1-beat(t,26.4,27.2));
   // Flip the five cards: one tap each; the words underneath say KEEP TRAINING AND KEEP TRYING.
   const n=manual?act*5:0;cards.forEach((c,i)=>{const o=Math.max(clamp01(n-i),beat(t,19.1+i*.3,19.6+i*.3));c.flap.flip=-2.9*o;});
   // He could have given up: rain on the stadium.
   const rn=beat(t,21.2,22)*(1-beat(t,23.6,24.6));rain.scale=rn;rain.visible=rn>.02;boy.body.yaw+=-.3*pulse(t,21.3,23.3);
   // Instead he kept training: the sun comes out and he dribbles through the cones.
   sun.dy=.8*beat(t,23.2,25);cones.forEach((c,i)=>{c.s=beat(t,23.4+i*.2,24+i*.2);});keep.s=beat(t,24,24.8);ball.s=beat(t,23.6,24.2);
   const run=beat(t,24.4,27.2);runner.body.x=.9+3.55*run;ball.x=1.2+3.3*run;ball.z=1.15+.28*Math.sin(run*Math.PI*4);ball.rot=-run*12;
   runner.armL.rot=-.12-.5*wave(t,24.4,27.2,1.8);runner.armR.rot=.12+.5*wave(t,24.4,27.2,1.8);
   coach.body.s=beat(t,27.2,28);coach.armR.rot=.12+1.4*beat(t,28.2,28.8);star.s=beat(t,29,29.7);
   hearts.forEach((h,i)=>{h.s=beat(t,30.2+i*.5,30.9+i*.5);});cheer(runner,beat(t,29.6,30.2));cheer(boy,Math.max(beat(t,30.4,31),manual?beat(act,.95,1):0));
   return b.narrated?-.45*beat(t,6.4,7.2)+.45*beat(t,22.6,23.4)+.45*beat(t,23.4,24.2)-.45*beat(t,29.4,30.2):-.45*0;
  };
 }};

/* ───────────── 3 · At last, a yes (yes) ───────────── */
const yes:SpreadDef={id:'yes',rest:13.95,
 left:k=>{street(k,-5,0);footprints(k,-4.2,Z(1.9),-2.4,Z(-.4),10,INK.navy);
  k.text('SÃO PAULO · 1988',-2.5,Z(2.62),.4,INK.red,{max:4.3});k.text('HIS HOMETOWN CLUB SAID YES',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,0,Z(.2),.9,.05);
  k.text('COPA SÃO PAULO',2.5,Z(2.62),.4,INK.navy,{max:4.3});k.text('A FAMOUS YOUTH TOURNAMENT · 1988',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'y-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);hillHouses(k,4.5,2.1,5);k.fill(rect(0,2.45,4.5,.55),'#c9b48f');}},
   {key:K+'y-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.2,2.45,[INK.white,INK.red,'#2b2b33',INK.white],3);lightRig(k,1.0,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'y-sun',.3),'L',3.9,1.6,{out:.012});
  const bunt=bd.add(S.bunting(K+'y-bunt',2.8,.4,[INK.red,INK.white,'#2b2b33']),'R',.8,2.45,{out:.03});
  // Left page: the club gate, the boy, the old NOs and a place to grow.
  const gate=B.stand(gatePost('y-gate',1.8,1.6,'SÃO PAULO',INK.red),-2.4,-1.4,{layer:1,s:0});
  const gl=gate.flap(gateLeaf('y-gl',.7,1.1,INK.navy),-1.8/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('y-gr',.7,1.1,INK.navy),1.8/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const y88=B.stand(S.flipCard(K+'y-1988',.9,.34,'1988',INK.pink),-4.3,.45,{layer:2,s:0});
  const yesCard=B.stand(stamp('y-yes',1.0,.42,'YES!',INK.green),-4.2,-.55,{layer:2,s:0});
  const boy=spfc(B,K+'y-boy',-2.4,.8,1.05,{...KID,face:'grin',layer:2,holdR:'suitcase'});
  const nos=[0,1,2,3,4].map(i=>B.stand(stamp(`y-no${i}`,.5,.28,'NO',INK.red),-4.6+i*.62,1.85,{layer:3,s:0,tab:false}));
  const sapling=B.stand(S.tree(K+'y-tree',1.0,1.3,'round'),-.9,.3,{layer:2,s:0});
  const grow=B.stand(S.flipCard(K+'y-grow',1.4,.3,'A PLACE TO GROW',INK.yellow,INK.navy),-1.3,1.3,{layer:3,s:0});
  // Right page: the youth team wins the Copa São Paulo.
  const trophy=bd.add(S.trophy(K+'y-trophy',.6,.8),'R',2.3,1.25,{out:.035});
  const team=[[1.1,.1],[1.9,.5],[3.1,.5],[3.9,.1]].map(([x,z],i)=>spfc(B,K+`y-p${i}`,x,z,1.12,{hair:(['short','curly','short','bald'] as const)[i],hairColor:'#1d1512',skin:['#b27650','#f1b88f','#7f5138','#d99a6c'][i],face:'grin',layer:2}));
  const cafu=spfc(B,K+'y-cafu',2.5,1.0,1.12,{...KID,face:'grin',layer:3});
  const coach=B.person(K+'y-coach',4.4,1.4,1.45,{shirt:'coach',hair:'short',hairColor:'#8a7a6a',adult:true,skin:'#f1b88f',face:'smile',layer:3});
  const cones=[1.2,3.8].map((x,i)=>B.stand(S.cone(K+`y-cone${i}`,.3),x,1.8,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.95):b.t;
   sun.dy=.5*beat(t,0,3);
   // 1988: São Paulo said yes.
   gate.s=beat(t,2.2,3);boy.body.s=beat(t,2.8,3.6);y88.s=beat(t,3.6,4.4);yesCard.s=beat(t,5,5.8);yesCard.dy=.08*pulse(t,5.8,6.6);
   // The youth team, and the Copa São Paulo.
   team.forEach((p,i)=>{p.body.s=beat(t,7+i*.45,7.8+i*.45);});cafu.body.s=beat(t,8.8,9.6);trophy.scale=beat(t,10.6,11.4);trophy.visible=trophy.scale>.02;bunt.scale=beat(t,11,12);bunt.visible=bunt.scale>.02;
   team.forEach((p,i)=>cheer(p,beat(t,12+i*.25,12.6+i*.25)*(1-beat(t,13.4,13.9))));cheer(cafu,beat(t,12.4,13)*(1-beat(t,13.4,13.9)));
   // Open the club gate: he walks in.
   const open=Math.max(beat(t,14.3,15.6),manual?beat(act,0,.55):0);gl.flip=-1.25*open;gr.flip=1.25*open;
   const inn=Math.max(beat(t,15.8,17.6),manual?beat(act,.5,1):0);boy.body.dz=-1.25*inn;boy.body.s*=1-beat(inn,.8,1);
   // After all those trials: the old NOs fold away and a place to grow.
   nos.forEach((c,i)=>{c.s=beat(t,2.6+i*.3,3.2+i*.3)*(1-beat(t,16.4+i*.2,17+i*.2));});
   sapling.s=beat(t,18.2,19.4);sapling.scale=.6+.4*beat(t,18.4,20.4);grow.s=beat(t,19.4,20.2);
   // Keep working: training with the coach.
   coach.body.s=beat(t,22.2,23);coach.armR.rot=.12+1.3*beat(t,23,23.6)+.2*wave(t,23.6,27,1.1);cones.forEach((c,i)=>{c.s=beat(t,22.6+i*.3,23.2+i*.3);});
   cafu.body.dz=.6*pulse(t,23.6,25.6);cheer(cafu,beat(t,25.6,26.2));
   return b.narrated?-.45*beat(t,1.8,2.6)+.45*beat(t,6.4,7.2)+.45*beat(t,7.2,8)-.45*beat(t,13.4,14)-.45*beat(t,14,14.6)+.45*beat(t,21.6,22.4):-.45*0;
  };
 }};

/* ───────────── 4 · A brand-new position (rightback) ───────────── */
const rightback:SpreadDef={id:'rightback',rest:20.5,
 left:k=>{pitch(k,-5,0,'#9fcb7a','#79ab5e');box(k,-4.6,Z(-2.0),4.2,3.6,.05);
  k.text('A NEW POSITION',-2.5,Z(2.62),.42,INK.navy,{max:4.3});k.text('COACH TELÊ SANTANA: MOVE HIM TO RIGHT-BACK',-2.5,Z(2.9),.13,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);line(k,4.85,0,4.85,PAGE_D,.05);line(k,0,Z(-2.1),4.85,Z(-2.1),.05);box(k,.9,Z(-2.1),2.6,.8,.04);dashes(k,4.5,Z(1.55),Z(-1.5));
  k.text('THE OVERLAP',2.5,Z(2.62),.44,INK.navy,{max:4.2});k.text('RUN OUTSIDE YOUR WINGER',2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'r-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.45,[INK.white,INK.red,'#2b2b33'],1);lightRig(k,1.2,.4);k.fill(rect(0,2.45,4.5,.55),'#9fcb7a');}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.3,2.45,[INK.white,INK.red,'#2b2b33',INK.white],4);lightRig(k,3.4,.4);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const cup=bd.add(S.trophy(K+'r-cup',.5,.7),'R',2.3,1.5,{out:.03});
  const lib=bd.add(S.banner(K+'r-lib',2.4,.36,'COPA LIBERTADORES',INK.red,INK.white),'L',2.3,2.45,{out:.035});
  // Left page: the coach's idea on the tactics board.
  const board=B.stand(tacticsBoard('r-board',2.1,1.6),-2.4,-1.3,{layer:1,s:0});
  const tok=board.add(token('r-tok',.09),2.1*(.82-.5),1.6*(1-.44)-.09,{z:.014});
  const posCard=B.stand(lineCard('r-rb',1.2,.4,['RIGHT-BACK'],INK.yellow),-.85,-.55,{layer:2,s:0});
  const midFlap=posCard.flap(lineCard('r-mid',1.24,.44,['MIDFIELD'],INK.white),0,.42,{z:.02});
  const coach=B.person(K+'r-coach',-4.1,.1,1.55,{shirt:'coach',hair:'short',hairColor:'#c9c3b5',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const cafu=spfc(B,K+'r-cafu',-2.3,.75,1.25,{...MAN,face:'smile',layer:2});
  const q=B.stand(bubble('r-q',.5,.5,'?',INK.white),-1.5,1.35,{layer:3,s:0,tab:false});
  const perfect=B.stand(bubble('r-perfect',1.2,.55,'PERFECT!',INK.yellow),-1.3,1.6,{layer:3,s:0,tab:false});
  // Right page: defend, then overlap outside the winger.
  const opp=B.person(K+'r-opp',3.0,-.35,1.2,{shirt:'fan',hair:'short',hairColor:'#3b2e3f',skin:'#f1b88f',face:'open',layer:2});
  const winger=spfc(B,K+'r-wing',3.55,.35,1.2,{hair:'curly',hairColor:'#1d1512',skin:'#a8704a',face:'grin',layer:2,legs:'kick'});
  B.slot(4.5,1.45,4.5,-1.35);const rb=spfc(B,K+'r-rbman',3.2,1.45,1.2,{...MAN,legs:'run',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'r-ball',.09),3.0,-.1,{layer:3,tab:false,s:0});
  const arrow=B.stand(upArrow('r-arrow',.3,.55),4.0,1.75,{layer:3,s:0,tab:false});
  const overlap=B.stand(S.flipCard(K+'r-overlap',1.2,.3,'OVERLAP!',INK.yellow,INK.navy),1.5,1.7,{layer:3,s:0});
  const years=[['1992',.9,-1.6],['1993',1.95,-1.55]].map(([l,x,z])=>B.stand(S.flipCard(K+`r-${l}`,.8,.3,l as string,INK.red),x as number,z as number,{layer:1,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.5):b.t;
   board.s=beat(t,.3,1.2);
   // A right-sided midfielder.
   cafu.body.s=beat(t,2.4,3.2);posCard.s=beat(t,3.4,4.2);
   // The coach's idea: the red token slides from midfield back to right-back.
   coach.body.s=beat(t,5.3,6.1);coach.armR.rot=.12+1.5*beat(t,7,7.6)-1.2*beat(t,11,11.6);
   const mv=beat(t,8.2,9.6);tok.dy=-1.6*.32*mv;tok.dx=0;midFlap.flip=-2.9*beat(t,8.2,8.9);
   // Never played there before: a question.
   q.s=beat(t,10.4,11)*(1-beat(t,13.6,14));cafu.body.yaw=-.3*pulse(t,10.4,13.8);
   // It suited him perfectly!
   perfect.s=beat(t,14,14.6);cheer(cafu,beat(t,14.4,15)*(1-beat(t,16.4,17)));
   // He defended: he wins the ball from the attacker, passes to the winger and gets behind him.
   opp.body.s=beat(t,16.2,16.8);winger.body.s=beat(t,16.3,16.9);rb.body.s=beat(t,16.4,17);ball.s=beat(t,16.4,17);
   const tackle=beat(t,17,17.9);rb.body.x=3.2-.3*tackle;rb.body.dz=-.9*tackle*(1-beat(t,19.1,20.2));
   const back=beat(t,18.6,19.8);opp.body.dx=-.2*back;opp.body.dz=-.55*back;opp.body.yaw=-.4*back;
   const toBack=beat(t,19.1,20.2);rb.body.x=rb.body.x+(4.5-2.9)*toBack;
   let [bx,bz]=track(t,[[16.8,3.0,-.1],[17.9,2.95,.55],[18.6,2.95,.55],[19.4,3.55,.6]]);
   // Run the overlap: he sprints outside the winger; the winger passes into his path.
   const run=Math.max(beat(t,20.9,22.4),manual?beat(act,0,.8):0);rb.body.dz+=-2.6*run;
   winger.leg!.rot=-1.1*Math.max(pulse(t,21.3,21.9),manual?pulse(act,.25,.55):0);
   const pass=Math.max(beat(t,21.6,22.4),manual?beat(act,.4,.8):0);if(pass>0){bx=3.55+.95*pass;bz=.6-1.75*pass;}
   ball.x=bx;ball.z=bz;ball.rot=-bx*5;opp.body.yaw+=-.3*pass;
   rb.armL.rot=-.12-.5*wave(t,20.9,22.4,1.8);rb.armR.rot=.12+.5*wave(t,20.9,22.4,1.8);
   arrow.s=Math.max(beat(t,20.9,21.4),manual?beat(act,0,.2):0);overlap.s=Math.max(beat(t,22,22.6),manual?beat(act,.7,.95):0);
   // São Paulo win the Copa Libertadores, 1992 and 1993.
   cup.scale=beat(t,23,24);cup.visible=cup.scale>.02;lib.scale=beat(t,24,25);lib.visible=lib.scale>.02;
   years.forEach((y,i)=>{y.s=beat(t,29+i*1.8,29.8+i*1.8);});
   cheer(winger,beat(t,32,32.6));cheer(rb,Math.max(beat(t,32.3,32.9),manual?beat(act,.9,1):0));cheer(cafu,beat(t,32.6,33.2));coach.armL.rot=-.12-1.4*beat(t,34,34.6);
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,15.6,16.2)+.45*beat(t,16.2,17)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 5 · Three finals in a row (finals) ───────────── */
const finals:SpreadDef={id:'finals',rest:10.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);ring(k,0,Z(-.4),.9,.05);line(k,-4.9,Z(1.55),-.2,Z(1.55),.04,INK.white);
  k.text('FINAL · 1994',-2.5,Z(2.62),.42,INK.yellow,{max:4.3});k.text('V ITALY · CAFU STARTED ON THE BENCH',-2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05);ring(k,0,Z(-.4),.9,.05);
  k.text('THREE FINALS IN A ROW',2.5,Z(2.62),.32,INK.yellow,{max:4.4});k.text('1994 · 1998 · 2002',2.5,Z(2.9),.16,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.yellow,INK.green,INK.blue,INK.yellow],1);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.yellow,INK.white,INK.blue,INK.green],4);lightRig(k,1.1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const cup=bd.add(S.trophy(K+'f-cup',.55,.75),'L',2.3,1.2,{out:.035});
  const fw=[bd.add(S.firework(K+'f-fw1',.36,INK.yellow),'L',1.0,1.4,{out:.03}),bd.add(S.firework(K+'f-fw2',.34,INK.green),'L',3.7,1.3,{out:.03})];
  // Left page: the 1994 final: the bench, the hurt teammate, the substitution.
  const board=B.stand(S.scoreboard(K+'f-board',1.3,1.1,'FINAL · ITALY'),-.95,-1.55,{layer:1,s:0});board.add(lineCard('f-94',1.05,.44,['1994'],INK.yellow),0,.3,{z:.012});
  const bench=B.stand(S.bench(K+'f-bench',1.5,.5),-3.9,1.45,{layer:3,s:0});
  const cafu=brazil(B,K+'f-cafu',-3.9,1.05,1.3,{...MAN,face:'grin',layer:2});
  const mate=brazil(B,K+'f-mate',-1.7,.05,1.3,{skin:'#d99a6c',hair:'short',hairColor:'#1d1512',adult:true,face:'sad',layer:2});
  const aid=B.stand(aidCard('f-aid',.4),-1.05,.55,{layer:2,s:0,tab:false});
  const sub=B.stand(subBoard('f-sub',.62,.72),-2.6,1.75,{layer:3,s:0});
  B.slot(-3.9,1.05,-1.7,.1);
  // Right page: three finals in a row.
  const tix=[['1994','ITALY · WON',INK.yellow],['1998','FRANCE · LOST',INK.sky],['2002','THIRD FINAL',INK.pink]].map(([y,l,c],i)=>bd.add(lineCard(`f-t${i}`,1.1,.7,[y,l],c),'R',.9+i*1.3,1.75,{out:.035}));
  const sad=brazil(B,K+'f-sad',2.5,.35,1.2,{...MAN,face:'sad',layer:2});
  const glad=brazil(B,K+'f-glad',3.8,.35,1.2,{...MAN,face:'grin',layer:2});
  const three=B.stand(starBadge('f-star',.36),1.3,1.5,{layer:3,s:0,tab:false});
  const only=B.stand(S.flipCard(K+'f-only',1.5,.3,'THREE IN A ROW',INK.yellow,INK.navy),2.9,1.75,{layer:3,s:0});
  const ready=B.stand(bubble('f-ready',1.1,.55,'BE READY!',INK.yellow),-1.2,1.85,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,10.8):b.t;
   board.s=beat(t,.4,1.2);
   // 1994: Cafu started on the bench.
   bench.s=beat(t,2.4,3);cafu.body.s=beat(t,2.8,3.6);
   // A teammate got hurt early; the substitution board goes up and Cafu gets ready.
   mate.body.s=beat(t,7,7.8);aid.s=beat(t,9,9.7);sub.s=beat(t,9.8,10.5);cafu.armR.rot=.12+1.2*beat(t,10,10.6)*(1-beat(t,11,11.4));
   // Swap the players: the hurt teammate goes off, Cafu comes on.
   const sw=Math.max(beat(t,11.2,12.9),manual?beat(act,0,.7):0);
   cafu.body.x=-3.9+2.2*sw;cafu.body.z=1.05-.95*sw;mate.body.x=-1.7-2.6*sw;mate.body.z=.05-.25*sw;mate.body.lean=.25*beat(t,8.4,9.2)*(1-sw);
   aid.s*=1-beat(sw,0,.3);sub.dy=.1*pulse(sw,0,.6);
   // On came Cafu, and Brazil won the World Cup!
   const won=Math.max(beat(t,14.2,15.2),manual?beat(act,.65,1):0);cup.scale=won;cup.visible=won>.02;
   fw.forEach((f,i)=>{const a=Math.max(beat(t,14.4+i*.4,15.4+i*.4),manual?beat(act,.7+i*.1,.9+i*.1):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   const tx=(i:number,v:number)=>{tix[i].scale=v;tix[i].visible=v>.02;};tx(0,Math.max(beat(t,15,15.8),manual?beat(act,.8,1):0));
   cheer(cafu,Math.max(beat(t,14.6,15.1)*(1-beat(t,16.6,17)),manual?beat(act,.85,1):0));
   // 1998: the final again, lost to France.
   tx(1,beat(t,18.2,19));sad.body.s=beat(t,18.6,19.4)*(1-beat(t,23.2,24));
   // Four years later, a third final in a row.
   tx(2,beat(t,23.4,24.2));glad.body.s=beat(t,24.2,25);cheer(glad,beat(t,25.6,26.2));
   // No other player has ever done that.
   three.s=beat(t,27.4,28.2);three.rot=.1*wave(t,28.2,35,.5);only.s=beat(t,28,28.8);
   // Be ready from the bench.
   ready.s=beat(t,30.6,31.4);cheer(mate,beat(t,32,32.6));
   return b.narrated?-.45*beat(t,2,2.8)+.45*beat(t,16.8,17.6)+.45*beat(t,17.6,18.4)-.45*beat(t,29.6,30.4):0;
  };
 }};

/* ───────────── 6 · Captain of Brazil (captain) ───────────── */
const captain:SpreadDef={id:'captain',rest:16.9,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);k.circle(-2.65,Z(.2),.06,INK.white);
  k.text('FINAL · 2002',-2.5,Z(2.62),.42,INK.yellow,{max:4.3});k.text('BRAZIL 2–0 GERMANY',-2.5,Z(2.9),.16,INK.white,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);for(let i=0;i<30;i++){const x=.3+((i*37)%97)/97*4.4,y=Z(1.2)+((i*53)%41)/41*.9;k.fill(rect(x,y,.08,.04),[INK.yellow,INK.green,INK.white,INK.sky][i%4]);}
  k.text('CAPTAIN OF BRAZIL',2.5,Z(2.62),.36,INK.yellow,{max:4.4});k.text('100% JARDIM IRENE ON HIS SHIRT',2.5,Z(2.9),.15,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.yellow,INK.green,INK.white,INK.yellow],2);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.yellow,INK.green,INK.blue,INK.yellow],5);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'c-fw1',.4,INK.yellow),'R',1.0,1.1,{out:.03}),bd.add(S.firework(K+'c-fw2',.36,INK.green),'R',3.5,1.0,{out:.03}),bd.add(S.firework(K+'c-fw3',.38,INK.white),'L',3.4,1.4,{out:.03})];
  const conf=bd.add(S.confetti(K+'c-conf',2.2,1.1,6),'R',1.2,1.4,{out:.04});
  // Left page: the final.
  const goal=B.stand(S.goal(K+'c-goal',1.6,.85),-2.65,-1.35,{layer:1,s:0});
  const keeper=B.person(K+'c-keeper',-2.65,-1.1,1.3,{shirt:'keeper',hair:'short',hairColor:'#8a7a6a',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const board=B.stand(S.scoreboard(K+'c-board',1.3,1.1,'FINAL · GERMANY'),-.8,-1.35,{layer:1,s:0});
  const score=board.add(lineCard('c-20',1.05,.44,['2–0'],INK.yellow),0,.3,{z:.012});
  const cafuL=brazil(B,K+'c-cafuL',-4.1,.55,1.4,{...MAN,face:'grin',layer:2});
  const capCard=B.stand(S.flipCard(K+'c-cap',1.1,.3,'CAPTAIN',INK.yellow,INK.navy),-4.1,1.5,{layer:3,s:0});
  const striker=brazil(B,K+'c-striker',-2.0,.6,1.35,{skin:'#b27650',hair:'short',hairColor:'#1d1512',adult:true,legs:'kick',face:'grin',layer:2});
  // Right page: lifting the trophy on the podium, then the foundation.
  const pod=B.stand(podium('c-podium',1.9,.55),2.6,-.45,{layer:2,s:0});
  const cafuR=brazil(B,K+'c-cafuR',2.6,-.85,1.45,{...MAN,face:'grin',layer:1});
  const W=cafuR.h*320/512;const patch=cafuR.body.add(shirtPatch('c-patch',W*.26,W*.12),(152/320-.5)*W,cafuR.h*(1-262/512),{z:.006});
  const cup=cafuR.body.add(S.trophy(K+'c-cup',.42,.58),(152/320-.5)*W,cafuR.h*.5,{z:.02});
  const big=B.stand(lineCard('c-100',1.3,.62,['100%','JARDIM IRENE'],INK.white,INK.red),4.2,-.3,{layer:2,s:0});
  const found=B.stand(S.sign(K+'c-found',1.4,1.0,'FOUNDATION',INK.yellow),1.0,.95,{layer:3,s:0});
  const kids=[[2.3,1.55,'bun'],[3.1,1.75,'curly'],[3.9,1.5,'short']].map(([x,z,hr],i)=>B.person(K+`c-kid${i}`,x as number,z as number,.8,{shirt:(['fan','casual','bib'] as const)[i],hair:hr as 'short',hairColor:'#1d1512',skin:['#7f5138','#b27650','#a8704a'][i],face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`c-h${i}`,.26),.6+i*.55,2.0,{layer:3,s:0,tab:false}));
  const lBall=B.stand(S.ball(K+'c-ball',.1),-2.2,.4,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.9):b.t;
   goal.s=beat(t,.3,1.1);keeper.body.s=beat(t,1.2,2);
   // 2002: Cafu is Brazil's captain.
   cafuL.body.s=beat(t,2.2,3);capCard.s=beat(t,3.4,4.2);cafuL.armR.rot=.12+1.2*beat(t,4.2,4.8)*(1-beat(t,5.6,6.2));striker.body.s=beat(t,3.6,4.4);
   // Brazil beat Germany 2–0: two shots go in.
   board.s=beat(t,5.9,6.7);lBall.s=beat(t,6,6.4);
   const shots=[7.0,8.6];let bx=-1.7,bz=.8,dy=0;shots.forEach((a,i)=>{if(t>=a&&t<a+.8){const u=(t-a)/.8;bx=-1.7+(i?-1.3:-.5)*u;bz=.8-2.0*u;dy=.25*Math.sin(u*Math.PI);}});
   lBall.visible=t<9.4;lBall.x=bx;lBall.z=bz;lBall.dy=dy;lBall.rot=-t*3;
   striker.leg!.rot=-1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));keeper.body.rot=(t<8.2?-.8:.8)*Math.min(1,pulse(t,7.2,8.2)+pulse(t,8.8,9.8));
   score.scale=beat(t,9.2,10);score.visible=score.scale>.02;cheer(striker,beat(t,9.4,10)*(1-beat(t,11.6,12.2)));cheer(cafuL,beat(t,9.6,10.2)*(1-beat(t,11.8,12.4)));
   // The podium; his shirt says 100% Jardim Irene.
   pod.s=beat(t,10.4,11.2);cafuR.body.s=beat(t,11,11.8);patch.scale=beat(t,12.8,13.6);big.s=beat(t,13.6,14.4);
   // Raise the trophy.
   const r=Math.max(beat(t,17.4,18.8),manual?beat(act,0,.8):0);cup.dy=cafuR.h*.5*r-.08;cheer(cafuR,r);
   fw.forEach((f,i)=>{const a=Math.max(beat(t,18.4+i*.4,19.4+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   const cf=Math.max(beat(t,18.6,20.4),manual?beat(act,.7,1):0);conf.visible=cf>0;conf.dy=-1.1+1.3*cf;
   // A foundation in Jardim Irene to help children.
   found.s=beat(t,19.6,20.4);kids.forEach((p,i)=>{p.body.s=beat(t,20.6+i*.5,21.4+i*.5);});
   // Everything he has, he owes to Jardim Irene.
   hearts.forEach((h,i)=>{h.s=beat(t,25+i*.5,25.7+i*.5);h.dy=.06*wave(t,26,33,.6);});
   // Help the players coming after you.
   kids.forEach((p,i)=>cheer(p,beat(t,29+i*.3,29.6+i*.3)));cheer(cafuL,beat(t,30,30.6));
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,9.8,10.6)+.45*beat(t,10.6,11.4)-.45*beat(t,28.4,29.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={jardim,trials,yes,rightback,finals,captain};
void pulse;void wave;void clamp01;void maxOf;
