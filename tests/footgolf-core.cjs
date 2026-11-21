// FootGolf Island (Nov 21 2026, docs/arcade-aaa/footgolf-direction.md): real footgolf in 3D. The kicks (shot mapping), the ball's
// flight (drag, wind, Magnus curl, backspin lift), bounce and roll on slopes and surfaces, the cup (drops, lip-outs, hops, rim), water
// and out of bounds, par and points, the seeded Daily Hole, a bot round of all nine holes, the device save, the wiring (unplaced: by
// link only) and the sound graph.
//   node tests/footgolf-core.cjs [--bots]   (--bots prints the bot round the board rate comes from)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/footgolf/core.ts'),SV=require('../lib/arcade/footgolf/save.ts'),{FG,S,HOLES}=C,BOTS=process.argv.includes('--bots');
const read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{try{fn();}catch(e){console.error('FAIL '+name);throw e;}n++;};
/** A flat lab: a hole whose heights are all `y` and whose surfaces are what we set. */
const lab=(ix=2,tilt=[0,0])=>{const H=C.buildHole(ix);const W=H.nx+1;for(let j=0;j<=H.nz;j++)for(let i=0;i<=H.nx;i++){const x=H.x0+i*H.cs,z=H.z0+j*H.cs;H.h[j*W+i]=2+tilt[0]*x+tilt[1]*z;}H.nw=0;H.np=0;H.nt=0;H.wind=[0,0];H.cupY=C.heightAt(H,H.cup[0],H.cup[1]);return H;};
const shoot=(H,shot,lie=S.fairway,from=[0,0],max=8000)=>{const b=C.newBall();b.x=from[0];b.z=from[1];b.y=C.heightAt(H,b.x,b.z)+FG.R;C.launch(b,shot,lie);const mem={trees:0,over:true,edge:-1e9},ev=[];let carry=null,maxY=0;
 for(let i=0;i<max&&!b.rest;i++){const h=C.ballStep(H,b,FG.step,mem);if(b.y>maxY)maxY=b.y;if(h){ev.push(h.type);if(carry===null&&(h.type==='bounce'||h.type==='roll'||h.type==='plug'))carry=Math.hypot(b.x-from[0],b.z-from[1]);if(['water','oob','cup','air-cup','rim'].includes(h.type))break;}}return {b,ev,carry,maxY};};
const roll=(H,x,z,vx,vz,max=6000,overInit=false)=>{const b=C.newBall();b.x=x;b.z=z;b.y=C.heightAt(H,x,z)+FG.R;b.vx=vx;b.vz=vz;b.rest=false;b.air=false;const mem={trees:0,over:overInit,edge:0},ev=[];for(let i=0;i<max&&!b.rest;i++){const h=C.ballStep(H,b,FG.step,mem);if(h){ev.push(h.type);if(['water','oob','cup','rim'].includes(h.type))break;}}return {b,ev};};

ok('nine holes round the island, par 34, each one real terrain under 6k triangles with its tee on the tee and its cup on the green',()=>{
 assert.equal(HOLES.length,9);assert.equal(C.COURSE_PAR,34);assert.deepEqual(HOLES.map(h=>h.par),[3,3,4,4,4,3,3,5,5]);
 for(let i=0;i<9;i++){const H=C.buildHole(i);assert.ok(H.nx*H.nz*2<=6000,`${H.def.id} terrain ${H.nx*H.nz*2} triangles`);assert.equal(C.surfaceAt(H,H.def.tee[0],H.def.tee[1]),S.tee);
  for(const c of [0,1,2]){const h=C.buildHole(i,{cup:c});assert.equal(C.surfaceAt(h,h.cup[0],h.cup[1]),S.green,`${h.def.id} cup ${c} on the green`);}
  let lo=1e9,hi=-1e9;for(const v of H.h){lo=Math.min(lo,v);hi=Math.max(hi,v);}assert.ok(hi-lo>.8,`${H.def.id} is not flat (${(hi-lo).toFixed(2)} m of relief)`);
  assert.ok(H.metres>=45&&H.metres<=145,`${H.def.id} ${H.metres} m`);}
 // the green tilts so kids can read it: every green has a slope, the museum's is the steepest
 const tilt=i=>Math.hypot(HOLES[i].green.tx,HOLES[i].green.tz);assert.ok(HOLES.every((_,i)=>tilt(i)>=.02));assert.equal(HOLES.map((_,i)=>tilt(i)).indexOf(Math.max(...HOLES.map((_,i)=>tilt(i)))),5);
 // water where the doc puts it: the sea at the jetty, the island green, the river at the boardwalk and the moat at the stadium
 const wet=(i,x,z)=>C.surfaceAt(C.buildHole(i),x,z)===S.water;assert.ok(wet(0,-30,-30)&&wet(0,30,-30));assert.ok(wet(6,2,-28));assert.ok(wet(4,20,-48));assert.ok(wet(8,20,-104));assert.equal(C.surfaceAt(C.buildHole(4),-12,-48),S.wood,'the bridge is wood, not water');
});

ok('the four kicks: laces go far and low-ish, the chip goes up and stops, the pass skims, the putt rolls; power and the lie set the pace',()=>{
 const H=lab(),far=k=>shoot(H,{kind:k,power:1,yaw:0,curl:0});
 const L=far('long'),Ch=far('chip'),Pa=far('pass'),Pu=far('putt');
 assert.ok(L.carry>32&&L.carry<48,`long carry ${L.carry}`);assert.ok(-L.b.z>48&&-L.b.z<70,`long total ${-L.b.z}`);
 assert.ok(Ch.maxY-2>Ch.carry*.25,'a chip flies high for its length');assert.ok(-Ch.b.z-Ch.carry<Ch.carry*.45,'a chip does not run far after landing');
 assert.ok(Pa.maxY-2<.6,'a pass stays low');assert.ok(-Pa.b.z>26&&-Pa.b.z<42,`pass ${-Pa.b.z}`);
 assert.equal(Pu.ev.includes('bounce'),false,'a putt never leaves the ground');assert.ok(-Pu.b.z>9&&-Pu.b.z<18,`putt ${-Pu.b.z}`);
 const half=shoot(H,{kind:'pass',power:.5,yaw:0,curl:0});assert.ok(-half.b.z<-Pa.b.z*.65,'half power goes much less far');
 const rough=shoot(H,{kind:'long',power:1,yaw:0,curl:0},S.rough),sand=shoot(H,{kind:'long',power:1,yaw:0,curl:0},S.sand);assert.ok(-rough.b.z<-L.b.z&&-sand.b.z<-rough.b.z*.8,'rough and sand take pace off the kick');
 const yawed=shoot(H,{kind:'pass',power:.6,yaw:Math.PI/2,curl:0});assert.ok(yawed.b.x>10&&Math.abs(yawed.b.z)<1,'yaw pi/2 kicks to +x');
 assert.deepEqual(C.KICK_ORDER,['long','chip','pass','putt']);assert.equal(C.KICKS.long.foot,'Laces');assert.equal(C.KICKS.putt.foot,'Inside of the foot');
});

ok('flight: drag shortens a kick, wind moves a high ball more than a low one, curl bends it, backspin lifts it',()=>{
 const H=lab(),k={kind:'long',power:1,yaw:0,curl:0};const base=shoot(H,k);
 const vac=C.newBall();C.launch(vac,k,S.fairway);const v=Math.hypot(vac.vx,vac.vy,vac.vz),noDrag=v*v*Math.sin(2*27*Math.PI/180)/FG.g;assert.ok(base.carry<noDrag*.9,`drag: ${base.carry} vs ${noDrag} in a vacuum`);
 H.wind=[4,0];const chipW=shoot(H,{kind:'chip',power:.8,yaw:0,curl:0}),passW=shoot(H,{kind:'pass',power:.8,yaw:0,curl:0});H.wind=[0,0];
 const chip0=shoot(H,{kind:'chip',power:.8,yaw:0,curl:0}),pass0=shoot(H,{kind:'pass',power:.8,yaw:0,curl:0});
 assert.ok(chipW.b.x-chip0.b.x>.8,`a cross wind moves a chip (${(chipW.b.x-chip0.b.x).toFixed(2)} m)`);assert.ok(Math.abs(passW.b.x-pass0.b.x)<(chipW.b.x-chip0.b.x)*.5,'and moves a ground pass much less');
 H.wind=[0,4];const tail=shoot(H,k);H.wind=[0,-4];const head=shoot(H,k);H.wind=[0,0];assert.ok(head.carry>base.carry&&tail.carry<base.carry,'a head wind (blowing toward -z, the way we kick) carries it further, a wind in the face holds it up');
 const right=shoot(H,{...k,curl:2}),left=shoot(H,{...k,curl:-2});assert.ok(right.b.x>2&&left.b.x<-2,`curl bends it (${right.b.x.toFixed(1)}, ${left.b.x.toFixed(1)})`);
 const noBack=C.newBall();C.launch(noBack,{kind:'chip',power:1,yaw:0,curl:0},S.fairway);noBack.wx=0;noBack.wz=0;const withBack=C.newBall();C.launch(withBack,{kind:'chip',power:1,yaw:0,curl:0},S.fairway);
 let mA=0,mB=0;const H2=lab();for(let i=0;i<300;i++){C.ballStep(H2,noBack,FG.step,{trees:0,over:true,edge:0});C.ballStep(H2,withBack,FG.step,{trees:0,over:true,edge:0});mA=Math.max(mA,noBack.y);mB=Math.max(mB,withBack.y);}assert.ok(mB>mA+.15,'backspin lifts the chip');
});

ok('bounce: each surface its own, the slope throws the ball, backspin checks it, sand plugs',()=>{
 const H=lab(),drop=(lie,vx=8)=>{const b=C.newBall();b.x=0;b.z=0;b.y=C.heightAt(H,0,0)+FG.R+.001;b.vx=0;b.vz=-vx;b.vy=-9;b.air=true;b.rest=false;return b;};
 // the surface under a bounce: put the lab's cup area aside and test with real holes' surfaces via SURF
 assert.ok(C.SURF[S.stone].e>C.SURF[S.fairway].e&&C.SURF[S.fairway].e>C.SURF[S.green].e&&C.SURF[S.green].e>C.SURF[S.rough].e&&C.SURF[S.rough].e>C.SURF[S.sand].e,'stone bounces most, sand least');
 const b=drop();const h=C.ballStep(H,b,FG.step,{trees:0,over:true,edge:0});assert.ok(h&&(h.type==='bounce'||h.type==='roll'));assert.ok(b.vy>0&&b.vy<9*.6,'it comes back up with less pace');
 // the slope throws the ball: a vertical drop on a hill bounces downhill
 const Hs=lab(2,[.3,0]),s=C.newBall();s.x=0;s.z=0;s.y=C.heightAt(Hs,0,0)+FG.R;s.vy=-8;s.air=true;s.rest=false;C.ballStep(Hs,s,FG.step,{trees:0,over:true,edge:0});assert.ok(s.vx<-.5,`a slope rising to +x throws it to -x (${s.vx.toFixed(2)})`);
 // backspin: the same landing, with and without spin
 const run=w=>{const q=C.newBall();q.x=0;q.z=0;q.y=C.heightAt(H,0,0)+FG.R;q.vx=0;q.vz=-9;q.vy=-8;q.wx=w;q.air=true;q.rest=false;C.ballStep(H,q,FG.step,{trees:0,over:true,edge:0});return -q.vz;};
 assert.ok(run(40)<run(0)-1,`backspin (wx>0 for a ball going to -z, as launch() sets it) checks it: ${run(40).toFixed(2)} vs ${run(0).toFixed(2)}`);
 // sand plugs a hard landing: a real bunker
 const B=C.buildHole(1);const [sx,sz]=[11,-30];const p=C.newBall();p.x=sx;p.z=sz;p.y=C.heightAt(B,sx,sz)+FG.R;p.vy=-9;p.vz=-3;p.air=true;p.rest=false;const hp=C.ballStep(B,p,FG.step,{trees:0,over:true,edge:0});assert.equal(hp&&hp.type,'plug');
});

ok('roll: gravity down the slope against the grass; a ball only stops where the grass can hold it',()=>{
 const flat=lab(),down=lab(2,[0,.04]),up=lab(2,[0,-.04]);// z grows toward the tee: [0,.04] rises toward +z, so rolling to -z is downhill
 const d0=-roll(flat,0,0,0,-4).b.z,dDown=-roll(down,0,0,0,-4).b.z,dUp=-roll(up,0,0,0,-4).b.z;assert.ok(dDown>d0*1.15&&dUp<d0*.87,`downhill ${dDown.toFixed(1)} > flat ${d0.toFixed(1)} > uphill ${dUp.toFixed(1)}`);
 // a ball put down at rest on a slope steeper than the grass holds starts rolling; on a gentle one it stays
 const steep=lab(2,[.3,0]),still=roll(steep,0,-40,0,0,600);assert.ok(still.b.x<-.5,'a steep bank rolls the ball away');
 const gentle=lab(2,[.05,0]),stays=roll(gentle,0,-40,0,0,600);assert.ok(Math.abs(stays.b.x)<.05&&stays.b.rest,'rough holds it on a gentle slope');
 // a putt across a tilted green breaks downhill
 const G=lab(2,[.04,0]),br=roll(G,0,0,0,-3);assert.ok(br.b.x<-.3,`the putt breaks downhill (${br.b.x.toFixed(2)} m)`);
 // stone runs further than rough
 const P=C.buildHole(2);const st=roll(P,7,-10,0,-5),rf=roll(P,24,-10,0,-5);assert.ok(-(st.b.z+10)>2*-(rf.b.z+10),'the stone path runs, the rough drags');
 // tree canopy kills a ball, walls bank it
 const T=lab();T.nt=1;T.trees=new Float32Array([0,-20,1,0]);const t=shoot(T,{kind:'long',power:.55,yaw:0,curl:0});assert.ok(t.ev.includes('leaves'));
 const Wl=lab();Wl.nw=1;Wl.walls=new Float32Array([-5,-8,5,-8,1.1,0]);const w=roll(Wl,0,0,0,-10);assert.ok(w.ev.includes('wall')&&w.b.z>-8,'the wall sends it back');
});

ok('the cup: slow drops, a bit quick on the edge lips out, much too quick hops, a dying ball on the rim falls in',()=>{
 assert.ok(Math.abs(C.cupMaxSpeed(0)-2*FG.cupR/FG.dropT)<1e-9);assert.ok(C.cupMaxSpeed(.2)<C.cupMaxSpeed(0));assert.equal(C.cupMaxSpeed(FG.cupR),0);
 assert.equal(C.cupResult(0,FG.cupR,0,-2),'drop');assert.equal(C.cupResult(0,FG.cupR,0,-3.5),'lip');assert.equal(C.cupResult(0,FG.cupR,0,-9),'hop');assert.equal(C.cupResult(.22,FG.cupR,0,-2),'lip','on the edge, the same pace lips out');
 const H=lab(),[cx,cz]=H.cup,at=(v,off=0)=>roll(H,cx+off,cz+1,0,-v,4000).ev;
 const toCup=v=>Math.sqrt(v*v);void toCup;
 assert.ok(at(2.2).includes('cup'),'a putt dying at the cup drops');
 const lipped=at(4.6,.2);assert.ok(lipped.includes('lip'),`quick on the edge lips out (${lipped.join(',')})`);
 const hop=at(11);assert.ok(hop.includes('hop')&&!hop.includes('cup'),'much too quick hops the hole');
 const rim=roll(H,cx+FG.cupR+.03,cz+.6,0,-1.08,4000);assert.ok(rim.ev.includes('rim')||rim.ev.includes('cup'),`a dying ball over the rim falls in (${rim.ev.join(',')})`);
 const parked=roll(H,cx+.05,cz,0,0,100);assert.ok(parked.ev.includes('cup'),'a ball can never rest on the cup');
 // flying straight in
 const g=C.createFootGolf({mode:'hole',seed:2,hole:0});const s=g.state,b=s.ball;b.x=s.hole.cup[0];b.z=s.hole.cup[1]+.45;b.y=s.hole.cupY+FG.R+.5;b.vy=-1;b.vz=-1.6;b.air=true;b.rest=false;s.phase='fly';s.kicks=2;let ev=[];for(let i=0;i<200&&s.phase==='fly';i++){g.step();g.drain(e=>ev.push(e.type));}
 assert.ok(ev.includes('cup')&&s.results[0].air,'flown in');assert.equal(s.results[0].points,500+FG.kickPts+FG.airPts,'birdie + flown in');
});

ok('water and out of bounds: one penalty kick and a drop where it was kicked from',()=>{
 const g=C.createFootGolf({mode:'hole',seed:4,hole:0}),s=g.state,ev=[];g.kick({kind:'long',power:1,yaw:1,curl:0});for(let i=0;i<3000&&s.phase!=='aim';i++){g.step();g.drain(e=>ev.push(e.type));}
 assert.ok(ev.includes('splash'),'into the sea');assert.equal(s.kicks,2,'the kick and one penalty');assert.ok(Math.hypot(s.ball.x-s.hole.def.tee[0],s.ball.z-s.hole.def.tee[1])<.01,'back on the tee');assert.equal(s.stats.splash,1);
 const tip=C.tipFor({...s.results[0]??{hole:'jetty',ix:0,par:3,kicks:4,points:300,holed:true,air:false,longPutt:false,from:0},stats:s.stats});assert.equal(tip.title,'Pick a safe target');
 const g2=C.createFootGolf({mode:'hole',seed:4,hole:2}),s2=g2.state,e2=[];g2.kick({kind:'long',power:1,yaw:Math.PI/2,curl:0});for(let i=0;i<3000&&s2.phase!=='aim';i++){g2.step();g2.drain(e=>e2.push(e.type));}assert.ok(e2.includes('oob'),'off the course is out');assert.equal(s2.kicks,2);
});

ok('par and points: 500 at par, 200 a kick either side, 50 at worst, 0 for a pick-up; +300 flown in, +100 from 8 m; eight kicks then pick up',()=>{
 assert.equal(C.holePoints(3,3,false,false),500);assert.equal(C.holePoints(2,3,false,false),700);assert.equal(C.holePoints(1,3,true,false),1200);assert.equal(C.holePoints(4,3,false,false),300);assert.equal(C.holePoints(8,3,false,false),50);assert.equal(C.holePoints(9,3,false,false),0);assert.equal(C.holePoints(4,4,false,true),600);
 assert.deepEqual([C.scoreName(1,3),C.scoreName(2,4),C.scoreName(3,4),C.scoreName(4,4),C.scoreName(5,4),C.scoreName(6,4),C.scoreName(9,4)],['Ace!','Eagle!','Birdie!','Par','Bogey','Double bogey','Pick up']);
 const g=C.createFootGolf({mode:'hole',seed:8,hole:3}),s=g.state,ev=[];for(let k=0;k<8;k++){g.kick({kind:'putt',power:.05,yaw:0,curl:0});for(let i=0;i<2000&&s.phase!=='aim'&&s.phase!=='done';i++){g.step();g.drain(e=>ev.push(e.type));}}
 assert.equal(s.phase,'done');assert.ok(ev.includes('pickup'));assert.equal(s.results[0].kicks,9);assert.equal(s.results[0].points,0);assert.equal(s.results[0].holed,false);assert.equal(g.kick({kind:'putt',power:.5,yaw:0,curl:0}),false,'no kick after the hole');
});

ok('the Daily Hole: one seeded hole a day, the same on every device, different days differ',()=>{
 const a=C.footgolfDaily('2026-11-21'),b=C.footgolfDaily('2026-11-21');assert.deepEqual(a,b);const days=['2026-11-22','2026-11-23','2026-11-24','2026-11-25','2026-11-26'].map(C.footgolfDaily);assert.ok(new Set(days.map(d=>d.hole+':'+d.cup)).size>=3);
 const g1=C.createFootGolf({mode:'daily',seed:1,day:'2026-11-21'}),g2=C.createFootGolf({mode:'daily',seed:999,day:'2026-11-21'});assert.deepEqual(g1.state.hole.cup,g2.state.hole.cup);assert.deepEqual(g1.state.hole.wind,g2.state.hole.wind,'the random seed does not change the daily');
 assert.equal(g1.state.order.length,1);assert.equal(g1.state.hole.ix,a.hole);
});

ok('a bot plays all nine holes: every hole can be finished, the round is near par, the course posts points',()=>{
 const turn=gm=>{const s=gm.state,b=s.ball,H=s.hole,kind=C.suggestKick(s),yaw=C.startYaw(s),cd=gm.cupDist();let tx=H.cup[0],tz=H.cup[1],r=H.route;
  if(cd>48)for(let i=2;i<r.length-2;i+=2){const d=Math.hypot(r[i]-b.x,r[i+1]-b.z),tc=Math.hypot(r[i]-H.cup[0],r[i+1]-H.cup[1]);if(tc<cd-6&&d>12){tx=r[i];tz=r[i+1];break;}}
  const target=Math.hypot(tx-b.x,tz-b.z),dist=kind==='putt'||kind==='pass'?target+.35:target+(kind==='long'?4+s.stats.splash*5:0);/* a long kick aims past the turn, and further after a splash (a player learns) */return {kind,power:C.powerFor(H,kind,dist,s.lie,yaw,{x:b.x,z:b.z}),yaw,curl:0};};
 const g=C.createFootGolf({mode:'course',seed:5});let guard=0;
 while(!(g.state.phase==='done'&&g.state.over)&&guard++<400000){const s=g.state;if(s.phase==='aim')g.kick(turn(g));else if(s.phase==='done'){assert.ok(g.next());continue;}g.step();g.drain(()=>{});}
 const s=g.state,kicks=s.results.reduce((a,r)=>a+r.kicks,0);assert.equal(s.results.length,9);assert.ok(s.results.every(r=>r.holed),`every hole holed (${s.results.map(r=>r.kicks).join(' ')})`);
 assert.ok(kicks<=C.COURSE_PAR+6,`about par: ${kicks}`);assert.ok(s.total>3000&&s.total<=require('../lib/arcade/leaderboard.ts').BOARD_RULES.footgolf.max,`${s.total} points`);
 if(BOTS)console.log(`  bot round: ${kicks} kicks (par ${C.COURSE_PAR}), ${s.total} points; ${s.results.map(r=>`${r.hole} ${r.kicks}`).join(', ')}`);
 assert.equal(g.next(),false,'nothing after the ninth');
});

ok('the preview: the real physics, cut to the hole\'s share (full on 1-3, 60% on 4-6, 35% on 7-9); no allocation',()=>{
 assert.deepEqual(HOLES.map(h=>h.preview),[1,1,1,.6,.6,.6,.35,.35,.35]);
 const g=C.createFootGolf({mode:'hole',seed:1,hole:0}),buf=new Float32Array(270),shot={kind:'long',power:.8,yaw:0,curl:0},full=C.predict(g.state,shot,buf,1),part=C.predict(g.state,shot,buf,.35);
 assert.ok(full>10&&part<full*.5);const endZ=buf[(full-1)*3+2];void endZ;const b0={...g.state.ball};C.predict(g.state,shot,buf,1);assert.deepEqual({...g.state.ball},b0,'the preview never moves the ball');
 assert.equal(C.suggestKick(g.state),'long');g.state.ball.x=g.state.hole.cup[0]+3;g.state.ball.z=g.state.hole.cup[1];g.state.lie=S.green;assert.equal(C.suggestKick(g.state),'putt');g.state.lie=S.sand;assert.equal(C.suggestKick(g.state),'chip');
});

ok('the tip after a hole comes from what happened',()=>{
 const base={hole:'farm',ix:3,par:4,kicks:5,points:300,holed:true,air:false,longPutt:false,from:2},st=o=>({splash:0,oob:0,sand:0,rough:0,lip:0,putts:0,long:1,chip:0,pass:0,short:0,past:0,leaves:0,wall:0,check:0,onGreenIn:0,...o});
 assert.equal(C.tipFor({...base,stats:st({sand:1})}).title,'Chip or drive');assert.equal(C.tipFor({...base,stats:st({lip:1})}).title,'Weight of pass');assert.equal(C.tipFor({...base,stats:st({short:2})}).title,'Weight of pass');
 assert.equal(C.tipFor({...base,stats:st({past:1,putts:2})}).title,'Read the ground');assert.equal(C.tipFor({...base,kicks:4,stats:st({})}).title,'Laces or inside of the foot');assert.equal(C.tipFor({...base,stats:st({check:1})}).title,'Chip or drive');
});

ok('device save: best round, fewest kicks, best per hole, daily and streak; junk is cleaned',()=>{
 const r=(ix,kicks,holed=true)=>({hole:HOLES[ix].id,ix,par:HOLES[ix].par,kicks,points:C.holePoints(kicks,HOLES[ix].par,false,false),holed,air:false,longPutt:false,from:1,stats:{}});
 let s=SV.emptyFootgolfSave();const course=HOLES.map((h,i)=>r(i,h.par));let t=SV.settleFootgolf(s,{mode:'course',day:'2026-11-21',total:4500,results:course,complete:true});
 assert.equal(t.save.best,4500);assert.equal(t.save.bestKicks,34);assert.deepEqual(t.save.holes,HOLES.map(h=>h.par));assert.ok(t.newBest);
 t=SV.settleFootgolf(t.save,{mode:'course',day:'2026-11-21',total:3000,results:course.slice(0,4),complete:false});assert.equal(t.save.best,4500,'a round left early never posts');
 t=SV.settleFootgolf(t.save,{mode:'hole',day:'2026-11-21',total:700,results:[r(0,2)],complete:true});assert.equal(t.save.holes[0],2);assert.ok(t.newBest);assert.equal(t.save.birdies,1);
 t=SV.settleFootgolf(t.save,{mode:'daily',day:'2026-11-21',total:500,results:[r(3,4)],complete:true});t=SV.settleFootgolf(t.save,{mode:'daily',day:'2026-11-22',total:700,results:[r(3,3)],complete:true});
 assert.equal(t.save.streak.n,2);assert.equal(t.dailyBest,700);assert.equal(t.save.daily.kicks,3);assert.equal(SV.liveStreak(t.save,'2026-11-24'),0);
 const junk=SV.sanitizeFootgolfSave({best:-5,holes:['x',99,3],daily:{day:'nope',best:1e12},streak:7});assert.equal(junk.best,0);assert.deepEqual(junk.holes.slice(0,3),[0,8,3]);assert.equal(junk.daily.day,'');assert.equal(junk.daily.best,FG.scoreMax);
 assert.equal(SV.FOOTGOLF_KEY,'fi2-footgolf-v1');
});

ok('wiring: a machine on the west wall (Nov 22 2026) with one all-time board, earns coins, never charges',()=>{
 {const A=require('../lib/arcade/arcadeCatalog.ts'),c=A.arcadeCabinets.find(c=>c.id==='footgolf');assert.ok(c&&c.x===-13.8&&c.z===4.4&&Math.abs(c.yaw-Math.PI/3)<1e-9,'on the west wall');assert.equal(A.arcadeUnplaced.length,0);}
 assert.match(read('components/ArcadeRoom.tsx'),/footgolf:\(\)=>import\('\.\/games\/FootGolfGame'\)/);assert.match(read('components/ArcadeRoom.tsx'),/game==='footgolf'\?<FootGolf onExit=\{back\}\/>/);
 const lb=read('lib/arcade/leaderboard.ts');assert.match(lb,/'holdtheline','footgolf','flickit','popup'\] as const;/);assert.match(lb,/ footgolf:\{name:'FootGolf Island',unit:'points',max:15_000/);assert.doesNotMatch(lb,/footgolfdaily|'footgolf_daily'/,'no daily board');
 assert.match(read('lib/arcade/arcadeWalletCore.ts'),/if\(game==='footgolf'\)value=Math\.floor\(n\(s\.points\)\/600\)/);assert.equal(C.footgolfCoins(1200),2);
 assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_footgolf','Arcade: FootGolf Island'\]/);assert.match(read('lib/analytics/countIds.ts'),/'popup','flickit','footgolf'\] as const/);
 assert.match(read('lib/arcade/lastScore.ts'),/footgolf_daily:\{game:'footgolf',label:'Daily Hole',today:true\}/);assert.match(read('lib/saves/snapshot.ts'),/'fi2-footgolf-v1'/);
 const sql=read('docs/arcade-aaa/new-games-nov22-supabase.sql');assert.match(sql,/'holdtheline', 'footgolf', 'flickit', 'popup'\)\)/);assert.match(sql,/'arcade_footgolf'/);for(const id of ['runner','kitrush','snakedaily','keepyuppy','holdtheline'])assert.ok(sql.includes(`'${id}'`),`keeps ${id}`);
 const shell=read('components/games/FootGolfGame.tsx');assert.match(shell,/beginBoardSession\('footgolf'\)/);assert.match(shell,/creditRun\(r\.id,'footgolf'/);assert.doesNotMatch(shell,/spendCoins|chargeArcade/);
});

ok('heat and sound: one sun + a hemisphere, no shadow map, pixel ratio 1.5 on phones, one limiter, nothing before a tap',()=>{
 const v=read('lib/arcade/footgolf/view.ts');assert.match(v,/powerPreference:'low-power'/);assert.match(v,/Math\.min\(o\.mobile\?1\.5:2,dpr\)/);assert.doesNotMatch(v,/shadowMap\.enabled\s*=\s*true|castShadow\s*=\s*true/);
 assert.equal((v.match(/new T\.DirectionalLight/g)||[]).length,1);assert.equal((v.match(/new T\.HemisphereLight/g)||[]).length,1);assert.doesNotMatch(v,/EffectComposer|PointLight|SpotLight/);
 const a=read('lib/arcade/footgolf/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\)/);assert.equal((a.match(/createDynamicsCompressor/g)||[]).length,1);assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);
 const sh=read('components/games/FootGolfGame.tsx');assert.match(sh,/frameMs\.current=1000\/\(mobile\?30:60\)/);assert.match(sh,/sleep on a still aim view/);
});

console.log(`footgolf-core: ${n} ok`);
