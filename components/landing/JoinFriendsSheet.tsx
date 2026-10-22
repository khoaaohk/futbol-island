'use client';
import {useState} from 'react';
import CodeBoxes from '../party/CodeBoxes';
import {BackButton} from '../BackButton';
import {CODE_LENGTH} from '../../multiplayer/protocol';
import {NOT_IN_CODES_HINT} from '@/lib/multiplayer/invite';
import styles from '../saves/SaveCode.module.css';

/**
 * The body of the title screen's "Join friends" sheet (user, Oct 22 2026: "when clicking join friends it needs to animate like use a
 * different code and have the same style with back instead of cancel and join at the bottom right"). It lives inside TitleActions'
 * own sheet (the same morph animation, surface, header and fonts as "Use a different code"): the shared save-sheet classes give the
 * same copy / status / footer look, Back is bottom left and Join bottom right. Only the six code boxes take text; it never connects,
 * logs or tracks the code (TitleActions stores it as the pending party).
 */
export default function JoinFriendsSheet({onBack,onJoin}:{onBack:()=>void;onJoin:(code:string)=>void}){
 const [code,setCode]=useState(''),[hint,setHint]=useState(false);
 return <div className={styles.box} data-title-join-card>
  <p className={styles.copy}>Ask your friend for their party code.</p>
  <CodeBoxes onChange={(c,rejected)=>{setCode(c);setHint(rejected);}} onEnter={onJoin}/>
  <p className={`${styles.status} ${hint?styles.warn:''}`} role="status" aria-live="polite">{hint?NOT_IN_CODES_HINT:''}</p>
  <div className={styles.footer} data-save-footer>
   <BackButton onBack={onBack}/>
   <button type="button" className={styles.primary} data-title-join-go disabled={code.length!==CODE_LENGTH} onClick={()=>onJoin(code)}>Join</button>
  </div>
 </div>;
}
