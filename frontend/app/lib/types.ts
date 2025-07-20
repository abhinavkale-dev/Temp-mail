export interface Message {
  id: string;
  from: string;
  subject: string | null;
  createdAt: string;
}

export interface MessageDetail extends Message {
  body: string;
  mailbox: string;
}

export interface MailboxResponse {
  address: string;
  messageCount: number;
  messages: Message[];
} 