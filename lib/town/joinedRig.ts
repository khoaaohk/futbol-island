import {wearBeanCostume} from '../graphics/beanCostumes';
import {profileFor,type PlayerRig} from '../graphics/player';
import type {BeanDress} from './beanLooks';
/**
 * The joined human's slot rig in a live match (owner, Nov 4 2026): it must look exactly like the walking avatar except the
 * shirt (the team bib). `dress` comes from beanLooks.ownKitLook (every BeanLook field, the own outfit with the bib shirt,
 * the costume id); this puts the costume onesie on with the bib bands kept (wearBeanCostume kit mode) and gives the rig the
 * walking avatar's own 'you' body profile, locked so the match's per-role profile pass (assignRigProfile) leaves it alone.
 */
export function dressJoinedRig(rig:PlayerRig,dress:BeanDress){
 rig.setBeanLook(dress.look,dress.outfit);wearBeanCostume(rig,dress.costume,true);
 if(rig.root.userData.profileRole!=='you'){rig.setProfile(profileFor('you',0));rig.root.userData.profileRole='you';}
 rig.root.userData.profileLocked=true;
}
/** Back to an NPC: costume off, profile unlocked (the match pass reassigns the role profile on its next frame). */
export function undressJoinedRig(rig:PlayerRig){
 wearBeanCostume(rig,null,false);rig.root.userData.profileLocked=false;rig.root.userData.profileRole=undefined;
}
