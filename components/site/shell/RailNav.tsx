import type {Rail} from '@/lib/site/railNav';
import l from '../library.module.css';
import r from './rail.module.css';
import LibraryMenuSpy from '../LibraryMenuSpy';
/**
 * The guide pages' rail (layout batch 2, Nov 20 2026; owner: "the left nav should be locked on the left side. the content on the
 * right is the only thing that scrolls", "remove the play btn on the left nav"). The same element and styles as the Library's and
 * the games hub's menu (library.module.css .menu, data-rail): from 1280 px a rail fixed on the left edge under the header; below
 * that a one-row chip bar locked under the header, above the breadcrumb. It lists page links (the section's other pages, or the
 * Library's sections on a hub), the current page marked with aria-current; group names show in the rail only. Up links (the
 * section hub, the Library) come first. Server-rendered plain links; LibraryMenuSpy only places the chip bar's pill.
 */
export default function RailNav({rail,current,id='section-rail'}:{rail:Rail;current:string;id?:string}){
 // a page link marks the current page with aria-current; an in-page anchor (#top, #rules on the Library) is only lit (data-on),
 // and the spy moves that light as the reader scrolls
 const cur=(href:string)=>href===current&&!href.startsWith('#')?'page' as const:undefined,on=(href:string)=>href===current&&href.startsWith('#')?'':undefined;
 return <>
  <nav className={`${l.menu} ${r.rail}`} id={id} data-rail="" data-section-rail="" aria-label={rail.label}>
   {/* the up links stay at the top of the rail while the list below scrolls; phones have the breadcrumb and the onward row instead */}
   {/* Back (owner, Nov 20 2026 night: "for any internal pages i think there should be a back btn at the side nav to go back to the
       previous screen. on mobile the back btn is locked on the left and everything scrolls under it"): one link to the level
       above (a page goes to its section; a section goes to the Library). The Library and the games hub pass no `up`, so they
       have none. In the rail it is the first row; in the phone bar a round button fixed at the left, the chips pass under it. */}
   {rail.up.length>0&&rail.up[0].href!==current&&<p className={r.back} data-rail-back=""><a href={rail.up[0].href} title={rail.up[0].name} aria-label={`${/^\/es(\/|$)/.test(rail.up[0].href)?'Volver a':'Back to'} ${rail.up[0].name}`}><span className={r.arrow} aria-hidden="true">{'\u2190'}</span><span className={r.backTxt} aria-hidden="true">{/^\/es(\/|$)/.test(rail.up[0].href)?'Volver':'Back'}</span></a></p>}
   <ul>
    {rail.groups.map((g,i)=>[
     g.title?<li key={`g${i}`} className={r.group}><span>{g.title}</span></li>:null,
     ...g.items.map(it=><li key={it.href}><a href={it.href} aria-current={cur(it.href)} data-on={on(it.href)}>{it.name}</a></li>)])}
   </ul>
  </nav>
  <LibraryMenuSpy menu={id}/>
 </>;
}
