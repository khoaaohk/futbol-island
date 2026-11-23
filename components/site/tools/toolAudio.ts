/**
 * Beeps and the screen wake lock for the match timer and the beep test (Nov 22 2026). The AudioContext is made on a tap (phones
 * only allow sound after one) and closed when the tool stops, so nothing stays alive in the background. Beeps are short sine
 * tones scheduled on the audio clock, which is exact to the millisecond even when the screen is slow to redraw.
 */
type Ctx=AudioContext;
export function makeAudio():Ctx|null{
 try{const A=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!A)return null;const c=new A();void c.resume();return c;}catch{return null;}
}
/** One tone at audio time `at` (seconds on ctx.currentTime), `dur` seconds long. */
export function tone(ctx:Ctx,at:number,freq=880,dur=.18,gain=.5){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=freq;
 const t=Math.max(at,ctx.currentTime);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.008);g.gain.setValueAtTime(gain,t+dur-.02);g.gain.linearRampToValueAtTime(0,t+dur);
 o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+dur+.02);
}
export const doubleBeep=(ctx:Ctx)=>{const t=ctx.currentTime+.02;tone(ctx,t,988,.14,.4);tone(ctx,t+.22,988,.14,.4);};
export const whistle=(ctx:Ctx)=>{const t=ctx.currentTime+.02;tone(ctx,t,784,.35,.6);tone(ctx,t+.45,988,.35,.6);tone(ctx,t+.9,1175,.6,.6);};
export function closeAudio(ctx:Ctx|null){try{void ctx?.close();}catch{/* already closed */}}
type Lock={release:()=>Promise<void>};
/** Ask the screen to stay on; returns a release function (a no-op where the browser has no wake lock). */
export async function keepAwake():Promise<()=>void>{
 try{const wl=(navigator as unknown as {wakeLock?:{request:(t:'screen')=>Promise<Lock>}}).wakeLock;if(!wl||document.visibilityState!=='visible')return ()=>{};
  const l=await wl.request('screen');return ()=>{void l.release().catch(()=>{});};}catch{return ()=>{};}
}
export const store={get<T>(k:string):T|null{try{return JSON.parse(window.localStorage.getItem(k)??'null') as T|null;}catch{return null;}},
 set(k:string,v:unknown){try{window.localStorage.setItem(k,JSON.stringify(v));}catch{/* storage is optional */}},
 del(k:string){try{window.localStorage.removeItem(k);}catch{/* storage is optional */}}};
