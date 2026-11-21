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
 const cur=(href:string)=>href===current?'page' as const:undefined;
 return <>
  <nav className={`${l.menu} ${r.rail}`} id={id} data-rail="" data-section-rail="" aria-label={rail.label}>
   {/* the up links stay at the top of the rail while the list below scrolls; phones have the breadcrumb and the onward row instead */}
   {rail.up.length>0&&<p className={r.ups}>{rail.up.map(u=><a key={u.href} href={u.href} aria-current={cur(u.href)}>{u.name}</a>)}</p>}
   <ul>
    {rail.groups.map((g,i)=>[
     g.title?<li key={`g${i}`} className={r.group}><span>{g.title}</span></li>:null,
     ...g.items.map(it=><li key={it.href}><a href={it.href} aria-current={cur(it.href)}>{it.name}</a></li>)])}
   </ul>
  </nav>
  <LibraryMenuSpy menu={id}/>
 </>;
}
