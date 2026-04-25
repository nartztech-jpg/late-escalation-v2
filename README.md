# LateEscalate

An elegant, AI-powered invoice escalation and management SaaS application. Automatically send personalized escalating emails to clients with overdue invoices, from polite reminders to formal legal notices.

**Live Demo:** [https://lateescalate.manus.space](https://lateescalate.manus.space)

## Features

- 🤖 **AI-Powered Email Generation** - Claude generates 4-stage escalation sequences tailored to each invoice
- 📧 **Automated Email Sending** - Gmail integration with daily scheduler for automatic sends
- 💳 **Stripe Billing** - Free tier (1 invoice) and paid tier (unlimited + priority sending)
- 🔐 **Manus OAuth** - Secure authentication with Manus
- 📊 **Invoice Dashboard** - View all invoices with status badges (pending, overdue, paid, escalating)
- ⏱️ **Smart Scheduling** - pg_cron scheduler sends emails at configurable intervals
- 🎨 **Elegant UI** - Production-ready design with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Express 4, tRPC 11, Drizzle ORM
- **Database:** MySQL (Supabase)
- **Auth:** Manus OAuth
- **AI:** Claude API (claude-haiku-4-5)
- **Email:** Gmail API
- **Payments:** Stripe
- **Scheduling:** pg_cron (MySQL)

## Quick Start

### 1. Prerequisites

- Node.js 22+
- pnpm
- Supabase account (or MySQL database)
- Stripe account
- Google OAuth credentials
- Claude API key
- Manus OAuth credentials

### 2. Clone and Install

```bash
git clone https://github.com/yourusername/late-escalate.git
cd late-escalate
pnpm install
```

### 3. Database Setup (Supabase)

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. In the SQL Editor, run the migrations from `/supabase/migrations/` in order:
   - `20260410000001_create_users.sql`
   - `20260410000002_create_invoices.sql`
   - `20260410000003_create_emails.sql`
   - `20260410000004_create_escalation_sequences.sql`
   - `20260410000005_create_email_logs.sql`
   - `20260410000006_create_scheduler.sql`

3. After running migrations, enable pg_cron:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   SELECT cron.schedule('send-due-emails', '0 8 * * *', 'CALL send_due_emails()');
   ```

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/oauth/callback` (development)
   - `https://yourdomain.com/api/oauth/callback` (production)
6. Copy Client ID and Client Secret to `.env.local`

### 6. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create two products:
   - **Free Plan** (1 invoice limit)
   - **Pro Plan** (unlimited invoices)
3. Create prices for each product (monthly or annual)
4. Get your API keys and add to `.env.local`
5. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 7. Claude API Setup

1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env.local` as `ANTHROPIC_API_KEY`

### 8. Manus OAuth Setup

1. Your Manus OAuth credentials are already configured in the system
2. Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` in `.env.local`

### 9. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy

```bash
vercel
```

### Deploy to Railway

1. Connect GitHub repository to Railway
2. Add environment variables
3. Railway will auto-deploy on push

### Deploy to Render

1. Create new Web Service on Render
2. Connect GitHub repository
3. Add environment variables
4. Deploy

## Project Structure

```
late-escalate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client setup
│   │   └── App.tsx        # Main router
│   └── index.html
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   ├── emailGeneration.ts # Claude email generation
│   ├── gmailService.ts    # Gmail OAuth & sending
│   ├── stripeWebhook.ts   # Stripe webhook handler
│   ├── apiRoutes.ts       # REST API routes
│   └── _core/             # Framework internals
├── drizzle/               # Database schema & migrations
├── supabase/migrations/   # SQL migration files
├── package.json
└── README.md
```

## Database Schema

### users
- `id` - Primary key
- `openId` - Manus OAuth identifier
- `email` - User email
- `gmailAccessToken` - Gmail OAuth token
- `gmailRefreshToken` - Gmail refresh token
- `gmailConnected` - Gmail connection status
- `stripeCustomerId` - Stripe customer ID
- `stripeSubscriptionId` - Stripe subscription ID
- `isSubscribed` - Subscription status

### invoices
- `id` - Primary key
- `userId` - Foreign key to users
- `clientName` - Client name
- `clientEmail` - Client email
- `amount` - Invoice amount
- `dueDate` - Due date
- `status` - draft | active | paid | cancelled
- `tone` - Email tone: warm-professional | strictly-professional | direct

### emails
- `id` - Primary key
- `invoiceId` - Foreign key to invoices
- `stage` - 1=polite reminder, 2=firm notice, 3=final warning, 4=legal notice
- `subject` - Email subject
- `body` - Email body
- `scheduledFor` - When to send
- `status` - pending | sent | cancelled

### escalationSequences
- `id` - Primary key
- `invoiceId` - Foreign key to invoices
- `currentStage` - Current escalation stage (0-4)
- `lastSentAt` - When last email was sent

### emailLogs
- `id` - Primary key
- `emailId` - Foreign key to emails
- `deliveryStatus` - success | failed | bounced
- `errorMessage` - Error details if failed

## API Endpoints

### tRPC Procedures

All tRPC procedures are available at `/api/trpc`:

**Invoices:**
- `invoices.list` - Get user's invoices
- `invoices.create` - Create new invoice
- `invoices.get` - Get invoice details
- `invoices.update` - Update invoice
- `invoices.markPaid` - Mark as paid
- `invoices.cancel` - Cancel invoice
- `invoices.generateSequence` - Generate email sequence with Claude
- `invoices.activateSequence` - Activate escalation

**Emails:**
- `emails.getByInvoice` - Get emails for invoice
- `emails.update` - Edit email subject/body

**Billing:**
- `billing.getStatus` - Get subscription status
- `billing.setStripeCustomer` - Set Stripe customer
- `billing.cancelSubscription` - Cancel subscription

**Gmail:**
- `gmail.getStatus` - Check Gmail connection
- `gmail.disconnect` - Disconnect Gmail

### REST Endpoints

- `POST /api/stripe/webhook` - Stripe webhook
- `POST /api/emails/send` - Send email via Gmail
- `GET /api/gmail/auth-url` - Get Gmail OAuth URL
- `POST /api/gmail/callback` - Handle Gmail OAuth callback
- `POST /api/scheduler/send-due-emails` - Trigger email sending

## Email Escalation Flow

1. **User creates invoice** with client email, amount, due date
2. **User generates email sequence** - Claude creates 4 personalized emails
3. **User reviews and activates** - Emails are scheduled for sending
4. **pg_cron scheduler** - Daily at 8 AM UTC, sends due emails
5. **Emails sent via Gmail** - Each email logged with delivery status
6. **Escalation progresses** - Moves from polite reminder → legal notice
7. **User marks as paid** - Cancels remaining emails

## Email Stages

1. **Polite Reminder** (3 days after due date)
   - Professional, courteous tone
   - Assumes payment may have been overlooked

2. **Firm Notice** (7 days after due date)
   - More direct language
   - References original invoice and terms

3. **Final Warning** (14 days after due date)
   - Serious tone
   - Mentions potential consequences

4. **Legal Notice** (30 days after due date)
   - Formal legal language
   - References collection and legal action

## Pricing

**Free Plan**
- 1 active invoice
- Basic email templates
- Manual sending only

**Pro Plan** ($29/month or $290/year)
- Unlimited invoices
- AI-generated personalized emails
- Automatic daily scheduling
- Priority support
- Custom email tone selection

## Testing

Run tests with:

```bash
pnpm test
```

Test files are located in `server/*.test.ts`

## Troubleshooting

### Gmail Connection Issues
- Verify Google OAuth credentials are correct
- Check that Gmail API is enabled in Google Cloud Console
- Ensure redirect URI matches exactly

### Email Not Sending
- Check Gmail connection status in Settings
- Verify email is scheduled for today or earlier
- Check email logs for error messages
- Ensure Claude API key is valid

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure all migrations have been run
- Check network connectivity

## Support

For issues and feature requests, please open an issue on GitHub.

## License

MIT

## Author

Built with ❤️ by the LateEscalate team
