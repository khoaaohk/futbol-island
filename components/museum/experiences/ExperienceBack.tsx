'use client';
import {NavigationButton} from '@/components/DoneButton';
import styles from './ExperienceBack.module.css';
/**
 * The one Back button every museum experience uses (Oct 5 2026, user: "make sure all the step inside back btns are in the same
 * position"). Fixed to the same top-left spot as the World Cup ball gallery's and the museum hall's Back: 20 px / 24 px from the
 * safe-area corner, 16 px / 16 px on phones. It plays the shared shrink-to-icon press animation (never `immediate`).
 */
export default function ExperienceBack({onClose}:{onClose:()=>void}){
 return <div className={styles.slot}><NavigationButton back label="Back" data-experience-back onNavigate={onClose}/></div>;
}
