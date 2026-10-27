// Strikers round 3 cinematic beats (lib/arcade/strikerCinema.ts, docs/ARCADE_STRIKERS_R3_OCT26.md): slow-mo ramps back to 1x, hard
// caps (one slow-mo per 8 s, at most .9 s held, beats <= 2.4 s, zoom within 12%), priorities, skip, reduced motion = nothing.
// Run: node tests/strikers-r3-cinema.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const src=read('lib/arcade/strikerCinema.ts'),mod={exports:{}};
new Function('module','exports',ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(mod,mod.exports);
const C=mod.exports,run=(c,seconds,step=1/60,fn)=>{let min=1;for(let t=0;t<seconds;t+=step){c.update(step);min=Math.min(min,c.timeScale);fn?.(c);}return min;};
// Through on goal: dips to the slow-mo floor quickly, holds <= .9 s real, ramps back to exactly 1x.
{const c=C.createStrikerCinema({reduced:false});assert.equal(c.trigger('through',10,0,25,0),true);
 let slowTime=0;const min=run(c,3,1/60,x=>{if(x.timeScale<.99)slowTime+=1/60;assert.ok(x.timeScale>=C.CINEMA_MIN_SCALE-1e-9,'never below the floor');assert.ok(Math.abs(x.zoom-1)<=C.CINEMA_ZOOM_CAP+1e-9,'zoom within 12%');});
 assert.ok(min<=.4,'a real slow-mo (min '+min+')');assert.ok(slowTime<=C.CINEMA_MAX_SLOW+C.CINEMA_RAMP_IN+C.CINEMA_RAMP_OUT+.02,'slow-mo is short ('+slowTime.toFixed(2)+' s)');
 assert.equal(c.timeScale,1,'back to 1x');assert.equal(c.beat,'','beat over');assert.equal(c.amount,0);
 // Frequency cap: a second through inside 8 s does not play (no slow-mo spam); after 8 s it does.
 assert.equal(c.trigger('through',10,0,25,0),false,'one slow-mo per 8 s');run(c,6);assert.equal(c.trigger('through',10,0,25,0),true);run(c,3);assert.equal(c.slowCount,2);}
// release() (the shot) ramps the slow-mo straight back up.
{const c=C.createStrikerCinema({reduced:false});c.trigger('through',10,0,25,0);run(c,.25);assert.ok(c.timeScale<.5);c.release();run(c,C.CINEMA_RAMP_OUT+.05);assert.equal(c.timeScale,1,'release ramps back to 1x');}
// Beats never outlast the cap; no camera beat slows time except through.
for(const beat of Object.keys(C.CINEMA_SPECS)){const c=C.createStrikerCinema({reduced:false});assert.equal(c.trigger(beat,0,0),true,beat);let t=0;while(c.beat&&t<5){c.update(1/30);t+=1/30;if(beat!=='through')assert.equal(c.timeScale,1,beat+' keeps 1x');}
 assert.ok(t<=C.CINEMA_MAX_LEN+.05,beat+' capped ('+t.toFixed(2)+' s)');assert.equal(c.amount,0);}
// Priorities: a tackle punch never cuts into a goal push-in; a goal interrupts a tackle. Tackles are rate-limited.
{const c=C.createStrikerCinema({reduced:false});c.trigger('goal',20,0,25,0);run(c,.4);assert.equal(c.trigger('tackle',0,0),false);assert.equal(c.beat,'goal');
 const d=C.createStrikerCinema({reduced:false});d.trigger('tackle',0,0);run(d,.2);assert.equal(d.trigger('goal',20,0,25,0),true);run(d,3);assert.equal(d.trigger('tackle',0,0),true);run(d,1);assert.equal(d.trigger('tackle',0,0),false,'tackle gap');}
// Charge re-triggers keep the beat alive without restarting it; the strike takes over.
{const c=C.createStrikerCinema({reduced:false});c.trigger('charge',10,0,25,0);for(let i=0;i<120;i++){c.update(1/60);c.trigger('charge',10,0,25,0);}assert.equal(c.beat,'charge');assert.ok(c.amount>.9,'held while charging');assert.equal(c.timeScale,1,'the sim owns charge slow-mo');
 assert.equal(c.trigger('strike',10,0,25,0),true);c.follow(14,1);run(c,.3);assert.equal(c.gx,14);}
// Skip: back to normal at once.
{const c=C.createStrikerCinema({reduced:false});c.trigger('through',10,0,25,0);run(c,.3);c.skip();assert.equal(c.timeScale,1);assert.equal(c.beat,'');assert.equal(c.amount,0);}
// Reduced motion: nothing triggers, ever.
{const c=C.createStrikerCinema({reduced:true});for(const beat of Object.keys(C.CINEMA_SPECS))assert.equal(c.trigger(beat,0,0),false,beat);run(c,1);assert.equal(c.timeScale,1);assert.equal(c.zoom,1);}
// Wiring: the sim takes the slower of the charge slow-mo and the cinema; the scene blends the camera; the match loop triggers beats.
const match=read('lib/arcade/strikerMatch.ts'),scene=read('lib/arcade/strikerScene.ts'),live=read('components/LiveArcadeMatch.tsx');
assert.match(match,/state\.timeScale=Math\.min\(state\.shotMoment>0\?\.35:1-focus\*\.65,clamp\(state\.cinemaScale,\.3,1\)\)/);
assert.match(scene,/const cinema=createStrikerCinema\(\{reduced:stage\.reduced\}\)/);assert.match(scene,/const ca=motion\?cinema\.amount:0/);
for(const b of ['goal','strike','save','tackle','setpiece','kickoff','fulltime','through','charge'])assert.match(live,new RegExp(`cin(ema)?\\.trigger\\('${b}'`),b+' is triggered');
assert.match(live,/match\.state\.cinemaScale=visual\.cinema\.timeScale;match\.step/);
// No allocation in update(): no object/array literals or `new` inside it.
const upd=src.slice(src.indexOf('update(dt:number){'),src.indexOf('get slowing'));assert.doesNotMatch(upd,/new |\[\]|\{\s*\w+:/,'update() allocates nothing');
console.log('strikers-r3-cinema ok');
