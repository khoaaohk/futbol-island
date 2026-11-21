// Pop-up target game (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md): the flick mapping, the pop-up scheduler and
// its fairness (never more than N out, time to react for a 7-year-old at the start, the ramp only gets harder), hits, knock-downs,
// combos, streaks, the friendly-target penalty, multi-ball, the seeded daily, every arena's spots on screen at phone and desktop
// shapes, the device save and the wiring.
//   node tests/popup-core.cjs [--bots] [--layout]
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/popup/core.ts'),{ARENAS}=require('../lib/arcade/popup/arenas.ts'),S=require('../lib/arcade/popup/save.ts'),{PU,K,KIND}=C,STEP=PU.step,BOTS=process.argv.includes('--bots'),LAYOUT=process.argv.includes('--layout');
const read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{const t0=Date.now();fn();n++;if(BOTS)console.log(`  ${name} (${Date.now()-t0} ms)`);};
const PHONE=390/844,DESK=1440/900;
const tanOf=(a,aspect)=>Math.tan(C.viewFor(a.cam,aspect).fov*Math.PI/360),proj=(a,aspect,x,y,z)=>C.projectTo({x:0,y:0,z:0},C.camBasis(C.viewFor(a.cam,aspect)),tanOf(a,aspect),aspect,x,y,z);

/* ---- bots: they flick through the same screen maths as a finger ---- */
const KID={react:1.25,see:.75,noise:.07,friend:.35},GOOD={react:.55,see:.4,noise:.025,friend:.05},ACE={react:.24,see:.2,noise:0,friend:0};
function playBot(opts,skill,{seed=7,aspect=PHONE,watch}={}){
 const g=C.createPopup(opts),s=g.state;let r=seed>>>0||1;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;},gauss=()=>(rnd()+rnd()+rnd()-1.5)*1.4;
 let wait=.6;const seen=new Map(),aimed=new Map();
 while(!s.over){
  wait-=STEP;
  if(wait<=0&&s.rack>0){let t=null,td=1e9;
   for(const e of s.targets){if(!e.on||e.st!==2)continue;if(!seen.has(e.id))seen.set(e.id,s.t);if(s.t-seen.get(e.id)<skill.see)continue;
    if(e.kind===K.friend&&rnd()>skill.friend)continue;if(aimed.get(e.id)>=KIND[e.kind].hp)continue;const d=Math.hypot(e.x-g.arena.ball[0],e.z-g.arena.ball[2]);if(d<td){td=d;t=e;}}
   if(t){const a=g.aimOf(t,aspect);aimed.set(t.id,(aimed.get(t.id)||0)+1);g.flick(a.ang+gauss()*skill.noise,Math.max(0,Math.min(1,a.power+gauss()*skill.noise*2)),0,aspect);wait=skill.react*(.8+rnd()*.4);}}
  g.advance(STEP);if(watch)watch(g);g.drain(()=>{});
 }
 return {score:s.score,stats:{...s.stats},g};
}

ok('flick mapping: direction is the aim, speed is the power, short or downward swipes are not flicks',()=>{
 const up=C.flickFromSwipe(0,-200,120,844);assert.ok(up&&Math.abs(up.ang)<1e-9);
 const right=C.flickFromSwipe(120,-120,120,844),left=C.flickFromSwipe(-120,-120,120,844);assert.ok(right.ang>0&&left.ang<0&&Math.abs(right.ang+left.ang)<1e-9);assert.ok(Math.abs(right.ang-Math.PI/4)<1e-9);
 const slow=C.flickFromSwipe(0,-200,600,844),fast=C.flickFromSwipe(0,-200,90,844);assert.ok(fast.power>slow.power&&fast.reach>slow.reach);assert.equal(fast.power,1);assert.ok(slow.power<.05);
 assert.equal(C.flickFromSwipe(0,-10,60,844),null,'a tap is not a flick');assert.equal(C.flickFromSwipe(0,200,100,844),null,'downward');assert.equal(C.flickFromSwipe(300,-20,100,844),null,'flat sideways');
 // the same finger movement on a taller or shorter screen is the same flick (screen heights, not pixels)
 const a=C.flickFromSwipe(60,-180,140,844),b=C.flickFromSwipe(30,-90,140,422);assert.ok(Math.abs(a.power-b.power)<1e-9&&Math.abs(a.ang-b.ang)<1e-9);
 assert.equal(C.curlFromBend(.03),0);assert.ok(C.curlFromBend(.2)>0&&C.curlFromBend(-.2)<0);assert.equal(C.curlFromBend(1),1);
 for(const p of [0,.3,1])assert.ok(Math.abs(C.powerForReach(C.reachFor(p))-p)<1e-9);
});
ok('the flick through the camera: aiming at a target hits it; aiming away misses and costs the streak',()=>{
 for(const aspect of [PHONE,DESK])for(let ai=0;ai<ARENAS.length;ai++){
  const g=C.createPopup({seed:11+ai,arena:ai}),s=g.state;let hits=0,tries=0;
  for(let i=0;i<4000&&tries<8;i++){g.advance(STEP);g.drain(()=>{});const t=s.targets.find(e=>e.on&&e.st===2&&e.kind===K.dummy&&e.up>.1);
   if(t&&s.rack>0&&!s.balls.some(b=>b.on)){const a=g.aimOf(t,aspect),before=s.stats.knocks;assert.equal(g.flick(a.ang,a.power,0,aspect),1);tries++;for(let k=0;k<200&&s.stats.knocks===before&&t.on&&t.st===2;k++)g.advance(STEP);if(s.stats.knocks>before)hits++;}}
  assert.ok(tries>=5,`${ARENAS[ai].id}: got to flick ${tries}`);assert.ok(hits>=tries-1,`${ARENAS[ai].id} @${aspect.toFixed(2)}: ${hits}/${tries} aimed flicks knocked the dummy down`);
 }
 const g=C.createPopup({seed:3,arena:0}),s=g.state;while(!s.targets.some(e=>e.on&&e.st===2))g.advance(STEP);
 const t=s.targets.find(e=>e.on&&e.st===2),a=g.aimOf(t,PHONE);g.flick(a.ang,a.power,0,PHONE);for(let k=0;k<200&&!s.stats.knocks;k++)g.advance(STEP);assert.equal(s.streak,1);
 // a flick far off line: the aim help does not lock, the ball hits nothing, the streak is lost
 assert.equal(g.pick(a.ang>0?-1.2:1.2,.3,PHONE),-1);for(let k=0;k<30;k++)g.advance(STEP);g.flick(a.ang>0?-1.2:1.2,.1,0,PHONE);const ev=[];for(let k=0;k<600;k++)g.advance(STEP);g.drain(e=>ev.push(e.type));
 assert.ok(ev.includes('miss'));assert.equal(s.streak,0);assert.equal(s.stats.wasted,1);
});
ok('scheduler fairness: never more than N out, a calm start, time to react, the ramp only gets harder',()=>{
 for(const dur of [PU.secs,PU.dailySecs]){let pm=0,ps=9,pg=9;for(let t=0;t<=dur;t+=.5){const m=C.maxOutAt(t,dur),st=C.stayAt(t,dur),gp=C.gapAt(t,dur);assert.ok(m>=pm&&st<=ps+1e-9&&gp<=pg+1e-9,'ramp is monotone');pm=m;ps=st;pg=gp;assert.ok(m<=PU.maxOut);}
  assert.equal(C.maxOutAt(0,dur),2);assert.equal(C.maxOutAt(dur-1,dur),PU.maxOut);assert.ok(C.stayAt(0,dur)>=3,'a 7-year-old gets 3 s for the first targets');assert.ok(C.stayAt(dur,dur)>=1.5);}
 assert.equal(PU.maxOut,5);
 for(let ai=0;ai<ARENAS.length;ai++)for(const seed of [1,2,3,99,2026]){
  const g=C.createPopup({seed,arena:ai}),s=g.state;let maxSeen=0,firstStay=0,early=[],minStay=9,friendsOut=0;const born=new Map();
  while(!s.over){g.advance(STEP);let out=0,fr=0;for(const e of s.targets){if(!e.on||e.st===4)continue;out++;if(e.kind===K.friend)fr++;
    if(!born.has(e.id)){born.set(e.id,s.t);if(s.t<PU.calm)early.push(e.kind);if(!firstStay)firstStay=e.stay;if(e.rail<0)minStay=Math.min(minStay,e.stay);
     if(born.size===1)assert.equal(e.band,0,'the first target is a near one');}}
   assert.ok(out<=C.maxOutAt(s.t,g.dur),`out ${out} at ${s.t.toFixed(1)}`);maxSeen=Math.max(maxSeen,out);friendsOut=Math.max(friendsOut,fr);g.drain(()=>{});}
  assert.ok(maxSeen<=PU.maxOut&&maxSeen>=4,`max out ${maxSeen}`);assert.ok(firstStay>=3,`first stay ${firstStay}`);assert.ok(minStay>=.95,`shortest stay ${minStay}`);assert.ok(friendsOut<=1,'one friendly figure at a time');
  assert.ok(early.every(k=>k===K.dummy||k===K.balloon||k===K.runner),`calm start: ${early}`);assert.ok(born.size>=30,`${born.size} targets in a round`);
 }
});
ok('hits: knock-down points by depth, armour takes two, combo and its window, snap, streak fire',()=>{
 assert.equal(C.comboMult(1),1);assert.equal(C.comboMult(3),1.5);assert.equal(C.comboMult(99),PU.comboMax);assert.deepEqual([...C.DEPTH_MULT],[1,1.2,1.5]);
 assert.equal(C.bandOf(6),0);assert.equal(C.bandOf(12),1);assert.equal(C.bandOf(22),2);assert.equal(KIND[K.armour].hp,2);
 // an ace bot: every event adds up to the score, armour reports a first hit, the combo climbs and expires
 const g=C.createPopup({seed:5,arena:2}),s=g.state;let sum=0,r=1,wait=.5,armourHits=0,fire=0,snaps=0,best=0;const shot=new Map();const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
 while(!s.over){wait-=STEP;if(wait<=0&&s.rack>0){const t=s.targets.filter(e=>e.on&&e.st===2&&e.kind!==K.friend&&!(shot.get(e.id)>=e.hp)).sort((a,b)=>b.up-a.up)[0];if(t){shot.set(t.id,(shot.get(t.id)||0)+1);const a=g.aimOf(t,PHONE);g.flick(a.ang,a.power,0,PHONE);wait=.25+rnd()*.05;}}
  g.advance(STEP);g.drain(e=>{sum+=e.type==='over'?e.a+e.b:e.points;if(e.type==='hit'){armourHits++;assert.equal(e.kind,K.armour);assert.equal(e.points,PU.armourPts);}if(e.type==='fire')fire++;
   if(e.type==='knock'){best=Math.max(best,e.a);if(e.b&1)snaps++;const base=KIND[e.kind].pts;assert.ok(e.points>=base,'a knock-down is never worth less than its base');assert.ok(e.points<=base*1.5*PU.comboMax*PU.fireMult+PU.snapPts);}});}
 assert.equal(sum,s.score,'every point is an event');assert.ok(armourHits>=1,'armour took a first hit');assert.ok(fire>=1,'streak fire lit');assert.ok(best>=4&&s.stats.bestCombo===best);assert.ok(snaps===s.stats.snaps);
 assert.ok(s.stats.bestStreak>=PU.fireAt);assert.ok(s.stats.accBonus>0&&s.stats.accBonus<=PU.accBonus);
 // the combo dies when nothing is knocked down inside the window
 const g2=C.createPopup({seed:8,arena:0}),s2=g2.state;while(!s2.stats.knocks){const t=s2.targets.find(e=>e.on&&e.st===2);if(t&&s2.rack>0&&!s2.balls.some(b=>b.on)){const a=g2.aimOf(t,PHONE);g2.flick(a.ang,a.power,0,PHONE);}g2.advance(STEP);}
 assert.equal(s2.combo,1);for(let i=0;i<(PU.comboWin+.1)/STEP;i++)g2.advance(STEP);assert.equal(s2.combo,0);assert.equal(s2.streak,1,'the streak is about wasted flicks, not time');
});
ok('the friendly target: hitting the coach or referee costs the streak and the combo, gives no points, and loses Fair Play',()=>{
 let done=false;for(let seed=1;seed<40&&!done;seed++){const g=C.createPopup({seed,arena:1}),s=g.state;let wait=.4;
  while(!s.over&&!done){wait-=STEP;const fr=s.targets.find(e=>e.on&&e.st===2&&e.kind===K.friend);
   if(fr&&s.streak>=2&&s.rack>0&&wait<=0&&!s.balls.some(b=>b.on)){const a=g.aimOf(fr,PHONE),score=s.score,ev=[];g.drain(()=>{});g.flick(a.ang,a.power,0,PHONE);for(let k=0;k<240&&!s.stats.friends;k++)g.advance(STEP);g.drain(e=>ev.push(e.type));
    if(s.stats.friends){assert.ok(ev.includes('friend'));assert.equal(s.streak,0);assert.equal(s.combo,0);assert.equal(s.score,score,'no points');assert.equal(s.fire,false);done=true;while(!s.over)g.advance(STEP);assert.equal(s.stats.fairBonus,0);}}
   else if(wait<=0&&s.rack>0){const t=s.targets.find(e=>e.on&&e.st===2&&e.kind!==K.friend);if(t){const a=g.aimOf(t,PHONE);g.flick(a.ang,a.power,0,PHONE);wait=.5;}}
   g.advance(STEP);}}
 assert.ok(done,'a coach was hit in some seed');
 // a careful run that saw a friend and left it alone gets the Fair Play bonus
 let fairRuns=0;for(let seed=21;seed<33;seed++){const fair=playBot({seed,arena:seed%ARENAS.length},ACE);if(fair.stats.friendSeen>0&&fair.stats.friends===0){fairRuns++;assert.equal(fair.stats.fairBonus,PU.fairBonus);}else assert.equal(fair.stats.fairBonus,0);}assert.ok(fairRuns>=6,`careful runs earn Fair Play (${fairRuns} of 12)`);
});
ok('multi-ball: the rack, the refill, Triple sends three balls, two knock-downs together are a multi-knock',()=>{
 const g=C.createPopup({seed:4,arena:0}),s=g.state;g.advance(.5);let sent=0;for(let i=0;i<8;i++){sent+=g.flick(0,.5,0,PHONE);g.advance(PU.minGap+STEP);}
 assert.equal(sent,PU.rack+1,'five balls at once, then one refilled during the burst (rapid flicks are allowed)');const ev=[];g.drain(e=>ev.push(e.type));assert.ok(ev.includes('empty'));
 assert.equal(g.flick(0,.5,0,PHONE),0);g.advance(PU.refill*PU.rack+.1);assert.equal(s.rack,PU.rack,'the rack refills');
 g.flick(0,.5,0,PHONE);assert.equal(g.flick(0,.5,0,PHONE),0,'not two flicks in the same instant');
 // Triple and a multi-knock, found by an ace bot across seeds
 let triple=false,multi=false,quick=false;for(let seed=1;seed<30&&!(triple&&multi&&quick);seed++){const r=playBot({seed,arena:seed%ARENAS.length},ACE,{watch:g2=>{const b=g2.state.balls.filter(x=>x.on);if(g2.state.triple>0||b.length>=3)for(const x of b)if(b.filter(y=>y.f===x.f).length===3)triple=true;if(g2.state.quickT>0)quick=true;}});
  if(r.stats.multis>0){multi=true;assert.ok(r.stats.bestMulti>=2);}}
 assert.ok(triple,'a Triple flick put three balls in the air');assert.ok(multi,'a multi-knock happened');assert.ok(quick,'Quick rack was won');
});
ok('determinism, frame-rate independence and the seeded daily',()=>{
 const run=(seed,arena,dt)=>{const g=C.createPopup({seed,arena}),s=g.state;const log=[];let k=0,T=0;while(!s.over){T+=dt;g.advance(dt);g.drain(e=>{if(e.type==='pop')log.push(`${e.kind}@${e.x.toFixed(2)},${e.z.toFixed(2)}`);});if(++k>1e6)break;}return log.join('|');};
 assert.equal(run(77,1,STEP),run(77,1,1/30));assert.equal(run(77,1,STEP),run(77,1,1/47));assert.notEqual(run(77,1,STEP),run(78,1,STEP));
 const a=C.popupDaily('2026-11-21'),b=C.popupDaily('2026-11-21'),c=C.popupDaily('2026-11-22');assert.deepEqual(a,b);assert.notEqual(a.seed,c.seed);assert.ok(a.arena>=0&&a.arena<ARENAS.length);
 const days=new Set();for(let d=1;d<=28;d++)days.add(C.popupDaily(`2026-12-${String(d).padStart(2,'0')}`).arena);assert.equal(days.size,ARENAS.length,'every arena comes up as a Daily Arena');
 assert.equal(C.createPopup({seed:a.seed,arena:a.arena,daily:true}).dur,PU.dailySecs);assert.equal(C.createPopup({seed:1,arena:0}).dur,PU.secs);
 const x=playBot({seed:a.seed,arena:a.arena,daily:true},GOOD,{seed:5}),y=playBot({seed:a.seed,arena:a.arena,daily:true},GOOD,{seed:5});assert.equal(x.score,y.score);
});
ok('arenas: at least four, every one a different camera, every spot and rail on screen on a phone and a desktop, near / mid / far',()=>{
 assert.ok(ARENAS.length>=4);assert.equal(new Set(ARENAS.map(a=>a.id)).size,ARENAS.length);for(const k of ['wide','tall']){assert.equal(new Set(ARENAS.map(a=>a.cam[k].p.join())).size,ARENAS.length,'a different camera each');const heights=ARENAS.map(a=>a.cam[k].p[1]);assert.ok(Math.max(...heights)-Math.min(...heights)>=3,'camera heights differ');}
 for(const a of ARENAS){assert.ok(a.spots.length>=10,`${a.id}: ${a.spots.length} spots`);assert.ok(a.rails.length>=1);
  const bands=new Set(a.spots.map(sp=>C.bandOf(Math.hypot(sp[0]-a.ball[0],sp[2]-a.ball[2]))));assert.equal(bands.size,3,`${a.id}: near, mid and far spots`);
  assert.ok(new Set(a.spots.map(sp=>sp[3])).size>=1);const ys=a.spots.map(sp=>sp[1]);assert.ok(Math.max(...ys)-Math.min(...ys)>=2,`${a.id}: high and low`);
  for(const [name,aspect] of [['phone',PHONE],['desktop',DESK]]){
   const b=proj(a,aspect,...a.ball);if(LAYOUT)console.log(`${a.id} ${name} ball ${b.x.toFixed(2)},${b.y.toFixed(2)}`);
   assert.ok(b.y>.74&&b.y<.93&&Math.abs(b.x-aspect/2)<aspect*.3,`${a.id} ${name}: the ball rests low on the screen (${b.x.toFixed(2)},${b.y.toFixed(2)})`);
   a.spots.forEach((sp,i)=>{const p=proj(a,aspect,sp[0],sp[1]+KIND[1].h*sp[4]*.55,sp[2]),top=proj(a,aspect,sp[0],sp[1]+KIND[1].h*sp[4],sp[2]);
    if(LAYOUT)console.log(`  spot ${i} ${p.x.toFixed(2)},${p.y.toFixed(2)} top ${top.y.toFixed(2)} size ${(KIND[1].h*sp[4]/(p.z*tanOf(a,aspect))/2).toFixed(3)}`);
    assert.ok(p.z>4,`${a.id} spot ${i} in front`);assert.ok(p.x>.05*aspect+.02&&p.x<aspect-.05*aspect-.02,`${a.id} ${name} spot ${i} x ${p.x.toFixed(2)} of ${aspect.toFixed(2)}`);assert.ok(top.y>.1&&p.y<b.y-.08,`${a.id} ${name} spot ${i} y ${p.y.toFixed(2)} top ${top.y.toFixed(2)}`);
    const size=KIND[1].h*sp[4]/(p.z*tanOf(a,aspect))/2;assert.ok(size>(aspect<1?.05:.06),`${a.id} ${name} spot ${i}: a target is big enough to see (${size.toFixed(3)} of the screen height)`);});
   for(const r of a.rails){const m=proj(a,aspect,(r[0]+r[1])/2,r[2]+.8*r[4],r[3]);if(LAYOUT)console.log(`  rail mid ${m.x.toFixed(2)},${m.y.toFixed(2)}`);assert.ok(m.x>.1*aspect&&m.x<.9*aspect&&m.y>.1&&m.y<b.y-.05,`${a.id} ${name} rail`);}}
  // a spot is never inside a solid box when out (its centre is in the open) and no two spots overlap
  a.spots.forEach((sp,i)=>{const cx=sp[0],cyy=sp[1]+KIND[1].h*sp[4]*.55,cz=sp[2];for(const q of a.boxes)assert.ok(!(Math.abs(cx-q[0])<q[3]/2&&Math.abs(cz-q[2])<q[5]/2&&cyy>q[1]&&cyy<q[1]+q[4]),`${a.id} spot ${i} centre inside ${q[7]}`);
   a.spots.forEach((o,j)=>{if(j>i)assert.ok(Math.hypot(sp[0]-o[0],sp[1]-o[1],sp[2]-o[2])>1.2,`${a.id} spots ${i},${j} overlap`);});});
 }
});
ok('bots: a first-time child scores, better players score more, medals and the board ceiling sit on bot data',()=>{
 const avg=(skill,daily)=>{let sum=0,max=0,acc=0,fr=0,n=0;for(let ai=0;ai<ARENAS.length;ai++)for(let k=0;k<4;k++){const r=playBot({seed:100+k*7+ai,arena:ai,daily},skill,{seed:k+1});sum+=r.score;max=Math.max(max,r.score);acc+=r.stats.flicks?r.stats.hits/r.stats.flicks:0;fr+=r.stats.friends;n++;}return {avg:Math.round(sum/n),max,acc:acc/n,fr:fr/n};};
 const kid=avg(KID),good=avg(GOOD),ace=avg(ACE),aceDaily=avg(ACE,true);
 if(BOTS){console.log('   kid',kid,'\n   good',good,'\n   ace',ace,'\n   ace daily',aceDaily);for(let ai=0;ai<ARENAS.length;ai++){let k=0,g2=0;for(let i=0;i<4;i++){k+=playBot({seed:50+i,arena:ai},KID,{seed:i+1}).score;g2+=playBot({seed:50+i,arena:ai},GOOD,{seed:i+1}).score;}console.log(`   ${ARENAS[ai].id}: kid ${Math.round(k/4)} good ${Math.round(g2/4)}`);}}
 assert.ok(kid.avg>=1200,`a child scores (${kid.avg})`);assert.ok(good.avg>kid.avg*1.6&&ace.avg>good.avg*1.2,`skill shows: ${kid.avg} < ${good.avg} < ${ace.avg}`);
 assert.ok(kid.avg>=PU.medals[0]*.5&&kid.avg<PU.medals[1],`bronze is in a child's reach (${kid.avg} vs ${PU.medals[0]})`);assert.ok(good.avg>=PU.medals[1]*.7&&good.avg<PU.medals[2]*1.3,`silver/gold sit around a good player (${good.avg})`);assert.ok(ace.max>=PU.medals[2],'gold can be won');
 const L=require('../lib/arcade/leaderboard.ts'),rule=L.BOARD_RULES.popup;assert.ok(rule.max>=aceDaily.max*1.3,`the board ceiling ${rule.max} clears the best bot ${aceDaily.max}`);assert.ok(rule.max<=aceDaily.max*4);
 assert.ok(rule.base+rule.perSecond*PU.secs>=ace.max,'the board rate allows an ace round');assert.ok(rule.minSeconds<=PU.secs-5);
 assert.equal(C.popupCoins(1499),0);assert.equal(C.popupCoins(5400),3);
});
ok('device save: best, medal, daily claim and day streak, tips tied to the run, bad data',()=>{
 const st={flicks:40,hits:30,wasted:10,knocks:28,friends:0,friendSeen:2,snaps:5,multis:1,bestMulti:2,bestCombo:6,bestStreak:9,far:6,escaped:8,powers:1,accBonus:450,fairBonus:400};
 let sv=S.emptyPopupSave();let r=S.settlePopup(sv,{score:3000,daily:false,day:'2026-11-21',arena:'plaza',stats:st});assert.ok(r.newBest);assert.equal(r.save.best,3000);assert.equal(r.medal,1);assert.equal(r.save.plays,1);assert.equal(r.save.arenas.plaza,3000);
 r=S.settlePopup(r.save,{score:2000,daily:false,day:'2026-11-21',arena:'plaza',stats:st});assert.ok(!r.newBest);assert.equal(r.save.best,3000);
 r=S.settlePopup(r.save,{score:7000,daily:true,day:'2026-11-21',arena:'beach',stats:st});assert.ok(r.dailyFirst);assert.equal(r.save.daily.best,7000);assert.equal(r.save.best,7000,'one best: the daily counts too (one board)');assert.equal(r.streak,1);
 const r2=S.settlePopup(r.save,{score:100,daily:true,day:'2026-11-21',arena:'beach',stats:st});assert.ok(!r2.dailyFirst);assert.equal(r2.save.daily.best,7000);
 const r3=S.settlePopup(r2.save,{score:100,daily:true,day:'2026-11-22',arena:'stands',stats:st});assert.equal(r3.streak,2);assert.equal(S.liveStreak(r3.save,'2026-11-24'),0);
 assert.deepEqual(S.sanitizePopupSave('x'),S.emptyPopupSave());assert.equal(S.sanitizePopupSave({best:-5,medal:99,daily:{day:'nope',best:1e12}}).best,0);assert.equal(S.sanitizePopupSave({medal:99}).medal,3);
 // the tip is about what happened
 assert.match(S.tipFor({...st,friends:2}).line,/coach|referee/i);assert.match(S.tipFor({...st,flicks:40,hits:12}).title,/target/i);assert.match(S.tipFor({...st,escaped:30,knocks:10}).title,/look|scan/i);
 assert.ok(S.tipFor(st).line.length>20);assert.ok(S.nearMissLine({score:2300,best:0,newBest:true,stats:st}).length>5);
 for(const t of S.POPUP_TIPS)assert.ok(t.line.length<=170&&!/—/.test(t.line+t.title));
});
ok('wiring: unplaced (URL only), the board, coins, analytics ids, last score, save snapshot, the SQL, heat rules in the view',()=>{
 const cat=read('lib/arcade/arcadeCatalog.ts');assert.match(cat,/arcadeUnplaced=\[\s*\{id:'popup'/);assert.ok(!/arcadeCabinets=[\s\S]*?id:'popup'[\s\S]*?\] as const/.test(cat.split('arcadeUnplaced')[0]),'not in the room yet');
 const L=require('../lib/arcade/leaderboard.ts');assert.ok(L.BOARD_GAMES.includes('popup'));assert.ok(!L.HALL_MACHINES.includes('popup'),'not in the hall until it has a machine');assert.equal(L.BOARD_RULES.popup.unit,'points');
 assert.match(read('lib/arcade/arcadeWalletCore.ts'),/game==='popup'\)value=Math\.floor\(n\(s\.points\)\/1500\)/);assert.match(read('lib/economy.ts'),/popup:12/);
 assert.match(read('lib/analytics/islandIds.ts'),/'arcade_popup'/);assert.match(read('lib/analytics/countIds.ts'),/ENGAGE_ARCADE_GAMES=\[[^\]]*'popup'/);
 assert.match(read('lib/arcade/lastScore.ts'),/'popup'/);assert.match(read('lib/saves/snapshot.ts'),/fi2-popup-v1/);assert.equal(S.POPUP_KEY,'fi2-popup-v1');
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/import\('\.\/games\/PopUpGame'\)/);assert.match(room,/game==='popup'\?<PopUp onExit=\{back\}\/>/);
 const sql=read('docs/arcade-aaa/popup-supabase.sql');for(const id of L.BOARD_GAMES)assert.ok(sql.includes(`'${id}'`),`SQL keeps board ${id}`);assert.match(sql,/'arcade_popup'/);assert.match(sql,/'arcade_holdtheline'/);assert.ok(!/drop table|delete from|truncate/i.test(sql),'additive');
 const shell=read('components/games/PopUpGame.tsx');assert.match(shell,/useArcadeEntry\('popup'\)/);assert.match(shell,/creditRun\(r\.id,'popup'/);assert.match(shell,/saveArcadeRecord\('popup'/);assert.match(shell,/beginBoardSession\('popup'\)/);assert.match(shell,/HighScoreEntry game="popup"/);
 assert.match(shell,/document\.hidden\)pause\(\)/);assert.match(shell,/frameCapSlot/);assert.ok(!/IslandBrush/.test(read('components/games/PopUpGame.module.css')),'no brush font on buttons');
 const view=read('lib/arcade/popup/view.ts');assert.match(view,/powerPreference:'low-power'/);assert.match(view,/Math\.min\(o\.mobile\?1\.5:2,dpr\)/);assert.ok(!/shadowMap\.enabled=true/.test(view),'blob shadows, no shadow maps');assert.ok(!/EffectComposer/.test(view));
 assert.ok((view.match(/new T\.DirectionalLight/g)||[]).length===1,'one sun');assert.match(view,/InstancedMesh/);assert.match(view,/forceContextLoss/);
 const audio=read('lib/arcade/popup/audio.ts');assert.match(audio,/createDynamicsCompressor/);assert.match(audio,/isSoundEnabled/);
});
console.log(`popup-core: ${n} checks passed`);
