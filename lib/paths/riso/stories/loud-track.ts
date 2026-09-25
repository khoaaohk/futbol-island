/** The Loud Track — riso (replaces "The Pocket Radio": kids do not listen to the radio; the metaphor is HEADPHONES and a loud track on
 * repeat that you can SKIP). ONE WORLD, side view: a paper kid on a 7v7 pitch under the SOUND SKY — a whole-width ink field whose lower
 * edge is the track that is playing: a jagged orange sawtooth with pink spikes (the loud track) or a smooth yellow wave (the kinder track).
 * Big navy headphones on the kid; the inner voice is a waveform ARCH pouring out of one cup, over the head and back into the other (on
 * repeat — it scrolls). A paper music player with a SKIP button floats beside the kid like a thought; a paper thumb presses it.
 * Inks yellow → orange → pink → navy on cream. Roles: you = paper + navy; headphones/player = navy with paper faces; loud = orange;
 * harsh = pink; kind/teammate = yellow; ball = paper with navy pentagons. Scenes read only local t; drawn objects on twos, camera on ones;
 * every random value is seeded so the seams stay pixel-continuous. */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {aperture,apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,anticipate,settle,spring,clamp,lerp,rng,hash,noise1,blob,polyPath,ribbon,smoothPts,partial,rotPts,scalePts,circlePath,rectPath,torn,arc,TAU,type Pt,type Key} from '../motion';
import {handCut,confetti,speedLines,footballPanels,crescent,contour} from '../shapes';

const CH='/stories/narration/7v7/loud-track/';
const K='navy',P='pink',O='orange',Y='yellow';
const GY=230,HZ=-30;

// ---------------- abstract riso figure (bible §1c.4) — copied from place-picture, + hunch/lookup poses, + dry geometry mode ----------------
type Pose='stand'|'run'|'arms'|'up'|'slump'|'hunch'|'lookup'|'step'|'step2'|'listen'|'crouch'|'kick'|'beckon'|'point'|'pressed';
type PoseParams={tilt:number;head:Pt;legF:Pt;legB:Pt;armF:Pt;armB:Pt;hip:number};
const POSES:Record<Pose,PoseParams>={
 stand:{tilt:0,head:[0,0],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 run:{tilt:.35,head:[.02,0],legF:[.3,-.14],legB:[-.36,-.05],armF:[.28,-.06],armB:[-.3,.1],hip:0},
 arms:{tilt:.05,head:[0,0],legF:[.15,0],legB:[-.15,0],armF:[.42,-.12],armB:[-.42,-.12],hip:0},
 up:{tilt:-.04,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.28,-.36],armB:[-.28,-.36],hip:0},
 slump:{tilt:.4,head:[.05,.07],legF:[.06,0],legB:[-.08,0],armF:[.16,.34],armB:[-.02,.34],hip:.02},
 hunch:{tilt:.62,head:[.07,.11],legF:[.06,0],legB:[-.08,0],armF:[.12,.37],armB:[-.04,.37],hip:.04},
 lookup:{tilt:-.06,head:[.04,-.05],legF:[.1,0],legB:[-.1,0],armF:[.2,.27],armB:[-.2,.27],hip:0},
 step:{tilt:.26,head:[.01,0],legF:[.32,0],legB:[-.3,0],armF:[.36,.1],armB:[-.3,.14],hip:.06},
 step2:{tilt:.26,head:[.01,0],legF:[-.3,0],legB:[.32,0],armF:[-.3,.14],armB:[.36,.1],hip:.06},
 listen:{tilt:.15,head:[.06,.02],legF:[.12,0],legB:[-.1,0],armF:[.05,-.14],armB:[-.2,.27],hip:0},
 crouch:{tilt:.3,head:[.02,.01],legF:[.24,0],legB:[-.24,0],armF:[.3,.12],armB:[-.28,.16],hip:.12},
 kick:{tilt:-.12,head:[0,0],legF:[.34,-.08],legB:[-.12,0],armF:[.3,0],armB:[-.32,.05],hip:0},
 beckon:{tilt:-.03,head:[0,0],legF:[.12,0],legB:[-.12,0],armF:[.34,-.3],armB:[-.2,.27],hip:0},
 point:{tilt:.02,head:[.02,0],legF:[.14,0],legB:[-.1,0],armF:[.46,-.02],armB:[-.2,.27],hip:0},
 pressed:{tilt:.32,head:[.04,.06],legF:[.16,0],legB:[-.04,0],armF:[.1,.3],armB:[-.14,.3],hip:.05},
};
type FigOpts={ink?:string;line?:string;seed?:number;face?:1|-1;look?:number;k?:number;from?:Pose;cov?:number;reach?:Pt;reachB?:Pt;foot?:Pt;shade?:string;knock?:boolean;dry?:boolean;chest?:number};
type Fig={head:Pt;R:number;top:Pt;handF:Pt;handB:Pt;footF:Pt;chest:Pt};
/** A cut-paper player pictogram: head disc + hand-cut torso block + two leg strokes + two arm strokes; no anatomy, no face.
 * (x,y) = ground point, h = height, face = +1 looks right; poses blend from `from` by k. ink 'paper' (default) = paper body, navy limbs and
 * contour (you); an ink = that ink knocked out beneath (yellow teammates). dry = geometry only (for cameras and apertures). */
function figure(s:Sheet|null,x:number,y:number,h:number,pose:Pose,o:FigOpts={}):Fig|undefined{
 const{ink='paper',line=K,seed=1,face=1,look=0,k=1,from='stand',cov=.92,reach,reachB,foot,shade,knock=true,dry=false,chest=1}=o;if(h<8)return;
 const base=POSES[from],p=POSES[pose],L=(a:number,b:number)=>lerp(a,b,k),LP=(a:Pt,b:Pt):Pt=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
 const tilt=L(base.tilt,p.tilt),head=LP(base.head,p.head),legF=LP(base.legF,p.legF),legB=LP(base.legB,p.legB),armF=LP(base.armF,p.armF),armB=LP(base.armB,p.armB),hip=L(base.hip,p.hip);
 const R=h*.16,tw=h*.3*chest,th=h*.38,legL=h*.3,hipY=-legL+hip*h,ca=Math.cos(tilt),sa=Math.sin(tilt);
 const W=(lx:number,ly:number):Pt=>[x+lx*face,y+ly];
 const T=(lx:number,ly:number):Pt=>[lx*ca-ly*sa,hipY+lx*sa+ly*ca];
 const corners=[T(-tw/2,0),T(tw/2,0),T(tw/2,-th),T(-tw/2,-th)].map(q=>W(q[0],q[1]));
 const shF=T(tw*.42,-th+R*.25),shB=T(-tw*.42,-th+R*.25);
 const hc=T(0,-th-R*1.05),headC=W(hc[0]+head[0]*h+look*R*.42,hc[1]+head[1]*h);
 const hipF=W(tw*.18,hipY),hipB=W(-tw*.18,hipY);
 const fF=foot?foot:W(legF[0]*h,legF[1]*h),fB=W(legB[0]*h,legB[1]*h);
 const aF=reach?reach:W(shF[0]+armF[0]*h,shF[1]+armF[1]*h),aB=reachB?reachB:W(shB[0]+armB[0]*h,shB[1]+armB[1]*h);
 const ch=T(0,-th*.55),out:Fig={head:headC,R,top:W(hc[0],hc[1]-R*1.9),handF:aF,handB:aB,footF:fF,chest:W(ch[0],ch[1])};
 if(dry||!s)return out;
 const torsoPts=handCut(corners,seed,h*.03,h*.11),torso=polyPath(torsoPts,true),headPts=blob(headC[0],headC[1],R,R*.96,seed+2,{amp:.05,n:30}),headPath=polyPath(headPts,true);
 const limbs=new Path2D();
 limbs.addPath(ribbon([hipF,fF],h*.08,{seed:seed+3,pressure:.4,taper:.25,wobble:1.4}));limbs.addPath(ribbon([hipB,fB],h*.08,{seed:seed+4,pressure:.4,taper:.25,wobble:1.4}));
 limbs.addPath(ribbon([W(shB[0],shB[1]),aB],h*.062,{seed:seed+5,pressure:.4,taper:.35,wobble:1.4}));limbs.addPath(ribbon([W(shF[0],shF[1]),aF],h*.062,{seed:seed+6,pressure:.4,taper:.35,wobble:1.4}));
 const body=new Path2D();body.addPath(torso);body.addPath(headPath);
 const all=new Path2D();all.addPath(body);all.addPath(limbs);
 const outl=new Path2D();outl.addPath(ribbon(torsoPts,Math.max(4,h*.022),{seed:seed+7,close:true,pressure:.6,wobble:1.6,gaps:[[.62,.66]]}));outl.addPath(ribbon(headPts,Math.max(4,h*.022),{seed:seed+8,close:true,pressure:.6,wobble:1.4}));
 if(ink==='paper'){if(knock)s.knockout(body,.95);s.fill(line,limbs);s.fill(line,outl);}
 else{if(knock)s.knockout(all);s.fill(ink,all,cov);s.fill(line,outl,.9);}
 if(shade){const sh=new Path2D();sh.addPath(crescent(headC[0],headC[1],R*.98,[-.35*face,-.4]));sh.addPath(polyPath([corners[0],[lerp(corners[1][0],corners[0][0],.5),lerp(corners[1][1],corners[0][1],.5)],[lerp(corners[2][0],corners[3][0],.5),lerp(corners[2][1],corners[3][1],.5)],corners[3]],true));s.tone(shade,sh,.45);}
 return out;
}
const walkPose=(t:number,moving:boolean):Pose=>moving?(twosIndex(t)%2?'step2':'step'):'stand';

// ---------------- camera ----------------
/** viewport fit: the desktop art region shows ~793 × 625 world units at zoom 1; phones get a closer view (≤ ×1.32) of the same composition. */
const view=(s:Sheet)=>clamp((s.safe.w/s.fit)/800,1,1.32);
function cam(s:Sheet,t:number,K0:Key[],kick:Pt=[0,0]){const v=key(t,K0,easeIO,true);s.camera(v[0]+kick[0],v[1]+kick[1],(v[2]??1)*view(s),v[3]??0);return v;}
const shakeOf=(t:number,at:number[],amp=4)=>at.reduce((a,t0)=>a+settle(t,t0,{amp,freq:13,decay:9}),0);
const pop=(t:number,t0:number,d=.3)=>t<t0?0:easeOutBack(sm(t0,t0+d,t));

// ---------------- the waveforms ----------------
type WaveOpts={kind:'loud'|'kind';amp:number;phase:number;seed:number;width:number;segs?:number;n?:number;env?:(u:number)=>number;progress?:number;spikes?:number;cov?:number;knock?:boolean;spikeLen?:number;outline?:boolean};
/** the centreline offset of a wave at u: loud = a sawtooth with seeded peak heights scrolling by `phase` segments; kind = a smooth sine. */
function waveOffset(u:number,o:WaveOpts){const env=o.env?o.env(u):1;
 if(o.kind==='kind')return o.amp*env*Math.sin(u*(o.segs??6)*TAU-o.phase*TAU*.5);
 const segs=o.segs??12,f=(u*segs+o.phase),k=Math.floor(f),fr=f-k,v=(i:number)=>(i%2===0?1:-1)*(.35+.65*hash(i,o.seed));return o.amp*env*lerp(v(k),v(k+1),fr);}
/** the wave as a ribbon along base(u) offset along nrm(u); loud waves get pink spike triangles on their outward peaks. Returns the ribbon path. */
function wave(s:Sheet,base:(u:number)=>Pt,nrm:(u:number)=>Pt,o:WaveOpts){
 const{kind,width,progress=1,spikes=0,cov=1,knock=true,spikeLen=width*1.6,outline=kind==='loud'}=o,n=o.n??(kind==='kind'?40:(o.segs??12)*2);
 const pts:Pt[]=[];for(let i=0;i<=n;i++){const u=i/n,b=base(u),m=nrm(u),d=waveOffset(u,o);pts.push([b[0]+m[0]*d,b[1]+m[1]*d]);}
 const line=progress>=1?pts:partial(pts,progress);if(line.length<2)return;
 const rib=ribbon(line,width,{seed:o.seed+1,wobble:kind==='kind'?1:0,taper:.35,pressure:.15,step:kind==='kind'?8:14});
 const all=new Path2D();all.addPath(rib);let sp:Path2D|undefined;
 if(kind==='loud'&&spikes>0){sp=new Path2D();const segs=o.segs??12,f0=Math.floor(o.phase);
  for(let k=f0;k<=f0+segs;k++){if(k%2!==0||hash(k,o.seed+5)<.45)continue;const u=(k-o.phase)/segs;if(u<=.02||u>=progress-.02)continue;const b=base(u),m=nrm(u),d=waveOffset(u,o),env=o.env?o.env(u):1,L=spikeLen*spikes*(.7+.6*hash(k,o.seed+6))*env,px=b[0]+m[0]*d,py=b[1]+m[1]*d,tx=-m[1],ty=m[0],w=width*.7;
   sp.moveTo(px-tx*w-m[0]*width*.2,py-ty*w-m[1]*width*.2);sp.lineTo(px+tx*w-m[0]*width*.2,py+ty*w-m[1]*width*.2);sp.lineTo(px+m[0]*L,py+m[1]*L);sp.closePath();}
  all.addPath(sp);}
 // a navy under-ribbon prints the contour (stroking the ribbon polygon would show its corner bow-ties); the ink is knocked out and printed clean on top
 if(outline)s.fill(K,ribbon(line,width+Math.max(5,width*.28),{seed:o.seed+1,wobble:kind==='kind'?1:0,taper:.3,pressure:.15,step:kind==='kind'?8:14}),cov);
 if(knock||outline)s.knockout(all,.95);
 s.fill(kind==='loud'?O:Y,rib,cov);
 if(sp)s.fill(P,sp,cov);
 return rib;
}
/** the arch over the head: from the right cup, out and up, over the head, down into the left cup (a wide arch, not a halo). */
function archGeom(head:Pt,R:number){const C:Pt=[head[0],head[1]+R*.1];
 const base=(u:number):Pt=>{const a=.2-u*(Math.PI+.4),rx=R*1.02+R*2.6*Math.pow(Math.sin(u*Math.PI),.7),ry=R*2.9;return[C[0]+Math.cos(a)*rx,C[1]+Math.sin(a)*ry];};
 const nrm=(u:number):Pt=>{const a=.2-u*(Math.PI+.4);return[Math.cos(a),Math.sin(a)];};
 return{base,nrm,env:(u:number)=>Math.pow(Math.sin(u*Math.PI),.6)};}
function archWave(s:Sheet,head:Pt,R:number,o:Omit<WaveOpts,'env'|'segs'|'n'>&{segs?:number}){const g=archGeom(head,R);return wave(s,g.base,g.nrm,{outline:true,...o,env:g.env,segs:o.segs??(o.kind==='kind'?4:9)});}
/** a point on the kind arch's centreline (the seam aperture of chapter 3). */
function archPoint(head:Pt,R:number,u:number,o:WaveOpts):Pt{const g=archGeom(head,R),b=g.base(u),m=g.nrm(u),d=waveOffset(u,{...o,env:g.env});return[b[0]+m[0]*d,b[1]+m[1]*d];}

// ---------------- the world: sound sky + paper pitch ----------------
function edgePoly(f:(x:number)=>number,x0:number,x1:number,step:number,top=-3200){const p=new Path2D();p.moveTo(x0,top);for(let x=x0;x<=x1;x+=step)p.lineTo(x,f(x));p.lineTo(x1,top);p.closePath();return p;}
function edgeBand(f:(x:number)=>number,x0:number,x1:number,step:number,h:number){const p=new Path2D();p.moveTo(x0,f(x0)-h);for(let x=x0;x<=x1;x+=step)p.lineTo(x,f(x));for(let x=x1;x>=x0;x-=step)p.lineTo(x,f(x)-h-6*noise1(x/90,3));p.closePath();return p;}
type SkyOpts={level:number;loud:number;loudY?:number;amp?:number;phase:number;seed:number;spikes?:number;kindAmp?:number};
/** the sound sky: yellow grainy field with a solid rim band and a smooth scrolling edge; when loud>0 an orange field with a hand-cut
 * sawtooth edge (pink spikes on the peaks) descends over it. loudY overrides where the orange edge sits (default: on the yellow edge). */
function sky(s:Sheet,o:SkyOpts){
 const{level,loud,amp=44,phase,seed,spikes=0,kindAmp=30}=o;
 const kind=(x:number)=>level+kindAmp*Math.sin(x/250+phase*.7)+14*noise1(x/380+seed,seed);
 s.fill(Y,edgePoly(kind,-2400,2400,60),.6);s.fill(Y,edgeBand(kind,-2400,2400,60,70),.95);
 confetti(s,['paper'],[-1400,-1500,2800,1300+level],9,seed+3,{size:30});
 if(loud>0){const ly=o.loudY??lerp(-1500,level+34,loud),seg=110,f0=Math.floor(phase*2),fr=phase*2-f0;
  const jag=(x:number)=>{const f=(x+2400)/seg+fr,k=Math.floor(f),u=f-k,v=(i:number)=>((i+f0)%2===0?1:-1)*amp*(.3+.7*hash(i+f0,seed+11));return ly+lerp(v(k),v(k+1),u);};
  s.fill(O,edgePoly(jag,-2400,2400,seg/2),.75);s.fill(O,edgeBand(jag,-2400,2400,seg/2,54),1);
  if(spikes>0){const sp=new Path2D();for(let k=0;k<44;k++){if((k+f0)%2!==0||hash(k+f0,seed+12)<.5)continue;const x=-2400+(k-fr)*seg,y=jag(x),L=(70+50*hash(k+f0,seed+13))*spikes;sp.moveTo(x-34,y-12);sp.lineTo(x+34,y-12);sp.lineTo(x,y+L);sp.closePath();}s.fill(P,sp);}}
}
/** the pitch: navy .2 halftone with torn mown bands at .32, a darker torn horizon band, paper touchline + box line. */
function ground(s:Sheet,seed:number,o:{loosen?:number}={}){
 const{loosen=0}=o;
 s.tone(K,polyPath(torn(-2400,HZ,4800,3400,seed,12,90),true),.2);
 s.tone(K,polyPath(torn(-2400,HZ-18,4800,52,seed+7,8,80),true),.45);
 for(let k=0;k<4;k++)s.tone(K,polyPath(torn(-2400,HZ+120+k*(230+loosen*30),4800,110,seed+k+1,8,90),true),.32);
 const p=new Path2D();p.addPath(ribbon([[-2200,HZ+48],[2200,HZ+52]],9,{seed:seed+9,wobble:1.5,taper:0,pressure:.2,step:90}));p.addPath(ribbon([[-2200,GY+96+loosen*20],[2200,GY+92+loosen*20]],7,{seed:seed+10,wobble:1.5,taper:0,pressure:.2,step:90}));
 s.knockout(p,.9);
}

// ---------------- headphones, player, thumb, bubble, frames, magnifier, tag, tick, ball ----------------
type Phones={L:Pt;Rc:Pt;r:number;inner:number};
const phonesGeom=(head:Pt,R:number,lift=0):Phones=>({L:[head[0]-R*1.04,head[1]-lift+R*.14],Rc:[head[0]+R*1.04,head[1]-lift+R*.14],r:R*.52,inner:R*.3});
/** big navy headphones on a head disc: band over the top, two cups with paper faces; glow prints an ink tone in the faces. */
function headphones(s:Sheet,head:Pt,R:number,o:{lift?:number;glow?:number;glowInk?:string;seed?:number;glowCup?:'both'|'right'}={}):Phones{
 const{lift=0,glow=0,glowInk=O,seed=1,glowCup='both'}=o,g=phonesGeom(head,R,lift),cy=head[1]-lift+R*.1;
 const band:Pt[]=[];for(let i=0;i<=10;i++){const a=Math.PI+.3+(Math.PI-.6)*i/10;band.push([head[0]+Math.cos(a)*R*1.2,cy+Math.sin(a)*R*1.22]);}
 s.fill(K,ribbon(band,R*.3,{seed,wobble:1.2,taper:.1,pressure:.2,step:10}));
 const cups=new Path2D();cups.addPath(polyPath(blob(g.L[0],g.L[1],g.r,g.r*1.08,seed+1,{amp:.05,n:24}),true));cups.addPath(polyPath(blob(g.Rc[0],g.Rc[1],g.r,g.r*1.08,seed+2,{amp:.05,n:24}),true));s.fill(K,cups);
 const faces=new Path2D();faces.addPath(polyPath(blob(g.L[0],g.L[1],g.inner,g.inner,seed+3,{amp:.06,n:18}),true));faces.addPath(polyPath(blob(g.Rc[0],g.Rc[1],g.inner,g.inner,seed+4,{amp:.06,n:18}),true));s.knockout(faces,.95);
 if(glow>0){const gp=glowCup==='both'?faces:polyPath(blob(g.Rc[0],g.Rc[1],g.inner,g.inner,seed+4,{amp:.06,n:18}),true);s.tone(glowInk,gp,.6*glow);}
 return g;
}
/** the music player: navy hand-cut body over a pink misregistered shadow, paper screen with the playing wave, a paper SKIP button (|▶▶) and a small plain button. */
function player(s:Sheet,x:number,y:number,w:number,h:number,o:{loud:number;phase:number;press?:number;click?:number;seed:number;flash?:number;scale?:number}){
 const{loud,phase,press=0,click=0,seed,flash=0,scale=1}=o;if(scale<=.02)return;
 s.save();s.translate(x,y);s.scale(scale);
 const body=(dx:number,dy:number)=>polyPath(handCut([[-w/2+dx,-h/2+dy],[w/2+dx,-h/2+dy],[w/2+dx,h/2+dy],[-w/2+dx,h/2+dy]],seed,8,70),true);
 s.fill(P,body(14,12),.85);s.fill(K,body(0,0));
 const sx=-w*.4,sy=-h*.44,sw=w*.8,sh=h*.4,screen=polyPath(handCut([[sx,sy],[sx+sw,sy],[sx+sw,sy+sh],[sx,sy+sh]],seed+1,3,40),true);s.knockout(screen,.95);
 s.save();s.clip(screen);
 if(flash>0)s.fill(Y,screen,.45*flash);
 wave(s,u=>[sx-20+u*(sw+40),sy+sh*.5],()=>[0,-1],{kind:loud>.5?'loud':'kind',amp:loud>.5?sh*.3:sh*.26,phase:loud>.5?phase*3:phase*.8,seed:seed+2,width:sh*.16,segs:loud>.5?12:4,spikes:loud>.5?.5:0,knock:false});
 s.restore();
 const bx=w*.24,by=h*.24,br=h*.2,bsx=1+.18*press,bsy=1-.34*press;
 const btn=polyPath(scalePts(blob(bx,by+br*.3*press,br,br,seed+3,{amp:.04,n:24}),bsx,bsy,bx,by+br*.3*press),true);
 const small=polyPath(blob(-w*.27,by,h*.11,h*.11,seed+4,{amp:.05,n:18}),true);
 const btns=new Path2D();btns.addPath(btn);btns.addPath(small);s.knockout(btns,.95);
 const marks=new Path2D(),m=br*.5;marks.addPath(polyPath([[bx-m*.95,by-m*.7],[bx-m*.7,by-m*.7],[bx-m*.7,by+m*.7],[bx-m*.95,by+m*.7]],true));
 marks.addPath(polyPath([[bx-m*.55,by-m*.75],[bx+m*.15,by],[bx-m*.55,by+m*.75]],true));marks.addPath(polyPath([[bx+m*.2,by-m*.75],[bx+m*.9,by],[bx+m*.2,by+m*.75]],true));
 s.save();s.translate(bx,by+br*.3*press);s.scale(bsx,bsy);s.translate(-bx,-by);s.fill(K,marks);s.restore();
 if(click>0){const cl=new Path2D(),r=rng(seed+5);for(let i=0;i<5;i++){const a=-Math.PI*.9+i*.42+(r()-.5)*.2,r0=br*1.15,r1=br*(1.5+.5*click);cl.addPath(ribbon([[bx+Math.cos(a)*r0,by+Math.sin(a)*r0],[bx+Math.cos(a)*r1,by+Math.sin(a)*r1]],h*.05,{seed:seed+6+i,taper:.7,wobble:.6}));}s.knockout(cl,.9);s.fill(K,cl,Math.max(.3,1-click*.7));}
 s.restore();
 return{btn:[x+bx*scale,y+by*scale] as Pt,btnR:br*scale};
}
/** a paper thumb with a navy contour: the tip at (x,y), a fist below-right (drawn first so the thumb sits in front). */
function thumb(s:Sheet,x:number,y:number,size:number,seed:number){
 const hand=rotPts(blob(0,0,size*.62,size*.5,seed+4,{amp:.08,n:26}),-.3).map(p=>[p[0]+x+size*.58,p[1]+y+size*1.02] as Pt);
 s.knockout(polyPath(hand,true),.95);contour(s,K,hand,Math.max(4,size*.05),{close:true,seed:seed+5,pressure:.5,wobble:1.4});
 s.knockout(ribbon([[x+size*.2,y+size*.7],[x+size*.75,y+size*.72]],size*.05,{seed:seed+6,taper:.2,wobble:1}),.9);
 const pts=rotPts(blob(0,size*.5,size*.26,size*.58,seed,{amp:.06,n:26}),.5).map(p=>[p[0]+x,p[1]+y] as Pt);
 s.knockout(polyPath(pts,true),.95);contour(s,K,pts,Math.max(4,size*.05),{close:true,seed:seed+1,pressure:.5,wobble:1.4});
 s.tone(K,polyPath(blob(x-size*.02,y+size*.13,size*.12,size*.09,seed+2,{amp:.08,n:16}),true),.3);
}
function heartPts(cx:number,cy:number,r:number):Pt[]{const p:Pt[]=[];for(let i=0;i<28;i++){const t=i/28*TAU,x=16*Math.pow(Math.sin(t),3),y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));p.push([cx+x*r/17,cy+y*r/17]);}return p;}
/** a paper speech bubble with a navy contour, a tail toward `tail`, a yellow heart inside (grows with g). */
function bubble(s:Sheet,x:number,y:number,w:number,h:number,tail:Pt,g:number,seed:number,o:{heart?:number;scale?:number}={}){
 const{heart=0,scale=1}=o,k=g*scale;if(k<=.03)return;
 const pts=blob(x,y,w*.5*k,h*.5*k,seed,{amp:.05,n:30}),path=new Path2D();path.addPath(polyPath(pts,true));
 const tp=polyPath([[x-w*.1*k,y+h*.3*k],[x+w*.12*k,y+h*.3*k],[lerp(x,tail[0],k),lerp(y+h*.3*k,tail[1],k)]],true);path.addPath(tp);
 s.knockout(path,.95);contour(s,K,pts,Math.max(4,10*k),{close:true,seed:seed+1,pressure:.5,wobble:1.4});s.fill(K,ribbon([[x-w*.1*k,y+h*.3*k],[lerp(x,tail[0],k),lerp(y+h*.3*k,tail[1],k)],[x+w*.12*k,y+h*.3*k]],Math.max(3,8*k),{seed:seed+2,taper:.2,wobble:1}));
 if(heart>0)s.fill(Y,polyPath(heartPts(x,y+h*.03*k,h*.34*k*heart),true));
}
/** a moment frame of the day strip: paper rectangle with a navy hand-cut border; content drawn inside by `inner` (clipped). */
function frame(s:Sheet,x:number,y:number,w:number,h:number,seed:number,g:number,inner:(s:Sheet)=>void,o:{ring?:number;border?:number;cs?:number}={}){
 if(g<=.03)return;const{ring=0,border=9,cs=1}=o;
 s.save();s.translate(x,y);s.scale(g);
 const pts=handCut([[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]],seed,4,50),path=polyPath(pts,true);
 s.knockout(path,.95);s.save();s.clip(path);s.scale(cs);inner(s);s.restore();
 s.fill(K,ribbon(pts,border,{close:true,seed:seed+1,wobble:1.2,taper:0,pressure:.3,step:30}));
 if(ring>0){const rp=blob(0,0,w*.62,h*.72,seed+2,{amp:.04,n:36}),line=ring>=1?rp:partial(smoothPts(rp,true,8),ring);if(line.length>1)s.fill(K,ribbon(line,16,{seed:seed+3,close:ring>=1,taper:.4,pressure:.5,wobble:1.6}));}
 s.restore();
}
/** a magnifier: paper glass with the content redrawn 1.7× inside it, a navy ring and a handle. */
function magnifier(s:Sheet,x:number,y:number,r:number,ang:number,seed:number,content:(s:Sheet)=>void,o:{scale?:number}={}){
 const{scale=1.7}=o,glass=polyPath(blob(x,y,r,r,seed,{amp:.02,n:36}),true);
 s.knockout(glass,.95);s.save();s.clip(glass);s.translate(x,y);s.scale(scale);s.translate(-x,-y);content(s);s.restore();
 s.fill(K,ribbon([[x+Math.cos(ang)*r*.9,y+Math.sin(ang)*r*.9],[x+Math.cos(ang)*r*2.1,y+Math.sin(ang)*r*2.1]],r*.26,{seed:seed+1,taper:.15,pressure:.3,wobble:1.2}));
 contour(s,K,blob(x,y,r,r,seed,{amp:.02,n:36}),r*.16,{close:true,seed:seed+2,pressure:.5,wobble:1.4});
 s.knockout(polyPath(blob(x-r*.45,y-r*.5,r*.16,r*.1,seed+3,{amp:.1,n:12,rot:-.6}),true),.9);
}
/** a pink jagged name-tag: hand-cut label with spikes and a paper hole. */
function nameTag(s:Sheet,x:number,y:number,rot:number,seed:number,o:{sx?:number;sy?:number;cov?:number}={}){
 const{sx=1,sy=1,cov=1}=o,base:Pt[]=[[-90,-44],[-40,-70],[10,-46],[60,-72],[96,-40],[80,10],[100,48],[40,52],[0,74],[-50,50],[-96,60],[-80,4]];
 const pts=rotPts(scalePts(handCut(base,seed,6,40),sx,sy),rot).map(p=>[p[0]+x,p[1]+y] as Pt),path=polyPath(pts,true);
 s.knockout(path,.95);s.fill(P,path,cov);
 const hole=rotPts([[-62*sx,0]],rot)[0];s.knockout(circlePath(x+hole[0],y+hole[1],12),.95);
}
/** a yellow tick (paper beneath so it prints bright); ink 'paper' = a paper tick with a navy contour (on a yellow sheet). */
function tick(s:Sheet,x:number,y:number,size:number,g:number,seed:number,ink:string|'paper'=Y){
 if(g<=.03)return;const pts:Pt[]=[[x-size*.5*g,y],[x-size*.15*g,y+size*.36*g],[x+size*.55*g,y-size*.48*g]],rb=ribbon(pts,size*.24*g,{seed,taper:.2,pressure:.3,wobble:1.2});
 s.knockout(rb,.95);if(ink==='paper')s.stroke(K,rb,Math.max(3,size*.04));else s.fill(ink,rb,.95);
}
/** a small paper ball: paper disc, one navy pentagon, navy rim (6 ops — the strip and the replay use it). */
function miniBall(s:Sheet,x:number,y:number,r:number,rot:number,seed=3){
 const d=polyPath(blob(x,y,r,r,seed,{amp:.03,n:24}),true);s.knockout(d,.95);
 const q:Pt[]=[];for(let i=0;i<5;i++){const a=rot+i/5*TAU;q.push([x+Math.cos(a)*r*.42,y+Math.sin(a)*r*.42]);}s.fill(K,polyPath(q,true));
 contour(s,K,blob(x,y,r,r,seed,{amp:.03,n:24}),Math.max(3,r*.12),{close:true,seed:seed+1,pressure:.5,wobble:r*.02});
}
/** the story's ball: a paper football with navy pentagons (orange shadow crescent) and a navy ground shadow. */
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sx?:number;sy?:number;shadow?:number}={}){
 const{sx=1,sy=1,shadow=1}=o;if(shadow>0)s.tone(K,polyPath(blob(x,y+r*.98,r*1.1*shadow,r*.26*shadow,9,{amp:.06,n:18}),true),.32);
 s.save();s.translate(x,y);s.scale(sx,sy);footballPanels(s,0,0,r,{rot,key:K,shadow:O,seed:5,light:[-.4,-.5]});s.restore();
}
/** a paper-and-yellow spark on arrival. */
function spark(s:Sheet,x:number,y:number,age:number,seed:number,r=90){
 if(age<0||age>1.1)return;const g=easeOutBack(clamp(age/.4))*(1-.4*clamp((age-.6)/.5));if(g<=0)return;const rr=rng(seed),p=new Path2D();
 for(let i=0;i<8;i++){const a=i/8*TAU+(rr()-.5)*.4,r0=r*.35,r1=r*(.8+rr()*.5)*g;p.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],r*.13*(.7+rr()*.6),{seed:seed+i,taper:.8,pressure:.4,wobble:.8}));}
 s.knockout(p,.95);s.fill(Y,p,.95);
}
/** a yellow sight wedge from the head toward ang (the look). */
function sight(s:Sheet,x:number,y:number,ang:number,half:number,L:number,seed:number,g=1){
 if(g<=0)return;const pts:Pt[]=[[x,y]];for(let i=0;i<=8;i++){const a=ang-half+2*half*i/8;pts.push([x+Math.cos(a)*L*g,y+Math.sin(a)*L*g]);}
 const p=polyPath(pts,true);s.knockout(p,.5);s.tone(Y,p,.6);
}
/** a stepped yellow halo behind a found teammate. */
function halo(s:Sheet,x:number,y:number,r:number,g:number,seed:number){if(g<=.02)return;s.tone(Y,polyPath(blob(x,y,r*1.5*g,r*1.7*g,seed,{amp:.06,n:30}),true),.32);s.tone(Y,polyPath(blob(x,y,r*g,r*1.15*g,seed+1,{amp:.06,n:30}),true),.6);}
/** paper thought discs from a cup up to the player. */
function thoughts(s:Sheet,from:Pt,to:Pt,g:number,seed:number){if(g<=.02)return;const p=new Path2D();for(const[u,r] of [[.3,12],[.62,20]] as [number,number][]){const x=lerp(from[0],to[0],u),y=lerp(from[1],to[1],u);p.addPath(polyPath(blob(x,y,r*g,r*g,seed+Math.round(u*10),{amp:.08,n:14}),true));}s.knockout(p,.95);s.fill(K,ribbon(blob(lerp(from[0],to[0],.3),lerp(from[1],to[1],.3),12*g,12*g,seed+3,{amp:.08,n:14}),3,{close:true,wobble:.5}),.7);}

// ---------------- chapter 1: a pass goes wrong; headphones; the loud track loops, louder each time ----------------
const KID1=-60;
function ch1Kid(t:number){const kick=t>=.28&&t<.9?sm(.28,.5,t,easeIn)*(1-sm(.7,.9,t)):0,drop=sm(1.95,2.45,t,easeOut),hunch=key(t,[[5.67,0],[6.0,.33],[6.77,.33],[7.1,.66],[7.87,.66],[8.2,1]],easeOut);return{kick,drop,hunch,x:KID1+4*Math.sin(t*1.7)+(t>2.45?3*settle(t,2.45,{amp:1,freq:3,decay:3}):0)};}
function ch1Fig(s:Sheet|null,t:number){const k=ch1Kid(t);if(k.kick>0)return figure(s,k.x,GY,400,'kick',{k:k.kick,seed:11});if(k.hunch>0)return figure(s,k.x,GY,400,'hunch',{from:'slump',k:k.hunch,seed:11});return figure(s,k.x,GY,400,'slump',{k:k.drop,seed:11});}
const ch1Cup=(t:number)=>{const f=ch1Fig(null,t)!;return phonesGeom(f.head,f.R);};
function ch1Ball(t:number){if(t<.5)return{x:KID1+70-14*sm(.28,.5,t),y:GY-46,rot:0,fly:false};const u=sm(.5,1.2,t,easeOut),p=arc([KID1+70,GY-46],[820,GY-46],u,110),roll=sm(1.2,2.6,t,easeOut);return{x:p[0]+720*roll,y:t<1.2?p[1]:GY-46,rot:u*5+roll*6,fly:t<1.2};}
const ch1:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),k=ch1Kid(t),C=ch1Cup(9.45).Rc,shake=t>=5.67?shakeOf(t,[5.67,6.77,7.87],3):0;
  cam(s,t,[[0,-40,20,1],[.75,-40,20,1],[1.6,150,30,1.02],[2.0,150,30,1.02],[2.7,-60,10,1.06],[3.37,-60,10,1.06],[4.1,-60,-20,1.14],[5.67,-60,-20,1.14],[7.27,-60,-30,1.18],[8.4,(C[0]-60)/2,(C[1]-30)/2,1.6],[9.45,C[0],C[1],2.2]],[shake,shake*.5]);
  const loud=sm(3.37,3.95,t,easeOut),spikes=t<5.67?0:.6+.4*(ti%2),level=key(t,[[0,-215],[3.37,-215],[4.0,-200],[5.67,-200],[6.0,-190],[6.77,-190],[7.1,-180],[7.87,-180],[8.2,-172]]);
  sky(s,{level,loud,amp:lerp(30,60,k.hunch),phase:tt*1.1,seed:1,spikes,kindAmp:t<3.37?12+18*sm(2.45,3.37,t):30});
  ground(s,11);
  // the teammate: arms out for the pass, turns after the ball, jogs after it out of the picture
  const chase=sm(1.3,2.6,t,easeIn),tx=lerp(420,1100,chase),moving=chase>0&&chase<1;
  figure(s,tx,GY,360,moving?(ti%2?'step2':'step'):t<1.0?'arms':'stand',{ink:Y,seed:21,face:t<1.0?-1:1,k:t<1.0?.7:1,shade:K});
  // the ball: overhit past the teammate, rolls away
  const b=ch1Ball(t);if(b.x<1500)ball(s,b.x,b.y,46,b.rot,{shadow:b.fly?.4:1});
  if(b.fly&&t>.55)speedLines(s,K,b.x-30,b.y,0,{n:4,seed:31+ti,len:110,width:5,cov:.8});
  // the kid: kick, shoulders drop, headphones pop on, the loud arch pours out and loops, hunching each loop
  const f=ch1Fig(s,t)!;
  const ph=pop(t,3.37,.32);if(ph>0){s.save();s.translate(f.head[0],f.head[1]);s.scale(ph);s.translate(-f.head[0],-f.head[1]);headphones(s,f.head,f.R,{glow:sm(7.27,7.9,t),glowInk:O,seed:41,glowCup:'right'});s.restore();}
  if(t>=3.37){const amp=key(t,[[3.37,28],[5.67,30],[6.0,44],[6.77,44],[7.1,58],[7.87,58],[8.2,72]],easeOut)+(t>=5.67?6*shakeOf(t,[6.0,7.1,8.2],1):0);
   archWave(s,f.head,f.R,{kind:'loud',amp,phase:tt*4,seed:51,width:22+10*k.hunch,progress:sm(3.37,4.3,t,easeOut),spikes:spikes*sm(5.67,5.9,t),spikeLen:60});}
 },
 aperture(t){const g=ch1Cup(t);return apertureDisc(g.Rc[0],g.Rc[1],g.inner*.9,12);},still:6.6,
};

// ---------------- chapter 2: inside the cup — the loud wave fills the frame; pull back: the day strip, the miss is one frame ----------------
const FR=[-760,-380,0,380,760],FY=40,FW=340,FH=260,FS=1.36;
const ch2:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),shake=shakeOf(t,[1.16,1.6,2.05],4);
  cam(s,t,[[0,0,0,1.5],[2.83,0,0,1.5],[4.4,0,20,1.0],[7,0,20,1.0]],[shake,shake*.6]);
  s.field(K,.32,.6);s.tone(K,polyPath(torn(-2400,-300+30*sm(0,.7,t),4800,600,21,40,90),true),.6);
  confetti(s,['paper'],[-1500,-1000,3000,2000],14,22,{size:34});
  // the wave: draws across, scrolls, spikes on the harsh line, shrinks to a quiet line behind the strip
  const amp=key(t,[[0,150],[1.16,150],[1.4,190],[2.83,190],[4.4,60],[4.66,60],[5.2,24]],easeOut),width=key(t,[[0,90],[2.83,90],[4.4,40],[5.2,26]]),sp=t<1.16?0:.55+.45*(ti%2);
  wave(s,u=>[-1700+u*3400,0],()=>[0,-1],{kind:'loud',amp:amp*.6,phase:tt*3+7,seed:61,width:width*.5,segs:26,cov:.45,knock:true,outline:false});
  wave(s,u=>[-1700+u*3400,0],()=>[0,-1],{kind:'loud',amp,phase:tt*4.5,seed:62,width,segs:22,progress:sm(0,.7,t,easeOut),spikes:sp*sm(1.16,1.3,t)*(1-.6*sm(4.4,5,t)),spikeLen:150});
  // the day strip: five moment frames stamp in left to right
  const contents:((s:Sheet,g:number)=>void)[]=[
   s2=>{figure(s2,-70,60,120,'kick',{ink:Y,seed:71,face:1,k:1});miniBall(s2,40,42,18,.3,71);s2.fill(Y,ribbon([[62,40],[96,20]],7,{seed:72,taper:.5}));tick(s2,80,-50,52,1,73);},
   s2=>{figure(s2,-20,64,120,'run',{ink:Y,seed:74,face:1});miniBall(s2,44,50,16,1.1,74);tick(s2,80,-50,52,1,75);},
   s2=>{figure(s2,-50,66,118,'slump',{seed:76,face:1});miniBall(s2,86,54,16,2,76);wave(s2,u=>[-70+u*100,-46],()=>[0,-1],{kind:'loud',amp:12,phase:tt*4,seed:77,width:7,segs:10,knock:false});},
   s2=>{const a=figure(s2,-56,64,118,'up',{ink:Y,seed:78,face:1,reach:[0,-24]});figure(s2,58,64,118,'up',{ink:Y,seed:79,face:-1,reach:[0,-24]});if(a)spark(s2,0,-30,.5,80,40);tick(s2,80,-50,52,1,81);},
   s2=>{figure(s2,-60,60,120,'kick',{ink:Y,seed:82,face:1});miniBall(s2,50,42,18,.9,82);s2.fill(Y,ribbon([[72,40],[104,24]],7,{seed:83,taper:.5}));tick(s2,80,-50,52,1,84);},
  ];
  const lift=t>=4.66?-8*sm(4.66,4.8,t)*(1-sm(4.9,5.3,t)):0;
  FR.forEach((fx,i)=>{const t0=3.0+i*.22,g=pop(t,t0,.28);if(g<=0)return;frame(s,fx,FY+lift,FW,FH,90+i,Math.min(1.08,g),s2=>contents[i](s2,g),{cs:FS,border:11,ring:i===2?sm(4.66,5.1,t,easeOut)+(t>5.1?.02*settle(t,5.1,{amp:1,freq:4,decay:5}):0):0});});
  // the ticks pulse once on "one moment"
  if(t>=4.7&&t<5.1&&ti%2)FR.forEach((fx,i)=>{if(i!==2)tick(s,fx+80*FS,FY-50*FS+lift,60*FS,1,73+i);});
 },
 aperture(){return aperture([[-130,-50+FY],[130,-50+FY],[130,100+FY],[-130,100+FY]]);},still:5.4,
};

// ---------------- chapter 3: the player and SKIP; kind words to a friend travel back into the kid's own headphones ----------------
const KID3=-300,FR3=330,PL3:Pt=[60,-170];
function ch3Kid(s:Sheet|null,t:number){const rel=t<1.55?1:clamp(1-spring(t-1.55,2.2,.5),-.15,1),pt=sm(2.58,2.95,t,easeOut)*(1-sm(4.3,4.7,t));
 if(pt>0)return figure(s,KID3,GY,380,'point',{k:pt,seed:111,face:1});return figure(s,KID3,GY,380,'slump',{k:Math.max(0,rel),seed:111,face:1});}
const arch3=(t:number):WaveOpts=>({kind:'kind',amp:18+26*sm(1.55,2.2,t,easeOutBack)+12*settle(t,5.6,{amp:1,freq:3,decay:3}),phase:twos(t)*1.4,seed:52,width:24,segs:3});
function ch3Ap(t:number){const f=ch3Kid(null,t)!;return archPoint(f.head,f.R,.5,arch3(t));}
const ch3:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),A=ch3Ap(6.95),shake=shakeOf(t,[1.55],3);
  cam(s,t,[[0,-40,-40,1],[1.29,-40,-40,1],[1.6,-40,-40,1.02],[2.58,-40,-40,1.02],[3.2,140,0,1.06],[4.83,140,0,1.06],[5.6,-120,-20,1.18],[6.3,-200,-60,1.32],[6.95,A[0],A[1],1.6]],[shake,shake*.5]);
  const loud=t<1.55?1:1-sm(1.55,2.05,t,easeIn);
  sky(s,{level:-195,loud,loudY:lerp(-1500,-160,loud),amp:48,phase:tt*1.1,seed:3,spikes:.8,kindAmp:30});
  ground(s,13);
  // the kid: slumped under the loud arch, released by the skip; points at the friend; the kind words come back into the right cup
  const f=ch3Kid(s,t)!,pg=phonesGeom(f.head,f.R);
  headphones(s,f.head,f.R,{glow:t<1.55?.7:sm(5.6,5.75,t)*(1-.5*sm(6.5,7,t)),glowInk:t<1.55?O:Y,seed:41,glowCup:'right'});
  if(t<1.55)archWave(s,f.head,f.R,{kind:'loud',amp:52,phase:tt*4,seed:51,width:26,spikes:.6+.4*(ti%2),spikeLen:60});
  else archWave(s,f.head,f.R,{...arch3(t),progress:sm(1.55,1.9,t,easeOut)});
  // the friend: kick-ups, drops the ball on "friend", springs back up when the heart arrives
  const juggle=t<2.7,bounce=Math.abs(Math.sin(t*Math.PI/.55)),drop=sm(2.7,2.95,t,easeIn),up=t<3.6?0:easeOutBack(sm(3.6,3.9,t))*(1-sm(4.6,5,t));
  const fr=figure(s,FR3,GY,360,juggle?'kick':up>0?'up':'slump',{ink:Y,seed:121,face:-1,k:juggle?.35+.65*bounce:up>0?up:.5*sm(2.9,3.4,t),shade:K});
  const bx=juggle?FR3-70:lerp(FR3-70,FR3-40,sm(2.95,3.5,t,easeOut)),by=juggle?GY-40-100*Math.pow(Math.abs(Math.sin(twos(t)*Math.PI/.55)),.8):lerp(GY-150,GY-40,drop)+(t>2.95?0:0);
  ball(s,bx,t<2.7?by:lerp(by,GY-40,drop),40,tt*3,{shadow:juggle?.5:1});
  // the player, big, with two thought discs; the thumb presses SKIP
  const pg3=pop(t,0,.36),bob=6*Math.sin(t*2.3);
  thoughts(s,pg.Rc,[PL3[0]-180,PL3[1]+120],pg3,131);
  const press=sm(1.5,1.56,t)*(1-sm(1.66,1.8,t)),click=t>=1.55?sm(1.55,1.6,t)*(1-sm(1.85,2.05,t)):0;
  const pl=player(s,PL3[0],PL3[1]+bob,540,310,{loud,phase:tt,press,click,seed:141,flash:tt>=1.55&&tt<1.55+1/12?1:0,scale:pg3});
  if(pl&&t>=1.29&&t<2.3){const u=anticipate(1.29,1.5,t,{back:.08,hold:.3}),away=sm(1.75,2.3,t,easeIn),from:Pt=[pl.btn[0]+260,pl.btn[1]+380];
   const tx=lerp(from[0],pl.btn[0]+6,clamp(u))+(from[0]-pl.btn[0])*away*.9,ty=lerp(from[1],pl.btn[1]-8+14*press,clamp(u))+(from[1]-pl.btn[1])*away;thumb(s,tx,ty,150,151);}
  // the bubble: grows from the kid's head, a heart pops inside, then travels back into the kid's right cup
  const bg=pop(t,2.8,.35),heart=pop(t,3.2,.3),travel=sm(4.83,5.58,t,easeIO);
  if(bg>0&&travel<1){const B0:Pt=[f.head[0]+150,f.head[1]-170],p=arc(B0,pg.Rc,travel,-120),rock=travel<=0?.02*settle(t,3.15,{amp:1,freq:3,decay:3}):0;
   bubble(s,p[0],p[1]+rock*60,230,150,travel>0?pg.Rc:[f.head[0]+f.R*.6,f.head[1]-f.R*.5],bg,161,{heart,scale:1-.85*travel});}
  spark(s,pg.Rc[0],pg.Rc[1],t-5.58,171,80);
  void fr;
 },
 aperture(t){const A=ch3Ap(t);return apertureDisc(A[0],A[1],9,10);},still:4.0,
};

// ---------------- chapter 4: honest — replay, a cover that falls away, a magnifier on the touch, a name-tag that slides off, a tick and a ring ----------------
const KID4=-390,F4:Pt=[150,-30],F4W=620,F4H=440,CONTACT:Pt=[-128,126],MAG:Pt=[F4[0]+CONTACT[0],F4[1]+CONTACT[1]];
const ch4U=(t:number)=>t<3.98?(t/1.86)%1:.255;
/** the replay inside the frame (frame-local coordinates): mini kid kicks, the ball flies past the mini teammate's head. */
function replay(s:Sheet,u:number,tt:number){
 s.tone(K,rectPath(-400,130,800,400),.22);s.knockout(ribbon([[-400,150],[400,152]],5,{seed:181,wobble:1,taper:0,step:60}),.9);
 const kick=u>=.15&&u<.32?sm(.15,.25,u,easeIn)*(1-sm(.28,.32,u)):0;
 figure(s,-180,150,170,kick>0?'kick':'stand',{seed:182,face:1,k:kick>0?kick:1});
 figure(s,170,150,160,'arms',{ink:Y,seed:183,face:-1,k:.7});
 let bx=-130,by=128,fly=false;
 if(u>=.25){const v=sm(.25,.62,u,easeOut),p=arc([-130,128],[420,40],v,160);bx=p[0];by=p[1];fly=v<1;}
 else if(u>=.15)bx-=8*sm(.15,.25,u);
 miniBall(s,bx,by,22,u*8,184);if(fly)speedLines(s,K,bx-20,by,-.2,{n:3,seed:185+Math.floor(tt*12),len:60,width:4,cov:.8});
}
const ch4:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),shake=shakeOf(t,[2.25,5.96],3);
  cam(s,t,[[0,-60,0,1],[1.81,-60,0,1],[2.3,0,-20,1.08],[3.98,0,-20,1.08],[4.6,120,-30,1.16],[5.61,120,-30,1.16],[6.0,-40,-40,1.18],[7.42,-40,-40,1.18],[8.75,MAG[0],MAG[1],2.0]],[shake,shake*.6]);
  sky(s,{level:-220,loud:0,phase:tt*1.1,seed:4,kindAmp:28});
  ground(s,14);
  // the kid, listening to the kind track, looks at the replay; flinches at the tag
  const look=sm(3.98,4.4,t,easeOut),flinch=sm(5.96,6.05,t)*(1-sm(6.3,6.7,t));
  const f=figure(s,KID4,GY,380,flinch>0?'pressed':'listen',{seed:191,face:1,k:flinch>0?flinch:look*.8,look:look*.5})!;
  headphones(s,f.head,f.R,{glow:.5,glowInk:Y,seed:41});
  archWave(s,f.head,f.R,{kind:'kind',amp:16+3*Math.sin(t*3),phase:tt*1.4,seed:52,width:18,segs:3});
  // the replay frame
  const u=ch4U(t),fg=pop(t,0,.3);
  frame(s,F4[0],F4[1],F4W,F4H,201,fg,s2=>replay(s2,u,tt),{border:12});
  // the cover sheet: pretending — drops over the replay, then slides off and falls away
  const cy=key(t,[[1.81,-900],[1.95,-930,easeIn],[2.25,F4[1],easeOut]])+(t>2.25?12*settle(t,2.25,{amp:1,freq:4,decay:5,phase:Math.PI/2}):0),off=sm(3.98,4.55,t,easeIn);
  if(t>=1.81&&off<1){const cx=F4[0]+520*off,cyy=cy+900*off*off,rot=.9*off;s.save();s.translate(cx,cyy);s.rotate(rot);
   const sh=polyPath(torn(-F4W/2-20,-F4H/2-16,F4W+40,F4H+32,211,18,50),true);s.knockout(sh,.95);s.fill(Y,sh,.95);tick(s,0,20,260,1,212,'paper');s.restore();}
  // the magnifier: swings in from the right and settles over the touch; inside the glass the contact is redrawn 1.7×
  const mg=t<3.98?0:anticipate(3.98,4.5,t,{back:.06,hold:.22}),mx=lerp(1100,MAG[0],clamp(mg))+(t>4.5?10*settle(t,4.5,{amp:1,freq:3,decay:4}):0);
  if(mg>0)magnifier(s,mx,MAG[1],130,.75,221,s2=>{s2.save();s2.translate(F4[0]+mx-MAG[0],F4[1]);replay(s2,u,tt);
   if(t>=7.42){const rr=sm(7.42,7.9,t,easeOut),rp=blob(CONTACT[0],CONTACT[1],44,44,231,{amp:.04,n:30}),line=rr>=1?rp:partial(smoothPts(rp,true,6),rr);if(line.length>1)s2.fill(K,ribbon(line,8,{seed:232,close:rr>=1,taper:.4,pressure:.5,wobble:1.2}));}s2.restore();});
  // the name-tag: thrown at the chest, sticks, slides off
  if(t>=5.61&&t<7.1){const fl=sm(5.61,5.96,t,easeIn),slide=sm(6.2,6.9,t,easeIn),from:Pt=[-1000,-560],C=f.chest;
   const x=lerp(from[0],C[0]+10,fl)+30*slide,y=lerp(from[1],C[1],fl)+420*slide*slide,rot=lerp(-.6,.1,fl)+.9*slide,sq=t>=5.96&&t<5.96+2/12?.7:1;
   nameTag(s,x,y,rot,241,{sx:1+.3*(1-sq),sy:sq,cov:1-.4*slide});}
  // allowed to learn: a tick beside the glass
  tick(s,F4[0]+200,F4[1]-130,96,pop(t,7.42,.3),251);
  void ti;
 },
 aperture(){return apertureDisc(MAG[0],MAG[1],40,12);},still:4.8,
};

// ---------------- chapter 5: breathe out; look up, find a teammate, a short pass; the kind wave rides along ----------------
const TM5=430,B0:Pt=[50,GY-46],B1:Pt=[TM5-60,GY-46];
function ch5Ball(t:number){const u=sm(5.93,6.63,t,easeIO),p=arc(B0,B1,u,36),c=t>6.63?settle(t,6.63,{amp:.08,freq:4,decay:5,phase:Math.PI/2}):0;return{x:p[0]-(t<5.93?10*sm(5.73,5.93,t):0),y:p[1],rot:u*5,sx:1+c,sy:1-c,u};}
const ch5:Scene={
 draw(s,t){
 const tt=twos(t),ti=twosIndex(t),b=ch5Ball(t);
  cam(s,t,[[0,0,0,1],[4.12,0,0,1],[4.7,120,-10,1.02],[7.16,120,-10,1.02],[8.65,B1[0],B1[1],2.1]]);
  const ex=sm(0,1.9,t,easeOut);
  sky(s,{level:lerp(-200,-330,ex),loud:0,phase:tt*.9,seed:5,kindAmp:lerp(30,16,ex)});
  ground(s,15,{loosen:ex});
  // the teammate walks in on "one useful football cue", lights up when found, cushions the pass
  const come=t<2.15?0:anticipate(2.15,3.1,t,{back:.06,hold:.2,e:easeIn}),tx=lerp(1000,TM5,clamp(come))+(t>3.1?10*settle(t,3.1,{amp:1,freq:4,decay:5}):0),moving=come>0&&come<1;
  const lit=pop(t,4.5,.4)*(1+.25*pop(t,7.16,.3)*(1-sm(7.6,8.2,t)));
  if(t>=2.15){halo(s,tx,GY-170,190,lit,261);
   const cush=t>=6.63&&t<7?.5*(1-sm(6.75,7,t)):0;
   figure(s,tx,GY,360,moving?walkPose(t,true):cush>0?'crouch':lit>0?'beckon':'stand',{ink:Y,seed:271,face:-1,k:cush>0?cush:lit>0?clamp(lit):1,shade:K});}
  // the kid, big and centred: breathes out (chest relaxes, headphones lift, arch flattens), straightens, looks up, passes
  const chest=1+.14*(1-ex),lift=14*sm(0,.5,t,easeOut)*(1-sm(1.4,2.2,t)),lookU=t<4.12?0:anticipate(4.12,4.5,t,{back:.12,hold:.3,e:easeOutBack}),kick=t>=5.73&&t<6.2?sm(5.73,5.93,t,easeIn)*(1-sm(6.05,6.2,t)):0;
  const pose:Pose=kick>0?'kick':lookU>0?'lookup':t<2.15?'slump':'stand',k=kick>0?kick:lookU>0?clamp(lookU,0,1):t<2.15?.22*(1-ex):1;
  const f=figure(s,0,GY,440,pose,{k,seed:281,face:1,chest})!;
  headphones(s,f.head,f.R,{lift,glow:.45,glowInk:Y,seed:41});
  archWave(s,f.head,f.R,{kind:'kind',amp:lerp(40,14,ex)+4*Math.sin(t*2.5),phase:tt*1.4,seed:52,width:22,segs:3});
  if(t>=.3&&t<2.4){const u=sm(.3,2.2,t,easeOut);s.knockout(polyPath(blob(f.head[0]+120+170*u,f.head[1]-40-40*u,26+50*u,20+36*u,291,{amp:.1,n:20}),true),.9*(1-u));}
  sight(s,f.head[0]+f.R*.5,f.head[1],Math.atan2((GY-200)-f.head[1],tx-f.head[0]),.16,320,292,sm(4.4,4.7,t)*(1-sm(5.73,6.0,t)));
  // the pass: the ball travels 0.7 s, the kind wave rides along behind it, the teammate cushions, a spark on arrival
  if(b.u>0)wave(s,u=>[lerp(B0[0],B1[0],u),B0[1]-40],()=>[0,-1],{kind:'kind',amp:26+8*settle(t,7.16,{amp:1,freq:3,decay:3}),phase:tt*2,seed:301,width:18,segs:4,progress:Math.max(.05,b.u),cov:.95*(1-.5*sm(7.8,8.6,t))});
  ball(s,b.x,b.y,46,b.rot,{sx:b.sx,sy:b.sy,shadow:b.u>0&&b.u<1?.5:1});
  if(b.u>0&&b.u<1)speedLines(s,K,b.x-40,b.y,0,{n:3,seed:311+ti,len:70,width:4,cov:.8});
  spark(s,B1[0],B1[1]-10,t-6.63,321,90);
 },
 aperture(t){const b=ch5Ball(t);return apertureDisc(b.x,b.y,13,5,b.rot);},still:6.8,
};

// ---------------- chapter 6: the loud track starts again; notice it; skip it again; the next step ----------------
const KID6=-120,PL6:Pt=[210,-210];
const ch6Step=(t:number)=>t<4.52?0:anticipate(4.52,5.3,t,{back:.08,hold:.15});
const ch6:Scene={
 draw(s,t){
  const tt=twos(t),ti=twosIndex(t),shake=shakeOf(t,[3.45],3),st=ch6Step(t),kx=KID6+190*clamp(st)+(t>5.3?8*settle(t,5.3,{amp:1,freq:4,decay:5}):0);
  cam(s,t,[[0,60,-10,1.05],[2.26,60,-10,1.05],[2.7,-20,-60,1.12],[4.52,-20,-60,1.12],[5.4,60,-40,1.18],[7.3,70,-40,1.2]],[shake,shake*.5]);
  const loud=t<3.45?sm(.2,1.6,t,easeOut):1-sm(3.45,3.85,t,easeIn);
  sky(s,{level:-230,loud,loudY:lerp(-1500,-330,loud),amp:34,phase:tt*1.1,seed:6,spikes:.6,kindAmp:28});
  ground(s,16);
  // the kid: shoulders drop as the loud track restarts, notices (head tilt), springs up on the skip, steps forward with the ball
  const slump=t<3.45?key(t,[[0,0],[2.0,.45],[2.26,.45],[2.5,.3]]):.3*clamp(1-spring(t-3.45,2.2,.5),-.15,1),notice=sm(2.26,2.6,t,easeOut)*(1-sm(3.5,3.9,t));
  const moving=st>0&&st<1,pose:Pose=moving?walkPose(t,true):notice>0?'listen':'slump';
  const f=figure(s,kx,GY,420,pose,{k:moving?1:notice>0?notice:Math.max(0,slump),look:notice*.6,seed:331,face:1})!,pg=phonesGeom(f.head,f.R);
  headphones(s,f.head,f.R,{glow:t<3.45?.5*loud:.5,glowInk:t<3.45?O:Y,seed:41,glowCup:'right'});
  const kindAmp=t<3.45?22:22+18*settle(t,3.45,{amp:1,freq:2.5,decay:2.5})+6*settle(t,6.2,{amp:1,freq:3,decay:3});
  if(t<3.45){archWave(s,f.head,f.R,{kind:'kind',amp:22,phase:tt*1.4,seed:52,width:18,segs:3,cov:1-.7*sm(.2,.9,t)});
   archWave(s,f.head,f.R,{kind:'loud',amp:key(t,[[0,10],[2.26,36],[3.45,40]]),phase:tt*4,seed:51,width:16+8*sm(0,2.26,t),progress:sm(0,.9,t,easeOut),spikes:.5+.5*(ti%2),spikeLen:44});}
  else archWave(s,f.head,f.R,{kind:'kind',amp:kindAmp,phase:tt*1.4,seed:52,width:20,segs:3});
  // notice: a paper ring pops around the right cup
  if(notice>0){const rp=blob(pg.Rc[0],pg.Rc[1],pg.r*1.9*notice,pg.r*1.9*notice,341,{amp:.04,n:30}),rb=ribbon(rp,10,{seed:342,close:true,pressure:.4,wobble:1.4});s.knockout(rb,.95);s.fill(K,rb,.9);}
  // skip it again: the player pops in, the thumb presses, click lines
  const pg6=pop(t,3.13,.3),press=sm(3.4,3.46,t)*(1-sm(3.56,3.7,t)),click=t>=3.45?sm(3.45,3.5,t)*(1-sm(3.75,3.95,t)):0;
  thoughts(s,pg.Rc,[PL6[0]-140,PL6[1]+90],pg6,351);
  const pl=player(s,PL6[0],PL6[1]+5*Math.sin(t*2.1),370,215,{loud:t<3.45?1:0,phase:tt,press,click,seed:361,flash:tt>=3.45&&tt<3.45+1/12?1:0,scale:pg6});
  if(pl&&t>=3.13&&t<4.2){const u=anticipate(3.13,3.4,t,{back:.08,hold:.3}),away=sm(3.65,4.2,t,easeIn),from:Pt=[pl.btn[0]+200,pl.btn[1]+340];
   const tx=lerp(from[0],pl.btn[0]+4,clamp(u))+(from[0]-pl.btn[0])*away*.9,ty=lerp(from[1],pl.btn[1]-6+10*press,clamp(u))+(from[1]-pl.btn[1])*away;thumb(s,tx,ty,120,371);}
  // the ball at the feet, rolls ahead on the step, stops with a bump
  const roll=sm(4.62,5.35,t,easeOut),bx=lerp(KID6+62,KID6+62+190,roll),bump=t>5.35?settle(t,5.35,{amp:.07,freq:4,decay:5,phase:Math.PI/2}):0+(t>6.2?settle(t,6.2,{amp:.05,freq:4,decay:5,phase:Math.PI/2}):0);
  ball(s,bx,GY-46,46,roll*4+(t>5.35?0:0),{sx:1+bump,sy:1-bump});
  sight(s,f.head[0]+f.R*.5,f.head[1],0.12,.14,300,381,sm(4.4,4.7,t)*(1-sm(5.5,5.9,t)));
 },
 still:6.4,
};

export const story:RisoStory={
 id:'loud-track',format:'7v7',title:'The Loud Track',theme:'A kinder inner voice',ageNote:'An explanation of kind, useful self-talk after mistakes.',
 spec:{paper:'#f0ece2',inks:{pink:'#ff48b0',yellow:'#ffe800',orange:'#ff6c2f',navy:'#22366b'},order:['yellow','orange','pink','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'What do you hear?',narration:'What do you say to yourself after a mistake? Sometimes your inner voice sounds like a loud track on repeat, playing the same harsh words through your headphones.',seconds:10.1,audio:CH+'1.m4a',cues:[{at:0.0,words:'What do you say to yourself'},{at:1.95,words:'after a mistake'},{at:3.37,words:'a loud track on repeat'},{at:5.67,words:'the same harsh words'},{at:7.27,words:'through your headphones'}]},
  {label:'Loud is not true',headline:{text:'ONE MOMENT',at:4.66},narration:'You might hear, I always get it wrong. But a loud track is not the whole truth. One pass is one moment.',seconds:7.0,audio:CH+'2.m4a',cues:[{at:0.0,words:'You might hear'},{at:1.16,words:'I always get it wrong'},{at:2.83,words:'not the whole truth'},{at:4.66,words:'One pass is one moment'}]},
  {label:'A kinder track',headline:{text:'SKIP IT',at:1.29},narration:'Imagine skipping to a kinder track. What would you say to a friend who was trying? Try playing yourself those same words.',seconds:7.6,audio:CH+'3.m4a',cues:[{at:0.0,words:'Imagine skipping'},{at:1.29,words:'a kinder track'},{at:2.58,words:'What would you say to a friend'},{at:4.83,words:'those same words'}]},
  {label:'Kind and honest',headline:{text:'HONEST',at:3.98},narration:'Being kind does not mean pretending everything went well. It means noticing what happened without calling yourself names. You are allowed to learn.',seconds:9.4,audio:CH+'4.m4a',cues:[{at:0.0,words:'Being kind'},{at:1.81,words:'pretending everything went well'},{at:3.98,words:'noticing what happened'},{at:5.61,words:'without calling yourself names'},{at:7.42,words:'allowed to learn'}]},
  {label:'One useful cue',headline:'BREATHE',narration:'Breathe out slowly. Then choose one useful football cue: look up, find a teammate, make a short pass. Give your attention somewhere helpful.',seconds:9.3,audio:CH+'5.m4a',cues:[{at:0.0,words:'Breathe out slowly'},{at:2.15,words:'one useful football cue'},{at:4.12,words:'look up, find a teammate'},{at:5.73,words:'make a short pass'},{at:7.16,words:'somewhere helpful'}]},
  {label:'Skip it again',headline:{text:'SKIP AGAIN',at:3.13},narration:'The loud track may play again. You can notice it and skip it again. A kinder voice helps you take the next step.',seconds:7.3,audio:CH+'6.m4a',cues:[{at:0.0,words:'The loud track may play again'},{at:2.26,words:'notice it'},{at:3.13,words:'skip it again'},{at:4.52,words:'the next step'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 /** a SKIP click: a paper button (navy ring, |▶▶ marks) stamps at the tap, squashes, click lines burst and a short yellow wave blip runs off to the right. */
 touch(s,x,y,age,seed){
  const g=age>0?easeOutBack(clamp(age/.2)):1,press=age>0?sm(.2,.26,age)*(1-sm(.3,.42,age)):0,fade=age>0?1-clamp((age-.55)/.25):1;if(fade<=0||g<=0)return;
  const r=80*g,sx=1+.18*press,sy=1-.34*press,btn=polyPath(scalePts(blob(x,y,r,r,seed,{amp:.04,n:24}),sx,sy,x,y),true);
  s.knockout(btn,.95);s.fill(K,ribbon(scalePts(blob(x,y,r,r,seed,{amp:.04,n:24}),sx,sy,x,y),12*g,{seed:seed+1,close:true,pressure:.3,wobble:1.2}),.95*fade);
  const m=r*.5,marks=new Path2D();marks.addPath(polyPath([[x-m*.95,y-m*.7],[x-m*.7,y-m*.7],[x-m*.7,y+m*.7],[x-m*.95,y+m*.7]],true));marks.addPath(polyPath([[x-m*.55,y-m*.75],[x+m*.15,y],[x-m*.55,y+m*.75]],true));marks.addPath(polyPath([[x+m*.2,y-m*.75],[x+m*.9,y],[x+m*.2,y+m*.75]],true));
  s.save();s.translate(x,y);s.scale(sx,sy);s.translate(-x,-y);s.fill(K,marks,.95*fade);s.restore();
  if(age>.2&&age<.6){const cl=new Path2D(),rr=rng(seed+2),k=(age-.2)/.4;for(let i=0;i<5;i++){const a=-Math.PI*.95+i*.4+(rr()-.5)*.2,r0=r*1.2,r1=r*(1.5+.6*k);cl.addPath(ribbon([[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1]],9,{seed:seed+3+i,taper:.7,wobble:.6}));}s.knockout(cl,.9);s.fill(K,cl,1-k*.8);}
  if(age>.12){const u=clamp((age-.12)/.68),run=260*easeOut(u);wave(s,v=>[x+r+10+run*.3+v*300,y-10],()=>[0,-1],{kind:'kind',amp:40*(1-.5*u),phase:age*3,seed:seed+9,width:30*(1-.4*u),segs:3,progress:clamp(u*2.2),cov:.95*(1-u*u)});}
 },
};
