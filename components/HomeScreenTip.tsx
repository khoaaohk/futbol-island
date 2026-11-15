'use client';
import {useEffect,useState} from 'react';
import styles from './CostumeMilestoneToast.module.css';
import HudSlot from './HudStack';
import {toastLane,useToastLaneBusy} from '@/lib/ui/toastLane';
import {count} from '@/lib/analytics/tracker';
import {LOCAL_CODE_KEY,LOCAL_CODE_RE} from '@/lib/boot/titleCode';
import {HOME_TIP_AFTER_MS,HOME_TIP_KEY,HOME_TIP_SHOW_MS,HOME_TIP_TITLE,hasInstallPrompt,homeTipPlatform,homeTipText,isStandalone,promptInstall,shouldOfferHomeTip,type HomeTipPlatform} from '@/lib/pwa/homeScreen';

/**
 * "Your island is saved · Add Futbol Island to your Home Screen" (Nov 14 2026, retention; lib/pwa/homeScreen.ts has the rule).
 * Once per device, on phones and tablets with a save code, after HOME_TIP_AFTER_MS on the island. It takes the one toast lane
 * like the other island notes (it waits for Welcome back and any note showing) and wears the same cream pill. A tap: the
 * browser's own install dialog where there is one, otherwise it just closes (the line already says the two taps). One wait and
 * one hide timeout, no loop. Counted: st:home_tip (shown), st:home_add (the install dialog accepted).
 */
export default function HomeScreenTip({blocked:held}:{blocked:boolean}){
 const busy=useToastLaneBusy('home'),blocked=held||busy;
 const [due,setDue]=useState(false),[shown,setShown]=useState<HomeTipPlatform|null>(null),[done,setDone]=useState(false);
 useEffect(()=>{
  let ls:Storage|null=null;try{ls=localStorage;}catch{/* no storage: no note */}
  const code=ls?.getItem(LOCAL_CODE_KEY)??'',coarse=(()=>{try{return matchMedia('(pointer: coarse)').matches;}catch{return false;}})();
  if(!ls||!shouldOfferHomeTip({coarse,standalone:isStandalone(),hasCode:LOCAL_CODE_RE.test(code),shownBefore:ls.getItem(HOME_TIP_KEY)!==null}))return;
  const t=setTimeout(()=>setDue(true),HOME_TIP_AFTER_MS);return()=>clearTimeout(t);
 },[]);
 useEffect(()=>{if(!due||shown||done)return;
  if(toastLane.held||blocked){toastLane.want('home');return;}
  if(!toastLane.settle('home')||!toastLane.request('home'))return;
  try{localStorage.setItem(HOME_TIP_KEY,new Date().toISOString().slice(0,10));}catch{/* shown this visit only */}
  const touchMac=/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1;
  setShown(homeTipPlatform(navigator.userAgent,touchMac,hasInstallPrompt()));count('st:home_tip');
 },[due,blocked,shown,done]);
 useEffect(()=>{if(!shown)return;const t=setTimeout(()=>{setShown(null);setDone(true);},HOME_TIP_SHOW_MS);
  return()=>{clearTimeout(t);toastLane.release('home');};},[shown]);
 useEffect(()=>()=>toastLane.cancel('home'),[]);
 if(!shown)return null;
 const close=()=>{setShown(null);setDone(true);};
 return <HudSlot><button type="button" className={styles.toast} data-hud-slot="toast" role="status" data-home-tip={shown}
  onClick={()=>{if(shown==='prompt')void promptInstall().then(ok=>{if(ok)count('st:home_add');});close();}}>
  <b>{HOME_TIP_TITLE}</b>
  <span className={styles.list}>{homeTipText(shown)}</span>
 </button></HudSlot>;
}
