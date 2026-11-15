/**
 * The shape of a save code kept in this browser (Nov 14 2026, split out of lib/saves/client.ts getLocalCode so the title screen's
 * pre-paint script uses the very same rule). Tiny and dependency-free: app/play's static HTML inlines TITLE_CODE_BOOT.
 */
export const LOCAL_CODE_KEY='fi2-save-code-v1';// = SAVE_CODE_KEY (lib/saves/snapshot.ts; tests/landing.cjs checks they match)
export const LOCAL_CODE_RE=/^[a-z]{3,9}-[a-z]{3,9}-[a-z]{3,9}-[1-9]\d{2,3}$/;
/** Inline, pre-paint (components/landing/Landing.tsx): <html data-title-code> when this browser holds a save code, so the title
 *  screen's static HTML shows the returning Play (not Start) from the first frame. Reads one key; writes nothing else. */
export const TITLE_CODE_BOOT=`try{var c=localStorage.getItem(${JSON.stringify(LOCAL_CODE_KEY)});if(c&&${LOCAL_CODE_RE.toString()}.test(c))document.documentElement.setAttribute('data-title-code','')}catch(e){}`;
