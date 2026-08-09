export interface EmailTemplateData {
  userName: string;
  taskTitle: string;
  taskDescription?: string;
  priority: string;
  dueDate: string;
  dueTime?: string;
  taskId: string;
  type: 'ONE_DAY_BEFORE' | 'DUE_TODAY' | 'OVERDUE' | 'LOGIN';
  appDomain?: string;
}

export function generateTaskReminderEmailHtml(data: EmailTemplateData): { subject: string; html: string } {
  const domain = data.appDomain || 'https://taskflow.app';
  const taskUrl = `${domain}/?task=${data.taskId}`;

  let subject = '';
  let badgeColor = '#4f46e5';
  let badgeText = '';
  let headline = '';
  let subheadline = '';

  switch (data.type) {
    case 'ONE_DAY_BEFORE':
      subject = `Reminder: "${data.taskTitle}" is due tomorrow`;
      badgeColor = '#4f46e5'; // Indigo
      badgeText = 'DUE TOMORROW';
      headline = 'Task Due Tomorrow';
      subheadline = `Hi ${data.userName}, your task is scheduled for completion tomorrow. Stay focused and get it done!`;
      break;

    case 'DUE_TODAY':
      subject = `Due today: "${data.taskTitle}"`;
      badgeColor = '#f59e0b'; // Amber
      badgeText = 'DUE TODAY';
      headline = 'Task Due Today';
      subheadline = `Hi ${data.userName}, your task is due today. Make sure to complete and check it off!`;
      break;

    case 'OVERDUE':
      subject = `Overdue task: "${data.taskTitle}"`;
      badgeColor = '#ef4444'; // Red
      badgeText = 'OVERDUE';
      headline = 'Task is Overdue';
      subheadline = `Hi ${data.userName}, this task has passed its due date. Please review and update it when ready.`;
      break;

    case 'LOGIN':
      subject = `New login detected — TaskFlow`;
      badgeColor = '#10b981'; // Emerald
      badgeText = 'SECURITY ALERT';
      headline = 'New Login Detected';
      subheadline = `Hi ${data.userName}, a new login session was established on your TaskFlow account.`;
      break;
  }

  if (data.type === 'LOGIN') {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; border:1px solid #e4e4e7; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background-color:#ffffff; border-bottom:1px solid #f4f4f5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:20px; font-weight:800; color:#4f46e5; letter-spacing:-0.5px;">TaskFlow</span>
                  </td>
                  <td align="right">
                    <span style="font-size:10px; font-weight:700; color:${badgeColor}; background-color:#f0fdf4; padding: 4px 10px; border-radius:100px; text-transform:uppercase;">${badgeText}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px 0; font-size:22px; font-weight:700; color:#09090b; letter-spacing:-0.3px;">${headline}</h1>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#71717a;">${subheadline}</p>

              <div style="background-color:#fafafa; border:1px solid #e4e4e7; border-radius:12px; padding:20px; margin-bottom:28px;">
                <p style="margin:0 0 8px 0; font-size:13px; font-weight:600; color:#27272a;">Account Activity Summary</p>
                <p style="margin:0; font-size:12px; color:#71717a; line-height:1.5;">
                  • <strong>Account Email:</strong> ${data.userName}<br>
                  • <strong>Time:</strong> ${data.dueDate}<br>
                  • <strong>Timezone:</strong> Asia/Kolkata (IST)
                </p>
              </div>

              <a href="${domain}" style="display:inline-block; width:100%; box-sizing:border-box; background-color:#4f46e5; color:#ffffff; font-size:14px; font-weight:600; text-align:center; padding:14px 20px; border-radius:10px; text-decoration:none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">Go to Dashboard</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#fafafa; border-top:1px solid #f4f4f5; text-align:center;">
              <p style="margin:0; font-size:12px; color:#a1a1aa;">This is an automated security notice from TaskFlow. If this was not you, please secure your account immediately.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return { subject, html };
  }

  const priorityColor =
    data.priority === 'HIGH' ? '#ef4444' : data.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; border:1px solid #e4e4e7; overflow:hidden; box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px 32px; background-color:#ffffff; border-bottom:1px solid #f4f4f5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:20px; font-weight:800; color:#4f46e5; letter-spacing:-0.5px;">TaskFlow</span>
                  </td>
                  <td align="right">
                    <span style="font-size:10px; font-weight:700; color:${badgeColor}; background-color:#f4f4f5; padding: 5px 12px; border-radius:100px; text-transform:uppercase; letter-spacing:0.5px;">${badgeText}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; font-weight:700; color:#09090b; letter-spacing:-0.3px;">${headline}</h1>
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#71717a;">${subheadline}</p>

              <!-- Task Card in Email -->
              <div style="background-color:#ffffff; border:1.5px solid #e4e4e7; border-radius:14px; padding:22px; margin-bottom:28px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="margin-bottom:12px;">
                  <span style="display:inline-block; font-size:10px; font-weight:700; color:${priorityColor}; border:1px solid ${priorityColor}40; background-color:${priorityColor}10; padding:3px 8px; border-radius:6px; text-transform:uppercase;">
                    ${data.priority} PRIORITY
                  </span>
                </div>
                
                <h2 style="margin:0 0 8px 0; font-size:17px; font-weight:700; color:#18181b; line-height:1.4;">${data.taskTitle}</h2>
                
                ${
                  data.taskDescription
                    ? `<p style="margin:0 0 16px 0; font-size:13px; color:#52525b; line-height:1.5;">${data.taskDescription}</p>`
                    : ''
                }

                <div style="padding-top:14px; border-top:1px solid #f4f4f5; font-size:13px; color:#71717a;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="font-weight:600; color:#27272a;">📅 Due Date:</td>
                      <td align="right" style="font-weight:700; color:#09090b;">${data.dueDate}</td>
                    </tr>
                    ${
                      data.dueTime
                        ? `<tr><td style="font-weight:600; color:#27272a; padding-top:4px;">⏰ Time:</td><td align="right" style="font-weight:700; color:#09090b; padding-top:4px;">${data.dueTime}</td></tr>`
                        : ''
                    }
                  </table>
                </div>
              </div>

              <!-- Button -->
              <a href="${taskUrl}" style="display:block; width:100%; box-sizing:border-box; background-color:#4f46e5; color:#ffffff; font-size:14px; font-weight:600; text-align:center; padding:14px 20px; border-radius:10px; text-decoration:none; box-shadow:0 4px 14px rgba(79, 70, 229, 0.3);">View Task in TaskFlow</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#fafafa; border-top:1px solid #f4f4f5; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; font-weight:600; color:#52525b;">Stay focused and get it done!</p>
              <p style="margin:0; font-size:11px; color:#a1a1aa;">You are receiving this email based on your TaskFlow email notification preferences.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}
