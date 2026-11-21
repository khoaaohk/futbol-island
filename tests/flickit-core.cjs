// Flick It (Nov 21 2026, docs/arcade-aaa/flickit-direction.md): the football flick game. The flick (a finger path -> power, aim, curl,
// lift, dip), the ball's curved flight, the object targets and their reactions, combos and trick shots, stars and the Tour, the
// seeded Daily Flick, bots that prove every stage can be played, the device save, the wiring (unplaced: by link only) and the sound.
//   node tests/flickit-core.cjs [--bots]   (--bots prints the bot numbers the board rate comes from)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/flickit/core.ts'),S=require('../lib/arcade/flickit/save.ts'),{FK,K,STAGES}=C,BOTS=process.argv.includes('--bots');
const read=p=>fs.readFileSync(p,'utf8');
let n=0;const ok=(name,fn)=>{const t0=Date.now();try{fn();}catch(e){console.error('FAIL '+name);throw e;}n++;if(BOTS)console.log(`  ${name} (${Date.now()-t0} ms)`);};
const VP={w:390,h:844},CAM={yaw:0,gain:.5,off:0},SC=C.flickScale(VP.w,VP.h);
/** A finger path from (200,700): dx,dy in screen widths (y up = negative), bend = sideways bulge, over ms; ease > 1 speeds up at the end. */
const path=(dx,dy,bend=0,ms=120,ease=1,pts=12)=>{const p=[];for(let i=0;i<=pts;i++){const u=i/pts,v=Math.pow(u,ease);p.push({x:200+dx*SC*v+bend*SC*4*v*(1-v),y:700+dy*SC*v,t:1000+ms*u});}return p;};
const shotOf=(...a)=>C.flickToShot(path(...a),VP,CAM);
const fly=(shot,secs=4)=>{const b={x:0,y:0,z:0,vx:0,vy:0,vz:0,spin:0,top:0,t:0};C.launch(b,shot);let land=null,maxY=0;for(let i=0;i<secs*120;i++){C.flyStep(b,FK.step);if(b.y>maxY)maxY=b.y;if(b.y<FK.R&&b.vy<0){land={x:b.x,z:b.z,t:b.t};break;}}return {land,maxY,b};};
/** A level with only the given things in it. */
/** (unless `alone`, one more thing stands far out of reach, so hitting everything else does not end the level with its spare-flick bonus) */
const lab=(build,alone=false)=>{const g=C.createFlickIt({mode:'stage',seed:11,stage:0}),s=g.state;s.ents.length=0;build(s.ents);if(!alone)C.addEnt(s.ents,K.balloon,29,9,-44);s.par=s.ents.filter(e=>e.need).reduce((a,e)=>a+e.pts,0);s.stage={...s.stage,assist:0};g.drain(()=>{});return g;};
const run=(g,shot,max=2400)=>{const ev=[];assert.ok(g.flick(shot),'the kick is taken');for(let i=0;i<max&&g.state.phase!=='tee'&&g.state.phase!=='done';i++){g.step();g.drain(e=>ev.push(e));}g.drain(e=>ev.push(e));return ev;};
const types=ev=>ev.map(e=>e.type),STRAIGHT={power:.6,yaw:0,pitch:.2,spin:0,top:0};
const solve=(s,e)=>{for(const sp of [0,.6,-.6,1,-1]){const sh=C.solveShot(e,sp,s.ents);if(sh)return sh;}return null;};
function bot(opts){const g=C.createFlickIt(opts),s=g.state;let guard=0,skip=0,steps=0;
 while(guard++<600000){if(s.phase==='tee'){const c=s.ents.filter(e=>e.need&&!e.done);let shot=null;for(let i=0;i<c.length&&!shot;i++)shot=solve(s,c[(i+skip)%c.length]);skip++;g.flick(shot||STRAIGHT);}else if(s.phase==='done'){if(!g.next())break;}g.step();steps++;g.drain(()=>{});}
 return {results:s.results,total:s.total,secs:steps*FK.step,over:s.over};}

ok('flick: speed is power, a tap or a downward swipe is no kick, only the last 280 ms counts',()=>{
 const slow=shotOf(0,-.4,0,330),mid=shotOf(0,-.4,0,150),fast=shotOf(0,-.4,0,70);assert.ok(slow.power<mid.power&&mid.power<fast.power,'faster swipe, harder kick');assert.ok(slow.power<.25&&fast.power>.85);
 assert.equal(shotOf(0,-.03,0,60),null,'a tap');assert.equal(shotOf(0,.4,0,100),null,'a swipe down the screen');assert.equal(shotOf(.5,-.02,0,100),null,'a swipe along the screen');assert.equal(C.flickToShot([{x:1,y:1,t:0}],VP,CAM),null);
 // a slow drag, then a snap: the snap is the kick
 const drag=[];for(let i=0;i<10;i++)drag.push({x:200,y:760-i*4,t:i*60});const snap=path(0,-.4,0,90).map(p=>({...p,y:p.y+24,t:p.t-1000+600})),both=C.flickToShot([...drag,...snap],VP,CAM);
 assert.ok(Math.abs(both.power-C.flickToShot(snap,VP,CAM).power)<.12,'the drag before the snap does not weaken the kick');
 assert.ok(C.shotSpeed(0)===FK.vMin&&C.shotSpeed(1)===FK.vMax&&C.shotSpeed(.5)>FK.vMin);
});
ok('flick: the first direction is the aim (through the camera), length is lift',()=>{
 const up=shotOf(0,-.4),right=shotOf(.2,-.4),left=shotOf(-.2,-.4);assert.ok(Math.abs(up.yaw)<1e-6);assert.ok(right.yaw>.1&&Math.abs(right.yaw+left.yaw)<1e-6,'mirror swipes, mirror kicks');
 assert.ok(Math.abs(right.yaw-Math.atan(.5*Math.tan(Math.atan2(.2,.4))))<.01,'screen angle -> ground angle by the camera gain');
 const wide=C.flickToShot(path(.2,-.4),VP,{yaw:0,gain:.7,off:0});assert.ok(wide.yaw>right.yaw,'a higher camera turns the same swipe further');
 const turned=C.flickToShot(path(0,-.4),VP,{yaw:.3,gain:.5,off:-.1});assert.ok(Math.abs(turned.yaw-(.3+Math.atan(-.1)))<1e-6,'the camera heading and the ball\'s place on screen are part of the aim');
 const short=shotOf(0,-.2,0,60),long=shotOf(0,-.75,0,225);assert.ok(Math.abs(short.pitch-FK.pitchMin)<.03&&long.pitch>short.pitch+.3&&long.pitch<=FK.pitchMax,'a longer swipe lifts the ball');
 // the ghost finger: shot -> swipe -> shot
 const s={power:.6,yaw:.2,pitch:.35,spin:0,top:0},sw=C.shotToSwipe(s,VP,CAM),back=C.flickToShot([0,.25,.5,.75,1].map(u=>({x:200+sw.dx*u,y:700+sw.dy*u,t:sw.ms*u})),VP,CAM);
 assert.ok(Math.abs(back.yaw-s.yaw)<.02&&Math.abs(back.pitch-s.pitch)<.03&&Math.abs(back.power-s.power)<.06,'shotToSwipe is the reverse of flickToShot');
});
ok('flick: a bent swipe is curl, speeding up is dip, slowing down is float; the foot is named',()=>{
 const st=shotOf(0,-.45),bendR=shotOf(0,-.45,-.1),bendL=shotOf(0,-.45,.1),hook=shotOf(0,-.45,-.2);
 assert.equal(st.spin,0);assert.ok(bendR.spin>.3,'the path turns right as it goes: right-hand curl '+bendR.spin);assert.ok(Math.abs(bendR.spin+bendL.spin)<1e-6);assert.ok(hook.spin>=bendR.spin&&hook.spin<=1);
 assert.ok(bendR.yaw<0&&bendL.yaw>0,'a curled kick starts the other way, as the finger did');
 const shaky=path(0,-.45).map((p,i)=>({...p,x:p.x+(i%2?1.5:-1.5)}));assert.equal(C.flickToShot(shaky,VP,CAM).spin,0,'a shaky straight finger is still straight');
 assert.equal(st.top,0);assert.ok(shotOf(0,-.45,0,140,2.2).top>.3,'speeding up: top spin');assert.ok(shotOf(0,-.45,0,140,.45).top<-.3,'slowing down: it floats');
 assert.equal(C.footFor(st),'laces');assert.equal(C.footFor({...st,spin:-.6}),'inside');assert.equal(C.footFor({...st,spin:.6}),'outside');
});
ok('flight: curl bends the ball its way, more spin bends more, dip drops it short, power carries',()=>{
 const base={power:.7,yaw:0,pitch:.3,spin:0,top:0},a=fly(base),r=fly({...base,spin:1}),l=fly({...base,spin:-1}),h=fly({...base,spin:.5});
 assert.ok(Math.abs(a.land.x)<1e-9,'no spin: dead straight');assert.ok(r.land.x>3,'full right curl lands metres right: '+r.land.x.toFixed(2));assert.ok(Math.abs(r.land.x+l.land.x)<1e-6);assert.ok(h.land.x>.8&&h.land.x<r.land.x);
 const dip=fly({...base,top:1}),flo=fly({...base,top:-1});assert.ok(dip.land.z>a.land.z+2&&dip.maxY<a.maxY,'top spin: shorter and lower');assert.ok(flo.land.z<a.land.z-2&&flo.maxY>a.maxY,'a floated ball hangs and carries');
 assert.ok(fly({...base,power:1}).land.z<a.land.z-8);assert.ok(fly({...base,pitch:.55}).maxY>a.maxY+2);
 // the curl fades (FK.spinDecay) and the ghost path matches the flight
 assert.ok(r.b.spin<1&&r.b.spin>.5);const out=new Float32Array(60),k=C.predict(base,out,6);assert.ok(k>5&&out[2]===0&&out[(k-1)*3+2]<-5&&Math.abs(out[(k-1)*3])<1e-9);
});
ok('flight in the game: the same flicks give the same level at any frame rate',()=>{
 const play=dt=>{const g=C.createFlickIt({mode:'stage',seed:5,stage:0});let t=0;const shots=[{power:.55,yaw:0,pitch:.22,spin:0,top:0},{power:.6,yaw:.3,pitch:.25,spin:-.5,top:0},{power:.5,yaw:-.36,pitch:.5,spin:0,top:0}];let i=0;
  while(t<30&&g.state.phase!=='done'){if(g.state.phase==='tee'&&i<shots.length)g.flick(shots[i++]);else if(g.state.phase==='tee')break;g.advance(dt);t+=dt;}return JSON.stringify([g.state.score,g.state.ents.map(e=>[e.done,Math.round(e.x*1e6),Math.round(e.y*1e6)])]);};
 // the flicks land on different steps at different frame rates only through moving targets: stage 1 has bobbing balloons, so compare the fixed-step driver with itself and coarse frames
 const a=(()=>{const g=C.createFlickIt({mode:'stage',seed:5,stage:0});const ev=run(g,{power:.55,yaw:0,pitch:.22,spin:0,top:0});return JSON.stringify([g.state.score,ev.length,g.state.ents.map(e=>Math.round(e.x*1e6))]);})();
 const b=(()=>{const g=C.createFlickIt({mode:'stage',seed:5,stage:0});g.flick({power:.55,yaw:0,pitch:.22,spin:0,top:0});const ev=[];for(let i=0;i<400&&g.state.phase!=='tee';i++){g.advance(1/30+((i%3)-1)*.004);g.drain(e=>ev.push(e));}return JSON.stringify([g.state.score,ev.length,g.state.ents.map(e=>Math.round(e.x*1e6))]);})();
 assert.equal(a,b,'fixed steps: uneven frames change nothing');assert.equal(play(1/60),play(1/60));assert.ok(JSON.parse(play(1/60))[0]>0);
 const g=C.createFlickIt({mode:'stage',seed:5,stage:0});assert.equal(g.flick(STRAIGHT),true);assert.equal(g.flick(STRAIGHT),false,'no second kick while the ball flies');
});
ok('targets: cans topple and take the ones above with them; barrels need weight; balloons pop without stopping the ball',()=>{
 const g=C.createFlickIt({mode:'stage',seed:5,stage:0}),s=g.state,cans=s.ents.filter(e=>e.k===K.can);assert.equal(cans.length,6);assert.ok(cans.slice(3).every(c=>c.s1>=0&&c.s2>=0),'upper cans stand on two below');
 const ev=run(g,C.solveShot(cans[1],0,s.ents));const down=cans.filter(c=>c.done).length;assert.ok(down>=4,'one ball through the middle of the pyramid: '+down+' cans');assert.ok(types(ev).includes('fall'),'cans that lose their support fall');
 assert.ok(cans.filter(c=>c.done).every(c=>c.st===2&&c.y<.25),'knocked cans come to rest on the ground');assert.ok(s.score>=50+80+100+130,'each next can of the flick pays more');
 const hits=ev.filter(e=>e.type==='hit');assert.deepEqual(hits.map(e=>e.a),hits.map((_,i)=>i+1),'the combo counts up through the flick');assert.equal(hits[1].points,Math.round(50*FK.mult[1]/10)*10);assert.equal(hits[1].word,'DOUBLE!');
 // a barrel: a soft ball only wobbles it, a firm one knocks it over
 const soft=lab(L=>C.addEnt(L,K.barrel,0,.6,-6)),e1=run(soft,{power:.1,yaw:0,pitch:.12,spin:0,top:0});assert.ok(types(e1).includes('weak')&&!soft.state.ents[0].done&&soft.state.stats.weak===1,'too soft');
 const hard=lab(L=>C.addEnt(L,K.barrel,0,.6,-6)),e2=run(hard,{power:.8,yaw:0,pitch:.12,spin:0,top:0});assert.ok(hard.state.ents[0].done&&hard.state.score===150&&!types(e2).includes('weak'),'weight of shot');
 // balloons in a line: the ball goes through all of them
 const line=lab(L=>{for(let i=0;i<3;i++)C.addEnt(L,K.balloon,0,1.05+i*.05,-5-i*1.6);}),e3=run(line,{power:.7,yaw:0,pitch:.22,spin:0,top:0});
 assert.equal(e3.filter(e=>e.type==='pop').length,3,'three balloons, one ball');assert.equal(line.state.score,60+90+120);assert.equal(line.state.stats.bestCombo,3);
});
ok('targets: hoop, bin, bell, shutter, crossbar, goal and keeper each react their own way; a done thing never pays twice',()=>{
 const hoop=lab(L=>C.addEnt(L,K.hoop,0,1.6,-7)),sh=C.solveShot(hoop.state.ents[0]);run(hoop,sh);assert.ok(hoop.state.ents[0].done&&hoop.state.score===200,'through the hoop');
 const rim=lab(L=>C.addEnt(L,K.hoop,0,1.6,-7)),er=run(rim,{...sh,yaw:sh.yaw+Math.atan2(.95,7)});assert.ok(types(er).includes('ping')&&!rim.state.ents[0].done&&rim.state.stats.rims>=1,'the rim pings and does not score');
 const bin=lab(L=>C.addEnt(L,K.bin,0,.55,-6)),eb=run(bin,C.solveShot(bin.state.ents[0]));assert.ok(bin.state.ents[0].done&&types(eb).includes('net')&&bin.state.score===250,'dropped into the bin');
 const flat=lab(L=>C.addEnt(L,K.bin,0,.55,-6)),ef=run(flat,{power:.5,yaw:0,pitch:.11,spin:0,top:0});assert.ok(!flat.state.ents[0].done&&types(ef).includes('ping'),'a flat ball hits the side of the bin');
 for(const k of [K.bell,K.shutter,K.sign,K.trolley]){const g=lab(L=>C.addEnt(L,k,0,1.2,-7)),e=g.state.ents[0];run(g,C.solveShot(e));assert.ok(e.done&&g.state.score===C.SPEC[k].pts,C.KIND_NAME[k]);const before=g.state.score;run(g,C.solveShot(e));assert.equal(g.state.score,before,'a done '+C.KIND_NAME[k]+' pays once');}
 // a goal: posts, bar, mouth; in the top corner pays more; the keeper bot saves what is hit at it
 const mk=keeper=>lab(L=>{C.addEnt(L,K.post,-3,0,-12,{ey:2.6});C.addEnt(L,K.post,3,0,-12,{ey:2.6});C.addEnt(L,K.bar,-3,2.6,-12,{ex:6,need:true,pts:120});C.addEnt(L,K.goal,0,1.3,-12,{hx:3,hy:1.3});if(keeper)C.addEnt(L,K.keeper,0,.85,-11.4);});
 const g1=mk(false),goalEnt=g1.state.ents[3],eg=run(g1,C.solveShot(goalEnt));assert.ok(goalEnt.done&&types(eg).includes('goal')&&g1.state.score>=300);assert.ok(g1.state.ball.z>-13.6,'the net holds the ball');
 const g2=mk(false),bar=g2.state.ents[2],ebar=run(g2,C.solveShot(bar));assert.ok(bar.done&&types(ebar).includes('ping'),'the crossbar pings');
 const g3=mk(true),es=run(g3,C.solveShot({...g3.state.ents[3],y:.5}));assert.ok(types(es).includes('saved')&&!g3.state.ents[3].done&&g3.state.stats.saved===1,'straight at the keeper: saved');
 const g4=mk(false);let corner=null;for(let p=.5;p<=1&&!corner;p+=.05)for(let pi=.2;pi<.5&&!corner;pi+=.02){const t=mk(false),ev=run(t,{power:p,yaw:Math.atan2(2.5,12),pitch:pi,spin:0,top:0});const gl=ev.find(e=>e.type==='goal');if(gl&&gl.a===1)corner=t.state.score;}
 assert.ok(corner>=500,'top corner: the goal plus 200');void g4;
});
ok('trick shots: curled, round the wall, up and over (dipped), bank, long range; each pays once a flick',()=>{
 // curl: a balloon 2 m right of the straight line, reached by a ball that started straight up the pitch
 const curl=lab(L=>C.addEnt(L,K.balloon,0,.9,-10));let got=null;for(let y=-.5;y<0&&!got;y+=.01){const t=lab(L=>C.addEnt(L,K.balloon,0,.9,-10)),ev=run(t,{power:.6,yaw:y,pitch:.22,spin:1,top:0});if(t.state.ents[0].done)got={t,ev,y};}
 assert.ok(got,'a full curl finds the balloon from a kick aimed left of it');const tr=got.ev.filter(e=>e.type==='trick');assert.deepEqual(tr.map(e=>e.word),['CURLED IT!']);assert.equal(got.t.state.score,60+FK.trick.curl);assert.equal(got.t.state.stats.curls,1);void curl;
 // round the wall: mannequins on the straight line to the target
 const wall=()=>lab(L=>{C.addEnt(L,K.wall,-.32,.9,-4);C.addEnt(L,K.wall,.32,.9,-4);C.addEnt(L,K.bell,.9,1,-12);});
 const blocked=wall(),e0=run(blocked,{power:.6,yaw:0,pitch:.12,spin:0,top:0});assert.ok(types(e0).includes('block')&&blocked.state.stats.blocked===1&&!blocked.state.ents[2].done,'straight into the wall');
 let round=null;for(const sp of [-1,1])for(const pi of [.22,.25,.28,.31])for(let y=-.7;y<.7&&!round;y+=.01){const t=wall(),ev=run(t,{power:.62,yaw:y,pitch:pi,spin:sp,top:0});if(t.state.ents[2].done&&!ev.some(e=>e.type==='block'))round={t,ev};}
 assert.ok(round,'a curled ball gets round the wall');assert.ok(round.ev.some(e=>e.word==='ROUND THE WALL!')&&round.ev.some(e=>e.word==='CURLED IT!'));assert.equal(round.t.state.score,200+FK.trick.around+FK.trick.curl);
 // over: only a dipped ball earns it
 const over=top=>{let r=null;for(let p=.3;p<=1&&!r;p+=.02)for(let pi=.3;pi<.6&&!r;pi+=.02){const t=wall(),ev=run(t,{power:p,yaw:Math.atan2(.9,12),pitch:pi,spin:0,top});if(t.state.ents[2].done&&!ev.some(e=>e.type==='block'))r={t,ev};}return r;};
 const dipped=over(.8),lobbed=over(0);assert.ok(dipped&&dipped.ev.some(e=>e.word==='UP AND OVER!')&&dipped.t.state.stats.overs===1,'dipped over the wall');assert.ok(lobbed&&!lobbed.ev.some(e=>e.type==='trick'),'a plain lob over the wall is no trick');
 // bank: off a post, then a target
 let bank=null;for(let y=.02;y<.2&&!bank;y+=.004){const t=lab(L=>{C.addEnt(L,K.post,.6,0,-6,{ey:3});C.addEnt(L,K.trolley,-1.5,.55,-9);}),ev=run(t,{power:.6,yaw:y,pitch:.12,spin:0,top:0});if(t.state.ents[1].done&&ev.some(e=>e.type==='ping'))bank={t,ev};}
 assert.ok(bank&&bank.ev.some(e=>e.word==='BANK SHOT!')&&bank.t.state.stats.banks===1,'in off the post');
 const far=lab(L=>C.addEnt(L,K.bell,0,1.5,-22)),efar=run(far,C.solveShot(far.state.ents[0]));assert.ok(efar.some(e=>e.word==='LONG RANGE!')&&far.state.score===200+FK.trick.long);
 // once a flick: three curled balloons pay the curl bonus once
 const three=lab(L=>{for(let i=0;i<3;i++)C.addEnt(L,K.balloon,(i-1)*.5,.9,-10);});let best=0;for(let y=-.5;y<0;y+=.01){const t=lab(L=>{for(let i=0;i<3;i++)C.addEnt(L,K.balloon,(i-1)*.5,.9,-10);}),ev=run(t,{power:.6,yaw:y,pitch:.22,spin:1,top:0});if(ev.filter(e=>e.type==='pop').length>=2){assert.equal(ev.filter(e=>e.type==='trick'&&e.word==='CURLED IT!').length,1);best++;}}assert.ok(best>0);void three;
});
ok('near and close: the ball closing on a target is announced (slow motion), a narrow miss is told',()=>{
 const g=lab(L=>C.addEnt(L,K.bell,0,1.2,-8)),sh=C.solveShot(g.state.ents[0]),ev=run(g,sh);assert.ok(types(ev).indexOf('near')>=0&&types(ev).indexOf('near')<types(ev).indexOf('hit'),'near comes before the hit');
 const m=lab(L=>C.addEnt(L,K.bell,0,1.2,-8)),em=run(m,{...sh,yaw:sh.yaw+.11});assert.ok(types(em).includes('close')&&m.state.stats.close===1&&!m.state.ents[0].done,'so close');
 const w=lab(L=>C.addEnt(L,K.bell,0,1.2,-8)),ew=run(w,{...sh,yaw:sh.yaw+.6});assert.ok(types(ew).includes('miss')&&!types(ew).includes('close'));
 // aim help on the early stages pulls a slightly-off straight kick onto the target; a curled kick is left alone
 const help=C.createFlickIt({mode:'stage',seed:1,stage:0}),t=help.state.ents.find(e=>e.k===K.bin),s0=C.solveShot(t,0,help.state.ents);help.flick({...s0,yaw:s0.yaw+.05});assert.ok(Math.abs(help.state.shot.yaw-s0.yaw)<.05*(1-STAGES[0].assist)+1e-9,'pulled toward the bin');
 const none=C.createFlickIt({mode:'stage',seed:1,stage:0});none.flick({...s0,yaw:s0.yaw+.05,spin:.5});assert.ok(Math.abs(none.state.shot.yaw-(s0.yaw+.05))<1e-9);assert.ok(STAGES.every((d,i)=>i===0||d.assist<=STAGES[i-1].assist),'less help on every later stage');
});
ok('levels: flicks run out or everything is hit, stars at 30 / 60 / 100 percent, spare flicks pay, the Tour needs a star to go on',()=>{
 assert.equal(STAGES.length,6);assert.deepEqual(STAGES.map(d=>d.id),['garden','plaza','pitch','beach','roof','stadium']);for(const d of STAGES){assert.ok(d.flicks>=5&&d.flicks<=8,d.id+' has 5-8 flicks');assert.ok(d.lesson.length>20&&d.lesson.length<90);}
 // every stage has its own camera: no two alike in height, distance or lens
 const cams=STAGES.map(d=>d.cam);for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)assert.ok(Math.abs(cams[i].p[1]-cams[j].p[1])>.2||Math.abs(cams[i].fov-cams[j].fov)>5,'distinct cameras '+i+' '+j);
 assert.ok(Math.max(...cams.map(c=>c.p[1]))>4.5&&Math.min(...cams.map(c=>c.p[1]))<1,'from ground level to over the shoulder');assert.ok(Math.max(...cams.map(c=>c.fov))-Math.min(...cams.map(c=>c.fov))>=20,'wide lens to long lens');
 // depth: every stage has targets near and far, low and high, left and right, and at least four kinds of thing
 for(let i=0;i<6;i++){const s=C.createFlickIt({mode:'stage',seed:1,stage:i}).state,need=s.ents.filter(e=>e.need),zs=need.map(e=>e.z),ys=need.map(e=>e.y),xs=need.map(e=>e.x);
  assert.ok(Math.max(...zs)-Math.min(...zs)>=4,STAGES[i].id+' depth');assert.ok(Math.max(...ys)-Math.min(...ys)>=1,STAGES[i].id+' height');assert.ok(Math.max(...xs)>1.2&&Math.min(...xs)<-1.2,STAGES[i].id+' both sides');assert.ok(new Set(need.map(e=>e.k)).size>=4,STAGES[i].id+' kinds');assert.equal(s.par,need.reduce((a,e)=>a+e.pts,0));}
 const kinds=new Set();for(let i=0;i<6;i++)for(const e of C.createFlickIt({mode:'stage',seed:1,stage:i}).state.ents)kinds.add(e.k);for(const k of [K.can,K.crate,K.bottle,K.barrel,K.balloon,K.hoop,K.tyre,K.bin,K.bell,K.shutter,K.sign,K.trolley,K.bar,K.goal,K.keeper,K.wall,K.fence])assert.ok(kinds.has(k),'the Tour uses '+C.KIND_NAME[k]);
 assert.equal(C.starsFor(290,1000),0);assert.equal(C.starsFor(300,1000),1);assert.equal(C.starsFor(600,1000),2);assert.equal(C.starsFor(1000,1000),3);assert.equal(C.starScore(880,3),880);
 // all hit with flicks to spare
 const g=lab(L=>C.addEnt(L,K.bell,0,1.2,-8),true),ev=run(g,C.solveShot(g.state.ents[0])),s=g.state,lv=ev.find(e=>e.type==='level');assert.equal(s.phase,'done');assert.equal(lv.a,3);assert.equal(lv.b,STAGES[0].flicks-1);assert.equal(s.score,200+(STAGES[0].flicks-1)*FK.spare);assert.ok(s.results[0].cleared&&s.over);
 // a Tour: no star ends it; a star goes on; six stages end it
 const fail=C.createFlickIt({mode:'tour',seed:3});for(let i=0;i<STAGES[0].flicks;i++)run(fail,{power:.3,yaw:1.2,pitch:.2,spin:0,top:0});assert.ok(fail.state.phase==='done'&&fail.state.over&&fail.state.results[0].stars===0&&!fail.next(),'no star: the Tour ends');
 const tour=bot({mode:'tour',seed:9});assert.equal(tour.results.length,6,'the bot plays the whole Tour');assert.ok(tour.over);assert.equal(tour.total,tour.results.reduce((a,r)=>a+r.score,0));assert.deepEqual(tour.results.map(r=>r.stage),STAGES.map(d=>d.id));
 if(BOTS)console.log('  tour bot:',tour.total,'in',tour.secs.toFixed(0),'s',tour.results.map(r=>`${r.stage} ${r.score} ${r.stars}*`).join(', '));
 const R=require('../lib/arcade/leaderboard.ts').BOARD_RULES.flickit;assert.ok(tour.total<R.base+R.perSecond*tour.secs&&tour.total<R.max&&tour.secs>R.minSeconds,'the bot\'s Tour fits the board\'s limits');assert.equal(R.max,FK.scoreMax);
});
ok('bots: every stage gives a straight-kicking bot two stars, and every still target can be reached',()=>{
 for(let i=0;i<6;i++){const r=bot({mode:'stage',seed:5,stage:i});assert.ok(r.results[0].stars>=2,STAGES[i].id+': '+r.results[0].score+' / '+r.results[0].stars+' stars');
  const g0=C.createFlickIt({mode:'stage',seed:5,stage:i});let reach=0,still=0;for(const e of g0.state.ents){if(!e.need||e.mo===1||e.mo===2)continue;still++;if(solve(g0.state,e))reach++;}assert.ok(reach>=still-1,STAGES[i].id+': '+reach+' of '+still+' still targets have a kick');}
 assert.ok(bot({mode:'stage',seed:5,stage:0}).results[0].stars===3,'the first stage gives the bot three stars');
});
ok('daily: one seeded stage, the same on every device, different each day',()=>{
 assert.equal(C.flickitDailySeed('2026-11-21'),C.flickitDailySeed('2026-11-21'));assert.notEqual(C.flickitDailySeed('2026-11-21'),C.flickitDailySeed('2026-11-22'));
 const snap=day=>{const s=C.createFlickIt({mode:'daily',seed:C.flickitDailySeed(day)}).state;return JSON.stringify([s.stage.place,s.flicks,s.ents.map(e=>[e.k,e.x,e.y,e.z,e.s1,e.mo])]);};
 assert.equal(snap('2026-11-21'),snap('2026-11-21'),'same day, same stage');const days=Array.from({length:14},(_,i)=>`2026-12-${String(i+1).padStart(2,'0')}`),set=new Set(days.map(snap));assert.equal(set.size,14,'fourteen days, fourteen stages');
 const places=new Set();let stars=0;for(const d of days){const g=C.createFlickIt({mode:'daily',seed:C.flickitDailySeed(d)}),s=g.state;places.add(s.stage.place);assert.equal(s.flicks,7);assert.equal(s.stage.id,'daily');assert.ok(s.par>=500&&s.ents.filter(e=>e.need).length>=5,d+' has targets');
  for(const e of s.ents)assert.ok(e.z<-4&&e.z>-24&&Math.abs(e.x)<8,d+' in range');const r=bot({mode:'daily',seed:C.flickitDailySeed(d)});assert.equal(r.results.length,1);assert.ok(r.over);stars+=r.results[0].stars;}
 assert.ok(places.size>=4,'the daily moves round the island');assert.ok(stars>=14,'the bot averages a star or more a day: '+stars);
 const again=bot({mode:'daily',seed:C.flickitDailySeed('2026-12-03')}),same=bot({mode:'daily',seed:C.flickitDailySeed('2026-12-03')});assert.equal(again.total,same.total,'the same flicks score the same on every device');
});
ok('teaching: the tip matches what happened; coins',()=>{
 const z={flicks:6,scored:5,curls:0,arounds:0,overs:0,banks:0,longs:0,bestCombo:1,weak:0,blocked:0,saved:0,close:0,rims:0,power:3};
 assert.match(C.tipFor({...z,arounds:1,curls:1},false).line,/inside of your foot/);assert.match(C.tipFor({...z,curls:1},false).title,/Curled it/);assert.match(C.tipFor({...z,curls:1},false).line,/inside of the foot bends the ball left/);
 assert.match(C.tipFor({...z,overs:1},false).line,/Laces through the top half/);assert.match(C.tipFor({...z,weak:2},false).title,/Weight of shot/);assert.match(C.tipFor({...z,bestCombo:3},false).line,/laces/);
 assert.match(C.tipFor({...z,scored:1},false).title,/Pick one target/);assert.match(C.tipFor(z,true).line,/Laces for power, inside of the foot for accuracy/);assert.match(C.tipFor({...z,close:1},false).line,/standing foot/);
 for(const s of [{...z,arounds:1},{...z,overs:1},{...z,curls:1},{...z,banks:1},{...z,weak:1},{...z,bestCombo:2},z]){const t=C.tipFor(s,false);assert.ok(t.title.length<=22&&t.line.length<=130,'short lines');}
 assert.equal(C.flickCoins(1499),0);assert.equal(C.flickCoins(9000),6);const W=require('../lib/arcade/arcadeWalletCore.ts');assert.equal(W.arcadeCoinTarget('flickit',{points:9000}),6);assert.equal(W.arcadeCoinTarget('flickit',{points:1e9}),require('../lib/economy.ts').ARCADE_COIN_CAPS.flickit);
});
ok('save: best Tour, stars per stage, the day\'s Daily Flick, junk refused',()=>{
 const st=(stage,score,stars)=>({stage,score,stars,cleared:stars===3,spare:0,stats:{flicks:6,scored:4,curls:1,arounds:0,overs:0,banks:1,longs:0,bestCombo:2,weak:0,blocked:0,saved:0,close:0,rims:0,power:3}});
 let s=S.emptyFlickitSave();assert.ok(S.stageOpen(s,0)&&!S.stageOpen(s,1));
 let r=S.settleFlickit(s,{mode:'tour',day:'2026-11-21',total:1500,results:[st('garden',900,3),st('plaza',600,1)]});s=r.save;assert.ok(r.newBest&&s.best===1500&&s.stars[0]===3&&s.stars[1]===1&&r.newStars===4&&s.tricks===4&&s.plays===1);assert.ok(S.stageOpen(s,2)&&!S.stageOpen(s,3));assert.equal(S.totalStars(s),4);
 r=S.settleFlickit(s,{mode:'tour',day:'2026-11-21',total:900,results:[st('garden',900,2)]});assert.ok(!r.newBest&&r.save.best===1500&&r.save.stars[0]===3,'stars and best never go down');
 r=S.settleFlickit(s,{mode:'stage',day:'2026-11-21',total:1100,results:[st('garden',1100,3)]});assert.ok(r.newBest&&r.previousBest===900&&r.save.best===1500&&r.save.bests[0]===1100,'practice does not touch the Tour best');
 r=S.settleFlickit(s,{mode:'daily',day:'2026-11-21',total:700,results:[st('daily',700,2)]});s=r.save;assert.ok(r.newBest&&r.dailyBest===700&&s.daily.runs===1&&s.streak.n===1&&s.best===1500&&S.totalStars(s)===4,'the daily has its own best');
 r=S.settleFlickit(s,{mode:'daily',day:'2026-11-22',total:400,results:[st('daily',400,1)]});assert.ok(r.save.daily.day==='2026-11-22'&&r.save.daily.best===400&&r.streak===2);assert.equal(S.liveStreak(r.save,'2026-11-25'),0);
 const junk=S.sanitizeFlickitSave({best:-5,stars:[9,'x',2],bests:[1e12],daily:{day:'nope',best:1e12},plays:NaN});assert.deepEqual(junk.stars,[3,0,2,0,0,0]);assert.equal(junk.best,0);assert.equal(junk.bests[0],FK.scoreMax);assert.equal(junk.daily.day,'');assert.equal(junk.daily.best,FK.scoreMax);
 assert.deepEqual(S.sanitizeFlickitSave(null),S.emptyFlickitSave());assert.equal(S.FLICKIT_KEY,'fi2-flickit-v1');
});
ok('wiring: a machine on the west wall (Nov 22 2026), its own all-time board, coins, analytics key, device save, SQL as files',()=>{
 const cat=read('lib/arcade/arcadeCatalog.ts'),room=read('components/ArcadeRoom.tsx'),A=require('../lib/arcade/arcadeCatalog.ts');
 assert.equal(A.arcadeUnplaced.length,0);{const c=A.arcadeCabinets.find(c=>c.id==='flickit');assert.ok(c&&c.x===-12.75&&c.z===-5.45&&Math.abs(c.yaw-Math.PI/3)<1e-9,'on the west wall');}assert.ok(!A.ARCADE_ROW.includes('flickit'));assert.equal(A.ARCADE_GAME_COUNT,15);
 assert.match(cat,/\{id:'flickit',name:'Flick It',short:'FLICK IT',lesson:'Laces for power\. Inside of the foot to bend it\.'/);
 assert.match(room,/const FlickIt=dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/games\/FlickItGame'\)\)/);assert.match(room,/flickit:\(\)=>import\('\.\/games\/FlickItGame'\)/);assert.match(room,/game==='flickit'\?<FlickIt onExit=\{back\}\/>/);
 const L=require('../lib/arcade/leaderboard.ts');assert.ok(L.BOARD_GAMES.includes('flickit'));assert.ok(L.HALL_MACHINES.includes('flickit'),'in the Hall');assert.ok(!L.BOARD_GAMES.some(g=>/flick.*daily|flickdaily/.test(g)),'no daily board (the owner removed daily boards)');
 const LS=require('../lib/arcade/lastScore.ts');assert.ok(LS.LAST_SCORE_GAMES.includes('flickit')&&LS.LAST_SCORE_GAMES.includes('flickit_daily'));
 assert.match(read('lib/arcade/arcadeWalletCore.ts'),/if\(game==='flickit'\)value=Math\.floor\(n\(s\.points\)\/1500\)/);assert.match(read('lib/saves/snapshot.ts'),/'fi2-flickit-v1'/);
 const I=require('../lib/analytics/islandIds.ts');assert.ok(I.ARCADE_GAMES.includes('flickit'));assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_flickit','Arcade: Flick It'\]/);assert.ok(require('../lib/analytics/countIds.ts').ENGAGE_ARCADE_GAMES.includes('flickit'));
 assert.match(read('lib/analytics/live.ts'),/arcade_flickit:'Flick It'/);assert.match(read('components/arcade/HighScoreEntry.tsx'),/'flickit','popup','runner'/);assert.match(read('components/games/skins/index.ts'),/flickit:flickit\.skin/);assert.match(read('scripts/check-arcade-load.cjs'),/'flickit'/);
 // the SQL is written, not run: the owner file and the two migration copies are supersets
 const sql=read('docs/arcade-aaa/new-games-nov22-supabase.sql');for(const g of L.BOARD_GAMES)assert.ok(sql.includes(`'${g}'`),`the owner SQL keeps board ${g}`);for(const g of I.ARCADE_GAMES)assert.ok(sql.includes(`'arcade_${g}'`),`the owner SQL keeps analytics key arcade_${g}`);
 assert.match(sql,/OK, Flick It, FootGolf, Pop-Up Shot and the claw machine installed/);assert.ok(!/drop table|delete from|truncate/i.test(sql),'additive');assert.match(read('supabase/migrations/20261211_flickit_boards.sql'),/ 'holdtheline', 'flickit'\)\);/);assert.match(read('supabase/migrations/20261212_analytics_flickit.sql'),/'arcade_holdtheline','arcade_flickit',/);
 const shell=read('components/games/FlickItGame.tsx');assert.match(shell,/useArcadeEntry\('flickit'\)/);assert.match(shell,/if\(r\.mode==='tour'\)beginBoardSession|if\(mode==='tour'\)beginBoardSession\('flickit'\)/);assert.match(shell,/if\(r\.mode==='tour'&&total>0\)setBoard/,'only the Tour posts to the board');
 assert.match(shell,/noteLastScore\('flickit_daily'/);assert.match(shell,/creditRun\(r\.id,'flickit',coins,FLICKIT_COIN_REASON\)/);assert.match(shell,/data-arcade-kind="flickit"/);assert.match(shell,/flickToShot\(p,\{w:r\.width,h:r\.height\},v\.flickCam\(\)\)/);
 assert.match(shell,/const away=\(\)=>pause\(\),hidden=\(\)=>\{if\(document\.hidden\)pause\(\);\}/,'looked away: pause');assert.match(shell,/frameMs\.current=1000\/\(mobile\?30:60\)/,'30 draws a second on phones');assert.match(shell,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/,'cards and pause sleep');
 assert.ok(!/IslandBrush/.test(read('components/games/FlickItGame.module.css')),'no brush font on buttons');
});
ok('heat and sound: one scene, no shadow map, capped pixel ratio, instanced targets; one limiter, nothing before a tap',()=>{
 const v=read('lib/arcade/flickit/view.ts');assert.match(v,/powerPreference:'low-power'/);assert.match(v,/setPixelRatio\(Math\.min\(o\.mobile\?1\.5:2,dpr\)\)/);assert.ok(!/shadowMap\.enabled=true|castShadow=true/.test(v),'blob shadows, no shadow map');
 assert.equal((v.match(/new T\.DirectionalLight/g)||[]).length,1);assert.equal((v.match(/new T\.HemisphereLight/g)||[]).length,1);assert.ok(!/PointLight|SpotLight|EffectComposer/.test(v));assert.match(v,/new T\.InstancedMesh/);assert.match(v,/renderer\.forceContextLoss\(\)/);
 assert.match(v,/place\.geometry=scenery\(def\.place,s\.ents\)/,'each place is one baked mesh');
 const a=read('lib/arcade/flickit/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\)/);assert.equal((a.match(/createDynamicsCompressor/g)||[]).length,1);assert.ok(!/setInterval|loop=true|new Audio\(/.test(a),'one-shots only');assert.match(a,/function unlock\(\)/);assert.match(a,/isSoundEnabled\(\)/);
});
console.log(`flickit-core: ${n} checks passed`);
