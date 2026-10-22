// Dance + Show off (user, Oct 22 2026: "make them all very different and not look static and the same", "replace the space one",
// "let's not have any emotes leave the screen"). Pure checks on lib/town/emoteDance.ts / emoteShowOff.ts (ten dances, ten show-offs,
// four townsperson reactions): whole-body motion, pairwise pose distance (within each set, across sets, and against the other emotes'
// poses: high fives, laugh, thanks, juggle point, cheer, clap), the EMOTE_BOUNDS envelope on a forward-kinematics body, the shuffled
// bags, no per-frame allocation, and the wiring (dispatcher, wheel label / icon, wire value 4 renamed ShowOff, Town facing).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function load(file,over={}){
 const full=path.join(ROOT,file),m={exports:{}};
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Float32Array,Uint8Array,WeakMap,String,require:id=>{
   const key=path.basename(id);if(over[key])return over[key];
   if(id.startsWith('.'))return load(path.relative(ROOT,path.resolve(path.dirname(full),id)+'.ts'),over);
   throw new Error('unexpected require '+id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const D=load('lib/town/emoteDance.ts'),S=load('lib/town/emoteShowOff.ts',{emoteDance:D});
const B=load('lib/town/emoteBounds.ts').EMOTE_BOUNDS;
const HFm=load('lib/town/highFive.ts',{emoteReact:{EMOTE:{HighFive:2}}});
const R=load('lib/town/rideEmotes.ts');
const E=load('lib/town/emoteReact.ts',{rideEmotes:R,celebrations:{celebrationJump(){}}});
const CEL=load('lib/graphics/celebrations.ts',{three:{}});
const PB=load('lib/graphics/dancePose.ts',{emoteDance:D});
const PS=load('lib/graphics/showOffPose.ts',{emoteDance:D,emoteShowOff:S,dancePose:PB});
const P=load('lib/graphics/emotePose.ts',{emoteReact:E,celebrations:CEL,dancePose:PB,showOffPose:PS});
const NCH=D.BODY_CHANNELS,DUR=4,SETS={dance:D.DANCES,show:S.SHOW_OFFS,react:S.SHOW_OFF_REACTIONS};
const ALL=[...D.DANCES.map(m=>['dance',m]),...S.SHOW_OFFS.map(m=>['show',m]),...S.SHOW_OFF_REACTIONS.map(m=>['react',m])];
const sample=(m,tt)=>Array.from(D.sampleMove(m,tt,new Float32Array(NCH)));
const series=(m,k=24)=>{const o=[];for(let i=0;i<k;i++)o.push(sample(m,(i+.5)/k*DUR));return o;};

// ---- forward kinematics (rig-local metres, y up, z forward; three.js Euler order XYZ) for the bounds
const mul=(a,b)=>{const r=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];return r;};
const eul=(x,y,z)=>{const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
 return mul(mul([1,0,0,0,cx,-sx,0,sx,cx],[cy,0,sy,0,1,0,-sy,0,cy]),[cz,-sz,0,sz,cz,0,0,0,1]);};
const ap=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
function body(c){
 const pel=[c[D.GX],.88+D.pelvisLift(c),c[D.GZ]],Rp=eul(c[D.PP],c[D.SPIN]+c[D.PY],c[D.PR]),Rt=mul(Rp,eul(c[D.TX],c[D.TY],c[D.TZ]));
 const pts={pelvis:pel,head:add(pel,ap(Rt,[0,.86,0]))};
 for(const s of [-1,1]){const L=s<0;
  const sh=add(pel,ap(Rt,[s*.235,.385,0])),Rs=mul(Rt,eul(c[L?D.LSX:D.RSX],0,s*c[L?D.LSZ:D.RSZ])),el=add(sh,ap(Rs,[0,-.28,0]));
  pts[(L?'l':'r')+'Hand']=add(el,ap(mul(Rs,eul(c[L?D.LEL:D.REL],0,0)),[0,-.31,0]));
  const hip=add(pel,ap(Rp,[s*.108,0,0])),Rh=mul(Rp,eul(c[L?D.LHX:D.RHX],0,s*c[L?D.LHZ:D.RHZ])),kn=add(hip,ap(Rh,[0,-.43,0]));
  pts[(L?'l':'r')+'Knee']=kn;pts[(L?'l':'r')+'Foot']=add(kn,ap(mul(Rh,eul(c[L?D.LKN:D.RKN],0,0)),[0,-.48,0]));}
 return pts;
}

t('ten dances, ten show-offs, four reactions; distinct ids and names; each ~4 s',()=>{
 assert.equal(D.DANCE_COUNT,10);assert.equal(S.SHOW_OFF_COUNT,10);assert.equal(S.REACTION_COUNT,4);
 const ids=ALL.map(([,m])=>m.id),names=ALL.map(([,m])=>m.name);assert.equal(new Set(ids).size,ids.length);assert.equal(new Set(names).size,names.length);
 for(const [,m] of ALL)assert.equal(m.seconds,4,m.id);
 for(const [,m] of ALL)for(const tt of [0,1,2,3,4])assert(sample(m,tt).every(Number.isFinite),m.id+' finite at '+tt);
});
t('every move is whole-body: both arms, a leg, the torso / hips, the head and the root (hop, spin or glide) all move; never static',()=>{
 for(const [set,m] of ALL){const sr=series(m,48),dev=c=>Math.max(...sr.map(r=>Math.abs(r[c]-D.NEUTRAL[c])));
  const armsL=Math.max(dev(D.LSX),dev(D.LSZ),dev(D.LEL)),armsR=Math.max(dev(D.RSX),dev(D.RSZ),dev(D.REL));
  const legs=Math.max(dev(D.LHX),dev(D.LKN),dev(D.RHX),dev(D.RKN),dev(D.LHZ),dev(D.RHZ));
  const torso=Math.max(dev(D.TX),dev(D.TY),dev(D.TZ),dev(D.PR),dev(D.PY));
  const head=Math.max(dev(D.HX),dev(D.HY),dev(D.HZ)),root=Math.max(dev(D.HOP)*4,dev(D.SPIN),dev(D.GX)*3,dev(D.GZ)*3,(Math.max(...sr.map(r=>D.STAND_REACH-D.legReach(r))))*3);
  const why=`${m.id}: arms ${armsL.toFixed(2)}/${armsR.toFixed(2)} legs ${legs.toFixed(2)} torso ${torso.toFixed(2)} head ${head.toFixed(2)} root ${root.toFixed(2)}`;
  assert(armsL>.5&&armsR>.5&&legs>.4&&torso>.15&&head>.15&&root>.3,why);
  let mv=0;for(let i=1;i<sr.length;i++){let s=0;for(let c=0;c<NCH;c++)s+=(sr[i][c]-sr[i-1][c])**2;mv+=Math.sqrt(s/NCH);}
  assert(mv/(sr.length-1)>.03,m.id+' keeps moving (mean frame-to-frame RMS '+(mv/(sr.length-1)).toFixed(3)+')');
 }
});
t('EMOTE_BOUNDS: hips within rootRadius of the start, every body part below maxHeight and not through the floor, a pair within pairMaxGap',()=>{
 let maxR=0,maxY=0,minY=9,maxNpc=0;
 for(const [set,m] of ALL)for(let tt=0;tt<=DUR;tt+=1/60){const c=sample(m,tt),r=Math.hypot(c[D.GX],c[D.GZ]),b=body(c);
  assert(r<=B.rootRadius,m.id+' root '+r.toFixed(2)+' at '+tt.toFixed(2));maxR=Math.max(maxR,r);if(set==='react')maxNpc=Math.max(maxNpc,r);
  for(const [k,p] of Object.entries(b)){assert(p[1]<=B.maxHeight,m.id+' '+k+' y '+p[1].toFixed(2));assert(Math.hypot(p[0],p[2])<=B.rootRadius+.9,m.id+' '+k+' reach');
   maxY=Math.max(maxY,p[1]);if(k.endsWith('Foot')||k.endsWith('Knee'))minY=Math.min(minY,p[1]);}
  const ground=Math.min(b.lFoot[1],b.rFoot[1],b.lKnee[1]-.06,b.rKnee[1]-.06,b.lHand[1],b.rHand[1]);assert(ground>-.2,m.id+' sinks into the floor ('+ground.toFixed(2)+') at '+tt.toFixed(2));
 }
 // a townsperson answers from at most NPC_STEP_FROM (it walks in when farther): the pair never spreads past pairMaxGap
 assert(E.NPC_STEP_FROM+maxR+maxNpc<=B.pairMaxGap,'pair gap '+(E.NPC_STEP_FROM+maxR+maxNpc).toFixed(2));
 assert(maxR<=.8,'glides stay small ('+maxR.toFixed(2)+' m)');
 console.log(`  bounds: hips glide <= ${maxR.toFixed(2)} m, highest point ${maxY.toFixed(2)} m, lowest foot / knee ${minY.toFixed(2)} m`);
});

// ---- difference (RMS over sampled channels; radians, metres x3 for hop / glide, spin wrapped)
const W=new Array(NCH).fill(1);W[D.HOP]=3;W[D.GX]=3;W[D.GZ]=3;W[D.SPIN]=.5;W[D.PP]=.5;
const wrap=a=>{a%=2*Math.PI;return a>Math.PI?a-2*Math.PI:a<-Math.PI?a+2*Math.PI:a;};
const rms=(a,b)=>{let s=0,c=0;for(let i=0;i<a.length;i++)for(let j=0;j<NCH;j++){let d=a[i][j]-b[i][j];if(j===D.SPIN||j===D.PP)d=wrap(d);d*=W[j];s+=d*d;c++;}return Math.sqrt(s/c);};
const report=(label,pairs,thr)=>{pairs.sort((a,b)=>a.r-b.r);console.log(`  closest ${label}: ${pairs[0].a} / ${pairs[0].b} RMS ${pairs[0].r.toFixed(3)}`);assert(pairs[0].r>=thr,label+' '+pairs[0].a+' vs '+pairs[0].b+' RMS '+pairs[0].r.toFixed(3));};
t('pairwise pose distance: every dance differs from every other dance, every show-off from every show-off, reactions from each other',()=>{
 for(const [label,list] of Object.entries(SETS)){const sr=list.map(m=>series(m)),pairs=[];
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)pairs.push({a:list[i].id,b:list[j].id,r:rms(sr[i],sr[j])});
  report(label,pairs,.3);}
});
t('dances vs show-offs: no dance looks like a show-off',()=>{const pairs=[];
 for(const a of D.DANCES)for(const b of S.SHOW_OFFS)pairs.push({a:a.id,b:b.id,r:rms(series(a),series(b))});report('dance/show-off',pairs,.3);
});
// the other emotes' reference poses, on the same channels (arms from the real pose layer on a fake rig; the high fives' keyed halves)
const joint=()=>({rotation:{x:0,y:0,z:0}});
const armRig=()=>{const j={'left-shoulder':joint(),'right-shoulder':joint(),'left-elbow':joint(),'right-elbow':joint()};return {getObjectByName:k=>j[k],j};};
const armSeries=kind=>{const o=[];for(let i=0;i<24;i++){const r=armRig(),age=(i+.5)/24*DUR,c=D.NEUTRAL.slice();
 if(kind===E.EMOTE.Cheer)CEL.applyCelebrationArms(r,E.emoteCelebration(kind,age,DUR),1);else if(kind===E.EMOTE.WellPlayed)CEL.applyApplause(r,age,1);else P.applyEmoteArms(r,kind,age,DUR);
 const j=r.j;c[D.LSX]=j['left-shoulder'].rotation.x;c[D.LSZ]=-j['left-shoulder'].rotation.z;c[D.LEL]=j['left-elbow'].rotation.x;c[D.RSX]=j['right-shoulder'].rotation.x;c[D.RSZ]=j['right-shoulder'].rotation.z;c[D.REL]=j['right-elbow'].rotation.x;
 if(kind===E.EMOTE.Cheer||kind===E.EMOTE.Laugh){const b=P.emoteBody(kind,age,DUR);if(b.jump)c[D.HOP]=Math.max(0,Math.sin(Math.PI*b.jump.progress))*b.jump.height;}
 o.push(c);}return o;};
const hfSeries=d=>{const o=[],s=new Float32Array(HFm.HF_STRIDE-1);for(let i=0;i<24;i++){HFm.sampleKeys(d.player,(i+.5)/24*d.duration,s);const c=D.NEUTRAL.slice();
 c[D.RSX]=s[0];c[D.RSZ]=s[1];c[D.REL]=s[2];c[D.LSX]=s[3];c[D.LSZ]=s[4];c[D.LEL]=s[5];c[D.TX]=s[6];c[D.HOP]=Math.max(0,s[7]);c[D.SPIN]=s[8];o.push(c);}return o;};
t('every dance / show-off differs from the other emotes (laugh, thanks, juggle point, cheer, clap, all ten high fives)',()=>{
 const refs=[['laugh',armSeries(E.EMOTE.Laugh)],['thanks',armSeries(E.EMOTE.Thanks)],['juggle-point',armSeries(E.EMOTE.JuggleWithMe)],['cheer',armSeries(E.EMOTE.Cheer)],['clap',armSeries(E.EMOTE.WellPlayed)],
  ...HFm.HIGH_FIVES.map(d=>['high-five:'+d.id,hfSeries(d)])];
 const pairs=[];for(const [,m] of ALL){const s=series(m);for(const [id,r] of refs)pairs.push({a:m.id,b:id,r:rms(s,r)});}
 report('vs other emotes',pairs,.3);
});

t('bags: every move once per round, never the same twice in a row; a townsperson dancing along never copies your dance',()=>{
 let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(const n of [10,4]){const bag=D.createMoveBag(n);let last=-1;for(let round=0;round<30;round++){const seen=new Set();for(let i=0;i<n;i++){const v=D.nextMove(rnd,bag);assert.notEqual(v,last);seen.add(v);last=v;}assert.equal(seen.size,n);}}
 PB.setMoveRandom(rnd);
 for(let i=0;i<40;i++){const you={},npc={};const a=PB.pickMove(you,8,0,D.createMoveBag(10)),bag=D.createMoveBag(10);
  const pa=PB.pickMove(you,8,.01,bag);assert.equal(pa,a,'same run keeps its move');}
 const bag=D.createMoveBag(10),you={},npc={};let prev=-1;
 for(let i=0;i<40;i++){const a=PB.pickMove(you,8,0,bag),b=PB.pickMove(npc,8,0,bag);assert.notEqual(a,b,'townsperson dances a different dance');
  assert.equal(PB.pickMove(you,8,2,bag),a,'the move holds for the whole emote');assert.notEqual(a,prev,'a new emote never repeats the last one');prev=PB.pickMove(you,8,3.9,bag);
  PB.pickMove(you,8,3.95,bag);PB.pickMove(npc,8,3.95,bag);}
 PB.setMoveRandom(null);
});
t('writer: whole rig (legs, pelvis, torso, head, bean gaze) on a full fake rig, arms only on a bare one, nothing outside the envelope',()=>{
 const names=['left-shoulder','right-shoulder','left-elbow','right-elbow','left-hip','right-hip','left-knee','right-knee','left-ankle','right-ankle','player-pelvis','armor-torso','player-head'];
 const mk=()=>{const j={};for(const k of names)j[k]={rotation:{x:0,y:0,z:0},position:{x:0,y:.88,z:0},scale:{y:1},userData:{}};j['player-head'].userData.beanGaze=new Float32Array(2);return {getObjectByName:k=>j[k],j};};
 const r=mk();PB.applyBodyMove(r,D.DANCES[0],2.1,4);
 for(const k of ['left-hip','right-knee','armor-torso','player-head','player-pelvis'])assert(Math.abs(r.j[k].rotation.x)+Math.abs(r.j[k].rotation.y)+Math.abs(r.j[k].rotation.z)+Math.abs(r.j[k].position.x-0)>.01,k+' moved');
 const r2=mk();PB.applyBodyMove(r2,S.SHOW_OFFS[6],1.0,4);assert(r2.j['player-pelvis'].position.y>1.2,'the backflip leaves the ground');
 const r3=mk();PB.applyBodyMove(r3,D.DANCES[0],4,4);PB.applyBodyMove(r3,D.DANCES[0],0,4);assert(r3.j['player-pelvis'].position.y===.88&&r3.j['left-hip'].rotation.x===0,'nothing at the very start / end');
 // a townsperson (its jersey says town-npc-*) reacts to Show off; you and a friend show off
 const who=id=>{const r=mk();r.j['player-jersey']={userData:{playerId:id}};P.applyEmoteArms(r,E.EMOTE.ShowOff,1.0,4);const v=r.j['right-shoulder'].rotation.x;
  const match=list=>list.some(m=>Math.abs(D.sampleMove(m,1.0,new Float32Array(NCH))[D.RSX]-v)<1e-5);return {react:match(S.SHOW_OFF_REACTIONS),show:match(S.SHOW_OFFS)};};
 const npcR=who('town-npc-baker'),youR=who('you'),friendR=who('remote-abc');assert(npcR.react&&!npcR.show,'townsperson reacts');assert(youR.show&&!youR.react,'you show off');assert(friendR.show,'a friend shows off');
 const bare=armRig();P.applyEmoteArms(bare,E.EMOTE.Dance,1.5,4);assert(Object.values(bare.j).some(o=>Math.abs(o.rotation.x)>.05),'a rig with arms only still dances its arms');
 const bare2=armRig();P.applyEmoteArms(bare2,E.EMOTE.ShowOff,1.5,4);assert(Object.values(bare2.j).some(o=>Math.abs(o.rotation.x)>.05));
});
t('no per-frame allocation in the moves or the writer (no closures, array / object literals or `new` inside a pose)',()=>{
 for(const f of ['lib/town/emoteDance.ts','lib/town/emoteShowOff.ts']){const src=read(f),re=/pose\(t, o\) \{([\s\S]*?)\n\}\};/g;let m,c=0;
  while((m=re.exec(src))){c++;assert(!/=>|\bnew\b|[(,=]\s*\[|[(,=]\s*\{\s*\w+\s*:/.test(m[1]),f+' pose body allocates: '+m[1].slice(0,80));}
  assert(c>=(f.includes('Dance')?10:14),f+' poses found '+c);}
 const w=read('lib/graphics/dancePose.ts'),body=w.slice(w.indexOf('export function applyBodyPose'),w.indexOf('// ---- which move'));
 assert(!/\bnew\b|=>\s*\{/.test(body.replace('new WeakMap','').replace('new Float32Array(BODY_CHANNELS)','')),'writer allocates');
});
t('wiring: dispatcher, Show off on the wheel (wire 4), the glyph, Town keeps the heading (the move spins the body), reduced motion untouched',()=>{
 assert.equal(E.EMOTE.ShowOff,4);assert(!('Space' in E.EMOTE));
 const wheel=E.LOCAL_EMOTES.find(x=>x.emote===4);assert.equal(wheel.label,'Show off');assert.equal(wheel.icon,'show-off');assert.equal(E.EMOTE_EMOJI[4],'\u{1F31F}');
 assert(/ShowOff: 4/.test(read('multiplayer/protocol/types.ts'))&&!/Space: 4/.test(read('multiplayer/protocol/types.ts')),'protocol key renamed, value kept');
 assert(/'show-off':/.test(read('components/party/PartyChip.tsx')),'Show off glyph');
 assert(/\[Emote\.ShowOff\]:'\\u\{1F31F\}'/.test(read('lib/graphics/remoteAvatars.ts')),'friend bubble emoji');
 const ep=read('lib/graphics/emotePose.ts');assert(/applyDance\(root, kind, age, dur\)/.test(ep)&&/applyShowOff\(root, kind, age, dur\)/.test(ep));
 const town=read('components/Town.tsx');assert(/emoteFx\.kind===EMOTE\.Dance\|\|emoteFx\.kind===EMOTE\.ShowOff\)return emoteYaw0;/.test(town),'Town holds the heading');
 assert(/else if\(emoteFx\.v<0&&!passOnBall\)applyEmoteArms\(player\.root/.test(town)&&/if\(emoteFx\.kind>=0&&!reduced&&ctxFx\.script\)/.test(town),'reduced motion: no move (bubble + called arm only)');
 assert.equal(P.emoteBody(E.EMOTE.Dance,1,4).jump,undefined,'the move hops itself (no rig hop on top)');
});
console.log(`emote-dance-show: ${n} checks passed`);
