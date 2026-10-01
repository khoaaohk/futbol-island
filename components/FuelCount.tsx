'use client';
/**
 * The fuel counter in the island coins bar (docs/economy/FUEL_2026-09-30.md), beside coins / fish / fruit. It is a span inside
 * the wallet button (one button opens the island pocket, whose Fuel section explains fuel and has the Eat buttons), and takes the
 * pill's own counter class from IslandJobs so it looks like the fish and fruit counters. Full / ok / low / empty show by colour,
 * by icon (a full or a hollow bolt) and by text ("Low", "Empty"), never colour alone. Re-renders only when the number changes.
 */
import {useFuel} from '@/lib/town/fuelStore';
import {FUEL_MAX} from '@/lib/town/fuel';
import styles from './FuelCount.module.css';

export function FuelIcon({size=18,empty=false}:{size?:number;empty?:boolean}){
 // A pixel-edged lightning bolt: football's "energy". Hollow when the tank is empty.
 return <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" shapeRendering="crispEdges"><path d="M9 1 3 9h4l-1 6 7-9H9l1-5Z" fill={empty?'none':'#f2b632'} stroke="#7a4e12" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
}
export default function FuelCount({className}:{className?:string}){
 const {fuel,level}=useFuel(),word=level==='empty'?'Empty':level==='low'?'Low':'';
 return <em className={`${className??''} ${styles.fuel}`} data-fuel={fuel} data-fuel-level={level} aria-label={`Fuel ${fuel} of ${FUEL_MAX}${word?`, ${word.toLowerCase()}`:''}`} title="Fuel: tap to see how to refuel">
  <FuelIcon empty={level==='empty'}/><span>{fuel}</span>{word&&<small className={styles.word}>{word}</small>}
 </em>;
}
