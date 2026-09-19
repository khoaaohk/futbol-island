'use client';
import {useEffect,useState} from 'react';
import type {IslandNewsFeed} from '@/lib/town/islandNews';
import {matchStory,recentMatchStories} from '@/lib/town/matchStory';
import styles from './NpcConversation.module.css';
import {loadIslandNews} from '@/lib/town/newsClient';
import {NEWS_LEAGUES,type NewsLeague} from '@/lib/town/newsLeagues';
import NpcClips from './NpcClips';
const lessons=['When you watch the goals, look for a run that creates space before the finish.','Try watching the passer as well as the scorer. What options did their teammates offer?','Watch how defenders react after losing the ball. Who protects the middle?','A goal minute tells you when, but the build-up shows you how. Look for the pass before the final pass.'];
export default function NpcMatchStory({id,name,league,slot=0,focus}:{id:string;name:string;league?:NewsLeague;slot?:number;focus?:string}){
 const [feed,setFeed]=useState<IslandNewsFeed|null>(null),[failed,setFailed]=useState(false),[index,setIndex]=useState(0);
 useEffect(()=>{let active=true;setFeed(null);setFailed(false);setIndex(0);loadIslandNews('scores',league).then(data=>{if(active){setFeed(data);setFailed(data.unavailable);}}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[id,league]);
 const seed=Array.from(id).reduce((n,c)=>n+c.charCodeAt(0),0),items=recentMatchStories((feed?.items??[]).filter(item=>!league||item.league===league)),item=items.length?items[(slot+index)%Math.min(items.length,12)]:undefined,story=item?matchStory(item):null;
 return <div className={`${styles.message} ${styles.matchStory}`}><span className={styles.speaker}>{name}</span>{!feed&&!failed?<p role="status">Checking {league?NEWS_LEAGUES[league]:'the recent matches'}…</p>:story&&item?<><p>{story.opener}</p><p>{story.result}</p>{story.goals.length>0&&<ul>{story.goals.map((goal,i)=><li key={i}>{goal}</li>)}</ul>}{story.note&&<p>{story.note}</p>}<p>{focus??lessons[seed%lessons.length]}</p>{league&&<NpcClips league={league} matchId={item.id}/>}<small>{item.detail} · {new Date(item.publishedAt).toLocaleDateString()} · <a href={item.url} target="_blank" rel="noopener noreferrer">{item.source} match report</a></small>{items.length>1&&<p><button type="button" onClick={()=>setIndex(i=>i+1)}>Tell me about another game</button></p>}</>:<p>I don’t have a verified completed {league?NEWS_LEAGUES[league]:'league'} match from the past week to share right now. Ask me about my other interests while we wait.</p>}</div>;
}
