import { cleanupExpiredMailboxes, getCleanupStats } from './cleanup.js';

export class CleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.start();
  }

  start() {
    if (this.isRunning) {
      console.log('[SCHEDULER] Cleanup scheduler is already running');
      return;
    }

    const CLEANUP_INTERVAL = 60 * 60 * 1000; 
    
    console.log('[SCHEDULER] Starting cleanup scheduler (runs every hour)');
    
    this.runCleanup();
    
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, CLEANUP_INTERVAL);
    
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[SCHEDULER] Cleanup scheduler stopped');
  }

  private async runCleanup() {
    try {
      console.log('[SCHEDULER] Running scheduled cleanup...');
      
      const statsBefore = await getCleanupStats();
      
      if (statsBefore.expiredMailboxes === 0) {
        console.log('[SCHEDULER] No expired mailboxes to clean up');
        return;
      }
      
      const result = await cleanupExpiredMailboxes();
      
      console.log('[SCHEDULER] Cleanup completed', {
        deletedMailboxes: result.deleted,
        deletedMessages: result.messages,
        expiredMailboxesFound: statsBefore.expiredMailboxes,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('[SCHEDULER] Error during scheduled cleanup:', error);
    }
  }

  async triggerCleanup() {
    console.log('[SCHEDULER] Manual cleanup triggered');
    await this.runCleanup();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCleanup: this.intervalId ? 'Every hour' : 'Not scheduled'
    };
  }
}

export const cleanupScheduler = new CleanupScheduler();
