import CAST_SIZES from '@/public/splash/cast.json';
import styles from './Title.module.css';

/**
 * The title screen's island, split into depth layers for parallax (Oct 9 2026). Vectors and colours are the loading screen's
 * (components/LoadingIslandArt.tsx: same shore, land, paths, pitch, palms and hills), the characters are the splash cast stills
 * (public/splash). Static markup: TitleScene moves each [data-depth] layer; the inner [data-enter] / ambient classes are CSS.
 * Each layer has an outer element (parallax transform, JS) and an inner one (entrance and ambient keyframes, CSS), so the two
 * transforms never fight.
 */
/** The trick cast (Oct 9 2026; user: "a boy and a girl doing different tricks with the ball"): baked by
 *  scripts/render-splash-characters.cjs. Sizes come from public/splash/cast.json (re-renders change them), on the shared
 *  px-per-metre scale: trick-boy's 513 px canvas is 24 % of the cast box wide, so every canvas is w/513 × 24 %. Feet sit at the
 *  bottom of each canvas, so a shorter or taller canvas keeps the same ground line. When an entry has `strip`, its trick loop
 *  plays as a CSS sprite (steps(), compositor-only; paused when calm or hidden; the still under reduced motion). */
/** `strip` = the trick sprite sheet: `frames` cells of `cell` px (-sm: `smCell`), `cols` per row over `rows` rows (a grid keeps every image
 *  ≤ 16384 px; a one-row strip when cols/rows are absent), played at `fps`. */
type CastSize={width:number;height:number;sm:number[];strip?:{frames:number;fps:number;cols?:number;rows?:number;cell:number[];smCell:number[]}};
const SIZES=CAST_SIZES as unknown as Record<string,CastSize>;
const SLOTS=[{id:'trick-boy',cls:'boy'},{id:'trick-girl',cls:'girl'}] as const;
const sheet=(s:CastSize['strip'])=>s&&{...s,cols:s.cols??s.frames,rows:s.rows??1};
const CAST=SLOTS.filter(c=>SIZES[c.id]).map(c=>({...c,w:SIZES[c.id].width,h:SIZES[c.id].height,pct:SIZES[c.id].width/513*24,strip:sheet(SIZES[c.id].strip)}));
/** Cache-busting: /splash files are cached for a day under fixed names, so a re-render with a new shape (canvas size, grid) must
 *  get a new URL, or a cached old image is drawn with the new layout (squashed slivers). The tag changes whenever the shape does. */
const stillV=(c:{w:number;h:number})=>`?v=${c.w}x${c.h}`;
const sheetV=(t:{frames:number;cols:number;rows:number;cell:number[]})=>`?v=${t.frames}-${t.cols}x${t.rows}-${t.cell[0]}`;

export default function TitleArt(){
 return <>
  {/* Sky: sun and star (deepest). */}
  <div className={`${styles.layer} ${styles.sky}`} data-depth="6">
   <div className={styles.skyIn} data-enter="sky">
    <svg className={styles.sun} data-x="sun" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="91" fill="#F9D55D"/></svg>
    <svg className={styles.star} data-x="star" viewBox="40 115 130 125" aria-hidden="true" focusable="false"><path d="M105 117L124 159L168 164L135 194L143 238L105 217L67 238L75 194L42 164L86 159Z" fill="#EF8FD0"/></svg>
   </div>
  </div>
  {/* Far hills: the dark coast band behind the island. */}
  <div className={`${styles.layer} ${styles.farHills}`} data-depth="12">
   <div className={styles.bandIn} data-enter="hills" data-x="far">
    <svg viewBox="-260 180 1420 523" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M-260 420C-120 330 -40 300 16 359C178 186 234 413 407 305S690 160 916 278C1000 250 1080 260 1160 300V703H-260Z" fill="#153F43"/></svg>
   </div>
  </div>
  {/* Sea glints round the island: cream dashes that shimmer. */}
  <div className={`${styles.layer} ${styles.isleBox} ${styles.glints}`} data-depth="16" data-x="glints">
   <svg className={styles.glint} viewBox="90 60 750 530" aria-hidden="true" focusable="false" overflow="visible">
    <g stroke="#FFF2D3" strokeWidth="9" strokeLinecap="round" fill="none">
     <path d="M60 430l30-17M75 456l34-19"/>
     <path d="M800 120q22-12 44 0"/>
     <path d="M850 400q18-10 36 0M862 424q18-10 36 0"/>
     <path d="M40 200q18-10 36 0"/>
    </g>
   </svg>
  </div>
  {/* The island: shore, land, paths, pitch, flag and palms. */}
  <div className={`${styles.layer} ${styles.isleBox}`} data-depth="22">
   <div className={styles.isleIn} data-enter="island" data-x="island">
    <svg viewBox="90 60 750 530" aria-hidden="true" focusable="false" overflow="visible">
     <path d="M159 265C190 165 305 162 367 116C426 74 495 137 532 173C596 218 720 207 759 290C826 429 679 487 569 502C486 514 471 579 365 558C260 537 247 459 177 424C98 384 113 315 159 265Z" fill="#78d7df"/>
     <path d="M197 273C230 194 325 203 387 158C434 124 483 178 514 206C573 245 676 242 713 305C771 399 657 442 555 458C466 470 449 529 367 509C286 489 280 423 210 389C154 361 165 319 197 273Z" fill="#DFC587"/>
     <path d="M216 327C282 287 310 360 382 322S453 239 514 272S634 331 689 307" stroke="#FFF2D3" strokeWidth="20" strokeLinecap="round" fill="none"/>
     <path d="M388 509C426 453 487 433 451 380C424 341 403 342 382 322" stroke="#FFF2D3" strokeWidth="16" strokeLinecap="round" strokeDasharray="4 28" fill="none"/>
     {/* Wrapped: the exit animates this outer group, so the pitch keeps its own placement transform. */}<g><g transform="translate(502 354) rotate(-13)"><rect width="139" height="83" rx="5" fill="#2E9A5B" stroke="#FFF2D3" strokeWidth="4"/><path d="M69 1V82M0 24H18V60H0M139 24H121V60H139" stroke="#FFF2D3" strokeWidth="3" fill="none"/><circle cx="69" cy="41" r="17" stroke="#FFF2D3" strokeWidth="3" fill="none"/></g></g>
     <circle cx="222" cy="324" r="25" fill="#ED90CF"/><circle cx="382" cy="321" r="25" fill="#F17732"/><circle cx="514" cy="272" r="25" fill="#2953E7"/>
     <path d="M373 318L365 233" stroke="#163F37" strokeWidth="7" strokeLinecap="round"/>
    </svg>
    {/* Palms and flag as their own small SVGs (Oct 9 2026 smoothness pass): an animated transform on an element INSIDE an SVG is
        repainted on the main thread every frame; on an <svg> box it runs on the compositor. */}
     <svg className={`${styles.isleItem} ${styles.palm}`} data-item viewBox="196 154 112 110" style={{left:'14.133%',top:'17.736%',width:'14.933%',height:'20.755%'}} aria-hidden="true" focusable="false" overflow="visible"><g fill="#163F37"><path d="M236 262L245 204L251 263Z"/><path d="M246 214C207 206 196 179 205 173C223 177 239 189 246 207C242 172 261 155 270 157C276 176 260 197 252 209C282 185 303 192 307 203C290 221 264 217 252 215C277 219 291 239 284 249C261 244 252 225 247 217C229 240 209 243 204 233C214 215 232 213 246 214Z"/></g></svg>
     <svg className={`${styles.isleItem} ${styles.palmB}`} data-item viewBox="610 173 106 102" style={{left:'69.333%',top:'21.321%',width:'14.133%',height:'19.245%'}} aria-hidden="true" focusable="false" overflow="visible"><g fill="#163F37"><path d="M652 273L659 217L666 274Z"/><path d="M659 226C628 223 611 199 619 191C639 191 654 209 659 220C652 196 666 174 676 178C684 192 671 213 665 222C688 203 714 208 715 218C699 233 678 232 665 228C687 239 690 251 684 260C669 254 663 239 660 229C643 245 625 243 623 236C633 226 648 225 659 226Z"/></g></svg>
     <svg className={`${styles.isleItem} ${styles.flag}`} data-item viewBox="363 232 55 37" style={{left:'36.4%',top:'32.453%',width:'7.333%',height:'6.981%'}} aria-hidden="true" focusable="false" overflow="visible"><path d="M366 235L415 246L369 266Z" fill="#F17732" stroke="#163F37" strokeWidth="4"/></svg>
   </div>
  </div>
  {/* Near hills: the pink coast and its cream ribbon, continuing down under the buttons. */}
  <div className={`${styles.layer} ${styles.nearHills}`} data-depth="34">
   <div className={styles.bandIn} data-enter="near" data-x="near">
    {/* Wider than the screen (x −600…1500) with headroom above the crest (viewBox top 420, crest ≥ 470), so the hill curves off
        both sides and its top is never clipped flat, at any width or parallax offset. Same pink and cream ribbon as the loading art. */}
    <svg viewBox="-600 420 2100 340" preserveAspectRatio="none" aria-hidden="true" focusable="false">
     <path d="M-600 600C-420 520-300 640-120 580C60 520 160 470 300 500C430 528 520 560 640 520C760 480 860 455 980 482C1100 510 1240 566 1500 508V760H-600Z" fill="#EF8FD0"/>
     <path d="M-600 662C-420 582-300 702-120 642C60 582 160 532 300 562C430 590 520 622 640 582C760 542 860 517 980 544C1100 572 1240 628 1500 570" stroke="#FFF2D3" strokeWidth="19" fill="none" vectorEffect="non-scaling-stroke"/>
    </svg>
    <span className={styles.pinkFloor}/>
   </div>
  </div>
  {/* Characters: the splash cast stills. */}
  <div className={`${styles.layer} ${styles.castBox}`} data-depth="44">
   {CAST.map((c,i)=><div key={c.id} className={`${styles.castMember} ${styles[c.cls]}`} data-enter="cast" data-x="cast" data-cast-id={c.id}
     style={{'--i':i,width:`${c.pct.toFixed(2)}%`} as React.CSSProperties}>
    <picture className={`${styles.castLife} ${c.strip?styles.castStill:''}`}>
     <source type="image/avif" srcSet={`/splash/${c.id}-sm.avif${stillV(c)} 1x, /splash/${c.id}.avif${stillV(c)} 2x`}/>
     <img src={`/splash/${c.id}-sm.webp${stillV(c)}`} srcSet={`/splash/${c.id}-sm.webp${stillV(c)} 1x, /splash/${c.id}.webp${stillV(c)} 2x`} width={Math.round(c.w/2)} height={Math.round(c.h/2)} alt="" decoding="async" draggable={false}/>
    </picture>
    {c.strip&&<span className={styles.spriteBox} data-sprite style={{aspectRatio:`${c.strip.cell[0]}/${c.strip.cell[1]}`} as React.CSSProperties} aria-hidden="true">
     {/* Grid sheet: the picture steps down the rows (--rows over the whole loop), the img steps across the columns (--cols per row). */}
     <picture className={styles.sprite} style={{'--cols':c.strip.cols,'--rows':c.strip.rows,'--dur':`${(c.strip.frames/c.strip.fps).toFixed(3)}s`,width:`${c.strip.cols*100}%`,height:`${c.strip.rows*100}%`} as React.CSSProperties}>
      {/* Phones always take the -sm sheet: the full sheets decode to ~35 MB each, the -sm ones to about half, and -sm is still
          sharp at a phone's character size (user, Oct 9 2026). */}
      <source media="(max-width: 600px)" type="image/avif" srcSet={`/splash/${c.id}-strip-sm.avif${sheetV(c.strip)}`}/>
      <source media="(max-width: 600px)" type="image/webp" srcSet={`/splash/${c.id}-strip-sm.webp${sheetV(c.strip)}`}/>
      <source type="image/avif" srcSet={`/splash/${c.id}-strip-sm.avif${sheetV(c.strip)} 1x, /splash/${c.id}-strip.avif${sheetV(c.strip)} 2x`}/>
      <img src={`/splash/${c.id}-strip-sm.webp${sheetV(c.strip)}`} srcSet={`/splash/${c.id}-strip-sm.webp${sheetV(c.strip)} 1x, /splash/${c.id}-strip.webp${sheetV(c.strip)} 2x`} width={c.strip.smCell[0]*c.strip.cols} height={c.strip.smCell[1]*c.strip.rows} alt="" decoding="async" loading="lazy" draggable={false}/>
     </picture>
    </span>}
   </div>)}
  </div>
  {/* Foreground props: a wave mark (nearest). The floating ball was removed (user, Oct 9 2026). */}
  <div className={`${styles.layer} ${styles.props}`} data-depth="60">
   <div className={styles.propsIn} data-enter="props" data-x="props">
    <svg className={styles.waves} viewBox="755 535 110 62" aria-hidden="true" focusable="false"><path d="M762 565C802 539 831 543 857 564M779 591C811 572 839 578 858 590" stroke="#F9D55D" strokeWidth="10" strokeLinecap="round" fill="none"/></svg>
   </div>
  </div>
 </>;
}
