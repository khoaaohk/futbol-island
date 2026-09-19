// Use the same crisp render resolution and shadow detail on mobile and desktop.
export function graphicsQuality() {
  return { pixelRatio: Math.min(window.devicePixelRatio || 1, 2), shadowSize: 2048 };
}
export class FrameBudget {
  private samples = 0;
  private total = 0;
  private cooldown = 240;
  sample(milliseconds: number, pixelRatio: number): number {
    if (this.cooldown-- > 0 || milliseconds > 150) return pixelRatio;
    this.total += milliseconds; this.samples++;
    if (this.samples < 120) return pixelRatio;
    const average = this.total / this.samples;
    this.samples = 0; this.total = 0; this.cooldown = 600;
    return average > 25 ? Math.max(1, pixelRatio - .25) : pixelRatio;
  }
}
