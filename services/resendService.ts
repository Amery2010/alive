import { ResendEmailPayload } from '../types';

const RESEND_API_URL = 'https://api.resend.com/emails';

export const scheduleEmergencyEmail = async (
  apiKey: string,
  toEmail: string,
  userName: string,
  checkInTime: number
): Promise<string> => {
  if (!apiKey || !toEmail || !userName) {
    throw new Error('Missing configuration');
  }

  // Calculate 48 hours from now
  const scheduledDate = new Date(checkInTime + 48 * 60 * 60 * 1000);
  const scheduledAtISO = scheduledDate.toISOString();

  const payload: ResendEmailPayload = {
    from: 'onboarding@resend.dev', // Default testing sender, user can verify domain in production
    to: toEmail,
    subject: `来自 ${userName} 的紧急求助`,
    html: `<p>我是${userName}，我已经连续多天没有活动了，请来看望一下我。</p>`,
    scheduled_at: scheduledAtISO,
  };

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to schedule email');
  }

  const data = await response.json();
  return data.id; // Return the Email ID to store locally
};

export const cancelScheduledEmail = async (apiKey: string, emailId: string): Promise<boolean> => {
  if (!apiKey || !emailId) return false;

  try {
    const response = await fetch(`${RESEND_API_URL}/${emailId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Even if it fails (e.g. already sent), we want the flow to continue
    return response.ok;
  } catch (error) {
    console.error("Error canceling previous email:", error);
    return false;
  }
};