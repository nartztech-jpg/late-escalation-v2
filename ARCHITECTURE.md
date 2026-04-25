# LateEscalate Architecture

## System Overview

LateEscalate is a full-stack SaaS application for automated invoice escalation. The system consists of:

1. **Frontend** - React 19 with Tailwind CSS and shadcn/ui
2. **Backend** - Express 4 with tRPC 11
3. **Database** - MySQL (Supabase)
4. **AI** - Claude API for email generation
5. **Email** - Gmail API for sending
6. **Payments** - Stripe for billing
7. **Scheduling** - pg_cron for automated tasks

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React 19)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Landing    │  │   Dashboard  │  │   Settings   │           │
│  │    Page      │  │   (Invoices) │  │   (Billing)  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                   │
│                           │                                      │
│                    tRPC Client (React Query)                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                    /api/trpc/* (HTTP POST)
                            │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Express + tRPC)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              tRPC Routers                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │Invoices  │  │  Emails  │  │ Billing  │  │  Gmail   │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Routes (REST)                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │Stripe        │  │Gmail OAuth   │  │Scheduler     │    │ │
│  │  │Webhook       │  │Callback      │  │Trigger       │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Services                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │Email         │  │Gmail         │  │Stripe        │    │ │
│  │  │Generation    │  │Service       │  │Webhook       │    │ │
│  │  │(Claude)      │  │(OAuth)       │  │Handler       │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Database Layer (Drizzle ORM)                  │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Query Helpers (users, invoices, emails, etc.)      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │ MySQL  │          │ Claude │         │ Gmail  │
    │Database│          │  API   │         │  API   │
    │(Supabase)         │        │         │        │
    └────────┘          └────────┘         └────────┘
        │                   │                   │
        ├───────────────────┼───────────────────┤
        │                   │                   │
        ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │pg_cron │          │ Stripe │         │ Google │
    │Scheduler          │ API    │         │ OAuth  │
    └────────┘          └────────┘         └────────┘
```

## Data Flow

### Invoice Creation Flow

```
User Input (Form)
    ↓
Frontend: NewInvoice.tsx
    ↓
tRPC: invoices.create
    ↓
Backend: routers.ts (invoices.create)
    ↓
Validation & Authorization
    ↓
Database: INSERT into invoices
    ↓
Return: Invoice ID
    ↓
Frontend: Navigate to EmailPreview
```

### Email Generation Flow

```
User clicks "Generate Emails"
    ↓
Frontend: EmailPreview.tsx
    ↓
tRPC: invoices.generateSequence
    ↓
Backend: routers.ts (invoices.generateSequence)
    ↓
Service: emailGeneration.ts
    ↓
Claude API: Generate 4-stage sequence
    ↓
Database: INSERT into emails table
    ↓
Return: Email objects with subject & body
    ↓
Frontend: Display 4 stages for review
```

### Email Sending Flow

```
User clicks "Activate Sequence"
    ↓
Frontend: invoices.activateSequence
    ↓
Backend: Create escalationSequences record
    ↓
Database: INSERT into escalationSequences
    ↓
pg_cron Scheduler (Daily 8 AM UTC)
    ↓
Database: Query due emails (scheduledFor <= TODAY)
    ↓
Service: sendEmailViaGmail for each email
    ↓
Gmail API: Send email
    ↓
Database: Log result in emailLogs
    ↓
Update: emails.status = 'sent'
    ↓
Update: escalationSequences.currentStage
```

### Billing Flow

```
User clicks "Upgrade to Pro"
    ↓
Frontend: Stripe Checkout
    ↓
Stripe: Payment processing
    ↓
Webhook: customer.subscription.created
    ↓
Backend: handleStripeWebhook
    ↓
Database: Update user.stripeCustomerId, isSubscribed
    ↓
Frontend: Redirect to Dashboard
```

## Database Schema

### users
- Stores user accounts and authentication
- Links to Stripe customer and Gmail tokens
- Tracks subscription status

### invoices
- Stores invoice details
- Links to user who created it
- Tracks status (draft, active, paid, cancelled)

### emails
- Stores generated email templates
- 4 records per invoice (one per stage)
- Tracks send status and scheduled date

### escalationSequences
- Tracks progress through escalation
- One record per active invoice
- Updates as emails are sent

### emailLogs
- Audit trail of all email sends
- Tracks delivery status
- Records error messages if failed

## Authentication Flow

```
User visits app
    ↓
Check session cookie
    ↓
If no cookie:
    ↓
Redirect to Login page
    ↓
User clicks "Sign In with Manus"
    ↓
Redirect to Manus OAuth
    ↓
User authorizes
    ↓
Manus redirects to /api/oauth/callback
    ↓
Backend: Exchange code for tokens
    ↓
Database: Create/update user record
    ↓
Set session cookie
    ↓
Redirect to Dashboard
```

## Subscription Gate Logic

```
User tries to create invoice
    ↓
Check: Is user subscribed?
    ↓
If YES:
    ├─→ Allow unlimited invoices
    └─→ Proceed with creation
    
If NO:
    ├─→ Count existing invoices
    ├─→ If count >= 1:
    │   └─→ Show upgrade prompt
    └─→ Else:
        └─→ Allow creation (free tier)
```

## Email Generation Prompt

Claude receives this prompt structure:

```
System: You are an expert at writing professional invoice escalation emails.

User: Generate 4 escalating emails for:
- Client: [Name]
- Amount: [Amount]
- Due Date: [Date]
- Services: [Description]
- Tone: [warm-professional|strictly-professional|direct]

Requirements:
1. Polite Reminder (3 days overdue)
   - Friendly, assumes oversight
   - Include invoice details
   - Suggest payment methods

2. Firm Notice (7 days overdue)
   - Professional, more direct
   - Reference payment terms
   - Mention consequences

3. Final Warning (14 days overdue)
   - Serious tone
   - State consequences clearly
   - Provide deadline

4. Legal Notice (30 days overdue)
   - Formal legal language
   - Reference collection process
   - Mention legal action

Return as JSON with subject and body for each.
```

## Scheduling System

### pg_cron Job

Runs daily at 8:00 AM UTC:

```sql
CALL send_due_emails()
```

### Procedure Logic

1. Query emails where:
   - status = 'pending'
   - scheduledFor <= TODAY
   - user.gmailConnected = true

2. For each email:
   - Send via Gmail API
   - Update status to 'sent'
   - Log result
   - Update escalation stage

3. Handle errors:
   - Log failure with error message
   - Set status to 'failed'
   - Retry next day

## Security Considerations

### Authentication
- Manus OAuth for user auth
- Session cookies with JWT
- Protected procedures check ctx.user

### Authorization
- Users can only access their own data
- Database queries filtered by userId
- tRPC procedures use protectedProcedure

### API Keys
- Environment variables only
- Never committed to version control
- Rotated regularly

### Webhook Verification
- Stripe signatures verified
- Gmail tokens refreshed automatically
- API keys scoped to minimum permissions

### Data Protection
- Passwords hashed (Manus handles)
- Sensitive data encrypted
- HTTPS only in production
- CORS configured

## Performance Optimization

### Database
- Indexes on userId, status, dueDate
- Connection pooling
- Query optimization

### Frontend
- React Query caching
- Optimistic updates
- Code splitting
- Lazy loading

### Backend
- tRPC batching
- Response compression
- Rate limiting
- Caching strategies

## Scalability

### Horizontal Scaling
- Stateless backend
- Database connection pooling
- Load balancing ready

### Vertical Scaling
- Database upgrade path
- CDN for static assets
- Caching layers

### Monitoring
- Error tracking
- Performance metrics
- Database monitoring
- API usage tracking

## Deployment Architecture

### Development
- Local database (or Supabase dev)
- Local email testing
- Stripe test mode

### Staging
- Supabase staging database
- Stripe test mode
- Test email domain

### Production
- Supabase production database
- Stripe live mode
- Production email domain
- CDN for assets
- SSL/TLS certificates
- Monitoring and alerts

## Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React 19 | Modern, component-based, great ecosystem |
| Styling | Tailwind CSS 4 | Utility-first, responsive, performant |
| UI Components | shadcn/ui | Accessible, customizable, production-ready |
| Backend | Express 4 | Lightweight, flexible, mature |
| API | tRPC 11 | End-to-end type safety, no code generation |
| Database | MySQL | Reliable, scalable, good for SaaS |
| ORM | Drizzle | Type-safe, lightweight, great DX |
| Auth | Manus OAuth | Secure, managed, simple integration |
| AI | Claude API | Powerful, reliable, good for text generation |
| Email | Gmail API | Reliable delivery, good reputation |
| Payments | Stripe | Industry standard, great documentation |
| Scheduling | pg_cron | Built-in to PostgreSQL, reliable |

## Future Enhancements

1. **Multiple Email Providers** - SendGrid, Mailgun integration
2. **Advanced Analytics** - Dashboard with metrics
3. **Custom Email Templates** - User-defined templates
4. **Bulk Import** - CSV invoice import
5. **API Access** - REST API for integrations
6. **Webhooks** - Custom webhooks for events
7. **Internationalization** - Multi-language support
8. **Mobile App** - React Native version
9. **Advanced Scheduling** - Custom send times
10. **Machine Learning** - Predictive payment dates
