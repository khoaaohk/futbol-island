/** Stick release guard (Nov 11 2026, owner: "the thumb controls on the bottom left is getting stuck on mobile").
 *  The arcade sticks only heard the release on their own element (onPointerUp / onPointerCancel / onLostPointerCapture) and
 *  refused every new press while an old pointer id was still held. iOS WebKit (Safari and Chrome on iPhone) can end a touch
 *  without delivering that element's pointerup (a second thumb on Kick, a system edge gesture, a toolbar resize), so one lost
 *  release froze the knob off-centre, kept the vector (the player kept running) and locked the stick out until the next menu.
 *  Same guarantee as the island stick (components/Town.tsx finishJoystick / finishTouches): listen on the window too, and treat
 *  a touchend / touchcancel that leaves no finger that started on the stick as the release. Event-driven, no timers. */
export function watchStickRelease(owner:()=>HTMLElement|null,active:()=>number|null,release:()=>void){
 const up=(e:PointerEvent)=>{if(active()!==null&&e.pointerId===active())release();};
 const touches=(e:TouchEvent)=>{if(active()===null)return;const el=owner();if(!el||!Array.from(e.touches).some(t=>t.target instanceof Node&&el.contains(t.target)))release();};
 const hide=()=>{if(active()!==null)release();};const vis=()=>{if(document.hidden)hide();};
 const capture={capture:true},passive={capture:true,passive:true};
 window.addEventListener('pointerup',up,capture);window.addEventListener('pointercancel',up,capture);window.addEventListener('touchend',touches,passive);window.addEventListener('touchcancel',touches,passive);window.addEventListener('pagehide',hide);document.addEventListener('visibilitychange',vis);
 return ()=>{window.removeEventListener('pointerup',up,capture);window.removeEventListener('pointercancel',up,capture);window.removeEventListener('touchend',touches,passive);window.removeEventListener('touchcancel',touches,passive);window.removeEventListener('pagehide',hide);document.removeEventListener('visibilitychange',vis);};
}
