// Futbol Tennis upgrade 2 (Oct 26 2026): the dynamic court camera and the centred, fading coaching tip.
// Serve = a raised, tilted view of the whole court; rally = frames you + ball + bounce spot, pushes in as the ball
// arrives, pulls back between points; it never shows dead floor past a baseline, pans/zooms at capped rates, and
// reduced motion keeps a fixed shot. Portrait phones get a bigger court than before.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const root=path.resolve(__dirname,'..'),cache=new Map();
function resolve(from,id){if(id.startsWith('@/'))return path.join(root,id.slice(2))+'.ts';return path.resolve(path.dirname(from),id)+'.ts';}
function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,Array,Object,Float32Array,console,
  require:id=>id==='three'?T:id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});return m.exports;}
const cam=load('lib/arcade/tennisCamera.ts'),t=load('lib/games/soccerTennis.ts');
const W=390,H=844,court={w:10,l:16};
function rig(w=W,h=H,mobile=true,reduced=false){const camera=new T.PerspectiveCamera(38,w/h,.1,180),c=cam.createTennisCamera(camera,mobile,reduced);c.fit(w,h);return {camera,c};}
const ndc=(camera,x,z,y=0)=>new T.Vector3(x,y,z).project(camera);
const px=(camera,x,z,h=H,y=0)=>(1-ndc(camera,x,z,y).y)*h/2;
function state(phase='serve'){const s=t.createTennis(47,1);s.phase=phase;return s;}

// 1. Layouts: portrait phones frame the court tighter than the old 11.05 m fit and push in further on rallies.
const L=cam.tennisCameraLayout(W,H,true);assert(L.width<11.05&&L.width>=court.w,'portrait phones: less dead margin around the 10 m court');
assert(L.serveTilt>L.rallyTilt,'the serve view is more tilted');assert(L.zoom>1.2&&L.zoom<=1.35,'a capped push-in');
const desk=cam.tennisCameraLayout(1440,900,false),tab=cam.tennisCameraLayout(820,1180,true),land=cam.tennisCameraLayout(844,390,true);
assert(desk.zoom<L.zoom&&tab.zoom<L.zoom&&land.zoom<L.zoom,'bigger screens push in less');

// 2. Serve: the whole court (all four corners, both service boxes) is on screen between the HUD and the controls.
let {camera,c}=rig();let s=state('serve');c.update(0,s,null,true);
for(const [x,z] of [[-5,-8],[5,-8],[-5,8],[5,8],[0,-4.6],[0,4.6]]){const p=ndc(camera,x,z);assert(Math.abs(p.x)<=1&&p.y<=1&&p.y>=-1,`serve view shows ${x},${z}`);}
assert(px(camera,0,-8)>=L.top-2,'far baseline below the HUD');assert(px(camera,0,8)<=H-L.bottom+2,'near baseline above the controls');
assert.equal(c.state().blend,1,'serve = the serve view');const serveSpan=px(camera,0,8)-px(camera,0,-8);
// The serve view is tilted: the far baseline is drawn narrower than the near one (perspective from behind you).
const farW=Math.abs(ndc(camera,5,-8).x-ndc(camera,-5,-8).x),nearW=Math.abs(ndc(camera,5,8).x-ndc(camera,-5,8).x);assert(farW<nearW*.8,'raised, tilted serve view');

// 3. Rally: eases out of the serve view (no cut), then frames the incoming ball and pushes in as it arrives.
s=state('rally');s.rally=2;Object.assign(s.you,{x:0,y:5.3});Object.assign(s.ball,{x:0,y:-6,z:.5,vx:0,vy:8,vz:1,last:'rival',crossed:false,bounces:0});
c.update(1/60,s,{x:0,y:4.6});assert(c.state().blend>.9&&c.state().blend<1,'eases out of the serve view');
for(let i=0;i<120;i++)c.update(1/60,s,{x:0,y:4.6});const far=c.state();assert(far.blend===0,'settles into the rally view');
assert(far.zoom<1.08,'ball far away: wide shot');
Object.assign(s.ball,{x:.6,y:4,z:.6});for(let i=0;i<180;i++)c.update(1/60,s,{x:.5,y:4.8});const near=c.state();
assert(near.zoom>1.25,'ball arriving: pushed in');assert(near.z>0,'looking at your half');
// Bigger on screen than the serve view, and no dead floor below the near baseline.
const youTop=px(camera,0,5.3,H,1.6),youFeet=px(camera,0,5.3);assert(youFeet-youTop>0,'you are drawn');const edge=L.length/2;assert(px(camera,0,edge)>=H-L.bottom-2,'the frame edge 0.5 m past the near baseline sits at/below the controls band (no dead floor)');
assert(px(camera,0,-edge)<=L.top+2,'and past the far baseline at/above the HUD band');
assert(youFeet<H-150,'you stay above the joystick and buttons');assert(Math.abs(ndc(camera,s.ball.x,s.ball.y,s.ball.z).x)<.95,'the ball stays on screen');
const rallyScale=(px(camera,0,6)-px(camera,0,4))/2,serveScale=serveSpan/16;assert(rallyScale>serveScale*1.3,`rally court reads bigger (${rallyScale.toFixed(1)} vs ${serveScale.toFixed(1)} px/m)`);

// 4. Smooth: a sudden jump in the framing moves the camera at capped rates, never a whip-pan or a zoom snap.
const before=c.state();Object.assign(s.ball,{x:-4,y:-7,last:'you'});c.update(1/60,s,null);const after=c.state();
assert(Math.hypot(after.x-before.x,after.z-before.z)<=6/60+1e-6,'pan speed capped at 6 m/s');assert(Math.abs(after.zoom-before.zoom)<=.5/60+1e-6,'zoom rate capped');
// Between points: back to the wide shot; next serve: back to the serve view.
s.phase='point';for(let i=0;i<240;i++)c.update(1/60,s,null);assert(Math.abs(c.state().zoom-1)<.01&&c.state().blend===0,'wide shot between points');
s.phase='serve';for(let i=0;i<240;i++)c.update(1/60,s,null);assert.equal(c.state().blend,1,'eases back to the serve view');assert.equal(c.moving(),false,'settles so the frame loop can sleep');

// 5. Reduced motion: fixed rally shot (no pan / push-in) and a straight cut to and from the serve view.
({camera,c}=rig(W,H,true,true));s=state('rally');Object.assign(s.you,{x:3,y:5});Object.assign(s.ball,{x:3,y:4.5,z:.5,last:'rival'});
c.update(0,s,null,true);for(let i=0;i<60;i++)c.update(1/60,s,{x:3,y:4.6});assert.equal(c.state().zoom,1);assert(Math.abs(c.state().x)<1e-6,'no pans with reduced motion');
s.phase='serve';c.update(1/60,s,null);assert.equal(c.state().blend,1,'reduced motion cuts to the serve view');

// 6. Every screen class solves (desktop, tablet, landscape phone) and keeps both baselines on screen at serve.
for(const [w,h,mobile] of [[1440,900,false],[820,1180,true],[844,390,true]]){const r=rig(w,h,mobile);const v=state('serve');r.c.update(0,v,null,true);for(const z of [-8,8]){const p=ndc(r.camera,0,z);assert(Math.abs(p.y)<=1,`${w}x${h} serve shows baseline ${z}`);}}

// 7. Wiring + the coaching tip: centred, faded, never in a corner; the stage camera follows the dynamic camera.
const games=fs.readFileSync(path.join(root,'lib/arcade/arcadeGames.ts'),'utf8'),ui=fs.readFileSync(path.join(root,'components/games/ArcadeGame3D.tsx'),'utf8'),css=fs.readFileSync(path.join(root,'components/games/ArcadeGame3D.module.css'),'utf8');
assert(/tennisCam\.update\(dt,tennis/.test(games)&&/tennisCam\.fit\(/.test(games),'the tennis stage camera is driven per frame and solved on resize');
assert(/tennisCam\?\.moving\(\)/.test(games),'the frame loop stays awake while the camera eases');
assert(/data-tip=\{kind==='tennis'\|\|undefined\}/.test(ui)&&/key=\{kind==='tennis'\?hud\.message:undefined\}/.test(ui),'each new tip remounts (restarts its fade)');
const tip=css.match(/\.game\[data-arcade-kind=tennis\] \.message\[data-tip\]\{[^}]*\}/)[0];
assert(/left:50%/.test(tip)&&/translateX\(-50%\)/.test(tip)&&/text-align:center/.test(tip),'tip centred horizontally');assert(/animation:tennisTipFade/.test(tip),'tip fades');
assert(/@keyframes tennisTipFade\{.*100%\{opacity:0/.test(css),'fades out completely');
console.log('PASS tennis camera: tighter portrait frame, tilted full-court serve view, rally push-in framing without dead floor, capped pan/zoom, wide between points, reduced motion fixed, all screen classes, centred fading tip');
