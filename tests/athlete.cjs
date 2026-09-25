// Athlete library (lib/plays/riso/athlete.ts): poses are finite, blends hit their endpoints exactly, bones stay rigid through every
// cycle and blend, joint limits hold, keyed moves are continuous (no pops), and the key football mechanics are really in the poses.
// Run: node tests/athlete.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.join(__dirname,'..');
const load=(file,deps)=>{const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const m={exports:{}};new Function('module','exports','require',code)(m,m.exports,n=>{if(!(n in deps))throw new Error(`unexpected import ${n} in ${file}`);return deps[n];});return m.exports;};
const motion=load('lib/paths/riso/motion.ts',{});
const shapes=load('lib/paths/riso/shapes.ts',{'./motion':motion});
const A=load('lib/plays/riso/athlete.ts',{'../../paths/riso/motion':motion,'../../paths/riso/shapes':shapes});
const {POSE_KEYS,LIMITS,BONES,JOINTS}=A,DEG=Math.PI/180,LINEAR=new Set(['dx','dz','air','lHand','rHand','squash']);
const range=(n,a=0,b=1)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

// every generator, both sides, sampled densely
const GENS={
 sprint:t=>A.runCycle(t,{speed:1}),jog:t=>A.runCycle(t,{speed:0}),dribbleR:t=>A.dribble(t),dribbleL:t=>A.dribble(t,{foot:'l'}),
 strikeR:t=>A.strike(t),strikeL:t=>A.strike(t,{foot:'l',power:.6}),volleyR:t=>A.volley(t),volleyL:t=>A.volley(t,{foot:'l',height:1}),header:t=>A.header(t),
 keeperSet:t=>A.keeperSet(t),diveR:t=>A.keeperDive(t),diveL:t=>A.keeperDive(t,{side:'l',height:1}),tip:t=>A.keeperTip(t),tipL:t=>A.keeperTip(t,{hand:'l'}),scoop:t=>A.keeperScoop(t),
 slideR:t=>A.slideTackle(t),slideL:t=>A.slideTackle(t,{foot:'l'}),backpedal:t=>A.backpedal(t),lungeR:t=>A.lunge(t),lungeL:t=>A.lunge(t,{side:'l'}),
 celebrate:t=>A.celebrate(t),kneeSlide:t=>A.celebrate(t,{kind:'kneeSlide'}),airplane:t=>A.celebrate(t,{kind:'run'}),rabonaR:t=>A.rabona(t),rabonaL:t=>A.rabona(t,{foot:'l'}),stand:()=>A.stand(),
};
const ref=A.solve(A.stand()),refLen=BONES.map(([a,b])=>dist(ref[a],ref[b]));
const inLimits=(p,name,t)=>{for(const k of POSE_KEYS){const[lo,hi]=LIMITS[k],s=LINEAR.has(k)?1:DEG;assert.ok(p[k]>=lo*s-1e-9&&p[k]<=hi*s+1e-9,`${name} t=${t}: ${k}=${(p[k]/s).toFixed(2)} outside [${lo}, ${hi}]`);}};
for(const [name,gen] of Object.entries(GENS)){
 for(const t of range(81)){
  const p=gen(t);assert.deepEqual(Object.keys(p).sort(),[...POSE_KEYS].sort(),`${name}: pose has exactly the pose channels`);
  for(const k of POSE_KEYS)assert.ok(Number.isFinite(p[k]),`${name} t=${t}: ${k} is finite`);
  inLimits(p,name,t);
  const sk=A.solve(p,{},{x:3,z:-2,yaw:.7});
  for(const j of JOINTS)assert.ok(sk[j].every(Number.isFinite),`${name} t=${t}: joint ${j} is finite`);
  BONES.forEach(([a,b],i)=>assert.ok(Math.abs(dist(sk[a],sk[b])-refLen[i])<1e-9,`${name} t=${t}: bone ${a}-${b} keeps its length`));
 }
}
console.log(`Athlete poses: ${Object.keys(GENS).length} generators × 81 samples finite, inside joint limits, bones rigid.`);

// bone lengths across one full sprint stride and through blends, with a build and a scale
for(const ph of range(64,0,63/64)){const sk=A.solve(A.runCycle(ph),{height:1.8});BONES.forEach(([a,b],i)=>assert.ok(Math.abs(dist(sk[a],sk[b])-refLen[i])<1e-9,`sprint phase ${ph}: ${a}-${b} constant`));}
const tall=A.solve(A.stand(),{height:1.9},{},1.1),tallLen=BONES.map(([a,b])=>dist(tall[a],tall[b]));
for(const u of range(21)){const sk=A.solve(A.blendPose(A.strike(.4),A.keeperDive(.55),u),{height:1.9},{},1.1);BONES.forEach(([a,b],i)=>assert.ok(Math.abs(dist(sk[a],sk[b])-tallLen[i])<1e-9,`blend u=${u}: ${a}-${b} rigid`));}
BONES.forEach(([a,b],i)=>assert.ok(Math.abs(tallLen[i]-refLen[i]*1.9/1.8*1.1)<1e-9,`build/scale scale bone ${a}-${b} uniformly`));
console.log('Athlete bones: constant over a 64-phase sprint cycle, through blends, and uniformly scaled by build and scale.');

// blends: endpoints exact, midpoints between, mirror is an involution
const pairs=[[A.runCycle(.2),A.strike(.52)],[A.keeperDive(.55,{side:'l'}),A.header(.42)],[A.rabona(.58),A.celebrate(.8,{kind:'kneeSlide'})]];
for(const [a,b] of pairs){
 const b0=A.blendPose(a,b,0),b1=A.blendPose(a,b,1);
 for(const k of POSE_KEYS){assert.equal(b0[k],a[k],`blend t=0 equals a exactly (${k})`);assert.equal(b1[k],b[k],`blend t=1 equals b exactly (${k})`);
  assert.equal(A.blendPose(a,b,-.5)[k],a[k]);assert.equal(A.blendPose(a,b,1.5)[k],b[k]);
  const m=A.blendPose(a,b,.5)[k];assert.ok(m>=Math.min(a[k],b[k])-1e-12&&m<=Math.max(a[k],b[k])+1e-12,`blend midpoint lies between (${k})`);}
 const mm=A.mirrorPose(A.mirrorPose(a));for(const k of POSE_KEYS)assert.equal(mm[k],a[k],`mirror twice is identity (${k})`);
}
console.log('Athlete blends: t=0 and t=1 hit the endpoints exactly, clamp outside [0,1], mirror is an involution.');

// continuity: keyed moves have no pops (bounded change per 1/200 of the move), and the ends hit the first/last keys
const KEYED=['strikeR','volleyR','header','diveR','tip','scoop','slideR','lungeR','kneeSlide','rabonaR','celebrate'];
for(const name of KEYED){const gen=GENS[name];let prev=gen(0),worst=0,wk='';
 for(const t of range(201).slice(1)){const p=gen(t);for(const k of POSE_KEYS){const d=Math.abs(p[k]-prev[k])/(LINEAR.has(k)?1:DEG);if(d>worst){worst=d;wk=k;}}prev=p;}
 assert.ok(worst<9,`${name}: no pops — largest change per 1/200 of the move is ${worst.toFixed(2)} (${wk})`);}
for(const name of ['sprint','jog','backpedal','airplane']){const gen=GENS[name],a=gen(0),b=gen(1);for(const k of POSE_KEYS)assert.ok(Math.abs(a[k]-b[k])<1e-6,`${name} loops seamlessly (${k})`);}
{const keys=[[0,A.posed({lKnee:10})],[.5,A.posed({lKnee:90})],[1,A.posed({lKnee:20})]];
 for(const k of POSE_KEYS){assert.ok(Math.abs(A.keyPoses(0,keys)[k]-keys[0][1][k])<1e-12);assert.ok(Math.abs(A.keyPoses(1,keys)[k]-keys[2][1][k])<1e-12);}
 const vals=range(101).map(t=>A.keyPoses(t,keys,{}).lKnee/DEG);assert.ok(Math.max(...vals)<=90+1e-9&&Math.min(...vals)>=10-1e-9,'keyPoses never overshoots its keys');}
console.log('Athlete motion: keyed moves are continuous (no pops), cycles loop seamlessly, key splines hit their ends without overshoot.');

// the football is really in the poses
const R=[];
{let hip=-99,knee=0,air=0,elbowMin=180,heelGlute=9;for(const ph of range(96,0,95/96)){const p=A.runCycle(ph,{speed:1}),sk=A.solve(p);hip=Math.max(hip,p.rHipF/DEG);knee=Math.max(knee,p.rKnee/DEG);air=Math.max(air,p.air);elbowMin=Math.min(elbowMin,p.rElb/DEG);heelGlute=Math.min(heelGlute,dist(sk.rHeel,sk.rHip));}
 assert.ok(hip>=80,`sprint: high knee drive (hip flexion ${hip.toFixed(0)}°)`);assert.ok(knee>=135,`sprint: heel kicks toward the glute (knee ${knee.toFixed(0)}°)`);
 assert.ok(heelGlute<.33,`sprint: heel comes close to the hip (${heelGlute.toFixed(2)} m)`);assert.ok(air>.05,`sprint: a flight phase (${air.toFixed(3)} m)`);assert.ok(elbowMin>=55,'sprint: arms swing with bent elbows');
 const jog=Math.max(...range(48).map(ph=>A.runCycle(ph,{speed:0}).rHipF/DEG));assert.ok(jog<hip-25,'jog lifts the knee far less than a sprint');R.push('sprint mechanics');}
{const sk=A.solve(A.stand()),low=Math.min(sk.lToe[1]-.02,sk.rToe[1]-.02,sk.lHeel[1]-.03,sk.rHeel[1]-.03);assert.ok(Math.abs(low)<1e-9,'standing: the feet rest on the ground (grounded automatically)');
 assert.ok(Math.abs(sk.lHeel[1]-sk.lToe[1])<.04,'standing: the foot is flat-ish, weight on the balls');
 const air=A.solve(A.header(.42));assert.ok(Math.min(air.lToe[1],air.rToe[1])>.4,'jumping: air lifts the lowest point off the ground');}
{const c=A.strike(A.STRIKE_CONTACT),sk=A.solve(c),back=A.strike(.4),f=A.strike(.7);assert.ok(back.rKnee/DEG>=120&&back.rHipF<0,'strike: backswing cocks the knee behind');
 assert.ok(sk.rToe[1]<.2,'strike: the kicking boot meets a ground ball at contact');assert.ok(f.rHipF/DEG>=95,'strike: big follow-through');
 assert.ok(Math.sign(back.twist)!==Math.sign(f.twist),'strike: shoulders counter-rotate against the hips');R.push('strike');}
{const v=A.volley(.5),sk=A.solve(v);assert.ok(v.rHipA/DEG>=50,'volley: kicking leg swings up and round');assert.ok(sk.rAn[1]>.55,'volley: the kicking foot is high');assert.ok(Math.abs(A.volley(0).yaw-A.volley(1).yaw)/DEG>60,'volley: swivels on the standing leg');R.push('volley');}
{const peak=A.header(.42),hit=A.header(.52);assert.ok(peak.air>.5,'header: jumps');assert.ok(peak.lean<0&&hit.lean>0,'header: arches back, then snaps forward');assert.ok(hit.neckP/DEG>30,'header: neck snap');R.push('header');}
{const d=A.keeperDive(.55,{height:1}),sk=A.solve(d);assert.ok(Math.abs(A.keeperDive(.55).roll)/DEG>=78,'dive: full horizontal extension');{const v=[sk.head[0]-sk.pelvis[0],sk.head[1]-sk.pelvis[1],sk.head[2]-sk.pelvis[2]];assert.ok(Math.abs(v[1])/Math.hypot(...v)<.5,'dive: the body is stretched out sideways, not upright');}assert.ok(d.lHand>.9&&d.rHand>.9,'dive: palms open and reaching');
 assert.ok(Math.abs(sk.lHa[2]-sk.lToe[2])>1.6,'dive: fingertips to toes span sideways');assert.ok(sk.lHa[1]>sk.lToe[1]+.3,'dive to the top corner: the hands reach higher than the feet');
 const low=A.solve(A.keeperDive(.55,{height:0}));assert.ok(Math.abs(low.lHa[1]-low.lToe[1])<.45&&low.head[1]<.9,'low dive: flat along the ground');const dl=A.solve(A.keeperDive(.55,{side:'l'}));assert.ok(dl.head[2]<-.5&&sk.head[2]>.5,'dive: left and right go opposite ways');
 const tip=A.solve(A.keeperTip(.62));assert.ok(tip.rHa[1]>2.44,`tip: the palm reaches over the 2.44 m crossbar (${tip.rHa[1].toFixed(2)} m)`);R.push('keeper');}
{const s=A.slideTackle(.6),sk=A.solve(s);assert.ok(sk.pelvis[1]<.4,'slide: the hips are on the ground');assert.ok(sk.rHeel[1]<.3&&sk.rToe[0]-sk.pelvis[0]>.6,'slide: lead leg long and low');R.push('slide');}
{const sk=A.solve(A.rabona(A.RABONA_CONTACT));assert.ok(sk.rKn[0]<sk.lKn[0]-.05,'rabona: the kicking knee passes BEHIND the standing knee');assert.ok(sk.rToe[2]<sk.lAn[2]-.1,'rabona: the kicking foot comes out on the far side of the standing foot');assert.ok(sk.rToe[1]<.2,'rabona: strikes a ground ball');R.push('rabona');}
{const k=A.celebrate(.9,{kind:'kneeSlide'}),sk=A.solve(k);assert.ok(sk.lKn[1]<.12&&sk.rKn[1]<.12,'knee slide: on the knees');assert.ok(sk.lHa[1]>sk.head[1],'knee slide: arms up');const a=A.solve(A.celebrate(.3));assert.ok(a.lHa[1]>a.head[1]+.3&&a.rHa[1]>a.head[1]+.3,'celebration: both arms up');R.push('celebrations');}
{const l=A.lunge(.6),sk=A.solve(l);assert.ok(l.lKnee/DEG>80,'lunge: deep bend on the standing leg');assert.ok(Math.hypot(sk.rAn[0]-sk.lAn[0],sk.rAn[2]-sk.lAn[2])>.7,'lunge: long jab of the lunging leg');R.push('lunge');}
{const toe=A.solve(A.dribble(A.touchPhase)).rToe,pel=A.solve(A.dribble(A.touchPhase)).pelvis;assert.ok(toe[0]-pel[0]>.25&&toe[1]<.2,'dribble: the touch foot reaches the ball ahead and low');R.push('dribble');}
console.log(`Athlete football: ${R.join(', ')} checked.`);

// cameras: the target lands on the centre; figureCam puts the ground point where asked and a 1.8 m body at the asked height
{const cam=A.makeCamera({pos:[0,5,20],target:[1,1,0],fov:30,size:1000,center:[400,300]}),q=cam.project([1,1,0]);assert.ok(Math.abs(q[0]-400)<1e-6&&Math.abs(q[1]-300)<1e-6,'camera: target projects to centre');
 for(const az of[0,50,90,-120]){const fc=A.figureCam({x:120,y:640,height:500,azimuth:az,elevation:10,fov:20}),g=fc.project([0,0,0]);assert.ok(Math.abs(g[0]-120)<1e-6&&Math.abs(g[1]-640)<1e-6,`figureCam az ${az}: ground point placed`);
  const top=fc.project([0,1.8,0]);assert.ok(Math.abs(Math.hypot(top[0]-g[0],top[1]-g[1])-500)<60,`figureCam az ${az}: body height ≈ requested`);}
 const side=A.figureCam({x:0,y:0,height:500,azimuth:0}),sk=A.solve(A.stand());assert.ok(side.project(sk.rSh)[2]<side.project(sk.lSh)[2],'side view (azimuth 0) sees the right side nearest');}
console.log('Athlete cameras: target centring, figureCam placement and scale, side view near side.');
