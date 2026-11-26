import {CARD_HISTORY,TERM_VISUALS} from '@/lib/site/visualExtras';
import {DataTable} from '@/lib/site/GuideParts';
import {GoalStrip,RefereeCards,TryIt,VSection} from './Visuals';
import site from '@/app/(site)/site.module.css';
/** The term pages' extra visuals (lib/site/visualExtras.ts TERM_VISUALS, Nov 26 2026): the picture under the answer and, near
 *  the end, "Try it in the game". Pages without an entry render nothing. Server components, no client code. */
type Lang='en'|'es';
export function TermVisualTop({slug,lang='en'}:{slug:string;lang?:Lang}){
 const x=TERM_VISUALS[slug]?.[lang];if(!x)return null;
 const es=lang==='es';
 const title=x.visual==='goals'?(es?'Un gol, un doblete, un triplete':'One goal, a brace, a hat-trick'):(es?'Qué significa cada tarjeta':'What each card means');
 return <>
  <VSection id="at-a-glance" title={title}>{x.visual==='goals'?<GoalStrip lang={lang}/>:<RefereeCards lang={lang} focus={x.visual==='cards-red'?'red':'yellow'}/>}</VSection>
  {x.table&&<VSection id={x.table.id} title={x.table.title}>
   {x.table.intro&&<p>{x.table.intro}</p>}
   <DataTable label={x.table.title} head={x.table.head} rows={x.table.rows}/>
   {x.table.note&&<p className={site.caption}>{x.table.note}</p>}
  </VSection>}
 </>;
}
export function TermVisualTry({slug,lang='en'}:{slug:string;lang?:Lang}){
 const x=TERM_VISUALS[slug]?.[lang];return x?<TryIt links={x.tryIt} lang={lang}/>:null;
}
/** The yellow and red cards rule page: where the cards came from, then Try it. */
export function CardHistory({lang='en'}:{lang?:Lang}){
 const h=CARD_HISTORY[lang];
 return <><VSection id={h.id} title={h.title}><ul>{h.points.map(p=><li key={p}>{p}</li>)}</ul><p className={site.caption}>{h.note}</p></VSection>
  <TryIt links={h.tryIt} lang={lang}/></>;
}
