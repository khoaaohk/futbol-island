export type TravelMode = 'walk' | 'scooter' | 'bike' | 'moped' | 'jetpack';
/** World metres per second; riding modes do not receive the walking sprint multiplier. */
export const TRAVEL_MODES: Record<TravelMode, { label: string; maxSpeed: number; acceleration: number; braking: number }> = {
  walk: { label: 'Walk', maxSpeed: 3.7, acceleration: 9, braking: 12 },
  scooter: { label: 'Scooter', maxSpeed: 14, acceleration: 8, braking: 12 },
  bike: { label: 'Bike', maxSpeed: 20, acceleration: 7, braking: 12 },
  moped: { label: 'Moped', maxSpeed: 28, acceleration: 6, braking: 12 },
  jetpack: { label: 'Jetpack', maxSpeed: 34, acceleration: 5, braking: 8 },
};
