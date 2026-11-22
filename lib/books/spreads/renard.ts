/**
 * The six Wendie Renard pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/renard/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The thread is "not chosen, then a captain": an island pitch, a gentle family photo frame, a rain cloud over the trial,
 * a suitcase to Lyon, eight cups, and a lamp switched on for looking after your mind. Kits are colour only.
 * Her father's death is told gently: no illness detail and no figure of him; the frame shows her family's love.
 */
import {INK,rect,ell} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,beat,pulse} from '../popupEngine';
import {Z,SKINS,track,cheer,pop,chalk,pitch,pitchLines,paving,floor,caption,daySky,crowd,nightSky,lightRig,hills,skyline,sea,palms,backdrop,plates,wash} from '../spreadKit';

const K='renard-';
const P=plates(K),{sp}=P;
const WR={skin:SKINS[4],hair:'bun' as const,hairColor:'#1d1512'};
const FRA=[INK.navy,INK.white,INK.red,INK.blue];

/* ───────────── Renard-only plates ───────────── */
const stamp=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.03,c);k.text(label,w/2,h*.7,h*.46,c,{weight:900,max:w*.86});},{rim:.012});
const suitIn=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#8a3b34');k.key(b,.014);const l=rect(w*.06,h*.08,w*.88,h*.84);k.fill(l,'#f3d9c4');k.dots(l,INK.pink,.035,.2);k.key(l,.01);
 const ph=rect(w*.12,h*.18,w*.36,h*.56);k.fill(ph,INK.white);k.key(ph,.01);k.fill(rect(w*.15,h*.22,w*.3,h*.4),INK.sky2);for(let i=0;i<3;i++){k.fill(ell(w*(.2+i*.1),h*.42,w*.035,w*.035),SKINS[4]);k.fill(rect(w*(.18+i*.1),h*.47,w*.045,h*.14),[INK.pink,INK.yellow,INK.orange][i]);}
 k.fill(`M${w*.72} ${h*.38} C${w*.62} ${h*.24} ${w*.54} ${h*.42} ${w*.72} ${h*.6} C${w*.9} ${h*.42} ${w*.82} ${h*.24} ${w*.72} ${h*.38} Z`,INK.red);k.key(`M${w*.72} ${h*.38} C${w*.62} ${h*.24} ${w*.54} ${h*.42} ${w*.72} ${h*.6} C${w*.9} ${h*.42} ${w*.82} ${h*.24} ${w*.72} ${h*.38} Z`,.01);});
const familyPhoto=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{const g=rect(w*.1,h*.1,w*.8,h*.8);k.fill(g,'#ffe6b0');k.dots(g,INK.orange,.04,.2);
 for(let i=0;i<4;i++){const x=w*(.24+i*.17),y=h*(.46+(i%2)*.04);k.fill(ell(x,y,w*.05,w*.05),SKINS[(i*2)%5]);k.key(ell(x,y,w*.05,w*.05),.008);k.fill(rect(x-w*.06,y+w*.05,w*.12,h*.3),[INK.pink,INK.yellow,INK.teal,INK.orange][i]);k.key(rect(x-w*.06,y+w*.05,w*.12,h*.3),.008);}
 k.text('FAMILY',w/2,h*.28,h*.12,INK.red,{weight:900});},INK.white);
const frameCover=(key:string,w:number,h:number)=>P.frame(key,w,h,k=>{const g=rect(w*.1,h*.1,w*.8,h*.8);k.fill(g,INK.sky);k.dots(g,INK.blue,.04,.25);k.circle(w*.5,h*.5,h*.16,INK.yellow);k.key(ell(w*.5,h*.5,h*.16,h*.16),.01);},'#e9d3a8');
const glow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{for(let i=4;i>0;i--)k.fill(ell(r,r,r*i/4,r*i/4),INK.yellow,.18);});
const ruler=(key:string,h:number)=>sp(key,.26,h,k=>{const b=rect(0,0,.26,h);k.fill(b,INK.yellow);k.key(b,.012);for(let i=0;i<10;i++)k.key(`M0 ${h*i/10} L${i%2?.08:.14} ${h*i/10}`,.01);k.text('1.87 M',.13,h*.06+.02,.07,INK.navy,{weight:900,rotate:0});});

/* ───────────── 1 · An island girl (island) ───────────── */
const island:SpreadDef={id:'island',rest:19.6,
 left:k=>{const s=rect(-5,0,5,6.4);k.fill(s,INK.sand);k.dots(s,'#c9a96a',.06,.2);k.fill(rect(-5,Z(-2.4),5,1.2),INK.grass,.7);caption(k,-2.5,'MARTINIQUE · 1990','A FRENCH ISLAND IN THE CARIBBEAN SEA',INK.teal);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'A LONG WAY TO GO','MAINLAND FRANCE IS ACROSS THE OCEAN',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'i-bd',k=>{daySky(k,4.5,3);hills(k,4.5,3,1.4,INK.green);sea(k,4.5,1.9,.5);palms(k,4.5,2.5,5);k.fill(rect(0,2.4,4.5,.6),INK.sand);},
   k=>{daySky(k,4.5,3);sea(k,4.5,1.5,.9);k.fill(rect(0,2.4,4.5,.6),INK.grass);});
  const sun=bd.add(S.sun(K+'i-sun',.32),'L',3.7,2.0,{out:.012}),plane=bd.add(S.plane(K+'i-plane',.7,.35),'R',.4,2.3,{out:.03});
  const born=B.stand(S.flipCard(K+'i-born',1.3,.3,'BORN IN SCHŒLCHER',INK.yellow,INK.navy),-3.9,1.95,{layer:3,s:0,tab:false});
  const club=B.stand(S.sign(K+'i-club',1.5,1.2,'L’ESSOR PRÉCHOTIN',INK.teal),-3.8,-1.4,{layer:1,s:0});
  B.stand(S.tree(K+'i-palm',.9,1.7,'palm'),-1.0,-1.6,{layer:1});
  const W=B.person(K+'i-w',-2.4,.6,.98,{shirt:'bib',...WR,legs:'kick',face:'grin',layer:3});
  const kids=[[-3.4,-.2,'curly',SKINS[3]],[-1.5,.1,'short',SKINS[1]]].map(([x,z,h,sk],i)=>B.person(K+`i-k${i}`,x as number,z as number,1.0,{shirt:i?'fan':'casual',hair:h as 'curly',hairColor:'#1d1512',skin:sk as string,face:'grin',layer:2}));
  const seven=B.stand(S.flipCard(K+'i-seven',1.1,.3,'AGED SEVEN',INK.pink),-1.6,1.95,{layer:3,s:0,tab:false});
  B.stand(S.goal(K+'i-goal',1.7,.9),2.6,-1.5,{layer:1});
  const keeper=B.person(K+'i-keep',2.6,-1.2,1.0,{shirt:'keeper',hair:'curly',skin:SKINS[3],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  B.slot(1.0,.8,2.5,-1.3);
  const WR2=B.person(K+'i-wr',.8,.8,1.0,{shirt:'bib',...WR,legs:'kick',face:'grin',layer:3});
  const fr=B.stand(S.sign(K+'i-fr',1.3,1.1,'MAINLAND FRANCE',INK.white),4.3,-1.5,{layer:1,s:0});
  const far=B.stand(S.flipCard(K+'i-far',1.6,.3,'A VERY LONG JOURNEY',INK.sky,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'i-ball',.1),1.1,.85,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   sun.dy=.3*beat(t,0,2);W.body.s=beat(t,2,2.8)*(1-beat(t,18.6,19.2));born.s=beat(t,3.4,4.2);club.s=beat(t,10,10.8);seven.s=beat(t,11,11.8);kids.forEach((p,i)=>{p.body.s=beat(t,12+i*.4,12.8+i*.4);cheer(p,pulse(t,16+i,17.6+i)*.6);});
   W.leg!.rot=-.7*Math.abs(Math.sin(t*4))*(t>12.4&&t<18?1:0);
   WR2.body.s=Math.max(beat(t,18.8,19.4),manual?1:0);keeper.body.s=beat(t,18.6,19.2);
   // Kick the ball into the beach goal.
   const kick=manual?beat(act,0,.7):beat(t,20.8,22);WR2.leg!.rot=-1.2*(manual?pulse(act,0,.3):pulse(t,20.5,21.1));
   const [bx,bz,by]=kick>0?track(kick,[[0,1.1,.85,0],[.5,1.9,-.3,.45],[1,2.6,-1.4,.15]]):[1.1,.85,0];ball.x=bx;ball.z=bz;ball.dy=by;ball.rot=-bx*6;ball.visible=t>18.8||manual;
   keeper.body.rot=.5*(manual?pulse(act,.3,.9):pulse(t,21.2,22.4));cheer(WR2,Math.max(beat(t,22.2,22.8)*(1-beat(t,28,28.6)),manual?beat(act,.9,1):0));
   fr.s=beat(t,23,23.8);plane.dx=3.0*beat(t,29.6,33);pop(plane,beat(t,29.4,29.8)*(1-beat(t,33,33.4)));far.s=beat(t,30,30.8);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,18.2,19.2):0;
  };
 }};

/* ───────────── 2 · Losing her father (father) ───────────── */
const father:SpreadDef={id:'father',rest:13.0,
 left:k=>{floor(k,-5,0,'#d9b98c','#a98455');caption(k,-2.5,'WHEN WENDIE WAS EIGHT','HER FATHER DIED OF AN ILLNESS',INK.navy);},
 right:k=>{pitch(k,0,5,'#9dbd78',INK.green,.8);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);caption(k,2.5,'KEEP PLAYING','HER FAMILY CHEERED HER ON',INK.pink);},
 build:B=>{
  const bd=backdrop(B,K+'f-bd',k=>{wash(k,4.5,3,'#e9d6c4',INK.pink,y=>.25);const w=rect(1.6,.5,1.3,1.0);k.fill(w,'#b9c9e6');k.key(w,.014);k.key('M2.25 .5 L2.25 1.5 M1.6 1 L2.9 1',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#d9b98c');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.6,INK.green);palms(k,4.5,2.3,5);k.fill(rect(0,2.3,4.5,.7),'#9dbd78');});
  const sun=bd.add(S.sun(K+'f-sun',.3),'R',3.6,2.1,{out:.012});
  B.stand(S.lamp(K+'f-lamp',.5,1.3),-4.4,-1.6,{layer:1});
  const W=B.person(K+'f-w',-2.8,.6,.96,{shirt:'casual',...WR,face:'sad',layer:3});
  const mum=B.person(K+'f-mum',-2.0,.1,1.62,{shirt:'coach',hair:'bun',hairColor:'#1d1512',skin:SKINS[4],adult:true,face:'shy',layer:2});
  const heart=B.stand(S.bubble(K+'f-heart',.5,.44,'heart'),-1.2,1.2,{layer:3,s:0,tab:false});
  const sad=B.stand(S.flipCard(K+'f-sad',1.4,.3,'A VERY SAD TIME',INK.sky,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const hard=B.stand(S.flipCard(K+'f-hard',1.6,.3,'ONE OF THE HARDEST THINGS',INK.sky,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const stand=B.stand(S.post(K+'f-stand',1.5,1.3,'#d9cfb8'),1.6,-1.2,{layer:1});
  stand.add(familyPhoto(K+'f-photo',1.36,1.1),0,.12,{z:.012});const cover=stand.flap(frameCover(K+'f-cover',1.42,1.16),0,1.28,{z:.04});
  const women=[[2.8,-.2,'bun',SKINS[4]],[3.7,.4,'long',SKINS[3]],[4.5,-.4,'curly',SKINS[4]]].map(([x,z,h,sk],i)=>B.person(K+`f-f${i}`,x as number,z as number,1.58,{shirt:i===1?'coach':'casual',hair:h as 'bun',hairColor:'#1d1512',skin:sk as string,adult:true,face:'smile',layer:2}));
  const WR2=B.person(K+'f-wr',1.4,.9,1.0,{shirt:'bib',...WR,legs:'kick',face:'smile',layer:3});
  const keep=B.stand(S.flipCard(K+'f-keep',1.5,.3,'FOOTBALL HELPED',INK.yellow,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'f-ball',.1),1.75,.95,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13):b.t;
   W.body.s=beat(t,2,2.8);sad.s=beat(t,5.8,6.6);mum.body.s=beat(t,6,6.8);mum.armR.rot=.12+.9*beat(t,7,8);pop(heart,beat(t,9,9.8));hard.s=beat(t,9.6,10.4);
   // Lift the photo frame: underneath, her family.
   const lift=manual?beat(act,0,.6):beat(t,14.4,15.6);cover.flip=-2.8*lift;
   women.forEach((p,i)=>{p.body.s=Math.max(beat(t,16.4+i*.5,17.2+i*.5),manual?beat(act,.4,.8):0);cheer(p,Math.max(beat(t,19+i*.4,19.6+i*.4),manual?beat(act,.8,1):0)*.8);});
   WR2.body.s=Math.max(beat(t,22.8,23.6),manual?beat(act,.6,1):0);const drib=t>23.6&&t<29;WR2.leg!.rot=-.7*Math.abs(Math.sin(t*3.6))*(drib?1:0);WR2.body.x=1.4+1.0*beat(t,23.6,28);ball.x=WR2.body.x+.35;ball.visible=WR2.body.s>.5;
   keep.s=beat(t,24,24.8);cheer(WR2,beat(t,29,29.6));sun.dy=.3*beat(t,15,17);
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,13.4,14.4):0;
  };
 }};

/* ───────────── 3 · Not chosen (notchosen) ───────────── */
const notchosen:SpreadDef={id:'notchosen',rest:16.8,
 left:k=>{paving(k,-5,0);caption(k,-2.5,'CLAIREFONTAINE · FRANCE','A TRIAL AT THE NATIONAL TRAINING CENTRE',INK.blue,INK.navy,.4);},
 right:k=>{const s=rect(0,0,5,6.4);k.fill(s,INK.sand);k.dots(s,'#c9a96a',.06,.2);caption(k,2.5,'NOT THE END','SHE WENT HOME AND KEPT TRAINING',INK.teal);},
 build:B=>{
  const bd=backdrop(B,K+'n-bd',k=>{daySky(k,4.5,3);sea(k,4.5,1.2,.6);hills(k,4.5,3,2.0,'#7fa37a');k.fill(rect(0,2.3,4.5,.7),'#e3d6bb');},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,INK.green);sea(k,4.5,1.9,.5);palms(k,4.5,2.5,4);k.fill(rect(0,2.4,4.5,.6),INK.sand);});
  const plane=bd.add(S.plane(K+'n-plane',.7,.35),'L',.3,2.6,{out:.03});
  const gate=B.stand(P.gatePosts('n-gate',1.6,1.2),-2.6,-1.2,{layer:1});gate.add(P.lineCard('n-name',1.5,.26,['CLAIREFONTAINE'],INK.white),0,1.15,{z:.03});
  const gL=gate.flap(P.gateLeaf('n-gl',.68,.9),-.68,.02,{anchor:'bl',axis:'y',z:.02}),gR=gate.flap(P.gateLeaf('n-gr',.68,.9),.68,.02,{anchor:'br',axis:'y',z:.02});
  const W=B.person(K+'n-w',-3.6,.6,1.2,{shirt:'casual',...WR,face:'smile',layer:3,holdR:'suitcase'});
  const coach=B.person(K+'n-coach',-1.4,-.4,1.6,{shirt:'navy',hair:'short',skin:SKINS[0],adult:true,face:'open',layer:2});
  const no=B.stand(stamp(K+'n-no',1.3,.4,'NOT CHOSEN',INK.red),-2.0,1.1,{layer:3,s:0,tab:false});
  const km=B.stand(S.flipCard(K+'n-km',1.8,.3,'THOUSANDS OF KILOMETRES',INK.sky,INK.navy),-3.4,1.95,{layer:3,s:0,tab:false});
  const post=B.stand(S.post(K+'n-post',1.7,1.3,INK.white),1.4,-1.3,{layer:1});
  post.add(P.lineCard('n-end',1.5,.9,['NOT THE END','OF HER DREAM'],INK.yellow),0,.15,{z:.012});const cloud=post.flap(P.rainCloud('n-cloud',1.6,1.1),0,1.22,{z:.03});
  const WR2=B.person(K+'n-wr',2.4,.7,1.2,{shirt:'bib',...WR,legs:'kick',face:'smile',layer:3});
  for(const [x,z] of [[3.2,.3],[3.8,.7],[4.4,.3]])B.stand(S.cone(K+'n-cone',.28),x,z,{layer:2});
  const keepC=B.stand(S.flipCard(K+'n-keep',1.4,.3,'KEEP TRAINING',INK.yellow,INK.navy),1.4,1.95,{layer:3,s:0,tab:false});
  const wait=B.stand(S.flipCard(K+'n-wait',1.6,.3,'WAIT FOR THE NEXT CHANCE',INK.pink),3.6,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'n-ball',.1),2.75,.8,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.8):b.t;
   plane.dx=3.4*beat(t,2,6);pop(plane,beat(t,1.8,2.2)*(1-beat(t,6,6.4)));W.body.s=beat(t,5.6,6.4);W.body.x=-3.6+1.0*beat(t,6.4,9);
   const op=beat(t,7,8)*(1-beat(t,10,11));gL.flip=-1.2*op;gR.flip=1.2*op;coach.body.s=beat(t,7.6,8.4);coach.armR.rot=.12+.6*pulse(t,9.6,11.6);
   pop(no,beat(t,10.2,10.8));W.body.rot=-.06*beat(t,10.4,11);km.s=beat(t,13,13.8);
   // Lift the rain cloud: it is not the end.
   const lift=manual?beat(act,0,.5):beat(t,18,19.2);cloud.flip=-2.7*lift;
   WR2.body.s=Math.max(beat(t,24.8,25.6),manual?beat(act,.4,.8):0);keepC.s=Math.max(beat(t,25,25.8),manual?beat(act,.6,1):0);
   const drib=t>27.2&&t<32;WR2.leg!.rot=-.7*Math.abs(Math.sin(t*4))*(drib?1:0);WR2.body.x=2.4+1.8*beat(t,27.2,31.6);WR2.body.z=.7-.25*Math.sin(beat(t,27.2,31.6)*Math.PI*2);ball.x=WR2.body.x+.35;ball.z=WR2.body.z+.1;ball.visible=WR2.body.s>.5;
   wait.s=beat(t,29,29.8);cheer(WR2,Math.max(beat(t,32,32.6),manual?beat(act,.9,1):0));
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,17,18):0;
  };
 }};

/* ───────────── 4 · A long way from home (lyon) ───────────── */
const lyon:SpreadDef={id:'lyon',rest:17.6,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'ANOTHER TRIAL · LYON','THIS TIME IT WENT MUCH BETTER',INK.blue);},
 right:k=>{paving(k,0,5,'#e8dcc2','#b8a888');caption(k,2.5,'LYON · AGED SIXTEEN','A NEW HOME, FAR FROM HER FAMILY',INK.red);},
 build:B=>{
  const bd=backdrop(B,K+'y-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.6,2.45,[INK.white,INK.blue,INK.red],1);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{daySky(k,4.5,3);hills(k,4.5,3,1.5,'#8fae9e');skyline(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#e8dcc2');});
  const plane=bd.add(S.plane(K+'y-plane',.7,.35),'R',.3,2.4,{out:.03});
  const sign=B.stand(S.sign(K+'y-sign',1.3,1.1,'LYON',INK.blue),-4.0,-1.5,{layer:1,s:0});
  const coach=B.person(K+'y-coach',-1.4,-.4,1.62,{shirt:'navy',hair:'short',skin:SKINS[1],adult:true,face:'smile',layer:2});
  const W=B.person(K+'y-w',-2.6,.6,1.14,{shirt:'ger',...WR,legs:'kick',face:'grin',layer:3});
  const yes=B.stand(S.flipCard(K+'y-yes',1.3,.3,'WELCOME!',INK.yellow,INK.navy),-1.5,1.95,{layer:3,s:0,tab:false});
  const sixteen=B.stand(S.flipCard(K+'y-16',1.2,.3,'AGED SIXTEEN',INK.pink),-3.7,1.95,{layer:3,s:0,tab:false});
  B.stand(S.cityBlock(K+'y-city',1.6,1.6),4.1,-1.6,{layer:1});
  const case_=B.stand(S.post(K+'y-case',1.3,.9,'#d9cfb8'),2.0,-.3,{layer:2});
  case_.add(suitIn(K+'y-in',1.2,.78),0,.06,{z:.012});const lid=case_.flap(P.suitcase('y-lid',1.24,.82,'LYON',INK.red),0,.86,{z:.03});
  const WR2=B.person(K+'y-wr',.8,.8,1.16,{shirt:'ger',...WR,face:'smile',layer:3});
  const lonely=B.stand(S.flipCard(K+'y-lonely',1.6,.3,'LONELY SOMETIMES',INK.sky,INK.navy),2.2,1.95,{layer:3,s:0,tab:false});
  const rule=B.stand(ruler(K+'y-ruler',1.6),3.4,.6,{layer:3,s:0});
  const tall=B.person(K+'y-tall',4.1,.7,1.5,{shirt:'ger',...WR,face:'grin',layer:3});
  const ball=B.stand(S.ball(K+'y-ball',.1),-2.3,.65,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.6):b.t;
   sign.s=beat(t,2.2,3);W.body.s=beat(t,2.6,3.4);coach.body.s=beat(t,3,3.8);
   const drib=t>3.6&&t<7.4;W.leg!.rot=-.7*Math.abs(Math.sin(t*4))*(drib?1:0);ball.x=W.body.x+.3+.3*Math.sin(Math.max(0,t-3.6));ball.visible=t>2.8&&t<17;
   coach.armR.rot=.12+1.8*beat(t,5.6,6.4);yes.s=beat(t,6,6.8);sixteen.s=beat(t,8,8.8);cheer(W,beat(t,6.4,7));
   plane.dx=3.4*beat(t,10,14);pop(plane,beat(t,9.8,10.2)*(1-beat(t,14,14.4)));
   WR2.body.s=Math.max(beat(t,14.4,15.2),manual?1:0);
   // Open the suitcase: inside, a photo of her family and a heart.
   const open=manual?beat(act,0,.6):beat(t,18.8,20);lid.flip=-2.7*open;
   lonely.s=beat(t,21,21.8);
   const grow=Math.max(beat(t,25.4,27.4),manual?beat(act,.6,1):0);tall.body.s=grow;rule.s=grow;cheer(tall,beat(t,28,28.6));
   return b.narrated?-.4*beat(t,1.8,2.8)+.8*beat(t,14,15):0;
  };
 }};

/* ───────────── 5 · Eight times champions of Europe (europe) ───────────── */
const europe:SpreadDef={id:'europe',rest:18.2,
 left:k=>{pitchLines(k,-5,0,-2.5);caption(k,-2.5,'CHAMPIONS LEAGUE · EIGHT TIMES','WITH LYON · CAPTAIN OF FRANCE FROM 2013',INK.blue,INK.navy,.36);},
 right:k=>{pitchLines(k,0,5,2.6,'#3f7f5a',INK.navy);caption(k,2.5,'CHAMPIONS OF EUROPE','A NO AT THE START IS NOT THE END',INK.yellow,INK.white);},
 build:B=>{
  const bd=backdrop(B,K+'e-bd',k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[INK.white,INK.blue,INK.red],2);lightRig(k,.9,.3);lightRig(k,3.7,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);},
   k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.5,[INK.white,INK.blue,INK.red],5);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.5,4.5,.5),'#3f7f5a');});
  const conf=bd.add(S.confetti(K+'e-conf',3.6,1.4,4),'R',.4,1.1,{out:.04});
  const cups=[0,1,2,3,4,5,6,7].map(i=>B.stand(S.trophy(K+'e-mini',.32,.42),-4.5+(i%4)*.5,i<4?.95:1.45,{layer:3,s:0,tab:false}));
  const W=B.person(K+'e-w',-1.8,.2,1.4,{shirt:'navy',...WR,face:'grin',layer:2});
  const capt=B.stand(P.disc('e-c',.36,'C',INK.yellow,INK.navy),-1.1,.9,{layer:3,s:0,tab:false});
  const captC=B.stand(S.flipCard(K+'e-capt',1.6,.3,'CAPTAIN OF FRANCE',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const air=B.stand(S.flipCard(K+'e-air',1.6,.3,'STRONG IN THE AIR',INK.sky,INK.navy),-3.8,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'e-ball',.1),-1.8,-.4,{layer:2,tab:false});
  const pole=B.stand(S.post(K+'e-pole',.14,1.3,INK.stock),2.4,-.3,{layer:2,tab:false});const cup=pole.add(S.trophy(K+'e-cup',.6,.8),0,.3,{z:.03});
  const WR2=B.person(K+'e-wr',1.6,.5,1.4,{shirt:'ger',...WR,face:'grin',layer:3});
  const team=[[3.2,.9,'curly',SKINS[1]],[4.2,.2,'long',SKINS[0]]].map(([x,z,h,sk],i)=>B.person(K+`e-t${i}`,x as number,z as number,1.2,{shirt:'ger',hair:h as 'curly',skin:sk as string,face:'grin',layer:3}));
  const best=B.stand(S.flipCard(K+'e-best',1.6,.3,'ONE OF THE BEST',INK.gold,INK.navy),3.4,1.95,{layer:3,s:0,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.2):b.t;
   cups.forEach((q,i)=>pop(q,beat(t,3+i*.55,3.5+i*.55)));W.body.s=beat(t,2.6,3.4);pop(capt,beat(t,9.6,10.4));captC.s=beat(t,10,10.8);
   // A header: up she goes.
   const hd=pulse(t,13.6,15);W.body.dy=.35*hd;const [bx,bz,by]=t<13.2?[-1.8,-.4,1.8]:track(t,[[13.2,-3.6,-.4,1.2],[14.3,-1.8,-.4,1.75],[15.3,-.6,-1.6,.6]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.visible=t>13.2&&t<15.4;air.s=beat(t,14.4,15.2);
   // Raise the trophy.
   WR2.body.s=Math.max(beat(t,17.6,18.2),manual?1:0);team.forEach((p,i)=>{p.body.s=Math.max(beat(t,18+i*.3,18.6+i*.3),manual?1:0);});
   const raise=manual?beat(act,0,.6):beat(t,19.4,20.8);cup.dy=-.2+1.0*raise;pop(cup,Math.min(1,.2+raise*2));cheer(WR2,raise);
   pop(conf,Math.max(beat(t,21,22.2),manual?beat(act,.6,1):0));team.forEach((p,i)=>cheer(p,Math.max(beat(t,21.2+i*.3,21.8+i*.3),manual?beat(act,.7,1):0)));best.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.9,1):0);
   return b.narrated?-.4*beat(t,2.2,3.2)+.8*beat(t,17.4,18.4):0;
  };
 }};

/* ───────────── 6 · Looking after her mind (mind) ───────────── */
const mind:SpreadDef={id:'mind',rest:17.8,
 left:k=>{floor(k,-5,0,'#cdb894','#a08660');caption(k,-2.5,'FEBRUARY 2023','PROTECTING HER MENTAL HEALTH',INK.navy);},
 right:k=>{pitchLines(k,0,5,2.6);caption(k,2.5,'THE 2023 WORLD CUP','HER WINNING GOAL AGAINST BRAZIL',INK.blue);},
 build:B=>{
  const bd=backdrop(B,K+'m-bd',k=>{wash(k,4.5,3,'#6f7ea8',INK.navy,y=>.35);const w=rect(2.6,.5,1.3,1.0);k.fill(w,INK.night);k.key(w,.014);k.circle(3.0,.8,.12,INK.white);k.key('M3.25 .5 L3.25 1.5 M2.6 1 L3.9 1',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#a08660');},
   k=>{daySky(k,4.5,3);crowd(k,4.5,1.2,2.45,[...FRA,INK.yellow,INK.green],3);lightRig(k,.8,.3);lightRig(k,3.9,.3);k.fill(rect(0,2.45,4.5,.55),INK.grass);});
  const light=bd.add(glow(K+'m-glow',.6),'L',1.3,1.0,{out:.02});
  const lamp=B.stand(S.lamp(K+'m-lamp',.55,1.4),-1.2,-.9,{layer:2});
  const W=B.person(K+'m-w',-2.8,.4,1.36,{shirt:'casual',...WR,face:'shy',layer:3});
  const breath=W.body.add(S.bubble(K+'m-breath',.46,.4,'breath'),.45,1.45,{z:-.02});
  const feel=B.stand(S.flipCard(K+'m-feel',1.7,.3,'THOUGHTS AND FEELINGS',INK.sky,INK.navy),-3.6,1.95,{layer:3,s:0,tab:false});
  const brave=B.stand(S.flipCard(K+'m-brave',1.4,.3,'HARD AND BRAVE',INK.yellow,INK.navy),-1.4,1.95,{layer:3,s:0,tab:false});
  const coach=B.person(K+'m-coach',1.0,-.4,1.62,{shirt:'navy',hair:'short',skin:SKINS[0],adult:true,face:'smile',layer:2});
  B.stand(S.goal(K+'m-goal',1.8,.95),3.9,-1.6,{layer:1});
  const keeper=B.person(K+'m-keep',3.9,-1.3,1.26,{shirt:'keeper',hair:'bun',skin:SKINS[1],face:'open',layer:1,holdL:'glove',holdR:'glove'});
  const WR2=B.person(K+'m-wr',2.8,.2,1.4,{shirt:'navy',...WR,face:'grin',layer:2});
  const bra=B.person(K+'m-bra',3.4,.7,1.22,{shirt:'bib',hair:'long',hairColor:'#1d1512',skin:SKINS[3],face:'open',layer:3});
  const back=B.stand(S.flipCard(K+'m-back',1.5,.3,'BACK, AND SCORING',INK.yellow,INK.navy),1.6,1.95,{layer:3,s:0,tab:false});
  const strong=B.stand(S.flipCard(K+'m-strong',1.4,.3,'STRONGER',INK.pink),3.8,1.95,{layer:3,s:0,tab:false});
  const ball=B.stand(S.ball(K+'m-ball',.1),.4,1.0,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.8):b.t;
   W.body.s=beat(t,2.2,3);feel.s=beat(t,8,8.8);pop(breath,beat(t,9.4,10)*(1-beat(t,16,16.6)));brave.s=beat(t,13,13.8);
   // Switch the lamp on: the room fills with warm light.
   const on=manual?beat(act,0,.4):beat(t,19,19.8);pop(light,on);lamp.rot=.04*pulse(on,0,.5);W.body.rot=0;
   coach.body.s=Math.max(beat(t,20.8,21.6),manual?beat(act,.3,.6):0);coach.armR.rot=.12+1.6*Math.max(beat(t,22,22.8),manual?beat(act,.4,.6):0);
   WR2.body.s=Math.max(beat(t,24.6,25.4),manual?beat(act,.4,.7):0);keeper.body.s=beat(t,25,25.8);bra.body.s=beat(t,25.2,26);
   // Her header against Brazil.
   const hd=manual?beat(act,.6,1):beat(t,27,29);const [bx,bz,by]=track(hd,[[0,.4,1.0,0],[.5,2.7,.2,1.9],[.75,3.0,.2,1.6],[1,3.8,-1.4,.5]]);ball.x=bx;ball.z=bz;ball.dy=by;ball.visible=hd>0&&hd<1||t>29.2&&!manual;
   WR2.body.dy=.3*pulse(hd,.4,.9);keeper.body.rot=.6*pulse(hd,.7,1);cheer(WR2,Math.max(beat(t,29.4,30),manual?beat(act,.95,1):0));back.s=Math.max(beat(t,29.6,30.4),manual?beat(act,.95,1):0);strong.s=beat(t,31.6,32.4);
   cheer(W,beat(t,31.4,32)*.5);
   return b.narrated?-.4*beat(t,1.8,2.8)+.8*beat(t,20.2,21.2):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={island,father,notchosen,lyon,europe,mind};
