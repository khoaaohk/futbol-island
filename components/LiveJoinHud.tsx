'use client';
// Join a live game, slice 1 (Nov 4 2026; docs/join-live-game-design.md): the HUD pieces. The join card: Play / Learn,
// the side + position picker opened by the pitch bar's Play (owner decisions Nov 4 2026, no countdown). Static markup only: the
// frame loop (lib/town/liveJoinRuntime.ts) writes text and attributes when they change, so React never re-renders
// during play. The card and the match chip sit in the HUD stack's task slot (top, under the coins bar: the player in
// mid-screen and both thumbs stay clear); the two action buttons sit where the travel cluster is, under the right thumb.
import styles from './LiveJoinHud.module.css';
import type {JoinButton} from '@/lib/town/liveJoinRuntime';
import {BackButton} from './BackButton';
import party from './party/party.module.css';
import {useSyncExternalStore} from 'react';
import {IslandSelect} from './IslandSelect';
import {joinSlots,joinAim} from '@/lib/town/liveJoinRuntime';

/** The position dropdown: the island's own IslandSelect (not the native popup), fed by the runtime's slot list (written on taps). */
function SlotField({onSlot}:{onSlot:(slot:string)=>void}){
  const v=useSyncExternalStore(joinSlots.subscribe,joinSlots.get,joinSlots.get);
  return <IslandSelect label="Position" value={v.value} options={v.options} onChange={onSlot} className={styles.field} dataAttrs={{'data-join-slot':''}}/>;
}

type Press=(b:JoinButton,down:boolean)=>void;
const down=(press:Press,b:JoinButton)=>(e:React.PointerEvent)=>{e.preventDefault();e.stopPropagation();(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);press(b,true);};
const up=(press:Press,b:JoinButton)=>(e:React.PointerEvent)=>{e.stopPropagation();press(b,false);};
/** Shoot: tap-and-drag picks the corner (owner Nov 4 2026). The button holds the pointer, so the drag (px from the press) is
 *  written into the runtime's joinAim store; no React state, no re-render. */
const aimFrom={x:0,y:0};
const shootDown=(press:Press)=>(e:React.PointerEvent)=>{aimFrom.x=e.clientX;aimFrom.y=e.clientY;down(press,'b')(e);joinAim.on=true;};
const shootMove=(e:React.PointerEvent)=>{if(!joinAim.on||!(e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId))return;joinAim.x=e.clientX-aimFrom.x;joinAim.y=e.clientY-aimFrom.y;};
const shootUp=(press:Press)=>(e:React.PointerEvent)=>{up(press,'b')(e);joinAim.on=false;};
/** The card + chip + tip, for the HUD stack (task slot). */
export function LiveJoinStack({onPress}:{onPress:Press}){
  return <>
    <div data-join-chip data-hud-slot="task" className={styles.chip} hidden>
      <span className={styles.scores} role="group" aria-label="Score">
        <span className={styles.pill} data-join-pill-gold aria-label="Yellow"><i className={styles.dot} style={{background:'var(--bib-gold,#ffd23f)'}} aria-hidden="true"/><b data-join-sg>0</b></span>
        <span className={styles.pill} data-join-pill-blue aria-label="Blue"><i className={styles.dot} style={{background:'var(--bib-blue,#2f55d4)'}} aria-hidden="true"/><b data-join-sb>0</b></span>
      </span>
      <span data-join-status className={styles.status} role="status"/>
    </div>
    <p data-join-tip data-hud-slot="task" className={styles.tip} role="status" hidden/>
  </>;
}
/** The side + position modal, the contextual action buttons and the off-screen goal badge (outside the stack). */
export function LiveJoinActions({onPress,onSlot}:{onPress:Press;onSlot:(slot:string)=>void}){
  return <>

    {/* Camera angle (owner, Nov 4 2026): top-left, opposite Leave, in the paths / friends buttons' place (hidden mid-match).
        Each tap cycles Broadcast → Side → Behind you → Wide → Close (lib/town/liveJoinCamera.ts); the runtime shows the name. */}
    <button type="button" data-join-cam data-angle="broadcast" className={styles.cam} onClick={()=>onPress('camera',true)} title="Change camera · C" aria-label="Camera angle" hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="13" height="10" rx="2.5"/><path d="m15.5 11 6-3.2v8.4l-6-3.2"/></svg>
    </button>
    <button type="button" data-join-leave className={styles.leave} onClick={()=>onPress('leave',true)} title="Leave match · Esc" aria-label="Leave match" hidden>Leave</button>
    {/* Owner decisions Nov 4 2026: no auto-join, no separate offer card. The pitch bar (FieldPathCard) carries Learn + Play;
        Play opens this modal, which grows out of the Play button like Join with a code (lib/ui/growFrame, party.module.css):
        Back, "Pick your side", a side toggle (segmented), the position dropdown (every slot of the format), Start. The runtime
        writes the state and runs the grow; React never re-renders. */}
    <div data-join-modal className={`${party.backdrop} ${styles.modal}`} hidden onPointerDown={e=>{if(e.target===e.currentTarget)onPress('back',true);}}>
      <div data-join-card className={`${party.dialog} ${styles.wide}`} role="dialog" aria-modal="true" aria-labelledby="join-card-title">
        <section className={`${party.card} ${party.menuCard} ${styles.pick}`}>
          <header className={party.menuHeader}>
            <span aria-hidden="true"/>
            <h2 id="join-card-title">Pick your side</h2>
            <span aria-hidden="true"/>
          </header>
          <div data-join-sides data-index="0" className={styles.seg} style={{'--n':2} as React.CSSProperties} role="radiogroup" aria-label="Side">
            {(['gold','blue'] as const).map(t=><button key={t} type="button" role="radio" aria-checked="false" data-join-side={t} onClick={()=>onPress(t==='gold'?'side-gold':'side-blue',true)}>
              <span className={styles.swatch} aria-hidden="true"/><span data-join-side-name={t}>{t==='gold'?'Yellow':'Blue'}</span><small className={styles.humans} data-join-humans={t} hidden/>
            </button>)}
          </div>
          <SlotField onSlot={onSlot}/>
          <footer className={styles.foot}>
            <BackButton immediate aria-label="Back" title="Back · Esc" data-join-back onBack={()=>onPress('back',true)}/>
            <button type="button" data-join-start className={`${party.primary} ${styles.start}`} onClick={()=>onPress('start',true)} title="Start · Enter">Start</button>
          </footer>
        </section>
      </div>
    </div>
    {/* The trick's word ("Step-over!"), a short toast over the pitch; the runtime writes the text and data-show. */}
    <p data-join-pop className={styles.pop} aria-live="polite"/>
    <div data-join-actions className={styles.actions} hidden>
      <button type="button" data-join-f className={styles.f} onPointerDown={down(onPress,'f')}>Forward</button>
      <button type="button" data-join-s className={styles.s} onPointerDown={down(onPress,'s')} onPointerUp={up(onPress,'s')} onPointerCancel={up(onPress,'s')} onLostPointerCapture={up(onPress,'s')}>Sprint</button>
      <button type="button" data-join-b className={styles.b} onPointerDown={shootDown(onPress)} onPointerMove={shootMove} onPointerUp={shootUp(onPress)} onPointerCancel={shootUp(onPress)}><i className={styles.charge} aria-hidden="true"/><span data-join-b-label>Shoot</span></button>
      {/* Trick (offense) / Press (defense), owner Nov 4 2026: one slot in the arc, its mode's colour; the ring shows the cooldown. */}
      <button type="button" data-join-t data-mode="trick" className={styles.t} onPointerDown={down(onPress,'t')} hidden><i className={styles.cool} aria-hidden="true"/><span data-join-t-label>Trick</span></button>
      <button type="button" data-join-a className={styles.a} onPointerDown={down(onPress,'a')} onPointerUp={up(onPress,'a')} onPointerCancel={up(onPress,'a')}><i className={styles.charge} aria-hidden="true"/><span data-join-a-label>Pass</span></button>
    </div>
  </>;
}
