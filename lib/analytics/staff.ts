/**
 * Staff devices (Nov 13 2026; owner: "keep my own devices out of all analytics"). A durable flag in this device's localStorage:
 * '1' = staff (the analytics tracker sends nothing at all: components/VisitTracker.tsx passes it to lib/analytics/tracker.ts
 * skipReason), '0' = the owner said "not mine" on /admin (kept, so opening /admin again does not flip it back), absent = a player.
 * Opening /admin flags the device (markStaffOnAdminLoad, app/admin/StaffDevice.tsx). Analytics only: the game's own save system
 * (lib/saves/*) never reads it. Client-safe, no imports. Every storage access is guarded (private mode, blocked storage).
 */
export const STAFF_KEY='fi-staff';
type Get=Pick<Storage,'getItem'>|null|undefined;type GetSet=Pick<Storage,'getItem'|'setItem'>|null|undefined;

/** True only when this device is flagged as staff. */
export function isStaffDevice(ls:Get):boolean{try{return ls?.getItem(STAFF_KEY)==='1';}catch{return false;}}
/** The owner's explicit choice on /admin. */
export function setStaffDevice(ls:GetSet,on:boolean):void{try{ls?.setItem(STAFF_KEY,on?'1':'0');}catch{}}
/** /admin loaded on this device: flag it, unless the owner already said it is not theirs. Returns the flag. */
export function markStaffOnAdminLoad(ls:GetSet):boolean{
 try{if(ls?.getItem(STAFF_KEY)===null)ls.setItem(STAFF_KEY,'1');}catch{}
 return isStaffDevice(ls);
}
