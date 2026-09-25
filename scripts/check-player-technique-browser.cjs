const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:process.env.MOBILE?390:1200,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day','day');});
  await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');
  await page.waitForFunction(()=>window.__fi2?.games?.entries?.length,null,{timeout:90000});
  for(const view of ['front','side','rear']){
   const result=await page.evaluate(view=>{
    const d=window.__fi2,r=d.player,e=d.games.entries.find(e=>e.venue.id==='9v9'),v=e.venue,x=v.x,z=v.z;
    const ball=e.ball.clone();d.scene.add(ball);ball.visible=true;
    r.root.scale.setScalar(1.12);r.root.rotation.x=r.root.rotation.z=0;r.root.visible=true;
    d.renderer.setPixelRatio(1);d.renderer.setSize(240,300,false);
    if(d.camera.isOrthographicCamera){d.camera.left=-1.5;d.camera.right=1.5;d.camera.top=1.9;d.camera.bottom=-1.9;}else d.camera.aspect=.8;
    d.camera.zoom=1;d.camera.updateProjectionMatrix();
    const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=1280;const c=sheet.getContext('2d');
    let finite=true,maxContactError=0,frames=0;
    for(const [row,kind]of ['pass','shot','loft','charged'].entries()){
     const motion={facing:0,kickSide:1,actionKind:kind==='charged'?'shot':kind,powerKick:kind==='charged',shotPower:1,samplePose:{speed:0,distance:0,heading:0}};
     r.update(x,z,0,0,false,{...motion,kick:.36});r.root.position.y=.105;
     const point=ball.position.clone();r.ballContact(1,point);maxContactError=Math.max(maxContactError,Math.hypot(point.x-x-.14*1.12,point.z-z-.65*1.12,point.y-.105-.19*1.12));
     for(const [column,kick]of [.1,.22,.36,.45,.6,.82].entries()){
      r.update(x,z,0,0,false,{...motion,kick});r.root.position.y=.105;r.root.visible=true;
      ball.position.copy(point);if(kick>.36){ball.position.z+=(kick-.36)*3;ball.position.y+=(kind==='loft'?2:kind==='pass'?0:.8)*(kick-.36);}
      d.camera.position.set(x+(view==='side'?4.5:0),2.1,z+(view==='front'?5:view==='rear'?-5:0));d.camera.lookAt(x,1,z+.2);d.camera.updateMatrixWorld(true);
      r.root.traverse(o=>{if(![...o.position,...o.quaternion].every(Number.isFinite))finite=false;});
      d.renderer.render(d.scene,d.camera);c.drawImage(d.renderer.domElement,column*240,row*320,240,300);
      c.fillStyle='#132b26';c.fillRect(column*240,row*320+300,240,20);c.fillStyle='white';c.font='12px sans-serif';c.fillText(`${kind} / ${view} / ${kick}`,column*240+8,row*320+314);frames++;
     }
    }
    ball.removeFromParent();return {finite,maxContactError,frames,png:sheet.toDataURL('image/png').split(',')[1]};
   },view);
   assert(result.finite);assert(result.maxContactError<.03,`served contact error ${result.maxContactError}`);
   const file=`/tmp/fi-technique-${process.env.MOBILE?'mobile':'desktop'}-${view}.png`;fs.writeFileSync(file,Buffer.from(result.png,'base64'));
   console.log({view,frames:result.frames,maxContactError:result.maxContactError,file});
  }
  assert.deepEqual(errors,[]);console.log('PLAYER_TECHNIQUE_BROWSER_PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
