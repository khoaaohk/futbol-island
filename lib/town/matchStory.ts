import type {IslandNewsItem} from './islandNews';
export function recentMatchStories(items:IslandNewsItem[],now=Date.now()){
 return items.filter(item=>item.match?.state==='post'&&Date.parse(item.publishedAt)<=now&&Date.parse(item.publishedAt)>=now-7*86400000).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
export function matchStory(item:IslandNewsItem,now=new Date()){
 const match=item.match!;const date=new Date(item.publishedAt),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),day=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const days=Math.round((today.getTime()-day.getTime())/86400000);
 const when=days===0?'today':days===1?(date.getHours()>=18?'last night':'yesterday'):[0,6].includes(date.getDay())&&days<6?'over the weekend':`on ${date.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}`;
 return {opener:`Did you see ${match.home} against ${match.away} ${when}?`,result:`It finished ${match.home} ${match.homeScore}, ${match.away} ${match.awayScore}.`,goals:match.goals.map(g=>`${g.player} ${g.ownGoal?'put in an own goal benefiting':'scored'+(g.penalty?' a penalty':'')+' for'} ${g.team} at ${g.minute}.`),note:match.goalsComplete?(Number(match.homeScore)+Number(match.awayScore)===0?'Neither team scored. Look at how defenders protected the space in front of goal.':''): 'The score is confirmed, but some scorer or minute details are unavailable.'};
}
