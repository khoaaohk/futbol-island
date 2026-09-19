'use client';
import {pathText} from '@/lib/paths/pathText';
import {useEffect,useRef,useState} from 'react';
import {CLUB_JOURNEYS,PLAYER_REVIEWED,journeyProgress,type PlayerCard} from '@/lib/town/passport';
import {recordPassportAnswer,usePassport} from '@/lib/town/passportProgress';
import {getCostume} from '@/lib/town/costumes';
import {STORE_ITEMS} from '@/lib/town/store';
import LearningCardArt from './LearningCardArt';
import {getIslandCostume} from '@/lib/town/islandCostumes';
import PassportPitch from './PassportPitch';
import QuestCelebration from './QuestCelebration';
import {useLearning} from '@/lib/town/learningProgress';
import LearningJourneys from './LearningJourneys';
import {LEARNING_JOURNEYS} from '@/lib/town/learningJourneys';
import {launchLearning} from '@/lib/town/learningProgress';
import styles from './IslandPassport.module.css';
type View='overview'|'story'|'player'|'pitch';
export default function IslandPassport({initialClub,onStore}:{initialClub?:string;onStore:(itemId:string)=>void}){
 const learning=useLearning(),pending=learning.celebration;
 const evidence=usePassport(),[clubId,setClubId]=useState<string|null>(initialClub??null),[view,setView]=useState<View>('overview'),[player,setPlayer]=useState<PlayerCard|null>(null),[answer,setAnswer]=useState<number|null>(null);
 const [page,setPage]=useState<'game'|'stories'>(initialClub?'stories':'game');
 const heading=useRef<HTMLHeadingElement>(null);
 const journey=CLUB_JOURNEYS.find(c=>c.id===clubId),costume=journey?getCostume(journey.id):undefined,status=journey?journeyProgress(journey,evidence):null;
 useEffect(()=>{if(initialClub){setPage('stories');setClubId(initialClub);setView('overview');}},[initialClub]);
 useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'nearest'});},[clubId,view,player]);
 const show=(next:View,p?:PlayerCard)=>{setPlayer(p??null);setAnswer(null);setView(next);};
 const select=(index:number)=>{if(!journey)return;setAnswer(index);recordPassportAnswer(view==='story'?'story':view==='player'?'player':'pitch',view==='player'?player!.id:journey.id,index);};
 const question=view==='story'?costume:view==='player'?player:view==='pitch'?journey?.challenge:undefined;
 const choices=question?.choices??[],correct=!!question&&answer===question.answer;
 const stampCount=CLUB_JOURNEYS.filter(c=>journeyProgress(c,evidence).earned).length;
 const stamp=(id:string,earned:boolean)=>{const c=getCostume(id)!;return <span className={styles.stamp} data-earned={earned}><span>FUTBOL ISLAND</span><strong>Club Culture Explorer</strong><small>{c.club} lesson<br/>{earned?'COMPLETED ✓':'IN PROGRESS'}</small></span>;};
 return <div className={styles.passport}>
 <nav className={styles.learningTabs} aria-label="Passport sections"><button className={styles.secondary} aria-pressed={page==='game'} onClick={()=>setPage('game')}>My game</button><button className={styles.secondary} aria-pressed={page==='stories'} onClick={()=>setPage('stories')}>futbo stories</button></nav>
 {page==='game'?pending&&learning.journeys[pending.id]?<QuestCelebration key={`${pending.id}:${pending.stage}`} id={pending.id} stage={pending.stage} record={learning.journeys[pending.id]!} onStore={onStore}/>:<LearningJourneys onStore={onStore} onStories={id=>{setClubId(id);show('overview');setPage('stories');}}/>:<>
 {journey&&<button className={styles.primary} onClick={()=>{const j=LEARNING_JOURNEYS.find(j=>j.club===journey.id);if(j)launchLearning(j.id,view==='player'?'player-card':'club-story');}}>Try this idea on the full pitch →</button>}
 {!journey?<>
 <div className={styles.summary}><span>{stampCount} / 3 culture stamps</span><span>{evidence.players.length} / 6 learning cards</span></div>
 <h3 ref={heading} tabIndex={-1}>A club. Two players. Your next move.</h3><p>Explore real mascot history, learn from a current star and a legend, then read the pitch. Earn Futbol Island learning stamps and badges.</p>
 <p className={styles.note}>These achievements are created by Futbol Island to record your learning. They are not official club stamps, player collectibles or endorsements.</p>
 <div className={styles.clubGrid}>{CLUB_JOURNEYS.map(c=>{const p=journeyProgress(c,evidence);return <button type="button" key={c.id} className={styles.clubCard} data-journey={c.id} onClick={()=>{setClubId(c.id);show('overview');}}>{stamp(c.id,p.earned)}<strong>{c.title}</strong><span>{c.skill}</span><progress value={p.count} max={4} aria-label={`${getCostume(c.id)?.club} journey progress`}/><small>{p.count}/4 learned · {p.earned?'Revisit journey':p.count?'Continue journey':'Start journey'} →</small></button>;})}</div>
 <section className={styles.section}><h4>Your player learning cards</h4><p>Complete a futbo pathion about a player to collect a learning card. The pitch artwork is ours; the player’s name identifies who you are studying.</p><div className={styles.playerGrid}>{CLUB_JOURNEYS.flatMap(c=>c.players.map(p=><button type="button" key={p.id} onClick={()=>{setClubId(c.id);show('player',p);}}><LearningCardArt size={48}/><strong>{p.name}</strong><small>{evidence.players.includes(p.id)?'Collected ✓':p.era}</small></button>))}</div></section>
 <p className={styles.note}>Three club journeys to try first. All 23 mascot stories are still available in the Store. Progress saves in this browser; clearing browser data removes it.</p>
 </>:<>
 <button type="button" className={styles.back} onClick={()=>{if(view==='overview')setClubId(null);else show('overview');}}>{view==='overview'?'← All club journeys':`← ${costume!.club} journey`}</button>
 {view==='overview'?<>
 <div className={styles.clubIntro}>{stamp(journey.id,status!.earned)}<div><small>{costume!.country} · {journey.skill}</small><h3 ref={heading} tabIndex={-1}>{journey.title}</h3><p>{status!.earned?'Learning stamp earned for this club journey. Revisit any lesson or try your gear.':'Complete four learning checks to earn a Futbol Island learning stamp.'}</p><progress value={status!.count} max={4} aria-label="Learning stamp progress"/><small>{status!.count}/4 complete</small></div></div>
 <div className={styles.missions}>
 <button type="button" onClick={()=>show('story')}><span>{status!.story?'✓':'1'}</span><div><strong>Learn about {costume!.name}</strong><small>Real club mascot history</small></div><span>→</span></button>
 {journey.players.map((p,i)=><button type="button" key={p.id} onClick={()=>show('player',p)}><span>{status!.players[i]?'✓':i+2}</span><div><strong>{p.name}</strong><small>{p.era} · {p.position}</small></div><span>→</span></button>)}
 <button type="button" onClick={()=>show('pitch')}><span>{status!.pitch?'✓':'4'}</span><div><strong>Read the pitch</strong><small>{journey.skill} · Interactive decision</small></div><span>→</span></button>
 </div>
 <section className={styles.section}><h4>{status!.earned?'Your earned learning badges':'Your island rewards'}</h4><p>These badges record completed club-journey material. My game records independent futbo decisions separately. They are not club merchandise. The linked gear stays free; finishing this journey earns the badges, not the equipment.</p>{journey.rewards.map(r=><div key={r.itemId} className={styles.reward}><span className={styles.badge}>{status!.earned?'✓ ':''}{r.badge}</span><strong>{STORE_ITEMS.find(i=>i.id===r.itemId)?.option.label}</strong><p>{pathText(r.connection)}</p><button type="button" className={styles.secondary} onClick={()=>onStore(r.itemId)}>View item in Store →</button></div>)}<button type="button" className={styles.secondary} onClick={()=>onStore(`costume:${journey.id}`)}>View {getIslandCostume(journey.id).name} island costume →</button></section>
 </>:<>
 <small className={styles.eyebrow}>{costume!.club} · {view==='story'?'Club culture':view==='player'?player!.era:journey.skill}</small>
 <h3 ref={heading} tabIndex={-1}>{view==='story'?`The story of ${costume!.name}`:view==='player'?player!.name:'Read the pitch'}</h3>
 {view==='story'?<><p className={styles.badge}>{costume!.animalLabel} · {costume!.storyType==='club-fiction'?'Fictional mascot story':'Club history'}</p>{pathText(costume!.story).split('\n\n').map((p,i)=><p key={i}>{p}</p>)}<a href={costume!.source} target="_blank" rel="noreferrer">Club story source ↗</a></>:view==='player'?<><div className={styles.profile}><LearningCardArt size={88}/><div><span className={styles.badge}>{player!.position}</span><p>{pathText(player!.bio)}</p></div></div><section className={styles.section}><h4>What to watch</h4><p>{pathText(player!.watch)}</p></section><a href={player!.source} target="_blank" rel="noreferrer">Official club profile / history ↗</a><p className={styles.note}>{player!.era==='Current star'?`Club affiliation checked ${PLAYER_REVIEWED}. `:''}A selected player to study, not a ranking. The futbo exercise is an original teaching example.</p></>:<PassportPitch key={journey.id} journey={journey} onAnswer={select} answer={answer}/>}
 <fieldset className={styles.quiz}><legend>{view==='story'?'Know your club':view==='player'?'Collect this learning card':'Choose your next move'}</legend>{view!=='pitch'&&<p>{(question as {question:string}).question}</p>}<div className={styles.choices}>{choices.map((choice,index)=><button type="button" key={choice} aria-pressed={answer===index} disabled={correct} data-correct={correct&&index===answer} onClick={()=>select(index)}>{choice}</button>)}</div>
 <p role="status" aria-live="polite" className={styles.feedback}>{answer===null?'Take your time. You can try again.':correct?`${view==='player'?'Player learning card collected! ':''}${question!.explanation}`:view==='pitch'?'That option leaves the passing lane blocked or crowds a teammate. Look for open space and try again.':'Not quite. Revisit the explanation above, then try again.'}</p></fieldset>
 {correct&&<div className={styles.completion}><strong>{status!.earned?`Learning stamp earned: ${costume!.club} journey`:`${status!.count}/4 learning checks complete`}</strong><p>{status!.earned?'Your store badges are ready. You can replay the lesson any time.':'Your progress is saved. Continue the journey when you’re ready.'}</p><button type="button" className={styles.primary} onClick={()=>show('overview')}>Back to club journey →</button></div>}
 </>}
 </>}
 </>}
 </div>;
}
