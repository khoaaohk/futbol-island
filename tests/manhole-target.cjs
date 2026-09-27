// Manhole landing ring with REAL flight (needs the dev server on :8092 and Chrome). Desktop flies with the arrow keys, the phone with
// the touch joystick. From four approach angles: a normal fly-over puts the game's standard landing ring (the rooftop one, same size
// and style) around the cover, and the view never changes; choosing Walk inside the ring lands where the player comes down (no snap,
// no steering) and opens the cover; a collected cover is plain, with no ring.
// Only the start position is set by script (22 m out); every approach is flown with input. usage: node tests/manhole-target.cjs [outDir]
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'));}
const m={exports:{}};new Function('exports','module','require',ts.transpileModule(fs.readFileSync('lib/town/coinQuest.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports,m,()=>({}));
const COVERS=m.exports.COIN_QUEST.filter(s=>s.manhole),out=process.argv[2]||path.join(require('node:os').tmpdir(),'manhole-target');fs.mkdirSync(out,{recursive:true});
const ANGLES=[0,Math.PI/2,Math.PI,Math.PI*1.5];
// Screen up on the island is world (-16,-33); screen right is (33,-16) (the fixed follow camera).
const UP=[-16/36.67,-33/36.67],RIGHT=[33/36.67,-16/36.67];
const state=page=>page.evaluate(()=>{const d=window.__fi2;let root=d.coinHunt.root,mk=null;while(root.parent)root=root.parent;root.traverse(o=>{if(o.name==='jetpack-landing-marker')mk=o;});
 const v=mk.getWorldPosition(mk.position.clone()).project(d.camera),f=d.camera.getWorldDirection(mk.position.clone());return {look:[f.x,f.y,f.z],scale:mk.scale.x,ride:d.rideRef.current,x:d.location.x,z:d.location.z,h:d.flight.height,target:d.coinHunt.manholeTarget(),mx:mk.position.x,mz:mk.position.z,shown:mk.visible,sx:(v.x+1)/2,sy:(1-v.y)/2};});
async function steerer(page,mobile){
 if(!mobile){const held=new Set();return {async go(fu,fr){const want=[];if(fu>.35)want.push('ArrowUp');if(fu<-.35)want.push('ArrowDown');if(fr>.35)want.push('ArrowRight');if(fr<-.35)want.push('ArrowLeft');
   for(const k of [...held])if(!want.includes(k)){await page.keyboard.up(k);held.delete(k);}for(const k of want)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}},async stop(){for(const k of [...held])await page.keyboard.up(k);held.clear();}};}
 const box=await page.locator('.joystick').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2,cdp=await page.context().newCDPSession(page);let down=false;
 return {async go(fu,fr){const n=Math.hypot(fu,fr)||1,p={x:cx+fr/n*box.width*.45,y:cy-fu/n*box.height*.45};await cdp.send('Input.dispatchTouchEvent',{type:down?'touchMove':'touchStart',touchPoints:[p]});down=true;},
  async stop(){if(down)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});down=false;}};
}
/** Sets up 22 m out at `angle`, then flies with input toward (and past) the cover; returns what the flight saw. */
async function flyOver(page,cover,angle,mobile,{land=false,shot}={}){
 await page.evaluate(([x,z])=>{const d=window.__fi2;d.location.x=x;d.location.z=z;},[cover.x+Math.cos(angle)*22,cover.z+Math.sin(angle)*22]);await page.waitForTimeout(1500);
 const s0=await state(page),aim={x:cover.x-(s0.x-cover.x)*.6,z:cover.z-(s0.z-cover.z)*.6},steer=await steerer(page,mobile);// aim past the cover: a true fly-over
 const r={frames:0,onCover:0,minD:1e9,landed:false,opened:false,look:0,maxScale:0,press:null,at:null};let shotTaken=false;const L=Math.hypot(16,23,33),LOOK=[-16/L,-23/L,-33/L];
 for(let i=0;i<120;i++){const s=await state(page),d=Math.hypot(cover.x-s.x,cover.z-s.z);r.minD=Math.min(r.minD,d);
  if(s.target&&s.target.x===cover.x&&s.target.z===cover.z){r.frames++;if(s.shown&&s.mx===cover.x&&s.mz===cover.z)r.onCover++;r.maxScale=Math.max(r.maxScale,s.scale);
   r.look=Math.max(r.look,Math.hypot(s.look[0]-LOOK[0],s.look[1]-LOOK[1],s.look[2]-LOOK[2]));
   if(shot&&!shotTaken&&r.frames>=4){shotTaken=true;await page.screenshot({path:shot});}
   if(land&&d<4){await steer.stop();await page.waitForTimeout(700);const p=await state(page);// let go early, coast to a stop, then drop if inside
    if(Math.hypot(cover.x-p.x,cover.z-p.z)<2.5){r.press={x:p.x,z:p.z};await page.locator('.travel-mode').click();break;}}}
  const past=!land&&(r.minD<3||d<3),tx=past?aim.x:cover.x,tz=past?aim.z:cover.z,dx=tx-s.x,dz=tz-s.z,n=Math.hypot(dx,dz);if(!land&&n<1.5&&d>8)break;
  await steer.go((dx*UP[0]+dz*UP[1])/n,(dx*RIGHT[0]+dz*RIGHT[1])/n);await page.waitForTimeout(50);}
 await steer.stop();
 let descentShot=false;
 if(land){for(let k=0;k<80;k++){const s=await state(page);if(shot&&!descentShot&&s.h<7&&s.h>1.5){descentShot=true;r.descentRing=s.shown&&s.mx===cover.x&&s.mz===cover.z&&s.sx>0&&s.sx<1&&s.sy>0&&s.sy<1;r.descentAt=[s.sx,s.sy];await page.screenshot({path:shot});}
   if(s.ride!=='jetpack'){r.landed=true;r.at={x:s.x,z:s.z};break;}await page.waitForTimeout(75);}
  r.opened=await page.evaluate(id=>JSON.parse(localStorage.getItem('fi2-matchday-coins-v1')??'{}').revealed?.includes(id)??false,cover.id);}
 return r;
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{for(const [w,h,mobile] of [[1280,800,false],[390,844,true]]){
  const open=async()=>{const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:mobile,isMobile:mobile});const page=await ctx.newPage();
   await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');});
   await page.goto(process.env.FI_URL||'http://localhost:8092',{waitUntil:'domcontentloaded',timeout:180000});await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:180000});await page.waitForTimeout(1500);return {ctx,page};};
  let {ctx,page}=await open();
  assert.equal((await state(page)).ride,'jetpack','starts flying');
  // Fly-overs: the ring appears on the cover and is on screen, from every approach.
  let seen=0;const cover=COVERS[3];
  for(const [k,a] of ANGLES.entries()){const r=await flyOver(page,cover,a,mobile,{shot:k===0?`${out}/flyover-${w}x${h}.png`:undefined});
   console.log(`${w}×${h} fly-over from ${Math.round(a*180/Math.PI)}°: closest ${r.minD.toFixed(1)} m, ring on the cover ${r.onCover}/${r.frames} frames, max scale ${r.maxScale.toFixed(2)}, view change ${r.look.toExponential(1)}`);
   assert.ok(r.maxScale>=2.8&&r.maxScale<=3.5,`${w}: the standard ring, scaled to sit around the cover's rim (${r.maxScale.toFixed(2)})`);assert.ok(r.look<1e-3,`${w}: the view does not change over a manhole`);if(r.frames>0&&r.onCover>0)seen++;}
  assert.equal(seen,ANGLES.length,`${w}: the ring goes around the cover on every fly-over (${seen}/${ANGLES.length})`);
  // Landings: Walk while the ring shows flies onto the cover and opens it. A fresh page each time (the ball's lesson card follows).
  let opened=0;await ctx.close();
  for(const [k,a] of ANGLES.entries()){({ctx,page}=await open());const c=COVERS[10+k],r=await flyOver(page,c,a,mobile,{land:true,shot:k===0?`${out}/descent-${w}x${h}.png`:undefined});if(k===0){console.log(`${w}×${h} descent: ring around the cover on screen ${r.descentRing}`);if(r.descentAt)fs.writeFileSync(`${out}/descent-${w}x${h}.json`,JSON.stringify(r.descentAt));}
   const moved=r.press&&r.at?Math.hypot(r.at.x-r.press.x,r.at.z-r.press.z):NaN,off=r.at?Math.hypot(r.at.x-c.x,r.at.z-c.z):NaN;
   console.log(`${w}×${h} landing from ${Math.round(a*180/Math.PI)}°: landed ${r.landed} ${off.toFixed(1)} m from the centre (moved ${moved.toFixed(2)} m after Walk), opened ${r.opened}`);
   // Only the jetpack's own coast after letting go (≈1-2 m at cruise speed); never pulled onto the cover centre.
   assert.ok(moved<3&&off>.05,`${w}: lands where it comes down (no snap or steering onto the cover)`);assert.equal(r.opened,off<3.5,`${w}: opens exactly when the landing is within 3.5 m`);if(r.opened)opened++;await ctx.close();}
  ({ctx,page}=await open());
  assert.equal(opened,ANGLES.length,`${w}: choosing Walk over the ring opens the cover every time (${opened}/${ANGLES.length})`);
  // Collected: plain cover, no target.
  await page.evaluate(id=>{localStorage.setItem('fi2-matchday-coins-v1',JSON.stringify({version:4,rewardUnlocked:false,revealed:[id],collected:[id],hint:null,celebrated:false}));},cover.id);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:180000});await page.waitForTimeout(1500);
  const done=await flyOver(page,cover,0,mobile),st=await page.evaluate(()=>{const c=window.__fi2.coinHunt.covers;return {plain:c.isPlain(3),offset:c.offset(3),tweening:c.tweening};});
  assert.equal(done.frames,0,`${w}: no target on a collected cover`);assert.ok(st.plain&&st.offset<.01&&!st.tweening,`${w}: collected → plain design, cover present, not tweening`);
  await ctx.close();}}finally{await browser.close();}
 console.log('PASS manhole ring with real flight: the standard landing ring around the cover on every fly-over, no view change, landings stay where they come down and open within 3.5 m, collected covers plain');
})().catch(e=>{console.error(e);process.exit(1);});
