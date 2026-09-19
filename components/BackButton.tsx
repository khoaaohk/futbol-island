'use client';
import {forwardRef,type ComponentPropsWithoutRef} from 'react';
import {NavigationButton} from './DoneButton';
type Props=Omit<ComponentPropsWithoutRef<typeof NavigationButton>,'onNavigate'|'back'> & {onBack:()=>void};
export const BackButton=forwardRef<HTMLButtonElement,Props>(function BackButton({onBack,...props},ref){return <NavigationButton {...props} ref={ref} back onNavigate={onBack}/>;});
