'use client';
import type {ButtonHTMLAttributes,ReactNode} from 'react';
import styles from './StudioControls.module.css';

/**
 * Shared stage controls for the Kit Shop studios (Boot, Jersey, Ball) — see StudioControls.module.css for the layout
 * contract (one fixed position, size and order per piece, shared by all three so they can't drift apart again). Each studio
 * keeps its own icons, labels, handlers and step-conditional rendering; these components only supply shared chrome.
 */

/** The top-right history + tools cluster. Stops a drag on the stage from starting under a tap on a button. */
export function StudioIconRow({children}:{children:ReactNode}){
 return <div className={styles.iconRow} onPointerDown={e=>e.stopPropagation()}>{children}</div>;
}

type IconBtnProps={label:string;pressed?:boolean;disabled?:boolean;onClick?():void;children:ReactNode}
 &Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'|'disabled'|'children'|'aria-label'|'aria-pressed'|'type'>;
/** One 44px round icon button in the shared gold face (pink when it's a pressed toggle, e.g. Pair or Help). */
export function StudioIconButton({label,pressed,disabled,onClick,children,className,...rest}:IconBtnProps){
 return <button type="button" className={className?`${styles.icon} ${className}`:styles.icon} aria-label={label} title={label}
  aria-pressed={pressed} disabled={disabled} onClick={onClick} {...rest}>{children}</button>;
}

/** The bottom-centre view/angle chip row (Boot's Hero…Sole, Jersey's Front…Back). Wraps rather than clipping or scrolling. */
export function StudioViewChips({children,label='Turn the view'}:{children:ReactNode;label?:string}){
 return <div className={styles.viewChips} role="group" aria-label={label}>{children}</div>;
}

/** The top-centre two-segment mode pill (On shirt/Flat, Paint/Spin). */
export function StudioModeToggle({children,label}:{children:ReactNode;label:string}){
 return <div className={styles.modeToggle} role="group" aria-label={label}>{children}</div>;
}
