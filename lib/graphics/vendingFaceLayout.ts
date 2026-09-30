/**
 * Vending machine face layout: the ONE description of where things sit on the machine front (docs/vending-visuals-HANDOFF.md).
 *
 * Both renderers read it, so the machine you walk past and the machine you use are the same object:
 * - lib/graphics/vendingMachines.ts paints the 3D front (atlas panels) from these rects;
 * - components/VendingFace.tsx pins the interactive HTML face onto the same rects (hit areas = `slots`, `coin`, `tray`, …).
 *
 * All rects are fractions of the face (VENDING_FACE in vendingMachines.ts: the front including the top category panel), x from the left,
 * y from the TOP. A new face design only needs new rects here (and matching art); the controller (VendingMachine.tsx) never
 * reads pixel positions. Pure data: no three.js, no React, safe to import anywhere.
 */
export type FaceRect={x:number;y:number;w:number;h:number};
/** Face size in machine-local metres before VENDING_SCALE (must match VENDING_FACE). */
export const FACE_SIZE={w:1.26,h:1.83} as const;

const COLS=3,ROWS=2;
const GRID={x:.045,y:.11,w:.91,h:.595,gapX:.015,gapY:.012};
const slotRect=(i:number):FaceRect=>{const c=i%COLS,r=Math.floor(i/COLS),w=(GRID.w-GRID.gapX*(COLS-1))/COLS,h=(GRID.h-GRID.gapY*(ROWS-1))/ROWS;
 return {x:GRID.x+c*(w+GRID.gapX),y:GRID.y+r*(h+GRID.gapY),w,h};};

export const VENDING_FACE_LAYOUT={
 /** Glass product window (outer edge of its dark frame). */
 glass:{x:.02,y:.015,w:.96,h:.72},
 /** Category header in the former sign area: previous page, row label (tap = next row), next page. ≥44px tall and wide at 844×390. */
 prev:{x:.035,y:.016,w:.20,h:.08},
 label:{x:.245,y:.016,w:.51,h:.08},
 next:{x:.765,y:.016,w:.20,h:.08},
 /** Product slots, reading order. Each is one hit area: item window, name, and its lit push button (price) underneath. */
 slots:Array.from({length:COLS*ROWS},(_,i)=>slotRect(i)),
 cols:COLS,rows:ROWS,
 /** Inside a slot (fractions of the slot height, from the top): the push button's band. */
 slotPush:{y:.86,h:.12},
 /** LED display (price / confirm / friendly messages). */
 led:{x:.02,y:.733,w:.72,h:.105},
 /** Coin panel: balance digits, coin slot mouth (a second way to buy), label. */
 coin:{x:.76,y:.733,w:.22,h:.105},
 /** Pickup tray (tap to take). */
 tray:{x:.02,y:.855,w:.96,h:.13},
 /** Sticker beside the tray: machines found, "No real money". */
 sticker:{x:.68,y:.855,w:.3,h:.13},
 /** Where the reward moment and the club story appear (over the glass and LED strip). */
 overlay:{x:.02,y:.015,w:.96,h:.823},
} as const;
export type VendingFaceLayout=typeof VENDING_FACE_LAYOUT;
/**
 * Real depth behind the glass (user, Sep 30 2026: "the perspective of the shelves and books doesn't match that of the machines").
 * Machine-local metres (before VENDING_SCALE) and fractions: the zoomed machine's 3D bay (lib/graphics/vendingMachines.ts) and the
 * in-use HTML face (CSS 3D, components/VendingFace.tsx) share these, so products, shelves and tap areas line up.
 *   depth:   how far the back wall sits behind the glass;
 *   product: how far behind the glass the products stand on the shelf slabs;
 *   shelf:   the shelf line inside a slot (fraction of the slot height from its top): products above, the price rail below.
 */
export const VENDING_BAY={depth:.34,product:.15,shelf:.53,
 /** The in-use HTML face's plane stands this far in front of the cabinet front (VENDING_FACE.z). */
 proud:.02} as const;
export const VENDING_SLOTS_PER_PAGE=COLS*ROWS;

/**
 * Animation timings (ms) shared by the controller's state machine and the visuals: the controller advances phases on these,
 * the CSS/3D animations are tuned to them. Reduced motion: every step is immediate.
 *   coins:  coin i lands (clink) at coinAt(i); buying resolves no earlier than coinsDone(n)
 *   drop:   the item falls into the tray; thunk + phase 'tray' after `drop`
 */
export const VENDING_TIMING={coinStart:120,coinGap:170,coinFall:340,drop:620,pop:380,faceFade:180,
 coinAt:(i:number)=>120+i*170,coinsDone:(n:number)=>120+n*170+200} as const;
