# LateEscalate TODO

## Database & Schema
- [x] Create invoices table (client_name, client_email, amount, due_date, invoice_reference, tone, status)
- [x] Create emails table (invoice_id, stage, subject, body, scheduled_for, sent_at, status)
- [x] Create escalation_sequences table (invoice_id, activated_at, current_stage, last_sent_at)
- [x] Create email_logs table (email_id, sent_at, delivery_status, error_message)
- [x] Add Stripe fields to users table (stripe_customer_id, stripe_subscription_id, is_subscribed)
- [ ] Write and apply Supabase migrations via webdev_execute_sql
- [ ] Create pg_cron job for daily email scheduler at 8:00 AM UTC

## Authentication & Authorization
- [x] Build login page with Manus OAuth magic link flow
- [x] Build signup page with Manus OAuth registration
- [x] Implement protected routes middleware for authenticated pages
- [x] Add subscription gate logic (free tier: 1 invoice, paid: unlimited)
- [x] Create useAuth hook for accessing current user state
- [ ] Write auth tests with vitest

## Landing Page
- [x] Design and build hero section with headline and subheadline
- [x] Build feature highlights section (3 key features)
- [x] Build pricing section with two tiers (free/paid)
- [x] Build CTA button linking to signup
- [x] Ensure mobile responsiveness
- [ ] Add elegant animations and transitions

## Dashboard
- [x] Build invoice list component with table/card layout
- [x] Implement status badges (pending, overdue, paid, escalating)
- [x] Add quick action buttons per invoice (view, mark paid, cancel)
- [x] Build "New Invoice" button linking to form
- [ ] Implement invoice filtering and sorting
- [x] Add empty state when no invoices
- [ ] Write dashboard tests

## Invoice Management
- [x] Build new invoice form with all required fields
- [x] Add form validation (email format, amount, due date)
- [x] Implement form submission and invoice creation
- [x] Build invoice detail page with timeline view
- [x] Add escalation stage indicator
- [x] Implement "Mark as Paid" action
- [x] Implement "Cancel Sequence" action
- [ ] Add manual email editing capability
- [ ] Write invoice management tests

## AI Email Generation
- [x] Integrate Claude API (claude-haiku-4-5 model)
- [x] Build email generation prompt structure (4 stages)
- [x] Implement streaming response for real-time preview
- [x] Build email preview component showing all 4 stages
- [x] Add email editing interface
- [x] Implement email activation button
- [ ] Write email generation tests

## Email Sending & Scheduling
- [x] Build API endpoint for email generation (/api/emails/generate)
- [x] Build API endpoint for email sending (/api/emails/send)
- [x] Implement Gmail OAuth integration for sending
- [x] Build pg_cron scheduler function (send_due_emails)
- [x] Implement email status tracking (pending, sent, failed)
- [x] Build email log retrieval endpoint
- [ ] Write email sending tests

## Settings Page
- [x] Build account preferences section
- [x] Build notification configuration section
- [x] Add Gmail connection status display
- [x] Add disconnect Gmail option
- [ ] Build profile editing form
- [ ] Write settings tests

## Stripe Billing
- [x] Add Stripe fields to users table
- [x] Build billing page with subscription status
- [ ] Implement Stripe Checkout integration
- [ ] Build subscription webhook handler
- [x] Implement free tier invoice limit enforcement
- [x] Add subscription cancellation option
- [ ] Write billing tests

## API Routes & Backend Logic
- [x] Create /api/invoices/create endpoint (via tRPC)
- [x] Create /api/invoices/list endpoint (via tRPC)
- [x] Create /api/invoices/[id]/get endpoint (via tRPC)
- [x] Create /api/invoices/[id]/update endpoint (via tRPC)
- [x] Create /api/invoices/[id]/mark-paid endpoint (via tRPC)
- [x] Create /api/invoices/[id]/cancel endpoint (via tRPC)
- [x] Create /api/emails/generate endpoint with Claude (via tRPC)
- [ ] Create /api/emails/send endpoint (Gmail integration)
- [x] Create /api/emails/[id]/edit endpoint (via tRPC)
- [ ] Create /api/scheduler/send-due-emails endpoint (pg_cron)
- [ ] Create /api/stripe/webhook endpoint
- [ ] Write comprehensive API tests

## UI Polish & Design System
- [x] Define color palette (elegant, sophisticated)
- [x] Set up Tailwind CSS configuration
- [x] Create reusable UI components (buttons, cards, badges, modals)
- [x] Implement consistent typography and spacing
- [x] Add loading states and skeletons
- [x] Add error handling and toast notifications
- [x] Ensure accessibility (ARIA labels, keyboard navigation)
- [x] Test mobile responsiveness across all pages
- [ ] Add micro-interactions and smooth transitions

## Documentation & Deployment
- [x] Write comprehensive README.md with setup instructions
- [x] Create .env.local.example with all required variables
- [x] Document Supabase setup steps (SETUP_SUPABASE.md)
- [x] Document Google OAuth app configuration (SETUP_GOOGLE_OAUTH.md)
- [x] Document Stripe product and webhook setup (SETUP_STRIPE.md)
- [x] Document Claude API key setup (in README.md)
- [x] Create deployment guide for Vercel (DEPLOYMENT.md)
- [x] Add architecture documentation (ARCHITECTURE.md)

## Testing & Quality Assurance
- [ ] Write unit tests for database queries
- [ ] Write unit tests for API endpoints
- [ ] Write integration tests for email generation flow
- [ ] Write integration tests for subscription gate
- [ ] Test full user flow: signup → create invoice → preview emails → activate
- [ ] Test email scheduling and sending
- [ ] Test "Mark as Paid" functionality
- [ ] Test mobile responsiveness
- [ ] Performance testing and optimization

## Final Delivery
- [ ] Create final checkpoint
- [ ] Verify all features working end-to-end
- [ ] Ensure no console errors or warnings
- [ ] Confirm deployment readiness
- [ ] Deliver project to user with instructions
