/** More Than a Shirt — riso. People are ABSTRACT riso figures (bible §1c.4, `figure()` below): me = the orange cut-out wearing the 4,
 * the coach = a taller purple cut-out, teammates yellow, opponents purple. Everything else is stitched cloth: grainy knit fields carrying hand-cut chevron rows that sag, pucker,
 * compress and relax; a navy shirt outline that is a line, not a wall; running-stitch seams; patchwork of other knits.
 * Inks: yellow → orange → purple → navy on cream (orange × yellow = deep orange stripe, purple × orange = rust bands, purple × yellow = olive pitch). */
import type {Sheet} from '../sheet';
import {type RisoStory,type Scene,playChapters} from '../story';
import {apertureDisc} from '../passage';
import {twos,twosIndex,sm,easeOut,easeIO,easeIn,easeOutBack,key,camKeys,anticipate,settle,spring,clamp,lerp,rng,hash,blob,polyPath,ribbon,wob,rotPts,circlePath,rectPath,smoothPts,partial,type Pt} from '../motion';
import {contour,dust,handCut,confetti,speedLines} from '../shapes';

const CH='/stories/narration/11v11/more-shirt/';
const K='navy',P='purple',O='orange',Y='yellow';
const D=Math.PI/180;

// ---------------- abstract riso figure (bible §1c.4) — copied verbatim into each 11v11 story file ----------------
/** A person as a paper cut-out: one head disc, one torso block, two leg strokes, two arm strokes (3–6 shapes), big head, short legs,
 * torn/wobbly edges, one ink (or a paper knockout for dark prints). (x,y) = the ground point between the feet for standing poses, the seat
 * point for sitting poses; size = the figure's height; facing +1 = toward +x. Emotion lives in the pose only (never a face). */
export type Pose='stand'|'walk'|'run'|'kick'|'reach'|'point'|'lean'|'listen'|'slump'|'curl'|'lookBack'|'sit'|'sitSlump'|'sitKnee'|'sitBack'|'kneel'|'lie';
export type Limb=[Pt,Pt,Pt];
type PoseSpec={hip:Pt;top:Pt;head:Pt;legs:Limb[];arms:Limb[];tilt:number;headDrop?:Pt};
export type FigureOpts={facing?:number;mode?:'ink'|'paper';cov?:number;paperTone?:number;toneInk?:string;rot?:number;tilt?:number;headDrop?:Pt;legs?:Limb[];arms?:Limb[];head?:Pt;scaleX?:number;headScale?:number};
const F_STAND:Limb[]=[[[-.05,-.3],[-.07,-.15],[-.1,0]],[[.05,-.3],[.07,-.15],[.1,0]]];
const F_HANG:Limb[]=[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.16,-.6],[.24,-.46],[.23,-.3]]];
const F_DANGLE:Limb[]=[[[0,0],[.18,.02],[.2,.28]],[[0,0],[.12,.05],[.12,.3]]];
const F_UP:PoseSpec={hip:[0,-.3],top:[0,-.64],head:[0,-.82],legs:F_STAND,arms:F_HANG,tilt:0},F_SEAT:PoseSpec={hip:[0,0],top:[0,-.36],head:[0,-.54],legs:F_DANGLE,arms:F_HANG,tilt:.04};
const POSES:Record<Pose,PoseSpec>={
 stand:F_UP,
 walk:{...F_UP,legs:[[[-.04,-.3],[-.12,-.15],[-.2,0]],[[.04,-.3],[.14,-.16],[.2,0]]],arms:[[[-.13,-.6],[-.2,-.5],[-.24,-.38]],[[.13,-.6],[.22,-.52],[.28,-.42]]],tilt:.06},
 run:{...F_UP,legs:[[[-.04,-.3],[-.2,-.2],[-.34,-.06]],[[.04,-.3],[.2,-.28],[.26,-.1]]],arms:[[[-.13,-.6],[-.28,-.5],[-.3,-.36]],[[.13,-.6],[.26,-.56],[.32,-.68]]],tilt:.22},
 kick:{...F_UP,legs:[[[-.04,-.3],[-.1,-.15],[-.14,0]],[[.05,-.3],[.22,-.24],[.44,-.2]]],arms:[[[-.13,-.6],[-.3,-.62],[-.44,-.7]],[[.13,-.6],[.28,-.5],[.34,-.36]]],tilt:-.08},
 reach:{...F_UP,arms:[[[-.13,-.6],[-.2,-.8],[-.22,-1.02]],[[.13,-.6],[.2,-.8],[.22,-1.02]]]},
 point:{...F_UP,arms:[[[-.16,-.6],[-.24,-.46],[-.23,-.3]],[[.13,-.6],[.3,-.62],[.5,-.66]]]},
 lean:{...F_UP,arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.2,-.48],[.22,-.34]]],tilt:.16},
 listen:{...F_UP,head:[.05,-.8],arms:[[[-.13,-.6],[-.1,-.45],[-.06,-.3]],[[.13,-.6],[.26,-.68],[.2,-.8]]],tilt:.14},
 slump:{...F_UP,arms:[[[-.16,-.6],[-.16,-.42],[-.12,-.26]],[[.16,-.6],[.22,-.42],[.22,-.26]]],tilt:.22,headDrop:[.02,.08]},
 curl:{hip:[0,-.2],top:[0,-.5],head:[0,-.66],legs:[[[0,-.2],[-.12,-.08],[-.18,0]],[[0,-.2],[.16,-.1],[.22,0]]],arms:[[[-.12,-.46],[-.02,-.34],[.08,-.26]],[[.14,-.46],[.24,-.36],[.28,-.26]]],tilt:.85,headDrop:[.04,.06]},
 lookBack:{...F_UP,head:[-.08,-.82],arms:[[[-.13,-.6],[-.26,-.52],[-.3,-.4]],[[.16,-.6],[.24,-.46],[.23,-.3]]]},
 sit:{...F_SEAT,arms:[[[-.03,-.32],[.06,-.18],[.12,-.04]],[[.12,-.32],[.2,-.18],[.22,-.04]]]},
 sitSlump:{...F_SEAT,arms:[[[-.04,-.32],[.12,-.2],[.22,-.02]],[[.12,-.32],[.26,-.2],[.3,-.04]]],tilt:.3,headDrop:[.05,.07]},
 sitKnee:{...F_SEAT,legs:[[[0,0],[.2,-.24],[.28,0]],[[0,0],[.12,.05],[.12,.3]]],arms:[[[-.03,-.32],[.04,-.18],[.1,-.06]],[[.12,-.32],[.24,-.26],[.26,-.22]]],tilt:.08},
 sitBack:{...F_SEAT,arms:[[[-.06,-.3],[-.18,-.16],[-.26,0]],[[.02,-.3],[-.12,-.14],[-.18,.02]]],tilt:-.22},
 kneel:{hip:[0,-.16],top:[0,-.5],head:[0,-.68],legs:[[[0,-.16],[-.12,-.04],[-.3,0]],[[0,-.16],[.14,-.1],[.2,0]]],arms:[[[-.16,-.46],[-.24,-.32],[-.23,-.16]],[[.16,-.46],[.24,-.32],[.23,-.16]]],tilt:0},
 lie:{hip:[0,0],top:[0,-.36],head:[0,-.54],legs:[[[0,0],[.2,.01],[.4,.03]],[[0,0],[.18,.06],[.38,.08]]],arms:[[[-.1,-.32],[-.26,-.3],[-.4,-.22]],[[-.06,-.3],[-.18,-.16],[-.3,-.06]]],tilt:-1.35},
};
export function figure(s:Sheet,x:number,y:number,size:number,ink:string,seed:number,pose:Pose,o:FigureOpts={}){
 const{facing=1,mode='ink',cov=1,paperTone=.2,toneInk,rot=0,tilt:extra=0,scaleX=1,headScale=1}=o,P=POSES[pose],tilt=P.tilt+extra,hip=P.hip;
 const ct=Math.cos(tilt),st=Math.sin(tilt),rotP=(p:Pt):Pt=>{const dx=p[0]-hip[0],dy=p[1]-hip[1];return[hip[0]+dx*ct-dy*st,hip[1]+dx*st+dy*ct];};
 const hd=o.headDrop??P.headDrop??[0,0],headC=rotP(o.head??P.head),head:Pt=[headC[0]+hd[0],headC[1]+hd[1]],top=rotP(P.top);
 const arms=(o.arms??P.arms).map(l=>l.map(rotP) as Limb),legs=o.legs??P.legs;
 const cr=Math.cos(rot),sr=Math.sin(rot),W=(p:Pt):Pt=>{const px=p[0]*size*facing*scaleX,py=p[1]*size;return[x+px*cr-py*sr,y+px*sr+py*cr];};
 const torso=[[-.19,P.top[1]],[.19,P.top[1]],[.14,hip[1]+.03],[-.14,hip[1]+.03]].map(p=>W(rotP(p as Pt)));
 const part=(path:Path2D)=>{if(mode==='paper'){s.knockout(path,.95);if(paperTone>0)s.tone(toneInk??ink,path,paperTone);}else s.fill(ink,path,cov);};
 const limb=(l:Limb,width:number,sd:number)=>ribbon(l.map(W),width,{seed:sd,pressure:.3,taper:.12,wobble:size*.006,step:Math.max(4,size*.03)});
 part(limb(legs[0],size*.11,seed+1));part(limb(arms[0],size*.085,seed+2));
 part(polyPath(handCut(torso,seed+3,size*.012,size*.12),true));
 part(limb(legs[1],size*.11,seed+4));part(limb(arms[1],size*.085,seed+5));
 const hw=W(head);part(polyPath(blob(hw[0],hw[1],size*.16*headScale,size*.16*headScale,seed+6,{amp:.05,n:28}),true));
 return{head:hw,top:W(top),hip:W(hip),hands:[W(arms[0][2]),W(arms[1][2])] as [Pt,Pt],feet:[W(legs[0][2]),W(legs[1][2])] as [Pt,Pt]};
}
/** Run cycle: the two leg/arm keyframes swapped on the twos grid (k = 0 | 1). */
export const stride=(k:number):{legs:Limb[];arms:Limb[]}=>{const R=POSES.run,sw=(a:Limb,b:Limb):Limb[]=>[[a[0],b[1],b[2]],[b[0],a[1],a[2]]];return k%2?{legs:sw(R.legs[0],R.legs[1]),arms:sw(R.arms[0],R.arms[1])}:{legs:R.legs,arms:R.arms};};
/** mixLimbs(a,b,u): interpolate two limb sets (arms lowering, a straightening) — pass the result as opts.arms / opts.legs. */
export const mixLimbs=(a:Limb[],b:Limb[],u:number):Limb[]=>a.map((l,i)=>l.map((p,j)=>[lerp(p[0],b[i][j][0],u),lerp(p[1],b[i][j][1],u)] as Pt) as Limb);
export const poseLimbs=(p:Pose)=>({arms:POSES[p].arms,legs:POSES[p].legs});

/** a cut-out person on cloth: paper knocked out beneath so the ink prints clean over the knit. */
function person(s:Sheet,x:number,y:number,size:number,ink:string|'paper',seed:number,pose:Pose,o:FigureOpts&{numeral?:boolean}={}){
 if(ink==='paper')return figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:o.paperTone??.12});
 figure(s,x,y,size,K,seed,pose,{...o,mode:'paper',paperTone:0});const r=figure(s,x,y,size,ink,seed,pose,{...o,mode:'ink',cov:o.cov??.92});
 if(o.numeral)numeral(s,4,r.top[0]-size*.07,r.top[1]+size*.02,size*.2,K,seed+9,{width:size*.045,cov:.95});return r;
}
/** a dashed paper position spot on the pitch. */
const spot=(s:Sheet,x:number,y:number,r:number,seed:number,cov=.6)=>stitch(s,'paper',blob(x,y,r,r,seed,{amp:.02,n:24}),true,{len:14,gap:10,w:6,cov,seed});

// ---------------- cloth kit ----------------
/** Knit: an ink field in a box carrying chevron rows (a darker screen of the same ink, or `rowInk`). Rows sag with drape, compress, pucker toward points and scroll with offX. */
function knit(s:Sheet,ink:string,box:[number,number,number,number],seed:number,o:{spacing?:number;cov?:number;rowCov?:number;rowInk?:string;drape?:number;compress?:number;offX?:number;offY?:number;clip?:Path2D;pucker?:[number,number,number,number][];period?:number;amp?:number;thick?:number;field?:boolean}={}){
 const{spacing=30,cov=.55,rowCov=.82,rowInk=ink,drape=0,compress=1,offX=0,offY=0,clip,pucker=[],period=52,amp=9,thick=7,field=true}=o,[x,y,w,h]=box;
 s.save();if(clip)s.clip(clip);
 if(field)s.fill(ink,rectPath(x,y,w,h),cov);
 const sp=spacing*compress,half=period/2,p=new Path2D();
 const y0=y+(((offY%sp)+sp)%sp)-sp,x0=x+(((offX%period)+period)%period)-period;
 for(let ry=y0;ry<y+h+sp;ry+=sp){const top:Pt[]=[];let k=0;
  for(let px=x0;px<=x+w+period;px+=half,k++){let yy=ry+(k%2?amp:-amp)+drape*Math.sin(clamp((px-x)/w)*Math.PI);let xx=px;
   for(const[qx,qy,qr,qa] of pucker){const dx=qx-xx,dy=qy-yy,d=Math.hypot(dx,dy);if(d<qr&&d>1){const m=qa*(1-d/qr);xx+=dx/d*m;yy+=dy/d*m;}}
   top.push([xx,yy]);}
  p.moveTo(top[0][0],top[0][1]);for(let i=1;i<top.length;i++)p.lineTo(top[i][0],top[i][1]);for(let i=top.length-1;i>=0;i--)p.lineTo(top[i][0],top[i][1]+thick);p.closePath();}
 s.fill(rowInk,p,rowCov);s.restore();
}
/** Running stitch along a polyline (dashes as quads). tight 0..1: loose stitches wander off the line; 1 = straight. progress draws tip-leading. */
function stitchPath(pts:Pt[],close:boolean,o:{len?:number;gap?:number;w?:number;progress?:number;tight?:number;seed?:number}={}):Path2D{
 const{len=16,gap=11,w=5,progress=1,tight=1,seed=1}=o,q=close?[...pts,pts[0]]:pts,p=new Path2D(),rr=rng(seed);
 const seg:number[]=[0];for(let i=1;i<q.length;i++)seg.push(seg[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));const L=seg[seg.length-1]*clamp(progress);
 const at=(d:number):[number,number,number,number]=>{let i=1;while(i<seg.length-1&&seg[i]<d)i++;const f=(d-seg[i-1])/((seg[i]-seg[i-1])||1),dx=q[i][0]-q[i-1][0],dy=q[i][1]-q[i-1][1],l=Math.hypot(dx,dy)||1;return[lerp(q[i-1][0],q[i][0],f),lerp(q[i-1][1],q[i][1],f),dx/l,dy/l];};
 for(let d=0;d<L;d+=len+gap){const e=Math.min(L,d+len),[ax,ay,ux,uy]=at(d),[bx,by]=at(e),j=(1-tight)*8*(rr()-.5),nx=-uy*w/2,ny=ux*w/2,ox=-uy*j,oy=ux*j;
  p.moveTo(ax+nx+ox,ay+ny+oy);p.lineTo(bx+nx+ox,by+ny+oy);p.lineTo(bx-nx+ox,by-ny+oy);p.lineTo(ax-nx+ox,ay-ny+oy);p.closePath();}
 return p;
}
const stitch=(s:Sheet,ink:string|'paper',pts:Pt[],close:boolean,o:{len?:number;gap?:number;w?:number;progress?:number;tight?:number;seed?:number;cov?:number}={})=>{const p=stitchPath(pts,close,o);if(ink==='paper')s.knockout(p,o.cov??.9);else s.fill(ink,p,o.cov??.92);};
/** Shirt silhouette points (centre cx,cy; w sleeve to sleeve; h collar to hem). sleeve stretches the sleeves (goalkeeper). */
function shirtPts(cx:number,cy:number,w:number,h:number,seed=1,o:{sleeve?:number;turn?:number}={}):Pt[]{
 const{sleeve=1,turn=0}=o,sx=1-.35*Math.abs(turn);
 const raw:Pt[]=[[-.14,-.5],[-.33,-.46],[-.5*sleeve,-.36],[-.46*sleeve,-.17],[-.3,-.11],[-.3,.5],[.3,.5],[.3,-.11],[.46*sleeve,-.17],[.5*sleeve,-.36],[.33,-.46],[.14,-.5],[0,-.44]];
 return wob(raw.map(p=>[cx+p[0]*w*sx+turn*w*.06,cy+p[1]*h] as Pt),3,seed,true,{step:14,corner:.5});
}
/** A brush-stroke stencil numeral (one hand-cut stroke set, not type). n = 9 | 4 | 1. Height h; `echo` draws a misregistered echo at that offset (px units) for a plate slam that settles. */
function numeral(s:Sheet,n:number,x:number,y:number,h:number,ink:string|'paper',seed:number,o:{echo?:number;cov?:number;width?:number;slide?:number}={}){
 const{echo=0,cov=.95,width=h*.2,slide=0}=o,W=h*.62;
 const strokes:Pt[][]=[];
 if(n===9){const c:Pt=[x+W*.42+slide,y+h*.3],R=h*.26;const ring:Pt[]=[];for(let i=0;i<=20;i++){const a=-.3+i/20*Math.PI*2;ring.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}strokes.push([...ring,[c[0]+R*.95,c[1]+R*1.2],[x+W*.55+slide,y+h*.82],[x+W*.28+slide,y+h]]);}
 else if(n===4){strokes.push([[x+W*.66+slide,y],[x+W*.05+slide*.6,y+h*.66],[x+W*.9+slide,y+h*.66]]);strokes.push([[x+W*.64+slide,y+h*.34],[x+W*.64+slide,y+h]]);}
 else{strokes.push([[x+W*.18+slide,y+h*.26],[x+W*.5+slide,y],[x+W*.5+slide,y+h]]);}
 const draw=(dx:number,dy:number,c:number)=>{const p=new Path2D();strokes.forEach((st,i)=>p.addPath(ribbon(st.map(q=>[q[0]+dx,q[1]+dy] as Pt),width,{seed:seed+i,pressure:.5,taper:.35,wobble:3,step:10})));if(ink==='paper')s.knockout(p,c);else{if(ink===P)s.knockout(p,.8);s.fill(ink,p,c);}};
 if(echo>0)draw(echo,echo*.6,cov*.45);draw(0,0,cov);
}
/** A patch of another knit: hand-cut rect, ink field, its pattern (cable | seed | rib), an optional orange chevron row, a running-stitch seam around it. grow 0..1 scales it in. */
function patch(s:Sheet,x:number,y:number,w:number,h:number,kind:'cable'|'seed'|'rib',ink:string,seed:number,o:{grow?:number;seam?:number;row?:boolean;cov?:number}={}){
 const{grow=1,seam=1,row=false,cov=.55}=o;if(grow<=0)return;const g=easeOutBack(clamp(grow)),hw=w/2*g,hh=h/2*g;
 const pts=handCut([[x-hw,y-hh],[x+hw,y-hh],[x+hw,y+hh],[x-hw,y+hh]],seed,10,60),path=polyPath(pts,true);
 s.knockout(path);s.fill(ink,path,cov);
 s.save();s.clip(path);const p=new Path2D();
 if(kind==='cable'){for(let cx=x-hw+18;cx<x+hw;cx+=36){for(const side of[-1,1]){const q:Pt[]=[];for(let yy=y-hh;yy<=y+hh+12;yy+=12)q.push([cx+side*6+7*Math.sin((yy-y)/22+side),yy]);p.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)p.lineTo(q[i][0],q[i][1]);for(let i=q.length-1;i>=0;i--)p.lineTo(q[i][0]+5,q[i][1]);p.closePath();}}}
 else if(kind==='seed'){const rr=rng(seed+1);for(let yy=y-hh+8;yy<y+hh;yy+=17)for(let xx=x-hw+8+(Math.round((yy-y)/17)%2?8:0);xx<x+hw;xx+=17){const sz=4+rr()*3;p.rect(xx,yy,sz,sz);}}
 else{for(let xx=x-hw+6;xx<x+hw;xx+=20)p.rect(xx,y-hh,8,hh*2);}
 s.fill(K,p,.6);
 if(row){const q=new Path2D();let k=0;const top:Pt[]=[];for(let px=x-hw-26;px<=x+hw+26;px+=26,k++)top.push([px,y+(k%2?8:-8)]);q.moveTo(top[0][0],top[0][1]);for(let i=1;i<top.length;i++)q.lineTo(top[i][0],top[i][1]);for(let i=top.length-1;i>=0;i--)q.lineTo(top[i][0],top[i][1]+9);q.closePath();s.knockout(q,.9);s.fill(O,q,.9);}
 s.restore();
 if(seam>0)stitch(s,K,pts,true,{len:16,gap:11,w:5,progress:seam,seed:seed+2});
}
/** The stitched crest: a 5-panel ball drawn as running stitch (navy) on the chest. progress draws it; tight straightens the dashes. */
function crest(s:Sheet,x:number,y:number,r:number,seed:number,o:{progress?:number;tight?:number;sx?:number;sy?:number}={}){
 const{progress=1,tight=1,sx=1,sy=1}=o;s.save();s.translate(x,y);s.scale(sx,sy);
 s.knockout(polyPath(blob(0,0,r,r,seed,{amp:.02,n:32}),true),.35);
 stitch(s,K,blob(0,0,r,r,seed,{amp:.02,n:32}),true,{len:14,gap:9,w:6,progress:clamp(progress*1.4),tight,seed});
 const pent:Pt[]=[];for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*Math.PI*2;pent.push([Math.cos(a)*r*.36,Math.sin(a)*r*.36]);}
 stitch(s,K,pent,true,{len:11,gap:7,w:5,progress:clamp((progress-.3)*1.6),tight,seed:seed+1});
 const seams=new Path2D();for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*Math.PI*2;seams.addPath(stitchPath([[Math.cos(a)*r*.36,Math.sin(a)*r*.36],[Math.cos(a)*r*.92,Math.sin(a)*r*.92]],false,{len:10,gap:7,w:5,progress:clamp((progress-.55)*2.2),tight,seed:seed+2+i}));}
 s.fill(K,seams,.92);s.restore();
}
/** The collar tag: a paper rectangle with a stitched border, hinged at (x,y); angle 0 = tucked, ~1.2 = flipped out. */
function tag(s:Sheet,x:number,y:number,angle:number,seed:number){if(angle<=.02)return;s.save();s.translate(x,y);s.rotate(-angle);const w=130,h=80;const pts=wob([[-w/2,0],[w/2,0],[w/2,-h],[-w/2,-h]],2,seed,true,{step:12,corner:.4});s.knockout(polyPath(pts,true));stitch(s,K,pts,true,{len:9,gap:6,w:3,seed});s.restore();}
/** Bands of knit rows across the whole world (ch2/ch6): purple above, orange middle, yellow below, rust/olive at the overlaps. */
function bands(s:Sheet,offX:number,seed:number,o:{compress?:number;box?:[number,number,number,number];pucker?:[number,number,number,number][]}={}){
 const{compress=1,box=[-1400,-1400,2800,2800],pucker}=o;
 knit(s,P,[box[0],-1400,box[2],1240],seed,{offX,compress,pucker,cov:.4,rowCov:.32});
 knit(s,O,[box[0],-240,box[2],580],seed+1,{offX:offX*.8,compress,pucker,cov:.45,rowCov:.32});
 knit(s,Y,[box[0],300,box[2],1100],seed+2,{offX:offX*1.2,compress,pucker,cov:.5,rowCov:.35});
}
/** The dashed paper outline of a shirt in the team shape. */
const ghostShirt=(s:Sheet,x:number,y:number,w:number,h:number,seed:number,cov=.6)=>stitch(s,'paper',shirtPts(x,y,w,h,seed),true,{len:14,gap:10,w:6,cov,seed});
/** A filled team shirt (yellow / purple / orange knit) with a navy outline. */
function teamShirt(s:Sheet,x:number,y:number,w:number,h:number,ink:string,seed:number,o:{turn?:number;lean?:number;numeral?:number;crumple?:number}={}){
 const{turn=0,lean=0,numeral:n,crumple=0}=o;s.save();s.translate(x,y);s.rotate(lean);
 const pts=shirtPts(0,0,w,h,seed,{turn}),path=polyPath(pts,true);s.knockout(path);
 knit(s,ink,[-w/2,-h/2,w,h],seed,{spacing:Math.max(12,h*.11),period:Math.max(20,w*.18),amp:3,thick:3,clip:path,cov:.6,rowCov:.85,offX:crumple*10});
 s.knockout(polyPath(blob(turn*w*.06,-h*.46,w*.16,h*.05,seed+1,{amp:.05,n:16}),true));
 contour(s,K,pts,Math.max(4,w*.045),{close:true,seed:seed+2,pressure:.5,wobble:2});
 if(n)numeral(s,n,-w*.2+turn*w*.16,-h*.18,h*.5,K,seed+3,{width:h*.09,cov:.9});
 s.restore();
}

// ---------------- chapters ----------------
// ch1 — the back of a hanging shirt; three re-prints; the rows run out past the outline
const SW=1000,SH=920,HOOK:Pt=[0,-470];
function swing1(t:number){return(settle(t,.55,{amp:3,freq:.7,decay:.4})+settle(t,2.44,{amp:2,freq:.9,decay:.6})+settle(t,3.34,{amp:2,freq:.9,decay:.6})+settle(t,4.24,{amp:2,freq:.9,decay:.6}))*D;}
const ch1:Scene={
 draw(s,t){
  const sw=swing1(t);
  camKeys(s,t,[[0,0,-200,.95,0],[2.44,0,-240,1.05,0],[2.6,40,-60,1.08,0],[3.34,40,-60,1.08,0],[3.5,-40,-40,1.1,0],[4.24,-40,-40,1.1,0],[4.4,0,-20,1.12,0],[5.84,0,-20,1.12,0],[7.08,0,-20,1.12,3*D],[9.45,-300,-300,1.35,3*D],[10.1,-302,-302,1.352,3*D]]);
  s.field(Y,.12,0);
  // beyond the outline: rows run out on "much more to you" (one row per drawn frame, three inks, overprinting where they cross)
  const out=t<7.08?0:Math.min(12,Math.floor((t-7.08)*12)+1),relax=sm(7.08,8.2,t,easeOut);
  s.save();s.translate(HOOK[0],HOOK[1]);s.rotate(sw);s.translate(-HOOK[0],-HOOK[1]);
  if(out>0){const reach=easeIn(sm(7.08,8.6,t))*900;const clipB=polyPath(blob(0,40,SW/2+reach,SH/2+reach*.9,11,{amp:.06,n:40}),true);
   knit(s,O,[-1400,-1400,2800,2800],12,{clip:clipB,field:false,rowCov:.4,spacing:30+2*relax,offY:6});
   knit(s,Y,[-1400,-1400,2800,2800],13,{clip:clipB,field:false,rowCov:.35,spacing:31+2*relax,offY:22,offX:26,amp:8});
   if(out>5)knit(s,P,[-1400,-1400,2800,2800],14,{clip:clipB,field:false,rowCov:.3,spacing:33+2*relax,offY:14,offX:12,amp:10});}
  // the shirt: orange knit with drape, the outline, the collar, the hook
  const body=shirtPts(0,40,SW,SH,15,{sleeve:key(t,[[4.24,1],[4.5,1.28,easeOut],[5.84,1.28],[6.2,1]])}),bodyPath=polyPath(body,true);
  s.knockout(bodyPath);
  const pressed=t>=2.44?[[0,60,320,-6]] as [number,number,number,number][]:[];
  knit(s,O,[-SW*.7,-SH*.55,SW*1.4,SH*1.1],16,{clip:bodyPath,drape:10,spacing:lerp(30,32,relax),pucker:pressed,cov:.58});
  // three re-prints on twos: 9 + deep-orange stripe, 4 + rust bands, 1 + long sleeves and cuffs; then it settles on the 9
  const echoOf=(t0:number)=>6*(1-sm(t0,t0+.4,t,easeOut));
  const which=t<2.44?0:t<3.34?9:t<4.24?4:t<5.84?1:9;
  s.save();s.clip(bodyPath);
  if(which===9){const stripe=polyPath(wob([[-90,-380],[90,-380],[100,500],[-100,500]],3,17,true,{step:20,corner:.4}),true);s.fill(Y,stripe,.9);numeral(s,9,-100,-130,340,Y,18,{echo:echoOf(t<5.84?2.44:5.84)});}
  else if(which===4){for(const yy of[-260,-60,140]){s.fill(P,polyPath(wob([[-600,yy],[600,yy],[600,yy+70],[-600,yy+70]],3,19+yy,true,{step:30,corner:.4}),true),.85);}numeral(s,4,-100,-120,340,P,20,{echo:echoOf(3.34)});}
  else if(which===1){for(const sx of[-1,1]){s.fill(Y,polyPath(wob([[sx*560,-360],[sx*640,-360],[sx*640,-200],[sx*560,-200]],3,21,true,{step:20,corner:.4}),true),.9);}numeral(s,1,-100,-120,340,'paper',22,{echo:echoOf(4.24)});}
  s.restore();
  const sleeveCov=1-.3*sm(8.58,9.2,t);
  contour(s,K,body,13,{close:true,seed:23,pressure:.5,wobble:2,cov:sleeveCov});
  s.knockout(polyPath(blob(0,-380,120,42,24,{amp:.06,n:20}),true));
  // the tag flips out on "asks", back in on "describes a role"
  const flip=key(t,[[0,0],[.15,-.1],[.55,1.25,easeOut],[.7,1.05],[.85,1.15],[5.84,1.15],[6.14,0,easeIn]]);
  tag(s,0,-350,Math.max(0,flip),25);
  s.restore();
  s.fill(K,ribbon([[0,-470],[0,-620]],12,{seed:26,taper:.1,wobble:1}));s.fill(K,ribbon(blob(0,-660,44,44,27,{amp:.05,n:20}),12,{seed:27,close:true,wobble:1,gaps:[[.6,.75]]}));
 },
 aperture(t){const sw=swing1(t),c=rotPts([[0,-380]],sw,HOOK[0],HOOK[1])[0];return apertureDisc(c[0],c[1],60,12);},
};
// ch2 — the outline as a line on flowing bands; the crest stitched in; patches join outside
const ch2:Scene={
 draw(s,t){
  camKeys(s,t,[[0,0,-150,.9,0],[2.02,0,-150,1.0,0],[6.0,140,-150,1.1,2*D],[9.05,-80,-200,1.35,-4*D],[9.7,-81,-201,1.352,-4*D]]);
  const flow=t<2.02?0:40*(t-2.02)+(t>=1.87&&t<2.02?-6*Math.sin((t-1.87)/.15*Math.PI):0);
  const tight=sm(3.82,4.6,t,easeOut);
  bands(s,flow,31,{pucker:tight>0?[[-80,-60,300,4*tight]]:undefined});
  // the outline self-draws from the collar both ways
  const w=920,h=880,pts=shirtPts(0,0,w,h,32),n=pts.length,prog=sm(0,1.2,t,easeIO);
  const sway=(t>=2.02?2*Math.sin((t-2.02)*1.2):0)*D;
  s.save();s.rotate(sway);
  if(prog>0){const half=Math.floor(n/2);const left=pts.slice(0,half+1),right=[...pts.slice(half),pts[0]].reverse();const over=prog>=1?1:prog*(1+.03*(1-prog));
   const gaps:[number,number][]=t>=8.0?[[.18,.22],[.72,.76]]:[];
   if(prog>=1)contour(s,K,pts,15,{close:true,seed:33,pressure:.55,wobble:2,gaps});
   else{contour(s,K,partial(smoothPts(left,false,8),over),15,{seed:33,pressure:.55,wobble:2});contour(s,K,partial(smoothPts(right,false,8),over),15,{seed:34,pressure:.55,wobble:2});}}
  s.knockout(polyPath(blob(0,-420,110,40,35,{amp:.06,n:20}),true));
  if(t<.3)s.fill(K,polyPath(blob(0,-440,14+30*sm(0,.25,t),14+30*sm(0,.25,t),36,{amp:.05}),true));
  // the crest (3.82) pulls tight; the numeral prints beside it
  if(t>=3.82){crest(s,-80,-60,120,37,{progress:sm(3.82,4.6,t),tight});if(t>=4.4)numeral(s,9,60,-40,220,Y,38,{echo:6*(1-sm(4.4,4.8,t,easeOut))});}
  s.restore();
  // patches print one per .4 s and seam to their neighbours
  const pg=(i:number)=>sm(6.0+i*.4,6.5+i*.4,t);
  patch(s,-540,-360,300,250,'cable',Y,41,{grow:pg(0),seam:sm(6.5,7.0,t)});
  patch(s,540,-300,300,250,'seed',P,42,{grow:pg(1),seam:sm(6.9,7.4,t)});
  patch(s,-560,390,300,250,'rib',O,43,{grow:pg(2),seam:sm(7.3,7.8,t)});
  patch(s,560,370,300,250,'cable',P,44,{grow:pg(3),seam:sm(7.7,8.2,t)});
  const link=(a:Pt,b:Pt,t0:number,seed:number)=>{const p=sm(t0,t0+.4,t,easeOut);if(p>0)stitch(s,K,[a,[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)+10*(1-p)],b],false,{len:16,gap:11,w:6,progress:p,tight:p,seed});};
  link([-400,-300],[-300,-260],6.6,45);link([400,-260],[300,-240],7.0,46);link([-420,330],[-300,300],7.4,47);link([420,320],[300,300],7.8,48);
  confetti(s,['paper'],[-700,-700,1400,1400],8,49,{size:20});
 },
 aperture(){return apertureDisc(-80,-60,44,12);},
};
// ch3 — the changing-room peg wall: numeral re-printed, the shirt slides and folds, a purple panel presses, a thread snags, the quilt prints
function shirt3(t:number){const slide=anticipate(2.0,2.8,t,{back:.03,hold:.12,e:easeIO})*(t<2.0?0:1),x=lerp(0,180,clamp(slide))+(t>2.8?12*settle(t,2.8,{amp:1,freq:3,decay:4}):0),lift=(t>=2.0&&t<2.8?-6*Math.sin(clamp(slide)*Math.PI):0)+lerp(0,270,clamp(slide));
 const fold=t<2.9?0:t<3.15?1:t<3.4?2:t<8.36?3:t<8.6?2:t<8.85?1:0;const pend=(settle(t,.1,{amp:4,freq:.7,decay:.4})+settle(t,2.8,{amp:3,freq:.8,decay:.5})+settle(t,4.3,{amp:2,freq:.9,decay:1}))*D*(t<5.7?1:1-sm(5.7,6.3,t));
 return{x,lift,fold,pend};}
const ch3:Scene={
 draw(s,t){
  const {x,lift,fold,pend}=shirt3(t),press=anticipate(3.8,4.3,t,{back:.08,hold:.2,e:easeOut})*(t<3.8?0:1),held=t>=5.7;
  camKeys(s,t,[[0,0,-80,1.05,0],[2.0,0,-60,1.1,0],[2.9,240,40,1.15,0],[3.8,240,40,1.15,0],[4.3,240,60,1.2,6*D],[5.7,240,60,1.2,6*D],[8.36,200,40,1.22,0],[10.45,200,20,1.4,0],[11.1,201,19,1.402,0]]);
  // the wall: purple seed-stitch cloth
  s.field(P,.5,.4);const dots=new Path2D();const rr=rng(51);for(let yy=-1400;yy<1400;yy+=22)for(let xx=-1400+((yy/22)%2?11:0);xx<1400;xx+=22){dots.rect(xx,yy,5+rr()*2,5+rr()*2);}s.fill(K,dots,.45);
  // the quilt prints around the wall (8.36 →), one patch per drawn frame; the pressing panel becomes a patch
  const quilt=t<8.36?0:Math.min(10,Math.floor((t-8.36)*12)+1);
  const Q:[number,number,number,number,'cable'|'seed'|'rib',string][]=[[-560,-560,300,240,'cable',Y],[-200,-600,320,220,'rib',O],[180,-620,300,240,'seed',Y],[560,-560,300,240,'cable',O],[-620,-100,260,300,'rib',Y],[-600,300,300,260,'seed',O],[-260,520,320,240,'cable',Y],[140,540,320,240,'rib',P],[560,520,300,260,'seed',Y],[640,120,260,320,'cable',O]];
  Q.forEach((q,i)=>{if(i<quilt)patch(s,q[0],q[1],q[2],q[3],q[4],q[5],52+i,{grow:sm(8.36+i/12,8.7+i/12,t),seam:sm(8.6+i/12,9.1+i/12,t)});});
  // the rail, pegs and bench
  s.fill(K,ribbon([[-700,-280],[700,-280]],22,{seed:61,taper:0,pressure:.3,wobble:1.5,step:40}));
  for(const px of[-300,0,300])s.fill(K,ribbon([[px,-280],[px+16,-236]],14,{seed:62+px,taper:.3,wobble:1}));
  s.fill(K,polyPath(wob([[-700,260],[700,260],[700,300],[-700,300]],3,63,true,{step:40,corner:.4}),true),.9);
  // the pressing panel (3.8): enters from the left, presses the folded shirt, stops when the feeling is contoured, is absorbed at 8.36
  const panelX=lerp(-900,120,clamp(press))+(t>4.3?-8*settle(t,4.3,{amp:1,freq:3,decay:4}):0),absorbed=sm(8.36,9.0,t);
  if(t>=3.8){const pw=260*(1-.2*absorbed),ppts=handCut([[panelX-pw,-500],[panelX,-500],[panelX,400],[panelX-pw,400]],64,14,80);const pp=polyPath(ppts,true);s.knockout(pp);knit(s,P,[panelX-pw,-500,pw,900],65,{clip:pp,cov:.62,rowCov:.85});if(absorbed>0)stitch(s,K,ppts,true,{len:16,gap:11,w:5,progress:absorbed,seed:66});}
  // the shirt on its peg: numeral 9 → 4, slides to the far peg, folds, is pressed, unfolds
  const hookX=x,hookY=-236+lift;
  s.save();s.translate(hookX,hookY);s.rotate(pend);
  const w=480,h=540,foldH=[h,h*.72,h*.5,h*.42][fold],squash=1-.08*clamp(press)*(fold===3?1:0),compress=[1,.8,.6,.47][fold]*(1-.1*clamp(press));
  const pts=shirtPts(0,foldH*squash/2,w*(fold===0?1:.9),foldH*squash,67+fold);
  const path=polyPath(pts,true);s.knockout(path);
  const snagPt:[number,number,number,number][]=press>0?[[w*.2,foldH*.4,220,10*clamp(press)]]:[];
  knit(s,O,[-w*.55,-20,w*1.1,h+40],69,{clip:path,cov:.58,compress,pucker:snagPt,drape:fold===0?8:0});
  s.save();s.clip(path);
  if(t<.4){numeral(s,9,-90,120,300,Y,70,{});s.fill(Y,polyPath(wob([[-70,-10],[70,-10],[70,560],[-70,560]],3,71,true,{step:20,corner:.4}),true),.9);}
  else if(fold===0){for(const yy of[80,220,360])s.fill(P,polyPath(wob([[-300,yy],[300,yy],[300,yy+50],[-300,yy+50]],3,72+yy,true,{step:30,corner:.4}),true),.85);numeral(s,4,-90,120,300,P,73,{echo:6*(1-sm(.4,.8,t,easeOut)),cov:lerp(.95,.5,sm(2.0,2.8,t))});}
  else{for(const yy of[40,120,200].slice(0,fold===3?2:3))s.fill(P,polyPath(wob([[-300,yy*compress+20],[300,yy*compress+20],[300,yy*compress+50],[-300,yy*compress+50]],3,74+yy,true,{step:30,corner:.4}),true),.85);numeral(s,4,-70,40,150*compress+80,P,73,{cov:.5});}
  s.restore();
  contour(s,K,pts,10,{close:true,seed:75,pressure:.5,wobble:2});
  if(fold===0)s.knockout(polyPath(blob(0,20,60,22,76,{amp:.06,n:16}),true));
  s.restore();
  // the player on the bench: sits slumped once the shirt is set down beside it; on "whole value" it sits up
  if(t>=2.4){const sitUp=sm(8.36,8.9,t,easeOutBack),slL=poseLimbs('sitSlump'),siL=poseLimbs('sit');person(s,470,262,320,O,80,'sitSlump',{facing:-1,arms:mixLimbs(slL.arms,siL.arms,sitUp),tilt:-.3*sitUp+.02*Math.sin(t*1.5),headDrop:[.05*(1-sitUp),.07*(1-sitUp)]});}
  // the snag: a thread pulls out of the knit, arcs with overshoot, is contoured (5.7) and finally stitched into a seam (9.76)
  const pull=t<4.0?0:easeOutBack(sm(4.0,4.5,t)),loop:Pt[]=[[hookX+w*.2,hookY+80],[hookX+w*.2-60*pull,hookY+40-140*pull],[hookX-160*pull,hookY+40-100*pull],[hookX-190*pull,hookY+180*pull+20]];
  if(pull>0){const line=smoothPts(loop,false,8);s.fill(O,ribbon(line,7,{seed:77,pressure:.4,taper:.3,wobble:1.5}),.95);const c=sm(5.7,6.3,t,easeOut);if(c>0)contour(s,K,partial(line,c),13,{seed:78,pressure:.6,wobble:1.5,cov:.95});
   const sew=sm(9.76,10.3,t,easeOut);if(sew>0)stitch(s,K,[loop[3],[loop[3][0]-90,loop[3][1]+60],[loop[3][0]-200,loop[3][1]+80]],false,{len:16,gap:11,w:6,progress:sew,tight:sew,seed:79});}
  void held;
 },
 aperture(t){const {x,lift,fold}=shirt3(t);const hy=-236+lift;return apertureDisc(x,hy+(fold===0?260:100),60,12);},
};
// ch4 — NEW ROLE: the pitch as olive cloth: I (orange, wearing the 4) turn to the coach, run along the stitched lane to stand beside a yellow
// teammate, and turn my head before the crest-ball arrives
function me4(t:number){const move=anticipate(4.02,5.02,t,{back:.05,hold:.15,e:easeIO})*(t<4.02?0:1),over=t>5.02?10*settle(t,5.02,{amp:1,freq:3,decay:4}):0;const x=lerp(-160,90,clamp(move))+over*.4,y=lerp(200,-30,clamp(move))+over*.6;const turn=t<6.94?0:anticipate(6.94,7.4,t,{back:.13,hold:.3,e:easeIO});return{x,y,move,turn,moving:move>0&&move<1};}
const ch4:Scene={
 draw(s,t){
  const m=me4(t),st=stride(twosIndex(t));
  camKeys(s,t,[[0,-100,80,1.05,0],[2.2,-160,60,1.12,0],[3.1,-260,40,1.15,0],[4.02,-100,120,1.17,0],[5.52,20,20,1.22,0],[6.94,20,20,1.22,0],[9.45,60,-40,1.45,-12*D],[10.1,61,-41,1.452,-12*D]]);
  // olive cloth: yellow × purple with navy chevron rows as mown stripes
  s.field(Y,1,.45);s.field(P,.45,.3);
  knit(s,K,[-1400,-1400,2800,2800],81,{field:false,rowCov:.3,spacing:34,period:60,amp:10,thick:6,pucker:m.moving?[[m.x,m.y,200,6]]:undefined});
  // chalk lines as paper running stitch
  stitch(s,'paper',[[-900,-60],[900,-60]],false,{len:26,gap:14,w:14,seed:82,cov:.9});
  stitch(s,'paper',blob(0,-60,190,190,83,{amp:.015,n:36}),true,{len:22,gap:12,w:14,seed:83,cov:.9});
  stitch(s,'paper',[[-470,-900],[-470,900]],false,{len:26,gap:14,w:14,seed:84,cov:.9});
  // the position spots: the empty one pulses on the ask, firms when I fill it
  const firm=sm(4.9,5.4,t),pulse=t>=.6&&t<2.0?.6+.3*(twosIndex(t)%4<2?1:0):.6;
  spot(s,90,-30,70,86,m.move>=1?.95:pulse);
  for(const[gx,gy] of[[-320,60],[300,-260],[100,-380]])spot(s,gx,gy,60,87+gx+gy,.45+.3*firm);
  // the coach: taller, purple, pointing at the empty spot on "ask what the team needs"
  const coachPt=sm(.6,1.0,t,easeOut)*(1-sm(3.6,4.0,t)),stL=poseLimbs('stand'),pL=poseLimbs('point');
  person(s,-380,-120,360,P,88,'stand',{facing:1,arms:mixLimbs(stL.arms,pL.arms,coachPt),tilt:-.04*coachPt+.015*Math.sin(t*1.4)});
  // the stitched lane: from my hem to the gap (2.2), then bending round the opponent to the yellow teammate (5.52); the crest-ball passed along it (7.4)
  const lay=sm(2.4,3.2,t,easeOut),tie=sm(5.52,6.4,t,easeOut),tighten=sm(8.54,8.84,t);
  if(lay>0)stitch(s,K,smoothPts([[-160,200],[-60,120],[40,20],[90,-30]],false,10),false,{len:16,gap:11,w:6,progress:lay,tight:.5+.5*lay,seed:89});
  const route:Pt[]=[[m.x+40,m.y-20],[150,-50],[200,-80],[240,-100]];
  if(tie>0){stitch(s,K,smoothPts(route,false,10),false,{len:16,gap:11,w:6,progress:tie,tight:.4+.6*tighten,seed:90});if(tie>.9){s.fill(Y,ribbon(smoothPts(route,false,10),10,{seed:91,taper:.4,wobble:1.5}),.4*clamp((tie-.9)*10));s.fill(K,ribbon(blob(240,-100,16,16,92,{amp:.05,n:14}),5,{seed:92,close:true,wobble:1}),.95);}}
  // teammates (yellow) and opponents (purple, one closes late and crumples)
  person(s,300,-60,250,Y,93,'stand',{facing:-1,tilt:.02*Math.sin(t*1.7)});person(s,-300,-300,250,Y,94,'stand',{facing:1});
  const close=sm(7.2,7.9,t,easeIn)*70,crumple=sm(7.9,8.3,t);
  person(s,40,120,250,P,95,'lean',{facing:1});person(s,-40,-260+close,250,P,96,close>0&&close<70?'run':'lean',{facing:1,legs:close>0&&close<70?st.legs:undefined,arms:close>0&&close<70?st.arms:undefined,tilt:.16+.1*crumple});
  // me: turn to the coach (.6), run the lane on "where to move" (stride + smear), turn my head on "before receiving", cushion the crest-ball
  const toCoach=sm(.6,1.0,t,easeOut),cush=t>=8.1&&t<8.3?.06:0;
  const facing=m.moving?1:t<4.02?(toCoach>.5?-1:1):-1;
  person(s,m.x,m.y+110,300,O,97,m.moving?'run':m.turn>.3?'lookBack':'stand',{facing,legs:m.moving?st.legs:undefined,arms:m.moving?st.arms:undefined,head:!m.moving&&m.turn>0?[-.12*clamp(m.turn),-.82]:undefined,tilt:(m.moving?.12:0)+(t>=8.1&&t<8.5?.05*Math.sin((t-8.1)/.4*Math.PI*2):0)+cush,scaleX:1+cush,numeral:true});
  if(m.moving&&m.move<.6)speedLines(s,K,m.x-50,m.y-40,Math.atan2(-230,250),{n:4,seed:98,len:110,spread:50,width:6,cov:.85});
  const flip=key(t,[[0,0],[.15,-.1],[.55,1.2,easeOut],[.7,1.0],[4.02,1.0],[4.3,0]]);tag(s,m.x-10,m.y-100,Math.max(0,flip),99);
  // the crest-ball travels dash by dash from the yellow teammate to me (7.4 → 8.1) and is cushioned at my feet
  const pass=sm(7.4,8.1,t,easeOut),path=smoothPts(route,false,10),k=Math.floor((1-pass)*(path.length-1)),bp=path[Math.max(0,Math.min(path.length-1,k))];
  crest(s,pass>=1?m.x+60:bp[0]+40,pass>=1?m.y+70:bp[1]-20,44,100,{tight:1});
 },
 aperture(t){const m=me4(t);return apertureDisc(m.x+clamp(m.turn)*12,m.y-130,42,12);},
};
// ch5 — the pitch as a quilt: the running stitch travels from me to three positions, then off the pitch to three large patches: friends
// (two paper figures), interests (a cable knit with an orange row) and people who know you (a tall and a small figure)
const R5:[number,number][]=[[-260,260],[260,-200],[0,420],[0,-330],[0,-560],[-40,-760],[0,-900]];
function tip5(t:number):Pt{const legs=[[0,1.2],[1.2,2.2],[2.2,3.2],[4.06,5.2],[5.2,6.4],[6.4,7.66]];for(let i=0;i<legs.length;i++){const[a,b]=legs[i];if(t<b){const u=sm(a,b,t,easeIO),p=R5[i],q=R5[i+1];return[lerp(p[0],q[0],u),lerp(p[1],q[1],u)];}}return R5[6];}
const ch5:Scene={
 draw(s,t){
  const tip=tip5(t);
  // the camera follows the stitch tip with a rest after every leg
  camKeys(s,t,[[0,-260,260,1,0],[1.2,260,-200,1.05,0],[2.0,260,-200,1.05,0],[2.2,0,420,1.05,0],[3.0,0,420,1.05,0],[3.2,0,-330,1.1,0],[4.06,0,-330,1.1,0],[5.2,0,-560,1.14,2*D],[6.0,0,-560,1.14,2*D],[7.66,-20,-760,1.2,4*D],[8.5,-20,-760,1.2,4*D],[10.05,0,-880,1.4,0],[10.7,0,-881,1.402,0]]);
  s.field(Y,1,.45);s.field(P,.45,.3);
  knit(s,K,[-1400,-1600,2800,3000],101,{field:false,rowCov:.3,spacing:34,period:60,amp:10,thick:6});
  // beyond the touchlines: four large quilt patches as context
  const Q:[number,number,number,number,'cable'|'seed'|'rib',string][]=[[-580,-150,300,340,'cable',Y],[-580,260,300,340,'seed',P],[580,-150,300,340,'seed',O],[580,260,300,340,'cable',P]];
  Q.forEach((q,i)=>patch(s,q[0],q[1],q[2],q[3],q[4],q[5],102+i,{cov:.45}));
  stitch(s,'paper',[[-360,-500],[360,-500],[360,500],[-360,500],[-360,-500]],false,{len:26,gap:14,w:14,seed:110,cov:.9});
  stitch(s,'paper',[[-360,0],[360,0]],false,{len:26,gap:14,w:14,seed:111,cov:.9});
  // the three positions my curiosity travels to: dashed spots that firm as the stitch reaches them
  const reached=(i:number)=>i===1?sm(1.1,1.3,t):i===2?sm(2.1,2.3,t):i===3?sm(3.1,3.3,t):0;
  for(const i of[1,2,3])spot(s,R5[i][0],R5[i][1],70,120+i,.45+.5*reached(i));
  // beyond football: three big patches print as the thread reaches them
  patch(s,0,-640,360,240,'cable',Y,112,{grow:sm(4.6,5.1,t),seam:sm(5.0,5.5,t)});
  const friends=sm(5.1,5.5,t,easeOutBack);if(friends>0){person(s,-60,-560,150*Math.min(1,friends),'paper',113,'lean',{facing:1,paperTone:.2});person(s,60,-560,150*Math.min(1,friends),'paper',114,'lean',{facing:-1,paperTone:.2});}
  patch(s,-250,-860,300,240,'rib',P,115,{grow:sm(6.4,6.9,t),seam:sm(6.8,7.3,t),row:true});
  patch(s,250,-860,300,240,'seed',O,116,{grow:sm(7.66,8.1,t),seam:sm(8.0,8.5,t),row:true});
  const known=sm(8.1,8.5,t,easeOutBack);if(known>0){person(s,220,-780,190*Math.min(1,known),'paper',117,'stand',{facing:1,paperTone:.2});person(s,300,-780,130*Math.min(1,known),'paper',118,'stand',{facing:-1,paperTone:.2});}
  const closeSeam=sm(9.26,9.9,t,easeOut);if(closeSeam>0){stitch(s,K,[[-330,-780],[-90,-800]],false,{len:16,gap:11,w:6,progress:closeSeam,tight:closeSeam,seed:119});stitch(s,K,[[330,-780],[90,-800]],false,{len:16,gap:11,w:6,progress:closeSeam,tight:closeSeam,seed:120});}
  // me at the start, unpicking my stitched marks into the thread
  person(s,-260,300,260,O,140,'stand',{facing:1,numeral:true,tilt:.02*Math.sin(t*1.6)});
  // the travelling thread (running stitch, tip leading) and its knot at the end
  const legEnd=[1.2,2.2,3.2,5.2,6.4,7.66];let done=0;for(let i=0;i<legEnd.length;i++)if(t>=legEnd[i])done=i+1;
  const pts:Pt[]=[...R5.slice(0,done+1),tip];
  if(t>.4)stitch(s,K,pts,false,{len:16,gap:11,w:6,tight:.7,seed:141});
  s.fill(K,polyPath(blob(tip[0],tip[1],9,9,142,{amp:.1,n:10}),true));
  const knot=sm(7.66,8.0,t,easeOutBack);if(knot>0)s.fill(K,ribbon(blob(0,-900,18*knot,18*knot,143,{amp:.05,n:14}),6,{seed:143,close:true,wobble:1}),.95);
 },
 aperture(){return apertureDisc(0,-1010,60,12);},
};
// ch6 — the outline squeezed, pushing back, opening into a dashed line while the rows flow through
const ch6:Scene={
 draw(s,t){
  const push=anticipate(.98,1.38,t,{back:.06,hold:.25,e:easeIn})*(t<.98?0:1),back=t<1.88?0:spring(t-1.88,1.6,.5);
  const v=camKeys(s,t,[[0,0,0,.95,0],[.98,0,0,1.0,0],[1.88,0,0,1.06,3*D],[5.42,0,-40,1.12,0],[7.65,-60,-40,1.2,0],[8.3,-61,-41,1.202,0]]);
  void v;
  const flow=t<5.42?0:40*(t-5.42);
  const compress=lerp(1,.72,clamp(push))*(back>0?lerp(1,1/lerp(1,.72,clamp(push)),clamp(back)):1);
  bands(s,flow,151,{compress});
  // patches around take my orange row as the rows flow out
  const rowOut=t>=5.42;
  patch(s,-560,-400,300,250,'cable',Y,152,{row:rowOut});patch(s,560,-380,300,250,'seed',P,153,{row:rowOut});patch(s,-580,420,300,250,'rib',O,154,{row:rowOut});patch(s,580,400,300,250,'cable',P,155,{row:rowOut});
  // two purple panels push in, are shoved out with torn edges when the outline pushes back
  const px=lerp(320,280,clamp(push))+240*clamp(back),tear=clamp(back);
  for(const side of[-1,1]){const pts=handCut([[side*px,-700],[side*(px+700),-700],[side*(px+700),700],[side*px,700]],156+side,14+40*tear,90);const pp=polyPath(pts,true);s.knockout(pp);knit(s,P,[Math.min(side*px,side*(px+700)),-700,700,1400],158+side,{clip:pp,cov:.62,rowCov:.85});}
  // the outline: shrinks to fit, then breaks into a dashed line and expands with overshoot
  const scale=lerp(1,.8,clamp(push))*(back>0?lerp(1,1.6,clamp(back)):1),w=700*scale,h=760*scale;
  const pts=shirtPts(0,0,w,h,160);
  if(back<=0)contour(s,K,pts,14,{close:true,seed:161,pressure:.55,wobble:2});
  else stitch(s,K,pts,true,{len:120,gap:40,w:14,seed:162,cov:lerp(.95,.6,sm(6.82,7.5,t))});
  s.knockout(polyPath(blob(0,-h*.46,w*.13,h*.045,163,{amp:.06,n:20}),true));
  // inside: the crest (squashed by the press) and the numeral, re-stitched on "keep learning"
  const sq=1-.06*clamp(push)*(1-clamp(back));
  crest(s,-60,-40,96,164,{sx:sq,sy:2-sq,tight:1});
  const restitch=sm(0,.6,t,easeOut);
  stitch(s,K,[[110,-40],[60,80],[190,80]],false,{len:12,gap:8,w:5,progress:restitch,seed:165});stitch(s,K,[[176,20],[176,140]],false,{len:12,gap:8,w:5,progress:restitch,seed:166});
  if(t>=.5)numeral(s,4,70,-50,190,P,167,{echo:6*(1-sm(.5,.9,t,easeOut))});
  // the tag flips once at the end (end card)
  const flip=key(t,[[7.65,0],[7.95,1.2,easeOut],[8.1,1.0],[8.3,1.05]]);if(t>=7.65)tag(s,0,-h*.42,flip,168);
  confetti(s,['paper'],[-700,-700,1400,1400],6,169,{size:18});
 },
 still:6.9,
};

export const story:RisoStory={
 id:'more-shirt',format:'11v11',title:'More Than a Shirt',theme:'You are more than your position',ageNote:'Direct reflections for older youth, roughly 12 and up; playing format does not define age.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',purple:'#765ba7',navy:'#22366b'},order:['yellow','orange','purple','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:[
  {label:'More than a role',narration:'When someone asks what you play, you might say striker, defender, or goalkeeper. That describes a role. There is much more to you.',seconds:10.1,audio:CH+'01.m4a',cues:[{at:0,words:'When someone asks'},{at:2.44,words:'striker, defender'},{at:7.08,words:'much more to you'}]},
  {label:'An open outline',headline:'No boundary',narration:'Think of a shirt as an outline, not a boundary. It holds one part of your life without containing everything you can become.',seconds:9.7,audio:CH+'02.m4a',cues:[{at:0,words:'Think of a shirt'},{at:2.02,words:'not a boundary'},{at:6,words:'everything you can become'}]},
  {label:'When things change',headline:'Whole',narration:'A different position, less playing time, or a difficult match can feel personal. Those feelings matter. They do not decide your whole value.',seconds:11.1,audio:CH+'03.m4a',cues:[{at:0,words:'A different position'},{at:5.7,words:'Those feelings matter'},{at:8.36,words:'whole value'}]},
  {label:'Ask and learn',headline:'New role',narration:'If your role changes, ask what the team needs from you. Learn where to move, who to support, and what to notice before receiving.',seconds:10.1,audio:CH+'04.m4a',cues:[{at:0,words:'If your role changes'},{at:4.02,words:'where to move'},{at:6.94,words:'before receiving'}]},
  {label:'Carry your strengths',narration:'Your curiosity and care can travel into any position. Beyond football, make room for friends, interests, and people who know you.',seconds:10.7,audio:CH+'05.m4a',cues:[{at:0,words:'Your curiosity'},{at:4.06,words:'Beyond football'},{at:7.66,words:'people who know you'}]},
  {label:'Keep some room',headline:'Grow',narration:'Keep learning your role without shrinking yourself to fit it. You are a player, and a person with room to grow.',seconds:8.3,audio:CH+'06.m4a',cues:[{at:0,words:'Keep learning'},{at:.98,words:'without shrinking'},{at:5.42,words:'room to grow'}]},
 ],
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4,ch5,ch6]);},
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*Math.PI*2;
  const out=age<=0?1:easeOutBack(clamp(age/.25))*(1-sm(.5,.8,age)),ex=x+Math.cos(a)*190*out,ey=y+Math.sin(a)*190*out;
  const loop:Pt[]=[[x-40,y+20],[lerp(x,ex,.6)-40*out,lerp(y,ey,.6)],[ex,ey],[lerp(x,ex,.6)+40*out,lerp(y,ey,.6)],[x+40,y-20]];
  s.knockout(ribbon(smoothPts(loop,false,6),22,{seed,pressure:.4,taper:.3,wobble:1.5}),.95);
  s.fill(O,ribbon(smoothPts(loop,false,6),7,{seed:seed+2,pressure:.4,taper:.3,wobble:1.5}),.95);
  const st=age<=0?1:sm(.3,.8,age);if(st>0)stitch(s,O,[[x-140,y+50],[x+140,y-70]],false,{len:20,gap:12,w:10,progress:st,tight:st,seed:seed+1});
 },
};
