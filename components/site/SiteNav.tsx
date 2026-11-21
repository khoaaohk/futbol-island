import {LOGO_COLOURS} from '@/lib/site/marketing';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {PLAY_PATH} from '@/lib/site/seo';
import {LIBRARY_PATH} from '@/lib/site/libraryPath';
import done from '@/components/DoneButton.module.css';
import styles from '@/app/(site)/site.module.css';
/**
 * The reading pages' top bar (owner, Nov 10 2026: "fix all these pages to match more with the main site"): the home page's bar
 * (app/(site)/page.tsx + components/learn/learn.module.css .subnav) as a static, server-rendered variant. Same 68px bar, the
 * multicolour IslandBrush wordmark, three labels (below) and the gold Play pill (the game's navigation button face,
 * DoneButton.module.css, as a plain link). No client code (AGENTS.md, phone heat): the letters keep one colour each
 * (LOGO_COLOURS, as on /marketing) instead of LogoWord's timers, there is no current-chapter chip, no scroll listener, and the
 * phone menu is a bare <details> that opens and closes natively.
 */
/* Nov 20 2026 evening (owner: "Learn, Game, and Library. Learn keeps existing page, game goes to a page for games ... library
 * will go to all the other items"): three links and Play. Explore, Friends, Safety and About left the bar; About and the safety
 * page are in the footer (app/(site)/layout.tsx). Games and Library are each rendered twice: the plain copy everywhere, the copy
 * with aria-current="page" (data-nav-cur) only on its own pages, which mark themselves ([data-games-page] in GameIntro,
 * [data-library-hero] in LibraryPage) so CSS shows one copy (site.module.css). A hidden link is not in the accessibility
 * tree, so a screen reader meets exactly one. Still no client code. */
const NAV:readonly (readonly [string,string,('games'|'library')?])[]=[['/','Island'],['/games','Games','games'],[LIBRARY_PATH,'Library','library']];
const NAME='Futbol Island';
export const navLinks=(nav:readonly (readonly [string,string,string?])[])=>nav.map(([href,label,cur])=><li key={href}><a href={href} data-nav-link="" data-nav-page={cur}>{label}</a>{cur&&<a href={href} data-nav-cur={cur} aria-current="page">{label}</a>}</li>);
const links=()=>navLinks(NAV);
/* Layout batch 3, Nov 20 2026 (owner: "on desktop, when selecting island, games, library, that should also animate and move over like
 * the nav btns on mobile"). ONE pink chip, a real element (navChip) behind the links so it can carry view-transition-name, at
 * translateX(--i * pitch) like the home bar's: the page's section (data-nav-section, lib/site/navSection.ts) sets --i in CSS, so it
 * is in place at first paint with no script. On a click of another header link, NAV_SLIDE moves it there at once (transform only,
 * the home bar's spring) and the browser navigates as usual, nothing waits for it; a page restored from the back/forward cache
 * puts it back. Where the browser supports cross-document view transitions, the chip glides from the old page's place to the new
 * one's (site layouts' <style>, site.module.css). One click listener, no scroll listener, no loop. */
export const navChip=<li className={styles.navChip} aria-hidden="true" data-nav-chip=""/>;
export const NAV_SLIDE=`(function(){if(window.__fiNavSlide)return;window.__fiNavSlide=1;
document.addEventListener('click',function(e){var t=e.target,a=t&&t.closest&&t.closest('[data-nav-links] a[data-nav-link]');
if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.getAttribute('href').charAt(0)==='#')return;
var ul=a.closest('[data-nav-links]'),lis=[].filter.call(ul.children,function(l){return !l.hasAttribute('data-nav-chip')}),i=lis.indexOf(a.closest('li'));
if(i<0)return;ul.style.setProperty('--i',String(i));ul.setAttribute('data-going','');},false);
addEventListener('pageshow',function(e){if(!e.persisted)return;[].forEach.call(document.querySelectorAll('[data-nav-links][data-going]'),function(u){u.removeAttribute('data-going');u.style.removeProperty('--i');});});})();`;
export default function SiteNav(){
 return <nav className={styles.nav} aria-label="Site">
  <a className={styles.brand} href="/" aria-label={`${NAME} home`}><span aria-hidden="true">{[...NAME].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</span></a>
  <ul className={styles.navLinks} data-nav-links="">{links()}{navChip}</ul>
  <script dangerouslySetInnerHTML={{__html:NAV_SLIDE}}/>
  <details className={styles.menu}>
   <summary className={styles.menuBtn} aria-label="Menu"><span className={styles.menuIco} aria-hidden="true"><i/><i/></span></summary>
   <div className={styles.menuPanel}><ul className={styles.menuList}>{links()}</ul></div>
  </details>
  <a className={`${styles.play} ${done.button}`} href={PLAY_PATH} aria-label="Play"><span className={done.label} aria-hidden="true">Play</span></a>
 </nav>;
}
