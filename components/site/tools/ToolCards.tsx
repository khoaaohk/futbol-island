/**
 * The tools hub's cards (Nov 17 2026, owner: the hub "reads like a wall of text ... make each app more visual and into cards").
 * One card per tool: an icon tile drawn in the energy-bar style (ToolIcons.tsx), the tool's name and its one line, and the whole
 * card is the link. `tint` gives each group of the hub its own quiet colour so the groups read apart. Used by /tools and
 * /es/tools with the same links the lists had (names, lines and hrefs are passed through untouched). Static, no client code.
 */
import {ToolIcon,toolIconFor} from './ToolIcons';
import styles from './toolCards.module.css';

export type CardTint='lineups'|'time'|'practice'|'print'|'gameday';
export function ToolCards({links,tint}:{links:readonly {path:string;name:string;line?:string}[];tint:CardTint}){
 return <ul className={styles.cards} data-tint={tint} data-tool-cards="">{links.map(l=>{const {kind,badge}=toolIconFor(l.path);
  return <li key={l.path}><a className={styles.card} href={l.path} data-tool-card={kind}>
   <span className={styles.tile} aria-hidden="true"><ToolIcon kind={kind} size={42}/>{badge&&<span className={styles.badge}>{badge}</span>}</span>
   <span className={styles.body}><span className={styles.name}>{l.name}</span>{l.line&&<span className={styles.line}>{l.line}</span>}</span>
  </a></li>;})}</ul>;
}
