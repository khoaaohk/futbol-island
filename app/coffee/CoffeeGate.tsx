'use client';
import type {ReactNode} from 'react';
import ParentGate from '@/components/ParentGate';
/** /coffee's tiers and outside links sit behind the shared grown-up check (G-17), like About → Support (components/DonationLinks.tsx). */
export default function CoffeeGate({children}:{children:ReactNode}){
 return <ParentGate.Guard reason="Donations use real money and open a payment page.">{children}</ParentGate.Guard>;
}
