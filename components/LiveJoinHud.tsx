'use client';
// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md): the HUD pieces. Static markup only: the
// frame loop (lib/town/liveJoinRuntime.ts) writes text and attributes when they change, so React never re-renders
// during play. The card and the match chip sit in the HUD stack's task slot (top, under the coins bar: the player in
// mid-screen and both thumbs stay clear); the two action buttons sit where the travel cluster is, under the right thumb.
import styles from './LiveJoinHud.module.css';
import type {JoinButton} from '@/lib/town/liveJoinRuntime';

type Press=(b:JoinButton,down:boolean)=>void;
const down=(press:Press,b:JoinButton)=>(e:React.PointerEvent)=>{e.preventDefault();e.stopPropagation();(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);press(b,true);};
const up=(press:Press,b:JoinButton)=>(e:React.PointerEvent)=>{e.stopPropagation();press(b,false);};
/** The card + chip + tip, for the HUD stack (task slot). */
export function LiveJoinStack({onPress}:{onPress:Press}){
  return <>
    <div data-join-card data-hud-slot="task" className={styles.card} role="status" aria-live="polite" hidden>
      <span className={styles.bib} aria-hidden="true"/>
      <div className={styles.cardText}>
        <strong data-join-team>You&apos;re joining Yellow</strong>
        <span className={styles.goal}><b data-join-arrow aria-hidden="true">▲</b> <span data-join-goal>Score in the top goal</span></span>
        <small>Step back off the pitch to wait</small>
      </div>
      <button type="button" className={styles.play} onPointerDown={down(onPress,'skip')} onClick={()=>onPress('skip',true)} aria-label="Play now">
        <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" pathLength="100" className={styles.track}/><circle cx="20" cy="20" r="17" pathLength="100" className={styles.fill}/></svg>
        <span data-join-count>2</span><em>Play now</em>
      </button>
    </div>
    <div data-join-chip data-hud-slot="task" className={styles.chip} hidden>
      <span className={styles.dot} aria-hidden="true"/>
      <b data-join-you>You: Yellow ▲</b>
      <span data-join-score className={styles.score}/>
      <span data-join-status className={styles.status} role="status"/>
      <button type="button" className={styles.leave} onClick={()=>onPress('leave',true)} title="Leave match · Esc">Leave match</button>
    </div>
    <p data-join-tip data-hud-slot="task" className={styles.tip} role="status" hidden/>
  </>;
}
/** The two contextual action buttons and the off-screen goal badge (outside the stack). */
export function LiveJoinActions({onPress}:{onPress:Press}){
  return <>
    <div data-join-actions className={styles.actions} hidden>
      <button type="button" data-join-b className={styles.b} onPointerDown={down(onPress,'b')} onPointerUp={up(onPress,'b')} onPointerCancel={up(onPress,'b')}>Shoot</button>
      <button type="button" data-join-a className={styles.a} onPointerDown={down(onPress,'a')} onPointerUp={up(onPress,'a')} onPointerCancel={up(onPress,'a')}>Pass</button>
    </div>
    <div data-join-badge className={styles.badge} aria-hidden="true" hidden><span>Goal</span></div>
  </>;
}
