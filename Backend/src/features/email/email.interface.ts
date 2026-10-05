export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  id?: string;
  success: boolean;
  error?: string;
}
