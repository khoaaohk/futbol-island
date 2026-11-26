'use client';
import {BackButton} from '../BackButton';
import styles from './Title.module.css';

/** The title screen's Back: the game's own Back button (label folds into the arrow, then it navigates) to the feature tour, the home page `/` (Nov 3 2026).
 *  Nov 25 2026: its taps are counted (st:back, a tap total) so the admin can tell "left for the tour" from "closed the tab". */
export default function LandingBack(){
 return <BackButton className={styles.backLink} data-enter="eyebrow" data-track="st:back" onBack={()=>{window.location.assign('/');}}/>;
}
