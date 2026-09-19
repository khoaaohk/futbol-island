import {CLIP_CHANNELS} from './islandClipsServer';
import {VIDEO_TOPICS} from './videoTopics';
import type {IslandClip} from './islandClips';
const channels=new Map([...Object.values(CLIP_CHANNELS).map(c=>[c.id,c.name] as const),...Object.values(VIDEO_TOPICS).map(c=>[c.channel,c.source] as const)]);
export function durationSeconds(value:string){const m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);return m?Number(m[1]??0)*3600+Number(m[2]??0)*60+Number(m[3]??0):0;}
type Video={id:string;snippet:{channelId:string;title:string;publishedAt:string};statistics?:{viewCount?:string};status?:{embeddable?:boolean;privacyStatus?:string};contentDetails?:{duration?:string;regionRestriction?:{allowed?:string[];blocked?:string[]}}};
export function careerCandidate(video:Video):IslandClip|null{
 const source=channels.get(video.snippet.channelId),seconds=durationSeconds(video.contentDetails?.duration??''),region=video.contentDetails?.regionRestriction;
 if(!source||!/^[-\w]{11}$/.test(video.id)||video.status?.embeddable!==true||video.status.privacyStatus!=='public'||seconds<240||region?.blocked?.includes('US')||(region?.allowed&&!region.allowed.includes('US')))return null;
 if(/\b(full match|interview|podcast|debate|transfer|rumou?r)\b/i.test(video.snippet.title))return null;
 const views=Number(video.statistics?.viewCount??0);
 return {id:video.id,title:video.snippet.title,publishedAt:video.snippet.publishedAt,source,views:Number.isFinite(views)?views:0,league:'uefa.champions',durationSeconds:seconds};
}
