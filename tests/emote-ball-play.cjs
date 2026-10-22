// Ball emote routines (user, Oct 22 2026: "make them all very different and not look static ... let's not have any emotes leave the screen"):
// PASS IT and JUGGLE WITH ME rotate through 6 routines each (+3 solo juggles), both actors play their half on one clock with whole-body rig
// moves, the ball meets the body on the contact frames, everything stays inside EMOTE_BOUNDS, and every routine differs from every other.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cache=new Map();
function load(file,over={}){
 if(cache.has(file))return cache.get(file);
 const full=path.join(ROOT,file),m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,Math,Object,Float32Array,Float64Array,Uint8Array,Error,Infinity,Number,require:id=>{
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id),key=path.basename(rel);if(over[key])return over[key];return load(path.relative(ROOT,rel+'.ts'),over);}
   throw new Error('unexpected require '+id);}});
 cache.set(file,m.exports);return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const B=load('lib/town/emoteBallPlay.ts'),EB=load('lib/town/emoteBounds.ts').EMOTE_BOUNDS,SM=load('lib/graphics/skillMoves.ts');
const PB=load('lib/town/emotePass.ts');
const LISTS={pass:B.PASS_ROUTINES,juggle:B.JUGGLE_ROUTINES,solo:B.JUGGLE_SOLO_ROUTINES};
const play=(kind,i,age,a,b,o)=>{o.routine=i;return kind==='pass'?B.passBallAt(age,a,b,o):kind==='juggle'?B.juggleBallAt(age,a,b,o):B.juggleSoloAt(age,a,0,o);};

t('variety: 6 Pass it routines, 6 Juggle with me routines, 3 solo juggles, all named differently; lengths fixed per emote',()=>{
 assert(B.PASS_ROUTINES.length>=5&&B.JUGGLE_ROUTINES.length>=5&&B.JUGGLE_SOLO_ROUTINES.length>=3);
 const ids=[...B.PASS_ROUTINES,...B.JUGGLE_ROUTINES,...B.JUGGLE_SOLO_ROUTINES].map(r=>r.id);assert.equal(new Set(ids).size,ids.length);
 for(const r of B.PASS_ROUTINES)assert.equal(r.seconds,B.PASS_SECONDS);for(const r of B.JUGGLE_ROUTINES)assert.equal(r.seconds,B.JUGGLE_SECONDS);
 for(const r of B.JUGGLE_SOLO_ROUTINES)assert.equal(r.seconds,B.JUGGLE_SOLO_SECONDS);
 assert(B.PASS_SECONDS>=6.5&&B.PASS_SECONDS<=8&&B.JUGGLE_SECONDS>=8&&B.JUGGLE_SECONDS<=10&&B.JUGGLE_SOLO_SECONDS>=5&&B.JUGGLE_SOLO_SECONDS<=6.5);
});
t('the bag: every routine once before any repeats, never the same twice in a row (across bags), force pins one',()=>{
 let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(const L of Object.values(LISTS)){const bag=B.createRoutineBag(L.length);let last=-1;
  for(let round=0;round<30;round++){const seen=new Set();for(let i=0;i<L.length;i++){const v=B.nextRoutine(rand,bag);assert.notEqual(v,last,'never twice in a row');last=v;seen.add(v);}assert.equal(seen.size,L.length,'each once per bag');}}
 const o=B.createPassBallOut();o.force=3;assert.equal(B.pickBallRoutine(o,'pass'),3);o.force=-1;const a=B.pickBallRoutine(o,'juggle'),b=B.pickBallRoutine(o,'juggle');assert.notEqual(a,b);assert.equal(B.pickBallRoutine(o,'pass',Math.random,true),0,'reduced motion: the first routine (a pass inside 1.5 s)');
});

// ---- bounds: sample every routine for the gaps the townsperson steps to (and the friend / solo fallbacks)
const gapsFor=k=>k==='pass'?[B.PASS_GAP.min,B.PASS_GAP.max]:k==='juggle'?[B.JUGGLE_GAP.min,B.JUGGLE_GAP.max]:[3];
t('NO EMOTE LEAVES THE FRAME: roots never move, pair gap <= 4.5 m, ball and body under 3.2 m, ball within 3 m of the pair midpoint',()=>{
 assert(B.PASS_GAP.max<=EB.pairMaxGap&&B.JUGGLE_GAP.max<=EB.pairMaxGap,'the step-in gaps fit the shared envelope');
 assert(B.AIR_PARTNER<=EB.pairMaxGap);
 const o=B.createPassBallOut();
 for(const [kind,L] of Object.entries(LISTS))for(let i=0;i<L.length;i++)for(const gap of gapsFor(kind)){
  const a={x:1,y:.3,z:-2},ang=.7+i,b={x:a.x+Math.sin(ang)*gap,y:.3,z:a.z+Math.cos(ang)*gap},mx=kind==='solo'?a.x:(a.x+b.x)/2,mz=kind==='solo'?a.z:(a.z+b.z)/2;
  let top=0;
  for(let age=0;age<=L[i].seconds+.01;age+=1/60){play(kind,i,age,a,b,o);
   assert(Number.isFinite(o.x+o.y+o.z),L[i].id);
   const hb=Math.hypot(o.x-mx,o.z-mz);assert(hb<=EB.ballRadius,L[i].id+' ball '+hb.toFixed(2)+' m from the midpoint at '+age.toFixed(2));
   top=Math.max(top,o.y-a.y+.2);assert(o.y-a.y>=.15,L[i].id+' ball under the grass at '+age.toFixed(2)+': '+(o.y-a.y).toFixed(2));
   for(const ac of o.actors){const lift=ac.jump?ac.jump.height*Math.sin(Math.PI*ac.jump.progress):0;assert(lift<=.5,'hops are small');
    // the body: 1.12 x (2.3 m with raised hands) + the lift
    assert(1.12*(2.3+lift)<=EB.maxHeight,L[i].id+' body height');}
  }
  assert(top<=EB.maxHeight,L[i].id+' ball top '+top.toFixed(2)+' m (gap '+gap+')');
 }
 // the townsperson steps to the gap, never closer than NPC_STEP_TO for the other emotes (<= 3 m)
 const R=read('lib/town/emoteReact.ts');assert(/NPC_STEP_TO = (\d\.?\d*)/.test(R)&&Number(R.match(/NPC_STEP_TO = (\d\.?\d*)/)[1])<=3);
});
t('high but short: Juggle with me arcs rise at least 1.9 m, the pair is 2.7-3.4 m apart (was 6-8 m)',()=>{
 assert(B.JUGGLE_GAP.min>=2.5&&B.JUGGLE_GAP.max<=3.5&&B.PASS_GAP.min>=2.8&&B.PASS_GAP.max<=3.8);
 const o=B.createPassBallOut();
 for(let i=0;i<B.JUGGLE_ROUTINES.length;i++){let top=0;for(let age=0;age<=B.JUGGLE_SECONDS;age+=1/60){B.juggleBallAt(age,{x:0,y:0,z:0},{x:3,y:0,z:0},(o.routine=i,o));top=Math.max(top,o.y);}assert(top>1.9,B.JUGGLE_ROUTINES[i].id+' high arcs: '+top.toFixed(2));}
});
t('Pass it stays on the ground (the passes roll; only the through-ball chip leaves the grass), Juggle with me stays in the air',()=>{
 const o=B.createPassBallOut();
 for(let i=0;i<B.PASS_ROUTINES.length;i++){let air=0,all=0;for(let age=0;age<=B.PASS_SECONDS;age+=1/30){B.passBallAt(age,{x:0,y:0,z:0},{x:3.3,y:0,z:0},(o.routine=i,o));all++;if(o.y>.45)air++;}
  assert(air/all<.2,B.PASS_ROUTINES[i].id+' mostly rolling: '+(air/all).toFixed(2));}
 for(let i=0;i<B.JUGGLE_ROUTINES.length;i++){let air=0,all=0;for(let age=.6;age<=B.JUGGLE_SECONDS-1.5;age+=1/30){B.juggleBallAt(age,{x:0,y:0,z:0},{x:3,y:0,z:0},(o.routine=i,o));all++;if(o.y>.45)air++;}
  assert(air/all>.55,B.JUGGLE_ROUTINES[i].id+' mostly airborne: '+(air/all).toFixed(2));}
});
t('ball physics: an air ball follows gravity (constant downward acceleration), a ground pass rolls and slows',()=>{
 const o=B.createPassBallOut(),a={x:0,y:0,z:0},b={x:3,y:0,z:0};
 for(let i=0;i<B.JUGGLE_ROUTINES.length;i++){o.routine=i;const r=B.JUGGLE_ROUTINES[i];
  for(const s of r.segs){if(s.mode!==2||!(s.t1<99)||s.t1-s.t0<.3)continue;const h=.02,m=(s.t0+s.t1)/2;
   const y=x=>(B.juggleBallAt(x,a,b,o),o.y);const acc=(y(m+h)-2*y(m)+y(m-h))/(h*h);assert(Math.abs(acc+B.BALL_G)<.2,r.id+' gravity '+acc.toFixed(2));}}
 o.routine=0;const r=B.PASS_ROUTINES[0],s=r.segs.find(q=>q.mode===1);const sp=x=>{B.passBallAt(x,a,{x:3.3,y:0,z:0},o);const x0=o.x;B.passBallAt(x+.01,a,{x:3.3,y:0,z:0},o);return Math.abs(o.x-x0)/.01;};
 assert(sp(s.t0+.02)>sp(s.t1-.08)*2,'quick off the foot, slowing as it rolls');
});
t('contact frames: the body action peaks when the ball is there (strike at STRIKE_CONTACT, keep-up tap at a whole phase, header at the jump peak, move contact)',()=>{
 const SMo=load('lib/graphics/strikeMotion.ts'),o=B.createPassBallOut(),a={x:0,y:0,z:0},b={x:3.2,y:0,z:0};
 let checked=0;
 for(const [kind,L] of Object.entries(LISTS))for(let i=0;i<L.length;i++){const r=L[i];
  for(const c of r.contacts){
   const s=r.segs.find(q=>Math.abs(q.t0-c.t)<1e-9&&q.contact);
   if(c.how!=='trap'&&c.how!=='catch')assert(s,r.id+' a ball segment starts on the '+c.how+' contact at '+c.t.toFixed(2));
   play(kind,i,c.t+1e-4,a,b,o);const ac=o.actors[c.who];
   if(c.how==='pass'||c.how==='quick'||c.how==='loft'){assert(ac.kick!==undefined&&Math.abs(ac.kick-SMo.STRIKE_CONTACT)<.01,r.id+' strike contact '+ac.kick);checked++;}
   else if(['foot','knee','head','shoulder','around-world'].includes(c.how)){assert(ac.juggle!==undefined&&ac.juggleTouch===c.how&&Math.abs(ac.juggle%1-.08)<.01,r.id+' keep-up tap '+ac.juggle);checked++;}
   else if(c.how==='header'){assert(ac.reaction==='header'&&ac.jump&&Math.abs(ac.jump.progress-.47)<.01,r.id+' header at the jump peak');checked++;}
   else if(c.how==='chest'||c.how==='thigh'){assert(ac.reaction===c.how&&Math.abs(ac.reactionProgress-.3)<.01);checked++;}
   else if(['volley','heel','flick','scissor'].includes(c.how)){const mv={heel:'backHeel',flick:'flickUp'}[c.how]||c.how;assert(ac.move&&ac.move.kind===mv&&Math.abs(ac.move.progress-B.MOVE_TIMES[mv].contact)<.01,r.id+' '+c.how);checked++;}
   else if(c.how==='trap'){assert(ac.receive===1,r.id+' trap');checked++;}
  }
  // before a contact by a resting strike, the ball waits on the passer's foot
 }
 assert(checked>120,'contacts checked: '+checked);
 // move timings mirror player.ts MOVE_PHASE
 const pl=read('lib/graphics/player.ts');for(const [k,v] of Object.entries(B.MOVE_TIMES))assert(new RegExp(k+':\\{contact:'+String(v.contact).replace(/^0/,'')+',land:[\\d.]+,seconds:'+String(v.seconds).replace(/^0/,'')+'\\}').test(pl),'MOVE_PHASE.'+k);
});
t('the ball leaves on the contact frame: before a resting pass it sits on the foot, after the contact it moves',()=>{
 const o=B.createPassBallOut(),a={x:0,y:0,z:0},b={x:3.3,y:0,z:0};
 for(let i=0;i<B.PASS_ROUTINES.length;i++){const r=B.PASS_ROUTINES[i];o.routine=i;
  for(const c of r.contacts.filter(q=>q.how==='pass')){B.passBallAt(c.t-.03,a,b,o);const x0=o.x,z0=o.z;B.passBallAt(c.t-.005,a,b,o);assert(Math.hypot(o.x-x0,o.z-z0)<.02,r.id+' waits on the foot');
   B.passBallAt(c.t+.06,a,b,o);assert(Math.hypot(o.x-x0,o.z-z0)>.05,r.id+' leaves the foot');}}
});
t('whole body: every routine uses at least 4 different rig layers per actor (strike, cushion, keep-up, skill, move, chest/thigh/header, jump, spin, trick)',()=>{
 const o=B.createPassBallOut(),a={x:0,y:0,z:0},b={x:3.2,y:0,z:0};
 for(const [kind,L] of Object.entries(LISTS))for(let i=0;i<L.length;i++){const layers=[new Set(),new Set()];
  for(let age=0;age<=L[i].seconds;age+=1/30){play(kind,i,age,a,b,o);
   o.actors.forEach((ac,k)=>{const s=layers[k];if(ac.kick!==undefined||ac.windup!==undefined)s.add('strike');if(ac.receive>0)s.add('receive');if(ac.juggle!==undefined)s.add('juggle');if(ac.skill)s.add('skill:'+ac.skill.type);
    if(ac.move)s.add('move');if(ac.reaction)s.add('react');if(ac.jump&&ac.jump.height>.1)s.add('jump');if(Math.abs(Math.sin(ac.turn))>.3)s.add('spin');if(ac.trick)s.add('trick');if(ac.called>0)s.add('called');if(ac.ready>0)s.add('ready');});}
  const need=kind==='solo'?[3]:[4,3];
  need.forEach((m,k)=>assert(layers[k].size>=m,L[i].id+' actor '+k+': '+[...layers[k]].join(',')));
 }
});

// ---- pairwise difference: RMS over sampled pose signatures (both actors) + the ball path, like tests/high-five.cjs
const SAMPLES=24;
function sig(kind,i){const L=LISTS[kind],o=B.createPassBallOut(),a={x:0,y:0,z:0},b={x:3.2,y:0,z:0},rows=[];
 for(let k=0;k<SAMPLES;k++){const age=(k+.5)/SAMPLES*L[i].seconds;play(kind,i,age,a,b,o);const v=new Float32Array(2*B.SIGNATURE_SIZE+3);
  B.actorSignature(o.actors[0],v,0);B.actorSignature(o.actors[1],v,B.SIGNATURE_SIZE);v[2*B.SIGNATURE_SIZE]=o.x/3;v[2*B.SIGNATURE_SIZE+1]=o.y;v[2*B.SIGNATURE_SIZE+2]=o.z/3;rows.push(v);}
 return rows;}
const rms=(A,Bv)=>{let s=0,c=0;for(let k=0;k<A.length;k++)for(let j=0;j<A[k].length;j++){const e=A[k][j]-Bv[k][j];s+=e*e;c++;}return Math.sqrt(s/c);};
t('pairwise pose distance: every two routines differ (RMS >= .15 on the pose + ball signature), and Pass it vs Juggle with me routines differ too',()=>{
 const all=[];for(const [kind,L] of Object.entries(LISTS))for(let i=0;i<L.length;i++)all.push({kind,i,id:L[i].id,s:sig(kind,i)});
 let min=9,pair='';
 for(let x=0;x<all.length;x++)for(let y=x+1;y<all.length;y++){const r=rms(all[x].s,all[y].s);if(r<min){min=r;pair=all[x].id+' / '+all[y].id;}}
 console.log(`  closest routines: ${pair} RMS ${min.toFixed(3)}`);if(process.env.EBP_MATRIX)for(let x=0;x<all.length;x++)console.log(all[x].id.padEnd(15),all.map(q=>rms(all[x].s,q.s).toFixed(2)).join(' '));
 assert(min>=.15,pair+' RMS '+min.toFixed(3));
});
t('different from the other emotes: no ball routine resembles a simple emote (wave arm / cheer hop / dance bounce reference poses)',()=>{
 // a simple emote's reference signature: the "called" arm or a hop, the body facing the camera, no legs, no ball movement
 const E=load('lib/town/emoteReact.ts',{celebrations:{celebrationJump:p=>({progress:p,height:.3})},rideEmotes:load('lib/town/rideEmotes.ts'),emoteContexts:{CTX_EMOTE_EMOJI:{}},npcEmoteSets:{NPC_SET_EMOJI:{}}});
 const blank=()=>({windup:undefined,kick:undefined,actionKind:'pass',receive:0,receiveProgress:0,juggle:undefined,juggleTouch:'foot',side:1,skill:undefined,move:undefined,reaction:undefined,reactionProgress:0,jump:undefined,trick:undefined,ready:0,called:0,turn:0});
 let worst=9;for(const kind of [0,1,5,7,9]){const ref=[];for(let k=0;k<SAMPLES;k++){const age=(k+.5)/SAMPLES*4,a=blank();a.called=E.emoteCalled(kind,age,4);const c=E.emoteCelebration(kind,age,4);if(c>=0)a.jump={progress:c,height:.3};
   const v=new Float32Array(2*B.SIGNATURE_SIZE+3);B.actorSignature(a,v,0);B.actorSignature(a,v,B.SIGNATURE_SIZE);v[2*B.SIGNATURE_SIZE]=.5/3/1;v[2*B.SIGNATURE_SIZE+1]=.1;ref.push(v);}
  for(const [k2,L] of Object.entries(LISTS))for(let i=0;i<L.length;i++){const sg=sig(k2,i),body=x=>x.map(v=>v.slice(0,(k2==='solo'?1:2)*B.SIGNATURE_SIZE)),r=rms(body(ref),body(sg));worst=Math.min(worst,r);assert(r>=.08,L[i].id+' body vs emote '+kind+' RMS '+r.toFixed(3));}}
 console.log('  closest body RMS to a simple emote: '+worst.toFixed(3));
});
t('camera: the zoomed pair frame (emoteCameraMath) holds the ball for the whole routine on phone portrait, phone landscape and desktop; no wide-pair fallback',()=>{
 const M=load('lib/town/emoteCameraMath.ts'),o=B.createPassBallOut(),out={eye:{x:0,y:0,z:0},target:{x:0,y:0,z:0}};
 for(const aspect of [.46,2.16,1.6])for(const [kind,L] of Object.entries(LISTS)){if(kind==='solo')continue;const gap=kind==='pass'?B.PASS_GAP.max:B.JUGGLE_GAP.max;
  assert(gap<5,'never the wide (6-8 m) pair framing');
  for(let i=0;i<L.length;i++){const a={x:0,y:0,z:0},b={x:gap,y:0,z:0},yaw=M.bestEmoteYaw(a.x,a.y,a.z,true,b.x,b.y,b.z,aspect),dist=M.frameEmote(out,a.x,a.y,a.z,true,b.x,b.y,b.z,aspect,1,yaw);
   assert(dist<M.EMOTE_CAM.maxDist+1e-6,'a real zoom: '+dist.toFixed(1));
   for(let age=0;age<=L[i].seconds;age+=1/20){play(kind,i,age,a,b,o);
    assert(M.insideFrame(o.x-out.target.x,o.y-out.target.y,o.z-out.target.z,dist,aspect,yaw),L[i].id+' ball leaves the frame at '+age.toFixed(2)+' (aspect '+aspect+')');}}}
});
t('friends: a friend\'s avatar plays a solo routine body (no ball on their side), picked locally',()=>{
 const o=B.createPassBallOut(),m={};
 for(let i=0;i<3;i++){o.routine=i;let moved=0;for(let age=0;age<B.JUGGLE_SOLO_SECONDS;age+=.1){B.friendBallMotion(o,true,age,.4,m);if(m.juggle!==undefined||m.move||m.trick)moved++;assert(Number.isFinite(m.facing));}assert(moved>25,'solo juggle body '+moved);}
 for(let i=0;i<B.PASS_ROUTINES.length;i++){o.routine=i;let moved=0;for(let age=0;age<B.PASS_SECONDS;age+=.1){B.friendBallMotion(o,false,age,.4,m);if(m.kick!==undefined||m.windup!==undefined||m.skill||m.move||m.receive>0)moved++;}assert(moved>8,B.PASS_ROUTINES[i].id+' passer body '+moved);}
});
t('source: wired for you, the townsperson and friends; no per-frame allocation; one ball; reduced motion keeps the minimal path',()=>{
 const src=read('lib/town/emoteBallPlay.ts'),ev=src.slice(src.indexOf(' evaluation\n'),src.indexOf('export const AIR_PARTNER'));
 assert(ev.length>2000&&!/new |\.map\(|\.filter\(|= \[\]|=> \(\{/.test(ev),'no allocation in the per-frame functions');
 const town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts'),fr=read('lib/graphics/remoteAvatars.ts');
 assert(/pickBallRoutine\(passOut,/.test(town),'Town draws the next routine at the start');
 assert(/actorMotion\(passOut\.actors\[0\]/.test(town)&&/passOut\.say/.test(town),'the player\'s half and the keep-up counter bubble');
 assert(/actorMotion\(a,/.test(npcs),'the townsperson\'s half');
 assert(/friendBallMotion\(/.test(fr),'a friend plays a solo routine body');
 assert(!fs.existsSync(path.join(ROOT,'lib/graphics/passBall.ts')),'no second ball mesh');
 assert(/pick===EMOTE\.PassBall&&reduced\)emoteFx\.dur=1\.5/.test(town)&&/if\(!passOnBall\|\|emoteFx\.kind<0\|\|reduced\)return NOPASS/.test(town),'reduced motion: bubble + one pass, no body routine');
 assert(/emote-ball-play\.cjs/.test(read('package.json')),'in the test chain');
});
console.log(`emote-ball-play: ${n} checks passed`);
