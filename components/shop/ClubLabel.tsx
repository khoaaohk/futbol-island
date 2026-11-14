import type {ReactNode} from 'react';
import {CLUB_LABEL,SPONSOR_TAG} from '@/lib/shop/dripKit';
import styles from './ClubLabel.module.css';

/** "Drip FC club kit" + the small "Sponsor" tag (lib/shop/dripKit.ts). Words only: no link, nothing to tap. */
export function ClubTag({className}:{className?:string}){
 return <span className={`${styles.label} ${className??''}`}>{CLUB_LABEL}<span className={styles.tag}>{SPONSOR_TAG}</span></span>;
}
/** The tag with one plain line under a tray of Drip FC stickers. */
export function ClubNote({children}:{children?:ReactNode}){
 return <p className={styles.block}><ClubTag/>{children?<span className={styles.note}>{children}</span>:null}</p>;
}
