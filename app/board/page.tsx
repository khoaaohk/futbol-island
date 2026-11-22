import BoardApp from '@/components/coaches-board/BoardApp';
/** /board: one static page; the board is a client component (plays stay on the device). */
export const dynamic='force-static';
export default function BoardPage(){return <BoardApp/>;}
