"use client";
import {BackButton} from '../BackButton';
import {recordExploreActivity} from '@/lib/town/exploreActivity';
import {Icon} from '../Icon';
import {useEffect,useRef,useState} from 'react';
import type {GameProps} from './types';
import {beginTennis,canTennisKick,canTennisSlam,createTennis,requestTennisKick,resetTennis,setTennisTarget,tennisLanding,tennisNeedsFrames,tickTennis,type TennisState,type TennisPlayer,type TennisShot} from '../../lib/games/soccerTennis';
import styles from './SoccerTennisGame.module.css';

type V={x:number;y:number;s:number};
type View={w:number;h:number;unit:number;top:number;depth:number;project:(x:number,y:number,z?:number)=>V;unproject:(x:number,y:number)=>{x:number;y:number}};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
/* canvas text follows the app's UI font token (resolved at mount — canvas can't read CSS vars) */
let UIFONT='"Pixelify Sans",sans-serif';
function makeView(w:number,h:number):View{
 // Deep diorama with CONSISTENT perspective: width scale s(t)=.58→1.08 near-to-far, and the
 // vertical row spacing is foreshortened in proportion (screen y integrates s), so the far half
 // is smaller in BOTH axes and the net sits exactly where the true middle of the plane reads.
 // The near baseline lands at top+depth ≈ .845h, just above the footer strip.
 const unit=Math.min(w*.085,h*.085),top=h*.245,depth=h*.6,s0=.58,a=.25; // s(t)=s0+2a·t, ∫₀¹s = s0+a
 const norm=s0+a,scale=(t:number)=>s0+2*a*t,fore=(t:number)=>(s0*t+a*t*t)/norm;
 const project=(x:number,y:number,z=0):V=>{const t=(y+8)/16,s=scale(t);return {x:w/2+x*unit*s,y:top+fore(t)*depth-z*unit*.87*s,s:unit*s};};
 return {w,h,unit,top,depth,project,unproject:(x,y)=>{const f=(y-top)/depth*norm,t=(-s0+Math.sqrt(Math.max(0,s0*s0+4*a*f)))/(2*a);return {x:(x-w/2)/(unit*scale(t)),y:t*16-8};}};
}
function poly(c:CanvasRenderingContext2D,points:{x:number;y:number}[],fill:string,stroke?:string,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c:CanvasRenderingContext2D,a:{x:number;y:number},b:{x:number;y:number},color:string,width=1){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function rounded(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
/** darken (f<0) or lighten (f>0) a #rrggbb color — used for the lit/shaded sides of everything */
function tone(hex:string,f:number){const n=parseInt(hex.slice(1),16),ch=(x:number)=>Math.round(f<0?x*(1+f):x+(255-x)*f);return `rgb(${ch(n>>16&255)},${ch(n>>8&255)},${ch(n&255)})`;}
function background(c:CanvasRenderingContext2D,v:View){
 const {w,h,project:p}=v;
 // Sunset sky with a low sun glow on the LEFT — every shadow in the scene falls lower-right.
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#eda87e');sky.addColorStop(.18,'#f7dcae');sky.addColorStop(.2,'#c9986e');sky.addColorStop(.6,'#d3ac82');sky.addColorStop(1,'#c1976a');c.fillStyle=sky;c.fillRect(0,0,w,h);
 const sun=c.createRadialGradient(w*.24,h*.11,0,w*.24,h*.11,w*.26);sun.addColorStop(0,'rgba(255,242,200,.8)');sun.addColorStop(1,'rgba(255,242,200,0)');c.fillStyle=sun;c.fillRect(0,0,w,h*.2);
 c.fillStyle='#82aba7';c.fillRect(0,h*.115,w,h*.082);c.fillStyle='#b9d0bd';c.fillRect(0,h*.115,w,3);
 for(let i=0;i<24;i++){const x=((Math.imul(i+9,48271)>>>0)%1000)/1000*w,y=h*(.128+((Math.imul(i+31,40503)>>>0)%1000)/1000*.055);line(c,{x,y},{x:x+w*.014,y},'#cfe0cd7d',1.2);}
 // The seaside club as two BOXES: front faces, angled side faces toward the vanishing point,
 // shaded roof planes and long soft shadows thrown to the lower-right.
 const baseY=h*.245,rise=h*.018,sw=w*.035,fascia=Math.max(2,h*.006);
 const throwShadow=(x0:number,x1:number)=>poly(c,[{x:x0,y:baseY-2},{x:x1,y:baseY-2},{x:x1+w*.06,y:baseY+h*.055},{x:x0+w*.06,y:baseY+h*.055}],'rgba(74,40,16,.13)');
 throwShadow(w*.06,w*.435);throwShadow(w*.575,w*.955);
 // left block: plaster clubhouse — its right side face turns away from the sun (dark)
 const lx0=w*.05,lx1=w*.40,lyT=baseY-h*.148;
 poly(c,[{x:lx1,y:lyT},{x:lx1+sw,y:lyT-rise},{x:lx1+sw,y:baseY-rise*.4},{x:lx1,y:baseY}],'#bfa276');
 poly(c,[{x:lx1+w*.005,y:lyT+h*.05},{x:lx1+sw-w*.005,y:lyT+h*.05-rise*.8},{x:lx1+sw-w*.005,y:lyT+h*.098-rise*.8},{x:lx1+w*.005,y:lyT+h*.098}],'#87684a');
 c.fillStyle='#f0dbb2';c.fillRect(lx0,lyT,lx1-lx0,baseY-lyT);
 c.fillStyle='rgba(120,70,35,.12)';c.fillRect(lx1-w*.05,lyT,w*.05,baseY-lyT);
 poly(c,[{x:lx0,y:lyT},{x:lx1,y:lyT},{x:lx1+sw,y:lyT-rise},{x:lx0+sw,y:lyT-rise}],'#c47a5b');
 line(c,{x:lx0,y:lyT},{x:lx1,y:lyT},'#94523c',fascia);
 line(c,{x:lx0+sw,y:lyT-rise},{x:lx1+sw,y:lyT-rise},'#dc9772',1.5);
 for(const wx of [.085,.185,.3]){const X=w*wx,W=w*.068,Y=lyT+h*.052,H=h*.072;
  rounded(c,X,Y,W,H,2,'#6b4a38');rounded(c,X+2,Y+3,W-4,H*.45,2,'#f0b26a');
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#f2dfae':'#cf7a4e';c.fillRect(X-3+(W+6)*i/6,Y-h*.02,(W+6)/6,h*.021);}
  line(c,{x:X-3,y:Y+h*.001},{x:X+W+3,y:Y+h*.001},'rgba(90,45,20,.35)',2);}
 // right block: taller stucco hall — its left side face catches the sunset (lit)
 const rx0=w*.575,rx1=w*.93,ryT=baseY-h*.175;
 poly(c,[{x:rx0,y:ryT},{x:rx0-sw,y:ryT-rise},{x:rx0-sw,y:baseY-rise*.4},{x:rx0,y:baseY}],'#ecddb8');
 c.fillStyle='#d8c8a9';c.fillRect(rx0,ryT,rx1-rx0,baseY-ryT);
 c.fillStyle='rgba(120,70,35,.14)';c.fillRect(rx1-w*.07,ryT,w*.07,baseY-ryT);
 poly(c,[{x:rx0,y:ryT},{x:rx1,y:ryT},{x:rx1-sw,y:ryT-rise},{x:rx0-sw,y:ryT-rise}],'#a95f43');
 line(c,{x:rx0,y:ryT},{x:rx1,y:ryT},'#84492f',fascia);
 line(c,{x:rx0-sw,y:ryT-rise},{x:rx1-sw,y:ryT-rise},'#c07a58',1.5);
 for(const r of [0,1])for(const k of [0,1,2]){if(r===1&&k===1)continue;const X=w*(.61+k*.105),Y=ryT+h*(.028+r*.072),W=w*.06,H=h*.05;
  rounded(c,X,Y,W,H,2,'#5f4132');rounded(c,X+2,Y+2,W-4,H-4,1,(r+k)%2?'#f4c581':'#7e6046');}
 rounded(c,w*.716,baseY-h*.08,w*.056,h*.08,2,'#6b4a38');ellipse(c,w*.763,baseY-h*.04,2.2,2.2,'#e2b061');
 // string lights swing between the two buildings
 const P0={x:lx1-w*.02,y:lyT+h*.012},P1={x:rx0+w*.02,y:ryT+h*.02},C={x:w*.5,y:baseY-h*.045};
 c.strokeStyle='#536558';c.lineWidth=1;c.beginPath();c.moveTo(P0.x,P0.y);c.quadraticCurveTo(C.x,C.y,P1.x,P1.y);c.stroke();
 for(let i=1;i<12;i++){const t=i/12,ix=(1-t)*(1-t)*P0.x+2*(1-t)*t*C.x+t*t*P1.x,iy=(1-t)*(1-t)*P0.y+2*(1-t)*t*C.y+t*t*P1.y;ellipse(c,ix,iy+3,2.2,3,'#fff2b6');}
 // The court is a real SLAB: long cast shadow, lit/shaded side faces, a thick near lip, then the top.
 const cn=[p(-5.55,-8.45),p(5.55,-8.45),p(5.55,8.45),p(-5.55,8.45)];
 const drop=(q:V)=>q.s*.3;
 poly(c,cn.map(q=>({x:q.x+q.s*.52,y:q.y+q.s*.22})),'rgba(40,20,6,.13)');
 poly(c,[cn[0],cn[3],{x:cn[3].x,y:cn[3].y+drop(cn[3])},{x:cn[0].x,y:cn[0].y+drop(cn[0])}],'#a5714a');
 poly(c,[cn[1],cn[2],{x:cn[2].x,y:cn[2].y+drop(cn[2])},{x:cn[1].x,y:cn[1].y+drop(cn[1])}],'#73441f');
 poly(c,[cn[3],cn[2],{x:cn[2].x,y:cn[2].y+drop(cn[2])},{x:cn[3].x,y:cn[3].y+drop(cn[3])}],'#8f5a37');
 line(c,cn[3],cn[2],'#e5bc8e',2);
 poly(c,cn,'#b9835a');poly(c,[p(-5,-8),p(5,-8),p(5,0),p(-5,0)],'#c28a58');poly(c,[p(-5,0),p(5,0),p(5,8),p(-5,8)],'#d5a06e');
 // depth gradient across the top (darker far, warmer near) + fixed surface grain, painted once
 c.save();c.beginPath();cn.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.closePath();c.clip();
 const tg=c.createLinearGradient(0,cn[0].y,0,cn[2].y);tg.addColorStop(0,'rgba(84,44,16,.18)');tg.addColorStop(.55,'rgba(84,44,16,0)');tg.addColorStop(1,'rgba(255,226,180,.1)');c.fillStyle=tg;c.fillRect(0,cn[0].y-2,w,cn[2].y-cn[0].y+8);
 for(let i=0;i<500;i++){const x=((Math.imul(i+17,7919)>>>0)%1000)/1000*w,y=((Math.imul(i+41,3571)>>>0)%1000)/1000*h;ellipse(c,x,y,.6,.45,i%2?'#ffffff0d':'#7a41190d');}c.restore();
 for(const [a,b] of [[[-5,-8],[5,-8]],[[5,-8],[5,8]],[[5,8],[-5,8]],[[-5,8],[-5,-8]],[[0,-8],[0,8]],[[-5,0],[5,0]]] as [number[],number[]][]){line(c,p(a[0],a[1]),p(b[0],b[1]),'#f5edcd',Math.max(1.7,w*.004));}
 // A quiet fence frames the court; the big posts pool tiny shadows at their feet.
 const fence=(a:[number,number],b:[number,number])=>{
  for(let i=0;i<=12;i++){const t=i/12,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,base=p(x,y);
   if(i%3===0)ellipse(c,base.x+base.s*.14,base.y+base.s*.03,base.s*.12,base.s*.04,'rgba(56,30,12,.18)');
   line(c,base,p(x,y,1.45),'#7d5b40',i%3===0?2.5:.6);}
  for(const z of [.4,.8,1.15,1.45])line(c,p(a[0],a[1],z),p(b[0],b[1],z),'#7d5b40',z===1.45?2:.55);
 };
 fence([-5.9,-8.8],[5.9,-8.8]);fence([-5.9,-8.8],[-5.9,6]);fence([5.9,-8.8],[5.9,6]);
}
function net(c:CanvasRenderingContext2D,v:View){const p=v.project;
 // the whole band throws a long shadow to the lower-right, like everything else on the court
 poly(c,[p(-5.15,.12),p(5.15,.12),p(5.95,.95),p(-4.4,.95)],'#43281320');
 // posts: shaded round posts with a lit edge, caps, and small pooled shadows
 for(const x of [-5.2,5.2]){const b=p(x,0),t=p(x,0,1.32);
  ellipse(c,b.x+b.s*.16,b.y+b.s*.035,b.s*.2,b.s*.06,'rgba(56,30,12,.25)');
  line(c,b,t,'#4f3423',6);line(c,{x:b.x-1.4,y:b.y},{x:t.x-1.4,y:t.y},'#8a6244',2);
  ellipse(c,t.x,t.y,3.4,2.4,'#edd39b');ellipse(c,t.x-.9,t.y-.6,1.3,.9,'#fff3cf');}
 // mesh drawn twice, a hair apart, so the net has visible thickness
 for(const [dx,col] of [[1.2,'#46352695'],[0,'#5d4634a6']] as [number,string][]){
  for(let i=0;i<=34;i++){const x=-5.15+i*10.3/34,a=p(x,0,.08),b=p(x,0,1.08);line(c,{x:a.x+dx,y:a.y-dx*.6},{x:b.x+dx,y:b.y-dx*.6},col,.65);}
  for(let j=0;j<6;j++){const a=p(-5.15,0,.1+j*.2),b=p(5.15,0,.1+j*.2);line(c,{x:a.x+dx,y:a.y-dx*.6},{x:b.x+dx,y:b.y-dx*.6},col,.6);}}
 // sagging tape: a shaded underside beneath a lit top edge reads as a band with depth
 const L=p(-5.15,0,1.1),R=p(5.15,0,1.1),M=p(0,0,1.045);
 c.beginPath();c.moveTo(L.x,L.y);c.quadraticCurveTo(M.x,M.y,R.x,R.y);c.strokeStyle='#b7a27b';c.lineWidth=4.6;c.stroke();
 c.beginPath();c.moveTo(L.x,L.y-1.3);c.quadraticCurveTo(M.x,M.y-1.3,R.x,R.y-1.3);c.strokeStyle='#f8f0d2';c.lineWidth=2.7;c.stroke();
}
function person(c:CanvasRenderingContext2D,v:View,pl:TennisPlayer,home:boolean){
 const g=v.project(pl.x,pl.y),u=g.s,pace=clamp(Math.hypot(pl.vx,pl.vy)/5,0,1);
 // kickStyle: 0 = soft tap (half amplitude), 1 = full swing, 2 = jumping overhead slam
 const style=pl.kickStyle,kRaw=pl.kick>0?Math.sin((1-pl.kick/.34)*Math.PI):0;
 const swing=Math.sin(pl.stride)*pace,kick=kRaw*(style===0?.5:1),jump=style===2?kRaw*.3*u:0;
 const lean=clamp(pl.vx*.03,-.12,.12)*u,bob=Math.abs(swing)*u*.028;
 // sunset palette: lit tones on the left, shaded tones on the right, warm rim + soft ink outline
 const skin=home?'#bd7950':'#d69c72',skinD=tone(skin,-.24),
  jer=home?'#17696d':'#bc654f',jerD=tone(jer,-.3),jerL=tone(jer,.25),
  shorts=home?'#efe1bb':'#5b4636',shortsD=tone(shorts,-.22),
  trim=home?'#f3dca5':'#f7e7c5',trimD=tone(trim,-.18),shoe='#2c3b36',shoeD=tone(shoe,-.25),shoeL=tone(shoe,.28),
  hair=home?'#332a24':'#735238',rim='rgba(255,216,150,.5)',ink='rgba(43,24,10,.4)';
 c.save();c.translate(g.x,g.y);c.lineCap='round';c.lineJoin='round';
 // long sunset shadow thrown to the lower-right, plus a tight contact pool under the feet
 // (the pool loosens while the body is airborne mid-slam)
 c.save();c.rotate(.38);c.scale(1,.34);ellipse(c,u*.42,u*.1,u*.6,u*.26,'rgba(56,31,12,.16)');c.restore();
 ellipse(c,u*.08,u*.03,u*.32*(1+jump/u),u*.11,`rgba(56,31,12,${.22-jump/u*.3})`);
 c.translate(0,-jump);
 // legs: hip → bent knee → ankle; the striking leg sweeps up and through on a kick,
 // and climbs into a high scissor for the overhead slam
 for(const side of [-1,1] as const){
  const ph=swing*side,kicking=kick>0&&side===1,lit=side<0;
  const hip={x:side*.12*u+lean*.5,y:-.8*u-bob};
  const lift=Math.max(0,ph)*.1*u+(kicking?kick*(style===2?.68:.42)*u:0);
  const ank={x:side*.16*u+ph*.13*u+lean*.25+(kicking?kick*(style===2?.2:.12)*u:0),y:-.09*u-lift};
  const knee={x:(hip.x+ank.x)/2+ph*.055*u+side*.012*u+(kicking?kick*.1*u:0),y:(hip.y+ank.y)/2+(Math.abs(ph)*.05+(kicking?kick*.06:0))*u};
  const cs=lit?skin:skinD;
  line(c,hip,knee,cs,.15*u);line(c,knee,ank,cs,.125*u);
  line(c,{x:(knee.x+ank.x)/2,y:(knee.y+ank.y)/2},ank,lit?trim:trimD,.13*u);
  const toe=(home?-1:1)*.05*u;
  ellipse(c,ank.x+toe,ank.y+.02*u,.15*u,.068*u,lit?shoe:shoeD);
  ellipse(c,ank.x+toe*1.9,ank.y+.015*u,.052*u,.05*u,shoeL);
  line(c,{x:ank.x-.11*u+toe*.4,y:ank.y+.062*u},{x:ank.x+.11*u+toe*.4,y:ank.y+.062*u},'#e7e1cc',.03*u);
  if(kicking&&style>0){c.strokeStyle=`rgba(255,240,200,${.55*kick*(style===2?1.3:1)})`;c.lineWidth=.05*u*(style===2?1.4:1);c.beginPath();c.arc(ank.x-.1*u,ank.y-.05*u,.32*u*(style===2?1.25:1),-.6,1.1);c.stroke();}
 }
 // shorts over the hips, shaded away from the sun
 const wy=-.86*u-bob,hemy=-.62*u-bob;
 poly(c,[{x:-.22*u+lean*.6,y:wy},{x:.22*u+lean*.6,y:wy},{x:.25*u+lean*.3,y:hemy},{x:.05*u,y:hemy},{x:0,y:-.7*u-bob},{x:-.05*u,y:hemy},{x:-.25*u+lean*.3,y:hemy}],shorts);
 poly(c,[{x:.02*u+lean*.6,y:wy},{x:.22*u+lean*.6,y:wy},{x:.25*u+lean*.3,y:hemy},{x:.05*u,y:hemy},{x:.01*u,y:-.7*u-bob}],shortsD);
 // arms counter-swing the legs; the off arm flies up for balance during a kick, and BOTH
 // arms throw overhead in the slam wind-up
 for(const side of [-1,1] as const){
  const ap=-swing*side,lit=side<0;
  const raise=kick>0?(style===2?(side===1?.72:.45):(side===-1?.34:0))*kick:0;
  const sh={x:side*.22*u+lean,y:-1.16*u-bob};
  const elb={x:side*.37*u+lean+ap*.05*u,y:-.97*u-bob+ap*.05*u-raise*.4*u};
  const hand={x:side*.34*u+lean+ap*.13*u+(style===2&&side===1?kick*.1*u:0),y:-.75*u-bob+ap*.1*u-raise*u};
  line(c,sh,elb,lit?jerL:jerD,.155*u);line(c,elb,hand,lit?skin:skinD,.1*u);
  ellipse(c,hand.x,hand.y,.06*u,.075*u,lit?skin:skinD);
 }
 // torso: jersey with a shaded half and a warm rim light on the sunset side
 const torso=()=>{c.beginPath();c.moveTo(-.26*u+lean,-1.22*u-bob);c.quadraticCurveTo(lean,-1.3*u-bob,.26*u+lean,-1.22*u-bob);c.lineTo(.21*u+lean*.7,-.8*u-bob);c.quadraticCurveTo(lean*.5,-.75*u-bob,-.21*u+lean*.7,-.8*u-bob);c.closePath();};
 torso();c.fillStyle=jer;c.fill();
 c.save();torso();c.clip();
 c.fillStyle='rgba(38,18,8,.22)';c.fillRect(.02*u+lean,-1.34*u-bob,.32*u,.64*u);
 c.fillStyle=rim;c.fillRect(-.27*u+lean,-1.34*u-bob,.05*u,.64*u);
 c.restore();
 torso();c.strokeStyle=ink;c.lineWidth=.022*u;c.stroke();
 line(c,{x:-.09*u+lean,y:-1.225*u-bob},{x:.09*u+lean,y:-1.225*u-bob},trim,.05*u);
 c.fillStyle=trim;c.font=`800 ${u*.28}px ${UIFONT}`;c.textAlign='center';c.fillText(home?'7':'9',lean,-.9*u-bob);
 // head: skin sphere with a shaded cheek, warm rim light, readable hair — outlined so it pops
 const hx=lean*1.05,hy=-1.46*u-bob;
 line(c,{x:lean,y:-1.24*u-bob},{x:hx,y:-1.36*u-bob},skin,.1*u);
 ellipse(c,hx,hy,.22*u,.255*u,skin);
 c.save();c.beginPath();c.ellipse(hx,hy,.22*u,.255*u,0,0,Math.PI*2);c.clip();
 ellipse(c,hx+.11*u,hy,.17*u,.26*u,skinD);
 ellipse(c,hx-.19*u,hy-.02*u,.045*u,.17*u,rim);
 if(home){ellipse(c,hx,hy-.02*u,.215*u,.245*u,hair);ellipse(c,hx+.1*u,hy-.04*u,.13*u,.21*u,tone(hair,-.25));ellipse(c,hx-.12*u,hy-.1*u,.05*u,.13*u,tone(hair,.3));}
 else ellipse(c,hx,hy-.19*u,.23*u,.12*u,hair);
 c.restore();
 c.beginPath();c.ellipse(hx,hy,.22*u,.255*u,0,0,Math.PI*2);c.strokeStyle=ink;c.lineWidth=.02*u;c.stroke();
 if(home){ellipse(c,hx-.215*u,hy+.02*u,.04*u,.055*u,skin);ellipse(c,hx+.215*u,hy+.02*u,.04*u,.055*u,skinD);}
 else{ellipse(c,hx-.075*u,hy+.01*u,.026*u,.034*u,'#42342a');ellipse(c,hx+.075*u,hy+.01*u,.026*u,.034*u,'#42342a');
  line(c,{x:hx-.105*u,y:hy-.06*u},{x:hx-.045*u,y:hy-.065*u},'#5d4632',.02*u);line(c,{x:hx+.045*u,y:hy-.065*u},{x:hx+.105*u,y:hy-.06*u},'#5d4632',.02*u);
  line(c,{x:hx-.045*u,y:hy+.12*u},{x:hx+.045*u,y:hy+.12*u},'#93634b',.024*u);}
 c.restore();
}
function ball(c:CanvasRenderingContext2D,v:View,s:TennisState){const b=s.ball,p=v.project(b.x,b.y,b.z),g=v.project(b.x,b.y),r=p.s*.235;
 // shadow tightens and darkens as the ball drops — sells the height of the arc
 const near=1/(1+b.z*.42);
 ellipse(c,g.x+g.s*(.06+b.z*.03),g.y+g.s*.04,g.s*.235*(.45+.55*near),g.s*.09*(.45+.55*near),`rgba(58,34,14,${.34*near+.05})`);
 // slight squash right after a bounce (kept ground-aligned; the panel pattern still spins)
 const sq=b.z<.5?Math.min(.3,b.squash*1.8):0;
 c.save();c.translate(p.x,p.y);c.scale(1+sq,1-sq);
 ellipse(c,r*.1,r*.25,r,r,'#d9ccb0');ellipse(c,0,0,r,r,'#faf3df');
 c.rotate(b.rot);poly(c,Array.from({length:5},(_,i)=>({x:Math.cos(i*Math.PI*.4)*r*.43,y:Math.sin(i*Math.PI*.4)*r*.43})),'#4a382a');for(let i=0;i<5;i++){const a=i*Math.PI*.4;line(c,{x:Math.cos(a)*r*.43,y:Math.sin(a)*r*.43},{x:Math.cos(a)*r*.94,y:Math.sin(a)*r*.94},'#8a7a68',.8);}c.restore();
}
/** per-shot trail language, shared by YOUR shots and the rival's so incoming balls read
 * mid-flight: cream = soft drop, gold = normal kick, ember = hard drive, teal = floaty lob,
 * red = slam (thicker + sparks). Hues picked to separate on both clay and the sunset sky. */
const SHOTTRAIL:Record<string,{col:string;a:number;n:number;w:number}>={
 drop:{col:'#fff6e0',a:.5,n:8,w:.1},
 auto:{col:'#f9d98a',a:.55,n:10,w:.13},
 drive:{col:'#ff7a3c',a:.7,n:12,w:.16},
 lob:{col:'#7fd4dc',a:.6,n:13,w:.12},
 slam:{col:'#ff3b2f',a:.9,n:14,w:.2},
};
const hud=(s:TennisState)=>({phase:s.phase,you:s.score.you,rival:s.score.rival,message:s.message,rally:s.rally,best:s.bestRally,server:s.server,winner:s.winner});
export default function SoccerTennisGame({onExit}:GameProps){
 const canvas=useRef<HTMLCanvasElement>(null),simulation=useRef(createTennis()),pausedRef=useRef(false),controller=useRef({wake:()=>{},resize:()=>{}});
 const joyRef=useRef<HTMLDivElement>(null),knobRef=useRef<HTMLDivElement>(null),stick=useRef({x:0,y:0,on:false,id:-1});
 const [display,setDisplay]=useState(()=>hud(simulation.current)),[paused,setPaused]=useState(false),[slamUI,setSlamUI]=useState(false);
 const act=(shot:TennisShot='auto')=>{requestTennisKick(simulation.current,undefined,shot);controller.current.wake();};
 // virtual joystick (bottom-left): its own pointer capture, so a left thumb can steer while the
 // right thumb taps Kick. Deflection feeds setTennisTarget every frame; release snaps back + stops.
 const joyPoint=(e:{clientX:number;clientY:number})=>{const el=joyRef.current;if(!el)return;const rect=el.getBoundingClientRect(),R=rect.width/2-8;let dx=e.clientX-(rect.left+rect.width/2),dy=e.clientY-(rect.top+rect.height/2);const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}stick.current.x=dx/R;stick.current.y=dy/R;if(knobRef.current)knobRef.current.style.transform=`translate(${dx}px, ${dy}px)`;};
 const joyDown=(e:React.PointerEvent<HTMLDivElement>)=>{if(stick.current.on)return;e.preventDefault();stick.current.on=true;stick.current.id=e.pointerId;joyRef.current?.setPointerCapture(e.pointerId);joyPoint(e);controller.current.wake();};
 const joyMove=(e:React.PointerEvent<HTMLDivElement>)=>{if(!stick.current.on||stick.current.id!==e.pointerId)return;joyPoint(e);controller.current.wake();};
 const joyEnd=(e:React.PointerEvent<HTMLDivElement>)=>{if(stick.current.id!==e.pointerId)return;stick.current={x:0,y:0,on:false,id:-1};if(knobRef.current)knobRef.current.style.transform='';const s=simulation.current;setTennisTarget(s,s.you.x,s.you.y);controller.current.wake();};
 const start=()=>{recordExploreActivity('arcade');resetTennis(simulation.current);beginTennis(simulation.current);pausedRef.current=false;setPaused(false);setDisplay(hud(simulation.current));controller.current.wake();};
 const togglePause=()=>{simulation.current.queuedKick=0;pausedRef.current=!pausedRef.current;setPaused(pausedRef.current);controller.current.wake();};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d',{alpha:false});if(!ctx)return;
  const uiVar=getComputedStyle(document.documentElement).getPropertyValue('--font-ui').trim();if(uiVar)UIFONT=uiVar;
  const coarse=matchMedia('(pointer:coarse)').matches,fps=coarse?30:45,back=document.createElement('canvas'),mesh=document.createElement('canvas');
  const bc=back.getContext('2d')!,nc=mesh.getContext('2d')!;let view=makeView(1,1),dpr=1,raf=0,last=0,drawn=0,closed=false,version=-1,pointer:number|null=null;
  const keys=new Set<string>(),debug=new URLSearchParams(window.location.search).get('debugGames')==='1';
  // ball trail ring buffer (x,y,z per frame) + haptics/slam-window trackers — all preallocated
  const TR=24,tr=new Float32Array(TR*3);let ti=0,tn=0,kc=simulation.current.kickCount,slamOn=false,spaceAt=0;
  const vib=(p:number|number[])=>{try{if(coarse&&typeof navigator!=='undefined'&&'vibrate'in navigator)navigator.vibrate(p);}catch{}};
  // shot-type trail: reset at every kick, tapered + fading toward the tail, intensity tied
  // to ball speed (slams blaze, drops whisper), dimmed after the bounce, sparks on slams
  const trail=(s:TennisState)=>{if(tn<3)return;
   const b=s.ball,sp=Math.hypot(b.vx,b.vy,b.vz),cfg=SHOTTRAIL[s.lastShot]??SHOTTRAIL.auto;
   const m=cfg.a*(b.bounces===0?1:.35)*clamp((sp-1.2)/6,0,1);
   if(m<=.03)return;
   let prev=view.project(b.x,b.y,b.z);const N=Math.min(tn,cfg.n);
   ctx.strokeStyle=cfg.col;ctx.lineCap='round';
   for(let k=1;k<N;k++){const idx=((ti-k)%TR+TR)%TR,px=view.project(tr[idx*3],tr[idx*3+1],tr[idx*3+2]);
    ctx.globalAlpha=m*(1-k/N);
    ctx.lineWidth=Math.max(1,px.s*cfg.w*(1-k/N*.7));ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(px.x,px.y);ctx.stroke();prev=px;}
   if(s.lastShot==='slam'&&sp>8){for(let j=0;j<3;j++){const idx=((ti-1-j*3)%TR+TR)%TR,px=view.project(tr[idx*3],tr[idx*3+1],tr[idx*3+2]);
    ctx.globalAlpha=m*(1-j*.28);ellipse(ctx,px.x+((j*37)%9)-4,px.y+((j*53)%9)-4,2.4-j*.5,2.4-j*.5,'#ffd9a0');}}
   ctx.globalAlpha=1;
  };
  const draw=()=>{const s=simulation.current;ctx.setTransform(dpr,0,0,dpr,0,0);
   // slam impact: a short screen shake (background repainted under the offset so no edge tears)
   if(s.fxSlam>0){ctx.fillStyle='#c1976a';ctx.fillRect(0,0,view.w,view.h);ctx.translate(Math.sin(s.clock*93)*6.5*s.fxSlam,Math.cos(s.clock*81)*4.5*s.fxSlam);}
   ctx.drawImage(back,0,0,view.w,view.h);
   if(s.phase==='rally'&&s.ball.last==='rival'&&s.ball.bounces===0){const land=tennisLanding(s);if(land.y>0&&land.y<8&&Math.abs(land.x)<5){const p=view.project(land.x,land.y);ctx.save();ctx.setLineDash([3,4]);ctx.strokeStyle='#ffe9b39e';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,p.s*.43,p.s*.18,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
   // landing puff: an expanding dust ring + flecks where the ball last bounced
   if(s.fxLand>0){const t=1-s.fxLand/.45,pt=view.project(s.fxLandX,s.fxLandY),al=(1-t)*.5*s.fxLandI;
    ctx.strokeStyle=`rgba(238,213,168,${al})`;ctx.lineWidth=Math.max(1,pt.s*.05);ctx.beginPath();ctx.ellipse(pt.x,pt.y,pt.s*(.16+.5*t),pt.s*(.06+.19*t),0,0,Math.PI*2);ctx.stroke();
    for(let j=0;j<4;j++){const an=j*1.57+.42,rr=pt.s*(.2+.55*t);ellipse(ctx,pt.x+Math.cos(an)*rr,pt.y+Math.sin(an)*rr*.38-pt.s*t*.12,pt.s*.05*(1-t),pt.s*.04*(1-t),`rgba(238,213,168,${al})`);}}
   person(ctx,view,s.rival,false);if(s.ball.y<0){trail(s);ball(ctx,view,s);}
   ctx.drawImage(mesh,0,0,view.w,view.h);person(ctx,view,s.you,true);if(s.ball.y>=0){trail(s);ball(ctx,view,s);}
   // slam impact pop: a bright ring bursting from the contact point
   if(s.fxSlam>.2){const t=(0.42-s.fxSlam)/.22,pt=view.project(s.fxSlamX,s.fxSlamY,s.fxSlamZ);
    ctx.strokeStyle=`rgba(255,240,200,${(1-t)*.8})`;ctx.lineWidth=Math.max(1.5,pt.s*.07*(1-t));
    ctx.beginPath();ctx.ellipse(pt.x,pt.y,pt.s*(.28+t*1.1),pt.s*(.2+t*.8),0,0,Math.PI*2);ctx.stroke();}
   // contact prompts: KICK near a playable ball, a pulsing SLAM! when it hangs high
   if(s.phase==='rally'){
    if(canTennisSlam(s,'you')){const p=view.project(s.you.x,s.you.y,2.35),pu=1+Math.sin(s.clock*14)*.07;
     rounded(ctx,p.x-31*pu,p.y-12*pu,62*pu,22*pu,3,'#e07a54');ctx.fillStyle='#fff3d1';ctx.textAlign='center';ctx.font=`700 ${Math.round(12*pu)}px ${UIFONT}`;ctx.fillText('SLAM!',p.x,p.y+4*pu);}
    else if(canTennisKick(s,'you')){const p=view.project(s.you.x,s.you.y,2.05);rounded(ctx,p.x-23,p.y-10,46,19,3,'#f4cc7c');ctx.fillStyle='#294a3e';ctx.textAlign='center';ctx.font=`700 11px ${UIFONT}`;ctx.fillText('KICK',p.x,p.y+4);}}
   el.dataset.phase=s.phase;el.dataset.score=`${s.score.you}-${s.score.rival}`;el.dataset.frames=String(drawn++);
   if(debug){el.dataset.player=JSON.stringify({x:s.you.x,y:s.you.y});el.dataset.shot=s.lastShot;el.dataset.slam=String(canTennisSlam(s,'you'));const ld=tennisLanding(s);el.dataset.land=JSON.stringify({x:Math.round(ld.x*100)/100,y:Math.round(ld.y*100)/100,last:s.ball.last});}
  };
  const updateHUD=()=>{const s=simulation.current;if(version!==s.version){version=s.version;setDisplay(hud(s));}};
  const loop=(now:number)=>{raf=0;if(closed||document.hidden||pausedRef.current){last=0;return;}if(last&&now-last<1000/fps-1){raf=requestAnimationFrame(loop);return;}
   const dt=last?Math.min(.06,(now-last)/1000):1/fps;last=now;const s=simulation.current;
   let x=0,y=0;if(keys.has('ArrowLeft')||keys.has('a'))x--;if(keys.has('ArrowRight')||keys.has('d'))x++;if(keys.has('ArrowUp')||keys.has('w'))y--;if(keys.has('ArrowDown')||keys.has('s'))y++;
   if(x||y)setTennisTarget(s,s.you.x+x*1.4,s.you.y+y*1.4);
   const j=stick.current;if(j.on&&Math.hypot(j.x,j.y)>.14)setTennisTarget(s,s.you.x+j.x*1.5,s.you.y+j.y*1.5);
   tickTennis(s,dt);
   // record the ball trail; buzz on kicks (light) and slams (strong); surface the slam window
   if(s.kickCount!==kc){kc=s.kickCount;tn=0;if(s.lastKicker==='you')vib(s.lastShot==='slam'?[28,26,44]:s.lastShot==='drop'?8:12);else if(s.lastShot==='slam')vib(16);}
   if(s.phase==='rally'){tr[ti*3]=s.ball.x;tr[ti*3+1]=s.ball.y;tr[ti*3+2]=s.ball.z;ti=(ti+1)%TR;tn=Math.min(tn+1,TR);}else tn=0;
   const sw=s.phase==='rally'&&canTennisSlam(s,'you');if(sw!==slamOn){slamOn=sw;setSlamUI(sw);}
   updateHUD();draw();if(tennisNeedsFrames(s)||((keys.size>0||stick.current.on)&&s.phase!=='ready'&&s.phase!=='over'))raf=requestAnimationFrame(loop);else last=0;
  };
  const wake=()=>{if(closed)return;if(pausedRef.current||document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;last=0;draw();return;}if(!raf){last=0;raf=requestAnimationFrame(loop);}};
  const dropStick=()=>{stick.current={x:0,y:0,on:false,id:-1};if(knobRef.current)knobRef.current.style.transform='';};
  const resize=()=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return;pointer=null;keys.clear();dropStick();dpr=Math.min(window.devicePixelRatio||1,coarse?1.5:2);view=makeView(r.width,r.height);for(const c of [el,back,mesh]){c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);}bc.setTransform(dpr,0,0,dpr,0,0);nc.setTransform(dpr,0,0,dpr,0,0);background(bc,view);net(nc,view);draw();wake();};
  const location=(e:PointerEvent)=>{const r=el.getBoundingClientRect();return view.unproject(e.clientX-r.left,e.clientY-r.top);};
  const down=(e:PointerEvent)=>{if(pointer!==null||e.button>0)return;pointer=e.pointerId;el.setPointerCapture(e.pointerId);el.focus({preventScroll:true});const p=location(e);setTennisTarget(simulation.current,p.x,p.y);wake();};
  const move=(e:PointerEvent)=>{if(pointer!==e.pointerId)return;const p=location(e);setTennisTarget(simulation.current,p.x,p.y);wake();};
  const up=(e:PointerEvent)=>{if(pointer!==e.pointerId)return;pointer=null;if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);requestTennisKick(simulation.current);wake();};
  const lost=()=>{pointer=null;};
  const cancel=()=>{pointer=null;simulation.current.queuedKick=0;setTennisTarget(simulation.current,simulation.current.you.x,simulation.current.you.y);wake();};
  // Space: tap = kick/drive (a high ball auto-upgrades to a SLAM), hold ≥.27s then release = lob.
  // X (or Shift+Space) = short drop. Serves fire immediately on keydown.
  const keydown=(e:KeyboardEvent)=>{if(pausedRef.current)return;const k=e.key.length===1?e.key.toLowerCase():e.key;
   if(k===' '){e.preventDefault();if(e.repeat)return;if(simulation.current.phase==='serve')requestTennisKick(simulation.current);else spaceAt=performance.now();wake();return;}
   if(k==='x'){e.preventDefault();if(!e.repeat)requestTennisKick(simulation.current,undefined,'drop');wake();return;}
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);wake();}};
  const keyup=(e:KeyboardEvent)=>{if(pausedRef.current){keys.clear();spaceAt=0;return;}const k=e.key.length===1?e.key.toLowerCase():e.key;
   if(k===' '){const s=simulation.current;if(s.phase!=='serve'&&spaceAt){const held=(performance.now()-spaceAt)/1000;requestTennisKick(s,undefined,e.shiftKey?'drop':held>.27?'lob':'auto');}spaceAt=0;wake();return;}
   keys.delete(k);if(!keys.size){setTennisTarget(simulation.current,simulation.current.you.x,simulation.current.you.y);}wake();};
  const visibility=()=>{keys.clear();pointer=null;spaceAt=0;dropStick();simulation.current.queuedKick=0;setTennisTarget(simulation.current,simulation.current.you.x,simulation.current.you.y);if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}else wake();};
  controller.current={wake,resize};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',cancel);el.addEventListener('lostpointercapture',lost);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',visibility);document.addEventListener('visibilitychange',visibility);
  return()=>{closed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',cancel);el.removeEventListener('lostpointercapture',lost);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',visibility);document.removeEventListener('visibilitychange',visibility);back.width=back.height=mesh.width=mesh.height=0;controller.current={wake:()=>{},resize:()=>{}};};
 },[]);
 const busy=paused||display.phase==='point'||(display.phase==='serve'&&display.server==='rival');
 return <div className={styles.root} data-testid="soccer-tennis">
  <canvas ref={canvas} className={styles.canvas} aria-label="Futbol tennis court. Drag to move. Kick when the ball is close — slam when it hangs high." tabIndex={0}/>
  <header className={styles.header}><BackButton className={`pixel-btn ${styles.icon}`} onBack={onExit}/><div className={styles.heading}><span>ISLAND SOCIAL CLUB</span><strong>Futbol Tennis</strong></div><button className={`pixel-btn ${styles.icon}`} onClick={togglePause} aria-label={paused?'Resume game':'Pause game'} disabled={display.phase==='ready'||display.phase==='over'}>{paused?'▶':'Ⅱ'}</button></header>
  <div className={styles.score} aria-label={`You ${display.you}, rival ${display.rival}`}><div><span className={styles.youDot}/>YOU <b>{display.you}</b></div><small>FIRST TO 7</small><div><b>{display.rival}</b> RIVAL<span className={styles.rivalDot}/></div></div>
  {display.phase!=='ready'&&display.phase!=='over'&&<footer className={styles.controls}><p aria-live="polite">{display.message}</p><div className={styles.actionRow}>
   <span>{display.rally>1?`${display.rally} kick rally`:'One bounce per side'}<small className={styles.hintFine}>Space kick · hold = lob · X = drop · high ball = SLAM</small><small className={styles.hintCoarse}>Get under a high ball to SLAM</small></span>
   <div className={styles.cluster}>
    <button className={`pixel-btn ${styles.mini}`} onPointerDown={()=>act('drop')} disabled={paused||display.phase!=='rally'} aria-label="Short drop shot">Short<span>X</span></button>
    <button className={`pixel-btn ${styles.mini}`} onPointerDown={()=>act('lob')} disabled={paused||display.phase!=='rally'} aria-label="Deep lob">Lob<span>HOLD ␣</span></button>
    <button className={`pixel-btn ${styles.action}${slamUI?` ${styles.slam}`:''}`} onPointerDown={()=>act(slamUI?'slam':'auto')} disabled={busy} aria-label={display.phase==='serve'?'Serve':slamUI?'Slam':'Kick'}>{display.phase==='serve'?'Serve':slamUI?'SLAM!':'Kick'}<span>SPACE</span></button>
   </div></div></footer>}
  {display.phase!=='ready'&&display.phase!=='over'&&<div ref={joyRef} className={styles.joy} onPointerDown={joyDown} onPointerMove={joyMove} onPointerUp={joyEnd} onPointerCancel={joyEnd} aria-hidden="true"><div className={styles.joyRing}/><div ref={knobRef} className={styles.joyKnob}/></div>}
  {(display.phase==='ready'||display.phase==='over'||paused)&&<div className={styles.scrim}><section className={styles.card} role="dialog" aria-modal="true" aria-label={paused?'Game paused':display.phase==='over'?'Match result':'How to play futbol tennis'}>
   <span className={styles.eyebrow}>{paused?'TAKE A BREATHER':display.phase==='over'?'AFTER THE FINAL POINT':'WELCOME TO THE COURT'}</span>
   <h1>{paused?'We’ll hold your spot.':display.phase==='over'?(display.winner==='you'?'The court is yours.':'One more game?'):'A little touch.\nA lovely rally.'}</h1>
   {display.phase==='ready'?<><p>Football meets a little neighborhood tennis court. Just you, a rival, and one bounce.</p><ol><li><b>Move</b><span>Drag on your half of the court.</span></li><li><b>Return</b><span>Kick to drive, Short for a drop, Lob to go deep.</span></li><li><b>Slam</b><span>When the ball hangs HIGH near you, smash it down.</span></li><li><b>Win</b><span>Over the net, one bounce max. First to seven.</span></li></ol><small className={styles.legend}>Read the trail:<span><i className={styles.tGold}/>Kick</span><span><i className={styles.tEmber}/>Hard</span><span><i className={styles.tCream}/>Short</span><span><i className={styles.tTeal}/>Lob</span><span><i className={styles.tRed}/>Slam</span></small><small className={styles.keyboard}>Keyboard: WASD/arrows · Space = kick (hold = lob) · X = short drop · Space on a high ball = SLAM</small></>:display.phase==='over'?<p>You {display.you} · Rival {display.rival}<br/>Your longest rally: {display.best} kicks.</p>:<p>The score stays right where you left it.</p>}
   <button className={`pixel-btn ${styles.primary}`} onClick={paused?togglePause:start}>{paused?'Back to the rally':display.phase==='over'?'Play again':'Let’s play'} <span>↗</span></button>
   {(paused||display.phase==='over')&&<button className={styles.leave} onClick={onExit}>Back to games</button>}
  </section></div>}
 </div>;
}
