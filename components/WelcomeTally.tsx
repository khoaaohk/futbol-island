'use client';
import {useEffect} from 'react';
import {startWelcomeTally} from '@/lib/welcome/tallyLive';
import {inEmbed} from '@/lib/embed/isEmbed';
/** The on-device interest tally for the Welcome back note (lib/welcome/tallyLive.ts). Renders nothing; never sends anything. */
export default function WelcomeTally(){useEffect(()=>inEmbed()?undefined:startWelcomeTally(),[]);return null;}
