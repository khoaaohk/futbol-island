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
  const result=await page.evaluate(()=>{
   const d=window.__fi2,r=d.player,venue=d.games.entries.find(e=>e.venue.id==='futsal').venue;
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=640;const c=sheet.getContext('2d');
   d.renderer.setPixelRatio(1);d.renderer.setSize(240,300,false);
   if(d.camera.isOrthographicCamera){d.camera.left=-1.6;d.camera.right=1.6;d.camera.top=2;d.camera.bottom=-2;d.camera.zoom=1;}else d.camera.aspect=.8;
   d.camera.zoom=1;d.camera.updateProjectionMatrix();
   // Also verify the served bundle contains the response, rather than only testing source fixtures.
   for(let i=0;i<60;i++)r.update(venue.x,venue.z,1/60,0,false,{facing:0,resumePose:i===0});
   const shoulder=r.root.getObjectByName('left-shoulder'),before=shoulder.rotation.x;
   r.update(venue.x,venue.z,1/60,0,false,{facing:0,receive:1});
   const firstFrameShoulder=Math.abs(shoulder.rotation.x-before);
   r.root.scale.setScalar(1.12);r.root.rotation.x=0;r.root.rotation.z=0;
   let finite=true,frames=0;
   for(let row=0;row<2;row++){
    let x=venue.x,z=venue.z;
    for(let i=0;i<132;i++){
     const t=i/60,speed=row===0?2.6:t<1?4:Math.max(0,4-(t-1)*15);
     x+=(row===1&&t>1?speed/60:0);z+=(row===1&&t>1?0:speed/60);
     const m={facing:row===1&&t>1?Math.PI/2:0,runIntensity:.8,resumePose:i===0,receive:row===0&&t>=1&&t<1.4?1:0,kickSide:1,brake:row===1&&t>=1?1:0};
     r.update(x,z,1/60,t,false,m);r.root.position.y=(venue.elevation||0)+.105;r.root.visible=true;
     r.root.traverse(o=>{if(![...o.position,...o.quaternion].every(Number.isFinite))finite=false;});frames++;
     if(i>=54&&(i-54)%12===0&&(i-54)/12<6){
      const col=(i-54)/12;d.camera.position.set(x+3,3.1+(venue.elevation||0),z+4.5);d.camera.lookAt(x,1+(venue.elevation||0),z);d.camera.updateMatrix();d.camera.updateMatrixWorld(true);
      d.renderer.render(d.scene,d.camera);c.drawImage(d.renderer.domElement,col*240,row*320,240,300);
      c.fillStyle='#132b26';c.fillRect(col*240,row*320+300,240,20);c.fillStyle='white';c.font='12px sans-serif';c.fillText(`${row===0?'Run / receive':'Cut / stop'} ${t.toFixed(2)}s`,col*240+8,row*320+314);
     }
    }
   }
   return {finite,frames,firstFrameShoulder,png:sheet.toDataURL('image/png').split(',')[1]};
  });
  assert(result.finite);assert(result.firstFrameShoulder>.001&&result.firstFrameShoulder<.05,'served rig eases into receiving');assert.deepEqual(errors,[]);
  const output='/tmp/fi-fluidity-'+(process.env.MOBILE?'mobile':'desktop')+'.png';fs.writeFileSync(output,Buffer.from(result.png,'base64'));
  console.log('PLAYER_FLUIDITY_BROWSER_PASS',{frames:result.frames,firstFrameShoulder:result.firstFrameShoulder,output});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
