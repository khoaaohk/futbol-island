/**
 * "Add Futbol Island to your Home Screen" (Nov 14 2026, retention: 85% of save codes never come back, ~70% of visitors are on
 * phones, and the Home Screen icon opens /play straight away, app/manifest.ts start_url). One gentle in-game note per device,
 * components/HomeScreenTip.tsx. Kid-safe: it collects nothing, asks for no permission and sends nothing; installing is the
 * browser's own dialog (Android Chrome / Edge / Samsung: beforeinstallprompt) or two taps the note names (iPhone / iPad Safari).
 *
 * The rule (pure, tests/retention-front.cjs): a phone or tablet (coarse pointer), not already opened from the Home Screen, this
 * device holds a save code ("your island is saved" must be true), never shown here before, and the player has been on the island
 * for HOME_TIP_AFTER_MS this visit (the first session's end is where most kids leave).
 */
export const HOME_TIP_KEY='fi2-home-tip-v1';// device key (lib/saves/snapshot.ts DEVICE_KEYS): the day it was shown
export const HOME_TIP_AFTER_MS=150_000;
export const HOME_TIP_SHOW_MS=12_000;
export type HomeTipEnv={coarse:boolean;standalone:boolean;hasCode:boolean;shownBefore:boolean};
export const shouldOfferHomeTip=(e:HomeTipEnv)=>e.coarse&&!e.standalone&&e.hasCode&&!e.shownBefore;

export type HomeTipPlatform='prompt'|'ios'|'menu';
/** What the note says: the browser's own install button when it offered one; the Share sheet on iPhone / iPad; else the menu. */
export function homeTipPlatform(ua:string,touchMac:boolean,hasPrompt:boolean):HomeTipPlatform{
 if(hasPrompt)return 'prompt';
 return /iP(hone|od|ad)/.test(ua)||touchMac?'ios':'menu';
}
export const HOME_TIP_TITLE='Your island is saved';
export function homeTipText(p:HomeTipPlatform):string{
 return p==='prompt'?'Add Futbol Island to your Home Screen to come back in one tap. Tap here'
  :p==='ios'?'Come back in one tap: press Share, then Add to Home Screen'
  :'Come back in one tap: open the browser menu, then Add to Home Screen';
}

/** Opened from the Home Screen icon (or installed app window). */
export function isStandalone():boolean{
 try{return matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;}catch{return false;}
}

/** The browser's install offer (Chromium's beforeinstallprompt), kept for the note's tap. Listened for from the title screen on. */
type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice?:Promise<{outcome:'accepted'|'dismissed'}>};
let deferred:InstallPrompt|null=null,listening=false;
export function listenForInstallPrompt(){
 if(listening||typeof window==='undefined')return;listening=true;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e as InstallPrompt;});
 window.addEventListener('appinstalled',()=>{deferred=null;});
}
export const hasInstallPrompt=()=>deferred!==null;
/** Show the browser's own install dialog (once per offer); true when the player accepted. */
export async function promptInstall():Promise<boolean>{
 const d=deferred;if(!d)return false;deferred=null;
 try{await d.prompt();const c=await d.userChoice;return c?.outcome==='accepted';}catch{return false;}
}
