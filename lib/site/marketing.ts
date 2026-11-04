import type {Metadata} from 'next';
/**
 * The unlisted marketing pages (Nov 4 2026, owner): /marketing (a download button for the investor overview PDF and a short
 * design-system sheet) and /marketing/overview (the print page scripts/build-marketing-pdf.cjs turns into that PDF).
 * Never linked from anywhere, never in the sitemap, robots.txt or the llms files; noindex + nofollow in the page metadata and an
 * X-Robots-Tag header (next.config.mjs, which also covers the PDF in public/marketing/). tests/marketing-page.cjs guards all of it.
 *
 * Every swatch below is copied from the CSS file named in `src`; tests/marketing-page.cjs checks each hex is really there.
 * Pure data: no React, no env reads (tests/seo-pages.cjs scans lib/site).
 */
export const MARKETING_PATH='/marketing';
export const MARKETING_OVERVIEW_PATH='/marketing/overview';
/** public/marketing/futbol-island-overview.pdf, built by scripts/build-marketing-pdf.cjs and committed. */
export const MARKETING_PDF='/marketing/futbol-island-overview.pdf';

/** noindex, nofollow, no canonical into the indexed site, no Open Graph card. */
export function hiddenMeta(title:string,description:string,path:string):Metadata{
 return {title:`${title} · Futbol Island`,description,alternates:{canonical:path},
  robots:{index:false,follow:false,nocache:true,googleBot:{index:false,follow:false,noimageindex:true}},
  openGraph:null,twitter:null};
}

export type Swatch={name:string;hex:string;use:string};
export type TypeSpec={face:string;spec:string;sample:string;kind:'display'|'line'|'body'|'brush'|'button'};
export type DesignSheet={src:readonly string[];swatches:readonly Swatch[];type:readonly TypeSpec[];notes:readonly string[]};

/** The tour site `/` (components/learn/learn.module.css `.root` tokens + the --btn-* button tokens in app/globals.css). */
export const SITE_SHEET:DesignSheet={
 src:['components/learn/learn.module.css','components/learn/LogoWord.tsx','app/globals.css'],
 swatches:[
  {name:'Paper',hex:'#fbf7ee',use:'Page ground'},
  {name:'Tint',hex:'#ecefdf',use:'Alternate chapters'},
  {name:'Well',hex:'#efe8d7',use:'Media cards'},
  {name:'Ink',hex:'#14221d',use:'Headlines and text'},
  {name:'Ink soft',hex:'#5b675f',use:'Lines under headlines'},
  {name:'Pitch',hex:'#1d6b55',use:'Links and icons'},
  {name:'Play gold',hex:'#e9c16b',use:'The one accent'},
  {name:'Gold edge',hex:'#a8863d',use:'Button lip'},
  {name:'Mint',hex:'#beded1',use:'Secondary button'},
 ],
 type:[
  {face:'System sans (SF Pro)',spec:'600 · 44–96px · tracking −0.028em · line 1.04',sample:'Learn the game',kind:'display'},
  {face:'System sans',spec:'500 · 19–28px · line 1.28 · Ink soft',sample:'Short lessons and quizzes on a moving pitch.',kind:'line'},
  {face:'System sans',spec:'400 · 17px · line 1.47',sample:'Every idea is shown on the pitch, explained and checked with a quiz.',kind:'body'},
  {face:'IslandBrush',spec:'Logo only · 26px · one bright colour per letter',sample:'Futbol Island',kind:'brush'},
 ],
 notes:[
  'One idea per full-width chapter, centred, max 1080px wide.',
  'Section padding: 96–180px top and bottom (16% of the screen height).',
  'Side gutter 16px on phones, 24px from 760px.',
  'Media cards: 26–40px corner radius on the Well colour.',
  'Buttons: 56px pill, 3px cream rim, 5px gold lip; Arial 800 at 19px.',
 ],
};
/** The logo letters' colours (components/learn/LogoWord.tsx COLOURS). */
export const LOGO_COLOURS=['#e8479b','#2f6bff','#ff7a1a','#2fb36a','#8a5cf0'] as const;

/** The game (app/globals.css --btn-* tokens, docs/ui/BUTTONS.md; the title screen components/landing/Title.module.css). */
export const GAME_SHEET:DesignSheet={
 src:['app/globals.css','components/landing/Title.module.css'],
 swatches:[
  {name:'Sea',hex:'#2b53e5',use:'Title and loading screen'},
  {name:'Coast pink',hex:'#ef8fd0',use:'Title screen coast'},
  {name:'Cream panel',hex:'#f7f0db',use:'Modals and cards'},
  {name:'Island green',hex:'#244d40',use:'Ink, green buttons'},
  {name:'Gold',hex:'#e9c16b',use:'Primary and navigation'},
  {name:'Bright gold',hex:'#f9d665',use:'Tiles, chips, answers'},
  {name:'Mint',hex:'#beded1',use:'Secondary buttons'},
  {name:'Pink',hex:'#ed9dce',use:'Selected chip'},
  {name:'Rim',hex:'#fff2cd',use:'3px rim on every button'},
 ],
 type:[
  {face:'IslandBrush',spec:'400 · titles 24–38px (title screen 32–62px)',sample:'Make it your island',kind:'brush'},
  {face:'Arial',spec:'800 · buttons 14–19px · sentence case',sample:'I have a save code',kind:'button'},
  {face:'Arial',spec:'400 · body 15px · line 1.45',sample:'A save code instead of an account.',kind:'body'},
 ],
 notes:[
  'Buttons: 44px tall (48px card actions), pill radius 999px; tiles 18px.',
  'Every face has a 3px cream rim and a solid 4–5px lip in its edge colour.',
  'Pressed: the button sinks 3px and the lip shortens to 2px.',
  'Phone gutter 18px; HUD row 44px tall, 16px from the top on phones, 20px on desktop.',
  'Navigation buttons (Back, Done, Next) are 76 × 44px gold pills.',
 ],
};
