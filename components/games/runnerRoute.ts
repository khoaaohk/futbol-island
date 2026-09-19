export const BLOCK_LENGTH = 28;
export const BLOCKS_PER_DISTRICT = 4;
export const ROUTE_BLOCKS = 12;
export const DISTRICT_LENGTH = BLOCK_LENGTH * BLOCKS_PER_DISTRICT;
export const ROUTE_LENGTH = BLOCK_LENGTH * ROUTE_BLOCKS;
export const DISTRICTS = [
  { name: "THE BOARDWALK", subtitle: "Find your rhythm", kind: 2 },
  { name: "OLD TOWN", subtitle: "Through the football district", kind: 1 },
  { name: "CLUB GROUNDS", subtitle: "Play for the crowd", kind: 0 },
] as const;

export function districtAt(distance: number) {
  return DISTRICTS[Math.floor(Math.max(0, distance) / DISTRICT_LENGTH) % DISTRICTS.length];
}

/** Only blocks inside the visible corridor need rendering or shadow draws. */
export function visibleBlock(z: number) { return z >= -30 && z <= 100; }
