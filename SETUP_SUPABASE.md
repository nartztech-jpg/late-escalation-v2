# Supabase Setup Guide

This guide walks you through setting up Supabase as your database for LateEscalate.

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com)
2. Sign up or log in
3. Click "New project"
4. Fill in:
   - **Name:** late-escalate
   - **Database password:** Generate strong password and save it
   - **Region:** Choose closest to your users
5. Click "Create new project"
6. Wait for project to be created (2-3 minutes)

## Step 2: Get Connection String

1. Go to "Project Settings" → "Database"
2. Under "Connection string", select "URI"
3. Copy the connection string
4. Add to `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

Replace `[PASSWORD]`, `[HOST]`, and `[PORT]` with your actual values.

## Step 3: Run Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to "SQL Editor"
2. Click "New query"
3. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/20260410000001_create_users.sql`
   - `supabase/migrations/20260410000002_create_invoices.sql`
   - `supabase/migrations/20260410000003_create_emails.sql`
   - `supabase/migrations/20260410000004_create_escalation_sequences.sql`
   - `supabase/migrations/20260410000005_create_email_logs.sql`
   - `supabase/migrations/20260410000006_create_scheduler.sql`
4. Click "Run" for each query
5. Verify tables are created in "Table Editor"

### Option B: Using psql Command Line

```bash
# Install PostgreSQL client if needed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Connect to database
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Run migrations
\i supabase/migrations/20260410000001_create_users.sql
\i supabase/migrations/20260410000002_create_invoices.sql
\i supabase/migrations/20260410000003_create_emails.sql
\i supabase/migrations/20260410000004_create_escalation_sequences.sql
\i supabase/migrations/20260410000005_create_email_logs.sql
\i supabase/migrations/20260410000006_create_scheduler.sql

# Exit
\q
```

## Step 4: Enable pg_cron Extension

1. Go to "SQL Editor"
2. Click "New query"
3. Run this SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule email sending job (daily at 8:00 AM UTC)
SELECT cron.schedule('send-due-emails', '0 8 * * *', 'CALL send_due_emails()');

-- Verify job is scheduled
SELECT * FROM cron.job;
```

## Step 5: Verify Tables

1. Go to "Table Editor"
2. Verify these tables exist:
   - `users`
   - `invoices`
   - `emails`
   - `escalationSequences`
   - `emailLogs`

3. Click on each table to verify columns are correct

## Step 6: Configure Row Level Security (Optional but Recommended)

For production, enable RLS to secure data:

1. Go to "Authentication" → "Policies"
2. For each table, create policies:
   - Users can only see their own data
   - Users can only modify their own data

Example policy for `invoices` table:

```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT
CREATE POLICY "Users can view own invoices"
ON invoices FOR SELECT
USING (auth.uid()::int = userId);

-- Create policy for INSERT
CREATE POLICY "Users can create own invoices"
ON invoices FOR INSERT
WITH CHECK (auth.uid()::int = userId);

-- Create policy for UPDATE
CREATE POLICY "Users can update own invoices"
ON invoices FOR UPDATE
USING (auth.uid()::int = userId);

-- Create policy for DELETE
CREATE POLICY "Users can delete own invoices"
ON invoices FOR DELETE
USING (auth.uid()::int = userId);
```

## Step 7: Set Up Backups

1. Go to "Project Settings" → "Backups"
2. Ensure automatic backups are enabled
3. Configure backup frequency (daily recommended)
4. Test backup restoration process

## Step 8: Monitor Database

1. Go to "Project Settings" → "Database"
2. Check database usage and limits
3. Monitor connection count
4. Review slow query logs if available

## Connection Pooling (Optional)

For better performance with many connections:

1. Go to "Project Settings" → "Database"
2. Enable "Connection Pooling"
3. Set pool mode to "Transaction"
4. Use the pooler connection string instead

## Troubleshooting

### Connection Refused

- Verify DATABASE_URL is correct
- Check database password is correct
- Ensure your IP is whitelisted (if applicable)
- Verify network connectivity

### "Relation does not exist" error

- Ensure all migrations have been run
- Check table names match exactly (case-sensitive)
- Verify migrations ran without errors

### Slow Queries

- Check indexes are created
- Review query performance in logs
- Consider adding indexes to frequently queried columns
- Use EXPLAIN ANALYZE to optimize queries

### Connection Pool Exhausted

- Increase pool size in settings
- Reduce connection timeout
- Close unused connections
- Consider connection pooling mode

## Backup & Recovery

### Manual Backup

1. Go to "Project Settings" → "Backups"
2. Click "Request backup"
3. Wait for backup to complete

### Restore from Backup

1. Go to "Project Settings" → "Backups"
2. Click "Restore" on desired backup
3. Confirm restoration
4. Wait for process to complete

## Scaling

As your application grows:

1. Monitor database usage
2. Upgrade plan if approaching limits
3. Optimize slow queries
4. Add indexes to frequently queried columns
5. Consider read replicas for read-heavy workloads

## Security Best Practices

- [ ] Enable RLS on all tables
- [ ] Use strong database password
- [ ] Enable SSL for connections
- [ ] Regularly review access logs
- [ ] Keep backups secure
- [ ] Monitor for unusual activity
- [ ] Use environment variables for credentials
- [ ] Never commit DATABASE_URL to version control

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
