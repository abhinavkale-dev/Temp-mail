import { prisma } from '../lib/prisma.js';

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.log(`[CLEANUP] Attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1 && (
        error.message?.includes('connection') || 
        error.message?.includes('terminating') ||
        error.code === 'P1001' ||
        error.code === 'P1017'
      )) {
        console.log(`[CLEANUP] Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      throw error;
    }
  }
  throw new Error('All retry attempts failed');
}

export async function cleanupExpiredMailboxes() {
  try {
    return await withRetry(async () => {
      const now = new Date();
      
      const expiredMailboxes = await prisma.mailbox.findMany({
        where: {
          expiresAt: {
            lt: now
          }
        },
        include: {
          messages: true
        }
      });

      if (expiredMailboxes.length === 0) {
        console.log('[CLEANUP] No expired mailboxes found');
        return { deleted: 0, messages: 0 };
      }

      let totalDeletedMessages = 0;
      for (const mailbox of expiredMailboxes) {
        if (mailbox.messages.length > 0) {
          await prisma.message.deleteMany({
            where: {
              mailboxId: mailbox.id
            }
          });
          totalDeletedMessages += mailbox.messages.length;
        }
      }

      const deletedMailboxes = await prisma.mailbox.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });

      console.log('[CLEANUP] Deleted expired data', {
        mailboxes: deletedMailboxes.count,
        messages: totalDeletedMessages,
        timestamp: new Date().toISOString()
      });

      return {
        deleted: deletedMailboxes.count,
        messages: totalDeletedMessages
      };
    });

  } catch (error) {
    console.error('[CLEANUP] Error cleaning up expired mailboxes:', error);
    // Don't throw error to prevent scheduler from crashing
    return { deleted: 0, messages: 0 };
  }
}

export async function getCleanupStats() {
  try {
    return await withRetry(async () => {
      const now = new Date();
      
      const expiredCount = await prisma.mailbox.count({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });

      const totalCount = await prisma.mailbox.count();

      const expiredMessages = await prisma.message.count({
        where: {
          mailbox: {
            expiresAt: {
              lt: now
            }
          }
        }
      });

      return {
        expiredMailboxes: expiredCount,
        totalMailboxes: totalCount,
        expiredMessages: expiredMessages,
        timestamp: now.toISOString()
      };
    });

  } catch (error) {
    console.error('[CLEANUP] Error getting cleanup stats:', error);
    return {
      expiredMailboxes: 0,
      totalMailboxes: 0,
      expiredMessages: 0,
      timestamp: new Date().toISOString()
    };
  }
}
