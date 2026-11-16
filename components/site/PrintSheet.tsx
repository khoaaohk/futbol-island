import PrintButton from '@/components/site/PrintButton';
import {abs} from '@/lib/site/seo';
import p from './printSheet.module.css';
/**
 * One-page coach sheet (seo-extras, Nov 15 2026) for drill and rule pages: put <PrintSheet path={…}/> right after the page's
 * intro. On screen it is just the "Print / Save as PDF" button. In print (printSheet.module.css) the page keeps only its title,
 * answer, diagram, the steps / referee points and the coaching points / mix-ups, drops the site bar, footer, breadcrumbs,
 * buttons, FAQ and link lists, and ends with a small line naming the page's URL.
 */
export default function PrintSheet({path,what='sheet'}:{path:string;what?:string}){
 const url=abs(path);
 return <div className={p.sheet} data-print-sheet="">
  <div className={p.screen}><PrintButton/> <span className={p.hint}>A one-page {what} for the field: diagram, steps, key points.</span></div>
  <p className={p.url}>Futbol Island · free football lessons for kids · {url.replace(/^https:\/\//,'')}</p>
 </div>;
}
