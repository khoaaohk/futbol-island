// Idle island audio (user report Sep 2026: "while sitting idle sometimes there's a clicking noise").
// With no input for N seconds the island must start no sound, even when the world moves under a resting cursor
// (an NPC walking into it) or a looping ride hum stops as the child parks. Run with the dev server on :8092.
//   node scripts/check-idle-audio-browser.cjs            (IDLE=<seconds per spot>, default 20)
const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'),strict=require('node:assert/strict');
// SOFT=1 records every count instead of stopping at the first failure (for before/after surveys).
const failures=[],assert=process.env.SOFT?Object.assign((v,m)=>{if(!v)failures.push(m);},{equal:(a,b,m)=>{if(a!==b)failures.push(m);}}):strict;
const IDLE=+(process.env.IDLE||20)*1000;
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--autoplay-policy=no-user-gesture-required']});
try{const p=await b.newPage({viewport:{width:1100,height:850}});
 await p.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');
  const log=window.__audioLog=[];
  const conn=AudioNode.prototype.connect;AudioNode.prototype.connect=function(dst,...r){if(dst instanceof GainNode)this.__gain=dst;return conn.call(this,dst,...r);};
  const rec=(kind,node,when)=>log.push({kind,when,now:node.context.currentTime,level:node.__gain?node.__gain.gain.value:null,stack:(new Error().stack||'').split('\n').slice(3,6).join(' | ')});
  const start=AudioScheduledSourceNode.prototype.start;AudioScheduledSourceNode.prototype.start=function(...a){rec('start',this,a[0]);return start.apply(this,a);};
  const stop=AudioScheduledSourceNode.prototype.stop;AudioScheduledSourceNode.prototype.stop=function(...a){rec('stop',this,a[0]);return stop.apply(this,a);};
  const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...a){log.push({kind:'media',stack:''});return play.apply(this,a);};
 });
 await p.goto('http://localhost:8092',{timeout:180000});
 await p.waitForFunction(()=>window.__fi2?.walkBall&&window.__fi2?.sound,null,{timeout:120000});
 await p.waitForTimeout(6000);await p.keyboard.press('F2');await p.waitForTimeout(800);
 assert.equal(await p.evaluate(()=>window.__fi2.sound.contextState),'running','audio unlocked');
 const place=(x,z,ride='walk')=>p.evaluate(([x,z,ride])=>{const d=window.__fi2;d.rideRef.current=ride;d.pendingRide.current=null;d.location.x=x;d.location.z=z;d.velocity.x=d.velocity.z=0;d.rooftop.reset(x,z,d.rooftop.surface(x,z));const h=d.rooftop.surface(x,z);d.camera.position.set(x+18,23+h,z+30);d.camera.lookAt(x,h+1,z);d.camera.updateMatrixWorld();},[x,z,ride]);
 // A visit can complete a path step and open a card offer, which pauses (and sleeps) the island. Answer it first,
 // with input, so the idle window measures the running island.
 const settle=async()=>{for(let i=0;i<24;i++){await p.waitForTimeout(700);const open=await p.evaluate(()=>!!document.querySelector('dialog[open]'));if(!open){if(!(await p.evaluate(()=>window.__fi2.lessonPass.sleeping)))return;continue;}
  const choose=p.locator('dialog[open] [data-choose]');if(await choose.count())await choose.first().click({timeout:3000}).catch(()=>{});await p.waitForTimeout(2500);await p.keyboard.press('Escape');await p.waitForTimeout(600);await p.keyboard.press('Escape');await p.locator('dialog[open] button').last().click({timeout:1500}).catch(()=>{});}
  assert(!(await p.evaluate(()=>window.__fi2.lessonPass.sleeping)),'island loop is running for the idle window: '+(await p.evaluate(()=>document.querySelector('dialog[open]')?.textContent?.slice(0,80)??'no dialog')));};
 const clear=()=>p.evaluate(()=>{window.__audioLog.length=0;});
 const starts=()=>p.evaluate(()=>window.__audioLog.filter(e=>e.kind!=='stop'));
 const results={};
 // 1. Idle spots: live pitch, 7v7 side, traffic lane, NPC plaza, parked moped, hovering jetpack.
 const spots=await p.evaluate(()=>{const d=window.__fi2,g=d.games.entries.map(e=>e.venue),car=d.streetTraffic.cars[1].group.position,npc=d.islandNpcs.entries[0].position;
  return [['futsal-pitch',g[0].x,g[0].z,'walk'],['7v7-side',g[1].x+2,g[1].z,'walk'],['traffic-lane',car.x,car.z+8,'walk'],['npc-plaza',npc.x+1.5,npc.z,'walk'],['parked-moped',npc.x+1.5,npc.z,'moped']];});
 await p.mouse.move(560,440);
 for(const [name,x,z,ride] of spots){await place(x,z,ride);await settle();await p.mouse.move(560,440);await p.waitForTimeout(3000);await clear();await p.waitForTimeout(IDLE);const s=await starts();results[name]=s.length;assert.equal(s.length,0,`${name}: ${s.length} sound(s) with no input\n${s.map(e=>e.stack).join('\n')}`);}
 // 2. An NPC walks under a resting cursor: it gets hovered (pointer cursor, NPC pauses) but makes no sound.
 await place(spots[3][1],spots[3][2]);await settle();
 // Wait until the follow camera has the character framed (projected inside the viewport and holding still).
 await p.waitForFunction(()=>{const d=window.__fi2,v=d.camera.position.clone().set(d.location.x,d.rooftop.state.height+1,d.location.z).project(d.camera),k=Math.round(v.x*200)+':'+Math.round(v.y*200),ok=Math.abs(v.x)<.6&&Math.abs(v.y)<.6&&window.__camKey===k;window.__camKey=k;return ok;},null,{timeout:20000,polling:500}).catch(async e=>{console.log('CAM',await p.evaluate(()=>{const d=window.__fi2,v=d.camera.position.clone().set(d.location.x,d.rooftop.state.height+1,d.location.z).project(d.camera);return [v.x,v.y,d.camera.position.toArray(),d.location,d.rideRef.current];}));throw e;});
 const target=await p.evaluate(()=>{const d=window.__fi2,r=d.renderer.domElement.getBoundingClientRect(),x=d.location.x+3,z=d.location.z,y=d.rooftop.state.height,v=d.camera.position.clone().set(x,y+1,z).project(d.camera);return {x,z,y,sx:r.left+(v.x+1)/2*r.width,sy:r.top+(1-v.y)/2*r.height};});
 await p.mouse.move(target.sx,target.sy);await p.waitForTimeout(1200);await clear();
 const walker=await p.evaluate(t=>{const d=window.__fi2,e=d.islandNpcs.entries.filter(e=>!e.definition.travel&&!e.worker).sort((a,b)=>Math.hypot(a.position.x-t.x,a.position.z-t.z)-Math.hypot(b.position.x-t.x,b.position.z-t.z))[1];const at={x:t.x,y:t.y,z:t.z};Object.assign(e.position,at);e.route.splice(0,e.route.length,{...at});e.routine.target={...at};return e.id;},target);
 // One frame is enough to hover it; a hovered NPC pauses, so it stays under the cursor.
 await p.waitForTimeout(250);
 const hovered=await p.evaluate(()=>window.__fi2.renderer.domElement.style.cursor==='pointer');await p.waitForTimeout(1500);
 const walkIn=await starts();results['npc-walks-under-cursor']=walkIn.length;
 assert(hovered,`${walker} under the cursor should still be hovered (pointer cursor)`);
 assert.equal(walkIn.length,0,`NPC walking under a resting cursor made ${walkIn.length} sound(s)\n${walkIn.map(e=>e.stack).join('\n')}`);
 // A real pointer move still gets its hover tick.
 await p.mouse.move(40,40);await p.waitForTimeout(300);await clear();await p.mouse.move(target.sx,target.sy,{steps:4});await p.waitForTimeout(400);
 assert((await starts()).length>0,'moving the pointer onto an NPC still ticks');
 // 3. Parking the moped / landing the jetpack hum fades out instead of cutting mid-wave.
 await place(spots[3][1]+6,spots[3][2]+6,'moped');await settle();await p.waitForTimeout(2500);
 await p.keyboard.down('ArrowUp');await p.waitForTimeout(1800);await clear();await p.keyboard.up('ArrowUp');await p.waitForTimeout(3000);
 const cuts=await p.evaluate(()=>window.__audioLog.filter(e=>e.kind==='stop'&&(e.when===undefined||e.when<=e.now+.001)&&e.level>.001));
 results['moped-park-abrupt-cuts']=cuts.length;
 assert.equal(cuts.length,0,`parking cut ${cuts.length} sounding voice(s) without a fade`);
 // 4. Flying: only the jetpack hum (plus music) may sound. Idle with a resting cursor, then drifting on held keys (with key
 //    repeats, as a real keyboard sends) in a small square over the town, so buildings/NPCs sweep under the resting cursor.
 const nonFlight=()=>p.evaluate(()=>window.__audioLog.filter(e=>e.kind==='start'&&!(/Object\.move/.test(e.stack)&&!/voice/.test(e.stack))).map(e=>e.stack));
 await place(spots[3][1],spots[3][2],'jetpack');await settle();await p.mouse.move(560,440);await p.waitForTimeout(3000);
 await clear();await p.waitForTimeout(IDLE);let s=await nonFlight();results['fly-idle']=s.length;assert.equal(s.length,0,`fly-idle: ${s.length} non-flight sound(s)\n${s.join('\n')}`);
 await clear();{const end=Date.now()+IDLE;let k=0;const keys=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'];while(Date.now()<end){const key=keys[Math.floor(k/25)%4];await p.keyboard.down(key);k++;await p.waitForTimeout(30);if(k%25===0)await p.keyboard.up(key);}for(const key of keys)await p.keyboard.up(key);}
 await p.waitForTimeout(1500);s=await nonFlight();results['fly-drift-held-keys']=s.length;assert.equal(s.length,0,`fly-drift: ${s.length} non-flight sound(s)\n${s.join('\n')}`);
 assert.equal(await p.evaluate(()=>window.__fi2.rideRef.current),'jetpack','still flying');
 if(failures.length){console.log('IDLE_AUDIO_BROWSER_FAIL',JSON.stringify(results));for(const f of failures)console.log(' -',String(f).split('\n').slice(0,3).join(' / '));process.exitCode=1;}else console.log('IDLE_AUDIO_BROWSER_PASS',JSON.stringify(results));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
