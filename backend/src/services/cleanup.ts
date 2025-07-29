import { prisma } from '../lib/prisma.js';

export async function cleanupExpiredMailboxes() {
  try {
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

  } catch (error) {
    console.error('[CLEANUP] Error cleaning up expired mailboxes:', error);
    throw error;
  }
}

export async function getCleanupStats() {
  try {
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

  } catch (error) {
    console.error('[CLEANUP] Error getting cleanup stats:', error);
    throw error;
  }
}
