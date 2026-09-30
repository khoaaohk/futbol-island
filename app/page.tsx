import Town from '@/components/Town';
import DevUnlock from '@/components/DevUnlock';
export default function Page({searchParams}:{searchParams?:{from?:string|string[];store?:string|string[]}}) { return <><Town returningFromArcade={searchParams?.from==='arcade'||searchParams?.from==='konbini'} openArcadePacks={searchParams?.store==='packs'}/><DevUnlock/></>; }
