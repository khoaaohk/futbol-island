export const STORAGE_KEY = 'futbol-island2.progress.v1';
export type Progress = Record<string, { score: number; completedAt: string }>;
export function readProgress(): Progress {
  try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); if (!raw || Array.isArray(raw) || typeof raw !== 'object') return {}; return Object.fromEntries(Object.entries(raw).filter(([, value]) => { const v = value as { score?: unknown; completedAt?: unknown }; return v && typeof v.score === 'number' && Number.isFinite(v.score) && v.score >= 0 && v.score <= 100 && typeof v.completedAt === 'string'; })) as Progress; } catch { return {}; }
}
export function completeLesson(progress: Progress, id: string, score: number): Progress {
  if (progress[id] && progress[id].score >= score) return progress;
  return { ...progress, [id]: { score, completedAt: new Date().toISOString() } };
}
export function saveProgress(progress: Progress) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; } catch { return false; } }
