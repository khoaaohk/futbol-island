// The stadium's broadcast camera as a second view of the matches (Nov 13 2026): while the big screen's back-face feed is live and
// in view (stadiumFeed.ts), it publishes its camera frustum here, and fieldRuntime draws (and poses) the players and the field that
// this frustum sees as well as the ones the main camera sees, so the feed is not an empty pitch when the main camera looks
// elsewhere. null whenever the feed is not rendering. A tiny shared slot, no imports beyond the type.
import type {Frustum} from 'three';
export const broadcastView:{frustum:Frustum|null}={frustum:null};
