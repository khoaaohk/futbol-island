// Media host switch (Oct 7 2026): audio and artwork can be served from an external bucket/CDN (Cloudflare R2) instead of
// Vercel. Set NEXT_PUBLIC_MEDIA_BASE (e.g. "https://media.example.com", no trailing slash) to turn it on; unset, every path
// stays on the app's own origin exactly as before. Only root-relative media paths ("/voice/...") are rewritten.
export const MEDIA_BASE=(process.env.NEXT_PUBLIC_MEDIA_BASE||'').replace(/\/+$/,'');
export function mediaUrl(path:string):string{
 if(!MEDIA_BASE||!path||path[0]!=='/'||path.startsWith('//'))return path;
 return MEDIA_BASE+path;
}
