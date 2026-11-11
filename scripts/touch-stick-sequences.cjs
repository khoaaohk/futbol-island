// Nov 11 2026 (owner, iPhone: "the thumb controls on the bottom left is getting stuck on mobile"). Real CDP touch sequences for an
// arcade stick: one touch held on the stick while a second taps a button, lifts in both orders, drags far outside the ring, touchCancel,
// fast re-touches, and the iOS fault itself (the stick element never hears its pointerup / pointercancel / lostpointercapture: the
// init script below swallows them when window.__dropStick names the stick's selector). After every release the caller's read() must
// show a centred knob and a zero vector, and a fresh press must still steer. Used by check-soccer-tennis-browser.cjs and
// check-breakaway-browser.cjs with --touch.
const assert=require('node:assert/strict');
/** addInitScript: runs before the app's own window listeners so it can hide events from them, as iOS WebKit does. */
const dropInit=()=>{const drop=e=>{const sel=window.__dropStick;if(sel&&e.target instanceof Element&&e.target.closest(sel))e.stopImmediatePropagation();};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,drop,true);
 window.addEventListener('touchend',e=>{if(window.__dropTouchEnd)e.stopImmediatePropagation();},true);};
/** run(page,cdp,{stick:{x,y} centre, reach px, button:{x,y}, selector, read():{x,y,knob,steer}, settle ms}) */
async function runStickSequences(page,cdp,o){
 const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts}),S=(dx,dy)=>({x:o.stick.x+dx,y:o.stick.y+dy,id:1}),B={...o.button,id:2},r=o.reach,wait=ms=>page.waitForTimeout(ms);
 const seqs=[
  ['plain hold and lift',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await wait(150);await T('touchEnd',[]);}],
  ['stick + button, lift stick first',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await T('touchStart',[S(r,-r),B]);await wait(120);await T('touchEnd',[B]);await wait(80);await T('touchEnd',[]);}],
  ['stick + button, lift button first',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await T('touchStart',[S(r,-r),B]);await wait(120);await T('touchEnd',[S(r,-r)]);await T('touchMove',[S(r,-r*.6)]);await wait(80);await T('touchEnd',[]);}],
  ['button first, then stick',async()=>{await T('touchStart',[B]);await T('touchStart',[B,S(0,0)]);await T('touchMove',[B,S(r,-r)]);await wait(120);await T('touchEnd',[S(r,-r)]);await T('touchEnd',[]);}],
  ['drag far outside the ring',async()=>{await T('touchStart',[S(0,0)]);for(let i=1;i<=6;i++)await T('touchMove',[S(r*1.5*i,-r*2*i)]);await wait(100);await T('touchEnd',[]);}],
  ['touchCancel with a second finger down',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await T('touchStart',[S(r,-r),B]);await wait(100);await T('touchCancel',[]);}],
  ['fast re-touches',async()=>{for(let i=0;i<5;i++){await T('touchStart',[S(r*.3,-r*.3)]);await T('touchMove',[S(r,-r)]);await T('touchEnd',[]);}}],
  ['iOS: pointerup lost, touchend arrives',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await page.evaluate(s=>{window.__dropStick=s;},o.selector);await T('touchEnd',[]);await page.evaluate(()=>{window.__dropStick=null;});}],
  ['iOS: pointerup lost while a button is held',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await T('touchStart',[S(r,-r),B]);await page.evaluate(s=>{window.__dropStick=s;},o.selector);await T('touchEnd',[B]);await page.evaluate(()=>{window.__dropStick=null;});await wait(80);await T('touchEnd',[]);}],
  ['iOS: every release lost, the next press takes over',async()=>{await T('touchStart',[S(0,0)]);await T('touchMove',[S(r,-r)]);await page.evaluate(s=>{window.__dropStick=s;window.__dropTouchEnd=true;},o.selector);await T('touchEnd',[]);await page.evaluate(()=>{window.__dropStick=null;window.__dropTouchEnd=false;});
   await T('touchStart',[S(0,0)]);await T('touchMove',[S(-r,0)]);await wait(80);const v=await o.read();assert(v.steer<0,`a new press takes a stale stick over: ${JSON.stringify(v)}`);await T('touchEnd',[]);}],
 ];
 const results=[];
 for(const [name,run] of seqs){await run();await wait(o.settle??200);const v=await o.read();
  assert.equal(v.x,0,`${name}: vector x is 0 after release (${JSON.stringify(v)})`);assert.equal(v.y,0,`${name}: vector y is 0 after release`);assert.match(v.knob,/^translate\(0px,? 0px\)$|^$/,`${name}: knob is centred (${v.knob})`);
  if(o.stopped)assert(await o.stopped(),`${name}: the player stops`);
  await T('touchStart',[S(0,0)]);await T('touchMove',[S(-r,0)]);await wait(80);const live=await o.read();await T('touchEnd',[]);await wait(120);assert(live.steer<0,`${name}: the stick still steers afterwards (${JSON.stringify(live)})`);
  results.push(name);}
 return results;
}
module.exports={dropInit,runStickSequences};
