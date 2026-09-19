'use strict';
/* ABSTRACT MENTAL TOUGHNESS — actual unchanged upstream core.js.
BRIEF: A football is the self, not a character portrait. Pressure contracts;
thoughts knot; breathing makes room; one line becomes the next useful action.
1:1 / 720 output / 24 unique offline samples per second / 60 seconds.
Bold editorial cut-paper illustration with patterned kit, expressive face, botanical growth and independent limb motion. Latest user references override the prior all-over riso finish.
A printed player silhouette joins the abstract motifs; no dialogue bubbles or tactical tokens.
Anchor: the same stitched disc throughout. All colors from the palettes.
BEATS (each 5s): miss / pressure / tangled thought / broader memory /
exhale / reset / attention / new angle / gentle touch / connection /
three tools / Next moment. Large simple forms read at contact-sheet scale.
*/
const QUERY=new URLSearchParams(location.search);
const INK_PALETTE=makePalette({paper:'#fff0d6',fills:['#ff6b00','#f6cd19','#0056ff','#006b45','#ff60c2'],accents:['#ff5ebc','#49d99a','#f6d91d','#0056ff'],ink:'#18251d',shade:'#283349',finish:'flat',chalk:'#fff0d6',chalkDim:'#0056ff'},'paperInk');
usePalette(INK_PALETTE);
let shotIndex=0,shotTime=0;
const SCENE_COLORS=[['#0056ff','#ff81d6','#ffbe08'],['#ff4927','#ff81d6','#ffbe08'],['#121a19','#ff81d6','#0056ff'],['#ffbe08','#006b45','#ff4927'],['#0056ff','#006b45','#ff81d6'],['#006b45','#ffbe08','#ff81d6'],['#ff4927','#ff81d6','#0056ff'],['#0056ff','#ffbe08','#006b45'],['#006b45','#ffbe08','#ff81d6'],['#0056ff','#ff81d6','#ffbe08'],['#ff4927','#ff81d6','#006b45'],['#0056ff','#ffbe08','#ff81d6']];
function oval(c,x,y,rx,ry,color,rot=0){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fill();}
function stroke(c,pts,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
// Stable printed textures: no random-per-frame grain or texture boil.
function printTexture(c,path,box,seed,kind='grain'){
 const [x,y,w,h]=box;
 grain(c,path,box,Math.max(90,Math.round(w*h/70)),PAL.ink,.16,seed,1.3);
 grain(c,path,box,Math.max(60,Math.round(w*h/150)),PAL.paper,.18,seed+1,.9);
 const r=rng(seed+94);c.save();c.clip(path);
 for(let n=0;n<Math.max(25,w*h/1200);n++){const px=x+r()*w,py=y+r()*h,sz=(.4+r()*2.3)*Math.max(.25,Math.min(w,h)/500);c.globalAlpha=.05+r()*.12;c.fillStyle=n%2?PAL.paper:PAL.ink;c.fill(polyPath([[px,py],[px+sz*5,py-sz],[px+sz*7,py+sz],[px+sz,py+sz*2]]));}c.restore();
 if(kind==='dots')surface(c,path,box,{finish:'riso',seed:seed+2,color:PAL.ink,cell:9,density:.16,alpha:.27});
 if(kind==='lines')surface(c,path,box,{finish:'ink',seed:seed+2,color:PAL.paper,gap:12,len:28,grain:40,alpha:.24,width:1});
}
const LUNA=new Image(),MURAL=new Image(),FIELD=new Image();
FIELD.src='assets/field-sheet.png';
LUNA.src='assets/luna-parts.png';MURAL.src='assets/mural-parts.png';
function sprite(c,img,box,x,y,w,h){c.drawImage(img,...box,x,y,w,h);}
const PANELS=[[20,23,228,430],[269,23,211,430],[506,23,211,430],[752,23,207,430],[991,23,207,430]];
const LANDSCAPES=[[22,474,384,170],[431,475,365,169],[819,475,377,169]];
const MOTIFS={sun:[298,670,96,106],cloud:[22,700,102,72],cloud2:[124,668,114,74],star:[402,671,118,116],cross:[799,679,68,82],ring:[870,682,77,76],dots:[726,700,75,78],stripes:[530,680,93,98]};
function stock(c){
 const t=shotTime,i=shotIndex,base=SCENE_COLORS[i][0];paper(c,base,null,400+i);
 // Wide overscan keeps every moving layer filled, including during camera travel.
 c.save();c.translate(CX,CY);c.rotate(Math.sin(t*.42+i)*.016);c.scale(1.07,1.07);
 const bx=-CX+Math.sin(t*.6+i)*W*.018;
 sprite(c,MURAL,PANELS[i%5],bx,-CY,W,H);c.restore();
 if([0,7,8,9,11].includes(i)){
  sprite(c,FIELD,[24,45,349,161],-W*.03+Math.sin(t*.3)*W*.02,-H*.03,W*1.06,H*.76);
  sprite(c,FIELD,[438,362,347,24],-W*.03+Math.sin(t*.5)*W*.012,H*.49,W*1.06,H*.14);
  sprite(c,FIELD,[397,500,464,83],-W*.02+Math.sin(t*.7)*W*.008,H*.59,W*1.04,H*.14);
  // Sample only the solid turf interior, avoiding baked checkerboard edges.
  sprite(c,FIELD,[174,780,356,169],-W*.04+Math.sin(t*.8)*W*.006,H*.73,W*1.08,H*.31);
 }
 // Far clouds and symbols drift independently of the background painting.
 for(let j=0;j<2;j++){const key=j?'cloud2':'cloud',xx=W*(.09+j*.64)+Math.sin(t*.45+j)*W*.035;sprite(c,MURAL,MOTIFS[key],xx,H*(.055+j*.025),W*.17,H*.105);}
 const icon=["sun","cross","ring","star"][i%4];
 c.save();c.translate(W*.83,H*.35);c.rotate(Math.sin(t*.75)*.12);const grow=1+Math.sin(t*1.1)*.035;c.scale(grow,grow);c.beginPath();c.arc(0,0,W*.073,0,TAU);c.clip();sprite(c,MURAL,MOTIFS[icon],-W*.075,-H*.075,W*.15,H*.15);c.restore();
 // Separate horizon and foreground move at different speeds, not as one flat panel.
 if(![0,7,8,9,11].includes(i))sprite(c,MURAL,LANDSCAPES[i%3],-W*.04+Math.sin(t*.8)*W*.02,H*.72,W*1.08,H*.28);
 const waves=[[20,791,373,70],[399,799,365,63],[779,798,228,63]];
 sprite(c,MURAL,waves[(i+1)%3],-W*.07+Math.sin(t*1.1+.6)*W*.035,H*.88,W*1.14,H*.16);
}
// Rig the supplied transparent pieces. Each attachment uses a shared joint,
// with small overlaps inside the sprite so no skin-colored filler is needed.
function boneSprite(c,box,pivot,end,length,angle){
 const dx=end[0]-pivot[0],dy=end[1]-pivot[1],scale=length/Math.hypot(dx,dy);
 c.save();c.rotate(angle-Math.atan2(dy,dx)+Math.PI/2);c.scale(scale,scale);sprite(c,LUNA,box,-pivot[0],-pivot[1],box[2],box[3]);c.restore();
}
function person(c,x,y,size,t,down=false,teammate=false){
 c.save();c.translate(x,y);c.scale(size,size);
 const run=[7,8].includes(shotIndex),calm=[4,5].includes(shotIndex),sad=shotIndex<3,celebrate=shotIndex===11,phase=t*5.2;
 c.translate(run?Math.sin(t)*6:0,run?-Math.abs(Math.sin(phase))*2.5:Math.sin(t*1.6)*.6);c.rotate(sad?.045:run?-.055:Math.sin(t)*.012);
 const upperLeg=[[604,600,90,145],[1038,600,93,145]],lowerLeg=[[577,746,108,160],[1043,746,112,160]],boots=[[556,909,179,102],[1006,909,171,102]];
 for(let side=0;side<2;side++){
  c.save();c.translate(side?15:-15,30);
  const a=run?Math.sin(phase+side*Math.PI)*.38:Math.sin(t*1.6+side)*.025;
  c.rotate(a);boneSprite(c,upperLeg[side],[45,13],[45,126],29,0);c.translate(0,28);
  const bend=run?Math.max(0,Math.sin(phase+side*Math.PI+.7))*.55:.04;c.rotate(bend);
  boneSprite(c,lowerLeg[side],[54,12],[side?73:38,145],35,0);c.translate(0,34);
  c.rotate(-a*.4-bend*.3);const boot=boots[side];sprite(c,LUNA,boot,side?-8:-22,-3,30,20);c.restore();
 }
 // Arm roots are behind the jersey sleeve, forearms overlap at the elbow.
 const uppers=[[553,324,143,161],[1042,324,139,164]],lowers=[[487,488,123,210],[1126,489,121,211]];
 for(let side=0;side<2;side++){
  const sign=side?1:-1;c.save();c.translate(sign*29,-29);
  const angle=celebrate?sign*2.2:calm?sign*.22:run?Math.sin(phase+side*Math.PI)*.5:sign*.09+Math.sin(t*2)*.04;
  c.rotate(angle);
  boneSprite(c,uppers[side],side?[30,20]:[104,20],side?[101,143]:[35,141],29,0);c.translate(0,27);
  c.rotate(sign*(calm?1.3:run?.75:.22));boneSprite(c,lowers[side],side?[32,15]:[86,15],side?[84,181]:[38,184],36,0);c.restore();
 }
 sprite(c,LUNA,[736,620,272,186],-29,17,58,40);
 sprite(c,LUNA,[704,327,334,275],-39,-43,78,64);
 // Heads include the supplied hair, texture, eye and neck; no old vector face remains.
 const heads=[[385,64,211,250],[599,64,183,250],[782,40,196,264],[984,67,186,249],[1170,63,184,250],[1354,41,182,273]];
 const h=calm?heads[3]:sad?heads[2]:celebrate?heads[5]:heads[0];
 c.save();c.translate(0,-36);c.rotate(sad?.05:Math.sin(t*1.3)*.025);
 const sc=.27,pivotX=sad?139:calm?119:celebrate?120:140,pivotY=sad?196:calm?170:celebrate?198:174;
 sprite(c,LUNA,h,-pivotX*sc,-pivotY*sc,h[2]*sc,h[3]*sc);c.restore();c.restore();
}
function line(c,pts,col=PAL.ink,width=3,seed=1){
 if(pts.length<2)return;c.save();c.strokeStyle=col;c.lineWidth=Math.max(3,width);c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(...pts[0]);
 for(let j=1;j<pts.length-1;j++){const next=pts[j+1];c.quadraticCurveTo(...pts[j],(pts[j][0]+next[0])/2,(pts[j][1]+next[1])/2);}c.lineTo(...pts[pts.length-1]);c.stroke();c.restore();
}
function disc(c,x,y,r,col,seed=1){const p=circPath(x,y,r);c.fillStyle=col;c.fill(p);printTexture(c,p,[x-r,y-r,r*2,r*2],seed);}
function ball(c,x,y,r,turn=0){
 c.save();c.translate(x,y);c.rotate(turn);c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
 sprite(c,LUNA,[98,316,112,115],-r,-r,r*2,r*2);c.restore();
}
function ring(c,x,y,r,color,seed=1){c.save();c.strokeStyle=color;c.lineWidth=Math.max(5,r*.065);c.beginPath();c.ellipse(x,y,r,r,0,0,TAU);c.stroke();c.restore();}
function knot(c,x,y,r,amount=1,seed=30){
 for(let j=0;j<4;j++){const pts=Array.from({length:100},(_,k)=>{const a=k/99*TAU;return[x+Math.cos(a*(2+j%2))*r*(.9-j*.11),y+Math.sin(a*3)*r*(.85-j*.1)*amount];});line(c,pts,PAL.accents[j%2],7,seed+j);}
}
function strip(c,pts,color,seed){const p=polyPath(pts),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);c.fillStyle=color;c.fill(p);surface(c,p,[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],{finish:'riso',seed,cell:8,density:.22,alpha:.3});}
function miss(c,t){stock(c);const u=sm(.1,1.7,t);ball(c,lerp(W*.32,W*.9,u),H*(.8-Math.sin(u*2)*.32),W*.065,u*3);}
function pressure(c,t){stock(c);const u=sm(0,1.75,t);for(let j=0;j<6;j++){const a=j*TAU/6,r=W*(.55-u*.17),x=CX+Math.cos(a)*r,y=H*.59+Math.sin(a)*r;c.save();c.translate(x,y);c.rotate(a);strip(c,[[0,-W*.06],[-W*.09,0],[0,W*.06],[W*.04,0]],j%2?PAL.fills[0]:PAL.fills[1],50+j);c.restore();}ball(c,W*.37,H*.82,W*.06,t*.2);}
function thoughts(c,t){stock(c);for(let j=0;j<3;j++){c.save();c.translate(W*.29,H*.51);c.rotate(t*.3+j*TAU/3);sprite(c,MURAL,MOTIFS.cross,W*.035,-H*.04,W*.10,H*.10);c.restore();}ball(c,W*.29,H*.51,W*.052,t);}
function memory(c,t){stock(c);for(let j=0;j<3;j++){const x=W*(.18+j*.31),y=H*(.49+Math.sin(t*2+j)*.035);c.save();c.translate(x,y);c.rotate((j-1)*.12);strip(c,[[-W*.12,-H*.11],[W*.12,-H*.11],[W*.12,H*.15],[-W*.12,H*.15]],PAL.fills[j],70+j);stroke(c,[[-W*.07,0],[-W*.01,H*.04],[W*.075,-H*.055]],PAL.paper,7);c.restore();}ball(c,W*.5,H*.83,W*.057,t*.35);}
function breath(c,t){stock(c);const exhale=.5-.5*Math.cos(t*Math.PI/1.75);for(let j=0;j<2;j++){sprite(c,MURAL,[398,798,366,65],W*.47,H*(.48+j*.13),W*(.3+exhale*.16),H*(.075+exhale*.035));}ball(c,W*.78,H*.82,W*.055,t*.15);}
function reset(c,t){stock(c);c.save();c.translate(CX,H*.56);c.rotate(-t*.45);sprite(c,MURAL,MOTIFS.ring,-W*.18,-H*.18,W*.36,H*.36);c.restore();ball(c,CX,H*.56,W*.075,t*.5);}
function attention(c,t){stock(c);const ex=W*.56,ey=H*.53,eye=new Path2D();eye.moveTo(W*.22,ey);eye.quadraticCurveTo(ex,H*.24,W*.9,ey);eye.quadraticCurveTo(ex,H*.83,W*.22,ey);c.fillStyle=PAL.paper;c.fill(eye);c.save();c.clip(eye);oval(c,ex+Math.sin(t*2)*W*.12,ey,W*.105,W*.14,PAL.fills[3]);oval(c,ex+Math.sin(t*2)*W*.12,ey,W*.042,W*.07,PAL.ink);c.restore();ball(c,W*.8,H*.84,W*.055,t*.4);}
function angle(c,t){stock(c);const u=sm(0,1.7,t);strip(c,[[W*.43,H*.43],[W*.59,H*.43],[W*.59,H*.77],[W*.43,H*.77]],PAL.fills[0],120);const x=lerp(W*.18,W*.33,u),y=lerp(H*.81,H*.39,u);line(c,[[W*.18,H*.81],[W*.19,H*.43],[x,y]],PAL.paper,6,121);line(c,[[x,y],[W*.85,H*.45]],PAL.accents[2],5,122);ball(c,x,y,W*.06,u*2);}
function touch(c,t){stock(c);const u=sm(0,1.6,t);for(let j=0;j<4;j++){const x=W*(.15+j*.18);strip(c,[[x,H*.79],[x+W*.035,H*.66],[x+W*.07,H*.79]],PAL.fills[1],130+j);}ball(c,lerp(W*.15,W*.67,u),H*(.55+Math.sin(u*Math.PI)*.1),W*.11,u*3);for(let j=0;j<3;j++)line(c,[[W*(.04+j*.04),H*(.43+j*.055)],[W*(.19+j*.04),H*(.43+j*.055)]],PAL.paper,3,139+j);}
function connect(c,t){stock(c);const u=sm(0,1.7,t);line(c,[[W*.25,H*.56],[W*.5,H*(.76-u*.23)],[W*.76,H*.56]],PAL.paper,7,141);ball(c,lerp(W*.28,W*.73,u),H*(.6-Math.sin(u*Math.PI)*.12),W*.055,u*2);}
function tools(c,t){stock(c);for(let j=0;j<3;j++){const x=W*(.19+j*.31),y=H*.55+Math.sin(t*2+j)*H*.025;disc(c,x,y,W*.125,PAL.fills[j],150+j);if(j===0){oval(c,x,y,W*.077,W*.036,PAL.paper);oval(c,x,y,W*.023,W*.032,PAL.ink);}if(j===1){for(let n=0;n<3;n++)ring(c,x,y,W*(.035+n*.023+Math.sin(t*2)*.005),PAL.paper,160+n);}if(j===2)line(c,[[x-W*.07,y+H*.04],[x,y-H*.03],[x+W*.06,y]],PAL.paper,5,166);}ball(c,CX,H*.84,W*.05,t*.3);}
function ending(c,t){stock(c);for(let j=0;j<9;j++){const a=j*TAU/9+t*.25,r=W*(.26+.03*Math.sin(t*2+j));c.save();c.translate(CX+Math.cos(a)*r,H*.55+Math.sin(a)*r);c.rotate(a);strip(c,[[-8,-14],[8,-14],[8,14],[-8,14]],PAL.fills[j%5],170+j);c.restore();}ball(c,CX,H*.85,W*.06,t*.5);}
function puppetSheet(c){stock(c);[.6,1,1.8].forEach((s,j)=>ball(c,W*(.17+j*.3),CY,W*.075*s));}
const SHOTS=[miss,pressure,thoughts,memory,breath,reset,attention,angle,touch,connect,tools,ending];
const NAMES=['miss','pressure','thoughts','memory','breath','reset','attention','angle','touch','connect','tools','sign'];
// Shared camera moves between two fully animated mural compositions.
const OUTGOING=layer(),INCOMING=layer();

const CONCEPTS=[['MENTAL','TOUGHNESS'],['FEEL IT'],['THOUGHTS','AREN’T FACTS'],['ONE MISS','ISN’T YOU'],['BREATHE'],['RESET'],['LOOK UP'],['FIND SPACE'],['NEXT ACTION'],['ASK FOR HELP'],['NOTICE · BREATHE','CHOOSE'],['KEEP GROWING']];
function concept(c,i,t){
 const lines=CONCEPTS[i],u=sm(0,.28,t),scale=.88+.12*u;
 c.save();c.translate(CX,H*.22);c.scale(scale,scale);
 c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 const size=W*(lines.some(x=>x.length>14)?.055:lines.some(x=>x.length>10)?.069:.086);
 c.rotate(-.035);c.font=`${size}px "Story Brush", sans-serif`;
 lines.forEach((label,j)=>{const y=(j-(lines.length-1)/2)*size*1.05;c.lineWidth=size*.025;c.strokeStyle=PAL.ink;c.strokeText(label,1,y+2);c.fillStyle=PAL.paper;c.fillText(label,0,y);});
 stroke(c,[[-W*.16,lines.length*size*.54],[W*.15,lines.length*size*.54-6]],PAL.fills[1],6);c.restore();
}
function drawShot(c,i,t){
 shotIndex=i;shotTime=t;usePalette(INK_PALETTE);SHOTS[i](c,t);
 const actors=[ [.2,.65,410],[.55,.64,350],[.73,.66,295],[.84,.8,730],[.24,.7,290],[.2,.76,530],[.18,.8,610],[.76,.7,430],[.82,.69,450],[.2,.64,470],[.84,.81,760],[.5,.61,350] ];
 const [x,y,scale]=actors[i];person(c,W*x,H*y,W/scale,t,i<3);
 if(i===9){c.save();c.translate(W*.8,H*.53);c.rotate(Math.sin(t)*.08);sprite(c,MURAL,MOTIFS.stripes,-W*.07,-H*.06,W*.14,H*.12);c.restore();}
 concept(c,i,t);
}
const MORPH_ANCHORS=[[.83,.35],[.48,.57],[.28,.53],[.52,.49],[.76,.57],[.5,.56],[.56,.53],[.45,.43],[.67,.55],[.8,.53],[.5,.55]];
// Each connector follows the lesson, never a translated rectangular panel.
const CONNECTORS=['ball','tear','untangle','card','breath','spark','blink','ribbon','bounce','bloom','sunburst'];
function joinedShot(c,i,t){
 const lead=i?.65:0;
 if(i===SHOTS.length-1||t<1.65){drawShot(c,i,t+lead);return;}
 const raw=clamp((t-1.65)/.85,0,1),kind=CONNECTORS[i];
 const u=kind==='tear'?sm(.23,1,raw,easeIO):easeIO(raw);
 const before=u<.5,local=before?u*2:(u-.5)*2,anchor=MORPH_ANCHORS[i],next=MORPH_ANCHORS[(i+1)%MORPH_ANCHORS.length];
 const source=before?OUTGOING:INCOMING;
 drawShot(source.getContext('2d'),before?i:i+1,before?t+lead:local*.65);
 resetT(c);c.save();const zoom=before?1+local*.48:1+(1-local)*.48;
 const ax=(before?anchor:next)[0]*W,ay=(before?anchor:next)[1]*H;
 c.translate(CX,CY);c.scale(zoom,zoom);c.translate(-lerp(CX,ax,(zoom-1)*.8),-lerp(CY,ay,(zoom-1)*.8));c.drawImage(source,0,0,W,H);c.restore();
 const colors=['#006b45','#0056ff','#ff81d6','#ffbe08','#0056ff','#ffbe08','#006b45','#ff81d6','#ff4927','#006b45','#ffbe08'];
 const color=colors[i],growth=Math.pow(Math.sin(Math.PI*u),3),r=Math.hypot(W,H)*1.15*growth;
 let cx=lerp(anchor[0]*W,next[0]*W,u),cy=lerp(anchor[1]*H,next[1]*H,u);
 if(kind==='tear'){
  const fall=sm(0,.23,raw);cx=W*.57;cy=lerp(H*.44,H*.79,fall);
  if(raw<.26){const d=W*.018*(1-.5*sm(.23,.26,raw));const drop=new Path2D();drop.moveTo(cx,cy-d*2);drop.bezierCurveTo(cx+d*1.8,cy,cx+d,cy+d,cx,cy+d);drop.bezierCurveTo(cx-d,cy+d,cx-d*1.8,cy,cx,cy-d*2);c.fillStyle=color;c.fill(drop);}
  // Ripples spread from the impact; their shared blue surface becomes the next world.
  if(raw>.23&&u<.5){for(let n=1;n<=3;n++){c.strokeStyle=n%2?PAL.paper:color;c.lineWidth=5;c.beginPath();c.ellipse(cx,cy,r*(1+n*.15),r*(.48+n*.08),0,0,TAU);c.stroke();}}
 }
 const shape=new Path2D();
 if(kind==='blink'){
  const lid=H*growth*.7;shape.rect(0,0,W,lid);shape.rect(0,H-lid,W,lid);
 }else{
  for(let j=0;j<=160;j++){const a=j/160*TAU;let contour=1,xx=1,yy=1;
   if(kind==='ball'||kind==='bounce'){contour=1+.025*Math.cos(a*5);cy+=j===0?Math.sin(raw*TAU)*H*.025:0;}
   if(kind==='tear'){yy=.68+.32*Math.sin(Math.PI*u);contour=1+.025*Math.sin(a*8-raw*8);}
   if(kind==='untangle'){contour=1+.22*Math.sin(a*3+u*TAU);}
   if(kind==='card'){contour=1/Math.max(Math.abs(Math.cos(a+u*.4)),Math.abs(Math.sin(a+u*.4)));}
   if(kind==='breath'){contour=1+.13*Math.cos(a*3);xx=1.12;}
   if(kind==='spark'||kind==='sunburst'){contour=1+.23*Math.cos(a*(kind==='spark'?6:9)+u*TAU);}
   if(kind==='ribbon'){contour=1+.2*Math.sin(a*2+u*Math.PI);xx=1.3;yy=.8;}
   if(kind==='bloom'){contour=1+.17*Math.cos(a*5-u*Math.PI);}
   const px=cx+Math.cos(a)*r*contour*xx,py=cy+Math.sin(a)*r*contour*yy;j?shape.lineTo(px,py):shape.moveTo(px,py);
  }shape.closePath();
 }
 c.fillStyle=color;c.fill(shape);c.save();c.clip(shape);
 grain(c,shape,[0,0,W,H],6500,PAL.paper,.1,900+i,1.4);grain(c,shape,[0,0,W,H],4500,PAL.ink,.08,950+i,1);c.restore();
}
const TIMELINE=SHOTS.map((fn,i)=>({name:NAMES[i],dur:5,fn:(c,t)=>joinedShot(c,i,t/2)}));
if(QUERY.has('sheets'))TIMELINE.unshift({name:'stylesheet',dur:1,fn:styleSheet},{name:'palette',dur:.5,fn:paletteSheet},{name:'puppets',dur:1,fn:puppetSheet});
function score(ac,t0,dest){const master=ac.createGain();master.gain.value=.32;master.connect(dest);const r=rng(7);let acc=0;for(const s of TIMELINE){note(ac,master,pentHz(0,0),t0,acc,1,'sine',.16);for(let t=acc;t<acc+s.dur;t+=.5)note(ac,master,pentHz(1,r()*5|0),t0,t,.7,'triangle',.10);if(s.name.endsWith('sign'))note(ac,master,pentHz(1,2),t0,acc,2.4,'sine',.13);acc+=s.dur;}}
async function startFilm(){
 const font=new FontFace('Story Brush','url(assets/Knewave-Regular.ttf)');
 await Promise.all([LUNA.decode(),MURAL.decode(),FIELD.decode(),font.load()]);document.fonts.add(font);
 defineFilm({palette:INK_PALETTE,timeline:TIMELINE,score,format:{ar:'1:1',width:720}});
}
startFilm().catch(error=>{console.error(error);});
