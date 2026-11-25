/**
 * Kindness train wraps: the drawings. v3, Drip FC (owner, Nov 25 2026: "let's update the train graphics to show drip fc and no images
 * of kids or characters. still have the text"). NO people, islanders, hands or mascots: the club's own crest and wordmark (drawn by
 * lib/shop/clubArt.ts drawClubMark, passed in as `mark`, so this file loads nothing and stays plain canvas code) on club-blue cards,
 * with football objects that carry each kindness theme: Fair Play (swapped shirts, the referee's whistle, gold stars), Help Each
 * Other Up (a shared water bottle, laced boots, hearts), Cheer Everyone On (both teams' scarves and pennants, confetti).
 * Still in the HUD icon style the owner approved on Nov 24 ("match the energy bar icons"): soft radial shading lit from the top left,
 * a glossy highlight, tinted rims (a darker shade of each fill, never black ink), soft shadows and a faint grain.
 * Colours: the club's blue / navy / white (lib/shop/dripKit.ts CLUB_COLORS) with each theme's livery accent on the frame.
 * Pure canvas drawing (no three.js, no DOM look-ups): lib/town/trainWraps.ts lays the tiles out in ONE atlas and calls these at load
 * (and once more when the club's masks arrive). Every tile is drawn in its own units: 100 high, `w` wide; the badge in 100 × 100.
 */
export type WrapCtx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
/** Draws a Drip FC mark (lib/shop/clubArt.ts drawClubMark): `id` tinted `ink`, fitted in a w × h box centred on (x, y). */
export type ClubMarkFn=(c:WrapCtx,id:'crest'|'wordmark'|'drop',x:number,y:number,w:number,h:number,ink:string)=>void;
/** The club colours (lib/shop/dripKit.ts CLUB_COLORS; copied so this file imports nothing). */
export const CLUB={blue:'#1d5fd1',navy:'#0d2350',white:'#f7f3ea'} as const;
/** Per theme: the frame (the livery's accent, so the panels sit on the body), the theme accent, and the two teams' colours (always
 *  two teams: kindness to the other side is the point). */
export const WRAP_LOOK=[
 {frame:'#8c2a2f',accent:'#f2c230',teamA:'#e65a4c',teamB:'#ffffff'},
 {frame:'#2f6fae',accent:'#ef5a69',teamA:'#3fae6a',teamB:'#f39a3d'},
 {frame:'#f2bd1d',accent:'#f2bd1d',teamA:'#e65a4c',teamB:'#3fae6a'},
] as const;
/** Fallback when no club art drawer is given: the letters in the club's italic, in `ink`. */
const letterMark:ClubMarkFn=(c,id,x,y,w,h,ink)=>{c.save();c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';
 const fs=Math.min(h*.6,w/(id==='wordmark'?4.6:2.2));c.font=`italic 900 ${fs}px system-ui,-apple-system,"Segoe UI",sans-serif`;c.fillText(id==='wordmark'?'DRIP FC':'DFC',x,y);c.restore();};

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
 g.addColorStop(0,`rgba(4,12,34,${a})`);g.addColorStop(1,'rgba(4,12,34,0)');c.save();c.translate(x,y);c.scale(1,ry/rx);c.translate(-x,-y);
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

// ---------------------------------------------------------------- Drip FC pieces and football objects (no people)
/** The crest on a glossy roundel: white rim, club-blue disc lit from the top left, a navy ring, the white crest. */
function roundel(c:WrapCtx,x:number,y:number,r:number,mark:ClubMarkFn){const K=pxk(c);
 c.save();c.shadowColor='rgba(4,12,34,.45)';c.shadowBlur=4*K;c.shadowOffsetY=2*K;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=lit(c,CLUB.white,x,y,r,.5,.12);c.fill();c.restore();
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=Math.max(.7,r*.035);c.strokeStyle=dk(CLUB.white,.3);c.stroke();
 const ri=r*.84;c.beginPath();c.arc(x,y,ri,0,Math.PI*2);c.fillStyle=lit(c,CLUB.blue,x,y,ri,.32,.3);c.fill();
 c.beginPath();c.arc(x,y,ri*.9,0,Math.PI*2);c.lineWidth=ri*.06;c.strokeStyle=CLUB.navy;c.stroke();
 mark(c,'crest',x,y+ri*.03,ri*1.2,ri*1.36,'#ffffff');gloss(c,x-r*.34,y-r*.5,r*.4,r*.16,-.45,.38);}
/** The wordmark on a club-blue tab with a white rim (the Kit Shop's wordmark sticker), lit like a HUD pill. */
function wordTab(c:WrapCtx,x:number,y:number,w:number,h:number,mark:ClubMarkFn){const K=pxk(c);
 c.save();c.shadowColor='rgba(4,12,34,.4)';c.shadowBlur=3*K;c.shadowOffsetY=1.6*K;c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,h*.36);c.fillStyle=CLUB.white;c.fill();c.restore();
 const b=h*.13;c.beginPath();c.roundRect(x-w/2+b,y-h/2+b,w-b*2,h-b*2,(h-b*2)*.32);const g=c.createLinearGradient(0,y-h/2,0,y+h/2);g.addColorStop(0,lt(CLUB.blue,.16));g.addColorStop(1,dk(CLUB.blue,.2));c.fillStyle=g;c.fill();
 mark(c,'wordmark',x,y+h*.03,(w-b*2)*.84,(h-b*2)*.74,'#ffffff');gloss(c,x-w*.18,y-h*.28,w*.22,h*.08,0,.3);}
/** A football shirt (an object, nobody in it): lit fill, a trim collar and cuffs, the club drop on the chest. s = 1 → ~52 wide. */
function shirt(c:WrapCtx,x:number,y:number,s:number,col:string,trim:string,rot:number,mark:ClubMarkFn){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);
 c.beginPath();c.moveTo(-8,-19);c.quadraticCurveTo(0,-13,8,-19);c.lineTo(19,-15);c.lineTo(27,-2);c.lineTo(18.5,3);c.lineTo(15.5,-3);c.lineTo(15.5,20);c.quadraticCurveTo(0,22.5,-15.5,20);
 c.lineTo(-15.5,-3);c.lineTo(-18.5,3);c.lineTo(-27,-2);c.lineTo(-19,-15);c.closePath();c.lineJoin='round';
 c.fillStyle=lit(c,col,0,0,26,.4,.22);c.fill();c.lineWidth=1.3;c.strokeStyle=dk(col,.42);c.stroke();
 c.lineCap='round';c.strokeStyle=trim;c.lineWidth=2.4;c.beginPath();c.moveTo(-8,-18.4);c.quadraticCurveTo(0,-12.6,8,-18.4);c.stroke();
 c.lineWidth=2.2;c.beginPath();c.moveTo(25.6,-3.4);c.lineTo(18,1.2);c.stroke();c.beginPath();c.moveTo(-25.6,-3.4);c.lineTo(-18,1.2);c.stroke();
 mark(c,'drop',7.5,-5,6.5,8,trim);gloss(c,-8,-8,5,2.4,-.5,.42);c.restore();}
/** The referee's whistle on its cord (silver, lit). */
function whistle(c:WrapCtx,x:number,y:number,s:number,cord:string){c.save();c.translate(x,y);c.scale(s,s);
 c.lineCap='round';c.strokeStyle=cord;c.lineWidth=2;c.beginPath();c.moveTo(-14,-4);c.bezierCurveTo(-30,-30,22,-38,12,-12);c.stroke();
 c.beginPath();c.roundRect(-22,-6,18,8,2.5);c.fillStyle=lit(c,'#d9dde4',-14,-3,10);c.fill();c.lineWidth=.9;c.strokeStyle='#7d8492';c.stroke();
 orb(c,2,2,12,11,'#d9dde4',1.1);c.beginPath();c.arc(2,2,4.4,0,Math.PI*2);c.fillStyle='#5d6474';c.fill();c.beginPath();c.roundRect(-6,-9,6,4,1);c.fillStyle='#5d6474';c.fill();c.restore();}
/** A football boot side-on (club blue, three white stripes, navy sole and studs). s = 1 → ~38 long. */
function boot(c:WrapCtx,x:number,y:number,s:number,col:string,flip=false){c.save();c.translate(x,y);c.scale(flip?-s:s,s);
 c.beginPath();c.moveTo(-17,1);c.lineTo(-17,-11);c.quadraticCurveTo(-15,-15,-10,-14);c.lineTo(-3,-12);c.quadraticCurveTo(8,-10,15,-5);c.quadraticCurveTo(21,-2,20,1);c.closePath();c.lineJoin='round';
 c.fillStyle=lit(c,col,-2,-8,18,.38,.22);c.fill();c.lineWidth=1.1;c.strokeStyle=dk(col,.42);c.stroke();
 c.strokeStyle='#ffffff';c.lineWidth=1.7;c.lineCap='round';for(let k=0;k<3;k++){c.beginPath();c.moveTo(-6+k*4.2,-11.5+k*.5);c.lineTo(-9+k*4.2,-1.5);c.stroke();}
 c.strokeStyle=lt(col,.55);c.lineWidth=.8;c.beginPath();c.moveTo(-3,-12);c.lineTo(5,-9.6);c.stroke();// laces
 c.beginPath();c.roundRect(-18,0,39,4,2);c.fillStyle=CLUB.navy;c.fill();c.fillStyle=lt(CLUB.navy,.2);for(const sx of [-14,-8,5,11,16])c.fillRect(sx-1.2,3.5,2.4,2.6);
 gloss(c,-10,-10,3.6,1.4,-.2,.5);c.restore();}
/** A team scarf: stripes of the colour and white, fringe at both ends. L long, h wide, turned `rot`. */
function scarf(c:WrapCtx,x:number,y:number,L:number,h:number,rot:number,col:string){c.save();c.translate(x,y);c.rotate(rot);
 c.save();c.beginPath();c.roundRect(-L/2,-h/2,L,h,2);c.clip();const n=7,sw=L/n;for(let k=0;k<n;k++){c.fillStyle=k%2?CLUB.white:col;c.fillRect(-L/2+k*sw,-h/2,sw+.3,h);}
 const g=c.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'rgba(255,255,255,.3)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(20,10,40,.22)');c.fillStyle=g;c.fillRect(-L/2,-h/2,L,h);c.restore();
 c.beginPath();c.roundRect(-L/2,-h/2,L,h,2);c.lineWidth=.9;c.strokeStyle=dk(col,.4);c.stroke();
 c.strokeStyle=col;c.lineWidth=1.1;c.lineCap='round';for(const e of [-1,1])for(let k=0;k<5;k++){const yy=-h/2+h*(k+.5)/5;c.beginPath();c.moveTo(e*L/2,yy);c.lineTo(e*(L/2+4),yy);c.stroke();}c.restore();}
/** A pennant on a pole: the triangle in `col`, a white star on it. */
function pennant(c:WrapCtx,x:number,y:number,h:number,col:string,side:-1|1){tube(c,x,y,x,y-h,'#d8b47a',2.2,.7);orb(c,x,y-h-1.5,2.2,2.2,'#f7cd45',.6,0,false);
 const fy=y-h+1,fl=h*.62,fh=h*.36;c.beginPath();c.moveTo(x,fy);c.lineTo(x+side*fl,fy+fh/2);c.lineTo(x,fy+fh);c.closePath();c.lineJoin='round';
 c.fillStyle=lit(c,col,x+side*fl*.3,fy+fh*.4,fl*.6,.4,.2);c.fill();c.lineWidth=.9;c.strokeStyle=dk(col,.42);c.stroke();
 c.save();c.translate(x+side*fl*.34,fy+fh/2);c.fillStyle='#ffffff';c.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?fh*.1:fh*.2;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}

// ---------------------------------------------------------------- a tile's card: livery frame, club-blue card, stripes, glow, grain, pitch
const CARD=(c:WrapCtx,w:number)=>{c.beginPath();c.roundRect(4.5,4.5,w-9,91,10);};
function frame(c:WrapCtx,w:number,t:number,pitch=true){const L=WRAP_LOOK[t];
 const fg=c.createLinearGradient(0,0,0,100);fg.addColorStop(0,lt(L.frame,.16));fg.addColorStop(1,dk(L.frame,.16));c.fillStyle=fg;c.fillRect(0,0,w,100);
 const g=c.createLinearGradient(0,4,0,96);g.addColorStop(0,lt(CLUB.blue,.08));g.addColorStop(1,mix(CLUB.blue,CLUB.navy,.72));
 c.save();CARD(c,w);c.fillStyle=g;c.fill();c.clip();
 c.fillStyle='rgba(255,255,255,.05)';for(let x=-6;x<w;x+=22)c.fillRect(x,0,11,100);// the club's kit stripes, faint
 const gl=c.createRadialGradient(w/2,46,4,w/2,46,w*.6);gl.addColorStop(0,'rgba(140,190,255,.42)');gl.addColorStop(1,'rgba(140,190,255,0)');c.fillStyle=gl;c.fillRect(0,0,w,100);
 c.save();c.translate(w/2,104);c.fillStyle='rgba(255,255,255,.06)';for(let k=0;k<12;k++){c.rotate(Math.PI/12);c.beginPath();c.moveTo(0,0);c.lineTo(-8,-160);c.lineTo(8,-160);c.closePath();c.fill();}c.restore();
 if(pitch){c.beginPath();c.moveTo(0,83);c.quadraticCurveTo(w/2,79,w,83);c.lineTo(w,100);c.lineTo(0,100);c.closePath();
  const pg=c.createLinearGradient(0,80,0,100);pg.addColorStop(0,mix(CLUB.blue,CLUB.navy,.45));pg.addColorStop(1,CLUB.navy);c.fillStyle=pg;c.fill();c.save();c.clip();
  c.fillStyle='rgba(255,255,255,.05)';for(let x=-4;x<w;x+=18)c.fillRect(x,78,9,26);
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;c.beginPath();c.ellipse(w/2,95,w*.16,7,0,Math.PI,0);c.stroke();c.restore();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=.9;c.beginPath();c.moveTo(0,83);c.quadraticCurveTo(w/2,79,w,83);c.stroke();}
 c.restore();}
function finish(c:WrapCtx,w:number,t:number){const L=WRAP_LOOK[t];
 c.save();CARD(c,w);c.clip();
 const rnd=rng(1000+Math.round(w*7)+t*31);for(let k=0;k<w*4;k++){const x=rnd()*w,y=rnd()*100;c.fillStyle=k%2?'rgba(0,10,40,.08)':'rgba(255,255,255,.07)';c.fillRect(x,y,.7,.7);}// grain
 const ig=c.createLinearGradient(0,4.5,0,14);ig.addColorStop(0,'rgba(0,10,40,.25)');ig.addColorStop(1,'rgba(0,10,40,0)');c.fillStyle=ig;c.fillRect(0,4,w,10);// soft inner shadow under the frame
 c.restore();
 CARD(c,w);c.lineWidth=1.4;c.strokeStyle=dk(L.frame,.3);c.stroke();
 c.beginPath();c.roundRect(5.6,5.6,w-11.2,88.8,9);c.lineWidth=.7;c.strokeStyle='rgba(255,255,255,.4)';c.stroke();
 c.beginPath();c.roundRect(.8,.8,w-1.6,98.4,11);c.lineWidth=1.2;c.strokeStyle=dk(L.frame,.38);c.stroke();
 c.beginPath();c.moveTo(10,2.2);c.lineTo(w-10,2.2);c.lineWidth=.9;c.strokeStyle=lt(L.frame,.35);c.stroke();}
function inside(c:WrapCtx,w:number,draw:()=>void){c.save();CARD(c,w);c.clip();draw();c.restore();}
const FONT='ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Nunito", "Varela Round", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
/** A dark soft shadow under an object on the club-blue pitch. */
const shade=(c:WrapCtx,x:number,y:number,rx:number)=>groundShadow(c,x,y,rx,rx*.22,.5);

// ---------------------------------------------------------------- the tiles (theme t, tile k; tile 1 is always the slogan)
/** The panel tiles of a theme in slot order (car-local −z → +z): the crest, the slogan, two theme scenes. */
export const WRAP_TILES=['crest','slogan','scene1','scene2'] as const;
export function drawWrapTile(c:WrapCtx,t:number,k:number,w:number,slogan:readonly [string,string],mark:ClubMarkFn=letterMark){
 const L=WRAP_LOOK[t],K=pxk(c);frame(c,w,t,k!==1);
 inside(c,w,()=>{
  if(k===1){// the slogan: the crest, then the two lines on a big glossy club-white pill with a lip in the theme's frame colour
   const cx=w*.135;roundel(c,cx,50,Math.min(21,w*.11),mark);
   const tx=w*.6,tw=w*.7,th=66;c.save();c.translate(tx,49);c.rotate(-.025);
   c.save();c.shadowColor='rgba(4,12,34,.45)';c.shadowBlur=5*K;c.shadowOffsetY=2.2*K;
   c.beginPath();c.roundRect(-tw/2,-th/2+3,tw,th,17);c.fillStyle=L.frame===L.accent?dk(L.frame,.12):L.frame;c.fill();c.restore();// the lip (the HUD pill's base)
   c.beginPath();c.roundRect(-tw/2,-th/2,tw,th,17);const rg=c.createLinearGradient(0,-th/2,0,th/2);rg.addColorStop(0,'#ffffff');rg.addColorStop(1,mix(CLUB.white,'#c9d6ee',.5));c.fillStyle=rg;c.fill();
   c.lineWidth=1.1;c.strokeStyle=mix(CLUB.white,CLUB.navy,.3);c.stroke();
   c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
   let fs=28;c.font=`800 ${fs}px ${FONT}`;const mw=Math.max(c.measureText(slogan[0]).width,c.measureText(slogan[1]).width);if(mw>tw-16){fs*=(tw-16)/mw;c.font=`800 ${fs}px ${FONT}`;}
   for(const [i,s] of slogan.entries()){const y=(i?1:-1)*fs*.56+1;c.fillStyle=CLUB.navy;c.fillText(s,0,y);}
   c.restore();heart(c,tx+tw/2-4,17,9.5,t===1?L.accent:'#ef5a69');ball(c,tx+tw/2,82,8.5);star(c,tx-tw/2+4,16,6.5);return;}
  if(k===0){// the club: the crest roundel and the wordmark tab, the theme's own sparkle round it
   if(t===0)for(const [x,y,r] of [[w*.14,20,7],[w*.86,18,6.5],[w*.13,54,4.5],[w*.88,52,5]] as const)star(c,x,y,r);
   else if(t===1)for(const [x,y,r] of [[w*.15,22,8],[w*.86,20,7],[w*.13,56,5],[w*.88,54,5.5]] as const)heart(c,x,y,r,L.accent);
   else{confetti(c,w,51,22,8,66);star(c,w*.14,20,6.5);star(c,w*.86,20,6.5);}
   roundel(c,w/2,39,27,mark);wordTab(c,w/2,80,Math.min(w*.8,104),25,mark);return;}
  const s2=k===3;
  if(t===0){
   if(!s2){// Fair Play: two shirts swapped at full time (respect), a heart between them
    shade(c,w*.32,88,24);shade(c,w*.68,88,24);shirt(c,w*.31,56,1.05,L.teamA,'#ffffff',-.14,mark);shirt(c,w*.69,56,1.05,L.teamB,CLUB.navy,.14,mark);
    heart(c,w/2,26,11);sparkle(c,w/2-16,16,4);sparkle(c,w/2+17,14,5);}
   else{// the referee's whistle and a gold star for a fair game
    for(const [x,y,r] of [[w*.2,24,6],[w*.83,62,5]] as const)star(c,x,y,r);star(c,w*.7,30,13);
    shade(c,w*.4,88,22);whistle(c,w*.4,58,1.15,L.frame);ball(c,w*.82,82,8);sparkle(c,w*.62,18,5);}
  }else if(t===1){
   if(!s2){// Help Each Other Up: a water bottle to share, hearts, the ball
    for(const [x,y] of [[w*.5,13],[w*.3,22],[w*.7,20]] as const){c.beginPath();c.moveTo(x,y-4.5);c.quadraticCurveTo(x+3.2,y,x,y+3);c.quadraticCurveTo(x-3.2,y,x,y-4.5);c.fillStyle=lit(c,'#7fcff3',x,y,4);c.fill();gloss(c,x-.9,y,.7,1.2,0,.7);}
    shade(c,w*.4,88,20);c.save();c.translate(w*.4,57);c.scale(2.6,2.6);bottle(c,0,0,-.18);c.restore();
    heart(c,w*.7,48,13,L.accent);ball(c,w*.78,82,8);sparkle(c,w*.22,46,5);}
   else{// laced boots, ready to help a teammate up: a pair, a heart over them
    shade(c,w*.5,90,40);boot(c,w*.3,80,1.25,CLUB.blue);boot(c,w*.7,80,1.25,CLUB.blue,true);
    heart(c,w/2,30,13,L.accent);heart(c,w*.27,24,6,'#ff8fa0');heart(c,w*.73,24,6,'#ff8fa0');sparkle(c,w*.85,48,5);}
  }else{
   if(!s2){// Cheer Everyone On: both teams' scarves held up together, confetti
    confetti(c,w,31,24,8,70);scarf(c,w/2,48,w*.66,12,-.32,L.teamA);scarf(c,w/2,52,w*.66,12,.32,L.teamB);heart(c,w/2,50,10);
    star(c,w*.18,78,5);star(c,w*.82,78,5);}
   else{// a pennant for each team, balls bouncing
    confetti(c,w,77,18,8,60);pennant(c,w*.43,88,62,L.teamA,-1);pennant(c,w*.57,88,62,L.teamB,1);
    ball(c,w*.14,72,7);ball(c,w*.87,64,6);heart(c,w*.15,26,7);heart(c,w*.85,24,7);}
  }});
 finish(c,w,t);}

/** The round cab badge (the Drip FC crest + a small heart) in a 100 × 100 square, in the livery's frame colour. */
export function drawWrapBadge(c:WrapCtx,t:number,mark:ClubMarkFn=letterMark){const L=WRAP_LOOK[t];
 c.beginPath();c.arc(50,50,48,0,Math.PI*2);c.fillStyle=lit(c,L.frame,50,50,48,.3,.25);c.fill();c.lineWidth=1.6;c.strokeStyle=dk(L.frame,.4);c.stroke();
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;if(L.frame===L.accent)orb(c,50+Math.cos(a)*43,50+Math.sin(a)*43,2.4,2.4,'#fff4d0',.6,0,false);else star(c,50+Math.cos(a)*43,50+Math.sin(a)*43,3.4);}
 roundel(c,50,50,39,mark);heart(c,74,74,14,t===1?L.accent:'#ef5a69');}
