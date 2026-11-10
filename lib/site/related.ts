import {SITE_CARDS,cardPath,eraWord,type SiteCard} from './cards';
import {SITE_EXHIBITS,exhibitPath,type SiteExhibit} from './exhibits';
import {SITE_FISH,fishPath,fishPlaces,rarityWord} from './fish';
import {lessonById,lessonPath,LESSONS_INDEX,type SiteLesson} from './lessons';
import {hubBySlug} from './hubs';
import type {FishSpecies} from '@/lib/town/fishing/fishCatalog';
/**
 * Internal links for the long-tail reading pages (SEO, Nov 10 2026, docs/seo/DISCOVERY.md): /cards/<n>, /exhibits/<id> and
 * /fish/<id> had 3-6 links each, so a crawler that found one page found almost nothing else. Everything here is computed from
 * the same data the pages show (position, country, clubs, gallery, fishing spot, rarity, club), server-side, with no script:
 *   - previous / next in the collection's own order (it wraps, so every page has both);
 *   - "more like this" groups, each the NEXT few items after this one in its group (cyclic), so links spread evenly over the
 *     group instead of every page pointing at the same famous few;
 *   - one lesson or reading page that teaches the same football (ROLE_LESSON, EXHIBIT_READING: fixed tables of real lesson
 *     ids and hub slugs, checked when this module loads: a wrong id throws at build time);
 *   - cards ↔ fish through a real shared club (the Fishbook animal's club is one the player played for).
 * Budget: 8-15 links in the page body, never a list of everything (the index pages do that).
 */
export type SiteLink={path:string;name:string;meta?:string};
export type LinkGroup={title:string;links:SiteLink[]};
export type Related={prev:SiteLink;next:SiteLink;groups:LinkGroup[];read:SiteLink[]};

/** The next `k` items after `self` in `list` (cyclic), skipping anything in `skip`. */
function after<T>(list:readonly T[],self:T,k:number,skip:Set<T>):T[]{
 const i=list.indexOf(self),out:T[]=[];
 for(let n=1;n<list.length&&out.length<k;n++){const x=list[(i+n+list.length)%list.length];if(x!==self&&!skip.has(x))out.push(x);}
 out.forEach(x=>skip.add(x));return out;
}
const around=<T,>(list:readonly T[],self:T):[T,T]=>{const i=list.indexOf(self),n=list.length;return [list[(i-1+n)%n],list[(i+1)%n]];};
const lesson=(id:string):SiteLesson=>{const l=lessonById(id);if(!l)throw new Error(`related: lesson ${id} is not in the lesson catalog`);return l;};
const lessonLink=(id:string):SiteLink=>{const l=lesson(id);return {path:lessonPath(l.id),name:l.title,meta:`${l.formatLabel} lesson and quiz`};};
const hubLink=(slug:string):SiteLink=>{const h=hubBySlug(slug);if(!h)throw new Error(`related: hub ${slug} does not exist`);return {path:h.path,name:h.h1,meta:h.blurb};};
const LESSONS_LINK:SiteLink={path:LESSONS_INDEX,name:'Football lessons and quizzes for kids',meta:'Every lesson, by team size'};

// ---- cards ---------------------------------------------------------------------------------------------------------------------
/** The lesson that teaches each card position's job (lesson ids from public/lessons; futsal roles get futsal lessons). */
export const ROLE_LESSON:Record<string,string>={goalkeeper:'bld_7_usekeeper',fullback:'next7_outsideback',centerback:'def_7_goalside',midfielder:'learn7_receive',
 winger:'prn_7_spread',striker:'next7_reachableforward',goleiro:'expf_keeperposition',fixo:'def_f_goalside',ala:'f_paralela',pivot:'f_pivot',coach:'learn7_shape'};
const ROLE_PLURAL:Record<string,string>={goalkeeper:'goalkeepers',fullback:'full-backs',centerback:'centre-backs',midfielder:'midfielders',winger:'wingers',striker:'strikers',
 goleiro:'futsal goalkeepers',fixo:'futsal fixos',ala:'futsal alas',pivot:'futsal pivôs',coach:'head coaches'};
export const rolePlural=(role:string)=>ROLE_PLURAL[role]??`${role}s`;
export const roleLesson=(c:Pick<SiteCard,'role'>):SiteLesson=>lesson(ROLE_LESSON[c.role]??'learn7_roles');
const cardLink=(c:SiteCard):SiteLink=>({path:cardPath(c.number),name:c.displayName,meta:[`#${c.number}`,c.roleLabel,c.country].filter(Boolean).join(' · ')});
const clubKey=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\b(fc|cf|afc|sc|ac|as|ssc|cd|fk|sk|club|de|futbol|football)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const CARDS_BY_CLUB=new Map<string,SiteCard[]>();
for(const c of SITE_CARDS)for(const k of new Set(c.clubs.map(clubKey)))if(k)(CARDS_BY_CLUB.get(k)??CARDS_BY_CLUB.set(k,[]).get(k)!).push(c);
const FISH_BY_CLUB=new Map<string,FishSpecies>();
for(const f of SITE_FISH){const k=clubKey(f.club.name);if(k&&!FISH_BY_CLUB.has(k))FISH_BY_CLUB.set(k,f);}
/** The Fishbook animal whose club this player played for (latest club first), if any. */
export function cardFish(c:SiteCard):{fish:FishSpecies;club:string}|undefined{
 for(const club of [...c.clubs].reverse()){const fish=FISH_BY_CLUB.get(clubKey(club));if(fish)return {fish,club};}
 return undefined;
}
export function cardRelated(c:SiteCard):Related{
 const [p,n]=around(SITE_CARDS,c),skip=new Set<SiteCard>([c]),groups:LinkGroup[]=[];
 const same=after(SITE_CARDS.filter(x=>x.role===c.role&&x.era===c.era),c,3,skip);
 if(same.length)groups.push({title:`More ${rolePlural(c.role)} (${eraWord(c).toLowerCase()}s)`,links:same.map(cardLink)});
 if(c.country){const l=after(SITE_CARDS.filter(x=>x.country===c.country),c,3,skip);if(l.length)groups.push({title:`More cards from ${c.country}`,links:l.map(cardLink)});}
 for(const club of [...c.clubs].reverse()){
  const l=after(CARDS_BY_CLUB.get(clubKey(club))??[],c,2,skip);
  if(l.length){groups.push({title:`Also on a ${club} card`,links:l.map(cardLink)});break;}
 }
 const read:SiteLink[]=[lessonLink(roleLesson(c).id)],cf=cardFish(c);
 if(cf)read.push({path:fishPath(cf.fish.id),name:`${cf.fish.name}: the Fishbook animal for ${cf.fish.club.name}`,meta:'Fishbook'});
 else read.push(c.futsal?hubLink('futsal-for-kids'):hubLink('7v7-9v9-11v11'));
 return {prev:cardLink(p),next:cardLink(n),groups,read};
}

// ---- exhibits ------------------------------------------------------------------------------------------------------------------
/** What to read next for a museum case: a lesson (`l:`) or a topic hub (`h:`), by exhibit id, else by gallery. */
export const EXHIBIT_READING:Record<string,string>={
 'laws-1863':'h:football-rules-for-kids','penalty-1891':'h:football-rules-for-kids','var-2018':'h:football-rules-for-kids','offside-rules':'l:next7_offsideboundary',
 'free-kick-wall':'l:exp11_shortfreekick','throw-in':'l:next7_dribblein','keeper-hands-1912':'l:bld_7_usekeeper','formations-history':'l:learn7_shape',
 'futsal-1989':'h:futsal-for-kids','first-international-1872':'h:passing-and-support','shirts':'l:learn7_roles','ball-curve':'l:exp11_shortfreekick',
 'gallery:laws':'h:football-rules-for-kids','gallery:tactics':'l:learn11_shape','gallery:worldcup':'h:7v7-9v9-11v11','gallery:skills':'h:passing-and-support'};
const reading=(e:SiteExhibit):SiteLink=>{const r=EXHIBIT_READING[e.id]??EXHIBIT_READING[`gallery:${e.gallery}`];
 return !r?LESSONS_LINK:r.startsWith('l:')?lessonLink(r.slice(2)):hubLink(r.slice(2));};
const exhibitLink=(e:SiteExhibit):SiteLink=>({path:exhibitPath(e.id),name:e.title,meta:`${e.galleryTitle} · ${e.year}`});
const CARDS_LINK:SiteLink={path:'/cards',name:'Player cards',meta:'Today’s stars and all-time greats'};
export function exhibitRelated(e:SiteExhibit):Related{
 const [p,n]=around(SITE_EXHIBITS,e),skip=new Set<SiteExhibit>([e]),groups:LinkGroup[]=[];
 const gallery=after(SITE_EXHIBITS.filter(x=>x.gallery===e.gallery),e,4,skip);
 if(gallery.length)groups.push({title:`More in ${e.galleryTitle}`,links:gallery.map(exhibitLink)});
 const time=after(SITE_EXHIBITS,e,3,skip);
 if(time.length)groups.push({title:'Next on the museum timeline',links:time.map(exhibitLink)});
 return {prev:exhibitLink(p),next:exhibitLink(n),groups,read:[reading(e),e.gallery==='hall'?CARDS_LINK:LESSONS_LINK].filter((x,i,a)=>a.findIndex(y=>y.path===x.path)===i)};
}

// ---- fish ----------------------------------------------------------------------------------------------------------------------
const fishLink=(f:FishSpecies):SiteLink=>({path:fishPath(f.id),name:f.name,meta:`${rarityWord(f)} · ${f.club.name}`});
/** Cards of players who played for the animal's club (real club history on both sides). */
export const fishCards=(f:FishSpecies):SiteCard[]=>CARDS_BY_CLUB.get(clubKey(f.club.name))??[];
export function fishRelated(f:FishSpecies):Related{
 const [p,n]=around(SITE_FISH,f),skip=new Set<FishSpecies>([f]),groups:LinkGroup[]=[];
 const place=fishPlaces(f)[0],spot=f.spots[0];
 if(place&&spot){const l=after(SITE_FISH.filter(x=>x.spots.includes(spot)),f,3,skip);if(l.length)groups.push({title:`Also caught at ${place.name}`,links:l.map(fishLink)});}
 const rare=after(SITE_FISH.filter(x=>x.rarity===f.rarity),f,3,skip);
 if(rare.length)groups.push({title:`More ${rarityWord(f).toLowerCase()}${rarityWord(f).endsWith('catch')?'es':''}`,links:rare.map(fishLink)});
 const all=fishCards(f),start=f.id.length+f.name.length,cards=Array.from({length:Math.min(3,all.length)},(_,i)=>all[(start+i)%all.length]);
 if(cards.length)groups.push({title:`Player cards from ${f.club.name}`,links:cards.map(cardLink)});
 else{const land=after(SITE_FISH.filter(x=>x.club.country===f.club.country),f,2,skip);
  if(land.length)groups.push({title:`More club animals from ${f.club.country}`,links:land.map(fishLink)});}
 return {prev:fishLink(p),next:fishLink(n),groups,read:[cards.length?CARDS_LINK:LESSONS_LINK]};
}
