import Town from '@/components/Town';
import DevUnlock from '@/components/DevUnlock';
import SaveSync from '@/components/saves/LazySaveSync';
// Static (prerendered, CDN-cached). Returning from the Arcade, Konbini or Museum (/?from=arcade|konbini|museum) is
// rewritten in next.config.mjs to app/island-return, which renders <Town returningFromArcade/>.
// ?store= is read by Town on the client after load.
export default function Page() { return <><Town/><DevUnlock/><SaveSync/></>; }
