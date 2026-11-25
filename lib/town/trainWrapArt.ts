/**
 * Kindness train wraps: the drawings (owner, Nov 24 2026: "a graphics wrap on each train … the theme is being kind to one another …
 * like Japanese trains sometimes have a Pokémon or anime theme … keep it positive"). ORIGINAL art only: the island's own bean
 * islanders and Conductor Kenji. No characters, logos or look-alikes of any franchise or brand.
 * v2 (owner, Nov 24 2026: "improve the artwork on this to match more of the energy bar icons … don't love this current style"): drawn
 * in the HUD icon style (the coin, fish, orange and bolt of the top pill): soft radial shading lit from the top left, a glossy
 * highlight, warm gentle colours, tinted rims (a darker shade of each fill, never black ink), soft ground shadows and a faint paper
 * grain. The figures are the game's 3D bean islanders (beanLook.ts): ONE rounded bean body in the kit with a skin face panel, hair or
 * a cap on top, simple eyes and blush, short tube arms with round hands, short legs and glossy boots.
 * Pure canvas drawing (no three.js, no DOM look-ups, nothing loaded): lib/town/trainWraps.ts lays the tiles out in ONE atlas and calls
 * these once at load. Every tile is drawn in its own units: 100 high, `w` wide (the panel's aspect × 100); the badge in 100 × 100.
 */
export type WrapCtx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
const INK='#3b2c2c',WHITE='#fffdf7',BOOT='#3f3b47';
const SKIN=['#fde3cc','#f5cfa8','#e8b68a','#c98d62','#a56c46','#7b4b32'] as const;
const HAIR=['#3a2a22','#6b4429','#d39a48','#2a2422','#9a5530'] as const;
/** Per theme: the card background (top, bottom), the frame (the livery's accent, so the panels sit on the body), the slogan pill and
 *  its lettering, and the two teams' kits (always two teams: kindness to the other side is the point). */
export const WRAP_LOOK=[
 {bg:'#fff8e6',bg2:'#fde4b8',frame:'#8c2a2f',ribbon:'#a3343a',ribbonInk:'#fff8e8',accent:'#f2c230',teamA:'#e65a4c',teamB:'#3d85d3',shortsA:'#fdf8ee',shortsB:'#264a80'},
 {bg:'#eefaf3',bg2:'#c9ecda',frame:'#2f6fae',ribbon:'#3479bd',ribbonInk:'#fff8e8',accent:'#e65a4c',teamA:'#3fae6a',teamB:'#f39a3d',shortsA:'#fdf8ee',shortsB:'#8a4a1c'},
 {bg:'#eef5fd',bg2:'#cfe1f6',frame:'#f2bd1d',ribbon:'#2c68a8',ribbonInk:'#ffe17a',accent:'#f2bd1d',teamA:'#e65a4c',teamB:'#3d85d3',shortsA:'#fdf8ee',shortsB:'#264a80'},
] as const;

// ---------------------------------------------------------------- colour + shading helpers
const hx=(c:string)=>{const n=parseInt(c.slice(1),16);return [n>>16,n>>8&255,n&255];};
const mix=(a:string,b:string,t:number)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
/** Darker (the tinted rim) and lighter (the lit side) shades of a fill. */
const dk=(c:string,t=.35)=>mix(c,'#2a1c2a',t),lt=(c:string,t=.4)=>mix(c,'#ffffff',t);
/** Device pixels per unit (shadow blur is in device pixels, not units). */
const pxk=(c:WrapCtx)=>{try{const m=c.getTransform();return Math.hypot(m.a,m.b)||1;}catch{return 1;}};
/** The icon fill: a radial gradient lit from the top left (light → the colour → a darker rim). */
function lit(c:WrapCtx,col:string,x:number,y:number,r:number,hi=.42,lo=.24){const g=c.createRadialGradient(x-r*.38,y-r*.42,r*.06,x,y,r*1.1);
 g.addColorStop(0,lt(col,hi));g.addColorStop(.55,col);g.addColorStop(1,dk(col,lo));return g;}
/** A white glossy highlight (the coin's and the orange's shine). */
function gloss(c:WrapCtx,x:number,y:number,rx:number,ry:number,rot=-.5,a=.6){c.save();c.globalAlpha*=a;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fillStyle='#ffffff';c.fill();c.restore();}
/** A soft round shape: lit fill, tinted rim, a gloss. */
function orb(c:WrapCtx,x:number,y:number,rx:number,ry:number,col:string,rim=1,rot=0,shine=true){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);
 c.fillStyle=lit(c,col,x,y,Math.max(rx,ry));c.fill();if(rim>0){c.lineWidth=rim;c.strokeStyle=dk(col,.42);c.stroke();}
 if(shine)gloss(c,x-rx*.36,y-ry*.42,rx*.3,ry*.2,-.6,.55);}
/** A rounded tube (arm, leg, pole): rim, body, a lit stripe on the upper-left side. */
function tube(c:WrapCtx,x0:number,y0:number,x1:number,y1:number,col:string,w:number,rim=1){c.lineCap='round';
 c.strokeStyle=dk(col,.42);c.lineWidth=w+rim*2;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
 c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
 const L=Math.hypot(x1-x0,y1-y0)||1;let nx=-(y1-y0)/L,ny=(x1-x0)/L;if(nx+ny>0){nx=-nx;ny=-ny;}const o=w*.22;
 c.strokeStyle=lt(col,.3);c.lineWidth=w*.24;c.beginPath();c.moveTo(x0+nx*o,y0+ny*o);c.lineTo(x1+nx*o,y1+ny*o);c.stroke();}
function groundShadow(c:WrapCtx,x:number,y:number,rx:number,ry:number,a=.24){const g=c.createRadialGradient(x,y,0,x,y,rx);
 g.addColorStop(0,`rgba(38,58,30,${a})`);g.addColorStop(1,'rgba(38,58,30,0)');c.save();c.translate(x,y);c.scale(1,ry/rx);c.translate(-x,-y);
 c.beginPath();c.arc(x,y,rx,0,Math.PI*2);c.fillStyle=g;c.fill();c.restore();}
function rng(seed:number){let s=seed;return ()=>{s=(s*16807)%2147483647;return s/2147483647;};}

// ---------------------------------------------------------------- icons
export function heart(c:WrapCtx,x:number,y:number,s:number,col='#ef5a69'){c.save();c.translate(x,y);c.scale(s/10,s/10);c.beginPath();
 c.moveTo(0,8);c.bezierCurveTo(-11,0,-9,-9,-4,-9);c.bezierCurveTo(-1.5,-9,0,-7,0,-5);c.bezierCurveTo(0,-7,1.5,-9,4,-9);c.bezierCurveTo(9,-9,11,0,0,8);c.closePath();
 c.fillStyle=lit(c,col,0,-1,10,.45,.28);c.fill();c.lineWidth=.9;c.strokeStyle=dk(col,.4);c.lineJoin='round';c.stroke();
 gloss(c,-4.4,-5.2,2.3,1.4,-.6,.75);gloss(c,-1.6,-6.4,.7,.7,0,.6);c.restore();}
/** A gold star in the coin's colours (#ffe58a → #f2c230 → #c99a12, a soft gold rim). */
export function star(c:WrapCtx,x:number,y:number,r:number){c.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.5:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();
 const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r*1.05);g.addColorStop(0,'#fff0b0');g.addColorStop(.45,'#f7cd45');g.addColorStop(1,'#d39d14');
 c.fillStyle=g;c.fill();c.lineJoin='round';c.lineWidth=Math.max(.6,r*.1);c.strokeStyle='rgba(150,105,0,.6)';c.stroke();gloss(c,x-r*.22,y-r*.3,r*.2,r*.12,-.5,.7);}
/** A football: a lit white sphere with slate patches (a simple, generic ball). */
export function ball(c:WrapCtx,x:number,y:number,r:number){c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);
 const g=c.createRadialGradient(x-r*.35,y-r*.4,r*.05,x,y,r*1.05);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#f3f1ec');g.addColorStop(1,'#c9ccd6');c.fillStyle=g;c.fill();c.clip();
 const P='#454b5c',pent=(px:number,py:number,pr:number,rot:number)=>{c.beginPath();for(let k=0;k<5;k++){const a=rot+k*Math.PI*2/5;c.lineTo(px+Math.cos(a)*pr,py+Math.sin(a)*pr);}c.closePath();c.fillStyle=P;c.fill();};
 pent(x,y,r*.32,-Math.PI/2);c.strokeStyle='rgba(69,75,92,.7)';c.lineWidth=Math.max(.5,r*.06);
 for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;c.beginPath();c.moveTo(x+Math.cos(a)*r*.32,y+Math.sin(a)*r*.32);c.lineTo(x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78);c.stroke();pent(x+Math.cos(a)*r*1.02,y+Math.sin(a)*r*1.02,r*.3,a+Math.PI);}
 const s=c.createRadialGradient(x-r*.3,y-r*.35,r*.2,x,y,r);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(1,'rgba(40,40,70,.22)');c.fillStyle=s;c.fillRect(x-r,y-r,r*2,r*2);
 c.restore();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=Math.max(.6,r*.09);c.strokeStyle='#8d92a3';c.stroke();gloss(c,x-r*.38,y-r*.42,r*.26,r*.16,-.6,.85);}
function confetti(c:WrapCtx,w:number,seed:number,n:number,y0=6,y1=60){const rnd=rng(seed);
 const cols=['#f47a86','#f7cd45','#6cc3ec','#8fd57a','#c09af0','#ffad66'];
 for(let k=0;k<n;k++){const x=8+rnd()*(w-16),y=y0+rnd()*(y1-y0),a=rnd()*Math.PI;c.save();c.translate(x,y);c.rotate(a);c.fillStyle=cols[k%cols.length];
  if(k%3===0){c.beginPath();c.arc(0,0,1.5,0,Math.PI*2);c.fill();}else{c.beginPath();c.roundRect(-2.3,-.95,4.6,1.9,.9);c.fill();}c.restore();}}
/** A soft four-point twinkle. */
function sparkle(c:WrapCtx,x:number,y:number,r:number,col='#ffffff'){c.save();c.translate(x,y);const g=c.createRadialGradient(0,0,0,0,0,r*.9);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');
 c.fillStyle=g;c.beginPath();c.arc(0,0,r*.9,0,Math.PI*2);c.fill();c.fillStyle=col;c.beginPath();
 for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.2:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
function bottle(c:WrapCtx,x:number,y:number,rot:number){c.save();c.translate(x,y);c.rotate(rot);
 c.beginPath();c.roundRect(-4.4,-9,8.8,17,3.4);const g=c.createLinearGradient(-4.4,0,4.4,0);g.addColorStop(0,'#bfeaff');g.addColorStop(.5,'#7fcff3');g.addColorStop(1,'#4ea6d6');c.fillStyle=g;c.fill();
 c.lineWidth=.9;c.strokeStyle='#3a86b4';c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.roundRect(-2.8,-6.5,1.6,11,.8);c.fill();
 c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-4.4,-1,8.8,3);c.beginPath();c.roundRect(-3,-13.2,6,4.8,1.6);c.fillStyle=lit(c,'#3d85d3',0,-11,4);c.fill();c.strokeStyle='#28599a';c.stroke();c.restore();}

// ---------------------------------------------------------------- the bean islander
export type BeanPose={
 x:number;/** feet */y:number;/** scale (1: ~86 units tall) */s?:number;skin:number;kit:string;shorts?:string;socks?:string;hair?:number;
 style?:'crop'|'bob'|'puffs'|'bun'|'spiky'|'cap';cap?:string;
 /** arm angles from straight down (rad): + swings out to that side, π is straight up */armL?:number;armR?:number;
 /** or a hand target in TILE units (overrides the angle): the arm reaches it (length capped) */reachL?:readonly [number,number];reachR?:readonly [number,number];
 handL?:'open'|'thumb'|'glove'|'wave';handR?:'open'|'thumb'|'glove'|'wave';glove?:string;
 legs?:'stand'|'jump'|'sit'|'kick'|'run';face?:'smile'|'joy'|'open';/** eye shift toward a side (−1 … 1) */look?:number;tilt?:number;collar?:string;sash?:string;
 /** a scarf held overhead between both hands (arms up) */scarf?:string;/** a flag on a pole in that hand */flagL?:string;flagR?:string;
 /** buttons down the front (Kenji's jacket) */buttons?:boolean;
};
const SH_Y=-41,SH_X=17.5,ARM=18.5;
function beanPath(c:WrapCtx){c.beginPath();c.moveTo(0,-80);c.bezierCurveTo(13.5,-80,20.5,-66,20.8,-46);c.bezierCurveTo(21.2,-25,13,-12,0,-12);
 c.bezierCurveTo(-13,-12,-21.2,-25,-20.8,-46);c.bezierCurveTo(-20.5,-66,-13.5,-80,0,-80);c.closePath();}
function hand(c:WrapCtx,side:-1|1,ex:number,ey:number,kind:'open'|'thumb'|'glove'|'wave',skin:string,glove:string){
 if(kind==='glove'){orb(c,ex,ey,6.4,6,glove,1);c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.roundRect(ex-5.2,ey+2.6,10.4,2.4,1.2);c.fill();return;}
 if(kind==='thumb'){// a clear thumbs-up: a big round fist with finger creases facing us and a thick thumb standing straight up from its top
  const fw=15,fh=12.5,tx=ex+side*3;c.beginPath();c.roundRect(tx-3.3,ey-fh/2-11,6.6,13.5,3.3);c.fillStyle=lit(c,skin,tx,ey-fh/2-4,6);c.fill();c.lineWidth=1.1;c.strokeStyle=dk(skin,.45);c.stroke();
  gloss(c,tx-1.1,ey-fh/2-7.5,1,2.8,0,.5);c.beginPath();c.ellipse(tx,ey-fh/2-8.6,1.8,1.3,0,0,Math.PI*2);c.fillStyle=lt(skin,.5);c.fill();
  c.beginPath();c.roundRect(ex-fw/2,ey-fh/2,fw,fh,4.6);c.fillStyle=lit(c,skin,ex,ey,8);c.fill();c.lineWidth=1.1;c.strokeStyle=dk(skin,.45);c.stroke();
  c.lineWidth=.9;c.lineCap='round';c.strokeStyle=dk(skin,.32);for(const fy of [-.8,2.9]){c.beginPath();c.moveTo(ex-side*6.6,ey+fy);c.lineTo(ex+side*2,ey+fy);c.stroke();}
  gloss(c,ex-3.2,ey-2.6,2.4,1.3,-.4,.5);return;}
 orb(c,ex,ey,5,5,skin,1);
 if(kind==='wave'){c.lineCap='round';c.lineWidth=1.2;c.strokeStyle='rgba(120,90,60,.55)';for(const r of [8,11.5]){c.beginPath();c.arc(ex,ey,r,-Math.PI*.5-side*.2-.45,-Math.PI*.5-side*.2+.45);c.stroke();}}}
function armAt(p:BeanPose,side:-1|1,s:number,dy:number):[number,number]{const reach=side<0?p.reachL:p.reachR,sx=side*SH_X,sy=SH_Y;
 if(reach){const lx=(reach[0]-p.x)/s,ly=(reach[1]-p.y)/s-dy;const d=Math.hypot(lx-sx,ly-sy)||1,len=Math.min(d,ARM*1.35);return [sx+(lx-sx)/d*len,sy+(ly-sy)/d*len];}
 const a=(side<0?p.armL:p.armR)??.35;return [sx+side*Math.sin(a)*ARM,sy+Math.cos(a)*ARM];}
function arm(c:WrapCtx,p:BeanPose,side:-1|1,ex:number,ey:number,dy:number,skin:string){const sx=side*SH_X*.92,sy=SH_Y+dy;
 tube(c,sx,sy,ex,ey,skin,5,.9);const mx=sx+(ex-sx)*.4,my=sy+(ey-sy)*.4;tube(c,sx,sy,mx,my,p.kit,7,.9);
 hand(c,side,ex,ey,(side<0?p.handL:p.handR)??'open',skin,p.glove??'#ff9a3c');}
function leg(c:WrapCtx,hx0:number,hy:number,fx:number,fy:number,skin:string,sock:string){const mx=(hx0+fx)/2,my=(hy+fy)/2;
 tube(c,hx0,hy,mx,my,skin,6.4,.9);tube(c,mx,my,fx,fy,sock,6.6,.9);const dir=Math.sign(fx-hx0||fx||1);orb(c,fx+dir*2,fy+1,6.2,3.7,BOOT,.9);}
function flag(c:WrapCtx,side:-1|1,ex:number,ey:number,col:string){const tx=ex+side*3,ty=ey-22;tube(c,ex,ey+4,tx,ty,'#d8b47a',2,.7);
 c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(tx+side*10,ty-3,tx+side*20,ty+3);c.quadraticCurveTo(tx+side*12,ty+7,tx+side*1,ty+13);c.closePath();
 c.fillStyle=lit(c,col,tx+side*8,ty+3,14);c.fill();c.lineWidth=.9;c.strokeStyle=dk(col,.4);c.stroke();
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(tx+side*1,ty+1.5);c.quadraticCurveTo(tx+side*9,ty-1,tx+side*16,ty+3);c.quadraticCurveTo(tx+side*9,ty+2.5,tx+side*1,ty+4.5);c.closePath();c.fill();
 orb(c,tx,ty-1.2,1.8,1.8,'#f2c230',.6,0,false);}
function scarf(c:WrapCtx,x0:number,y0:number,x1:number,y1:number,col:string){const mx=(x0+x1)/2,my=Math.max(y0,y1)+3;
 for(const [fx,d] of [[x0,-1],[x1,1]] as const){c.strokeStyle=dk(col,.1);c.lineWidth=1;c.lineCap='round';for(let k=0;k<3;k++){c.beginPath();c.moveTo(fx+d*(k-1)*1.6,y0+2);c.lineTo(fx+d*(k-1)*1.6+d*.6,y0+7.5);c.stroke();}}
 c.save();c.beginPath();c.moveTo(x0,y0-3);c.quadraticCurveTo(mx,my-3,x1,y1-3);c.lineTo(x1,y1+3);c.quadraticCurveTo(mx,my+3,x0,y0+3);c.closePath();
 c.fillStyle=lit(c,col,mx,my,20,.3,.2);c.fill();c.clip();c.fillStyle='rgba(255,253,247,.9)';for(let k=-3;k<=3;k++){const bx=mx+k*7;c.fillRect(bx-1.5,my-12,3,30);}c.restore();
 c.lineWidth=.8;c.strokeStyle=dk(col,.4);c.beginPath();c.moveTo(x0,y0-3);c.quadraticCurveTo(mx,my-3,x1,y1-3);c.lineTo(x1,y1+3);c.quadraticCurveTo(mx,my+3,x0,y0+3);c.closePath();c.stroke();}
export function bean(c:WrapCtx,p:BeanPose){
 const s=p.s??1,skin=SKIN[p.skin%SKIN.length],hair=HAIR[(p.hair??0)%HAIR.length],shorts=p.shorts??'#fdf8ee',sock=p.socks??p.kit,look=(p.look??0)*2.4;
 const L=p.legs??'stand',dy=L==='sit'?12:L==='jump'?-6:0;
 c.save();c.translate(p.x,p.y);c.scale(s,s);c.lineJoin='round';
 groundShadow(c,0,-1,L==='sit'?30:23,4.8,L==='jump'?.16:.26);
 c.rotate(p.tilt??0);
 // legs
 if(L==='stand'){leg(c,-7,-15,-8.5,-3.5,skin,sock);leg(c,7,-15,8.5,-3.5,skin,sock);}
 else if(L==='jump'){leg(c,-7,-21,-12,-12,skin,sock);leg(c,7,-21,12,-12,skin,sock);}
 else if(L==='sit'){leg(c,-7,-3,-22,-3.5,skin,sock);leg(c,7,-3,22,-3.5,skin,sock);}
 else if(L==='kick'){leg(c,-7,-15,-8.5,-3.5,skin,sock);leg(c,7,-15,25,-13,skin,sock);}
 else {leg(c,-7,-15,-15,-6,skin,sock);leg(c,7,-15,11,-2.5,skin,sock);}
 c.translate(0,dy);
 const hL=armAt(p,-1,s,dy),hR=armAt(p,1,s,dy);// hands in body units (after the sit / jump shift)
 // hair behind the body
 if(p.style==='puffs'){orb(c,-17,-74,7.6,7.4,hair,.9);orb(c,17,-74,7.6,7.4,hair,.9);}
 if(p.style==='bun')orb(c,0,-83,7.2,6.4,hair,.9);
 // the bean: kit, shorts band, sash, collar, then one soft shading layer and a tinted rim
 c.save();beanPath(c);c.fillStyle=p.kit;c.fill();c.clip();
 c.fillStyle=shorts;c.beginPath();c.moveTo(-24,-26);c.quadraticCurveTo(0,-21,24,-26);c.lineTo(24,0);c.lineTo(-24,0);c.closePath();c.fill();
 c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-24,-26.4);c.quadraticCurveTo(0,-21.4,24,-26.4);c.stroke();
 if(p.sash){c.fillStyle=p.sash;c.beginPath();c.moveTo(-22,-50);c.lineTo(-13,-54);c.lineTo(22,-27);c.lineTo(20,-19);c.closePath();c.fill();
  c.fillStyle='rgba(255,253,247,.85)';for(let k=0;k<4;k++){const f=.18+k*.21;c.save();c.translate(-17.5+f*38,-52+f*29);c.rotate(.65);c.fillRect(-.9,-4.5,1.8,9);c.restore();}}
 if(p.buttons)for(const by of [-38,-31])orb(c,0,by,1.4,1.4,'#f2c230',.5,0,false);
 const sg=c.createRadialGradient(-8,-62,2,-3,-48,40);sg.addColorStop(0,'rgba(255,255,255,.42)');sg.addColorStop(.38,'rgba(255,255,255,0)');sg.addColorStop(.75,'rgba(40,20,50,.05)');sg.addColorStop(1,'rgba(40,20,50,.28)');
 c.fillStyle=sg;c.fillRect(-24,-82,48,72);
 gloss(c,-14.5,-36,2.2,7.5,.12,.32);
 // hair on top (clipped to the bean)
 if(p.style!=='cap'){c.fillStyle=lit(c,hair,0,-74,16,.3,.2);c.beginPath();
  if(p.style==='spiky'){c.moveTo(-24,-62);for(let k=0;k<=6;k++)c.lineTo(-15+k*5,k%2?-68:-73);c.lineTo(24,-62);}
  else{c.moveTo(-24,-60);c.quadraticCurveTo(-14,-74,-4,-69.5);c.quadraticCurveTo(4,-73,11,-70);c.quadraticCurveTo(18,-68,24,-60);}
  c.lineTo(24,-84);c.lineTo(-24,-84);c.closePath();c.fill();
  if(p.style==='bob'){c.beginPath();c.roundRect(-24,-70,7.4,21,3.6);c.roundRect(16.6,-70,7.4,21,3.6);c.fill();}}
 c.restore();
 beanPath(c);c.lineWidth=1.2;c.strokeStyle=dk(p.kit,.45);c.stroke();
 if(p.style!=='cap')gloss(c,-7,-75,4.2,1.7,-.25,.45);
 // the face panel
 const fx=look*.6;c.beginPath();c.ellipse(fx,-57.5,13.4,11.8,0,0,Math.PI*2);c.fillStyle=lit(c,skin,fx,-58,13,.3,.12);c.fill();c.lineWidth=.8;c.strokeStyle=dk(skin,.28);c.stroke();
 c.strokeStyle=p.collar??'#fdf8ee';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(fx-7,-44.6);c.quadraticCurveTo(fx,-40.2,fx+7,-44.6);c.stroke();
 if(p.style==='cap'){const cc=p.cap??'#1d2c4a';c.beginPath();c.moveTo(-17,-66);c.quadraticCurveTo(-16,-86,0,-86.5);c.quadraticCurveTo(16,-86,17,-66);c.closePath();
  c.fillStyle=lit(c,cc,0,-76,14,.35,.25);c.fill();c.lineWidth=1;c.strokeStyle=dk(cc,.45);c.stroke();
  c.beginPath();c.ellipse(3+look,-66,15,3.4,0,0,Math.PI*2);c.fillStyle=lit(c,cc,3,-67,12,.25,.3);c.fill();c.stroke();
  orb(c,0,-75.5,4.2,3.4,'#f2c230',.7);gloss(c,-8,-80,4,1.6,-.3,.45);
  c.fillStyle=hair;c.beginPath();c.roundRect(-14,-66,3.2,6,1.4);c.roundRect(10.8,-66,3.2,6,1.4);c.fill();}
 // face: simple eyes with a glint, blush, a small mouth
 const ey=-59,ex0=look;
 if(p.face==='joy'){c.lineWidth=1.7;c.strokeStyle=INK;c.lineCap='round';for(const ex of [-5,5]){c.beginPath();c.arc(ex+ex0,ey+1.6,2.7,Math.PI*1.15,Math.PI*1.85);c.stroke();}}
 else for(const ex of [-5,5]){c.beginPath();c.ellipse(ex+ex0,ey,1.9,2.6,0,0,Math.PI*2);c.fillStyle=INK;c.fill();c.beginPath();c.arc(ex+ex0+.6,ey-.9,.75,0,Math.PI*2);c.fillStyle=WHITE;c.fill();}
 for(const bx of [-9.2,9.2]){const g=c.createRadialGradient(bx+ex0*.5,-54,0,bx+ex0*.5,-54,3.8);g.addColorStop(0,'rgba(240,108,118,.6)');g.addColorStop(1,'rgba(240,108,118,0)');c.fillStyle=g;c.beginPath();c.arc(bx+ex0*.5,-54,3.8,0,Math.PI*2);c.fill();}
 if(p.face==='open'||p.face==='joy'){c.beginPath();c.moveTo(-4+ex0,-53.6);c.quadraticCurveTo(ex0,-46.6,4+ex0,-53.6);c.closePath();c.fillStyle='#8c3a40';c.fill();
  c.save();c.clip();c.beginPath();c.ellipse(ex0,-49.6,2.6,1.6,0,0,Math.PI*2);c.fillStyle='#f28b93';c.fill();c.restore();}
 else{c.beginPath();c.arc(ex0,-55.4,3.6,.2*Math.PI,.8*Math.PI);c.lineWidth=1.5;c.strokeStyle=INK;c.lineCap='round';c.stroke();}
 // arms (and what the hands hold)
 arm(c,p,-1,hL[0],hL[1],0,skin);arm(c,p,1,hR[0],hR[1],0,skin);
 if(p.scarf)scarf(c,hL[0],hL[1]-2,hR[0],hR[1]-2,p.scarf);
 if(p.flagL)flag(c,-1,hL[0],hL[1],p.flagL);if(p.flagR)flag(c,1,hR[0],hR[1],p.flagR);
 if(p.scarf){hand(c,-1,hL[0],hL[1],'open',skin,'');hand(c,1,hR[0],hR[1],'open',skin,'');}
 if(p.flagL)hand(c,-1,hL[0],hL[1],'open',skin,'');if(p.flagR)hand(c,1,hR[0],hR[1],'open',skin,'');
 c.restore();}
/** Conductor Kenji (trainConductor.ts KENJI_NPC: skin 2, a dark crop, a navy cap and jacket), waving. */
export function kenji(c:WrapCtx,x:number,y:number,s:number){bean(c,{x,y,s,skin:2,hair:0,style:'cap',cap:'#22355a',kit:'#26406a',shorts:'#1d3254',socks:'#1d3254',collar:'#f2c230',buttons:true,armL:2.65,armR:.3,handL:'wave',face:'open',look:.25});}

// ---------------------------------------------------------------- a tile's card: livery frame, soft card, glow, grain, pitch
const CARD=(c:WrapCtx,w:number)=>{c.beginPath();c.roundRect(4.5,4.5,w-9,91,10);};
function frame(c:WrapCtx,w:number,t:number,grass=true){const L=WRAP_LOOK[t];
 const fg=c.createLinearGradient(0,0,0,100);fg.addColorStop(0,lt(L.frame,.16));fg.addColorStop(1,dk(L.frame,.16));c.fillStyle=fg;c.fillRect(0,0,w,100);
 const g=c.createLinearGradient(0,4,0,96);g.addColorStop(0,L.bg);g.addColorStop(1,L.bg2);
 c.save();CARD(c,w);c.fillStyle=g;c.fill();c.clip();
 const gl=c.createRadialGradient(w/2,50,4,w/2,50,w*.6);gl.addColorStop(0,'rgba(255,255,255,.7)');gl.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gl;c.fillRect(0,0,w,100);
 c.save();c.translate(w/2,104);c.fillStyle='rgba(255,255,255,.2)';for(let k=0;k<12;k++){c.rotate(Math.PI/12);c.beginPath();c.moveTo(0,0);c.lineTo(-8,-160);c.lineTo(8,-160);c.closePath();c.fill();}c.restore();
 if(grass){c.beginPath();c.moveTo(0,81.5);c.quadraticCurveTo(w/2,77.5,w,81.5);c.lineTo(w,100);c.lineTo(0,100);c.closePath();
  const gg=c.createLinearGradient(0,78,0,100);gg.addColorStop(0,'#a3dc78');gg.addColorStop(1,'#5aa548');c.fillStyle=gg;c.fill();c.save();c.clip();
  c.fillStyle='rgba(255,255,255,.1)';for(let x=-4;x<w;x+=18)c.fillRect(x,76,9,26);
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1.1;c.beginPath();c.moveTo(0,87.6);c.quadraticCurveTo(w/2,84,w,87.6);c.stroke();c.restore();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=.8;c.beginPath();c.moveTo(0,81.5);c.quadraticCurveTo(w/2,77.5,w,81.5);c.stroke();}
 c.restore();}
function finish(c:WrapCtx,w:number,t:number){const L=WRAP_LOOK[t];
 c.save();CARD(c,w);c.clip();
 const rnd=rng(1000+Math.round(w*7)+t*31);for(let k=0;k<w*4;k++){const x=rnd()*w,y=rnd()*100;c.fillStyle=k%2?'rgba(110,80,40,.07)':'rgba(255,255,255,.13)';c.fillRect(x,y,.7,.7);}// paper grain
 const ig=c.createLinearGradient(0,4.5,0,14);ig.addColorStop(0,'rgba(60,40,20,.12)');ig.addColorStop(1,'rgba(60,40,20,0)');c.fillStyle=ig;c.fillRect(0,4,w,10);// soft inner shadow under the frame
 c.restore();
 CARD(c,w);c.lineWidth=1.4;c.strokeStyle=dk(L.frame,.3);c.stroke();
 c.beginPath();c.roundRect(5.6,5.6,w-11.2,88.8,9);c.lineWidth=.7;c.strokeStyle='rgba(255,255,255,.55)';c.stroke();
 c.beginPath();c.roundRect(.8,.8,w-1.6,98.4,11);c.lineWidth=1.2;c.strokeStyle=dk(L.frame,.38);c.stroke();
 c.beginPath();c.moveTo(10,2.2);c.lineTo(w-10,2.2);c.lineWidth=.9;c.strokeStyle=lt(L.frame,.35);c.stroke();}
function inside(c:WrapCtx,w:number,draw:()=>void){c.save();CARD(c,w);c.clip();draw();c.restore();}
const FONT='ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", "Varela Round", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// ---------------------------------------------------------------- the scenes (theme t, tile k; tile 1 is always the slogan)
/** The panel tiles of a theme in slot order (car-local −z → +z): a scene, the slogan, a scene, a scene. */
export const WRAP_TILES=['scene0','slogan','scene1','scene2'] as const;
export function drawWrapTile(c:WrapCtx,t:number,k:number,w:number,slogan:readonly [string,string]){
 const L=WRAP_LOOK[t],K=pxk(c);frame(c,w,t,k!==1);
 inside(c,w,()=>{
  if(k===1){// the slogan: Kenji waving, two big lines on a glossy pill, a heart + ball
   confetti(c,w,7+t,14,8,92);kenji(c,w*.15,94,.86);
   const tx=w*.585,tw=w*.66,th=62;c.save();c.translate(tx,49);c.rotate(-.03);
   c.save();c.shadowColor='rgba(50,30,20,.3)';c.shadowBlur=5*K;c.shadowOffsetY=2.2*K;
   c.beginPath();c.roundRect(-tw/2,-th/2+2.6,tw,th,16);c.fillStyle=dk(L.ribbon,.3);c.fill();c.restore();// the darker lip under the pill (the HUD pill's base)
   c.beginPath();c.roundRect(-tw/2,-th/2,tw,th,16);const rg=c.createLinearGradient(0,-th/2,0,th/2);rg.addColorStop(0,lt(L.ribbon,.18));rg.addColorStop(1,dk(L.ribbon,.12));c.fillStyle=rg;c.fill();
   c.lineWidth=1.1;c.strokeStyle=dk(L.ribbon,.35);c.stroke();
   c.save();c.beginPath();c.roundRect(-tw/2+3,-th/2+2.5,tw-6,th*.42,13);const hg=c.createLinearGradient(0,-th/2,0,-th/2+th*.42);hg.addColorStop(0,'rgba(255,255,255,.28)');hg.addColorStop(1,'rgba(255,255,255,.04)');c.fillStyle=hg;c.fill();c.restore();
   c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
   let fs=27;c.font=`800 ${fs}px ${FONT}`;const mw=Math.max(c.measureText(slogan[0]).width,c.measureText(slogan[1]).width);if(mw>tw-16){fs*= (tw-16)/mw;c.font=`800 ${fs}px ${FONT}`;}
   for(const [i,s] of slogan.entries()){const y=(i?1:-1)*fs*.56+1;
    c.save();c.shadowColor='rgba(20,10,30,.38)';c.shadowBlur=2.6*K;c.shadowOffsetY=1.6*K;c.fillStyle=L.ribbonInk;c.fillText(s,0,y);c.restore();
    c.lineWidth=.7;c.strokeStyle=dk(L.ribbon,.15);c.strokeText(s,0,y);c.fillStyle=L.ribbonInk;c.fillText(s,0,y);}
   c.restore();heart(c,tx+tw/2-4,19,9.5);ball(c,tx+tw/2+1,80,8.5);star(c,tx-tw/2+3,17,6.5);return;}
  if(t===0){
   if(k===0){// the referee: a thumbs-up for a fair game, whistle on its cord
    for(const [x,y,r] of [[w*.2,22,7],[w*.84,16,6.5],[w*.18,52,4.5]] as const)star(c,x,y,r);
    const rx=w*.42;bean(c,{x:rx,y:94,skin:4,hair:3,style:'crop',kit:'#f4d23f',shorts:'#2c2f38',socks:'#2c2f38',collar:'#2c2f38',reachR:[rx+32,94-60],armL:.3,handR:'thumb',face:'open',look:.3});
    c.beginPath();c.moveTo(rx-6,94-44);c.quadraticCurveTo(rx,94-34,rx+5,94-37);c.lineWidth=.9;c.strokeStyle='#5a4d40';c.stroke();
    c.beginPath();c.roundRect(rx+3,94-39.5,7,4.4,2);c.fillStyle=lit(c,'#d9dde4',rx+6,94-38,5);c.fill();c.lineWidth=.8;c.strokeStyle='#7d8492';c.stroke();
    sparkle(c,rx+44,94-80,6);sparkle(c,rx+21,94-80,3.5);}
   else if(k===2){// two teams shaking hands
    heart(c,w/2,17,10);heart(c,w/2-17,27,6,'#ff8fa0');heart(c,w/2+17,27,6,'#ff8fa0');const hy=94-35;
    bean(c,{x:w/2-31,y:94,skin:1,hair:2,style:'bob',kit:L.teamA,shorts:L.shortsA,armL:.3,reachR:[w/2,hy],look:.7,face:'smile'});
    bean(c,{x:w/2+31,y:94,skin:5,hair:0,style:'puffs',kit:L.teamB,shorts:L.shortsB,reachL:[w/2,hy],armR:.3,look:-.7,face:'smile'});
    orb(c,w/2,hy,6.4,5.4,SKIN[3],1);c.beginPath();c.moveTo(w/2-3,hy-2.6);c.quadraticCurveTo(w/2,hy,w/2+3,hy+2.6);c.lineWidth=.9;c.strokeStyle=dk(SKIN[3],.4);c.stroke();sparkle(c,w/2,hy-11,4);}
   else{// a jumping high five
    const sx=w/2,sy=18;star(c,sx,sy,9);for(let k2=0;k2<6;k2++){const a=-Math.PI/2+(k2-2.5)*.5;tube(c,sx+Math.cos(a)*13,sy+Math.sin(a)*13,sx+Math.cos(a)*18,sy+Math.sin(a)*18,'#f7cd45',1.6,.5);}
    bean(c,{x:w/2-24,y:92,skin:3,hair:1,style:'spiky',kit:L.teamB,shorts:L.shortsB,armL:.6,reachR:[w/2,33],legs:'jump',face:'joy',look:.5});
    bean(c,{x:w/2+24,y:94,skin:0,hair:4,style:'bun',kit:L.teamA,shorts:L.shortsA,reachL:[w/2,33],armR:.6,face:'joy',look:-.5});
    sparkle(c,w/2,33,7);ball(c,w*.87,87,6.5);}
  }else if(t===1){
   if(k===0){// a kid shares a water bottle
    for(const [x,y] of [[w*.5,15],[w*.3,25],[w*.71,23]] as const){c.beginPath();c.moveTo(x,y-4.5);c.quadraticCurveTo(x+3.2,y,x,y+3);c.quadraticCurveTo(x-3.2,y,x,y-4.5);c.fillStyle=lit(c,'#7fcff3',x,y,4);c.fill();gloss(c,x-.9,y,.7,1.2,0,.7);}
    const by=94-34;bean(c,{x:w/2-26,y:94,s:.9,skin:2,hair:0,style:'crop',kit:L.teamA,shorts:L.shortsA,armL:.3,reachR:[w/2-2,by+2],look:.7,face:'open'});
    bean(c,{x:w/2+26,y:94,s:.9,skin:4,hair:3,style:'puffs',kit:L.teamB,shorts:L.shortsB,reachL:[w/2+5,by+3],armR:.3,look:-.7,face:'smile'});
    bottle(c,w/2+1.5,by-3,-.45);heart(c,w/2,13,7.5);}
   else if(k===2){// a player helps a fallen opponent up
    const hy=94-44;
    bean(c,{x:w*.33,y:96,s:.92,skin:5,hair:0,style:'spiky',kit:L.teamB,shorts:L.shortsB,armL:.6,reachR:[w*.5,hy],legs:'sit',look:.8,face:'smile'});
    bean(c,{x:w*.69,y:94,skin:1,hair:2,style:'bob',kit:L.teamA,shorts:L.shortsA,reachL:[w*.5,hy],armR:.35,look:-.8,face:'open',tilt:-.08});
    orb(c,w*.5,hy,6,5.2,SKIN[3],1);heart(c,w/2,18,9);sparkle(c,w*.2,30,6);sparkle(c,w*.85,26,5);ball(c,w*.88,88,6);}
   else{// teammates passing the ball
    const x0=w*.24,x1=w*.78;c.setLineDash([2.6,3.6]);c.lineCap='round';c.beginPath();c.moveTo(x0+16,80);c.quadraticCurveTo(w/2,26,x1-12,56);c.lineWidth=1.8;c.strokeStyle='rgba(70,90,80,.55)';c.stroke();c.setLineDash([]);
    bean(c,{x:x0,y:94,skin:3,hair:1,style:'crop',kit:L.teamA,shorts:L.shortsA,armL:.9,armR:.7,legs:'kick',look:.8,face:'smile'});
    bean(c,{x:x1,y:94,skin:0,hair:2,style:'bun',kit:L.teamA,shorts:L.shortsA,armL:2.1,armR:2.1,handL:'open',look:-.6,face:'open'});
    ball(c,w*.55,39,7.5);star(c,w*.5,15,6);}
  }else{
   if(k===0){// the keeper and the striker hug after the match
    confetti(c,w,31,22,6,66);
    bean(c,{x:w/2+19,y:94,skin:4,hair:0,style:'puffs',kit:L.teamA,shorts:L.shortsA,reachL:[w/2-24,94-48],armR:.45,look:-.6,face:'joy',tilt:-.1});
    bean(c,{x:w/2-19,y:94,skin:2,hair:3,style:'crop',kit:'#3fb37f',shorts:'#226a4c',socks:'#3fb37f',collar:'#fdf8ee',armL:.5,reachR:[w/2+26,94-50],handL:'glove',handR:'glove',glove:'#ff9a3c',look:.6,face:'joy',tilt:.1});
    heart(c,w/2,12,8);}
   else if(k===2){// the crowd cheers both teams: each holds up the OTHER team's scarf
    confetti(c,w,53,26,6,40);const xs=[.14,.38,.62,.86];
    xs.forEach((f,i)=>bean(c,{x:w*f,y:94,s:.72,skin:(i*2+1)%6,hair:i,style:(['crop','puffs','spiky','bob'] as const)[i],kit:i%2?L.teamB:L.teamA,shorts:i%2?L.shortsB:L.shortsA,
     reachL:[w*f-15,94-31],reachR:[w*f+15,94-31],scarf:i%2?L.teamA:L.teamB,face:i%2?'joy':'open'}));}
   else{// a fan waving a flag for each team, balls bouncing
    confetti(c,w,77,18,6,60);
    bean(c,{x:w*.5,y:94,s:.88,skin:1,hair:4,style:'bun',kit:'#f7cd45',shorts:'#3d85d3',armL:2.15,armR:2.15,flagL:L.teamA,flagR:L.teamB,face:'joy',legs:'jump'});
    ball(c,w*.14,72,7);ball(c,w*.87,60,6);heart(c,w*.15,26,7);heart(c,w*.85,24,7);}
  }});
 finish(c,w,t);}

/** The round kindness badge for the cab ends (heart + ball) in a 100 × 100 square. */
export function drawWrapBadge(c:WrapCtx,t:number){const L=WRAP_LOOK[t];
 c.beginPath();c.arc(50,50,48,0,Math.PI*2);c.fillStyle=lit(c,L.frame,50,50,48,.3,.25);c.fill();c.lineWidth=1.6;c.strokeStyle=dk(L.frame,.4);c.stroke();
 c.beginPath();c.arc(50,50,38,0,Math.PI*2);const g=c.createRadialGradient(44,40,4,50,50,40);g.addColorStop(0,'#fffdf5');g.addColorStop(1,'#f6e7c4');c.fillStyle=g;c.fill();c.lineWidth=1.4;c.strokeStyle=dk(L.frame,.25);c.stroke();
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;if(L.frame===L.accent)orb(c,50+Math.cos(a)*43,50+Math.sin(a)*43,2.4,2.4,'#fff4d0',.6,0,false);else star(c,50+Math.cos(a)*43,50+Math.sin(a)*43,3.4);}
 heart(c,45,47,30);ball(c,66,66,13);gloss(c,34,22,14,5,-.5,.25);}
