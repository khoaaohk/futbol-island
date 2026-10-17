import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {cardPath,SITE_CARDS} from '@/lib/site/cards';
import {ROLE_LABELS,ROLE_ORDER} from '@/lib/town/cardCollection';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import styles from '../site.module.css';

export const dynamic='force-static';
const PLAYERS=SITE_CARDS.filter(c=>!c.coach).length,COACHES=SITE_CARDS.length-PLAYERS;
const DESC=`The Futbol Island card binder: ${PLAYERS} player cards and ${COACHES} coach cards, from today’s stars to all-time greats, in football and futsal.`;
export const metadata=pageMeta('Player cards',DESC,'/cards');
const CRUMBS=[{name:'Home',path:'/'},{name:'Cards',path:'/cards'}];

export default function CardsIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} player cards`,numberOfItems:SITE_CARDS.length,
   itemListElement:SITE_CARDS.map((c,i)=>({'@type':'ListItem',position:i+1,name:`#${c.number} ${c.displayName}`,url:abs(cardPath(c.number))}))}}/>
  <Breadcrumbs crumbs={CRUMBS}/>
  <h1>Player cards</h1>
  <p className={styles.lead}>{DESC} Every card tells you the player’s position, what they are good at and where they played.</p>
  {ROLE_ORDER.map(role=>{const list=SITE_CARDS.filter(c=>c.role===role);if(!list.length)return null;return <section key={role} aria-labelledby={`role-${role}`}>
   <h2 id={`role-${role}`}>{ROLE_LABELS[role]??role} ({list.length})</h2>
   <ul className={styles.list}>{list.map(c=><li key={c.number}><a href={cardPath(c.number)}><b>#{c.number} {c.displayName}</b><span>{[c.country,c.era==='allTime'?'All-time great':'Current'].filter(Boolean).join(' · ')}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
