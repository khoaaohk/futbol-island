'use client';
import PlayerPopUpBook from '@/components/PlayerPopUpBook';
import type {PlayerBookId} from '@/lib/books/catalog';
/**
 * Nov 17 2026 (owner: "the pop up book needs to look like the one in the game"): the website opens the game's own 3D paper
 * pop-up reader. This file is only reached through OpenBook's dynamic import, so three.js and the spreads load on the tap,
 * never with the page. `site` skips the game-only parts (sponsor/activity analytics, the "Take it to your game" lesson card).
 */
export default function GameBookReader({book,onClose}:{book:{id:string};onClose:()=>void}){
 return <PlayerPopUpBook bookId={book.id as PlayerBookId} onClose={onClose} site/>;
}
