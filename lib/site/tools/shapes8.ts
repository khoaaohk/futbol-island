import type {Line} from '../pitch';
import type {Shape} from './lineup';
const line=(name:string,spots:string):Line=>({name,spots:spots.split(' ').map(t=>{const [n,label]=t.split(':');return {n,label};})});
/** Round 4D: fútbol 8 (8v8: a keeper and seven outfield players, Spain's game for prebenjamín, benjamín and alevín). These shapes
 *  have no formation lesson pages yet, so they live here, not in lib/site/formations.ts (whose every entry has a page). */
export const SHAPES_8V8:readonly Shape[]=[
 {slug:'8v8-3-3-1',format:'8v8',shape:'3-3-1',lines:[line('Goalkeeper','1:GK'),line('Defenders','3:LB 4:CB 2:RB'),line('Midfielders','11:LM 8:CM 7:RM'),line('Forward','9:ST')]},
 {slug:'8v8-3-2-2',format:'8v8',shape:'3-2-2',lines:[line('Goalkeeper','1:GK'),line('Defenders','3:LB 4:CB 2:RB'),line('Midfielders','6:LCM 8:RCM'),line('Forwards','11:LS 9:RS')]},
 {slug:'8v8-2-3-2',format:'8v8',shape:'2-3-2',lines:[line('Goalkeeper','1:GK'),line('Defenders','3:LB 2:RB'),line('Midfielders','11:LM 8:CM 7:RM'),line('Forwards','10:LS 9:RS')]},
];
