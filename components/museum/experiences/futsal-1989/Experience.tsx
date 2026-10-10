'use client';
import {useCallback,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import ExperienceBack from '../ExperienceBack';
import {isSoundEnabled} from '@/lib/games/sound';
import {museumSfx} from '@/lib/museum/museumSound';
import type {ExperienceProps} from '../types';
import {BounceLab} from './BounceLab';
import {Match,type Round} from './Match';
import {Rotation} from './Rotation';
import {Quiz} from './Quiz';
import {prefersReduced} from './spring';
import {Bean,INK,RED,Star,Sun,Teeth,WoodBall,WoodDefs} from './woodcut';
import css from './futsal.module.css';

/**
 * futsal-1989 · a cordel folheto (Oct 9 2026). The exhibit is told the way Brazilian market poets tell stories: a run of small
 * pamphlets hung on a string (cordel), each with a woodcut (xilogravura) cover in black ink on coloured paper and a short rhyme.
 * Five pamphlets, five beats the visitor drives by tapping them (or Next):
 *  0 · 1930   the cover: Juan Carlos Ceriani's five-a-side game for indoor courts in Montevideo;
 *  1 · Ball   the drop test, done with your own hands (BounceLab): why the low-bounce ball suits a hard court;
 *  2 · Touches the "Count the touches" match on a court, then on grass (Match): small space, more touches;
 *  3 · Spin   spin the 1-2-1 diamond (Rotation): fixo, alas and pivô swap spots, everyone attacks and defends;
 *  4 · 1989   the first FIFA Futsal World Cup: 16 teams, Brazil beat the Netherlands 2–1 in Rotterdam; then the "Quick check"
 *             (Quiz: four questions on the WHY of each lab) and the booklet's last word, a pressed "FIM" stamp.
 *
 * Motion: a pamphlet drops from the string on a spring when chosen; the new print is "pulled" with one press-in (WAAPI, a
 * spring-sampled linear() easing) and its parts arrive in order (art, rhyme, text, action). No View Transitions (they broke the
 * museum once): the press-in is a FLIP-free one-shot on the stage. Reduced motion: no press, everything just appears.
 * Heat: only the beat on screen is mounted; each beat's loop sleeps at rest (see BounceLab, Match, Rotation).
 */
const NEW_SOURCES=[
 {title:'FIFA · Brazil beat Netherlands in first FIFA Futsal World Cup final',url:'https://www.fifa.com/en/articles/brazil-netherlands-first-final-1989'},
 {title:'FIFA · Quality Programme for footballs (rebound test)',url:'https://inside.fifa.com/innovation/standards/footballs/fifa-quality-programme-for-footballs'},
 {title:'IFAB Laws of the Game · Law 1 The Field of Play',url:'https://www.theifab.com/laws/latest/the-field-of-play/'},
];
/** The style's own references (for the curious grown-up; the art itself is original). */
const STYLE_REFS=[
 {title:'Wikipedia · Literatura de cordel',url:'https://en.wikipedia.org/wiki/Literatura_de_cordel'},
 {title:'Wikipedia · J. Borges (cordel woodcut artist)',url:'https://en.wikipedia.org/wiki/J._Borges'},
];
type Beat={key:string;tab:string;tag:string;title:string;verse:[string,string]};
const BEATS:Beat[]=[
 {key:'cover',tab:'1930',tag:'O começo · the start',title:'How futsal began',verse:['Come and hear the story, friend, of how futsal came to be:','a game for five on a little court, as quick as quick can be!']},
 {key:'ball',tab:'Ball',tag:'A bola · the ball',title:'The ball that stays low',verse:['The futsal ball won’t jump up high, it will not touch the sky.','It stays down by your feet, my friend, so you can trap it. Try!']},
 {key:'match',tab:'Touches',tag:'O jogo · the game',title:'Count the touches',verse:['Five a side, a little court: the ball comes back to you.','More touches every minute, and your skills grow too!']},
 {key:'spin',tab:'Spin',tag:'A roda · the ring',title:'Spin the team',verse:['Fixo, ala, pivô: spin the team around!','Who defends today will score tomorrow, all over the ground.']},
 {key:'final',tab:'1989',tag:'A copa · the cup',title:'The first World Cup',verse:['In nineteen eighty-nine, sixteen teams came to play;','in Rotterdam, Brazil beat the Dutch two–one and won the day!']},
];
const sfx=(f:()=>void)=>{try{if(isSoundEnabled())f();}catch{}};
/** A spring sampled into a CSS linear() easing, for one-shot Web Animations (overshoot, then settle). */
const PRESS=(()=>{const k=260,z=.55,w0=Math.sqrt(k),wd=w0*Math.sqrt(1-z*z),pts:string[]=[];
 for(let i=0;i<=40;i++){const t=i/40*.9,x=1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t));pts.push((i===40?1:x).toFixed(3));}return `linear(${pts.join(',')})`;})();

export default function Experience({exhibit,onClose}:ExperienceProps){
 const [ceriani,brazil,ball]=exhibit.facts;
 const id=useId().replace(/:/g,'');
 const [beat,setBeat]=useState(0),[notes,setNotes]=useState(false),notesRef=useRef(false);notesRef.current=notes;
 const [done,setDone]=useState<Set<number>>(()=>new Set([0]));
 const [match,setMatch]=useState<{court:Round;pitch:Round}|null>(null);
 const stage=useRef<HTMLDivElement>(null),first=useRef(true);
 const go=useCallback((b:number)=>{if(b<0||b>=BEATS.length)return;setBeat(b);setDone(d=>{const n=new Set(d);n.add(b);return n;});},[]);
 const mark=useCallback((b:number)=>setDone(d=>{if(d.has(-b-1))return d;const n=new Set(d);n.add(-b-1);return n;}),[]);// negative keys = "did the activity"
 // The print press: each new beat is pulled onto the paper with one spring.
 useLayoutEffect(()=>{if(first.current){first.current=false;return;}const el=stage.current;if(!el)return;sfx(museumSfx.stamp);
  if(prefersReduced()||!el.animate)return;
  try{el.animate([{transform:'translateY(-18px) rotate(-1.2deg) scale(1.025)',opacity:0},{opacity:1,offset:.25},{transform:'none',opacity:1}],{duration:700,easing:PRESS});}catch{}
 },[beat]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;e.preventDefault();if(notesRef.current)setNotes(false);else onClose();};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[onClose]);
 const markFinal=useCallback(()=>mark(4),[mark]);
 const B=BEATS[beat];
 const next=beat<BEATS.length-1?<button type="button" className={css.btn} onClick={()=>go(beat+1)}>Next: {BEATS[beat+1].tab} →</button>:null;

 return <section className={css.root} role="dialog" aria-modal="true" aria-label={`${exhibit.year} · ${exhibit.title}: a cordel story`} data-museum-experience="futsal-1989" data-beat={B.key}>
  <svg className={css.defs} aria-hidden="true" focusable="false"><WoodDefs id={id}/></svg>
  <ExperienceBack onClose={onClose}/>
  <header className={css.top}>
   <span className={css.backSpace} aria-hidden="true"/>
   <div className={css.title}><span className={css.kicker}>{exhibit.year} · {exhibit.title}</span><strong>A cordel story</strong></div>
   <button type="button" className={`${css.ghost} ${css.notesBtn}`} onClick={()=>setNotes(true)} aria-haspopup="dialog" aria-expanded={notes} aria-label="Case notes">
    <BookIcon/><span className={css.long}>Case notes</span><span className={css.short}>Notes</span></button>
  </header>

  {/* The string: five pamphlets. The open one hangs lower; ones you've read carry a red tick. */}
  <nav className={css.cord} aria-label="Story pamphlets">
   <span className={css.string} aria-hidden="true"/>
   <ol role="tablist">{BEATS.map((b,i)=><li key={b.key}>
    <button type="button" role="tab" aria-selected={beat===i} data-beat={b.key} className={css.folheto} data-seen={done.has(i)||undefined} data-did={done.has(-i-1)||undefined}
     onClick={()=>{if(i!==beat){sfx(museumSfx.flapBook);go(i);}}} data-museum-own-cue aria-label={`${i+1}. ${b.title}`}>
     <span className={css.peg} aria-hidden="true"/><span className={css.fNum} aria-hidden="true">{i+1}</span><span className={css.fTab}>{b.tab}</span>
    </button></li>)}</ol>
  </nav>

  <main ref={stage} className={css.stage} key={B.key} data-stage={B.key}>
   <div className={css.head}>
    <p className={css.tag}>{B.tag}</p>
    <h1 className={css.h1}>{B.title}</h1>
    <p className={css.verse}><span>{B.verse[0]}</span> <span>{B.verse[1]}</span></p>
   </div>
   <div className={css.body}>
    {beat===0&&<div className={css.print}>
     <figure className={css.printArt}><CoverArt id={id}/></figure>
     <div className={css.printText}>
      <p className={css.history}><span className={css.tagSm}>Real history</span>{ceriani}</p>
      <p>He wrote rules for YMCA courts, borrowing ideas from basketball, handball and water polo.</p>
      <p className={css.small}>This story is told like a <i>cordel</i>: Brazilian story pamphlets, sold hanging on a string, with a woodcut print on the cover.</p>
      <div className={css.row}><button type="button" className={css.btn} onClick={()=>go(1)}>Open the story →</button></div>
     </div>
    </div>}
    {beat===1&&<><BounceLab onDone={()=>mark(1)}/><div className={css.nextRow}>{next}</div></>}
    {beat===2&&<Match paused={notes} forYourGame={exhibit.forYourGame} onNext={()=>go(3)} onResult={r=>{setMatch(r);mark(2);}}/>}
    {beat===3&&<><Rotation onDone={()=>mark(3)}/><div className={css.nextRow}>{next}</div></>}
    {beat===4&&<div className={css.print}>
     <figure className={css.printArt}><FinalArt id={id}/><figcaption className={css.caption}>16 teams played: one star each.</figcaption></figure>
     <div className={css.printText}>
      <p className={css.history}><span className={css.tagSm}>Real history</span>{brazil} 16 teams took part. In the final in Rotterdam, Brazil beat the hosts, the Netherlands, 2–1.</p>
      {match&&<p className={css.score}><b className={css.scoreNum}>{match.court.rate}</b><span>your touches a minute on the court, and <b>{match.pitch.rate}</b> on grass.</span></p>}
      <p className={css.take}><span className={css.tagSm}>Take it to your game</span>{exhibit.forYourGame}</p>
      <Quiz onDone={markFinal}/>
      <div className={css.row}><button type="button" className={css.ghost} onClick={()=>go(0)}>Read it again</button><button type="button" className={css.ghost} onClick={()=>setNotes(true)}>Case notes</button></div>
     </div>
    </div>}
   </div>
  </main>

  {notes&&<aside className={css.notes} role="dialog" aria-modal="true" aria-label="Case notes: futsal’s story">
   <div className={css.notesHead}><strong>Case notes</strong><button type="button" className={css.ghost} onClick={()=>setNotes(false)}>Close</button></div>
   <div className={css.notesBody}>
   <p className={css.small}>Real history. The match and the drop test are models built from the Laws.</p>
   <ol className={css.timeline}>
    <li><span className={css.year}>1930</span><div><h3>Montevideo, Uruguay</h3><p>{ceriani}</p><p>He wrote rules for YMCA courts, borrowing ideas from basketball, handball and water polo.</p></div></li>
    <li><span className={css.year}>Ball</span><div><h3>The low-bounce ball</h3><p>{ball}</p>
     <p>Drop it from 2 metres: by FIFA’s futsal Law 2 it must bounce back between 50 and 65 cm. It is 62–64 cm around and weighs 400–440 g. A top grass ball (FIFA Quality Pro) bounces back 120–165 cm.</p>
     <button type="button" className={css.ghost} onClick={()=>{setNotes(false);go(1);}}>Try the drop test</button></div></li>
    <li><span className={css.year}>Size</span><div><h3>Court and pitch</h3><p>A futsal court for international matches is 38–42 m long and 20–25 m wide, with 5 players a side (one is the goalkeeper). An international grass pitch is 100–110 m long and 64–75 m wide, with 11 a side.</p></div></li>
    <li><span className={css.year}>Spots</span><div><h3>Fixo, alas and pivô</h3><p>Besides the goalkeeper, a futsal team usually has a defender (fixo), two wingers (alas) and a forward (pivô). Outfield players can switch positions at any time.</p></div></li>
    <li><span className={css.year}>1989</span><div><h3>The first Futsal World Cup</h3><p>{brazil}</p><p>16 teams took part. In the final in Rotterdam, Brazil beat the hosts, the Netherlands, 2–1.</p></div></li>
   </ol>
   <p className={css.take}><span className={css.tagSm}>Take it to your game</span>{exhibit.forYourGame}</p>
   <details className={css.sources}><summary>Sources</summary><ul>
    {[...exhibit.sources,...NEW_SOURCES].map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
   </ul><p className={css.small}>The look: Brazilian cordel pamphlets and their woodcut covers. All the pictures here are new, cut in code.</p><ul>
    {STYLE_REFS.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
   </ul></details>
   </div>
  </aside>}
 </section>;
}

/** Cover print: a carved sun and stars over a small indoor court, two beans and a ball. Static (filtered once). */
function CoverArt({id}:{id:string}){
 return <svg viewBox="0 0 320 300" className={css.printSvg} role="img" aria-label="Woodcut: a banner reading Futsal 1930, a sun and stars, and two players with a ball on a small indoor court.">
  <g filter={`url(#${id}-ink)`}>
   <rect x="6" y="6" width="308" height="288" fill="none" stroke={INK} strokeWidth="5"/>
   <Teeth x={14} y={14} w={292} h={272} size={10}/>
   <Sun cx={250} cy={62} r={19}/>
   <Star x={58} y={44} r={8}/><Star x={104} y={30} r={5}/><Star x={150} y={50} r={6}/><Star x={196} y={34} r={4}/>
   {/* the banner: a black ribbon with its ends cut in a V */}
   <path d="M30 92H290L278 110L290 128H30L42 110Z" fill={INK}/>
   <path d="M30 92H290L278 110L290 128H30L42 110Z" fill={`url(#${id}-grain)`}/>
   {/* the court block, seen at an angle: black with grain, lines cut out */}
   <path d="M30 222 L290 222 L272 280 L48 280Z" fill={INK}/>
   <path d="M30 222 L290 222 L272 280 L48 280Z" fill={`url(#${id}-grain)`}/>
   <path d="M160 224V278M44 238H276M56 266H264" stroke="var(--paper)" strokeWidth="2" strokeDasharray="10 4"/>
   <ellipse cx="160" cy="252" rx="20" ry="7" fill="none" stroke="var(--paper)" strokeWidth="2"/>
  </g>
  <text x="160" y="120" textAnchor="middle" className={css.svgBanner}>FUTSAL · 1930</text>
  <Bean x={112} y={184} s={1.35} pattern="stripes" kick={.9}/>
  <Bean x={218} y={186} s={1.35} pattern="you" flip/>
  <g transform="translate(160 211)"><WoodBall r={8}/></g>
  <path d="M138 200q10 -9 16 -5" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeDasharray="3 4"/>
 </svg>;
}
/** 1989 print: sixteen cut stars (one per team) over a carved scoreboard and the two teams. */
function FinalArt({id}:{id:string}){
 return <svg viewBox="0 0 320 300" className={css.printSvg} role="img" aria-label="Woodcut: sixteen stars for sixteen teams, and a scoreboard: Brazil 2, Netherlands 1.">
  <g filter={`url(#${id}-ink)`}>
   <rect x="6" y="6" width="308" height="288" fill="none" stroke={INK} strokeWidth="5"/>
   <Teeth x={14} y={14} w={292} h={272} size={10}/>
   <rect x="60" y="96" width="200" height="62" fill={INK}/>
   <rect x="60" y="96" width="200" height="62" fill={`url(#${id}-grain)`}/>
   <path d="M36 262H284" stroke={INK} strokeWidth="5"/>
  </g>
  <text x="160" y="143" textAnchor="middle" className={css.svgScore}>2 – 1</text>
  <text x="160" y="178" textAnchor="middle" className={css.svgLabel}>BRAZIL · NETHERLANDS</text>
  <text x="160" y="194" textAnchor="middle" className={css.svgSmall}>Rotterdam, 1989</text>
  <g className={css.stars}>{Array.from({length:16},(_,i)=>{const row=i<8?0:1,k=i%8;return <g key={i} style={{['--i' as string]:i}}><Star x={50+k*31+(row?14:0)} y={36+row*26} r={8}/></g>;})}</g>
  <Bean x={70} y={232} s={.95} pattern="you" kick={.6}/><Bean x={112} y={232} s={.95} pattern="stripes"/>
  <Bean x={208} y={232} s={.95} pattern="plain" ink="#fffaf0"/><Bean x={250} y={232} s={.95} pattern="plain" ink="#fffaf0"/>
  <g transform="translate(152 251)"><WoodBall r={6}/></g>
 </svg>;
}
function BookIcon(){return <svg className={css.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;}
