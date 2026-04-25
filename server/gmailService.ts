import { google } from "googleapis";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { emails, emailLogs } from "../drizzle/schema";

const gmail = google.gmail("v1");

export interface SendEmailParams {
  userId: number;
  emailId: number;
  toEmail: string;
  subject: string;
  body: string;
  accessToken: string;
}

/**
 * Send an email via Gmail API using OAuth token
 */
export async function sendEmailViaGmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const { toEmail, subject, body, accessToken } = params;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    // Create email message
    const message = createEmailMessage({
      to: toEmail,
      subject,
      body,
    });

    // Send email
    const result = await gmail.users.messages.send(
      {
        userId: "me",
        requestBody: {
          raw: message,
        },
      },
      { auth: oauth2Client } as any
    );

    // Log successful send
    const db = await getDb();
    if (db) {
      await db.insert(emailLogs).values({
        emailId: params.emailId,
        deliveryStatus: "success",
        sentAt: new Date(),
      });

      // Update email status
      await db
        .update(emails)
        .set({
          status: "sent",
          sentAt: new Date(),
        })
        .where(eq(emails.id, params.emailId));
    }

    return {
      success: true,
      messageId: (result as any).data?.id || "sent",
    };
  } catch (error: any) {
    console.error("[Gmail] Send error:", error);

    // Log failed send
    const db = await getDb();
    if (db) {
      await db.insert(emailLogs).values({
        emailId: params.emailId,
        deliveryStatus: "failed",
        errorMessage: error.message || "Unknown error",
        sentAt: new Date(),
      });
    }

    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Create RFC 2822 formatted email message
 */
function createEmailMessage(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const { to, subject, body } = params;

  const message = [
    `To: ${to}`,
    "From: noreply@lateescalate.com",
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    body,
  ].join("\r\n");

  // Convert to base64url
  return Buffer.from(message).toString("base64url");
}

/**
 * Refresh Gmail access token using refresh token
 */
export async function refreshGmailToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.access_token || null;
  } catch (error) {
    console.error("[Gmail] Token refresh error:", error);
    return null;
  }
}

/**
 * Get Gmail authorization URL
 */
export function getGmailAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeGmailCode(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    const { tokens } = await oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || "",
    };
  } catch (error) {
    console.error("[Gmail] Code exchange error:", error);
    return null;
  }
}
