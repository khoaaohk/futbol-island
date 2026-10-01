/**
 * Grown-ups area: open event and the one local preference it keeps (which format the child plays). The format only orders the
 * progress report and sets the default wording of the coach plan (7v7 simplest → 11v11 full four corners). No name, age or
 * birthday is ever stored.
 */
import type {Format} from '../town/venues';
export const GROWNUPS_OPEN='fi2-open-grownups';
export type GrownUpsOpen={view?:'home'|'plan'};
export const openGrownUps=(detail:GrownUpsOpen={})=>window.dispatchEvent(new CustomEvent(GROWNUPS_OPEN,{detail}));
export const GROWNUPS_FORMAT_KEY='fi2-grownups-format-v1';
const FORMATS:Format[]=['7v7','9v9','11v11','futsal'];
export const sanitizeFormat=(v:unknown):Format|null=>FORMATS.includes(v as Format)?v as Format:null;
type S=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export function loadPlayFormat(storage?:S):Format|null{try{return sanitizeFormat((storage??window.localStorage).getItem(GROWNUPS_FORMAT_KEY));}catch{return null;}}
export function savePlayFormat(format:Format|null,storage?:S){try{const s=storage??window.localStorage;if(format)s.setItem(GROWNUPS_FORMAT_KEY,format);else s.removeItem(GROWNUPS_FORMAT_KEY);}catch{}}
