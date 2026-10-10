import KonbiniRoom from '@/components/KonbiniRoom';
import SaveSync from '@/components/saves/LazySaveSync';
export const metadata={title:'Konbini · Futbol Island',description:'Walk into the island Konbini: football magazines, match-day fuel and a friendly cashier.'};
export default function KonbiniPage(){return <><KonbiniRoom/><SaveSync boot={false}/></>;}
