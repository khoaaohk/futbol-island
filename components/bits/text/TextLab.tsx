'use client';
/**
 * /bits-lab/text (dev only): the heat-safe text one-shots in components/bits/text, each shown with the museum exhibit it is
 * meant for (wiring into the exhibits waits for the museum work). Replay buttons drive the manual ones.
 */
import {useState} from 'react';
import Link from 'next/link';
import BlurText from './BlurText';
import SplitFlapText from './SplitFlapText';
import StrokeText from './StrokeText';
import FoldText from './FoldText';
import CountUp from './CountUp';
import RotatingText from './RotatingText';
import DecryptedText from './DecryptedText';
import TextType from './TextType';
import FallingText from './FallingText';
import ShuffleText from './ShuffleText';
import TrueFocus from './TrueFocus';
import EchoText from './EchoText';
import ShinyText from './ShinyText';
import styles from '../BitsLab.module.css';
import t from './TextLab.module.css';

const RESULTS=['GOAL','SAVED','MISSED'];
const CARD_CLASS=[t.noCard,t.yellow,t.red];

export default function TextLab(){
 const [n,setN]=useState(0),[result,setResult]=useState(0),[board,setBoard]=useState(0),[varStep,setVarStep]=useState(0),[card,setCard]=useState(0);
 const replay=()=>setN(x=>x+1);
 return <main className={styles.page} data-text-lab>
  <header className={styles.head}><h1>Text animations</h1>
   <p>One-shots in <code>components/bits/text</code>: in view, on mount, or on an event; no loops; reduced motion shows the final text. <Link href="/bits-lab">← Components</Link></p>
   <div className={styles.row}><button type="button" data-text-replay onClick={replay}>Replay all</button></div>
  </header>
  <div className={t.grid}>
   <section className={t.demo} data-demo="split-flap"><h2>SplitFlapText</h2><p className={t.for}>World Cup 1930 voyage board · scoreboards</p>
    <SplitFlapText text={board?'MONTEVIDEO 4 2':'GENOA → MONTEVIDEO'} trigger="manual" play={`${board}-${n}`} padTo={18} className={t.board}/>
    <div className={styles.row}><button type="button" onClick={()=>setBoard(b=>1-b)}>Flip the board</button></div></section>

   <section className={t.demo} data-demo="stroke"><h2>StrokeText</h2><p className={t.for}>Laws of 1863 · rule titles drawing on</p>
    <StrokeText text="Law 1 · The field" fontSize={40} trigger="manual" play={n+1} className={t.ink}/></section>

   <section className={t.demo} data-demo="fold"><h2>FoldText</h2><p className={t.for}>Laws of 1863 · the paper unfolding</p>
    <FoldText text={'No player shall carry the ball.\nNo tripping or hacking.\nThe ball may be kicked, never thrown.'} trigger="manual" play={n+1} className={t.paper}/></section>

   <section className={t.demo} data-demo="count"><h2>CountUp</h2><p className={t.for}>Weather Machine 410 → 595 g · back-pass seconds · stats</p>
    <p className={t.big}><CountUp value={595} from={410} duration={1400} trigger="manual" play={n+1}/> g</p>
    <p className={t.small}>A ball soaked in rain could weigh this much.</p></section>

   <section className={t.demo} data-demo="rotating"><h2>RotatingText</h2><p className={t.for}>Cards 1970 · No card → Yellow → Red</p>
    <p className={t.big}><RotatingText texts={['No card','Yellow','Red']} auto trigger="manual" play={n+1} wordClassName={i=>CARD_CLASS[i]}/></p>
    <p className={t.small}>Controlled: <RotatingText texts={['No card','Yellow','Red']} index={card} wordClassName={i=>CARD_CLASS[i]}/> <button type="button" className={t.mini} onClick={()=>setCard(c=>(c+1)%3)}>Next decision</button></p></section>

   <section className={t.demo} data-demo="decrypted"><h2>DecryptedText</h2><p className={t.for}>VAR “Checking…” · Telstar TV tuning</p>
    <p className={t.big}><DecryptedText text="CHECKING… GOAL STANDS" trigger="manual" play={n+1} revealDirection="center"/></p></section>

   <section className={t.demo} data-demo="type"><h2>TextType</h2><p className={t.for}>Telstar TV caption · time-wasting commentary</p>
    <p className={t.mono}><TextType text={['He takes his time with the throw-in…','The referee checks his watch.','Time added on: four minutes.']} trigger="manual" play={n+1}/></p></section>

   <section className={t.demo} data-demo="falling"><h2>FallingText</h2><p className={t.for}>Futsal (low bounce) vs grass ball · Weather Machine raindrops</p>
    <p className={t.big}><FallingText text="Futsal ball stays low" restitution={0.2} trigger="manual" play={n+1} highlight={['low']} highlightClassName={t.accent}/></p>
    <p className={t.big}><FallingText text="Grass ball bounces high" restitution={0.55} trigger="manual" play={n+1} highlight={['high']} highlightClassName={t.accent}/></p></section>

   <section className={t.demo} data-demo="shuffle"><h2>ShuffleText</h2><p className={t.for}>Penalty 1891 · kick results</p>
    <p className={t.big}><ShuffleText text={RESULTS[result]} trigger="manual" play={`${result}-${n}`}/></p>
    <div className={styles.row}><button type="button" onClick={()=>setResult(r=>(r+1)%3)}>Take a kick</button></div></section>

   <section className={t.demo} data-demo="true-focus"><h2>TrueFocus</h2><p className={t.for}>VAR 2018 · the replay steps</p>
    <p className={t.big}><TrueFocus words={['Incident','Review','Decision']} index={varStep} accent="#e4322b"/></p>
    <div className={styles.row}><button type="button" onClick={()=>setVarStep(s=>(s+1)%3)}>Next step</button></div></section>

   <section className={t.demo} data-demo="echo"><h2>EchoText</h2><p className={t.for}>Women’s World Cup 1991 · “Akers”</p>
    <p className={t.huge}><EchoText text="AKERS" trigger="manual" play={n+1} echoes={4} tint="#2a5bd7"/></p></section>

   <section className={t.demo} data-demo="shiny"><h2>ShinyText</h2><p className={t.for}>Reward and stamp moments · one sweep</p>
    <p className={t.big}><ShinyText trigger="manual" play={n+1} shine="#f2c230">Visited</ShinyText></p></section>

   <section className={t.demo} data-demo="blur"><h2>BlurText</h2><p className={t.for}>Wall labels and story beats · every exhibit</p>
    <BlurText as="p" text="The first World Cup · 1930 · Montevideo" trigger="manual" play={n+1} className={t.big}/>
    <BlurText as="p" text="Uruguay built a new stadium for it in eight months." trigger="view" className={t.small}/></section>
  </div>
 </main>;
}
