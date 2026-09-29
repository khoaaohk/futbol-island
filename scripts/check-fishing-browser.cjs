const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const OUT=process.env.FISHING_SHOTS||require('os').tmpdir()+'/fishing-ac/';require('fs').mkdirSync(OUT,{recursive:true});
const [,,mode='desktop',spot='west-cove']=process.argv;
// FISHING_RARE=1 biases Math.random for the second fish only, so the rarer end of the spot's catch list bites (for a rare-catch screenshot).
const RARE=process.env.FISHING_RARE==='1';
const VP={desktop:{width:1280,height:800},mobile:{width:390,height:844},landscape:{width:844,height:390}}[mode];const touch=mode!=='desktop';
const spots={'south-pier':[217,211.4],'harbour-wall':[236,66],'north-rocks':[60,-237],'west-pier':[63,211.4],'west-cove':[-94.5,24]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Users/khoado/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const ctx=await browser.newContext({viewport:VP,isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?2:1});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,160));});
 const [x,z]=spots[spot];
 await page.addInitScript(([x,z])=>{sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x,z,yaw:0,ride:'walk',flightHeight:0}));const real=Math.random;Math.random=()=>window.__fishBias?.985+.015*real():real();},[x,z]);
 await page.goto((process.env.FUTBOL_BASE_URL||'http://localhost:8092')+'/?from=arcade');
 await page.waitForFunction(()=>window.__fi2&&!document.querySelector('[data-island-return-loading]'),null,{timeout:120000});
 await page.waitForTimeout(3000);
 const tag=`${mode}-${spot}`;const shot=n=>page.screenshot({path:OUT+`${tag}-${n}.png`});
 await shot('1-wide');
 const press=selector=>touch?page.locator(selector).tap({timeout:5000}):page.locator(selector).click({timeout:5000});
 const shadowAt=()=>page.evaluate(()=>{const f=window.__fi2.scene.getObjectByName('fishing-swimming-shadow');return f&&f.visible?{x:f.position.x,z:f.position.z}:null;});
 const approaches=[];
 const originalControls=await page.evaluate(()=>{const b=document.querySelector('.touch-shoot').getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height};});
 await press('[data-fish-enter]');
 const phase=()=>page.evaluate(()=>document.querySelector('[data-fishing-hud]')?.dataset.phase??null);
 const waitPhase=(p,t=25000)=>page.waitForFunction(p=>document.querySelector('[data-fishing-hud]')?.dataset.phase===p,p,{timeout:t}).catch(async()=>{throw Error('Expected phase '+p+', found '+await phase());});
 await waitPhase('floating');await page.waitForTimeout(500);await shot('2-cast');
 const layout=await page.evaluate(()=>{const reel=document.querySelector('[data-fish-reel]').getBoundingClientRect(),back=document.querySelector('[data-fish-stop]'),book=document.querySelector('[aria-label="Fishbook"]'),b=book.getBoundingClientRect(),j=document.querySelector('.touch-controls');return{reel:{x:reel.x,y:reel.y,width:reel.width,height:reel.height},gap:reel.x-b.right,bookSize:b.width,back:back.textContent,backRect:{x:back.getBoundingClientRect().x,y:back.getBoundingClientRect().y},joystickVisible:j&&getComputedStyle(j).visibility!=='hidden'&&getComputedStyle(j).display!=='none'};});
 if(!layout.back.includes('Back')||layout.backRect.x>50||layout.backRect.y>60)throw Error('Fishing Back is not in the top-left');
 if(touch&&(layout.joystickVisible||Math.abs(layout.reel.x-originalControls.x)>1||Math.abs(layout.reel.y-originalControls.y)>1||layout.reel.width!==originalControls.width||layout.bookSize!==layout.reel.width||layout.gap!==16))throw Error('Fishing controls do not match island layout: '+JSON.stringify({layout,originalControls}));
 console.log('fishing controls',JSON.stringify(layout));
 await waitPhase('approach');await page.waitForTimeout(60);const start1=await shadowAt();await page.waitForTimeout(440);
 const fishPose=()=>page.evaluate(()=>{const fish=window.__fi2.scene.getObjectByName('fishing-swimming-shadow');fish.updateMatrixWorld(true);const m=fish.matrixWorld.elements;return {x:fish.position.x,z:fish.position.z,nx:-m[8],nz:-m[10],vertices:Array.from(fish.geometry.attributes.position.array)};});
 const before=await fishPose();await page.waitForTimeout(180);const after=await fishPose();const dx=after.x-before.x,dz=after.z-before.z,dot=(dx*after.nx+dz*after.nz)/(Math.hypot(dx,dz)*Math.hypot(after.nx,after.nz));
 if(!(dot>.85))throw Error('Fish is not swimming nose-first: '+dot);
 if(!after.vertices.some((v,i)=>Math.abs(v-before.vertices[i])>.001))throw Error('Swimming tail has no motion');
 console.log('fish nose/travel alignment',dot.toFixed(3));await shot('3-shadow');
 await waitPhase('nibble');{const end=await shadowAt();if(start1&&end)approaches.push(Math.round(Math.atan2(start1.x-end.x,start1.z-end.z)*180/Math.PI));}
 // An early tap must visibly scare the fish, then allow a natural retry.
 await press('[data-fish-reel]');await waitPhase('scared');if(RARE)await page.evaluate(()=>{window.__fishBias=true;});
 const fleeingBefore=await fishPose();await page.waitForTimeout(140);const fleeingAfter=await fishPose(),fx=fleeingAfter.x-fleeingBefore.x,fz=fleeingAfter.z-fleeingBefore.z;
 const fleeDot=(fx*fleeingAfter.nx+fz*fleeingAfter.nz)/(Math.hypot(fx,fz)*Math.hypot(fleeingAfter.nx,fleeingAfter.nz));
 if(!(fleeDot>.85))throw Error('Escaping fish is not swimming nose-first: '+fleeDot);
 console.log('escaping fish nose/travel alignment',fleeDot.toFixed(3));await shot('4b-early-tap');
 await page.waitForFunction(()=>['approach','nibble','bite'].includes(document.querySelector('[data-fishing-hud]')?.dataset.phase),null,{timeout:25000});
 if(RARE)await page.evaluate(()=>{window.__fishBias=false;});await page.waitForTimeout(60);const start2=await phase()==='approach'?await shadowAt():null;await page.waitForTimeout(1400);if(await phase()==='approach')await shot('4c-second-approach');
 await page.waitForFunction(()=>['nibble','bite'].includes(document.querySelector('[data-fishing-hud]')?.dataset.phase),null,{timeout:40000});{const end=await shadowAt();if(start2&&end)approaches.push(Math.round(Math.atan2(start2.x-end.x,start2.z-end.z)*180/Math.PI));}
 console.log('approach bearings from the float (deg)',JSON.stringify(approaches));
 await waitPhase('bite');
 await press('[data-fish-reel]');
 await waitPhase('reeling');await shot('5b-hooked');
 const rodPose=()=>page.evaluate(()=>{const rod=window.__fi2.scene.getObjectByName('fishing-rod'),crank=window.__fi2.scene.getObjectByName('fishing-reel-crank');return {vertices:Array.from(rod.geometry.attributes.position.array),turn:crank.rotation.z};});
 await page.waitForTimeout(350);const relaxed=await rodPose();await press('[data-fish-reel]');await page.waitForTimeout(110);const pulled=await rodPose();
 if(!pulled.vertices.some((v,i)=>Math.abs(v-relaxed.vertices[i])>.003))throw Error('Rod does not flex on a reel tap');
 if(Math.abs(pulled.turn-relaxed.turn)<.05)throw Error('Reel crank does not turn after accepted tap');
 console.log('accepted reel tap flexed rod and turned crank');
 const attachment=await page.evaluate(([x,z])=>{const fish=window.__fi2.scene.getObjectByName('fishing-reeled-fish'),line=window.__fi2.scene.getObjectByName('fishing-line');fish.updateWorldMatrix(true,false);line.updateWorldMatrix(true,false);const mouth=fish.localToWorld(fish.position.clone().set(-.5,0,0)),center=fish.getWorldPosition(fish.position.clone()),end=line.localToWorld(fish.position.clone().fromBufferAttribute(line.geometry.attributes.position,line.geometry.attributes.position.count-1));const nx=mouth.x-center.x,nz=mouth.z-center.z,px=x-center.x,pz=z-center.z;return{mouthGap:mouth.distanceTo(end),noseDotPull:(nx*px+nz*pz)/(Math.hypot(nx,nz)*Math.hypot(px,pz))};},[x,z]);
 if(attachment.mouthGap>.0001||attachment.noseDotPull<.9)throw Error('Fish mouth is not leading/attached to line: '+JSON.stringify(attachment));
 console.log('mouth attachment',JSON.stringify(attachment));const meter=()=>page.evaluate(()=>{const m=document.querySelector('[data-reel-meter]');return m?m.getAttribute('aria-valuetext'):null;});
 console.log('reel meter at start',await meter());
 for(let n=0;n<32&&await phase()==='reeling';n++){await page.waitForTimeout(240);await press('[data-fish-reel]');if(n===3){await shot('5c-reeling');console.log('reel meter after 4 taps',await meter());}}
 await waitPhase('caught');await page.waitForTimeout(700);await shot('6-catch');
 const caught=await page.evaluate(()=>localStorage.getItem('fi2-fishbook-v1'));
 console.log('catch card',JSON.stringify(await page.evaluate(()=>document.querySelector('[data-fish-catch]')?.innerText.replace(/\s+/g,' ').slice(0,220))));
 // The Fishbook: spot sections, "Found at", silhouettes for the undiscovered.
 await press('[aria-label="Fishbook"]');await page.waitForSelector('[data-fishbook][open]',{timeout:8000});await page.waitForTimeout(600);await shot('9a-fishbook');
 await page.evaluate(s=>document.querySelector(`[data-fishbook-spot="${s}"]`)?.scrollIntoView({block:'start'}),spot);await page.waitForTimeout(400);await shot('9b-fishbook-spot');
 console.log('fishbook sections',JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('[data-fishbook-spot]')].map(e=>e.querySelector('h3')?.textContent))));
 await page.keyboard.press('Escape');await page.waitForTimeout(500);
 await press('[data-fish-stop]');await page.waitForTimeout(350);await shot('7-returning');await page.waitForTimeout(1200);await shot('8-returned');
 const st=await page.evaluate(()=>({hud:!!document.querySelector('[data-fishing-hud]'),live:window.__fi2.scene.getObjectByName('fishing-live')?.visible}));
 console.log(tag,'book',caught,'after',JSON.stringify(st),'errors',errors.slice(0,4));
 if(st.hud||st.live)throw Error('Fishing did not sleep after Stop');
 if(errors.length)throw Error('Browser errors: '+errors.join('; '));
 await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
