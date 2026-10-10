// Pass Puzzles "See the Space" (Oct 9 2026): the Scan (every simple lane graded on the frozen pitch), the
// combination takeaways (third friend, one-two, set back, switch), the keeper-claim fail words and the
// pack-map "Next puzzle" order with its star gates. Run: node tests/pass-puzzle-space.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const lib=f=>require(path.join(__dirname,'..','lib','passPuzzle',f));
const P=lib('index.ts'),C=lib('catalog.ts'),{strokeForKick}=lib('coach.ts'),{isCall,EXTRA_PACKS}=lib('packs.ts'),X=lib('explain.ts'),S=lib('scan.ts'),{DIFFICULTY}=lib('curve.ts');
const byId=id=>C.ALL_SCENARIOS.find(s=>s.id===id);
const numsFor=sc=>({attackers:sc.attackers.map((_,i)=>[10,9,11,7,8,6][i]??20+i),defenders:sc.defenders.map((_,i)=>[4,5,2,3,6,8][i]??30+i),keeper:1});
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|centre-back|full-back|lay-off|recycle|between the lines|in stride)\b/i;
/** Play a route the way the arcade does: each release is noted with its prediction and the scan's shut lanes. */
function run(sc,steps){const w=P.createPuzzle(sc),notes=[];let i=0;
 for(let g=0;g<120*40;g++){const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
  if(ph==='aiming'){if(i>=steps.length)break;const st=steps[i++];if(isCall(st)){w.callRun(st.call.attacker,st.call.to);continue;}
   const k=P.readStroke(strokeForKick(w,st),w),p=P.predict(w,k),calls=w.state.attackers.map((a,j)=>a.call&&a.call.startAt==null?j:-1).filter(j=>j>=0);
   const n=X.noteFor(w.state,k,p,calls,w.state.chain.length>0);n.shut=S.shutLanes(S.scanLanes(w));if(!w.kick(k))break;notes[w.inputs().length-1]=n;}
  w.step(1/120);}
 return{w,notes};}

/* 1. Scan: one graded lane per teammate, only while aiming, and it reads the puzzle the way the brief does */
{const sc=byId('ss-look-up'),w=P.createPuzzle(sc),lanes=S.scanLanes(w);
 assert.equal(lanes.length,sc.attackers.length-1,'a lane for every teammate');
 for(const l of lanes){assert(['clear','tight','blocked','offside','save'].includes(l.status));assert.notEqual(l.receiver,sc.carrier);}
 const of=i=>lanes.find(l=>l.receiver===i).status;
 assert.equal(of(2),'blocked','the middle lane is shut');assert.equal(of(3),'clear','the far-side teammate is open');
 assert.deepEqual(S.shutLanes(lanes).includes(2),true);assert(!S.shutLanes(lanes).includes(3));
 assert.equal(w.state.phase,'aiming');const before=JSON.stringify(w.state);S.scanLanes(w);assert.equal(JSON.stringify(w.state),before,'scanning never changes the frozen world');
 w.kick(P.readStroke(strokeForKick(w,C.ALL_SOLUTIONS[sc.id].solution[0]),w));w.step(1/120);assert.deepEqual(S.scanLanes(w),[],'no scan once the ball is moving');
 const t0=process.hrtime.bigint();for(let i=0;i<20;i++)S.scanLanes(P.createPuzzle(byId('ss-up-back-through')));const ms=Number(process.hrtime.bigint()-t0)/1e6/20;
 assert(ms<25,`a scan is cheap enough to run once per aim (${ms.toFixed(1)} ms)`);}

/* 2. See the Space: a pack that teaches one idea per puzzle and ramps 1 → 3 passes */
{const pack=EXTRA_PACKS.find(p=>p.id==='see-the-space');assert(pack,'the pack exists');
 const list=C.ALL_SCENARIOS.filter(s=>s.pack==='see-the-space');assert.equal(list.length,4);
 assert.deepEqual(list.map(s=>s.require.minPasses),[1,2,2,3],'passes needed rise through the pack');
 assert.deepEqual(list.map(s=>s.id),['ss-look-up','ss-set-and-go','ss-third-runner','ss-up-back-through']);
 for(let i=1;i<list.length;i++)assert(DIFFICULTY[list[i].id]>DIFFICULTY[list[i-1].id],'measured difficulty rises: '+list.map(s=>DIFFICULTY[s.id]).join(' → '));
 assert(C.ALL_SOLUTIONS['ss-third-runner'].solution.some(isCall),'the third runner must be sent by the child');
 // Without the called run the same passes fail: the run is the lesson.
 const sc=byId('ss-third-runner'),noCall=C.ALL_SOLUTIONS[sc.id].solution.filter(s=>!isCall(s));assert.notEqual(run(sc,noCall).w.state.phase,'success','no run, no third friend');}

/* 3. Takeaways name the combination */
{const words=(id,f='9v9')=>{const sc=byId(id),r=run(sc,C.ALL_SOLUTIONS[id].solution);assert.equal(r.w.state.phase,'success',id);return X.explainSuccess(r.notes,sc,numsFor(sc),f,3).join(' ');};
 assert.match(words('ss-third-runner'),/Third-man move/,'third man named (9v9)');
 const young=words('ss-third-runner','7v7');assert.match(young,/third friend/i);assert(!JARGON.test(young),'7v7 words stay jargon-free: '+young);
 assert.match(words('ss-set-and-go'),/set it for/,'set back named');assert.match(words('ss-up-back-through'),/set it for/);
 assert.match(words('tm-give-and-go'),/one-two/i,'the one-two named');
 assert.match(words('tm-give-and-go','7v7'),/Give-and-go/);
 assert.match(words('tm-switch-it'),/switched play/,'the switch named');}

/* 4. A keeper who claims a through ball gets pass advice, not shooting advice */
{const nums={attackers:[10,9],defenders:[4],keeper:1},pass={kicker:0,kind:'pass-space',loft:0,curl:0,target:{x:0,z:20},from:{x:0,z:5},beaten:0,calls:[],firstTime:false},shot={...pass,kind:'shot'};
 const a=X.explainFail('save',{type:'save',tick:1,t:1,at:{x:0,y:0,z:20},keeper:true},pass,nums,'9v9'),b=X.explainFail('save',undefined,shot,nums,'9v9');
 assert.match(a.why,/claimed the pass/);assert.match(a.fix,/wider of the keeper/);assert.match(b.fix,/side the keeper is not covering/);
 assert.match(X.explainFail('save',undefined,pass,nums,'7v7').why,/grabbed your pass/);}

/* 5. Next puzzle follows the pack map and respects star gates */
{const order=C.MAP_ORDER.map(s=>s.id);assert.equal(order.length,C.ALL_SCENARIOS.length);assert.equal(new Set(order).size,order.length);
 const packOrder=[...new Set(C.MAP_ORDER.map(s=>s.pack))];assert.deepEqual(packOrder,C.ALL_PACKS.map(p=>p.id),'grouped in pack-map order');
 const lastTeam=C.ALL_SCENARIOS.filter(s=>s.pack==='team-moves').at(-1).id;
 assert.deepEqual(C.nextOnMap(lastTeam,0),{locked:C.ALL_PACKS.find(p=>p.id==='see-the-space'),need:5},'a closed pack stops "Next" and says how many stars it needs');
 const n=C.nextOnMap(lastTeam,99);assert.equal(n.scenario.id,'ss-look-up');assert.equal(n.newPack,true,'the next pack along the map, not the next one in the file');
 assert.equal(C.nextOnMap('ss-look-up',99).scenario.id,'ss-set-and-go');assert.equal(C.nextOnMap('ss-look-up',99).newPack,false);
 assert.equal(C.nextOnMap(order.at(-1),999),null,'the end of the map');assert.equal(C.nextOnMap('daily-2026-10-09',99),null,'the daily has no next');
 // Timing & Runs teaches one called run before two.
 const timing=C.ALL_SCENARIOS.filter(s=>s.pack==='timing').map(s=>s.id);assert(timing.indexOf('tr-make-the-run')<timing.indexOf('tr-decoy-run'),'one call before two');}

console.log('PASS see the space: scan lanes graded and cheap, 4-puzzle pack ramps 1→3 passes, third man / one-two / set back / switch named, keeper claim explained, Next follows the pack map and its gates');
