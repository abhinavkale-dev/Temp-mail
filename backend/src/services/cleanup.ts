import { prisma } from '../lib/prisma.js';

export async function cleanupExpiredMailboxes(): Promise<{ deleted: number }> {
  const now = new Date();
  try {
    const deletedMessages = await prisma.message.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    const deletedMailboxes = await prisma.mailbox.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    if (deletedMessages.count > 0 || deletedMailboxes.count > 0) {
      console.log('[CLEANUP] Deleted expired items', {
        messages: deletedMessages.count,
        mailboxes: deletedMailboxes.count
      });
    } else {
      console.log('[CLEANUP] Nothing to delete');
    }

    return { deleted: deletedMailboxes.count + deletedMessages.count };
  } catch (error: any) {
    console.error('[CLEANUP] Error deleting expired items:', error?.message || error);
    return { deleted: 0 };
  }
}
