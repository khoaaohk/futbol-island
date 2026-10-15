import MuseumRoom from '@/components/MuseumRoom';
import SaveSync from '@/components/saves/LazySaveSync';
export const metadata={title:'History Museum · Futbol Island',description:'Walk into the island’s History Museum: the Laws of the Game, World Cup history, balls and kits, football’s firsts, rules and tactics, skills and science, and its legends.'};
export default function MuseumPage(){return <><MuseumRoom/><SaveSync boot={false}/></>;}
