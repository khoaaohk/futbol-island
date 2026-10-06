// Island walking feel (A7, Oct 2026): touch-stick dead zone and walk floor, portrait centring, and the "you are here"
// pin when a building hides the player. Needs the dev server on :8092. Run: node scripts/check-walk-control-browser.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{for(const[k,v]of[['fi2-welcome-v1','completed'],['fi2-audio-mix','4-50-v1'],['fi2-sound-muted','true'],['fi2-music-enabled','false'],['fi2-voice-enabled','false']])localStorage.setItem(k,v);});
 await p.goto('http://localhost:8092');await p.waitForFunction(()=>window.__fi2?.walkBall&&window.__fi2?.player,null,{timeout:120000});await p.waitForTimeout(8000);
 const place=(x,z)=>p.evaluate(([x,z])=>{const d=window.__fi2;d.rideRef.current='walk';d.pendingRide.current=null;d.location.x=x;d.location.z=z;d.velocity.x=d.velocity.z=0;d.rooftop.reset(x,z);},[x,z]);
 const screen=()=>p.evaluate(()=>{const d=window.__fi2,v=d.player.root.position.clone().project(d.camera);return{x:(v.x+1)/2*innerWidth,speed:Math.hypot(d.velocity.x,d.velocity.z),pin:d.scene.getObjectByName('hidden-player-pin').visible};});
 await place(51,30);await p.waitForTimeout(2500);
 const open=await screen();assert(Math.abs(open.x-195)<12,'portrait walk camera centres the player: x='+open.x.toFixed(0));assert.equal(open.pin,false,'no pin in the open');
 const js=await p.evaluate(()=>{const r=document.querySelector('.joystick').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
 await p.mouse.move(js.x,js.y);await p.mouse.down();await p.mouse.move(js.x+2,js.y-3);await p.waitForTimeout(600);
 const rest=await screen();assert(rest.speed<.05,'a resting thumb (3.6 px) does not move the player: '+rest.speed);
 await p.mouse.move(js.x+4,js.y-6);await p.waitForTimeout(700);const slow=await screen();assert(slow.speed>1.25&&slow.speed<1.6,'a light push walks at the floor speed: '+slow.speed);
 await p.mouse.move(js.x+30,js.y-30);await p.waitForTimeout(800);const full=await screen();assert(full.speed>3.6,'full tilt is full walking speed: '+full.speed);
 await p.mouse.up();await p.waitForTimeout(600);
 await place(103,-8);await p.waitForTimeout(2500);// the default spawn, behind the High School garden terrace
 const hidden=await screen();assert.equal(hidden.pin,true,'hidden behind the garden building: the pin shows');
 await p.screenshot({path:'/tmp/fi-walk-control-hidden.png'});
 assert.deepEqual(errors,[]);console.log('WALK_CONTROL_BROWSER_PASS',{open:Math.round(open.x),slow:+slow.speed.toFixed(2),full:+full.speed.toFixed(2),hiddenPin:hidden.pin});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
