/**
 * Kit Rush renderer (Nov 10 2026, docs/arcade-aaa/kitrush-direction.md): 2D canvas, comic print (ink outline, flat colour, one
 * violet shadow band, Ben-Day dots). Two canvases: `bg` is the training ground at golden hour, painted ONCE per resize and never
 * again; `fg` holds only what moves and is the only thing redrawn. Every kit sprite is pre-rendered into one atlas per resize.
 * Pools for halves, bursts, dots, popups and trail points: render() allocates nothing. No loop lives here: the component calls
 * render() from its own rAF while a round is on (menus, pause, results and a hidden tab draw nothing).
 * AAA pass (Nov 18 2026): the day moves on with the stages (one scene repaint each), look-alike kits and the touchline beans are
 * re-dressed in the atlas when your kit changes, a foul shows your kit next to the one you hit, calls sit under the kit.
 */
import {KR,KIND,KIT_KINDS,TEAMS,COPY_BASE,isCopy,callFor,type KitEvent,type KitRushState} from './core';

export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8';
const SPR=1.42;// sprite half-size in item radii
type Ctx=CanvasRenderingContext2D;
const star=(c:Ctx,x:number,y:number,ro:number,ri:number,n:number,rot:number,sx=1)=>{c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?ri:ro,a=rot+Math.PI*i/n;if(i)c.lineTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);else c.moveTo(x+Math.cos(a)*r*sx,y+Math.sin(a)*r);}c.closePath();};

/* ---- kit silhouettes in unit space (1 = the item radius) ---- */
const PATHS:((c:Ctx)=>void)[]=[
 c=>{c.beginPath();c.arc(0,0,.96,0,Math.PI*2);},
 c=>{c.beginPath();c.moveTo(-.64,-1);c.lineTo(-.3,-1);c.quadraticCurveTo(0,-.4,.3,-1);c.lineTo(.64,-1);c.quadraticCurveTo(.5,-.3,.92,-.05);c.lineTo(.82,1);c.lineTo(-.82,1);c.lineTo(-.92,-.05);c.quadraticCurveTo(-.5,-.3,-.64,-1);c.closePath();},
 c=>{c.beginPath();c.moveTo(-1.08,-.62);c.lineTo(-.48,-.66);c.quadraticCurveTo(-.32,-.12,.25,-.08);c.quadraticCurveTo(.98,-.02,1.12,.38);c.lineTo(1.12,.56);c.lineTo(-1.08,.56);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.42,-.96);c.quadraticCurveTo(0,-.6,.42,-.96);c.lineTo(1.16,-.56);c.lineTo(.9,-.02);c.lineTo(.62,-.22);c.lineTo(.62,1);c.lineTo(-.62,1);c.lineTo(-.62,-.22);c.lineTo(-.9,-.02);c.lineTo(-1.16,-.56);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.26,-1);c.lineTo(.26,-1);c.lineTo(.74,.6);c.lineTo(1.06,.6);c.lineTo(1.06,.96);c.lineTo(-1.06,.96);c.lineTo(-1.06,.6);c.lineTo(-.74,.6);c.closePath();},
 c=>{c.beginPath();c.moveTo(-.5,-.3);c.quadraticCurveTo(-.5,-.58,-.28,-.66);c.lineTo(-.28,-.86);c.lineTo(.28,-.86);c.lineTo(.28,-.66);c.quadraticCurveTo(.5,-.58,.5,-.3);c.lineTo(.5,1);c.lineTo(-.5,1);c.closePath();},
];
function details(c:Ctx,kind:number){
 c.strokeStyle=INK;c.fillStyle=INK;c.lineWidth=.1;c.lineCap='round';
 if(kind===KIND.ball){star(c,0,0,.34,.27,5,-Math.PI/2);c.fill();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(Math.cos(a)*.34,Math.sin(a)*.34);c.lineTo(Math.cos(a)*.9,Math.sin(a)*.9);c.stroke();}}
 else if(kind===KIND.bib){c.beginPath();c.moveTo(-.8,.74);c.lineTo(.8,.74);c.stroke();c.fillStyle=PAPER;c.beginPath();c.arc(0,.12,.3,0,Math.PI*2);c.fill();c.stroke();}
 else if(kind===KIND.boot){c.fillStyle=INK;for(const x of[-.85,-.35,.2,.75])c.fillRect(x,.56,.2,.26);c.strokeStyle=PAPER;c.lineWidth=.11;for(const x of[-.12,.14,.4]){c.beginPath();c.moveTo(x-.1,-.28+x*.12);c.lineTo(x+.08,.06+x*.1);c.stroke();}c.strokeStyle=INK;c.lineWidth=.09;c.beginPath();c.moveTo(-1.05,.34);c.lineTo(1.1,.34);c.stroke();}
 else if(kind===KIND.shirt){c.beginPath();c.moveTo(-.42,-.96);c.quadraticCurveTo(0,-.36,.42,-.96);c.stroke();c.beginPath();c.moveTo(-.62,-.22);c.lineTo(-.62,.2);c.moveTo(.62,-.22);c.lineTo(.62,.2);c.stroke();}
 else if(kind===KIND.cone){c.fillStyle=PAPER;c.beginPath();c.moveTo(-.43,-.42);c.lineTo(.43,-.42);c.lineTo(.56,0);c.lineTo(-.56,0);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-.74,.6);c.lineTo(.74,.6);c.stroke();}
 else if(kind===KIND.bottle){c.fillStyle=PAPER;c.fillRect(-.15,-1.14,.3,.3);c.strokeRect(-.15,-1.14,.3,.3);c.beginPath();c.moveTo(-.5,-.3);c.lineTo(.5,-.3);c.moveTo(-.5,.5);c.lineTo(.5,.5);c.stroke();c.fillStyle=PAPER;c.fillRect(-.45,-.05,.9,.34);c.strokeRect(-.45,-.05,.9,.34);}
}
/** `pattern` is the team whose pattern is worn: a look-alike is YOUR colour with another team's pattern. */
function paintKit(c:Ctx,kind:number,team:number,pattern=team){
 const t=TEAMS[team],pat=TEAMS[pattern].pattern,path=PATHS[kind];c.lineJoin='round';
 path(c);c.fillStyle=t.color;c.fill();c.save();path(c);c.clip();c.fillStyle=t.dark;
 if(pat==='hoops')for(let y=-1.1;y<1.2;y+=.52)c.fillRect(-1.4,y,2.8,.24);
 else if(pat==='stripes')for(let x=-1.02;x<1.2;x+=.5)c.fillRect(x,-1.4,.22,2.8);
 else if(pat==='sash'){c.rotate(-.7);c.fillRect(-2,-.21,4,.42);c.rotate(.7);}
 c.fillStyle='rgba(72,48,120,.26)';c.beginPath();c.rect(-1.5,-1.5,3,3);c.arc(-.5,-.56,1.42,0,Math.PI*2,true);c.fill('evenodd');
 c.fillStyle='rgba(255,243,214,.6)';c.beginPath();c.ellipse(-.36,-.5,.2,.1,-.6,0,Math.PI*2);c.fill();
 c.restore();path(c);c.lineWidth=.17;c.strokeStyle=INK;c.stroke();details(c,kind);
}
function paintSpecial(c:Ctx,kind:number){
 c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;
 if(kind===KIND.whistle){
  star(c,0,0,1.34,.98,11,.2);c.fillStyle=RED;c.fill();c.lineWidth=.15;c.stroke();
  c.fillStyle=PAPER;c.beginPath();c.rect(-.1,-.5,1,.42);c.fill();c.stroke();c.beginPath();c.arc(-.22,.08,.56,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='rgba(72,48,120,.36)';c.beginPath();c.arc(-.22,.08,.5,.3,2.4);c.fill();
  c.fillStyle=INK;c.beginPath();c.arc(-.22,.08,.17,0,Math.PI*2);c.fill();c.lineWidth=.1;c.beginPath();c.arc(-.74,-.44,.17,0,Math.PI*2);c.stroke();
 }else if(kind===KIND.golden){
  star(c,0,0,1.36,1,9,0);c.fillStyle=ORANGE;c.fill();c.lineWidth=.13;c.stroke();
  c.beginPath();c.arc(0,0,.9,0,Math.PI*2);c.fillStyle=SUN;c.fill();c.fillStyle='rgba(255,243,214,.85)';c.beginPath();c.ellipse(-.34,-.44,.26,.12,-.6,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(0,0,.9,0,Math.PI*2);c.lineWidth=.17;c.stroke();c.fillStyle='#b9621a';star(c,0,0,.32,.26,5,-Math.PI/2);c.fill();c.strokeStyle='#b9621a';c.lineWidth=.1;
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.moveTo(Math.cos(a)*.32,Math.sin(a)*.32);c.lineTo(Math.cos(a)*.84,Math.sin(a)*.84);c.stroke();}
 }else if(kind===KIND.stopwatch){
  c.fillStyle=TEAL;c.fillRect(-.16,-1.22,.32,.34);c.lineWidth=.13;c.strokeRect(-.16,-1.22,.32,.34);
  c.beginPath();c.arc(0,.14,.98,0,Math.PI*2);c.fillStyle=TEAL;c.fill();c.lineWidth=.17;c.stroke();c.beginPath();c.arc(0,.14,.68,0,Math.PI*2);c.fillStyle=PAPER;c.fill();c.lineWidth=.11;c.stroke();
  c.lineWidth=.14;c.beginPath();c.moveTo(0,.14);c.lineTo(0,-.38);c.moveTo(0,.14);c.lineTo(.34,.3);c.stroke();
 }else{
  c.beginPath();c.moveTo(-1.1,-.46);c.quadraticCurveTo(0,-.72,1.1,-.46);c.lineTo(1.1,.5);c.quadraticCurveTo(0,.24,-1.1,.5);c.closePath();c.fillStyle=RED;c.fill();
  c.fillStyle=PAPER;c.beginPath();c.arc(0,-.06,.47,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-1.1,-.46);c.quadraticCurveTo(0,-.72,1.1,-.46);c.lineTo(1.1,.5);c.quadraticCurveTo(0,.24,-1.1,.5);c.closePath();c.lineWidth=.17;c.stroke();
  c.lineWidth=.16;c.beginPath();c.arc(.02,-.06,.24,.8,Math.PI*2-.8);c.stroke();
 }
}

/* ---- the touchline beans (AAA pass, Nov 18 2026): your team-mates wear your kit and live the round with you; the referee owns the whistle ---- */
const SKIN='#ffd9a8',FOOT=1.14;
function capsule(c:Ctx,x:number,y:number,w:number,h:number){const r=w/2;c.beginPath();c.arc(x+r,y+r,r,Math.PI,0);c.lineTo(x+w,y+h-r);c.arc(x+r,y+h-r,r,0,Math.PI);c.closePath();}
/** An island bean in unit space (1 = the item radius). team 0-3 wears that kit (colour AND pattern), -1 is the referee.
 *  pose 0 ready, 1 arms up (a cheer; the referee's whistle arm), 2 head in hands. */
function paintBean(c:Ctx,team:number,pose:number){
 const t=team>=0?TEAMS[team]:null,shirt=t?t.color:'#3a3048',dark=t?t.dark:INK;c.lineJoin='round';c.lineCap='round';
 c.fillStyle='rgba(35,26,46,.3)';c.beginPath();c.ellipse(.06,FOOT+.08,.86,.16,0,0,Math.PI*2);c.fill();
 c.fillStyle=INK;c.beginPath();c.ellipse(-.3,FOOT,.25,.13,0,0,Math.PI*2);c.ellipse(.3,FOOT,.25,.13,0,0,Math.PI*2);c.fill();
 const arm=(x0:number,y0:number,x1:number,y1:number)=>{c.strokeStyle=INK;c.lineWidth=.36;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.strokeStyle=shirt;c.lineWidth=.17;c.stroke();c.fillStyle=SKIN;c.beginPath();c.arc(x1,y1,.2,0,Math.PI*2);c.fill();c.strokeStyle=INK;c.lineWidth=.1;c.stroke();};
 if(pose===1){arm(.5,.05,.98,-.92);if(t)arm(-.5,.05,-.98,-.92);else arm(-.5,.15,-.86,.42);}else if(pose===0){arm(-.5,.15,-.86,.42);arm(.5,.15,.86,.42);}
 capsule(c,-.68,-1.22,1.36,2.3);c.fillStyle=shirt;c.fill();c.save();capsule(c,-.68,-1.22,1.36,2.3);c.clip();c.fillStyle=dark;
 if(t){if(t.pattern==='hoops'){c.fillRect(-1,.2,2,.2);c.fillRect(-1,.62,2,.2);}else if(t.pattern==='stripes'){for(const x of [-.46,-.1,.26])c.fillRect(x,-.3,.2,1.6);}else if(t.pattern==='sash'){c.save();c.translate(0,.52);c.rotate(-.7);c.fillRect(-1.5,-.16,3,.32);c.restore();}}
 else{c.fillStyle=PAPER;c.fillRect(-.16,-.1,.32,.5);c.fillStyle=SUN;c.fillRect(.24,.3,.24,.34);}
 c.fillStyle=SKIN;c.beginPath();c.ellipse(0,-.62,.9,.62,0,0,Math.PI*2);c.fill();
 c.fillStyle=t?dark:INK;c.beginPath();c.ellipse(0,-1.16,.74,.26,0,0,Math.PI*2);c.fill();
 c.fillStyle='rgba(72,48,120,.24)';c.fillRect(.3,-1.4,.6,2.8);c.restore();
 capsule(c,-.68,-1.22,1.36,2.3);c.lineWidth=.15;c.strokeStyle=INK;c.stroke();
 c.lineWidth=.09;c.beginPath();c.moveTo(-.62,-.04);c.quadraticCurveTo(0,.12,.62,-.04);c.stroke();
 c.fillStyle=INK;c.lineWidth=.08;
 if(pose===1&&t){for(const x of [-.27,.27]){c.beginPath();c.arc(x,-.6,.11,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.beginPath();c.arc(0,-.42,.2,0,Math.PI);c.closePath();c.fill();}
 else{for(const x of [-.27,.27]){c.beginPath();c.ellipse(x,-.66,.075,.115,0,0,Math.PI*2);c.fill();}
  if(pose===2){c.beginPath();c.arc(0,-.24,.17,Math.PI*1.2,Math.PI*1.8);c.stroke();}
  else if(!t&&pose===1){c.fillStyle=PAPER;c.fillRect(-.08,-.5,.42,.2);c.strokeRect(-.08,-.5,.42,.2);}
  else{c.beginPath();c.arc(0,-.5,.17,Math.PI*.15,Math.PI*.85);c.stroke();}}
 if(pose===2){arm(-.5,.15,-.36,-.52);arm(.5,.15,.36,-.52);}
}

/* ---- the scene: the training ground from the touchline. The day moves on with the stages: golden hour, sunset, dusk, floodlit night ---- */
const SKY=[['#2f5fa8','#5a78b4','#f08a5a','#ffa866','#ffcf7a'],['#3a4a98','#7a5aa6','#e8627a','#ff8f5a','#ffc070'],['#1f2658','#343a80','#6a4a92','#b85a80','#ee9468'],['#12173a','#19204c','#202a5e','#28346e','#303e7e']] as const;
const SUNS=[['#ff8a3c','#ffc24a','#fff1b0'],['#f0553c','#ff8a3c','#ffd27a'],['#d8486a','#f0704a','#ffb46a']] as const;
const GRASS=[['#3f9a5c','#56ad62'],['#3b9058','#4fa25e'],['#347f54','#449158'],['#2b6f4e','#3a8254']] as const;
const STAND=['#6a5a9c','#5e4f92','#4a3f7c','#332c5e'] as const,CROWD=['#8f78b8','#8068ac','#6a5a9c','#4a3f7c'] as const;
const CLOUDS=[[PAPER,'#ffe6c2','#ffd9a8'],['#ffd9c2','#ffc2a0','#ffb088'],['#8f78b8','#7a68a8','#a078b0'],['#28346e','#28346e','#303e7e']] as const;
export const KIT_RUSH_SCENES=SKY.length;
function paintScene(c:Ctx,W:number,H:number,tod:number){
 const hz=H*.5,u=W/100,sky=SKY[tod],lit=tod>=2;c.lineJoin='round';c.setLineDash([]);
 c.fillStyle=sky[0];c.fillRect(0,0,W,hz*.42);c.fillStyle=sky[1];c.fillRect(0,hz*.42,W,hz*.14);c.fillStyle=sky[2];c.fillRect(0,hz*.56,W,hz*.2);c.fillStyle=sky[3];c.fillRect(0,hz*.76,W,hz*.12);c.fillStyle=sky[4];c.fillRect(0,hz*.88,W,hz*.13);
 // Ben-Day dots where the sky turns
 c.fillStyle=sky[2];for(let row=0;row<5;row++)for(let x=(row%2)*u*1.5;x<W;x+=u*3){c.beginPath();c.arc(x,hz*.56-u*1.2-row*u*2.4,Math.max(.4,u*(.95-row*.17)),0,Math.PI*2);c.fill();}
 c.fillStyle=sky[4];for(let row=0;row<4;row++)for(let x=(row%2)*u*1.5;x<W;x+=u*3){c.beginPath();c.arc(x,hz*.88-u*1.1-row*u*2.2,Math.max(.4,u*(.9-row*.2)),0,Math.PI*2);c.fill();}
 if(tod<3){// the sun: stacked discs, lower each stage
  const sx=W*.7,sy=hz*(.8+tod*.11),sun=SUNS[tod];for(let i=0;i<3;i++){c.fillStyle=sun[i];c.beginPath();c.arc(sx,sy,(30-i*6)*u,0,Math.PI*2);c.fill();}
 }else{// night: stars and a cut moon
  c.fillStyle=PAPER;for(let i=0;i<34;i++){const x=((i*61)%97)/97*W,y=((i*37)%53)/53*hz*.7,r=u*(.28+(i%3)*.14);if(i%5===0){star(c,x,y,r*2.4,r*.8,4,0);c.fill();}else{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}}
  c.beginPath();c.arc(W*.72,hz*.3,u*7,0,Math.PI*2);c.fill();c.lineWidth=u*.5;c.strokeStyle=INK;c.stroke();c.fillStyle=sky[0];c.beginPath();c.arc(W*.72+u*3,hz*.3-u*1.6,u*5.6,0,Math.PI*2);c.fill();}
 // cut clouds (none hides behind the kit banner)
 const cl=CLOUDS[tod],cloud=(x:number,y:number,s:number,col:string)=>{c.fillStyle=col;c.beginPath();c.moveTo(x-9*s,y);c.quadraticCurveTo(x-9*s,y-3*s,x-4*s,y-3*s);c.quadraticCurveTo(x-2*s,y-7*s,x+3*s,y-4.4*s);c.quadraticCurveTo(x+9*s,y-5*s,x+10*s,y);c.closePath();c.fill();c.lineWidth=u*.5;c.strokeStyle=INK;c.stroke();};
 cloud(W*.2,hz*.7,u*1.5,cl[0]);cloud(W*.84,hz*.24,u*1.1,cl[1]);cloud(W*.54,hz*.5,u*.9,cl[2]);
 // far stand: two rows of heads, flags, and the boards along the touchline
 c.fillStyle=STAND[tod];c.beginPath();c.moveTo(0,hz);c.lineTo(0,hz*.84);c.lineTo(W*.3,hz*.78);c.lineTo(W*.34,hz*.86);c.lineTo(W*.62,hz*.86);c.lineTo(W*.66,hz*.8);c.lineTo(W,hz*.86);c.lineTo(W,hz);c.closePath();c.fill();c.lineWidth=u*.55;c.strokeStyle=INK;c.stroke();
 for(let row=0;row<2;row++){let i=0;for(let x=u*(2+row*1.6);x<W;x+=u*3.2,i++){const y=hz*(.93-row*.035)+((x*13)%7)*u*.12-u*1.6;c.fillStyle=lit&&(i+row)%5===0?SUN:row?STAND[Math.max(0,tod-1)]:CROWD[tod];c.beginPath();c.arc(x,y,u*(.75-row*.12),0,Math.PI*2);c.fill();}}
 for(const fx of [.16,.44,.78]){const x=W*fx,y=hz*.9;c.strokeStyle=INK;c.lineWidth=u*.35;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-u*6);c.stroke();c.fillStyle=fx===.44?'#e9dcc2':PAPER;c.beginPath();c.moveTo(x,y-u*6);c.lineTo(x+u*4.4,y-u*4.8);c.lineTo(x,y-u*3.4);c.closePath();c.fill();c.stroke();}
 const bw0=W/8,bh0=u*3.6,boards=['#e9dcc2','#4a3d66',PAPER,'#6a5a9c'];
 for(let i=0;i<8;i++){const x=i*bw0,y=hz-bh0;c.fillStyle=boards[i%4];c.fillRect(x,y,bw0,bh0);c.lineWidth=u*.45;c.strokeStyle=INK;c.strokeRect(x,y,bw0,bh0);c.fillStyle=i%2?PAPER:INK;
  if(i%4===0){c.beginPath();c.arc(x+bw0*.5,y+bh0*.5,bh0*.28,0,Math.PI*2);c.fill();}else if(i%4===2){star(c,x+bw0*.5,y+bh0*.5,bh0*.38,bh0*.16,5,-Math.PI/2);c.fill();}else{c.fillRect(x+bw0*.2,y+bh0*.36,bw0*.6,bh0*.12);c.fillRect(x+bw0*.3,y+bh0*.6,bw0*.4,bh0*.1);}}
 // floodlight masts: lamps glow from dusk on
 for(const mx of [W*.1,W*.9]){c.strokeStyle=INK;c.lineWidth=u*.9;c.beginPath();c.moveTo(mx,hz);c.lineTo(mx,hz*.4);c.stroke();
  if(lit){star(c,mx,hz*.34+u*1.7,u*8.5,u*5.4,12,.2);c.fillStyle=tod>=3?'#fff8e0':'#ffe9a8';c.fill();}
  c.fillStyle=PAPER;c.fillRect(mx-u*3.4,hz*.34,u*6.8,u*3.4);c.lineWidth=u*.55;c.strokeStyle=INK;c.strokeRect(mx-u*3.4,hz*.34,u*6.8,u*3.4);c.fillStyle=lit?'#fffbe6':SUN;for(let i=0;i<3;i++){c.beginPath();c.arc(mx-u*2.1+i*u*2.1,hz*.34+u*1.7,u*.7,0,Math.PI*2);c.fill();if(lit)c.stroke();}}
 // the pitch: mown bands, flat
 const bands=7,gr=GRASS[tod];for(let i=0;i<bands;i++){const y0=hz+(H-hz)*Math.pow(i/bands,1.5),y1=hz+(H-hz)*Math.pow((i+1)/bands,1.5);c.fillStyle=i%2?gr[0]:gr[1];c.fillRect(0,y0,W,y1-y0+1);}
 if(lit){// pools of lamp light on the grass and the two beams: flat paper tints, no gradient
  c.fillStyle=tod>=3?'rgba(255,243,214,.13)':'rgba(255,243,214,.08)';c.beginPath();c.ellipse(W*.3,hz+(H-hz)*.5,u*30,u*17,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(W*.72,hz+(H-hz)*.42,u*30,u*15,0,0,Math.PI*2);c.fill();
  c.fillStyle=tod>=3?'rgba(255,243,214,.1)':'rgba(255,243,214,.06)';for(const [mx,dir] of [[W*.1,1],[W*.9,-1]] as const){c.beginPath();c.moveTo(mx-u*3,hz*.34+u*3.4);c.lineTo(mx+u*3,hz*.34+u*3.4);c.lineTo(mx+dir*u*52,hz);c.lineTo(mx+dir*u*8,hz);c.closePath();c.fill();}}
 c.strokeStyle=INK;c.lineWidth=u*.6;c.beginPath();c.moveTo(0,hz);c.lineTo(W,hz);c.stroke();
 // goal frame on the far touchline, with a net hatch
 const gx=W*.5,gw=u*34,gh=u*13,gy=hz+u*4;c.strokeStyle='rgba(255,243,214,.55)';c.lineWidth=u*.22;for(let i=1;i<12;i++){const x=gx-gw/2+gw*i/12;c.beginPath();c.moveTo(x,gy-gh);c.lineTo(x,gy);c.stroke();}for(let j=1;j<5;j++){c.beginPath();c.moveTo(gx-gw/2,gy-gh*j/5);c.lineTo(gx+gw/2,gy-gh*j/5);c.stroke();}
 c.strokeStyle=INK;c.lineWidth=u*1.7;c.beginPath();c.moveTo(gx-gw/2,gy);c.lineTo(gx-gw/2,gy-gh);c.lineTo(gx+gw/2,gy-gh);c.lineTo(gx+gw/2,gy);c.stroke();c.strokeStyle=PAPER;c.lineWidth=u*.8;c.stroke();
 // pitch markings in paper: the box and the long violet evening shadows
 c.strokeStyle=PAPER;c.lineWidth=u*.7;c.beginPath();c.moveTo(W*.14,gy+u*1);c.lineTo(W*.86,gy+u*1);c.moveTo(W*.2,gy+u*1);c.lineTo(W*.08,hz+(H-hz)*.42);c.lineTo(W*.92,hz+(H-hz)*.42);c.lineTo(W*.8,gy+u*1);c.stroke();
 c.beginPath();c.ellipse(W*.5,hz+(H-hz)*.42,u*16,u*5,0,0,Math.PI);c.stroke();
 const P=(f:number)=>hz+(H-hz)*f,shadow=tod>=3?'rgba(24,20,60,.36)':'rgba(72,48,120,.3)';
 c.fillStyle='rgba(35,26,46,.16)';for(let i=1;i<bands;i++){const y=hz+(H-hz)*Math.pow(i/bands,1.5);for(let x=(i%2)*u*1.6;x<W;x+=u*3.2){c.beginPath();c.arc(x,y+u*1,u*.55,0,Math.PI*2);c.fill();}}
 c.fillStyle=shadow;c.beginPath();c.moveTo(gx-gw/2-u*.8,gy);c.lineTo(gx+gw/2+u*.8,gy);c.lineTo(gx+gw/2-u*20,gy+u*9);c.lineTo(gx-gw/2-u*20,gy+u*9);c.closePath();c.fill();
 // free-kick mannequins on the right of the box, each with its shadow
 for(let i=0;i<3;i++){const mx=W*.66+i*u*7.5,my=P(.5),mh=u*13;c.fillStyle=shadow;c.beginPath();c.moveTo(mx-u*2.4,my);c.lineTo(mx+u*2.4,my);c.lineTo(mx-u*15,my+u*7);c.lineTo(mx-u*19,my+u*7);c.closePath();c.fill();
  c.fillStyle=i===1?'#e9dcc2':'#6a5a9c';/* scenery never wears a kit colour */c.beginPath();c.moveTo(mx-u*2.6,my);c.lineTo(mx-u*2.6,my-mh*.62);c.quadraticCurveTo(mx-u*2.6,my-mh*.8,mx-u*1.2,my-mh*.8);c.arc(mx,my-mh*.86,u*1.7,Math.PI*.8,Math.PI*.2);c.quadraticCurveTo(mx+u*2.6,my-mh*.8,mx+u*2.6,my-mh*.62);c.lineTo(mx+u*2.6,my);c.closePath();c.fill();c.lineWidth=u*.6;c.strokeStyle=INK;c.stroke();
  c.fillStyle='rgba(72,48,120,.4)';c.fillRect(mx-u*2.3,my-mh*.6,u*1.7,mh*.6);}
 // a slalom of cones on the left (it stops short of the touchline, where the team-mates stand)
 for(let i=0;i<4;i++){const k=i/4,cx=W*(.2+.16*k),cy=P(.56+.26*k),sz=u*(2.2+2.2*k);c.fillStyle=shadow;c.beginPath();c.moveTo(cx-sz,cy);c.lineTo(cx+sz,cy);c.lineTo(cx-sz*3.6,cy+sz*1.1);c.lineTo(cx-sz*4.6,cy+sz*1.1);c.closePath();c.fill();
  c.fillStyle='#e9dcc2';c.beginPath();c.moveTo(cx-sz*.3,cy-sz*2.3);c.lineTo(cx+sz*.3,cy-sz*2.3);c.lineTo(cx+sz,cy);c.lineTo(cx-sz,cy);c.closePath();c.fill();c.lineWidth=Math.max(1,sz*.24);c.strokeStyle=INK;c.stroke();
  c.fillStyle='#6a5a9c';c.fillRect(cx-sz*.55,cy-sz*1.35,sz*1.1,sz*.45);}
 // a corner flag and two stray balls
 c.strokeStyle=INK;c.lineWidth=u*.7;c.beginPath();c.moveTo(W*.9,P(.7));c.lineTo(W*.9,P(.7)-u*17);c.stroke();c.fillStyle=PAPER;c.beginPath();c.moveTo(W*.9,P(.7)-u*17);c.lineTo(W*.9-u*8,P(.7)-u*14);c.lineTo(W*.9,P(.7)-u*11);c.closePath();c.fill();c.lineWidth=u*.55;c.stroke();
 for(const [bx,byy,br] of [[W*.74,P(.8),u*3.2],[W*.6,P(.66),u*2.3]] as const){c.fillStyle=shadow;c.beginPath();c.ellipse(bx-br*1.5,byy+br*.8,br*2,br*.5,0,0,Math.PI*2);c.fill();c.fillStyle=PAPER;c.beginPath();c.arc(bx,byy,br,0,Math.PI*2);c.fill();c.lineWidth=br*.2;c.strokeStyle=INK;c.stroke();c.fillStyle=INK;star(c,bx,byy,br*.4,br*.32,5,-1.2);c.fill();}
 // the open kit bag at the bottom edge: everything flies out of it
 const by=H-u*10,bw=u*60;c.fillStyle=INK;c.beginPath();c.ellipse(W*.5+u*1.2,H-u*1,bw*.56,u*4,0,0,Math.PI*2);c.fill();
 c.fillStyle='#4a3d66';c.beginPath();c.moveTo(W*.5-bw/2,H+u);c.lineTo(W*.5-bw/2+u*3,by);c.quadraticCurveTo(W*.5,by-u*5,W*.5+bw/2-u*3,by);c.lineTo(W*.5+bw/2,H+u);c.closePath();c.fill();c.lineWidth=u*.9;c.strokeStyle=INK;c.stroke();
 c.fillStyle=INK;c.beginPath();c.ellipse(W*.5,by+u*.6,bw*.36,u*2.6,0,0,Math.PI*2);c.fill();c.strokeStyle=PAPER;c.lineWidth=u*.45;c.setLineDash([u*1.2,u*1.2]);c.beginPath();c.ellipse(W*.5,by+u*.6,bw*.39,u*3.3,0,Math.PI,Math.PI*2);c.stroke();c.setLineDash([]);
 c.fillStyle=PAPER;c.fillRect(W*.5-u*9,by+u*4.2,u*18,u*3.2);c.lineWidth=u*.5;c.strokeStyle=INK;c.strokeRect(W*.5-u*9,by+u*4.2,u*18,u*3.2);
}

type Half={on:boolean;spr:number;x:number;y:number;vx:number;vy:number;rot:number;vr:number;cut:number;side:number;life:number};
type Burst={on:boolean;x:number;y:number;life:number;max:number;color:string;size:number;rot:number};
type Dot={on:boolean;x:number;y:number;vx:number;vy:number;life:number;color:string;r:number};
/** `fly`: a points numeral that ends by flying to the score counter; a word (CLOSE!, DROPPED) only rises. */
type Pop={on:boolean;x:number;y:number;x0:number;y0:number;life:number;max:number;text:string;big:boolean;fly:boolean;color:string};
type Trail={x:Float32Array;y:Float32Array;t:Float32Array;head:number;n:number};
const TRAIL=18,TRAIL_MS=150;
const STAGE_WORDS=['','THIRD KIT!','LOOK-ALIKES!','FOUR KITS!','QUICK SWITCH!','FASTER!'] as const;
const STAGE_SUBS=['','A NEW TEAM JOINS','CHECK THE PATTERN','ONLY ONE KIT IS YOURS','YOUR KIT CHANGES FASTER','KEEP SCANNING'] as const;
const FOUL_WORDS=['WRONG KIT!','WHISTLE!','DROPPED!','LOOK-ALIKE!'] as const;
const FOUL_SUBS=['NOT YOUR COLOUR','','SWIPE ALL OF YOUR OWN KIT','RIGHT COLOUR, WRONG PATTERN'] as const;
// atlas cells: 0-23 the four kits, 24-27 whistle and specials, 28-51 look-alikes (YOUR colour, each pattern), 52-54 team-mate poses, 55-56 referee
const A_COPY=28,A_MATE=52,A_REF=55,A_CELLS=57;
/** Where the team-mates stand on the left touchline (x, feet up from the bottom edge, size): the nearest first. */
const MATES=[[11.5,4.5,1.15],[9,23,.94],[7.8,37.5,.8],[7,49,.68]] as const;

export type KitRushView=ReturnType<typeof createKitRushView>;
export function createKitRushView(bg:HTMLCanvasElement,fg:HTMLCanvasElement,opts:{reduced:boolean}){
 const bctx=bg.getContext('2d',{alpha:false})!,ctx=fg.getContext('2d')!;
 let W=0,H=0,dpr=1,u=1,S=0,cols=8,tod=0,myTeam=0;const atlas=document.createElement('canvas'),actx=atlas.getContext('2d')!;
 const halves:Half[]=Array.from({length:28},()=>({on:false,spr:0,x:0,y:0,vx:0,vy:0,rot:0,vr:0,cut:0,side:1,life:0}));
 const bursts:Burst[]=Array.from({length:14},()=>({on:false,x:0,y:0,life:0,max:.2,color:SUN,size:1,rot:0}));
 const dots:Dot[]=Array.from({length:56},()=>({on:false,x:0,y:0,vx:0,vy:0,life:0,color:INK,r:1}));
 const pops:Pop[]=Array.from({length:12},()=>({on:false,x:0,y:0,x0:0,y0:0,life:0,max:.7,text:'',big:false,fly:false,color:PAPER}));
 const trails:Trail[]=[0,1,2,3].map(()=>({x:new Float32Array(TRAIL),y:new Float32Array(TRAIL),t:new Float32Array(TRAIL),head:0,n:0}));
 const call={life:0,max:1,text:'',sub:'',color:RED,x:50,y:60,tilt:0,w:1,size:1},kit={life:0,max:1,team:0,title:''};
 // the wrong answer teaches: your kit next to the one you hit, with the detail that gave it away
 const teach={life:0,max:1,kind:0,team:0,cause:0,sub:'',fit:1};
 // the touchline: how far each team-mate has popped in (0-1), the mood (0 ready, 1 cheer, 2 head in hands) and its clocks
 const squad=[1,0,0,0],crew={mood:0,moodT:0,jump:0,jumpMax:.5,hop:0,flip:0,ref:0};
 const pointText=new Map<number,string>();let shake=0,flash=0,jit=7,fontPop='',fontPopBig='',fontCall='',fontCap='',fontNote='';
 const rnd=()=>{jit=(jit*1103515245+12345)&0x7fffffff;return jit/0x7fffffff;};
 const sprite=(kind:number,team:number)=>kind<KIT_KINDS?(isCopy(team)?A_COPY+kind*4+(team-COPY_BASE):kind*4+Math.max(0,team)):24+(kind-KIT_KINDS);
 const cell=(i:number)=>{actx.setTransform(1,0,0,1,0,0);actx.clearRect((i%cols)*S,Math.floor(i/cols)*S,S,S);actx.translate((i%cols)*S+S/2,Math.floor(i/cols)*S+S/2);actx.scale(KR.r*u,KR.r*u);};
 /** Everything that wears YOUR kit is painted again when your kit changes: the look-alikes (your colour, the other patterns) and the team-mates. */
 function dress(team:number){myTeam=team;if(!S)return;for(let k=0;k<KIT_KINDS;k++)for(let p=0;p<4;p++){cell(A_COPY+k*4+p);paintKit(actx,k,team,p);}for(let p=0;p<3;p++){cell(A_MATE+p);paintBean(actx,team,p);}actx.setTransform(1,0,0,1,0,0);}
 function resize(cssW:number,cssH:number,ratio:number){
  dpr=ratio;W=Math.max(1,Math.round(cssW*dpr));H=Math.max(1,Math.round(cssH*dpr));u=W/KR.fieldW;
  for(const cv of [bg,fg]){cv.width=W;cv.height=H;}
  paintScene(bctx,W,H,tod);
  S=Math.ceil(KR.r*u*SPR*2)+2;cols=8;atlas.width=S*cols;atlas.height=S*Math.ceil(A_CELLS/cols);
  for(let i=0;i<28;i++){cell(i);if(i<24)paintKit(actx,Math.floor(i/4),i%4);else paintSpecial(actx,KIT_KINDS+i-24);}
  for(let p=0;p<2;p++){cell(A_REF+p);paintBean(actx,-1,p);}dress(myTeam);
  const px=(n:number)=>Math.round(n*u);
  fontPop=`400 ${px(7)}px IslandBrush,"Arial Black",sans-serif`;fontPopBig=`400 ${px(10)}px IslandBrush,"Arial Black",sans-serif`;
  fontCall=`italic 900 ${px(11)}px "Arial Black","Avenir Next Condensed",Impact,sans-serif`;fontCap=`800 ${px(4.2)}px system-ui,-apple-system,"Segoe UI",sans-serif`;fontNote=`italic 900 ${px(5.4)}px "Arial Black","Avenir Next Condensed",Impact,sans-serif`;
  ctx.clearRect(0,0,W,H);
 }
 /** The time of day follows the stage: one repaint of the still scene, in the breather. */
 function setScene(stage:number){const t=Math.max(0,Math.min(KIT_RUSH_SCENES-1,stage));if(t===tod)return;tod=t;if(W>1)paintScene(bctx,W,H,tod);}
 function spawnBurst(x:number,y:number,color:string,size:number,max=.2){for(const b of bursts)if(!b.on){b.on=true;b.x=x;b.y=y;b.life=max;b.max=max;b.color=color;b.size=size;b.rot=rnd()*6.28;return;}}
 function spawnDots(x:number,y:number,color:string,n:number,speed:number){let k=n;for(const d of dots){if(k<=0)return;if(d.on)continue;const a=rnd()*6.28,v=speed*(.4+rnd()*.8);d.on=true;d.x=x;d.y=y;d.vx=Math.cos(a)*v;d.vy=Math.sin(a)*v-speed*.3;d.life=.35+rnd()*.25;d.color=color;d.r=.6+rnd()*.9;k--;}}
 function pop(x:number,y:number,text:string,big:boolean,fly:boolean,color:string,life=.7){for(const p of pops)if(!p.on){p.on=true;p.x=p.x0=Math.max(8,Math.min(92,x));p.y=p.y0=y;p.life=p.max=life;p.text=text;p.big=big;p.fly=fly;p.color=color;return;}}
 function spawnPop(x:number,y:number,points:number,big:boolean){let t=pointText.get(points);if(!t){t='+'+points;pointText.set(points,t);}pop(x,y,t,big,true,big?SUN:PAPER,big?.85:.7);}
 function say(text:string,color:string,x:number,y:number,dur=.85,size=1,sub=''){call.size=size;call.text=text;call.sub=sub;call.color=color;call.life=dur;call.max=dur;ctx.font=fontCall;call.w=Math.max(1,ctx.measureText(text).width);
  const half=Math.min(1,W*.66/call.w)*size*call.w*.74/u;call.x=half>=47?50:Math.max(half+3,Math.min(97-half,x));call.y=y;call.tilt=(rnd()-.5)*.16;}
 function cheer(dur:number){crew.mood=1;crew.moodT=dur;crew.jump=crew.jumpMax=opts.reduced?0:.46;}
 /** Reacts to one rules event (the component drains the game's events into this, the sound and the HUD). */
 function onEvent(e:KitEvent,s:KitRushState){
  if(e.type==='slice'){const spr=sprite(e.c,e.d===-2?-1:e.d),col=e.c>=KIT_KINDS?SUN:TEAMS[Math.max(0,e.d)&3].color;let n=0;
   for(const hf of halves){if(hf.on)continue;const side=n?-1:1,nx=-Math.sin(e.ang)*side,ny=Math.cos(e.ang)*side;hf.on=true;hf.spr=spr;hf.x=e.x;hf.y=e.y;hf.vx=nx*22+Math.cos(e.ang)*14;hf.vy=ny*22+Math.sin(e.ang)*14-16;hf.rot=0;hf.vr=side*(3+rnd()*3);hf.cut=e.ang;hf.side=side;hf.life=.75;if(++n>=2)break;}
   spawnBurst(e.x,e.y,e.b>=3?SUN:PAPER,1+Math.min(e.b,6)*.14);spawnDots(e.x,e.y,col,opts.reduced?2:5,38);spawnPop(e.x,e.y-6,e.a,e.b>=3);if(e.b>=4&&!opts.reduced)shake=Math.max(shake,.1);if(crew.mood!==2&&!opts.reduced)crew.hop=.16;}
  else if(e.type==='toss'){if(!opts.reduced)spawnDots(e.x,s.h-7,PAPER,1,20);}
  else if(e.type==='puff'){spawnBurst(e.x,e.y,PAPER,.7,.16);if(!opts.reduced)spawnDots(e.x,e.y,INK,2,24);}
  else if(e.type==='foul'){for(const p of pops)if(p.on&&p.text==='CLOSE!')p.on=false;// a near miss that became a hit is not close
   spawnBurst(e.x,e.y,RED,2.4,.34);spawnDots(e.x,e.y,RED,opts.reduced?3:10,60);say(FOUL_WORDS[e.a]??FOUL_WORDS[0],RED,50,s.h*.3,1,e.a===1?1:.86);if(!opts.reduced){shake=.28;flash=.14;}
   crew.mood=2;crew.moodT=1.1;crew.jump=0;if(e.a===1)crew.ref=1.1;
   if(e.a!==1){teach.life=teach.max=KR.safe;teach.kind=Math.min(e.c,KIT_KINDS-1);teach.team=e.d;teach.cause=e.a;teach.sub=FOUL_SUBS[e.a]??'';ctx.font=fontCap;teach.fit=Math.min(1,u*68/Math.max(1,ctx.measureText(teach.sub).width));}}
  else if(e.type==='call'){say(callFor(e.a),e.a>=5?ORANGE:e.a>=3?RED:TEAL,e.x,Math.max(s.h*.22,e.y-16),.5+Math.min(e.a,6)*.08,e.a<=2?.44:e.a===3?.62:e.a===4?.8:1);if(e.b>0)spawnPop(e.x,e.y-16,e.b,true);if(e.a>=3)cheer(.5+e.a*.1);}
  else if(e.type==='switch'){kit.team=e.a;kit.title='SWITCH!';kit.life=KR.beat;kit.max=KR.beat;dress(e.a);crew.flip=opts.reduced?0:.45;crew.mood=0;teach.life=0;}
  else if(e.type==='ready'){kit.team=e.a;kit.title='YOUR KIT';kit.life=KR.readyBeat;kit.max=KR.readyBeat;dress(e.a);}
  else if(e.type==='sub'){say('SUPER SUB!',TEAL,50,s.h*.24,.9,.72,'ONE LIFE BACK');cheer(1);}
  else if(e.type==='streak'){say('CLEAN RUN!',SUN,50,s.h*.24,.8,.7,`${e.b} IN A ROW`);spawnPop(e.x,e.y-16,e.a,true);cheer(.9);}
  else if(e.type==='lost'){pop(e.x,Math.min(s.h-26,e.y),'RUN OVER',false,false,RED,.9);}
  else if(e.type==='stage'){const k=Math.min(e.a,STAGE_WORDS.length-1);setScene(e.a);say(STAGE_WORDS[k],e.a%2?TEAL:ORANGE,50,s.h*.3,1.25,.9,STAGE_SUBS[k]);cheer(1.1);if(!opts.reduced)flash=.12;}
  else if(e.type==='special'){say(e.a===KIND.golden?'GOLDEN BALL!':e.a===KIND.stopwatch?'SLOW-MO!':'CAPTAIN x2!',e.a===KIND.stopwatch?TEAL:ORANGE,50,s.h*.24,.9,.72);spawnBurst(e.x,e.y,SUN,1.5,.26);cheer(.8);}
  else if(e.type==='dodge'){pop(Math.max(10,Math.min(90,e.x)),e.y-10,'CLOSE!',false,false,PAPER,.6);}
  else if(e.type==='miss'){spawnDots(e.x,s.h-3,INK,3,18);if(e.a>0){spawnBurst(e.x,s.h-5,PAPER,.8,.18);pop(Math.max(14,Math.min(86,e.x)),s.h-22,`DROPPED ${e.a}/${e.b}`,false,false,e.a>=e.b-1?RED:PAPER,.8);}}
  else if(e.type==='over'){say('FULL TIME!',INK,50,s.h*.3,1.6,.9);}
 }
 function trailStart(p:number){trails[p&3].n=0;}
 function trailPoint(p:number,x:number,y:number,now:number){const t=trails[p&3];t.head=(t.head+1)%TRAIL;t.x[t.head]=x;t.y[t.head]=y;t.t[t.head]=now;if(t.n<TRAIL)t.n++;}
 function drawSprite(i:number,x:number,y:number,rot:number,scale=1){const c=Math.cos(rot)*scale,sn=Math.sin(rot)*scale;ctx.setTransform(c,sn,-sn,c,x*u,y*u);ctx.drawImage(atlas,(i%cols)*S,Math.floor(i/cols)*S,S,S,-S/2,-S/2,S,S);}
 /** A bean stands on its feet: squash and stretch grow from the ground. */
 function drawBean(i:number,x:number,feet:number,sx:number,sy:number){ctx.setTransform(sx,0,0,sy,x*u,feet*u);ctx.drawImage(atlas,(i%cols)*S,Math.floor(i/cols)*S,S,S,-S/2,-S/2-FOOT*KR.r*u,S,S);}
 function lettering(text:string,x:number,y:number,font:string,fill:string,stroke:number){ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.fillStyle=INK;ctx.fillText(text,x+stroke*.9,y+stroke*.9);ctx.lineWidth=stroke;ctx.strokeStyle=INK;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);}
 function strip(text:string,x:number,y:number,fill:string){ctx.font=fontCap;const w=ctx.measureText(text).width+u*5,hh=u*6.4;ctx.fillStyle=INK;ctx.fillRect(x-w/2+u*.9,y-hh/2+u*.9,w,hh);ctx.fillStyle=fill;ctx.fillRect(x-w/2,y-hh/2,w,hh);ctx.lineWidth=u*.6;ctx.strokeStyle=INK;ctx.strokeRect(x-w/2,y-hh/2,w,hh);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText(text,x,y+u*.2);}
 /** Draws one frame of the round. `dt` is real seconds since the last frame, `now` is performance.now(). */
 function render(s:KitRushState,dt:number,now:number){
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  let ox=0,oy=0;if(shake>0){shake-=dt;ox=(rnd()-.5)*u*2.2*Math.min(1,shake*5);oy=(rnd()-.5)*u*2.2*Math.min(1,shake*5);}
  const slow=s.slow>0?KR.slowScale:1;
  // effect frames: flat bands at the page edge (no gradient, no alpha fade)
  if(s.slow>0||s.armband>0||s.frenzy>0){const col=s.frenzy>0?SUN:s.slow>0?TEAL:ORANGE,left=s.frenzy>0?s.frenzy/KR.frenzy:s.slow>0?s.slow/KR.slow:s.armband/KR.armband,bw=u*1.6;
   ctx.fillStyle=col;ctx.fillRect(0,0,bw,H);ctx.fillRect(W-bw,0,bw,H);ctx.fillStyle=INK;ctx.fillRect(u*22,H-u*14.4,W-u*44,u*3);ctx.fillStyle=col;ctx.fillRect(u*22.6,H-u*13.8,(W-u*45.2)*Math.max(0,left),u*1.8);}
  // the touchline: team-mates join as the clean run grows (one for every four), the referee waits by the bag
  if(crew.moodT>0){crew.moodT-=dt;if(crew.moodT<=0)crew.mood=0;}if(crew.hop>0)crew.hop-=dt;if(crew.flip>0)crew.flip-=dt;if(crew.ref>0)crew.ref-=dt;
  let lift=0,stretch=0;if(crew.jump>0){crew.jump-=dt;const k=1-Math.max(0,crew.jump)/crew.jumpMax;lift=Math.sin(Math.PI*k)*5.5;stretch=Math.cos(Math.PI*k*2)*.08;if(crew.jump<=0&&crew.moodT>.5)crew.jump=crew.jumpMax;}
  else if(crew.hop>0){const k=1-crew.hop/.16;lift=Math.sin(Math.PI*k)*1.3;}
  const want=1+Math.min(3,Math.floor(s.clean/4)),turn=crew.flip>0?Math.abs(Math.cos(Math.PI*(1-crew.flip/.45))):1;
  for(let i=3;i>=0;i--){const goal=i<want?1:0;if(opts.reduced)squad[i]=goal;else if(squad[i]<goal)squad[i]=Math.min(1,squad[i]+dt*6);else if(squad[i]>goal)squad[i]=Math.max(0,squad[i]-dt*5);
   const a=squad[i];if(a<=.02)continue;const m=MATES[i],breath=opts.reduced?0:Math.sin(now*.004+i*1.7)*.025,sc=m[2]*(a<1?a*(1.18-.18*a):1);
   drawBean(A_MATE+crew.mood,m[0]+ox/u,s.h-m[1]-lift*m[2]+oy/u,sc*turn*(1-stretch-breath*.6),sc*(1+stretch+breath));}
  {const up=crew.ref>0,k=up&&!opts.reduced?Math.sin(Math.PI*Math.min(1,(1.1-crew.ref)/.3)):0,breath=opts.reduced?0:Math.sin(now*.0036+2)*.025;drawBean(A_REF+(up?1:0),90.5+ox/u,s.h-4.5-k*3+oy/u,1.15*(1-breath*.6),1.15*(1+breath+k*.06));}
  // dropped kit: one pip on the bag's label for each of yours on the grass
  if(s.drops>0){ctx.setTransform(1,0,0,1,ox,oy);for(let i=0;i<KR.dropLimit;i++){ctx.beginPath();ctx.arc((50+(i-(KR.dropLimit-1)/2)*3.9)*u,H-u*4.4,u*1.2,0,6.283);ctx.fillStyle=i<s.drops?RED:PAPER;ctx.fill();ctx.lineWidth=u*.45;ctx.strokeStyle=INK;ctx.stroke();}}
  // the call: a tilted starburst word panel, under the kit so it never hides what you must read
  if(call.life>0){call.life-=dt;const k=Math.min(1,(call.max-call.life)/.09),sc=opts.reduced?1:.6+.4*k+(k>=1?0:.12),x=call.x*u,y=call.y*u;const fit=Math.min(1,W*.66/call.w)*call.size,tw=call.w*fit;
   ctx.setTransform(sc,call.tilt*sc,-call.tilt*sc,sc,x+ox,y+oy);ctx.save();ctx.scale(1,.46);star(ctx,u*1.2,u*2.6,tw*.72,tw*.56,13,.12);ctx.fillStyle=INK;ctx.fill();star(ctx,0,0,tw*.72,tw*.56,13,.12);ctx.fillStyle=call.color;ctx.fill();ctx.lineWidth=u*1.3;ctx.strokeStyle=INK;ctx.stroke();ctx.restore();
   ctx.save();ctx.scale(fit,fit);lettering(call.text,0,0,fontCall,call.color===RED||call.color===INK?SUN:call.color===SUN?PAPER:PAPER,u*1.7/Math.max(.62,fit));ctx.restore();
   if(call.sub)strip(call.sub,0,tw*.3+u*4.6,PAPER);ctx.setTransform(1,0,0,1,ox,oy);}
  // kit in the air: it pops out of the bag small and grows; the whistle shivers so it is never a surprise
  const items=s.items;for(let i=0;i<items.length;i++){const it=items[i];if(!it.active)continue;let sc=1;if(!opts.reduced){if(!it.peaked){const k=(s.h+KR.r-it.y)/16;if(k<1)sc=.55+.45*k*(2-k);}if(it.kind===KIND.whistle)sc*=1+.06*Math.sin(now*.02+it.seq);}drawSprite(sprite(it.kind,it.team),it.x+ox/u,it.y+oy/u,it.rot,sc);}
  // halves fly apart
  for(const hf of halves){if(!hf.on)continue;hf.life-=dt;if(hf.life<=0||hf.y>s.h+12){hf.on=false;continue;}hf.vy+=150*dt*slow;hf.x+=hf.vx*dt*slow;hf.y+=hf.vy*dt*slow;hf.rot+=hf.vr*dt*slow;
   const a=hf.cut+hf.rot,c=Math.cos(a),sn=Math.sin(a);ctx.setTransform(c,sn,-sn,c,hf.x*u,hf.y*u);ctx.save();ctx.beginPath();ctx.rect(-S,hf.side>0?0:-S,S*2,S);ctx.clip();ctx.rotate(-hf.cut);ctx.drawImage(atlas,(hf.spr%cols)*S,Math.floor(hf.spr/cols)*S,S,S,-S/2,-S/2,S,S);ctx.restore();}
  ctx.setTransform(1,0,0,1,ox,oy);
  // star bursts: pop to full size, then gone (print, not a fade)
  for(const b of bursts){if(!b.on)continue;b.life-=dt;if(b.life<=0){b.on=false;continue;}const k=1-b.life/b.max,r=KR.r*u*b.size*(.7+k*1.1);star(ctx,b.x*u,b.y*u,r*1.5,r*.8,9,b.rot);ctx.fillStyle=b.color;ctx.fill();ctx.lineWidth=u*.7;ctx.strokeStyle=INK;ctx.stroke();}
  for(const d of dots){if(!d.on)continue;d.life-=dt;if(d.life<=0){d.on=false;continue;}d.vy+=120*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(d.x*u,d.y*u,d.r*u,0,6.283);ctx.fill();}
  // the slash: tapered ink with a core in YOUR kit colour (one more reminder of who you are), straight from the pointer samples
  ctx.lineCap='round';ctx.lineJoin='round';const blade=TEAMS[s.team].color;
  for(const t of trails){if(t.n<2)continue;for(let pass=0;pass<2;pass++){ctx.strokeStyle=pass?blade:INK;let px=0,py=0,has=false;
    for(let k=t.n-1;k>=0;k--){const i=(t.head-k+TRAIL*2)%TRAIL,age=now-t.t[i];if(age>TRAIL_MS){has=false;continue;}const x=t.x[i]*u,y=t.y[i]*u;
     if(has){const w=(1-age/TRAIL_MS)*(pass?1.5:3.6)*u;if(w>.3){ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();}}px=x;py=y;has=true;}}}
  // numerals: pop, hang, then fly up to the score counter; words only rise
  for(const p of pops){if(!p.on)continue;p.life-=dt;if(p.life<=0){p.on=false;continue;}const k=1-p.life/p.max;let sc=1;
   if(p.fly&&!opts.reduced){const f=k<.45?0:(k-.45)/.55,e=f*f;p.x=p.x0+(50-p.x0)*e;p.y=p.y0-8*Math.min(1,k/.45)+(9-(p.y0-8))*e;sc=(k<.12?.6+k/.12*.5:1.1-Math.min(.1,(k-.12)*.5))*(1-.5*e);}
   else p.y-=dt*(opts.reduced?4:14);
   ctx.setTransform(sc,0,0,sc,p.x*u+ox,p.y*u+oy);lettering(p.text,0,0,p.fly?(p.big?fontPopBig:fontPop):fontNote,p.color,u*(p.big?1.5:1.1));}
  ctx.setTransform(1,0,0,1,ox,oy);
  if(flash>0){flash-=dt;ctx.fillStyle=PAPER;ctx.fillRect(-ox,-oy,W,u*2.4);ctx.fillRect(-ox,H-u*2.4-oy,W,u*2.4);}
  // the wrong answer teaches: YOUR kit with a tick, the one you hit with a cross, and the detail that gave it away
  if(teach.life>0){teach.life-=dt;const k=Math.min(1,(teach.max-teach.life)/.12),sc=opts.reduced?1:.7+.3*k*(2-k),cx=W/2,cy=s.h*u*.52,bw=u*74,bh=u*38,mark=u*5;
   ctx.setTransform(sc,.03*sc,-.03*sc,sc,cx+ox,cy+oy);ctx.fillStyle=INK;ctx.fillRect(-bw/2+u*1.6,-bh/2+u*1.6,bw,bh);ctx.fillStyle=PAPER;ctx.fillRect(-bw/2,-bh/2,bw,bh);ctx.lineWidth=u*.9;ctx.strokeStyle=INK;ctx.strokeRect(-bw/2,-bh/2,bw,bh);
   ctx.beginPath();ctx.moveTo(0,-bh/2);ctx.lineTo(0,bh/2-u*9);ctx.stroke();ctx.font=fontCap;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText('YOURS',-bw/4,-bh/2+u*4.6);ctx.fillText(teach.cause===2?'ON THE GRASS':'YOU HIT',bw/4,-bh/2+u*4.6);
   for(let n=0;n<2;n++){const x=(n?1:-1)*bw/4,i=sprite(teach.kind,n&&teach.cause!==2?teach.team:myTeam),z=1.15;ctx.drawImage(atlas,(i%cols)*S,Math.floor(i/cols)*S,S,S,x-S*z/2,-u*3-S*z/2,S*z,S*z);
    ctx.lineCap='round';ctx.lineWidth=u*2.6;ctx.strokeStyle=INK;ctx.beginPath();if(n){ctx.moveTo(x+u*8,-u*13);ctx.lineTo(x+u*8+mark,-u*13+mark);ctx.moveTo(x+u*8+mark,-u*13);ctx.lineTo(x+u*8,-u*13+mark);}else{ctx.moveTo(x+u*8,-u*10.5);ctx.lineTo(x+u*10,-u*8.5);ctx.lineTo(x+u*8+mark,-u*13);}ctx.stroke();ctx.lineWidth=u*1.3;ctx.strokeStyle=n?RED:TEAL;ctx.stroke();}
   ctx.fillStyle=teach.cause===2?SUN:RED;ctx.fillRect(-bw/2,bh/2-u*9,bw,u*9);ctx.strokeStyle=INK;ctx.lineWidth=u*.9;ctx.strokeRect(-bw/2,bh/2-u*9,bw,u*9);ctx.font=fontCap;ctx.fillStyle=teach.cause===2?INK:PAPER;ctx.translate(0,bh/2-u*4.3);ctx.scale(teach.fit,teach.fit);ctx.fillText(teach.sub,0,0);ctx.setTransform(1,0,0,1,ox,oy);}
  // the kit card: your kit at kick-off and at every switch (the game holds its breath for the beat)
  if(kit.life>0){kit.life-=dt;const k=Math.min(1,(kit.max-kit.life)/.1),sc=opts.reduced?1:.7+.3*k,t=TEAMS[kit.team],cx=W/2,cy=s.h*u*.42,bw=u*62,bh=u*56;
   ctx.setTransform(sc,-.035*sc,.035*sc,sc,cx,cy);ctx.fillStyle=INK;ctx.fillRect(-bw/2+u*1.6,-bh/2+u*1.6,bw,bh);ctx.fillStyle=PAPER;ctx.fillRect(-bw/2,-bh/2,bw,bh);ctx.fillStyle=t.color;ctx.fillRect(-bw/2,-bh/2,bw,u*11);
   ctx.lineWidth=u*.9;ctx.strokeStyle=INK;ctx.strokeRect(-bw/2,-bh/2,bw,bh);ctx.beginPath();ctx.moveTo(-bw/2,-bh/2+u*11);ctx.lineTo(bw/2,-bh/2+u*11);ctx.stroke();
   ctx.font=fontCap;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=INK;ctx.fillText(kit.title==='SWITCH!'?'SWITCH! NEW KIT':'YOUR KIT',0,-bh/2+u*5.8);
   ctx.save();ctx.translate(0,-u*4);ctx.scale(KR.r*u*1.55,KR.r*u*1.55);paintKit(ctx,KIND.shirt,kit.team);ctx.restore();
   lettering(t.name.toUpperCase(),0,bh/2-u*15,fontCall,t.color,u*1.6);ctx.font=fontCap;ctx.fillStyle=INK;ctx.fillText(t.pattern.toUpperCase(),0,bh/2-u*5.2);ctx.setTransform(1,0,0,1,0,0);}
 }
 function reset(){for(const a of [halves,bursts,dots,pops])for(const o of a)o.on=false;for(const t of trails)t.n=0;call.life=0;kit.life=0;teach.life=0;shake=0;flash=0;squad[0]=1;squad[1]=squad[2]=squad[3]=0;crew.mood=0;crew.moodT=0;crew.jump=0;crew.hop=0;crew.flip=0;crew.ref=0;setScene(0);}
 function clear(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);}
 return {resize,render,onEvent,trailStart,trailPoint,reset,clear,get unit(){return u/dpr;},get pixels(){return W*H;},get scene(){return tod;}};
}
