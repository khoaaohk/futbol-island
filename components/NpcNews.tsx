'use client';
import {Icon} from './Icon';
import {useEffect,useState} from 'react';
import type {IslandNewsFeed,IslandNewsKind} from '@/lib/town/islandNews';
import {loadIslandNews} from '@/lib/town/newsClient';
import {NEWS_LEAGUES,type NewsLeague} from '@/lib/town/newsLeagues';
import type {IslandNewsItem} from '@/lib/town/islandNews';
import {betweenSeasonsLine,matchDayLabel} from '@/lib/town/matchStory';
import NpcClips from './NpcClips';
import styles from './NpcConversation.module.css';
export default function NpcNews({kind,league}:{kind:IslandNewsKind;league?:NewsLeague}){
 const [feed,setFeed]=useState<IslandNewsFeed|null>(null),[failed,setFailed]=useState(false),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setFailed(false);setFeed(null);loadIslandNews(kind,league).then(data=>{if(active){setFeed(data);setFailed(data.unavailable);}}).catch(()=>{if(active)setFailed(true);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[kind,league,retry]);
 const date=(value:string)=>new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 const row=(item:IslandNewsItem)=><li key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<span aria-hidden="true"> <Icon name="external"/></span></a><small>{item.detail}</small><small>{item.source} · {kind==='scores'?'Kickoff':'Published'} <time dateTime={item.publishedAt}>{date(item.publishedAt)}</time></small>{league&&item.match?.state==='post'&&<NpcClips league={league} matchId={item.id}/>}</li>;
 const last=(feed?.lastResults??[]).filter(item=>!league||item.league===league);
 return <section className={styles.news} aria-label={kind==='scores'?'Football scores':'Transfer reports'}><div className={styles.newsHeader}><h3>{kind==='scores'?league?NEWS_LEAGUES[league]:'Around the leagues':'Transfer notebook'}</h3><button type="button" disabled={loading} onClick={()=>setRetry(value=>value+1)}><span aria-hidden="true">↻</span>Refresh</button></div>
  <p className={styles.newsNote}>{kind==='scores'?'Results from the past week, games in progress, and upcoming fixtures. Choose a match to explore the play behind the score.':'Recent reports from BBC Sport and The Guardian. Headlines may include rumours; a report is not confirmation of a transfer.'}</p>
  <div role="status">{loading&&<p>Checking the football desk…</p>}{failed&&<p>The football desk is unavailable right now. Try again shortly, or ask me another question.</p>}</div>
  {feed&&!failed&&<><p className={styles.newsNote}>Checked <time dateTime={feed.fetchedAt}>{date(feed.fetchedAt)}</time>. Updates may take up to five minutes.{feed.partial?' Some sources are unavailable.':''}</p>{feed.items.length===0&&last.length===0&&!feed.season&&<p>{kind==='scores'?'No fixtures returned for these leagues in the current date window.':'No transfer reports from the past seven days are available.'}</p>}<ul>{feed.items.filter(item=>!league||item.league===league).map(row)}</ul>{last.length>0&&<><p className={styles.newsNote}>No finished games in the past week. The last results, from {matchDayLabel(last[0].publishedAt)}:</p><ul>{last.map(row)}</ul></>}{league&&feed.season&&<p>{betweenSeasonsLine(NEWS_LEAGUES[league],feed.season.nextMatchAt)}</p>}</>}
 </section>;
}
