// Every arcade game is free to play (owner, Nov 11 2026: "make all arcade games free"). One switch: lib/economy.ts ARCADE_PLAY_COST=0,
// and payArcadePlay spends nothing while it is 0. No start card, help line or search page may still state a price; earning is unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs'),read=f=>fs.readFileSync(f,'utf8');
assert.match(read('lib/economy.ts'),/export const ARCADE_PLAY_COST=0;/);assert.match(read('lib/economy.ts'),/ARCADE_COIN_CAPS=\{runner:12,pinball:15,tennis:18,live:20,puzzle:8,kitrush:12,snake:12,/,'payout caps unchanged');
assert.match(read('lib/arcade/arcadeWalletCore.ts'),/function payArcadePlay\([^)]*\):Promise<SpendResult>\{if\(ARCADE_PLAY_COST<1\)return Promise\.resolve\(\{ok:true\}\);/,'a free play never reaches spend()');
const cards=['components/games/KitRushGame.tsx','components/games/SquadSnakeGame.tsx','components/games/TennisCard.tsx','components/games/PinballCard.tsx','components/games/RunnerMenu.tsx','components/games/ArcadeGame3D.tsx','components/LiveArcadeMatch.tsx','components/ArcadeCoinsPanel.tsx','lib/tutorial/islandTutorial.json'];
for(const f of cards){const s=read(f);assert.doesNotMatch(s,/\d+ coins (per|a) (play|match)|<small>\{?ARCADE_PLAY_COST|<small>3 coins|Each play costs|cost three coins/,`${f}: no play price`);}
for(const f of ['components/games/KitRushGame.tsx','components/games/SquadSnakeGame.tsx'])assert.match(read(f),/>Play<\/ComicButton>[\s\S]*>Play again<\/ComicButton>/,`${f}: plain Play / Play again`);
const games=read('lib/site/games.ts');assert.doesNotMatch(games,/3 island coins|\(3 coins\)|charge the island/);assert.match(games,/All seven games are free to play/);/* Nov 11 2026: seven with Air Futbol */
const BANNED_CLAIMS=eval(read('lib/site/safety.ts').match(/BANNED_CLAIMS=(\[.*\]) as const/)[1]);assert(BANNED_CLAIMS.length>=5);
for(const re of BANNED_CLAIMS)assert.doesNotMatch(games,re,'new copy trips no banned claim');
console.log('PASS arcade-free: ARCADE_PLAY_COST=0, free plays spend nothing, no price on any start card, tutorial or games page; caps unchanged');
