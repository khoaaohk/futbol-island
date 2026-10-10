import ArcadeRoom from '@/components/ArcadeRoom';
import SaveSync from '@/components/saves/LazySaveSync';
export const metadata={title:'The Arcade · Futbol Island',description:'Walk into the arcade. Five football games, one skill at a time.'};
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function ArcadePage(){preloadIslandBrush();return <><ArcadeRoom/><SaveSync boot={false}/></>;}
