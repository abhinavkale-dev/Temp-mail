-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_mailboxId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "Mailbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
