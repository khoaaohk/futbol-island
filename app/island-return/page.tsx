import type {Metadata} from 'next';
import IslandReturnWarm from '@/components/IslandReturnWarm';
import DevUnlock from '@/components/DevUnlock';
import SaveSync from '@/components/saves/LazySaveSync';
// Served at /play?from=arcade|konbini|museum|shop through the rewrite in next.config.mjs (the visitor's URL stays /play?from=…):
// the island with the player spawned outside the door they left by. Static, like /play.
export const metadata:Metadata={robots:{index:false},alternates:{canonical:'/play'}};
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function IslandReturnPage() { preloadIslandBrush(); return <><IslandReturnWarm/><DevUnlock/><SaveSync/></>; }
