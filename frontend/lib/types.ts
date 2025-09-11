export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  createdAt: string;
}

export interface MessageDetail {
  id: string;
  from: string;
  subject: string;
  body: string;
  mailbox: string;
  createdAt: string;
  parsedData?: {
    subject?: string;
    from?: string;
    date?: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename?: string;
      contentType?: string;
      size?: number;
    }>;
  };
}
