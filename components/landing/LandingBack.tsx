'use client';
import {BackButton} from '../BackButton';
import styles from './Title.module.css';

/** The title screen's Back: the game's own Back button (label folds into the arrow, then it navigates) to the feature tour. */
export default function LandingBack(){
 return <BackButton className={styles.backLink} data-enter="eyebrow" onBack={()=>{window.location.assign('/learn');}}/>;
}
