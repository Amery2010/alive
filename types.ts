export interface UserSettings {
  name: string;
  email: string;
  resendApiKey: string;
}

export interface CheckInState {
  lastCheckIn: number | null; // Timestamp
  scheduledEmailId: string | null; // Resend Email ID
}

export interface ResendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  scheduled_at?: string; // ISO 8601
}
