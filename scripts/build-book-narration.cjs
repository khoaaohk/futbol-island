/** Export final prose and invoke the same local Coach Bella pipeline as play films. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process'),crypto=require('node:crypto'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,f);
// Usage: node scripts/build-book-narration.cjs [bookId]  (default messi)
const bookId=process.argv[2]||'messi';
const BOOK=bookId==='messi'?require('../lib/books/messi.ts').MESSI_BOOK:Object.values(require(`../lib/books/stories/${bookId}.ts`))[0];
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'book-narration-'));
const python=process.env.KOKORO_PYTHON||'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/bf21bd3b-8bef-46f7-a44a-b2461b53a632/scratchpad/kokoro-venv/bin/python';
try {
 const jobs=BOOK.pages.map(page=>({id:page.id,scriptSha256:crypto.createHash('sha256').update([page.title,page.text,page.lesson].join('\n\n')).digest('hex'),sentences:[page.title,...page.text.split(/(?<=[.!?])\s+/),page.lesson].map(s=>s.trim()).filter(Boolean)}));
 const file=path.join(scratch,'jobs.json');fs.writeFileSync(file,JSON.stringify(jobs));
 execFileSync(python,[path.resolve('scripts/build-book-narration.py'),file,bookId],{stdio:'inherit',env:{...process.env,HF_HUB_OFFLINE:'1'}});
}finally{fs.rmSync(scratch,{recursive:true});}
