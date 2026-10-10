import type {Metadata} from 'next';
import Town from '@/components/Town';
import DevUnlock from '@/components/DevUnlock';
import SaveSync from '@/components/saves/LazySaveSync';
// Served at /?from=arcade|konbini|museum through the rewrite in next.config.mjs (the visitor's URL stays /?from=…): the island
// with the player spawned outside the door they left by. Static, like /.
export const metadata:Metadata={robots:{index:false}};
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function IslandReturnPage() { preloadIslandBrush(); return <><Town returningFromArcade/><DevUnlock/><SaveSync/></>; }
