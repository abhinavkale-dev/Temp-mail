import { prisma } from '../lib/prisma.js';

export async function cleanupExpiredMailboxes(): Promise<{ deleted: number }> {
  const now = new Date();
  try {
    const deleted = await prisma.mailbox.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    if (deleted.count > 0) {
      console.log('[CLEANUP] Deleted expired mailboxes', { mailboxes: deleted.count });
    } else {
      console.log('[CLEANUP] Nothing to delete');
    }

    return { deleted: deleted.count };
  } catch (error: any) {
    console.error('[CLEANUP] Error deleting expired mailboxes:', error?.message || error);
    return { deleted: 0 };
  }
}
