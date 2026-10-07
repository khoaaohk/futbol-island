'use client';
/**
 * Regions by country (Oct 8 2026, user: "go more granular and go by states, province of that country"): pick a country
 * (defaults to the top one) and see ALL its states/provinces with full names (report.regionNames, ISO 3166-2 via
 * lib/analytics/regions.ts on the server; the code when a name is missing). Region level only: no city, no coordinates.
 */
import {useId,useState} from 'react';
import {regionCountries,regionsOf,type Report} from '@/lib/analytics/core';
import {BarList,ChartCard,fmtInt} from './charts';
import styles from './admin.module.css';

export default function RegionCard({report,empty,countryName}:{report:Report;empty:boolean;countryName:(code:string)=>string}){
 const rows=report.dims.region,countries=regionCountries(rows),id=useId();
 const [picked,setPicked]=useState<string|null>(null);
 const country=picked&&countries.some(c=>c.country===picked)?picked:countries[0]?.country??'';
 const regions=regionsOf(rows,country,report.regionNames);
 return <ChartCard title="States and provinces" subtitle={country?`Visitors by region in ${countryName(country)}`:'Visitors by region'} empty={empty||!countries.length}
  table={{columns:['Region','Code','Visitors','Sessions','Page views'],rows:regions.map(r=>[r.name,r.code,r.visitors,r.sessions,r.pageviews])}}>
  <label className={styles.picker} htmlFor={id}>Country
   <select id={id} value={country} onChange={e=>setPicked(e.target.value)}>
    {countries.map(c=><option key={c.country} value={c.country}>{countryName(c.country)} · {fmtInt(c.visitors)} visitors</option>)}
   </select>
  </label>
  <BarList rows={regions.map(r=>({key:r.key,label:r.name,value:r.visitors,detail:r.code}))} unit="visitors" limit={Math.max(10,regions.length)}/>
 </ChartCard>;
}
