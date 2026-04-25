# Stripe Setup Guide

This guide walks you through setting up Stripe for billing in LateEscalate.

## Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up for a new account
3. Complete the onboarding process
4. Verify your email and phone number

## Step 2: Get API Keys

1. Go to "Developers" → "API keys"
2. You'll see two keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
3. For development, use "Test mode" keys
4. For production, use "Live mode" keys
5. Copy both keys to `.env.local`:

```bash
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Step 3: Create Products

### Free Plan Product

1. Go to "Products" → "Add product"
2. Fill in:
   - **Name:** Free Plan
   - **Description:** 1 active invoice, manual sending
   - **Pricing model:** Recurring
3. Click "Add pricing"
4. Select "Monthly"
5. Set price to $0
6. Click "Save product"
7. Copy the Product ID

### Pro Plan Product

1. Go to "Products" → "Add product"
2. Fill in:
   - **Name:** Pro Plan
   - **Description:** Unlimited invoices, AI generation, automatic sending
   - **Pricing model:** Recurring
3. Click "Add pricing"
4. Select "Monthly"
5. Set price to $29
6. Click "Add another price" for annual option
7. Select "Yearly"
8. Set price to $290 (or 10 months equivalent)
9. Click "Save product"
10. Copy the Product IDs for both prices

## Step 4: Configure Webhook

### Create Webhook Endpoint

1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter endpoint URL:
   - Development: `http://localhost:3000/api/stripe/webhook`
   - Production: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Click on the endpoint to view details
7. Copy the "Signing secret" (starts with `whsec_`)
8. Add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 5: Test Webhook Locally

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy the webhook signing secret and add to `.env.local`
4. Test webhook: `stripe trigger customer.subscription.created`

## Step 6: Update for Production

When deploying to production:

1. Switch to "Live mode" in Stripe Dashboard
2. Get your live API keys:
   - `pk_live_...`
   - `sk_live_...`
3. Update `.env.local` (or deployment environment variables)
4. Create new webhook endpoint for production URL
5. Get new webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET`

## Step 7: Test Subscription Flow

1. Start development server: `pnpm dev`
2. Go to Billing page
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Enter any future expiration date
6. Enter any 3-digit CVC
7. Complete payment
8. Verify subscription is active

## Test Cards

Use these cards in test mode:

| Card Number | Use Case |
|---|---|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 0069 | Expired card |
| 4000 0000 0000 9995 | Insufficient funds |
| 5555 5555 5555 4444 | Mastercard |
| 3782 822463 10005 | American Express |

## Webhook Events

LateEscalate handles these webhook events:

### customer.subscription.created
- User just subscribed
- Update user's `isSubscribed` flag to true

### customer.subscription.updated
- Subscription status changed
- Handle status: active, trialing, past_due, canceled, incomplete_expired

### customer.subscription.deleted
- User cancelled subscription
- Update user's `isSubscribed` flag to false

### invoice.payment_succeeded
- Payment was successful
- Send confirmation email

### invoice.payment_failed
- Payment failed
- Send retry notification

## Billing Portal

To let users manage their subscriptions:

1. Go to "Settings" → "Billing Portal"
2. Enable "Customer Portal"
3. Configure settings:
   - Allow subscription updates
   - Allow cancellation
   - Set cancellation behavior
4. Copy the portal link

## Troubleshooting

### "Invalid API key" error

- Verify API key is correct
- Ensure you're using test key in development
- Check that key hasn't expired

### Webhook not triggering

- Verify webhook endpoint URL is correct
- Check webhook signing secret matches
- Ensure endpoint is publicly accessible
- Test with Stripe CLI: `stripe trigger event-name`

### Payment fails in test mode

- Use test card numbers from table above
- Ensure card number is exactly correct
- Check expiration date is in future
- Verify CVC is 3 digits (4 for Amex)

### Subscription not updating

- Check webhook is configured correctly
- Verify webhook signing secret is correct
- Check application logs for errors
- Test webhook manually in Stripe Dashboard

## Security Notes

- Never commit API keys to version control
- Use environment variables for all keys
- Rotate API keys regularly
- Monitor webhook activity
- Enable 2FA on Stripe account
- Use IP whitelisting if available

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Events](https://stripe.com/docs/api/events)
