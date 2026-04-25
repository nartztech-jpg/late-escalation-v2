import express, { Request, Response } from "express";
import { verifyStripeSignature, handleStripeWebhook } from "./stripeWebhook";
import { sendEmailViaGmail, getGmailAuthUrl, exchangeGmailCode } from "./gmailService";
import { updateUser, getUserById } from "./db";

const router = express.Router();

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const body = req.body as string;

  const event = verifyStripeSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");

  if (!event) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe] Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/emails/send
 * Send a single email via Gmail
 */
router.post("/emails/send", express.json(), async (req: Request, res: Response) => {
  const { userId, emailId, toEmail, subject, body } = req.body;

  if (!userId || !emailId || !toEmail || !subject || !body) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await getUserById(userId);
    if (!user || !user.gmailAccessToken || !user.gmailConnected) {
      return res.status(403).json({ error: "Gmail not connected" });
    }

    const result = await sendEmailViaGmail({
      userId,
      emailId,
      toEmail,
      subject,
      body,
      accessToken: user.gmailAccessToken,
    });

    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    console.error("[Email] Send error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/gmail/auth-url
 * Get Gmail OAuth authorization URL
 */
router.get("/gmail/auth-url", (req: Request, res: Response) => {
  try {
    const authUrl = getGmailAuthUrl();
    res.json({ authUrl });
  } catch (error: any) {
    console.error("[Gmail] Auth URL error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/gmail/callback
 * Handle Gmail OAuth callback
 */
router.post("/gmail/callback", express.json(), async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: "Missing userId or code" });
  }

  try {
    const tokens = await exchangeGmailCode(code);
    if (!tokens) {
      return res.status(400).json({ error: "Failed to exchange code" });
    }

    // Update user with Gmail tokens
    await updateUser(userId, {
      gmailAccessToken: tokens.accessToken,
      gmailRefreshToken: tokens.refreshToken,
      gmailConnected: true,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Gmail] Callback error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scheduler/send-due-emails
 * Manually trigger email sending for due invoices
 * (Usually called by pg_cron, but can be called manually for testing)
 */
router.post("/scheduler/send-due-emails", express.json(), async (req: Request, res: Response) => {
  // Verify this is called from an authorized source
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.SCHEDULER_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    // This would call the send_due_emails stored procedure
    // For now, just acknowledge the request
    console.log("[Scheduler] Email sending triggered");
    res.json({ success: true, message: "Email sending initiated" });
  } catch (error: any) {
    console.error("[Scheduler] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
