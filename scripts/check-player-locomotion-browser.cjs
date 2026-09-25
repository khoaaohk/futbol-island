const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
 await page.goto('http://localhost:8092');await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:90000});
 const result=await page.evaluate(()=>{const d=window.__fi2,results=[];for(const entry of d.games.entries){const v=entry.venue;
 d.camera.position.set(v.x+28,(v.elevation||0)+50,v.z+50);d.camera.lookAt(v.x,v.elevation||0,v.z);d.camera.updateMatrixWorld();d.games.setPaused(v.id,false);
 let sprint=0,defensive=0,maxLean=0,finite=true;
 for(let i=0;i<360;i++){d.games.update(1/60,i/60,d.camera,null,true,v.id);for(const rig of entry.rigs.values()){
 const m=rig.root.userData.liveMotion;if(m?.runIntensity>.9)sprint++;if(m?.jockey>.2)defensive++;
 maxLean=Math.max(maxLean,rig.root.getObjectByName('armor-torso').rotation.x);
 rig.root.traverse(n=>{if(![...n.position,...n.quaternion].every(Number.isFinite))finite=false;});}}
 d.renderer.render(d.scene,d.camera);results.push({format:v.id,sprint,defensive,maxLean,finite});
 }return{results,png:d.renderer.domElement.toDataURL('image/png').split(',')[1]};});
 fs.writeFileSync('/tmp/fi-locomotion-live.png',Buffer.from(result.png,'base64'));
 console.log(result.results);for(const r of result.results){assert(r.finite);assert(r.sprint>0);assert(r.maxLean>.2);}assert(result.results.some(r=>r.defensive>0));assert.deepEqual(errors,[]);console.log('LIVE_LOCOMOTION_BROWSER_PASS',result.results);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
