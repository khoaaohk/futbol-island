/** Shared open/close timing for the right-side drawers that use DrawerSlide.module.css (NPC conversation, island pocket). */
export const DRAWER_SLIDE_OUT_MS=240;
/** Open a drawer dialog: showModal, pin its horizontal scroll to 0 and focus without scrolling, so the off-screen start of the
 *  slide can never be scrolled into view (that left the pocket stuck half off-screen on iOS). */
export function showDrawer(dialog:HTMLDialogElement,focus?:HTMLElement|null){
 if(!dialog.open)dialog.showModal();
 dialog.scrollLeft=0;
 focus?.focus({preventScroll:true});
}
