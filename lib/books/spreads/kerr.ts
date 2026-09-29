/**
 * The six Sam Kerr pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/kerr/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: a swapped ball, a calendar, a setting sun, a bench, a comeback bar.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='kerr-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const SAM={skin:'#d9a27c',hair:'bun' as const,hairColor:'#2a2220'};
const SKINS=['#f1b88f','#7f5138','#d99a6c','#b27650'];

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function paving(k:Kit,x0:number,x1:number,tone='#e3d6bb',line='#b2a283'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.14);
 for(let y=.5;y<PAGE_D;y+=.5)k.key(`M${x0} ${y} L${x1} ${y}`,.01,line);for(let r=0;r<13;r++)for(let x=x0+(r%2)*.4;x<x1;x+=.8)k.key(`M${x} ${r*.5} L${x} ${r*.5+.5}`,.01,line);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function road(k:Kit,x0:number,x1:number,y:number){const r=rect(x0,y-.22,x1-x0,.44);k.fill(r,'#8d8a86');k.dots(r,INK.navy,.05,.2);dash(k,x0+.1,y,x1-.1,y,.03,INK.yellow,.2);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function hills(k:Kit,w:number,h:number,y:number,tone:string,dot:string=INK.navy){const p=`M0 ${y} Q${w*.28} ${y-.5} ${w*.52} ${y-.15} Q${w*.78} ${y+.1} ${w} ${y-.3} L${w} ${h} L0 ${h} Z`;k.fill(p,tone);k.dots(p,dot,.05,.22);}
function roofs(k:Kit,x0:number,x1:number,y:number,seed=1){for(let x=x0,i=0;x<x1;x+=.42,i++){const hh=.3+((i*7+seed)%4)*.09,b=rect(x,y-hh,.36,hh);k.fill(b,['#f2d3a0','#f0b7a4','#f6e2b8','#e9c28e'][(i+seed)%4]);k.key(b,.01);k.fill(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),INK.red);k.key(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),.01);k.fill(rect(x+.12,y-hh+.08,.1,.1),(i+seed)%3?INK.blue:INK.yellow);}}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const faceCard=(key:string,s:number,mood:'happy'|'sad'|'worried',color:string)=>sp(key,s,s,k=>{const c=s/2,r=s*.46;k.fill(ell(c,c,r,r),color);k.dots(ell(c,c,r,r),INK.navy,.03,.18);k.key(ell(c,c,r,r),.014);
 k.circle(c-s*.15,c-s*.06,s*.045,INK.navy,true);k.circle(c+s*.15,c-s*.06,s*.045,INK.navy,true);const lw=s*.05;
 if(mood==='happy')k.key(`M${c-s*.18} ${c+s*.1} Q${c} ${c+s*.3} ${c+s*.18} ${c+s*.1}`,lw);
 else if(mood==='sad')k.key(`M${c-s*.16} ${c+s*.25} Q${c} ${c+s*.08} ${c+s*.16} ${c+s*.25}`,lw);
 else k.key(`M${c-s*.18} ${c+s*.2} Q${c-s*.09} ${c+s*.12} ${c} ${c+s*.2} Q${c+s*.09} ${c+s*.28} ${c+s*.18} ${c+s*.2}`,lw*.9);},{rim:.02});
const rainCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.7],[0,h*.45],[w*.16,h*.24],[w*.32,h*.05],[w*.56,0],[w*.74,h*.16],[w*.92,h*.24],[w,h*.52],[w*.88,h*.7]]);k.fill(p,'#9aa0b4');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<5;i++){const x=w*(.16+i*.17),y=h*(.78+(i%2)*.1);k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const starShape=(c:number,r:number,ri:number)=>poly(Array.from({length:10},(_,i)=>{const a=i/10*TAU-Math.PI/2,rr=i%2?ri:r;return [c+Math.cos(a)*rr,c+Math.sin(a)*rr];}));
const armband=(key:string,s:number)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),INK.yellow);k.key(ell(s/2,s/2,s*.46,s*.46),.01);k.text('C',s/2,s*.7,s*.6,INK.navy);},{rim:.012});
const gatePosts=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.12]){const p=rect(x,h*.1,.12,h*.9);k.fill(p,INK.stone);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.fill(ell(x+.06,h*.1,.08,.05),INK.grey);}
 k.key(`M.06 ${h*.14} Q${w/2} ${-h*.02} ${w-.06} ${h*.14}`,.03,INK.navy);});
const gateLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M0 .02 L${w} .02 M0 ${h-.03} L${w} ${h-.03}`,.035,INK.navy);for(let x=.04;x<w;x+=.1)k.key(`M${x} 0 L${x} ${h}`,.022,INK.navy);k.circle(w*.5,h*.5,.05,INK.gold);},{rim:.012,grain:.5});
const calendar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);const b=rect(0,0,w,h*.8);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.14),INK.red);for(let i=0;i<4;i++)k.circle(w*(.2+i*.2),h*.07,.03,INK.white,true);});
const monthCard=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.key(b,.012);k.text(label,w/2,h*.4,h*.28,INK.navy,{weight:900,max:w*.8});for(let r=0;r<3;r++)for(let c=0;c<5;c++)k.circle(w*(.14+c*.18),h*(.58+r*.13),.018,INK.navy);},{rim:.012});
const bandage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f6d8b8');k.key(b,.01);k.fill(rect(w*.35,0,w*.3,h),'#ecc39c');for(let i=0;i<3;i++)for(let j=0;j<2;j++)k.circle(w*(.42+i*.08),h*(.35+j*.3),.008,INK.brown);},{rim:.012});

/** Two ball cut-outs (one per page) share one trajectory so a pass can cross the gutter. */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
const cheer=(p:{armL:{rot:number};armR:{rot:number}},v:number,extra=0)=>{p.armL.rot=-.12-2.3*v-extra;p.armR.rot=.12+2.3*v+extra;};


/* ───────────── Kerr-only plates ───────────── */
const footyBall=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=ell(w/2,h/2,w*.48,h*.46);k.fill(b,'#c0492f');k.dots(b,INK.brown,.025,.35);k.key(b,.014);k.key(`M${w*.3} ${h/2} L${w*.7} ${h/2}`,.016,INK.white);for(let i=0;i<4;i++){const x=w*(.38+i*.08);k.key(`M${x} ${h*.42} L${x} ${h*.58}`,.012,INK.white);}},{rim:.015,roll:true});
const footyPosts=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const xs=[0,w*.3,w*.7-.08,w-.08];xs.forEach((x,i)=>{const hh=i===1||i===2?h:h*.62,p=rect(x,h-hh,.08,hh);k.fill(p,INK.white);k.key(p,.01);for(let y=h-hh+.1;y<h;y+=.3)k.fill(rect(x,y,.08,.06),i===1||i===2?INK.red:INK.blue);});});
const medal=(key:string,s:number)=>sp(key,s,s*1.3,k=>{k.fill(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),INK.pink);k.key(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),.008);const c=ell(s/2,s*.85,s*.4,s*.4);k.fill(c,INK.gold);k.dots(c,INK.orange,.025,.35);k.key(c,.01);k.circle(s/2,s*.85,s*.18,INK.yellow,true);},{rim:.012});
const sunArm=(key:string,len:number,r:number)=>sp(key,r*2,len,k=>{k.fill(rect(r-.03,r,.06,len-r),INK.stock);k.key(rect(r-.03,r,.06,len-r),.006,'#9c8a66');for(let i=0;i<12;i++){const a=i/12*TAU;k.fill(poly([[r+Math.cos(a)*r*.62,r+Math.sin(a)*r*.62],[r+Math.cos(a+.13)*r,r+Math.sin(a+.13)*r],[r+Math.cos(a+.26)*r*.62,r+Math.sin(a+.26)*r*.62]]),INK.orange);}const c=ell(r,r,r*.6,r*.6);k.fill(c,INK.yellow);k.dots(c,INK.orange,.03,.3);k.key(c,.012);},{rim:.012});
const segment=(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.hatch(b,INK.white,.08,.8,.012);k.key(b,.013);k.text(label,w/2,h*.66,h*.36,INK.navy,{weight:900,max:w*.88});},{rim:.015});
const barFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.7,.06,h*.3),INK.brown);k.keyFill(rect(w*.9-.06,h*.7,.06,h*.3),INK.brown);const b=rect(0,0,w,h*.7);k.fill(b,INK.white);k.key(b,.016);const inner=rect(w*.04,h*.2,w*.92,h*.4);k.fill(inner,'#e9e2cf');k.key(inner,.01);k.text('MY COMEBACK',w/2,h*.14,h*.1,INK.pink,{weight:900});});
const subBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.45,h*.55,w*.1,h*.45),INK.grey);const b=rect(0,0,w,h*.55);k.fill(b,'#1a1a1a');k.key(b,.014);k.fill(rect(w*.06,h*.08,w*.4,h*.38),INK.grass);k.fill(rect(w*.54,h*.08,w*.4,h*.38),INK.red);k.text('ON',w*.26,h*.34,h*.16,INK.white,{weight:900});k.text('OFF',w*.74,h*.34,h*.16,INK.white,{weight:900});});
const hillCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M0 ${h} L0 ${h*.45} Q${w*.25} ${-h*.1} ${w*.5} ${h*.3} Q${w*.75} ${h*.05} ${w} ${h*.35} L${w} ${h} Z`;k.fill(p,'#6d8f76');k.dots(p,INK.navy,.05,.25);k.key(p,.012);},{rim:.015});
const palm=(key:string,w:number,h:number)=>S.tree(K+key,w,h,'palm');

/* ───────────── 1 · A new game at twelve (footy) ───────────── */
const footy:SpreadDef={id:'footy',rest:17.3,
 left:k=>{const o=ell(-2.5,Z(-.2),2.3,1.6);k.fill(rect(-5,0,5,PAGE_D),'#b9d38a');k.fill(o,INK.grass,.9);k.dots(o,INK.leaf,.05,.3);chalk(k,o);chalk(k,ell(-2.5,Z(-.2),.3,.3));chalk(k,rect(-2.9,Z(-.6),.8,.8),.02);
  k.text('PERTH · 1993',-2.5,Z(2.62),.44,INK.blue,{max:4});k.text('AUSTRALIAN RULES FOOTBALL',-2.5,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.6,Z(.2),.7,.7));
  k.text('SOCCER AT TWELVE',2.5,Z(2.62),.38,INK.pink,{max:4.2});k.text('A NEW BALL, A NEW TEAM, NEW SKILLS',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.5);const river=rect(0,1.9,4.5,.35);k.fill(river,INK.blue);k.dots(river,INK.navy,.045,.3);
    for(let i=0;i<7;i++){const x=1.8+i*.36,hh=.4+((i*5)%4)*.18,b=rect(x,1.9-hh,.3,hh);k.fill(b,i%2?'#cfd6e6':'#e4e9f2');k.key(b,.01);}k.fill(rect(0,2.25,4.5,.75),'#b9d38a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);hills(k,4.5,3,1.9,INK.leaf);const cl=rect(1.2,1.55,1.6,.6);k.fill(cl,'#f1e3c6');k.key(cl,.012);k.fill(rect(1.1,1.47,1.8,.1),INK.blue);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'f-sun',.34),'L',3.8,2.2,{out:.012}),cloud=bd.add(rainCloud('f-cloud',1.0,.55),'R',2.4,2.1,{out:.03});
  const sign=B.stand(S.sign(K+'f-sign',1.0,1.2,'PERTH'),-4.4,-.9,{layer:2});const y93=sign.flap(S.flipCard(K+'f-1993',.8,.36,'1993',INK.pink),0,1.2*.56,{z:.03});
  B.stand(footyPosts('f-posts',1.8,1.5),-2.5,-1.95,{layer:1});
  const dad=B.person(K+'f-dad',-3.3,.55,1.75,{shirt:'casual',hair:'short',hairColor:'#2a2220',adult:true,skin:'#c98b62',number:'4',face:'smile',layer:2});
  const bro=B.person(K+'f-bro',-1.4,-.35,1.42,{shirt:'ger',hair:'short',hairColor:'#2a2220',skin:'#c98b62',number:'4',legs:'kick',face:'grin',layer:2});
  const SL=B.person(K+'f-samL',-2.4,.9,1.05,{shirt:'ger',...SAM,legs:'kick',face:'smile',layer:3});
  const oval=B.stand(footyBall('f-oval',.3,.2),-2,1,{layer:3,tab:false});
  const rules=B.stand(S.sign(K+'f-rules',1.0,1.2,'RULES',INK.grey),-.7,.7,{layer:2,s:0});
  const noGirls=rules.add(S.icon(K+'f-x',.3,'cross'),0,1.22,{z:.02});noGirls.scale=0;
  const ped=B.stand(S.post(K+'f-ped',.5,.55,INK.white),1.0,.25,{layer:2});
  const round=ped.add(S.ball(K+'f-round',.2),0,.55,{z:.012});const cover=ped.flap(footyBall('f-cover',.5,.34),0,.95,{z:.03});
  B.stand(S.goal(K+'f-goal',1.5,.8),3.9,-1.3,{layer:1});
  const SR=B.person(K+'f-samR',1.9,.85,1.1,{shirt:'fan',...SAM,legs:'kick',face:'grin',layer:3});
  const team=[[2.8,-.6,'long'],[3.7,.1,'curly'],[4.4,-.9,'short']].map(([x,z,h],i)=>B.person(K+`f-t${i}`,x as number,z as number,1.2,{shirt:'fan',hair:h as 'long',skin:SKINS[(i+1)%4],face:'grin',layer:i===2?1:2}));
  const cards=['NEW BALL','NEW TEAM','NEW SKILLS'].map((l,i)=>B.stand(S.flipCard(K+`f-c${i}`,.95,.32,l,[INK.yellow,INK.sky,INK.pink][i],INK.navy),.9+i*1.3,1.7,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'f-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.3):b.t;
   sun.dy=.3*beat(t,0,2);y93.flip=-2.9+2.9*beat(t,2.6,3.4);
   dad.body.s=beat(t,7.8,8.8);bro.body.s=beat(t,8.8,9.8);SL.body.s=beat(t,14.1,15)*(1-beat(t,22.6,23.4));
   // footy kicks between dad, Daniel and Sam
   const [ox,oz,oy]=track(t,[[9.6,-3.3,.5,0],[10.8,-1.7,-.25,.7],[11.6,-1.7,-.25,0],[12.8,-3.3,.5,.7],[14.6,-3.3,.5,0],[15.8,-2.1,.95,.5],[16.8,-2.1,.95,0]]);
   oval.x=ox;oval.z=oz;oval.dy=oy;oval.rot=t*3;oval.visible=t>9.4&&t<22.6;
   bro.leg!.rot=-1*pulse(t,10.2,10.9);SL.leg!.rot=-1*pulse(t,16.4,17);dad.armR.rot=.12+1.8*pulse(t,12.3,13.6);
   // Swap the ball.
   const swap=manual?beat(act,0,.6):beat(t,17.8,19);cover.flip=-3.0*swap;round.scale=1;
   rules.s=beat(t,19.6,20.4);noGirls.scale=beat(t,20.6,21.2);noGirls.visible=noGirls.scale>.02;
   cloud.scale=beat(t,20.2,21.2)*(1-beat(t,27.6,28.8));cloud.visible=cloud.scale>.02;
   SR.body.s=Math.max(beat(t,23,24),manual?beat(act,.5,.9):0);
   team.forEach((p,i)=>{p.body.s=beat(t,28.4+i*.5,29.2+i*.5);});cards.forEach((c,i)=>{c.s=beat(t,28.2+i*1.3,28.9+i*1.3);});
   const [bx,bz]=t<30?[2.25,.95]:track(t,[[30,2.25,.95],[31,3.7,.35],[31.8,3.7,.35],[32.8,2.25,.95]]);ball(bx,bz,0,t>23.4||manual);
   SR.leg!.rot=-1*pulse(t,29.8,30.4);cheer(SR,Math.max(beat(t,33.4,34),manual?beat(act,.9,1):0));team.forEach((p,i)=>cheer(p,beat(t,33.8+i*.3,34.4+i*.3)));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,17,18)+.3*beat(t,23,24)-.3*beat(t,33,34):0;
  };
 }};

/* ───────────── 2 · Starting behind (knights) ───────────── */
const knights:SpreadDef={id:'knights',rest:18.6,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);for(let i=0;i<6;i++)k.circle(-4.4+i*.6,Z(.95),.06,INK.orange);
  k.text('WESTERN KNIGHTS',-2.5,Z(2.62),.38,INK.blue,{max:4.4});k.text('MOSMAN PARK · A JUNIOR TEAM',-2.5,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.6,Z(.1),.7,.7));
  k.text('PERTH GLORY · AGED 15',2.5,Z(2.62),.34,INK.yellow,{max:4.4});k.text('THE YOUNGEST PLAYER EVER IN HER LEAGUE',2.5,Z(2.9),.13,INK.white,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.6);hills(k,4.5,3,1.9,'#a9b78a');const cl=rect(.5,1.5,1.4,.65);k.fill(cl,'#f1e3c6');k.key(cl,.012);k.fill(rect(.4,1.42,1.6,.1),INK.blue);k.fill(rect(0,2.35,4.5,.65),'#9dbd78');}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#3b2a5e',INK.pink);crowd(k,4.5,1.3,2.5,['#8a5bb8',INK.orange,INK.white,'#8a5bb8'],2);lightRig(k,.9,.3);lightRig(k,3.8,.35);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'k-sun',.32),'L',3.6,2.2,{out:.012});
  const fw=[bd.add(S.firework(K+'k-fw1',.4,INK.orange),'R',1.4,1.9,{out:.03}),bd.add(S.firework(K+'k-fw2',.36,INK.pink),'R',3.2,2.0,{out:.03})];
  B.stand(S.goal(K+'k-goalL',1.4,.75),-2.4,-1.75,{layer:1});
  for(const [x,z] of [[-3.8,.2],[-3.0,.5],[-2.3,.2],[-1.65,.5]])B.stand(S.cone(K+`k-cone${x}`,.3),x,z,{layer:2});
  const yrs=['2006','2007','2008'].map((y,i)=>B.stand(S.flipCard(K+`k-y${y}`,.6,.3,y,[INK.pink,INK.orange,INK.blue][i]),-4.4+i*.72,-1.1,{layer:2,s:0}));
  const S1=B.person(K+'k-sam',-4.2,.95,1.12,{shirt:'fan',...SAM,legs:'kick',face:'open',layer:3});
  const worry=S1.body.add(faceCard('k-worry',.34,'worried',INK.orange),.34,S1.h*1.02,{z:-.02,anchor:'center'});
  const mates=[[-1.2,-.7,'long'],[-2.1,-.75,'curly']].map(([x,z,h],i)=>B.person(K+`k-m${i}`,x as number,z as number,1.16,{shirt:'fan',hair:h as 'long',skin:SKINS[i*2],face:'grin',layer:2}));
  const board=B.stand(lineCard('k-noticed',1.3,.8,['A PERTH GLORY','STRIKER'],INK.yellow),-.72,2.0,{layer:3});
  const cover=board.flap(lineCard('k-who',1.3,.8,['WHO','NOTICED?'],INK.pink,INK.white),0,.8,{z:.02});
  const scout=B.person(K+'k-scout',1.1,1.1,1.6,{shirt:'navy',hair:'short',adult:true,skin:'#f1c6a0',face:'smile',layer:3});
  const star=scout.body.add(S.bubble(K+'k-star',.5,.42,'star'),.5,scout.h*.95,{z:-.02});
  const exc=B.stand(S.flipCard(K+'k-exc',1.2,.34,'EXCEPTIONAL',INK.yellow,INK.navy),-3.3,2.2,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'k-goal',1.6,.85),3.9,-1.3,{layer:1});B.stand(S.bench(K+'k-bench',1.3,.5),2.4,-1.4,{layer:1});
  const gSign=B.stand(S.sign(K+'k-gsign',1.3,1.2,'PERTH GLORY',INK.orange),1.1,-1.3,{layer:1,s:0});
  const SR=B.person(K+'k-samR',1.6,.6,1.3,{shirt:'casual',...SAM,legs:'kick',face:'grin',layer:3});
  const glory=[[2.7,-.5,'bun'],[3.6,.3,'short'],[4.4,-.9,'curly']].map(([x,z,h],i)=>B.person(K+`k-g${i}`,x as number,z as number,1.28,{shirt:'casual',hair:h as 'bun',skin:SKINS[(i+1)%4],face:'grin',layer:i===2?1:2}));
  const young=B.stand(S.flipCard(K+'k-young',1.2,.32,'AGE 15',INK.pink),1.4,1.6,{layer:3,s:0,tab:false});
  const aus=B.stand(S.flipCard(K+'k-aus',1.2,.32,'AUSTRALIA TOO',INK.yellow,INK.navy),3.4,1.7,{layer:3,s:0,tab:false});
  const SA=B.person(K+'k-samAus',4.3,1.1,1.3,{shirt:'bib',...SAM,face:'grin',layer:3});
  const ball=ballPair(B,'k-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.6):b.t;
   sun.dy=.3*beat(t,0,2);S1.body.s=beat(t,2,2.8);mates.forEach((p,i)=>{p.body.s=beat(t,3+i*.4,3.8+i*.4);});
   // Struggles: the ball runs away from her between the cones, then she gets it back.
   const drib=beat(t,3.4,14.6);S1.body.x=-4.2+2.1*drib;
   let [bx,bz]=[S1.body.x+.35,1.05];if(t>7.6&&t<11.4){[bx,bz]=track(t,[[7.6,S1.body.x+.35,1.05],[8.6,-1.8,1.9],[11,-1.8,1.9],[11.4,S1.body.x+.35,1.05]]);}
   ball(bx,bz,0,t>2.2&&t<31.6);S1.leg!.rot=-.8*Math.abs(Math.sin(t*4))*(t>3.4&&t<14.6?1:0);
   const w=beat(t,7.8,8.4)*(1-beat(t,14.6,15.2));worry.scale=w;worry.visible=w>.02;S1.body.yaw=-.4*pulse(t,8.4,11);
   yrs.forEach((c,i)=>{c.s=beat(t,15.2+i*.9,15.8+i*.9);});
   // Lift the flap.
   const lift=manual?beat(act,0,.6):beat(t,19.2,20.4);cover.flip=-2.8*lift;
   scout.body.s=Math.max(beat(t,21.4,22.4),manual?beat(act,.4,.9):0);star.scale=beat(t,23.6,24.2)*(1-beat(t,31,31.6));star.visible=star.scale>.02;scout.armL.rot=-.12-1.6*beat(t,22.8,23.4);scout.body.s*=1-beat(t,31.4,32);gSign.s=beat(t,21.2,22);
   exc.s=beat(t,28,28.8);cheer(S1,beat(t,28.6,29.2)*(1-beat(t,31,31.6)));
   SR.body.s=beat(t,32,32.8);glory.forEach((p,i)=>{p.body.s=beat(t,32.4+i*.3,33.2+i*.3);});young.s=beat(t,33.4,34.2);
   aus.s=beat(t,36,36.8);SA.body.s=beat(t,36.4,37.2);fw.forEach((q,i)=>{q.scale=beat(t,34+i*.5,35+i*.5);q.visible=q.scale>.02;q.rot=t*.2;});
   cheer(SR,beat(t,39,39.6));cheer(SA,beat(t,39.3,39.9));glory.forEach((p,i)=>cheer(p,beat(t,39.4+i*.2,40+i*.2)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,31.4,32.4)-.4*beat(t,38.4,39.2):0;
  };
 }};

/* ───────────── 3 · Hurt before the World Cup (surgery) ───────────── */
const surgery:SpreadDef={id:'surgery',rest:11.2,
 left:k=>{paving(k,-5,0,'#e6e0d0','#b8ad94');const mat=rect(-4.6,Z(-.4),3.2,1.6);k.fill(mat,INK.sky,.6);k.dots(mat,INK.blue,.05,.3);for(let i=0;i<7;i++)k.key(rect(-4.4+i*.42,Z(1.6),.3,.3),.02,INK.orange);
  k.text('DECEMBER 2014',-2.5,Z(2.62),.42,INK.navy,{max:4.2});k.text('A KNEE OPERATION · A FITNESS COACH',-2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.6,Z(.2),.7,.7));
  k.text('WORLD CUP · CANADA',2.5,Z(2.62),.36,INK.pink,{max:4.4});k.text('THE STARTING STRIKER',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#e4e9f2',INK.sky,y=>.3-y*.06);const w=rect(.3,.5,3.9,1.9);k.fill(w,'#f3ede0');k.key(w,.012);for(let i=0;i<3;i++){const win=rect(.6+i*1.25,.8,.9,.7);k.fill(win,INK.sky2);k.key(win,.012);}k.fill(rect(0,2.4,4.5,.6),'#e6e0d0');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);for(let i=0;i<8;i++){const x=.3+i*.55;k.fill(poly([[x,1.2],[x+.22,1.9],[x-.22,1.9]]),INK.green);}crowd(k,4.5,1.85,2.45,[INK.yellow,INK.green,INK.white,INK.red],3);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'s-ban',2.4,.4,'WORLD CUP · CANADA',INK.red),'R',1.2,2.45,{out:.02}),sun=bd.add(S.sun(K+'s-sun',.34),'R',3.8,2.0,{out:.012});
  const cal=B.stand(calendar('s-cal',1.1,1.45),-.9,-1.2,{layer:1});
  const MONTHS=['DEC','JAN','FEB','MAR','APR','MAY'];
  cal.add(monthCard('s-wc',.9,.9,'WORLD CUP',INK.grass),0,.32,{z:.012});
  const months=MONTHS.map((m,i)=>cal.flap(monthCard(`s-${m}`,.9,.9,m,[INK.yellow,INK.sky,INK.pink][i%3]),0,1.22,{z:.03-i*.002}));
  const Ssad=B.person(K+'s-samSad',-3.0,.55,1.28,{shirt:'bib',...SAM,face:'sad',layer:3});
  const wrap=Ssad.body.add(bandage('s-wrap',.18,.14),-.09,Ssad.h*.2,{z:.02,anchor:'center'});
  const Sfit=B.person(K+'s-samFit',-3.0,.55,1.28,{shirt:'bib',...SAM,legs:'kick',face:'grin',layer:3});
  const coach=B.person(K+'s-coach',-1.7,.2,1.72,{shirt:'coach',hair:'short',adult:true,skin:'#f1c6a0',face:'smile',layer:2});
  const cheerCoach=coach.body.add(S.bubble(K+'s-cc',.5,.42,'heart'),.45,coach.h*.95,{z:-.02});
  const plane=bd.add(S.plane(K+'s-plane',.7,.35),'L',2.4,2.3,{out:.03});
  const board=B.stand(S.scoreboard(K+'s-board',1.7,1.3,'AUSTRALIA'),1.35,-1.85,{layer:1,s:0});
  board.add(S.flipCard(K+'s-bra',1.3,.58,'1–0 BRA',INK.pink),0,.36,{z:.012});const fNga=board.flap(S.flipCard(K+'s-nga',1.3,.58,'2–0 NGA','#3d5da0'),0,.94,{z:.024});
  B.stand(S.goal(K+'s-goal',1.6,.85),3.9,-1.3,{layer:1});
  const SR=B.person(K+'s-samR',1.6,.7,1.3,{shirt:'bib',...SAM,legs:'kick',face:'grin',layer:3});
  const team=[[2.7,-.3,'long'],[3.6,.5,'short'],[4.4,-.7,'curly']].map(([x,z,h],i)=>B.person(K+`s-t${i}`,x as number,z as number,1.26,{shirt:'bib',hair:h as 'long',skin:SKINS[(i+1)%4],face:'grin',layer:i===2?1:2}));
  const qf=B.stand(S.flipCard(K+'s-qf',1.3,.32,'QUARTER-FINALS',INK.yellow,INK.navy),3.4,1.8,{layer:3,s:0,tab:false});
  const start=B.stand(S.flipCard(K+'s-start',1.1,.3,'STARTING XI',INK.pink),1.4,1.7,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'s-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,11.2):b.t;
   const fit=manual?beat(act,.6,1):beat(t,16.4,17.4);Ssad.body.s=beat(t,2.3,3.2)*(1-fit);Sfit.body.s=fit;wrap.scale=beat(t,3.4,4)*(1-fit);wrap.visible=wrap.scale>.02;
   plane.dx=1.4*beat(t,7.8,10.6);plane.visible=t>7.6&&t<10.8;ban.scale=beat(t,8,9);ban.visible=ban.scale>.02;
   // Turn the calendar pages (three taps flip two months each).
   months.forEach((m,i)=>{const on=manual?beat(act,Math.floor(i/2)/3,(Math.floor(i/2)+.7)/3):beat(t,13.8+i*.75,14.3+i*.75);m.flip=-3.2*on;});
   coach.body.s=beat(t,13.6,14.4);cheerCoach.scale=beat(t,15,15.6)*(1-beat(t,18,18.6));cheerCoach.visible=cheerCoach.scale>.02;
   const ex=t>14.4&&t<17.8;Sfit.armL.rot=-.12-2.1*(ex?Math.abs(Math.sin(t*3)):0);Sfit.armR.rot=.12+2.1*(ex?Math.abs(Math.sin(t*3)):0);coach.armR.rot=.12+1.2*beat(t,14.4,15);
   SR.body.s=Math.max(beat(t,18.4,19.2),manual?beat(act,.8,1):0);team.forEach((p,i)=>{p.body.s=beat(t,18.8+i*.3,19.6+i*.3);});start.s=beat(t,20,20.8);
   const shots=[24.8,28.4];SR.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   let bx=1.95,bz=.75;for(const a of shots)if(t>a&&t<a+2.4)[bx,bz]=track(t,[[a,1.95,.75],[a+.9,3.9,-1.05],[a+2.4,3.9,-1.05]]);ball(bx,bz,0,t>18.8);
   fNga.flip=-3.2*beat(t,29.2,30);board.s=beat(t,24.4,25.2);qf.s=beat(t,29.8,30.6);
   team.forEach((p,i)=>cheer(p,beat(t,25.8+i*.2,26.4+i*.2)*(1-beat(t,27.6,28.2))+beat(t,30+i*.2,30.6+i*.2)));cheer(SR,beat(t,25.6,26.2)*(1-beat(t,27.6,28.2))+beat(t,30,30.6));
   sun.dy=.3*beat(t,31.8,33);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 4 · A season lost (ankle) ───────────── */
const ankle:SpreadDef={id:'ankle',rest:17.4,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(-2.5,Z(.3),.7,.7));
  k.text('PERTH GLORY',-2.5,Z(2.62),.44,INK.orange,{max:4.2});k.text('ONE GOAL, THEN AN ANKLE INJURY',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5,'#8fc467',INK.leaf);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(2.6,Z(.3),.7,.7));
  k.text('THE NEXT SEASON',2.5,Z(2.62),.38,INK.pink,{max:4.2});k.text('TEN GOALS · THE GRAND FINAL',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.4);hills(k,4.5,3,1.75,'#6d8f76');crowd(k,4.5,1.75,2.4,['#8a5bb8',INK.orange,INK.white],1);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.5,2.4,['#8a5bb8',INK.orange,INK.white,INK.yellow],4);lightRig(k,.8,.5);lightRig(k,3.9,.5);k.fill(rect(0,2.4,4.5,.6),'#8fc467');}},-3.05,1.22);
  const sunA=bd.add(sunArm('a-sunarm',1.4,.34),'L',1.6,.6,{out:.012});bd.add(hillCard('a-hill',3.2,.75),'L',1.6,.5,{out:.03});
  const rain=bd.add(rainCloud('a-rain',1.2,.65),'L',3.0,2.1,{out:.03});
  const ban=bd.add(S.banner(K+'a-ban',2.2,.4,'GRAND FINAL',INK.orange),'R',1.0,2.5,{out:.02});
  B.stand(S.goal(K+'a-goalL',1.6,.85),-2.5,-1.65,{layer:1});
  const keeper=B.person(K+'a-keeper',-2.5,-1.35,1.26,{shirt:'keeper',hair:'long',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const goalCard=B.stand(S.flipCard(K+'a-win',1.1,.32,'WINNING GOAL',INK.yellow,INK.navy),-4.1,-.6,{layer:2,s:0});
  const only=B.stand(S.flipCard(K+'a-only',1.1,.32,'1 GOAL',INK.pink),-4.1,-.1,{layer:2,s:0});
  const S1=B.person(K+'a-sam',-2.2,.7,1.3,{shirt:'casual',...SAM,legs:'kick',face:'grin',layer:3});
  const Ss=B.person(K+'a-samSad',-2.0,.7,1.3,{shirt:'casual',...SAM,face:'sad',layer:3});
  const wrap=Ss.body.add(bandage('a-wrap',.16,.12),.08,Ss.h*.05,{z:.02,anchor:'center'});
  const mate=B.person(K+'a-mate',-1.0,.1,1.26,{shirt:'casual',hair:'curly',skin:SKINS[3],face:'grin',layer:2});
  const bench=B.stand(S.bench(K+'a-bench',1.2,.5),-1.1,1.2,{layer:2});void bench;
  const counter=B.stand(S.scoreboard(K+'a-count',1.3,1.25,'GOALS'),1.3,-1.8,{layer:1});
  counter.add(S.flipCard(K+'a-c10',.9,.52,'10',INK.pink),0,.34,{z:.012});
  const cnt=['1','2','3','4','5','6','7','8','9'].map((l,i)=>counter.flap(S.flipCard(K+`a-c${l}`,.9,.52,l,i%2?INK.blue:'#3d5da0'),0,.86,{z:.04-i*.003}));
  B.stand(S.goal(K+'a-goal',1.6,.85),3.9,-1.3,{layer:1});
  const SR=B.person(K+'a-samR',2.0,.7,1.3,{shirt:'casual',...SAM,legs:'kick',face:'grin',layer:3});
  const team=[[3.0,-.3,'long'],[4.3,.4,'short']].map(([x,z,h],i)=>B.person(K+`a-t${i}`,x as number,z as number,1.26,{shirt:'casual',hair:h as 'long',skin:SKINS[i+1],face:'grin',layer:2}));
  const med=B.stand(medal('a-medal',.5),3.4,1.55,{layer:3,s:0,tab:false});
  const medCard=B.stand(S.flipCard(K+'a-jd',1.5,.32,'JULIE DOLAN MEDAL',INK.yellow,INK.navy),3.4,2.1,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'a-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   const set=beat(t,11.4,14);const rise=manual?beat(act,0,.8):beat(t,17.8,19.4);sunA.rot=1.5*set*(1-rise);
   S1.body.s=beat(t,1.9,2.8)*(1-beat(t,11,11.6));mate.body.s=beat(t,2.4,3.2);keeper.body.s=beat(t,2.2,3);
   let [bx,bz,by]=[-1.85,.8,0];if(t>4.6)[bx,bz,by]=track(t,[[4.6,-1.85,.8,0],[5.5,-2.4,-1.3,.3],[7,-2.4,-1.3,0]]);ball(bx,bz,by,t>2.2&&t<11);
   S1.leg!.rot=-1.1*pulse(t,4.3,4.9);keeper.body.rot=-.7*pulse(t,5,6.4);cheer(S1,beat(t,5.6,6.2)*(1-beat(t,9.6,10.2)));cheer(mate,beat(t,5.8,6.4)*(1-beat(t,9.6,10.2)));
   goalCard.s=beat(t,6,6.8);only.s=beat(t,8,8.8);
   Ss.body.s=beat(t,11,11.6)*(1-beat(t,19.8,20.4));wrap.scale=beat(t,11.8,12.4);wrap.visible=wrap.scale>.02;Ss.body.x=-2.0+.9*beat(t,14,16.4);Ss.body.z=.7+.7*beat(t,14,16.4);
   rain.scale=beat(t,11.6,12.6)*(1-Math.max(beat(t,18.2,19.4),manual?beat(act,.2,.8):0));rain.visible=rain.scale>.02;
   SR.body.s=Math.max(beat(t,19.8,20.6),manual?beat(act,.6,1):0);team.forEach((p,i)=>{p.body.s=beat(t,20.2+i*.4,21+i*.4);});
   cnt.forEach((c,i)=>{c.flip=-3.2*beat(t,20.2+i*.38,20.5+i*.38);});SR.leg!.rot=-1*Math.abs(Math.sin((t-20.2)*4.1))*(t>20.2&&t<23.6?1:0);
   ban.scale=beat(t,24,25);ban.visible=ban.scale>.02;med.s=beat(t,26.6,27.4);medCard.s=beat(t,27.2,28);
   cheer(SR,beat(t,27.8,28.4));team.forEach((p,i)=>cheer(p,beat(t,31.2+i*.3,31.8+i*.3)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,19.4,20.2):0;
  };
 }};

/* ───────────── 5 · Watching and waiting (homecup) ───────────── */
const homecup:SpreadDef={id:'homecup',rest:15.9,
 left:k=>{pitch(k,-5,0,'#8fc467',INK.leaf,.7);const side=rect(-5,Z(-.2),4.1,1.4);k.fill(side,'#7a8f9a',.5);k.dots(side,INK.navy,.05,.25);
  k.text('WORLD CUP 2023',-2.5,Z(2.62),.42,INK.green,{max:4.2});k.text('AT HOME IN AUSTRALIA · CAPTAIN',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.2 ${Z(-2.1)} L2.2 ${Z(-1.1)} L4.4 ${Z(-1.1)} L4.4 ${Z(-2.1)}`);
  k.text('FIRST WORLD CUP SEMI-FINAL',2.5,Z(2.62),.3,INK.yellow,{max:4.4});k.text('SEMI-FINAL: ENGLAND 3, AUSTRALIA 1',2.5,Z(2.9),.13,INK.white,{weight:800,max:4.4});},
 build:B=>{
  const cols=[INK.yellow,INK.green,INK.yellow,INK.white,INK.green];
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,cols,1);lightRig(k,1.0,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#8fc467');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,cols,4);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'h-ban',2.4,.4,'WORLD CUP 2023',INK.green),'L',1.1,2.5,{out:.02});
  const starsP=bd.add(S.stars(K+'h-stars',2.2,.6,9),'R',1.2,2.3,{out:.02});
  const games=B.stand(S.scoreboard(K+'h-games',1.5,1.25,'GROUP GAMES'),-4.1,-1.0,{layer:2});
  games.add(lineCard('h-g3',1.1,.52,['GAME 3'],INK.yellow),0,.34,{z:.012});const gf=['GAME 1','GAME 2'].map((l,i)=>games.flap(lineCard(`h-g${i}`,1.1,.52,[l],i?INK.sky:INK.pink),0,.86,{z:.03-i*.004}));
  B.stand(S.bench(K+'h-bench',1.4,.5),-2.3,-.3,{layer:2});
  const SL=B.person(K+'h-samL',-2.3,.55,1.3,{shirt:'bib',...SAM,face:'smile',layer:3});
  const band=SL.body.add(armband('h-band',.15),.17,SL.h*.62,{z:.02,anchor:'center'});
  const wrap=SL.body.add(bandage('h-wrap',.16,.12),.08,SL.h*.1,{z:.02,anchor:'center'});
  const physio=B.person(K+'h-physio',-3.6,1.5,1.66,{shirt:'coach',hair:'bun',adult:true,skin:SKINS[1],face:'smile',layer:3});
  const gate=B.stand(gatePosts('h-gate',1.5,1.0),-.95,-1.3,{layer:1});
  const gL=gate.flap(gateLeaf('h-gl',.64,.78),-.64,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(gateLeaf('h-gr',.64,.78),.64,.02,{anchor:'br',axis:'y',z:.02});
  B.stand(S.goal(K+'h-goal',1.8,.9),3.3,-1.3,{layer:1});
  const keeper=B.person(K+'h-keeper',3.3,-1.05,1.28,{shirt:'keeper',hair:'short',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const team=[[1.6,-.3,'long'],[2.4,.6,'short'],[4.4,.2,'curly']].map(([x,z,h],i)=>B.person(K+`h-t${i}`,x as number,z as number,1.26,{shirt:'bib',hair:h as 'long',skin:SKINS[(i+1)%4],face:'grin',layer:2}));
  const SR=B.person(K+'h-samR',.9,.9,1.3,{shirt:'bib',...SAM,legs:'kick',face:'grin',layer:3});
  const bandR=SR.body.add(armband('h-bandR',.15),.17,SR.h*.62,{z:.02,anchor:'center'});void bandR;
  const cards=[['DENMARK',INK.sky],['FRANCE · PENALTIES',INK.pink],['SEMI-FINAL GOAL',INK.yellow]].map(([l,c],i)=>B.stand(S.flipCard(K+`h-c${i}`,1.3,.3,l,c,INK.navy),1.1+i*1.4,1.9,{layer:3,s:0,tab:false}));
  const ball=ballPair(B,'h-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.9):b.t;
   ban.scale=beat(t,1.9,2.9);ban.visible=ban.scale>.02;SL.body.s=beat(t,2.2,3);band.scale=beat(t,5,5.6);band.visible=band.scale>.02;SL.armR.rot=.12+2.2*pulse(t,5.6,7.6);
   wrap.scale=beat(t,9,9.6);wrap.visible=wrap.scale>.02;physio.body.s=beat(t,9.2,10);physio.armR.rot=.12+.9*beat(t,10,10.6);
   team.forEach((p,i)=>{p.body.s=beat(t,10.4+i*.3,11.2+i*.3);});gf.forEach((f,i)=>{f.flip=-3.2*beat(t,12+i*1.6,12.6+i*1.6);});
   const clap=t>11.6&&t<15.6;SL.armL.rot=-.12-(clap?.9+.4*Math.sin(t*9):0);if(clap)SL.armR.rot=.12+.9+.4*Math.sin(t*9);
   // Open the tunnel gate.
   const open=manual?beat(act,0,.5):beat(t,16.2,17.4);gL.flip=-1.9*open;gR.flip=1.9*open;
   SR.body.s=Math.max(beat(t,17.4,18.2),manual?beat(act,.4,.9):0);SL.body.s=beat(t,2.2,3)*(1-Math.max(beat(t,17.2,17.8),manual?beat(act,.3,.6):0));
   cards.forEach((c,i)=>{c.s=beat(t,[18.4,21.2,25][i],[19.2,22,25.8][i]);});keeper.body.s=beat(t,17,17.8);
   const shots=[21.8,26.4];SR.leg!.rot=-1.1*maxOf(shots.map(a=>pulse(t,a-.3,a+.3)));
   let bx=1.25,bz=1.0,by=0;for(const a of shots)if(t>a&&t<a+2.4)[bx,bz,by]=track(t,[[a,1.25,1.0,0],[a+.7,2.4,-.3,.45],[a+1.3,3.5,-1.15,.3],[a+2.4,3.5,-1.15,0]]);ball(bx,bz,by,t>17.6);
   const dive=maxOf(shots.map(a=>pulse(t,a+.6,a+2)));keeper.body.rot=-.8*dive;keeper.body.dx=.25*dive;
   starsP.scale=beat(t,27.4,28.4);starsP.visible=starsP.scale>.02;cheer(SR,beat(t,27.4,28)*(1-beat(t,30.6,31.2)));
   team.forEach((p,i)=>{p.body.x=[1.6,2.4,4.4][i]-(i===2?1.6:0)*beat(t,36.6,37.8);cheer(p,beat(t,37+i*.3,37.6+i*.3));});cheer(SR,Math.max(beat(t,37.4,38),manual?beat(act,.9,1):0)+beat(t,27.4,28)*(1-beat(t,30.6,31.2)));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,16.6,17.6)+.3*beat(t,24.4,25.2)-.3*beat(t,36,37):0;
  };
 }};

/* ───────────── 6 · Back from the big injury (acl) ───────────── */
const acl:SpreadDef={id:'acl',rest:18.7,
 left:k=>{k.fill(rect(-5,0,5,PAGE_D),INK.sand);k.dots(rect(-5,0,5,PAGE_D),INK.orange,.06,.2);const p=rect(-4.7,Z(-2.0),4.4,3.0);k.fill(p,INK.grass,.85);k.dots(p,INK.leaf,.05,.3);chalk(k,p);
  k.text('MOROCCO · JANUARY 2024',-2.5,Z(2.62),.34,INK.brown,{max:4.4});k.text('AN ACL INJURY · TWENTY MONTHS',-2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.4});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.2 ${Z(-2.1)} L2.2 ${Z(-1.1)} L4.4 ${Z(-1.1)} L4.4 ${Z(-2.1)}`);
  k.text('14 SEPTEMBER 2025',2.5,Z(2.62),.38,INK.yellow,{max:4.4});k.text('HER HUNDREDTH GOAL FOR CHELSEA',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffe0a8',INK.orange,y=>.4-y/3*.3);const dunes=`M0 2.0 Q1.1 1.5 2.2 1.85 Q3.3 2.1 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(dunes,INK.sand);k.dots(dunes,INK.orange,.05,.3);k.fill(rect(0,2.4,4.5,.6),INK.sand);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.blue,INK.white,INK.blue,INK.yellow],3);lightRig(k,.9,.3);lightRig(k,3.8,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'c-sun',.34),'L',3.6,2.2,{out:.012}),rain=bd.add(rainCloud('c-rain',1.3,.7),'L',2.0,2.0,{out:.03});
  const ban=bd.add(S.banner(K+'c-ban',2.2,.4,'100 GOALS',INK.blue),'R',1.2,2.5,{out:.02});
  const fw=[bd.add(S.firework(K+'c-fw1',.42,INK.yellow),'R',1.0,1.9,{out:.03}),bd.add(S.firework(K+'c-fw2',.38,INK.sky),'R',3.4,2.0,{out:.03})];
  B.stand(palm('c-palm1',.9,1.8),-4.5,-1.4,{layer:1});B.stand(palm('c-palm2',.8,1.6),-.7,-1.9,{layer:1});
  for(const [x,z] of [[-4.4,.4],[-4.1,1.05],[-.9,.9]])B.stand(S.cone(K+`c-cone${x}`,.3),x,z,{layer:3});
  const S1=B.person(K+'c-sam',-2.8,.2,1.3,{shirt:'navy',...SAM,legs:'kick',face:'grin',layer:2});
  const Ss=B.person(K+'c-samSad',-2.6,.2,1.3,{shirt:'navy',...SAM,face:'sad',layer:2});
  const wrap=Ss.body.add(bandage('c-wrap',.2,.16),-.09,Ss.h*.2,{z:.02,anchor:'center'});
  const physio=B.person(K+'c-physio',-1.5,-.3,1.66,{shirt:'coach',hair:'short',adult:true,skin:SKINS[2],face:'smile',layer:2});
  const bar=B.stand(barFrame('c-bar',2.4,1.0),-2.5,1.75,{layer:3,tab:false});
  const segs=['REHAB','TRAINING','MATCH DAY'].map((l,i)=>{const q=bar.add(segment(`c-seg${i}`,.72,.36,l,[INK.pink,INK.yellow,INK.grass][i]),-.76+i*.76,1.0*.25,{z:.02});q.scale=0;return q;});
  const months=B.stand(S.flipCard(K+'c-20',1.2,.34,'20 MONTHS',INK.sky,INK.navy),-4.2,-.6,{layer:2,s:0});
  const sub=B.stand(subBoard('c-sub',.8,1.1),.7,-.9,{layer:2,s:0});const min75=sub.add(S.flipCard(K+'c-75',.6,.26,'75',INK.yellow,INK.navy),0,1.12,{z:.02});min75.scale=0;
  B.stand(S.goal(K+'c-goal',1.8,.9),3.3,-1.3,{layer:1});
  const keeper=B.person(K+'c-keeper',3.3,-1.05,1.28,{shirt:'keeper',hair:'bun',skin:SKINS[0],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const SR=B.person(K+'c-samR',1.3,.8,1.32,{shirt:'navy',...SAM,legs:'kick',face:'grin',layer:3});
  const team=[[2.4,.3,'long'],[4.4,.7,'short']].map(([x,z,h],i)=>B.person(K+`c-t${i}`,x as number,z as number,1.26,{shirt:'navy',hair:h as 'long',skin:SKINS[i*2+1],face:'grin',layer:2}));
  const m93=B.stand(S.flipCard(K+'c-93',1.2,.32,'MINUTE 93',INK.pink),3.5,1.8,{layer:3,s:0,tab:false});
  const ball=ballPair(B,'c-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.7):b.t;
   sun.dy=.3*beat(t,0,2);
   const hurt=beat(t,5,5.8);S1.body.s=beat(t,2.2,3)*(1-hurt);Ss.body.s=hurt;wrap.scale=beat(t,5.8,6.4);wrap.visible=wrap.scale>.02;
   S1.leg!.rot=-1*maxOf([3.4,4.4].map(a=>pulse(t,a-.3,a+.3)));const [bx0,bz0]=track(t,[[3.4,-2.45,.3],[4.2,-1.6,.9],[5,-1.6,.9]]);
   physio.body.s=beat(t,6.6,7.4);physio.armL.rot=-.12-1.1*beat(t,7.4,8);
   rain.scale=beat(t,8.8,9.8)*(1-beat(t,33.4,34.6));rain.visible=rain.scale>.02;months.s=beat(t,15.8,16.6);
   // Fill the comeback bar: three taps, or narrated as the months pass.
   segs.forEach((q,i)=>{q.scale=manual?beat(act,i/3,(i+.8)/3):beat(t,[19.3,21.8,23.4][i],[19.9,22.4,24][i]);q.visible=q.scale>.02;});
   sub.s=beat(t,21.4,22.2);min75.scale=beat(t,26.8,27.4);min75.visible=min75.scale>.02;
   SR.body.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.7,1):0);team.forEach((p,i)=>{p.body.s=beat(t,22.8+i*.4,23.6+i*.4);});keeper.body.s=beat(t,22.6,23.4);
   const shot=29.6;SR.leg!.rot=-1.1*pulse(t,shot-.3,shot+.3);
   let [bx,bz,by]=t<shot?[1.65,.85,0]:track(t,[[shot,1.65,.85,0],[shot+.8,3.0,-1.05,.35],[shot+2,3.0,-1.05,0]]);if(t<21.8){bx=bx0;bz=bz0;by=0;}
   ball(bx,bz,by,(t>2.4&&t<5.4)||t>23);const dive=pulse(t,shot+.5,shot+1.9);keeper.body.rot=.8*dive;keeper.body.dx=-.25*dive;
   m93.s=beat(t,30.4,31.2);ban.scale=beat(t,31,32);ban.visible=ban.scale>.02;fw.forEach((q,i)=>{q.scale=beat(t,30.8+i*.4,31.8+i*.4);q.visible=q.scale>.02;q.rot=t*.2;});
   cheer(SR,Math.max(beat(t,30.6,31.2),manual?beat(act,.95,1):0));team.forEach((p,i)=>cheer(p,beat(t,31+i*.3,31.6+i*.3)));
   const back=beat(t,34,35);Ss.body.s=hurt*(1-back);S1.body.s=Math.max(S1.body.s,back);cheer(S1,beat(t,34.6,35.2));
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,20.8,21.8):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={footy,knights,surgery,ankle,homecup,acl};
void pulse;void clamp01;void TAU;void wave;void maxOf;
