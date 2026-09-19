import type {CharacterCustomization} from './customization';
import type {TravelMode} from './travelModes';

export type EquipmentCategory='ball'|'scooter'|'bike'|'moped'|'jetpack';
const defaults:Record<EquipmentCategory,readonly [string,string]>={
 ball:['Shoot','Juggle ball'],scooter:['Spin 360','Jump'],bike:['Front wheelie','Back wheelie'],moped:['Stand up','Jump'],jetpack:['Blast forward','Blast up and parachute']
};
export const EQUIPMENT_ACTIONS:Record<string,readonly [string,string]>={
 'scooter:mint':['Smooth carve','Glide hop'],
 'scooter:stunt':['Double spin hop','Spin jump'],
 'scooter:comet':['Comet corkscrew','Star hop'],
 'bike:bmx':['Bunny hop','Nose manual'],
 'bike:road':['Sprint tuck','Slalom'],
 'bike:mountain':['Trail wheel lift','Rock hop'],
 'moped:retro':['Style lean','Parade stand'],
 'moped:delivery':['Double delivery bounce','Cargo balance'],
 'moped:sport':['Power wheelie','Stoppie'],
 'ball:frost':['Ice strike','Ice taps'],
 'ball:solar':['Sunburst shot','Solar flare juggle'],
 'ball:cosmic':['Spiral shot','Orbital juggle'],
 'jetpack:ironman':['Repulsor surge','Repulsor launch'],
 'jetpack:rocketboard':['Forward flip','Vertical corkscrew'],
 'jetpack:mini-plane':['Barrel roll','Loop climb']
};
export function equipmentActions(category:EquipmentCategory,id:string){return EQUIPMENT_ACTIONS[`${category}:${id}`]??defaults[category];}
export function equippedActions(mode:TravelMode,value:CharacterCustomization){const category=mode==='walk'?'ball':mode;return equipmentActions(category,value[category]);}
