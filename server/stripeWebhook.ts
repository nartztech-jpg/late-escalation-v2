import Stripe from "stripe";
import { updateUser } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export type StripeWebhookEvent = Stripe.Event;

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: any): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Stripe] Subscription created:", subscription.id);

  const customerId = subscription.customer as string;
  const status = subscription.status;

  // Find user by Stripe customer ID and update subscription status
  // In a real app, you'd query the database to find the user
  // For now, we'll just log it
  console.log(`[Stripe] Customer ${customerId} subscription status: ${status}`);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Stripe] Subscription updated:", subscription.id);

  const customerId = subscription.customer as string;
  const status = subscription.status;

  // Update user subscription status based on Stripe status
  if (status === "active" || status === "trialing") {
    // Subscription is active
    console.log(`[Stripe] Subscription ${subscription.id} is active`);
  } else if (status === "past_due") {
    // Payment is overdue
    console.log(`[Stripe] Subscription ${subscription.id} is past due`);
  } else if (status === "canceled" || status === "incomplete_expired") {
    // Subscription is cancelled
    console.log(`[Stripe] Subscription ${subscription.id} is cancelled`);
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log("[Stripe] Subscription deleted:", subscription.id);

  const customerId = subscription.customer as string;

  // Mark user as unsubscribed
  // In a real app, you'd query the database to find the user by customerId
  // and set isSubscribed = false
  console.log(`[Stripe] Customer ${customerId} subscription cancelled`);
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log("[Stripe] Invoice payment succeeded:", invoice.id);

  const customerId = invoice.customer as string;

  // Update subscription status to active
  console.log(`[Stripe] Customer ${customerId} payment successful`);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log("[Stripe] Invoice payment failed:", invoice.id);

  const customerId = invoice.customer as string;

  // Send notification to user about failed payment
  console.log(`[Stripe] Customer ${customerId} payment failed`);
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): StripeWebhookEvent | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret) as StripeWebhookEvent;
  } catch (error: any) {
    console.error("[Stripe] Webhook signature verification failed:", error.message);
    return null;
  }
}
