'use client';
import {useEffect} from 'react';
import {startWelcomeTally} from '@/lib/welcome/tallyLive';
/** The on-device interest tally for the Welcome back note (lib/welcome/tallyLive.ts). Renders nothing; never sends anything. */
export default function WelcomeTally(){useEffect(()=>startWelcomeTally(),[]);return null;}
