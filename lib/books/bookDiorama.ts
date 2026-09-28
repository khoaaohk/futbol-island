/**
 * The six Messi pop-up spreads (hardship and resilience): original riso paper artwork and narration-timed paper mechanics.
 * Each spread's pose(beat) is a pure function of the Coach Bella narration time (seconds) and the
 * reader's own action (0–1), so pause, seek, replay and manual play all show the same paper state.
 * Timings follow the sentence cues in public/voice/books/messi/narration.json.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from './popupPlates';
import * as S from './popupScenery';
import {type SpreadDef,type Beat,beat,pulse,wave,smooth,clamp01,PAGE_W,PAGE_D} from './popupEngine';

const D2=PAGE_D/2;
/* ───────────── shared print helpers (page coordinates: x world, y = z + D/2) ───────────── */
const Z=(z:number)=>z+D2;
function lawn(k:Kit,x0:number,x1:number,y0:number,y1:number,tone=INK.grass){const p=rect(x0,y0,x1-x0,y1-y0);k.fill(p,tone,.55);k.dots(p,INK.leaf,.06,(x,y)=>.18+.2*Math.sin(x*1.3+y*.7));}
function letters(k:Kit,text:string,x:number,y:number,size:number,color:string,max=3.6){k.text(text,x,y,size,color,{max});}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.09:-.09);k.fill(ell(x,y,.045,.07),INK.navy,.35);}}
function skyPanel(k:Kit,w:number,h:number,top=INK.sky,night=false){const p=rect(0,0,w,h);k.fill(p,night?INK.night:INK.sky2);k.dots(p,night?INK.blue:top,.055,(x,y)=>night?.35:.75-y/h*.75);}

/* ───────────── shared scenery painters ───────────── */
function pitchPrint(k:Kit,x0:number,x1:number,night=false){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,night?'#3f7f5a':INK.grass,night?.9:.7);
 for(let i=0;i<8;i++){const y=i*PAGE_D/8;if(i%2)k.dots(rect(x0,y,x1-x0,PAGE_D/8),night?INK.navy:INK.leaf,.055,night?.35:.3);}
 k.dots(p,night?INK.navy:INK.leaf,.08,.12);}
function chalk(k:Kit,d:string,w=.03){k.key(d,w,INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const stand=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(stand,'#2d3f73');k.dots(stand,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
const FLAGS=[INK.white,'#6fb6e2',INK.white,INK.yellow,INK.pink,'#6fb6e2',INK.orange];

/* ───────────── book-specific plates ───────────── */
const rosarioRoofs=(k:Kit,w:number,h:number)=>{skyPanel(k,w,h);const hills=`M0 ${h} L0 2.1 Q1.2 1.8 2.4 2.05 Q3.5 2.25 ${w} 1.95 L${w} ${h} Z`;k.fill(hills,INK.grass);k.dots(hills,INK.leaf,.05,.35);
 for(let i=0;i<7;i++){const x=.2+i*.6,hh=.45+((i*7)%4)*.12,b=rect(x,2.35-hh,.46,hh+.65);k.fill(b,i%2?'#f2c47c':'#f6d9a4');k.key(b,.012);k.fill(poly([[x-.04,2.35-hh],[x+.23,2.35-hh-.2],[x+.5,2.35-hh]]),INK.red);k.fill(rect(x+.14,2.5-hh,.14,.14),INK.blue);}
 k.key(`M0 2.6 Q2.2 2.45 ${w} 2.62`,.02,INK.blue);};
const barcaHills=(k:Kit,w:number,h:number)=>{skyPanel(k,w,h);const sea=rect(0,2.25,w,h-2.25);k.fill(sea,INK.blue);k.dots(sea,INK.navy,.045,.3);
 const hill=`M0 2.3 Q1 1.2 2.1 1.6 Q3.2 1.9 ${w} 1.3 L${w} 2.3 Z`;k.fill(hill,INK.leaf);k.dots(hill,INK.navy,.05,.2);
 for(let i=0;i<8;i++){const x=.15+i*.52,hh=.5+((i*5)%4)*.2,b=rect(x,2.3-hh,.4,hh);k.fill(b,i%3?'#f0c89a':'#e79a8f');k.key(b,.012);for(let j=0;j<3;j++)k.fill(rect(x+.08,2.3-hh+.1+j*.18,.1,.08),INK.blue);}
 const spire=`M2.2 .9 L2.28 .55 L2.36 .9 L2.36 1.5 L2.2 1.5 Z`;k.fill(spire,INK.yellow);k.key(spire,.012);};
const starPath=(cx:number,cy:number,r:number,inner=.42)=>poly(Array.from({length:10},(_,i)=>[cx+Math.cos(i*.628-1.57)*(i%2?r*inner:r),cy+Math.sin(i*.628-1.57)*(i%2?r*inner:r)]));
/** A framed photograph on a little easel: the paper sign for someone missed. */
const photoFrame=(key:string):PlateSpec=>({key,w:.74,h:1.0,paint:k=>{const w=.74,h=1.0;
 k.key(`M${w*.32} ${h*.7} L${w*.2} ${h} M${w*.68} ${h*.7} L${w*.8} ${h}`,.035,INK.brown);
 const f=rect(0,0,w,h*.74);k.fill(f,INK.gold);k.dots(f,INK.orange,.03,.35);k.key(f,.014);
 const inner=rect(w*.12,h*.08,w*.76,h*.56);k.fill(inner,INK.sky2);k.dots(inner,INK.sky,.03,.4);k.key(inner,.01);
 k.fill(`M${w*.24} ${h*.64} Q${w*.5} ${h*.38} ${w*.76} ${h*.64} Z`,INK.pink);
 k.fill(ell(w*.5,h*.33,w*.13,h*.11),'#e8b58f');k.key(ell(w*.5,h*.33,w*.13,h*.11),.01);
 k.fill(ell(w*.5,h*.22,w*.15,h*.06),INK.grey);k.fill(ell(w*.5,h*.14,w*.07,h*.05),INK.grey);k.key(ell(w*.5,h*.14,w*.07,h*.05),.008);
 const hp=`M${w*.5} ${h*.72} C${w*.36} ${h*.66} ${w*.4} ${h*.6} ${w*.5} ${h*.65} C${w*.6} ${h*.6} ${w*.64} ${h*.66} ${w*.5} ${h*.72} Z`;k.fill(hp,INK.red);}});
/** Night sky card with a star; a cloud flap is hinged over it. */
const skyCard=(key:string):PlateSpec=>({key,w:1.2,h:1.75,paint:k=>{const w=1.2,h=1.75;k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.brown);
 const p=rect(0,0,w,h*.82);k.fill(p,INK.night);k.dots(p,INK.blue,.05,.45);k.key(p,.014,'#101a36');
 for(let i=0;i<7;i++)k.circle(.1+((i*37)%11)/11*1.0,.1+((i*23)%13)/13*1.2,.018,INK.white);
 k.fill(ell(w/2,h*.36,.36,.36),INK.yellow,.25);k.fill(starPath(w/2,h*.36,.27),INK.yellow);k.key(starPath(w/2,h*.36,.27),.012);
 k.text('CELIA',w/2,h*.72,.15,INK.yellow,{max:w*.8});}});
const bigStar=(key:string,r:number):PlateSpec=>({key,w:r*2,h:r*2,paint:k=>{k.fill(ell(r,r,r,r),INK.yellow,.28);k.fill(starPath(r,r,r*.78),INK.yellow);k.dots(starPath(r,r,r*.78),INK.orange,.03,.3);k.key(starPath(r,r,r*.78),.012);},rim:.02});
/** A doorway height chart with pencil marks. */
const heightChart=(key:string):PlateSpec=>({key,w:.42,h:1.7,paint:k=>{const w=.42,h=1.7,p=rect(0,0,w,h);k.fill(p,INK.white);k.dots(p,INK.yellow,.035,.35);k.key(p,.012);
 for(let i=1;i<16;i++){const y=i*h/16;k.key(`M0 ${y} L${w*(i%2?.3:.5)} ${y}`,.01);}
 k.fill(rect(0,h*.74,w,.03),INK.pink);k.text('HEIGHT',w*.62,h*.08,.07,INK.navy,{max:w*.7,rotate:0});}});

/* ───────────── 1 · Two hard things at once (journey: grandmother Celia, growth hormone deficiency) ───────────── */
const journey:SpreadDef={id:'journey',rest:33.2,
 left:k=>{lawn(k,-5,0,0,6.4);
  const street=`M-5 ${Z(.55)} L-.35 ${Z(.25)} L-.35 ${Z(1.35)} L-5 ${Z(1.75)} Z`;k.fill(street,INK.stone);k.dots(street,INK.navy,.05,.16);k.key(`M-5 ${Z(.55)} L-.35 ${Z(.25)} M-5 ${Z(1.75)} L-.35 ${Z(1.35)}`,.018);
  const pitch=rect(-2.6,Z(-2.3),2.3,1.55);k.fill(pitch,INK.grass,.85);k.dots(pitch,INK.leaf,.06,.28);k.key(pitch,.02,INK.white);k.key(ell(-1.45,Z(-1.5),.3,.3),.02,INK.white);
  footprints(k,-4.1,Z(1.35),-2.3,Z(1.05),7);
  letters(k,'ROSARIO',-2.7,Z(2.35),.56,INK.blue,3.4);k.text('ARGENTINA',-2.7,Z(2.62),.18,INK.navy,{weight:800});
 },
 right:k=>{pitchPrint(k,0,5);chalk(k,`M5 ${Z(-2.3)} L2.9 ${Z(-2.3)} L2.9 ${Z(-.5)} L5 ${Z(-.5)}`);chalk(k,ell(.02,Z(0),1.1,1.1));
  k.key(`M3.05 ${Z(.5)} Q3.5 ${Z(-.3)} 3.85 ${Z(-1.05)}`,.02,INK.yellow);
  for(let i=0;i<5;i++)k.fill(starPath(.7+i*.45,Z(2.0)+(i%2)*.12,.08),INK.yellow);
  k.text('LOOK UP',2.5,Z(2.55),.42,INK.pink,{max:3.2});k.text('for Grandma Celia',2.5,Z(2.83),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:'j-bdL',w:4.5,h:3.0,paint:k=>rosarioRoofs(k,4.5,3)},
   {key:'j-bdR',w:4.5,h:3.0,paint:k=>{skyPanel(k,4.5,3);const hills=`M0 2 Q1.5 1.4 2.8 1.8 Q3.8 2.1 4.5 1.6 L4.5 3 L0 3 Z`;k.fill(hills,INK.leaf);k.dots(hills,INK.navy,.05,.2);lightRig(k,3.6,.9);lightRig(k,1.1,1.1);
    k.hatch(`M0 1.9 L4.5 1.9 L4.5 2.4 L0 2.4 Z`,INK.navy,.08,.78,.008);k.hatch(`M0 1.9 L4.5 1.9 L4.5 2.4 L0 2.4 Z`,INK.navy,.08,-.78,.008);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sunP=bd.add(S.sun('j-sun',.42),'L',3.2,1.2,{out:.015}),cloudL=bd.add(S.cloud('j-cloud1',1.3,.6),'L',.6,2.2,{out:.03}),rain=bd.add(S.drops('j-rain',2.4,1.1),'L',1.4,2.1,{out:.025});
  const skyStar=bd.add(bigStar('j-skystar',.3),'R',2.9,1.4,{out:.03});
  // Left page: home, the training ground, grandmother and grandson.
  const home=B.stand(S.house('j-house',1.9,1.7),-3.9,-1.3,{layer:1});
  const door=home.flap(S.door('j-door',.3,.48),-.12,.02,{anchor:'bl',axis:'y',z:.012});
  B.stand(S.tree('j-tree1',1.0,1.6,'round'),-4.6,-.25,{layer:2});B.stand(S.tree('j-palm',1.0,1.8,'palm'),-.55,-2.2,{layer:1});
  B.stand(S.goal('j-goalL',1.2,.66),-1.45,-2.05,{layer:1});
  for(const [x,z] of [[-2.2,-1.0],[-.8,-.9]] as const)B.stand(S.cone(`j-cone${x}`,.3),x,z,{layer:1});
  const chart=B.stand(heightChart('j-chart'),-3.5,.3,{layer:2,s:0});
  const mark=chart.add(S.arrow('j-mark',.32,.16,INK.pink),.22,.62,{z:.02,anchor:'center'});
  const frame=B.stand(photoFrame('j-frame'),-2.15,.35,{layer:2,s:0});
  const grand=B.person('j-grand',-3.75,.6,1.7,{shirt:'casual',hair:'bun',hairColor:'#b8b2a6',adult:true,skin:'#e8b58f',face:'smile',layer:2});
  const kid=B.person('j-kid',-3.2,1.0,1.0,{shirt:'bib',hair:'messi',face:'shy',layer:3});B.slot(-3.6,1.12,-1.2,1.0);
  const dad=B.person('j-dad',-4.3,1.2,1.8,{shirt:'navy',hair:'short',adult:true,skin:'#e3a77d',face:'smile',layer:3});
  const heart=dad.body.add(S.bubble('j-heart',.6,.5,'heart'),.5,1.9,{z:-.02});
  const years=B.stand(S.sign('j-years',1.1,.95,'2 YEARS'),-1.05,1.75,{layer:3,s:0});
  B.stand(S.grassStrip('j-grassL',4.4,.3),-2.6,2.98,{layer:3,tab:false});
  // Right page: years later he scores, looks up and points to the sky.
  B.stand(S.goal('j-goalR',1.5,.8),3.95,-1.35,{layer:1});
  const card=B.stand(skyCard('j-skycard'),1.45,-1.55,{layer:1});
  const cflap=card.flap(S.cloud('j-cflap',1.24,1.0),0,1.66,{z:.024});
  const ten=B.person('j-ten',2.65,.3,1.36,{shirt:'arg',hair:'messi',number:'10',legs:'kick',face:'grin',layer:2});
  const ball=B.stand(S.ball('j-ball',.12),3.05,.5,{layer:2,tab:false});
  const mate=B.person('j-mate',4.4,.75,1.28,{shirt:'arg',hair:'curly',skin:'#b27650',number:'7',face:'grin',layer:2});
  B.stand(S.bush('j-bush',1.0,.4),4.55,1.55,{layer:3,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,narr=b.narrated;
   sunP.dy=-.9*beat(t,0,2.2);cloudL.dx=1.6*beat(t,10.9,12.6)-1.9*beat(t,20.4,23)+.2*wave(t,12.6,20.4,.4);
   rain.visible=t>12.2&&t<20.8;rain.dy=((t*.9)%1)*.45;
   door.flip=-1.35*beat(t,2.4,3.4)+1.35*beat(t,6,7)-1.35*beat(t,25.9,26.8);
   // Grandma Celia walks him to training, then folds away; the photo frame rises in her place.
   grand.body.s=beat(t,2.4,3.6)*(1-beat(t,11.4,12.6));kid.body.s=beat(t,3,4);
   const walk=beat(t,6.6,10.4),back=beat(t,21.2,23.2);
   grand.body.x=-3.75+1.55*walk;kid.body.x=-3.2+1.55*walk-1.25*back;kid.body.dy=.04*Math.abs(Math.sin(kid.body.x*7))*((t>6.6&&t<10.4)||(t>21.2&&t<23.2)?1:0);
   grand.armL.rot=-.12-.5*beat(t,6.2,6.8)+.5*beat(t,10.4,11)+.15*wave(t,6.8,10.4,1.4);
   kid.armR.rot=.12+.4*beat(t,6.2,6.8)-.4*beat(t,10.4,11)+1.0*beat(t,39,39.8);kid.armL.rot=-.12-.25*beat(t,13,14)+.25*beat(t,20,21);
   frame.s=beat(t,12.6,13.8);
   // Ever since: the goal, the look up, the point to the sky.
   ten.body.s=beat(t,16,17.1);ten.leg!.rot=.6*beat(t,17,17.3)-1.8*beat(t,17.3,17.55)+1.2*beat(t,18,18.6);
   const shot=beat(t,17.4,18.4);ball.x=3.05+.8*shot;ball.z=.5-1.55*shot;ball.dy=Math.sin(shot*Math.PI)*.35;ball.rot=-shot*8;ball.visible=t<30;
   const lift=Math.max(narr?beat(t,34,35.3):0,act);
   const point=Math.max(beat(t,18.8,19.6)-beat(t,21,21.8)+beat(t,37.4,38.2),narr?0:act);
   ten.armL.rot=-.12-2.7*point;ten.armR.rot=.12+2.7*point;
   mate.body.s=beat(t,17.8,18.8);mate.armL.rot=-.12-1.9*beat(t,18.8,19.4)+1.9*beat(t,21,21.6)-.3*wave(t,19.4,21,1.8);
   skyStar.dy=.9-.9*Math.max(beat(t,19,20.6),narr?0:act);skyStar.visible=t>18.9||act>0;skyStar.rot=.08*wave(t,20.6,43,.5);
   // Age ten: the height chart and a small pink mark.
   chart.s=beat(t,21.4,22.5);mark.scale=beat(t,23.4,24.2);mark.dx=.04*pulse(t,24.2,25.8);
   // Treatment from eleven; the insurance covered two years.
   dad.body.s=beat(t,26.1,27.3);dad.body.x=-4.3+.45*beat(t,27,28.2);dad.armR.rot=.12+.9*beat(t,28,28.8);
   years.s=beat(t,29.6,30.8);
   cflap.flip=-2.7*lift;
   heart.dy=-.7+.7*beat(t,38,38.8);heart.visible=t>37.8;
   return narr?-.7*beat(t,2.2,3.4)+1.4*beat(t,15.6,16.8)-1.4*beat(t,20.8,22)+1.4*beat(t,33.2,34.2)-.7*beat(t,36.8,38):(act>0?.5:0);
  };
 }};

/* ───────────── 2 · Far from home (touch: Barcelona at 13, homesickness, new friends) ───────────── */
const touch:SpreadDef={id:'touch',rest:33.4,
 left:k=>{lawn(k,-5,0,0,6.4);
  const street=`M-5 ${Z(.5)} L-.35 ${Z(.3)} L-.35 ${Z(1.5)} L-5 ${Z(1.8)} Z`;k.fill(street,INK.stone);k.dots(street,INK.navy,.05,.16);k.key(`M-5 ${Z(.5)} L-.35 ${Z(.3)} M-5 ${Z(1.8)} L-.35 ${Z(1.5)}`,.018);
  footprints(k,-1.4,Z(1.2),-4.6,Z(1.45),9);
  letters(k,'BARCELONA',-2.7,Z(2.35),.5,INK.pink,3.2);k.text('home is far away',-2.7,Z(2.62),.17,INK.navy,{weight:800});},
 right:k=>{pitchPrint(k,0,5);chalk(k,`M0 ${Z(-1.9)} L5 ${Z(-1.9)}`);chalk(k,ell(.02,Z(0),1.1,1.1));
  k.text('NEW FRIENDS',2.7,Z(2.8),.38,INK.blue,{max:3.4});},
 build:B=>{
  const bd=B.vfold({key:'t-bdL',w:4.5,h:3.0,paint:k=>rosarioRoofs(k,4.5,3)},{key:'t-bdR',w:4.5,h:3.0,paint:k=>barcaHills(k,4.5,3)},-3.05,1.22);
  const cloud=bd.add(S.cloud('t-cloud',1.3,.6),'L',.4,2.1,{out:.03}),rain=bd.add(S.drops('t-rain',2.4,1.1),'L',1.2,2.1,{out:.025});
  const sunP=bd.add(S.sun('t-sun',.4),'R',3.3,1.6,{out:.015}),cloudR=bd.add(S.cloud('t-cloud2',1.0,.46),'R',1.4,2.5);
  // Left page: the flat in Barcelona and the family.
  B.stand(S.cityBlock('t-flat',2.2,2.3),-3.7,-1.45,{layer:1});B.stand(S.tree('t-palm',1.0,1.8,'palm'),-1.2,-1.9,{layer:1});
  const dad=B.person('t-dad',-3.95,.25,1.8,{shirt:'navy',hair:'short',adult:true,skin:'#e3a77d',face:'smile',layer:2});
  const mum=B.person('t-mum',-2.9,.15,1.72,{shirt:'casual',hair:'long',adult:true,skin:'#e8b58f',face:'smile',layer:2});
  const sibs=[B.person('t-bro1',-2.15,.75,1.25,{shirt:'fan',hair:'short',skin:'#e8b58f',face:'smile',layer:2,holdR:'suitcase'}),B.person('t-bro2',-1.5,.95,1.18,{shirt:'casual',hair:'curly',skin:'#e8b58f',face:'smile',layer:3}),B.person('t-sis',-.9,1.25,.9,{shirt:'fan',hair:'bun',skin:'#e8b58f',face:'smile',layer:3})];
  const kidA=B.person('t-kidA',-3.3,1.2,1.05,{shirt:'casual',hair:'messi',face:'shy',holdR:'suitcase',layer:3});
  const hugA=dad.body.add(S.bubble('t-hugA',.56,.46,'heart'),.5,1.85,{z:-.02});
  B.stand(S.grassStrip('t-grassL',4.4,.3),-2.6,2.98,{layer:3,tab:false});
  // The move: a paper plane on a swing strip across the binding.
  const post=B.stand(S.post('t-post',.14,1.25),.3,2.05,{layer:3});
  const arm=post.arm(S.strip('t-strip',.09,2.55),0,1.22,{z:.02});
  const planeP=post.add(S.plane('t-plane',.62,.32),0,0,{z:.035,anchor:'center'});
  // Right page: the academy pitch.
  B.stand(S.goal('t-goal',1.5,.8),3.9,-1.6,{layer:1});
  B.stand(S.bench('t-bench',1.2,.48),1.5,-1.1,{layer:1});
  const kidB=B.person('t-kidB',1.45,-.5,1.05,{shirt:'navy',hair:'messi',face:'shy',layer:2});
  const t1=B.person('t-t1',3.0,.05,1.2,{shirt:'navy',hair:'curly',skin:'#b27650',face:'open',layer:2});
  const t2=B.person('t-t2',4.3,-.5,1.2,{shirt:'navy',hair:'short',skin:'#f1b88f',face:'smile',layer:2});
  const chat=t1.body.add(S.bubble('t-chat',.62,.5,'dots'),-.5,1.5,{z:-.02});
  const ball=B.stand(S.ball('t-ball',.12),3.3,.2,{layer:2,tab:false});
  const f1=B.person('t-f1',2.55,1.2,1.2,{shirt:'navy',hair:'short',skin:'#f1b88f',face:'smile',layer:3});
  const f2=B.person('t-f2',3.75,1.35,1.3,{shirt:'navy',hair:'curly',skin:'#e3a77d',face:'smile',layer:3});
  const card02=B.stand(S.flipCard('t-2002',.9,.46,'2002',INK.pink),4.5,1.8,{layer:3,s:0});
  const card14=B.stand(S.flipCard('t-age14',1.0,.46,'AGE 14',INK.blue),1.0,1.9,{layer:3,s:0});
  const hello=kidB.body.add(S.bubble('t-hello',.56,.46,'heart'),.45,1.25,{z:-.02});
  return (b:Beat)=>{const t=b.t,act=b.action,narr=b.narrated;
   // The family arrive; the plane crosses from Rosario's side to Barcelona.
   dad.body.s=beat(t,1.9,2.9);mum.body.s=beat(t,2.3,3.3)*(1-beat(t,17.4,18.6));
   sibs.forEach((s,i)=>{s.body.s=beat(t,2.7+i*.35,3.7+i*.35)*(1-beat(t,17.4+i*.2,18.6+i*.2));s.body.x=[-2.15,-1.5,-.9][i]-(2.2+i*.5)*beat(t,14.8,17.6);});
   mum.body.x=-2.9-1.5*beat(t,14.8,17.4);mum.armR.rot=.12+1.4*beat(t,16.6,17.2);
   const swing=-.8+1.6*beat(t,3.2,6.4)-1.6*beat(t,15.4,18.4);
   const th=swing*1.2,L=2.42;arm.rot=Math.PI-th;planeP.dx=Math.sin(th)*L;planeP.dy=1.22+Math.cos(th)*L;planeP.rot=-th*.7;
   // One Messi at a time: at home (kidA) or at the academy (kidB).
   kidA.body.s=(beat(t,1.9,2.9)*(1-beat(t,6.6,7.4))+beat(t,15,16)*(1-beat(t,21.1,21.9)))*(act>0?0:1);
   kidA.armL.rot=-.12-.25*beat(t,19,20);dad.armR.rot=.12+.9*beat(t,19.6,20.4)-.9*beat(t,21,21.6);
   hugA.dy=-.7+.7*beat(t,19.8,20.6);hugA.visible=t>19.6&&t<21.4;
   const atAcademy=Math.max(beat(t,7,8)*(1-beat(t,14.2,15)),beat(t,21.4,22.4),narr&&act===0?0:1);kidB.body.s=atAcademy;
   // First year: he mostly watches from the bench; his teammates talk and play.
   const pass=beat(t,7.6,8.6)-beat(t,9,10)+beat(t,11,12)-beat(t,12.6,13.6);ball.x=3.3+.9*pass;ball.z=.2-.55*pass;ball.rot=-pass*6;
   t1.body.s=beat(t,7.2,8.2);t2.body.s=beat(t,7.5,8.5);
   chat.dy=-.6+.6*beat(t,10.5,11.2);chat.visible=t>10.4&&t<14.2;
   kidB.body.yaw=.4*beat(t,10.6,11.4)-.4*beat(t,13.6,14.2);
   rain.visible=t>15.4&&t<22;rain.dy=((t*.9)%1)*.45;cloud.dx=1.2*beat(t,14.6,16.2)-1.6*beat(t,21.4,23.4);
   // 2002: every competition, new friends, and the sun comes out.
   card02.s=beat(t,21.8,22.8);kidB.body.x=1.45+.95*beat(t,22.6,24.2);
   f1.body.s=Math.max(beat(t,25,26.1),narr&&act===0?0:1);f2.body.s=Math.max(beat(t,26.2,27.3),narr&&act===0?0:1);
   t1.armR.rot=.12+.9*beat(t,23.6,24.4)-.9*beat(t,27,27.6);
   sunP.dy=.6-1.4*beat(t,21.6,24);cloudR.dx=-1.2*beat(t,21.6,26);
   card14.s=beat(t,31,32);
   // Wave hello: three waves (narrated), or three taps.
   const w1=Math.max(beat(t,34,34.4)-beat(t,35,35.3),act>=.3?1:0),w2=Math.max(beat(t,35.1,35.5)-beat(t,36.1,36.4),act>=.63?1:0),w3=Math.max(beat(t,36.2,36.6),act>=.99?1:0);
   const all=beat(t,38,38.8);
   f1.armR.rot=.12+2.5*Math.max(w1,all)+.25*wave(t,34.4,35,3);f1.armL.rot=-.12-2.5*all;
   f2.armL.rot=-.12-2.5*Math.max(w2,all)-.25*wave(t,35.5,36.1,3);f2.armR.rot=.12+2.5*all;
   kidB.armR.rot=.12+2.6*w3;kidB.armL.rot=-.12-2.6*Math.max(all,w3*(narr?0:1));
   t2.armL.rot=-.12-2.4*all;t2.armR.rot=.12+2.4*all;
   hello.dy=-.6+.6*Math.max(beat(t,38.4,39.2),act>=.99?1:0);hello.visible=t>38.2||act>=.99;
   return narr?-.5*beat(t,1.8,2.8)+1.2*beat(t,6.6,7.6)-1.4*beat(t,14.1,15.1)+1.4*beat(t,21.1,22.1)-.7*beat(t,37.5,38.5):(act>0?.6:0);
  };
 }};


/* ───────────── 3 · A hard final (setback, 2014) ───────────── */
const setback:SpreadDef={id:'setback',rest:28.5,
 left:k=>{pitchPrint(k,-5,0,true);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M-5 ${Z(-2.2)} L0 ${Z(-2.2)}`);k.text('BRAZIL · 2014',-2.6,Z(2.55),.42,INK.yellow,{max:3.2});k.text('WORLD CUP FINAL',-2.6,Z(2.85),.18,INK.white,{weight:800});},
 right:k=>{pitchPrint(k,0,5,true);chalk(k,ell(0,Z(-.2),1.1,1.1));chalk(k,`M0 ${Z(-2.2)} L5 ${Z(-2.2)}`);k.text('ONE HARD DAY',2.5,Z(2.6),.36,INK.pink,{max:3.4});},
 build:B=>{
  const bd=B.vfold({key:'s-bdL',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,[...FLAGS,INK.white],1);lightRig(k,.8,.35);lightRig(k,3.4,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'s-bdR',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.white,'#2b2b33',INK.white,INK.yellow,INK.red,INK.white,'#6fb6e2'],3);lightRig(k,1.4,.3);lightRig(k,3.9,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const flags=bd.add(S.bunting('s-bunting',3.6,.45,['#6fb6e2',INK.white,INK.yellow]),'L',.4,2.55,{out:.02});
  const starsP=bd.add(S.stars('s-stars',2.6,.7,10),'R',.8,3.0,{out:.02});
  const cloud=bd.add(S.cloud('s-cloud',1.3,.6),'L',1.6,.9,{out:.035}),rain=bd.add(S.drops('s-rain',2.2,1.0),'L',1.2,1.9,{out:.03});
  const beamL=B.stand(S.beam('s-beam1',1.3,2.4),-3.9,-1.1,{layer:1,tab:false,s:0});
  B.stand(S.floodlight('s-flood1',.5,1.9),-4.6,-1.4,{layer:1});
  const mate=B.person('s-mate',-3.6,.15,1.36,{shirt:'arg',hair:'curly',skin:'#d99a6c',number:'19',face:'sad',layer:2});
  const hero=B.person('s-hero',-2.05,.7,1.36,{shirt:'arg',hair:'messi',number:'10',face:'sad',layer:3});
  const captain=B.stand(S.banner('s-captain',1.1,.3,'CAPTAIN',INK.yellow,INK.navy),-2.6,1.75,{layer:3,s:0,tab:false});
  const award=hero.body.add(S.goldenBall('s-golden',.16),0,.66,{z:.03});
  const friend=B.person('s-friend',-1.05,1.45,1.8,{shirt:'casual',hair:'short',adult:true,skin:'#b27650',face:'smile',layer:3});
  const breath=friend.body.add(S.bubble('s-breath',.62,.52,'breath'),-.55,1.75,{z:-.02}),heart=friend.body.add(S.bubble('s-heart',.62,.52,'heart'),.2,1.85,{z:-.025});
  const rest=B.stand(S.bench('s-bench',1.0,.42),-4.1,2.3,{layer:3,s:0});
  const board=B.stand(S.scoreboard('s-board',2.6,1.9,'2014 FINAL'),2.3,-1.0,{layer:1,s:0});
  const note=board.add(S.noteCard('s-note',2.0,1.1,['YOU ARE MORE','THAN ONE RESULT']),0,.43,{z:.012});
  const flap=board.flap(S.scoreFlap('s-flap',2.2,1.25,'ARG','0 : 1','GER'),0,1.66,{z:.024});
  const trophyP=B.stand(S.trophy('s-trophy',.55,.95),4.35,-.35,{layer:2,s:0});
  const ger1=B.person('s-ger1',3.55,-1.75,1.05,{shirt:'ger',hair:'short',face:'grin',layer:1});
  const ger2=B.person('s-ger2',4.35,-1.55,1.05,{shirt:'ger',hair:'bald',face:'grin',skin:'#f1b88f',layer:1});
  const ball=B.stand(S.ball('s-ball',.12),.9,.9,{layer:3,tab:false});B.slot(.6,.95,3.9,.6);
  return (b:Beat)=>{const t=b.t,act=b.action;
   beamL.s=beat(t,.3,1.6);flags.dy=.05*wave(t,1.8,10,1.2);
   // Years later: the captain.
   captain.s=beat(t,2.4,3.4);hero.armR.rot=.12+.5*pulse(t,2.8,5);
   ball.x=.9+2.6*beat(t,6.4,10.2);ball.z=.9-.35*beat(t,6.4,10.2);ball.rot=-ball.x*6;
   board.s=Math.max(beat(t,8.4,9.6),act>0?1:0);
   for(const [g,d] of [[ger1,0],[ger2,.35]] as const){g.body.s=beat(t,9.6+d,10.8+d);g.armL.rot=-.12-2.6*beat(t,10.6+d,11.2+d)+.3*wave(t,11.2,20,1.8);g.armR.rot=.12+2.6*beat(t,10.6+d,11.2+d)-.3*wave(t,11.2,20,1.7);}
   trophyP.s=beat(t,10,11.4);
   // The Golden Ball rises into his hands; the team result still hurts.
   award.dy=-.5+1.05*beat(t,13.2,14.6);award.visible=t>13;
   hero.armL.rot=-.12+.95*beat(t,14.2,15)-.95*beat(t,21.2,22);hero.armR.rot+=-.95*beat(t,14.2,15)+.95*beat(t,21.2,22);
   if(t>21.2)award.dy=.55-1.05*beat(t,21.4,22.4);
   mate.body.x=-3.6+.7*beat(t,22.4,24.2);mate.armR.rot=.12+1.2*beat(t,24,25);
   // Many people would feel sad: a little rain over the stadium.
   cloud.dx=-.8*beat(t,25.2,26.6)+1.8*beat(t,37.8,40);rain.visible=t>25.8&&t<38.4;rain.dy=((t*.9)%1)*.4;
   // Lift the flap: the reminder underneath.
   const lift=Math.max(b.narrated?beat(t,29,30.3):0,act);flap.flip=-2.7*lift;void note;
   // Rest, breathe, talk with someone you trust.
   rest.s=beat(t,32.2,33.2);friend.body.s=beat(t,32.4,33.6);breath.dy=-.7+.7*beat(t,34,34.8)-.7*beat(t,36,36.6);breath.visible=t>33.8&&t<36.8;heart.dy=-.7+.7*beat(t,36.2,37);heart.visible=t>36;
   friend.armL.rot=-.12-.6*beat(t,34,34.8);
   starsP.dy=-.9*beat(t,38.2,40);starsP.visible=t>38.1;
   return b.narrated?-.5*beat(t,1.8,2.8)+.9*beat(t,8,9)-1.1*beat(t,12.6,13.6)+1.2*beat(t,28.4,29.4)-.9*beat(t,31.8,32.8)+.4*beat(t,37.6,39):(act>0?.45:0);
  };
 }};

/* ───────────── 4 · Needing a break (return, 2015 → 2016) ───────────── */
const river=(k:Kit,side:'L'|'R')=>{const x0=side==='L'?-.95:0,x1=side==='L'?0:.95;const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,INK.sky);k.dots(p,INK.blue,.05,.5);for(let i=0;i<10;i++)k.key(`M${x0+.1} ${i*.62+.2} Q${(x0+x1)/2} ${i*.62+.1} ${x1-.1} ${i*.62+.25}`,.012,INK.white);};
/** A bronze statue on a stone plinth (the Buenos Aires statue, drawn as simple paper shapes). */
const statue=(key:string):PlateSpec=>({key,w:1.1,h:2.0,paint:k=>{const w=1.1,h=2.0,bronze='#b08a5a';
 const plinth=rect(w*.1,h*.72,w*.8,h*.28);k.fill(plinth,INK.stone);k.dots(plinth,INK.grey,.03,.5);k.key(plinth,.012);k.text('BUENOS AIRES',w/2,h*.9,.1,INK.navy,{max:w*.72});
 const body=`M${w*.36} ${h*.26} L${w*.64} ${h*.26} L${w*.7} ${h*.5} L${w*.6} ${h*.5} L${w*.62} ${h*.72} L${w*.52} ${h*.72} L${w*.5} ${h*.54} L${w*.48} ${h*.72} L${w*.38} ${h*.72} L${w*.4} ${h*.5} L${w*.3} ${h*.5} Z`;
 k.fill(body,bronze);k.dots(body,INK.brown,.03,.45);k.key(body,.012);k.fill(ell(w/2,h*.18,w*.1,h*.07),bronze);k.dots(ell(w/2,h*.18,w*.1,h*.07),INK.brown,.03,.4);k.key(ell(w/2,h*.18,w*.1,h*.07),.012);
 k.fill(ell(w*.6,h*.69,w*.07,w*.07),bronze);k.key(ell(w*.6,h*.69,w*.07,w*.07),.01);}});
const returnSpread:SpreadDef={id:'return',rest:28.2,
 left:k=>{lawn(k,-5,-.95,0,6.4);river(k,'L');const path=`M-4.8 ${Z(1.6)} Q-3 ${Z(.9)} -1.1 ${Z(1.2)} L-1.1 ${Z(1.6)} Q-3 ${Z(1.4)} -4.8 ${Z(2.1)} Z`;k.fill(path,INK.sand);k.dots(path,INK.orange,.05,.2);k.text('2015 · 2016',-3,Z(2.75),.42,INK.blue,{max:3.2});},
 right:k=>{lawn(k,.95,5,0,6.4);river(k,'R');const path=`M1.1 ${Z(1.2)} Q3 ${Z(.9)} 4.8 ${Z(1.5)} L4.8 ${Z(2)} Q3 ${Z(1.4)} 1.1 ${Z(1.6)} Z`;k.fill(path,INK.sand);k.dots(path,INK.orange,.05,.2);k.text('WELCOME BACK',3.0,Z(2.8),.36,INK.pink,{max:3.4});for(let i=0;i<16;i++)k.circle(1.4+((i*37)%29)/29*3.4,Z(-2.8)+((i*17)%23)/23*1.6,.04,i%2?INK.pink:INK.yellow);},
 build:B=>{
  const bd=B.vfold({key:'r-bdL',w:4.5,h:3.0,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#9fb3c9');k.dots(p,INK.navy,.055,(x,y)=>.35-y*.08);const cliff=`M0 3 L0 1.6 Q1 1.3 1.8 1.9 Q2.8 2.4 4.5 2.1 L4.5 3 Z`;k.fill(cliff,'#6d8f76');k.dots(cliff,INK.navy,.05,.3);}},
   {key:'r-bdR',w:4.5,h:3.0,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#ffd9a0');k.dots(p,INK.pink,.055,(x,y)=>.5-y/3*.5);const hill=`M0 2.2 Q1.5 1.5 2.8 1.9 Q3.8 2.2 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hill,INK.grass);k.dots(hill,INK.leaf,.05,.35);}},-3.05,1.22);
  const cloud1=bd.add(S.cloud('r-cloud1',1.3,.6),'L',.8,1.2),cloud2=bd.add(S.cloud('r-cloud2',1.1,.5),'L',2.3,.9),rain=bd.add(S.drops('r-rain',2.2,1.2),'L',.9,2.3,{out:.012});
  const sunP=bd.add(S.sun('r-sun',.45),'R',2.6,2.4,{out:.012}),bow=bd.add(S.rainbow('r-bow',3.8,1.7),'R',.3,2.7,{out:.016}),birdsP=bd.add(S.birds('r-birds',.9,.35),'R',.6,1.4,{out:.02});
  const flagsP=bd.add(S.bunting('r-flags',3.4,.42,['#6fb6e2',INK.white,'#6fb6e2',INK.yellow]),'R',.5,1.05,{out:.02});
  B.stand(S.tree('r-tree',1,1.6,'round','#6d8f76'),-4.4,-.8,{layer:1});
  B.stand(S.bench('r-bench',1.2,.5),-3.7,-.2,{layer:2});
  const post=B.stand(S.sign('r-post',1.0,1.1,'COPA'),-2.4,-1.2,{layer:1});
  const card15=post.flap(S.flipCard('r-2015',.84,.42,'2015',INK.blue),0,1.05,{z:.03}),card16=post.flap(S.flipCard('r-2016',.84,.42,'2016',INK.pink),0,1.05,{z:.02});
  const hero=B.person('r-hero',-1.85,1.0,1.34,{shirt:'arg',hair:'messi',number:'10',face:'sad',layer:3});
  const deckL=B.flat(S.bridgeDeck('r-deckL',.96,1.25),-.98,1.9,{edge:'left',hinge:-1.45}),deckR=B.flat(S.bridgeDeck('r-deckR',.96,1.25),.98,1.9,{edge:'right',hinge:1.45});
  const back=B.person('r-back',1.25,1.3,1.34,{shirt:'arg',hair:'messi',number:'10',face:'smile',layer:3});B.slot(1.2,1.45,2.6,1.25);
  const statueP=B.stand(statue('r-statue'),1.95,-2.0,{layer:1,s:0});
  const mates=[B.person('r-m1',2.8,.5,1.3,{shirt:'arg',hair:'curly',skin:'#b27650',number:'11',face:'grin',layer:2}),B.person('r-m2',3.75,.85,1.32,{shirt:'arg',hair:'short',skin:'#f1b88f',number:'7',face:'smile',layer:2}),B.person('r-m3',4.45,.3,1.28,{shirt:'arg',hair:'long',skin:'#d99a6c',number:'23',face:'grin',layer:2,holdR:'ball'})];
  const fan=B.person('r-fan',4.2,-1.4,1.55,{shirt:'fan',hair:'bun',adult:true,skin:'#e8b58f',face:'grin',layer:1});
  const hope=mates[1].body.add(S.bubble('r-hope',.58,.48,'heart'),.45,1.75,{z:-.02});
  B.stand(S.bush('r-bush',1.1,.42),4.4,2.2,{layer:3,tab:false});B.stand(S.grassStrip('r-grass',3.8,.3),-2.9,3.0,{layer:3,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,narr=b.narrated;
   cloud1.dx=.9*beat(t,1.8,4.2)-2.2*beat(t,26.4,29.4);cloud2.dx=-.6*beat(t,2.2,4.8)+2.2*beat(t,26.8,29.8);
   rain.visible=t>3.6&&t<27;rain.dy=((t*.9)%1)*.5;
   card15.flip=-2.9*beat(t,5.6,6.6);card16.visible=true;
   // Three finals in three years: he steps away, back toward the bench.
   hero.body.x=-1.85-1.35*beat(t,10,12.8)+1.0*beat(t,28.8,30.4);hero.body.yaw=.55*beat(t,10,10.8)-.55*beat(t,27.8,28.8);hero.armL.rot=-.12+.3*beat(t,10.2,11.2);
   // A nationwide campaign: teammates and fans who hope he will return.
   mates.forEach((m,i)=>{m.body.s=beat(t,16.2+i*.5,17.2+i*.5);m.armL.rot=-.12-(1.8+i*.2)*beat(t,33.4+i*.3,34.2+i*.3)-.3*wave(t,34.2,39,1.5+i*.2);});
   fan.body.s=beat(t,17.6,18.6);fan.armL.rot=-.12-2.3*beat(t,18.6,19.2)-.25*wave(t,19.2,39,1.3);fan.armR.rot=.12+2.3*beat(t,18.6,19.2)+.25*wave(t,19.2,39,1.4);
   flagsP.dy=.9-.9*beat(t,16.4,18);flagsP.visible=t>16.2;hope.dy=-.6+.6*beat(t,19.4,20.2);hope.visible=t>19.2&&t<26.6;
   statueP.s=beat(t,21.8,23.2);
   // Soon he came back: the sun rises; open the bridge and he crosses.
   sunP.dy=-1.4*beat(t,26.4,28.6);
   const lower=Math.max(narr?beat(t,28.6,30.4):0,act);deckL.s=lower;deckR.s=lower;
   hero.body.s=1-Math.max(narr?beat(t,30.4,31.4):0,act>.99?1:0);
   back.body.s=Math.max(narr?beat(t,30.8,32):0,act>.99?1:0);back.body.x=1.25+1.1*beat(t,32,34.4);back.armR.rot=.12+1.9*beat(t,34.4,35.2);
   birdsP.dx=1.4*beat(t,29,34);birdsP.dy=-.3*pulse(t,29,34);bow.scale=beat(t,35.6,37.6);
   return narr?-.7*beat(t,1.8,2.8)+1.3*beat(t,15.9,17)-.6*beat(t,28,29)+.4*beat(t,32.6,34)-.4*beat(t,37,38.5):(act>0?.1:0);
  };
 }};

/* ───────────── 5 · Not alone (together, 2021) ───────────── */
const together:SpreadDef={id:'together',rest:25.2,
 left:k=>{pitchPrint(k,-5,0,true);chalk(k,`M-5 ${Z(-1.6)} L-2.4 ${Z(-1.6)} L-2.4 ${Z(.6)} L-5 ${Z(.6)}`);k.circle(-3.3,Z(1.5),.06,INK.white);chalk(k,ell(0,Z(0),1.1,1.1));k.text('2021',-1.4,Z(2.75),.46,INK.yellow);k.text('SAVES',-4.1,Z(2.95),.16,INK.white,{weight:800});},
 right:k=>{pitchPrint(k,0,5,true);chalk(k,ell(0,Z(0),1.1,1.1));chalk(k,`M5 ${Z(-2.2)} L2.9 ${Z(-2.2)} L2.9 ${Z(-.3)} L5 ${Z(-.3)}`);
  for(let i=0;i<8;i++)k.fill(rect(.5+i*.38,Z(1.4)-i*.02,.2,.06),INK.yellow);k.fill(ell(3.75,Z(1.3),.6,.42),INK.yellow,.5);k.dots(ell(3.75,Z(1.3),.6,.42),INK.orange,.05,.35);k.text('NOT ALONE',2.5,Z(2.62),.38,INK.yellow,{max:3.4});},
 build:B=>{
  const bd=B.vfold({key:'g-bdL',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,FLAGS,2);lightRig(k,1,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'g-bdR',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.1,2.6,FLAGS,5);lightRig(k,1.5,.3);lightRig(k,4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const ban=bd.add(S.banner('g-banner',2.8,.42,'COPA AMÉRICA 2021',INK.blue),'L',.6,1.05,{out:.02});
  const conf=bd.add(S.confetti('g-conf',2.6,1.4,3),'R',.6,1.0,{out:.03});
  const years=bd.add(S.flipCard('g-28',1.3,.5,'28 YEARS',INK.yellow,INK.navy),'R',3.1,1.25,{out:.03});
  B.stand(S.goal('g-goalL',1.9,.95),-3.7,-1.35,{layer:1});
  const keeper=B.person('g-keeper',-3.7,-1.0,1.35,{shirt:'keeper',hair:'short',skin:'#f1b88f',number:'23',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const shot=B.stand(S.ball('g-shot',.12),-3.3,1.5,{layer:3,tab:false});B.slot(-3.3,1.5,-3.6,-.7);
  const gloves=[0,1,2].map(i=>B.stand(S.icon(`g-glove${i}`,.3,'glove'),-4.5+i*.38,2.5,{layer:3,s:0}));
  const board=B.stand(S.scoreboard('g-board',1.5,1.15,'FINAL'),-1.35,-1.75,{layer:1});
  const sFlap=board.flap(S.flipCard('g-semi',1.2,.62,'SEMI',INK.blue),0,.86,{z:.024});board.add(S.flipCard('g-final',1.2,.62,'1 – 0',INK.pink),0,.24,{z:.012});
  B.stand(S.goal('g-goalR',1.7,.9),4.0,-1.4,{layer:1});
  const scorer=B.person('g-scorer',2.7,-.5,1.3,{shirt:'arg',hair:'curly',skin:'#d99a6c',number:'11',legs:'kick',face:'grin',layer:2});
  const chip=B.stand(S.ball('g-chip',.12),3.05,-.35,{layer:2,tab:false});B.slot(3.05,-.35,3.95,-1.25);
  const hero=B.person('g-hero',-1.55,1.05,1.36,{shirt:'arg',hair:'messi',number:'10',legs:'kick',layer:3});
  const pals=[B.person('g-pal1',-2.5,.45,1.3,{shirt:'arg',hair:'long',skin:'#e3a77d',number:'5',face:'grin',layer:2}),B.person('g-pal2',-.6,.5,1.3,{shirt:'arg',hair:'short',skin:'#b27650',number:'8',face:'grin',layer:2})];
  const runner=B.person('g-runner',2.55,.85,1.3,{shirt:'arg',hair:'short',skin:'#b27650',number:'7',legs:'run',face:'open',layer:3});B.slot(2.4,1.0,3.9,1.2);
  const help=runner.body.add(S.bubble('g-help',.58,.48,'heart'),.5,1.6,{z:-.02});
  const post=B.stand(S.post('g-post',.14,1.2),.3,2.15,{layer:3});const arm=post.arm(S.strip('g-strip',.09,2.3),0,1.17,{z:.02});const pass=post.add(S.ball('g-pass',.12),0,0,{z:.035,anchor:'center'});
  return (b:Beat)=>{const t=b.t,act=b.action,narr=b.narrated;
   ban.dy=.04*wave(t,2,9,1);years.dy=.8-.8*beat(t,5.6,6.8);years.visible=t>5.4;
   // Not alone: teammates pop up beside him.
   pals.forEach((p,i)=>{p.body.s=Math.max(beat(t,9.6+i*.5,10.6+i*.5),narr?0:1);p.armR.rot=.12+2.4*beat(t,30.6+i*.3,31.4+i*.3);p.armL.rot=-.12-2.4*beat(t,30.6+i*.3,31.4+i*.3)-.25*wave(t,31.4,40,1.4+i*.2);});
   // Semifinal shootout: three saves.
   const saves=[13.4,15.2,17];let dive=0,sx=0;saves.forEach((at,i)=>{const p=pulse(t,at-.3,at+1.2);if(p>Math.abs(dive)){dive=(i%2?1:-1)*p;}const f=beat(t,at-.6,at);if(t>at-.6&&t<at+1.3)sx=f;gloves[i].s=beat(t,at+.2,at+.9);});
   keeper.body.rot=dive*.95;keeper.body.dx=-dive*.25;keeper.armL.rot=-.12-2.4*Math.abs(dive);keeper.armR.rot=.12+2.4*Math.abs(dive);
   shot.z=1.5-2.1*sx;shot.x=-3.3-.3*sx+(sx>0?dive*.3:0);shot.visible=t>12.4&&t<18.8;shot.rot=-sx*6;
   // Final: the flap flips to 1–0; number 11 lifts the ball into the net.
   sFlap.flip=-2.8*beat(t,19.4,20.2);
   scorer.leg!.rot=.6*beat(t,20.4,20.7)-1.8*beat(t,20.7,20.95)+1.2*beat(t,21.4,22);const lob=beat(t,20.8,22);chip.x=3.05+.9*lob;chip.z=-.35-.9*lob;chip.dy=Math.sin(lob*Math.PI)*.8;chip.rot=-lob*8;
   scorer.armL.rot=-.12-2.5*beat(t,22,22.6);scorer.armR.rot=.12+2.5*beat(t,22,22.6);conf.dy=-1.2+1.2*beat(t,22,23);conf.visible=t>21.8;
   keeper.armL.rot+=-1.8*beat(t,22.4,23)*(t<25?1:0);
   // Play the pass: the teammate arrives ready to help.
   const p=b.action>0?act:beat(t,26.4,28.2);hero.leg!.rot=.6*beat(t,25.8,26.2)-1.7*beat(t,26.2,26.45)+1.1*beat(t,27,27.6)+(b.action>0?-1.1*pulse(act,0,.35):0);
   const th=-1.05+2.1*p;arm.rot=Math.PI-th;pass.dx=Math.sin(th)*2.2;pass.dy=1.17+Math.cos(th)*2.2;
   runner.body.x=2.55+1.1*(b.action>0?act:beat(t,26.6,28.8));runner.armL.rot=-.12-2.2*Math.max(beat(t,29,29.7),b.action>0?act:0);runner.armR.rot=.12+2.4*Math.max(beat(t,30.8,31.5),act>.99?1:0);
   hero.armL.rot=-.12-2.4*beat(t,30.8,31.5);hero.armR.rot=.12+2.4*beat(t,30.8,31.5);
   help.dy=-.6+.6*Math.max(beat(t,35.6,36.4),act>.99?1:0);help.visible=t>35.4||act>.99;
   return narr?-.7*beat(t,11.4,12.4)+1.3*beat(t,18.6,19.4)-.6*beat(t,24.8,25.6)+.3*beat(t,26.2,27.2)-.3*beat(t,30,31):(act>0?.2:0);
  };
 }};

/* ───────────── 6 · Together, at last (champions, 2022) ───────────── */
const champions:SpreadDef={id:'champions',rest:16.9,
 left:k=>{pitchPrint(k,-5,0,true);chalk(k,`M-5 ${Z(-1.6)} L-2.4 ${Z(-1.6)} L-2.4 ${Z(.6)} L-5 ${Z(.6)}`);chalk(k,ell(0,Z(0),1.1,1.1));k.text('2022',-1.9,Z(2.85),.44,INK.yellow);k.text('ARG',-4.8,Z(2.05),.14,INK.white,{align:'left'});k.text('FRA',-4.8,Z(2.5),.14,INK.white,{align:'left'});},
 right:k=>{pitchPrint(k,0,5,true);chalk(k,ell(0,Z(0),1.1,1.1));const stage=`M1 ${Z(-.8)} L4.6 ${Z(-.8)} L4.9 ${Z(1.3)} L.7 ${Z(1.3)} Z`;k.fill(stage,INK.blue,.7);k.dots(stage,INK.navy,.05,.3);k.text('TOGETHER',2.8,Z(2.9),.42,INK.pink,{max:3.4});},
 build:B=>{
  const bd=B.vfold({key:'c-bdL',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,FLAGS,4);lightRig(k,.9,.35);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:'c-bdR',w:4.5,h:3.0,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,FLAGS,6);lightRig(k,1.2,.3);lightRig(k,3.8,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework('c-fw1',.45,INK.pink),'R',1.2,1.6,{out:.03}),bd.add(S.firework('c-fw2',.4,INK.yellow),'R',3.1,1.4,{out:.03}),bd.add(S.firework('c-fw3',.42,'#6fb6e2'),'L',2.2,1.5,{out:.03})];
  const conf=[bd.add(S.confetti('c-cf1',2.2,1.2,1),'R',.4,1.2,{out:.04}),bd.add(S.confetti('c-cf2',2.2,1.2,2),'L',.6,1.2,{out:.04})];
  const board=B.stand(S.scoreboard('c-board',2.0,1.5,'FINAL 2022'),-1.9,-1.6,{layer:1});
  const labels=['1 – 0','2 – 0','2 – 1','2 – 2','3 – 2','3 – 3'];board.add(S.flipCard('c-pens',1.6,.8,'PENS 4 – 2',INK.yellow,INK.navy),0,.35,{z:.01});
  const cards=labels.map((l,i)=>board.flap(S.flipCard(`c-card${i}`,1.6,.8,l,i%2?INK.blue:INK.pink),0,1.15,{z:.012+(labels.length-i)*.004}));
  const goals=[0,1].map(i=>B.stand(S.icon(`c-goal${i}`,.3,'ball'),-.6+i*.36,-.75,{layer:2,s:0}));
  B.stand(S.goal('c-goal',1.8,.9),-3.8,-1.1,{layer:1});
  const keeper=B.person('c-keeper',-3.8,-.8,1.3,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const kick=B.stand(S.ball('c-kick',.12),-3.4,1.4,{layer:3,tab:false});B.slot(-3.4,1.4,-3.8,-.6);
  const rows=[['tick','tick','tick','tick'],['tick','cross','cross','tick']] as const;
  const tallies=rows.flatMap((r,ri)=>r.map((kind,i)=>B.stand(S.icon(`c-${ri}${i}${kind}`,.26,kind),-4.2+i*.33,2.0+ri*.45,{layer:3,s:0})));
  const fans=[B.person('c-fan1',-2.55,1.35,1.7,{shirt:'fan',hair:'long',adult:true,skin:'#b27650',face:'grin',layer:3}),B.person('c-fan2',-1.35,1.75,1.2,{shirt:'fan',hair:'bun',skin:'#f1b88f',face:'grin',layer:3})];
  const mates=[B.person('c-m1',1.35,-.35,1.3,{shirt:'arg',hair:'curly',skin:'#b27650',number:'11',face:'grin',layer:2}),B.person('c-m2',3.5,-.3,1.32,{shirt:'arg',hair:'short',number:'7',face:'grin',layer:2}),B.person('c-m3',4.4,-.7,1.3,{shirt:'keeper',hair:'short',number:'23',face:'grin',layer:1,holdL:'glove',holdR:'glove'})];
  const hero=B.person('c-hero',2.45,.35,1.4,{shirt:'arg',hair:'messi',number:'10',face:'grin',layer:3});
  const cup=hero.body.add(S.trophy('c-cup',.5,.9),0,.55,{z:-.02});
  const memLabels=[['CELIA',INK.pink],['TREATMENT',INK.blue],['HOMESICK',INK.teal],['FINALS',INK.orange]] as const;
  const memories=memLabels.map(([l,c],i)=>B.stand(S.flipCard(`c-mem${i}`,.92,.46,l,c),1.0+i*1.1,1.85,{layer:3,s:0}));
  const flag=B.stand(S.banner('c-flag',3.0,.46,'KEEP GOING, TOGETHER',INK.pink),2.75,2.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const t=b.t,act=b.action,narr=b.narrated;
   // Full of twists: flip, flip, flip… 3–3, then penalties.
   [2.4,3.1,3.8,4.5,5.2,5.9].forEach((at,i)=>{cards[i].flip=-2.9*beat(t,at,at+.5);});
   if(t>11.6)cards.forEach(c=>{c.flip=-2.9;});
   goals.forEach((g,i)=>{g.s=beat(t,10+i*.6,10.6+i*.6);});
   const kicks=[13.4,14.6,15.8];let sx=0,dive=0;kicks.forEach((at,i)=>{const f=beat(t,at-.5,at);if(t>at-.5&&t<at+.8)sx=f;const d=pulse(t,at-.2,at+.8);if(d>Math.abs(dive))dive=(i%2?-1:1)*d;});
   kick.z=1.4-2.0*sx;kick.x=-3.4-.35*sx;kick.visible=t>12.8&&t<16.8;keeper.body.rot=dive*.9;keeper.body.dx=-dive*.25;keeper.armL.rot=-.12-2.2*Math.abs(dive);keeper.armR.rot=.12+2.2*Math.abs(dive);
   tallies.forEach((s,i)=>{s.s=beat(t,12.8+i*.45,13.3+i*.45);});
   // Lift the World Cup together.
   const raise=Math.max(narr?beat(t,17.4,19.6):0,act);cup.dy=-.7+1.75*raise;cup.visible=raise>.02;
   hero.armL.rot=-.12-2.55*raise;hero.armR.rot=.12+2.55*raise;
   mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,16.4+i*.4,17.4+i*.4),narr?0:1);const up=Math.max(beat(t,20.2+i*.2,21+i*.2),act);m.armL.rot=-.12-2.5*up-.25*wave(t,21,24.4,1.6+i*.2);m.armR.rot=.12+2.5*up+.25*wave(t,21,24.4,1.5+i*.2);});
   fw.forEach((f,i)=>{const a=beat(t,20.4+i*.6,21.4+i*.6),again=beat(t,35.6+i*.5,36.4+i*.5);f.scale=Math.max(a*(1-beat(t,24.2,25.2)),again);f.rot=a*1.2+(t>21?(t-21)*.15:0);});
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*beat(t,20.6+i*.4,23+i*.4);c.visible=t>20.4;});
   // The hard days are still part of the story.
   memories.forEach((m,i)=>{m.s=beat(t,25+i*1.5,25.9+i*1.5);});
   flag.s=beat(t,32,33.2);
   fans.forEach((f,i)=>{f.body.s=beat(t,34.2+i*.6,35.2+i*.6);f.armL.rot=-.12-2.4*beat(t,35.2+i*.6,35.8+i*.6)-.3*wave(t,35.8,39.5,1.4);f.armR.rot=.12+2.4*beat(t,36.4,37.1);});
   return narr?-.6*beat(t,2,3)+1.2*beat(t,16.2,17.2)-.6*beat(t,31.4,32.4)-.4*beat(t,33.8,34.8)+.4*beat(t,37,38):(act>0?.55:0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={journey,touch,setback,return:returnSpread,together,champions};
void smooth;void clamp01;void blob;void PAGE_W;
