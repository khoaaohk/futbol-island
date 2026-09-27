// Lane F (docs/pass-puzzle/CONTRACT.md): draw-the-pass in the "Make yourself an option" coach lesson.
// Stroke → predicted path → threat ring → pass → 3-attempt/hint flow → slow-motion replay, headless.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache={};
function load(file){
 let f=path.resolve(file);if(!f.endsWith('.ts'))f=fs.existsSync(f+'.ts')?f+'.ts':path.join(f,'index.ts');
 if(cache[f])return cache[f].exports;const m={exports:{}};cache[f]=m;
 const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{module:m,exports:m.exports,Math,JSON,structuredClone,WeakMap,Map,Set,Array,Object,Number,require:x=>x.startsWith('.')?load(path.join(path.dirname(f),x)):require(x)});
 return m.exports;
}
const L=load('lib/town/learning.ts'),P=load('lib/town/learningPass.ts');
const {PASSER,DEFENDER}=L;
const stroke=(to,bend=0)=>{const pts=[];for(let i=0;i<=10;i++){const u=i/10,s=Math.sin(Math.PI*u)*bend;const dx=to.x-PASSER.x,dz=to.z-PASSER.z,l=Math.hypot(dx,dz);pts.push({x:PASSER.x+dx*u+(-dz/l)*s,z:PASSER.z+dz*u+(dx/l)*s,t:u*.3});}return pts;};
const run=world=>{let guard=0;while(!P.lessonFrame(world.state).done&&guard++<2400)world.step(1/120);return P.lessonFrame(world.state);};

// Coordinate boundary: lesson world ⇄ engine pitch round-trips, and the passer plays up the pitch (+z).
for(const p of [PASSER,DEFENDER,{x:5,z:9},{x:17.5,z:11}]){const back=P.fromPitch(P.toPitch(p));assert(Math.abs(back.x-p.x)<1e-9&&Math.abs(back.z-p.z)<1e-9,'toPitch/fromPitch round-trip');}
assert(P.toPitch({x:11,z:9}).z>P.toPitch(PASSER).z,'the receiver is up the pitch from the passer in engine space');

// 1. A stroke must start on the ball.
{const w=P.createLessonWorld({x:5,z:9},'7v7');
 assert.equal(P.readLessonStroke([{x:11,z:15,t:0},{x:5,z:9,t:.3}],w),null,'a stroke that starts away from the ball is ignored');
 assert.equal(P.readLessonStroke([{x:11,z:21,t:0},{x:11.3,z:20.5,t:.1}],w),null,'a tiny tap is not a pass');}

// 2. Blocked: calling from behind the defender → the predicted path ends in an interception and the marker is a threat.
let blocked;
{const receiver={x:11,z:9},w=P.createLessonWorld(receiver,'7v7'),kick=P.readLessonStroke(stroke(receiver),w);
 assert(kick,'stroke from the ball reads as a kick');assert.equal(kick.kind,'pass-feet','stroke ending on the teammate is a pass to feet');assert.equal(kick.loft,0,'the lesson keeps passes on the ground');
 const pred=P.predictLessonPass(w,kick);
 assert.equal(pred.end,'intercept','straight through the defender is intercepted');assert.equal(JSON.stringify(pred.threats),JSON.stringify([0]),'the marker gets the red threat ring');
 assert(pred.path.length>=2&&pred.path.every(p=>Number.isFinite(p.x+p.y+p.z+p.t)),'predicted path is finite lesson-world points');
 assert(Math.hypot(pred.path[0].x-PASSER.x,pred.path[0].z-PASSER.z)<.6,'path starts at the passer’s feet');
 assert(pred.windup>=.26&&pred.windup<=.56,'wind-up comes from windupSeconds');
 const start=w.snapshot();assert(w.kick(kick),'the frozen world accepts the drawn kick');
 const f=run(w);assert(f.done,'the pass resolves');assert.equal(f.outcome,'intercept','the live pass matches the prediction');
 assert(Math.hypot(f.defender.x-DEFENDER.x,f.defender.z-DEFENDER.z)<3,'the marker steps into the lane');
 blocked={kick,prediction:pred,receiver,defender:DEFENDER,start,inputs:w.inputs(),outcome:f.outcome,final:f,tick:w.state.tick};}

// 3. Open: after moving sideways the same stroke reaches the receiver, with no threat.
let open;
for(const receiver of [{x:5,z:9},{x:17,z:9}]){const w=P.createLessonWorld(receiver,'9v9'),kick=P.readLessonStroke(stroke(receiver),w),pred=P.predictLessonPass(w,kick);
 assert.equal(pred.end,'receive',`a lane from ${receiver.x} is open`);assert.equal(JSON.stringify(pred.threats),JSON.stringify([]),'no red ring on an open lane');
 assert(pred.receiveAt&&Math.hypot(pred.receiveAt.x-receiver.x,pred.receiveAt.z-receiver.z)<3.5,'the path ends where the receiver meets it');
 const start=w.snapshot();w.kick(kick);const f=run(w);assert.equal(f.outcome,'receive','the live pass is received');
 assert(Math.hypot(f.ball.x-f.receiver.x,f.ball.z-f.receiver.z)<1,'ball ends at the receiver’s feet');
 open??={kick,prediction:pred,receiver,defender:DEFENDER,start,inputs:w.inputs(),outcome:f.outcome,final:f,tick:w.state.tick};}

// Threat agrees with the lesson's passing-lane rule on both sides of the defender.
for(const x of [4,6,16,18])assert.equal(P.predictLessonPass(P.createLessonWorld({x,z:9},'7v7'),P.readLessonStroke(stroke({x,z:9}),P.createLessonWorld({x,z:9},'7v7'))).end,'receive',`wide angle x=${x} is open`);
for(const x of [9.5,11,12.5])assert.equal(P.predictLessonPass(P.createLessonWorld({x,z:9},'7v7'),P.readLessonStroke(stroke({x,z:9}),P.createLessonWorld({x,z:9},'7v7'))).end,'intercept',`central x=${x} is blocked`);

// Curl: bending the stroke bends the path the same way (sign survives the coordinate flip).
{const receiver={x:8,z:9},w=P.createLessonWorld(receiver,'11v11');const straight=P.predictLessonPass(w,P.readLessonStroke(stroke(receiver),w));
 const bent=P.readLessonStroke(stroke(receiver,2.5),w);assert(Math.abs(bent.curl)>0,'a bowed stroke adds curl');
 const curved=P.predictLessonPass(w,bent);const mid=a=>a.path[Math.floor(a.path.length/2)];
 const side=(p)=>((p.x-PASSER.x)*(receiver.z-PASSER.z)-(p.z-PASSER.z)*(receiver.x-PASSER.x));
 const bowSide=side(stroke(receiver,2.5)[5]);assert(Math.sign(side(mid(curved))-side(mid(straight)))===Math.sign(bowSide),'the ball bows toward the side the finger bowed');}

// 4. Brief + hint + 3 attempts, wording scaled 7v7 → 9v9 → 11v11.
for(const f of P.LESSON_FORMATS){const c=P.PASS_COPY[f];for(const k of ['brief','hint','threat','clear','miss','rest','success'])assert(c[k]&&c[k].length>20,`${f} ${k} copy`);}
const words=f=>P.PASS_COPY[f].brief.split(/\s+/).length+P.PASS_COPY[f].hint.split(/\s+/).length;
assert(words('7v7')<words('9v9')&&words('9v9')<=words('11v11'),'7v7 wording is the simplest, 11v11 the richest');
assert(!/\blane\b/.test(P.PASS_COPY['7v7'].brief)&&/lane/.test(P.PASS_COPY['11v11'].brief),'tactical vocabulary grows with the format');
assert.equal(P.lessonFormat({getItem:k=>k==='fi2-path-format-v1'?'9v9':null}),'9v9','defaults to the child’s path format');
assert.equal(P.lessonFormat({getItem:k=>k==='fi2-lesson-format-v1'?'11v11':'7v7'}),'11v11','an in-lesson choice wins');
assert.equal(P.lessonFormat({getItem:()=>'futsal'}),'7v7','futsal and unknown fall back to the simplest wording');
assert.equal(P.lessonFormat(null),'7v7');
{let s=P.newAttempts('7v7');assert.equal(P.attemptsLeft(s),3);assert.equal(s.hint,false,'the hint starts hidden');assert.equal(P.attemptMessage(s),P.PASS_COPY['7v7'].brief,'brief before the first attempt');
 s=P.recordAttempt(s,blocked);assert.equal(s.result,'miss');assert.equal(s.hint,true,'a miss unlocks the hint');assert.equal(P.attemptsLeft(s),2);assert.equal(P.attemptMessage(s),P.PASS_COPY['7v7'].miss);
 s=P.recordAttempt(s,blocked);assert.equal(s.result,'miss');s=P.recordAttempt(s,blocked);assert.equal(s.result,'spent','three misses use every attempt');assert.equal(P.attemptsLeft(s),0);
 let w=P.recordAttempt(P.newAttempts('11v11'),open);assert.equal(w.result,'success');assert.equal(w.hint,false,'first-time success never forces the hint');assert.equal(P.attemptMessage(w),P.PASS_COPY['11v11'].success);}

// 5. Slow-motion "Watch again": the engine replay at 0.38× re-creates exactly what happened.
assert.equal(P.REPLAY_SPEED,.38);
for(const rec of [blocked,open]){const r=P.replayLessonPass(rec.start,rec.inputs,P.REPLAY_SPEED);assert.equal(r.speed,.38);
 let real=0;while(!P.lessonFrame(r.world.state).done&&real<30){r.advance(1/60);real+=1/60;}
 const flightTicks=r.world.state.tick-rec.start.state.tick;for(let g=0;r.world.state.tick<rec.tick&&!r.done&&g<2000;g++)r.advance(1/120/.38);assert.equal(r.world.state.tick,rec.tick,'replay lines up tick for tick');
 const f=P.lessonFrame(r.world.state);assert.equal(f.outcome,rec.outcome,'replay reaches the same outcome');
 assert(Math.hypot(f.ball.x-rec.final.ball.x,f.ball.z-rec.final.ball.z)<1e-6,'replay ball ends exactly where the live ball did');
 assert(Math.hypot(f.defender.x-rec.final.defender.x,f.defender.z-rec.final.defender.z)<1e-6,'replay marker ends exactly where the live marker did');
 const flight=flightTicks/120;assert(real>flight/.38*.9,`replay runs in slow motion (${real.toFixed(2)} s real for ${flight.toFixed(2)} s of play)`);}

// 6. Wiring: Town/CoachLesson use the engine, keep prediction on pointer moves only, and sleep while aiming.
const town=fs.readFileSync('components/Town.tsx','utf8'),coach=fs.readFileSync('components/CoachLesson.tsx','utf8'),pass=fs.readFileSync('lib/town/learningPass.ts','utf8');
assert(/from '\.\.\/passPuzzle'/.test(pass)&&/readStroke\(/.test(pass)&&/predict\(world,kick\)/.test(pass),'lesson uses lane C’s readStroke/predict');
assert.equal((town.match(/predictLessonPass\(/g)||[]).length,1,'one prediction call site in Town');
const updateAim=town.match(/const updateAim=\(\)=>\{[\s\S]*?\};/)[0];assert(/predictLessonPass/.test(updateAim),'prediction lives in updateAim');
const animate=town.slice(town.indexOf('function animate('),town.indexOf('\n    }\n',town.indexOf('function animate(')));
assert(animate.length>1000&&!/updateAim\(|predictLessonPass\(|readLessonStroke\(/.test(animate),'no stroke reading or prediction inside the frame loop');
assert(/const aimMove=[\s\S]{0,400}?updateAim\(\)/.test(town),'prediction updates on pointer move');
assert(/aimWaiting=[^;]*lessonRef\.current==='aim'/.test(town)&&/aim:\$\{aimRevision\}/.test(town),'frozen aiming lets the render loop sleep until the stroke changes');
assert(/called:lessonRef\.current==='aim'\?1/.test(town),'the receiver waves (PlayerMotion.called) while the child aims');
assert(/ready:1/.test(town),'the marker shows a ready stance while the pass is on');
assert(/replayLessonPass\(last\.start,last\.inputs,REPLAY_SPEED\)/.test(town),'Watch again replays the recorded attempt through the engine');
assert(/Watch again in slow motion/.test(coach)&&/Watch it again in slow motion/.test(coach),'slow-motion replay offered after a miss and after success');
assert(/Give me a hint/.test(coach)&&/ATTEMPT/.test(coach)&&/EXPLAIN IT FOR/.test(coach),'hint, attempt counter and format choice in the coach card');
assert(/Aim straight at me/.test(coach)&&/PLAY THIS PASS/.test(coach),'keyboard/switch users can preview and play a pass without drawing');
console.log('lesson draw-the-pass: stroke → path → threat → pass → attempts → replay ok');
