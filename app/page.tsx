import Town from '@/components/Town';
export default function Page({searchParams}:{searchParams?:{from?:string|string[];store?:string|string[]}}) { return <Town returningFromArcade={searchParams?.from==='arcade'} openArcadePacks={searchParams?.store==='packs'}/>; }
