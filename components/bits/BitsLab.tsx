'use client';
/**
 * /bits-lab (dev only, lib/dev/labRoutes.ts): the React Bits adaptations in components/bits, side by side, for review and the
 * browser checks (scripts/check-bits-browser.cjs). The FlexCarousel demo is a museum-style timeline (verified dates) ready for
 * the timeline exhibit to adopt; nothing here is linked from the game.
 */
import {useState,type CSSProperties} from 'react';
import Link from 'next/link';
import FlexCarousel from './FlexCarousel';
import CardStack from './CardStack';
import Stagger from './Stagger';
import CountUp from './text/CountUp';
import {sparkFrom} from './ClickSpark';
import MiniCard from '../MiniCard';
import {CARD_ENTRIES} from '@/lib/town/cardCollection';
import styles from './BitsLab.module.css';

const ACCENT={red:'#e4322b',blue:'#2a5bd7',yellow:'#f2c230',green:'#1f8a5b',black:'#1d1d1b'};
/** Timeline sample: dates and places checked against the museum exhibits' sources. */
const TIMELINE=[
 {year:1863,title:'The first laws',place:'London',caption:'The Football Association writes 13 laws. Carrying the ball is out.',accent:ACCENT.black},
 {year:1872,title:'The first international',place:'Glasgow',caption:'Scotland and England draw 0–0 at Hamilton Crescent.',accent:ACCENT.blue},
 {year:1891,title:'The penalty kick',place:'Irish FA idea, IFAB law',caption:'A foul near goal now costs a kick from 12 yards.',accent:ACCENT.red},
 {year:1930,title:'The first World Cup',place:'Montevideo',caption:'Thirteen teams; Uruguay beat Argentina 4–2 in the final.',accent:ACCENT.yellow},
 {year:1970,title:'Yellow and red cards',place:'Mexico',caption:'Cards make a referee’s decision clear in any language.',accent:ACCENT.yellow},
 {year:1989,title:'Futsal World Championship',place:'Netherlands',caption:'A smaller, heavier ball that stays low: close control first.',accent:ACCENT.green},
 {year:1991,title:'Women’s World Cup',place:'China',caption:'The USA win the first tournament; Michelle Akers scores 10.',accent:ACCENT.blue},
 {year:1992,title:'The back-pass rule',place:'IFAB',caption:'Keepers can no longer pick up a deliberate back-pass.',accent:ACCENT.green},
 {year:2018,title:'VAR at the World Cup',place:'Russia',caption:'Video review checks goals, penalties, red cards and identity.',accent:ACCENT.red},
];
const PACK=CARD_ENTRIES.slice(0,6);

export default function BitsLab(){
 const [selected,setSelected]=useState<string>('none yet'),[centred,setCentred]=useState(0);
 const [card,setCard]=useState(0),[coins,setCoins]=useState(45),[replay,setReplay]=useState(0);
 return <main className={styles.page} data-bits-lab>
  <header className={styles.head}><h1>React Bits lab</h1><p>Adapted components in <code>components/bits</code>. Dev only. <Link href="/bits-lab/text">Text animations →</Link></p></header>

  <section className={styles.gallery} aria-labelledby="fc-title" data-lab="flex-carousel">
   <h2 id="fc-title">FlexCarousel · timeline sample</h2>
   <p className={styles.note}>Drag, swipe or flick; arrows and Left/Right keys; tap a side card to centre it, tap the centre card to select. Centred: <b data-fc-centred>{TIMELINE[centred].year}</b> · Selected: <b data-fc-selected>{selected}</b></p>
   <FlexCarousel label="Football timeline" itemLabel={i=>`${TIMELINE[i].year}, ${TIMELINE[i].title}`} onIndexChange={setCentred} onSelect={i=>setSelected(`${TIMELINE[i].year} ${TIMELINE[i].title}`)} cardWidth="min(70vw, 300px)">
    {TIMELINE.map(t=><article key={t.year} className={styles.plate} style={{'--accent':t.accent} as CSSProperties}>
     <span className={styles.bar} aria-hidden="true"/>
     <strong className={styles.year}>{t.year}</strong>
     <h3>{t.title}</h3>
     <p className={styles.label}>{t.year} · {t.place}</p>
     <p className={styles.caption}>{t.caption}</p>
    </article>)}
   </FlexCarousel>
  </section>

  <section className={styles.block} aria-labelledby="stack-title" data-lab="card-stack">
   <h2 id="stack-title">CardStack · card pack</h2>
   <p className={styles.note}>Swipe left for the next card, right for the previous one, or tap. Card <b data-stack-at>{card+1}</b> of {PACK.length}.</p>
   <CardStack count={PACK.length} index={card} onIndexChange={setCard} label="Sample pack" topLabel={i=>`${PACK[i].name}. Show next card`}
    renderCard={i=><MiniCard name={PACK[i].name} number={PACK[i].number} era={PACK[i].era} got className={styles.mini}/>}/>
   <div className={styles.row}><button type="button" onClick={()=>setCard(c=>Math.max(0,c-1))}>Previous</button><button type="button" onClick={()=>setCard(c=>Math.min(PACK.length-1,c+1))}>Next card</button></div>
  </section>

  <section className={styles.block} aria-labelledby="coins-title" data-lab="count-up">
   <h2 id="coins-title">CountUp · coins</h2>
   <p className={styles.wallet}><span className={styles.coin} aria-hidden="true"/><b data-lab-coins><CountUp value={coins} pop srText={false}/></b> coins</p>
   <div className={styles.row}>
    <button type="button" data-lab-earn onClick={e=>{setCoins(c=>c+15);sparkFrom(e);}}>Earn 15 (spark)</button>
    <button type="button" onClick={()=>setCoins(c=>Math.max(0,c-40))}>Spend 40</button>
   </div>
  </section>

  <section className={styles.block} aria-labelledby="stagger-title" data-lab="stagger">
   <h2 id="stagger-title">Stagger · list entrance</h2>
   <button type="button" onClick={()=>setReplay(r=>r+1)}>Replay</button>
   <Stagger key={replay} as="ul" className={styles.list} step={50}>
    {['Warm-up: rondo','First touch','Pass and move','Small-sided game','Cool-down'].map(x=><li key={x}>{x}</li>)}
   </Stagger>
  </section>
 </main>;
}
