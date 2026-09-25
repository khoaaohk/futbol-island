const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const page=await browser.newPage({viewport:{width:process.env.MOBILE?390:1200,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day','day');});await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:90000});
 const data=await page.evaluate(()=>{
  const d=window.__fi2,results=[],captures=[];const mapIds=new Set(d.games.entries.map(e=>e.ball.material.map?.uuid));
  const capture=(e,name)=>{const v=e.venue,z=v.z-v.length/2;d.camera.position.set(v.x+5,(v.elevation||0)+4,z+10);d.camera.lookAt(v.x,(v.elevation||0)+1,z);d.camera.zoom=1;d.camera.updateProjectionMatrix();d.camera.updateMatrixWorld();d.renderer.render(d.scene,d.camera);captures.push({name,png:d.renderer.domElement.toDataURL('image/png').split(',')[1]});};
  for(const entry of d.games.entries){const v=entry.venue,s=entry.sim;d.games.setPaused(v.id,false);
   for(const kind of ['high-left','high-right','post','bar']){
    s.restart=null;s.goalHold=0;s.possession='gold';s.recv.id=null;
    for(const p of Object.values(s.players))Object.assign(p,{x:250,y:200,vx:0,vy:0,kick:0});
    const p=Object.values(s.players).find(p=>p.team==='gold'&&!p.isGK);Object.assign(p,{x:135,y:68});s.ball.owner=p.id;const frameStart=s.frameContact.serial;
    const xg=(.34-(60-28)*.0035)*s.T.finish;let n=0,old=s.rng;
    s.rng=()=>n++===0?(kind.startsWith('high')?.01:kind==='post'?xg+.03:xg+.09):kind==='high-right'?.75:.25;
    s.doShot(p.id);s.rng=old;let maximum=0,count=0;
    for(let i=0;i<240;i++){
     d.camera.position.set(v.x+8,(v.elevation||0)+10,v.z-v.length/2+18);d.camera.lookAt(v.x,(v.elevation||0)+1,v.z-v.length/2);d.camera.updateMatrixWorld();
     d.games.update(1/120,i/120,d.camera,null,true,v.id);maximum=Math.max(maximum,entry.ball.position.y);count++;
     if(s.goalHold>0||s.frameContact.serial>frameStart)break;
    }
    const outcome=s.frameContact.serial>frameStart?s.frameContact.part:s.goalHold>0?'goal':'unresolved';results.push({format:v.id,kind,outcome,maximum,count,ball:entry.ball.position.toArray()});
    if(v.id==='9v9')capture(entry,kind);
   }
  }
  // Close enough to judge pattern and separation from the legs during a normal dribble.
  const e=d.games.entries.find(e=>e.venue.id==='9v9'),s=e.sim,v=e.venue;s.restart=null;s.goalHold=0;s.recv.id=null;const p=Object.values(s.players).find(p=>p.team==='gold'&&!p.isGK);
  Object.assign(p,{x:135,y:200,vx:0,vy:-35,kick:0});s.ball.owner=p.id;s.ball.target=null;s.ball.height=0;d.games.setPaused(v.id,true);
  const r=e.rigs.get(p.id);r.root.userData.liveMotion=undefined;d.games.update(0,0,d.camera,null,true,v.id);
  const ahead=(e.ball.position.x-r.root.position.x)*Math.sin(r.root.rotation.y)+(e.ball.position.z-r.root.position.z)*Math.cos(r.root.rotation.y);
  d.camera.position.set(r.root.position.x+2.2,(v.elevation||0)+2.1,r.root.position.z+3);d.camera.lookAt(e.ball.position.x,(v.elevation||0)+.65,e.ball.position.z);d.camera.updateMatrixWorld();d.renderer.render(d.scene,d.camera);captures.push({name:'dribble-panels',png:d.renderer.domElement.toDataURL('image/png').split(',')[1]});
  return {results,captures,ahead,sharedMap:mapIds.size===1&&e.ball.material.map?.name==='shared-live-football-panels'};
 });
 assert(data.sharedMap,'one patterned ball map shared across formats');assert(data.ahead>=.8,'dribble in front of stride');
 for(const r of data.results)assert.equal(r.outcome,r.kind.startsWith('high')?'goal':r.kind==='bar'?'crossbar':'post',JSON.stringify(r));
 assert.deepEqual(errors,[]);for(const c of data.captures)fs.writeFileSync('/tmp/fi-engine-'+(process.env.MOBILE?'mobile-':'')+c.name+'.png',Buffer.from(c.png,'base64'));
 console.log('GAME_ENGINE_BROWSER_PASS',{sharedMap:data.sharedMap,ahead:data.ahead,results:data.results});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
