import type {ReactNode} from 'react';
import {CLUB_LABEL,SPONSOR_TAG} from '@/lib/shop/dripKit';
import styles from './ClubLabel.module.css';

/** "Drip FC club kit" + the small "Sponsor" tag (lib/shop/dripKit.ts). Words only: no link, nothing to tap.
 *  `compact` (QA Nov 14 2026): the narrow preset tiles (Jersey and Boot studios, ~80 px on a phone) stack the words over the tag
 *  in smaller type; the one-line label broke there into one word per line ("Drip / FC / club / kit") or ran past the tile. */
export function ClubTag({className,compact}:{className?:string;compact?:boolean}){
 return <span className={`${styles.label} ${compact?styles.compact:''} ${className??''}`} data-club-tag={compact?'compact':''}><span className={styles.text}>{CLUB_LABEL}</span><span className={styles.tag}>{SPONSOR_TAG}</span></span>;
}
/** The tag with one plain line under a tray of Drip FC stickers. */
export function ClubNote({children}:{children?:ReactNode}){
 return <p className={styles.block}><ClubTag/>{children?<span className={styles.note}>{children}</span>:null}</p>;
}
