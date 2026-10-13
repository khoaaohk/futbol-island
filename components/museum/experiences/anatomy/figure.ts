import {depthOf,iso,type Flat,type LineTone,type Point3,type Projection,type SolidPaths,type Tone as KTone} from './iso-kit';

/**
 * Paper figures (Oct 12 2026, anatomy "Paper" restyle; user: every exhibit except the penalty kick is an isometric technical
 * illustration, players "simple isometric figures in the same paper-and-hairline style", fouls "crystal clear"). Pure: no DOM,
 * so the exhibit tests run it in Node. Used by cards-1970, var-2018 and backpass-1992.
 *
 * A figure is an artist's wooden mannequin: every limb is a solid capsule (a paper body with a hairline outline and a lighter
 * band toward the light), the head a ball. World units are centimetres (x, y on the floor, z up), so a player is 180 tall.
 * Angles are authored in degrees and measured from the world, not from the parent limb, so a pose reads like a drawing:
 *  - lean: the torso tips forward (+) or back (−); roll: it tips to the figure's left (+);
 *  - hip*: the thigh from straight down, forward (+); knee*: how far the shin folds back from the thigh;
 *  - sh*: the upper arm from straight down, forward (+); el*: the forearm folds forward from it; ab*: the arm swings out sideways;
 *  - air: height off the ground (a jump, a two-footed lunge). The lowest point of the body otherwise rests on the floor.
 */
export type Pose={lean:number;roll:number;hipL:number;kneeL:number;hipR:number;kneeR:number;shL:number;elL:number;shR:number;elR:number;abL:number;abR:number;air:number};
export type PoseName='stand'|'runA'|'runB'|'slide'|'studs'|'stumble'|'fall'|'lie'|'kick'|'trip'|'push'|'reach'|'armUp'|'charge'|'hurdle'|'point'|'card'|'whistle'|'held'|'ready'|'catch'|'pass'|'header'|'sleep'|'crouch';
const Z:Pose={lean:0,roll:0,hipL:0,kneeL:0,hipR:0,kneeR:0,shL:0,elL:0,shR:0,elR:0,abL:0,abR:0,air:0};
const p=(o:Partial<Pose>):Pose=>({...Z,...o});
export const POSES:Record<PoseName,Pose>={
 stand:p({lean:3,hipL:3,kneeL:4,hipR:-3,kneeR:4,shL:-6,elL:14,shR:6,elR:14,abL:6,abR:6}),
 runA:p({lean:14,hipL:38,kneeL:30,hipR:-30,kneeR:75,shL:-38,elL:75,shR:40,elR:70,abL:6,abR:6}),
 runB:p({lean:14,hipL:-30,kneeL:75,hipR:38,kneeR:30,shL:40,elL:70,shR:-38,elR:75,abL:6,abR:6}),
 charge:p({lean:16,roll:12,hipL:30,kneeL:35,hipR:-25,kneeR:60,shL:-20,elL:60,shR:25,elR:50,abL:4,abR:16}),
 slide:p({lean:-48,hipL:84,kneeL:0,hipR:30,kneeR:112,shL:-40,elL:10,shR:-62,elR:6,abL:20,abR:28}),
 studs:p({lean:-42,hipL:80,kneeL:-6,hipR:74,kneeR:-6,shL:-50,elL:20,shR:-50,elR:20,abL:34,abR:34,air:14}),
 stumble:p({lean:34,hipL:18,kneeL:46,hipR:-52,kneeR:24,shL:55,elL:30,shR:80,elR:20,abL:28,abR:28}),
 fall:p({lean:62,hipL:-22,kneeL:30,hipR:-44,kneeR:14,shL:118,elL:8,shR:124,elR:8,abL:16,abR:16}),
 lie:p({lean:86,hipL:-86,kneeL:8,hipR:-82,kneeR:22,shL:150,elL:6,shR:140,elR:16,abL:22,abR:26}),
 kick:p({lean:-12,hipL:-6,kneeL:10,hipR:72,kneeR:4,shL:30,elL:20,shR:-30,elR:20,abL:36,abR:36}),
 trip:p({lean:-6,hipL:48,kneeL:0,hipR:-8,kneeR:24,shL:-24,elL:30,shR:20,elR:30,abL:24,abR:24}),
 push:p({lean:18,hipL:26,kneeL:16,hipR:-28,kneeR:20,shL:88,elL:2,shR:88,elR:2,abL:4,abR:4}),
 reach:p({lean:10,hipL:24,kneeL:22,hipR:-24,kneeR:30,shL:72,elL:4,abL:-4,shR:-24,elR:40,abR:8}),
 armUp:p({lean:0,hipL:4,kneeL:6,hipR:-4,kneeR:6,shL:12,elL:10,shR:168,elR:6,abL:10,abR:14}),
 hurdle:p({lean:18,hipL:70,kneeL:90,hipR:-40,kneeR:100,shL:-20,elL:60,shR:60,elR:40,abL:22,abR:22,air:26}),
 point:p({lean:-4,hipL:4,kneeL:4,hipR:-4,kneeR:4,shL:160,elL:6,shR:160,elR:6,abL:18,abR:18}),
 card:p({lean:0,hipL:3,kneeL:3,hipR:-3,kneeR:3,shL:-6,elL:14,shR:172,elR:2,abL:6,abR:6}),
 whistle:p({lean:2,hipL:3,kneeL:4,hipR:-3,kneeR:4,shL:-8,elL:14,shR:40,elR:120,abL:6,abR:12}),
 held:p({lean:-14,hipL:30,kneeL:30,hipR:-40,kneeR:30,shL:60,elL:30,shR:-30,elR:40,abL:30,abR:30}),
 ready:p({lean:16,hipL:16,kneeL:34,hipR:-12,kneeR:34,shL:30,elL:30,shR:30,elR:30,abL:26,abR:26}),
 catch:p({lean:6,hipL:8,kneeL:12,hipR:-6,kneeR:12,shL:70,elL:40,shR:70,elR:40,abL:8,abR:8}),
 pass:p({lean:-6,hipL:-4,kneeL:10,hipR:42,kneeR:10,shL:30,elL:20,shR:-24,elR:20,abL:30,abR:30}),
 header:p({lean:-18,hipL:6,kneeL:20,hipR:-10,kneeR:30,shL:40,elL:60,shR:40,elR:60,abL:30,abR:30,air:10}),
 sleep:p({lean:-4,hipL:2,kneeL:2,hipR:-2,kneeR:2,shL:4,elL:4,shR:4,elR:4,roll:6}),
 crouch:p({lean:30,hipL:62,kneeL:110,hipR:40,kneeR:100,shL:40,elL:30,shR:40,elR:30,abL:16,abR:16}),
};
export function mixPose(a:Pose,b:Pose,u:number):Pose{const o={} as Pose;for(const k of Object.keys(Z) as (keyof Pose)[])o[k]=a[k]+(b[k]-a[k])*u;return o;}
/** A running pose at film time t (two strides a second, eased between the two halves). */
export const runAt=(t:number,phase=0)=>mixPose(POSES.runA,POSES.runB,(1-Math.cos((t*2.1+phase)*Math.PI))/2);

/** Kits: the shirt tone tells the teams apart without colour (white #9, grey #4, dark referee, mid keeper). */
export type Kit='light'|'grey'|'dark'|'keeper';
export type Fig={id:string;x:number;y:number;/** heading on the floor, degrees (0 = +x) */h:number;pose:Pose;kit:Kit;
 /** something in the right hand: a card (accent) */card?:'yellow'|'red'};

const R=Math.PI/180;
type V=Point3;
const add=(a:V,b:V):V=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul=(a:V,k:number):V=>[a[0]*k,a[1]*k,a[2]*k];
const norm=(a:V):V=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
const mix3=(...ps:[V,number][]):V=>ps.reduce<V>((s,[v,k])=>add(s,mul(v,k)),[0,0,0]);

export const BODY={pelvis:92,torso:52,head:11,neck:16,shoulder:19,hip:9,thigh:44,shin:44,foot:19,upper:29,fore:27};
export type Joints={pelvis:V;neck:V;head:V;hipL:V;kneeL:V;ankleL:V;toeL:V;hipR:V;kneeR:V;ankleR:V;toeR:V;shL:V;elbowL:V;handL:V;shR:V;elbowR:V;handR:V;
 up:V;fwd:V;left:V;soleL:V;soleR:V;footL:V;footR:V};
/** Where every joint is. The body rests on the floor: its lowest point (minus that part's radius) sits at z = 0 + air. */
export function joints(f:Fig):Joints{
 const q=f.pose,h=f.h*R,fw:V=[Math.cos(h),Math.sin(h),0],lf:V=[-Math.sin(h),Math.cos(h),0],up:V=[0,0,1];
 const L=q.lean*R,Ro=q.roll*R,u=norm(mix3([fw,Math.sin(L)],[lf,Math.sin(Ro)*Math.cos(L)],[up,Math.cos(L)*Math.cos(Ro)]));
 const pelvis:V=[0,0,BODY.pelvis],neck=add(pelvis,mul(u,BODY.torso)),head=add(neck,mul(u,BODY.neck));
 const leg=(a:number):V=>mix3([fw,Math.sin(a*R)],[up,-Math.cos(a*R)]);
 const foot=(b:number):V=>mix3([fw,Math.cos(b*R)],[up,Math.sin(b*R)]),sole=(b:number):V=>mix3([fw,Math.sin(b*R)],[up,-Math.cos(b*R)]);
 const legOf=(side:1|-1,hipA:number,knee:number)=>{const hip=add(pelvis,mul(lf,side*BODY.hip)),k=add(hip,mul(leg(hipA),BODY.thigh)),b=hipA-knee,an=add(k,mul(leg(b),BODY.shin)),fd=foot(b);
  return {hip,knee:k,ankle:an,toe:add(an,mul(fd,BODY.foot)),sole:sole(b),foot:fd};};
 const arm=(side:1|-1,a:number,el:number,ab:number)=>{const sh=add(add(neck,mul(u,-7)),mul(lf,side*BODY.shoulder)),out=mul(lf,side);
  const dir=(x:number)=>norm(add(mul(mix3([fw,Math.sin(x*R)],[up,-Math.cos(x*R)]),Math.cos(ab*R)),mul(out,Math.sin(ab*R))));
  const e=add(sh,mul(dir(a),BODY.upper));return {sh,elbow:e,hand:add(e,mul(dir(a+el),BODY.fore))};};
 const l=legOf(1,q.hipL,q.kneeL),r=legOf(-1,q.hipR,q.kneeR),al=arm(1,q.shL,q.elL,q.abL),ar=arm(-1,q.shR,q.elR,q.abR);
 const pts:[V,number][]=[[pelvis,15],[neck,14],[head,BODY.head],[l.knee,8],[r.knee,8],[l.ankle,6],[r.ankle,6],[l.toe,4.5],[r.toe,4.5],[al.elbow,5.5],[ar.elbow,5.5],[al.hand,4.5],[ar.hand,4.5]];
 const low=Math.min(...pts.map(([v,rad])=>v[2]-rad)),lift=-low+q.air;
 const at=(v:V):V=>[v[0]+f.x,v[1]+f.y,v[2]+lift];
 return {pelvis:at(pelvis),neck:at(neck),head:at(head),hipL:at(l.hip),kneeL:at(l.knee),ankleL:at(l.ankle),toeL:at(l.toe),hipR:at(r.hip),kneeR:at(r.knee),ankleR:at(r.ankle),toeR:at(r.toe),
  shL:at(al.sh),elbowL:at(al.elbow),handL:at(al.hand),shR:at(ar.sh),elbowR:at(ar.elbow),handR:at(ar.hand),up:u,fwd:fw,left:lf,soleL:l.sole,soleR:r.sole,footL:l.foot,footR:r.foot};
}

/** One drawable thing, already projected. Painted back to front by `depth`. */
export type Item=
 |{kind:'cap';depth:number;a:Flat;b:Flat;r:number;tone:Tone;id?:string}
 |{kind:'ball';depth:number;c:Flat;r:number;tone:Tone|'accent';spin?:number;id?:string}
 |{kind:'poly';depth:number;pts:Flat[];tone:Tone|'accent'|'yellow'|'red'|'green';id?:string}
 |{kind:'dots';depth:number;pts:Flat[];r:number};
/** Paper tones a figure's parts are filled with (CSS maps them to the Paper palette). */
export type Tone='shirtLight'|'shirtGrey'|'shirtDark'|'shirtKeeper'|'shorts'|'shortsDark'|'skin'|'boot'|'sock'|'ball';
const SHIRT:Record<Kit,Tone>={light:'shirtLight',grey:'shirtGrey',dark:'shirtDark',keeper:'shirtKeeper'};

/** Screen size of a world length at a point (k = px per cm along the screen). */
export const pxPerCm=(P:Projection)=>{const a=iso([0,0,0],P),b=iso([0,0,100],P);return Math.hypot(b[0]-a[0],b[1]-a[1])/100/Math.cos((P.elevation??30)*R);};

/** A figure as depth-sorted items: capsules for limbs and body, a ball for the head, the card in the hand. */
export function figureItems(f:Fig,P:Projection):Item[]{
 const j=joints(f),k=pxPerCm(P),out:Item[]=[],shirt=SHIRT[f.kit],shorts=f.kit==='dark'||f.kit==='keeper'?'shortsDark':'shorts';
 const cap=(a:V,b:V,r:number,tone:Tone)=>{out.push({kind:'cap',depth:depthOf(mul(add(a,b),.5),P),a:iso(a,P),b:iso(b,P),r:r*k,tone,id:f.id});};
 cap(j.hipL,j.kneeL,7.8,shorts==='shorts'&&f.kit!=='light'?'skin':'skin');cap(j.kneeL,j.ankleL,6.4,'sock');cap(j.ankleL,j.toeL,4.6,'boot');
 cap(j.hipR,j.kneeR,7.8,'skin');cap(j.kneeR,j.ankleR,6.4,'sock');cap(j.ankleR,j.toeR,4.6,'boot');
 cap(add(j.pelvis,mul(j.up,-3)),add(j.pelvis,mul(j.up,10)),15.5,shorts);
 cap(add(j.pelvis,mul(j.up,14)),add(j.neck,mul(j.up,-5)),16.5,shirt);
 cap(j.shL,j.elbowL,5.8,shirt);cap(j.elbowL,j.handL,4.6,'skin');cap(j.shR,j.elbowR,5.8,shirt);cap(j.elbowR,j.handR,4.6,'skin');
 out.push({kind:'ball',depth:depthOf(j.head,P)+.5,c:iso(j.head,P),r:BODY.head*k,tone:'skin',id:f.id});
 // Studs: when a sole faces forward (the foot points up), its three studs show.
 for(const [an,fd,so] of [[j.ankleL,j.footL,j.soleL],[j.ankleR,j.footR,j.soleR]] as [V,V,V][])if(fd[2]>.55){
  out.push({kind:'dots',depth:depthOf(an,P)+2,r:Math.max(.9,1.6*k),pts:[5,11,17].map(s=>iso(add(add(an,mul(fd,s)),mul(so,5)),P))});}
 if(f.card){// the card held up faces the viewer (a flat card seen edge-on would vanish), bigger than life so it reads
  const hnd=iso(j.handR,P),w=8*k*1.5,hg=12*k*1.5,sk=w*.18;
  out.push({kind:'poly',depth:depthOf(j.handR,P)+3,pts:[[hnd[0]-w,hnd[1]-2],[hnd[0]+w,hnd[1]-2-sk],[hnd[0]+w,hnd[1]-2-sk-hg*2],[hnd[0]-w,hnd[1]-2-hg*2]],tone:f.card,id:f.id});}
 return out;
}
/** The match ball (22 cm) at a centre point. */
export function ballItem(c:V,P:Projection,spin=0,tone:Tone|'accent'='ball',scale=1):Item{return {kind:'ball',depth:depthOf(c,P)+.2,c:iso(c,P),r:11*scale*pxPerCm(P),tone,spin,id:'ball'};}
/** A soft floor shadow under a point (screen ellipse, world radius r). */
export function shadowAt(x:number,y:number,r:number,P:Projection){const c=iso([x,y,0],P),a=iso([x+r,y,0],P),b=iso([x,y+r,0],P);
 return {cx:c[0],cy:c[1],rx:Math.max(Math.abs(a[0]-c[0]),Math.abs(b[0]-c[0])),ry:Math.max(Math.abs(a[1]-c[1]),Math.abs(b[1]-c[1]))};}
export const byDepth=(items:Item[])=>[...items].sort((a,b)=>a.depth-b.depth);

/** One static part of a bench drawing (kit solids and lines, a lens, an engraved label, the soft shadow under the base). */
export type Part=
 |{kind:'solid';paths:SolidPaths;tone?:KTone;crease?:KTone|'none';lit?:boolean;halo?:boolean;inner?:string;key?:string}
 |{kind:'line';d:string;tone?:LineTone;free?:boolean}
 |{kind:'dots';pts:Flat[];size?:number;tone?:KTone}
 |{kind:'lens';d:string;on:'red'|'yellow'|'green'|null;colour:'red'|'yellow'|'green';glow:Flat;r:number}
 |{kind:'text';transform:string;text:string;size:number;ink?:'hi'|'accent'}
 |{kind:'halo';d:string}
 |{kind:'items';items:Item[]};
