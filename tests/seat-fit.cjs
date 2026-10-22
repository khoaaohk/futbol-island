// Bench seat fit (Oct 22 2026, user: "character shouldn't be sitting through the bench"): a seated townsperson's body (bean shell),
// hips, thighs, shins and hands stay OUTSIDE the island bench's boxes (seat board, backrest, legs) for every build, several height
// profiles (child .74 to grown-up 1.0, leg scale .96 to 1.06) and all four bench yaws, while the pose still touches the bench:
// bottom on the seat top, back a hair in front of the backrest face, thighs near-horizontal, torso upright, hands on the thighs.
// Uses the real rig (createPlayer + the trick pose the island hands it), so the numbers are what the player sees.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript'),T=require('three');
const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
 loaded.set(file,m.exports);return m.exports;}
const CS=load('lib/graphics/characterStyle.ts'),P=load('lib/graphics/player.ts'),B=load('lib/graphics/beanSkin.ts'),G=load('lib/graphics/beanGearFit.ts'),S=load('lib/graphics/npcSeatPose.ts');
const {DEFAULT_CUSTOMIZATION}=load('lib/town/customization.ts'),{AGE_PROFILES}=load('lib/town/townsfolkCast.ts');
const VERBOSE=process.env.SEAT_VERBOSE;// '1' prints one line per build/scale, 'all' every case (the first failure still stops the run)
const {BENCH}=S;
// Bench boxes in the bench frame: [x0,x1,y0,y1,z0,z1] (world.ts benchParts: seat 2 x .12 x .65 at y .58; back 2 x .45 x .09 at y .91, z -.25; two legs .13 x .5 x .5).
const BOXES=[
 ['seat',-BENCH.halfWidth,BENCH.halfWidth,BENCH.seatBottom,BENCH.seatTop,-BENCH.halfDepth,BENCH.halfDepth],
 ['back',-BENCH.halfWidth,BENCH.halfWidth,BENCH.backBottom,BENCH.backTop,BENCH.backBehind,BENCH.backFace],
 ['legL',-.75-.065,-.75+.065,.02,.52,-.25,.25],['legR',.75-.065,.75+.065,.02,.52,-.25,.25],
];
/** Penetration depth of a sphere (radius r) into a box: > 0 when it sinks in. */
function sink(b,x,y,z,r){const dx=Math.max(b[1]<x?x-b[2]*0-b[2]:0,0);void dx;
 const cx=Math.min(Math.max(x,b[1]),b[2]),cy=Math.min(Math.max(y,b[3]),b[4]),cz=Math.min(Math.max(z,b[5]),b[6]);
 const d=Math.hypot(x-cx,y-cy,z-cz);if(d>0)return r-d;
 return r+Math.min(x-b[1],b[2]-x,y-b[3],b[4]-y,z-b[5],b[6]-z);}
const BODIES=['regular','tall','short','wide'],SCALES=[.74,.88,.97,1,1.08],LEGS=[.96,1,1.06],YAWS=[0,Math.PI/2,Math.PI,-Math.PI/2];
const {npcDress}=load('lib/town/beanLooks.ts');
// A rig dressed the way islandNpcs dresses a townsperson (npcDress -> setBeanLook), with the bean build forced and the height profile set.
function seated(body,scale,legs){
 CS.setCharacterStyle('bean');const rig=P.createPlayer('seat-'+body,'home',true);CS.setCharacterStyle(undefined);
 rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:'male'});const dress=npcDress({id:'seat-'+body,character:'male',face:'warm',clothing:'classic'});dress.look.build=body;rig.setBeanLook(dress.look,dress.outfit);
 rig.setProfile({...AGE_PROFILES.elder,height:scale,legs,build:1});
 return rig;// (islandNpcs reads beanShapeOf right after this too)
}
function measure(rig,body,scale,yaw,useShape=true){
 const shape=G.beanShapeOf(rig.root);assert(shape,'the rig reports its bean shape');assert(Math.abs(shape.H-B.BEAN_SHAPES[body].H)<1e-4&&Math.abs(shape.W-B.BEAN_SHAPES[body].W)<1e-4,'the rig wears the forced build');
 const pose=S.npcSeatPose('bench',scale,useShape?shape:undefined);pose.w=1;
 const px=Math.sin(yaw)*BENCH.rootZ,pz=Math.cos(yaw)*BENCH.rootZ;
 for(let i=0;i<4;i++)rig.update(px,pz,.1,i*.1,true,{trick:pose,facing:yaw,travelMode:'walk'});
 rig.root.updateMatrixWorld(true);
 const c=Math.cos(yaw),s=Math.sin(yaw),inv=(v)=>new T.Vector3(v.x*c-v.z*s,v.y,v.x*s+v.z*c);// world -> bench frame (bench front = +z at yaw 0)
 const at=n=>{const o=rig.root.getObjectByName(n);assert(o,n+' exists');return inv(o.getWorldPosition(new T.Vector3()));};
 const facing=new T.Vector3(0,0,1).applyQuaternion(rig.root.getWorldQuaternion(new T.Quaternion()));
 const out={pose,hits:[],facingDot:facing.x*Math.sin(yaw)+facing.z*Math.cos(yaw)};
 const test=(label,x,y,z,r)=>{for(const b of BOXES){const d=sink(b,x,y,z,r);if(d>.004)out.hits.push(`${label} sinks ${(d*100).toFixed(1)} cm into ${b[0]}`);}};
 const limb=(label,a,b,ra,rb,n=10)=>{for(let i=0;i<=n;i++){const t=i/n;test(label,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t,ra+(rb-ra)*t);}};
 const hands={};
 for(const side of ['left','right']){
  const hip=at(side+'-hip'),knee=at(side+'-knee'),ankle=at(side+'-ankle'),sh=at(side+'-shoulder'),el=at(side+'-elbow'),hand=at(side+'-hand');
  limb(side+' thigh',hip,knee,.083*scale,.065*scale);limb(side+' shin',knee,ankle,.067*scale,.045*scale);limb(side+' arm',sh,el,.065*scale,.051*scale);limb(side+' forearm',el,hand,.051*scale,.045*scale);
  test(side+' hand',hand.x,hand.y,hand.z,.05*scale);hands[side]={hand,knee,hip,ankle};
 }
 // The bean shell (torso-local points through the torso's world matrix).
 const torso=rig.root.getObjectByName('armor-torso'),v=new T.Vector3();let low=Infinity,back=0;
 for(let i=0;i<=40;i++)for(let j=0;j<48;j++){B.beanPoint(shape,i/40,j/48*Math.PI*2,v);v.applyMatrix4(torso.matrixWorld);const w=inv(v);
  test('body',w.x,w.y,w.z,0);if(Math.abs(w.x)<.14)low=Math.min(low,w.y);if(w.y>BENCH.seatTop&&w.y<BENCH.backTop)back=Math.min(back,w.z);}
 out.low=low;out.back=back;out.hands=hands;out.torsoTilt=Math.abs(Math.atan2(...(()=>{const u=inv(new T.Vector3(0,1,0).transformDirection(torso.matrixWorld).add(new T.Vector3(0,0,0)));return [Math.hypot(0,u.z),u.y];})()));
 return out;
}
let worstLow=0,worstBack=-9,runs=0;
for(const body of BODIES)for(const scale of SCALES)for(const legs of LEGS){
 const rig=seated(body,scale,legs);
 for(const yaw of YAWS){
  const m=measure(rig,body,scale,yaw);runs++;
  const tag=`${body} scale ${scale} legs ${legs} yaw ${(yaw*180/Math.PI)|0}`;
  if(VERBOSE==='all'&&yaw===0)console.log(tag,'back',m.back.toFixed(3),'low',m.low.toFixed(3),'hits',m.hits.length,m.hits[0]||'');
  if(VERBOSE==='all')continue;
  assert.deepEqual(m.hits,[],`${tag}: clips the bench:\n  ${m.hits.slice(0,6).join('\n  ')}`);
  assert(m.facingDot>.98,`${tag}: faces the open side of the bench (${m.facingDot.toFixed(2)})`);
  assert(m.low<=BENCH.seatTop+.025&&m.low>=BENCH.seatTop-.004,`${tag}: bottom rests on the seat top (${m.low.toFixed(3)})`);
  assert(m.back>=BENCH.backFace-.004&&m.back<=BENCH.backFace+(scale<.9?.16:.05),`${tag}: back against, not through, the backrest face (${m.back.toFixed(3)} vs ${BENCH.backFace})`);
  for(const side of ['left','right']){const h=m.hands[side];
   assert(h.knee.z>BENCH.halfDepth-.1&&h.knee.y>BENCH.seatTop-.1,`${tag}: ${side} knee reaches the front edge (${h.knee.z.toFixed(2)}, ${h.knee.y.toFixed(2)})`);
   assert(h.knee.y<h.hip.y+.01&&h.hip.y-h.knee.y<.2,`${tag}: ${side} thigh lies near-horizontal`);
   assert(h.ankle.y<h.knee.y-.15*scale,`${tag}: ${side} shin hangs below the knee`);
   const lap=Math.hypot(h.hand.x-(h.hip.x+h.knee.x)/2,h.hand.y-(h.hip.y+h.knee.y)/2-.09*scale,h.hand.z-(h.hip.z+h.knee.z)/2);
   assert(lap<.16*Math.max(.9,scale),`${tag}: ${side} hand rests on the thigh (${lap.toFixed(2)} m away)`);}
  worstLow=Math.max(worstLow,m.low-BENCH.seatTop);worstBack=Math.max(worstBack,m.back-BENCH.backFace);
  if(VERBOSE&&legs===1&&yaw===0)console.log(tag,'low',m.low.toFixed(3),'back',m.back.toFixed(3),'knee z',m.hands.left.knee.z.toFixed(2),'ankle y',m.hands.left.ankle.y.toFixed(2),'hand',m.hands.left.hand.z.toFixed(2),m.hands.left.hand.y.toFixed(2));
 }
}
// Without a body argument (the ball-cannon seat) the default build still clears the board and backrest.
for(const body of BODIES)for(const scale of [.88,1]){const m=measure(seated(body,scale,1),body,scale,0,false);assert.deepEqual(m.hits,[],`shapeless bench pose (${body}, ${scale}) clips: `+m.hits.slice(0,4).join('; '));}
// The cast's benches: every townsperson posed 'bench' stands within 6 cm of a bench centre and faces away from its backrest (yaw 0 = open side +z, PI = the pier's mirrored bench).
const cast=load('lib/town/townsfolkCast.ts');
const benchFolk=cast.TOWNSFOLK_CAST.filter(n=>n.pose==='bench');assert(benchFolk.length>=15,'bench sitters exist ('+benchFolk.length+')');
for(const n of benchFolk)assert(n.workYaw===0||Math.abs(n.workYaw-Math.PI)<1e-9,n.id+' sits square to its bench (yaw 0 or PI)');
console.log(`seat-fit: ${runs} rig poses (4 builds x 5 scales x 3 leg scales x 4 yaws) clear the bench; worst bottom gap ${(worstLow*100).toFixed(1)} cm, worst back gap ${(worstBack*100).toFixed(1)} cm`);
