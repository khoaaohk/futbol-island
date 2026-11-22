import {ALL_GAME_PAGES,allShots,type GameId,type GamePage,type GameShot} from './games';
/**
 * "Play now" (Nov 22 2026, owner's SEO plan item 6: searchers of "play X online free" want to play at once). The first screen of
 * every game page is its play stage (components/site/games/GameParts.tsx PlayStage): the game's first real screenshots, a big
 * "Play now" button that opens the game in one tap (the deep link /arcade?game=<id>, no embed and no canvas on the page), a
 * one-line how-to-play and "works on phone and computer". The /games hub leads with a quick-play grid built from the same data.
 *
 * Posters: small top crops of the game's own stills (scripts/gen-play-posters.cjs → public/games/play/<same file name>), so the
 * first screen costs about 15-30 KB a picture instead of the 22-64 KB full stills (which stay in the stills well further down).
 */
/** [on a phone, on a computer]: each half finishes "How to play: … on a phone, or … on a computer." Taken from the game's
 *  own phone and desktop lists in lib/site/games.ts (tests/seo-games-playnow.cjs checks every game has one). */
export const GAME_CONTROLS:Record<GameId,readonly [string,string]>={
 kitrush:['swipe through your team’s kit','drag through it with the mouse'],
 snake:['swipe to turn the captain','use the arrow keys'],
 runner:['swipe left or right to change lane','use the arrow keys'],
 tennis:['move with the stick under your thumb','move with the arrow keys'],
 pinball:['tap Left and Right to flip','press A and D'],
 puzzle:['drag the pass to a team-mate','drag the pass with the mouse'],
 airhockey:['drag your striker with one finger','move the mouse'],
 lineup:['drag shapes onto the pitch','drag them with the mouse'],
 trophydrop:['slide to aim and let go to drop','aim with the mouse and let go'],
 rollball:['push your thumb the way to roll','use the arrow keys'],
 ballblaster:['drag to aim and let go to kick','drag with the mouse and let go'],
 keepyuppy:['tap the pads with both thumbs','press D, F, J and K'],
 popup:['swipe at the targets','aim with the arrows and kick with Space'],
 flickit:['swipe up through the ball','aim with the arrow keys'],
 footgolf:['drag back like a catapult and let go','drag back with the mouse'],
};
export const PLAY_NOW='Play now — free, no download';
export const PLAY_WORKS='Works on phone and computer. No ads, no sign-up.';
export const howToPlay=(g:GamePage)=>{const [p,c]=GAME_CONTROLS[g.id];return `How to play: ${p} on a phone, or ${c} on a computer.`;};
const PLAY_DIR='/games/play';
export const posterPath=(src:string)=>`${PLAY_DIR}/${src.split('/').pop()}`;
/** A shot's poster with its real size (360 px wide top crop of a phone still, 720 px wide for a wide one). */
export type Poster=GameShot&{full:string};
export function poster(s:GameShot):Poster{
 const wide=s.w>s.h,w=wide?720:360,h=wide?Math.round(s.h*720/s.w):Math.round(Math.min(s.h,s.w*760/480)*360/s.w);
 return {...s,src:posterPath(s.src),full:s.src,w,h};
}
/** The stage's pictures: the first three phone stills, or one wide still (Breakaway Run). */
export function stageShots(g:GamePage):Poster[]{
 const all=allShots(g),wide=all[0].w>all[0].h;
 return (wide?all.slice(0,1):all.filter(s=>s.h>s.w).slice(0,3)).map(poster);
}
/** The hub card's one picture: the game's first still, as a poster. */
export const cardShot=(g:GamePage)=>poster(allShots(g)[0]);
/** Every source still that needs a poster (the generator and the test read this). */
export const allPosterSources=()=>[...new Set(ALL_GAME_PAGES.flatMap(g=>[...stageShots(g).map(p=>p.full),cardShot(g).full]))];
