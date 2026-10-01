'use client';
import {pathProgressFrom} from '@/lib/town/cardTiers';
import {useQuestEvidence} from '@/lib/town/questProgress';
import {useQuizCompletions} from '@/lib/town/quizProgress';
import {FORMAT_PATHS,lessonEvidence} from '@/lib/paths/formatPaths';
import {GRAD_TITLES,GRADUATION_FORMATS,capRewardFor,ferryUnlocked,type GradFormat} from '@/lib/endgame/graduationModel';
import {openEndgame,useGraduations} from '@/lib/endgame/graduationStore';
import {Seal} from './Certificate';
import styles from './Endgame.module.css';

/**
 * Coaches Centre → Coaches Board (Lane 2, Sep 30 2026). The coach's whiteboard for this player: graduation badges (tap for the
 * certificate), the next goal on every path, the Ferry and the formation shapes pinned as each path graduates. Static
 * DOM/SVG, reads the same stores as Paths; nothing runs while it is closed. The IDP card beside it belongs to Lane 4.
 */
const SHAPES:Record<GradFormat,{name:string;why:string;rows:number[]}>={
 futsal:{name:'1–2–1 diamond',why:'A fixo at the back, two alas wide and a pivot up top.',rows:[1,2,1]},
 '7v7':{name:'2–3–1',why:'Fewer players means more touches for everyone.',rows:[2,3,1]},
 '9v9':{name:'3–2–3',why:'A back three that defends together.',rows:[3,2,3]},
 '11v11':{name:'4–3–3',why:'The full game with a midfield three.',rows:[4,3,3]},
};
function Shape({rows,ink}:{rows:number[];ink:string}){
 const h=100,gap=h/(rows.length+1);
 return <svg viewBox="0 0 160 110" aria-hidden="true"><rect x="3" y="3" width="154" height="104" rx="6" fill="none" stroke="#fff1d3" strokeWidth="1.5"/><path d="M3 55h154" stroke="#fff1d3" strokeWidth="1"/><circle cx="80" cy="55" r="12" fill="none" stroke="#fff1d3" strokeWidth="1"/>
  <circle cx="80" cy="100" r="5" fill="#f8d651" stroke={ink} strokeWidth="1.5"/>
  {rows.map((n,r)=>Array.from({length:n},(_,i)=><circle key={`${r}-${i}`} cx={160*(i+1)/(n+1)} cy={100-(r+1)*gap*.95} r="5.5" fill="#fff1d3" stroke={ink} strokeWidth="1.5"/>))}</svg>;
}
export default function CoachesBoard(){
 const record=useGraduations(),evidence=useQuestEvidence(),answers=useQuizCompletions();
 const steps=new Set(evidence.steps),progress=pathProgressFrom(steps,answers).byFormat;
 const nextLesson=(f:GradFormat)=>{const p=FORMAT_PATHS.find(x=>x.format===f);return p?.chapters.flatMap(c=>c.lessons).find(l=>!lessonEvidence(p.format,l,steps,answers).complete)??null;};
 const open=ferryUnlocked(record);
 return <div data-coaches-board>
  <div className={`${styles.card}`}>
   <span className={styles.eyebrow}>Your graduation badges</span>
   <div className={styles.shelf}>{GRADUATION_FORMATS.map(f=>{const cap=capRewardFor(f),grad=!!record.formats[f],pct=Math.round((progress[f]??0)*12);
    return <button key={f} type="button" className={styles.shelfItem} data-badge={f} disabled={!grad} aria-label={grad?`${GRAD_TITLES[f]} Graduate: see the certificate`:`${GRAD_TITLES[f]}: ${pct} of 12 starter lessons`} onClick={()=>openEndgame({target:'certificate',id:`grad:${f}`})} style={grad?undefined:{opacity:.6}}>
     <span style={{width:40,display:'block'}}><Seal ink={grad?cap.color:'#9aa596'} accent={grad?cap.color2:'#e7e7d1'}/></span>{grad?`${GRAD_TITLES[f]} Graduate`:`${GRAD_TITLES[f]} · ${pct}/12`}</button>;})}
    {record.finale&&<button type="button" className={styles.shelfItem} onClick={()=>openEndgame({target:'certificate',id:'diploma'})}><span style={{width:40,display:'block'}}><Seal ink="#22366b" accent="#f2bb45"/></span>Island Diploma</button>}
   </div>
  </div>
  <div className={styles.card}>
   <span className={styles.eyebrow}>Coach’s next goals</span>
   <ul className={styles.goals}>
    {GRADUATION_FORMATS.map(f=>{const next=nextLesson(f);return <li key={f}><span className={`${styles.tick} ${!next?styles.tickDone:''}`} aria-hidden="true">{next?'→':'✓'}</span><span style={{flex:1}}><b>{GRAD_TITLES[f]}</b>{next?`Next lesson: ${next.name}`:'Graduated. Try the “Go deeper” lessons for extra practice.'}</span>{next&&<button type="button" className={styles.secondary} onClick={()=>openEndgame({target:'paths',format:f})}>Go</button>}</li>;})}
    <li><span className={`${styles.tick} ${record.finale?styles.tickDone:''}`} aria-hidden="true">{record.finale?'✓':'⚑'}</span><span style={{flex:1}}><b>Matchday Ferry</b>{record.finale?'Champion! Ride again any time to practise.':open?'Ready to board: your Matchday final is waiting.':'Graduate all four paths to board for your Matchday final.'}</span>{open&&<button type="button" className={styles.secondary} onClick={()=>openEndgame({target:'ferry'})}>Board</button>}</li>
   </ul>
  </div>
  <div className={styles.card}>
   <span className={styles.eyebrow}>The shapes you learned</span>
   <p>Each path pins its team shape to the board when you graduate. Same big ideas, different spaces.</p>
   <div className={styles.board}>{GRADUATION_FORMATS.map(f=>{const s=SHAPES[f],grad=!!record.formats[f];return <div key={f} className={styles.formation} data-open={grad}>
    <Shape rows={s.rows} ink={grad?capRewardFor(f).color:'#5f6b5a'}/><strong>{GRAD_TITLES[f]} · {s.name}</strong><small>{grad?s.why:`Graduate ${GRAD_TITLES[f]} to pin this shape.`}</small></div>;})}</div>
  </div>
 </div>;
}
