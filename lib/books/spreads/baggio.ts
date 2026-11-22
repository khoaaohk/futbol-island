/**
 * The six Roberto Baggio pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/baggio/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The book's thread is coming back: a door kept open, calendar pages, a photo frame, a kick, a lifted rain cloud and a banner.
 * The knee injury is shown only as a sad figure on a bench (no injury drawn). Kits are colour only; no crests.
 */
import {INK,rect,ell,poly} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,wash,daySky,crowd,nightSky,lightRig,hills,roofs,backdrop,plates} from '../spreadKit';

const K='baggio-';
const P=plates(K),{sp}=P;
const RB={skin:'#e0a77c',hair:'short' as const,hairColor:'#2a1d16'};
const RBP={...RB,hair:'bun' as const};
const ITA=[INK.blue,INK.white,'#6fb6e2',INK.blue];
const VIOLA='#6b4c9a';

/* ───────────── Baggio-only plates ───────────── */
const shirt10=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const p=poly([[w*.2,0],[w*.8,0],[w,h*.22],[w*.86,h*.36],[w*.78,h*.3],[w*.78,h],[w*.22,h],[w*.22,h*.3],[w*.14,h*.36],[0,h*.22]]);k.fill(p,c);k.dots(p,INK.navy,.03,.25);k.key(p,.013);k.text('10',w/2,h*.72,h*.4,INK.white,{weight:900});},{rim:.014});
const wheat=(key:string,s:number)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),INK.sky2);k.key(ell(s/2,s/2,s*.46,s*.46),.01);for(const dx of [-.12,0,.12]){const x=s*(.5+dx);k.key(`M${s/2} ${s*.86} Q${x} ${s*.5} ${x} ${s*.22}`,.014,INK.brown);for(let j=0;j<4;j++){const y=s*(.24+j*.1);k.fill(ell(x-.03,y,.022,.04),INK.gold);k.fill(ell(x+.03,y+.02,.022,.04),INK.gold);}}},{rim:.012});
const tally=(key:string,w:number,h:number,n:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);for(let i=0;i<n;i++){const x=w*(.12+i*.19);k.fill(ell(x,h*.5,h*.28,h*.28),INK.white);k.key(ell(x,h*.5,h*.28,h*.28),.01);k.fill(poly([[x,h*.36],[x+h*.1,h*.45],[x+h*.06,h*.6],[x-h*.06,h*.6],[x-h*.1,h*.45]]),INK.navy);}},{rim:.014});

/* ───────────── 1 · Hurt before the big move (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:20.8,
 left:k=>{pitch(k,-5,0,'#9dbd78',INK.green,.8);caption(k,-2.5,'CALDOGNO · ITALY','BORN 1967 · 5 MAY 1985: A BAD KNEE INJURY',INK.blue,INK.navy,.4);},
 right:k=>{floor(k,0,5,'#e3d6bb','#b2a283');caption(k,2.5,'FIORENTINA','THEY KEPT THEIR PROMISE',VIOLA,INK.navy,.42);},
 build:B=>{
  const bd=backdrop(B,K+'k-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.7,'#9dbd78');roofs(k,.3,4.2,2.2,2);k.fill(rect(0,2.2,4.5,.8),'#9dbd78');},
   k=>{wash(k,4.5,3,'#e7dcef',VIOLA,y=>.18);for(let x=.4;x<4.5;x+=.7)k.key(`M${x} 0 L${x} 2.4`,.01,'#c9b9d6');k.fill(rect(0,2.4,4.5,.6),'#e3d6bb');});
  const sun=bd.add(S.sun(K+'k-sun',.3),'L',3.7,2.1,{out:.012});
  B.stand(S.tree(K+'k-tree',.9,1.4,'cypress'),-4.5,-1.5,{layer:1});
  const born=B.stand(S.flipCard(K+'k-born',1.3,.32,'BORN 1967',INK.yellow,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const R=B.person(K+'k-r',-2.6,.4,1.25,{shirt:'fan',...RB,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'k-ball',.1),-2.2,.6,{layer:3,tab:false});
  const benchL=B.stand(S.bench(K+'k-bench',1.3,.5),-1.4,-.6,{layer:2});void benchL;
  const sad=B.person(K+'k-sad',-1.4,-.5,1.15,{shirt:'fan',...RB,face:'sad',layer:2});
  const hurt=B.stand(S.flipCard(K+'k-hurt',1.5,.32,'A BAD KNEE INJURY',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  const days=B.stand(P.lineCard('k-days',1.4,.58,['2 DAYS','BEFORE THE MOVE'],INK.yellow),-4.0,-.4,{layer:2,s:0});
  const club=B.stand(S.sign(K+'k-club',1.6,1.2,'FIORENTINA',INK.white),4.0,-1.6,{layer:1,s:0});
  const frameD=B.stand(P.doorway('k-frame',1.0,1.6,'#d9cdb6'),1.7,-.9,{layer:2});
  const inside=frameD.add(P.frame('k-in',.8,1.3,k=>{k.fill(rect(.06,.06,.68,1.18),VIOLA);k.dots(rect(.06,.06,.68,1.18),INK.navy,.035,.3);k.text('WELCOME',.4,.5,.1,INK.white,{weight:900});},INK.white),0,.12,{z:.012});void inside;
  const door=frameD.flap(P.doorway('k-door',.84,1.4,VIOLA),-.42,.1,{anchor:'bl',axis:'y',z:.03});
  const man=B.person(K+'k-man',2.9,-.2,1.62,{shirt:'navy',hair:'bald',skin:SKINS[0],adult:true,face:'smile',layer:2});
  const docs=B.stand(S.noteCard(K+'k-doc',1.1,.6,['PLAY','AGAIN?']),3.8,.4,{layer:3,s:0});
  const promise=B.stand(S.flipCard(K+'k-prom',1.5,.32,'PROMISE KEPT',INK.yellow,INK.navy),2.6,1.95,{layer:3,s:0,tab:false});
  const RR=B.person(K+'k-rr',1.7,.5,1.25,{shirt:'navy',...RB,face:'shy',layer:3});
  const wait=B.stand(S.flipCard(K+'k-wait',1.5,.32,'WE WILL WAIT',VIOLA),4.1,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.8):b.t;
   sun.dy=.3*beat(t,0,2);born.s=beat(t,3,3.8);
   R.body.s=beat(t,2.4,3.2)*(1-beat(t,9,9.6));const dr=t>3&&t<9?Math.abs(Math.sin(t*2.6)):0;R.leg!.rot=-.8*dr;ball.dy=.12*dr;ball.visible=R.body.s>.4;
   sad.body.s=beat(t,9.2,10);hurt.s=beat(t,10.4,11.2);days.s=beat(t,15.2,16);club.s=beat(t,16.4,17.2);
   // Open the door: Fiorentina keep the door open.
   const open=manual?beat(act,0,.5):beat(t,21.2,22.4);door.flip=-1.9*open;
   man.body.s=Math.max(beat(t,21.8,22.6),manual?beat(act,.3,.7):0);man.armL.rot=-.12-1.1*Math.max(beat(t,22.6,23.4),manual?beat(act,.5,.8):0);
   docs.s=Math.max(beat(t,23,23.8),manual?beat(act,.4,.8):0)*(1-beat(t,26.4,27));
   promise.s=Math.max(beat(t,26.8,27.6),manual?beat(act,.6,1):0);RR.body.s=Math.max(beat(t,28,28.8),manual?beat(act,.7,1):0);
   wait.s=Math.max(beat(t,30.8,31.6),manual?beat(act,.85,1):0);cheer(RR,beat(t,33.4,34)*.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,20.6,21.6):0;
  };
 }};

/* ───────────── 2 · A long recovery (recovery) ───────────── */
const recovery:SpreadDef={id:'recovery',rest:16.1,
 left:k=>{floor(k,-5,0);caption(k,-2.5,'1985 TO 1987','A SECOND OPERATION · 220 STITCHES',INK.blue);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'SLOWLY, STRONGER','HE KEPT WORKING, AGAIN AND AGAIN',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'r-bd',k=>{wash(k,4.5,3,'#efe0c4',INK.white,y=>.2);for(let x=.3;x<4.5;x+=.6)k.key(`M${x} 0 L${x} 2.4`,.01,'#c9b48e');k.fill(rect(.5,.5,1.2,.8),INK.sky2);k.key(rect(.5,.5,1.2,.8),.014);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.9,'#9dbd78');k.fill(rect(0,2.3,4.5,.7),INK.grass);});
  const sun=bd.add(S.sun(K+'r-sun',.3),'R',3.6,2.0,{out:.012});
  const bench=B.stand(S.bench(K+'r-bench',1.6,.55),-2.8,.1,{layer:2});void bench;
  const R=B.person(K+'r-r',-2.8,.2,1.25,{shirt:'casual',...RB,face:'shy',layer:3});
  const stitch=B.stand(S.flipCard(K+'r-st',1.4,.32,'220 STITCHES',INK.sky,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const season=B.stand(S.flipCard(K+'r-sea',1.6,.32,'MISSING A SEASON',INK.pink),-1.8,1.95,{layer:3,s:0,tab:false});
  const cal=B.stand(S.post(K+'r-cal',1.0,1.2,INK.white),-1.0,-1.2,{layer:1});
  cal.add(P.lineCard('r-back',.84,.62,['BACK!'],INK.grass),0,.25,{z:.012});
  const pages=['1987','1986','1985'].map((y,i)=>cal.flap(P.lineCard(`r-y${y}`,.84,.62,[y],[INK.yellow,INK.sky,INK.pink][i]),0,.88,{z:.022+i*.004}));
  const bubble=B.stand(S.bubble(K+'r-bub',.6,.5,'dots'),-2.2,-.4,{layer:2,s:0});
  const RR=B.person(K+'r-rr',1.4,.5,1.25,{shirt:'fan',...RB,legs:'kick',face:'grin',layer:3});
  const cones=[0,1,2].map(i=>B.stand(S.cone(K+'r-cone',.3),2.4+i*.8,.0+(i%2)*.6,{layer:2,s:0}));
  const pat=B.stand(S.flipCard(K+'r-pat',1.4,.32,'PATIENCE',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const again=B.stand(S.flipCard(K+'r-again',1.6,.32,'AGAIN AND AGAIN',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'r-ball',.1),1.7,.6,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.1):b.t;
   R.body.s=beat(t,1.6,2.4);stitch.s=beat(t,3,3.8);season.s=beat(t,8.6,9.4);pop(bubble,beat(t,12,12.8)*(1-beat(t,18.4,19)));R.body.dy=-.08*beat(t,12,13);
   // Turn the calendar pages: 1985, 1986, 1987 … back!
   pages.slice().reverse().forEach((q,i)=>{const v=manual?beat(act,i/3,(i+.8)/3):beat(t,16.6+i*.7,17.2+i*.7);q.flip=-3.2*v;});
   const back=Math.max(beat(t,21.6,22.4),manual?beat(act,.75,1):0);RR.body.s=back;
   cones.forEach((c,i)=>{c.s=Math.max(beat(t,22+i*.3,22.6+i*.3),manual?beat(act,.8,1):0);});
   const run=t>22.4?(t*.5)%1:manual?act:0;RR.body.x=1.4+2.6*(t>22.4&&t<32?track(run,[[0,0],[.5,1],[1,0]])[0]:0);ball.x=RR.body.x+.3;ball.visible=RR.body.s>.4;
   pat.s=Math.max(beat(t,18.6,19.4),manual?beat(act,.6,1):0);again.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.9,1):0);
   cheer(RR,Math.max(beat(t,33,33.6),manual?beat(act,.97,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16,17):0;
  };
 }};

/* ───────────── 3 · The best in the world (best) ───────────── */
const best:SpreadDef={id:'best',rest:13.2,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1990 WORLD CUP · ITALY','A BRILLIANT GOAL v CZECHOSLOVAKIA',INK.blue,INK.navy,.4);},
 right:k=>{floor(k,0,5,'#efe4ca','#cdbd98');caption(k,2.5,'1993 · BALLON D’OR','FIFA WORLD PLAYER OF THE YEAR',INK.gold,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'b-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,ITA,1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{wash(k,4.5,3,'#f6e8cc',INK.gold,y=>.15);crowd(k,4.5,1.5,2.4,ITA,3);k.fill(rect(0,2.4,4.5,.6),'#efe4ca');});
  const bunt=bd.add(S.bunting(K+'b-bunt',3.8,.4,[INK.blue,INK.white,INK.green]),'L',.4,.9,{out:.02});
  B.stand(S.goal(K+'b-goal',1.6,1.0),-.9,-1.3,{layer:1});
  const keep=B.person(K+'b-keep',-.9,-1.0,1.2,{shirt:'keeper',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const defs=[[-2.2,-.2],[-1.6,.5]].map(([x,z],i)=>B.person(K+`b-d${i}`,x,z,1.2,{shirt:'casual',hair:i?'curly':'short',skin:SKINS[i*2],adult:true,face:'open',layer:2}));
  const R=B.person(K+'b-r',-4.0,.8,1.28,{shirt:'fan',...RB,adult:true,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'b-ball',.1),-3.7,.9,{layer:3,tab:false});
  const wow=B.stand(S.flipCard(K+'b-wow',1.6,.32,'WHAT A GOAL!',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'b-post',1.7,1.5,INK.white),2.5,-1.2,{layer:1});
  post.add(P.frame('b-award',1.5,1.3,k=>{k.fill(rect(.09,.09,1.32,1.12),'#1d2c57');k.dots(rect(.09,.09,1.32,1.12),INK.blue,.04,.3);k.text('BALLON D’OR',.75,.3,.13,INK.gold,{weight:900});k.text('1993',.75,1.08,.15,INK.white,{weight:900});}),0,.1,{z:.012});
  const gb=post.add(S.goldenBall(K+'b-gb',.26),0,.42,{z:.02});
  const cover=post.flap(P.lineCard('b-cover',1.56,1.36,['LIFT','THE FRAME'],INK.yellow),0,1.47,{z:.04});
  const RR=B.person(K+'b-rr',1.2,.6,1.32,{shirt:'fan',...RBP,adult:true,face:'grin',layer:3});
  const fans=[[3.4,.8,'long'],[4.3,.2,'curly']].map(([x,z,h],i)=>B.person(K+`b-f${i}`,x as number,z as number,1.1,{shirt:i?'bib':'fan',hair:h as 'long',skin:SKINS[i*2+1],face:'grin',layer:3}));
  const bestC=B.stand(S.flipCard(K+'b-best',1.8,.32,'BEST IN THE WORLD',INK.pink),2.5,1.95,{layer:3,s:0,tab:false});
  const pony=B.stand(S.flipCard(K+'b-pony',1.6,.32,'SKILL · CALM · PONYTAIL',INK.sky,INK.navy),4.2,1.6,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.2):b.t;
   pop(bunt,beat(t,1.8,2.8));R.body.s=beat(t,2,2.8);keep.body.s=beat(t,2.4,3.2);defs.forEach((d,i)=>{d.body.s=beat(t,2.8+i*.3,3.6+i*.3);});
   // A slalom run past two defenders, then the goal.
   const run=beat(t,4,8);const [rx,rz]=track(run,[[0,-4.0,.8],[.4,-2.9,.1],[.8,-2.3,.9],[1,-1.9,.4]]);R.body.x=rx;R.body.z=rz;R.leg!.rot=-.7*Math.abs(Math.sin(run*Math.PI*4))-1.0*pulse(t,8,8.5);
   defs.forEach((d,i)=>{d.body.yaw=(i?-.6:.6)*beat(t,5+i,6+i);});
   const shot=beat(t,8.2,9);const [bx,bz,by]=t<8.2?[rx+.3,rz+.1,0]:track(shot,[[0,-1.6,.4,0],[1,-.8,-1.2,.5]]);ball.x=bx;ball.z=bz;ball.dy=by;keep.body.rot=-.5*shot;
   wow.s=beat(t,9,9.8);
   // Lift the photo frame: the Ballon d'Or.
   const lift=manual?beat(act,0,.6):beat(t,13.6,14.8);cover.flip=-2.9*lift;gb.dy=.06*Math.sin(t*1.5)*lift;
   RR.body.s=Math.max(beat(t,15.8,16.6),manual?beat(act,.4,.8):0);bestC.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.6,1):0);
   fans.forEach((f,i)=>{f.body.s=Math.max(beat(t,26.8+i*.4,27.6+i*.4),manual?beat(act,.7,1):0);cheer(f,Math.max(beat(t,27.8+i*.3,28.4+i*.3),manual?beat(act,.85,1):0));});
   pony.s=Math.max(beat(t,27.6,28.4),manual?beat(act,.85,1):0);cheer(RR,Math.max(beat(t,31.4,32),manual?beat(act,.95,1):0)*.7);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,13,14):0;
  };
 }};

/* ───────────── 4 · Carrying the team (1994) ───────────── */
const usa:SpreadDef={id:'worldcup',rest:16.3,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'1994 WORLD CUP · USA','5 GOALS IN THE KNOCKOUT ROUNDS',INK.blue,INK.navy,.4);},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M5 ${Z(-1.1)} L3.4 ${Z(-1.1)} L3.4 ${Z(1.0)} L5 ${Z(1.0)}`);caption(k,2.5,'ALL THE WAY TO THE FINAL','ITALY v BRAZIL',INK.blue,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'u-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,ITA,2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.yellow,INK.blue,INK.white,INK.green],4);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const sun=bd.add(S.sun(K+'u-sun',.32),'L',3.7,2.2,{out:.012});
  const R=B.person(K+'u-r',-2.6,.4,1.32,{shirt:'fan',...RBP,adult:true,face:'grin',layer:3});
  const mates=[[-4.0,.9,'curly'],[-1.2,.9,'short']].map(([x,z,h],i)=>B.person(K+`u-m${i}`,x as number,z as number,1.24,{shirt:'fan',hair:h as 'curly',skin:SKINS[i*2],adult:true,face:'grin',layer:3}));
  const goals=B.stand(tally(K+'u-tally',1.6,.42,5),-2.6,-1.5,{layer:1,s:0});
  const ham=B.stand(S.flipCard(K+'u-ham',1.6,.32,'A SORE HAMSTRING',INK.pink),-2.6,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'u-goal',.9,1.5),4.6,-.3,{layer:1,yaw:-1.2});
  const keeper=B.person(K+'u-keep',4.2,-.1,1.2,{shirt:'keeper',hair:'short',skin:SKINS[3],adult:true,face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const RR=B.person(K+'u-rr',1.2,.4,1.3,{shirt:'fan',...RBP,adult:true,legs:'kick',face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'u-ball',.1),1.55,.5,{layer:3,tab:false});
  B.slot(1.55,.5,4.2,-.2);
  const fin=B.stand(S.sign(K+'u-fin',1.5,1.2,'FINAL: v BRAZIL',INK.yellow),2.6,-1.6,{layer:1,s:0});
  const goalC=B.stand(S.flipCard(K+'u-goal-c',1.4,.32,'GOAL!',INK.yellow,INK.navy),2.0,1.95,{layer:3,s:0,tab:false});
  const him=B.stand(S.flipCard(K+'u-him',1.8,.32,'HE CARRIED THE TEAM',INK.pink),3.9,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.3):b.t;
   pop(sun,beat(t,0,1.6));R.body.s=beat(t,2,2.8);mates.forEach((m,i)=>{m.body.s=beat(t,2.6+i*.4,3.4+i*.4);});goals.s=beat(t,5,5.8);
   ham.s=beat(t,10,10.8);R.body.lean=-.08*beat(t,10,11)*(1-beat(t,15,16));
   // Kick the ball: along the slot into the goal.
   const k=manual?beat(act,0,.6):beat(t,16.9,18);RR.body.s=Math.max(beat(t,13,13.8),manual?1:0);RR.leg!.rot=-1.1*(manual?pulse(act,0,.25):pulse(t,16.6,17.2));
   const [bx,bz,by]=track(k,[[0,1.55,.5,0],[.6,3.2,.1,.25],[1,4.3,-.25,.2]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;keeper.body.rot=.45*k;
   goalC.s=Math.max(beat(t,18,18.6),manual?beat(act,.6,.9):0);cheer(RR,Math.max(beat(t,18.2,18.8),manual?beat(act,.65,.95):0));
   fin.s=Math.max(beat(t,21.4,22.2),manual?beat(act,.75,1):0);him.s=Math.max(beat(t,25.2,26),manual?beat(act,.85,1):0);
   const c=Math.max(beat(t,25.6,26.2),manual?beat(act,.9,1):0);cheer(R,c);mates.forEach((m,i)=>cheer(m,Math.max(beat(t,25.8+i*.3,26.4+i*.3),manual?beat(act,.9,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,16.2,17.2):0;
  };
 }};

/* ───────────── 5 · The penalty (penalty) ───────────── */
const penalty:SpreadDef={id:'penalty',rest:18.0,
 left:k=>{pitchLines(k,-5,0,-2.5,'#3f7f5a',INK.navy);chalk(k,`M-3.6 ${Z(-2.1)} L-3.6 ${Z(-1.2)} L-1.4 ${Z(-1.2)} L-1.4 ${Z(-2.1)}`);caption(k,-2.5,'17 JULY 1994 · THE FINAL','0–0 · A PENALTY SHOOTOUT',INK.yellow,INK.white,.4);},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.9);caption(k,2.5,'A MISS IS A MOMENT','NOT WHO YOU ARE',INK.yellow,INK.white,.42);},
 build:B=>{
  const bd=backdrop(B,K+'p-bd',k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.yellow,INK.blue,INK.white,'#6fb6e2'],1);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.yellow,INK.blue,INK.white,'#6fb6e2'],4);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const board=B.stand(S.scoreboard(K+'p-board',1.5,1.2,'THE FINAL'),-4.2,-1.5,{layer:1,s:0});board.add(S.scoreFlap(K+'p-sf',1.2,.56,'ITA','0–0','BRA'),0,.34,{z:.012});
  B.stand(S.goal(K+'p-goal',1.7,1.0),-2.5,-1.6,{layer:1});
  const keeper=B.person(K+'p-keep',-2.5,-1.3,1.2,{shirt:'keeper',hair:'short',skin:SKINS[3],adult:true,face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const R=B.person(K+'p-r',-2.5,.7,1.3,{shirt:'fan',...RBP,adult:true,legs:'kick',face:'open',layer:3});
  const ball=B.stand(S.ball(K+'p-ball',.1),-2.4,.3,{layer:3,tab:false});
  const over=B.stand(S.flipCard(K+'p-over',1.6,.32,'OVER THE BAR',INK.pink),-3.8,1.95,{layer:3,s:0,tab:false});
  const bra=B.stand(S.flipCard(K+'p-bra',1.6,.32,'BRAZIL WIN',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const RR=B.person(K+'p-rr',2.5,.4,1.3,{shirt:'fan',...RBP,adult:true,face:'sad',layer:2});
  const mates=[[1.4,.7,'curly'],[3.6,.7,'short'],[2.0,-.4,'bald']].map(([x,z,h],i)=>B.person(K+`p-m${i}`,x as number,z as number,1.24,{shirt:'fan',hair:h as 'curly',skin:SKINS[i+1],adult:true,face:'smile',layer:i===2?1:3}));
  const cloud=bd.add(P.rainCloud('p-cloud',2.2,1.1),'R',1.2,.9,{out:.05});
  const hero=B.stand(S.flipCard(K+'p-hero',1.5,.32,'STILL A HERO',INK.yellow,INK.navy),2.5,1.95,{layer:3,s:0,tab:false});
  const watch=B.stand(P.lineCard('p-watch',1.4,.58,['MILLIONS','WATCHING'],'#c9b9d6'),1.0,-1.6,{layer:1,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18):b.t;
   board.s=beat(t,2,2.8);keeper.body.s=beat(t,4,4.8);R.body.s=beat(t,7.4,8.2);
   // The run-up and the kick: the ball flies up over the crossbar.
   R.leg!.rot=-1.1*pulse(t,9,9.6);const k=beat(t,9.2,10.6);const [bx,bz,by]=track(k,[[0,-2.4,.3,0],[.6,-2.5,-.9,1.1],[1,-2.6,-1.9,1.5]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.visible=t<14;keeper.body.rot=-.5*k;
   over.s=beat(t,10.4,11.2);bra.s=beat(t,12.8,13.6);R.body.lean=.1*beat(t,11,12);
   RR.body.s=beat(t,15.4,16.2);mates.forEach((m,i)=>{m.body.s=beat(t,15.8+i*.3,16.6+i*.3);});
   // Lift the rain cloud: his teammates are there around him.
   const lift=manual?beat(act,0,.6):beat(t,18.4,19.6);pop(cloud,beat(t,13,14)*(1-beat(lift,.7,1)));cloud.dy=1.0*lift;
   watch.s=Math.max(beat(t,22.8,23.6),manual?beat(act,.5,.8):0);
   const hug=Math.max(beat(t,25.2,26.2),manual?beat(act,.6,1):0);mates.forEach((m,i)=>{m.body.x=[1.4,3.6,2.0][i]+(i===0?.35:i===1?-.35:0)*hug;m.armL.rot=-.12-1.2*hug;m.armR.rot=.12+1.2*hug;});
   hero.s=Math.max(beat(t,25.6,26.4),manual?beat(act,.7,1):0);RR.body.lean=-.06*hug;
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18,19):0;
  };
 }};

/* ───────────── 6 · Playing on, and giving back (giving) ───────────── */
const giving:SpreadDef={id:'giving',rest:23.1,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'BRESCIA · 2000 TO 2004','CAPTAIN · 205 GOALS IN SERIE A',INK.blue,INK.navy,.4);},
 right:k=>{paving(k,0,5);caption(k,2.5,'FIGHTING HUNGER','UN GOODWILL AMBASSADOR 2002 · MAN OF PEACE 2010',INK.green,INK.navy,.4);},
 build:B=>{
  const bd=backdrop(B,K+'g-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.blue,INK.white,INK.blue,'#6fb6e2'],2);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.8,'#c9d98e');for(let r=0;r<4;r++)for(let i=0;i<14;i++)k.key(`M${.15+i*.32} ${2.0+r*.12} l.04 -.12`,.012,INK.gold);k.fill(rect(0,2.45,4.5,.55),'#e3d6bb');});
  const bunt=bd.add(S.bunting(K+'g-bunt',3.8,.4,[INK.blue,INK.white,INK.gold]),'R',.4,1.0,{out:.02});
  const R=B.person(K+'g-r',-2.6,.4,1.32,{shirt:'navy',...RBP,adult:true,face:'grin',layer:3});
  const band=R.body.add(P.disc('g-band',.15,'C'),.19,R.h*.62,{z:.02,anchor:'center'});
  const wc98=B.stand(S.flipCard(K+'g-98',1.4,.32,'1998 WORLD CUP',INK.sky,INK.navy),-4.0,1.95,{layer:3,s:0,tab:false});
  const shirtP=B.stand(S.post(K+'g-sp',1.1,1.5,INK.white),-4.0,-1.3,{layer:1,s:0});shirtP.add(shirt10(K+'g-10',.9,.9,INK.blue),0,.4,{z:.012});
  const retired=B.stand(S.flipCard(K+'g-ret',1.7,.32,'NUMBER 10, RETIRED',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const goals=B.stand(P.lineCard('g-205',1.3,.62,['205','GOALS'],INK.yellow),-1.2,-1.4,{layer:1,s:0});
  const pL=B.stand(S.post(K+'g-pl',.1,1.9,INK.wood),1.0,-1.2,{layer:1,tab:false}),pR=B.stand(S.post(K+'g-pr',.1,1.9,INK.wood),4.0,-1.2,{layer:1,tab:false});void pL;void pR;
  const ban=B.stand(S.banner(K+'g-ban',2.9,.6,'TOGETHER AGAINST HUNGER',INK.blue,INK.white),2.5,-1.15,{layer:1,tab:false});
  const wh=B.stand(wheat(K+'g-wheat',.6),2.5,-.3,{layer:2,s:0});
  const RR=B.person(K+'g-rr',1.6,.6,1.32,{shirt:'casual',...RBP,adult:true,face:'grin',layer:3});
  const kids=[[2.8,.9,'curly'],[3.6,.5,'bun'],[4.4,.9,'short']].map(([x,z,h],i)=>B.person(K+`g-k${i}`,x as number,z as number,1.0,{shirt:(['bib','fan','casual'] as const)[i],hair:h as 'curly',skin:SKINS[(i*2+1)%5],face:'grin',layer:3}));
  const peace=B.stand(P.lineCard('g-peace',1.4,.58,['MAN OF PEACE','2010'],INK.sky),4.2,-.2,{layer:2,s:0});
  const kind=B.stand(S.flipCard(K+'g-kind',1.8,.32,'KIND, AS WELL AS BRILLIANT',INK.pink),2.6,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.1):b.t;
   R.body.s=beat(t,2.4,3.2);wc98.s=beat(t,5,5.8);pop(band,beat(t,9,9.8));shirtP.s=beat(t,12.6,13.4);retired.s=beat(t,13.6,14.4);goals.s=beat(t,16.8,17.6);
   cheer(R,beat(t,20.6,21.2)*.8);
   // Raise the banner between its two posts.
   const raise=manual?beat(act,0,.6):beat(t,23.6,25);ban.dy=-1.2+1.5*raise;pop(ban,Math.min(1,.2+raise*2));
   RR.body.s=Math.max(beat(t,25.4,26.2),manual?beat(act,.4,.8):0);wh.s=Math.max(beat(t,27.4,28.2),manual?beat(act,.5,.9):0);
   kids.forEach((q,i)=>{q.body.s=Math.max(beat(t,28+i*.4,28.8+i*.4),manual?beat(act,.6,1):0);});
   peace.s=Math.max(beat(t,33.2,34),manual?beat(act,.8,1):0);pop(bunt,Math.max(beat(t,33.6,34.6),manual?beat(act,.85,1):0));
   kind.s=Math.max(beat(t,38.4,39.2),manual?beat(act,.9,1):0);const c=Math.max(beat(t,38.6,39.2),manual?beat(act,.95,1):0);cheer(RR,c);kids.forEach((q,i)=>cheer(q,Math.max(beat(t,38.8+i*.2,39.4+i*.2),manual?beat(act,.95,1):0)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,23,24):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={knee,recovery,best,worldcup:usa,penalty,giving};
