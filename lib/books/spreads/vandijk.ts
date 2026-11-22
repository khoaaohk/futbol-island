/**
 * The six Virgil van Dijk pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/vandijk/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is late growth and patience: a stack of plates, a growth ruler, a new door, a lifted cloud, steps and a trophy.
 * Kits are colour only (no crests); the illness page shows a window and family, never treatment.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,maxOf,cheer,pop,chalk,pitch,pitchLines,floor,paving,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,skyline,sea,backdrop,plates} from '../spreadKit';

const K='vandijk-';
const P=plates(K),{sp}=P;
const VVD={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1512'};
const RED=[INK.red,INK.white,INK.red,'#b8423a'];

/* ───────────── Van Dijk-only plates ───────────── */
const sink=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.35,w,h*.65);k.fill(b,'#c9ccd6');k.dots(b,INK.navy,.035,.18);k.key(b,.014);const top=rect(-.02,h*.3,w+.04,.08);k.fill(top,INK.white);k.key(top,.01);
 const bowl=rect(w*.2,h*.38,w*.45,h*.2);k.fill(bowl,INK.sky);k.key(bowl,.01);k.key(`M${w*.42} ${h*.38} L${w*.42} ${h*.12} Q${w*.42} ${h*.04} ${w*.52} ${h*.04} L${w*.56} ${h*.04}`,.03,INK.grey);for(let i=0;i<4;i++)k.circle(w*(.25+i*.12),h*.36,.035,INK.white,true);
 k.key(rect(w*.08,h*.66,w*.38,h*.26),.01,INK.white);k.key(rect(w*.54,h*.66,w*.38,h*.26),.01,INK.white);},{rim:.014});
const plate=(key:string,w:number,c:string)=>sp(key,w,w*.22,k=>{const e=ell(w/2,w*.11,w*.48,w*.1);k.fill(e,INK.white);k.key(e,.012);k.key(ell(w/2,w*.1,w*.3,w*.055),.008,c);},{rim:.01});
const ruler=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.03,.3);k.key(b,.014);for(let i=1;i<14;i++){const y=h-i*h/14;k.key(`M0 ${y} L${w*(i%2?.3:.55)} ${y}`,.01,INK.navy);}k.text('+18 CM',w/2,h*.12,w*.22,INK.red,{weight:900,max:w*.9});},{rim:.012});
const step=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.22);k.key(b,.014);k.fill(rect(0,0,w,.08),INK.white);k.text(label,w/2,Math.min(h*.5,.36),.12,INK.navy,{weight:900,max:w*.9});},{rim:.016});
const houseWin=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,'#f2d3a0');k.dots(b,INK.brown,.035,.18);k.key(b,.014);k.fill(poly([[-.06,h*.22],[w/2,0],[w+.06,h*.22]]),INK.red);k.key(poly([[-.06,h*.22],[w/2,0],[w+.06,h*.22]]),.012);
 const g=rect(w*.18,h*.34,w*.64,h*.44);k.fill(g,'#fff1c2');k.key(g,.012);k.key(`M${w/2} ${h*.34} L${w/2} ${h*.78} M${w*.18} ${h*.56} L${w*.82} ${h*.56}`,.02,INK.white);k.circle(w*.34,h*.5,.06,INK.pink);k.text('GET WELL',w/2,h*.92,h*.07,INK.navy,{weight:900,max:w*.8});},{rim:.014});
const clubFrame=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.stone);k.dots(b,INK.navy,.03,.15);k.key(b,.014);const g=rect(w*.1,h*.12,w*.8,h*.88);k.fill(g,INK.grass);k.dots(g,INK.leaf,.05,.3);k.key(g,.01);
 k.key(`M${w*.1} ${h*.6} L${w*.9} ${h*.6}`,.02,INK.white);k.key(ell(w/2,h*.6,w*.16,h*.08),.02,INK.white);k.text('GRONINGEN',w/2,h*.09,h*.07,INK.navy,{weight:900,max:w*.9});},{rim:.014});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#2f8a5a');k.dots(b,INK.navy,.035,.3);k.key(b,.014);k.key(rect(w*.15,h*.1,w*.7,h*.35),.012,INK.white);k.key(rect(w*.15,h*.55,w*.7,h*.35),.012,INK.white);k.circle(w*.82,h*.52,.035,INK.gold);},{rim:.014});

/* ───────────── 1 · Washing dishes (dishes) ───────────── */
const dishes:SpreadDef={id:'dishes',rest:21.9,
 left:k=>{floor(k,-5,0,'#e4dccb','#b9ae96');for(let x=-4.8;x<0;x+=.5)for(let y=.3;y<5.6;y+=.5)if((Math.round(x*2)+Math.round(y*2))%2)k.fill(rect(x,y,.5,.5),'#d3c8b0',.6);caption(k,-2.5,'BREDA · THE NETHERLANDS','A PART-TIME JOB WASHING DISHES',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);for(let i=0;i<5;i++)k.circle(1.0+i*.7,Z(1.1),.06,INK.orange);caption(k,2.5,'WILLEM II ACADEMY','JOINED AT EIGHT · TRAINING AND WORK',INK.navy,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'d-bd',k=>{const p=rect(0,0,4.5,3);k.fill(p,'#dfe8ec');for(let x=0;x<4.5;x+=.3)for(let y=0;y<2.4;y+=.3)k.key(rect(x,y,.3,.3),.006,'#a9bcc6');k.fill(rect(0,2.4,4.5,.6),'#c9c3b4');k.fill(rect(.4,.4,1.4,.8),INK.sky2);k.key(rect(.4,.4,1.4,.8),.014);roofs(k,.4,1.8,1.18,2);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'d-sun',.3),'R',3.6,2.0,{out:.012});
  const born=B.stand(S.flipCard(K+'d-born',1.3,.32,'BORN 1991',INK.yellow,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const sk=B.stand(sink(K+'d-sink',1.7,1.25),-3.4,-1.2,{layer:1});
  const V=B.person(K+'d-v',-2.0,-.2,1.2,{shirt:'casual',...VVD,face:'smile',layer:2});
  // Three plates stack on the counter slot.
  B.slot(-1.3,.9,-.6,.9);
  const stack=[0,1,2].map(i=>B.stand(plate(K+`d-p${i}`,.6,[INK.blue,INK.pink,INK.green][i]),-.95,.9,{layer:3,tab:false,s:0}));
  const job=B.stand(S.flipCard(K+'d-job',1.5,.32,'HARD WORK COUNTS',INK.pink),-1.8,1.95,{layer:3,s:0,tab:false});
  const acad=B.stand(S.sign(K+'d-acad',1.5,1.2,'YOUTH ACADEMY',INK.white),1.2,-1.6,{layer:1,s:0});
  B.stand(S.goal(K+'d-goal',1.6,.85),3.8,-1.4,{layer:1});
  const VR=B.person(K+'d-vr',2.0,.5,1.1,{shirt:'casual',...VVD,legs:'kick',face:'grin',layer:3});
  const ballR=B.stand(S.ball(K+'d-ball',.1),2.35,.6,{layer:3,tab:false});
  const days=B.stand(S.flipCard(K+'d-days',1.6,.3,'WORK ON DAYS OFF',INK.sky,INK.navy),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.9):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,2.6,3.4);acad.s=beat(t,7.8,8.6);VR.body.s=beat(t,8.4,9.2);
   const kick=t>9&&t<18?Math.abs(Math.sin(t*2.2)):0;VR.leg!.rot=-.8*kick;ballR.dy=.15*kick;ballR.x=2.35+.5*kick;
   V.body.s=beat(t,12.6,13.4);sk.s=1;days.s=beat(t,18.4,19.2);
   // Stack the plates: three taps, one plate each.
   const p=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,22.3+i*.6,22.8+i*.6));
   stack.forEach((q,i)=>{pop(q,p[i]);q.dy=i*.13+.4*(1-p[i]);});V.armR.rot=.12+1.2*maxOf([0,1,2].map(i=>manual?pulse(act,i/3,(i+.8)/3):pulse(t,22.2+i*.6,22.9+i*.6)));
   job.s=Math.max(beat(t,28,28.8),manual?beat(act,.85,1):0);cheer(V,beat(t,32.6,33.2));cheer(VR,beat(t,32.8,33.4));
   return b.narrated?-.4*beat(t,12,13)+.4*beat(t,17.6,18.6)-.4*beat(t,21.8,22.4):0;
  };
 }};

/* ───────────── 2 · Too many limits? (growth) ───────────── */
const growth:SpreadDef={id:'growth',rest:16.4,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'WILLEM II · AGED 17','NO CONTRACT OFFERED',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);chalk(k,`M2.6 ${Z(-2.1)} L2.6 ${Z(1.9)}`,.02);caption(k,2.5,'STILL GROWING','RIGHT-BACK → CENTRE-BACK',INK.orange,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{wash(k,4.5,3,'#c9cbd8',INK.navy,y=>.25);hills(k,4.5,3,1.9,'#86a27a');k.fill(rect(0,2.3,4.5,.7),'#9dbd78');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'g-sun',.32),'R',3.4,1.9,{out:.012});
  const coach=B.person(K+'g-coach',-3.6,-.6,1.6,{shirt:'coach',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:2});
  const small=B.person(K+'g-small',-1.6,.4,1.0,{shirt:'casual',...VVD,face:'sad',layer:3});
  const board=B.stand(S.sign(K+'g-board',1.5,1.25,'STILL GROWING',INK.yellow),-2.4,-1.5,{layer:1});
  const cover=board.flap(P.lineCard('g-limits',1.36,.62,['TOO MANY','LIMITS?'],'#c9b9d6'),0,1.16,{z:.03});
  const nocon=B.stand(S.flipCard(K+'g-nocon',1.5,.32,'NO CONTRACT',INK.pink),-3.6,1.95,{layer:3,s:0,tab:false});
  const rul=B.stand(ruler(K+'g-ruler',.5,2.0),1.0,-1.2,{layer:1,s:0});
  const tall=B.person(K+'g-tall',2.6,-.1,1.6,{shirt:'casual',...VVD,face:'grin',layer:2});
  const mates=[[1.4,.9],[3.8,.9]].map(([x,z],i)=>B.person(K+`g-m${i}`,x,z,1.12,{shirt:'casual',hair:i?'curly':'short',skin:SKINS[i*2],face:'smile',layer:3}));
  const ball=B.stand(S.ball(K+'g-ball',.1),3.3,-.1,{layer:3,tab:false});
  const cm=B.stand(S.flipCard(K+'g-cm',1.2,.3,'ABOUT 18 CM',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const air=B.stand(S.flipCard(K+'g-air',1.5,.3,'WINS IT IN THE AIR',INK.sky,INK.navy),3.8,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.4):b.t;
   sun.dy=.2*beat(t,18,20);coach.body.s=beat(t,5.6,6.4);coach.armR.rot=.12+1.2*pulse(t,6.4,11.4);small.body.s=beat(t,2,2.8);nocon.s=beat(t,9.6,10.4);small.body.yaw=-.3*beat(t,10,11);
   // Flip the sign: "too many limits?" turns over to "still growing".
   const flip=manual?beat(act,0,.6):beat(t,16.8,18);cover.flip=-3.2*flip;
   rul.s=Math.max(beat(t,20.8,21.6),manual?beat(act,.4,.8):0);const grow=Math.max(beat(t,21.4,23.4),manual?beat(act,.5,1):0);tall.body.s=grow;
   mates.forEach((m,i)=>{m.body.s=beat(t,25+i*.4,25.8+i*.4);});cm.s=Math.max(beat(t,22.4,23.2),manual?beat(act,.7,1):0);
   const head=maxOf([30.4,32.2].map(a=>pulse(t,a,a+1.2)));ball.x=3.3-.5*head;ball.dy=1.7*head;ball.visible=t>29.6;air.s=beat(t,30.6,31.4);
   cheer(tall,Math.max(beat(t,34.2,34.8),manual?beat(act,.95,1):0));cheer(small,beat(t,34.4,35)*.5);
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,18.4,19.4):0;
  };
 }};

/* ───────────── 3 · A new chance (groningen) ───────────── */
const groningen:SpreadDef={id:'groningen',rest:17.7,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'2010 · AGED 19','FROM WILLEM II TO FC GRONINGEN',INK.green);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'1 MAY 2011','HIS FIRST PROFESSIONAL MATCH',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'n-bd',k=>{daySky(k,4.5,3);roofs(k,0,4.5,2.2,3);k.fill(rect(0,2.2,4.5,.8),'#e3d6bb');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,['#2f8a5a',INK.white,'#2f8a5a',INK.navy],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),'#3f7f5a');});
  const plane=bd.add(S.birds(K+'n-birds',1.2,.4),'L',2.8,2.4,{out:.02});
  const V=B.person(K+'n-v',-3.6,.4,1.22,{shirt:'casual',...VVD,face:'smile',layer:3,holdR:'suitcase'});
  const scout=B.person(K+'n-scout',-1.6,-.4,1.6,{shirt:'navy',hair:'bald',skin:SKINS[0],adult:true,beard:true,face:'smile',layer:2});
  const note=scout.body.add(S.noteCard(K+'n-note',.62,.46,['SOMETHING','SPECIAL']),.34,scout.h*.6,{z:.03});
  const far=B.stand(S.flipCard(K+'n-far',1.6,.32,'A CITY FAR FROM HOME',INK.sky,INK.navy),-3.2,1.95,{layer:3,s:0,tab:false});
  const fresh=B.stand(S.flipCard(K+'n-fresh',1.3,.32,'A FRESH START',INK.yellow,INK.navy),-1.3,1.95,{layer:3,s:0,tab:false});
  const frame=B.stand(clubFrame(K+'n-frame',1.4,1.8),1.8,-1.0,{layer:1});
  const door=frame.flap(doorLeaf(K+'n-door',1.12,1.58),-.56,0,{anchor:'bl',axis:'y',z:.02});
  const VR=B.person(K+'n-vr',3.4,.3,1.3,{shirt:'keeper',...VVD,face:'grin',layer:3});
  const mates=[[2.5,1.0],[4.3,-.4]].map(([x,z],i)=>B.person(K+`n-m${i}`,x,z,1.2,{shirt:'keeper',hair:i?'curly':'short',skin:SKINS[i+1],face:'grin',layer:i?2:3}));
  const pro=B.stand(S.flipCard(K+'n-pro',1.7,.32,'A PROFESSIONAL!',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.7):b.t;
   V.body.s=beat(t,2,2.8);V.body.x=-3.6+.8*beat(t,3,8);scout.body.s=beat(t,9.9,10.7);pop(note,beat(t,10.8,11.6));pop(plane,beat(t,13,14));plane.dx=.6*beat(t,13,17);
   far.s=beat(t,14.2,15);fresh.s=beat(t,16.4,17.2);
   // Open the door: the Groningen pitch is behind it.
   const open=manual?beat(act,0,.5):beat(t,18.2,19.4);door.flip=-1.9*open;
   VR.body.s=Math.max(beat(t,20,20.8),manual?beat(act,.4,.8):0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,21+i*.4,21.8+i*.4),manual?beat(act,.5,.9):0);});
   pro.s=Math.max(beat(t,25.8,26.6),manual?beat(act,.8,1):0);cheer(VR,Math.max(beat(t,26,26.6),manual?beat(act,.85,1):0));mates.forEach((m,i)=>cheer(m,beat(t,26.4+i*.3,27+i*.3)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17.8,18.8):0;
  };
 }};

/* ───────────── 4 · Very ill in hospital (hospital) ───────────── */
const hospital:SpreadDef={id:'hospital',rest:21.7,
 left:k=>{floor(k,-5,0,'#dfe6e9','#aab8bf');caption(k,-2.5,'2011 · SOON AFTER HIS 20TH BIRTHDAY','A SERIOUS ILLNESS · THIRTEEN DAYS IN HOSPITAL',INK.blue,INK.navy,.34);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'SUMMER 2012','BACK WITH HIS TEAM',INK.green);},
 build:B=>{
  const bd=backdrop(B,K+'h-bd',k=>{wash(k,4.5,3,'#d5d9e6',INK.sky,y=>.2);hills(k,4.5,3,2.0,'#9fb6a8');k.fill(rect(0,2.3,4.5,.7),'#c9d2cf');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#7fae6e');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const win=B.stand(houseWin(K+'h-win',1.6,1.5),-2.6,-1.4,{layer:1});
  const cloud=win.flap(P.rainCloud('h-cloud',1.7,1.2),0,1.42,{z:.03});
  const sun=bd.add(S.sun(K+'h-sun',.32),'L',2.0,1.3,{out:.012});
  const fam=[[-4.0,.1,'bun'],[-1.2,.2,'short']].map(([x,z,h],i)=>B.person(K+`h-f${i}`,x as number,z as number,1.6,{shirt:i?'navy':'casual',hair:h as 'bun',hairColor:'#1d1512',skin:SKINS[i?4:1],adult:true,face:'shy',layer:2}));
  const heart=fam[0].body.add(S.bubble(K+'h-heart',.46,.4,'heart'),.4,fam[0].h*.95,{z:-.02});
  const days=B.stand(S.flipCard(K+'h-days',1.4,.32,'13 DAYS',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const rest=B.stand(S.flipCard(K+'h-rest',1.6,.32,'REST · PATIENCE',INK.yellow,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  const months=[0,1,2].map(i=>B.stand(P.segment(`h-mo${i}`,.9,.4,['REST','WALK','TRAIN'][i],[INK.sky,INK.yellow,INK.grass][i]),1.0+i*1.0,-1.9,{layer:1,s:0}));
  const V=B.person(K+'h-v',2.4,.8,1.3,{shirt:'keeper',...VVD,face:'grin',layer:3});
  const mates=[[1.2,.9],[3.8,.7]].map(([x,z],i)=>B.person(K+`h-m${i}`,x,z,1.2,{shirt:'keeper',hair:i?'curly':'short',skin:SKINS[i*2],face:'grin',layer:3}));
  const back=B.stand(S.flipCard(K+'h-back',1.7,.32,'BACK WITH HIS TEAM',INK.pink),3.0,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,21.7):b.t;
   win.s=beat(t,2.4,3.2);fam.forEach((p,i)=>{p.body.s=beat(t,18.4+i*.4,19.2+i*.4);});pop(heart,beat(t,19.6,20.4));days.s=beat(t,14.4,15.2);
   // Lift the rain cloud: sunshine over the house, then months of patience.
   const lift=manual?beat(act,0,.6):beat(t,22.2,23.4);cloud.flip=-2.7*lift;sun.dy=.6*lift;pop(sun,Math.max(.01,lift));
   rest.s=Math.max(beat(t,24.4,25.2),manual?beat(act,.3,.6):0);months.forEach((m,i)=>{m.s=Math.max(beat(t,25+i*.6,25.6+i*.6),manual?beat(act,.4+i*.12,.55+i*.12):0);});
   V.body.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.7,1):0);mates.forEach((m,i)=>{m.body.s=Math.max(beat(t,28.2+i*.4,29+i*.4),manual?beat(act,.75,1):0);});back.s=Math.max(beat(t,29,29.8),manual?beat(act,.8,1):0);
   cheer(V,Math.max(beat(t,30,30.6),manual?beat(act,.9,1):0));mates.forEach((m,i)=>cheer(m,beat(t,30.4+i*.3,31+i*.3)));fam.forEach((p,i)=>cheer(p,beat(t,36.4+i*.3,37+i*.3)*.6));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,27,28)-.4*beat(t,36,37):0;
  };
 }};

/* ───────────── 5 · Step by step (climb) ───────────── */
const climb:SpreadDef={id:'climb',rest:14.6,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);caption(k,-2.5,'2013 CELTIC · 2015 SOUTHAMPTON','ONE MORE STEP UP EACH TIME',INK.green,INK.navy,.36);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'JANUARY 2018 · LIVERPOOL','THE BIGGEST FEE EVER PAID FOR A DEFENDER THEN',INK.red,INK.white,.36);},
 build:B=>{
  const bd=backdrop(B,K+'c-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,'#6d8f76');sea(k,4.5,1.9,.35);k.fill(rect(0,2.25,4.5,.75),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.45,RED,3);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),'#3f7f5a');});
  const stars=bd.add(S.stars(K+'c-stars',2.6,.6,10),'R',1.0,2.3,{out:.02});
  const steps=[['CELTIC',.5,INK.green],['SOUTHAMPTON',.95,INK.red],['LIVERPOOL',1.4,INK.yellow]].map(([l,h,c],i)=>B.stand(step(K+`c-st${i}`,1.1,h as number,l as string,c as string),[-3.8,-2.5,1.4][i],[-.2,-.6,-1.0][i],{layer:2}));
  const VL=B.person(K+'c-vl',-4.6,.6,1.12,{shirt:'casual',...VVD,face:'smile',layer:3});
  const VR=B.person(K+'c-vr',1.4,-1.0,1.12,{shirt:'coach',...VVD,face:'grin',layer:3});
  const two=B.stand(S.flipCard(K+'c-two',1.5,.32,'SCOTTISH LEAGUE ×2',INK.green),-3.6,1.95,{layer:3,s:0,tab:false});
  const cup=B.stand(S.trophy(K+'c-cup',.4,.56),-4.4,-1.4,{layer:1,s:0});
  const sign=B.stand(S.sign(K+'c-sign',1.5,1.25,'BIGGEST FEE',INK.yellow),3.4,-1.5,{layer:1,s:0});
  const fans=[[2.6,.9],[3.8,.6]].map(([x,z],i)=>B.person(K+`c-f${i}`,x,z,1.16,{shirt:'coach',hair:i?'long':'curly',skin:SKINS[i+2],face:'grin',layer:3}));
  const wanted=B.stand(S.flipCard(K+'c-want',1.8,.32,'ONE OF THE MOST WANTED',INK.pink),3.2,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.6):b.t;
   steps.forEach((s,i)=>{s.s=[beat(t,2,2.8),beat(t,8,8.8),Math.max(beat(t,15,15.8),manual?1:0)][i];});cup.s=beat(t,5.4,6.2);two.s=beat(t,5.8,6.6);
   // Climb the steps: one tap a step; the third is Liverpool on the right page.
   const up=[0,1,2].map(i=>manual?beat(act,i/3,(i+.8)/3):beat(t,15+i*1.2,15.8+i*1.2));
   const at=[[-3.8,-.18,.5],[-2.5,-.58,.95]];let [x,z,dy]=[-4.6,.6,0];
   for(let i=0;i<2;i++){const u=up[i],[x1,z1,h1]=at[i];x=x+(x1-x)*u;z=z+(z1-z)*u;dy=dy+(h1-dy)*u;}
   VL.body.x=x;VL.body.z=z+.02;VL.body.dy=dy;VL.body.s=beat(t,1.8,2.6)*(1-up[2]);VR.body.s=up[2];VR.body.dy=1.4*up[2];VR.body.z=-.98;
   const m=manual?beat(act,.7,1):0;sign.s=Math.max(beat(t,20.4,21.2),m);fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,17+i*.4,17.8+i*.4),m);cheer(f,Math.max(beat(t,18+i*.3,18.6+i*.3),m));});
   wanted.s=Math.max(beat(t,26,26.8),m);pop(stars,Math.max(beat(t,26.4,27.4),manual?beat(act,.9,1):0));cheer(VR,Math.max(beat(t,27,27.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16,17):0;
  };
 }};

/* ───────────── 6 · Champion and captain (captain) ───────────── */
const captainS:SpreadDef={id:'captain',rest:22.3,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);caption(k,-2.5,'2019 · CHAMPIONS LEAGUE','UEFA PLAYER OF THE YEAR · 2ND FOR THE BALLON D’OR',INK.yellow,INK.white,.36);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'2023 · LIVERPOOL CAPTAIN','A LATE START IS NOT A SLOW FINISH',INK.red,INK.navy,.38);},
 build:B=>{
  const bd=backdrop(B,K+'k-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,RED,1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.3,2.4,RED,4);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const fw=[bd.add(S.firework(K+'k-fw1',.44,INK.yellow),'L',1.2,1.9,{out:.03}),bd.add(S.firework(K+'k-fw2',.4,INK.pink),'L',3.4,2.0,{out:.03})];
  const conf=bd.add(S.confetti(K+'k-conf',3.6,1.4,5),'L',.4,1.1,{out:.04});
  const team=[[-3.6,1.0,'curly'],[-1.4,.9,'short']].map(([x,z,h],i)=>B.person(K+`k-m${i}`,x as number,z as number,1.2,{shirt:'coach',hair:h as 'curly',hairColor:'#1d1512',skin:SKINS[(i+1)%5],face:'grin',layer:3}));
  const VL=B.person(K+'k-vl',-2.5,.4,1.36,{shirt:'coach',...VVD,beard:true,adult:true,face:'grin',layer:2});
  const pole=B.stand(S.post(K+'k-pole',.14,1.3,INK.stock),-2.0,.6,{layer:3,tab:false});const cup=pole.add(S.trophy(K+'k-cup',.6,.8),0,.3,{z:.03});
  const poy=B.stand(S.flipCard(K+'k-poy',1.6,.32,'PLAYER OF THE YEAR',INK.yellow,INK.navy),-2.5,1.98,{layer:3,s:0,tab:false});
  const gb=B.stand(S.goldenBall(K+'k-gb',.24),-4.3,-1.4,{layer:1,s:0});const second=B.stand(S.flipCard(K+'k-2nd',1.0,.3,'2ND',INK.sky,INK.navy),-4.2,-.75,{layer:2,s:0,tab:false});
  const knee=B.stand(P.lineCard('k-knee',1.5,.62,['2020: KNEE INJURY','MONTHS TO COME BACK'],'#c9b9d6'),1.4,-1.4,{layer:1,s:0});
  const VR=B.person(K+'k-vr',2.8,.4,1.4,{shirt:'coach',...VVD,beard:true,adult:true,face:'grin',layer:3});
  const band=VR.body.add(P.disc('k-band',.15,'C'),.19,VR.h*.62,{z:.02,anchor:'center'});
  const capt=B.stand(S.flipCard(K+'k-capt',1.4,.32,'CAPTAIN · 2023',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const keep=B.stand(S.flipCard(K+'k-keep',1.3,.32,'KEEP GROWING',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.3):b.t;
   VL.body.s=beat(t,2,2.8);team.forEach((p,i)=>{p.body.s=beat(t,2.6+i*.4,3.4+i*.4);});poy.s=beat(t,7.6,8.4);gb.s=beat(t,10.2,11);second.s=beat(t,11,11.8);
   knee.s=beat(t,13,13.8);VR.body.s=beat(t,15.6,16.4);VR.body.dx=-.6*(1-beat(t,16,20));
   // Raise the trophy: the Champions League cup goes up, then the captain's armband.
   const raise=manual?beat(act,0,.6):beat(t,22.8,24.2);cup.dy=-.15+.9*raise;pop(cup,Math.min(1,.15+raise*2));cheer(VL,Math.max(raise,manual?beat(act,.3,.7):0));
   fw.forEach((q,i)=>{pop(q,Math.max(beat(t,24+i*.4,25+i*.4),manual?beat(act,.6,1):0));q.rot=t*.2;});pop(conf,Math.max(beat(t,24.2,25.4),manual?beat(act,.6,1):0));team.forEach((p,i)=>cheer(p,beat(t,24.4+i*.3,25+i*.3)));
   pop(band,Math.max(beat(t,25.6,26.4),manual?beat(act,.7,1):0));capt.s=Math.max(beat(t,26,26.8),manual?beat(act,.75,1):0);keep.s=beat(t,35.2,36);cheer(VR,beat(t,29.4,30));
   return b.narrated?-.4*beat(t,2,3)+.8*beat(t,24.6,25.6):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={dishes,growth,groningen,hospital,climb,captain:captainS};
