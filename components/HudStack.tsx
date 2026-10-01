'use client';
/**
 * The island HUD stack (docs/ui/HUD_STACK.md): one flex column hanging under the coins bar. Town renders the column and provides
 * it here; HUD pieces that live in other components (the job panel, toasts, the ball-hunt hint, Spot it, welcome-back) portal
 * into it with <HudSlot>. The slot order is CSS `order` on data-hud-slot (globals.css), so nothing measures or repositions
 * anything per frame. Outside the island (no provider) a slot renders in place, as before.
 */
import {createContext,useContext,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
export const HudStackContext=createContext<HTMLElement|null>(null);
export default function HudSlot({children}:{children:ReactNode}){
 const host=useContext(HudStackContext);
 return host?createPortal(children,host):<>{children}</>;
}
