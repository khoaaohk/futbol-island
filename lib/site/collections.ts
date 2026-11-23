import {SITE_CARDS,cardPath,type SiteCard} from './cards';
import {SITE_FISH,fishPath,rarityWord} from './fish';
import {FISH_SPOTS,type FishSpecies} from '@/lib/town/fishing/fishCatalog';
import {ROLE_LABELS} from '@/lib/town/cardCollection';
import {WOMEN,WORLD_CUP_COACHES,WORLD_CUP_FUTSAL,WORLD_CUP_MEN,WORLD_CUP_WOMEN} from './cardGroups';
import type {LinkGroup,SiteLink} from './related';
/**
 * Collection hubs (SEO, Nov 15 2026): pages that group the long tail of /cards/<n> and /fish/<id> by something people search
 * for ("famous strikers", "women's football legends", "World Cup winners", "sharks"), so each deep page has a topical parent
 * that can rank on its own. Every list is computed from the card and Fishbook data (role, era, fish group, rarity, fishing
 * spot) or from the checked name lists in lib/site/cardGroups.ts; only the short intros are written here.
 * Routes: one small page file per hub (app/(site)/cards/<slug>/page.tsx, app/(site)/fish/<slug>/page.tsx) rendering
 * components/site/CollectionHub.tsx. Listed in the sitemap by lib/site/paths.ts, linked from /cards, /fish, every member page
 * (lib/site/related.ts) and the matching position guide. tests/seo-links.cjs checks all of it.
 */
export type Collection={slug:string;path:string;parent:'cards'|'fish';crumb:string;h1:string;title:string;description:string;blurb:string;
 intro:string;more?:string;learn:{path:string;name:string;line:string}[];groups:LinkGroup[]};
/** When the hubs' content last changed (sitemap lastmod and CollectionPage dateModified). */
export const COLLECTIONS_UPDATED='2026-11-15';
const P='/learn/soccer-positions/';
const cardLink=(c:SiteCard):SiteLink=>({path:cardPath(c.number),name:c.displayName,meta:[`#${c.number}`,c.roleLabel,c.country].filter(Boolean).join(' · ')});
const byName=new Map(SITE_CARDS.map(c=>[c.name,c]));
const named=(names:readonly string[]):SiteCard[]=>names.map(n=>{const c=byName.get(n);if(!c)throw new Error(`collections: ${n} is not a card`);return c;});
const eraGroups=(cards:SiteCard[],what:string):LinkGroup[]=>[
 {title:`Today’s ${what}`,links:cards.filter(c=>c.era==='current').map(cardLink)},
 {title:`All-time great ${what}`,links:cards.filter(c=>c.era==='allTime').map(cardLink)}].filter(g=>g.links.length>0);
const role=(...r:string[])=>SITE_CARDS.filter(c=>r.includes(c.role)&&!c.coach);
const count=(g:LinkGroup[])=>g.reduce((a,x)=>a+x.links.length,0);
type Draft=Omit<Collection,'path'|'parent'|'description'|'blurb'>&{description:(n:number)=>string;blurb:(n:number)=>string};
const make=(parent:'cards'|'fish')=>(d:Draft):Collection=>{const n=count(d.groups);return {...d,parent,path:`/${parent}/${d.slug}`,description:d.description(n),blurb:d.blurb(n)};};

// ---- cards ---------------------------------------------------------------------------------------------------------------------
const WOMEN_CARDS=named(WOMEN);
const WOMEN_GROUPS:[string,string[]][]=[['Goalkeepers',['goalkeeper']],['Defenders',['fullback','centerback']],['Midfielders',['midfielder']],
 ['Wingers and strikers',['winger','striker']],['Coaches',['coach']]];
export const CARD_COLLECTIONS:readonly Collection[]=([
 {slug:'strikers',crumb:'Strikers',h1:'Famous strikers: player cards',title:'Famous Strikers for Kids: Player Cards',
  description:n=>`${n} famous strikers on Futbol Island player cards, from today’s top scorers to all-time greats, with what each one is good at.`,
  blurb:n=>`${n} strikers, today’s and all-time`,
  intro:'A striker plays closest to the other team’s goal. The main job is to score, and to help teammates score. These are the strikers in the Futbol Island card binder.',
  more:'Tap a card to read what the player is good at, the clubs they played for and one thing you can copy in your own games.',
  learn:[{path:P+'striker',name:'Striker in soccer',line:'Where the striker stands and three habits to practise'}],groups:eraGroups(role('striker'),'strikers')},
 {slug:'wingers',crumb:'Wingers',h1:'Famous wingers: player cards',title:'Famous Wingers for Kids: Player Cards',
  description:n=>`${n} famous wingers on Futbol Island player cards: the fast, wide attackers who dribble, cross and score, from today and all time.`,
  blurb:n=>`${n} wingers, today’s and all-time`,
  intro:'A winger attacks down the left or right side of the field. Wingers stretch the other team, dribble past defenders and cross the ball into the box. These are the wingers in the card binder.',
  learn:[{path:P+'winger',name:'Winger in soccer',line:'Where the winger stands and three habits to practise'}],groups:eraGroups(role('winger'),'wingers')},
 {slug:'midfielders',crumb:'Midfielders',h1:'Famous midfielders: player cards',title:'Famous Midfielders for Kids: Player Cards',
  description:n=>`${n} famous midfielders on Futbol Island player cards: the passers and playmakers who link defense and attack, today and all time.`,
  blurb:n=>`${n} midfielders, today’s and all-time`,
  intro:'Midfielders play in the middle of the field. They win the ball back, pass it forward and link the defenders with the attackers. These are the midfielders in the card binder.',
  learn:[{path:P+'central-midfielder',name:'Central midfielder in soccer',line:'The link player who receives on the turn'},
   {path:P+'defensive-midfielder',name:'Defensive midfielder in soccer',line:'The player who protects the middle'},{path:P+'attacking-midfielder',name:'Attacking midfielder in soccer',line:'The 10 who creates chances'}],
  groups:eraGroups(role('midfielder'),'midfielders')},
 {slug:'defenders',crumb:'Defenders',h1:'Famous defenders: player cards',title:'Famous Defenders for Kids: Player Cards',
  description:n=>`${n} famous defenders on Futbol Island player cards: full-backs and centre-backs who stop attacks and start them, today and all time.`,
  blurb:n=>`${n} full-backs and centre-backs`,
  intro:'Defenders stop the other team from scoring. Centre-backs guard the middle in front of the goal, and full-backs defend the sides and run forward to help attacks. These are the defenders in the card binder.',
  learn:[{path:P+'center-back',name:'Center back in soccer',line:'The defender who protects the middle'},{path:P+'fullback',name:'Fullback in soccer',line:'The defender on the side of the field'}],
  groups:[{title:'Centre-backs',links:role('centerback').map(cardLink)},{title:'Full-backs',links:role('fullback').map(cardLink)}]},
 {slug:'goalkeepers',crumb:'Goalkeepers',h1:'Famous goalkeepers: player cards',title:'Famous Goalkeepers for Kids: Player Cards',
  description:n=>`${n} famous goalkeepers on Futbol Island player cards, from today’s number ones to all-time greats, with what each one is good at.`,
  blurb:n=>`${n} goalkeepers, today’s and all-time`,
  intro:'The goalkeeper is the last line of defense and the only player who may use their hands, inside their own penalty area. These are the goalkeepers in the card binder.',
  learn:[{path:P+'goalkeeper',name:'Goalkeeper in soccer',line:'The job, the skills and where to stand'}],groups:eraGroups(role('goalkeeper'),'goalkeepers')},
 {slug:'coaches',crumb:'Coaches',h1:'Famous football coaches: cards',title:'Famous Football Coaches: Coach Cards',
  description:n=>`${n} famous football coaches on Futbol Island coach cards: the managers who picked the team, chose the formation and won the big trophies.`,
  blurb:n=>`${n} head coaches, today’s and all-time`,
  intro:'A head coach picks the team, chooses the formation and plans how the team will play. Some of these coaches were great players too. These are the coach cards in the binder.',
  learn:[{path:'/learn/soccer-formations',name:'Soccer formations',line:'The shapes coaches choose, with diagrams'},{path:'/learn/soccer-practice-plans',name:'Soccer practice plans',line:'Ready-made sessions for youth coaches'}],
  groups:eraGroups(SITE_CARDS.filter(c=>c.coach),'coaches')},
 {slug:'futsal',crumb:'Futsal stars',h1:'Futsal stars: player cards',title:'Futsal Stars: Famous Futsal Player Cards',
  description:n=>`${n} futsal stars on Futbol Island player cards: goleiros, fixos, alas and pivôs, the players who made five-a-side football famous.`,
  blurb:n=>`${n} goleiros, fixos, alas and pivôs`,
  intro:'Futsal is five-a-side football on a hard court, with a smaller ball that bounces less. Its positions have their own names: the goleiro is the goalkeeper, the fixo is the last defender, the alas play wide and the pivô plays at the front.',
  learn:[{path:'/learn/futsal-for-kids',name:'Futsal for kids',line:'Futsal lessons and quizzes'},{path:'/learn/soccer-rules/futsal-rules',name:'Futsal rules vs soccer rules',line:'Kick-ins, four seconds and accumulated fouls'}],
  groups:['goleiro','fixo','ala','pivot'].map(r=>({title:`${ROLE_LABELS[r]}s`,links:role(r).map(cardLink)}))},
 {slug:'women',crumb:'Women’s football legends',h1:'Women’s football legends: player cards',title:'Women’s Football Legends: Player Cards',
  description:n=>`${n} women’s football legends on Futbol Island cards: World Cup winners, Ballon d’Or winners, record scorers and the coaches who led them.`,
  blurb:n=>`${n} players and coaches`,
  intro:'Women have played football for more than 100 years. These cards are some of the best women players and coaches ever, from the first Women’s World Cup in 1991 to today’s Ballon d’Or winners.',
  learn:[{path:'/cards/world-cup-winners',name:'World Cup winners',line:'Cards of players and coaches who won a World Cup'}],
  groups:WOMEN_GROUPS.map(([title,roles])=>({title,links:WOMEN_CARDS.filter(c=>roles.includes(c.role)).map(cardLink)}))},
 {slug:'world-cup-winners',crumb:'World Cup winners',h1:'World Cup winners: player cards',title:'World Cup Winners: Player and Coach Cards',
  description:n=>`${n} World Cup winners on Futbol Island cards: men’s, women’s and futsal World Cup champions, and the coaches who led them.`,
  blurb:n=>`${n} champions: men’s, women’s and futsal`,
  intro:'The FIFA World Cup is played every four years: the men’s since 1930, the futsal World Cup since 1989 and the Women’s World Cup since 1991. Every card here is a player or coach who won one.',
  learn:[{path:'/exhibits',name:'The football museum',line:'World Cup history, balls and trophies'}],
  groups:[{title:'Men’s World Cup winners',links:named(WORLD_CUP_MEN).map(cardLink)},{title:'Women’s World Cup winners',links:named(WORLD_CUP_WOMEN).map(cardLink)},
   {title:'Futsal World Cup winners',links:named(WORLD_CUP_FUTSAL).map(cardLink)},{title:'Coaches who won the World Cup',links:named(WORLD_CUP_COACHES).map(cardLink)}]},
] as Draft[]).map(make('cards'));

/** The role hub of each card role (a card's own collection, and the "all the strikers" link on a position guide). */
const ROLE_HUB:Record<string,string>={striker:'strikers',winger:'wingers',midfielder:'midfielders',fullback:'defenders',centerback:'defenders',goalkeeper:'goalkeepers',
 coach:'coaches',goleiro:'futsal',fixo:'futsal',ala:'futsal',pivot:'futsal'};
export const collectionBySlug=(parent:'cards'|'fish',slug:string)=>(parent==='cards'?CARD_COLLECTIONS:FISH_COLLECTIONS).find(c=>c.slug===slug);
export const roleCollection=(role:string)=>CARD_COLLECTIONS.find(c=>c.slug===ROLE_HUB[role]);
/** Every hub a card is listed on, its role hub first. */
export function cardCollections(c:SiteCard):Collection[]{
 return CARD_COLLECTIONS.filter(h=>h.groups.some(g=>g.links.some(l=>l.path===cardPath(c.number)))).sort((a,b)=>(a.slug===ROLE_HUB[c.role]?-1:0)-(b.slug===ROLE_HUB[c.role]?-1:0));
}

// ---- fish ----------------------------------------------------------------------------------------------------------------------
const fishLink=(f:FishSpecies):SiteLink=>({path:fishPath(f.id),name:f.name,meta:`${rarityWord(f)} · ${f.club.name}`});
const RARITY=['common','uncommon','rare','legendary'] as const;
const byRarity=(list:FishSpecies[]):LinkGroup[]=>RARITY.map(r=>list.filter(f=>f.rarity===r)).filter(l=>l.length>0).map(l=>({title:rarityWord(l[0]),links:l.map(fishLink)}));
const group=(...g:string[])=>SITE_FISH.filter(f=>g.includes(f.group));
export const spotAnchor=(spot:string)=>`spot-${spot}`;
export const FISH_COLLECTIONS:readonly Collection[]=([
 {slug:'sharks',crumb:'Sharks',h1:'Sharks in the Fishbook',title:'Sharks for Kids: Every Shark in the Fishbook',
  description:n=>`${n} sharks in the Futbol Island Fishbook, from the little shark to the whale shark, each linked to a real football club or story.`,
  blurb:n=>`${n} sharks, from common to legendary`,
  intro:'Sharks are fish whose skeletons are made of cartilage, the bendy material in your ears and nose, not bone. There are hundreds of kinds, from small reef sharks to the whale shark, the biggest fish in the sea.',
  more:'In the Fishbook every shark is linked to a real football club, team or story. Where each one lives on the island is a made-up island story.',
  learn:[{path:'/fish/octopus-squid-and-rays',name:'Rays, octopuses, squid and more',line:'Rays are close cousins of sharks'}],groups:byRarity(group('shark'))},
 {slug:'crabs-and-shellfish',crumb:'Crabs and shellfish',h1:'Crabs, lobsters and shellfish in the Fishbook',title:'Crabs, Lobsters and Shellfish in the Fishbook',
  description:n=>`${n} crabs, lobsters, shrimp and other shellfish in the Futbol Island Fishbook, each linked to a real football club or story.`,
  blurb:n=>`${n} crabs, lobsters and shellfish`,
  intro:'Crabs, lobsters, shrimp, scallops and other shellfish all have a hard shell that protects their soft body. Many of them live on the sea floor, close to the shore.',
  more:'In the Fishbook every animal is linked to a real football club, team or story. Where each one lives on the island is a made-up island story.',
  learn:[{path:'/fish/spots',name:'Fishing spots',line:'Where to catch each animal on the island'}],
  groups:[{title:'Crabs',links:group('crab').map(fishLink)},{title:'Lobsters',links:group('lobster').map(fishLink)},{title:'Shrimp, scallops and other shellfish',links:group('shellfish').map(fishLink)}]},
 {slug:'octopus-squid-and-rays',crumb:'Octopuses, squid and rays',h1:'Octopuses, squid, rays and more in the Fishbook',title:'Octopus, Squid and Ray Facts for Kids: the Fishbook',/* Nov 23 2026 (seo-unindexed): was "…in the Fishbook" (crawled, not indexed, thinnest fish page) */
  description:n=>`Octopus, squid, ray, eel and seahorse facts for kids: three hearts, ink clouds, seahorse dads that carry the eggs, and ${n} animals linked to football clubs.`,
  blurb:n=>`${n} octopuses, squid, rays, eels and seahorses`,
  intro:'Octopuses and squid have no bones at all. Rays are flat cousins of sharks, eels are long, wiggly fish, and a seahorse is a fish that swims upright. An octopus has eight arms, three hearts and blue blood, and it can change the colour of its skin in a moment to hide. A squid has eight arms and two longer tentacles, and both can squirt a cloud of ink to escape. Rays breathe through gill slits on their underside, and a stingray has a sharp spine on its tail. A seahorse dad carries the eggs in a pouch on his belly until the babies hatch.',
  more:'In the Fishbook every animal is linked to a real football club, team or story. Where each one lives on the island is a made-up island story.',
  learn:[{path:'/fish/sharks',name:'Sharks',line:'Every shark in the Fishbook'}],
  groups:[{title:'Octopuses',links:group('octopus').map(fishLink)},{title:'Squid',links:group('squid').map(fishLink)},{title:'Rays',links:group('ray').map(fishLink)},
   {title:'Eels',links:group('eel').map(fishLink)},{title:'Seahorses',links:group('seahorse').map(fishLink)}]},
 {slug:'spots',crumb:'Fishing spots',h1:'Fishing spots on Futbol Island',title:'Fishing Spots on Futbol Island: What to Catch',
  description:()=>`Every fishing spot on Futbol Island and the sea animals you can catch at each one: piers, beaches, rocks, a pond and the deep-sea boats.`,
  blurb:()=>`${FISH_SPOTS.length} spots and what lives at each`,
  intro:'Every fishing spot on the island and the animals you can catch there. Some animals swim almost everywhere, and a few live at one spot only.',
  more:'The island and its fishing spots are made up. The football facts on each animal’s page are real.',
  learn:[{path:'/fish/sharks',name:'Sharks',line:'Every shark in the Fishbook'}],
  groups:FISH_SPOTS.map(s=>({title:s.name,line:s.story,id:spotAnchor(s.id),links:SITE_FISH.filter(f=>f.spots.includes(s.id)).map(fishLink)})).filter(g=>g.links.length>0)},
] as Draft[]).map(make('fish'));
/** The hubs a Fishbook animal is listed on (its animal group hub first, the spots page last). */
export const fishCollections=(f:FishSpecies)=>FISH_COLLECTIONS.filter(h=>h.groups.some(g=>g.links.some(l=>l.path===fishPath(f.id))));
export const COLLECTIONS:readonly Collection[]=[...CARD_COLLECTIONS,...FISH_COLLECTIONS];
