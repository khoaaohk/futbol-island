export const PATHS_PREVIEW=process.env.NODE_ENV!=='production';
export const STORY_CARDS=[
 {id:'futsl',title:'Smaller court. Bigger game.',skill:'Love Futsl',color:'#5cace4'},
 {id:'reset',title:'Mental Toughness',skill:'Mental toughness',color:'#f0bd91'},
 {id:'regulate',title:'When the game feels unfair.',skill:'Regulating emotions',color:'#eab1be'},
 {id:'grit',title:'Not yet is a starting point.',skill:'Grit & healthy practice',color:'#e7cf87'},
 {id:'empathy',title:'Emotional Intelligence',skill:'Emotional intelligence',color:'#b4d4ca'},
 {id:'loss',title:'After the Final Whistle',skill:'Handling a loss',color:'#c8c3df'},
] as const;
export type StoryId=typeof STORY_CARDS[number]['id'];
export const STORY_KEY='fi2-life-paths-v1';
export function readStoryProgress(value:unknown):StoryId[]{return Array.isArray(value)?STORY_CARDS.filter(c=>value.includes(c.id)).map(c=>c.id):[];}
export const CHAPTER_STORIES={support:[{id:'reset',afterStage:0},{id:'empathy',afterStage:2}],width:[{id:'regulate',afterStage:1}],movement:[{id:'grit',afterStage:0},{id:'loss',afterStage:3}]} as const;
export function storyAvailable(id:StoryId,afterStage:number,tacticalCompleted:readonly number[],completed:readonly StoryId[],preview=PATHS_PREVIEW){return preview||completed.includes(id)||tacticalCompleted.includes(afterStage);}
