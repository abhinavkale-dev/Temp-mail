import { cleanupExpiredMailboxes } from './cleanup.js';

const DEFAULT_INTERVAL =
  Number(process.env.CLEANUP_INTERVAL_MS ?? 6 * 60 * 60 * 1000); // 6h
const START_DELAY =
  Number(process.env.CLEANUP_START_DELAY_MS ?? Math.min(DEFAULT_INTERVAL / 2, 5 * 60 * 1000)); // up to 5m
const JITTER_PCT = Number(process.env.CLEANUP_JITTER_PCT ?? 0.10); // ±10%

export class CleanupScheduler {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  start() {
    if (this.running) {
      console.log('[SCHEDULER] Already running');
      return;
    }
    this.running = true;
    console.log(
      `[SCHEDULER] Enabled. interval≈${Math.round(DEFAULT_INTERVAL / 60000)}min, start in ${Math.round(
        START_DELAY / 1000
      )}s`
    );
    this.scheduleNext(START_DELAY);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.running = false;
    console.log('[SCHEDULER] Stopped');
  }

  getStatus() {
    return { isRunning: this.running };
  }

  private scheduleNext(baseMs: number) {
    if (!this.running) return;
    const jitterFactor = 1 + (Math.random() * 2 * JITTER_PCT - JITTER_PCT); 
    const delay = Math.max(60_000, Math.round(baseMs * jitterFactor));
    this.timer = setTimeout(() => this.tick(), delay);
  }

  private async tick() {
    if (!this.running) return;
    try {
      const res = await cleanupExpiredMailboxes();
      const next = res.deleted > 0 ? Math.min(DEFAULT_INTERVAL, 30 * 60 * 1000) : DEFAULT_INTERVAL;
      this.scheduleNext(next);
    } catch {
      this.scheduleNext(DEFAULT_INTERVAL);
    }
  }
}

export const cleanupScheduler = new CleanupScheduler();
