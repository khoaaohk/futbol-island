/**
 * ONE "phone layout" predicate (landscape audit Oct 23 2026, batch 3; docs/LANDSCAPE_AUDIT_OCT23.md).
 *
 * Landscape phones are 667-956 CSS px wide, so a width-only check (`max-width:600px`) hands them the DESKTOP branch.
 * This is the HUD's predicate family (docs/ui/HUD_STACK.md "HUD_NARROW", components/IslandJobs.module.css):
 *   - portrait phones and narrow windows: `(max-width:<W>px)`
 *   - landscape phones: `(max-height:480px) and (orientation:landscape)` (SE 375, 15 393, Pro Max 430, 17 Pro Max 440 tall)
 *   - iPhones whose layout viewport is wider than the screen: `(max-device-width:480px)` (device-width stays the portrait
 *     screen width on iOS in either orientation)
 * Tablets (iPad 1024x768 landscape, 768x1024 portrait) and desktop windows taller than 480 px keep their layout.
 *
 * CSS cannot read this constant, so stylesheets spell the same list out literally:
 *   `@media(max-width:600px),(max-height:480px) and (orientation:landscape),(max-device-width:480px){...}`
 * Only use it where the rule is a phone layout (compact chips, phone art, phone sheet); rules that stack content into a tall
 * single column for a portrait phone keep the width-only query.
 */
export const PHONE_LANDSCAPE_QUERY='(max-height:480px) and (orientation:landscape),(max-device-width:480px)';

/** The phone-layout media query for a portrait width cut (default 600px, the app's phone breakpoint). */
export function phoneLayoutQuery(maxWidth=600):string{return `(max-width:${maxWidth}px),${PHONE_LANDSCAPE_QUERY}`;}

/** The default phone-layout query (portrait <= 600px or a landscape phone). */
export const PHONE_LAYOUT_QUERY=phoneLayoutQuery(600);

/** True on a phone layout right now (false on the server). */
export function isPhoneLayout(maxWidth=600):boolean{
 if(typeof window==='undefined'||typeof window.matchMedia!=='function')return false;
 return window.matchMedia(phoneLayoutQuery(maxWidth)).matches;
}
