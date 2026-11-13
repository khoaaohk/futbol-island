import type {NpcThoughtBook,NpcThoughts} from './npcChatterTypes';
import {peekIslandNews} from './newsClient';
import {SCORE_FAN_FALLBACK,SCORE_FAN_LEAGUE,scoreFanBubble} from './stadiumNpcs';

/**
 * DRIP FC Stadium score fans' bubbles (Nov 13 2026). Their `near` pool reads the island news cache (newsClient.peekIslandNews):
 * when a match desk has already loaded that league (a player opened a score fan's or a desk's chat, the existing cached request),
 * one line is a real verified result (scoreFanBubble); otherwise the authored lines plus SCORE_FAN_FALLBACK. Never a fetch, never
 * an invented score. The pool array is rebuilt only when the cached feed object changes (no per-scan allocation).
 */
export function withScoreFanBubbles(book:NpcThoughtBook):NpcThoughtBook{
 const byNpc:Record<string,NpcThoughts>={...book.byNpc};
 for(const [id,league] of Object.entries(SCORE_FAN_LEAGUE)){
  const base=book.byNpc[id];if(!base)continue;const authored=[...base.near.filter(l=>l!==SCORE_FAN_FALLBACK),SCORE_FAN_FALLBACK];let seen:unknown=null,pool:string[]=authored;
  byNpc[id]={idle:base.idle,get near(){const feed=peekIslandNews('scores',league);if(feed!==seen){seen=feed;const line=scoreFanBubble(feed,league,2);pool=line?[line]:authored;}return pool;}};
 }
 return {...book,byNpc};
}
