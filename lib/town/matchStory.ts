import type {IslandNewsItem} from './islandNews';
const DAY=86400000;
/** "Verified completed": final status (state post, not flagged incomplete such as postponed), both scores numeric, kicked off in the past. */
export function isVerifiedResult(item:IslandNewsItem,now=Date.now()){
 const match=item.match,date=Date.parse(item.publishedAt);
 return !!match&&match.state==='post'&&match.completed!==false&&/^\d+$/.test(String(match.homeScore))&&/^\d+$/.test(String(match.awayScore))&&Number.isFinite(date)&&date<=now;
}
export function recentMatchStories(items:IslandNewsItem[],now=Date.now()){
 return items.filter(item=>isVerifiedResult(item,now)&&Date.parse(item.publishedAt)>=now-7*DAY).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
/** Older verified results (any age), newest first: used only when the past week has none. */
export function latestMatchStories(items:IslandNewsItem[],now=Date.now()){
 return items.filter(item=>isVerifiedResult(item,now)).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
/** "Sat 27 Sep" in the viewer's time zone. */
export const matchDayLabel=(iso:string)=>{const d=new Date(iso);return `${d.toLocaleDateString('en-US',{weekday:'short'})} ${d.getDate()} ${d.toLocaleDateString('en-US',{month:'short'})}`;};
export function matchStory(item:IslandNewsItem,now=new Date(),older=false){
 const match=item.match!;const date=new Date(item.publishedAt),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),day=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const days=Math.round((today.getTime()-day.getTime())/86400000);
 const when=days===0?'today':days===1?(date.getHours()>=18?'last night':'yesterday'):[0,6].includes(date.getDay())&&days<6?'over the weekend':`on ${date.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}`;
 const opener=older?`There were no games in the past week, so here is the league’s last match, on ${matchDayLabel(item.publishedAt)}: did you see ${match.home} against ${match.away}?`:`Did you see ${match.home} against ${match.away} ${when}?`;
 return {opener,result:`It finished ${match.home} ${match.homeScore}, ${match.away} ${match.awayScore}.`,goals:match.goals.map(g=>`${g.player} ${g.ownGoal?'put in an own goal benefiting':'scored'+(g.penalty?' a penalty':'')+' for'} ${g.team} at ${g.minute}.`),note:match.goalsComplete?(Number(match.homeScore)+Number(match.awayScore)===0?'Neither team scored. Look at how defenders protected the space in front of goal.':''): 'The score is confirmed, but some scorer or minute details are unavailable.'};
}
/** Copy for a league with no completed match in the whole lookback (off-season). */
export function betweenSeasonsLine(leagueName:string,nextMatchAt?:string){
 return `I can’t find any finished ${leagueName} matches right now, so the league is between seasons.${nextMatchAt&&Number.isFinite(Date.parse(nextMatchAt))?` The next match is on ${matchDayLabel(nextMatchAt)}.`:''} Ask me about my other interests while we wait.`;
}
