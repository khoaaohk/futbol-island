import KonbiniRoom from '@/components/KonbiniRoom';
import SaveSync from '@/components/saves/LazySaveSync';
export const metadata={title:'Konbini · Futbol Island',description:'Walk into the island Konbini: football magazines, match-day fuel and a friendly cashier.'};
import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function KonbiniPage(){preloadIslandBrush();return <><KonbiniRoom/><SaveSync boot={false}/></>;}
