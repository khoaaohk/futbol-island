/**
 * The six Riyad Mahrez pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/mahrez/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is skill over size, and carrying love for his father: street rolls, a photo frame, a signpost,
 * a suitcase, a trophy and a last-minute free kick. His father's death is told only as a family together. Kits are colour only.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,sea,road,backdrop,plates,ballPair} from '../spreadKit';

const K='mahrez-';
const P=plates(K),{sp}=P;
const RM={skin:'#b27650',hair:'short' as const,hairColor:'#1d1512'};
const LCFC=[INK.blue,INK.white,'#2f5fa8',INK.blue];
const DZ=[INK.green,INK.white,INK.green,INK.red];

/* ───────────── Mahrez-only plates ───────────── */
const flats=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#d9cdb6');k.dots(b,INK.navy,.035,.16);k.key(b,.014);for(let r=0;r<5;r++)for(let c=0;c<4;c++){const wdw=rect(w*(.1+c*.21),h*(.08+r*.17),w*.14,h*.1);k.fill(wdw,(r+c)%3?INK.sky2:INK.yellow);k.key(wdw,.008);}},{rim:.014});
const pointer=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const p=`M0 0 L${w*.84} 0 L${w} ${h/2} L${w*.84} ${h} L0 ${h} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.013);k.text(label,w*.44,h*.66,h*.4,INK.navy,{weight:900,max:w*.78});},{rim:.014});
const familyPic=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{k.fill(rect(w*.08,h*.08,w*.84,h*.84),'#fff1c2');const xs=[.28,.5,.72];
 xs.forEach((x,i)=>{const hh=i===1?.42:.3;k.fill(rect(w*x-.08,h*(.86-hh),.16,h*hh*.7),[INK.green,INK.white,INK.sky][i]);k.key(rect(w*x-.08,h*(.86-hh),.16,h*hh*.7),.008);k.circle(w*x,h*(.86-hh)-.06,.07,'#b27650',true);});
 k.fill(`M${w/2} ${h*.3} q-.08 -.1 -.14 0 q0 .06 .14 .16 q.14 -.1 .14 -.16 q-.06 -.1 -.14 0 Z`,INK.pink);k.text('FOR HIS FATHER',w/2,h*.2,h*.08,INK.navy,{weight:900,max:w*.8});});
const caseBody=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.navy);k.key(b,.014);const i=rect(w*.06,h*.08,w*.88,h*.84);k.fill(i,'#f1e3c6');k.key(i,.01);
 const sh=rect(w*.12,h*.2,w*.34,h*.56);k.fill(sh,INK.blue);k.key(sh,.01);k.circle(w*.7,h*.48,h*.16,INK.white,true);k.key(ell(w*.7,h*.48,h*.16,h*.16),.01);k.text('ENGLAND',w/2,h*.9,h*.1,INK.navy,{weight:900,max:w*.6});},{rim:.014});
const caseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#3d5da0');k.dots(b,INK.navy,.035,.3);k.key(b,.014);const tag=rect(w*.28,h*.35,w*.44,h*.3);k.fill(tag,INK.paper);k.key(tag,.01);k.text('LEICESTER',w/2,h*.55,h*.11,INK.navy,{weight:900,max:w*.4});},{rim:.014});

/* ───────────── 1 · Street football (streets) ───────────── */
const streets:SpreadDef={id:'streets',rest:19.2,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'SARCELLES · NEAR PARIS','BORN 1991 · HIS FATHER, AHMED, FROM ALGERIA',INK.green,INK.navy,.4);},
 right:k=>{paving(k,0,5,'#d9d3c4','#a9a08c');road(k,0,5,Z(.95));caption(k,2.5,'QUICK FEET, CLEVER TRICKS','2004 · AAS SARCELLES YOUTH TEAM',INK.blue,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'s-bd',k=>{daySky(k,4.5,3);skyline(k,4.5,2.2,['#c9b48e','#d9c49a','#b9a27a']);k.fill(rect(0,2.2,4.5,.8),'#e3d6bb');},
   k=>{daySky(k,4.5,3);roofs(k,0,4.5,2.3,3);k.fill(rect(0,2.3,4.5,.7),'#d9d3c4');});
  const sun=bd.add(S.sun(K+'s-sun',.3),'L',3.6,2.1,{out:.012});
  B.stand(flats(K+'s-flats',1.4,1.9),-4.1,-1.5,{layer:1});
  const dad=B.person(K+'s-dad',-2.4,-.4,1.62,{shirt:'navy',hair:'short',hairColor:'#1d1512',skin:SKINS[2],adult:true,beard:true,face:'smile',layer:2});
  const boy=B.person(K+'s-boy',-1.4,.6,1.0,{shirt:'casual',...RM,legs:'kick',face:'grin',layer:3});
  const born=B.stand(S.flipCard(K+'s-born',1.3,.32,'BORN 1991',INK.yellow,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const alg=B.stand(P.flag('s-alg',.7,.8,[INK.green,INK.white],true),-3.4,.2,{layer:2,s:0});
  const pals=[[-4.2,.9,'curly'],[-3.0,1.0,'short']].map(([x,z,h],i)=>B.person(K+`s-p${i}`,x as number,z as number,1.0,{shirt:i?'bib':'fan',hair:h as 'curly',skin:SKINS[i*3+1],face:'grin',layer:3}));
  B.slot(.6,.95,4.4,.95);
  const cones=[1.6,2.6,3.6].map((x,i)=>B.stand(S.cone(K+'s-cone',.3),x,.6+(i%2)*.7,{layer:2}));void cones;
  const R=B.person(K+'s-r',.7,.75,1.05,{shirt:'casual',...RM,legs:'kick',face:'grin',layer:3});
  const club=B.stand(S.sign(K+'s-club',1.6,1.2,'AAS SARCELLES',INK.white),2.6,-1.6,{layer:1,s:0});
  const tricks=B.stand(S.flipCard(K+'s-tricks',1.3,.32,'QUICK FEET!',INK.pink),3.8,1.95,{layer:3,s:0,tab:false});
  const ball=ballPair(B,K+'s-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.2):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,2.4,3.2);boy.body.s=beat(t,8,8.8);dad.body.s=beat(t,11.6,12.4);alg.s=beat(t,12.4,13.2);pals.forEach((p,i)=>{p.body.s=beat(t,15+i*.4,15.8+i*.4);});
   const juggle=t>15&&t<19.2?Math.abs(Math.sin(t*3)):0;boy.leg!.rot=-.8*juggle;
   // Roll the ball down the street: three touches past the cones.
   const run=manual?act:track(t,[[19.8,0],[20.4,.33],[20.9,.33],[21.5,.67],[22,.67],[22.6,1]])[0];
   R.body.x=.7+3.4*run;R.body.z=.75+.15*Math.sin(run*Math.PI*3);R.leg!.rot=-.7*Math.abs(Math.sin(run*Math.PI*3));R.body.s=Math.max(beat(t,15.4,16.2),manual?1:0);
   const bx=t<15.4?-1.1:R.body.x+.3,bz=t<15.4?.75:R.body.z+.1;ball(bx,bz,t<15.4?.25*juggle:0,t>8);
   club.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.8,1):0);tricks.s=Math.max(beat(t,28,28.8),manual?beat(act,.9,1):0);
   cheer(R,Math.max(beat(t,31.6,32.2),manual?beat(act,.97,1):0));pals.forEach((p,i)=>cheer(p,beat(t,31.8+i*.3,32.4+i*.3)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,19,20):0;
  };
 }};

/* ───────────── 2 · Losing his dad (father) ───────────── */
const father:SpreadDef={id:'father',rest:17.2,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'AGED 15','A VERY SAD TIME FOR THE FAMILY',INK.blue);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'ALGERIA','HIS FATHER’S COUNTRY · A STADIUM FOR HIS FATHER',INK.green,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{wash(k,4.5,3,'#e7dcef',INK.pink,y=>.15);k.fill(rect(.6,.5,1.3,.9),INK.sky2);k.key(rect(.6,.5,1.3,.9),.014);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,DZ,2);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const starsL=bd.add(S.stars(K+'f-stars',1.4,.4,5),'L',2.6,2.0,{out:.02});
  const lamp=B.stand(S.lamp(K+'f-lamp',.5,1.2),-4.5,-1.4,{layer:1});void lamp;
  const fam=[[-3.6,.2,'bun',true,1.6],[-2.6,.6,'short',false,1.15],[-1.6,.3,'long',false,1.0]].map(([x,z,h,a,s],i)=>B.person(K+`f-p${i}`,x as number,z as number,s as number,{shirt:i===0?'casual':i===1?'navy':'bib',hair:h as 'bun',hairColor:'#1d1512',skin:i===1?RM.skin:SKINS[2],adult:a as boolean,face:'shy',layer:3}));
  const sad=B.stand(S.flipCard(K+'f-sad',1.5,.32,'MISSING HIM',INK.sky,INK.navy),-2.6,1.95,{layer:3,s:0,tab:false});
  const pic=B.stand(familyPic(K+'f-pic',1.6,1.3),1.4,-1.2,{layer:1});
  const cover=pic.flap(P.lineCard('f-cover',1.5,1.2,['LIFT','THE FRAME'],INK.yellow),0,1.26,{z:.03});
  const flagA=B.stand(P.flag('f-flag',.9,1.4,[INK.green,INK.white],true),3.0,-1.2,{layer:1,s:0});
  const R=B.person(K+'f-r',2.6,.6,1.3,{shirt:'ger',...RM,adult:true,face:'smile',layer:3});
  const stad=B.stand(S.sign(K+'f-stad',1.5,1.2,'A STADIUM, FOR DAD',INK.white),4.2,-.4,{layer:2,s:0});
  const love=B.stand(S.flipCard(K+'f-love',1.6,.32,'CARRY THEIR LOVE',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   fam.forEach((p,i)=>{p.body.s=beat(t,6.8+i*.4,7.6+i*.4);const v=beat(t,12.4,13.4);p.armL.rot=-.12-.9*v;p.armR.rot=.12+.9*v;});sad.s=beat(t,8,8.8);pop(starsL,beat(t,13,14));
   // Lift the photo frame: the family, for his father.
   const lift=manual?beat(act,0,.6):beat(t,17.8,19);cover.flip=-2.8*lift;
   flagA.s=Math.max(beat(t,20,20.8),manual?beat(act,.4,.8):0);R.body.s=Math.max(beat(t,20.6,21.4),manual?beat(act,.5,.9):0);stad.s=Math.max(beat(t,26.4,27.2),manual?beat(act,.7,1):0);
   love.s=Math.max(beat(t,32.2,33),manual?beat(act,.85,1):0);R.armR.rot=.12+1.4*beat(t,28,29)*(1-beat(t,31,32));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,17.6,18.6):0;
  };
 }};

/* ───────────── 3 · Too skinny? (skinny) ───────────── */
const skinny:SpreadDef={id:'skinny',rest:17.2,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);caption(k,-2.5,'OVERLOOKED','BIG-CLUB SCOUTS SAID: TOO SLIM',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'QUIMPER 2009 · LE HAVRE 2010','SMALL CLUBS · A GAME EVERY WEEK',INK.blue,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'k-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);crowd(k,4.5,1.4,2.4,[INK.grey,INK.white,'#8f95ad'],2);k.fill(rect(0,2.4,4.5,.6),'#9dbd78');},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.7,.4);roofs(k,.2,4.4,2.3,5);k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const scouts=[[-4.0,-.6],[-1.4,-.8]].map(([x,z],i)=>B.person(K+`k-s${i}`,x,z,1.6,{shirt:'navy',hair:i?'bald':'short',skin:SKINS[i*2],adult:true,face:'open',layer:2}));
  const notes=scouts.map((s,i)=>s.body.add(S.noteCard(K+`k-n${i}`,.5,.4,['TOO','SLIM']),.32,s.h*.6,{z:.03}));
  const R=B.person(K+'k-r',-2.6,.6,1.3,{shirt:'casual',...RM,face:'shy',layer:3});
  const strong=B.stand(S.flipCard(K+'k-strong',1.6,.32,'NOT STRONG ENOUGH?',INK.sky,INK.navy),-2.6,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'k-post',.12,1.9,INK.wood),1.2,-1.0,{layer:1});
  const q=post.arm(pointer(K+'k-q',1.4,.36,'QUIMPER',INK.yellow),0,1.6,{z:.03}),lh=post.arm(pointer(K+'k-lh',1.4,.36,'LE HAVRE',INK.sky),0,1.6,{z:.04});
  const RR=B.person(K+'k-rr',2.6,.6,1.3,{shirt:'ger',...RM,legs:'kick',face:'grin',layer:3});
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+'k-cone',.3),3.2+i*.5,.0+(i%2)*.5,{layer:2,s:0}));
  const left=B.stand(S.flipCard(K+'k-left',1.6,.32,'DRIBBLE · LEFT FOOT',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'k-ball',.1),2.95,.7,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   R.body.s=beat(t,1.6,2.4);scouts.forEach((s,i)=>{s.body.s=beat(t,2.6+i*.4,3.4+i*.4);s.body.yaw=(i?.5:-.5)*beat(t,6+i*.3,7+i*.3);});notes.forEach((n,i)=>pop(n,beat(t,4+i*.4,4.8+i*.4)));
   strong.s=beat(t,14.6,15.4);
   // Turn the signpost: Quimper, then Le Havre.
   pop(q,beat(t,8,8.8));const turn=manual?beat(act,0,.7):beat(t,17.8,19.2);q.rot=Math.PI*.5*turn;pop(q,beat(t,8,8.8)*(1-turn));lh.rot=-Math.PI*.5*(1-turn);pop(lh,turn);
   RR.body.s=Math.max(beat(t,19.6,20.4),manual?beat(act,.4,.8):0);cones.forEach((c,i)=>{c.s=Math.max(beat(t,20+i*.3,20.6+i*.3),manual?beat(act,.5,.9):0);});
   const dr=t>21&&t<29?Math.abs(Math.sin(t*2.4)):0;RR.leg!.rot=-.8*dr;ball.x=2.95+.5*dr;ball.dy=.1*dr;ball.visible=RR.body.s>.5;
   left.s=Math.max(beat(t,21,21.8),manual?beat(act,.8,1):0);cheer(RR,Math.max(beat(t,29.6,30.2),manual?beat(act,.95,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,7.6,8.6):0;
  };
 }};

/* ───────────── 4 · A small price (leicester) ───────────── */
const leicester:SpreadDef={id:'leicester',rest:16.0,
 left:k=>{paving(k,-5,0,'#d9d3c4','#a9a08c');caption(k,-2.5,'JANUARY 2014','ABOUT £450,000 · A SMALL FEE',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'LEICESTER CITY','A NEW COUNTRY · PROMOTION IN HIS FIRST SEASON',INK.blue,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'l-bd',k=>{daySky(k,4.5,3);sea(k,4.5,1.6,.6);for(let i=0;i<3;i++){const x=.6+i*1.3;k.keyFill(`M${x} 1.6 L${x} .8 L${x+.6} .8 L${x+.6} .88 L${x+.08} .88 L${x+.08} 1.6 Z`,INK.red);}k.fill(rect(0,2.2,4.5,.8),'#d9d3c4');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,LCFC,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const plane=bd.add(S.plane(K+'l-pl',.7,.35),'L',3.6,2.0,{out:.03}),planeR=bd.add(S.plane(K+'l-pr',.7,.35),'R',.4,2.1,{out:.03});
  const R=B.person(K+'l-r',-2.8,.3,1.3,{shirt:'ger',...RM,face:'smile',layer:2});
  const tag=B.stand(P.lineCard('l-tag',1.3,.62,['ABOUT','£450,000'],INK.yellow),-4.0,-1.2,{layer:1,s:0});
  const small=B.stand(S.flipCard(K+'l-small',1.4,.32,'A SMALL FEE',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const notyet=B.stand(S.flipCard(K+'l-notyet',1.8,.32,'NOT IN THE TOP LEAGUE YET',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const suit=B.stand(caseBody(K+'l-case',1.3,.8),-1.4,.8,{layer:3});const lid=suit.flap(caseLid(K+'l-lid',1.3,.8),0,.8,{z:.03});
  const RR=B.person(K+'l-rr',1.8,.4,1.3,{shirt:'navy',...RM,legs:'kick',face:'grin',layer:3});
  const mates=[[3.2,.9,'curly'],[4.1,-.2,'short']].map(([x,z,h],i)=>B.person(K+`l-m${i}`,x as number,z as number,1.24,{shirt:'navy',hair:h as 'curly',skin:SKINS[i*3],adult:true,face:'grin',layer:i?2:3}));
  const promo=B.stand(S.flipCard(K+'l-promo',1.4,.32,'PROMOTION!',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const excite=B.stand(S.flipCard(K+'l-ex',1.5,.32,'SO EXCITING',INK.pink),4.2,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16):b.t;
   R.body.s=beat(t,2,2.8);tag.s=beat(t,7.4,8.2);small.s=beat(t,10.2,11);notyet.s=beat(t,13.4,14.2);
   // Open the suitcase: off to England.
   const open=manual?beat(act,0,.5):beat(t,16.6,17.8);lid.flip=-2.6*open;
   plane.dx=-2.6*beat(t,18.4,20.2);pop(plane,beat(t,18.2,18.6)*(1-beat(t,20,20.4)));planeR.dx=2.8*beat(t,20.4,22.6);pop(planeR,beat(t,20.2,20.6)*(1-beat(t,22.4,22.8)));
   RR.body.s=Math.max(beat(t,22.8,23.6),manual?beat(act,.4,.8):0);RR.leg!.rot=-.8*Math.abs(Math.sin(t*2.4))*(t>23.6&&t<28?1:0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,23.4+i*.4,24.2+i*.4),manual?beat(act,.5,.9):0);});
   excite.s=Math.max(beat(t,25.6,26.4),manual?beat(act,.6,1):0);promo.s=Math.max(beat(t,29,29.8),manual?beat(act,.8,1):0);
   cheer(RR,Math.max(beat(t,29.4,30),manual?beat(act,.9,1):0));mates.forEach((m,i)=>cheer(m,Math.max(beat(t,29.6+i*.3,30.2+i*.3),manual?beat(act,.9,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18,19):0;
  };
 }};

/* ───────────── 5 · Champions of England (champions) ───────────── */
const champions:SpreadDef={id:'champions',rest:14.1,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'2015–16 · LEICESTER CITY','VERY FEW THOUGHT THEY HAD A CHANCE',INK.blue,INK.navy,.4);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'PFA PLAYERS’ PLAYER OF THE YEAR','THE FIRST AFRICAN WINNER',INK.blue,INK.navy,.34);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,LCFC,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,LCFC,4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const conf=bd.add(S.confetti(K+'c-conf',3.6,1.4,6),'L',.4,1.1,{out:.04});const bunt=bd.add(S.bunting(K+'c-bunt',3.8,.4,[INK.blue,INK.white,INK.gold]),'R',.4,1.0,{out:.02});
  const doubt=bd.add(P.lineCard('c-doubt',1.6,.58,['ANY CHANCE?','VERY FEW SAID YES'],'#c9b9d6'),'L',3.2,1.55,{out:.03});
  const team=[[-3.8,.9,'curly'],[-1.3,.9,'short']].map(([x,z,h],i)=>B.person(K+`c-t${i}`,x as number,z as number,1.24,{shirt:'navy',hair:h as 'curly',skin:SKINS[i*2],adult:true,face:'grin',layer:3}));
  const R=B.person(K+'c-r',-2.5,.4,1.32,{shirt:'navy',...RM,adult:true,face:'grin',layer:2});
  const pole=B.stand(S.post(K+'c-pole',.14,1.3,INK.stock),-2.0,.7,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'c-cup',.6,.8),0,.3,{z:.03});
  const won=B.stand(S.flipCard(K+'c-won',1.6,.32,'CHAMPIONS!',INK.yellow,INK.navy),-2.5,1.98,{layer:3,s:0,tab:false});
  const frame=B.stand(S.post(K+'c-fpost',1.5,1.3,INK.white),2.5,-1.3,{layer:1,s:0});
  frame.add(P.frame('c-award',1.36,1.0,k=>{k.fill(rect(.08,.08,1.2,.84),'#e9e2cf');k.text('PLAYERS’',.68,.3,.12,INK.navy,{weight:900});k.text('PLAYER',.68,.46,.12,INK.navy,{weight:900});k.fill(ell(.68,.7,.14,.14),INK.gold);k.key(ell(.68,.7,.14,.14),.01);}),0,.14,{z:.012});
  const votes=[[1.2,.5],[3.8,.5]].map(([x,z],i)=>B.person(K+`c-v${i}`,x,z,1.24,{shirt:'navy',hair:i?'long':'bald',hairColor:'#3b2e3f',skin:SKINS[i*3+1],adult:true,face:'grin',layer:3}));
  const RR=B.person(K+'c-rr',2.5,.7,1.32,{shirt:'navy',...RM,adult:true,face:'grin',layer:3});
  const first=B.stand(S.flipCard(K+'c-first',1.6,.32,'FIRST AFRICAN WINNER',INK.pink),2.5,1.98,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.1):b.t;
   R.body.s=beat(t,2.2,3);team.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);});pop(doubt,beat(t,9.4,10.2));
   // Raise the trophy: champions of England.
   const raise=manual?beat(act,0,.6):beat(t,14.6,16);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));cheer(R,Math.max(raise,manual?beat(act,.3,.7):0));
   won.s=Math.max(beat(t,15.6,16.4),manual?beat(act,.5,.9):0);pop(conf,Math.max(beat(t,15.8,17),manual?beat(act,.6,1):0));team.forEach((p,i)=>cheer(p,Math.max(beat(t,16+i*.3,16.6+i*.3),manual?beat(act,.6,1):0)));
   frame.s=Math.max(beat(t,16.6,17.4),manual?beat(act,.6,1):0);votes.forEach((v,i)=>{v.body.s=Math.max(beat(t,19.4+i*.4,20.2+i*.4),manual?beat(act,.7,1):0);v.armR.rot=.12+1.4*Math.max(beat(t,20.4,21),manual?beat(act,.8,1):0);});
   RR.body.s=Math.max(beat(t,17,17.8),manual?beat(act,.7,1):0);first.s=Math.max(beat(t,23.2,24),manual?beat(act,.85,1):0);pop(bunt,Math.max(beat(t,23.4,24.4),manual?beat(act,.85,1):0));cheer(RR,Math.max(beat(t,23.6,24.2),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,16.2,17.2):0;
  };
 }};

/* ───────────── 6 · Captain of Algeria (algeria) ───────────── */
const algeria:SpreadDef={id:'algeria',rest:15.6,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'2019 · AFRICA CUP OF NATIONS','CAPTAIN · THEN THE CHAMPIONS LEAGUE IN 2023',INK.yellow,INK.white,.36);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M5 ${Z(-1.1)} L3.4 ${Z(-1.1)} L3.4 ${Z(1.0)} L5 ${Z(1.0)}`);caption(k,2.5,'THE LAST MINUTE','A FREE KICK · ALGERIA WIN THE CUP',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'a-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,DZ,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,DZ,4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const fw=[bd.add(S.firework(K+'a-fw1',.44,INK.yellow),'L',1.2,1.9,{out:.03}),bd.add(S.firework(K+'a-fw2',.4,INK.green),'R',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'a-conf',3.6,1.4,7),'L',.4,1.1,{out:.04});
  const R=B.person(K+'a-r',-2.5,.4,1.36,{shirt:'ger',...RM,adult:true,face:'grin',layer:2});
  const band=R.body.add(P.disc('a-band',.15,'C'),.19,R.h*.62,{z:.02,anchor:'center'});
  const mates=[[-3.8,.9,'curly'],[-1.2,.9,'short']].map(([x,z,h],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.24,{shirt:'ger',hair:h as 'curly',skin:SKINS[i+1],adult:true,face:'grin',layer:3}));
  const pole=B.stand(S.post(K+'a-pole',.14,1.3,INK.stock),-2.0,.7,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'a-cup',.6,.8),0,.3,{z:.03});
  const africa=B.stand(S.flipCard(K+'a-af',1.7,.32,'CHAMPIONS OF AFRICA',INK.green),-2.5,1.98,{layer:3,s:0,tab:false});
  const ucl=B.stand(P.lineCard('a-ucl',1.6,.62,['CHAMPIONS LEAGUE','2023'],'#6fb6e2'),-4.0,-1.4,{layer:1,s:0});
  B.stand(S.goal(K+'a-goal',.9,1.5),4.6,-.3,{layer:1,yaw:-1.2});
  const keeper=B.person(K+'a-keep',4.2,-.1,1.2,{shirt:'keeper',hair:'short',skin:SKINS[3],adult:true,face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const wall=[0,1,2].map(i=>B.person(K+`a-w${i}`,2.6,-.5+i*.4,1.2,{shirt:'casual',hair:(['short','bald','curly'] as const)[i],skin:SKINS[(i+3)%5],adult:true,face:'open',layer:2}));
  const RR=B.person(K+'a-rr',1.0,.4,1.3,{shirt:'ger',...RM,adult:true,legs:'kick',face:'grin',layer:3});
  const last=B.stand(S.flipCard(K+'a-last',1.6,.32,'THE VERY LAST MINUTE',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'a-ball',.1),1.35,.5,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.6):b.t;
   R.body.s=beat(t,2.2,3);pop(band,beat(t,3,3.8));mates.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);});
   RR.body.s=beat(t,8.6,9.4);wall.forEach((p,i)=>{p.body.s=beat(t,9+i*.3,9.8+i*.3);});keeper.body.s=beat(t,9.4,10.2);last.s=beat(t,12.6,13.4);
   // Kick the ball: a free kick that curls over the wall into the goal.
   const k=manual?beat(act,0,.7):beat(t,16.2,17.6);RR.leg!.rot=-1.1*(manual?pulse(act,0,.25):pulse(t,15.9,16.6));
   const [bx,bz,by]=track(k,[[0,1.35,.5,0],[.45,2.7,-.6,.9],[1,4.35,-.5,.35]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;keeper.body.rot=.5*k;
   const v=Math.max(beat(t,17.8,18.6),manual?beat(act,.75,1):0);cheer(RR,v);wall.forEach(p=>{p.body.yaw=1.2*k;});
   const raise=Math.max(beat(t,18.2,19.6),manual?beat(act,.8,1):0);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));cheer(R,raise);mates.forEach((p,i)=>cheer(p,Math.max(beat(t,18.6+i*.3,19.2+i*.3),manual?beat(act,.85,1):0)));
   africa.s=Math.max(beat(t,18.6,19.4),manual?beat(act,.85,1):0);ucl.s=beat(t,20.6,21.4);
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,18.4+i*.4,19.4+i*.4),manual?beat(act,.9,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,18.6,19.8),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,8.4,9.4)-.8*beat(t,17.8,18.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={streets,father,skinny,leicester,champions,algeria};
