import { Resend } from 'resend';
import { EmailTemplateData, generateTaskReminderEmailHtml } from './templates/task-reminder.template.js';

class EmailService {
  private resendClient: Resend | null = null;
  private fromEmail = process.env.EMAIL_FROM || 'TaskFlow Reminders <onboarding@resend.dev>';

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resendClient = new Resend(process.env.RESEND_API_KEY);
      console.log('✓ EmailService initialized with Resend API Key');
    } else {
      console.log('ℹ EmailService initialized in Dev/Log Mode (Set RESEND_API_KEY to send real emails)');
    }
  }

  async sendTaskReminderEmail(toEmail: string, data: EmailTemplateData): Promise<boolean> {
    const { subject, html } = generateTaskReminderEmailHtml(data);
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (this.resendClient) {
          const res = await this.resendClient.emails.send({
            from: this.fromEmail,
            to: [toEmail],
            subject,
            html,
          });

          if (res.error) {
            throw new Error(`Resend API Error: ${res.error.message}`);
          }

          console.log(`[EmailService] Email successfully sent to ${toEmail} | Subject: "${subject}" | ID: ${res.data?.id}`);
          return true;
        } else {
          // Dev / Fallback log mode (counts as successful delivery for local demo/testing)
          console.log(`================================================================`);
          console.log(`📧 [EMAIL SENT SIMULATION - Attempt ${attempt}]`);
          console.log(`TO: ${toEmail}`);
          console.log(`SUBJECT: ${subject}`);
          console.log(`TASK: "${data.taskTitle}" (Priority: ${data.priority}, Due: ${data.dueDate})`);
          console.log(`TYPE: ${data.type}`);
          console.log(`================================================================`);
          return true;
        }
      } catch (err: any) {
        console.error(`[EmailService] Attempt ${attempt}/${maxRetries} failed to send email to ${toEmail}: ${err.message}`);
        if (attempt < maxRetries) {
          // Exponential backoff delay (500ms, 1000ms)
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        }
      }
    }

    console.error(`❌ [EmailService] All ${maxRetries} attempts failed to deliver email to ${toEmail}`);
    return false;
  }
}

export const emailService = new EmailService();
